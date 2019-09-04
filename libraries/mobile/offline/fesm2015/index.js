import { CommonModule } from '@angular/common';
import { AppVersion } from '@ionic-native/app-version';
import { File } from '@ionic-native/file';
import { SQLite } from '@ionic-native/sqlite';
import { SecurityService } from '@wm/security';
import { from } from 'rxjs';
import { Injectable, NgModule, defineInjectable, inject } from '@angular/core';
import { convertToBlob, isDefined, DataType, DEFAULT_FORMATS, executePromiseChain, extractType, isAndroid, isArray, isIos, noop, toPromise, getAbortableDefer, isString, triggerFn, AbstractHttpService, App, hasCordova, $parseExpr, defer } from '@wm/core';
import { DeviceFileService, DeviceService, DeviceFileUploadService, NetworkService } from '@wm/mobile/core';
import { SWAGGER_CONSTANTS, formatDate, LVService, LiveVariableUtils } from '@wm/variables';

class LocalKeyValueService {
    /**
     * retrieves the value mapped to the key.
     *
     * @param {string} key key
     * @returns {object} a promise that is resolved when value is retrieved from store.
     */
    get(key) {
        return this.fetchEntry(key)
            .then(result => {
            let value;
            if (result && result.length > 0) {
                value = result[0].value;
                if (value) {
                    value = JSON.parse(value);
                }
            }
            return value;
        });
    }
    /**
     * Initializes the service with the given store.
     *
     * @param {object} storeToUse a store with id, key, value with fields.
     * @returns {object} a promise that is resolved when data is persisted.
     */
    init(storeToUse) {
        this.store = storeToUse;
    }
    /**
     * clear data in all databases.
     *
     * @param {string} key key
     * @param {string} value value
     * @returns {object} a promise that is resolved when data is persisted.
     */
    put(key, value) {
        if (value) {
            value = JSON.stringify(value);
        }
        return this.fetchEntry(key).then(result => {
            if (result && result.length > 0) {
                return this.store.save({
                    'id': result[0].id,
                    'key': key,
                    'value': value
                });
            }
            return this.store.add({
                'key': key,
                'value': value
            });
        });
    }
    /**
     * clear data in all databases.
     *
     * @param {string} key key
     * @returns {object} a promise that is resolved when respective value is removed from store.
     */
    remove(key) {
        return this.fetchEntry(key).then(result => {
            if (result && result.length > 0) {
                return this.store.delete(result[0].id);
            }
        });
    }
    fetchEntry(key) {
        const filterCriteria = [{
                'attributeName': 'key',
                'attributeValue': key,
                'attributeType': 'STRING',
                'filterCondition': 'EQUALS'
            }];
        return this.store.filter(filterCriteria);
    }
}
LocalKeyValueService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
LocalKeyValueService.ngInjectableDef = defineInjectable({ factory: function LocalKeyValueService_Factory() { return new LocalKeyValueService(); }, token: LocalKeyValueService, providedIn: "root" });

const WM_LOCAL_OFFLINE_CALL = 'WM_LOCAL_OFFLINE_CALL';
const escapeName = (name) => {
    if (name) {
        name = name.replace(/"/g, '""');
        return '"' + name + '"';
    }
};

const insertRecordSqlTemplate = (schema) => {
    const columnNames = [], placeHolder = [];
    _.forEach(schema.columns, col => {
        columnNames.push(escapeName(col.name));
        placeHolder.push('?');
    });
    return `INSERT INTO ${escapeName(schema.name)} (${columnNames.join(',')}) VALUES (${placeHolder.join(',')})`;
};
const replaceRecordSqlTemplate = (schema) => {
    const columnNames = [], placeHolder = [];
    _.forEach(schema.columns, col => {
        columnNames.push(escapeName(col.name));
        placeHolder.push('?');
    });
    return `REPLACE INTO ${escapeName(schema.name)} (${columnNames.join(',')}) VALUES (${placeHolder.join(',')})`;
};
const deleteRecordTemplate = (schema) => {
    const primaryKeyField = _.find(schema.columns, 'primaryKey');
    if (primaryKeyField) {
        return `DELETE FROM ${escapeName(schema.name)} WHERE ${escapeName(primaryKeyField.name)} = ?`;
    }
    return '';
};
const selectSqlTemplate = (schema) => {
    const columns = [], joins = [];
    schema.columns.forEach(col => {
        let childTableName;
        columns.push(escapeName(schema.name) + '.' + escapeName(col.name) + ' as ' + col.fieldName);
        if (col.foreignRelations) {
            col.foreignRelations.forEach(foreignRelation => {
                childTableName = foreignRelation.sourceFieldName;
                _.forEach(foreignRelation.dataMapper, (childCol, childFiledName) => {
                    columns.push(childTableName + '.' + escapeName(childCol.name) + ' as \'' + childFiledName + '\'');
                });
                joins.push(` LEFT JOIN ${escapeName(foreignRelation.targetTable)} ${childTableName}
                         ON ${childTableName}.${escapeName(foreignRelation.targetColumn)} = ${escapeName(schema.name)}.${escapeName(col.name)}`);
            });
        }
    });
    return `SELECT ${columns.join(',')} FROM ${escapeName(schema.name)} ${joins.join(' ')}`;
};
const countQueryTemplate = (schema) => {
    const joins = [];
    schema.columns.forEach(col => {
        let childTableName;
        if (col.foreignRelations) {
            col.foreignRelations.forEach(foreignRelation => {
                childTableName = foreignRelation.sourceFieldName;
                joins.push(` LEFT JOIN ${escapeName(foreignRelation.targetTable)} ${childTableName}
                         ON ${childTableName}.${escapeName(foreignRelation.targetColumn)} = ${escapeName(schema.name)}.${escapeName(col.name)}`);
            });
        }
    });
    return `SELECT count(*) as count FROM ${escapeName(schema.name)} ${joins.join(' ')}`;
};
const generateWherClause = (store, filterCriteria) => {
    let conditions;
    const fieldToColumnMapping = store.fieldToColumnMapping, tableName = store.entitySchema.name;
    if (!_.isEmpty(filterCriteria) && _.isString(filterCriteria)) {
        return ' WHERE ' + filterCriteria;
    }
    if (filterCriteria) {
        conditions = filterCriteria.map(filterCriterion => {
            const colName = fieldToColumnMapping[filterCriterion.attributeName], condition = filterCriterion.filterCondition;
            let target = filterCriterion.attributeValue, operator = '=';
            if (filterCriterion.attributeType === 'STRING') {
                if (condition === 'STARTING_WITH') {
                    target = target + '%';
                    operator = 'like';
                }
                else if (condition === 'ENDING_WITH') {
                    target = '%' + target;
                    operator = 'like';
                }
                else if (condition === 'CONTAINING') {
                    target = '%' + target + '%';
                    operator = 'like';
                }
                target = `'${target}'`;
            }
            else if (filterCriterion.attributeType === 'BOOLEAN') {
                target = (target === true ? 1 : 0);
            }
            return `${escapeName(tableName)}.${escapeName(colName)} ${operator} ${target}`;
        });
    }
    return conditions && conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
};
const generateOrderByClause = (store, sort) => {
    if (sort) {
        return ' ORDER BY ' + _.map(sort.split(','), field => {
            const splits = _.trim(field).split(' ');
            splits[0] = escapeName(store.entitySchema.name) + '.' + escapeName(store.fieldToColumnMapping[splits[0]]);
            return splits.join(' ');
        }).join(',');
    }
    return '';
};
const geneateLimitClause = page => {
    page = page || {};
    return ' LIMIT ' + (page.limit || 100) + ' OFFSET ' + (page.offset || 0);
};
const mapRowDataToObj = (schema, dataObj) => {
    schema.columns.forEach(col => {
        const val = dataObj[col.fieldName];
        if (col.foreignRelations) {
            col.foreignRelations.forEach(foreignRelation => {
                let childEntity = null;
                _.forEach(foreignRelation.dataMapper, function (childCol, childFieldName) {
                    const fieldValue = dataObj[childFieldName];
                    if (isDefined(fieldValue) && fieldValue !== null && fieldValue !== '') {
                        childEntity = childEntity || {};
                        childEntity[childCol.fieldName] = dataObj[childFieldName];
                    }
                    delete dataObj[childFieldName];
                });
                dataObj[foreignRelation.sourceFieldName] = childEntity;
            });
        }
        else if (col.sqlType === 'boolean' && !_.isNil(val)) {
            dataObj[col.fieldName] = (val === 1);
        }
    });
    return dataObj;
};
const getValue = (entity, col) => {
    let value = entity[col.fieldName];
    if (col.foreignRelations) {
        col.foreignRelations.some(foreignRelation => {
            if (foreignRelation.targetEntity && entity[foreignRelation.sourceFieldName]) {
                value = entity[foreignRelation.sourceFieldName][foreignRelation.targetFieldName];
                return true;
            }
            return false;
        });
    }
    if (_.isNil(value)) {
        return col.defaultValue;
    }
    else if (col.sqlType === 'boolean') {
        return (value === true ? 1 : 0);
    }
    else {
        return value;
    }
};
const mapObjToRow = (store, entity) => {
    const row = {};
    store.entitySchema.columns.forEach(col => row[col.name] = getValue(entity, col));
    return row;
};
class LocalDBStore {
    constructor(deviceFileService, entitySchema, file, localDbManagementService, sqliteObject) {
        this.deviceFileService = deviceFileService;
        this.entitySchema = entitySchema;
        this.file = file;
        this.localDbManagementService = localDbManagementService;
        this.sqliteObject = sqliteObject;
        this.fieldToColumnMapping = {};
        this.primaryKeyField = _.find(this.entitySchema.columns, 'primaryKey');
        this.primaryKeyName = this.primaryKeyField ? this.primaryKeyField.fieldName : undefined;
        this.entitySchema.columns.forEach(c => {
            this.fieldToColumnMapping[c.fieldName] = c.name;
            if (c.foreignRelations) {
                c.foreignRelations.forEach(foreignRelation => {
                    this.fieldToColumnMapping[foreignRelation.targetPath] = c.name;
                    _.forEach(foreignRelation.dataMapper, (childCol, childFieldName) => {
                        this.fieldToColumnMapping[childFieldName] = foreignRelation.sourceFieldName + '.' + childCol.name;
                    });
                });
            }
        });
        this.insertRecordSqlTemplate = insertRecordSqlTemplate(this.entitySchema);
        this.replaceRecordSqlTemplate = replaceRecordSqlTemplate(this.entitySchema);
        this.deleteRecordTemplate = deleteRecordTemplate(this.entitySchema);
        this.selectSqlTemplate = selectSqlTemplate(this.entitySchema);
        this.countQuery = countQueryTemplate(this.entitySchema);
    }
    add(entity) {
        if (this.primaryKeyName) {
            const idValue = entity[this.primaryKeyName];
            if (this.primaryKeyField.sqlType === 'number'
                && (!isDefined(idValue) || (_.isString(idValue) && _.isEmpty(_.trim(idValue))))) {
                if (this.primaryKeyField.generatorType === 'identity') {
                    // updating the id with the latest id obtained from nextId.
                    entity[this.primaryKeyName] = this.localDbManagementService.nextIdCount();
                }
                else {
                    // for assigned type, get the primaryKeyValue from the relatedTableData which is inside the entity
                    const primaryKeyValue = this.getValue(entity, this.primaryKeyName);
                    entity[this.primaryKeyName] = primaryKeyValue;
                }
            }
        }
        const rowData = mapObjToRow(this, entity);
        const params = this.entitySchema.columns.map(f => rowData[f.name]);
        return this.sqliteObject.executeSql(this.insertRecordSqlTemplate, params)
            .then(result => result.insertId);
    }
    /**
     * clears all data of this store.
     * @returns {object} promise
     */
    clear() {
        return this.sqliteObject.executeSql('DELETE FROM ' + escapeName(this.entitySchema.name));
    }
    /**
     * creates the stores if it does not exist
     * @returns {Promise<any>}
     */
    create() {
        return this.sqliteObject.executeSql(this.createTableSql(this.entitySchema)).then(() => this);
    }
    /**
     * counts the number of records that satisfy the given filter criteria.
     * @param {FilterCriterion[]} filterCriteria
     * @returns {object} promise that is resolved with count
     */
    count(filterCriteria) {
        const sql = this.countQuery + generateWherClause(this, filterCriteria);
        return this.sqliteObject.executeSql(sql).then(result => result.rows.item(0)['count']);
    }
    /**
     * This function deserializes the given map object to FormData, provided that map object was
     * serialized by using serialize method of this store.
     * @param  {object} map object to deserialize
     * @returns {object} promise that is resolved with the deserialized FormData.
     */
    deserialize(map) {
        return this.deserializeMapToFormData(map);
    }
    /**
     * filters data of this store that statisfy the given filter criteria.
     * @param {FilterCriterion[]} filterCriteria
     * @param  {string=} sort ex: 'filedname asc/desc'
     * @param  {object=} page {'offset' : 0, "limit" : 20}
     * @returns {object} promise that is resolved with the filtered data.
     */
    filter(filterCriteria, sort, page) {
        let sql = this.selectSqlTemplate;
        sql += generateWherClause(this, filterCriteria);
        sql += generateOrderByClause(this, sort);
        sql += geneateLimitClause(page);
        return this.sqliteObject.executeSql(sql)
            .then(result => {
            const objArr = [], rowCount = result.rows.length;
            for (let i = 0; i < rowCount; i++) {
                objArr.push(mapRowDataToObj(this.entitySchema, result.rows.item(i)));
            }
            return objArr;
        });
    }
    // fetches all the data related to the primaryKey
    refresh(data) {
        const primaryKeyName = this.primaryKeyName;
        const primaryKey = this.getValue(data, primaryKeyName);
        if (!primaryKey) {
            return Promise.resolve(data);
        }
        return this.get(primaryKey);
    }
    /**
     * deletes the record with the given primary key.
     * @param  {object} primaryKey primary key of the record
     * @returns {object} promise
     */
    delete(primaryKey) {
        return this.sqliteObject.executeSql(this.deleteRecordTemplate, [primaryKey]);
    }
    /**
     * finds the record with the given primary key.
     * @param  {object} primaryKey primary key of the record
     * @returns {object} promise that is resolved with entity
     */
    get(primaryKey) {
        const filterCriteria = [{
                attributeName: this.primaryKeyName,
                filterCondition: '=',
                attributeValue: primaryKey,
                attributeType: this.primaryKeyField.sqlType.toUpperCase()
            }];
        return this.filter(filterCriteria).then(function (obj) {
            return obj && obj.length === 1 ? obj[0] : undefined;
        });
    }
    /**
     * retrieve the value for the given field.
     *
     * @param entity
     * @param {string} fieldName
     * @returns {undefined | any | number}
     */
    getValue(entity, fieldName) {
        const column = this.entitySchema.columns.find(col => col.fieldName === fieldName);
        return getValue(entity, column);
    }
    /**
     * saves the given entity to the store. If the record is not available, then a new record will be created.
     * @param {object} entity the entity to save
     * @returns {object} promise
     */
    save(entity) {
        return this.saveAll([entity]);
    }
    /**
     * saves the given entity to the store. If the record is not available, then a new record will be created.
     * @param {object} entities the entity to save
     * @returns {object} promise
     */
    saveAll(entities) {
        // filtering the null entities
        entities = _.filter(entities, null);
        const queries = _.map(entities, entity => {
            const rowData = mapObjToRow(this, entity);
            const params = this.entitySchema.columns.map(f => rowData[f.name]);
            return [this.replaceRecordSqlTemplate, params];
        });
        return this.sqliteObject.sqlBatch(queries);
    }
    /**
     * Based on this store columns, this function converts the given FormData to a map object.
     * Multipart file is stored as a local file. If form data cannot be serialized,
     * then formData is returned back.
     * @param  {FormData} formData object to serialize
     * @returns {object} promise that is resolved with a map.
     */
    serialize(formData) {
        return this.serializeFormDataToMap(formData);
    }
    /**
     * Save blob to a local file
     * @param blob
     * @returns {*}
     */
    saveBlobToFile(blob) {
        const fileName = this.deviceFileService.appendToFileName(blob.name), uploadDir = this.deviceFileService.getUploadDirectory();
        return this.file.writeFile(uploadDir, fileName, blob).then(function () {
            return {
                'name': blob.name,
                'type': blob.type,
                'lastModified': blob.lastModified,
                'lastModifiedDate': blob.lastModifiedDate,
                'size': blob.size,
                'wmLocalPath': uploadDir + '/' + fileName
            };
        });
    }
    /**
     * Converts form data object to map for storing request in local database..
     */
    serializeFormDataToMap(formData) {
        const blobColumns = _.filter(this.entitySchema.columns, {
            'sqlType': 'blob'
        }), promises = [];
        let map = {};
        if (formData && typeof formData.append === 'function' && formData.rowData) {
            _.forEach(formData.rowData, (fieldData, fieldName) => {
                if (fieldData && _.find(blobColumns, { 'fieldName': fieldName })) {
                    promises.push(this.saveBlobToFile(fieldData).then(localFile => {
                        map[fieldName] = localFile;
                    }));
                }
                else {
                    map[fieldName] = fieldData;
                }
            });
        }
        else {
            map = formData;
        }
        return Promise.all(promises).then(() => map);
    }
    /**
     * Converts map object back to form data.
     */
    deserializeMapToFormData(map) {
        const formData = new FormData(), blobColumns = this.entitySchema.columns.filter(c => c.sqlType === 'blob'), promises = [];
        _.forEach(blobColumns, column => {
            const value = map[column.fieldName];
            if (value && value.wmLocalPath) {
                promises.push(convertToBlob(value.wmLocalPath)
                    .then(result => formData.append(column.fieldName, result.blob, value.name)));
                map[column.fieldName] = '';
            }
        });
        formData.append(SWAGGER_CONSTANTS.WM_DATA_JSON, new Blob([JSON.stringify(map)], {
            type: 'application/json'
        }));
        return Promise.all(promises).then(() => formData);
    }
    createTableSql(schema) {
        const fieldStr = _.reduce(schema.columns, (result, f) => {
            let str = escapeName(f.name);
            if (f.primaryKey) {
                if (f.sqlType === 'number' && f.generatorType === 'databaseIdentity') {
                    str += ' INTEGER PRIMARY KEY AUTOINCREMENT';
                }
                else {
                    str += ' PRIMARY KEY';
                }
            }
            return result ? result + ',' + str : str;
        }, false);
        return `CREATE TABLE IF NOT EXISTS ${escapeName(schema.name)} (${fieldStr})`;
    }
}

class DBInfo {
    constructor() {
        this.schema = {
            name: '',
            isInternal: false,
            entities: new Map()
        };
        this.stores = new Map();
        this.queries = new Map();
    }
}
class ColumnInfo {
    constructor(name, fieldName) {
        this.name = name;
        this.fieldName = fieldName;
        this.primaryKey = false;
        this.fieldName = this.fieldName || this.name;
    }
}
var PullType;
(function (PullType) {
    PullType["LIVE"] = "LIVE";
    PullType["BUNDLED"] = "BUNDLED";
    PullType["APP_START"] = "APP_START";
})(PullType || (PullType = {}));

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
class LocalDBManagementService {
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
LocalDBManagementService.ngInjectableDef = defineInjectable({ factory: function LocalDBManagementService_Factory() { return new LocalDBManagementService(inject(AppVersion), inject(DeviceService), inject(DeviceFileService), inject(File), inject(LocalKeyValueService), inject(SecurityService), inject(SQLite)); }, token: LocalDBManagementService, providedIn: "root" });

class PushService {
}
const CONTEXT_KEY = 'changeLogService.flushContext';
const LAST_PUSH_INFO_KEY = 'changeLogService.lastPushInfo';
class ChangeLogService {
    constructor(localDBManagementService, localKeyValueService, pushService, networkService) {
        this.localDBManagementService = localDBManagementService;
        this.localKeyValueService = localKeyValueService;
        this.pushService = pushService;
        this.networkService = networkService;
        this.workers = [];
        this.currentPushInfo = {};
        this.addWorker(new FlushTracker(this, this.localKeyValueService, this.currentPushInfo));
    }
    /**
     * adds a service call to the log. Call will be invoked in next flush.
     *
     * @Param {string} name of service (This should be available through $injector)
     * @Param {string} name of method to invoke.
     * @Param {object} params
     */
    add(service, operation, params) {
        const change = {
            service: service,
            operation: operation,
            params: params,
            hasError: 0
        };
        return executePromiseChain(this.getWorkers('transformParamsToMap'), [change])
            .then(() => executePromiseChain(this.getWorkers('onAddCall'), [change]))
            .then(() => {
            change.params = JSON.stringify(change.params);
            return this.getStore().then(store => store.add(change)).then(noop);
        });
    }
    addWorker(worker) {
        this.workers.push(worker);
    }
    /**
     * Clears the current log.
     */
    clearLog() {
        return this.getStore().then(s => s.clear());
    }
    /**
     * Flush the current log. If a flush is already running, then the promise of that flush is returned back.
     */
    flush(progressObserver) {
        let flushPromise;
        if (!this.deferredFlush) {
            this.deferredFlush = getAbortableDefer();
            this.createContext().then(context => {
                this.flushContext = context;
                return executePromiseChain(this.getWorkers('preFlush'), [this.flushContext]);
            })
                .then(() => {
                flushPromise = this._flush(progressObserver);
                this.deferredFlush.onAbort = () => flushPromise.abort();
                return flushPromise;
            })
                .catch(noop)
                .then(() => {
                Promise.resolve().then(() => {
                    if (this.currentPushInfo.totalTaskCount === this.currentPushInfo.completedTaskCount) {
                        return this.flushContext.clear().then(() => this.flushContext = null);
                    }
                }).then(() => {
                    progressObserver.complete();
                    if (this.currentPushInfo.failedTaskCount > 0) {
                        this.deferredFlush.reject(this.currentPushInfo);
                    }
                    else {
                        this.deferredFlush.resolve(this.currentPushInfo);
                    }
                    this.deferredFlush = null;
                }).then(() => {
                    return executePromiseChain(this.getWorkers('postFlush'), [this.currentPushInfo, this.flushContext]);
                });
            });
        }
        return this.deferredFlush.promise;
    }
    /**
     * Returns the complete change list
     */
    getChanges() {
        return this.getStore().then(s => s.filter(undefined, 'id', {
            offset: 0,
            limit: 500
        })).then(changes => {
            changes.forEach(change => {
                change.params = JSON.parse(change.params);
            });
            return changes;
        });
    }
    /**
     * @returns {array} an array of changes that failed with error.
     */
    getErrors() {
        return this.getStore().then(s => s.filter([{
                attributeName: 'hasError',
                attributeValue: 1,
                attributeType: 'NUMBER',
                filterCondition: 'EQUALS'
            }]));
    }
    getLastPushInfo() {
        return this.localKeyValueService.get(LAST_PUSH_INFO_KEY)
            .then(info => {
            if (isString(info.startTime)) {
                info.startTime = new Date(info.startTime);
            }
            if (isString(info.endTime)) {
                info.endTime = new Date(info.endTime);
            }
            return info;
        });
    }
    /**
     * @returns {number} number of changes that are pending to push.
     */
    getLogLength() {
        return this.getStore().then(s => s.count([{
                attributeName: 'hasError',
                attributeValue: 0,
                attributeType: 'NUMBER',
                filterCondition: 'EQUALS'
            }]));
    }
    /*
    * Retrieves the entity store to use by ChangeLogService.
    */
    getStore() {
        return this.localDBManagementService.getStore('wavemaker', 'offlineChangeLog');
    }
    /**
     * Returns true, if a flush process is in progress. Otherwise, returns false.
     *
     * @returns {boolean} returns true, if a flush process is in progress. Otherwise, returns false.
     */
    isFlushInProgress() {
        return !(_.isUndefined(this.deferredFlush) || _.isNull(this.deferredFlush));
    }
    /**
     * Stops the ongoing flush process.
     *
     * @returns {object} a promise that is resolved when the flush process is stopped.
     */
    stop() {
        return new Promise(resolve => {
            if (this.deferredFlush) {
                this.deferredFlush.promise.catch().then(resolve);
                this.deferredFlush.promise.abort();
            }
            else {
                resolve();
            }
        });
    }
    createContext() {
        return this.localKeyValueService.get(CONTEXT_KEY)
            .then(context => {
            context = context || {};
            return {
                'clear': () => {
                    context = {};
                    return this.localKeyValueService.remove(CONTEXT_KEY);
                },
                'get': key => {
                    let value = context[key];
                    if (!value) {
                        value = {};
                        context[key] = value;
                    }
                    return value;
                },
                'save': () => this.localKeyValueService.put(CONTEXT_KEY, context)
            };
        });
    }
    // Flushes the complete log one after another.
    _flush(progressObserver, defer$$1) {
        defer$$1 = defer$$1 || getAbortableDefer();
        if (defer$$1.isAborted) {
            return Promise.resolve();
        }
        this.getNextChange()
            .then(change => {
            if (change) {
                change.params = JSON.parse(change.params);
                return this.flushChange(change);
            }
        })
            .then(change => {
            progressObserver.next(this.currentPushInfo);
            if (change) {
                return this.getStore()
                    .then(s => s.delete(change.id))
                    .then(() => this._flush(progressObserver, defer$$1));
            }
            else {
                defer$$1.resolve();
            }
        }, change => {
            if (this.networkService.isConnected()) {
                change.hasError = 1;
                change.params = JSON.stringify(change.params);
                this.getStore()
                    .then(s => s.save(change))
                    .then(() => this._flush(progressObserver, defer$$1));
            }
            else {
                let connectPromise = this.networkService.onConnect();
                defer$$1.promise.catch(function () {
                    if (connectPromise) {
                        connectPromise.abort();
                    }
                });
                connectPromise.then(() => {
                    this._flush(progressObserver, defer$$1);
                    connectPromise = null;
                });
            }
        });
        return defer$$1.promise;
    }
    flushChange(change) {
        const self = this;
        return executePromiseChain(this.getWorkers('preCall'), [change])
            .then(() => change.hasError ? Promise.reject(change.errorMessage) : '')
            .then(() => executePromiseChain(this.getWorkers('transformParamsFromMap'), [change]))
            .then(() => this.pushService.push(change))
            .then(function () {
            return executePromiseChain(_.reverse(self.getWorkers('postCallSuccess')), [change, arguments])
                .then(() => change);
        }).catch(function () {
            if (self.networkService.isConnected()) {
                return executePromiseChain(_.reverse(self.getWorkers('postCallError')), [change, arguments])
                    .catch(noop).then(() => Promise.reject(change));
            }
            return Promise.reject(change);
        });
    }
    // Flushes the first registered change.
    getNextChange() {
        const filterCriteria = [{
                attributeName: 'hasError',
                attributeValue: 0,
                attributeType: 'NUMBER',
                filterCondition: 'EQUALS'
            }];
        return this.getStore().then(s => s.filter(filterCriteria, 'id', {
            offset: 0,
            limit: 1
        })).then((changes) => {
            return changes && changes[0];
        });
    }
    getWorkers(type) {
        return _.map(this.workers, w => w[type] && w[type].bind(w));
    }
}
ChangeLogService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
ChangeLogService.ctorParameters = () => [
    { type: LocalDBManagementService },
    { type: LocalKeyValueService },
    { type: PushService },
    { type: NetworkService }
];
ChangeLogService.ngInjectableDef = defineInjectable({ factory: function ChangeLogService_Factory() { return new ChangeLogService(inject(LocalDBManagementService), inject(LocalKeyValueService), inject(PushService), inject(NetworkService)); }, token: ChangeLogService, providedIn: "root" });
class FlushTracker {
    constructor(changeLogService, localKeyValueService, pushInfo) {
        this.changeLogService = changeLogService;
        this.localKeyValueService = localKeyValueService;
        this.pushInfo = pushInfo;
        this.logger = window.console;
    }
    onAddCall(change) {
        this.logger.debug('Added the following call %o to log.', change);
    }
    preFlush(flushContext) {
        this.pushInfo.totalTaskCount = 0;
        this.pushInfo.successfulTaskCount = 0;
        this.pushInfo.failedTaskCount = 0;
        this.pushInfo.completedTaskCount = 0;
        this.pushInfo.inProgress = true;
        this.pushInfo.startTime = new Date();
        this.flushContext = flushContext;
        this.logger.debug('Starting flush');
        return this.changeLogService.getStore().then(store => {
            return store.count([{
                    attributeName: 'hasError',
                    attributeValue: 0,
                    attributeType: 'NUMBER',
                    filterCondition: 'EQUALS'
                }]);
        }).then(count => this.pushInfo.totalTaskCount = count);
    }
    postFlush(stats, flushContext) {
        this.logger.debug('flush completed. {Success : %i , Error : %i , completed : %i, total : %i }.', this.pushInfo.successfulTaskCount, this.pushInfo.failedTaskCount, this.pushInfo.completedTaskCount, this.pushInfo.totalTaskCount);
        this.pushInfo.inProgress = false;
        this.pushInfo.endTime = new Date();
        this.localKeyValueService.put(LAST_PUSH_INFO_KEY, this.pushInfo);
        this.flushContext = null;
    }
    preCall(change) {
        this.logger.debug('%i. Invoking call %o', (1 + this.pushInfo.completedTaskCount), change);
    }
    postCallError(change, response) {
        this.pushInfo.completedTaskCount++;
        this.pushInfo.failedTaskCount++;
        this.logger.error('call failed with the response %o.', response);
        return this.flushContext.save();
    }
    postCallSuccess(change, response) {
        this.pushInfo.completedTaskCount++;
        this.pushInfo.successfulTaskCount++;
        this.logger.debug('call returned the following response %o.', response);
        return this.flushContext.save();
    }
}

class LocalDbService {
    constructor(localDBManagementService) {
        this.localDBManagementService = localDBManagementService;
        this.searchTableData = this.readTableData.bind(this);
        this.searchTableDataWithQuery = this.readTableData.bind(this);
        this.getDistinctDataByFields = this.readTableData.bind(this);
    }
    getStore(params) {
        return this.localDBManagementService.getStore(params.dataModelName, params.entityName);
    }
    /**
     * Method to insert data into the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be inserted.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    insertTableData(params, successCallback, failureCallback) {
        this.getStore(params).then(store => {
            const isPKAutoIncremented = (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity');
            if (isPKAutoIncremented && params.data[store.primaryKeyName]) {
                delete params.data[store.primaryKeyName];
            }
            return store.add(params.data).then(() => {
                store.refresh(params.data).then(successCallback);
            });
        }).catch(failureCallback);
    }
    /**
     * Method to insert multi part data into the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be inserted.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    insertMultiPartTableData(params, successCallback, failureCallback) {
        this.getStore(params).then(store => {
            store.serialize(params.data).then(data => {
                params.data = data;
                this.insertTableData(params, successCallback, failureCallback);
            });
        }).catch(failureCallback);
    }
    /**
     * Method to update data in the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be updated.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    updateTableData(params, successCallback, failureCallback) {
        this.getStore(params).then(store => {
            return store.save(params.data)
                .then(() => {
                store.refresh(params.data).then(successCallback);
            });
        }).catch(failureCallback);
    }
    /**
     * Method to update multi part data in the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be updated.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    updateMultiPartTableData(params, successCallback, failureCallback) {
        const data = (params.data && params.data.rowData) || params.data;
        this.getStore(params).then(store => {
            return store.save(data);
        }).then(() => {
            if (successCallback) {
                successCallback(data);
            }
        }).catch(failureCallback);
    }
    /**
     * Method to delete data in the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be inserted.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    deleteTableData(params, successCallback, failureCallback) {
        this.getStore(params).then(store => {
            const pkField = store.primaryKeyField, id = params[pkField.fieldName] || params[pkField.name] || (params.data && params.data[pkField.fieldName]) || params.id;
            store.delete(id).then(successCallback);
        }).catch(failureCallback);
    }
    /**
     * Method to read data from a specified table.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be inserted.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    readTableData(params, successCallback, failureCallback) {
        this.getStore(params).then(store => {
            let filter = params.filter((filterGroup, filterFields) => {
                this.convertFieldNameToColumnName(store, filterGroup, filterFields);
            }, true);
            // convert wm_bool function with boolean value to 0/1
            filter = filter.replace(/wm_bool\('true'\)/g, 1).replace(/wm_bool\('false'\)/g, 0);
            return store.count(filter).then(totalElements => {
                const sort = params.sort.split('=')[1];
                return store.filter(filter, sort, {
                    offset: (params.page - 1) * params.size,
                    limit: params.size
                }).then(data => {
                    const totalPages = Math.ceil(totalElements / params.size);
                    successCallback({
                        'content': data,
                        'first': (params.page === 1),
                        'last': (params.page === totalPages),
                        'number': (params.page - 1),
                        'numberOfElements': data.length,
                        'size': params.size,
                        'sort': {
                            'sorted': !!sort,
                            'unsorted': !sort
                        },
                        'totalElements': totalElements,
                        'totalPages': totalPages
                    });
                });
            });
        }).catch(failureCallback);
    }
    escapeName(name) {
        if (name) {
            name = name.replace(/"/g, '""');
            return '"' + name.replace(/\./g, '"."') + '"';
        }
        return name;
    }
    // returns the columnName appending with the schema name.
    getColumnName(store, fieldName) {
        if (store.fieldToColumnMapping[fieldName]) {
            const columnName = this.escapeName(store.fieldToColumnMapping[fieldName]);
            if (columnName.indexOf('.') < 0) {
                return this.escapeName(store.entitySchema.name) + '.' + columnName;
            }
            return columnName;
        }
        return fieldName;
    }
    convertFieldNameToColumnName(store, filterGroup, options) {
        _.forEach(filterGroup.rules, rule => {
            if (rule.rules) {
                this.convertFieldNameToColumnName(store, rule);
            }
            else {
                rule.target = this.getColumnName(store, rule.target);
            }
        });
        // handling the scenario where variable options can have filterField. For example: search filter query
        if (options && options.filterFields) {
            options.filterFields = _.mapKeys(options.filterFields, (v, k) => {
                return this.getColumnName(store, k);
            });
        }
    }
}
LocalDbService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
LocalDbService.ctorParameters = () => [
    { type: LocalDBManagementService }
];
LocalDbService.ngInjectableDef = defineInjectable({ factory: function LocalDbService_Factory() { return new LocalDbService(inject(LocalDBManagementService)); }, token: LocalDbService, providedIn: "root" });

const STORE_KEY = 'offlineFileUpload';
class FileHandler {
    constructor() {
        this.logger = window.console;
    }
    preFlush(context) {
        this.fileStore = context.get(STORE_KEY);
    }
    /**
     * Replaces all local paths with the remote path using mappings created during 'uploadToServer'.
     */
    preCall(change) {
        if (change.service === 'DatabaseService') {
            change.params.data = _.mapValues(change.params.data, v => {
                const remoteUrl = this.fileStore[v];
                if (remoteUrl) {
                    this.logger.debug('swapped file path from %s -> %s', v, remoteUrl);
                    return remoteUrl;
                }
                return v;
            });
        }
    }
    postCallSuccess(change, response) {
        if (change.service === 'OfflineFileUploadService'
            && change.operation === 'uploadToServer') {
            const remoteFile = JSON.parse(response[0].text)[0];
            /*
             * A mapping will be created between local path and remote path.
             * This will be used to resolve local paths in entities.
             */
            this.fileStore[change.params.file] = remoteFile.path;
            this.fileStore[change.params.file + '?inline'] = remoteFile.inlinePath;
        }
    }
}
class UploadedFilesImportAndExportService {
    constructor(changeLogService, deviceFileService, localDBManagementService, file) {
        this.changeLogService = changeLogService;
        this.deviceFileService = deviceFileService;
        this.localDBManagementService = localDBManagementService;
        this.file = file;
    }
    preExport(folderToExport, meta) {
        // copy offline uploads
        const uploadFullPath = this.deviceFileService.getUploadDirectory(), lastIndexOfSep = uploadFullPath.lastIndexOf('/'), uploadParentDir = uploadFullPath.substring(0, lastIndexOfSep + 1), uploadDirName = uploadFullPath.substring(lastIndexOfSep + 1);
        meta.uploadDir = uploadFullPath;
        return this.file.copyDir(uploadParentDir, uploadDirName, folderToExport, 'uploads');
    }
    postImport(importedFolder, meta) {
        const uploadFullPath = this.deviceFileService.getUploadDirectory(), lastIndexOfSep = uploadFullPath.lastIndexOf('/'), uploadParentDir = uploadFullPath.substring(0, lastIndexOfSep + 1), uploadDirName = uploadFullPath.substring(lastIndexOfSep + 1);
        this.uploadDir = uploadFullPath;
        return this.file.checkDir(importedFolder, 'uploads')
            .then(() => {
            return this.deviceFileService.removeDir(uploadFullPath)
                .then(() => this.file.copyDir(importedFolder, 'uploads', uploadParentDir, uploadDirName))
                .then(() => this.updateChanges(meta));
        }, noop);
    }
    /**
     * returns back the changes that were logged.
     * @param page page number
     * @param size size of page
     * @returns {*}
     */
    getChanges(page, size) {
        return this.changeLogService.getStore().then(strore => {
            return (strore.filter([], 'id', {
                offset: (page - 1) * size,
                limit: size
            }));
        });
    }
    /**
     * If this is a database change, then it will replace old upload directory with the current upload directory
     * and its corresponding owner object, if  it has primary key.
     *
     * @param change
     * @param oldUploadDir
     * @param uploadDir
     * @returns {*}
     */
    updateDBChange(change, oldUploadDir, uploadDir) {
        const modifiedProperties = {}, entityName = change.params.entityName, dataModelName = change.params.dataModelName;
        change.params.data = _.mapValues(change.params.data, function (v, k) {
            let mv = v, isModified = false;
            if (_.isString(v)) {
                mv = _.replace(v, oldUploadDir, uploadDir);
                isModified = !_.isEqual(mv, v);
            }
            else if (_.isObject(v) && v.wmLocalPath) {
                // insertMultiPartData and updateMultiPartData
                mv = _.replace(v.wmLocalPath, oldUploadDir, uploadDir);
                isModified = !_.isEqual(mv, v.wmLocalPath);
            }
            if (isModified) {
                modifiedProperties[k] = mv;
            }
            return mv;
        });
        if (!_.isEmpty(modifiedProperties)) {
            this.localDBManagementService.getStore(dataModelName, entityName)
                .then(store => {
                // If there is a primary for the entity, then update actual row with the modifications
                if (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity') {
                    const primaryKeyName = store.primaryKeyName;
                    const primaryKey = change.params.data[primaryKeyName];
                    return store.get(primaryKey)
                        .then(obj => store.save(_.assignIn(obj, modifiedProperties)));
                }
            }).then(() => {
                change.params = JSON.stringify(change.params);
                return this.changeLogService.getStore().then(store => store.save(change));
            });
        }
    }
    /**
     * This function check this change to update old upload directory path.
     *
     * @param change
     * @param metaInfo
     * @returns {*}
     */
    updateChange(change, metaInfo) {
        change.params = JSON.parse(change.params);
        if (change.service === 'OfflineFileUploadService'
            && change.operation === 'uploadToServer') {
            change.params.file = _.replace(change.params.file, metaInfo.uploadDir, this.uploadDir);
            change.params = JSON.stringify(change.params);
            return this.changeLogService.getStore().then(store => store.save(change));
        }
        if (change.service === 'DatabaseService') {
            return this.updateDBChange(change, metaInfo.uploadDir, this.uploadDir);
        }
    }
    /**
     * This function will visit all the changes and modify them, if necessary.
     * @param metaInfo
     * @param page
     * @returns {*}
     */
    updateChanges(metaInfo, page = 1) {
        const size = 10;
        return this.getChanges(page, size)
            .then(changes => {
            if (changes && changes.length > 0) {
                return Promise.all(changes.map(change => this.updateChange(change, metaInfo)));
            }
        }).then(result => {
            if (result && result.length === size) {
                return this.updateChanges(metaInfo, page + 1);
            }
        });
    }
}

const STORE_KEY$1 = 'errorBlockerStore';
class ErrorBlocker {
    constructor(localDBManagementService) {
        this.localDBManagementService = localDBManagementService;
    }
    preFlush(context) {
        this.errorStore = context.get(STORE_KEY$1);
    }
    // block all calls related to the error entities
    preCall(change) {
        if (change && change.service === 'DatabaseService') {
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            switch (change.operation) {
                case 'insertTableData':
                case 'insertMultiPartTableData':
                case 'updateTableData':
                case 'updateMultiPartTableData':
                    return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                        this.blockCall(store, change, dataModelName, entityName, change.params.data);
                    });
                case 'deleteTableData':
                    return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                        this.blockCall(store, change, dataModelName, entityName, change.params);
                    });
            }
        }
    }
    // store error entity id
    postCallSuccess(change) {
        if (change && change.service === 'DatabaseService') {
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                const id = change['dataLocalId'] || change.params.data[store.primaryKeyName];
                if (!(_.isUndefined(id) || _.isNull(id))) {
                    this.removeError(dataModelName, entityName, id);
                }
            });
        }
    }
    // store error entity id
    postCallError(change) {
        if (change && change.service === 'DatabaseService') {
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                const id = change['dataLocalId'] || (change.params.data && change.params.data[store.primaryKeyName]) || change.params[store.primaryKeyName] || change.params.id;
                if (!(_.isUndefined(id) || _.isNull(id))) {
                    this.recordError(dataModelName, entityName, id);
                }
            });
        }
    }
    /**
     * If there is an earlier call of the object or its relations that got failed, then this call will be
     * marked for discard.
     *
     * @param store LocalDBStore
     * @param change change to block
     * @param dataModelName
     * @param entityName
     * @param data
     */
    blockCall(store, change, dataModelName, entityName, data) {
        if (change.hasError === 0) {
            this.checkForPreviousError(store, change, dataModelName, entityName, data);
            store.entitySchema.columns.forEach(col => {
                if (col.foreignRelations) {
                    col.foreignRelations.some(foreignRelation => {
                        if (data[foreignRelation.sourceFieldName]) {
                            this.blockCall(store, change, dataModelName, foreignRelation.targetEntity, data[foreignRelation.sourceFieldName]);
                        }
                        else if (data[col.fieldName]) {
                            this.checkForPreviousError(store, change, dataModelName, foreignRelation.targetEntity, data, col.fieldName);
                        }
                        return change.hasError === 1;
                    });
                }
            });
        }
    }
    // A helper function to check for earlier failures.
    checkForPreviousError(store, change, dataModelName, entityName, data, key) {
        const primaryKey = key || store.primaryKeyName;
        if (this.hasError(dataModelName, entityName, data[primaryKey])) {
            change.hasError = 1;
            change.errorMessage = `Blocked call due to error in previous call of entity [ ${entityName} ] with id [ ${data[primaryKey]} ]`;
        }
    }
    hasError(dataModelName, entityName, id) {
        if (this.errorStore[dataModelName]
            && this.errorStore[dataModelName][entityName]
            && this.errorStore[dataModelName][entityName][id]) {
            return true;
        }
        return false;
    }
    // Removes entity identifier from error list.
    removeError(dataModelName, entityName, id) {
        if (this.errorStore[dataModelName]
            && this.errorStore[dataModelName][entityName]
            && this.errorStore[dataModelName][entityName][id]) {
            delete this.errorStore[dataModelName][entityName][id];
        }
    }
    // Save error entity identifier.
    recordError(dataModelName, entityName, id) {
        this.errorStore[dataModelName] = this.errorStore[dataModelName] || {};
        this.errorStore[dataModelName][entityName] = this.errorStore[dataModelName][entityName] || {};
        this.errorStore[dataModelName][entityName][id] = true;
    }
}

