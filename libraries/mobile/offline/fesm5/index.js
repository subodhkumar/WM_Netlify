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

var LocalKeyValueService = /** @class */ (function () {
    function LocalKeyValueService() {
    }
    /**
     * retrieves the value mapped to the key.
     *
     * @param {string} key key
     * @returns {object} a promise that is resolved when value is retrieved from store.
     */
    LocalKeyValueService.prototype.get = function (key) {
        return this.fetchEntry(key)
            .then(function (result) {
            var value;
            if (result && result.length > 0) {
                value = result[0].value;
                if (value) {
                    value = JSON.parse(value);
                }
            }
            return value;
        });
    };
    /**
     * Initializes the service with the given store.
     *
     * @param {object} storeToUse a store with id, key, value with fields.
     * @returns {object} a promise that is resolved when data is persisted.
     */
    LocalKeyValueService.prototype.init = function (storeToUse) {
        this.store = storeToUse;
    };
    /**
     * clear data in all databases.
     *
     * @param {string} key key
     * @param {string} value value
     * @returns {object} a promise that is resolved when data is persisted.
     */
    LocalKeyValueService.prototype.put = function (key, value) {
        var _this = this;
        if (value) {
            value = JSON.stringify(value);
        }
        return this.fetchEntry(key).then(function (result) {
            if (result && result.length > 0) {
                return _this.store.save({
                    'id': result[0].id,
                    'key': key,
                    'value': value
                });
            }
            return _this.store.add({
                'key': key,
                'value': value
            });
        });
    };
    /**
     * clear data in all databases.
     *
     * @param {string} key key
     * @returns {object} a promise that is resolved when respective value is removed from store.
     */
    LocalKeyValueService.prototype.remove = function (key) {
        var _this = this;
        return this.fetchEntry(key).then(function (result) {
            if (result && result.length > 0) {
                return _this.store.delete(result[0].id);
            }
        });
    };
    LocalKeyValueService.prototype.fetchEntry = function (key) {
        var filterCriteria = [{
                'attributeName': 'key',
                'attributeValue': key,
                'attributeType': 'STRING',
                'filterCondition': 'EQUALS'
            }];
        return this.store.filter(filterCriteria);
    };
    LocalKeyValueService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    LocalKeyValueService.ngInjectableDef = defineInjectable({ factory: function LocalKeyValueService_Factory() { return new LocalKeyValueService(); }, token: LocalKeyValueService, providedIn: "root" });
    return LocalKeyValueService;
}());

