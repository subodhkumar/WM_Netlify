import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MobileRuntimeModule } from '@wm/mobile/runtime';
import { Toast, ToastPackage, ToastrService } from 'ngx-toastr';
import { HttpClient, HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SecurityService, SecurityModule } from '@wm/security';
import { Router, ActivatedRoute, NavigationStart, NavigationCancel, NavigationEnd, NavigationError, RouterModule } from '@angular/router';
import { BsLocaleService, defineLocale, setTheme, BsDropdownModule, CarouselModule, ModalModule, PopoverModule, TooltipModule } from 'ngx-bootstrap';
import { OAuthService, OAuthModule } from '@wm/oAuth';
import { DatePipe, registerLocaleData, AsyncPipe, UpperCasePipe, LowerCasePipe, JsonPipe, SlicePipe, DecimalPipe, PercentPipe, TitleCasePipe, CurrencyPipe, I18nPluralPipe, I18nSelectPipe, KeyValuePipe, NgLocalization, CommonModule } from '@angular/common';
import { debounceTime, filter, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CONSTANTS, $rootScope, routerService, MetadataService, VariablesService, httpService, appManager, VariablesModule } from '@wm/variables';
import { WmHttpRequest, WmHttpResponse, HttpServiceModule } from '@wm/http';
import { WidgetRef, SuffixPipe, ToDatePipe, FileIconClassPipe, FileExtensionFromMimePipe, FilterPipe, FileSizePipe, ToNumberPipe, ToCurrencyPipe, PrefixPipe, TimeFromNowPipe, NumberToStringPipe, StateClassPipe, StringToNumberPipe, PrefabDirective, WmComponentsModule } from '@wm/components';
import { __awaiter } from 'tslib';
import { transpile } from '@wm/transpiler';
import { initComponentsBuildTask } from '@wm/build-task';
import { Injectable, Directive, Input, TemplateRef, ViewContainerRef, Attribute, ComponentFactoryResolver, ElementRef, Inject, Injector, Self, Component, ViewChild, Compiler, ChangeDetectorRef, KeyValueDiffers, ApplicationRef, NgZone, ViewEncapsulation, APP_INITIALIZER, LOCALE_ID, NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, defineInjectable, inject, INJECTOR } from '@angular/core';
import { AbstractDialogService, AbstractHttpService, AbstractI18nService, AbstractSpinnerService, App, fetchContent, isDefined, triggerFn, $appDigest, loadScripts, loadStyleSheets, stringStartsWith, noop, UtilsService, $invokeWatchers, AbstractNavigationService, isMobileApp, muteWatchers, unMuteWatchers, $watch, isIE, getWmProjectProperties, AbstractToasterService, EventNotifier, FieldTypeService, FieldWidgetService, isString, DynamicComponentRefProvider, _WM_APP_PROJECT, AppDefaults, getSessionStorageItem, isMobile, replace, setCSS, setSessionStorageItem, hasCordova, setAppRef, setNgZone, setPipeProvider, addClass, removeClass, extendProto, $parseExpr, CoreModule } from '@wm/core';

var ComponentType;
(function (ComponentType) {
    ComponentType[ComponentType["PAGE"] = 0] = "PAGE";
    ComponentType[ComponentType["PREFAB"] = 1] = "PREFAB";
    ComponentType[ComponentType["PARTIAL"] = 2] = "PARTIAL";
})(ComponentType || (ComponentType = {}));
class ComponentRefProvider {
    clearComponentFactoryRefCache() { }
    ;
}
class PrefabConfigProvider {
}
class AppJSProvider {
}
class AppVariablesProvider {
}
class PartialRefProvider {
}

var POST_MESSAGES;
(function (POST_MESSAGES) {
    POST_MESSAGES["HIDE_TEMPLATES_SHOW_CASE"] = "hide-templates-show-case";
    POST_MESSAGES["SHOW_TEMPLATES_SHOW_CASE"] = "show-templates-show-case";
    POST_MESSAGES["UPDATE_LOCATION"] = "update-location-path";
    POST_MESSAGES["SELECT_TEMPLATE"] = "select-template";
    POST_MESSAGES["TEMPLATEBUNDLE_CONFIG"] = "template-bundle-config";
    POST_MESSAGES["ON_LOAD"] = "on-load";
})(POST_MESSAGES || (POST_MESSAGES = {}));
class AppManagerService {
    constructor($http, $security, $dialog, $router, $app, $variables, $metadata, $spinner, $i18n, $datePipe) {
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
        this.$app.subscribe('toggle-variable-state', (data) => {
            const variable = data.variable, active = data.active;
            if (!_.isEmpty(_.trim(variable.spinnerContext))) {
                if (active) {
                    variable._spinnerId = variable._spinnerId || [];
                    const spinnerId = this.$spinner.show(variable.spinnerMessage, variable._id + '_' + Date.now(), variable.spinnerclass, variable.spinnerContext);
                    variable._spinnerId.push(spinnerId);
                }
                else {
                    this.$spinner.hide(variable._spinnerId.shift());
                }
            }
        });
        this.$app.subscribe('userLoggedIn', () => this.setLandingPage());
        this.$app.subscribe('userLoggedOut', () => this.setLandingPage().then(() => {
            // navigate to the landing page without reloading the window in device.
            if (window['cordova']) {
                this.$router.navigate([`/`]);
            }
        }));
        this.$app.subscribe('http401', (d = {}) => this.handle401(d.page, d.options));
    }
    /**
     * On session timeout, if the session timeout config is set to a dialog, then open login dialog
     */
    showLoginDialog() {
        this.$spinner.hide('globalSpinner');
        // Removing the close all dialogs call, so the existing dialogs remain open and
        // the login dialog comes on top of it.
        this.$dialog.open('CommonLoginDialog');
        // Since the login dialog is closed and opened its updated property isn't read by angular.
        // Hence we trigger the digest cycle
        $appDigest();
    }
    loadAppJS() {
    }
    loadCommonPage() {
    }
    loadSecurityConfig() {
        return this.$security.load().then((r) => {
            if (!this.$app.landingPageName) {
                this.setLandingPage();
            }
            return r;
        });
    }
    loadMetadata() {
        return this.$metadata.load();
    }
    loadAppVariables(variables) {
        if (this.appVariablesLoaded) {
            return Promise.resolve();
        }
        const init = response => {
            const data = this.$variables.register('app', response, this.$app);
            // not assigning directly to this.$app to keep the reference in tact
            _.extend(this.$app.Variables, data.Variables);
            _.extend(this.$app.Actions, data.Actions);
            this.updateLoggedInUserVariable();
            this.updateSupportedLocaleVariable();
            this.appVariablesLoaded = true;
            this.appVariablesFired = false;
        };
        if (isDefined(variables)) {
            init(variables);
            return Promise.resolve();
        }
        return this.$http.get('./app.variables.json').then(response => init(response));
    }
    /**
     * getter and setter for the property appVariablesFired
     * this flag determines if the app variables(with startUpdate:true) have been fired
     * they should get fired only once through app lifecycle
     * @param {boolean} isFired
     * @returns {boolean}
     */
    isAppVariablesFired(isFired) {
        if (isDefined(isFired)) {
            this.appVariablesFired = isFired;
        }
        return this.appVariablesFired;
    }
    clearLoggedInUserVariable(variable) {
        variable.isAuthenticated = false;
        variable.roles = [];
        variable.name = undefined;
        variable.id = undefined;
        variable.tenantId = undefined;
    }
    updateLoggedInUserVariable() {
        const loggedInUser = _.get(this.$app, 'Variables.loggedInUser.dataSet');
        // sanity check
        if (!loggedInUser) {
            return;
        }
        this.$security.load().then(() => {
            const securityConfig = this.$security.get();
            if (securityConfig && securityConfig.securityEnabled && securityConfig.authenticated) {
                loggedInUser.isAuthenticated = securityConfig.authenticated;
                loggedInUser.roles = securityConfig.userInfo.userRoles;
                loggedInUser.name = securityConfig.userInfo.userName;
                loggedInUser.id = securityConfig.userInfo.userId;
                loggedInUser.tenantId = securityConfig.userInfo.tenantId;
            }
            else {
                this.clearLoggedInUserVariable(loggedInUser);
                loggedInUser.isSecurityEnabled = securityConfig && securityConfig.securityEnabled;
                throw null;
            }
        }).catch(err => {
            loggedInUser.isAuthenticated = false;
            loggedInUser.roles = [];
            loggedInUser.name = undefined;
            loggedInUser.id = undefined;
            loggedInUser.tenantId = undefined;
        });
    }
    /**
     * Overriding the app variable supported locale with the wmProperties i18n DataValues
     *
     * TODO[Vibhu]:
     * Can write a simple migration to sync the supportedLocale variable with '_WM_APP_PROPERTIES.supportedLanguages'
     * Hence, this may not be required
     *
     */
    updateSupportedLocaleVariable() {
        const supportedLocaleVar = _.get(this.$app, 'Variables.supportedLocale');
    }
    handleSSOLogin(config) {
        const SSO_URL = 'services/security/ssologin', PREVIEW_WINDOW_NAME = 'WM_PREVIEW_WINDOW';
        let page, pageParams;
        // do not provide redirectTo page if fetching HOME page resulted 401
        // on app load, by default Home page is loaded
        page = this.$security.getRedirectPage(config);
        if (CONSTANTS.hasCordova) {
            // get previously loggedInUser name (if any)
            const lastLoggedInUsername = _.get(this.$security.get(), 'userInfo.userName');
            this.$security.authInBrowser()
                .then(() => this.reloadAppData())
                .then(() => {
                const presentLoggedInUsername = _.get(this.$security.get(), 'userInfo.userName');
                if (presentLoggedInUsername && presentLoggedInUsername === lastLoggedInUsername) {
                    routerService.navigate([page]);
                }
                else {
                    routerService.navigate([`/`]);
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
            const ssoUrl = this.getDeployedURL() + SSO_URL + page + pageParams;
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
    }
    /**
     * Handles the app when a XHR request returns 401 response
     * If no user was logged in before 401 occurred, First time Login is simulated
     * Else, a session timeout has occurred and the same is simulated
     * @param page  if provided, represents the page name for which XHR request returned 401, on re-login
     *              if not provided, a service request returned 401
     * @param onSuccess success handler
     * @param onError error handler
     */
    handle401(page, options) {
        let sessionTimeoutConfig, sessionTimeoutMethod, loginConfig, loginMethod;
        const LOGIN_METHOD = {
            'DIALOG': 'DIALOG',
            'PAGE': 'PAGE',
            'SSO': 'SSO'
        };
        const config = this.$security.get();
        let queryParamsObj = {};
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
    }
    /**
     * Updates data dependent on logged in user
     * Reloads security config, metadata
     * Updates the loggedInUserVariable
     * @returns {Promise<void>}
     */
    reloadAppData() {
        return this.loadSecurityConfig().then(() => {
            return this.loadMetadata().then(() => {
                this.updateLoggedInUserVariable();
            });
        });
    }
    noRedirect(value) {
        if (_.isUndefined(value)) {
            return this._noRedirect;
        }
        this._noRedirect = value;
        return this._noRedirect;
    }
    /**
     * invokes session failure requests
     */
    executeSessionFailureRequests() {
        this.$http.executeSessionFailureRequests();
    }
    pushToSessionFailureRequests(callback) {
        this.$http.pushToSessionFailureQueue(callback);
    }
    getDeployedURL() {
        return this.$app.deployedUrl ? this.$app.deployedUrl : $rootScope.project.deployedUrl;
    }
    notify(eventName, data) {
        this.$app.notify(eventName, data);
    }
    subscribe(eventName, data) {
        return this.$app.subscribe(eventName, data);
    }
    getActivePage() {
        return this.$app.activePage;
    }
    getAppLocale() {
        return this.$app.appLocale;
    }
    getSelectedLocale() {
        return this.$i18n.getSelectedLocale();
    }
    notifyApp(template, type, title) {
        this.$app.notifyApp(template, type, title);
    }
    /**
     * Triggers the onBeforeService method defined in app.js of the app
     * @param requestParams
     */
    appOnBeforeServiceCall(requestParams) {
        return triggerFn(this.$app.onBeforeServiceCall, requestParams);
    }
    /**
     * Triggers the onServiceSuccess method defined in app.js of the app
     * @param data
     * @param xhrObj
     */
    appOnServiceSuccess(data, xhrObj) {
        return triggerFn(this.$app.onServiceSuccess, data, xhrObj);
    }
    /**
     * Triggers the onServiceError method defined in app.js of the app
     * @param data
     * @param xhrOb
     */
    appOnServiceError(data, xhrOb) {
        return triggerFn(this.$app.onServiceError, data, xhrOb);
    }
    /**
     * Triggers the appVariablesReady method defined in app.js of the app
     */
    appVariablesReady() {
        triggerFn(this.$app.onAppVariablesReady);
    }
    /**
     * Returns the pipe based on the input
     */
    getPipe(pipe) {
        if (pipe === 'date') {
            return this.$datePipe;
        }
    }
    setLandingPage() {
        return this.$security.getPageByLoggedInUser().then(p => this.$app.landingPageName = p);
    }
    /**
     * return true if prefab type app
     * @returns {boolean}
     */
    isPrefabType() {
        return this.$app.isPrefabType;
    }
    /**
     * return true if template bundle type app
     * @returns {boolean}
     */
    isTemplateBundleType() {
        return this.$app.isTemplateBundleType;
    }
    postMessage(content) {
        window.top.postMessage(content, '*');
    }
    showTemplate(idx) {
        const template = this.templates[idx];
        // scope.activeTemplateIndex = idx;
        this.$router.navigate([template.id]);
    }
    postTemplateBundleInfo() {
        window.onmessage = (evt) => {
            const msgData = evt.data;
            if (!_.isObject(msgData)) {
                return;
            }
            const key = msgData.key;
            switch (key) {
                case POST_MESSAGES.HIDE_TEMPLATES_SHOW_CASE:
                    // scope.hideShowCase = true;
                    break;
                case POST_MESSAGES.SELECT_TEMPLATE:
                    this.showTemplate(msgData.templateIndex);
                    break;
            }
        };
        setTimeout(() => {
            this.postMessage({ key: POST_MESSAGES.ON_LOAD });
        });
        return fetchContent('json', './config.json', true, response => {
            this.templates = [];
            if (!response.error) {
                this.templates = response.templates;
                this.postMessage({ 'key': POST_MESSAGES.TEMPLATEBUNDLE_CONFIG, 'config': response });
            }
        });
    }
    postAppTypeInfo() {
        if (this.isTemplateBundleType()) {
            return this.postTemplateBundleInfo();
        }
    }
}
AppManagerService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
AppManagerService.ctorParameters = () => [
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
];

const isPrefabInPreview = (prefabName) => prefabName === '__self__';
const getPrefabBaseUrl = (prefabName) => isPrefabInPreview(prefabName) ? '.' : `app/prefabs/${prefabName}`;
const getPrefabConfigUrl = (prefabName) => `${getPrefabBaseUrl(prefabName)}/config.json`;
const getPrefabMinJsonUrl = (prefabName) => `${getPrefabBaseUrl(prefabName)}/pages/Main/page.min.json`;

const prefabsWithError = new Set();
const inProgress = new Map();
const resolvedPrefabs = new Set();
const getPrefabResourceUrl = (resourcePath, resourceBasePath) => {
    let _url = resourcePath;
    if (!stringStartsWith(resourcePath, 'http://|https://|//')) {
        _url = (resourceBasePath + _url).replace('//', '/');
    }
    return _url;
};
const ɵ0 = getPrefabResourceUrl;
class PrefabManagerService {
    constructor($metadata, prefabConfigProvider) {
        this.$metadata = $metadata;
        this.prefabConfigProvider = prefabConfigProvider;
    }
    getConfig(prefabName) {
        return this.prefabConfigProvider.getConfig(prefabName);
    }
    loadServiceDefs(prefabName) {
        return isPrefabInPreview(prefabName) ? Promise.resolve() : this.$metadata.load(prefabName);
    }
    loadStyles(prefabName, { resources: { styles } } = { resources: { styles: [] } }) {
        const baseUrl = getPrefabBaseUrl(prefabName);
        const _styles = styles.map(url => {
            if (!_.endsWith(url, '/pages/Main/Main.css')) {
                return getPrefabResourceUrl(url, baseUrl);
            }
            return undefined;
        }).filter(url => !!url);
        loadStyleSheets(_styles);
        return Promise.resolve();
    }
    // TODO [Vinay] - implement onPrefabResourceLoad
    loadScripts(prefabName, { resources: { scripts } } = { resources: { scripts: [] } }) {
        const baseUrl = getPrefabBaseUrl(prefabName);
        const _scripts = scripts.map(url => getPrefabResourceUrl(url, baseUrl));
        return loadScripts(_scripts);
    }
    setInProgress(prefabName) {
        let _res;
        let _rej;
        const _promise = new Promise((res, rej) => {
            _res = res;
            _rej = rej;
        });
        _promise.resolve = _res;
        _promise.reject = _rej;
        inProgress.set(prefabName, _promise);
    }
    resolveInProgress(prefabName) {
        if (inProgress.get(prefabName)) {
            inProgress.get(prefabName).resolve();
            inProgress.delete(prefabName);
        }
    }
    loadDependencies(prefabName) {
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
            .then(config => {
            return Promise.all([
                this.loadStyles(prefabName, config),
                this.loadScripts(prefabName, config),
                this.loadServiceDefs(prefabName)
            ]).then(() => {
                this.resolveInProgress(prefabName);
                resolvedPrefabs.add(prefabName);
            });
        });
    }
}
PrefabManagerService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
PrefabManagerService.ctorParameters = () => [
    { type: MetadataService },
    { type: PrefabConfigProvider }
];

class FragmentMonitor {
    constructor() {
        this.fragments = 0;
        this.fragmentsLoaded$ = new Subject();
    }
    init() {
        // console.log(`inside fragmentMonitor: Page-${(this as any).pageName}, Partial-${(this as any).partialName}`);
        this.viewInit$.subscribe(noop, noop, () => {
            this.isViewInitialized = true;
            this.isReady();
        });
    }
    registerFragment() {
        this.fragments++;
    }
    resolveFragment() {
        this.fragments--;
        this.isReady();
    }
    isReady() {
        if (this.isViewInitialized && !this.fragments) {
            this.registerFragment = noop;
            this.resolveFragment = noop;
            this.fragmentsLoaded$.complete();
        }
    }
}

const commonPartialWidgets = {};
class BasePartialComponent extends FragmentMonitor {
    constructor() {
        super(...arguments);
        this.destroy$ = new Subject();
        this.viewInit$ = new Subject();
    }
    getContainerWidgetInjector() {
        return this.containerWidget.inj || this.containerWidget.injector;
    }
    init() {
        this.App = this.injector.get(App);
        this.containerWidget = this.injector.get(WidgetRef);
        this.i18nService = this.injector.get(AbstractI18nService);
        if (this.getContainerWidgetInjector().view.component.registerFragment) {
            this.getContainerWidgetInjector().view.component.registerFragment();
        }
        this.initUserScript();
        this.registerWidgets();
        this.initVariables();
        this.activePageName = this.App.activePageName; // Todo: remove this
        this.registerPageParams();
        this.defineI18nProps();
        this.viewInit$.subscribe(noop, noop, () => {
            this.pageParams = this.containerWidget.partialParams;
        });
        super.init();
    }
    registerWidgets() {
        if (this.partialName === 'Common') {
            this.Widgets = commonPartialWidgets;
        }
        else {
            this.Widgets = Object.create(commonPartialWidgets);
        }
        this.containerWidget.Widgets = this.Widgets;
    }
    registerDestroyListener(fn) {
        this.destroy$.subscribe(noop, noop, () => fn());
    }
    initUserScript() {
        try {
            this.evalUserScript(this, this.App, this.injector.get(UtilsService));
        }
        catch (e) {
            console.error(`Error in evaluating partial (${this.partialName}) script\n`, e);
        }
    }
    initVariables() {
        const variablesService = this.injector.get(VariablesService);
        // get variables and actions instances for the page
        const variableCollection = variablesService.register(this.partialName, this.getVariables(), this);
        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        this.Variables = Object.create(this.App.Variables);
        this.Actions = Object.create(this.App.Actions);
        this.containerWidget.Variables = this.Variables;
        this.containerWidget.Actions = this.Actions;
        // assign all the page variables to the pageInstance
        Object.entries(variableCollection.Variables).forEach(([name, variable]) => this.Variables[name] = variable);
        Object.entries(variableCollection.Actions).forEach(([name, action]) => this.Actions[name] = action);
        this.viewInit$.subscribe(noop, noop, () => {
            // TEMP: triggering watchers so variables watching over params are updated
            $invokeWatchers(true, true);
            variableCollection.callback(variableCollection.Variables).catch(noop);
            variableCollection.callback(variableCollection.Actions);
        });
    }
    registerPageParams() {
        this.pageParams = this.containerWidget.partialParams;
    }
    defineI18nProps() {
        this.appLocale = this.i18nService.getAppLocale();
    }
    invokeOnReady() {
        this.onReady();
        if (this.getContainerWidgetInjector().view.component.resolveFragment) {
            this.getContainerWidgetInjector().view.component.resolveFragment();
        }
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.viewInit$.complete();
            this.fragmentsLoaded$.subscribe(noop, noop, () => this.invokeOnReady());
        }, 100);
    }
    ngOnDestroy() {
        this.destroy$.complete();
    }
    onReady() {
    }
}

class BasePageComponent extends FragmentMonitor {
    constructor() {
        super(...arguments);
        this.startupVariablesLoaded = false;
        this.pageTransitionCompleted = false;
        this.destroy$ = new Subject();
        this.viewInit$ = new Subject();
    }
    init() {
        muteWatchers();
        this.App = this.injector.get(App);
        this.route = this.injector.get(ActivatedRoute);
        this.appManager = this.injector.get(AppManagerService);
        this.navigationService = this.injector.get(AbstractNavigationService);
        this.i18nService = this.injector.get(AbstractI18nService);
        this.router = this.injector.get(Router);
        this.initUserScript();
        this.registerWidgets();
        this.initVariables();
        this.App.lastActivePageName = this.App.activePageName;
        this.App.activePageName = this.pageName;
        this.App.activePage = this;
        this.activePageName = this.pageName; // Todo: remove this
        this.registerPageParams();
        this.defineI18nProps();
        super.init();
    }
    registerWidgets() {
        // common partial widgets should be accessible from page
        this.Widgets = Object.create(commonPartialWidgets);
        // expose current page widgets on app
        this.App.Widgets = Object.create(this.Widgets);
    }
    initUserScript() {
        try {
            this.evalUserScript(this, this.App, this.injector.get(UtilsService));
        }
        catch (e) {
            console.error(`Error in evaluating page (${this.pageName}) script\n`, e);
        }
    }
    registerPageParams() {
        const subscription = this.route.queryParams.subscribe(params => this.pageParams = params);
        this.registerDestroyListener(() => subscription.unsubscribe());
    }
    registerDestroyListener(fn) {
        this.destroy$.subscribe(noop, noop, () => fn());
    }
    defineI18nProps() {
        this.appLocale = this.i18nService.getAppLocale();
    }
    initVariables() {
        const variablesService = this.injector.get(VariablesService);
        // get variables and actions instances for the page
        const variableCollection = variablesService.register(this.pageName, this.getVariables(), this);
        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        this.Variables = Object.create(this.App.Variables);
        this.Actions = Object.create(this.App.Actions);
        // assign all the page variables to the pageInstance
        Object.entries(variableCollection.Variables).forEach(([name, variable]) => this.Variables[name] = variable);
        Object.entries(variableCollection.Actions).forEach(([name, action]) => this.Actions[name] = action);
        const subscription = this.viewInit$.subscribe(noop, noop, () => {
            if (!this.appManager.isAppVariablesFired()) {
                variableCollection.callback(this.App.Variables).catch(noop).then(() => {
                    this.appManager.notify('app-variables-data-loaded', { pageName: this.pageName });
                });
                variableCollection.callback(this.App.Actions);
                this.appManager.appVariablesReady();
                this.appManager.isAppVariablesFired(true);
            }
            variableCollection.callback(variableCollection.Variables)
                .catch(noop)
                .then(() => {
                this.appManager.notify('page-variables-data-loaded', { pageName: this.pageName });
                this.startupVariablesLoaded = true;
                // hide the loader only after the some setTimeout for smooth page load.
                setTimeout(() => {
                    this.showPageContent = true;
                }, 100);
            });
            variableCollection.callback(variableCollection.Actions);
            subscription.unsubscribe();
        });
    }
    runPageTransition(transition) {
        return new Promise(resolve => {
            const $target = $('app-page-outlet:first');
            if (transition) {
                const onTransitionEnd = () => {
                    if (resolve) {
                        $target.off('animationend', onTransitionEnd);
                        $target.removeClass(transition);
                        $target.children().first().remove();
                        resolve();
                        resolve = null;
                    }
                };
                transition = 'page-transition page-transition-' + transition;
                $target.addClass(transition);
                $target.on('animationend', onTransitionEnd);
                // Wait for a maximum of 1 second for transition to end.
                setTimeout(onTransitionEnd, 1000);
            }
            else {
                resolve();
            }
        });
    }
    invokeOnReady() {
        this.onReady();
        (this.App.onPageReady || noop)(this.pageName, this);
        this.appManager.notify('pageReady', { 'name': this.pageName, instance: this });
    }
    ngAfterViewInit() {
        const transition = this.navigationService.getPageTransition();
        if (transition) {
            const pageOutlet = $('app-page-outlet:first');
            pageOutlet.prepend(pageOutlet.children().first().clone());
        }
        this.runPageTransition(transition).then(() => {
            this.pageTransitionCompleted = true;
            this.compilePageContent = true;
        });
        setTimeout(() => {
            unMuteWatchers();
            this.viewInit$.complete();
            if (isMobileApp()) {
                this.onPageContentReady = () => {
                    this.fragmentsLoaded$.subscribe(noop, noop, () => {
                        this.invokeOnReady();
                    });
                    this.onPageContentReady = noop;
                };
            }
            else {
                this.fragmentsLoaded$.subscribe(noop, noop, () => this.invokeOnReady());
            }
        }, 300);
    }
    ngOnDestroy() {
        this.destroy$.complete();
    }
    onReady() { }
    onBeforePageLeave() { }
    onPageContentReady() { }
}

class BasePrefabComponent extends FragmentMonitor {
    constructor() {
        super(...arguments);
        this.destroy$ = new Subject();
        this.viewInit$ = new Subject();
    }
    getContainerWidgetInjector() {
        return this.containerWidget.inj || this.containerWidget.injector;
    }
    init() {
        this.App = this.injector.get(App);
        this.containerWidget = this.injector.get(WidgetRef);
        this.prefabMngr = this.injector.get(PrefabManagerService);
        this.i18nService = this.injector.get(AbstractI18nService);
        if (this.getContainerWidgetInjector().view.component.registerFragment) {
            this.getContainerWidgetInjector().view.component.registerFragment();
        }
        this.initUserScript();
        this.registerWidgets();
        this.initVariables();
        this.registerProps();
        this.defineI18nProps();
        super.init();
    }
    registerWidgets() {
        this.Widgets = {};
    }
    initUserScript() {
        try {
            this.evalUserScript(this, this.App, this.injector.get(UtilsService));
        }
        catch (e) {
            console.error(`Error in evaluating prefab (${this.prefabName}) script\n`, e);
        }
    }
    registerChangeListeners() {
        this.containerWidget.registerPropertyChangeListener(this.onPropertyChange);
        this.containerWidget.registerStyleChangeListener(this.onPropertyChange);
    }
    registerDestroyListener(fn) {
        this.destroy$.subscribe(noop, noop, () => fn());
    }
    defineI18nProps() {
        this.appLocale = this.i18nService.getPrefabLocaleBundle(this.prefabName);
    }
    registerProps() {
        this.prefabMngr.getConfig(this.prefabName)
            .then(config => {
            if (config) {
                this.displayName = config.displayName;
                Object.entries((config.properties || {}))
                    .forEach(([key, prop]) => {
                    let expr;
                    const value = _.trim(prop.value);
                    if (_.startsWith(value, 'bind:')) {
                        expr = value.replace('bind:', '');
                    }
                    Object.defineProperty(this, key, {
                        get: () => this.containerWidget[key],
                        set: nv => this.containerWidget.widget[key] = nv
                    });
                    if (expr) {
                        this.registerDestroyListener($watch(expr, this, {}, nv => this.containerWidget.widget[key] = nv));
                    }
                });
                Object.entries((config.events || {}))
                    .forEach(([key, prop]) => {
                    this[key] = (...args) => {
                        const eventName = key.substr(2).toLowerCase();
                        this.containerWidget.invokeEventCallback(eventName, { $event: args[0], $data: args[1] });
                    };
                });
                Object.entries((config.methods || {}))
                    .forEach(([key, prop]) => {
                    this.containerWidget[key] = (...args) => {
                        try {
                            if (this[key]) {
                                return this[key].apply(this, args);
                            }
                        }
                        catch (e) {
                            console.warn(`error in executing prefab-${this.prefabName} method-${key}`);
                        }
                    };
                });
            }
            this.containerWidget.setProps(config);
            // Reassigning the proxy handler for prefab inbound properties as we
            // will get them only after the prefab config call.
            if (isIE()) {
                this.containerWidget.widget = this.containerWidget.createProxy();
            }
        });
    }
    initVariables() {
        const variablesService = this.injector.get(VariablesService);
        // get variables and actions instances for the page
        const variableCollection = variablesService.register(this.prefabName, this.getVariables(), this);
        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        this.Variables = {};
        this.Actions = {};
        // assign all the page variables to the pageInstance
        Object.entries(variableCollection.Variables).forEach(([name, variable]) => this.Variables[name] = variable);
        Object.entries(variableCollection.Actions).forEach(([name, action]) => this.Actions[name] = action);
        this.viewInit$.subscribe(noop, noop, () => {
            variableCollection.callback(variableCollection.Variables).catch(noop);
            variableCollection.callback(variableCollection.Actions);
        });
    }
    invokeOnReady() {
        // triggering watchers so variables and propertiers watching over an expression are updated
        $invokeWatchers(true, true);
        this.onReady();
        if (this.getContainerWidgetInjector().view.component.resolveFragment) {
            this.getContainerWidgetInjector().view.component.resolveFragment();
        }
        this.containerWidget.invokeEventCallback('load');
    }
    ngAfterViewInit() {
        this.viewInit$.complete();
        this.registerChangeListeners();
        setTimeout(() => {
            this.fragmentsLoaded$.subscribe(noop, noop, () => this.invokeOnReady());
        }, 100);
    }
    ngOnDestroy() {
        this.containerWidget.invokeEventCallback('destroy');
        this.destroy$.complete();
    }
    // user overrides this
    onPropertyChange() { }
    onReady() { }
}

var USER_ROLE;
(function (USER_ROLE) {
    USER_ROLE["EVERYONE"] = "Everyone";
    USER_ROLE["ANONYMOUS"] = "Anonymous";
    USER_ROLE["AUTHENTICATED"] = "Authenticated";
})(USER_ROLE || (USER_ROLE = {}));
class AccessrolesDirective {
    constructor(templateRef, viewContainerRef, securityService) {
        this.templateRef = templateRef;
        this.viewContainerRef = viewContainerRef;
        this.securityService = securityService;
        this.processed = false;
        const securityConfig = this.securityService.get();
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
    getWidgetRolesArrayFromStr(val) {
        const UNICODE_COMMA_REGEX = /&#44;/g;
        val = val || '';
        if (val === '') {
            return [];
        }
        // replace the unicode equivalent of comma with comma
        return _.split(val, ',').map(function (v) {
            return _.trim(v).replace(UNICODE_COMMA_REGEX, ',');
        });
    }
    /**
     * Returns true if roles in first arrays is
     * @param widgetRoles
     * @param userRoles
     * @returns {any}
     */
    matchRoles(widgetRoles, userRoles) {
        return widgetRoles.some(function (item) {
            return _.includes(userRoles, item);
        });
    }
    /**
     * Decides whether the current logged in user has access to widget or not
     * @param widgetRoles
     * @param userRoles
     * @returns {any}
     */
    hasAccessToWidget(widgetRoles, userRoles) {
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
    }
    set accessroles(roles) {
        // flag to compute the directive only once
        if (this.processed) {
            return;
        }
        this.processed = true;
        const widgetRoles = this.getWidgetRolesArrayFromStr(roles);
        const isAccessible = !this.securityEnabled || this.hasAccessToWidget(widgetRoles, this.userRoles);
        if (isAccessible) {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
        }
        else {
            this.viewContainerRef.clear();
        }
    }
}
AccessrolesDirective.decorators = [
    { type: Directive, args: [{
                selector: '[accessroles]'
            },] }
];
/** @nocollapse */
AccessrolesDirective.ctorParameters = () => [
    { type: TemplateRef },
    { type: ViewContainerRef },
    { type: SecurityService }
];
AccessrolesDirective.propDecorators = {
    accessroles: [{ type: Input }]
};

class PartialContainerDirective {
    constructor(componentInstance, vcRef, elRef, inj, app, _content, resolver, componentRefProvider, partialRefProvider) {
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
        componentInstance.registerPropertyChangeListener((key, nv, ov) => {
            if (key === 'content') {
                if (componentInstance.$lazyLoad) {
                    componentInstance.$lazyLoad = () => {
                        this.renderPartial(nv);
                        componentInstance.$lazyLoad = noop;
                    };
                }
                else {
                    this.renderPartial(nv);
                }
            }
        });
        const subscription = componentInstance.params$
            .pipe(filter(() => this.contentInitialized), debounceTime(200))
            .subscribe(() => this.renderPartial(componentInstance.content));
        // reload the partial content on partial param change
        componentInstance.registerDestroyListener(() => subscription.unsubscribe());
    }
    get name() {
        return this.componentInstance.name;
    }
    _renderPartial(nv) {
        return __awaiter(this, void 0, void 0, function* () {
            // destroy the existing partial
            this.vcRef.clear();
            // when the container-target is inside the component template, it can be queried after viewInit of the component.
            $invokeWatchers(true);
            const componentFactory = yield this.partialRefProvider.getComponentFactoryRef(nv, ComponentType.PARTIAL);
            if (componentFactory) {
                const instanceRef = this.vcRef.createComponent(componentFactory, 0, this.inj);
                if (!this.$target) {
                    this.$target = this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement;
                }
                this.$target.innerHTML = '';
                this.$target.appendChild(instanceRef.location.nativeElement);
                this.contentInitialized = true;
                setTimeout(() => this.onLoadSuccess(), 200);
            }
        });
    }
    onLoadSuccess() {
        this.componentInstance.invokeEventCallback('load');
        this.app.notify('partialLoaded');
    }
}
PartialContainerDirective.decorators = [
    { type: Directive, args: [{
                selector: '[partialContainer]'
            },] }
];
/** @nocollapse */
PartialContainerDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] },
    { type: ViewContainerRef },
    { type: ElementRef },
    { type: Injector },
    { type: App },
    { type: String, decorators: [{ type: Attribute, args: ['content',] }] },
    { type: ComponentFactoryResolver },
    { type: ComponentRefProvider },
    { type: PartialRefProvider }
];

class AppSpinnerComponent {
    constructor() { }
}
AppSpinnerComponent.decorators = [
    { type: Component, args: [{
                selector: 'app-spinner',
                template: `
        <div class="app-spinner" *ngIf="show">
            <div class="spinner-message" aria-label="loading gif">
                <i class="spinner-image animated infinite fa fa-circle-o-notch fa-spin"></i>
                <div class="spinner-messages">
                    <p *ngFor="let value of spinnermessages" [textContent]="value"></p>
                </div>
            </div>
        </div>
    `
            }] }
];
/** @nocollapse */
AppSpinnerComponent.ctorParameters = () => [];
AppSpinnerComponent.propDecorators = {
    show: [{ type: Input }],
    spinnermessages: [{ type: Input }]
};

class CustomToasterComponent extends Toast {
    // constructor is only necessary when not using AoT
    constructor(toastrService, toastPackage) {
        super(toastrService, toastPackage);
        this.toastrService = toastrService;
        this.toastPackage = toastPackage;
        this.watchers = [];
        this.params = {};
        this.pagename = this.message || '';
        this.generateParams();
    }
    // Generate the params for partial page. If bound, watch the expression and set the value
    generateParams() {
        _.forEach(this.options.partialParams, (param) => {
            if (_.isString(param.value) && param.value.indexOf('bind:') === 0) {
                this.watchers.push($watch(param.value.substr(5), this.options.context, {}, nv => {
                    this.params[param.name] = nv;
                    $appDigest();
                }));
            }
            else {
                this.params[param.name] = param.value;
            }
        });
    }
    generateDynamicComponent() {
        return __awaiter(this, void 0, void 0, function* () {
            const $targetLayout = $('.parent-custom-toast');
            this.customToastRef.clear();
            $targetLayout[0].appendChild(this.customToastRef.createEmbeddedView(this.customToastTmpl).rootNodes[0]);
        });
    }
    ngAfterViewInit() {
        this.generateDynamicComponent();
    }
    ngOnDestroy() {
        _.forEach(this.watchers, watcher => watcher());
    }
}
CustomToasterComponent.decorators = [
    { type: Component, args: [{
                selector: '[custom-toaster-component]',
                template: `
        <div class="parent-custom-toast"></div>
        <ng-container #customToast></ng-container>
        <ng-template #customToastTmpl>
            <div wmContainer partialContainer content.bind="pagename">
                <div *ngFor="let param of params | keyvalue" wmParam hidden
                    [name]="param.key" [value]="param.value"></div>
            </div>
        </ng-template>`,
                preserveWhitespaces: false
            }] }
];
/** @nocollapse */
CustomToasterComponent.ctorParameters = () => [
    { type: ToastrService },
    { type: ToastPackage }
];
CustomToasterComponent.propDecorators = {
    customToastRef: [{ type: ViewChild, args: ['customToast', { read: ViewContainerRef },] }],
    customToastTmpl: [{ type: ViewChild, args: ['customToastTmpl',] }]
};

