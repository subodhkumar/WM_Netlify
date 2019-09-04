import { File } from '@ionic-native/file';
import { SQLiteObject } from '@ionic-native/sqlite';
import { DeviceFileService } from '@wm/mobile/core';
import { ColumnInfo, EntityInfo } from './config';
import { LocalDBManagementService } from '../services/local-db-management.service';
export interface FilterCriterion {
    attributeName: string;
    attributeValue: any;
    attributeType: string;
    filterCondition: string;
}
export interface Pagination {
    offset: number;
    limit: number;
}
export declare class LocalDBStore {
    private deviceFileService;
    readonly entitySchema: EntityInfo;
    private file;
    private localDbManagementService;
    private sqliteObject;
    readonly primaryKeyField: ColumnInfo;
    readonly primaryKeyName: string;
    readonly fieldToColumnMapping: object;
    private insertRecordSqlTemplate;
    private replaceRecordSqlTemplate;
    private deleteRecordTemplate;
    private selectSqlTemplate;
    private countQuery;
    constructor(deviceFileService: DeviceFileService, entitySchema: EntityInfo, file: File, localDbManagementService: LocalDBManagementService, sqliteObject: SQLiteObject);
    add(entity: any): Promise<any>;
    /**
     * clears all data of this store.
     * @returns {object} promise
     */
    clear(): Promise<any>;
    /**
     * creates the stores if it does not exist
     * @returns {Promise<any>}
     */
    create(): Promise<any>;
    /**
     * counts the number of records that satisfy the given filter criteria.
     * @param {FilterCriterion[]} filterCriteria
     * @returns {object} promise that is resolved with count
     */
    count(filterCriteria?: FilterCriterion[]): Promise<number>;
    /**
     * This function deserializes the given map object to FormData, provided that map object was
     * serialized by using serialize method of this store.
     * @param  {object} map object to deserialize
     * @returns {object} promise that is resolved with the deserialized FormData.
     */
    deserialize(map: any): Promise<FormData>;
    /**
     * filters data of this store that statisfy the given filter criteria.
     * @param {FilterCriterion[]} filterCriteria
     * @param  {string=} sort ex: 'filedname asc/desc'
     * @param  {object=} page {'offset' : 0, "limit" : 20}
     * @returns {object} promise that is resolved with the filtered data.
     */
    filter(filterCriteria?: FilterCriterion[], sort?: string, page?: Pagination): Promise<any[]>;
    refresh(data: any): Promise<any>;
    /**
     * deletes the record with the given primary key.
     * @param  {object} primaryKey primary key of the record
     * @returns {object} promise
     */
    delete(primaryKey: any): Promise<any>;
    /**
     * finds the record with the given primary key.
     * @param  {object} primaryKey primary key of the record
     * @returns {object} promise that is resolved with entity
     */
    get(primaryKey: any): Promise<any>;
    /**
     * retrieve the value for the given field.
     *
     * @param entity
     * @param {string} fieldName
     * @returns {undefined | any | number}
     */
    getValue(entity: any, fieldName: string): any;
    /**
     * saves the given entity to the store. If the record is not available, then a new record will be created.
     * @param {object} entity the entity to save
     * @returns {object} promise
     */
    save(entity: any): Promise<any>;
    /**
     * saves the given entity to the store. If the record is not available, then a new record will be created.
     * @param {object} entities the entity to save
     * @returns {object} promise
     */
    saveAll(entities: any[]): Promise<any>;
    /**
     * Based on this store columns, this function converts the given FormData to a map object.
     * Multipart file is stored as a local file. If form data cannot be serialized,
     * then formData is returned back.
     * @param  {FormData} formData object to serialize
     * @returns {object} promise that is resolved with a map.
     */
    serialize(formData: any): Promise<{}>;
    /**
     * Save blob to a local file
     * @param blob
     * @returns {*}
     */
    private saveBlobToFile;
    /**
     * Converts form data object to map for storing request in local database..
     */
    private serializeFormDataToMap;
    /**
     * Converts map object back to form data.
     */
    private deserializeMapToFormData;
    private createTableSql;
}
