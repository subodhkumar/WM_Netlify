import { convertToBlob, isDefined } from '@wm/core';
import { SWAGGER_CONSTANTS } from '@wm/variables';
import { escapeName } from '../utils/utils';
const insertRecordSqlTemplate = (schema) => {
    const columnNames = [], placeHolder = [];
    _.forEach(schema.columns, col => {
        columnNames.push(escapeName(col.name));
        placeHolder.push('?');
    });
    return `INSERT INTO ${escapeName(schema.name)} (${columnNames.join(',')}) VALUES (${placeHolder.join(',')})`;
};
const ɵ0 = insertRecordSqlTemplate;
const replaceRecordSqlTemplate = (schema) => {
    const columnNames = [], placeHolder = [];
    _.forEach(schema.columns, col => {
        columnNames.push(escapeName(col.name));
        placeHolder.push('?');
    });
    return `REPLACE INTO ${escapeName(schema.name)} (${columnNames.join(',')}) VALUES (${placeHolder.join(',')})`;
};
const ɵ1 = replaceRecordSqlTemplate;
const deleteRecordTemplate = (schema) => {
    const primaryKeyField = _.find(schema.columns, 'primaryKey');
    if (primaryKeyField) {
        return `DELETE FROM ${escapeName(schema.name)} WHERE ${escapeName(primaryKeyField.name)} = ?`;
    }
    return '';
};
const ɵ2 = deleteRecordTemplate;
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
const ɵ3 = selectSqlTemplate;
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
const ɵ4 = countQueryTemplate;
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
const ɵ5 = generateWherClause;
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
const ɵ6 = generateOrderByClause;
const geneateLimitClause = page => {
    page = page || {};
    return ' LIMIT ' + (page.limit || 100) + ' OFFSET ' + (page.offset || 0);
};
const ɵ7 = geneateLimitClause;
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
const ɵ8 = mapRowDataToObj;
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
const ɵ9 = getValue;
const mapObjToRow = (store, entity) => {
    const row = {};
    store.entitySchema.columns.forEach(col => row[col.name] = getValue(entity, col));
    return row;
};
const ɵ10 = mapObjToRow;
export class LocalDBStore {
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
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5, ɵ6, ɵ7, ɵ8, ɵ9, ɵ10 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwtZGItc3RvcmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL29mZmxpbmUvIiwic291cmNlcyI6WyJtb2RlbHMvbG9jYWwtZGItc3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFcEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQWlCNUMsTUFBTSx1QkFBdUIsR0FBRyxDQUFDLE1BQWtCLEVBQUUsRUFBRTtJQUNuRCxNQUFNLFdBQVcsR0FBRyxFQUFFLEVBQ2xCLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDckIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO1FBQzVCLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLGVBQWUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztBQUNqSCxDQUFDLENBQUM7O0FBRUYsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLE1BQWtCLEVBQUUsRUFBRTtJQUNwRCxNQUFNLFdBQVcsR0FBRyxFQUFFLEVBQ2xCLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDckIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO1FBQzVCLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdB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LENBQUM7SUFFTyxjQUFjLENBQUMsTUFBTTtRQUN6QixNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEQsSUFBSSxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsQ0FBQyxVQUFVLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLFFBQVEsSUFBSSxDQUFDLENBQUMsYUFBYSxLQUFLLGtCQUFrQixFQUFFO29CQUNsRSxHQUFHLElBQUksb0NBQW9DLENBQUM7aUJBQy9DO3FCQUFNO29CQUNILEdBQUcsSUFBSSxjQUFjLENBQUM7aUJBQ3pCO2FBQ0o7WUFDRCxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM3QyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDVixPQUFPLDhCQUE4QixVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEsR0FBRyxDQUFDO0lBQ2pGLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZpbGUgfSBmcm9tICdAaW9uaWMtbmF0aXZlL2ZpbGUnO1xuaW1wb3J0IHsgU1FMaXRlT2JqZWN0IH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9zcWxpdGUnO1xuXG5pbXBvcnQgeyBjb252ZXJ0VG9CbG9iLCBpc0RlZmluZWQgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBEZXZpY2VGaWxlU2VydmljZSB9IGZyb20gJ0B3bS9tb2JpbGUvY29yZSc7XG5pbXBvcnQgeyBTV0FHR0VSX0NPTlNUQU5UUyB9IGZyb20gJ0B3bS92YXJpYWJsZXMnO1xuXG5pbXBvcnQgeyBDb2x1bW5JbmZvLCBFbnRpdHlJbmZvIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgZXNjYXBlTmFtZSB9IGZyb20gJy4uL3V0aWxzL3V0aWxzJztcbmltcG9ydCB7IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL2xvY2FsLWRiLW1hbmFnZW1lbnQuc2VydmljZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuZXhwb3J0IGludGVyZmFjZSBGaWx0ZXJDcml0ZXJpb24ge1xuICAgIGF0dHJpYnV0ZU5hbWU6IHN0cmluZztcbiAgICBhdHRyaWJ1dGVWYWx1ZTogYW55O1xuICAgIGF0dHJpYnV0ZVR5cGU6IHN0cmluZztcbiAgICBmaWx0ZXJDb25kaXRpb246IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYWdpbmF0aW9uIHtcbiAgICBvZmZzZXQ6IG51bWJlcjtcbiAgICBsaW1pdDogbnVtYmVyO1xufVxuXG5jb25zdCBpbnNlcnRSZWNvcmRTcWxUZW1wbGF0ZSA9IChzY2hlbWE6IEVudGl0eUluZm8pID0+IHtcbiAgICBjb25zdCBjb2x1bW5OYW1lcyA9IFtdLFxuICAgICAgICBwbGFjZUhvbGRlciA9IFtdO1xuICAgIF8uZm9yRWFjaChzY2hlbWEuY29sdW1ucywgY29sID0+IHtcbiAgICAgICAgY29sdW1uTmFtZXMucHVzaChlc2NhcGVOYW1lKGNvbC5uYW1lKSk7XG4gICAgICAgIHBsYWNlSG9sZGVyLnB1c2goJz8nKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYElOU0VSVCBJTlRPICR7ZXNjYXBlTmFtZShzY2hlbWEubmFtZSl9ICgke2NvbHVtbk5hbWVzLmpvaW4oJywnKX0pIFZBTFVFUyAoJHtwbGFjZUhvbGRlci5qb2luKCcsJyl9KWA7XG59O1xuXG5jb25zdCByZXBsYWNlUmVjb3JkU3FsVGVtcGxhdGUgPSAoc2NoZW1hOiBFbnRpdHlJbmZvKSA9PiB7XG4gICAgY29uc3QgY29sdW1uTmFtZXMgPSBbXSxcbiAgICAgICAgcGxhY2VIb2xkZXIgPSBbXTtcbiAgICBfLmZvckVhY2goc2NoZW1hLmNvbHVtbnMsIGNvbCA9PiB7XG4gICAgICAgIGNvbHVtbk5hbWVzLnB1c2goZXNjYXBlTmFtZShjb2wubmFtZSkpO1xuICAgICAgICBwbGFjZUhvbGRlci5wdXNoKCc/Jyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGBSRVBMQUNFIElOVE8gJHtlc2NhcGVOYW1lKHNjaGVtYS5uYW1lKX0gKCR7Y29sdW1uTmFtZXMuam9pbignLCcpfSkgVkFMVUVTICgke3BsYWNlSG9sZGVyLmpvaW4oJywnKX0pYDtcbn07XG5cbmNvbnN0IGRlbGV0ZVJlY29yZFRlbXBsYXRlID0gKHNjaGVtYTogRW50aXR5SW5mbykgPT4ge1xuICAgIGNvbnN0IHByaW1hcnlLZXlGaWVsZCA9IF8uZmluZChzY2hlbWEuY29sdW1ucywgJ3ByaW1hcnlLZXknKTtcbiAgICBpZiAocHJpbWFyeUtleUZpZWxkKSB7XG4gICAgICAgIHJldHVybiBgREVMRVRFIEZST00gJHtlc2NhcGVOYW1lKHNjaGVtYS5uYW1lKX0gV0hFUkUgJHtlc2NhcGVOYW1lKHByaW1hcnlLZXlGaWVsZC5uYW1lKX0gPSA/YDtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xufTtcblxuY29uc3Qgc2VsZWN0U3FsVGVtcGxhdGUgPSAoc2NoZW1hOiBFbnRpdHlJbmZvKSA9PiB7XG4gICAgY29uc3QgY29sdW1ucyA9IFtdLFxuICAgICAgICBqb2lucyA9IFtdO1xuICAgIHNjaGVtYS5jb2x1bW5zLmZvckVhY2goIGNvbCA9PiB7XG4gICAgICAgIGxldCBjaGlsZFRhYmxlTmFtZTtcbiAgICAgICAgY29sdW1ucy5wdXNoKGVzY2FwZU5hbWUoc2NoZW1hLm5hbWUpICsgJy4nICsgZXNjYXBlTmFtZShjb2wubmFtZSkgKyAnIGFzICcgKyBjb2wuZmllbGROYW1lKTtcbiAgICAgICAgaWYgKGNvbC5mb3JlaWduUmVsYXRpb25zKSB7XG4gICAgICAgICAgICBjb2wuZm9yZWlnblJlbGF0aW9ucy5mb3JFYWNoKGZvcmVpZ25SZWxhdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgY2hpbGRUYWJsZU5hbWUgPSBmb3JlaWduUmVsYXRpb24uc291cmNlRmllbGROYW1lO1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChmb3JlaWduUmVsYXRpb24uZGF0YU1hcHBlciwgKGNoaWxkQ29sLCBjaGlsZEZpbGVkTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zLnB1c2goY2hpbGRUYWJsZU5hbWUgKyAnLicgKyBlc2NhcGVOYW1lKGNoaWxkQ29sLm5hbWUpICsgJyBhcyBcXCcnICsgY2hpbGRGaWxlZE5hbWUgKyAnXFwnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgam9pbnMucHVzaChgIExFRlQgSk9JTiAke2VzY2FwZU5hbWUoZm9yZWlnblJlbGF0aW9uLnRhcmdldFRhYmxlKX0gJHtjaGlsZFRhYmxlTmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICBPTiAke2NoaWxkVGFibGVOYW1lfS4ke2VzY2FwZU5hbWUoZm9yZWlnblJlbGF0aW9uLnRhcmdldENvbHVtbil9ID0gJHtlc2NhcGVOYW1lKHNjaGVtYS5uYW1lKX0uJHtlc2NhcGVOYW1lKGNvbC5uYW1lKX1gKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGBTRUxFQ1QgJHtjb2x1bW5zLmpvaW4oJywnKX0gRlJPTSAke2VzY2FwZU5hbWUoc2NoZW1hLm5hbWUpfSAke2pvaW5zLmpvaW4oJyAnKX1gO1xufTtcblxuY29uc3QgY291bnRRdWVyeVRlbXBsYXRlID0gKHNjaGVtYTogRW50aXR5SW5mbykgPT4ge1xuICAgIGNvbnN0IGpvaW5zID0gW107XG4gICAgc2NoZW1hLmNvbHVtbnMuZm9yRWFjaCggY29sID0+IHtcbiAgICAgICAgbGV0IGNoaWxkVGFibGVOYW1lO1xuICAgICAgICBpZiAoY29sLmZvcmVpZ25SZWxhdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbC5mb3JlaWduUmVsYXRpb25zLmZvckVhY2goZm9yZWlnblJlbGF0aW9uID0+IHtcbiAgICAgICAgICAgICAgICBjaGlsZFRhYmxlTmFtZSA9IGZvcmVpZ25SZWxhdGlvbi5zb3VyY2VGaWVsZE5hbWU7XG4gICAgICAgICAgICAgICAgam9pbnMucHVzaChgIExFRlQgSk9JTiAke2VzY2FwZU5hbWUoZm9yZWlnblJlbGF0aW9uLnRhcmdldFRhYmxlKX0gJHtjaGlsZFRhYmxlTmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICBPTiAke2NoaWxkVGFibGVOYW1lfS4ke2VzY2FwZU5hbWUoZm9yZWlnblJlbGF0aW9uLnRhcmdldENvbHVtbil9ID0gJHtlc2NhcGVOYW1lKHNjaGVtYS5uYW1lKX0uJHtlc2NhcGVOYW1lKGNvbC5uYW1lKX1gKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGBTRUxFQ1QgY291bnQoKikgYXMgY291bnQgRlJPTSAke2VzY2FwZU5hbWUoc2NoZW1hLm5hbWUpfSAke2pvaW5zLmpvaW4oJyAnKX1gO1xufTtcblxuY29uc3QgZ2VuZXJhdGVXaGVyQ2xhdXNlID0gKHN0b3JlOiBMb2NhbERCU3RvcmUsIGZpbHRlckNyaXRlcmlhOiBGaWx0ZXJDcml0ZXJpb25bXSkgPT4ge1xuICAgIGxldCBjb25kaXRpb25zO1xuICAgIGNvbnN0IGZpZWxkVG9Db2x1bW5NYXBwaW5nID0gc3RvcmUuZmllbGRUb0NvbHVtbk1hcHBpbmcsXG4gICAgICAgIHRhYmxlTmFtZSA9IHN0b3JlLmVudGl0eVNjaGVtYS5uYW1lO1xuICAgIGlmICghXy5pc0VtcHR5KGZpbHRlckNyaXRlcmlhKSAmJiBfLmlzU3RyaW5nKGZpbHRlckNyaXRlcmlhKSkge1xuICAgICAgICByZXR1cm4gJyBXSEVSRSAnICsgZmlsdGVyQ3JpdGVyaWE7XG4gICAgfVxuICAgIGlmIChmaWx0ZXJDcml0ZXJpYSkge1xuICAgICAgICBjb25kaXRpb25zID0gZmlsdGVyQ3JpdGVyaWEubWFwKGZpbHRlckNyaXRlcmlvbiA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb2xOYW1lID0gZmllbGRUb0NvbHVtbk1hcHBpbmdbZmlsdGVyQ3JpdGVyaW9uLmF0dHJpYnV0ZU5hbWVdLFxuICAgICAgICAgICAgICAgIGNvbmRpdGlvbiA9IGZpbHRlckNyaXRlcmlvbi5maWx0ZXJDb25kaXRpb247XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZmlsdGVyQ3JpdGVyaW9uLmF0dHJpYnV0ZVZhbHVlLFxuICAgICAgICAgICAgICAgIG9wZXJhdG9yID0gJz0nO1xuICAgICAgICAgICAgaWYgKGZpbHRlckNyaXRlcmlvbi5hdHRyaWJ1dGVUeXBlID09PSAnU1RSSU5HJykge1xuICAgICAgICAgICAgICAgIGlmIChjb25kaXRpb24gPT09ICdTVEFSVElOR19XSVRIJykge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQgKyAnJSc7XG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdG9yID0gJ2xpa2UnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29uZGl0aW9uID09PSAnRU5ESU5HX1dJVEgnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9ICclJyArIHRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0b3IgPSAnbGlrZSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb25kaXRpb24gPT09ICdDT05UQUlOSU5HJykge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSAnJScgKyB0YXJnZXQgKyAnJSc7XG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdG9yID0gJ2xpa2UnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBgJyR7dGFyZ2V0fSdgO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmaWx0ZXJDcml0ZXJpb24uYXR0cmlidXRlVHlwZSA9PT0gJ0JPT0xFQU4nKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gKHRhcmdldCA9PT0gdHJ1ZSA/IDEgOiAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBgJHtlc2NhcGVOYW1lKHRhYmxlTmFtZSl9LiR7ZXNjYXBlTmFtZShjb2xOYW1lKX0gJHtvcGVyYXRvcn0gJHt0YXJnZXR9YDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBjb25kaXRpb25zICYmIGNvbmRpdGlvbnMubGVuZ3RoID4gMCA/ICcgV0hFUkUgJyArIGNvbmRpdGlvbnMuam9pbignIEFORCAnKSA6ICcnO1xufTtcblxuY29uc3QgZ2VuZXJhdGVPcmRlckJ5Q2xhdXNlID0gKHN0b3JlOiBMb2NhbERCU3RvcmUsIHNvcnQ6IHN0cmluZykgPT4ge1xuICAgIGlmIChzb3J0KSB7XG4gICAgICAgIHJldHVybiAnIE9SREVSIEJZICcgKyBfLm1hcChzb3J0LnNwbGl0KCcsJyksIGZpZWxkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0cyA9ICBfLnRyaW0oZmllbGQpLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICBzcGxpdHNbMF0gPSBlc2NhcGVOYW1lKHN0b3JlLmVudGl0eVNjaGVtYS5uYW1lKSArICcuJyArIGVzY2FwZU5hbWUoc3RvcmUuZmllbGRUb0NvbHVtbk1hcHBpbmdbc3BsaXRzWzBdXSk7XG4gICAgICAgICAgICByZXR1cm4gc3BsaXRzLmpvaW4oJyAnKTtcbiAgICAgICAgfSkuam9pbignLCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG59O1xuXG5jb25zdCBnZW5lYXRlTGltaXRDbGF1c2UgPSBwYWdlID0+IHtcbiAgICBwYWdlID0gcGFnZSB8fCB7fTtcbiAgICByZXR1cm4gJyBMSU1JVCAnICsgKHBhZ2UubGltaXQgfHwgMTAwKSArICcgT0ZGU0VUICcgKyAocGFnZS5vZmZzZXQgfHwgMCk7XG59O1xuXG5jb25zdCBtYXBSb3dEYXRhVG9PYmogPSAoc2NoZW1hOiBFbnRpdHlJbmZvLCBkYXRhT2JqOiBhbnkpID0+IHtcbiAgICBzY2hlbWEuY29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgIGNvbnN0IHZhbCA9IGRhdGFPYmpbY29sLmZpZWxkTmFtZV07XG4gICAgICAgIGlmIChjb2wuZm9yZWlnblJlbGF0aW9ucykge1xuICAgICAgICAgICAgY29sLmZvcmVpZ25SZWxhdGlvbnMuZm9yRWFjaChmb3JlaWduUmVsYXRpb24gPT4ge1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZEVudGl0eSA9IG51bGw7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGZvcmVpZ25SZWxhdGlvbi5kYXRhTWFwcGVyLCBmdW5jdGlvbiAoY2hpbGRDb2wsIGNoaWxkRmllbGROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpZWxkVmFsdWUgPSBkYXRhT2JqW2NoaWxkRmllbGROYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmaW5lZChmaWVsZFZhbHVlKSAmJiBmaWVsZFZhbHVlICE9PSBudWxsICYmIGZpZWxkVmFsdWUgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZEVudGl0eSA9IGNoaWxkRW50aXR5IHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRFbnRpdHlbY2hpbGRDb2wuZmllbGROYW1lXSA9IGRhdGFPYmpbY2hpbGRGaWVsZE5hbWVdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhT2JqW2NoaWxkRmllbGROYW1lXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBkYXRhT2JqW2ZvcmVpZ25SZWxhdGlvbi5zb3VyY2VGaWVsZE5hbWVdID0gY2hpbGRFbnRpdHk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2wuc3FsVHlwZSA9PT0gJ2Jvb2xlYW4nICYmICFfLmlzTmlsKHZhbCkpIHtcbiAgICAgICAgICAgIGRhdGFPYmpbY29sLmZpZWxkTmFtZV0gPSAodmFsID09PSAxKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkYXRhT2JqO1xufTtcblxuY29uc3QgZ2V0VmFsdWUgPSAoZW50aXR5OiBhbnksIGNvbDogQ29sdW1uSW5mbykgPT4ge1xuICAgIGxldCB2YWx1ZSA9IGVudGl0eVtjb2wuZmllbGROYW1lXTtcbiAgICBpZiAoY29sLmZvcmVpZ25SZWxhdGlvbnMpIHtcbiAgICAgICAgY29sLmZvcmVpZ25SZWxhdGlvbnMuc29tZShmb3JlaWduUmVsYXRpb24gPT4ge1xuICAgICAgICAgICAgaWYgKGZvcmVpZ25SZWxhdGlvbi50YXJnZXRFbnRpdHkgJiYgZW50aXR5W2ZvcmVpZ25SZWxhdGlvbi5zb3VyY2VGaWVsZE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBlbnRpdHlbZm9yZWlnblJlbGF0aW9uLnNvdXJjZUZpZWxkTmFtZV1bZm9yZWlnblJlbGF0aW9uLnRhcmdldEZpZWxkTmFtZV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoXy5pc05pbCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGNvbC5kZWZhdWx0VmFsdWU7XG4gICAgfSBlbHNlIGlmIChjb2wuc3FsVHlwZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHJldHVybiAodmFsdWUgPT09IHRydWUgPyAxIDogMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbn07XG5cbmNvbnN0IG1hcE9ialRvUm93ID0gKHN0b3JlOiBMb2NhbERCU3RvcmUsIGVudGl0eTogYW55KSA9PiB7XG4gICAgY29uc3Qgcm93ID0ge307XG4gICAgc3RvcmUuZW50aXR5U2NoZW1hLmNvbHVtbnMuZm9yRWFjaChjb2wgPT4gcm93W2NvbC5uYW1lXSA9IGdldFZhbHVlKGVudGl0eSwgY29sKSk7XG4gICAgcmV0dXJuIHJvdztcbn07XG5cbmV4cG9ydCBjbGFzcyBMb2NhbERCU3RvcmUge1xuXG4gICAgcHVibGljIHJlYWRvbmx5IHByaW1hcnlLZXlGaWVsZDogQ29sdW1uSW5mbztcbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJpbWFyeUtleU5hbWU6IHN0cmluZztcbiAgICBwdWJsaWMgcmVhZG9ubHkgZmllbGRUb0NvbHVtbk1hcHBpbmc6IG9iamVjdCA9IHt9O1xuXG4gICAgcHJpdmF0ZSBpbnNlcnRSZWNvcmRTcWxUZW1wbGF0ZTogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVwbGFjZVJlY29yZFNxbFRlbXBsYXRlOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBkZWxldGVSZWNvcmRUZW1wbGF0ZTogc3RyaW5nO1xuICAgIHByaXZhdGUgc2VsZWN0U3FsVGVtcGxhdGU6IHN0cmluZztcbiAgICBwcml2YXRlIGNvdW50UXVlcnk6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGRldmljZUZpbGVTZXJ2aWNlOiBEZXZpY2VGaWxlU2VydmljZSxcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IGVudGl0eVNjaGVtYTogRW50aXR5SW5mbyxcbiAgICAgICAgcHJpdmF0ZSBmaWxlOiBGaWxlLFxuICAgICAgICBwcml2YXRlIGxvY2FsRGJNYW5hZ2VtZW50U2VydmljZTogTG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHNxbGl0ZU9iamVjdDogU1FMaXRlT2JqZWN0XG4gICAgKSB7XG4gICAgICAgIHRoaXMucHJpbWFyeUtleUZpZWxkID0gXy5maW5kKHRoaXMuZW50aXR5U2NoZW1hLmNvbHVtbnMsICdwcmltYXJ5S2V5Jyk7XG4gICAgICAgIHRoaXMucHJpbWFyeUtleU5hbWUgPSB0aGlzLnByaW1hcnlLZXlGaWVsZCA/IHRoaXMucHJpbWFyeUtleUZpZWxkLmZpZWxkTmFtZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5lbnRpdHlTY2hlbWEuY29sdW1ucy5mb3JFYWNoKGMgPT4ge1xuICAgICAgICAgICAgdGhpcy5maWVsZFRvQ29sdW1uTWFwcGluZ1tjLmZpZWxkTmFtZV0gPSBjLm5hbWU7XG4gICAgICAgICAgICBpZiAoYy5mb3JlaWduUmVsYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgYy5mb3JlaWduUmVsYXRpb25zLmZvckVhY2goIGZvcmVpZ25SZWxhdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmllbGRUb0NvbHVtbk1hcHBpbmdbZm9yZWlnblJlbGF0aW9uLnRhcmdldFBhdGhdID0gYy5uYW1lO1xuICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2goZm9yZWlnblJlbGF0aW9uLmRhdGFNYXBwZXIsIChjaGlsZENvbCwgY2hpbGRGaWVsZE5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmllbGRUb0NvbHVtbk1hcHBpbmdbY2hpbGRGaWVsZE5hbWVdID0gZm9yZWlnblJlbGF0aW9uLnNvdXJjZUZpZWxkTmFtZSArICcuJyArIGNoaWxkQ29sLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmluc2VydFJlY29yZFNxbFRlbXBsYXRlID0gaW5zZXJ0UmVjb3JkU3FsVGVtcGxhdGUodGhpcy5lbnRpdHlTY2hlbWEpO1xuICAgICAgICB0aGlzLnJlcGxhY2VSZWNvcmRTcWxUZW1wbGF0ZSA9IHJlcGxhY2VSZWNvcmRTcWxUZW1wbGF0ZSh0aGlzLmVudGl0eVNjaGVtYSk7XG4gICAgICAgIHRoaXMuZGVsZXRlUmVjb3JkVGVtcGxhdGUgPSBkZWxldGVSZWNvcmRUZW1wbGF0ZSh0aGlzLmVudGl0eVNjaGVtYSk7XG4gICAgICAgIHRoaXMuc2VsZWN0U3FsVGVtcGxhdGUgPSBzZWxlY3RTcWxUZW1wbGF0ZSh0aGlzLmVudGl0eVNjaGVtYSk7XG4gICAgICAgIHRoaXMuY291bnRRdWVyeSA9IGNvdW50UXVlcnlUZW1wbGF0ZSh0aGlzLmVudGl0eVNjaGVtYSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZChlbnRpdHk6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGlmICh0aGlzLnByaW1hcnlLZXlOYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBpZFZhbHVlID0gZW50aXR5W3RoaXMucHJpbWFyeUtleU5hbWVdO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJpbWFyeUtleUZpZWxkLnNxbFR5cGUgPT09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgJiYgKCFpc0RlZmluZWQoaWRWYWx1ZSkgfHwgKF8uaXNTdHJpbmcoaWRWYWx1ZSkgJiYgXy5pc0VtcHR5KF8udHJpbShpZFZhbHVlKSkpKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByaW1hcnlLZXlGaWVsZC5nZW5lcmF0b3JUeXBlID09PSAnaWRlbnRpdHknKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0aW5nIHRoZSBpZCB3aXRoIHRoZSBsYXRlc3QgaWQgb2J0YWluZWQgZnJvbSBuZXh0SWQuXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eVt0aGlzLnByaW1hcnlLZXlOYW1lXSA9IHRoaXMubG9jYWxEYk1hbmFnZW1lbnRTZXJ2aWNlLm5leHRJZENvdW50KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIGFzc2lnbmVkIHR5cGUsIGdldCB0aGUgcHJpbWFyeUtleVZhbHVlIGZyb20gdGhlIHJlbGF0ZWRUYWJsZURhdGEgd2hpY2ggaXMgaW5zaWRlIHRoZSBlbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJpbWFyeUtleVZhbHVlID0gdGhpcy5nZXRWYWx1ZShlbnRpdHksIHRoaXMucHJpbWFyeUtleU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5TmFtZV0gPSBwcmltYXJ5S2V5VmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJvd0RhdGEgPSBtYXBPYmpUb1Jvdyh0aGlzLCBlbnRpdHkpO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSB0aGlzLmVudGl0eVNjaGVtYS5jb2x1bW5zLm1hcChmID0+IHJvd0RhdGFbZi5uYW1lXSk7XG4gICAgICAgIHJldHVybiB0aGlzLnNxbGl0ZU9iamVjdC5leGVjdXRlU3FsKHRoaXMuaW5zZXJ0UmVjb3JkU3FsVGVtcGxhdGUsIHBhcmFtcylcbiAgICAgICAgICAgIC50aGVuKHJlc3VsdCA9PiByZXN1bHQuaW5zZXJ0SWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNsZWFycyBhbGwgZGF0YSBvZiB0aGlzIHN0b3JlLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHByb21pc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgY2xlYXIoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsaXRlT2JqZWN0LmV4ZWN1dGVTcWwoJ0RFTEVURSBGUk9NICcgKyBlc2NhcGVOYW1lKHRoaXMuZW50aXR5U2NoZW1hLm5hbWUpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjcmVhdGVzIHRoZSBzdG9yZXMgaWYgaXQgZG9lcyBub3QgZXhpc3RcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICAgICAqL1xuICAgIHB1YmxpYyBjcmVhdGUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsaXRlT2JqZWN0LmV4ZWN1dGVTcWwodGhpcy5jcmVhdGVUYWJsZVNxbCh0aGlzLmVudGl0eVNjaGVtYSkpLnRoZW4oKCkgPT4gdGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY291bnRzIHRoZSBudW1iZXIgb2YgcmVjb3JkcyB0aGF0IHNhdGlzZnkgdGhlIGdpdmVuIGZpbHRlciBjcml0ZXJpYS5cbiAgICAgKiBAcGFyYW0ge0ZpbHRlckNyaXRlcmlvbltdfSBmaWx0ZXJDcml0ZXJpYVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIGNvdW50XG4gICAgICovXG4gICAgcHVibGljIGNvdW50KGZpbHRlckNyaXRlcmlhPzogRmlsdGVyQ3JpdGVyaW9uW10pOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICBjb25zdCBzcWwgPSB0aGlzLmNvdW50UXVlcnkgKyBnZW5lcmF0ZVdoZXJDbGF1c2UodGhpcywgZmlsdGVyQ3JpdGVyaWEpO1xuICAgICAgICByZXR1cm4gdGhpcy5zcWxpdGVPYmplY3QuZXhlY3V0ZVNxbChzcWwpLnRoZW4ocmVzdWx0ID0+IHJlc3VsdC5yb3dzLml0ZW0oMClbJ2NvdW50J10pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gZGVzZXJpYWxpemVzIHRoZSBnaXZlbiBtYXAgb2JqZWN0IHRvIEZvcm1EYXRhLCBwcm92aWRlZCB0aGF0IG1hcCBvYmplY3Qgd2FzXG4gICAgICogc2VyaWFsaXplZCBieSB1c2luZyBzZXJpYWxpemUgbWV0aG9kIG9mIHRoaXMgc3RvcmUuXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBtYXAgb2JqZWN0IHRvIGRlc2VyaWFsaXplXG4gICAgICogQHJldHVybnMge29iamVjdH0gcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggdGhlIGRlc2VyaWFsaXplZCBGb3JtRGF0YS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZGVzZXJpYWxpemUobWFwOiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVzZXJpYWxpemVNYXBUb0Zvcm1EYXRhKG1hcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZmlsdGVycyBkYXRhIG9mIHRoaXMgc3RvcmUgdGhhdCBzdGF0aXNmeSB0aGUgZ2l2ZW4gZmlsdGVyIGNyaXRlcmlhLlxuICAgICAqIEBwYXJhbSB7RmlsdGVyQ3JpdGVyaW9uW119IGZpbHRlckNyaXRlcmlhXG4gICAgICogQHBhcmFtICB7c3RyaW5nPX0gc29ydCBleDogJ2ZpbGVkbmFtZSBhc2MvZGVzYydcbiAgICAgKiBAcGFyYW0gIHtvYmplY3Q9fSBwYWdlIHsnb2Zmc2V0JyA6IDAsIFwibGltaXRcIiA6IDIwfVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIHRoZSBmaWx0ZXJlZCBkYXRhLlxuICAgICAqL1xuICAgIHB1YmxpYyBmaWx0ZXIoZmlsdGVyQ3JpdGVyaWE/OiBGaWx0ZXJDcml0ZXJpb25bXSwgc29ydD86IHN0cmluZywgcGFnZT86IFBhZ2luYXRpb24pOiBQcm9taXNlPGFueVtdPiB7XG4gICAgICAgIGxldCBzcWwgPSB0aGlzLnNlbGVjdFNxbFRlbXBsYXRlO1xuICAgICAgICBzcWwgKz0gZ2VuZXJhdGVXaGVyQ2xhdXNlKHRoaXMsIGZpbHRlckNyaXRlcmlhKTtcbiAgICAgICAgc3FsICs9IGdlbmVyYXRlT3JkZXJCeUNsYXVzZSh0aGlzLCBzb3J0KTtcbiAgICAgICAgc3FsICs9IGdlbmVhdGVMaW1pdENsYXVzZShwYWdlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsaXRlT2JqZWN0LmV4ZWN1dGVTcWwoc3FsKVxuICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9iakFyciA9IFtdLFxuICAgICAgICAgICAgICAgIHJvd0NvdW50ID0gcmVzdWx0LnJvd3MubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3dDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgb2JqQXJyLnB1c2gobWFwUm93RGF0YVRvT2JqKHRoaXMuZW50aXR5U2NoZW1hLCByZXN1bHQucm93cy5pdGVtKGkpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb2JqQXJyO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBmZXRjaGVzIGFsbCB0aGUgZGF0YSByZWxhdGVkIHRvIHRoZSBwcmltYXJ5S2V5XG4gICAgcHVibGljIHJlZnJlc2goZGF0YSkge1xuICAgICAgICBjb25zdCBwcmltYXJ5S2V5TmFtZSA9IHRoaXMucHJpbWFyeUtleU5hbWU7XG4gICAgICAgIGNvbnN0IHByaW1hcnlLZXkgPSB0aGlzLmdldFZhbHVlKGRhdGEsIHByaW1hcnlLZXlOYW1lKTtcbiAgICAgICAgaWYgKCFwcmltYXJ5S2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldChwcmltYXJ5S2V5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBkZWxldGVzIHRoZSByZWNvcmQgd2l0aCB0aGUgZ2l2ZW4gcHJpbWFyeSBrZXkuXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBwcmltYXJ5S2V5IHByaW1hcnkga2V5IG9mIHRoZSByZWNvcmRcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBwcm9taXNlXG4gICAgICovXG4gICAgcHVibGljIGRlbGV0ZShwcmltYXJ5S2V5OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsaXRlT2JqZWN0LmV4ZWN1dGVTcWwodGhpcy5kZWxldGVSZWNvcmRUZW1wbGF0ZSwgW3ByaW1hcnlLZXldKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBmaW5kcyB0aGUgcmVjb3JkIHdpdGggdGhlIGdpdmVuIHByaW1hcnkga2V5LlxuICAgICAqIEBwYXJhbSAge29iamVjdH0gcHJpbWFyeUtleSBwcmltYXJ5IGtleSBvZiB0aGUgcmVjb3JkXG4gICAgICogQHJldHVybnMge29iamVjdH0gcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggZW50aXR5XG4gICAgICovXG4gICAgcHVibGljIGdldChwcmltYXJ5S2V5OiBhbnkpIHtcbiAgICAgICAgY29uc3QgZmlsdGVyQ3JpdGVyaWEgPSBbe1xuICAgICAgICAgICAgYXR0cmlidXRlTmFtZTogdGhpcy5wcmltYXJ5S2V5TmFtZSxcbiAgICAgICAgICAgIGZpbHRlckNvbmRpdGlvbjogJz0nLFxuICAgICAgICAgICAgYXR0cmlidXRlVmFsdWU6IHByaW1hcnlLZXksXG4gICAgICAgICAgICBhdHRyaWJ1dGVUeXBlOiB0aGlzLnByaW1hcnlLZXlGaWVsZC5zcWxUeXBlLnRvVXBwZXJDYXNlKCkgfV07XG4gICAgICAgIHJldHVybiB0aGlzLmZpbHRlcihmaWx0ZXJDcml0ZXJpYSkudGhlbihmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqICYmIG9iai5sZW5ndGggPT09IDEgPyBvYmpbMF0gOiB1bmRlZmluZWQ7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHJpZXZlIHRoZSB2YWx1ZSBmb3IgdGhlIGdpdmVuIGZpZWxkLlxuICAgICAqXG4gICAgICogQHBhcmFtIGVudGl0eVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWVsZE5hbWVcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkIHwgYW55IHwgbnVtYmVyfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRWYWx1ZShlbnRpdHk6IGFueSwgZmllbGROYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgY29sdW1uID0gdGhpcy5lbnRpdHlTY2hlbWEuY29sdW1ucy5maW5kKCBjb2wgPT4gY29sLmZpZWxkTmFtZSA9PT0gZmllbGROYW1lKTtcbiAgICAgICAgcmV0dXJuIGdldFZhbHVlKGVudGl0eSwgY29sdW1uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzYXZlcyB0aGUgZ2l2ZW4gZW50aXR5IHRvIHRoZSBzdG9yZS4gSWYgdGhlIHJlY29yZCBpcyBub3QgYXZhaWxhYmxlLCB0aGVuIGEgbmV3IHJlY29yZCB3aWxsIGJlIGNyZWF0ZWQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGVudGl0eSB0aGUgZW50aXR5IHRvIHNhdmVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBwcm9taXNlXG4gICAgICovXG4gICAgcHVibGljIHNhdmUoZW50aXR5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNhdmVBbGwoW2VudGl0eV0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNhdmVzIHRoZSBnaXZlbiBlbnRpdHkgdG8gdGhlIHN0b3JlLiBJZiB0aGUgcmVjb3JkIGlzIG5vdCBhdmFpbGFibGUsIHRoZW4gYSBuZXcgcmVjb3JkIHdpbGwgYmUgY3JlYXRlZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZW50aXRpZXMgdGhlIGVudGl0eSB0byBzYXZlXG4gICAgICogQHJldHVybnMge29iamVjdH0gcHJvbWlzZVxuICAgICAqL1xuICAgIHB1YmxpYyBzYXZlQWxsKGVudGl0aWVzOiBhbnlbXSkge1xuICAgICAgICAvLyBmaWx0ZXJpbmcgdGhlIG51bGwgZW50aXRpZXNcbiAgICAgICAgZW50aXRpZXMgPSBfLmZpbHRlcihlbnRpdGllcywgbnVsbCk7XG4gICAgICAgIGNvbnN0IHF1ZXJpZXMgPSBfLm1hcChlbnRpdGllcywgZW50aXR5ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvd0RhdGEgPSBtYXBPYmpUb1Jvdyh0aGlzLCBlbnRpdHkpO1xuICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gdGhpcy5lbnRpdHlTY2hlbWEuY29sdW1ucy5tYXAoZiA9PiByb3dEYXRhW2YubmFtZV0pO1xuICAgICAgICAgICAgcmV0dXJuIFt0aGlzLnJlcGxhY2VSZWNvcmRTcWxUZW1wbGF0ZSwgcGFyYW1zXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLnNxbGl0ZU9iamVjdC5zcWxCYXRjaChxdWVyaWVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCYXNlZCBvbiB0aGlzIHN0b3JlIGNvbHVtbnMsIHRoaXMgZnVuY3Rpb24gY29udmVydHMgdGhlIGdpdmVuIEZvcm1EYXRhIHRvIGEgbWFwIG9iamVjdC5cbiAgICAgKiBNdWx0aXBhcnQgZmlsZSBpcyBzdG9yZWQgYXMgYSBsb2NhbCBmaWxlLiBJZiBmb3JtIGRhdGEgY2Fubm90IGJlIHNlcmlhbGl6ZWQsXG4gICAgICogdGhlbiBmb3JtRGF0YSBpcyByZXR1cm5lZCBiYWNrLlxuICAgICAqIEBwYXJhbSAge0Zvcm1EYXRhfSBmb3JtRGF0YSBvYmplY3QgdG8gc2VyaWFsaXplXG4gICAgICogQHJldHVybnMge29iamVjdH0gcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggYSBtYXAuXG4gICAgICovXG4gICAgcHVibGljIHNlcmlhbGl6ZShmb3JtRGF0YTogYW55KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcmlhbGl6ZUZvcm1EYXRhVG9NYXAoZm9ybURhdGEpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgYmxvYiB0byBhIGxvY2FsIGZpbGVcbiAgICAgKiBAcGFyYW0gYmxvYlxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIHByaXZhdGUgc2F2ZUJsb2JUb0ZpbGUoYmxvYjogYW55KSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gdGhpcy5kZXZpY2VGaWxlU2VydmljZS5hcHBlbmRUb0ZpbGVOYW1lKGJsb2IubmFtZSksXG4gICAgICAgICAgICB1cGxvYWREaXIgPSB0aGlzLmRldmljZUZpbGVTZXJ2aWNlLmdldFVwbG9hZERpcmVjdG9yeSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLndyaXRlRmlsZSh1cGxvYWREaXIsIGZpbGVOYW1lLCBibG9iKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ25hbWUnIDogYmxvYi5uYW1lLFxuICAgICAgICAgICAgICAgICd0eXBlJyA6IGJsb2IudHlwZSxcbiAgICAgICAgICAgICAgICAnbGFzdE1vZGlmaWVkJyA6IGJsb2IubGFzdE1vZGlmaWVkLFxuICAgICAgICAgICAgICAgICdsYXN0TW9kaWZpZWREYXRlJyA6IGJsb2IubGFzdE1vZGlmaWVkRGF0ZSxcbiAgICAgICAgICAgICAgICAnc2l6ZScgOiBibG9iLnNpemUsXG4gICAgICAgICAgICAgICAgJ3dtTG9jYWxQYXRoJyA6IHVwbG9hZERpciArICcvJyArIGZpbGVOYW1lXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBmb3JtIGRhdGEgb2JqZWN0IHRvIG1hcCBmb3Igc3RvcmluZyByZXF1ZXN0IGluIGxvY2FsIGRhdGFiYXNlLi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHNlcmlhbGl6ZUZvcm1EYXRhVG9NYXAoZm9ybURhdGEpIHtcbiAgICAgICAgY29uc3QgYmxvYkNvbHVtbnMgPSBfLmZpbHRlcih0aGlzLmVudGl0eVNjaGVtYS5jb2x1bW5zLCB7XG4gICAgICAgICAgICAgICAgJ3NxbFR5cGUnIDogJ2Jsb2InXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHByb21pc2VzID0gW107XG4gICAgICAgIGxldCBtYXAgPSB7fTtcbiAgICAgICAgaWYgKGZvcm1EYXRhICYmIHR5cGVvZiBmb3JtRGF0YS5hcHBlbmQgPT09ICdmdW5jdGlvbicgJiYgZm9ybURhdGEucm93RGF0YSkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKGZvcm1EYXRhLnJvd0RhdGEsIChmaWVsZERhdGEsIGZpZWxkTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChmaWVsZERhdGEgJiYgXy5maW5kKGJsb2JDb2x1bW5zLCB7J2ZpZWxkTmFtZScgOiBmaWVsZE5hbWV9KSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuc2F2ZUJsb2JUb0ZpbGUoZmllbGREYXRhKS50aGVuKGxvY2FsRmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBbZmllbGROYW1lXSA9IGxvY2FsRmlsZTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcFtmaWVsZE5hbWVdID0gZmllbGREYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWFwID0gZm9ybURhdGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKCgpID0+IG1hcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgbWFwIG9iamVjdCBiYWNrIHRvIGZvcm0gZGF0YS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGRlc2VyaWFsaXplTWFwVG9Gb3JtRGF0YShtYXApIHtcbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKSxcbiAgICAgICAgICAgIGJsb2JDb2x1bW5zID0gdGhpcy5lbnRpdHlTY2hlbWEuY29sdW1ucy5maWx0ZXIoYyA9PiBjLnNxbFR5cGUgPT09ICdibG9iJyksXG4gICAgICAgICAgICBwcm9taXNlcyA9IFtdO1xuICAgICAgICBfLmZvckVhY2goYmxvYkNvbHVtbnMsIGNvbHVtbiA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG1hcFtjb2x1bW4uZmllbGROYW1lXTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS53bUxvY2FsUGF0aCkge1xuICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2goY29udmVydFRvQmxvYih2YWx1ZS53bUxvY2FsUGF0aClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IGZvcm1EYXRhLmFwcGVuZChjb2x1bW4uZmllbGROYW1lLCByZXN1bHQuYmxvYiwgdmFsdWUubmFtZSkpKTtcbiAgICAgICAgICAgICAgICBtYXBbY29sdW1uLmZpZWxkTmFtZV0gPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZChTV0FHR0VSX0NPTlNUQU5UUy5XTV9EQVRBX0pTT04sIG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeShtYXApXSwge1xuICAgICAgICAgICAgdHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKCgpID0+IGZvcm1EYXRhKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVRhYmxlU3FsKHNjaGVtYSkge1xuICAgICAgICBjb25zdCBmaWVsZFN0ciA9IF8ucmVkdWNlKHNjaGVtYS5jb2x1bW5zLCAocmVzdWx0LCBmKSA9PiB7XG4gICAgICAgICAgICBsZXQgc3RyID0gZXNjYXBlTmFtZShmLm5hbWUpO1xuICAgICAgICAgICAgaWYgKGYucHJpbWFyeUtleSkge1xuICAgICAgICAgICAgICAgIGlmIChmLnNxbFR5cGUgPT09ICdudW1iZXInICYmIGYuZ2VuZXJhdG9yVHlwZSA9PT0gJ2RhdGFiYXNlSWRlbnRpdHknKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ciArPSAnIElOVEVHRVIgUFJJTUFSWSBLRVkgQVVUT0lOQ1JFTUVOVCc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RyICs9ICcgUFJJTUFSWSBLRVknO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQgPyByZXN1bHQgKyAnLCcgKyBzdHIgOiBzdHI7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAke2VzY2FwZU5hbWUoc2NoZW1hLm5hbWUpfSAoJHtmaWVsZFN0cn0pYDtcbiAgICB9XG59XG4iXX0=