import { Injectable } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version';
import { File } from '@ionic-native/file';
import { SQLite } from '@ionic-native/sqlite';
import { DataType, DEFAULT_FORMATS, executePromiseChain, extractType, isAndroid, isArray, isIos, noop, toPromise } from '@wm/core';
import { DeviceFileService, DeviceService } from '@wm/mobile/core';
import { SecurityService } from '@wm/security';
import { formatDate } from '@wm/variables';
import { LocalKeyValueService } from './local-key-value.service';
import { LocalDBStore } from '../models/local-db-store';
import { escapeName } from '../utils/utils';
import { ColumnInfo, DBInfo, PullType } from '../models/config';
import * as i0 from "@angular/core";
import * as i1 from "@ionic-native/app-version";
import * as i2 from "@wm/mobile/core";
import * as i3 from "@ionic-native/file";
import * as i4 from "./local-key-value.service";
import * as i5 from "@wm/security";
import * as i6 from "@ionic-native/sqlite";
const NEXT_ID_COUNT = 'localDBStore.nextIdCount';
const META_LOCATION = 'www/metadata/app';
const OFFLINE_WAVEMAKER_DATABASE_SCHEMA = {
    name: 'wavemaker',
    version: 1,
    isInternal: true,
    tables: [
        {
            name: 'key_value',
            entityName: 'key-value',
            columns: [{
                    fieldName: 'id',
                    name: 'id',
                    generatorType: 'databaseIdentity',
                    sqlType: 'number',
                    primaryKey: true
                }, {
                    fieldName: 'key',
                    name: 'key'
                }, {
                    name: 'value',
                    fieldName: 'value'
                }]
        },
        {
            name: 'offlineChangeLog',
            entityName: 'offlineChangeLog',
            columns: [{
                    fieldName: 'id',
                    name: 'id',
                    generatorType: 'databaseIdentity',
                    sqlType: 'number',
                    primaryKey: true
                }, {
                    name: 'service',
                    fieldName: 'service'
                }, {
                    name: 'operation',
                    fieldName: 'operation'
                }, {
                    name: 'params',
                    fieldName: 'params'
                }, {
                    name: 'timestamp',
                    fieldName: 'timestamp'
                }, {
                    name: 'hasError',
                    fieldName: 'hasError'
                }, {
                    name: 'errorMessage',
                    fieldName: 'errorMessage'
                }]
        }
    ]
};
export class LocalDBManagementService {
    constructor(appVersion, deviceService, deviceFileService, file, localKeyValueService, securityService, sqlite) {
        this.appVersion = appVersion;
        this.deviceService = deviceService;
        this.deviceFileService = deviceFileService;
        this.file = file;
        this.localKeyValueService = localKeyValueService;
        this.securityService = securityService;
        this.sqlite = sqlite;
        this.callbacks = [];
        this._logSql = false;
        this.nextId = 100000000000;
        this.systemProperties = {
            'USER_ID': {
                'name': 'USER_ID',
                'value': () => this.securityService.getLoggedInUser().then(userInfo => userInfo.userId)
            },
            'USER_NAME': {
                'name': 'USER_NAME',
                'value': () => this.securityService.getLoggedInUser().then(userInfo => userInfo.userName)
            },
            'DATE_TIME': {
                'name': 'DATE_TIME',
                'value': () => moment().format('YYYY-MM-DDThh:mm:ss')
            },
            'DATE': {
                'name': 'CURRENT_DATE',
                'value': () => moment().format('YYYY-MM-DD')
            },
            'TIME': {
                'name': 'TIME',
                'value': () => moment().format('hh:mm:ss')
            }
        };
    }
    /**
     * Closes all databases.
     *
     * @returns {object} a promise.
     */
    close() {
        return new Promise((resolve, reject) => {
            // Before closing databases, give some time for the pending transactions (if any).
            setTimeout(() => {
                const closePromises = _.map(_.values(this.databases), db => db.sqliteObject.close());
                Promise.all(closePromises).then(resolve, reject);
            }, 1000);
        });
    }
    nextIdCount() {
        this.nextId = this.nextId + 1;
        this.localKeyValueService.put(NEXT_ID_COUNT, this.nextId);
        return this.nextId;
    }
    /**
     * Executes a named query.
     *
     * @param {string} dbName name of database on which the named query has to be run
     * @param {string} queryName name of the query to execute
     * @param {object} params parameters required for query.
     * @returns {object} a promise.
     */
    executeNamedQuery(dbName, queryName, params) {
        let queryData, paramPromises;
        if (!this.databases[dbName] || !this.databases[dbName].queries[queryName]) {
            return Promise.reject(`Query by name ' ${queryName} ' Not Found`);
        }
        queryData = this.databases[dbName].queries[queryName];
        paramPromises = _.chain(queryData.params)
            .filter(p => p.variableType !== 'PROMPT')
            .forEach(p => {
            const paramValue = this.systemProperties[p.variableType].value(p.name, params);
            return toPromise(paramValue).then(v => params[p.name] = v);
        }).value();
        return Promise.all(paramPromises).then(() => {
            params = _.map(queryData.params, p => {
                // Sqlite will accept DateTime value as below format.
                if (typeof params[p.name] !== 'string'
                    && (p.type === DataType.DATETIME || p.type === DataType.LOCALDATETIME)) {
                    return formatDate(params[p.name], p.type);
                }
                // sqlite accepts the bool val as 1,0 hence convert the boolean value to number
                if (p.type === DataType.BOOLEAN) {
                    return this.convertBoolToInt(params[p.name]);
                }
                return params[p.name];
            });
            return this.executeSQLQuery(dbName, queryData.query, params)
                .then(result => {
                let firstRow, needTransform;
                if (!_.isEmpty(result.rows)) {
                    firstRow = result.rows[0];
                    needTransform = _.find(queryData.response.properties, p => !firstRow.hasOwnProperty(p.fieldName));
                    if (!_.isUndefined(needTransform)) {
                        result.rows = _.map(result.rows, row => {
                            const transformedRow = {}, rowWithUpperKeys = {};
                            // This is to make search for data as case-insensitive
                            _.forEach(row, (v, k) => rowWithUpperKeys[k.toUpperCase()] = v);
                            _.forEach(queryData.response.properties, p => {
                                // format the value depending on the typeRef specified in properties.
                                const propType = extractType(p.fieldType.typeRef);
                                const formatValue = DEFAULT_FORMATS[_.toUpper(propType)];
                                const fieldVal = row[p.name];
                                if (fieldVal && typeof fieldVal !== 'string'
                                    && (propType === DataType.DATETIME || propType === DataType.LOCALDATETIME || propType === DataType.DATE)) {
                                    if (moment(fieldVal).isValid()) {
                                        row[p.name] = formatDate(fieldVal, propType);
                                    }
                                    else if (moment(fieldVal, 'HH:mm').isValid()) {
                                        // if the value is in HH:mm:ss format, it returns a wrong date. So append the date to the given value to get date
                                        row[p.name] = moment().format('YYYY-MM-DD') + 'T' + fieldVal;
                                    }
                                }
                                if (propType === DataType.BOOLEAN) {
                                    row[p.name] = this.convertIntToBool(fieldVal);
                                }
                                rowWithUpperKeys[p.nameInUpperCase] = row[p.name];
                                transformedRow[p.name] = row[p.name];
                                transformedRow[p.fieldName] = row[p.fieldName] || rowWithUpperKeys[p.nameInUpperCase];
                            });
                            return transformedRow;
                        });
                    }
                }
                return result;
            });
        });
    }
    /**
     * This function will export the databases in a zip format.
     *
     * @returns {object} a promise that is resolved when zip is created.
     */
    exportDB() {
        return new Promise((resolve, reject) => {
            const folderToExport = 'offline_temp_' + _.now(), folderToExportFullPath = cordova.file.cacheDirectory + folderToExport + '/', zipFileName = '_offline_data.zip', metaInfo = {
                app: null,
                OS: '',
                createdOn: 0
            };
            let zipDirectory;
            if (isIos()) {
                // In IOS, save zip to documents directory so that user can export the file from IOS devices using iTUNES.
                zipDirectory = cordova.file.documentsDirectory;
            }
            else {
                // In Android, save zip to download directory.
                zipDirectory = cordova.file.externalRootDirectory + 'Download/';
            }
            // Create a temporary folder to copy all the content to export
            this.file.createDir(cordova.file.cacheDirectory, folderToExport, false)
                .then(() => {
                // Copy databases to temporary folder for export
                return this.file.copyDir(this.dbInstallParentDirectory, this.dbInstallDirectoryName, folderToExportFullPath, 'databases')
                    .then(() => {
                    // Prepare meta info to identify the zip and other info
                    return this.getAppInfo();
                }).then(appInfo => {
                    metaInfo.app = appInfo;
                    if (isIos()) {
                        metaInfo.OS = 'IOS';
                    }
                    else if (isAndroid()) {
                        metaInfo.OS = 'ANDROID';
                    }
                    metaInfo.createdOn = _.now();
                    return metaInfo;
                }).then(() => executePromiseChain(this.getCallbacksFor('preExport'), [folderToExportFullPath, metaInfo]))
                    .then(() => {
                    // Write meta data to META.json
                    return this.file.writeFile(folderToExportFullPath, 'META.json', JSON.stringify(metaInfo));
                });
            }).then(() => {
                // Prepare name to use for the zip.
                let appName = metaInfo.app.name;
                appName = appName.replace(/\s+/g, '_');
                return this.deviceFileService.newFileName(zipDirectory, appName + zipFileName)
                    .then(fileName => {
                    // Zip the temporary folder for export
                    return new Promise((rs, re) => {
                        Zeep.zip({
                            from: folderToExportFullPath,
                            to: zipDirectory + fileName
                        }, () => rs(zipDirectory + fileName), re);
                    });
                });
            }).then(resolve, reject)
                .catch(noop).then(() => {
                // Remove temporary folder for export
                return this.deviceFileService.removeDir(cordova.file.cacheDirectory + folderToExport);
            });
        });
    }
    /**
     *  returns store bound to the dataModelName and entityName.
     *
     * @param dataModelName
     * @param entityName
     * @returns {*}
     */
    getStore(dataModelName, entityName) {
        return new Promise((resolve, reject) => {
            if (this.databases[dataModelName]) {
                resolve(this.databases[dataModelName].stores[entityName]);
            }
            reject(`store with name'${entityName}' in datamodel '${dataModelName}' is not found`);
        });
    }
    /**
     * This function will replace the databases with the files provided in zip. If import gets failed,
     * then app reverts back to use old databases.
     *
     * @param {string} zipPath location of the zip file.
     * @param {boolean} revertIfFails If true, then a backup is created and when import fails, backup is reverted back.
     * @returns {object} a promise that is resolved when zip is created.
     */
    importDB(zipPath, revertIfFails) {
        return new Promise((resolve, reject) => {
            const importFolder = 'offline_temp_' + _.now(), importFolderFullPath = cordova.file.cacheDirectory + importFolder + '/';
            let zipMeta;
            // Create a temporary folder to unzip the contents of the zip.
            this.file.createDir(cordova.file.cacheDirectory, importFolder, false)
                .then(() => {
                return new Promise((rs, re) => {
                    // Unzip to temporary location
                    Zeep.unzip({
                        from: zipPath,
                        to: importFolderFullPath
                    }, rs, re);
                });
            }).then(() => {
                /*
                 * read meta data and allow import only package name of the app from which this zip is created
                 * and the package name of this app are same.
                 */
                return this.file.readAsText(importFolderFullPath, 'META.json')
                    .then(text => {
                    zipMeta = JSON.parse(text);
                    return this.getAppInfo();
                }).then(appInfo => {
                    if (!zipMeta.app) {
                        return Promise.reject('meta information is not found in zip');
                    }
                    if (zipMeta.app.packageName !== appInfo.packageName) {
                        return Promise.reject('database zip of app with same package name can only be imported');
                    }
                });
            }).then(() => {
                let backupZip;
                return this.close()
                    .then(() => {
                    if (revertIfFails) {
                        // create backup
                        return this.exportDB()
                            .then(path => backupZip = path);
                    }
                }).then(() => {
                    // delete existing databases
                    return this.deviceFileService.removeDir(this.dbInstallDirectory);
                }).then(() => {
                    // copy imported databases
                    return this.file.copyDir(importFolderFullPath, 'databases', this.dbInstallParentDirectory, this.dbInstallDirectoryName);
                }).then(() => {
                    // reload databases
                    this.databases = null;
                    return this.loadDatabases();
                }).then(() => executePromiseChain(this.getCallbacksFor('postImport'), [importFolderFullPath, zipMeta]))
                    .then(() => {
                    if (backupZip) {
                        return this.deviceFileService.removeFile(backupZip);
                    }
                }, (reason) => {
                    if (backupZip) {
                        return this.importDB(backupZip, false)
                            .then(() => {
                            this.deviceFileService.removeFile(backupZip);
                            return Promise.reject(reason);
                        });
                    }
                    return Promise.reject(reason);
                });
            }).then(resolve, reject)
                .catch(noop)
                .then(() => {
                return this.deviceFileService.removeDir(cordova.file.cacheDirectory + importFolder);
            });
        });
    }
    /**
     * @param {string} dataModelName Name of the data model
     * @param {string} entityName Name of the entity
     * @param {string} operation Name of the operation (READ, INSERT, UPDATE, DELETE)
     * @returns {boolean} returns true, if the given operation can be performed as per configuration.
     */
    isOperationAllowed(dataModelName, entityName, operation) {
        return this.getStore(dataModelName, entityName).then(store => {
            if (!store) {
                return false;
            }
            if (operation === 'READ') {
                return store.entitySchema.pushConfig.readEnabled;
            }
            if (operation === 'INSERT') {
                return store.entitySchema.pushConfig.insertEnabled;
            }
            if (operation === 'UPDATE') {
                return store.entitySchema.pushConfig.updateEnabled;
            }
            if (operation === 'DELETE') {
                return store.entitySchema.pushConfig.deleteEnabled;
            }
            return false;
        }).catch(() => {
            return false;
        });
    }
    loadDatabases() {
        let newDatabasesCreated = false;
        if (this.databases) {
            return Promise.resolve(this.databases);
        }
        else {
            if (isIos()) {
                this.dbInstallDirectoryName = 'LocalDatabase';
                this.dbInstallParentDirectory = cordova.file.applicationStorageDirectory + 'Library/';
            }
            else {
                this.dbInstallDirectoryName = 'databases';
                this.dbInstallParentDirectory = cordova.file.applicationStorageDirectory;
            }
            this.dbInstallDirectory = this.dbInstallParentDirectory + this.dbInstallDirectoryName;
            this.databases = new Map();
            return this.setUpDatabases()
                .then(flag => newDatabasesCreated = flag)
                .then(() => this.loadDBSchemas())
                .then(metadata => this.loadNamedQueries(metadata))
                .then(metadata => this.loadOfflineConfig(metadata))
                .then(metadata => {
                return Promise.all(_.map(metadata, dbMetadata => {
                    return this.openDatabase(dbMetadata)
                        .then(database => {
                        this.databases[dbMetadata.schema.name] = database;
                    });
                }));
            }).then(() => {
                return this.getStore('wavemaker', 'key-value').then(store => {
                    this.localKeyValueService.init(store);
                    return this.localKeyValueService.get(NEXT_ID_COUNT).then(val => {
                        this.nextId = val || this.nextId;
                    });
                });
            }).then(() => {
                if (newDatabasesCreated) {
                    return this.normalizeData()
                        .then(() => this.disableForeignKeys())
                        .then(() => this.deviceService.getAppBuildTime())
                        .then(dbSeedCreationTime => {
                        return executePromiseChain(_.map(this.callbacks, 'onDbCreate'), [{
                                'databases': this.databases,
                                'dbCreatedOn': _.now(),
                                'dbSeedCreatedOn': dbSeedCreationTime
                            }]);
                    }).then(() => this.databases);
                }
                else {
                    return this.databases;
                }
            });
        }
    }
    /**
     * using this function one can listen events such as onDbCreate, 'preExport' and 'postImport'.
     *
     * @param {object} listener an object with functions mapped to event names.
     */
    registerCallback(listener) {
        this.callbacks.push(listener);
    }
    setLogSQl(flag) {
        this._logSql = flag;
    }
    /**
     * Deletes any existing databases (except wavemaker db) and copies the databases that are packaged with the app.
     *
     * @returns {*}
     */
    cleanAndCopyDatabases() {
        const dbSeedFolder = cordova.file.applicationDirectory + META_LOCATION;
        return this.file.createDir(this.dbInstallParentDirectory, this.dbInstallDirectoryName, false)
            .catch(noop)
            .then(() => this.deviceFileService.listFiles(this.dbInstallDirectory, /.+\.db$/))
            .then(files => {
            if (files && files.length > 0) {
                return Promise.all(files.map(f => {
                    if (f['name'] !== 'wavemaker.db') {
                        return this.file.removeFile(this.dbInstallDirectory, f['name']);
                    }
                }));
            }
        })
            .then(() => this.deviceFileService.listFiles(dbSeedFolder, /.+\.db$/))
            .then(files => {
            if (files && files.length > 0) {
                return this.file.createDir(this.dbInstallParentDirectory, this.dbInstallDirectoryName, false)
                    .catch(noop)
                    .then(() => Promise.all(files.map(f => this.file.copyFile(dbSeedFolder, f['name'], this.dbInstallDirectory, f['name']))));
            }
        });
    }
    // Picks essential details from the given schema.
    compactEntitySchema(schema, entity, transformedSchemas) {
        const reqEntity = transformedSchemas[entity['entityName']];
        reqEntity.entityName = entity['entityName'];
        reqEntity.name = entity['name'];
        reqEntity.columns = [];
        entity.columns.forEach(col => {
            let defaultValue = col.columnValue ? col.columnValue.defaultValue : '';
            const type = col.sqlType;
            if (type === 'number' && !col.primaryKey) {
                defaultValue = _.isEmpty(defaultValue) ? null : _.parseInt(defaultValue);
            }
            else if (type === 'boolean') {
                defaultValue = _.isEmpty(defaultValue) ? null : (defaultValue === 'true' ? 1 : 0);
            }
            else {
                defaultValue = _.isEmpty(defaultValue) ? null : defaultValue;
            }
            reqEntity.columns.push({
                name: col['name'],
                fieldName: col['fieldName'],
                generatorType: col['generatorType'],
                sqlType: col['sqlType'],
                primaryKey: col['primaryKey'],
                defaultValue: defaultValue
            });
        });
        _.forEach(entity.relations, r => {
            let targetEntitySchema, targetEntity, col, sourceColumn, mapping;
            if (r.cardinality === 'ManyToOne' || r.cardinality === 'OneToOne') {
                targetEntity = _.find(schema.tables, t => t.name === r.targetTable);
                mapping = r.mappings[0];
                if (targetEntity) {
                    targetEntity = targetEntity.entityName;
                    sourceColumn = mapping.sourceColumn;
                    col = reqEntity.columns.find(column => column.name === sourceColumn);
                    targetEntitySchema = schema.tables.find(table => table.name === r.targetTable);
                    const foreignRelation = {
                        sourceFieldName: r.fieldName,
                        targetEntity: targetEntity,
                        targetTable: r.targetTable,
                        targetColumn: mapping.targetColumn,
                        targetPath: '',
                        dataMapper: [],
                        targetFieldName: targetEntitySchema.columns.find(column => column.name === mapping.targetColumn).fieldName
                    };
                    foreignRelation.targetPath = foreignRelation.sourceFieldName + '.' + foreignRelation.targetFieldName;
                    foreignRelation.dataMapper = _.chain(targetEntitySchema.columns)
                        .keyBy(childCol => foreignRelation.sourceFieldName + '.' + childCol.fieldName)
                        .mapValues(childCol => new ColumnInfo(childCol.name, childCol.fieldName)).value();
                    col.foreignRelations = col.foreignRelations || [];
                    col.foreignRelations.push(foreignRelation);
                }
            }
        });
        return reqEntity;
    }
    // Loads necessary details of queries
    compactQueries(queriesByDB) {
        const queries = new Map();
        _.forEach(queriesByDB.queries, queryData => {
            let query, params;
            if (queryData.nativeSql && queryData.type === 'SELECT') {
                query = _.isEmpty(queryData.offlineQueryString) ? queryData.queryString : queryData.offlineQueryString;
                params = _.map(this.extractQueryParams(query), p => {
                    const paramObj = _.find(queryData.parameters, { 'name': p });
                    return {
                        name: paramObj.name,
                        type: paramObj.type,
                        variableType: paramObj.variableType
                    };
                });
                params.forEach(p => query = _.replace(query, ':' + p.name, '?'));
                queries[queryData.name] = {
                    name: queryData.name,
                    query: query,
                    params: params,
                    response: {
                        properties: _.map(queryData.response.properties, p => {
                            p.nameInUpperCase = p.name.toUpperCase();
                            return p;
                        })
                    }
                };
            }
        });
        return queries;
    }
    // Loads necessary details of remote schema
    compactSchema(schema) {
        const dbInfo = new DBInfo();
        const transformedSchemas = new Map();
        schema.tables.forEach(entitySchema => {
            transformedSchemas[entitySchema.entityName] = {};
        });
        schema.tables.forEach(entitySchema => {
            this.compactEntitySchema(schema, entitySchema, transformedSchemas);
        });
        dbInfo.schema.name = schema.name;
        dbInfo.schema.isInternal = schema.isInternal;
        dbInfo.schema.entities = transformedSchemas;
        return dbInfo;
    }
    convertBoolToInt(bool) {
        return _.toString(bool) === 'true' ? 1 : 0;
    }
    convertIntToBool(int) {
        return int ? true : false;
    }
    /**
     * Turns off foreign keys
     * @returns {*}
     */
    disableForeignKeys() {
        return Promise.all(_.map(this.databases, db => this.executeSQLQuery(db.schema.name, 'PRAGMA foreign_keys = OFF')));
    }
    /**
     * Executes SQL query;
     *
     * @param dbName
     * @param sql
     * @param params
     * @returns {*}
     */
    executeSQLQuery(dbName, sql, params, logOutput) {
        const db = this.databases[dbName];
        if (db) {
            return db.sqliteObject.executeSql(sql, params, logOutput)
                .then(result => {
                const data = [], rows = result.rows;
                for (let i = 0; i < rows.length; i++) {
                    data.push(rows.item(i));
                }
                return {
                    'rowsAffected': result.rowsAffected,
                    'rows': data
                };
            });
        }
        return Promise.reject(`No Database with name ${dbName} found`);
    }
    // get the params of the query or procedure.
    extractQueryParams(query) {
        let params, aliasParams;
        aliasParams = query.match(/[^"'\w\\]:\s*\w+\s*/g) || [];
        if (aliasParams.length) {
            params = aliasParams.map(x => (/[=|\W]/g.test(x)) ? x.replace(/\W/g, '').trim() : x.trim());
        }
        else {
            params = null;
        }
        return params;
    }
    /**
     * Returns a promise that is resolved with application info such as packageName, appName, versionNumber, versionCode.
     * @returns {*}
     */
    getAppInfo() {
        const appInfo = {
            name: '',
            packageName: '',
            versionNumber: '',
            versionCode: null
        };
        return this.appVersion.getPackageName()
            .then(packageName => {
            appInfo.packageName = packageName;
            return this.appVersion.getAppName();
        }).then(appName => {
            appInfo.name = appName;
            return this.appVersion.getVersionNumber();
        }).then(versionNumber => {
            appInfo.versionNumber = versionNumber;
            return this.appVersion.getVersionCode();
        }).then(versionCode => {
            appInfo.versionCode = versionCode;
            return appInfo;
        });
    }
    getCallbacksFor(event) {
        return this.callbacks.map(c => {
            if (c[event]) {
                return c[event].bind(c);
            }
            return null;
        });
    }
    /**
     * Searches for the files with given regex in 'www/metadata/app'and returns an array that contains the JSON
     * content present in each file.
     *
     * @param {string} fileNameRegex regex pattern to search for files.
     * @returns {*} A promise that is resolved with an array
     */
    getMetaInfo(fileNameRegex) {
        const folder = cordova.file.applicationDirectory + META_LOCATION + '/';
        return this.deviceFileService.listFiles(folder, fileNameRegex)
            .then(files => Promise.all(_.map(files, f => {
            return new Promise((resolve, reject) => {
                // Cordova File reader has buffer issues with large files.
                // so, using ajax to retrieve local json
                $.getJSON(folder + f['name'], data => resolve(data));
            });
        })));
    }
    /**
     * Returns true, if the given entity's data is bundled along with application installer.
     * @param dataModelName name of the data model
     * @param entityName name of the entity
     * @returns {Promise<any>}
     */
    isBundled(dataModelName, entityName) {
        return this.getStore(dataModelName, entityName).then(store => {
            return store.entitySchema.pullConfig.pullType === PullType.BUNDLED;
        });
    }
    /**
     * Loads local database schemas from *_data_model.json.
     *
     * @returns {*} A promise that is resolved with metadata.
     */
    loadDBSchemas() {
        return this.getMetaInfo(/.+_dataModel\.json$/)
            .then((schemas) => {
            const metadata = new Map();
            schemas = isArray(schemas) ? schemas : [schemas];
            schemas.push(OFFLINE_WAVEMAKER_DATABASE_SCHEMA);
            schemas.map(s => this.compactSchema(s))
                .forEach(s => {
                metadata[s.schema.name] = s;
            });
            return metadata;
        });
    }
    /**
     * Load named queries from *_query.json.
     *
     * @param {*} metadata
     * @returns {*} A promise that is resolved with metadata
     */
    loadNamedQueries(metadata) {
        return this.getMetaInfo(/.+_query\.json$/)
            .then((queriesByDBs) => {
            queriesByDBs = _.isArray(queriesByDBs) ? queriesByDBs : [queriesByDBs];
            queriesByDBs.map(e => metadata[e.name].queries = this.compactQueries(e));
            return metadata;
        });
    }
    /**
     * Load offline configuration from *_offline.json.
     *
     * @param {*} metadata
     * @returns {*} A promise that is resolved with metadata
     */
    loadOfflineConfig(metadata) {
        return this.getMetaInfo(/.+_offline\.json$/)
            .then(configs => {
            _.forEach(configs, config => {
                _.forEach(config.entities, entityConfig => {
                    const entitySchema = _.find(metadata[config.name].schema.entities, schema => schema.name === entityConfig.name);
                    _.assignIn(entitySchema, entityConfig);
                });
            });
            return metadata;
        });
    }
    logSql(sqliteObject) {
        const logger = console, originalExecuteSql = sqliteObject.executeSql;
        sqliteObject.executeSql = (sql, params, logOutput) => {
            const startTime = _.now();
            return originalExecuteSql.call(sqliteObject, sql, params).then(result => {
                if (logOutput || this._logSql) {
                    const objArr = [], rowCount = result.rows.length;
                    for (let i = 0; i < rowCount; i++) {
                        objArr.push(result.rows.item(i));
                    }
                    logger.debug('SQL "%s"  with params %O took [%d ms]. And the result is %O', sql, params, _.now() - startTime, objArr);
                }
                return result;
            }, error => {
                logger.error('SQL "%s" with params %O failed with error message %s', sql, params, error.message);
                return Promise.reject(error);
            });
        };
    }
    /**
     * SQLite does not support boolean data. Instead of using boolean values, data will be changed to 0 or 1.
     * If the value is 'true', then 1 is set as value. If value is not 1 nor null, then column value is set as 0.
     * @param dbName
     * @param tableName
     * @param colName
     * @returns {*}
     */
    normalizeBooleanData(dbName, tableName, colName) {
        const trueTo1Query = `update ${escapeName(tableName)} set ${escapeName(colName)} = 1 where ${escapeName(colName)} = 'true'`, exceptNullAnd1to0Query = `update ${escapeName(tableName)} set ${escapeName(colName)} = 0
                                  where ${escapeName(colName)} is not null and ${escapeName(colName)} != 1`;
        return this.executeSQLQuery(dbName, trueTo1Query)
            .then(() => this.executeSQLQuery(dbName, exceptNullAnd1to0Query));
    }
    /**
     * Converts data to support SQLite.
     * @returns {*}
     */
    normalizeData() {
        return Promise.all(_.map(this.databases, database => {
            return Promise.all(_.map(database.schema.entities, entitySchema => {
                return Promise.all(_.map(entitySchema.columns, column => {
                    if (column.sqlType === 'boolean') {
                        return this.normalizeBooleanData(database.schema.name, entitySchema.name, column.name);
                    }
                }));
            }));
        }));
    }
    openDatabase(database) {
        return this.sqlite.create({
            name: database.schema.name + '.db',
            location: 'default'
        }).then(sqliteObject => {
            database.sqliteObject = sqliteObject;
            this.logSql(sqliteObject);
            const storePromises = _.map(database.schema.entities, entitySchema => {
                const store = new LocalDBStore(this.deviceFileService, entitySchema, this.file, this, sqliteObject);
                return store.create();
            });
            return Promise.all(storePromises).then(stores => {
                _.forEach(stores, store => {
                    database.stores[store.entitySchema.entityName] = store;
                });
                return database;
            });
        });
    }
    /**
     * When app is opened for first time  after a fresh install or update, then old databases are removed and
     * new databases are created using bundled databases.
     *
     * @returns {*} a promise that is resolved with true, if the databases are newly created or resolved with false
     * if existing databases are being used.
     */
    setUpDatabases() {
        return this.deviceService.getAppBuildTime()
            .then((buildTime) => {
            const dbInfo = this.deviceService.getEntry('database') || {};
            if (!dbInfo.lastBuildTime || dbInfo.lastBuildTime !== buildTime) {
                return this.cleanAndCopyDatabases()
                    .then(() => {
                    dbInfo.lastBuildTime = buildTime;
                    return this.deviceService.storeEntry('database', dbInfo);
                }).then(() => true);
            }
            return false;
        });
    }
}
LocalDBManagementService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
LocalDBManagementService.ctorParameters = () => [
    { type: AppVersion },
    { type: DeviceService },
    { type: DeviceFileService },
    { type: File },
    { type: LocalKeyValueService },
    { type: SecurityService },
    { type: SQLite }
];
LocalDBManagementService.ngInjectableDef = i0.defineInjectable({ factory: function LocalDBManagementService_Factory() { return new LocalDBManagementService(i0.inject(i1.AppVersion), i0.inject(i2.DeviceService), i0.inject(i2.DeviceFileService), i0.inject(i3.File), i0.inject(i4.LocalKeyValueService), i0.inject(i5.SecurityService), i0.inject(i6.SQLite)); }, token: LocalDBManagementService, providedIn: "root" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwtZGItbWFuYWdlbWVudC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9vZmZsaW5lLyIsInNvdXJjZXMiOlsic2VydmljZXMvbG9jYWwtZGItbWFuYWdlbWVudC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsTUFBTSxFQUFnQixNQUFNLHNCQUFzQixDQUFDO0FBRTVELE9BQU8sRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ25JLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQy9DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDakUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBOEIsUUFBUSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7Ozs7Ozs7O0FBTzVGLE1BQU8sYUFBYSxHQUFHLDBCQUEwQixDQUFDO0FBQ2xELE1BQU0sYUFBYSxHQUFHLGtCQUFrQixDQUFDO0FBQ3pDLE1BQU0saUNBQWlDLEdBQUc7SUFDdEMsSUFB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YUFBYSxDQUFDLGVBQWUsRUFBRTthQUN0QyxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUNoQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDN0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLElBQUksTUFBTSxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUU7Z0JBQzdELE9BQU8sSUFBSSxDQUFDLHFCQUFxQixFQUFFO3FCQUM5QixJQUFJLENBQUMsR0FBRyxFQUFFO29CQUNQLE1BQU0sQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO29CQUNqQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDN0QsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzNCO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDOzs7WUEveUJKLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7Ozs7WUFqRnZCLFVBQVU7WUFLUyxhQUFhO1lBQWhDLGlCQUFpQjtZQUpqQixJQUFJO1lBUUosb0JBQW9CO1lBSHBCLGVBQWU7WUFKZixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBcHBWZXJzaW9uIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9hcHAtdmVyc2lvbic7XG5pbXBvcnQgeyBGaWxlIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9maWxlJztcbmltcG9ydCB7IFNRTGl0ZSwgU1FMaXRlT2JqZWN0IH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9zcWxpdGUnO1xuXG5pbXBvcnQgeyBEYXRhVHlwZSwgREVGQVVMVF9GT1JNQVRTLCBleGVjdXRlUHJvbWlzZUNoYWluLCBleHRyYWN0VHlwZSwgaXNBbmRyb2lkLCBpc0FycmF5LCBpc0lvcywgbm9vcCwgdG9Qcm9taXNlIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgRGV2aWNlRmlsZVNlcnZpY2UsIERldmljZVNlcnZpY2UgfSBmcm9tICdAd20vbW9iaWxlL2NvcmUnO1xuaW1wb3J0IHsgU2VjdXJpdHlTZXJ2aWNlIH0gZnJvbSAnQHdtL3NlY3VyaXR5JztcbmltcG9ydCB7IGZvcm1hdERhdGUgfSBmcm9tICdAd20vdmFyaWFibGVzJztcblxuaW1wb3J0IHsgTG9jYWxLZXlWYWx1ZVNlcnZpY2UgfSBmcm9tICcuL2xvY2FsLWtleS12YWx1ZS5zZXJ2aWNlJztcbmltcG9ydCB7IExvY2FsREJTdG9yZSB9IGZyb20gJy4uL21vZGVscy9sb2NhbC1kYi1zdG9yZSc7XG5pbXBvcnQgeyBlc2NhcGVOYW1lIH0gZnJvbSAnLi4vdXRpbHMvdXRpbHMnO1xuaW1wb3J0IHsgQ29sdW1uSW5mbywgREJJbmZvLCBFbnRpdHlJbmZvLCBOYW1lZFF1ZXJ5SW5mbywgUHVsbFR5cGUgfSBmcm9tICcuLi9tb2RlbHMvY29uZmlnJztcblxuZGVjbGFyZSBjb25zdCBfO1xuZGVjbGFyZSBjb25zdCBjb3Jkb3ZhO1xuZGVjbGFyZSBjb25zdCBtb21lbnQ7XG5kZWNsYXJlIGNvbnN0IFplZXA7XG5cbmNvbnN0ICBORVhUX0lEX0NPVU5UID0gJ2xvY2FsREJTdG9yZS5uZXh0SWRDb3VudCc7XG5jb25zdCBNRVRBX0xPQ0FUSU9OID0gJ3d3dy9tZXRhZGF0YS9hcHAnO1xuY29uc3QgT0ZGTElORV9XQVZFTUFLRVJfREFUQUJBU0VfU0NIRU1BID0ge1xuICAgIG5hbWU6ICd3YXZlbWFrZXInLFxuICAgIHZlcnNpb246IDEsXG4gICAgaXNJbnRlcm5hbDogdHJ1ZSxcbiAgICB0YWJsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ2tleV92YWx1ZScsXG4gICAgICAgICAgICBlbnRpdHlOYW1lOiAna2V5LXZhbHVlJyxcbiAgICAgICAgICAgIGNvbHVtbnM6IFt7XG4gICAgICAgICAgICAgICAgZmllbGROYW1lOiAnaWQnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdpZCcsXG4gICAgICAgICAgICAgICAgZ2VuZXJhdG9yVHlwZSA6ICdkYXRhYmFzZUlkZW50aXR5JyxcbiAgICAgICAgICAgICAgICBzcWxUeXBlIDogJ251bWJlcicsXG4gICAgICAgICAgICAgICAgcHJpbWFyeUtleTogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGZpZWxkTmFtZTogJ2tleScsXG4gICAgICAgICAgICAgICAgbmFtZTogJ2tleSdcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAndmFsdWUnLFxuICAgICAgICAgICAgICAgIGZpZWxkTmFtZTogJ3ZhbHVlJ1xuICAgICAgICAgICAgfV1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ29mZmxpbmVDaGFuZ2VMb2cnLFxuICAgICAgICAgICAgZW50aXR5TmFtZTogJ29mZmxpbmVDaGFuZ2VMb2cnLFxuICAgICAgICAgICAgY29sdW1uczogW3tcbiAgICAgICAgICAgICAgICBmaWVsZE5hbWU6ICdpZCcsXG4gICAgICAgICAgICAgICAgbmFtZTogJ2lkJyxcbiAgICAgICAgICAgICAgICBnZW5lcmF0b3JUeXBlOiAnZGF0YWJhc2VJZGVudGl0eScsXG4gICAgICAgICAgICAgICAgc3FsVHlwZTogJ251bWJlcicsXG4gICAgICAgICAgICAgICAgcHJpbWFyeUtleTogdHJ1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdzZXJ2aWNlJyxcbiAgICAgICAgICAgICAgICBmaWVsZE5hbWU6ICdzZXJ2aWNlJ1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdvcGVyYXRpb24nLFxuICAgICAgICAgICAgICAgIGZpZWxkTmFtZTogJ29wZXJhdGlvbidcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncGFyYW1zJyxcbiAgICAgICAgICAgICAgICBmaWVsZE5hbWU6ICdwYXJhbXMnXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3RpbWVzdGFtcCcsXG4gICAgICAgICAgICAgICAgZmllbGROYW1lOiAndGltZXN0YW1wJ1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdoYXNFcnJvcicsXG4gICAgICAgICAgICAgICAgZmllbGROYW1lOiAnaGFzRXJyb3InXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2Vycm9yTWVzc2FnZScsXG4gICAgICAgICAgICAgICAgZmllbGROYW1lOiAnZXJyb3JNZXNzYWdlJ1xuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgIF1cbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FsbEJhY2sge1xuICAgIG9uRGJDcmVhdGU/OiAoaW5mbzogYW55KSA9PiBhbnk7XG4gICAgcG9zdEltcG9ydD86IChpbXBvcnRGb2xkZXJQYXRoOiBzdHJpbmcsIG1ldGFJbmZvOiBhbnkpID0+IGFueTtcbiAgICBwcmVFeHBvcnQ/OiAoZm9sZGVyVG9FeHBvcnRGdWxsUGF0aDogc3RyaW5nLCBtZXRhSW5mbzogYW55KSA9PiBhbnk7XG59XG5cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIExvY2FsREJNYW5hZ2VtZW50U2VydmljZSB7XG5cbiAgICBwcml2YXRlIGNhbGxiYWNrczogQ2FsbEJhY2tbXSA9IFtdO1xuICAgIHByaXZhdGUgZGJJbnN0YWxsRGlyZWN0b3J5OiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBkYkluc3RhbGxEaXJlY3RvcnlOYW1lOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBkYkluc3RhbGxQYXJlbnREaXJlY3Rvcnk6IHN0cmluZztcbiAgICBwcml2YXRlIGRhdGFiYXNlczogTWFwPHN0cmluZywgREJJbmZvPjtcbiAgICBwcml2YXRlIF9sb2dTcWwgPSBmYWxzZTtcbiAgICBwdWJsaWMgbmV4dElkID0gMTAwMDAwMDAwMDAwO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3lzdGVtUHJvcGVydGllcyA9IHtcbiAgICAgICAgJ1VTRVJfSUQnIDoge1xuICAgICAgICAgICAgJ25hbWUnIDogJ1VTRVJfSUQnLFxuICAgICAgICAgICAgJ3ZhbHVlJyA6ICgpID0+IHRoaXMuc2VjdXJpdHlTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oIHVzZXJJbmZvID0+IHVzZXJJbmZvLnVzZXJJZClcbiAgICAgICAgfSxcbiAgICAgICAgJ1VTRVJfTkFNRScgOiB7XG4gICAgICAgICAgICAnbmFtZScgOiAnVVNFUl9OQU1FJyxcbiAgICAgICAgICAgICd2YWx1ZScgOiAoKSA9PiB0aGlzLnNlY3VyaXR5U2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKCB1c2VySW5mbyA9PiB1c2VySW5mby51c2VyTmFtZSlcbiAgICAgICAgfSxcbiAgICAgICAgJ0RBVEVfVElNRScgOiB7XG4gICAgICAgICAgICAnbmFtZScgOiAnREFURV9USU1FJyxcbiAgICAgICAgICAgICd2YWx1ZScgOiAoKSA9PiBtb21lbnQoKS5mb3JtYXQoJ1lZWVktTU0tRERUaGg6bW06c3MnKVxuICAgICAgICB9LFxuICAgICAgICAnREFURScgOiB7XG4gICAgICAgICAgICAnbmFtZScgOiAnQ1VSUkVOVF9EQVRFJyxcbiAgICAgICAgICAgICd2YWx1ZScgOiAoKSA9PiBtb21lbnQoKS5mb3JtYXQoJ1lZWVktTU0tREQnKVxuICAgICAgICB9LFxuICAgICAgICAnVElNRScgOiB7XG4gICAgICAgICAgICAnbmFtZScgOiAnVElNRScsXG4gICAgICAgICAgICAndmFsdWUnIDogKCkgPT4gbW9tZW50KCkuZm9ybWF0KCdoaDptbTpzcycpXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgYXBwVmVyc2lvbjogQXBwVmVyc2lvbixcbiAgICAgICAgcHJpdmF0ZSBkZXZpY2VTZXJ2aWNlOiBEZXZpY2VTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGRldmljZUZpbGVTZXJ2aWNlOiBEZXZpY2VGaWxlU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBmaWxlOiBGaWxlLFxuICAgICAgICBwcml2YXRlIGxvY2FsS2V5VmFsdWVTZXJ2aWNlOiBMb2NhbEtleVZhbHVlU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBzZWN1cml0eVNlcnZpY2U6IFNlY3VyaXR5U2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBzcWxpdGU6IFNRTGl0ZVxuICAgICkge31cblxuICAgIC8qKlxuICAgICAqIENsb3NlcyBhbGwgZGF0YWJhc2VzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge29iamVjdH0gYSBwcm9taXNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBjbG9zZSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgLy8gQmVmb3JlIGNsb3NpbmcgZGF0YWJhc2VzLCBnaXZlIHNvbWUgdGltZSBmb3IgdGhlIHBlbmRpbmcgdHJhbnNhY3Rpb25zIChpZiBhbnkpLlxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xvc2VQcm9taXNlcyA9IF8ubWFwKF8udmFsdWVzKHRoaXMuZGF0YWJhc2VzKSwgZGIgPT4gZGIuc3FsaXRlT2JqZWN0LmNsb3NlKCkpO1xuICAgICAgICAgICAgICAgIFByb21pc2UuYWxsKGNsb3NlUHJvbWlzZXMpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmV4dElkQ291bnQoKSB7XG4gICAgICAgIHRoaXMubmV4dElkID0gdGhpcy5uZXh0SWQgKyAxO1xuICAgICAgICB0aGlzLmxvY2FsS2V5VmFsdWVTZXJ2aWNlLnB1dChORVhUX0lEX0NPVU5ULCB0aGlzLm5leHRJZCk7XG4gICAgICAgIHJldHVybiB0aGlzLm5leHRJZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyBhIG5hbWVkIHF1ZXJ5LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRiTmFtZSBuYW1lIG9mIGRhdGFiYXNlIG9uIHdoaWNoIHRoZSBuYW1lZCBxdWVyeSBoYXMgdG8gYmUgcnVuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHF1ZXJ5TmFtZSBuYW1lIG9mIHRoZSBxdWVyeSB0byBleGVjdXRlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXJzIHJlcXVpcmVkIGZvciBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhIHByb21pc2UuXG4gICAgICovXG4gICAgcHVibGljIGV4ZWN1dGVOYW1lZFF1ZXJ5KGRiTmFtZTogc3RyaW5nLCBxdWVyeU5hbWU6IHN0cmluZywgcGFyYW1zOiBhbnkpIHtcbiAgICAgICAgbGV0IHF1ZXJ5RGF0YSwgcGFyYW1Qcm9taXNlcztcbiAgICAgICAgaWYgKCF0aGlzLmRhdGFiYXNlc1tkYk5hbWVdIHx8ICF0aGlzLmRhdGFiYXNlc1tkYk5hbWVdLnF1ZXJpZXNbcXVlcnlOYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGBRdWVyeSBieSBuYW1lICcgJHtxdWVyeU5hbWV9ICcgTm90IEZvdW5kYCk7XG4gICAgICAgIH1cbiAgICAgICAgcXVlcnlEYXRhID0gdGhpcy5kYXRhYmFzZXNbZGJOYW1lXS5xdWVyaWVzW3F1ZXJ5TmFtZV07XG4gICAgICAgIHBhcmFtUHJvbWlzZXMgPSBfLmNoYWluKHF1ZXJ5RGF0YS5wYXJhbXMpXG4gICAgICAgICAgICAuZmlsdGVyKHAgPT4gcC52YXJpYWJsZVR5cGUgIT09ICdQUk9NUFQnKVxuICAgICAgICAgICAgLmZvckVhY2gocCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyYW1WYWx1ZSA9IHRoaXMuc3lzdGVtUHJvcGVydGllc1twLnZhcmlhYmxlVHlwZV0udmFsdWUocC5uYW1lLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0b1Byb21pc2UocGFyYW1WYWx1ZSkudGhlbih2ID0+IHBhcmFtc1twLm5hbWVdID0gdik7XG4gICAgICAgICAgICB9KS52YWx1ZSgpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocGFyYW1Qcm9taXNlcykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBwYXJhbXMgPSBfLm1hcChxdWVyeURhdGEucGFyYW1zLCBwID0+IHtcbiAgICAgICAgICAgICAgICAvLyBTcWxpdGUgd2lsbCBhY2NlcHQgRGF0ZVRpbWUgdmFsdWUgYXMgYmVsb3cgZm9ybWF0LlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1zW3AubmFtZV0gIT09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgICYmIChwLnR5cGUgPT09IERhdGFUeXBlLkRBVEVUSU1FIHx8IHAudHlwZSA9PT0gRGF0YVR5cGUuTE9DQUxEQVRFVElNRSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1hdERhdGUocGFyYW1zW3AubmFtZV0sIHAudHlwZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIHNxbGl0ZSBhY2NlcHRzIHRoZSBib29sIHZhbCBhcyAxLDAgaGVuY2UgY29udmVydCB0aGUgYm9vbGVhbiB2YWx1ZSB0byBudW1iZXJcbiAgICAgICAgICAgICAgICBpZiAocC50eXBlID09PSBEYXRhVHlwZS5CT09MRUFOKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnZlcnRCb29sVG9JbnQocGFyYW1zW3AubmFtZV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zW3AubmFtZV07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmV4ZWN1dGVTUUxRdWVyeShkYk5hbWUsIHF1ZXJ5RGF0YS5xdWVyeSwgcGFyYW1zKVxuICAgICAgICAgICAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmaXJzdFJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5lZWRUcmFuc2Zvcm07XG4gICAgICAgICAgICAgICAgICAgIGlmICghXy5pc0VtcHR5KHJlc3VsdC5yb3dzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RSb3cgPSByZXN1bHQucm93c1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5lZWRUcmFuc2Zvcm0gPSBfLmZpbmQocXVlcnlEYXRhLnJlc3BvbnNlLnByb3BlcnRpZXMsIHAgPT4gIWZpcnN0Um93Lmhhc093blByb3BlcnR5KHAuZmllbGROYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQobmVlZFRyYW5zZm9ybSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucm93cyA9IF8ubWFwKHJlc3VsdC5yb3dzLCByb3cgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZFJvdyA9IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93V2l0aFVwcGVyS2V5cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRvIG1ha2Ugc2VhcmNoIGZvciBkYXRhIGFzIGNhc2UtaW5zZW5zaXRpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKHJvdywgKHYsIGspID0+IHJvd1dpdGhVcHBlcktleXNbay50b1VwcGVyQ2FzZSgpXSA9IHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gocXVlcnlEYXRhLnJlc3BvbnNlLnByb3BlcnRpZXMsIHAgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9ybWF0IHRoZSB2YWx1ZSBkZXBlbmRpbmcgb24gdGhlIHR5cGVSZWYgc3BlY2lmaWVkIGluIHByb3BlcnRpZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wVHlwZSA9IGV4dHJhY3RUeXBlKHAuZmllbGRUeXBlLnR5cGVSZWYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZm9ybWF0VmFsdWUgPSBERUZBVUxUX0ZPUk1BVFNbXy50b1VwcGVyKHByb3BUeXBlKV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWVsZFZhbCA9IHJvd1twLm5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpZWxkVmFsICYmIHR5cGVvZiBmaWVsZFZhbCAhPT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAocHJvcFR5cGUgPT09IERhdGFUeXBlLkRBVEVUSU1FIHx8IHByb3BUeXBlID09PSBEYXRhVHlwZS5MT0NBTERBVEVUSU1FIHx8IHByb3BUeXBlID09PSBEYXRhVHlwZS5EQVRFKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb21lbnQoZmllbGRWYWwpLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dbcC5uYW1lXSA9IGZvcm1hdERhdGUoZmllbGRWYWwsIHByb3BUeXBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1vbWVudChmaWVsZFZhbCwgJ0hIOm1tJykuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSB2YWx1ZSBpcyBpbiBISDptbTpzcyBmb3JtYXQsIGl0IHJldHVybnMgYSB3cm9uZyBkYXRlLiBTbyBhcHBlbmQgdGhlIGRhdGUgdG8gdGhlIGdpdmVuIHZhbHVlIHRvIGdldCBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1twLm5hbWVdID0gbW9tZW50KCkuZm9ybWF0KCdZWVlZLU1NLUREJykgKyAnVCcgKyBmaWVsZFZhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcFR5cGUgPT09IERhdGFUeXBlLkJPT0xFQU4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dbcC5uYW1lXSA9IHRoaXMuY29udmVydEludFRvQm9vbChmaWVsZFZhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dXaXRoVXBwZXJLZXlzW3AubmFtZUluVXBwZXJDYXNlXSA9IHJvd1twLm5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRSb3dbcC5uYW1lXSA9IHJvd1twLm5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRSb3dbcC5maWVsZE5hbWVdID0gcm93W3AuZmllbGROYW1lXSB8fCByb3dXaXRoVXBwZXJLZXlzW3AubmFtZUluVXBwZXJDYXNlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZFJvdztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgZXhwb3J0IHRoZSBkYXRhYmFzZXMgaW4gYSB6aXAgZm9ybWF0LlxuICAgICAqXG4gICAgICogQHJldHVybnMge29iamVjdH0gYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB6aXAgaXMgY3JlYXRlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZXhwb3J0REIoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZm9sZGVyVG9FeHBvcnQgPSAnb2ZmbGluZV90ZW1wXycgKyBfLm5vdygpLFxuICAgICAgICAgICAgICAgIGZvbGRlclRvRXhwb3J0RnVsbFBhdGggPSBjb3Jkb3ZhLmZpbGUuY2FjaGVEaXJlY3RvcnkgKyBmb2xkZXJUb0V4cG9ydCArICcvJyxcbiAgICAgICAgICAgICAgICB6aXBGaWxlTmFtZSA9ICdfb2ZmbGluZV9kYXRhLnppcCcsXG4gICAgICAgICAgICAgICAgbWV0YUluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIGFwcDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgT1M6ICcnLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkT246IDBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IHppcERpcmVjdG9yeTtcbiAgICAgICAgICAgIGlmIChpc0lvcygpKSB7XG4gICAgICAgICAgICAgICAgLy8gSW4gSU9TLCBzYXZlIHppcCB0byBkb2N1bWVudHMgZGlyZWN0b3J5IHNvIHRoYXQgdXNlciBjYW4gZXhwb3J0IHRoZSBmaWxlIGZyb20gSU9TIGRldmljZXMgdXNpbmcgaVRVTkVTLlxuICAgICAgICAgICAgICAgIHppcERpcmVjdG9yeSA9IGNvcmRvdmEuZmlsZS5kb2N1bWVudHNEaXJlY3Rvcnk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEluIEFuZHJvaWQsIHNhdmUgemlwIHRvIGRvd25sb2FkIGRpcmVjdG9yeS5cbiAgICAgICAgICAgICAgICB6aXBEaXJlY3RvcnkgPSBjb3Jkb3ZhLmZpbGUuZXh0ZXJuYWxSb290RGlyZWN0b3J5ICsgJ0Rvd25sb2FkLyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDcmVhdGUgYSB0ZW1wb3JhcnkgZm9sZGVyIHRvIGNvcHkgYWxsIHRoZSBjb250ZW50IHRvIGV4cG9ydFxuICAgICAgICAgICAgdGhpcy5maWxlLmNyZWF0ZURpcihjb3Jkb3ZhLmZpbGUuY2FjaGVEaXJlY3RvcnksIGZvbGRlclRvRXhwb3J0LCBmYWxzZSlcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvcHkgZGF0YWJhc2VzIHRvIHRlbXBvcmFyeSBmb2xkZXIgZm9yIGV4cG9ydFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlLmNvcHlEaXIodGhpcy5kYkluc3RhbGxQYXJlbnREaXJlY3RvcnksIHRoaXMuZGJJbnN0YWxsRGlyZWN0b3J5TmFtZSwgZm9sZGVyVG9FeHBvcnRGdWxsUGF0aCwgJ2RhdGFiYXNlcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJlcGFyZSBtZXRhIGluZm8gdG8gaWRlbnRpZnkgdGhlIHppcCBhbmQgb3RoZXIgaW5mb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEFwcEluZm8oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oYXBwSW5mbyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YUluZm8uYXBwID0gKGFwcEluZm8gYXMgYW55KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNJb3MoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhSW5mby5PUyA9ICdJT1MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNBbmRyb2lkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YUluZm8uT1MgPSAnQU5EUk9JRCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFJbmZvLmNyZWF0ZWRPbiA9IF8ubm93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1ldGFJbmZvO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiBleGVjdXRlUHJvbWlzZUNoYWluKHRoaXMuZ2V0Q2FsbGJhY2tzRm9yKCdwcmVFeHBvcnQnKSwgW2ZvbGRlclRvRXhwb3J0RnVsbFBhdGgsIG1ldGFJbmZvXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV3JpdGUgbWV0YSBkYXRhIHRvIE1FVEEuanNvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGUud3JpdGVGaWxlKGZvbGRlclRvRXhwb3J0RnVsbFBhdGgsICdNRVRBLmpzb24nLCBKU09OLnN0cmluZ2lmeShtZXRhSW5mbykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFByZXBhcmUgbmFtZSB0byB1c2UgZm9yIHRoZSB6aXAuXG4gICAgICAgICAgICAgICAgICAgIGxldCBhcHBOYW1lID0gbWV0YUluZm8uYXBwLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGFwcE5hbWUgPSBhcHBOYW1lLnJlcGxhY2UoL1xccysvZywgJ18nKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlRmlsZVNlcnZpY2UubmV3RmlsZU5hbWUoemlwRGlyZWN0b3J5LCBhcHBOYW1lICsgemlwRmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmaWxlTmFtZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWmlwIHRoZSB0ZW1wb3JhcnkgZm9sZGVyIGZvciBleHBvcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJzLCByZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBaZWVwLnppcCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tIDogZm9sZGVyVG9FeHBvcnRGdWxsUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvICAgOiB6aXBEaXJlY3RvcnkgKyBmaWxlTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiBycyh6aXBEaXJlY3RvcnkgKyBmaWxlTmFtZSksIHJlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgICAgICAgIC5jYXRjaChub29wKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRlbXBvcmFyeSBmb2xkZXIgZm9yIGV4cG9ydFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXZpY2VGaWxlU2VydmljZS5yZW1vdmVEaXIoY29yZG92YS5maWxlLmNhY2hlRGlyZWN0b3J5ICsgZm9sZGVyVG9FeHBvcnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAgcmV0dXJucyBzdG9yZSBib3VuZCB0byB0aGUgZGF0YU1vZGVsTmFtZSBhbmQgZW50aXR5TmFtZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBkYXRhTW9kZWxOYW1lXG4gICAgICogQHBhcmFtIGVudGl0eU5hbWVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U3RvcmUoZGF0YU1vZGVsTmFtZTogc3RyaW5nLCBlbnRpdHlOYW1lOiBzdHJpbmcpOiBQcm9taXNlPExvY2FsREJTdG9yZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YWJhc2VzW2RhdGFNb2RlbE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLmRhdGFiYXNlc1tkYXRhTW9kZWxOYW1lXS5zdG9yZXNbZW50aXR5TmFtZV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVqZWN0KGBzdG9yZSB3aXRoIG5hbWUnJHtlbnRpdHlOYW1lfScgaW4gZGF0YW1vZGVsICcke2RhdGFNb2RlbE5hbWV9JyBpcyBub3QgZm91bmRgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiB3aWxsIHJlcGxhY2UgdGhlIGRhdGFiYXNlcyB3aXRoIHRoZSBmaWxlcyBwcm92aWRlZCBpbiB6aXAuIElmIGltcG9ydCBnZXRzIGZhaWxlZCxcbiAgICAgKiB0aGVuIGFwcCByZXZlcnRzIGJhY2sgdG8gdXNlIG9sZCBkYXRhYmFzZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gemlwUGF0aCBsb2NhdGlvbiBvZiB0aGUgemlwIGZpbGUuXG4gICAgICogQHBhcmFtIHtib29sZWFufSByZXZlcnRJZkZhaWxzIElmIHRydWUsIHRoZW4gYSBiYWNrdXAgaXMgY3JlYXRlZCBhbmQgd2hlbiBpbXBvcnQgZmFpbHMsIGJhY2t1cCBpcyByZXZlcnRlZCBiYWNrLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gemlwIGlzIGNyZWF0ZWQuXG4gICAgICovXG4gICAgcHVibGljIGltcG9ydERCKHppcFBhdGg6IHN0cmluZywgcmV2ZXJ0SWZGYWlsczogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW1wb3J0Rm9sZGVyID0gJ29mZmxpbmVfdGVtcF8nICsgXy5ub3coKSxcbiAgICAgICAgICAgICAgICBpbXBvcnRGb2xkZXJGdWxsUGF0aCA9IGNvcmRvdmEuZmlsZS5jYWNoZURpcmVjdG9yeSArIGltcG9ydEZvbGRlciArICcvJztcbiAgICAgICAgICAgIGxldCB6aXBNZXRhO1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IGZvbGRlciB0byB1bnppcCB0aGUgY29udGVudHMgb2YgdGhlIHppcC5cbiAgICAgICAgICAgIHRoaXMuZmlsZS5jcmVhdGVEaXIoY29yZG92YS5maWxlLmNhY2hlRGlyZWN0b3J5LCBpbXBvcnRGb2xkZXIsIGZhbHNlKVxuICAgICAgICAgICAgICAgIC50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocnMsIHJlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBVbnppcCB0byB0ZW1wb3JhcnkgbG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIFplZXAudW56aXAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IHppcFBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IGltcG9ydEZvbGRlckZ1bGxQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBycywgcmUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAqIHJlYWQgbWV0YSBkYXRhIGFuZCBhbGxvdyBpbXBvcnQgb25seSBwYWNrYWdlIG5hbWUgb2YgdGhlIGFwcCBmcm9tIHdoaWNoIHRoaXMgemlwIGlzIGNyZWF0ZWRcbiAgICAgICAgICAgICAgICAgKiBhbmQgdGhlIHBhY2thZ2UgbmFtZSBvZiB0aGlzIGFwcCBhcmUgc2FtZS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlLnJlYWRBc1RleHQoaW1wb3J0Rm9sZGVyRnVsbFBhdGgsICdNRVRBLmpzb24nKVxuICAgICAgICAgICAgICAgICAgICAudGhlbih0ZXh0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgemlwTWV0YSA9IEpTT04ucGFyc2UodGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEFwcEluZm8oKTtcbiAgICAgICAgICAgICAgICB9KS50aGVuKGFwcEluZm8gPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXppcE1ldGEuYXBwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ21ldGEgaW5mb3JtYXRpb24gaXMgbm90IGZvdW5kIGluIHppcCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh6aXBNZXRhLmFwcC5wYWNrYWdlTmFtZSAhPT0gYXBwSW5mby5wYWNrYWdlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdkYXRhYmFzZSB6aXAgb2YgYXBwIHdpdGggc2FtZSBwYWNrYWdlIG5hbWUgY2FuIG9ubHkgYmUgaW1wb3J0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGJhY2t1cFppcDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9zZSgpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXZlcnRJZkZhaWxzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIGJhY2t1cFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV4cG9ydERCKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4ocGF0aCA9PiBiYWNrdXBaaXAgPSBwYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBkZWxldGUgZXhpc3RpbmcgZGF0YWJhc2VzXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXZpY2VGaWxlU2VydmljZS5yZW1vdmVEaXIodGhpcy5kYkluc3RhbGxEaXJlY3RvcnkpO1xuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvcHkgaW1wb3J0ZWQgZGF0YWJhc2VzXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlLmNvcHlEaXIoaW1wb3J0Rm9sZGVyRnVsbFBhdGgsICdkYXRhYmFzZXMnLCB0aGlzLmRiSW5zdGFsbFBhcmVudERpcmVjdG9yeSwgdGhpcy5kYkluc3RhbGxEaXJlY3RvcnlOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZWxvYWQgZGF0YWJhc2VzXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFiYXNlcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2FkRGF0YWJhc2VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4gZXhlY3V0ZVByb21pc2VDaGFpbih0aGlzLmdldENhbGxiYWNrc0ZvcigncG9zdEltcG9ydCcpLCBbaW1wb3J0Rm9sZGVyRnVsbFBhdGgsIHppcE1ldGFdKSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJhY2t1cFppcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRldmljZUZpbGVTZXJ2aWNlLnJlbW92ZUZpbGUoYmFja3VwWmlwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgKHJlYXNvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJhY2t1cFppcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmltcG9ydERCKGJhY2t1cFppcCwgZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGV2aWNlRmlsZVNlcnZpY2UucmVtb3ZlRmlsZShiYWNrdXBaaXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkudGhlbihyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgICAuY2F0Y2gobm9vcClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXZpY2VGaWxlU2VydmljZS5yZW1vdmVEaXIoY29yZG92YS5maWxlLmNhY2hlRGlyZWN0b3J5ICsgaW1wb3J0Rm9sZGVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGF0YU1vZGVsTmFtZSBOYW1lIG9mIHRoZSBkYXRhIG1vZGVsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGVudGl0eU5hbWUgTmFtZSBvZiB0aGUgZW50aXR5XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG9wZXJhdGlvbiBOYW1lIG9mIHRoZSBvcGVyYXRpb24gKFJFQUQsIElOU0VSVCwgVVBEQVRFLCBERUxFVEUpXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJldHVybnMgdHJ1ZSwgaWYgdGhlIGdpdmVuIG9wZXJhdGlvbiBjYW4gYmUgcGVyZm9ybWVkIGFzIHBlciBjb25maWd1cmF0aW9uLlxuICAgICAqL1xuICAgIHB1YmxpYyBpc09wZXJhdGlvbkFsbG93ZWQoZGF0YU1vZGVsTmFtZTogc3RyaW5nLCBlbnRpdHlOYW1lOiBzdHJpbmcsIG9wZXJhdGlvbjogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0b3JlKGRhdGFNb2RlbE5hbWUsIGVudGl0eU5hbWUpLnRoZW4oIHN0b3JlID0+IHtcbiAgICAgICAgICAgIGlmICghc3RvcmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uID09PSAnUkVBRCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RvcmUuZW50aXR5U2NoZW1hLnB1c2hDb25maWcucmVhZEVuYWJsZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uID09PSAnSU5TRVJUJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdG9yZS5lbnRpdHlTY2hlbWEucHVzaENvbmZpZy5pbnNlcnRFbmFibGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbiA9PT0gJ1VQREFURScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RvcmUuZW50aXR5U2NoZW1hLnB1c2hDb25maWcudXBkYXRlRW5hYmxlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24gPT09ICdERUxFVEUnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0b3JlLmVudGl0eVNjaGVtYS5wdXNoQ29uZmlnLmRlbGV0ZUVuYWJsZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGxvYWREYXRhYmFzZXMoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgbGV0IG5ld0RhdGFiYXNlc0NyZWF0ZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuZGF0YWJhc2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuZGF0YWJhc2VzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpc0lvcygpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYkluc3RhbGxEaXJlY3RvcnlOYW1lID0gJ0xvY2FsRGF0YWJhc2UnO1xuICAgICAgICAgICAgICAgIHRoaXMuZGJJbnN0YWxsUGFyZW50RGlyZWN0b3J5ID0gY29yZG92YS5maWxlLmFwcGxpY2F0aW9uU3RvcmFnZURpcmVjdG9yeSArICAnTGlicmFyeS8nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRiSW5zdGFsbERpcmVjdG9yeU5hbWUgPSAnZGF0YWJhc2VzJztcbiAgICAgICAgICAgICAgICB0aGlzLmRiSW5zdGFsbFBhcmVudERpcmVjdG9yeSA9IGNvcmRvdmEuZmlsZS5hcHBsaWNhdGlvblN0b3JhZ2VEaXJlY3Rvcnk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRiSW5zdGFsbERpcmVjdG9yeSA9IHRoaXMuZGJJbnN0YWxsUGFyZW50RGlyZWN0b3J5ICsgdGhpcy5kYkluc3RhbGxEaXJlY3RvcnlOYW1lO1xuXG4gICAgICAgICAgICB0aGlzLmRhdGFiYXNlcyA9IG5ldyBNYXA8c3RyaW5nLCBEQkluZm8+KCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRVcERhdGFiYXNlcygpXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZsYWcgPT4gbmV3RGF0YWJhc2VzQ3JlYXRlZCA9IGZsYWcpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5sb2FkREJTY2hlbWFzKCkpXG4gICAgICAgICAgICAgICAgLnRoZW4obWV0YWRhdGEgPT4gdGhpcy5sb2FkTmFtZWRRdWVyaWVzKG1ldGFkYXRhKSlcbiAgICAgICAgICAgICAgICAudGhlbihtZXRhZGF0YSA9PiB0aGlzLmxvYWRPZmZsaW5lQ29uZmlnKG1ldGFkYXRhKSlcbiAgICAgICAgICAgICAgICAudGhlbihtZXRhZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChfLm1hcChtZXRhZGF0YSwgZGJNZXRhZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcGVuRGF0YWJhc2UoZGJNZXRhZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihkYXRhYmFzZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YWJhc2VzW2RiTWV0YWRhdGEuc2NoZW1hLm5hbWVdID0gZGF0YWJhc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RvcmUoJ3dhdmVtYWtlcicsICdrZXktdmFsdWUnKS50aGVuKCBzdG9yZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2FsS2V5VmFsdWVTZXJ2aWNlLmluaXQoc3RvcmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxLZXlWYWx1ZVNlcnZpY2UuZ2V0KE5FWFRfSURfQ09VTlQpLnRoZW4odmFsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dElkID0gdmFsIHx8IHRoaXMubmV4dElkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGF0YWJhc2VzQ3JlYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplRGF0YSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5kaXNhYmxlRm9yZWlnbktleXMoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLmRldmljZVNlcnZpY2UuZ2V0QXBwQnVpbGRUaW1lKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZGJTZWVkQ3JlYXRpb25UaW1lID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4ZWN1dGVQcm9taXNlQ2hhaW4oXy5tYXAodGhpcy5jYWxsYmFja3MsICdvbkRiQ3JlYXRlJyksIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YWJhc2VzJyA6IHRoaXMuZGF0YWJhc2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RiQ3JlYXRlZE9uJyA6IF8ubm93KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGJTZWVkQ3JlYXRlZE9uJyA6IGRiU2VlZENyZWF0aW9uVGltZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB0aGlzLmRhdGFiYXNlcyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhYmFzZXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHVzaW5nIHRoaXMgZnVuY3Rpb24gb25lIGNhbiBsaXN0ZW4gZXZlbnRzIHN1Y2ggYXMgb25EYkNyZWF0ZSwgJ3ByZUV4cG9ydCcgYW5kICdwb3N0SW1wb3J0Jy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsaXN0ZW5lciBhbiBvYmplY3Qgd2l0aCBmdW5jdGlvbnMgbWFwcGVkIHRvIGV2ZW50IG5hbWVzLlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrKGxpc3RlbmVyOiBDYWxsQmFjaykge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0TG9nU1FsKGZsYWc6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5fbG9nU3FsID0gZmxhZztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGVzIGFueSBleGlzdGluZyBkYXRhYmFzZXMgKGV4Y2VwdCB3YXZlbWFrZXIgZGIpIGFuZCBjb3BpZXMgdGhlIGRhdGFiYXNlcyB0aGF0IGFyZSBwYWNrYWdlZCB3aXRoIHRoZSBhcHAuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBwcml2YXRlIGNsZWFuQW5kQ29weURhdGFiYXNlcygpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBjb25zdCBkYlNlZWRGb2xkZXIgPSBjb3Jkb3ZhLmZpbGUuYXBwbGljYXRpb25EaXJlY3RvcnkgKyBNRVRBX0xPQ0FUSU9OO1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmNyZWF0ZURpcih0aGlzLmRiSW5zdGFsbFBhcmVudERpcmVjdG9yeSwgdGhpcy5kYkluc3RhbGxEaXJlY3RvcnlOYW1lLCBmYWxzZSlcbiAgICAgICAgICAgIC5jYXRjaChub29wKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5kZXZpY2VGaWxlU2VydmljZS5saXN0RmlsZXModGhpcy5kYkluc3RhbGxEaXJlY3RvcnksIC8uK1xcLmRiJC8pKVxuICAgICAgICAgICAgLnRoZW4oZmlsZXMgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChmaWxlcyAmJiBmaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChmaWxlcy5tYXAoZiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZlsnbmFtZSddICE9PSAnd2F2ZW1ha2VyLmRiJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGUucmVtb3ZlRmlsZSh0aGlzLmRiSW5zdGFsbERpcmVjdG9yeSwgZlsnbmFtZSddKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbiggKCkgPT4gdGhpcy5kZXZpY2VGaWxlU2VydmljZS5saXN0RmlsZXMoZGJTZWVkRm9sZGVyLCAvLitcXC5kYiQvKSlcbiAgICAgICAgICAgIC50aGVuKGZpbGVzID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZmlsZXMgJiYgZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlLmNyZWF0ZURpcih0aGlzLmRiSW5zdGFsbFBhcmVudERpcmVjdG9yeSwgdGhpcy5kYkluc3RhbGxEaXJlY3RvcnlOYW1lLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChub29wKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gUHJvbWlzZS5hbGwoZmlsZXMubWFwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmID0+IHRoaXMuZmlsZS5jb3B5RmlsZShkYlNlZWRGb2xkZXIsIGZbJ25hbWUnXSwgdGhpcy5kYkluc3RhbGxEaXJlY3RvcnksIGZbJ25hbWUnXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBQaWNrcyBlc3NlbnRpYWwgZGV0YWlscyBmcm9tIHRoZSBnaXZlbiBzY2hlbWEuXG4gICAgcHJpdmF0ZSBjb21wYWN0RW50aXR5U2NoZW1hKHNjaGVtYSwgZW50aXR5LCB0cmFuc2Zvcm1lZFNjaGVtYXMpOiBFbnRpdHlJbmZvIHtcbiAgICAgICAgY29uc3QgcmVxRW50aXR5ID0gdHJhbnNmb3JtZWRTY2hlbWFzW2VudGl0eVsnZW50aXR5TmFtZSddXSBhcyBFbnRpdHlJbmZvO1xuICAgICAgICByZXFFbnRpdHkuZW50aXR5TmFtZSA9IGVudGl0eVsnZW50aXR5TmFtZSddO1xuICAgICAgICByZXFFbnRpdHkubmFtZSA9IGVudGl0eVsnbmFtZSddO1xuICAgICAgICByZXFFbnRpdHkuY29sdW1ucyA9IFtdO1xuICAgICAgICBlbnRpdHkuY29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICBsZXQgZGVmYXVsdFZhbHVlID0gY29sLmNvbHVtblZhbHVlID8gY29sLmNvbHVtblZhbHVlLmRlZmF1bHRWYWx1ZSA6ICcnO1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IGNvbC5zcWxUeXBlO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFjb2wucHJpbWFyeUtleSkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IF8uaXNFbXB0eShkZWZhdWx0VmFsdWUpID8gbnVsbCA6IF8ucGFyc2VJbnQoZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gXy5pc0VtcHR5KGRlZmF1bHRWYWx1ZSkgPyBudWxsIDogKGRlZmF1bHRWYWx1ZSA9PT0gJ3RydWUnID8gMSA6IDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBfLmlzRW1wdHkoZGVmYXVsdFZhbHVlKSA/IG51bGwgOiBkZWZhdWx0VmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXFFbnRpdHkuY29sdW1ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBjb2xbJ25hbWUnXSxcbiAgICAgICAgICAgICAgICBmaWVsZE5hbWU6IGNvbFsnZmllbGROYW1lJ10sXG4gICAgICAgICAgICAgICAgZ2VuZXJhdG9yVHlwZTogY29sWydnZW5lcmF0b3JUeXBlJ10sXG4gICAgICAgICAgICAgICAgc3FsVHlwZTogY29sWydzcWxUeXBlJ10sXG4gICAgICAgICAgICAgICAgcHJpbWFyeUtleTogY29sWydwcmltYXJ5S2V5J10sXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBkZWZhdWx0VmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBfLmZvckVhY2goZW50aXR5LnJlbGF0aW9ucywgciA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0RW50aXR5U2NoZW1hLCB0YXJnZXRFbnRpdHksIGNvbCwgc291cmNlQ29sdW1uLCBtYXBwaW5nO1xuICAgICAgICAgICAgaWYgKHIuY2FyZGluYWxpdHkgPT09ICdNYW55VG9PbmUnIHx8IHIuY2FyZGluYWxpdHkgPT09ICdPbmVUb09uZScpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRFbnRpdHkgPSBfLmZpbmQoc2NoZW1hLnRhYmxlcywgdCA9PiB0Lm5hbWUgPT09IHIudGFyZ2V0VGFibGUpO1xuICAgICAgICAgICAgICAgIG1hcHBpbmcgPSByLm1hcHBpbmdzWzBdO1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRFbnRpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RW50aXR5ID0gdGFyZ2V0RW50aXR5LmVudGl0eU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvbHVtbiA9IG1hcHBpbmcuc291cmNlQ29sdW1uO1xuICAgICAgICAgICAgICAgICAgICBjb2wgPSByZXFFbnRpdHkuY29sdW1ucy5maW5kKGNvbHVtbiA9PiBjb2x1bW4ubmFtZSA9PT0gc291cmNlQ29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RW50aXR5U2NoZW1hID0gc2NoZW1hLnRhYmxlcy5maW5kKHRhYmxlID0+IHRhYmxlLm5hbWUgPT09IHIudGFyZ2V0VGFibGUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmb3JlaWduUmVsYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VGaWVsZE5hbWU6IHIuZmllbGROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RW50aXR5OiB0YXJnZXRFbnRpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRUYWJsZTogci50YXJnZXRUYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldENvbHVtbjogbWFwcGluZy50YXJnZXRDb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYXRoOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFNYXBwZXI6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RmllbGROYW1lOiB0YXJnZXRFbnRpdHlTY2hlbWEuY29sdW1ucy5maW5kKGNvbHVtbiA9PiBjb2x1bW4ubmFtZSA9PT0gbWFwcGluZy50YXJnZXRDb2x1bW4pLmZpZWxkTmFtZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBmb3JlaWduUmVsYXRpb24udGFyZ2V0UGF0aCA9IGZvcmVpZ25SZWxhdGlvbi5zb3VyY2VGaWVsZE5hbWUgKyAnLicgKyBmb3JlaWduUmVsYXRpb24udGFyZ2V0RmllbGROYW1lO1xuICAgICAgICAgICAgICAgICAgICBmb3JlaWduUmVsYXRpb24uZGF0YU1hcHBlciA9IF8uY2hhaW4odGFyZ2V0RW50aXR5U2NoZW1hLmNvbHVtbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAua2V5QnkoY2hpbGRDb2wgPT4gZm9yZWlnblJlbGF0aW9uLnNvdXJjZUZpZWxkTmFtZSArICcuJyArIGNoaWxkQ29sLmZpZWxkTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXBWYWx1ZXMoY2hpbGRDb2wgPT4gbmV3IENvbHVtbkluZm8oY2hpbGRDb2wubmFtZSwgY2hpbGRDb2wuZmllbGROYW1lKSkudmFsdWUoKTtcbiAgICAgICAgICAgICAgICAgICAgY29sLmZvcmVpZ25SZWxhdGlvbnMgPSBjb2wuZm9yZWlnblJlbGF0aW9ucyB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgY29sLmZvcmVpZ25SZWxhdGlvbnMucHVzaChmb3JlaWduUmVsYXRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXFFbnRpdHk7XG4gICAgfVxuXG4gICAgLy8gTG9hZHMgbmVjZXNzYXJ5IGRldGFpbHMgb2YgcXVlcmllc1xuICAgIHByaXZhdGUgY29tcGFjdFF1ZXJpZXMocXVlcmllc0J5REIpOiBNYXA8c3RyaW5nLCBOYW1lZFF1ZXJ5SW5mbz4ge1xuICAgICAgICBjb25zdCBxdWVyaWVzID0gbmV3IE1hcDxzdHJpbmcsIE5hbWVkUXVlcnlJbmZvPigpO1xuXG4gICAgICAgIF8uZm9yRWFjaChxdWVyaWVzQnlEQi5xdWVyaWVzLCBxdWVyeURhdGEgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5LCBwYXJhbXM7XG4gICAgICAgICAgICBpZiAocXVlcnlEYXRhLm5hdGl2ZVNxbCAmJiBxdWVyeURhdGEudHlwZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgICAgICAgICAgICBxdWVyeSA9IF8uaXNFbXB0eShxdWVyeURhdGEub2ZmbGluZVF1ZXJ5U3RyaW5nKSA/IHF1ZXJ5RGF0YS5xdWVyeVN0cmluZyA6IHF1ZXJ5RGF0YS5vZmZsaW5lUXVlcnlTdHJpbmc7XG4gICAgICAgICAgICAgICAgcGFyYW1zID0gXy5tYXAodGhpcy5leHRyYWN0UXVlcnlQYXJhbXMocXVlcnkpLCBwID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyYW1PYmogPSBfLmZpbmQocXVlcnlEYXRhLnBhcmFtZXRlcnMsIHsnbmFtZSc6IHB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHBhcmFtT2JqLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBwYXJhbU9iai50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVUeXBlOiBwYXJhbU9iai52YXJpYWJsZVR5cGVcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwYXJhbXMuZm9yRWFjaChwID0+IHF1ZXJ5ID0gXy5yZXBsYWNlKHF1ZXJ5LCAnOicgKyBwLm5hbWUsICc/JykpO1xuICAgICAgICAgICAgICAgIHF1ZXJpZXNbcXVlcnlEYXRhLm5hbWVdID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBxdWVyeURhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHF1ZXJ5LFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IF8ubWFwKHF1ZXJ5RGF0YS5yZXNwb25zZS5wcm9wZXJ0aWVzLCBwID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwLm5hbWVJblVwcGVyQ2FzZSA9IHAubmFtZS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcXVlcmllcztcbiAgICB9XG5cbiAgICAvLyBMb2FkcyBuZWNlc3NhcnkgZGV0YWlscyBvZiByZW1vdGUgc2NoZW1hXG4gICAgcHJpdmF0ZSBjb21wYWN0U2NoZW1hKHNjaGVtYSk6IERCSW5mbyB7XG4gICAgICAgIGNvbnN0IGRiSW5mbyA9IG5ldyBEQkluZm8oKTtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRTY2hlbWFzID0gbmV3IE1hcDxzdHJpbmcsIEVudGl0eUluZm8+KCk7XG4gICAgICAgIHNjaGVtYS50YWJsZXMuZm9yRWFjaChlbnRpdHlTY2hlbWEgPT4ge1xuICAgICAgICAgICAgdHJhbnNmb3JtZWRTY2hlbWFzW2VudGl0eVNjaGVtYS5lbnRpdHlOYW1lXSA9IHt9O1xuICAgICAgICB9KTtcbiAgICAgICAgc2NoZW1hLnRhYmxlcy5mb3JFYWNoKGVudGl0eVNjaGVtYSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbXBhY3RFbnRpdHlTY2hlbWEoc2NoZW1hLCBlbnRpdHlTY2hlbWEsIHRyYW5zZm9ybWVkU2NoZW1hcyk7XG4gICAgICAgIH0pO1xuICAgICAgICBkYkluZm8uc2NoZW1hLm5hbWUgPSBzY2hlbWEubmFtZTtcbiAgICAgICAgZGJJbmZvLnNjaGVtYS5pc0ludGVybmFsID0gc2NoZW1hLmlzSW50ZXJuYWw7XG4gICAgICAgIGRiSW5mby5zY2hlbWEuZW50aXRpZXMgPSB0cmFuc2Zvcm1lZFNjaGVtYXM7XG4gICAgICAgIHJldHVybiBkYkluZm87XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb252ZXJ0Qm9vbFRvSW50KGJvb2w6IGJvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIF8udG9TdHJpbmcoYm9vbCkgPT09ICd0cnVlJyA/IDEgOiAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29udmVydEludFRvQm9vbChpbnQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gaW50ID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFR1cm5zIG9mZiBmb3JlaWduIGtleXNcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBwcml2YXRlIGRpc2FibGVGb3JlaWduS2V5cygpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKF8ubWFwKHRoaXMuZGF0YWJhc2VzLCBkYiA9PlxuICAgICAgICAgICAgdGhpcy5leGVjdXRlU1FMUXVlcnkoZGIuc2NoZW1hLm5hbWUsICdQUkFHTUEgZm9yZWlnbl9rZXlzID0gT0ZGJylcbiAgICAgICAgKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgU1FMIHF1ZXJ5O1xuICAgICAqXG4gICAgICogQHBhcmFtIGRiTmFtZVxuICAgICAqIEBwYXJhbSBzcWxcbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgcHVibGljIGV4ZWN1dGVTUUxRdWVyeShkYk5hbWUsIHNxbCwgcGFyYW1zPzogYW55W10sIGxvZ091dHB1dD86IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgZGIgPSB0aGlzLmRhdGFiYXNlc1tkYk5hbWVdO1xuICAgICAgICBpZiAoZGIpIHtcbiAgICAgICAgICAgIHJldHVybiBkYi5zcWxpdGVPYmplY3QuZXhlY3V0ZVNxbChzcWwsIHBhcmFtcywgbG9nT3V0cHV0KVxuICAgICAgICAgICAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd3MgPSByZXN1bHQucm93cztcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2gocm93cy5pdGVtKGkpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3Jvd3NBZmZlY3RlZCcgIDogcmVzdWx0LnJvd3NBZmZlY3RlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdyb3dzJyAgICAgICAgICA6IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoYE5vIERhdGFiYXNlIHdpdGggbmFtZSAke2RiTmFtZX0gZm91bmRgKTtcbiAgICB9XG5cbiAgICAvLyBnZXQgdGhlIHBhcmFtcyBvZiB0aGUgcXVlcnkgb3IgcHJvY2VkdXJlLlxuICAgIHByaXZhdGUgZXh0cmFjdFF1ZXJ5UGFyYW1zKHF1ZXJ5KSB7XG4gICAgICAgIGxldCBwYXJhbXMsIGFsaWFzUGFyYW1zO1xuICAgICAgICBhbGlhc1BhcmFtcyA9IHF1ZXJ5Lm1hdGNoKC9bXlwiJ1xcd1xcXFxdOlxccypcXHcrXFxzKi9nKSB8fCBbXTtcbiAgICAgICAgaWYgKGFsaWFzUGFyYW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgcGFyYW1zID0gYWxpYXNQYXJhbXMubWFwKHggPT4gKC9bPXxcXFddL2cudGVzdCh4KSkgPyB4LnJlcGxhY2UoL1xcVy9nLCAnJykudHJpbSgpIDogeC50cmltKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFyYW1zID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aCBhcHBsaWNhdGlvbiBpbmZvIHN1Y2ggYXMgcGFja2FnZU5hbWUsIGFwcE5hbWUsIHZlcnNpb25OdW1iZXIsIHZlcnNpb25Db2RlLlxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0QXBwSW5mbygpIHtcbiAgICAgICAgY29uc3QgYXBwSW5mbyA9IHtcbiAgICAgICAgICAgIG5hbWU6ICcnLFxuICAgICAgICAgICAgcGFja2FnZU5hbWU6ICcnLFxuICAgICAgICAgICAgdmVyc2lvbk51bWJlcjogJycsXG4gICAgICAgICAgICB2ZXJzaW9uQ29kZTogbnVsbFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5hcHBWZXJzaW9uLmdldFBhY2thZ2VOYW1lKClcbiAgICAgICAgICAgIC50aGVuKHBhY2thZ2VOYW1lID0+IHtcbiAgICAgICAgICAgICAgICBhcHBJbmZvLnBhY2thZ2VOYW1lID0gcGFja2FnZU5hbWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBwVmVyc2lvbi5nZXRBcHBOYW1lKCk7XG4gICAgICAgICAgICB9KS50aGVuKGFwcE5hbWUgPT4ge1xuICAgICAgICAgICAgICAgIGFwcEluZm8ubmFtZSA9IGFwcE5hbWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBwVmVyc2lvbi5nZXRWZXJzaW9uTnVtYmVyKCk7XG4gICAgICAgICAgICB9KS50aGVuKHZlcnNpb25OdW1iZXIgPT4ge1xuICAgICAgICAgICAgICAgIGFwcEluZm8udmVyc2lvbk51bWJlciA9IHZlcnNpb25OdW1iZXI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBwVmVyc2lvbi5nZXRWZXJzaW9uQ29kZSgpO1xuICAgICAgICAgICAgfSkudGhlbih2ZXJzaW9uQ29kZSA9PiB7XG4gICAgICAgICAgICAgICAgYXBwSW5mby52ZXJzaW9uQ29kZSA9ICh2ZXJzaW9uQ29kZSBhcyBhbnkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhcHBJbmZvO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDYWxsYmFja3NGb3IoZXZlbnQ6IHN0cmluZyk6IGFueVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2tzLm1hcChjID0+IHtcbiAgICAgICAgICAgIGlmIChjW2V2ZW50XSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjW2V2ZW50XS5iaW5kKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlYXJjaGVzIGZvciB0aGUgZmlsZXMgd2l0aCBnaXZlbiByZWdleCBpbiAnd3d3L21ldGFkYXRhL2FwcCdhbmQgcmV0dXJucyBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSBKU09OXG4gICAgICogY29udGVudCBwcmVzZW50IGluIGVhY2ggZmlsZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlTmFtZVJlZ2V4IHJlZ2V4IHBhdHRlcm4gdG8gc2VhcmNoIGZvciBmaWxlcy5cbiAgICAgKiBAcmV0dXJucyB7Kn0gQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aCBhbiBhcnJheVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0TWV0YUluZm8oZmlsZU5hbWVSZWdleDogUmVnRXhwKSB7XG4gICAgICAgIGNvbnN0IGZvbGRlciA9IGNvcmRvdmEuZmlsZS5hcHBsaWNhdGlvbkRpcmVjdG9yeSArIE1FVEFfTE9DQVRJT04gKyAnLyc7XG4gICAgICAgIHJldHVybiB0aGlzLmRldmljZUZpbGVTZXJ2aWNlLmxpc3RGaWxlcyhmb2xkZXIsIGZpbGVOYW1lUmVnZXgpXG4gICAgICAgICAgICAudGhlbihmaWxlcyA9PiBQcm9taXNlLmFsbChfLm1hcChmaWxlcywgZiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb3Jkb3ZhIEZpbGUgcmVhZGVyIGhhcyBidWZmZXIgaXNzdWVzIHdpdGggbGFyZ2UgZmlsZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzbywgdXNpbmcgYWpheCB0byByZXRyaWV2ZSBsb2NhbCBqc29uXG4gICAgICAgICAgICAgICAgICAgICAgICAkLmdldEpTT04oIGZvbGRlciArIGZbJ25hbWUnXSwgZGF0YSA9PiByZXNvbHZlKGRhdGEpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSwgaWYgdGhlIGdpdmVuIGVudGl0eSdzIGRhdGEgaXMgYnVuZGxlZCBhbG9uZyB3aXRoIGFwcGxpY2F0aW9uIGluc3RhbGxlci5cbiAgICAgKiBAcGFyYW0gZGF0YU1vZGVsTmFtZSBuYW1lIG9mIHRoZSBkYXRhIG1vZGVsXG4gICAgICogQHBhcmFtIGVudGl0eU5hbWUgbmFtZSBvZiB0aGUgZW50aXR5XG4gICAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNCdW5kbGVkKGRhdGFNb2RlbE5hbWUsIGVudGl0eU5hbWUpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdG9yZShkYXRhTW9kZWxOYW1lLCBlbnRpdHlOYW1lKS50aGVuKHN0b3JlID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzdG9yZS5lbnRpdHlTY2hlbWEucHVsbENvbmZpZy5wdWxsVHlwZSA9PT0gUHVsbFR5cGUuQlVORExFRDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZHMgbG9jYWwgZGF0YWJhc2Ugc2NoZW1hcyBmcm9tICpfZGF0YV9tb2RlbC5qc29uLlxuICAgICAqXG4gICAgICogQHJldHVybnMgeyp9IEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggbWV0YWRhdGEuXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkREJTY2hlbWFzKCk6IFByb21pc2U8TWFwPHN0cmluZywgREJJbmZvPj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRNZXRhSW5mbygvLitfZGF0YU1vZGVsXFwuanNvbiQvKVxuICAgICAgICAgICAgLnRoZW4oIChzY2hlbWFzOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IG5ldyBNYXA8c3RyaW5nLCBEQkluZm8+KCk7XG4gICAgICAgICAgICAgICAgc2NoZW1hcyA9IGlzQXJyYXkoc2NoZW1hcykgPyBzY2hlbWFzIDogW3NjaGVtYXNdO1xuICAgICAgICAgICAgICAgIHNjaGVtYXMucHVzaChPRkZMSU5FX1dBVkVNQUtFUl9EQVRBQkFTRV9TQ0hFTUEpO1xuICAgICAgICAgICAgICAgIHNjaGVtYXMubWFwKHMgPT4gdGhpcy5jb21wYWN0U2NoZW1hKHMpKVxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaChzID0+ICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YVtzLnNjaGVtYS5uYW1lXSA9IHM7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXRhZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgbmFtZWQgcXVlcmllcyBmcm9tICpfcXVlcnkuanNvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Kn0gbWV0YWRhdGFcbiAgICAgKiBAcmV0dXJucyB7Kn0gQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aCBtZXRhZGF0YVxuICAgICAqL1xuICAgIHByaXZhdGUgbG9hZE5hbWVkUXVlcmllcyhtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRNZXRhSW5mbygvLitfcXVlcnlcXC5qc29uJC8pXG4gICAgICAgICAgICAudGhlbigocXVlcmllc0J5REJzOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBxdWVyaWVzQnlEQnMgPSBfLmlzQXJyYXkocXVlcmllc0J5REJzKSA/IHF1ZXJpZXNCeURCcyA6IFtxdWVyaWVzQnlEQnNdO1xuICAgICAgICAgICAgICAgIHF1ZXJpZXNCeURCcy5tYXAoZSA9PiBtZXRhZGF0YVtlLm5hbWVdLnF1ZXJpZXMgPSB0aGlzLmNvbXBhY3RRdWVyaWVzKGUpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWV0YWRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIG9mZmxpbmUgY29uZmlndXJhdGlvbiBmcm9tICpfb2ZmbGluZS5qc29uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHsqfSBtZXRhZGF0YVxuICAgICAqIEByZXR1cm5zIHsqfSBBIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIG1ldGFkYXRhXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkT2ZmbGluZUNvbmZpZyhtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRNZXRhSW5mbygvLitfb2ZmbGluZVxcLmpzb24kLylcbiAgICAgICAgICAgIC50aGVuKGNvbmZpZ3MgPT4ge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChjb25maWdzLCBjb25maWcgPT4ge1xuICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2goY29uZmlnLmVudGl0aWVzLCBlbnRpdHlDb25maWcgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW50aXR5U2NoZW1hID0gXy5maW5kKG1ldGFkYXRhW2NvbmZpZy5uYW1lXS5zY2hlbWEuZW50aXRpZXMsIHNjaGVtYSA9PiBzY2hlbWEubmFtZSA9PT0gZW50aXR5Q29uZmlnLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5hc3NpZ25JbihlbnRpdHlTY2hlbWEsIGVudGl0eUNvbmZpZyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXRhZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9nU3FsKHNxbGl0ZU9iamVjdDogU1FMaXRlT2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IGxvZ2dlciA9IGNvbnNvbGUsXG4gICAgICAgICAgICBvcmlnaW5hbEV4ZWN1dGVTcWwgPSBzcWxpdGVPYmplY3QuZXhlY3V0ZVNxbDtcbiAgICAgICAgc3FsaXRlT2JqZWN0LmV4ZWN1dGVTcWwgPSAoc3FsLCBwYXJhbXMsIGxvZ091dHB1dD86IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IF8ubm93KCk7XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxFeGVjdXRlU3FsLmNhbGwoc3FsaXRlT2JqZWN0LCBzcWwsIHBhcmFtcykudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChsb2dPdXRwdXQgfHwgdGhpcy5fbG9nU3FsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9iakFyciA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm93Q291bnQgPSByZXN1bHQucm93cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm93Q291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqQXJyLnB1c2gocmVzdWx0LnJvd3MuaXRlbShpKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdTUUwgXCIlc1wiICB3aXRoIHBhcmFtcyAlTyB0b29rIFslZCBtc10uIEFuZCB0aGUgcmVzdWx0IGlzICVPJywgc3FsLCBwYXJhbXMsIF8ubm93KCkgLSBzdGFydFRpbWUsIG9iakFycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdTUUwgXCIlc1wiIHdpdGggcGFyYW1zICVPIGZhaWxlZCB3aXRoIGVycm9yIG1lc3NhZ2UgJXMnLCBzcWwsIHBhcmFtcywgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNRTGl0ZSBkb2VzIG5vdCBzdXBwb3J0IGJvb2xlYW4gZGF0YS4gSW5zdGVhZCBvZiB1c2luZyBib29sZWFuIHZhbHVlcywgZGF0YSB3aWxsIGJlIGNoYW5nZWQgdG8gMCBvciAxLlxuICAgICAqIElmIHRoZSB2YWx1ZSBpcyAndHJ1ZScsIHRoZW4gMSBpcyBzZXQgYXMgdmFsdWUuIElmIHZhbHVlIGlzIG5vdCAxIG5vciBudWxsLCB0aGVuIGNvbHVtbiB2YWx1ZSBpcyBzZXQgYXMgMC5cbiAgICAgKiBAcGFyYW0gZGJOYW1lXG4gICAgICogQHBhcmFtIHRhYmxlTmFtZVxuICAgICAqIEBwYXJhbSBjb2xOYW1lXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgcHJpdmF0ZSBub3JtYWxpemVCb29sZWFuRGF0YShkYk5hbWUsIHRhYmxlTmFtZSwgY29sTmFtZSkge1xuICAgICAgICBjb25zdCB0cnVlVG8xUXVlcnkgPSBgdXBkYXRlICR7ZXNjYXBlTmFtZSh0YWJsZU5hbWUpfSBzZXQgJHtlc2NhcGVOYW1lKGNvbE5hbWUpfSA9IDEgd2hlcmUgJHtlc2NhcGVOYW1lKGNvbE5hbWUpfSA9ICd0cnVlJ2AsXG4gICAgICAgICAgICBleGNlcHROdWxsQW5kMXRvMFF1ZXJ5ID0gYHVwZGF0ZSAke2VzY2FwZU5hbWUodGFibGVOYW1lKX0gc2V0ICR7ZXNjYXBlTmFtZShjb2xOYW1lKX0gPSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlcmUgJHtlc2NhcGVOYW1lKGNvbE5hbWUpfSBpcyBub3QgbnVsbCBhbmQgJHtlc2NhcGVOYW1lKGNvbE5hbWUpfSAhPSAxYDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZVNRTFF1ZXJ5KGRiTmFtZSwgdHJ1ZVRvMVF1ZXJ5KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5leGVjdXRlU1FMUXVlcnkoZGJOYW1lLCBleGNlcHROdWxsQW5kMXRvMFF1ZXJ5KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgZGF0YSB0byBzdXBwb3J0IFNRTGl0ZS5cbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBwcml2YXRlIG5vcm1hbGl6ZURhdGEoKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChfLm1hcCh0aGlzLmRhdGFiYXNlcywgZGF0YWJhc2UgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKF8ubWFwKGRhdGFiYXNlLnNjaGVtYS5lbnRpdGllcywgZW50aXR5U2NoZW1hID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXy5tYXAoZW50aXR5U2NoZW1hLmNvbHVtbnMsIGNvbHVtbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2x1bW4uc3FsVHlwZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVCb29sZWFuRGF0YShkYXRhYmFzZS5zY2hlbWEubmFtZSwgZW50aXR5U2NoZW1hLm5hbWUsIGNvbHVtbi5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb3BlbkRhdGFiYXNlKGRhdGFiYXNlOiBEQkluZm8pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsaXRlLmNyZWF0ZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogZGF0YWJhc2Uuc2NoZW1hLm5hbWUgKyAnLmRiJyxcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogJ2RlZmF1bHQnXG4gICAgICAgIH0pLnRoZW4oc3FsaXRlT2JqZWN0ID0+IHtcbiAgICAgICAgICAgIGRhdGFiYXNlLnNxbGl0ZU9iamVjdCA9IHNxbGl0ZU9iamVjdDtcbiAgICAgICAgICAgIHRoaXMubG9nU3FsKHNxbGl0ZU9iamVjdCk7XG4gICAgICAgICAgICBjb25zdCBzdG9yZVByb21pc2VzID0gXy5tYXAoZGF0YWJhc2Uuc2NoZW1hLmVudGl0aWVzLCBlbnRpdHlTY2hlbWEgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0b3JlID0gbmV3IExvY2FsREJTdG9yZSh0aGlzLmRldmljZUZpbGVTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICBlbnRpdHlTY2hlbWEsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgc3FsaXRlT2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0b3JlLmNyZWF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoc3RvcmVQcm9taXNlcykudGhlbihzdG9yZXMgPT4ge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChzdG9yZXMsIHN0b3JlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YWJhc2Uuc3RvcmVzW3N0b3JlLmVudGl0eVNjaGVtYS5lbnRpdHlOYW1lXSA9IHN0b3JlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhYmFzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGVuIGFwcCBpcyBvcGVuZWQgZm9yIGZpcnN0IHRpbWUgIGFmdGVyIGEgZnJlc2ggaW5zdGFsbCBvciB1cGRhdGUsIHRoZW4gb2xkIGRhdGFiYXNlcyBhcmUgcmVtb3ZlZCBhbmRcbiAgICAgKiBuZXcgZGF0YWJhc2VzIGFyZSBjcmVhdGVkIHVzaW5nIGJ1bmRsZWQgZGF0YWJhc2VzLlxuICAgICAqXG4gICAgICogQHJldHVybnMgeyp9IGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggdHJ1ZSwgaWYgdGhlIGRhdGFiYXNlcyBhcmUgbmV3bHkgY3JlYXRlZCBvciByZXNvbHZlZCB3aXRoIGZhbHNlXG4gICAgICogaWYgZXhpc3RpbmcgZGF0YWJhc2VzIGFyZSBiZWluZyB1c2VkLlxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0VXBEYXRhYmFzZXMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRldmljZVNlcnZpY2UuZ2V0QXBwQnVpbGRUaW1lKClcbiAgICAgICAgICAgIC50aGVuKChidWlsZFRpbWUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYkluZm8gPSB0aGlzLmRldmljZVNlcnZpY2UuZ2V0RW50cnkoJ2RhdGFiYXNlJykgfHwge307XG4gICAgICAgICAgICAgICAgaWYgKCFkYkluZm8ubGFzdEJ1aWxkVGltZSB8fCBkYkluZm8ubGFzdEJ1aWxkVGltZSAhPT0gYnVpbGRUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFuQW5kQ29weURhdGFiYXNlcygpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGJJbmZvLmxhc3RCdWlsZFRpbWUgPSBidWlsZFRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlU2VydmljZS5zdG9yZUVudHJ5KCdkYXRhYmFzZScsIGRiSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=