var WM_LOCAL_OFFLINE_CALL = 'WM_LOCAL_OFFLINE_CALL';
var escapeName = function (name) {
    if (name) {
        name = name.replace(/"/g, '""');
        return '"' + name + '"';
    }
};

var insertRecordSqlTemplate = function (schema) {
    var columnNames = [], placeHolder = [];
    _.forEach(schema.columns, function (col) {
        columnNames.push(escapeName(col.name));
        placeHolder.push('?');
    });
    return "INSERT INTO " + escapeName(schema.name) + " (" + columnNames.join(',') + ") VALUES (" + placeHolder.join(',') + ")";
};
var replaceRecordSqlTemplate = function (schema) {
    var columnNames = [], placeHolder = [];
    _.forEach(schema.columns, function (col) {
        columnNames.push(escapeName(col.name));
        placeHolder.push('?');
    });
    return "REPLACE INTO " + escapeName(schema.name) + " (" + columnNames.join(',') + ") VALUES (" + placeHolder.join(',') + ")";
};
var deleteRecordTemplate = function (schema) {
    var primaryKeyField = _.find(schema.columns, 'primaryKey');
    if (primaryKeyField) {
        return "DELETE FROM " + escapeName(schema.name) + " WHERE " + escapeName(primaryKeyField.name) + " = ?";
    }
    return '';
};
var selectSqlTemplate = function (schema) {
    var columns = [], joins = [];
    schema.columns.forEach(function (col) {
        var childTableName;
        columns.push(escapeName(schema.name) + '.' + escapeName(col.name) + ' as ' + col.fieldName);
        if (col.foreignRelations) {
            col.foreignRelations.forEach(function (foreignRelation) {
                childTableName = foreignRelation.sourceFieldName;
                _.forEach(foreignRelation.dataMapper, function (childCol, childFiledName) {
                    columns.push(childTableName + '.' + escapeName(childCol.name) + ' as \'' + childFiledName + '\'');
                });
                joins.push(" LEFT JOIN " + escapeName(foreignRelation.targetTable) + " " + childTableName + "\n                         ON " + childTableName + "." + escapeName(foreignRelation.targetColumn) + " = " + escapeName(schema.name) + "." + escapeName(col.name));
            });
        }
    });
    return "SELECT " + columns.join(',') + " FROM " + escapeName(schema.name) + " " + joins.join(' ');
};
var countQueryTemplate = function (schema) {
    var joins = [];
    schema.columns.forEach(function (col) {
        var childTableName;
        if (col.foreignRelations) {
            col.foreignRelations.forEach(function (foreignRelation) {
                childTableName = foreignRelation.sourceFieldName;
                joins.push(" LEFT JOIN " + escapeName(foreignRelation.targetTable) + " " + childTableName + "\n                         ON " + childTableName + "." + escapeName(foreignRelation.targetColumn) + " = " + escapeName(schema.name) + "." + escapeName(col.name));
            });
        }
    });
    return "SELECT count(*) as count FROM " + escapeName(schema.name) + " " + joins.join(' ');
};
var generateWherClause = function (store, filterCriteria) {
    var conditions;
    var fieldToColumnMapping = store.fieldToColumnMapping, tableName = store.entitySchema.name;
    if (!_.isEmpty(filterCriteria) && _.isString(filterCriteria)) {
        return ' WHERE ' + filterCriteria;
    }
    if (filterCriteria) {
        conditions = filterCriteria.map(function (filterCriterion) {
            var colName = fieldToColumnMapping[filterCriterion.attributeName], condition = filterCriterion.filterCondition;
            var target = filterCriterion.attributeValue, operator = '=';
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
                target = "'" + target + "'";
            }
            else if (filterCriterion.attributeType === 'BOOLEAN') {
                target = (target === true ? 1 : 0);
            }
            return escapeName(tableName) + "." + escapeName(colName) + " " + operator + " " + target;
        });
    }
    return conditions && conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
};
var generateOrderByClause = function (store, sort) {
    if (sort) {
        return ' ORDER BY ' + _.map(sort.split(','), function (field) {
            var splits = _.trim(field).split(' ');
            splits[0] = escapeName(store.entitySchema.name) + '.' + escapeName(store.fieldToColumnMapping[splits[0]]);
            return splits.join(' ');
        }).join(',');
    }
    return '';
};
var geneateLimitClause = function (page) {
    page = page || {};
    return ' LIMIT ' + (page.limit || 100) + ' OFFSET ' + (page.offset || 0);
};
var mapRowDataToObj = function (schema, dataObj) {
    schema.columns.forEach(function (col) {
        var val = dataObj[col.fieldName];
        if (col.foreignRelations) {
            col.foreignRelations.forEach(function (foreignRelation) {
                var childEntity = null;
                _.forEach(foreignRelation.dataMapper, function (childCol, childFieldName) {
                    var fieldValue = dataObj[childFieldName];
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
var getValue = function (entity, col) {
    var value = entity[col.fieldName];
    if (col.foreignRelations) {
        col.foreignRelations.some(function (foreignRelation) {
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
var mapObjToRow = function (store, entity) {
    var row = {};
    store.entitySchema.columns.forEach(function (col) { return row[col.name] = getValue(entity, col); });
    return row;
};
var LocalDBStore = /** @class */ (function () {
    function LocalDBStore(deviceFileService, entitySchema, file, localDbManagementService, sqliteObject) {
        var _this = this;
        this.deviceFileService = deviceFileService;
        this.entitySchema = entitySchema;
        this.file = file;
        this.localDbManagementService = localDbManagementService;
        this.sqliteObject = sqliteObject;
        this.fieldToColumnMapping = {};
        this.primaryKeyField = _.find(this.entitySchema.columns, 'primaryKey');
        this.primaryKeyName = this.primaryKeyField ? this.primaryKeyField.fieldName : undefined;
        this.entitySchema.columns.forEach(function (c) {
            _this.fieldToColumnMapping[c.fieldName] = c.name;
            if (c.foreignRelations) {
                c.foreignRelations.forEach(function (foreignRelation) {
                    _this.fieldToColumnMapping[foreignRelation.targetPath] = c.name;
                    _.forEach(foreignRelation.dataMapper, function (childCol, childFieldName) {
                        _this.fieldToColumnMapping[childFieldName] = foreignRelation.sourceFieldName + '.' + childCol.name;
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
    LocalDBStore.prototype.add = function (entity) {
        if (this.primaryKeyName) {
            var idValue = entity[this.primaryKeyName];
            if (this.primaryKeyField.sqlType === 'number'
                && (!isDefined(idValue) || (_.isString(idValue) && _.isEmpty(_.trim(idValue))))) {
                if (this.primaryKeyField.generatorType === 'identity') {
                    // updating the id with the latest id obtained from nextId.
                    entity[this.primaryKeyName] = this.localDbManagementService.nextIdCount();
                }
                else {
                    // for assigned type, get the primaryKeyValue from the relatedTableData which is inside the entity
                    var primaryKeyValue = this.getValue(entity, this.primaryKeyName);
                    entity[this.primaryKeyName] = primaryKeyValue;
                }
            }
        }
        var rowData = mapObjToRow(this, entity);
        var params = this.entitySchema.columns.map(function (f) { return rowData[f.name]; });
        return this.sqliteObject.executeSql(this.insertRecordSqlTemplate, params)
            .then(function (result) { return result.insertId; });
    };
    /**
     * clears all data of this store.
     * @returns {object} promise
     */
    LocalDBStore.prototype.clear = function () {
        return this.sqliteObject.executeSql('DELETE FROM ' + escapeName(this.entitySchema.name));
    };
    /**
     * creates the stores if it does not exist
     * @returns {Promise<any>}
     */
    LocalDBStore.prototype.create = function () {
        var _this = this;
        return this.sqliteObject.executeSql(this.createTableSql(this.entitySchema)).then(function () { return _this; });
    };
    /**
     * counts the number of records that satisfy the given filter criteria.
     * @param {FilterCriterion[]} filterCriteria
     * @returns {object} promise that is resolved with count
     */
    LocalDBStore.prototype.count = function (filterCriteria) {
        var sql = this.countQuery + generateWherClause(this, filterCriteria);
        return this.sqliteObject.executeSql(sql).then(function (result) { return result.rows.item(0)['count']; });
    };
    /**
     * This function deserializes the given map object to FormData, provided that map object was
     * serialized by using serialize method of this store.
     * @param  {object} map object to deserialize
     * @returns {object} promise that is resolved with the deserialized FormData.
     */
    LocalDBStore.prototype.deserialize = function (map) {
        return this.deserializeMapToFormData(map);
    };
    /**
     * filters data of this store that statisfy the given filter criteria.
     * @param {FilterCriterion[]} filterCriteria
     * @param  {string=} sort ex: 'filedname asc/desc'
     * @param  {object=} page {'offset' : 0, "limit" : 20}
     * @returns {object} promise that is resolved with the filtered data.
     */
    LocalDBStore.prototype.filter = function (filterCriteria, sort, page) {
        var _this = this;
        var sql = this.selectSqlTemplate;
        sql += generateWherClause(this, filterCriteria);
        sql += generateOrderByClause(this, sort);
        sql += geneateLimitClause(page);
        return this.sqliteObject.executeSql(sql)
            .then(function (result) {
            var objArr = [], rowCount = result.rows.length;
            for (var i = 0; i < rowCount; i++) {
                objArr.push(mapRowDataToObj(_this.entitySchema, result.rows.item(i)));
            }
            return objArr;
        });
    };
    // fetches all the data related to the primaryKey
    LocalDBStore.prototype.refresh = function (data) {
        var primaryKeyName = this.primaryKeyName;
        var primaryKey = this.getValue(data, primaryKeyName);
        if (!primaryKey) {
            return Promise.resolve(data);
        }
        return this.get(primaryKey);
    };
    /**
     * deletes the record with the given primary key.
     * @param  {object} primaryKey primary key of the record
     * @returns {object} promise
     */
    LocalDBStore.prototype.delete = function (primaryKey) {
        return this.sqliteObject.executeSql(this.deleteRecordTemplate, [primaryKey]);
    };
    /**
     * finds the record with the given primary key.
     * @param  {object} primaryKey primary key of the record
     * @returns {object} promise that is resolved with entity
     */
    LocalDBStore.prototype.get = function (primaryKey) {
        var filterCriteria = [{
                attributeName: this.primaryKeyName,
                filterCondition: '=',
                attributeValue: primaryKey,
                attributeType: this.primaryKeyField.sqlType.toUpperCase()
            }];
        return this.filter(filterCriteria).then(function (obj) {
            return obj && obj.length === 1 ? obj[0] : undefined;
        });
    };
    /**
     * retrieve the value for the given field.
     *
     * @param entity
     * @param {string} fieldName
     * @returns {undefined | any | number}
     */
    LocalDBStore.prototype.getValue = function (entity, fieldName) {
        var column = this.entitySchema.columns.find(function (col) { return col.fieldName === fieldName; });
        return getValue(entity, column);
    };
    /**
     * saves the given entity to the store. If the record is not available, then a new record will be created.
     * @param {object} entity the entity to save
     * @returns {object} promise
     */
    LocalDBStore.prototype.save = function (entity) {
        return this.saveAll([entity]);
    };
    /**
     * saves the given entity to the store. If the record is not available, then a new record will be created.
     * @param {object} entities the entity to save
     * @returns {object} promise
     */
    LocalDBStore.prototype.saveAll = function (entities) {
        var _this = this;
        // filtering the null entities
        entities = _.filter(entities, null);
        var queries = _.map(entities, function (entity) {
            var rowData = mapObjToRow(_this, entity);
            var params = _this.entitySchema.columns.map(function (f) { return rowData[f.name]; });
            return [_this.replaceRecordSqlTemplate, params];
        });
        return this.sqliteObject.sqlBatch(queries);
    };
    /**
     * Based on this store columns, this function converts the given FormData to a map object.
     * Multipart file is stored as a local file. If form data cannot be serialized,
     * then formData is returned back.
     * @param  {FormData} formData object to serialize
     * @returns {object} promise that is resolved with a map.
     */
    LocalDBStore.prototype.serialize = function (formData) {
        return this.serializeFormDataToMap(formData);
    };
    /**
     * Save blob to a local file
     * @param blob
     * @returns {*}
     */
    LocalDBStore.prototype.saveBlobToFile = function (blob) {
        var fileName = this.deviceFileService.appendToFileName(blob.name), uploadDir = this.deviceFileService.getUploadDirectory();
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
    };
    /**
     * Converts form data object to map for storing request in local database..
     */
    LocalDBStore.prototype.serializeFormDataToMap = function (formData) {
        var _this = this;
        var blobColumns = _.filter(this.entitySchema.columns, {
            'sqlType': 'blob'
        }), promises = [];
        var map = {};
        if (formData && typeof formData.append === 'function' && formData.rowData) {
            _.forEach(formData.rowData, function (fieldData, fieldName) {
                if (fieldData && _.find(blobColumns, { 'fieldName': fieldName })) {
                    promises.push(_this.saveBlobToFile(fieldData).then(function (localFile) {
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
        return Promise.all(promises).then(function () { return map; });
    };
    /**
     * Converts map object back to form data.
     */
    LocalDBStore.prototype.deserializeMapToFormData = function (map) {
        var formData = new FormData(), blobColumns = this.entitySchema.columns.filter(function (c) { return c.sqlType === 'blob'; }), promises = [];
        _.forEach(blobColumns, function (column) {
            var value = map[column.fieldName];
            if (value && value.wmLocalPath) {
                promises.push(convertToBlob(value.wmLocalPath)
                    .then(function (result) { return formData.append(column.fieldName, result.blob, value.name); }));
                map[column.fieldName] = '';
            }
        });
        formData.append(SWAGGER_CONSTANTS.WM_DATA_JSON, new Blob([JSON.stringify(map)], {
            type: 'application/json'
        }));
        return Promise.all(promises).then(function () { return formData; });
    };
    LocalDBStore.prototype.createTableSql = function (schema) {
        var fieldStr = _.reduce(schema.columns, function (result, f) {
            var str = escapeName(f.name);
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
        return "CREATE TABLE IF NOT EXISTS " + escapeName(schema.name) + " (" + fieldStr + ")";
    };
    return LocalDBStore;
}());

var DBInfo = /** @class */ (function () {
    function DBInfo() {
        this.schema = {
            name: '',
            isInternal: false,
            entities: new Map()
        };
        this.stores = new Map();
        this.queries = new Map();
    }
    return DBInfo;
}());
var ColumnInfo = /** @class */ (function () {
    function ColumnInfo(name, fieldName) {
        this.name = name;
        this.fieldName = fieldName;
        this.primaryKey = false;
        this.fieldName = this.fieldName || this.name;
    }
    return ColumnInfo;
}());
var PullType;
(function (PullType) {
    PullType["LIVE"] = "LIVE";
    PullType["BUNDLED"] = "BUNDLED";
    PullType["APP_START"] = "APP_START";
})(PullType || (PullType = {}));

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
    LocalDBManagementService.ngInjectableDef = defineInjectable({ factory: function LocalDBManagementService_Factory() { return new LocalDBManagementService(inject(AppVersion), inject(DeviceService), inject(DeviceFileService), inject(File), inject(LocalKeyValueService), inject(SecurityService), inject(SQLite)); }, token: LocalDBManagementService, providedIn: "root" });
    return LocalDBManagementService;
}());

var PushService = /** @class */ (function () {
    function PushService() {
    }
    return PushService;
}());
var CONTEXT_KEY = 'changeLogService.flushContext';
var LAST_PUSH_INFO_KEY = 'changeLogService.lastPushInfo';
var ChangeLogService = /** @class */ (function () {
    function ChangeLogService(localDBManagementService, localKeyValueService, pushService, networkService) {
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
    ChangeLogService.prototype.add = function (service, operation, params) {
        var _this = this;
        var change = {
            service: service,
            operation: operation,
            params: params,
            hasError: 0
        };
        return executePromiseChain(this.getWorkers('transformParamsToMap'), [change])
            .then(function () { return executePromiseChain(_this.getWorkers('onAddCall'), [change]); })
            .then(function () {
            change.params = JSON.stringify(change.params);
            return _this.getStore().then(function (store) { return store.add(change); }).then(noop);
        });
    };
    ChangeLogService.prototype.addWorker = function (worker) {
        this.workers.push(worker);
    };
    /**
     * Clears the current log.
     */
    ChangeLogService.prototype.clearLog = function () {
        return this.getStore().then(function (s) { return s.clear(); });
    };
    /**
     * Flush the current log. If a flush is already running, then the promise of that flush is returned back.
     */
    ChangeLogService.prototype.flush = function (progressObserver) {
        var _this = this;
        var flushPromise;
        if (!this.deferredFlush) {
            this.deferredFlush = getAbortableDefer();
            this.createContext().then(function (context) {
                _this.flushContext = context;
                return executePromiseChain(_this.getWorkers('preFlush'), [_this.flushContext]);
            })
                .then(function () {
                flushPromise = _this._flush(progressObserver);
                _this.deferredFlush.onAbort = function () { return flushPromise.abort(); };
                return flushPromise;
            })
                .catch(noop)
                .then(function () {
                Promise.resolve().then(function () {
                    if (_this.currentPushInfo.totalTaskCount === _this.currentPushInfo.completedTaskCount) {
                        return _this.flushContext.clear().then(function () { return _this.flushContext = null; });
                    }
                }).then(function () {
                    progressObserver.complete();
                    if (_this.currentPushInfo.failedTaskCount > 0) {
                        _this.deferredFlush.reject(_this.currentPushInfo);
                    }
                    else {
                        _this.deferredFlush.resolve(_this.currentPushInfo);
                    }
                    _this.deferredFlush = null;
                }).then(function () {
                    return executePromiseChain(_this.getWorkers('postFlush'), [_this.currentPushInfo, _this.flushContext]);
                });
            });
        }
        return this.deferredFlush.promise;
    };
    /**
     * Returns the complete change list
     */
    ChangeLogService.prototype.getChanges = function () {
        return this.getStore().then(function (s) { return s.filter(undefined, 'id', {
            offset: 0,
            limit: 500
        }); }).then(function (changes) {
            changes.forEach(function (change) {
                change.params = JSON.parse(change.params);
            });
            return changes;
        });
    };
    /**
     * @returns {array} an array of changes that failed with error.
     */
    ChangeLogService.prototype.getErrors = function () {
        return this.getStore().then(function (s) { return s.filter([{
                attributeName: 'hasError',
                attributeValue: 1,
                attributeType: 'NUMBER',
                filterCondition: 'EQUALS'
            }]); });
    };
    ChangeLogService.prototype.getLastPushInfo = function () {
        return this.localKeyValueService.get(LAST_PUSH_INFO_KEY)
            .then(function (info) {
            if (isString(info.startTime)) {
                info.startTime = new Date(info.startTime);
            }
            if (isString(info.endTime)) {
                info.endTime = new Date(info.endTime);
            }
            return info;
        });
    };
    /**
     * @returns {number} number of changes that are pending to push.
     */
    ChangeLogService.prototype.getLogLength = function () {
        return this.getStore().then(function (s) { return s.count([{
                attributeName: 'hasError',
                attributeValue: 0,
                attributeType: 'NUMBER',
                filterCondition: 'EQUALS'
            }]); });
    };
    /*
    * Retrieves the entity store to use by ChangeLogService.
    */
    ChangeLogService.prototype.getStore = function () {
        return this.localDBManagementService.getStore('wavemaker', 'offlineChangeLog');
    };
    /**
     * Returns true, if a flush process is in progress. Otherwise, returns false.
     *
     * @returns {boolean} returns true, if a flush process is in progress. Otherwise, returns false.
     */
    ChangeLogService.prototype.isFlushInProgress = function () {
        return !(_.isUndefined(this.deferredFlush) || _.isNull(this.deferredFlush));
    };
    /**
     * Stops the ongoing flush process.
     *
     * @returns {object} a promise that is resolved when the flush process is stopped.
     */
    ChangeLogService.prototype.stop = function () {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.deferredFlush) {
                _this.deferredFlush.promise.catch().then(resolve);
                _this.deferredFlush.promise.abort();
            }
            else {
                resolve();
            }
        });
    };
    ChangeLogService.prototype.createContext = function () {
        var _this = this;
        return this.localKeyValueService.get(CONTEXT_KEY)
            .then(function (context) {
            context = context || {};
            return {
                'clear': function () {
                    context = {};
                    return _this.localKeyValueService.remove(CONTEXT_KEY);
                },
                'get': function (key) {
                    var value = context[key];
                    if (!value) {
                        value = {};
                        context[key] = value;
                    }
                    return value;
                },
                'save': function () { return _this.localKeyValueService.put(CONTEXT_KEY, context); }
            };
        });
    };
    // Flushes the complete log one after another.
    ChangeLogService.prototype._flush = function (progressObserver, defer$$1) {
        var _this = this;
        defer$$1 = defer$$1 || getAbortableDefer();
        if (defer$$1.isAborted) {
            return Promise.resolve();
        }
        this.getNextChange()
            .then(function (change) {
            if (change) {
                change.params = JSON.parse(change.params);
                return _this.flushChange(change);
            }
        })
            .then(function (change) {
            progressObserver.next(_this.currentPushInfo);
            if (change) {
                return _this.getStore()
                    .then(function (s) { return s.delete(change.id); })
                    .then(function () { return _this._flush(progressObserver, defer$$1); });
            }
            else {
                defer$$1.resolve();
            }
        }, function (change) {
            if (_this.networkService.isConnected()) {
                change.hasError = 1;
                change.params = JSON.stringify(change.params);
                _this.getStore()
                    .then(function (s) { return s.save(change); })
                    .then(function () { return _this._flush(progressObserver, defer$$1); });
            }
            else {
                var connectPromise_1 = _this.networkService.onConnect();
                defer$$1.promise.catch(function () {
                    if (connectPromise_1) {
                        connectPromise_1.abort();
                    }
                });
                connectPromise_1.then(function () {
                    _this._flush(progressObserver, defer$$1);
                    connectPromise_1 = null;
                });
            }
        });
        return defer$$1.promise;
    };
    ChangeLogService.prototype.flushChange = function (change) {
        var _this = this;
        var self = this;
        return executePromiseChain(this.getWorkers('preCall'), [change])
            .then(function () { return change.hasError ? Promise.reject(change.errorMessage) : ''; })
            .then(function () { return executePromiseChain(_this.getWorkers('transformParamsFromMap'), [change]); })
            .then(function () { return _this.pushService.push(change); })
            .then(function () {
            return executePromiseChain(_.reverse(self.getWorkers('postCallSuccess')), [change, arguments])
                .then(function () { return change; });
        }).catch(function () {
            if (self.networkService.isConnected()) {
                return executePromiseChain(_.reverse(self.getWorkers('postCallError')), [change, arguments])
                    .catch(noop).then(function () { return Promise.reject(change); });
            }
            return Promise.reject(change);
        });
    };
    // Flushes the first registered change.
    ChangeLogService.prototype.getNextChange = function () {
        var filterCriteria = [{
                attributeName: 'hasError',
                attributeValue: 0,
                attributeType: 'NUMBER',
                filterCondition: 'EQUALS'
            }];
        return this.getStore().then(function (s) { return s.filter(filterCriteria, 'id', {
            offset: 0,
            limit: 1
        }); }).then(function (changes) {
            return changes && changes[0];
        });
    };
    ChangeLogService.prototype.getWorkers = function (type) {
        return _.map(this.workers, function (w) { return w[type] && w[type].bind(w); });
    };
    ChangeLogService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    ChangeLogService.ctorParameters = function () { return [
        { type: LocalDBManagementService },
        { type: LocalKeyValueService },
        { type: PushService },
        { type: NetworkService }
    ]; };
    ChangeLogService.ngInjectableDef = defineInjectable({ factory: function ChangeLogService_Factory() { return new ChangeLogService(inject(LocalDBManagementService), inject(LocalKeyValueService), inject(PushService), inject(NetworkService)); }, token: ChangeLogService, providedIn: "root" });
    return ChangeLogService;
}());
var FlushTracker = /** @class */ (function () {
    function FlushTracker(changeLogService, localKeyValueService, pushInfo) {
        this.changeLogService = changeLogService;
        this.localKeyValueService = localKeyValueService;
        this.pushInfo = pushInfo;
        this.logger = window.console;
    }
    FlushTracker.prototype.onAddCall = function (change) {
        this.logger.debug('Added the following call %o to log.', change);
    };
    FlushTracker.prototype.preFlush = function (flushContext) {
        var _this = this;
        this.pushInfo.totalTaskCount = 0;
        this.pushInfo.successfulTaskCount = 0;
        this.pushInfo.failedTaskCount = 0;
        this.pushInfo.completedTaskCount = 0;
        this.pushInfo.inProgress = true;
        this.pushInfo.startTime = new Date();
        this.flushContext = flushContext;
        this.logger.debug('Starting flush');
        return this.changeLogService.getStore().then(function (store) {
            return store.count([{
                    attributeName: 'hasError',
                    attributeValue: 0,
                    attributeType: 'NUMBER',
                    filterCondition: 'EQUALS'
                }]);
        }).then(function (count) { return _this.pushInfo.totalTaskCount = count; });
    };
    FlushTracker.prototype.postFlush = function (stats, flushContext) {
        this.logger.debug('flush completed. {Success : %i , Error : %i , completed : %i, total : %i }.', this.pushInfo.successfulTaskCount, this.pushInfo.failedTaskCount, this.pushInfo.completedTaskCount, this.pushInfo.totalTaskCount);
        this.pushInfo.inProgress = false;
        this.pushInfo.endTime = new Date();
        this.localKeyValueService.put(LAST_PUSH_INFO_KEY, this.pushInfo);
        this.flushContext = null;
    };
    FlushTracker.prototype.preCall = function (change) {
        this.logger.debug('%i. Invoking call %o', (1 + this.pushInfo.completedTaskCount), change);
    };
    FlushTracker.prototype.postCallError = function (change, response) {
        this.pushInfo.completedTaskCount++;
        this.pushInfo.failedTaskCount++;
        this.logger.error('call failed with the response %o.', response);
        return this.flushContext.save();
    };
    FlushTracker.prototype.postCallSuccess = function (change, response) {
        this.pushInfo.completedTaskCount++;
        this.pushInfo.successfulTaskCount++;
        this.logger.debug('call returned the following response %o.', response);
        return this.flushContext.save();
    };
    return FlushTracker;
}());

var LocalDbService = /** @class */ (function () {
    function LocalDbService(localDBManagementService) {
        this.localDBManagementService = localDBManagementService;
        this.searchTableData = this.readTableData.bind(this);
        this.searchTableDataWithQuery = this.readTableData.bind(this);
        this.getDistinctDataByFields = this.readTableData.bind(this);
    }
    LocalDbService.prototype.getStore = function (params) {
        return this.localDBManagementService.getStore(params.dataModelName, params.entityName);
    };
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
    LocalDbService.prototype.insertTableData = function (params, successCallback, failureCallback) {
        this.getStore(params).then(function (store) {
            var isPKAutoIncremented = (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity');
            if (isPKAutoIncremented && params.data[store.primaryKeyName]) {
                delete params.data[store.primaryKeyName];
            }
            return store.add(params.data).then(function () {
                store.refresh(params.data).then(successCallback);
            });
        }).catch(failureCallback);
    };
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
    LocalDbService.prototype.insertMultiPartTableData = function (params, successCallback, failureCallback) {
        var _this = this;
        this.getStore(params).then(function (store) {
            store.serialize(params.data).then(function (data) {
                params.data = data;
                _this.insertTableData(params, successCallback, failureCallback);
            });
        }).catch(failureCallback);
    };
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
    LocalDbService.prototype.updateTableData = function (params, successCallback, failureCallback) {
        this.getStore(params).then(function (store) {
            return store.save(params.data)
                .then(function () {
                store.refresh(params.data).then(successCallback);
            });
        }).catch(failureCallback);
    };
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
    LocalDbService.prototype.updateMultiPartTableData = function (params, successCallback, failureCallback) {
        var data = (params.data && params.data.rowData) || params.data;
        this.getStore(params).then(function (store) {
            return store.save(data);
        }).then(function () {
            if (successCallback) {
                successCallback(data);
            }
        }).catch(failureCallback);
    };
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
    LocalDbService.prototype.deleteTableData = function (params, successCallback, failureCallback) {
        this.getStore(params).then(function (store) {
            var pkField = store.primaryKeyField, id = params[pkField.fieldName] || params[pkField.name] || (params.data && params.data[pkField.fieldName]) || params.id;
            store.delete(id).then(successCallback);
        }).catch(failureCallback);
    };
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
    LocalDbService.prototype.readTableData = function (params, successCallback, failureCallback) {
        var _this = this;
        this.getStore(params).then(function (store) {
            var filter = params.filter(function (filterGroup, filterFields) {
                _this.convertFieldNameToColumnName(store, filterGroup, filterFields);
            }, true);
            // convert wm_bool function with boolean value to 0/1
            filter = filter.replace(/wm_bool\('true'\)/g, 1).replace(/wm_bool\('false'\)/g, 0);
            return store.count(filter).then(function (totalElements) {
                var sort = params.sort.split('=')[1];
                return store.filter(filter, sort, {
                    offset: (params.page - 1) * params.size,
                    limit: params.size
                }).then(function (data) {
                    var totalPages = Math.ceil(totalElements / params.size);
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
    };
    LocalDbService.prototype.escapeName = function (name) {
        if (name) {
            name = name.replace(/"/g, '""');
            return '"' + name.replace(/\./g, '"."') + '"';
        }
        return name;
    };
    // returns the columnName appending with the schema name.
    LocalDbService.prototype.getColumnName = function (store, fieldName) {
        if (store.fieldToColumnMapping[fieldName]) {
            var columnName = this.escapeName(store.fieldToColumnMapping[fieldName]);
            if (columnName.indexOf('.') < 0) {
                return this.escapeName(store.entitySchema.name) + '.' + columnName;
            }
            return columnName;
        }
        return fieldName;
    };
    LocalDbService.prototype.convertFieldNameToColumnName = function (store, filterGroup, options) {
        var _this = this;
        _.forEach(filterGroup.rules, function (rule) {
            if (rule.rules) {
                _this.convertFieldNameToColumnName(store, rule);
            }
            else {
                rule.target = _this.getColumnName(store, rule.target);
            }
        });
        // handling the scenario where variable options can have filterField. For example: search filter query
        if (options && options.filterFields) {
            options.filterFields = _.mapKeys(options.filterFields, function (v, k) {
                return _this.getColumnName(store, k);
            });
        }
    };
    LocalDbService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    LocalDbService.ctorParameters = function () { return [
        { type: LocalDBManagementService }
    ]; };
    LocalDbService.ngInjectableDef = defineInjectable({ factory: function LocalDbService_Factory() { return new LocalDbService(inject(LocalDBManagementService)); }, token: LocalDbService, providedIn: "root" });
    return LocalDbService;
}());

var STORE_KEY = 'offlineFileUpload';
var FileHandler = /** @class */ (function () {
    function FileHandler() {
        this.logger = window.console;
    }
    FileHandler.prototype.preFlush = function (context) {
        this.fileStore = context.get(STORE_KEY);
    };
    /**
     * Replaces all local paths with the remote path using mappings created during 'uploadToServer'.
     */
    FileHandler.prototype.preCall = function (change) {
        var _this = this;
        if (change.service === 'DatabaseService') {
            change.params.data = _.mapValues(change.params.data, function (v) {
                var remoteUrl = _this.fileStore[v];
                if (remoteUrl) {
                    _this.logger.debug('swapped file path from %s -> %s', v, remoteUrl);
                    return remoteUrl;
                }
                return v;
            });
        }
    };
    FileHandler.prototype.postCallSuccess = function (change, response) {
        if (change.service === 'OfflineFileUploadService'
            && change.operation === 'uploadToServer') {
            var remoteFile = JSON.parse(response[0].text)[0];
            /*
             * A mapping will be created between local path and remote path.
             * This will be used to resolve local paths in entities.
             */
            this.fileStore[change.params.file] = remoteFile.path;
            this.fileStore[change.params.file + '?inline'] = remoteFile.inlinePath;
        }
    };
    return FileHandler;
}());
var UploadedFilesImportAndExportService = /** @class */ (function () {
    function UploadedFilesImportAndExportService(changeLogService, deviceFileService, localDBManagementService, file) {
        this.changeLogService = changeLogService;
        this.deviceFileService = deviceFileService;
        this.localDBManagementService = localDBManagementService;
        this.file = file;
    }
    UploadedFilesImportAndExportService.prototype.preExport = function (folderToExport, meta) {
        // copy offline uploads
        var uploadFullPath = this.deviceFileService.getUploadDirectory(), lastIndexOfSep = uploadFullPath.lastIndexOf('/'), uploadParentDir = uploadFullPath.substring(0, lastIndexOfSep + 1), uploadDirName = uploadFullPath.substring(lastIndexOfSep + 1);
        meta.uploadDir = uploadFullPath;
        return this.file.copyDir(uploadParentDir, uploadDirName, folderToExport, 'uploads');
    };
    UploadedFilesImportAndExportService.prototype.postImport = function (importedFolder, meta) {
        var _this = this;
        var uploadFullPath = this.deviceFileService.getUploadDirectory(), lastIndexOfSep = uploadFullPath.lastIndexOf('/'), uploadParentDir = uploadFullPath.substring(0, lastIndexOfSep + 1), uploadDirName = uploadFullPath.substring(lastIndexOfSep + 1);
        this.uploadDir = uploadFullPath;
        return this.file.checkDir(importedFolder, 'uploads')
            .then(function () {
            return _this.deviceFileService.removeDir(uploadFullPath)
                .then(function () { return _this.file.copyDir(importedFolder, 'uploads', uploadParentDir, uploadDirName); })
                .then(function () { return _this.updateChanges(meta); });
        }, noop);
    };
    /**
     * returns back the changes that were logged.
     * @param page page number
     * @param size size of page
     * @returns {*}
     */
    UploadedFilesImportAndExportService.prototype.getChanges = function (page, size) {
        return this.changeLogService.getStore().then(function (strore) {
            return (strore.filter([], 'id', {
                offset: (page - 1) * size,
                limit: size
            }));
        });
    };
    /**
     * If this is a database change, then it will replace old upload directory with the current upload directory
     * and its corresponding owner object, if  it has primary key.
     *
     * @param change
     * @param oldUploadDir
     * @param uploadDir
     * @returns {*}
     */
    UploadedFilesImportAndExportService.prototype.updateDBChange = function (change, oldUploadDir, uploadDir) {
        var _this = this;
        var modifiedProperties = {}, entityName = change.params.entityName, dataModelName = change.params.dataModelName;
        change.params.data = _.mapValues(change.params.data, function (v, k) {
            var mv = v, isModified = false;
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
                .then(function (store) {
                // If there is a primary for the entity, then update actual row with the modifications
                if (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity') {
                    var primaryKeyName = store.primaryKeyName;
                    var primaryKey = change.params.data[primaryKeyName];
                    return store.get(primaryKey)
                        .then(function (obj) { return store.save(_.assignIn(obj, modifiedProperties)); });
                }
            }).then(function () {
                change.params = JSON.stringify(change.params);
                return _this.changeLogService.getStore().then(function (store) { return store.save(change); });
            });
        }
    };
    /**
     * This function check this change to update old upload directory path.
     *
     * @param change
     * @param metaInfo
     * @returns {*}
     */
    UploadedFilesImportAndExportService.prototype.updateChange = function (change, metaInfo) {
        change.params = JSON.parse(change.params);
        if (change.service === 'OfflineFileUploadService'
            && change.operation === 'uploadToServer') {
            change.params.file = _.replace(change.params.file, metaInfo.uploadDir, this.uploadDir);
            change.params = JSON.stringify(change.params);
            return this.changeLogService.getStore().then(function (store) { return store.save(change); });
        }
        if (change.service === 'DatabaseService') {
            return this.updateDBChange(change, metaInfo.uploadDir, this.uploadDir);
        }
    };
    /**
     * This function will visit all the changes and modify them, if necessary.
     * @param metaInfo
     * @param page
     * @returns {*}
     */
    UploadedFilesImportAndExportService.prototype.updateChanges = function (metaInfo, page) {
        var _this = this;
        if (page === void 0) { page = 1; }
        var size = 10;
        return this.getChanges(page, size)
            .then(function (changes) {
            if (changes && changes.length > 0) {
                return Promise.all(changes.map(function (change) { return _this.updateChange(change, metaInfo); }));
            }
        }).then(function (result) {
            if (result && result.length === size) {
                return _this.updateChanges(metaInfo, page + 1);
            }
        });
    };
    return UploadedFilesImportAndExportService;
}());

var STORE_KEY$1 = 'errorBlockerStore';
var ErrorBlocker = /** @class */ (function () {
    function ErrorBlocker(localDBManagementService) {
        this.localDBManagementService = localDBManagementService;
    }
    ErrorBlocker.prototype.preFlush = function (context) {
        this.errorStore = context.get(STORE_KEY$1);
    };
    // block all calls related to the error entities
    ErrorBlocker.prototype.preCall = function (change) {
        var _this = this;
        if (change && change.service === 'DatabaseService') {
            var entityName_1 = change.params.entityName;
            var dataModelName_1 = change.params.dataModelName;
            switch (change.operation) {
                case 'insertTableData':
                case 'insertMultiPartTableData':
                case 'updateTableData':
                case 'updateMultiPartTableData':
                    return this.localDBManagementService.getStore(dataModelName_1, entityName_1).then(function (store) {
                        _this.blockCall(store, change, dataModelName_1, entityName_1, change.params.data);
                    });
                case 'deleteTableData':
                    return this.localDBManagementService.getStore(dataModelName_1, entityName_1).then(function (store) {
                        _this.blockCall(store, change, dataModelName_1, entityName_1, change.params);
                    });
            }
        }
    };
    // store error entity id
    ErrorBlocker.prototype.postCallSuccess = function (change) {
        var _this = this;
        if (change && change.service === 'DatabaseService') {
            var entityName_2 = change.params.entityName;
            var dataModelName_2 = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName_2, entityName_2).then(function (store) {
                var id = change['dataLocalId'] || change.params.data[store.primaryKeyName];
                if (!(_.isUndefined(id) || _.isNull(id))) {
                    _this.removeError(dataModelName_2, entityName_2, id);
                }
            });
        }
    };
    // store error entity id
    ErrorBlocker.prototype.postCallError = function (change) {
        var _this = this;
        if (change && change.service === 'DatabaseService') {
            var entityName_3 = change.params.entityName;
            var dataModelName_3 = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName_3, entityName_3).then(function (store) {
                var id = change['dataLocalId'] || (change.params.data && change.params.data[store.primaryKeyName]) || change.params[store.primaryKeyName] || change.params.id;
                if (!(_.isUndefined(id) || _.isNull(id))) {
                    _this.recordError(dataModelName_3, entityName_3, id);
                }
            });
        }
    };
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
    ErrorBlocker.prototype.blockCall = function (store, change, dataModelName, entityName, data) {
        var _this = this;
        if (change.hasError === 0) {
            this.checkForPreviousError(store, change, dataModelName, entityName, data);
            store.entitySchema.columns.forEach(function (col) {
                if (col.foreignRelations) {
                    col.foreignRelations.some(function (foreignRelation) {
                        if (data[foreignRelation.sourceFieldName]) {
                            _this.blockCall(store, change, dataModelName, foreignRelation.targetEntity, data[foreignRelation.sourceFieldName]);
                        }
                        else if (data[col.fieldName]) {
                            _this.checkForPreviousError(store, change, dataModelName, foreignRelation.targetEntity, data, col.fieldName);
                        }
                        return change.hasError === 1;
                    });
                }
            });
        }
    };
    // A helper function to check for earlier failures.
    ErrorBlocker.prototype.checkForPreviousError = function (store, change, dataModelName, entityName, data, key) {
        var primaryKey = key || store.primaryKeyName;
        if (this.hasError(dataModelName, entityName, data[primaryKey])) {
            change.hasError = 1;
            change.errorMessage = "Blocked call due to error in previous call of entity [ " + entityName + " ] with id [ " + data[primaryKey] + " ]";
        }
    };
    ErrorBlocker.prototype.hasError = function (dataModelName, entityName, id) {
        if (this.errorStore[dataModelName]
            && this.errorStore[dataModelName][entityName]
            && this.errorStore[dataModelName][entityName][id]) {
            return true;
        }
        return false;
    };
    // Removes entity identifier from error list.
    ErrorBlocker.prototype.removeError = function (dataModelName, entityName, id) {
        if (this.errorStore[dataModelName]
            && this.errorStore[dataModelName][entityName]
            && this.errorStore[dataModelName][entityName][id]) {
            delete this.errorStore[dataModelName][entityName][id];
        }
    };
    // Save error entity identifier.
    ErrorBlocker.prototype.recordError = function (dataModelName, entityName, id) {
        this.errorStore[dataModelName] = this.errorStore[dataModelName] || {};
        this.errorStore[dataModelName][entityName] = this.errorStore[dataModelName][entityName] || {};
        this.errorStore[dataModelName][entityName][id] = true;
    };
    return ErrorBlocker;
}());

var STORE_KEY$2 = 'idConflictResolution';
/**
 * In offline database, a insert could generate the Id of an entity. During flush, id of that entity might get changed.
 * Due to that, relationship inconsistency arises. To prevent that, wherever this entity is referred in the next flush
 * call, Id has to be replaced with that of new one.
 */
var IdResolver = /** @class */ (function () {
    function IdResolver(localDBManagementService) {
        this.localDBManagementService = localDBManagementService;
        this.logger = window.console;
    }
    IdResolver.prototype.preFlush = function (context) {
        this.idStore = context.get(STORE_KEY$2);
    };
    // Exchane Ids, Before any database operation.
    IdResolver.prototype.preCall = function (change) {
        var _this = this;
        if (change && change.service === 'DatabaseService') {
            var entityName_1 = change.params.entityName;
            var dataModelName_1 = change.params.dataModelName;
            switch (change.operation) {
                case 'insertTableData':
                case 'insertMultiPartTableData':
                    change.params.skipLocalDB = true;
                    return this.localDBManagementService.getStore(dataModelName_1, entityName_1)
                        .then(function (store) {
                        var primaryKeyName = store.primaryKeyName;
                        if (primaryKeyName) {
                            _this.transactionLocalId = change.params.data[primaryKeyName];
                            change['dataLocalId'] = _this.transactionLocalId;
                        }
                        return _this.exchangeIds(store, dataModelName_1, entityName_1, change.params.data)
                            .then(function () {
                            if (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity') {
                                delete change.params.data[primaryKeyName];
                            }
                            else {
                                var relationalPrimaryKeyValue = store.getValue(change.params.data, store.primaryKeyName);
                                // for the data referring to the relational table based on primary key assign the primaryField values to the relationalPrimaryKeyValue
                                if (isDefined(relationalPrimaryKeyValue)) {
                                    change.params.data[primaryKeyName] = relationalPrimaryKeyValue;
                                    if (_this.transactionLocalId !== null) {
                                        _this.pushIdToStore(dataModelName_1, entityName_1, _this.transactionLocalId, relationalPrimaryKeyValue);
                                    }
                                }
                                _this.transactionLocalId = null;
                            }
                        });
                    });
                case 'updateTableData':
                case 'updateMultiPartTableData':
                case 'deleteTableData':
                    return this.localDBManagementService.getStore(dataModelName_1, entityName_1).then(function (store) {
                        // on update call, passing id to exchangeId as change.params id(local value 10000000+) is not updated with the latest id from db
                        _this.exchangeId(store, dataModelName_1, entityName_1, change.params, 'id');
                        if (change.params.data) {
                            return _this.exchangeIds(store, dataModelName_1, entityName_1, change.params.data);
                        }
                    });
            }
        }
    };
    // After every database insert, track the Id change.
    IdResolver.prototype.postCallSuccess = function (change, response) {
        var _this = this;
        if (change && change.service === 'DatabaseService'
            && (change.operation === 'insertTableData' || change.operation === 'insertMultiPartTableData')
            && this.transactionLocalId) {
            var data_1 = response[0].body;
            var entityName_2 = change.params.entityName;
            var dataModelName_2 = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName_2, entityName_2).then(function (store) {
                _this.pushIdToStore(dataModelName_2, entityName_2, _this.transactionLocalId, data_1[store.primaryKeyName]);
                return store.delete(_this.transactionLocalId).catch(noop).then(function () {
                    _this.transactionLocalId = null;
                    return store.save(data_1);
                });
            });
        }
    };
    // store error entity id
    IdResolver.prototype.postCallError = function (change) {
        var _this = this;
        if (change && change.service === 'DatabaseService'
            && (change.operation === 'insertTableData' || change.operation === 'insertMultiPartTableData')
            && this.transactionLocalId) {
            var entityName = change.params.entityName;
            var dataModelName = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName, entityName).then(function (store) {
                change.params.data[store.primaryKeyName] = _this.transactionLocalId;
            });
        }
    };
    IdResolver.prototype.getEntityIdStore = function (dataModelName, entityName) {
        this.idStore[dataModelName] = this.idStore[dataModelName] || {};
        this.idStore[dataModelName][entityName] = this.idStore[dataModelName][entityName] || {};
        return this.idStore[dataModelName][entityName];
    };
    // if local id is different, then create a mapping for exchange.
    IdResolver.prototype.pushIdToStore = function (dataModelName, entityName, transactionLocalId, remoteId) {
        if (transactionLocalId !== remoteId) {
            this.getEntityIdStore(dataModelName, entityName)[transactionLocalId] = remoteId;
            this.logger.debug('Conflict found for entity (%s) with local id (%i) and remote Id (%i)', entityName, transactionLocalId, remoteId);
        }
    };
    IdResolver.prototype.logResolution = function (entityName, localId, remoteId) {
        this.logger.debug('Conflict resolved found for entity (%s) with local id (%i) and remote Id (%i)', entityName, localId, remoteId);
    };
    // Exchange primary key  of the given entity
    IdResolver.prototype.exchangeId = function (store, dataModelName, entityName, data, keyName) {
        var primaryKeyName = keyName || store.primaryKeyName;
        var entityIdStore = this.getEntityIdStore(dataModelName, entityName);
        if (data && primaryKeyName) {
            var localId = data[primaryKeyName];
            var remoteId = localId;
            while (entityIdStore[remoteId]) {
                remoteId = entityIdStore[remoteId];
            }
            if (remoteId !== localId) {
                data[primaryKeyName] = remoteId;
                this.logResolution(entityName, localId, remoteId);
            }
        }
    };
    // Looks primary key changes in the given entity or in the relations
    IdResolver.prototype.exchangeIds = function (store, dataModelName, entityName, data) {
        var _this = this;
        this.exchangeId(store, dataModelName, entityName, data);
        var exchangeIdPromises = [];
        store.entitySchema.columns.forEach(function (col) {
            if (col.foreignRelations) {
                col.foreignRelations.forEach(function (foreignRelation) {
                    if (data[col.fieldName]) { // if id value
                        _this.exchangeId(store, dataModelName, foreignRelation.targetEntity, data, col.fieldName);
                    }
                    if (data[foreignRelation.sourceFieldName]) { // if object reference
                        exchangeIdPromises.push(_this.localDBManagementService.getStore(dataModelName, foreignRelation.targetEntity)
                            .then(function (refStore) {
                            return _this.exchangeIds(refStore, dataModelName, foreignRelation.targetEntity, data[foreignRelation.sourceFieldName]);
                        }));
                    }
                });
            }
        });
        return Promise.all(exchangeIdPromises);
    };
    IdResolver.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    IdResolver.ctorParameters = function () { return [
        { type: LocalDBManagementService }
    ]; };
    return IdResolver;
}());

var MultiPartParamTransformer = /** @class */ (function () {
    function MultiPartParamTransformer(deviceFileService, localDBManagementService) {
        this.deviceFileService = deviceFileService;
        this.localDBManagementService = localDBManagementService;
    }
    MultiPartParamTransformer.prototype.postCallSuccess = function (change) {
        var _this = this;
        if (change && change.service === 'DatabaseService') {
            switch (change.operation) {
                case 'insertMultiPartTableData':
                case 'updateMultiPartTableData':
                    // clean up files
                    _.forEach(change.params.data, function (v) {
                        if (_.isObject(v) && v.wmLocalPath) {
                            _this.deviceFileService.removeFile(v.wmLocalPath);
                        }
                    });
                    break;
            }
        }
    };
    MultiPartParamTransformer.prototype.transformParamsFromMap = function (change) {
        if (change && change.service === 'DatabaseService') {
            switch (change.operation) {
                case 'insertMultiPartTableData':
                case 'updateMultiPartTableData':
                    return this.localDBManagementService.getStore(change.params.dataModelName, change.params.entityName)
                        .then(function (store) {
                        // construct Form data
                        return store.deserialize(change.params.data).then(function (formData) {
                            change.params.data = formData;
                        });
                    });
            }
        }
    };
    MultiPartParamTransformer.prototype.transformParamsToMap = function (change) {
        if (change && change.service === 'DatabaseService') {
            switch (change.operation) {
                case 'insertMultiPartTableData':
                case 'updateMultiPartTableData':
                    return this.localDBManagementService.getStore(change.params.dataModelName, change.params.entityName)
                        .then(function (store) {
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
    };
    return MultiPartParamTransformer;
}());

var apiConfiguration = [{
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
var isOfflineBehaviorAdded = false;
var LiveVariableOfflineBehaviour = /** @class */ (function () {
    function LiveVariableOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService, offlineDBService) {
        this.changeLogService = changeLogService;
        this.httpService = httpService;
        this.localDBManagementService = localDBManagementService;
        this.networkService = networkService;
        this.offlineDBService = offlineDBService;
        this.onlineDBService = LVService;
    }
    LiveVariableOfflineBehaviour.prototype.add = function () {
        var _this = this;
        if (!isOfflineBehaviorAdded) {
            isOfflineBehaviorAdded = true;
            var onlineHandler_1 = this.httpService.sendCallAsObservable;
            if (onlineHandler_1) {
                this.httpService.sendCallAsObservable = function (reqParams, params) {
                    if (!params && _.get(reqParams, 'url')) {
                        params = { url: reqParams.url };
                    }
                    // reqParams will contain the full path of insert/update call which will be processed again in parseConfig method
                    // and will be appended again with '/services/./.' which will result in deployedUrl + '/service/./.' + '/service/./.' which is wrong.
                    // Hence passing url in params
                    var clonedParamsUrl = _.clone(params.url);
                    params = _.extend(params, reqParams);
                    var operation = _.find(apiConfiguration, { name: _.get(params, 'operation') });
                    if (_this.networkService.isConnected() || params.onlyOnline || !operation || !params.dataModelName) {
                        return from(_this.remoteDBcall(operation, onlineHandler_1, params));
                    }
                    // converting promise to observable as LVService returns a observable
                    return from(_this.localDBManagementService.isOperationAllowed(params.dataModelName, params.entityName, operation.type)
                        .then(function (isAllowedInOffline) {
                        if (!isAllowedInOffline) {
                            return _this.remoteDBcall(operation, onlineHandler_1, params);
                        }
                        else {
                            var cascader_1;
                            return Promise.resolve().then(function () {
                                if (!params.isCascadingStopped &&
                                    (operation.name === 'insertTableData'
                                        || operation.name === 'updateTableData')) {
                                    return _this.prepareToCascade(params).then(function (c) { return cascader_1 = c; });
                                }
                            }).then(function () {
                                return new Promise(function (resolve, reject) {
                                    _this.localDBcall(operation, params, resolve, reject, clonedParamsUrl);
                                });
                            }).then(function (response) {
                                if (cascader_1) {
                                    return cascader_1.cascade().then(function () {
                                        return _this.getStore(params).then(function (store) {
                                            return store.refresh(response.body);
                                        }).then(function (data) {
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
    };
    LiveVariableOfflineBehaviour.prototype.getStore = function (params) {
        return this.localDBManagementService.getStore(params.dataModelName, params.entityName);
    };
    // set hasBlob flag on params when blob field is present
    LiveVariableOfflineBehaviour.prototype.hasBlob = function (store) {
        var blobColumns = _.filter(store.entitySchema.columns, {
            'sqlType': 'blob'
        });
        return !!blobColumns.length;
    };
    /*
     * During offline, LocalDBService will answer to all the calls. All data modifications will be recorded
     * and will be reported to DatabaseService when device goes online.
     */
    LiveVariableOfflineBehaviour.prototype.localDBcall = function (operation, params, successCallback, failureCallback, clonedParamsUrl) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.offlineDBService[operation.name](params, function (response) {
                if (operation.type === 'READ') {
                    resolve(response);
                }
                else {
                    // add to change log
                    params.onlyOnline = true;
                    params.url = clonedParamsUrl;
                    return _this.changeLogService.add('DatabaseService', operation.name, params)
                        .then(function () { return resolve(response); });
                }
            });
        }).then(function (response) {
            response = { body: response, type: WM_LOCAL_OFFLINE_CALL };
            triggerFn(successCallback, response);
            return response;
        }, failureCallback);
    };
    /*
     * During online, all read operations data will be pushed to offline database. Similarly, Update and Delete
     * operations are synced with the offline database.
     */
    LiveVariableOfflineBehaviour.prototype.remoteDBcall = function (operation, onlineHandler, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            onlineHandler.call(_this.httpService, params).subscribe(function (response) {
                if (response && response.type) {
                    if (!params.skipLocalDB) {
                        _this.offlineDBService.getStore(params).then(function (store) {
                            if (operation.type === 'READ' && operation.saveResponse) {
                                store.saveAll(response.body.content);
                            }
                            else if (operation.type === 'INSERT') {
                                params = _.clone(params);
                                params.data = _.clone(response.body);
                                _this.offlineDBService[operation.name](params, noop, noop);
                            }
                            else {
                                _this.offlineDBService[operation.name](params, noop, noop);
                            }
                        }).catch(noop);
                    }
                    resolve(response);
                }
            }, function (err) {
                reject(err);
            });
        });
    };
    /**
     * Finds out the nested objects to save and prepares a cloned params.
     */
    LiveVariableOfflineBehaviour.prototype.prepareToCascade = function (params) {
        var _this = this;
        return this.getStore(params).then(function (store) {
            var childObjectPromises = [];
            _.forEach(params.data, function (v, k) {
                var column, foreignRelation, childParams;
                // NOTE: Save only one-to-one relations for cascade
                if (_.isObject(v) && !_.isArray(v)) {
                    column = store.entitySchema.columns.find(function (c) {
                        if (c.primaryKey && c.foreignRelations) {
                            foreignRelation = c.foreignRelations.find(function (f) { return f.sourceFieldName === k; });
                        }
                        return !!foreignRelation;
                    });
                }
                if (column) {
                    childParams = _.cloneDeep(params);
                    childParams.entityName = foreignRelation.targetEntity;
                    childParams.data = v;
                    var childPromise = _this.getStore(childParams).then(function (childStore) {
                        var parent = params.data;
                        var targetColumns = childStore.entitySchema.columns.find(function (c) { return c.name === foreignRelation.targetColumn; });
                        if (targetColumns && targetColumns.foreignRelations) {
                            var parentFieldName = targetColumns.foreignRelations.find(function (f) { return f.targetTable === store.entitySchema.name; }).sourceFieldName;
                            childParams.data[parentFieldName] = parent;
                        }
                        parent[k] = null;
                        childParams.onlyOnline = false;
                        childParams.isCascadingStopped = true;
                        childParams.hasBlob = _this.hasBlob(childStore);
                        childParams.url = '';
                        return function () {
                            return Promise.resolve().then(function () {
                                var primaryKeyValue = childStore.getValue(childParams.data, childStore.primaryKeyField.fieldName);
                                return primaryKeyValue ? childStore.get(primaryKeyValue) : null;
                            }).then(function (object) {
                                var operation;
                                if (object) {
                                    operation = childParams.hasBlob ? 'updateMultiPartTableData' : 'updateTableData';
                                }
                                else {
                                    operation = childParams.hasBlob ? 'insertMultiPartTableData' : 'insertTableData';
                                }
                                return _this.onlineDBService[operation](childParams).toPromise();
                            });
                        };
                    });
                    childObjectPromises.push(childPromise);
                }
            });
            return Promise.all(childObjectPromises).then(function (result) {
                return {
                    cascade: function () { return Promise.all(result.map(function (fn) { return fn(); })); }
                };
            });
        });
    };
    return LiveVariableOfflineBehaviour;
}());

var isOfflineBehaviourAdded = false;
var FileUploadOfflineBehaviour = /** @class */ (function () {
    function FileUploadOfflineBehaviour(changeLogService, deviceFileService, deviceFileUploadService, file, networkService, uploadDir) {
        this.changeLogService = changeLogService;
        this.deviceFileService = deviceFileService;
        this.deviceFileUploadService = deviceFileUploadService;
        this.file = file;
        this.networkService = networkService;
        this.uploadDir = uploadDir;
    }
    FileUploadOfflineBehaviour.prototype.add = function () {
        var _this = this;
        if (isOfflineBehaviourAdded) {
            return;
        }
        isOfflineBehaviourAdded = true;
        var orig = this.deviceFileUploadService.upload;
        this.deviceFileUploadService['uploadToServer'] = orig;
        this.deviceFileUploadService.upload = function (url, fileParamName, localPath, fileName, params, headers) {
            if (_this.networkService.isConnected()) {
                return orig.call(_this.deviceFileUploadService, url, fileParamName, localPath, fileName, params, headers);
            }
            else {
                return _this.uploadLater(url, fileParamName, localPath, fileName, params, headers).then(function (response) {
                    return {
                        text: JSON.stringify(response),
                        headers: null,
                        response: response
                    };
                });
            }
        };
    };
    FileUploadOfflineBehaviour.prototype.uploadLater = function (url, fileParamName, localPath, fileName, params, headers) {
        var _this = this;
        var i = localPath.lastIndexOf('/'), soureDir = localPath.substring(0, i), soureFile = localPath.substring(i + 1), destFile = this.deviceFileService.appendToFileName(soureFile), filePath = this.uploadDir + '/' + destFile;
        return this.file.copyFile(soureDir, soureFile, this.uploadDir, destFile)
            .then(function () {
            return _this.changeLogService.add('OfflineFileUploadService', 'uploadToServer', {
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
        }).then(function () {
            return [{
                    fileName: soureFile,
                    path: filePath,
                    length: 0,
                    success: true,
                    inlinePath: filePath + '?inline'
                }];
        });
    };
    return FileUploadOfflineBehaviour;
}());

var NUMBER_REGEX = /^\d+(\.\d+)?$/;
var isOfflineBehaviourAdded$1 = false;
var NamedQueryExecutionOfflineBehaviour = /** @class */ (function () {
    function NamedQueryExecutionOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService) {
        this.changeLogService = changeLogService;
        this.httpService = httpService;
        this.localDBManagementService = localDBManagementService;
        this.networkService = networkService;
    }
    NamedQueryExecutionOfflineBehaviour.prototype.add = function () {
        var _this = this;
        if (isOfflineBehaviourAdded$1) {
            return;
        }
        isOfflineBehaviourAdded$1 = true;
        var orig = this.httpService.sendCallAsObservable;
        this.httpService.sendCallAsObservable = function (reqParams, params) {
            if (!params && _.get(reqParams, 'url')) {
                params = { url: reqParams.url };
            }
            if (!_this.networkService.isConnected() && params.url.indexOf('/queryExecutor/') > 0) {
                return from(_this.executeLocally(params));
            }
            else {
                return orig.call(_this.httpService, reqParams, params);
            }
        };
    };
    NamedQueryExecutionOfflineBehaviour.prototype.executeLocally = function (params) {
        var _this = this;
        var url = params.url, hasUrlParams = url.indexOf('?') > 0, dbName = this.substring(url, 'services/', '/queryExecutor'), queryName = this.substring(url, 'queries/', hasUrlParams ? '?' : undefined), urlParams = hasUrlParams ? this.getHttpParamMap(this.substring(url, '?', undefined)) : {}, dataParams = this.getHttpParamMap(params.dataParams), queryParams = _.extend(urlParams, dataParams);
        return this.localDBManagementService.executeNamedQuery(dbName, queryName, queryParams)
            .then(function (result) {
            var rows = result.rows;
            if (result.rowsAffected) {
                return _this.changeLogService.add('WebService', 'invokeJavaService', params)
                    .then(function () { return result.rowsAffected; });
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
    };
    NamedQueryExecutionOfflineBehaviour.prototype.substring = function (source, start, end) {
        if (start) {
            var startIndex = source.indexOf(start) + start.length, endIndex = end ? source.indexOf(end) : undefined;
            return source.substring(startIndex, endIndex);
        }
        return undefined;
    };
    NamedQueryExecutionOfflineBehaviour.prototype.getHttpParamMap = function (str) {
        var result = {};
        if (str) {
            str = decodeURIComponent(str);
            str.split('&').forEach(function (c) {
                var csplits = c.split('=');
                if (_.isEmpty(_.trim(csplits[1])) || !NUMBER_REGEX.test(csplits[1])) {
                    result[csplits[0]] = csplits[1];
                }
                else {
                    result[csplits[0]] = parseInt(csplits[1], 10);
                }
            });
        }
        return result;
    };
    return NamedQueryExecutionOfflineBehaviour;
}());

var SECURITY_FILE = 'logged-in-user.info';
var isOfflineBehaviourAdded$2 = false;
var SecurityOfflineBehaviour = /** @class */ (function () {
    function SecurityOfflineBehaviour(app, file, deviceService, networkService, securityService) {
        var _this = this;
        this.app = app;
        this.file = file;
        this.deviceService = deviceService;
        this.networkService = networkService;
        this.securityService = securityService;
        this.saveSecurityConfigLocally = _.debounce(function (config) {
            _this._saveSecurityConfigLocally(config);
        }, 1000);
    }
    SecurityOfflineBehaviour.prototype.add = function () {
        var _this = this;
        if (isOfflineBehaviourAdded$2) {
            return;
        }
        isOfflineBehaviourAdded$2 = true;
        var origLoad = this.securityService.load;
        var origAppLogout = this.securityService.appLogout;
        /**
         * Add offline behaviour to SecurityService.getConfig. When offline, this funcation returns security
         * config of last logged-in user will be returned, provided the user did not logout last time.
         *
         * @param successCallback
         * @param failureCallback
         */
        this.securityService.load = function () {
            return new Promise(function (resolve, reject) {
                if (_this.networkService.isConnected()) {
                    origLoad.call(_this.securityService).then(function (config) {
                        _this.securityConfig = config;
                        _this.saveSecurityConfigLocally(config);
                        resolve(_this.securityConfig);
                    }, reject);
                }
                else {
                    _this.readLocalSecurityConfig().then(function (config) {
                        if (config === void 0) { config = {}; }
                        _this.securityConfig = config;
                        _this.securityService.config = config;
                        return config;
                    }, function () { return origLoad.call(_this.securityConfig); }).then(resolve, reject);
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
        this.securityService.appLogout = function (successCallback, failureCallback) {
            _this.securityConfig = {
                authenticated: false,
                loggedOut: true,
                securityEnabled: _this.securityConfig && _this.securityConfig.securityEnabled,
                loggedOutOffline: !_this.networkService.isConnected(),
                loginConfig: _this.securityConfig && _this.securityConfig.loginConfig,
                userInfo: null
            };
            _this._saveSecurityConfigLocally(_this.securityConfig).catch(noop).then(function () {
                if (_this.networkService.isConnected()) {
                    origAppLogout.call(_this.securityService, successCallback, failureCallback);
                }
                else {
                    location.assign(window.location.origin + window.location.pathname);
                }
            });
        };
        /**
         * @param successCallback
         */
        this.securityService.isAuthenticated = function (successCallback) {
            triggerFn(successCallback, _this.securityConfig.authenticated === true);
        };
        this.deviceService.whenReady().then(function () { return _this.clearLastLoggedInUser(); });
        /**
         * If the user has chosen to logout while app is offline, then invalidation of cookies happens when
         * app comes online next time.
         */
        this.app.subscribe('onNetworkStateChange', function (data) {
            if (data.isConnected) {
                _this.clearLastLoggedInUser();
            }
        });
    };
    SecurityOfflineBehaviour.prototype._saveSecurityConfigLocally = function (config) {
        return this.file.writeFile(cordova.file.dataDirectory, SECURITY_FILE, JSON.stringify(config), { replace: true });
    };
    SecurityOfflineBehaviour.prototype.clearLastLoggedInUser = function () {
        var _this = this;
        return this.readLocalSecurityConfig().then(function (config) {
            if (config && config.loggedOutOffline) {
                _this.securityService.appLogout(null, null);
            }
            else if (!_this.networkService.isConnected()) {
                _this.securityConfig = config || {};
            }
        });
    };
    SecurityOfflineBehaviour.prototype.readLocalSecurityConfig = function () {
        var _this = this;
        // reading the security info from file in dataDirectory but when this file is not available then fetching the config from the app directory
        return new Promise(function (resolve, reject) {
            var rootDir = cordova.file.dataDirectory;
            _this.file.checkFile(rootDir, SECURITY_FILE).then(function () {
                return _this.readFileAsTxt(rootDir, SECURITY_FILE).then(resolve, reject);
            }, function () {
                var folderPath = cordova.file.applicationDirectory + 'www/metadata/app', fileName = 'security-config.json';
                return _this.readFileAsTxt(folderPath, fileName).then(resolve, reject);
            });
        });
    };
    SecurityOfflineBehaviour.prototype.readFileAsTxt = function (folderPath, fileName) {
        return this.file.readAsText(folderPath, fileName).then(JSON.parse).catch(noop);
    };
    return SecurityOfflineBehaviour;
}());

var OfflineModule = /** @class */ (function () {
    function OfflineModule(app, changeLogService, deviceService, deviceFileService, deviceFileUploadService, file, httpService, localDBManagementService, localDbService, networkService, securityService) {
        if (hasCordova()) {
            OfflineModule.initialize(app, changeLogService, deviceService, deviceFileService, deviceFileUploadService, file, httpService, localDBManagementService, localDbService, networkService, securityService);
        }
    }
    // Startup services have to be added only once in the app life-cycle.
    OfflineModule.initialize = function (app, changeLogService, deviceService, deviceFileService, deviceFileUploadService, file, httpService, localDBManagementService, localDbService, networkService, securityService) {
        if (this.initialized) {
            return;
        }
        deviceService.addStartUpService({
            serviceName: 'OfflineStartupService',
            start: function () {
                if (window['SQLitePlugin']) {
                    localDBManagementService.setLogSQl((sessionStorage.getItem('wm.logSql') === 'true') || (sessionStorage.getItem('debugMode') === 'true'));
                    window.logSql = function (flag) {
                        if (flag === void 0) { flag = true; }
                        localDBManagementService.setLogSQl(flag);
                        sessionStorage.setItem('wm.logSql', flag ? 'true' : 'false');
                    };
                    window.executeLocalSql = function (dbName, query, params) {
                        localDBManagementService.executeSQLQuery(dbName, query, params, true);
                    };
                    return localDBManagementService.loadDatabases().then(function () {
                        changeLogService.addWorker(new IdResolver(localDBManagementService));
                        changeLogService.addWorker(new ErrorBlocker(localDBManagementService));
                        changeLogService.addWorker(new FileHandler());
                        changeLogService.addWorker(new MultiPartParamTransformer(deviceFileService, localDBManagementService));
                        new LiveVariableOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService, localDbService).add();
                        new FileUploadOfflineBehaviour(changeLogService, deviceFileService, deviceFileUploadService, file, networkService, deviceFileService.getUploadDirectory()).add();
                        new NamedQueryExecutionOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService).add();
                        localDBManagementService.registerCallback(new UploadedFilesImportAndExportService(changeLogService, deviceFileService, localDBManagementService, file));
                        changeLogService.addWorker({
                            onAddCall: function () {
                                if (!networkService.isConnected()) {
                                    networkService.disableAutoConnect();
                                }
                            },
                            postFlush: function (stats) {
                                if (stats.totalTaskCount > 0) {
                                    localDBManagementService.close()
                                        .catch(noop)
                                        .then(function () {
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
    };
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
    OfflineModule.ctorParameters = function () { return [
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
    ]; };
    return OfflineModule;
}());

var PushServiceImpl = /** @class */ (function () {
    function PushServiceImpl(deviceFileUploadService) {
        this.deviceFileUploadService = deviceFileUploadService;
    }
    // Returns a promise from the observable.
    PushServiceImpl.prototype.getPromiseFromObs = function (cb) {
        return new Promise(function (resolve, reject) {
            cb.subscribe(function (response) {
                if (response && response.type) {
                    resolve(response);
                }
            }, reject);
        });
    };
    PushServiceImpl.prototype.push = function (change) {
        var params = change.params;
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
        return Promise.reject(change.service + " service with operation " + change.operation + " is not supported for push.");
    };
    PushServiceImpl.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    PushServiceImpl.ctorParameters = function () { return [
        { type: DeviceFileUploadService }
    ]; };
    return PushServiceImpl;
}());

var LAST_PULL_INFO_KEY = 'localDBManager.lastPullInfo';
var ɵ0$1 = function () {
    var promises = {};
    return {
        start: function (promise) {
            promise.$$pullProcessId = 'PULL_' + _.now();
        },
        add: function (pullPromise, promise) {
            var pullProcessId = pullPromise.$$pullProcessId;
            if (!promises[pullProcessId]) {
                promises[pullProcessId] = [];
            }
            promises[pullProcessId].push(promise);
        },
        remove: function (pullPromise, promise) {
            var pullProcessId = pullPromise.$$pullProcessId;
            _.remove(promises[pullProcessId], promise);
            if (_.isEmpty(promises[pullProcessId])) {
                delete promises[pullProcessId];
            }
        },
        abort: function (pullPromise) {
            var pullProcessId = pullPromise.$$pullProcessId;
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
var pullProcessManager = (ɵ0$1)();
/**
 * LocalDBDataPullService has API to pull data from remote Server to local Database.
 */
var LocalDBDataPullService = /** @class */ (function () {
    function LocalDBDataPullService(app, localDBManagementService, localKeyValueService, networkService) {
        var _this = this;
        this.app = app;
        this.localDBManagementService = localDBManagementService;
        this.localKeyValueService = localKeyValueService;
        this.networkService = networkService;
        // Listen for db creation. When db is created, then initialize last pull info.
        this.localDBManagementService.registerCallback({
            onDbCreate: function (info) {
                _this.localKeyValueService.put(LAST_PULL_INFO_KEY, {
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
    LocalDBDataPullService.prototype.addDeltaCriteria = function (db, entityName, query) {
        var _this = this;
        var entitySchema = db.schema.entities[entityName], deltaFieldName = entitySchema.pullConfig.deltaFieldName, deltaField = _.find(entitySchema.columns, { 'fieldName': deltaFieldName }) || {};
        var isBundledEntity;
        if (!_.isEmpty(deltaFieldName)) {
            return this.localDBManagementService.isBundled(db.schema.name, entityName)
                .then(function (flag) { return isBundledEntity = flag; })
                .then(function () { return _this.getLastPullInfo(); })
                .then(function (lastPullInfo) {
                var lastPullTime = (lastPullInfo && lastPullInfo.startTime && lastPullInfo.startTime.getTime());
                var lastPullDBInfo = _.find(lastPullInfo && lastPullInfo.databases, { 'name': db.schema.name }), lastPullEntityInfo = _.find(lastPullDBInfo && lastPullDBInfo.entities, { 'entityName': entityName }) || {};
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
            }, function () { return Promise.resolve(query); });
        }
        return Promise.resolve(query);
    };
    /**
     * copies the data from remote db to local db
     * @param {DBInfo} db
     * @param {string} entityName
     * @param {boolean} clearDataBeforePull
     * @param pullPromise
     * @param {Observer<any>} progressObserver
     * @returns {Promise<any>}
     */
    LocalDBDataPullService.prototype.copyDataFromRemoteDBToLocalDB = function (db, entityName, clearDataBeforePull, pullPromise, progressObserver) {
        var _this = this;
        var store = db.stores[entityName], entitySchema = db.schema.entities[entityName], result = {
            entityName: entityName,
            totalRecordsToPull: 0,
            pulledRecordCount: 0
        };
        var inProgress = 0, pullComplete = false, filter;
        return new Promise(function (resolve, reject) {
            _this.prepareQuery(db, entityName)
                .then(function (query) {
                result.query = query;
                return _this.addDeltaCriteria(db, entityName, query);
            }).then(function (query) {
                // Clear if clearDataBeforePull is true and delta query is not used
                if (clearDataBeforePull && result.query === query) {
                    return store.clear()
                        .then(function () {
                        return query;
                    });
                }
                return query;
            }).then(function (query) {
                filter = _.isEmpty(query) ? '' : 'q=' + query;
                return _this.getTotalRecordsToPull(db, entitySchema, filter, pullPromise);
            }).then(function (maxNoOfRecords) {
                var pageSize = entitySchema.pullConfig.size || 100, maxNoOfPages = Math.ceil(maxNoOfRecords / pageSize);
                result.totalRecordsToPull = maxNoOfRecords;
                var sort = entitySchema.pullConfig.orderBy;
                sort = (_.isEmpty(sort) ? '' : sort + ',') + store.primaryKeyName;
                progressObserver.next(result);
                var _progressObserver = { next: function (data) {
                        inProgress++;
                        data = _.slice(data, 0, result.totalRecordsToPull - result.pulledRecordCount);
                        store.saveAll(data).then(function () {
                            result.pulledRecordCount += data ? data.length : 0;
                            progressObserver.next(result);
                        }).catch(noop)
                            .then(function () {
                            inProgress--;
                            if (inProgress === 0 && pullComplete) {
                                resolve(result);
                            }
                        });
                    }, error: null, complete: null
                };
                return _this._pullEntityData(db, entityName, filter, sort, maxNoOfPages, pageSize, 1, pullPromise, undefined, _progressObserver);
            }).then(null, reject)
                .catch(noop)
                .then(function () {
                pullComplete = true;
                if (inProgress === 0) {
                    resolve(result);
                }
            });
        });
    };
    // If expression starts with 'bind:', then expression is evaluated and result is returned.
    LocalDBDataPullService.prototype.evalIfBind = function (expression) {
        if (_.startsWith(expression, 'bind:')) {
            expression = expression.replace(/\[\$\i\]/g, '[0]');
            return $parseExpr(expression.replace('bind:', ''))(this.app);
        }
        return expression;
    };
    /**
     * Executes DatabaseService.countTableDataWithQuery as a promise API.
     * @param params
     * @returns Promise
     */
    LocalDBDataPullService.prototype.executeDatabaseCountQuery = function (params) {
        return new Promise(function (resolve, reject) {
            LVService.countTableDataWithQuery(params, null, null).subscribe(function (response) { return resolve(response.body); }, reject);
        });
    };
    /**
     * Executes DatabaseService.searchTableDataWithQuery as a promise API.
     * @param params
     * @returns Promise
     */
    LocalDBDataPullService.prototype.executeDatabaseSearchQuery = function (params) {
        return new Promise(function (resolve, reject) {
            return LVService.searchTableDataWithQuery(params, null, null).subscribe(function (response) { return resolve(response && response.body && response.body.content); }, reject);
        });
    };
    /**
     * Computes the maximum number of records to pull.
     *
     * @param db
     * @param entitySchema
     * @param filter
     * @param pullPromise
     * @returns {*}
     */
    LocalDBDataPullService.prototype.getTotalRecordsToPull = function (db, entitySchema, filter, pullPromise) {
        var _this = this;
        var params = {
            dataModelName: db.schema.name,
            entityName: entitySchema.entityName,
            data: filter
        };
        return this.retryIfNetworkFails(function () {
            return _this.executeDatabaseCountQuery(params).then(function (response) {
                var totalRecordCount = response, maxRecordsToPull = _.parseInt(entitySchema.pullConfig.maxNumberOfRecords);
                if (_.isNaN(maxRecordsToPull) || maxRecordsToPull <= 0 || totalRecordCount < maxRecordsToPull) {
                    return totalRecordCount;
                }
                return maxRecordsToPull;
            });
        }, pullPromise);
    };
    LocalDBDataPullService.prototype.prepareQuery = function (db, entityName) {
        var _this = this;
        var query;
        var entitySchema = db.schema.entities[entityName];
        return this.localDBManagementService.isBundled(db.schema.name, entityName)
            .then(function (isBundledEntity) {
            var hasNullAttributeValue = false;
            if (isBundledEntity || _.isEmpty(entitySchema.pullConfig.query)) {
                query = _.cloneDeep(entitySchema.pullConfig.filter);
                query = _.map(query, function (v) {
                    v.attributeValue = _this.evalIfBind(v.attributeValue);
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
                query = _this.evalIfBind(entitySchema.pullConfig.query);
            }
            if (_.isNil(query)) {
                return Promise.resolve(null);
            }
            return Promise.resolve(encodeURIComponent(query));
        });
    };
    /**
     *
     * @param db
     * @param clearDataBeforePull
     * @param pullPromise
     * @param progressObserver
     * @returns {*}
     */
    LocalDBDataPullService.prototype._pullDbData = function (db, clearDataBeforePull, pullPromise, progressObserver) {
        var _this = this;
        var datamodelName = db.schema.name, result = {
            name: db.schema.name,
            entities: [],
            totalRecordsToPull: 0,
            pulledRecordCount: 0,
            completedTaskCount: 0,
            totalTaskCount: 0
        };
        var storePromises = [];
        _.forEach(db.schema.entities, function (entity) {
            storePromises.push(_this.localDBManagementService.getStore(datamodelName, entity.entityName));
        });
        return new Promise(function (resolve, reject) {
            Promise.all(storePromises)
                .then(function (stores) {
                var entities = [];
                stores.forEach(function (store) {
                    var pullConfig = store.entitySchema.pullConfig;
                    var pullType = pullConfig.pullType;
                    if (pullType === PullType.APP_START || (pullType === PullType.BUNDLED && pullConfig.deltaFieldName)) {
                        entities.push(store.entitySchema);
                    }
                });
                var pullPromises = _.chain(entities)
                    .map(function (entity) {
                    var _progressObserver = {
                        next: function (info) {
                            var i = _.findIndex(result.entities, { 'entityName': info.entityName });
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
                    return _this.copyDataFromRemoteDBToLocalDB(db, entity.entityName, clearDataBeforePull, pullPromise, _progressObserver)
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
    };
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
    LocalDBDataPullService.prototype._pullEntityData = function (db, entityName, filter, sort, maxNoOfPages, pageSize, currentPage, pullPromise, deferred, progressObserver) {
        var _this = this;
        var dataModelName = db.schema.name;
        if (!deferred) {
            deferred = defer();
        }
        if (currentPage > maxNoOfPages) {
            return deferred.resolve();
        }
        var params = {
            dataModelName: dataModelName,
            entityName: entityName,
            page: currentPage,
            size: pageSize,
            data: filter,
            sort: sort,
            onlyOnline: true,
            skipLocalDB: true
        };
        this.retryIfNetworkFails(function () {
            return _this.executeDatabaseSearchQuery(params);
        }, pullPromise).then(function (response) {
            progressObserver.next(response);
            _this._pullEntityData(db, entityName, filter, sort, maxNoOfPages, pageSize, currentPage + 1, pullPromise, deferred, progressObserver);
        }, deferred.reject);
        return deferred.promise;
    };
    /**
     * If fn fails and network is not there
     * @param fn
     * @param pullPromise
     * @returns {*}
     */
    LocalDBDataPullService.prototype.retryIfNetworkFails = function (fn, pullPromise) {
        if (pullPromise.$$isMarkedToAbort) {
            return Promise.reject('aborted');
        }
        var promise = this.networkService.retryIfNetworkFails(fn);
        pullProcessManager.add(pullPromise, promise);
        promise.catch(noop)
            .then(function () {
            pullProcessManager.remove(pullPromise, promise);
        });
        return promise;
    };
    /**
     * Tries to cancel the corresponding pull process that gave the given promise.
     * @param promise
     * @returns {any}
     */
    LocalDBDataPullService.prototype.cancel = function (promise) {
        return pullProcessManager.abort(promise);
    };
    /**
     * fetches the database from the dbName.
     * @param dbName
     * @returns {Promise<any>}
     */
    LocalDBDataPullService.prototype.getDb = function (dbName) {
        return this.localDBManagementService.loadDatabases()
            .then(function (databases) {
            var db = _.find(databases, { 'name': dbName });
            return db || Promise.reject('Local database (' + dbName + ') not found');
        });
    };
    /**
     * @returns {any} that has total no of records fetched, start and end timestamps of last successful pull
     * of data from remote server.
     */
    LocalDBDataPullService.prototype.getLastPullInfo = function () {
        return this.localKeyValueService.get(LAST_PULL_INFO_KEY).then(function (info) {
            if (_.isString(info.startTime)) {
                info.startTime = new Date(info.startTime);
            }
            if (_.isString(info.endTime)) {
                info.endTime = new Date(info.endTime);
            }
            return info;
        });
    };
    /**
     * Clears (based on parameter) and pulls data ('BUNDLED' data based on parameter) from server using the
     * configured rules in offline configuration.
     *
     * @param clearDataBeforePull boolean
     * @param {Observer<any>} progressObserver
     * @returns {any}
     */
    LocalDBDataPullService.prototype.pullAllDbData = function (clearDataBeforePull, progressObserver) {
        var _this = this;
        var deferred = getAbortableDefer(), pullInfo = {
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
            .then(function (databases) {
            var dataPullPromises = _.chain(databases).filter(function (db) {
                return !db.schema.isInternal;
            }).map(function (db) {
                pullProcessManager.start(deferred.promise);
                var _progressObserver = { next: function (data) {
                        var i = _.findIndex(pullInfo.databases, { 'name': data.name });
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
                return _this._pullDbData(db, clearDataBeforePull, deferred.promise, _progressObserver);
            }).value();
            return Promise.all(dataPullPromises);
        }).then(function () {
            pullInfo.endTime = new Date();
            pullInfo.inProgress = false;
            _this.localKeyValueService.put(LAST_PULL_INFO_KEY, pullInfo);
            deferred.resolve(pullInfo);
        }, deferred.reject);
        return deferred.promise;
    };
    /**
     * Clears (based on parameter) and pulls data ('BUNDLED' data based on parameter) of the given database from server using
     * the configured rules in offline configuration.
     *
     * @param {string} databaseName
     * @param {boolean} clearDataBeforePull
     * @param {Observer<any>} progressObserver
     * @returns {Promise}
     */
    LocalDBDataPullService.prototype.pullDbData = function (databaseName, clearDataBeforePull, progressObserver) {
        var _this = this;
        var deferred = getAbortableDefer();
        this.getDb(databaseName).then(function (db) {
            return _this._pullDbData(db, clearDataBeforePull, deferred.promise, progressObserver);
        }).then(deferred.resolve, deferred.reject);
        return deferred.promise;
    };
    /**
     * Clears (based on parameter) and pulls data of the given entity and database from
     * server using the configured rules in offline configuration.
     * @param databaseName, name of the database from which data has to be pulled.
     * @param entityName, name of the entity from which data has to be pulled
     * @param clearDataBeforePull, if set to true, then data of the entity will be deleted.
     * @param progressObserver, observer the progress values
     */
    LocalDBDataPullService.prototype.pullEntityData = function (databaseName, entityName, clearDataBeforePull, progressObserver) {
        var _this = this;
        var deferred = getAbortableDefer();
        this.getDb(databaseName)
            .then(function (db) {
            return _this.copyDataFromRemoteDBToLocalDB(db, entityName, clearDataBeforePull, deferred.promise, progressObserver);
        }).then(deferred.resolve, deferred.reject);
        return deferred.promise;
    };
    LocalDBDataPullService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    LocalDBDataPullService.ctorParameters = function () { return [
        { type: App },
        { type: LocalDBManagementService },
        { type: LocalKeyValueService },
        { type: NetworkService }
    ]; };
    LocalDBDataPullService.ngInjectableDef = defineInjectable({ factory: function LocalDBDataPullService_Factory() { return new LocalDBDataPullService(inject(App), inject(LocalDBManagementService), inject(LocalKeyValueService), inject(NetworkService)); }, token: LocalDBDataPullService, providedIn: "root" });
    return LocalDBDataPullService;
}());

/**
 * Generated bundle index. Do not edit.
 */

export { LocalKeyValueService as ɵa, OfflineModule, PushService, CONTEXT_KEY, LAST_PUSH_INFO_KEY, ChangeLogService, PushServiceImpl, LocalDbService, LocalDBDataPullService, ɵ0$1 as ɵ0, LocalDBManagementService };

//# sourceMappingURL=index.js.map