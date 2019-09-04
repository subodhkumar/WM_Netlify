import { $invokeWatchers, getClonedObject, getValidJSON, isDefined, isPageable, isValidWebURL, noop, triggerFn, xmlToJson } from '@wm/core';
import { upload } from '../../util/file-upload.util';
import { ServiceVariableUtils } from '../../util/variable/service-variable.utils';
import { $queue } from '../../util/inflight-queue';
import { BaseVariableManager } from './base-variable.manager';
import { CONSTANTS, VARIABLE_CONSTANTS, WS_CONSTANTS } from '../../constants/variables.constants';
import { appManager, formatExportExpression, setInput } from './../../util/variable/variables.utils';
import { getEvaluatedOrderBy, httpService, initiateCallback, metadataService, securityService, simulateFileDownload } from '../../util/variable/variables.utils';
import { getAccessToken, performAuthorization, removeAccessToken } from '../../util/oAuth.utils';
export class ServiceVariableManager extends BaseVariableManager {
    constructor() {
        super(...arguments);
        this.fileUploadResponse = [];
        this.fileUploadCount = 0;
        this.totalFilesCount = 0;
        this.successFileUploadCount = 0;
        this.failedFileUploadCount = 0;
    }
    /**
     * function to process error response from a service
     * @param {ServiceVariable} variable
     * @param {string} errMsg
     * @param {Function} errorCB
     * @param xhrObj
     * @param {boolean} skipNotification
     * @param {boolean} skipDefaultNotification
     */
    processErrorResponse(variable, errMsg, errorCB, xhrObj, skipNotification, skipDefaultNotification) {
        const methodInfo = this.getMethodInfo(variable, {}, {});
        const securityDefnObj = _.get(methodInfo, 'securityDefinitions.0');
        const advancedOptions = this.prepareCallbackOptions(xhrObj);
        // EVENT: ON_ERROR
        if (!skipNotification) {
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, errMsg, advancedOptions, skipDefaultNotification);
        }
        if (_.get(securityDefnObj, 'type') === VARIABLE_CONSTANTS.REST_SERVICE.SECURITY_DEFN.OAUTH2
            && _.includes([VARIABLE_CONSTANTS.HTTP_STATUS_CODE.UNAUTHORIZED, VARIABLE_CONSTANTS.HTTP_STATUS_CODE.FORBIDDEN], _.get(xhrObj, 'status'))) {
            removeAccessToken(securityDefnObj['x-WM-PROVIDER_ID']);
        }
        /* trigger error callback */
        triggerFn(errorCB, errMsg);
        if (!CONSTANTS.isStudioMode) {
            /* process next requests in the queue */
            variable.canUpdate = true;
            $queue.process(variable);
            // EVENT: ON_CAN_UPDATE
            initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, errMsg, advancedOptions);
        }
    }
    /**
     * function to process success response from a service
     * @param response
     * @param variable
     * @param options
     * @param success
     */
    processSuccessResponse(response, variable, options, success) {
        let dataSet;
        let newDataSet;
        let pagination = {};
        let advancedOptions;
        let jsonParsedResponse = getValidJSON(response);
        response = isDefined(jsonParsedResponse) ? jsonParsedResponse : (xmlToJson(response) || response);
        const isResponsePageable = isPageable(response);
        if (isResponsePageable) {
            dataSet = response.content;
            pagination = _.omit(response, 'content');
        }
        else {
            dataSet = response;
        }
        /**
         * send pagination object with advancedOptions all the time.
         * With this, user can provide pagination option, even if it is not there.
         * applicable to 3rd party services that do not support pagination out of the box.
         */
        advancedOptions = this.prepareCallbackOptions(options.xhrObj, { pagination: pagination, rawData: dataSet });
        // EVENT: ON_RESULT
        initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, response, advancedOptions);
        // trigger success callback, pass data received from server as it is.
        triggerFn(success, response, pagination);
        /* if dataTransformation enabled, transform the data */
        if (variable.transformationColumns) {
            this.transformData(response, variable);
        }
        // if a primitive type response is returned, wrap it in an object
        dataSet = (!_.isObject(dataSet)) ? { 'value': dataSet } : dataSet;
        // EVENT: ON_PREPARE_SETDATA
        newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, dataSet, advancedOptions);
        if (isDefined(newDataSet)) {
            // setting newDataSet as the response to service variable onPrepareSetData
            dataSet = newDataSet;
        }
        /* update the dataset against the variable, if response is non-object, insert the response in 'value' field of dataSet */
        if (!options.forceRunMode && !options.skipDataSetUpdate) {
            variable.pagination = pagination;
            variable.dataSet = dataSet;
            // legacy properties in dataSet, [content]
            if (isResponsePageable) {
                Object.defineProperty(variable.dataSet, 'content', {
                    get: () => {
                        return variable.dataSet;
                    }
                });
            }
        }
        $invokeWatchers(true);
        setTimeout(() => {
            // EVENT: ON_SUCCESS
            initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, dataSet, advancedOptions);
            if (!CONSTANTS.isStudioMode) {
                /* process next requests in the queue */
                variable.canUpdate = true;
                $queue.process(variable);
            }
            // EVENT: ON_CAN_UPDATE
            initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, dataSet, advancedOptions);
        });
        return {
            data: variable.dataSet,
            pagination: variable.pagination
        };
    }
    uploadFileInFormData(variable, options, success, error, file, requestParams) {
        const promise = upload(file, requestParams.data, {
            fileParamName: 'files',
            url: requestParams.url
        });
        promise.then((data) => {
            this.fileUploadCount++;
            this.successFileUploadCount++;
            this.fileUploadResponse.push(data[0]);
            if (this.totalFilesCount === this.fileUploadCount) {
                if (this.failedFileUploadCount === 0) {
                    this.processSuccessResponse(this.fileUploadResponse, variable, options, success);
                    this.fileUploadResponse = [];
                    appManager.notifyApp(appManager.getAppLocale().MESSAGE_FILE_UPLOAD_SUCCESS, 'success');
                }
                else {
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, this.fileUploadResponse);
                    this.fileUploadResponse = [];
                    appManager.notifyApp(appManager.getAppLocale().MESSAGE_FILE_UPLOAD_ERROR, 'error');
                }
                this.fileUploadCount = 0;
                this.successFileUploadCount = 0;
                this.totalFilesCount = 0;
            }
            return data;
        }, (e) => {
            this.fileUploadCount++;
            this.failedFileUploadCount++;
            this.fileUploadResponse.push(e);
            if (this.totalFilesCount === this.fileUploadCount) {
                this.processErrorResponse(variable, this.fileUploadResponse, error, options.xhrObj, options.skipNotification);
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, this.fileUploadResponse);
                this.fileUploadResponse = [];
                this.fileUploadCount = 0;
                this.failedFileUploadCount = 0;
                this.totalFilesCount = 0;
            }
            return e;
        }, (data) => {
            if (variable._progressObservable) {
                variable._progressObservable.next({
                    'progress': data,
                    'status': VARIABLE_CONSTANTS.EVENT.PROGRESS,
                    'fileName': file.name
                });
            }
            initiateCallback(VARIABLE_CONSTANTS.EVENT.PROGRESS, variable, data);
            return data;
        });
        return promise;
    }
    /**
     * Checks if the user is logged in or not and returns appropriate error
     * If user is not logged in, Session timeout logic is run, for user to login
     * @param variable
     * @returns {any}
     */
    handleAuthError(variable, success, errorCB, options) {
        const isUserAuthenticated = _.get(securityService.get(), 'authenticated');
        let info;
        if (isUserAuthenticated) {
            info = {
                error: {
                    message: 'You\'re not authorised to access the resource "' + variable.service + '".'
                }
            };
        }
        else {
            info = {
                error: {
                    message: 'You\'re not authenticated to access the resource "' + variable.service + '".',
                    skipDefaultNotification: true
                }
            };
            appManager.pushToSessionFailureRequests(variable.invoke.bind(variable, options, success, errorCB));
            appManager.handle401();
        }
        return info;
    }
    /**
     * Handles error, when variable's metadata is not found. The reason for this can be:
     *  - API is secure and user is not logged in
     *  - API is secure and user is logged in but not authorized
     *  - The servicedefs are not generated properly at the back end (need to edit the variable and re-run the project)
     * @param info
     * @param variable
     * @param errorCB
     * @param options
     */
    handleRequestMetaError(info, variable, success, errorCB, options) {
        const err_type = _.get(info, 'error.type');
        switch (err_type) {
            case VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.NO_ACCESSTOKEN:
                performAuthorization(undefined, info.securityDefnObj[VARIABLE_CONSTANTS.REST_SERVICE.OAUTH_PROVIDER_KEY], this.invoke.bind(this, variable, options, null, errorCB), null);
                this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, true, true);
                break;
            case VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.USER_UNAUTHORISED:
                info = this.handleAuthError(variable, success, errorCB, options);
                this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, options.skipNotification, info.error.skipDefaultNotification);
                break;
            case VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.METADATA_MISSING:
                this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, options.skipNotification, info.error.skipDefaultNotification);
                break;
            default:
                if (info.error.message) {
                    console.warn(info.error.message, variable.name);
                    this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, options.skipNotification, info.error.skipDefaultNotification);
                }
        }
        return info;
    }
    /**
     * function to transform the service data as according to the variable configuration
     * this is used when 'transformationColumns' property is set on the variable
     * @param data: data returned from the service
     * @variable: variable object triggering the service
     */
    transformData(data, variable) {
        data.wmTransformedData = [];
        const columnsArray = variable.transformationColumns, dataArray = _.get(data, variable.dataField) || [], transformedData = data.wmTransformedData;
        _.forEach(dataArray, function (datum, index) {
            transformedData[index] = {};
            _.forEach(columnsArray, function (column, columnIndex) {
                transformedData[index][column] = datum[columnIndex];
            });
        });
    }
    /**
     * gets the service operation info against a service variable
     * this is extracted from the metadataservice
     * @param variable
     * @param inputFields: sample values, if provided, will be set against params in the definition
     * @param options
     * @returns {any}
     */
    getMethodInfo(variable, inputFields, options) {
        const serviceDef = getClonedObject(metadataService.getByOperationId(variable.operationId, variable.getPrefabName()));
        const methodInfo = serviceDef === null ? null : _.get(serviceDef, 'wmServiceOperationInfo');
        if (!methodInfo) {
            return methodInfo;
        }
        const securityDefnObj = _.get(methodInfo.securityDefinitions, '0'), isOAuthTypeService = securityDefnObj && (securityDefnObj.type === VARIABLE_CONSTANTS.REST_SERVICE.SECURITY_DEFN.OAUTH2);
        if (methodInfo.parameters) {
            methodInfo.parameters.forEach(function (param) {
                // Ignore readOnly params in case of formData file params will be duplicated
                if (param.readOnly) {
                    return;
                }
                param.sampleValue = inputFields[param.name];
                /* supporting pagination for query service variable */
                if (VARIABLE_CONSTANTS.PAGINATION_PARAMS.indexOf(param.name) !== -1) {
                    if (param.name === 'size') {
                        param.sampleValue = options.size || param.sampleValue || parseInt(variable.maxResults, 10);
                    }
                    else if (param.name === 'page') {
                        param.sampleValue = options.page || param.sampleValue || 1;
                    }
                    else if (param.name === 'sort') {
                        param.sampleValue = getEvaluatedOrderBy(variable.orderBy, options.orderBy) || param.sampleValue || '';
                    }
                }
                else if (param.name === 'access_token' && isOAuthTypeService) {
                    param.sampleValue = getAccessToken(securityDefnObj[VARIABLE_CONSTANTS.REST_SERVICE.OAUTH_PROVIDER_KEY], null);
                }
            });
        }
        return methodInfo;
    }
    /**
     * Returns true if any of the files are in onProgress state
     */
    isFileUploadInProgress(dataBindings) {
        let filesStatus = false;
        _.forEach(dataBindings, (dataBinding) => {
            if (_.isArray(dataBinding) && dataBinding[0] instanceof File) {
                _.forEach(dataBinding, (file) => {
                    if (file.status === 'onProgress') {
                        filesStatus = true;
                        return;
                    }
                });
            }
        });
        return filesStatus;
    }
    // Makes the call for Uploading file/ files
    uploadFile(variable, options, success, error, inputFields, requestParams) {
        let fileParamCount = 0;
        const fileArr = [], promArr = [];
        _.forEach(inputFields, (inputField) => {
            if (_.isArray(inputField)) {
                if (inputField[0] instanceof File) {
                    fileParamCount++;
                }
                _.forEach(inputField, (input) => {
                    if (input instanceof File || _.find(_.values(input), o => o instanceof Blob)) {
                        fileArr.push(input);
                        this.totalFilesCount++;
                        fileParamCount = fileParamCount || 1;
                    }
                });
            }
            else {
                if (inputField instanceof File) {
                    fileParamCount++;
                    this.totalFilesCount++;
                    fileArr.push(inputField);
                }
            }
        });
        if (fileParamCount === 1) {
            if (inputFields.files.length > 1) {
                _.forEach(fileArr, (file) => {
                    promArr.push(this.uploadFileInFormData(variable, options, success, error, file, requestParams));
                });
                return Promise.all(promArr);
            }
            else {
                return this.uploadFileInFormData(variable, options, success, error, fileArr[0], requestParams);
            }
        }
    }
    /**
     * proxy for the invoke call
     * Request Info is constructed
     * if error found, error is thrown
     * else, call is made
     * @param {ServiceVariable} variable
     * @param options
     * @param {Function} success
     * @param {Function} error
     * @returns {any}
     * @private
     */
    _invoke(variable, options, success, error) {
        let inputFields = getClonedObject(options.inputFields || variable.dataBinding);
        // EVENT: ON_BEFORE_UPDATE
        const output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, inputFields, options);
        let successHandler;
        let errorHandler;
        if (output === false) {
            $queue.process(variable);
            triggerFn(error);
            return;
        }
        if (_.isObject(output)) {
            inputFields = output;
        }
        const operationInfo = this.getMethodInfo(variable, inputFields, options), requestParams = ServiceVariableUtils.constructRequestParams(variable, operationInfo, inputFields);
        // check errors
        if (requestParams.error) {
            const info = this.handleRequestMetaError(requestParams, variable, success, error, options);
            const reason = (_.get(info, 'error.message') || 'An error occurred while triggering the variable: ') + ': ' + variable.name;
            triggerFn(error);
            return Promise.reject(reason);
        }
        // file upload
        if (ServiceVariableUtils.isFileUploadRequest(variable)) {
            const uploadPromise = this.uploadFile(variable, options, success, error, inputFields, requestParams);
            if (uploadPromise) {
                return uploadPromise;
            }
        }
        // file download
        if (operationInfo && _.isArray(operationInfo.produces) && _.includes(operationInfo.produces, WS_CONSTANTS.CONTENT_TYPES.OCTET_STREAM)) {
            return simulateFileDownload(requestParams, variable.dataBinding.file || variable.name, variable.dataBinding.exportType, function () {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, null, null, null);
                $queue.process(variable);
                triggerFn(success);
            }, function () {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, null, null, null);
                triggerFn(error);
            });
        }
        // notify variable progress
        this.notifyInflight(variable, !options.skipToggleState);
        successHandler = (response, resolve) => {
            if (response && response.type) {
                const data = this.processSuccessResponse(response.body, variable, _.extend(options, { 'xhrObj': response }), success);
                // notify variable success
                this.notifyInflight(variable, false, data);
                resolve(response);
            }
        };
        errorHandler = (err, reject) => {
            const errMsg = httpService.getErrMessage(err);
            // notify variable error
            this.notifyInflight(variable, false);
            this.processErrorResponse(variable, errMsg, error, err, options.skipNotification);
            reject({
                error: errMsg,
                details: err
            });
        };
        // make the call and return a promise to the user to support script calls made by users
        return new Promise((resolve, reject) => {
            requestParams.responseType = 'text'; // this is to return text response. JSON & XML-to-JSON parsing is handled in success handler.
            this.httpCall(requestParams, variable).then((response) => {
                successHandler(response, resolve);
            }, err => {
                errorHandler(err, reject);
            });
            // the _observable property on variable is used store the observable using which the network call is made
            // this can be used to cancel the variable calls.
        });
    }
    // *********************************************************** PUBLIC ***********************************************************//
    invoke(variable, options, success, error) {
        options = options || {};
        options.inputFields = options.inputFields || getClonedObject(variable.dataBinding);
        return $queue.submit(variable).then(this._invoke.bind(this, variable, options, success, error), error);
    }
    download(variable, options, successHandler, errorHandler) {
        options = options || {};
        const inputParams = getClonedObject(variable.dataBinding);
        const inputData = options.data || {};
        const methodInfo = this.getMethodInfo(variable, inputParams, options);
        let requestParams;
        methodInfo.relativePath += '/export';
        requestParams = ServiceVariableUtils.constructRequestParams(variable, methodInfo, inputParams);
        requestParams.data = inputData;
        requestParams.data.fields = formatExportExpression(inputData.fields || []);
        // extra options provided, these may be used in future for integrating export feature with ext. services
        requestParams.method = options.httpMethod || 'POST';
        requestParams.url = options.url || requestParams.url;
        // If request params returns error then show an error toaster
        if (_.hasIn(requestParams, 'error.message')) {
            triggerFn(errorHandler, requestParams.error.message);
            return Promise.reject(requestParams.error.message);
        }
        return httpService.send(requestParams).then(response => {
            if (response && isValidWebURL(response.body.result)) {
                window.location.href = response.body.result;
                triggerFn(successHandler, response);
            }
            else {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response);
                triggerFn(errorHandler, response);
            }
        }, (response, xhrObj) => {
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response, xhrObj);
            triggerFn(errorHandler, response);
        });
    }
    getInputParms(variable) {
        const wmServiceOperationInfo = _.get(metadataService.getByOperationId(variable.operationId), 'wmServiceOperationInfo');
        return _.get(wmServiceOperationInfo, 'parameters');
    }
    setInput(variable, key, val, options) {
        return setInput(variable.dataBinding, key, val, options);
    }
    /**
     * Cancels an on going service request
     * @param variable
     * @param $file
     */
    cancel(variable, $file) {
        // CHecks if there is any pending requests in the queue
        if ($queue.requestsQueue.has(variable)) {
            // If the request is a File upload request then modify the elements associated with file upload
            // else unsubscribe from the observable on the variable.
            if (ServiceVariableUtils.isFileUploadRequest(variable)) {
                $file._uploadProgress.unsubscribe();
                $file.status = 'abort';
                this.totalFilesCount--;
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ABORT, variable, $file);
                if (!this.isFileUploadInProgress(variable.dataBinding) && this.totalFilesCount === 0) {
                    $queue.process(variable);
                    // notify inflight variable
                    this.notifyInflight(variable, false);
                }
            }
            else {
                if (variable._observable) {
                    variable._observable.unsubscribe();
                    $queue.process(variable);
                    // notify inflight variable
                    this.notifyInflight(variable, false);
                }
            }
        }
    }
    defineFirstLastRecord(variable) {
        if (variable.isList) {
            Object.defineProperty(variable, 'firstRecord', {
                'configurable': true,
                'get': function () {
                    const dataSet = variable.dataSet;
                    // For procedure(v1) data doesn't come under content
                    return _.head(dataSet && dataSet.content) || _.head(dataSet) || {};
                }
            });
            Object.defineProperty(variable, 'lastRecord', {
                'configurable': true,
                'get': function () {
                    const dataSet = variable.dataSet;
                    // For procedure(v1) data doesn't come under content
                    return _.last(dataSet && dataSet.content) || _.last(dataSet) || {};
                }
            });
        }
    }
    // Gets the input params of the service variable and also add params from the searchKeys (filterfields)
    getQueryParams(filterFields, searchValue, variable) {
        const inputParams = this.getInputParms(variable);
        const queryParams = ServiceVariableUtils.excludePaginationParams(inputParams);
        const inputFields = {};
        // check if some param value is already available in databinding and update the inputFields accordingly
        _.map(variable.dataBinding, function (value, key) {
            inputFields[key] = value;
        });
        // add the query params mentioned in the searchkey to inputFields
        _.forEach(filterFields, function (value) {
            if (_.includes(queryParams, value)) {
                inputFields[value] = searchValue;
            }
        });
        return inputFields;
    }
    /**
     * This method returns filtered records based on searchKey and queryText.
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}
     */
    searchRecords(variable, options, success, error) {
        const inputFields = this.getQueryParams(_.split(options.searchKey, ','), options.query, variable);
        const requestParams = {
            page: options.page,
            pagesize: options.pagesize,
            skipDataSetUpdate: true,
            skipToggleState: true,
            inFlightBehavior: 'executeAll',
            inputFields: inputFields
        };
        if (options.onBeforeservicecall) {
            options.onBeforeservicecall(inputFields);
        }
        return this.invoke(variable, requestParams, success, error).catch(noop);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS12YXJpYWJsZS5tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbIm1hbmFnZXIvdmFyaWFibGUvc2VydmljZS12YXJpYWJsZS5tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU1SSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFckQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDbEYsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlELE9BQU8sRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDbEcsT0FBTyxFQUFFLFVBQVUsRUFBRSxzQkFBc0IsRUFBRSxRQUFRLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUNyRyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUNqSyxPQUFPLEVBQUUsY0FBYyxFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFLakcsTUFBTSxPQUFPLHNCQUF1QixTQUFRLG1CQUFtQjtJQUEvRDs7UUFFSSx1QkFBa0IsR0FBUSxFQUFFLENBQUM7UUFDN0Isb0JBQWUsR0FBRyxDQUFDLENBQUM7UUFDcEIsb0JBQWUsR0FBRyxDQUFDLENBQUM7UUFDcEIsMkJBQXNCLEdBQUcs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SUFDSSxhQUFhLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSztRQUNsRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRWxHLE1BQU0sYUFBYSxHQUFHO1lBQ2xCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtZQUNsQixRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7WUFDMUIsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixlQUFlLEVBQUUsSUFBSTtZQUNyQixnQkFBZ0IsRUFBRSxZQUFZO1lBQzlCLFdBQVcsRUFBRSxXQUFXO1NBQzNCLENBQUM7UUFFRixJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRTtZQUM3QixPQUFPLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDNUM7UUFFRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVFLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ICRpbnZva2VXYXRjaGVycywgZ2V0Q2xvbmVkT2JqZWN0LCBnZXRWYWxpZEpTT04sIGlzRGVmaW5lZCwgaXNQYWdlYWJsZSwgaXNWYWxpZFdlYlVSTCwgbm9vcCwgdHJpZ2dlckZuLCB4bWxUb0pzb24gfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHVwbG9hZCB9IGZyb20gJy4uLy4uL3V0aWwvZmlsZS11cGxvYWQudXRpbCc7XG5pbXBvcnQgeyBTZXJ2aWNlVmFyaWFibGUgfSBmcm9tICcuLi8uLi9tb2RlbC92YXJpYWJsZS9zZXJ2aWNlLXZhcmlhYmxlJztcbmltcG9ydCB7IFNlcnZpY2VWYXJpYWJsZVV0aWxzIH0gZnJvbSAnLi4vLi4vdXRpbC92YXJpYWJsZS9zZXJ2aWNlLXZhcmlhYmxlLnV0aWxzJztcbmltcG9ydCB7ICRxdWV1ZSB9IGZyb20gJy4uLy4uL3V0aWwvaW5mbGlnaHQtcXVldWUnO1xuaW1wb3J0IHsgQmFzZVZhcmlhYmxlTWFuYWdlciB9IGZyb20gJy4vYmFzZS12YXJpYWJsZS5tYW5hZ2VyJztcbmltcG9ydCB7IENPTlNUQU5UUywgVkFSSUFCTEVfQ09OU1RBTlRTLCBXU19DT05TVEFOVFMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMvdmFyaWFibGVzLmNvbnN0YW50cyc7XG5pbXBvcnQgeyBhcHBNYW5hZ2VyLCBmb3JtYXRFeHBvcnRFeHByZXNzaW9uLCBzZXRJbnB1dCB9IGZyb20gJy4vLi4vLi4vdXRpbC92YXJpYWJsZS92YXJpYWJsZXMudXRpbHMnO1xuaW1wb3J0IHsgZ2V0RXZhbHVhdGVkT3JkZXJCeSwgaHR0cFNlcnZpY2UsIGluaXRpYXRlQ2FsbGJhY2ssIG1ldGFkYXRhU2VydmljZSwgc2VjdXJpdHlTZXJ2aWNlLCBzaW11bGF0ZUZpbGVEb3dubG9hZCB9IGZyb20gJy4uLy4uL3V0aWwvdmFyaWFibGUvdmFyaWFibGVzLnV0aWxzJztcbmltcG9ydCB7IGdldEFjY2Vzc1Rva2VuLCBwZXJmb3JtQXV0aG9yaXphdGlvbiwgcmVtb3ZlQWNjZXNzVG9rZW4gfSBmcm9tICcuLi8uLi91dGlsL29BdXRoLnV0aWxzJztcbmltcG9ydCB7IEFkdmFuY2VkT3B0aW9ucyB9IGZyb20gJy4uLy4uL2FkdmFuY2VkLW9wdGlvbnMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmV4cG9ydCBjbGFzcyBTZXJ2aWNlVmFyaWFibGVNYW5hZ2VyIGV4dGVuZHMgQmFzZVZhcmlhYmxlTWFuYWdlciB7XG5cbiAgICBmaWxlVXBsb2FkUmVzcG9uc2U6IGFueSA9IFtdO1xuICAgIGZpbGVVcGxvYWRDb3VudCA9IDA7XG4gICAgdG90YWxGaWxlc0NvdW50ID0gMDtcbiAgICBzdWNjZXNzRmlsZVVwbG9hZENvdW50ID0gMDtcbiAgICBmYWlsZWRGaWxlVXBsb2FkQ291bnQgPSAwO1xuXG4gICAgLyoqXG4gICAgICogZnVuY3Rpb24gdG8gcHJvY2VzcyBlcnJvciByZXNwb25zZSBmcm9tIGEgc2VydmljZVxuICAgICAqIEBwYXJhbSB7U2VydmljZVZhcmlhYmxlfSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBlcnJNc2dcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcnJvckNCXG4gICAgICogQHBhcmFtIHhock9ialxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2tpcE5vdGlmaWNhdGlvblxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2tpcERlZmF1bHROb3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBwcml2YXRlIHByb2Nlc3NFcnJvclJlc3BvbnNlKHZhcmlhYmxlOiBTZXJ2aWNlVmFyaWFibGUsIGVyck1zZzogc3RyaW5nLCBlcnJvckNCOiBGdW5jdGlvbiwgeGhyT2JqPzogYW55LCBza2lwTm90aWZpY2F0aW9uPzogYm9vbGVhbiwgc2tpcERlZmF1bHROb3RpZmljYXRpb24/OiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IG1ldGhvZEluZm8gPSB0aGlzLmdldE1ldGhvZEluZm8odmFyaWFibGUsIHt9LCB7fSk7XG4gICAgICAgIGNvbnN0IHNlY3VyaXR5RGVmbk9iaiA9IF8uZ2V0KG1ldGhvZEluZm8sICdzZWN1cml0eURlZmluaXRpb25zLjAnKTtcbiAgICAgICAgY29uc3QgYWR2YW5jZWRPcHRpb25zOiBBZHZhbmNlZE9wdGlvbnMgPSB0aGlzLnByZXBhcmVDYWxsYmFja09wdGlvbnMoeGhyT2JqKTtcbiAgICAgICAgLy8gRVZFTlQ6IE9OX0VSUk9SXG4gICAgICAgIGlmICghc2tpcE5vdGlmaWNhdGlvbikge1xuICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuRVJST1IsIHZhcmlhYmxlLCBlcnJNc2csIGFkdmFuY2VkT3B0aW9ucywgc2tpcERlZmF1bHROb3RpZmljYXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLmdldChzZWN1cml0eURlZm5PYmosICd0eXBlJykgPT09IFZBUklBQkxFX0NPTlNUQU5UUy5SRVNUX1NFUlZJQ0UuU0VDVVJJVFlfREVGTi5PQVVUSDJcbiAgICAgICAgICAgICYmIF8uaW5jbHVkZXMoW1ZBUklBQkxFX0NPTlNUQU5UUy5IVFRQX1NUQVRVU19DT0RFLlVOQVVUSE9SSVpFRCwgVkFSSUFCTEVfQ09OU1RBTlRTLkhUVFBfU1RBVFVTX0NPREUuRk9SQklEREVOXSwgXy5nZXQoeGhyT2JqLCAnc3RhdHVzJykpKSB7XG4gICAgICAgICAgICByZW1vdmVBY2Nlc3NUb2tlbihzZWN1cml0eURlZm5PYmpbJ3gtV00tUFJPVklERVJfSUQnXSk7XG4gICAgICAgIH1cbiAgICAgICAgLyogdHJpZ2dlciBlcnJvciBjYWxsYmFjayAqL1xuICAgICAgICB0cmlnZ2VyRm4oZXJyb3JDQiwgZXJyTXNnKTtcblxuICAgICAgICBpZiAoIUNPTlNUQU5UUy5pc1N0dWRpb01vZGUpIHtcbiAgICAgICAgICAgIC8qIHByb2Nlc3MgbmV4dCByZXF1ZXN0cyBpbiB0aGUgcXVldWUgKi9cbiAgICAgICAgICAgIHZhcmlhYmxlLmNhblVwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAkcXVldWUucHJvY2Vzcyh2YXJpYWJsZSk7XG5cbiAgICAgICAgICAgIC8vIEVWRU5UOiBPTl9DQU5fVVBEQVRFXG4gICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5DQU5fVVBEQVRFLCB2YXJpYWJsZSwgZXJyTXNnLCBhZHZhbmNlZE9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZnVuY3Rpb24gdG8gcHJvY2VzcyBzdWNjZXNzIHJlc3BvbnNlIGZyb20gYSBzZXJ2aWNlXG4gICAgICogQHBhcmFtIHJlc3BvbnNlXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0gc3VjY2Vzc1xuICAgICAqL1xuICAgIHByaXZhdGUgcHJvY2Vzc1N1Y2Nlc3NSZXNwb25zZShyZXNwb25zZSwgdmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3MpIHtcbiAgICAgICAgbGV0IGRhdGFTZXQ7XG4gICAgICAgIGxldCBuZXdEYXRhU2V0O1xuICAgICAgICBsZXQgcGFnaW5hdGlvbiA9IHt9O1xuICAgICAgICBsZXQgYWR2YW5jZWRPcHRpb25zOiBBZHZhbmNlZE9wdGlvbnM7XG4gICAgICAgIGxldCBqc29uUGFyc2VkUmVzcG9uc2U6IGFueSA9IGdldFZhbGlkSlNPTihyZXNwb25zZSk7XG5cbiAgICAgICAgcmVzcG9uc2UgPSBpc0RlZmluZWQoanNvblBhcnNlZFJlc3BvbnNlKSA/IGpzb25QYXJzZWRSZXNwb25zZSA6ICh4bWxUb0pzb24ocmVzcG9uc2UpIHx8IHJlc3BvbnNlKTtcblxuICAgICAgICBjb25zdCBpc1Jlc3BvbnNlUGFnZWFibGUgPSBpc1BhZ2VhYmxlKHJlc3BvbnNlKTtcbiAgICAgICAgaWYgKGlzUmVzcG9uc2VQYWdlYWJsZSkge1xuICAgICAgICAgICAgZGF0YVNldCA9IHJlc3BvbnNlLmNvbnRlbnQ7XG4gICAgICAgICAgICBwYWdpbmF0aW9uID0gXy5vbWl0KHJlc3BvbnNlLCAnY29udGVudCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGF0YVNldCA9IHJlc3BvbnNlO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBzZW5kIHBhZ2luYXRpb24gb2JqZWN0IHdpdGggYWR2YW5jZWRPcHRpb25zIGFsbCB0aGUgdGltZS5cbiAgICAgICAgICogV2l0aCB0aGlzLCB1c2VyIGNhbiBwcm92aWRlIHBhZ2luYXRpb24gb3B0aW9uLCBldmVuIGlmIGl0IGlzIG5vdCB0aGVyZS5cbiAgICAgICAgICogYXBwbGljYWJsZSB0byAzcmQgcGFydHkgc2VydmljZXMgdGhhdCBkbyBub3Qgc3VwcG9ydCBwYWdpbmF0aW9uIG91dCBvZiB0aGUgYm94LlxuICAgICAgICAgKi9cbiAgICAgICAgYWR2YW5jZWRPcHRpb25zID0gdGhpcy5wcmVwYXJlQ2FsbGJhY2tPcHRpb25zKG9wdGlvbnMueGhyT2JqLCB7cGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcmF3RGF0YTogZGF0YVNldH0pO1xuXG4gICAgICAgIC8vIEVWRU5UOiBPTl9SRVNVTFRcbiAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuUkVTVUxULCB2YXJpYWJsZSwgcmVzcG9uc2UsIGFkdmFuY2VkT3B0aW9ucyk7XG5cbiAgICAgICAgLy8gdHJpZ2dlciBzdWNjZXNzIGNhbGxiYWNrLCBwYXNzIGRhdGEgcmVjZWl2ZWQgZnJvbSBzZXJ2ZXIgYXMgaXQgaXMuXG4gICAgICAgIHRyaWdnZXJGbihzdWNjZXNzLCByZXNwb25zZSwgcGFnaW5hdGlvbik7XG5cbiAgICAgICAgLyogaWYgZGF0YVRyYW5zZm9ybWF0aW9uIGVuYWJsZWQsIHRyYW5zZm9ybSB0aGUgZGF0YSAqL1xuICAgICAgICBpZiAodmFyaWFibGUudHJhbnNmb3JtYXRpb25Db2x1bW5zKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybURhdGEocmVzcG9uc2UsIHZhcmlhYmxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGEgcHJpbWl0aXZlIHR5cGUgcmVzcG9uc2UgaXMgcmV0dXJuZWQsIHdyYXAgaXQgaW4gYW4gb2JqZWN0XG4gICAgICAgIGRhdGFTZXQgPSAoIV8uaXNPYmplY3QoZGF0YVNldCkpID8geyd2YWx1ZSc6IGRhdGFTZXR9IDogZGF0YVNldDtcblxuICAgICAgICAvLyBFVkVOVDogT05fUFJFUEFSRV9TRVREQVRBXG4gICAgICAgIG5ld0RhdGFTZXQgPSBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5QUkVQQVJFX1NFVERBVEEsIHZhcmlhYmxlLCBkYXRhU2V0LCBhZHZhbmNlZE9wdGlvbnMpO1xuICAgICAgICBpZiAoaXNEZWZpbmVkKG5ld0RhdGFTZXQpKSB7XG4gICAgICAgICAgICAvLyBzZXR0aW5nIG5ld0RhdGFTZXQgYXMgdGhlIHJlc3BvbnNlIHRvIHNlcnZpY2UgdmFyaWFibGUgb25QcmVwYXJlU2V0RGF0YVxuICAgICAgICAgICAgZGF0YVNldCA9IG5ld0RhdGFTZXQ7XG4gICAgICAgIH1cblxuICAgICAgICAvKiB1cGRhdGUgdGhlIGRhdGFzZXQgYWdhaW5zdCB0aGUgdmFyaWFibGUsIGlmIHJlc3BvbnNlIGlzIG5vbi1vYmplY3QsIGluc2VydCB0aGUgcmVzcG9uc2UgaW4gJ3ZhbHVlJyBmaWVsZCBvZiBkYXRhU2V0ICovXG4gICAgICAgIGlmICghb3B0aW9ucy5mb3JjZVJ1bk1vZGUgJiYgIW9wdGlvbnMuc2tpcERhdGFTZXRVcGRhdGUpIHtcbiAgICAgICAgICAgIHZhcmlhYmxlLnBhZ2luYXRpb24gPSBwYWdpbmF0aW9uO1xuICAgICAgICAgICAgdmFyaWFibGUuZGF0YVNldCA9IGRhdGFTZXQ7XG5cbiAgICAgICAgICAgIC8vIGxlZ2FjeSBwcm9wZXJ0aWVzIGluIGRhdGFTZXQsIFtjb250ZW50XVxuICAgICAgICAgICAgaWYgKGlzUmVzcG9uc2VQYWdlYWJsZSkge1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh2YXJpYWJsZS5kYXRhU2V0LCAnY29udGVudCcsIHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFyaWFibGUuZGF0YVNldDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgJGludm9rZVdhdGNoZXJzKHRydWUpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIC8vIEVWRU5UOiBPTl9TVUNDRVNTXG4gICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5TVUNDRVNTLCB2YXJpYWJsZSwgZGF0YVNldCwgYWR2YW5jZWRPcHRpb25zKTtcblxuICAgICAgICAgICAgaWYgKCFDT05TVEFOVFMuaXNTdHVkaW9Nb2RlKSB7XG4gICAgICAgICAgICAgICAgLyogcHJvY2VzcyBuZXh0IHJlcXVlc3RzIGluIHRoZSBxdWV1ZSAqL1xuICAgICAgICAgICAgICAgIHZhcmlhYmxlLmNhblVwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgJHF1ZXVlLnByb2Nlc3ModmFyaWFibGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFVkVOVDogT05fQ0FOX1VQREFURVxuICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuQ0FOX1VQREFURSwgdmFyaWFibGUsIGRhdGFTZXQsIGFkdmFuY2VkT3B0aW9ucyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiB2YXJpYWJsZS5kYXRhU2V0LFxuICAgICAgICAgICAgcGFnaW5hdGlvbjogdmFyaWFibGUucGFnaW5hdGlvblxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBsb2FkRmlsZUluRm9ybURhdGEodmFyaWFibGU6IFNlcnZpY2VWYXJpYWJsZSwgb3B0aW9uczogYW55LCBzdWNjZXNzOiBGdW5jdGlvbiwgZXJyb3I6IEZ1bmN0aW9uLCBmaWxlLCByZXF1ZXN0UGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSB1cGxvYWQoZmlsZSwgcmVxdWVzdFBhcmFtcy5kYXRhLCB7XG4gICAgICAgICAgICBmaWxlUGFyYW1OYW1lOiAnZmlsZXMnLFxuICAgICAgICAgICAgdXJsOiByZXF1ZXN0UGFyYW1zLnVybFxuICAgICAgICB9KTtcbiAgICAgICAgKHByb21pc2UgYXMgYW55KS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZpbGVVcGxvYWRDb3VudCsrO1xuICAgICAgICAgICAgdGhpcy5zdWNjZXNzRmlsZVVwbG9hZENvdW50Kys7XG4gICAgICAgICAgICB0aGlzLmZpbGVVcGxvYWRSZXNwb25zZS5wdXNoKGRhdGFbMF0pO1xuICAgICAgICAgICAgaWYgKHRoaXMudG90YWxGaWxlc0NvdW50ID09PSB0aGlzLmZpbGVVcGxvYWRDb3VudCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZhaWxlZEZpbGVVcGxvYWRDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NTdWNjZXNzUmVzcG9uc2UodGhpcy5maWxlVXBsb2FkUmVzcG9uc2UsIHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkUmVzcG9uc2UgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgYXBwTWFuYWdlci5ub3RpZnlBcHAoYXBwTWFuYWdlci5nZXRBcHBMb2NhbGUoKS5NRVNTQUdFX0ZJTEVfVVBMT0FEX1NVQ0NFU1MsICdzdWNjZXNzJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuRVJST1IsIHZhcmlhYmxlLCB0aGlzLmZpbGVVcGxvYWRSZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlsZVVwbG9hZFJlc3BvbnNlID0gW107XG4gICAgICAgICAgICAgICAgICAgIGFwcE1hbmFnZXIubm90aWZ5QXBwKGFwcE1hbmFnZXIuZ2V0QXBwTG9jYWxlKCkuTUVTU0FHRV9GSUxFX1VQTE9BRF9FUlJPUiwgJ2Vycm9yJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZmlsZVVwbG9hZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLnN1Y2Nlc3NGaWxlVXBsb2FkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMudG90YWxGaWxlc0NvdW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkQ291bnQrKztcbiAgICAgICAgICAgIHRoaXMuZmFpbGVkRmlsZVVwbG9hZENvdW50Kys7XG4gICAgICAgICAgICB0aGlzLmZpbGVVcGxvYWRSZXNwb25zZS5wdXNoKGUpO1xuICAgICAgICAgICAgaWYgKHRoaXMudG90YWxGaWxlc0NvdW50ID09PSB0aGlzLmZpbGVVcGxvYWRDb3VudCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0Vycm9yUmVzcG9uc2UodmFyaWFibGUsIHRoaXMuZmlsZVVwbG9hZFJlc3BvbnNlLCBlcnJvciwgb3B0aW9ucy54aHJPYmosIG9wdGlvbnMuc2tpcE5vdGlmaWNhdGlvbik7XG4gICAgICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuRVJST1IsIHZhcmlhYmxlLCB0aGlzLmZpbGVVcGxvYWRSZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkUmVzcG9uc2UgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGVVcGxvYWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5mYWlsZWRGaWxlVXBsb2FkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMudG90YWxGaWxlc0NvdW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9LCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhcmlhYmxlLl9wcm9ncmVzc09ic2VydmFibGUpIHtcbiAgICAgICAgICAgICAgICB2YXJpYWJsZS5fcHJvZ3Jlc3NPYnNlcnZhYmxlLm5leHQoe1xuICAgICAgICAgICAgICAgICAgICAncHJvZ3Jlc3MnOiBkYXRhLFxuICAgICAgICAgICAgICAgICAgICAnc3RhdHVzJzogVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULlBST0dSRVNTLFxuICAgICAgICAgICAgICAgICAgICAnZmlsZU5hbWUnOiBmaWxlLm5hbWV9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULlBST0dSRVNTLCB2YXJpYWJsZSwgZGF0YSk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgdXNlciBpcyBsb2dnZWQgaW4gb3Igbm90IGFuZCByZXR1cm5zIGFwcHJvcHJpYXRlIGVycm9yXG4gICAgICogSWYgdXNlciBpcyBub3QgbG9nZ2VkIGluLCBTZXNzaW9uIHRpbWVvdXQgbG9naWMgaXMgcnVuLCBmb3IgdXNlciB0byBsb2dpblxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHJpdmF0ZSBoYW5kbGVBdXRoRXJyb3IodmFyaWFibGUsIHN1Y2Nlc3MsIGVycm9yQ0IsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgaXNVc2VyQXV0aGVudGljYXRlZCA9IF8uZ2V0KHNlY3VyaXR5U2VydmljZS5nZXQoKSwgJ2F1dGhlbnRpY2F0ZWQnKTtcbiAgICAgICAgbGV0IGluZm87XG5cbiAgICAgICAgaWYgKGlzVXNlckF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgICAgIGluZm8gPSB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1lvdVxcJ3JlIG5vdCBhdXRob3Jpc2VkIHRvIGFjY2VzcyB0aGUgcmVzb3VyY2UgXCInICsgdmFyaWFibGUuc2VydmljZSArICdcIi4nXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluZm8gPSB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1lvdVxcJ3JlIG5vdCBhdXRoZW50aWNhdGVkIHRvIGFjY2VzcyB0aGUgcmVzb3VyY2UgXCInICsgdmFyaWFibGUuc2VydmljZSArICdcIi4nLFxuICAgICAgICAgICAgICAgICAgICBza2lwRGVmYXVsdE5vdGlmaWNhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBhcHBNYW5hZ2VyLnB1c2hUb1Nlc3Npb25GYWlsdXJlUmVxdWVzdHModmFyaWFibGUuaW52b2tlLmJpbmQodmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yQ0IpKTtcbiAgICAgICAgICAgIGFwcE1hbmFnZXIuaGFuZGxlNDAxKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyBlcnJvciwgd2hlbiB2YXJpYWJsZSdzIG1ldGFkYXRhIGlzIG5vdCBmb3VuZC4gVGhlIHJlYXNvbiBmb3IgdGhpcyBjYW4gYmU6XG4gICAgICogIC0gQVBJIGlzIHNlY3VyZSBhbmQgdXNlciBpcyBub3QgbG9nZ2VkIGluXG4gICAgICogIC0gQVBJIGlzIHNlY3VyZSBhbmQgdXNlciBpcyBsb2dnZWQgaW4gYnV0IG5vdCBhdXRob3JpemVkXG4gICAgICogIC0gVGhlIHNlcnZpY2VkZWZzIGFyZSBub3QgZ2VuZXJhdGVkIHByb3Blcmx5IGF0IHRoZSBiYWNrIGVuZCAobmVlZCB0byBlZGl0IHRoZSB2YXJpYWJsZSBhbmQgcmUtcnVuIHRoZSBwcm9qZWN0KVxuICAgICAqIEBwYXJhbSBpbmZvXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIGVycm9yQ0JcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqL1xuICAgIHByaXZhdGUgaGFuZGxlUmVxdWVzdE1ldGFFcnJvcihpbmZvLCB2YXJpYWJsZSwgc3VjY2VzcywgZXJyb3JDQiwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBlcnJfdHlwZSA9IF8uZ2V0KGluZm8sICdlcnJvci50eXBlJyk7XG5cbiAgICAgICAgc3dpdGNoIChlcnJfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSBWQVJJQUJMRV9DT05TVEFOVFMuUkVTVF9TRVJWSUNFLkVSUl9UWVBFLk5PX0FDQ0VTU1RPS0VOOlxuICAgICAgICAgICAgICAgIHBlcmZvcm1BdXRob3JpemF0aW9uKHVuZGVmaW5lZCwgaW5mby5zZWN1cml0eURlZm5PYmpbVkFSSUFCTEVfQ09OU1RBTlRTLlJFU1RfU0VSVklDRS5PQVVUSF9QUk9WSURFUl9LRVldLCB0aGlzLmludm9rZS5iaW5kKHRoaXMsIHZhcmlhYmxlLCBvcHRpb25zLCBudWxsLCBlcnJvckNCKSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzRXJyb3JSZXNwb25zZSh2YXJpYWJsZSwgaW5mby5lcnJvci5tZXNzYWdlLCBlcnJvckNCLCBvcHRpb25zLnhock9iaiwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFZBUklBQkxFX0NPTlNUQU5UUy5SRVNUX1NFUlZJQ0UuRVJSX1RZUEUuVVNFUl9VTkFVVEhPUklTRUQ6XG4gICAgICAgICAgICAgICAgaW5mbyA9IHRoaXMuaGFuZGxlQXV0aEVycm9yKHZhcmlhYmxlLCBzdWNjZXNzLCBlcnJvckNCLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NFcnJvclJlc3BvbnNlKHZhcmlhYmxlLCBpbmZvLmVycm9yLm1lc3NhZ2UsIGVycm9yQ0IsIG9wdGlvbnMueGhyT2JqLCBvcHRpb25zLnNraXBOb3RpZmljYXRpb24sIGluZm8uZXJyb3Iuc2tpcERlZmF1bHROb3RpZmljYXRpb24pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBWQVJJQUJMRV9DT05TVEFOVFMuUkVTVF9TRVJWSUNFLkVSUl9UWVBFLk1FVEFEQVRBX01JU1NJTkc6XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzRXJyb3JSZXNwb25zZSh2YXJpYWJsZSwgaW5mby5lcnJvci5tZXNzYWdlLCBlcnJvckNCLCBvcHRpb25zLnhock9iaiwgb3B0aW9ucy5za2lwTm90aWZpY2F0aW9uLCBpbmZvLmVycm9yLnNraXBEZWZhdWx0Tm90aWZpY2F0aW9uKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgaWYgKGluZm8uZXJyb3IubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oaW5mby5lcnJvci5tZXNzYWdlLCB2YXJpYWJsZS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzRXJyb3JSZXNwb25zZSh2YXJpYWJsZSwgaW5mby5lcnJvci5tZXNzYWdlLCBlcnJvckNCLCBvcHRpb25zLnhock9iaiwgb3B0aW9ucy5za2lwTm90aWZpY2F0aW9uLCBpbmZvLmVycm9yLnNraXBEZWZhdWx0Tm90aWZpY2F0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZnVuY3Rpb24gdG8gdHJhbnNmb3JtIHRoZSBzZXJ2aWNlIGRhdGEgYXMgYWNjb3JkaW5nIHRvIHRoZSB2YXJpYWJsZSBjb25maWd1cmF0aW9uXG4gICAgICogdGhpcyBpcyB1c2VkIHdoZW4gJ3RyYW5zZm9ybWF0aW9uQ29sdW1ucycgcHJvcGVydHkgaXMgc2V0IG9uIHRoZSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBkYXRhOiBkYXRhIHJldHVybmVkIGZyb20gdGhlIHNlcnZpY2VcbiAgICAgKiBAdmFyaWFibGU6IHZhcmlhYmxlIG9iamVjdCB0cmlnZ2VyaW5nIHRoZSBzZXJ2aWNlXG4gICAgICovXG4gICAgcHJpdmF0ZSB0cmFuc2Zvcm1EYXRhKGRhdGEsIHZhcmlhYmxlKSB7XG4gICAgICAgIGRhdGEud21UcmFuc2Zvcm1lZERhdGEgPSBbXTtcblxuICAgICAgICBjb25zdCBjb2x1bW5zQXJyYXkgPSB2YXJpYWJsZS50cmFuc2Zvcm1hdGlvbkNvbHVtbnMsXG4gICAgICAgICAgICBkYXRhQXJyYXkgPSBfLmdldChkYXRhLCB2YXJpYWJsZS5kYXRhRmllbGQpIHx8IFtdLFxuICAgICAgICAgICAgdHJhbnNmb3JtZWREYXRhID0gZGF0YS53bVRyYW5zZm9ybWVkRGF0YTtcblxuICAgICAgICBfLmZvckVhY2goZGF0YUFycmF5LCBmdW5jdGlvbiAoZGF0dW0sIGluZGV4KSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm1lZERhdGFbaW5kZXhdID0ge307XG4gICAgICAgICAgICBfLmZvckVhY2goY29sdW1uc0FycmF5LCBmdW5jdGlvbiAoY29sdW1uLCBjb2x1bW5JbmRleCkge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkRGF0YVtpbmRleF1bY29sdW1uXSA9IGRhdHVtW2NvbHVtbkluZGV4XTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBnZXRzIHRoZSBzZXJ2aWNlIG9wZXJhdGlvbiBpbmZvIGFnYWluc3QgYSBzZXJ2aWNlIHZhcmlhYmxlXG4gICAgICogdGhpcyBpcyBleHRyYWN0ZWQgZnJvbSB0aGUgbWV0YWRhdGFzZXJ2aWNlXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIGlucHV0RmllbGRzOiBzYW1wbGUgdmFsdWVzLCBpZiBwcm92aWRlZCwgd2lsbCBiZSBzZXQgYWdhaW5zdCBwYXJhbXMgaW4gdGhlIGRlZmluaXRpb25cbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRNZXRob2RJbmZvKHZhcmlhYmxlLCBpbnB1dEZpZWxkcywgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBzZXJ2aWNlRGVmID0gZ2V0Q2xvbmVkT2JqZWN0KG1ldGFkYXRhU2VydmljZS5nZXRCeU9wZXJhdGlvbklkKHZhcmlhYmxlLm9wZXJhdGlvbklkLCB2YXJpYWJsZS5nZXRQcmVmYWJOYW1lKCkpKTtcbiAgICAgICAgY29uc3QgbWV0aG9kSW5mbyA9IHNlcnZpY2VEZWYgPT09IG51bGwgPyBudWxsIDogXy5nZXQoc2VydmljZURlZiwgJ3dtU2VydmljZU9wZXJhdGlvbkluZm8nKTtcbiAgICAgICAgaWYgKCFtZXRob2RJbmZvKSB7XG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kSW5mbztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzZWN1cml0eURlZm5PYmogPSBfLmdldChtZXRob2RJbmZvLnNlY3VyaXR5RGVmaW5pdGlvbnMsICcwJyksXG4gICAgICAgICAgICBpc09BdXRoVHlwZVNlcnZpY2UgPSBzZWN1cml0eURlZm5PYmogJiYgKHNlY3VyaXR5RGVmbk9iai50eXBlID09PSBWQVJJQUJMRV9DT05TVEFOVFMuUkVTVF9TRVJWSUNFLlNFQ1VSSVRZX0RFRk4uT0FVVEgyKTtcbiAgICAgICAgaWYgKG1ldGhvZEluZm8ucGFyYW1ldGVycykge1xuICAgICAgICAgICAgbWV0aG9kSW5mby5wYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBhcmFtKSB7XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIHJlYWRPbmx5IHBhcmFtcyBpbiBjYXNlIG9mIGZvcm1EYXRhIGZpbGUgcGFyYW1zIHdpbGwgYmUgZHVwbGljYXRlZFxuICAgICAgICAgICAgICAgIGlmIChwYXJhbS5yZWFkT25seSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBhcmFtLnNhbXBsZVZhbHVlID0gaW5wdXRGaWVsZHNbcGFyYW0ubmFtZV07XG4gICAgICAgICAgICAgICAgLyogc3VwcG9ydGluZyBwYWdpbmF0aW9uIGZvciBxdWVyeSBzZXJ2aWNlIHZhcmlhYmxlICovXG4gICAgICAgICAgICAgICAgaWYgKFZBUklBQkxFX0NPTlNUQU5UUy5QQUdJTkFUSU9OX1BBUkFNUy5pbmRleE9mKHBhcmFtLm5hbWUpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW0ubmFtZSA9PT0gJ3NpemUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbS5zYW1wbGVWYWx1ZSA9IG9wdGlvbnMuc2l6ZSB8fCBwYXJhbS5zYW1wbGVWYWx1ZSB8fCBwYXJzZUludCh2YXJpYWJsZS5tYXhSZXN1bHRzLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyYW0ubmFtZSA9PT0gJ3BhZ2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbS5zYW1wbGVWYWx1ZSA9IG9wdGlvbnMucGFnZSB8fCBwYXJhbS5zYW1wbGVWYWx1ZSB8fCAxO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmFtLm5hbWUgPT09ICdzb3J0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW0uc2FtcGxlVmFsdWUgPSBnZXRFdmFsdWF0ZWRPcmRlckJ5KHZhcmlhYmxlLm9yZGVyQnksIG9wdGlvbnMub3JkZXJCeSkgfHwgcGFyYW0uc2FtcGxlVmFsdWUgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmFtLm5hbWUgPT09ICdhY2Nlc3NfdG9rZW4nICYmIGlzT0F1dGhUeXBlU2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJhbS5zYW1wbGVWYWx1ZSA9IGdldEFjY2Vzc1Rva2VuKHNlY3VyaXR5RGVmbk9ialtWQVJJQUJMRV9DT05TVEFOVFMuUkVTVF9TRVJWSUNFLk9BVVRIX1BST1ZJREVSX0tFWV0sIG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXRob2RJbmZvO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiBhbnkgb2YgdGhlIGZpbGVzIGFyZSBpbiBvblByb2dyZXNzIHN0YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc0ZpbGVVcGxvYWRJblByb2dyZXNzKGRhdGFCaW5kaW5ncykge1xuICAgICAgICBsZXQgZmlsZXNTdGF0dXMgPSBmYWxzZTtcbiAgICAgICAgXy5mb3JFYWNoKGRhdGFCaW5kaW5ncywgKGRhdGFCaW5kaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoXy5pc0FycmF5KGRhdGFCaW5kaW5nKSAmJiBkYXRhQmluZGluZ1swXSBpbnN0YW5jZW9mIEZpbGUpIHtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goZGF0YUJpbmRpbmcsIChmaWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlLnN0YXR1cyA9PT0gJ29uUHJvZ3Jlc3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlc1N0YXR1cyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmaWxlc1N0YXR1cztcbiAgICB9XG5cbiAgICAvLyBNYWtlcyB0aGUgY2FsbCBmb3IgVXBsb2FkaW5nIGZpbGUvIGZpbGVzXG4gICAgcHJpdmF0ZSB1cGxvYWRGaWxlKHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvciwgaW5wdXRGaWVsZHMsIHJlcXVlc3RQYXJhbXMgKSB7XG4gICAgICAgIGxldCBmaWxlUGFyYW1Db3VudCA9IDA7XG4gICAgICAgIGNvbnN0IGZpbGVBcnI6IGFueSA9IFtdLCBwcm9tQXJyOiBhbnkgPSBbXTtcbiAgICAgICAgXy5mb3JFYWNoKGlucHV0RmllbGRzLCAoaW5wdXRGaWVsZCkgPT4ge1xuICAgICAgICAgICAgaWYgKF8uaXNBcnJheShpbnB1dEZpZWxkKSkge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dEZpZWxkWzBdIGluc3RhbmNlb2YgRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGFyYW1Db3VudCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfLmZvckVhY2goaW5wdXRGaWVsZCwgKGlucHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEZpbGUgfHwgXy5maW5kKF8udmFsdWVzKGlucHV0KSwgbyA9PiBvIGluc3RhbmNlb2YgQmxvYikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVBcnIucHVzaChpbnB1dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvdGFsRmlsZXNDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhcmFtQ291bnQgPSBmaWxlUGFyYW1Db3VudCB8fCAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dEZpZWxkIGluc3RhbmNlb2YgRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGFyYW1Db3VudCsrO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvdGFsRmlsZXNDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICBmaWxlQXJyLnB1c2goaW5wdXRGaWVsZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGZpbGVQYXJhbUNvdW50ID09PSAxKSB7XG4gICAgICAgICAgICBpZiAoaW5wdXRGaWVsZHMuZmlsZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChmaWxlQXJyLCAoZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBwcm9tQXJyLnB1c2godGhpcy51cGxvYWRGaWxlSW5Gb3JtRGF0YSh2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IsIGZpbGUsIHJlcXVlc3RQYXJhbXMpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbUFycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnVwbG9hZEZpbGVJbkZvcm1EYXRhKHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvciwgZmlsZUFyclswXSwgcmVxdWVzdFBhcmFtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBwcm94eSBmb3IgdGhlIGludm9rZSBjYWxsXG4gICAgICogUmVxdWVzdCBJbmZvIGlzIGNvbnN0cnVjdGVkXG4gICAgICogaWYgZXJyb3IgZm91bmQsIGVycm9yIGlzIHRocm93blxuICAgICAqIGVsc2UsIGNhbGwgaXMgbWFkZVxuICAgICAqIEBwYXJhbSB7U2VydmljZVZhcmlhYmxlfSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gc3VjY2Vzc1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGVycm9yXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2ludm9rZSAodmFyaWFibGU6IFNlcnZpY2VWYXJpYWJsZSwgb3B0aW9uczogYW55LCBzdWNjZXNzOiBGdW5jdGlvbiwgZXJyb3I6IEZ1bmN0aW9uKSB7XG4gICAgICAgIGxldCBpbnB1dEZpZWxkcyA9IGdldENsb25lZE9iamVjdChvcHRpb25zLmlucHV0RmllbGRzIHx8IHZhcmlhYmxlLmRhdGFCaW5kaW5nKTtcbiAgICAgICAgLy8gRVZFTlQ6IE9OX0JFRk9SRV9VUERBVEVcbiAgICAgICAgY29uc3Qgb3V0cHV0OiBhbnkgPSBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5CRUZPUkVfVVBEQVRFLCB2YXJpYWJsZSwgaW5wdXRGaWVsZHMsIG9wdGlvbnMpO1xuICAgICAgICBsZXQgc3VjY2Vzc0hhbmRsZXI7XG4gICAgICAgIGxldCBlcnJvckhhbmRsZXI7XG5cbiAgICAgICAgaWYgKG91dHB1dCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICRxdWV1ZS5wcm9jZXNzKHZhcmlhYmxlKTtcbiAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8uaXNPYmplY3Qob3V0cHV0KSkge1xuICAgICAgICAgICAgaW5wdXRGaWVsZHMgPSBvdXRwdXQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvcGVyYXRpb25JbmZvID0gdGhpcy5nZXRNZXRob2RJbmZvKHZhcmlhYmxlLCBpbnB1dEZpZWxkcywgb3B0aW9ucyksXG4gICAgICAgICAgICByZXF1ZXN0UGFyYW1zID0gU2VydmljZVZhcmlhYmxlVXRpbHMuY29uc3RydWN0UmVxdWVzdFBhcmFtcyh2YXJpYWJsZSwgb3BlcmF0aW9uSW5mbywgaW5wdXRGaWVsZHMpO1xuXG4gICAgICAgIC8vIGNoZWNrIGVycm9yc1xuICAgICAgICBpZiAocmVxdWVzdFBhcmFtcy5lcnJvcikge1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IHRoaXMuaGFuZGxlUmVxdWVzdE1ldGFFcnJvcihyZXF1ZXN0UGFyYW1zLCB2YXJpYWJsZSwgc3VjY2VzcywgZXJyb3IsIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgcmVhc29uID0gKF8uZ2V0KGluZm8sICdlcnJvci5tZXNzYWdlJykgfHwgJ0FuIGVycm9yIG9jY3VycmVkIHdoaWxlIHRyaWdnZXJpbmcgdGhlIHZhcmlhYmxlOiAnKSArICc6ICcgKyAgdmFyaWFibGUubmFtZTtcbiAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpbGUgdXBsb2FkXG4gICAgICAgIGlmIChTZXJ2aWNlVmFyaWFibGVVdGlscy5pc0ZpbGVVcGxvYWRSZXF1ZXN0KHZhcmlhYmxlKSkge1xuICAgICAgICAgICAgY29uc3QgdXBsb2FkUHJvbWlzZSA9IHRoaXMudXBsb2FkRmlsZSh2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IsIGlucHV0RmllbGRzLCByZXF1ZXN0UGFyYW1zKTtcbiAgICAgICAgICAgIGlmICh1cGxvYWRQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVwbG9hZFByb21pc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmaWxlIGRvd25sb2FkXG4gICAgICAgIGlmIChvcGVyYXRpb25JbmZvICYmIF8uaXNBcnJheShvcGVyYXRpb25JbmZvLnByb2R1Y2VzKSAmJiBfLmluY2x1ZGVzKG9wZXJhdGlvbkluZm8ucHJvZHVjZXMsIFdTX0NPTlNUQU5UUy5DT05URU5UX1RZUEVTLk9DVEVUX1NUUkVBTSkpIHtcbiAgICAgICAgICAgIHJldHVybiBzaW11bGF0ZUZpbGVEb3dubG9hZChyZXF1ZXN0UGFyYW1zLCB2YXJpYWJsZS5kYXRhQmluZGluZy5maWxlIHx8IHZhcmlhYmxlLm5hbWUsIHZhcmlhYmxlLmRhdGFCaW5kaW5nLmV4cG9ydFR5cGUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5TVUNDRVNTLCB2YXJpYWJsZSwgbnVsbCwgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgJHF1ZXVlLnByb2Nlc3ModmFyaWFibGUpO1xuICAgICAgICAgICAgICAgIHRyaWdnZXJGbihzdWNjZXNzKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5FUlJPUiwgdmFyaWFibGUsIG51bGwsIG51bGwsIG51bGwpO1xuICAgICAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG5vdGlmeSB2YXJpYWJsZSBwcm9ncmVzc1xuICAgICAgICB0aGlzLm5vdGlmeUluZmxpZ2h0KHZhcmlhYmxlLCAhb3B0aW9ucy5za2lwVG9nZ2xlU3RhdGUpO1xuXG4gICAgICAgIHN1Y2Nlc3NIYW5kbGVyID0gKHJlc3BvbnNlLCByZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UudHlwZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLnByb2Nlc3NTdWNjZXNzUmVzcG9uc2UocmVzcG9uc2UuYm9keSwgdmFyaWFibGUsIF8uZXh0ZW5kKG9wdGlvbnMsIHsneGhyT2JqJzogcmVzcG9uc2V9KSwgc3VjY2Vzcyk7XG4gICAgICAgICAgICAgICAgLy8gbm90aWZ5IHZhcmlhYmxlIHN1Y2Nlc3NcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeUluZmxpZ2h0KHZhcmlhYmxlLCBmYWxzZSwgZGF0YSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZXJyb3JIYW5kbGVyID0gKGVyciwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlcnJNc2cgPSBodHRwU2VydmljZS5nZXRFcnJNZXNzYWdlKGVycik7XG4gICAgICAgICAgICAvLyBub3RpZnkgdmFyaWFibGUgZXJyb3JcbiAgICAgICAgICAgIHRoaXMubm90aWZ5SW5mbGlnaHQodmFyaWFibGUsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc0Vycm9yUmVzcG9uc2UodmFyaWFibGUsIGVyck1zZywgZXJyb3IsIGVyciwgb3B0aW9ucy5za2lwTm90aWZpY2F0aW9uKTtcbiAgICAgICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgICAgICAgZXJyb3I6IGVyck1zZyxcbiAgICAgICAgICAgICAgICBkZXRhaWxzOiBlcnJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIG1ha2UgdGhlIGNhbGwgYW5kIHJldHVybiBhIHByb21pc2UgdG8gdGhlIHVzZXIgdG8gc3VwcG9ydCBzY3JpcHQgY2FsbHMgbWFkZSBieSB1c2Vyc1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgcmVxdWVzdFBhcmFtcy5yZXNwb25zZVR5cGUgPSAndGV4dCc7IC8vIHRoaXMgaXMgdG8gcmV0dXJuIHRleHQgcmVzcG9uc2UuIEpTT04gJiBYTUwtdG8tSlNPTiBwYXJzaW5nIGlzIGhhbmRsZWQgaW4gc3VjY2VzcyBoYW5kbGVyLlxuICAgICAgICAgICAgdGhpcy5odHRwQ2FsbChyZXF1ZXN0UGFyYW1zLCB2YXJpYWJsZSkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzSGFuZGxlcihyZXNwb25zZSwgcmVzb2x2ZSk7XG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xuICAgICAgICAgICAgICAgIGVycm9ySGFuZGxlcihlcnIsIHJlamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHRoZSBfb2JzZXJ2YWJsZSBwcm9wZXJ0eSBvbiB2YXJpYWJsZSBpcyB1c2VkIHN0b3JlIHRoZSBvYnNlcnZhYmxlIHVzaW5nIHdoaWNoIHRoZSBuZXR3b3JrIGNhbGwgaXMgbWFkZVxuICAgICAgICAgICAgLy8gdGhpcyBjYW4gYmUgdXNlZCB0byBjYW5jZWwgdGhlIHZhcmlhYmxlIGNhbGxzLlxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBQVUJMSUMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovL1xuXG4gICAgcHVibGljIGludm9rZSh2YXJpYWJsZSwgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIG9wdGlvbnMuaW5wdXRGaWVsZHMgPSBvcHRpb25zLmlucHV0RmllbGRzIHx8IGdldENsb25lZE9iamVjdCh2YXJpYWJsZS5kYXRhQmluZGluZyk7XG4gICAgICAgIHJldHVybiAkcXVldWUuc3VibWl0KHZhcmlhYmxlKS50aGVuKHRoaXMuX2ludm9rZS5iaW5kKHRoaXMsIHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvciksIGVycm9yKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZG93bmxvYWQodmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3NIYW5kbGVyLCBlcnJvckhhbmRsZXIpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIGNvbnN0IGlucHV0UGFyYW1zICA9IGdldENsb25lZE9iamVjdCh2YXJpYWJsZS5kYXRhQmluZGluZyk7XG4gICAgICAgIGNvbnN0IGlucHV0RGF0YSA9IG9wdGlvbnMuZGF0YSB8fCB7fTtcbiAgICAgICAgY29uc3QgbWV0aG9kSW5mbyAgID0gdGhpcy5nZXRNZXRob2RJbmZvKHZhcmlhYmxlLCBpbnB1dFBhcmFtcywgb3B0aW9ucyk7XG4gICAgICAgIGxldCByZXF1ZXN0UGFyYW1zO1xuXG4gICAgICAgIG1ldGhvZEluZm8ucmVsYXRpdmVQYXRoICs9ICcvZXhwb3J0JztcbiAgICAgICAgcmVxdWVzdFBhcmFtcyA9IFNlcnZpY2VWYXJpYWJsZVV0aWxzLmNvbnN0cnVjdFJlcXVlc3RQYXJhbXModmFyaWFibGUsIG1ldGhvZEluZm8sIGlucHV0UGFyYW1zKTtcblxuICAgICAgICByZXF1ZXN0UGFyYW1zLmRhdGEgPSBpbnB1dERhdGE7XG4gICAgICAgIHJlcXVlc3RQYXJhbXMuZGF0YS5maWVsZHMgPSBmb3JtYXRFeHBvcnRFeHByZXNzaW9uKGlucHV0RGF0YS5maWVsZHMgfHwgW10pO1xuXG4gICAgICAgIC8vIGV4dHJhIG9wdGlvbnMgcHJvdmlkZWQsIHRoZXNlIG1heSBiZSB1c2VkIGluIGZ1dHVyZSBmb3IgaW50ZWdyYXRpbmcgZXhwb3J0IGZlYXR1cmUgd2l0aCBleHQuIHNlcnZpY2VzXG4gICAgICAgIHJlcXVlc3RQYXJhbXMubWV0aG9kID0gb3B0aW9ucy5odHRwTWV0aG9kIHx8ICdQT1NUJztcbiAgICAgICAgcmVxdWVzdFBhcmFtcy51cmwgPSBvcHRpb25zLnVybCB8fCByZXF1ZXN0UGFyYW1zLnVybDtcblxuICAgICAgICAvLyBJZiByZXF1ZXN0IHBhcmFtcyByZXR1cm5zIGVycm9yIHRoZW4gc2hvdyBhbiBlcnJvciB0b2FzdGVyXG4gICAgICAgIGlmIChfLmhhc0luKHJlcXVlc3RQYXJhbXMsICdlcnJvci5tZXNzYWdlJykpIHtcbiAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvckhhbmRsZXIsIHJlcXVlc3RQYXJhbXMuZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVxdWVzdFBhcmFtcy5lcnJvci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaHR0cFNlcnZpY2Uuc2VuZChyZXF1ZXN0UGFyYW1zKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiBpc1ZhbGlkV2ViVVJMKHJlc3BvbnNlLmJvZHkucmVzdWx0KSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVzcG9uc2UuYm9keS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckZuKHN1Y2Nlc3NIYW5kbGVyLCByZXNwb25zZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkVSUk9SLCB2YXJpYWJsZSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvckhhbmRsZXIsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgKHJlc3BvbnNlLCB4aHJPYmopID0+IHtcbiAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkVSUk9SLCB2YXJpYWJsZSwgcmVzcG9uc2UsIHhock9iaik7XG4gICAgICAgICAgICB0cmlnZ2VyRm4oZXJyb3JIYW5kbGVyLCByZXNwb25zZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRJbnB1dFBhcm1zKHZhcmlhYmxlKSB7XG4gICAgICAgIGNvbnN0IHdtU2VydmljZU9wZXJhdGlvbkluZm8gPSBfLmdldChtZXRhZGF0YVNlcnZpY2UuZ2V0QnlPcGVyYXRpb25JZCh2YXJpYWJsZS5vcGVyYXRpb25JZCksICd3bVNlcnZpY2VPcGVyYXRpb25JbmZvJyk7XG4gICAgICAgIHJldHVybiBfLmdldCh3bVNlcnZpY2VPcGVyYXRpb25JbmZvLCAncGFyYW1ldGVycycpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRJbnB1dCh2YXJpYWJsZSwga2V5LCB2YWwsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHNldElucHV0KHZhcmlhYmxlLmRhdGFCaW5kaW5nLCBrZXksIHZhbCwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FuY2VscyBhbiBvbiBnb2luZyBzZXJ2aWNlIHJlcXVlc3RcbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKiBAcGFyYW0gJGZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgY2FuY2VsKHZhcmlhYmxlLCAkZmlsZT8pIHtcbiAgICAgICAgLy8gQ0hlY2tzIGlmIHRoZXJlIGlzIGFueSBwZW5kaW5nIHJlcXVlc3RzIGluIHRoZSBxdWV1ZVxuICAgICAgICBpZiAoJHF1ZXVlLnJlcXVlc3RzUXVldWUuaGFzKHZhcmlhYmxlKSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIHJlcXVlc3QgaXMgYSBGaWxlIHVwbG9hZCByZXF1ZXN0IHRoZW4gbW9kaWZ5IHRoZSBlbGVtZW50cyBhc3NvY2lhdGVkIHdpdGggZmlsZSB1cGxvYWRcbiAgICAgICAgICAgIC8vIGVsc2UgdW5zdWJzY3JpYmUgZnJvbSB0aGUgb2JzZXJ2YWJsZSBvbiB0aGUgdmFyaWFibGUuXG4gICAgICAgICAgICBpZiAoU2VydmljZVZhcmlhYmxlVXRpbHMuaXNGaWxlVXBsb2FkUmVxdWVzdCh2YXJpYWJsZSkpIHtcbiAgICAgICAgICAgICAgICAkZmlsZS5fdXBsb2FkUHJvZ3Jlc3MudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICAkZmlsZS5zdGF0dXMgPSAnYWJvcnQnO1xuICAgICAgICAgICAgICAgIHRoaXMudG90YWxGaWxlc0NvdW50LS07XG4gICAgICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuQUJPUlQsIHZhcmlhYmxlLCAkZmlsZSk7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzRmlsZVVwbG9hZEluUHJvZ3Jlc3ModmFyaWFibGUuZGF0YUJpbmRpbmcpICYmIHRoaXMudG90YWxGaWxlc0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICRxdWV1ZS5wcm9jZXNzKHZhcmlhYmxlKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aWZ5IGluZmxpZ2h0IHZhcmlhYmxlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5SW5mbGlnaHQodmFyaWFibGUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh2YXJpYWJsZS5fb2JzZXJ2YWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZS5fb2JzZXJ2YWJsZS51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgICAgICAkcXVldWUucHJvY2Vzcyh2YXJpYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGlmeSBpbmZsaWdodCB2YXJpYWJsZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeUluZmxpZ2h0KHZhcmlhYmxlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRlZmluZUZpcnN0TGFzdFJlY29yZCh2YXJpYWJsZSkge1xuICAgICAgICBpZiAodmFyaWFibGUuaXNMaXN0KSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodmFyaWFibGUsICdmaXJzdFJlY29yZCcsIHtcbiAgICAgICAgICAgICAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnZ2V0JzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhU2V0ID0gdmFyaWFibGUuZGF0YVNldDtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yIHByb2NlZHVyZSh2MSkgZGF0YSBkb2Vzbid0IGNvbWUgdW5kZXIgY29udGVudFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5oZWFkKGRhdGFTZXQgJiYgZGF0YVNldC5jb250ZW50KSB8fCBfLmhlYWQoZGF0YVNldCkgfHwge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodmFyaWFibGUsICdsYXN0UmVjb3JkJywge1xuICAgICAgICAgICAgICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICAgICAgICAgICAgICdnZXQnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGFTZXQgPSB2YXJpYWJsZS5kYXRhU2V0O1xuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgcHJvY2VkdXJlKHYxKSBkYXRhIGRvZXNuJ3QgY29tZSB1bmRlciBjb250ZW50XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLmxhc3QoZGF0YVNldCAmJiBkYXRhU2V0LmNvbnRlbnQpIHx8IF8ubGFzdChkYXRhU2V0KSB8fCB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEdldHMgdGhlIGlucHV0IHBhcmFtcyBvZiB0aGUgc2VydmljZSB2YXJpYWJsZSBhbmQgYWxzbyBhZGQgcGFyYW1zIGZyb20gdGhlIHNlYXJjaEtleXMgKGZpbHRlcmZpZWxkcylcbiAgICBwcml2YXRlIGdldFF1ZXJ5UGFyYW1zKGZpbHRlckZpZWxkcywgc2VhcmNoVmFsdWUsIHZhcmlhYmxlKSB7XG4gICAgICAgIGNvbnN0IGlucHV0UGFyYW1zID0gdGhpcy5nZXRJbnB1dFBhcm1zKHZhcmlhYmxlKTtcbiAgICAgICAgY29uc3QgcXVlcnlQYXJhbXMgPSBTZXJ2aWNlVmFyaWFibGVVdGlscy5leGNsdWRlUGFnaW5hdGlvblBhcmFtcyhpbnB1dFBhcmFtcyk7XG4gICAgICAgIGNvbnN0IGlucHV0RmllbGRzID0ge307XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgc29tZSBwYXJhbSB2YWx1ZSBpcyBhbHJlYWR5IGF2YWlsYWJsZSBpbiBkYXRhYmluZGluZyBhbmQgdXBkYXRlIHRoZSBpbnB1dEZpZWxkcyBhY2NvcmRpbmdseVxuICAgICAgICBfLm1hcCh2YXJpYWJsZS5kYXRhQmluZGluZywgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIGlucHV0RmllbGRzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gYWRkIHRoZSBxdWVyeSBwYXJhbXMgbWVudGlvbmVkIGluIHRoZSBzZWFyY2hrZXkgdG8gaW5wdXRGaWVsZHNcbiAgICAgICAgXy5mb3JFYWNoKGZpbHRlckZpZWxkcywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoXy5pbmNsdWRlcyhxdWVyeVBhcmFtcywgdmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZHNbdmFsdWVdID0gc2VhcmNoVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBpbnB1dEZpZWxkcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCByZXR1cm5zIGZpbHRlcmVkIHJlY29yZHMgYmFzZWQgb24gc2VhcmNoS2V5IGFuZCBxdWVyeVRleHQuXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0gc3VjY2Vzc1xuICAgICAqIEBwYXJhbSBlcnJvclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gICAgICovXG4gICAgcHVibGljIHNlYXJjaFJlY29yZHModmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGlucHV0RmllbGRzID0gdGhpcy5nZXRRdWVyeVBhcmFtcyhfLnNwbGl0KG9wdGlvbnMuc2VhcmNoS2V5LCAnLCcpLCBvcHRpb25zLnF1ZXJ5LCB2YXJpYWJsZSk7XG5cbiAgICAgICAgY29uc3QgcmVxdWVzdFBhcmFtcyA9IHtcbiAgICAgICAgICAgIHBhZ2U6IG9wdGlvbnMucGFnZSxcbiAgICAgICAgICAgIHBhZ2VzaXplOiBvcHRpb25zLnBhZ2VzaXplLFxuICAgICAgICAgICAgc2tpcERhdGFTZXRVcGRhdGU6IHRydWUsIC8vIGRvbnQgdXBkYXRlIHRoZSBhY3R1YWwgdmFyaWFibGUgZGF0YXNldCxcbiAgICAgICAgICAgIHNraXBUb2dnbGVTdGF0ZTogdHJ1ZSwgLy8gRG9udCBjaGFuZ2UgdGhlIHZhcmliYWxlIHRvZ2dsZSBzdGF0ZSBhcyB0aGlzIGlzIGEgaW5kZXBlbmRlbnQgY2FsbFxuICAgICAgICAgICAgaW5GbGlnaHRCZWhhdmlvcjogJ2V4ZWN1dGVBbGwnLFxuICAgICAgICAgICAgaW5wdXRGaWVsZHM6IGlucHV0RmllbGRzXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKG9wdGlvbnMub25CZWZvcmVzZXJ2aWNlY2FsbCkge1xuICAgICAgICAgICAgb3B0aW9ucy5vbkJlZm9yZXNlcnZpY2VjYWxsKGlucHV0RmllbGRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmludm9rZSh2YXJpYWJsZSwgcmVxdWVzdFBhcmFtcywgc3VjY2VzcywgZXJyb3IpLmNhdGNoKG5vb3ApO1xuICAgIH1cbn1cbiJdfQ==