import { $WebSocket } from 'angular2-websocket/angular2-websocket';
import { Router } from '@angular/router';
import { extractType, DataType, DEFAULT_FORMATS, $parseEvent, $watch, findValueOf, getBlob, getClonedObject, stringStartsWith, triggerFn, isDateTimeType, isDefined, replace, $invokeWatchers, getValidJSON, isPageable, isValidWebURL, noop, xmlToJson, hasCordova, isNumberType, removeExtraSlashes, processFilterExpBindNode, isInsecureContentRequest, isObject, DataSource, AbstractHttpService, AbstractDialogService, AbstractNavigationService, AbstractToasterService } from '@wm/core';
import { Injectable, NgModule } from '@angular/core';
import { CommonModule, HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { HttpServiceModule } from '@wm/http';
import { SecurityService, SecurityModule } from '@wm/security';
import { OAuthService, OAuthModule } from '@wm/oAuth';

const CONSTANTS = {
    hasCordova: window['cordova'] !== undefined,
    isWaveLens: window['WaveLens'] !== undefined,
    isStudioMode: false,
    isRunMode: true,
    XSRF_COOKIE_NAME: 'wm_xsrf_token',
    DEFAULT_TIMER_DELAY: 500,
    WIDGET_DOESNT_EXIST: 'The widget you\'re trying to navigate to doesn\'t exist on this page'
};
const VARIABLE_CONSTANTS = {
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
const WS_CONSTANTS = {
    NON_BODY_HTTP_METHODS: ['GET', 'HEAD'],
    CONTENT_TYPES: {
        FORM_URL_ENCODED: 'application/x-www-form-urlencoded',
        MULTIPART_FORMDATA: 'multipart/form-data',
        OCTET_STREAM: 'application/octet-stream'
    }
};
const DB_CONSTANTS = {
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
const SWAGGER_CONSTANTS = {
    WM_DATA_JSON: 'wm_data_json',
    WM_HTTP_JSON: 'wm_httpRequestDetails'
};
const VARIABLE_URLS = {
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
const $rootScope = {
    project: {
        deployedUrl: './',
        id: 'temp_id'
    },
    projectName: 'test_project_name',
    isApplicationType: true
};

const exportTypesMap = { 'EXCEL': '.xlsx', 'CSV': '.csv' };
let appManager;
let httpService;
let metadataService;
let navigationService;
let routerService;
let toasterService;
let oauthService;
let securityService;
let dialogService;
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
const setDependency = (type, ref) => {
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
const initiateCallback = (type, variable, data, options, skipDefaultNotification) => {
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
    const target = obj.target, targetObj = getTargetObj(obj, root, variable), targetNodeKey = getTargetNodeKey(target);
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
const processBinding = (variable, context, bindSource, bindTarget) => {
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
const simulateFileDownload = (requestParams, fileName, exportFormat, success, error) => {
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
const setInput = (targetObj, key, val, options) => {
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
const isFileUploadSupported = () => {
    return (window.File && window.FileReader && window.FileList && window.Blob);
};
/**
 *
 * @param varOrder
 * @param optionsOrder
 * @returns {any}
 */
const getEvaluatedOrderBy = (varOrder, optionsOrder) => {
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
const formatExportExpression = fieldDefs => {
    _.forEach(fieldDefs, function (fieldDef) {
        if (fieldDef.expression) {
            fieldDef.expression = '${' + fieldDef.expression + '}';
        }
    });
    return fieldDefs;
};
const debounceVariableCall = _invoke;
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
const formatDate = (value, type) => {
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

class BaseVariableManager {
    initBinding(variable, bindSource, bindTarget) {
        processBinding(variable, variable._context, bindSource, bindTarget);
    }
    notifyInflight(variable, status, data) {
        appManager.notify('toggle-variable-state', {
            variable: variable,
            active: status,
            data: data
        });
    }
    /**
     * This method makes the final angular http call that returns an observable.
     * We attach this observable to variable to cancel a network call
     * @param requestParams
     * @param variable
     * @param dbOperation
     */
    httpCall(requestParams, variable, params) {
        return new Promise((resolve, reject) => {
            variable._observable = httpService.sendCallAsObservable(requestParams, params).subscribe((response) => {
                if (response && response.type) {
                    resolve(response);
                }
            }, (err) => {
                if (httpService.isPlatformSessionTimeout(err)) {
                    // send the notification manually to hide any context spinners on page.
                    // [TODO]: any spinners on widget listening on this variable will also go off. Need to see an approach to sovle that.
                    this.notifyInflight(variable, false, err);
                    err._401Subscriber.asObservable().subscribe(response => resolve(response), e => reject(e));
                }
                else {
                    reject(err);
                }
            });
        });
    }
    /**
     * This method prepares the options parameter for variable callbacks.
     * @param xhrObj, The xhrObj to be passed
     * @param moreOptions, any other info to be passed in the options param
     */
    prepareCallbackOptions(xhrObj, moreOptions) {
        let options = {};
        options['xhrObj'] = xhrObj;
        if (moreOptions) {
            _.extend(options, moreOptions);
        }
        return options;
    }
}

const checkEmptyObject = (obj) => {
    let isEmpty = true;
    _.forEach(obj, (value) => {
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
class ModelVariableManager extends BaseVariableManager {
    /*
    * Case: a LIST type static variable having only one object
    * and the object has all fields empty, remove that object
    */
    removeFirstEmptyObject(variable) {
        if (_.isArray(variable.dataSet) && variable.dataSet.length === 1 && checkEmptyObject(variable.dataSet[0])) {
            variable.dataSet = [];
        }
    }
}

class NotifyPromise {
    constructor(fn) {
        const notifyQueue = [], notify = status => {
            notifyQueue.forEach(fn1 => {
                fn1(status);
            });
        };
        const cleanUp = function () {
            notifyQueue.length = 0;
        };
        const p1 = new Promise((res, rej) => {
            fn(res, rej, notify);
        });
        p1.superThen = p1.then.bind(p1);
        p1.then = (onResolve, onReject, onNotify) => {
            p1.superThen(response => {
                onResolve(response);
                cleanUp();
            }, reason => {
                onResolve(reason);
                cleanUp();
            });
            if (onNotify) {
                notifyQueue.push(onNotify);
            }
        };
        return p1;
    }
}
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
    const cloneFD = new FormData();
    const iterate = (value, key) => {
        const fileObject = (_.isArray(value) ? value[0] : value);
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
    const promise = new NotifyPromise((resolve, reject, notify) => {
        const request = httpService.upload(url, cloneFD).subscribe(event => {
            if (event.type === HTTP_EVENT_TYPE.UploadProgress) {
                const uploadProgress = Math.round(100 * event.loaded / event.total);
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

const performAuthorization = (url, providerId, onSuccess, onError) => {
    oauthService.perfromOAuthorization(url, providerId, onSuccess, onError);
};
const getAccessToken = (provider, checkLoaclStorage) => {
    return oauthService.getAccessToken(provider, checkLoaclStorage);
};
const removeAccessToken = (provider) => {
    oauthService.removeAccessToken(provider);
};

/**
 * returns true if a Service variable is:
 *  - for a query/procedure
 *  - performs a PUT/POST operation, i.e, takes a Request Body as input
 * @param variable
 * @returns {any}
 */
const isBodyTypeQueryOrProcedure = (variable) => {
    return (_.includes(['QueryExecution', 'ProcedureExecution'], variable.controller)) && (_.includes(['put', 'post'], variable.operationType));
};
/**
 * returns true if the variable is a Query service variable
 * @param {string} controller
 * @param {string} serviceType
 * @returns {boolean}
 */
const isQueryServiceVar = (controller, serviceType) => {
    return controller === VARIABLE_CONSTANTS.CONTROLLER_TYPE.QUERY && serviceType === VARIABLE_CONSTANTS.SERVICE_TYPE.DATA;
};
/**
 * Append given value to the formdata
 * @param formData
 * @param param - Param from which value has to be taken
 * @param paramValue - Value which is to be appended to formdata
 */
const getFormData = (formData, param, paramValue) => {
    const paramType = _.toLower(extractType(_.get(param, 'items.type') || param.type)), paramContentType = CONSTANTS.isStudioMode ? param['x-WM-CONTENT_TYPE'] : param.contentType;
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
const processRequestBody = (inputData, params) => {
    const requestBody = {}, missingParams = [];
    let paramValue;
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
const cloakHeadersForProxy = (headers) => {
    const _headers = {}, UNCLOAKED_HEADERS = VARIABLE_CONSTANTS.REST_SERVICE.UNCLOAKED_HEADERS, CLOAK_PREFIX = VARIABLE_CONSTANTS.REST_SERVICE.PREFIX.CLOAK_HEADER_KEY;
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
class ServiceVariableUtils {
    /**
     * prepares the HTTP request info for a Service Variable
     * @param variable
     * @param operationInfo
     * @param inputFields
     * @returns {any}
     */
    static constructRequestParams(variable, operationInfo, inputFields) {
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
        const directPath = operationInfo.directPath || '', relativePath = operationInfo.basePath ? operationInfo.basePath + operationInfo.relativePath : operationInfo.relativePath, isBodyTypeQueryProcedure = isBodyTypeQueryOrProcedure(variable);
        let queryParams = '', bodyInfo, headers = {}, requestBody, url, requiredParamMissing = [], target, pathParamRex, invokeParams, authDetails = null, uname, pswd, method, formData, isProxyCall, paramValueInfo, params, securityDefnObj, accessToken, withCredentials;
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
            let paramValue = param.sampleValue;
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
    }
    static isFileUploadRequest(variable) {
        // temporary fix, have to find proper solution for deciding weather to upload file through variable
        return variable.service === 'FileService' && variable.operation === 'uploadFile';
    }
    /**
     * This method returns array of query param names for variable other then page,size,sort
     * @params {params} params of the variable
     */
    static excludePaginationParams(params) {
        return _.map(_.reject(params, (param) => {
            return _.includes(VARIABLE_CONSTANTS.PAGINATION_PARAMS, param.name);
        }), function (param) {
            return param.name;
        });
    }
}

class InflightQueue {
    constructor() {
        this.requestsQueue = new Map();
    }
    /**
     * pushes the process against a variable in its queue
     * @param variable
     * @param {{resolve: (value?: any) => void; reject: (reason?: any) => void}} param2
     * the resolve callback will be called on
     */
    addToQueue(variable, param2) {
        if (this.requestsQueue.has(variable)) {
            this.requestsQueue.get(variable).push(param2);
        }
        else {
            const processes = [];
            processes.push({ resolve: param2.resolve, reject: param2.reject, active: false });
            this.requestsQueue.set(variable, processes);
        }
    }
    /**
     * Calls the reject method against the passed process
     * @param process
     */
    rejectProcess(process) {
        process.reject('Process rejected in the queue. Check the "Inflight behavior" for more info.');
    }
    /**
     * clears the queue against a variable
     * @param variable
     */
    clear(variable) {
        this.requestsQueue.delete(variable);
    }
    /**
     * executes the n/w calls for a specified variable pushed in its respective queue (pushed while it was inFlight)
     * @param variable
     */
    process(variable) {
        const processes = this.requestsQueue.get(variable);
        let nextProcess;
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
                for (let i = 0; i < processes.length - 2; i++) {
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
                for (let i = 0; i < processes.length - 1; i++) {
                    this.rejectProcess(processes[i]);
                }
                this.clear(variable);
                break;
        }
    }
    /**
     * initializes the queue against a variable and makes the first process call
     * If already initialized and a process in queue is in progress, the queue is not processed.
     * To process the next item in the queue, the process method has to be called from the caller.
     * @param variable
     * @returns {Promise<any>}
     */
    submit(variable) {
        return new Promise((resolve, reject) => {
            this.addToQueue(variable, { resolve: resolve, reject: reject });
            if (this.requestsQueue.get(variable).length === 1) {
                this.process(variable);
            }
        });
    }
}
const $queue = new InflightQueue();

class ServiceVariableManager extends BaseVariableManager {
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

class LiveVariableUtils {
    static isCompositeKey(primaryKey) {
        return !primaryKey || (primaryKey && (!primaryKey.length || primaryKey.length > 1));
    }
    static isNoPrimaryKey(primaryKey) {
        return (!primaryKey || (primaryKey && !primaryKey.length));
    }
    // Generate the URL based on the primary keys and their values
    static getCompositeIDURL(primaryKeysData) {
        let compositeId = '';
        //  Loop over the 'compositeKeysData' and construct the 'compositeId'.
        _.forEach(primaryKeysData, (paramValue, paramName) => {
            compositeId += paramName + '=' + encodeURIComponent(paramValue) + '&';
        });
        compositeId = compositeId.slice(0, -1);
        return compositeId;
    }
    // Check if table has blob column
    static hasBlob(variable) {
        return _.find(_.get(variable, ['propertiesMap', 'columns']), { 'type': 'blob' });
    }
    static getPrimaryKey(variable) {
        if (!variable.propertiesMap) {
            return [];
        }
        if (variable.propertiesMap.primaryFields) {
            return variable.propertiesMap.primaryFields;
        }
        /*Old projects do not have primary fields. Get primary key from the columns*/
        const primaryKey = [];
        /*Loop through the propertiesMap and get the primary key column.*/
        _.forEach(variable.propertiesMap.columns, (index, column) => {
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
    }
    //  Construct the URL for blob columns and set it in the data, so that widgets can use this
    static processBlobColumns(responseData, variable) {
        if (!responseData) {
            return;
        }
        const blobCols = _.map(_.filter(variable.propertiesMap.columns, { 'type': 'blob' }), 'fieldName'), deployedUrl = _.trim($rootScope.project.deployedUrl);
        let href = '', primaryKeys;
        if (_.isEmpty(blobCols)) {
            return;
        }
        if (hasCordova()) {
            href += _.endsWith(deployedUrl, '/') ? deployedUrl : deployedUrl + '/';
        }
        href += ((variable._prefabName !== '' && variable._prefabName !== undefined) ? 'prefabs/' + variable._prefabName : 'services') + '/' + variable.liveSource + '/' + variable.type + '/';
        primaryKeys = variable.propertiesMap.primaryFields || variable.propertiesMap.primaryKeys;
        _.forEach(responseData, data => {
            if (data) {
                _.forEach(blobCols, col => {
                    const compositeKeysData = {};
                    if (data[col] === null || !_.isEmpty(_.trim(data[col]))) {
                        return;
                    }
                    if (LiveVariableUtils.isCompositeKey(primaryKeys)) {
                        primaryKeys.forEach(key => {
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
    }
    static getHibernateOrSqlType(variable, fieldName, type, entityName) {
        const columns = variable.propertiesMap.columns;
        let column, relatedCols, relatedCol;
        if (_.includes(fieldName, '.')) {
            column = _.find(columns, col => {
                return col.fieldName === fieldName.split('.')[0];
            });
            relatedCols = column && column.columns;
            relatedCol = _.find(relatedCols, col => {
                return col.fieldName === fieldName.split('.')[1];
            });
            return relatedCol && relatedCol[type];
        }
        column = _.find(columns, col => {
            return col.fieldName === fieldName || col.relatedColumnName === fieldName;
        });
        if (!column && entityName) {
            const entity = _.find(columns, col => col.relatedEntityName === entityName);
            column = _.find(entity.columns, col => {
                return col.fieldName === fieldName || col.relatedColumnName === fieldName;
            });
        }
        return column && column[type];
    }
    /*Function to get the sqlType of the specified field.*/
    static getSqlType(variable, fieldName, entityName) {
        return LiveVariableUtils.getHibernateOrSqlType(variable, fieldName, 'type', entityName);
    }
    /*Function to check if the specified field has a one-to-many relation or not.*/
    static isRelatedFieldMany(variable, fieldName) {
        const columns = variable.propertiesMap.columns, columnsCount = columns.length;
        let index, column;
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
    }
    static isStringType(type) {
        return _.includes(['text', 'string'], _.toLower(type));
    }
    static getSQLFieldType(variable, options) {
        if (_.includes(['timestamp', 'datetime', 'date'], options.type)) {
            return options.type;
        }
        return LiveVariableUtils.getSqlType(variable, options.fieldName) || options.type;
    }
    static getAttributeName(variable, fieldName) {
        let attrName = fieldName;
        variable.propertiesMap.columns.forEach(column => {
            if (column.fieldName === fieldName && column.isRelated) {
                attrName = column.relatedFieldName;
            }
        });
        return attrName;
    }
    static getFilterCondition(filterCondition) {
        if (_.includes(DB_CONSTANTS.DATABASE_RANGE_MATCH_MODES, filterCondition)) {
            return filterCondition;
        }
        return DB_CONSTANTS.DATABASE_MATCH_MODES['exact'];
    }
    static getFilterOption(variable, fieldOptions, options) {
        let attributeName, fieldValue = fieldOptions.value, filterOption, filterCondition;
        const matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES, fieldName = fieldOptions.fieldName, fieldRequired = fieldOptions.required || false, fieldType = LiveVariableUtils.getSQLFieldType(variable, fieldOptions);
        filterCondition = matchModes[fieldOptions.matchMode] || matchModes[fieldOptions.filterCondition] || fieldOptions.filterCondition;
        fieldOptions.type = fieldType;
        /* if the field value is an object(complex type), loop over each field inside and push only first level fields */
        if (_.isObject(fieldValue) && !_.isArray(fieldValue)) {
            const firstLevelValues = [];
            _.forEach(fieldValue, (subFieldValue, subFieldName) => {
                if (subFieldValue && !_.isObject(subFieldValue)) {
                    firstLevelValues.push(fieldName + '.' + subFieldName + '=' + subFieldValue);
                }
            });
            return firstLevelValues;
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
                        fieldValue = _.isArray(fieldValue) ? _.reduce(fieldValue, (result, value) => {
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
    }
    static getFilterOptions(variable, filterFields, options) {
        let filterOptions = [];
        _.each(filterFields, (fieldOptions) => {
            const filterOption = LiveVariableUtils.getFilterOption(variable, fieldOptions, options);
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
    }
    // Wrap the field name and value in lower() in ignore case scenario
    // TODO: Change the function name to represent the added functionality of identifiers for datetime, timestamp and float types. Previously only lower was warapped.
    static wrapInLowerCase(value, options, ignoreCase, isField) {
        const type = _.toLower(options.attributeType);
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
    }
    static encodeAndAddQuotes(value, type, skipEncode) {
        let encodedValue = skipEncode ? value : encodeURIComponent(value);
        type = _.toLower(type);
        encodedValue = _.replace(encodedValue, /'/g, '\'\'');
        // For number types, don't wrap the value in quotes
        if ((isNumberType(type) && type !== 'float')) {
            return encodedValue;
        }
        return '\'' + encodedValue + '\'';
    }
    static getParamValue(value, options, ignoreCase, skipEncode) {
        let param;
        const filterCondition = options.filterCondition, dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES, type = options.attributeType;
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
                param = _.join(_.map(value, val => {
                    return LiveVariableUtils.wrapInLowerCase(LiveVariableUtils.encodeAndAddQuotes(val, type, skipEncode), options, ignoreCase);
                }), ' and ');
                break;
            case dbModes.in:
            case dbModes.notin:
                param = _.join(_.map(value, val => {
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
    }
    static getSearchQuery(filterOptions, operator, ignoreCase, skipEncode) {
        let query;
        const params = [];
        _.forEach(filterOptions, fieldValue => {
            const value = fieldValue.attributeValue, dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES, isValArray = _.isArray(value);
            let fieldName = fieldValue.attributeName, filterCondition = fieldValue.filterCondition, matchModeExpr, paramValue;
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
    }
    /**
     * creating the proper values from the actual object like for between,in matchModes value has to be an array like [1,2]
     * @param rules recursive filterexpressions object
     * @param variable variable object
     * @param options options
     */
    static processFilterFields(rules, variable, options) {
        _.remove(rules, rule => {
            return rule && (_.isString(rule.value) && rule.value.indexOf('bind:') === 0 || (rule.matchMode === 'between' ? (_.isString(rule.secondvalue) && rule.secondvalue.indexOf('bind:') === 0) : false));
        });
        _.forEach(rules, (rule, index) => {
            if (rule) {
                if (rule.rules) {
                    LiveVariableUtils.processFilterFields(rule.rules, variable, options);
                }
                else {
                    if (!_.isNull(rule.target)) {
                        const value = rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.between.toLowerCase()
                            ? (_.isArray(rule.value) ? rule.value : [rule.value, rule.secondvalue])
                            : (rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.in.toLowerCase() || rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.notin.toLowerCase()
                                ? (_.isArray(rule.value) ? rule.value : (rule.value ? rule.value.split(',').map(val => val.trim()) : ''))
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
    }
    static getSearchField(fieldValue, ignoreCase, skipEncode) {
        let fieldName = fieldValue.attributeName;
        let matchModeExpr;
        let paramValue;
        let filterCondition = fieldValue.filterCondition;
        const value = fieldValue.attributeValue;
        const isValArray = _.isArray(value);
        const dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        // If value is an empty array, do not generate the query
        // If values is NaN and number type, do not generate query for this field
        if ((isValArray && _.isEmpty(value)) || (isValArray && _.some(value, val => (_.isNull(val) || _.isNaN(val) || val === ''))) || (!isValArray && isNaN(value) && isNumberType(fieldValue.attributeType))) {
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
    }
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
    static getIgnoreCase(matchMode, ignoreCase) {
        const matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        if (_.indexOf([matchModes['anywhere'], matchModes['start'], matchModes['end'], matchModes['exact']], matchMode) !== -1) {
            return false;
        }
        if (_.indexOf([matchModes['anywhereignorecase'], matchModes['startignorecase'], matchModes['endignorecase'], matchModes['exactignorecase']], matchMode) !== -1) {
            return true;
        }
        return ignoreCase;
    }
    static generateSearchQuery(rules, condition, ignoreCase, skipEncode) {
        const params = [];
        _.forEach(rules, rule => {
            if (rule) {
                if (rule.rules) {
                    const query = LiveVariableUtils.generateSearchQuery(rule.rules, rule.condition, ignoreCase, skipEncode);
                    if (query !== '') {
                        params.push('(' + query + ')');
                    }
                }
                else {
                    const searchField = LiveVariableUtils.getSearchField(rule, LiveVariableUtils.getIgnoreCase(rule.filterCondition, ignoreCase), skipEncode);
                    if (!_.isNil(searchField)) {
                        params.push(searchField);
                    }
                }
            }
        });
        return _.join(params, ' ' + condition + ' ');
    }
    static prepareTableOptionsForFilterExps(variable, options, clonedFields) {
        if (!isDefined(options.searchWithQuery)) {
            options.searchWithQuery = true; // Using query api instead of  search api
        }
        const filterOptions = [];
        const matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        let orderByFields, orderByOptions, query;
        let clonedObj = clonedFields || getClonedObject(variable.filterExpressions);
        // if filterexpression from live filter is present use it to query
        if (options.filterExpr && !_.isEmpty(options.filterExpr)) {
            clonedObj = options.filterExpr;
        }
        // merge live filter runtime values
        let filterRules = {};
        if (!_.isEmpty(options.filterFields)) {
            filterRules = { 'condition': options.logicalOp || 'AND', 'rules': [] };
            _.forEach(options.filterFields, (filterObj, filterName) => {
                const filterCondition = matchModes[filterObj.matchMode] || matchModes[filterObj.filterCondition] || filterObj.filterCondition;
                if (_.includes(DB_CONSTANTS.DATABASE_EMPTY_MATCH_MODES, filterCondition) ||
                    (!_.isNil(filterObj.value) && filterObj.value !== '')) {
                    const type = filterObj.type || LiveVariableUtils.getSqlType(variable, filterName, options.entityName);
                    const ruleObj = {
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
                const tempRules = { 'condition': 'AND', 'rules': [] };
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
    }
    static prepareTableOptions(variable, options, clonedFields) {
        if (variable.operation === 'read') {
            return LiveVariableUtils.prepareTableOptionsForFilterExps(variable, options, clonedFields);
        }
        if (!isDefined(options.searchWithQuery)) {
            options.searchWithQuery = true; //  Using query api instead of  search api
        }
        const filterFields = [];
        let filterOptions = [], orderByFields, orderByOptions, query, optionsQuery;
        clonedFields = clonedFields || variable.filterFields;
        // get the filter fields from the variable
        _.forEach(clonedFields, (value, key) => {
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
        _.forEach(options.filterFields, (value, key) => {
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
    }
    /* Function to check if specified field is of type date*/
    static getFieldType(fieldName, variable, relatedField) {
        let fieldType, columns, result;
        if (variable.propertiesMap) {
            columns = variable.propertiesMap.columns || [];
            result = _.find(columns, obj => {
                return obj.fieldName === fieldName;
            });
            // if related field name passed, get its type from columns inside the current field
            if (relatedField && result) {
                result = _.find(result.columns, obj => {
                    return obj.fieldName === relatedField;
                });
            }
            fieldType = result && result.type;
        }
        return fieldType;
    }
    // Prepare formData for blob columns
    static prepareFormData(variableDetails, rowObject) {
        const formData = new FormData();
        formData.rowData = _.clone(rowObject);
        _.forEach(rowObject, (colValue, colName) => {
            if (LiveVariableUtils.getFieldType(colName, variableDetails) === 'blob') {
                if (_.isObject(colValue)) {
                    if (_.isArray(colValue)) {
                        _.forEach(colValue, fileObject => {
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
    }
    static traverseFilterExpressions(filterExpressions, traverseCallbackFn) {
        if (filterExpressions && filterExpressions.rules) {
            _.forEach(filterExpressions.rules, (filExpObj, i) => {
                if (filExpObj.rules) {
                    LiveVariableUtils.traverseFilterExpressions(filExpObj, traverseCallbackFn);
                }
                else {
                    return triggerFn(traverseCallbackFn, filterExpressions, filExpObj);
                }
            });
        }
    }
    /**
     * Traverses recursively the filterExpressions object and if there is any required field present with no value,
     * then we will return without proceeding further. Its upto the developer to provide the mandatory value,
     * if he wants to assign it in teh onbefore<delete/insert/update>function then make that field in
     * the filter query section as optional
     * @param filterExpressions - recursive rule Object
     * @returns {Object} object or boolean. Object if everything gets validated or else just boolean indicating failure in the validations
     */
    static getFilterExprFields(filterExpressions) {
        let isRequiredFieldAbsent = false;
        const traverseCallbackFn = (parentFilExpObj, filExpObj) => {
            if (filExpObj
                && filExpObj.required
                && ((_.indexOf(['null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'], filExpObj.matchMode) === -1) && filExpObj.value === '')) {
                isRequiredFieldAbsent = true;
                return false;
            }
        };
        LiveVariableUtils.traverseFilterExpressions(filterExpressions, traverseCallbackFn);
        return isRequiredFieldAbsent ? !isRequiredFieldAbsent : filterExpressions;
    }
    /**
     *
     * @param variable
     * @param options
     * @returns {function(*=): *} returns a function which should be called for the where clause.
     * This return function can take a function as argument. This argument function can modify the filter fields
     * before generating where clause.
     */
    static getWhereClauseGenerator(variable, options, updatedFilterFields) {
        return (modifier, skipEncode) => {
            const clonedFields = LiveVariableUtils.getFilterExprFields(getClonedObject(updatedFilterFields || variable.filterExpressions));
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
    }
}

const isStudioMode = false;
const parseConfig = (serviceParams) => {
    let val, param, config;
    const urlParams = serviceParams.urlParams;
    /*get the config out of baseServiceManager*/
    if (VARIABLE_URLS.hasOwnProperty(serviceParams.target) && VARIABLE_URLS[serviceParams.target].hasOwnProperty(serviceParams.action)) {
        config = getClonedObject(VARIABLE_URLS[serviceParams.target][serviceParams.action]);
        /*To handle dynamic urls, append the serviceParams.config.url with the static url(i.e., config.url)*/
        if (serviceParams.config) {
            config.url = (serviceParams.config.url || '') + config.url;
            config.method = serviceParams.config.method || config.method;
            config.headers = config.headers || {};
            // TODO[Shubham] - change to for - of
            for (const key in serviceParams.config.headers) {
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
const generateConnectionParams = (params, action) => {
    let connectionParams, urlParams, requestData;
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
const initiateAction = (action, params, successCallback, failureCallback, noproxy) => {
    let connectionParams;
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
const ɵ0$3 = initiateAction;
const LVService = {
    searchTableDataWithQuery: (params, successCallback, failureCallback) => initiateAction('searchTableDataWithQuery', params, successCallback, failureCallback),
    executeAggregateQuery: (params, successCallback, failureCallback) => initiateAction('executeAggregateQuery', params, successCallback, failureCallback),
    searchTableData: (params, successCallback, failureCallback) => initiateAction('searchTableData', params, successCallback, failureCallback),
    readTableData: (params, successCallback, failureCallback) => initiateAction('readTableData', params, successCallback, failureCallback),
    insertTableData: (params, successCallback, failureCallback) => initiateAction('insertTableData', params, successCallback, failureCallback),
    insertMultiPartTableData: (params, successCallback, failureCallback) => initiateAction('insertMultiPartTableData', params, successCallback, failureCallback),
    updateTableData: (params, successCallback, failureCallback) => initiateAction('updateTableData', params, successCallback, failureCallback),
    updateCompositeTableData: (params, successCallback, failureCallback) => initiateAction('updateCompositeTableData', params, successCallback, failureCallback),
    periodUpdateCompositeTableData: (params, successCallback, failureCallback) => initiateAction('periodUpdateCompositeTableData', params, successCallback, failureCallback),
    updateMultiPartTableData: (params, successCallback, failureCallback) => initiateAction('updateMultiPartTableData', params, successCallback, failureCallback),
    updateMultiPartCompositeTableData: (params, successCallback, failureCallback) => initiateAction('updateMultiPartCompositeTableData', params, successCallback, failureCallback),
    deleteTableData: (params, successCallback, failureCallback) => initiateAction('deleteTableData', params, successCallback, failureCallback),
    deleteCompositeTableData: (params, successCallback, failureCallback) => initiateAction('deleteCompositeTableData', params, successCallback, failureCallback),
    periodDeleteCompositeTableData: (params, successCallback, failureCallback) => initiateAction('periodDeleteCompositeTableData', params, successCallback, failureCallback),
    exportTableData: params => initiateAction('exportTableData', params),
    getDistinctDataByFields: params => initiateAction('getDistinctDataByFields', params),
    countTableDataWithQuery: (params, successCallback, failureCallback) => initiateAction('countTableDataWithQuery', params, successCallback, failureCallback)
};

const emptyArr = [];
class LiveVariableManager extends BaseVariableManager {
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

/**
 * Handles variable navigation operations
 * @param variable
 * @param options
 */
const navigate = (variable, options) => {
    variable.dataSet = (options && options.data) || variable.dataSet;
    let viewName;
    const pageName = variable.dataBinding.pageName || variable.pageName, operation = variable.operation, urlParams = variable.dataSet;
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

class BaseActionManager {
    initBinding(variable, bindSource, bindTarget) {
        processBinding(variable, variable._context, bindSource, bindTarget);
    }
    notifyInflight(variable, status, data) {
        appManager.notify('toggle-variable-state', {
            variable: variable,
            active: status,
            data: data
        });
    }
}

class NavigationActionManager extends BaseActionManager {
    invoke(variable, options) {
        navigate(variable, options);
    }
}

class NotificationActionManager extends BaseActionManager {
    onToasterClick(variable) {
        initiateCallback('onClick', variable, '');
    }
    onToasterHide(variable) {
        initiateCallback('onHide', variable, '');
    }
    notifyViaToaster(variable, options) {
        const type = (options.class || variable.dataBinding.class || 'info').toLowerCase(), body = options.message || variable.dataBinding.text, title = options.title, positionClass = 'toast-' + (options.position || variable.dataBinding.toasterPosition || 'bottom right').replace(' ', '-'), partialPage = variable.dataBinding.page, DEFAULT_DURATION = 3000;
        let duration = parseInt(variable.dataBinding.duration || options.duration, null), toaster;
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
    }
    notifyViaDialog(variable, options) {
        const commonPageDialogId = 'Common' + _.capitalize(variable.operation) + 'Dialog', variableOwner = variable.owner, dialogId = (variableOwner === VARIABLE_CONSTANTS.OWNER.APP) ? commonPageDialogId : 'notification' + variable.operation + 'dialog';
        dialogService.open(dialogId, variable._context, {
            notification: {
                'title': options.title || variable.dataBinding.title,
                'text': options.message || variable.dataBinding.text,
                'okButtonText': options.okButtonText || variable.dataBinding.okButtonText || 'OK',
                'cancelButtonText': options.cancelButtonText || variable.dataBinding.cancelButtonText || 'CANCEL',
                'alerttype': options.alerttype || variable.dataBinding.alerttype || 'information',
                onOk: () => {
                    initiateCallback('onOk', variable, options.data);
                    // Close the action dialog after triggering onOk callback event
                    dialogService.close(dialogId, variable._context);
                },
                onCancel: () => {
                    initiateCallback('onCancel', variable, options.data);
                    // Close the action dialog after triggering onCancel callback event
                    dialogService.close(dialogId, variable._context);
                },
                onClose: () => {
                    initiateCallback('onClose', variable, options.data);
                }
            }
        });
    }
    // *********************************************************** PUBLIC ***********************************************************//
    notify(variable, options, success, error) {
        const operation = variable.operation;
        options = options || {};
        if (operation === 'toast') {
            this.notifyViaToaster(variable, options);
        }
        else {
            this.notifyViaDialog(variable, options);
        }
    }
    getMessage(variable) {
        return variable.dataBinding.text;
    }
    setMessage(variable, text) {
        if (_.isString(text)) {
            variable.dataBinding.text = text;
        }
        return variable.dataBinding.text;
    }
    getOkButtonText(variable) {
        return variable.dataBinding.okButtonText;
    }
    setOkButtonText(variable, text) {
        if (_.isString(text)) {
            variable.dataBinding.okButtonText = text;
        }
        return variable.dataBinding.okButtonText;
    }
    getToasterDuration(variable) {
        return variable.dataBinding.duration;
    }
    setToasterDuration(variable, duration) {
        variable.dataBinding.duration = duration;
        return variable.dataBinding.duration;
    }
    getToasterClass(variable) {
        return variable.dataBinding.class;
    }
    setToasterClass(variable, type) {
        if (_.isString(type)) {
            variable.dataBinding.class = type;
        }
        return variable.dataBinding.class;
    }
    getToasterPosition(variable) {
        return variable.dataBinding.class;
    }
    setToasterPosition(variable, position) {
        if (_.isString(position)) {
            variable.dataBinding.position = position;
        }
        return variable.dataBinding.position;
    }
    getAlertType(variable) {
        return variable.dataBinding.alerttype;
    }
    setAlertType(variable, alerttype) {
        if (_.isString(alerttype)) {
            variable.dataBinding.alerttype = alerttype;
        }
        return variable.dataBinding.alerttype;
    }
    getCancelButtonText(variable) {
        return variable.dataBinding.cancelButtonText;
    }
    setCancelButtonText(variable, text) {
        if (_.isString(text)) {
            variable.dataBinding.cancelButtonText = text;
        }
        return variable.dataBinding.cancelButtonText;
    }
}

class LoginActionManager extends BaseActionManager {
    validate(params) {
        let err, paramKey, remembermeKey;
        const LOGIN_PARAM_REMEMBER_ME = 'j_rememberme';
        const LOGIN_PARAM_REMEMBER_ME_OLD = ['rememberme', 'remembermecheck'];
        // for older projects
        LOGIN_PARAM_REMEMBER_ME_OLD.forEach((old_key) => {
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
    }
    migrateOldParams(params) {
        const loginParams = {}, paramMigrationMap = {
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
    }
    login(variable, options, success, error) {
        let newDataSet;
        options = options || {};
        // If login info provided along explicitly with options, don't look into the variable bindings for the same
        const loginInfo = options.loginInfo || options.input || variable.dataBinding;
        // client side validation
        const errMsg = this.validate(loginInfo);
        /* if error message initialized, return error */
        if (errMsg) {
            triggerFn(error, errMsg);
            initiateCallback('onError', variable, errMsg);
            return;
        }
        // Triggering 'onBeforeUpdate' and considering
        let params = getClonedObject(loginInfo);
        const output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, params);
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
        const lastLoggedInUsername = _.get(securityService.get(), 'userInfo.userName');
        this.notifyInflight(variable, true);
        variable.promise = securityService.appLogin(params, (response) => {
            // Closing login dialog after successful login
            dialogService.close('CommonLoginDialog');
            /*
             * Get fresh security config
             * Get App variables. if not loaded
             * Update loggedInUser variable with new user details
             */
            appManager.reloadAppData().
                then((config) => {
                // EVENT: ON_RESULT
                initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, _.get(config, 'userInfo'));
                // EVENT: ON_PREPARESETDATA
                newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, _.get(config, 'userInfo'));
                if (newDataSet) {
                    // setting newDataSet as the response to service variable onPrepareSetData
                    _.set(config, 'userInfo', newDataSet);
                }
                // hide the spinner after all the n/w calls are completed
                this.notifyInflight(variable, false, response);
                triggerFn(success);
                setTimeout(() => {
                    // EVENT: ON_SUCCESS
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, _.get(config, 'userInfo'));
                    /* handle navigation if defaultSuccessHandler on variable is true */
                    if (variable.useDefaultSuccessHandler) {
                        const isSameUserReloggedIn = lastLoggedInUsername === params['j_username'];
                        // if first time user logging in or same user re-logging in, execute n/w calls failed before logging in
                        if (!lastLoggedInUsername || isSameUserReloggedIn) {
                            appManager.executeSessionFailureRequests();
                        }
                        // get redirectTo page from URL and remove it from URL
                        const redirectPage = securityService.getCurrentRouteQueryParam('redirectTo'), noRedirect = appManager.noRedirect();
                        // Get query params(page params of page being redirected to) and append to the URL after login.
                        const queryParamsObj = securityService.getRedirectedRouteQueryParams();
                        // The redirectTo param isn't required after login
                        if (queryParamsObj.redirectTo) {
                            delete queryParamsObj.redirectTo;
                        }
                        appManager.noRedirect(false);
                        // first time login
                        if (!lastLoggedInUsername) {
                            // if redirect page found, navigate to it.
                            if (!_.isEmpty(redirectPage)) {
                                routerService.navigate([`/${redirectPage}`], { queryParams: queryParamsObj });
                            }
                            else if (!noRedirect) {
                                // simply reset the URL, route handling will take care of page redirection
                                routerService.navigate([`/`]);
                            }
                        }
                        else {
                            // login after a session timeout
                            // if redirect page found and same user logs in again, just navigate to redirect page
                            if (!_.isEmpty(redirectPage)) {
                                // same user logs in again, just redirect to the redirectPage
                                if (lastLoggedInUsername === params['j_username']) {
                                    routerService.navigate([`/${redirectPage}`], { queryParams: queryParamsObj });
                                }
                                else {
                                    // different user logs in, reload the app and discard the redirectPage
                                    routerService.navigate([`/`]);
                                    window.location.reload();
                                }
                            }
                            else {
                                const securityConfig = securityService.get(), sessionTimeoutLoginMode = _.get(securityConfig, 'loginConfig.sessionTimeout.type') || 'PAGE';
                                // if in dialog mode and a new user logs in OR login happening through page, reload the app
                                if (!isSameUserReloggedIn || sessionTimeoutLoginMode !== 'DIALOG') {
                                    routerService.navigate([`/`]);
                                    window.location.reload();
                                }
                            }
                        }
                    }
                    // EVENT: ON_CAN_UPDATE
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, _.get(config, 'userInfo'));
                });
            });
        }, (e) => {
            // EVENT: ON_RESULT
            initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, e);
            this.notifyInflight(variable, false, e);
            const errorMsg = e.error || 'Invalid credentials.';
            const xhrObj = e.details;
            /* if in RUN mode, trigger error events associated with the variable */
            if (CONSTANTS.isRunMode) {
                initiateCallback('onError', variable, errorMsg, xhrObj, true);
            }
            triggerFn(error, errorMsg, xhrObj);
            // EVENT: ON_CAN_UPDATE
            initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, e);
        });
    }
}

class LogoutActionManager extends BaseActionManager {
    logout(variable, options, success, error) {
        let handleError, redirectPage, output, newDataSet;
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
        securityService.isAuthenticated(isAuthenticated => {
            if (isAuthenticated) {
                this.notifyInflight(variable, true);
                variable.promise = securityService.appLogout(response => {
                    let redirectUrl = response.body;
                    redirectUrl = getValidJSON(redirectUrl);
                    // Reset Security Config.
                    // $rootScope.isUserAuthenticated = false;
                    appManager.reloadAppData().
                        then(() => {
                        this.notifyInflight(variable, false, redirectUrl);
                        // EVENT: ON_RESULT
                        initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, redirectUrl);
                        // EVENT: ON_PREPARESETDATA
                        newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, redirectUrl);
                        if (newDataSet) {
                            // setting newDataSet as the response to service variable onPrepareSetData
                            redirectUrl = newDataSet;
                        }
                        setTimeout(() => {
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
                        routerService.navigate([`/${redirectPage}`]);
                        // do not reload the mobile app.
                        if (!window['cordova']) {
                            setTimeout(() => {
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
        }, (err) => {
            this.notifyInflight(variable, false, err);
            handleError(err);
        });
    }
}

class TimerActionManager extends BaseActionManager {
    trigger(variable, options, success, error) {
        if (isDefined(variable._promise) || CONSTANTS.isStudioMode) {
            return;
        }
        const repeatTimer = variable.repeating, delay = variable.delay || CONSTANTS.DEFAULT_TIMER_DELAY, event = 'onTimerFire', exec = function () {
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
    }
    cancel(variable) {
        if (isDefined(variable._promise)) {
            if (variable.repeating) {
                clearInterval(variable._promise);
            }
            else {
                clearTimeout(variable._promise);
            }
            variable._promise = undefined;
        }
    }
}

/**
 * Device operation registered in this class will be invoked when a device variable requests the operation.
 */
class DeviceVariableManager extends BaseVariableManager {
    constructor() {
        super(...arguments);
        /**
         * A map that contains services and their operations.
         *
         * @type {Map<string, Map<string, DeviceVariableService>>}
         */
        this.serviceRegistry = new Map();
    }
    /**
     * Invokes the given device variable and returns a promise that is resolved or rejected
     * by the device operation's outcome.
     * @param variable
     * @param options
     * @returns {Promise<any>}
     */
    invoke(variable, options) {
        const service = this.serviceRegistry.get(variable.service);
        if (service == null) {
            initiateCallback('onError', variable, null);
            return Promise.reject(`Could not find service '${service}'`);
        }
        else {
            this.notifyInflight(variable, true);
            return service.invoke(variable, options).then(response => {
                this.notifyInflight(variable, false, response);
                return response;
            }, err => {
                this.notifyInflight(variable, false, err);
                return Promise.reject(err);
            });
        }
    }
    /**
     * Adds an operation under the given service category
     * @param {string} service
     */
    registerService(service) {
        this.serviceRegistry.set(service.name, service);
    }
}

class WebSocketVariableManager extends BaseVariableManager {
    constructor() {
        super(...arguments);
        this.scope_var_socket_map = new Map();
        this.PROPERTY = {
            'SERVICE': 'service',
            'DATA_UPDATE_STRATEGY': 'dataUpdateStrategy',
            'DATA_LIMIT': 'dataLimit'
        };
        this.DATA_UPDATE_STRATEGY = {
            'REFRESH': 'refresh',
            'PREPEND': 'prepend',
            'APPEND': 'append'
        };
    }
    /**
     * returns the state of property to decide weather to append new messages to dataSet or not
     * @param variable
     * @returns boolean
     */
    shouldAppendData(variable) {
        variable = variable || this;
        return variable[this.PROPERTY.DATA_UPDATE_STRATEGY] !== this.DATA_UPDATE_STRATEGY.REFRESH;
    }
    /**
     * returns the state of property to decide weather to APPEND or PREPEND new messages to dataSet
     * @param variable
     * @returns boolean
     */
    shouldAppendLast(variable) {
        return variable[this.PROPERTY.DATA_UPDATE_STRATEGY] === this.DATA_UPDATE_STRATEGY.APPEND;
    }
    /**
     * returns upper limit on number of records to be in dataSet
     * this is applicable only when appendData is true
     * @param variable
     * @returns {dataLimit}
     */
    getDataLimit(variable) {
        return variable.dataLimit;
    }
    /**
     * get url from wmServiceOperationInfo
     * @param variable
     * @returns {*}
     */
    getURL(variable) {
        const prefabName = variable.getPrefabName();
        const opInfo = prefabName ? _.get(metadataService.getByOperationId(variable.operationId, prefabName), 'wmServiceOperationInfo') : _.get(metadataService.getByOperationId(variable.operationId), 'wmServiceOperationInfo');
        const inputFields = variable.dataBinding;
        let config;
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
    }
    /**
     * handler for onMessage event on a socket connection for a variable
     * the data returned is converted to JSON from string/xml and assigned to dataSet of variable
     * If not able to do so, message is simply assigned to the dataSet of variable
     * If appendData property is set, the message is appended to the dataSet, else it replaces the existing value of dataSet
     * @param variable
     * @param evt
     * @private
     */
    _onSocketMessage(variable, evt) {
        let data = _.get(evt, 'data'), value, dataLength, dataLimit, shouldAddToLast, insertIdx;
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
    }
    /**
     * calls the ON_BEFORE_SEND callback on the variable
     * @param variable
     * @param message
     * @returns {*}
     * @private
     */
    _onBeforeSend(variable, message) {
        // EVENT: ON_BEFORE_SEND
        return initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_SEND, variable, message);
    }
    /**
     * calls the ON_BEFORE_CLOSE callback assigned to the variable
     * @param variable
     * @param evt
     * @returns {*}
     * @private
     */
    _onBeforeSocketClose(variable, evt) {
        // EVENT: ON_BEFORE_CLOSE
        return initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_CLOSE, variable, _.get(evt, 'data'), evt);
    }
    /**
     * calls the ON_BEFORE_OPEN callback assigned
     * called just before the connection is open
     * @param variable
     * @param evt
     * @returns {*}
     * @private
     */
    _onBeforeSocketOpen(variable, evt) {
        // EVENT: ON_BEFORE_OPEN
        return initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_OPEN, variable, _.get(evt, 'data'), evt);
    }
    /**
     * calls the ON_OPEN event on the variable
     * this is called once the connection is established by the variable with the target WebSocket service
     * @param variable
     * @param evt
     * @private
     */
    _onSocketOpen(variable, evt) {
        variable._socketConnected = true;
        // EVENT: ON_OPEN
        initiateCallback(VARIABLE_CONSTANTS.EVENT.OPEN, variable, _.get(evt, 'data'), evt);
    }
    /**
     * clears the socket variable against the variable in a scope
     * @param variable
     */
    freeSocket(variable) {
        this.scope_var_socket_map.set(variable, undefined);
    }
    /**
     * calls the ON_CLOSE event on the variable
     * this is called on close of an existing connection on a variable
     * @param variable
     * @param evt
     * @private
     */
    _onSocketClose(variable, evt) {
        variable._socketConnected = false;
        this.freeSocket(variable);
        // EVENT: ON_CLOSE
        initiateCallback(VARIABLE_CONSTANTS.EVENT.CLOSE, variable, _.get(evt, 'data'), evt);
    }
    /**
     * calls the ON_ERROR event on the variable
     * this is called if an error occurs while connecting to the socket service
     * @param variable
     * @param evt
     * @private
     */
    _onSocketError(variable, evt) {
        variable._socketConnected = false;
        this.freeSocket(variable);
        // EVENT: ON_ERROR
        initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, _.get(evt, 'data') || 'Error while connecting with ' + variable.service, evt);
    }
    /**
     * returns an existing socket connection on the variable
     * if not present, make the connection and return it
     * @param variable
     * @returns {*}
     */
    getSocket(variable) {
        const url = this.getURL(variable);
        let _socket = this.scope_var_socket_map.get(variable);
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
    }
    /**
     * opens a socket connection on the variable.
     * URL & other meta data is fetched from wmServiceOperationInfo
     * @returns {*}
     */
    open(variable, success, error) {
        const shouldOpen = this._onBeforeSocketOpen(variable);
        let socket;
        if (shouldOpen === false) {
            triggerFn(error);
            return;
        }
        socket = this.getSocket(variable);
        triggerFn(success);
        return socket;
    }
    /**
     * closes an existing socket connection on variable
     */
    close(variable) {
        const shouldClose = this._onBeforeSocketClose(variable), socket = this.getSocket(variable);
        if (shouldClose === false) {
            return;
        }
        socket.close();
    }
    /**
     * sends a message to the existing socket connection on the variable
     * If socket connection not open yet, open a connections and then send
     * if message provide, it is sent, else the one present in RequestBody param is sent
     * @param message
     */
    send(variable, message) {
        const socket = this.getSocket(variable);
        let response;
        message = message || _.get(variable, 'dataBinding.RequestBody');
        response = this._onBeforeSend(variable, message);
        if (response === false) {
            return;
        }
        message = isDefined(response) ? response : message;
        message = isObject(message) ? JSON.stringify(message) : message;
        socket.send(message, 0);
    }
}

const managerMap = new Map(), typeToManagerMap = {
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
class VariableManagerFactory {
    static get(type) {
        return managerMap.has(type) ?
            managerMap.get(type) :
            managerMap.set(type, new typeToManagerMap[type]()).get(type);
    }
}

class DeviceVariableService {
    invoke(variable, options) {
        const operation = this.operations.find(o => {
            return o.name === variable.operation;
        });
        if (operation == null) {
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, null);
            return Promise.reject(`Could not find operation '${variable.operation}' in service '${this.name}'`);
        }
        else if (CONSTANTS.hasCordova) {
            const dataBindings = new Map();
            if (variable.dataBinding !== undefined) {
                Object.entries(variable).forEach(o => {
                    dataBindings.set(o[0], o[1]);
                });
                Object.entries(variable.dataBinding).forEach(o => {
                    dataBindings.set(o[0], o[1]);
                });
            }
            return operation.invoke(variable, options, dataBindings)
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
                .then(() => {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, operation.model);
                return operation.model;
            });
        }
    }
}

class DatasetUtil {
    static isValidDataset(dataSet, isList) {
        if (!dataSet) {
            return false;
        }
        // check array type dataset for list type variable
        if (isList && !_.isArray(dataSet)) {
            return false;
        }
        // change the dataSet
        return dataSet;
    }
    static getValue(dataSet, key, index, isList) {
        index = index || 0;
        // return the value against the specified key
        return isList ? dataSet[index][key] : dataSet[key];
    }
    static setValue(dataSet, key, value, isList) {
        // check param sanity
        if (key && !isList) {
            dataSet[key] = value;
        }
        // return the new dataSet
        return dataSet;
    }
    static getItem(dataSet, index, isList) {
        // return the object against the specified index
        return isList ? dataSet[index] : dataSet;
    }
    static setItem(dataSet, i, value, isList) {
        let index;
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
    }
    static addItem(dataSet, value, index, isList) {
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
    }
    /**
     *
     * @param dataSet
     * @param i, can be index value of the object/element in array
     *      or
     * the whole object which needs to be removed
     * @param exactMatch
     * @returns {any}
     */
    static removeItem(dataSet, i, exactMatch) {
        let index;
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
    }
    static getValidDataset(isList) {
        return isList ? [] : {};
    }
    static getCount(dataSet, isList) {
        return isList ? dataSet.length : Object.keys(dataSet).length;
    }
}

class BaseVariable {
    execute(operation, options) {
        let returnVal;
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
    }
    getData() {
        return this.dataSet;
    }
    setData(dataSet) {
        if (DatasetUtil.isValidDataset(dataSet, this.isList)) {
            this.dataSet = dataSet;
        }
        return this.dataSet;
    }
    getValue(key, index) {
        return DatasetUtil.getValue(this.dataSet, key, index, this.isList);
    }
    setValue(key, value) {
        return DatasetUtil.setValue(this.dataSet, key, value, this.isList);
    }
    getItem(index) {
        return DatasetUtil.getItem(this.dataSet, index, this.isList);
    }
    /**
     *
     * @param index, a number in ideal case
     *        it can be the object to be replaced by the passed value
     * @param value
     * @returns {any}
     */
    setItem(index, value) {
        return DatasetUtil.setItem(this.dataSet, index, value, this.isList);
    }
    addItem(value, index) {
        return DatasetUtil.addItem(this.dataSet, value, index, this.isList);
    }
    removeItem(index, exactMatch) {
        return DatasetUtil.removeItem(this.dataSet, index, exactMatch);
    }
    clearData() {
        this.dataSet = DatasetUtil.getValidDataset(this.isList);
        return this.dataSet;
    }
    getCount() {
        return DatasetUtil.getCount(this.dataSet, this.isList);
    }
    /**
     * Return the prefab name if the variable is form a prefab
     * @returns {string}
     */
    getPrefabName() {
        // __self__ is a prefab name given to a prefab which is run in preview mode
        return this._context && (this._context.prefabName !== '__self__' && this._context.prefabName);
    }
}

class ApiAwareVariable extends BaseVariable {
}

const getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.DEVICE);
};
class DeviceVariable extends ApiAwareVariable {
    constructor(variable) {
        super();
        Object.assign(this, variable);
    }
    init() {
        getManager().initBinding(this);
    }
    invoke(options, onSuccess, onError) {
        getManager().invoke(this, options).then(onSuccess, onError);
    }
}

const getManager$1 = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LIVE);
};
class LiveVariable extends ApiAwareVariable {
    constructor(variable) {
        super();
        Object.assign(this, variable);
    }
    execute(operation, options) {
        let returnVal = super.execute(operation, options);
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
                returnVal = `services/${this.liveSource}/${this.type}/${options.primaryValue}/content/${options.columnName}`;
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
    }
    listRecords(options, success, error) {
        return getManager$1().listRecords(this, options, success, error);
    }
    updateRecord(options, success, error) {
        return getManager$1().updateRecord(this, options, success, error);
    }
    insertRecord(options, success, error) {
        return getManager$1().insertRecord(this, options, success, error);
    }
    deleteRecord(options, success, error) {
        return getManager$1().deleteRecord(this, options, success, error);
    }
    setInput(key, val, options) {
        return getManager$1().setInput(this, key, val, options);
    }
    setFilter(key, val) {
        return getManager$1().setFilter(this, key, val);
    }
    download(options, success, error) {
        return getManager$1().download(this, options, success, error);
    }
    invoke(options, success, error) {
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
    }
    getRelatedTablePrimaryKeys(columnName) {
        return getManager$1().getRelatedTablePrimaryKeys(this, columnName);
    }
    getRelatedTableData(columnName, options, success, error) {
        return getManager$1().getRelatedTableData(this, columnName, options, success, error);
    }
    getDistinctDataByFields(options, success, error) {
        return getManager$1().getDistinctDataByFields(this, options, success, error);
    }
    getAggregatedData(options, success, error) {
        return getManager$1().getAggregatedData(this, options, success, error);
    }
    getPrimaryKey() {
        return getManager$1().getPrimaryKey(this);
    }
    searchRecords(options, success, error) {
        return getManager$1().searchRecords(this, options, success, error);
    }
    getRequestParams(options) {
        return getManager$1().prepareRequestParams(options);
    }
    _downgradeInputData(data) {
        return getManager$1().downgradeFilterExpressionsToInputData(this, data);
    }
    _upgradeInputData(response, data) {
        return getManager$1().upgradeInputDataToFilterExpressions(this, response, data);
    }
    setOrderBy(expression) {
        this.orderBy = expression;
        /* update the variable if autoUpdate flag is set */
        if (this.autoUpdate) {
            this.update();
        }
        return this.orderBy;
    }
    // legacy method
    update(options, success, error) {
        return this.invoke(options, success, error);
    }
    createRecord(options, success, error) {
        return this.insertRecord(options, success, error);
    }
    init() {
        getManager$1().initBinding(this, 'dataBinding', this.operation === 'read' ? 'filterFields' : 'inputFields');
        if (this.operation === 'read') {
            getManager$1().initFilterExpressionBinding(this);
        }
        getManager$1().defineFirstLastRecord(this);
    }
    cancel(options) {
        return getManager$1().cancel(this, options);
    }
}

class BaseAction {
    execute(operation, options) {
        let returnVal;
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
    }
    getData() {
        return this.dataSet;
    }
    setData(dataSet) {
        if (DatasetUtil.isValidDataset(dataSet)) {
            this.dataSet = dataSet;
        }
        return this.dataSet;
    }
    getValue(key, index) {
        return DatasetUtil.getValue(this.dataSet, key, index);
    }
    setValue(key, value) {
        return DatasetUtil.setValue(this.dataSet, key, value);
    }
    getItem(index) {
        return DatasetUtil.getItem(this.dataSet, index);
    }
    /**
     *
     * @param index, a number in ideal case
     *        it can be the object to be replaced by the passed value
     * @param value
     * @returns {any}
     */
    setItem(index, value) {
        return DatasetUtil.setItem(this.dataSet, index, value);
    }
    addItem(value, index) {
        return DatasetUtil.addItem(this.dataSet, value, index);
    }
    removeItem(index, exactMatch) {
        return DatasetUtil.removeItem(this.dataSet, index, exactMatch);
    }
    clearData() {
        this.dataSet = DatasetUtil.getValidDataset();
        return this.dataSet;
    }
    getCount() {
        return DatasetUtil.getCount(this.dataSet);
    }
    init() {
    }
}

const getManager$2 = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.NAVIGATION);
};
class NavigationAction extends BaseAction {
    constructor(variable) {
        super();
        Object.assign(this, variable);
    }
    invoke(options) {
        getManager$2().invoke(this, options);
    }
    // legacy method.
    navigate(options) {
        this.invoke(options);
    }
    init() {
        // static property bindings
        getManager$2().initBinding(this, 'dataBinding', 'dataBinding');
        // dynamic property bindings (e.g. page params)
        getManager$2().initBinding(this, 'dataSet', 'dataSet');
    }
}

const getManager$3 = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.MODEL);
};
class ModelVariable extends BaseVariable {
    constructor(variable) {
        super();
        Object.assign(this, variable);
    }
    init() {
        if (this.isList) {
            getManager$3().removeFirstEmptyObject(this);
        }
        getManager$3().initBinding(this, 'dataBinding', 'dataSet');
    }
    execute(operation, options) {
        let returnVal = super.execute(operation, options);
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
    }
    isBoundToLocale() {
        return this.name === 'supportedLocale';
    }
    getDefaultLocale() {
        return appManager.getSelectedLocale();
    }
}

const getManager$4 = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.SERVICE);
};
class ServiceVariable extends ApiAwareVariable {
    constructor(variable) {
        super();
        Object.assign(this, variable);
    }
    execute(operation, options) {
        let returnVal = super.execute(operation, options);
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
    }
    invoke(options, success, error) {
        return getManager$4().invoke(this, options, success, error);
    }
    update(options, success, error) {
        return getManager$4().invoke(this, options, success, error);
    }
    download(options, success, error) {
        return getManager$4().download(this, options, success, error);
    }
    setInput(key, val, options) {
        return getManager$4().setInput(this, key, val, options);
    }
    searchRecords(options, success, error) {
        return new Promise((resolve, reject) => {
            getManager$4().searchRecords(this, options, (response, pagination) => {
                resolve({ data: response.content || response, pagination });
            }, reject);
        });
    }
    isUpdateRequired(hasData) {
        const inputFields = getManager$4().getInputParms(this);
        const queryParams = ServiceVariableUtils.excludePaginationParams(inputFields);
        if (!queryParams.length) {
            // if we don't have any query params and variable data is available then we don't need variable update, so return false
            if (hasData) {
                return false;
            }
        }
        return true;
    }
    cancel(options) {
        return getManager$4().cancel(this, options);
    }
    init() {
        getManager$4().initBinding(this);
        getManager$4().defineFirstLastRecord(this);
    }
}

const getManager$5 = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.NOTIFICATION);
};
class NotificationAction extends BaseAction {
    constructor(variable) {
        super();
        Object.assign(this, variable);
    }
    execute(operation, options) {
        const returnVal = super.execute(operation, options);
        if (isDefined(returnVal)) {
            return returnVal;
        }
        return new Promise((resolve, reject) => {
            switch (operation) {
                case DataSource.Operation.INVOKE:
                    this.invoke(options, resolve, reject);
                    break;
                case DataSource.Operation.NOTIFY:
                    this.notify(options, resolve, reject);
                    break;
                default:
                    reject(`${operation} operation is not supported on this data source`);
                    break;
            }
        });
    }
    // Backward compatible method
    notify(options, success, error) {
        getManager$5().notify(this, options, success, error);
    }
    invoke(options, success, error) {
        this.notify(options, success, error);
    }
    getMessage() {
        return getManager$5().getMessage(this);
    }
    setMessage(text) {
        return getManager$5().setMessage(this, text);
    }
    clearMessage() {
        return getManager$5().setMessage(this, '');
    }
    getOkButtonText() {
        return getManager$5().getOkButtonText(this);
    }
    setOkButtonText(text) {
        return getManager$5().setOkButtonText(this, text);
    }
    getToasterDuration() {
        return getManager$5().getToasterDuration(this);
    }
    setToasterDuration(duration) {
        return getManager$5().setToasterDuration(this, duration);
    }
    getToasterClass() {
        return getManager$5().getToasterClass(this);
    }
    setToasterClass(classText) {
        return getManager$5().setToasterClass(this, classText);
    }
    getToasterPosition() {
        return getManager$5().getToasterPosition(this);
    }
    setToasterPosition(position) {
        return getManager$5().setToasterPosition(this, position);
    }
    getAlertType() {
        return getManager$5().getAlertType(this);
    }
    setAlertType(type) {
        return getManager$5().setAlertType(this, type);
    }
    getCancelButtonText() {
        return getManager$5().getCancelButtonText(this);
    }
    setCancelButtonText(text) {
        return getManager$5().setCancelButtonText(this, text);
    }
    init() {
        // static property bindings
        getManager$5().initBinding(this, 'dataBinding', 'dataBinding');
        // dynamic property bindings
        getManager$5().initBinding(this, 'dataSet', 'dataSet');
    }
}

const getManager$6 = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LOGIN);
};
class LoginAction extends BaseAction {
    constructor(variable) {
        super();
        Object.assign(this, variable);
    }
    login(options, success, error) {
        return getManager$6().login(this, options, success, error);
    }
    invoke(options, success, error) {
        return this.login(options, success, error);
    }
    cancel() {
        // TODO[VIBHU]: implement http abort logic
    }
    init() {
        getManager$6().initBinding(this, 'dataBinding', 'dataBinding');
    }
}

const getManager$7 = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LOGOUT);
};
class LogoutAction extends BaseAction {
    constructor(variable) {
        super();
        Object.assign(this, variable);
    }
    logout(options, success, error) {
        getManager$7().logout(this, options, success, error);
    }
    invoke(options, success, error) {
        this.logout(options, success, error);
    }
    cancel() {
        // TODO[VIBHU]: implement http abort logic
    }
}

const getManager$8 = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.TIMER);
};
class TimerAction extends BaseAction {
    constructor(variable) {
        super();
        Object.assign(this, variable);
    }
    // Backward compatible method
    fire(options, success, error) {
        return getManager$8().trigger(this, options, success, error);
    }
    invoke(options, success, error) {
        return this.fire(options, success, error);
    }
    cancel() {
        return getManager$8().cancel(this);
    }
}

const getManager$9 = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.WEBSOCKET);
};
class WebSocketVariable extends ApiAwareVariable {
    constructor(variable) {
        super();
        Object.assign(this, variable);
    }
    open(success, error) {
        return getManager$9().open(this, success, error);
    }
    close() {
        return getManager$9().close(this);
    }
    update() {
        return getManager$9().update(this);
    }
    send(message) {
        return getManager$9().send(this, message);
    }
    cancel() {
        return this.close();
    }
    invoke(options, success, error) {
        this.open(success, error);
    }
    init() {
        getManager$9().initBinding(this);
    }
}

class VariableFactory {
    static create(variable, context) {
        let variableInstance;
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
    }
}

class MetadataService {
    constructor($http) {
        this.$http = $http;
        this.CONTEXT_APP = 'app';
    }
    isLoaded() {
        return this.metadataMap ? this.metadataMap.has(this.CONTEXT_APP) : false;
    }
    load(prefabName) {
        let url;
        if (hasCordova()) {
            url = 'metadata/' + (prefabName ? `prefabs/${prefabName}/` : 'app/') + 'service-definitions.json';
        }
        else {
            url = './services/' + (prefabName ? `prefabs/${prefabName}/` : '') + 'servicedefs';
        }
        return new Promise((resolve, reject) => {
            this.$http.send({ 'url': url, 'method': 'GET' }).then((response) => {
                this.metadataMap = this.metadataMap || new Map();
                this.metadataMap.set(prefabName || this.CONTEXT_APP, response.body);
                resolve(response.body);
            }, reject);
        });
    }
    getByOperationId(operationId, context) {
        context = context || this.CONTEXT_APP;
        const map = this.metadataMap.get(context);
        return map && map[operationId];
    }
}
MetadataService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
MetadataService.ctorParameters = () => [
    { type: AbstractHttpService }
];

class VariablesService {
    constructor(httpService$$1, metadataService$$1, navigationService$$1, routerService$$1, toasterService$$1, oAuthService, securityService$$1, dialogService$$1) {
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
    bulkCancel(collection) {
        Object.keys(collection).forEach(name => {
            const variable = collection[name];
            if (_.isFunction(variable.cancel)) {
                variable.cancel();
            }
        });
    }
    /**
     * loops over the variable/actions collection and trigger invoke on it if startUpdate on it is true
     * @param collection
     */
    triggerStartUpdate(collection) {
        return Promise.all(Object.keys(collection)
            .map(name => collection[name])
            .filter(variable => variable.startUpdate && variable.invoke)
            .map(variable => variable.invoke()));
    }
    /**
     * Takes the raw variables and actions json as input
     * Initialize the variable and action instances through the factory
     * collect the variables and actions in separate maps and return the collection
     * @param {string} page
     * @param variablesJson
     * @param scope
     * @returns {Variables , Actions}
     */
    register(page, variablesJson, scope) {
        const variableInstances = {
            Variables: {},
            Actions: {},
            callback: this.triggerStartUpdate
        };
        let varInstance;
        for (const variableName in variablesJson) {
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
            scope.registerDestroyListener(() => {
                this.bulkCancel(variableInstances.Variables);
                this.bulkCancel(variableInstances.Actions);
            });
        }
        return variableInstances;
    }
    destroy() {
    }
    registerDependency(name, ref) {
        setDependency(name, ref);
    }
}
VariablesService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
VariablesService.ctorParameters = () => [
    { type: AbstractHttpService },
    { type: MetadataService },
    { type: AbstractNavigationService },
    { type: Router },
    { type: AbstractToasterService },
    { type: OAuthService },
    { type: SecurityService },
    { type: AbstractDialogService }
];

const toastrModule = ToastrModule.forRoot({ maxOpened: 1, autoDismiss: true });
class VariablesModule {
    static forRoot() {
        return {
            ngModule: VariablesModule,
            providers: [
                VariablesService,
                MetadataService,
                Location,
                { provide: LocationStrategy, useClass: HashLocationStrategy }
            ]
        };
    }
}
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

/**
 * Generated bundle index. Do not edit.
 */

export { BaseActionManager as ɵb, LoginActionManager as ɵh, LogoutActionManager as ɵi, NavigationActionManager as ɵf, NotificationActionManager as ɵg, TimerActionManager as ɵj, BaseVariableManager as ɵa, LiveVariableManager as ɵe, ModelVariableManager as ɵc, ServiceVariableManager as ɵd, WebSocketVariableManager as ɵk, CONSTANTS, VARIABLE_CONSTANTS, WS_CONSTANTS, DB_CONSTANTS, SWAGGER_CONSTANTS, VARIABLE_URLS, $rootScope, VariableManagerFactory, DeviceVariableManager, DeviceVariableService, VariablesService, MetadataService, parseConfig, generateConnectionParams, LVService, ɵ0$3 as ɵ0, LiveVariableUtils, appManager, httpService, metadataService, navigationService, routerService, toasterService, oauthService, securityService, dialogService, setDependency, initiateCallback, processBinding, simulateFileDownload, setInput, isFileUploadSupported, getEvaluatedOrderBy, formatExportExpression, debounceVariableCall, formatDate, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5, ɵ6, ɵ7, ɵ8, ɵ9, ɵ10, ɵ11, ɵ12, ɵ13, ɵ14, ɵ15, ɵ16, ɵ17, toastrModule, VariablesModule };

//# sourceMappingURL=index.js.map