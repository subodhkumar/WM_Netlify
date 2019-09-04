import { $WebSocket } from 'angular2-websocket/angular2-websocket';
import { Router } from '@angular/router';
import { __extends } from 'tslib';
import { extractType, DataType, DEFAULT_FORMATS, $parseEvent, $watch, findValueOf, getBlob, getClonedObject, stringStartsWith, triggerFn, isDateTimeType, isDefined, replace, $invokeWatchers, getValidJSON, isPageable, isValidWebURL, noop, xmlToJson, hasCordova, isNumberType, removeExtraSlashes, processFilterExpBindNode, isInsecureContentRequest, isObject, DataSource, AbstractHttpService, AbstractDialogService, AbstractNavigationService, AbstractToasterService } from '@wm/core';
import { Injectable, NgModule } from '@angular/core';
import { CommonModule, HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { HttpServiceModule } from '@wm/http';
import { SecurityService, SecurityModule } from '@wm/security';
import { OAuthService, OAuthModule } from '@wm/oAuth';

var CONSTANTS = {
    hasCordova: window['cordova'] !== undefined,
    isWaveLens: window['WaveLens'] !== undefined,
    isStudioMode: false,
    isRunMode: true,
    XSRF_COOKIE_NAME: 'wm_xsrf_token',
    DEFAULT_TIMER_DELAY: 500,
    WIDGET_DOESNT_EXIST: 'The widget you\'re trying to navigate to doesn\'t exist on this page'
};
var VARIABLE_CONSTANTS = {
    CATEGORY: {
        MODEL: 'wm.Variable',
        LIVE: 'wm.LiveVariable',
        SERVICE: 'wm.ServiceVariable',
        WEBSOCKET: 'wm.WebSocketVariable',
        NAVIGATION: 'wm.NavigationVariable',
        NOTIFICATION: 'wm.NotificationVariable',
        TIMER: 'wm.TimerVariable',
        LOGIN: 'wm.LoginVariable',
        LOGOUT: 'wm.LogoutVariable',
        DEVICE: 'wm.DeviceVariable'
    },
    EVENTS: ['onBefore',
        'onBeforeUpdate',
        'onResult',
        'onBeforeOpen',
        'onOpen',
        'onBeforeMessageSend',
        'onMessageReceive',
        'onProgress',
        'onError',
        'onBeforeDatasetReady',
        'onCanUpdate',
        'onClick',
        'onHide',
        'onOk',
        'onCancel',
        'onBeforeClose',
        'onClose',
        'onTimerFire',
        'onSuccess',
        'onOnline',
        'onOffline'],
    EVENT: {
        'CAN_UPDATE': 'onCanUpdate',
        'BEFORE': 'onBefore',
        'BEFORE_UPDATE': 'onBeforeUpdate',
        'PREPARE_SETDATA': 'onBeforeDatasetReady',
        'RESULT': 'onResult',
        'ERROR': 'onError',
        'ABORT': 'onAbort',
        'PROGRESS': 'onProgress',
        'CLICK': 'onClick',
        'HIDE': 'onHide',
        'OK': 'onOk',
        'CANCEL': 'onCancel',
        'CLOSE': 'onClose',
        'TIMER_FIRE': 'onTimerFire',
        'SUCCESS': 'onSuccess',
        'BEFORE_OPEN': 'onBeforeOpen',
        'OPEN': 'onOpen',
        'BEFORE_SEND': 'onBeforeMessageSend',
        'MESSAGE_RECEIVE': 'onMessageReceive',
        'BEFORE_CLOSE': 'onBeforeClose'
    },
    OWNER: {
        'APP': 'App',
        'PAGE': 'Page'
    },
    REST_SUPPORTED_SERVICES: ['JavaService', 'SoapService', 'FeedService', 'RestService', 'SecurityServiceType', 'DataService', 'WebSocketService'],
    PAGINATION_PARAMS: ['page', 'size', 'sort'],
    REST_SERVICE: {
        'BASE_PATH_KEY': 'x-WM-BASE_PATH',
        'RELATIVE_PATH_KEY': 'x-WM-RELATIVE_PATH',
        'OAUTH_PROVIDER_KEY': 'x-WM-PROVIDER_ID',
        'AUTH_HDR_KEY': 'Authorization',
        'SECURITY_DEFN': {
            'BASIC': 'basic',
            'OAUTH2': 'oauth2',
        },
        'AUTH_TYPE': {
            'BASIC': 'BASIC',
            'OAUTH': 'OAUTH2',
            'NONE': 'NONE',
        },
        'CONTENT_TYPE_KEY': 'x-WM-CONTENT_TYPE',
        'ACCESSTOKEN_PLACEHOLDER': {
            'LEFT': '',
            'RIGHT': '.access_token'
        },
        ERR_TYPE: {
            NO_ACCESSTOKEN: 'missing_accesstoken',
            NO_CREDENTIALS: 'no_credentials',
            METADATA_MISSING: 'metadata_missing',
            USER_UNAUTHORISED: 'user_unauthorised',
            REQUIRED_FIELD_MISSING: 'required_field_missing',
        },
        ERR_MSG: {
            NO_ACCESSTOKEN: 'Access token missing',
            NO_CREDENTIALS: 'No credentials present',
            METADATA_MISSING: 'Metadata missing',
            USER_UNAUTHORISED: 'Unauthorized User',
            REQUIRED_FIELD_MISSING: 'Required field(s) missing: "${0}"'
        },
        UNCLOAKED_HEADERS: ['CONTENT-TYPE', 'ACCEPT', 'CONTENT-LENGTH', 'ACCEPT-ENCODING', 'ACCEPT-LANGUAGE'],
        PREFIX: {
            AUTH_HDR_VAL: {
                BASIC: 'Basic',
                OAUTH: 'Bearer'
            },
            CLOAK_HEADER_KEY: 'X-WM-'
        }
    },
    SERVICE_TYPE: {
        JAVA: 'JavaService',
        REST: 'RestService',
        SOAP: 'SoapService',
        FEED: 'FeedService',
        DATA: 'DataService',
        SECURITY: 'SecurityServiceType',
        WEBSOCKET: 'WebSocketService',
    },
    CONTROLLER_TYPE: {
        QUERY: 'QueryExecution',
        PROCEDURE: 'ProcedureExecution'
    },
    HTTP_STATUS_CODE: {
        CORS_FAILURE: -1,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403
    },
    EXPORT_TYPES_MAP: {
        'EXCEL': '.xlsx',
        'CSV': '.csv'
    },
    DEFAULT_VAR: {
        'NOTIFICATION': 'appNotification'
    }
};
var WS_CONSTANTS = {
    NON_BODY_HTTP_METHODS: ['GET', 'HEAD'],
    CONTENT_TYPES: {
        FORM_URL_ENCODED: 'application/x-www-form-urlencoded',
        MULTIPART_FORMDATA: 'multipart/form-data',
        OCTET_STREAM: 'application/octet-stream'
    }
};
var DB_CONSTANTS = {
    'DATABASE_MATCH_MODES': {
        'like': 'LIKE',
        'start': 'STARTING_WITH',
        'startignorecase': 'STARTING_WITH_IGNORECASE',
        'end': 'ENDING_WITH',
        'endignorecase': 'ENDING_WITH_IGNORECASE',
        'anywhere': 'CONTAINING',
        'anywhereignorecase': 'CONTAINING_IGNORECASE',
        'exact': 'EQUALS',
        'exactignorecase': 'EQUALS_IGNORECASE',
        'notequals': 'NOT_EQUALS',
        "notequalsignorecase": "NOT_EQUALS_IGNORECASE",
        'between': 'BETWEEN',
        'in': 'IN',
        "notin": "NOTIN",
        'lessthan': 'LESS_THAN',
        'lessthanequal': 'LESS_THAN_OR_EQUALS',
        'greaterthan': 'GREATER_THAN',
        'greaterthanequal': 'GREATER_THAN_OR_EQUALS',
        'null': 'NULL',
        'isnotnull': 'IS_NOT_NULL',
        'empty': 'EMPTY',
        'isnotempty': 'IS_NOT_EMPTY',
        'nullorempty': 'NULL_OR_EMPTY'
    },
    'DATABASE_EMPTY_MATCH_MODES': ['NULL', 'IS_NOT_NULL', 'EMPTY', 'IS_NOT_EMPTY', 'NULL_OR_EMPTY'],
    'DATABASE_RANGE_MATCH_MODES': ['IN', 'NOTIN', 'BETWEEN', 'LESS_THAN', 'LESS_THAN_OR_EQUALS', 'GREATER_THAN', 'GREATER_THAN_OR_EQUALS', 'NOT_EQUALS'],
    'DATABASE_NULL_EMPTY_MATCH': {
        'NULL': 'NULL',
        'IS_NOT_NULL': 'IS_NOT_NULL',
        'EMPTY': 'NULL',
        'IS_NOT_EMPTY': 'IS_NOT_NULL',
        'NULL_OR_EMPTY': 'NULL'
    },
    'DATABASE_MATCH_MODES_WITH_QUERY': {
        'LIKE': '${0} like ${1}',
        'STARTING_WITH': '${0} like ${1}',
        'STARTING_WITH_IGNORECASE': '${0} like ${1}',
        'ENDING_WITH': '${0} like ${1}',
        'ENDING_WITH_IGNORECASE': '${0} like ${1}',
        'CONTAINING': '${0} like ${1}',
        'CONTAINING_IGNORECASE': '${0} like ${1}',
        'EQUALS': '${0}=${1}',
        'EQUALS_IGNORECASE': '${0}=${1}',
        'NOT_EQUALS': '${0}!=${1}',
        "NOT_EQUALS_IGNORECASE": "${0}!=${1}",
        'BETWEEN': '${0} between ${1}',
        'IN': '${0} in ${1}',
        'NOTIN': "${0} not in ${1}",
        'LESS_THAN': '${0}<${1}',
        'LESS_THAN_OR_EQUALS': '${0}<=${1}',
        'GREATER_THAN': '${0}>${1}',
        'GREATER_THAN_OR_EQUALS': '${0}>=${1}',
        'NULL': '${0} is null',
        'IS_NOT_NULL': '${0} is not null',
        'EMPTY': '${0}=\'\'',
        'IS_NOT_EMPTY': '${0}<>\'\'',
        'NULL_OR_EMPTY': '${0} is null or ${0}=\'\''
    },
    'DATABASE_STRING_MODES': ['LIKE', 'STARTING_WITH', 'STARTING_WITH_IGNORECASE', 'ENDING_WITH', 'ENDING_WITH_IGNORECASE', 'CONTAINING', 'CONTAINING_IGNORECASE', 'EQUALS', 'EQUALS_IGNORECASE', 'NOT_EQUALS', "NOT_EQUALS_IGNORECASE"]
};
var SWAGGER_CONSTANTS = {
    WM_DATA_JSON: 'wm_data_json',
    WM_HTTP_JSON: 'wm_httpRequestDetails'
};
var VARIABLE_URLS = {
    DATABASE: {
        searchTableData: {
            url: '/:service/:dataModelName/:entityName/search?page=:page&size=:size&:sort',
            method: 'POST'
        },
        searchTableDataWithQuery: {
            url: '/:service/:dataModelName/:entityName/filter?page=:page&size=:size&:sort',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        },
        readTableData: {
            url: '/:service/:dataModelName/:entityName?page=:page&size=:size&:sort',
            method: 'GET'
        },
        insertTableData: {
            url: '/:service/:dataModelName/:entityName',
            method: 'POST'
        },
        insertMultiPartTableData: {
            url: '/:service/:dataModelName/:entityName',
            method: 'POST',
            headers: {}
            // ,transformRequest: WM.identity
        },
        updateTableData: {
            url: '/:service/:dataModelName/:entityName/:id',
            method: 'PUT'
        },
        updateMultiPartTableData: {
            url: '/:service/:dataModelName/:entityName/:id',
            method: 'POST',
            headers: {}
            // ,transformRequest: WM.identity
        },
        deleteTableData: {
            url: '/:service/:dataModelName/:entityName/:id',
            method: 'DELETE'
        },
        updateCompositeTableData: {
            url: '/:service/:dataModelName/:entityName/composite-id?:id',
            method: 'PUT'
        },
        periodUpdateCompositeTableData: {
            url: '/:service/:dataModelName/:entityName/composite-id/periods?:id',
            method: 'PUT'
        },
        updateMultiPartCompositeTableData: {
            url: '/:service/:dataModelName/:entityName/composite-id?:id',
            method: 'POST',
            headers: {}
            // , transformRequest: WM.identity
        },
        deleteCompositeTableData: {
            url: '/:service/:dataModelName/:entityName/composite-id?:id',
            method: 'DELETE'
        },
        periodDeleteCompositeTableData: {
            url: '/:service/:dataModelName/:entityName/composite-id/periods?:id',
            method: 'DELETE'
        },
        getDistinctDataByFields: {
            url: '/:service/:dataModelName/:entityName/aggregations?page=:page&size=:size&:sort',
            method: 'POST'
        },
        exportTableData: {
            url: '/services/:dataModelName/:entityName/export?:sort',
            method: 'POST'
        },
        readTableRelatedData: {
            url: '/:service/:dataModelName/:entityName/:id/:relatedFieldName?page=:page&size=:size&:sort',
            method: 'GET'
        },
        executeNamedQuery: {
            url: '/:service/:dataModelName/queryExecutor/queries/:queryName?page=:page&size=:size&:queryParams',
            method: 'GET'
        },
        executeCustomQuery: {
            url: '/:service/:dataModelName/queries/execute?page=:page&size=:size',
            method: 'POST'
        },
        executeAggregateQuery: {
            url: '/services/:dataModelName/:entityName/aggregations?page=:page&size=:size&sort=:sort',
            method: 'POST'
        },
        executeNamedProcedure: {
            url: '/:service/:dataModelName/procedureExecutor/procedure/execute/:procedureName?page=:page&size=:size&:procedureParams',
            method: 'GET'
        },
        countTableDataWithQuery: {
            url: '/:service/:dataModelName/:entityName/count',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    },
    oauthConfiguration: {
        getAuthorizationUrl: {
            url: 'services/oauth2/:providerId/authorizationUrl',
            method: 'GET'
        }
    }
};
var $rootScope = {
    project: {
        deployedUrl: './',
        id: 'temp_id'
    },
    projectName: 'test_project_name',
    isApplicationType: true
};

var exportTypesMap = { 'EXCEL': '.xlsx', 'CSV': '.csv' };
var appManager;
var httpService;
var metadataService;
var navigationService;
var routerService;
var toasterService;
var oauthService;
var securityService;
var dialogService;
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
var setDependency = function (type, ref) {
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
var initiateCallback = function (type, variable, data, options, skipDefaultNotification) {
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
    var target = obj.target, targetObj = getTargetObj(obj, root, variable), targetNodeKey = getTargetNodeKey(target);
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
            {
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
        if (root !== targetNodeKey) {
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
var processBinding = function (variable, context, bindSource, bindTarget) {
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
var simulateFileDownload = function (requestParams, fileName, exportFormat, success, error) {
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
var setInput = function (targetObj, key, val, options) {
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
var isFileUploadSupported = function () {
    return (window.File && window.FileReader && window.FileList && window.Blob);
};
/**
 *
 * @param varOrder
 * @param optionsOrder
 * @returns {any}
 */
var getEvaluatedOrderBy = function (varOrder, optionsOrder) {
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
var formatExportExpression = function (fieldDefs) {
    _.forEach(fieldDefs, function (fieldDef) {
        if (fieldDef.expression) {
            fieldDef.expression = '${' + fieldDef.expression + '}';
        }
    });
    return fieldDefs;
};
var debounceVariableCall = _invoke;
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
var formatDate = function (value, type) {
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

var BaseVariableManager = /** @class */ (function () {
    function BaseVariableManager() {
    }
    BaseVariableManager.prototype.initBinding = function (variable, bindSource, bindTarget) {
        processBinding(variable, variable._context, bindSource, bindTarget);
    };
    BaseVariableManager.prototype.notifyInflight = function (variable, status, data) {
        appManager.notify('toggle-variable-state', {
            variable: variable,
            active: status,
            data: data
        });
    };
    /**
     * This method makes the final angular http call that returns an observable.
     * We attach this observable to variable to cancel a network call
     * @param requestParams
     * @param variable
     * @param dbOperation
     */
    BaseVariableManager.prototype.httpCall = function (requestParams, variable, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            variable._observable = httpService.sendCallAsObservable(requestParams, params).subscribe(function (response) {
                if (response && response.type) {
                    resolve(response);
                }
            }, function (err) {
                if (httpService.isPlatformSessionTimeout(err)) {
                    // send the notification manually to hide any context spinners on page.
                    // [TODO]: any spinners on widget listening on this variable will also go off. Need to see an approach to sovle that.
                    _this.notifyInflight(variable, false, err);
                    err._401Subscriber.asObservable().subscribe(function (response) { return resolve(response); }, function (e) { return reject(e); });
                }
                else {
                    reject(err);
                }
            });
        });
    };
    /**
     * This method prepares the options parameter for variable callbacks.
     * @param xhrObj, The xhrObj to be passed
     * @param moreOptions, any other info to be passed in the options param
     */
    BaseVariableManager.prototype.prepareCallbackOptions = function (xhrObj, moreOptions) {
        var options = {};
        options['xhrObj'] = xhrObj;
        if (moreOptions) {
            _.extend(options, moreOptions);
        }
        return options;
    };
    return BaseVariableManager;
}());

var checkEmptyObject = function (obj) {
    var isEmpty = true;
    _.forEach(obj, function (value) {
        if (_.isEmpty(value)) {
            return;
        }
        if (!_.isObject(value)) {
            isEmpty = false;
        }
        else if (_.isArray(value)) {
            // If array, check if array is empty or if it has only one value and the value is empty
            isEmpty = _.isEmpty(value) || (value.length === 1 ? _.isEmpty(value[0]) : false);
        }
        else {
            // If object, loop over the object to check if it is empty or not
            isEmpty = checkEmptyObject(value);
        }
        return isEmpty; // isEmpty false will break the loop
    });
    return isEmpty;
};
var ModelVariableManager = /** @class */ (function (_super) {
    __extends(ModelVariableManager, _super);
    function ModelVariableManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /*
    * Case: a LIST type static variable having only one object
    * and the object has all fields empty, remove that object
    */
    ModelVariableManager.prototype.removeFirstEmptyObject = function (variable) {
        if (_.isArray(variable.dataSet) && variable.dataSet.length === 1 && checkEmptyObject(variable.dataSet[0])) {
            variable.dataSet = [];
        }
    };
    return ModelVariableManager;
}(BaseVariableManager));

var NotifyPromise = /** @class */ (function () {
    function NotifyPromise(fn) {
        var notifyQueue = [], notify = function (status) {
            notifyQueue.forEach(function (fn1) {
                fn1(status);
            });
        };
        var cleanUp = function () {
            notifyQueue.length = 0;
        };
        var p1 = new Promise(function (res, rej) {
            fn(res, rej, notify);
        });
        p1.superThen = p1.then.bind(p1);
        p1.then = function (onResolve, onReject, onNotify) {
            p1.superThen(function (response) {
                onResolve(response);
                cleanUp();
            }, function (reason) {
                onResolve(reason);
                cleanUp();
            });
            if (onNotify) {
                notifyQueue.push(onNotify);
            }
        };
        return p1;
    }
    return NotifyPromise;
}());
// let newPromise = new PromiseWithNotify((resolve, reject, notify) => {
//     setInterval(notify, 1000);
// })
// console.log(newPromise)
// newPromise.then(undefined, undefined, () => console.log(3));

var HTTP_EVENT_TYPE;
(function (HTTP_EVENT_TYPE) {
    HTTP_EVENT_TYPE[HTTP_EVENT_TYPE["Sent"] = 0] = "Sent";
    HTTP_EVENT_TYPE[HTTP_EVENT_TYPE["UploadProgress"] = 1] = "UploadProgress";
    HTTP_EVENT_TYPE[HTTP_EVENT_TYPE["ResponseHeader"] = 2] = "ResponseHeader";
    HTTP_EVENT_TYPE[HTTP_EVENT_TYPE["DownloadProgress"] = 3] = "DownloadProgress";
    HTTP_EVENT_TYPE[HTTP_EVENT_TYPE["Response"] = 4] = "Response";
    HTTP_EVENT_TYPE[HTTP_EVENT_TYPE["User"] = 5] = "User";
})(HTTP_EVENT_TYPE || (HTTP_EVENT_TYPE = {}));
var UPLOAD_STATUS;
(function (UPLOAD_STATUS) {
    UPLOAD_STATUS["QUEUED"] = "queued";
    UPLOAD_STATUS["IN_PROGRESS"] = "inprogress";
    UPLOAD_STATUS["SUCCESS"] = "success";
    UPLOAD_STATUS["ERROR"] = "error";
    UPLOAD_STATUS["ABORTED"] = "abort";
})(UPLOAD_STATUS || (UPLOAD_STATUS = {}));
var FileTransferObject = /** @class */ (function () {
    function FileTransferObject(file, transferFn, promise, abortFn) {
        this.name = file.name;
        this.size = file.size || '';
        this.status = UPLOAD_STATUS.QUEUED;
        this.transferFn = transferFn;
        this.promise = promise;
        this.abortFn = abortFn;
    }
    FileTransferObject.prototype.start = function () {
        if (this.status === UPLOAD_STATUS.QUEUED) {
            this.status = UPLOAD_STATUS.IN_PROGRESS;
            triggerFn(this.transferFn);
        }
    };
    FileTransferObject.prototype.then = function (onSuccess, onError, onProgress) {
        var self = this;
        this.promise.then(function (event) {
            self.status = UPLOAD_STATUS.SUCCESS;
            triggerFn(onSuccess, event);
        }, function (event) {
            self.status = UPLOAD_STATUS.ERROR;
            triggerFn(onError, event);
        }, function (event) {
            self.progress = Math.round(event.loaded / event.total * 100);
            triggerFn(onProgress, event);
        });
        return this;
    };
    FileTransferObject.prototype.finally = function (onFinal) {
        this.promise.finally(onFinal);
    };
    /* aborts the file upload */
    FileTransferObject.prototype.abort = function () {
        this.status = UPLOAD_STATUS.ABORTED;
        triggerFn(this.abortFn);
        this.finally();
    };
    return FileTransferObject;
}());
var AjaxFileTransferObject = /** @class */ (function (_super) {
    __extends(AjaxFileTransferObject, _super);
    function AjaxFileTransferObject(file, transferFn, promise, abortFn) {
        return _super.call(this, file, transferFn, promise, abortFn) || this;
    }
    return AjaxFileTransferObject;
}(FileTransferObject));
function appendFileToFormData(file, fd, options) {
    /* append file to form data */
    if (_.isArray(file)) {
        _.forEach(file, function (fileObject) {
            fd.append(options.paramName, fileObject.content || fileObject, fileObject.name);
        });
    }
    else if (_.isObject(file)) {
        fd.append(options.paramName, file.content || file, file.name);
    }
}
/* upload file with ajax calling */
function uploadWithAjax(file, fd, url, options) {
    var cloneFD = new FormData();
    var iterate = function (value, key) {
        var fileObject = (_.isArray(value) ? value[0] : value);
        if (!(fileObject instanceof File || fileObject instanceof Blob)) {
            cloneFD.append(key, value);
        }
    };
    // The foreeach method on form data doesn't exist in IE. Hence we check if it exists
    // or else use the lodash forEach
    if (fd.forEach) {
        fd.forEach(iterate);
    }
    else {
        _.forEach(fd, iterate);
    }
    appendFileToFormData(file, cloneFD, options);
    var promise = new NotifyPromise(function (resolve, reject, notify) {
        var request = httpService.upload(url, cloneFD).subscribe(function (event) {
            if (event.type === HTTP_EVENT_TYPE.UploadProgress) {
                var uploadProgress = Math.round(100 * event.loaded / event.total);
                notify(uploadProgress);
            }
            if (event.type === HTTP_EVENT_TYPE.Response) {
                resolve(event.body);
            }
        });
        file._uploadProgress = request;
    });
    return promise;
}
/**
 * This function uploads the file to the given url endpoint.
 *
 * @param file file to upload
 * @param url http endpoint to which the file has to be submitted.
 * @param options
 * @returns a promise to listen for success, event, onProgress.
 *  One can also abort the upload by simply calling abort function.
 */
function upload(files, fd, config, options) {
    options = _.extend({
        'paramName': config.fileParamName
    }, options);
    return uploadWithAjax(files, fd, config.url, options);
    // let fileTransfers = [],
    //     url = config.uploadUrl;
    // options = _.extend({
    //     'paramName' : config.fileParamName
    // }, options);
    //
    // if (isMobileApp()) {
    //     _.forEach(files, function (file) {
    //         fileTransfers.push(uploadWithFileTransfer(file, url, options));
    //     });
    // } else if ((window as any).FormData) {
    //     _.forEach(files, function (file) {
    //         fileTransfers.push(uploadWithAjax(file, url, options));
    //     });
    // } else {
    //     _.forEach(files, function (file) {
    //         fileTransfers.push(uploadWithIframe(file, url, options));
    //     });
    // }
    // startFileTransfers(fileTransfers, 2);
    // return fileTransfers;
}

var performAuthorization = function (url, providerId, onSuccess, onError) {
    oauthService.perfromOAuthorization(url, providerId, onSuccess, onError);
};
var getAccessToken = function (provider, checkLoaclStorage) {
    return oauthService.getAccessToken(provider, checkLoaclStorage);
};
var removeAccessToken = function (provider) {
    oauthService.removeAccessToken(provider);
};

/**
 * returns true if a Service variable is:
 *  - for a query/procedure
 *  - performs a PUT/POST operation, i.e, takes a Request Body as input
 * @param variable
 * @returns {any}
 */
var isBodyTypeQueryOrProcedure = function (variable) {
    return (_.includes(['QueryExecution', 'ProcedureExecution'], variable.controller)) && (_.includes(['put', 'post'], variable.operationType));
};
/**
 * returns true if the variable is a Query service variable
 * @param {string} controller
 * @param {string} serviceType
 * @returns {boolean}
 */
var isQueryServiceVar = function (controller, serviceType) {
    return controller === VARIABLE_CONSTANTS.CONTROLLER_TYPE.QUERY && serviceType === VARIABLE_CONSTANTS.SERVICE_TYPE.DATA;
};
/**
 * Append given value to the formdata
 * @param formData
 * @param param - Param from which value has to be taken
 * @param paramValue - Value which is to be appended to formdata
 */
var getFormData = function (formData, param, paramValue) {
    var paramType = _.toLower(extractType(_.get(param, 'items.type') || param.type)), paramContentType = CONSTANTS.isStudioMode ? param['x-WM-CONTENT_TYPE'] : param.contentType;
    if (isFileUploadSupported()) {
        if ((paramType !== 'file') && (paramContentType === 'string' || !paramContentType)) {
            if (_.isObject(paramValue)) {
                paramValue = JSON.stringify(paramValue);
            }
            formData.append(param.name, paramValue);
        }
        else {
            if (_.isArray(paramValue) && paramType === 'file') {
                _.forEach(paramValue, function (fileObject) {
                    formData.append(param.name, (fileObject && fileObject.content) || getBlob(fileObject), fileObject.name);
                });
            }
            else {
                formData.append(param.name, getBlob(paramValue, paramContentType), paramValue && paramValue.name);
            }
        }
        return formData;
    }
};
/**
 * Check for missing required params and format the date/time param values
 * @param inputData
 * @param params
 * @returns {{requestBody: {}; missingParams: any[]}}
 */
var processRequestBody = function (inputData, params) {
    var requestBody = {}, missingParams = [];
    var paramValue;
    _.forEach(params, function (param) {
        paramValue = _.get(inputData, param.name);
        if (!_.isUndefined(paramValue) && paramValue !== '' && paramValue !== null && !param.readOnly) {
            paramValue = isDateTimeType(param.type) ? formatDate(paramValue, param.type) : paramValue;
            // Construct ',' separated string if param is not array type but value is an array
            if (_.isArray(paramValue) && _.toLower(extractType(param.type)) === 'string') {
                paramValue = _.join(paramValue, ',');
            }
            requestBody[param.name] = paramValue;
        }
        else if (param.required) {
            missingParams.push(param.name || param.id);
        }
    });
    return {
        'requestBody': requestBody,
        'missingParams': missingParams
    };
};
/**
 * Done only for HTTP calls made via the proxy server
 * Goes though request headers, appends 'X-' to certain headers
 * these headers need not be processed at proxy server and should directly be passed to the server
 * e.g. Authorization, Cookie, etc.
 * @param headers
 * @returns {{}}
 */
var cloakHeadersForProxy = function (headers) {
    var _headers = {}, UNCLOAKED_HEADERS = VARIABLE_CONSTANTS.REST_SERVICE.UNCLOAKED_HEADERS, CLOAK_PREFIX = VARIABLE_CONSTANTS.REST_SERVICE.PREFIX.CLOAK_HEADER_KEY;
    _.forEach(headers, function (val, key) {
        if (_.includes(UNCLOAKED_HEADERS, key.toUpperCase())) {
            _headers[key] = val;
        }
        else {
            _headers[CLOAK_PREFIX + key] = val;
        }
    });
    return _headers;
};
var ServiceVariableUtils = /** @class */ (function () {
    function ServiceVariableUtils() {
    }
    /**
     * prepares the HTTP request info for a Service Variable
     * @param variable
     * @param operationInfo
     * @param inputFields
     * @returns {any}
     */
    ServiceVariableUtils.constructRequestParams = function (variable, operationInfo, inputFields) {
        variable = variable || {};
        // operationInfo is specifically null for un_authorized access
        if (operationInfo === null) {
            return {
                'error': {
                    'type': VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.USER_UNAUTHORISED,
                    'message': VARIABLE_CONSTANTS.REST_SERVICE.ERR_MSG.USER_UNAUTHORISED,
                    'field': '_wmServiceOperationInfo'
                }
            };
        }
        else if (_.isEmpty(operationInfo)) {
            return {
                'error': {
                    'type': VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.METADATA_MISSING,
                    'message': VARIABLE_CONSTANTS.REST_SERVICE.ERR_MSG.METADATA_MISSING,
                    'field': '_wmServiceOperationInfo'
                }
            };
        }
        var directPath = operationInfo.directPath || '', relativePath = operationInfo.basePath ? operationInfo.basePath + operationInfo.relativePath : operationInfo.relativePath, isBodyTypeQueryProcedure = isBodyTypeQueryOrProcedure(variable);
        var queryParams = '', bodyInfo, headers = {}, requestBody, url, requiredParamMissing = [], target, pathParamRex, invokeParams, authDetails = null, uname, pswd, method, formData, isProxyCall, paramValueInfo, params, securityDefnObj, accessToken, withCredentials;
        function getFormDataObj() {
            if (formData) {
                return formData;
            }
            formData = new FormData();
            return formData;
        }
        securityDefnObj = _.get(operationInfo.securityDefinitions, '0');
        if (securityDefnObj) {
            switch (securityDefnObj.type) {
                case VARIABLE_CONSTANTS.REST_SERVICE.SECURITY_DEFN.OAUTH2:
                    accessToken = getAccessToken(securityDefnObj[VARIABLE_CONSTANTS.REST_SERVICE.OAUTH_PROVIDER_KEY], null);
                    if (accessToken) {
                        headers[VARIABLE_CONSTANTS.REST_SERVICE.AUTH_HDR_KEY] = VARIABLE_CONSTANTS.REST_SERVICE.PREFIX.AUTH_HDR_VAL.OAUTH + ' ' + accessToken;
                    }
                    else {
                        return {
                            'error': {
                                'type': VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.NO_ACCESSTOKEN,
                                'message': VARIABLE_CONSTANTS.REST_SERVICE.ERR_MSG.NO_ACCESSTOKEN
                            },
                            'securityDefnObj': securityDefnObj
                        };
                    }
                    break;
                case VARIABLE_CONSTANTS.REST_SERVICE.SECURITY_DEFN.BASIC:
                    uname = inputFields['wm_auth_username'];
                    pswd = inputFields['wm_auth_password'];
                    if (uname && pswd) {
                        // TODO[VIBHU]: bas64 encoding alternative.
                        headers[VARIABLE_CONSTANTS.REST_SERVICE.AUTH_HDR_KEY] = VARIABLE_CONSTANTS.REST_SERVICE.PREFIX.AUTH_HDR_VAL.BASIC + ' ' + btoa(uname + ':' + pswd);
                        authDetails = {
                            'type': VARIABLE_CONSTANTS.REST_SERVICE.AUTH_TYPE.BASIC
                        };
                    }
                    else {
                        return {
                            'error': {
                                'type': VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.NO_CREDENTIALS,
                                'message': VARIABLE_CONSTANTS.REST_SERVICE.ERR_MSG.NO_CREDENTIALS
                            },
                            'securityDefnObj': securityDefnObj
                        };
                    }
                    break;
            }
        }
        operationInfo.proxySettings = operationInfo.proxySettings || { web: true, mobile: false };
        method = operationInfo.httpMethod || operationInfo.methodType;
        isProxyCall = (function () {
            if (CONSTANTS.hasCordova) {
                return operationInfo.proxySettings.mobile;
            }
            return operationInfo.proxySettings.web;
        }());
        withCredentials = operationInfo.proxySettings.withCredentials;
        url = isProxyCall ? relativePath : directPath;
        /* loop through all the parameters */
        _.forEach(operationInfo.parameters, function (param) {
            // Set params based on current workspace
            function setParamsOfChildNode() {
                if (inputFields) {
                    // specific case for body type query/procedure variable with query params
                    if (inputFields[param.name] && _.isObject(inputFields[param.name])) {
                        paramValueInfo = inputFields[param.name];
                    }
                    else {
                        paramValueInfo = inputFields;
                    }
                    params = _.get(operationInfo, ['definitions', param.type]);
                }
                else {
                    // For Api Designer
                    paramValueInfo = paramValue || {};
                    params = param.children;
                }
            }
            var paramValue = param.sampleValue;
            if ((isDefined(paramValue) && paramValue !== null && paramValue !== '') || (isBodyTypeQueryProcedure && param.type !== 'file')) {
                // Format dateTime params for dataService variables
                if (variable.serviceType === VARIABLE_CONSTANTS.SERVICE_TYPE.DATA && isDateTimeType(param.type)) {
                    paramValue = formatDate(paramValue, param.type);
                }
                // Construct ',' separated string if param is not array type but value is an array
                if (_.isArray(paramValue) && _.toLower(extractType(param.type)) === 'string' && variable.serviceType === VARIABLE_CONSTANTS.SERVICE_TYPE.DATA) {
                    paramValue = _.join(paramValue, ',');
                }
                switch (param.parameterType.toUpperCase()) {
                    case 'QUERY':
                        // Ignore null valued query params for queryService variable
                        if (_.isNull(paramValue) && isQueryServiceVar(variable.controller, variable.serviceType)) {
                            break;
                        }
                        if (!queryParams) {
                            queryParams = '?' + param.name + '=' + encodeURIComponent(paramValue);
                        }
                        else {
                            queryParams += '&' + param.name + '=' + encodeURIComponent(paramValue);
                        }
                        break;
                    case 'PATH':
                        /* replacing the path param based on the regular expression in the relative path */
                        pathParamRex = new RegExp('\\s*\\{\\s*' + param.name + '(:\\.\\+)?\\s*\\}\\s*');
                        url = url.replace(pathParamRex, paramValue);
                        break;
                    case 'HEADER':
                        headers[param.name] = paramValue;
                        break;
                    case 'BODY':
                        // For post/put query methods wrap the input
                        if (isBodyTypeQueryProcedure) {
                            setParamsOfChildNode();
                            bodyInfo = processRequestBody(paramValueInfo, params);
                            requestBody = bodyInfo.requestBody;
                            requiredParamMissing = _.concat(requiredParamMissing, bodyInfo.missingParams);
                        }
                        else {
                            requestBody = paramValue;
                        }
                        break;
                    case 'FORMDATA':
                        if (isBodyTypeQueryProcedure && param.name === SWAGGER_CONSTANTS.WM_DATA_JSON) {
                            setParamsOfChildNode();
                            // Process query/procedure formData non-file params params
                            bodyInfo = processRequestBody(paramValueInfo, params);
                            requestBody = getFormData(getFormDataObj(), param, bodyInfo.requestBody);
                            requiredParamMissing = _.concat(requiredParamMissing, bodyInfo.missingParams);
                        }
                        else {
                            requestBody = getFormData(getFormDataObj(), param, paramValue);
                        }
                        break;
                }
            }
            else if (param.required) {
                requiredParamMissing.push(param.name || param.id);
            }
        });
        // if required param not found, return error
        if (requiredParamMissing.length) {
            return {
                'error': {
                    'type': VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.REQUIRED_FIELD_MISSING,
                    'field': requiredParamMissing.join(','),
                    'message': replace(VARIABLE_CONSTANTS.REST_SERVICE.ERR_MSG.REQUIRED_FIELD_MISSING, [requiredParamMissing.join(',')]),
                    'skipDefaultNotification': true
                }
            };
        }
        // Setting appropriate content-Type for request accepting request body like POST, PUT, etc
        if (!_.includes(WS_CONSTANTS.NON_BODY_HTTP_METHODS, _.toUpper(method))) {
            /*Based on the formData browser will automatically set the content type to 'multipart/form-data' and webkit boundary*/
            if (!(operationInfo.consumes && (operationInfo.consumes[0] === WS_CONSTANTS.CONTENT_TYPES.MULTIPART_FORMDATA))) {
                headers['Content-Type'] = (operationInfo.consumes && operationInfo.consumes[0]) || 'application/json';
            }
        }
        // if the consumes has application/x-www-form-urlencoded and
        // if the http request of given method type can have body send the queryParams as Form Data
        if (_.includes(operationInfo.consumes, WS_CONSTANTS.CONTENT_TYPES.FORM_URL_ENCODED)
            && !_.includes(WS_CONSTANTS.NON_BODY_HTTP_METHODS, (method || '').toUpperCase())) {
            // remove the '?' at the start of the queryParams
            if (queryParams) {
                requestBody = (requestBody ? requestBody + '&' : '') + queryParams.substring(1);
            }
            headers['Content-Type'] = WS_CONSTANTS.CONTENT_TYPES.FORM_URL_ENCODED;
        }
        else {
            url += queryParams;
        }
        /*
         * for proxy calls:
         *  - cloak the proper headers (required only for REST services)
         *  - prepare complete url from relativeUrl
         */
        if (isProxyCall) {
            // avoiding cloakHeadersForProxy when the method is invoked from apidesigner.
            headers = variable.serviceType !== VARIABLE_CONSTANTS.SERVICE_TYPE.REST || operationInfo.skipCloakHeaders ? headers : cloakHeadersForProxy(headers);
            if (variable.getPrefabName() && VARIABLE_CONSTANTS.REST_SUPPORTED_SERVICES.indexOf(variable.serviceType) !== -1) {
                /* if it is a prefab variable (used in a normal project), modify the url */
                url = 'prefabs/' + variable.getPrefabName() + url;
                target = 'invokePrefabRestService';
            }
            else if (!variable.getPrefabName()) {
                url = 'services' + url;
            }
            url = $rootScope.project.deployedUrl + url;
        }
        /*creating the params needed to invoke the service. url is generated from the relative path for the operation*/
        invokeParams = {
            'projectID': $rootScope.project.id,
            'url': url,
            'target': target,
            'method': method,
            'headers': headers,
            'data': requestBody,
            'authDetails': authDetails,
            'isDirectCall': !isProxyCall,
            'isExtURL': variable.serviceType === VARIABLE_CONSTANTS.SERVICE_TYPE.REST,
            'withCredentials': withCredentials
        };
        return invokeParams;
    };
    ServiceVariableUtils.isFileUploadRequest = function (variable) {
        // temporary fix, have to find proper solution for deciding weather to upload file through variable
        return variable.service === 'FileService' && variable.operation === 'uploadFile';
    };
    /**
     * This method returns array of query param names for variable other then page,size,sort
     * @params {params} params of the variable
     */
    ServiceVariableUtils.excludePaginationParams = function (params) {
        return _.map(_.reject(params, function (param) {
            return _.includes(VARIABLE_CONSTANTS.PAGINATION_PARAMS, param.name);
        }), function (param) {
            return param.name;
        });
    };
    return ServiceVariableUtils;
}());

var InflightQueue = /** @class */ (function () {
    function InflightQueue() {
        this.requestsQueue = new Map();
    }
    /**
     * pushes the process against a variable in its queue
     * @param variable
     * @param {{resolve: (value?: any) => void; reject: (reason?: any) => void}} param2
     * the resolve callback will be called on
     */
    InflightQueue.prototype.addToQueue = function (variable, param2) {
        if (this.requestsQueue.has(variable)) {
            this.requestsQueue.get(variable).push(param2);
        }
        else {
            var processes = [];
            processes.push({ resolve: param2.resolve, reject: param2.reject, active: false });
            this.requestsQueue.set(variable, processes);
        }
    };
    /**
     * Calls the reject method against the passed process
     * @param process
     */
    InflightQueue.prototype.rejectProcess = function (process) {
        process.reject('Process rejected in the queue. Check the "Inflight behavior" for more info.');
    };
    /**
     * clears the queue against a variable
     * @param variable
     */
    InflightQueue.prototype.clear = function (variable) {
        this.requestsQueue.delete(variable);
    };
    /**
     * executes the n/w calls for a specified variable pushed in its respective queue (pushed while it was inFlight)
     * @param variable
     */
    InflightQueue.prototype.process = function (variable) {
        var processes = this.requestsQueue.get(variable);
        var nextProcess;
        // process request queue for the variable only if it is not empty
        if (!processes || !processes.length) {
            this.clear(variable);
            return;
        }
        // If only one item in queue
        if (processes.length === 1) {
            nextProcess = processes[0];
            if (nextProcess.active) {
                this.clear(variable);
            }
            else {
                nextProcess.active = true;
                nextProcess.resolve();
            }
            return;
        }
        switch (variable.inFlightBehavior) {
            case 'executeLast':
                for (var i = 0; i < processes.length - 2; i++) {
                    this.rejectProcess(processes[i]);
                }
                processes.splice(0, processes.length - 1);
                this.process(variable);
                break;
            case 'executeAll':
                nextProcess = processes.splice(0, 1)[0];
                if (nextProcess.active) {
                    nextProcess = processes.splice(0, 1)[0];
                }
                nextProcess.active = true;
                nextProcess.resolve();
                break;
            default:
                for (var i = 0; i < processes.length - 1; i++) {
                    this.rejectProcess(processes[i]);
                }
                this.clear(variable);
                break;
        }
    };
    /**
     * initializes the queue against a variable and makes the first process call
     * If already initialized and a process in queue is in progress, the queue is not processed.
     * To process the next item in the queue, the process method has to be called from the caller.
     * @param variable
     * @returns {Promise<any>}
     */
    InflightQueue.prototype.submit = function (variable) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.addToQueue(variable, { resolve: resolve, reject: reject });
            if (_this.requestsQueue.get(variable).length === 1) {
                _this.process(variable);
            }
        });
    };
    return InflightQueue;
}());
var $queue = new InflightQueue();

var ServiceVariableManager = /** @class */ (function (_super) {
    __extends(ServiceVariableManager, _super);
    function ServiceVariableManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fileUploadResponse = [];
        _this.fileUploadCount = 0;
        _this.totalFilesCount = 0;
        _this.successFileUploadCount = 0;
        _this.failedFileUploadCount = 0;
        return _this;
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
    ServiceVariableManager.prototype.processErrorResponse = function (variable, errMsg, errorCB, xhrObj, skipNotification, skipDefaultNotification) {
        var methodInfo = this.getMethodInfo(variable, {}, {});
        var securityDefnObj = _.get(methodInfo, 'securityDefinitions.0');
        var advancedOptions = this.prepareCallbackOptions(xhrObj);
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
    };
    /**
     * function to process success response from a service
     * @param response
     * @param variable
     * @param options
     * @param success
     */
    ServiceVariableManager.prototype.processSuccessResponse = function (response, variable, options, success) {
        var dataSet;
        var newDataSet;
        var pagination = {};
        var advancedOptions;
        var jsonParsedResponse = getValidJSON(response);
        response = isDefined(jsonParsedResponse) ? jsonParsedResponse : (xmlToJson(response) || response);
        var isResponsePageable = isPageable(response);
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
                    get: function () {
                        return variable.dataSet;
                    }
                });
            }
        }
        $invokeWatchers(true);
        setTimeout(function () {
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
    };
    ServiceVariableManager.prototype.uploadFileInFormData = function (variable, options, success, error, file, requestParams) {
        var _this = this;
        var promise = upload(file, requestParams.data, {
            fileParamName: 'files',
            url: requestParams.url
        });
        promise.then(function (data) {
            _this.fileUploadCount++;
            _this.successFileUploadCount++;
            _this.fileUploadResponse.push(data[0]);
            if (_this.totalFilesCount === _this.fileUploadCount) {
                if (_this.failedFileUploadCount === 0) {
                    _this.processSuccessResponse(_this.fileUploadResponse, variable, options, success);
                    _this.fileUploadResponse = [];
                    appManager.notifyApp(appManager.getAppLocale().MESSAGE_FILE_UPLOAD_SUCCESS, 'success');
                }
                else {
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, _this.fileUploadResponse);
                    _this.fileUploadResponse = [];
                    appManager.notifyApp(appManager.getAppLocale().MESSAGE_FILE_UPLOAD_ERROR, 'error');
                }
                _this.fileUploadCount = 0;
                _this.successFileUploadCount = 0;
                _this.totalFilesCount = 0;
            }
            return data;
        }, function (e) {
            _this.fileUploadCount++;
            _this.failedFileUploadCount++;
            _this.fileUploadResponse.push(e);
            if (_this.totalFilesCount === _this.fileUploadCount) {
                _this.processErrorResponse(variable, _this.fileUploadResponse, error, options.xhrObj, options.skipNotification);
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, _this.fileUploadResponse);
                _this.fileUploadResponse = [];
                _this.fileUploadCount = 0;
                _this.failedFileUploadCount = 0;
                _this.totalFilesCount = 0;
            }
            return e;
        }, function (data) {
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
    };
    /**
     * Checks if the user is logged in or not and returns appropriate error
     * If user is not logged in, Session timeout logic is run, for user to login
     * @param variable
     * @returns {any}
     */
    ServiceVariableManager.prototype.handleAuthError = function (variable, success, errorCB, options) {
        var isUserAuthenticated = _.get(securityService.get(), 'authenticated');
        var info;
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
    };
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
    ServiceVariableManager.prototype.handleRequestMetaError = function (info, variable, success, errorCB, options) {
        var err_type = _.get(info, 'error.type');
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
    };
    /**
     * function to transform the service data as according to the variable configuration
     * this is used when 'transformationColumns' property is set on the variable
     * @param data: data returned from the service
     * @variable: variable object triggering the service
     */
    ServiceVariableManager.prototype.transformData = function (data, variable) {
        data.wmTransformedData = [];
        var columnsArray = variable.transformationColumns, dataArray = _.get(data, variable.dataField) || [], transformedData = data.wmTransformedData;
        _.forEach(dataArray, function (datum, index) {
            transformedData[index] = {};
            _.forEach(columnsArray, function (column, columnIndex) {
                transformedData[index][column] = datum[columnIndex];
            });
        });
    };
    /**
     * gets the service operation info against a service variable
     * this is extracted from the metadataservice
     * @param variable
     * @param inputFields: sample values, if provided, will be set against params in the definition
     * @param options
     * @returns {any}
     */
    ServiceVariableManager.prototype.getMethodInfo = function (variable, inputFields, options) {
        var serviceDef = getClonedObject(metadataService.getByOperationId(variable.operationId, variable.getPrefabName()));
        var methodInfo = serviceDef === null ? null : _.get(serviceDef, 'wmServiceOperationInfo');
        if (!methodInfo) {
            return methodInfo;
        }
        var securityDefnObj = _.get(methodInfo.securityDefinitions, '0'), isOAuthTypeService = securityDefnObj && (securityDefnObj.type === VARIABLE_CONSTANTS.REST_SERVICE.SECURITY_DEFN.OAUTH2);
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
    };
    /**
     * Returns true if any of the files are in onProgress state
     */
    ServiceVariableManager.prototype.isFileUploadInProgress = function (dataBindings) {
        var filesStatus = false;
        _.forEach(dataBindings, function (dataBinding) {
            if (_.isArray(dataBinding) && dataBinding[0] instanceof File) {
                _.forEach(dataBinding, function (file) {
                    if (file.status === 'onProgress') {
                        filesStatus = true;
                        return;
                    }
                });
            }
        });
        return filesStatus;
    };
    // Makes the call for Uploading file/ files
    ServiceVariableManager.prototype.uploadFile = function (variable, options, success, error, inputFields, requestParams) {
        var _this = this;
        var fileParamCount = 0;
        var fileArr = [], promArr = [];
        _.forEach(inputFields, function (inputField) {
            if (_.isArray(inputField)) {
                if (inputField[0] instanceof File) {
                    fileParamCount++;
                }
                _.forEach(inputField, function (input) {
                    if (input instanceof File || _.find(_.values(input), function (o) { return o instanceof Blob; })) {
                        fileArr.push(input);
                        _this.totalFilesCount++;
                        fileParamCount = fileParamCount || 1;
                    }
                });
            }
            else {
                if (inputField instanceof File) {
                    fileParamCount++;
                    _this.totalFilesCount++;
                    fileArr.push(inputField);
                }
            }
        });
        if (fileParamCount === 1) {
            if (inputFields.files.length > 1) {
                _.forEach(fileArr, function (file) {
                    promArr.push(_this.uploadFileInFormData(variable, options, success, error, file, requestParams));
                });
                return Promise.all(promArr);
            }
            else {
                return this.uploadFileInFormData(variable, options, success, error, fileArr[0], requestParams);
            }
        }
    };
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
    ServiceVariableManager.prototype._invoke = function (variable, options, success, error) {
        var _this = this;
        var inputFields = getClonedObject(options.inputFields || variable.dataBinding);
        // EVENT: ON_BEFORE_UPDATE
        var output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, inputFields, options);
        var successHandler;
        var errorHandler;
        if (output === false) {
            $queue.process(variable);
            triggerFn(error);
            return;
        }
        if (_.isObject(output)) {
            inputFields = output;
        }
        var operationInfo = this.getMethodInfo(variable, inputFields, options), requestParams = ServiceVariableUtils.constructRequestParams(variable, operationInfo, inputFields);
        // check errors
        if (requestParams.error) {
            var info = this.handleRequestMetaError(requestParams, variable, success, error, options);
            var reason = (_.get(info, 'error.message') || 'An error occurred while triggering the variable: ') + ': ' + variable.name;
            triggerFn(error);
            return Promise.reject(reason);
        }
        // file upload
        if (ServiceVariableUtils.isFileUploadRequest(variable)) {
            var uploadPromise = this.uploadFile(variable, options, success, error, inputFields, requestParams);
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
        successHandler = function (response, resolve) {
            if (response && response.type) {
                var data = _this.processSuccessResponse(response.body, variable, _.extend(options, { 'xhrObj': response }), success);
                // notify variable success
                _this.notifyInflight(variable, false, data);
                resolve(response);
            }
        };
        errorHandler = function (err, reject) {
            var errMsg = httpService.getErrMessage(err);
            // notify variable error
            _this.notifyInflight(variable, false);
            _this.processErrorResponse(variable, errMsg, error, err, options.skipNotification);
            reject({
                error: errMsg,
                details: err
            });
        };
        // make the call and return a promise to the user to support script calls made by users
        return new Promise(function (resolve, reject) {
            requestParams.responseType = 'text'; // this is to return text response. JSON & XML-to-JSON parsing is handled in success handler.
            _this.httpCall(requestParams, variable).then(function (response) {
                successHandler(response, resolve);
            }, function (err) {
                errorHandler(err, reject);
            });
            // the _observable property on variable is used store the observable using which the network call is made
            // this can be used to cancel the variable calls.
        });
    };
    // *********************************************************** PUBLIC ***********************************************************//
    ServiceVariableManager.prototype.invoke = function (variable, options, success, error) {
        options = options || {};
        options.inputFields = options.inputFields || getClonedObject(variable.dataBinding);
        return $queue.submit(variable).then(this._invoke.bind(this, variable, options, success, error), error);
    };
    ServiceVariableManager.prototype.download = function (variable, options, successHandler, errorHandler) {
        options = options || {};
        var inputParams = getClonedObject(variable.dataBinding);
        var inputData = options.data || {};
        var methodInfo = this.getMethodInfo(variable, inputParams, options);
        var requestParams;
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
        return httpService.send(requestParams).then(function (response) {
            if (response && isValidWebURL(response.body.result)) {
                window.location.href = response.body.result;
                triggerFn(successHandler, response);
            }
            else {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response);
                triggerFn(errorHandler, response);
            }
        }, function (response, xhrObj) {
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response, xhrObj);
            triggerFn(errorHandler, response);
        });
    };
    ServiceVariableManager.prototype.getInputParms = function (variable) {
        var wmServiceOperationInfo = _.get(metadataService.getByOperationId(variable.operationId), 'wmServiceOperationInfo');
        return _.get(wmServiceOperationInfo, 'parameters');
    };
    ServiceVariableManager.prototype.setInput = function (variable, key, val, options) {
        return setInput(variable.dataBinding, key, val, options);
    };
    /**
     * Cancels an on going service request
     * @param variable
     * @param $file
     */
    ServiceVariableManager.prototype.cancel = function (variable, $file) {
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
    };
    ServiceVariableManager.prototype.defineFirstLastRecord = function (variable) {
        if (variable.isList) {
            Object.defineProperty(variable, 'firstRecord', {
                'configurable': true,
                'get': function () {
                    var dataSet = variable.dataSet;
                    // For procedure(v1) data doesn't come under content
                    return _.head(dataSet && dataSet.content) || _.head(dataSet) || {};
                }
            });
            Object.defineProperty(variable, 'lastRecord', {
                'configurable': true,
                'get': function () {
                    var dataSet = variable.dataSet;
                    // For procedure(v1) data doesn't come under content
                    return _.last(dataSet && dataSet.content) || _.last(dataSet) || {};
                }
            });
        }
    };
    // Gets the input params of the service variable and also add params from the searchKeys (filterfields)
    ServiceVariableManager.prototype.getQueryParams = function (filterFields, searchValue, variable) {
        var inputParams = this.getInputParms(variable);
        var queryParams = ServiceVariableUtils.excludePaginationParams(inputParams);
        var inputFields = {};
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
    };
    /**
     * This method returns filtered records based on searchKey and queryText.
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}
     */
    ServiceVariableManager.prototype.searchRecords = function (variable, options, success, error) {
        var inputFields = this.getQueryParams(_.split(options.searchKey, ','), options.query, variable);
        var requestParams = {
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
    };
    return ServiceVariableManager;
}(BaseVariableManager));

var LiveVariableUtils = /** @class */ (function () {
    function LiveVariableUtils() {
    }
    LiveVariableUtils.isCompositeKey = function (primaryKey) {
        return !primaryKey || (primaryKey && (!primaryKey.length || primaryKey.length > 1));
    };
    LiveVariableUtils.isNoPrimaryKey = function (primaryKey) {
        return (!primaryKey || (primaryKey && !primaryKey.length));
    };
    // Generate the URL based on the primary keys and their values
    LiveVariableUtils.getCompositeIDURL = function (primaryKeysData) {
        var compositeId = '';
        //  Loop over the 'compositeKeysData' and construct the 'compositeId'.
        _.forEach(primaryKeysData, function (paramValue, paramName) {
            compositeId += paramName + '=' + encodeURIComponent(paramValue) + '&';
        });
        compositeId = compositeId.slice(0, -1);
        return compositeId;
    };
    // Check if table has blob column
    LiveVariableUtils.hasBlob = function (variable) {
        return _.find(_.get(variable, ['propertiesMap', 'columns']), { 'type': 'blob' });
    };
    LiveVariableUtils.getPrimaryKey = function (variable) {
        if (!variable.propertiesMap) {
            return [];
        }
        if (variable.propertiesMap.primaryFields) {
            return variable.propertiesMap.primaryFields;
        }
        /*Old projects do not have primary fields. Get primary key from the columns*/
        var primaryKey = [];
        /*Loop through the propertiesMap and get the primary key column.*/
        _.forEach(variable.propertiesMap.columns, function (index, column) {
            if (column.isPrimaryKey) {
                if (column.isRelated && (!_.includes(column.relatedFieldName, primaryKey))) {
                    primaryKey.push(column.relatedFieldName);
                }
                else if (!_.includes(column.fieldName, primaryKey)) {
                    primaryKey.push(column.fieldName);
                }
            }
        });
        return primaryKey;
    };
    //  Construct the URL for blob columns and set it in the data, so that widgets can use this
    LiveVariableUtils.processBlobColumns = function (responseData, variable) {
        if (!responseData) {
            return;
        }
        var blobCols = _.map(_.filter(variable.propertiesMap.columns, { 'type': 'blob' }), 'fieldName'), deployedUrl = _.trim($rootScope.project.deployedUrl);
        var href = '', primaryKeys;
        if (_.isEmpty(blobCols)) {
            return;
        }
        if (hasCordova()) {
            href += _.endsWith(deployedUrl, '/') ? deployedUrl : deployedUrl + '/';
        }
        href += ((variable._prefabName !== '' && variable._prefabName !== undefined) ? 'prefabs/' + variable._prefabName : 'services') + '/' + variable.liveSource + '/' + variable.type + '/';
        primaryKeys = variable.propertiesMap.primaryFields || variable.propertiesMap.primaryKeys;
        _.forEach(responseData, function (data) {
            if (data) {
                _.forEach(blobCols, function (col) {
                    var compositeKeysData = {};
                    if (data[col] === null || !_.isEmpty(_.trim(data[col]))) {
                        return;
                    }
                    if (LiveVariableUtils.isCompositeKey(primaryKeys)) {
                        primaryKeys.forEach(function (key) {
                            compositeKeysData[key] = data[key];
                        });
                        data[col] = href + 'composite-id/content/' + col + '?' + LiveVariableUtils.getCompositeIDURL(compositeKeysData);
                    }
                    else {
                        data[col] = href + data[_.join(primaryKeys)] + '/content/' + col;
                    }
                });
            }
        });
    };
    LiveVariableUtils.getHibernateOrSqlType = function (variable, fieldName, type, entityName) {
        var columns = variable.propertiesMap.columns;
        var column, relatedCols, relatedCol;
        if (_.includes(fieldName, '.')) {
            column = _.find(columns, function (col) {
                return col.fieldName === fieldName.split('.')[0];
            });
            relatedCols = column && column.columns;
            relatedCol = _.find(relatedCols, function (col) {
                return col.fieldName === fieldName.split('.')[1];
            });
            return relatedCol && relatedCol[type];
        }
        column = _.find(columns, function (col) {
            return col.fieldName === fieldName || col.relatedColumnName === fieldName;
        });
        if (!column && entityName) {
            var entity = _.find(columns, function (col) { return col.relatedEntityName === entityName; });
            column = _.find(entity.columns, function (col) {
                return col.fieldName === fieldName || col.relatedColumnName === fieldName;
            });
        }
        return column && column[type];
    };
    /*Function to get the sqlType of the specified field.*/
    LiveVariableUtils.getSqlType = function (variable, fieldName, entityName) {
        return LiveVariableUtils.getHibernateOrSqlType(variable, fieldName, 'type', entityName);
    };
    /*Function to check if the specified field has a one-to-many relation or not.*/
    LiveVariableUtils.isRelatedFieldMany = function (variable, fieldName) {
        var columns = variable.propertiesMap.columns, columnsCount = columns.length;
        var index, column;
        /*Loop through the columns of the liveVariable*/
        for (index = 0; index < columnsCount; index += 1) {
            column = columns[index];
            /*If the specified field is found in the columns of the variable,
            * then it has a many-to-one relation.*/
            if (column.fieldName === fieldName) {
                return false;
            }
        }
        return true;
    };
    LiveVariableUtils.isStringType = function (type) {
        return _.includes(['text', 'string'], _.toLower(type));
    };
    LiveVariableUtils.getSQLFieldType = function (variable, options) {
        if (_.includes(['timestamp', 'datetime', 'date'], options.type)) {
            return options.type;
        }
        return LiveVariableUtils.getSqlType(variable, options.fieldName) || options.type;
    };
    LiveVariableUtils.getAttributeName = function (variable, fieldName) {
        var attrName = fieldName;
        variable.propertiesMap.columns.forEach(function (column) {
            if (column.fieldName === fieldName && column.isRelated) {
                attrName = column.relatedFieldName;
            }
        });
        return attrName;
    };
    LiveVariableUtils.getFilterCondition = function (filterCondition) {
        if (_.includes(DB_CONSTANTS.DATABASE_RANGE_MATCH_MODES, filterCondition)) {
            return filterCondition;
        }
        return DB_CONSTANTS.DATABASE_MATCH_MODES['exact'];
    };
    LiveVariableUtils.getFilterOption = function (variable, fieldOptions, options) {
        var attributeName, fieldValue = fieldOptions.value, filterOption, filterCondition;
        var matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES, fieldName = fieldOptions.fieldName, fieldRequired = fieldOptions.required || false, fieldType = LiveVariableUtils.getSQLFieldType(variable, fieldOptions);
        filterCondition = matchModes[fieldOptions.matchMode] || matchModes[fieldOptions.filterCondition] || fieldOptions.filterCondition;
        fieldOptions.type = fieldType;
        /* if the field value is an object(complex type), loop over each field inside and push only first level fields */
        if (_.isObject(fieldValue) && !_.isArray(fieldValue)) {
            var firstLevelValues_1 = [];
            _.forEach(fieldValue, function (subFieldValue, subFieldName) {
                if (subFieldValue && !_.isObject(subFieldValue)) {
                    firstLevelValues_1.push(fieldName + '.' + subFieldName + '=' + subFieldValue);
                }
            });
            return firstLevelValues_1;
        }
        if (_.includes(DB_CONSTANTS.DATABASE_EMPTY_MATCH_MODES, filterCondition)) {
            attributeName = LiveVariableUtils.getAttributeName(variable, fieldName);
            // For non string types empty match modes are not supported, so convert them to null match modes.
            if (fieldType && !LiveVariableUtils.isStringType(fieldType)) {
                filterCondition = DB_CONSTANTS.DATABASE_NULL_EMPTY_MATCH[filterCondition];
            }
            filterOption = {
                'attributeName': attributeName,
                'attributeValue': '',
                'attributeType': _.toUpper(fieldType),
                'filterCondition': filterCondition,
                'required': fieldRequired
            };
            if (options.searchWithQuery) {
                filterOption.isVariableFilter = fieldOptions.isVariableFilter;
            }
            return filterOption;
        }
        if (isDefined(fieldValue) && fieldValue !== null && fieldValue !== '') {
            /*Based on the sqlType of the field, format the value & set the filter condition.*/
            if (fieldType) {
                switch (fieldType) {
                    case 'integer':
                        fieldValue = _.isArray(fieldValue) ? _.reduce(fieldValue, function (result, value) {
                            value = parseInt(value, 10);
                            if (!_.isNaN(value)) {
                                result.push(value);
                            }
                            return result;
                        }, []) : parseInt(fieldValue, 10);
                        filterCondition = filterCondition ? LiveVariableUtils.getFilterCondition(filterCondition) : matchModes['exact'];
                        break;
                    case 'date':
                    case 'datetime':
                    case 'timestamp':
                        fieldValue = formatDate(fieldValue, fieldType);
                        filterCondition = filterCondition ? LiveVariableUtils.getFilterCondition(filterCondition) : matchModes['exact'];
                        break;
                    case 'text':
                    case 'string':
                        if (_.isArray(fieldValue)) {
                            filterCondition = _.includes([matchModes['in'], matchModes['notin']], filterCondition) ? filterCondition : matchModes['exact'];
                        }
                        else {
                            filterCondition = filterCondition || matchModes['anywhereignorecase'];
                        }
                        break;
                    default:
                        filterCondition = filterCondition ? LiveVariableUtils.getFilterCondition(filterCondition) : matchModes['exact'];
                        break;
                }
            }
            else {
                filterCondition = _.isString(fieldValue) ? matchModes['anywhereignorecase'] : matchModes['exact'];
            }
            attributeName = LiveVariableUtils.getAttributeName(variable, fieldName);
            filterOption = {
                'attributeName': attributeName,
                'attributeValue': fieldValue,
                'attributeType': _.toUpper(fieldType),
                'filterCondition': filterCondition,
                'required': fieldRequired
            };
            if (options.searchWithQuery) {
                filterOption.isVariableFilter = fieldOptions.isVariableFilter;
            }
            return filterOption;
        }
    };
    LiveVariableUtils.getFilterOptions = function (variable, filterFields, options) {
        var filterOptions = [];
        _.each(filterFields, function (fieldOptions) {
            var filterOption = LiveVariableUtils.getFilterOption(variable, fieldOptions, options);
            if (!_.isNil(filterOption)) {
                if (_.isArray(filterOption)) {
                    filterOptions = filterOptions.concat(filterOption);
                }
                else {
                    filterOptions.push(filterOption);
                }
            }
        });
        return filterOptions;
    };
    // Wrap the field name and value in lower() in ignore case scenario
    // TODO: Change the function name to represent the added functionality of identifiers for datetime, timestamp and float types. Previously only lower was warapped.
    LiveVariableUtils.wrapInLowerCase = function (value, options, ignoreCase, isField) {
        var type = _.toLower(options.attributeType);
        if (!isField) {
            // Wrap the identifiers for datetime, timestamp and float types. Wrappring is not required for fields.
            if (type === 'datetime') {
                return 'wm_dt(' + value + ')';
            }
            if (type === 'timestamp') {
                return 'wm_ts(' + value + ')';
            }
            if (type === 'float') {
                return 'wm_float(' + value + ')';
            }
            if (type === 'boolean') {
                return 'wm_bool(' + value + ')';
            }
        }
        // If ignore case is true and type is string/ text and match mode is string type, wrap in lower()
        if (ignoreCase && (!type || LiveVariableUtils.isStringType(type)) && _.includes(DB_CONSTANTS.DATABASE_STRING_MODES, options.filterCondition)) {
            return 'lower(' + value + ')';
        }
        return value;
    };
    LiveVariableUtils.encodeAndAddQuotes = function (value, type, skipEncode) {
        var encodedValue = skipEncode ? value : encodeURIComponent(value);
        type = _.toLower(type);
        encodedValue = _.replace(encodedValue, /'/g, '\'\'');
        // For number types, don't wrap the value in quotes
        if ((isNumberType(type) && type !== 'float')) {
            return encodedValue;
        }
        return '\'' + encodedValue + '\'';
    };
    LiveVariableUtils.getParamValue = function (value, options, ignoreCase, skipEncode) {
        var param;
        var filterCondition = options.filterCondition, dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES, type = options.attributeType;
        if (_.includes(DB_CONSTANTS.DATABASE_EMPTY_MATCH_MODES, filterCondition)) {
            // For empty matchmodes, no value is required
            return '';
        }
        switch (filterCondition) {
            case dbModes.startignorecase:
            case dbModes.start:
                param = LiveVariableUtils.encodeAndAddQuotes(value + '%', type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.endignorecase:
            case dbModes.end:
                param = LiveVariableUtils.encodeAndAddQuotes('%' + value, type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.anywhereignorecase:
            case dbModes.anywhere:
                param = LiveVariableUtils.encodeAndAddQuotes('%' + value + '%', type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.between:
                param = _.join(_.map(value, function (val) {
                    return LiveVariableUtils.wrapInLowerCase(LiveVariableUtils.encodeAndAddQuotes(val, type, skipEncode), options, ignoreCase);
                }), ' and ');
                break;
            case dbModes.in:
            case dbModes.notin:
                param = _.join(_.map(value, function (val) {
                    return LiveVariableUtils.wrapInLowerCase(LiveVariableUtils.encodeAndAddQuotes(val, type, skipEncode), options, ignoreCase);
                }), ', ');
                param = '(' + param + ')';
                break;
            /*case dbModes.exactignorecase:
            case dbModes.exact:
            case dbModes.notequals:
            The above three cases will be handled by default*/
            default:
                param = LiveVariableUtils.encodeAndAddQuotes(value, type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
        }
        return isDefined(param) ? param : '';
    };
    LiveVariableUtils.getSearchQuery = function (filterOptions, operator, ignoreCase, skipEncode) {
        var query;
        var params = [];
        _.forEach(filterOptions, function (fieldValue) {
            var value = fieldValue.attributeValue, dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES, isValArray = _.isArray(value);
            var fieldName = fieldValue.attributeName, filterCondition = fieldValue.filterCondition, matchModeExpr, paramValue;
            // If value is an empty array, do not generate the query
            // If values is NaN and number type, do not generate query for this field
            if ((isValArray && _.isEmpty(value)) || (!isValArray && isNaN(value) && isNumberType(fieldValue.attributeType))) {
                return;
            }
            if (isValArray) {
                // If array is value and mode is between, pass between. Else pass as in query
                filterCondition = filterCondition === dbModes.between || filterCondition === dbModes.notin ? filterCondition : dbModes.in;
                fieldValue.filterCondition = filterCondition;
            }
            matchModeExpr = DB_CONSTANTS.DATABASE_MATCH_MODES_WITH_QUERY[filterCondition];
            paramValue = LiveVariableUtils.getParamValue(value, fieldValue, ignoreCase, skipEncode);
            fieldName = LiveVariableUtils.wrapInLowerCase(fieldName, fieldValue, ignoreCase, true);
            params.push(replace(matchModeExpr, [fieldName, paramValue]));
        });
        query = _.join(params, operator); // empty space added intentionally around OR
        return query;
    };
    /**
     * creating the proper values from the actual object like for between,in matchModes value has to be an array like [1,2]
     * @param rules recursive filterexpressions object
     * @param variable variable object
     * @param options options
     */
    LiveVariableUtils.processFilterFields = function (rules, variable, options) {
        _.remove(rules, function (rule) {
            return rule && (_.isString(rule.value) && rule.value.indexOf('bind:') === 0 || (rule.matchMode === 'between' ? (_.isString(rule.secondvalue) && rule.secondvalue.indexOf('bind:') === 0) : false));
        });
        _.forEach(rules, function (rule, index) {
            if (rule) {
                if (rule.rules) {
                    LiveVariableUtils.processFilterFields(rule.rules, variable, options);
                }
                else {
                    if (!_.isNull(rule.target)) {
                        var value = rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.between.toLowerCase()
                            ? (_.isArray(rule.value) ? rule.value : [rule.value, rule.secondvalue])
                            : (rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.in.toLowerCase() || rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.notin.toLowerCase()
                                ? (_.isArray(rule.value) ? rule.value : (rule.value ? rule.value.split(',').map(function (val) { return val.trim(); }) : ''))
                                : rule.value);
                        rules[index] = LiveVariableUtils.getFilterOption(variable, {
                            'fieldName': rule.target,
                            'type': rule.type,
                            'value': value,
                            'required': rule.required,
                            'filterCondition': rule.matchMode || options.matchMode || variable.matchMode
                        }, options);
                    }
                }
            }
        });
    };
    LiveVariableUtils.getSearchField = function (fieldValue, ignoreCase, skipEncode) {
        var fieldName = fieldValue.attributeName;
        var matchModeExpr;
        var paramValue;
        var filterCondition = fieldValue.filterCondition;
        var value = fieldValue.attributeValue;
        var isValArray = _.isArray(value);
        var dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        // If value is an empty array, do not generate the query
        // If values is NaN and number type, do not generate query for this field
        if ((isValArray && _.isEmpty(value)) || (isValArray && _.some(value, function (val) { return (_.isNull(val) || _.isNaN(val) || val === ''); })) || (!isValArray && isNaN(value) && isNumberType(fieldValue.attributeType))) {
            return;
        }
        if (isValArray) {
            // If array is value and mode is between, pass between. Else pass as in query
            filterCondition = filterCondition === dbModes.between || filterCondition === dbModes.notin ? filterCondition : dbModes.in;
            fieldValue.filterCondition = filterCondition;
        }
        matchModeExpr = DB_CONSTANTS.DATABASE_MATCH_MODES_WITH_QUERY[filterCondition];
        paramValue = LiveVariableUtils.getParamValue(value, fieldValue, ignoreCase, skipEncode);
        fieldName = LiveVariableUtils.wrapInLowerCase(fieldName, fieldValue, ignoreCase, true);
        return replace(matchModeExpr, [fieldName, paramValue]);
    };
    /**
     * this is used to identify whether to use ignorecase at each criteria level and not use the variable
     * level isIgnoreCase flag and apply it to all the rules.
     * Instead of adding an extra param to the criteria object, we have added few other matchmodes for string types like
     * anywhere with anywhereignorecase, start with startignorecase, end with endignorecase, exact with exactignorecase,
     * So while creating the criteria itseld user can choose whether to use ignore case or not for a particular column while querying
     * @param matchMode
     * @param ignoreCase
     * @returns {*} boolean
     */
    LiveVariableUtils.getIgnoreCase = function (matchMode, ignoreCase) {
        var matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        if (_.indexOf([matchModes['anywhere'], matchModes['start'], matchModes['end'], matchModes['exact']], matchMode) !== -1) {
            return false;
        }
        if (_.indexOf([matchModes['anywhereignorecase'], matchModes['startignorecase'], matchModes['endignorecase'], matchModes['exactignorecase']], matchMode) !== -1) {
            return true;
        }
        return ignoreCase;
    };
    LiveVariableUtils.generateSearchQuery = function (rules, condition, ignoreCase, skipEncode) {
        var params = [];
        _.forEach(rules, function (rule) {
            if (rule) {
                if (rule.rules) {
                    var query = LiveVariableUtils.generateSearchQuery(rule.rules, rule.condition, ignoreCase, skipEncode);
                    if (query !== '') {
                        params.push('(' + query + ')');
                    }
                }
                else {
                    var searchField = LiveVariableUtils.getSearchField(rule, LiveVariableUtils.getIgnoreCase(rule.filterCondition, ignoreCase), skipEncode);
                    if (!_.isNil(searchField)) {
                        params.push(searchField);
                    }
                }
            }
        });
        return _.join(params, ' ' + condition + ' ');
    };
    LiveVariableUtils.prepareTableOptionsForFilterExps = function (variable, options, clonedFields) {
        if (!isDefined(options.searchWithQuery)) {
            options.searchWithQuery = true; // Using query api instead of  search api
        }
        var filterOptions = [];
        var matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        var orderByFields, orderByOptions, query;
        var clonedObj = clonedFields || getClonedObject(variable.filterExpressions);
        // if filterexpression from live filter is present use it to query
        if (options.filterExpr && !_.isEmpty(options.filterExpr)) {
            clonedObj = options.filterExpr;
        }
        // merge live filter runtime values
        var filterRules = {};
        if (!_.isEmpty(options.filterFields)) {
            filterRules = { 'condition': options.logicalOp || 'AND', 'rules': [] };
            _.forEach(options.filterFields, function (filterObj, filterName) {
                var filterCondition = matchModes[filterObj.matchMode] || matchModes[filterObj.filterCondition] || filterObj.filterCondition;
                if (_.includes(DB_CONSTANTS.DATABASE_EMPTY_MATCH_MODES, filterCondition) ||
                    (!_.isNil(filterObj.value) && filterObj.value !== '')) {
                    var type = filterObj.type || LiveVariableUtils.getSqlType(variable, filterName, options.entityName);
                    var ruleObj = {
                        'target': filterName,
                        'type': type,
                        'matchMode': filterObj.matchMode || (LiveVariableUtils.isStringType(type) ? 'startignorecase' : 'exact'),
                        'value': filterObj.value,
                        'required': filterObj.required || false
                    };
                    filterRules.rules.push(ruleObj);
                }
            });
        }
        if (!_.isEmpty(clonedObj)) {
            if (!_.isNil(filterRules.rules) && filterRules.rules.length) {
                // combine both the rules using 'AND'
                var tempRules = { 'condition': 'AND', 'rules': [] };
                tempRules.rules.push(getClonedObject(clonedObj));
                tempRules.rules.push(filterRules);
                clonedObj = tempRules;
            }
        }
        else {
            clonedObj = filterRules;
        }
        LiveVariableUtils.processFilterFields(clonedObj.rules, variable, options);
        query = LiveVariableUtils.generateSearchQuery(clonedObj.rules, clonedObj.condition, variable.ignoreCase, options.skipEncode);
        orderByFields = getEvaluatedOrderBy(variable.orderBy, options.orderBy);
        orderByOptions = orderByFields ? 'sort=' + orderByFields : '';
        return {
            'filter': filterOptions,
            'sort': orderByOptions,
            'query': query
        };
    };
    LiveVariableUtils.prepareTableOptions = function (variable, options, clonedFields) {
        if (variable.operation === 'read') {
            return LiveVariableUtils.prepareTableOptionsForFilterExps(variable, options, clonedFields);
        }
        if (!isDefined(options.searchWithQuery)) {
            options.searchWithQuery = true; //  Using query api instead of  search api
        }
        var filterFields = [];
        var filterOptions = [], orderByFields, orderByOptions, query, optionsQuery;
        clonedFields = clonedFields || variable.filterFields;
        // get the filter fields from the variable
        _.forEach(clonedFields, function (value, key) {
            if (_.isObject(value) && (!options.filterFields || !options.filterFields[key] || options.filterFields[key].logicalOp === 'AND')) {
                value.fieldName = key;
                if (LiveVariableUtils.isStringType(LiveVariableUtils.getSQLFieldType(variable, value))) {
                    value.filterCondition = DB_CONSTANTS.DATABASE_MATCH_MODES[value.matchMode || variable.matchMode];
                }
                value.isVariableFilter = true;
                filterFields.push(value);
            }
        });
        // get the filter fields from the options
        _.forEach(options.filterFields, function (value, key) {
            value.fieldName = key;
            value.filterCondition = DB_CONSTANTS.DATABASE_MATCH_MODES[value.matchMode || options.matchMode || variable.matchMode];
            filterFields.push(value);
        });
        if (variable.operation === 'read' || options.operation === 'read') {
            filterOptions = LiveVariableUtils.getFilterOptions(variable, filterFields, options);
        }
        /*if searchWithQuery is true, then convert the input params into query string. For example if firstName and lastName
         should be sent as params then query string will be q='firstName containing 'someValue' OR lastName containing 'someValue''
         */
        if (options.searchWithQuery && filterOptions.length) {
            // Generate query for variable filter fields. This has AND logical operator
            query = LiveVariableUtils.getSearchQuery(_.filter(filterOptions, { 'isVariableFilter': true }), ' AND ', variable.ignoreCase, options.skipEncode);
            // Generate query for option filter fields. This has default logical operator as OR
            optionsQuery = LiveVariableUtils.getSearchQuery(_.filter(filterOptions, { 'isVariableFilter': undefined }), ' ' + (options.logicalOp || 'AND') + ' ', variable.ignoreCase, options.skipEncode);
            if (optionsQuery) {
                // If both variable and option query are present, merge them with AND
                query = query ? (query + ' AND ( ' + optionsQuery + ' )') : optionsQuery;
            }
        }
        orderByFields = getEvaluatedOrderBy(variable.orderBy, options.orderBy);
        orderByOptions = orderByFields ? 'sort=' + orderByFields : '';
        return {
            'filter': filterOptions,
            'sort': orderByOptions,
            'query': query
        };
    };
    /* Function to check if specified field is of type date*/
    LiveVariableUtils.getFieldType = function (fieldName, variable, relatedField) {
        var fieldType, columns, result;
        if (variable.propertiesMap) {
            columns = variable.propertiesMap.columns || [];
            result = _.find(columns, function (obj) {
                return obj.fieldName === fieldName;
            });
            // if related field name passed, get its type from columns inside the current field
            if (relatedField && result) {
                result = _.find(result.columns, function (obj) {
                    return obj.fieldName === relatedField;
                });
            }
            fieldType = result && result.type;
        }
        return fieldType;
    };
    // Prepare formData for blob columns
    LiveVariableUtils.prepareFormData = function (variableDetails, rowObject) {
        var formData = new FormData();
        formData.rowData = _.clone(rowObject);
        _.forEach(rowObject, function (colValue, colName) {
            if (LiveVariableUtils.getFieldType(colName, variableDetails) === 'blob') {
                if (_.isObject(colValue)) {
                    if (_.isArray(colValue)) {
                        _.forEach(colValue, function (fileObject) {
                            formData.append(colName, fileObject, fileObject.name);
                        });
                    }
                    else {
                        formData.append(colName, colValue, colValue.name);
                    }
                }
                rowObject[colName] = colValue !== null ? '' : null;
            }
        });
        formData.append(SWAGGER_CONSTANTS.WM_DATA_JSON, new Blob([JSON.stringify(rowObject)], {
            type: 'application/json'
        }));
        return formData;
    };
    LiveVariableUtils.traverseFilterExpressions = function (filterExpressions, traverseCallbackFn) {
        if (filterExpressions && filterExpressions.rules) {
            _.forEach(filterExpressions.rules, function (filExpObj, i) {
                if (filExpObj.rules) {
                    LiveVariableUtils.traverseFilterExpressions(filExpObj, traverseCallbackFn);
                }
                else {
                    return triggerFn(traverseCallbackFn, filterExpressions, filExpObj);
                }
            });
        }
    };
    /**
     * Traverses recursively the filterExpressions object and if there is any required field present with no value,
     * then we will return without proceeding further. Its upto the developer to provide the mandatory value,
     * if he wants to assign it in teh onbefore<delete/insert/update>function then make that field in
     * the filter query section as optional
     * @param filterExpressions - recursive rule Object
     * @returns {Object} object or boolean. Object if everything gets validated or else just boolean indicating failure in the validations
     */
    LiveVariableUtils.getFilterExprFields = function (filterExpressions) {
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
     *
     * @param variable
     * @param options
     * @returns {function(*=): *} returns a function which should be called for the where clause.
     * This return function can take a function as argument. This argument function can modify the filter fields
     * before generating where clause.
     */
    LiveVariableUtils.getWhereClauseGenerator = function (variable, options, updatedFilterFields) {
        return function (modifier, skipEncode) {
            var clonedFields = LiveVariableUtils.getFilterExprFields(getClonedObject(updatedFilterFields || variable.filterExpressions));
            // this flag skips the encoding of the query
            if (isDefined(skipEncode)) {
                options.skipEncode = skipEncode;
            }
            if (modifier) {
                // handling the scenario where variable can also have filterFields
                if (options.filterFields) {
                    modifier(clonedFields, options);
                }
                else {
                    modifier(clonedFields);
                }
            }
            return LiveVariableUtils.prepareTableOptions(variable, options, clonedFields).query;
        };
    };
    return LiveVariableUtils;
}());

var isStudioMode = false;
var parseConfig = function (serviceParams) {
    var val, param, config;
    var urlParams = serviceParams.urlParams;
    /*get the config out of baseServiceManager*/
    if (VARIABLE_URLS.hasOwnProperty(serviceParams.target) && VARIABLE_URLS[serviceParams.target].hasOwnProperty(serviceParams.action)) {
        config = getClonedObject(VARIABLE_URLS[serviceParams.target][serviceParams.action]);
        /*To handle dynamic urls, append the serviceParams.config.url with the static url(i.e., config.url)*/
        if (serviceParams.config) {
            config.url = (serviceParams.config.url || '') + config.url;
            config.method = serviceParams.config.method || config.method;
            config.headers = config.headers || {};
            // TODO[Shubham] - change to for - of
            for (var key in serviceParams.config.headers) {
                val = serviceParams.config.headers[key];
                config.headers[key] = val;
            }
        }
        /* check for url parameters to replace the url */
        if (urlParams) {
            for (param in urlParams) {
                if (urlParams.hasOwnProperty(param)) {
                    val = urlParams[param];
                    if (!_.isUndefined(val) && val !== null) {
                        config.url = config.url.replace(new RegExp(':' + param, 'g'), val);
                    }
                }
            }
        }
        /* check for data */
        if (serviceParams.params) {
            config.params = serviceParams.params;
        }
        /* check for data */
        if (!_.isUndefined(serviceParams.data)) {
            config.data = serviceParams.data;
        }
        /* check for data parameters, written to support old service calls (.json calls) */
        if (serviceParams.dataParams) {
            config.data.params = serviceParams.dataParams;
        }
        /* check for headers */
        if (serviceParams.headers) {
            config.headers = serviceParams.headers;
        }
        /* set extra config flags */
        config.byPassResult = serviceParams.byPassResult;
        config.isDirectCall = serviceParams.isDirectCall;
        config.isExtURL = serviceParams.isExtURL;
        config.preventMultiple = serviceParams.preventMultiple;
        config.responseType = serviceParams.responseType;
        return config;
    }
    return null;
};
var generateConnectionParams = function (params, action) {
    var connectionParams, urlParams, requestData;
    requestData = params.data;
    urlParams = {
        projectID: params.projectID,
        service: !_.isUndefined(params.service) ? params.service : 'services',
        dataModelName: params.dataModelName,
        entityName: params.entityName,
        queryName: params.queryName,
        queryParams: params.queryParams,
        procedureName: params.procedureName,
        procedureParams: params.procedureParams,
        id: params.id,
        relatedFieldName: params.relatedFieldName,
        page: params.page,
        size: params.size,
        sort: params.sort
    };
    connectionParams = {
        target: 'DATABASE',
        action: action,
        urlParams: urlParams,
        data: requestData || '',
        config: {
            'url': params.url
        }
    };
    connectionParams = parseConfig(connectionParams);
    // TODO: Remove after backend fix
    connectionParams.url = removeExtraSlashes(connectionParams.url);
    return connectionParams;
};
var initiateAction = function (action, params, successCallback, failureCallback, noproxy) {
    var connectionParams;
    /*
    config      = getClonedObject(config[action]);
    headers     = config && config.headers;

    requestData = params.data;

    urlParams = {
        projectID        : params.projectID,
        service          : !_.isUndefined(params.service) ? params.service : 'services',
        dataModelName    : params.dataModelName,
        entityName       : params.entityName,
        queryName        : params.queryName,
        queryParams      : params.queryParams,
        procedureName    : params.procedureName,
        procedureParams  : params.procedureParams,
        id               : params.id,
        relatedFieldName : params.relatedFieldName,
        page             : params.page,
        size             : params.size,
        sort             : params.sort
    };
    */
    if (params.url && isStudioMode && !noproxy) ;
    else {
        connectionParams = generateConnectionParams(params, action);
        params.operation = action;
        return httpService.sendCallAsObservable({
            url: connectionParams.url,
            method: connectionParams.method,
            data: connectionParams.data,
            headers: connectionParams.headers
        }, params);
    }
};
var ɵ0$3 = initiateAction;
var LVService = {
    searchTableDataWithQuery: function (params, successCallback, failureCallback) { return initiateAction('searchTableDataWithQuery', params, successCallback, failureCallback); },
    executeAggregateQuery: function (params, successCallback, failureCallback) { return initiateAction('executeAggregateQuery', params, successCallback, failureCallback); },
    searchTableData: function (params, successCallback, failureCallback) { return initiateAction('searchTableData', params, successCallback, failureCallback); },
    readTableData: function (params, successCallback, failureCallback) { return initiateAction('readTableData', params, successCallback, failureCallback); },
    insertTableData: function (params, successCallback, failureCallback) { return initiateAction('insertTableData', params, successCallback, failureCallback); },
    insertMultiPartTableData: function (params, successCallback, failureCallback) { return initiateAction('insertMultiPartTableData', params, successCallback, failureCallback); },
    updateTableData: function (params, successCallback, failureCallback) { return initiateAction('updateTableData', params, successCallback, failureCallback); },
    updateCompositeTableData: function (params, successCallback, failureCallback) { return initiateAction('updateCompositeTableData', params, successCallback, failureCallback); },
    periodUpdateCompositeTableData: function (params, successCallback, failureCallback) { return initiateAction('periodUpdateCompositeTableData', params, successCallback, failureCallback); },
    updateMultiPartTableData: function (params, successCallback, failureCallback) { return initiateAction('updateMultiPartTableData', params, successCallback, failureCallback); },
    updateMultiPartCompositeTableData: function (params, successCallback, failureCallback) { return initiateAction('updateMultiPartCompositeTableData', params, successCallback, failureCallback); },
    deleteTableData: function (params, successCallback, failureCallback) { return initiateAction('deleteTableData', params, successCallback, failureCallback); },
    deleteCompositeTableData: function (params, successCallback, failureCallback) { return initiateAction('deleteCompositeTableData', params, successCallback, failureCallback); },
    periodDeleteCompositeTableData: function (params, successCallback, failureCallback) { return initiateAction('periodDeleteCompositeTableData', params, successCallback, failureCallback); },
    exportTableData: function (params) { return initiateAction('exportTableData', params); },
    getDistinctDataByFields: function (params) { return initiateAction('getDistinctDataByFields', params); },
    countTableDataWithQuery: function (params, successCallback, failureCallback) { return initiateAction('countTableDataWithQuery', params, successCallback, failureCallback); }
};

var emptyArr = [];
var LiveVariableManager = /** @class */ (function (_super) {
    __extends(LiveVariableManager, _super);
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

/**
 * Handles variable navigation operations
 * @param variable
 * @param options
 */
var navigate = function (variable, options) {
    variable.dataSet = (options && options.data) || variable.dataSet;
    var viewName;
    var pageName = variable.dataBinding.pageName || variable.pageName, operation = variable.operation, urlParams = variable.dataSet;
    options = options || {};
    /* if operation is goToPage, navigate to the pageName */
    switch (operation) {
        case 'goToPreviousPage':
            navigationService.goToPrevious();
            break;
        case 'gotoPage':
            navigationService.goToPage(pageName, {
                transition: variable.pageTransitions,
                $event: options.$event,
                urlParams: urlParams
            });
            break;
        case 'gotoView':
            viewName = (variable.dataBinding && variable.dataBinding.viewName) || variable.viewName;
            break;
        case 'gotoTab':
            viewName = (variable.dataBinding && variable.dataBinding.tabName) || variable.tabName;
            break;
        case 'gotoAccordion':
            viewName = (variable.dataBinding && variable.dataBinding.accordionName) || variable.accordionName;
            break;
        case 'gotoSegment':
            viewName = (variable.dataBinding && variable.dataBinding.segmentName) || variable.segmentName;
            break;
    }
    /* if view name found, call routine to navigate to it */
    if (viewName) {
        navigationService.goToView(viewName, {
            pageName: pageName,
            transition: variable.pageTransitions,
            $event: options.$event,
            urlParams: urlParams
        }, variable);
    }
};

var BaseActionManager = /** @class */ (function () {
    function BaseActionManager() {
    }
    BaseActionManager.prototype.initBinding = function (variable, bindSource, bindTarget) {
        processBinding(variable, variable._context, bindSource, bindTarget);
    };
    BaseActionManager.prototype.notifyInflight = function (variable, status, data) {
        appManager.notify('toggle-variable-state', {
            variable: variable,
            active: status,
            data: data
        });
    };
    return BaseActionManager;
}());

var NavigationActionManager = /** @class */ (function (_super) {
    __extends(NavigationActionManager, _super);
    function NavigationActionManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NavigationActionManager.prototype.invoke = function (variable, options) {
        navigate(variable, options);
    };
    return NavigationActionManager;
}(BaseActionManager));

var NotificationActionManager = /** @class */ (function (_super) {
    __extends(NotificationActionManager, _super);
    function NotificationActionManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NotificationActionManager.prototype.onToasterClick = function (variable) {
        initiateCallback('onClick', variable, '');
    };
    NotificationActionManager.prototype.onToasterHide = function (variable) {
        initiateCallback('onHide', variable, '');
    };
    NotificationActionManager.prototype.notifyViaToaster = function (variable, options) {
        var type = (options.class || variable.dataBinding.class || 'info').toLowerCase(), body = options.message || variable.dataBinding.text, title = options.title, positionClass = 'toast-' + (options.position || variable.dataBinding.toasterPosition || 'bottom right').replace(' ', '-'), partialPage = variable.dataBinding.page, DEFAULT_DURATION = 3000;
        var duration = parseInt(variable.dataBinding.duration || options.duration, null), toaster;
        // duration
        if (!duration) {
            duration = (duration !== 0 && type === 'success') ? DEFAULT_DURATION : 0;
        }
        if (variable.dataBinding.content && variable.dataBinding.content === 'page' && partialPage) {
            toaster = toasterService.showCustom(partialPage, { positionClass: positionClass, timeOut: duration,
                partialParams: variable._binddataSet, context: variable._context });
        }
        else {
            toaster = toasterService.show(type, title, body || null, { positionClass: positionClass, timeOut: duration, enableHtml: true });
        }
        // callbacks
        if (variable.onClick) {
            toaster.onTap.subscribe(this.onToasterClick.bind(this, variable));
        }
        if (variable.onHide) {
            toaster.onHidden.subscribe(this.onToasterHide.bind(this, variable));
        }
    };
    NotificationActionManager.prototype.notifyViaDialog = function (variable, options) {
        var commonPageDialogId = 'Common' + _.capitalize(variable.operation) + 'Dialog', variableOwner = variable.owner, dialogId = (variableOwner === VARIABLE_CONSTANTS.OWNER.APP) ? commonPageDialogId : 'notification' + variable.operation + 'dialog';
        dialogService.open(dialogId, variable._context, {
            notification: {
                'title': options.title || variable.dataBinding.title,
                'text': options.message || variable.dataBinding.text,
                'okButtonText': options.okButtonText || variable.dataBinding.okButtonText || 'OK',
                'cancelButtonText': options.cancelButtonText || variable.dataBinding.cancelButtonText || 'CANCEL',
                'alerttype': options.alerttype || variable.dataBinding.alerttype || 'information',
                onOk: function () {
                    initiateCallback('onOk', variable, options.data);
                    // Close the action dialog after triggering onOk callback event
                    dialogService.close(dialogId, variable._context);
                },
                onCancel: function () {
                    initiateCallback('onCancel', variable, options.data);
                    // Close the action dialog after triggering onCancel callback event
                    dialogService.close(dialogId, variable._context);
                },
                onClose: function () {
                    initiateCallback('onClose', variable, options.data);
                }
            }
        });
    };
    // *********************************************************** PUBLIC ***********************************************************//
    NotificationActionManager.prototype.notify = function (variable, options, success, error) {
        var operation = variable.operation;
        options = options || {};
        if (operation === 'toast') {
            this.notifyViaToaster(variable, options);
        }
        else {
            this.notifyViaDialog(variable, options);
        }
    };
    NotificationActionManager.prototype.getMessage = function (variable) {
        return variable.dataBinding.text;
    };
    NotificationActionManager.prototype.setMessage = function (variable, text) {
        if (_.isString(text)) {
            variable.dataBinding.text = text;
        }
        return variable.dataBinding.text;
    };
    NotificationActionManager.prototype.getOkButtonText = function (variable) {
        return variable.dataBinding.okButtonText;
    };
    NotificationActionManager.prototype.setOkButtonText = function (variable, text) {
        if (_.isString(text)) {
            variable.dataBinding.okButtonText = text;
        }
        return variable.dataBinding.okButtonText;
    };
    NotificationActionManager.prototype.getToasterDuration = function (variable) {
        return variable.dataBinding.duration;
    };
    NotificationActionManager.prototype.setToasterDuration = function (variable, duration) {
        variable.dataBinding.duration = duration;
        return variable.dataBinding.duration;
    };
    NotificationActionManager.prototype.getToasterClass = function (variable) {
        return variable.dataBinding.class;
    };
    NotificationActionManager.prototype.setToasterClass = function (variable, type) {
        if (_.isString(type)) {
            variable.dataBinding.class = type;
        }
        return variable.dataBinding.class;
    };
    NotificationActionManager.prototype.getToasterPosition = function (variable) {
        return variable.dataBinding.class;
    };
    NotificationActionManager.prototype.setToasterPosition = function (variable, position) {
        if (_.isString(position)) {
            variable.dataBinding.position = position;
        }
        return variable.dataBinding.position;
    };
    NotificationActionManager.prototype.getAlertType = function (variable) {
        return variable.dataBinding.alerttype;
    };
    NotificationActionManager.prototype.setAlertType = function (variable, alerttype) {
        if (_.isString(alerttype)) {
            variable.dataBinding.alerttype = alerttype;
        }
        return variable.dataBinding.alerttype;
    };
    NotificationActionManager.prototype.getCancelButtonText = function (variable) {
        return variable.dataBinding.cancelButtonText;
    };
    NotificationActionManager.prototype.setCancelButtonText = function (variable, text) {
        if (_.isString(text)) {
            variable.dataBinding.cancelButtonText = text;
        }
        return variable.dataBinding.cancelButtonText;
    };
    return NotificationActionManager;
}(BaseActionManager));

var LoginActionManager = /** @class */ (function (_super) {
    __extends(LoginActionManager, _super);
    function LoginActionManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LoginActionManager.prototype.validate = function (params) {
        var err, paramKey, remembermeKey;
        var LOGIN_PARAM_REMEMBER_ME = 'j_rememberme';
        var LOGIN_PARAM_REMEMBER_ME_OLD = ['rememberme', 'remembermecheck'];
        // for older projects
        LOGIN_PARAM_REMEMBER_ME_OLD.forEach(function (old_key) {
            if (_.isBoolean(params[old_key])) {
                remembermeKey = old_key;
            }
        });
        remembermeKey = remembermeKey || LOGIN_PARAM_REMEMBER_ME;
        // check remember me
        params[remembermeKey] = _.isBoolean(params[remembermeKey]) ? params[remembermeKey] : false;
        for (paramKey in params) {
            if (params.hasOwnProperty(paramKey) &&
                (params[paramKey] === '' || params[paramKey] === undefined)) {
                err = 'Please provide required credentials';
                break;
            }
        }
        return err;
    };
    LoginActionManager.prototype.migrateOldParams = function (params) {
        var loginParams = {}, paramMigrationMap = {
            'usernametext': 'j_username',
            'username': 'j_username',
            'passwordtext': 'j_password',
            'password': 'j_password',
            'remembermecheck': 'j_rememberme',
            'rememberme': 'j_rememberme'
        };
        _.each(params, function (value, key) {
            if (paramMigrationMap[key]) {
                loginParams[paramMigrationMap[key]] = value;
            }
            else {
                loginParams[key] = value;
            }
        });
        return loginParams;
    };
    LoginActionManager.prototype.login = function (variable, options, success, error) {
        var _this = this;
        var newDataSet;
        options = options || {};
        // If login info provided along explicitly with options, don't look into the variable bindings for the same
        var loginInfo = options.loginInfo || options.input || variable.dataBinding;
        // client side validation
        var errMsg = this.validate(loginInfo);
        /* if error message initialized, return error */
        if (errMsg) {
            triggerFn(error, errMsg);
            initiateCallback('onError', variable, errMsg);
            return;
        }
        // Triggering 'onBeforeUpdate' and considering
        var params = getClonedObject(loginInfo);
        var output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, params);
        if (_.isObject(output)) {
            params = output;
        }
        else if (output === false) {
            triggerFn(error);
            return;
        }
        // migrate old params to new
        params = this.migrateOldParams(params);
        // get previously loggedInUser name (if any)
        var lastLoggedInUsername = _.get(securityService.get(), 'userInfo.userName');
        this.notifyInflight(variable, true);
        variable.promise = securityService.appLogin(params, function (response) {
            // Closing login dialog after successful login
            dialogService.close('CommonLoginDialog');
            /*
             * Get fresh security config
             * Get App variables. if not loaded
             * Update loggedInUser variable with new user details
             */
            appManager.reloadAppData().
                then(function (config) {
                // EVENT: ON_RESULT
                initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, _.get(config, 'userInfo'));
                // EVENT: ON_PREPARESETDATA
                newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, _.get(config, 'userInfo'));
                if (newDataSet) {
                    // setting newDataSet as the response to service variable onPrepareSetData
                    _.set(config, 'userInfo', newDataSet);
                }
                // hide the spinner after all the n/w calls are completed
                _this.notifyInflight(variable, false, response);
                triggerFn(success);
                setTimeout(function () {
                    // EVENT: ON_SUCCESS
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, _.get(config, 'userInfo'));
                    /* handle navigation if defaultSuccessHandler on variable is true */
                    if (variable.useDefaultSuccessHandler) {
                        var isSameUserReloggedIn = lastLoggedInUsername === params['j_username'];
                        // if first time user logging in or same user re-logging in, execute n/w calls failed before logging in
                        if (!lastLoggedInUsername || isSameUserReloggedIn) {
                            appManager.executeSessionFailureRequests();
                        }
                        // get redirectTo page from URL and remove it from URL
                        var redirectPage = securityService.getCurrentRouteQueryParam('redirectTo'), noRedirect = appManager.noRedirect();
                        // Get query params(page params of page being redirected to) and append to the URL after login.
                        var queryParamsObj = securityService.getRedirectedRouteQueryParams();
                        // The redirectTo param isn't required after login
                        if (queryParamsObj.redirectTo) {
                            delete queryParamsObj.redirectTo;
                        }
                        appManager.noRedirect(false);
                        // first time login
                        if (!lastLoggedInUsername) {
                            // if redirect page found, navigate to it.
                            if (!_.isEmpty(redirectPage)) {
                                routerService.navigate(["/" + redirectPage], { queryParams: queryParamsObj });
                            }
                            else if (!noRedirect) {
                                // simply reset the URL, route handling will take care of page redirection
                                routerService.navigate(["/"]);
                            }
                        }
                        else {
                            // login after a session timeout
                            // if redirect page found and same user logs in again, just navigate to redirect page
                            if (!_.isEmpty(redirectPage)) {
                                // same user logs in again, just redirect to the redirectPage
                                if (lastLoggedInUsername === params['j_username']) {
                                    routerService.navigate(["/" + redirectPage], { queryParams: queryParamsObj });
                                }
                                else {
                                    // different user logs in, reload the app and discard the redirectPage
                                    routerService.navigate(["/"]);
                                    window.location.reload();
                                }
                            }
                            else {
                                var securityConfig = securityService.get(), sessionTimeoutLoginMode = _.get(securityConfig, 'loginConfig.sessionTimeout.type') || 'PAGE';
                                // if in dialog mode and a new user logs in OR login happening through page, reload the app
                                if (!isSameUserReloggedIn || sessionTimeoutLoginMode !== 'DIALOG') {
                                    routerService.navigate(["/"]);
                                    window.location.reload();
                                }
                            }
                        }
                    }
                    // EVENT: ON_CAN_UPDATE
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, _.get(config, 'userInfo'));
                });
            });
        }, function (e) {
            // EVENT: ON_RESULT
            initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, e);
            _this.notifyInflight(variable, false, e);
            var errorMsg = e.error || 'Invalid credentials.';
            var xhrObj = e.details;
            /* if in RUN mode, trigger error events associated with the variable */
            if (CONSTANTS.isRunMode) {
                initiateCallback('onError', variable, errorMsg, xhrObj, true);
            }
            triggerFn(error, errorMsg, xhrObj);
            // EVENT: ON_CAN_UPDATE
            initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, e);
        });
    };
    return LoginActionManager;
}(BaseActionManager));

var LogoutActionManager = /** @class */ (function (_super) {
    __extends(LogoutActionManager, _super);
    function LogoutActionManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LogoutActionManager.prototype.logout = function (variable, options, success, error) {
        var _this = this;
        var handleError, redirectPage, output, newDataSet;
        handleError = function (msg, details, xhrObj) {
            /* if in RUN mode, trigger error events associated with the variable */
            if (!CONSTANTS.isStudioMode) {
                initiateCallback('onError', variable, msg, xhrObj);
            }
            triggerFn(error, msg, xhrObj);
        };
        // EVENT: ON_BEFORE_UPDATE
        output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, null);
        if (output === false) {
            triggerFn(error);
            return;
        }
        securityService.isAuthenticated(function (isAuthenticated) {
            if (isAuthenticated) {
                _this.notifyInflight(variable, true);
                variable.promise = securityService.appLogout(function (response) {
                    var redirectUrl = response.body;
                    redirectUrl = getValidJSON(redirectUrl);
                    // Reset Security Config.
                    // $rootScope.isUserAuthenticated = false;
                    appManager.reloadAppData().
                        then(function () {
                        _this.notifyInflight(variable, false, redirectUrl);
                        // EVENT: ON_RESULT
                        initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, redirectUrl);
                        // EVENT: ON_PREPARESETDATA
                        newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, redirectUrl);
                        if (newDataSet) {
                            // setting newDataSet as the response to service variable onPrepareSetData
                            redirectUrl = newDataSet;
                        }
                        setTimeout(function () {
                            // EVENT: ON_SUCCESS
                            initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, redirectUrl);
                            // EVENT: ON_CAN_UPDATE
                            initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, redirectUrl);
                        });
                    });
                    // In case of CAS response will be the redirectUrl
                    if (redirectUrl && redirectUrl.result) {
                        window.location.href = redirectUrl.result;
                    }
                    else if (variable.useDefaultSuccessHandler) {
                        redirectPage = variable.redirectTo;
                        /* backward compatibility (index.html/login.html may be present in older projects) */
                        if (!redirectPage || redirectPage === 'login.html' || redirectPage === 'index.html') {
                            redirectPage = '';
                        }
                        routerService.navigate(["/" + redirectPage]);
                        // do not reload the mobile app.
                        if (!window['cordova']) {
                            setTimeout(function () {
                                // reloading in timeout as, firefox and safari are not updating the url before reload(WMS-7887)
                                window.location.reload();
                            });
                        }
                    }
                    triggerFn(success);
                }, handleError);
            }
            else {
                handleError('No authenticated user to logout.');
            }
        }, function (err) {
            _this.notifyInflight(variable, false, err);
            handleError(err);
        });
    };
    return LogoutActionManager;
}(BaseActionManager));

