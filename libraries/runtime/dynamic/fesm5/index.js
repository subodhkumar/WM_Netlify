import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MetadataService } from '@wm/variables';
import { SecurityService } from '@wm/security';
import { HttpClient, HttpClientXsrfModule, HttpClientModule } from '@angular/common/http';
import { AbstractSpinnerService, App, noop, AbstractHttpService, getValidJSON, UserDefinedExecutionContext, getWmProjectProperties } from '@wm/core';
import { transpile, scopeComponentStyles } from '@wm/transpiler';
import { __extends, __awaiter, __generator, __assign } from 'tslib';
import { ApplicationRef, Component, ElementRef, Injector, NgZone, ViewContainerRef, HostListener, Injectable, enableProdMode, NgModule, defineInjectable, inject, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, ViewEncapsulation, Compiler } from '@angular/core';
import { AppManagerService, ComponentRefProvider, ComponentType, AppJSResolve, MetadataResolve, SecurityConfigResolve, PrefabPreviewComponent, CanDeactivatePageGuard, EmptyPageComponent, AppJSProvider, AppVariablesProvider, BasePageComponent, BasePartialComponent, BasePrefabComponent, RuntimeBaseModule, getPrefabMinJsonUrl, getPrefabConfigUrl, PrefabConfigProvider, AppComponent, WM_MODULES_FOR_ROOT, PartialRefProvider } from '@wm/runtime/base';

var PageWrapperComponent = /** @class */ (function () {
    function PageWrapperComponent(injector, route, vcRef, appRef, metadataService, securityService, appManager, app, ngZone, elRef, spinnerService, componentRefProvider, router) {
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
    PageWrapperComponent.prototype.getTargetNode = function () {
        return this.elRef.nativeElement;
    };
    PageWrapperComponent.prototype.resetViewContainer = function () {
        this.vcRef.clear();
        var $target = this.getTargetNode();
        $target.innerHTML = '';
    };
    PageWrapperComponent.prototype.renderPage = function (pageName) {
        var _this = this;
        var $target = this.getTargetNode();
        this.appManager.loadAppVariables()
            .then(function () { return __awaiter(_this, void 0, void 0, function () {
            var pageComponentFactoryRef, instance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.componentRefProvider.getComponentFactoryRef(pageName, ComponentType.PAGE)];
                    case 1:
                        pageComponentFactoryRef = _a.sent();
                        if (pageComponentFactoryRef) {
                            instance = this.vcRef.createComponent(pageComponentFactoryRef, 0, this.injector);
                            $target.appendChild(instance.location.nativeElement);
                        }
                        if (this.vcRef.length > 1) {
                            this.vcRef.remove(1);
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    };
    PageWrapperComponent.prototype.renderPrefabPreviewPage = function () {
        this.router.navigate(['prefab-preview']);
    };
    /**
     * canDeactivate is called before a route change.
     * This will internally call onBeforePageLeave method present
     * at page level and app level in the application and decide
     * whether to change route or not based on return value.
     */
    PageWrapperComponent.prototype.canDeactivate = function () {
        var retVal;
        // Calling onBeforePageLeave method present at page level
        retVal = this.app.activePage && this.app.activePage.onBeforePageLeave();
        // Calling onBeforePageLeave method present at app level only if page level method return true
        // or if there is no page level method
        if (retVal !== false) {
            retVal = (this.app.onBeforePageLeave || noop)(this.app.activePageName, this.app.activePage);
        }
        return retVal === undefined ? true : retVal;
    };
    PageWrapperComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.app.isPrefabType) {
            // there is only one route
            this.renderPrefabPreviewPage();
        }
        else {
            $(this.getTargetNode()).find('>div:first').remove();
            this.subscription = this.route.params.subscribe(function (_a) {
                var pageName = _a.pageName;
                _this.ngZone.run(function () {
                    if (pageName) {
                        _this.renderPage(pageName);
                    }
                });
            });
        }
    };
    PageWrapperComponent.prototype.ngOnDestroy = function () {
        this.vcRef.clear();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    };
    PageWrapperComponent.decorators = [
        { type: Component, args: [{
                    selector: 'app-page-outlet',
                    template: '<div></div>'
                }] }
    ];
    /** @nocollapse */
    PageWrapperComponent.ctorParameters = function () { return [
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
    ]; };
    PageWrapperComponent.propDecorators = {
        canDeactivate: [{ type: HostListener, args: ['window:beforeunload',] }]
    };
    return PageWrapperComponent;
}());

var appDependenciesResolve = {
    securityConfig: SecurityConfigResolve,
    metadata: MetadataResolve,
    appJS: AppJSResolve
};
var routes = [
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

var AppJSProviderService = /** @class */ (function (_super) {
    __extends(AppJSProviderService, _super);
    function AppJSProviderService($http) {
        var _this = _super.call(this) || this;
        _this.$http = $http;
        return _this;
    }
    AppJSProviderService.prototype.getAppScriptFn = function () {
        return this.$http.get('./app.js', { responseType: 'text' })
            .toPromise()
            .then(function (script) { return new Function('App', 'Utils', 'Injector', script); });
    };
    AppJSProviderService.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] }
    ];
    /** @nocollapse */
    AppJSProviderService.ctorParameters = function () { return [
        { type: HttpClient }
    ]; };
    AppJSProviderService.ngInjectableDef = defineInjectable({ factory: function AppJSProviderService_Factory() { return new AppJSProviderService(inject(HttpClient)); }, token: AppJSProviderService, providedIn: "root" });
    return AppJSProviderService;
}(AppJSProvider));

var cache = new Map();
var AppResourceManagerService = /** @class */ (function () {
    function AppResourceManagerService($http) {
        this.$http = $http;
    }
    AppResourceManagerService.prototype.get = function (url, useCache) {
        var cachedResponse = cache.get(url);
        if (cachedResponse) {
            return Promise.resolve(cachedResponse);
        }
        return this.$http.get(url).then(function (response) {
            if (useCache) {
                cache.set(url, response);
            }
            return response;
        });
    };
    AppResourceManagerService.prototype.clearCache = function () {
        cache.clear();
    };
    AppResourceManagerService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    AppResourceManagerService.ctorParameters = function () { return [
        { type: AbstractHttpService }
    ]; };
    return AppResourceManagerService;
}());

var AppVariablesProviderService = /** @class */ (function (_super) {
    __extends(AppVariablesProviderService, _super);
    function AppVariablesProviderService(resourceManager) {
        var _this = _super.call(this) || this;
        _this.resourceManager = resourceManager;
        return _this;
    }
    AppVariablesProviderService.prototype.getAppVariables = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resourceManager.get('./app.variables.json')];
            });
        });
    };
    AppVariablesProviderService.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] }
    ];
    /** @nocollapse */
    AppVariablesProviderService.ctorParameters = function () { return [
        { type: AppResourceManagerService }
    ]; };
    AppVariablesProviderService.ngInjectableDef = defineInjectable({ factory: function AppVariablesProviderService_Factory() { return new AppVariablesProviderService(inject(AppResourceManagerService)); }, token: AppVariablesProviderService, providedIn: "root" });
    return AppVariablesProviderService;
}(AppVariablesProvider));

