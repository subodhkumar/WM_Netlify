import { getClonedObject, removeExtraSlashes } from '@wm/core';
import { VARIABLE_URLS } from '../../constants/variables.constants';
import { httpService } from './variables.utils';
var isStudioMode = false;
export var parseConfig = function (serviceParams) {
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
export var generateConnectionParams = function (params, action) {
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
    var connectionParams, urlParams, requestData, param, val, config, headers, httpDetails;
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
    if (params.url && isStudioMode && !noproxy) {
        /*
                /!* Check for url parameters to replace the URL.
                 * So the variable parameters in the URL will be replaced by the actual parameter values.*!/
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
                headers = headers || {};
                headers.skipSecurity = 'true';
                headers['Content-Type'] = headers['Content-Type'] || 'application/json';
                /!*(!$rootScope.preferences.workspace.loadXDomainAppDataUsingProxy is added in endpointAddress to differentiate desktop from saas*!/
                if (action === 'testRunQuery') {
                    headers['Content-Type'] = undefined;
                    httpDetails = {
                        'endpointAddress'   : $window.location.protocol + (!$rootScope.preferences.workspace.loadXDomainAppDataUsingProxy ? ('//' + $window.location.host) : '') + params.url + config.url,
                        'method'            : config.method,
                        'content-Type'      : 'multipart/form-data',
                        'headers'           : headers
                    };
                    requestData.append(SWAGGER_CONSTANTS.WM_HTTP_JSON, new Blob([JSON.stringify(httpDetails)], {
                        type: 'application/json'
                    }));
                    connectionParams = {
                        'data': requestData,
                        'headers': headers,
                        'urlParams'         : {
                            projectID: $rootScope.project.id
                        }
                    };
                } else {
                    connectionParams = {
                        'data': {
                            'endpointAddress'   : $window.location.protocol + (!$rootScope.preferences.workspace.loadXDomainAppDataUsingProxy ? ('//' + $window.location.host) : '') + params.url + config.url,
                            'method'            : config.method,
                            'requestBody'       : JSON.stringify(requestData),
                            'headers'           : headers
                        },
                        'urlParams'         : {
                            projectID: $rootScope.project.id
                        }
                    };
                }
                WebService.testRestService(connectionParams, function (response) {
                    var parsedData = getValidJSON(response.responseBody),
                        errMsg,
                        localeObject;
                    if (parsedData.hasOwnProperty('result')) {
                        triggerFn(successCallback, parsedData.result);
                    } else if (parsedData.hasOwnProperty('error')) {
                        triggerFn(failureCallback, (parsedData.error && parsedData.error.message) || parsedData.error);
                    } else if (parsedData.hasOwnProperty('errorDetails')) {
                        localeObject = $rootScope.locale || $rootScope.appLocale;
                        errMsg = getClonedObject(localeObject[parsedData.errorDetails.code]);
                        triggerFn(failureCallback, replace(errMsg, parsedData.errorDetails.data) || parsedData.errorDetails);
                    } else {
                        triggerFn(successCallback, parsedData);
                    }
                }, failureCallback);*/
    }
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
var ɵ0 = initiateAction;
export var LVService = {
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
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl2ZS12YXJpYWJsZS5odHRwLnV0aWxzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbInV0aWwvdmFyaWFibGUvbGl2ZS12YXJpYWJsZS5odHRwLnV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFL0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUloRCxJQUFNLFlBQVksR0FBRyxLQUFLLENBQUM7QUFFM0IsTUFBTSxDQUFDLElBQU0sV0FBVyxHQUFHLFVBQUMsYUFBa0I7SUFFMUMsSUFBSSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQztJQUN2QixJQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDO0lBRTFDLDRDQUE0QztJQUM1QyxJQUFJLGFBQWEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNoSSxNQUFNLEdBQUcsZUFBZSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFcEYscUdBQXFHO1FBQ3JHLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUN0QixNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztZQUMzRCxNQUFNLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENB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SUFBSyxPQUFBLGNBQWMsQ0FBQywwQkFBMEIsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxFQUFwRixDQUFvRjtJQUM1Siw4QkFBOEIsRUFBRSxVQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUUsZUFBZSxJQUFLLE9BQUEsY0FBYyxDQUFDLGdDQUFnQyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFDLEVBQTFGLENBQTBGO0lBQ3hLLGVBQWUsRUFBRSxVQUFBLE1BQU0sSUFBSSxPQUFBLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsRUFBekMsQ0FBeUM7SUFDcEUsdUJBQXVCLEVBQUUsVUFBQSxNQUFNLElBQUksT0FBQSxjQUFjLENBQUMseUJBQXlCLEVBQUUsTUFBTSxDQUFDLEVBQWpELENBQWlEO0lBQ3BGLHVCQUF1QixFQUFFLFVBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxlQUFlLElBQUssT0FBQSxjQUFjLENBQUMseUJBQXlCLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBRSxlQUFlLENBQUMsRUFBbkYsQ0FBbUY7Q0FDN0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldENsb25lZE9iamVjdCwgcmVtb3ZlRXh0cmFTbGFzaGVzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBWQVJJQUJMRV9VUkxTIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzL3ZhcmlhYmxlcy5jb25zdGFudHMnO1xuaW1wb3J0IHsgaHR0cFNlcnZpY2UgfSBmcm9tICcuL3ZhcmlhYmxlcy51dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuY29uc3QgaXNTdHVkaW9Nb2RlID0gZmFsc2U7XG5cbmV4cG9ydCBjb25zdCBwYXJzZUNvbmZpZyA9IChzZXJ2aWNlUGFyYW1zOiBhbnkpOiBhbnkgPT4ge1xuXG4gICAgbGV0IHZhbCwgcGFyYW0sIGNvbmZpZztcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBzZXJ2aWNlUGFyYW1zLnVybFBhcmFtcztcblxuICAgIC8qZ2V0IHRoZSBjb25maWcgb3V0IG9mIGJhc2VTZXJ2aWNlTWFuYWdlciovXG4gICAgaWYgKFZBUklBQkxFX1VSTFMuaGFzT3duUHJvcGVydHkoc2VydmljZVBhcmFtcy50YXJnZXQpICYmIFZBUklBQkxFX1VSTFNbc2VydmljZVBhcmFtcy50YXJnZXRdLmhhc093blByb3BlcnR5KHNlcnZpY2VQYXJhbXMuYWN0aW9uKSkge1xuICAgICAgICBjb25maWcgPSBnZXRDbG9uZWRPYmplY3QoVkFSSUFCTEVfVVJMU1tzZXJ2aWNlUGFyYW1zLnRhcmdldF1bc2VydmljZVBhcmFtcy5hY3Rpb25dKTtcblxuICAgICAgICAvKlRvIGhhbmRsZSBkeW5hbWljIHVybHMsIGFwcGVuZCB0aGUgc2VydmljZVBhcmFtcy5jb25maWcudXJsIHdpdGggdGhlIHN0YXRpYyB1cmwoaS5lLiwgY29uZmlnLnVybCkqL1xuICAgICAgICBpZiAoc2VydmljZVBhcmFtcy5jb25maWcpIHtcbiAgICAgICAgICAgIGNvbmZpZy51cmwgPSAoc2VydmljZVBhcmFtcy5jb25maWcudXJsIHx8ICcnKSArIGNvbmZpZy51cmw7XG4gICAgICAgICAgICBjb25maWcubWV0aG9kID0gc2VydmljZVBhcmFtcy5jb25maWcubWV0aG9kIHx8IGNvbmZpZy5tZXRob2Q7XG4gICAgICAgICAgICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gICAgICAgICAgICAvLyBUT0RPW1NodWJoYW1dIC0gY2hhbmdlIHRvIGZvciAtIG9mXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzZXJ2aWNlUGFyYW1zLmNvbmZpZy5oZWFkZXJzKSB7XG4gICAgICAgICAgICAgICAgdmFsID0gc2VydmljZVBhcmFtcy5jb25maWcuaGVhZGVyc1trZXldO1xuICAgICAgICAgICAgICAgIGNvbmZpZy5oZWFkZXJzW2tleV0gPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLyogY2hlY2sgZm9yIHVybCBwYXJhbWV0ZXJzIHRvIHJlcGxhY2UgdGhlIHVybCAqL1xuICAgICAgICBpZiAodXJsUGFyYW1zKSB7XG4gICAgICAgICAgICBmb3IgKHBhcmFtIGluIHVybFBhcmFtcykge1xuICAgICAgICAgICAgICAgIGlmICh1cmxQYXJhbXMuaGFzT3duUHJvcGVydHkocGFyYW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbCA9IHVybFBhcmFtc1twYXJhbV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZCh2YWwpICYmIHZhbCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLnVybCA9IGNvbmZpZy51cmwucmVwbGFjZShuZXcgUmVnRXhwKCc6JyArIHBhcmFtLCAnZycpLCB2YWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogY2hlY2sgZm9yIGRhdGEgKi9cbiAgICAgICAgaWYgKHNlcnZpY2VQYXJhbXMucGFyYW1zKSB7XG4gICAgICAgICAgICBjb25maWcucGFyYW1zID0gc2VydmljZVBhcmFtcy5wYXJhbXM7XG4gICAgICAgIH1cbiAgICAgICAgLyogY2hlY2sgZm9yIGRhdGEgKi9cbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHNlcnZpY2VQYXJhbXMuZGF0YSkpIHtcbiAgICAgICAgICAgIGNvbmZpZy5kYXRhID0gc2VydmljZVBhcmFtcy5kYXRhO1xuICAgICAgICB9XG4gICAgICAgIC8qIGNoZWNrIGZvciBkYXRhIHBhcmFtZXRlcnMsIHdyaXR0ZW4gdG8gc3VwcG9ydCBvbGQgc2VydmljZSBjYWxscyAoLmpzb24gY2FsbHMpICovXG4gICAgICAgIGlmIChzZXJ2aWNlUGFyYW1zLmRhdGFQYXJhbXMpIHtcbiAgICAgICAgICAgIGNvbmZpZy5kYXRhLnBhcmFtcyA9IHNlcnZpY2VQYXJhbXMuZGF0YVBhcmFtcztcbiAgICAgICAgfVxuICAgICAgICAvKiBjaGVjayBmb3IgaGVhZGVycyAqL1xuICAgICAgICBpZiAoc2VydmljZVBhcmFtcy5oZWFkZXJzKSB7XG4gICAgICAgICAgICBjb25maWcuaGVhZGVycyA9IHNlcnZpY2VQYXJhbXMuaGVhZGVycztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIHNldCBleHRyYSBjb25maWcgZmxhZ3MgKi9cbiAgICAgICAgY29uZmlnLmJ5UGFzc1Jlc3VsdCAgICA9IHNlcnZpY2VQYXJhbXMuYnlQYXNzUmVzdWx0O1xuICAgICAgICBjb25maWcuaXNEaXJlY3RDYWxsICAgID0gc2VydmljZVBhcmFtcy5pc0RpcmVjdENhbGw7XG4gICAgICAgIGNvbmZpZy5pc0V4dFVSTCAgICAgICAgPSBzZXJ2aWNlUGFyYW1zLmlzRXh0VVJMO1xuICAgICAgICBjb25maWcucHJldmVudE11bHRpcGxlID0gc2VydmljZVBhcmFtcy5wcmV2ZW50TXVsdGlwbGU7XG4gICAgICAgIGNvbmZpZy5yZXNwb25zZVR5cGUgICAgPSBzZXJ2aWNlUGFyYW1zLnJlc3BvbnNlVHlwZTtcblxuICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlQ29ubmVjdGlvblBhcmFtcyA9IChwYXJhbXMsIGFjdGlvbikgPT4ge1xuICAgIGxldCBjb25uZWN0aW9uUGFyYW1zLFxuICAgICAgICB1cmxQYXJhbXMsXG4gICAgICAgIHJlcXVlc3REYXRhO1xuICAgIHJlcXVlc3REYXRhID0gcGFyYW1zLmRhdGE7XG5cbiAgICB1cmxQYXJhbXMgPSB7XG4gICAgICAgIHByb2plY3RJRCAgICAgICAgOiBwYXJhbXMucHJvamVjdElELFxuICAgICAgICBzZXJ2aWNlICAgICAgICAgIDogIV8uaXNVbmRlZmluZWQocGFyYW1zLnNlcnZpY2UpID8gcGFyYW1zLnNlcnZpY2UgOiAnc2VydmljZXMnLFxuICAgICAgICBkYXRhTW9kZWxOYW1lICAgIDogcGFyYW1zLmRhdGFNb2RlbE5hbWUsXG4gICAgICAgIGVudGl0eU5hbWUgICAgICAgOiBwYXJhbXMuZW50aXR5TmFtZSxcbiAgICAgICAgcXVlcnlOYW1lICAgICAgICA6IHBhcmFtcy5xdWVyeU5hbWUsXG4gICAgICAgIHF1ZXJ5UGFyYW1zICAgICAgOiBwYXJhbXMucXVlcnlQYXJhbXMsXG4gICAgICAgIHByb2NlZHVyZU5hbWUgICAgOiBwYXJhbXMucHJvY2VkdXJlTmFtZSxcbiAgICAgICAgcHJvY2VkdXJlUGFyYW1zICA6IHBhcmFtcy5wcm9jZWR1cmVQYXJhbXMsXG4gICAgICAgIGlkICAgICAgICAgICAgICAgOiBwYXJhbXMuaWQsXG4gICAgICAgIHJlbGF0ZWRGaWVsZE5hbWUgOiBwYXJhbXMucmVsYXRlZEZpZWxkTmFtZSxcbiAgICAgICAgcGFnZSAgICAgICAgICAgICA6IHBhcmFtcy5wYWdlLFxuICAgICAgICBzaXplICAgICAgICAgICAgIDogcGFyYW1zLnNpemUsXG4gICAgICAgIHNvcnQgICAgICAgICAgICAgOiBwYXJhbXMuc29ydFxuICAgIH07XG4gICAgY29ubmVjdGlvblBhcmFtcyA9IHtcbiAgICAgICAgdGFyZ2V0ICAgIDogJ0RBVEFCQVNFJyxcbiAgICAgICAgYWN0aW9uICAgIDogYWN0aW9uLFxuICAgICAgICB1cmxQYXJhbXMgOiB1cmxQYXJhbXMsXG4gICAgICAgIGRhdGEgICAgICA6IHJlcXVlc3REYXRhIHx8ICcnLFxuICAgICAgICBjb25maWcgICAgOiB7XG4gICAgICAgICAgICAndXJsJyA6IHBhcmFtcy51cmxcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25uZWN0aW9uUGFyYW1zID0gcGFyc2VDb25maWcoY29ubmVjdGlvblBhcmFtcyk7XG4gICAgLy8gVE9ETzogUmVtb3ZlIGFmdGVyIGJhY2tlbmQgZml4XG4gICAgY29ubmVjdGlvblBhcmFtcy51cmwgPSByZW1vdmVFeHRyYVNsYXNoZXMoY29ubmVjdGlvblBhcmFtcy51cmwpO1xuXG4gICAgcmV0dXJuIGNvbm5lY3Rpb25QYXJhbXM7XG59O1xuXG5jb25zdCBpbml0aWF0ZUFjdGlvbiA9IChhY3Rpb24sIHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrPywgZmFpbHVyZUNhbGxiYWNrPywgbm9wcm94eT8pID0+IHtcbiAgICBsZXQgY29ubmVjdGlvblBhcmFtcyxcbiAgICAgICAgdXJsUGFyYW1zLFxuICAgICAgICByZXF1ZXN0RGF0YSxcbiAgICAgICAgcGFyYW0sXG4gICAgICAgIHZhbCxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBodHRwRGV0YWlscztcblxuICAgIC8qXG4gICAgY29uZmlnICAgICAgPSBnZXRDbG9uZWRPYmplY3QoY29uZmlnW2FjdGlvbl0pO1xuICAgIGhlYWRlcnMgICAgID0gY29uZmlnICYmIGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgcmVxdWVzdERhdGEgPSBwYXJhbXMuZGF0YTtcblxuICAgIHVybFBhcmFtcyA9IHtcbiAgICAgICAgcHJvamVjdElEICAgICAgICA6IHBhcmFtcy5wcm9qZWN0SUQsXG4gICAgICAgIHNlcnZpY2UgICAgICAgICAgOiAhXy5pc1VuZGVmaW5lZChwYXJhbXMuc2VydmljZSkgPyBwYXJhbXMuc2VydmljZSA6ICdzZXJ2aWNlcycsXG4gICAgICAgIGRhdGFNb2RlbE5hbWUgICAgOiBwYXJhbXMuZGF0YU1vZGVsTmFtZSxcbiAgICAgICAgZW50aXR5TmFtZSAgICAgICA6IHBhcmFtcy5lbnRpdHlOYW1lLFxuICAgICAgICBxdWVyeU5hbWUgICAgICAgIDogcGFyYW1zLnF1ZXJ5TmFtZSxcbiAgICAgICAgcXVlcnlQYXJhbXMgICAgICA6IHBhcmFtcy5xdWVyeVBhcmFtcyxcbiAgICAgICAgcHJvY2VkdXJlTmFtZSAgICA6IHBhcmFtcy5wcm9jZWR1cmVOYW1lLFxuICAgICAgICBwcm9jZWR1cmVQYXJhbXMgIDogcGFyYW1zLnByb2NlZHVyZVBhcmFtcyxcbiAgICAgICAgaWQgICAgICAgICAgICAgICA6IHBhcmFtcy5pZCxcbiAgICAgICAgcmVsYXRlZEZpZWxkTmFtZSA6IHBhcmFtcy5yZWxhdGVkRmllbGROYW1lLFxuICAgICAgICBwYWdlICAgICAgICAgICAgIDogcGFyYW1zLnBhZ2UsXG4gICAgICAgIHNpemUgICAgICAgICAgICAgOiBwYXJhbXMuc2l6ZSxcbiAgICAgICAgc29ydCAgICAgICAgICAgICA6IHBhcmFtcy5zb3J0XG4gICAgfTtcbiAgICAqL1xuICAgIGlmIChwYXJhbXMudXJsICYmIGlzU3R1ZGlvTW9kZSAmJiAhbm9wcm94eSkge1xuLypcbiAgICAgICAgLyEqIENoZWNrIGZvciB1cmwgcGFyYW1ldGVycyB0byByZXBsYWNlIHRoZSBVUkwuXG4gICAgICAgICAqIFNvIHRoZSB2YXJpYWJsZSBwYXJhbWV0ZXJzIGluIHRoZSBVUkwgd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgYWN0dWFsIHBhcmFtZXRlciB2YWx1ZXMuKiEvXG4gICAgICAgIGlmICh1cmxQYXJhbXMpIHtcbiAgICAgICAgICAgIGZvciAocGFyYW0gaW4gdXJsUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVybFBhcmFtcy5oYXNPd25Qcm9wZXJ0eShwYXJhbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsID0gdXJsUGFyYW1zW3BhcmFtXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcudXJsID0gY29uZmlnLnVybC5yZXBsYWNlKG5ldyBSZWdFeHAoJzonICsgcGFyYW0sICdnJyksIHZhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaGVhZGVycyA9IGhlYWRlcnMgfHwge307XG4gICAgICAgIGhlYWRlcnMuc2tpcFNlY3VyaXR5ID0gJ3RydWUnO1xuICAgICAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddIHx8ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgLyEqKCEkcm9vdFNjb3BlLnByZWZlcmVuY2VzLndvcmtzcGFjZS5sb2FkWERvbWFpbkFwcERhdGFVc2luZ1Byb3h5IGlzIGFkZGVkIGluIGVuZHBvaW50QWRkcmVzcyB0byBkaWZmZXJlbnRpYXRlIGRlc2t0b3AgZnJvbSBzYWFzKiEvXG4gICAgICAgIGlmIChhY3Rpb24gPT09ICd0ZXN0UnVuUXVlcnknKSB7XG4gICAgICAgICAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGh0dHBEZXRhaWxzID0ge1xuICAgICAgICAgICAgICAgICdlbmRwb2ludEFkZHJlc3MnICAgOiAkd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgKCEkcm9vdFNjb3BlLnByZWZlcmVuY2VzLndvcmtzcGFjZS5sb2FkWERvbWFpbkFwcERhdGFVc2luZ1Byb3h5ID8gKCcvLycgKyAkd2luZG93LmxvY2F0aW9uLmhvc3QpIDogJycpICsgcGFyYW1zLnVybCArIGNvbmZpZy51cmwsXG4gICAgICAgICAgICAgICAgJ21ldGhvZCcgICAgICAgICAgICA6IGNvbmZpZy5tZXRob2QsXG4gICAgICAgICAgICAgICAgJ2NvbnRlbnQtVHlwZScgICAgICA6ICdtdWx0aXBhcnQvZm9ybS1kYXRhJyxcbiAgICAgICAgICAgICAgICAnaGVhZGVycycgICAgICAgICAgIDogaGVhZGVyc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlcXVlc3REYXRhLmFwcGVuZChTV0FHR0VSX0NPTlNUQU5UUy5XTV9IVFRQX0pTT04sIG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeShodHRwRGV0YWlscyldLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBjb25uZWN0aW9uUGFyYW1zID0ge1xuICAgICAgICAgICAgICAgICdkYXRhJzogcmVxdWVzdERhdGEsXG4gICAgICAgICAgICAgICAgJ2hlYWRlcnMnOiBoZWFkZXJzLFxuICAgICAgICAgICAgICAgICd1cmxQYXJhbXMnICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RJRDogJHJvb3RTY29wZS5wcm9qZWN0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbm5lY3Rpb25QYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgJ2RhdGEnOiB7XG4gICAgICAgICAgICAgICAgICAgICdlbmRwb2ludEFkZHJlc3MnICAgOiAkd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgKCEkcm9vdFNjb3BlLnByZWZlcmVuY2VzLndvcmtzcGFjZS5sb2FkWERvbWFpbkFwcERhdGFVc2luZ1Byb3h5ID8gKCcvLycgKyAkd2luZG93LmxvY2F0aW9uLmhvc3QpIDogJycpICsgcGFyYW1zLnVybCArIGNvbmZpZy51cmwsXG4gICAgICAgICAgICAgICAgICAgICdtZXRob2QnICAgICAgICAgICAgOiBjb25maWcubWV0aG9kLFxuICAgICAgICAgICAgICAgICAgICAncmVxdWVzdEJvZHknICAgICAgIDogSlNPTi5zdHJpbmdpZnkocmVxdWVzdERhdGEpLFxuICAgICAgICAgICAgICAgICAgICAnaGVhZGVycycgICAgICAgICAgIDogaGVhZGVyc1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ3VybFBhcmFtcycgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdElEOiAkcm9vdFNjb3BlLnByb2plY3QuaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIFdlYlNlcnZpY2UudGVzdFJlc3RTZXJ2aWNlKGNvbm5lY3Rpb25QYXJhbXMsIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIHBhcnNlZERhdGEgPSBnZXRWYWxpZEpTT04ocmVzcG9uc2UucmVzcG9uc2VCb2R5KSxcbiAgICAgICAgICAgICAgICBlcnJNc2csXG4gICAgICAgICAgICAgICAgbG9jYWxlT2JqZWN0O1xuICAgICAgICAgICAgaWYgKHBhcnNlZERhdGEuaGFzT3duUHJvcGVydHkoJ3Jlc3VsdCcpKSB7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckZuKHN1Y2Nlc3NDYWxsYmFjaywgcGFyc2VkRGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZWREYXRhLmhhc093blByb3BlcnR5KCdlcnJvcicpKSB7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckZuKGZhaWx1cmVDYWxsYmFjaywgKHBhcnNlZERhdGEuZXJyb3IgJiYgcGFyc2VkRGF0YS5lcnJvci5tZXNzYWdlKSB8fCBwYXJzZWREYXRhLmVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VkRGF0YS5oYXNPd25Qcm9wZXJ0eSgnZXJyb3JEZXRhaWxzJykpIHtcbiAgICAgICAgICAgICAgICBsb2NhbGVPYmplY3QgPSAkcm9vdFNjb3BlLmxvY2FsZSB8fCAkcm9vdFNjb3BlLmFwcExvY2FsZTtcbiAgICAgICAgICAgICAgICBlcnJNc2cgPSBnZXRDbG9uZWRPYmplY3QobG9jYWxlT2JqZWN0W3BhcnNlZERhdGEuZXJyb3JEZXRhaWxzLmNvZGVdKTtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oZmFpbHVyZUNhbGxiYWNrLCByZXBsYWNlKGVyck1zZywgcGFyc2VkRGF0YS5lcnJvckRldGFpbHMuZGF0YSkgfHwgcGFyc2VkRGF0YS5lcnJvckRldGFpbHMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oc3VjY2Vzc0NhbGxiYWNrLCBwYXJzZWREYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZmFpbHVyZUNhbGxiYWNrKTsqL1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbm5lY3Rpb25QYXJhbXMgPSBnZW5lcmF0ZUNvbm5lY3Rpb25QYXJhbXMocGFyYW1zLCBhY3Rpb24pO1xuICAgICAgICBwYXJhbXMub3BlcmF0aW9uID0gYWN0aW9uO1xuICAgICAgICByZXR1cm4gaHR0cFNlcnZpY2Uuc2VuZENhbGxBc09ic2VydmFibGUoe1xuICAgICAgICAgICAgdXJsOiBjb25uZWN0aW9uUGFyYW1zLnVybCxcbiAgICAgICAgICAgIG1ldGhvZDogY29ubmVjdGlvblBhcmFtcy5tZXRob2QsXG4gICAgICAgICAgICBkYXRhOiBjb25uZWN0aW9uUGFyYW1zLmRhdGEsXG4gICAgICAgICAgICBoZWFkZXJzOiBjb25uZWN0aW9uUGFyYW1zLmhlYWRlcnNcbiAgICAgICAgfSwgcGFyYW1zKTtcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgTFZTZXJ2aWNlID0ge1xuICAgIHNlYXJjaFRhYmxlRGF0YVdpdGhRdWVyeTogKHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spID0+IGluaXRpYXRlQWN0aW9uKCdzZWFyY2hUYWJsZURhdGFXaXRoUXVlcnknLCBwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSxcbiAgICBleGVjdXRlQWdncmVnYXRlUXVlcnk6IChwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSA9PiBpbml0aWF0ZUFjdGlvbignZXhlY3V0ZUFnZ3JlZ2F0ZVF1ZXJ5JywgcGFyYW1zLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayksXG4gICAgc2VhcmNoVGFibGVEYXRhOiAocGFyYW1zLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykgPT4gaW5pdGlhdGVBY3Rpb24oJ3NlYXJjaFRhYmxlRGF0YScsIHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spLFxuICAgIHJlYWRUYWJsZURhdGE6IChwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSA9PiBpbml0aWF0ZUFjdGlvbigncmVhZFRhYmxlRGF0YScsIHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spLFxuICAgIGluc2VydFRhYmxlRGF0YTogKHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spID0+IGluaXRpYXRlQWN0aW9uKCdpbnNlcnRUYWJsZURhdGEnLCBwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSxcbiAgICBpbnNlcnRNdWx0aVBhcnRUYWJsZURhdGE6IChwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSA9PiBpbml0aWF0ZUFjdGlvbignaW5zZXJ0TXVsdGlQYXJ0VGFibGVEYXRhJywgcGFyYW1zLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayksXG4gICAgdXBkYXRlVGFibGVEYXRhOiAocGFyYW1zLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykgPT4gaW5pdGlhdGVBY3Rpb24oJ3VwZGF0ZVRhYmxlRGF0YScsIHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spLFxuICAgIHVwZGF0ZUNvbXBvc2l0ZVRhYmxlRGF0YTogKHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spID0+IGluaXRpYXRlQWN0aW9uKCd1cGRhdGVDb21wb3NpdGVUYWJsZURhdGEnLCBwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSxcbiAgICBwZXJpb2RVcGRhdGVDb21wb3NpdGVUYWJsZURhdGE6IChwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSA9PiBpbml0aWF0ZUFjdGlvbigncGVyaW9kVXBkYXRlQ29tcG9zaXRlVGFibGVEYXRhJywgcGFyYW1zLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayksXG4gICAgdXBkYXRlTXVsdGlQYXJ0VGFibGVEYXRhOiAocGFyYW1zLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykgPT4gaW5pdGlhdGVBY3Rpb24oJ3VwZGF0ZU11bHRpUGFydFRhYmxlRGF0YScsIHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spLFxuICAgIHVwZGF0ZU11bHRpUGFydENvbXBvc2l0ZVRhYmxlRGF0YTogKHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spID0+IGluaXRpYXRlQWN0aW9uKCd1cGRhdGVNdWx0aVBhcnRDb21wb3NpdGVUYWJsZURhdGEnLCBwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSxcbiAgICBkZWxldGVUYWJsZURhdGE6IChwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSA9PiBpbml0aWF0ZUFjdGlvbignZGVsZXRlVGFibGVEYXRhJywgcGFyYW1zLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayksXG4gICAgZGVsZXRlQ29tcG9zaXRlVGFibGVEYXRhOiAocGFyYW1zLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykgPT4gaW5pdGlhdGVBY3Rpb24oJ2RlbGV0ZUNvbXBvc2l0ZVRhYmxlRGF0YScsIHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spLFxuICAgIHBlcmlvZERlbGV0ZUNvbXBvc2l0ZVRhYmxlRGF0YTogKHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spID0+IGluaXRpYXRlQWN0aW9uKCdwZXJpb2REZWxldGVDb21wb3NpdGVUYWJsZURhdGEnLCBwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSxcbiAgICBleHBvcnRUYWJsZURhdGE6IHBhcmFtcyA9PiBpbml0aWF0ZUFjdGlvbignZXhwb3J0VGFibGVEYXRhJywgcGFyYW1zKSxcbiAgICBnZXREaXN0aW5jdERhdGFCeUZpZWxkczogcGFyYW1zID0+IGluaXRpYXRlQWN0aW9uKCdnZXREaXN0aW5jdERhdGFCeUZpZWxkcycsIHBhcmFtcyksXG4gICAgY291bnRUYWJsZURhdGFXaXRoUXVlcnk6IChwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSA9PiBpbml0aWF0ZUFjdGlvbignY291bnRUYWJsZURhdGFXaXRoUXVlcnknLCBwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKVxufTtcbiJdfQ==