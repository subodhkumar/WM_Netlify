import { convertToBlob, isDefined } from '@wm/core';
import { SWAGGER_CONSTANTS } from '@wm/variables';
import { escapeName } from '../utils/utils';
var insertRecordSqlTemplate = function (schema) {
    var columnNames = [], placeHolder = [];
    _.forEach(schema.columns, function (col) {
        columnNames.push(escapeName(col.name));
        placeHolder.push('?');
    });
    return "INSERT INTO " + escapeName(schema.name) + " (" + columnNames.join(',') + ") VALUES (" + placeHolder.join(',') + ")";
};
var ɵ0 = insertRecordSqlTemplate;
var replaceRecordSqlTemplate = function (schema) {
    var columnNames = [], placeHolder = [];
    _.forEach(schema.columns, function (col) {
        columnNames.push(escapeName(col.name));
        placeHolder.push('?');
    });
    return "REPLACE INTO " + escapeName(schema.name) + " (" + columnNames.join(',') + ") VALUES (" + placeHolder.join(',') + ")";
};
var ɵ1 = replaceRecordSqlTemplate;
var deleteRecordTemplate = function (schema) {
    var primaryKeyField = _.find(schema.columns, 'primaryKey');
    if (primaryKeyField) {
        return "DELETE FROM " + escapeName(schema.name) + " WHERE " + escapeName(primaryKeyField.name) + " = ?";
    }
    return '';
};
var ɵ2 = deleteRecordTemplate;
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
var ɵ3 = selectSqlTemplate;
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
var ɵ4 = countQueryTemplate;
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
var ɵ5 = generateWherClause;
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
var ɵ6 = generateOrderByClause;
var geneateLimitClause = function (page) {
    page = page || {};
    return ' LIMIT ' + (page.limit || 100) + ' OFFSET ' + (page.offset || 0);
};
var ɵ7 = geneateLimitClause;
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
var ɵ8 = mapRowDataToObj;
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
var ɵ9 = getValue;
var mapObjToRow = function (store, entity) {
    var row = {};
    store.entitySchema.columns.forEach(function (col) { return row[col.name] = getValue(entity, col); });
    return row;
};
var ɵ10 = mapObjToRow;
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
export { LocalDBStore };
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5, ɵ6, ɵ7, ɵ8, ɵ9, ɵ10 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwtZGItc3RvcmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL29mZmxpbmUvIiwic291cmNlcyI6WyJtb2RlbHMvbG9jYWwtZGItc3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFcEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQWlCNUMsSUFBTSx1QkFBdUIsR0FBRyxVQUFDLE1BQWtCO0lBQy9DLElBQU0sV0FBVyxHQUFHLEVBQUUsRUFDbEIsV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUNyQixDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBQSxHQUFHO1FBQ3pCLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLGlCQUFlLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUssV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWEsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBRyxDQUFDO0FBQ2pILENBQUMsQ0FBQzs7QUFFRixJQUFNLHdCQUF3QixHQUFHLFVBQUMsTUFBa0I7SUFDaEQsSUFBTSxXQUFXLEdBQUcsRUFBRSxFQUNsQixXQUFXLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFBLEdBQUc7UUFDekIsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7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Q0FBQztJQUN0RCxDQUFDO0lBRU8scUNBQWMsR0FBdEIsVUFBdUIsTUFBTTtRQUN6QixJQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBQyxNQUFNLEVBQUUsQ0FBQztZQUNoRCxJQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRTtnQkFDZCxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxhQUFhLEtBQUssa0JBQWtCLEVBQUU7b0JBQ2xFLEdBQUcsSUFBSSxvQ0FBb0MsQ0FBQztpQkFDL0M7cUJBQU07b0JBQ0gsR0FBRyxJQUFJLGNBQWMsQ0FBQztpQkFDekI7YUFDSjtZQUNELE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzdDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNWLE9BQU8sZ0NBQThCLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUssUUFBUSxNQUFHLENBQUM7SUFDakYsQ0FBQztJQUNMLG1CQUFDO0FBQUQsQ0FBQyxBQTNSRCxJQTJSQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZpbGUgfSBmcm9tICdAaW9uaWMtbmF0aXZlL2ZpbGUnO1xuaW1wb3J0IHsgU1FMaXRlT2JqZWN0IH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9zcWxpdGUnO1xuXG5pbXBvcnQgeyBjb252ZXJ0VG9CbG9iLCBpc0RlZmluZWQgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBEZXZpY2VGaWxlU2VydmljZSB9IGZyb20gJ0B3bS9tb2JpbGUvY29yZSc7XG5pbXBvcnQgeyBTV0FHR0VSX0NPTlNUQU5UUyB9IGZyb20gJ0B3bS92YXJpYWJsZXMnO1xuXG5pbXBvcnQgeyBDb2x1bW5JbmZvLCBFbnRpdHlJbmZvIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgZXNjYXBlTmFtZSB9IGZyb20gJy4uL3V0aWxzL3V0aWxzJztcbmltcG9ydCB7IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL2xvY2FsLWRiLW1hbmFnZW1lbnQuc2VydmljZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuZXhwb3J0IGludGVyZmFjZSBGaWx0ZXJDcml0ZXJpb24ge1xuICAgIGF0dHJpYnV0ZU5hbWU6IHN0cmluZztcbiAgICBhdHRyaWJ1dGVWYWx1ZTogYW55O1xuICAgIGF0dHJpYnV0ZVR5cGU6IHN0cmluZztcbiAgICBmaWx0ZXJDb25kaXRpb246IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYWdpbmF0aW9uIHtcbiAgICBvZmZzZXQ6IG51bWJlcjtcbiAgICBsaW1pdDogbnVtYmVyO1xufVxuXG5jb25zdCBpbnNlcnRSZWNvcmRTcWxUZW1wbGF0ZSA9IChzY2hlbWE6IEVudGl0eUluZm8pID0+IHtcbiAgICBjb25zdCBjb2x1bW5OYW1lcyA9IFtdLFxuICAgICAgICBwbGFjZUhvbGRlciA9IFtdO1xuICAgIF8uZm9yRWFjaChzY2hlbWEuY29sdW1ucywgY29sID0+IHtcbiAgICAgICAgY29sdW1uTmFtZXMucHVzaChlc2NhcGVOYW1lKGNvbC5uYW1lKSk7XG4gICAgICAgIHBsYWNlSG9sZGVyLnB1c2goJz8nKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYElOU0VSVCBJTlRPICR7ZXNjYXBlTmFtZShzY2hlbWEubmFtZSl9ICgke2NvbHVtbk5hbWVzLmpvaW4oJywnKX0pIFZBTFVFUyAoJHtwbGFjZUhvbGRlci5qb2luKCcsJyl9KWA7XG59O1xuXG5jb25zdCByZXBsYWNlUmVjb3JkU3FsVGVtcGxhdGUgPSAoc2NoZW1hOiBFbnRpdHlJbmZvKSA9PiB7XG4gICAgY29uc3QgY29sdW1uTmFtZXMgPSBbXSxcbiAgICAgICAgcGxhY2VIb2xkZXIgPSBbXTtcbiAgICBfLmZvckVhY2goc2NoZW1hLmNvbHVtbnMsIGNvbCA9PiB7XG4gICAgICAgIGNvbHVtbk5hbWVzLnB1c2goZXNjYXBlTmFtZShjb2wubmFtZSkpO1xuICAgICAgICBwbGFjZUhvbGRlci5wdXNoKCc/Jyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGBSRVBMQUNFIElOVE8gJHtlc2NhcGVOYW1lKHNjaGVtYS5uYW1lKX0gKCR7Y29sdW1uTmFtZXMuam9pbignLCcpfSkgVkFMVUVTICgke3BsYWNlSG9sZGVyLmpvaW4oJywnKX0pYDtcbn07XG5cbmNvbnN0IGRlbGV0ZVJlY29yZFRlbXBsYXRlID0gKHNjaGVtYTogRW50aXR5SW5mbykgPT4ge1xuICAgIGNvbnN0IHByaW1hcnlLZXlGaWVsZCA9IF8uZmluZChzY2hlbWEuY29sdW1ucywgJ3ByaW1hcnlLZXknKTtcbiAgICBpZiAocHJpbWFyeUtleUZpZWxkKSB7XG4gICAgICAgIHJldHVybiBgREVMRVRFIEZST00gJHtlc2NhcGVOYW1lKHNjaGVtYS5uYW1lKX0gV0hFUkUgJHtlc2NhcGVOYW1lKHByaW1hcnlLZXlGaWVsZC5uYW1lKX0gPSA/YDtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xufTtcblxuY29uc3Qgc2VsZWN0U3FsVGVtcGxhdGUgPSAoc2NoZW1hOiBFbnRpdHlJbmZvKSA9PiB7XG4gICAgY29uc3QgY29sdW1ucyA9IFtdLFxuICAgICAgICBqb2lucyA9IFtdO1xuICAgIHNjaGVtYS5jb2x1bW5zLmZvckVhY2goIGNvbCA9PiB7XG4gICAgICAgIGxldCBjaGlsZFRhYmxlTmFtZTtcbiAgICAgICAgY29sdW1ucy5wdXNoKGVzY2FwZU5hbWUoc2NoZW1hLm5hbWUpICsgJy4nICsgZXNjYXBlTmFtZShjb2wubmFtZSkgKyAnIGFzICcgKyBjb2wuZmllbGROYW1lKTtcbiAgICAgICAgaWYgKGNvbC5mb3JlaWduUmVsYXRpb25zKSB7XG4gICAgICAgICAgICBjb2wuZm9yZWlnblJlbGF0aW9ucy5mb3JFYWNoKGZvcmVpZ25SZWxhdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgY2hpbGRUYWJsZU5hbWUgPSBmb3JlaWduUmVsYXRpb24uc291cmNlRmllbGROYW1lO1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChmb3JlaWduUmVsYXRpb24uZGF0YU1hcHBlciwgKGNoaWxkQ29sLCBjaGlsZEZpbGVkTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zLnB1c2goY2hpbGRUYWJsZU5hbWUgKyAnLicgKyBlc2NhcGVOYW1lKGNoaWxkQ29sLm5hbWUpICsgJyBhcyBcXCcnICsgY2hpbGRGaWxlZE5hbWUgKyAnXFwnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgam9pbnMucHVzaChgIExFRlQgSk9JTiAke2VzY2FwZU5hbWUoZm9yZWlnblJlbGF0aW9uLnRhcmdldFRhYmxlKX0gJHtjaGlsZFRhYmxlTmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICBPTiAke2NoaWxkVGFibGVOYW1lfS4ke2VzY2FwZU5hbWUoZm9yZWlnblJlbGF0aW9uLnRhcmdldENvbHVtbil9ID0gJHtlc2NhcGVOYW1lKHNjaGVtYS5uYW1lKX0uJHtlc2NhcGVOYW1lKGNvbC5uYW1lKX1gKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGBTRUxFQ1QgJHtjb2x1bW5zLmpvaW4oJywnKX0gRlJPTSAke2VzY2FwZU5hbWUoc2NoZW1hLm5hbWUpfSAke2pvaW5zLmpvaW4oJyAnKX1gO1xufTtcblxuY29uc3QgY291bnRRdWVyeVRlbXBsYXRlID0gKHNjaGVtYTogRW50aXR5SW5mbykgPT4ge1xuICAgIGNvbnN0IGpvaW5zID0gW107XG4gICAgc2NoZW1hLmNvbHVtbnMuZm9yRWFjaCggY29sID0+IHtcbiAgICAgICAgbGV0IGNoaWxkVGFibGVOYW1lO1xuICAgICAgICBpZiAoY29sLmZvcmVpZ25SZWxhdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbC5mb3JlaWduUmVsYXRpb25zLmZvckVhY2goZm9yZWlnblJlbGF0aW9uID0+IHtcbiAgICAgICAgICAgICAgICBjaGlsZFRhYmxlTmFtZSA9IGZvcmVpZ25SZWxhdGlvbi5zb3VyY2VGaWVsZE5hbWU7XG4gICAgICAgICAgICAgICAgam9pbnMucHVzaChgIExFRlQgSk9JTiAke2VzY2FwZU5hbWUoZm9yZWlnblJlbGF0aW9uLnRhcmdldFRhYmxlKX0gJHtjaGlsZFRhYmxlTmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICBPTiAke2NoaWxkVGFibGVOYW1lfS4ke2VzY2FwZU5hbWUoZm9yZWlnblJlbGF0aW9uLnRhcmdldENvbHVtbil9ID0gJHtlc2NhcGVOYW1lKHNjaGVtYS5uYW1lKX0uJHtlc2NhcGVOYW1lKGNvbC5uYW1lKX1gKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGBTRUxFQ1QgY291bnQoKikgYXMgY291bnQgRlJPTSAke2VzY2FwZU5hbWUoc2NoZW1hLm5hbWUpfSAke2pvaW5zLmpvaW4oJyAnKX1gO1xufTtcblxuY29uc3QgZ2VuZXJhdGVXaGVyQ2xhdXNlID0gKHN0b3JlOiBMb2NhbERCU3RvcmUsIGZpbHRlckNyaXRlcmlhOiBGaWx0ZXJDcml0ZXJpb25bXSkgPT4ge1xuICAgIGxldCBjb25kaXRpb25zO1xuICAgIGNvbnN0IGZpZWxkVG9Db2x1bW5NYXBwaW5nID0gc3RvcmUuZmllbGRUb0NvbHVtbk1hcHBpbmcsXG4gICAgICAgIHRhYmxlTmFtZSA9IHN0b3JlLmVudGl0eVNjaGVtYS5uYW1lO1xuICAgIGlmICghXy5pc0VtcHR5KGZpbHRlckNyaXRlcmlhKSAmJiBfLmlzU3RyaW5nKGZpbHRlckNyaXRlcmlhKSkge1xuICAgICAgICByZXR1cm4gJyBXSEVSRSAnICsgZmlsdGVyQ3JpdGVyaWE7XG4gICAgfVxuICAgIGlmIChmaWx0ZXJDcml0ZXJpYSkge1xuICAgICAgICBjb25kaXRpb25zID0gZmlsdGVyQ3JpdGVyaWEubWFwKGZpbHRlckNyaXRlcmlvbiA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb2xOYW1lID0gZmllbGRUb0NvbHVtbk1hcHBpbmdbZmlsdGVyQ3JpdGVyaW9uLmF0dHJpYnV0ZU5hbWVdLFxuICAgICAgICAgICAgICAgIGNvbmRpdGlvbiA9IGZpbHRlckNyaXRlcmlvbi5maWx0ZXJDb25kaXRpb247XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZmlsdGVyQ3JpdGVyaW9uLmF0dHJpYnV0ZVZhbHVlLFxuICAgICAgICAgICAgICAgIG9wZXJhdG9yID0gJz0nO1xuICAgICAgICAgICAgaWYgKGZpbHRlckNyaXRlcmlvbi5hdHRyaWJ1dGVUeXBlID09PSAnU1RSSU5HJykge1xuICAgICAgICAgICAgICAgIGlmIChjb25kaXRpb24gPT09ICdTVEFSVElOR19XSVRIJykge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQgKyAnJSc7XG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdG9yID0gJ2xpa2UnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29uZGl0aW9uID09PSAnRU5ESU5HX1dJVEgnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9ICclJyArIHRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0b3IgPSAnbGlrZSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb25kaXRpb24gPT09ICdDT05UQUlOSU5HJykge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSAnJScgKyB0YXJnZXQgKyAnJSc7XG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdG9yID0gJ2xpa2UnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBgJyR7dGFyZ2V0fSdgO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmaWx0ZXJDcml0ZXJpb24uYXR0cmlidXRlVHlwZSA9PT0gJ0JPT0xFQU4nKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gKHRhcmdldCA9PT0gdHJ1ZSA/IDEgOiAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBgJHtlc2NhcGVOYW1lKHRhYmxlTmFtZSl9LiR7ZXNjYXBlTmFtZShjb2xOYW1lKX0gJHtvcGVyYXRvcn0gJHt0YXJnZXR9YDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBjb25kaXRpb25zICYmIGNvbmRpdGlvbnMubGVuZ3RoID4gMCA/ICcgV0hFUkUgJyArIGNvbmRpdGlvbnMuam9pbignIEFORCAnKSA6ICcnO1xufTtcblxuY29uc3QgZ2VuZXJhdGVPcmRlckJ5Q2xhdXNlID0gKHN0b3JlOiBMb2NhbERCU3RvcmUsIHNvcnQ6IHN0cmluZykgPT4ge1xuICAgIGlmIChzb3J0KSB7XG4gICAgICAgIHJldHVybiAnIE9SREVSIEJZICcgKyBfLm1hcChzb3J0LnNwbGl0KCcsJyksIGZpZWxkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0cyA9ICBfLnRyaW0oZmllbGQpLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICBzcGxpdHNbMF0gPSBlc2NhcGVOYW1lKHN0b3JlLmVudGl0eVNjaGVtYS5uYW1lKSArICcuJyArIGVzY2FwZU5hbWUoc3RvcmUuZmllbGRUb0NvbHVtbk1hcHBpbmdbc3BsaXRzWzBdXSk7XG4gICAgICAgICAgICByZXR1cm4gc3BsaXRzLmpvaW4oJyAnKTtcbiAgICAgICAgfSkuam9pbignLCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG59O1xuXG5jb25zdCBnZW5lYXRlTGltaXRDbGF1c2UgPSBwYWdlID0+IHtcbiAgICBwYWdlID0gcGFnZSB8fCB7fTtcbiAgICByZXR1cm4gJyBMSU1JVCAnICsgKHBhZ2UubGltaXQgfHwgMTAwKSArICcgT0ZGU0VUICcgKyAocGFnZS5vZmZzZXQgfHwgMCk7XG59O1xuXG5jb25zdCBtYXBSb3dEYXRhVG9PYmogPSAoc2NoZW1hOiBFbnRpdHlJbmZvLCBkYXRhT2JqOiBhbnkpID0+IHtcbiAgICBzY2hlbWEuY29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgIGNvbnN0IHZhbCA9IGRhdGFPYmpbY29sLmZpZWxkTmFtZV07XG4gICAgICAgIGlmIChjb2wuZm9yZWlnblJlbGF0aW9ucykge1xuICAgICAgICAgICAgY29sLmZvcmVpZ25SZWxhdGlvbnMuZm9yRWFjaChmb3JlaWduUmVsYXRpb24gPT4ge1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZEVudGl0eSA9IG51bGw7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGZvcmVpZ25SZWxhdGlvbi5kYXRhTWFwcGVyLCBmdW5jdGlvbiAoY2hpbGRDb2wsIGNoaWxkRmllbGROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpZWxkVmFsdWUgPSBkYXRhT2JqW2NoaWxkRmllbGROYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmaW5lZChmaWVsZFZhbHVlKSAmJiBmaWVsZFZhbHVlICE9PSBudWxsICYmIGZpZWxkVmFsdWUgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZEVudGl0eSA9IGNoaWxkRW50aXR5IHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRFbnRpdHlbY2hpbGRDb2wuZmllbGROYW1lXSA9IGRhdGFPYmpbY2hpbGRGaWVsZE5hbWVdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhT2JqW2NoaWxkRmllbGROYW1lXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBkYXRhT2JqW2ZvcmVpZ25SZWxhdGlvbi5zb3VyY2VGaWVsZE5hbWVdID0gY2hpbGRFbnRpdHk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2wuc3FsVHlwZSA9PT0gJ2Jvb2xlYW4nICYmICFfLmlzTmlsKHZhbCkpIHtcbiAgICAgICAgICAgIGRhdGFPYmpbY29sLmZpZWxkTmFtZV0gPSAodmFsID09PSAxKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkYXRhT2JqO1xufTtcblxuY29uc3QgZ2V0VmFsdWUgPSAoZW50aXR5OiBhbnksIGNvbDogQ29sdW1uSW5mbykgPT4ge1xuICAgIGxldCB2YWx1ZSA9IGVudGl0eVtjb2wuZmllbGROYW1lXTtcbiAgICBpZiAoY29sLmZvcmVpZ25SZWxhdGlvbnMpIHtcbiAgICAgICAgY29sLmZvcmVpZ25SZWxhdGlvbnMuc29tZShmb3JlaWduUmVsYXRpb24gPT4ge1xuICAgICAgICAgICAgaWYgKGZvcmVpZ25SZWxhdGlvbi50YXJnZXRFbnRpdHkgJiYgZW50aXR5W2ZvcmVpZ25SZWxhdGlvbi5zb3VyY2VGaWVsZE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBlbnRpdHlbZm9yZWlnblJlbGF0aW9uLnNvdXJjZUZpZWxkTmFtZV1bZm9yZWlnblJlbGF0aW9uLnRhcmdldEZpZWxkTmFtZV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoXy5pc05pbCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGNvbC5kZWZhdWx0VmFsdWU7XG4gICAgfSBlbHNlIGlmIChjb2wuc3FsVHlwZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHJldHVybiAodmFsdWUgPT09IHRydWUgPyAxIDogMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbn07XG5cbmNvbnN0IG1hcE9ialRvUm93ID0gKHN0b3JlOiBMb2NhbERCU3RvcmUsIGVudGl0eTogYW55KSA9PiB7XG4gICAgY29uc3Qgcm93ID0ge307XG4gICAgc3RvcmUuZW50aXR5U2NoZW1hLmNvbHVtbnMuZm9yRWFjaChjb2wgPT4gcm93W2NvbC5uYW1lXSA9IGdldFZhbHVlKGVudGl0eSwgY29sKSk7XG4gICAgcmV0dXJuIHJvdztcbn07XG5cbmV4cG9ydCBjbGFzcyBMb2NhbERCU3RvcmUge1xuXG4gICAgcHVibGljIHJlYWRvbmx5IHByaW1hcnlLZXlGaWVsZDogQ29sdW1uSW5mbztcbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJpbWFyeUtleU5hbWU6IHN0cmluZztcbiAgICBwdWJsaWMgcmVhZG9ubHkgZmllbGRUb0NvbHVtbk1hcHBpbmc6IG9iamVjdCA9IHt9O1xuXG4gICAgcHJpdmF0ZSBpbnNlcnRSZWNvcmRTcWxUZW1wbGF0ZTogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVwbGFjZVJlY29yZFNxbFRlbXBsYXRlOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBkZWxldGVSZWNvcmRUZW1wbGF0ZTogc3RyaW5nO1xuICAgIHByaXZhdGUgc2VsZWN0U3FsVGVtcGxhdGU6IHN0cmluZztcbiAgICBwcml2YXRlIGNvdW50UXVlcnk6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGRldmljZUZpbGVTZXJ2aWNlOiBEZXZpY2VGaWxlU2VydmljZSxcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IGVudGl0eVNjaGVtYTogRW50aXR5SW5mbyxcbiAgICAgICAgcHJpdmF0ZSBmaWxlOiBGaWxlLFxuICAgICAgICBwcml2YXRlIGxvY2FsRGJNYW5hZ2VtZW50U2VydmljZTogTG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHNxbGl0ZU9iamVjdDogU1FMaXRlT2JqZWN0XG4gICAgKSB7XG4gICAgICAgIHRoaXMucHJpbWFyeUtleUZpZWxkID0gXy5maW5kKHRoaXMuZW50aXR5U2NoZW1hLmNvbHVtbnMsICdwcmltYXJ5S2V5Jyk7XG4gICAgICAgIHRoaXMucHJpbWFyeUtleU5hbWUgPSB0aGlzLnByaW1hcnlLZXlGaWVsZCA/IHRoaXMucHJpbWFyeUtleUZpZWxkLmZpZWxkTmFtZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5lbnRpdHlTY2hlbWEuY29sdW1ucy5mb3JFYWNoKGMgPT4ge1xuICAgICAgICAgICAgdGhpcy5maWVsZFRvQ29sdW1uTWFwcGluZ1tjLmZpZWxkTmFtZV0gPSBjLm5hbWU7XG4gICAgICAgICAgICBpZiAoYy5mb3JlaWduUmVsYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgYy5mb3JlaWduUmVsYXRpb25zLmZvckVhY2goIGZvcmVpZ25SZWxhdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmllbGRUb0NvbHVtbk1hcHBpbmdbZm9yZWlnblJlbGF0aW9uLnRhcmdldFBhdGhdID0gYy5uYW1lO1xuICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2goZm9yZWlnblJlbGF0aW9uLmRhdGFNYXBwZXIsIChjaGlsZENvbCwgY2hpbGRGaWVsZE5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmllbGRUb0NvbHVtbk1hcHBpbmdbY2hpbGRGaWVsZE5hbWVdID0gZm9yZWlnblJlbGF0aW9uLnNvdXJjZUZpZWxkTmFtZSArICcuJyArIGNoaWxkQ29sLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmluc2VydFJlY29yZFNxbFRlbXBsYXRlID0gaW5zZXJ0UmVjb3JkU3FsVGVtcGxhdGUodGhpcy5lbnRpdHlTY2hlbWEpO1xuICAgICAgICB0aGlzLnJlcGxhY2VSZWNvcmRTcWxUZW1wbGF0ZSA9IHJlcGxhY2VSZWNvcmRTcWxUZW1wbGF0ZSh0aGlzLmVudGl0eVNjaGVtYSk7XG4gICAgICAgIHRoaXMuZGVsZXRlUmVjb3JkVGVtcGxhdGUgPSBkZWxldGVSZWNvcmRUZW1wbGF0ZSh0aGlzLmVudGl0eVNjaGVtYSk7XG4gICAgICAgIHRoaXMuc2VsZWN0U3FsVGVtcGxhdGUgPSBzZWxlY3RTcWxUZW1wbGF0ZSh0aGlzLmVudGl0eVNjaGVtYSk7XG4gICAgICAgIHRoaXMuY291bnRRdWVyeSA9IGNvdW50UXVlcnlUZW1wbGF0ZSh0aGlzLmVudGl0eVNjaGVtYSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZChlbnRpdHk6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGlmICh0aGlzLnByaW1hcnlLZXlOYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBpZFZhbHVlID0gZW50aXR5W3RoaXMucHJpbWFyeUtleU5hbWVdO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJpbWFyeUtleUZpZWxkLnNxbFR5cGUgPT09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgJiYgKCFpc0RlZmluZWQoaWRWYWx1ZSkgfHwgKF8uaXNTdHJpbmcoaWRWYWx1ZSkgJiYgXy5pc0VtcHR5KF8udHJpbShpZFZhbHVlKSkpKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByaW1hcnlLZXlGaWVsZC5nZW5lcmF0b3JUeXBlID09PSAnaWRlbnRpdHknKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0aW5nIHRoZSBpZCB3aXRoIHRoZSBsYXRlc3QgaWQgb2J0YWluZWQgZnJvbSBuZXh0SWQuXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eVt0aGlzLnByaW1hcnlLZXlOYW1lXSA9IHRoaXMubG9jYWxEYk1hbmFnZW1lbnRTZXJ2aWNlLm5leHRJZENvdW50KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIGFzc2lnbmVkIHR5cGUsIGdldCB0aGUgcHJpbWFyeUtleVZhbHVlIGZyb20gdGhlIHJlbGF0ZWRUYWJsZURhdGEgd2hpY2ggaXMgaW5zaWRlIHRoZSBlbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJpbWFyeUtleVZhbHVlID0gdGhpcy5nZXRWYWx1ZShlbnRpdHksIHRoaXMucHJpbWFyeUtleU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5TmFtZV0gPSBwcmltYXJ5S2V5VmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJvd0RhdGEgPSBtYXBPYmpUb1Jvdyh0aGlzLCBlbnRpdHkpO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSB0aGlzLmVudGl0eVNjaGVtYS5jb2x1bW5zLm1hcChmID0+IHJvd0RhdGFbZi5uYW1lXSk7XG4gICAgICAgIHJldHVybiB0aGlzLnNxbGl0ZU9iamVjdC5leGVjdXRlU3FsKHRoaXMuaW5zZXJ0UmVjb3JkU3FsVGVtcGxhdGUsIHBhcmFtcylcbiAgICAgICAgICAgIC50aGVuKHJlc3VsdCA9PiByZXN1bHQuaW5zZXJ0SWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNsZWFycyBhbGwgZGF0YSBvZiB0aGlzIHN0b3JlLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHByb21pc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgY2xlYXIoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsaXRlT2JqZWN0LmV4ZWN1dGVTcWwoJ0RFTEVURSBGUk9NICcgKyBlc2NhcGVOYW1lKHRoaXMuZW50aXR5U2NoZW1hLm5hbWUpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjcmVhdGVzIHRoZSBzdG9yZXMgaWYgaXQgZG9lcyBub3QgZXhpc3RcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICAgICAqL1xuICAgIHB1YmxpYyBjcmVhdGUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsaXRlT2JqZWN0LmV4ZWN1dGVTcWwodGhpcy5jcmVhdGVUYWJsZVNxbCh0aGlzLmVudGl0eVNjaGVtYSkpLnRoZW4oKCkgPT4gdGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY291bnRzIHRoZSBudW1iZXIgb2YgcmVjb3JkcyB0aGF0IHNhdGlzZnkgdGhlIGdpdmVuIGZpbHRlciBjcml0ZXJpYS5cbiAgICAgKiBAcGFyYW0ge0ZpbHRlckNyaXRlcmlvbltdfSBmaWx0ZXJDcml0ZXJpYVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIGNvdW50XG4gICAgICovXG4gICAgcHVibGljIGNvdW50KGZpbHRlckNyaXRlcmlhPzogRmlsdGVyQ3JpdGVyaW9uW10pOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICBjb25zdCBzcWwgPSB0aGlzLmNvdW50UXVlcnkgKyBnZW5lcmF0ZVdoZXJDbGF1c2UodGhpcywgZmlsdGVyQ3JpdGVyaWEpO1xuICAgICAgICByZXR1cm4gdGhpcy5zcWxpdGVPYmplY3QuZXhlY3V0ZVNxbChzcWwpLnRoZW4ocmVzdWx0ID0+IHJlc3VsdC5yb3dzLml0ZW0oMClbJ2NvdW50J10pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gZGVzZXJpYWxpemVzIHRoZSBnaXZlbiBtYXAgb2JqZWN0IHRvIEZvcm1EYXRhLCBwcm92aWRlZCB0aGF0IG1hcCBvYmplY3Qgd2FzXG4gICAgICogc2VyaWFsaXplZCBieSB1c2luZyBzZXJpYWxpemUgbWV0aG9kIG9mIHRoaXMgc3RvcmUuXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBtYXAgb2JqZWN0IHRvIGRlc2VyaWFsaXplXG4gICAgICogQHJldHVybnMge29iamVjdH0gcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggdGhlIGRlc2VyaWFsaXplZCBGb3JtRGF0YS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZGVzZXJpYWxpemUobWFwOiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVzZXJpYWxpemVNYXBUb0Zvcm1EYXRhKG1hcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZmlsdGVycyBkYXRhIG9mIHRoaXMgc3RvcmUgdGhhdCBzdGF0aXNmeSB0aGUgZ2l2ZW4gZmlsdGVyIGNyaXRlcmlhLlxuICAgICAqIEBwYXJhbSB7RmlsdGVyQ3JpdGVyaW9uW119IGZpbHRlckNyaXRlcmlhXG4gICAgICogQHBhcmFtICB7c3RyaW5nPX0gc29ydCBleDogJ2ZpbGVkbmFtZSBhc2MvZGVzYydcbiAgICAgKiBAcGFyYW0gIHtvYmplY3Q9fSBwYWdlIHsnb2Zmc2V0JyA6IDAsIFwibGltaXRcIiA6IDIwfVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIHRoZSBmaWx0ZXJlZCBkYXRhLlxuICAgICAqL1xuICAgIHB1YmxpYyBmaWx0ZXIoZmlsdGVyQ3JpdGVyaWE/OiBGaWx0ZXJDcml0ZXJpb25bXSwgc29ydD86IHN0cmluZywgcGFnZT86IFBhZ2luYXRpb24pOiBQcm9taXNlPGFueVtdPiB7XG4gICAgICAgIGxldCBzcWwgPSB0aGlzLnNlbGVjdFNxbFRlbXBsYXRlO1xuICAgICAgICBzcWwgKz0gZ2VuZXJhdGVXaGVyQ2xhdXNlKHRoaXMsIGZpbHRlckNyaXRlcmlhKTtcbiAgICAgICAgc3FsICs9IGdlbmVyYXRlT3JkZXJCeUNsYXVzZSh0aGlzLCBzb3J0KTtcbiAgICAgICAgc3FsICs9IGdlbmVhdGVMaW1pdENsYXVzZShwYWdlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsaXRlT2JqZWN0LmV4ZWN1dGVTcWwoc3FsKVxuICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9iakFyciA9IFtdLFxuICAgICAgICAgICAgICAgIHJvd0NvdW50ID0gcmVzdWx0LnJvd3MubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3dDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgb2JqQXJyLnB1c2gobWFwUm93RGF0YVRvT2JqKHRoaXMuZW50aXR5U2NoZW1hLCByZXN1bHQucm93cy5pdGVtKGkpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb2JqQXJyO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBmZXRjaGVzIGFsbCB0aGUgZGF0YSByZWxhdGVkIHRvIHRoZSBwcmltYXJ5S2V5XG4gICAgcHVibGljIHJlZnJlc2goZGF0YSkge1xuICAgICAgICBjb25zdCBwcmltYXJ5S2V5TmFtZSA9IHRoaXMucHJpbWFyeUtleU5hbWU7XG4gICAgICAgIGNvbnN0IHByaW1hcnlLZXkgPSB0aGlzLmdldFZhbHVlKGRhdGEsIHByaW1hcnlLZXlOYW1lKTtcbiAgICAgICAgaWYgKCFwcmltYXJ5S2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldChwcmltYXJ5S2V5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBkZWxldGVzIHRoZSByZWNvcmQgd2l0aCB0aGUgZ2l2ZW4gcHJpbWFyeSBrZXkuXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBwcmltYXJ5S2V5IHByaW1hcnkga2V5IG9mIHRoZSByZWNvcmRcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBwcm9taXNlXG4gICAgICovXG4gICAgcHVibGljIGRlbGV0ZShwcmltYXJ5S2V5OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsaXRlT2JqZWN0LmV4ZWN1dGVTcWwodGhpcy5kZWxldGVSZWNvcmRUZW1wbGF0ZSwgW3ByaW1hcnlLZXldKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBmaW5kcyB0aGUgcmVjb3JkIHdpdGggdGhlIGdpdmVuIHByaW1hcnkga2V5LlxuICAgICAqIEBwYXJhbSAge29iamVjdH0gcHJpbWFyeUtleSBwcmltYXJ5IGtleSBvZiB0aGUgcmVjb3JkXG4gICAgICogQHJldHVybnMge29iamVjdH0gcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggZW50aXR5XG4gICAgICovXG4gICAgcHVibGljIGdldChwcmltYXJ5S2V5OiBhbnkpIHtcbiAgICAgICAgY29uc3QgZmlsdGVyQ3JpdGVyaWEgPSBbe1xuICAgICAgICAgICAgYXR0cmlidXRlTmFtZTogdGhpcy5wcmltYXJ5S2V5TmFtZSxcbiAgICAgICAgICAgIGZpbHRlckNvbmRpdGlvbjogJz0nLFxuICAgICAgICAgICAgYXR0cmlidXRlVmFsdWU6IHByaW1hcnlLZXksXG4gICAgICAgICAgICBhdHRyaWJ1dGVUeXBlOiB0aGlzLnByaW1hcnlLZXlGaWVsZC5zcWxUeXBlLnRvVXBwZXJDYXNlKCkgfV07XG4gICAgICAgIHJldHVybiB0aGlzLmZpbHRlcihmaWx0ZXJDcml0ZXJpYSkudGhlbihmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqICYmIG9iai5sZW5ndGggPT09IDEgPyBvYmpbMF0gOiB1bmRlZmluZWQ7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHJpZXZlIHRoZSB2YWx1ZSBmb3IgdGhlIGdpdmVuIGZpZWxkLlxuICAgICAqXG4gICAgICogQHBhcmFtIGVudGl0eVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWVsZE5hbWVcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkIHwgYW55IHwgbnVtYmVyfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRWYWx1ZShlbnRpdHk6IGFueSwgZmllbGROYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgY29sdW1uID0gdGhpcy5lbnRpdHlTY2hlbWEuY29sdW1ucy5maW5kKCBjb2wgPT4gY29sLmZpZWxkTmFtZSA9PT0gZmllbGROYW1lKTtcbiAgICAgICAgcmV0dXJuIGdldFZhbHVlKGVudGl0eSwgY29sdW1uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzYXZlcyB0aGUgZ2l2ZW4gZW50aXR5IHRvIHRoZSBzdG9yZS4gSWYgdGhlIHJlY29yZCBpcyBub3QgYXZhaWxhYmxlLCB0aGVuIGEgbmV3IHJlY29yZCB3aWxsIGJlIGNyZWF0ZWQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGVudGl0eSB0aGUgZW50aXR5IHRvIHNhdmVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBwcm9taXNlXG4gICAgICovXG4gICAgcHVibGljIHNhdmUoZW50aXR5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNhdmVBbGwoW2VudGl0eV0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNhdmVzIHRoZSBnaXZlbiBlbnRpdHkgdG8gdGhlIHN0b3JlLiBJZiB0aGUgcmVjb3JkIGlzIG5vdCBhdmFpbGFibGUsIHRoZW4gYSBuZXcgcmVjb3JkIHdpbGwgYmUgY3JlYXRlZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZW50aXRpZXMgdGhlIGVudGl0eSB0byBzYXZlXG4gICAgICogQHJldHVybnMge29iamVjdH0gcHJvbWlzZVxuICAgICAqL1xuICAgIHB1YmxpYyBzYXZlQWxsKGVudGl0aWVzOiBhbnlbXSkge1xuICAgICAgICAvLyBmaWx0ZXJpbmcgdGhlIG51bGwgZW50aXRpZXNcbiAgICAgICAgZW50aXRpZXMgPSBfLmZpbHRlcihlbnRpdGllcywgbnVsbCk7XG4gICAgICAgIGNvbnN0IHF1ZXJpZXMgPSBfLm1hcChlbnRpdGllcywgZW50aXR5ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvd0RhdGEgPSBtYXBPYmpUb1Jvdyh0aGlzLCBlbnRpdHkpO1xuICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gdGhpcy5lbnRpdHlTY2hlbWEuY29sdW1ucy5tYXAoZiA9PiByb3dEYXRhW2YubmFtZV0pO1xuICAgICAgICAgICAgcmV0dXJuIFt0aGlzLnJlcGxhY2VSZWNvcmRTcWxUZW1wbGF0ZSwgcGFyYW1zXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLnNxbGl0ZU9iamVjdC5zcWxCYXRjaChxdWVyaWVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCYXNlZCBvbiB0aGlzIHN0b3JlIGNvbHVtbnMsIHRoaXMgZnVuY3Rpb24gY29udmVydHMgdGhlIGdpdmVuIEZvcm1EYXRhIHRvIGEgbWFwIG9iamVjdC5cbiAgICAgKiBNdWx0aXBhcnQgZmlsZSBpcyBzdG9yZWQgYXMgYSBsb2NhbCBmaWxlLiBJZiBmb3JtIGRhdGEgY2Fubm90IGJlIHNlcmlhbGl6ZWQsXG4gICAgICogdGhlbiBmb3JtRGF0YSBpcyByZXR1cm5lZCBiYWNrLlxuICAgICAqIEBwYXJhbSAge0Zvcm1EYXRhfSBmb3JtRGF0YSBvYmplY3QgdG8gc2VyaWFsaXplXG4gICAgICogQHJldHVybnMge29iamVjdH0gcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggYSBtYXAuXG4gICAgICovXG4gICAgcHVibGljIHNlcmlhbGl6ZShmb3JtRGF0YTogYW55KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcmlhbGl6ZUZvcm1EYXRhVG9NYXAoZm9ybURhdGEpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgYmxvYiB0byBhIGxvY2FsIGZpbGVcbiAgICAgKiBAcGFyYW0gYmxvYlxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIHByaXZhdGUgc2F2ZUJsb2JUb0ZpbGUoYmxvYjogYW55KSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gdGhpcy5kZXZpY2VGaWxlU2VydmljZS5hcHBlbmRUb0ZpbGVOYW1lKGJsb2IubmFtZSksXG4gICAgICAgICAgICB1cGxvYWREaXIgPSB0aGlzLmRldmljZUZpbGVTZXJ2aWNlLmdldFVwbG9hZERpcmVjdG9yeSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLndyaXRlRmlsZSh1cGxvYWREaXIsIGZpbGVOYW1lLCBibG9iKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ25hbWUnIDogYmxvYi5uYW1lLFxuICAgICAgICAgICAgICAgICd0eXBlJyA6IGJsb2IudHlwZSxcbiAgICAgICAgICAgICAgICAnbGFzdE1vZGlmaWVkJyA6IGJsb2IubGFzdE1vZGlmaWVkLFxuICAgICAgICAgICAgICAgICdsYXN0TW9kaWZpZWREYXRlJyA6IGJsb2IubGFzdE1vZGlmaWVkRGF0ZSxcbiAgICAgICAgICAgICAgICAnc2l6ZScgOiBibG9iLnNpemUsXG4gICAgICAgICAgICAgICAgJ3dtTG9jYWxQYXRoJyA6IHVwbG9hZERpciArICcvJyArIGZpbGVOYW1lXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBmb3JtIGRhdGEgb2JqZWN0IHRvIG1hcCBmb3Igc3RvcmluZyByZXF1ZXN0IGluIGxvY2FsIGRhdGFiYXNlLi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHNlcmlhbGl6ZUZvcm1EYXRhVG9NYXAoZm9ybURhdGEpIHtcbiAgICAgICAgY29uc3QgYmxvYkNvbHVtbnMgPSBfLmZpbHRlcih0aGlzLmVudGl0eVNjaGVtYS5jb2x1bW5zLCB7XG4gICAgICAgICAgICAgICAgJ3NxbFR5cGUnIDogJ2Jsb2InXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHByb21pc2VzID0gW107XG4gICAgICAgIGxldCBtYXAgPSB7fTtcbiAgICAgICAgaWYgKGZvcm1EYXRhICYmIHR5cGVvZiBmb3JtRGF0YS5hcHBlbmQgPT09ICdmdW5jdGlvbicgJiYgZm9ybURhdGEucm93RGF0YSkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKGZvcm1EYXRhLnJvd0RhdGEsIChmaWVsZERhdGEsIGZpZWxkTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChmaWVsZERhdGEgJiYgXy5maW5kKGJsb2JDb2x1bW5zLCB7J2ZpZWxkTmFtZScgOiBmaWVsZE5hbWV9KSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuc2F2ZUJsb2JUb0ZpbGUoZmllbGREYXRhKS50aGVuKGxvY2FsRmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBbZmllbGROYW1lXSA9IGxvY2FsRmlsZTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcFtmaWVsZE5hbWVdID0gZmllbGREYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWFwID0gZm9ybURhdGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKCgpID0+IG1hcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgbWFwIG9iamVjdCBiYWNrIHRvIGZvcm0gZGF0YS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGRlc2VyaWFsaXplTWFwVG9Gb3JtRGF0YShtYXApIHtcbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKSxcbiAgICAgICAgICAgIGJsb2JDb2x1bW5zID0gdGhpcy5lbnRpdHlTY2hlbWEuY29sdW1ucy5maWx0ZXIoYyA9PiBjLnNxbFR5cGUgPT09ICdibG9iJyksXG4gICAgICAgICAgICBwcm9taXNlcyA9IFtdO1xuICAgICAgICBfLmZvckVhY2goYmxvYkNvbHVtbnMsIGNvbHVtbiA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG1hcFtjb2x1bW4uZmllbGROYW1lXTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS53bUxvY2FsUGF0aCkge1xuICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2goY29udmVydFRvQmxvYih2YWx1ZS53bUxvY2FsUGF0aClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IGZvcm1EYXRhLmFwcGVuZChjb2x1bW4uZmllbGROYW1lLCByZXN1bHQuYmxvYiwgdmFsdWUubmFtZSkpKTtcbiAgICAgICAgICAgICAgICBtYXBbY29sdW1uLmZpZWxkTmFtZV0gPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZChTV0FHR0VSX0NPTlNUQU5UUy5XTV9EQVRBX0pTT04sIG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeShtYXApXSwge1xuICAgICAgICAgICAgdHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKCgpID0+IGZvcm1EYXRhKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVRhYmxlU3FsKHNjaGVtYSkge1xuICAgICAgICBjb25zdCBmaWVsZFN0ciA9IF8ucmVkdWNlKHNjaGVtYS5jb2x1bW5zLCAocmVzdWx0LCBmKSA9PiB7XG4gICAgICAgICAgICBsZXQgc3RyID0gZXNjYXBlTmFtZShmLm5hbWUpO1xuICAgICAgICAgICAgaWYgKGYucHJpbWFyeUtleSkge1xuICAgICAgICAgICAgICAgIGlmIChmLnNxbFR5cGUgPT09ICdudW1iZXInICYmIGYuZ2VuZXJhdG9yVHlwZSA9PT0gJ2RhdGFiYXNlSWRlbnRpdHknKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ciArPSAnIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RyICs9ICcgUFJJTUFSWSBLRVknO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQgPyByZXN1bHQgKyAnLCcgKyBzdHIgOiBzdHI7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAke2VzY2FwZU5hbWUoc2NoZW1hLm5hbWUpfSAoJHtmaWVsZFN0cn0pYDtcbiAgICB9XG59XG4iXX0=