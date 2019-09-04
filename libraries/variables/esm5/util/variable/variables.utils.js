import { extractType, DataType, DEFAULT_FORMATS, $parseEvent, $watch, findValueOf, getBlob, getClonedObject, stringStartsWith, triggerFn } from '@wm/core';
import { CONSTANTS, VARIABLE_CONSTANTS, WS_CONSTANTS } from '../../constants/variables.constants';
var exportTypesMap = { 'EXCEL': '.xlsx', 'CSV': '.csv' };
export var appManager;
export var httpService;
export var metadataService;
export var navigationService;
export var routerService;
export var toasterService;
export var oauthService;
export var securityService;
export var dialogService;
var DOT_EXPR_REX = /^\[("|')[\w\W]*(\1)\]$/, internalBoundNodeMap = new Map(), timers = new Map();
var _invoke = function (variable, op) {
    var debouncedFn, cancelFn = _.noop, retVal;
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
var ɵ0 = _invoke;
var processVariablePostBindUpdate = function (nodeName, nodeVal, nodeType, variable, noUpdate) {
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
var ɵ1 = processVariablePostBindUpdate;
export var setDependency = function (type, ref) {
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
export var initiateCallback = function (type, variable, data, options, skipDefaultNotification) {
    /*checking if event is available and variable has event property and variable event property bound to function*/
    var eventValues = variable[type], callBackScope = variable._context;
    var errorVariable;
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
    var fn = $parseEvent(variable[type]);
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
var triggerOnTimeout = function (success) {
    setTimeout(function () { triggerFn(success); }, 500);
};
var ɵ2 = triggerOnTimeout;
var downloadFilefromResponse = function (response, headers, success, error) {
    // check for a filename
    var filename = '', filenameRegex, matches, type, blob, URL, downloadUrl, popup;
    var disposition = headers.get('Content-Disposition');
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
            var a = document.createElement('a');
            var reader_1;
            // safari doesn't support this yet
            if (typeof a.download === 'undefined') {
                reader_1 = new FileReader();
                reader_1.onloadend = function () {
                    var url = reader_1.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                    popup = window.open(url, '_blank');
                    if (!popup) {
                        window.location.href = url;
                    }
                };
                reader_1.onload = triggerOnTimeout.bind(undefined, success);
                reader_1.onerror = error;
                reader_1.readAsDataURL(blob);
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
        setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
    }
};
var ɵ3 = downloadFilefromResponse;
var getService = function (serviceName) {
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
var ɵ4 = getService;
/**
 * Construct the form data params from the URL
 * @param queryParams
 * @param params
 */
var setParamsFromURL = function (queryParams, params) {
    queryParams = _.split(queryParams, '&');
    _.forEach(queryParams, function (param) {
        param = _.split(param, '=');
        params[param[0]] = decodeURIComponent(_.join(_.slice(param, 1), '='));
    });
};
var ɵ5 = setParamsFromURL;
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
var downloadThroughIframe = function (requestParams, success) {
    // Todo: SHubham: URL contains '//' in between which should be handled at the URL formation only
    if (requestParams.url[1] === '/' && requestParams.url[2] === '/') {
        requestParams.url = requestParams.url.slice(0, 1) + requestParams.url.slice(2);
    }
    var iFrameElement, formEl, paramElement, queryParams = '';
    var IFRAME_NAME = 'fileDownloadIFrame', FORM_NAME = 'fileDownloadForm', CONTENT_TYPE = 'Content-Type', url = requestParams.url, encType = _.get(requestParams.headers, CONTENT_TYPE), params = _.pickBy(requestParams.headers, function (val, key) { return key !== CONTENT_TYPE; });
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
var ɵ6 = downloadThroughIframe;
/**
 * Makes an XHR call against the config
 * the response is converted into a blob url, which is assigned to the src attribute of an anchor element with download=true
 * a click is simulated on the anchor to download the file
 * @param config
 * @param success
 * @param error
 */
var downloadThroughAnchor = function (config, success, error) {
    var url = config.url, method = config.method, data = config.dataParams || config.data, headers = config.headers;
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
        setTimeout(function () {
            downloadFilefromResponse(response.body, response.headers, success, error);
        }, 900);
    }, function (err) {
        triggerFn(error, err);
    });
};
var ɵ7 = downloadThroughAnchor;
/**
 * appends a timestamp on the passed filename to prevent caching
 * returns the modified file name
 * @param fileName
 * @param exportFormat
 * @returns {string}
 */
var getModifiedFileName = function (fileName, exportFormat) {
    var fileExtension;
    var currentTimestamp = Date.now();
    if (exportFormat) {
        fileExtension = exportTypesMap[exportFormat];
    }
    else {
        fileExtension = '.' + _.last(_.split(fileName, '.'));
        fileName = _.replace(fileName, fileExtension, '');
    }
    return fileName + '_' + currentTimestamp + fileExtension;
};
var ɵ8 = getModifiedFileName;
var getCookieByName = function (name) {
    // Todo: Shubham Implement cookie native js
    return 'cookie';
};
var ɵ9 = getCookieByName;
/**
 * This function returns the cookieValue if xsrf is enabled.
 * In device, xsrf cookie is stored in localStorage.
 * @returns xsrf cookie value
 */
var isXsrfEnabled = function () {
    if (CONSTANTS.hasCordova) {
        return localStorage.getItem(CONSTANTS.XSRF_COOKIE_NAME);
    }
    return false;
};
var ɵ10 = isXsrfEnabled;
/**
 * Returns the object node for a bind object, where the value has to be updated
 * obj.target = "a"
 * @param obj
 * @param root
 * @param variable
 * @returns {*}
 */
var getTargetObj = function (obj, root, variable) {
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
    var target = obj.target, targetObj;
    var rootNode = variable[root];
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
var ɵ11 = getTargetObj;
/**
 * Gets the key for the target object
 * the computed value will be updated against this key in the targetObject(computed by getTargetObj())
 * @param target
 * @param regex
 * @returns {*}
 */
var getTargetNodeKey = function (target) {
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
    var targetNodeKey;
    if (DOT_EXPR_REX.test(target)) {
        targetNodeKey = target.replace(/^(\[["'])|(["']\])$/g, '');
    }
    else {
        targetNodeKey = target.split('.').pop();
    }
    return targetNodeKey;
};
var ɵ12 = getTargetNodeKey;
var setValueToNode = function (target, obj, root, variable, value, noUpdate) {
    var targetNodeKey = getTargetNodeKey(target), targetObj = getTargetObj(obj, root, variable);
    value = !_.isUndefined(value) ? value : obj.value;
    /* sanity check, user can bind parent nodes to non-object values, so child node bindings may fail */
    if (targetObj) {
        targetObj[targetNodeKey] = value;
    }
    processVariablePostBindUpdate(targetNodeKey, value, obj.type, variable, noUpdate);
};
var ɵ13 = setValueToNode;
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
var updateInternalNodes = function (target, root, variable) {
    var boundInternalNodes = _.keys(_.get(internalBoundNodeMap.get(variable), [variable.name, root])), targetNodeKey = getTargetNodeKey(target);
    var internalNodes;
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
var ɵ14 = updateInternalNodes;
/**
 * New Implementation (DataBinding Flat Structure with x-path targets)
 * processes a dataBinding object, if bound to expression, watches over it, else assigns value to the expression
 * @param obj dataBinding object
 * @param scope scope of the variable
 * @param root root node string (dataBinding for all variables, dataSet for static variable)
 * @param variable variable object
 */
var processBindObject = function (obj, scope, root, variable) {
    var target = obj.target, targetObj = getTargetObj(obj, root, variable), targetNodeKey = getTargetNodeKey(target), runMode = true;
    var destroyFn = scope.registerDestroyListener ? scope.registerDestroyListener.bind(scope) : _.noop;
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
var ɵ15 = processBindObject;
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
export var processBinding = function (variable, context, bindSource, bindTarget) {
    bindSource = bindSource || 'dataBinding';
    bindTarget = bindTarget || 'dataBinding';
    var bindMap = variable[bindSource];
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
export var simulateFileDownload = function (requestParams, fileName, exportFormat, success, error) {
    /*success and error callbacks are executed incase of downloadThroughAnchor
     Due to technical limitation cannot be executed incase of iframe*/
    if (CONSTANTS.hasCordova) {
        var fileExtension = void 0;
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
export var setInput = function (targetObj, key, val, options) {
    targetObj = targetObj || {};
    var keys, lastKey, paramObj = {};
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
export var isFileUploadSupported = function () {
    return (window.File && window.FileReader && window.FileList && window.Blob);
};
/**
 *
 * @param varOrder
 * @param optionsOrder
 * @returns {any}
 */
export var getEvaluatedOrderBy = function (varOrder, optionsOrder) {
    var optionFields, varOrderBy;
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
export var formatExportExpression = function (fieldDefs) {
    _.forEach(fieldDefs, function (fieldDef) {
        if (fieldDef.expression) {
            fieldDef.expression = '${' + fieldDef.expression + '}';
        }
    });
    return fieldDefs;
};
export var debounceVariableCall = _invoke;
var getDateTimeFormatForType = function (type) {
    return DEFAULT_FORMATS[_.toUpper(type)];
};
var ɵ16 = getDateTimeFormatForType;
// Format value for datetime types
var _formatDate = function (dateValue, type) {
    var epoch;
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
var ɵ17 = _formatDate;
// Function to convert values of date time types into default formats
export var formatDate = function (value, type) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyaWFibGVzLnV0aWxzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbInV0aWwvdmFyaWFibGUvdmFyaWFibGVzLnV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUzSixPQUFPLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBSWxHLElBQU0sY0FBYyxHQUFLLEVBQUUsT0FBTyxFQUFHLE9BQU8sRUFBRSxLQUFLLEVBQUcsTUFBTSxFQUFDLENBQUM7QUFFOUQsTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDO0FBQ3RCLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQztBQUN2QixNQUFNLENBQUMsSUFBSSxlQUFlLENBQUM7QUFDM0IsTUFBTSxDQUFDLElBQUksaUJBQWlCLENBQUM7QUFDN0IsTUFBTSxDQUFDLElBQUksYUFBYSxDQUFDO0FBQ3pCLE1BQU0sQ0FBQyxJQUFJLGNBQWMsQ0FBQztBQUMxQixNQUFNLENBQUMsSUFBSSxZQUFZLENBQUM7QUFDeEIsTUFBTSxDQUFDLElBQUksZUFBZSxDQUFDO0FBQzNCLE1BQU0sQ0FBQyxJQUFJLGFBQWEsQ0FBQztBQUV6QixJQUFNLFlBQVksR0FBRyx3QkFBd0IsRUFDekMsb0JBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQUUsRUFDaEMsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFFdkIsSUFBTSxPQUFPLEdBQUcsVUFBQyxRQUFRLEVBQUUsRUFBRTtJQUN6QixJQUFJLFdBQVcsRUFDWCxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFDakIsTUFBTSxDQUFDO0lBQ1gs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SUFBSSxLQUFLLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDbEMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFlBQVksRUFBRSxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN6RTtJQUNELE9BQU8sU0FBUyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3BHLENBQUMsQ0FBQzs7QUFFRixxRUFBcUU7QUFDckUsTUFBTSxDQUFDLElBQU0sVUFBVSxHQUFHLFVBQUMsS0FBSyxFQUFFLElBQUk7SUFDbEMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRTtRQUN2QixJQUFJLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUN2QztJQUNELElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNsQixPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFVBQVUsR0FBRztZQUM3QixPQUFPLFdBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7S0FDTjtJQUNELE9BQU8sV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleHRyYWN0VHlwZSwgRGF0YVR5cGUsIERFRkFVTFRfRk9STUFUUywgJHBhcnNlRXZlbnQsICR3YXRjaCwgZmluZFZhbHVlT2YsIGdldEJsb2IsIGdldENsb25lZE9iamVjdCwgc3RyaW5nU3RhcnRzV2l0aCwgdHJpZ2dlckZuIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBDT05TVEFOVFMsIFZBUklBQkxFX0NPTlNUQU5UUywgV1NfQ09OU1RBTlRTIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzL3ZhcmlhYmxlcy5jb25zdGFudHMnO1xuXG5kZWNsYXJlIGNvbnN0IHdpbmRvdywgXywgJCwgbW9tZW50O1xuXG5jb25zdCBleHBvcnRUeXBlc01hcCAgID0geyAnRVhDRUwnIDogJy54bHN4JywgJ0NTVicgOiAnLmNzdid9O1xuXG5leHBvcnQgbGV0IGFwcE1hbmFnZXI7XG5leHBvcnQgbGV0IGh0dHBTZXJ2aWNlO1xuZXhwb3J0IGxldCBtZXRhZGF0YVNlcnZpY2U7XG5leHBvcnQgbGV0IG5hdmlnYXRpb25TZXJ2aWNlO1xuZXhwb3J0IGxldCByb3V0ZXJTZXJ2aWNlO1xuZXhwb3J0IGxldCB0b2FzdGVyU2VydmljZTtcbmV4cG9ydCBsZXQgb2F1dGhTZXJ2aWNlO1xuZXhwb3J0IGxldCBzZWN1cml0eVNlcnZpY2U7XG5leHBvcnQgbGV0IGRpYWxvZ1NlcnZpY2U7XG5cbmNvbnN0IERPVF9FWFBSX1JFWCA9IC9eXFxbKFwifCcpW1xcd1xcV10qKFxcMSlcXF0kLyxcbiAgICBpbnRlcm5hbEJvdW5kTm9kZU1hcCA9IG5ldyBNYXAoKSxcbiAgICB0aW1lcnMgPSBuZXcgTWFwKCk7XG5cbmNvbnN0IF9pbnZva2UgPSAodmFyaWFibGUsIG9wKSA9PiB7XG4gICAgbGV0IGRlYm91bmNlZEZuLFxuICAgICAgICBjYW5jZWxGbiA9IF8ubm9vcCxcbiAgICAgICAgcmV0VmFsO1xuICAgIGlmICh0aW1lcnMuaGFzKHZhcmlhYmxlKSkge1xuICAgICAgICBjYW5jZWxGbiA9IHRpbWVycy5nZXQodmFyaWFibGUpLmNhbmNlbDtcbiAgICB9XG4gICAgY2FuY2VsRm4oKTtcbiAgICBkZWJvdW5jZWRGbiA9IF8uZGVib3VuY2UoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXRWYWwgPSB2YXJpYWJsZVtvcF0oKTtcbiAgICAgICAgLy8gaGFuZGxlIHByb21pc2VzIHRvIGF2b2lkIHVuY2F1Z2h0IHByb21pc2UgZXJyb3JzIGluIGNvbnNvbGVcbiAgICAgICAgaWYgKHJldFZhbCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldFZhbC5jYXRjaChfLm5vb3ApO1xuICAgICAgICB9XG4gICAgfSwgMTAwKTtcbiAgICB0aW1lcnMuc2V0KHZhcmlhYmxlLCBkZWJvdW5jZWRGbik7XG4gICAgZGVib3VuY2VkRm4oKTtcbn07XG5cbmNvbnN0IHByb2Nlc3NWYXJpYWJsZVBvc3RCaW5kVXBkYXRlID0gKG5vZGVOYW1lLCBub2RlVmFsLCBub2RlVHlwZSwgdmFyaWFibGUsIG5vVXBkYXRlKSA9PiB7XG4gICAgc3dpdGNoICh2YXJpYWJsZS5jYXRlZ29yeSkge1xuICAgICAgICBjYXNlIFZBUklBQkxFX0NPTlNUQU5UUy5DQVRFR09SWS5MSVZFOlxuICAgICAgICAgICAgaWYgKHZhcmlhYmxlLm9wZXJhdGlvbiA9PT0gJ3JlYWQnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGVOYW1lID09PSAnZGF0YUJpbmRpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChub2RlVmFsLCBmdW5jdGlvbiAodmFsLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlLmZpbHRlckZpZWxkc1trZXldID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd2YWx1ZSc6IHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFibGUuZmlsdGVyRmllbGRzW25vZGVOYW1lXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd2YWx1ZSc6IG5vZGVWYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAndHlwZScgOiBub2RlVHlwZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiBpZiBhdXRvLXVwZGF0ZSBzZXQgZm9yIHRoZSB2YXJpYWJsZSB3aXRoIHJlYWQgb3BlcmF0aW9uIG9ubHksIGdldCBpdHMgZGF0YSAqL1xuICAgICAgICAgICAgICAgIGlmICh2YXJpYWJsZS5hdXRvVXBkYXRlICYmICFfLmlzVW5kZWZpbmVkKG5vZGVWYWwpICYmIF8uaXNGdW5jdGlvbih2YXJpYWJsZS5saXN0UmVjb3JkcykgJiYgIW5vVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIF9pbnZva2UodmFyaWFibGUsICdsaXN0UmVjb3JkcycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGVOYW1lID09PSAnZGF0YUJpbmRpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlLmlucHV0RmllbGRzID0gbm9kZVZhbDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZS5pbnB1dEZpZWxkc1tub2RlTmFtZV0gPSBub2RlVmFsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiBpZiBhdXRvLXVwZGF0ZSBzZXQgZm9yIHRoZSB2YXJpYWJsZSB3aXRoIHJlYWQgb3BlcmF0aW9uIG9ubHksIGdldCBpdHMgZGF0YSAqL1xuICAgICAgICAgICAgICAgIGlmICh2YXJpYWJsZS5hdXRvVXBkYXRlICYmICFfLmlzVW5kZWZpbmVkKG5vZGVWYWwpICYmIF8uaXNGdW5jdGlvbih2YXJpYWJsZVt2YXJpYWJsZS5vcGVyYXRpb24gKyAnUmVjb3JkJ10pICYmICFub1VwZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBfaW52b2tlKHZhcmlhYmxlLCB2YXJpYWJsZS5vcGVyYXRpb24gKyAnUmVjb3JkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgVkFSSUFCTEVfQ09OU1RBTlRTLkNBVEVHT1JZLlNFUlZJQ0U6XG4gICAgICAgIGNhc2UgVkFSSUFCTEVfQ09OU1RBTlRTLkNBVEVHT1JZLkxPR0lOOlxuICAgICAgICAgICAgaWYgKHZhcmlhYmxlLmF1dG9VcGRhdGUgJiYgIV8uaXNVbmRlZmluZWQobm9kZVZhbCkgJiYgXy5pc0Z1bmN0aW9uKHZhcmlhYmxlLmludm9rZSkgJiYgIW5vVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgX2ludm9rZSh2YXJpYWJsZSwgJ2ludm9rZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgVkFSSUFCTEVfQ09OU1RBTlRTLkNBVEVHT1JZLkRFVklDRTpcbiAgICAgICAgICAgIHZhcmlhYmxlW25vZGVOYW1lXSA9IG5vZGVWYWw7XG4gICAgICAgICAgICBpZiAodmFyaWFibGUuYXV0b1VwZGF0ZSAmJiAhXy5pc1VuZGVmaW5lZChub2RlVmFsKSAmJiBfLmlzRnVuY3Rpb24odmFyaWFibGUuaW52b2tlKSAmJiAhbm9VcGRhdGUpIHtcbiAgICAgICAgICAgICAgICBfaW52b2tlKHZhcmlhYmxlLCAnaW52b2tlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0RGVwZW5kZW5jeSA9ICh0eXBlOiBzdHJpbmcsIHJlZjogYW55KSA9PiB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ2FwcE1hbmFnZXInOlxuICAgICAgICAgICAgYXBwTWFuYWdlciA9IHJlZjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdodHRwJzpcbiAgICAgICAgICAgIGh0dHBTZXJ2aWNlID0gcmVmO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21ldGFkYXRhJzpcbiAgICAgICAgICAgIG1ldGFkYXRhU2VydmljZSA9IHJlZjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICduYXZpZ2F0aW9uU2VydmljZSc6XG4gICAgICAgICAgICBuYXZpZ2F0aW9uU2VydmljZSA9IHJlZjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyb3V0ZXInOlxuICAgICAgICAgICAgcm91dGVyU2VydmljZSA9IHJlZjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0b2FzdGVyJzpcbiAgICAgICAgICAgIHRvYXN0ZXJTZXJ2aWNlID0gIHJlZjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdvQXV0aCc6XG4gICAgICAgICAgICBvYXV0aFNlcnZpY2UgPSAgcmVmO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NlY3VyaXR5JzpcbiAgICAgICAgICAgIHNlY3VyaXR5U2VydmljZSA9ICByZWY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGlhbG9nJzpcbiAgICAgICAgICAgIGRpYWxvZ1NlcnZpY2UgPSByZWY7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgaW5pdGlhdGVDYWxsYmFjayA9ICh0eXBlOiBzdHJpbmcsIHZhcmlhYmxlOiBhbnksIGRhdGE6IGFueSwgb3B0aW9ucz86IGFueSwgc2tpcERlZmF1bHROb3RpZmljYXRpb24/OiBib29sZWFuKSA9PiB7XG5cbiAgICAvKmNoZWNraW5nIGlmIGV2ZW50IGlzIGF2YWlsYWJsZSBhbmQgdmFyaWFibGUgaGFzIGV2ZW50IHByb3BlcnR5IGFuZCB2YXJpYWJsZSBldmVudCBwcm9wZXJ0eSBib3VuZCB0byBmdW5jdGlvbiovXG4gICAgY29uc3QgZXZlbnRWYWx1ZXMgPSB2YXJpYWJsZVt0eXBlXSxcbiAgICAgICAgY2FsbEJhY2tTY29wZSA9IHZhcmlhYmxlLl9jb250ZXh0O1xuICAgIGxldCBlcnJvclZhcmlhYmxlO1xuICAgIC8qKlxuICAgICAqIEZvciBlcnJvciBldmVudDpcbiAgICAgKiB0cmlnZ2VyIGFwcCBsZXZlbCBlcnJvciBoYW5kbGVyLlxuICAgICAqIGlmIG5vIGV2ZW50IGlzIGFzc2lnbmVkLCB0cmlnZ2VyIGRlZmF1bHQgYXBwTm90aWZpY2F0aW9uIHZhcmlhYmxlLlxuICAgICAqL1xuICAgaWYgKHR5cGUgPT09IFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5FUlJPUiAmJiAhc2tpcERlZmF1bHROb3RpZmljYXRpb24pIHtcbiAgICAgICAgaWYgKCFldmVudFZhbHVlcykge1xuICAgICAgICAgICAgLyogaW4gY2FzZSBvZiBlcnJvciwgaWYgbm8gZXZlbnQgYXNzaWduZWQsIGhhbmRsZSB0aHJvdWdoIGRlZmF1bHQgbm90aWZpY2F0aW9uIHZhcmlhYmxlICovXG4gICAgICAgICAgICBlcnJvclZhcmlhYmxlID0gY2FsbEJhY2tTY29wZS5BY3Rpb25zW1ZBUklBQkxFX0NPTlNUQU5UUy5ERUZBVUxUX1ZBUi5OT1RJRklDQVRJT05dO1xuICAgICAgICAgICAgaWYgKGVycm9yVmFyaWFibGUpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gZXJyb3JWYXJpYWJsZS5nZXRNZXNzYWdlKCkgfHwgZGF0YTtcbiAgICAgICAgICAgICAgICBkYXRhID0gXy5pc1N0cmluZyhkYXRhKSA/IGRhdGEgOiAnQW4gZXJyb3IgaGFzIG9jY3VyZWQuIFBsZWFzZSBjaGVjayB0aGUgYXBwIGxvZ3MuJztcbiAgICAgICAgICAgICAgICBlcnJvclZhcmlhYmxlLmludm9rZSh7ICdtZXNzYWdlJyA6IGRhdGF9LCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgIC8vICRyb290U2NvcGUuJGV2YWxBc3luYyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICRyb290U2NvcGUuJGVtaXQoXCJpbnZva2Utc2VydmljZVwiLCBWQVJJQUJMRV9DT05TVEFOVFMuREVGQVVMVF9WQVIuTk9USUZJQ0FUSU9OLCB7c2NvcGU6IGNhbGxCYWNrU2NvcGUsIG1lc3NhZ2U6IHJlc3BvbnNlfSk7XG4gICAgICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gVE9ETzogW1ZpYmh1XSwgY2hlY2sgd2hldGhlciB0byBzdXBwb3J0IGxlZ2FjeSBldmVudCBjYWxsaW5nIG1lY2hhbmlzbSAoaWRlYWxseSwgaXQgc2hvdWxkIGhhdmUgYmVlbiBtaWdyYXRlZClcbiAgICBjb25zdCBmbiA9ICRwYXJzZUV2ZW50KHZhcmlhYmxlW3R5cGVdKTtcbiAgICBpZiAodHlwZSA9PT0gVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkJFRk9SRV9VUERBVEUpIHtcbiAgICAgICAgaWYgKHZhcmlhYmxlLmNhdGVnb3J5ID09PSAnd20uTGl2ZVZhcmlhYmxlJyAmJiB2YXJpYWJsZS5vcGVyYXRpb24gPT09ICdyZWFkJykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHZhcmlhYmxlLl9jb250ZXh0LCB7dmFyaWFibGU6IHZhcmlhYmxlLCBkYXRhRmlsdGVyOiBkYXRhfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZm4odmFyaWFibGUuX2NvbnRleHQsIHt2YXJpYWJsZTogdmFyaWFibGUsIGlucHV0RGF0YTogZGF0YX0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZuKHZhcmlhYmxlLl9jb250ZXh0LCB7dmFyaWFibGU6IHZhcmlhYmxlLCBkYXRhOiBkYXRhLCBvcHRpb25zOiBvcHRpb25zfSk7XG4gICAgfVxufTtcblxuY29uc3QgdHJpZ2dlck9uVGltZW91dCA9IChzdWNjZXNzKSA9PiB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHRyaWdnZXJGbihzdWNjZXNzKTsgfSwgNTAwKTtcbn07XG5cbmNvbnN0IGRvd25sb2FkRmlsZWZyb21SZXNwb25zZSA9IChyZXNwb25zZSwgaGVhZGVycywgc3VjY2VzcywgZXJyb3IpID0+IHtcbiAgICAvLyBjaGVjayBmb3IgYSBmaWxlbmFtZVxuICAgIGxldCBmaWxlbmFtZSA9ICcnLFxuICAgICAgICBmaWxlbmFtZVJlZ2V4LFxuICAgICAgICBtYXRjaGVzLFxuICAgICAgICB0eXBlLFxuICAgICAgICBibG9iLFxuICAgICAgICBVUkwsXG4gICAgICAgIGRvd25sb2FkVXJsLFxuICAgICAgICBwb3B1cDtcbiAgICBjb25zdCBkaXNwb3NpdGlvbiA9IGhlYWRlcnMuZ2V0KCdDb250ZW50LURpc3Bvc2l0aW9uJyk7XG4gICAgaWYgKGRpc3Bvc2l0aW9uICYmIGRpc3Bvc2l0aW9uLmluZGV4T2YoJ2F0dGFjaG1lbnQnKSAhPT0gLTEpIHtcbiAgICAgICAgZmlsZW5hbWVSZWdleCA9IC9maWxlbmFtZVteOz1cXG5dKj0oKFsnXCJdKS4qP1xcMnxbXjtcXG5dKikvO1xuICAgICAgICBtYXRjaGVzID0gZmlsZW5hbWVSZWdleC5leGVjKGRpc3Bvc2l0aW9uKTtcbiAgICAgICAgaWYgKG1hdGNoZXMgIT09IG51bGwgJiYgbWF0Y2hlc1sxXSkge1xuICAgICAgICAgICAgZmlsZW5hbWUgPSBtYXRjaGVzWzFdLnJlcGxhY2UoL1snXCJdL2csICcnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHR5cGUgPSBoZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJyk7XG4gICAgYmxvYiA9IG5ldyBCbG9iKFtyZXNwb25zZV0sIHsgdHlwZTogdHlwZSB9KTtcblxuICAgIGlmICh0eXBlb2Ygd2luZG93Lm5hdmlnYXRvci5tc1NhdmVCbG9iICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyBJRSB3b3JrYXJvdW5kIGZvciBcIkhUTUw3MDA3OiBPbmUgb3IgbW9yZSBibG9iIFVSTHMgd2VyZSByZXZva2VkIGJ5IGNsb3NpbmcgdGhlIGJsb2IgZm9yIHdoaWNoIHRoZXkgd2VyZSBjcmVhdGVkLiBUaGVzZSBVUkxzIHdpbGwgbm8gbG9uZ2VyIHJlc29sdmUgYXMgdGhlIGRhdGEgYmFja2luZyB0aGUgVVJMIGhhcyBiZWVuIGZyZWVkLlwiXG4gICAgICAgIGlmICh3aW5kb3cubmF2aWdhdG9yLm1zU2F2ZUJsb2IoYmxvYiwgZmlsZW5hbWUpKSB7XG4gICAgICAgICAgICB0cmlnZ2VyT25UaW1lb3V0KHN1Y2Nlc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJpZ2dlckZuKGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIFVSTCAgICAgICAgID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMO1xuICAgICAgICBkb3dubG9hZFVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cbiAgICAgICAgaWYgKGZpbGVuYW1lKSB7XG4gICAgICAgICAgICAvLyB1c2UgSFRNTDUgYVtkb3dubG9hZF0gYXR0cmlidXRlIHRvIHNwZWNpZnkgZmlsZW5hbWVcbiAgICAgICAgICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBsZXQgcmVhZGVyO1xuICAgICAgICAgICAgLy8gc2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCB0aGlzIHlldFxuICAgICAgICAgICAgaWYgKHR5cGVvZiBhLmRvd25sb2FkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gcmVhZGVyLnJlc3VsdC5yZXBsYWNlKC9eZGF0YTpbXjtdKjsvLCAnZGF0YTphdHRhY2htZW50L2ZpbGU7Jyk7XG4gICAgICAgICAgICAgICAgICAgIHBvcHVwID0gd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcG9wdXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkID0gdHJpZ2dlck9uVGltZW91dC5iaW5kKHVuZGVmaW5lZCwgc3VjY2Vzcyk7XG4gICAgICAgICAgICAgICAgcmVhZGVyLm9uZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChibG9iKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYS5ocmVmID0gZG93bmxvYWRVcmw7XG4gICAgICAgICAgICAgICAgYS5kb3dubG9hZCA9IGZpbGVuYW1lO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSk7XG4gICAgICAgICAgICAgICAgYS5jbGljaygpO1xuICAgICAgICAgICAgICAgIHRyaWdnZXJPblRpbWVvdXQoc3VjY2Vzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3B1cCA9IHdpbmRvdy5vcGVuKGRvd25sb2FkVXJsLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICBpZiAoIXBvcHVwKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBkb3dubG9hZFVybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyBVUkwucmV2b2tlT2JqZWN0VVJMKGRvd25sb2FkVXJsKTsgfSwgMTAwKTsgLy8gY2xlYW51cFxuICAgIH1cbn07XG5cbmNvbnN0IGdldFNlcnZpY2UgPSAoc2VydmljZU5hbWUpID0+IHtcbiAgICBpZiAoIXNlcnZpY2VOYW1lKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIHNlcnZpY2VOYW1lO1xuICAgIC8vIFRvZG86IFNodWJoYW0sIHVuY29tbWVudCBiZWxvdyBjb2RlXG4gICAgLyogLyEqIGdldCBhIHJlZmVyZW5jZSB0byB0aGUgZWxlbWVudCB3aGVyZSBuZy1hcHAgaXMgZGVmaW5lZCAqIS9cbiAgICAgbGV0IGFwcEVsID0gV00uZWxlbWVudCgnW2lkPW5nLWFwcF0nKSwgaW5qZWN0b3I7XG4gICAgIGlmIChhcHBFbCkge1xuICAgICB0cnkge1xuICAgICBpbmplY3RvciA9IGFwcEVsLmluamVjdG9yKCk7IC8vIGdldCB0aGUgYW5ndWxhciBpbmplY3RvclxuICAgICBpZiAoaW5qZWN0b3IpIHtcbiAgICAgcmV0dXJuIGluamVjdG9yLmdldChzZXJ2aWNlTmFtZSk7IC8vIHJldHVybiB0aGUgc2VydmljZVxuICAgICB9XG4gICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgfVxuICAgICB9Ki9cbn07XG5cbi8qKlxuICogQ29uc3RydWN0IHRoZSBmb3JtIGRhdGEgcGFyYW1zIGZyb20gdGhlIFVSTFxuICogQHBhcmFtIHF1ZXJ5UGFyYW1zXG4gKiBAcGFyYW0gcGFyYW1zXG4gKi9cbmNvbnN0IHNldFBhcmFtc0Zyb21VUkwgPSAocXVlcnlQYXJhbXMsIHBhcmFtcykgPT4ge1xuICAgIHF1ZXJ5UGFyYW1zID0gXy5zcGxpdChxdWVyeVBhcmFtcywgJyYnKTtcbiAgICBfLmZvckVhY2gocXVlcnlQYXJhbXMsIGZ1bmN0aW9uIChwYXJhbSkge1xuICAgICAgICBwYXJhbSA9IF8uc3BsaXQocGFyYW0sICc9Jyk7XG4gICAgICAgIHBhcmFtc1twYXJhbVswXV0gPSBkZWNvZGVVUklDb21wb25lbnQoXy5qb2luKF8uc2xpY2UocGFyYW0sIDEpLCAnPScpKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogW1RvZG86IFNodWJoYW1dLCBJbXBsZW1lbnQgRG93bmxvYWQgdGhyb3VnaCBJIGZyYW1lXG4gKiBTaW11bGF0ZXMgZmlsZSBkb3dubG9hZCBpbiBhbiBhcHAgdGhyb3VnaCBjcmVhdGluZyBhbmQgc3VibWl0dGluZyBhIGhpZGRlbiBmb3JtIGluIERPTS5cbiAqIFRoZSBhY3Rpb24gd2lsbCBiZSBpbml0aWF0ZWQgdGhyb3VnaCBhIFNlcnZpY2UgVmFyaWFibGVcbiAqXG4gKiBRdWVyeSBQYXJhbXNcbiAqIFRoZSByZXF1ZXN0IHBhcmFtcyBsaWtlIHF1ZXJ5IHBhcmFtcyBhcmUgYWRkZWQgYXMgaGlkZGVuIGlucHV0IGVsZW1lbnRzXG4gKlxuICogSGVhZGVyIFBhcmFtc1xuICogVGhlIGhlYWRlciBwYXJhbXMgZm9yIGEgcmVxdWVzdCBhcmUgYWxzbyBhZGRlZCBhbG9uZyB3aXRoIGhpZGRlbiBpbnB1dCBlbGVtZW50cy5cbiAqIFRoaXMgaXMgZG9uZSBhcyBoZWFkZXJzIGNhbiBub3QgYmUgc2V0IGZvciBhIGZvcm0gUE9TVCBjYWxsIGZyb20gSmF2YVNjcmlwdFxuICpcbiAqIEZpbmFsbHksIHJlcXVlc3QgcGFyYW1ldGVycyBhcmUgc2VudCBhcyBmb2xsb3dzOlxuICogRm9yIGEgR0VUIHJlcXVlc3QsIHRoZSByZXF1ZXN0IGRhdGEgaXMgc2VudCBhbG9uZyB3aXRoIHRoZSBxdWVyeSBwYXJhbXMuXG4gKiBGb3IgUE9TVCwgaXQgaXMgc2VudCBhcyByZXF1ZXN0IGJvZHkuXG4gKlxuICogQHBhcmFtIHZhcmlhYmxlOiB0aGUgdmFyaWFibGUgdGhhdCBpcyBjYWxsZWQgZnJvbSB1c2VyIGFjdGlvblxuICogQHBhcmFtIHJlcXVlc3RQYXJhbXMgb2JqZWN0IGNvbnNpc3RpbmcgdGhlIGluZm8gdG8gY29uc3RydWN0IHRoZSBYSFIgcmVxdWVzdCBmb3IgdGhlIHNlcnZpY2VcbiAqL1xuY29uc3QgZG93bmxvYWRUaHJvdWdoSWZyYW1lID0gKHJlcXVlc3RQYXJhbXMsIHN1Y2Nlc3MpID0+IHtcbiAgICAvLyBUb2RvOiBTSHViaGFtOiBVUkwgY29udGFpbnMgJy8vJyBpbiBiZXR3ZWVuIHdoaWNoIHNob3VsZCBiZSBoYW5kbGVkIGF0IHRoZSBVUkwgZm9ybWF0aW9uIG9ubHlcbiAgICBpZiAocmVxdWVzdFBhcmFtcy51cmxbMV0gPT09ICcvJyAmJiByZXF1ZXN0UGFyYW1zLnVybFsyXSA9PT0gJy8nKSB7XG4gICAgICAgIHJlcXVlc3RQYXJhbXMudXJsID0gcmVxdWVzdFBhcmFtcy51cmwuc2xpY2UoMCwgMSkgKyByZXF1ZXN0UGFyYW1zLnVybC5zbGljZSgyKTtcbiAgICB9XG4gICAgbGV0IGlGcmFtZUVsZW1lbnQsXG4gICAgICAgIGZvcm1FbCxcbiAgICAgICAgcGFyYW1FbGVtZW50LFxuICAgICAgICBxdWVyeVBhcmFtcyAgICAgPSAnJztcbiAgICBjb25zdCBJRlJBTUVfTkFNRSAgICAgPSAnZmlsZURvd25sb2FkSUZyYW1lJyxcbiAgICAgICAgRk9STV9OQU1FICAgICAgID0gJ2ZpbGVEb3dubG9hZEZvcm0nLFxuICAgICAgICBDT05URU5UX1RZUEUgICAgPSAnQ29udGVudC1UeXBlJyxcbiAgICAgICAgdXJsICAgICAgICAgICAgID0gcmVxdWVzdFBhcmFtcy51cmwsXG4gICAgICAgIGVuY1R5cGUgICAgICAgICA9IF8uZ2V0KHJlcXVlc3RQYXJhbXMuaGVhZGVycywgQ09OVEVOVF9UWVBFKSxcbiAgICAgICAgcGFyYW1zICAgICAgICAgID0gXy5waWNrQnkocmVxdWVzdFBhcmFtcy5oZWFkZXJzLCBmdW5jdGlvbiAodmFsLCBrZXkpIHtyZXR1cm4ga2V5ICE9PSBDT05URU5UX1RZUEU7IH0pO1xuICAgIC8qIFRvZG86IHNodWJoYW0gOiBkZWZpbmUgZ2V0U2VydmljZSBtZXRob2RcbiAgICAgV1NfQ09OU1RBTlRTICAgID0gZ2V0U2VydmljZSgnV1NfQ09OU1RBTlRTJyk7Ki9cblxuICAgIC8qIGxvb2sgZm9yIGV4aXN0aW5nIGlmcmFtZS4gSWYgZXhpc3RzLCByZW1vdmUgaXQgZmlyc3QgKi9cbiAgICBpRnJhbWVFbGVtZW50ID0gJCgnIycgKyBJRlJBTUVfTkFNRSk7XG4gICAgaWYgKGlGcmFtZUVsZW1lbnQubGVuZ3RoKSB7XG4gICAgICAgIGlGcmFtZUVsZW1lbnQuZmlyc3QoKS5yZW1vdmUoKTtcbiAgICB9XG4gICAgaUZyYW1lRWxlbWVudCA9ICQoJzxpZnJhbWUgaWQ9XCInICsgSUZSQU1FX05BTUUgKyAnXCIgbmFtZT1cIicgKyBJRlJBTUVfTkFNRSArICdcIiBjbGFzcz1cIm5nLWhpZGVcIj48L2lmcmFtZT4nKTtcbiAgICBmb3JtRWwgICAgICAgID0gJCgnPGZvcm0gaWQ9XCInICsgRk9STV9OQU1FICsgJ1wiIG5hbWU9XCInICsgRk9STV9OQU1FICsgJ1wiPjwvZm9ybT4nKTtcbiAgICBmb3JtRWwuYXR0cih7XG4gICAgICAgICd0YXJnZXQnICA6IGlGcmFtZUVsZW1lbnQuYXR0cignbmFtZScpLFxuICAgICAgICAnYWN0aW9uJyAgOiB1cmwsXG4gICAgICAgICdtZXRob2QnICA6IHJlcXVlc3RQYXJhbXMubWV0aG9kLFxuICAgICAgICAnZW5jdHlwZScgOiBlbmNUeXBlXG4gICAgfSk7XG5cbiAgICAvKiBwcm9jZXNzIHF1ZXJ5IHBhcmFtcywgYXBwZW5kIGEgaGlkZGVuIGlucHV0IGVsZW1lbnQgaW4gdGhlIGZvcm0gYWdhaW5zdCBlYWNoIHBhcmFtICovXG4gICAgcXVlcnlQYXJhbXMgKz0gdXJsLmluZGV4T2YoJz8nKSAhPT0gLTEgPyB1cmwuc3Vic3RyaW5nKHVybC5pbmRleE9mKCc/JykgKyAxKSA6ICcnO1xuICAgIHF1ZXJ5UGFyYW1zICs9IGVuY1R5cGUgPT09IFdTX0NPTlNUQU5UUy5DT05URU5UX1RZUEVTLkZPUk1fVVJMX0VOQ09ERUQgPyAoKHF1ZXJ5UGFyYW1zID8gJyYnIDogJycpICsgcmVxdWVzdFBhcmFtcy5kYXRhUGFyYW1zKSA6ICcnO1xuXG4gICAgLy8gRm9yIE5vbiBib2R5IG1ldGhvZHMgb25seSwgc2V0IHRoZSBpbnB1dCBmaWVsZHMgZnJvbSBxdWVyeSBwYXJhbWV0ZXJzXG4gICAgaWYgKF8uaW5jbHVkZXMoV1NfQ09OU1RBTlRTLk5PTl9CT0RZX0hUVFBfTUVUSE9EUywgXy50b1VwcGVyKHJlcXVlc3RQYXJhbXMubWV0aG9kKSkpIHtcbiAgICAgICAgc2V0UGFyYW1zRnJvbVVSTChxdWVyeVBhcmFtcywgcGFyYW1zKTsgLy8gU2V0IHBhcmFtcyBmb3IgVVJMIHF1ZXJ5IHBhcmFtc1xuICAgIH1cbiAgICBzZXRQYXJhbXNGcm9tVVJMKHJlcXVlc3RQYXJhbXMuZGF0YSwgcGFyYW1zKTsgLy8gU2V0IHBhcmFtcyBmb3IgcmVxdWVzdCBkYXRhXG4gICAgXy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gKHZhbCwga2V5KSB7XG4gICAgICAgIHBhcmFtRWxlbWVudCA9ICQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCI+Jyk7XG4gICAgICAgIHBhcmFtRWxlbWVudC5hdHRyKHtcbiAgICAgICAgICAgICduYW1lJyAgOiBrZXksXG4gICAgICAgICAgICAndmFsdWUnIDogdmFsXG4gICAgICAgIH0pO1xuICAgICAgICBmb3JtRWwuYXBwZW5kKHBhcmFtRWxlbWVudCk7XG4gICAgfSk7XG5cbiAgICAvKiBhcHBlbmQgZm9ybSB0byBpRnJhbWUgYW5kIGlGcmFtZSB0byB0aGUgZG9jdW1lbnQgYW5kIHN1Ym1pdCB0aGUgZm9ybSAqL1xuICAgICQoJ2JvZHknKS5hcHBlbmQoaUZyYW1lRWxlbWVudCk7XG5cbiAgICAvLyB0aW1lb3V0IGZvciBJRSAxMCwgaWZyYW1lRWxlbWVudC5jb250ZW50cygpIGlzIGVtcHR5IGluIElFIDEwIHdpdGhvdXQgdGltZW91dFxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpRnJhbWVFbGVtZW50LmNvbnRlbnRzKCkuZmluZCgnYm9keScpLmFwcGVuZChmb3JtRWwpO1xuICAgICAgICBmb3JtRWwuc3VibWl0KCk7XG4gICAgICAgIHRyaWdnZXJGbihzdWNjZXNzKTtcbiAgICB9LCAxMDApO1xufTtcblxuLyoqXG4gKiBNYWtlcyBhbiBYSFIgY2FsbCBhZ2FpbnN0IHRoZSBjb25maWdcbiAqIHRoZSByZXNwb25zZSBpcyBjb252ZXJ0ZWQgaW50byBhIGJsb2IgdXJsLCB3aGljaCBpcyBhc3NpZ25lZCB0byB0aGUgc3JjIGF0dHJpYnV0ZSBvZiBhbiBhbmNob3IgZWxlbWVudCB3aXRoIGRvd25sb2FkPXRydWVcbiAqIGEgY2xpY2sgaXMgc2ltdWxhdGVkIG9uIHRoZSBhbmNob3IgdG8gZG93bmxvYWQgdGhlIGZpbGVcbiAqIEBwYXJhbSBjb25maWdcbiAqIEBwYXJhbSBzdWNjZXNzXG4gKiBAcGFyYW0gZXJyb3JcbiAqL1xuY29uc3QgZG93bmxvYWRUaHJvdWdoQW5jaG9yID0gKGNvbmZpZywgc3VjY2VzcywgZXJyb3IpID0+IHtcbiAgICBjb25zdCB1cmwgICAgID0gY29uZmlnLnVybCxcbiAgICAgICAgbWV0aG9kICA9IGNvbmZpZy5tZXRob2QsXG4gICAgICAgIGRhdGEgICAgPSBjb25maWcuZGF0YVBhcmFtcyB8fCBjb25maWcuZGF0YSxcbiAgICAgICAgaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSBoZWFkZXJzWydDb250ZW50LVR5cGUnXSB8fCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJztcblxuICAgIC8vIFRvZG86IFJlcGxhY2UgaHR0cCB3aXRoIGdldFNlcnZpY2VcbiAgICBodHRwU2VydmljZS5zZW5kKHtcbiAgICAgICAgJ3RhcmdldCcgOiAnV2ViU2VydmljZScsXG4gICAgICAgICdhY3Rpb24nIDogJ2ludm9rZVJ1bnRpbWVSZXN0Q2FsbCcsXG4gICAgICAgICdtZXRob2QnIDogbWV0aG9kLFxuICAgICAgICAndXJsJyAgICA6IHVybCxcbiAgICAgICAgJ2hlYWRlcnMnOiBoZWFkZXJzLFxuICAgICAgICAnZGF0YScgICA6IGRhdGEsXG4gICAgICAgICdyZXNwb25zZVR5cGUnOiAnYXJyYXlidWZmZXInXG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBkb3dubG9hZEZpbGVmcm9tUmVzcG9uc2UocmVzcG9uc2UuYm9keSwgcmVzcG9uc2UuaGVhZGVycywgc3VjY2VzcywgZXJyb3IpO1xuICAgICAgICB9LCA5MDApO1xuICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgdHJpZ2dlckZuKGVycm9yLCBlcnIpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBhcHBlbmRzIGEgdGltZXN0YW1wIG9uIHRoZSBwYXNzZWQgZmlsZW5hbWUgdG8gcHJldmVudCBjYWNoaW5nXG4gKiByZXR1cm5zIHRoZSBtb2RpZmllZCBmaWxlIG5hbWVcbiAqIEBwYXJhbSBmaWxlTmFtZVxuICogQHBhcmFtIGV4cG9ydEZvcm1hdFxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuY29uc3QgZ2V0TW9kaWZpZWRGaWxlTmFtZSA9IChmaWxlTmFtZSwgZXhwb3J0Rm9ybWF0KSA9PiB7XG4gICAgbGV0IGZpbGVFeHRlbnNpb247XG4gICAgY29uc3QgY3VycmVudFRpbWVzdGFtcCA9IERhdGUubm93KCk7XG5cbiAgICBpZiAoZXhwb3J0Rm9ybWF0KSB7XG4gICAgICAgIGZpbGVFeHRlbnNpb24gPSBleHBvcnRUeXBlc01hcFtleHBvcnRGb3JtYXRdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZpbGVFeHRlbnNpb24gPSAnLicgKyBfLmxhc3QoXy5zcGxpdChmaWxlTmFtZSwgJy4nKSk7XG4gICAgICAgIGZpbGVOYW1lID0gXy5yZXBsYWNlKGZpbGVOYW1lLCBmaWxlRXh0ZW5zaW9uLCAnJyk7XG4gICAgfVxuICAgIHJldHVybiBmaWxlTmFtZSArICdfJyArIGN1cnJlbnRUaW1lc3RhbXAgKyBmaWxlRXh0ZW5zaW9uO1xufTtcblxuY29uc3QgZ2V0Q29va2llQnlOYW1lID0gKG5hbWUpID0+IHtcbiAgICAvLyBUb2RvOiBTaHViaGFtIEltcGxlbWVudCBjb29raWUgbmF0aXZlIGpzXG4gICAgcmV0dXJuICdjb29raWUnO1xufTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIGNvb2tpZVZhbHVlIGlmIHhzcmYgaXMgZW5hYmxlZC5cbiAqIEluIGRldmljZSwgeHNyZiBjb29raWUgaXMgc3RvcmVkIGluIGxvY2FsU3RvcmFnZS5cbiAqIEByZXR1cm5zIHhzcmYgY29va2llIHZhbHVlXG4gKi9cbmNvbnN0IGlzWHNyZkVuYWJsZWQgPSAoKSA9PiB7XG4gICAgaWYgKENPTlNUQU5UUy5oYXNDb3Jkb3ZhKSB7XG4gICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShDT05TVEFOVFMuWFNSRl9DT09LSUVfTkFNRSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgb2JqZWN0IG5vZGUgZm9yIGEgYmluZCBvYmplY3QsIHdoZXJlIHRoZSB2YWx1ZSBoYXMgdG8gYmUgdXBkYXRlZFxuICogb2JqLnRhcmdldCA9IFwiYVwiXG4gKiBAcGFyYW0gb2JqXG4gKiBAcGFyYW0gcm9vdFxuICogQHBhcmFtIHZhcmlhYmxlXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuY29uc3QgZ2V0VGFyZ2V0T2JqID0gKG9iaiwgcm9vdCwgdmFyaWFibGUpID0+IHtcbiAgICAvKlxuICAgICAqIGlmIHRoZSB0YXJnZXQga2V5IGlzIGluIHRoZSBmb3JtIGFzIFwiWydteS5wYXJhbSddXCJcbiAgICAgKiBrZWVwIHRoZSB0YXJnZXQga2V5IGFzIFwibXkucGFyYW1cIiBhbmQgZG8gbm90IHNwbGl0IGZ1cnRoZXJcbiAgICAgKiB0aGlzIGlzIGRvbmUsIHNvIHRoYXQsIHRoZSBjb21wdXRlZCB2YWx1ZSBhZ2FpbnN0IHRoaXMgYmluZGluZyBpcyBhc3NpZ25lZCBhc1xuICAgICAqICAgICAge1wibXkucGFyYW1cIjogXCJ2YWx1ZVwifVxuICAgICAqIGFuZCBub3QgYXNcbiAgICAgKiAgICAgIHtcbiAgICAgKiAgICAgICAgICBcIm15XCI6IHtcbiAgICAgKiAgICAgICAgICAgICAgXCJwYXJhbVwiOiBcInZhbHVlXCJcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICB9XG4gICAgICovXG4gICAgbGV0IHRhcmdldCA9IG9iai50YXJnZXQsXG4gICAgICAgIHRhcmdldE9iajtcbiAgICBjb25zdCByb290Tm9kZSA9IHZhcmlhYmxlW3Jvb3RdO1xuICAgIGlmIChET1RfRVhQUl9SRVgudGVzdCh0YXJnZXQpKSB7XG4gICAgICAgIHRhcmdldE9iaiA9IHJvb3ROb2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldC5zdWJzdHIoMCwgdGFyZ2V0Lmxhc3RJbmRleE9mKCcuJykpO1xuICAgICAgICBpZiAob2JqLnRhcmdldCA9PT0gcm9vdCkge1xuICAgICAgICAgICAgdGFyZ2V0T2JqID0gdmFyaWFibGU7XG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0KSB7XG4gICAgICAgICAgICB0YXJnZXRPYmogPSBmaW5kVmFsdWVPZihyb290Tm9kZSwgdGFyZ2V0LCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldE9iaiA9IHJvb3ROb2RlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXRPYmo7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIGtleSBmb3IgdGhlIHRhcmdldCBvYmplY3RcbiAqIHRoZSBjb21wdXRlZCB2YWx1ZSB3aWxsIGJlIHVwZGF0ZWQgYWdhaW5zdCB0aGlzIGtleSBpbiB0aGUgdGFyZ2V0T2JqZWN0KGNvbXB1dGVkIGJ5IGdldFRhcmdldE9iaigpKVxuICogQHBhcmFtIHRhcmdldFxuICogQHBhcmFtIHJlZ2V4XG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuY29uc3QgZ2V0VGFyZ2V0Tm9kZUtleSA9ICh0YXJnZXQpID0+IHtcbiAgICAvKlxuICAgICAqIGlmIHRoZSB0YXJnZXQga2V5IGlzIGluIHRoZSBmb3JtIGFzIFwiWydteS5wYXJhbSddXCJcbiAgICAgKiBrZWVwIHRoZSB0YXJnZXQga2V5IGFzIFwibXkucGFyYW1cIiBhbmQgZG8gbm90IHNwbGl0IGZ1cnRoZXJcbiAgICAgKiB0aGlzIGlzIGRvbmUsIHNvIHRoYXQsIHRoZSBjb21wdXRlZCB2YWx1ZSBhZ2FpbnN0IHRoaXMgYmluZGluZyBpcyBhc3NpZ25lZCBhc1xuICAgICAqICAgICAge1wibXkucGFyYW1cIjogXCJ2YWx1ZVwifVxuICAgICAqIGFuZCBub3QgYXNcbiAgICAgKiAgICAgIHtcbiAgICAgKiAgICAgICAgICBcIm15XCI6IHtcbiAgICAgKiAgICAgICAgICAgICAgXCJwYXJhbVwiOiBcInZhbHVlXCJcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICB9XG4gICAgICovXG4gICAgbGV0IHRhcmdldE5vZGVLZXk7XG4gICAgaWYgKERPVF9FWFBSX1JFWC50ZXN0KHRhcmdldCkpIHtcbiAgICAgICAgdGFyZ2V0Tm9kZUtleSA9IHRhcmdldC5yZXBsYWNlKC9eKFxcW1tcIiddKXwoW1wiJ11cXF0pJC9nLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0Tm9kZUtleSA9IHRhcmdldC5zcGxpdCgnLicpLnBvcCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0Tm9kZUtleTtcbn07XG5cbmNvbnN0IHNldFZhbHVlVG9Ob2RlID0gKHRhcmdldCwgb2JqLCByb290LCB2YXJpYWJsZSwgdmFsdWUsIG5vVXBkYXRlPykgPT4ge1xuICAgIGNvbnN0IHRhcmdldE5vZGVLZXkgPSBnZXRUYXJnZXROb2RlS2V5KHRhcmdldCksXG4gICAgICAgIHRhcmdldE9iaiA9IGdldFRhcmdldE9iaihvYmosIHJvb3QsIHZhcmlhYmxlKTtcbiAgICB2YWx1ZSA9ICFfLmlzVW5kZWZpbmVkKHZhbHVlKSA/IHZhbHVlIDogb2JqLnZhbHVlO1xuICAgIC8qIHNhbml0eSBjaGVjaywgdXNlciBjYW4gYmluZCBwYXJlbnQgbm9kZXMgdG8gbm9uLW9iamVjdCB2YWx1ZXMsIHNvIGNoaWxkIG5vZGUgYmluZGluZ3MgbWF5IGZhaWwgKi9cbiAgICBpZiAodGFyZ2V0T2JqKSB7XG4gICAgICAgIHRhcmdldE9ialt0YXJnZXROb2RlS2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICBwcm9jZXNzVmFyaWFibGVQb3N0QmluZFVwZGF0ZSh0YXJnZXROb2RlS2V5LCB2YWx1ZSwgb2JqLnR5cGUsIHZhcmlhYmxlLCBub1VwZGF0ZSk7XG59O1xuXG4vKipcbiAqIFRoZSBtb2RlbCBpbnRlcm5hbEJvdW5kTm9kZU1hcCBzdG9yZXMgdGhlIHJlZmVyZW5jZSB0byBsYXRlc3QgY29tcHV0ZWQgdmFsdWVzIGFnYWluc3QgaW50ZXJuYWwobmVzdGVkKSBib3VuZCBub2Rlc1xuICogVGhpcyBpcyBkb25lIHNvIHRoYXQgdGhlIGludGVybmFsIG5vZGUncyBjb21wdXRlZCB2YWx1ZSBpcyBub3QgbG9zdCwgb25jZSBpdHMgcGFyZW50IG5vZGUncyB2YWx1ZSBpcyBjb21wdXRlZCBhdCBhIGxhdGVyIHBvaW50XG4gKiBFLmcuXG4gKiBWYXJpYWJsZS5lbXBsb3llZVZhciBoYXMgZm9sbG93aW5nIGJpbmRpbmdzXG4gKiBcImRhdGFCaW5kaW5nXCI6IFtcbiAgICAge1xuICAgICAgICAgXCJ0YXJnZXRcIjogXCJkZXBhcnRtZW50LmJ1ZGdldFwiLFxuICAgICAgICAgXCJ2YWx1ZVwiOiBcImJpbmQ6VmFyaWFibGVzLmJ1ZGdldFZhci5kYXRhU2V0XCJcbiAgICAgfSxcbiAgICAge1xuICAgICAgICAgXCJ0YXJnZXRcIjogXCJkZXBhcnRtZW50XCIsXG4gICAgICAgICBcInZhbHVlXCI6IFwiYmluZDpWYXJpYWJsZXMuZGVwYXJ0bWVudFZhci5kYXRhU2V0XCJcbiAgICAgfVxuIF1cbiAqIFdoZW4gZGVwYXJ0bWVudC5idWRnZXQgaXMgY29tcHV0ZWQsIGVtcGxveWVlVmFyLmRhdGFTZXQgPSB7XG4gKiAgXCJkZXBhcnRtZW50XCI6IHtcbiAqICAgICAgXCJidWRnZXRcIjoge1wicTFcIjogMTExMX1cbiAqICB9XG4gKiB9XG4gKlxuICogV2hlbiBkZXBhcnRtZW50IGlzIGNvbXB1dGVkXG4gKiAgXCJkZXBhcnRtZW50XCI6IHtcbiAqICAgICAgXCJuYW1lXCI6IFwiSFJcIixcbiAqICAgICAgXCJsb2NhdGlvblwiOiBcIkh5ZGVyYWJhZFwiXG4gKiAgfVxuICogVGhlIGJ1ZGdldCBmaWVsZCAoY29tcHV0ZWQgZWFybGllcikgaXMgTE9TVC5cbiAqXG4gKiBUbyBhdm9pZCB0aGlzLCB0aGUgbGF0ZXN0IHZhbHVlcyBhZ2FpbnN0IGludGVybmFsIG5vZGVzIChpbiB0aGlzIGNhc2UgZGVwYXJ0bWVudC5idWRnZXQpIGFyZSBzdG9yZWQgaW4gYSBtYXBcbiAqIFRoZXNlIHZhbHVlcyBhcmUgYXNzaWduZWQgYmFjayB0byBpbnRlcm5hbCBmaWVsZHMgaWYgdGhlIHBhcmVudCBpcyBjb21wdXRlZCAoaW4gdGhpcyBjYXNlIGRlcGFydG1lbnQpXG4gKiBAcGFyYW0gdGFyZ2V0XG4gKiBAcGFyYW0gcm9vdFxuICogQHBhcmFtIHZhcmlhYmxlXG4gKi9cbmNvbnN0IHVwZGF0ZUludGVybmFsTm9kZXMgPSAodGFyZ2V0LCByb290LCB2YXJpYWJsZSkgPT4ge1xuICAgIGNvbnN0IGJvdW5kSW50ZXJuYWxOb2RlcyA9IF8ua2V5cyhfLmdldChpbnRlcm5hbEJvdW5kTm9kZU1hcC5nZXQodmFyaWFibGUpLCBbdmFyaWFibGUubmFtZSwgcm9vdF0pKSxcbiAgICAgICAgdGFyZ2V0Tm9kZUtleSA9IGdldFRhcmdldE5vZGVLZXkodGFyZ2V0KTtcbiAgICBsZXQgaW50ZXJuYWxOb2RlcztcbiAgICBmdW5jdGlvbiBmaW5kSW50ZXJuYWxOb2RlQm91bmQoKSB7XG4gICAgICAgIHJldHVybiBfLmZpbHRlcihib3VuZEludGVybmFsTm9kZXMsIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAvLyB0aGUgbGF0ZXIgY29uZGl0aW9uIGluIGNoZWNrICh0YXJnZXROb2RlS2V5ID09PSByb290IHx8IHRhcmdldE5vZGVLZXkgPT09ICdkYXRhQmluZGluZycpIGlzIHNwZWNpZmljYWxseSBmb3IgbGl2ZSB2YXJpYWJsZSBvZiBpbnNlcnQvdXBkYXRlIHR5cGVzXG4gICAgICAgICAgICByZXR1cm4gKG5vZGUgIT09IHRhcmdldE5vZGVLZXkgJiYgXy5pbmNsdWRlcyhub2RlLCB0YXJnZXROb2RlS2V5KSkgfHwgKCh0YXJnZXROb2RlS2V5ID09PSByb290IHx8IHRhcmdldE5vZGVLZXkgPT09ICdkYXRhQmluZGluZycpICYmIG5vZGUgIT09IHRhcmdldE5vZGVLZXkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW50ZXJuYWxOb2RlcyA9IGZpbmRJbnRlcm5hbE5vZGVCb3VuZCgpO1xuICAgIGlmICgoaW50ZXJuYWxOb2Rlcy5sZW5ndGgpKSB7XG4gICAgICAgIF8uZm9yRWFjaChpbnRlcm5hbE5vZGVzLCBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgc2V0VmFsdWVUb05vZGUobm9kZSwge3RhcmdldDogbm9kZX0sIHJvb3QsIHZhcmlhYmxlLCBfLmdldChpbnRlcm5hbEJvdW5kTm9kZU1hcC5nZXQodmFyaWFibGUpLCBbdmFyaWFibGUubmFtZSwgcm9vdCwgbm9kZV0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBOZXcgSW1wbGVtZW50YXRpb24gKERhdGFCaW5kaW5nIEZsYXQgU3RydWN0dXJlIHdpdGggeC1wYXRoIHRhcmdldHMpXG4gKiBwcm9jZXNzZXMgYSBkYXRhQmluZGluZyBvYmplY3QsIGlmIGJvdW5kIHRvIGV4cHJlc3Npb24sIHdhdGNoZXMgb3ZlciBpdCwgZWxzZSBhc3NpZ25zIHZhbHVlIHRvIHRoZSBleHByZXNzaW9uXG4gKiBAcGFyYW0gb2JqIGRhdGFCaW5kaW5nIG9iamVjdFxuICogQHBhcmFtIHNjb3BlIHNjb3BlIG9mIHRoZSB2YXJpYWJsZVxuICogQHBhcmFtIHJvb3Qgcm9vdCBub2RlIHN0cmluZyAoZGF0YUJpbmRpbmcgZm9yIGFsbCB2YXJpYWJsZXMsIGRhdGFTZXQgZm9yIHN0YXRpYyB2YXJpYWJsZSlcbiAqIEBwYXJhbSB2YXJpYWJsZSB2YXJpYWJsZSBvYmplY3RcbiAqL1xuY29uc3QgcHJvY2Vzc0JpbmRPYmplY3QgPSAob2JqLCBzY29wZSwgcm9vdCwgdmFyaWFibGUpID0+IHtcbiAgICBjb25zdCB0YXJnZXQgPSBvYmoudGFyZ2V0LFxuICAgICAgICB0YXJnZXRPYmogPSBnZXRUYXJnZXRPYmoob2JqLCByb290LCB2YXJpYWJsZSksXG4gICAgICAgIHRhcmdldE5vZGVLZXkgPSBnZXRUYXJnZXROb2RlS2V5KHRhcmdldCksXG4gICAgICAgIHJ1bk1vZGUgPSB0cnVlO1xuICAgIGNvbnN0IGRlc3Ryb3lGbiA9IHNjb3BlLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyID8gc2NvcGUucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIuYmluZChzY29wZSkgOiBfLm5vb3A7XG5cbiAgICBpZiAoc3RyaW5nU3RhcnRzV2l0aChvYmoudmFsdWUsICdiaW5kOicpKSB7XG4gICAgICAgIGRlc3Ryb3lGbihcbiAgICAgICAgICAgICR3YXRjaChvYmoudmFsdWUucmVwbGFjZSgnYmluZDonLCAnJyksIHNjb3BlLCB7fSwgZnVuY3Rpb24gKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKChuZXdWYWwgPT09IG9sZFZhbCAmJiBfLmlzVW5kZWZpbmVkKG5ld1ZhbCkpIHx8IChfLmlzVW5kZWZpbmVkKG5ld1ZhbCkgJiYgKCFfLmlzVW5kZWZpbmVkKG9sZFZhbCkgfHwgIV8uaXNVbmRlZmluZWQodGFyZ2V0T2JqW3RhcmdldE5vZGVLZXldKSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU2tpcCBjbG9uaW5nIGZvciBibG9iIGNvbHVtblxuICAgICAgICAgICAgICAgIGlmICghXy5pbmNsdWRlcyhbJ2Jsb2InLCAnZmlsZSddLCBvYmoudHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsID0gZ2V0Q2xvbmVkT2JqZWN0KG5ld1ZhbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNldFZhbHVlVG9Ob2RlKHRhcmdldCwgb2JqLCByb290LCB2YXJpYWJsZSwgbmV3VmFsKTsgLy8gY2xvbmluZyBuZXdWYWwgdG8ga2VlcCB0aGUgc291cmNlIGNsZWFuXG5cbiAgICAgICAgICAgICAgICBpZiAocnVuTW9kZSkge1xuICAgICAgICAgICAgICAgICAgICAvKnNldCB0aGUgaW50ZXJuYWwgYm91bmQgbm9kZSBtYXAgd2l0aCB0aGUgbGF0ZXN0IHVwZGF0ZWQgdmFsdWUqL1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWludGVybmFsQm91bmROb2RlTWFwLmhhcyh2YXJpYWJsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVybmFsQm91bmROb2RlTWFwLnNldCh2YXJpYWJsZSwge30pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF8uc2V0KGludGVybmFsQm91bmROb2RlTWFwLmdldCh2YXJpYWJsZSksIFt2YXJpYWJsZS5uYW1lLCByb290LCB0YXJnZXRdLCBuZXdWYWwpO1xuICAgICAgICAgICAgICAgICAgICAvKnVwZGF0ZSB0aGUgaW50ZXJuYWwgbm9kZXMgYWZ0ZXIgaW50ZXJuYWwgbm9kZSBtYXAgaXMgc2V0Ki9cbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNPYmplY3QobmV3VmFsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlSW50ZXJuYWxOb2Rlcyh0YXJnZXQsIHJvb3QsIHZhcmlhYmxlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfSBlbHNlIGlmICghXy5pc1VuZGVmaW5lZChvYmoudmFsdWUpKSB7XG4gICAgICAgIHNldFZhbHVlVG9Ob2RlKHRhcmdldCwgb2JqLCByb290LCB2YXJpYWJsZSwgb2JqLnZhbHVlLCB0cnVlKTtcbiAgICAgICAgaWYgKHJ1bk1vZGUgJiYgcm9vdCAhPT0gdGFyZ2V0Tm9kZUtleSkge1xuICAgICAgICAgICAgaWYgKCFpbnRlcm5hbEJvdW5kTm9kZU1hcC5oYXModmFyaWFibGUpKSB7XG4gICAgICAgICAgICAgICAgaW50ZXJuYWxCb3VuZE5vZGVNYXAuc2V0KHZhcmlhYmxlLCB7fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfLnNldChpbnRlcm5hbEJvdW5kTm9kZU1hcC5nZXQodmFyaWFibGUpLCBbdmFyaWFibGUubmFtZSwgcm9vdCwgdGFyZ2V0XSwgb2JqLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFBVQkxJQyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAvL1xuXG4vKipcbiAqIEluaXRpYWxpemVzIHdhdGNoZXJzIGZvciBiaW5kaW5nIGV4cHJlc3Npb25zIGNvbmZpZ3VyZWQgaW4gdGhlIHZhcmlhYmxlXG4gKiBAcGFyYW0gdmFyaWFibGVcbiAqIEBwYXJhbSBjb250ZXh0LCBzY29wZSBjb250ZXh0IGluIHdoaWNoIHRoZSB2YXJpYWJsZSBleGlzdHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBiaW5kU291cmNlLCAgdGhlIGZpZWxkIGluIHZhcmlhYmxlIHdoZXJlIHRoZSBkYXRhYmluZGluZ3MgYXJlIGNvbmZpZ3VyZWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIG1vc3QgdmFyaWFibGVzLCBpdCB3aWxsIGJlICdkYXRhQmluZGluZycsIGhlbmNlIGRlZmF1bHQgZmFsbGJhY2sgaXMgdG8gJ2RhdGFCaW5kaW5nJ1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Igc29tZSBpdCBjYW4gYmUgJ2RhdGFTZXQnIGFuZCBoZW5jZSB3aWxsIGJlIHBhc3NlZCBhcyBwYXJhbVxuICogQHBhcmFtIHtzdHJpbmd9IGJpbmRUYXJnZXQsIHRoZSBvYmplY3QgZmllbGQgaW4gdmFyaWFibGUgd2hlcmUgdGhlIGNvbXB1dGVkIGJpbmRpbmdzIHdpbGwgYmUgc2V0XG4gKi9cbmV4cG9ydCBjb25zdCBwcm9jZXNzQmluZGluZyA9ICh2YXJpYWJsZTogYW55LCBjb250ZXh0OiBhbnksIGJpbmRTb3VyY2U/OiBzdHJpbmcsIGJpbmRUYXJnZXQ/OiBzdHJpbmcpID0+IHtcbiAgICBiaW5kU291cmNlID0gYmluZFNvdXJjZSB8fCAnZGF0YUJpbmRpbmcnO1xuICAgIGJpbmRUYXJnZXQgPSBiaW5kVGFyZ2V0IHx8ICdkYXRhQmluZGluZyc7XG5cbiAgICBjb25zdCBiaW5kTWFwID0gdmFyaWFibGVbYmluZFNvdXJjZV07XG4gICAgdmFyaWFibGVbYmluZFNvdXJjZV0gPSB7fTtcbiAgICB2YXJpYWJsZVsnX2JpbmQnICsgYmluZFNvdXJjZV0gPSBiaW5kTWFwO1xuICAgIGlmICghYmluZE1hcCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGJpbmRNYXAuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAvKiBmb3Igc3RhdGljIHZhcmlhYmxlIGNoYW5nZSB0aGUgYmluZGluZyB3aXRoIHRhcmdldCAnZGF0YUJpbmRpbmcnIHRvICdkYXRhU2V0JywgYXMgdGhlIHJlc3VsdHMgaGF2ZSB0byByZWZsZWN0IGRpcmVjdGx5IGluIHRoZSBkYXRhU2V0ICovXG4gICAgICAgIGlmICh2YXJpYWJsZS5jYXRlZ29yeSA9PT0gJ3dtLlZhcmlhYmxlJyAmJiBub2RlLnRhcmdldCA9PT0gJ2RhdGFCaW5kaW5nJykge1xuICAgICAgICAgICAgbm9kZS50YXJnZXQgPSAnZGF0YVNldCc7XG4gICAgICAgIH1cbiAgICAgICAgcHJvY2Vzc0JpbmRPYmplY3Qobm9kZSwgY29udGV4dCwgYmluZFRhcmdldCwgdmFyaWFibGUpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBEb3dubG9hZHMgYSBmaWxlIGluIHRoZSBicm93c2VyLlxuICogVHdvIG1ldGhvZHMgdG8gZG8gc28sIG5hbWVseTpcbiAqIDEuIGRvd25sb2FkVGhyb3VnaEFuY2hvciwgY2FsbGVkIGlmXG4gKiAgICAgIC0gaWYgYSBoZWFkZXIgaXMgdG8gYmUgcGFzc2VkXG4gKiAgICAgIE9SXG4gKiAgICAgIC0gaWYgc2VjdXJpdHkgaXMgT04gYW5kIFhTUkYgdG9rZW4gaXMgdG8gYmUgc2VudCBhcyB3ZWxsXG4gKiBOT1RFOiBUaGlzIG1ldGhvZCBkb2VzIG5vdCB3b3JrIHdpdGggU2FmYXJpIHZlcnNpb24gMTAuMCBhbmQgYmVsb3dcbiAqXG4gKiAyLiBkb3dubG9hZFRocm91Z2hJZnJhbWVcbiAqICAgICAgLSB0aGlzIG1ldGhvZCB3b3JrcyBhY3Jvc3MgYnJvd3NlcnMgYW5kIHVzZXMgYW4gaWZyYW1lIHRvIGRvd25sYWQgdGhlIGZpbGUuXG4gKiBAcGFyYW0gcmVxdWVzdFBhcmFtcyByZXF1ZXN0IHBhcmFtcyBvYmplY3RcbiAqIEBwYXJhbSBmaWxlTmFtZSByZXByZXNlbnRzIHRoZSBmaWxlIG5hbWVcbiAqIEBwYXJhbSBleHBvcnRGb3JtYXQgZG93bmxvYWRlZCBmaWxlIGZvcm1hdFxuICogQHBhcmFtIHN1Y2Nlc3Mgc3VjY2VzcyBjYWxsYmFja1xuICogQHBhcmFtIGVycm9yIGVycm9yIGNhbGxiYWNrXG4gKi9cbmV4cG9ydCBjb25zdCBzaW11bGF0ZUZpbGVEb3dubG9hZCA9IChyZXF1ZXN0UGFyYW1zLCBmaWxlTmFtZSwgZXhwb3J0Rm9ybWF0LCBzdWNjZXNzLCBlcnJvcikgPT4ge1xuICAgIC8qc3VjY2VzcyBhbmQgZXJyb3IgY2FsbGJhY2tzIGFyZSBleGVjdXRlZCBpbmNhc2Ugb2YgZG93bmxvYWRUaHJvdWdoQW5jaG9yXG4gICAgIER1ZSB0byB0ZWNobmljYWwgbGltaXRhdGlvbiBjYW5ub3QgYmUgZXhlY3V0ZWQgaW5jYXNlIG9mIGlmcmFtZSovXG4gICAgaWYgKENPTlNUQU5UUy5oYXNDb3Jkb3ZhKSB7XG4gICAgICAgIGxldCBmaWxlRXh0ZW5zaW9uO1xuICAgICAgICBpZiAoZXhwb3J0Rm9ybWF0KSB7XG4gICAgICAgICAgICBmaWxlRXh0ZW5zaW9uID0gZXhwb3J0VHlwZXNNYXBbZXhwb3J0Rm9ybWF0XTtcbiAgICAgICAgfVxuICAgICAgICBhcHBNYW5hZ2VyLm5vdGlmeSgnZGV2aWNlLWZpbGUtZG93bmxvYWQnLCB7IHVybDogcmVxdWVzdFBhcmFtcy51cmwsIG5hbWU6IGZpbGVOYW1lLCBleHRlbnNpb246IGZpbGVFeHRlbnNpb24sIHN1Y2Nlc3NDYjogc3VjY2VzcywgZXJyb3JDYjogZXJyb3J9KTtcbiAgICB9IGVsc2UgaWYgKCFfLmlzRW1wdHkocmVxdWVzdFBhcmFtcy5oZWFkZXJzKSB8fCBpc1hzcmZFbmFibGVkKCkpIHtcbiAgICAgICAgZG93bmxvYWRUaHJvdWdoQW5jaG9yKHJlcXVlc3RQYXJhbXMsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb3dubG9hZFRocm91Z2hJZnJhbWUocmVxdWVzdFBhcmFtcywgc3VjY2Vzcyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBzZXRzIHRoZSB2YWx1ZSBhZ2FpbnN0IHBhc3NlZCBrZXkgb24gdGhlIFwiaW5wdXRGaWVsZHNcIiBvYmplY3QgaW4gdGhlIHZhcmlhYmxlXG4gKiBAcGFyYW0gdGFyZ2V0T2JqOiB0aGUgb2JqZWN0IGluIHdoaWNoIHRoZSBrZXksIHZhbHVlIGlzIHRvIGJlIHNldFxuICogQHBhcmFtIHZhcmlhYmxlXG4gKiBAcGFyYW0ga2V5OiBjYW4gYmU6XG4gKiAgLSBhIHN0cmluZyBlLmcuIFwidXNlcm5hbWVcIlxuICogIC0gYW4gb2JqZWN0LCBlLmcuIHtcInVzZXJuYW1lXCI6IFwiam9oblwiLCBcInNzblwiOiBcIjExMTExXCJ9XG4gKiBAcGFyYW0gdmFsXG4gKiAtIGlmIGtleSBpcyBzdHJpbmcsIHRoZSB2YWx1ZSBhZ2FpbnN0IGl0IChmb3IgdGhhdCBkYXRhIHR5cGUpXG4gKiAtIGlmIGtleSBpcyBvYmplY3QsIG5vdCByZXF1aXJlZFxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEByZXR1cm5zIHthbnl9XG4gKi9cbmV4cG9ydCBjb25zdCBzZXRJbnB1dCA9ICh0YXJnZXRPYmo6IGFueSwga2V5OiBhbnksIHZhbDogYW55LCBvcHRpb25zOiBhbnkpID0+IHtcbiAgICB0YXJnZXRPYmogPSB0YXJnZXRPYmogfHwge307XG4gICAgbGV0IGtleXMsXG4gICAgICAgIGxhc3RLZXksXG4gICAgICAgIHBhcmFtT2JqID0ge307XG5cbiAgICAvLyBjb250ZW50IHR5cGUgY2hlY2tcbiAgICBpZiAoXy5pc09iamVjdChvcHRpb25zKSkge1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZmlsZSc6XG4gICAgICAgICAgICAgICAgdmFsID0gZ2V0QmxvYih2YWwsIG9wdGlvbnMuY29udGVudFR5cGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgICAgICB2YWwgPSBfLmlzTnVtYmVyKHZhbCkgPyB2YWwgOiBwYXJzZUludCh2YWwsIDEwKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChfLmlzT2JqZWN0KGtleSkpIHtcbiAgICAgICAgLy8gY2hlY2sgaWYgdGhlIHBhc3NlZCBwYXJhbWV0ZXIgaXMgYW4gb2JqZWN0IGl0c2VsZlxuICAgICAgICBwYXJhbU9iaiA9IGtleTtcbiAgICB9IGVsc2UgaWYgKGtleS5pbmRleE9mKCcuJykgPiAtMSkge1xuICAgICAgICAvLyBjaGVjayBmb3IgJy4nIGluIGtleSBlLmcuICdlbXBsb3llZS5kZXBhcnRtZW50J1xuICAgICAgICBrZXlzID0ga2V5LnNwbGl0KCcuJyk7XG4gICAgICAgIGxhc3RLZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICAvLyBGaW5kaW5nIHRoZSBvYmplY3QgYmFzZWQgb24gdGhlIGtleVxuICAgICAgICB0YXJnZXRPYmogPSBmaW5kVmFsdWVPZih0YXJnZXRPYmosIGtleXMuam9pbignLicpLCB0cnVlKTtcbiAgICAgICAga2V5ID0gbGFzdEtleTtcbiAgICAgICAgcGFyYW1PYmpba2V5XSA9IHZhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwYXJhbU9ialtrZXldID0gdmFsO1xuICAgIH1cblxuICAgIF8uZm9yRWFjaChwYXJhbU9iaiwgZnVuY3Rpb24gKHBhcmFtVmFsLCBwYXJhbUtleSkge1xuICAgICAgICB0YXJnZXRPYmpbcGFyYW1LZXldID0gcGFyYW1WYWw7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRhcmdldE9iajtcbn07XG5cbi8qKlxuICogcmV0dXJucyB0cnVlIGlmIEhUTUw1IEZpbGUgQVBJIGlzIGF2YWlsYWJsZSBlbHNlIGZhbHNlXG4gKiBAcmV0dXJucyB7e3Byb3RvdHlwZTogQmxvYjsgbmV3KGJsb2JQYXJ0cz86IGFueVtdLCBvcHRpb25zPzogQmxvYlByb3BlcnR5QmFnKTogQmxvYn19XG4gKi9cbmV4cG9ydCBjb25zdCBpc0ZpbGVVcGxvYWRTdXBwb3J0ZWQgPSAoKSA9PiB7XG4gICAgcmV0dXJuICh3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IpO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHZhck9yZGVyXG4gKiBAcGFyYW0gb3B0aW9uc09yZGVyXG4gKiBAcmV0dXJucyB7YW55fVxuICovXG5leHBvcnQgY29uc3QgZ2V0RXZhbHVhdGVkT3JkZXJCeSA9ICh2YXJPcmRlciwgb3B0aW9uc09yZGVyKSA9PiB7XG4gICAgbGV0IG9wdGlvbkZpZWxkcyxcbiAgICAgICAgdmFyT3JkZXJCeTtcbiAgICAvLyBJZiBvcHRpb25zIG9yZGVyIGJ5IGlzIG5vdCBkZWZpbmVkLCByZXR1cm4gdmFyaWFibGUgb3JkZXJcbiAgICBpZiAoIW9wdGlvbnNPcmRlciB8fCBfLmlzRW1wdHkob3B0aW9uc09yZGVyKSkge1xuICAgICAgICByZXR1cm4gdmFyT3JkZXI7XG4gICAgfVxuICAgIC8vIElmIHZhcmlhYmxlIG9yZGVyIGJ5IGlzIG5vdCBkZWZpbmVkLCByZXR1cm4gb3B0aW9ucyBvcmRlclxuICAgIGlmICghdmFyT3JkZXIpIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbnNPcmRlcjtcbiAgICB9XG4gICAgLy8gSWYgYm90aCBhcmUgcHJlc2VudCwgY29tYmluZSB0aGUgb3B0aW9ucyBvcmRlciBhbmQgdmFyaWFibGUgb3JkZXIsIHdpdGggb3B0aW9ucyBvcmRlciBhcyBwcmVjZWRlbmNlXG4gICAgdmFyT3JkZXIgICAgID0gXy5zcGxpdCh2YXJPcmRlciwgJywnKTtcbiAgICBvcHRpb25zT3JkZXIgPSBfLnNwbGl0KG9wdGlvbnNPcmRlciwgJywnKTtcbiAgICBvcHRpb25GaWVsZHMgPSBfLm1hcChvcHRpb25zT3JkZXIsIGZ1bmN0aW9uIChvcmRlcikge1xuICAgICAgICByZXR1cm4gXy5zcGxpdChfLnRyaW0ob3JkZXIpLCAnICcpWzBdO1xuICAgIH0pO1xuICAgIC8vIElmIGEgZmllbGQgaXMgcHJlc2VudCBpbiBib3RoIG9wdGlvbnMgYW5kIHZhcmlhYmxlLCByZW1vdmUgdGhlIHZhcmlhYmxlIG9yZGVyYnlcbiAgICBfLnJlbW92ZSh2YXJPcmRlciwgZnVuY3Rpb24gKG9yZGVyQnkpIHtcbiAgICAgICAgcmV0dXJuIF8uaW5jbHVkZXMob3B0aW9uRmllbGRzLCBfLnNwbGl0KF8udHJpbShvcmRlckJ5KSwgJyAnKVswXSk7XG4gICAgfSk7XG4gICAgdmFyT3JkZXJCeSA9IHZhck9yZGVyLmxlbmd0aCA/ICcsJyArIF8uam9pbih2YXJPcmRlciwgJywnKSA6ICcnO1xuICAgIHJldHVybiBfLmpvaW4ob3B0aW9uc09yZGVyLCAnLCcpICsgdmFyT3JkZXJCeTtcbn07XG5cbi8qKlxuICogZm9ybWF0dGluZyB0aGUgZXhwcmVzc2lvbiBhcyByZXF1aXJlZCBieSBiYWNrZW5kIHdoaWNoIHdhcyBlbmNsb3NlZCBieSAkezxleHByZXNzaW9uPn0uXG4gKiBAcGFyYW0gZmllbGREZWZzXG4gKiByZXR1cm5zIGZpZWxkRGVmc1xuICovXG5leHBvcnQgY29uc3QgZm9ybWF0RXhwb3J0RXhwcmVzc2lvbiA9IGZpZWxkRGVmcyA9PiB7XG4gICAgXy5mb3JFYWNoKGZpZWxkRGVmcywgZnVuY3Rpb24gKGZpZWxkRGVmKSB7XG4gICAgICAgIGlmIChmaWVsZERlZi5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICBmaWVsZERlZi5leHByZXNzaW9uID0gJyR7JyArIGZpZWxkRGVmLmV4cHJlc3Npb24gKyAnfSc7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZmllbGREZWZzO1xufTtcblxuZXhwb3J0IGNvbnN0IGRlYm91bmNlVmFyaWFibGVDYWxsID0gX2ludm9rZTtcblxuY29uc3QgZ2V0RGF0ZVRpbWVGb3JtYXRGb3JUeXBlID0gKHR5cGUpID0+IHtcbiAgICByZXR1cm4gREVGQVVMVF9GT1JNQVRTW18udG9VcHBlcih0eXBlKV07XG59O1xuXG4vLyBGb3JtYXQgdmFsdWUgZm9yIGRhdGV0aW1lIHR5cGVzXG5jb25zdCBfZm9ybWF0RGF0ZSA9IChkYXRlVmFsdWUsIHR5cGUpID0+IHtcbiAgICBsZXQgZXBvY2g7XG4gICAgaWYgKF8uaXNEYXRlKGRhdGVWYWx1ZSkpIHtcbiAgICAgICAgZXBvY2ggPSBkYXRlVmFsdWUuZ2V0VGltZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghaXNOYU4oZGF0ZVZhbHVlKSkge1xuICAgICAgICAgICAgZGF0ZVZhbHVlID0gcGFyc2VJbnQoZGF0ZVZhbHVlLCAxMCk7XG4gICAgICAgIH1cbiAgICAgICAgZXBvY2ggPSBkYXRlVmFsdWUgJiYgbW9tZW50KGRhdGVWYWx1ZSkudmFsdWVPZigpO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PT0gRGF0YVR5cGUuVElNRVNUQU1QKSB7XG4gICAgICAgIHJldHVybiBlcG9jaDtcbiAgICB9XG4gICAgaWYgKHR5cGUgPT09IERhdGFUeXBlLlRJTUUgJiYgIWVwb2NoKSB7XG4gICAgICAgIGVwb2NoID0gbW9tZW50KG5ldyBEYXRlKCkudG9EYXRlU3RyaW5nKCkgKyAnICcgKyBkYXRlVmFsdWUpLnZhbHVlT2YoKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGVWYWx1ZSAmJiBhcHBNYW5hZ2VyLmdldFBpcGUoJ2RhdGUnKS50cmFuc2Zvcm0oZXBvY2gsIGdldERhdGVUaW1lRm9ybWF0Rm9yVHlwZSh0eXBlKSk7XG59O1xuXG4vLyBGdW5jdGlvbiB0byBjb252ZXJ0IHZhbHVlcyBvZiBkYXRlIHRpbWUgdHlwZXMgaW50byBkZWZhdWx0IGZvcm1hdHNcbmV4cG9ydCBjb25zdCBmb3JtYXREYXRlID0gKHZhbHVlLCB0eXBlKSA9PiB7XG4gICAgaWYgKF8uaW5jbHVkZXModHlwZSwgJy4nKSkge1xuICAgICAgICB0eXBlID0gXy50b0xvd2VyKGV4dHJhY3RUeXBlKHR5cGUpKTtcbiAgICB9XG4gICAgaWYgKF8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIF8ubWFwKHZhbHVlLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Zvcm1hdERhdGUodmFsLCB0eXBlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBfZm9ybWF0RGF0ZSh2YWx1ZSwgdHlwZSk7XG59O1xuIl19