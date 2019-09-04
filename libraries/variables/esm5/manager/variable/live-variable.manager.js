import * as tslib_1 from "tslib";
import { $invokeWatchers, getClonedObject, isDateTimeType, isDefined, processFilterExpBindNode, triggerFn } from '@wm/core';
import { BaseVariableManager } from './base-variable.manager';
import { debounceVariableCall, formatExportExpression, initiateCallback, setInput, appManager, httpService, formatDate } from '../../util/variable/variables.utils';
import { LiveVariableUtils } from '../../util/variable/live-variable.utils';
import { $queue } from '../../util/inflight-queue';
import { $rootScope, CONSTANTS, VARIABLE_CONSTANTS, DB_CONSTANTS } from '../../constants/variables.constants';
import { generateConnectionParams } from '../../util/variable/live-variable.http.utils';
var emptyArr = [];
var LiveVariableManager = /** @class */ (function (_super) {
    tslib_1.__extends(LiveVariableManager, _super);
    function LiveVariableManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Traverses recursively the filterExpressions object and if there is any required field present with no value,
         * then we will return without proceeding further. Its upto the developer to provide the mandatory value,
         * if he wants to assign it in teh onbefore<delete/insert/update>function then make that field in
         * the filter query section as optional
         * @param filterExpressions - recursive rule Object
         * @returns {Object} object or boolean. Object if everything gets validated or else just boolean indicating failure in the validations
         */
        _this.getFilterExprFields = function (filterExpressions) {
            var isRequiredFieldAbsent = false;
            var traverseCallbackFn = function (parentFilExpObj, filExpObj) {
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
        _this.getDataFilterObj = function (clonedFilterFields) {
            return (function (clonedFields) {
                function getCriteria(filterField) {
                    var criterian = [];
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
        return _this;
    }
    LiveVariableManager.prototype.initFilterExpressionBinding = function (variable) {
        var context = variable._context;
        var destroyFn = context.registerDestroyListener ? context.registerDestroyListener.bind(context) : _.noop;
        var filterSubscription = processFilterExpBindNode(context, variable.filterExpressions).subscribe(function (response) {
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
        destroyFn(function () { return filterSubscription.unsubscribe(); });
    };
    LiveVariableManager.prototype.updateDataset = function (variable, data, propertiesMap, pagination) {
        variable.pagination = pagination;
        variable.dataSet = data;
        // legacy properties in dataSet, [data, pagination]
        Object.defineProperty(variable.dataSet, 'data', {
            get: function () {
                return variable.dataSet;
            }
        });
        Object.defineProperty(variable.dataSet, 'pagination', {
            get: function () {
                return variable.pagination;
            }
        });
    };
    // Set the _options on variable which can be used by the widgets
    LiveVariableManager.prototype.setVariableOptions = function (variable, options) {
        variable._options = variable._options || {};
        variable._options.orderBy = options && options.orderBy;
        variable._options.filterFields = options && options.filterFields;
    };
    LiveVariableManager.prototype.handleError = function (variable, errorCB, response, options, advancedOptions) {
        var opt;
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
    };
    LiveVariableManager.prototype.makeCall = function (variable, dbOperation, params) {
        var _this = this;
        var successHandler = function (response, resolve) {
            if (response && response.type) {
                resolve(response);
            }
        };
        var errorHandler = function (error, reject) {
            var errMsg = httpService.getErrMessage(error);
            // notify variable error
            _this.notifyInflight(variable, false);
            reject({
                error: errMsg,
                details: error
            });
        };
        return new Promise(function (resolve, reject) {
            var reqParams = generateConnectionParams(params, dbOperation);
            reqParams = {
                url: reqParams.url,
                method: reqParams.method,
                data: reqParams.data,
                headers: reqParams.headers
            };
            params.operation = dbOperation;
            _this.httpCall(reqParams, variable, params).then(function (response) {
                successHandler(response, resolve);
            }, function (e) {
                errorHandler(e, reject);
            });
        });
    };
    LiveVariableManager.prototype.getEntityData = function (variable, options, success, error) {
        var _this = this;
        var dataObj = {};
        var tableOptions, dbOperation, output, newDataSet, clonedFields, requestData, dbOperationOptions, getEntitySuccess, getEntityError;
        // empty array kept (if variable is not of read type filterExpressions will be undefined)
        clonedFields = this.getFilterExprFields(getClonedObject(variable.filterExpressions || {}));
        // clonedFields = getClonedObject(variable.filterFields);
        //  EVENT: ON_BEFORE_UPDATE
        output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, this.getDataFilterObj(clonedFields), options);
        // if filterFields are updated or modified inside the onBeforeUpdate event then in device use these fields to filter.
        var updateFilterFields = _.isObject(output) ? getClonedObject(output) : undefined;
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
        getEntitySuccess = function (response, resolve) {
            if (response && response.type) {
                response = response.body;
                dataObj.data = response.content;
                dataObj.pagination = _.omit(response, 'content');
                var advancedOptions_1 = _this.prepareCallbackOptions(response, { pagination: dataObj.pagination });
                if ((response && response.error) || !response || !_.isArray(response.content)) {
                    _this.handleError(variable, error, response.error, options, advancedOptions_1);
                    return Promise.reject(response.error);
                }
                LiveVariableUtils.processBlobColumns(response.content, variable);
                if (!options.skipDataSetUpdate) {
                    //  EVENT: ON_RESULT
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, dataObj.data, advancedOptions_1);
                    //  EVENT: ON_PREPARESETDATA
                    newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, dataObj.data, advancedOptions_1);
                    if (newDataSet) {
                        // setting newDataSet as the response to service variable onPrepareSetData
                        dataObj.data = newDataSet;
                    }
                    /* update the dataSet against the variable */
                    _this.updateDataset(variable, dataObj.data, variable.propertiesMap, dataObj.pagination);
                    _this.setVariableOptions(variable, options);
                    // watchers should get triggered before calling onSuccess event.
                    // so that any variable/widget depending on this variable's data is updated
                    $invokeWatchers(true);
                    setTimeout(function () {
                        // if callback function is provided, send the data to the callback
                        triggerFn(success, dataObj.data, variable.propertiesMap, dataObj.pagination);
                        //  EVENT: ON_SUCCESS
                        initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, dataObj.data, advancedOptions_1);
                        //  EVENT: ON_CAN_UPDATE
                        variable.canUpdate = true;
                        initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, dataObj.data, advancedOptions_1);
                    });
                }
                return resolve({ data: dataObj.data, pagination: dataObj.pagination });
            }
        };
        getEntityError = function (e, reject) {
            _this.setVariableOptions(variable, options);
            _this.handleError(variable, error, e.error, _.extend(options, { errorDetails: e.details }));
            return reject(e.error);
        };
        /* if it is a prefab variable (used in a normal project), modify the url */
        /*Fetch the table data*/
        return new Promise(function (resolve, reject) {
            _this.makeCall(variable, dbOperation, dbOperationOptions).then(function (response) {
                getEntitySuccess(response, resolve);
            }, function (err) {
                getEntityError(err, reject);
            });
        });
    };
    LiveVariableManager.prototype.performCUD = function (operation, variable, options, success, error) {
        var _this = this;
        options = options || {};
        options.inputFields = options.inputFields || getClonedObject(variable.inputFields);
        return $queue.submit(variable).then(function () {
            _this.notifyInflight(variable, !options.skipToggleState);
            return _this.doCUD(operation, variable, options, success, error)
                .then(function (response) {
                $queue.process(variable);
                _this.notifyInflight(variable, false, response);
                return Promise.resolve(response);
            }, function (err) {
                $queue.process(variable);
                _this.notifyInflight(variable, false, err);
                return Promise.reject(err);
            });
        }, error);
    };
    LiveVariableManager.prototype.doCUD = function (action, variable, options, success, error) {
        var _this = this;
        var projectID = $rootScope.project.id || $rootScope.projectName, primaryKey = LiveVariableUtils.getPrimaryKey(variable), isFormDataSupported = (window.File && window.FileReader && window.FileList && window.Blob);
        var dbName, compositeId = '', rowObject = {}, prevData, compositeKeysData = {}, prevCompositeKeysData = {}, id, columnName, clonedFields, output, onCUDerror, onCUDsuccess, inputFields = options.inputFields || variable.inputFields;
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
            _.forEach(rowObject, function (value, key) {
                var fieldType = LiveVariableUtils.getFieldType(key, variable);
                var fieldValue;
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
            _.forEach(inputFields, function (attrValue, attrName) {
                if ((isDefined(attrValue) && attrValue !== '') && (!isDefined(rowObject[attrName]) || rowObject[attrName] === '')) {
                    rowObject[attrName] = attrValue;
                }
            });
        }
        else {
            _.forEach(inputFields, function (fieldValue, fieldName) {
                var fieldType;
                var primaryKeys = variable.propertiesMap.primaryFields || variable.propertiesMap.primaryKeys;
                if (!_.isUndefined(fieldValue) && fieldValue !== '') {
                    /*For delete action, the inputFields need to be set in the request URL. Hence compositeId is set.
                     * For insert action inputFields need to be set in the request data. Hence rowObject is set.
                     * For update action, both need to be set.*/
                    if (action === 'deleteTableData') {
                        compositeId = fieldValue;
                    }
                    if (action === 'updateTableData') {
                        primaryKeys.forEach(function (key) {
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
                        _.forEach(fieldValue, function (val, key) {
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
                        primaryKey.forEach(function (key) {
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
                    primaryKey.forEach(function (key) {
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
                        primaryKey.forEach(function (key) {
                            compositeKeysData[key] = rowObject[key];
                        });
                    }
                    options.compositeKeysData = compositeKeysData;
                }
                else if (!_.isEmpty(rowObject)) {
                    primaryKey.forEach(function (key) {
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
        var dbOperations = {
            'projectID': projectID,
            'service': variable._prefabName ? '' : 'services',
            'dataModelName': dbName,
            'entityName': variable.type,
            'id': !_.isUndefined(options.id) ? encodeURIComponent(options.id) : compositeId,
            'data': rowObject,
            'url': variable._prefabName ? ($rootScope.project.deployedUrl + '/prefabs/' + variable._prefabName) : $rootScope.project.deployedUrl
        };
        onCUDerror = function (response, reject) {
            var errMsg = response.error;
            var advancedOptions = _this.prepareCallbackOptions(response);
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
        onCUDsuccess = function (data, resolve) {
            var response = data.body;
            var advancedOptions = _this.prepareCallbackOptions(data);
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
                var newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, response, advancedOptions);
                if (newDataSet) {
                    // setting newDataSet as the response to service variable onPrepareSetData
                    response = newDataSet;
                }
                variable.dataSet = response;
            }
            // watchers should get triggered before calling onSuccess event.
            // so that any variable/widget depending on this variable's data is updated
            $invokeWatchers(true);
            setTimeout(function () {
                // EVENT: ON_SUCCESS
                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, response, advancedOptions);
                // EVENT: ON_CAN_UPDATE
                variable.canUpdate = true;
                initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, response, advancedOptions);
            });
            triggerFn(success, response);
            resolve(response);
        };
        return new Promise(function (resolve, reject) {
            _this.makeCall(variable, action, dbOperations).then(function (data) {
                onCUDsuccess(data, resolve);
            }, function (response) {
                onCUDerror(response, reject);
            });
        });
    };
    LiveVariableManager.prototype.aggregateData = function (deployedUrl, variable, options, success, error) {
        var _this = this;
        var tableOptions, dbOperationOptions, aggregateDataSuccess, aggregateDataError;
        var dbOperation = 'executeAggregateQuery';
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
        aggregateDataSuccess = function (response, resolve) {
            if (response && response.type) {
                if ((response && response.error) || !response) {
                    triggerFn(error, response.error);
                    return;
                }
                triggerFn(success, response);
                resolve(response);
            }
        };
        aggregateDataError = function (errorMsg, reject) {
            triggerFn(error, errorMsg);
            reject(errorMsg);
        };
        return new Promise(function (resolve, reject) {
            _this.makeCall(variable, dbOperation, dbOperationOptions).then(function (response) {
                aggregateDataSuccess(response, resolve);
            }, function (err) {
                aggregateDataError(err, reject);
            });
        });
    };
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
    LiveVariableManager.prototype.listRecords = function (variable, options, success, error) {
        var _this = this;
        options = options || {};
        options.filterFields = options.filterFields || getClonedObject(variable.filterFields);
        return $queue.submit(variable).then(function () {
            _this.notifyInflight(variable, !options.skipToggleState);
            return _this.getEntityData(variable, options, success, error)
                .then(function (response) {
                $queue.process(variable);
                _this.notifyInflight(variable, false, response);
                return Promise.resolve(response);
            }, function (err) {
                $queue.process(variable);
                _this.notifyInflight(variable, false, err);
                return Promise.reject(err);
            });
        }, error);
    };
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
    LiveVariableManager.prototype.insertRecord = function (variable, options, success, error) {
        return this.performCUD('insertTableData', variable, options, success, error);
    };
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
    LiveVariableManager.prototype.updateRecord = function (variable, options, success, error) {
        return this.performCUD('updateTableData', variable, options, success, error);
    };
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
    LiveVariableManager.prototype.deleteRecord = function (variable, options, success, error) {
        return this.performCUD('deleteTableData', variable, options, success, error);
    };
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
    LiveVariableManager.prototype.setInput = function (variable, key, val, options) {
        variable.inputFields = variable.inputFields || {};
        return setInput(variable.inputFields, key, val, options);
    };
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
    LiveVariableManager.prototype.setFilter = function (variable, key, val) {
        var paramObj = {}, targetObj = {};
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
            var existingCriteria = null;
            LiveVariableUtils.traverseFilterExpressions(targetObj, function (filterExpressions, criteria) {
                if (filterField === criteria.target) {
                    return existingCriteria = criteria;
                }
            });
            return existingCriteria;
        }
        _.forEach(paramObj, function (paramVal, paramKey) {
            var existingCriteria = getExistingCriteria(paramKey);
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
    };
    /**
     * Makes a file download call for a table
     * @param variable
     * @param options
     */
    LiveVariableManager.prototype.download = function (variable, options, successHandler, errorHandler) {
        var _this = this;
        options = options || {};
        var tableOptions, dbOperationOptions, downloadSuccess, downloadError;
        var data = {};
        var dbOperation = 'exportTableData';
        var projectID = $rootScope.project.id || $rootScope.projectName;
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
        downloadSuccess = function (response, resolve) {
            if (response && response.type) {
                window.location.href = response.body.result;
                triggerFn(successHandler, response);
                resolve(response);
            }
        };
        downloadError = function (err, reject) {
            var opt = _this.prepareCallbackOptions(err.details);
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, err.error, opt);
            triggerFn(errorHandler, err.error);
            reject(err);
        };
        return new Promise(function (resolve, reject) {
            _this.makeCall(variable, dbOperation, dbOperationOptions).then(function (response) {
                downloadSuccess(response, resolve);
            }, function (error) {
                downloadError(error, reject);
            });
        });
    };
    /**
     * gets primary keys against the passed related Table
     * @param variable
     * @param relatedField
     * @returns {any}
     */
    LiveVariableManager.prototype.getRelatedTablePrimaryKeys = function (variable, relatedField) {
        var primaryKeys, result, relatedCols;
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
    };
    /**
     * Makes HTTP call to get the data for related entity of a field in an entity
     * @param variable
     * @param columnName
     * @param options
     * @param success
     * @param error
     */
    LiveVariableManager.prototype.getRelatedTableData = function (variable, columnName, options, success, error) {
        var _this = this;
        var projectID = $rootScope.project.id || $rootScope.projectName;
        var relatedTable = _.find(variable.relatedTables, function (table) { return table.relationName === columnName || table.columnName === columnName; }); // Comparing column name to support the old projects
        var selfRelatedCols = _.map(_.filter(variable.relatedTables, function (o) { return o.type === variable.type; }), 'relationName');
        var filterFields = [];
        var orderBy, filterOptions, query, action, dbOperationOptions, getRelatedTableDataSuccess, getRelatedTableDataError;
        _.forEach(options.filterFields, function (value, key) {
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
            var _clonedFields = getClonedObject(_.isObject(options.filterExpr) ? options.filterExpr : JSON.parse(options.filterExpr));
            LiveVariableUtils.processFilterFields(_clonedFields.rules, variable, options);
            var filterExpQuery = LiveVariableUtils.generateSearchQuery(_clonedFields.rules, _clonedFields.condition, variable.ignoreCase, options.skipEncode);
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
        getRelatedTableDataSuccess = function (res, resolve) {
            if (res && res.type) {
                var response = res.body;
                /*Remove the self related columns from the data. As backend is restricting the self related column to one level, In liveform select, dataset and datavalue object
                 * equality does not work. So, removing the self related columns to acheive the quality*/
                var data = _.map(response.content, function (o) { return _.omit(o, selfRelatedCols); });
                var pagination = Object.assign({}, response);
                delete pagination.content;
                var result = { data: data, pagination: pagination };
                triggerFn(success, result);
                resolve(result);
            }
        };
        getRelatedTableDataError = function (errMsg, reject) {
            triggerFn(error, errMsg);
            reject(errMsg);
        };
        return new Promise(function (resolve, reject) {
            _this.makeCall(variable, action, dbOperationOptions).then(function (response) {
                getRelatedTableDataSuccess(response, resolve);
            }, function (err) {
                getRelatedTableDataError(err, reject);
            });
        });
    };
    /**
     * Gets the distinct records for an entity
     * @param variable
     * @param options
     * @param success
     * @param error
     */
    LiveVariableManager.prototype.getDistinctDataByFields = function (variable, options, success, error) {
        var _this = this;
        var dbOperation = 'getDistinctDataByFields';
        var projectID = $rootScope.project.id || $rootScope.projectName;
        var requestData = {};
        var sort;
        var tableOptions, dbOperationOptions, getDistinctDataByFieldsSuccess, getDistinctDataByFieldsError;
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
        getDistinctDataByFieldsSuccess = function (response, resolve) {
            if (response && response.type) {
                if ((response && response.error) || !response) {
                    triggerFn(error, response.error);
                    return Promise.reject(response.error);
                }
                var result = response.body;
                var pagination = Object.assign({}, response.body);
                delete pagination.content;
                result = { data: result.content, pagination: pagination };
                triggerFn(success, result);
                resolve(result);
            }
        };
        getDistinctDataByFieldsError = function (errorMsg, reject) {
            triggerFn(error, errorMsg);
            reject(errorMsg);
        };
        return new Promise(function (resolve, reject) {
            _this.makeCall(variable, dbOperation, dbOperationOptions).then(function (response) {
                getDistinctDataByFieldsSuccess(response, resolve);
            }, function () {
                getDistinctDataByFieldsError(error, reject);
            });
        });
    };
    /*Function to get the aggregated data based on the fields chosen*/
    LiveVariableManager.prototype.getAggregatedData = function (variable, options, success, error) {
        var deployedURL = appManager.getDeployedURL();
        if (deployedURL) {
            return this.aggregateData(deployedURL, variable, options, success, error);
        }
    };
    LiveVariableManager.prototype.defineFirstLastRecord = function (variable) {
        if (variable.operation === 'read') {
            Object.defineProperty(variable, 'firstRecord', {
                'configurable': true,
                'get': function () {
                    return _.get(variable.dataSet, 'data[0]', {});
                }
            });
            Object.defineProperty(variable, 'lastRecord', {
                'configurable': true,
                'get': function () {
                    var data = _.get(variable.dataSet, 'data', []);
                    return data[data.length - 1];
                }
            });
        }
    };
    LiveVariableManager.prototype.getPrimaryKey = function (variable) {
        return LiveVariableUtils.getPrimaryKey(variable);
    };
    // Returns the search query params.
    LiveVariableManager.prototype.prepareRequestParams = function (options) {
        var requestParams;
        var searchKeys = _.split(options.searchKey, ','), matchModes = _.split(options.matchMode, ','), formFields = {};
        _.forEach(searchKeys, function (colName, index) {
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
    };
    /**
     * Gets the filtered records based on searchKey
     * @param variable
     * @param options contains the searchKey and queryText
     * @param success
     * @param error
     * @returns {Promise<any>}
     */
    LiveVariableManager.prototype.searchRecords = function (variable, options, success, error) {
        var requestParams = this.prepareRequestParams(options);
        return this.listRecords(variable, requestParams, success, error);
    };
    /**
     * used in onBeforeUpdate call - called last in the function - used in old Variables using dataBinding.
     * This function migrates the old data dataBinding to filterExpressions equivalent format
     * @param variable
     * @param inputData
     * @private
     */
    LiveVariableManager.prototype.upgradeInputDataToFilterExpressions = function (variable, response, inputData) {
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
        var clonedRules = _.cloneDeep(inputData.rules);
        inputData.rules = [];
        _.forEach(inputData, function (valueObj, key) {
            if (key !== 'condition' && key !== 'rules') {
                var filteredObj = _.find(clonedRules, function (o) { return o.target === key; });
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
    };
    /**
     * used in onBeforeUpdate call - called first in the function - used in old Variables using dataBinding.
     * This function migrates the filterExpressions object to flat map structure
     * @param variable
     * @param inputData
     * @private
     */
    LiveVariableManager.prototype.downgradeFilterExpressionsToInputData = function (variable, inputData) {
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
    };
    LiveVariableManager.prototype.cancel = function (variable, options) {
        if ($queue.requestsQueue.has(variable) && variable._observable) {
            variable._observable.unsubscribe();
            $queue.process(variable);
            // notify inflight variable
            this.notifyInflight(variable, false);
        }
    };
    return LiveVariableManager;
}(BaseVariableManager));
export { LiveVariableManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl2ZS12YXJpYWJsZS5tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbIm1hbmFnZXIvdmFyaWFibGUvbGl2ZS12YXJpYWJsZS5tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU1SCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsc0JBQXNCLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFDLE1BQU0scUNBQXFDLENBQUM7QUFDbEssT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDNUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRTlHLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBR3hGLElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUVwQjtJQUF5QywrQ0FBbUI7SUFBNUQ7UUFBQSxxRUFnbkNDO1FBM2lDRzs7Ozs7OztXQU9HO1FBQ0sseUJBQW1CLEdBQUcsVUFBVSxpQkFBaUI7WUFDckQsSUFBSSxxQkFBcUIsR0FBRyxLQUFLLENBQUM7WUFDbEMsSUFBTSxrQkFBa0IsR0FBRyxVQUFVLGVBQWUsRUFBRSxTQUFTO2dCQUMzRCxJQUFJLFNBQVM7dUJBQ04sU0FBUyxDQUFDLFFBQVE7dUJBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLFdB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QUFDLFdBQVcsRUFBRTtZQUM1RCxRQUFRLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekIsMkJBQTJCO1lBQzNCLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3hDO0lBQ0wsQ0FBQztJQUNMLDBCQUFDO0FBQUQsQ0FBQyxBQWhuQ0QsQ0FBeUMsbUJBQW1CLEdBZ25DM0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyAkaW52b2tlV2F0Y2hlcnMsIGdldENsb25lZE9iamVjdCwgaXNEYXRlVGltZVR5cGUsIGlzRGVmaW5lZCwgcHJvY2Vzc0ZpbHRlckV4cEJpbmROb2RlLCB0cmlnZ2VyRm4gfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEJhc2VWYXJpYWJsZU1hbmFnZXIgfSBmcm9tICcuL2Jhc2UtdmFyaWFibGUubWFuYWdlcic7XG5pbXBvcnQge2RlYm91bmNlVmFyaWFibGVDYWxsLCBmb3JtYXRFeHBvcnRFeHByZXNzaW9uLCBpbml0aWF0ZUNhbGxiYWNrLCBzZXRJbnB1dCwgYXBwTWFuYWdlciwgaHR0cFNlcnZpY2UsIGZvcm1hdERhdGV9IGZyb20gJy4uLy4uL3V0aWwvdmFyaWFibGUvdmFyaWFibGVzLnV0aWxzJztcbmltcG9ydCB7IExpdmVWYXJpYWJsZVV0aWxzIH0gZnJvbSAnLi4vLi4vdXRpbC92YXJpYWJsZS9saXZlLXZhcmlhYmxlLnV0aWxzJztcbmltcG9ydCB7ICRxdWV1ZSB9IGZyb20gJy4uLy4uL3V0aWwvaW5mbGlnaHQtcXVldWUnO1xuaW1wb3J0IHsgJHJvb3RTY29wZSwgQ09OU1RBTlRTLCBWQVJJQUJMRV9DT05TVEFOVFMsIERCX0NPTlNUQU5UUyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cy92YXJpYWJsZXMuY29uc3RhbnRzJztcbmltcG9ydCB7IEFkdmFuY2VkT3B0aW9ucyB9IGZyb20gJy4uLy4uL2FkdmFuY2VkLW9wdGlvbnMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVDb25uZWN0aW9uUGFyYW1zIH0gZnJvbSAnLi4vLi4vdXRpbC92YXJpYWJsZS9saXZlLXZhcmlhYmxlLmh0dHAudXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0IF8sIHdpbmRvdztcbmNvbnN0IGVtcHR5QXJyID0gW107XG5cbmV4cG9ydCBjbGFzcyBMaXZlVmFyaWFibGVNYW5hZ2VyIGV4dGVuZHMgQmFzZVZhcmlhYmxlTWFuYWdlciB7XG5cbiAgICBwdWJsaWMgaW5pdEZpbHRlckV4cHJlc3Npb25CaW5kaW5nKHZhcmlhYmxlKSB7XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSB2YXJpYWJsZS5fY29udGV4dDtcbiAgICAgICAgY29uc3QgZGVzdHJveUZuID0gY29udGV4dC5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lciA/IGNvbnRleHQucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIuYmluZChjb250ZXh0KSA6IF8ubm9vcDtcblxuICAgICAgICBjb25zdCBmaWx0ZXJTdWJzY3JpcHRpb24gPSBwcm9jZXNzRmlsdGVyRXhwQmluZE5vZGUoY29udGV4dCwgdmFyaWFibGUuZmlsdGVyRXhwcmVzc2lvbnMpLnN1YnNjcmliZSgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhcmlhYmxlLm9wZXJhdGlvbiA9PT0gJ3JlYWQnKSB7XG4gICAgICAgICAgICAgICAgLyogaWYgYXV0by11cGRhdGUgc2V0IGZvciB0aGUgdmFyaWFibGUgd2l0aCByZWFkIG9wZXJhdGlvbiBvbmx5LCBnZXQgaXRzIGRhdGEgKi9cbiAgICAgICAgICAgICAgICBpZiAodmFyaWFibGUuYXV0b1VwZGF0ZSAmJiAhXy5pc1VuZGVmaW5lZChyZXNwb25zZS5uZXdWYWwpICYmIF8uaXNGdW5jdGlvbih2YXJpYWJsZS51cGRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYm91bmNlVmFyaWFibGVDYWxsKHZhcmlhYmxlLCAndXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvKiBpZiBhdXRvLXVwZGF0ZSBzZXQgZm9yIHRoZSB2YXJpYWJsZSB3aXRoIHJlYWQgb3BlcmF0aW9uIG9ubHksIGdldCBpdHMgZGF0YSAqL1xuICAgICAgICAgICAgICAgIGlmICh2YXJpYWJsZS5hdXRvVXBkYXRlICYmICFfLmlzVW5kZWZpbmVkKHJlc3BvbnNlLm5ld1ZhbCkgJiYgXy5pc0Z1bmN0aW9uKHZhcmlhYmxlW3ZhcmlhYmxlLm9wZXJhdGlvbiArICdSZWNvcmQnXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVib3VuY2VWYXJpYWJsZUNhbGwodmFyaWFibGUsIHZhcmlhYmxlLm9wZXJhdGlvbiArICdSZWNvcmQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlc3Ryb3lGbigoKSA9PiBmaWx0ZXJTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVEYXRhc2V0KHZhcmlhYmxlLCBkYXRhLCBwcm9wZXJ0aWVzTWFwLCBwYWdpbmF0aW9uKSB7XG4gICAgICAgIHZhcmlhYmxlLnBhZ2luYXRpb24gPSBwYWdpbmF0aW9uO1xuICAgICAgICB2YXJpYWJsZS5kYXRhU2V0ID0gZGF0YTtcblxuICAgICAgICAvLyBsZWdhY3kgcHJvcGVydGllcyBpbiBkYXRhU2V0LCBbZGF0YSwgcGFnaW5hdGlvbl1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHZhcmlhYmxlLmRhdGFTZXQsICdkYXRhJywge1xuICAgICAgICAgICAgZ2V0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhcmlhYmxlLmRhdGFTZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodmFyaWFibGUuZGF0YVNldCwgJ3BhZ2luYXRpb24nLCB7XG4gICAgICAgICAgICBnZXQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFyaWFibGUucGFnaW5hdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBfb3B0aW9ucyBvbiB2YXJpYWJsZSB3aGljaCBjYW4gYmUgdXNlZCBieSB0aGUgd2lkZ2V0c1xuICAgIHByaXZhdGUgc2V0VmFyaWFibGVPcHRpb25zKHZhcmlhYmxlLCBvcHRpb25zKSB7XG4gICAgICAgIHZhcmlhYmxlLl9vcHRpb25zID0gdmFyaWFibGUuX29wdGlvbnMgfHwge307XG4gICAgICAgIHZhcmlhYmxlLl9vcHRpb25zLm9yZGVyQnkgPSBvcHRpb25zICYmIG9wdGlvbnMub3JkZXJCeTtcbiAgICAgICAgdmFyaWFibGUuX29wdGlvbnMuZmlsdGVyRmllbGRzID0gb3B0aW9ucyAmJiBvcHRpb25zLmZpbHRlckZpZWxkcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGhhbmRsZUVycm9yKHZhcmlhYmxlLCBlcnJvckNCLCByZXNwb25zZSwgb3B0aW9ucywgYWR2YW5jZWRPcHRpb25zPykge1xuICAgICAgICBsZXQgb3B0OiBBZHZhbmNlZE9wdGlvbnM7XG4gICAgICAgIC8qIElmIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIHByb3ZpZGVkLCBzZW5kIHRoZSBkYXRhIHRvIHRoZSBjYWxsYmFjay5cbiAgICAgICAgICogVGhlIHNhbWUgY2FsbGJhY2sgaWYgdHJpZ2dlcmVkIGluIGNhc2Ugb2YgZXJyb3IgYWxzby4gVGhlIGVycm9yLWhhbmRsaW5nIGlzIGRvbmUgaW4gZ3JpZC5qcyovXG4gICAgICAgIHRyaWdnZXJGbihlcnJvckNCLCByZXNwb25zZSk7XG5cbiAgICAgICAgLy8gIEVWRU5UOiBPTl9SRVNVTFRcbiAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuUkVTVUxULCB2YXJpYWJsZSwgcmVzcG9uc2UsIGFkdmFuY2VkT3B0aW9ucyk7XG5cbiAgICAgICAgLyogdXBkYXRlIHRoZSBkYXRhU2V0IGFnYWluc3QgdGhlIHZhcmlhYmxlICovXG4gICAgICAgIGlmICghb3B0aW9ucy5za2lwRGF0YVNldFVwZGF0ZSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVEYXRhc2V0KHZhcmlhYmxlLCBlbXB0eUFyciwgdmFyaWFibGUucHJvcGVydGllc01hcCwgbnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAgRVZFTlQ6IE9OX0VSUk9SXG4gICAgICAgIG9wdCA9IHRoaXMucHJlcGFyZUNhbGxiYWNrT3B0aW9ucyhvcHRpb25zLmVycm9yRGV0YWlscyk7XG4gICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkVSUk9SLCB2YXJpYWJsZSwgcmVzcG9uc2UsIG9wdCk7XG4gICAgICAgIC8vICBFVkVOVDogT05fQ0FOX1VQREFURVxuICAgICAgICB2YXJpYWJsZS5jYW5VcGRhdGUgPSB0cnVlO1xuICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5DQU5fVVBEQVRFLCB2YXJpYWJsZSwgcmVzcG9uc2UsIGFkdmFuY2VkT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJhdmVyc2VzIHJlY3Vyc2l2ZWx5IHRoZSBmaWx0ZXJFeHByZXNzaW9ucyBvYmplY3QgYW5kIGlmIHRoZXJlIGlzIGFueSByZXF1aXJlZCBmaWVsZCBwcmVzZW50IHdpdGggbm8gdmFsdWUsXG4gICAgICogdGhlbiB3ZSB3aWxsIHJldHVybiB3aXRob3V0IHByb2NlZWRpbmcgZnVydGhlci4gSXRzIHVwdG8gdGhlIGRldmVsb3BlciB0byBwcm92aWRlIHRoZSBtYW5kYXRvcnkgdmFsdWUsXG4gICAgICogaWYgaGUgd2FudHMgdG8gYXNzaWduIGl0IGluIHRlaCBvbmJlZm9yZTxkZWxldGUvaW5zZXJ0L3VwZGF0ZT5mdW5jdGlvbiB0aGVuIG1ha2UgdGhhdCBmaWVsZCBpblxuICAgICAqIHRoZSBmaWx0ZXIgcXVlcnkgc2VjdGlvbiBhcyBvcHRpb25hbFxuICAgICAqIEBwYXJhbSBmaWx0ZXJFeHByZXNzaW9ucyAtIHJlY3Vyc2l2ZSBydWxlIE9iamVjdFxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IG9iamVjdCBvciBib29sZWFuLiBPYmplY3QgaWYgZXZlcnl0aGluZyBnZXRzIHZhbGlkYXRlZCBvciBlbHNlIGp1c3QgYm9vbGVhbiBpbmRpY2F0aW5nIGZhaWx1cmUgaW4gdGhlIHZhbGlkYXRpb25zXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRGaWx0ZXJFeHByRmllbGRzID0gZnVuY3Rpb24gKGZpbHRlckV4cHJlc3Npb25zKSB7XG4gICAgICAgIGxldCBpc1JlcXVpcmVkRmllbGRBYnNlbnQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgdHJhdmVyc2VDYWxsYmFja0ZuID0gZnVuY3Rpb24gKHBhcmVudEZpbEV4cE9iaiwgZmlsRXhwT2JqKSB7XG4gICAgICAgICAgICBpZiAoZmlsRXhwT2JqXG4gICAgICAgICAgICAgICAgJiYgZmlsRXhwT2JqLnJlcXVpcmVkXG4gICAgICAgICAgICAgICAgJiYgKChfLmluZGV4T2YoWydudWxsJywgJ2lzbm90bnVsbCcsICdlbXB0eScsICdpc25vdGVtcHR5JywgJ251bGxvcmVtcHR5J10sIGZpbEV4cE9iai5tYXRjaE1vZGUpID09PSAtMSkgJiYgZmlsRXhwT2JqLnZhbHVlID09PSAnJykpIHtcbiAgICAgICAgICAgICAgICBpc1JlcXVpcmVkRmllbGRBYnNlbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgTGl2ZVZhcmlhYmxlVXRpbHMudHJhdmVyc2VGaWx0ZXJFeHByZXNzaW9ucyhmaWx0ZXJFeHByZXNzaW9ucywgdHJhdmVyc2VDYWxsYmFja0ZuKTtcbiAgICAgICAgcmV0dXJuIGlzUmVxdWlyZWRGaWVsZEFic2VudCA/ICFpc1JlcXVpcmVkRmllbGRBYnNlbnQgOiBmaWx0ZXJFeHByZXNzaW9ucztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWxsb3dzIHRoZSB1c2VyIHRvIGdldCB0aGUgY3JpdGVyaWEgb2YgZmlsdGVyaW5nIGFuZCB0aGUgZmlsdGVyIGZpZWxkcywgYmFzZWQgb24gdGhlIG1ldGhvZCBjYWxsZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldERhdGFGaWx0ZXJPYmogPSBmdW5jdGlvbiAoY2xvbmVkRmlsdGVyRmllbGRzKSB7XG4gICAgICAgIHJldHVybiAoZnVuY3Rpb24gKGNsb25lZEZpZWxkcykge1xuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0Q3JpdGVyaWEoZmlsdGVyRmllbGQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcml0ZXJpYW4gPSBbXTtcbiAgICAgICAgICAgICAgICBMaXZlVmFyaWFibGVVdGlscy50cmF2ZXJzZUZpbHRlckV4cHJlc3Npb25zKGNsb25lZEZpZWxkcywgZnVuY3Rpb24gKGZpbHRlckV4cHJlc3Npb25zLCBjcml0ZXJpYSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyRmllbGQgPT09IGNyaXRlcmlhLnRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3JpdGVyaWFuLnB1c2goY3JpdGVyaWEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyaXRlcmlhbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0RmlsdGVyRmllbGRzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjbG9uZWRGaWVsZHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZ2V0RmlsdGVyRmllbGRzOiBnZXRGaWx0ZXJGaWVsZHMsXG4gICAgICAgICAgICAgICAgZ2V0Q3JpdGVyaWE6IGdldENyaXRlcmlhXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KGNsb25lZEZpbHRlckZpZWxkcykpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG1ha2VDYWxsKHZhcmlhYmxlLCBkYk9wZXJhdGlvbiwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHN1Y2Nlc3NIYW5kbGVyID0gKHJlc3BvbnNlLCByZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UudHlwZSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvckhhbmRsZXIgPSAoZXJyb3IsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXJyTXNnID0gaHR0cFNlcnZpY2UuZ2V0RXJyTWVzc2FnZShlcnJvcik7XG4gICAgICAgICAgICAvLyBub3RpZnkgdmFyaWFibGUgZXJyb3JcbiAgICAgICAgICAgIHRoaXMubm90aWZ5SW5mbGlnaHQodmFyaWFibGUsIGZhbHNlKTtcbiAgICAgICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgICAgICAgZXJyb3I6IGVyck1zZyxcbiAgICAgICAgICAgICAgICBkZXRhaWxzOiBlcnJvclxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgcmVxUGFyYW1zID0gZ2VuZXJhdGVDb25uZWN0aW9uUGFyYW1zKHBhcmFtcywgZGJPcGVyYXRpb24pO1xuICAgICAgICAgICAgcmVxUGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIHVybDogcmVxUGFyYW1zLnVybCxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IHJlcVBhcmFtcy5tZXRob2QsXG4gICAgICAgICAgICAgICAgZGF0YTogcmVxUGFyYW1zLmRhdGEsXG4gICAgICAgICAgICAgICAgaGVhZGVyczogcmVxUGFyYW1zLmhlYWRlcnNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwYXJhbXMub3BlcmF0aW9uID0gZGJPcGVyYXRpb247XG4gICAgICAgICAgICB0aGlzLmh0dHBDYWxsKHJlcVBhcmFtcywgdmFyaWFibGUsIHBhcmFtcykudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzSGFuZGxlcihyZXNwb25zZSwgcmVzb2x2ZSk7XG4gICAgICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGVycm9ySGFuZGxlcihlLCByZWplY3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0RW50aXR5RGF0YSh2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZGF0YU9iajogYW55ID0ge307XG4gICAgICAgIGxldCB0YWJsZU9wdGlvbnMsXG4gICAgICAgICAgICBkYk9wZXJhdGlvbixcbiAgICAgICAgICAgIG91dHB1dCxcbiAgICAgICAgICAgIG5ld0RhdGFTZXQsXG4gICAgICAgICAgICBjbG9uZWRGaWVsZHMsXG4gICAgICAgICAgICByZXF1ZXN0RGF0YSxcbiAgICAgICAgICAgIGRiT3BlcmF0aW9uT3B0aW9ucyxcbiAgICAgICAgICAgIGdldEVudGl0eVN1Y2Nlc3MsXG4gICAgICAgICAgICBnZXRFbnRpdHlFcnJvcjtcblxuICAgICAgICAvLyBlbXB0eSBhcnJheSBrZXB0IChpZiB2YXJpYWJsZSBpcyBub3Qgb2YgcmVhZCB0eXBlIGZpbHRlckV4cHJlc3Npb25zIHdpbGwgYmUgdW5kZWZpbmVkKVxuICAgICAgICBjbG9uZWRGaWVsZHMgPSB0aGlzLmdldEZpbHRlckV4cHJGaWVsZHMoZ2V0Q2xvbmVkT2JqZWN0KHZhcmlhYmxlLmZpbHRlckV4cHJlc3Npb25zIHx8IHt9KSk7XG4gICAgICAgIC8vIGNsb25lZEZpZWxkcyA9IGdldENsb25lZE9iamVjdCh2YXJpYWJsZS5maWx0ZXJGaWVsZHMpO1xuICAgICAgICAvLyAgRVZFTlQ6IE9OX0JFRk9SRV9VUERBVEVcbiAgICAgICAgb3V0cHV0ID0gaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuQkVGT1JFX1VQREFURSwgdmFyaWFibGUsIHRoaXMuZ2V0RGF0YUZpbHRlck9iaihjbG9uZWRGaWVsZHMpLCBvcHRpb25zKTtcbiAgICAgICAgLy8gaWYgZmlsdGVyRmllbGRzIGFyZSB1cGRhdGVkIG9yIG1vZGlmaWVkIGluc2lkZSB0aGUgb25CZWZvcmVVcGRhdGUgZXZlbnQgdGhlbiBpbiBkZXZpY2UgdXNlIHRoZXNlIGZpZWxkcyB0byBmaWx0ZXIuXG4gICAgICAgIGNvbnN0IHVwZGF0ZUZpbHRlckZpZWxkcyA9IF8uaXNPYmplY3Qob3V0cHV0KSA/IGdldENsb25lZE9iamVjdChvdXRwdXQpIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAob3V0cHV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgJHF1ZXVlLnByb2Nlc3ModmFyaWFibGUpO1xuICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kZW1pdCgndG9nZ2xlLXZhcmlhYmxlLXN0YXRlJywgdmFyaWFibGUsIGZhbHNlKTtcbiAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvciwgJ0NhbGwgc3RvcHBlZCBmcm9tIHRoZSBldmVudDogJyArIFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5CRUZPUkVfVVBEQVRFKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnQ2FsbCBzdG9wcGVkIGZyb20gdGhlIGV2ZW50OiAnICsgVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkJFRk9SRV9VUERBVEUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyaWFibGUuY2FuVXBkYXRlID0gZmFsc2U7XG5cbiAgICAgICAgdGFibGVPcHRpb25zID0gTGl2ZVZhcmlhYmxlVXRpbHMucHJlcGFyZVRhYmxlT3B0aW9ucyh2YXJpYWJsZSwgb3B0aW9ucywgXy5pc09iamVjdChvdXRwdXQpID8gb3V0cHV0IDogY2xvbmVkRmllbGRzKTtcblxuICAgICAgICAvLyAgaWYgdGFibGVPcHRpb25zIG9iamVjdCBoYXMgcXVlcnkgdGhlbiBzZXQgdGhlIGRiT3BlcmF0aW9uIHRvICdzZWFyY2hUYWJsZURhdGFXaXRoUXVlcnknXG4gICAgICAgIGlmIChvcHRpb25zLnNlYXJjaFdpdGhRdWVyeSkge1xuICAgICAgICAgICAgZGJPcGVyYXRpb24gPSAnc2VhcmNoVGFibGVEYXRhV2l0aFF1ZXJ5JztcbiAgICAgICAgICAgIHJlcXVlc3REYXRhID0gdGFibGVPcHRpb25zLnF1ZXJ5ID8gKCdxPScgKyB0YWJsZU9wdGlvbnMucXVlcnkpIDogJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYk9wZXJhdGlvbiA9ICh0YWJsZU9wdGlvbnMuZmlsdGVyICYmIHRhYmxlT3B0aW9ucy5maWx0ZXIubGVuZ3RoKSA/ICdzZWFyY2hUYWJsZURhdGEnIDogJ3JlYWRUYWJsZURhdGEnO1xuICAgICAgICAgICAgcmVxdWVzdERhdGEgPSB0YWJsZU9wdGlvbnMuZmlsdGVyO1xuICAgICAgICB9XG4gICAgICAgIGRiT3BlcmF0aW9uT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICdwcm9qZWN0SUQnOiAkcm9vdFNjb3BlLnByb2plY3QuaWQsXG4gICAgICAgICAgICAnc2VydmljZSc6IHZhcmlhYmxlLmdldFByZWZhYk5hbWUoKSA/ICcnIDogJ3NlcnZpY2VzJyxcbiAgICAgICAgICAgICdkYXRhTW9kZWxOYW1lJzogdmFyaWFibGUubGl2ZVNvdXJjZSxcbiAgICAgICAgICAgICdlbnRpdHlOYW1lJzogdmFyaWFibGUudHlwZSxcbiAgICAgICAgICAgICdwYWdlJzogb3B0aW9ucy5wYWdlIHx8IDEsXG4gICAgICAgICAgICAnc2l6ZSc6IG9wdGlvbnMucGFnZXNpemUgfHwgKENPTlNUQU5UUy5pc1J1bk1vZGUgPyAodmFyaWFibGUubWF4UmVzdWx0cyB8fCAyMCkgOiAodmFyaWFibGUuZGVzaWduTWF4UmVzdWx0cyB8fCAyMCkpLFxuICAgICAgICAgICAgJ3NvcnQnOiB0YWJsZU9wdGlvbnMuc29ydCxcbiAgICAgICAgICAgICdkYXRhJzogcmVxdWVzdERhdGEsXG4gICAgICAgICAgICAnZmlsdGVyJzogTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0V2hlcmVDbGF1c2VHZW5lcmF0b3IodmFyaWFibGUsIG9wdGlvbnMsIHVwZGF0ZUZpbHRlckZpZWxkcyksXG4gICAgICAgICAgICAvLyAnZmlsdGVyTWV0YSc6IHRhYmxlT3B0aW9ucy5maWx0ZXIsXG4gICAgICAgICAgICAndXJsJzogdmFyaWFibGUuZ2V0UHJlZmFiTmFtZSgpID8gKCRyb290U2NvcGUucHJvamVjdC5kZXBsb3llZFVybCArICcvcHJlZmFicy8nICsgdmFyaWFibGUuZ2V0UHJlZmFiTmFtZSgpKSA6ICRyb290U2NvcGUucHJvamVjdC5kZXBsb3llZFVybFxuICAgICAgICB9O1xuICAgICAgICBnZXRFbnRpdHlTdWNjZXNzID0gKHJlc3BvbnNlOiBhbnksIHJlc29sdmU6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLnR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHJlc3BvbnNlLmJvZHk7XG4gICAgICAgICAgICAgICAgZGF0YU9iai5kYXRhID0gcmVzcG9uc2UuY29udGVudDtcbiAgICAgICAgICAgICAgICBkYXRhT2JqLnBhZ2luYXRpb24gPSBfLm9taXQocmVzcG9uc2UsICdjb250ZW50Jyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYWR2YW5jZWRPcHRpb25zOiBBZHZhbmNlZE9wdGlvbnMgPSB0aGlzLnByZXBhcmVDYWxsYmFja09wdGlvbnMocmVzcG9uc2UsIHtwYWdpbmF0aW9uOiBkYXRhT2JqLnBhZ2luYXRpb259KTtcblxuICAgICAgICAgICAgICAgIGlmICgocmVzcG9uc2UgJiYgcmVzcG9uc2UuZXJyb3IpIHx8ICFyZXNwb25zZSB8fCAhXy5pc0FycmF5KHJlc3BvbnNlLmNvbnRlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlRXJyb3IodmFyaWFibGUsIGVycm9yLCByZXNwb25zZS5lcnJvciwgb3B0aW9ucywgYWR2YW5jZWRPcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlc3BvbnNlLmVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBMaXZlVmFyaWFibGVVdGlscy5wcm9jZXNzQmxvYkNvbHVtbnMocmVzcG9uc2UuY29udGVudCwgdmFyaWFibGUpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLnNraXBEYXRhU2V0VXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICBFVkVOVDogT05fUkVTVUxUXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULlJFU1VMVCwgdmFyaWFibGUsIGRhdGFPYmouZGF0YSwgYWR2YW5jZWRPcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gIEVWRU5UOiBPTl9QUkVQQVJFU0VUREFUQVxuICAgICAgICAgICAgICAgICAgICBuZXdEYXRhU2V0ID0gaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuUFJFUEFSRV9TRVREQVRBLCB2YXJpYWJsZSwgZGF0YU9iai5kYXRhLCBhZHZhbmNlZE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGF0YVNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2V0dGluZyBuZXdEYXRhU2V0IGFzIHRoZSByZXNwb25zZSB0byBzZXJ2aWNlIHZhcmlhYmxlIG9uUHJlcGFyZVNldERhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFPYmouZGF0YSA9IG5ld0RhdGFTZXQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLyogdXBkYXRlIHRoZSBkYXRhU2V0IGFnYWluc3QgdGhlIHZhcmlhYmxlICovXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRGF0YXNldCh2YXJpYWJsZSwgZGF0YU9iai5kYXRhLCB2YXJpYWJsZS5wcm9wZXJ0aWVzTWFwLCBkYXRhT2JqLnBhZ2luYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFZhcmlhYmxlT3B0aW9ucyh2YXJpYWJsZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gd2F0Y2hlcnMgc2hvdWxkIGdldCB0cmlnZ2VyZWQgYmVmb3JlIGNhbGxpbmcgb25TdWNjZXNzIGV2ZW50LlxuICAgICAgICAgICAgICAgICAgICAvLyBzbyB0aGF0IGFueSB2YXJpYWJsZS93aWRnZXQgZGVwZW5kaW5nIG9uIHRoaXMgdmFyaWFibGUncyBkYXRhIGlzIHVwZGF0ZWRcbiAgICAgICAgICAgICAgICAgICAgJGludm9rZVdhdGNoZXJzKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIHByb3ZpZGVkLCBzZW5kIHRoZSBkYXRhIHRvIHRoZSBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckZuKHN1Y2Nlc3MsIGRhdGFPYmouZGF0YSwgdmFyaWFibGUucHJvcGVydGllc01hcCwgZGF0YU9iai5wYWdpbmF0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIEVWRU5UOiBPTl9TVUNDRVNTXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5TVUNDRVNTLCB2YXJpYWJsZSwgZGF0YU9iai5kYXRhLCBhZHZhbmNlZE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIEVWRU5UOiBPTl9DQU5fVVBEQVRFXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZS5jYW5VcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuQ0FOX1VQREFURSwgdmFyaWFibGUsIGRhdGFPYmouZGF0YSwgYWR2YW5jZWRPcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHtkYXRhOiBkYXRhT2JqLmRhdGEsIHBhZ2luYXRpb246IGRhdGFPYmoucGFnaW5hdGlvbn0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBnZXRFbnRpdHlFcnJvciA9IChlOiBhbnksIHJlamVjdDogYW55KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFZhcmlhYmxlT3B0aW9ucyh2YXJpYWJsZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUVycm9yKHZhcmlhYmxlLCBlcnJvciwgZS5lcnJvciwgXy5leHRlbmQob3B0aW9ucywge2Vycm9yRGV0YWlsczogZS5kZXRhaWxzfSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGUuZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICAvKiBpZiBpdCBpcyBhIHByZWZhYiB2YXJpYWJsZSAodXNlZCBpbiBhIG5vcm1hbCBwcm9qZWN0KSwgbW9kaWZ5IHRoZSB1cmwgKi9cbiAgICAgICAgLypGZXRjaCB0aGUgdGFibGUgZGF0YSovXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLm1ha2VDYWxsKHZhcmlhYmxlLCBkYk9wZXJhdGlvbiwgZGJPcGVyYXRpb25PcHRpb25zKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIGdldEVudGl0eVN1Y2Nlc3MocmVzcG9uc2UsIHJlc29sdmUpO1xuICAgICAgICAgICAgfSwgZXJyID0+IHtcbiAgICAgICAgICAgICAgICBnZXRFbnRpdHlFcnJvcihlcnIsIHJlamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwZXJmb3JtQ1VEKG9wZXJhdGlvbiwgdmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBvcHRpb25zLmlucHV0RmllbGRzID0gb3B0aW9ucy5pbnB1dEZpZWxkcyB8fCBnZXRDbG9uZWRPYmplY3QodmFyaWFibGUuaW5wdXRGaWVsZHMpO1xuICAgICAgICByZXR1cm4gJHF1ZXVlLnN1Ym1pdCh2YXJpYWJsZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeUluZmxpZ2h0KHZhcmlhYmxlLCAhb3B0aW9ucy5za2lwVG9nZ2xlU3RhdGUpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZG9DVUQob3BlcmF0aW9uLCB2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRxdWV1ZS5wcm9jZXNzKHZhcmlhYmxlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RpZnlJbmZsaWdodCh2YXJpYWJsZSwgZmFsc2UsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkcXVldWUucHJvY2Vzcyh2YXJpYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5SW5mbGlnaHQodmFyaWFibGUsIGZhbHNlLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZXJyb3IpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZG9DVUQoYWN0aW9uLCB2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgY29uc3QgcHJvamVjdElEID0gJHJvb3RTY29wZS5wcm9qZWN0LmlkIHx8ICRyb290U2NvcGUucHJvamVjdE5hbWUsXG4gICAgICAgICAgICBwcmltYXJ5S2V5ID0gTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0UHJpbWFyeUtleSh2YXJpYWJsZSksXG4gICAgICAgICAgICBpc0Zvcm1EYXRhU3VwcG9ydGVkID0gKHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYik7XG5cbiAgICAgICAgbGV0IGRiTmFtZSxcbiAgICAgICAgICAgIGNvbXBvc2l0ZUlkID0gJycsXG4gICAgICAgICAgICByb3dPYmplY3QgPSB7fSxcbiAgICAgICAgICAgIHByZXZEYXRhLFxuICAgICAgICAgICAgY29tcG9zaXRlS2V5c0RhdGEgPSB7fSxcbiAgICAgICAgICAgIHByZXZDb21wb3NpdGVLZXlzRGF0YSA9IHt9LFxuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICBjb2x1bW5OYW1lLFxuICAgICAgICAgICAgY2xvbmVkRmllbGRzLFxuICAgICAgICAgICAgb3V0cHV0LFxuICAgICAgICAgICAgb25DVURlcnJvcixcbiAgICAgICAgICAgIG9uQ1VEc3VjY2VzcyxcbiAgICAgICAgICAgIGlucHV0RmllbGRzID0gb3B0aW9ucy5pbnB1dEZpZWxkcyB8fCB2YXJpYWJsZS5pbnB1dEZpZWxkcztcblxuICAgICAgICAvLyBFVkVOVDogT05fQkVGT1JFX1VQREFURVxuICAgICAgICBjbG9uZWRGaWVsZHMgPSBnZXRDbG9uZWRPYmplY3QoaW5wdXRGaWVsZHMpO1xuICAgICAgICBvdXRwdXQgPSBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5CRUZPUkVfVVBEQVRFLCB2YXJpYWJsZSwgY2xvbmVkRmllbGRzLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKG91dHB1dCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIC8vICRyb290U2NvcGUuJGVtaXQoJ3RvZ2dsZS12YXJpYWJsZS1zdGF0ZScsIHZhcmlhYmxlLCBmYWxzZSk7XG4gICAgICAgICAgICB0cmlnZ2VyRm4oZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdDYWxsIHN0b3BwZWQgZnJvbSB0aGUgZXZlbnQ6ICcgKyBWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuQkVGT1JFX1VQREFURSk7XG4gICAgICAgIH1cbiAgICAgICAgaW5wdXRGaWVsZHMgPSBfLmlzT2JqZWN0KG91dHB1dCkgPyBvdXRwdXQgOiBjbG9uZWRGaWVsZHM7XG4gICAgICAgIHZhcmlhYmxlLmNhblVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnJvdykge1xuICAgICAgICAgICAgcm93T2JqZWN0ID0gb3B0aW9ucy5yb3c7XG4gICAgICAgICAgICAvLyBGb3IgZGF0ZXRpbWUgdHlwZXMsIGNvbnZlcnQgdGhlIHZhbHVlIHRvIHRoZSBmb3JtYXQgYWNjZXB0ZWQgYnkgYmFja2VuZFxuICAgICAgICAgICAgXy5mb3JFYWNoKHJvd09iamVjdCwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWVsZFR5cGUgPSBMaXZlVmFyaWFibGVVdGlscy5nZXRGaWVsZFR5cGUoa2V5LCB2YXJpYWJsZSk7XG4gICAgICAgICAgICAgICAgbGV0IGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGlzRGF0ZVRpbWVUeXBlKGZpZWxkVHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IGZvcm1hdERhdGUodmFsdWUsIGZpZWxkVHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIHJvd09iamVjdFtrZXldID0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKF8uaXNBcnJheSh2YWx1ZSkgJiYgTGl2ZVZhcmlhYmxlVXRpbHMuaXNTdHJpbmdUeXBlKGZpZWxkVHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29uc3RydWN0ICcsJyBzZXBhcmF0ZWQgc3RyaW5nIGlmIHBhcmFtIGlzIG5vdCBhcnJheSB0eXBlIGJ1dCB2YWx1ZSBpcyBhbiBhcnJheVxuICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gXy5qb2luKHZhbHVlLCAnLCcpO1xuICAgICAgICAgICAgICAgICAgICByb3dPYmplY3Rba2V5XSA9IGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBNZXJnZSBpbnB1dEZpZWxkcyBhbG9uZyB3aXRoIGRhdGFPYmogd2hpbGUgbWFraW5nIEluc2VydC9VcGRhdGUvRGVsZXRlXG4gICAgICAgICAgICBfLmZvckVhY2goaW5wdXRGaWVsZHMsIChhdHRyVmFsdWUsIGF0dHJOYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKChpc0RlZmluZWQoYXR0clZhbHVlKSAmJiBhdHRyVmFsdWUgIT09ICcnKSAmJiAoIWlzRGVmaW5lZChyb3dPYmplY3RbYXR0ck5hbWVdKSB8fCByb3dPYmplY3RbYXR0ck5hbWVdID09PSAnJykpIHtcbiAgICAgICAgICAgICAgICAgICAgcm93T2JqZWN0W2F0dHJOYW1lXSA9IGF0dHJWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uZm9yRWFjaChpbnB1dEZpZWxkcywgKGZpZWxkVmFsdWUsIGZpZWxkTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBmaWVsZFR5cGU7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJpbWFyeUtleXMgPSB2YXJpYWJsZS5wcm9wZXJ0aWVzTWFwLnByaW1hcnlGaWVsZHMgfHwgdmFyaWFibGUucHJvcGVydGllc01hcC5wcmltYXJ5S2V5cztcbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoZmllbGRWYWx1ZSkgJiYgZmllbGRWYWx1ZSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgLypGb3IgZGVsZXRlIGFjdGlvbiwgdGhlIGlucHV0RmllbGRzIG5lZWQgdG8gYmUgc2V0IGluIHRoZSByZXF1ZXN0IFVSTC4gSGVuY2UgY29tcG9zaXRlSWQgaXMgc2V0LlxuICAgICAgICAgICAgICAgICAgICAgKiBGb3IgaW5zZXJ0IGFjdGlvbiBpbnB1dEZpZWxkcyBuZWVkIHRvIGJlIHNldCBpbiB0aGUgcmVxdWVzdCBkYXRhLiBIZW5jZSByb3dPYmplY3QgaXMgc2V0LlxuICAgICAgICAgICAgICAgICAgICAgKiBGb3IgdXBkYXRlIGFjdGlvbiwgYm90aCBuZWVkIHRvIGJlIHNldC4qL1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnZGVsZXRlVGFibGVEYXRhJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlSWQgPSBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICd1cGRhdGVUYWJsZURhdGEnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5S2V5cy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpZWxkTmFtZSA9PT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvc2l0ZUlkID0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aW9uICE9PSAnZGVsZXRlVGFibGVEYXRhJyB8fCBMaXZlVmFyaWFibGVVdGlscy5pc0NvbXBvc2l0ZUtleShwcmltYXJ5S2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRUeXBlID0gTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0RmllbGRUeXBlKGZpZWxkTmFtZSwgdmFyaWFibGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGF0ZVRpbWVUeXBlKGZpZWxkVHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gZm9ybWF0RGF0ZShmaWVsZFZhbHVlLCBmaWVsZFR5cGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChfLmlzQXJyYXkoZmllbGRWYWx1ZSkgJiYgTGl2ZVZhcmlhYmxlVXRpbHMuaXNTdHJpbmdUeXBlKGZpZWxkVHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb25zdHJ1Y3QgJywnIHNlcGFyYXRlZCBzdHJpbmcgaWYgcGFyYW0gaXMgbm90IGFycmF5IHR5cGUgYnV0IHZhbHVlIGlzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IF8uam9pbihmaWVsZFZhbHVlLCAnLCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcm93T2JqZWN0W2ZpZWxkTmFtZV0gPSBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciByZWxhdGVkIGVudGl0aWVzLCBjbGVhciB0aGUgYmxvYiB0eXBlIGZpZWxkc1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc09iamVjdChmaWVsZFZhbHVlKSAmJiAhXy5pc0FycmF5KGZpZWxkVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2goZmllbGRWYWx1ZSwgKHZhbCwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKExpdmVWYXJpYWJsZVV0aWxzLmdldEZpZWxkVHlwZShmaWVsZE5hbWUsIHZhcmlhYmxlLCBrZXkpID09PSAnYmxvYicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZVtrZXldID0gdmFsID09PSBudWxsID8gdmFsIDogJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICd1cGRhdGVUYWJsZURhdGEnOlxuICAgICAgICAgICAgICAgIHByZXZEYXRhID0gb3B0aW9ucy5wcmV2RGF0YSB8fCB7fTtcbiAgICAgICAgICAgICAgICAvKkNvbnN0cnVjdCB0aGUgXCJyZXF1ZXN0RGF0YVwiIGJhc2VkIG9uIHdoZXRoZXIgdGhlIHRhYmxlIGFzc29jaWF0ZWQgd2l0aCB0aGUgbGl2ZS12YXJpYWJsZSBoYXMgYSBjb21wb3NpdGUga2V5IG9yIG5vdC4qL1xuICAgICAgICAgICAgICAgIGlmIChMaXZlVmFyaWFibGVVdGlscy5pc0NvbXBvc2l0ZUtleShwcmltYXJ5S2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoTGl2ZVZhcmlhYmxlVXRpbHMuaXNOb1ByaW1hcnlLZXkocHJpbWFyeUtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZDb21wb3NpdGVLZXlzRGF0YSA9IHByZXZEYXRhIHx8IG9wdGlvbnMucm93RGF0YSB8fCByb3dPYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NpdGVLZXlzRGF0YSA9IHJvd09iamVjdDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlLZXkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvc2l0ZUtleXNEYXRhW2tleV0gPSByb3dPYmplY3Rba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbiBjYXNlIG9mIHBlcmlvZGljIHVwZGF0ZSBmb3IgQnVzaW5lc3MgdGVtcG9yYWwgZmllbGRzLCBwYXNzaW5nIHVwZGF0ZWQgZmllbGQgZGF0YS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wZXJpb2QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldkNvbXBvc2l0ZUtleXNEYXRhW2tleV0gPSByb3dPYmplY3Rba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2Q29tcG9zaXRlS2V5c0RhdGFba2V5XSA9IHByZXZEYXRhW2tleV0gfHwgKG9wdGlvbnMucm93RGF0YSAmJiBvcHRpb25zLnJvd0RhdGFba2V5XSkgfHwgcm93T2JqZWN0W2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5yb3cgPSBjb21wb3NpdGVLZXlzRGF0YTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5jb21wb3NpdGVLZXlzRGF0YSA9IHByZXZDb21wb3NpdGVLZXlzRGF0YTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5S2V5LmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleS5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgPSBwcmV2RGF0YVtrZXldIHx8IChvcHRpb25zLnJvd0RhdGEgJiYgb3B0aW9ucy5yb3dEYXRhW2tleV0pIHx8IHJvd09iamVjdFtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5OYW1lID0ga2V5LnNwbGl0KCcuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgPSBwcmV2RGF0YVtjb2x1bW5OYW1lWzBdXVtjb2x1bW5OYW1lWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuaWQgPSBpZDtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5yb3cgPSByb3dPYmplY3Q7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkZWxldGVUYWJsZURhdGEnOlxuICAgICAgICAgICAgICAgIC8qQ29uc3RydWN0IHRoZSBcInJlcXVlc3REYXRhXCIgYmFzZWQgb24gd2hldGhlciB0aGUgdGFibGUgYXNzb2NpYXRlZCB3aXRoIHRoZSBsaXZlLXZhcmlhYmxlIGhhcyBhIGNvbXBvc2l0ZSBrZXkgb3Igbm90LiovXG4gICAgICAgICAgICAgICAgaWYgKExpdmVWYXJpYWJsZVV0aWxzLmlzQ29tcG9zaXRlS2V5KHByaW1hcnlLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChMaXZlVmFyaWFibGVVdGlscy5pc05vUHJpbWFyeUtleShwcmltYXJ5S2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlS2V5c0RhdGEgPSByb3dPYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5S2V5LmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NpdGVLZXlzRGF0YVtrZXldID0gcm93T2JqZWN0W2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmNvbXBvc2l0ZUtleXNEYXRhID0gY29tcG9zaXRlS2V5c0RhdGE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghXy5pc0VtcHR5KHJvd09iamVjdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUtleS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA9IHJvd09iamVjdFtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5OYW1lID0ga2V5LnNwbGl0KCcuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgPSByb3dPYmplY3RbY29sdW1uTmFtZVswXV1bY29sdW1uTmFtZVsxXV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmlkID0gaWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB0YWJsZSBoYXMgYmxvYiBjb2x1bW4gdGhlbiBzZW5kIG11bHRpcGFydCBkYXRhXG4gICAgICAgIGlmICgoYWN0aW9uID09PSAndXBkYXRlVGFibGVEYXRhJyB8fCBhY3Rpb24gPT09ICdpbnNlcnRUYWJsZURhdGEnKSAmJiBMaXZlVmFyaWFibGVVdGlscy5oYXNCbG9iKHZhcmlhYmxlKSAmJiBpc0Zvcm1EYXRhU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSAndXBkYXRlVGFibGVEYXRhJykge1xuICAgICAgICAgICAgICAgIGFjdGlvbiA9ICd1cGRhdGVNdWx0aVBhcnRUYWJsZURhdGEnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhY3Rpb24gPSAnaW5zZXJ0TXVsdGlQYXJ0VGFibGVEYXRhJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJvd09iamVjdCA9IExpdmVWYXJpYWJsZVV0aWxzLnByZXBhcmVGb3JtRGF0YSh2YXJpYWJsZSwgcm93T2JqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICAvKkNoZWNrIGlmIFwib3B0aW9uc1wiIGhhdmUgdGhlIFwiY29tcG9zaXRlS2V5c0RhdGFcIiBwcm9wZXJ0eS4qL1xuICAgICAgICBpZiAob3B0aW9ucy5jb21wb3NpdGVLZXlzRGF0YSkge1xuICAgICAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlICd1cGRhdGVUYWJsZURhdGEnOlxuICAgICAgICAgICAgICAgICAgICBhY3Rpb24gPSAndXBkYXRlQ29tcG9zaXRlVGFibGVEYXRhJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGVsZXRlVGFibGVEYXRhJzpcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uID0gJ2RlbGV0ZUNvbXBvc2l0ZVRhYmxlRGF0YSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3VwZGF0ZU11bHRpUGFydFRhYmxlRGF0YSc6XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbiA9ICd1cGRhdGVNdWx0aVBhcnRDb21wb3NpdGVUYWJsZURhdGEnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvc2l0ZUlkID0gTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0Q29tcG9zaXRlSURVUkwob3B0aW9ucy5jb21wb3NpdGVLZXlzRGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgZGJOYW1lID0gdmFyaWFibGUubGl2ZVNvdXJjZTtcblxuICAgICAgICAvKlNldCB0aGUgXCJkYXRhXCIgaW4gdGhlIHJlcXVlc3QgdG8gXCJ1bmRlZmluZWRcIiBpZiB0aGVyZSBpcyBubyBkYXRhLlxuICAgICAgICAqIFRoaXMgaGFuZGxlcyBjYXNlcyBzdWNoIGFzIFwiRGVsZXRlXCIgcmVxdWVzdHMgd2hlcmUgZGF0YSBzaG91bGQgbm90IGJlIHBhc3NlZC4qL1xuICAgICAgICBpZiAoXy5pc0VtcHR5KHJvd09iamVjdCkgJiYgYWN0aW9uID09PSAnZGVsZXRlVGFibGVEYXRhJykge1xuICAgICAgICAgICAgcm93T2JqZWN0ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChhY3Rpb24gPT09ICd1cGRhdGVDb21wb3NpdGVUYWJsZURhdGEnIHx8IGFjdGlvbiA9PT0gJ2RlbGV0ZUNvbXBvc2l0ZVRhYmxlRGF0YScpICYmIG9wdGlvbnMucGVyaW9kKSB7XG4gICAgICAgICAgICAvLyBjYXBpdGFsaXplIGZpcnN0IGNoYXJhY3RlclxuICAgICAgICAgICAgYWN0aW9uID0gJ3BlcmlvZCcgKyBhY3Rpb24uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBhY3Rpb24uc3Vic3RyKDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGJPcGVyYXRpb25zID0ge1xuICAgICAgICAgICAgJ3Byb2plY3RJRCc6IHByb2plY3RJRCxcbiAgICAgICAgICAgICdzZXJ2aWNlJzogdmFyaWFibGUuX3ByZWZhYk5hbWUgPyAnJyA6ICdzZXJ2aWNlcycsXG4gICAgICAgICAgICAnZGF0YU1vZGVsTmFtZSc6IGRiTmFtZSxcbiAgICAgICAgICAgICdlbnRpdHlOYW1lJzogdmFyaWFibGUudHlwZSxcbiAgICAgICAgICAgICdpZCc6ICFfLmlzVW5kZWZpbmVkKG9wdGlvbnMuaWQpID8gZW5jb2RlVVJJQ29tcG9uZW50KG9wdGlvbnMuaWQpIDogY29tcG9zaXRlSWQsXG4gICAgICAgICAgICAnZGF0YSc6IHJvd09iamVjdCxcbiAgICAgICAgICAgICd1cmwnOiB2YXJpYWJsZS5fcHJlZmFiTmFtZSA/ICgkcm9vdFNjb3BlLnByb2plY3QuZGVwbG95ZWRVcmwgKyAnL3ByZWZhYnMvJyArIHZhcmlhYmxlLl9wcmVmYWJOYW1lKSA6ICRyb290U2NvcGUucHJvamVjdC5kZXBsb3llZFVybFxuICAgICAgICB9O1xuXG4gICAgICAgIG9uQ1VEZXJyb3IgPSAocmVzcG9uc2U6IGFueSwgcmVqZWN0OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVyck1zZyA9IHJlc3BvbnNlLmVycm9yO1xuICAgICAgICAgICAgY29uc3QgYWR2YW5jZWRPcHRpb25zOiBBZHZhbmNlZE9wdGlvbnMgPSB0aGlzLnByZXBhcmVDYWxsYmFja09wdGlvbnMocmVzcG9uc2UpO1xuICAgICAgICAgICAgLy8gRVZFTlQ6IE9OX1JFU1VMVFxuICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuUkVTVUxULCB2YXJpYWJsZSwgZXJyTXNnLCBhZHZhbmNlZE9wdGlvbnMpO1xuICAgICAgICAgICAgLy8gRVZFTlQ6IE9OX0VSUk9SXG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMuc2tpcE5vdGlmaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkVSUk9SLCB2YXJpYWJsZSwgZXJyTXNnLCBhZHZhbmNlZE9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRVZFTlQ6IE9OX0NBTl9VUERBVEVcbiAgICAgICAgICAgIHZhcmlhYmxlLmNhblVwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5DQU5fVVBEQVRFLCB2YXJpYWJsZSwgZXJyTXNnLCBhZHZhbmNlZE9wdGlvbnMpO1xuICAgICAgICAgICAgdHJpZ2dlckZuKGVycm9yLCBlcnJNc2cpO1xuICAgICAgICAgICAgcmVqZWN0KGVyck1zZyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgb25DVURzdWNjZXNzID0gKGRhdGE6IGFueSwgcmVzb2x2ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBsZXQgcmVzcG9uc2UgPSBkYXRhLmJvZHk7XG4gICAgICAgICAgICBjb25zdCBhZHZhbmNlZE9wdGlvbnM6IEFkdmFuY2VkT3B0aW9ucyA9IHRoaXMucHJlcGFyZUNhbGxiYWNrT3B0aW9ucyhkYXRhKTtcblxuICAgICAgICAgICAgJHF1ZXVlLnByb2Nlc3ModmFyaWFibGUpO1xuICAgICAgICAgICAgLyogaWYgZXJyb3IgcmVjZWl2ZWQgb24gbWFraW5nIGNhbGwsIGNhbGwgZXJyb3IgY2FsbGJhY2sgKi9cbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5lcnJvcikge1xuICAgICAgICAgICAgICAgIC8vIEVWRU5UOiBPTl9SRVNVTFRcbiAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5SRVNVTFQsIHZhcmlhYmxlLCByZXNwb25zZSwgYWR2YW5jZWRPcHRpb25zKTtcbiAgICAgICAgICAgICAgICAvLyBFVkVOVDogT05fRVJST1JcbiAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5FUlJPUiwgdmFyaWFibGUsIHJlc3BvbnNlLmVycm9yLCBhZHZhbmNlZE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIC8vIEVWRU5UOiBPTl9DQU5fVVBEQVRFXG4gICAgICAgICAgICAgICAgdmFyaWFibGUuY2FuVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5DQU5fVVBEQVRFLCB2YXJpYWJsZSwgcmVzcG9uc2UuZXJyb3IsIGFkdmFuY2VkT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckZuKGVycm9yLCByZXNwb25zZS5lcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlc3BvbnNlLmVycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRVZFTlQ6IE9OX1JFU1VMVFxuICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuUkVTVUxULCB2YXJpYWJsZSwgcmVzcG9uc2UsIGFkdmFuY2VkT3B0aW9ucyk7XG4gICAgICAgICAgICBpZiAodmFyaWFibGUub3BlcmF0aW9uICE9PSAncmVhZCcpIHtcbiAgICAgICAgICAgICAgICAvLyBFVkVOVDogT05fUFJFUEFSRVNFVERBVEFcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdEYXRhU2V0ID0gaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuUFJFUEFSRV9TRVREQVRBLCB2YXJpYWJsZSwgcmVzcG9uc2UsIGFkdmFuY2VkT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaWYgKG5ld0RhdGFTZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0dGluZyBuZXdEYXRhU2V0IGFzIHRoZSByZXNwb25zZSB0byBzZXJ2aWNlIHZhcmlhYmxlIG9uUHJlcGFyZVNldERhdGFcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBuZXdEYXRhU2V0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXJpYWJsZS5kYXRhU2V0ID0gcmVzcG9uc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHdhdGNoZXJzIHNob3VsZCBnZXQgdHJpZ2dlcmVkIGJlZm9yZSBjYWxsaW5nIG9uU3VjY2VzcyBldmVudC5cbiAgICAgICAgICAgIC8vIHNvIHRoYXQgYW55IHZhcmlhYmxlL3dpZGdldCBkZXBlbmRpbmcgb24gdGhpcyB2YXJpYWJsZSdzIGRhdGEgaXMgdXBkYXRlZFxuICAgICAgICAgICAgJGludm9rZVdhdGNoZXJzKHRydWUpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gRVZFTlQ6IE9OX1NVQ0NFU1NcbiAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5TVUNDRVNTLCB2YXJpYWJsZSwgcmVzcG9uc2UsIGFkdmFuY2VkT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgLy8gRVZFTlQ6IE9OX0NBTl9VUERBVEVcbiAgICAgICAgICAgICAgICB2YXJpYWJsZS5jYW5VcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkNBTl9VUERBVEUsIHZhcmlhYmxlLCByZXNwb25zZSwgYWR2YW5jZWRPcHRpb25zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdHJpZ2dlckZuKHN1Y2Nlc3MsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLm1ha2VDYWxsKHZhcmlhYmxlLCBhY3Rpb24sIGRiT3BlcmF0aW9ucykudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgICBvbkNVRHN1Y2Nlc3MoZGF0YSwgcmVzb2x2ZSk7XG4gICAgICAgICAgICB9LCByZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgb25DVURlcnJvcihyZXNwb25zZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuXG4gICAgcHJpdmF0ZSBhZ2dyZWdhdGVEYXRhKGRlcGxveWVkVXJsLCB2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgbGV0IHRhYmxlT3B0aW9ucyxcbiAgICAgICAgICAgIGRiT3BlcmF0aW9uT3B0aW9ucyxcbiAgICAgICAgICAgIGFnZ3JlZ2F0ZURhdGFTdWNjZXNzLFxuICAgICAgICAgICAgYWdncmVnYXRlRGF0YUVycm9yO1xuICAgICAgICBjb25zdCBkYk9wZXJhdGlvbiA9ICdleGVjdXRlQWdncmVnYXRlUXVlcnknO1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgb3B0aW9ucy5za2lwRW5jb2RlID0gdHJ1ZTtcbiAgICAgICAgaWYgKHZhcmlhYmxlLmZpbHRlckZpZWxkcykge1xuICAgICAgICAgICAgdGFibGVPcHRpb25zID0gTGl2ZVZhcmlhYmxlVXRpbHMucHJlcGFyZVRhYmxlT3B0aW9ucyh2YXJpYWJsZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBvcHRpb25zLmFnZ3JlZ2F0aW9ucy5maWx0ZXIgPSB0YWJsZU9wdGlvbnMucXVlcnk7XG4gICAgICAgIH1cbiAgICAgICAgZGJPcGVyYXRpb25PcHRpb25zID0ge1xuICAgICAgICAgICAgJ2RhdGFNb2RlbE5hbWUnOiB2YXJpYWJsZS5saXZlU291cmNlLFxuICAgICAgICAgICAgJ2VudGl0eU5hbWUnOiB2YXJpYWJsZS50eXBlLFxuICAgICAgICAgICAgJ3BhZ2UnOiBvcHRpb25zLnBhZ2UgfHwgMSxcbiAgICAgICAgICAgICdzaXplJzogb3B0aW9ucy5zaXplIHx8IHZhcmlhYmxlLm1heFJlc3VsdHMsXG4gICAgICAgICAgICAnc29ydCc6IG9wdGlvbnMuc29ydCB8fCAnJyxcbiAgICAgICAgICAgICd1cmwnOiBkZXBsb3llZFVybCxcbiAgICAgICAgICAgICdkYXRhJzogb3B0aW9ucy5hZ2dyZWdhdGlvbnNcbiAgICAgICAgfTtcbiAgICAgICAgYWdncmVnYXRlRGF0YVN1Y2Nlc3MgPSAocmVzcG9uc2U6IGFueSwgcmVzb2x2ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UudHlwZSkge1xuICAgICAgICAgICAgICAgIGlmICgocmVzcG9uc2UgJiYgcmVzcG9uc2UuZXJyb3IpIHx8ICFyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oZXJyb3IsIHJlc3BvbnNlLmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oc3VjY2VzcywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBhZ2dyZWdhdGVEYXRhRXJyb3IgPSAoZXJyb3JNc2c6IGFueSwgcmVqZWN0OiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvciwgZXJyb3JNc2cpO1xuICAgICAgICAgICAgcmVqZWN0KGVycm9yTXNnKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5tYWtlQ2FsbCh2YXJpYWJsZSwgZGJPcGVyYXRpb24sIGRiT3BlcmF0aW9uT3B0aW9ucykudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBhZ2dyZWdhdGVEYXRhU3VjY2VzcyhyZXNwb25zZSwgcmVzb2x2ZSk7XG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xuICAgICAgICAgICAgICAgIGFnZ3JlZ2F0ZURhdGFFcnJvcihlcnIsIHJlamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBQVUJMSUMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovL1xuXG4gICAgLyoqXG4gICAgICogTWFrZXMgaHR0cCBjYWxsIGZvciBhIExpdmUgVmFyaWFibGUgYWdhaW5zdCB0aGUgY29uZmlndXJlZCBEQiBFbnRpdHkuXG4gICAgICogR2V0cyB0aGUgcGFnaW5hdGVkIHJlY29yZHMgYWdhaW5zdCB0aGUgZW50aXR5XG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0gc3VjY2Vzc1xuICAgICAqIEBwYXJhbSBlcnJvclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59OiB3aWxsIGJlIHJlc29sdmVkIG9uIHN1Y2Nlc3NmdWwgZGF0YSBmZXRjaFxuICAgICAqL1xuICAgIHB1YmxpYyBsaXN0UmVjb3Jkcyh2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIG9wdGlvbnMuZmlsdGVyRmllbGRzID0gb3B0aW9ucy5maWx0ZXJGaWVsZHMgfHwgZ2V0Q2xvbmVkT2JqZWN0KHZhcmlhYmxlLmZpbHRlckZpZWxkcyk7XG4gICAgICAgIHJldHVybiAkcXVldWUuc3VibWl0KHZhcmlhYmxlKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5SW5mbGlnaHQodmFyaWFibGUsICFvcHRpb25zLnNraXBUb2dnbGVTdGF0ZSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRFbnRpdHlEYXRhKHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcilcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgJHF1ZXVlLnByb2Nlc3ModmFyaWFibGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeUluZmxpZ2h0KHZhcmlhYmxlLCBmYWxzZSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRxdWV1ZS5wcm9jZXNzKHZhcmlhYmxlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RpZnlJbmZsaWdodCh2YXJpYWJsZSwgZmFsc2UsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBlcnJvcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFrZXMgYSBQT1NUIGh0dHAgY2FsbCBmb3IgYSBMaXZlIFZhcmlhYmxlIGFnYWluc3QgdGhlIGNvbmZpZ3VyZWQgREIgRW50aXR5LlxuICAgICAqIFNlbmRzIGEgVGFibGUgcmVjb3JkIG9iamVjdCB3aXRoIHRoZSByZXF1ZXN0IGJvZHlcbiAgICAgKiB0aGUgcmVjb3JkIGlzIGluc2VydGVkIGludG8gdGhlIGVudGl0eSBhdCB0aGUgYmFja2VuZFxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHBhcmFtIHN1Y2Nlc3NcbiAgICAgKiBAcGFyYW0gZXJyb3JcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fTogd2lsbCBiZSByZXNvbHZlZCBvbiBzdWNjZXNzZnVsIGRhdGEgZmV0Y2hcbiAgICAgKi9cbiAgICBwdWJsaWMgaW5zZXJ0UmVjb3JkKHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5wZXJmb3JtQ1VEKCdpbnNlcnRUYWJsZURhdGEnLCB2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ha2VzIGEgUFVUIGh0dHAgY2FsbCBmb3IgYSBMaXZlIFZhcmlhYmxlIGFnYWluc3QgdGhlIGNvbmZpZ3VyZWQgREIgRW50aXR5LlxuICAgICAqIFNlbmRzIGEgVGFibGUgcmVjb3JkIG9iamVjdCB3aXRoIHRoZSByZXF1ZXN0IGJvZHkgYWdhaW5zdCB0aGUgcHJpbWFyeSBrZXkgb2YgYW4gZXhpc3RpbmcgcmVjb3JkXG4gICAgICogdGhlIHJlY29yZCBpcyB1cGRhdGVkIGludG8gdGhlIGVudGl0eSBhdCB0aGUgYmFja2VuZFxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHBhcmFtIHN1Y2Nlc3NcbiAgICAgKiBAcGFyYW0gZXJyb3JcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fTogd2lsbCBiZSByZXNvbHZlZCBvbiBzdWNjZXNzZnVsIGRhdGEgZmV0Y2hcbiAgICAgKi9cbiAgICBwdWJsaWMgdXBkYXRlUmVjb3JkKHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5wZXJmb3JtQ1VEKCd1cGRhdGVUYWJsZURhdGEnLCB2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ha2VzIGEgREVMRVRFIGh0dHAgY2FsbCBmb3IgYSBMaXZlIFZhcmlhYmxlIGFnYWluc3QgdGhlIGNvbmZpZ3VyZWQgREIgRW50aXR5LlxuICAgICAqIFNlbmRzIHRoZSBwcmltYXJ5IGtleSBvZiBhbiBleGlzdGluZyByZWNvcmRcbiAgICAgKiB0aGUgcmVjb3JkIGlzIGRlbGV0ZWQgZnJvbSB0aGUgZW50aXR5IGF0IHRoZSBiYWNrZW5kXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0gc3VjY2Vzc1xuICAgICAqIEBwYXJhbSBlcnJvclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59OiB3aWxsIGJlIHJlc29sdmVkIG9uIHN1Y2Nlc3NmdWwgZGF0YSBmZXRjaFxuICAgICAqL1xuICAgIHB1YmxpYyBkZWxldGVSZWNvcmQodmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBlcmZvcm1DVUQoJ2RlbGV0ZVRhYmxlRGF0YScsIHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2V0cyB0aGUgdmFsdWUgYWdhaW5zdCBwYXNzZWQga2V5IG9uIHRoZSBcImlucHV0RmllbGRzXCIgb2JqZWN0IGluIHRoZSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBrZXk6IGNhbiBiZTpcbiAgICAgKiAgLSBhIHN0cmluZyBlLmcuIFwidXNlcm5hbWVcIlxuICAgICAqICAtIGFuIG9iamVjdCwgZS5nLiB7XCJ1c2VybmFtZVwiOiBcImpvaG5cIiwgXCJzc25cIjogXCIxMTExMVwifVxuICAgICAqIEBwYXJhbSB2YWxcbiAgICAgKiAtIGlmIGtleSBpcyBzdHJpbmcsIHRoZSB2YWx1ZSBhZ2FpbnN0IGl0IChmb3IgdGhhdCBkYXRhIHR5cGUpXG4gICAgICogLSBpZiBrZXkgaXMgb2JqZWN0LCBub3QgcmVxdWlyZWRcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIHNldElucHV0KHZhcmlhYmxlLCBrZXksIHZhbCwgb3B0aW9ucykge1xuICAgICAgICB2YXJpYWJsZS5pbnB1dEZpZWxkcyA9IHZhcmlhYmxlLmlucHV0RmllbGRzIHx8IHt9O1xuICAgICAgICByZXR1cm4gc2V0SW5wdXQodmFyaWFibGUuaW5wdXRGaWVsZHMsIGtleSwgdmFsLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzZXRzIHRoZSB2YWx1ZSBhZ2FpbnN0IHBhc3NlZCBrZXkgb24gdGhlIFwiZmlsdGVyRmllbGRzXCIgb2JqZWN0IGluIHRoZSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBrZXk6IGNhbiBiZTpcbiAgICAgKiAgLSBhIHN0cmluZyBlLmcuIFwidXNlcm5hbWVcIlxuICAgICAqICAtIGFuIG9iamVjdCwgZS5nLiB7XCJ1c2VybmFtZVwiOiBcImpvaG5cIiwgXCJzc25cIjogXCIxMTExMVwifVxuICAgICAqIEBwYXJhbSB2YWxcbiAgICAgKiAtIGlmIGtleSBpcyBzdHJpbmcsIHRoZSB2YWx1ZSBhZ2FpbnN0IGl0IChmb3IgdGhhdCBkYXRhIHR5cGUpXG4gICAgICogLSBpZiBrZXkgaXMgb2JqZWN0LCBub3QgcmVxdWlyZWRcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIHNldEZpbHRlcih2YXJpYWJsZSwga2V5LCB2YWwpIHtcbiAgICAgICAgbGV0IHBhcmFtT2JqOiBhbnkgPSB7fSxcbiAgICAgICAgICAgIHRhcmdldE9iajogYW55ID0ge307XG4gICAgICAgIGlmIChfLmlzT2JqZWN0KGtleSkpIHtcbiAgICAgICAgICAgIHBhcmFtT2JqID0ga2V5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFyYW1PYmpba2V5XSA9IHZhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdmFyaWFibGUuZmlsdGVyRXhwcmVzc2lvbnMpIHtcbiAgICAgICAgICAgIHZhcmlhYmxlLmZpbHRlckV4cHJlc3Npb25zID0geydjb25kaXRpb24nOiAnQU5EJywgJ3J1bGVzJzogW119O1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldE9iaiA9IHZhcmlhYmxlLmZpbHRlckV4cHJlc3Npb25zO1xuXG4gICAgICAgIC8vIGZpbmQgdGhlIGV4aXN0aW5nIGNyaXRlcmlhIGlmIHByZXNlbnQgb3IgZWxzZSByZXR1cm4gbnVsbC4gRmluZCB0aGUgZmlyc3Qgb25lIGFuZCByZXR1cm4uXG4gICAgICAgIC8vIElmIHRoZSB1c2VyIHdhbnRzIHRvIHNldCBhIGRpZmZlcmVudCBvYmplY3QsIHRoZW4gaGUgaGFzIHRvIHVzZSB0aGUgZ2V0Q3JpdGVyaWEgQVBJIGRlZmluZWRcbiAgICAgICAgLy8gb24gdGhlIGRhdGFGaWx0ZXIgb2JqZWN0IHBhc3NlZCB0byB0aGUgb25CZWZvcmVMaXN0UmVjb3Jkc1xuICAgICAgICBmdW5jdGlvbiBnZXRFeGlzdGluZ0NyaXRlcmlhKGZpbHRlckZpZWxkKSB7XG4gICAgICAgICAgICBsZXQgZXhpc3RpbmdDcml0ZXJpYSA9IG51bGw7XG4gICAgICAgICAgICBMaXZlVmFyaWFibGVVdGlscy50cmF2ZXJzZUZpbHRlckV4cHJlc3Npb25zKHRhcmdldE9iaiwgZnVuY3Rpb24gKGZpbHRlckV4cHJlc3Npb25zLCBjcml0ZXJpYSkge1xuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJGaWVsZCA9PT0gY3JpdGVyaWEudGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBleGlzdGluZ0NyaXRlcmlhID0gY3JpdGVyaWE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZXhpc3RpbmdDcml0ZXJpYTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uZm9yRWFjaChwYXJhbU9iaiwgZnVuY3Rpb24gKHBhcmFtVmFsLCBwYXJhbUtleSkge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdDcml0ZXJpYSA9IGdldEV4aXN0aW5nQ3JpdGVyaWEocGFyYW1LZXkpO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nQ3JpdGVyaWEgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBleGlzdGluZ0NyaXRlcmlhLnZhbHVlID0gcGFyYW1WYWw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldE9iai5ydWxlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBwYXJhbUtleSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJycsXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoTW9kZTogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwYXJhbVZhbCxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0YXJnZXRPYmo7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFrZXMgYSBmaWxlIGRvd25sb2FkIGNhbGwgZm9yIGEgdGFibGVcbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqL1xuICAgIHB1YmxpYyBkb3dubG9hZCh2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2Vzc0hhbmRsZXIsIGVycm9ySGFuZGxlcikge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgbGV0IHRhYmxlT3B0aW9ucyxcbiAgICAgICAgICAgIGRiT3BlcmF0aW9uT3B0aW9ucyxcbiAgICAgICAgICAgIGRvd25sb2FkU3VjY2VzcyxcbiAgICAgICAgICAgIGRvd25sb2FkRXJyb3I7XG4gICAgICAgIGNvbnN0IGRhdGE6IGFueSA9IHt9O1xuICAgICAgICBjb25zdCBkYk9wZXJhdGlvbiA9ICdleHBvcnRUYWJsZURhdGEnO1xuICAgICAgICBjb25zdCBwcm9qZWN0SUQgPSAkcm9vdFNjb3BlLnByb2plY3QuaWQgfHwgJHJvb3RTY29wZS5wcm9qZWN0TmFtZTtcbiAgICAgICAgb3B0aW9ucy5kYXRhLnNlYXJjaFdpdGhRdWVyeSA9IHRydWU7IC8vIEZvciBleHBvcnQsIHF1ZXJ5IGFwaSBpcyB1c2VkLiBTbyBzZXQgdGhpcyBmbGFnIHRvIHRydWVcbiAgICAgICAgb3B0aW9ucy5kYXRhLnNraXBFbmNvZGUgPSB0cnVlO1xuICAgICAgICB0YWJsZU9wdGlvbnMgPSBMaXZlVmFyaWFibGVVdGlscy5wcmVwYXJlVGFibGVPcHRpb25zKHZhcmlhYmxlLCBvcHRpb25zLmRhdGEsIHVuZGVmaW5lZCk7XG4gICAgICAgIGRhdGEucXVlcnkgPSB0YWJsZU9wdGlvbnMucXVlcnkgPyB0YWJsZU9wdGlvbnMucXVlcnkgOiAnJztcbiAgICAgICAgZGF0YS5leHBvcnRTaXplID0gb3B0aW9ucy5kYXRhLmV4cG9ydFNpemU7XG4gICAgICAgIGRhdGEuZXhwb3J0VHlwZSA9IG9wdGlvbnMuZGF0YS5leHBvcnRUeXBlO1xuICAgICAgICBkYXRhLmZpZWxkcyA9IGZvcm1hdEV4cG9ydEV4cHJlc3Npb24ob3B0aW9ucy5kYXRhLmZpZWxkcyk7XG4gICAgICAgIGlmIChvcHRpb25zLmRhdGEuZmlsZU5hbWUpIHtcbiAgICAgICAgICAgIGRhdGEuZmlsZU5hbWUgPSBvcHRpb25zLmRhdGEuZmlsZU5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgZGJPcGVyYXRpb25PcHRpb25zID0ge1xuICAgICAgICAgICAgJ3Byb2plY3RJRCc6IHByb2plY3RJRCxcbiAgICAgICAgICAgICdzZXJ2aWNlJzogdmFyaWFibGUuZ2V0UHJlZmFiTmFtZSgpID8gJycgOiAnc2VydmljZXMnLFxuICAgICAgICAgICAgJ2RhdGFNb2RlbE5hbWUnOiB2YXJpYWJsZS5saXZlU291cmNlLFxuICAgICAgICAgICAgJ2VudGl0eU5hbWUnOiB2YXJpYWJsZS50eXBlLFxuICAgICAgICAgICAgJ3NvcnQnOiB0YWJsZU9wdGlvbnMuc29ydCxcbiAgICAgICAgICAgICd1cmwnOiB2YXJpYWJsZS5nZXRQcmVmYWJOYW1lKCkgPyAoJHJvb3RTY29wZS5wcm9qZWN0LmRlcGxveWVkVXJsICsgJy9wcmVmYWJzLycgKyB2YXJpYWJsZS5nZXRQcmVmYWJOYW1lKCkpIDogJHJvb3RTY29wZS5wcm9qZWN0LmRlcGxveWVkVXJsLFxuICAgICAgICAgICAgJ2RhdGEnOiBkYXRhLFxuICAgICAgICAgICAgJ2ZpbHRlcic6IExpdmVWYXJpYWJsZVV0aWxzLmdldFdoZXJlQ2xhdXNlR2VuZXJhdG9yKHZhcmlhYmxlLCBvcHRpb25zKVxuICAgICAgICAgICAgLy8gJ2ZpbHRlck1ldGEnICAgIDogdGFibGVPcHRpb25zLmZpbHRlclxuICAgICAgICB9O1xuICAgICAgICBkb3dubG9hZFN1Y2Nlc3MgPSAocmVzcG9uc2U6IGFueSwgcmVzb2x2ZTogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UudHlwZSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVzcG9uc2UuYm9keS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckZuKHN1Y2Nlc3NIYW5kbGVyLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGRvd25sb2FkRXJyb3IgPSAoZXJyOiBhbnksIHJlamVjdDogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcHQ6IEFkdmFuY2VkT3B0aW9ucyA9IHRoaXMucHJlcGFyZUNhbGxiYWNrT3B0aW9ucyhlcnIuZGV0YWlscyk7XG4gICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5FUlJPUiwgdmFyaWFibGUsIGVyci5lcnJvciwgb3B0KTtcbiAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvckhhbmRsZXIsIGVyci5lcnJvcik7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMubWFrZUNhbGwodmFyaWFibGUsIGRiT3BlcmF0aW9uLCBkYk9wZXJhdGlvbk9wdGlvbnMpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgZG93bmxvYWRTdWNjZXNzKHJlc3BvbnNlLCByZXNvbHZlKTtcbiAgICAgICAgICAgIH0sIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGRvd25sb2FkRXJyb3IoZXJyb3IsIHJlamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZ2V0cyBwcmltYXJ5IGtleXMgYWdhaW5zdCB0aGUgcGFzc2VkIHJlbGF0ZWQgVGFibGVcbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKiBAcGFyYW0gcmVsYXRlZEZpZWxkXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UmVsYXRlZFRhYmxlUHJpbWFyeUtleXModmFyaWFibGUsIHJlbGF0ZWRGaWVsZCkge1xuICAgICAgICBsZXQgcHJpbWFyeUtleXMsXG4gICAgICAgICAgICByZXN1bHQsXG4gICAgICAgICAgICByZWxhdGVkQ29scztcbiAgICAgICAgaWYgKCF2YXJpYWJsZS5wcm9wZXJ0aWVzTWFwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gXy5maW5kKHZhcmlhYmxlLnByb3BlcnRpZXNNYXAuY29sdW1ucyB8fCBbXSwgeydmaWVsZE5hbWUnOiByZWxhdGVkRmllbGR9KTtcbiAgICAgICAgLy8gaWYgcmVsYXRlZCBmaWVsZCBuYW1lIHBhc3NlZCwgZ2V0IGl0cyB0eXBlIGZyb20gY29sdW1ucyBpbnNpZGUgdGhlIGN1cnJlbnQgZmllbGRcbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgcmVsYXRlZENvbHMgPSByZXN1bHQuY29sdW1ucztcbiAgICAgICAgICAgIHByaW1hcnlLZXlzID0gXy5tYXAoXy5maWx0ZXIocmVsYXRlZENvbHMsICdpc1ByaW1hcnlLZXknKSwgJ2ZpZWxkTmFtZScpO1xuICAgICAgICAgICAgaWYgKHByaW1hcnlLZXlzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmltYXJ5S2V5cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZWxhdGVkQ29scyAmJiByZWxhdGVkQ29scy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZWxhdGVkQ29scyA9IF8uZmluZChyZWxhdGVkQ29scywgeydpc1JlbGF0ZWQnOiBmYWxzZX0pO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGVkQ29scyAmJiByZWxhdGVkQ29scy5maWVsZE5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYWtlcyBIVFRQIGNhbGwgdG8gZ2V0IHRoZSBkYXRhIGZvciByZWxhdGVkIGVudGl0eSBvZiBhIGZpZWxkIGluIGFuIGVudGl0eVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBjb2x1bW5OYW1lXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0gc3VjY2Vzc1xuICAgICAqIEBwYXJhbSBlcnJvclxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRSZWxhdGVkVGFibGVEYXRhKHZhcmlhYmxlLCBjb2x1bW5OYW1lLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICBjb25zdCBwcm9qZWN0SUQgPSAkcm9vdFNjb3BlLnByb2plY3QuaWQgfHwgJHJvb3RTY29wZS5wcm9qZWN0TmFtZTtcbiAgICAgICAgY29uc3QgcmVsYXRlZFRhYmxlID0gXy5maW5kKHZhcmlhYmxlLnJlbGF0ZWRUYWJsZXMsIHRhYmxlID0+IHRhYmxlLnJlbGF0aW9uTmFtZSA9PT0gY29sdW1uTmFtZSB8fCB0YWJsZS5jb2x1bW5OYW1lID09PSBjb2x1bW5OYW1lKTsgLy8gQ29tcGFyaW5nIGNvbHVtbiBuYW1lIHRvIHN1cHBvcnQgdGhlIG9sZCBwcm9qZWN0c1xuICAgICAgICBjb25zdCBzZWxmUmVsYXRlZENvbHMgPSBfLm1hcChfLmZpbHRlcih2YXJpYWJsZS5yZWxhdGVkVGFibGVzLCBvID0+IG8udHlwZSA9PT0gdmFyaWFibGUudHlwZSksICdyZWxhdGlvbk5hbWUnKTtcbiAgICAgICAgY29uc3QgZmlsdGVyRmllbGRzID0gW107XG4gICAgICAgIGxldCBvcmRlckJ5LFxuICAgICAgICAgICAgZmlsdGVyT3B0aW9ucyxcbiAgICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgICAgYWN0aW9uLFxuICAgICAgICAgICAgZGJPcGVyYXRpb25PcHRpb25zLFxuICAgICAgICAgICAgZ2V0UmVsYXRlZFRhYmxlRGF0YVN1Y2Nlc3MsXG4gICAgICAgICAgICBnZXRSZWxhdGVkVGFibGVEYXRhRXJyb3I7XG4gICAgICAgIF8uZm9yRWFjaChvcHRpb25zLmZpbHRlckZpZWxkcywgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIHZhbHVlLmZpZWxkTmFtZSA9IGtleTtcbiAgICAgICAgICAgIHZhbHVlLnR5cGUgPSBMaXZlVmFyaWFibGVVdGlscy5nZXRGaWVsZFR5cGUoY29sdW1uTmFtZSwgdmFyaWFibGUsIGtleSk7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGZvciAnaW4nIG1vZGUgd2UgYXJlIHRha2luZyB0aGUgaW5wdXQgYXMgY29tbWEgc2VwYXJhdGVkIHZhbHVlcyBhbmQgZm9yIGJldHdlZW4gaW4gdWkgdGhlcmUgYXJlIHR3byBkaWZmZXJlbnQgZmllbGRzXG4gICAgICAgICAgICAgKiBidXQgdGhlc2UgYXJlIHByb2Nlc3NlZCBhbmQgbWVyZ2VkIGludG8gYSBzaW5nbGUgdmFsdWUgd2l0aCBjb21tYSBhcyBzZXBhcmF0b3IuIEZvciB0aGVzZSBjb25kaXRpb25zIGxpa2UgJ2luJyBhbmQgJ2JldHdlZW4nLFxuICAgICAgICAgICAgICogZm9yIGJ1aWxkaW5nIHRoZSBxdWVyeSwgdGhlIGZ1bmN0aW9uIGV4cGVjdHMgdGhlIHZhbHVlcyB0byBiZSBhbiBhcnJheVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAodmFsdWUuZmlsdGVyQ29uZGl0aW9uID09PSBEQl9DT05TVEFOVFMuREFUQUJBU0VfTUFUQ0hfTU9ERVMuaW4udG9Mb3dlckNhc2UoKSB8fCB2YWx1ZS5maWx0ZXJDb25kaXRpb24gPT09IERCX0NPTlNUQU5UUy5EQVRBQkFTRV9NQVRDSF9NT0RFUy5iZXR3ZWVuLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZS52YWx1ZSA9IHZhbHVlLnZhbHVlLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWx0ZXJGaWVsZHMucHVzaCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBmaWx0ZXJPcHRpb25zID0gTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0RmlsdGVyT3B0aW9ucyh2YXJpYWJsZSwgZmlsdGVyRmllbGRzLCBvcHRpb25zKTtcbiAgICAgICAgcXVlcnkgPSBMaXZlVmFyaWFibGVVdGlscy5nZXRTZWFyY2hRdWVyeShmaWx0ZXJPcHRpb25zLCAnICcgKyAob3B0aW9ucy5sb2dpY2FsT3AgfHwgJ0FORCcpICsgJyAnLCB2YXJpYWJsZS5pZ25vcmVDYXNlKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuZmlsdGVyRXhwcikge1xuICAgICAgICAgICAgY29uc3QgX2Nsb25lZEZpZWxkcyA9IGdldENsb25lZE9iamVjdChfLmlzT2JqZWN0KG9wdGlvbnMuZmlsdGVyRXhwcikgPyBvcHRpb25zLmZpbHRlckV4cHIgOiBKU09OLnBhcnNlKG9wdGlvbnMuZmlsdGVyRXhwcikpO1xuICAgICAgICAgICAgTGl2ZVZhcmlhYmxlVXRpbHMucHJvY2Vzc0ZpbHRlckZpZWxkcyhfY2xvbmVkRmllbGRzLnJ1bGVzLCB2YXJpYWJsZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJFeHBRdWVyeSA9IExpdmVWYXJpYWJsZVV0aWxzLmdlbmVyYXRlU2VhcmNoUXVlcnkoX2Nsb25lZEZpZWxkcy5ydWxlcywgX2Nsb25lZEZpZWxkcy5jb25kaXRpb24sIHZhcmlhYmxlLmlnbm9yZUNhc2UsIG9wdGlvbnMuc2tpcEVuY29kZSk7XG4gICAgICAgICAgICBpZiAocXVlcnkgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlckV4cFF1ZXJ5ICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICBxdWVyeSA9ICcoJyArIHF1ZXJ5ICsgJykgQU5EICgnICsgZmlsdGVyRXhwUXVlcnkgKyAnKSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChmaWx0ZXJFeHBRdWVyeSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICBxdWVyeSA9IGZpbHRlckV4cFF1ZXJ5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXJ5ID0gcXVlcnkgPyAoJ3E9JyArIHF1ZXJ5KSA6ICcnO1xuICAgICAgICBhY3Rpb24gPSAnc2VhcmNoVGFibGVEYXRhV2l0aFF1ZXJ5JztcbiAgICAgICAgb3JkZXJCeSA9IF8uaXNFbXB0eShvcHRpb25zLm9yZGVyQnkpID8gJycgOiAnc29ydD0nICsgb3B0aW9ucy5vcmRlckJ5O1xuICAgICAgICBkYk9wZXJhdGlvbk9wdGlvbnMgPSB7XG4gICAgICAgICAgICBwcm9qZWN0SUQ6IHByb2plY3RJRCxcbiAgICAgICAgICAgIHNlcnZpY2U6IHZhcmlhYmxlLmdldFByZWZhYk5hbWUoKSA/ICcnIDogJ3NlcnZpY2VzJyxcbiAgICAgICAgICAgIGRhdGFNb2RlbE5hbWU6IHZhcmlhYmxlLmxpdmVTb3VyY2UsXG4gICAgICAgICAgICBlbnRpdHlOYW1lOiByZWxhdGVkVGFibGUgPyByZWxhdGVkVGFibGUudHlwZSA6ICcnLFxuICAgICAgICAgICAgcGFnZTogb3B0aW9ucy5wYWdlIHx8IDEsXG4gICAgICAgICAgICBzaXplOiBvcHRpb25zLnBhZ2VzaXplIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHVybDogdmFyaWFibGUuZ2V0UHJlZmFiTmFtZSgpID8gKCRyb290U2NvcGUucHJvamVjdC5kZXBsb3llZFVybCArICcvcHJlZmFicy8nICsgdmFyaWFibGUuZ2V0UHJlZmFiTmFtZSgpKSA6ICRyb290U2NvcGUucHJvamVjdC5kZXBsb3llZFVybCxcbiAgICAgICAgICAgIGRhdGE6IHF1ZXJ5IHx8ICcnLFxuICAgICAgICAgICAgZmlsdGVyOiBMaXZlVmFyaWFibGVVdGlscy5nZXRXaGVyZUNsYXVzZUdlbmVyYXRvcih2YXJpYWJsZSwgb3B0aW9ucyksXG4gICAgICAgICAgICBzb3J0OiBvcmRlckJ5XG4gICAgICAgIH07XG4gICAgICAgIGdldFJlbGF0ZWRUYWJsZURhdGFTdWNjZXNzID0gKHJlczogYW55LCByZXNvbHZlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXMgJiYgcmVzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHJlcy5ib2R5O1xuICAgICAgICAgICAgICAgIC8qUmVtb3ZlIHRoZSBzZWxmIHJlbGF0ZWQgY29sdW1ucyBmcm9tIHRoZSBkYXRhLiBBcyBiYWNrZW5kIGlzIHJlc3RyaWN0aW5nIHRoZSBzZWxmIHJlbGF0ZWQgY29sdW1uIHRvIG9uZSBsZXZlbCwgSW4gbGl2ZWZvcm0gc2VsZWN0LCBkYXRhc2V0IGFuZCBkYXRhdmFsdWUgb2JqZWN0XG4gICAgICAgICAgICAgICAgICogZXF1YWxpdHkgZG9lcyBub3Qgd29yay4gU28sIHJlbW92aW5nIHRoZSBzZWxmIHJlbGF0ZWQgY29sdW1ucyB0byBhY2hlaXZlIHRoZSBxdWFsaXR5Ki9cbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gXy5tYXAocmVzcG9uc2UuY29udGVudCwgbyA9PiBfLm9taXQobywgc2VsZlJlbGF0ZWRDb2xzKSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwYWdpbmF0aW9uID0gT2JqZWN0LmFzc2lnbih7fSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBwYWdpbmF0aW9uLmNvbnRlbnQ7XG5cbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7ZGF0YTogZGF0YSwgcGFnaW5hdGlvbn07XG4gICAgICAgICAgICAgICAgdHJpZ2dlckZuKHN1Y2Nlc3MsIHJlc3VsdCk7XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGdldFJlbGF0ZWRUYWJsZURhdGFFcnJvciA9IChlcnJNc2c6IGFueSwgcmVqZWN0OiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvciwgZXJyTXNnKTtcbiAgICAgICAgICAgIHJlamVjdChlcnJNc2cpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5tYWtlQ2FsbCh2YXJpYWJsZSwgYWN0aW9uLCBkYk9wZXJhdGlvbk9wdGlvbnMpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgZ2V0UmVsYXRlZFRhYmxlRGF0YVN1Y2Nlc3MocmVzcG9uc2UsIHJlc29sdmUpO1xuICAgICAgICAgICAgfSwgZXJyID0+IHtcbiAgICAgICAgICAgICAgICBnZXRSZWxhdGVkVGFibGVEYXRhRXJyb3IoZXJyLCByZWplY3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGRpc3RpbmN0IHJlY29yZHMgZm9yIGFuIGVudGl0eVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHBhcmFtIHN1Y2Nlc3NcbiAgICAgKiBAcGFyYW0gZXJyb3JcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RGlzdGluY3REYXRhQnlGaWVsZHModmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGRiT3BlcmF0aW9uID0gJ2dldERpc3RpbmN0RGF0YUJ5RmllbGRzJztcbiAgICAgICAgY29uc3QgcHJvamVjdElEID0gJHJvb3RTY29wZS5wcm9qZWN0LmlkIHx8ICRyb290U2NvcGUucHJvamVjdE5hbWU7XG4gICAgICAgIGNvbnN0IHJlcXVlc3REYXRhOiBhbnkgPSB7fTtcbiAgICAgICAgbGV0IHNvcnQ7XG4gICAgICAgIGxldCB0YWJsZU9wdGlvbnMsXG4gICAgICAgICAgICBkYk9wZXJhdGlvbk9wdGlvbnMsXG4gICAgICAgICAgICBnZXREaXN0aW5jdERhdGFCeUZpZWxkc1N1Y2Nlc3MsXG4gICAgICAgICAgICBnZXREaXN0aW5jdERhdGFCeUZpZWxkc0Vycm9yO1xuICAgICAgICBvcHRpb25zLnNraXBFbmNvZGUgPSB0cnVlO1xuICAgICAgICBvcHRpb25zLm9wZXJhdGlvbiA9ICdyZWFkJztcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIHRhYmxlT3B0aW9ucyA9IExpdmVWYXJpYWJsZVV0aWxzLnByZXBhcmVUYWJsZU9wdGlvbnModmFyaWFibGUsIG9wdGlvbnMpO1xuICAgICAgICBpZiAodGFibGVPcHRpb25zLnF1ZXJ5KSB7XG4gICAgICAgICAgICByZXF1ZXN0RGF0YS5maWx0ZXIgPSB0YWJsZU9wdGlvbnMucXVlcnk7XG4gICAgICAgIH1cbiAgICAgICAgcmVxdWVzdERhdGEuZ3JvdXBCeUZpZWxkcyA9IF8uaXNBcnJheShvcHRpb25zLmZpZWxkcykgPyBvcHRpb25zLmZpZWxkcyA6IFtvcHRpb25zLmZpZWxkc107XG4gICAgICAgIHNvcnQgPSBvcHRpb25zLnNvcnQgfHwgcmVxdWVzdERhdGEuZ3JvdXBCeUZpZWxkc1swXSArICcgYXNjJztcbiAgICAgICAgc29ydCA9IHNvcnQgPyAnc29ydD0nICsgc29ydCA6ICcnO1xuICAgICAgICBkYk9wZXJhdGlvbk9wdGlvbnMgPSB7XG4gICAgICAgICAgICAncHJvamVjdElEJzogcHJvamVjdElELFxuICAgICAgICAgICAgJ3NlcnZpY2UnOiB2YXJpYWJsZS5nZXRQcmVmYWJOYW1lKCkgPyAnJyA6ICdzZXJ2aWNlcycsXG4gICAgICAgICAgICAnZGF0YU1vZGVsTmFtZSc6IHZhcmlhYmxlLmxpdmVTb3VyY2UsXG4gICAgICAgICAgICAnZW50aXR5TmFtZSc6IG9wdGlvbnMuZW50aXR5TmFtZSB8fCB2YXJpYWJsZS50eXBlLFxuICAgICAgICAgICAgJ3BhZ2UnOiBvcHRpb25zLnBhZ2UgfHwgMSxcbiAgICAgICAgICAgICdzaXplJzogb3B0aW9ucy5wYWdlc2l6ZSxcbiAgICAgICAgICAgICdzb3J0Jzogc29ydCxcbiAgICAgICAgICAgICdkYXRhJzogcmVxdWVzdERhdGEsXG4gICAgICAgICAgICAnZmlsdGVyJzogTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0V2hlcmVDbGF1c2VHZW5lcmF0b3IodmFyaWFibGUsIG9wdGlvbnMpLFxuICAgICAgICAgICAgJ3VybCc6IHZhcmlhYmxlLmdldFByZWZhYk5hbWUoKSA/ICgkcm9vdFNjb3BlLnByb2plY3QuZGVwbG95ZWRVcmwgKyAnL3ByZWZhYnMvJyArIHZhcmlhYmxlLmdldFByZWZhYk5hbWUoKSkgOiAkcm9vdFNjb3BlLnByb2plY3QuZGVwbG95ZWRVcmxcbiAgICAgICAgfTtcbiAgICAgICAgZ2V0RGlzdGluY3REYXRhQnlGaWVsZHNTdWNjZXNzID0gKHJlc3BvbnNlOiBhbnksIHJlc29sdmU6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoKHJlc3BvbnNlICYmIHJlc3BvbnNlLmVycm9yKSB8fCAhcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckZuKGVycm9yLCByZXNwb25zZS5lcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZXNwb25zZS5lcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSByZXNwb25zZS5ib2R5O1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2luYXRpb24gPSBPYmplY3QuYXNzaWduKHt9LCByZXNwb25zZS5ib2R5KTtcbiAgICAgICAgICAgICAgICBkZWxldGUgcGFnaW5hdGlvbi5jb250ZW50O1xuXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0ge2RhdGE6IHJlc3VsdC5jb250ZW50LCBwYWdpbmF0aW9ufTtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oc3VjY2VzcywgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGdldERpc3RpbmN0RGF0YUJ5RmllbGRzRXJyb3IgPSAoZXJyb3JNc2c6IGFueSwgcmVqZWN0OiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvciwgZXJyb3JNc2cpO1xuICAgICAgICAgICAgcmVqZWN0KGVycm9yTXNnKTtcbiAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm1ha2VDYWxsKHZhcmlhYmxlLCBkYk9wZXJhdGlvbiwgZGJPcGVyYXRpb25PcHRpb25zKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBnZXREaXN0aW5jdERhdGFCeUZpZWxkc1N1Y2Nlc3MocmVzcG9uc2UsIHJlc29sdmUpO1xuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0RGlzdGluY3REYXRhQnlGaWVsZHNFcnJvcihlcnJvciwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qRnVuY3Rpb24gdG8gZ2V0IHRoZSBhZ2dyZWdhdGVkIGRhdGEgYmFzZWQgb24gdGhlIGZpZWxkcyBjaG9zZW4qL1xuICAgIHB1YmxpYyBnZXRBZ2dyZWdhdGVkRGF0YSh2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZGVwbG95ZWRVUkwgPSBhcHBNYW5hZ2VyLmdldERlcGxveWVkVVJMKCk7XG4gICAgICAgIGlmIChkZXBsb3llZFVSTCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWdncmVnYXRlRGF0YShkZXBsb3llZFVSTCwgdmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkZWZpbmVGaXJzdExhc3RSZWNvcmQodmFyaWFibGUpIHtcbiAgICAgICAgaWYgKHZhcmlhYmxlLm9wZXJhdGlvbiA9PT0gJ3JlYWQnKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodmFyaWFibGUsICdmaXJzdFJlY29yZCcsIHtcbiAgICAgICAgICAgICAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnZ2V0JzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5nZXQodmFyaWFibGUuZGF0YVNldCwgJ2RhdGFbMF0nLCB7fSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodmFyaWFibGUsICdsYXN0UmVjb3JkJywge1xuICAgICAgICAgICAgICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICAgICAgICAgICAgICdnZXQnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBfLmdldCh2YXJpYWJsZS5kYXRhU2V0LCAnZGF0YScsIFtdKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFbZGF0YS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQcmltYXJ5S2V5KHZhcmlhYmxlKSB7XG4gICAgICAgIHJldHVybiBMaXZlVmFyaWFibGVVdGlscy5nZXRQcmltYXJ5S2V5KHZhcmlhYmxlKTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBzZWFyY2ggcXVlcnkgcGFyYW1zLlxuICAgIHB1YmxpYyBwcmVwYXJlUmVxdWVzdFBhcmFtcyhvcHRpb25zKSB7XG4gICAgICAgIGxldCByZXF1ZXN0UGFyYW1zO1xuXG4gICAgICAgIGNvbnN0IHNlYXJjaEtleXMgPSBfLnNwbGl0KG9wdGlvbnMuc2VhcmNoS2V5LCAnLCcpLFxuICAgICAgICAgICAgbWF0Y2hNb2RlcyA9IF8uc3BsaXQob3B0aW9ucy5tYXRjaE1vZGUsICcsJyksXG4gICAgICAgICAgICBmb3JtRmllbGRzID0ge307XG5cbiAgICAgICAgXy5mb3JFYWNoKHNlYXJjaEtleXMsIChjb2xOYW1lLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgZm9ybUZpZWxkc1tjb2xOYW1lXSA9IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9ucy5xdWVyeSxcbiAgICAgICAgICAgICAgICBsb2dpY2FsT3A6ICdBTkQnLFxuICAgICAgICAgICAgICAgIG1hdGNoTW9kZTogbWF0Y2hNb2Rlc1tpbmRleF0gfHwgbWF0Y2hNb2Rlc1swXSB8fCAnc3RhcnRpZ25vcmVjYXNlJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxdWVzdFBhcmFtcyA9IHtcbiAgICAgICAgICAgIGZpbHRlckZpZWxkczogZm9ybUZpZWxkcyxcbiAgICAgICAgICAgIHBhZ2U6IG9wdGlvbnMucGFnZSxcbiAgICAgICAgICAgIHBhZ2VzaXplOiBvcHRpb25zLmxpbWl0IHx8IG9wdGlvbnMucGFnZXNpemUsXG4gICAgICAgICAgICBza2lwRGF0YVNldFVwZGF0ZTogdHJ1ZSwgLy8gZG9udCB1cGRhdGUgdGhlIGFjdHVhbCB2YXJpYWJsZSBkYXRhc2V0LFxuICAgICAgICAgICAgc2tpcFRvZ2dsZVN0YXRlOiB0cnVlLCAvLyBEb250IGNoYW5nZSB0aGUgdmFyaWFibGUgdG9nZ2xlIHN0YXRlIGFzIHRoaXMgaXMgYSBpbmRlcGVuZGVudCBjYWxsXG4gICAgICAgICAgICBpbkZsaWdodEJlaGF2aW9yOiAnZXhlY3V0ZUFsbCcsXG4gICAgICAgICAgICBsb2dpY2FsT3A6ICdPUicsXG4gICAgICAgICAgICBvcmRlckJ5OiBvcHRpb25zLm9yZGVyYnkgPyBfLnJlcGxhY2Uob3B0aW9ucy5vcmRlcmJ5LCAvOi9nLCAnICcpIDogJydcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAob3B0aW9ucy5vbkJlZm9yZXNlcnZpY2VjYWxsKSB7XG4gICAgICAgICAgICBvcHRpb25zLm9uQmVmb3Jlc2VydmljZWNhbGwoZm9ybUZpZWxkcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVxdWVzdFBhcmFtcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBmaWx0ZXJlZCByZWNvcmRzIGJhc2VkIG9uIHNlYXJjaEtleVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBvcHRpb25zIGNvbnRhaW5zIHRoZSBzZWFyY2hLZXkgYW5kIHF1ZXJ5VGV4dFxuICAgICAqIEBwYXJhbSBzdWNjZXNzXG4gICAgICogQHBhcmFtIGVycm9yXG4gICAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICAgKi9cbiAgICBwdWJsaWMgc2VhcmNoUmVjb3Jkcyh2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdFBhcmFtcyA9IHRoaXMucHJlcGFyZVJlcXVlc3RQYXJhbXMob3B0aW9ucyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdFJlY29yZHModmFyaWFibGUsIHJlcXVlc3RQYXJhbXMsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiB1c2VkIGluIG9uQmVmb3JlVXBkYXRlIGNhbGwgLSBjYWxsZWQgbGFzdCBpbiB0aGUgZnVuY3Rpb24gLSB1c2VkIGluIG9sZCBWYXJpYWJsZXMgdXNpbmcgZGF0YUJpbmRpbmcuXG4gICAgICogVGhpcyBmdW5jdGlvbiBtaWdyYXRlcyB0aGUgb2xkIGRhdGEgZGF0YUJpbmRpbmcgdG8gZmlsdGVyRXhwcmVzc2lvbnMgZXF1aXZhbGVudCBmb3JtYXRcbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKiBAcGFyYW0gaW5wdXREYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwdWJsaWMgdXBncmFkZUlucHV0RGF0YVRvRmlsdGVyRXhwcmVzc2lvbnModmFyaWFibGUsIHJlc3BvbnNlLCBpbnB1dERhdGEpIHtcbiAgICAgICAgaWYgKF8uaXNPYmplY3QocmVzcG9uc2UpKSB7XG4gICAgICAgICAgICBpbnB1dERhdGEgPSByZXNwb25zZTtcbiAgICAgICAgICAgIGlucHV0RGF0YS5jb25kaXRpb24gPSAnQU5EJztcbiAgICAgICAgICAgIGlucHV0RGF0YS5ydWxlcyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpZiB0aGUgdXNlciBkZWxldGVzIGEgcGFydGljdWxhciBjcml0ZXJpYSwgd2UgbmVlZCB0byByZW1vdmUgdGhpcyBmb3JtIG91ciBkYXRhIGFzd2VsbC5cbiAgICAgICAgICogc28gd2UgYXJlIGtlZXBpbmcgYSBjb3B5IG9mIGl0IGFuZCB0aGUgZW1wdHlpbmcgdGhlIGV4aXN0aW5nIG9iamVjdCBhbmQgbm93IGZpbGwgaXQgd2l0aCB0aGVcbiAgICAgICAgICogdXNlciBzZXQgY3JpdGVyaWEuIElmIGl0cyBqdXN0IG1vZGlmaWVkLCBjaGFuZ2UgdGhlIGRhdGEgYW5kIHB1c2ggaXQgdG9oZSBydWxlcyBvciBlbHNlIGp1c3QgYWRkIGEgbmV3IGNyaXRlcmlhXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBjbG9uZWRSdWxlcyA9IF8uY2xvbmVEZWVwKGlucHV0RGF0YS5ydWxlcyk7XG4gICAgICAgIGlucHV0RGF0YS5ydWxlcyA9IFtdO1xuICAgICAgICBfLmZvckVhY2goaW5wdXREYXRhLCBmdW5jdGlvbiAodmFsdWVPYmosIGtleSkge1xuICAgICAgICAgICAgaWYgKGtleSAhPT0gJ2NvbmRpdGlvbicgJiYga2V5ICE9PSAncnVsZXMnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyZWRPYmogPSBfLmZpbmQoY2xvbmVkUnVsZXMsIG8gPT4gby50YXJnZXQgPT09IGtleSk7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIGtleSBpcyBmb3VuZCB1cGRhdGUgdGhlIHZhbHVlLCBlbHNlIGNyZWF0ZSBhIG5ldyBydWxlIG9iaiBhbmQgYWRkIGl0IHRvIHRoZSBleGlzdGluZyBydWxlc1xuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJlZE9iaikge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZE9iai52YWx1ZSA9IHZhbHVlT2JqLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZE9iai5tYXRjaE1vZGUgPSB2YWx1ZU9iai5tYXRjaE1vZGUgfHwgdmFsdWVPYmouZmlsdGVyQ29uZGl0aW9uIHx8IGZpbHRlcmVkT2JqLm1hdGNoTW9kZSB8fCAnJztcbiAgICAgICAgICAgICAgICAgICAgaW5wdXREYXRhLnJ1bGVzLnB1c2goZmlsdGVyZWRPYmopO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlucHV0RGF0YS5ydWxlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd0YXJnZXQnOiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAndHlwZSc6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ21hdGNoTW9kZSc6IHZhbHVlT2JqLm1hdGNoTW9kZSB8fCB2YWx1ZU9iai5maWx0ZXJDb25kaXRpb24gfHwgJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAndmFsdWUnOiB2YWx1ZU9iai52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdyZXF1aXJlZCc6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWxldGUgaW5wdXREYXRhW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaW5wdXREYXRhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHVzZWQgaW4gb25CZWZvcmVVcGRhdGUgY2FsbCAtIGNhbGxlZCBmaXJzdCBpbiB0aGUgZnVuY3Rpb24gLSB1c2VkIGluIG9sZCBWYXJpYWJsZXMgdXNpbmcgZGF0YUJpbmRpbmcuXG4gICAgICogVGhpcyBmdW5jdGlvbiBtaWdyYXRlcyB0aGUgZmlsdGVyRXhwcmVzc2lvbnMgb2JqZWN0IHRvIGZsYXQgbWFwIHN0cnVjdHVyZVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBpbnB1dERhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHB1YmxpYyBkb3duZ3JhZGVGaWx0ZXJFeHByZXNzaW9uc1RvSW5wdXREYXRhKHZhcmlhYmxlLCBpbnB1dERhdGEpIHtcbiAgICAgICAgaWYgKGlucHV0RGF0YS5oYXNPd25Qcm9wZXJ0eSgnZ2V0RmlsdGVyRmllbGRzJykpIHtcbiAgICAgICAgICAgIGlucHV0RGF0YSA9IGlucHV0RGF0YS5nZXRGaWx0ZXJGaWVsZHMoKTtcbiAgICAgICAgfVxuICAgICAgICBfLmZvckVhY2goaW5wdXREYXRhLnJ1bGVzLCBmdW5jdGlvbiAocnVsZU9iaikge1xuICAgICAgICAgICAgaWYgKCFfLmlzTmlsKHJ1bGVPYmoudGFyZ2V0KSAmJiBydWxlT2JqLnRhcmdldCAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICBpbnB1dERhdGFbcnVsZU9iai50YXJnZXRdID0ge1xuICAgICAgICAgICAgICAgICAgICAndmFsdWUnOiBydWxlT2JqLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAnbWF0Y2hNb2RlJzogcnVsZU9iai5tYXRjaE1vZGVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGlucHV0RGF0YTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2FuY2VsKHZhcmlhYmxlLCBvcHRpb25zKSB7XG4gICAgICAgIGlmICgkcXVldWUucmVxdWVzdHNRdWV1ZS5oYXModmFyaWFibGUpICYmIHZhcmlhYmxlLl9vYnNlcnZhYmxlKSB7XG4gICAgICAgICAgICB2YXJpYWJsZS5fb2JzZXJ2YWJsZS51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgJHF1ZXVlLnByb2Nlc3ModmFyaWFibGUpO1xuICAgICAgICAgICAgLy8gbm90aWZ5IGluZmxpZ2h0IHZhcmlhYmxlXG4gICAgICAgICAgICB0aGlzLm5vdGlmeUluZmxpZ2h0KHZhcmlhYmxlLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=