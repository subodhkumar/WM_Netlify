(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/platform-browser-dynamic'), require('@angular/platform-browser'), require('@angular/common'), require('@angular/platform-browser/animations'), require('ngx-toastr'), require('@angular/router'), require('@wm/variables'), require('@wm/security'), require('@angular/common/http'), require('@wm/core'), require('@wm/transpiler'), require('@angular/core'), require('@wm/runtime/base')) :
    typeof define === 'function' && define.amd ? define('@wm/runtime/dynamic', ['exports', '@angular/platform-browser-dynamic', '@angular/platform-browser', '@angular/common', '@angular/platform-browser/animations', 'ngx-toastr', '@angular/router', '@wm/variables', '@wm/security', '@angular/common/http', '@wm/core', '@wm/transpiler', '@angular/core', '@wm/runtime/base'], factory) :
    (factory((global.wm = global.wm || {}, global.wm.runtime = global.wm.runtime || {}, global.wm.runtime.dynamic = {}),global.ng.platformBrowserDynamic,global.ng.platformBrowser,global.ng.common,global.ng.platformBrowser.animations,global.ngxToastr,global.ng.router,global.wm.variables,global.wm.security,global.ng.common.http,global.wm.core,global.wm.transpiler,global.ng.core,global.wm.runtime.base));
}(this, (function (exports,platformBrowserDynamic,platformBrowser,common,animations,ngxToastr,router,variables,security,i1,core,transpiler,i0,base) { 'use strict';

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

    var PageWrapperComponent = /** @class */ (function () {
        function PageWrapperComponent(injector, route, vcRef, appRef, metadataService, securityService, appManager, app, ngZone, elRef, spinnerService, componentRefProvider, router$$1) {
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
            this.router = router$$1;
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
                .then(function () {
                return __awaiter(_this, void 0, void 0, function () {
                    var pageComponentFactoryRef, instance;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.componentRefProvider.getComponentFactoryRef(pageName, base.ComponentType.PAGE)];
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
                });
            });
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
                retVal = (this.app.onBeforePageLeave || core.noop)(this.app.activePageName, this.app.activePage);
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
            { type: i0.Component, args: [{
                        selector: 'app-page-outlet',
                        template: '<div></div>'
                    }] }
        ];
        /** @nocollapse */
        PageWrapperComponent.ctorParameters = function () {
            return [
                { type: i0.Injector },
                { type: router.ActivatedRoute },
                { type: i0.ViewContainerRef },
                { type: i0.ApplicationRef },
                { type: variables.MetadataService },
                { type: security.SecurityService },
                { type: base.AppManagerService },
                { type: core.App },
                { type: i0.NgZone },
                { type: i0.ElementRef },
                { type: core.AbstractSpinnerService },
                { type: base.ComponentRefProvider },
                { type: router.Router }
            ];
        };
        PageWrapperComponent.propDecorators = {
            canDeactivate: [{ type: i0.HostListener, args: ['window:beforeunload',] }]
        };
        return PageWrapperComponent;
    }());

    var appDependenciesResolve = {
        securityConfig: base.SecurityConfigResolve,
        metadata: base.MetadataResolve,
        appJS: base.AppJSResolve
    };
    var routes = [
        {
            path: '',
            pathMatch: 'full',
            resolve: appDependenciesResolve,
            component: base.EmptyPageComponent
        },
        {
            path: 'prefab-preview',
            pathMatch: 'full',
            resolve: appDependenciesResolve,
            component: base.PrefabPreviewComponent
        },
        {
            path: ':pageName',
            pathMatch: 'full',
            resolve: appDependenciesResolve,
            component: PageWrapperComponent,
            canDeactivate: [base.CanDeactivatePageGuard]
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
            { type: i0.Injectable, args: [{
                        providedIn: 'root'
                    },] }
        ];
        /** @nocollapse */
        AppJSProviderService.ctorParameters = function () {
            return [
                { type: i1.HttpClient }
            ];
        };
        AppJSProviderService.ngInjectableDef = i0.defineInjectable({ factory: function AppJSProviderService_Factory() { return new AppJSProviderService(i0.inject(i1.HttpClient)); }, token: AppJSProviderService, providedIn: "root" });
        return AppJSProviderService;
    }(base.AppJSProvider));

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
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        AppResourceManagerService.ctorParameters = function () {
            return [
                { type: core.AbstractHttpService }
            ];
        };
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
            { type: i0.Injectable, args: [{
                        providedIn: 'root'
                    },] }
        ];
        /** @nocollapse */
        AppVariablesProviderService.ctorParameters = function () {
            return [
                { type: AppResourceManagerService }
            ];
        };
        AppVariablesProviderService.ngInjectableDef = i0.defineInjectable({ factory: function AppVariablesProviderService_Factory() { return new AppVariablesProviderService(i0.inject(AppResourceManagerService)); }, token: AppVariablesProviderService, providedIn: "root" });
        return AppVariablesProviderService;
    }(base.AppVariablesProvider));

    var fragmentCache = new Map();
    window.resourceCache = fragmentCache;
    var componentFactoryRefCache = new Map();
    componentFactoryRefCache.set(base.ComponentType.PAGE, new Map());
    componentFactoryRefCache.set(base.ComponentType.PARTIAL, new Map());
    componentFactoryRefCache.set(base.ComponentType.PREFAB, new Map());
    var _decodeURIComponent = function (str) { return decodeURIComponent(str.replace(/\+/g, ' ')); };
    var getFragmentUrl = function (fragmentName, type) {
        if (type === base.ComponentType.PAGE || type === base.ComponentType.PARTIAL) {
            return "./pages/" + fragmentName + "/page.min.json";
        }
        else if (type === base.ComponentType.PREFAB) {
            return base.getPrefabMinJsonUrl(fragmentName);
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
                { type: i0.NgModule, args: [{
                            declarations: [componentRef],
                            imports: [
                                base.RuntimeBaseModule
                            ],
                            schemas: [i0.CUSTOM_ELEMENTS_SCHEMA, i0.NO_ERRORS_SCHEMA]
                        },] },
            ];
            return DynamicModule;
        }());
        return DynamicModule;
    };
    var getDynamicComponent = function (componentName, type, template, css, script, variables$$1) {
        var componentDef = {
            template: template,
            styles: [css],
            encapsulation: i0.ViewEncapsulation.None
        };
        var BaseClass = BaseDynamicComponent;
        var selector = '';
        var context = '';
        switch (type) {
            case base.ComponentType.PAGE:
                BaseClass = base.BasePageComponent;
                selector = "app-page-" + componentName;
                context = 'Page';
                break;
            case base.ComponentType.PARTIAL:
                BaseClass = base.BasePartialComponent;
                selector = "app-partial-" + componentName;
                context = 'Partial';
                break;
            case base.ComponentType.PREFAB:
                BaseClass = base.BasePrefabComponent;
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
                    case base.ComponentType.PAGE:
                        _this.pageName = componentName;
                        break;
                    case base.ComponentType.PARTIAL:
                        _this.partialName = componentName;
                        break;
                    case base.ComponentType.PREFAB:
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
                return JSON.parse(variables$$1);
            };
            DynamicComponent.decorators = [
                { type: i0.Component, args: [__assign({}, componentDef, { selector: selector, providers: [
                                {
                                    provide: core.UserDefinedExecutionContext,
                                    useExisting: DynamicComponent
                                }
                            ] }),] },
            ];
            /** @nocollapse */
            DynamicComponent.ctorParameters = function () {
                return [
                    { type: i0.Injector }
                ];
            };
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
                var markup = _a.markup, script = _a.script, styles = _a.styles, variables$$1 = _a.variables;
                var response = {
                    markup: transpiler.transpile(_decodeURIComponent(markup)),
                    script: _decodeURIComponent(script),
                    styles: transpiler.scopeComponentStyles(componentName, componentType, _decodeURIComponent(styles)),
                    variables: core.getValidJSON(_decodeURIComponent(variables$$1))
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
                            var markup = _a.markup, script = _a.script, styles = _a.styles, variables$$1 = _a.variables;
                            var componentDef = getDynamicComponent(componentName, componentType, markup, styles, script, JSON.stringify(variables$$1));
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
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        ComponentRefProviderService.ctorParameters = function () {
            return [
                { type: AppResourceManagerService },
                { type: core.App },
                { type: base.AppManagerService },
                { type: i0.Compiler }
            ];
        };
        return ComponentRefProviderService;
    }(base.ComponentRefProvider));

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
            return this.resourceMngr.get(base.getPrefabConfigUrl(prefabName))
                .then(function (_config) {
                cache$1.set(prefabName, _config);
                return _config;
            });
        };
        PrefabConfigProviderService.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        PrefabConfigProviderService.ctorParameters = function () {
            return [
                { type: AppResourceManagerService }
            ];
        };
        return PrefabConfigProviderService;
    }(base.PrefabConfigProvider));

    var routerModule = router.RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'top' });
    var toastrModule = ngxToastr.ToastrModule.forRoot({ maxOpened: 1, autoDismiss: true });
    var httpClientXsrfModule = i1.HttpClientXsrfModule.withOptions({
        cookieName: 'wm_xsrf_token',
        headerName: core.getWmProjectProperties().xsrf_header_name
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
            { type: i0.NgModule, args: [{
                        declarations: [
                            PageWrapperComponent
                        ],
                        imports: [
                            platformBrowser.BrowserModule,
                            common.CommonModule,
                            router.RouterModule,
                            i1.HttpClientModule,
                            animations.BrowserAnimationsModule,
                            routerModule,
                            toastrModule,
                            httpClientXsrfModule,
                            base.WM_MODULES_FOR_ROOT
                        ],
                        providers: [
                            AppResourceManagerService,
                            { provide: base.AppJSProvider, useClass: AppJSProviderService },
                            { provide: base.AppVariablesProvider, useClass: AppVariablesProviderService },
                            { provide: base.ComponentRefProvider, useClass: ComponentRefProviderService },
                            { provide: base.PartialRefProvider, useClass: ComponentRefProviderService },
                            { provide: base.PrefabConfigProvider, useClass: PrefabConfigProviderService }
                        ],
                        bootstrap: [base.AppComponent]
                    },] }
        ];
        /** @nocollapse */
        AppModule.ctorParameters = function () {
            return [
                { type: core.App },
                { type: i0.Injector },
                { type: base.ComponentRefProvider }
            ];
        };
        return AppModule;
    }());

    var DEBUG_MODE = 'debugMode';
    if (sessionStorage.getItem(DEBUG_MODE) !== 'true') {
        i0.enableProdMode();
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
        }).then(function () { return platformBrowserDynamic.platformBrowserDynamic().bootstrapModule(AppModule); })
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

    exports.ɵa = routes;
    exports.ɵb = PageWrapperComponent;
    exports.ɵd = AppJSProviderService;
    exports.ɵc = AppResourceManagerService;
    exports.ɵe = AppVariablesProviderService;
    exports.ɵf = ComponentRefProviderService;
    exports.ɵg = PrefabConfigProviderService;
    exports.routerModule = routerModule;
    exports.toastrModule = toastrModule;
    exports.httpClientXsrfModule = httpClientXsrfModule;
    exports.AppModule = AppModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=index.umd.js.map