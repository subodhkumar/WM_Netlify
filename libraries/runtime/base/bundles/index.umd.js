(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/forms'), require('@wm/mobile/runtime'), require('ngx-toastr'), require('@angular/common/http'), require('@wm/security'), require('@angular/router'), require('ngx-bootstrap'), require('@wm/oAuth'), require('@angular/common'), require('rxjs/operators'), require('rxjs'), require('@wm/variables'), require('@wm/http'), require('@wm/components'), require('@wm/transpiler'), require('@wm/build-task'), require('@angular/core'), require('@wm/core')) :
    typeof define === 'function' && define.amd ? define('@wm/runtime/base', ['exports', '@angular/forms', '@wm/mobile/runtime', 'ngx-toastr', '@angular/common/http', '@wm/security', '@angular/router', 'ngx-bootstrap', '@wm/oAuth', '@angular/common', 'rxjs/operators', 'rxjs', '@wm/variables', '@wm/http', '@wm/components', '@wm/transpiler', '@wm/build-task', '@angular/core', '@wm/core'], factory) :
    (factory((global.wm = global.wm || {}, global.wm.runtime = global.wm.runtime || {}, global.wm.runtime.base = {}),global.ng.forms,global.wm.mobile.runtime,global.ngxToastr,global.ng.common.http,global.wm.security,global.ng.router,global.ngxBootstrap,global.wm.oAuth,global.ng.common,global.rxjs.operators,global.rxjs,global.wm.variables,global.wm.http,global.wm.components,global.wm.transpiler,global.wm.buildTask,global.ng.core,global.wm.core));
}(this, (function (exports,forms,runtime,ngxToastr,http,security,router,ngxBootstrap,oAuth,common,operators,rxjs,variables,http$1,components,transpiler,buildTask,i0,core) { 'use strict';

    (function (ComponentType) {
        ComponentType[ComponentType["PAGE"] = 0] = "PAGE";
        ComponentType[ComponentType["PREFAB"] = 1] = "PREFAB";
        ComponentType[ComponentType["PARTIAL"] = 2] = "PARTIAL";
    })(exports.ComponentType || (exports.ComponentType = {}));
    var ComponentRefProvider = /** @class */ (function () {
        function ComponentRefProvider() {
        }
        ComponentRefProvider.prototype.clearComponentFactoryRefCache = function () { };
        return ComponentRefProvider;
    }());
    var PrefabConfigProvider = /** @class */ (function () {
        function PrefabConfigProvider() {
        }
        return PrefabConfigProvider;
    }());
    var AppJSProvider = /** @class */ (function () {
        function AppJSProvider() {
        }
        return AppJSProvider;
    }());
    var AppVariablesProvider = /** @class */ (function () {
        function AppVariablesProvider() {
        }
        return AppVariablesProvider;
    }());
    var PartialRefProvider = /** @class */ (function () {
        function PartialRefProvider() {
        }
        return PartialRefProvider;
    }());

    var POST_MESSAGES;
    (function (POST_MESSAGES) {
        POST_MESSAGES["HIDE_TEMPLATES_SHOW_CASE"] = "hide-templates-show-case";
        POST_MESSAGES["SHOW_TEMPLATES_SHOW_CASE"] = "show-templates-show-case";
        POST_MESSAGES["UPDATE_LOCATION"] = "update-location-path";
        POST_MESSAGES["SELECT_TEMPLATE"] = "select-template";
        POST_MESSAGES["TEMPLATEBUNDLE_CONFIG"] = "template-bundle-config";
        POST_MESSAGES["ON_LOAD"] = "on-load";
    })(POST_MESSAGES || (POST_MESSAGES = {}));
    var AppManagerService = /** @class */ (function () {
        function AppManagerService($http, $security, $dialog, $router, $app, $variables, $metadata, $spinner, $i18n, $datePipe) {
            var _this = this;
            this.$http = $http;
            this.$security = $security;
            this.$dialog = $dialog;
            this.$router = $router;
            this.$app = $app;
            this.$variables = $variables;
            this.$metadata = $metadata;
            this.$spinner = $spinner;
            this.$i18n = $i18n;
            this.$datePipe = $datePipe;
            this.appVariablesLoaded = false;
            this.appVariablesFired = false;
            this._noRedirect = false;
            // register method to invoke on session timeout
            this.$http.registerOnSessionTimeout(this.handle401.bind(this));
            this.$variables.registerDependency('appManager', this);
            this.$app.subscribe('toggle-variable-state', function (data) {
                var variable = data.variable, active = data.active;
                if (!_.isEmpty(_.trim(variable.spinnerContext))) {
                    if (active) {
                        variable._spinnerId = variable._spinnerId || [];
                        var spinnerId = _this.$spinner.show(variable.spinnerMessage, variable._id + '_' + Date.now(), variable.spinnerclass, variable.spinnerContext);
                        variable._spinnerId.push(spinnerId);
                    }
                    else {
                        _this.$spinner.hide(variable._spinnerId.shift());
                    }
                }
            });
            this.$app.subscribe('userLoggedIn', function () { return _this.setLandingPage(); });
            this.$app.subscribe('userLoggedOut', function () {
                return _this.setLandingPage().then(function () {
                    // navigate to the landing page without reloading the window in device.
                    if (window['cordova']) {
                        _this.$router.navigate(["/"]);
                    }
                });
            });
            this.$app.subscribe('http401', function (d) {
                if (d === void 0) {
                    d = {};
                }
                return _this.handle401(d.page, d.options);
            });
        }
        /**
         * On session timeout, if the session timeout config is set to a dialog, then open login dialog
         */
        AppManagerService.prototype.showLoginDialog = function () {
            this.$spinner.hide('globalSpinner');
            // Removing the close all dialogs call, so the existing dialogs remain open and
            // the login dialog comes on top of it.
            this.$dialog.open('CommonLoginDialog');
            // Since the login dialog is closed and opened its updated property isn't read by angular.
            // Hence we trigger the digest cycle
            core.$appDigest();
        };
        AppManagerService.prototype.loadAppJS = function () {
        };
        AppManagerService.prototype.loadCommonPage = function () {
        };
        AppManagerService.prototype.loadSecurityConfig = function () {
            var _this = this;
            return this.$security.load().then(function (r) {
                if (!_this.$app.landingPageName) {
                    _this.setLandingPage();
                }
                return r;
            });
        };
        AppManagerService.prototype.loadMetadata = function () {
            return this.$metadata.load();
        };
        AppManagerService.prototype.loadAppVariables = function (variables$$1) {
            var _this = this;
            if (this.appVariablesLoaded) {
                return Promise.resolve();
            }
            var init = function (response) {
                var data = _this.$variables.register('app', response, _this.$app);
                // not assigning directly to this.$app to keep the reference in tact
                _.extend(_this.$app.Variables, data.Variables);
                _.extend(_this.$app.Actions, data.Actions);
                _this.updateLoggedInUserVariable();
                _this.updateSupportedLocaleVariable();
                _this.appVariablesLoaded = true;
                _this.appVariablesFired = false;
            };
            if (core.isDefined(variables$$1)) {
                init(variables$$1);
                return Promise.resolve();
            }
            return this.$http.get('./app.variables.json').then(function (response) { return init(response); });
        };
        /**
         * getter and setter for the property appVariablesFired
         * this flag determines if the app variables(with startUpdate:true) have been fired
         * they should get fired only once through app lifecycle
         * @param {boolean} isFired
         * @returns {boolean}
         */
        AppManagerService.prototype.isAppVariablesFired = function (isFired) {
            if (core.isDefined(isFired)) {
                this.appVariablesFired = isFired;
            }
            return this.appVariablesFired;
        };
        AppManagerService.prototype.clearLoggedInUserVariable = function (variable) {
            variable.isAuthenticated = false;
            variable.roles = [];
            variable.name = undefined;
            variable.id = undefined;
            variable.tenantId = undefined;
        };
        AppManagerService.prototype.updateLoggedInUserVariable = function () {
            var _this = this;
            var loggedInUser = _.get(this.$app, 'Variables.loggedInUser.dataSet');
            // sanity check
            if (!loggedInUser) {
                return;
            }
            this.$security.load().then(function () {
                var securityConfig = _this.$security.get();
                if (securityConfig && securityConfig.securityEnabled && securityConfig.authenticated) {
                    loggedInUser.isAuthenticated = securityConfig.authenticated;
                    loggedInUser.roles = securityConfig.userInfo.userRoles;
                    loggedInUser.name = securityConfig.userInfo.userName;
                    loggedInUser.id = securityConfig.userInfo.userId;
                    loggedInUser.tenantId = securityConfig.userInfo.tenantId;
                }
                else {
                    _this.clearLoggedInUserVariable(loggedInUser);
                    loggedInUser.isSecurityEnabled = securityConfig && securityConfig.securityEnabled;
                    throw null;
                }
            }).catch(function (err) {
                loggedInUser.isAuthenticated = false;
                loggedInUser.roles = [];
                loggedInUser.name = undefined;
                loggedInUser.id = undefined;
                loggedInUser.tenantId = undefined;
            });
        };
        /**
         * Overriding the app variable supported locale with the wmProperties i18n DataValues
         *
         * TODO[Vibhu]:
         * Can write a simple migration to sync the supportedLocale variable with '_WM_APP_PROPERTIES.supportedLanguages'
         * Hence, this may not be required
         *
         */
        AppManagerService.prototype.updateSupportedLocaleVariable = function () {
            var supportedLocaleVar = _.get(this.$app, 'Variables.supportedLocale');
        };
        AppManagerService.prototype.handleSSOLogin = function (config) {
            var _this = this;
            var SSO_URL = 'services/security/ssologin', PREVIEW_WINDOW_NAME = 'WM_PREVIEW_WINDOW';
            var page, pageParams;
            // do not provide redirectTo page if fetching HOME page resulted 401
            // on app load, by default Home page is loaded
            page = this.$security.getRedirectPage(config);
            if (variables.CONSTANTS.hasCordova) {
                // get previously loggedInUser name (if any)
                var lastLoggedInUsername_1 = _.get(this.$security.get(), 'userInfo.userName');
                this.$security.authInBrowser()
                    .then(function () { return _this.reloadAppData(); })
                    .then(function () {
                    var presentLoggedInUsername = _.get(_this.$security.get(), 'userInfo.userName');
                    if (presentLoggedInUsername && presentLoggedInUsername === lastLoggedInUsername_1) {
                        variables.routerService.navigate([page]);
                    }
                    else {
                        variables.routerService.navigate(["/"]);
                    }
                });
            }
            else {
                page = page ? '?redirectPage=' + encodeURIComponent(page) : '';
                pageParams = this.$security.getQueryString(this.$security.getRedirectedRouteQueryParams());
                pageParams = pageParams ? '?' + pageParams : '';
                // showing a redirecting message
                document.body.textContent = _.get(this.getAppLocale(), ['MESSAGE_LOGIN_REDIRECTION']) || 'Redirecting to sso login...';
                // appending redirect to page and page params
                var ssoUrl = this.getDeployedURL() + SSO_URL + page + pageParams;
                /*
                 * remove iFrame when redirected to IdP login page.
                 * this is being done as IDPs do not allow to get themselves loaded into iFrames.
                 * remove-toolbar has been assigned with a window name WM_PREVIEW_WINDOW, check if the iframe is our toolbar related and
                 * safely change the location of the parent toolbar with current url.
                 */
                if (window.self !== window.top && window.parent.name === PREVIEW_WINDOW_NAME) {
                    window.parent.location.href = window.self.location.href;
                    window.parent.name = '';
                }
                else {
                    window.location.href = ssoUrl;
                }
            }
        };
        /**
         * Handles the app when a XHR request returns 401 response
         * If no user was logged in before 401 occurred, First time Login is simulated
         * Else, a session timeout has occurred and the same is simulated
         * @param page  if provided, represents the page name for which XHR request returned 401, on re-login
         *              if not provided, a service request returned 401
         * @param onSuccess success handler
         * @param onError error handler
         */
        AppManagerService.prototype.handle401 = function (page, options) {
            var sessionTimeoutConfig, sessionTimeoutMethod, loginConfig, loginMethod;
            var LOGIN_METHOD = {
                'DIALOG': 'DIALOG',
                'PAGE': 'PAGE',
                'SSO': 'SSO'
            };
            var config = this.$security.get();
            var queryParamsObj = {};
            loginConfig = config.loginConfig;
            // if user found, 401 was thrown after session time
            if (config.userInfo && config.userInfo.userName) {
                config.authenticated = false;
                sessionTimeoutConfig = loginConfig.sessionTimeout || { 'type': LOGIN_METHOD.DIALOG };
                sessionTimeoutMethod = sessionTimeoutConfig.type.toUpperCase();
                switch (sessionTimeoutMethod) {
                    case LOGIN_METHOD.DIALOG:
                        this.showLoginDialog();
                        break;
                    case LOGIN_METHOD.PAGE:
                        if (!page) {
                            page = this.$security.getCurrentRoutePage();
                        }
                        queryParamsObj['redirectTo'] = page;
                        // Adding query params(page params of page being redirected to) to the URL.
                        queryParamsObj = _.merge(queryParamsObj, this.$security.getRedirectedRouteQueryParams());
                        // the redirect page should not be same as session timeout login page
                        if (page !== sessionTimeoutConfig.pageName) {
                            this.$router.navigate([sessionTimeoutConfig.pageName], { queryParams: queryParamsObj });
                        }
                        break;
                    case LOGIN_METHOD.SSO:
                        this.handleSSOLogin(config);
                        break;
                }
                this.setLandingPage();
            }
            else {
                // if no user found, 401 was thrown for first time login
                loginMethod = loginConfig.type.toUpperCase();
                switch (loginMethod) {
                    case LOGIN_METHOD.DIALOG:
                        // Through loginDialog, user will remain in the current state and failed calls will be executed post login through LoginVariableService.
                        // NOTE: user will be redirected to respective landing page only if dialog is opened manually(not through a failed 401 call).
                        this.noRedirect(true);
                        this.showLoginDialog();
                        break;
                    case LOGIN_METHOD.PAGE:
                        // do not provide redirectTo page if fetching HOME page resulted 401
                        // on app load, by default Home page is loaded
                        page = this.$security.getRedirectPage(config);
                        queryParamsObj['redirectTo'] = page;
                        queryParamsObj = _.merge(queryParamsObj, this.$security.getRedirectedRouteQueryParams());
                        this.$router.navigate([loginConfig.pageName], { queryParams: queryParamsObj });
                        this.$app.landingPageName = loginConfig.pageName;
                        break;
                    case LOGIN_METHOD.SSO:
                        this.handleSSOLogin(config);
                        break;
                }
            }
        };
        /**
         * Updates data dependent on logged in user
         * Reloads security config, metadata
         * Updates the loggedInUserVariable
         * @returns {Promise<void>}
         */
        AppManagerService.prototype.reloadAppData = function () {
            var _this = this;
            return this.loadSecurityConfig().then(function () {
                return _this.loadMetadata().then(function () {
                    _this.updateLoggedInUserVariable();
                });
            });
        };
        AppManagerService.prototype.noRedirect = function (value) {
            if (_.isUndefined(value)) {
                return this._noRedirect;
            }
            this._noRedirect = value;
            return this._noRedirect;
        };
        /**
         * invokes session failure requests
         */
        AppManagerService.prototype.executeSessionFailureRequests = function () {
            this.$http.executeSessionFailureRequests();
        };
        AppManagerService.prototype.pushToSessionFailureRequests = function (callback) {
            this.$http.pushToSessionFailureQueue(callback);
        };
        AppManagerService.prototype.getDeployedURL = function () {
            return this.$app.deployedUrl ? this.$app.deployedUrl : variables.$rootScope.project.deployedUrl;
        };
        AppManagerService.prototype.notify = function (eventName, data) {
            this.$app.notify(eventName, data);
        };
        AppManagerService.prototype.subscribe = function (eventName, data) {
            return this.$app.subscribe(eventName, data);
        };
        AppManagerService.prototype.getActivePage = function () {
            return this.$app.activePage;
        };
        AppManagerService.prototype.getAppLocale = function () {
            return this.$app.appLocale;
        };
        AppManagerService.prototype.getSelectedLocale = function () {
            return this.$i18n.getSelectedLocale();
        };
        AppManagerService.prototype.notifyApp = function (template, type, title) {
            this.$app.notifyApp(template, type, title);
        };
        /**
         * Triggers the onBeforeService method defined in app.js of the app
         * @param requestParams
         */
        AppManagerService.prototype.appOnBeforeServiceCall = function (requestParams) {
            return core.triggerFn(this.$app.onBeforeServiceCall, requestParams);
        };
        /**
         * Triggers the onServiceSuccess method defined in app.js of the app
         * @param data
         * @param xhrObj
         */
        AppManagerService.prototype.appOnServiceSuccess = function (data, xhrObj) {
            return core.triggerFn(this.$app.onServiceSuccess, data, xhrObj);
        };
        /**
         * Triggers the onServiceError method defined in app.js of the app
         * @param data
         * @param xhrOb
         */
        AppManagerService.prototype.appOnServiceError = function (data, xhrOb) {
            return core.triggerFn(this.$app.onServiceError, data, xhrOb);
        };
        /**
         * Triggers the appVariablesReady method defined in app.js of the app
         */
        AppManagerService.prototype.appVariablesReady = function () {
            core.triggerFn(this.$app.onAppVariablesReady);
        };
        /**
         * Returns the pipe based on the input
         */
        AppManagerService.prototype.getPipe = function (pipe) {
            if (pipe === 'date') {
                return this.$datePipe;
            }
        };
        AppManagerService.prototype.setLandingPage = function () {
            var _this = this;
            return this.$security.getPageByLoggedInUser().then(function (p) { return _this.$app.landingPageName = p; });
        };
        /**
         * return true if prefab type app
         * @returns {boolean}
         */
        AppManagerService.prototype.isPrefabType = function () {
            return this.$app.isPrefabType;
        };
        /**
         * return true if template bundle type app
         * @returns {boolean}
         */
        AppManagerService.prototype.isTemplateBundleType = function () {
            return this.$app.isTemplateBundleType;
        };
        AppManagerService.prototype.postMessage = function (content) {
            window.top.postMessage(content, '*');
        };
        AppManagerService.prototype.showTemplate = function (idx) {
            var template = this.templates[idx];
            // scope.activeTemplateIndex = idx;
            this.$router.navigate([template.id]);
        };
        AppManagerService.prototype.postTemplateBundleInfo = function () {
            var _this = this;
            window.onmessage = function (evt) {
                var msgData = evt.data;
                if (!_.isObject(msgData)) {
                    return;
                }
                var key = msgData.key;
                switch (key) {
                    case POST_MESSAGES.HIDE_TEMPLATES_SHOW_CASE:
                        // scope.hideShowCase = true;
                        break;
                    case POST_MESSAGES.SELECT_TEMPLATE:
                        _this.showTemplate(msgData.templateIndex);
                        break;
                }
            };
            setTimeout(function () {
                _this.postMessage({ key: POST_MESSAGES.ON_LOAD });
            });
            return core.fetchContent('json', './config.json', true, function (response) {
                _this.templates = [];
                if (!response.error) {
                    _this.templates = response.templates;
                    _this.postMessage({ 'key': POST_MESSAGES.TEMPLATEBUNDLE_CONFIG, 'config': response });
                }
            });
        };
        AppManagerService.prototype.postAppTypeInfo = function () {
            if (this.isTemplateBundleType()) {
                return this.postTemplateBundleInfo();
            }
        };
        AppManagerService.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        AppManagerService.ctorParameters = function () {
            return [
                { type: core.AbstractHttpService },
                { type: security.SecurityService },
                { type: core.AbstractDialogService },
                { type: router.Router },
                { type: core.App },
                { type: variables.VariablesService },
                { type: variables.MetadataService },
                { type: core.AbstractSpinnerService },
                { type: core.AbstractI18nService },
                { type: common.DatePipe }
            ];
        };
        return AppManagerService;
    }());

    var isPrefabInPreview = function (prefabName) { return prefabName === '__self__'; };
    var getPrefabBaseUrl = function (prefabName) { return isPrefabInPreview(prefabName) ? '.' : "app/prefabs/" + prefabName; };
    var getPrefabConfigUrl = function (prefabName) { return getPrefabBaseUrl(prefabName) + "/config.json"; };
    var getPrefabMinJsonUrl = function (prefabName) { return getPrefabBaseUrl(prefabName) + "/pages/Main/page.min.json"; };

    var prefabsWithError = new Set();
    var inProgress = new Map();
    var resolvedPrefabs = new Set();
    var getPrefabResourceUrl = function (resourcePath, resourceBasePath) {
        var _url = resourcePath;
        if (!core.stringStartsWith(resourcePath, 'http://|https://|//')) {
            _url = (resourceBasePath + _url).replace('//', '/');
        }
        return _url;
    };
    var ɵ0 = getPrefabResourceUrl;
    var PrefabManagerService = /** @class */ (function () {
        function PrefabManagerService($metadata, prefabConfigProvider) {
            this.$metadata = $metadata;
            this.prefabConfigProvider = prefabConfigProvider;
        }
        PrefabManagerService.prototype.getConfig = function (prefabName) {
            return this.prefabConfigProvider.getConfig(prefabName);
        };
        PrefabManagerService.prototype.loadServiceDefs = function (prefabName) {
            return isPrefabInPreview(prefabName) ? Promise.resolve() : this.$metadata.load(prefabName);
        };
        PrefabManagerService.prototype.loadStyles = function (prefabName, _a) {
            var styles = (_a === void 0 ? { resources: { styles: [] } } : _a).resources.styles;
            var baseUrl = getPrefabBaseUrl(prefabName);
            var _styles = styles.map(function (url) {
                if (!_.endsWith(url, '/pages/Main/Main.css')) {
                    return getPrefabResourceUrl(url, baseUrl);
                }
                return undefined;
            }).filter(function (url) { return !!url; });
            core.loadStyleSheets(_styles);
            return Promise.resolve();
        };
        // TODO [Vinay] - implement onPrefabResourceLoad
        PrefabManagerService.prototype.loadScripts = function (prefabName, _a) {
            var scripts = (_a === void 0 ? { resources: { scripts: [] } } : _a).resources.scripts;
            var baseUrl = getPrefabBaseUrl(prefabName);
            var _scripts = scripts.map(function (url) { return getPrefabResourceUrl(url, baseUrl); });
            return core.loadScripts(_scripts);
        };
        PrefabManagerService.prototype.setInProgress = function (prefabName) {
            var _res;
            var _rej;
            var _promise = new Promise(function (res, rej) {
                _res = res;
                _rej = rej;
            });
            _promise.resolve = _res;
            _promise.reject = _rej;
            inProgress.set(prefabName, _promise);
        };
        PrefabManagerService.prototype.resolveInProgress = function (prefabName) {
            if (inProgress.get(prefabName)) {
                inProgress.get(prefabName).resolve();
                inProgress.delete(prefabName);
            }
        };
        PrefabManagerService.prototype.loadDependencies = function (prefabName) {
            var _this = this;
            if (resolvedPrefabs.has(prefabName)) {
                return Promise.resolve();
            }
            if (prefabsWithError.has(prefabName)) {
                return Promise.reject('');
            }
            if (inProgress.get(prefabName)) {
                return inProgress.get(prefabName);
            }
            this.setInProgress(prefabName);
            return this.getConfig(prefabName)
                .then(function (config) {
                return Promise.all([
                    _this.loadStyles(prefabName, config),
                    _this.loadScripts(prefabName, config),
                    _this.loadServiceDefs(prefabName)
                ]).then(function () {
                    _this.resolveInProgress(prefabName);
                    resolvedPrefabs.add(prefabName);
                });
            });
        };
        PrefabManagerService.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        PrefabManagerService.ctorParameters = function () {
            return [
                { type: variables.MetadataService },
                { type: PrefabConfigProvider }
            ];
        };
        return PrefabManagerService;
    }());

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p]; };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
                if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
        }
        return t;
    };
    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [0, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m)
            return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length)
                    o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    var FragmentMonitor = /** @class */ (function () {
        function FragmentMonitor() {
            this.fragments = 0;
            this.fragmentsLoaded$ = new rxjs.Subject();
        }
        FragmentMonitor.prototype.init = function () {
            // console.log(`inside fragmentMonitor: Page-${(this as any).pageName}, Partial-${(this as any).partialName}`);
            var _this = this;
            this.viewInit$.subscribe(core.noop, core.noop, function () {
                _this.isViewInitialized = true;
                _this.isReady();
            });
        };
        FragmentMonitor.prototype.registerFragment = function () {
            this.fragments++;
        };
        FragmentMonitor.prototype.resolveFragment = function () {
            this.fragments--;
            this.isReady();
        };
        FragmentMonitor.prototype.isReady = function () {
            if (this.isViewInitialized && !this.fragments) {
                this.registerFragment = core.noop;
                this.resolveFragment = core.noop;
                this.fragmentsLoaded$.complete();
            }
        };
        return FragmentMonitor;
    }());

    var commonPartialWidgets = {};
    var BasePartialComponent = /** @class */ (function (_super) {
        __extends(BasePartialComponent, _super);
        function BasePartialComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.destroy$ = new rxjs.Subject();
            _this.viewInit$ = new rxjs.Subject();
            return _this;
        }
        BasePartialComponent.prototype.getContainerWidgetInjector = function () {
            return this.containerWidget.inj || this.containerWidget.injector;
        };
        BasePartialComponent.prototype.init = function () {
            var _this = this;
            this.App = this.injector.get(core.App);
            this.containerWidget = this.injector.get(components.WidgetRef);
            this.i18nService = this.injector.get(core.AbstractI18nService);
            if (this.getContainerWidgetInjector().view.component.registerFragment) {
                this.getContainerWidgetInjector().view.component.registerFragment();
            }
            this.initUserScript();
            this.registerWidgets();
            this.initVariables();
            this.activePageName = this.App.activePageName; // Todo: remove this
            this.registerPageParams();
            this.defineI18nProps();
            this.viewInit$.subscribe(core.noop, core.noop, function () {
                _this.pageParams = _this.containerWidget.partialParams;
            });
            _super.prototype.init.call(this);
        };
        BasePartialComponent.prototype.registerWidgets = function () {
            if (this.partialName === 'Common') {
                this.Widgets = commonPartialWidgets;
            }
            else {
                this.Widgets = Object.create(commonPartialWidgets);
            }
            this.containerWidget.Widgets = this.Widgets;
        };
        BasePartialComponent.prototype.registerDestroyListener = function (fn) {
            this.destroy$.subscribe(core.noop, core.noop, function () { return fn(); });
        };
        BasePartialComponent.prototype.initUserScript = function () {
            try {
                this.evalUserScript(this, this.App, this.injector.get(core.UtilsService));
            }
            catch (e) {
                console.error("Error in evaluating partial (" + this.partialName + ") script\n", e);
            }
        };
        BasePartialComponent.prototype.initVariables = function () {
            var _this = this;
            var variablesService = this.injector.get(variables.VariablesService);
            // get variables and actions instances for the page
            var variableCollection = variablesService.register(this.partialName, this.getVariables(), this);
            // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
            this.Variables = Object.create(this.App.Variables);
            this.Actions = Object.create(this.App.Actions);
            this.containerWidget.Variables = this.Variables;
            this.containerWidget.Actions = this.Actions;
            // assign all the page variables to the pageInstance
            Object.entries(variableCollection.Variables).forEach(function (_a) {
                var _b = __read(_a, 2), name = _b[0], variable = _b[1];
                return _this.Variables[name] = variable;
            });
            Object.entries(variableCollection.Actions).forEach(function (_a) {
                var _b = __read(_a, 2), name = _b[0], action = _b[1];
                return _this.Actions[name] = action;
            });
            this.viewInit$.subscribe(core.noop, core.noop, function () {
                // TEMP: triggering watchers so variables watching over params are updated
                core.$invokeWatchers(true, true);
                variableCollection.callback(variableCollection.Variables).catch(core.noop);
                variableCollection.callback(variableCollection.Actions);
            });
        };
        BasePartialComponent.prototype.registerPageParams = function () {
            this.pageParams = this.containerWidget.partialParams;
        };
        BasePartialComponent.prototype.defineI18nProps = function () {
            this.appLocale = this.i18nService.getAppLocale();
        };
        BasePartialComponent.prototype.invokeOnReady = function () {
            this.onReady();
            if (this.getContainerWidgetInjector().view.component.resolveFragment) {
                this.getContainerWidgetInjector().view.component.resolveFragment();
            }
        };
        BasePartialComponent.prototype.ngAfterViewInit = function () {
            var _this = this;
            setTimeout(function () {
                _this.viewInit$.complete();
                _this.fragmentsLoaded$.subscribe(core.noop, core.noop, function () { return _this.invokeOnReady(); });
            }, 100);
        };
        BasePartialComponent.prototype.ngOnDestroy = function () {
            this.destroy$.complete();
        };
        BasePartialComponent.prototype.onReady = function () {
        };
        return BasePartialComponent;
    }(FragmentMonitor));

    var BasePageComponent = /** @class */ (function (_super) {
        __extends(BasePageComponent, _super);
        function BasePageComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.startupVariablesLoaded = false;
            _this.pageTransitionCompleted = false;
            _this.destroy$ = new rxjs.Subject();
            _this.viewInit$ = new rxjs.Subject();
            return _this;
        }
        BasePageComponent.prototype.init = function () {
            core.muteWatchers();
            this.App = this.injector.get(core.App);
            this.route = this.injector.get(router.ActivatedRoute);
            this.appManager = this.injector.get(AppManagerService);
            this.navigationService = this.injector.get(core.AbstractNavigationService);
            this.i18nService = this.injector.get(core.AbstractI18nService);
            this.router = this.injector.get(router.Router);
            this.initUserScript();
            this.registerWidgets();
            this.initVariables();
            this.App.lastActivePageName = this.App.activePageName;
            this.App.activePageName = this.pageName;
            this.App.activePage = this;
            this.activePageName = this.pageName; // Todo: remove this
            this.registerPageParams();
            this.defineI18nProps();
            _super.prototype.init.call(this);
        };
        BasePageComponent.prototype.registerWidgets = function () {
            // common partial widgets should be accessible from page
            this.Widgets = Object.create(commonPartialWidgets);
            // expose current page widgets on app
            this.App.Widgets = Object.create(this.Widgets);
        };
        BasePageComponent.prototype.initUserScript = function () {
            try {
                this.evalUserScript(this, this.App, this.injector.get(core.UtilsService));
            }
            catch (e) {
                console.error("Error in evaluating page (" + this.pageName + ") script\n", e);
            }
        };
        BasePageComponent.prototype.registerPageParams = function () {
            var _this = this;
            var subscription = this.route.queryParams.subscribe(function (params) { return _this.pageParams = params; });
            this.registerDestroyListener(function () { return subscription.unsubscribe(); });
        };
        BasePageComponent.prototype.registerDestroyListener = function (fn) {
            this.destroy$.subscribe(core.noop, core.noop, function () { return fn(); });
        };
        BasePageComponent.prototype.defineI18nProps = function () {
            this.appLocale = this.i18nService.getAppLocale();
        };
        BasePageComponent.prototype.initVariables = function () {
            var _this = this;
            var variablesService = this.injector.get(variables.VariablesService);
            // get variables and actions instances for the page
            var variableCollection = variablesService.register(this.pageName, this.getVariables(), this);
            // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
            this.Variables = Object.create(this.App.Variables);
            this.Actions = Object.create(this.App.Actions);
            // assign all the page variables to the pageInstance
            Object.entries(variableCollection.Variables).forEach(function (_a) {
                var _b = __read(_a, 2), name = _b[0], variable = _b[1];
                return _this.Variables[name] = variable;
            });
            Object.entries(variableCollection.Actions).forEach(function (_a) {
                var _b = __read(_a, 2), name = _b[0], action = _b[1];
                return _this.Actions[name] = action;
            });
            var subscription = this.viewInit$.subscribe(core.noop, core.noop, function () {
                if (!_this.appManager.isAppVariablesFired()) {
                    variableCollection.callback(_this.App.Variables).catch(core.noop).then(function () {
                        _this.appManager.notify('app-variables-data-loaded', { pageName: _this.pageName });
                    });
                    variableCollection.callback(_this.App.Actions);
                    _this.appManager.appVariablesReady();
                    _this.appManager.isAppVariablesFired(true);
                }
                variableCollection.callback(variableCollection.Variables)
                    .catch(core.noop)
                    .then(function () {
                    _this.appManager.notify('page-variables-data-loaded', { pageName: _this.pageName });
                    _this.startupVariablesLoaded = true;
                    // hide the loader only after the some setTimeout for smooth page load.
                    setTimeout(function () {
                        _this.showPageContent = true;
                    }, 100);
                });
                variableCollection.callback(variableCollection.Actions);
                subscription.unsubscribe();
            });
        };
        BasePageComponent.prototype.runPageTransition = function (transition) {
            return new Promise(function (resolve) {
                var $target = $('app-page-outlet:first');
                if (transition) {
                    var onTransitionEnd_1 = function () {
                        if (resolve) {
                            $target.off('animationend', onTransitionEnd_1);
                            $target.removeClass(transition);
                            $target.children().first().remove();
                            resolve();
                            resolve = null;
                        }
                    };
                    transition = 'page-transition page-transition-' + transition;
                    $target.addClass(transition);
                    $target.on('animationend', onTransitionEnd_1);
                    // Wait for a maximum of 1 second for transition to end.
                    setTimeout(onTransitionEnd_1, 1000);
                }
                else {
                    resolve();
                }
            });
        };
        BasePageComponent.prototype.invokeOnReady = function () {
            this.onReady();
            (this.App.onPageReady || core.noop)(this.pageName, this);
            this.appManager.notify('pageReady', { 'name': this.pageName, instance: this });
        };
        BasePageComponent.prototype.ngAfterViewInit = function () {
            var _this = this;
            var transition = this.navigationService.getPageTransition();
            if (transition) {
                var pageOutlet = $('app-page-outlet:first');
                pageOutlet.prepend(pageOutlet.children().first().clone());
            }
            this.runPageTransition(transition).then(function () {
                _this.pageTransitionCompleted = true;
                _this.compilePageContent = true;
            });
            setTimeout(function () {
                core.unMuteWatchers();
                _this.viewInit$.complete();
                if (core.isMobileApp()) {
                    _this.onPageContentReady = function () {
                        _this.fragmentsLoaded$.subscribe(core.noop, core.noop, function () {
                            _this.invokeOnReady();
                        });
                        _this.onPageContentReady = core.noop;
                    };
                }
                else {
                    _this.fragmentsLoaded$.subscribe(core.noop, core.noop, function () { return _this.invokeOnReady(); });
                }
            }, 300);
        };
        BasePageComponent.prototype.ngOnDestroy = function () {
            this.destroy$.complete();
        };
        BasePageComponent.prototype.onReady = function () { };
        BasePageComponent.prototype.onBeforePageLeave = function () { };
        BasePageComponent.prototype.onPageContentReady = function () { };
        return BasePageComponent;
    }(FragmentMonitor));

    var BasePrefabComponent = /** @class */ (function (_super) {
        __extends(BasePrefabComponent, _super);
        function BasePrefabComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.destroy$ = new rxjs.Subject();
            _this.viewInit$ = new rxjs.Subject();
            return _this;
        }
        BasePrefabComponent.prototype.getContainerWidgetInjector = function () {
            return this.containerWidget.inj || this.containerWidget.injector;
        };
        BasePrefabComponent.prototype.init = function () {
            this.App = this.injector.get(core.App);
            this.containerWidget = this.injector.get(components.WidgetRef);
            this.prefabMngr = this.injector.get(PrefabManagerService);
            this.i18nService = this.injector.get(core.AbstractI18nService);
            if (this.getContainerWidgetInjector().view.component.registerFragment) {
                this.getContainerWidgetInjector().view.component.registerFragment();
            }
            this.initUserScript();
            this.registerWidgets();
            this.initVariables();
            this.registerProps();
            this.defineI18nProps();
            _super.prototype.init.call(this);
        };
        BasePrefabComponent.prototype.registerWidgets = function () {
            this.Widgets = {};
        };
        BasePrefabComponent.prototype.initUserScript = function () {
            try {
                this.evalUserScript(this, this.App, this.injector.get(core.UtilsService));
            }
            catch (e) {
                console.error("Error in evaluating prefab (" + this.prefabName + ") script\n", e);
            }
        };
        BasePrefabComponent.prototype.registerChangeListeners = function () {
            this.containerWidget.registerPropertyChangeListener(this.onPropertyChange);
            this.containerWidget.registerStyleChangeListener(this.onPropertyChange);
        };
        BasePrefabComponent.prototype.registerDestroyListener = function (fn) {
            this.destroy$.subscribe(core.noop, core.noop, function () { return fn(); });
        };
        BasePrefabComponent.prototype.defineI18nProps = function () {
            this.appLocale = this.i18nService.getPrefabLocaleBundle(this.prefabName);
        };
        BasePrefabComponent.prototype.registerProps = function () {
            var _this = this;
            this.prefabMngr.getConfig(this.prefabName)
                .then(function (config) {
                if (config) {
                    _this.displayName = config.displayName;
                    Object.entries((config.properties || {}))
                        .forEach(function (_a) {
                        var _b = __read(_a, 2), key = _b[0], prop = _b[1];
                        var expr;
                        var value = _.trim(prop.value);
                        if (_.startsWith(value, 'bind:')) {
                            expr = value.replace('bind:', '');
                        }
                        Object.defineProperty(_this, key, {
                            get: function () { return _this.containerWidget[key]; },
                            set: function (nv) { return _this.containerWidget.widget[key] = nv; }
                        });
                        if (expr) {
                            _this.registerDestroyListener(core.$watch(expr, _this, {}, function (nv) { return _this.containerWidget.widget[key] = nv; }));
                        }
                    });
                    Object.entries((config.events || {}))
                        .forEach(function (_a) {
                        var _b = __read(_a, 2), key = _b[0], prop = _b[1];
                        _this[key] = function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            var eventName = key.substr(2).toLowerCase();
                            _this.containerWidget.invokeEventCallback(eventName, { $event: args[0], $data: args[1] });
                        };
                    });
                    Object.entries((config.methods || {}))
                        .forEach(function (_a) {
                        var _b = __read(_a, 2), key = _b[0], prop = _b[1];
                        _this.containerWidget[key] = function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            try {
                                if (_this[key]) {
                                    return _this[key].apply(_this, args);
                                }
                            }
                            catch (e) {
                                console.warn("error in executing prefab-" + _this.prefabName + " method-" + key);
                            }
                        };
                    });
                }
                _this.containerWidget.setProps(config);
                // Reassigning the proxy handler for prefab inbound properties as we
                // will get them only after the prefab config call.
                if (core.isIE()) {
                    _this.containerWidget.widget = _this.containerWidget.createProxy();
                }
            });
        };
        BasePrefabComponent.prototype.initVariables = function () {
            var _this = this;
            var variablesService = this.injector.get(variables.VariablesService);
            // get variables and actions instances for the page
            var variableCollection = variablesService.register(this.prefabName, this.getVariables(), this);
            // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
            this.Variables = {};
            this.Actions = {};
            // assign all the page variables to the pageInstance
            Object.entries(variableCollection.Variables).forEach(function (_a) {
                var _b = __read(_a, 2), name = _b[0], variable = _b[1];
                return _this.Variables[name] = variable;
            });
            Object.entries(variableCollection.Actions).forEach(function (_a) {
                var _b = __read(_a, 2), name = _b[0], action = _b[1];
                return _this.Actions[name] = action;
            });
            this.viewInit$.subscribe(core.noop, core.noop, function () {
                variableCollection.callback(variableCollection.Variables).catch(core.noop);
                variableCollection.callback(variableCollection.Actions);
            });
        };
        BasePrefabComponent.prototype.invokeOnReady = function () {
            // triggering watchers so variables and propertiers watching over an expression are updated
            core.$invokeWatchers(true, true);
            this.onReady();
            if (this.getContainerWidgetInjector().view.component.resolveFragment) {
                this.getContainerWidgetInjector().view.component.resolveFragment();
            }
            this.containerWidget.invokeEventCallback('load');
        };
        BasePrefabComponent.prototype.ngAfterViewInit = function () {
            var _this = this;
            this.viewInit$.complete();
            this.registerChangeListeners();
            setTimeout(function () {
                _this.fragmentsLoaded$.subscribe(core.noop, core.noop, function () { return _this.invokeOnReady(); });
            }, 100);
        };
        BasePrefabComponent.prototype.ngOnDestroy = function () {
            this.containerWidget.invokeEventCallback('destroy');
            this.destroy$.complete();
        };
        // user overrides this
        BasePrefabComponent.prototype.onPropertyChange = function () { };
        BasePrefabComponent.prototype.onReady = function () { };
        return BasePrefabComponent;
    }(FragmentMonitor));

    var USER_ROLE;
    (function (USER_ROLE) {
        USER_ROLE["EVERYONE"] = "Everyone";
        USER_ROLE["ANONYMOUS"] = "Anonymous";
        USER_ROLE["AUTHENTICATED"] = "Authenticated";
    })(USER_ROLE || (USER_ROLE = {}));
    var AccessrolesDirective = /** @class */ (function () {
        function AccessrolesDirective(templateRef, viewContainerRef, securityService) {
            this.templateRef = templateRef;
            this.viewContainerRef = viewContainerRef;
            this.securityService = securityService;
            this.processed = false;
            var securityConfig = this.securityService.get();
            this.securityEnabled = _.get(securityConfig, 'securityEnabled');
            this.isUserAuthenticated = _.get(securityConfig, 'authenticated');
            this.userRoles = _.get(securityConfig, 'userInfo.userRoles');
        }
        /**
         * Returns array of roles from comma separated string of roles
         * Handles encoded commas
         * @param val
         * @returns {any}
         */
        AccessrolesDirective.prototype.getWidgetRolesArrayFromStr = function (val) {
            var UNICODE_COMMA_REGEX = /&#44;/g;
            val = val || '';
            if (val === '') {
                return [];
            }
            // replace the unicode equivalent of comma with comma
            return _.split(val, ',').map(function (v) {
                return _.trim(v).replace(UNICODE_COMMA_REGEX, ',');
            });
        };
        /**
         * Returns true if roles in first arrays is
         * @param widgetRoles
         * @param userRoles
         * @returns {any}
         */
        AccessrolesDirective.prototype.matchRoles = function (widgetRoles, userRoles) {
            return widgetRoles.some(function (item) {
                return _.includes(userRoles, item);
            });
        };
        /**
         * Decides whether the current logged in user has access to widget or not
         * @param widgetRoles
         * @param userRoles
         * @returns {any}
         */
        AccessrolesDirective.prototype.hasAccessToWidget = function (widgetRoles, userRoles) {
            // access the widget when 'Everyone' is chosen
            if (_.includes(widgetRoles, USER_ROLE.EVERYONE)) {
                return true;
            }
            // access the widget when 'Anonymous' is chosen and user is not authenticated
            if (_.includes(widgetRoles, USER_ROLE.ANONYMOUS) && !this.isUserAuthenticated) {
                return true;
            }
            // access the widget when 'Only Authenticated Users' is chosen and user is authenticated
            if (_.includes(widgetRoles, USER_ROLE.AUTHENTICATED) && this.isUserAuthenticated) {
                return true;
            }
            // access the widget when widget role and logged in user role matches
            return this.isUserAuthenticated && this.matchRoles(widgetRoles, userRoles);
        };
        Object.defineProperty(AccessrolesDirective.prototype, "accessroles", {
            set: function (roles) {
                // flag to compute the directive only once
                if (this.processed) {
                    return;
                }
                this.processed = true;
                var widgetRoles = this.getWidgetRolesArrayFromStr(roles);
                var isAccessible = !this.securityEnabled || this.hasAccessToWidget(widgetRoles, this.userRoles);
                if (isAccessible) {
                    this.viewContainerRef.createEmbeddedView(this.templateRef);
                }
                else {
                    this.viewContainerRef.clear();
                }
            },
            enumerable: true,
            configurable: true
        });
        AccessrolesDirective.decorators = [
            { type: i0.Directive, args: [{
                        selector: '[accessroles]'
                    },] }
        ];
        /** @nocollapse */
        AccessrolesDirective.ctorParameters = function () {
            return [
                { type: i0.TemplateRef },
                { type: i0.ViewContainerRef },
                { type: security.SecurityService }
            ];
        };
        AccessrolesDirective.propDecorators = {
            accessroles: [{ type: i0.Input }]
        };
        return AccessrolesDirective;
    }());

    var PartialContainerDirective = /** @class */ (function () {
        function PartialContainerDirective(componentInstance, vcRef, elRef, inj, app, _content, resolver, componentRefProvider, partialRefProvider) {
            var _this = this;
            this.componentInstance = componentInstance;
            this.vcRef = vcRef;
            this.elRef = elRef;
            this.inj = inj;
            this.app = app;
            this.resolver = resolver;
            this.componentRefProvider = componentRefProvider;
            this.partialRefProvider = partialRefProvider;
            this.contentInitialized = false;
            this.renderPartial = _.debounce(this._renderPartial, 200, { leading: true });
            componentInstance.registerPropertyChangeListener(function (key, nv, ov) {
                if (key === 'content') {
                    if (componentInstance.$lazyLoad) {
                        componentInstance.$lazyLoad = function () {
                            _this.renderPartial(nv);
                            componentInstance.$lazyLoad = core.noop;
                        };
                    }
                    else {
                        _this.renderPartial(nv);
                    }
                }
            });
            var subscription = componentInstance.params$
                .pipe(operators.filter(function () { return _this.contentInitialized; }), operators.debounceTime(200))
                .subscribe(function () { return _this.renderPartial(componentInstance.content); });
            // reload the partial content on partial param change
            componentInstance.registerDestroyListener(function () { return subscription.unsubscribe(); });
        }
        Object.defineProperty(PartialContainerDirective.prototype, "name", {
            get: function () {
                return this.componentInstance.name;
            },
            enumerable: true,
            configurable: true
        });
        PartialContainerDirective.prototype._renderPartial = function (nv) {
            return __awaiter(this, void 0, void 0, function () {
                var componentFactory, instanceRef;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // destroy the existing partial
                            this.vcRef.clear();
                            // when the container-target is inside the component template, it can be queried after viewInit of the component.
                            core.$invokeWatchers(true);
                            return [4 /*yield*/, this.partialRefProvider.getComponentFactoryRef(nv, exports.ComponentType.PARTIAL)];
                        case 1:
                            componentFactory = _a.sent();
                            if (componentFactory) {
                                instanceRef = this.vcRef.createComponent(componentFactory, 0, this.inj);
                                if (!this.$target) {
                                    this.$target = this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement;
                                }
                                this.$target.innerHTML = '';
                                this.$target.appendChild(instanceRef.location.nativeElement);
                                this.contentInitialized = true;
                                setTimeout(function () { return _this.onLoadSuccess(); }, 200);
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        PartialContainerDirective.prototype.onLoadSuccess = function () {
            this.componentInstance.invokeEventCallback('load');
            this.app.notify('partialLoaded');
        };
        PartialContainerDirective.decorators = [
            { type: i0.Directive, args: [{
                        selector: '[partialContainer]'
                    },] }
        ];
        /** @nocollapse */
        PartialContainerDirective.ctorParameters = function () {
            return [
                { type: undefined, decorators: [{ type: i0.Self }, { type: i0.Inject, args: [components.WidgetRef,] }] },
                { type: i0.ViewContainerRef },
                { type: i0.ElementRef },
                { type: i0.Injector },
                { type: core.App },
                { type: String, decorators: [{ type: i0.Attribute, args: ['content',] }] },
                { type: i0.ComponentFactoryResolver },
                { type: ComponentRefProvider },
                { type: PartialRefProvider }
            ];
        };
        return PartialContainerDirective;
    }());

    var AppSpinnerComponent = /** @class */ (function () {
        function AppSpinnerComponent() {
        }
        AppSpinnerComponent.decorators = [
            { type: i0.Component, args: [{
                        selector: 'app-spinner',
                        template: "\n        <div class=\"app-spinner\" *ngIf=\"show\">\n            <div class=\"spinner-message\" aria-label=\"loading gif\">\n                <i class=\"spinner-image animated infinite fa fa-circle-o-notch fa-spin\"></i>\n                <div class=\"spinner-messages\">\n                    <p *ngFor=\"let value of spinnermessages\" [textContent]=\"value\"></p>\n                </div>\n            </div>\n        </div>\n    "
                    }] }
        ];
        /** @nocollapse */
        AppSpinnerComponent.ctorParameters = function () { return []; };
        AppSpinnerComponent.propDecorators = {
            show: [{ type: i0.Input }],
            spinnermessages: [{ type: i0.Input }]
        };
        return AppSpinnerComponent;
    }());

    var CustomToasterComponent = /** @class */ (function (_super) {
        __extends(CustomToasterComponent, _super);
        // constructor is only necessary when not using AoT
        function CustomToasterComponent(toastrService, toastPackage) {
            var _this = _super.call(this, toastrService, toastPackage) || this;
            _this.toastrService = toastrService;
            _this.toastPackage = toastPackage;
            _this.watchers = [];
            _this.params = {};
            _this.pagename = _this.message || '';
            _this.generateParams();
            return _this;
        }
        // Generate the params for partial page. If bound, watch the expression and set the value
        CustomToasterComponent.prototype.generateParams = function () {
            var _this = this;
            _.forEach(this.options.partialParams, function (param) {
                if (_.isString(param.value) && param.value.indexOf('bind:') === 0) {
                    _this.watchers.push(core.$watch(param.value.substr(5), _this.options.context, {}, function (nv) {
                        _this.params[param.name] = nv;
                        core.$appDigest();
                    }));
                }
                else {
                    _this.params[param.name] = param.value;
                }
            });
        };
        CustomToasterComponent.prototype.generateDynamicComponent = function () {
            return __awaiter(this, void 0, void 0, function () {
                var $targetLayout;
                return __generator(this, function (_a) {
                    $targetLayout = $('.parent-custom-toast');
                    this.customToastRef.clear();
                    $targetLayout[0].appendChild(this.customToastRef.createEmbeddedView(this.customToastTmpl).rootNodes[0]);
                    return [2 /*return*/];
                });
            });
        };
        CustomToasterComponent.prototype.ngAfterViewInit = function () {
            this.generateDynamicComponent();
        };
        CustomToasterComponent.prototype.ngOnDestroy = function () {
            _.forEach(this.watchers, function (watcher) { return watcher(); });
        };
        CustomToasterComponent.decorators = [
            { type: i0.Component, args: [{
                        selector: '[custom-toaster-component]',
                        template: "\n        <div class=\"parent-custom-toast\"></div>\n        <ng-container #customToast></ng-container>\n        <ng-template #customToastTmpl>\n            <div wmContainer partialContainer content.bind=\"pagename\">\n                <div *ngFor=\"let param of params | keyvalue\" wmParam hidden\n                    [name]=\"param.key\" [value]=\"param.value\"></div>\n            </div>\n        </ng-template>",
                        preserveWhitespaces: false
                    }] }
        ];
        /** @nocollapse */
        CustomToasterComponent.ctorParameters = function () {
            return [
                { type: ngxToastr.ToastrService },
                { type: ngxToastr.ToastPackage }
            ];
        };
        CustomToasterComponent.propDecorators = {
            customToastRef: [{ type: i0.ViewChild, args: ['customToast', { read: i0.ViewContainerRef },] }],
            customToastTmpl: [{ type: i0.ViewChild, args: ['customToastTmpl',] }]
        };
        return CustomToasterComponent;
    }(ngxToastr.Toast));

    var EmptyPageComponent = /** @class */ (function () {
        function EmptyPageComponent(route, securityService, router$$1, app, appManger) {
            this.route = route;
            this.securityService = securityService;
            this.router = router$$1;
            this.app = app;
            this.appManger = appManger;
        }
        EmptyPageComponent.prototype.ngOnInit = function () {
            var _this = this;
            if (this.app.isPrefabType) {
                // there is only one route
                this.router.navigate(['prefab-preview']);
            }
            else if (this.app.isApplicationType) {
                this.securityService.getPageByLoggedInUser().then(function (page) {
                    _this.router.navigate([page]);
                });
            }
            else {
                this.router.navigate([core.getWmProjectProperties().homePage]);
                this.appManger.postAppTypeInfo();
            }
        };
        EmptyPageComponent.decorators = [
            { type: i0.Component, args: [{
                        selector: 'app-empty-page',
                        template: '<div></div>'
                    }] }
        ];
        /** @nocollapse */
        EmptyPageComponent.ctorParameters = function () {
            return [
                { type: router.ActivatedRoute },
                { type: security.SecurityService },
                { type: router.Router },
                { type: core.App },
                { type: AppManagerService }
            ];
        };
        return EmptyPageComponent;
    }());

    var PrefabDirective = /** @class */ (function () {
        function PrefabDirective(componentInstance, vcRef, elRef, prefabMngr, resolver, injector, componentRefProvider) {
            var _this = this;
            this.componentInstance = componentInstance;
            this.vcRef = vcRef;
            this.elRef = elRef;
            this.prefabMngr = prefabMngr;
            this.resolver = resolver;
            this.injector = injector;
            this.componentRefProvider = componentRefProvider;
            var prefabName = this.componentInstance.prefabName;
            this.prefabMngr.loadDependencies(prefabName)
                .then(function () {
                return __awaiter(_this, void 0, void 0, function () {
                    var componentFactory, instanceRef;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.componentRefProvider.getComponentFactoryRef(prefabName, exports.ComponentType.PREFAB)];
                            case 1:
                                componentFactory = _a.sent();
                                if (componentFactory) {
                                    instanceRef = this.vcRef.createComponent(componentFactory, 0, injector);
                                    this.elRef.nativeElement.appendChild(instanceRef.location.nativeElement);
                                }
                                return [2 /*return*/];
                        }
                    });
                });
            });
        }
        PrefabDirective.decorators = [
            { type: i0.Directive, args: [{
                        selector: '[wmPrefab][prefabname]'
                    },] }
        ];
        /** @nocollapse */
        PrefabDirective.ctorParameters = function () {
            return [
                { type: undefined, decorators: [{ type: i0.Self }, { type: i0.Inject, args: [components.WidgetRef,] }] },
                { type: i0.ViewContainerRef },
                { type: i0.ElementRef },
                { type: PrefabManagerService },
                { type: i0.ComponentFactoryResolver },
                { type: i0.Injector },
                { type: ComponentRefProvider }
            ];
        };
        return PrefabDirective;
    }());

    var injectorMap = {
        DialogService: core.AbstractDialogService,
        i18nService: core.AbstractI18nService,
        SpinnerService: core.AbstractSpinnerService,
        ToasterService: core.AbstractToasterService,
        Utils: core.UtilsService,
        FIELD_TYPE: core.FieldTypeService,
        FIELD_WIDGET: core.FieldWidgetService,
        DynamicComponentService: core.DynamicComponentRefProvider
    };
    var noop = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    };
    // Wraps httpService to behave as angular 1.x $http service.
    var getHttpDependency = function () {
        var httpService = this.httpService;
        var fn = function (key, options) {
            var args = Array.from(arguments).slice(1);
            return Promise.resolve(httpService[key].apply(httpService, args));
        };
        var $http = function () {
            return fn.apply(undefined, __spread(['send'], Array.from(arguments)));
        };
        ['get', 'post', 'head', 'put', 'delete', 'jsonp', 'patch'].forEach(function (key) { return $http[key] = fn.bind(undefined, key); });
        return $http;
    };
    var AppRef = /** @class */ (function () {
        function AppRef(inj, i18nService, httpService, securityService) {
            this.inj = inj;
            this.i18nService = i18nService;
            this.httpService = httpService;
            this.securityService = securityService;
            this.Variables = {};
            this.Actions = {};
            this.onAppVariablesReady = noop;
            this.onSessionTimeout = noop;
            this.onPageReady = noop;
            this.onBeforePageLeave = noop;
            this.onBeforeServiceCall = noop;
            this.onServiceSuccess = noop;
            this.onServiceError = noop;
            this.dynamicComponentContainerRef = {};
            this.changeLocale = this.i18nService.setSelectedLocale.bind(this.i18nService);
            this.getSelectedLocale = this.i18nService.getSelectedLocale.bind(this.i18nService);
            this._eventNotifier = new core.EventNotifier();
            var wmProjectProperties = core.getWmProjectProperties();
            this.projectName = wmProjectProperties.name;
            this.isPrefabType = wmProjectProperties.type === "PREFAB" /* PREFAB */;
            this.isApplicationType = wmProjectProperties.type === "APPLICATION" /* APPLICATION */;
            this.isTemplateBundleType = wmProjectProperties.type === "TEMPLATEBUNDLE" /* TEMPLATE_BUNDLE */;
            this.httpService.registerOnSessionTimeout(this.on401.bind(this));
            this.appLocale = this.i18nService.getAppLocale();
            this.httpService.setLocale(this.appLocale);
        }
        AppRef.prototype.reload = function () {
            window.location.reload();
        };
        AppRef.prototype.notify = function (eventName) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            this._eventNotifier.notify.apply(this._eventNotifier, arguments);
        };
        AppRef.prototype.getDependency = function (injToken) {
            var _this = this;
            if (core.isString(injToken)) {
                if (injToken === 'HttpService') {
                    return getHttpDependency.call(this);
                }
                var providerInstance_1 = injectorMap[injToken] && this.inj.get(injectorMap[injToken]);
                if (!providerInstance_1 && this.inj['_providers']) {
                    this.inj['_providers'].forEach(function (e) {
                        if (e && e.__proto__.constructor.toString().indexOf('function ' + injToken + '(') === 0) {
                            providerInstance_1 = _this.inj.get(e.__proto__.constructor);
                        }
                    });
                }
                return providerInstance_1;
            }
            return this.inj.get(injToken);
        };
        /**
         * triggers the onSessionTimeout callback in app.js
         */
        AppRef.prototype.on401 = function () {
            var userInfo = _.get(this.securityService.get(), 'userInfo');
            // if a previous user exists, a session time out triggered
            if (!_.isEmpty(userInfo)) {
                this.onSessionTimeout();
            }
        };
        AppRef.prototype.subscribe = function (eventName, callback) {
            return this._eventNotifier.subscribe(eventName, callback);
        };
        AppRef.prototype.notifyApp = function (template, type, title) {
            var notificationAction = _.get(this, 'Actions.appNotification');
            if (notificationAction) {
                type = type || 'success';
                notificationAction.invoke({
                    message: template,
                    title: core.isDefined(title) ? title : type.toUpperCase(),
                    class: type,
                    // If the type is error do not close the toastr
                    duration: type.toUpperCase() === 'ERROR' ? 0 : undefined
                });
            }
            else {
                console.warn('The default Action "appNotification" doesn\'t exist in the app.');
            }
        };
        AppRef.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        AppRef.ctorParameters = function () {
            return [
                { type: i0.Injector },
                { type: core.AbstractI18nService },
                { type: core.AbstractHttpService },
                { type: security.SecurityService }
            ];
        };
        return AppRef;
    }());

    var ToasterServiceImpl = /** @class */ (function (_super) {
        __extends(ToasterServiceImpl, _super);
        function ToasterServiceImpl(toaster) {
            var _this = _super.call(this) || this;
            _this.toaster = toaster;
            return _this;
        }
        ToasterServiceImpl.prototype._showToaster = function (type, title, desc, options) {
            // backward compatibility (in 9.x, 4th param is timeout value).
            if (_.isNumber(options)) {
                options = { timeOut: options };
            }
            options = options || {};
            options.timeOut = core.isDefined(options.timeOut) ? options.timeOut : 0;
            options.enableHtml = core.isDefined(options.enableHtml);
            options.positionClass = options.positionClass || 'toast-bottom-right';
            options.toastClass = 'toast';
            // pop the toaster only if either title or description are defined
            if (title || desc) {
                // if the desc is an object, stringify it.
                if (!options.bodyOutputType && _.isObject(desc)) {
                    desc = JSON.stringify(desc);
                }
                var fn = this.toaster[type];
                if (fn) {
                    return fn.call(this.toaster, desc, title, options);
                }
            }
        };
        ToasterServiceImpl.prototype.success = function (title, desc) {
            return this._showToaster('success', title, desc, { timeOut: 5000 });
        };
        ToasterServiceImpl.prototype.error = function (title, desc) {
            return this._showToaster('error', title, desc, { timeOut: 0 });
        };
        ToasterServiceImpl.prototype.info = function (title, desc) {
            return this._showToaster('info', title, desc, { timeOut: 0 });
        };
        ToasterServiceImpl.prototype.warn = function (title, desc) {
            return this._showToaster('warning', title, desc, { timeOut: 0 });
        };
        ToasterServiceImpl.prototype.show = function (type, title, desc, options) {
            return this._showToaster(type, title, desc, options);
        };
        ToasterServiceImpl.prototype.hide = function (toasterObj) {
            // in studio just ignore the toasterObj and hide all the toasters
            if (!toasterObj) {
                this.toaster.clear();
                return;
            }
            this.toaster.clear(toasterObj.toastId);
        };
        ToasterServiceImpl.prototype.showCustom = function (page, options) {
            if (!page) {
                return;
            }
            options = options || {};
            options.toastComponent = CustomToasterComponent;
            options.toastClass = 'custom-toaster';
            options.timeOut = core.isDefined(options.timeOut) ? options.timeOut : 0;
            options.enableHtml = core.isDefined(options.enableHtml);
            options.positionClass = options.positionClass || 'toast-bottom-right';
            options.toastClass = 'toast';
            return this.toaster.show(page, '', options);
        };
        ToasterServiceImpl.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        ToasterServiceImpl.ctorParameters = function () {
            return [
                { type: ngxToastr.ToastrService }
            ];
        };
        return ToasterServiceImpl;
    }(core.AbstractToasterService));

    var APP_LOCALE_ROOT_PATH = 'resources/i18n';
    var RTL_LANGUAGE_CODES = ['ar', 'ar-001', 'ar-ae', 'ar-bh', 'ar-dz', 'ar-eg', 'ar-iq', 'ar-jo', 'ar-kw', 'ar-lb', 'ar-ly',
        'ar-ma', 'ar-om', 'ar-qa', 'ar-sa', 'ar-sd', 'ar-sy', 'ar-tn', 'ar-ye', 'arc', 'bcc', 'bqi', 'ckb', 'dv', 'fa', 'glk',
        'he', 'ku', 'mzn', 'pnb', 'ps', 'sd', 'ug', 'ur', 'yi'];
    var I18nServiceImpl = /** @class */ (function (_super) {
        __extends(I18nServiceImpl, _super);
        function I18nServiceImpl($http, bsLocaleService, appDefaults) {
            var _this = _super.call(this) || this;
            _this.$http = $http;
            _this.bsLocaleService = bsLocaleService;
            _this.appDefaults = appDefaults;
            _this.defaultSupportedLocale = 'en';
            _this._isAngularLocaleLoaded = false;
            _this.appLocale = {};
            _this.prefabLocale = new Map();
            return _this;
        }
        I18nServiceImpl.prototype.updateLocaleDirection = function () {
            var direction = 'ltr';
            if (RTL_LANGUAGE_CODES.includes(this.selectedLocale)) {
                direction = 'rtl';
            }
            core.setCSS(document.body, 'direction', direction);
        };
        I18nServiceImpl.prototype.init = function () {
            this.messages = {};
            Object.setPrototypeOf(this.appLocale, this.messages);
        };
        I18nServiceImpl.prototype.getSelectedLocale = function () {
            return this.selectedLocale;
        };
        I18nServiceImpl.prototype.getDefaultSupportedLocale = function () {
            return this.defaultSupportedLocale;
        };
        I18nServiceImpl.prototype.getAppLocale = function () {
            return this.appLocale;
        };
        I18nServiceImpl.prototype.getPrefabLocaleBundle = function (prefabName) {
            if (!this.prefabLocale.has(prefabName)) {
                this.prefabLocale.set(prefabName, Object.create(this.appLocale));
            }
            return this.prefabLocale.get(prefabName);
        };
        I18nServiceImpl.prototype.extendPrefabMessages = function (messages) {
            var _this = this;
            if (!messages.prefabMessages) {
                return;
            }
            Object.keys(messages.prefabMessages).forEach(function (prefabName) {
                var bundle = _this.prefabLocale.get(prefabName);
                if (!bundle) {
                    bundle = Object.create(_this.appLocale);
                    _this.prefabLocale.set(prefabName, bundle);
                }
                Object.assign(bundle, messages.prefabMessages[prefabName]);
            });
        };
        I18nServiceImpl.prototype.extendMessages = function (messages) {
            Object.assign(this.messages, messages);
        };
        I18nServiceImpl.prototype.loadResource = function (path) {
            return this.$http.get(path)
                .toPromise()
                .catch(function () {
                console.warn("error loading locale resource from " + path);
            });
        };
        I18nServiceImpl.prototype.loadAppLocaleBundle = function () {
            var _this = this;
            this.loadResource(APP_LOCALE_ROOT_PATH + "/" + this.selectedLocale + ".json")
                .then(function (bundle) {
                _this.extendMessages(bundle.messages);
                _this.extendPrefabMessages(bundle);
                _this.appDefaults.setFormats(bundle.formats);
            });
        };
        I18nServiceImpl.prototype.loadMomentLocaleBundle = function (momentLocale) {
            var _this = this;
            var _cdnUrl = core._WM_APP_PROJECT.cdnUrl || core._WM_APP_PROJECT.ngDest;
            if (this.selectedLocale === this.defaultSupportedLocale) {
                moment.locale(this.defaultSupportedLocale);
                return;
            }
            var path = _cdnUrl + ("locales/moment/" + momentLocale + ".js");
            this.$http.get(path, { responseType: 'text' })
                .toPromise()
                .then(function (response) {
                var fn = new Function(response);
                // Call the script. In script, moment defines the loaded locale
                fn();
                moment.locale(_this.selectedLocale);
                // For ngx bootstrap locale, get the config from script and apply locale
                var _config;
                fn.apply({ moment: { defineLocale: function (code, config) { return _config = config; } } });
                ngxBootstrap.defineLocale(_this.selectedLocale, _config);
                _this.bsLocaleService.use(_this.getSelectedLocale() || _this.defaultSupportedLocale);
            });
        };
        I18nServiceImpl.prototype.loadAngularLocaleBundle = function (angLocale) {
            var _this = this;
            return new Promise(function (resolve) {
                var _cdnUrl = core._WM_APP_PROJECT.cdnUrl || core._WM_APP_PROJECT.ngDest;
                if (_this.selectedLocale === _this.defaultSupportedLocale) {
                    resolve();
                    return;
                }
                var path = _cdnUrl + ("locales/angular/" + angLocale + ".js");
                _this.$http.get(path, { responseType: 'text' })
                    .toPromise()
                    .then(function (response) {
                    var module = {}, exports = {};
                    module.exports = exports;
                    var fn = new Function('module', 'exports', response);
                    fn(module, exports);
                    common.registerLocaleData(exports.default);
                    _this._isAngularLocaleLoaded = true;
                    resolve();
                }, function () { return resolve(); });
            });
        };
        I18nServiceImpl.prototype.loadCalendarLocaleBundle = function (calendarLocale) {
            var _cdnUrl = core._WM_APP_PROJECT.cdnUrl || core._WM_APP_PROJECT.ngDest;
            var path;
            if (calendarLocale) {
                path = _cdnUrl + ("locales/fullcalendar/" + calendarLocale + ".js");
            }
            else {
                return Promise.resolve();
            }
            // return in case of mobile app or if selected locale is default supported locale.
            if (core.isMobile() || core.isMobileApp() || this.selectedLocale === this.defaultSupportedLocale) {
                return;
            }
            this.$http.get(path, { responseType: 'text' })
                .toPromise()
                .then(function (response) {
                var fn = new Function(response);
                // Call the script. In script, moment defines the loaded locale
                fn();
            });
        };
        I18nServiceImpl.prototype.loadLocaleBundles = function (libLocale) {
            if (libLocale.moment) {
                this.loadMomentLocaleBundle(libLocale.moment);
            }
            if (libLocale.fullCalendar) {
                this.loadCalendarLocaleBundle(libLocale.fullCalendar);
            }
            if (libLocale.angular) {
                this.loadAppLocaleBundle();
            }
            return this.loadAngularLocaleBundle(libLocale.angular);
        };
        I18nServiceImpl.prototype.setSelectedLocale = function (locale) {
            var _this = this;
            // check if the event is propagated from the select or any such widget
            if (_.isObject(locale)) {
                locale = locale.datavalue;
            }
            var libLocale = core.getWmProjectProperties().supportedLanguages[locale];
            var supportedLocale = Object.keys(core.getWmProjectProperties().supportedLanguages);
            if (!_.includes(supportedLocale, locale)) {
                return Promise.resolve();
            }
            if (!locale || locale === this.selectedLocale) {
                return Promise.resolve();
            }
            core.setSessionStorageItem('selectedLocale', locale);
            this.selectedLocale = locale;
            // reset the localeData object
            this.init();
            // load the locale bundles of the selected locale
            return this.loadLocaleBundles(libLocale).then(function () { return _this.updateLocaleDirection(); });
        };
        I18nServiceImpl.prototype.loadDefaultLocale = function () {
            var _acceptLang = this.getAcceptedLanguages();
            _acceptLang.push(core.getWmProjectProperties().defaultLanguage);
            var _supportedLang = Object.keys(core.getWmProjectProperties().supportedLanguages) || [this.defaultSupportedLocale];
            // check for the session storage to load any pre-requested locale
            var _defaultLang = core.getSessionStorageItem('selectedLocale') || _.intersection(_acceptLang, _supportedLang)[0] || this.defaultSupportedLocale;
            // if the supportedLocale is not available set it to defaultLocale
            _supportedLang = _supportedLang || [_defaultLang];
            var defaultLanguage = _defaultLang || _supportedLang[0];
            return this.setSelectedLocale(defaultLanguage);
        };
        I18nServiceImpl.prototype.getLocalizedMessage = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return core.replace(this.appLocale[message], args);
        };
        // This function returns the accepted languages list
        I18nServiceImpl.prototype.getAcceptedLanguages = function () {
            var languages;
            if (variables.CONSTANTS.hasCordova) {
                languages = navigator.languages || [navigator.language];
            }
            else {
                languages = core.getWmProjectProperties().preferredLanguage || '';
                /**
                 * Accept-Language Header will contain set of supported locale, so try splitting the string to proper locale set
                 * Ex: en,en-US;q=0.9,de;q=0.6,ar;q=0.2,hi
                 *
                 * Split the above into [en,en-us,de,ar,hi]
                 * @type {Array}
                 */
                languages = languages.split(',').map(function (locale) {
                    return locale.split(';')[0];
                });
            }
            return _.map(languages, _.toLower);
        };
        I18nServiceImpl.prototype.isAngularLocaleLoaded = function () {
            return this._isAngularLocaleLoaded;
        };
        I18nServiceImpl.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        I18nServiceImpl.ctorParameters = function () {
            return [
                { type: http.HttpClient },
                { type: ngxBootstrap.BsLocaleService },
                { type: core.AppDefaults }
            ];
        };
        return I18nServiceImpl;
    }(core.AbstractI18nService));

    var spinnerTemplate = "<div class=\"app-spinner\">\n                            <div class=\"spinner-message\" aria-label=\"loading gif\">\n                                <i class=\"spinner-image animated infinite fa fa-circle-o-notch fa-spin\"></i>\n                                <div class=\"spinner-messages\">\n                                    <p class=\"spinner-messages-container\"></p>\n                               </div>\n                            </div>\n                         </div>";
    var SpinnerServiceImpl = /** @class */ (function (_super) {
        __extends(SpinnerServiceImpl, _super);
        function SpinnerServiceImpl() {
            var _this = _super.call(this) || this;
            _this.spinnerId = 0;
            _this.messageSource = new rxjs.Subject();
            _this.messagesByContext = {};
            return _this;
        }
        /**
         * returns the message source subject
         * @returns {Subject<any>}
         */
        SpinnerServiceImpl.prototype.getMessageSource = function () {
            return this.messageSource;
        };
        /**
         * show spinner on a container element
         */
        SpinnerServiceImpl.prototype.showContextSpinner = function (ctx, message, id) {
            var ctxMarkup = $('[name="' + ctx + '"]');
            this.messagesByContext[ctx] = this.messagesByContext[ctx] || {};
            // If the spinner already exists on the context
            // then just append the message to the existing spinner message
            // else add a new spinner
            if (Object.keys(this.messagesByContext[ctx]).length !== 0) {
                this.messagesByContext[ctx][id] = message;
                this.messagesByContext[ctx]['finalMessage'] = this.messagesByContext[ctx]['finalMessage'] + ' ' + this.messagesByContext[ctx][id];
                ctxMarkup.find('.spinner-messages-container').html(this.messagesByContext[ctx]['finalMessage']);
            }
            else {
                var ctxSpinnerTemp = $(spinnerTemplate);
                this.messagesByContext[ctx][id] = message;
                this.messagesByContext[ctx]['finalMessage'] = this.messagesByContext[ctx][id];
                ctxSpinnerTemp.find('.spinner-messages-container').html(this.messagesByContext[ctx]['finalMessage']);
                ctxMarkup.prepend(ctxSpinnerTemp);
            }
            return id;
        };
        /**
         * show the app spinner with provided message
         * @param msg
         * @returns {string}
         */
        SpinnerServiceImpl.prototype.showAppSpinner = function (msg, id) {
            var ctx = 'page';
            this.messagesByContext[ctx] = this.messagesByContext[ctx] || {};
            this.messagesByContext[ctx][id] = msg;
            this.messageSource.next({
                show: true,
                message: msg,
                messages: _.values(this.messagesByContext[ctx])
            });
        };
        /**
         * hides the spinner on a particular container(context)
         * @param ctx
         * @param id
         */
        SpinnerServiceImpl.prototype.hideContextSpinner = function (ctx, id) {
            delete this.messagesByContext[ctx][id];
            if (Object.keys(this.messagesByContext[ctx]).length === 1) {
                this.messagesByContext[ctx] = {};
            }
            var ctxMarkup = $('[name="' + ctx + '"]');
            ctxMarkup.find('.app-spinner').remove();
        };
        /**
         * show spinner
         * @param message
         * @param id
         * @param spinnerClass
         * @param spinnerContext
         * @param variableScopeId
         * @returns {any}
         */
        SpinnerServiceImpl.prototype.show = function (message, id, spinnerClass, spinnerContext, variableScopeId) {
            id = id || ++this.spinnerId;
            // if spinnerContext is passed, then append the spinner to the element(default method for variable calls).
            if (spinnerContext && spinnerContext !== 'page') {
                // return after the compiled spinner is appended to the element reference
                return this.showContextSpinner(spinnerContext, message, id);
            }
            this.showAppSpinner(message, id);
            return id;
        };
        /**
         * hide the spinner
         * @param spinnerId
         */
        SpinnerServiceImpl.prototype.hide = function (id) {
            // find the spinner context of the id from the messagesByContext
            var ctx = _.findKey(this.messagesByContext, function (obj) {
                return _.includes(_.keys(obj), id);
            }) || 'page';
            // if spinnerContext exists just remove the spinner from the reference and destroy the scope associated.
            if (ctx !== 'page') {
                this.hideContextSpinner(ctx, id);
                return;
            }
            if (id) {
                delete this.messagesByContext[ctx][id];
                var messages = _.values(this.messagesByContext[ctx]);
                var pageSpinnerCount = Object.keys(this.messagesByContext[ctx]).length;
                this.messageSource.next({
                    show: messages.length ? true : false,
                    messages: _.values(this.messagesByContext[ctx])
                });
                // If a page spinner has id and no messages left to display then remove that spinner.
                if (pageSpinnerCount === 0) {
                    $('.app-spinner').remove();
                }
            }
            else {
                this.messagesByContext[ctx] = {};
            }
        };
        SpinnerServiceImpl.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        SpinnerServiceImpl.ctorParameters = function () { return []; };
        return SpinnerServiceImpl;
    }(core.AbstractSpinnerService));

    var parentSelector = 'body:first >app-root:last';
    var NavigationServiceImpl = /** @class */ (function () {
        function NavigationServiceImpl(app, router$$1) {
            var _this = this;
            this.app = app;
            this.router = router$$1;
            this.history = new History();
            this.isPageAddedToHistory = false;
            this.router.events.subscribe(function (event) {
                if (event instanceof router.NavigationStart) {
                    var url = event.url;
                    var urlParams_1 = {};
                    var pageName = void 0;
                    if (!_this.isPageAddedToHistory) {
                        _this.isPageAddedToHistory = false;
                        if (url.indexOf('?') > 0) {
                            url.substr(url.indexOf('?') + 1)
                                .split('&')
                                .forEach(function (s) {
                                var splits = s.split('=');
                                urlParams_1[splits[0]] = splits[1];
                            });
                            pageName = url.substr(0, url.indexOf('?'));
                        }
                        else {
                            pageName = url;
                        }
                        if (pageName[0] === '/') {
                            pageName = pageName.substr(1);
                        }
                        if (pageName) {
                            /*
                             * Commenting this code, one client project has Home_Page configured as Login Page.
                             * So redirection to Home_Page post login is failing
                             // if login page is being loaded and user is logged in, cancel that.
                                if ($rs.isApplicationType) {
                                    stopLoginPagePostLogin($p);
                                }
                             */
                            delete urlParams_1['name'];
                            _this.history.push(new PageInfo(pageName, urlParams_1, _this.transition));
                        }
                    }
                }
            });
        }
        NavigationServiceImpl.prototype.getPageTransition = function () {
            if (_.isEmpty(this.transition) || _.isEqual('none', this.transition)) {
                return null;
            }
            return this.transition;
        };
        /**
         * Navigates to particular page
         * @param pageName
         * @param options
         */
        NavigationServiceImpl.prototype.goToPage = function (pageName, options) {
            this.transition = options.transition || '';
            // page is added to stack only when currentPage is available.
            if (this.history.getCurrentPage()) {
                this.isPageAddedToHistory = true;
            }
            this.history.push(new PageInfo(pageName, options.urlParams, this.transition));
            if (variables.CONSTANTS.isWaveLens) {
                var location_1 = window['location'];
                var strQueryParams = _.map(options.urlParams || [], function (value, key) { return key + '=' + value; });
                var strQuery = (strQueryParams.length > 0 ? '?' + strQueryParams.join('&') : '');
                location_1.href = location_1.origin
                    + location_1.pathname
                    + '#/' + pageName
                    + strQuery;
                return;
            }
            return this.router.navigate(["/" + pageName], { queryParams: options.urlParams });
        };
        /**
         * Navigates to last visited page.
         */
        NavigationServiceImpl.prototype.goToPrevious = function () {
            if (this.history.getPagesCount()) {
                this.transition = this.history.getCurrentPage().transition;
                if (!_.isEmpty(this.transition)) {
                    this.transition += '-exit';
                }
                this.history.pop();
                this.isPageAddedToHistory = true;
                window.history.back();
            }
        };
        /** Todo[Shubham] Need to handle gotoElement in other partials
         * Navigates to particular view
         * @param viewName
         * @param options
         * @param variable
         */
        NavigationServiceImpl.prototype.goToView = function (viewName, options, variable) {
            var _this = this;
            options = options || {};
            var pageName = options.pageName;
            var transition = options.transition || '';
            var $event = options.$event;
            var activePage = this.app.activePage;
            var prefabName = variable && variable._context && variable._context.prefabName;
            // Check if app is Prefab
            if (this.app.isPrefabType) {
                this.goToElementView($(parentSelector).find('[name="' + viewName + '"]'), viewName, pageName, variable);
            }
            else {
                // checking if the element is present in the page or not, if no show an error toaster
                // if yes check if it is inside a partial/prefab in the page and then highlight the respective element
                // else goto the page in which the element exists and highlight the element
                if (pageName !== activePage.activePageName && !prefabName) {
                    if (this.isPartialWithNameExists(pageName)) {
                        this.goToElementView($('[partialcontainer][content="' + pageName + '"]').find('[name="' + viewName + '"]'), viewName, pageName, variable);
                    }
                    else {
                        // Todo[Shubham]: Make an API call to get all pages and check if the page name
                        //  is a page and then do this call else show an error as:
                        //  this.app.notifyApp(CONSTANTS.WIDGET_DOESNT_EXIST, 'error');
                        this.goToPage(pageName, {
                            viewName: viewName,
                            $event: $event,
                            transition: transition,
                            urlParams: options.urlParams
                        });
                        // subscribe to an event named pageReady which notifies this subscriber
                        // when all widgets in page are loaded i.e when page is ready
                        var pageReadySubscriber_1 = this.app.subscribe('pageReady', function (page) {
                            _this.goToElementView($(parentSelector).find('[name="' + viewName + '"]'), viewName, pageName, variable);
                            pageReadySubscriber_1();
                        });
                    }
                }
                else if (prefabName && this.isPrefabWithNameExists(prefabName)) {
                    this.goToElementView($('[prefabName="' + prefabName + '"]').find('[name="' + viewName + '"]'), viewName, pageName, variable);
                }
                else if (!pageName || pageName === activePage.activePageName) {
                    this.goToElementView($(parentSelector).find('[name="' + viewName + '"]'), viewName, pageName, variable);
                }
                else {
                    this.app.notifyApp(variables.CONSTANTS.WIDGET_DOESNT_EXIST, 'error');
                }
            }
        };
        /*
         * navigates the user to a view element with given name
         * if the element not found in the compiled markup, the same is searched in the available dialogs in the page
         */
        NavigationServiceImpl.prototype.goToElementView = function (viewElement, viewName, pageName, variable) {
            var _this = this;
            var $el, parentDialog;
            var activePage = this.app.activePage;
            if (viewElement.length) {
                if (!this.app.isPrefabType && pageName === activePage.activePageName) {
                    viewElement = this.getViewElementInActivePage(viewElement);
                }
                $el = viewElement[0].widget;
                switch ($el.widgetType) {
                    case 'wm-accordionpane':
                        this.showAncestors(viewElement, variable);
                        $el.expand();
                        break;
                    case 'wm-tabpane':
                        this.showAncestors(viewElement, variable);
                        $el.select();
                        break;
                    case 'wm-segment-content':
                        this.showAncestors(viewElement, variable);
                        $el.navigate();
                        break;
                    case 'wm-panel':
                        /* flip the active flag */
                        $el.expanded = true;
                        break;
                }
            }
            else {
                parentDialog = this.showAncestorDialog(viewName);
                setTimeout(function () {
                    if (parentDialog) {
                        _this.goToElementView($('[name="' + viewName + '"]'), viewName, pageName, variable);
                    }
                });
            }
        };
        /* If page name is equal to active pageName, this function returns the element in the page.
         The element in the partial page is not selected.*/
        NavigationServiceImpl.prototype.getViewElementInActivePage = function ($el) {
            var selector;
            if ($el.length > 1) {
                selector = _.filter($el, function (childSelector) {
                    if (_.isEmpty($(childSelector).closest('[data-role = "partial"]')) && _.isEmpty($(childSelector).closest('[wmprefabcontainer]'))) {
                        return childSelector;
                    }
                });
                if (selector) {
                    $el = $(selector);
                }
            }
            return $el;
        };
        /**
         * checks if the pagecontainer has the pageName.
         */
        NavigationServiceImpl.prototype.isPartialWithNameExists = function (name) {
            return $('[partialcontainer][content="' + name + '"]').length;
        };
        /**
         * checks if the pagecontainer has the prefab.
         */
        NavigationServiceImpl.prototype.isPrefabWithNameExists = function (prefabName) {
            return $('[prefabName="' + prefabName + '"]').length;
        };
        /*
         * shows all the parent container view elements for a given view element
         */
        NavigationServiceImpl.prototype.showAncestors = function (element, variable) {
            var ancestorSearchQuery = '[wm-navigable-element="true"]';
            element
                .parents(ancestorSearchQuery)
                .toArray()
                .reverse()
                .forEach(function (parent) {
                var $el = parent.widget;
                switch ($el.widgetType) {
                    case 'wm-accordionpane':
                        $el.expand();
                        break;
                    case 'wm-tabpane':
                        $el.select();
                        break;
                    case 'wm-segment-content':
                        $el.navigate();
                        break;
                    case 'wm-panel':
                        /* flip the active flag */
                        $el.expanded = true;
                        break;
                }
            });
        };
        /*
         * searches for a given view element inside the available dialogs in current page
         * if found, the dialog is displayed, the dialog id is returned.
         */
        NavigationServiceImpl.prototype.showAncestorDialog = function (viewName) {
            var dialogId;
            $('app-root [dialogtype]')
                .each(function () {
                var dialog = $(this);
                if ($(dialog.html()).find('[name="' + viewName + '"]').length) {
                    dialogId = dialog.attr('name');
                    return false;
                }
            });
            return dialogId;
        };
        NavigationServiceImpl.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        NavigationServiceImpl.ctorParameters = function () {
            return [
                { type: core.App },
                { type: router.Router }
            ];
        };
        return NavigationServiceImpl;
    }());
    var PageInfo = /** @class */ (function () {
        function PageInfo(name, urlParams, transition) {
            this.name = name;
            this.urlParams = urlParams;
            this.transition = transition;
            this.transition = _.isEmpty(this.transition) ? null : this.transition;
        }
        PageInfo.prototype.isEqual = function (page1) {
            return page1 && page1.name === this.name && _.isEqual(page1.urlParams, this.urlParams);
        };
        return PageInfo;
    }());
    var History = /** @class */ (function () {
        function History() {
            this.stack = [];
        }
        History.prototype.getCurrentPage = function () {
            return this.currentPage;
        };
        History.prototype.getPagesCount = function () {
            return this.stack.length;
        };
        History.prototype.isLastVisitedPage = function (page) {
            return this.getLastPage().isEqual(page);
        };
        History.prototype.push = function (pageInfo) {
            if (this.currentPage) {
                this.stack.push(this.currentPage);
            }
            this.currentPage = pageInfo;
        };
        History.prototype.pop = function () {
            this.currentPage = this.stack.pop();
            return this.currentPage;
        };
        History.prototype.getLastPage = function () {
            return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined;
        };
        return History;
    }());

    var AppDefaultsService = /** @class */ (function () {
        function AppDefaultsService() {
        }
        AppDefaultsService.prototype.setFormats = function (formats) {
            var dateFormat = formats.date;
            var timeFormat = formats.time;
            var dateTimeFormat = (dateFormat && timeFormat) ? dateFormat + ' ' + timeFormat : undefined;
            this.dateFormat = dateFormat;
            this.timeFormat = timeFormat;
            this.dateTimeFormat = dateTimeFormat;
        };
        AppDefaultsService.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        AppDefaultsService.ctorParameters = function () { return []; };
        return AppDefaultsService;
    }());

    var securityConfigLoaded = false;
    var AuthGuard = /** @class */ (function () {
        function AuthGuard(securityService, appManager) {
            this.securityService = securityService;
            this.appManager = appManager;
        }
        AuthGuard.prototype.loadSecurityConfig = function () {
            if (securityConfigLoaded) {
                return Promise.resolve(true);
            }
            return this.appManager.loadSecurityConfig().then(function () { return securityConfigLoaded = true; });
        };
        AuthGuard.prototype.isAuthenticated = function () {
            var _this = this;
            return this.loadSecurityConfig()
                .then(function () {
                return new Promise(function (resolve, reject) {
                    _this.securityService.isAuthenticated(resolve, reject);
                });
            });
        };
        AuthGuard.prototype.canActivate = function (route) {
            var _this = this;
            return this.isAuthenticated()
                .then(function (isLoggedIn) {
                if (isLoggedIn) {
                    return Promise.resolve(true);
                }
                _this.appManager.handle401(route.routeConfig.path);
                return Promise.resolve(false);
            });
        };
        AuthGuard.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        AuthGuard.ctorParameters = function () {
            return [
                { type: security.SecurityService },
                { type: AppManagerService }
            ];
        };
        return AuthGuard;
    }());

    var RoleGuard = /** @class */ (function () {
        function RoleGuard(securityService, authGuard, toasterService, app, appManager) {
            this.securityService = securityService;
            this.authGuard = authGuard;
            this.toasterService = toasterService;
            this.app = app;
            this.appManager = appManager;
        }
        RoleGuard.prototype.canActivate = function (route) {
            var _this = this;
            var allowedRoles = route.data.allowedRoles;
            return this.authGuard.isAuthenticated()
                .then(function (isLoggedIn) {
                if (isLoggedIn) {
                    var userRoles = _this.securityService.get().userInfo.userRoles;
                    var hasAccess = _.intersection(allowedRoles, userRoles).length > 0;
                    if (hasAccess) {
                        return Promise.resolve(true);
                    }
                    // current loggedin user doesn't have access to the page that the user is trying to view
                    _this.appManager.notifyApp(_this.app.appLocale.LABEL_ACCESS_DENIED || 'Access Denied', 'error');
                    return Promise.resolve(false);
                }
                else {
                    // redirect to Login
                    _this.appManager.handle401(route.routeConfig.path);
                    return Promise.resolve(false);
                }
            });
        };
        RoleGuard.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        RoleGuard.ctorParameters = function () {
            return [
                { type: security.SecurityService },
                { type: AuthGuard },
                { type: core.AbstractToasterService },
                { type: core.App },
                { type: AppManagerService }
            ];
        };
        return RoleGuard;
    }());

    var PageNotFoundGaurd = /** @class */ (function () {
        function PageNotFoundGaurd(app, appManager) {
            this.app = app;
            this.appManager = appManager;
        }
        PageNotFoundGaurd.prototype.canActivate = function (route) {
            this.appManager.notifyApp(this.app.appLocale.MESSAGE_PAGE_NOT_FOUND || 'The page you are trying to reach is not available', 'error');
            return Promise.resolve(false);
        };
        PageNotFoundGaurd.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        PageNotFoundGaurd.ctorParameters = function () {
            return [
                { type: core.App },
                { type: AppManagerService }
            ];
        };
        return PageNotFoundGaurd;
    }());

    var appJsLoaded = false;
    var AppJSResolve = /** @class */ (function () {
        function AppJSResolve(inj, app, utilService, appJsProvider) {
            this.inj = inj;
            this.app = app;
            this.utilService = utilService;
            this.appJsProvider = appJsProvider;
        }
        AppJSResolve.prototype.resolve = function () {
            return __awaiter(this, void 0, void 0, function () {
                var appScriptFn, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (appJsLoaded) {
                                return [2 /*return*/, true];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.appJsProvider.getAppScriptFn()];
                        case 2:
                            appScriptFn = _a.sent();
                            appScriptFn(this.app, this.utilService, this.inj);
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            console.warn('Error in executing app.js', e_1);
                            return [3 /*break*/, 4];
                        case 4:
                            appJsLoaded = true;
                            return [2 /*return*/, true];
                    }
                });
            });
        };
        AppJSResolve.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        AppJSResolve.ctorParameters = function () {
            return [
                { type: i0.Injector },
                { type: core.App },
                { type: core.UtilsService },
                { type: AppJSProvider }
            ];
        };
        return AppJSResolve;
    }());

    var I18nResolve = /** @class */ (function () {
        function I18nResolve(i18nService) {
            this.i18nService = i18nService;
        }
        I18nResolve.prototype.resolve = function () {
            return this.i18nService.loadDefaultLocale();
        };
        I18nResolve.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        I18nResolve.ctorParameters = function () {
            return [
                { type: core.AbstractI18nService }
            ];
        };
        return I18nResolve;
    }());

    var PipeProvider = /** @class */ (function () {
        function PipeProvider(compiler, injector) {
            var _this = this;
            this.compiler = compiler;
            this.injector = injector;
            this._locale = core.getSessionStorageItem('selectedLocale') || 'en';
            this.preparePipeMeta = function (reference, name, pure, diDeps) {
                if (diDeps === void 0) {
                    diDeps = [];
                }
                return ({
                    type: { reference: reference, diDeps: diDeps },
                    name: name,
                    pure: pure
                });
            };
            this._pipeData = [
                // TODO | NEED TO BE TESTED
                this.preparePipeMeta(common.AsyncPipe, 'async', false, [i0.ChangeDetectorRef]),
                this.preparePipeMeta(common.SlicePipe, 'slice', false),
                this.preparePipeMeta(common.PercentPipe, 'percent', true, [this._locale]),
                this.preparePipeMeta(common.I18nPluralPipe, 'i18nPlural', true, [
                    common.NgLocalization
                ]),
                this.preparePipeMeta(common.I18nSelectPipe, 'i18nSelect', true),
                this.preparePipeMeta(common.KeyValuePipe, 'keyvalue', false, [
                    i0.KeyValueDiffers
                ]),
                this.preparePipeMeta(components.FileIconClassPipe, 'fileIconClass', true),
                this.preparePipeMeta(components.FileExtensionFromMimePipe, 'fileExtensionFromMime', true),
                this.preparePipeMeta(components.StateClassPipe, 'stateClass', true),
                this.preparePipeMeta(components.FileSizePipe, 'filesize', true),
                // TESTED
                this.preparePipeMeta(components.FilterPipe, 'filter', true),
                this.preparePipeMeta(common.UpperCasePipe, 'uppercase', true),
                this.preparePipeMeta(common.LowerCasePipe, 'lowercase', true),
                this.preparePipeMeta(common.JsonPipe, 'json', false),
                this.preparePipeMeta(common.DecimalPipe, 'number', true, [this._locale]),
                this.preparePipeMeta(common.TitleCasePipe, 'titlecase', true),
                this.preparePipeMeta(common.CurrencyPipe, 'currency', true, [this._locale]),
                this.preparePipeMeta(common.DatePipe, 'date', true, [this._locale]),
                this.preparePipeMeta(components.ToDatePipe, 'toDate', true, [
                    new common.DatePipe(this._locale)
                ]),
                this.preparePipeMeta(components.ToNumberPipe, 'toNumber', true, [
                    new common.DecimalPipe(this._locale)
                ]),
                this.preparePipeMeta(components.ToCurrencyPipe, 'toCurrency', true, [
                    new common.DecimalPipe(this._locale)
                ]),
                this.preparePipeMeta(components.PrefixPipe, 'prefix', true),
                this.preparePipeMeta(components.SuffixPipe, 'suffix', true),
                this.preparePipeMeta(components.TimeFromNowPipe, 'timeFromNow', true),
                this.preparePipeMeta(components.NumberToStringPipe, 'numberToString', true, [
                    new common.DecimalPipe(this._locale)
                ]),
                this.preparePipeMeta(components.StringToNumberPipe, 'stringToNumber', true)
            ];
            this._pipeMeta = new Map();
            this._pipeData.forEach(function (v) {
                _this._pipeMeta.set(v.name, v);
            });
        }
        PipeProvider.prototype.unknownPipe = function (name) {
            throw Error("The pipe '" + name + "' could not be found");
        };
        PipeProvider.prototype.meta = function (name) {
            var meta = this._pipeMeta.get(name);
            if (!meta) {
                this.unknownPipe(name);
            }
            return meta;
        };
        PipeProvider.prototype.getPipeNameVsIsPureMap = function () {
            var _map = new Map();
            this._pipeMeta.forEach(function (v, k) {
                _map.set(k, v.pure);
            });
            return _map;
        };
        PipeProvider.prototype.resolveDep = function (dep) {
            return this.injector.get(dep.token.identifier.reference);
        };
        PipeProvider.prototype.getInstance = function (name) {
            var e_1, _a;
            var _b = this.meta(name).type, ref = _b.reference, deps = _b.diDeps;
            if (!ref) {
                this.unknownPipe(name);
            }
            if (!deps.length) {
                return new ref();
            }
            else {
                var args = [];
                try {
                    for (var deps_1 = __values(deps), deps_1_1 = deps_1.next(); !deps_1_1.done; deps_1_1 = deps_1.next()) {
                        var dep = deps_1_1.value;
                        args.push(dep);
                    }
                }
                catch (e_1_1) {
                    e_1 = { error: e_1_1 };
                }
                finally {
                    try {
                        if (deps_1_1 && !deps_1_1.done && (_a = deps_1.return))
                            _a.call(deps_1);
                    }
                    finally {
                        if (e_1)
                            throw e_1.error;
                    }
                }
                return new (ref.bind.apply(ref, __spread([void 0], args)))();
            }
        };
        PipeProvider.decorators = [
            { type: i0.Injectable, args: [{
                        providedIn: 'root'
                    },] }
        ];
        /** @nocollapse */
        PipeProvider.ctorParameters = function () {
            return [
                { type: i0.Compiler },
                { type: i0.Injector }
            ];
        };
        PipeProvider.ngInjectableDef = i0.defineInjectable({ factory: function PipeProvider_Factory() { return new PipeProvider(i0.inject(i0.Compiler), i0.inject(i0.INJECTOR)); }, token: PipeProvider, providedIn: "root" });
        return PipeProvider;
    }());

    var AppComponent = /** @class */ (function () {
        function AppComponent(_pipeProvider, _appRef, elRef, oAuthService, dialogService, spinnerService, ngZone, router$$1, app) {
            var _this = this;
            this.elRef = elRef;
            this.oAuthService = oAuthService;
            this.dialogService = dialogService;
            this.spinnerService = spinnerService;
            this.router = router$$1;
            this.app = app;
            this.startApp = false;
            this.isApplicationType = false;
            this.spinner = { show: false, messages: [] };
            this.isOAuthDialogOpen = false;
            core.setPipeProvider(_pipeProvider);
            core.setNgZone(ngZone);
            core.setAppRef(_appRef);
            this.isApplicationType = core.getWmProjectProperties().type === 'APPLICATION';
            // subscribe to OAuth changes
            oAuthService.getOAuthProvidersAsObservable().subscribe(function (providers) {
                _this.providersConfig = providers;
                if (providers.length) {
                    _this.showOAuthDialog();
                }
                else {
                    _this.closeOAuthDialog();
                }
            });
            // Subscribe to the message source to show/hide app spinner
            this.spinnerService.getMessageSource().asObservable().subscribe(function (data) {
                // setTimeout is to avoid 'ExpressionChangedAfterItHasBeenCheckedError'
                setTimeout(function () {
                    _this.spinner.show = data.show;
                    _this.spinner.messages = data.messages;
                });
            });
            // set theme to bs3 on ngx-bootstrap. This avoids runtime calculation to determine bs theme. Thus resolves performance.
            ngxBootstrap.setTheme('bs3');
            if (core.hasCordova() && !window['wmDeviceReady']) {
                document.addEventListener('wmDeviceReady', function () { return _this.startApp = true; });
            }
            else {
                this.startApp = true;
            }
            var spinnerId;
            this.router.events.subscribe(function (e) {
                if (e instanceof router.NavigationStart) {
                    spinnerId = _this.spinnerService.show('', 'globalSpinner');
                    var node = document.querySelector('app-page-outlet');
                    if (node) {
                        core.addClass(node, 'page-load-in-progress');
                    }
                }
                else if (e instanceof router.NavigationEnd || e instanceof router.NavigationCancel || e instanceof router.NavigationError) {
                    setTimeout(function () {
                        _this.spinnerService.hide(spinnerId);
                        var node = document.querySelector('app-page-outlet');
                        if (node) {
                            core.removeClass(node, 'page-load-in-progress');
                        }
                    }, 1000);
                }
            });
        }
        AppComponent.prototype.showOAuthDialog = function () {
            if (!this.isOAuthDialogOpen) {
                this.isOAuthDialogOpen = true;
                this.dialogService.open('oAuthLoginDialog', this);
            }
        };
        AppComponent.prototype.closeOAuthDialog = function () {
            if (this.isOAuthDialogOpen) {
                this.isOAuthDialogOpen = false;
                this.dialogService.close('oAuthLoginDialog', this);
            }
        };
        AppComponent.prototype.ngAfterViewInit = function () {
            this.app.dynamicComponentContainerRef = this.dynamicComponentContainerRef;
        };
        AppComponent.prototype.ngDoCheck = function () {
            core.$invokeWatchers();
        };
        AppComponent.decorators = [
            { type: i0.Component, args: [{
                        selector: 'app-root',
                        template: "<ng-container *ngIf=\"startApp\">\n    <router-outlet></router-outlet>\n    <div wmContainer partialContainer content=\"Common\" hidden class=\"ng-hide\" *ngIf=\"isApplicationType\"></div>\n    <app-spinner [show]=\"spinner.show\" [spinnermessages]=\"spinner.messages\"></app-spinner>\n    <div wmDialog name=\"oAuthLoginDialog\" title.bind=\"'Application is requesting you to sign in with'\"\n         close.event=\"closeOAuthDialog()\">\n        <ng-template #dialogBody>\n            <ul class=\"list-items\">\n                <li class=\"list-item\" *ngFor=\"let provider of providersConfig\">\n                    <button class=\"btn\" (click)=\"provider.invoke()\">{{provider.name}}</button>\n                </li>\n            </ul>\n        </ng-template>\n    </div>\n    <div wmConfirmDialog name=\"_app-confirm-dialog\" title.bind=\"title\" message.bind=\"message\" oktext.bind=\"oktext\"\n         canceltext.bind=\"canceltext\" closable=\"false\"\n         iconclass.bind=\"iconclass\" ok.event=\"onOk()\" cancel.event=\"onCancel()\" close.event=\"onClose()\" opened.event=\"onOpen()\"></div>\n    <div wmAppExt></div>\n    <i id=\"wm-mobile-display\"></i>\n</ng-container>\n<!--Dummy container to create the component dynamically-->\n<ng-container #dynamicComponent></ng-container>\n",
                        encapsulation: i0.ViewEncapsulation.None
                    }] }
        ];
        /** @nocollapse */
        AppComponent.ctorParameters = function () {
            return [
                { type: PipeProvider },
                { type: i0.ApplicationRef },
                { type: i0.ElementRef },
                { type: oAuth.OAuthService },
                { type: core.AbstractDialogService },
                { type: core.AbstractSpinnerService },
                { type: i0.NgZone },
                { type: router.Router },
                { type: core.App }
            ];
        };
        AppComponent.propDecorators = {
            dynamicComponentContainerRef: [{ type: i0.ViewChild, args: ['dynamicComponent', { read: i0.ViewContainerRef },] }]
        };
        return AppComponent;
    }());

    /**
     * This Interceptor intercepts all network calls and if a network call fails
     * due to session timeout, then it calls a function to handle session timeout.
     */
    var HttpCallInterceptor = /** @class */ (function () {
        function HttpCallInterceptor() {
            this.wmHttpRequest = new http$1.WmHttpRequest();
            this.wmHttpResponse = new http$1.WmHttpResponse();
        }
        HttpCallInterceptor.prototype.createSubject = function () {
            return new rxjs.Subject();
        };
        HttpCallInterceptor.prototype.intercept = function (request, next) {
            var _this = this;
            var modifiedReq;
            var modifiedResp;
            if (variables.appManager && variables.appManager.appOnBeforeServiceCall) {
                // Convert the angular HttpRequest to wm HttpRequest
                var req = this.wmHttpRequest.angularToWmRequest(request);
                // trigger the common onBeforeServiceCall handler present in app.js
                modifiedReq = variables.appManager.appOnBeforeServiceCall(req);
                if (modifiedReq) {
                    // Convert the wm HttpRequest to angular HttpRequest
                    modifiedReq = this.wmHttpRequest.wmToAngularRequest(modifiedReq);
                    request = modifiedReq;
                }
            }
            return next.handle(request).pipe(operators.tap(function (response) {
                if (response && response.type === 4 && variables.appManager && variables.appManager.appOnServiceSuccess) {
                    // Convert the angular HttpResponse to wm HttpResponse
                    var resp = _this.wmHttpResponse.angularToWmResponse(response);
                    // trigger the common success handler present in app.js
                    modifiedResp = variables.appManager.appOnServiceSuccess(resp.body, resp);
                    if (modifiedResp) {
                        // Convert the wm HttpResponse to angular HttpResponse
                        modifiedResp = _this.wmHttpResponse.wmToAngularResponse(modifiedResp);
                        _.extend(response, modifiedResp);
                    }
                }
            }, function (error) {
                error._401Subscriber = _this.createSubject();
                if (variables.httpService.isPlatformSessionTimeout(error)) {
                    variables.httpService.handleSessionTimeout(request, error._401Subscriber);
                }
                if (variables.appManager && variables.appManager.appOnServiceError) {
                    // Convert the angular HttpResponse to wm HttpResponse
                    var err = _this.wmHttpResponse.angularToWmResponse(error);
                    // trigger the common error handler present in app.js
                    modifiedResp = variables.appManager.appOnServiceError(err.message, err);
                    if (modifiedResp) {
                        // Convert the wm HttpResponse to angular HttpResponse
                        modifiedResp = _this.wmHttpResponse.wmToAngularResponse(modifiedResp);
                        _.extend(error, modifiedResp);
                    }
                }
            }));
        };
        HttpCallInterceptor.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        HttpCallInterceptor.ctorParameters = function () { return []; };
        return HttpCallInterceptor;
    }());

    var PREFAB = 'PREFAB';
    var PrefabPreviewComponent = /** @class */ (function () {
        function PrefabPreviewComponent(prefabManager) {
            var _this = this;
            this.prefabManager = prefabManager;
            window.addEventListener('message', function (e) {
                var context = e.data && e.data.context;
                if (context !== PREFAB) {
                    return;
                }
                var action = e.data.action;
                var payload = e.data.payload;
                if (action === 'init') {
                    _this.init();
                }
                else if (action === 'set-property') {
                    _this.setProperty(payload);
                }
                else if (action === 'get-outbound-properties') {
                    _this.getOutboundProps();
                }
                else if (action === 'invoke-script') {
                    _this.invokeScript(payload);
                }
            });
        }
        PrefabPreviewComponent.prototype.postMessage = function (action, payload) {
            var data = {
                context: PREFAB,
                action: action,
                payload: payload
            };
            window.top.postMessage(data, '*');
        };
        PrefabPreviewComponent.prototype.setupEventListeners = function () {
            var _this = this;
            this.prefabInstance.invokeEventCallback = function (eventName, locals) {
                if (locals === void 0) {
                    locals = {};
                }
                _this.postMessage('event-log', { name: eventName, data: locals });
            };
        };
        PrefabPreviewComponent.prototype.init = function () {
            var _this = this;
            this.previewMode = true;
            this.prefabInstance.readyState.subscribe(function () { }, function () { }, function () {
                _this.prefabManager.getConfig('__self__')
                    .then(function (config) {
                    _this.config = config;
                    _this.postMessage('config', config);
                    _this.setupEventListeners();
                });
            });
        };
        PrefabPreviewComponent.prototype.setProperty = function (payload) {
            this.prefabInstance.widget[payload.name] = payload.value;
        };
        PrefabPreviewComponent.prototype.isOutBoundProp = function (info) {
            return info.bindable === 'out-bound' || info.bindable === 'in-out-bound';
        };
        PrefabPreviewComponent.prototype.getOutboundProps = function () {
            var e_1, _a;
            var payload = {};
            try {
                for (var _b = __values(Object.entries(this.config.properties || {})), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), name_1 = _d[0], info = _d[1];
                    if (this.isOutBoundProp(info)) {
                        payload[name_1] = this.prefabInstance.widget[name_1];
                    }
                }
            }
            catch (e_1_1) {
                e_1 = { error: e_1_1 };
            }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return))
                        _a.call(_b);
                }
                finally {
                    if (e_1)
                        throw e_1.error;
                }
            }
            this.postMessage('outbound-properties', payload);
        };
        PrefabPreviewComponent.prototype.invokeScript = function (payload) {
            var script = "\n return " + payload.script + ";";
            var fn = new Function('Prefab', script);
            var retVal = fn(this.prefabInstance);
            this.postMessage('method-output', { methodName: payload.methodName, output: retVal });
        };
        PrefabPreviewComponent.prototype.ngAfterViewInit = function () {
            this.setupEventListeners();
            this.postMessage('init');
        };
        PrefabPreviewComponent.decorators = [
            { type: i0.Component, args: [{
                        selector: 'wm-prefab-preview',
                        template: "\n        <div class=\"prefab-preview row\">\n            <section wmPrefab name=\"prefab-preview\" prefabname=\"__self__\"></section>\n        </div>\n    "
                    }] }
        ];
        /** @nocollapse */
        PrefabPreviewComponent.ctorParameters = function () {
            return [
                { type: PrefabManagerService }
            ];
        };
        PrefabPreviewComponent.propDecorators = {
            prefabInstance: [{ type: i0.ViewChild, args: [components.PrefabDirective,] }]
        };
        return PrefabPreviewComponent;
    }());

    buildTask.initComponentsBuildTask();
    var componentFactoryRefCache = new Map();
    var getDynamicModule = function (componentRef) {
        var DynamicModule = /** @class */ (function () {
            function DynamicModule() {
            }
            DynamicModule.decorators = [
                { type: i0.NgModule, args: [{
                            declarations: [componentRef],
                            imports: [
                                RuntimeBaseModule
                            ],
                            schemas: [i0.CUSTOM_ELEMENTS_SCHEMA, i0.NO_ERRORS_SCHEMA]
                        },] },
            ];
            return DynamicModule;
        }());
        return DynamicModule;
    };
    var getDynamicComponent = function (selector, template, css) {
        if (css === void 0) {
            css = '';
        }
        var componentDef = {
            template: template,
            styles: [css],
            encapsulation: i0.ViewEncapsulation.None
        };
        var DynamicComponent = /** @class */ (function () {
            function DynamicComponent() {
            }
            DynamicComponent.decorators = [
                { type: i0.Component, args: [__assign({}, componentDef, { selector: selector }),] },
            ];
            return DynamicComponent;
        }());
        return DynamicComponent;
    };
    var DynamicComponentRefProviderService = /** @class */ (function () {
        function DynamicComponentRefProviderService(app, appManager, compiler) {
            this.app = app;
            this.appManager = appManager;
            this.compiler = compiler;
            this.counter = 1;
        }
        DynamicComponentRefProviderService.prototype.getComponentFactoryRef = function (selector, markup, options) {
            if (options === void 0) {
                options = {};
            }
            return __awaiter(this, void 0, void 0, function () {
                var componentFactoryRef, componentDef_1, moduleDef;
                return __generator(this, function (_a) {
                    componentFactoryRef = componentFactoryRefCache.get(selector);
                    markup = options.transpile ? transpiler.transpile(markup) : markup;
                    if (!componentFactoryRef || options.noCache) {
                        componentDef_1 = getDynamicComponent(selector, markup, options.styles);
                        moduleDef = getDynamicModule(componentDef_1);
                        componentFactoryRef = this.compiler
                            .compileModuleAndAllComponentsSync(moduleDef)
                            .componentFactories
                            .filter(function (factory) { return factory.componentType === componentDef_1; })[0];
                        componentFactoryRefCache.set(selector, componentFactoryRef);
                    }
                    return [2 /*return*/, componentFactoryRef];
                });
            });
        };
        /**
         * Creates the component dynamically and add it to the DOM
         * @param target: HTML element where we need to append the created component
         * @param markup: Template of the component
         * @param context: Scope of the component
         * @param options: We have options like
                           selector: selector of the component
                           transpile: flag for transpiling HTML. By default it is true
                           nocache: flag for render it from cache or not. By default it is true
         */
        DynamicComponentRefProviderService.prototype.addComponent = function (target, markup, context, options) {
            if (context === void 0) {
                context = {};
            }
            if (options === void 0) {
                options = {};
            }
            return __awaiter(this, void 0, void 0, function () {
                var componentFactoryRef, component;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            options.transpile = core.isDefined(options.transpile) ? options.transpile : true;
                            options.noCache = core.isDefined(options.noCache) ? options.noCache : true;
                            options.selector = core.isDefined(options.selector) ? options.selector : 'wm-dynamic-component-' + this.counter++;
                            return [4 /*yield*/, this.getComponentFactoryRef(options.selector, markup, options)];
                        case 1:
                            componentFactoryRef = _a.sent();
                            component = this.app.dynamicComponentContainerRef.createComponent(componentFactoryRef, 0);
                            core.extendProto(component.instance, context);
                            target.appendChild(component.location.nativeElement);
                            return [2 /*return*/];
                    }
                });
            });
        };
        DynamicComponentRefProviderService.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        DynamicComponentRefProviderService.ctorParameters = function () {
            return [
                { type: core.App },
                { type: AppManagerService },
                { type: i0.Compiler }
            ];
        };
        return DynamicComponentRefProviderService;
    }());

    var CanDeactivatePageGuard = /** @class */ (function () {
        function CanDeactivatePageGuard() {
        }
        CanDeactivatePageGuard.prototype.canDeactivate = function (component, route, state) {
            return component.canDeactivate ? component.canDeactivate() : true;
        };
        CanDeactivatePageGuard.decorators = [
            { type: i0.Injectable }
        ];
        return CanDeactivatePageGuard;
    }());

    function InitializeApp(I18nService) {
        return function () {
            core._WM_APP_PROJECT.id = location.href.split('/')[3];
            core._WM_APP_PROJECT.cdnUrl = document.querySelector('[name="cdnUrl"]') && document.querySelector('[name="cdnUrl"]').getAttribute('content');
            core._WM_APP_PROJECT.ngDest = 'ng-bundle/';
            return I18nService.loadDefaultLocale();
        };
    }
    function setAngularLocale(I18nService) {
        return I18nService.isAngularLocaleLoaded() ? I18nService.getSelectedLocale() : I18nService.getDefaultSupportedLocale();
    }
    var definitions = [
        AccessrolesDirective,
        PartialContainerDirective,
        AppSpinnerComponent,
        CustomToasterComponent,
        PrefabDirective,
        AppComponent,
        PrefabPreviewComponent,
        EmptyPageComponent
    ];
    var carouselModule = ngxBootstrap.CarouselModule.forRoot();
    var bsDropDownModule = ngxBootstrap.BsDropdownModule.forRoot();
    var popoverModule = ngxBootstrap.PopoverModule.forRoot();
    var tooltipModule = ngxBootstrap.TooltipModule.forRoot();
    // setting parseExpr as exprEvaluator for swipeAnimation
    $.fn.swipeAnimation.expressionEvaluator = core.$parseExpr;
    var RuntimeBaseModule = /** @class */ (function () {
        function RuntimeBaseModule() {
            RuntimeBaseModule.addCustomEventPolyfill();
        }
        // this polyfill is to add support for CustomEvent in IE11
        RuntimeBaseModule.addCustomEventPolyfill = function () {
            if (typeof window['CustomEvent'] === 'function') {
                return false;
            }
            var CustomEvent = function (event, params) {
                params = params || { bubbles: false, cancelable: false, detail: null };
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            };
            CustomEvent.prototype = window['Event'].prototype;
            window['CustomEvent'] = CustomEvent;
        };
        RuntimeBaseModule.forRoot = function () {
            return {
                ngModule: RuntimeBaseModule,
                providers: [
                    { provide: core.App, useClass: AppRef },
                    { provide: core.AbstractToasterService, useClass: ToasterServiceImpl },
                    { provide: core.AbstractI18nService, useClass: I18nServiceImpl },
                    { provide: core.AbstractSpinnerService, useClass: SpinnerServiceImpl },
                    { provide: core.AbstractNavigationService, useClass: NavigationServiceImpl },
                    { provide: core.AppDefaults, useClass: AppDefaultsService },
                    { provide: core.DynamicComponentRefProvider, useClass: DynamicComponentRefProviderService },
                    {
                        provide: i0.APP_INITIALIZER,
                        useFactory: InitializeApp,
                        deps: [core.AbstractI18nService],
                        multi: true
                    },
                    {
                        provide: i0.LOCALE_ID,
                        useFactory: setAngularLocale,
                        deps: [core.AbstractI18nService]
                    },
                    {
                        provide: http.HTTP_INTERCEPTORS,
                        useClass: HttpCallInterceptor,
                        multi: true
                    },
                    common.DecimalPipe,
                    common.DatePipe,
                    AppManagerService,
                    PrefabManagerService,
                    AuthGuard,
                    RoleGuard,
                    PageNotFoundGaurd,
                    CanDeactivatePageGuard,
                    AppJSResolve,
                    I18nResolve
                ]
            };
        };
        RuntimeBaseModule.decorators = [
            { type: i0.NgModule, args: [{
                        declarations: definitions,
                        imports: [
                            common.CommonModule,
                            forms.FormsModule,
                            router.RouterModule,
                            forms.ReactiveFormsModule,
                            http.HttpClientModule,
                            carouselModule,
                            bsDropDownModule,
                            popoverModule,
                            tooltipModule,
                            ngxBootstrap.ModalModule,
                            components.WmComponentsModule,
                            runtime.MobileRuntimeModule,
                            core.CoreModule,
                            security.SecurityModule,
                            oAuth.OAuthModule,
                            variables.VariablesModule,
                            http$1.HttpServiceModule,
                        ],
                        exports: [
                            definitions,
                            common.CommonModule,
                            forms.FormsModule,
                            forms.ReactiveFormsModule,
                            ngxBootstrap.ModalModule,
                            ngxBootstrap.CarouselModule,
                            ngxBootstrap.BsDropdownModule,
                            ngxBootstrap.PopoverModule,
                            ngxBootstrap.TooltipModule,
                            components.WmComponentsModule,
                            runtime.MobileRuntimeModule,
                            core.CoreModule,
                            security.SecurityModule,
                            oAuth.OAuthModule,
                            variables.VariablesModule,
                            http$1.HttpServiceModule
                        ],
                        entryComponents: [CustomToasterComponent]
                    },] }
        ];
        /** @nocollapse */
        RuntimeBaseModule.ctorParameters = function () { return []; };
        return RuntimeBaseModule;
    }());
    var WM_MODULES_FOR_ROOT = [
        components.WmComponentsModule.forRoot(),
        runtime.MobileRuntimeModule.forRoot(),
        ngxBootstrap.ModalModule.forRoot(),
        core.CoreModule.forRoot(),
        security.SecurityModule.forRoot(),
        oAuth.OAuthModule.forRoot(),
        variables.VariablesModule.forRoot(),
        http$1.HttpServiceModule.forRoot(),
        RuntimeBaseModule.forRoot()
    ];

    var appVariablesLoaded = false;
    var AppVariablesResolve = /** @class */ (function () {
        function AppVariablesResolve(appManager, appVariablesProvider) {
            this.appManager = appManager;
            this.appVariablesProvider = appVariablesProvider;
        }
        AppVariablesResolve.prototype.resolve = function () {
            var _this = this;
            // execute app.js
            if (appVariablesLoaded) {
                return true;
            }
            return this.appVariablesProvider.getAppVariables()
                .then(function (variables$$1) { return _this.appManager.loadAppVariables(variables$$1); })
                .then(function () { return appVariablesLoaded = true; });
        };
        AppVariablesResolve.decorators = [
            { type: i0.Injectable, args: [{
                        providedIn: 'root'
                    },] }
        ];
        /** @nocollapse */
        AppVariablesResolve.ctorParameters = function () {
            return [
                { type: AppManagerService },
                { type: AppVariablesProvider }
            ];
        };
        AppVariablesResolve.ngInjectableDef = i0.defineInjectable({ factory: function AppVariablesResolve_Factory() { return new AppVariablesResolve(i0.inject(AppManagerService), i0.inject(AppVariablesProvider)); }, token: AppVariablesResolve, providedIn: "root" });
        return AppVariablesResolve;
    }());

    var metadataResolved = false;
    var MetadataResolve = /** @class */ (function () {
        function MetadataResolve(appManager) {
            this.appManager = appManager;
        }
        MetadataResolve.prototype.resolve = function () {
            return metadataResolved || this.appManager.loadMetadata().then(function () { return metadataResolved = true; });
        };
        MetadataResolve.decorators = [
            { type: i0.Injectable, args: [{
                        providedIn: 'root'
                    },] }
        ];
        /** @nocollapse */
        MetadataResolve.ctorParameters = function () {
            return [
                { type: AppManagerService }
            ];
        };
        MetadataResolve.ngInjectableDef = i0.defineInjectable({ factory: function MetadataResolve_Factory() { return new MetadataResolve(i0.inject(AppManagerService)); }, token: MetadataResolve, providedIn: "root" });
        return MetadataResolve;
    }());

    var SecurityConfigResolve = /** @class */ (function () {
        function SecurityConfigResolve(appManager) {
            this.appManager = appManager;
            // if the project type is PREFAB, setting this flag will not trigger security/info call
            this.loaded = this.appManager.isPrefabType() || this.appManager.isTemplateBundleType() || !core.getWmProjectProperties().securityEnabled;
        }
        SecurityConfigResolve.prototype.resolve = function () {
            var _this = this;
            return this.loaded || this.appManager.loadSecurityConfig().then(function () {
                _this.loaded = true;
            });
        };
        SecurityConfigResolve.decorators = [
            { type: i0.Injectable, args: [{
                        providedIn: 'root'
                    },] }
        ];
        /** @nocollapse */
        SecurityConfigResolve.ctorParameters = function () {
            return [
                { type: AppManagerService }
            ];
        };
        SecurityConfigResolve.ngInjectableDef = i0.defineInjectable({ factory: function SecurityConfigResolve_Factory() { return new SecurityConfigResolve(i0.inject(AppManagerService)); }, token: SecurityConfigResolve, providedIn: "root" });
        return SecurityConfigResolve;
    }());

    /**
     * Generated bundle index. Do not edit.
     */

    exports.ɵd = AppSpinnerComponent;
    exports.ɵe = CustomToasterComponent;
    exports.ɵb = AccessrolesDirective;
    exports.ɵc = PartialContainerDirective;
    exports.ɵf = PrefabDirective;
    exports.ɵm = AppDefaultsService;
    exports.ɵh = AppRef;
    exports.ɵn = DynamicComponentRefProviderService;
    exports.ɵo = HttpCallInterceptor;
    exports.ɵj = I18nServiceImpl;
    exports.ɵl = NavigationServiceImpl;
    exports.ɵg = PipeProvider;
    exports.ɵk = SpinnerServiceImpl;
    exports.ɵi = ToasterServiceImpl;
    exports.ɵa = FragmentMonitor;
    exports.ComponentRefProvider = ComponentRefProvider;
    exports.PrefabConfigProvider = PrefabConfigProvider;
    exports.AppJSProvider = AppJSProvider;
    exports.AppVariablesProvider = AppVariablesProvider;
    exports.PartialRefProvider = PartialRefProvider;
    exports.AppManagerService = AppManagerService;
    exports.PrefabManagerService = PrefabManagerService;
    exports.ɵ0 = ɵ0;
    exports.BasePageComponent = BasePageComponent;
    exports.commonPartialWidgets = commonPartialWidgets;
    exports.BasePartialComponent = BasePartialComponent;
    exports.BasePrefabComponent = BasePrefabComponent;
    exports.InitializeApp = InitializeApp;
    exports.setAngularLocale = setAngularLocale;
    exports.carouselModule = carouselModule;
    exports.bsDropDownModule = bsDropDownModule;
    exports.popoverModule = popoverModule;
    exports.tooltipModule = tooltipModule;
    exports.RuntimeBaseModule = RuntimeBaseModule;
    exports.WM_MODULES_FOR_ROOT = WM_MODULES_FOR_ROOT;
    exports.isPrefabInPreview = isPrefabInPreview;
    exports.getPrefabBaseUrl = getPrefabBaseUrl;
    exports.getPrefabConfigUrl = getPrefabConfigUrl;
    exports.getPrefabMinJsonUrl = getPrefabMinJsonUrl;
    exports.AuthGuard = AuthGuard;
    exports.RoleGuard = RoleGuard;
    exports.PageNotFoundGaurd = PageNotFoundGaurd;
    exports.AppComponent = AppComponent;
    exports.EmptyPageComponent = EmptyPageComponent;
    exports.PrefabPreviewComponent = PrefabPreviewComponent;
    exports.AppJSResolve = AppJSResolve;
    exports.AppVariablesResolve = AppVariablesResolve;
    exports.I18nResolve = I18nResolve;
    exports.MetadataResolve = MetadataResolve;
    exports.SecurityConfigResolve = SecurityConfigResolve;
    exports.CanDeactivatePageGuard = CanDeactivatePageGuard;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=index.umd.js.map