const STORE_KEY$2 = 'idConflictResolution';
/**
 * In offline database, a insert could generate the Id of an entity. During flush, id of that entity might get changed.
 * Due to that, relationship inconsistency arises. To prevent that, wherever this entity is referred in the next flush
 * call, Id has to be replaced with that of new one.
 */
class IdResolver {
    constructor(localDBManagementService) {
        this.localDBManagementService = localDBManagementService;
        this.logger = window.console;
    }
    preFlush(context) {
        this.idStore = context.get(STORE_KEY$2);
    }
    // Exchane Ids, Before any database operation.
    preCall(change) {
        if (change && change.service === 'DatabaseService') {
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            switch (change.operation) {
                case 'insertTableData':
                case 'insertMultiPartTableData':
                    change.params.skipLocalDB = true;
                    return this.localDBManagementService.getStore(dataModelName, entityName)
                        .then(store => {
                        const primaryKeyName = store.primaryKeyName;
                        if (primaryKeyName) {
                            this.transactionLocalId = change.params.data[primaryKeyName];
                            change['dataLocalId'] = this.transactionLocalId;
                        }
                        return this.exchangeIds(store, dataModelName, entityName, change.params.data)
                            .then(() => {
                            if (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity') {
                                delete change.params.data[primaryKeyName];
                            }
                            else {
                                const relationalPrimaryKeyValue = store.getValue(change.params.data, store.primaryKeyName);
                                // for the data referring to the relational table based on primary key assign the primaryField values to the relationalPrimaryKeyValue
                                if (isDefined(relationalPrimaryKeyValue)) {
                                    change.params.data[primaryKeyName] = relationalPrimaryKeyValue;
                                    if (this.transactionLocalId !== null) {
                                        this.pushIdToStore(dataModelName, entityName, this.transactionLocalId, relationalPrimaryKeyValue);
                                    }
                                }
                                this.transactionLocalId = null;
                            }
                        });
                    });
                case 'updateTableData':
                case 'updateMultiPartTableData':
                case 'deleteTableData':
                    return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                        // on update call, passing id to exchangeId as change.params id(local value 10000000+) is not updated with the latest id from db
                        this.exchangeId(store, dataModelName, entityName, change.params, 'id');
                        if (change.params.data) {
                            return this.exchangeIds(store, dataModelName, entityName, change.params.data);
                        }
                    });
            }
        }
    }
    // After every database insert, track the Id change.
    postCallSuccess(change, response) {
        if (change && change.service === 'DatabaseService'
            && (change.operation === 'insertTableData' || change.operation === 'insertMultiPartTableData')
            && this.transactionLocalId) {
            const data = response[0].body;
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                this.pushIdToStore(dataModelName, entityName, this.transactionLocalId, data[store.primaryKeyName]);
                return store.delete(this.transactionLocalId).catch(noop).then(() => {
                    this.transactionLocalId = null;
                    return store.save(data);
                });
            });
        }
    }
    // store error entity id
    postCallError(change) {
        if (change && change.service === 'DatabaseService'
            && (change.operation === 'insertTableData' || change.operation === 'insertMultiPartTableData')
            && this.transactionLocalId) {
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                change.params.data[store.primaryKeyName] = this.transactionLocalId;
            });
        }
    }
    getEntityIdStore(dataModelName, entityName) {
        this.idStore[dataModelName] = this.idStore[dataModelName] || {};
        this.idStore[dataModelName][entityName] = this.idStore[dataModelName][entityName] || {};
        return this.idStore[dataModelName][entityName];
    }
    // if local id is different, then create a mapping for exchange.
    pushIdToStore(dataModelName, entityName, transactionLocalId, remoteId) {
        if (transactionLocalId !== remoteId) {
            this.getEntityIdStore(dataModelName, entityName)[transactionLocalId] = remoteId;
            this.logger.debug('Conflict found for entity (%s) with local id (%i) and remote Id (%i)', entityName, transactionLocalId, remoteId);
        }
    }
    logResolution(entityName, localId, remoteId) {
        this.logger.debug('Conflict resolved found for entity (%s) with local id (%i) and remote Id (%i)', entityName, localId, remoteId);
    }
    // Exchange primary key  of the given entity
    exchangeId(store, dataModelName, entityName, data, keyName) {
        const primaryKeyName = keyName || store.primaryKeyName;
        const entityIdStore = this.getEntityIdStore(dataModelName, entityName);
        if (data && primaryKeyName) {
            const localId = data[primaryKeyName];
            let remoteId = localId;
            while (entityIdStore[remoteId]) {
                remoteId = entityIdStore[remoteId];
            }
            if (remoteId !== localId) {
                data[primaryKeyName] = remoteId;
                this.logResolution(entityName, localId, remoteId);
            }
        }
    }
    // Looks primary key changes in the given entity or in the relations
    exchangeIds(store, dataModelName, entityName, data) {
        this.exchangeId(store, dataModelName, entityName, data);
        const exchangeIdPromises = [];
        store.entitySchema.columns.forEach(col => {
            if (col.foreignRelations) {
                col.foreignRelations.forEach(foreignRelation => {
                    if (data[col.fieldName]) { // if id value
                        this.exchangeId(store, dataModelName, foreignRelation.targetEntity, data, col.fieldName);
                    }
                    if (data[foreignRelation.sourceFieldName]) { // if object reference
                        exchangeIdPromises.push(this.localDBManagementService.getStore(dataModelName, foreignRelation.targetEntity)
                            .then(refStore => {
                            return this.exchangeIds(refStore, dataModelName, foreignRelation.targetEntity, data[foreignRelation.sourceFieldName]);
                        }));
                    }
                });
            }
        });
        return Promise.all(exchangeIdPromises);
    }
}
IdResolver.decorators = [
    { type: Injectable }
];
/** @nocollapse */
IdResolver.ctorParameters = () => [
    { type: LocalDBManagementService }
];

