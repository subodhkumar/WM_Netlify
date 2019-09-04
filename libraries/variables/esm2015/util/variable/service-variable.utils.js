import { extractType, getBlob, isDateTimeType, isDefined, replace } from '@wm/core';
import { $rootScope, CONSTANTS, SWAGGER_CONSTANTS, VARIABLE_CONSTANTS, WS_CONSTANTS } from '../../constants/variables.constants';
import { isFileUploadSupported } from './variables.utils';
import { getAccessToken } from './../oAuth.utils';
import { formatDate } from '../../util/variable/variables.utils';
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
const ɵ0 = isBodyTypeQueryOrProcedure;
/**
 * returns true if the variable is a Query service variable
 * @param {string} controller
 * @param {string} serviceType
 * @returns {boolean}
 */
const isQueryServiceVar = (controller, serviceType) => {
    return controller === VARIABLE_CONSTANTS.CONTROLLER_TYPE.QUERY && serviceType === VARIABLE_CONSTANTS.SERVICE_TYPE.DATA;
};
const ɵ1 = isQueryServiceVar;
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
const ɵ2 = getFormData;
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
const ɵ3 = processRequestBody;
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
const ɵ4 = cloakHeadersForProxy;
export class ServiceVariableUtils {
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
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS12YXJpYWJsZS51dGlscy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJ1dGlsL3ZhcmlhYmxlL3NlcnZpY2UtdmFyaWFibGUudXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFcEYsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDakksT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDMUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUlqRTs7Ozs7O0dBTUc7QUFDSCxNQUFNLDBCQUEwQixHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUU7SUFDNUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztBQUNoSixDQUFDLENBQUM7O0FBRUY7Ozs7O0dBS0c7QUFDSCxNQUFNLGlCQUFpQixHQUFHLENBQUMsVUFBa0IsRUFBRSxXQUFtQixFQUFFLEVBQUU7SUFDbEUsT0FBTyxVQUFVLEtBQUssa0JBQWtCLENBQUMsZUFBZSxDQUFDLEtBQUssSUFBSSxXQUFXLEtBQUssa0JBQWtCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztBQUMzSCxDQUFDLENBQUM7O0FBRUY7Ozs7O0dBS0c7QUFDSCxNQUFNLFdBQVcsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEVBQUU7SUFDaEQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQzlFLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO0lBQy9GLElBQUkscUJBQXFCLEVBQUUsRUFBRTtRQUN6QixJQUFJLENBQUMsU0FBUyxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEtBQUssUUFBUSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUNoRixJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3hCLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzNDO1lBQ0QsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzNDO2FBQU07WUFDSCxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksU0FBUyxLQUFLLE1BQU0sRUFBRTtnQkFDL0MsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsVUFBVSxVQUFVO29CQUN0QyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzVHLENBQUMsQ0FBQyxDQUFDO2FBQ047aUJBQU07Z0JBQ0gsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsRUFBRSxVQUFVLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3JHO1NBQ0o7UUFDRCxPQUFPLFFBQVEsQ0FBQztLQUNuQjtBQUNMLENBQUMsQ0FBQzs7QUFFRjs7Ozs7R0FLRztBQUNILE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDN0MsTUFBTSxXQUFXLEdBQUcsRUFBRSxFQUNsQixhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLElBQUksVUFBVSxDQUFDO0lBQ2YsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsVUFBVSxLQUFLO1FBQzdCLFVBQVUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksVUFBVSxLQUFLLEVBQUUsSUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtZQUMzRixVQUFVLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUMxRixrRkFBa0Y7WUFDbEYsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtnQkFDMUUsVUFBVSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ3hDO1lBQ0QsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUM7U0FDeEM7YUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7WUFDdkIsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUM5QztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTztRQUNILGFBQWEsRUFBRSxXQUFXO1FBQzFCLGVBQWUsRUFBRSxhQUFhO0tBQ2pDLENBQUM7QUFDTixDQUFDLENBQUM7O0FBRUY7Ozs7Ozs7R0FPRztBQUNILE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRTtJQUNyQyxNQUFNLFFBQVEsR0FBRyxFQUFFLEVBQ2YsaUJBQWlCLEdBQUcsa0JBQWtCLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUNyRSxZQUFZLEdBQUcsa0JBQWtCLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztJQUMzRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ2pDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRTtZQUNsRCxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO1NBQ3ZCO2FBQU07WUFDSCxRQUFRLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztTQUN0QztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxRQUFRLENBQUM7QUFDcEIsQ0FBQyxDQUFDOztBQUVGLE1BQU0sT0FBTyxvQkFBb0I7SUFDN0I7Ozs7OztPQU1HO0lBQ0gsTUFBTSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsV0FBVztRQUM5RCxRQUFRLEdBQUcsUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUUxQiw4REFBOEQ7UUFDOUQsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFO1lBQ3hCLE9BQU87Z0JBQ0gsT0FBTyxFQUFHO29CQUNOLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLGlCQUFpQjtvQkFDbEUsU0FBUyxFQUFFLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsaUJBQWlCO29CQUNwRSxPQUFPLEVBQUUseUJBQXlCO2lCQUNyQzthQUNKLENBQUM7U0FDTDthQUFNLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUNqQyxPQUFPO2dCQUNILE9BQU8sRUFBRztvQkFDTixNQUFNLEVBQUUsa0JBQWtCLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0I7b0JBQ2pFLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGdCQUFnQjtvQkFDbkUsT0FBTyxFQUFFLHlCQUF5QjtpQkFDckM7YUFDSixDQUFDO1NBQ0w7UUFFRCxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsVUFBVSxJQUFJLEVBQUUsRUFDakQsWUFBWSxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLFlBQVksRUFDeEgsd0JBQXdCLEdBQUcsMEJBQTBCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEUsSUFBSSxXQUFXLEdBQUcsRUFBRSxFQUNwQixRQUFRLEVBQ1IsT0FBTyxHQUFHLEVBQUUsRUFDWixXQUFXLEVBQ1gsR0FBRyxFQUNILG9CQUFvQixHQUFHLEVBQUUsRUFDekIsTUFBTSxFQUNOLFlBQVksRUFDWixZQUFZLEVBQ1osV0FBVyxHQUFHLElBQUksRUFDbEIsS0FBSyxFQUNMLElBQUksRUFDSixNQUFNLEVBQ04sUUFBUSxFQUNSLFdBQVcsRUFDWCxjQUFjLEVBQ2QsTUFBTSxFQUNOLGVBQWUsRUFDZixXQUFXLEVBQ1gsZUFBZSxDQUFDO1FBRWhCLFNBQVMsY0FBYztZQUNuQixJQUFJLFFBQVEsRUFBRTtnQkFDVixPQUFPLFFBQVEsQ0FBQzthQUNuQjtZQUNELFFBQVEsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQzFCLE9BQU8sUUFBUSxDQUFDO1FBQ3BCLENBQUM7UUFFRCxlQUFlLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFaEUsSUFBSSxlQUFlLEVBQUU7WUFDakIsUUFBUSxlQUFlLENBQUMsSUFBSSxFQUFFO2dCQUMxQixLQUFLLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsTUFBTTtvQkFDckQsV0FBVyxHQUFHLGNBQWMsQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3hHLElBQUksV0FBVyxFQUFFO3dCQUNiLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEdBQUcsa0JBQWtCLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUM7cUJBQ3pJO3lCQUFNO3dCQUNILE9BQU87NEJBQ0gsT0FBTyxFQUFFO2dDQUNMLE1BQU0sRUFBRyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLGNBQWM7Z0NBQ2hFLFNBQVMsRUFBRyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGNBQWM7NkJBQ3JFOzRCQUNELGlCQUFpQixFQUFFLGVBQWU7eUJBQ3JDLENBQUM7cUJBQ0w7b0JBQ0QsTUFBTTtnQkFDVixLQUFLLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsS0FBSztvQkFDcEQsS0FBSyxHQUFHLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUN4QyxJQUFJLEdBQUcsV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQ3ZDLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTt3QkFDZiwyQ0FBMkM7d0JBQzNDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEdBQUcsa0JBQWtCLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQzt3QkFDbkosV0FBVyxHQUFHOzRCQUNWLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUs7eUJBQzFELENBQUM7cUJBQ0w7eUJBQU07d0JBQ0gsT0FBTzs0QkFDSCxPQUFPLEVBQUU7Z0NBQ0wsTUFBTSxFQUFHLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsY0FBYztnQ0FDaEUsU0FBUyxFQUFFLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsY0FBYzs2QkFDcEU7NEJBQ0QsaUJBQWlCLEVBQUUsZUFBZTt5QkFDckMsQ0FBQztxQkFDTDtvQkFDRCxNQUFNO2FBQ2I7U0FDSjtRQUNELGFBQWEsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLGFBQWEsSUFBSSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBQyxDQUFDO1FBQ3hGLE1BQU0sR0FBRyxhQUFhLENBQUMsVUFBVSxJQUFJLGFBQWEsQ0FBQyxVQUFVLENBQUM7UUFDOUQsV0FBVyxHQUFHLENBQUM7WUFDWCxJQUFJLFNBQVMsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3RCLE9BQU8sYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7YUFDN0M7WUFDRCxPQUFPLGFBQWEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO1FBQzNDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTCxlQUFlLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUM7UUFDOUQsR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7UUFFOUMscUNBQXFDO1FBQ3JDLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxVQUFVLEtBQUs7WUFDL0Msd0NBQXdDO1lBQ3hDLFNBQVMsb0JBQW9CO2dCQUN6QixJQUFJLFdBQVcsRUFBRTtvQkFDYix5RUFBeUU7b0JBQ3pFLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTt3QkFDaEUsY0FBYyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQzVDO3lCQUFNO3dCQUNILGNBQWMsR0FBRyxXQUFXLENBQUM7cUJBQ2hDO29CQUNELE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDOUQ7cUJBQU07b0JBQ0gsbUJBQW1CO29CQUNuQixjQUFjLEdBQUcsVUFBVSxJQUFJLEVBQUUsQ0FBQztvQkFDbEMsTUFBTSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7aUJBQzNCO1lBQ0wsQ0FBQztZQUVELElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7WUFFbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLFVBQVUsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLHdCQUF3QixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLEVBQUU7Z0JBQzVILG1EQUFtRDtnQkFDbkQsSUFBSSxRQUFRLENBQUMsV0FBVyxLQUFLLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDN0YsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNuRDtnQkFDRCxrRkFBa0Y7Z0JBQ2xGLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxRQUFRLElBQUksUUFBUSxDQUFDLFdBQVcsS0FBSyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFO29CQUMzSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQ3hDO2dCQUNELFFBQVEsS0FBSyxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtvQkFDdkMsS0FBSyxPQUFPO3dCQUNSLDREQUE0RDt3QkFDNUQsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFOzRCQUN0RixNQUFNO3lCQUNUO3dCQUNELElBQUksQ0FBQyxXQUFXLEVBQUU7NEJBQ2QsV0FBVyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQzt5QkFDekU7NkJBQU07NEJBQ0gsV0FBVyxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQzt5QkFDMUU7d0JBQ0QsTUFBTTtvQkFDVixLQUFLLE1BQU07d0JBQ1AsbUZBQW1GO3dCQUNuRixZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsdUJBQXVCLENBQUMsQ0FBQzt3QkFDaEYsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO3dCQUM1QyxNQUFNO29CQUNWLEtBQUssUUFBUTt3QkFDVCxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQzt3QkFDakMsTUFBTTtvQkFDVixLQUFLLE1BQU07d0JBQ1AsNENBQTRDO3dCQUM1QyxJQUFJLHdCQUF3QixFQUFFOzRCQUMxQixvQkFBb0IsRUFBRSxDQUFDOzRCQUN2QixRQUFRLEdBQUcsa0JBQWtCLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUN0RCxXQUFXLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQzs0QkFDbkMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7eUJBQ2pGOzZCQUFNOzRCQUNILFdBQVcsR0FBRyxVQUFVLENBQUM7eUJBQzVCO3dCQUNELE1BQU07b0JBQ1YsS0FBSyxVQUFVO3dCQUNYLElBQUksd0JBQXdCLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUU7NEJBQzNFLG9CQUFvQixFQUFFLENBQUM7NEJBQ3ZCLDBEQUEwRDs0QkFDMUQsUUFBUSxHQUFHLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQzs0QkFDdEQsV0FBVyxHQUFHLFdBQVcsQ0FBQyxjQUFjLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUN6RSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQzt5QkFDakY7NkJBQU07NEJBQ0gsV0FBVyxHQUFHLFdBQVcsQ0FBQyxjQUFjLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7eUJBQ2xFO3dCQUNELE1BQU07aUJBQ2I7YUFDSjtpQkFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZCLG9CQUFvQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNyRDtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsNENBQTRDO1FBQzVDLElBQUksb0JBQW9CLENBQUMsTUFBTSxFQUFFO1lBQzdCLE9BQU87Z0JBQ0gsT0FBTyxFQUFFO29CQUNMLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLHNCQUFzQjtvQkFDdkUsT0FBTyxFQUFFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7b0JBQ3ZDLFNBQVMsRUFBRSxPQUFPLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNwSCx5QkFBeUIsRUFBRSxJQUFJO2lCQUNsQzthQUNKLENBQUM7U0FDTDtRQUVELDBGQUEwRjtRQUMxRixJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO1lBQ3BFLHNIQUFzSDtZQUN0SCxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxZQUFZLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRTtnQkFDNUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFFBQVEsSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksa0JBQWtCLENBQUM7YUFDekc7U0FDSjtRQUVELDREQUE0RDtRQUM1RCwyRkFBMkY7UUFDM0YsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztlQUM1RSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLHFCQUFxQixFQUFFLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUU7WUFDbEYsaURBQWlEO1lBQ2pELElBQUksV0FBVyxFQUFFO2dCQUNiLFdBQVcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNuRjtZQUNELE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDO1NBQ3pFO2FBQU07WUFDSCxHQUFHLElBQUksV0FBVyxDQUFDO1NBQ3RCO1FBRUQ7Ozs7V0FJRztRQUNILElBQUksV0FBVyxFQUFFO1lBQ2IsNkVBQTZFO1lBQ3pFLE9BQU8sR0FBRyxRQUFRLENBQUMsV0FBVyxLQUFLLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hKLElBQUksUUFBUSxDQUFDLGFBQWEsRUFBRSxJQUFJLGtCQUFrQixDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzdHLDJFQUEyRTtnQkFDM0UsR0FBRyxHQUFHLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsR0FBRyxDQUFDO2dCQUNsRCxNQUFNLEdBQUcseUJBQXlCLENBQUM7YUFDdEM7aUJBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsRUFBRTtnQkFDbEMsR0FBRyxHQUFHLFVBQVUsR0FBRyxHQUFHLENBQUM7YUFDMUI7WUFDRCxHQUFHLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDO1NBQzlDO1FBRUQsK0dBQStHO1FBQy9HLFlBQVksR0FBRztZQUNYLFdBQVcsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDbEMsS0FBSyxFQUFFLEdBQUc7WUFDVixRQUFRLEVBQUUsTUFBTTtZQUNoQixRQUFRLEVBQUUsTUFBTTtZQUNoQixTQUFTLEVBQUUsT0FBTztZQUNsQixNQUFNLEVBQUUsV0FBVztZQUNuQixhQUFhLEVBQUUsV0FBVztZQUMxQixjQUFjLEVBQUUsQ0FBQyxXQUFXO1lBQzVCLFVBQVUsRUFBRSxRQUFRLENBQUMsV0FBVyxLQUFLLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxJQUFJO1lBQ3pFLGlCQUFpQixFQUFFLGVBQWU7U0FDckMsQ0FBQztRQUVGLE9BQU8sWUFBWSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxNQUFNLENBQUMsbUJBQW1CLENBQUMsUUFBUTtRQUMvQixtR0FBbUc7UUFDbkcsT0FBTyxRQUFRLENBQUMsT0FBTyxLQUFLLGFBQWEsSUFBSSxRQUFRLENBQUMsU0FBUyxLQUFLLFlBQVksQ0FBQztJQUNyRixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLHVCQUF1QixDQUFDLE1BQU07UUFDakMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDcEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4RSxDQUFDLENBQUMsRUFBRSxVQUFVLEtBQUs7WUFDZixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleHRyYWN0VHlwZSwgZ2V0QmxvYiwgaXNEYXRlVGltZVR5cGUsIGlzRGVmaW5lZCwgcmVwbGFjZSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgJHJvb3RTY29wZSwgQ09OU1RBTlRTLCBTV0FHR0VSX0NPTlNUQU5UUywgVkFSSUFCTEVfQ09OU1RBTlRTLCBXU19DT05TVEFOVFMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMvdmFyaWFibGVzLmNvbnN0YW50cyc7XG5pbXBvcnQgeyBpc0ZpbGVVcGxvYWRTdXBwb3J0ZWQgfSBmcm9tICcuL3ZhcmlhYmxlcy51dGlscyc7XG5pbXBvcnQgeyBnZXRBY2Nlc3NUb2tlbiB9IGZyb20gJy4vLi4vb0F1dGgudXRpbHMnO1xuaW1wb3J0IHsgZm9ybWF0RGF0ZSB9IGZyb20gJy4uLy4uL3V0aWwvdmFyaWFibGUvdmFyaWFibGVzLnV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG4vKipcbiAqIHJldHVybnMgdHJ1ZSBpZiBhIFNlcnZpY2UgdmFyaWFibGUgaXM6XG4gKiAgLSBmb3IgYSBxdWVyeS9wcm9jZWR1cmVcbiAqICAtIHBlcmZvcm1zIGEgUFVUL1BPU1Qgb3BlcmF0aW9uLCBpLmUsIHRha2VzIGEgUmVxdWVzdCBCb2R5IGFzIGlucHV0XG4gKiBAcGFyYW0gdmFyaWFibGVcbiAqIEByZXR1cm5zIHthbnl9XG4gKi9cbmNvbnN0IGlzQm9keVR5cGVRdWVyeU9yUHJvY2VkdXJlID0gKHZhcmlhYmxlKSA9PiB7XG4gICAgcmV0dXJuIChfLmluY2x1ZGVzKFsnUXVlcnlFeGVjdXRpb24nLCAnUHJvY2VkdXJlRXhlY3V0aW9uJ10sIHZhcmlhYmxlLmNvbnRyb2xsZXIpKSAmJiAoXy5pbmNsdWRlcyhbJ3B1dCcsICdwb3N0J10sIHZhcmlhYmxlLm9wZXJhdGlvblR5cGUpKTtcbn07XG5cbi8qKlxuICogcmV0dXJucyB0cnVlIGlmIHRoZSB2YXJpYWJsZSBpcyBhIFF1ZXJ5IHNlcnZpY2UgdmFyaWFibGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250cm9sbGVyXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VydmljZVR5cGVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5jb25zdCBpc1F1ZXJ5U2VydmljZVZhciA9IChjb250cm9sbGVyOiBzdHJpbmcsIHNlcnZpY2VUeXBlOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gY29udHJvbGxlciA9PT0gVkFSSUFCTEVfQ09OU1RBTlRTLkNPTlRST0xMRVJfVFlQRS5RVUVSWSAmJiBzZXJ2aWNlVHlwZSA9PT0gVkFSSUFCTEVfQ09OU1RBTlRTLlNFUlZJQ0VfVFlQRS5EQVRBO1xufTtcblxuLyoqXG4gKiBBcHBlbmQgZ2l2ZW4gdmFsdWUgdG8gdGhlIGZvcm1kYXRhXG4gKiBAcGFyYW0gZm9ybURhdGFcbiAqIEBwYXJhbSBwYXJhbSAtIFBhcmFtIGZyb20gd2hpY2ggdmFsdWUgaGFzIHRvIGJlIHRha2VuXG4gKiBAcGFyYW0gcGFyYW1WYWx1ZSAtIFZhbHVlIHdoaWNoIGlzIHRvIGJlIGFwcGVuZGVkIHRvIGZvcm1kYXRhXG4gKi9cbmNvbnN0IGdldEZvcm1EYXRhID0gKGZvcm1EYXRhLCBwYXJhbSwgcGFyYW1WYWx1ZSkgPT4ge1xuICAgIGNvbnN0IHBhcmFtVHlwZSA9IF8udG9Mb3dlcihleHRyYWN0VHlwZShfLmdldChwYXJhbSwgJ2l0ZW1zLnR5cGUnKSB8fCBwYXJhbS50eXBlKSksXG4gICAgICAgIHBhcmFtQ29udGVudFR5cGUgPSBDT05TVEFOVFMuaXNTdHVkaW9Nb2RlID8gcGFyYW1bJ3gtV00tQ09OVEVOVF9UWVBFJ10gOiBwYXJhbS5jb250ZW50VHlwZTtcbiAgICBpZiAoaXNGaWxlVXBsb2FkU3VwcG9ydGVkKCkpIHtcbiAgICAgICAgaWYgKChwYXJhbVR5cGUgIT09ICdmaWxlJykgJiYgKHBhcmFtQ29udGVudFR5cGUgPT09ICdzdHJpbmcnIHx8ICFwYXJhbUNvbnRlbnRUeXBlKSkge1xuICAgICAgICAgICAgaWYgKF8uaXNPYmplY3QocGFyYW1WYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBwYXJhbVZhbHVlID0gSlNPTi5zdHJpbmdpZnkocGFyYW1WYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQocGFyYW0ubmFtZSwgcGFyYW1WYWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoXy5pc0FycmF5KHBhcmFtVmFsdWUpICYmIHBhcmFtVHlwZSA9PT0gJ2ZpbGUnKSB7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKHBhcmFtVmFsdWUsIGZ1bmN0aW9uIChmaWxlT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChwYXJhbS5uYW1lLCAoZmlsZU9iamVjdCAmJiBmaWxlT2JqZWN0LmNvbnRlbnQpIHx8IGdldEJsb2IoZmlsZU9iamVjdCksIGZpbGVPYmplY3QubmFtZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChwYXJhbS5uYW1lLCBnZXRCbG9iKHBhcmFtVmFsdWUsIHBhcmFtQ29udGVudFR5cGUpLCBwYXJhbVZhbHVlICYmIHBhcmFtVmFsdWUubmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvcm1EYXRhO1xuICAgIH1cbn07XG5cbi8qKlxuICogQ2hlY2sgZm9yIG1pc3NpbmcgcmVxdWlyZWQgcGFyYW1zIGFuZCBmb3JtYXQgdGhlIGRhdGUvdGltZSBwYXJhbSB2YWx1ZXNcbiAqIEBwYXJhbSBpbnB1dERhdGFcbiAqIEBwYXJhbSBwYXJhbXNcbiAqIEByZXR1cm5zIHt7cmVxdWVzdEJvZHk6IHt9OyBtaXNzaW5nUGFyYW1zOiBhbnlbXX19XG4gKi9cbmNvbnN0IHByb2Nlc3NSZXF1ZXN0Qm9keSA9IChpbnB1dERhdGEsIHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IHJlcXVlc3RCb2R5ID0ge30sXG4gICAgICAgIG1pc3NpbmdQYXJhbXMgPSBbXTtcbiAgICBsZXQgcGFyYW1WYWx1ZTtcbiAgICBfLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiAocGFyYW0pIHtcbiAgICAgICAgcGFyYW1WYWx1ZSA9IF8uZ2V0KGlucHV0RGF0YSwgcGFyYW0ubmFtZSk7XG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChwYXJhbVZhbHVlKSAmJiBwYXJhbVZhbHVlICE9PSAnJyAmJiBwYXJhbVZhbHVlICE9PSBudWxsICYmICFwYXJhbS5yZWFkT25seSkge1xuICAgICAgICAgICAgcGFyYW1WYWx1ZSA9IGlzRGF0ZVRpbWVUeXBlKHBhcmFtLnR5cGUpID8gZm9ybWF0RGF0ZShwYXJhbVZhbHVlLCBwYXJhbS50eXBlKSA6IHBhcmFtVmFsdWU7XG4gICAgICAgICAgICAvLyBDb25zdHJ1Y3QgJywnIHNlcGFyYXRlZCBzdHJpbmcgaWYgcGFyYW0gaXMgbm90IGFycmF5IHR5cGUgYnV0IHZhbHVlIGlzIGFuIGFycmF5XG4gICAgICAgICAgICBpZiAoXy5pc0FycmF5KHBhcmFtVmFsdWUpICYmIF8udG9Mb3dlcihleHRyYWN0VHlwZShwYXJhbS50eXBlKSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1WYWx1ZSA9IF8uam9pbihwYXJhbVZhbHVlLCAnLCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVxdWVzdEJvZHlbcGFyYW0ubmFtZV0gPSBwYXJhbVZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtLnJlcXVpcmVkKSB7XG4gICAgICAgICAgICBtaXNzaW5nUGFyYW1zLnB1c2gocGFyYW0ubmFtZSB8fCBwYXJhbS5pZCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgICAncmVxdWVzdEJvZHknOiByZXF1ZXN0Qm9keSxcbiAgICAgICAgJ21pc3NpbmdQYXJhbXMnOiBtaXNzaW5nUGFyYW1zXG4gICAgfTtcbn07XG5cbi8qKlxuICogRG9uZSBvbmx5IGZvciBIVFRQIGNhbGxzIG1hZGUgdmlhIHRoZSBwcm94eSBzZXJ2ZXJcbiAqIEdvZXMgdGhvdWdoIHJlcXVlc3QgaGVhZGVycywgYXBwZW5kcyAnWC0nIHRvIGNlcnRhaW4gaGVhZGVyc1xuICogdGhlc2UgaGVhZGVycyBuZWVkIG5vdCBiZSBwcm9jZXNzZWQgYXQgcHJveHkgc2VydmVyIGFuZCBzaG91bGQgZGlyZWN0bHkgYmUgcGFzc2VkIHRvIHRoZSBzZXJ2ZXJcbiAqIGUuZy4gQXV0aG9yaXphdGlvbiwgQ29va2llLCBldGMuXG4gKiBAcGFyYW0gaGVhZGVyc1xuICogQHJldHVybnMge3t9fVxuICovXG5jb25zdCBjbG9ha0hlYWRlcnNGb3JQcm94eSA9IChoZWFkZXJzKSA9PiB7XG4gICAgY29uc3QgX2hlYWRlcnMgPSB7fSxcbiAgICAgICAgVU5DTE9BS0VEX0hFQURFUlMgPSBWQVJJQUJMRV9DT05TVEFOVFMuUkVTVF9TRVJWSUNFLlVOQ0xPQUtFRF9IRUFERVJTLFxuICAgICAgICBDTE9BS19QUkVGSVggPSBWQVJJQUJMRV9DT05TVEFOVFMuUkVTVF9TRVJWSUNFLlBSRUZJWC5DTE9BS19IRUFERVJfS0VZO1xuICAgIF8uZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiAodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKF8uaW5jbHVkZXMoVU5DTE9BS0VEX0hFQURFUlMsIGtleS50b1VwcGVyQ2FzZSgpKSkge1xuICAgICAgICAgICAgX2hlYWRlcnNba2V5XSA9IHZhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9oZWFkZXJzW0NMT0FLX1BSRUZJWCArIGtleV0gPSB2YWw7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBfaGVhZGVycztcbn07XG5cbmV4cG9ydCBjbGFzcyBTZXJ2aWNlVmFyaWFibGVVdGlscyB7XG4gICAgLyoqXG4gICAgICogcHJlcGFyZXMgdGhlIEhUVFAgcmVxdWVzdCBpbmZvIGZvciBhIFNlcnZpY2UgVmFyaWFibGVcbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKiBAcGFyYW0gb3BlcmF0aW9uSW5mb1xuICAgICAqIEBwYXJhbSBpbnB1dEZpZWxkc1xuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgc3RhdGljIGNvbnN0cnVjdFJlcXVlc3RQYXJhbXModmFyaWFibGUsIG9wZXJhdGlvbkluZm8sIGlucHV0RmllbGRzKSB7XG4gICAgICAgIHZhcmlhYmxlID0gdmFyaWFibGUgfHwge307XG5cbiAgICAgICAgLy8gb3BlcmF0aW9uSW5mbyBpcyBzcGVjaWZpY2FsbHkgbnVsbCBmb3IgdW5fYXV0aG9yaXplZCBhY2Nlc3NcbiAgICAgICAgaWYgKG9wZXJhdGlvbkluZm8gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2Vycm9yJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3R5cGUnOiBWQVJJQUJMRV9DT05TVEFOVFMuUkVTVF9TRVJWSUNFLkVSUl9UWVBFLlVTRVJfVU5BVVRIT1JJU0VELFxuICAgICAgICAgICAgICAgICAgICAnbWVzc2FnZSc6IFZBUklBQkxFX0NPTlNUQU5UUy5SRVNUX1NFUlZJQ0UuRVJSX01TRy5VU0VSX1VOQVVUSE9SSVNFRCxcbiAgICAgICAgICAgICAgICAgICAgJ2ZpZWxkJzogJ193bVNlcnZpY2VPcGVyYXRpb25JbmZvJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAoXy5pc0VtcHR5KG9wZXJhdGlvbkluZm8pKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdlcnJvcicgOiB7XG4gICAgICAgICAgICAgICAgICAgICd0eXBlJzogVkFSSUFCTEVfQ09OU1RBTlRTLlJFU1RfU0VSVklDRS5FUlJfVFlQRS5NRVRBREFUQV9NSVNTSU5HLFxuICAgICAgICAgICAgICAgICAgICAnbWVzc2FnZSc6IFZBUklBQkxFX0NPTlNUQU5UUy5SRVNUX1NFUlZJQ0UuRVJSX01TRy5NRVRBREFUQV9NSVNTSU5HLFxuICAgICAgICAgICAgICAgICAgICAnZmllbGQnOiAnX3dtU2VydmljZU9wZXJhdGlvbkluZm8nXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRpcmVjdFBhdGggPSBvcGVyYXRpb25JbmZvLmRpcmVjdFBhdGggfHwgJycsXG4gICAgICAgIHJlbGF0aXZlUGF0aCA9IG9wZXJhdGlvbkluZm8uYmFzZVBhdGggPyBvcGVyYXRpb25JbmZvLmJhc2VQYXRoICsgb3BlcmF0aW9uSW5mby5yZWxhdGl2ZVBhdGggOiBvcGVyYXRpb25JbmZvLnJlbGF0aXZlUGF0aCxcbiAgICAgICAgaXNCb2R5VHlwZVF1ZXJ5UHJvY2VkdXJlID0gaXNCb2R5VHlwZVF1ZXJ5T3JQcm9jZWR1cmUodmFyaWFibGUpO1xuICAgICAgICBsZXQgcXVlcnlQYXJhbXMgPSAnJyxcbiAgICAgICAgYm9keUluZm8sXG4gICAgICAgIGhlYWRlcnMgPSB7fSxcbiAgICAgICAgcmVxdWVzdEJvZHksXG4gICAgICAgIHVybCxcbiAgICAgICAgcmVxdWlyZWRQYXJhbU1pc3NpbmcgPSBbXSxcbiAgICAgICAgdGFyZ2V0LFxuICAgICAgICBwYXRoUGFyYW1SZXgsXG4gICAgICAgIGludm9rZVBhcmFtcyxcbiAgICAgICAgYXV0aERldGFpbHMgPSBudWxsLFxuICAgICAgICB1bmFtZSxcbiAgICAgICAgcHN3ZCxcbiAgICAgICAgbWV0aG9kLFxuICAgICAgICBmb3JtRGF0YSxcbiAgICAgICAgaXNQcm94eUNhbGwsXG4gICAgICAgIHBhcmFtVmFsdWVJbmZvLFxuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHNlY3VyaXR5RGVmbk9iaixcbiAgICAgICAgYWNjZXNzVG9rZW4sXG4gICAgICAgIHdpdGhDcmVkZW50aWFscztcblxuICAgICAgICBmdW5jdGlvbiBnZXRGb3JtRGF0YU9iaigpIHtcbiAgICAgICAgICAgIGlmIChmb3JtRGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmb3JtRGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgICAgICByZXR1cm4gZm9ybURhdGE7XG4gICAgICAgIH1cblxuICAgICAgICBzZWN1cml0eURlZm5PYmogPSBfLmdldChvcGVyYXRpb25JbmZvLnNlY3VyaXR5RGVmaW5pdGlvbnMsICcwJyk7XG5cbiAgICAgICAgaWYgKHNlY3VyaXR5RGVmbk9iaikge1xuICAgICAgICAgICAgc3dpdGNoIChzZWN1cml0eURlZm5PYmoudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgVkFSSUFCTEVfQ09OU1RBTlRTLlJFU1RfU0VSVklDRS5TRUNVUklUWV9ERUZOLk9BVVRIMjpcbiAgICAgICAgICAgICAgICAgICAgYWNjZXNzVG9rZW4gPSBnZXRBY2Nlc3NUb2tlbihzZWN1cml0eURlZm5PYmpbVkFSSUFCTEVfQ09OU1RBTlRTLlJFU1RfU0VSVklDRS5PQVVUSF9QUk9WSURFUl9LRVldLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjY2Vzc1Rva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzW1ZBUklBQkxFX0NPTlNUQU5UUy5SRVNUX1NFUlZJQ0UuQVVUSF9IRFJfS0VZXSA9IFZBUklBQkxFX0NPTlNUQU5UUy5SRVNUX1NFUlZJQ0UuUFJFRklYLkFVVEhfSERSX1ZBTC5PQVVUSCArICcgJyArIGFjY2Vzc1Rva2VuO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZXJyb3InOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0eXBlJyA6IFZBUklBQkxFX0NPTlNUQU5UUy5SRVNUX1NFUlZJQ0UuRVJSX1RZUEUuTk9fQUNDRVNTVE9LRU4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtZXNzYWdlJyA6IFZBUklBQkxFX0NPTlNUQU5UUy5SRVNUX1NFUlZJQ0UuRVJSX01TRy5OT19BQ0NFU1NUT0tFTlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NlY3VyaXR5RGVmbk9iaic6IHNlY3VyaXR5RGVmbk9ialxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFZBUklBQkxFX0NPTlNUQU5UUy5SRVNUX1NFUlZJQ0UuU0VDVVJJVFlfREVGTi5CQVNJQzpcbiAgICAgICAgICAgICAgICAgICAgdW5hbWUgPSBpbnB1dEZpZWxkc1snd21fYXV0aF91c2VybmFtZSddO1xuICAgICAgICAgICAgICAgICAgICBwc3dkID0gaW5wdXRGaWVsZHNbJ3dtX2F1dGhfcGFzc3dvcmQnXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVuYW1lICYmIHBzd2QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE9bVklCSFVdOiBiYXM2NCBlbmNvZGluZyBhbHRlcm5hdGl2ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbVkFSSUFCTEVfQ09OU1RBTlRTLlJFU1RfU0VSVklDRS5BVVRIX0hEUl9LRVldID0gVkFSSUFCTEVfQ09OU1RBTlRTLlJFU1RfU0VSVklDRS5QUkVGSVguQVVUSF9IRFJfVkFMLkJBU0lDICsgJyAnICsgYnRvYSh1bmFtZSArICc6JyArIHBzd2QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aERldGFpbHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3R5cGUnOiBWQVJJQUJMRV9DT05TVEFOVFMuUkVTVF9TRVJWSUNFLkFVVEhfVFlQRS5CQVNJQ1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Vycm9yJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndHlwZScgOiBWQVJJQUJMRV9DT05TVEFOVFMuUkVTVF9TRVJWSUNFLkVSUl9UWVBFLk5PX0NSRURFTlRJQUxTLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWVzc2FnZSc6IFZBUklBQkxFX0NPTlNUQU5UUy5SRVNUX1NFUlZJQ0UuRVJSX01TRy5OT19DUkVERU5USUFMU1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NlY3VyaXR5RGVmbk9iaic6IHNlY3VyaXR5RGVmbk9ialxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvcGVyYXRpb25JbmZvLnByb3h5U2V0dGluZ3MgPSBvcGVyYXRpb25JbmZvLnByb3h5U2V0dGluZ3MgfHwge3dlYjogdHJ1ZSwgbW9iaWxlOiBmYWxzZX07XG4gICAgICAgIG1ldGhvZCA9IG9wZXJhdGlvbkluZm8uaHR0cE1ldGhvZCB8fCBvcGVyYXRpb25JbmZvLm1ldGhvZFR5cGU7XG4gICAgICAgIGlzUHJveHlDYWxsID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChDT05TVEFOVFMuaGFzQ29yZG92YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcGVyYXRpb25JbmZvLnByb3h5U2V0dGluZ3MubW9iaWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9wZXJhdGlvbkluZm8ucHJveHlTZXR0aW5ncy53ZWI7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIHdpdGhDcmVkZW50aWFscyA9IG9wZXJhdGlvbkluZm8ucHJveHlTZXR0aW5ncy53aXRoQ3JlZGVudGlhbHM7XG4gICAgICAgIHVybCA9IGlzUHJveHlDYWxsID8gcmVsYXRpdmVQYXRoIDogZGlyZWN0UGF0aDtcblxuICAgICAgICAvKiBsb29wIHRocm91Z2ggYWxsIHRoZSBwYXJhbWV0ZXJzICovXG4gICAgICAgIF8uZm9yRWFjaChvcGVyYXRpb25JbmZvLnBhcmFtZXRlcnMsIGZ1bmN0aW9uIChwYXJhbSkge1xuICAgICAgICAgICAgLy8gU2V0IHBhcmFtcyBiYXNlZCBvbiBjdXJyZW50IHdvcmtzcGFjZVxuICAgICAgICAgICAgZnVuY3Rpb24gc2V0UGFyYW1zT2ZDaGlsZE5vZGUoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0RmllbGRzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNwZWNpZmljIGNhc2UgZm9yIGJvZHkgdHlwZSBxdWVyeS9wcm9jZWR1cmUgdmFyaWFibGUgd2l0aCBxdWVyeSBwYXJhbXNcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlucHV0RmllbGRzW3BhcmFtLm5hbWVdICYmIF8uaXNPYmplY3QoaW5wdXRGaWVsZHNbcGFyYW0ubmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbVZhbHVlSW5mbyA9IGlucHV0RmllbGRzW3BhcmFtLm5hbWVdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1WYWx1ZUluZm8gPSBpbnB1dEZpZWxkcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBfLmdldChvcGVyYXRpb25JbmZvLCBbJ2RlZmluaXRpb25zJywgcGFyYW0udHlwZV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZvciBBcGkgRGVzaWduZXJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1WYWx1ZUluZm8gPSBwYXJhbVZhbHVlIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBwYXJhbS5jaGlsZHJlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBwYXJhbVZhbHVlID0gcGFyYW0uc2FtcGxlVmFsdWU7XG5cbiAgICAgICAgICAgIGlmICgoaXNEZWZpbmVkKHBhcmFtVmFsdWUpICYmIHBhcmFtVmFsdWUgIT09IG51bGwgJiYgcGFyYW1WYWx1ZSAhPT0gJycpIHx8IChpc0JvZHlUeXBlUXVlcnlQcm9jZWR1cmUgJiYgcGFyYW0udHlwZSAhPT0gJ2ZpbGUnKSkge1xuICAgICAgICAgICAgICAgIC8vIEZvcm1hdCBkYXRlVGltZSBwYXJhbXMgZm9yIGRhdGFTZXJ2aWNlIHZhcmlhYmxlc1xuICAgICAgICAgICAgICAgIGlmICh2YXJpYWJsZS5zZXJ2aWNlVHlwZSA9PT0gVkFSSUFCTEVfQ09OU1RBTlRTLlNFUlZJQ0VfVFlQRS5EQVRBICYmIGlzRGF0ZVRpbWVUeXBlKHBhcmFtLnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtVmFsdWUgPSBmb3JtYXREYXRlKHBhcmFtVmFsdWUsIHBhcmFtLnR5cGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDb25zdHJ1Y3QgJywnIHNlcGFyYXRlZCBzdHJpbmcgaWYgcGFyYW0gaXMgbm90IGFycmF5IHR5cGUgYnV0IHZhbHVlIGlzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgaWYgKF8uaXNBcnJheShwYXJhbVZhbHVlKSAmJiBfLnRvTG93ZXIoZXh0cmFjdFR5cGUocGFyYW0udHlwZSkpID09PSAnc3RyaW5nJyAmJiB2YXJpYWJsZS5zZXJ2aWNlVHlwZSA9PT0gVkFSSUFCTEVfQ09OU1RBTlRTLlNFUlZJQ0VfVFlQRS5EQVRBKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtVmFsdWUgPSBfLmpvaW4ocGFyYW1WYWx1ZSwgJywnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXJhbS5wYXJhbWV0ZXJUeXBlLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnUVVFUlknOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlIG51bGwgdmFsdWVkIHF1ZXJ5IHBhcmFtcyBmb3IgcXVlcnlTZXJ2aWNlIHZhcmlhYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc051bGwocGFyYW1WYWx1ZSkgJiYgaXNRdWVyeVNlcnZpY2VWYXIodmFyaWFibGUuY29udHJvbGxlciwgdmFyaWFibGUuc2VydmljZVR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXF1ZXJ5UGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlQYXJhbXMgPSAnPycgKyBwYXJhbS5uYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyeVBhcmFtcyArPSAnJicgKyBwYXJhbS5uYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ1BBVEgnOlxuICAgICAgICAgICAgICAgICAgICAgICAgLyogcmVwbGFjaW5nIHRoZSBwYXRoIHBhcmFtIGJhc2VkIG9uIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gaW4gdGhlIHJlbGF0aXZlIHBhdGggKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhQYXJhbVJleCA9IG5ldyBSZWdFeHAoJ1xcXFxzKlxcXFx7XFxcXHMqJyArIHBhcmFtLm5hbWUgKyAnKDpcXFxcLlxcXFwrKT9cXFxccypcXFxcfVxcXFxzKicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UocGF0aFBhcmFtUmV4LCBwYXJhbVZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdIRUFERVInOlxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1twYXJhbS5uYW1lXSA9IHBhcmFtVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQk9EWSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3IgcG9zdC9wdXQgcXVlcnkgbWV0aG9kcyB3cmFwIHRoZSBpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQm9keVR5cGVRdWVyeVByb2NlZHVyZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFBhcmFtc09mQ2hpbGROb2RlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keUluZm8gPSBwcm9jZXNzUmVxdWVzdEJvZHkocGFyYW1WYWx1ZUluZm8sIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdEJvZHkgPSBib2R5SW5mby5yZXF1ZXN0Qm9keTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZFBhcmFtTWlzc2luZyA9IF8uY29uY2F0KHJlcXVpcmVkUGFyYW1NaXNzaW5nLCBib2R5SW5mby5taXNzaW5nUGFyYW1zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdEJvZHkgPSBwYXJhbVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0ZPUk1EQVRBJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0JvZHlUeXBlUXVlcnlQcm9jZWR1cmUgJiYgcGFyYW0ubmFtZSA9PT0gU1dBR0dFUl9DT05TVEFOVFMuV01fREFUQV9KU09OKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0UGFyYW1zT2ZDaGlsZE5vZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIHF1ZXJ5L3Byb2NlZHVyZSBmb3JtRGF0YSBub24tZmlsZSBwYXJhbXMgcGFyYW1zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keUluZm8gPSBwcm9jZXNzUmVxdWVzdEJvZHkocGFyYW1WYWx1ZUluZm8sIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdEJvZHkgPSBnZXRGb3JtRGF0YShnZXRGb3JtRGF0YU9iaigpLCBwYXJhbSwgYm9keUluZm8ucmVxdWVzdEJvZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkUGFyYW1NaXNzaW5nID0gXy5jb25jYXQocmVxdWlyZWRQYXJhbU1pc3NpbmcsIGJvZHlJbmZvLm1pc3NpbmdQYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0Qm9keSA9IGdldEZvcm1EYXRhKGdldEZvcm1EYXRhT2JqKCksIHBhcmFtLCBwYXJhbVZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyYW0ucmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgICByZXF1aXJlZFBhcmFtTWlzc2luZy5wdXNoKHBhcmFtLm5hbWUgfHwgcGFyYW0uaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBpZiByZXF1aXJlZCBwYXJhbSBub3QgZm91bmQsIHJldHVybiBlcnJvclxuICAgICAgICBpZiAocmVxdWlyZWRQYXJhbU1pc3NpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdlcnJvcic6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3R5cGUnOiBWQVJJQUJMRV9DT05TVEFOVFMuUkVTVF9TRVJWSUNFLkVSUl9UWVBFLlJFUVVJUkVEX0ZJRUxEX01JU1NJTkcsXG4gICAgICAgICAgICAgICAgICAgICdmaWVsZCc6IHJlcXVpcmVkUGFyYW1NaXNzaW5nLmpvaW4oJywnKSxcbiAgICAgICAgICAgICAgICAgICAgJ21lc3NhZ2UnOiByZXBsYWNlKFZBUklBQkxFX0NPTlNUQU5UUy5SRVNUX1NFUlZJQ0UuRVJSX01TRy5SRVFVSVJFRF9GSUVMRF9NSVNTSU5HLCBbcmVxdWlyZWRQYXJhbU1pc3Npbmcuam9pbignLCcpXSksXG4gICAgICAgICAgICAgICAgICAgICdza2lwRGVmYXVsdE5vdGlmaWNhdGlvbic6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0dGluZyBhcHByb3ByaWF0ZSBjb250ZW50LVR5cGUgZm9yIHJlcXVlc3QgYWNjZXB0aW5nIHJlcXVlc3QgYm9keSBsaWtlIFBPU1QsIFBVVCwgZXRjXG4gICAgICAgIGlmICghXy5pbmNsdWRlcyhXU19DT05TVEFOVFMuTk9OX0JPRFlfSFRUUF9NRVRIT0RTLCBfLnRvVXBwZXIobWV0aG9kKSkpIHtcbiAgICAgICAgICAgIC8qQmFzZWQgb24gdGhlIGZvcm1EYXRhIGJyb3dzZXIgd2lsbCBhdXRvbWF0aWNhbGx5IHNldCB0aGUgY29udGVudCB0eXBlIHRvICdtdWx0aXBhcnQvZm9ybS1kYXRhJyBhbmQgd2Via2l0IGJvdW5kYXJ5Ki9cbiAgICAgICAgICAgIGlmICghKG9wZXJhdGlvbkluZm8uY29uc3VtZXMgJiYgKG9wZXJhdGlvbkluZm8uY29uc3VtZXNbMF0gPT09IFdTX0NPTlNUQU5UUy5DT05URU5UX1RZUEVTLk1VTFRJUEFSVF9GT1JNREFUQSkpKSB7XG4gICAgICAgICAgICAgICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSAob3BlcmF0aW9uSW5mby5jb25zdW1lcyAmJiBvcGVyYXRpb25JbmZvLmNvbnN1bWVzWzBdKSB8fCAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB0aGUgY29uc3VtZXMgaGFzIGFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCBhbmRcbiAgICAgICAgLy8gaWYgdGhlIGh0dHAgcmVxdWVzdCBvZiBnaXZlbiBtZXRob2QgdHlwZSBjYW4gaGF2ZSBib2R5IHNlbmQgdGhlIHF1ZXJ5UGFyYW1zIGFzIEZvcm0gRGF0YVxuICAgICAgICBpZiAoXy5pbmNsdWRlcyhvcGVyYXRpb25JbmZvLmNvbnN1bWVzLCBXU19DT05TVEFOVFMuQ09OVEVOVF9UWVBFUy5GT1JNX1VSTF9FTkNPREVEKVxuICAgICAgICAgICAgJiYgIV8uaW5jbHVkZXMoV1NfQ09OU1RBTlRTLk5PTl9CT0RZX0hUVFBfTUVUSE9EUywgKG1ldGhvZCB8fCAnJykudG9VcHBlckNhc2UoKSkpIHtcbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgJz8nIGF0IHRoZSBzdGFydCBvZiB0aGUgcXVlcnlQYXJhbXNcbiAgICAgICAgICAgIGlmIChxdWVyeVBhcmFtcykge1xuICAgICAgICAgICAgICAgIHJlcXVlc3RCb2R5ID0gKHJlcXVlc3RCb2R5ID8gcmVxdWVzdEJvZHkgKyAnJicgOiAnJykgKyBxdWVyeVBhcmFtcy5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IFdTX0NPTlNUQU5UUy5DT05URU5UX1RZUEVTLkZPUk1fVVJMX0VOQ09ERUQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cmwgKz0gcXVlcnlQYXJhbXM7XG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICAgKiBmb3IgcHJveHkgY2FsbHM6XG4gICAgICAgICAqICAtIGNsb2FrIHRoZSBwcm9wZXIgaGVhZGVycyAocmVxdWlyZWQgb25seSBmb3IgUkVTVCBzZXJ2aWNlcylcbiAgICAgICAgICogIC0gcHJlcGFyZSBjb21wbGV0ZSB1cmwgZnJvbSByZWxhdGl2ZVVybFxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKGlzUHJveHlDYWxsKSB7XG4gICAgICAgICAgICAvLyBhdm9pZGluZyBjbG9ha0hlYWRlcnNGb3JQcm94eSB3aGVuIHRoZSBtZXRob2QgaXMgaW52b2tlZCBmcm9tIGFwaWRlc2lnbmVyLlxuICAgICAgICAgICAgICAgIGhlYWRlcnMgPSB2YXJpYWJsZS5zZXJ2aWNlVHlwZSAhPT0gVkFSSUFCTEVfQ09OU1RBTlRTLlNFUlZJQ0VfVFlQRS5SRVNUIHx8IG9wZXJhdGlvbkluZm8uc2tpcENsb2FrSGVhZGVycyA/IGhlYWRlcnMgOiBjbG9ha0hlYWRlcnNGb3JQcm94eShoZWFkZXJzKTtcbiAgICAgICAgICAgIGlmICh2YXJpYWJsZS5nZXRQcmVmYWJOYW1lKCkgJiYgVkFSSUFCTEVfQ09OU1RBTlRTLlJFU1RfU1VQUE9SVEVEX1NFUlZJQ0VTLmluZGV4T2YodmFyaWFibGUuc2VydmljZVR5cGUpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8qIGlmIGl0IGlzIGEgcHJlZmFiIHZhcmlhYmxlICh1c2VkIGluIGEgbm9ybWFsIHByb2plY3QpLCBtb2RpZnkgdGhlIHVybCAqL1xuICAgICAgICAgICAgICAgIHVybCA9ICdwcmVmYWJzLycgKyB2YXJpYWJsZS5nZXRQcmVmYWJOYW1lKCkgKyB1cmw7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gJ2ludm9rZVByZWZhYlJlc3RTZXJ2aWNlJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXZhcmlhYmxlLmdldFByZWZhYk5hbWUoKSkge1xuICAgICAgICAgICAgICAgIHVybCA9ICdzZXJ2aWNlcycgKyB1cmw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1cmwgPSAkcm9vdFNjb3BlLnByb2plY3QuZGVwbG95ZWRVcmwgKyB1cmw7XG4gICAgICAgIH1cblxuICAgICAgICAvKmNyZWF0aW5nIHRoZSBwYXJhbXMgbmVlZGVkIHRvIGludm9rZSB0aGUgc2VydmljZS4gdXJsIGlzIGdlbmVyYXRlZCBmcm9tIHRoZSByZWxhdGl2ZSBwYXRoIGZvciB0aGUgb3BlcmF0aW9uKi9cbiAgICAgICAgaW52b2tlUGFyYW1zID0ge1xuICAgICAgICAgICAgJ3Byb2plY3RJRCc6ICRyb290U2NvcGUucHJvamVjdC5pZCxcbiAgICAgICAgICAgICd1cmwnOiB1cmwsXG4gICAgICAgICAgICAndGFyZ2V0JzogdGFyZ2V0LFxuICAgICAgICAgICAgJ21ldGhvZCc6IG1ldGhvZCxcbiAgICAgICAgICAgICdoZWFkZXJzJzogaGVhZGVycyxcbiAgICAgICAgICAgICdkYXRhJzogcmVxdWVzdEJvZHksXG4gICAgICAgICAgICAnYXV0aERldGFpbHMnOiBhdXRoRGV0YWlscyxcbiAgICAgICAgICAgICdpc0RpcmVjdENhbGwnOiAhaXNQcm94eUNhbGwsXG4gICAgICAgICAgICAnaXNFeHRVUkwnOiB2YXJpYWJsZS5zZXJ2aWNlVHlwZSA9PT0gVkFSSUFCTEVfQ09OU1RBTlRTLlNFUlZJQ0VfVFlQRS5SRVNULFxuICAgICAgICAgICAgJ3dpdGhDcmVkZW50aWFscyc6IHdpdGhDcmVkZW50aWFsc1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBpbnZva2VQYXJhbXM7XG4gICAgfVxuXG4gICAgc3RhdGljIGlzRmlsZVVwbG9hZFJlcXVlc3QodmFyaWFibGUpIHtcbiAgICAgICAgLy8gdGVtcG9yYXJ5IGZpeCwgaGF2ZSB0byBmaW5kIHByb3BlciBzb2x1dGlvbiBmb3IgZGVjaWRpbmcgd2VhdGhlciB0byB1cGxvYWQgZmlsZSB0aHJvdWdoIHZhcmlhYmxlXG4gICAgICAgIHJldHVybiB2YXJpYWJsZS5zZXJ2aWNlID09PSAnRmlsZVNlcnZpY2UnICYmIHZhcmlhYmxlLm9wZXJhdGlvbiA9PT0gJ3VwbG9hZEZpbGUnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHJldHVybnMgYXJyYXkgb2YgcXVlcnkgcGFyYW0gbmFtZXMgZm9yIHZhcmlhYmxlIG90aGVyIHRoZW4gcGFnZSxzaXplLHNvcnRcbiAgICAgKiBAcGFyYW1zIHtwYXJhbXN9IHBhcmFtcyBvZiB0aGUgdmFyaWFibGVcbiAgICAgKi9cbiAgICBzdGF0aWMgZXhjbHVkZVBhZ2luYXRpb25QYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHJldHVybiBfLm1hcChfLnJlamVjdChwYXJhbXMsIChwYXJhbSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIF8uaW5jbHVkZXMoVkFSSUFCTEVfQ09OU1RBTlRTLlBBR0lOQVRJT05fUEFSQU1TLCBwYXJhbS5uYW1lKTtcbiAgICAgICAgfSksIGZ1bmN0aW9uIChwYXJhbSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmFtLm5hbWU7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==