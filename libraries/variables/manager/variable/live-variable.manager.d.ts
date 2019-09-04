import { BaseVariableManager } from './base-variable.manager';
export declare class LiveVariableManager extends BaseVariableManager {
    initFilterExpressionBinding(variable: any): void;
    private updateDataset;
    private setVariableOptions;
    private handleError;
    /**
     * Traverses recursively the filterExpressions object and if there is any required field present with no value,
     * then we will return without proceeding further. Its upto the developer to provide the mandatory value,
     * if he wants to assign it in teh onbefore<delete/insert/update>function then make that field in
     * the filter query section as optional
     * @param filterExpressions - recursive rule Object
     * @returns {Object} object or boolean. Object if everything gets validated or else just boolean indicating failure in the validations
     */
    private getFilterExprFields;
    /**
     * Allows the user to get the criteria of filtering and the filter fields, based on the method called
     */
    private getDataFilterObj;
    private makeCall;
    private getEntityData;
    private performCUD;
    private doCUD;
    private aggregateData;
    /**
     * Makes http call for a Live Variable against the configured DB Entity.
     * Gets the paginated records against the entity
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}: will be resolved on successful data fetch
     */
    listRecords(variable: any, options: any, success: any, error: any): Promise<{}>;
    /**
     * Makes a POST http call for a Live Variable against the configured DB Entity.
     * Sends a Table record object with the request body
     * the record is inserted into the entity at the backend
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}: will be resolved on successful data fetch
     */
    insertRecord(variable: any, options: any, success: any, error: any): Promise<{}>;
    /**
     * Makes a PUT http call for a Live Variable against the configured DB Entity.
     * Sends a Table record object with the request body against the primary key of an existing record
     * the record is updated into the entity at the backend
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}: will be resolved on successful data fetch
     */
    updateRecord(variable: any, options: any, success: any, error: any): Promise<{}>;
    /**
     * Makes a DELETE http call for a Live Variable against the configured DB Entity.
     * Sends the primary key of an existing record
     * the record is deleted from the entity at the backend
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}: will be resolved on successful data fetch
     */
    deleteRecord(variable: any, options: any, success: any, error: any): Promise<{}>;
    /**
     * sets the value against passed key on the "inputFields" object in the variable
     * @param variable
     * @param key: can be:
     *  - a string e.g. "username"
     *  - an object, e.g. {"username": "john", "ssn": "11111"}
     * @param val
     * - if key is string, the value against it (for that data type)
     * - if key is object, not required
     * @param options
     * @returns {any}
     */
    setInput(variable: any, key: any, val: any, options: any): any;
    /**
     * sets the value against passed key on the "filterFields" object in the variable
     * @param variable
     * @param key: can be:
     *  - a string e.g. "username"
     *  - an object, e.g. {"username": "john", "ssn": "11111"}
     * @param val
     * - if key is string, the value against it (for that data type)
     * - if key is object, not required
     * @param options
     * @returns {any}
     */
    setFilter(variable: any, key: any, val: any): any;
    /**
     * Makes a file download call for a table
     * @param variable
     * @param options
     */
    download(variable: any, options: any, successHandler: any, errorHandler: any): Promise<{}>;
    /**
     * gets primary keys against the passed related Table
     * @param variable
     * @param relatedField
     * @returns {any}
     */
    getRelatedTablePrimaryKeys(variable: any, relatedField: any): any;
    /**
     * Makes HTTP call to get the data for related entity of a field in an entity
     * @param variable
     * @param columnName
     * @param options
     * @param success
     * @param error
     */
    getRelatedTableData(variable: any, columnName: any, options: any, success: any, error: any): Promise<{}>;
    /**
     * Gets the distinct records for an entity
     * @param variable
     * @param options
     * @param success
     * @param error
     */
    getDistinctDataByFields(variable: any, options: any, success: any, error: any): Promise<{}>;
    getAggregatedData(variable: any, options: any, success: any, error: any): Promise<{}>;
    defineFirstLastRecord(variable: any): void;
    getPrimaryKey(variable: any): any;
    prepareRequestParams(options: any): any;
    /**
     * Gets the filtered records based on searchKey
     * @param variable
     * @param options contains the searchKey and queryText
     * @param success
     * @param error
     * @returns {Promise<any>}
     */
    searchRecords(variable: any, options: any, success: any, error: any): Promise<{}>;
    /**
     * used in onBeforeUpdate call - called last in the function - used in old Variables using dataBinding.
     * This function migrates the old data dataBinding to filterExpressions equivalent format
     * @param variable
     * @param inputData
     * @private
     */
    upgradeInputDataToFilterExpressions(variable: any, response: any, inputData: any): any;
    /**
     * used in onBeforeUpdate call - called first in the function - used in old Variables using dataBinding.
     * This function migrates the filterExpressions object to flat map structure
     * @param variable
     * @param inputData
     * @private
     */
    downgradeFilterExpressionsToInputData(variable: any, inputData: any): any;
    cancel(variable: any, options: any): void;
}
