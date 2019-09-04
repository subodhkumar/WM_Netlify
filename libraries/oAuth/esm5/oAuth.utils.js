import { _WM_APP_PROJECT, hasCordova, isIE } from '@wm/core';
var accessTokenSuffix = '.access_token';
var isWaveLens = false;
export var parseConfig = function (serviceParams) {
    var val, param, config;
    var urlParams = serviceParams.urlParams;
    config = {
        url: 'services/oauth2/:providerId/authorizationUrl',
        method: 'GET'
    };
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
};
var listeners = {}, ACCESSTOKEN_PLACEHOLDERS = {
    'STUDIO': 'WM_STUDIO_',
    'RUN': 'WM_RUN_'
}, newWindowProps = 'width=400,height=600';
/**
 * This function remove the accessToken for a provider
 * @param provider
 */
export var removeAccessToken = function (provider) {
    var accessTokenKey = getAccessTokenPlaceholder(provider);
    sessionStorage.removeItem(accessTokenKey);
};
/**
 * This function returns the accesstoken placeholder based on the studio or run mode for the project
 * @param provider
 * @returns {*}
 */
function getAccessTokenPlaceholder(provider) {
    var accessTokenKey;
    accessTokenKey = ACCESSTOKEN_PLACEHOLDERS.RUN + _WM_APP_PROJECT.id + '_' + provider + accessTokenSuffix;
    return accessTokenKey;
}
/**
 * This function performs the fake local storage update, so the IE gets the latest token instead of returning the cached localStorageValue
 */
function performFakeLocalStorageUpdate() {
    var dummy_key = 'dummy_key';
    localStorage.setItem(dummy_key, dummy_key);
    localStorage.removeItem(dummy_key);
}
/**
 * This function sets the accessToken
 * @param provider
 * @param accesstoken
 */
function setAccessToken(provider, accesstoken) {
    var accessTokenKey = getAccessTokenPlaceholder(provider);
    sessionStorage.setItem(accessTokenKey, accesstoken);
}
/**
 * this is a callback function to check if the authentication is done and invokes the successCallback
 * @param providerId
 * @param successCallback
 * @param evt
 */
function checkAuthenticationStatus(providerId, successCallback, removeProviderConfigCallBack, evt) {
    var accessTokenKey = providerId + accessTokenSuffix, accessToken = localStorage.getItem(accessTokenKey);
    if (evt && evt.origin !== window.location.origin) {
        return;
    }
    if (accessToken) {
        removeProviderConfigCallBack(providerId);
        localStorage.removeItem(accessTokenKey);
        setAccessToken(providerId, accessToken);
        window.removeEventListener('message', listeners[providerId]);
        setTimeout(function () {
            delete listeners[providerId];
            if (successCallback) {
                successCallback(accessToken);
            }
        });
    }
}
/**
 * this function keeps on checking the accesstoken in the LocalStorage and updates it accordingly
 * @param providerId
 * @param onSuccess
 * @param onError
 * @param startTime
 * @param loginObj
 */
function checkAccessTokenInWindow(providerId, onSuccess, onError, startTime, loginObj, removeProviderConfigCallBack) {
    performFakeLocalStorageUpdate();
    var currentTime = moment.duration(moment().format('HH:mm'), 'HH:mm'), timeDiff = currentTime.subtract(startTime), accessToken = getAccessToken(providerId, true);
    if (accessToken) {
        loginObj.accesstoken_retrieved = true;
        setAccessToken(providerId, accessToken);
        localStorage.removeItem(providerId + accessTokenSuffix);
        removeProviderConfigCallBack(providerId);
        if (onSuccess) {
            onSuccess();
        }
    }
    else if (timeDiff.minutes() > 1 && onSuccess && !loginObj.accesstoken_retrieved) {
        onSuccess('error');
    }
    else {
        setTimeout(function () {
            checkAccessTokenInWindow(providerId, onSuccess, onError, startTime, loginObj, removeProviderConfigCallBack);
        }, 3000);
    }
}
/**
 * checks for the window existence i.e if the window is manually closed by the user or any such
 * @param oAuthWindow
 * @param provider
 * @param callback
 */
function checkForWindowExistence(oAuthWindow, provider, callback) {
    if (oAuthWindow && listeners[provider]) {
        if (!oAuthWindow.closed) { // .closed is supported across major browser vendors however for IE the user has to enable protected mode from security options
            setTimeout(checkForWindowExistence.bind(undefined, oAuthWindow, provider, callback), 3000);
        }
        else {
            window.removeEventListener('message', listeners[provider]);
            delete listeners[provider];
            if (callback) {
                callback('error');
            }
        }
    }
}
/**
 * this functions handles the logic related to the window operations in IE
 * @param url
 * @param providerId
 * @param onSuccess
 * @param onError
 */
