import { _WM_APP_PROJECT, hasCordova, isIE } from '@wm/core';
const accessTokenSuffix = '.access_token';
const isWaveLens = false;
export const parseConfig = (serviceParams) => {
    let val, param, config;
    const urlParams = serviceParams.urlParams;
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
};
const listeners = {}, ACCESSTOKEN_PLACEHOLDERS = {
    'STUDIO': 'WM_STUDIO_',
    'RUN': 'WM_RUN_'
}, newWindowProps = 'width=400,height=600';
/**
 * This function remove the accessToken for a provider
 * @param provider
 */
export const removeAccessToken = (provider) => {
    const accessTokenKey = getAccessTokenPlaceholder(provider);
    sessionStorage.removeItem(accessTokenKey);
};
/**
 * This function returns the accesstoken placeholder based on the studio or run mode for the project
 * @param provider
 * @returns {*}
 */
function getAccessTokenPlaceholder(provider) {
    let accessTokenKey;
    accessTokenKey = ACCESSTOKEN_PLACEHOLDERS.RUN + _WM_APP_PROJECT.id + '_' + provider + accessTokenSuffix;
    return accessTokenKey;
}
/**
 * This function performs the fake local storage update, so the IE gets the latest token instead of returning the cached localStorageValue
 */
function performFakeLocalStorageUpdate() {
    const dummy_key = 'dummy_key';
    localStorage.setItem(dummy_key, dummy_key);
    localStorage.removeItem(dummy_key);
}
/**
 * This function sets the accessToken
 * @param provider
 * @param accesstoken
 */
function setAccessToken(provider, accesstoken) {
    const accessTokenKey = getAccessTokenPlaceholder(provider);
    sessionStorage.setItem(accessTokenKey, accesstoken);
}
/**
 * this is a callback function to check if the authentication is done and invokes the successCallback
 * @param providerId
 * @param successCallback
 * @param evt
 */
