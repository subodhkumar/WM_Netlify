import { Injectable, NgModule } from '@angular/core';
import { Subject } from 'rxjs';
import { _WM_APP_PROJECT, hasCordova, isIE, AbstractHttpService } from '@wm/core';

var accessTokenSuffix = '.access_token';
var parseConfig = function (serviceParams) {
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
var removeAccessToken = function (provider) {
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
var getAccessToken = function (provider, checkLocalStorage) {
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
var performAuthorization = function (url, providerId, onSuccess, onError, http, addProviderConfigCallBack, removeProviderConfigCallBack) {
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
        if (hasCordova()) {
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

var OAuthService = /** @class */ (function () {
    function OAuthService(httpService) {
        this.httpService = httpService;
        this.providers = new Subject();
        this.providersConfig = [];
    }
    OAuthService.prototype.getOAuthProvidersAsObservable = function () {
        return this.providers.asObservable();
    };
    OAuthService.prototype.addProviderConfig = function (provider) {
        if (!(_.find(this.providersConfig, { 'name': provider.name }))) {
            this.providersConfig.push(provider);
        }
        this.providers.next(this.providersConfig);
    };
    OAuthService.prototype.removeProviderConfig = function (providerId) {
        _.remove(this.providersConfig, function (provider) { return provider.name === providerId; });
        this.providers.next(this.providersConfig);
    };
    OAuthService.prototype.perfromOAuthorization = function (url, providerId, onSuccess, onError) {
        performAuthorization(url, providerId, onSuccess, onError, this.httpService, this.addProviderConfig.bind(this), this.removeProviderConfig.bind(this));
    };
    OAuthService.prototype.getAccessToken = function (provider, checkLocalStorage) {
        return getAccessToken(provider, checkLocalStorage);
    };
    OAuthService.prototype.removeAccessToken = function (provider) {
        removeAccessToken(provider);
    };
    OAuthService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    OAuthService.ctorParameters = function () { return [
        { type: AbstractHttpService }
    ]; };
    return OAuthService;
}());

var OAuthModule = /** @class */ (function () {
    function OAuthModule() {
    }
    OAuthModule.forRoot = function () {
        return {
            ngModule: OAuthModule,
            providers: [OAuthService]
        };
    };
    OAuthModule.decorators = [
        { type: NgModule, args: [{},] }
    ];
    return OAuthModule;
}());

/**
 * Generated bundle index. Do not edit.
 */

export { OAuthModule, OAuthService, parseConfig, removeAccessToken, getAccessToken, performAuthorization };

//# sourceMappingURL=index.js.map