class EmptyPageComponent {
    constructor(route, securityService, router, app, appManger) {
        this.route = route;
        this.securityService = securityService;
        this.router = router;
        this.app = app;
        this.appManger = appManger;
    }
    ngOnInit() {
        if (this.app.isPrefabType) {
            // there is only one route
            this.router.navigate(['prefab-preview']);
        }
        else if (this.app.isApplicationType) {
            this.securityService.getPageByLoggedInUser().then(page => {
                this.router.navigate([page]);
            });
        }
        else {
            this.router.navigate([getWmProjectProperties().homePage]);
            this.appManger.postAppTypeInfo();
        }
    }
}
EmptyPageComponent.decorators = [
    { type: Component, args: [{
                selector: 'app-empty-page',
                template: '<div></div>'
            }] }
];
/** @nocollapse */
EmptyPageComponent.ctorParameters = () => [
    { type: ActivatedRoute },
    { type: SecurityService },
    { type: Router },
    { type: App },
    { type: AppManagerService }
];

class PrefabDirective$1 {
    constructor(componentInstance, vcRef, elRef, prefabMngr, resolver, injector, componentRefProvider) {
        this.componentInstance = componentInstance;
        this.vcRef = vcRef;
        this.elRef = elRef;
        this.prefabMngr = prefabMngr;
        this.resolver = resolver;
        this.injector = injector;
        this.componentRefProvider = componentRefProvider;
        const prefabName = this.componentInstance.prefabName;
        this.prefabMngr.loadDependencies(prefabName)
            .then(() => __awaiter(this, void 0, void 0, function* () {
            const componentFactory = yield this.componentRefProvider.getComponentFactoryRef(prefabName, ComponentType.PREFAB);
            if (componentFactory) {
                const instanceRef = this.vcRef.createComponent(componentFactory, 0, injector);
                this.elRef.nativeElement.appendChild(instanceRef.location.nativeElement);
            }
        }));
    }
}
PrefabDirective$1.decorators = [
    { type: Directive, args: [{
                selector: '[wmPrefab][prefabname]'
            },] }
];
/** @nocollapse */
PrefabDirective$1.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] },
    { type: ViewContainerRef },
    { type: ElementRef },
    { type: PrefabManagerService },
    { type: ComponentFactoryResolver },
    { type: Injector },
    { type: ComponentRefProvider }
];

const injectorMap = {
    DialogService: AbstractDialogService,
    i18nService: AbstractI18nService,
    SpinnerService: AbstractSpinnerService,
    ToasterService: AbstractToasterService,
    Utils: UtilsService,
    FIELD_TYPE: FieldTypeService,
    FIELD_WIDGET: FieldWidgetService,
    DynamicComponentService: DynamicComponentRefProvider
};
const noop$1 = (...args) => { };
// Wraps httpService to behave as angular 1.x $http service.
const getHttpDependency = function () {
    const httpService$$1 = this.httpService;
    const fn = function (key, options) {
        const args = Array.from(arguments).slice(1);
        return Promise.resolve(httpService$$1[key].apply(httpService$$1, args));
    };
    const $http = function () {
        return fn.apply(undefined, ['send', ...Array.from(arguments)]);
    };
    ['get', 'post', 'head', 'put', 'delete', 'jsonp', 'patch'].forEach(key => $http[key] = fn.bind(undefined, key));
    return $http;
};
class AppRef {
    constructor(inj, i18nService, httpService$$1, securityService) {
        this.inj = inj;
        this.i18nService = i18nService;
        this.httpService = httpService$$1;
        this.securityService = securityService;
        this.Variables = {};
        this.Actions = {};
        this.onAppVariablesReady = noop$1;
        this.onSessionTimeout = noop$1;
        this.onPageReady = noop$1;
        this.onBeforePageLeave = noop$1;
        this.onBeforeServiceCall = noop$1;
        this.onServiceSuccess = noop$1;
        this.onServiceError = noop$1;
        this.dynamicComponentContainerRef = {};
        this.changeLocale = this.i18nService.setSelectedLocale.bind(this.i18nService);
        this.getSelectedLocale = this.i18nService.getSelectedLocale.bind(this.i18nService);
        this._eventNotifier = new EventNotifier();
        const wmProjectProperties = getWmProjectProperties();
        this.projectName = wmProjectProperties.name;
        this.isPrefabType = wmProjectProperties.type === "PREFAB" /* PREFAB */;
        this.isApplicationType = wmProjectProperties.type === "APPLICATION" /* APPLICATION */;
        this.isTemplateBundleType = wmProjectProperties.type === "TEMPLATEBUNDLE" /* TEMPLATE_BUNDLE */;
        this.httpService.registerOnSessionTimeout(this.on401.bind(this));
        this.appLocale = this.i18nService.getAppLocale();
        this.httpService.setLocale(this.appLocale);
    }
    reload() {
        window.location.reload();
    }
    notify(eventName, ...data) {
        this._eventNotifier.notify.apply(this._eventNotifier, arguments);
    }
    getDependency(injToken) {
        if (isString(injToken)) {
            if (injToken === 'HttpService') {
                return getHttpDependency.call(this);
            }
            let providerInstance = injectorMap[injToken] && this.inj.get(injectorMap[injToken]);
            if (!providerInstance && this.inj['_providers']) {
                this.inj['_providers'].forEach(e => {
                    if (e && e.__proto__.constructor.toString().indexOf('function ' + injToken + '(') === 0) {
                        providerInstance = this.inj.get(e.__proto__.constructor);
                    }
                });
            }
            return providerInstance;
        }
        return this.inj.get(injToken);
    }
    /**
     * triggers the onSessionTimeout callback in app.js
     */
    on401() {
        const userInfo = _.get(this.securityService.get(), 'userInfo');
        // if a previous user exists, a session time out triggered
        if (!_.isEmpty(userInfo)) {
            this.onSessionTimeout();
        }
    }
    subscribe(eventName, callback) {
        return this._eventNotifier.subscribe(eventName, callback);
    }
    notifyApp(template, type, title) {
        const notificationAction = _.get(this, 'Actions.appNotification');
        if (notificationAction) {
            type = type || 'success';
            notificationAction.invoke({
                message: template,
                title: isDefined(title) ? title : type.toUpperCase(),
                class: type,
                // If the type is error do not close the toastr
                duration: type.toUpperCase() === 'ERROR' ? 0 : undefined
            });
        }
        else {
            console.warn('The default Action "appNotification" doesn\'t exist in the app.');
        }
    }
}
AppRef.decorators = [
    { type: Injectable }
];
/** @nocollapse */
AppRef.ctorParameters = () => [
    { type: Injector },
    { type: AbstractI18nService },
    { type: AbstractHttpService },
    { type: SecurityService }
];

class ToasterServiceImpl extends AbstractToasterService {
    constructor(toaster) {
        super();
        this.toaster = toaster;
    }
    _showToaster(type, title, desc, options) {
        // backward compatibility (in 9.x, 4th param is timeout value).
        if (_.isNumber(options)) {
            options = { timeOut: options };
        }
        options = options || {};
        options.timeOut = isDefined(options.timeOut) ? options.timeOut : 0;
        options.enableHtml = isDefined(options.enableHtml);
        options.positionClass = options.positionClass || 'toast-bottom-right';
        options.toastClass = 'toast';
        // pop the toaster only if either title or description are defined
        if (title || desc) {
            // if the desc is an object, stringify it.
            if (!options.bodyOutputType && _.isObject(desc)) {
                desc = JSON.stringify(desc);
            }
            const fn = this.toaster[type];
            if (fn) {
                return fn.call(this.toaster, desc, title, options);
            }
        }
    }
    success(title, desc) {
        return this._showToaster('success', title, desc, { timeOut: 5000 });
    }
    error(title, desc) {
        return this._showToaster('error', title, desc, { timeOut: 0 });
    }
    info(title, desc) {
        return this._showToaster('info', title, desc, { timeOut: 0 });
    }
    warn(title, desc) {
        return this._showToaster('warning', title, desc, { timeOut: 0 });
    }
    show(type, title, desc, options) {
        return this._showToaster(type, title, desc, options);
    }
    hide(toasterObj) {
        // in studio just ignore the toasterObj and hide all the toasters
        if (!toasterObj) {
            this.toaster.clear();
            return;
        }
        this.toaster.clear(toasterObj.toastId);
    }
    showCustom(page, options) {
        if (!page) {
            return;
        }
        options = options || {};
        options.toastComponent = CustomToasterComponent;
        options.toastClass = 'custom-toaster';
        options.timeOut = isDefined(options.timeOut) ? options.timeOut : 0;
        options.enableHtml = isDefined(options.enableHtml);
        options.positionClass = options.positionClass || 'toast-bottom-right';
        options.toastClass = 'toast';
        return this.toaster.show(page, '', options);
    }
}
ToasterServiceImpl.decorators = [
    { type: Injectable }
];
/** @nocollapse */
ToasterServiceImpl.ctorParameters = () => [
    { type: ToastrService }
];

