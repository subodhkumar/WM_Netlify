import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AbstractDialogService, AbstractHttpService, AbstractI18nService, AbstractSpinnerService, App, fetchContent, isDefined, triggerFn, $appDigest } from '@wm/core';
import { SecurityService } from '@wm/security';
import { CONSTANTS, $rootScope, routerService, MetadataService, VariablesService } from '@wm/variables';
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
        this.$app.subscribe('userLoggedOut', function () { return _this.setLandingPage().then(function () {
            // navigate to the landing page without reloading the window in device.
            if (window['cordova']) {
                _this.$router.navigate(["/"]);
            }
        }); });
        this.$app.subscribe('http401', function (d) {
            if (d === void 0) { d = {}; }
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
        $appDigest();
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
    AppManagerService.prototype.loadAppVariables = function (variables) {
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
        if (isDefined(variables)) {
            init(variables);
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
        if (isDefined(isFired)) {
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
        if (CONSTANTS.hasCordova) {
            // get previously loggedInUser name (if any)
            var lastLoggedInUsername_1 = _.get(this.$security.get(), 'userInfo.userName');
            this.$security.authInBrowser()
                .then(function () { return _this.reloadAppData(); })
                .then(function () {
                var presentLoggedInUsername = _.get(_this.$security.get(), 'userInfo.userName');
                if (presentLoggedInUsername && presentLoggedInUsername === lastLoggedInUsername_1) {
                    routerService.navigate([page]);
                }
                else {
                    routerService.navigate(["/"]);
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
        return this.$app.deployedUrl ? this.$app.deployedUrl : $rootScope.project.deployedUrl;
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
        return triggerFn(this.$app.onBeforeServiceCall, requestParams);
    };
    /**
     * Triggers the onServiceSuccess method defined in app.js of the app
     * @param data
     * @param xhrObj
     */
    AppManagerService.prototype.appOnServiceSuccess = function (data, xhrObj) {
        return triggerFn(this.$app.onServiceSuccess, data, xhrObj);
    };
    /**
     * Triggers the onServiceError method defined in app.js of the app
     * @param data
     * @param xhrOb
     */
    AppManagerService.prototype.appOnServiceError = function (data, xhrOb) {
        return triggerFn(this.$app.onServiceError, data, xhrOb);
    };
    /**
     * Triggers the appVariablesReady method defined in app.js of the app
     */
    AppManagerService.prototype.appVariablesReady = function () {
        triggerFn(this.$app.onAppVariablesReady);
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
        return fetchContent('json', './config.json', true, function (response) {
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
        { type: Injectable }
    ];
    /** @nocollapse */
    AppManagerService.ctorParameters = function () { return [
        { type: AbstractHttpService },
        { type: SecurityService },
        { type: AbstractDialogService },
        { type: Router },
        { type: App },
        { type: VariablesService },
        { type: MetadataService },
        { type: AbstractSpinnerService },
        { type: AbstractI18nService },
        { type: DatePipe }
    ]; };
    return AppManagerService;
}());
export { AppManagerService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1hbmFnZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9hcHAubWFuYWdlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUzQyxPQUFPLEVBQ0gscUJBQXFCLEVBQ3JCLG1CQUFtQixFQUNuQixtQkFBbUIsRUFDbkIsc0JBQXNCLEVBQ3RCLEdBQUcsRUFDSCxZQUFZLEVBQ1osU0FBUyxFQUNULFNBQVMsRUFDVCxVQUFVLEVBQ2IsTUFBTSxVQUFVLENBQUM7QUFDbEIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMvQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUcsZUFBZSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBSXpHLElBQUssYUFPSjtBQVBELFdBQUssYUFBYTtJQUNkLHNFQUFxRCxDQUFBO0lBQ3JELHNFQUFxRCxDQUFBO0lBQ3JELHlEQUFpRCxDQUFBO0lBQ2pELG9EQUE0QyxDQUFBO0lBQzVDLGlFQUFtRCxDQUFBO0lBQ25ELG9DQUFvQyxDQUFBO0FBQ3hDLENBQUMsRUFQSSxhQUFhLEtBQWIsYUFBYSxRQU9qQjtBQUVEO0lBUUksMkJBQ1ksS0FBMEIsRUFDMUIsU0FBMEIsRUFDMUIsT0FBOEIsRUFDOUIsT0FBZSxFQUNmLElBQVMsRUFDVCxVQUE0QixFQUM1QixTQUEwQixFQUMxQixRQUFnQyxFQUNoQyxLQUEwQixFQUMxQixTQUFtQjtRQVYvQixpQkF5Q0M7UUF4Q1csVUFBSyxHQUFMLEtBQUssQ0FBcUI7UUFDMUIsY0FBUyxHQUFULFNBQVMsQ0FB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dGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBEYXRlUGlwZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7XG4gICAgQWJzdHJhY3REaWFsb2dTZXJ2aWNlLFxuICAgIEFic3RyYWN0SHR0cFNlcnZpY2UsXG4gICAgQWJzdHJhY3RJMThuU2VydmljZSxcbiAgICBBYnN0cmFjdFNwaW5uZXJTZXJ2aWNlLFxuICAgIEFwcCxcbiAgICBmZXRjaENvbnRlbnQsXG4gICAgaXNEZWZpbmVkLFxuICAgIHRyaWdnZXJGbixcbiAgICAkYXBwRGlnZXN0XG59IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IFNlY3VyaXR5U2VydmljZSB9IGZyb20gJ0B3bS9zZWN1cml0eSc7XG5pbXBvcnQgeyBDT05TVEFOVFMsICRyb290U2NvcGUsIHJvdXRlclNlcnZpY2UsICBNZXRhZGF0YVNlcnZpY2UsIFZhcmlhYmxlc1NlcnZpY2UgfSBmcm9tICdAd20vdmFyaWFibGVzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5lbnVtIFBPU1RfTUVTU0FHRVMge1xuICAgIEhJREVfVEVNUExBVEVTX1NIT1dfQ0FTRSA9ICdoaWRlLXRlbXBsYXRlcy1zaG93LWNhc2UnLFxuICAgIFNIT1dfVEVNUExBVEVTX1NIT1dfQ0FTRSA9ICdzaG93LXRlbXBsYXRlcy1zaG93LWNhc2UnLFxuICAgIFVQREFURV9MT0NBVElPTiAgICAgICAgICA9ICd1cGRhdGUtbG9jYXRpb24tcGF0aCcsXG4gICAgU0VMRUNUX1RFTVBMQVRFICAgICAgICAgID0gJ3NlbGVjdC10ZW1wbGF0ZScsXG4gICAgVEVNUExBVEVCVU5ETEVfQ09ORklHICAgID0gJ3RlbXBsYXRlLWJ1bmRsZS1jb25maWcnLFxuICAgIE9OX0xPQUQgICAgICAgICAgICAgICAgICA9ICdvbi1sb2FkJ1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQXBwTWFuYWdlclNlcnZpY2Uge1xuXG4gICAgcHJpdmF0ZSBhcHBWYXJpYWJsZXNMb2FkZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIGFwcFZhcmlhYmxlc0ZpcmVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfbm9SZWRpcmVjdCA9IGZhbHNlO1xuICAgIHByaXZhdGUgdGVtcGxhdGVzOiBBcnJheTxhbnk+O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgJGh0dHA6IEFic3RyYWN0SHR0cFNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgJHNlY3VyaXR5OiBTZWN1cml0eVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgJGRpYWxvZzogQWJzdHJhY3REaWFsb2dTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlICRyb3V0ZXI6IFJvdXRlcixcbiAgICAgICAgcHJpdmF0ZSAkYXBwOiBBcHAsXG4gICAgICAgIHByaXZhdGUgJHZhcmlhYmxlczogVmFyaWFibGVzU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSAkbWV0YWRhdGE6IE1ldGFkYXRhU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSAkc3Bpbm5lcjogQWJzdHJhY3RTcGlubmVyU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSAkaTE4bjogQWJzdHJhY3RJMThuU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSAkZGF0ZVBpcGU6IERhdGVQaXBlXG4gICAgKSB7XG4gICAgICAgIC8vIHJlZ2lzdGVyIG1ldGhvZCB0byBpbnZva2Ugb24gc2Vzc2lvbiB0aW1lb3V0XG4gICAgICAgIHRoaXMuJGh0dHAucmVnaXN0ZXJPblNlc3Npb25UaW1lb3V0KHRoaXMuaGFuZGxlNDAxLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuJHZhcmlhYmxlcy5yZWdpc3RlckRlcGVuZGVuY3koJ2FwcE1hbmFnZXInLCB0aGlzKTtcblxuICAgICAgICB0aGlzLiRhcHAuc3Vic2NyaWJlKCd0b2dnbGUtdmFyaWFibGUtc3RhdGUnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFyaWFibGUgPSBkYXRhLnZhcmlhYmxlLFxuICAgICAgICAgICAgICAgIGFjdGl2ZSA9IGRhdGEuYWN0aXZlO1xuICAgICAgICAgICAgaWYgKCFfLmlzRW1wdHkoXy50cmltKHZhcmlhYmxlLnNwaW5uZXJDb250ZXh0KSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlLl9zcGlubmVySWQgPSB2YXJpYWJsZS5fc3Bpbm5lcklkIHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzcGlubmVySWQgPSB0aGlzLiRzcGlubmVyLnNob3codmFyaWFibGUuc3Bpbm5lck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZS5faWQgKyAnXycgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGUuc3Bpbm5lcmNsYXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGUuc3Bpbm5lckNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZS5fc3Bpbm5lcklkLnB1c2goc3Bpbm5lcklkKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzcGlubmVyLmhpZGUodmFyaWFibGUuX3NwaW5uZXJJZC5zaGlmdCgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiRhcHAuc3Vic2NyaWJlKCd1c2VyTG9nZ2VkSW4nLCAoKSA9PiB0aGlzLnNldExhbmRpbmdQYWdlKCkpO1xuICAgICAgICB0aGlzLiRhcHAuc3Vic2NyaWJlKCd1c2VyTG9nZ2VkT3V0JywgKCkgPT4gdGhpcy5zZXRMYW5kaW5nUGFnZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gbmF2aWdhdGUgdG8gdGhlIGxhbmRpbmcgcGFnZSB3aXRob3V0IHJlbG9hZGluZyB0aGUgd2luZG93IGluIGRldmljZS5cbiAgICAgICAgICAgIGlmICh3aW5kb3dbJ2NvcmRvdmEnXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHJvdXRlci5uYXZpZ2F0ZShbYC9gXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy4kYXBwLnN1YnNjcmliZSgnaHR0cDQwMScsIChkID0ge30pID0+IHRoaXMuaGFuZGxlNDAxKGQucGFnZSwgZC5vcHRpb25zKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT24gc2Vzc2lvbiB0aW1lb3V0LCBpZiB0aGUgc2Vzc2lvbiB0aW1lb3V0IGNvbmZpZyBpcyBzZXQgdG8gYSBkaWFsb2csIHRoZW4gb3BlbiBsb2dpbiBkaWFsb2dcbiAgICAgKi9cbiAgICBwcml2YXRlIHNob3dMb2dpbkRpYWxvZygpIHtcbiAgICAgICAgdGhpcy4kc3Bpbm5lci5oaWRlKCdnbG9iYWxTcGlubmVyJyk7XG4gICAgICAgIC8vIFJlbW92aW5nIHRoZSBjbG9zZSBhbGwgZGlhbG9ncyBjYWxsLCBzbyB0aGUgZXhpc3RpbmcgZGlhbG9ncyByZW1haW4gb3BlbiBhbmRcbiAgICAgICAgLy8gdGhlIGxvZ2luIGRpYWxvZyBjb21lcyBvbiB0b3Agb2YgaXQuXG4gICAgICAgIHRoaXMuJGRpYWxvZy5vcGVuKCdDb21tb25Mb2dpbkRpYWxvZycpO1xuICAgICAgICAvLyBTaW5jZSB0aGUgbG9naW4gZGlhbG9nIGlzIGNsb3NlZCBhbmQgb3BlbmVkIGl0cyB1cGRhdGVkIHByb3BlcnR5IGlzbid0IHJlYWQgYnkgYW5ndWxhci5cbiAgICAgICAgLy8gSGVuY2Ugd2UgdHJpZ2dlciB0aGUgZGlnZXN0IGN5Y2xlXG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICB9XG5cbiAgICBsb2FkQXBwSlMoKSB7XG5cbiAgICB9XG5cbiAgICBsb2FkQ29tbW9uUGFnZSgpIHtcblxuICAgIH1cblxuICAgIGxvYWRTZWN1cml0eUNvbmZpZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJHNlY3VyaXR5LmxvYWQoKS50aGVuKChyKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuJGFwcC5sYW5kaW5nUGFnZU5hbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldExhbmRpbmdQYWdlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbG9hZE1ldGFkYXRhKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kbWV0YWRhdGEubG9hZCgpO1xuICAgIH1cblxuICAgIGxvYWRBcHBWYXJpYWJsZXModmFyaWFibGVzPzogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLmFwcFZhcmlhYmxlc0xvYWRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaW5pdCA9IHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLiR2YXJpYWJsZXMucmVnaXN0ZXIoJ2FwcCcsIHJlc3BvbnNlLCB0aGlzLiRhcHApO1xuICAgICAgICAgICAgLy8gbm90IGFzc2lnbmluZyBkaXJlY3RseSB0byB0aGlzLiRhcHAgdG8ga2VlcCB0aGUgcmVmZXJlbmNlIGluIHRhY3RcbiAgICAgICAgICAgIF8uZXh0ZW5kKHRoaXMuJGFwcC5WYXJpYWJsZXMsIGRhdGEuVmFyaWFibGVzKTtcbiAgICAgICAgICAgIF8uZXh0ZW5kKHRoaXMuJGFwcC5BY3Rpb25zLCBkYXRhLkFjdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVMb2dnZWRJblVzZXJWYXJpYWJsZSgpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTdXBwb3J0ZWRMb2NhbGVWYXJpYWJsZSgpO1xuICAgICAgICAgICAgdGhpcy5hcHBWYXJpYWJsZXNMb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5hcHBWYXJpYWJsZXNGaXJlZCA9IGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChpc0RlZmluZWQodmFyaWFibGVzKSkge1xuICAgICAgICAgICAgaW5pdCh2YXJpYWJsZXMpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAuZ2V0KCcuL2FwcC52YXJpYWJsZXMuanNvbicpLnRoZW4ocmVzcG9uc2UgPT4gaW5pdChyZXNwb25zZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGdldHRlciBhbmQgc2V0dGVyIGZvciB0aGUgcHJvcGVydHkgYXBwVmFyaWFibGVzRmlyZWRcbiAgICAgKiB0aGlzIGZsYWcgZGV0ZXJtaW5lcyBpZiB0aGUgYXBwIHZhcmlhYmxlcyh3aXRoIHN0YXJ0VXBkYXRlOnRydWUpIGhhdmUgYmVlbiBmaXJlZFxuICAgICAqIHRoZXkgc2hvdWxkIGdldCBmaXJlZCBvbmx5IG9uY2UgdGhyb3VnaCBhcHAgbGlmZWN5Y2xlXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0ZpcmVkXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNBcHBWYXJpYWJsZXNGaXJlZChpc0ZpcmVkPzogYm9vbGVhbikge1xuICAgICAgICBpZiAoaXNEZWZpbmVkKGlzRmlyZWQpKSB7XG4gICAgICAgICAgICB0aGlzLmFwcFZhcmlhYmxlc0ZpcmVkID0gaXNGaXJlZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5hcHBWYXJpYWJsZXNGaXJlZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNsZWFyTG9nZ2VkSW5Vc2VyVmFyaWFibGUodmFyaWFibGUpIHtcbiAgICAgICAgdmFyaWFibGUuaXNBdXRoZW50aWNhdGVkID0gZmFsc2U7XG4gICAgICAgIHZhcmlhYmxlLnJvbGVzICAgICAgICAgICA9IFtdO1xuICAgICAgICB2YXJpYWJsZS5uYW1lICAgICAgICAgICAgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhcmlhYmxlLmlkICAgICAgICAgICAgICA9IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyaWFibGUudGVuYW50SWQgICAgICAgID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlTG9nZ2VkSW5Vc2VyVmFyaWFibGUoKSB7XG4gICAgICAgIGNvbnN0IGxvZ2dlZEluVXNlciA9IF8uZ2V0KHRoaXMuJGFwcCwgJ1ZhcmlhYmxlcy5sb2dnZWRJblVzZXIuZGF0YVNldCcpO1xuXG4gICAgICAgIC8vIHNhbml0eSBjaGVja1xuICAgICAgICBpZiAoIWxvZ2dlZEluVXNlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJHNlY3VyaXR5LmxvYWQoKS50aGVuKCgpPT57XG4gICAgICAgICAgICBjb25zdCBzZWN1cml0eUNvbmZpZyA9IHRoaXMuJHNlY3VyaXR5LmdldCgpO1xuICAgICAgICAgICAgaWYgKHNlY3VyaXR5Q29uZmlnICYmIHNlY3VyaXR5Q29uZmlnLnNlY3VyaXR5RW5hYmxlZCAmJiBzZWN1cml0eUNvbmZpZy5hdXRoZW50aWNhdGVkKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VkSW5Vc2VyLmlzQXV0aGVudGljYXRlZCA9IHNlY3VyaXR5Q29uZmlnLmF1dGhlbnRpY2F0ZWQ7XG4gICAgICAgICAgICAgICAgbG9nZ2VkSW5Vc2VyLnJvbGVzICAgICAgICAgICA9IHNlY3VyaXR5Q29uZmlnLnVzZXJJbmZvLnVzZXJSb2xlcztcbiAgICAgICAgICAgICAgICBsb2dnZWRJblVzZXIubmFtZSAgICAgICAgICAgID0gc2VjdXJpdHlDb25maWcudXNlckluZm8udXNlck5hbWU7XG4gICAgICAgICAgICAgICAgbG9nZ2VkSW5Vc2VyLmlkICAgICAgICAgICAgICA9IHNlY3VyaXR5Q29uZmlnLnVzZXJJbmZvLnVzZXJJZDtcbiAgICAgICAgICAgICAgICBsb2dnZWRJblVzZXIudGVuYW50SWQgICAgICAgID0gc2VjdXJpdHlDb25maWcudXNlckluZm8udGVuYW50SWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJMb2dnZWRJblVzZXJWYXJpYWJsZShsb2dnZWRJblVzZXIpO1xuICAgICAgICAgICAgICAgIGxvZ2dlZEluVXNlci5pc1NlY3VyaXR5RW5hYmxlZCA9IHNlY3VyaXR5Q29uZmlnICYmIHNlY3VyaXR5Q29uZmlnLnNlY3VyaXR5RW5hYmxlZDtcbiAgICAgICAgICAgICAgICB0aHJvdyBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgbG9nZ2VkSW5Vc2VyLmlzQXV0aGVudGljYXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgbG9nZ2VkSW5Vc2VyLnJvbGVzICAgICAgICAgICA9IFtdO1xuICAgICAgICAgICAgbG9nZ2VkSW5Vc2VyLm5hbWUgICAgICAgICAgICA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGxvZ2dlZEluVXNlci5pZCAgICAgICAgICAgICAgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBsb2dnZWRJblVzZXIudGVuYW50SWQgICAgICAgID0gdW5kZWZpbmVkO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkaW5nIHRoZSBhcHAgdmFyaWFibGUgc3VwcG9ydGVkIGxvY2FsZSB3aXRoIHRoZSB3bVByb3BlcnRpZXMgaTE4biBEYXRhVmFsdWVzXG4gICAgICpcbiAgICAgKiBUT0RPW1ZpYmh1XTpcbiAgICAgKiBDYW4gd3JpdGUgYSBzaW1wbGUgbWlncmF0aW9uIHRvIHN5bmMgdGhlIHN1cHBvcnRlZExvY2FsZSB2YXJpYWJsZSB3aXRoICdfV01fQVBQX1BST1BFUlRJRVMuc3VwcG9ydGVkTGFuZ3VhZ2VzJ1xuICAgICAqIEhlbmNlLCB0aGlzIG1heSBub3QgYmUgcmVxdWlyZWRcbiAgICAgKlxuICAgICAqL1xuICAgIHVwZGF0ZVN1cHBvcnRlZExvY2FsZVZhcmlhYmxlKCkge1xuICAgICAgICBjb25zdCBzdXBwb3J0ZWRMb2NhbGVWYXIgPSBfLmdldCh0aGlzLiRhcHAsICdWYXJpYWJsZXMuc3VwcG9ydGVkTG9jYWxlJyk7XG4gICAgfVxuXG4gICAgaGFuZGxlU1NPTG9naW4oY29uZmlnKSB7XG4gICAgICAgIGNvbnN0IFNTT19VUkwgPSAnc2VydmljZXMvc2VjdXJpdHkvc3NvbG9naW4nLFxuICAgICAgICAgICAgUFJFVklFV19XSU5ET1dfTkFNRSA9ICdXTV9QUkVWSUVXX1dJTkRPVyc7XG4gICAgICAgIGxldCBwYWdlLFxuICAgICAgICAgICAgcGFnZVBhcmFtcztcblxuICAgICAgICAvLyBkbyBub3QgcHJvdmlkZSByZWRpcmVjdFRvIHBhZ2UgaWYgZmV0Y2hpbmcgSE9NRSBwYWdlIHJlc3VsdGVkIDQwMVxuICAgICAgICAvLyBvbiBhcHAgbG9hZCwgYnkgZGVmYXVsdCBIb21lIHBhZ2UgaXMgbG9hZGVkXG4gICAgICAgIHBhZ2UgPSB0aGlzLiRzZWN1cml0eS5nZXRSZWRpcmVjdFBhZ2UoY29uZmlnKTtcblxuICAgICAgICBpZiAoQ09OU1RBTlRTLmhhc0NvcmRvdmEpIHtcbiAgICAgICAgICAgIC8vIGdldCBwcmV2aW91c2x5IGxvZ2dlZEluVXNlciBuYW1lIChpZiBhbnkpXG4gICAgICAgICAgICBjb25zdCBsYXN0TG9nZ2VkSW5Vc2VybmFtZSA9IF8uZ2V0KHRoaXMuJHNlY3VyaXR5LmdldCgpLCAndXNlckluZm8udXNlck5hbWUnKTtcbiAgICAgICAgICAgIHRoaXMuJHNlY3VyaXR5LmF1dGhJbkJyb3dzZXIoKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMucmVsb2FkQXBwRGF0YSgpKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJlc2VudExvZ2dlZEluVXNlcm5hbWUgPSBfLmdldCh0aGlzLiRzZWN1cml0eS5nZXQoKSwgJ3VzZXJJbmZvLnVzZXJOYW1lJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmVzZW50TG9nZ2VkSW5Vc2VybmFtZSAmJiBwcmVzZW50TG9nZ2VkSW5Vc2VybmFtZSA9PT0gbGFzdExvZ2dlZEluVXNlcm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlclNlcnZpY2UubmF2aWdhdGUoW3BhZ2VdKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlclNlcnZpY2UubmF2aWdhdGUoW2AvYF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYWdlID0gcGFnZSA/ICc/cmVkaXJlY3RQYWdlPScgKyBlbmNvZGVVUklDb21wb25lbnQocGFnZSkgOiAnJztcbiAgICAgICAgICAgIHBhZ2VQYXJhbXMgPSB0aGlzLiRzZWN1cml0eS5nZXRRdWVyeVN0cmluZyh0aGlzLiRzZWN1cml0eS5nZXRSZWRpcmVjdGVkUm91dGVRdWVyeVBhcmFtcygpKTtcbiAgICAgICAgICAgIHBhZ2VQYXJhbXMgPSBwYWdlUGFyYW1zID8gJz8nICsgcGFnZVBhcmFtcyA6ICcnO1xuICAgICAgICAgICAgLy8gc2hvd2luZyBhIHJlZGlyZWN0aW5nIG1lc3NhZ2VcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQgPSBfLmdldCh0aGlzLmdldEFwcExvY2FsZSgpLCBbJ01FU1NBR0VfTE9HSU5fUkVESVJFQ1RJT04nXSkgfHwgJ1JlZGlyZWN0aW5nIHRvIHNzbyBsb2dpbi4uLic7XG4gICAgICAgICAgICAvLyBhcHBlbmRpbmcgcmVkaXJlY3QgdG8gcGFnZSBhbmQgcGFnZSBwYXJhbXNcbiAgICAgICAgICAgIGNvbnN0IHNzb1VybCA9IHRoaXMuZ2V0RGVwbG95ZWRVUkwoKSArIFNTT19VUkwgKyBwYWdlICsgcGFnZVBhcmFtcztcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiByZW1vdmUgaUZyYW1lIHdoZW4gcmVkaXJlY3RlZCB0byBJZFAgbG9naW4gcGFnZS5cbiAgICAgICAgICAgICAqIHRoaXMgaXMgYmVpbmcgZG9uZSBhcyBJRFBzIGRvIG5vdCBhbGxvdyB0byBnZXQgdGhlbXNlbHZlcyBsb2FkZWQgaW50byBpRnJhbWVzLlxuICAgICAgICAgICAgICogcmVtb3ZlLXRvb2xiYXIgaGFzIGJlZW4gYXNzaWduZWQgd2l0aCBhIHdpbmRvdyBuYW1lIFdNX1BSRVZJRVdfV0lORE9XLCBjaGVjayBpZiB0aGUgaWZyYW1lIGlzIG91ciB0b29sYmFyIHJlbGF0ZWQgYW5kXG4gICAgICAgICAgICAgKiBzYWZlbHkgY2hhbmdlIHRoZSBsb2NhdGlvbiBvZiB0aGUgcGFyZW50IHRvb2xiYXIgd2l0aCBjdXJyZW50IHVybC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5zZWxmICE9PSB3aW5kb3cudG9wICYmIHdpbmRvdy5wYXJlbnQubmFtZSA9PT0gUFJFVklFV19XSU5ET1dfTkFNRSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wYXJlbnQubG9jYXRpb24uaHJlZiA9IHdpbmRvdy5zZWxmLmxvY2F0aW9uLmhyZWY7XG4gICAgICAgICAgICAgICAgd2luZG93LnBhcmVudC5uYW1lID0gJyc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gc3NvVXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyB0aGUgYXBwIHdoZW4gYSBYSFIgcmVxdWVzdCByZXR1cm5zIDQwMSByZXNwb25zZVxuICAgICAqIElmIG5vIHVzZXIgd2FzIGxvZ2dlZCBpbiBiZWZvcmUgNDAxIG9jY3VycmVkLCBGaXJzdCB0aW1lIExvZ2luIGlzIHNpbXVsYXRlZFxuICAgICAqIEVsc2UsIGEgc2Vzc2lvbiB0aW1lb3V0IGhhcyBvY2N1cnJlZCBhbmQgdGhlIHNhbWUgaXMgc2ltdWxhdGVkXG4gICAgICogQHBhcmFtIHBhZ2UgIGlmIHByb3ZpZGVkLCByZXByZXNlbnRzIHRoZSBwYWdlIG5hbWUgZm9yIHdoaWNoIFhIUiByZXF1ZXN0IHJldHVybmVkIDQwMSwgb24gcmUtbG9naW5cbiAgICAgKiAgICAgICAgICAgICAgaWYgbm90IHByb3ZpZGVkLCBhIHNlcnZpY2UgcmVxdWVzdCByZXR1cm5lZCA0MDFcbiAgICAgKiBAcGFyYW0gb25TdWNjZXNzIHN1Y2Nlc3MgaGFuZGxlclxuICAgICAqIEBwYXJhbSBvbkVycm9yIGVycm9yIGhhbmRsZXJcbiAgICAgKi9cbiAgICBoYW5kbGU0MDEocGFnZT8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGxldCBzZXNzaW9uVGltZW91dENvbmZpZyxcbiAgICAgICAgICAgIHNlc3Npb25UaW1lb3V0TWV0aG9kLFxuICAgICAgICAgICAgbG9naW5Db25maWcsXG4gICAgICAgICAgICBsb2dpbk1ldGhvZDtcbiAgICAgICAgY29uc3QgTE9HSU5fTUVUSE9EID0ge1xuICAgICAgICAgICAgICAgICdESUFMT0cnIDogJ0RJQUxPRycsXG4gICAgICAgICAgICAgICAgJ1BBR0UnICAgOiAnUEFHRScsXG4gICAgICAgICAgICAgICAgJ1NTTycgICAgOiAnU1NPJ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLiRzZWN1cml0eS5nZXQoKTtcbiAgICAgICAgbGV0IHF1ZXJ5UGFyYW1zT2JqID0ge307XG4gICAgICAgIGxvZ2luQ29uZmlnID0gY29uZmlnLmxvZ2luQ29uZmlnO1xuICAgICAgICAvLyBpZiB1c2VyIGZvdW5kLCA0MDEgd2FzIHRocm93biBhZnRlciBzZXNzaW9uIHRpbWVcbiAgICAgICAgaWYgKGNvbmZpZy51c2VySW5mbyAmJiBjb25maWcudXNlckluZm8udXNlck5hbWUpIHtcbiAgICAgICAgICAgIGNvbmZpZy5hdXRoZW50aWNhdGVkID0gZmFsc2U7XG4gICAgICAgICAgICBzZXNzaW9uVGltZW91dENvbmZpZyA9IGxvZ2luQ29uZmlnLnNlc3Npb25UaW1lb3V0IHx8IHsndHlwZSc6IExPR0lOX01FVEhPRC5ESUFMT0d9O1xuICAgICAgICAgICAgc2Vzc2lvblRpbWVvdXRNZXRob2QgPSBzZXNzaW9uVGltZW91dENvbmZpZy50eXBlLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICBzd2l0Y2ggKHNlc3Npb25UaW1lb3V0TWV0aG9kKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBMT0dJTl9NRVRIT0QuRElBTE9HOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dMb2dpbkRpYWxvZygpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIExPR0lOX01FVEhPRC5QQUdFOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2UgPSB0aGlzLiRzZWN1cml0eS5nZXRDdXJyZW50Um91dGVQYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcXVlcnlQYXJhbXNPYmpbJ3JlZGlyZWN0VG8nXSA9IHBhZ2U7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZGluZyBxdWVyeSBwYXJhbXMocGFnZSBwYXJhbXMgb2YgcGFnZSBiZWluZyByZWRpcmVjdGVkIHRvKSB0byB0aGUgVVJMLlxuICAgICAgICAgICAgICAgICAgICBxdWVyeVBhcmFtc09iaiA9IF8ubWVyZ2UocXVlcnlQYXJhbXNPYmosIHRoaXMuJHNlY3VyaXR5LmdldFJlZGlyZWN0ZWRSb3V0ZVF1ZXJ5UGFyYW1zKCkpO1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgcmVkaXJlY3QgcGFnZSBzaG91bGQgbm90IGJlIHNhbWUgYXMgc2Vzc2lvbiB0aW1lb3V0IGxvZ2luIHBhZ2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBwYWdlICE9PSBzZXNzaW9uVGltZW91dENvbmZpZy5wYWdlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcm91dGVyLm5hdmlnYXRlKFtzZXNzaW9uVGltZW91dENvbmZpZy5wYWdlTmFtZV0sIHtxdWVyeVBhcmFtczogcXVlcnlQYXJhbXNPYmp9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIExPR0lOX01FVEhPRC5TU086XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlU1NPTG9naW4oY29uZmlnKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldExhbmRpbmdQYWdlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiBubyB1c2VyIGZvdW5kLCA0MDEgd2FzIHRocm93biBmb3IgZmlyc3QgdGltZSBsb2dpblxuICAgICAgICAgICAgbG9naW5NZXRob2QgPSBsb2dpbkNvbmZpZy50eXBlLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICBzd2l0Y2ggKGxvZ2luTWV0aG9kKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBMT0dJTl9NRVRIT0QuRElBTE9HOlxuICAgICAgICAgICAgICAgICAgICAvLyBUaHJvdWdoIGxvZ2luRGlhbG9nLCB1c2VyIHdpbGwgcmVtYWluIGluIHRoZSBjdXJyZW50IHN0YXRlIGFuZCBmYWlsZWQgY2FsbHMgd2lsbCBiZSBleGVjdXRlZCBwb3N0IGxvZ2luIHRocm91Z2ggTG9naW5WYXJpYWJsZVNlcnZpY2UuXG4gICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IHVzZXIgd2lsbCBiZSByZWRpcmVjdGVkIHRvIHJlc3BlY3RpdmUgbGFuZGluZyBwYWdlIG9ubHkgaWYgZGlhbG9nIGlzIG9wZW5lZCBtYW51YWxseShub3QgdGhyb3VnaCBhIGZhaWxlZCA0MDEgY2FsbCkuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9SZWRpcmVjdCh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93TG9naW5EaWFsb2coKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBMT0dJTl9NRVRIT0QuUEFHRTpcbiAgICAgICAgICAgICAgICAgICAgLy8gZG8gbm90IHByb3ZpZGUgcmVkaXJlY3RUbyBwYWdlIGlmIGZldGNoaW5nIEhPTUUgcGFnZSByZXN1bHRlZCA0MDFcbiAgICAgICAgICAgICAgICAgICAgLy8gb24gYXBwIGxvYWQsIGJ5IGRlZmF1bHQgSG9tZSBwYWdlIGlzIGxvYWRlZFxuICAgICAgICAgICAgICAgICAgICBwYWdlID0gdGhpcy4kc2VjdXJpdHkuZ2V0UmVkaXJlY3RQYWdlKGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5UGFyYW1zT2JqWydyZWRpcmVjdFRvJ10gPSBwYWdlO1xuICAgICAgICAgICAgICAgICAgICBxdWVyeVBhcmFtc09iaiA9IF8ubWVyZ2UocXVlcnlQYXJhbXNPYmosIHRoaXMuJHNlY3VyaXR5LmdldFJlZGlyZWN0ZWRSb3V0ZVF1ZXJ5UGFyYW1zKCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRyb3V0ZXIubmF2aWdhdGUoW2xvZ2luQ29uZmlnLnBhZ2VOYW1lXSwge3F1ZXJ5UGFyYW1zOiBxdWVyeVBhcmFtc09ian0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRhcHAubGFuZGluZ1BhZ2VOYW1lID0gbG9naW5Db25maWcucGFnZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTE9HSU5fTUVUSE9ELlNTTzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVTU09Mb2dpbihjb25maWcpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgZGF0YSBkZXBlbmRlbnQgb24gbG9nZ2VkIGluIHVzZXJcbiAgICAgKiBSZWxvYWRzIHNlY3VyaXR5IGNvbmZpZywgbWV0YWRhdGFcbiAgICAgKiBVcGRhdGVzIHRoZSBsb2dnZWRJblVzZXJWYXJpYWJsZVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgICAqL1xuICAgIHJlbG9hZEFwcERhdGEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvYWRTZWN1cml0eUNvbmZpZygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9hZE1ldGFkYXRhKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVMb2dnZWRJblVzZXJWYXJpYWJsZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG5vUmVkaXJlY3QodmFsdWU/OiBib29sZWFuKSB7XG4gICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX25vUmVkaXJlY3Q7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9ub1JlZGlyZWN0ID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzLl9ub1JlZGlyZWN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGludm9rZXMgc2Vzc2lvbiBmYWlsdXJlIHJlcXVlc3RzXG4gICAgICovXG4gICAgZXhlY3V0ZVNlc3Npb25GYWlsdXJlUmVxdWVzdHMoKSB7XG4gICAgICAgIHRoaXMuJGh0dHAuZXhlY3V0ZVNlc3Npb25GYWlsdXJlUmVxdWVzdHMoKTtcbiAgICB9XG5cbiAgICBwdXNoVG9TZXNzaW9uRmFpbHVyZVJlcXVlc3RzKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuJGh0dHAucHVzaFRvU2Vzc2lvbkZhaWx1cmVRdWV1ZShjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldERlcGxveWVkVVJMKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kYXBwLmRlcGxveWVkVXJsID8gdGhpcy4kYXBwLmRlcGxveWVkVXJsIDogJHJvb3RTY29wZS5wcm9qZWN0LmRlcGxveWVkVXJsO1xuICAgIH1cblxuICAgIG5vdGlmeShldmVudE5hbWUsIGRhdGEpIHtcbiAgICAgICAgdGhpcy4kYXBwLm5vdGlmeShldmVudE5hbWUsIGRhdGEpO1xuICAgIH1cblxuICAgIHN1YnNjcmliZShldmVudE5hbWUsIGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGFwcC5zdWJzY3JpYmUoZXZlbnROYW1lLCBkYXRhKTtcbiAgICB9XG5cbiAgICBnZXRBY3RpdmVQYWdlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kYXBwLmFjdGl2ZVBhZ2U7XG4gICAgfVxuXG4gICAgZ2V0QXBwTG9jYWxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kYXBwLmFwcExvY2FsZTtcbiAgICB9XG5cbiAgICBnZXRTZWxlY3RlZExvY2FsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGkxOG4uZ2V0U2VsZWN0ZWRMb2NhbGUoKTtcbiAgICB9XG5cbiAgICBub3RpZnlBcHAodGVtcGxhdGUsIHR5cGUsIHRpdGxlPykge1xuICAgICAgICB0aGlzLiRhcHAubm90aWZ5QXBwKHRlbXBsYXRlLCB0eXBlLCB0aXRsZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpZ2dlcnMgdGhlIG9uQmVmb3JlU2VydmljZSBtZXRob2QgZGVmaW5lZCBpbiBhcHAuanMgb2YgdGhlIGFwcFxuICAgICAqIEBwYXJhbSByZXF1ZXN0UGFyYW1zXG4gICAgICovXG4gICAgYXBwT25CZWZvcmVTZXJ2aWNlQ2FsbChyZXF1ZXN0UGFyYW1zOiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHRyaWdnZXJGbih0aGlzLiRhcHAub25CZWZvcmVTZXJ2aWNlQ2FsbCwgcmVxdWVzdFBhcmFtcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpZ2dlcnMgdGhlIG9uU2VydmljZVN1Y2Nlc3MgbWV0aG9kIGRlZmluZWQgaW4gYXBwLmpzIG9mIHRoZSBhcHBcbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqIEBwYXJhbSB4aHJPYmpcbiAgICAgKi9cbiAgICBhcHBPblNlcnZpY2VTdWNjZXNzKGRhdGE6IGFueSwgeGhyT2JqOiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHRyaWdnZXJGbih0aGlzLiRhcHAub25TZXJ2aWNlU3VjY2VzcywgZGF0YSwgeGhyT2JqKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmlnZ2VycyB0aGUgb25TZXJ2aWNlRXJyb3IgbWV0aG9kIGRlZmluZWQgaW4gYXBwLmpzIG9mIHRoZSBhcHBcbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqIEBwYXJhbSB4aHJPYlxuICAgICAqL1xuICAgIGFwcE9uU2VydmljZUVycm9yKGRhdGE6IGFueSwgeGhyT2I/OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHRyaWdnZXJGbih0aGlzLiRhcHAub25TZXJ2aWNlRXJyb3IsIGRhdGEsIHhock9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmlnZ2VycyB0aGUgYXBwVmFyaWFibGVzUmVhZHkgbWV0aG9kIGRlZmluZWQgaW4gYXBwLmpzIG9mIHRoZSBhcHBcbiAgICAgKi9cbiAgICBhcHBWYXJpYWJsZXNSZWFkeSgpIHtcbiAgICAgICAgdHJpZ2dlckZuKHRoaXMuJGFwcC5vbkFwcFZhcmlhYmxlc1JlYWR5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBwaXBlIGJhc2VkIG9uIHRoZSBpbnB1dFxuICAgICAqL1xuICAgIGdldFBpcGUocGlwZSkge1xuICAgICAgICBpZiAocGlwZSA9PT0gJ2RhdGUnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZGF0ZVBpcGU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNldExhbmRpbmdQYWdlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kc2VjdXJpdHkuZ2V0UGFnZUJ5TG9nZ2VkSW5Vc2VyKCkudGhlbihwID0+IHRoaXMuJGFwcC5sYW5kaW5nUGFnZU5hbWUgPSA8c3RyaW5nPiBwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm4gdHJ1ZSBpZiBwcmVmYWIgdHlwZSBhcHBcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1ByZWZhYlR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRhcHAuaXNQcmVmYWJUeXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybiB0cnVlIGlmIHRlbXBsYXRlIGJ1bmRsZSB0eXBlIGFwcFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzVGVtcGxhdGVCdW5kbGVUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kYXBwLmlzVGVtcGxhdGVCdW5kbGVUeXBlO1xuICAgIH1cblxuICAgIHBvc3RNZXNzYWdlKGNvbnRlbnQpIHtcbiAgICAgICAgd2luZG93LnRvcC5wb3N0TWVzc2FnZShjb250ZW50LCAnKicpO1xuICAgIH1cblxuICAgIHNob3dUZW1wbGF0ZShpZHgpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlc1tpZHhdO1xuICAgICAgICAvLyBzY29wZS5hY3RpdmVUZW1wbGF0ZUluZGV4ID0gaWR4O1xuICAgICAgICB0aGlzLiRyb3V0ZXIubmF2aWdhdGUoW3RlbXBsYXRlLmlkXSk7XG4gICAgfVxuICAgIHBvc3RUZW1wbGF0ZUJ1bmRsZUluZm8oKSB7XG5cbiAgICAgICAgd2luZG93Lm9ubWVzc2FnZSA9IChldnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1zZ0RhdGEgPSBldnQuZGF0YTtcblxuICAgICAgICAgICAgaWYgKCFfLmlzT2JqZWN0KG1zZ0RhdGEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBrZXkgPSBtc2dEYXRhLmtleTtcblxuICAgICAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFBPU1RfTUVTU0FHRVMuSElERV9URU1QTEFURVNfU0hPV19DQVNFOlxuICAgICAgICAgICAgICAgICAgICAvLyBzY29wZS5oaWRlU2hvd0Nhc2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBPU1RfTUVTU0FHRVMuU0VMRUNUX1RFTVBMQVRFOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dUZW1wbGF0ZShtc2dEYXRhLnRlbXBsYXRlSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucG9zdE1lc3NhZ2Uoe2tleTogUE9TVF9NRVNTQUdFUy5PTl9MT0FEfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBmZXRjaENvbnRlbnQoJ2pzb24nLCAnLi9jb25maWcuanNvbicsIHRydWUsIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGVzID0gW107XG4gICAgICAgICAgICBpZiAoIXJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZXMgPSByZXNwb25zZS50ZW1wbGF0ZXM7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3N0TWVzc2FnZSh7J2tleSc6IFBPU1RfTUVTU0FHRVMuVEVNUExBVEVCVU5ETEVfQ09ORklHLCAnY29uZmlnJzogcmVzcG9uc2V9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcG9zdEFwcFR5cGVJbmZvKCkge1xuICAgICAgICBpZiAodGhpcy5pc1RlbXBsYXRlQnVuZGxlVHlwZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3N0VGVtcGxhdGVCdW5kbGVJbmZvKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=