var TimerActionManager = /** @class */ (function (_super) {
    __extends(TimerActionManager, _super);
    function TimerActionManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TimerActionManager.prototype.trigger = function (variable, options, success, error) {
        if (isDefined(variable._promise) || CONSTANTS.isStudioMode) {
            return;
        }
        var repeatTimer = variable.repeating, delay = variable.delay || CONSTANTS.DEFAULT_TIMER_DELAY, event = 'onTimerFire', exec = function () {
            initiateCallback(event, variable, {});
        };
        variable._promise = repeatTimer ? setInterval(exec, delay) : setTimeout(function () {
            exec();
            variable._promise = undefined;
        }, delay);
        /*// destroy the timer on scope destruction
        callBackScope.$on('$destroy', function () {
            variable.cancel(variable._promise);
        });*/
        return variable._promise;
    };
    TimerActionManager.prototype.cancel = function (variable) {
        if (isDefined(variable._promise)) {
            if (variable.repeating) {
                clearInterval(variable._promise);
            }
            else {
                clearTimeout(variable._promise);
            }
            variable._promise = undefined;
        }
    };
    return TimerActionManager;
}(BaseActionManager));

/**
 * Device operation registered in this class will be invoked when a device variable requests the operation.
 */
var DeviceVariableManager = /** @class */ (function (_super) {
    __extends(DeviceVariableManager, _super);
    function DeviceVariableManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * A map that contains services and their operations.
         *
         * @type {Map<string, Map<string, DeviceVariableService>>}
         */
        _this.serviceRegistry = new Map();
        return _this;
    }
    /**
     * Invokes the given device variable and returns a promise that is resolved or rejected
     * by the device operation's outcome.
     * @param variable
     * @param options
     * @returns {Promise<any>}
     */
    DeviceVariableManager.prototype.invoke = function (variable, options) {
        var _this = this;
        var service = this.serviceRegistry.get(variable.service);
        if (service == null) {
            initiateCallback('onError', variable, null);
            return Promise.reject("Could not find service '" + service + "'");
        }
        else {
            this.notifyInflight(variable, true);
            return service.invoke(variable, options).then(function (response) {
                _this.notifyInflight(variable, false, response);
                return response;
            }, function (err) {
                _this.notifyInflight(variable, false, err);
                return Promise.reject(err);
            });
        }
    };
    /**
     * Adds an operation under the given service category
     * @param {string} service
     */
    DeviceVariableManager.prototype.registerService = function (service) {
        this.serviceRegistry.set(service.name, service);
    };
    return DeviceVariableManager;
}(BaseVariableManager));