const APP_LOCALE_ROOT_PATH = 'resources/i18n';
const RTL_LANGUAGE_CODES = ['ar', 'ar-001', 'ar-ae', 'ar-bh', 'ar-dz', 'ar-eg', 'ar-iq', 'ar-jo', 'ar-kw', 'ar-lb', 'ar-ly',
    'ar-ma', 'ar-om', 'ar-qa', 'ar-sa', 'ar-sd', 'ar-sy', 'ar-tn', 'ar-ye', 'arc', 'bcc', 'bqi', 'ckb', 'dv', 'fa', 'glk',
    'he', 'ku', 'mzn', 'pnb', 'ps', 'sd', 'ug', 'ur', 'yi'];
class I18nServiceImpl extends AbstractI18nService {
    constructor($http, bsLocaleService, appDefaults) {
        super();
        this.$http = $http;
        this.bsLocaleService = bsLocaleService;
        this.appDefaults = appDefaults;
        this.defaultSupportedLocale = 'en';
        this._isAngularLocaleLoaded = false;
        this.appLocale = {};
        this.prefabLocale = new Map();
    }
    updateLocaleDirection() {
        let direction = 'ltr';
        if (RTL_LANGUAGE_CODES.includes(this.selectedLocale)) {
            direction = 'rtl';
        }
        setCSS(document.body, 'direction', direction);
    }
    init() {
        this.messages = {};
        Object.setPrototypeOf(this.appLocale, this.messages);
    }
    getSelectedLocale() {
        return this.selectedLocale;
    }
    getDefaultSupportedLocale() {
        return this.defaultSupportedLocale;
    }
    getAppLocale() {
        return this.appLocale;
    }
    getPrefabLocaleBundle(prefabName) {
        if (!this.prefabLocale.has(prefabName)) {
            this.prefabLocale.set(prefabName, Object.create(this.appLocale));
        }
        return this.prefabLocale.get(prefabName);
    }
    extendPrefabMessages(messages) {
        if (!messages.prefabMessages) {
            return;
        }
        Object.keys(messages.prefabMessages).forEach((prefabName) => {
            let bundle = this.prefabLocale.get(prefabName);
            if (!bundle) {
                bundle = Object.create(this.appLocale);
                this.prefabLocale.set(prefabName, bundle);
            }
            Object.assign(bundle, messages.prefabMessages[prefabName]);
        });
    }
    extendMessages(messages) {
        Object.assign(this.messages, messages);
    }
    loadResource(path) {
        return this.$http.get(path)
            .toPromise()
            .catch(() => {
            console.warn(`error loading locale resource from ${path}`);
        });
    }
    loadAppLocaleBundle() {
        this.loadResource(`${APP_LOCALE_ROOT_PATH}/${this.selectedLocale}.json`)
            .then(bundle => {
            this.extendMessages(bundle.messages);
            this.extendPrefabMessages(bundle);
            this.appDefaults.setFormats(bundle.formats);
        });
    }
    loadMomentLocaleBundle(momentLocale) {
        const _cdnUrl = _WM_APP_PROJECT.cdnUrl || _WM_APP_PROJECT.ngDest;
        if (this.selectedLocale === this.defaultSupportedLocale) {
            moment.locale(this.defaultSupportedLocale);
            return;
        }
        const path = _cdnUrl + `locales/moment/${momentLocale}.js`;
        this.$http.get(path, { responseType: 'text' })
            .toPromise()
            .then((response) => {
            const fn = new Function(response);
            // Call the script. In script, moment defines the loaded locale
            fn();
            moment.locale(this.selectedLocale);
            // For ngx bootstrap locale, get the config from script and apply locale
            let _config;
            fn.apply({ moment: { defineLocale: (code, config) => _config = config } });
            defineLocale(this.selectedLocale, _config);
            this.bsLocaleService.use(this.getSelectedLocale() || this.defaultSupportedLocale);
        });
    }
    loadAngularLocaleBundle(angLocale) {
        return new Promise(resolve => {
            const _cdnUrl = _WM_APP_PROJECT.cdnUrl || _WM_APP_PROJECT.ngDest;
            if (this.selectedLocale === this.defaultSupportedLocale) {
                resolve();
                return;
            }
            const path = _cdnUrl + `locales/angular/${angLocale}.js`;
            this.$http.get(path, { responseType: 'text' })
                .toPromise()
                .then((response) => {
                const module = {}, exports = {};
                module.exports = exports;
                const fn = new Function('module', 'exports', response);
                fn(module, exports);
                registerLocaleData(exports.default);
                this._isAngularLocaleLoaded = true;
                resolve();
            }, () => resolve());
        });
    }
    loadCalendarLocaleBundle(calendarLocale) {
        const _cdnUrl = _WM_APP_PROJECT.cdnUrl || _WM_APP_PROJECT.ngDest;
        let path;
        if (calendarLocale) {
            path = _cdnUrl + `locales/fullcalendar/${calendarLocale}.js`;
        }
        else {
            return Promise.resolve();
        }
        // return in case of mobile app or if selected locale is default supported locale.
        if (isMobile() || isMobileApp() || this.selectedLocale === this.defaultSupportedLocale) {
            return;
        }
        this.$http.get(path, { responseType: 'text' })
            .toPromise()
            .then((response) => {
            const fn = new Function(response);
            // Call the script. In script, moment defines the loaded locale
            fn();
        });
    }
    loadLocaleBundles(libLocale) {
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
    }
    setSelectedLocale(locale) {
        // check if the event is propagated from the select or any such widget
        if (_.isObject(locale)) {
            locale = locale.datavalue;
        }
        const libLocale = getWmProjectProperties().supportedLanguages[locale];
        const supportedLocale = Object.keys(getWmProjectProperties().supportedLanguages);
        if (!_.includes(supportedLocale, locale)) {
            return Promise.resolve();
        }
        if (!locale || locale === this.selectedLocale) {
            return Promise.resolve();
        }
        setSessionStorageItem('selectedLocale', locale);
        this.selectedLocale = locale;
        // reset the localeData object
        this.init();
        // load the locale bundles of the selected locale
        return this.loadLocaleBundles(libLocale).then(() => this.updateLocaleDirection());
    }
    loadDefaultLocale() {
        const _acceptLang = this.getAcceptedLanguages();
        _acceptLang.push(getWmProjectProperties().defaultLanguage);
        let _supportedLang = Object.keys(getWmProjectProperties().supportedLanguages) || [this.defaultSupportedLocale];
        // check for the session storage to load any pre-requested locale
        const _defaultLang = getSessionStorageItem('selectedLocale') || _.intersection(_acceptLang, _supportedLang)[0] || this.defaultSupportedLocale;
        // if the supportedLocale is not available set it to defaultLocale
        _supportedLang = _supportedLang || [_defaultLang];
        const defaultLanguage = _defaultLang || _supportedLang[0];
        return this.setSelectedLocale(defaultLanguage);
    }
    getLocalizedMessage(message, ...args) {
        return replace(this.appLocale[message], args);
    }
    // This function returns the accepted languages list
    getAcceptedLanguages() {
        let languages;
        if (CONSTANTS.hasCordova) {
            languages = navigator.languages || [navigator.language];
        }
        else {
            languages = getWmProjectProperties().preferredLanguage || '';
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
    }
    isAngularLocaleLoaded() {
        return this._isAngularLocaleLoaded;
    }
}
I18nServiceImpl.decorators = [
    { type: Injectable }
];
/** @nocollapse */
I18nServiceImpl.ctorParameters = () => [
    { type: HttpClient },
    { type: BsLocaleService },
    { type: AppDefaults }
];

const spinnerTemplate = `<div class="app-spinner">
                            <div class="spinner-message" aria-label="loading gif">
                                <i class="spinner-image animated infinite fa fa-circle-o-notch fa-spin"></i>
                                <div class="spinner-messages">
                                    <p class="spinner-messages-container"></p>
                               </div>
                            </div>
                         </div>`;
class SpinnerServiceImpl extends AbstractSpinnerService {
    constructor() {
        super();
        this.spinnerId = 0;
        this.messageSource = new Subject();
        this.messagesByContext = {};
    }
    /**
     * returns the message source subject
     * @returns {Subject<any>}
     */
    getMessageSource() {
        return this.messageSource;
    }
    /**
     * show spinner on a container element
     */
    showContextSpinner(ctx, message, id) {
        const ctxMarkup = $('[name="' + ctx + '"]');
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
            const ctxSpinnerTemp = $(spinnerTemplate);
            this.messagesByContext[ctx][id] = message;
            this.messagesByContext[ctx]['finalMessage'] = this.messagesByContext[ctx][id];
            ctxSpinnerTemp.find('.spinner-messages-container').html(this.messagesByContext[ctx]['finalMessage']);
            ctxMarkup.prepend(ctxSpinnerTemp);
        }
        return id;
    }
    /**
     * show the app spinner with provided message
     * @param msg
     * @returns {string}
     */
    showAppSpinner(msg, id) {
        const ctx = 'page';
        this.messagesByContext[ctx] = this.messagesByContext[ctx] || {};
        this.messagesByContext[ctx][id] = msg;
        this.messageSource.next({
            show: true,
            message: msg,
            messages: _.values(this.messagesByContext[ctx])
        });
    }
    /**
     * hides the spinner on a particular container(context)
     * @param ctx
     * @param id
     */
    hideContextSpinner(ctx, id) {
        delete this.messagesByContext[ctx][id];
        if (Object.keys(this.messagesByContext[ctx]).length === 1) {
            this.messagesByContext[ctx] = {};
        }
        const ctxMarkup = $('[name="' + ctx + '"]');
        ctxMarkup.find('.app-spinner').remove();
    }
    /**
     * show spinner
     * @param message
     * @param id
     * @param spinnerClass
     * @param spinnerContext
     * @param variableScopeId
     * @returns {any}
     */
    show(message, id, spinnerClass, spinnerContext, variableScopeId) {
        id = id || ++this.spinnerId;
        // if spinnerContext is passed, then append the spinner to the element(default method for variable calls).
        if (spinnerContext && spinnerContext !== 'page') {
            // return after the compiled spinner is appended to the element reference
            return this.showContextSpinner(spinnerContext, message, id);
        }
        this.showAppSpinner(message, id);
        return id;
    }
    /**
     * hide the spinner
     * @param spinnerId
     */
    hide(id) {
        // find the spinner context of the id from the messagesByContext
        const ctx = _.findKey(this.messagesByContext, function (obj) {
            return _.includes(_.keys(obj), id);
        }) || 'page';
        // if spinnerContext exists just remove the spinner from the reference and destroy the scope associated.
        if (ctx !== 'page') {
            this.hideContextSpinner(ctx, id);
            return;
        }
        if (id) {
            delete this.messagesByContext[ctx][id];
            const messages = _.values(this.messagesByContext[ctx]);
            const pageSpinnerCount = Object.keys(this.messagesByContext[ctx]).length;
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
    }
}
SpinnerServiceImpl.decorators = [
    { type: Injectable }
];
/** @nocollapse */
SpinnerServiceImpl.ctorParameters = () => [];

const parentSelector = 'body:first >app-root:last';
class NavigationServiceImpl {
    constructor(app, router) {
        this.app = app;
        this.router = router;
        this.history = new History();
        this.isPageAddedToHistory = false;
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                const url = event.url;
                const urlParams = {};
                let pageName;
                if (!this.isPageAddedToHistory) {
                    this.isPageAddedToHistory = false;
                    if (url.indexOf('?') > 0) {
                        url.substr(url.indexOf('?') + 1)
                            .split('&')
                            .forEach(s => {
                            const splits = s.split('=');
                            urlParams[splits[0]] = splits[1];
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
                        delete urlParams['name'];
                        this.history.push(new PageInfo(pageName, urlParams, this.transition));
                    }
                }
            }
        });
    }
    getPageTransition() {
        if (_.isEmpty(this.transition) || _.isEqual('none', this.transition)) {
            return null;
        }
        return this.transition;
    }
    /**
     * Navigates to particular page
     * @param pageName
     * @param options
     */
    goToPage(pageName, options) {
        this.transition = options.transition || '';
        // page is added to stack only when currentPage is available.
        if (this.history.getCurrentPage()) {
            this.isPageAddedToHistory = true;
        }
        this.history.push(new PageInfo(pageName, options.urlParams, this.transition));
        if (CONSTANTS.isWaveLens) {
            const location = window['location'];
            const strQueryParams = _.map(options.urlParams || [], (value, key) => key + '=' + value);
            const strQuery = (strQueryParams.length > 0 ? '?' + strQueryParams.join('&') : '');
            location.href = location.origin
                + location.pathname
                + '#/' + pageName
                + strQuery;
            return;
        }
        return this.router.navigate([`/${pageName}`], { queryParams: options.urlParams });
    }
    /**
     * Navigates to last visited page.
     */
    goToPrevious() {
        if (this.history.getPagesCount()) {
            this.transition = this.history.getCurrentPage().transition;
            if (!_.isEmpty(this.transition)) {
                this.transition += '-exit';
            }
            this.history.pop();
            this.isPageAddedToHistory = true;
            window.history.back();
        }
    }
    /** Todo[Shubham] Need to handle gotoElement in other partials
     * Navigates to particular view
     * @param viewName
     * @param options
     * @param variable
     */
    goToView(viewName, options, variable) {
        options = options || {};
        const pageName = options.pageName;
        const transition = options.transition || '';
        const $event = options.$event;
        const activePage = this.app.activePage;
        const prefabName = variable && variable._context && variable._context.prefabName;
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
                    const pageReadySubscriber = this.app.subscribe('pageReady', (page) => {
                        this.goToElementView($(parentSelector).find('[name="' + viewName + '"]'), viewName, pageName, variable);
                        pageReadySubscriber();
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
                this.app.notifyApp(CONSTANTS.WIDGET_DOESNT_EXIST, 'error');
            }
        }
    }
    /*
     * navigates the user to a view element with given name
     * if the element not found in the compiled markup, the same is searched in the available dialogs in the page
     */
    goToElementView(viewElement, viewName, pageName, variable) {
        let $el, parentDialog;
        const activePage = this.app.activePage;
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
            setTimeout(() => {
                if (parentDialog) {
                    this.goToElementView($('[name="' + viewName + '"]'), viewName, pageName, variable);
                }
            });
        }
    }
    /* If page name is equal to active pageName, this function returns the element in the page.
     The element in the partial page is not selected.*/
    getViewElementInActivePage($el) {
        let selector;
        if ($el.length > 1) {
            selector = _.filter($el, (childSelector) => {
                if (_.isEmpty($(childSelector).closest('[data-role = "partial"]')) && _.isEmpty($(childSelector).closest('[wmprefabcontainer]'))) {
                    return childSelector;
                }
            });
            if (selector) {
                $el = $(selector);
            }
        }
        return $el;
    }
    /**
     * checks if the pagecontainer has the pageName.
     */
    isPartialWithNameExists(name) {
        return $('[partialcontainer][content="' + name + '"]').length;
    }
    /**
     * checks if the pagecontainer has the prefab.
     */
    isPrefabWithNameExists(prefabName) {
        return $('[prefabName="' + prefabName + '"]').length;
    }
    /*
     * shows all the parent container view elements for a given view element
     */
    showAncestors(element, variable) {
        const ancestorSearchQuery = '[wm-navigable-element="true"]';
        element
            .parents(ancestorSearchQuery)
            .toArray()
            .reverse()
            .forEach((parent) => {
            const $el = parent.widget;
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
    }
    /*
     * searches for a given view element inside the available dialogs in current page
     * if found, the dialog is displayed, the dialog id is returned.
     */
    showAncestorDialog(viewName) {
        let dialogId;
        $('app-root [dialogtype]')
            .each(function () {
            const dialog = $(this);
            if ($(dialog.html()).find('[name="' + viewName + '"]').length) {
                dialogId = dialog.attr('name');
                return false;
            }
        });
        return dialogId;
    }
}
NavigationServiceImpl.decorators = [
    { type: Injectable }
];
/** @nocollapse */
NavigationServiceImpl.ctorParameters = () => [
    { type: App },
    { type: Router }
];
class PageInfo {
    constructor(name, urlParams, transition) {
        this.name = name;
        this.urlParams = urlParams;
        this.transition = transition;
        this.transition = _.isEmpty(this.transition) ? null : this.transition;
    }
    isEqual(page1) {
        return page1 && page1.name === this.name && _.isEqual(page1.urlParams, this.urlParams);
    }
}
class History {
    constructor() {
        this.stack = [];
    }
    getCurrentPage() {
        return this.currentPage;
    }
    getPagesCount() {
        return this.stack.length;
    }
    isLastVisitedPage(page) {
        return this.getLastPage().isEqual(page);
    }
    push(pageInfo) {
        if (this.currentPage) {
            this.stack.push(this.currentPage);
        }
        this.currentPage = pageInfo;
    }
    pop() {
        this.currentPage = this.stack.pop();
        return this.currentPage;
    }
    getLastPage() {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined;
    }
}

class AppDefaultsService {
    constructor() {
    }
    setFormats(formats) {
        const dateFormat = formats.date;
        const timeFormat = formats.time;
        const dateTimeFormat = (dateFormat && timeFormat) ? dateFormat + ' ' + timeFormat : undefined;
        this.dateFormat = dateFormat;
        this.timeFormat = timeFormat;
        this.dateTimeFormat = dateTimeFormat;
    }
}
AppDefaultsService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
AppDefaultsService.ctorParameters = () => [];

let securityConfigLoaded = false;
class AuthGuard {
    constructor(securityService, appManager$$1) {
        this.securityService = securityService;
        this.appManager = appManager$$1;
    }
    loadSecurityConfig() {
        if (securityConfigLoaded) {
            return Promise.resolve(true);
        }
        return this.appManager.loadSecurityConfig().then(() => securityConfigLoaded = true);
    }
    isAuthenticated() {
        return this.loadSecurityConfig()
            .then(() => {
            return new Promise((resolve, reject) => {
                this.securityService.isAuthenticated(resolve, reject);
            });
        });
    }
    canActivate(route) {
        return this.isAuthenticated()
            .then(isLoggedIn => {
            if (isLoggedIn) {
                return Promise.resolve(true);
            }
            this.appManager.handle401(route.routeConfig.path);
            return Promise.resolve(false);
        });
    }
}
AuthGuard.decorators = [
    { type: Injectable }
];
/** @nocollapse */
AuthGuard.ctorParameters = () => [
    { type: SecurityService },
    { type: AppManagerService }
];

class RoleGuard {
    constructor(securityService, authGuard, toasterService, app, appManager$$1) {
        this.securityService = securityService;
        this.authGuard = authGuard;
        this.toasterService = toasterService;
        this.app = app;
        this.appManager = appManager$$1;
    }
    canActivate(route) {
        const allowedRoles = route.data.allowedRoles;
        return this.authGuard.isAuthenticated()
            .then((isLoggedIn) => {
            if (isLoggedIn) {
                const userRoles = this.securityService.get().userInfo.userRoles;
                const hasAccess = _.intersection(allowedRoles, userRoles).length > 0;
                if (hasAccess) {
                    return Promise.resolve(true);
                }
                // current loggedin user doesn't have access to the page that the user is trying to view
                this.appManager.notifyApp(this.app.appLocale.LABEL_ACCESS_DENIED || 'Access Denied', 'error');
                return Promise.resolve(false);
            }
            else {
                // redirect to Login
                this.appManager.handle401(route.routeConfig.path);
                return Promise.resolve(false);
            }
        });
    }
}
RoleGuard.decorators = [
    { type: Injectable }
];
/** @nocollapse */
RoleGuard.ctorParameters = () => [
    { type: SecurityService },
    { type: AuthGuard },
    { type: AbstractToasterService },
    { type: App },
    { type: AppManagerService }
];

class PageNotFoundGaurd {
    constructor(app, appManager$$1) {
        this.app = app;
        this.appManager = appManager$$1;
    }
    canActivate(route) {
        this.appManager.notifyApp(this.app.appLocale.MESSAGE_PAGE_NOT_FOUND || 'The page you are trying to reach is not available', 'error');
        return Promise.resolve(false);
    }
}
PageNotFoundGaurd.decorators = [
    { type: Injectable }
];
/** @nocollapse */
PageNotFoundGaurd.ctorParameters = () => [
    { type: App },
    { type: AppManagerService }
];

let appJsLoaded = false;
class AppJSResolve {
    constructor(inj, app, utilService, appJsProvider) {
        this.inj = inj;
        this.app = app;
        this.utilService = utilService;
        this.appJsProvider = appJsProvider;
    }
    resolve() {
        return __awaiter(this, void 0, void 0, function* () {
            if (appJsLoaded) {
                return true;
            }
            try {
                // execute app.js
                const appScriptFn = yield this.appJsProvider.getAppScriptFn();
                appScriptFn(this.app, this.utilService, this.inj);
            }
            catch (e) {
                console.warn('Error in executing app.js', e);
            }
            appJsLoaded = true;
            return true;
        });
    }
}
AppJSResolve.decorators = [
    { type: Injectable }
];
/** @nocollapse */
AppJSResolve.ctorParameters = () => [
    { type: Injector },
    { type: App },
    { type: UtilsService },
    { type: AppJSProvider }
];

class I18nResolve {
    constructor(i18nService) {
        this.i18nService = i18nService;
    }
    resolve() {
        return this.i18nService.loadDefaultLocale();
    }
}
I18nResolve.decorators = [
    { type: Injectable }
];
/** @nocollapse */
I18nResolve.ctorParameters = () => [
    { type: AbstractI18nService }
];

class PipeProvider {
    constructor(compiler, injector) {
        this.compiler = compiler;
        this.injector = injector;
        this._locale = getSessionStorageItem('selectedLocale') || 'en';
        this.preparePipeMeta = (reference, name, pure, diDeps = []) => ({
            type: { reference, diDeps },
            name,
            pure
        });
        this._pipeData = [
            // TODO | NEED TO BE TESTED
            this.preparePipeMeta(AsyncPipe, 'async', false, [ChangeDetectorRef]),
            this.preparePipeMeta(SlicePipe, 'slice', false),
            this.preparePipeMeta(PercentPipe, 'percent', true, [this._locale]),
            this.preparePipeMeta(I18nPluralPipe, 'i18nPlural', true, [
                NgLocalization
            ]),
            this.preparePipeMeta(I18nSelectPipe, 'i18nSelect', true),
            this.preparePipeMeta(KeyValuePipe, 'keyvalue', false, [
                KeyValueDiffers
            ]),
            this.preparePipeMeta(FileIconClassPipe, 'fileIconClass', true),
            this.preparePipeMeta(FileExtensionFromMimePipe, 'fileExtensionFromMime', true),
            this.preparePipeMeta(StateClassPipe, 'stateClass', true),
            this.preparePipeMeta(FileSizePipe, 'filesize', true),
            // TESTED
            this.preparePipeMeta(FilterPipe, 'filter', true),
            this.preparePipeMeta(UpperCasePipe, 'uppercase', true),
            this.preparePipeMeta(LowerCasePipe, 'lowercase', true),
            this.preparePipeMeta(JsonPipe, 'json', false),
            this.preparePipeMeta(DecimalPipe, 'number', true, [this._locale]),
            this.preparePipeMeta(TitleCasePipe, 'titlecase', true),
            this.preparePipeMeta(CurrencyPipe, 'currency', true, [this._locale]),
            this.preparePipeMeta(DatePipe, 'date', true, [this._locale]),
            this.preparePipeMeta(ToDatePipe, 'toDate', true, [
                new DatePipe(this._locale)
            ]),
            this.preparePipeMeta(ToNumberPipe, 'toNumber', true, [
                new DecimalPipe(this._locale)
            ]),
            this.preparePipeMeta(ToCurrencyPipe, 'toCurrency', true, [
                new DecimalPipe(this._locale)
            ]),
            this.preparePipeMeta(PrefixPipe, 'prefix', true),
            this.preparePipeMeta(SuffixPipe, 'suffix', true),
            this.preparePipeMeta(TimeFromNowPipe, 'timeFromNow', true),
            this.preparePipeMeta(NumberToStringPipe, 'numberToString', true, [
                new DecimalPipe(this._locale)
            ]),
            this.preparePipeMeta(StringToNumberPipe, 'stringToNumber', true)
        ];
        this._pipeMeta = new Map();
        this._pipeData.forEach(v => {
            this._pipeMeta.set(v.name, v);
        });
    }
    unknownPipe(name) {
        throw Error(`The pipe '${name}' could not be found`);
    }
    meta(name) {
        const meta = this._pipeMeta.get(name);
        if (!meta) {
            this.unknownPipe(name);
        }
        return meta;
    }
    getPipeNameVsIsPureMap() {
        const _map = new Map();
        this._pipeMeta.forEach((v, k) => {
            _map.set(k, v.pure);
        });
        return _map;
    }
    resolveDep(dep) {
        return this.injector.get(dep.token.identifier.reference);
    }
    getInstance(name) {
        const { type: { reference: ref, diDeps: deps } } = this.meta(name);
        if (!ref) {
            this.unknownPipe(name);
        }
        if (!deps.length) {
            return new ref();
        }
        else {
            const args = [];
            for (const dep of deps) {
                args.push(dep);
            }
            return new ref(...args);
        }
    }
}
PipeProvider.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
PipeProvider.ctorParameters = () => [
    { type: Compiler },
    { type: Injector }
];
PipeProvider.ngInjectableDef = defineInjectable({ factory: function PipeProvider_Factory() { return new PipeProvider(inject(Compiler), inject(INJECTOR)); }, token: PipeProvider, providedIn: "root" });

class AppComponent {
    constructor(_pipeProvider, _appRef, elRef, oAuthService, dialogService, spinnerService, ngZone, router, app) {
        this.elRef = elRef;
        this.oAuthService = oAuthService;
        this.dialogService = dialogService;
        this.spinnerService = spinnerService;
        this.router = router;
        this.app = app;
        this.startApp = false;
        this.isApplicationType = false;
        this.spinner = { show: false, messages: [] };
        this.isOAuthDialogOpen = false;
        setPipeProvider(_pipeProvider);
        setNgZone(ngZone);
        setAppRef(_appRef);
        this.isApplicationType = getWmProjectProperties().type === 'APPLICATION';
        // subscribe to OAuth changes
        oAuthService.getOAuthProvidersAsObservable().subscribe((providers) => {
            this.providersConfig = providers;
            if (providers.length) {
                this.showOAuthDialog();
            }
            else {
                this.closeOAuthDialog();
            }
        });
        // Subscribe to the message source to show/hide app spinner
        this.spinnerService.getMessageSource().asObservable().subscribe((data) => {
            // setTimeout is to avoid 'ExpressionChangedAfterItHasBeenCheckedError'
            setTimeout(() => {
                this.spinner.show = data.show;
                this.spinner.messages = data.messages;
            });
        });
        // set theme to bs3 on ngx-bootstrap. This avoids runtime calculation to determine bs theme. Thus resolves performance.
        setTheme('bs3');
        if (hasCordova() && !window['wmDeviceReady']) {
            document.addEventListener('wmDeviceReady', () => this.startApp = true);
        }
        else {
            this.startApp = true;
        }
        let spinnerId;
        this.router.events.subscribe(e => {
            if (e instanceof NavigationStart) {
                spinnerId = this.spinnerService.show('', 'globalSpinner');
                const node = document.querySelector('app-page-outlet');
                if (node) {
                    addClass(node, 'page-load-in-progress');
                }
            }
            else if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
                setTimeout(() => {
                    this.spinnerService.hide(spinnerId);
                    const node = document.querySelector('app-page-outlet');
                    if (node) {
                        removeClass(node, 'page-load-in-progress');
                    }
                }, 1000);
            }
        });
    }
    showOAuthDialog() {
        if (!this.isOAuthDialogOpen) {
            this.isOAuthDialogOpen = true;
            this.dialogService.open('oAuthLoginDialog', this);
        }
    }
    closeOAuthDialog() {
        if (this.isOAuthDialogOpen) {
            this.isOAuthDialogOpen = false;
            this.dialogService.close('oAuthLoginDialog', this);
        }
    }
    ngAfterViewInit() {
        this.app.dynamicComponentContainerRef = this.dynamicComponentContainerRef;
    }
    ngDoCheck() {
        $invokeWatchers();
    }
}
AppComponent.decorators = [
    { type: Component, args: [{
                selector: 'app-root',
                template: "<ng-container *ngIf=\"startApp\">\n    <router-outlet></router-outlet>\n    <div wmContainer partialContainer content=\"Common\" hidden class=\"ng-hide\" *ngIf=\"isApplicationType\"></div>\n    <app-spinner [show]=\"spinner.show\" [spinnermessages]=\"spinner.messages\"></app-spinner>\n    <div wmDialog name=\"oAuthLoginDialog\" title.bind=\"'Application is requesting you to sign in with'\"\n         close.event=\"closeOAuthDialog()\">\n        <ng-template #dialogBody>\n            <ul class=\"list-items\">\n                <li class=\"list-item\" *ngFor=\"let provider of providersConfig\">\n                    <button class=\"btn\" (click)=\"provider.invoke()\">{{provider.name}}</button>\n                </li>\n            </ul>\n        </ng-template>\n    </div>\n    <div wmConfirmDialog name=\"_app-confirm-dialog\" title.bind=\"title\" message.bind=\"message\" oktext.bind=\"oktext\"\n         canceltext.bind=\"canceltext\" closable=\"false\"\n         iconclass.bind=\"iconclass\" ok.event=\"onOk()\" cancel.event=\"onCancel()\" close.event=\"onClose()\" opened.event=\"onOpen()\"></div>\n    <div wmAppExt></div>\n    <i id=\"wm-mobile-display\"></i>\n</ng-container>\n<!--Dummy container to create the component dynamically-->\n<ng-container #dynamicComponent></ng-container>\n",
                encapsulation: ViewEncapsulation.None
            }] }
];
/** @nocollapse */
AppComponent.ctorParameters = () => [
    { type: PipeProvider },
    { type: ApplicationRef },
    { type: ElementRef },
    { type: OAuthService },
    { type: AbstractDialogService },
    { type: AbstractSpinnerService },
    { type: NgZone },
    { type: Router },
    { type: App }
];
AppComponent.propDecorators = {
    dynamicComponentContainerRef: [{ type: ViewChild, args: ['dynamicComponent', { read: ViewContainerRef },] }]
};

