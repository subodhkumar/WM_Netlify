import { $invokeWatchers, getClonedObject, isDateTimeType, isDefined, processFilterExpBindNode, triggerFn } from '@wm/core';
import { BaseVariableManager } from './base-variable.manager';
import { debounceVariableCall, formatExportExpression, initiateCallback, setInput, appManager, httpService, formatDate } from '../../util/variable/variables.utils';
import { LiveVariableUtils } from '../../util/variable/live-variable.utils';
import { $queue } from '../../util/inflight-queue';
import { $rootScope, CONSTANTS, VARIABLE_CONSTANTS, DB_CONSTANTS } from '../../constants/variables.constants';
import { generateConnectionParams } from '../../util/variable/live-variable.http.utils';
const emptyArr = [];
export class LiveVariableManager extends BaseVariableManager {
    constructor() {
        super(...arguments);
        /**
         * Traverses recursively the filterExpressions object and if there is any required field present with no value,
         * then we will return without proceeding further. Its upto the developer to provide the mandatory value,
         * if he wants to assign it in teh onbefore<delete/insert/update>function then make that field in
         * the filter query section as optional
         * @param filterExpressions - recursive rule Object
         * @returns {Object} object or boolean. Object if everything gets validated or else just boolean indicating failure in the validations
         */
        this.getFilterExprFields = function (filterExpressions) {
            let isRequiredFieldAbsent = false;
            const traverseCallbackFn = function (parentFilExpObj, filExpObj) {
                if (filExpObj
                    && filExpObj.required
                    && ((_.indexOf(['null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'], filExpObj.matchMode) === -1) && filExpObj.value === '')) {
                    isRequiredFieldAbsent = true;
                    return false;
                }
            };
            LiveVariableUtils.traverseFilterExpressions(filterExpressions, traverseCallbackFn);
            return isRequiredFieldAbsent ? !isRequiredFieldAbsent : filterExpressions;
        };
        /**
         * Allows the user to get the criteria of filtering and the filter fields, based on the method called
         */
        this.getDataFilterObj = function (clonedFilterFields) {
            return (function (clonedFields) {
                function getCriteria(filterField) {
                    const criterian = [];
                    LiveVariableUtils.traverseFilterExpressions(clonedFields, function (filterExpressions, criteria) {
                        if (filterField === criteria.target) {
                            criterian.push(criteria);
                        }
                    });
                    return criterian;
                }
                function getFilterFields() {
                    return clonedFields;
                }
                return {
                    getFilterFields: getFilterFields,
                    getCriteria: getCriteria
                };
            }(clonedFilterFields));
        };
    }
    initFilterExpressionBinding(variable) {
        const context = variable._context;
        const destroyFn = context.registerDestroyListener ? context.registerDestroyListener.bind(context) : _.noop;
        const filterSubscription = processFilterExpBindNode(context, variable.filterExpressions).subscribe((response) => {
            if (variable.operation === 'read') {
                /* if auto-update set for the variable with read operation only, get its data */
                if (variable.autoUpdate && !_.isUndefined(response.newVal) && _.isFunction(variable.update)) {
                    debounceVariableCall(variable, 'update');
                }
            }
            else {
                /* if auto-update set for the variable with read operation only, get its data */
                if (variable.autoUpdate && !_.isUndefined(response.newVal) && _.isFunction(variable[variable.operation + 'Record'])) {
                    debounceVariableCall(variable, variable.operation + 'Record');
                }
            }
        });
        destroyFn(() => filterSubscription.unsubscribe());
    }
    updateDataset(variable, data, propertiesMap, pagination) {
        variable.pagination = pagination;
        variable.dataSet = data;
        // legacy properties in dataSet, [data, pagination]
        Object.defineProperty(variable.dataSet, 'data', {
            get: () => {
                return variable.dataSet;
            }
        });
        Object.defineProperty(variable.dataSet, 'pagination', {
            get: () => {
                return variable.pagination;
            }
        });
    }
    // Set the _options on variable which can be used by the widgets
    setVariableOptions(variable, options) {
        variable._options = variable._options || {};
        variable._options.orderBy = options && options.orderBy;
        variable._options.filterFields = options && options.filterFields;
    }
    handleError(variable, errorCB, response, options, advancedOptions) {
        let opt;
        /* If callback function is provided, send the data to the callback.
         * The same callback if triggered in case of error also. The error-handling is done in grid.js*/
        triggerFn(errorCB, response);
        //  EVENT: ON_RESULT
        initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, response, advancedOptions);
        /* update the dataSet against the variable */
        if (!options.skipDataSetUpdate) {
            this.updateDataset(variable, emptyArr, variable.propertiesMap, null);
        }
        //  EVENT: ON_ERROR
        opt = this.prepareCallbackOptions(options.errorDetails);
        initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response, opt);
        //  EVENT: ON_CAN_UPDATE
        variable.canUpdate = true;
        initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, response, advancedOptions);
    }
    makeCall(variable, dbOperation, params) {
        const successHandler = (response, resolve) => {
            if (response && response.type) {
                resolve(response);
            }
        };
        const errorHandler = (error, reject) => {
            const errMsg = httpService.getErrMessage(error);
            // notify variable error
            this.notifyInflight(variable, false);
            reject({
                error: errMsg,
                details: error
            });
        };
        return new Promise((resolve, reject) => {
            let reqParams = generateConnectionParams(params, dbOperation);
            reqParams = {
                url: reqParams.url,
                method: reqParams.method,
                data: reqParams.data,
                headers: reqParams.headers
            };
            params.operation = dbOperation;
            this.httpCall(reqParams, variable, params).then((response) => {
                successHandler(response, resolve);
            }, (e) => {
                errorHandler(e, reject);
            });
        });
    }
    getEntityData(variable, options, success, error) {
        const dataObj = {};
        let tableOptions, dbOperation, output, newDataSet, clonedFields, requestData, dbOperationOptions, getEntitySuccess, getEntityError;
        // empty array kept (if variable is not of read type filterExpressions will be undefined)
        clonedFields = this.getFilterExprFields(getClonedObject(variable.filterExpressions || {}));
        // clonedFields = getClonedObject(variable.filterFields);
        //  EVENT: ON_BEFORE_UPDATE
        output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, this.getDataFilterObj(clonedFields), options);
        // if filterFields are updated or modified inside the onBeforeUpdate event then in device use these fields to filter.
        const updateFilterFields = _.isObject(output) ? getClonedObject(output) : undefined;
        if (output === false) {
            $queue.process(variable);
            // $rootScope.$emit('toggle-variable-state', variable, false);
            triggerFn(error, 'Call stopped from the event: ' + VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE);
            return Promise.reject('Call stopped from the event: ' + VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE);
        }
        variable.canUpdate = false;
        tableOptions = LiveVariableUtils.prepareTableOptions(variable, options, _.isObject(output) ? output : clonedFields);
        //  if tableOptions object has query then set the dbOperation to 'searchTableDataWithQuery'
        if (options.searchWithQuery) {
            dbOperation = 'searchTableDataWithQuery';
            requestData = tableOptions.query ? ('q=' + tableOptions.query) : '';
        }
        else {
            dbOperation = (tableOptions.filter && tableOptions.filter.length) ? 'searchTableData' : 'readTableData';
            requestData = tableOptions.filter;
        }
        dbOperationOptions = {
            'projectID': $rootScope.project.id,
            'service': variable.getPrefabName() ? '' : 'services',
            'dataModelName': variable.liveSource,
            'entityName': variable.type,
            'page': options.page || 1,
            'size': options.pagesize || (CONSTANTS.isRunMode ? (variable.maxResults || 20) : (variable.designMaxResults || 20)),
            'sort': tableOptions.sort,
            'data': requestData,
            'filter': LiveVariableUtils.getWhereClauseGenerator(variable, options, updateFilterFields),
            // 'filterMeta': tableOptions.filter,
            'url': variable.getPrefabName() ? ($rootScope.project.deployedUrl + '/prefabs/' + variable.getPrefabName()) : $rootScope.project.deployedUrl
        };
        getEntitySuccess = (response, resolve) => {
            if (response && response.type) {
                response = response.body;
                dataObj.data = response.content;
                dataObj.pagination = _.omit(response, 'content');
                const advancedOptions = this.prepareCallbackOptions(response, { pagination: dataObj.pagination });
                if ((response && response.error) || !response || !_.isArray(response.content)) {
                    this.handleError(variable, error, response.error, options, advancedOptions);
                    return Promise.reject(response.error);
                }
                LiveVariableUtils.processBlobColumns(response.content, variable);
                if (!options.skipDataSetUpdate) {
                    //  EVENT: ON_RESULT
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, dataObj.data, advancedOptions);
                    //  EVENT: ON_PREPARESETDATA
                    newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, dataObj.data, advancedOptions);
                    if (newDataSet) {
                        // setting newDataSet as the response to service variable onPrepareSetData
                        dataObj.data = newDataSet;
                    }
                    /* update the dataSet against the variable */
                    this.updateDataset(variable, dataObj.data, variable.propertiesMap, dataObj.pagination);
                    this.setVariableOptions(variable, options);
                    // watchers should get triggered before calling onSuccess event.
                    // so that any variable/widget depending on this variable's data is updated
                    $invokeWatchers(true);
                    setTimeout(() => {
                        // if callback function is provided, send the data to the callback
                        triggerFn(success, dataObj.data, variable.propertiesMap, dataObj.pagination);
                        //  EVENT: ON_SUCCESS
                        initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, dataObj.data, advancedOptions);
                        //  EVENT: ON_CAN_UPDATE
                        variable.canUpdate = true;
                        initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, dataObj.data, advancedOptions);
                    });
                }
                return resolve({ data: dataObj.data, pagination: dataObj.pagination });
            }
        };
        getEntityError = (e, reject) => {
            this.setVariableOptions(variable, options);
            this.handleError(variable, error, e.error, _.extend(options, { errorDetails: e.details }));
            return reject(e.error);
        };
        /* if it is a prefab variable (used in a normal project), modify the url */
        /*Fetch the table data*/
        return new Promise((resolve, reject) => {
            this.makeCall(variable, dbOperation, dbOperationOptions).then((response) => {
                getEntitySuccess(response, resolve);
            }, err => {
                getEntityError(err, reject);
            });
        });
    }
    performCUD(operation, variable, options, success, error) {
        options = options || {};
        options.inputFields = options.inputFields || getClonedObject(variable.inputFields);
        return $queue.submit(variable).then(() => {
            this.notifyInflight(variable, !options.skipToggleState);
            return this.doCUD(operation, variable, options, success, error)
                .then((response) => {
                $queue.process(variable);
                this.notifyInflight(variable, false, response);
                return Promise.resolve(response);
            }, (err) => {
                $queue.process(variable);
                this.notifyInflight(variable, false, err);
                return Promise.reject(err);
            });
        }, error);
    }
    doCUD(action, variable, options, success, error) {
        const projectID = $rootScope.project.id || $rootScope.projectName, primaryKey = LiveVariableUtils.getPrimaryKey(variable), isFormDataSupported = (window.File && window.FileReader && window.FileList && window.Blob);
        let dbName, compositeId = '', rowObject = {}, prevData, compositeKeysData = {}, prevCompositeKeysData = {}, id, columnName, clonedFields, output, onCUDerror, onCUDsuccess, inputFields = options.inputFields || variable.inputFields;
        // EVENT: ON_BEFORE_UPDATE
        clonedFields = getClonedObject(inputFields);
        output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, clonedFields, options);
        if (output === false) {
            // $rootScope.$emit('toggle-variable-state', variable, false);
            triggerFn(error);
            return Promise.reject('Call stopped from the event: ' + VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE);
        }
        inputFields = _.isObject(output) ? output : clonedFields;
        variable.canUpdate = false;
        if (options.row) {
            rowObject = options.row;
            // For datetime types, convert the value to the format accepted by backend
            _.forEach(rowObject, (value, key) => {
                const fieldType = LiveVariableUtils.getFieldType(key, variable);
                let fieldValue;
                if (isDateTimeType(fieldType)) {
                    fieldValue = formatDate(value, fieldType);
                    rowObject[key] = fieldValue;
                }
                else if (_.isArray(value) && LiveVariableUtils.isStringType(fieldType)) {
                    // Construct ',' separated string if param is not array type but value is an array
                    fieldValue = _.join(value, ',');
                    rowObject[key] = fieldValue;
                }
            });
            // Merge inputFields along with dataObj while making Insert/Update/Delete
            _.forEach(inputFields, (attrValue, attrName) => {
                if ((isDefined(attrValue) && attrValue !== '') && (!isDefined(rowObject[attrName]) || rowObject[attrName] === '')) {
                    rowObject[attrName] = attrValue;
                }
            });
        }
        else {
            _.forEach(inputFields, (fieldValue, fieldName) => {
                let fieldType;
                const primaryKeys = variable.propertiesMap.primaryFields || variable.propertiesMap.primaryKeys;
                if (!_.isUndefined(fieldValue) && fieldValue !== '') {
                    /*For delete action, the inputFields need to be set in the request URL. Hence compositeId is set.
                     * For insert action inputFields need to be set in the request data. Hence rowObject is set.
                     * For update action, both need to be set.*/
                    if (action === 'deleteTableData') {
                        compositeId = fieldValue;
                    }
                    if (action === 'updateTableData') {
                        primaryKeys.forEach(key => {
                            if (fieldName === key) {
                                compositeId = fieldValue;
                            }
                        });
                    }
                    if (action !== 'deleteTableData' || LiveVariableUtils.isCompositeKey(primaryKey)) {
                        fieldType = LiveVariableUtils.getFieldType(fieldName, variable);
                        if (isDateTimeType(fieldType)) {
                            fieldValue = formatDate(fieldValue, fieldType);
                        }
                        else if (_.isArray(fieldValue) && LiveVariableUtils.isStringType(fieldType)) {
                            // Construct ',' separated string if param is not array type but value is an array
                            fieldValue = _.join(fieldValue, ',');
                        }
                        rowObject[fieldName] = fieldValue;
                    }
                    // for related entities, clear the blob type fields
                    if (_.isObject(fieldValue) && !_.isArray(fieldValue)) {
                        _.forEach(fieldValue, (val, key) => {
                            if (LiveVariableUtils.getFieldType(fieldName, variable, key) === 'blob') {
                                fieldValue[key] = val === null ? val : '';
                            }
                        });
                    }
                }
            });
        }
        switch (action) {
            case 'updateTableData':
                prevData = options.prevData || {};
                /*Construct the "requestData" based on whether the table associated with the live-variable has a composite key or not.*/
                if (LiveVariableUtils.isCompositeKey(primaryKey)) {
                    if (LiveVariableUtils.isNoPrimaryKey(primaryKey)) {
                        prevCompositeKeysData = prevData || options.rowData || rowObject;
                        compositeKeysData = rowObject;
                    }
                    else {
                        primaryKey.forEach(key => {
                            compositeKeysData[key] = rowObject[key];
                            // In case of periodic update for Business temporal fields, passing updated field data.
                            if (options.period) {
                                prevCompositeKeysData[key] = rowObject[key];
                            }
                            else {
                                prevCompositeKeysData[key] = prevData[key] || (options.rowData && options.rowData[key]) || rowObject[key];
                            }
                        });
                    }
                    options.row = compositeKeysData;
                    options.compositeKeysData = prevCompositeKeysData;
                }
                else {
                    primaryKey.forEach((key) => {
                        if (key.indexOf('.') === -1) {
                            id = prevData[key] || (options.rowData && options.rowData[key]) || rowObject[key];
                        }
                        else {
                            columnName = key.split('.');
                            id = prevData[columnName[0]][columnName[1]];
                        }
                    });
                    options.id = id;
                    options.row = rowObject;
                }
                break;
            case 'deleteTableData':
                /*Construct the "requestData" based on whether the table associated with the live-variable has a composite key or not.*/
                if (LiveVariableUtils.isCompositeKey(primaryKey)) {
                    if (LiveVariableUtils.isNoPrimaryKey(primaryKey)) {
                        compositeKeysData = rowObject;
                    }
                    else {
                        primaryKey.forEach(key => {
                            compositeKeysData[key] = rowObject[key];
                        });
                    }
                    options.compositeKeysData = compositeKeysData;
                }
                else if (!_.isEmpty(rowObject)) {
                    primaryKey.forEach(key => {
                        if (key.indexOf('.') === -1) {
                            id = rowObject[key];
                        }
                        else {
                            columnName = key.split('.');
                            id = rowObject[columnName[0]][columnName[1]];
                        }
                    });
                    options.id = id;
                }
                break;
            default:
                break;
        }
        // If table has blob column then send multipart data
        if ((action === 'updateTableData' || action === 'insertTableData') && LiveVariableUtils.hasBlob(variable) && isFormDataSupported) {
            if (action === 'updateTableData') {
                action = 'updateMultiPartTableData';
            }
            else {
                action = 'insertMultiPartTableData';
            }
            rowObject = LiveVariableUtils.prepareFormData(variable, rowObject);
        }
        /*Check if "options" have the "compositeKeysData" property.*/
        if (options.compositeKeysData) {
            switch (action) {
                case 'updateTableData':
                    action = 'updateCompositeTableData';
                    break;
                case 'deleteTableData':
                    action = 'deleteCompositeTableData';
                    break;
                case 'updateMultiPartTableData':
                    action = 'updateMultiPartCompositeTableData';
                    break;
                default:
                    break;
            }
            compositeId = LiveVariableUtils.getCompositeIDURL(options.compositeKeysData);
        }
        dbName = variable.liveSource;
        /*Set the "data" in the request to "undefined" if there is no data.
        * This handles cases such as "Delete" requests where data should not be passed.*/
        if (_.isEmpty(rowObject) && action === 'deleteTableData') {
            rowObject = undefined;
        }
        if ((action === 'updateCompositeTableData' || action === 'deleteCompositeTableData') && options.period) {
            // capitalize first character
            action = 'period' + action.charAt(0).toUpperCase() + action.substr(1);
        }
        const dbOperations = {
            'projectID': projectID,
            'service': variable._prefabName ? '' : 'services',
            'dataModelName': dbName,
            'entityName': variable.type,
            'id': !_.isUndefined(options.id) ? encodeURIComponent(options.id) : compositeId,
            'data': rowObject,
            'url': variable._prefabName ? ($rootScope.project.deployedUrl + '/prefabs/' + variable._prefabName) : $rootScope.project.deployedUrl
        };
        onCUDerror = (response, reject) => {
            const errMsg = response.error;
            const advancedOptions = this.prepareCallbackOptions(response);
            // EVENT: ON_RESULT
            initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, errMsg, advancedOptions);
            // EVENT: ON_ERROR
            if (!options.skipNotification) {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, errMsg, advancedOptions);
            }
            // EVENT: ON_CAN_UPDATE
            variable.canUpdate = true;
            initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, errMsg, advancedOptions);
            triggerFn(error, errMsg);
            reject(errMsg);
        };
        onCUDsuccess = (data, resolve) => {
            let response = data.body;
            const advancedOptions = this.prepareCallbackOptions(data);
            $queue.process(variable);
            /* if error received on making call, call error callback */
            if (response && response.error) {
                // EVENT: ON_RESULT
                initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, response, advancedOptions);
                // EVENT: ON_ERROR
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response.error, advancedOptions);
                // EVENT: ON_CAN_UPDATE
                variable.canUpdate = true;
                initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, response.error, advancedOptions);
                triggerFn(error, response.error);
                return Promise.reject(response.error);
            }
            // EVENT: ON_RESULT
            initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, response, advancedOptions);
            if (variable.operation !== 'read') {
                // EVENT: ON_PREPARESETDATA
                const newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, response, advancedOptions);
                if (newDataSet) {
                    // setting newDataSet as the response to service variable onPrepareSetData
                    response = newDataSet;
                }
                variable.dataSet = response;
            }
            // watchers should get triggered before calling onSuccess event.
            // so that any variable/widget depending on this variable's data is updated
            $invokeWatchers(true);
            setTimeout(() => {
                // EVENT: ON_SUCCESS
                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, response, advancedOptions);
                // EVENT: ON_CAN_UPDATE
                variable.canUpdate = true;
                initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, response, advancedOptions);
            });
            triggerFn(success, response);
            resolve(response);
        };
        return new Promise((resolve, reject) => {
            this.makeCall(variable, action, dbOperations).then(data => {
                onCUDsuccess(data, resolve);
            }, response => {
                onCUDerror(response, reject);
            });
        });
    }
    aggregateData(deployedUrl, variable, options, success, error) {
        let tableOptions, dbOperationOptions, aggregateDataSuccess, aggregateDataError;
        const dbOperation = 'executeAggregateQuery';
        options = options || {};
        options.skipEncode = true;
        if (variable.filterFields) {
            tableOptions = LiveVariableUtils.prepareTableOptions(variable, options);
            options.aggregations.filter = tableOptions.query;
        }
        dbOperationOptions = {
            'dataModelName': variable.liveSource,
            'entityName': variable.type,
            'page': options.page || 1,
            'size': options.size || variable.maxResults,
            'sort': options.sort || '',
            'url': deployedUrl,
            'data': options.aggregations
        };
        aggregateDataSuccess = (response, resolve) => {
            if (response && response.type) {
                if ((response && response.error) || !response) {
                    triggerFn(error, response.error);
                    return;
                }
                triggerFn(success, response);
                resolve(response);
            }
        };
        aggregateDataError = (errorMsg, reject) => {
            triggerFn(error, errorMsg);
            reject(errorMsg);
        };
        return new Promise((resolve, reject) => {
            this.makeCall(variable, dbOperation, dbOperationOptions).then((response) => {
                aggregateDataSuccess(response, resolve);
            }, err => {
                aggregateDataError(err, reject);
            });
        });
    }
    // *********************************************************** PUBLIC ***********************************************************//
    /**
     * Makes http call for a Live Variable against the configured DB Entity.
     * Gets the paginated records against the entity
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}: will be resolved on successful data fetch
     */
    listRecords(variable, options, success, error) {
        options = options || {};
        options.filterFields = options.filterFields || getClonedObject(variable.filterFields);
        return $queue.submit(variable).then(() => {
            this.notifyInflight(variable, !options.skipToggleState);
            return this.getEntityData(variable, options, success, error)
                .then((response) => {
                $queue.process(variable);
                this.notifyInflight(variable, false, response);
                return Promise.resolve(response);
            }, (err) => {
                $queue.process(variable);
                this.notifyInflight(variable, false, err);
                return Promise.reject(err);
            });
        }, error);
    }
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
    insertRecord(variable, options, success, error) {
        return this.performCUD('insertTableData', variable, options, success, error);
    }
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
    updateRecord(variable, options, success, error) {
        return this.performCUD('updateTableData', variable, options, success, error);
    }
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
    deleteRecord(variable, options, success, error) {
        return this.performCUD('deleteTableData', variable, options, success, error);
    }
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
    setInput(variable, key, val, options) {
        variable.inputFields = variable.inputFields || {};
        return setInput(variable.inputFields, key, val, options);
    }
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
    setFilter(variable, key, val) {
        let paramObj = {}, targetObj = {};
        if (_.isObject(key)) {
            paramObj = key;
        }
        else {
            paramObj[key] = val;
        }
        if (!variable.filterExpressions) {
            variable.filterExpressions = { 'condition': 'AND', 'rules': [] };
        }
        targetObj = variable.filterExpressions;
        // find the existing criteria if present or else return null. Find the first one and return.
        // If the user wants to set a different object, then he has to use the getCriteria API defined
        // on the dataFilter object passed to the onBeforeListRecords
        function getExistingCriteria(filterField) {
            let existingCriteria = null;
            LiveVariableUtils.traverseFilterExpressions(targetObj, function (filterExpressions, criteria) {
                if (filterField === criteria.target) {
                    return existingCriteria = criteria;
                }
            });
            return existingCriteria;
        }
        _.forEach(paramObj, function (paramVal, paramKey) {
            const existingCriteria = getExistingCriteria(paramKey);
            if (existingCriteria !== null) {
                existingCriteria.value = paramVal;
            }
            else {
                targetObj.rules.push({
                    target: paramKey,
                    type: '',
                    matchMode: '',
                    value: paramVal,
                    required: false
                });
            }
        });
        return targetObj;
    }
    /**
     * Makes a file download call for a table
     * @param variable
     * @param options
     */
    download(variable, options, successHandler, errorHandler) {
        options = options || {};
        let tableOptions, dbOperationOptions, downloadSuccess, downloadError;
        const data = {};
        const dbOperation = 'exportTableData';
        const projectID = $rootScope.project.id || $rootScope.projectName;
        options.data.searchWithQuery = true; // For export, query api is used. So set this flag to true
        options.data.skipEncode = true;
        tableOptions = LiveVariableUtils.prepareTableOptions(variable, options.data, undefined);
        data.query = tableOptions.query ? tableOptions.query : '';
        data.exportSize = options.data.exportSize;
        data.exportType = options.data.exportType;
        data.fields = formatExportExpression(options.data.fields);
        if (options.data.fileName) {
            data.fileName = options.data.fileName;
        }
        dbOperationOptions = {
            'projectID': projectID,
            'service': variable.getPrefabName() ? '' : 'services',
            'dataModelName': variable.liveSource,
            'entityName': variable.type,
            'sort': tableOptions.sort,
            'url': variable.getPrefabName() ? ($rootScope.project.deployedUrl + '/prefabs/' + variable.getPrefabName()) : $rootScope.project.deployedUrl,
            'data': data,
            'filter': LiveVariableUtils.getWhereClauseGenerator(variable, options)
            // 'filterMeta'    : tableOptions.filter
        };
        downloadSuccess = (response, resolve) => {
            if (response && response.type) {
                window.location.href = response.body.result;
                triggerFn(successHandler, response);
                resolve(response);
            }
        };
        downloadError = (err, reject) => {
            const opt = this.prepareCallbackOptions(err.details);
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, err.error, opt);
            triggerFn(errorHandler, err.error);
            reject(err);
        };
        return new Promise((resolve, reject) => {
            this.makeCall(variable, dbOperation, dbOperationOptions).then((response) => {
                downloadSuccess(response, resolve);
            }, (error) => {
                downloadError(error, reject);
            });
        });
    }
    /**
     * gets primary keys against the passed related Table
     * @param variable
     * @param relatedField
     * @returns {any}
     */
    getRelatedTablePrimaryKeys(variable, relatedField) {
        let primaryKeys, result, relatedCols;
        if (!variable.propertiesMap) {
            return;
        }
        result = _.find(variable.propertiesMap.columns || [], { 'fieldName': relatedField });
        // if related field name passed, get its type from columns inside the current field
        if (result) {
            relatedCols = result.columns;
            primaryKeys = _.map(_.filter(relatedCols, 'isPrimaryKey'), 'fieldName');
            if (primaryKeys.length) {
                return primaryKeys;
            }
            if (relatedCols && relatedCols.length) {
                relatedCols = _.find(relatedCols, { 'isRelated': false });
                return relatedCols && relatedCols.fieldName;
            }
        }
    }
    /**
     * Makes HTTP call to get the data for related entity of a field in an entity
     * @param variable
     * @param columnName
     * @param options
     * @param success
     * @param error
     */
    getRelatedTableData(variable, columnName, options, success, error) {
        const projectID = $rootScope.project.id || $rootScope.projectName;
        const relatedTable = _.find(variable.relatedTables, table => table.relationName === columnName || table.columnName === columnName); // Comparing column name to support the old projects
        const selfRelatedCols = _.map(_.filter(variable.relatedTables, o => o.type === variable.type), 'relationName');
        const filterFields = [];
        let orderBy, filterOptions, query, action, dbOperationOptions, getRelatedTableDataSuccess, getRelatedTableDataError;
        _.forEach(options.filterFields, (value, key) => {
            value.fieldName = key;
            value.type = LiveVariableUtils.getFieldType(columnName, variable, key);
            /**
             * for 'in' mode we are taking the input as comma separated values and for between in ui there are two different fields
             * but these are processed and merged into a single value with comma as separator. For these conditions like 'in' and 'between',
             * for building the query, the function expects the values to be an array
             */
            if (value.filterCondition === DB_CONSTANTS.DATABASE_MATCH_MODES.in.toLowerCase() || value.filterCondition === DB_CONSTANTS.DATABASE_MATCH_MODES.between.toLowerCase()) {
                value.value = value.value.split(',');
            }
            filterFields.push(value);
        });
        filterOptions = LiveVariableUtils.getFilterOptions(variable, filterFields, options);
        query = LiveVariableUtils.getSearchQuery(filterOptions, ' ' + (options.logicalOp || 'AND') + ' ', variable.ignoreCase);
        if (options.filterExpr) {
            const _clonedFields = getClonedObject(_.isObject(options.filterExpr) ? options.filterExpr : JSON.parse(options.filterExpr));
            LiveVariableUtils.processFilterFields(_clonedFields.rules, variable, options);
            const filterExpQuery = LiveVariableUtils.generateSearchQuery(_clonedFields.rules, _clonedFields.condition, variable.ignoreCase, options.skipEncode);
            if (query !== '') {
                if (filterExpQuery !== '') {
                    query = '(' + query + ') AND (' + filterExpQuery + ')';
                }
            }
            else if (filterExpQuery !== '') {
                query = filterExpQuery;
            }
        }
        query = query ? ('q=' + query) : '';
        action = 'searchTableDataWithQuery';
        orderBy = _.isEmpty(options.orderBy) ? '' : 'sort=' + options.orderBy;
        dbOperationOptions = {
            projectID: projectID,
            service: variable.getPrefabName() ? '' : 'services',
            dataModelName: variable.liveSource,
            entityName: relatedTable ? relatedTable.type : '',
            page: options.page || 1,
            size: options.pagesize || undefined,
            url: variable.getPrefabName() ? ($rootScope.project.deployedUrl + '/prefabs/' + variable.getPrefabName()) : $rootScope.project.deployedUrl,
            data: query || '',
            filter: LiveVariableUtils.getWhereClauseGenerator(variable, options),
            sort: orderBy
        };
        getRelatedTableDataSuccess = (res, resolve) => {
            if (res && res.type) {
                const response = res.body;
                /*Remove the self related columns from the data. As backend is restricting the self related column to one level, In liveform select, dataset and datavalue object
                 * equality does not work. So, removing the self related columns to acheive the quality*/
                const data = _.map(response.content, o => _.omit(o, selfRelatedCols));
                const pagination = Object.assign({}, response);
                delete pagination.content;
                const result = { data: data, pagination };
                triggerFn(success, result);
                resolve(result);
            }
        };
        getRelatedTableDataError = (errMsg, reject) => {
            triggerFn(error, errMsg);
            reject(errMsg);
        };
        return new Promise((resolve, reject) => {
            this.makeCall(variable, action, dbOperationOptions).then((response) => {
                getRelatedTableDataSuccess(response, resolve);
            }, err => {
                getRelatedTableDataError(err, reject);
            });
        });
    }
    /**
     * Gets the distinct records for an entity
     * @param variable
     * @param options
     * @param success
     * @param error
     */
    getDistinctDataByFields(variable, options, success, error) {
        const dbOperation = 'getDistinctDataByFields';
        const projectID = $rootScope.project.id || $rootScope.projectName;
        const requestData = {};
        let sort;
        let tableOptions, dbOperationOptions, getDistinctDataByFieldsSuccess, getDistinctDataByFieldsError;
        options.skipEncode = true;
        options.operation = 'read';
        options = options || {};
        tableOptions = LiveVariableUtils.prepareTableOptions(variable, options);
        if (tableOptions.query) {
            requestData.filter = tableOptions.query;
        }
        requestData.groupByFields = _.isArray(options.fields) ? options.fields : [options.fields];
        sort = options.sort || requestData.groupByFields[0] + ' asc';
        sort = sort ? 'sort=' + sort : '';
        dbOperationOptions = {
            'projectID': projectID,
            'service': variable.getPrefabName() ? '' : 'services',
            'dataModelName': variable.liveSource,
            'entityName': options.entityName || variable.type,
            'page': options.page || 1,
            'size': options.pagesize,
            'sort': sort,
            'data': requestData,
            'filter': LiveVariableUtils.getWhereClauseGenerator(variable, options),
            'url': variable.getPrefabName() ? ($rootScope.project.deployedUrl + '/prefabs/' + variable.getPrefabName()) : $rootScope.project.deployedUrl
        };
        getDistinctDataByFieldsSuccess = (response, resolve) => {
            if (response && response.type) {
                if ((response && response.error) || !response) {
                    triggerFn(error, response.error);
                    return Promise.reject(response.error);
                }
                let result = response.body;
                const pagination = Object.assign({}, response.body);
                delete pagination.content;
                result = { data: result.content, pagination };
                triggerFn(success, result);
                resolve(result);
            }
        };
        getDistinctDataByFieldsError = (errorMsg, reject) => {
            triggerFn(error, errorMsg);
            reject(errorMsg);
        };
        return new Promise((resolve, reject) => {
            this.makeCall(variable, dbOperation, dbOperationOptions).then((response) => {
                getDistinctDataByFieldsSuccess(response, resolve);
            }, () => {
                getDistinctDataByFieldsError(error, reject);
            });
        });
    }
    /*Function to get the aggregated data based on the fields chosen*/
    getAggregatedData(variable, options, success, error) {
        const deployedURL = appManager.getDeployedURL();
        if (deployedURL) {
            return this.aggregateData(deployedURL, variable, options, success, error);
        }
    }
    defineFirstLastRecord(variable) {
        if (variable.operation === 'read') {
            Object.defineProperty(variable, 'firstRecord', {
                'configurable': true,
                'get': () => {
                    return _.get(variable.dataSet, 'data[0]', {});
                }
            });
            Object.defineProperty(variable, 'lastRecord', {
                'configurable': true,
                'get': () => {
                    const data = _.get(variable.dataSet, 'data', []);
                    return data[data.length - 1];
                }
            });
        }
    }
    getPrimaryKey(variable) {
        return LiveVariableUtils.getPrimaryKey(variable);
    }
    // Returns the search query params.
    prepareRequestParams(options) {
        let requestParams;
        const searchKeys = _.split(options.searchKey, ','), matchModes = _.split(options.matchMode, ','), formFields = {};
        _.forEach(searchKeys, (colName, index) => {
            formFields[colName] = {
                value: options.query,
                logicalOp: 'AND',
                matchMode: matchModes[index] || matchModes[0] || 'startignorecase'
            };
        });
        requestParams = {
            filterFields: formFields,
            page: options.page,
            pagesize: options.limit || options.pagesize,
            skipDataSetUpdate: true,
            skipToggleState: true,
            inFlightBehavior: 'executeAll',
            logicalOp: 'OR',
            orderBy: options.orderby ? _.replace(options.orderby, /:/g, ' ') : ''
        };
        if (options.onBeforeservicecall) {
            options.onBeforeservicecall(formFields);
        }
        return requestParams;
    }
    /**
     * Gets the filtered records based on searchKey
     * @param variable
     * @param options contains the searchKey and queryText
     * @param success
     * @param error
     * @returns {Promise<any>}
     */
    searchRecords(variable, options, success, error) {
        const requestParams = this.prepareRequestParams(options);
        return this.listRecords(variable, requestParams, success, error);
    }
    /**
     * used in onBeforeUpdate call - called last in the function - used in old Variables using dataBinding.
     * This function migrates the old data dataBinding to filterExpressions equivalent format
     * @param variable
     * @param inputData
     * @private
     */
    upgradeInputDataToFilterExpressions(variable, response, inputData) {
        if (_.isObject(response)) {
            inputData = response;
            inputData.condition = 'AND';
            inputData.rules = [];
        }
        /**
         * if the user deletes a particular criteria, we need to remove this form our data aswell.
         * so we are keeping a copy of it and the emptying the existing object and now fill it with the
         * user set criteria. If its just modified, change the data and push it tohe rules or else just add a new criteria
         */
        const clonedRules = _.cloneDeep(inputData.rules);
        inputData.rules = [];
        _.forEach(inputData, function (valueObj, key) {
            if (key !== 'condition' && key !== 'rules') {
                const filteredObj = _.find(clonedRules, o => o.target === key);
                // if the key is found update the value, else create a new rule obj and add it to the existing rules
                if (filteredObj) {
                    filteredObj.value = valueObj.value;
                    filteredObj.matchMode = valueObj.matchMode || valueObj.filterCondition || filteredObj.matchMode || '';
                    inputData.rules.push(filteredObj);
                }
                else {
                    inputData.rules.push({
                        'target': key,
                        'type': '',
                        'matchMode': valueObj.matchMode || valueObj.filterCondition || '',
                        'value': valueObj.value,
                        'required': false
                    });
                }
                delete inputData[key];
            }
        });
        return inputData;
    }
    /**
     * used in onBeforeUpdate call - called first in the function - used in old Variables using dataBinding.
     * This function migrates the filterExpressions object to flat map structure
     * @param variable
     * @param inputData
     * @private
     */
    downgradeFilterExpressionsToInputData(variable, inputData) {
        if (inputData.hasOwnProperty('getFilterFields')) {
            inputData = inputData.getFilterFields();
        }
        _.forEach(inputData.rules, function (ruleObj) {
            if (!_.isNil(ruleObj.target) && ruleObj.target !== '') {
                inputData[ruleObj.target] = {
                    'value': ruleObj.value,
                    'matchMode': ruleObj.matchMode
                };
            }
        });
        return inputData;
    }
    cancel(variable, options) {
        if ($queue.requestsQueue.has(variable) && variable._observable) {
            variable._observable.unsubscribe();
            $queue.process(variable);
            // notify inflight variable
            this.notifyInflight(variable, false);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl2ZS12YXJpYWJsZS5tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbIm1hbmFnZXIvdmFyaWFibGUvbGl2ZS12YXJpYWJsZS5tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsd0JBQXdCLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTVILE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlELE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxzQkFBc0IsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUMsTUFBTSxxQ0FBcUMsQ0FBQztBQUNsSyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFOUcsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFHeEYsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBRXBCLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxtQkFBbUI7SUFBNUQ7O1FBcUVJOzs7Ozs7O1dBT0c7UUFDSyx3QkFBbUIsR0FBRyxVQUFVLGlCQUFpQjtZQUNyRCxJQUFJLHFCQUFxQixHQUFHLEtBQUssQ0FBQztZQUNsQyxNQUFNLGtCQUFrQixHQUFHLFVBQVUsZUFBZSxFQUFFLFNBQVM7Z0JBQzNELElBQUksU0FBUzt1QkFDTixTQUFTLENBQUMsUUFBUTt1QkFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUs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aUJBQ2pDLENBQUM7YUFDTDtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxRQUFRLEVBQUUsT0FBTztRQUMzQixJQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUU7WUFDNUQsUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pCLDJCQUEyQjtZQUMzQixJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN4QztJQUNMLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ICRpbnZva2VXYXRjaGVycywgZ2V0Q2xvbmVkT2JqZWN0LCBpc0RhdGVUaW1lVHlwZSwgaXNEZWZpbmVkLCBwcm9jZXNzRmlsdGVyRXhwQmluZE5vZGUsIHRyaWdnZXJGbiB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQmFzZVZhcmlhYmxlTWFuYWdlciB9IGZyb20gJy4vYmFzZS12YXJpYWJsZS5tYW5hZ2VyJztcbmltcG9ydCB7ZGVib3VuY2VWYXJpYWJsZUNhbGwsIGZvcm1hdEV4cG9ydEV4cHJlc3Npb24sIGluaXRpYXRlQ2FsbGJhY2ssIHNldElucHV0LCBhcHBNYW5hZ2VyLCBodHRwU2VydmljZSwgZm9ybWF0RGF0ZX0gZnJvbSAnLi4vLi4vdXRpbC92YXJpYWJsZS92YXJpYWJsZXMudXRpbHMnO1xuaW1wb3J0IHsgTGl2ZVZhcmlhYmxlVXRpbHMgfSBmcm9tICcuLi8uLi91dGlsL3ZhcmlhYmxlL2xpdmUtdmFyaWFibGUudXRpbHMnO1xuaW1wb3J0IHsgJHF1ZXVlIH0gZnJvbSAnLi4vLi4vdXRpbC9pbmZsaWdodC1xdWV1ZSc7XG5pbXBvcnQgeyAkcm9vdFNjb3BlLCBDT05TVEFOVFMsIFZBUklBQkxFX0NPTlNUQU5UUywgREJfQ09OU1RBTlRTIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzL3ZhcmlhYmxlcy5jb25zdGFudHMnO1xuaW1wb3J0IHsgQWR2YW5jZWRPcHRpb25zIH0gZnJvbSAnLi4vLi4vYWR2YW5jZWQtb3B0aW9ucyc7XG5pbXBvcnQgeyBnZW5lcmF0ZUNvbm5lY3Rpb25QYXJhbXMgfSBmcm9tICcuLi8uLi91dGlsL3ZhcmlhYmxlL2xpdmUtdmFyaWFibGUuaHR0cC51dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXywgd2luZG93O1xuY29uc3QgZW1wdHlBcnIgPSBbXTtcblxuZXhwb3J0IGNsYXNzIExpdmVWYXJpYWJsZU1hbmFnZXIgZXh0ZW5kcyBCYXNlVmFyaWFibGVNYW5hZ2VyIHtcblxuICAgIHB1YmxpYyBpbml0RmlsdGVyRXhwcmVzc2lvbkJpbmRpbmcodmFyaWFibGUpIHtcbiAgICAgICAgY29uc3QgY29udGV4dCA9IHZhcmlhYmxlLl9jb250ZXh0O1xuICAgICAgICBjb25zdCBkZXN0cm95Rm4gPSBjb250ZXh0LnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyID8gY29udGV4dC5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lci5iaW5kKGNvbnRleHQpIDogXy5ub29wO1xuXG4gICAgICAgIGNvbnN0IGZpbHRlclN1YnNjcmlwdGlvbiA9IHByb2Nlc3NGaWx0ZXJFeHBCaW5kTm9kZShjb250ZXh0LCB2YXJpYWJsZS5maWx0ZXJFeHByZXNzaW9ucykuc3Vic2NyaWJlKChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAodmFyaWFibGUub3BlcmF0aW9uID09PSAncmVhZCcpIHtcbiAgICAgICAgICAgICAgICAvKiBpZiBhdXRvLXVwZGF0ZSBzZXQgZm9yIHRoZSB2YXJpYWJsZSB3aXRoIHJlYWQgb3BlcmF0aW9uIG9ubHksIGdldCBpdHMgZGF0YSAqL1xuICAgICAgICAgICAgICAgIGlmICh2YXJpYWJsZS5hdXRvVXBkYXRlICYmICFfLmlzVW5kZWZpbmVkKHJlc3BvbnNlLm5ld1ZhbCkgJiYgXy5pc0Z1bmN0aW9uKHZhcmlhYmxlLnVwZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVib3VuY2VWYXJpYWJsZUNhbGwodmFyaWFibGUsICd1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8qIGlmIGF1dG8tdXBkYXRlIHNldCBmb3IgdGhlIHZhcmlhYmxlIHdpdGggcmVhZCBvcGVyYXRpb24gb25seSwgZ2V0IGl0cyBkYXRhICovXG4gICAgICAgICAgICAgICAgaWYgKHZhcmlhYmxlLmF1dG9VcGRhdGUgJiYgIV8uaXNVbmRlZmluZWQocmVzcG9uc2UubmV3VmFsKSAmJiBfLmlzRnVuY3Rpb24odmFyaWFibGVbdmFyaWFibGUub3BlcmF0aW9uICsgJ1JlY29yZCddKSkge1xuICAgICAgICAgICAgICAgICAgICBkZWJvdW5jZVZhcmlhYmxlQ2FsbCh2YXJpYWJsZSwgdmFyaWFibGUub3BlcmF0aW9uICsgJ1JlY29yZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGVzdHJveUZuKCgpID0+IGZpbHRlclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZURhdGFzZXQodmFyaWFibGUsIGRhdGEsIHByb3BlcnRpZXNNYXAsIHBhZ2luYXRpb24pIHtcbiAgICAgICAgdmFyaWFibGUucGFnaW5hdGlvbiA9IHBhZ2luYXRpb247XG4gICAgICAgIHZhcmlhYmxlLmRhdGFTZXQgPSBkYXRhO1xuXG4gICAgICAgIC8vIGxlZ2FjeSBwcm9wZXJ0aWVzIGluIGRhdGFTZXQsIFtkYXRhLCBwYWdpbmF0aW9uXVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodmFyaWFibGUuZGF0YVNldCwgJ2RhdGEnLCB7XG4gICAgICAgICAgICBnZXQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFyaWFibGUuZGF0YVNldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh2YXJpYWJsZS5kYXRhU2V0LCAncGFnaW5hdGlvbicsIHtcbiAgICAgICAgICAgIGdldDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YXJpYWJsZS5wYWdpbmF0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIF9vcHRpb25zIG9uIHZhcmlhYmxlIHdoaWNoIGNhbiBiZSB1c2VkIGJ5IHRoZSB3aWRnZXRzXG4gICAgcHJpdmF0ZSBzZXRWYXJpYWJsZU9wdGlvbnModmFyaWFibGUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyaWFibGUuX29wdGlvbnMgPSB2YXJpYWJsZS5fb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgdmFyaWFibGUuX29wdGlvbnMub3JkZXJCeSA9IG9wdGlvbnMgJiYgb3B0aW9ucy5vcmRlckJ5O1xuICAgICAgICB2YXJpYWJsZS5fb3B0aW9ucy5maWx0ZXJGaWVsZHMgPSBvcHRpb25zICYmIG9wdGlvbnMuZmlsdGVyRmllbGRzO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlRXJyb3IodmFyaWFibGUsIGVycm9yQ0IsIHJlc3BvbnNlLCBvcHRpb25zLCBhZHZhbmNlZE9wdGlvbnM/KSB7XG4gICAgICAgIGxldCBvcHQ6IEFkdmFuY2VkT3B0aW9ucztcbiAgICAgICAgLyogSWYgY2FsbGJhY2sgZnVuY3Rpb24gaXMgcHJvdmlkZWQsIHNlbmQgdGhlIGRhdGEgdG8gdGhlIGNhbGxiYWNrLlxuICAgICAgICAgKiBUaGUgc2FtZSBjYWxsYmFjayBpZiB0cmlnZ2VyZWQgaW4gY2FzZSBvZiBlcnJvciBhbHNvLiBUaGUgZXJyb3ItaGFuZGxpbmcgaXMgZG9uZSBpbiBncmlkLmpzKi9cbiAgICAgICAgdHJpZ2dlckZuKGVycm9yQ0IsIHJlc3BvbnNlKTtcblxuICAgICAgICAvLyAgRVZFTlQ6IE9OX1JFU1VMVFxuICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5SRVNVTFQsIHZhcmlhYmxlLCByZXNwb25zZSwgYWR2YW5jZWRPcHRpb25zKTtcblxuICAgICAgICAvKiB1cGRhdGUgdGhlIGRhdGFTZXQgYWdhaW5zdCB0aGUgdmFyaWFibGUgKi9cbiAgICAgICAgaWYgKCFvcHRpb25zLnNraXBEYXRhU2V0VXBkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGFzZXQodmFyaWFibGUsIGVtcHR5QXJyLCB2YXJpYWJsZS5wcm9wZXJ0aWVzTWFwLCBudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vICBFVkVOVDogT05fRVJST1JcbiAgICAgICAgb3B0ID0gdGhpcy5wcmVwYXJlQ2FsbGJhY2tPcHRpb25zKG9wdGlvbnMuZXJyb3JEZXRhaWxzKTtcbiAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuRVJST1IsIHZhcmlhYmxlLCByZXNwb25zZSwgb3B0KTtcbiAgICAgICAgLy8gIEVWRU5UOiBPTl9DQU5fVVBEQVRFXG4gICAgICAgIHZhcmlhYmxlLmNhblVwZGF0ZSA9IHRydWU7XG4gICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkNBTl9VUERBVEUsIHZhcmlhYmxlLCByZXNwb25zZSwgYWR2YW5jZWRPcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmF2ZXJzZXMgcmVjdXJzaXZlbHkgdGhlIGZpbHRlckV4cHJlc3Npb25zIG9iamVjdCBhbmQgaWYgdGhlcmUgaXMgYW55IHJlcXVpcmVkIGZpZWxkIHByZXNlbnQgd2l0aCBubyB2YWx1ZSxcbiAgICAgKiB0aGVuIHdlIHdpbGwgcmV0dXJuIHdpdGhvdXQgcHJvY2VlZGluZyBmdXJ0aGVyLiBJdHMgdXB0byB0aGUgZGV2ZWxvcGVyIHRvIHByb3ZpZGUgdGhlIG1hbmRhdG9yeSB2YWx1ZSxcbiAgICAgKiBpZiBoZSB3YW50cyB0byBhc3NpZ24gaXQgaW4gdGVoIG9uYmVmb3JlPGRlbGV0ZS9pbnNlcnQvdXBkYXRlPmZ1bmN0aW9uIHRoZW4gbWFrZSB0aGF0IGZpZWxkIGluXG4gICAgICogdGhlIGZpbHRlciBxdWVyeSBzZWN0aW9uIGFzIG9wdGlvbmFsXG4gICAgICogQHBhcmFtIGZpbHRlckV4cHJlc3Npb25zIC0gcmVjdXJzaXZlIHJ1bGUgT2JqZWN0XG4gICAgICogQHJldHVybnMge09iamVjdH0gb2JqZWN0IG9yIGJvb2xlYW4uIE9iamVjdCBpZiBldmVyeXRoaW5nIGdldHMgdmFsaWRhdGVkIG9yIGVsc2UganVzdCBib29sZWFuIGluZGljYXRpbmcgZmFpbHVyZSBpbiB0aGUgdmFsaWRhdGlvbnNcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEZpbHRlckV4cHJGaWVsZHMgPSBmdW5jdGlvbiAoZmlsdGVyRXhwcmVzc2lvbnMpIHtcbiAgICAgICAgbGV0IGlzUmVxdWlyZWRGaWVsZEFic2VudCA9IGZhbHNlO1xuICAgICAgICBjb25zdCB0cmF2ZXJzZUNhbGxiYWNrRm4gPSBmdW5jdGlvbiAocGFyZW50RmlsRXhwT2JqLCBmaWxFeHBPYmopIHtcbiAgICAgICAgICAgIGlmIChmaWxFeHBPYmpcbiAgICAgICAgICAgICAgICAmJiBmaWxFeHBPYmoucmVxdWlyZWRcbiAgICAgICAgICAgICAgICAmJiAoKF8uaW5kZXhPZihbJ251bGwnLCAnaXNub3RudWxsJywgJ2VtcHR5JywgJ2lzbm90ZW1wdHknLCAnbnVsbG9yZW1wdHknXSwgZmlsRXhwT2JqLm1hdGNoTW9kZSkgPT09IC0xKSAmJiBmaWxFeHBPYmoudmFsdWUgPT09ICcnKSkge1xuICAgICAgICAgICAgICAgIGlzUmVxdWlyZWRGaWVsZEFic2VudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBMaXZlVmFyaWFibGVVdGlscy50cmF2ZXJzZUZpbHRlckV4cHJlc3Npb25zKGZpbHRlckV4cHJlc3Npb25zLCB0cmF2ZXJzZUNhbGxiYWNrRm4pO1xuICAgICAgICByZXR1cm4gaXNSZXF1aXJlZEZpZWxkQWJzZW50ID8gIWlzUmVxdWlyZWRGaWVsZEFic2VudCA6IGZpbHRlckV4cHJlc3Npb25zO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBbGxvd3MgdGhlIHVzZXIgdG8gZ2V0IHRoZSBjcml0ZXJpYSBvZiBmaWx0ZXJpbmcgYW5kIHRoZSBmaWx0ZXIgZmllbGRzLCBiYXNlZCBvbiB0aGUgbWV0aG9kIGNhbGxlZFxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0RGF0YUZpbHRlck9iaiA9IGZ1bmN0aW9uIChjbG9uZWRGaWx0ZXJGaWVsZHMpIHtcbiAgICAgICAgcmV0dXJuIChmdW5jdGlvbiAoY2xvbmVkRmllbGRzKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRDcml0ZXJpYShmaWx0ZXJGaWVsZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNyaXRlcmlhbiA9IFtdO1xuICAgICAgICAgICAgICAgIExpdmVWYXJpYWJsZVV0aWxzLnRyYXZlcnNlRmlsdGVyRXhwcmVzc2lvbnMoY2xvbmVkRmllbGRzLCBmdW5jdGlvbiAoZmlsdGVyRXhwcmVzc2lvbnMsIGNyaXRlcmlhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJGaWVsZCA9PT0gY3JpdGVyaWEudGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcml0ZXJpYW4ucHVzaChjcml0ZXJpYSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JpdGVyaWFuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRGaWx0ZXJGaWVsZHMoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsb25lZEZpZWxkcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBnZXRGaWx0ZXJGaWVsZHM6IGdldEZpbHRlckZpZWxkcyxcbiAgICAgICAgICAgICAgICBnZXRDcml0ZXJpYTogZ2V0Q3JpdGVyaWFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0oY2xvbmVkRmlsdGVyRmllbGRzKSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgbWFrZUNhbGwodmFyaWFibGUsIGRiT3BlcmF0aW9uLCBwYXJhbXMpIHtcbiAgICAgICAgY29uc3Qgc3VjY2Vzc0hhbmRsZXIgPSAocmVzcG9uc2UsIHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS50eXBlKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9ySGFuZGxlciA9IChlcnJvciwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlcnJNc2cgPSBodHRwU2VydmljZS5nZXRFcnJNZXNzYWdlKGVycm9yKTtcbiAgICAgICAgICAgIC8vIG5vdGlmeSB2YXJpYWJsZSBlcnJvclxuICAgICAgICAgICAgdGhpcy5ub3RpZnlJbmZsaWdodCh2YXJpYWJsZSwgZmFsc2UpO1xuICAgICAgICAgICAgcmVqZWN0KHtcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyTXNnLFxuICAgICAgICAgICAgICAgIGRldGFpbHM6IGVycm9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCByZXFQYXJhbXMgPSBnZW5lcmF0ZUNvbm5lY3Rpb25QYXJhbXMocGFyYW1zLCBkYk9wZXJhdGlvbik7XG4gICAgICAgICAgICByZXFQYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgdXJsOiByZXFQYXJhbXMudXJsLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogcmVxUGFyYW1zLm1ldGhvZCxcbiAgICAgICAgICAgICAgICBkYXRhOiByZXFQYXJhbXMuZGF0YSxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiByZXFQYXJhbXMuaGVhZGVyc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHBhcmFtcy5vcGVyYXRpb24gPSBkYk9wZXJhdGlvbjtcbiAgICAgICAgICAgIHRoaXMuaHR0cENhbGwocmVxUGFyYW1zLCB2YXJpYWJsZSwgcGFyYW1zKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3NIYW5kbGVyKHJlc3BvbnNlLCByZXNvbHZlKTtcbiAgICAgICAgICAgIH0sIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZXJyb3JIYW5kbGVyKGUsIHJlamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRFbnRpdHlEYXRhKHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICBjb25zdCBkYXRhT2JqOiBhbnkgPSB7fTtcbiAgICAgICAgbGV0IHRhYmxlT3B0aW9ucyxcbiAgICAgICAgICAgIGRiT3BlcmF0aW9uLFxuICAgICAgICAgICAgb3V0cHV0LFxuICAgICAgICAgICAgbmV3RGF0YVNldCxcbiAgICAgICAgICAgIGNsb25lZEZpZWxkcyxcbiAgICAgICAgICAgIHJlcXVlc3REYXRhLFxuICAgICAgICAgICAgZGJPcGVyYXRpb25PcHRpb25zLFxuICAgICAgICAgICAgZ2V0RW50aXR5U3VjY2VzcyxcbiAgICAgICAgICAgIGdldEVudGl0eUVycm9yO1xuXG4gICAgICAgIC8vIGVtcHR5IGFycmF5IGtlcHQgKGlmIHZhcmlhYmxlIGlzIG5vdCBvZiByZWFkIHR5cGUgZmlsdGVyRXhwcmVzc2lvbnMgd2lsbCBiZSB1bmRlZmluZWQpXG4gICAgICAgIGNsb25lZEZpZWxkcyA9IHRoaXMuZ2V0RmlsdGVyRXhwckZpZWxkcyhnZXRDbG9uZWRPYmplY3QodmFyaWFibGUuZmlsdGVyRXhwcmVzc2lvbnMgfHwge30pKTtcbiAgICAgICAgLy8gY2xvbmVkRmllbGRzID0gZ2V0Q2xvbmVkT2JqZWN0KHZhcmlhYmxlLmZpbHRlckZpZWxkcyk7XG4gICAgICAgIC8vICBFVkVOVDogT05fQkVGT1JFX1VQREFURVxuICAgICAgICBvdXRwdXQgPSBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5CRUZPUkVfVVBEQVRFLCB2YXJpYWJsZSwgdGhpcy5nZXREYXRhRmlsdGVyT2JqKGNsb25lZEZpZWxkcyksIG9wdGlvbnMpO1xuICAgICAgICAvLyBpZiBmaWx0ZXJGaWVsZHMgYXJlIHVwZGF0ZWQgb3IgbW9kaWZpZWQgaW5zaWRlIHRoZSBvbkJlZm9yZVVwZGF0ZSBldmVudCB0aGVuIGluIGRldmljZSB1c2UgdGhlc2UgZmllbGRzIHRvIGZpbHRlci5cbiAgICAgICAgY29uc3QgdXBkYXRlRmlsdGVyRmllbGRzID0gXy5pc09iamVjdChvdXRwdXQpID8gZ2V0Q2xvbmVkT2JqZWN0KG91dHB1dCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChvdXRwdXQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAkcXVldWUucHJvY2Vzcyh2YXJpYWJsZSk7XG4gICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRlbWl0KCd0b2dnbGUtdmFyaWFibGUtc3RhdGUnLCB2YXJpYWJsZSwgZmFsc2UpO1xuICAgICAgICAgICAgdHJpZ2dlckZuKGVycm9yLCAnQ2FsbCBzdG9wcGVkIGZyb20gdGhlIGV2ZW50OiAnICsgVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkJFRk9SRV9VUERBVEUpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdDYWxsIHN0b3BwZWQgZnJvbSB0aGUgZXZlbnQ6ICcgKyBWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuQkVGT1JFX1VQREFURSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXJpYWJsZS5jYW5VcGRhdGUgPSBmYWxzZTtcblxuICAgICAgICB0YWJsZU9wdGlvbnMgPSBMaXZlVmFyaWFibGVVdGlscy5wcmVwYXJlVGFibGVPcHRpb25zKHZhcmlhYmxlLCBvcHRpb25zLCBfLmlzT2JqZWN0KG91dHB1dCkgPyBvdXRwdXQgOiBjbG9uZWRGaWVsZHMpO1xuXG4gICAgICAgIC8vICBpZiB0YWJsZU9wdGlvbnMgb2JqZWN0IGhhcyBxdWVyeSB0aGVuIHNldCB0aGUgZGJPcGVyYXRpb24gdG8gJ3NlYXJjaFRhYmxlRGF0YVdpdGhRdWVyeSdcbiAgICAgICAgaWYgKG9wdGlvbnMuc2VhcmNoV2l0aFF1ZXJ5KSB7XG4gICAgICAgICAgICBkYk9wZXJhdGlvbiA9ICdzZWFyY2hUYWJsZURhdGFXaXRoUXVlcnknO1xuICAgICAgICAgICAgcmVxdWVzdERhdGEgPSB0YWJsZU9wdGlvbnMucXVlcnkgPyAoJ3E9JyArIHRhYmxlT3B0aW9ucy5xdWVyeSkgOiAnJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRiT3BlcmF0aW9uID0gKHRhYmxlT3B0aW9ucy5maWx0ZXIgJiYgdGFibGVPcHRpb25zLmZpbHRlci5sZW5ndGgpID8gJ3NlYXJjaFRhYmxlRGF0YScgOiAncmVhZFRhYmxlRGF0YSc7XG4gICAgICAgICAgICByZXF1ZXN0RGF0YSA9IHRhYmxlT3B0aW9ucy5maWx0ZXI7XG4gICAgICAgIH1cbiAgICAgICAgZGJPcGVyYXRpb25PcHRpb25zID0ge1xuICAgICAgICAgICAgJ3Byb2plY3RJRCc6ICRyb290U2NvcGUucHJvamVjdC5pZCxcbiAgICAgICAgICAgICdzZXJ2aWNlJzogdmFyaWFibGUuZ2V0UHJlZmFiTmFtZSgpID8gJycgOiAnc2VydmljZXMnLFxuICAgICAgICAgICAgJ2RhdGFNb2RlbE5hbWUnOiB2YXJpYWJsZS5saXZlU291cmNlLFxuICAgICAgICAgICAgJ2VudGl0eU5hbWUnOiB2YXJpYWJsZS50eXBlLFxuICAgICAgICAgICAgJ3BhZ2UnOiBvcHRpb25zLnBhZ2UgfHwgMSxcbiAgICAgICAgICAgICdzaXplJzogb3B0aW9ucy5wYWdlc2l6ZSB8fCAoQ09OU1RBTlRTLmlzUnVuTW9kZSA/ICh2YXJpYWJsZS5tYXhSZXN1bHRzIHx8IDIwKSA6ICh2YXJpYWJsZS5kZXNpZ25NYXhSZXN1bHRzIHx8IDIwKSksXG4gICAgICAgICAgICAnc29ydCc6IHRhYmxlT3B0aW9ucy5zb3J0LFxuICAgICAgICAgICAgJ2RhdGEnOiByZXF1ZXN0RGF0YSxcbiAgICAgICAgICAgICdmaWx0ZXInOiBMaXZlVmFyaWFibGVVdGlscy5nZXRXaGVyZUNsYXVzZUdlbmVyYXRvcih2YXJpYWJsZSwgb3B0aW9ucywgdXBkYXRlRmlsdGVyRmllbGRzKSxcbiAgICAgICAgICAgIC8vICdmaWx0ZXJNZXRhJzogdGFibGVPcHRpb25zLmZpbHRlcixcbiAgICAgICAgICAgICd1cmwnOiB2YXJpYWJsZS5nZXRQcmVmYWJOYW1lKCkgPyAoJHJvb3RTY29wZS5wcm9qZWN0LmRlcGxveWVkVXJsICsgJy9wcmVmYWJzLycgKyB2YXJpYWJsZS5nZXRQcmVmYWJOYW1lKCkpIDogJHJvb3RTY29wZS5wcm9qZWN0LmRlcGxveWVkVXJsXG4gICAgICAgIH07XG4gICAgICAgIGdldEVudGl0eVN1Y2Nlc3MgPSAocmVzcG9uc2U6IGFueSwgcmVzb2x2ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UudHlwZSkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gcmVzcG9uc2UuYm9keTtcbiAgICAgICAgICAgICAgICBkYXRhT2JqLmRhdGEgPSByZXNwb25zZS5jb250ZW50O1xuICAgICAgICAgICAgICAgIGRhdGFPYmoucGFnaW5hdGlvbiA9IF8ub21pdChyZXNwb25zZSwgJ2NvbnRlbnQnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBhZHZhbmNlZE9wdGlvbnM6IEFkdmFuY2VkT3B0aW9ucyA9IHRoaXMucHJlcGFyZUNhbGxiYWNrT3B0aW9ucyhyZXNwb25zZSwge3BhZ2luYXRpb246IGRhdGFPYmoucGFnaW5hdGlvbn0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKChyZXNwb25zZSAmJiByZXNwb25zZS5lcnJvcikgfHwgIXJlc3BvbnNlIHx8ICFfLmlzQXJyYXkocmVzcG9uc2UuY29udGVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVFcnJvcih2YXJpYWJsZSwgZXJyb3IsIHJlc3BvbnNlLmVycm9yLCBvcHRpb25zLCBhZHZhbmNlZE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVzcG9uc2UuZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIExpdmVWYXJpYWJsZVV0aWxzLnByb2Nlc3NCbG9iQ29sdW1ucyhyZXNwb25zZS5jb250ZW50LCB2YXJpYWJsZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMuc2tpcERhdGFTZXRVcGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gIEVWRU5UOiBPTl9SRVNVTFRcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuUkVTVUxULCB2YXJpYWJsZSwgZGF0YU9iai5kYXRhLCBhZHZhbmNlZE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgRVZFTlQ6IE9OX1BSRVBBUkVTRVREQVRBXG4gICAgICAgICAgICAgICAgICAgIG5ld0RhdGFTZXQgPSBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5QUkVQQVJFX1NFVERBVEEsIHZhcmlhYmxlLCBkYXRhT2JqLmRhdGEsIGFkdmFuY2VkT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEYXRhU2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXR0aW5nIG5ld0RhdGFTZXQgYXMgdGhlIHJlc3BvbnNlIHRvIHNlcnZpY2UgdmFyaWFibGUgb25QcmVwYXJlU2V0RGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YU9iai5kYXRhID0gbmV3RGF0YVNldDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvKiB1cGRhdGUgdGhlIGRhdGFTZXQgYWdhaW5zdCB0aGUgdmFyaWFibGUgKi9cbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVEYXRhc2V0KHZhcmlhYmxlLCBkYXRhT2JqLmRhdGEsIHZhcmlhYmxlLnByb3BlcnRpZXNNYXAsIGRhdGFPYmoucGFnaW5hdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VmFyaWFibGVPcHRpb25zKHZhcmlhYmxlLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyB3YXRjaGVycyBzaG91bGQgZ2V0IHRyaWdnZXJlZCBiZWZvcmUgY2FsbGluZyBvblN1Y2Nlc3MgZXZlbnQuXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvIHRoYXQgYW55IHZhcmlhYmxlL3dpZGdldCBkZXBlbmRpbmcgb24gdGhpcyB2YXJpYWJsZSdzIGRhdGEgaXMgdXBkYXRlZFxuICAgICAgICAgICAgICAgICAgICAkaW52b2tlV2F0Y2hlcnModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgY2FsbGJhY2sgZnVuY3Rpb24gaXMgcHJvdmlkZWQsIHNlbmQgdGhlIGRhdGEgdG8gdGhlIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oc3VjY2VzcywgZGF0YU9iai5kYXRhLCB2YXJpYWJsZS5wcm9wZXJ0aWVzTWFwLCBkYXRhT2JqLnBhZ2luYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgRVZFTlQ6IE9OX1NVQ0NFU1NcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULlNVQ0NFU1MsIHZhcmlhYmxlLCBkYXRhT2JqLmRhdGEsIGFkdmFuY2VkT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgRVZFTlQ6IE9OX0NBTl9VUERBVEVcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlLmNhblVwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5DQU5fVVBEQVRFLCB2YXJpYWJsZSwgZGF0YU9iai5kYXRhLCBhZHZhbmNlZE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoe2RhdGE6IGRhdGFPYmouZGF0YSwgcGFnaW5hdGlvbjogZGF0YU9iai5wYWdpbmF0aW9ufSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGdldEVudGl0eUVycm9yID0gKGU6IGFueSwgcmVqZWN0OiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0VmFyaWFibGVPcHRpb25zKHZhcmlhYmxlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlRXJyb3IodmFyaWFibGUsIGVycm9yLCBlLmVycm9yLCBfLmV4dGVuZChvcHRpb25zLCB7ZXJyb3JEZXRhaWxzOiBlLmRldGFpbHN9KSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZS5lcnJvcik7XG4gICAgICAgIH07XG4gICAgICAgIC8qIGlmIGl0IGlzIGEgcHJlZmFiIHZhcmlhYmxlICh1c2VkIGluIGEgbm9ybWFsIHByb2plY3QpLCBtb2RpZnkgdGhlIHVybCAqL1xuICAgICAgICAvKkZldGNoIHRoZSB0YWJsZSBkYXRhKi9cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMubWFrZUNhbGwodmFyaWFibGUsIGRiT3BlcmF0aW9uLCBkYk9wZXJhdGlvbk9wdGlvbnMpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgZ2V0RW50aXR5U3VjY2VzcyhyZXNwb25zZSwgcmVzb2x2ZSk7XG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xuICAgICAgICAgICAgICAgIGdldEVudGl0eUVycm9yKGVyciwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHBlcmZvcm1DVUQob3BlcmF0aW9uLCB2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIG9wdGlvbnMuaW5wdXRGaWVsZHMgPSBvcHRpb25zLmlucHV0RmllbGRzIHx8IGdldENsb25lZE9iamVjdCh2YXJpYWJsZS5pbnB1dEZpZWxkcyk7XG4gICAgICAgIHJldHVybiAkcXVldWUuc3VibWl0KHZhcmlhYmxlKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5SW5mbGlnaHQodmFyaWFibGUsICFvcHRpb25zLnNraXBUb2dnbGVTdGF0ZSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kb0NVRChvcGVyYXRpb24sIHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcilcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgJHF1ZXVlLnByb2Nlc3ModmFyaWFibGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeUluZmxpZ2h0KHZhcmlhYmxlLCBmYWxzZSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRxdWV1ZS5wcm9jZXNzKHZhcmlhYmxlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RpZnlJbmZsaWdodCh2YXJpYWJsZSwgZmFsc2UsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBlcnJvcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkb0NVRChhY3Rpb24sIHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICBjb25zdCBwcm9qZWN0SUQgPSAkcm9vdFNjb3BlLnByb2plY3QuaWQgfHwgJHJvb3RTY29wZS5wcm9qZWN0TmFtZSxcbiAgICAgICAgICAgIHByaW1hcnlLZXkgPSBMaXZlVmFyaWFibGVVdGlscy5nZXRQcmltYXJ5S2V5KHZhcmlhYmxlKSxcbiAgICAgICAgICAgIGlzRm9ybURhdGFTdXBwb3J0ZWQgPSAod2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iKTtcblxuICAgICAgICBsZXQgZGJOYW1lLFxuICAgICAgICAgICAgY29tcG9zaXRlSWQgPSAnJyxcbiAgICAgICAgICAgIHJvd09iamVjdCA9IHt9LFxuICAgICAgICAgICAgcHJldkRhdGEsXG4gICAgICAgICAgICBjb21wb3NpdGVLZXlzRGF0YSA9IHt9LFxuICAgICAgICAgICAgcHJldkNvbXBvc2l0ZUtleXNEYXRhID0ge30sXG4gICAgICAgICAgICBpZCxcbiAgICAgICAgICAgIGNvbHVtbk5hbWUsXG4gICAgICAgICAgICBjbG9uZWRGaWVsZHMsXG4gICAgICAgICAgICBvdXRwdXQsXG4gICAgICAgICAgICBvbkNVRGVycm9yLFxuICAgICAgICAgICAgb25DVURzdWNjZXNzLFxuICAgICAgICAgICAgaW5wdXRGaWVsZHMgPSBvcHRpb25zLmlucHV0RmllbGRzIHx8IHZhcmlhYmxlLmlucHV0RmllbGRzO1xuXG4gICAgICAgIC8vIEVWRU5UOiBPTl9CRUZPUkVfVVBEQVRFXG4gICAgICAgIGNsb25lZEZpZWxkcyA9IGdldENsb25lZE9iamVjdChpbnB1dEZpZWxkcyk7XG4gICAgICAgIG91dHB1dCA9IGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkJFRk9SRV9VUERBVEUsIHZhcmlhYmxlLCBjbG9uZWRGaWVsZHMsIG9wdGlvbnMpO1xuICAgICAgICBpZiAob3V0cHV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kZW1pdCgndG9nZ2xlLXZhcmlhYmxlLXN0YXRlJywgdmFyaWFibGUsIGZhbHNlKTtcbiAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0NhbGwgc3RvcHBlZCBmcm9tIHRoZSBldmVudDogJyArIFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5CRUZPUkVfVVBEQVRFKTtcbiAgICAgICAgfVxuICAgICAgICBpbnB1dEZpZWxkcyA9IF8uaXNPYmplY3Qob3V0cHV0KSA/IG91dHB1dCA6IGNsb25lZEZpZWxkcztcbiAgICAgICAgdmFyaWFibGUuY2FuVXBkYXRlID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMucm93KSB7XG4gICAgICAgICAgICByb3dPYmplY3QgPSBvcHRpb25zLnJvdztcbiAgICAgICAgICAgIC8vIEZvciBkYXRldGltZSB0eXBlcywgY29udmVydCB0aGUgdmFsdWUgdG8gdGhlIGZvcm1hdCBhY2NlcHRlZCBieSBiYWNrZW5kXG4gICAgICAgICAgICBfLmZvckVhY2gocm93T2JqZWN0LCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpZWxkVHlwZSA9IExpdmVWYXJpYWJsZVV0aWxzLmdldEZpZWxkVHlwZShrZXksIHZhcmlhYmxlKTtcbiAgICAgICAgICAgICAgICBsZXQgZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoaXNEYXRlVGltZVR5cGUoZmllbGRUeXBlKSkge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gZm9ybWF0RGF0ZSh2YWx1ZSwgZmllbGRUeXBlKTtcbiAgICAgICAgICAgICAgICAgICAgcm93T2JqZWN0W2tleV0gPSBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXy5pc0FycmF5KHZhbHVlKSAmJiBMaXZlVmFyaWFibGVVdGlscy5pc1N0cmluZ1R5cGUoZmllbGRUeXBlKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBDb25zdHJ1Y3QgJywnIHNlcGFyYXRlZCBzdHJpbmcgaWYgcGFyYW0gaXMgbm90IGFycmF5IHR5cGUgYnV0IHZhbHVlIGlzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBfLmpvaW4odmFsdWUsICcsJyk7XG4gICAgICAgICAgICAgICAgICAgIHJvd09iamVjdFtrZXldID0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIE1lcmdlIGlucHV0RmllbGRzIGFsb25nIHdpdGggZGF0YU9iaiB3aGlsZSBtYWtpbmcgSW5zZXJ0L1VwZGF0ZS9EZWxldGVcbiAgICAgICAgICAgIF8uZm9yRWFjaChpbnB1dEZpZWxkcywgKGF0dHJWYWx1ZSwgYXR0ck5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoKGlzRGVmaW5lZChhdHRyVmFsdWUpICYmIGF0dHJWYWx1ZSAhPT0gJycpICYmICghaXNEZWZpbmVkKHJvd09iamVjdFthdHRyTmFtZV0pIHx8IHJvd09iamVjdFthdHRyTmFtZV0gPT09ICcnKSkge1xuICAgICAgICAgICAgICAgICAgICByb3dPYmplY3RbYXR0ck5hbWVdID0gYXR0clZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5mb3JFYWNoKGlucHV0RmllbGRzLCAoZmllbGRWYWx1ZSwgZmllbGROYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGZpZWxkVHlwZTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmltYXJ5S2V5cyA9IHZhcmlhYmxlLnByb3BlcnRpZXNNYXAucHJpbWFyeUZpZWxkcyB8fCB2YXJpYWJsZS5wcm9wZXJ0aWVzTWFwLnByaW1hcnlLZXlzO1xuICAgICAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChmaWVsZFZhbHVlKSAmJiBmaWVsZFZhbHVlICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAvKkZvciBkZWxldGUgYWN0aW9uLCB0aGUgaW5wdXRGaWVsZHMgbmVlZCB0byBiZSBzZXQgaW4gdGhlIHJlcXVlc3QgVVJMLiBIZW5jZSBjb21wb3NpdGVJZCBpcyBzZXQuXG4gICAgICAgICAgICAgICAgICAgICAqIEZvciBpbnNlcnQgYWN0aW9uIGlucHV0RmllbGRzIG5lZWQgdG8gYmUgc2V0IGluIHRoZSByZXF1ZXN0IGRhdGEuIEhlbmNlIHJvd09iamVjdCBpcyBzZXQuXG4gICAgICAgICAgICAgICAgICAgICAqIEZvciB1cGRhdGUgYWN0aW9uLCBib3RoIG5lZWQgdG8gYmUgc2V0LiovXG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdkZWxldGVUYWJsZURhdGEnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NpdGVJZCA9IGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ3VwZGF0ZVRhYmxlRGF0YScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlLZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmllbGROYW1lID09PSBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlSWQgPSBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3Rpb24gIT09ICdkZWxldGVUYWJsZURhdGEnIHx8IExpdmVWYXJpYWJsZVV0aWxzLmlzQ29tcG9zaXRlS2V5KHByaW1hcnlLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFR5cGUgPSBMaXZlVmFyaWFibGVVdGlscy5nZXRGaWVsZFR5cGUoZmllbGROYW1lLCB2YXJpYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNEYXRlVGltZVR5cGUoZmllbGRUeXBlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBmb3JtYXREYXRlKGZpZWxkVmFsdWUsIGZpZWxkVHlwZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKF8uaXNBcnJheShmaWVsZFZhbHVlKSAmJiBMaXZlVmFyaWFibGVVdGlscy5pc1N0cmluZ1R5cGUoZmllbGRUeXBlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbnN0cnVjdCAnLCcgc2VwYXJhdGVkIHN0cmluZyBpZiBwYXJhbSBpcyBub3QgYXJyYXkgdHlwZSBidXQgdmFsdWUgaXMgYW4gYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gXy5qb2luKGZpZWxkVmFsdWUsICcsJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByb3dPYmplY3RbZmllbGROYW1lXSA9IGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIHJlbGF0ZWQgZW50aXRpZXMsIGNsZWFyIHRoZSBibG9iIHR5cGUgZmllbGRzXG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzT2JqZWN0KGZpZWxkVmFsdWUpICYmICFfLmlzQXJyYXkoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChmaWVsZFZhbHVlLCAodmFsLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0RmllbGRUeXBlKGZpZWxkTmFtZSwgdmFyaWFibGUsIGtleSkgPT09ICdibG9iJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHVlW2tleV0gPSB2YWwgPT09IG51bGwgPyB2YWwgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ3VwZGF0ZVRhYmxlRGF0YSc6XG4gICAgICAgICAgICAgICAgcHJldkRhdGEgPSBvcHRpb25zLnByZXZEYXRhIHx8IHt9O1xuICAgICAgICAgICAgICAgIC8qQ29uc3RydWN0IHRoZSBcInJlcXVlc3REYXRhXCIgYmFzZWQgb24gd2hldGhlciB0aGUgdGFibGUgYXNzb2NpYXRlZCB3aXRoIHRoZSBsaXZlLXZhcmlhYmxlIGhhcyBhIGNvbXBvc2l0ZSBrZXkgb3Igbm90LiovXG4gICAgICAgICAgICAgICAgaWYgKExpdmVWYXJpYWJsZVV0aWxzLmlzQ29tcG9zaXRlS2V5KHByaW1hcnlLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChMaXZlVmFyaWFibGVVdGlscy5pc05vUHJpbWFyeUtleShwcmltYXJ5S2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldkNvbXBvc2l0ZUtleXNEYXRhID0gcHJldkRhdGEgfHwgb3B0aW9ucy5yb3dEYXRhIHx8IHJvd09iamVjdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvc2l0ZUtleXNEYXRhID0gcm93T2JqZWN0O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUtleS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlS2V5c0RhdGFba2V5XSA9IHJvd09iamVjdFtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluIGNhc2Ugb2YgcGVyaW9kaWMgdXBkYXRlIGZvciBCdXNpbmVzcyB0ZW1wb3JhbCBmaWVsZHMsIHBhc3NpbmcgdXBkYXRlZCBmaWVsZCBkYXRhLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnBlcmlvZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2Q29tcG9zaXRlS2V5c0RhdGFba2V5XSA9IHJvd09iamVjdFtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZDb21wb3NpdGVLZXlzRGF0YVtrZXldID0gcHJldkRhdGFba2V5XSB8fCAob3B0aW9ucy5yb3dEYXRhICYmIG9wdGlvbnMucm93RGF0YVtrZXldKSB8fCByb3dPYmplY3Rba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnJvdyA9IGNvbXBvc2l0ZUtleXNEYXRhO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmNvbXBvc2l0ZUtleXNEYXRhID0gcHJldkNvbXBvc2l0ZUtleXNEYXRhO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlLZXkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA9IHByZXZEYXRhW2tleV0gfHwgKG9wdGlvbnMucm93RGF0YSAmJiBvcHRpb25zLnJvd0RhdGFba2V5XSkgfHwgcm93T2JqZWN0W2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbk5hbWUgPSBrZXkuc3BsaXQoJy4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA9IHByZXZEYXRhW2NvbHVtbk5hbWVbMF1dW2NvbHVtbk5hbWVbMV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5pZCA9IGlkO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnJvdyA9IHJvd09iamVjdDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RlbGV0ZVRhYmxlRGF0YSc6XG4gICAgICAgICAgICAgICAgLypDb25zdHJ1Y3QgdGhlIFwicmVxdWVzdERhdGFcIiBiYXNlZCBvbiB3aGV0aGVyIHRoZSB0YWJsZSBhc3NvY2lhdGVkIHdpdGggdGhlIGxpdmUtdmFyaWFibGUgaGFzIGEgY29tcG9zaXRlIGtleSBvciBub3QuKi9cbiAgICAgICAgICAgICAgICBpZiAoTGl2ZVZhcmlhYmxlVXRpbHMuaXNDb21wb3NpdGVLZXkocHJpbWFyeUtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKExpdmVWYXJpYWJsZVV0aWxzLmlzTm9QcmltYXJ5S2V5KHByaW1hcnlLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NpdGVLZXlzRGF0YSA9IHJvd09iamVjdDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlLZXkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvc2l0ZUtleXNEYXRhW2tleV0gPSByb3dPYmplY3Rba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuY29tcG9zaXRlS2V5c0RhdGEgPSBjb21wb3NpdGVLZXlzRGF0YTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFfLmlzRW1wdHkocm93T2JqZWN0KSkge1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5S2V5LmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZignLicpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gcm93T2JqZWN0W2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbk5hbWUgPSBrZXkuc3BsaXQoJy4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA9IHJvd09iamVjdFtjb2x1bW5OYW1lWzBdXVtjb2x1bW5OYW1lWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuaWQgPSBpZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHRhYmxlIGhhcyBibG9iIGNvbHVtbiB0aGVuIHNlbmQgbXVsdGlwYXJ0IGRhdGFcbiAgICAgICAgaWYgKChhY3Rpb24gPT09ICd1cGRhdGVUYWJsZURhdGEnIHx8IGFjdGlvbiA9PT0gJ2luc2VydFRhYmxlRGF0YScpICYmIExpdmVWYXJpYWJsZVV0aWxzLmhhc0Jsb2IodmFyaWFibGUpICYmIGlzRm9ybURhdGFTdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICd1cGRhdGVUYWJsZURhdGEnKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uID0gJ3VwZGF0ZU11bHRpUGFydFRhYmxlRGF0YSc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFjdGlvbiA9ICdpbnNlcnRNdWx0aVBhcnRUYWJsZURhdGEnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcm93T2JqZWN0ID0gTGl2ZVZhcmlhYmxlVXRpbHMucHJlcGFyZUZvcm1EYXRhKHZhcmlhYmxlLCByb3dPYmplY3QpO1xuICAgICAgICB9XG4gICAgICAgIC8qQ2hlY2sgaWYgXCJvcHRpb25zXCIgaGF2ZSB0aGUgXCJjb21wb3NpdGVLZXlzRGF0YVwiIHByb3BlcnR5LiovXG4gICAgICAgIGlmIChvcHRpb25zLmNvbXBvc2l0ZUtleXNEYXRhKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3VwZGF0ZVRhYmxlRGF0YSc6XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbiA9ICd1cGRhdGVDb21wb3NpdGVUYWJsZURhdGEnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkZWxldGVUYWJsZURhdGEnOlxuICAgICAgICAgICAgICAgICAgICBhY3Rpb24gPSAnZGVsZXRlQ29tcG9zaXRlVGFibGVEYXRhJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAndXBkYXRlTXVsdGlQYXJ0VGFibGVEYXRhJzpcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uID0gJ3VwZGF0ZU11bHRpUGFydENvbXBvc2l0ZVRhYmxlRGF0YSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcG9zaXRlSWQgPSBMaXZlVmFyaWFibGVVdGlscy5nZXRDb21wb3NpdGVJRFVSTChvcHRpb25zLmNvbXBvc2l0ZUtleXNEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBkYk5hbWUgPSB2YXJpYWJsZS5saXZlU291cmNlO1xuXG4gICAgICAgIC8qU2V0IHRoZSBcImRhdGFcIiBpbiB0aGUgcmVxdWVzdCB0byBcInVuZGVmaW5lZFwiIGlmIHRoZXJlIGlzIG5vIGRhdGEuXG4gICAgICAgICogVGhpcyBoYW5kbGVzIGNhc2VzIHN1Y2ggYXMgXCJEZWxldGVcIiByZXF1ZXN0cyB3aGVyZSBkYXRhIHNob3VsZCBub3QgYmUgcGFzc2VkLiovXG4gICAgICAgIGlmIChfLmlzRW1wdHkocm93T2JqZWN0KSAmJiBhY3Rpb24gPT09ICdkZWxldGVUYWJsZURhdGEnKSB7XG4gICAgICAgICAgICByb3dPYmplY3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKGFjdGlvbiA9PT0gJ3VwZGF0ZUNvbXBvc2l0ZVRhYmxlRGF0YScgfHwgYWN0aW9uID09PSAnZGVsZXRlQ29tcG9zaXRlVGFibGVEYXRhJykgJiYgb3B0aW9ucy5wZXJpb2QpIHtcbiAgICAgICAgICAgIC8vIGNhcGl0YWxpemUgZmlyc3QgY2hhcmFjdGVyXG4gICAgICAgICAgICBhY3Rpb24gPSAncGVyaW9kJyArIGFjdGlvbi5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGFjdGlvbi5zdWJzdHIoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkYk9wZXJhdGlvbnMgPSB7XG4gICAgICAgICAgICAncHJvamVjdElEJzogcHJvamVjdElELFxuICAgICAgICAgICAgJ3NlcnZpY2UnOiB2YXJpYWJsZS5fcHJlZmFiTmFtZSA/ICcnIDogJ3NlcnZpY2VzJyxcbiAgICAgICAgICAgICdkYXRhTW9kZWxOYW1lJzogZGJOYW1lLFxuICAgICAgICAgICAgJ2VudGl0eU5hbWUnOiB2YXJpYWJsZS50eXBlLFxuICAgICAgICAgICAgJ2lkJzogIV8uaXNVbmRlZmluZWQob3B0aW9ucy5pZCkgPyBlbmNvZGVVUklDb21wb25lbnQob3B0aW9ucy5pZCkgOiBjb21wb3NpdGVJZCxcbiAgICAgICAgICAgICdkYXRhJzogcm93T2JqZWN0LFxuICAgICAgICAgICAgJ3VybCc6IHZhcmlhYmxlLl9wcmVmYWJOYW1lID8gKCRyb290U2NvcGUucHJvamVjdC5kZXBsb3llZFVybCArICcvcHJlZmFicy8nICsgdmFyaWFibGUuX3ByZWZhYk5hbWUpIDogJHJvb3RTY29wZS5wcm9qZWN0LmRlcGxveWVkVXJsXG4gICAgICAgIH07XG5cbiAgICAgICAgb25DVURlcnJvciA9IChyZXNwb25zZTogYW55LCByZWplY3Q6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXJyTXNnID0gcmVzcG9uc2UuZXJyb3I7XG4gICAgICAgICAgICBjb25zdCBhZHZhbmNlZE9wdGlvbnM6IEFkdmFuY2VkT3B0aW9ucyA9IHRoaXMucHJlcGFyZUNhbGxiYWNrT3B0aW9ucyhyZXNwb25zZSk7XG4gICAgICAgICAgICAvLyBFVkVOVDogT05fUkVTVUxUXG4gICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5SRVNVTFQsIHZhcmlhYmxlLCBlcnJNc2csIGFkdmFuY2VkT3B0aW9ucyk7XG4gICAgICAgICAgICAvLyBFVkVOVDogT05fRVJST1JcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5za2lwTm90aWZpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuRVJST1IsIHZhcmlhYmxlLCBlcnJNc2csIGFkdmFuY2VkT3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBFVkVOVDogT05fQ0FOX1VQREFURVxuICAgICAgICAgICAgdmFyaWFibGUuY2FuVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkNBTl9VUERBVEUsIHZhcmlhYmxlLCBlcnJNc2csIGFkdmFuY2VkT3B0aW9ucyk7XG4gICAgICAgICAgICB0cmlnZ2VyRm4oZXJyb3IsIGVyck1zZyk7XG4gICAgICAgICAgICByZWplY3QoZXJyTXNnKTtcbiAgICAgICAgfTtcblxuICAgICAgICBvbkNVRHN1Y2Nlc3MgPSAoZGF0YTogYW55LCByZXNvbHZlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGxldCByZXNwb25zZSA9IGRhdGEuYm9keTtcbiAgICAgICAgICAgIGNvbnN0IGFkdmFuY2VkT3B0aW9uczogQWR2YW5jZWRPcHRpb25zID0gdGhpcy5wcmVwYXJlQ2FsbGJhY2tPcHRpb25zKGRhdGEpO1xuXG4gICAgICAgICAgICAkcXVldWUucHJvY2Vzcyh2YXJpYWJsZSk7XG4gICAgICAgICAgICAvKiBpZiBlcnJvciByZWNlaXZlZCBvbiBtYWtpbmcgY2FsbCwgY2FsbCBlcnJvciBjYWxsYmFjayAqL1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgLy8gRVZFTlQ6IE9OX1JFU1VMVFxuICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULlJFU1VMVCwgdmFyaWFibGUsIHJlc3BvbnNlLCBhZHZhbmNlZE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIC8vIEVWRU5UOiBPTl9FUlJPUlxuICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkVSUk9SLCB2YXJpYWJsZSwgcmVzcG9uc2UuZXJyb3IsIGFkdmFuY2VkT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgLy8gRVZFTlQ6IE9OX0NBTl9VUERBVEVcbiAgICAgICAgICAgICAgICB2YXJpYWJsZS5jYW5VcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkNBTl9VUERBVEUsIHZhcmlhYmxlLCByZXNwb25zZS5lcnJvciwgYWR2YW5jZWRPcHRpb25zKTtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oZXJyb3IsIHJlc3BvbnNlLmVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVzcG9uc2UuZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFVkVOVDogT05fUkVTVUxUXG4gICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5SRVNVTFQsIHZhcmlhYmxlLCByZXNwb25zZSwgYWR2YW5jZWRPcHRpb25zKTtcbiAgICAgICAgICAgIGlmICh2YXJpYWJsZS5vcGVyYXRpb24gIT09ICdyZWFkJykge1xuICAgICAgICAgICAgICAgIC8vIEVWRU5UOiBPTl9QUkVQQVJFU0VUREFUQVxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0RhdGFTZXQgPSBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5QUkVQQVJFX1NFVERBVEEsIHZhcmlhYmxlLCByZXNwb25zZSwgYWR2YW5jZWRPcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpZiAobmV3RGF0YVNldCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBzZXR0aW5nIG5ld0RhdGFTZXQgYXMgdGhlIHJlc3BvbnNlIHRvIHNlcnZpY2UgdmFyaWFibGUgb25QcmVwYXJlU2V0RGF0YVxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IG5ld0RhdGFTZXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhcmlhYmxlLmRhdGFTZXQgPSByZXNwb25zZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gd2F0Y2hlcnMgc2hvdWxkIGdldCB0cmlnZ2VyZWQgYmVmb3JlIGNhbGxpbmcgb25TdWNjZXNzIGV2ZW50LlxuICAgICAgICAgICAgLy8gc28gdGhhdCBhbnkgdmFyaWFibGUvd2lkZ2V0IGRlcGVuZGluZyBvbiB0aGlzIHZhcmlhYmxlJ3MgZGF0YSBpcyB1cGRhdGVkXG4gICAgICAgICAgICAkaW52b2tlV2F0Y2hlcnModHJ1ZSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBFVkVOVDogT05fU1VDQ0VTU1xuICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULlNVQ0NFU1MsIHZhcmlhYmxlLCByZXNwb25zZSwgYWR2YW5jZWRPcHRpb25zKTtcbiAgICAgICAgICAgICAgICAvLyBFVkVOVDogT05fQ0FOX1VQREFURVxuICAgICAgICAgICAgICAgIHZhcmlhYmxlLmNhblVwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuQ0FOX1VQREFURSwgdmFyaWFibGUsIHJlc3BvbnNlLCBhZHZhbmNlZE9wdGlvbnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cmlnZ2VyRm4oc3VjY2VzcywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMubWFrZUNhbGwodmFyaWFibGUsIGFjdGlvbiwgZGJPcGVyYXRpb25zKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgICAgIG9uQ1VEc3VjY2VzcyhkYXRhLCByZXNvbHZlKTtcbiAgICAgICAgICAgIH0sIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBvbkNVRGVycm9yKHJlc3BvbnNlLCByZWplY3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG5cbiAgICBwcml2YXRlIGFnZ3JlZ2F0ZURhdGEoZGVwbG95ZWRVcmwsIHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICBsZXQgdGFibGVPcHRpb25zLFxuICAgICAgICAgICAgZGJPcGVyYXRpb25PcHRpb25zLFxuICAgICAgICAgICAgYWdncmVnYXRlRGF0YVN1Y2Nlc3MsXG4gICAgICAgICAgICBhZ2dyZWdhdGVEYXRhRXJyb3I7XG4gICAgICAgIGNvbnN0IGRiT3BlcmF0aW9uID0gJ2V4ZWN1dGVBZ2dyZWdhdGVRdWVyeSc7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBvcHRpb25zLnNraXBFbmNvZGUgPSB0cnVlO1xuICAgICAgICBpZiAodmFyaWFibGUuZmlsdGVyRmllbGRzKSB7XG4gICAgICAgICAgICB0YWJsZU9wdGlvbnMgPSBMaXZlVmFyaWFibGVVdGlscy5wcmVwYXJlVGFibGVPcHRpb25zKHZhcmlhYmxlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIG9wdGlvbnMuYWdncmVnYXRpb25zLmZpbHRlciA9IHRhYmxlT3B0aW9ucy5xdWVyeTtcbiAgICAgICAgfVxuICAgICAgICBkYk9wZXJhdGlvbk9wdGlvbnMgPSB7XG4gICAgICAgICAgICAnZGF0YU1vZGVsTmFtZSc6IHZhcmlhYmxlLmxpdmVTb3VyY2UsXG4gICAgICAgICAgICAnZW50aXR5TmFtZSc6IHZhcmlhYmxlLnR5cGUsXG4gICAgICAgICAgICAncGFnZSc6IG9wdGlvbnMucGFnZSB8fCAxLFxuICAgICAgICAgICAgJ3NpemUnOiBvcHRpb25zLnNpemUgfHwgdmFyaWFibGUubWF4UmVzdWx0cyxcbiAgICAgICAgICAgICdzb3J0Jzogb3B0aW9ucy5zb3J0IHx8ICcnLFxuICAgICAgICAgICAgJ3VybCc6IGRlcGxveWVkVXJsLFxuICAgICAgICAgICAgJ2RhdGEnOiBvcHRpb25zLmFnZ3JlZ2F0aW9uc1xuICAgICAgICB9O1xuICAgICAgICBhZ2dyZWdhdGVEYXRhU3VjY2VzcyA9IChyZXNwb25zZTogYW55LCByZXNvbHZlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS50eXBlKSB7XG4gICAgICAgICAgICAgICAgaWYgKChyZXNwb25zZSAmJiByZXNwb25zZS5lcnJvcikgfHwgIXJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvciwgcmVzcG9uc2UuZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyaWdnZXJGbihzdWNjZXNzLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGFnZ3JlZ2F0ZURhdGFFcnJvciA9IChlcnJvck1zZzogYW55LCByZWplY3Q6IGFueSkgPT4ge1xuICAgICAgICAgICAgdHJpZ2dlckZuKGVycm9yLCBlcnJvck1zZyk7XG4gICAgICAgICAgICByZWplY3QoZXJyb3JNc2cpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLm1ha2VDYWxsKHZhcmlhYmxlLCBkYk9wZXJhdGlvbiwgZGJPcGVyYXRpb25PcHRpb25zKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIGFnZ3JlZ2F0ZURhdGFTdWNjZXNzKHJlc3BvbnNlLCByZXNvbHZlKTtcbiAgICAgICAgICAgIH0sIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgYWdncmVnYXRlRGF0YUVycm9yKGVyciwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFBVQkxJQyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXG5cbiAgICAvKipcbiAgICAgKiBNYWtlcyBodHRwIGNhbGwgZm9yIGEgTGl2ZSBWYXJpYWJsZSBhZ2FpbnN0IHRoZSBjb25maWd1cmVkIERCIEVudGl0eS5cbiAgICAgKiBHZXRzIHRoZSBwYWdpbmF0ZWQgcmVjb3JkcyBhZ2FpbnN0IHRoZSBlbnRpdHlcbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqIEBwYXJhbSBzdWNjZXNzXG4gICAgICogQHBhcmFtIGVycm9yXG4gICAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn06IHdpbGwgYmUgcmVzb2x2ZWQgb24gc3VjY2Vzc2Z1bCBkYXRhIGZldGNoXG4gICAgICovXG4gICAgcHVibGljIGxpc3RSZWNvcmRzKHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgb3B0aW9ucy5maWx0ZXJGaWVsZHMgPSBvcHRpb25zLmZpbHRlckZpZWxkcyB8fCBnZXRDbG9uZWRPYmplY3QodmFyaWFibGUuZmlsdGVyRmllbGRzKTtcbiAgICAgICAgcmV0dXJuICRxdWV1ZS5zdWJtaXQodmFyaWFibGUpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlJbmZsaWdodCh2YXJpYWJsZSwgIW9wdGlvbnMuc2tpcFRvZ2dsZVN0YXRlKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEVudGl0eURhdGEodmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKVxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkcXVldWUucHJvY2Vzcyh2YXJpYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5SW5mbGlnaHQodmFyaWFibGUsIGZhbHNlLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgJHF1ZXVlLnByb2Nlc3ModmFyaWFibGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeUluZmxpZ2h0KHZhcmlhYmxlLCBmYWxzZSwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGVycm9yKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYWtlcyBhIFBPU1QgaHR0cCBjYWxsIGZvciBhIExpdmUgVmFyaWFibGUgYWdhaW5zdCB0aGUgY29uZmlndXJlZCBEQiBFbnRpdHkuXG4gICAgICogU2VuZHMgYSBUYWJsZSByZWNvcmQgb2JqZWN0IHdpdGggdGhlIHJlcXVlc3QgYm9keVxuICAgICAqIHRoZSByZWNvcmQgaXMgaW5zZXJ0ZWQgaW50byB0aGUgZW50aXR5IGF0IHRoZSBiYWNrZW5kXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0gc3VjY2Vzc1xuICAgICAqIEBwYXJhbSBlcnJvclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59OiB3aWxsIGJlIHJlc29sdmVkIG9uIHN1Y2Nlc3NmdWwgZGF0YSBmZXRjaFxuICAgICAqL1xuICAgIHB1YmxpYyBpbnNlcnRSZWNvcmQodmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBlcmZvcm1DVUQoJ2luc2VydFRhYmxlRGF0YScsIHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFrZXMgYSBQVVQgaHR0cCBjYWxsIGZvciBhIExpdmUgVmFyaWFibGUgYWdhaW5zdCB0aGUgY29uZmlndXJlZCBEQiBFbnRpdHkuXG4gICAgICogU2VuZHMgYSBUYWJsZSByZWNvcmQgb2JqZWN0IHdpdGggdGhlIHJlcXVlc3QgYm9keSBhZ2FpbnN0IHRoZSBwcmltYXJ5IGtleSBvZiBhbiBleGlzdGluZyByZWNvcmRcbiAgICAgKiB0aGUgcmVjb3JkIGlzIHVwZGF0ZWQgaW50byB0aGUgZW50aXR5IGF0IHRoZSBiYWNrZW5kXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0gc3VjY2Vzc1xuICAgICAqIEBwYXJhbSBlcnJvclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59OiB3aWxsIGJlIHJlc29sdmVkIG9uIHN1Y2Nlc3NmdWwgZGF0YSBmZXRjaFxuICAgICAqL1xuICAgIHB1YmxpYyB1cGRhdGVSZWNvcmQodmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBlcmZvcm1DVUQoJ3VwZGF0ZVRhYmxlRGF0YScsIHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFrZXMgYSBERUxFVEUgaHR0cCBjYWxsIGZvciBhIExpdmUgVmFyaWFibGUgYWdhaW5zdCB0aGUgY29uZmlndXJlZCBEQiBFbnRpdHkuXG4gICAgICogU2VuZHMgdGhlIHByaW1hcnkga2V5IG9mIGFuIGV4aXN0aW5nIHJlY29yZFxuICAgICAqIHRoZSByZWNvcmQgaXMgZGVsZXRlZCBmcm9tIHRoZSBlbnRpdHkgYXQgdGhlIGJhY2tlbmRcbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqIEBwYXJhbSBzdWNjZXNzXG4gICAgICogQHBhcmFtIGVycm9yXG4gICAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn06IHdpbGwgYmUgcmVzb2x2ZWQgb24gc3VjY2Vzc2Z1bCBkYXRhIGZldGNoXG4gICAgICovXG4gICAgcHVibGljIGRlbGV0ZVJlY29yZCh2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGVyZm9ybUNVRCgnZGVsZXRlVGFibGVEYXRhJywgdmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzZXRzIHRoZSB2YWx1ZSBhZ2FpbnN0IHBhc3NlZCBrZXkgb24gdGhlIFwiaW5wdXRGaWVsZHNcIiBvYmplY3QgaW4gdGhlIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIGtleTogY2FuIGJlOlxuICAgICAqICAtIGEgc3RyaW5nIGUuZy4gXCJ1c2VybmFtZVwiXG4gICAgICogIC0gYW4gb2JqZWN0LCBlLmcuIHtcInVzZXJuYW1lXCI6IFwiam9oblwiLCBcInNzblwiOiBcIjExMTExXCJ9XG4gICAgICogQHBhcmFtIHZhbFxuICAgICAqIC0gaWYga2V5IGlzIHN0cmluZywgdGhlIHZhbHVlIGFnYWluc3QgaXQgKGZvciB0aGF0IGRhdGEgdHlwZSlcbiAgICAgKiAtIGlmIGtleSBpcyBvYmplY3QsIG5vdCByZXF1aXJlZFxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0SW5wdXQodmFyaWFibGUsIGtleSwgdmFsLCBvcHRpb25zKSB7XG4gICAgICAgIHZhcmlhYmxlLmlucHV0RmllbGRzID0gdmFyaWFibGUuaW5wdXRGaWVsZHMgfHwge307XG4gICAgICAgIHJldHVybiBzZXRJbnB1dCh2YXJpYWJsZS5pbnB1dEZpZWxkcywga2V5LCB2YWwsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNldHMgdGhlIHZhbHVlIGFnYWluc3QgcGFzc2VkIGtleSBvbiB0aGUgXCJmaWx0ZXJGaWVsZHNcIiBvYmplY3QgaW4gdGhlIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIGtleTogY2FuIGJlOlxuICAgICAqICAtIGEgc3RyaW5nIGUuZy4gXCJ1c2VybmFtZVwiXG4gICAgICogIC0gYW4gb2JqZWN0LCBlLmcuIHtcInVzZXJuYW1lXCI6IFwiam9oblwiLCBcInNzblwiOiBcIjExMTExXCJ9XG4gICAgICogQHBhcmFtIHZhbFxuICAgICAqIC0gaWYga2V5IGlzIHN0cmluZywgdGhlIHZhbHVlIGFnYWluc3QgaXQgKGZvciB0aGF0IGRhdGEgdHlwZSlcbiAgICAgKiAtIGlmIGtleSBpcyBvYmplY3QsIG5vdCByZXF1aXJlZFxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RmlsdGVyKHZhcmlhYmxlLCBrZXksIHZhbCkge1xuICAgICAgICBsZXQgcGFyYW1PYmo6IGFueSA9IHt9LFxuICAgICAgICAgICAgdGFyZ2V0T2JqOiBhbnkgPSB7fTtcbiAgICAgICAgaWYgKF8uaXNPYmplY3Qoa2V5KSkge1xuICAgICAgICAgICAgcGFyYW1PYmogPSBrZXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJhbU9ialtrZXldID0gdmFsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF2YXJpYWJsZS5maWx0ZXJFeHByZXNzaW9ucykge1xuICAgICAgICAgICAgdmFyaWFibGUuZmlsdGVyRXhwcmVzc2lvbnMgPSB7J2NvbmRpdGlvbic6ICdBTkQnLCAncnVsZXMnOiBbXX07XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0T2JqID0gdmFyaWFibGUuZmlsdGVyRXhwcmVzc2lvbnM7XG5cbiAgICAgICAgLy8gZmluZCB0aGUgZXhpc3RpbmcgY3JpdGVyaWEgaWYgcHJlc2VudCBvciBlbHNlIHJldHVybiBudWxsLiBGaW5kIHRoZSBmaXJzdCBvbmUgYW5kIHJldHVybi5cbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgd2FudHMgdG8gc2V0IGEgZGlmZmVyZW50IG9iamVjdCwgdGhlbiBoZSBoYXMgdG8gdXNlIHRoZSBnZXRDcml0ZXJpYSBBUEkgZGVmaW5lZFxuICAgICAgICAvLyBvbiB0aGUgZGF0YUZpbHRlciBvYmplY3QgcGFzc2VkIHRvIHRoZSBvbkJlZm9yZUxpc3RSZWNvcmRzXG4gICAgICAgIGZ1bmN0aW9uIGdldEV4aXN0aW5nQ3JpdGVyaWEoZmlsdGVyRmllbGQpIHtcbiAgICAgICAgICAgIGxldCBleGlzdGluZ0NyaXRlcmlhID0gbnVsbDtcbiAgICAgICAgICAgIExpdmVWYXJpYWJsZVV0aWxzLnRyYXZlcnNlRmlsdGVyRXhwcmVzc2lvbnModGFyZ2V0T2JqLCBmdW5jdGlvbiAoZmlsdGVyRXhwcmVzc2lvbnMsIGNyaXRlcmlhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlckZpZWxkID09PSBjcml0ZXJpYS50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4aXN0aW5nQ3JpdGVyaWEgPSBjcml0ZXJpYTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBleGlzdGluZ0NyaXRlcmlhO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5mb3JFYWNoKHBhcmFtT2JqLCBmdW5jdGlvbiAocGFyYW1WYWwsIHBhcmFtS2V5KSB7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ0NyaXRlcmlhID0gZ2V0RXhpc3RpbmdDcml0ZXJpYShwYXJhbUtleSk7XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmdDcml0ZXJpYSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGV4aXN0aW5nQ3JpdGVyaWEudmFsdWUgPSBwYXJhbVZhbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0T2JqLnJ1bGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHBhcmFtS2V5LFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hNb2RlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHBhcmFtVmFsLFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogZmFsc2VcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldE9iajtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYWtlcyBhIGZpbGUgZG93bmxvYWQgY2FsbCBmb3IgYSB0YWJsZVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICovXG4gICAgcHVibGljIGRvd25sb2FkKHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzSGFuZGxlciwgZXJyb3JIYW5kbGVyKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBsZXQgdGFibGVPcHRpb25zLFxuICAgICAgICAgICAgZGJPcGVyYXRpb25PcHRpb25zLFxuICAgICAgICAgICAgZG93bmxvYWRTdWNjZXNzLFxuICAgICAgICAgICAgZG93bmxvYWRFcnJvcjtcbiAgICAgICAgY29uc3QgZGF0YTogYW55ID0ge307XG4gICAgICAgIGNvbnN0IGRiT3BlcmF0aW9uID0gJ2V4cG9ydFRhYmxlRGF0YSc7XG4gICAgICAgIGNvbnN0IHByb2plY3RJRCA9ICRyb290U2NvcGUucHJvamVjdC5pZCB8fCAkcm9vdFNjb3BlLnByb2plY3ROYW1lO1xuICAgICAgICBvcHRpb25zLmRhdGEuc2VhcmNoV2l0aFF1ZXJ5ID0gdHJ1ZTsgLy8gRm9yIGV4cG9ydCwgcXVlcnkgYXBpIGlzIHVzZWQuIFNvIHNldCB0aGlzIGZsYWcgdG8gdHJ1ZVxuICAgICAgICBvcHRpb25zLmRhdGEuc2tpcEVuY29kZSA9IHRydWU7XG4gICAgICAgIHRhYmxlT3B0aW9ucyA9IExpdmVWYXJpYWJsZVV0aWxzLnByZXBhcmVUYWJsZU9wdGlvbnModmFyaWFibGUsIG9wdGlvbnMuZGF0YSwgdW5kZWZpbmVkKTtcbiAgICAgICAgZGF0YS5xdWVyeSA9IHRhYmxlT3B0aW9ucy5xdWVyeSA/IHRhYmxlT3B0aW9ucy5xdWVyeSA6ICcnO1xuICAgICAgICBkYXRhLmV4cG9ydFNpemUgPSBvcHRpb25zLmRhdGEuZXhwb3J0U2l6ZTtcbiAgICAgICAgZGF0YS5leHBvcnRUeXBlID0gb3B0aW9ucy5kYXRhLmV4cG9ydFR5cGU7XG4gICAgICAgIGRhdGEuZmllbGRzID0gZm9ybWF0RXhwb3J0RXhwcmVzc2lvbihvcHRpb25zLmRhdGEuZmllbGRzKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuZGF0YS5maWxlTmFtZSkge1xuICAgICAgICAgICAgZGF0YS5maWxlTmFtZSA9IG9wdGlvbnMuZGF0YS5maWxlTmFtZTtcbiAgICAgICAgfVxuICAgICAgICBkYk9wZXJhdGlvbk9wdGlvbnMgPSB7XG4gICAgICAgICAgICAncHJvamVjdElEJzogcHJvamVjdElELFxuICAgICAgICAgICAgJ3NlcnZpY2UnOiB2YXJpYWJsZS5nZXRQcmVmYWJOYW1lKCkgPyAnJyA6ICdzZXJ2aWNlcycsXG4gICAgICAgICAgICAnZGF0YU1vZGVsTmFtZSc6IHZhcmlhYmxlLmxpdmVTb3VyY2UsXG4gICAgICAgICAgICAnZW50aXR5TmFtZSc6IHZhcmlhYmxlLnR5cGUsXG4gICAgICAgICAgICAnc29ydCc6IHRhYmxlT3B0aW9ucy5zb3J0LFxuICAgICAgICAgICAgJ3VybCc6IHZhcmlhYmxlLmdldFByZWZhYk5hbWUoKSA/ICgkcm9vdFNjb3BlLnByb2plY3QuZGVwbG95ZWRVcmwgKyAnL3ByZWZhYnMvJyArIHZhcmlhYmxlLmdldFByZWZhYk5hbWUoKSkgOiAkcm9vdFNjb3BlLnByb2plY3QuZGVwbG95ZWRVcmwsXG4gICAgICAgICAgICAnZGF0YSc6IGRhdGEsXG4gICAgICAgICAgICAnZmlsdGVyJzogTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0V2hlcmVDbGF1c2VHZW5lcmF0b3IodmFyaWFibGUsIG9wdGlvbnMpXG4gICAgICAgICAgICAvLyAnZmlsdGVyTWV0YScgICAgOiB0YWJsZU9wdGlvbnMuZmlsdGVyXG4gICAgICAgIH07XG4gICAgICAgIGRvd25sb2FkU3VjY2VzcyA9IChyZXNwb25zZTogYW55LCByZXNvbHZlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS50eXBlKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSByZXNwb25zZS5ib2R5LnJlc3VsdDtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oc3VjY2Vzc0hhbmRsZXIsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZG93bmxvYWRFcnJvciA9IChlcnI6IGFueSwgcmVqZWN0OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wdDogQWR2YW5jZWRPcHRpb25zID0gdGhpcy5wcmVwYXJlQ2FsbGJhY2tPcHRpb25zKGVyci5kZXRhaWxzKTtcbiAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkVSUk9SLCB2YXJpYWJsZSwgZXJyLmVycm9yLCBvcHQpO1xuICAgICAgICAgICAgdHJpZ2dlckZuKGVycm9ySGFuZGxlciwgZXJyLmVycm9yKTtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5tYWtlQ2FsbCh2YXJpYWJsZSwgZGJPcGVyYXRpb24sIGRiT3BlcmF0aW9uT3B0aW9ucykudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBkb3dubG9hZFN1Y2Nlc3MocmVzcG9uc2UsIHJlc29sdmUpO1xuICAgICAgICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgZG93bmxvYWRFcnJvcihlcnJvciwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBnZXRzIHByaW1hcnkga2V5cyBhZ2FpbnN0IHRoZSBwYXNzZWQgcmVsYXRlZCBUYWJsZVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSByZWxhdGVkRmllbGRcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRSZWxhdGVkVGFibGVQcmltYXJ5S2V5cyh2YXJpYWJsZSwgcmVsYXRlZEZpZWxkKSB7XG4gICAgICAgIGxldCBwcmltYXJ5S2V5cyxcbiAgICAgICAgICAgIHJlc3VsdCxcbiAgICAgICAgICAgIHJlbGF0ZWRDb2xzO1xuICAgICAgICBpZiAoIXZhcmlhYmxlLnByb3BlcnRpZXNNYXApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBfLmZpbmQodmFyaWFibGUucHJvcGVydGllc01hcC5jb2x1bW5zIHx8IFtdLCB7J2ZpZWxkTmFtZSc6IHJlbGF0ZWRGaWVsZH0pO1xuICAgICAgICAvLyBpZiByZWxhdGVkIGZpZWxkIG5hbWUgcGFzc2VkLCBnZXQgaXRzIHR5cGUgZnJvbSBjb2x1bW5zIGluc2lkZSB0aGUgY3VycmVudCBmaWVsZFxuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICByZWxhdGVkQ29scyA9IHJlc3VsdC5jb2x1bW5zO1xuICAgICAgICAgICAgcHJpbWFyeUtleXMgPSBfLm1hcChfLmZpbHRlcihyZWxhdGVkQ29scywgJ2lzUHJpbWFyeUtleScpLCAnZmllbGROYW1lJyk7XG4gICAgICAgICAgICBpZiAocHJpbWFyeUtleXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByaW1hcnlLZXlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlbGF0ZWRDb2xzICYmIHJlbGF0ZWRDb2xzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJlbGF0ZWRDb2xzID0gXy5maW5kKHJlbGF0ZWRDb2xzLCB7J2lzUmVsYXRlZCc6IGZhbHNlfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0ZWRDb2xzICYmIHJlbGF0ZWRDb2xzLmZpZWxkTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ha2VzIEhUVFAgY2FsbCB0byBnZXQgdGhlIGRhdGEgZm9yIHJlbGF0ZWQgZW50aXR5IG9mIGEgZmllbGQgaW4gYW4gZW50aXR5XG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIGNvbHVtbk5hbWVcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqIEBwYXJhbSBzdWNjZXNzXG4gICAgICogQHBhcmFtIGVycm9yXG4gICAgICovXG4gICAgcHVibGljIGdldFJlbGF0ZWRUYWJsZURhdGEodmFyaWFibGUsIGNvbHVtbk5hbWUsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIGNvbnN0IHByb2plY3RJRCA9ICRyb290U2NvcGUucHJvamVjdC5pZCB8fCAkcm9vdFNjb3BlLnByb2plY3ROYW1lO1xuICAgICAgICBjb25zdCByZWxhdGVkVGFibGUgPSBfLmZpbmQodmFyaWFibGUucmVsYXRlZFRhYmxlcywgdGFibGUgPT4gdGFibGUucmVsYXRpb25OYW1lID09PSBjb2x1bW5OYW1lIHx8IHRhYmxlLmNvbHVtbk5hbWUgPT09IGNvbHVtbk5hbWUpOyAvLyBDb21wYXJpbmcgY29sdW1uIG5hbWUgdG8gc3VwcG9ydCB0aGUgb2xkIHByb2plY3RzXG4gICAgICAgIGNvbnN0IHNlbGZSZWxhdGVkQ29scyA9IF8ubWFwKF8uZmlsdGVyKHZhcmlhYmxlLnJlbGF0ZWRUYWJsZXMsIG8gPT4gby50eXBlID09PSB2YXJpYWJsZS50eXBlKSwgJ3JlbGF0aW9uTmFtZScpO1xuICAgICAgICBjb25zdCBmaWx0ZXJGaWVsZHMgPSBbXTtcbiAgICAgICAgbGV0IG9yZGVyQnksXG4gICAgICAgICAgICBmaWx0ZXJPcHRpb25zLFxuICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICBhY3Rpb24sXG4gICAgICAgICAgICBkYk9wZXJhdGlvbk9wdGlvbnMsXG4gICAgICAgICAgICBnZXRSZWxhdGVkVGFibGVEYXRhU3VjY2VzcyxcbiAgICAgICAgICAgIGdldFJlbGF0ZWRUYWJsZURhdGFFcnJvcjtcbiAgICAgICAgXy5mb3JFYWNoKG9wdGlvbnMuZmlsdGVyRmllbGRzLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgdmFsdWUuZmllbGROYW1lID0ga2V5O1xuICAgICAgICAgICAgdmFsdWUudHlwZSA9IExpdmVWYXJpYWJsZVV0aWxzLmdldEZpZWxkVHlwZShjb2x1bW5OYW1lLCB2YXJpYWJsZSwga2V5KTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZm9yICdpbicgbW9kZSB3ZSBhcmUgdGFraW5nIHRoZSBpbnB1dCBhcyBjb21tYSBzZXBhcmF0ZWQgdmFsdWVzIGFuZCBmb3IgYmV0d2VlbiBpbiB1aSB0aGVyZSBhcmUgdHdvIGRpZmZlcmVudCBmaWVsZHNcbiAgICAgICAgICAgICAqIGJ1dCB0aGVzZSBhcmUgcHJvY2Vzc2VkIGFuZCBtZXJnZWQgaW50byBhIHNpbmdsZSB2YWx1ZSB3aXRoIGNvbW1hIGFzIHNlcGFyYXRvci4gRm9yIHRoZXNlIGNvbmRpdGlvbnMgbGlrZSAnaW4nIGFuZCAnYmV0d2VlbicsXG4gICAgICAgICAgICAgKiBmb3IgYnVpbGRpbmcgdGhlIHF1ZXJ5LCB0aGUgZnVuY3Rpb24gZXhwZWN0cyB0aGUgdmFsdWVzIHRvIGJlIGFuIGFycmF5XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmICh2YWx1ZS5maWx0ZXJDb25kaXRpb24gPT09IERCX0NPTlNUQU5UUy5EQVRBQkFTRV9NQVRDSF9NT0RFUy5pbi50b0xvd2VyQ2FzZSgpIHx8IHZhbHVlLmZpbHRlckNvbmRpdGlvbiA9PT0gREJfQ09OU1RBTlRTLkRBVEFCQVNFX01BVENIX01PREVTLmJldHdlZW4udG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLnZhbHVlID0gdmFsdWUudmFsdWUuc3BsaXQoJywnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbHRlckZpZWxkcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZpbHRlck9wdGlvbnMgPSBMaXZlVmFyaWFibGVVdGlscy5nZXRGaWx0ZXJPcHRpb25zKHZhcmlhYmxlLCBmaWx0ZXJGaWVsZHMsIG9wdGlvbnMpO1xuICAgICAgICBxdWVyeSA9IExpdmVWYXJpYWJsZVV0aWxzLmdldFNlYXJjaFF1ZXJ5KGZpbHRlck9wdGlvbnMsICcgJyArIChvcHRpb25zLmxvZ2ljYWxPcCB8fCAnQU5EJykgKyAnICcsIHZhcmlhYmxlLmlnbm9yZUNhc2UpO1xuICAgICAgICBpZiAob3B0aW9ucy5maWx0ZXJFeHByKSB7XG4gICAgICAgICAgICBjb25zdCBfY2xvbmVkRmllbGRzID0gZ2V0Q2xvbmVkT2JqZWN0KF8uaXNPYmplY3Qob3B0aW9ucy5maWx0ZXJFeHByKSA/IG9wdGlvbnMuZmlsdGVyRXhwciA6IEpTT04ucGFyc2Uob3B0aW9ucy5maWx0ZXJFeHByKSk7XG4gICAgICAgICAgICBMaXZlVmFyaWFibGVVdGlscy5wcm9jZXNzRmlsdGVyRmllbGRzKF9jbG9uZWRGaWVsZHMucnVsZXMsIHZhcmlhYmxlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckV4cFF1ZXJ5ID0gTGl2ZVZhcmlhYmxlVXRpbHMuZ2VuZXJhdGVTZWFyY2hRdWVyeShfY2xvbmVkRmllbGRzLnJ1bGVzLCBfY2xvbmVkRmllbGRzLmNvbmRpdGlvbiwgdmFyaWFibGUuaWdub3JlQ2FzZSwgb3B0aW9ucy5za2lwRW5jb2RlKTtcbiAgICAgICAgICAgIGlmIChxdWVyeSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICBpZiAoZmlsdGVyRXhwUXVlcnkgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5ID0gJygnICsgcXVlcnkgKyAnKSBBTkQgKCcgKyBmaWx0ZXJFeHBRdWVyeSArICcpJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZpbHRlckV4cFF1ZXJ5ICE9PSAnJykge1xuICAgICAgICAgICAgICAgIHF1ZXJ5ID0gZmlsdGVyRXhwUXVlcnk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVlcnkgPSBxdWVyeSA/ICgncT0nICsgcXVlcnkpIDogJyc7XG4gICAgICAgIGFjdGlvbiA9ICdzZWFyY2hUYWJsZURhdGFXaXRoUXVlcnknO1xuICAgICAgICBvcmRlckJ5ID0gXy5pc0VtcHR5KG9wdGlvbnMub3JkZXJCeSkgPyAnJyA6ICdzb3J0PScgKyBvcHRpb25zLm9yZGVyQnk7XG4gICAgICAgIGRiT3BlcmF0aW9uT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHByb2plY3RJRDogcHJvamVjdElELFxuICAgICAgICAgICAgc2VydmljZTogdmFyaWFibGUuZ2V0UHJlZmFiTmFtZSgpID8gJycgOiAnc2VydmljZXMnLFxuICAgICAgICAgICAgZGF0YU1vZGVsTmFtZTogdmFyaWFibGUubGl2ZVNvdXJjZSxcbiAgICAgICAgICAgIGVudGl0eU5hbWU6IHJlbGF0ZWRUYWJsZSA/IHJlbGF0ZWRUYWJsZS50eXBlIDogJycsXG4gICAgICAgICAgICBwYWdlOiBvcHRpb25zLnBhZ2UgfHwgMSxcbiAgICAgICAgICAgIHNpemU6IG9wdGlvbnMucGFnZXNpemUgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgdXJsOiB2YXJpYWJsZS5nZXRQcmVmYWJOYW1lKCkgPyAoJHJvb3RTY29wZS5wcm9qZWN0LmRlcGxveWVkVXJsICsgJy9wcmVmYWJzLycgKyB2YXJpYWJsZS5nZXRQcmVmYWJOYW1lKCkpIDogJHJvb3RTY29wZS5wcm9qZWN0LmRlcGxveWVkVXJsLFxuICAgICAgICAgICAgZGF0YTogcXVlcnkgfHwgJycsXG4gICAgICAgICAgICBmaWx0ZXI6IExpdmVWYXJpYWJsZVV0aWxzLmdldFdoZXJlQ2xhdXNlR2VuZXJhdG9yKHZhcmlhYmxlLCBvcHRpb25zKSxcbiAgICAgICAgICAgIHNvcnQ6IG9yZGVyQnlcbiAgICAgICAgfTtcbiAgICAgICAgZ2V0UmVsYXRlZFRhYmxlRGF0YVN1Y2Nlc3MgPSAocmVzOiBhbnksIHJlc29sdmU6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHJlcyAmJiByZXMudHlwZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gcmVzLmJvZHk7XG4gICAgICAgICAgICAgICAgLypSZW1vdmUgdGhlIHNlbGYgcmVsYXRlZCBjb2x1bW5zIGZyb20gdGhlIGRhdGEuIEFzIGJhY2tlbmQgaXMgcmVzdHJpY3RpbmcgdGhlIHNlbGYgcmVsYXRlZCBjb2x1bW4gdG8gb25lIGxldmVsLCBJbiBsaXZlZm9ybSBzZWxlY3QsIGRhdGFzZXQgYW5kIGRhdGF2YWx1ZSBvYmplY3RcbiAgICAgICAgICAgICAgICAgKiBlcXVhbGl0eSBkb2VzIG5vdCB3b3JrLiBTbywgcmVtb3ZpbmcgdGhlIHNlbGYgcmVsYXRlZCBjb2x1bW5zIHRvIGFjaGVpdmUgdGhlIHF1YWxpdHkqL1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBfLm1hcChyZXNwb25zZS5jb250ZW50LCBvID0+IF8ub21pdChvLCBzZWxmUmVsYXRlZENvbHMpKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2luYXRpb24gPSBPYmplY3QuYXNzaWduKHt9LCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHBhZ2luYXRpb24uY29udGVudDtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtkYXRhOiBkYXRhLCBwYWdpbmF0aW9ufTtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oc3VjY2VzcywgcmVzdWx0KTtcblxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZ2V0UmVsYXRlZFRhYmxlRGF0YUVycm9yID0gKGVyck1zZzogYW55LCByZWplY3Q6IGFueSkgPT4ge1xuICAgICAgICAgICAgdHJpZ2dlckZuKGVycm9yLCBlcnJNc2cpO1xuICAgICAgICAgICAgcmVqZWN0KGVyck1zZyk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLm1ha2VDYWxsKHZhcmlhYmxlLCBhY3Rpb24sIGRiT3BlcmF0aW9uT3B0aW9ucykudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBnZXRSZWxhdGVkVGFibGVEYXRhU3VjY2VzcyhyZXNwb25zZSwgcmVzb2x2ZSk7XG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xuICAgICAgICAgICAgICAgIGdldFJlbGF0ZWRUYWJsZURhdGFFcnJvcihlcnIsIHJlamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZGlzdGluY3QgcmVjb3JkcyBmb3IgYW4gZW50aXR5XG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0gc3VjY2Vzc1xuICAgICAqIEBwYXJhbSBlcnJvclxuICAgICAqL1xuICAgIHB1YmxpYyBnZXREaXN0aW5jdERhdGFCeUZpZWxkcyh2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZGJPcGVyYXRpb24gPSAnZ2V0RGlzdGluY3REYXRhQnlGaWVsZHMnO1xuICAgICAgICBjb25zdCBwcm9qZWN0SUQgPSAkcm9vdFNjb3BlLnByb2plY3QuaWQgfHwgJHJvb3RTY29wZS5wcm9qZWN0TmFtZTtcbiAgICAgICAgY29uc3QgcmVxdWVzdERhdGE6IGFueSA9IHt9O1xuICAgICAgICBsZXQgc29ydDtcbiAgICAgICAgbGV0IHRhYmxlT3B0aW9ucyxcbiAgICAgICAgICAgIGRiT3BlcmF0aW9uT3B0aW9ucyxcbiAgICAgICAgICAgIGdldERpc3RpbmN0RGF0YUJ5RmllbGRzU3VjY2VzcyxcbiAgICAgICAgICAgIGdldERpc3RpbmN0RGF0YUJ5RmllbGRzRXJyb3I7XG4gICAgICAgIG9wdGlvbnMuc2tpcEVuY29kZSA9IHRydWU7XG4gICAgICAgIG9wdGlvbnMub3BlcmF0aW9uID0gJ3JlYWQnO1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgdGFibGVPcHRpb25zID0gTGl2ZVZhcmlhYmxlVXRpbHMucHJlcGFyZVRhYmxlT3B0aW9ucyh2YXJpYWJsZSwgb3B0aW9ucyk7XG4gICAgICAgIGlmICh0YWJsZU9wdGlvbnMucXVlcnkpIHtcbiAgICAgICAgICAgIHJlcXVlc3REYXRhLmZpbHRlciA9IHRhYmxlT3B0aW9ucy5xdWVyeTtcbiAgICAgICAgfVxuICAgICAgICByZXF1ZXN0RGF0YS5ncm91cEJ5RmllbGRzID0gXy5pc0FycmF5KG9wdGlvbnMuZmllbGRzKSA/IG9wdGlvbnMuZmllbGRzIDogW29wdGlvbnMuZmllbGRzXTtcbiAgICAgICAgc29ydCA9IG9wdGlvbnMuc29ydCB8fCByZXF1ZXN0RGF0YS5ncm91cEJ5RmllbGRzWzBdICsgJyBhc2MnO1xuICAgICAgICBzb3J0ID0gc29ydCA/ICdzb3J0PScgKyBzb3J0IDogJyc7XG4gICAgICAgIGRiT3BlcmF0aW9uT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICdwcm9qZWN0SUQnOiBwcm9qZWN0SUQsXG4gICAgICAgICAgICAnc2VydmljZSc6IHZhcmlhYmxlLmdldFByZWZhYk5hbWUoKSA/ICcnIDogJ3NlcnZpY2VzJyxcbiAgICAgICAgICAgICdkYXRhTW9kZWxOYW1lJzogdmFyaWFibGUubGl2ZVNvdXJjZSxcbiAgICAgICAgICAgICdlbnRpdHlOYW1lJzogb3B0aW9ucy5lbnRpdHlOYW1lIHx8IHZhcmlhYmxlLnR5cGUsXG4gICAgICAgICAgICAncGFnZSc6IG9wdGlvbnMucGFnZSB8fCAxLFxuICAgICAgICAgICAgJ3NpemUnOiBvcHRpb25zLnBhZ2VzaXplLFxuICAgICAgICAgICAgJ3NvcnQnOiBzb3J0LFxuICAgICAgICAgICAgJ2RhdGEnOiByZXF1ZXN0RGF0YSxcbiAgICAgICAgICAgICdmaWx0ZXInOiBMaXZlVmFyaWFibGVVdGlscy5nZXRXaGVyZUNsYXVzZUdlbmVyYXRvcih2YXJpYWJsZSwgb3B0aW9ucyksXG4gICAgICAgICAgICAndXJsJzogdmFyaWFibGUuZ2V0UHJlZmFiTmFtZSgpID8gKCRyb290U2NvcGUucHJvamVjdC5kZXBsb3llZFVybCArICcvcHJlZmFicy8nICsgdmFyaWFibGUuZ2V0UHJlZmFiTmFtZSgpKSA6ICRyb290U2NvcGUucHJvamVjdC5kZXBsb3llZFVybFxuICAgICAgICB9O1xuICAgICAgICBnZXREaXN0aW5jdERhdGFCeUZpZWxkc1N1Y2Nlc3MgPSAocmVzcG9uc2U6IGFueSwgcmVzb2x2ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UudHlwZSkge1xuICAgICAgICAgICAgICAgIGlmICgocmVzcG9uc2UgJiYgcmVzcG9uc2UuZXJyb3IpIHx8ICFyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oZXJyb3IsIHJlc3BvbnNlLmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlc3BvbnNlLmVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHJlc3BvbnNlLmJvZHk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFnaW5hdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIHJlc3BvbnNlLmJvZHkpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBwYWdpbmF0aW9uLmNvbnRlbnQ7XG5cbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7ZGF0YTogcmVzdWx0LmNvbnRlbnQsIHBhZ2luYXRpb259O1xuICAgICAgICAgICAgICAgIHRyaWdnZXJGbihzdWNjZXNzLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZ2V0RGlzdGluY3REYXRhQnlGaWVsZHNFcnJvciA9IChlcnJvck1zZzogYW55LCByZWplY3Q6IGFueSkgPT4ge1xuICAgICAgICAgICAgdHJpZ2dlckZuKGVycm9yLCBlcnJvck1zZyk7XG4gICAgICAgICAgICByZWplY3QoZXJyb3JNc2cpO1xuICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubWFrZUNhbGwodmFyaWFibGUsIGRiT3BlcmF0aW9uLCBkYk9wZXJhdGlvbk9wdGlvbnMpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGdldERpc3RpbmN0RGF0YUJ5RmllbGRzU3VjY2VzcyhyZXNwb25zZSwgcmVzb2x2ZSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBnZXREaXN0aW5jdERhdGFCeUZpZWxkc0Vycm9yKGVycm9yLCByZWplY3QpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLypGdW5jdGlvbiB0byBnZXQgdGhlIGFnZ3JlZ2F0ZWQgZGF0YSBiYXNlZCBvbiB0aGUgZmllbGRzIGNob3NlbiovXG4gICAgcHVibGljIGdldEFnZ3JlZ2F0ZWREYXRhKHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICBjb25zdCBkZXBsb3llZFVSTCA9IGFwcE1hbmFnZXIuZ2V0RGVwbG95ZWRVUkwoKTtcbiAgICAgICAgaWYgKGRlcGxveWVkVVJMKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZ2dyZWdhdGVEYXRhKGRlcGxveWVkVVJMLCB2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRlZmluZUZpcnN0TGFzdFJlY29yZCh2YXJpYWJsZSkge1xuICAgICAgICBpZiAodmFyaWFibGUub3BlcmF0aW9uID09PSAncmVhZCcpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh2YXJpYWJsZSwgJ2ZpcnN0UmVjb3JkJywge1xuICAgICAgICAgICAgICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICAgICAgICAgICAgICdnZXQnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLmdldCh2YXJpYWJsZS5kYXRhU2V0LCAnZGF0YVswXScsIHt9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh2YXJpYWJsZSwgJ2xhc3RSZWNvcmQnLCB7XG4gICAgICAgICAgICAgICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ2dldCc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IF8uZ2V0KHZhcmlhYmxlLmRhdGFTZXQsICdkYXRhJywgW10pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YVtkYXRhLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldFByaW1hcnlLZXkodmFyaWFibGUpIHtcbiAgICAgICAgcmV0dXJuIExpdmVWYXJpYWJsZVV0aWxzLmdldFByaW1hcnlLZXkodmFyaWFibGUpO1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgdGhlIHNlYXJjaCBxdWVyeSBwYXJhbXMuXG4gICAgcHVibGljIHByZXBhcmVSZXF1ZXN0UGFyYW1zKG9wdGlvbnMpIHtcbiAgICAgICAgbGV0IHJlcXVlc3RQYXJhbXM7XG5cbiAgICAgICAgY29uc3Qgc2VhcmNoS2V5cyA9IF8uc3BsaXQob3B0aW9ucy5zZWFyY2hLZXksICcsJyksXG4gICAgICAgICAgICBtYXRjaE1vZGVzID0gXy5zcGxpdChvcHRpb25zLm1hdGNoTW9kZSwgJywnKSxcbiAgICAgICAgICAgIGZvcm1GaWVsZHMgPSB7fTtcblxuICAgICAgICBfLmZvckVhY2goc2VhcmNoS2V5cywgKGNvbE5hbWUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBmb3JtRmllbGRzW2NvbE5hbWVdID0ge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRpb25zLnF1ZXJ5LFxuICAgICAgICAgICAgICAgIGxvZ2ljYWxPcDogJ0FORCcsXG4gICAgICAgICAgICAgICAgbWF0Y2hNb2RlOiBtYXRjaE1vZGVzW2luZGV4XSB8fCBtYXRjaE1vZGVzWzBdIHx8ICdzdGFydGlnbm9yZWNhc2UnXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXF1ZXN0UGFyYW1zID0ge1xuICAgICAgICAgICAgZmlsdGVyRmllbGRzOiBmb3JtRmllbGRzLFxuICAgICAgICAgICAgcGFnZTogb3B0aW9ucy5wYWdlLFxuICAgICAgICAgICAgcGFnZXNpemU6IG9wdGlvbnMubGltaXQgfHwgb3B0aW9ucy5wYWdlc2l6ZSxcbiAgICAgICAgICAgIHNraXBEYXRhU2V0VXBkYXRlOiB0cnVlLCAvLyBkb250IHVwZGF0ZSB0aGUgYWN0dWFsIHZhcmlhYmxlIGRhdGFzZXQsXG4gICAgICAgICAgICBza2lwVG9nZ2xlU3RhdGU6IHRydWUsIC8vIERvbnQgY2hhbmdlIHRoZSB2YXJpYWJsZSB0b2dnbGUgc3RhdGUgYXMgdGhpcyBpcyBhIGluZGVwZW5kZW50IGNhbGxcbiAgICAgICAgICAgIGluRmxpZ2h0QmVoYXZpb3I6ICdleGVjdXRlQWxsJyxcbiAgICAgICAgICAgIGxvZ2ljYWxPcDogJ09SJyxcbiAgICAgICAgICAgIG9yZGVyQnk6IG9wdGlvbnMub3JkZXJieSA/IF8ucmVwbGFjZShvcHRpb25zLm9yZGVyYnksIC86L2csICcgJykgOiAnJ1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChvcHRpb25zLm9uQmVmb3Jlc2VydmljZWNhbGwpIHtcbiAgICAgICAgICAgIG9wdGlvbnMub25CZWZvcmVzZXJ2aWNlY2FsbChmb3JtRmllbGRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXF1ZXN0UGFyYW1zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGZpbHRlcmVkIHJlY29yZHMgYmFzZWQgb24gc2VhcmNoS2V5XG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIG9wdGlvbnMgY29udGFpbnMgdGhlIHNlYXJjaEtleSBhbmQgcXVlcnlUZXh0XG4gICAgICogQHBhcmFtIHN1Y2Nlc3NcbiAgICAgKiBAcGFyYW0gZXJyb3JcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICAgICAqL1xuICAgIHB1YmxpYyBzZWFyY2hSZWNvcmRzKHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICBjb25zdCByZXF1ZXN0UGFyYW1zID0gdGhpcy5wcmVwYXJlUmVxdWVzdFBhcmFtcyhvcHRpb25zKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5saXN0UmVjb3Jkcyh2YXJpYWJsZSwgcmVxdWVzdFBhcmFtcywgc3VjY2VzcywgZXJyb3IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHVzZWQgaW4gb25CZWZvcmVVcGRhdGUgY2FsbCAtIGNhbGxlZCBsYXN0IGluIHRoZSBmdW5jdGlvbiAtIHVzZWQgaW4gb2xkIFZhcmlhYmxlcyB1c2luZyBkYXRhQmluZGluZy5cbiAgICAgKiBUaGlzIGZ1bmN0aW9uIG1pZ3JhdGVzIHRoZSBvbGQgZGF0YSBkYXRhQmluZGluZyB0byBmaWx0ZXJFeHByZXNzaW9ucyBlcXVpdmFsZW50IGZvcm1hdFxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBpbnB1dERhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHB1YmxpYyB1cGdyYWRlSW5wdXREYXRhVG9GaWx0ZXJFeHByZXNzaW9ucyh2YXJpYWJsZSwgcmVzcG9uc2UsIGlucHV0RGF0YSkge1xuICAgICAgICBpZiAoXy5pc09iamVjdChyZXNwb25zZSkpIHtcbiAgICAgICAgICAgIGlucHV0RGF0YSA9IHJlc3BvbnNlO1xuICAgICAgICAgICAgaW5wdXREYXRhLmNvbmRpdGlvbiA9ICdBTkQnO1xuICAgICAgICAgICAgaW5wdXREYXRhLnJ1bGVzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGlmIHRoZSB1c2VyIGRlbGV0ZXMgYSBwYXJ0aWN1bGFyIGNyaXRlcmlhLCB3ZSBuZWVkIHRvIHJlbW92ZSB0aGlzIGZvcm0gb3VyIGRhdGEgYXN3ZWxsLlxuICAgICAgICAgKiBzbyB3ZSBhcmUga2VlcGluZyBhIGNvcHkgb2YgaXQgYW5kIHRoZSBlbXB0eWluZyB0aGUgZXhpc3Rpbmcgb2JqZWN0IGFuZCBub3cgZmlsbCBpdCB3aXRoIHRoZVxuICAgICAgICAgKiB1c2VyIHNldCBjcml0ZXJpYS4gSWYgaXRzIGp1c3QgbW9kaWZpZWQsIGNoYW5nZSB0aGUgZGF0YSBhbmQgcHVzaCBpdCB0b2hlIHJ1bGVzIG9yIGVsc2UganVzdCBhZGQgYSBuZXcgY3JpdGVyaWFcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGNsb25lZFJ1bGVzID0gXy5jbG9uZURlZXAoaW5wdXREYXRhLnJ1bGVzKTtcbiAgICAgICAgaW5wdXREYXRhLnJ1bGVzID0gW107XG4gICAgICAgIF8uZm9yRWFjaChpbnB1dERhdGEsIGZ1bmN0aW9uICh2YWx1ZU9iaiwga2V5KSB7XG4gICAgICAgICAgICBpZiAoa2V5ICE9PSAnY29uZGl0aW9uJyAmJiBrZXkgIT09ICdydWxlcycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWx0ZXJlZE9iaiA9IF8uZmluZChjbG9uZWRSdWxlcywgbyA9PiBvLnRhcmdldCA9PT0ga2V5KTtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUga2V5IGlzIGZvdW5kIHVwZGF0ZSB0aGUgdmFsdWUsIGVsc2UgY3JlYXRlIGEgbmV3IHJ1bGUgb2JqIGFuZCBhZGQgaXQgdG8gdGhlIGV4aXN0aW5nIHJ1bGVzXG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlcmVkT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkT2JqLnZhbHVlID0gdmFsdWVPYmoudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkT2JqLm1hdGNoTW9kZSA9IHZhbHVlT2JqLm1hdGNoTW9kZSB8fCB2YWx1ZU9iai5maWx0ZXJDb25kaXRpb24gfHwgZmlsdGVyZWRPYmoubWF0Y2hNb2RlIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBpbnB1dERhdGEucnVsZXMucHVzaChmaWx0ZXJlZE9iaik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5wdXREYXRhLnJ1bGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3RhcmdldCc6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0eXBlJzogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF0Y2hNb2RlJzogdmFsdWVPYmoubWF0Y2hNb2RlIHx8IHZhbHVlT2JqLmZpbHRlckNvbmRpdGlvbiB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICd2YWx1ZSc6IHZhbHVlT2JqLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3JlcXVpcmVkJzogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBpbnB1dERhdGFba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBpbnB1dERhdGE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdXNlZCBpbiBvbkJlZm9yZVVwZGF0ZSBjYWxsIC0gY2FsbGVkIGZpcnN0IGluIHRoZSBmdW5jdGlvbiAtIHVzZWQgaW4gb2xkIFZhcmlhYmxlcyB1c2luZyBkYXRhQmluZGluZy5cbiAgICAgKiBUaGlzIGZ1bmN0aW9uIG1pZ3JhdGVzIHRoZSBmaWx0ZXJFeHByZXNzaW9ucyBvYmplY3QgdG8gZmxhdCBtYXAgc3RydWN0dXJlXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIGlucHV0RGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHVibGljIGRvd25ncmFkZUZpbHRlckV4cHJlc3Npb25zVG9JbnB1dERhdGEodmFyaWFibGUsIGlucHV0RGF0YSkge1xuICAgICAgICBpZiAoaW5wdXREYXRhLmhhc093blByb3BlcnR5KCdnZXRGaWx0ZXJGaWVsZHMnKSkge1xuICAgICAgICAgICAgaW5wdXREYXRhID0gaW5wdXREYXRhLmdldEZpbHRlckZpZWxkcygpO1xuICAgICAgICB9XG4gICAgICAgIF8uZm9yRWFjaChpbnB1dERhdGEucnVsZXMsIGZ1bmN0aW9uIChydWxlT2JqKSB7XG4gICAgICAgICAgICBpZiAoIV8uaXNOaWwocnVsZU9iai50YXJnZXQpICYmIHJ1bGVPYmoudGFyZ2V0ICE9PSAnJykge1xuICAgICAgICAgICAgICAgIGlucHV0RGF0YVtydWxlT2JqLnRhcmdldF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICd2YWx1ZSc6IHJ1bGVPYmoudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICdtYXRjaE1vZGUnOiBydWxlT2JqLm1hdGNoTW9kZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaW5wdXREYXRhO1xuICAgIH1cblxuICAgIHB1YmxpYyBjYW5jZWwodmFyaWFibGUsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCRxdWV1ZS5yZXF1ZXN0c1F1ZXVlLmhhcyh2YXJpYWJsZSkgJiYgdmFyaWFibGUuX29ic2VydmFibGUpIHtcbiAgICAgICAgICAgIHZhcmlhYmxlLl9vYnNlcnZhYmxlLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAkcXVldWUucHJvY2Vzcyh2YXJpYWJsZSk7XG4gICAgICAgICAgICAvLyBub3RpZnkgaW5mbGlnaHQgdmFyaWFibGVcbiAgICAgICAgICAgIHRoaXMubm90aWZ5SW5mbGlnaHQodmFyaWFibGUsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==