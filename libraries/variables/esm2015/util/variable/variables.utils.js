import { extractType, DataType, DEFAULT_FORMATS, $parseEvent, $watch, findValueOf, getBlob, getClonedObject, stringStartsWith, triggerFn } from '@wm/core';
import { CONSTANTS, VARIABLE_CONSTANTS, WS_CONSTANTS } from '../../constants/variables.constants';
const exportTypesMap = { 'EXCEL': '.xlsx', 'CSV': '.csv' };
export let appManager;
export let httpService;
export let metadataService;
export let navigationService;
export let routerService;
export let toasterService;
export let oauthService;
export let securityService;
export let dialogService;
const DOT_EXPR_REX = /^\[("|')[\w\W]*(\1)\]$/, internalBoundNodeMap = new Map(), timers = new Map();
const _invoke = (variable, op) => {
    let debouncedFn, cancelFn = _.noop, retVal;
    if (timers.has(variable)) {
        cancelFn = timers.get(variable).cancel;
    }
    cancelFn();
    debouncedFn = _.debounce(function () {
        retVal = variable[op]();
        // handle promises to avoid uncaught promise errors in console
        if (retVal instanceof Promise) {
            retVal.catch(_.noop);
        }
    }, 100);
    timers.set(variable, debouncedFn);
    debouncedFn();
};
const ɵ0 = _invoke;
const processVariablePostBindUpdate = (nodeName, nodeVal, nodeType, variable, noUpdate) => {
    switch (variable.category) {
        case VARIABLE_CONSTANTS.CATEGORY.LIVE:
            if (variable.operation === 'read') {
                if (nodeName === 'dataBinding') {
                    _.forEach(nodeVal, function (val, key) {
                        variable.filterFields[key] = {
                            'value': val
                        };
                    });
                }
                else {
                    variable.filterFields[nodeName] = {
                        'value': nodeVal,
                        'type': nodeType
                    };
                }
                /* if auto-update set for the variable with read operation only, get its data */
                if (variable.autoUpdate && !_.isUndefined(nodeVal) && _.isFunction(variable.listRecords) && !noUpdate) {
                    _invoke(variable, 'listRecords');
                }
            }
            else {
                if (nodeName === 'dataBinding') {
                    variable.inputFields = nodeVal;
                }
                else {
                    variable.inputFields[nodeName] = nodeVal;
                }
                /* if auto-update set for the variable with read operation only, get its data */
                if (variable.autoUpdate && !_.isUndefined(nodeVal) && _.isFunction(variable[variable.operation + 'Record']) && !noUpdate) {
                    _invoke(variable, variable.operation + 'Record');
                }
            }
            break;
        case VARIABLE_CONSTANTS.CATEGORY.SERVICE:
        case VARIABLE_CONSTANTS.CATEGORY.LOGIN:
            if (variable.autoUpdate && !_.isUndefined(nodeVal) && _.isFunction(variable.invoke) && !noUpdate) {
                _invoke(variable, 'invoke');
            }
            break;
        case VARIABLE_CONSTANTS.CATEGORY.DEVICE:
            variable[nodeName] = nodeVal;
            if (variable.autoUpdate && !_.isUndefined(nodeVal) && _.isFunction(variable.invoke) && !noUpdate) {
                _invoke(variable, 'invoke');
            }
            break;
    }
};
const ɵ1 = processVariablePostBindUpdate;
export const setDependency = (type, ref) => {
    switch (type) {
        case 'appManager':
            appManager = ref;
            break;
        case 'http':
            httpService = ref;
            break;
        case 'metadata':
            metadataService = ref;
            break;
        case 'navigationService':
            navigationService = ref;
            break;
        case 'router':
            routerService = ref;
            break;
        case 'toaster':
            toasterService = ref;
            break;
        case 'oAuth':
            oauthService = ref;
            break;
        case 'security':
            securityService = ref;
            break;
        case 'dialog':
            dialogService = ref;
            break;
    }
};
export const initiateCallback = (type, variable, data, options, skipDefaultNotification) => {
    /*checking if event is available and variable has event property and variable event property bound to function*/
    const eventValues = variable[type], callBackScope = variable._context;
    let errorVariable;
    /**
     * For error event:
     * trigger app level error handler.
     * if no event is assigned, trigger default appNotification variable.
     */
    if (type === VARIABLE_CONSTANTS.EVENT.ERROR && !skipDefaultNotification) {
        if (!eventValues) {
            /* in case of error, if no event assigned, handle through default notification variable */
            errorVariable = callBackScope.Actions[VARIABLE_CONSTANTS.DEFAULT_VAR.NOTIFICATION];
            if (errorVariable) {
                data = errorVariable.getMessage() || data;
                data = _.isString(data) ? data : 'An error has occured. Please check the app logs.';
                errorVariable.invoke({ 'message': data }, undefined, undefined);
                // $rootScope.$evalAsync(function () {
                // $rootScope.$emit("invoke-service", VARIABLE_CONSTANTS.DEFAULT_VAR.NOTIFICATION, {scope: callBackScope, message: response});
                // });
            }
        }
    }
    // TODO: [Vibhu], check whether to support legacy event calling mechanism (ideally, it should have been migrated)
    const fn = $parseEvent(variable[type]);
    if (type === VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE) {
        if (variable.category === 'wm.LiveVariable' && variable.operation === 'read') {
            return fn(variable._context, { variable: variable, dataFilter: data });
        }
        else {
            return fn(variable._context, { variable: variable, inputData: data });
        }
    }
    else {
        return fn(variable._context, { variable: variable, data: data, options: options });
    }
};
const triggerOnTimeout = (success) => {
    setTimeout(() => { triggerFn(success); }, 500);
};
const ɵ2 = triggerOnTimeout;
const downloadFilefromResponse = (response, headers, success, error) => {
    // check for a filename
    let filename = '', filenameRegex, matches, type, blob, URL, downloadUrl, popup;
    const disposition = headers.get('Content-Disposition');
    if (disposition && disposition.indexOf('attachment') !== -1) {
        filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        matches = filenameRegex.exec(disposition);
        if (matches !== null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
        }
    }
    type = headers.get('Content-Type');
    blob = new Blob([response], { type: type });
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
        if (window.navigator.msSaveBlob(blob, filename)) {
            triggerOnTimeout(success);
        }
        else {
            triggerFn(error);
        }
    }
    else {
        URL = window.URL || window.webkitURL;
        downloadUrl = URL.createObjectURL(blob);
        if (filename) {
            // use HTML5 a[download] attribute to specify filename
            const a = document.createElement('a');
            let reader;
            // safari doesn't support this yet
            if (typeof a.download === 'undefined') {
                reader = new FileReader();
                reader.onloadend = function () {
                    const url = reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                    popup = window.open(url, '_blank');
                    if (!popup) {
                        window.location.href = url;
                    }
                };
                reader.onload = triggerOnTimeout.bind(undefined, success);
                reader.onerror = error;
                reader.readAsDataURL(blob);
            }
            else {
                a.href = downloadUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                triggerOnTimeout(success);
            }
        }
        else {
            popup = window.open(downloadUrl, '_blank');
            if (!popup) {
                window.location.href = downloadUrl;
            }
        }
        setTimeout(() => { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
    }
};
const ɵ3 = downloadFilefromResponse;
const getService = (serviceName) => {
    if (!serviceName) {
        return;
    }
    return serviceName;
    // Todo: Shubham, uncomment below code
    /* /!* get a reference to the element where ng-app is defined *!/
     let appEl = WM.element('[id=ng-app]'), injector;
     if (appEl) {
     try {
     injector = appEl.injector(); // get the angular injector
     if (injector) {
     return injector.get(serviceName); // return the service
     }
     } catch (e) {
     return undefined;
     }
     }*/
};
const ɵ4 = getService;
/**
 * Construct the form data params from the URL
 * @param queryParams
 * @param params
 */
const setParamsFromURL = (queryParams, params) => {
    queryParams = _.split(queryParams, '&');
    _.forEach(queryParams, function (param) {
        param = _.split(param, '=');
        params[param[0]] = decodeURIComponent(_.join(_.slice(param, 1), '='));
    });
};
const ɵ5 = setParamsFromURL;
/**
 * [Todo: Shubham], Implement Download through I frame
 * Simulates file download in an app through creating and submitting a hidden form in DOM.
 * The action will be initiated through a Service Variable
 *
 * Query Params
 * The request params like query params are added as hidden input elements
 *
 * Header Params
 * The header params for a request are also added along with hidden input elements.
 * This is done as headers can not be set for a form POST call from JavaScript
 *
 * Finally, request parameters are sent as follows:
 * For a GET request, the request data is sent along with the query params.
 * For POST, it is sent as request body.
 *
 * @param variable: the variable that is called from user action
 * @param requestParams object consisting the info to construct the XHR request for the service
 */
const downloadThroughIframe = (requestParams, success) => {
    // Todo: SHubham: URL contains '//' in between which should be handled at the URL formation only
    if (requestParams.url[1] === '/' && requestParams.url[2] === '/') {
        requestParams.url = requestParams.url.slice(0, 1) + requestParams.url.slice(2);
    }
    let iFrameElement, formEl, paramElement, queryParams = '';
    const IFRAME_NAME = 'fileDownloadIFrame', FORM_NAME = 'fileDownloadForm', CONTENT_TYPE = 'Content-Type', url = requestParams.url, encType = _.get(requestParams.headers, CONTENT_TYPE), params = _.pickBy(requestParams.headers, function (val, key) { return key !== CONTENT_TYPE; });
    /* Todo: shubham : define getService method
     WS_CONSTANTS    = getService('WS_CONSTANTS');*/
    /* look for existing iframe. If exists, remove it first */
    iFrameElement = $('#' + IFRAME_NAME);
    if (iFrameElement.length) {
        iFrameElement.first().remove();
    }
    iFrameElement = $('<iframe id="' + IFRAME_NAME + '" name="' + IFRAME_NAME + '" class="ng-hide"></iframe>');
    formEl = $('<form id="' + FORM_NAME + '" name="' + FORM_NAME + '"></form>');
    formEl.attr({
        'target': iFrameElement.attr('name'),
        'action': url,
        'method': requestParams.method,
        'enctype': encType
    });
    /* process query params, append a hidden input element in the form against each param */
    queryParams += url.indexOf('?') !== -1 ? url.substring(url.indexOf('?') + 1) : '';
    queryParams += encType === WS_CONSTANTS.CONTENT_TYPES.FORM_URL_ENCODED ? ((queryParams ? '&' : '') + requestParams.dataParams) : '';
    // For Non body methods only, set the input fields from query parameters
    if (_.includes(WS_CONSTANTS.NON_BODY_HTTP_METHODS, _.toUpper(requestParams.method))) {
        setParamsFromURL(queryParams, params); // Set params for URL query params
    }
    setParamsFromURL(requestParams.data, params); // Set params for request data
    _.forEach(params, function (val, key) {
        paramElement = $('<input type="hidden">');
        paramElement.attr({
            'name': key,
            'value': val
        });
        formEl.append(paramElement);
    });
    /* append form to iFrame and iFrame to the document and submit the form */
    $('body').append(iFrameElement);
    // timeout for IE 10, iframeElement.contents() is empty in IE 10 without timeout
    setTimeout(function () {
        iFrameElement.contents().find('body').append(formEl);
        formEl.submit();
        triggerFn(success);
    }, 100);
};
const ɵ6 = downloadThroughIframe;
/**
 * Makes an XHR call against the config
 * the response is converted into a blob url, which is assigned to the src attribute of an anchor element with download=true
 * a click is simulated on the anchor to download the file
 * @param config
 * @param success
 * @param error
 */
const downloadThroughAnchor = (config, success, error) => {
    const url = config.url, method = config.method, data = config.dataParams || config.data, headers = config.headers;
    headers['Content-Type'] = headers['Content-Type'] || 'application/x-www-form-urlencoded';
    // Todo: Replace http with getService
    httpService.send({
        'target': 'WebService',
        'action': 'invokeRuntimeRestCall',
        'method': method,
        'url': url,
        'headers': headers,
        'data': data,
        'responseType': 'arraybuffer'
    }).then(function (response) {
        setTimeout(() => {
            downloadFilefromResponse(response.body, response.headers, success, error);
        }, 900);
    }, function (err) {
        triggerFn(error, err);
    });
};
const ɵ7 = downloadThroughAnchor;
/**
 * appends a timestamp on the passed filename to prevent caching
 * returns the modified file name
 * @param fileName
 * @param exportFormat
 * @returns {string}
 */
const getModifiedFileName = (fileName, exportFormat) => {
    let fileExtension;
    const currentTimestamp = Date.now();
    if (exportFormat) {
        fileExtension = exportTypesMap[exportFormat];
    }
    else {
        fileExtension = '.' + _.last(_.split(fileName, '.'));
        fileName = _.replace(fileName, fileExtension, '');
    }
    return fileName + '_' + currentTimestamp + fileExtension;
};
const ɵ8 = getModifiedFileName;
const getCookieByName = (name) => {
    // Todo: Shubham Implement cookie native js
    return 'cookie';
};
const ɵ9 = getCookieByName;
/**
 * This function returns the cookieValue if xsrf is enabled.
 * In device, xsrf cookie is stored in localStorage.
 * @returns xsrf cookie value
 */
const isXsrfEnabled = () => {
    if (CONSTANTS.hasCordova) {
        return localStorage.getItem(CONSTANTS.XSRF_COOKIE_NAME);
    }
    return false;
};
const ɵ10 = isXsrfEnabled;
/**
 * Returns the object node for a bind object, where the value has to be updated
 * obj.target = "a"
 * @param obj
 * @param root
 * @param variable
 * @returns {*}
 */
const getTargetObj = (obj, root, variable) => {
    /*
     * if the target key is in the form as "['my.param']"
     * keep the target key as "my.param" and do not split further
     * this is done, so that, the computed value against this binding is assigned as
     *      {"my.param": "value"}
     * and not as
     *      {
     *          "my": {
     *              "param": "value"
     *          }
     *      }
     */
    let target = obj.target, targetObj;
    const rootNode = variable[root];
    if (DOT_EXPR_REX.test(target)) {
        targetObj = rootNode;
    }
    else {
        target = target.substr(0, target.lastIndexOf('.'));
        if (obj.target === root) {
            targetObj = variable;
        }
        else if (target) {
            targetObj = findValueOf(rootNode, target, true);
        }
        else {
            targetObj = rootNode;
        }
    }
    return targetObj;
};
const ɵ11 = getTargetObj;
/**
 * Gets the key for the target object
 * the computed value will be updated against this key in the targetObject(computed by getTargetObj())
 * @param target
 * @param regex
 * @returns {*}
 */
const getTargetNodeKey = (target) => {
    /*
     * if the target key is in the form as "['my.param']"
     * keep the target key as "my.param" and do not split further
     * this is done, so that, the computed value against this binding is assigned as
     *      {"my.param": "value"}
     * and not as
     *      {
     *          "my": {
     *              "param": "value"
     *          }
     *      }
     */
    let targetNodeKey;
    if (DOT_EXPR_REX.test(target)) {
        targetNodeKey = target.replace(/^(\[["'])|(["']\])$/g, '');
    }
    else {
        targetNodeKey = target.split('.').pop();
    }
    return targetNodeKey;
};
const ɵ12 = getTargetNodeKey;
const setValueToNode = (target, obj, root, variable, value, noUpdate) => {
    const targetNodeKey = getTargetNodeKey(target), targetObj = getTargetObj(obj, root, variable);
    value = !_.isUndefined(value) ? value : obj.value;
    /* sanity check, user can bind parent nodes to non-object values, so child node bindings may fail */
    if (targetObj) {
        targetObj[targetNodeKey] = value;
    }
    processVariablePostBindUpdate(targetNodeKey, value, obj.type, variable, noUpdate);
};
const ɵ13 = setValueToNode;
/**
 * The model internalBoundNodeMap stores the reference to latest computed values against internal(nested) bound nodes
 * This is done so that the internal node's computed value is not lost, once its parent node's value is computed at a later point
 * E.g.
 * Variable.employeeVar has following bindings
 * "dataBinding": [
     {
         "target": "department.budget",
         "value": "bind:Variables.budgetVar.dataSet"
     },
     {
         "target": "department",
         "value": "bind:Variables.departmentVar.dataSet"
     }
 ]
 * When department.budget is computed, employeeVar.dataSet = {
 *  "department": {
 *      "budget": {"q1": 1111}
 *  }
 * }
 *
 * When department is computed
 *  "department": {
 *      "name": "HR",
 *      "location": "Hyderabad"
 *  }
 * The budget field (computed earlier) is LOST.
 *
 * To avoid this, the latest values against internal nodes (in this case department.budget) are stored in a map
 * These values are assigned back to internal fields if the parent is computed (in this case department)
 * @param target
 * @param root
 * @param variable
 */
const updateInternalNodes = (target, root, variable) => {
    const boundInternalNodes = _.keys(_.get(internalBoundNodeMap.get(variable), [variable.name, root])), targetNodeKey = getTargetNodeKey(target);
    let internalNodes;
    function findInternalNodeBound() {
        return _.filter(boundInternalNodes, function (node) {
            // the later condition in check (targetNodeKey === root || targetNodeKey === 'dataBinding') is specifically for live variable of insert/update types
            return (node !== targetNodeKey && _.includes(node, targetNodeKey)) || ((targetNodeKey === root || targetNodeKey === 'dataBinding') && node !== targetNodeKey);
        });
    }
    internalNodes = findInternalNodeBound();
    if ((internalNodes.length)) {
        _.forEach(internalNodes, function (node) {
            setValueToNode(node, { target: node }, root, variable, _.get(internalBoundNodeMap.get(variable), [variable.name, root, node]));
        });
    }
};
const ɵ14 = updateInternalNodes;
/**
 * New Implementation (DataBinding Flat Structure with x-path targets)
 * processes a dataBinding object, if bound to expression, watches over it, else assigns value to the expression
 * @param obj dataBinding object
 * @param scope scope of the variable
 * @param root root node string (dataBinding for all variables, dataSet for static variable)
 * @param variable variable object
 */
const processBindObject = (obj, scope, root, variable) => {
    const target = obj.target, targetObj = getTargetObj(obj, root, variable), targetNodeKey = getTargetNodeKey(target), runMode = true;
    const destroyFn = scope.registerDestroyListener ? scope.registerDestroyListener.bind(scope) : _.noop;
    if (stringStartsWith(obj.value, 'bind:')) {
        destroyFn($watch(obj.value.replace('bind:', ''), scope, {}, function (newVal, oldVal) {
            if ((newVal === oldVal && _.isUndefined(newVal)) || (_.isUndefined(newVal) && (!_.isUndefined(oldVal) || !_.isUndefined(targetObj[targetNodeKey])))) {
                return;
            }
            // Skip cloning for blob column
            if (!_.includes(['blob', 'file'], obj.type)) {
                newVal = getClonedObject(newVal);
            }
            setValueToNode(target, obj, root, variable, newVal); // cloning newVal to keep the source clean
            if (runMode) {
                /*set the internal bound node map with the latest updated value*/
                if (!internalBoundNodeMap.has(variable)) {
                    internalBoundNodeMap.set(variable, {});
                }
                _.set(internalBoundNodeMap.get(variable), [variable.name, root, target], newVal);
                /*update the internal nodes after internal node map is set*/
                if (_.isObject(newVal)) {
                    updateInternalNodes(target, root, variable);
                }
            }
        }));
    }
    else if (!_.isUndefined(obj.value)) {
        setValueToNode(target, obj, root, variable, obj.value, true);
        if (runMode && root !== targetNodeKey) {
            if (!internalBoundNodeMap.has(variable)) {
                internalBoundNodeMap.set(variable, {});
            }
            _.set(internalBoundNodeMap.get(variable), [variable.name, root, target], obj.value);
        }
    }
};
const ɵ15 = processBindObject;
// *********************************************************** PUBLIC *********************************************************** //
/**
 * Initializes watchers for binding expressions configured in the variable
 * @param variable
 * @param context, scope context in which the variable exists
 * @param {string} bindSource,  the field in variable where the databindings are configured
 *                              for most variables, it will be 'dataBinding', hence default fallback is to 'dataBinding'
 *                              for some it can be 'dataSet' and hence will be passed as param
 * @param {string} bindTarget, the object field in variable where the computed bindings will be set
 */
export const processBinding = (variable, context, bindSource, bindTarget) => {
    bindSource = bindSource || 'dataBinding';
    bindTarget = bindTarget || 'dataBinding';
    const bindMap = variable[bindSource];
    variable[bindSource] = {};
    variable['_bind' + bindSource] = bindMap;
    if (!bindMap) {
        return;
    }
    bindMap.forEach(function (node) {
        /* for static variable change the binding with target 'dataBinding' to 'dataSet', as the results have to reflect directly in the dataSet */
        if (variable.category === 'wm.Variable' && node.target === 'dataBinding') {
            node.target = 'dataSet';
        }
        processBindObject(node, context, bindTarget, variable);
    });
};
/**
 * Downloads a file in the browser.
 * Two methods to do so, namely:
 * 1. downloadThroughAnchor, called if
 *      - if a header is to be passed
 *      OR
 *      - if security is ON and XSRF token is to be sent as well
 * NOTE: This method does not work with Safari version 10.0 and below
 *
 * 2. downloadThroughIframe
 *      - this method works across browsers and uses an iframe to downlad the file.
 * @param requestParams request params object
 * @param fileName represents the file name
 * @param exportFormat downloaded file format
 * @param success success callback
 * @param error error callback
 */
export const simulateFileDownload = (requestParams, fileName, exportFormat, success, error) => {
    /*success and error callbacks are executed incase of downloadThroughAnchor
     Due to technical limitation cannot be executed incase of iframe*/
    if (CONSTANTS.hasCordova) {
        let fileExtension;
        if (exportFormat) {
            fileExtension = exportTypesMap[exportFormat];
        }
        appManager.notify('device-file-download', { url: requestParams.url, name: fileName, extension: fileExtension, successCb: success, errorCb: error });
    }
    else if (!_.isEmpty(requestParams.headers) || isXsrfEnabled()) {
        downloadThroughAnchor(requestParams, success, error);
    }
    else {
        downloadThroughIframe(requestParams, success);
    }
};
/**
 * sets the value against passed key on the "inputFields" object in the variable
 * @param targetObj: the object in which the key, value is to be set
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
export const setInput = (targetObj, key, val, options) => {
    targetObj = targetObj || {};
    let keys, lastKey, paramObj = {};
    // content type check
    if (_.isObject(options)) {
        switch (options.type) {
            case 'file':
                val = getBlob(val, options.contentType);
                break;
            case 'number':
                val = _.isNumber(val) ? val : parseInt(val, 10);
                break;
        }
    }
    if (_.isObject(key)) {
        // check if the passed parameter is an object itself
        paramObj = key;
    }
    else if (key.indexOf('.') > -1) {
        // check for '.' in key e.g. 'employee.department'
        keys = key.split('.');
        lastKey = keys.pop();
        // Finding the object based on the key
        targetObj = findValueOf(targetObj, keys.join('.'), true);
        key = lastKey;
        paramObj[key] = val;
    }
    else {
        paramObj[key] = val;
    }
    _.forEach(paramObj, function (paramVal, paramKey) {
        targetObj[paramKey] = paramVal;
    });
    return targetObj;
};
/**
 * returns true if HTML5 File API is available else false
 * @returns {{prototype: Blob; new(blobParts?: any[], options?: BlobPropertyBag): Blob}}
 */
export const isFileUploadSupported = () => {
    return (window.File && window.FileReader && window.FileList && window.Blob);
};
/**
 *
 * @param varOrder
 * @param optionsOrder
 * @returns {any}
 */
export const getEvaluatedOrderBy = (varOrder, optionsOrder) => {
    let optionFields, varOrderBy;
    // If options order by is not defined, return variable order
    if (!optionsOrder || _.isEmpty(optionsOrder)) {
        return varOrder;
    }
    // If variable order by is not defined, return options order
    if (!varOrder) {
        return optionsOrder;
    }
    // If both are present, combine the options order and variable order, with options order as precedence
    varOrder = _.split(varOrder, ',');
    optionsOrder = _.split(optionsOrder, ',');
    optionFields = _.map(optionsOrder, function (order) {
        return _.split(_.trim(order), ' ')[0];
    });
    // If a field is present in both options and variable, remove the variable orderby
    _.remove(varOrder, function (orderBy) {
        return _.includes(optionFields, _.split(_.trim(orderBy), ' ')[0]);
    });
    varOrderBy = varOrder.length ? ',' + _.join(varOrder, ',') : '';
    return _.join(optionsOrder, ',') + varOrderBy;
};
/**
 * formatting the expression as required by backend which was enclosed by ${<expression>}.
 * @param fieldDefs
 * returns fieldDefs
 */
export const formatExportExpression = fieldDefs => {
    _.forEach(fieldDefs, function (fieldDef) {
        if (fieldDef.expression) {
            fieldDef.expression = '${' + fieldDef.expression + '}';
        }
    });
    return fieldDefs;
};
export const debounceVariableCall = _invoke;
const getDateTimeFormatForType = (type) => {
    return DEFAULT_FORMATS[_.toUpper(type)];
};
const ɵ16 = getDateTimeFormatForType;
// Format value for datetime types
const _formatDate = (dateValue, type) => {
    let epoch;
    if (_.isDate(dateValue)) {
        epoch = dateValue.getTime();
    }
    else {
        if (!isNaN(dateValue)) {
            dateValue = parseInt(dateValue, 10);
        }
        epoch = dateValue && moment(dateValue).valueOf();
    }
    if (type === DataType.TIMESTAMP) {
        return epoch;
    }
    if (type === DataType.TIME && !epoch) {
        epoch = moment(new Date().toDateString() + ' ' + dateValue).valueOf();
    }
    return dateValue && appManager.getPipe('date').transform(epoch, getDateTimeFormatForType(type));
};
const ɵ17 = _formatDate;
// Function to convert values of date time types into default formats
export const formatDate = (value, type) => {
    if (_.includes(type, '.')) {
        type = _.toLower(extractType(type));
    }
    if (_.isArray(value)) {
        return _.map(value, function (val) {
            return _formatDate(val, type);
        });
    }
    return _formatDate(value, type);
};
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5, ɵ6, ɵ7, ɵ8, ɵ9, ɵ10, ɵ11, ɵ12, ɵ13, ɵ14, ɵ15, ɵ16, ɵ17 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyaWFibGVzLnV0aWxzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbInV0aWwvdmFyaWFibGUvdmFyaWFibGVzLnV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUzSixPQUFPLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBSWxHLE1BQU0sY0FBYyxHQUFLLEVBQUUsT0FBTyxFQUFHLE9BQU8sRUFBRSxLQUFLLEVBQUcsTUFBTSxFQUFDLENBQUM7QUFFOUQsTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDO0FBQ3RCLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQztBQUN2QixNQUFNLENBQUMsSUFBSSxlQUFlLENBQUM7QUFDM0IsTUFBTSxDQUFDLElBQUksaUJBQWlCLENBQUM7QUFDN0IsTUFBTSxDQUFDLElBQUksYUFBYSxDQUFDO0FBQ3pCLE1BQU0sQ0FBQyxJQUFJLGNBQWMsQ0FBQztBQUMxQixNQUFNLENBQUMsSUFBSSxZQUFZLENBQUM7QUFDeEIsTUFBTSxDQUFDLElBQUksZUFBZSxDQUFDO0FBQzNCLE1BQU0sQ0FBQyxJQUFJLGFBQWEsQ0FBQztBQUV6QixNQUFNLFlBQVksR0FBRyx3QkFBd0IsRUFDekMsb0JBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQUUsRUFDaEMsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFFdkIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUU7SUFDN0IsSUFBSSxXQUFXLEVBQ1gsUUFBUSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQ2pCLE1BQU0s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QUNsQyxDQUFDLENBQUMsQ0FBQztLQUNOO0lBQ0QsT0FBTyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4dHJhY3RUeXBlLCBEYXRhVHlwZSwgREVGQVVMVF9GT1JNQVRTLCAkcGFyc2VFdmVudCwgJHdhdGNoLCBmaW5kVmFsdWVPZiwgZ2V0QmxvYiwgZ2V0Q2xvbmVkT2JqZWN0LCBzdHJpbmdTdGFydHNXaXRoLCB0cmlnZ2VyRm4gfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IENPTlNUQU5UUywgVkFSSUFCTEVfQ09OU1RBTlRTLCBXU19DT05TVEFOVFMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMvdmFyaWFibGVzLmNvbnN0YW50cyc7XG5cbmRlY2xhcmUgY29uc3Qgd2luZG93LCBfLCAkLCBtb21lbnQ7XG5cbmNvbnN0IGV4cG9ydFR5cGVzTWFwICAgPSB7ICdFWENFTCcgOiAnLnhsc3gnLCAnQ1NWJyA6ICcuY3N2J307XG5cbmV4cG9ydCBsZXQgYXBwTWFuYWdlcjtcbmV4cG9ydCBsZXQgaHR0cFNlcnZpY2U7XG5leHBvcnQgbGV0IG1ldGFkYXRhU2VydmljZTtcbmV4cG9ydCBsZXQgbmF2aWdhdGlvblNlcnZpY2U7XG5leHBvcnQgbGV0IHJvdXRlclNlcnZpY2U7XG5leHBvcnQgbGV0IHRvYXN0ZXJTZXJ2aWNlO1xuZXhwb3J0IGxldCBvYXV0aFNlcnZpY2U7XG5leHBvcnQgbGV0IHNlY3VyaXR5U2VydmljZTtcbmV4cG9ydCBsZXQgZGlhbG9nU2VydmljZTtcblxuY29uc3QgRE9UX0VYUFJfUkVYID0gL15cXFsoXCJ8JylbXFx3XFxXXSooXFwxKVxcXSQvLFxuICAgIGludGVybmFsQm91bmROb2RlTWFwID0gbmV3IE1hcCgpLFxuICAgIHRpbWVycyA9IG5ldyBNYXAoKTtcblxuY29uc3QgX2ludm9rZSA9ICh2YXJpYWJsZSwgb3ApID0+IHtcbiAgICBsZXQgZGVib3VuY2VkRm4sXG4gICAgICAgIGNhbmNlbEZuID0gXy5ub29wLFxuICAgICAgICByZXRWYWw7XG4gICAgaWYgKHRpbWVycy5oYXModmFyaWFibGUpKSB7XG4gICAgICAgIGNhbmNlbEZuID0gdGltZXJzLmdldCh2YXJpYWJsZSkuY2FuY2VsO1xuICAgIH1cbiAgICBjYW5jZWxGbigpO1xuICAgIGRlYm91bmNlZEZuID0gXy5kZWJvdW5jZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldFZhbCA9IHZhcmlhYmxlW29wXSgpO1xuICAgICAgICAvLyBoYW5kbGUgcHJvbWlzZXMgdG8gYXZvaWQgdW5jYXVnaHQgcHJvbWlzZSBlcnJvcnMgaW4gY29uc29sZVxuICAgICAgICBpZiAocmV0VmFsIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0VmFsLmNhdGNoKF8ubm9vcCk7XG4gICAgICAgIH1cbiAgICB9LCAxMDApO1xuICAgIHRpbWVycy5zZXQodmFyaWFibGUsIGRlYm91bmNlZEZuKTtcbiAgICBkZWJvdW5jZWRGbigpO1xufTtcblxuY29uc3QgcHJvY2Vzc1ZhcmlhYmxlUG9zdEJpbmRVcGRhdGUgPSAobm9kZU5hbWUsIG5vZGVWYWwsIG5vZGVUeXBlLCB2YXJpYWJsZSwgbm9VcGRhdGUpID0+IHtcbiAgICBzd2l0Y2ggKHZhcmlhYmxlLmNhdGVnb3J5KSB7XG4gICAgICAgIGNhc2UgVkFSSUFCTEVfQ09OU1RBTlRTLkNBVEVHT1JZLkxJVkU6XG4gICAgICAgICAgICBpZiAodmFyaWFibGUub3BlcmF0aW9uID09PSAncmVhZCcpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZU5hbWUgPT09ICdkYXRhQmluZGluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKG5vZGVWYWwsIGZ1bmN0aW9uICh2YWwsIGtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGUuZmlsdGVyRmllbGRzW2tleV0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlJzogdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZS5maWx0ZXJGaWVsZHNbbm9kZU5hbWVdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlJzogbm9kZVZhbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0eXBlJyA6IG5vZGVUeXBlXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGlmIGF1dG8tdXBkYXRlIHNldCBmb3IgdGhlIHZhcmlhYmxlIHdpdGggcmVhZCBvcGVyYXRpb24gb25seSwgZ2V0IGl0cyBkYXRhICovXG4gICAgICAgICAgICAgICAgaWYgKHZhcmlhYmxlLmF1dG9VcGRhdGUgJiYgIV8uaXNVbmRlZmluZWQobm9kZVZhbCkgJiYgXy5pc0Z1bmN0aW9uKHZhcmlhYmxlLmxpc3RSZWNvcmRzKSAmJiAhbm9VcGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgX2ludm9rZSh2YXJpYWJsZSwgJ2xpc3RSZWNvcmRzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZU5hbWUgPT09ICdkYXRhQmluZGluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFibGUuaW5wdXRGaWVsZHMgPSBub2RlVmFsO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlLmlucHV0RmllbGRzW25vZGVOYW1lXSA9IG5vZGVWYWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGlmIGF1dG8tdXBkYXRlIHNldCBmb3IgdGhlIHZhcmlhYmxlIHdpdGggcmVhZCBvcGVyYXRpb24gb25seSwgZ2V0IGl0cyBkYXRhICovXG4gICAgICAgICAgICAgICAgaWYgKHZhcmlhYmxlLmF1dG9VcGRhdGUgJiYgIV8uaXNVbmRlZmluZWQobm9kZVZhbCkgJiYgXy5pc0Z1bmN0aW9uKHZhcmlhYmxlW3ZhcmlhYmxlLm9wZXJhdGlvbiArICdSZWNvcmQnXSkgJiYgIW5vVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIF9pbnZva2UodmFyaWFibGUsIHZhcmlhYmxlLm9wZXJhdGlvbiArICdSZWNvcmQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBWQVJJQUJMRV9DT05TVEFOVFMuQ0FURUdPUlkuU0VSVklDRTpcbiAgICAgICAgY2FzZSBWQVJJQUJMRV9DT05TVEFOVFMuQ0FURUdPUlkuTE9HSU46XG4gICAgICAgICAgICBpZiAodmFyaWFibGUuYXV0b1VwZGF0ZSAmJiAhXy5pc1VuZGVmaW5lZChub2RlVmFsKSAmJiBfLmlzRnVuY3Rpb24odmFyaWFibGUuaW52b2tlKSAmJiAhbm9VcGRhdGUpIHtcbiAgICAgICAgICAgICAgICBfaW52b2tlKHZhcmlhYmxlLCAnaW52b2tlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBWQVJJQUJMRV9DT05TVEFOVFMuQ0FURUdPUlkuREVWSUNFOlxuICAgICAgICAgICAgdmFyaWFibGVbbm9kZU5hbWVdID0gbm9kZVZhbDtcbiAgICAgICAgICAgIGlmICh2YXJpYWJsZS5hdXRvVXBkYXRlICYmICFfLmlzVW5kZWZpbmVkKG5vZGVWYWwpICYmIF8uaXNGdW5jdGlvbih2YXJpYWJsZS5pbnZva2UpICYmICFub1VwZGF0ZSkge1xuICAgICAgICAgICAgICAgIF9pbnZva2UodmFyaWFibGUsICdpbnZva2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzZXREZXBlbmRlbmN5ID0gKHR5cGU6IHN0cmluZywgcmVmOiBhbnkpID0+IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnYXBwTWFuYWdlcic6XG4gICAgICAgICAgICBhcHBNYW5hZ2VyID0gcmVmO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2h0dHAnOlxuICAgICAgICAgICAgaHR0cFNlcnZpY2UgPSByZWY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbWV0YWRhdGEnOlxuICAgICAgICAgICAgbWV0YWRhdGFTZXJ2aWNlID0gcmVmO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ25hdmlnYXRpb25TZXJ2aWNlJzpcbiAgICAgICAgICAgIG5hdmlnYXRpb25TZXJ2aWNlID0gcmVmO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3JvdXRlcic6XG4gICAgICAgICAgICByb3V0ZXJTZXJ2aWNlID0gcmVmO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3RvYXN0ZXInOlxuICAgICAgICAgICAgdG9hc3RlclNlcnZpY2UgPSAgcmVmO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ29BdXRoJzpcbiAgICAgICAgICAgIG9hdXRoU2VydmljZSA9ICByZWY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2VjdXJpdHknOlxuICAgICAgICAgICAgc2VjdXJpdHlTZXJ2aWNlID0gIHJlZjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkaWFsb2cnOlxuICAgICAgICAgICAgZGlhbG9nU2VydmljZSA9IHJlZjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBpbml0aWF0ZUNhbGxiYWNrID0gKHR5cGU6IHN0cmluZywgdmFyaWFibGU6IGFueSwgZGF0YTogYW55LCBvcHRpb25zPzogYW55LCBza2lwRGVmYXVsdE5vdGlmaWNhdGlvbj86IGJvb2xlYW4pID0+IHtcblxuICAgIC8qY2hlY2tpbmcgaWYgZXZlbnQgaXMgYXZhaWxhYmxlIGFuZCB2YXJpYWJsZSBoYXMgZXZlbnQgcHJvcGVydHkgYW5kIHZhcmlhYmxlIGV2ZW50IHByb3BlcnR5IGJvdW5kIHRvIGZ1bmN0aW9uKi9cbiAgICBjb25zdCBldmVudFZhbHVlcyA9IHZhcmlhYmxlW3R5cGVdLFxuICAgICAgICBjYWxsQmFja1Njb3BlID0gdmFyaWFibGUuX2NvbnRleHQ7XG4gICAgbGV0IGVycm9yVmFyaWFibGU7XG4gICAgLyoqXG4gICAgICogRm9yIGVycm9yIGV2ZW50OlxuICAgICAqIHRyaWdnZXIgYXBwIGxldmVsIGVycm9yIGhhbmRsZXIuXG4gICAgICogaWYgbm8gZXZlbnQgaXMgYXNzaWduZWQsIHRyaWdnZXIgZGVmYXVsdCBhcHBOb3RpZmljYXRpb24gdmFyaWFibGUuXG4gICAgICovXG4gICBpZiAodHlwZSA9PT0gVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkVSUk9SICYmICFza2lwRGVmYXVsdE5vdGlmaWNhdGlvbikge1xuICAgICAgICBpZiAoIWV2ZW50VmFsdWVzKSB7XG4gICAgICAgICAgICAvKiBpbiBjYXNlIG9mIGVycm9yLCBpZiBubyBldmVudCBhc3NpZ25lZCwgaGFuZGxlIHRocm91Z2ggZGVmYXVsdCBub3RpZmljYXRpb24gdmFyaWFibGUgKi9cbiAgICAgICAgICAgIGVycm9yVmFyaWFibGUgPSBjYWxsQmFja1Njb3BlLkFjdGlvbnNbVkFSSUFCTEVfQ09OU1RBTlRTLkRFRkFVTFRfVkFSLk5PVElGSUNBVElPTl07XG4gICAgICAgICAgICBpZiAoZXJyb3JWYXJpYWJsZSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBlcnJvclZhcmlhYmxlLmdldE1lc3NhZ2UoKSB8fCBkYXRhO1xuICAgICAgICAgICAgICAgIGRhdGEgPSBfLmlzU3RyaW5nKGRhdGEpID8gZGF0YSA6ICdBbiBlcnJvciBoYXMgb2NjdXJlZC4gUGxlYXNlIGNoZWNrIHRoZSBhcHAgbG9ncy4nO1xuICAgICAgICAgICAgICAgIGVycm9yVmFyaWFibGUuaW52b2tlKHsgJ21lc3NhZ2UnIDogZGF0YX0sIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kZXZhbEFzeW5jKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kZW1pdChcImludm9rZS1zZXJ2aWNlXCIsIFZBUklBQkxFX0NPTlNUQU5UUy5ERUZBVUxUX1ZBUi5OT1RJRklDQVRJT04sIHtzY29wZTogY2FsbEJhY2tTY29wZSwgbWVzc2FnZTogcmVzcG9uc2V9KTtcbiAgICAgICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBUT0RPOiBbVmliaHVdLCBjaGVjayB3aGV0aGVyIHRvIHN1cHBvcnQgbGVnYWN5IGV2ZW50IGNhbGxpbmcgbWVjaGFuaXNtIChpZGVhbGx5LCBpdCBzaG91bGQgaGF2ZSBiZWVuIG1pZ3JhdGVkKVxuICAgIGNvbnN0IGZuID0gJHBhcnNlRXZlbnQodmFyaWFibGVbdHlwZV0pO1xuICAgIGlmICh0eXBlID09PSBWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuQkVGT1JFX1VQREFURSkge1xuICAgICAgICBpZiAodmFyaWFibGUuY2F0ZWdvcnkgPT09ICd3bS5MaXZlVmFyaWFibGUnICYmIHZhcmlhYmxlLm9wZXJhdGlvbiA9PT0gJ3JlYWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4odmFyaWFibGUuX2NvbnRleHQsIHt2YXJpYWJsZTogdmFyaWFibGUsIGRhdGFGaWx0ZXI6IGRhdGF9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmbih2YXJpYWJsZS5fY29udGV4dCwge3ZhcmlhYmxlOiB2YXJpYWJsZSwgaW5wdXREYXRhOiBkYXRhfSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZm4odmFyaWFibGUuX2NvbnRleHQsIHt2YXJpYWJsZTogdmFyaWFibGUsIGRhdGE6IGRhdGEsIG9wdGlvbnM6IG9wdGlvbnN9KTtcbiAgICB9XG59O1xuXG5jb25zdCB0cmlnZ2VyT25UaW1lb3V0ID0gKHN1Y2Nlc3MpID0+IHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgdHJpZ2dlckZuKHN1Y2Nlc3MpOyB9LCA1MDApO1xufTtcblxuY29uc3QgZG93bmxvYWRGaWxlZnJvbVJlc3BvbnNlID0gKHJlc3BvbnNlLCBoZWFkZXJzLCBzdWNjZXNzLCBlcnJvcikgPT4ge1xuICAgIC8vIGNoZWNrIGZvciBhIGZpbGVuYW1lXG4gICAgbGV0IGZpbGVuYW1lID0gJycsXG4gICAgICAgIGZpbGVuYW1lUmVnZXgsXG4gICAgICAgIG1hdGNoZXMsXG4gICAgICAgIHR5cGUsXG4gICAgICAgIGJsb2IsXG4gICAgICAgIFVSTCxcbiAgICAgICAgZG93bmxvYWRVcmwsXG4gICAgICAgIHBvcHVwO1xuICAgIGNvbnN0IGRpc3Bvc2l0aW9uID0gaGVhZGVycy5nZXQoJ0NvbnRlbnQtRGlzcG9zaXRpb24nKTtcbiAgICBpZiAoZGlzcG9zaXRpb24gJiYgZGlzcG9zaXRpb24uaW5kZXhPZignYXR0YWNobWVudCcpICE9PSAtMSkge1xuICAgICAgICBmaWxlbmFtZVJlZ2V4ID0gL2ZpbGVuYW1lW147PVxcbl0qPSgoWydcIl0pLio/XFwyfFteO1xcbl0qKS87XG4gICAgICAgIG1hdGNoZXMgPSBmaWxlbmFtZVJlZ2V4LmV4ZWMoZGlzcG9zaXRpb24pO1xuICAgICAgICBpZiAobWF0Y2hlcyAhPT0gbnVsbCAmJiBtYXRjaGVzWzFdKSB7XG4gICAgICAgICAgICBmaWxlbmFtZSA9IG1hdGNoZXNbMV0ucmVwbGFjZSgvWydcIl0vZywgJycpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdHlwZSA9IGhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKTtcbiAgICBibG9iID0gbmV3IEJsb2IoW3Jlc3BvbnNlXSwgeyB0eXBlOiB0eXBlIH0pO1xuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cubmF2aWdhdG9yLm1zU2F2ZUJsb2IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIElFIHdvcmthcm91bmQgZm9yIFwiSFRNTDcwMDc6IE9uZSBvciBtb3JlIGJsb2IgVVJMcyB3ZXJlIHJldm9rZWQgYnkgY2xvc2luZyB0aGUgYmxvYiBmb3Igd2hpY2ggdGhleSB3ZXJlIGNyZWF0ZWQuIFRoZXNlIFVSTHMgd2lsbCBubyBsb25nZXIgcmVzb2x2ZSBhcyB0aGUgZGF0YSBiYWNraW5nIHRoZSBVUkwgaGFzIGJlZW4gZnJlZWQuXCJcbiAgICAgICAgaWYgKHdpbmRvdy5uYXZpZ2F0b3IubXNTYXZlQmxvYihibG9iLCBmaWxlbmFtZSkpIHtcbiAgICAgICAgICAgIHRyaWdnZXJPblRpbWVvdXQoc3VjY2Vzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cmlnZ2VyRm4oZXJyb3IpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgVVJMICAgICAgICAgPSB3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkw7XG4gICAgICAgIGRvd25sb2FkVXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblxuICAgICAgICBpZiAoZmlsZW5hbWUpIHtcbiAgICAgICAgICAgIC8vIHVzZSBIVE1MNSBhW2Rvd25sb2FkXSBhdHRyaWJ1dGUgdG8gc3BlY2lmeSBmaWxlbmFtZVxuICAgICAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgIGxldCByZWFkZXI7XG4gICAgICAgICAgICAvLyBzYWZhcmkgZG9lc24ndCBzdXBwb3J0IHRoaXMgeWV0XG4gICAgICAgICAgICBpZiAodHlwZW9mIGEuZG93bmxvYWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSByZWFkZXIucmVzdWx0LnJlcGxhY2UoL15kYXRhOlteO10qOy8sICdkYXRhOmF0dGFjaG1lbnQvZmlsZTsnKTtcbiAgICAgICAgICAgICAgICAgICAgcG9wdXAgPSB3aW5kb3cub3Blbih1cmwsICdfYmxhbmsnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwb3B1cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSB0cmlnZ2VyT25UaW1lb3V0LmJpbmQodW5kZWZpbmVkLCBzdWNjZXNzKTtcbiAgICAgICAgICAgICAgICByZWFkZXIub25lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhLmhyZWYgPSBkb3dubG9hZFVybDtcbiAgICAgICAgICAgICAgICBhLmRvd25sb2FkID0gZmlsZW5hbWU7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKTtcbiAgICAgICAgICAgICAgICBhLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgdHJpZ2dlck9uVGltZW91dChzdWNjZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvcHVwID0gd2luZG93Lm9wZW4oZG93bmxvYWRVcmwsICdfYmxhbmsnKTtcbiAgICAgICAgICAgIGlmICghcG9wdXApIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGRvd25sb2FkVXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IFVSTC5yZXZva2VPYmplY3RVUkwoZG93bmxvYWRVcmwpOyB9LCAxMDApOyAvLyBjbGVhbnVwXG4gICAgfVxufTtcblxuY29uc3QgZ2V0U2VydmljZSA9IChzZXJ2aWNlTmFtZSkgPT4ge1xuICAgIGlmICghc2VydmljZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gc2VydmljZU5hbWU7XG4gICAgLy8gVG9kbzogU2h1YmhhbSwgdW5jb21tZW50IGJlbG93IGNvZGVcbiAgICAvKiAvISogZ2V0IGEgcmVmZXJlbmNlIHRvIHRoZSBlbGVtZW50IHdoZXJlIG5nLWFwcCBpcyBkZWZpbmVkICohL1xuICAgICBsZXQgYXBwRWwgPSBXTS5lbGVtZW50KCdbaWQ9bmctYXBwXScpLCBpbmplY3RvcjtcbiAgICAgaWYgKGFwcEVsKSB7XG4gICAgIHRyeSB7XG4gICAgIGluamVjdG9yID0gYXBwRWwuaW5qZWN0b3IoKTsgLy8gZ2V0IHRoZSBhbmd1bGFyIGluamVjdG9yXG4gICAgIGlmIChpbmplY3Rvcikge1xuICAgICByZXR1cm4gaW5qZWN0b3IuZ2V0KHNlcnZpY2VOYW1lKTsgLy8gcmV0dXJuIHRoZSBzZXJ2aWNlXG4gICAgIH1cbiAgICAgfSBjYXRjaCAoZSkge1xuICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICB9XG4gICAgIH0qL1xufTtcblxuLyoqXG4gKiBDb25zdHJ1Y3QgdGhlIGZvcm0gZGF0YSBwYXJhbXMgZnJvbSB0aGUgVVJMXG4gKiBAcGFyYW0gcXVlcnlQYXJhbXNcbiAqIEBwYXJhbSBwYXJhbXNcbiAqL1xuY29uc3Qgc2V0UGFyYW1zRnJvbVVSTCA9IChxdWVyeVBhcmFtcywgcGFyYW1zKSA9PiB7XG4gICAgcXVlcnlQYXJhbXMgPSBfLnNwbGl0KHF1ZXJ5UGFyYW1zLCAnJicpO1xuICAgIF8uZm9yRWFjaChxdWVyeVBhcmFtcywgZnVuY3Rpb24gKHBhcmFtKSB7XG4gICAgICAgIHBhcmFtID0gXy5zcGxpdChwYXJhbSwgJz0nKTtcbiAgICAgICAgcGFyYW1zW3BhcmFtWzBdXSA9IGRlY29kZVVSSUNvbXBvbmVudChfLmpvaW4oXy5zbGljZShwYXJhbSwgMSksICc9JykpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBbVG9kbzogU2h1YmhhbV0sIEltcGxlbWVudCBEb3dubG9hZCB0aHJvdWdoIEkgZnJhbWVcbiAqIFNpbXVsYXRlcyBmaWxlIGRvd25sb2FkIGluIGFuIGFwcCB0aHJvdWdoIGNyZWF0aW5nIGFuZCBzdWJtaXR0aW5nIGEgaGlkZGVuIGZvcm0gaW4gRE9NLlxuICogVGhlIGFjdGlvbiB3aWxsIGJlIGluaXRpYXRlZCB0aHJvdWdoIGEgU2VydmljZSBWYXJpYWJsZVxuICpcbiAqIFF1ZXJ5IFBhcmFtc1xuICogVGhlIHJlcXVlc3QgcGFyYW1zIGxpa2UgcXVlcnkgcGFyYW1zIGFyZSBhZGRlZCBhcyBoaWRkZW4gaW5wdXQgZWxlbWVudHNcbiAqXG4gKiBIZWFkZXIgUGFyYW1zXG4gKiBUaGUgaGVhZGVyIHBhcmFtcyBmb3IgYSByZXF1ZXN0IGFyZSBhbHNvIGFkZGVkIGFsb25nIHdpdGggaGlkZGVuIGlucHV0IGVsZW1lbnRzLlxuICogVGhpcyBpcyBkb25lIGFzIGhlYWRlcnMgY2FuIG5vdCBiZSBzZXQgZm9yIGEgZm9ybSBQT1NUIGNhbGwgZnJvbSBKYXZhU2NyaXB0XG4gKlxuICogRmluYWxseSwgcmVxdWVzdCBwYXJhbWV0ZXJzIGFyZSBzZW50IGFzIGZvbGxvd3M6XG4gKiBGb3IgYSBHRVQgcmVxdWVzdCwgdGhlIHJlcXVlc3QgZGF0YSBpcyBzZW50IGFsb25nIHdpdGggdGhlIHF1ZXJ5IHBhcmFtcy5cbiAqIEZvciBQT1NULCBpdCBpcyBzZW50IGFzIHJlcXVlc3QgYm9keS5cbiAqXG4gKiBAcGFyYW0gdmFyaWFibGU6IHRoZSB2YXJpYWJsZSB0aGF0IGlzIGNhbGxlZCBmcm9tIHVzZXIgYWN0aW9uXG4gKiBAcGFyYW0gcmVxdWVzdFBhcmFtcyBvYmplY3QgY29uc2lzdGluZyB0aGUgaW5mbyB0byBjb25zdHJ1Y3QgdGhlIFhIUiByZXF1ZXN0IGZvciB0aGUgc2VydmljZVxuICovXG5jb25zdCBkb3dubG9hZFRocm91Z2hJZnJhbWUgPSAocmVxdWVzdFBhcmFtcywgc3VjY2VzcykgPT4ge1xuICAgIC8vIFRvZG86IFNIdWJoYW06IFVSTCBjb250YWlucyAnLy8nIGluIGJldHdlZW4gd2hpY2ggc2hvdWxkIGJlIGhhbmRsZWQgYXQgdGhlIFVSTCBmb3JtYXRpb24gb25seVxuICAgIGlmIChyZXF1ZXN0UGFyYW1zLnVybFsxXSA9PT0gJy8nICYmIHJlcXVlc3RQYXJhbXMudXJsWzJdID09PSAnLycpIHtcbiAgICAgICAgcmVxdWVzdFBhcmFtcy51cmwgPSByZXF1ZXN0UGFyYW1zLnVybC5zbGljZSgwLCAxKSArIHJlcXVlc3RQYXJhbXMudXJsLnNsaWNlKDIpO1xuICAgIH1cbiAgICBsZXQgaUZyYW1lRWxlbWVudCxcbiAgICAgICAgZm9ybUVsLFxuICAgICAgICBwYXJhbUVsZW1lbnQsXG4gICAgICAgIHF1ZXJ5UGFyYW1zICAgICA9ICcnO1xuICAgIGNvbnN0IElGUkFNRV9OQU1FICAgICA9ICdmaWxlRG93bmxvYWRJRnJhbWUnLFxuICAgICAgICBGT1JNX05BTUUgICAgICAgPSAnZmlsZURvd25sb2FkRm9ybScsXG4gICAgICAgIENPTlRFTlRfVFlQRSAgICA9ICdDb250ZW50LVR5cGUnLFxuICAgICAgICB1cmwgICAgICAgICAgICAgPSByZXF1ZXN0UGFyYW1zLnVybCxcbiAgICAgICAgZW5jVHlwZSAgICAgICAgID0gXy5nZXQocmVxdWVzdFBhcmFtcy5oZWFkZXJzLCBDT05URU5UX1RZUEUpLFxuICAgICAgICBwYXJhbXMgICAgICAgICAgPSBfLnBpY2tCeShyZXF1ZXN0UGFyYW1zLmhlYWRlcnMsIGZ1bmN0aW9uICh2YWwsIGtleSkge3JldHVybiBrZXkgIT09IENPTlRFTlRfVFlQRTsgfSk7XG4gICAgLyogVG9kbzogc2h1YmhhbSA6IGRlZmluZSBnZXRTZXJ2aWNlIG1ldGhvZFxuICAgICBXU19DT05TVEFOVFMgICAgPSBnZXRTZXJ2aWNlKCdXU19DT05TVEFOVFMnKTsqL1xuXG4gICAgLyogbG9vayBmb3IgZXhpc3RpbmcgaWZyYW1lLiBJZiBleGlzdHMsIHJlbW92ZSBpdCBmaXJzdCAqL1xuICAgIGlGcmFtZUVsZW1lbnQgPSAkKCcjJyArIElGUkFNRV9OQU1FKTtcbiAgICBpZiAoaUZyYW1lRWxlbWVudC5sZW5ndGgpIHtcbiAgICAgICAgaUZyYW1lRWxlbWVudC5maXJzdCgpLnJlbW92ZSgpO1xuICAgIH1cbiAgICBpRnJhbWVFbGVtZW50ID0gJCgnPGlmcmFtZSBpZD1cIicgKyBJRlJBTUVfTkFNRSArICdcIiBuYW1lPVwiJyArIElGUkFNRV9OQU1FICsgJ1wiIGNsYXNzPVwibmctaGlkZVwiPjwvaWZyYW1lPicpO1xuICAgIGZvcm1FbCAgICAgICAgPSAkKCc8Zm9ybSBpZD1cIicgKyBGT1JNX05BTUUgKyAnXCIgbmFtZT1cIicgKyBGT1JNX05BTUUgKyAnXCI+PC9mb3JtPicpO1xuICAgIGZvcm1FbC5hdHRyKHtcbiAgICAgICAgJ3RhcmdldCcgIDogaUZyYW1lRWxlbWVudC5hdHRyKCduYW1lJyksXG4gICAgICAgICdhY3Rpb24nICA6IHVybCxcbiAgICAgICAgJ21ldGhvZCcgIDogcmVxdWVzdFBhcmFtcy5tZXRob2QsXG4gICAgICAgICdlbmN0eXBlJyA6IGVuY1R5cGVcbiAgICB9KTtcblxuICAgIC8qIHByb2Nlc3MgcXVlcnkgcGFyYW1zLCBhcHBlbmQgYSBoaWRkZW4gaW5wdXQgZWxlbWVudCBpbiB0aGUgZm9ybSBhZ2FpbnN0IGVhY2ggcGFyYW0gKi9cbiAgICBxdWVyeVBhcmFtcyArPSB1cmwuaW5kZXhPZignPycpICE9PSAtMSA/IHVybC5zdWJzdHJpbmcodXJsLmluZGV4T2YoJz8nKSArIDEpIDogJyc7XG4gICAgcXVlcnlQYXJhbXMgKz0gZW5jVHlwZSA9PT0gV1NfQ09OU1RBTlRTLkNPTlRFTlRfVFlQRVMuRk9STV9VUkxfRU5DT0RFRCA/ICgocXVlcnlQYXJhbXMgPyAnJicgOiAnJykgKyByZXF1ZXN0UGFyYW1zLmRhdGFQYXJhbXMpIDogJyc7XG5cbiAgICAvLyBGb3IgTm9uIGJvZHkgbWV0aG9kcyBvbmx5LCBzZXQgdGhlIGlucHV0IGZpZWxkcyBmcm9tIHF1ZXJ5IHBhcmFtZXRlcnNcbiAgICBpZiAoXy5pbmNsdWRlcyhXU19DT05TVEFOVFMuTk9OX0JPRFlfSFRUUF9NRVRIT0RTLCBfLnRvVXBwZXIocmVxdWVzdFBhcmFtcy5tZXRob2QpKSkge1xuICAgICAgICBzZXRQYXJhbXNGcm9tVVJMKHF1ZXJ5UGFyYW1zLCBwYXJhbXMpOyAvLyBTZXQgcGFyYW1zIGZvciBVUkwgcXVlcnkgcGFyYW1zXG4gICAgfVxuICAgIHNldFBhcmFtc0Zyb21VUkwocmVxdWVzdFBhcmFtcy5kYXRhLCBwYXJhbXMpOyAvLyBTZXQgcGFyYW1zIGZvciByZXF1ZXN0IGRhdGFcbiAgICBfLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiAodmFsLCBrZXkpIHtcbiAgICAgICAgcGFyYW1FbGVtZW50ID0gJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIj4nKTtcbiAgICAgICAgcGFyYW1FbGVtZW50LmF0dHIoe1xuICAgICAgICAgICAgJ25hbWUnICA6IGtleSxcbiAgICAgICAgICAgICd2YWx1ZScgOiB2YWxcbiAgICAgICAgfSk7XG4gICAgICAgIGZvcm1FbC5hcHBlbmQocGFyYW1FbGVtZW50KTtcbiAgICB9KTtcblxuICAgIC8qIGFwcGVuZCBmb3JtIHRvIGlGcmFtZSBhbmQgaUZyYW1lIHRvIHRoZSBkb2N1bWVudCBhbmQgc3VibWl0IHRoZSBmb3JtICovXG4gICAgJCgnYm9keScpLmFwcGVuZChpRnJhbWVFbGVtZW50KTtcblxuICAgIC8vIHRpbWVvdXQgZm9yIElFIDEwLCBpZnJhbWVFbGVtZW50LmNvbnRlbnRzKCkgaXMgZW1wdHkgaW4gSUUgMTAgd2l0aG91dCB0aW1lb3V0XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlGcmFtZUVsZW1lbnQuY29udGVudHMoKS5maW5kKCdib2R5JykuYXBwZW5kKGZvcm1FbCk7XG4gICAgICAgIGZvcm1FbC5zdWJtaXQoKTtcbiAgICAgICAgdHJpZ2dlckZuKHN1Y2Nlc3MpO1xuICAgIH0sIDEwMCk7XG59O1xuXG4vKipcbiAqIE1ha2VzIGFuIFhIUiBjYWxsIGFnYWluc3QgdGhlIGNvbmZpZ1xuICogdGhlIHJlc3BvbnNlIGlzIGNvbnZlcnRlZCBpbnRvIGEgYmxvYiB1cmwsIHdoaWNoIGlzIGFzc2lnbmVkIHRvIHRoZSBzcmMgYXR0cmlidXRlIG9mIGFuIGFuY2hvciBlbGVtZW50IHdpdGggZG93bmxvYWQ9dHJ1ZVxuICogYSBjbGljayBpcyBzaW11bGF0ZWQgb24gdGhlIGFuY2hvciB0byBkb3dubG9hZCB0aGUgZmlsZVxuICogQHBhcmFtIGNvbmZpZ1xuICogQHBhcmFtIHN1Y2Nlc3NcbiAqIEBwYXJhbSBlcnJvclxuICovXG5jb25zdCBkb3dubG9hZFRocm91Z2hBbmNob3IgPSAoY29uZmlnLCBzdWNjZXNzLCBlcnJvcikgPT4ge1xuICAgIGNvbnN0IHVybCAgICAgPSBjb25maWcudXJsLFxuICAgICAgICBtZXRob2QgID0gY29uZmlnLm1ldGhvZCxcbiAgICAgICAgZGF0YSAgICA9IGNvbmZpZy5kYXRhUGFyYW1zIHx8IGNvbmZpZy5kYXRhLFxuICAgICAgICBoZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG5cbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddIHx8ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnO1xuXG4gICAgLy8gVG9kbzogUmVwbGFjZSBodHRwIHdpdGggZ2V0U2VydmljZVxuICAgIGh0dHBTZXJ2aWNlLnNlbmQoe1xuICAgICAgICAndGFyZ2V0JyA6ICdXZWJTZXJ2aWNlJyxcbiAgICAgICAgJ2FjdGlvbicgOiAnaW52b2tlUnVudGltZVJlc3RDYWxsJyxcbiAgICAgICAgJ21ldGhvZCcgOiBtZXRob2QsXG4gICAgICAgICd1cmwnICAgIDogdXJsLFxuICAgICAgICAnaGVhZGVycyc6IGhlYWRlcnMsXG4gICAgICAgICdkYXRhJyAgIDogZGF0YSxcbiAgICAgICAgJ3Jlc3BvbnNlVHlwZSc6ICdhcnJheWJ1ZmZlcidcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGRvd25sb2FkRmlsZWZyb21SZXNwb25zZShyZXNwb25zZS5ib2R5LCByZXNwb25zZS5oZWFkZXJzLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgICAgIH0sIDkwMCk7XG4gICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICB0cmlnZ2VyRm4oZXJyb3IsIGVycik7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIGFwcGVuZHMgYSB0aW1lc3RhbXAgb24gdGhlIHBhc3NlZCBmaWxlbmFtZSB0byBwcmV2ZW50IGNhY2hpbmdcbiAqIHJldHVybnMgdGhlIG1vZGlmaWVkIGZpbGUgbmFtZVxuICogQHBhcmFtIGZpbGVOYW1lXG4gKiBAcGFyYW0gZXhwb3J0Rm9ybWF0XG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5jb25zdCBnZXRNb2RpZmllZEZpbGVOYW1lID0gKGZpbGVOYW1lLCBleHBvcnRGb3JtYXQpID0+IHtcbiAgICBsZXQgZmlsZUV4dGVuc2lvbjtcbiAgICBjb25zdCBjdXJyZW50VGltZXN0YW1wID0gRGF0ZS5ub3coKTtcblxuICAgIGlmIChleHBvcnRGb3JtYXQpIHtcbiAgICAgICAgZmlsZUV4dGVuc2lvbiA9IGV4cG9ydFR5cGVzTWFwW2V4cG9ydEZvcm1hdF07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmlsZUV4dGVuc2lvbiA9ICcuJyArIF8ubGFzdChfLnNwbGl0KGZpbGVOYW1lLCAnLicpKTtcbiAgICAgICAgZmlsZU5hbWUgPSBfLnJlcGxhY2UoZmlsZU5hbWUsIGZpbGVFeHRlbnNpb24sICcnKTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGVOYW1lICsgJ18nICsgY3VycmVudFRpbWVzdGFtcCArIGZpbGVFeHRlbnNpb247XG59O1xuXG5jb25zdCBnZXRDb29raWVCeU5hbWUgPSAobmFtZSkgPT4ge1xuICAgIC8vIFRvZG86IFNodWJoYW0gSW1wbGVtZW50IGNvb2tpZSBuYXRpdmUganNcbiAgICByZXR1cm4gJ2Nvb2tpZSc7XG59O1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgY29va2llVmFsdWUgaWYgeHNyZiBpcyBlbmFibGVkLlxuICogSW4gZGV2aWNlLCB4c3JmIGNvb2tpZSBpcyBzdG9yZWQgaW4gbG9jYWxTdG9yYWdlLlxuICogQHJldHVybnMgeHNyZiBjb29raWUgdmFsdWVcbiAqL1xuY29uc3QgaXNYc3JmRW5hYmxlZCA9ICgpID0+IHtcbiAgICBpZiAoQ09OU1RBTlRTLmhhc0NvcmRvdmEpIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKENPTlNUQU5UUy5YU1JGX0NPT0tJRV9OQU1FKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBvYmplY3Qgbm9kZSBmb3IgYSBiaW5kIG9iamVjdCwgd2hlcmUgdGhlIHZhbHVlIGhhcyB0byBiZSB1cGRhdGVkXG4gKiBvYmoudGFyZ2V0ID0gXCJhXCJcbiAqIEBwYXJhbSBvYmpcbiAqIEBwYXJhbSByb290XG4gKiBAcGFyYW0gdmFyaWFibGVcbiAqIEByZXR1cm5zIHsqfVxuICovXG5jb25zdCBnZXRUYXJnZXRPYmogPSAob2JqLCByb290LCB2YXJpYWJsZSkgPT4ge1xuICAgIC8qXG4gICAgICogaWYgdGhlIHRhcmdldCBrZXkgaXMgaW4gdGhlIGZvcm0gYXMgXCJbJ215LnBhcmFtJ11cIlxuICAgICAqIGtlZXAgdGhlIHRhcmdldCBrZXkgYXMgXCJteS5wYXJhbVwiIGFuZCBkbyBub3Qgc3BsaXQgZnVydGhlclxuICAgICAqIHRoaXMgaXMgZG9uZSwgc28gdGhhdCwgdGhlIGNvbXB1dGVkIHZhbHVlIGFnYWluc3QgdGhpcyBiaW5kaW5nIGlzIGFzc2lnbmVkIGFzXG4gICAgICogICAgICB7XCJteS5wYXJhbVwiOiBcInZhbHVlXCJ9XG4gICAgICogYW5kIG5vdCBhc1xuICAgICAqICAgICAge1xuICAgICAqICAgICAgICAgIFwibXlcIjoge1xuICAgICAqICAgICAgICAgICAgICBcInBhcmFtXCI6IFwidmFsdWVcIlxuICAgICAqICAgICAgICAgIH1cbiAgICAgKiAgICAgIH1cbiAgICAgKi9cbiAgICBsZXQgdGFyZ2V0ID0gb2JqLnRhcmdldCxcbiAgICAgICAgdGFyZ2V0T2JqO1xuICAgIGNvbnN0IHJvb3ROb2RlID0gdmFyaWFibGVbcm9vdF07XG4gICAgaWYgKERPVF9FWFBSX1JFWC50ZXN0KHRhcmdldCkpIHtcbiAgICAgICAgdGFyZ2V0T2JqID0gcm9vdE5vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnN1YnN0cigwLCB0YXJnZXQubGFzdEluZGV4T2YoJy4nKSk7XG4gICAgICAgIGlmIChvYmoudGFyZ2V0ID09PSByb290KSB7XG4gICAgICAgICAgICB0YXJnZXRPYmogPSB2YXJpYWJsZTtcbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgIHRhcmdldE9iaiA9IGZpbmRWYWx1ZU9mKHJvb3ROb2RlLCB0YXJnZXQsIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0T2JqID0gcm9vdE5vZGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldE9iajtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUga2V5IGZvciB0aGUgdGFyZ2V0IG9iamVjdFxuICogdGhlIGNvbXB1dGVkIHZhbHVlIHdpbGwgYmUgdXBkYXRlZCBhZ2FpbnN0IHRoaXMga2V5IGluIHRoZSB0YXJnZXRPYmplY3QoY29tcHV0ZWQgYnkgZ2V0VGFyZ2V0T2JqKCkpXG4gKiBAcGFyYW0gdGFyZ2V0XG4gKiBAcGFyYW0gcmVnZXhcbiAqIEByZXR1cm5zIHsqfVxuICovXG5jb25zdCBnZXRUYXJnZXROb2RlS2V5ID0gKHRhcmdldCkgPT4ge1xuICAgIC8qXG4gICAgICogaWYgdGhlIHRhcmdldCBrZXkgaXMgaW4gdGhlIGZvcm0gYXMgXCJbJ215LnBhcmFtJ11cIlxuICAgICAqIGtlZXAgdGhlIHRhcmdldCBrZXkgYXMgXCJteS5wYXJhbVwiIGFuZCBkbyBub3Qgc3BsaXQgZnVydGhlclxuICAgICAqIHRoaXMgaXMgZG9uZSwgc28gdGhhdCwgdGhlIGNvbXB1dGVkIHZhbHVlIGFnYWluc3QgdGhpcyBiaW5kaW5nIGlzIGFzc2lnbmVkIGFzXG4gICAgICogICAgICB7XCJteS5wYXJhbVwiOiBcInZhbHVlXCJ9XG4gICAgICogYW5kIG5vdCBhc1xuICAgICAqICAgICAge1xuICAgICAqICAgICAgICAgIFwibXlcIjoge1xuICAgICAqICAgICAgICAgICAgICBcInBhcmFtXCI6IFwidmFsdWVcIlxuICAgICAqICAgICAgICAgIH1cbiAgICAgKiAgICAgIH1cbiAgICAgKi9cbiAgICBsZXQgdGFyZ2V0Tm9kZUtleTtcbiAgICBpZiAoRE9UX0VYUFJfUkVYLnRlc3QodGFyZ2V0KSkge1xuICAgICAgICB0YXJnZXROb2RlS2V5ID0gdGFyZ2V0LnJlcGxhY2UoL14oXFxbW1wiJ10pfChbXCInXVxcXSkkL2csICcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0YXJnZXROb2RlS2V5ID0gdGFyZ2V0LnNwbGl0KCcuJykucG9wKCk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXROb2RlS2V5O1xufTtcblxuY29uc3Qgc2V0VmFsdWVUb05vZGUgPSAodGFyZ2V0LCBvYmosIHJvb3QsIHZhcmlhYmxlLCB2YWx1ZSwgbm9VcGRhdGU/KSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0Tm9kZUtleSA9IGdldFRhcmdldE5vZGVLZXkodGFyZ2V0KSxcbiAgICAgICAgdGFyZ2V0T2JqID0gZ2V0VGFyZ2V0T2JqKG9iaiwgcm9vdCwgdmFyaWFibGUpO1xuICAgIHZhbHVlID0gIV8uaXNVbmRlZmluZWQodmFsdWUpID8gdmFsdWUgOiBvYmoudmFsdWU7XG4gICAgLyogc2FuaXR5IGNoZWNrLCB1c2VyIGNhbiBiaW5kIHBhcmVudCBub2RlcyB0byBub24tb2JqZWN0IHZhbHVlcywgc28gY2hpbGQgbm9kZSBiaW5kaW5ncyBtYXkgZmFpbCAqL1xuICAgIGlmICh0YXJnZXRPYmopIHtcbiAgICAgICAgdGFyZ2V0T2JqW3RhcmdldE5vZGVLZXldID0gdmFsdWU7XG4gICAgfVxuICAgIHByb2Nlc3NWYXJpYWJsZVBvc3RCaW5kVXBkYXRlKHRhcmdldE5vZGVLZXksIHZhbHVlLCBvYmoudHlwZSwgdmFyaWFibGUsIG5vVXBkYXRlKTtcbn07XG5cbi8qKlxuICogVGhlIG1vZGVsIGludGVybmFsQm91bmROb2RlTWFwIHN0b3JlcyB0aGUgcmVmZXJlbmNlIHRvIGxhdGVzdCBjb21wdXRlZCB2YWx1ZXMgYWdhaW5zdCBpbnRlcm5hbChuZXN0ZWQpIGJvdW5kIG5vZGVzXG4gKiBUaGlzIGlzIGRvbmUgc28gdGhhdCB0aGUgaW50ZXJuYWwgbm9kZSdzIGNvbXB1dGVkIHZhbHVlIGlzIG5vdCBsb3N0LCBvbmNlIGl0cyBwYXJlbnQgbm9kZSdzIHZhbHVlIGlzIGNvbXB1dGVkIGF0IGEgbGF0ZXIgcG9pbnRcbiAqIEUuZy5cbiAqIFZhcmlhYmxlLmVtcGxveWVlVmFyIGhhcyBmb2xsb3dpbmcgYmluZGluZ3NcbiAqIFwiZGF0YUJpbmRpbmdcIjogW1xuICAgICB7XG4gICAgICAgICBcInRhcmdldFwiOiBcImRlcGFydG1lbnQuYnVkZ2V0XCIsXG4gICAgICAgICBcInZhbHVlXCI6IFwiYmluZDpWYXJpYWJsZXMuYnVkZ2V0VmFyLmRhdGFTZXRcIlxuICAgICB9LFxuICAgICB7XG4gICAgICAgICBcInRhcmdldFwiOiBcImRlcGFydG1lbnRcIixcbiAgICAgICAgIFwidmFsdWVcIjogXCJiaW5kOlZhcmlhYmxlcy5kZXBhcnRtZW50VmFyLmRhdGFTZXRcIlxuICAgICB9XG4gXVxuICogV2hlbiBkZXBhcnRtZW50LmJ1ZGdldCBpcyBjb21wdXRlZCwgZW1wbG95ZWVWYXIuZGF0YVNldCA9IHtcbiAqICBcImRlcGFydG1lbnRcIjoge1xuICogICAgICBcImJ1ZGdldFwiOiB7XCJxMVwiOiAxMTExfVxuICogIH1cbiAqIH1cbiAqXG4gKiBXaGVuIGRlcGFydG1lbnQgaXMgY29tcHV0ZWRcbiAqICBcImRlcGFydG1lbnRcIjoge1xuICogICAgICBcIm5hbWVcIjogXCJIUlwiLFxuICogICAgICBcImxvY2F0aW9uXCI6IFwiSHlkZXJhYmFkXCJcbiAqICB9XG4gKiBUaGUgYnVkZ2V0IGZpZWxkIChjb21wdXRlZCBlYXJsaWVyKSBpcyBMT1NULlxuICpcbiAqIFRvIGF2b2lkIHRoaXMsIHRoZSBsYXRlc3QgdmFsdWVzIGFnYWluc3QgaW50ZXJuYWwgbm9kZXMgKGluIHRoaXMgY2FzZSBkZXBhcnRtZW50LmJ1ZGdldCkgYXJlIHN0b3JlZCBpbiBhIG1hcFxuICogVGhlc2UgdmFsdWVzIGFyZSBhc3NpZ25lZCBiYWNrIHRvIGludGVybmFsIGZpZWxkcyBpZiB0aGUgcGFyZW50IGlzIGNvbXB1dGVkIChpbiB0aGlzIGNhc2UgZGVwYXJ0bWVudClcbiAqIEBwYXJhbSB0YXJnZXRcbiAqIEBwYXJhbSByb290XG4gKiBAcGFyYW0gdmFyaWFibGVcbiAqL1xuY29uc3QgdXBkYXRlSW50ZXJuYWxOb2RlcyA9ICh0YXJnZXQsIHJvb3QsIHZhcmlhYmxlKSA9PiB7XG4gICAgY29uc3QgYm91bmRJbnRlcm5hbE5vZGVzID0gXy5rZXlzKF8uZ2V0KGludGVybmFsQm91bmROb2RlTWFwLmdldCh2YXJpYWJsZSksIFt2YXJpYWJsZS5uYW1lLCByb290XSkpLFxuICAgICAgICB0YXJnZXROb2RlS2V5ID0gZ2V0VGFyZ2V0Tm9kZUtleSh0YXJnZXQpO1xuICAgIGxldCBpbnRlcm5hbE5vZGVzO1xuICAgIGZ1bmN0aW9uIGZpbmRJbnRlcm5hbE5vZGVCb3VuZCgpIHtcbiAgICAgICAgcmV0dXJuIF8uZmlsdGVyKGJvdW5kSW50ZXJuYWxOb2RlcywgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgIC8vIHRoZSBsYXRlciBjb25kaXRpb24gaW4gY2hlY2sgKHRhcmdldE5vZGVLZXkgPT09IHJvb3QgfHwgdGFyZ2V0Tm9kZUtleSA9PT0gJ2RhdGFCaW5kaW5nJykgaXMgc3BlY2lmaWNhbGx5IGZvciBsaXZlIHZhcmlhYmxlIG9mIGluc2VydC91cGRhdGUgdHlwZXNcbiAgICAgICAgICAgIHJldHVybiAobm9kZSAhPT0gdGFyZ2V0Tm9kZUtleSAmJiBfLmluY2x1ZGVzKG5vZGUsIHRhcmdldE5vZGVLZXkpKSB8fCAoKHRhcmdldE5vZGVLZXkgPT09IHJvb3QgfHwgdGFyZ2V0Tm9kZUtleSA9PT0gJ2RhdGFCaW5kaW5nJykgJiYgbm9kZSAhPT0gdGFyZ2V0Tm9kZUtleSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbnRlcm5hbE5vZGVzID0gZmluZEludGVybmFsTm9kZUJvdW5kKCk7XG4gICAgaWYgKChpbnRlcm5hbE5vZGVzLmxlbmd0aCkpIHtcbiAgICAgICAgXy5mb3JFYWNoKGludGVybmFsTm9kZXMsIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICBzZXRWYWx1ZVRvTm9kZShub2RlLCB7dGFyZ2V0OiBub2RlfSwgcm9vdCwgdmFyaWFibGUsIF8uZ2V0KGludGVybmFsQm91bmROb2RlTWFwLmdldCh2YXJpYWJsZSksIFt2YXJpYWJsZS5uYW1lLCByb290LCBub2RlXSkpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG4vKipcbiAqIE5ldyBJbXBsZW1lbnRhdGlvbiAoRGF0YUJpbmRpbmcgRmxhdCBTdHJ1Y3R1cmUgd2l0aCB4LXBhdGggdGFyZ2V0cylcbiAqIHByb2Nlc3NlcyBhIGRhdGFCaW5kaW5nIG9iamVjdCwgaWYgYm91bmQgdG8gZXhwcmVzc2lvbiwgd2F0Y2hlcyBvdmVyIGl0LCBlbHNlIGFzc2lnbnMgdmFsdWUgdG8gdGhlIGV4cHJlc3Npb25cbiAqIEBwYXJhbSBvYmogZGF0YUJpbmRpbmcgb2JqZWN0XG4gKiBAcGFyYW0gc2NvcGUgc2NvcGUgb2YgdGhlIHZhcmlhYmxlXG4gKiBAcGFyYW0gcm9vdCByb290IG5vZGUgc3RyaW5nIChkYXRhQmluZGluZyBmb3IgYWxsIHZhcmlhYmxlcywgZGF0YVNldCBmb3Igc3RhdGljIHZhcmlhYmxlKVxuICogQHBhcmFtIHZhcmlhYmxlIHZhcmlhYmxlIG9iamVjdFxuICovXG5jb25zdCBwcm9jZXNzQmluZE9iamVjdCA9IChvYmosIHNjb3BlLCByb290LCB2YXJpYWJsZSkgPT4ge1xuICAgIGNvbnN0IHRhcmdldCA9IG9iai50YXJnZXQsXG4gICAgICAgIHRhcmdldE9iaiA9IGdldFRhcmdldE9iaihvYmosIHJvb3QsIHZhcmlhYmxlKSxcbiAgICAgICAgdGFyZ2V0Tm9kZUtleSA9IGdldFRhcmdldE5vZGVLZXkodGFyZ2V0KSxcbiAgICAgICAgcnVuTW9kZSA9IHRydWU7XG4gICAgY29uc3QgZGVzdHJveUZuID0gc2NvcGUucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIgPyBzY29wZS5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lci5iaW5kKHNjb3BlKSA6IF8ubm9vcDtcblxuICAgIGlmIChzdHJpbmdTdGFydHNXaXRoKG9iai52YWx1ZSwgJ2JpbmQ6JykpIHtcbiAgICAgICAgZGVzdHJveUZuKFxuICAgICAgICAgICAgJHdhdGNoKG9iai52YWx1ZS5yZXBsYWNlKCdiaW5kOicsICcnKSwgc2NvcGUsIHt9LCBmdW5jdGlvbiAobmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoKG5ld1ZhbCA9PT0gb2xkVmFsICYmIF8uaXNVbmRlZmluZWQobmV3VmFsKSkgfHwgKF8uaXNVbmRlZmluZWQobmV3VmFsKSAmJiAoIV8uaXNVbmRlZmluZWQob2xkVmFsKSB8fCAhXy5pc1VuZGVmaW5lZCh0YXJnZXRPYmpbdGFyZ2V0Tm9kZUtleV0pKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBTa2lwIGNsb25pbmcgZm9yIGJsb2IgY29sdW1uXG4gICAgICAgICAgICAgICAgaWYgKCFfLmluY2x1ZGVzKFsnYmxvYicsICdmaWxlJ10sIG9iai50eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWwgPSBnZXRDbG9uZWRPYmplY3QobmV3VmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0VmFsdWVUb05vZGUodGFyZ2V0LCBvYmosIHJvb3QsIHZhcmlhYmxlLCBuZXdWYWwpOyAvLyBjbG9uaW5nIG5ld1ZhbCB0byBrZWVwIHRoZSBzb3VyY2UgY2xlYW5cblxuICAgICAgICAgICAgICAgIGlmIChydW5Nb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qc2V0IHRoZSBpbnRlcm5hbCBib3VuZCBub2RlIG1hcCB3aXRoIHRoZSBsYXRlc3QgdXBkYXRlZCB2YWx1ZSovXG4gICAgICAgICAgICAgICAgICAgIGlmICghaW50ZXJuYWxCb3VuZE5vZGVNYXAuaGFzKHZhcmlhYmxlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJuYWxCb3VuZE5vZGVNYXAuc2V0KHZhcmlhYmxlLCB7fSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXy5zZXQoaW50ZXJuYWxCb3VuZE5vZGVNYXAuZ2V0KHZhcmlhYmxlKSwgW3ZhcmlhYmxlLm5hbWUsIHJvb3QsIHRhcmdldF0sIG5ld1ZhbCk7XG4gICAgICAgICAgICAgICAgICAgIC8qdXBkYXRlIHRoZSBpbnRlcm5hbCBub2RlcyBhZnRlciBpbnRlcm5hbCBub2RlIG1hcCBpcyBzZXQqL1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc09iamVjdChuZXdWYWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVJbnRlcm5hbE5vZGVzKHRhcmdldCwgcm9vdCwgdmFyaWFibGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKCFfLmlzVW5kZWZpbmVkKG9iai52YWx1ZSkpIHtcbiAgICAgICAgc2V0VmFsdWVUb05vZGUodGFyZ2V0LCBvYmosIHJvb3QsIHZhcmlhYmxlLCBvYmoudmFsdWUsIHRydWUpO1xuICAgICAgICBpZiAocnVuTW9kZSAmJiByb290ICE9PSB0YXJnZXROb2RlS2V5KSB7XG4gICAgICAgICAgICBpZiAoIWludGVybmFsQm91bmROb2RlTWFwLmhhcyh2YXJpYWJsZSkpIHtcbiAgICAgICAgICAgICAgICBpbnRlcm5hbEJvdW5kTm9kZU1hcC5zZXQodmFyaWFibGUsIHt9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF8uc2V0KGludGVybmFsQm91bmROb2RlTWFwLmdldCh2YXJpYWJsZSksIFt2YXJpYWJsZS5uYW1lLCByb290LCB0YXJnZXRdLCBvYmoudmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogUFVCTElDICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIC8vXG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgd2F0Y2hlcnMgZm9yIGJpbmRpbmcgZXhwcmVzc2lvbnMgY29uZmlndXJlZCBpbiB0aGUgdmFyaWFibGVcbiAqIEBwYXJhbSB2YXJpYWJsZVxuICogQHBhcmFtIGNvbnRleHQsIHNjb3BlIGNvbnRleHQgaW4gd2hpY2ggdGhlIHZhcmlhYmxlIGV4aXN0c1xuICogQHBhcmFtIHtzdHJpbmd9IGJpbmRTb3VyY2UsICB0aGUgZmllbGQgaW4gdmFyaWFibGUgd2hlcmUgdGhlIGRhdGFiaW5kaW5ncyBhcmUgY29uZmlndXJlZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgbW9zdCB2YXJpYWJsZXMsIGl0IHdpbGwgYmUgJ2RhdGFCaW5kaW5nJywgaGVuY2UgZGVmYXVsdCBmYWxsYmFjayBpcyB0byAnZGF0YUJpbmRpbmcnXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBzb21lIGl0IGNhbiBiZSAnZGF0YVNldCcgYW5kIGhlbmNlIHdpbGwgYmUgcGFzc2VkIGFzIHBhcmFtXG4gKiBAcGFyYW0ge3N0cmluZ30gYmluZFRhcmdldCwgdGhlIG9iamVjdCBmaWVsZCBpbiB2YXJpYWJsZSB3aGVyZSB0aGUgY29tcHV0ZWQgYmluZGluZ3Mgd2lsbCBiZSBzZXRcbiAqL1xuZXhwb3J0IGNvbnN0IHByb2Nlc3NCaW5kaW5nID0gKHZhcmlhYmxlOiBhbnksIGNvbnRleHQ6IGFueSwgYmluZFNvdXJjZT86IHN0cmluZywgYmluZFRhcmdldD86IHN0cmluZykgPT4ge1xuICAgIGJpbmRTb3VyY2UgPSBiaW5kU291cmNlIHx8ICdkYXRhQmluZGluZyc7XG4gICAgYmluZFRhcmdldCA9IGJpbmRUYXJnZXQgfHwgJ2RhdGFCaW5kaW5nJztcblxuICAgIGNvbnN0IGJpbmRNYXAgPSB2YXJpYWJsZVtiaW5kU291cmNlXTtcbiAgICB2YXJpYWJsZVtiaW5kU291cmNlXSA9IHt9O1xuICAgIHZhcmlhYmxlWydfYmluZCcgKyBiaW5kU291cmNlXSA9IGJpbmRNYXA7XG4gICAgaWYgKCFiaW5kTWFwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYmluZE1hcC5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIC8qIGZvciBzdGF0aWMgdmFyaWFibGUgY2hhbmdlIHRoZSBiaW5kaW5nIHdpdGggdGFyZ2V0ICdkYXRhQmluZGluZycgdG8gJ2RhdGFTZXQnLCBhcyB0aGUgcmVzdWx0cyBoYXZlIHRvIHJlZmxlY3QgZGlyZWN0bHkgaW4gdGhlIGRhdGFTZXQgKi9cbiAgICAgICAgaWYgKHZhcmlhYmxlLmNhdGVnb3J5ID09PSAnd20uVmFyaWFibGUnICYmIG5vZGUudGFyZ2V0ID09PSAnZGF0YUJpbmRpbmcnKSB7XG4gICAgICAgICAgICBub2RlLnRhcmdldCA9ICdkYXRhU2V0JztcbiAgICAgICAgfVxuICAgICAgICBwcm9jZXNzQmluZE9iamVjdChub2RlLCBjb250ZXh0LCBiaW5kVGFyZ2V0LCB2YXJpYWJsZSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIERvd25sb2FkcyBhIGZpbGUgaW4gdGhlIGJyb3dzZXIuXG4gKiBUd28gbWV0aG9kcyB0byBkbyBzbywgbmFtZWx5OlxuICogMS4gZG93bmxvYWRUaHJvdWdoQW5jaG9yLCBjYWxsZWQgaWZcbiAqICAgICAgLSBpZiBhIGhlYWRlciBpcyB0byBiZSBwYXNzZWRcbiAqICAgICAgT1JcbiAqICAgICAgLSBpZiBzZWN1cml0eSBpcyBPTiBhbmQgWFNSRiB0b2tlbiBpcyB0byBiZSBzZW50IGFzIHdlbGxcbiAqIE5PVEU6IFRoaXMgbWV0aG9kIGRvZXMgbm90IHdvcmsgd2l0aCBTYWZhcmkgdmVyc2lvbiAxMC4wIGFuZCBiZWxvd1xuICpcbiAqIDIuIGRvd25sb2FkVGhyb3VnaElmcmFtZVxuICogICAgICAtIHRoaXMgbWV0aG9kIHdvcmtzIGFjcm9zcyBicm93c2VycyBhbmQgdXNlcyBhbiBpZnJhbWUgdG8gZG93bmxhZCB0aGUgZmlsZS5cbiAqIEBwYXJhbSByZXF1ZXN0UGFyYW1zIHJlcXVlc3QgcGFyYW1zIG9iamVjdFxuICogQHBhcmFtIGZpbGVOYW1lIHJlcHJlc2VudHMgdGhlIGZpbGUgbmFtZVxuICogQHBhcmFtIGV4cG9ydEZvcm1hdCBkb3dubG9hZGVkIGZpbGUgZm9ybWF0XG4gKiBAcGFyYW0gc3VjY2VzcyBzdWNjZXNzIGNhbGxiYWNrXG4gKiBAcGFyYW0gZXJyb3IgZXJyb3IgY2FsbGJhY2tcbiAqL1xuZXhwb3J0IGNvbnN0IHNpbXVsYXRlRmlsZURvd25sb2FkID0gKHJlcXVlc3RQYXJhbXMsIGZpbGVOYW1lLCBleHBvcnRGb3JtYXQsIHN1Y2Nlc3MsIGVycm9yKSA9PiB7XG4gICAgLypzdWNjZXNzIGFuZCBlcnJvciBjYWxsYmFja3MgYXJlIGV4ZWN1dGVkIGluY2FzZSBvZiBkb3dubG9hZFRocm91Z2hBbmNob3JcbiAgICAgRHVlIHRvIHRlY2huaWNhbCBsaW1pdGF0aW9uIGNhbm5vdCBiZSBleGVjdXRlZCBpbmNhc2Ugb2YgaWZyYW1lKi9cbiAgICBpZiAoQ09OU1RBTlRTLmhhc0NvcmRvdmEpIHtcbiAgICAgICAgbGV0IGZpbGVFeHRlbnNpb247XG4gICAgICAgIGlmIChleHBvcnRGb3JtYXQpIHtcbiAgICAgICAgICAgIGZpbGVFeHRlbnNpb24gPSBleHBvcnRUeXBlc01hcFtleHBvcnRGb3JtYXRdO1xuICAgICAgICB9XG4gICAgICAgIGFwcE1hbmFnZXIubm90aWZ5KCdkZXZpY2UtZmlsZS1kb3dubG9hZCcsIHsgdXJsOiByZXF1ZXN0UGFyYW1zLnVybCwgbmFtZTogZmlsZU5hbWUsIGV4dGVuc2lvbjogZmlsZUV4dGVuc2lvbiwgc3VjY2Vzc0NiOiBzdWNjZXNzLCBlcnJvckNiOiBlcnJvcn0pO1xuICAgIH0gZWxzZSBpZiAoIV8uaXNFbXB0eShyZXF1ZXN0UGFyYW1zLmhlYWRlcnMpIHx8IGlzWHNyZkVuYWJsZWQoKSkge1xuICAgICAgICBkb3dubG9hZFRocm91Z2hBbmNob3IocmVxdWVzdFBhcmFtcywgc3VjY2VzcywgZXJyb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRvd25sb2FkVGhyb3VnaElmcmFtZShyZXF1ZXN0UGFyYW1zLCBzdWNjZXNzKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIHNldHMgdGhlIHZhbHVlIGFnYWluc3QgcGFzc2VkIGtleSBvbiB0aGUgXCJpbnB1dEZpZWxkc1wiIG9iamVjdCBpbiB0aGUgdmFyaWFibGVcbiAqIEBwYXJhbSB0YXJnZXRPYmo6IHRoZSBvYmplY3QgaW4gd2hpY2ggdGhlIGtleSwgdmFsdWUgaXMgdG8gYmUgc2V0XG4gKiBAcGFyYW0gdmFyaWFibGVcbiAqIEBwYXJhbSBrZXk6IGNhbiBiZTpcbiAqICAtIGEgc3RyaW5nIGUuZy4gXCJ1c2VybmFtZVwiXG4gKiAgLSBhbiBvYmplY3QsIGUuZy4ge1widXNlcm5hbWVcIjogXCJqb2huXCIsIFwic3NuXCI6IFwiMTExMTFcIn1cbiAqIEBwYXJhbSB2YWxcbiAqIC0gaWYga2V5IGlzIHN0cmluZywgdGhlIHZhbHVlIGFnYWluc3QgaXQgKGZvciB0aGF0IGRhdGEgdHlwZSlcbiAqIC0gaWYga2V5IGlzIG9iamVjdCwgbm90IHJlcXVpcmVkXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogQHJldHVybnMge2FueX1cbiAqL1xuZXhwb3J0IGNvbnN0IHNldElucHV0ID0gKHRhcmdldE9iajogYW55LCBrZXk6IGFueSwgdmFsOiBhbnksIG9wdGlvbnM6IGFueSkgPT4ge1xuICAgIHRhcmdldE9iaiA9IHRhcmdldE9iaiB8fCB7fTtcbiAgICBsZXQga2V5cyxcbiAgICAgICAgbGFzdEtleSxcbiAgICAgICAgcGFyYW1PYmogPSB7fTtcblxuICAgIC8vIGNvbnRlbnQgdHlwZSBjaGVja1xuICAgIGlmIChfLmlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdmaWxlJzpcbiAgICAgICAgICAgICAgICB2YWwgPSBnZXRCbG9iKHZhbCwgb3B0aW9ucy5jb250ZW50VHlwZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgICAgIHZhbCA9IF8uaXNOdW1iZXIodmFsKSA/IHZhbCA6IHBhcnNlSW50KHZhbCwgMTApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKF8uaXNPYmplY3Qoa2V5KSkge1xuICAgICAgICAvLyBjaGVjayBpZiB0aGUgcGFzc2VkIHBhcmFtZXRlciBpcyBhbiBvYmplY3QgaXRzZWxmXG4gICAgICAgIHBhcmFtT2JqID0ga2V5O1xuICAgIH0gZWxzZSBpZiAoa2V5LmluZGV4T2YoJy4nKSA+IC0xKSB7XG4gICAgICAgIC8vIGNoZWNrIGZvciAnLicgaW4ga2V5IGUuZy4gJ2VtcGxveWVlLmRlcGFydG1lbnQnXG4gICAgICAgIGtleXMgPSBrZXkuc3BsaXQoJy4nKTtcbiAgICAgICAgbGFzdEtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIC8vIEZpbmRpbmcgdGhlIG9iamVjdCBiYXNlZCBvbiB0aGUga2V5XG4gICAgICAgIHRhcmdldE9iaiA9IGZpbmRWYWx1ZU9mKHRhcmdldE9iaiwga2V5cy5qb2luKCcuJyksIHRydWUpO1xuICAgICAgICBrZXkgPSBsYXN0S2V5O1xuICAgICAgICBwYXJhbU9ialtrZXldID0gdmFsO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmFtT2JqW2tleV0gPSB2YWw7XG4gICAgfVxuXG4gICAgXy5mb3JFYWNoKHBhcmFtT2JqLCBmdW5jdGlvbiAocGFyYW1WYWwsIHBhcmFtS2V5KSB7XG4gICAgICAgIHRhcmdldE9ialtwYXJhbUtleV0gPSBwYXJhbVZhbDtcbiAgICB9KTtcbiAgICByZXR1cm4gdGFyZ2V0T2JqO1xufTtcblxuLyoqXG4gKiByZXR1cm5zIHRydWUgaWYgSFRNTDUgRmlsZSBBUEkgaXMgYXZhaWxhYmxlIGVsc2UgZmFsc2VcbiAqIEByZXR1cm5zIHt7cHJvdG90eXBlOiBCbG9iOyBuZXcoYmxvYlBhcnRzPzogYW55W10sIG9wdGlvbnM/OiBCbG9iUHJvcGVydHlCYWcpOiBCbG9ifX1cbiAqL1xuZXhwb3J0IGNvbnN0IGlzRmlsZVVwbG9hZFN1cHBvcnRlZCA9ICgpID0+IHtcbiAgICByZXR1cm4gKHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYik7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0gdmFyT3JkZXJcbiAqIEBwYXJhbSBvcHRpb25zT3JkZXJcbiAqIEByZXR1cm5zIHthbnl9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFdmFsdWF0ZWRPcmRlckJ5ID0gKHZhck9yZGVyLCBvcHRpb25zT3JkZXIpID0+IHtcbiAgICBsZXQgb3B0aW9uRmllbGRzLFxuICAgICAgICB2YXJPcmRlckJ5O1xuICAgIC8vIElmIG9wdGlvbnMgb3JkZXIgYnkgaXMgbm90IGRlZmluZWQsIHJldHVybiB2YXJpYWJsZSBvcmRlclxuICAgIGlmICghb3B0aW9uc09yZGVyIHx8IF8uaXNFbXB0eShvcHRpb25zT3JkZXIpKSB7XG4gICAgICAgIHJldHVybiB2YXJPcmRlcjtcbiAgICB9XG4gICAgLy8gSWYgdmFyaWFibGUgb3JkZXIgYnkgaXMgbm90IGRlZmluZWQsIHJldHVybiBvcHRpb25zIG9yZGVyXG4gICAgaWYgKCF2YXJPcmRlcikge1xuICAgICAgICByZXR1cm4gb3B0aW9uc09yZGVyO1xuICAgIH1cbiAgICAvLyBJZiBib3RoIGFyZSBwcmVzZW50LCBjb21iaW5lIHRoZSBvcHRpb25zIG9yZGVyIGFuZCB2YXJpYWJsZSBvcmRlciwgd2l0aCBvcHRpb25zIG9yZGVyIGFzIHByZWNlZGVuY2VcbiAgICB2YXJPcmRlciAgICAgPSBfLnNwbGl0KHZhck9yZGVyLCAnLCcpO1xuICAgIG9wdGlvbnNPcmRlciA9IF8uc3BsaXQob3B0aW9uc09yZGVyLCAnLCcpO1xuICAgIG9wdGlvbkZpZWxkcyA9IF8ubWFwKG9wdGlvbnNPcmRlciwgZnVuY3Rpb24gKG9yZGVyKSB7XG4gICAgICAgIHJldHVybiBfLnNwbGl0KF8udHJpbShvcmRlciksICcgJylbMF07XG4gICAgfSk7XG4gICAgLy8gSWYgYSBmaWVsZCBpcyBwcmVzZW50IGluIGJvdGggb3B0aW9ucyBhbmQgdmFyaWFibGUsIHJlbW92ZSB0aGUgdmFyaWFibGUgb3JkZXJieVxuICAgIF8ucmVtb3ZlKHZhck9yZGVyLCBmdW5jdGlvbiAob3JkZXJCeSkge1xuICAgICAgICByZXR1cm4gXy5pbmNsdWRlcyhvcHRpb25GaWVsZHMsIF8uc3BsaXQoXy50cmltKG9yZGVyQnkpLCAnICcpWzBdKTtcbiAgICB9KTtcbiAgICB2YXJPcmRlckJ5ID0gdmFyT3JkZXIubGVuZ3RoID8gJywnICsgXy5qb2luKHZhck9yZGVyLCAnLCcpIDogJyc7XG4gICAgcmV0dXJuIF8uam9pbihvcHRpb25zT3JkZXIsICcsJykgKyB2YXJPcmRlckJ5O1xufTtcblxuLyoqXG4gKiBmb3JtYXR0aW5nIHRoZSBleHByZXNzaW9uIGFzIHJlcXVpcmVkIGJ5IGJhY2tlbmQgd2hpY2ggd2FzIGVuY2xvc2VkIGJ5ICR7PGV4cHJlc3Npb24+fS5cbiAqIEBwYXJhbSBmaWVsZERlZnNcbiAqIHJldHVybnMgZmllbGREZWZzXG4gKi9cbmV4cG9ydCBjb25zdCBmb3JtYXRFeHBvcnRFeHByZXNzaW9uID0gZmllbGREZWZzID0+IHtcbiAgICBfLmZvckVhY2goZmllbGREZWZzLCBmdW5jdGlvbiAoZmllbGREZWYpIHtcbiAgICAgICAgaWYgKGZpZWxkRGVmLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIGZpZWxkRGVmLmV4cHJlc3Npb24gPSAnJHsnICsgZmllbGREZWYuZXhwcmVzc2lvbiArICd9JztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBmaWVsZERlZnM7XG59O1xuXG5leHBvcnQgY29uc3QgZGVib3VuY2VWYXJpYWJsZUNhbGwgPSBfaW52b2tlO1xuXG5jb25zdCBnZXREYXRlVGltZUZvcm1hdEZvclR5cGUgPSAodHlwZSkgPT4ge1xuICAgIHJldHVybiBERUZBVUxUX0ZPUk1BVFNbXy50b1VwcGVyKHR5cGUpXTtcbn07XG5cbi8vIEZvcm1hdCB2YWx1ZSBmb3IgZGF0ZXRpbWUgdHlwZXNcbmNvbnN0IF9mb3JtYXREYXRlID0gKGRhdGVWYWx1ZSwgdHlwZSkgPT4ge1xuICAgIGxldCBlcG9jaDtcbiAgICBpZiAoXy5pc0RhdGUoZGF0ZVZhbHVlKSkge1xuICAgICAgICBlcG9jaCA9IGRhdGVWYWx1ZS5nZXRUaW1lKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFpc05hTihkYXRlVmFsdWUpKSB7XG4gICAgICAgICAgICBkYXRlVmFsdWUgPSBwYXJzZUludChkYXRlVmFsdWUsIDEwKTtcbiAgICAgICAgfVxuICAgICAgICBlcG9jaCA9IGRhdGVWYWx1ZSAmJiBtb21lbnQoZGF0ZVZhbHVlKS52YWx1ZU9mKCk7XG4gICAgfVxuICAgIGlmICh0eXBlID09PSBEYXRhVHlwZS5USU1FU1RBTVApIHtcbiAgICAgICAgcmV0dXJuIGVwb2NoO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PT0gRGF0YVR5cGUuVElNRSAmJiAhZXBvY2gpIHtcbiAgICAgICAgZXBvY2ggPSBtb21lbnQobmV3IERhdGUoKS50b0RhdGVTdHJpbmcoKSArICcgJyArIGRhdGVWYWx1ZSkudmFsdWVPZigpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0ZVZhbHVlICYmIGFwcE1hbmFnZXIuZ2V0UGlwZSgnZGF0ZScpLnRyYW5zZm9ybShlcG9jaCwgZ2V0RGF0ZVRpbWVGb3JtYXRGb3JUeXBlKHR5cGUpKTtcbn07XG5cbi8vIEZ1bmN0aW9uIHRvIGNvbnZlcnQgdmFsdWVzIG9mIGRhdGUgdGltZSB0eXBlcyBpbnRvIGRlZmF1bHQgZm9ybWF0c1xuZXhwb3J0IGNvbnN0IGZvcm1hdERhdGUgPSAodmFsdWUsIHR5cGUpID0+IHtcbiAgICBpZiAoXy5pbmNsdWRlcyh0eXBlLCAnLicpKSB7XG4gICAgICAgIHR5cGUgPSBfLnRvTG93ZXIoZXh0cmFjdFR5cGUodHlwZSkpO1xuICAgIH1cbiAgICBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gXy5tYXAodmFsdWUsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICAgIHJldHVybiBfZm9ybWF0RGF0ZSh2YWwsIHR5cGUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIF9mb3JtYXREYXRlKHZhbHVlLCB0eXBlKTtcbn07XG4iXX0=