/**
 * This Interceptor intercepts all network calls and if a network call fails
 * due to session timeout, then it calls a function to handle session timeout.
 */
class HttpCallInterceptor {
    constructor() {
        this.wmHttpRequest = new WmHttpRequest();
        this.wmHttpResponse = new WmHttpResponse();
    }
    createSubject() {
        return new Subject();
    }
    intercept(request, next) {
        let modifiedReq;
        let modifiedResp;
        if (appManager && appManager.appOnBeforeServiceCall) {
            // Convert the angular HttpRequest to wm HttpRequest
            const req = this.wmHttpRequest.angularToWmRequest(request);
            // trigger the common onBeforeServiceCall handler present in app.js
            modifiedReq = appManager.appOnBeforeServiceCall(req);
            if (modifiedReq) {
                // Convert the wm HttpRequest to angular HttpRequest
                modifiedReq = this.wmHttpRequest.wmToAngularRequest(modifiedReq);
                request = modifiedReq;
            }
        }
        return next.handle(request).pipe(tap((response) => {
            if (response && response.type === 4 && appManager && appManager.appOnServiceSuccess) {
                // Convert the angular HttpResponse to wm HttpResponse
                const resp = this.wmHttpResponse.angularToWmResponse(response);
                // trigger the common success handler present in app.js
                modifiedResp = appManager.appOnServiceSuccess(resp.body, resp);
                if (modifiedResp) {
                    // Convert the wm HttpResponse to angular HttpResponse
                    modifiedResp = this.wmHttpResponse.wmToAngularResponse(modifiedResp);
                    _.extend(response, modifiedResp);
                }
            }
        }, error => {
            error._401Subscriber = this.createSubject();
            if (httpService.isPlatformSessionTimeout(error)) {
                httpService.handleSessionTimeout(request, error._401Subscriber);
            }
            if (appManager && appManager.appOnServiceError) {
                // Convert the angular HttpResponse to wm HttpResponse
                const err = this.wmHttpResponse.angularToWmResponse(error);
                // trigger the common error handler present in app.js
                modifiedResp = appManager.appOnServiceError(err.message, err);
                if (modifiedResp) {
                    // Convert the wm HttpResponse to angular HttpResponse
                    modifiedResp = this.wmHttpResponse.wmToAngularResponse(modifiedResp);
                    _.extend(error, modifiedResp);
                }
            }
        }));
    }
}
HttpCallInterceptor.decorators = [
    { type: Injectable }
];
/** @nocollapse */
HttpCallInterceptor.ctorParameters = () => [];

const PREFAB = 'PREFAB';
class PrefabPreviewComponent {
    constructor(prefabManager) {
        this.prefabManager = prefabManager;
        window.addEventListener('message', e => {
            const context = e.data && e.data.context;
            if (context !== PREFAB) {
                return;
            }
            const action = e.data.action;
            const payload = e.data.payload;
            if (action === 'init') {
                this.init();
            }
            else if (action === 'set-property') {
                this.setProperty(payload);
            }
            else if (action === 'get-outbound-properties') {
                this.getOutboundProps();
            }
            else if (action === 'invoke-script') {
                this.invokeScript(payload);
            }
        });
    }
    postMessage(action, payload) {
        const data = {
            context: PREFAB,
            action,
            payload
        };
        window.top.postMessage(data, '*');
    }
    setupEventListeners() {
        this.prefabInstance.invokeEventCallback = (eventName, locals = {}) => {
            this.postMessage('event-log', { name: eventName, data: locals });
        };
    }
    init() {
        this.previewMode = true;
        this.prefabInstance.readyState.subscribe(() => { }, () => { }, () => {
            this.prefabManager.getConfig('__self__')
                .then(config => {
                this.config = config;
                this.postMessage('config', config);
                this.setupEventListeners();
            });
        });
    }
    setProperty(payload) {
        this.prefabInstance.widget[payload.name] = payload.value;
    }
    isOutBoundProp(info) {
        return info.bindable === 'out-bound' || info.bindable === 'in-out-bound';
    }
    getOutboundProps() {
        const payload = {};
        for (const [name, info] of Object.entries(this.config.properties || {})) {
            if (this.isOutBoundProp(info)) {
                payload[name] = this.prefabInstance.widget[name];
            }
        }
        this.postMessage('outbound-properties', payload);
    }
    invokeScript(payload) {
        const script = `\n return ${payload.script};`;
        const fn = new Function('Prefab', script);
        const retVal = fn(this.prefabInstance);
        this.postMessage('method-output', { methodName: payload.methodName, output: retVal });
    }
    ngAfterViewInit() {
        this.setupEventListeners();
        this.postMessage('init');
    }
}
PrefabPreviewComponent.decorators = [
    { type: Component, args: [{
                selector: 'wm-prefab-preview',
                template: `
        <div class="prefab-preview row">
            <section wmPrefab name="prefab-preview" prefabname="__self__"></section>
        </div>
    `
            }] }
];
/** @nocollapse */
PrefabPreviewComponent.ctorParameters = () => [
    { type: PrefabManagerService }
];
PrefabPreviewComponent.propDecorators = {
    prefabInstance: [{ type: ViewChild, args: [PrefabDirective,] }]
};