class MultiPartParamTransformer {
    constructor(deviceFileService, localDBManagementService) {
        this.deviceFileService = deviceFileService;
        this.localDBManagementService = localDBManagementService;
    }
    postCallSuccess(change) {
        if (change && change.service === 'DatabaseService') {
            switch (change.operation) {
                case 'insertMultiPartTableData':
                case 'updateMultiPartTableData':
                    // clean up files
                    _.forEach(change.params.data, v => {
                        if (_.isObject(v) && v.wmLocalPath) {
                            this.deviceFileService.removeFile(v.wmLocalPath);
                        }
                    });
                    break;
            }
        }
    }
    transformParamsFromMap(change) {
        if (change && change.service === 'DatabaseService') {
            switch (change.operation) {
                case 'insertMultiPartTableData':
                case 'updateMultiPartTableData':
                    return this.localDBManagementService.getStore(change.params.dataModelName, change.params.entityName)
                        .then(store => {
                        // construct Form data
                        return store.deserialize(change.params.data).then(function (formData) {
                            change.params.data = formData;
                        });
                    });
            }
        }
    }
    transformParamsToMap(change) {
        if (change && change.service === 'DatabaseService') {
            switch (change.operation) {
                case 'insertMultiPartTableData':
                case 'updateMultiPartTableData':
                    return this.localDBManagementService.getStore(change.params.dataModelName, change.params.entityName)
                        .then(store => {
                        return store.serialize(change.params.data).then(function (map) {
                            change.params.data = map;
                            /**
                             * As save method called with FormData object, empty row is inserted.
                             * Since FormData is converted to map, update the record details now.
                             */
                            store.save(_.mapValues(map, function (v) {
                                return (_.isObject(v) && v.wmLocalPath) || v;
                            }));
                            return map;
                        });
                    });
            }
        }
    }
}

