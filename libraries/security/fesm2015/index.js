import { Injectable, Injector, NgModule } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractHttpService, App, getClonedObject, getWmProjectProperties, hasCordova, triggerFn } from '@wm/core';

// Todo[Shubham]: Move below constants to a common file
const XSRF_COOKIE_NAME = 'wm_xsrf_token';
class SecurityService {
    constructor(injector, $http, routerService, activatedRoute, _location) {
        this.injector = injector;
        this.$http = $http;
        this.routerService = routerService;
        this.activatedRoute = activatedRoute;
        this._location = _location;
        this.requestQueue = {};
    }
    isLoaded() {
        return this.config;
    }
    get() {
        return this.config;
    }
    load() {
        if (this.loadPromise) {
            return this.loadPromise;
        }
        this.loadPromise = new Promise((resolve, reject) => {
            this.$http.send({ 'url': './services/security/info', 'method': 'GET' }).then((response) => {
                this.config = response.body;
                this.lastLoggedInUser = getClonedObject(this.loggedInUser);
                this.loggedInUser = this.config.userInfo;
                resolve(response.body);
            }).catch((err) => {
                reject(err);
            }).finally(() => {
                this.loadPromise = null;
            });
        });
        return this.loadPromise;
    }
    /**
     * gets the security config from the deployed app (backend call)
     * @param success
     * @param error
     */
    getWebConfig(success, error) {
        if (this.get()) {
            // if already fetched, return it
            triggerFn(success, this.get());
            return;
        }
        this.load()
            .then(config => {
            triggerFn(success, config);
        }, error);
    }
    /**
     * Returns security config
     * @param successCallback
     * @param failureCallback
     */
    getConfig(successCallback, failureCallback) {
        function invokeQueuedCallbacks(id, method, data) {
            _.forEach(this.requestQueue[id], fn => triggerFn(fn[method], data));
            this.requestQueue[id] = null;
        }
        function onSuccess(config) {
            config.homePage = getWmProjectProperties().homePage;
            if (config.userInfo) ;
            this.config = config;
            this.lastLoggedInUser = getClonedObject(this.loggedInUser);
            this.loggedInUser = config.userInfo;
            invokeQueuedCallbacks.call(this, 'config', 'success', this.get());
        }
        function onError(error) {
            /*if ($rootScope.isMobileApplicationType) {
             this.config = {
             'securityEnabled': false,
             'authenticated': false,
             'homePage': _WM_APP_PROPERTIES.homePage,
             'userInfo': null,
             'login': null
             };
             invokeQueuedCallbacks('config', 'success', this.get());
             } else {*/
            invokeQueuedCallbacks.call(this, 'config', 'error', error);
            // }
        }
        if (this.get()) {
            // if already fetched, return it
            triggerFn(successCallback, this.get());
            return;
        }
        // Queue check, if same queue is already in progress, do not send another request
        this.requestQueue.config = this.requestQueue.config || [];
        this.requestQueue.config.push({
            success: successCallback,
            error: failureCallback
        });
        if (this.requestQueue.config.length > 1) {
            return;
        }
        if (!hasCordova()) {
            // for web project, return config returned from backend API call.
            this.getWebConfig(onSuccess.bind(this), onError.bind(this));
        }
        /* else {
         /!*
         * for mobile app, first get the mobile config (saved in the apk)
         * - if security not enabled, just return mobile config (no backend call required)
         * - else, get Web config (will be  the same API hit for login) and merge the config with _mobileconfig
         *!/
         getMobileConfig(function (mobileconfig) {
         if (!mobileconfig.securityEnabled) {
         onSuccess(mobileconfig);
         } else {
         getWebConfig(function (config) {
         config = mergeWebAndMobileConfig(config);
         onSuccess(config);
         }, function () {onSuccess(mobileconfig); });
         }
         }, onError);
         }*/
    }
    getLastLoggedInUsername() {
        return this.lastLoggedInUser && this.lastLoggedInUser.userName;
    }
    /**
     * Returns the current page name
     * @returns {string}
     */
    getCurrentRoutePage() {
        const p = this._location.path();
        let lIndex = p.indexOf('?');
        lIndex = lIndex === -1 ? p.length : lIndex - 1;
        return p.substr(1, lIndex); // ignore the query params
    }
    /**
     * Returns Query params for specified param name in current Route
     * @param paramName, the param name whose query param value is to be retrieved
     * @returns {any}
     */
    getCurrentRouteQueryParam(paramName) {
        let paramVal;
        this.activatedRoute.queryParams.subscribe(params => {
            paramVal = params[paramName];
        });
        return paramVal;
    }
    isNoPageLoaded() {
        return !_.isEmpty(this.getCurrentRoutePage());
    }
    getPageByLoggedInUser() {
        const that = this;
        return new Promise((resolve) => {
            let page;
            {
                that.getConfig((config) => {
                    if (config.securityEnabled && config.authenticated) {
                        page = config.userInfo.landingPage || getWmProjectProperties().homePage;
                        // override the default xsrf cookie name and xsrf header names with WaveMaker specific values
                        if (that.isXsrfEnabled()) ;
                    }
                    else {
                        page = getWmProjectProperties().homePage;
                    }
                    resolve(page);
                }, function () {
                    resolve(getWmProjectProperties().homePage);
                });
            }
        });
    }
    /**
     * Loads the App page as follows:
     * Security disabled:
     *      - Home page
     * Security enabled:
     *      - User is logged in, respective landing page is loaded
     *      - Not logged in:
     *          - Home page is public, loads the home page
     *          - Home page not public, Login page(in config) is loaded
     * @param forcePageLoad
     * @returns {Promise<T>}
     */
    loadPageByUserRole(forcePageLoad) {
        const that = this;
        return this.getPageByLoggedInUser().then(page => {
            if (that.isNoPageLoaded() || forcePageLoad) {
                // Reload the page when current page and post login landing page are same
                if (that.getCurrentRoutePage() === page) {
                    window.location.reload();
                }
                else {
                    that.routerService.navigate([`/${page}`]);
                }
            }
        });
    }
    /**
     * Navigates to the current user's homePage based on the config in SecurityService
     * Assumption is the SecurityService is updated with the latest security config before making call to this function
     */
    navigateOnLogin() {
        this.loadPageByUserRole(true);
    }
    /**
     * Gets the page which needs to be redirected to on successful login
     * @param config,
     * @param page, page name for redirection
     * @returns {any|string}
     */
    getRedirectPage(config, page) {
        const homePage = getWmProjectProperties().homePage, loginPage = _.get(config, 'loginConfig.pageName');
        let prevRedirectPage, redirectPage = page || this.getCurrentRoutePage();
        // if user is already on Home page or Login page, they should not be redirected to that page, hence return undefined
        if (redirectPage === homePage || redirectPage === loginPage) {
            /*
             * find previous redirect page from URL, if exists, user should redirect to that page.
             * USE CASE:
             *  user is on http://localhost:8080/app/#/Login?redirectTo=page
             *  a variable call fails resulting 401
             *  in this case, redirectTo page should be 'page' and not undefined
             */
            prevRedirectPage = this.getCurrentRouteQueryParam('redirectTo');
            redirectPage = !_.isEmpty(prevRedirectPage) ? prevRedirectPage : undefined;
        }
        return redirectPage;
    }
    /**
     * Returns all the query params(including page params and redirect to params) associated with redirected page
     */
    getRedirectedRouteQueryParams() {
        let queryParams = {};
        this.activatedRoute.queryParams.subscribe((paramVal) => {
            _.forEach(paramVal, (val, key) => {
                queryParams[key] = val;
            });
        });
        return queryParams;
    }
    // accepts query object like {a:1, b:2} and returns a=1&b=2 string
    getQueryString(queryObject) {
        const params = [];
        _.forEach(queryObject, function (value, key) {
            params.push(key + '=' + value);
        });
        return _.join(params, '&');
    }
    appLogin(params, successCallback, failureCallback) {
        let payload = '';
        // encode all parameters
        _.each(params, function (value, name) {
            payload += (payload ? '&' : '') + encodeURIComponent(name) + '=' + encodeURIComponent(value);
        });
        return this.$http.send({
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            url: 'j_spring_security_check',
            'data': payload
        }).then((response) => {
            const xsrfCookieValue = response.body ? response.body[XSRF_COOKIE_NAME] : '';
            // override the default xsrf cookie name and xsrf header names with WaveMaker specific values
            if (xsrfCookieValue) {
                if (hasCordova()) {
                    localStorage.setItem(XSRF_COOKIE_NAME, xsrfCookieValue || '');
                }
            }
            // After the successful login in device, this function triggers the pending onLoginCallbacks.
            this.injector.get(App).notify('userLoggedIn', {});
            triggerFn(successCallback, response);
        }, failureCallback);
    }
    /**
     * The API is used to check if the user is authenticated in the RUN mode.
     *
     * @param {function} successCallback to be called on success
     * @param {function} failureCallback to be called on failure
     */
    isAuthenticated(successCallback, failureCallback) {
        this.getConfig(function (config) {
            triggerFn(successCallback, config.authenticated);
        }, failureCallback);
    }
    /**
     * The API is used to logout of the app.
     *
     * @param {function} successCallback to be called on success
     * @param {function} failureCallback to be called on failure
     */
    appLogout(successCallback, failureCallback) {
        return this.$http.send({
            target: 'Security',
            url: 'j_spring_security_logout',
            method: 'POST',
            responseType: 'text',
            byPassResult: true
        }).then((response) => {
            _.set(this.get(), 'authenticated', false);
            _.set(this.get(), 'userInfo', null);
            /*if (CONSTANTS.hasCordova) {
                localStorage.setItem(CONSTANTS.XSRF_COOKIE_NAME, '');
            }*/
            this.injector.get(App).notify('userLoggedOut', {});
            triggerFn(successCallback, response);
        }, failureCallback);
    }
    /**
     * Checks and return the cookie
     * @param name, cookie key
     * @returns {string}
     */
    getCookieByName(name) {
        // Todo: Shubham Implement cookie native js
        return 'cookie';
    }
    /**
     * This function returns the cookieValue if xsrf is enabled.
     * In device, xsrf cookie is stored in localStorage.
     * @returns xsrf cookie value
     */
    isXsrfEnabled() {
        if (hasCordova()) {
            return localStorage.getItem(XSRF_COOKIE_NAME);
        }
        return this.getCookieByName(XSRF_COOKIE_NAME);
    }
    /**
     * This function returns a promise. Promise is resolved when security is
     * 1. disabled
     * 2. enabled and user is authenticated
     * 3. enabled and user is not authenticated, then promise is resolved on user login
     * @returns {*} promise
     */
    onUserLogin() {
        return new Promise((resolve, reject) => {
            this.getConfig(config => {
                if (config.securityEnabled) {
                    if (config.authenticated) {
                        resolve();
                    }
                    else {
                        const unsubscribe = this.injector.get(App).subscribe('userLoggedIn', () => {
                            resolve();
                            unsubscribe();
                        });
                    }
                }
                else {
                    resolve();
                }
            }, reject);
        });
    }
    /**
     * @returns a promise that is resolved with logged-in-user
     */
    getLoggedInUser() {
        return new Promise((resolve, reject) => {
            this.getConfig((config) => {
                if (config && config.userInfo) {
                    resolve(config.userInfo);
                }
                else {
                    reject();
                }
            }, reject);
        });
    }
    /**
     * This is for mobile apps to authenticate via browser.
     *
     * @returns a promise that is resolved after login
     */
    authInBrowser() {
        return Promise.reject('This authInBrowser should not be called');
    }
}
SecurityService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
SecurityService.ctorParameters = () => [
    { type: Injector },
    { type: AbstractHttpService },
    { type: Router },
    { type: ActivatedRoute },
    { type: Location }
];

class SecurityModule {
    static forRoot() {
        return {
            ngModule: SecurityModule,
            providers: [SecurityService]
        };
    }
}
SecurityModule.decorators = [
    { type: NgModule, args: [{},] }
];

/**
 * Generated bundle index. Do not edit.
 */

export { SecurityModule, SecurityService };

//# sourceMappingURL=index.js.map