function checkAuthenticationStatus(providerId, successCallback, removeProviderConfigCallBack, evt) {
    const accessTokenKey = providerId + accessTokenSuffix, accessToken = localStorage.getItem(accessTokenKey);
    if (evt && evt.origin !== window.location.origin) {
        return;
    }
    if (accessToken) {
        removeProviderConfigCallBack(providerId);
        localStorage.removeItem(accessTokenKey);
        setAccessToken(providerId, accessToken);
        window.removeEventListener('message', listeners[providerId]);
        setTimeout(() => {
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
    const currentTime = moment.duration(moment().format('HH:mm'), 'HH:mm'), timeDiff = currentTime.subtract(startTime), accessToken = getAccessToken(providerId, true);
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
        setTimeout(() => {
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
    const loginObj = {
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
    let oAuthWindow;
    if (hasCordova()) {
        window.open(url, '_system');
        window['OAuthInMobile'](providerId).then(accessToken => {
            const key = providerId + accessTokenSuffix;
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
    const action = 'getAuthorizationUrl', serviceSettings = parseConfig({
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
export const getAccessToken = (provider, checkLocalStorage) => {
    const accessTokenKey = getAccessTokenPlaceholder(provider);
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
export const performAuthorization = (url, providerId, onSuccess, onError, http, addProviderConfigCallBack, removeProviderConfigCallBack) => {
    let requestSourceType = 'WEB';
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
        }, http).then((response) => {
            addProviderConfigCallBack({
                name: providerId,
                url: response.body,
                invoke: () => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib0F1dGgudXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vb0F1dGgvIiwic291cmNlcyI6WyJvQXV0aC51dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJN0QsTUFBTSxpQkFBaUIsR0FBRyxlQUFlLENBQUM7QUFDMUMsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBRXpCLE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxDQUFDLGFBQWtCLEVBQU8sRUFBRTtJQUVuRCxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDO0lBQ3ZCLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUM7SUFFMUMsTUFBTSxHQUFHO1FBQ0wsR0FBRyxFQUFFLDhDQUE4QztRQUNuRCxNQUFNLEVBQUUsS0FBSztLQUNoQixDQUFDO0lBRUYscUdBQXFHO0lBQ3JHLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRTtRQUN0QixNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUMzRCxNQUFNLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDN0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUV0QyxxQ0FBcUM7UUFDckMsS0FBSyxNQUFNLEdBQUcsSUFBSSxhQUFhLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUM1QyxHQUFHLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7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dkIseUJBQXlCLENBQUM7Z0JBQ3RCLElBQUksRUFBRSxVQUFVO2dCQUNoQixHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUk7Z0JBQ2xCLE1BQU0sRUFBRSxHQUFHLEVBQUU7b0JBQ1QsSUFBSSxJQUFJLEVBQUUsRUFBRSxFQUFFLGtCQUFrQjt3QkFDNUIsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLDRCQUE0QixDQUFDLENBQUM7cUJBQzVGO3lCQUFNO3dCQUNILHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO3FCQUMvRjtnQkFDTCxDQUFDO2FBQ0osQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7S0FDTjtBQUNMLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IF9XTV9BUFBfUFJPSkVDVCwgaGFzQ29yZG92YSwgaXNJRSB9IGZyb20gJ0B3bS9jb3JlJztcblxuZGVjbGFyZSBjb25zdCBtb21lbnQsIF87XG5cbmNvbnN0IGFjY2Vzc1Rva2VuU3VmZml4ID0gJy5hY2Nlc3NfdG9rZW4nO1xuY29uc3QgaXNXYXZlTGVucyA9IGZhbHNlO1xuXG5leHBvcnQgY29uc3QgcGFyc2VDb25maWcgPSAoc2VydmljZVBhcmFtczogYW55KTogYW55ID0+IHtcblxuICAgIGxldCB2YWwsIHBhcmFtLCBjb25maWc7XG4gICAgY29uc3QgdXJsUGFyYW1zID0gc2VydmljZVBhcmFtcy51cmxQYXJhbXM7XG5cbiAgICBjb25maWcgPSB7XG4gICAgICAgIHVybDogJ3NlcnZpY2VzL29hdXRoMi86cHJvdmlkZXJJZC9hdXRob3JpemF0aW9uVXJsJyxcbiAgICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgIH07XG5cbiAgICAvKlRvIGhhbmRsZSBkeW5hbWljIHVybHMsIGFwcGVuZCB0aGUgc2VydmljZVBhcmFtcy5jb25maWcudXJsIHdpdGggdGhlIHN0YXRpYyB1cmwoaS5lLiwgY29uZmlnLnVybCkqL1xuICAgIGlmIChzZXJ2aWNlUGFyYW1zLmNvbmZpZykge1xuICAgICAgICBjb25maWcudXJsID0gKHNlcnZpY2VQYXJhbXMuY29uZmlnLnVybCB8fCAnJykgKyBjb25maWcudXJsO1xuICAgICAgICBjb25maWcubWV0aG9kID0gc2VydmljZVBhcmFtcy5jb25maWcubWV0aG9kIHx8IGNvbmZpZy5tZXRob2Q7XG4gICAgICAgIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgICAgICAgLy8gVE9ET1tTaHViaGFtXSAtIGNoYW5nZSB0byBmb3IgLSBvZlxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzZXJ2aWNlUGFyYW1zLmNvbmZpZy5oZWFkZXJzKSB7XG4gICAgICAgICAgICB2YWwgPSBzZXJ2aWNlUGFyYW1zLmNvbmZpZy5oZWFkZXJzW2tleV07XG4gICAgICAgICAgICBjb25maWcuaGVhZGVyc1trZXldID0gdmFsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qIGNoZWNrIGZvciB1cmwgcGFyYW1ldGVycyB0byByZXBsYWNlIHRoZSB1cmwgKi9cbiAgICBpZiAodXJsUGFyYW1zKSB7XG4gICAgICAgIGZvciAocGFyYW0gaW4gdXJsUGFyYW1zKSB7XG4gICAgICAgICAgICBpZiAodXJsUGFyYW1zLmhhc093blByb3BlcnR5KHBhcmFtKSkge1xuICAgICAgICAgICAgICAgIHZhbCA9IHVybFBhcmFtc1twYXJhbV07XG4gICAgICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy51cmwgPSBjb25maWcudXJsLnJlcGxhY2UobmV3IFJlZ0V4cCgnOicgKyBwYXJhbSwgJ2cnKSwgdmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBjaGVjayBmb3IgZGF0YSAqL1xuICAgIGlmIChzZXJ2aWNlUGFyYW1zLnBhcmFtcykge1xuICAgICAgICBjb25maWcucGFyYW1zID0gc2VydmljZVBhcmFtcy5wYXJhbXM7XG4gICAgfVxuICAgIC8qIGNoZWNrIGZvciBkYXRhICovXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHNlcnZpY2VQYXJhbXMuZGF0YSkpIHtcbiAgICAgICAgY29uZmlnLmRhdGEgPSBzZXJ2aWNlUGFyYW1zLmRhdGE7XG4gICAgfVxuICAgIC8qIGNoZWNrIGZvciBkYXRhIHBhcmFtZXRlcnMsIHdyaXR0ZW4gdG8gc3VwcG9ydCBvbGQgc2VydmljZSBjYWxscyAoLmpzb24gY2FsbHMpICovXG4gICAgaWYgKHNlcnZpY2VQYXJhbXMuZGF0YVBhcmFtcykge1xuICAgICAgICBjb25maWcuZGF0YS5wYXJhbXMgPSBzZXJ2aWNlUGFyYW1zLmRhdGFQYXJhbXM7XG4gICAgfVxuICAgIC8qIGNoZWNrIGZvciBoZWFkZXJzICovXG4gICAgaWYgKHNlcnZpY2VQYXJhbXMuaGVhZGVycykge1xuICAgICAgICBjb25maWcuaGVhZGVycyA9IHNlcnZpY2VQYXJhbXMuaGVhZGVycztcbiAgICB9XG5cbiAgICAvKiBzZXQgZXh0cmEgY29uZmlnIGZsYWdzICovXG4gICAgY29uZmlnLmJ5UGFzc1Jlc3VsdCAgICA9IHNlcnZpY2VQYXJhbXMuYnlQYXNzUmVzdWx0O1xuICAgIGNvbmZpZy5pc0RpcmVjdENhbGwgICAgPSBzZXJ2aWNlUGFyYW1zLmlzRGlyZWN0Q2FsbDtcbiAgICBjb25maWcuaXNFeHRVUkwgICAgICAgID0gc2VydmljZVBhcmFtcy5pc0V4dFVSTDtcbiAgICBjb25maWcucHJldmVudE11bHRpcGxlID0gc2VydmljZVBhcmFtcy5wcmV2ZW50TXVsdGlwbGU7XG4gICAgY29uZmlnLnJlc3BvbnNlVHlwZSAgICA9IHNlcnZpY2VQYXJhbXMucmVzcG9uc2VUeXBlO1xuXG4gICAgcmV0dXJuIGNvbmZpZztcbn07XG5cbmNvbnN0IGxpc3RlbmVycyA9IHt9LFxuICAgIEFDQ0VTU1RPS0VOX1BMQUNFSE9MREVSUyA9IHtcbiAgICAgICAgJ1NUVURJTyc6ICdXTV9TVFVESU9fJyxcbiAgICAgICAgJ1JVTic6ICdXTV9SVU5fJ1xuICAgIH0sXG4gICAgbmV3V2luZG93UHJvcHMgPSAnd2lkdGg9NDAwLGhlaWdodD02MDAnO1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gcmVtb3ZlIHRoZSBhY2Nlc3NUb2tlbiBmb3IgYSBwcm92aWRlclxuICogQHBhcmFtIHByb3ZpZGVyXG4gKi9cbmV4cG9ydCBjb25zdCByZW1vdmVBY2Nlc3NUb2tlbiA9IChwcm92aWRlcikgPT4ge1xuICAgIGNvbnN0IGFjY2Vzc1Rva2VuS2V5ID0gZ2V0QWNjZXNzVG9rZW5QbGFjZWhvbGRlcihwcm92aWRlcik7XG4gICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShhY2Nlc3NUb2tlbktleSk7XG59O1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgYWNjZXNzdG9rZW4gcGxhY2Vob2xkZXIgYmFzZWQgb24gdGhlIHN0dWRpbyBvciBydW4gbW9kZSBmb3IgdGhlIHByb2plY3RcbiAqIEBwYXJhbSBwcm92aWRlclxuICogQHJldHVybnMgeyp9XG4gKi9cbmZ1bmN0aW9uIGdldEFjY2Vzc1Rva2VuUGxhY2Vob2xkZXIocHJvdmlkZXIpIHtcbiAgICBsZXQgYWNjZXNzVG9rZW5LZXk7XG4gICAgYWNjZXNzVG9rZW5LZXkgPSBBQ0NFU1NUT0tFTl9QTEFDRUhPTERFUlMuUlVOICsgX1dNX0FQUF9QUk9KRUNULmlkICsgJ18nICsgcHJvdmlkZXIgKyBhY2Nlc3NUb2tlblN1ZmZpeDtcbiAgICByZXR1cm4gYWNjZXNzVG9rZW5LZXk7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBwZXJmb3JtcyB0aGUgZmFrZSBsb2NhbCBzdG9yYWdlIHVwZGF0ZSwgc28gdGhlIElFIGdldHMgdGhlIGxhdGVzdCB0b2tlbiBpbnN0ZWFkIG9mIHJldHVybmluZyB0aGUgY2FjaGVkIGxvY2FsU3RvcmFnZVZhbHVlXG4gKi9cbmZ1bmN0aW9uIHBlcmZvcm1GYWtlTG9jYWxTdG9yYWdlVXBkYXRlKCkge1xuICAgIGNvbnN0IGR1bW15X2tleSA9ICdkdW1teV9rZXknO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGR1bW15X2tleSwgZHVtbXlfa2V5KTtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShkdW1teV9rZXkpO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gc2V0cyB0aGUgYWNjZXNzVG9rZW5cbiAqIEBwYXJhbSBwcm92aWRlclxuICogQHBhcmFtIGFjY2Vzc3Rva2VuXG4gKi9cbmZ1bmN0aW9uIHNldEFjY2Vzc1Rva2VuKHByb3ZpZGVyLCBhY2Nlc3N0b2tlbikge1xuICAgIGNvbnN0IGFjY2Vzc1Rva2VuS2V5ID0gZ2V0QWNjZXNzVG9rZW5QbGFjZWhvbGRlcihwcm92aWRlcik7XG4gICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShhY2Nlc3NUb2tlbktleSwgYWNjZXNzdG9rZW4pO1xufVxuXG4vKipcbiAqIHRoaXMgaXMgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgYXV0aGVudGljYXRpb24gaXMgZG9uZSBhbmQgaW52b2tlcyB0aGUgc3VjY2Vzc0NhbGxiYWNrXG4gKiBAcGFyYW0gcHJvdmlkZXJJZFxuICogQHBhcmFtIHN1Y2Nlc3NDYWxsYmFja1xuICogQHBhcmFtIGV2dFxuICovXG5mdW5jdGlvbiBjaGVja0F1dGhlbnRpY2F0aW9uU3RhdHVzKHByb3ZpZGVySWQsIHN1Y2Nlc3NDYWxsYmFjaywgcmVtb3ZlUHJvdmlkZXJDb25maWdDYWxsQmFjaywgZXZ0KSB7XG4gICAgY29uc3QgYWNjZXNzVG9rZW5LZXkgPSBwcm92aWRlcklkICsgYWNjZXNzVG9rZW5TdWZmaXgsXG4gICAgICAgIGFjY2Vzc1Rva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oYWNjZXNzVG9rZW5LZXkpO1xuICAgIGlmIChldnQgJiYgZXZ0Lm9yaWdpbiAhPT0gd2luZG93LmxvY2F0aW9uLm9yaWdpbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChhY2Nlc3NUb2tlbikge1xuICAgICAgICByZW1vdmVQcm92aWRlckNvbmZpZ0NhbGxCYWNrKHByb3ZpZGVySWQpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShhY2Nlc3NUb2tlbktleSk7XG4gICAgICAgIHNldEFjY2Vzc1Rva2VuKHByb3ZpZGVySWQsIGFjY2Vzc1Rva2VuKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBsaXN0ZW5lcnNbcHJvdmlkZXJJZF0pO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGRlbGV0ZSBsaXN0ZW5lcnNbcHJvdmlkZXJJZF07XG4gICAgICAgICAgICBpZiAoc3VjY2Vzc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc3VjY2Vzc0NhbGxiYWNrKGFjY2Vzc1Rva2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipcbiAqIHRoaXMgZnVuY3Rpb24ga2VlcHMgb24gY2hlY2tpbmcgdGhlIGFjY2Vzc3Rva2VuIGluIHRoZSBMb2NhbFN0b3JhZ2UgYW5kIHVwZGF0ZXMgaXQgYWNjb3JkaW5nbHlcbiAqIEBwYXJhbSBwcm92aWRlcklkXG4gKiBAcGFyYW0gb25TdWNjZXNzXG4gKiBAcGFyYW0gb25FcnJvclxuICogQHBhcmFtIHN0YXJ0VGltZVxuICogQHBhcmFtIGxvZ2luT2JqXG4gKi9cbmZ1bmN0aW9uIGNoZWNrQWNjZXNzVG9rZW5JbldpbmRvdyhwcm92aWRlcklkLCBvblN1Y2Nlc3MsIG9uRXJyb3IsIHN0YXJ0VGltZSwgbG9naW5PYmosIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2spIHtcbiAgICBwZXJmb3JtRmFrZUxvY2FsU3RvcmFnZVVwZGF0ZSgpO1xuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gbW9tZW50LmR1cmF0aW9uKG1vbWVudCgpLmZvcm1hdCgnSEg6bW0nKSwgJ0hIOm1tJyksXG4gICAgICAgIHRpbWVEaWZmID0gY3VycmVudFRpbWUuc3VidHJhY3Qoc3RhcnRUaW1lKSxcbiAgICAgICAgYWNjZXNzVG9rZW4gPSBnZXRBY2Nlc3NUb2tlbihwcm92aWRlcklkLCB0cnVlKTtcbiAgICBpZiAoYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgbG9naW5PYmouYWNjZXNzdG9rZW5fcmV0cmlldmVkID0gdHJ1ZTtcbiAgICAgICAgc2V0QWNjZXNzVG9rZW4ocHJvdmlkZXJJZCwgYWNjZXNzVG9rZW4pO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShwcm92aWRlcklkICsgYWNjZXNzVG9rZW5TdWZmaXgpO1xuICAgICAgICByZW1vdmVQcm92aWRlckNvbmZpZ0NhbGxCYWNrKHByb3ZpZGVySWQpO1xuICAgICAgICBpZiAob25TdWNjZXNzKSB7XG4gICAgICAgICAgICBvblN1Y2Nlc3MoKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGltZURpZmYubWludXRlcygpID4gMSAmJiBvblN1Y2Nlc3MgJiYgIWxvZ2luT2JqLmFjY2Vzc3Rva2VuX3JldHJpZXZlZCkge1xuICAgICAgICBvblN1Y2Nlc3MoJ2Vycm9yJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjaGVja0FjY2Vzc1Rva2VuSW5XaW5kb3cocHJvdmlkZXJJZCwgb25TdWNjZXNzLCBvbkVycm9yLCBzdGFydFRpbWUsIGxvZ2luT2JqLCByZW1vdmVQcm92aWRlckNvbmZpZ0NhbGxCYWNrKTtcbiAgICAgICAgfSwgMzAwMCk7XG4gICAgfVxufVxuXG4vKipcbiAqIGNoZWNrcyBmb3IgdGhlIHdpbmRvdyBleGlzdGVuY2UgaS5lIGlmIHRoZSB3aW5kb3cgaXMgbWFudWFsbHkgY2xvc2VkIGJ5IHRoZSB1c2VyIG9yIGFueSBzdWNoXG4gKiBAcGFyYW0gb0F1dGhXaW5kb3dcbiAqIEBwYXJhbSBwcm92aWRlclxuICogQHBhcmFtIGNhbGxiYWNrXG4gKi9cbmZ1bmN0aW9uIGNoZWNrRm9yV2luZG93RXhpc3RlbmNlKG9BdXRoV2luZG93LCBwcm92aWRlciwgY2FsbGJhY2spIHtcbiAgICBpZiAob0F1dGhXaW5kb3cgJiYgbGlzdGVuZXJzW3Byb3ZpZGVyXSkge1xuICAgICAgICBpZiAoIW9BdXRoV2luZG93LmNsb3NlZCkgeyAvLyAuY2xvc2VkIGlzIHN1cHBvcnRlZCBhY3Jvc3MgbWFqb3IgYnJvd3NlciB2ZW5kb3JzIGhvd2V2ZXIgZm9yIElFIHRoZSB1c2VyIGhhcyB0byBlbmFibGUgcHJvdGVjdGVkIG1vZGUgZnJvbSBzZWN1cml0eSBvcHRpb25zXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGNoZWNrRm9yV2luZG93RXhpc3RlbmNlLmJpbmQodW5kZWZpbmVkLCBvQXV0aFdpbmRvdywgcHJvdmlkZXIsIGNhbGxiYWNrKSwgMzAwMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RlbmVyc1twcm92aWRlcl0pO1xuICAgICAgICAgICAgZGVsZXRlIGxpc3RlbmVyc1twcm92aWRlcl07XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygnZXJyb3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogdGhpcyBmdW5jdGlvbnMgaGFuZGxlcyB0aGUgbG9naWMgcmVsYXRlZCB0byB0aGUgd2luZG93IG9wZXJhdGlvbnMgaW4gSUVcbiAqIEBwYXJhbSB1cmxcbiAqIEBwYXJhbSBwcm92aWRlcklkXG4gKiBAcGFyYW0gb25TdWNjZXNzXG4gKiBAcGFyYW0gb25FcnJvclxuICovXG5mdW5jdGlvbiBoYW5kbGVMb2dpbkZvcklFKHVybCwgcHJvdmlkZXJJZCwgb25TdWNjZXNzLCBvbkVycm9yLCByZW1vdmVQcm92aWRlckNvbmZpZ0NhbGxCYWNrKSB7XG4gICAgY29uc3QgbG9naW5PYmogPSB7XG4gICAgICAgICdhY2Nlc3N0b2tlbl9yZXRyaWV2ZWQnOiBmYWxzZVxuICAgIH07XG4gICAgd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJywgbmV3V2luZG93UHJvcHMpO1xuICAgIGNoZWNrQWNjZXNzVG9rZW5JbldpbmRvdyhwcm92aWRlcklkLCBvblN1Y2Nlc3MsIG9uRXJyb3IsIG1vbWVudC5kdXJhdGlvbihtb21lbnQoKS5mb3JtYXQoJ0hIOm1tJyksICdISDptbScpLCBsb2dpbk9iaiwgcmVtb3ZlUHJvdmlkZXJDb25maWdDYWxsQmFjayk7XG59XG5cbi8qKlxuICogdGhpcyBmdW5jdGlvbiBhZGRzIHRoZSBsaXN0ZW5lciBvbiB0aGUgd2luZG93IGFuZCBhc3NpZ25zIHRoZSBsaXN0ZW5lclxuICogQHBhcmFtIHByb3ZpZGVyXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gb25BdXRoV2luZG93T3Blbihwcm92aWRlciwgY2FsbGJhY2ssIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2spIHtcbiAgICBsaXN0ZW5lcnNbcHJvdmlkZXJdID0gY2hlY2tBdXRoZW50aWNhdGlvblN0YXR1cy5iaW5kKHVuZGVmaW5lZCwgcHJvdmlkZXIsIGNhbGxiYWNrLCByZW1vdmVQcm92aWRlckNvbmZpZ0NhbGxCYWNrKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RlbmVyc1twcm92aWRlcl0sIGZhbHNlKTtcbn1cblxuLyoqXG4gKiB0aGlzIGZ1bmN0aW9uIGlzIGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hpY2ggZW5hYmxlcyB0aGUgbGlzdGVuZXIgYW5kIGNoZWNrcyBmb3IgdGhlIHdpbmRvdyBleGlzdGVuY2VcbiAqIEBwYXJhbSBwcm92aWRlcklkXG4gKiBAcGFyYW0gb25TdWNjZXNzXG4gKiBAcGFyYW0gdXJsXG4gKi9cbmZ1bmN0aW9uIHBvc3RHZXRBdXRob3JpemF0aW9uVVJMKHVybCwgcHJvdmlkZXJJZCwgb25TdWNjZXNzLCByZW1vdmVQcm92aWRlckNvbmZpZ0NhbGxCYWNrKSB7XG4gICAgbGV0IG9BdXRoV2luZG93O1xuXG4gICAgIGlmIChoYXNDb3Jkb3ZhKCkpIHtcbiAgICAgICAgIHdpbmRvdy5vcGVuKHVybCwgJ19zeXN0ZW0nKTtcbiAgICAgICAgIHdpbmRvd1snT0F1dGhJbk1vYmlsZSddKHByb3ZpZGVySWQpLnRoZW4oYWNjZXNzVG9rZW4gPT4ge1xuICAgICAgICAgICAgIGNvbnN0IGtleSA9IHByb3ZpZGVySWQgKyBhY2Nlc3NUb2tlblN1ZmZpeDtcbiAgICAgICAgICAgICBpZiAoYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCBhY2Nlc3NUb2tlbik7XG4gICAgICAgICAgICAgICAgIGNoZWNrQXV0aGVudGljYXRpb25TdGF0dXMocHJvdmlkZXJJZCwgb25TdWNjZXNzLCByZW1vdmVQcm92aWRlckNvbmZpZ0NhbGxCYWNrLCBudWxsKTtcbiAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICBvblN1Y2Nlc3MoJ2Vycm9yJyk7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgfSk7XG4gICAgIH0gZWxzZSB7XG4gICAgICAgICBvQXV0aFdpbmRvdyA9IHdpbmRvdy5vcGVuKHVybCwgJ19ibGFuaycsIG5ld1dpbmRvd1Byb3BzKTtcbiAgICAgICAgIG9uQXV0aFdpbmRvd09wZW4ocHJvdmlkZXJJZCwgb25TdWNjZXNzLCByZW1vdmVQcm92aWRlckNvbmZpZ0NhbGxCYWNrKTtcbiAgICAgICAgIGNoZWNrRm9yV2luZG93RXhpc3RlbmNlKG9BdXRoV2luZG93LCBwcm92aWRlcklkLCBvblN1Y2Nlc3MpO1xuICAgICB9XG59XG5cbi8qKlxuICogZnVuY3Rpb24gdG8gZ2V0IHRoZSBhdXRob3JpemF0aW9uIHVybFxuICogQHBhcmFtIHBhcmFtcyBwcm92aWRlciBpZCBmb3Igd2hpY2ggdGhlIGF1dGggdXJsIGhhcyB0byBiZSBmZXRjaGVkXG4gKiBAcGFyYW0gc3VjY2Vzc0NhbGxiYWNrIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgdXBvbiBzdWNjZXNzZnVsIGZldGNoIG9mIHRoZSBwcm92aWRlcnNcbiAqIEBwYXJhbSBmYWlsdXJlQ2FsbGJhY2sgY2FsbGJhY2sgdG8gYmUgaW52b2tlZCB1cG9uIGVycm9yXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZnVuY3Rpb24gZ2V0QXV0aG9yaXphdGlvblVybChwYXJhbXMsIGh0dHApIHtcbiAgICBjb25zdCBhY3Rpb24gPSAnZ2V0QXV0aG9yaXphdGlvblVybCcsXG4gICAgICAgIHNlcnZpY2VTZXR0aW5ncyA9IHBhcnNlQ29uZmlnKHtcbiAgICAgICAgICAgIHRhcmdldDogJ29hdXRoQ29uZmlndXJhdGlvbicsXG4gICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcbiAgICAgICAgICAgIHVybFBhcmFtczoge1xuICAgICAgICAgICAgICAgIHByb2plY3RJZDogX1dNX0FQUF9QUk9KRUNULmlkLFxuICAgICAgICAgICAgICAgIHByb3ZpZGVySWQ6IHBhcmFtcy5wcm92aWRlcklkXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgJ3JlcXVlc3RTb3VyY2VUeXBlJzogcGFyYW1zLnJlcXVlc3RTb3VyY2VUeXBlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIHJldHVybiBodHRwLnNlbmQoc2VydmljZVNldHRpbmdzKTtcbn1cblxuLyoqXG4gKiB0aGlzIGZ1bmN0aW9uIHJldHJpZXZlcyB0aGUgYWNjZXNzVG9rZW4gYmFzZWQgb24gdGhlIHJ1bi9zdHVkaW9tb2RlXG4gKiBAcGFyYW0gcHJvdmlkZXJcbiAqIEByZXR1cm5zIHsqfVxuICovXG5leHBvcnQgY29uc3QgZ2V0QWNjZXNzVG9rZW4gPSAocHJvdmlkZXIsIGNoZWNrTG9jYWxTdG9yYWdlKSA9PiB7XG4gICAgY29uc3QgYWNjZXNzVG9rZW5LZXkgPSBnZXRBY2Nlc3NUb2tlblBsYWNlaG9sZGVyKHByb3ZpZGVyKTtcbiAgICBpZiAoY2hlY2tMb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKHByb3ZpZGVyICsgYWNjZXNzVG9rZW5TdWZmaXgpO1xuICAgIH1cbiAgICByZXR1cm4gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShhY2Nlc3NUb2tlbktleSk7XG59O1xuXG5cbi8qKlxuICogdGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHBlcmZvcm0gdGhlIGF1dGhvcml6YXRpb24gYnkgb3BlbmluZyB0aGUgd2luZG93IGFuZCBoYXZpbmcgYWN0aXZlIGxpc3RlbmVyc1xuICogQHBhcmFtIHVybFxuICogQHBhcmFtIHByb3ZpZGVySWRcbiAqIEBwYXJhbSBvblN1Y2Nlc3NcbiAqIEByZXR1cm5zIHsqfVxuICovXG5leHBvcnQgY29uc3QgcGVyZm9ybUF1dGhvcml6YXRpb24gPSAodXJsLCBwcm92aWRlcklkLCBvblN1Y2Nlc3MsIG9uRXJyb3IsIGh0dHAsIGFkZFByb3ZpZGVyQ29uZmlnQ2FsbEJhY2ssIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2spID0+IHtcbiAgICBsZXQgcmVxdWVzdFNvdXJjZVR5cGUgPSAnV0VCJztcbiAgICBpZiAodXJsKSB7XG4gICAgICAgIGlmIChpc0lFKCkpIHsgLy8gaGFuZGxpbmcgZm9yIElFXG4gICAgICAgICAgICBoYW5kbGVMb2dpbkZvcklFKHVybCwgcHJvdmlkZXJJZCwgb25TdWNjZXNzLCBvbkVycm9yLCByZW1vdmVQcm92aWRlckNvbmZpZ0NhbGxCYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvc3RHZXRBdXRob3JpemF0aW9uVVJMKHVybCwgcHJvdmlkZXJJZCwgb25TdWNjZXNzLCByZW1vdmVQcm92aWRlckNvbmZpZ0NhbGxCYWNrKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpc1dhdmVMZW5zKSB7XG4gICAgICAgICAgICByZXF1ZXN0U291cmNlVHlwZSA9ICdXQVZFTEVOUyc7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzQ29yZG92YSgpKSB7XG4gICAgICAgICAgICByZXF1ZXN0U291cmNlVHlwZSA9ICdNT0JJTEUnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnZXRBdXRob3JpemF0aW9uVXJsKHtcbiAgICAgICAgICAgICdwcm92aWRlcklkJzogcHJvdmlkZXJJZCxcbiAgICAgICAgICAgICdyZXF1ZXN0U291cmNlVHlwZSc6IHJlcXVlc3RTb3VyY2VUeXBlXG4gICAgICAgIH0sIGh0dHApLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBhZGRQcm92aWRlckNvbmZpZ0NhbGxCYWNrKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBwcm92aWRlcklkLFxuICAgICAgICAgICAgICAgIHVybDogcmVzcG9uc2UuYm9keSxcbiAgICAgICAgICAgICAgICBpbnZva2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzSUUoKSkgeyAvLyBoYW5kbGluZyBmb3IgSUVcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZUxvZ2luRm9ySUUocmVzcG9uc2UsIHByb3ZpZGVySWQsIG9uU3VjY2Vzcywgb25FcnJvciwgcmVtb3ZlUHJvdmlkZXJDb25maWdDYWxsQmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0R2V0QXV0aG9yaXphdGlvblVSTChyZXNwb25zZS5ib2R5LCBwcm92aWRlcklkLCBvblN1Y2Nlc3MsIHJlbW92ZVByb3ZpZGVyQ29uZmlnQ2FsbEJhY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iXX0=