const apiConfiguration = [{
        'name': 'insertTableData',
        'type': 'INSERT'
    }, {
        'name': 'insertMultiPartTableData',
        'type': 'INSERT'
    }, {
        'name': 'updateTableData',
        'type': 'UPDATE'
    }, {
        'name': 'updateMultiPartTableData',
        'type': 'UPDATE'
    }, {
        'name': 'deleteTableData',
        'type': 'DELETE'
    }, {
        'name': 'readTableData',
        'type': 'READ',
        'saveResponse': true
    }, {
        'name': 'searchTableData',
        'type': 'READ',
        'saveResponse': true
    }, {
        'name': 'searchTableDataWithQuery',
        'type': 'READ',
        'saveResponse': true
    }, {
        'name': 'getDistinctDataByFields',
        'type': 'READ',
        'saveResponse': false
    }];
let isOfflineBehaviorAdded = false;
class LiveVariableOfflineBehaviour {
    constructor(changeLogService, httpService, localDBManagementService, networkService, offlineDBService) {
        this.changeLogService = changeLogService;
        this.httpService = httpService;
        this.localDBManagementService = localDBManagementService;
        this.networkService = networkService;
        this.offlineDBService = offlineDBService;
        this.onlineDBService = LVService;
    }
    add() {
        if (!isOfflineBehaviorAdded) {
            isOfflineBehaviorAdded = true;
            const onlineHandler = this.httpService.sendCallAsObservable;
            if (onlineHandler) {
                this.httpService.sendCallAsObservable = (reqParams, params) => {
                    if (!params && _.get(reqParams, 'url')) {
                        params = { url: reqParams.url };
                    }
                    // reqParams will contain the full path of insert/update call which will be processed again in parseConfig method
                    // and will be appended again with '/services/./.' which will result in deployedUrl + '/service/./.' + '/service/./.' which is wrong.
                    // Hence passing url in params
                    const clonedParamsUrl = _.clone(params.url);
                    params = _.extend(params, reqParams);
                    const operation = _.find(apiConfiguration, { name: _.get(params, 'operation') });
                    if (this.networkService.isConnected() || params.onlyOnline || !operation || !params.dataModelName) {
                        return from(this.remoteDBcall(operation, onlineHandler, params));
                    }
                    // converting promise to observable as LVService returns a observable
                    return from(this.localDBManagementService.isOperationAllowed(params.dataModelName, params.entityName, operation.type)
                        .then(isAllowedInOffline => {
                        if (!isAllowedInOffline) {
                            return this.remoteDBcall(operation, onlineHandler, params);
                        }
                        else {
                            let cascader;
                            return Promise.resolve().then(() => {
                                if (!params.isCascadingStopped &&
                                    (operation.name === 'insertTableData'
                                        || operation.name === 'updateTableData')) {
                                    return this.prepareToCascade(params).then(c => cascader = c);
                                }
                            }).then(() => {
                                return new Promise((resolve, reject) => {
                                    this.localDBcall(operation, params, resolve, reject, clonedParamsUrl);
                                });
                            }).then((response) => {
                                if (cascader) {
                                    return cascader.cascade().then(() => {
                                        return this.getStore(params).then(store => {
                                            return store.refresh(response.body);
                                        }).then(data => {
                                            // data includes parent and child data.
                                            if (response && response.body) {
                                                response.body = data;
                                            }
                                            return response;
                                        });
                                    });
                                }
                                return response;
                            });
                        }
                    }));
                };
            }
        }
    }
    getStore(params) {
        return this.localDBManagementService.getStore(params.dataModelName, params.entityName);
    }
    // set hasBlob flag on params when blob field is present
    hasBlob(store) {
        const blobColumns = _.filter(store.entitySchema.columns, {
            'sqlType': 'blob'
        });
        return !!blobColumns.length;
    }
    /*
     * During offline, LocalDBService will answer to all the calls. All data modifications will be recorded
     * and will be reported to DatabaseService when device goes online.
     */
    localDBcall(operation, params, successCallback, failureCallback, clonedParamsUrl) {
        return new Promise((resolve, reject) => {
            this.offlineDBService[operation.name](params, response => {
                if (operation.type === 'READ') {
                    resolve(response);
                }
                else {
                    // add to change log
                    params.onlyOnline = true;
                    params.url = clonedParamsUrl;
                    return this.changeLogService.add('DatabaseService', operation.name, params)
                        .then(() => resolve(response));
                }
            });
        }).then((response) => {
            response = { body: response, type: WM_LOCAL_OFFLINE_CALL };
            triggerFn(successCallback, response);
            return response;
        }, failureCallback);
    }
    /*
     * During online, all read operations data will be pushed to offline database. Similarly, Update and Delete
     * operations are synced with the offline database.
     */
    remoteDBcall(operation, onlineHandler, params) {
        return new Promise((resolve, reject) => {
            onlineHandler.call(this.httpService, params).subscribe(response => {
                if (response && response.type) {
                    if (!params.skipLocalDB) {
                        this.offlineDBService.getStore(params).then((store) => {
                            if (operation.type === 'READ' && operation.saveResponse) {
                                store.saveAll(response.body.content);
                            }
                            else if (operation.type === 'INSERT') {
                                params = _.clone(params);
                                params.data = _.clone(response.body);
                                this.offlineDBService[operation.name](params, noop, noop);
                            }
                            else {
                                this.offlineDBService[operation.name](params, noop, noop);
                            }
                        }).catch(noop);
                    }
                    resolve(response);
                }
            }, (err) => {
                reject(err);
            });
        });
    }
    /**
     * Finds out the nested objects to save and prepares a cloned params.
     */
    prepareToCascade(params) {
        return this.getStore(params).then(store => {
            const childObjectPromises = [];
            _.forEach(params.data, (v, k) => {
                let column, foreignRelation, childParams;
                // NOTE: Save only one-to-one relations for cascade
                if (_.isObject(v) && !_.isArray(v)) {
                    column = store.entitySchema.columns.find(c => {
                        if (c.primaryKey && c.foreignRelations) {
                            foreignRelation = c.foreignRelations.find(f => f.sourceFieldName === k);
                        }
                        return !!foreignRelation;
                    });
                }
                if (column) {
                    childParams = _.cloneDeep(params);
                    childParams.entityName = foreignRelation.targetEntity;
                    childParams.data = v;
                    const childPromise = this.getStore(childParams).then(childStore => {
                        const parent = params.data;
                        const targetColumns = childStore.entitySchema.columns.find(c => c.name === foreignRelation.targetColumn);
                        if (targetColumns && targetColumns.foreignRelations) {
                            const parentFieldName = targetColumns.foreignRelations.find(f => f.targetTable === store.entitySchema.name).sourceFieldName;
                            childParams.data[parentFieldName] = parent;
                        }
                        parent[k] = null;
                        childParams.onlyOnline = false;
                        childParams.isCascadingStopped = true;
                        childParams.hasBlob = this.hasBlob(childStore);
                        childParams.url = '';
                        return () => {
                            return Promise.resolve().then(() => {
                                const primaryKeyValue = childStore.getValue(childParams.data, childStore.primaryKeyField.fieldName);
                                return primaryKeyValue ? childStore.get(primaryKeyValue) : null;
                            }).then(object => {
                                let operation;
                                if (object) {
                                    operation = childParams.hasBlob ? 'updateMultiPartTableData' : 'updateTableData';
                                }
                                else {
                                    operation = childParams.hasBlob ? 'insertMultiPartTableData' : 'insertTableData';
                                }
                                return this.onlineDBService[operation](childParams).toPromise();
                            });
                        };
                    });
                    childObjectPromises.push(childPromise);
                }
            });
            return Promise.all(childObjectPromises).then(result => {
                return {
                    cascade: () => Promise.all(result.map(fn => fn()))
                };
            });
        });
    }
}