var WebSocketVariableManager = /** @class */ (function (_super) {
    __extends(WebSocketVariableManager, _super);
    function WebSocketVariableManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.scope_var_socket_map = new Map();
        _this.PROPERTY = {
            'SERVICE': 'service',
            'DATA_UPDATE_STRATEGY': 'dataUpdateStrategy',
            'DATA_LIMIT': 'dataLimit'
        };
        _this.DATA_UPDATE_STRATEGY = {
            'REFRESH': 'refresh',
            'PREPEND': 'prepend',
            'APPEND': 'append'
        };
        return _this;
    }
    /**
     * returns the state of property to decide weather to append new messages to dataSet or not
     * @param variable
     * @returns boolean
     */
    WebSocketVariableManager.prototype.shouldAppendData = function (variable) {
        variable = variable || this;
        return variable[this.PROPERTY.DATA_UPDATE_STRATEGY] !== this.DATA_UPDATE_STRATEGY.REFRESH;
    };
    /**
     * returns the state of property to decide weather to APPEND or PREPEND new messages to dataSet
     * @param variable
     * @returns boolean
     */
    WebSocketVariableManager.prototype.shouldAppendLast = function (variable) {
        return variable[this.PROPERTY.DATA_UPDATE_STRATEGY] === this.DATA_UPDATE_STRATEGY.APPEND;
    };
    /**
     * returns upper limit on number of records to be in dataSet
     * this is applicable only when appendData is true
     * @param variable
     * @returns {dataLimit}
     */
    WebSocketVariableManager.prototype.getDataLimit = function (variable) {
        return variable.dataLimit;
    };
    /**
     * get url from wmServiceOperationInfo
     * @param variable
     * @returns {*}
     */
    WebSocketVariableManager.prototype.getURL = function (variable) {
        var prefabName = variable.getPrefabName();
        var opInfo = prefabName ? _.get(metadataService.getByOperationId(variable.operationId, prefabName), 'wmServiceOperationInfo') : _.get(metadataService.getByOperationId(variable.operationId), 'wmServiceOperationInfo');
        var inputFields = variable.dataBinding;
        var config;
        // add sample values to the params (url and path)
        _.forEach(opInfo.parameters, function (param) {
            param.sampleValue = inputFields[param.name];
        });
        // although, no header params will be present, keeping 'skipCloakHeaders' flag if support provided later
        $.extend(opInfo, {
            skipCloakHeaders: true
        });
        // call common method to prepare config for the service operation info.
        config = ServiceVariableUtils.constructRequestParams(variable, opInfo, inputFields);
        /* if error found, return */
        if (config.error && config.error.message) {
            this._onSocketError(variable, { data: config.error.message });
            return;
        }
        return config.url;
    };
    /**
     * handler for onMessage event on a socket connection for a variable
     * the data returned is converted to JSON from string/xml and assigned to dataSet of variable
     * If not able to do so, message is simply assigned to the dataSet of variable
     * If appendData property is set, the message is appended to the dataSet, else it replaces the existing value of dataSet
     * @param variable
     * @param evt
     * @private
     */
    WebSocketVariableManager.prototype._onSocketMessage = function (variable, evt) {
        var data = _.get(evt, 'data'), value, dataLength, dataLimit, shouldAddToLast, insertIdx;
        data = getValidJSON(data) || xmlToJson(data) || data;
        // EVENT: ON_MESSAGE
        value = initiateCallback(VARIABLE_CONSTANTS.EVENT.MESSAGE_RECEIVE, variable, data, evt);
        data = isDefined(value) ? value : data;
        if (this.shouldAppendData(variable)) {
            variable.dataSet = variable.dataSet || [];
            dataLength = variable.dataSet.length;
            dataLimit = this.getDataLimit(variable);
            shouldAddToLast = this.shouldAppendLast(variable);
            if (dataLimit && (dataLength >= dataLimit)) {
                if (shouldAddToLast) {
                    variable.dataSet.shift();
                }
                else {
                    variable.dataSet.pop();
                }
            }
            insertIdx = shouldAddToLast ? dataLength : 0;
            variable.dataSet.splice(insertIdx, 0, data);
        }
        else {
            variable.dataSet = isDefined(value) ? value : data;
        }
    };
    /**
     * calls the ON_BEFORE_SEND callback on the variable
     * @param variable
     * @param message
     * @returns {*}
     * @private
     */
    WebSocketVariableManager.prototype._onBeforeSend = function (variable, message) {
        // EVENT: ON_BEFORE_SEND
        return initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_SEND, variable, message);
    };
    /**
     * calls the ON_BEFORE_CLOSE callback assigned to the variable
     * @param variable
     * @param evt
     * @returns {*}
     * @private
     */
    WebSocketVariableManager.prototype._onBeforeSocketClose = function (variable, evt) {
        // EVENT: ON_BEFORE_CLOSE
        return initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_CLOSE, variable, _.get(evt, 'data'), evt);
    };
    /**
     * calls the ON_BEFORE_OPEN callback assigned
     * called just before the connection is open
     * @param variable
     * @param evt
     * @returns {*}
     * @private
     */
    WebSocketVariableManager.prototype._onBeforeSocketOpen = function (variable, evt) {
        // EVENT: ON_BEFORE_OPEN
        return initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_OPEN, variable, _.get(evt, 'data'), evt);
    };
    /**
     * calls the ON_OPEN event on the variable
     * this is called once the connection is established by the variable with the target WebSocket service
     * @param variable
     * @param evt
     * @private
     */
    WebSocketVariableManager.prototype._onSocketOpen = function (variable, evt) {
        variable._socketConnected = true;
        // EVENT: ON_OPEN
        initiateCallback(VARIABLE_CONSTANTS.EVENT.OPEN, variable, _.get(evt, 'data'), evt);
    };
    /**
     * clears the socket variable against the variable in a scope
     * @param variable
     */
    WebSocketVariableManager.prototype.freeSocket = function (variable) {
        this.scope_var_socket_map.set(variable, undefined);
    };
    /**
     * calls the ON_CLOSE event on the variable
     * this is called on close of an existing connection on a variable
     * @param variable
     * @param evt
     * @private
     */
    WebSocketVariableManager.prototype._onSocketClose = function (variable, evt) {
        variable._socketConnected = false;
        this.freeSocket(variable);
        // EVENT: ON_CLOSE
        initiateCallback(VARIABLE_CONSTANTS.EVENT.CLOSE, variable, _.get(evt, 'data'), evt);
    };
    /**
     * calls the ON_ERROR event on the variable
     * this is called if an error occurs while connecting to the socket service
     * @param variable
     * @param evt
     * @private
     */
    WebSocketVariableManager.prototype._onSocketError = function (variable, evt) {
        variable._socketConnected = false;
        this.freeSocket(variable);
        // EVENT: ON_ERROR
        initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, _.get(evt, 'data') || 'Error while connecting with ' + variable.service, evt);
    };
    /**
     * returns an existing socket connection on the variable
     * if not present, make the connection and return it
     * @param variable
     * @returns {*}
     */
    WebSocketVariableManager.prototype.getSocket = function (variable) {
        var url = this.getURL(variable);
        var _socket = this.scope_var_socket_map.get(variable);
        if (_socket) {
            return _socket;
        }
        // Trigger error if unsecured webSocket is used in secured domain, ignore in mobile device
        if (!CONSTANTS.hasCordova && isInsecureContentRequest(url)) {
            triggerFn(this._onSocketError.bind(this, variable));
            return;
        }
        _socket = new $WebSocket(url);
        _socket.onOpen(this._onSocketOpen.bind(this, variable));
        _socket.onError(this._onSocketError.bind(this, variable));
        _socket.onMessage(this._onSocketMessage.bind(this, variable));
        _socket.onClose(this._onSocketClose.bind(this, variable));
        this.scope_var_socket_map.set(variable, _socket);
        variable._socket = _socket;
        return _socket;
    };
    /**
     * opens a socket connection on the variable.
     * URL & other meta data is fetched from wmServiceOperationInfo
     * @returns {*}
     */
    WebSocketVariableManager.prototype.open = function (variable, success, error) {
        var shouldOpen = this._onBeforeSocketOpen(variable);
        var socket;
        if (shouldOpen === false) {
            triggerFn(error);
            return;
        }
        socket = this.getSocket(variable);
        triggerFn(success);
        return socket;
    };
    /**
     * closes an existing socket connection on variable
     */
    WebSocketVariableManager.prototype.close = function (variable) {
        var shouldClose = this._onBeforeSocketClose(variable), socket = this.getSocket(variable);
        if (shouldClose === false) {
            return;
        }
        socket.close();
    };
    /**
     * sends a message to the existing socket connection on the variable
     * If socket connection not open yet, open a connections and then send
     * if message provide, it is sent, else the one present in RequestBody param is sent
     * @param message
     */
    WebSocketVariableManager.prototype.send = function (variable, message) {
        var socket = this.getSocket(variable);
        var response;
        message = message || _.get(variable, 'dataBinding.RequestBody');
        response = this._onBeforeSend(variable, message);
        if (response === false) {
            return;
        }
        message = isDefined(response) ? response : message;
        message = isObject(message) ? JSON.stringify(message) : message;
        socket.send(message, 0);
    };
    return WebSocketVariableManager;
}(BaseVariableManager));

