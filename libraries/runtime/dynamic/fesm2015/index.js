import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MetadataService } from '@wm/variables';
import { SecurityService } from '@wm/security';
import { HttpClient, HttpClientXsrfModule, HttpClientModule } from '@angular/common/http';
import { __awaiter } from 'tslib';
import { AbstractSpinnerService, App, noop, AbstractHttpService, getValidJSON, UserDefinedExecutionContext, getWmProjectProperties } from '@wm/core';
import { transpile, scopeComponentStyles } from '@wm/transpiler';
import { ApplicationRef, Component, ElementRef, Injector, NgZone, ViewContainerRef, HostListener, Injectable, enableProdMode, NgModule, defineInjectable, inject, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, ViewEncapsulation, Compiler } from '@angular/core';
import { AppManagerService, ComponentRefProvider, ComponentType, AppJSResolve, MetadataResolve, SecurityConfigResolve, PrefabPreviewComponent, CanDeactivatePageGuard, EmptyPageComponent, AppJSProvider, AppVariablesProvider, BasePageComponent, BasePartialComponent, BasePrefabComponent, RuntimeBaseModule, getPrefabMinJsonUrl, getPrefabConfigUrl, PrefabConfigProvider, AppComponent, WM_MODULES_FOR_ROOT, PartialRefProvider } from '@wm/runtime/base';