let isOfflineBehaviourAdded = false;
class FileUploadOfflineBehaviour {
    constructor(changeLogService, deviceFileService, deviceFileUploadService, file, networkService, uploadDir) {
        this.changeLogService = changeLogService;
        this.deviceFileService = deviceFileService;
        this.deviceFileUploadService = deviceFileUploadService;
        this.file = file;
        this.networkService = networkService;
        this.uploadDir = uploadDir;
    }
    add() {
        if (isOfflineBehaviourAdded) {
            return;
        }
        isOfflineBehaviourAdded = true;
        const orig = this.deviceFileUploadService.upload;
        this.deviceFileUploadService['uploadToServer'] = orig;
        this.deviceFileUploadService.upload = (url, fileParamName, localPath, fileName, params, headers) => {
            if (this.networkService.isConnected()) {
                return orig.call(this.deviceFileUploadService, url, fileParamName, localPath, fileName, params, headers);
            }
            else {
                return this.uploadLater(url, fileParamName, localPath, fileName, params, headers).then(response => {
                    return {
                        text: JSON.stringify(response),
                        headers: null,
                        response: response
                    };
                });
            }
        };
    }
    uploadLater(url, fileParamName, localPath, fileName, params, headers) {
        const i = localPath.lastIndexOf('/'), soureDir = localPath.substring(0, i), soureFile = localPath.substring(i + 1), destFile = this.deviceFileService.appendToFileName(soureFile), filePath = this.uploadDir + '/' + destFile;
        return this.file.copyFile(soureDir, soureFile, this.uploadDir, destFile)
            .then(() => {
            return this.changeLogService.add('OfflineFileUploadService', 'uploadToServer', {
                file: filePath,
                ftOptions: {
                    fileKey: fileParamName,
                    fileName: fileName
                },
                params: params,
                headers: headers,
                serverUrl: url,
                deleteOnUpload: true
            });
        }).then(() => {
            return [{
                    fileName: soureFile,
                    path: filePath,
                    length: 0,
                    success: true,
                    inlinePath: filePath + '?inline'
                }];
        });
    }
}

const NUMBER_REGEX = /^\d+(\.\d+)?$/;
let isOfflineBehaviourAdded$1 = false;
class NamedQueryExecutionOfflineBehaviour {
    constructor(changeLogService, httpService, localDBManagementService, networkService) {
        this.changeLogService = changeLogService;
        this.httpService = httpService;
        this.localDBManagementService = localDBManagementService;
        this.networkService = networkService;
    }
    add() {
        if (isOfflineBehaviourAdded$1) {
            return;
        }
        isOfflineBehaviourAdded$1 = true;
        const orig = this.httpService.sendCallAsObservable;
        this.httpService.sendCallAsObservable = (reqParams, params) => {
            if (!params && _.get(reqParams, 'url')) {
                params = { url: reqParams.url };
            }
            if (!this.networkService.isConnected() && params.url.indexOf('/queryExecutor/') > 0) {
                return from(this.executeLocally(params));
            }
            else {
                return orig.call(this.httpService, reqParams, params);
            }
        };
    }
    executeLocally(params) {
        const url = params.url, hasUrlParams = url.indexOf('?') > 0, dbName = this.substring(url, 'services/', '/queryExecutor'), queryName = this.substring(url, 'queries/', hasUrlParams ? '?' : undefined), urlParams = hasUrlParams ? this.getHttpParamMap(this.substring(url, '?', undefined)) : {}, dataParams = this.getHttpParamMap(params.dataParams), queryParams = _.extend(urlParams, dataParams);
        return this.localDBManagementService.executeNamedQuery(dbName, queryName, queryParams)
            .then(result => {
            const rows = result.rows;
            if (result.rowsAffected) {
                return this.changeLogService.add('WebService', 'invokeJavaService', params)
                    .then(() => result.rowsAffected);
            }
            else {
                return {
                    type: WM_LOCAL_OFFLINE_CALL,
                    body: {
                        totalPages: rows && rows.length > 0 ? 1 : 0,
                        totalElements: rows.length,
                        first: true,
                        sort: null,
                        numberOfElements: rows.length,
                        last: true,
                        size: params.size,
                        number: 0,
                        content: rows
                    }
                };
            }
        });
    }
    substring(source, start, end) {
        if (start) {
            const startIndex = source.indexOf(start) + start.length, endIndex = end ? source.indexOf(end) : undefined;
            return source.substring(startIndex, endIndex);
        }
        return undefined;
    }
    getHttpParamMap(str) {
        const result = {};
        if (str) {
            str = decodeURIComponent(str);
            str.split('&').forEach(c => {
                const csplits = c.split('=');
                if (_.isEmpty(_.trim(csplits[1])) || !NUMBER_REGEX.test(csplits[1])) {
                    result[csplits[0]] = csplits[1];
                }
                else {
                    result[csplits[0]] = parseInt(csplits[1], 10);
                }
            });
        }
        return result;
    }
}

const SECURITY_FILE = 'logged-in-user.info';
let isOfflineBehaviourAdded$2 = false;
class SecurityOfflineBehaviour {
    constructor(app, file, deviceService, networkService, securityService) {
        this.app = app;
        this.file = file;
        this.deviceService = deviceService;
        this.networkService = networkService;
        this.securityService = securityService;
        this.saveSecurityConfigLocally = _.debounce((config) => {
            this._saveSecurityConfigLocally(config);
        }, 1000);
    }
    add() {
        if (isOfflineBehaviourAdded$2) {
            return;
        }
        isOfflineBehaviourAdded$2 = true;
        const origLoad = this.securityService.load;
        const origAppLogout = this.securityService.appLogout;
        /**
         * Add offline behaviour to SecurityService.getConfig. When offline, this funcation returns security
         * config of last logged-in user will be returned, provided the user did not logout last time.
         *
         * @param successCallback
         * @param failureCallback
         */
        this.securityService.load = () => {
            return new Promise((resolve, reject) => {
                if (this.networkService.isConnected()) {
                    origLoad.call(this.securityService).then(config => {
                        this.securityConfig = config;
                        this.saveSecurityConfigLocally(config);
                        resolve(this.securityConfig);
                    }, reject);
                }
                else {
                    this.readLocalSecurityConfig().then((config = {}) => {
                        this.securityConfig = config;
                        this.securityService.config = config;
                        return config;
                    }, () => origLoad.call(this.securityConfig)).then(resolve, reject);
                }
            });
        };
        /**
         * When users logs out, local config will be removed. If the user is offline and logs out, then user
         * will be logged out from the app and cookies are invalidated when app goes online next time.
         *
         * @param successCallback
         * @param failureCallback
         */
        this.securityService.appLogout = (successCallback, failureCallback) => {
            this.securityConfig = {
                authenticated: false,
                loggedOut: true,
                securityEnabled: this.securityConfig && this.securityConfig.securityEnabled,
                loggedOutOffline: !this.networkService.isConnected(),
                loginConfig: this.securityConfig && this.securityConfig.loginConfig,
                userInfo: null
            };
            this._saveSecurityConfigLocally(this.securityConfig).catch(noop).then(() => {
                if (this.networkService.isConnected()) {
                    origAppLogout.call(this.securityService, successCallback, failureCallback);
                }
                else {
                    location.assign(window.location.origin + window.location.pathname);
                }
            });
        };
        /**
         * @param successCallback
         */
        this.securityService.isAuthenticated = successCallback => {
            triggerFn(successCallback, this.securityConfig.authenticated === true);
        };
        this.deviceService.whenReady().then(() => this.clearLastLoggedInUser());
        /**
         * If the user has chosen to logout while app is offline, then invalidation of cookies happens when
         * app comes online next time.
         */
        this.app.subscribe('onNetworkStateChange', data => {
            if (data.isConnected) {
                this.clearLastLoggedInUser();
            }
        });
    }
    _saveSecurityConfigLocally(config) {
        return this.file.writeFile(cordova.file.dataDirectory, SECURITY_FILE, JSON.stringify(config), { replace: true });
    }
    clearLastLoggedInUser() {
        return this.readLocalSecurityConfig().then(config => {
            if (config && config.loggedOutOffline) {
                this.securityService.appLogout(null, null);
            }
            else if (!this.networkService.isConnected()) {
                this.securityConfig = config || {};
            }
        });
    }
    readLocalSecurityConfig() {
        // reading the security info from file in dataDirectory but when this file is not available then fetching the config from the app directory
        return new Promise((resolve, reject) => {
            const rootDir = cordova.file.dataDirectory;
            this.file.checkFile(rootDir, SECURITY_FILE).then(() => {
                return this.readFileAsTxt(rootDir, SECURITY_FILE).then(resolve, reject);
            }, () => {
                const folderPath = cordova.file.applicationDirectory + 'www/metadata/app', fileName = 'security-config.json';
                return this.readFileAsTxt(folderPath, fileName).then(resolve, reject);
            });
        });
    }
    readFileAsTxt(folderPath, fileName) {
        return this.file.readAsText(folderPath, fileName).then(JSON.parse).catch(noop);
    }
}