var managerMap = new Map(), typeToManagerMap = {
    'Variable': BaseVariableManager,
    'Action': BaseActionManager,
    'wm.Variable': ModelVariableManager,
    'wm.ServiceVariable': ServiceVariableManager,
    'wm.LiveVariable': LiveVariableManager,
    'wm.NavigationVariable': NavigationActionManager,
    'wm.NotificationVariable': NotificationActionManager,
    'wm.LoginVariable': LoginActionManager,
    'wm.LogoutVariable': LogoutActionManager,
    'wm.TimerVariable': TimerActionManager,
    'wm.DeviceVariable': DeviceVariableManager,
    'wm.WebSocketVariable': WebSocketVariableManager
};
var VariableManagerFactory = /** @class */ (function () {
    function VariableManagerFactory() {
    }
    VariableManagerFactory.get = function (type) {
        return managerMap.has(type) ?
            managerMap.get(type) :
            managerMap.set(type, new typeToManagerMap[type]()).get(type);
    };
    return VariableManagerFactory;
}());

var DeviceVariableService = /** @class */ (function () {
    function DeviceVariableService() {
    }
    DeviceVariableService.prototype.invoke = function (variable, options) {
        var operation = this.operations.find(function (o) {
            return o.name === variable.operation;
        });
        if (operation == null) {
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, null);
            return Promise.reject("Could not find operation '" + variable.operation + "' in service '" + this.name + "'");
        }
        else if (CONSTANTS.hasCordova) {
            var dataBindings_1 = new Map();
            if (variable.dataBinding !== undefined) {
                Object.entries(variable).forEach(function (o) {
                    dataBindings_1.set(o[0], o[1]);
                });
                Object.entries(variable.dataBinding).forEach(function (o) {
                    dataBindings_1.set(o[0], o[1]);
                });
            }
            return operation.invoke(variable, options, dataBindings_1)
                .then(function (data) {
                variable.dataSet = data;
                $invokeWatchers(true);
                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, data);
                return data;
            }, function (reason) {
                variable.dataSet = {};
                $invokeWatchers(true);
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, null);
                return reason;
            });
        }
        else {
            return Promise.resolve()
                .then(function () {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, operation.model);
                return operation.model;
            });
        }
    };
    return DeviceVariableService;
}());