class PageWrapperComponent {
    constructor(injector, route, vcRef, appRef, metadataService, securityService, appManager, app, ngZone, elRef, spinnerService, componentRefProvider, router) {
        this.injector = injector;
        this.route = route;
        this.vcRef = vcRef;
        this.appRef = appRef;
        this.metadataService = metadataService;
        this.securityService = securityService;
        this.appManager = appManager;
        this.app = app;
        this.ngZone = ngZone;
        this.elRef = elRef;
        this.spinnerService = spinnerService;
        this.componentRefProvider = componentRefProvider;
        this.router = router;
    }
    getTargetNode() {
        return this.elRef.nativeElement;
    }
    resetViewContainer() {
        this.vcRef.clear();
        const $target = this.getTargetNode();
        $target.innerHTML = '';
    }
    renderPage(pageName) {
        const $target = this.getTargetNode();
        this.appManager.loadAppVariables()
            .then(() => __awaiter(this, void 0, void 0, function* () {
            const pageComponentFactoryRef = yield this.componentRefProvider.getComponentFactoryRef(pageName, ComponentType.PAGE);
            if (pageComponentFactoryRef) {
                const instance = this.vcRef.createComponent(pageComponentFactoryRef, 0, this.injector);
                $target.appendChild(instance.location.nativeElement);
            }
            if (this.vcRef.length > 1) {
                this.vcRef.remove(1);
            }
        }));
    }
    renderPrefabPreviewPage() {
        this.router.navigate(['prefab-preview']);
    }
    /**
     * canDeactivate is called before a route change.
     * This will internally call onBeforePageLeave method present
     * at page level and app level in the application and decide
     * whether to change route or not based on return value.
     */
    canDeactivate() {
        let retVal;
        // Calling onBeforePageLeave method present at page level
        retVal = this.app.activePage && this.app.activePage.onBeforePageLeave();
        // Calling onBeforePageLeave method present at app level only if page level method return true
        // or if there is no page level method
        if (retVal !== false) {
            retVal = (this.app.onBeforePageLeave || noop)(this.app.activePageName, this.app.activePage);
        }
        return retVal === undefined ? true : retVal;
    }
    ngOnInit() {
        if (this.app.isPrefabType) {
            // there is only one route
            this.renderPrefabPreviewPage();
        }
        else {
            $(this.getTargetNode()).find('>div:first').remove();
            this.subscription = this.route.params.subscribe(({ pageName }) => {
                this.ngZone.run(() => {
                    if (pageName) {
                        this.renderPage(pageName);
                    }
                });
            });
        }
    }
    ngOnDestroy() {
        this.vcRef.clear();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
PageWrapperComponent.decorators = [
    { type: Component, args: [{
                selector: 'app-page-outlet',
                template: '<div></div>'
            }] }
];
/** @nocollapse */
PageWrapperComponent.ctorParameters = () => [
    { type: Injector },
    { type: ActivatedRoute },
    { type: ViewContainerRef },
    { type: ApplicationRef },
    { type: MetadataService },
    { type: SecurityService },
    { type: AppManagerService },
    { type: App },
    { type: NgZone },
    { type: ElementRef },
    { type: AbstractSpinnerService },
    { type: ComponentRefProvider },
    { type: Router }
];
PageWrapperComponent.propDecorators = {
    canDeactivate: [{ type: HostListener, args: ['window:beforeunload',] }]
};

const appDependenciesResolve = {
    securityConfig: SecurityConfigResolve,
    metadata: MetadataResolve,
    appJS: AppJSResolve
};
const routes = [
    {
        path: '',
        pathMatch: 'full',
        resolve: appDependenciesResolve,
        component: EmptyPageComponent
    },
    {
        path: 'prefab-preview',
        pathMatch: 'full',
        resolve: appDependenciesResolve,
        component: PrefabPreviewComponent
    },
    {
        path: ':pageName',
        pathMatch: 'full',
        resolve: appDependenciesResolve,
        component: PageWrapperComponent,
        canDeactivate: [CanDeactivatePageGuard]
    }
];

class AppJSProviderService extends AppJSProvider {
    constructor($http) {
        super();
        this.$http = $http;
    }
    getAppScriptFn() {
        return this.$http.get('./app.js', { responseType: 'text' })
            .toPromise()
            .then(script => new Function('App', 'Utils', 'Injector', script));
    }
}
AppJSProviderService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
AppJSProviderService.ctorParameters = () => [
    { type: HttpClient }
];
AppJSProviderService.ngInjectableDef = defineInjectable({ factory: function AppJSProviderService_Factory() { return new AppJSProviderService(inject(HttpClient)); }, token: AppJSProviderService, providedIn: "root" });

const cache = new Map();
class AppResourceManagerService {
    constructor($http) {
        this.$http = $http;
    }
    get(url, useCache) {
        const cachedResponse = cache.get(url);
        if (cachedResponse) {
            return Promise.resolve(cachedResponse);
        }
        return this.$http.get(url).then(response => {
            if (useCache) {
                cache.set(url, response);
            }
            return response;
        });
    }
    clearCache() {
        cache.clear();
    }
}
AppResourceManagerService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
AppResourceManagerService.ctorParameters = () => [
    { type: AbstractHttpService }
];

class AppVariablesProviderService extends AppVariablesProvider {
    constructor(resourceManager) {
        super();
        this.resourceManager = resourceManager;
    }
    getAppVariables() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.resourceManager.get('./app.variables.json');
        });
    }
}
AppVariablesProviderService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
AppVariablesProviderService.ctorParameters = () => [
    { type: AppResourceManagerService }
];
AppVariablesProviderService.ngInjectableDef = defineInjectable({ factory: function AppVariablesProviderService_Factory() { return new AppVariablesProviderService(inject(AppResourceManagerService)); }, token: AppVariablesProviderService, providedIn: "root" });