class OfflineModule {
    constructor(app, changeLogService, deviceService, deviceFileService, deviceFileUploadService, file, httpService, localDBManagementService, localDbService, networkService, securityService) {
        if (hasCordova()) {
            OfflineModule.initialize(app, changeLogService, deviceService, deviceFileService, deviceFileUploadService, file, httpService, localDBManagementService, localDbService, networkService, securityService);
        }
    }
    // Startup services have to be added only once in the app life-cycle.
    static initialize(app, changeLogService, deviceService, deviceFileService, deviceFileUploadService, file, httpService, localDBManagementService, localDbService, networkService, securityService) {
        if (this.initialized) {
            return;
        }
        deviceService.addStartUpService({
            serviceName: 'OfflineStartupService',
            start: () => {
                if (window['SQLitePlugin']) {
                    localDBManagementService.setLogSQl((sessionStorage.getItem('wm.logSql') === 'true') || (sessionStorage.getItem('debugMode') === 'true'));
                    window.logSql = (flag = true) => {
                        localDBManagementService.setLogSQl(flag);
                        sessionStorage.setItem('wm.logSql', flag ? 'true' : 'false');
                    };
                    window.executeLocalSql = (dbName, query, params) => {
                        localDBManagementService.executeSQLQuery(dbName, query, params, true);
                    };
                    return localDBManagementService.loadDatabases().then(() => {
                        changeLogService.addWorker(new IdResolver(localDBManagementService));
                        changeLogService.addWorker(new ErrorBlocker(localDBManagementService));
                        changeLogService.addWorker(new FileHandler());
                        changeLogService.addWorker(new MultiPartParamTransformer(deviceFileService, localDBManagementService));
                        new LiveVariableOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService, localDbService).add();
                        new FileUploadOfflineBehaviour(changeLogService, deviceFileService, deviceFileUploadService, file, networkService, deviceFileService.getUploadDirectory()).add();
                        new NamedQueryExecutionOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService).add();
                        localDBManagementService.registerCallback(new UploadedFilesImportAndExportService(changeLogService, deviceFileService, localDBManagementService, file));
                        changeLogService.addWorker({
                            onAddCall: () => {
                                if (!networkService.isConnected()) {
                                    networkService.disableAutoConnect();
                                }
                            },
                            postFlush: stats => {
                                if (stats.totalTaskCount > 0) {
                                    localDBManagementService.close()
                                        .catch(noop)
                                        .then(() => {
                                        location.assign(window.location.origin + window.location.pathname);
                                    });
                                }
                            }
                        });
                    });
                }
                return Promise.resolve();
            }
        });
        new SecurityOfflineBehaviour(app, file, deviceService, networkService, securityService).add();
    }
}
OfflineModule.initialized = false;
OfflineModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule
                ],
                declarations: [],
                exports: [],
                providers: [
                // add providers to mobile-runtime module.
                ],
                entryComponents: []
            },] }
];
/** @nocollapse */
OfflineModule.ctorParameters = () => [
    { type: App },
    { type: ChangeLogService },
    { type: DeviceService },
    { type: DeviceFileService },
    { type: DeviceFileUploadService },
    { type: File },
    { type: AbstractHttpService },
    { type: LocalDBManagementService },
    { type: LocalDbService },
    { type: NetworkService },
    { type: SecurityService }
];

class PushServiceImpl {
    constructor(deviceFileUploadService) {
        this.deviceFileUploadService = deviceFileUploadService;
    }
    // Returns a promise from the observable.
    getPromiseFromObs(cb) {
        return new Promise((resolve, reject) => {
            cb.subscribe(response => {
                if (response && response.type) {
                    resolve(response);
                }
            }, reject);
        });
    }
    push(change) {
        const params = change.params;
        switch (change.service) {
            case 'DatabaseService':
                switch (change.operation) {
                    case 'insertTableData':
                        return this.getPromiseFromObs(LVService.insertTableData(change.params, null, null));
                    case 'insertMultiPartTableData':
                        return this.getPromiseFromObs(LVService.insertMultiPartTableData(change.params, null, null));
                    case 'updateTableData':
                        return this.getPromiseFromObs(LVService.updateTableData(change.params, null, null));
                    case 'updateMultiPartTableData':
                        return this.getPromiseFromObs(LVService.updateMultiPartTableData(change.params, null, null));
                    case 'deleteTableData':
                        return this.getPromiseFromObs(LVService.deleteTableData(change.params, null, null));
                }
            case 'OfflineFileUploadService':
                if (change.operation === 'uploadToServer') {
                    return this.deviceFileUploadService['uploadToServer'].call(this.deviceFileUploadService, params.serverUrl, params.ftOptions.fileKey, params.file, params.ftOptions.fileName, params.params, params.headers);
                }
        }
        return Promise.reject(`${change.service} service with operation ${change.operation} is not supported for push.`);
    }
}
PushServiceImpl.decorators = [
    { type: Injectable }
];
/** @nocollapse */
PushServiceImpl.ctorParameters = () => [
    { type: DeviceFileUploadService }
];

const LAST_PULL_INFO_KEY = 'localDBManager.lastPullInfo';
const ɵ0$1 = () => {
    const promises = {};
    return {
        start: promise => {
            promise.$$pullProcessId = 'PULL_' + _.now();
        },
        add: (pullPromise, promise) => {
            const pullProcessId = pullPromise.$$pullProcessId;
            if (!promises[pullProcessId]) {
                promises[pullProcessId] = [];
            }
            promises[pullProcessId].push(promise);
        },
        remove: (pullPromise, promise) => {
            const pullProcessId = pullPromise.$$pullProcessId;
            _.remove(promises[pullProcessId], promise);
            if (_.isEmpty(promises[pullProcessId])) {
                delete promises[pullProcessId];
            }
        },
        abort: (pullPromise) => {
            const pullProcessId = pullPromise.$$pullProcessId;
            if (promises[pullProcessId]) {
                _.forEach(promises[pullProcessId], function (p) {
                    if (p && p.abort) {
                        p.abort();
                    }
                });
                delete promises[pullProcessId];
            }
            pullPromise.$$isMarkedToAbort = true;
            return pullPromise.catch(function () {
                return 'cancelled';
            });
        }
    };
};
/**
 * a utility api to abort pull process.
 *
 * @type {{start, add, remove, abort}}
 */
const pullProcessManager = (ɵ0$1)();
/**
 * LocalDBDataPullService has API to pull data from remote Server to local Database.
 */