var DatasetUtil = /** @class */ (function () {
    function DatasetUtil() {
    }
    DatasetUtil.isValidDataset = function (dataSet, isList) {
        if (!dataSet) {
            return false;
        }
        // check array type dataset for list type variable
        if (isList && !_.isArray(dataSet)) {
            return false;
        }
        // change the dataSet
        return dataSet;
    };
    DatasetUtil.getValue = function (dataSet, key, index, isList) {
        index = index || 0;
        // return the value against the specified key
        return isList ? dataSet[index][key] : dataSet[key];
    };
    DatasetUtil.setValue = function (dataSet, key, value, isList) {
        // check param sanity
        if (key && !isList) {
            dataSet[key] = value;
        }
        // return the new dataSet
        return dataSet;
    };
    DatasetUtil.getItem = function (dataSet, index, isList) {
        // return the object against the specified index
        return isList ? dataSet[index] : dataSet;
    };
    DatasetUtil.setItem = function (dataSet, i, value, isList) {
        var index;
        // check param sanity
        if (_.isUndefined(i) || !isList) {
            return dataSet;
        }
        if (_.isObject(i)) {
            index = _.findIndex(dataSet, i);
        }
        else {
            index = i;
        }
        if (index > -1) {
            // set the value against the specified index
            dataSet[index] = value;
        }
        // return the new dataSet
        return dataSet;
    };
    DatasetUtil.addItem = function (dataSet, value, index, isList) {
        // check param sanity
        if (_.isUndefined(value) || !isList) {
            return dataSet;
        }
        // check for index sanity
        index = index !== undefined ? index : dataSet.length;
        // set the value against the specified index
        dataSet.splice(index, 0, value);
        // return the new dataSet
        return dataSet;
    };
    /**
     *
     * @param dataSet
     * @param i, can be index value of the object/element in array
     *      or
     * the whole object which needs to be removed
     * @param exactMatch
     * @returns {any}
     */
    DatasetUtil.removeItem = function (dataSet, i, exactMatch) {
        var index;
        // check for index sanity
        i = i !== undefined ? i : dataSet.length - 1;
        if (_.isObject(i)) {
            index = _.findIndex(dataSet, i);
            // When exactMatch property is set to true delete only when every property values are same*/
            if (index > -1 && (!exactMatch || (exactMatch && _.isEqual(dataSet[index], i)))) {
                dataSet.splice(index, 1);
            }
        }
        else {
            dataSet.splice(i, 1);
        }
        // return the new dataSet
        return dataSet;
    };
    DatasetUtil.getValidDataset = function (isList) {
        return isList ? [] : {};
    };
    DatasetUtil.getCount = function (dataSet, isList) {
        return isList ? dataSet.length : Object.keys(dataSet).length;
    };
    return DatasetUtil;
}());

