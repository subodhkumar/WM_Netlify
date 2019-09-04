import { Injectable, Injector } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractHttpService, App, getClonedObject, getWmProjectProperties, hasCordova, triggerFn } from '@wm/core';
// Todo[Shubham]: Move below constants to a common file
var XSRF_COOKIE_NAME = 'wm_xsrf_token', isApplicationType = true;
var SecurityService = /** @class */ (function () {
    function SecurityService(injector, $http, routerService, activatedRoute, _location) {
        this.injector = injector;
        this.$http = $http;
        this.routerService = routerService;
        this.activatedRoute = activatedRoute;
        this._location = _location;
        this.requestQueue = {};
    }
    SecurityService.prototype.isLoaded = function () {
        return this.config;
    };
    SecurityService.prototype.get = function () {
        return this.config;
    };
    SecurityService.prototype.load = function () {
        var _this = this;
        if (this.loadPromise) {
            return this.loadPromise;
        }
        this.loadPromise = new Promise(function (resolve, reject) {
            _this.$http.send({ 'url': './services/security/info', 'method': 'GET' }).then(function (response) {
                _this.config = response.body;
                _this.lastLoggedInUser = getClonedObject(_this.loggedInUser);
                _this.loggedInUser = _this.config.userInfo;
                resolve(response.body);
            }).catch(function (err) {
                reject(err);
            }).finally(function () {
                _this.loadPromise = null;
            });
        });
        return this.loadPromise;
    };
    /**
     * gets the security config from the deployed app (backend call)
     * @param success
     * @param error
     */
    SecurityService.prototype.getWebConfig = function (success, error) {
        if (this.get()) {
            // if already fetched, return it
            triggerFn(success, this.get());
            return;
        }
        this.load()
            .then(function (config) {
            triggerFn(success, config);
        }, error);
    };
    /**
     * Returns security config
     * @param successCallback
     * @param failureCallback
     */
    SecurityService.prototype.getConfig = function (successCallback, failureCallback) {
        function invokeQueuedCallbacks(id, method, data) {
            _.forEach(this.requestQueue[id], function (fn) { return triggerFn(fn[method], data); });
            this.requestQueue[id] = null;
        }
        function onSuccess(config) {
            config.homePage = getWmProjectProperties().homePage;
            if (config.userInfo) {
                // Backend returns landingPage instead of homePage, hence this statement(for consistency)
                // config.userInfo.homePage = config.userInfo.landingPage;
            }
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
    };
    SecurityService.prototype.getLastLoggedInUsername = function () {
        return this.lastLoggedInUser && this.lastLoggedInUser.userName;
    };
    /**
     * Returns the current page name
     * @returns {string}
     */
    SecurityService.prototype.getCurrentRoutePage = function () {
        var p = this._location.path();
        var lIndex = p.indexOf('?');
        lIndex = lIndex === -1 ? p.length : lIndex - 1;
        return p.substr(1, lIndex); // ignore the query params
    };
    /**
     * Returns Query params for specified param name in current Route
     * @param paramName, the param name whose query param value is to be retrieved
     * @returns {any}
     */
    SecurityService.prototype.getCurrentRouteQueryParam = function (paramName) {
        var paramVal;
        this.activatedRoute.queryParams.subscribe(function (params) {
            paramVal = params[paramName];
        });
        return paramVal;
    };
    SecurityService.prototype.isNoPageLoaded = function () {
        return !_.isEmpty(this.getCurrentRoutePage());
    };
    SecurityService.prototype.getPageByLoggedInUser = function () {
        var that = this;
        return new Promise(function (resolve) {
            var page;
            if (!isApplicationType) {
                if (that.isNoPageLoaded()) {
                    page = getWmProjectProperties().homePage;
                    resolve(page);
                }
            }
            else {
                that.getConfig(function (config) {
                    if (config.securityEnabled && config.authenticated) {
                        page = config.userInfo.landingPage || getWmProjectProperties().homePage;
                        // override the default xsrf cookie name and xsrf header names with WaveMaker specific values
                        if (that.isXsrfEnabled()) {
                            // this.$http.defaults.xsrfCookieName = XSRF_COOKIE;
                            // this.$http.defaults.xsrfHeaderName = config.csrfHeaderName;
                        }
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
    };
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
    SecurityService.prototype.loadPageByUserRole = function (forcePageLoad) {
        var that = this;
        return this.getPageByLoggedInUser().then(function (page) {
            if (that.isNoPageLoaded() || forcePageLoad) {
                // Reload the page when current page and post login landing page are same
                if (that.getCurrentRoutePage() === page) {
                    window.location.reload();
                }
                else {
                    that.routerService.navigate(["/" + page]);
                }
            }
        });
    };
    /**
     * Navigates to the current user's homePage based on the config in SecurityService
     * Assumption is the SecurityService is updated with the latest security config before making call to this function
     */
    SecurityService.prototype.navigateOnLogin = function () {
        this.loadPageByUserRole(true);
    };
    /**
     * Gets the page which needs to be redirected to on successful login
     * @param config,
     * @param page, page name for redirection
     * @returns {any|string}
     */
    SecurityService.prototype.getRedirectPage = function (config, page) {
        var homePage = getWmProjectProperties().homePage, loginPage = _.get(config, 'loginConfig.pageName');
        var prevRedirectPage, redirectPage = page || this.getCurrentRoutePage();
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
    };
    /**
     * Returns all the query params(including page params and redirect to params) associated with redirected page
     */
    SecurityService.prototype.getRedirectedRouteQueryParams = function () {
        var queryParams = {};
        this.activatedRoute.queryParams.subscribe(function (paramVal) {
            _.forEach(paramVal, function (val, key) {
                queryParams[key] = val;
            });
        });
        return queryParams;
    };
    // accepts query object like {a:1, b:2} and returns a=1&b=2 string
    SecurityService.prototype.getQueryString = function (queryObject) {
        var params = [];
        _.forEach(queryObject, function (value, key) {
            params.push(key + '=' + value);
        });
        return _.join(params, '&');
    };
    SecurityService.prototype.appLogin = function (params, successCallback, failureCallback) {
        var _this = this;
        var payload = '';
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
        }).then(function (response) {
            var xsrfCookieValue = response.body ? response.body[XSRF_COOKIE_NAME] : '';
            // override the default xsrf cookie name and xsrf header names with WaveMaker specific values
            if (xsrfCookieValue) {
                if (hasCordova()) {
                    localStorage.setItem(XSRF_COOKIE_NAME, xsrfCookieValue || '');
                }
            }
            // After the successful login in device, this function triggers the pending onLoginCallbacks.
            _this.injector.get(App).notify('userLoggedIn', {});
            triggerFn(successCallback, response);
        }, failureCallback);
    };
    /**
     * The API is used to check if the user is authenticated in the RUN mode.
     *
     * @param {function} successCallback to be called on success
     * @param {function} failureCallback to be called on failure
     */
    SecurityService.prototype.isAuthenticated = function (successCallback, failureCallback) {
        this.getConfig(function (config) {
            triggerFn(successCallback, config.authenticated);
        }, failureCallback);
    };
    /**
     * The API is used to logout of the app.
     *
     * @param {function} successCallback to be called on success
     * @param {function} failureCallback to be called on failure
     */
    SecurityService.prototype.appLogout = function (successCallback, failureCallback) {
        var _this = this;
        return this.$http.send({
            target: 'Security',
            url: 'j_spring_security_logout',
            method: 'POST',
            responseType: 'text',
            byPassResult: true
        }).then(function (response) {
            _.set(_this.get(), 'authenticated', false);
            _.set(_this.get(), 'userInfo', null);
            /*if (CONSTANTS.hasCordova) {
                localStorage.setItem(CONSTANTS.XSRF_COOKIE_NAME, '');
            }*/
            _this.injector.get(App).notify('userLoggedOut', {});
            triggerFn(successCallback, response);
        }, failureCallback);
    };
    /**
     * Checks and return the cookie
     * @param name, cookie key
     * @returns {string}
     */
    SecurityService.prototype.getCookieByName = function (name) {
        // Todo: Shubham Implement cookie native js
        return 'cookie';
    };
    /**
     * This function returns the cookieValue if xsrf is enabled.
     * In device, xsrf cookie is stored in localStorage.
     * @returns xsrf cookie value
     */
    SecurityService.prototype.isXsrfEnabled = function () {
        if (hasCordova()) {
            return localStorage.getItem(XSRF_COOKIE_NAME);
        }
        return this.getCookieByName(XSRF_COOKIE_NAME);
    };
    /**
     * This function returns a promise. Promise is resolved when security is
     * 1. disabled
     * 2. enabled and user is authenticated
     * 3. enabled and user is not authenticated, then promise is resolved on user login
     * @returns {*} promise
     */
    SecurityService.prototype.onUserLogin = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getConfig(function (config) {
                if (config.securityEnabled) {
                    if (config.authenticated) {
                        resolve();
                    }
                    else {
                        var unsubscribe_1 = _this.injector.get(App).subscribe('userLoggedIn', function () {
                            resolve();
                            unsubscribe_1();
                        });
                    }
                }
                else {
                    resolve();
                }
            }, reject);
        });
    };
    /**
     * @returns a promise that is resolved with logged-in-user
     */
    SecurityService.prototype.getLoggedInUser = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getConfig(function (config) {
                if (config && config.userInfo) {
                    resolve(config.userInfo);
                }
                else {
                    reject();
                }
            }, reject);
        });
    };
    /**
     * This is for mobile apps to authenticate via browser.
     *
     * @returns a promise that is resolved after login
     */
    SecurityService.prototype.authInBrowser = function () {
        return Promise.reject('This authInBrowser should not be called');
    };
    SecurityService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    SecurityService.ctorParameters = function () { return [
        { type: Injector },
        { type: AbstractHttpService },
        { type: Router },
        { type: ActivatedRoute },
        { type: Location }
    ]; };
    return SecurityService;
}());
export { SecurityService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHkuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9zZWN1cml0eS8iLCJzb3VyY2VzIjpbInNlY3VyaXR5LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFekQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLEdBQUcsRUFBRSxlQUFlLEVBQUUsc0JBQXNCLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUlwSCx1REFBdUQ7QUFDdkQsSUFBTSxnQkFBZ0IsR0FBRyxlQUFlLEVBQ3BDLGlCQUFpQixHQUFHLElBQUksQ0FBQztBQUU3QjtJQVFJLHlCQUNZLFFBQWtCLEVBQ2xCLEtBQTBCLEVBQzFCLGFBQXFCLEVBQ3JCLGNBQThCLEVBQzlCLFNBQW1CO1FBSm5CLGFBQVEsR0FBUixRQUFRLENBQVU7UUFDbEIsVUFBSyxHQUFMLEtBQUssQ0FBcUI7UUFDMUIsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFDckIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBQzlCLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFQL0IsaUJBQVksR0FBUSxFQUFFLENBQUM7SUFRcEIsQ0FBQztJQUVKLGtDQUFRLEdBQVI7UUFDSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVELDZCQUFHLEdBQUg7UUFDSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVELDhCQUFJLEdBQUo7UUFBQSxpQkFlQztRQWRHLElBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUFDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztTQUFDO1FBQy9DLElB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O2dCQWhhSixVQUFVOzs7O2dCQVpVLFFBQVE7Z0JBSXBCLG1CQUFtQjtnQkFGSCxNQUFNO2dCQUF0QixjQUFjO2dCQURkLFFBQVE7O0lBNGFqQixzQkFBQztDQUFBLEFBamFELElBaWFDO1NBaGFZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTG9jYXRpb24gfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUsIFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IEFic3RyYWN0SHR0cFNlcnZpY2UsIEFwcCwgZ2V0Q2xvbmVkT2JqZWN0LCBnZXRXbVByb2plY3RQcm9wZXJ0aWVzLCBoYXNDb3Jkb3ZhLCB0cmlnZ2VyRm4gfSBmcm9tICdAd20vY29yZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuLy8gVG9kb1tTaHViaGFtXTogTW92ZSBiZWxvdyBjb25zdGFudHMgdG8gYSBjb21tb24gZmlsZVxuY29uc3QgWFNSRl9DT09LSUVfTkFNRSA9ICd3bV94c3JmX3Rva2VuJyxcbiAgICBpc0FwcGxpY2F0aW9uVHlwZSA9IHRydWU7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTZWN1cml0eVNlcnZpY2Uge1xuICAgIGNvbmZpZztcbiAgICBsYXN0TG9nZ2VkSW5Vc2VyO1xuICAgIGxvZ2dlZEluVXNlcjtcbiAgICBsb2FkUHJvbWlzZTogUHJvbWlzZTxhbnk+O1xuICAgIHJlcXVlc3RRdWV1ZTogYW55ID0ge307XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICAgIHByaXZhdGUgJGh0dHA6IEFic3RyYWN0SHR0cFNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgcm91dGVyU2VydmljZTogUm91dGVyLFxuICAgICAgICBwcml2YXRlIGFjdGl2YXRlZFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICAgICAgcHJpdmF0ZSBfbG9jYXRpb246IExvY2F0aW9uXG4gICAgKSB7fVxuXG4gICAgaXNMb2FkZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgICB9XG5cbiAgICBsb2FkKCkge1xuICAgICAgICBpZih0aGlzLmxvYWRQcm9taXNlKSB7cmV0dXJuIHRoaXMubG9hZFByb21pc2U7fVxuICAgICAgICB0aGlzLmxvYWRQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJGh0dHAuc2VuZCh7J3VybCc6ICcuL3NlcnZpY2VzL3NlY3VyaXR5L2luZm8nLCAnbWV0aG9kJzogJ0dFVCd9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHJlc3BvbnNlLmJvZHk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdExvZ2dlZEluVXNlciA9IGdldENsb25lZE9iamVjdCh0aGlzLmxvZ2dlZEluVXNlcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VkSW5Vc2VyID0gdGhpcy5jb25maWcudXNlckluZm87XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UuYm9keSk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycik9PntcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKT0+e1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLmxvYWRQcm9taXNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGdldHMgdGhlIHNlY3VyaXR5IGNvbmZpZyBmcm9tIHRoZSBkZXBsb3llZCBhcHAgKGJhY2tlbmQgY2FsbClcbiAgICAgKiBAcGFyYW0gc3VjY2Vzc1xuICAgICAqIEBwYXJhbSBlcnJvclxuICAgICAqL1xuICAgIGdldFdlYkNvbmZpZyhzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICBpZiAodGhpcy5nZXQoKSkge1xuICAgICAgICAgICAgLy8gaWYgYWxyZWFkeSBmZXRjaGVkLCByZXR1cm4gaXRcbiAgICAgICAgICAgIHRyaWdnZXJGbihzdWNjZXNzLCB0aGlzLmdldCgpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvYWQoKVxuICAgICAgICAgICAgLnRoZW4oY29uZmlnID0+IHtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oc3VjY2VzcywgY29uZmlnKTtcbiAgICAgICAgICAgIH0sIGVycm9yKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHNlY3VyaXR5IGNvbmZpZ1xuICAgICAqIEBwYXJhbSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiBAcGFyYW0gZmFpbHVyZUNhbGxiYWNrXG4gICAgICovXG4gICAgZ2V0Q29uZmlnKHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSB7XG4gICAgICAgIGZ1bmN0aW9uIGludm9rZVF1ZXVlZENhbGxiYWNrcyhpZCwgbWV0aG9kLCBkYXRhKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godGhpcy5yZXF1ZXN0UXVldWVbaWRdLCBmbiA9PiB0cmlnZ2VyRm4oZm5bbWV0aG9kXSwgZGF0YSkpO1xuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0UXVldWVbaWRdID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzcyhjb25maWcpIHtcbiAgICAgICAgICAgIGNvbmZpZy5ob21lUGFnZSA9IGdldFdtUHJvamVjdFByb3BlcnRpZXMoKS5ob21lUGFnZTtcbiAgICAgICAgICAgIGlmIChjb25maWcudXNlckluZm8pIHtcbiAgICAgICAgICAgICAgICAvLyBCYWNrZW5kIHJldHVybnMgbGFuZGluZ1BhZ2UgaW5zdGVhZCBvZiBob21lUGFnZSwgaGVuY2UgdGhpcyBzdGF0ZW1lbnQoZm9yIGNvbnNpc3RlbmN5KVxuICAgICAgICAgICAgICAgIC8vIGNvbmZpZy51c2VySW5mby5ob21lUGFnZSA9IGNvbmZpZy51c2VySW5mby5sYW5kaW5nUGFnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICAgICAgdGhpcy5sYXN0TG9nZ2VkSW5Vc2VyID0gZ2V0Q2xvbmVkT2JqZWN0KHRoaXMubG9nZ2VkSW5Vc2VyKTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VkSW5Vc2VyID0gY29uZmlnLnVzZXJJbmZvO1xuICAgICAgICAgICAgaW52b2tlUXVldWVkQ2FsbGJhY2tzLmNhbGwodGhpcywgJ2NvbmZpZycsICdzdWNjZXNzJywgdGhpcy5nZXQoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvbkVycm9yKGVycm9yKSB7XG4gICAgICAgICAgICAvKmlmICgkcm9vdFNjb3BlLmlzTW9iaWxlQXBwbGljYXRpb25UeXBlKSB7XG4gICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgICAgICAgJ3NlY3VyaXR5RW5hYmxlZCc6IGZhbHNlLFxuICAgICAgICAgICAgICdhdXRoZW50aWNhdGVkJzogZmFsc2UsXG4gICAgICAgICAgICAgJ2hvbWVQYWdlJzogX1dNX0FQUF9QUk9QRVJUSUVTLmhvbWVQYWdlLFxuICAgICAgICAgICAgICd1c2VySW5mbyc6IG51bGwsXG4gICAgICAgICAgICAgJ2xvZ2luJzogbnVsbFxuICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgaW52b2tlUXVldWVkQ2FsbGJhY2tzKCdjb25maWcnLCAnc3VjY2VzcycsIHRoaXMuZ2V0KCkpO1xuICAgICAgICAgICAgIH0gZWxzZSB7Ki9cbiAgICAgICAgICAgIGludm9rZVF1ZXVlZENhbGxiYWNrcy5jYWxsKHRoaXMsICdjb25maWcnLCAnZXJyb3InLCBlcnJvcik7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5nZXQoKSkge1xuICAgICAgICAgICAgLy8gaWYgYWxyZWFkeSBmZXRjaGVkLCByZXR1cm4gaXRcbiAgICAgICAgICAgIHRyaWdnZXJGbihzdWNjZXNzQ2FsbGJhY2ssIHRoaXMuZ2V0KCkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUXVldWUgY2hlY2ssIGlmIHNhbWUgcXVldWUgaXMgYWxyZWFkeSBpbiBwcm9ncmVzcywgZG8gbm90IHNlbmQgYW5vdGhlciByZXF1ZXN0XG4gICAgICAgIHRoaXMucmVxdWVzdFF1ZXVlLmNvbmZpZyA9IHRoaXMucmVxdWVzdFF1ZXVlLmNvbmZpZyB8fCBbXTtcbiAgICAgICAgdGhpcy5yZXF1ZXN0UXVldWUuY29uZmlnLnB1c2goe1xuICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc0NhbGxiYWNrLFxuICAgICAgICAgICAgZXJyb3I6IGZhaWx1cmVDYWxsYmFja1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMucmVxdWVzdFF1ZXVlLmNvbmZpZy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWhhc0NvcmRvdmEoKSkge1xuICAgICAgICAgICAgLy8gZm9yIHdlYiBwcm9qZWN0LCByZXR1cm4gY29uZmlnIHJldHVybmVkIGZyb20gYmFja2VuZCBBUEkgY2FsbC5cbiAgICAgICAgICAgIHRoaXMuZ2V0V2ViQ29uZmlnKG9uU3VjY2Vzcy5iaW5kKHRoaXMpLCBvbkVycm9yLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICAgIC8qIGVsc2Uge1xuICAgICAgICAgLyEqXG4gICAgICAgICAqIGZvciBtb2JpbGUgYXBwLCBmaXJzdCBnZXQgdGhlIG1vYmlsZSBjb25maWcgKHNhdmVkIGluIHRoZSBhcGspXG4gICAgICAgICAqIC0gaWYgc2VjdXJpdHkgbm90IGVuYWJsZWQsIGp1c3QgcmV0dXJuIG1vYmlsZSBjb25maWcgKG5vIGJhY2tlbmQgY2FsbCByZXF1aXJlZClcbiAgICAgICAgICogLSBlbHNlLCBnZXQgV2ViIGNvbmZpZyAod2lsbCBiZSAgdGhlIHNhbWUgQVBJIGhpdCBmb3IgbG9naW4pIGFuZCBtZXJnZSB0aGUgY29uZmlnIHdpdGggX21vYmlsZWNvbmZpZ1xuICAgICAgICAgKiEvXG4gICAgICAgICBnZXRNb2JpbGVDb25maWcoZnVuY3Rpb24gKG1vYmlsZWNvbmZpZykge1xuICAgICAgICAgaWYgKCFtb2JpbGVjb25maWcuc2VjdXJpdHlFbmFibGVkKSB7XG4gICAgICAgICBvblN1Y2Nlc3MobW9iaWxlY29uZmlnKTtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICBnZXRXZWJDb25maWcoZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgY29uZmlnID0gbWVyZ2VXZWJBbmRNb2JpbGVDb25maWcoY29uZmlnKTtcbiAgICAgICAgIG9uU3VjY2Vzcyhjb25maWcpO1xuICAgICAgICAgfSwgZnVuY3Rpb24gKCkge29uU3VjY2Vzcyhtb2JpbGVjb25maWcpOyB9KTtcbiAgICAgICAgIH1cbiAgICAgICAgIH0sIG9uRXJyb3IpO1xuICAgICAgICAgfSovXG4gICAgfVxuXG4gICAgZ2V0TGFzdExvZ2dlZEluVXNlcm5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RMb2dnZWRJblVzZXIgJiYgdGhpcy5sYXN0TG9nZ2VkSW5Vc2VyLnVzZXJOYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgcGFnZSBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRDdXJyZW50Um91dGVQYWdlKCkge1xuICAgICAgICBjb25zdCBwID0gdGhpcy5fbG9jYXRpb24ucGF0aCgpO1xuICAgICAgICBsZXQgbEluZGV4ID0gcC5pbmRleE9mKCc/Jyk7XG4gICAgICAgIGxJbmRleCA9IGxJbmRleCA9PT0gLTEgPyBwLmxlbmd0aCA6IGxJbmRleCAtIDE7XG4gICAgICAgIHJldHVybiBwLnN1YnN0cigxLCBsSW5kZXgpOyAvLyBpZ25vcmUgdGhlIHF1ZXJ5IHBhcmFtc1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgUXVlcnkgcGFyYW1zIGZvciBzcGVjaWZpZWQgcGFyYW0gbmFtZSBpbiBjdXJyZW50IFJvdXRlXG4gICAgICogQHBhcmFtIHBhcmFtTmFtZSwgdGhlIHBhcmFtIG5hbWUgd2hvc2UgcXVlcnkgcGFyYW0gdmFsdWUgaXMgdG8gYmUgcmV0cmlldmVkXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBnZXRDdXJyZW50Um91dGVRdWVyeVBhcmFtKHBhcmFtTmFtZSkge1xuICAgICAgICBsZXQgcGFyYW1WYWw7XG4gICAgICAgIHRoaXMuYWN0aXZhdGVkUm91dGUucXVlcnlQYXJhbXMuc3Vic2NyaWJlKHBhcmFtcyA9PiB7XG4gICAgICAgICAgICBwYXJhbVZhbCA9IHBhcmFtc1twYXJhbU5hbWVdO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBhcmFtVmFsO1xuICAgIH1cblxuICAgIGlzTm9QYWdlTG9hZGVkKCkge1xuICAgICAgICByZXR1cm4gIV8uaXNFbXB0eSh0aGlzLmdldEN1cnJlbnRSb3V0ZVBhZ2UoKSk7XG4gICAgfVxuXG4gICAgZ2V0UGFnZUJ5TG9nZ2VkSW5Vc2VyKCkge1xuICAgICAgICBjb25zdCB0aGF0ID0gdGhpcztcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFnZTtcbiAgICAgICAgICAgIGlmICghaXNBcHBsaWNhdGlvblR5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5pc05vUGFnZUxvYWRlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhZ2UgPSBnZXRXbVByb2plY3RQcm9wZXJ0aWVzKCkuaG9tZVBhZ2U7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocGFnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGF0LmdldENvbmZpZygoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcuc2VjdXJpdHlFbmFibGVkICYmIGNvbmZpZy5hdXRoZW50aWNhdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlID0gY29uZmlnLnVzZXJJbmZvLmxhbmRpbmdQYWdlIHx8IGdldFdtUHJvamVjdFByb3BlcnRpZXMoKS5ob21lUGFnZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG92ZXJyaWRlIHRoZSBkZWZhdWx0IHhzcmYgY29va2llIG5hbWUgYW5kIHhzcmYgaGVhZGVyIG5hbWVzIHdpdGggV2F2ZU1ha2VyIHNwZWNpZmljIHZhbHVlc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaXNYc3JmRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy4kaHR0cC5kZWZhdWx0cy54c3JmQ29va2llTmFtZSA9IFhTUkZfQ09PS0lFO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuJGh0dHAuZGVmYXVsdHMueHNyZkhlYWRlck5hbWUgPSBjb25maWcuY3NyZkhlYWRlck5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlID0gZ2V0V21Qcm9qZWN0UHJvcGVydGllcygpLmhvbWVQYWdlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocGFnZSk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGdldFdtUHJvamVjdFByb3BlcnRpZXMoKS5ob21lUGFnZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWRzIHRoZSBBcHAgcGFnZSBhcyBmb2xsb3dzOlxuICAgICAqIFNlY3VyaXR5IGRpc2FibGVkOlxuICAgICAqICAgICAgLSBIb21lIHBhZ2VcbiAgICAgKiBTZWN1cml0eSBlbmFibGVkOlxuICAgICAqICAgICAgLSBVc2VyIGlzIGxvZ2dlZCBpbiwgcmVzcGVjdGl2ZSBsYW5kaW5nIHBhZ2UgaXMgbG9hZGVkXG4gICAgICogICAgICAtIE5vdCBsb2dnZWQgaW46XG4gICAgICogICAgICAgICAgLSBIb21lIHBhZ2UgaXMgcHVibGljLCBsb2FkcyB0aGUgaG9tZSBwYWdlXG4gICAgICogICAgICAgICAgLSBIb21lIHBhZ2Ugbm90IHB1YmxpYywgTG9naW4gcGFnZShpbiBjb25maWcpIGlzIGxvYWRlZFxuICAgICAqIEBwYXJhbSBmb3JjZVBhZ2VMb2FkXG4gICAgICogQHJldHVybnMge1Byb21pc2U8VD59XG4gICAgICovXG4gICAgbG9hZFBhZ2VCeVVzZXJSb2xlKGZvcmNlUGFnZUxvYWQ/KSB7XG4gICAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRQYWdlQnlMb2dnZWRJblVzZXIoKS50aGVuKHBhZ2UgPT4ge1xuICAgICAgICAgICAgaWYgKHRoYXQuaXNOb1BhZ2VMb2FkZWQoKSB8fCBmb3JjZVBhZ2VMb2FkKSB7XG4gICAgICAgICAgICAgICAgLy8gUmVsb2FkIHRoZSBwYWdlIHdoZW4gY3VycmVudCBwYWdlIGFuZCBwb3N0IGxvZ2luIGxhbmRpbmcgcGFnZSBhcmUgc2FtZVxuICAgICAgICAgICAgICAgIGlmICh0aGF0LmdldEN1cnJlbnRSb3V0ZVBhZ2UoKSA9PT0gcGFnZSkge1xuICAgICAgICAgICAgICAgICAgICAod2luZG93LmxvY2F0aW9uIGFzIGFueSkucmVsb2FkKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5yb3V0ZXJTZXJ2aWNlLm5hdmlnYXRlKFtgLyR7cGFnZX1gXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBOYXZpZ2F0ZXMgdG8gdGhlIGN1cnJlbnQgdXNlcidzIGhvbWVQYWdlIGJhc2VkIG9uIHRoZSBjb25maWcgaW4gU2VjdXJpdHlTZXJ2aWNlXG4gICAgICogQXNzdW1wdGlvbiBpcyB0aGUgU2VjdXJpdHlTZXJ2aWNlIGlzIHVwZGF0ZWQgd2l0aCB0aGUgbGF0ZXN0IHNlY3VyaXR5IGNvbmZpZyBiZWZvcmUgbWFraW5nIGNhbGwgdG8gdGhpcyBmdW5jdGlvblxuICAgICAqL1xuICAgIG5hdmlnYXRlT25Mb2dpbigpIHtcbiAgICAgICAgdGhpcy5sb2FkUGFnZUJ5VXNlclJvbGUodHJ1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgcGFnZSB3aGljaCBuZWVkcyB0byBiZSByZWRpcmVjdGVkIHRvIG9uIHN1Y2Nlc3NmdWwgbG9naW5cbiAgICAgKiBAcGFyYW0gY29uZmlnLFxuICAgICAqIEBwYXJhbSBwYWdlLCBwYWdlIG5hbWUgZm9yIHJlZGlyZWN0aW9uXG4gICAgICogQHJldHVybnMge2FueXxzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0UmVkaXJlY3RQYWdlKGNvbmZpZywgcGFnZT8pIHtcbiAgICAgICAgY29uc3QgaG9tZVBhZ2UgPSBnZXRXbVByb2plY3RQcm9wZXJ0aWVzKCkuaG9tZVBhZ2UsXG4gICAgICAgICAgICBsb2dpblBhZ2UgPSBfLmdldChjb25maWcsICdsb2dpbkNvbmZpZy5wYWdlTmFtZScpO1xuICAgICAgICBsZXQgcHJldlJlZGlyZWN0UGFnZSxcbiAgICAgICAgICAgIHJlZGlyZWN0UGFnZSA9IHBhZ2UgfHwgdGhpcy5nZXRDdXJyZW50Um91dGVQYWdlKCk7XG5cbiAgICAgICAgLy8gaWYgdXNlciBpcyBhbHJlYWR5IG9uIEhvbWUgcGFnZSBvciBMb2dpbiBwYWdlLCB0aGV5IHNob3VsZCBub3QgYmUgcmVkaXJlY3RlZCB0byB0aGF0IHBhZ2UsIGhlbmNlIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgaWYgKHJlZGlyZWN0UGFnZSA9PT0gaG9tZVBhZ2UgfHwgcmVkaXJlY3RQYWdlID09PSBsb2dpblBhZ2UpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiBmaW5kIHByZXZpb3VzIHJlZGlyZWN0IHBhZ2UgZnJvbSBVUkwsIGlmIGV4aXN0cywgdXNlciBzaG91bGQgcmVkaXJlY3QgdG8gdGhhdCBwYWdlLlxuICAgICAgICAgICAgICogVVNFIENBU0U6XG4gICAgICAgICAgICAgKiAgdXNlciBpcyBvbiBodHRwOi8vbG9jYWxob3N0OjgwODAvYXBwLyMvTG9naW4/cmVkaXJlY3RUbz1wYWdlXG4gICAgICAgICAgICAgKiAgYSB2YXJpYWJsZSBjYWxsIGZhaWxzIHJlc3VsdGluZyA0MDFcbiAgICAgICAgICAgICAqICBpbiB0aGlzIGNhc2UsIHJlZGlyZWN0VG8gcGFnZSBzaG91bGQgYmUgJ3BhZ2UnIGFuZCBub3QgdW5kZWZpbmVkXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHByZXZSZWRpcmVjdFBhZ2UgPSB0aGlzLmdldEN1cnJlbnRSb3V0ZVF1ZXJ5UGFyYW0oJ3JlZGlyZWN0VG8nKTtcbiAgICAgICAgICAgIHJlZGlyZWN0UGFnZSA9ICFfLmlzRW1wdHkocHJldlJlZGlyZWN0UGFnZSkgPyBwcmV2UmVkaXJlY3RQYWdlIDogdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlZGlyZWN0UGFnZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCB0aGUgcXVlcnkgcGFyYW1zKGluY2x1ZGluZyBwYWdlIHBhcmFtcyBhbmQgcmVkaXJlY3QgdG8gcGFyYW1zKSBhc3NvY2lhdGVkIHdpdGggcmVkaXJlY3RlZCBwYWdlXG4gICAgICovXG4gICAgZ2V0UmVkaXJlY3RlZFJvdXRlUXVlcnlQYXJhbXMoKSB7XG4gICAgICAgIGxldCBxdWVyeVBhcmFtcyA9IHt9O1xuICAgICAgICB0aGlzLmFjdGl2YXRlZFJvdXRlLnF1ZXJ5UGFyYW1zLnN1YnNjcmliZSgocGFyYW1WYWwpID0+IHtcbiAgICAgICAgICAgIF8uZm9yRWFjaChwYXJhbVZhbCwgKHZhbCwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgcXVlcnlQYXJhbXNba2V5XSA9IHZhbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHF1ZXJ5UGFyYW1zO1xuICAgIH1cblxuICAgIC8vIGFjY2VwdHMgcXVlcnkgb2JqZWN0IGxpa2Uge2E6MSwgYjoyfSBhbmQgcmV0dXJucyBhPTEmYj0yIHN0cmluZ1xuICAgIGdldFF1ZXJ5U3RyaW5nKHF1ZXJ5T2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IFtdO1xuICAgICAgICBfLmZvckVhY2gocXVlcnlPYmplY3QsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICBwYXJhbXMucHVzaChrZXkgKyAnPScgKyB2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gXy5qb2luKHBhcmFtcywgJyYnKTtcbiAgICB9XG5cbiAgICBhcHBMb2dpbihwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSB7XG4gICAgICAgIGxldCBwYXlsb2FkID0gJyc7XG5cbiAgICAgICAgLy8gZW5jb2RlIGFsbCBwYXJhbWV0ZXJzXG4gICAgICAgIF8uZWFjaChwYXJhbXMsIGZ1bmN0aW9uICh2YWx1ZSwgbmFtZSkge1xuICAgICAgICAgICAgcGF5bG9hZCArPSAocGF5bG9hZCA/ICcmJyA6ICcnKSArIGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLiRodHRwLnNlbmQoe1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXJsOiAnal9zcHJpbmdfc2VjdXJpdHlfY2hlY2snLFxuICAgICAgICAgICAgJ2RhdGEnOiBwYXlsb2FkXG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB4c3JmQ29va2llVmFsdWUgPSByZXNwb25zZS5ib2R5ID8gcmVzcG9uc2UuYm9keVtYU1JGX0NPT0tJRV9OQU1FXSA6ICcnO1xuXG4gICAgICAgICAgICAvLyBvdmVycmlkZSB0aGUgZGVmYXVsdCB4c3JmIGNvb2tpZSBuYW1lIGFuZCB4c3JmIGhlYWRlciBuYW1lcyB3aXRoIFdhdmVNYWtlciBzcGVjaWZpYyB2YWx1ZXNcbiAgICAgICAgICAgIGlmICh4c3JmQ29va2llVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFzQ29yZG92YSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFhTUkZfQ09PS0lFX05BTUUsIHhzcmZDb29raWVWYWx1ZSB8fCAnJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQWZ0ZXIgdGhlIHN1Y2Nlc3NmdWwgbG9naW4gaW4gZGV2aWNlLCB0aGlzIGZ1bmN0aW9uIHRyaWdnZXJzIHRoZSBwZW5kaW5nIG9uTG9naW5DYWxsYmFja3MuXG4gICAgICAgICAgICB0aGlzLmluamVjdG9yLmdldChBcHApLm5vdGlmeSgndXNlckxvZ2dlZEluJywge30pO1xuICAgICAgICAgICAgdHJpZ2dlckZuKHN1Y2Nlc3NDYWxsYmFjaywgcmVzcG9uc2UpO1xuICAgICAgICB9LCBmYWlsdXJlQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBBUEkgaXMgdXNlZCB0byBjaGVjayBpZiB0aGUgdXNlciBpcyBhdXRoZW50aWNhdGVkIGluIHRoZSBSVU4gbW9kZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1Y2Nlc3NDYWxsYmFjayB0byBiZSBjYWxsZWQgb24gc3VjY2Vzc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZhaWx1cmVDYWxsYmFjayB0byBiZSBjYWxsZWQgb24gZmFpbHVyZVxuICAgICAqL1xuICAgIGlzQXV0aGVudGljYXRlZChzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xuICAgICAgICB0aGlzLmdldENvbmZpZyhmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICB0cmlnZ2VyRm4oc3VjY2Vzc0NhbGxiYWNrLCBjb25maWcuYXV0aGVudGljYXRlZCk7XG4gICAgICAgIH0sIGZhaWx1cmVDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIEFQSSBpcyB1c2VkIHRvIGxvZ291dCBvZiB0aGUgYXBwLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gc3VjY2Vzc0NhbGxiYWNrIHRvIGJlIGNhbGxlZCBvbiBzdWNjZXNzXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZmFpbHVyZUNhbGxiYWNrIHRvIGJlIGNhbGxlZCBvbiBmYWlsdXJlXG4gICAgICovXG4gICAgYXBwTG9nb3V0KHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRodHRwLnNlbmQoe1xuICAgICAgICAgICAgdGFyZ2V0OiAnU2VjdXJpdHknLFxuICAgICAgICAgICAgdXJsOiAnal9zcHJpbmdfc2VjdXJpdHlfbG9nb3V0JyxcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgcmVzcG9uc2VUeXBlOiAndGV4dCcsXG4gICAgICAgICAgICBieVBhc3NSZXN1bHQ6IHRydWVcbiAgICAgICAgfSkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIF8uc2V0KHRoaXMuZ2V0KCksICdhdXRoZW50aWNhdGVkJywgZmFsc2UpO1xuICAgICAgICAgICAgXy5zZXQodGhpcy5nZXQoKSwgJ3VzZXJJbmZvJywgbnVsbCk7XG4gICAgICAgICAgICAvKmlmIChDT05TVEFOVFMuaGFzQ29yZG92YSkge1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKENPTlNUQU5UUy5YU1JGX0NPT0tJRV9OQU1FLCAnJyk7XG4gICAgICAgICAgICB9Ki9cbiAgICAgICAgICAgIHRoaXMuaW5qZWN0b3IuZ2V0KEFwcCkubm90aWZ5KCd1c2VyTG9nZ2VkT3V0Jywge30pO1xuICAgICAgICAgICAgdHJpZ2dlckZuKHN1Y2Nlc3NDYWxsYmFjaywgcmVzcG9uc2UpO1xuICAgICAgICB9LCBmYWlsdXJlQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBhbmQgcmV0dXJuIHRoZSBjb29raWVcbiAgICAgKiBAcGFyYW0gbmFtZSwgY29va2llIGtleVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0Q29va2llQnlOYW1lKG5hbWUpIHtcbiAgICAgICAgLy8gVG9kbzogU2h1YmhhbSBJbXBsZW1lbnQgY29va2llIG5hdGl2ZSBqc1xuICAgICAgICByZXR1cm4gJ2Nvb2tpZSc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBjb29raWVWYWx1ZSBpZiB4c3JmIGlzIGVuYWJsZWQuXG4gICAgICogSW4gZGV2aWNlLCB4c3JmIGNvb2tpZSBpcyBzdG9yZWQgaW4gbG9jYWxTdG9yYWdlLlxuICAgICAqIEByZXR1cm5zIHhzcmYgY29va2llIHZhbHVlXG4gICAgICovXG4gICAgaXNYc3JmRW5hYmxlZCgpIHtcbiAgICAgICAgaWYgKGhhc0NvcmRvdmEoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFhTUkZfQ09PS0lFX05BTUUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldENvb2tpZUJ5TmFtZShYU1JGX0NPT0tJRV9OQU1FKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSBwcm9taXNlLiBQcm9taXNlIGlzIHJlc29sdmVkIHdoZW4gc2VjdXJpdHkgaXNcbiAgICAgKiAxLiBkaXNhYmxlZFxuICAgICAqIDIuIGVuYWJsZWQgYW5kIHVzZXIgaXMgYXV0aGVudGljYXRlZFxuICAgICAqIDMuIGVuYWJsZWQgYW5kIHVzZXIgaXMgbm90IGF1dGhlbnRpY2F0ZWQsIHRoZW4gcHJvbWlzZSBpcyByZXNvbHZlZCBvbiB1c2VyIGxvZ2luXG4gICAgICogQHJldHVybnMgeyp9IHByb21pc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgb25Vc2VyTG9naW4oKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29uZmlnKGNvbmZpZyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5zZWN1cml0eUVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5hdXRoZW50aWNhdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1bnN1YnNjcmliZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KEFwcCkuc3Vic2NyaWJlKCd1c2VyTG9nZ2VkSW4nLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIGxvZ2dlZC1pbi11c2VyXG4gICAgICovXG4gICAgZ2V0TG9nZ2VkSW5Vc2VyKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldENvbmZpZygoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcudXNlckluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjb25maWcudXNlckluZm8pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgZm9yIG1vYmlsZSBhcHBzIHRvIGF1dGhlbnRpY2F0ZSB2aWEgYnJvd3Nlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIGFmdGVyIGxvZ2luXG4gICAgICovXG4gICAgYXV0aEluQnJvd3NlcigpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ1RoaXMgYXV0aEluQnJvd3NlciBzaG91bGQgbm90IGJlIGNhbGxlZCcpO1xuICAgIH1cbn1cbiJdfQ==