function handleLoginForIE(url, providerId, onSuccess, onError, removeProviderConfigCallBack) {
    var loginObj = {
        'accesstoken_retrieved': false
    };
    window.open(url, '_blank', newWindowProps);
    checkAccessTokenInWindow(providerId, onSuccess, onError, moment.duration(moment().format('HH:mm'), 'HH:mm'), loginObj, removeProviderConfigCallBack);
}
/**
 * this function adds the listener on the window and assigns the listener
 * @param provider
 * @param callback
 */
function onAuthWindowOpen(provider, callback, removeProviderConfigCallBack) {
    listeners[provider] = checkAuthenticationStatus.bind(undefined, provider, callback, removeProviderConfigCallBack);
    window.addEventListener('message', listeners[provider], false);
}
/**
 * this function is a callback function which enables the listener and checks for the window existence
 * @param providerId
 * @param onSuccess
 * @param url
 */
function postGetAuthorizationURL(url, providerId, onSuccess, removeProviderConfigCallBack) {
    var oAuthWindow;
    if (hasCordova()) {
        window.open(url, '_system');
        window['OAuthInMobile'](providerId).then(function (accessToken) {
            var key = providerId + accessTokenSuffix;
            if (accessToken) {
                localStorage.setItem(key, accessToken);
                checkAuthenticationStatus(providerId, onSuccess, removeProviderConfigCallBack, null);
            }
            else {
                onSuccess('error');
            }
        });
    }
    else {
        oAuthWindow = window.open(url, '_blank', newWindowProps);
        onAuthWindowOpen(providerId, onSuccess, removeProviderConfigCallBack);
        checkForWindowExistence(oAuthWindow, providerId, onSuccess);
    }
}
/**
 * function to get the authorization url
 * @param params provider id for which the auth url has to be fetched
 * @param successCallback callback to be invoked upon successful fetch of the providers
 * @param failureCallback callback to be invoked upon error
 * @returns {*}
 */
function getAuthorizationUrl(params, http) {
    var action = 'getAuthorizationUrl', serviceSettings = parseConfig({
        target: 'oauthConfiguration',
        action: action,
        urlParams: {
            projectId: _WM_APP_PROJECT.id,
            providerId: params.providerId
        },
        params: {
            'requestSourceType': params.requestSourceType
        }
    });
    return http.send(serviceSettings);
}
/**
 * this function retrieves the accessToken based on the run/studiomode
 * @param provider
 * @returns {*}
 */
export var getAccessToken = function (provider, checkLocalStorage) {
    var accessTokenKey = getAccessTokenPlaceholder(provider);
    if (checkLocalStorage) {
        return localStorage.getItem(provider + accessTokenSuffix);
    }
    return sessionStorage.getItem(accessTokenKey);
};
/**
 * this function is used to perform the authorization by opening the window and having active listeners
 * @param url
 * @param providerId
 * @param onSuccess
 * @returns {*}
 */