var BaseVariable = /** @class */ (function () {
    function BaseVariable() {
    }
    BaseVariable.prototype.execute = function (operation, options) {
        var returnVal;
        switch (operation) {
            case DataSource.Operation.GET_NAME:
                returnVal = this.name;
                break;
            case DataSource.Operation.GET_UNIQUE_IDENTIFIER:
                returnVal = this._id;
                break;
            case DataSource.Operation.GET_CONTEXT_IDENTIFIER:
                returnVal = this._context;
                break;
            case DataSource.Operation.ADD_ITEM:
                returnVal = this.addItem(options.item);
                break;
            case DataSource.Operation.SET_ITEM:
                returnVal = this.setItem(options.prevItem, options.item);
                break;
            case DataSource.Operation.REMOVE_ITEM:
                returnVal = this.removeItem(options.item);
                break;
        }
        return returnVal;
    };
    BaseVariable.prototype.getData = function () {
        return this.dataSet;
    };
    BaseVariable.prototype.setData = function (dataSet) {
        if (DatasetUtil.isValidDataset(dataSet, this.isList)) {
            this.dataSet = dataSet;
        }
        return this.dataSet;
    };
    BaseVariable.prototype.getValue = function (key, index) {
        return DatasetUtil.getValue(this.dataSet, key, index, this.isList);
    };
    BaseVariable.prototype.setValue = function (key, value) {
        return DatasetUtil.setValue(this.dataSet, key, value, this.isList);
    };
    BaseVariable.prototype.getItem = function (index) {
        return DatasetUtil.getItem(this.dataSet, index, this.isList);
    };
    /**
     *
     * @param index, a number in ideal case
     *        it can be the object to be replaced by the passed value
     * @param value
     * @returns {any}
     */
    BaseVariable.prototype.setItem = function (index, value) {
        return DatasetUtil.setItem(this.dataSet, index, value, this.isList);
    };
    BaseVariable.prototype.addItem = function (value, index) {
        return DatasetUtil.addItem(this.dataSet, value, index, this.isList);
    };
    BaseVariable.prototype.removeItem = function (index, exactMatch) {
        return DatasetUtil.removeItem(this.dataSet, index, exactMatch);
    };
    BaseVariable.prototype.clearData = function () {
        this.dataSet = DatasetUtil.getValidDataset(this.isList);
        return this.dataSet;
    };
    BaseVariable.prototype.getCount = function () {
        return DatasetUtil.getCount(this.dataSet, this.isList);
    };
    /**
     * Return the prefab name if the variable is form a prefab
     * @returns {string}
     */
    BaseVariable.prototype.getPrefabName = function () {
        // __self__ is a prefab name given to a prefab which is run in preview mode
        return this._context && (this._context.prefabName !== '__self__' && this._context.prefabName);
    };
    return BaseVariable;
}());