var fragmentCache = new Map();
window.resourceCache = fragmentCache;
var componentFactoryRefCache = new Map();
componentFactoryRefCache.set(ComponentType.PAGE, new Map());
componentFactoryRefCache.set(ComponentType.PARTIAL, new Map());
componentFactoryRefCache.set(ComponentType.PREFAB, new Map());
var _decodeURIComponent = function (str) { return decodeURIComponent(str.replace(/\+/g, ' ')); };
var getFragmentUrl = function (fragmentName, type) {
    if (type === ComponentType.PAGE || type === ComponentType.PARTIAL) {
        return "./pages/" + fragmentName + "/page.min.json";
    }
    else if (type === ComponentType.PREFAB) {
        return getPrefabMinJsonUrl(fragmentName);
    }
};
var scriptCache = new Map();
var execScript = function (script, identifier, ctx, instance, app, utils) {
    var fn = scriptCache.get(identifier);
    if (!fn) {
        fn = new Function(ctx, 'App', 'Utils', script);
        scriptCache.set(identifier, fn);
    }
    fn(instance, app, utils);
};
var BaseDynamicComponent = /** @class */ (function () {
    function BaseDynamicComponent() {
    }
    BaseDynamicComponent.prototype.init = function () { };
    return BaseDynamicComponent;
}());
var getDynamicModule = function (componentRef) {
    var DynamicModule = /** @class */ (function () {
        function DynamicModule() {
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
    }());
    return DynamicModule;
};
var getDynamicComponent = function (componentName, type, template, css, script, variables) {
    var componentDef = {
        template: template,
        styles: [css],
        encapsulation: ViewEncapsulation.None
    };
    var BaseClass = BaseDynamicComponent;
    var selector = '';
    var context = '';
    switch (type) {
        case ComponentType.PAGE:
            BaseClass = BasePageComponent;
            selector = "app-page-" + componentName;
            context = 'Page';
            break;
        case ComponentType.PARTIAL:
            BaseClass = BasePartialComponent;
            selector = "app-partial-" + componentName;
            context = 'Partial';
            break;
        case ComponentType.PREFAB:
            BaseClass = BasePrefabComponent;
            selector = "app-prefab-" + componentName;
            context = 'Prefab';
            break;
    }
    var DynamicComponent = /** @class */ (function (_super) {
        __extends(DynamicComponent, _super);
        function DynamicComponent(injector) {
            var _this = _super.call(this) || this;
            _this.injector = injector;
            switch (type) {
                case ComponentType.PAGE:
                    _this.pageName = componentName;
                    break;
                case ComponentType.PARTIAL:
                    _this.partialName = componentName;
                    break;
                case ComponentType.PREFAB:
                    _this.prefabName = componentName;
                    break;
            }
            _super.prototype.init.call(_this);
            return _this;
        }
        DynamicComponent.prototype.evalUserScript = function (instance, appContext, utils) {
            execScript(script, selector, context, instance, appContext, utils);
        };
        DynamicComponent.prototype.getVariables = function () {
            return JSON.parse(variables);
        };
        DynamicComponent.decorators = [
            { type: Component, args: [__assign({}, componentDef, { selector: selector, providers: [
                            {
                                provide: UserDefinedExecutionContext,
                                useExisting: DynamicComponent
                            }
                        ] }),] },
        ];
        /** @nocollapse */
        DynamicComponent.ctorParameters = function () { return [
            { type: Injector }
        ]; };
        return DynamicComponent;
    }(BaseClass));
    return DynamicComponent;
};
var ComponentRefProviderService = /** @class */ (function (_super) {
    __extends(ComponentRefProviderService, _super);
    function ComponentRefProviderService(resouceMngr, app, appManager, compiler) {
        var _this = _super.call(this) || this;
        _this.resouceMngr = resouceMngr;
        _this.app = app;
        _this.appManager = appManager;
        _this.compiler = compiler;
        return _this;
    }
    ComponentRefProviderService.prototype.loadResourcesOfFragment = function (componentName, componentType) {
        var _this = this;
        var url = getFragmentUrl(componentName, componentType);
        var resource = fragmentCache.get(url);
        if (resource) {
            return Promise.resolve(resource);
        }
        return this.resouceMngr.get(url, true)
            .then(function (_a) {
            var markup = _a.markup, script = _a.script, styles = _a.styles, variables = _a.variables;
            var response = {
                markup: transpile(_decodeURIComponent(markup)),
                script: _decodeURIComponent(script),
                styles: scopeComponentStyles(componentName, componentType, _decodeURIComponent(styles)),
                variables: getValidJSON(_decodeURIComponent(variables))
            };
            fragmentCache.set(url, response);
            return response;
        }, function (e) {
            var status = e.details.status;
            var errorMsgMap = {
                404: _this.app.appLocale.MESSAGE_PAGE_NOT_FOUND || 'The page you are trying to reach is not available',
                403: _this.app.appLocale.LABEL_ACCESS_DENIED || 'Access Denied'
            };
            return Promise.reject(errorMsgMap[status]);
        });
    };
    ComponentRefProviderService.prototype.getComponentFactoryRef = function (componentName, componentType) {
        return __awaiter(this, void 0, void 0, function () {
            var componentFactoryMap, componentFactoryRef;
            var _this = this;
            return __generator(this, function (_a) {
                componentFactoryMap = componentFactoryRefCache.get(componentType);
                if (componentFactoryMap) {
                    componentFactoryRef = componentFactoryMap.get(componentName);
                    if (componentFactoryRef) {
                        return [2 /*return*/, componentFactoryRef];
                    }
                }
                return [2 /*return*/, this.loadResourcesOfFragment(componentName, componentType)
                        .then(function (_a) {
                        var markup = _a.markup, script = _a.script, styles = _a.styles, variables = _a.variables;
                        var componentDef = getDynamicComponent(componentName, componentType, markup, styles, script, JSON.stringify(variables));
                        var moduleDef = getDynamicModule(componentDef);
                        componentFactoryRef = _this.compiler
                            .compileModuleAndAllComponentsSync(moduleDef)
                            .componentFactories
                            .filter(function (factory) { return factory.componentType === componentDef; })[0];
                        componentFactoryRefCache.get(componentType).set(componentName, componentFactoryRef);
                        return componentFactoryRef;
                    }, function (err) {
                        if (err) {
                            _this.appManager.notifyApp(err, 'error');
                        }
                    })];
            });
        });
    };
    // clears the cache map
    ComponentRefProviderService.prototype.clearComponentFactoryRefCache = function () {
        this.resouceMngr.clearCache();
        fragmentCache.clear();
        componentFactoryRefCache.forEach(function (map) {
            map.clear();
        });
    };
    ComponentRefProviderService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    ComponentRefProviderService.ctorParameters = function () { return [
        { type: AppResourceManagerService },
        { type: App },
        { type: AppManagerService },
        { type: Compiler }
    ]; };
    return ComponentRefProviderService;
}(ComponentRefProvider));

var cache$1 = new Map();
var PrefabConfigProviderService = /** @class */ (function (_super) {
    __extends(PrefabConfigProviderService, _super);
    function PrefabConfigProviderService(resourceMngr) {
        var _this = _super.call(this) || this;
        _this.resourceMngr = resourceMngr;
        return _this;
    }
    PrefabConfigProviderService.prototype.getConfig = function (prefabName) {
        var config = cache$1.get(prefabName);
        if (config) {
            return Promise.resolve(config);
        }
        return this.resourceMngr.get(getPrefabConfigUrl(prefabName))
            .then(function (_config) {
            cache$1.set(prefabName, _config);
            return _config;
        });
    };
    PrefabConfigProviderService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    PrefabConfigProviderService.ctorParameters = function () { return [
        { type: AppResourceManagerService }
    ]; };
    return PrefabConfigProviderService;
}(PrefabConfigProvider));

var routerModule = RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'top' });
var toastrModule = ToastrModule.forRoot({ maxOpened: 1, autoDismiss: true });
var httpClientXsrfModule = HttpClientXsrfModule.withOptions({
    cookieName: 'wm_xsrf_token',
    headerName: getWmProjectProperties().xsrf_header_name
});
var AppModule = /** @class */ (function () {
    function AppModule(app, inj, componentRefProvider) {
        this.app = app;
        this.inj = inj;
        this.componentRefProvider = componentRefProvider;
        if (window['cordova']) {
            // clear the cached urls on logout, to load the Login Page and not the Main Page as app reload(window.location.reload) is not invoked in mobile
            this.app.subscribe('userLoggedOut', this.componentRefProvider.clearComponentFactoryRefCache.bind(this.componentRefProvider));
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
    AppModule.ctorParameters = function () { return [
        { type: App },
        { type: Injector },
        { type: ComponentRefProvider }
    ]; };
    return AppModule;
}());

var DEBUG_MODE = 'debugMode';
if (sessionStorage.getItem(DEBUG_MODE) !== 'true') {
    enableProdMode();
}
console.time('bootstrap');
document.addEventListener('DOMContentLoaded', function () {
    new Promise(function (resolve) {
        if (window['cordova']) {
            document.addEventListener('deviceready', resolve);
        }
        else {
            resolve();
        }
    }).then(function () { return platformBrowserDynamic().bootstrapModule(AppModule); })
        .then(function () { return console.timeEnd('bootstrap'); }, function (err) { return console.log(err); });
});
window.debugMode = function (on) {
    if (_.isEmpty(on)) {
        on = true;
    }
    var value = on ? 'true' : 'false';
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