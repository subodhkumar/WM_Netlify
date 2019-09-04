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
var NEXT_ID_COUNT = 'localDBStore.nextIdCount';
var META_LOCATION = 'www/metadata/app';
var OFFLINE_WAVEMAKER_DATABASE_SCHEMA = {
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
var LocalDBManagementService = /** @class */ (function () {
    function LocalDBManagementService(appVersion, deviceService, deviceFileService, file, localKeyValueService, securityService, sqlite) {
        var _this = this;
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
                'value': function () { return _this.securityService.getLoggedInUser().then(function (userInfo) { return userInfo.userId; }); }
            },
            'USER_NAME': {
                'name': 'USER_NAME',
                'value': function () { return _this.securityService.getLoggedInUser().then(function (userInfo) { return userInfo.userName; }); }
            },
            'DATE_TIME': {
                'name': 'DATE_TIME',
                'value': function () { return moment().format('YYYY-MM-DDThh:mm:ss'); }
            },
            'DATE': {
                'name': 'CURRENT_DATE',
                'value': function () { return moment().format('YYYY-MM-DD'); }
            },
            'TIME': {
                'name': 'TIME',
                'value': function () { return moment().format('hh:mm:ss'); }
            }
        };
    }
    /**
     * Closes all databases.
     *
     * @returns {object} a promise.
     */
    LocalDBManagementService.prototype.close = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // Before closing databases, give some time for the pending transactions (if any).
            setTimeout(function () {
                var closePromises = _.map(_.values(_this.databases), function (db) { return db.sqliteObject.close(); });
                Promise.all(closePromises).then(resolve, reject);
            }, 1000);
        });
    };
    LocalDBManagementService.prototype.nextIdCount = function () {
        this.nextId = this.nextId + 1;
        this.localKeyValueService.put(NEXT_ID_COUNT, this.nextId);
        return this.nextId;
    };
    /**
     * Executes a named query.
     *
     * @param {string} dbName name of database on which the named query has to be run
     * @param {string} queryName name of the query to execute
     * @param {object} params parameters required for query.
     * @returns {object} a promise.
     */
    LocalDBManagementService.prototype.executeNamedQuery = function (dbName, queryName, params) {
        var _this = this;
        var queryData, paramPromises;
        if (!this.databases[dbName] || !this.databases[dbName].queries[queryName]) {
            return Promise.reject("Query by name ' " + queryName + " ' Not Found");
        }
        queryData = this.databases[dbName].queries[queryName];
        paramPromises = _.chain(queryData.params)
            .filter(function (p) { return p.variableType !== 'PROMPT'; })
            .forEach(function (p) {
            var paramValue = _this.systemProperties[p.variableType].value(p.name, params);
            return toPromise(paramValue).then(function (v) { return params[p.name] = v; });
        }).value();
        return Promise.all(paramPromises).then(function () {
            params = _.map(queryData.params, function (p) {
                // Sqlite will accept DateTime value as below format.
                if (typeof params[p.name] !== 'string'
                    && (p.type === DataType.DATETIME || p.type === DataType.LOCALDATETIME)) {
                    return formatDate(params[p.name], p.type);
                }
                // sqlite accepts the bool val as 1,0 hence convert the boolean value to number
                if (p.type === DataType.BOOLEAN) {
                    return _this.convertBoolToInt(params[p.name]);
                }
                return params[p.name];
            });
            return _this.executeSQLQuery(dbName, queryData.query, params)
                .then(function (result) {
                var firstRow, needTransform;
                if (!_.isEmpty(result.rows)) {
                    firstRow = result.rows[0];
                    needTransform = _.find(queryData.response.properties, function (p) { return !firstRow.hasOwnProperty(p.fieldName); });
                    if (!_.isUndefined(needTransform)) {
                        result.rows = _.map(result.rows, function (row) {
                            var transformedRow = {}, rowWithUpperKeys = {};
                            // This is to make search for data as case-insensitive
                            _.forEach(row, function (v, k) { return rowWithUpperKeys[k.toUpperCase()] = v; });
                            _.forEach(queryData.response.properties, function (p) {
                                // format the value depending on the typeRef specified in properties.
                                var propType = extractType(p.fieldType.typeRef);
                                var formatValue = DEFAULT_FORMATS[_.toUpper(propType)];
                                var fieldVal = row[p.name];
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
                                    row[p.name] = _this.convertIntToBool(fieldVal);
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
    };
    /**
     * This function will export the databases in a zip format.
     *
     * @returns {object} a promise that is resolved when zip is created.
     */
    LocalDBManagementService.prototype.exportDB = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var folderToExport = 'offline_temp_' + _.now(), folderToExportFullPath = cordova.file.cacheDirectory + folderToExport + '/', zipFileName = '_offline_data.zip', metaInfo = {
                app: null,
                OS: '',
                createdOn: 0
            };
            var zipDirectory;
            if (isIos()) {
                // In IOS, save zip to documents directory so that user can export the file from IOS devices using iTUNES.
                zipDirectory = cordova.file.documentsDirectory;
            }
            else {
                // In Android, save zip to download directory.
                zipDirectory = cordova.file.externalRootDirectory + 'Download/';
            }
            // Create a temporary folder to copy all the content to export
            _this.file.createDir(cordova.file.cacheDirectory, folderToExport, false)
                .then(function () {
                // Copy databases to temporary folder for export
                return _this.file.copyDir(_this.dbInstallParentDirectory, _this.dbInstallDirectoryName, folderToExportFullPath, 'databases')
                    .then(function () {
                    // Prepare meta info to identify the zip and other info
                    return _this.getAppInfo();
                }).then(function (appInfo) {
                    metaInfo.app = appInfo;
                    if (isIos()) {
                        metaInfo.OS = 'IOS';
                    }
                    else if (isAndroid()) {
                        metaInfo.OS = 'ANDROID';
                    }
                    metaInfo.createdOn = _.now();
                    return metaInfo;
                }).then(function () { return executePromiseChain(_this.getCallbacksFor('preExport'), [folderToExportFullPath, metaInfo]); })
                    .then(function () {
                    // Write meta data to META.json
                    return _this.file.writeFile(folderToExportFullPath, 'META.json', JSON.stringify(metaInfo));
                });
            }).then(function () {
                // Prepare name to use for the zip.
                var appName = metaInfo.app.name;
                appName = appName.replace(/\s+/g, '_');
                return _this.deviceFileService.newFileName(zipDirectory, appName + zipFileName)
                    .then(function (fileName) {
                    // Zip the temporary folder for export
                    return new Promise(function (rs, re) {
                        Zeep.zip({
                            from: folderToExportFullPath,
                            to: zipDirectory + fileName
                        }, function () { return rs(zipDirectory + fileName); }, re);
                    });
                });
            }).then(resolve, reject)
                .catch(noop).then(function () {
                // Remove temporary folder for export
                return _this.deviceFileService.removeDir(cordova.file.cacheDirectory + folderToExport);
            });
        });
    };
    /**
     *  returns store bound to the dataModelName and entityName.
     *
     * @param dataModelName
     * @param entityName
     * @returns {*}
     */
    LocalDBManagementService.prototype.getStore = function (dataModelName, entityName) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.databases[dataModelName]) {
                resolve(_this.databases[dataModelName].stores[entityName]);
            }
            reject("store with name'" + entityName + "' in datamodel '" + dataModelName + "' is not found");
        });
    };
    /**
     * This function will replace the databases with the files provided in zip. If import gets failed,
     * then app reverts back to use old databases.
     *
     * @param {string} zipPath location of the zip file.
     * @param {boolean} revertIfFails If true, then a backup is created and when import fails, backup is reverted back.
     * @returns {object} a promise that is resolved when zip is created.
     */
    LocalDBManagementService.prototype.importDB = function (zipPath, revertIfFails) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var importFolder = 'offline_temp_' + _.now(), importFolderFullPath = cordova.file.cacheDirectory + importFolder + '/';
            var zipMeta;
            // Create a temporary folder to unzip the contents of the zip.
            _this.file.createDir(cordova.file.cacheDirectory, importFolder, false)
                .then(function () {
                return new Promise(function (rs, re) {
                    // Unzip to temporary location
                    Zeep.unzip({
                        from: zipPath,
                        to: importFolderFullPath
                    }, rs, re);
                });
            }).then(function () {
                /*
                 * read meta data and allow import only package name of the app from which this zip is created
                 * and the package name of this app are same.
                 */
                return _this.file.readAsText(importFolderFullPath, 'META.json')
                    .then(function (text) {
                    zipMeta = JSON.parse(text);
                    return _this.getAppInfo();
                }).then(function (appInfo) {
                    if (!zipMeta.app) {
                        return Promise.reject('meta information is not found in zip');
                    }
                    if (zipMeta.app.packageName !== appInfo.packageName) {
                        return Promise.reject('database zip of app with same package name can only be imported');
                    }
                });
            }).then(function () {
                var backupZip;
                return _this.close()
                    .then(function () {
                    if (revertIfFails) {
                        // create backup
                        return _this.exportDB()
                            .then(function (path) { return backupZip = path; });
                    }
                }).then(function () {
                    // delete existing databases
                    return _this.deviceFileService.removeDir(_this.dbInstallDirectory);
                }).then(function () {
                    // copy imported databases
                    return _this.file.copyDir(importFolderFullPath, 'databases', _this.dbInstallParentDirectory, _this.dbInstallDirectoryName);
                }).then(function () {
                    // reload databases
                    _this.databases = null;
                    return _this.loadDatabases();
                }).then(function () { return executePromiseChain(_this.getCallbacksFor('postImport'), [importFolderFullPath, zipMeta]); })
                    .then(function () {
                    if (backupZip) {
                        return _this.deviceFileService.removeFile(backupZip);
                    }
                }, function (reason) {
                    if (backupZip) {
                        return _this.importDB(backupZip, false)
                            .then(function () {
                            _this.deviceFileService.removeFile(backupZip);
                            return Promise.reject(reason);
                        });
                    }
                    return Promise.reject(reason);
                });
            }).then(resolve, reject)
                .catch(noop)
                .then(function () {
                return _this.deviceFileService.removeDir(cordova.file.cacheDirectory + importFolder);
            });
        });
    };
    /**
     * @param {string} dataModelName Name of the data model
     * @param {string} entityName Name of the entity
     * @param {string} operation Name of the operation (READ, INSERT, UPDATE, DELETE)
     * @returns {boolean} returns true, if the given operation can be performed as per configuration.
     */
    LocalDBManagementService.prototype.isOperationAllowed = function (dataModelName, entityName, operation) {
        return this.getStore(dataModelName, entityName).then(function (store) {
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
        }).catch(function () {
            return false;
        });
    };
    LocalDBManagementService.prototype.loadDatabases = function () {
        var _this = this;
        var newDatabasesCreated = false;
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
                .then(function (flag) { return newDatabasesCreated = flag; })
                .then(function () { return _this.loadDBSchemas(); })
                .then(function (metadata) { return _this.loadNamedQueries(metadata); })
                .then(function (metadata) { return _this.loadOfflineConfig(metadata); })
                .then(function (metadata) {
                return Promise.all(_.map(metadata, function (dbMetadata) {
                    return _this.openDatabase(dbMetadata)
                        .then(function (database) {
                        _this.databases[dbMetadata.schema.name] = database;
                    });
                }));
            }).then(function () {
                return _this.getStore('wavemaker', 'key-value').then(function (store) {
                    _this.localKeyValueService.init(store);
                    return _this.localKeyValueService.get(NEXT_ID_COUNT).then(function (val) {
                        _this.nextId = val || _this.nextId;
                    });
                });
            }).then(function () {
                if (newDatabasesCreated) {
                    return _this.normalizeData()
                        .then(function () { return _this.disableForeignKeys(); })
                        .then(function () { return _this.deviceService.getAppBuildTime(); })
                        .then(function (dbSeedCreationTime) {
                        return executePromiseChain(_.map(_this.callbacks, 'onDbCreate'), [{
                                'databases': _this.databases,
                                'dbCreatedOn': _.now(),
                                'dbSeedCreatedOn': dbSeedCreationTime
                            }]);
                    }).then(function () { return _this.databases; });
                }
                else {
                    return _this.databases;
                }
            });
        }
    };
    /**
     * using this function one can listen events such as onDbCreate, 'preExport' and 'postImport'.
     *
     * @param {object} listener an object with functions mapped to event names.
     */
    LocalDBManagementService.prototype.registerCallback = function (listener) {
        this.callbacks.push(listener);
    };
    LocalDBManagementService.prototype.setLogSQl = function (flag) {
        this._logSql = flag;
    };
    /**
     * Deletes any existing databases (except wavemaker db) and copies the databases that are packaged with the app.
     *
     * @returns {*}
     */
    LocalDBManagementService.prototype.cleanAndCopyDatabases = function () {
        var _this = this;
        var dbSeedFolder = cordova.file.applicationDirectory + META_LOCATION;
        return this.file.createDir(this.dbInstallParentDirectory, this.dbInstallDirectoryName, false)
            .catch(noop)
            .then(function () { return _this.deviceFileService.listFiles(_this.dbInstallDirectory, /.+\.db$/); })
            .then(function (files) {
            if (files && files.length > 0) {
                return Promise.all(files.map(function (f) {
                    if (f['name'] !== 'wavemaker.db') {
                        return _this.file.removeFile(_this.dbInstallDirectory, f['name']);
                    }
                }));
            }
        })
            .then(function () { return _this.deviceFileService.listFiles(dbSeedFolder, /.+\.db$/); })
            .then(function (files) {
            if (files && files.length > 0) {
                return _this.file.createDir(_this.dbInstallParentDirectory, _this.dbInstallDirectoryName, false)
                    .catch(noop)
                    .then(function () { return Promise.all(files.map(function (f) { return _this.file.copyFile(dbSeedFolder, f['name'], _this.dbInstallDirectory, f['name']); })); });
            }
        });
    };
    // Picks essential details from the given schema.
    LocalDBManagementService.prototype.compactEntitySchema = function (schema, entity, transformedSchemas) {
        var reqEntity = transformedSchemas[entity['entityName']];
        reqEntity.entityName = entity['entityName'];
        reqEntity.name = entity['name'];
        reqEntity.columns = [];
        entity.columns.forEach(function (col) {
            var defaultValue = col.columnValue ? col.columnValue.defaultValue : '';
            var type = col.sqlType;
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
        _.forEach(entity.relations, function (r) {
            var targetEntitySchema, targetEntity, col, sourceColumn, mapping;
            if (r.cardinality === 'ManyToOne' || r.cardinality === 'OneToOne') {
                targetEntity = _.find(schema.tables, function (t) { return t.name === r.targetTable; });
                mapping = r.mappings[0];
                if (targetEntity) {
                    targetEntity = targetEntity.entityName;
                    sourceColumn = mapping.sourceColumn;
                    col = reqEntity.columns.find(function (column) { return column.name === sourceColumn; });
                    targetEntitySchema = schema.tables.find(function (table) { return table.name === r.targetTable; });
                    var foreignRelation_1 = {
                        sourceFieldName: r.fieldName,
                        targetEntity: targetEntity,
                        targetTable: r.targetTable,
                        targetColumn: mapping.targetColumn,
                        targetPath: '',
                        dataMapper: [],
                        targetFieldName: targetEntitySchema.columns.find(function (column) { return column.name === mapping.targetColumn; }).fieldName
                    };
                    foreignRelation_1.targetPath = foreignRelation_1.sourceFieldName + '.' + foreignRelation_1.targetFieldName;
                    foreignRelation_1.dataMapper = _.chain(targetEntitySchema.columns)
                        .keyBy(function (childCol) { return foreignRelation_1.sourceFieldName + '.' + childCol.fieldName; })
                        .mapValues(function (childCol) { return new ColumnInfo(childCol.name, childCol.fieldName); }).value();
                    col.foreignRelations = col.foreignRelations || [];
                    col.foreignRelations.push(foreignRelation_1);
                }
            }
        });
        return reqEntity;
    };
    // Loads necessary details of queries
    LocalDBManagementService.prototype.compactQueries = function (queriesByDB) {
        var _this = this;
        var queries = new Map();
        _.forEach(queriesByDB.queries, function (queryData) {
            var query, params;
            if (queryData.nativeSql && queryData.type === 'SELECT') {
                query = _.isEmpty(queryData.offlineQueryString) ? queryData.queryString : queryData.offlineQueryString;
                params = _.map(_this.extractQueryParams(query), function (p) {
                    var paramObj = _.find(queryData.parameters, { 'name': p });
                    return {
                        name: paramObj.name,
                        type: paramObj.type,
                        variableType: paramObj.variableType
                    };
                });
                params.forEach(function (p) { return query = _.replace(query, ':' + p.name, '?'); });
                queries[queryData.name] = {
                    name: queryData.name,
                    query: query,
                    params: params,
                    response: {
                        properties: _.map(queryData.response.properties, function (p) {
                            p.nameInUpperCase = p.name.toUpperCase();
                            return p;
                        })
                    }
                };
            }
        });
        return queries;
    };
    // Loads necessary details of remote schema
    LocalDBManagementService.prototype.compactSchema = function (schema) {
        var _this = this;
        var dbInfo = new DBInfo();
        var transformedSchemas = new Map();
        schema.tables.forEach(function (entitySchema) {
            transformedSchemas[entitySchema.entityName] = {};
        });
        schema.tables.forEach(function (entitySchema) {
            _this.compactEntitySchema(schema, entitySchema, transformedSchemas);
        });
        dbInfo.schema.name = schema.name;
        dbInfo.schema.isInternal = schema.isInternal;
        dbInfo.schema.entities = transformedSchemas;
        return dbInfo;
    };
    LocalDBManagementService.prototype.convertBoolToInt = function (bool) {
        return _.toString(bool) === 'true' ? 1 : 0;
    };
    LocalDBManagementService.prototype.convertIntToBool = function (int) {
        return int ? true : false;
    };
    /**
     * Turns off foreign keys
     * @returns {*}
     */
    LocalDBManagementService.prototype.disableForeignKeys = function () {
        var _this = this;
        return Promise.all(_.map(this.databases, function (db) {
            return _this.executeSQLQuery(db.schema.name, 'PRAGMA foreign_keys = OFF');
        }));
    };
    /**
     * Executes SQL query;
     *
     * @param dbName
     * @param sql
     * @param params
     * @returns {*}
     */
    LocalDBManagementService.prototype.executeSQLQuery = function (dbName, sql, params, logOutput) {
        var db = this.databases[dbName];
        if (db) {
            return db.sqliteObject.executeSql(sql, params, logOutput)
                .then(function (result) {
                var data = [], rows = result.rows;
                for (var i = 0; i < rows.length; i++) {
                    data.push(rows.item(i));
                }
                return {
                    'rowsAffected': result.rowsAffected,
                    'rows': data
                };
            });
        }
        return Promise.reject("No Database with name " + dbName + " found");
    };
    // get the params of the query or procedure.
    LocalDBManagementService.prototype.extractQueryParams = function (query) {
        var params, aliasParams;
        aliasParams = query.match(/[^"'\w\\]:\s*\w+\s*/g) || [];
        if (aliasParams.length) {
            params = aliasParams.map(function (x) { return (/[=|\W]/g.test(x)) ? x.replace(/\W/g, '').trim() : x.trim(); });
        }
        else {
            params = null;
        }
        return params;
    };
    /**
     * Returns a promise that is resolved with application info such as packageName, appName, versionNumber, versionCode.
     * @returns {*}
     */
    LocalDBManagementService.prototype.getAppInfo = function () {
        var _this = this;
        var appInfo = {
            name: '',
            packageName: '',
            versionNumber: '',
            versionCode: null
        };
        return this.appVersion.getPackageName()
            .then(function (packageName) {
            appInfo.packageName = packageName;
            return _this.appVersion.getAppName();
        }).then(function (appName) {
            appInfo.name = appName;
            return _this.appVersion.getVersionNumber();
        }).then(function (versionNumber) {
            appInfo.versionNumber = versionNumber;
            return _this.appVersion.getVersionCode();
        }).then(function (versionCode) {
            appInfo.versionCode = versionCode;
            return appInfo;
        });
    };
    LocalDBManagementService.prototype.getCallbacksFor = function (event) {
        return this.callbacks.map(function (c) {
            if (c[event]) {
                return c[event].bind(c);
            }
            return null;
        });
    };
    /**
     * Searches for the files with given regex in 'www/metadata/app'and returns an array that contains the JSON
     * content present in each file.
     *
     * @param {string} fileNameRegex regex pattern to search for files.
     * @returns {*} A promise that is resolved with an array
     */
    LocalDBManagementService.prototype.getMetaInfo = function (fileNameRegex) {
        var folder = cordova.file.applicationDirectory + META_LOCATION + '/';
        return this.deviceFileService.listFiles(folder, fileNameRegex)
            .then(function (files) { return Promise.all(_.map(files, function (f) {
            return new Promise(function (resolve, reject) {
                // Cordova File reader has buffer issues with large files.
                // so, using ajax to retrieve local json
                $.getJSON(folder + f['name'], function (data) { return resolve(data); });
            });
        })); });
    };
    /**
     * Returns true, if the given entity's data is bundled along with application installer.
     * @param dataModelName name of the data model
     * @param entityName name of the entity
     * @returns {Promise<any>}
     */
    LocalDBManagementService.prototype.isBundled = function (dataModelName, entityName) {
        return this.getStore(dataModelName, entityName).then(function (store) {
            return store.entitySchema.pullConfig.pullType === PullType.BUNDLED;
        });
    };
    /**
     * Loads local database schemas from *_data_model.json.
     *
     * @returns {*} A promise that is resolved with metadata.
     */
    LocalDBManagementService.prototype.loadDBSchemas = function () {
        var _this = this;
        return this.getMetaInfo(/.+_dataModel\.json$/)
            .then(function (schemas) {
            var metadata = new Map();
            schemas = isArray(schemas) ? schemas : [schemas];
            schemas.push(OFFLINE_WAVEMAKER_DATABASE_SCHEMA);
            schemas.map(function (s) { return _this.compactSchema(s); })
                .forEach(function (s) {
                metadata[s.schema.name] = s;
            });
            return metadata;
        });
    };
    /**
     * Load named queries from *_query.json.
     *
     * @param {*} metadata
     * @returns {*} A promise that is resolved with metadata
     */
    LocalDBManagementService.prototype.loadNamedQueries = function (metadata) {
        var _this = this;
        return this.getMetaInfo(/.+_query\.json$/)
            .then(function (queriesByDBs) {
            queriesByDBs = _.isArray(queriesByDBs) ? queriesByDBs : [queriesByDBs];
            queriesByDBs.map(function (e) { return metadata[e.name].queries = _this.compactQueries(e); });
            return metadata;
        });
    };
    /**
     * Load offline configuration from *_offline.json.
     *
     * @param {*} metadata
     * @returns {*} A promise that is resolved with metadata
     */
    LocalDBManagementService.prototype.loadOfflineConfig = function (metadata) {
        return this.getMetaInfo(/.+_offline\.json$/)
            .then(function (configs) {
            _.forEach(configs, function (config) {
                _.forEach(config.entities, function (entityConfig) {
                    var entitySchema = _.find(metadata[config.name].schema.entities, function (schema) { return schema.name === entityConfig.name; });
                    _.assignIn(entitySchema, entityConfig);
                });
            });
            return metadata;
        });
    };
    LocalDBManagementService.prototype.logSql = function (sqliteObject) {
        var _this = this;
        var logger = console, originalExecuteSql = sqliteObject.executeSql;
        sqliteObject.executeSql = function (sql, params, logOutput) {
            var startTime = _.now();
            return originalExecuteSql.call(sqliteObject, sql, params).then(function (result) {
                if (logOutput || _this._logSql) {
                    var objArr = [], rowCount = result.rows.length;
                    for (var i = 0; i < rowCount; i++) {
                        objArr.push(result.rows.item(i));
                    }
                    logger.debug('SQL "%s"  with params %O took [%d ms]. And the result is %O', sql, params, _.now() - startTime, objArr);
                }
                return result;
            }, function (error) {
                logger.error('SQL "%s" with params %O failed with error message %s', sql, params, error.message);
                return Promise.reject(error);
            });
        };
    };
    /**
     * SQLite does not support boolean data. Instead of using boolean values, data will be changed to 0 or 1.
     * If the value is 'true', then 1 is set as value. If value is not 1 nor null, then column value is set as 0.
     * @param dbName
     * @param tableName
     * @param colName
     * @returns {*}
     */
    LocalDBManagementService.prototype.normalizeBooleanData = function (dbName, tableName, colName) {
        var _this = this;
        var trueTo1Query = "update " + escapeName(tableName) + " set " + escapeName(colName) + " = 1 where " + escapeName(colName) + " = 'true'", exceptNullAnd1to0Query = "update " + escapeName(tableName) + " set " + escapeName(colName) + " = 0\n                                  where " + escapeName(colName) + " is not null and " + escapeName(colName) + " != 1";
        return this.executeSQLQuery(dbName, trueTo1Query)
            .then(function () { return _this.executeSQLQuery(dbName, exceptNullAnd1to0Query); });
    };
    /**
     * Converts data to support SQLite.
     * @returns {*}
     */
    LocalDBManagementService.prototype.normalizeData = function () {
        var _this = this;
        return Promise.all(_.map(this.databases, function (database) {
            return Promise.all(_.map(database.schema.entities, function (entitySchema) {
                return Promise.all(_.map(entitySchema.columns, function (column) {
                    if (column.sqlType === 'boolean') {
                        return _this.normalizeBooleanData(database.schema.name, entitySchema.name, column.name);
                    }
                }));
            }));
        }));
    };
    LocalDBManagementService.prototype.openDatabase = function (database) {
        var _this = this;
        return this.sqlite.create({
            name: database.schema.name + '.db',
            location: 'default'
        }).then(function (sqliteObject) {
            database.sqliteObject = sqliteObject;
            _this.logSql(sqliteObject);
            var storePromises = _.map(database.schema.entities, function (entitySchema) {
                var store = new LocalDBStore(_this.deviceFileService, entitySchema, _this.file, _this, sqliteObject);
                return store.create();
            });
            return Promise.all(storePromises).then(function (stores) {
                _.forEach(stores, function (store) {
                    database.stores[store.entitySchema.entityName] = store;
                });
                return database;
            });
        });
    };
    /**
     * When app is opened for first time  after a fresh install or update, then old databases are removed and
     * new databases are created using bundled databases.
     *
     * @returns {*} a promise that is resolved with true, if the databases are newly created or resolved with false
     * if existing databases are being used.
     */
    LocalDBManagementService.prototype.setUpDatabases = function () {
        var _this = this;
        return this.deviceService.getAppBuildTime()
            .then(function (buildTime) {
            var dbInfo = _this.deviceService.getEntry('database') || {};
            if (!dbInfo.lastBuildTime || dbInfo.lastBuildTime !== buildTime) {
                return _this.cleanAndCopyDatabases()
                    .then(function () {
                    dbInfo.lastBuildTime = buildTime;
                    return _this.deviceService.storeEntry('database', dbInfo);
                }).then(function () { return true; });
            }
            return false;
        });
    };
    LocalDBManagementService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    LocalDBManagementService.ctorParameters = function () { return [
        { type: AppVersion },
        { type: DeviceService },
        { type: DeviceFileService },
        { type: File },
        { type: LocalKeyValueService },
        { type: SecurityService },
        { type: SQLite }
    ]; };
    LocalDBManagementService.ngInjectableDef = i0.defineInjectable({ factory: function LocalDBManagementService_Factory() { return new LocalDBManagementService(i0.inject(i1.AppVersion), i0.inject(i2.DeviceService), i0.inject(i2.DeviceFileService), i0.inject(i3.File), i0.inject(i4.LocalKeyValueService), i0.inject(i5.SecurityService), i0.inject(i6.SQLite)); }, token: LocalDBManagementService, providedIn: "root" });
    return LocalDBManagementService;
}());
export { LocalDBManagementService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwtZGItbWFuYWdlbWVudC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9vZmZsaW5lLyIsInNvdXJjZXMiOlsic2VydmljZXMvbG9jYWwtZGItbWFuYWdlbWVudC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsTUFBTSxFQUFnQixNQUFNLHNCQUFzQixDQUFDO0FBRTVELE9BQU8sRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ25JLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQy9DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDakUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBOEIsUUFBUSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7Ozs7Ozs7O0FBTzVGLElBQU8sYUFBYSxHQUFHLDBCQUEwQixDQUFDO0FBQ2xELElBQU0sYUFBYSxHQUFHLGtCQUFrQixDQUFDO0FBQ3pDLElBQU0saUNBQWlDLEdBQUc7SUFDdEMsSUFB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O0NBbTRCQyxBQWh6QkQsSUFnekJDO1NBL3lCWSx3QkFBd0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEFwcFZlcnNpb24gfSBmcm9tICdAaW9uaWMtbmF0aXZlL2FwcC12ZXJzaW9uJztcbmltcG9ydCB7IEZpbGUgfSBmcm9tICdAaW9uaWMtbmF0aXZlL2ZpbGUnO1xuaW1wb3J0IHsgU1FMaXRlLCBTUUxpdGVPYmplY3QgfSBmcm9tICdAaW9uaWMtbmF0aXZlL3NxbGl0ZSc7XG5cbmltcG9ydCB7IERhdGFUeXBlLCBERUZBVUxUX0ZPUk1BVFMsIGV4ZWN1dGVQcm9taXNlQ2hhaW4sIGV4dHJhY3RUeXBlLCBpc0FuZHJvaWQsIGlzQXJyYXksIGlzSW9zLCBub29wLCB0b1Byb21pc2UgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBEZXZpY2VGaWxlU2VydmljZSwgRGV2aWNlU2VydmljZSB9IGZyb20gJ0B3bS9tb2JpbGUvY29yZSc7XG5pbXBvcnQgeyBTZWN1cml0eVNlcnZpY2UgfSBmcm9tICdAd20vc2VjdXJpdHknO1xuaW1wb3J0IHsgZm9ybWF0RGF0ZSB9IGZyb20gJ0B3bS92YXJpYWJsZXMnO1xuXG5pbXBvcnQgeyBMb2NhbEtleVZhbHVlU2VydmljZSB9IGZyb20gJy4vbG9jYWwta2V5LXZhbHVlLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9jYWxEQlN0b3JlIH0gZnJvbSAnLi4vbW9kZWxzL2xvY2FsLWRiLXN0b3JlJztcbmltcG9ydCB7IGVzY2FwZU5hbWUgfSBmcm9tICcuLi91dGlscy91dGlscyc7XG5pbXBvcnQgeyBDb2x1bW5JbmZvLCBEQkluZm8sIEVudGl0eUluZm8sIE5hbWVkUXVlcnlJbmZvLCBQdWxsVHlwZSB9IGZyb20gJy4uL21vZGVscy9jb25maWcnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5kZWNsYXJlIGNvbnN0IGNvcmRvdmE7XG5kZWNsYXJlIGNvbnN0IG1vbWVudDtcbmRlY2xhcmUgY29uc3QgWmVlcDtcblxuY29uc3QgIE5FWFRfSURfQ09VTlQgPSAnbG9jYWxEQlN0b3JlLm5leHRJZENvdW50JztcbmNvbnN0IE1FVEFfTE9DQVRJT04gPSAnd3d3L21ldGFkYXRhL2FwcCc7XG5jb25zdCBPRkZMSU5FX1dBVkVNQUtFUl9EQVRBQkFTRV9TQ0hFTUEgPSB7XG4gICAgbmFtZTogJ3dhdmVtYWtlcicsXG4gICAgdmVyc2lvbjogMSxcbiAgICBpc0ludGVybmFsOiB0cnVlLFxuICAgIHRhYmxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAna2V5X3ZhbHVlJyxcbiAgICAgICAgICAgIGVudGl0eU5hbWU6ICdrZXktdmFsdWUnLFxuICAgICAgICAgICAgY29sdW1uczogW3tcbiAgICAgICAgICAgICAgICBmaWVsZE5hbWU6ICdpZCcsXG4gICAgICAgICAgICAgICAgbmFtZTogJ2lkJyxcbiAgICAgICAgICAgICAgICBnZW5lcmF0b3JUeXBlIDogJ2RhdGFiYXNlSWRlbnRpdHknLFxuICAgICAgICAgICAgICAgIHNxbFR5cGUgOiAnbnVtYmVyJyxcbiAgICAgICAgICAgICAgICBwcmltYXJ5S2V5OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgZmllbGROYW1lOiAna2V5JyxcbiAgICAgICAgICAgICAgICBuYW1lOiAna2V5J1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIG5hbWU6ICd2YWx1ZScsXG4gICAgICAgICAgICAgICAgZmllbGROYW1lOiAndmFsdWUnXG4gICAgICAgICAgICB9XVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnb2ZmbGluZUNoYW5nZUxvZycsXG4gICAgICAgICAgICBlbnRpdHlOYW1lOiAnb2ZmbGluZUNoYW5nZUxvZycsXG4gICAgICAgICAgICBjb2x1bW5zOiBbe1xuICAgICAgICAgICAgICAgIGZpZWxkTmFtZTogJ2lkJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnaWQnLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRvclR5cGU6ICdkYXRhYmFzZUlkZW50aXR5JyxcbiAgICAgICAgICAgICAgICBzcWxUeXBlOiAnbnVtYmVyJyxcbiAgICAgICAgICAgICAgICBwcmltYXJ5S2V5OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3NlcnZpY2UnLFxuICAgICAgICAgICAgICAgIGZpZWxkTmFtZTogJ3NlcnZpY2UnXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ29wZXJhdGlvbicsXG4gICAgICAgICAgICAgICAgZmllbGROYW1lOiAnb3BlcmF0aW9uJ1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdwYXJhbXMnLFxuICAgICAgICAgICAgICAgIGZpZWxkTmFtZTogJ3BhcmFtcydcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAndGltZXN0YW1wJyxcbiAgICAgICAgICAgICAgICBmaWVsZE5hbWU6ICd0aW1lc3RhbXAnXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2hhc0Vycm9yJyxcbiAgICAgICAgICAgICAgICBmaWVsZE5hbWU6ICdoYXNFcnJvcidcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnZXJyb3JNZXNzYWdlJyxcbiAgICAgICAgICAgICAgICBmaWVsZE5hbWU6ICdlcnJvck1lc3NhZ2UnXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgXVxufTtcblxuZXhwb3J0IGludGVyZmFjZSBDYWxsQmFjayB7XG4gICAgb25EYkNyZWF0ZT86IChpbmZvOiBhbnkpID0+IGFueTtcbiAgICBwb3N0SW1wb3J0PzogKGltcG9ydEZvbGRlclBhdGg6IHN0cmluZywgbWV0YUluZm86IGFueSkgPT4gYW55O1xuICAgIHByZUV4cG9ydD86IChmb2xkZXJUb0V4cG9ydEZ1bGxQYXRoOiBzdHJpbmcsIG1ldGFJbmZvOiBhbnkpID0+IGFueTtcbn1cblxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgTG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlIHtcblxuICAgIHByaXZhdGUgY2FsbGJhY2tzOiBDYWxsQmFja1tdID0gW107XG4gICAgcHJpdmF0ZSBkYkluc3RhbGxEaXJlY3Rvcnk6IHN0cmluZztcbiAgICBwcml2YXRlIGRiSW5zdGFsbERpcmVjdG9yeU5hbWU6IHN0cmluZztcbiAgICBwcml2YXRlIGRiSW5zdGFsbFBhcmVudERpcmVjdG9yeTogc3RyaW5nO1xuICAgIHByaXZhdGUgZGF0YWJhc2VzOiBNYXA8c3RyaW5nLCBEQkluZm8+O1xuICAgIHByaXZhdGUgX2xvZ1NxbCA9IGZhbHNlO1xuICAgIHB1YmxpYyBuZXh0SWQgPSAxMDAwMDAwMDAwMDA7XG4gICAgcHJpdmF0ZSByZWFkb25seSBzeXN0ZW1Qcm9wZXJ0aWVzID0ge1xuICAgICAgICAnVVNFUl9JRCcgOiB7XG4gICAgICAgICAgICAnbmFtZScgOiAnVVNFUl9JRCcsXG4gICAgICAgICAgICAndmFsdWUnIDogKCkgPT4gdGhpcy5zZWN1cml0eVNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbiggdXNlckluZm8gPT4gdXNlckluZm8udXNlcklkKVxuICAgICAgICB9LFxuICAgICAgICAnVVNFUl9OQU1FJyA6IHtcbiAgICAgICAgICAgICduYW1lJyA6ICdVU0VSX05BTUUnLFxuICAgICAgICAgICAgJ3ZhbHVlJyA6ICgpID0+IHRoaXMuc2VjdXJpdHlTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oIHVzZXJJbmZvID0+IHVzZXJJbmZvLnVzZXJOYW1lKVxuICAgICAgICB9LFxuICAgICAgICAnREFURV9USU1FJyA6IHtcbiAgICAgICAgICAgICduYW1lJyA6ICdEQVRFX1RJTUUnLFxuICAgICAgICAgICAgJ3ZhbHVlJyA6ICgpID0+IG1vbWVudCgpLmZvcm1hdCgnWVlZWS1NTS1ERFRoaDptbTpzcycpXG4gICAgICAgIH0sXG4gICAgICAgICdEQVRFJyA6IHtcbiAgICAgICAgICAgICduYW1lJyA6ICdDVVJSRU5UX0RBVEUnLFxuICAgICAgICAgICAgJ3ZhbHVlJyA6ICgpID0+IG1vbWVudCgpLmZvcm1hdCgnWVlZWS1NTS1ERCcpXG4gICAgICAgIH0sXG4gICAgICAgICdUSU1FJyA6IHtcbiAgICAgICAgICAgICduYW1lJyA6ICdUSU1FJyxcbiAgICAgICAgICAgICd2YWx1ZScgOiAoKSA9PiBtb21lbnQoKS5mb3JtYXQoJ2hoOm1tOnNzJylcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBhcHBWZXJzaW9uOiBBcHBWZXJzaW9uLFxuICAgICAgICBwcml2YXRlIGRldmljZVNlcnZpY2U6IERldmljZVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgZGV2aWNlRmlsZVNlcnZpY2U6IERldmljZUZpbGVTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGZpbGU6IEZpbGUsXG4gICAgICAgIHByaXZhdGUgbG9jYWxLZXlWYWx1ZVNlcnZpY2U6IExvY2FsS2V5VmFsdWVTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHNlY3VyaXR5U2VydmljZTogU2VjdXJpdHlTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHNxbGl0ZTogU1FMaXRlXG4gICAgKSB7fVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2VzIGFsbCBkYXRhYmFzZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhIHByb21pc2UuXG4gICAgICovXG4gICAgcHVibGljIGNsb3NlKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAvLyBCZWZvcmUgY2xvc2luZyBkYXRhYmFzZXMsIGdpdmUgc29tZSB0aW1lIGZvciB0aGUgcGVuZGluZyB0cmFuc2FjdGlvbnMgKGlmIGFueSkuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbG9zZVByb21pc2VzID0gXy5tYXAoXy52YWx1ZXModGhpcy5kYXRhYmFzZXMpLCBkYiA9PiBkYi5zcWxpdGVPYmplY3QuY2xvc2UoKSk7XG4gICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwoY2xvc2VQcm9taXNlcykudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZXh0SWRDb3VudCgpIHtcbiAgICAgICAgdGhpcy5uZXh0SWQgPSB0aGlzLm5leHRJZCArIDE7XG4gICAgICAgIHRoaXMubG9jYWxLZXlWYWx1ZVNlcnZpY2UucHV0KE5FWFRfSURfQ09VTlQsIHRoaXMubmV4dElkKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubmV4dElkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIGEgbmFtZWQgcXVlcnkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGJOYW1lIG5hbWUgb2YgZGF0YWJhc2Ugb24gd2hpY2ggdGhlIG5hbWVkIHF1ZXJ5IGhhcyB0byBiZSBydW5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcXVlcnlOYW1lIG5hbWUgb2YgdGhlIHF1ZXJ5IHRvIGV4ZWN1dGVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlcnMgcmVxdWlyZWQgZm9yIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGEgcHJvbWlzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZXhlY3V0ZU5hbWVkUXVlcnkoZGJOYW1lOiBzdHJpbmcsIHF1ZXJ5TmFtZTogc3RyaW5nLCBwYXJhbXM6IGFueSkge1xuICAgICAgICBsZXQgcXVlcnlEYXRhLCBwYXJhbVByb21pc2VzO1xuICAgICAgICBpZiAoIXRoaXMuZGF0YWJhc2VzW2RiTmFtZV0gfHwgIXRoaXMuZGF0YWJhc2VzW2RiTmFtZV0ucXVlcmllc1txdWVyeU5hbWVdKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoYFF1ZXJ5IGJ5IG5hbWUgJyAke3F1ZXJ5TmFtZX0gJyBOb3QgRm91bmRgKTtcbiAgICAgICAgfVxuICAgICAgICBxdWVyeURhdGEgPSB0aGlzLmRhdGFiYXNlc1tkYk5hbWVdLnF1ZXJpZXNbcXVlcnlOYW1lXTtcbiAgICAgICAgcGFyYW1Qcm9taXNlcyA9IF8uY2hhaW4ocXVlcnlEYXRhLnBhcmFtcylcbiAgICAgICAgICAgIC5maWx0ZXIocCA9PiBwLnZhcmlhYmxlVHlwZSAhPT0gJ1BST01QVCcpXG4gICAgICAgICAgICAuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJhbVZhbHVlID0gdGhpcy5zeXN0ZW1Qcm9wZXJ0aWVzW3AudmFyaWFibGVUeXBlXS52YWx1ZShwLm5hbWUsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUHJvbWlzZShwYXJhbVZhbHVlKS50aGVuKHYgPT4gcGFyYW1zW3AubmFtZV0gPSB2KTtcbiAgICAgICAgICAgIH0pLnZhbHVlKCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwYXJhbVByb21pc2VzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHBhcmFtcyA9IF8ubWFwKHF1ZXJ5RGF0YS5wYXJhbXMsIHAgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFNxbGl0ZSB3aWxsIGFjY2VwdCBEYXRlVGltZSB2YWx1ZSBhcyBiZWxvdyBmb3JtYXQuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXNbcC5uYW1lXSAhPT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgJiYgKHAudHlwZSA9PT0gRGF0YVR5cGUuREFURVRJTUUgfHwgcC50eXBlID09PSBEYXRhVHlwZS5MT0NBTERBVEVUSU1FKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm9ybWF0RGF0ZShwYXJhbXNbcC5uYW1lXSwgcC50eXBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gc3FsaXRlIGFjY2VwdHMgdGhlIGJvb2wgdmFsIGFzIDEsMCBoZW5jZSBjb252ZXJ0IHRoZSBib29sZWFuIHZhbHVlIHRvIG51bWJlclxuICAgICAgICAgICAgICAgIGlmIChwLnR5cGUgPT09IERhdGFUeXBlLkJPT0xFQU4pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udmVydEJvb2xUb0ludChwYXJhbXNbcC5uYW1lXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJhbXNbcC5uYW1lXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZVNRTFF1ZXJ5KGRiTmFtZSwgcXVlcnlEYXRhLnF1ZXJ5LCBwYXJhbXMpXG4gICAgICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpcnN0Um93LFxuICAgICAgICAgICAgICAgICAgICAgICAgbmVlZFRyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfLmlzRW1wdHkocmVzdWx0LnJvd3MpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFJvdyA9IHJlc3VsdC5yb3dzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmVlZFRyYW5zZm9ybSA9IF8uZmluZChxdWVyeURhdGEucmVzcG9uc2UucHJvcGVydGllcywgcCA9PiAhZmlyc3RSb3cuaGFzT3duUHJvcGVydHkocC5maWVsZE5hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChuZWVkVHJhbnNmb3JtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5yb3dzID0gXy5tYXAocmVzdWx0LnJvd3MsIHJvdyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkUm93ID0ge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dXaXRoVXBwZXJLZXlzID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgdG8gbWFrZSBzZWFyY2ggZm9yIGRhdGEgYXMgY2FzZS1pbnNlbnNpdGl2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gocm93LCAodiwgaykgPT4gcm93V2l0aFVwcGVyS2V5c1trLnRvVXBwZXJDYXNlKCldID0gdik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChxdWVyeURhdGEucmVzcG9uc2UucHJvcGVydGllcywgcCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3JtYXQgdGhlIHZhbHVlIGRlcGVuZGluZyBvbiB0aGUgdHlwZVJlZiBzcGVjaWZpZWQgaW4gcHJvcGVydGllcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BUeXBlID0gZXh0cmFjdFR5cGUocC5maWVsZFR5cGUudHlwZVJlZik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmb3JtYXRWYWx1ZSA9IERFRkFVTFRfRk9STUFUU1tfLnRvVXBwZXIocHJvcFR5cGUpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpZWxkVmFsID0gcm93W3AubmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmllbGRWYWwgJiYgdHlwZW9mIGZpZWxkVmFsICE9PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIChwcm9wVHlwZSA9PT0gRGF0YVR5cGUuREFURVRJTUUgfHwgcHJvcFR5cGUgPT09IERhdGFUeXBlLkxPQ0FMREFURVRJTUUgfHwgcHJvcFR5cGUgPT09IERhdGFUeXBlLkRBVEUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vbWVudChmaWVsZFZhbCkuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1twLm5hbWVdID0gZm9ybWF0RGF0ZShmaWVsZFZhbCwgcHJvcFR5cGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobW9tZW50KGZpZWxkVmFsLCAnSEg6bW0nKS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIHZhbHVlIGlzIGluIEhIOm1tOnNzIGZvcm1hdCwgaXQgcmV0dXJucyBhIHdyb25nIGRhdGUuIFNvIGFwcGVuZCB0aGUgZGF0ZSB0byB0aGUgZ2l2ZW4gdmFsdWUgdG8gZ2V0IGRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93W3AubmFtZV0gPSBtb21lbnQoKS5mb3JtYXQoJ1lZWVktTU0tREQnKSArICdUJyArIGZpZWxkVmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wVHlwZSA9PT0gRGF0YVR5cGUuQk9PTEVBTikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1twLm5hbWVdID0gdGhpcy5jb252ZXJ0SW50VG9Cb29sKGZpZWxkVmFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1dpdGhVcHBlcktleXNbcC5uYW1lSW5VcHBlckNhc2VdID0gcm93W3AubmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZFJvd1twLm5hbWVdID0gcm93W3AubmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZFJvd1twLmZpZWxkTmFtZV0gPSByb3dbcC5maWVsZE5hbWVdIHx8IHJvd1dpdGhVcHBlcktleXNbcC5uYW1lSW5VcHBlckNhc2VdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkUm93O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBleHBvcnQgdGhlIGRhdGFiYXNlcyBpbiBhIHppcCBmb3JtYXQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHppcCBpcyBjcmVhdGVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBleHBvcnREQigpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmb2xkZXJUb0V4cG9ydCA9ICdvZmZsaW5lX3RlbXBfJyArIF8ubm93KCksXG4gICAgICAgICAgICAgICAgZm9sZGVyVG9FeHBvcnRGdWxsUGF0aCA9IGNvcmRvdmEuZmlsZS5jYWNoZURpcmVjdG9yeSArIGZvbGRlclRvRXhwb3J0ICsgJy8nLFxuICAgICAgICAgICAgICAgIHppcEZpbGVOYW1lID0gJ19vZmZsaW5lX2RhdGEuemlwJyxcbiAgICAgICAgICAgICAgICBtZXRhSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYXBwOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBPUzogJycsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRPbjogMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgemlwRGlyZWN0b3J5O1xuICAgICAgICAgICAgaWYgKGlzSW9zKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBJbiBJT1MsIHNhdmUgemlwIHRvIGRvY3VtZW50cyBkaXJlY3Rvcnkgc28gdGhhdCB1c2VyIGNhbiBleHBvcnQgdGhlIGZpbGUgZnJvbSBJT1MgZGV2aWNlcyB1c2luZyBpVFVORVMuXG4gICAgICAgICAgICAgICAgemlwRGlyZWN0b3J5ID0gY29yZG92YS5maWxlLmRvY3VtZW50c0RpcmVjdG9yeTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSW4gQW5kcm9pZCwgc2F2ZSB6aXAgdG8gZG93bmxvYWQgZGlyZWN0b3J5LlxuICAgICAgICAgICAgICAgIHppcERpcmVjdG9yeSA9IGNvcmRvdmEuZmlsZS5leHRlcm5hbFJvb3REaXJlY3RvcnkgKyAnRG93bmxvYWQvJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBmb2xkZXIgdG8gY29weSBhbGwgdGhlIGNvbnRlbnQgdG8gZXhwb3J0XG4gICAgICAgICAgICB0aGlzLmZpbGUuY3JlYXRlRGlyKGNvcmRvdmEuZmlsZS5jYWNoZURpcmVjdG9yeSwgZm9sZGVyVG9FeHBvcnQsIGZhbHNlKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29weSBkYXRhYmFzZXMgdG8gdGVtcG9yYXJ5IGZvbGRlciBmb3IgZXhwb3J0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGUuY29weURpcih0aGlzLmRiSW5zdGFsbFBhcmVudERpcmVjdG9yeSwgdGhpcy5kYkluc3RhbGxEaXJlY3RvcnlOYW1lLCBmb2xkZXJUb0V4cG9ydEZ1bGxQYXRoLCAnZGF0YWJhc2VzJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcmVwYXJlIG1ldGEgaW5mbyB0byBpZGVudGlmeSB0aGUgemlwIGFuZCBvdGhlciBpbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXBwSW5mbygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihhcHBJbmZvID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhSW5mby5hcHAgPSAoYXBwSW5mbyBhcyBhbnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0lvcygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFJbmZvLk9TID0gJ0lPUyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc0FuZHJvaWQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhSW5mby5PUyA9ICdBTkRST0lEJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YUluZm8uY3JlYXRlZE9uID0gXy5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWV0YUluZm87XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IGV4ZWN1dGVQcm9taXNlQ2hhaW4odGhpcy5nZXRDYWxsYmFja3NGb3IoJ3ByZUV4cG9ydCcpLCBbZm9sZGVyVG9FeHBvcnRGdWxsUGF0aCwgbWV0YUluZm9dKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXcml0ZSBtZXRhIGRhdGEgdG8gTUVUQS5qc29uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS53cml0ZUZpbGUoZm9sZGVyVG9FeHBvcnRGdWxsUGF0aCwgJ01FVEEuanNvbicsIEpTT04uc3RyaW5naWZ5KG1ldGFJbmZvKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJlcGFyZSBuYW1lIHRvIHVzZSBmb3IgdGhlIHppcC5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGFwcE5hbWUgPSBtZXRhSW5mby5hcHAubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgYXBwTmFtZSA9IGFwcE5hbWUucmVwbGFjZSgvXFxzKy9nLCAnXycpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXZpY2VGaWxlU2VydmljZS5uZXdGaWxlTmFtZSh6aXBEaXJlY3RvcnksIGFwcE5hbWUgKyB6aXBGaWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZpbGVOYW1lID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBaaXAgdGhlIHRlbXBvcmFyeSBmb2xkZXIgZm9yIGV4cG9ydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocnMsIHJlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFplZXAuemlwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gOiBmb2xkZXJUb0V4cG9ydEZ1bGxQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gICA6IHppcERpcmVjdG9yeSArIGZpbGVOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHJzKHppcERpcmVjdG9yeSArIGZpbGVOYW1lKSwgcmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkudGhlbihyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgICAgICAgLmNhdGNoKG5vb3ApLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdGVtcG9yYXJ5IGZvbGRlciBmb3IgZXhwb3J0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRldmljZUZpbGVTZXJ2aWNlLnJlbW92ZURpcihjb3Jkb3ZhLmZpbGUuY2FjaGVEaXJlY3RvcnkgKyBmb2xkZXJUb0V4cG9ydCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICByZXR1cm5zIHN0b3JlIGJvdW5kIHRvIHRoZSBkYXRhTW9kZWxOYW1lIGFuZCBlbnRpdHlOYW1lLlxuICAgICAqXG4gICAgICogQHBhcmFtIGRhdGFNb2RlbE5hbWVcbiAgICAgKiBAcGFyYW0gZW50aXR5TmFtZVxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTdG9yZShkYXRhTW9kZWxOYW1lOiBzdHJpbmcsIGVudGl0eU5hbWU6IHN0cmluZyk6IFByb21pc2U8TG9jYWxEQlN0b3JlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhYmFzZXNbZGF0YU1vZGVsTmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMuZGF0YWJhc2VzW2RhdGFNb2RlbE5hbWVdLnN0b3Jlc1tlbnRpdHlOYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWplY3QoYHN0b3JlIHdpdGggbmFtZScke2VudGl0eU5hbWV9JyBpbiBkYXRhbW9kZWwgJyR7ZGF0YU1vZGVsTmFtZX0nIGlzIG5vdCBmb3VuZGApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgcmVwbGFjZSB0aGUgZGF0YWJhc2VzIHdpdGggdGhlIGZpbGVzIHByb3ZpZGVkIGluIHppcC4gSWYgaW1wb3J0IGdldHMgZmFpbGVkLFxuICAgICAqIHRoZW4gYXBwIHJldmVydHMgYmFjayB0byB1c2Ugb2xkIGRhdGFiYXNlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB6aXBQYXRoIGxvY2F0aW9uIG9mIHRoZSB6aXAgZmlsZS5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHJldmVydElmRmFpbHMgSWYgdHJ1ZSwgdGhlbiBhIGJhY2t1cCBpcyBjcmVhdGVkIGFuZCB3aGVuIGltcG9ydCBmYWlscywgYmFja3VwIGlzIHJldmVydGVkIGJhY2suXG4gICAgICogQHJldHVybnMge29iamVjdH0gYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB6aXAgaXMgY3JlYXRlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW1wb3J0REIoemlwUGF0aDogc3RyaW5nLCByZXZlcnRJZkZhaWxzOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbXBvcnRGb2xkZXIgPSAnb2ZmbGluZV90ZW1wXycgKyBfLm5vdygpLFxuICAgICAgICAgICAgICAgIGltcG9ydEZvbGRlckZ1bGxQYXRoID0gY29yZG92YS5maWxlLmNhY2hlRGlyZWN0b3J5ICsgaW1wb3J0Rm9sZGVyICsgJy8nO1xuICAgICAgICAgICAgbGV0IHppcE1ldGE7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYSB0ZW1wb3JhcnkgZm9sZGVyIHRvIHVuemlwIHRoZSBjb250ZW50cyBvZiB0aGUgemlwLlxuICAgICAgICAgICAgdGhpcy5maWxlLmNyZWF0ZURpcihjb3Jkb3ZhLmZpbGUuY2FjaGVEaXJlY3RvcnksIGltcG9ydEZvbGRlciwgZmFsc2UpXG4gICAgICAgICAgICAgICAgLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChycywgcmUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVuemlwIHRvIHRlbXBvcmFyeSBsb2NhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgWmVlcC51bnppcCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogemlwUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogaW1wb3J0Rm9sZGVyRnVsbFBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHJzLCByZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICogcmVhZCBtZXRhIGRhdGEgYW5kIGFsbG93IGltcG9ydCBvbmx5IHBhY2thZ2UgbmFtZSBvZiB0aGUgYXBwIGZyb20gd2hpY2ggdGhpcyB6aXAgaXMgY3JlYXRlZFxuICAgICAgICAgICAgICAgICAqIGFuZCB0aGUgcGFja2FnZSBuYW1lIG9mIHRoaXMgYXBwIGFyZSBzYW1lLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGUucmVhZEFzVGV4dChpbXBvcnRGb2xkZXJGdWxsUGF0aCwgJ01FVEEuanNvbicpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHRleHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICB6aXBNZXRhID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXBwSW5mbygpO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oYXBwSW5mbyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghemlwTWV0YS5hcHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnbWV0YSBpbmZvcm1hdGlvbiBpcyBub3QgZm91bmQgaW4gemlwJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHppcE1ldGEuYXBwLnBhY2thZ2VOYW1lICE9PSBhcHBJbmZvLnBhY2thZ2VOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ2RhdGFiYXNlIHppcCBvZiBhcHAgd2l0aCBzYW1lIHBhY2thZ2UgbmFtZSBjYW4gb25seSBiZSBpbXBvcnRlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgYmFja3VwWmlwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb3NlKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldmVydElmRmFpbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYmFja3VwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhwb3J0REIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihwYXRoID0+IGJhY2t1cFppcCA9IHBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRlbGV0ZSBleGlzdGluZyBkYXRhYmFzZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRldmljZUZpbGVTZXJ2aWNlLnJlbW92ZURpcih0aGlzLmRiSW5zdGFsbERpcmVjdG9yeSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29weSBpbXBvcnRlZCBkYXRhYmFzZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGUuY29weURpcihpbXBvcnRGb2xkZXJGdWxsUGF0aCwgJ2RhdGFiYXNlcycsIHRoaXMuZGJJbnN0YWxsUGFyZW50RGlyZWN0b3J5LCB0aGlzLmRiSW5zdGFsbERpcmVjdG9yeU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbG9hZCBkYXRhYmFzZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YWJhc2VzID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYWREYXRhYmFzZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiBleGVjdXRlUHJvbWlzZUNoYWluKHRoaXMuZ2V0Q2FsbGJhY2tzRm9yKCdwb3N0SW1wb3J0JyksIFtpbXBvcnRGb2xkZXJGdWxsUGF0aCwgemlwTWV0YV0pKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmFja3VwWmlwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlRmlsZVNlcnZpY2UucmVtb3ZlRmlsZShiYWNrdXBaaXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCAocmVhc29uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmFja3VwWmlwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW1wb3J0REIoYmFja3VwWmlwLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXZpY2VGaWxlU2VydmljZS5yZW1vdmVGaWxlKGJhY2t1cFppcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS50aGVuKHJlc29sdmUsIHJlamVjdClcbiAgICAgICAgICAgIC5jYXRjaChub29wKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRldmljZUZpbGVTZXJ2aWNlLnJlbW92ZURpcihjb3Jkb3ZhLmZpbGUuY2FjaGVEaXJlY3RvcnkgKyBpbXBvcnRGb2xkZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhTW9kZWxOYW1lIE5hbWUgb2YgdGhlIGRhdGEgbW9kZWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZW50aXR5TmFtZSBOYW1lIG9mIHRoZSBlbnRpdHlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gb3BlcmF0aW9uIE5hbWUgb2YgdGhlIG9wZXJhdGlvbiAoUkVBRCwgSU5TRVJULCBVUERBVEUsIERFTEVURSlcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmV0dXJucyB0cnVlLCBpZiB0aGUgZ2l2ZW4gb3BlcmF0aW9uIGNhbiBiZSBwZXJmb3JtZWQgYXMgcGVyIGNvbmZpZ3VyYXRpb24uXG4gICAgICovXG4gICAgcHVibGljIGlzT3BlcmF0aW9uQWxsb3dlZChkYXRhTW9kZWxOYW1lOiBzdHJpbmcsIGVudGl0eU5hbWU6IHN0cmluZywgb3BlcmF0aW9uOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RvcmUoZGF0YU1vZGVsTmFtZSwgZW50aXR5TmFtZSkudGhlbiggc3RvcmUgPT4ge1xuICAgICAgICAgICAgaWYgKCFzdG9yZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24gPT09ICdSRUFEJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdG9yZS5lbnRpdHlTY2hlbWEucHVzaENvbmZpZy5yZWFkRW5hYmxlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24gPT09ICdJTlNFUlQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0b3JlLmVudGl0eVNjaGVtYS5wdXNoQ29uZmlnLmluc2VydEVuYWJsZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uID09PSAnVVBEQVRFJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdG9yZS5lbnRpdHlTY2hlbWEucHVzaENvbmZpZy51cGRhdGVFbmFibGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbiA9PT0gJ0RFTEVURScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RvcmUuZW50aXR5U2NoZW1hLnB1c2hDb25maWcuZGVsZXRlRW5hYmxlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbG9hZERhdGFiYXNlcygpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBsZXQgbmV3RGF0YWJhc2VzQ3JlYXRlZCA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5kYXRhYmFzZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5kYXRhYmFzZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlzSW9zKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRiSW5zdGFsbERpcmVjdG9yeU5hbWUgPSAnTG9jYWxEYXRhYmFzZSc7XG4gICAgICAgICAgICAgICAgdGhpcy5kYkluc3RhbGxQYXJlbnREaXJlY3RvcnkgPSBjb3Jkb3ZhLmZpbGUuYXBwbGljYXRpb25TdG9yYWdlRGlyZWN0b3J5ICsgICdMaWJyYXJ5Lyc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGJJbnN0YWxsRGlyZWN0b3J5TmFtZSA9ICdkYXRhYmFzZXMnO1xuICAgICAgICAgICAgICAgIHRoaXMuZGJJbnN0YWxsUGFyZW50RGlyZWN0b3J5ID0gY29yZG92YS5maWxlLmFwcGxpY2F0aW9uU3RvcmFnZURpcmVjdG9yeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGJJbnN0YWxsRGlyZWN0b3J5ID0gdGhpcy5kYkluc3RhbGxQYXJlbnREaXJlY3RvcnkgKyB0aGlzLmRiSW5zdGFsbERpcmVjdG9yeU5hbWU7XG5cbiAgICAgICAgICAgIHRoaXMuZGF0YWJhc2VzID0gbmV3IE1hcDxzdHJpbmcsIERCSW5mbz4oKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFVwRGF0YWJhc2VzKClcbiAgICAgICAgICAgICAgICAudGhlbiggZmxhZyA9PiBuZXdEYXRhYmFzZXNDcmVhdGVkID0gZmxhZylcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLmxvYWREQlNjaGVtYXMoKSlcbiAgICAgICAgICAgICAgICAudGhlbihtZXRhZGF0YSA9PiB0aGlzLmxvYWROYW1lZFF1ZXJpZXMobWV0YWRhdGEpKVxuICAgICAgICAgICAgICAgIC50aGVuKG1ldGFkYXRhID0+IHRoaXMubG9hZE9mZmxpbmVDb25maWcobWV0YWRhdGEpKVxuICAgICAgICAgICAgICAgIC50aGVuKG1ldGFkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKF8ubWFwKG1ldGFkYXRhLCBkYk1ldGFkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wZW5EYXRhYmFzZShkYk1ldGFkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGRhdGFiYXNlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhYmFzZXNbZGJNZXRhZGF0YS5zY2hlbWEubmFtZV0gPSBkYXRhYmFzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTdG9yZSgnd2F2ZW1ha2VyJywgJ2tleS12YWx1ZScpLnRoZW4oIHN0b3JlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYWxLZXlWYWx1ZVNlcnZpY2UuaW5pdChzdG9yZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbEtleVZhbHVlU2VydmljZS5nZXQoTkVYVF9JRF9DT1VOVCkudGhlbih2YWwgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0SWQgPSB2YWwgfHwgdGhpcy5uZXh0SWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEYXRhYmFzZXNDcmVhdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVEYXRhKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLmRpc2FibGVGb3JlaWduS2V5cygpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMuZGV2aWNlU2VydmljZS5nZXRBcHBCdWlsZFRpbWUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihkYlNlZWRDcmVhdGlvblRpbWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVByb21pc2VDaGFpbihfLm1hcCh0aGlzLmNhbGxiYWNrcywgJ29uRGJDcmVhdGUnKSwgW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhYmFzZXMnIDogdGhpcy5kYXRhYmFzZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGJDcmVhdGVkT24nIDogXy5ub3coKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkYlNlZWRDcmVhdGVkT24nIDogZGJTZWVkQ3JlYXRpb25UaW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHRoaXMuZGF0YWJhc2VzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFiYXNlcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdXNpbmcgdGhpcyBmdW5jdGlvbiBvbmUgY2FuIGxpc3RlbiBldmVudHMgc3VjaCBhcyBvbkRiQ3JlYXRlLCAncHJlRXhwb3J0JyBhbmQgJ3Bvc3RJbXBvcnQnLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGxpc3RlbmVyIGFuIG9iamVjdCB3aXRoIGZ1bmN0aW9ucyBtYXBwZWQgdG8gZXZlbnQgbmFtZXMuXG4gICAgICovXG4gICAgcHVibGljIHJlZ2lzdGVyQ2FsbGJhY2sobGlzdGVuZXI6IENhbGxCYWNrKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2gobGlzdGVuZXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRMb2dTUWwoZmxhZzogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9sb2dTcWwgPSBmbGFnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgYW55IGV4aXN0aW5nIGRhdGFiYXNlcyAoZXhjZXB0IHdhdmVtYWtlciBkYikgYW5kIGNvcGllcyB0aGUgZGF0YWJhc2VzIHRoYXQgYXJlIHBhY2thZ2VkIHdpdGggdGhlIGFwcC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIHByaXZhdGUgY2xlYW5BbmRDb3B5RGF0YWJhc2VzKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IGRiU2VlZEZvbGRlciA9IGNvcmRvdmEuZmlsZS5hcHBsaWNhdGlvbkRpcmVjdG9yeSArIE1FVEFfTE9DQVRJT047XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuY3JlYXRlRGlyKHRoaXMuZGJJbnN0YWxsUGFyZW50RGlyZWN0b3J5LCB0aGlzLmRiSW5zdGFsbERpcmVjdG9yeU5hbWUsIGZhbHNlKVxuICAgICAgICAgICAgLmNhdGNoKG5vb3ApXG4gICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLmRldmljZUZpbGVTZXJ2aWNlLmxpc3RGaWxlcyh0aGlzLmRiSW5zdGFsbERpcmVjdG9yeSwgLy4rXFwuZGIkLykpXG4gICAgICAgICAgICAudGhlbihmaWxlcyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVzICYmIGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGZpbGVzLm1hcChmID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmWyduYW1lJ10gIT09ICd3YXZlbWFrZXIuZGInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5yZW1vdmVGaWxlKHRoaXMuZGJJbnN0YWxsRGlyZWN0b3J5LCBmWyduYW1lJ10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCAoKSA9PiB0aGlzLmRldmljZUZpbGVTZXJ2aWNlLmxpc3RGaWxlcyhkYlNlZWRGb2xkZXIsIC8uK1xcLmRiJC8pKVxuICAgICAgICAgICAgLnRoZW4oZmlsZXMgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChmaWxlcyAmJiBmaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGUuY3JlYXRlRGlyKHRoaXMuZGJJbnN0YWxsUGFyZW50RGlyZWN0b3J5LCB0aGlzLmRiSW5zdGFsbERpcmVjdG9yeU5hbWUsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKG5vb3ApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiBQcm9taXNlLmFsbChmaWxlcy5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGYgPT4gdGhpcy5maWxlLmNvcHlGaWxlKGRiU2VlZEZvbGRlciwgZlsnbmFtZSddLCB0aGlzLmRiSW5zdGFsbERpcmVjdG9yeSwgZlsnbmFtZSddKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFBpY2tzIGVzc2VudGlhbCBkZXRhaWxzIGZyb20gdGhlIGdpdmVuIHNjaGVtYS5cbiAgICBwcml2YXRlIGNvbXBhY3RFbnRpdHlTY2hlbWEoc2NoZW1hLCBlbnRpdHksIHRyYW5zZm9ybWVkU2NoZW1hcyk6IEVudGl0eUluZm8ge1xuICAgICAgICBjb25zdCByZXFFbnRpdHkgPSB0cmFuc2Zvcm1lZFNjaGVtYXNbZW50aXR5WydlbnRpdHlOYW1lJ11dIGFzIEVudGl0eUluZm87XG4gICAgICAgIHJlcUVudGl0eS5lbnRpdHlOYW1lID0gZW50aXR5WydlbnRpdHlOYW1lJ107XG4gICAgICAgIHJlcUVudGl0eS5uYW1lID0gZW50aXR5WyduYW1lJ107XG4gICAgICAgIHJlcUVudGl0eS5jb2x1bW5zID0gW107XG4gICAgICAgIGVudGl0eS5jb2x1bW5zLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgIGxldCBkZWZhdWx0VmFsdWUgPSBjb2wuY29sdW1uVmFsdWUgPyBjb2wuY29sdW1uVmFsdWUuZGVmYXVsdFZhbHVlIDogJyc7XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gY29sLnNxbFR5cGU7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIWNvbC5wcmltYXJ5S2V5KSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gXy5pc0VtcHR5KGRlZmF1bHRWYWx1ZSkgPyBudWxsIDogXy5wYXJzZUludChkZWZhdWx0VmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBfLmlzRW1wdHkoZGVmYXVsdFZhbHVlKSA/IG51bGwgOiAoZGVmYXVsdFZhbHVlID09PSAndHJ1ZScgPyAxIDogMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IF8uaXNFbXB0eShkZWZhdWx0VmFsdWUpID8gbnVsbCA6IGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcUVudGl0eS5jb2x1bW5zLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IGNvbFsnbmFtZSddLFxuICAgICAgICAgICAgICAgIGZpZWxkTmFtZTogY29sWydmaWVsZE5hbWUnXSxcbiAgICAgICAgICAgICAgICBnZW5lcmF0b3JUeXBlOiBjb2xbJ2dlbmVyYXRvclR5cGUnXSxcbiAgICAgICAgICAgICAgICBzcWxUeXBlOiBjb2xbJ3NxbFR5cGUnXSxcbiAgICAgICAgICAgICAgICBwcmltYXJ5S2V5OiBjb2xbJ3ByaW1hcnlLZXknXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IGRlZmF1bHRWYWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF8uZm9yRWFjaChlbnRpdHkucmVsYXRpb25zLCByID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXRFbnRpdHlTY2hlbWEsIHRhcmdldEVudGl0eSwgY29sLCBzb3VyY2VDb2x1bW4sIG1hcHBpbmc7XG4gICAgICAgICAgICBpZiAoci5jYXJkaW5hbGl0eSA9PT0gJ01hbnlUb09uZScgfHwgci5jYXJkaW5hbGl0eSA9PT0gJ09uZVRvT25lJykge1xuICAgICAgICAgICAgICAgIHRhcmdldEVudGl0eSA9IF8uZmluZChzY2hlbWEudGFibGVzLCB0ID0+IHQubmFtZSA9PT0gci50YXJnZXRUYWJsZSk7XG4gICAgICAgICAgICAgICAgbWFwcGluZyA9IHIubWFwcGluZ3NbMF07XG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldEVudGl0eSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRFbnRpdHkgPSB0YXJnZXRFbnRpdHkuZW50aXR5TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlQ29sdW1uID0gbWFwcGluZy5zb3VyY2VDb2x1bW47XG4gICAgICAgICAgICAgICAgICAgIGNvbCA9IHJlcUVudGl0eS5jb2x1bW5zLmZpbmQoY29sdW1uID0+IGNvbHVtbi5uYW1lID09PSBzb3VyY2VDb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRFbnRpdHlTY2hlbWEgPSBzY2hlbWEudGFibGVzLmZpbmQodGFibGUgPT4gdGFibGUubmFtZSA9PT0gci50YXJnZXRUYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZvcmVpZ25SZWxhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpZWxkTmFtZTogci5maWVsZE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRFbnRpdHk6IHRhcmdldEVudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFRhYmxlOiByLnRhcmdldFRhYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0Q29sdW1uOiBtYXBwaW5nLnRhcmdldENvbHVtbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YU1hcHBlcjogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRGaWVsZE5hbWU6IHRhcmdldEVudGl0eVNjaGVtYS5jb2x1bW5zLmZpbmQoY29sdW1uID0+IGNvbHVtbi5uYW1lID09PSBtYXBwaW5nLnRhcmdldENvbHVtbikuZmllbGROYW1lXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGZvcmVpZ25SZWxhdGlvbi50YXJnZXRQYXRoID0gZm9yZWlnblJlbGF0aW9uLnNvdXJjZUZpZWxkTmFtZSArICcuJyArIGZvcmVpZ25SZWxhdGlvbi50YXJnZXRGaWVsZE5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGZvcmVpZ25SZWxhdGlvbi5kYXRhTWFwcGVyID0gXy5jaGFpbih0YXJnZXRFbnRpdHlTY2hlbWEuY29sdW1ucylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5rZXlCeShjaGlsZENvbCA9PiBmb3JlaWduUmVsYXRpb24uc291cmNlRmllbGROYW1lICsgJy4nICsgY2hpbGRDb2wuZmllbGROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcFZhbHVlcyhjaGlsZENvbCA9PiBuZXcgQ29sdW1uSW5mbyhjaGlsZENvbC5uYW1lLCBjaGlsZENvbC5maWVsZE5hbWUpKS52YWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb2wuZm9yZWlnblJlbGF0aW9ucyA9IGNvbC5mb3JlaWduUmVsYXRpb25zIHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICBjb2wuZm9yZWlnblJlbGF0aW9ucy5wdXNoKGZvcmVpZ25SZWxhdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlcUVudGl0eTtcbiAgICB9XG5cbiAgICAvLyBMb2FkcyBuZWNlc3NhcnkgZGV0YWlscyBvZiBxdWVyaWVzXG4gICAgcHJpdmF0ZSBjb21wYWN0UXVlcmllcyhxdWVyaWVzQnlEQik6IE1hcDxzdHJpbmcsIE5hbWVkUXVlcnlJbmZvPiB7XG4gICAgICAgIGNvbnN0IHF1ZXJpZXMgPSBuZXcgTWFwPHN0cmluZywgTmFtZWRRdWVyeUluZm8+KCk7XG5cbiAgICAgICAgXy5mb3JFYWNoKHF1ZXJpZXNCeURCLnF1ZXJpZXMsIHF1ZXJ5RGF0YSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnksIHBhcmFtcztcbiAgICAgICAgICAgIGlmIChxdWVyeURhdGEubmF0aXZlU3FsICYmIHF1ZXJ5RGF0YS50eXBlID09PSAnU0VMRUNUJykge1xuICAgICAgICAgICAgICAgIHF1ZXJ5ID0gXy5pc0VtcHR5KHF1ZXJ5RGF0YS5vZmZsaW5lUXVlcnlTdHJpbmcpID8gcXVlcnlEYXRhLnF1ZXJ5U3RyaW5nIDogcXVlcnlEYXRhLm9mZmxpbmVRdWVyeVN0cmluZztcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSBfLm1hcCh0aGlzLmV4dHJhY3RRdWVyeVBhcmFtcyhxdWVyeSksIHAgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJhbU9iaiA9IF8uZmluZChxdWVyeURhdGEucGFyYW1ldGVycywgeyduYW1lJzogcH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcGFyYW1PYmoubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHBhcmFtT2JqLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZVR5cGU6IHBhcmFtT2JqLnZhcmlhYmxlVHlwZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHBhcmFtcy5mb3JFYWNoKHAgPT4gcXVlcnkgPSBfLnJlcGxhY2UocXVlcnksICc6JyArIHAubmFtZSwgJz8nKSk7XG4gICAgICAgICAgICAgICAgcXVlcmllc1txdWVyeURhdGEubmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHF1ZXJ5RGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBxdWVyeTogcXVlcnksXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogXy5tYXAocXVlcnlEYXRhLnJlc3BvbnNlLnByb3BlcnRpZXMsIHAgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHAubmFtZUluVXBwZXJDYXNlID0gcC5uYW1lLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBxdWVyaWVzO1xuICAgIH1cblxuICAgIC8vIExvYWRzIG5lY2Vzc2FyeSBkZXRhaWxzIG9mIHJlbW90ZSBzY2hlbWFcbiAgICBwcml2YXRlIGNvbXBhY3RTY2hlbWEoc2NoZW1hKTogREJJbmZvIHtcbiAgICAgICAgY29uc3QgZGJJbmZvID0gbmV3IERCSW5mbygpO1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZFNjaGVtYXMgPSBuZXcgTWFwPHN0cmluZywgRW50aXR5SW5mbz4oKTtcbiAgICAgICAgc2NoZW1hLnRhYmxlcy5mb3JFYWNoKGVudGl0eVNjaGVtYSA9PiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm1lZFNjaGVtYXNbZW50aXR5U2NoZW1hLmVudGl0eU5hbWVdID0ge307XG4gICAgICAgIH0pO1xuICAgICAgICBzY2hlbWEudGFibGVzLmZvckVhY2goZW50aXR5U2NoZW1hID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29tcGFjdEVudGl0eVNjaGVtYShzY2hlbWEsIGVudGl0eVNjaGVtYSwgdHJhbnNmb3JtZWRTY2hlbWFzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRiSW5mby5zY2hlbWEubmFtZSA9IHNjaGVtYS5uYW1lO1xuICAgICAgICBkYkluZm8uc2NoZW1hLmlzSW50ZXJuYWwgPSBzY2hlbWEuaXNJbnRlcm5hbDtcbiAgICAgICAgZGJJbmZvLnNjaGVtYS5lbnRpdGllcyA9IHRyYW5zZm9ybWVkU2NoZW1hcztcbiAgICAgICAgcmV0dXJuIGRiSW5mbztcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnZlcnRCb29sVG9JbnQoYm9vbDogYm9vbGVhbikge1xuICAgICAgICByZXR1cm4gXy50b1N0cmluZyhib29sKSA9PT0gJ3RydWUnID8gMSA6IDA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb252ZXJ0SW50VG9Cb29sKGludDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBpbnQgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHVybnMgb2ZmIGZvcmVpZ24ga2V5c1xuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIHByaXZhdGUgZGlzYWJsZUZvcmVpZ25LZXlzKCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXy5tYXAodGhpcy5kYXRhYmFzZXMsIGRiID0+XG4gICAgICAgICAgICB0aGlzLmV4ZWN1dGVTUUxRdWVyeShkYi5zY2hlbWEubmFtZSwgJ1BSQUdNQSBmb3JlaWduX2tleXMgPSBPRkYnKVxuICAgICAgICApKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyBTUUwgcXVlcnk7XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGJOYW1lXG4gICAgICogQHBhcmFtIHNxbFxuICAgICAqIEBwYXJhbSBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBwdWJsaWMgZXhlY3V0ZVNRTFF1ZXJ5KGRiTmFtZSwgc3FsLCBwYXJhbXM/OiBhbnlbXSwgbG9nT3V0cHV0PzogYm9vbGVhbikge1xuICAgICAgICBjb25zdCBkYiA9IHRoaXMuZGF0YWJhc2VzW2RiTmFtZV07XG4gICAgICAgIGlmIChkYikge1xuICAgICAgICAgICAgcmV0dXJuIGRiLnNxbGl0ZU9iamVjdC5leGVjdXRlU3FsKHNxbCwgcGFyYW1zLCBsb2dPdXRwdXQpXG4gICAgICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm93cyA9IHJlc3VsdC5yb3dzO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChyb3dzLml0ZW0oaSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAncm93c0FmZmVjdGVkJyAgOiByZXN1bHQucm93c0FmZmVjdGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3Jvd3MnICAgICAgICAgIDogZGF0YVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChgTm8gRGF0YWJhc2Ugd2l0aCBuYW1lICR7ZGJOYW1lfSBmb3VuZGApO1xuICAgIH1cblxuICAgIC8vIGdldCB0aGUgcGFyYW1zIG9mIHRoZSBxdWVyeSBvciBwcm9jZWR1cmUuXG4gICAgcHJpdmF0ZSBleHRyYWN0UXVlcnlQYXJhbXMocXVlcnkpIHtcbiAgICAgICAgbGV0IHBhcmFtcywgYWxpYXNQYXJhbXM7XG4gICAgICAgIGFsaWFzUGFyYW1zID0gcXVlcnkubWF0Y2goL1teXCInXFx3XFxcXF06XFxzKlxcdytcXHMqL2cpIHx8IFtdO1xuICAgICAgICBpZiAoYWxpYXNQYXJhbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYXJhbXMgPSBhbGlhc1BhcmFtcy5tYXAoeCA9PiAoL1s9fFxcV10vZy50ZXN0KHgpKSA/IHgucmVwbGFjZSgvXFxXL2csICcnKS50cmltKCkgOiB4LnRyaW0oKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJhbXMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIGFwcGxpY2F0aW9uIGluZm8gc3VjaCBhcyBwYWNrYWdlTmFtZSwgYXBwTmFtZSwgdmVyc2lvbk51bWJlciwgdmVyc2lvbkNvZGUuXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRBcHBJbmZvKCkge1xuICAgICAgICBjb25zdCBhcHBJbmZvID0ge1xuICAgICAgICAgICAgbmFtZTogJycsXG4gICAgICAgICAgICBwYWNrYWdlTmFtZTogJycsXG4gICAgICAgICAgICB2ZXJzaW9uTnVtYmVyOiAnJyxcbiAgICAgICAgICAgIHZlcnNpb25Db2RlOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLmFwcFZlcnNpb24uZ2V0UGFja2FnZU5hbWUoKVxuICAgICAgICAgICAgLnRoZW4ocGFja2FnZU5hbWUgPT4ge1xuICAgICAgICAgICAgICAgIGFwcEluZm8ucGFja2FnZU5hbWUgPSBwYWNrYWdlTmFtZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hcHBWZXJzaW9uLmdldEFwcE5hbWUoKTtcbiAgICAgICAgICAgIH0pLnRoZW4oYXBwTmFtZSA9PiB7XG4gICAgICAgICAgICAgICAgYXBwSW5mby5uYW1lID0gYXBwTmFtZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hcHBWZXJzaW9uLmdldFZlcnNpb25OdW1iZXIoKTtcbiAgICAgICAgICAgIH0pLnRoZW4odmVyc2lvbk51bWJlciA9PiB7XG4gICAgICAgICAgICAgICAgYXBwSW5mby52ZXJzaW9uTnVtYmVyID0gdmVyc2lvbk51bWJlcjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hcHBWZXJzaW9uLmdldFZlcnNpb25Db2RlKCk7XG4gICAgICAgICAgICB9KS50aGVuKHZlcnNpb25Db2RlID0+IHtcbiAgICAgICAgICAgICAgICBhcHBJbmZvLnZlcnNpb25Db2RlID0gKHZlcnNpb25Db2RlIGFzIGFueSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcEluZm87XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENhbGxiYWNrc0ZvcihldmVudDogc3RyaW5nKTogYW55W10ge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWxsYmFja3MubWFwKGMgPT4ge1xuICAgICAgICAgICAgaWYgKGNbZXZlbnRdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNbZXZlbnRdLmJpbmQoYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VhcmNoZXMgZm9yIHRoZSBmaWxlcyB3aXRoIGdpdmVuIHJlZ2V4IGluICd3d3cvbWV0YWRhdGEvYXBwJ2FuZCByZXR1cm5zIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIEpTT05cbiAgICAgKiBjb250ZW50IHByZXNlbnQgaW4gZWFjaCBmaWxlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVOYW1lUmVnZXggcmVnZXggcGF0dGVybiB0byBzZWFyY2ggZm9yIGZpbGVzLlxuICAgICAqIEByZXR1cm5zIHsqfSBBIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIGFuIGFycmF5XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRNZXRhSW5mbyhmaWxlTmFtZVJlZ2V4OiBSZWdFeHApIHtcbiAgICAgICAgY29uc3QgZm9sZGVyID0gY29yZG92YS5maWxlLmFwcGxpY2F0aW9uRGlyZWN0b3J5ICsgTUVUQV9MT0NBVElPTiArICcvJztcbiAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlRmlsZVNlcnZpY2UubGlzdEZpbGVzKGZvbGRlciwgZmlsZU5hbWVSZWdleClcbiAgICAgICAgICAgIC50aGVuKGZpbGVzID0+IFByb21pc2UuYWxsKF8ubWFwKGZpbGVzLCBmID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvcmRvdmEgRmlsZSByZWFkZXIgaGFzIGJ1ZmZlciBpc3N1ZXMgd2l0aCBsYXJnZSBmaWxlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvLCB1c2luZyBhamF4IHRvIHJldHJpZXZlIGxvY2FsIGpzb25cbiAgICAgICAgICAgICAgICAgICAgICAgICQuZ2V0SlNPTiggZm9sZGVyICsgZlsnbmFtZSddLCBkYXRhID0+IHJlc29sdmUoZGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlLCBpZiB0aGUgZ2l2ZW4gZW50aXR5J3MgZGF0YSBpcyBidW5kbGVkIGFsb25nIHdpdGggYXBwbGljYXRpb24gaW5zdGFsbGVyLlxuICAgICAqIEBwYXJhbSBkYXRhTW9kZWxOYW1lIG5hbWUgb2YgdGhlIGRhdGEgbW9kZWxcbiAgICAgKiBAcGFyYW0gZW50aXR5TmFtZSBuYW1lIG9mIHRoZSBlbnRpdHlcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICAgICAqL1xuICAgIHB1YmxpYyBpc0J1bmRsZWQoZGF0YU1vZGVsTmFtZSwgZW50aXR5TmFtZSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0b3JlKGRhdGFNb2RlbE5hbWUsIGVudGl0eU5hbWUpLnRoZW4oc3RvcmUgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHN0b3JlLmVudGl0eVNjaGVtYS5wdWxsQ29uZmlnLnB1bGxUeXBlID09PSBQdWxsVHlwZS5CVU5ETEVEO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyBsb2NhbCBkYXRhYmFzZSBzY2hlbWFzIGZyb20gKl9kYXRhX21vZGVsLmpzb24uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Kn0gQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aCBtZXRhZGF0YS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGxvYWREQlNjaGVtYXMoKTogUHJvbWlzZTxNYXA8c3RyaW5nLCBEQkluZm8+PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldE1ldGFJbmZvKC8uK19kYXRhTW9kZWxcXC5qc29uJC8pXG4gICAgICAgICAgICAudGhlbiggKHNjaGVtYXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gbmV3IE1hcDxzdHJpbmcsIERCSW5mbz4oKTtcbiAgICAgICAgICAgICAgICBzY2hlbWFzID0gaXNBcnJheShzY2hlbWFzKSA/IHNjaGVtYXMgOiBbc2NoZW1hc107XG4gICAgICAgICAgICAgICAgc2NoZW1hcy5wdXNoKE9GRkxJTkVfV0FWRU1BS0VSX0RBVEFCQVNFX1NDSEVNQSk7XG4gICAgICAgICAgICAgICAgc2NoZW1hcy5tYXAocyA9PiB0aGlzLmNvbXBhY3RTY2hlbWEocykpXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKHMgPT4gIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhW3Muc2NoZW1hLm5hbWVdID0gcztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ldGFkYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCBuYW1lZCBxdWVyaWVzIGZyb20gKl9xdWVyeS5qc29uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHsqfSBtZXRhZGF0YVxuICAgICAqIEByZXR1cm5zIHsqfSBBIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIG1ldGFkYXRhXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkTmFtZWRRdWVyaWVzKG1ldGFkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldE1ldGFJbmZvKC8uK19xdWVyeVxcLmpzb24kLylcbiAgICAgICAgICAgIC50aGVuKChxdWVyaWVzQnlEQnM6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHF1ZXJpZXNCeURCcyA9IF8uaXNBcnJheShxdWVyaWVzQnlEQnMpID8gcXVlcmllc0J5REJzIDogW3F1ZXJpZXNCeURCc107XG4gICAgICAgICAgICAgICAgcXVlcmllc0J5REJzLm1hcChlID0+IG1ldGFkYXRhW2UubmFtZV0ucXVlcmllcyA9IHRoaXMuY29tcGFjdFF1ZXJpZXMoZSkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXRhZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgb2ZmbGluZSBjb25maWd1cmF0aW9uIGZyb20gKl9vZmZsaW5lLmpzb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0geyp9IG1ldGFkYXRhXG4gICAgICogQHJldHVybnMgeyp9IEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggbWV0YWRhdGFcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvYWRPZmZsaW5lQ29uZmlnKG1ldGFkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldE1ldGFJbmZvKC8uK19vZmZsaW5lXFwuanNvbiQvKVxuICAgICAgICAgICAgLnRoZW4oY29uZmlncyA9PiB7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGNvbmZpZ3MsIGNvbmZpZyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChjb25maWcuZW50aXRpZXMsIGVudGl0eUNvbmZpZyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbnRpdHlTY2hlbWEgPSBfLmZpbmQobWV0YWRhdGFbY29uZmlnLm5hbWVdLnNjaGVtYS5lbnRpdGllcywgc2NoZW1hID0+IHNjaGVtYS5uYW1lID09PSBlbnRpdHlDb25maWcubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmFzc2lnbkluKGVudGl0eVNjaGVtYSwgZW50aXR5Q29uZmlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ldGFkYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2dTcWwoc3FsaXRlT2JqZWN0OiBTUUxpdGVPYmplY3QpIHtcbiAgICAgICAgY29uc3QgbG9nZ2VyID0gY29uc29sZSxcbiAgICAgICAgICAgIG9yaWdpbmFsRXhlY3V0ZVNxbCA9IHNxbGl0ZU9iamVjdC5leGVjdXRlU3FsO1xuICAgICAgICBzcWxpdGVPYmplY3QuZXhlY3V0ZVNxbCA9IChzcWwsIHBhcmFtcywgbG9nT3V0cHV0PzogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gXy5ub3coKTtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbEV4ZWN1dGVTcWwuY2FsbChzcWxpdGVPYmplY3QsIHNxbCwgcGFyYW1zKS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGxvZ091dHB1dCB8fCB0aGlzLl9sb2dTcWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2JqQXJyID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICByb3dDb3VudCA9IHJlc3VsdC5yb3dzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3dDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpBcnIucHVzaChyZXN1bHQucm93cy5pdGVtKGkpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ1NRTCBcIiVzXCIgIHdpdGggcGFyYW1zICVPIHRvb2sgWyVkIG1zXS4gQW5kIHRoZSByZXN1bHQgaXMgJU8nLCBzcWwsIHBhcmFtcywgXy5ub3coKSAtIHN0YXJ0VGltZSwgb2JqQXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1NRTCBcIiVzXCIgd2l0aCBwYXJhbXMgJU8gZmFpbGVkIHdpdGggZXJyb3IgbWVzc2FnZSAlcycsIHNxbCwgcGFyYW1zLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU1FMaXRlIGRvZXMgbm90IHN1cHBvcnQgYm9vbGVhbiBkYXRhLiBJbnN0ZWFkIG9mIHVzaW5nIGJvb2xlYW4gdmFsdWVzLCBkYXRhIHdpbGwgYmUgY2hhbmdlZCB0byAwIG9yIDEuXG4gICAgICogSWYgdGhlIHZhbHVlIGlzICd0cnVlJywgdGhlbiAxIGlzIHNldCBhcyB2YWx1ZS4gSWYgdmFsdWUgaXMgbm90IDEgbm9yIG51bGwsIHRoZW4gY29sdW1uIHZhbHVlIGlzIHNldCBhcyAwLlxuICAgICAqIEBwYXJhbSBkYk5hbWVcbiAgICAgKiBAcGFyYW0gdGFibGVOYW1lXG4gICAgICogQHBhcmFtIGNvbE5hbWVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBwcml2YXRlIG5vcm1hbGl6ZUJvb2xlYW5EYXRhKGRiTmFtZSwgdGFibGVOYW1lLCBjb2xOYW1lKSB7XG4gICAgICAgIGNvbnN0IHRydWVUbzFRdWVyeSA9IGB1cGRhdGUgJHtlc2NhcGVOYW1lKHRhYmxlTmFtZSl9IHNldCAke2VzY2FwZU5hbWUoY29sTmFtZSl9ID0gMSB3aGVyZSAke2VzY2FwZU5hbWUoY29sTmFtZSl9ID0gJ3RydWUnYCxcbiAgICAgICAgICAgIGV4Y2VwdE51bGxBbmQxdG8wUXVlcnkgPSBgdXBkYXRlICR7ZXNjYXBlTmFtZSh0YWJsZU5hbWUpfSBzZXQgJHtlc2NhcGVOYW1lKGNvbE5hbWUpfSA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVyZSAke2VzY2FwZU5hbWUoY29sTmFtZSl9IGlzIG5vdCBudWxsIGFuZCAke2VzY2FwZU5hbWUoY29sTmFtZSl9ICE9IDFgO1xuICAgICAgICByZXR1cm4gdGhpcy5leGVjdXRlU1FMUXVlcnkoZGJOYW1lLCB0cnVlVG8xUXVlcnkpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLmV4ZWN1dGVTUUxRdWVyeShkYk5hbWUsIGV4Y2VwdE51bGxBbmQxdG8wUXVlcnkpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBkYXRhIHRvIHN1cHBvcnQgU1FMaXRlLlxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIHByaXZhdGUgbm9ybWFsaXplRGF0YSgpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKF8ubWFwKHRoaXMuZGF0YWJhc2VzLCBkYXRhYmFzZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXy5tYXAoZGF0YWJhc2Uuc2NoZW1hLmVudGl0aWVzLCBlbnRpdHlTY2hlbWEgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChfLm1hcChlbnRpdHlTY2hlbWEuY29sdW1ucywgY29sdW1uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbHVtbi5zcWxUeXBlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZUJvb2xlYW5EYXRhKGRhdGFiYXNlLnNjaGVtYS5uYW1lLCBlbnRpdHlTY2hlbWEubmFtZSwgY29sdW1uLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvcGVuRGF0YWJhc2UoZGF0YWJhc2U6IERCSW5mbykge1xuICAgICAgICByZXR1cm4gdGhpcy5zcWxpdGUuY3JlYXRlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBkYXRhYmFzZS5zY2hlbWEubmFtZSArICcuZGInLFxuICAgICAgICAgICAgICAgIGxvY2F0aW9uOiAnZGVmYXVsdCdcbiAgICAgICAgfSkudGhlbihzcWxpdGVPYmplY3QgPT4ge1xuICAgICAgICAgICAgZGF0YWJhc2Uuc3FsaXRlT2JqZWN0ID0gc3FsaXRlT2JqZWN0O1xuICAgICAgICAgICAgdGhpcy5sb2dTcWwoc3FsaXRlT2JqZWN0KTtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlUHJvbWlzZXMgPSBfLm1hcChkYXRhYmFzZS5zY2hlbWEuZW50aXRpZXMsIGVudGl0eVNjaGVtYSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RvcmUgPSBuZXcgTG9jYWxEQlN0b3JlKHRoaXMuZGV2aWNlRmlsZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eVNjaGVtYSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWxlLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgICAgICBzcWxpdGVPYmplY3RcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RvcmUuY3JlYXRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChzdG9yZVByb21pc2VzKS50aGVuKHN0b3JlcyA9PiB7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKHN0b3Jlcywgc3RvcmUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhYmFzZS5zdG9yZXNbc3RvcmUuZW50aXR5U2NoZW1hLmVudGl0eU5hbWVdID0gc3RvcmU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFiYXNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZW4gYXBwIGlzIG9wZW5lZCBmb3IgZmlyc3QgdGltZSAgYWZ0ZXIgYSBmcmVzaCBpbnN0YWxsIG9yIHVwZGF0ZSwgdGhlbiBvbGQgZGF0YWJhc2VzIGFyZSByZW1vdmVkIGFuZFxuICAgICAqIG5ldyBkYXRhYmFzZXMgYXJlIGNyZWF0ZWQgdXNpbmcgYnVuZGxlZCBkYXRhYmFzZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Kn0gYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aCB0cnVlLCBpZiB0aGUgZGF0YWJhc2VzIGFyZSBuZXdseSBjcmVhdGVkIG9yIHJlc29sdmVkIHdpdGggZmFsc2VcbiAgICAgKiBpZiBleGlzdGluZyBkYXRhYmFzZXMgYXJlIGJlaW5nIHVzZWQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRVcERhdGFiYXNlcygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlU2VydmljZS5nZXRBcHBCdWlsZFRpbWUoKVxuICAgICAgICAgICAgLnRoZW4oKGJ1aWxkVGltZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRiSW5mbyA9IHRoaXMuZGV2aWNlU2VydmljZS5nZXRFbnRyeSgnZGF0YWJhc2UnKSB8fCB7fTtcbiAgICAgICAgICAgICAgICBpZiAoIWRiSW5mby5sYXN0QnVpbGRUaW1lIHx8IGRiSW5mby5sYXN0QnVpbGRUaW1lICE9PSBidWlsZFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYW5BbmRDb3B5RGF0YWJhc2VzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYkluZm8ubGFzdEJ1aWxkVGltZSA9IGJ1aWxkVGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXZpY2VTZXJ2aWNlLnN0b3JlRW50cnkoJ2RhdGFiYXNlJywgZGJJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4gdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==