var ApiAwareVariable = /** @class */ (function (_super) {
    __extends(ApiAwareVariable, _super);
    function ApiAwareVariable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ApiAwareVariable;
}(BaseVariable));

var getManager = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.DEVICE);
};
var DeviceVariable = /** @class */ (function (_super) {
    __extends(DeviceVariable, _super);
    function DeviceVariable(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    DeviceVariable.prototype.init = function () {
        getManager().initBinding(this);
    };
    DeviceVariable.prototype.invoke = function (options, onSuccess, onError) {
        getManager().invoke(this, options).then(onSuccess, onError);
    };
    return DeviceVariable;
}(ApiAwareVariable));

var getManager$1 = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LIVE);
};
var LiveVariable = /** @class */ (function (_super) {
    __extends(LiveVariable, _super);
    function LiveVariable(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    LiveVariable.prototype.execute = function (operation, options) {
        var returnVal = _super.prototype.execute.call(this, operation, options);
        if (isDefined(returnVal)) {
            return returnVal;
        }
        switch (operation) {
            case DataSource.Operation.IS_API_AWARE:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_CRUD:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_DISTINCT_API:
                returnVal = true;
                break;
            case DataSource.Operation.IS_PAGEABLE:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_SERVER_FILTER:
                returnVal = true;
                break;
            case DataSource.Operation.GET_OPERATION_TYPE:
                returnVal = this.operation;
                break;
            case DataSource.Operation.GET_RELATED_PRIMARY_KEYS:
                returnVal = this.getRelatedTablePrimaryKeys(options);
                break;
            case DataSource.Operation.GET_ENTITY_NAME:
                returnVal = this.propertiesMap.entityName;
                break;
            case DataSource.Operation.LIST_RECORDS:
                returnVal = this.listRecords(options);
                break;
            case DataSource.Operation.UPDATE_RECORD:
                returnVal = this.updateRecord(options);
                break;
            case DataSource.Operation.INSERT_RECORD:
                returnVal = this.insertRecord(options);
                break;
            case DataSource.Operation.DELETE_RECORD:
                returnVal = this.deleteRecord(options);
                break;
            case DataSource.Operation.INVOKE:
                returnVal = this.invoke(options);
                break;
            case DataSource.Operation.UPDATE:
                returnVal = this.update(options);
                break;
            case DataSource.Operation.GET_RELATED_TABLE_DATA:
                returnVal = this.getRelatedTableData(options.relatedField, options);
                break;
            case DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS:
                returnVal = this.getDistinctDataByFields(options);
                break;
            case DataSource.Operation.GET_AGGREGATED_DATA:
                returnVal = this.getAggregatedData(options);
                break;
            case DataSource.Operation.GET_MATCH_MODE:
                returnVal = this.matchMode;
                break;
            case DataSource.Operation.DOWNLOAD:
                returnVal = this.download(options);
                break;
            case DataSource.Operation.GET_PROPERTIES_MAP:
                returnVal = this.propertiesMap;
                break;
            case DataSource.Operation.GET_PRIMARY_KEY:
                returnVal = this.getPrimaryKey();
                break;
            case DataSource.Operation.GET_BLOB_URL:
                returnVal = "services/" + this.liveSource + "/" + this.type + "/" + options.primaryValue + "/content/" + options.columnName;
                break;
            case DataSource.Operation.GET_OPTIONS:
                returnVal = this._options || {};
                break;
            case DataSource.Operation.SEARCH_RECORDS:
                returnVal = this.searchRecords(options);
                break;
            case DataSource.Operation.GET_REQUEST_PARAMS:
                returnVal = this.getRequestParams(options);
                break;
            case DataSource.Operation.GET_PAGING_OPTIONS:
                returnVal = this.pagination;
                break;
            case DataSource.Operation.IS_UPDATE_REQUIRED:
                returnVal = true;
                break;
            case DataSource.Operation.IS_BOUND_TO_LOCALE:
                returnVal = false;
                break;
            case DataSource.Operation.CANCEL:
                returnVal = false;
                break;
            default:
                returnVal = {};
                break;
        }
        return returnVal;
    };
    LiveVariable.prototype.listRecords = function (options, success, error) {
        return getManager$1().listRecords(this, options, success, error);
    };
    LiveVariable.prototype.updateRecord = function (options, success, error) {
        return getManager$1().updateRecord(this, options, success, error);
    };
    LiveVariable.prototype.insertRecord = function (options, success, error) {
        return getManager$1().insertRecord(this, options, success, error);
    };
    LiveVariable.prototype.deleteRecord = function (options, success, error) {
        return getManager$1().deleteRecord(this, options, success, error);
    };
    LiveVariable.prototype.setInput = function (key, val, options) {
        return getManager$1().setInput(this, key, val, options);
    };
    LiveVariable.prototype.setFilter = function (key, val) {
        return getManager$1().setFilter(this, key, val);
    };
    LiveVariable.prototype.download = function (options, success, error) {
        return getManager$1().download(this, options, success, error);
    };
    LiveVariable.prototype.invoke = function (options, success, error) {
        switch (this.operation) {
            case 'insert':
                return this.insertRecord(options, success, error);
            case 'update':
                return this.updateRecord(options, success, error);
            case 'delete':
                return this.deleteRecord(options, success, error);
            default:
                return this.listRecords(options, success, error);
        }
    };
    LiveVariable.prototype.getRelatedTablePrimaryKeys = function (columnName) {
        return getManager$1().getRelatedTablePrimaryKeys(this, columnName);
    };
    LiveVariable.prototype.getRelatedTableData = function (columnName, options, success, error) {
        return getManager$1().getRelatedTableData(this, columnName, options, success, error);
    };
    LiveVariable.prototype.getDistinctDataByFields = function (options, success, error) {
        return getManager$1().getDistinctDataByFields(this, options, success, error);
    };
    LiveVariable.prototype.getAggregatedData = function (options, success, error) {
        return getManager$1().getAggregatedData(this, options, success, error);
    };
    LiveVariable.prototype.getPrimaryKey = function () {
        return getManager$1().getPrimaryKey(this);
    };
    LiveVariable.prototype.searchRecords = function (options, success, error) {
        return getManager$1().searchRecords(this, options, success, error);
    };
    LiveVariable.prototype.getRequestParams = function (options) {
        return getManager$1().prepareRequestParams(options);
    };
    LiveVariable.prototype._downgradeInputData = function (data) {
        return getManager$1().downgradeFilterExpressionsToInputData(this, data);
    };
    LiveVariable.prototype._upgradeInputData = function (response, data) {
        return getManager$1().upgradeInputDataToFilterExpressions(this, response, data);
    };
    LiveVariable.prototype.setOrderBy = function (expression) {
        this.orderBy = expression;
        /* update the variable if autoUpdate flag is set */
        if (this.autoUpdate) {
            this.update();
        }
        return this.orderBy;
    };
    // legacy method
    LiveVariable.prototype.update = function (options, success, error) {
        return this.invoke(options, success, error);
    };
    LiveVariable.prototype.createRecord = function (options, success, error) {
        return this.insertRecord(options, success, error);
    };
    LiveVariable.prototype.init = function () {
        getManager$1().initBinding(this, 'dataBinding', this.operation === 'read' ? 'filterFields' : 'inputFields');
        if (this.operation === 'read') {
            getManager$1().initFilterExpressionBinding(this);
        }
        getManager$1().defineFirstLastRecord(this);
    };
    LiveVariable.prototype.cancel = function (options) {
        return getManager$1().cancel(this, options);
    };
    return LiveVariable;
}(ApiAwareVariable));

var BaseAction = /** @class */ (function () {
    function BaseAction() {
    }
    BaseAction.prototype.execute = function (operation, options) {
        var returnVal;
        switch (operation) {
            case DataSource.Operation.GET_NAME:
                returnVal = this.name;
                break;
            case DataSource.Operation.GET_UNIQUE_IDENTIFIER:
                returnVal = this._id;
                break;
            case DataSource.Operation.GET_CONTEXT_IDENTIFIER:
                returnVal = this._context;
                break;
        }
        return returnVal;
    };
    BaseAction.prototype.getData = function () {
        return this.dataSet;
    };
    BaseAction.prototype.setData = function (dataSet) {
        if (DatasetUtil.isValidDataset(dataSet)) {
            this.dataSet = dataSet;
        }
        return this.dataSet;
    };
    BaseAction.prototype.getValue = function (key, index) {
        return DatasetUtil.getValue(this.dataSet, key, index);
    };
    BaseAction.prototype.setValue = function (key, value) {
        return DatasetUtil.setValue(this.dataSet, key, value);
    };
    BaseAction.prototype.getItem = function (index) {
        return DatasetUtil.getItem(this.dataSet, index);
    };
    /**
     *
     * @param index, a number in ideal case
     *        it can be the object to be replaced by the passed value
     * @param value
     * @returns {any}
     */
    BaseAction.prototype.setItem = function (index, value) {
        return DatasetUtil.setItem(this.dataSet, index, value);
    };
    BaseAction.prototype.addItem = function (value, index) {
        return DatasetUtil.addItem(this.dataSet, value, index);
    };
    BaseAction.prototype.removeItem = function (index, exactMatch) {
        return DatasetUtil.removeItem(this.dataSet, index, exactMatch);
    };
    BaseAction.prototype.clearData = function () {
        this.dataSet = DatasetUtil.getValidDataset();
        return this.dataSet;
    };
    BaseAction.prototype.getCount = function () {
        return DatasetUtil.getCount(this.dataSet);
    };
    BaseAction.prototype.init = function () {
    };
    return BaseAction;
}());

var getManager$2 = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.NAVIGATION);
};
var NavigationAction = /** @class */ (function (_super) {
    __extends(NavigationAction, _super);
    function NavigationAction(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    NavigationAction.prototype.invoke = function (options) {
        getManager$2().invoke(this, options);
    };
    // legacy method.
    NavigationAction.prototype.navigate = function (options) {
        this.invoke(options);
    };
    NavigationAction.prototype.init = function () {
        // static property bindings
        getManager$2().initBinding(this, 'dataBinding', 'dataBinding');
        // dynamic property bindings (e.g. page params)
        getManager$2().initBinding(this, 'dataSet', 'dataSet');
    };
    return NavigationAction;
}(BaseAction));

var getManager$3 = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.MODEL);
};
var ModelVariable = /** @class */ (function (_super) {
    __extends(ModelVariable, _super);
    function ModelVariable(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    ModelVariable.prototype.init = function () {
        if (this.isList) {
            getManager$3().removeFirstEmptyObject(this);
        }
        getManager$3().initBinding(this, 'dataBinding', 'dataSet');
    };
    ModelVariable.prototype.execute = function (operation, options) {
        var returnVal = _super.prototype.execute.call(this, operation, options);
        if (isDefined(returnVal)) {
            return returnVal;
        }
        switch (operation) {
            case DataSource.Operation.IS_API_AWARE:
                returnVal = false;
                break;
            case DataSource.Operation.SUPPORTS_CRUD:
                returnVal = false;
                break;
            case DataSource.Operation.SUPPORTS_DISTINCT_API:
                returnVal = false;
                break;
            case DataSource.Operation.IS_PAGEABLE:
                returnVal = false;
                break;
            case DataSource.Operation.SUPPORTS_SERVER_FILTER:
                returnVal = false;
                break;
            case DataSource.Operation.IS_BOUND_TO_LOCALE:
                returnVal = this.isBoundToLocale();
                break;
            case DataSource.Operation.GET_DEFAULT_LOCALE:
                returnVal = this.getDefaultLocale();
                break;
            default:
                returnVal = {};
                break;
        }
        return returnVal;
    };
    ModelVariable.prototype.isBoundToLocale = function () {
        return this.name === 'supportedLocale';
    };
    ModelVariable.prototype.getDefaultLocale = function () {
        return appManager.getSelectedLocale();
    };
    return ModelVariable;
}(BaseVariable));

var getManager$4 = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.SERVICE);
};
var ServiceVariable = /** @class */ (function (_super) {
    __extends(ServiceVariable, _super);
    function ServiceVariable(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    ServiceVariable.prototype.execute = function (operation, options) {
        var returnVal = _super.prototype.execute.call(this, operation, options);
        if (isDefined(returnVal)) {
            return returnVal;
        }
        switch (operation) {
            case DataSource.Operation.IS_API_AWARE:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_CRUD:
                returnVal = false;
                break;
            case DataSource.Operation.SUPPORTS_DISTINCT_API:
                returnVal = false;
                break;
            case DataSource.Operation.IS_PAGEABLE:
                returnVal = (this.controller === VARIABLE_CONSTANTS.CONTROLLER_TYPE.QUERY || !_.isEmpty(this.pagination));
                break;
            case DataSource.Operation.SUPPORTS_SERVER_FILTER:
                returnVal = false;
                break;
            case DataSource.Operation.SET_INPUT:
                returnVal = this.setInput(options);
                break;
            case DataSource.Operation.LIST_RECORDS:
                returnVal = this.invoke(options);
                break;
            case DataSource.Operation.INVOKE:
                returnVal = this.invoke(options);
                break;
            case DataSource.Operation.UPDATE:
                returnVal = this.update(options);
                break;
            case DataSource.Operation.SEARCH_RECORDS:
                returnVal = this.searchRecords(options);
                break;
            case DataSource.Operation.DOWNLOAD:
                returnVal = this.download(options);
                break;
            case DataSource.Operation.GET_PAGING_OPTIONS:
                returnVal = this.pagination;
                break;
            case DataSource.Operation.IS_UPDATE_REQUIRED:
                returnVal = this.isUpdateRequired(options);
                break;
            case DataSource.Operation.IS_BOUND_TO_LOCALE:
                returnVal = false;
                break;
            case DataSource.Operation.CANCEL:
                returnVal = this.cancel(options);
                break;
            default:
                returnVal = {};
                break;
        }
        return returnVal;
    };
    ServiceVariable.prototype.invoke = function (options, success, error) {
        return getManager$4().invoke(this, options, success, error);
    };
    ServiceVariable.prototype.update = function (options, success, error) {
        return getManager$4().invoke(this, options, success, error);
    };
    ServiceVariable.prototype.download = function (options, success, error) {
        return getManager$4().download(this, options, success, error);
    };
    ServiceVariable.prototype.setInput = function (key, val, options) {
        return getManager$4().setInput(this, key, val, options);
    };
    ServiceVariable.prototype.searchRecords = function (options, success, error) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            getManager$4().searchRecords(_this, options, function (response, pagination) {
                resolve({ data: response.content || response, pagination: pagination });
            }, reject);
        });
    };
    ServiceVariable.prototype.isUpdateRequired = function (hasData) {
        var inputFields = getManager$4().getInputParms(this);
        var queryParams = ServiceVariableUtils.excludePaginationParams(inputFields);
        if (!queryParams.length) {
            // if we don't have any query params and variable data is available then we don't need variable update, so return false
            if (hasData) {
                return false;
            }
        }
        return true;
    };
    ServiceVariable.prototype.cancel = function (options) {
        return getManager$4().cancel(this, options);
    };
    ServiceVariable.prototype.init = function () {
        getManager$4().initBinding(this);
        getManager$4().defineFirstLastRecord(this);
    };
    return ServiceVariable;
}(ApiAwareVariable));