class LocalDBDataPullService {
    constructor(app, localDBManagementService, localKeyValueService, networkService) {
        this.app = app;
        this.localDBManagementService = localDBManagementService;
        this.localKeyValueService = localKeyValueService;
        this.networkService = networkService;
        // Listen for db creation. When db is created, then initialize last pull info.
        this.localDBManagementService.registerCallback({
            onDbCreate: (info) => {
                this.localKeyValueService.put(LAST_PULL_INFO_KEY, {
                    databases: [],
                    totalRecordsToPull: 0,
                    totalPulledRecordCount: 0,
                    startTime: new Date(0),
                    endTime: new Date(info.dbSeedCreatedOn)
                });
            }
        });
    }
    /**
     * If deltaFieldName is set,last pull time is greater than zero and query used in last pull is same as the
     * query for the current pull, then delta criteria is attached to the query.
     *
     * @param db
     * @param entityName
     * @param query
     * @returns {any}
     */
    addDeltaCriteria(db, entityName, query) {
        const entitySchema = db.schema.entities[entityName], deltaFieldName = entitySchema.pullConfig.deltaFieldName, deltaField = _.find(entitySchema.columns, { 'fieldName': deltaFieldName }) || {};
        let isBundledEntity;
        if (!_.isEmpty(deltaFieldName)) {
            return this.localDBManagementService.isBundled(db.schema.name, entityName)
                .then(flag => isBundledEntity = flag)
                .then(() => this.getLastPullInfo())
                .then(lastPullInfo => {
                let lastPullTime = (lastPullInfo && lastPullInfo.startTime && lastPullInfo.startTime.getTime());
                const lastPullDBInfo = _.find(lastPullInfo && lastPullInfo.databases, { 'name': db.schema.name }), lastPullEntityInfo = _.find(lastPullDBInfo && lastPullDBInfo.entities, { 'entityName': entityName }) || {};
                if (!lastPullTime && isBundledEntity) {
                    // For bundled entity when there is no last pull, fetch records that got modified after db creation.
                    lastPullTime = (lastPullInfo && lastPullInfo.endTime && lastPullInfo.endTime.getTime());
                    lastPullEntityInfo.query = query;
                }
                if (lastPullEntityInfo.query === query && lastPullTime > 0) {
                    if (_.isEmpty(query)) {
                        query = '';
                    }
                    else {
                        query += ' AND ';
                    }
                    if (deltaField.sqlType === 'datetime') {
                        query += deltaFieldName + ' > wm_dt(\'' + moment(lastPullTime).utc().format('YYYY-MM-DDTHH:mm:ss') + '\')';
                    }
                    else {
                        query += deltaFieldName + ' > wm_ts(\'' + lastPullTime + '\')';
                    }
                }
                return query;
            }, () => Promise.resolve(query));
        }
        return Promise.resolve(query);
    }
    /**
     * copies the data from remote db to local db
     * @param {DBInfo} db
     * @param {string} entityName
     * @param {boolean} clearDataBeforePull
     * @param pullPromise
     * @param {Observer<any>} progressObserver
     * @returns {Promise<any>}
     */
    copyDataFromRemoteDBToLocalDB(db, entityName, clearDataBeforePull, pullPromise, progressObserver) {
        const store = db.stores[entityName], entitySchema = db.schema.entities[entityName], result = {
            entityName: entityName,
            totalRecordsToPull: 0,
            pulledRecordCount: 0
        };
        let inProgress = 0, pullComplete = false, filter;
        return new Promise((resolve, reject) => {
            this.prepareQuery(db, entityName)
                .then(query => {
                result.query = query;
                return this.addDeltaCriteria(db, entityName, query);
            }).then(query => {
                // Clear if clearDataBeforePull is true and delta query is not used
                if (clearDataBeforePull && result.query === query) {
                    return store.clear()
                        .then(() => {
                        return query;
                    });
                }
                return query;
            }).then(query => {
                filter = _.isEmpty(query) ? '' : 'q=' + query;
                return this.getTotalRecordsToPull(db, entitySchema, filter, pullPromise);
            }).then(maxNoOfRecords => {
                const pageSize = entitySchema.pullConfig.size || 100, maxNoOfPages = Math.ceil(maxNoOfRecords / pageSize);
                result.totalRecordsToPull = maxNoOfRecords;
                let sort = entitySchema.pullConfig.orderBy;
                sort = (_.isEmpty(sort) ? '' : sort + ',') + store.primaryKeyName;
                progressObserver.next(result);
                const _progressObserver = { next: data => {
                        inProgress++;
                        data = _.slice(data, 0, result.totalRecordsToPull - result.pulledRecordCount);
                        store.saveAll(data).then(() => {
                            result.pulledRecordCount += data ? data.length : 0;
                            progressObserver.next(result);
                        }).catch(noop)
                            .then(() => {
                            inProgress--;
                            if (inProgress === 0 && pullComplete) {
                                resolve(result);
                            }
                        });
                    }, error: null, complete: null
                };
                return this._pullEntityData(db, entityName, filter, sort, maxNoOfPages, pageSize, 1, pullPromise, undefined, _progressObserver);
            }).then(null, reject)
                .catch(noop)
                .then(() => {
                pullComplete = true;
                if (inProgress === 0) {
                    resolve(result);
                }
            });
        });
    }
    // If expression starts with 'bind:', then expression is evaluated and result is returned.
    evalIfBind(expression) {
        if (_.startsWith(expression, 'bind:')) {
            expression = expression.replace(/\[\$\i\]/g, '[0]');
            return $parseExpr(expression.replace('bind:', ''))(this.app);
        }
        return expression;
    }
    /**
     * Executes DatabaseService.countTableDataWithQuery as a promise API.
     * @param params
     * @returns Promise
     */
    executeDatabaseCountQuery(params) {
        return new Promise((resolve, reject) => {
            LVService.countTableDataWithQuery(params, null, null).subscribe(response => resolve(response.body), reject);
        });
    }
    /**
     * Executes DatabaseService.searchTableDataWithQuery as a promise API.
     * @param params
     * @returns Promise
     */
    executeDatabaseSearchQuery(params) {
        return new Promise((resolve, reject) => {
            return LVService.searchTableDataWithQuery(params, null, null).subscribe(response => resolve(response && response.body && response.body.content), reject);
        });
    }
    /**
     * Computes the maximum number of records to pull.
     *
     * @param db
     * @param entitySchema
     * @param filter
     * @param pullPromise
     * @returns {*}
     */
    getTotalRecordsToPull(db, entitySchema, filter, pullPromise) {
        const params = {
            dataModelName: db.schema.name,
            entityName: entitySchema.entityName,
            data: filter
        };
        return this.retryIfNetworkFails(() => {
            return this.executeDatabaseCountQuery(params).then(function (response) {
                const totalRecordCount = response, maxRecordsToPull = _.parseInt(entitySchema.pullConfig.maxNumberOfRecords);
                if (_.isNaN(maxRecordsToPull) || maxRecordsToPull <= 0 || totalRecordCount < maxRecordsToPull) {
                    return totalRecordCount;
                }
                return maxRecordsToPull;
            });
        }, pullPromise);
    }
    prepareQuery(db, entityName) {
        let query;
        const entitySchema = db.schema.entities[entityName];
        return this.localDBManagementService.isBundled(db.schema.name, entityName)
            .then(isBundledEntity => {
            let hasNullAttributeValue = false;
            if (isBundledEntity || _.isEmpty(entitySchema.pullConfig.query)) {
                query = _.cloneDeep(entitySchema.pullConfig.filter);
                query = _.map(query, v => {
                    v.attributeValue = this.evalIfBind(v.attributeValue);
                    hasNullAttributeValue = hasNullAttributeValue || _.isNil(v.attributeValue);
                    return v;
                });
                if (hasNullAttributeValue) {
                    return Promise.reject('Null criteria values are present');
                }
                query = _.sortBy(query, 'attributeName');
                query = LiveVariableUtils.getSearchQuery(query, ' AND ', true);
            }
            else {
                query = this.evalIfBind(entitySchema.pullConfig.query);
            }
            if (_.isNil(query)) {
                return Promise.resolve(null);
            }
            return Promise.resolve(encodeURIComponent(query));
        });
    }
    /**
     *
     * @param db
     * @param clearDataBeforePull
     * @param pullPromise
     * @param progressObserver
     * @returns {*}
     */
    _pullDbData(db, clearDataBeforePull, pullPromise, progressObserver) {
        const datamodelName = db.schema.name, result = {
            name: db.schema.name,
            entities: [],
            totalRecordsToPull: 0,
            pulledRecordCount: 0,
            completedTaskCount: 0,
            totalTaskCount: 0
        };
        const storePromises = [];
        _.forEach(db.schema.entities, entity => {
            storePromises.push(this.localDBManagementService.getStore(datamodelName, entity.entityName));
        });
        return new Promise((resolve, reject) => {
            Promise.all(storePromises)
                .then((stores) => {
                const entities = [];
                stores.forEach(store => {
                    const pullConfig = store.entitySchema.pullConfig;
                    const pullType = pullConfig.pullType;
                    if (pullType === PullType.APP_START || (pullType === PullType.BUNDLED && pullConfig.deltaFieldName)) {
                        entities.push(store.entitySchema);
                    }
                });
                const pullPromises = _.chain(entities)
                    .map(entity => {
                    const _progressObserver = {
                        next: info => {
                            const i = _.findIndex(result.entities, { 'entityName': info.entityName });
                            if (i >= 0) {
                                result.entities[i] = info;
                            }
                            else {
                                result.entities.push(info);
                            }
                            result.pulledRecordCount = _.reduce(result.entities, function (sum, entityPullInfo) {
                                return sum + entityPullInfo.pulledRecordCount;
                            }, 0);
                            result.totalRecordsToPull = _.reduce(result.entities, function (sum, entityPullInfo) {
                                return sum + entityPullInfo.totalRecordsToPull;
                            }, 0);
                            progressObserver.next(result);
                        }, error: null, complete: null
                    };
                    return this.copyDataFromRemoteDBToLocalDB(db, entity.entityName, clearDataBeforePull, pullPromise, _progressObserver)
                        .then(function (info) {
                        result.completedTaskCount++;
                        progressObserver.next(result);
                        return info;
                    }, null);
                }).value();
                result.totalTaskCount = pullPromises.length;
                progressObserver.next(result);
                Promise.all(pullPromises).then(resolve, reject);
            });
        });
    }
    /**
     * Pulls data of the given entity from remote server.
     * @param db
     * @param entityName
     * @param sort
     * @param maxNoOfPages
     * @param pageSize
     * @param currentPage
     * @param filter
     * @param pullPromise
     * @param promise
     * @returns {*}
     */
    _pullEntityData(db, entityName, filter, sort, maxNoOfPages, pageSize, currentPage, pullPromise, deferred, progressObserver) {
        const dataModelName = db.schema.name;
        if (!deferred) {
            deferred = defer();
        }
        if (currentPage > maxNoOfPages) {
            return deferred.resolve();
        }
        const params = {
            dataModelName: dataModelName,
            entityName: entityName,
            page: currentPage,
            size: pageSize,
            data: filter,
            sort: sort,
            onlyOnline: true,
            skipLocalDB: true
        };
        this.retryIfNetworkFails(() => {
            return this.executeDatabaseSearchQuery(params);
        }, pullPromise).then(response => {
            progressObserver.next(response);
            this._pullEntityData(db, entityName, filter, sort, maxNoOfPages, pageSize, currentPage + 1, pullPromise, deferred, progressObserver);
        }, deferred.reject);
        return deferred.promise;
    }
    /**
     * If fn fails and network is not there
     * @param fn
     * @param pullPromise
     * @returns {*}
     */
    retryIfNetworkFails(fn, pullPromise) {
        if (pullPromise.$$isMarkedToAbort) {
            return Promise.reject('aborted');
        }
        const promise = this.networkService.retryIfNetworkFails(fn);
        pullProcessManager.add(pullPromise, promise);
        promise.catch(noop)
            .then(() => {
            pullProcessManager.remove(pullPromise, promise);
        });
        return promise;
    }
    /**
     * Tries to cancel the corresponding pull process that gave the given promise.
     * @param promise
     * @returns {any}
     */
    cancel(promise) {
        return pullProcessManager.abort(promise);
    }
    /**
     * fetches the database from the dbName.
     * @param dbName
     * @returns {Promise<any>}
     */
    getDb(dbName) {
        return this.localDBManagementService.loadDatabases()
            .then(databases => {
            const db = _.find(databases, { 'name': dbName });
            return db || Promise.reject('Local database (' + dbName + ') not found');
        });
    }
    /**
     * @returns {any} that has total no of records fetched, start and end timestamps of last successful pull
     * of data from remote server.
     */
    getLastPullInfo() {
        return this.localKeyValueService.get(LAST_PULL_INFO_KEY).then(info => {
            if (_.isString(info.startTime)) {
                info.startTime = new Date(info.startTime);
            }
            if (_.isString(info.endTime)) {
                info.endTime = new Date(info.endTime);
            }
            return info;
        });
    }
    /**
     * Clears (based on parameter) and pulls data ('BUNDLED' data based on parameter) from server using the
     * configured rules in offline configuration.
     *
     * @param clearDataBeforePull boolean
     * @param {Observer<any>} progressObserver
     * @returns {any}
     */
    pullAllDbData(clearDataBeforePull, progressObserver) {
        const deferred = getAbortableDefer(), pullInfo = {
            completedTaskCount: 0,
            totalTaskCount: 0,
            inProgress: true,
            databases: [],
            totalRecordsToPull: 0,
            totalPulledRecordCount: 0,
            startTime: new Date(),
            endTime: new Date()
        };
        this.localDBManagementService.loadDatabases()
            .then(databases => {
            const dataPullPromises = _.chain(databases).filter(function (db) {
                return !db.schema.isInternal;
            }).map(db => {
                pullProcessManager.start(deferred.promise);
                const _progressObserver = { next: data => {
                        const i = _.findIndex(pullInfo.databases, { 'name': data.name });
                        if (i >= 0) {
                            pullInfo.databases[i] = data;
                        }
                        else {
                            pullInfo.databases.push(data);
                        }
                        pullInfo.totalTaskCount = _.reduce(pullInfo.databases, function (sum, dbPullInfo) {
                            return sum + dbPullInfo.totalTaskCount;
                        }, 0);
                        pullInfo.completedTaskCount = _.reduce(pullInfo.databases, function (sum, dbPullInfo) {
                            return sum + dbPullInfo.completedTaskCount;
                        }, 0);
                        pullInfo.totalPulledRecordCount = _.reduce(pullInfo.databases, function (sum, dbPullInfo) {
                            return sum + dbPullInfo.pulledRecordCount;
                        }, 0);
                        pullInfo.totalRecordsToPull = _.reduce(pullInfo.databases, function (sum, dbPullInfo) {
                            return sum + dbPullInfo.totalRecordsToPull;
                        }, 0);
                        progressObserver.next(pullInfo);
                    }, error: null, complete: null
                };
                return this._pullDbData(db, clearDataBeforePull, deferred.promise, _progressObserver);
            }).value();
            return Promise.all(dataPullPromises);
        }).then(() => {
            pullInfo.endTime = new Date();
            pullInfo.inProgress = false;
            this.localKeyValueService.put(LAST_PULL_INFO_KEY, pullInfo);
            deferred.resolve(pullInfo);
        }, deferred.reject);
        return deferred.promise;
    }
    /**
     * Clears (based on parameter) and pulls data ('BUNDLED' data based on parameter) of the given database from server using
     * the configured rules in offline configuration.
     *
     * @param {string} databaseName
     * @param {boolean} clearDataBeforePull
     * @param {Observer<any>} progressObserver
     * @returns {Promise}
     */
    pullDbData(databaseName, clearDataBeforePull, progressObserver) {
        const deferred = getAbortableDefer();
        this.getDb(databaseName).then(db => {
            return this._pullDbData(db, clearDataBeforePull, deferred.promise, progressObserver);
        }).then(deferred.resolve, deferred.reject);
        return deferred.promise;
    }
    /**
     * Clears (based on parameter) and pulls data of the given entity and database from
     * server using the configured rules in offline configuration.
     * @param databaseName, name of the database from which data has to be pulled.
     * @param entityName, name of the entity from which data has to be pulled
     * @param clearDataBeforePull, if set to true, then data of the entity will be deleted.
     * @param progressObserver, observer the progress values
     */
    pullEntityData(databaseName, entityName, clearDataBeforePull, progressObserver) {
        const deferred = getAbortableDefer();
        this.getDb(databaseName)
            .then((db) => {
            return this.copyDataFromRemoteDBToLocalDB(db, entityName, clearDataBeforePull, deferred.promise, progressObserver);
        }).then(deferred.resolve, deferred.reject);
        return deferred.promise;
    }
}
LocalDBDataPullService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
LocalDBDataPullService.ctorParameters = () => [
    { type: App },
    { type: LocalDBManagementService },
    { type: LocalKeyValueService },
    { type: NetworkService }
];
LocalDBDataPullService.ngInjectableDef = defineInjectable({ factory: function LocalDBDataPullService_Factory() { return new LocalDBDataPullService(inject(App), inject(LocalDBManagementService), inject(LocalKeyValueService), inject(NetworkService)); }, token: LocalDBDataPullService, providedIn: "root" });

/**
 * Generated bundle index. Do not edit.
 */

export { LocalKeyValueService as ɵa, OfflineModule, PushService, CONTEXT_KEY, LAST_PUSH_INFO_KEY, ChangeLogService, PushServiceImpl, LocalDbService, LocalDBDataPullService, ɵ0$1 as ɵ0, LocalDBManagementService };

//# sourceMappingURL=index.js.map