const fragmentCache = new Map();
window.resourceCache = fragmentCache;
const componentFactoryRefCache = new Map();
componentFactoryRefCache.set(ComponentType.PAGE, new Map());
componentFactoryRefCache.set(ComponentType.PARTIAL, new Map());
componentFactoryRefCache.set(ComponentType.PREFAB, new Map());
const _decodeURIComponent = (str) => decodeURIComponent(str.replace(/\+/g, ' '));
const getFragmentUrl = (fragmentName, type) => {
    if (type === ComponentType.PAGE || type === ComponentType.PARTIAL) {
        return `./pages/${fragmentName}/page.min.json`;
    }
    else if (type === ComponentType.PREFAB) {
        return getPrefabMinJsonUrl(fragmentName);
    }
};
const scriptCache = new Map();
const execScript = (script, identifier, ctx, instance, app, utils) => {
    let fn = scriptCache.get(identifier);
    if (!fn) {
        fn = new Function(ctx, 'App', 'Utils', script);
        scriptCache.set(identifier, fn);
    }
    fn(instance, app, utils);
};
class BaseDynamicComponent {
    init() { }
}
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
const getDynamicComponent = (componentName, type, template, css, script, variables) => {
    const componentDef = {
        template,
        styles: [css],
        encapsulation: ViewEncapsulation.None
    };
    let BaseClass = BaseDynamicComponent;
    let selector = '';
    let context = '';
    switch (type) {
        case ComponentType.PAGE:
            BaseClass = BasePageComponent;
            selector = `app-page-${componentName}`;
            context = 'Page';
            break;
        case ComponentType.PARTIAL:
            BaseClass = BasePartialComponent;
            selector = `app-partial-${componentName}`;
            context = 'Partial';
            break;
        case ComponentType.PREFAB:
            BaseClass = BasePrefabComponent;
            selector = `app-prefab-${componentName}`;
            context = 'Prefab';
            break;
    }
    class DynamicComponent extends BaseClass {
        constructor(injector) {
            super();
            this.injector = injector;
            switch (type) {
                case ComponentType.PAGE:
                    this.pageName = componentName;
                    break;
                case ComponentType.PARTIAL:
                    this.partialName = componentName;
                    break;
                case ComponentType.PREFAB:
                    this.prefabName = componentName;
                    break;
            }
            super.init();
        }
        evalUserScript(instance, appContext, utils) {
            execScript(script, selector, context, instance, appContext, utils);
        }
        getVariables() {
            return JSON.parse(variables);
        }
    }
    DynamicComponent.decorators = [
        { type: Component, args: [Object.assign({}, componentDef, { selector, providers: [
                        {
                            provide: UserDefinedExecutionContext,
                            useExisting: DynamicComponent
                        }
                    ] }),] },
    ];
    /** @nocollapse */
    DynamicComponent.ctorParameters = () => [
        { type: Injector }
    ];
    return DynamicComponent;
};
class ComponentRefProviderService extends ComponentRefProvider {
    constructor(resouceMngr, app, appManager, compiler) {
        super();
        this.resouceMngr = resouceMngr;
        this.app = app;
        this.appManager = appManager;
        this.compiler = compiler;
    }
    loadResourcesOfFragment(componentName, componentType) {
        const url = getFragmentUrl(componentName, componentType);
        const resource = fragmentCache.get(url);
        if (resource) {
            return Promise.resolve(resource);
        }
        return this.resouceMngr.get(url, true)
            .then(({ markup, script, styles, variables }) => {
            const response = {
                markup: transpile(_decodeURIComponent(markup)),
                script: _decodeURIComponent(script),
                styles: scopeComponentStyles(componentName, componentType, _decodeURIComponent(styles)),
                variables: getValidJSON(_decodeURIComponent(variables))
            };
            fragmentCache.set(url, response);
            return response;
        }, e => {
            const status = e.details.status;
            const errorMsgMap = {
                404: this.app.appLocale.MESSAGE_PAGE_NOT_FOUND || 'The page you are trying to reach is not available',
                403: this.app.appLocale.LABEL_ACCESS_DENIED || 'Access Denied'
            };
            return Promise.reject(errorMsgMap[status]);
        });
    }
    getComponentFactoryRef(componentName, componentType) {
        return __awaiter(this, void 0, void 0, function* () {
            // check in the cache.
            const componentFactoryMap = componentFactoryRefCache.get(componentType);
            let componentFactoryRef;
            if (componentFactoryMap) {
                componentFactoryRef = componentFactoryMap.get(componentName);
                if (componentFactoryRef) {
                    return componentFactoryRef;
                }
            }
            return this.loadResourcesOfFragment(componentName, componentType)
                .then(({ markup, script, styles, variables }) => {
                const componentDef = getDynamicComponent(componentName, componentType, markup, styles, script, JSON.stringify(variables));
                const moduleDef = getDynamicModule(componentDef);
                componentFactoryRef = this.compiler
                    .compileModuleAndAllComponentsSync(moduleDef)
                    .componentFactories
                    .filter(factory => factory.componentType === componentDef)[0];
                componentFactoryRefCache.get(componentType).set(componentName, componentFactoryRef);
                return componentFactoryRef;
            }, (err) => {
                if (err) {
                    this.appManager.notifyApp(err, 'error');
                }
            });
        });
    }
    // clears the cache map
    clearComponentFactoryRefCache() {
        this.resouceMngr.clearCache();
        fragmentCache.clear();
        componentFactoryRefCache.forEach(map => {
            map.clear();
        });
    }
}
ComponentRefProviderService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
ComponentRefProviderService.ctorParameters = () => [
    { type: AppResourceManagerService },
    { type: App },
    { type: AppManagerService },
    { type: Compiler }
];