initComponentsBuildTask();
const componentFactoryRefCache = new Map();
const getDynamicModule = (componentRef) => {
    class DynamicModule {
    }
    DynamicModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [componentRef],
                    imports: [
                        RuntimeBaseModule
                    ],
                    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
                },] },
    ];
    return DynamicModule;
};
const getDynamicComponent = (selector, template, css = '') => {
    const componentDef = {
        template,
        styles: [css],
        encapsulation: ViewEncapsulation.None
    };
    class DynamicComponent {
    }
    DynamicComponent.decorators = [
        { type: Component, args: [Object.assign({}, componentDef, { selector }),] },
    ];
    return DynamicComponent;
};
class DynamicComponentRefProviderService {
    constructor(app, appManager$$1, compiler) {
        this.app = app;
        this.appManager = appManager$$1;
        this.compiler = compiler;
        this.counter = 1;
    }
    getComponentFactoryRef(selector, markup, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // check in the cache.
            let componentFactoryRef = componentFactoryRefCache.get(selector);
            markup = options.transpile ? transpile(markup) : markup;
            if (!componentFactoryRef || options.noCache) {
                const componentDef = getDynamicComponent(selector, markup, options.styles);
                const moduleDef = getDynamicModule(componentDef);
                componentFactoryRef = this.compiler
                    .compileModuleAndAllComponentsSync(moduleDef)
                    .componentFactories
                    .filter(factory => factory.componentType === componentDef)[0];
                componentFactoryRefCache.set(selector, componentFactoryRef);
            }
            return componentFactoryRef;
        });
    }
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
    addComponent(target, markup, context = {}, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            options.transpile = isDefined(options.transpile) ? options.transpile : true;
            options.noCache = isDefined(options.noCache) ? options.noCache : true;
            options.selector = isDefined(options.selector) ? options.selector : 'wm-dynamic-component-' + this.counter++;
            const componentFactoryRef = yield this.getComponentFactoryRef(options.selector, markup, options);
            const component = this.app.dynamicComponentContainerRef.createComponent(componentFactoryRef, 0);
            extendProto(component.instance, context);
            target.appendChild(component.location.nativeElement);
        });
    }
}
DynamicComponentRefProviderService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
DynamicComponentRefProviderService.ctorParameters = () => [
    { type: App },
    { type: AppManagerService },
    { type: Compiler }
];

class CanDeactivatePageGuard {
    canDeactivate(component, route, state) {
        return component.canDeactivate ? component.canDeactivate() : true;
    }
}
CanDeactivatePageGuard.decorators = [
    { type: Injectable }
];

function InitializeApp(I18nService) {
    return () => {
        _WM_APP_PROJECT.id = location.href.split('/')[3];
        _WM_APP_PROJECT.cdnUrl = document.querySelector('[name="cdnUrl"]') && document.querySelector('[name="cdnUrl"]').getAttribute('content');
        _WM_APP_PROJECT.ngDest = 'ng-bundle/';
        return I18nService.loadDefaultLocale();
    };
}
function setAngularLocale(I18nService) {
    return I18nService.isAngularLocaleLoaded() ? I18nService.getSelectedLocale() : I18nService.getDefaultSupportedLocale();
}
const definitions = [
    AccessrolesDirective,
    PartialContainerDirective,
    AppSpinnerComponent,
    CustomToasterComponent,
    PrefabDirective$1,
    AppComponent,
    PrefabPreviewComponent,
    EmptyPageComponent
];
const carouselModule = CarouselModule.forRoot();
const bsDropDownModule = BsDropdownModule.forRoot();
const popoverModule = PopoverModule.forRoot();
const tooltipModule = TooltipModule.forRoot();
// setting parseExpr as exprEvaluator for swipeAnimation
$.fn.swipeAnimation.expressionEvaluator = $parseExpr;
class RuntimeBaseModule {
    constructor() {
        RuntimeBaseModule.addCustomEventPolyfill();
    }
    // this polyfill is to add support for CustomEvent in IE11
    static addCustomEventPolyfill() {
        if (typeof window['CustomEvent'] === 'function') {
            return false;
        }
        const CustomEvent = (event, params) => {
            params = params || { bubbles: false, cancelable: false, detail: null };
            const evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
        CustomEvent.prototype = window['Event'].prototype;
        window['CustomEvent'] = CustomEvent;
    }
    static forRoot() {
        return {
            ngModule: RuntimeBaseModule,
            providers: [
                { provide: App, useClass: AppRef },
                { provide: AbstractToasterService, useClass: ToasterServiceImpl },
                { provide: AbstractI18nService, useClass: I18nServiceImpl },
                { provide: AbstractSpinnerService, useClass: SpinnerServiceImpl },
                { provide: AbstractNavigationService, useClass: NavigationServiceImpl },
                { provide: AppDefaults, useClass: AppDefaultsService },
                { provide: DynamicComponentRefProvider, useClass: DynamicComponentRefProviderService },
                {
                    provide: APP_INITIALIZER,
                    useFactory: InitializeApp,
                    deps: [AbstractI18nService],
                    multi: true
                },
                {
                    provide: LOCALE_ID,
                    useFactory: setAngularLocale,
                    deps: [AbstractI18nService]
                },
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: HttpCallInterceptor,
                    multi: true
                },
                DecimalPipe,
                DatePipe,
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
    }
}
RuntimeBaseModule.decorators = [
    { type: NgModule, args: [{
                declarations: definitions,
                imports: [
                    CommonModule,
                    FormsModule,
                    RouterModule,
                    ReactiveFormsModule,
                    HttpClientModule,
                    carouselModule,
                    bsDropDownModule,
                    popoverModule,
                    tooltipModule,
                    ModalModule,
                    WmComponentsModule,
                    MobileRuntimeModule,
                    CoreModule,
                    SecurityModule,
                    OAuthModule,
                    VariablesModule,
                    HttpServiceModule,
                ],
                exports: [
                    definitions,
                    CommonModule,
                    FormsModule,
                    ReactiveFormsModule,
                    ModalModule,
                    CarouselModule,
                    BsDropdownModule,
                    PopoverModule,
                    TooltipModule,
                    WmComponentsModule,
                    MobileRuntimeModule,
                    CoreModule,
                    SecurityModule,
                    OAuthModule,
                    VariablesModule,
                    HttpServiceModule
                ],
                entryComponents: [CustomToasterComponent]
            },] }
];
/** @nocollapse */
RuntimeBaseModule.ctorParameters = () => [];
const WM_MODULES_FOR_ROOT = [
    WmComponentsModule.forRoot(),
    MobileRuntimeModule.forRoot(),
    ModalModule.forRoot(),
    CoreModule.forRoot(),
    SecurityModule.forRoot(),
    OAuthModule.forRoot(),
    VariablesModule.forRoot(),
    HttpServiceModule.forRoot(),
    RuntimeBaseModule.forRoot()
];

let appVariablesLoaded = false;
class AppVariablesResolve {
    constructor(appManager$$1, appVariablesProvider) {
        this.appManager = appManager$$1;
        this.appVariablesProvider = appVariablesProvider;
    }
    resolve() {
        // execute app.js
        if (appVariablesLoaded) {
            return true;
        }
        return this.appVariablesProvider.getAppVariables()
            .then((variables) => this.appManager.loadAppVariables(variables))
            .then(() => appVariablesLoaded = true);
    }
}
AppVariablesResolve.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
AppVariablesResolve.ctorParameters = () => [
    { type: AppManagerService },
    { type: AppVariablesProvider }
];
AppVariablesResolve.ngInjectableDef = defineInjectable({ factory: function AppVariablesResolve_Factory() { return new AppVariablesResolve(inject(AppManagerService), inject(AppVariablesProvider)); }, token: AppVariablesResolve, providedIn: "root" });

let metadataResolved = false;
class MetadataResolve {
    constructor(appManager$$1) {
        this.appManager = appManager$$1;
    }
    resolve() {
        return metadataResolved || this.appManager.loadMetadata().then(() => metadataResolved = true);
    }
}
MetadataResolve.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
MetadataResolve.ctorParameters = () => [
    { type: AppManagerService }
];
MetadataResolve.ngInjectableDef = defineInjectable({ factory: function MetadataResolve_Factory() { return new MetadataResolve(inject(AppManagerService)); }, token: MetadataResolve, providedIn: "root" });

class SecurityConfigResolve {
    constructor(appManager$$1) {
        this.appManager = appManager$$1;
        // if the project type is PREFAB, setting this flag will not trigger security/info call
        this.loaded = this.appManager.isPrefabType() || this.appManager.isTemplateBundleType() || !getWmProjectProperties().securityEnabled;
    }
    resolve() {
        return this.loaded || this.appManager.loadSecurityConfig().then(() => {
            this.loaded = true;
        });
    }
}
SecurityConfigResolve.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
SecurityConfigResolve.ctorParameters = () => [
    { type: AppManagerService }
];
SecurityConfigResolve.ngInjectableDef = defineInjectable({ factory: function SecurityConfigResolve_Factory() { return new SecurityConfigResolve(inject(AppManagerService)); }, token: SecurityConfigResolve, providedIn: "root" });

/**
 * Generated bundle index. Do not edit.
 */

export { AppSpinnerComponent as ɵd, CustomToasterComponent as ɵe, AccessrolesDirective as ɵb, PartialContainerDirective as ɵc, PrefabDirective$1 as ɵf, AppDefaultsService as ɵm, AppRef as ɵh, DynamicComponentRefProviderService as ɵn, HttpCallInterceptor as ɵo, I18nServiceImpl as ɵj, NavigationServiceImpl as ɵl, PipeProvider as ɵg, SpinnerServiceImpl as ɵk, ToasterServiceImpl as ɵi, FragmentMonitor as ɵa, ComponentType, ComponentRefProvider, PrefabConfigProvider, AppJSProvider, AppVariablesProvider, PartialRefProvider, AppManagerService, PrefabManagerService, ɵ0, BasePageComponent, commonPartialWidgets, BasePartialComponent, BasePrefabComponent, InitializeApp, setAngularLocale, carouselModule, bsDropDownModule, popoverModule, tooltipModule, RuntimeBaseModule, WM_MODULES_FOR_ROOT, isPrefabInPreview, getPrefabBaseUrl, getPrefabConfigUrl, getPrefabMinJsonUrl, AuthGuard, RoleGuard, PageNotFoundGaurd, AppComponent, EmptyPageComponent, PrefabPreviewComponent, AppJSResolve, AppVariablesResolve, I18nResolve, MetadataResolve, SecurityConfigResolve, CanDeactivatePageGuard };

//# sourceMappingURL=index.js.map