var getManager$5 = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.NOTIFICATION);
};
var NotificationAction = /** @class */ (function (_super) {
    __extends(NotificationAction, _super);
    function NotificationAction(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    NotificationAction.prototype.execute = function (operation, options) {
        var _this = this;
        var returnVal = _super.prototype.execute.call(this, operation, options);
        if (isDefined(returnVal)) {
            return returnVal;
        }
        return new Promise(function (resolve, reject) {
            switch (operation) {
                case DataSource.Operation.INVOKE:
                    _this.invoke(options, resolve, reject);
                    break;
                case DataSource.Operation.NOTIFY:
                    _this.notify(options, resolve, reject);
                    break;
                default:
                    reject(operation + " operation is not supported on this data source");
                    break;
            }
        });
    };
    // Backward compatible method
    NotificationAction.prototype.notify = function (options, success, error) {
        getManager$5().notify(this, options, success, error);
    };
    NotificationAction.prototype.invoke = function (options, success, error) {
        this.notify(options, success, error);
    };
    NotificationAction.prototype.getMessage = function () {
        return getManager$5().getMessage(this);
    };
    NotificationAction.prototype.setMessage = function (text) {
        return getManager$5().setMessage(this, text);
    };
    NotificationAction.prototype.clearMessage = function () {
        return getManager$5().setMessage(this, '');
    };
    NotificationAction.prototype.getOkButtonText = function () {
        return getManager$5().getOkButtonText(this);
    };
    NotificationAction.prototype.setOkButtonText = function (text) {
        return getManager$5().setOkButtonText(this, text);
    };
    NotificationAction.prototype.getToasterDuration = function () {
        return getManager$5().getToasterDuration(this);
    };
    NotificationAction.prototype.setToasterDuration = function (duration) {
        return getManager$5().setToasterDuration(this, duration);
    };
    NotificationAction.prototype.getToasterClass = function () {
        return getManager$5().getToasterClass(this);
    };
    NotificationAction.prototype.setToasterClass = function (classText) {
        return getManager$5().setToasterClass(this, classText);
    };
    NotificationAction.prototype.getToasterPosition = function () {
        return getManager$5().getToasterPosition(this);
    };
    NotificationAction.prototype.setToasterPosition = function (position) {
        return getManager$5().setToasterPosition(this, position);
    };
    NotificationAction.prototype.getAlertType = function () {
        return getManager$5().getAlertType(this);
    };
    NotificationAction.prototype.setAlertType = function (type) {
        return getManager$5().setAlertType(this, type);
    };
    NotificationAction.prototype.getCancelButtonText = function () {
        return getManager$5().getCancelButtonText(this);
    };
    NotificationAction.prototype.setCancelButtonText = function (text) {
        return getManager$5().setCancelButtonText(this, text);
    };
    NotificationAction.prototype.init = function () {
        // static property bindings
        getManager$5().initBinding(this, 'dataBinding', 'dataBinding');
        // dynamic property bindings
        getManager$5().initBinding(this, 'dataSet', 'dataSet');
    };
    return NotificationAction;
}(BaseAction));

var getManager$6 = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LOGIN);
};
var LoginAction = /** @class */ (function (_super) {
    __extends(LoginAction, _super);
    function LoginAction(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    LoginAction.prototype.login = function (options, success, error) {
        return getManager$6().login(this, options, success, error);
    };
    LoginAction.prototype.invoke = function (options, success, error) {
        return this.login(options, success, error);
    };
    LoginAction.prototype.cancel = function () {
        // TODO[VIBHU]: implement http abort logic
    };
    LoginAction.prototype.init = function () {
        getManager$6().initBinding(this, 'dataBinding', 'dataBinding');
    };
    return LoginAction;
}(BaseAction));

var getManager$7 = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LOGOUT);
};
var LogoutAction = /** @class */ (function (_super) {
    __extends(LogoutAction, _super);
    function LogoutAction(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    LogoutAction.prototype.logout = function (options, success, error) {
        getManager$7().logout(this, options, success, error);
    };
    LogoutAction.prototype.invoke = function (options, success, error) {
        this.logout(options, success, error);
    };
    LogoutAction.prototype.cancel = function () {
        // TODO[VIBHU]: implement http abort logic
    };
    return LogoutAction;
}(BaseAction));

var getManager$8 = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.TIMER);
};
var TimerAction = /** @class */ (function (_super) {
    __extends(TimerAction, _super);
    function TimerAction(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    // Backward compatible method
    TimerAction.prototype.fire = function (options, success, error) {
        return getManager$8().trigger(this, options, success, error);
    };
    TimerAction.prototype.invoke = function (options, success, error) {
        return this.fire(options, success, error);
    };
    TimerAction.prototype.cancel = function () {
        return getManager$8().cancel(this);
    };
    return TimerAction;
}(BaseAction));

var getManager$9 = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.WEBSOCKET);
};
var WebSocketVariable = /** @class */ (function (_super) {
    __extends(WebSocketVariable, _super);
    function WebSocketVariable(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    WebSocketVariable.prototype.open = function (success, error) {
        return getManager$9().open(this, success, error);
    };
    WebSocketVariable.prototype.close = function () {
        return getManager$9().close(this);
    };
    WebSocketVariable.prototype.update = function () {
        return getManager$9().update(this);
    };
    WebSocketVariable.prototype.send = function (message) {
        return getManager$9().send(this, message);
    };
    WebSocketVariable.prototype.cancel = function () {
        return this.close();
    };
    WebSocketVariable.prototype.invoke = function (options, success, error) {
        this.open(success, error);
    };
    WebSocketVariable.prototype.init = function () {
        getManager$9().initBinding(this);
    };
    return WebSocketVariable;
}(ApiAwareVariable));

var VariableFactory = /** @class */ (function () {
    function VariableFactory() {
    }
    VariableFactory.create = function (variable, context) {
        var variableInstance;
        switch (variable.category) {
            case VARIABLE_CONSTANTS.CATEGORY.MODEL:
                variableInstance = new ModelVariable(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.SERVICE:
                variableInstance = new ServiceVariable(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.LIVE:
                variableInstance = new LiveVariable(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.DEVICE:
                variableInstance = new DeviceVariable(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.NAVIGATION:
                variableInstance = new NavigationAction(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.NOTIFICATION:
                variableInstance = new NotificationAction(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.LOGIN:
                variableInstance = new LoginAction(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.LOGOUT:
                variableInstance = new LogoutAction(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.TIMER:
                variableInstance = new TimerAction(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.WEBSOCKET:
                variableInstance = new WebSocketVariable(variable);
        }
        variableInstance._context = context;
        variableInstance.__cloneable__ = false;
        return variableInstance;
    };
    return VariableFactory;
}());

var MetadataService = /** @class */ (function () {
    function MetadataService($http) {
        this.$http = $http;
        this.CONTEXT_APP = 'app';
    }
    MetadataService.prototype.isLoaded = function () {
        return this.metadataMap ? this.metadataMap.has(this.CONTEXT_APP) : false;
    };
    MetadataService.prototype.load = function (prefabName) {
        var _this = this;
        var url;
        if (hasCordova()) {
            url = 'metadata/' + (prefabName ? "prefabs/" + prefabName + "/" : 'app/') + 'service-definitions.json';
        }
        else {
            url = './services/' + (prefabName ? "prefabs/" + prefabName + "/" : '') + 'servicedefs';
        }
        return new Promise(function (resolve, reject) {
            _this.$http.send({ 'url': url, 'method': 'GET' }).then(function (response) {
                _this.metadataMap = _this.metadataMap || new Map();
                _this.metadataMap.set(prefabName || _this.CONTEXT_APP, response.body);
                resolve(response.body);
            }, reject);
        });
    };
    MetadataService.prototype.getByOperationId = function (operationId, context) {
        context = context || this.CONTEXT_APP;
        var map = this.metadataMap.get(context);
        return map && map[operationId];
    };
    MetadataService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    MetadataService.ctorParameters = function () { return [
        { type: AbstractHttpService }
    ]; };
    return MetadataService;
}());

var VariablesService = /** @class */ (function () {
    function VariablesService(httpService$$1, metadataService$$1, navigationService$$1, routerService$$1, toasterService$$1, oAuthService, securityService$$1, dialogService$$1) {
        this.httpService = httpService$$1;
        this.metadataService = metadataService$$1;
        this.navigationService = navigationService$$1;
        this.routerService = routerService$$1;
        this.toasterService = toasterService$$1;
        this.oAuthService = oAuthService;
        this.securityService = securityService$$1;
        this.dialogService = dialogService$$1;
        // set external dependencies, to be used across variable classes, managers and utils
        setDependency('http', this.httpService);
        setDependency('metadata', this.metadataService);
        setDependency('navigationService', this.navigationService);
        setDependency('router', this.routerService);
        setDependency('toaster', this.toasterService);
        setDependency('oAuth', this.oAuthService);
        setDependency('security', this.securityService);
        setDependency('dialog', this.dialogService);
    }
    /**
     * loop through a collection of variables/actions
     * trigger cancel on each (of exists)
     * @param collection
     */
    VariablesService.prototype.bulkCancel = function (collection) {
        Object.keys(collection).forEach(function (name) {
            var variable = collection[name];
            if (_.isFunction(variable.cancel)) {
                variable.cancel();
            }
        });
    };
    /**
     * loops over the variable/actions collection and trigger invoke on it if startUpdate on it is true
     * @param collection
     */
    VariablesService.prototype.triggerStartUpdate = function (collection) {
        return Promise.all(Object.keys(collection)
            .map(function (name) { return collection[name]; })
            .filter(function (variable) { return variable.startUpdate && variable.invoke; })
            .map(function (variable) { return variable.invoke(); }));
    };
    /**
     * Takes the raw variables and actions json as input
     * Initialize the variable and action instances through the factory
     * collect the variables and actions in separate maps and return the collection
     * @param {string} page
     * @param variablesJson
     * @param scope
     * @returns {Variables , Actions}
     */
    VariablesService.prototype.register = function (page, variablesJson, scope) {
        var _this = this;
        var variableInstances = {
            Variables: {},
            Actions: {},
            callback: this.triggerStartUpdate
        };
        var varInstance;
        for (var variableName in variablesJson) {
            varInstance = VariableFactory.create(variablesJson[variableName], scope);
            varInstance.init();
            // if action type, put it in Actions namespace
            if (varInstance instanceof BaseAction) {
                variableInstances.Actions[variableName] = varInstance;
            }
            else {
                variableInstances.Variables[variableName] = varInstance;
            }
        }
        // if the context has onDestroy listener, subscribe the event and trigger cancel on all varibales
        if (scope.registerDestroyListener) {
            scope.registerDestroyListener(function () {
                _this.bulkCancel(variableInstances.Variables);
                _this.bulkCancel(variableInstances.Actions);
            });
        }
        return variableInstances;
    };
    VariablesService.prototype.destroy = function () {
    };
    VariablesService.prototype.registerDependency = function (name, ref) {
        setDependency(name, ref);
    };
    VariablesService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    VariablesService.ctorParameters = function () { return [
        { type: AbstractHttpService },
        { type: MetadataService },
        { type: AbstractNavigationService },
        { type: Router },
        { type: AbstractToasterService },
        { type: OAuthService },
        { type: SecurityService },
        { type: AbstractDialogService }
    ]; };
    return VariablesService;
}());

var toastrModule = ToastrModule.forRoot({ maxOpened: 1, autoDismiss: true });
var VariablesModule = /** @class */ (function () {
    function VariablesModule() {
    }
    VariablesModule.forRoot = function () {
        return {
            ngModule: VariablesModule,
            providers: [
                VariablesService,
                MetadataService,
                Location,
                { provide: LocationStrategy, useClass: HashLocationStrategy }
            ]
        };
    };
    VariablesModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        CommonModule,
                        toastrModule,
                        HttpClientModule,
                        HttpServiceModule,
                        OAuthModule,
                        SecurityModule
                    ],
                    declarations: []
                },] }
    ];
    return VariablesModule;
}());

/**
 * Generated bundle index. Do not edit.
 */

export { BaseActionManager as ɵb, LoginActionManager as ɵh, LogoutActionManager as ɵi, NavigationActionManager as ɵf, NotificationActionManager as ɵg, TimerActionManager as ɵj, BaseVariableManager as ɵa, LiveVariableManager as ɵe, ModelVariableManager as ɵc, ServiceVariableManager as ɵd, WebSocketVariableManager as ɵk, CONSTANTS, VARIABLE_CONSTANTS, WS_CONSTANTS, DB_CONSTANTS, SWAGGER_CONSTANTS, VARIABLE_URLS, $rootScope, VariableManagerFactory, DeviceVariableManager, DeviceVariableService, VariablesService, MetadataService, parseConfig, generateConnectionParams, LVService, ɵ0$3 as ɵ0, LiveVariableUtils, appManager, httpService, metadataService, navigationService, routerService, toasterService, oauthService, securityService, dialogService, setDependency, initiateCallback, processBinding, simulateFileDownload, setInput, isFileUploadSupported, getEvaluatedOrderBy, formatExportExpression, debounceVariableCall, formatDate, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5, ɵ6, ɵ7, ɵ8, ɵ9, ɵ10, ɵ11, ɵ12, ɵ13, ɵ14, ɵ15, ɵ16, ɵ17, toastrModule, VariablesModule };

//# sourceMappingURL=index.js.map