const cache$1 = new Map();
class PrefabConfigProviderService extends PrefabConfigProvider {
    constructor(resourceMngr) {
        super();
        this.resourceMngr = resourceMngr;
    }
    getConfig(prefabName) {
        const config = cache$1.get(prefabName);
        if (config) {
            return Promise.resolve(config);
        }
        return this.resourceMngr.get(getPrefabConfigUrl(prefabName))
            .then(_config => {
            cache$1.set(prefabName, _config);
            return _config;
        });
    }
}
PrefabConfigProviderService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
PrefabConfigProviderService.ctorParameters = () => [
    { type: AppResourceManagerService }
];

const routerModule = RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'top' });
const toastrModule = ToastrModule.forRoot({ maxOpened: 1, autoDismiss: true });
const httpClientXsrfModule = HttpClientXsrfModule.withOptions({
    cookieName: 'wm_xsrf_token',
    headerName: getWmProjectProperties().xsrf_header_name
});
class AppModule {
    constructor(app, inj, componentRefProvider) {
        this.app = app;
        this.inj = inj;
        this.componentRefProvider = componentRefProvider;
        if (window['cordova']) {
            // clear the cached urls on logout, to load the Login Page and not the Main Page as app reload(window.location.reload) is not invoked in mobile
            this.app.subscribe('userLoggedOut', this.componentRefProvider.clearComponentFactoryRefCache.bind(this.componentRefProvider));
        }
    }
}
AppModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    PageWrapperComponent
                ],
                imports: [
                    BrowserModule,
                    CommonModule,
                    RouterModule,
                    HttpClientModule,
                    BrowserAnimationsModule,
                    routerModule,
                    toastrModule,
                    httpClientXsrfModule,
                    WM_MODULES_FOR_ROOT
                ],
                providers: [
                    AppResourceManagerService,
                    { provide: AppJSProvider, useClass: AppJSProviderService },
                    { provide: AppVariablesProvider, useClass: AppVariablesProviderService },
                    { provide: ComponentRefProvider, useClass: ComponentRefProviderService },
                    { provide: PartialRefProvider, useClass: ComponentRefProviderService },
                    { provide: PrefabConfigProvider, useClass: PrefabConfigProviderService }
                ],
                bootstrap: [AppComponent]
            },] }
];
/** @nocollapse */
AppModule.ctorParameters = () => [
    { type: App },
    { type: Injector },
    { type: ComponentRefProvider }
];

const DEBUG_MODE = 'debugMode';
if (sessionStorage.getItem(DEBUG_MODE) !== 'true') {
    enableProdMode();
}
console.time('bootstrap');
document.addEventListener('DOMContentLoaded', () => {
    new Promise(resolve => {
        if (window['cordova']) {
            document.addEventListener('deviceready', resolve);
        }
        else {
            resolve();
        }
    }).then(() => platformBrowserDynamic().bootstrapModule(AppModule))
        .then(() => console.timeEnd('bootstrap'), err => console.log(err));
});
window.debugMode = function (on) {
    if (_.isEmpty(on)) {
        on = true;
    }
    const value = on ? 'true' : 'false';
    if (sessionStorage.getItem(DEBUG_MODE) !== value) {
        sessionStorage.setItem(DEBUG_MODE, value);
        window.location.reload();
    }
};

/**
 * Generated bundle index. Do not edit.
 */

export { routes as ɵa, PageWrapperComponent as ɵb, AppJSProviderService as ɵd, AppResourceManagerService as ɵc, AppVariablesProviderService as ɵe, ComponentRefProviderService as ɵf, PrefabConfigProviderService as ɵg, routerModule, toastrModule, httpClientXsrfModule, AppModule };

//# sourceMappingURL=index.js.map