export var performAuthorization = function (url, providerId, onSuccess, onError, http, addProviderConfigCallBack, removeProviderConfigCallBack) {
    var requestSourceType = 'WEB';
    if (url) {
        if (isIE()) { // handling for IE
            handleLoginForIE(url, providerId, onSuccess, onError, removeProviderConfigCallBack);
        }
        else {
            postGetAuthorizationURL(url, providerId, onSuccess, removeProviderConfigCallBack);
        }
    }
    else {
        if (isWaveLens) {
            requestSourceType = 'WAVELENS';
        }
        else if (hasCordova()) {
            requestSourceType = 'MOBILE';
        }
        return getAuthorizationUrl({
            'providerId': providerId,
            'requestSourceType': requestSourceType
        }, http).then(function (response) {
            addProviderConfigCallBack({
                name: providerId,
                url: response.body,
                invoke: function () {
                    if (isIE()) { // handling for IE
                        handleLoginForIE(response, providerId, onSuccess, onError, removeProviderConfigCallBack);
                    }
                    else {
                        postGetAuthorizationURL(response.body, providerId, onSuccess, removeProviderConfigCallBack);
                    }
                }
            });
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib0F1dGgudXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vb0F1dGgvIiwic291cmNlcyI6WyJvQXV0aC51dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJN0QsSUFBTSxpQkFBaUIsR0FBRyxlQUFlLENBQUM7QUFDMUMsSUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBRXpCLE1BQU0sQ0FBQyxJQUFNLFdBQVcsR0FBRyxVQUFDLGFBQWtCO0lBRTFDLElBQUksR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUM7SUFDdkIsSUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQztJQUUxQyxNQUFNLEdBQUc7UUFDTCxHQUFHLEVBQUUsOENBQThDO1FBQ25ELE1BQU0sRUFBRSxLQUFLO0tBQ2hCLENBQUM7SUFFRixxR0FBcUc7SUFDckcsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFO1FBQ3RCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQzNELE1BQU0sQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM3RCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBRXRDLHFDQUFxQztRQUNyQyxLQUFLLElBQU0sR0FBRyxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO1lBQzVDLEdBQUcsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztTQUM3QjtLQUNK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LE1BQU0sRUFBRTtvQkFDSixJQUFJLElBQUksRUFBRSxFQUFFLEVBQUUsa0JBQWtCO3dCQUM1QixnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztxQkFDNUY7eUJBQU07d0JBQ0gsdUJBQXVCLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLDRCQUE0QixDQUFDLENBQUM7cUJBQy9GO2dCQUNMLENBQUM7YUFDSixDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztLQUNOO0FBQ0wsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgX1dNX0FQUF9QUk9KRUNULCBoYXNDb3Jkb3ZhLCBpc0lFIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5kZWNsYXJlIGNvbnN0IG1vbWVudCwgXztcblxuY29uc3QgYWNjZXNzVG9rZW5TdWZmaXggPSAnLmFjY2Vzc190b2tlbic7XG5jb25zdCBpc1dhdmVMZW5zID0gZmFsc2U7XG5cbmV4cG9ydCBjb25zdCBwYXJzZUNvbmZpZyA9IChzZXJ2aWNlUGFyYW1zOiBhbnkpOiBhbnkgPT4ge1xuXG4gICAgbGV0IHZhbCwgcGFyYW0sIGNvbmZpZztcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBzZXJ2aWNlUGFyYW1zLnVybFBhcmFtcztcblxuICAgIGNvbmZpZyA9IHtcbiAgICAgICAgdXJsOiAnc2VydmljZXMvb2F1dGgyLzpwcm92aWRlcklkL2F1dGhvcml6YXRpb25VcmwnLFxuICAgICAgICBtZXRob2Q6ICdHRVQnXG4gICAgfTtcblxuICAgIC8qVG8gaGFuZGxlIGR5bmFtaWMgdXJscywgYXBwZW5kIHRoZSBzZXJ2aWNlUGFyYW1zLmNvbmZpZy51cmwgd2l0aCB0aGUgc3RhdGljIHVybChpLmUuLCBjb25maWcudXJsKSovXG4gICAgaWYgKHNlcnZpY2VQYXJhbXMuY29uZmlnKSB7XG4gICAgICAgIGNvbmZpZy51cmwgPSAoc2VydmljZVBhcmFtcy5jb25maWcudXJsIHx8ICcnKSArIGNvbmZpZy51cmw7XG4gICAgICAgIGNvbmZpZy5tZXRob2QgPSBzZXJ2aWNlUGFyYW1zLmNvbmZpZy5tZXRob2QgfHwgY29uZmlnLm1ldGhvZDtcbiAgICAgICAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAgICAgICAvLyBUT0RPW1NodWJoYW1dIC0gY2hhbmdlIHRvIGZvciAtIG9mXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNlcnZpY2VQYXJhbXMuY29uZmlnLmhlYWRlcnMpIHtcbiAgICAgICAgICAgIHZhbCA9IHNlcnZpY2VQYXJhbXMuY29uZmlnLmhlYWRlcnNba2V5XTtcbiAgICAgICAgICAgIGNvbmZpZy5oZWFkZXJzW2tleV0gPSB2YWw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyogY2hlY2sgZm9yIHVybCBwYXJhbWV0ZXJzIHRvIHJlcGxhY2UgdGhlIHVybCAqL1xuICAgIGlmICh1cmxQYXJhbXMpIHtcbiAgICAgICAgZm9yIChwYXJhbSBpbiB1cmxQYXJhbXMpIHtcbiAgICAgICAgICAgIGlmICh1cmxQYXJhbXMuaGFzT3duUHJvcGVydHkocGFyYW0pKSB7XG4gICAgICAgICAgICAgICAgdmFsID0gdXJsUGFyYW1zW3BhcmFtXTtcbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQodmFsKSAmJiB2YWwgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnVybCA9IGNvbmZpZy51cmwucmVwbGFjZShuZXcgUmVnRXhwKCc6JyArIHBhcmFtLCAnZycpLCB2YWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIGNoZWNrIGZvciBkYXRhICovXG4gICAgaWYgKHNlcnZpY2VQYXJhbXMucGFyYW1zKSB7XG4gICAgICAgIGNvbmZpZy5wYXJhbXMgPSBzZXJ2aWNlUGFyYW1zLnBhcmFtcztcbiAgICB9XG4gICAgLyogY2hlY2sgZm9yIGRhdGEgKi9cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoc2VydmljZVBhcmFtcy5kYXRhKSkge1xuICAgICAgICBjb25maWcuZGF0YSA9IHNlcnZpY2VQYXJhbXMuZGF0YTtcbiAgICB9XG4gICAgLyogY2hlY2sgZm9yIGRhdGEgcGFyYW1ldGVycywgd3JpdHRlbiB0byBzdXBwb3J0IG9sZCBzZXJ2aWNlIGNhbGxzICguanNvbiBjYWxscykgKi9cbiAgICBpZiAoc2VydmljZVBhcmFtcy5kYXRhUGFyYW1zKSB7XG4gICAgICAgIGNvbmZpZy5kYXRhLnBhcmFtcyA9IHNlcnZpY2VQYXJhbXMuZGF0YVBhcmFtcztcbiAgICB9XG4gICAgLyogY2hlY2sgZm9yIGhlYWRlcnMgKi9cbiAgICBpZiAoc2VydmljZVBhcmFtcy5oZWFkZXJzKSB7XG4gICAgICAgIGNvbmZpZy5oZWFkZXJzID0gc2VydmljZVBhcmFtcy5oZWFkZXJzO1xuICAgIH1cblxuICAgIC8qIHNldCBleHRyYSBjb25maWcgZmxhZ3MgKi9cbiAgICBjb25maWcuYnlQYXNzUmVzdWx0ICAgID0gc2VydmljZVBhcmFtcy5ieVBhc3NSZXN1bHQ7XG4gICAgY29uZmlnLmlzRGlyZWN0Q2FsbCAgICA9IHNlcnZpY2VQYXJhbXMuaXNEaXJlY3RDYWxsO1xuICAgIGNvbmZpZy5pc0V4dFVSTCAgICAgICAgPSBzZXJ2aWNlUGFyYW1zLmlzRXh0VVJMO1xuICAgIGNvbmZpZy5wcmV2ZW50TXVsdGlwbGUgPSBzZXJ2aWNlUGFyYW1zLnByZXZlbnRNdWx0aXBsZTtcbiAgICBjb25maWcucmVzcG9uc2VUeXBlICAgID0gc2VydmljZVBhcmFtcy5yZXNwb25zZVR5cGU7XG5cbiAgICByZXR1cm4gY29uZmlnO1xufTtcblxuY29uc3QgbGlzdGVuZXJzID0ge30sXG4gICAgQUNDRVNTVE9LRU5fUExBQ0VIT0xERVJTID0ge1xuICAgICAgICAnU1RVRElPJzogJ1dNX1NUVURJT18nLFxuICAgICAgICAnUlVOJzogJ1dNX1JVTl8nXG4gICAgfSxcbiAgICBuZXdXaW5kb3dQcm9wcyA9ICd3aWR0aD00MDAsaGVpZ2h0PTYwMCc7XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiByZW1vdmUgdGhlIGFjY2Vzc1Rva2VuIGZvciBhIHByb3ZpZGVyXG4gKiBAcGFyYW0gcHJvdmlkZXJcbiAqL1xuZXhwb3J0IGNvbnN0IHJlbW92ZUFjY2Vzc1Rva2VuID0gKHByb3ZpZGVyKSA9PiB7XG4gICAgY29uc3QgYWNjZXNzVG9rZW5LZXkgPSBnZXRBY2Nlc3NUb2tlblBsYWNlaG9sZGVyKHByb3ZpZGVyKTtcbiAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKGFjY2Vzc1Rva2VuS2V5KTtcbn07XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBhY2Nlc3N0b2tlbiBwbGFjZWhvbGRlciBiYXNlZCBvbiB0aGUgc3R1ZGlvIG9yIHJ1biBtb2RlIGZvciB0aGUgcHJvamVjdFxuICogQHBhcmFtIHByb3ZpZGVyXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZnVuY3Rpb24gZ2V0QWNjZXNzVG9rZW5QbGFjZWhvbGRlcihwcm92aWRlcikge1xuICAgIGxldCBhY2Nlc3NUb2tlbktleTtcbiAgICBhY2Nlc3NUb2tlbktleSA9IEFDQ0VTU1RPS0VOX1BMQUNFSE9MREVSUy5SVU4gKyBfV01fQVBQX1BST0pFQ1QuaWQgKyAnXycgKyBwcm92aWRlciArIGFjY2Vzc1Rva2VuU3VmZml4O1xuICAgIHJldHVybiBhY2Nlc3NUb2tlbktleTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHBlcmZvcm1zIHRoZSBmYWtlIGxvY2FsIHN0b3JhZ2UgdXBkYXRlLCBzbyB0aGUgSUUgZ2V0cyB0aGUgbGF0ZXN0IHRva2VuIGluc3RlYWQgb2YgcmV0dXJuaW5nIHRoZSBjYWNoZWQgbG9jYWxTdG9yYWdlVmFsdWVcbiAqL1xuZnVuY3Rpb24gcGVyZm9ybUZha2VMb2NhbFN0b3JhZ2VVcGRhdGUoKSB7XG4gICAgY29uc3QgZHVtbXlfa2V5ID0gJ2R1bW15X2tleSc7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oZHVtbXlfa2V5LCBkdW1teV9rZXkpO1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGR1bW15X2tleSk7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBzZXRzIHRoZSBhY2Nlc3NUb2tlblxuICogQHBhcmFtIHByb3ZpZGVyXG4gKiBAcGFyYW0gYWNjZXNzdG9rZW5cbiAqL1xuZnVuY3Rpb24gc2V0QWNjZXNzVG9rZW4ocHJvdmlkZXIsIGFjY2Vzc3Rva2VuKSB7XG4gICAgY29uc3QgYWNjZXNzVG9rZW5LZXkgPSBnZXRBY2Nlc3NUb2tlblBsYWNlaG9sZGVyKHByb3ZpZGVyKTtcbiAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKGFjY2Vzc1Rva2VuS2V5LCBhY2Nlc3N0b2tlbik7XG59XG5cbi8qKlxuICogdGhpcyBpcyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBhdXRoZW50aWNhdGlvbiBpcyBkb25lIGFuZCBpbnZva2VzIHRoZSBzdWNjZXNzQ2FsbGJhY2tcbiAqIEBwYXJhbSBwcm92aWRlcklkXG4gKiBAcGFyYW0gc3VjY2Vzc0NhbGxiYWNrXG4gKiBAcGFyYW0gZXZ0XG4gKi9cbmZ1bmN0aW9uIGNoZWNrQXV0aGVudGljYXRpb25TdGF0dXMocHJvdmlkZXJJZCwgc3VjY2Vzc0NhbGxiYWNrLCByZW1vdmVQcm92aWRlckNvbmZpZ0NhbGxCYWNrLCBldnQpIHtcbiAgICBjb25zdCBhY2Nlc3NUb2tlbktleSA9IHByb3ZpZGVySWQgKyBhY2Nlc3NUb2tlblN1ZmZpeCxcbiAgICAgICAgYWNjZXNzVG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShhY2Nlc3NUb2tlbktleSk7XG4gICAgaWYgKGV2dCAmJiBldnQub3JpZ2luICE9PSB3aW5kb3cubG9jYXRpb24ub3JpZ2luKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGFjY2Vzc1Rva2VuKSB7XG4gICAgICAgIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2socHJvdmlkZXJJZCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGFjY2Vzc1Rva2VuS2V5KTtcbiAgICAgICAgc2V0QWNjZXNzVG9rZW4ocHJvdmlkZXJJZCwgYWNjZXNzVG9rZW4pO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RlbmVyc1twcm92aWRlcklkXSk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgZGVsZXRlIGxpc3RlbmVyc1twcm92aWRlcklkXTtcbiAgICAgICAgICAgIGlmIChzdWNjZXNzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzQ2FsbGJhY2soYWNjZXNzVG9rZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogdGhpcyBmdW5jdGlvbiBrZWVwcyBvbiBjaGVja2luZyB0aGUgYWNjZXNzdG9rZW4gaW4gdGhlIExvY2FsU3RvcmFnZSBhbmQgdXBkYXRlcyBpdCBhY2NvcmRpbmdseVxuICogQHBhcmFtIHByb3ZpZGVySWRcbiAqIEBwYXJhbSBvblN1Y2Nlc3NcbiAqIEBwYXJhbSBvbkVycm9yXG4gKiBAcGFyYW0gc3RhcnRUaW1lXG4gKiBAcGFyYW0gbG9naW5PYmpcbiAqL1xuZnVuY3Rpb24gY2hlY2tBY2Nlc3NUb2tlbkluV2luZG93KHByb3ZpZGVySWQsIG9uU3VjY2Vzcywgb25FcnJvciwgc3RhcnRUaW1lLCBsb2dpbk9iaiwgcmVtb3ZlUHJvdmlkZXJDb25maWdDYWxsQmFjaykge1xuICAgIHBlcmZvcm1GYWtlTG9jYWxTdG9yYWdlVXBkYXRlKCk7XG4gICAgY29uc3QgY3VycmVudFRpbWUgPSBtb21lbnQuZHVyYXRpb24obW9tZW50KCkuZm9ybWF0KCdISDptbScpLCAnSEg6bW0nKSxcbiAgICAgICAgdGltZURpZmYgPSBjdXJyZW50VGltZS5zdWJ0cmFjdChzdGFydFRpbWUpLFxuICAgICAgICBhY2Nlc3NUb2tlbiA9IGdldEFjY2Vzc1Rva2VuKHByb3ZpZGVySWQsIHRydWUpO1xuICAgIGlmIChhY2Nlc3NUb2tlbikge1xuICAgICAgICBsb2dpbk9iai5hY2Nlc3N0b2tlbl9yZXRyaWV2ZWQgPSB0cnVlO1xuICAgICAgICBzZXRBY2Nlc3NUb2tlbihwcm92aWRlcklkLCBhY2Nlc3NUb2tlbik7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHByb3ZpZGVySWQgKyBhY2Nlc3NUb2tlblN1ZmZpeCk7XG4gICAgICAgIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2socHJvdmlkZXJJZCk7XG4gICAgICAgIGlmIChvblN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIG9uU3VjY2VzcygpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0aW1lRGlmZi5taW51dGVzKCkgPiAxICYmIG9uU3VjY2VzcyAmJiAhbG9naW5PYmouYWNjZXNzdG9rZW5fcmV0cmlldmVkKSB7XG4gICAgICAgIG9uU3VjY2VzcygnZXJyb3InKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNoZWNrQWNjZXNzVG9rZW5JbldpbmRvdyhwcm92aWRlcklkLCBvblN1Y2Nlc3MsIG9uRXJyb3IsIHN0YXJ0VGltZSwgbG9naW5PYmosIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2spO1xuICAgICAgICB9LCAzMDAwKTtcbiAgICB9XG59XG5cbi8qKlxuICogY2hlY2tzIGZvciB0aGUgd2luZG93IGV4aXN0ZW5jZSBpLmUgaWYgdGhlIHdpbmRvdyBpcyBtYW51YWxseSBjbG9zZWQgYnkgdGhlIHVzZXIgb3IgYW55IHN1Y2hcbiAqIEBwYXJhbSBvQXV0aFdpbmRvd1xuICogQHBhcmFtIHByb3ZpZGVyXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gY2hlY2tGb3JXaW5kb3dFeGlzdGVuY2Uob0F1dGhXaW5kb3csIHByb3ZpZGVyLCBjYWxsYmFjaykge1xuICAgIGlmIChvQXV0aFdpbmRvdyAmJiBsaXN0ZW5lcnNbcHJvdmlkZXJdKSB7XG4gICAgICAgIGlmICghb0F1dGhXaW5kb3cuY2xvc2VkKSB7IC8vIC5jbG9zZWQgaXMgc3VwcG9ydGVkIGFjcm9zcyBtYWpvciBicm93c2VyIHZlbmRvcnMgaG93ZXZlciBmb3IgSUUgdGhlIHVzZXIgaGFzIHRvIGVuYWJsZSBwcm90ZWN0ZWQgbW9kZSBmcm9tIHNlY3VyaXR5IG9wdGlvbnNcbiAgICAgICAgICAgIHNldFRpbWVvdXQoY2hlY2tGb3JXaW5kb3dFeGlzdGVuY2UuYmluZCh1bmRlZmluZWQsIG9BdXRoV2luZG93LCBwcm92aWRlciwgY2FsbGJhY2spLCAzMDAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdGVuZXJzW3Byb3ZpZGVyXSk7XG4gICAgICAgICAgICBkZWxldGUgbGlzdGVuZXJzW3Byb3ZpZGVyXTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCdlcnJvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiB0aGlzIGZ1bmN0aW9ucyBoYW5kbGVzIHRoZSBsb2dpYyByZWxhdGVkIHRvIHRoZSB3aW5kb3cgb3BlcmF0aW9ucyBpbiBJRVxuICogQHBhcmFtIHVybFxuICogQHBhcmFtIHByb3ZpZGVySWRcbiAqIEBwYXJhbSBvblN1Y2Nlc3NcbiAqIEBwYXJhbSBvbkVycm9yXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZUxvZ2luRm9ySUUodXJsLCBwcm92aWRlcklkLCBvblN1Y2Nlc3MsIG9uRXJyb3IsIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2spIHtcbiAgICBjb25zdCBsb2dpbk9iaiA9IHtcbiAgICAgICAgJ2FjY2Vzc3Rva2VuX3JldHJpZXZlZCc6IGZhbHNlXG4gICAgfTtcbiAgICB3aW5kb3cub3Blbih1cmwsICdfYmxhbmsnLCBuZXdXaW5kb3dQcm9wcyk7XG4gICAgY2hlY2tBY2Nlc3NUb2tlbkluV2luZG93KHByb3ZpZGVySWQsIG9uU3VjY2Vzcywgb25FcnJvciwgbW9tZW50LmR1cmF0aW9uKG1vbWVudCgpLmZvcm1hdCgnSEg6bW0nKSwgJ0hIOm1tJyksIGxvZ2luT2JqLCByZW1vdmVQcm92aWRlckNvbmZpZ0NhbGxCYWNrKTtcbn1cblxuLyoqXG4gKiB0aGlzIGZ1bmN0aW9uIGFkZHMgdGhlIGxpc3RlbmVyIG9uIHRoZSB3aW5kb3cgYW5kIGFzc2lnbnMgdGhlIGxpc3RlbmVyXG4gKiBAcGFyYW0gcHJvdmlkZXJcbiAqIEBwYXJhbSBjYWxsYmFja1xuICovXG5mdW5jdGlvbiBvbkF1dGhXaW5kb3dPcGVuKHByb3ZpZGVyLCBjYWxsYmFjaywgcmVtb3ZlUHJvdmlkZXJDb25maWdDYWxsQmFjaykge1xuICAgIGxpc3RlbmVyc1twcm92aWRlcl0gPSBjaGVja0F1dGhlbnRpY2F0aW9uU3RhdHVzLmJpbmQodW5kZWZpbmVkLCBwcm92aWRlciwgY2FsbGJhY2ssIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2spO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdGVuZXJzW3Byb3ZpZGVyXSwgZmFsc2UpO1xufVxuXG4vKipcbiAqIHRoaXMgZnVuY3Rpb24gaXMgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGljaCBlbmFibGVzIHRoZSBsaXN0ZW5lciBhbmQgY2hlY2tzIGZvciB0aGUgd2luZG93IGV4aXN0ZW5jZVxuICogQHBhcmFtIHByb3ZpZGVySWRcbiAqIEBwYXJhbSBvblN1Y2Nlc3NcbiAqIEBwYXJhbSB1cmxcbiAqL1xuZnVuY3Rpb24gcG9zdEdldEF1dGhvcml6YXRpb25VUkwodXJsLCBwcm92aWRlcklkLCBvblN1Y2Nlc3MsIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2spIHtcbiAgICBsZXQgb0F1dGhXaW5kb3c7XG5cbiAgICAgaWYgKGhhc0NvcmRvdmEoKSkge1xuICAgICAgICAgd2luZG93Lm9wZW4odXJsLCAnX3N5c3RlbScpO1xuICAgICAgICAgd2luZG93WydPQXV0aEluTW9iaWxlJ10ocHJvdmlkZXJJZCkudGhlbihhY2Nlc3NUb2tlbiA9PiB7XG4gICAgICAgICAgICAgY29uc3Qga2V5ID0gcHJvdmlkZXJJZCArIGFjY2Vzc1Rva2VuU3VmZml4O1xuICAgICAgICAgICAgIGlmIChhY2Nlc3NUb2tlbikge1xuICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIGFjY2Vzc1Rva2VuKTtcbiAgICAgICAgICAgICAgICAgY2hlY2tBdXRoZW50aWNhdGlvblN0YXR1cyhwcm92aWRlcklkLCBvblN1Y2Nlc3MsIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2ssIG51bGwpO1xuICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgIG9uU3VjY2VzcygnZXJyb3InKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICB9KTtcbiAgICAgfSBlbHNlIHtcbiAgICAgICAgIG9BdXRoV2luZG93ID0gd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJywgbmV3V2luZG93UHJvcHMpO1xuICAgICAgICAgb25BdXRoV2luZG93T3Blbihwcm92aWRlcklkLCBvblN1Y2Nlc3MsIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2spO1xuICAgICAgICAgY2hlY2tGb3JXaW5kb3dFeGlzdGVuY2Uob0F1dGhXaW5kb3csIHByb3ZpZGVySWQsIG9uU3VjY2Vzcyk7XG4gICAgIH1cbn1cblxuLyoqXG4gKiBmdW5jdGlvbiB0byBnZXQgdGhlIGF1dGhvcml6YXRpb24gdXJsXG4gKiBAcGFyYW0gcGFyYW1zIHByb3ZpZGVyIGlkIGZvciB3aGljaCB0aGUgYXV0aCB1cmwgaGFzIHRvIGJlIGZldGNoZWRcbiAqIEBwYXJhbSBzdWNjZXNzQ2FsbGJhY2sgY2FsbGJhY2sgdG8gYmUgaW52b2tlZCB1cG9uIHN1Y2Nlc3NmdWwgZmV0Y2ggb2YgdGhlIHByb3ZpZGVyc1xuICogQHBhcmFtIGZhaWx1cmVDYWxsYmFjayBjYWxsYmFjayB0byBiZSBpbnZva2VkIHVwb24gZXJyb3JcbiAqIEByZXR1cm5zIHsqfVxuICovXG5mdW5jdGlvbiBnZXRBdXRob3JpemF0aW9uVXJsKHBhcmFtcywgaHR0cCkge1xuICAgIGNvbnN0IGFjdGlvbiA9ICdnZXRBdXRob3JpemF0aW9uVXJsJyxcbiAgICAgICAgc2VydmljZVNldHRpbmdzID0gcGFyc2VDb25maWcoe1xuICAgICAgICAgICAgdGFyZ2V0OiAnb2F1dGhDb25maWd1cmF0aW9uJyxcbiAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICAgICAgdXJsUGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgcHJvamVjdElkOiBfV01fQVBQX1BST0pFQ1QuaWQsXG4gICAgICAgICAgICAgICAgcHJvdmlkZXJJZDogcGFyYW1zLnByb3ZpZGVySWRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAncmVxdWVzdFNvdXJjZVR5cGUnOiBwYXJhbXMucmVxdWVzdFNvdXJjZVR5cGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIGh0dHAuc2VuZChzZXJ2aWNlU2V0dGluZ3MpO1xufVxuXG4vKipcbiAqIHRoaXMgZnVuY3Rpb24gcmV0cmlldmVzIHRoZSBhY2Nlc3NUb2tlbiBiYXNlZCBvbiB0aGUgcnVuL3N0dWRpb21vZGVcbiAqIEBwYXJhbSBwcm92aWRlclxuICogQHJldHVybnMgeyp9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBY2Nlc3NUb2tlbiA9IChwcm92aWRlciwgY2hlY2tMb2NhbFN0b3JhZ2UpID0+IHtcbiAgICBjb25zdCBhY2Nlc3NUb2tlbktleSA9IGdldEFjY2Vzc1Rva2VuUGxhY2Vob2xkZXIocHJvdmlkZXIpO1xuICAgIGlmIChjaGVja0xvY2FsU3RvcmFnZSkge1xuICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0ocHJvdmlkZXIgKyBhY2Nlc3NUb2tlblN1ZmZpeCk7XG4gICAgfVxuICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGFjY2Vzc1Rva2VuS2V5KTtcbn07XG5cblxuLyoqXG4gKiB0aGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gcGVyZm9ybSB0aGUgYXV0aG9yaXphdGlvbiBieSBvcGVuaW5nIHRoZSB3aW5kb3cgYW5kIGhhdmluZyBhY3RpdmUgbGlzdGVuZXJzXG4gKiBAcGFyYW0gdXJsXG4gKiBAcGFyYW0gcHJvdmlkZXJJZFxuICogQHBhcmFtIG9uU3VjY2Vzc1xuICogQHJldHVybnMgeyp9XG4gKi9cbmV4cG9ydCBjb25zdCBwZXJmb3JtQXV0aG9yaXphdGlvbiA9ICh1cmwsIHByb3ZpZGVySWQsIG9uU3VjY2Vzcywgb25FcnJvciwgaHR0cCwgYWRkUHJvdmlkZXJDb25maWdDYWxsQmFjaywgcmVtb3ZlUHJvdmlkZXJDb25maWdDYWxsQmFjaykgPT4ge1xuICAgIGxldCByZXF1ZXN0U291cmNlVHlwZSA9ICdXRUInO1xuICAgIGlmICh1cmwpIHtcbiAgICAgICAgaWYgKGlzSUUoKSkgeyAvLyBoYW5kbGluZyBmb3IgSUVcbiAgICAgICAgICAgIGhhbmRsZUxvZ2luRm9ySUUodXJsLCBwcm92aWRlcklkLCBvblN1Y2Nlc3MsIG9uRXJyb3IsIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zdEdldEF1dGhvcml6YXRpb25VUkwodXJsLCBwcm92aWRlcklkLCBvblN1Y2Nlc3MsIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2spO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzV2F2ZUxlbnMpIHtcbiAgICAgICAgICAgIHJlcXVlc3RTb3VyY2VUeXBlID0gJ1dBVkVMRU5TJztcbiAgICAgICAgfSBlbHNlIGlmIChoYXNDb3Jkb3ZhKCkpIHtcbiAgICAgICAgICAgIHJlcXVlc3RTb3VyY2VUeXBlID0gJ01PQklMRSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdldEF1dGhvcml6YXRpb25Vcmwoe1xuICAgICAgICAgICAgJ3Byb3ZpZGVySWQnOiBwcm92aWRlcklkLFxuICAgICAgICAgICAgJ3JlcXVlc3RTb3VyY2VUeXBlJzogcmVxdWVzdFNvdXJjZVR5cGVcbiAgICAgICAgfSwgaHR0cCkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGFkZFByb3ZpZGVyQ29uZmlnQ2FsbEJhY2soe1xuICAgICAgICAgICAgICAgIG5hbWU6IHByb3ZpZGVySWQsXG4gICAgICAgICAgICAgICAgdXJsOiByZXNwb25zZS5ib2R5LFxuICAgICAgICAgICAgICAgIGludm9rZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNJRSgpKSB7IC8vIGhhbmRsaW5nIGZvciBJRVxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlTG9naW5Gb3JJRShyZXNwb25zZSwgcHJvdmlkZXJJZCwgb25TdWNjZXNzLCBvbkVycm9yLCByZW1vdmVQcm92aWRlckNvbmZpZ0NhbGxCYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RHZXRBdXRob3JpemF0aW9uVVJMKHJlc3BvbnNlLmJvZHksIHByb3ZpZGVySWQsIG9uU3VjY2VzcywgcmVtb3ZlUHJvdmlkZXJDb25maWdDYWxsQmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcbiJdfQ==