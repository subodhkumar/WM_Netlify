import * as tslib_1 from "tslib";
import { Compiler, Component, CUSTOM_ELEMENTS_SCHEMA, Injectable, Injector, NgModule, NO_ERRORS_SCHEMA, ViewEncapsulation } from '@angular/core';
import { App, getValidJSON, UserDefinedExecutionContext } from '@wm/core';
import { transpile, scopeComponentStyles } from '@wm/transpiler';
import { AppManagerService, BasePageComponent, BasePartialComponent, BasePrefabComponent, ComponentRefProvider, ComponentType, RuntimeBaseModule, getPrefabMinJsonUrl } from '@wm/runtime/base';
import { AppResourceManagerService } from './app-resource-manager.service';
var fragmentCache = new Map();
window.resourceCache = fragmentCache;
var componentFactoryRefCache = new Map();
componentFactoryRefCache.set(ComponentType.PAGE, new Map());
componentFactoryRefCache.set(ComponentType.PARTIAL, new Map());
componentFactoryRefCache.set(ComponentType.PREFAB, new Map());
var _decodeURIComponent = function (str) { return decodeURIComponent(str.replace(/\+/g, ' ')); };
var ɵ0 = _decodeURIComponent;
var getFragmentUrl = function (fragmentName, type) {
    if (type === ComponentType.PAGE || type === ComponentType.PARTIAL) {
        return "./pages/" + fragmentName + "/page.min.json";
    }
    else if (type === ComponentType.PREFAB) {
        return getPrefabMinJsonUrl(fragmentName);
    }
};
var ɵ1 = getFragmentUrl;
var scriptCache = new Map();
var execScript = function (script, identifier, ctx, instance, app, utils) {
    var fn = scriptCache.get(identifier);
    if (!fn) {
        fn = new Function(ctx, 'App', 'Utils', script);
        scriptCache.set(identifier, fn);
    }
    fn(instance, app, utils);
};
var ɵ2 = execScript;
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
var ɵ3 = getDynamicModule;
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
        tslib_1.__extends(DynamicComponent, _super);
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
            { type: Component, args: [tslib_1.__assign({}, componentDef, { selector: selector, providers: [
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
var ɵ4 = getDynamicComponent;
var ComponentRefProviderService = /** @class */ (function (_super) {
    tslib_1.__extends(ComponentRefProviderService, _super);
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var componentFactoryMap, componentFactoryRef;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
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
export { ComponentRefProviderService };
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LXJlZi1wcm92aWRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvZHluYW1pYy8iLCJzb3VyY2VzIjpbImFwcC9zZXJ2aWNlcy9jb21wb25lbnQtcmVmLXByb3ZpZGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCxRQUFRLEVBQ1IsU0FBUyxFQUNULHNCQUFzQixFQUN0QixVQUFVLEVBQ1YsUUFBUSxFQUNSLFFBQVEsRUFDUixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ3BCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLDJCQUEyQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQzFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRSxPQUFPLEVBQ0gsaUJBQWlCLEVBQ2pCLGlCQUFpQixFQUNqQixvQkFBb0IsRUFDcEIsbUJBQW1CLEVBQ25CLG9CQUFvQixFQUNwQixhQUFhLEVBQ2IsaUJBQWlCLEVBQ2pCLG1CQUFtQixFQUN0QixNQUFNLGtCQUFrQixDQUFDO0FBRTFCLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBWTNFLElBQU0sYUFBYSxHQUFHLElBQUksR0FBRyxFQUFlLENBQUM7QUFFN0MsTUFBTSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7QUFFckMsSUFBTSx3QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBbUMsQ0FBQztBQUU1RSx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBZSxDQUFDLENBQUM7QUFDekUsd0JBQXdCLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLEVBQWUsQ0FBQyxDQUFDO0FBQzVFLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxhQUFhLENB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TSxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsT0FBTyxDQUFDLGFBQWEsS0FBSyxZQUFZLEVBQXRDLENBQXNDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFbEUsd0JBQXdCLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsbUJBQW1CLENBQUMsQ0FBQzt3QkFFcEYsT0FBTyxtQkFBbUIsQ0FBQztvQkFDL0IsQ0FBQyxFQUFFLFVBQUMsR0FBRzt3QkFDSCxJQUFJLEdBQUcsRUFBRTs0QkFDTCxLQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FDckIsR0FBRyxFQUNILE9BQU8sQ0FDVixDQUFDO3lCQUNMO29CQUNMLENBQUMsQ0FBQyxFQUFDOzs7S0FDVjtJQUVELHVCQUF1QjtJQUNoQixtRUFBNkIsR0FBcEM7UUFDSSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzlCLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0Qix3QkFBd0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHO1lBQ2hDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7O2dCQXJGSixVQUFVOzs7O2dCQXBKRix5QkFBeUI7Z0JBYnpCLEdBQUc7Z0JBR1IsaUJBQWlCO2dCQWJqQixRQUFROztJQWlRWixrQ0FBQztDQUFBLEFBdEZELENBQ2lELG9CQUFvQixHQXFGcEU7U0FyRlksMkJBQTJCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDb21waWxlcixcbiAgICBDb21wb25lbnQsXG4gICAgQ1VTVE9NX0VMRU1FTlRTX1NDSEVNQSxcbiAgICBJbmplY3RhYmxlLFxuICAgIEluamVjdG9yLFxuICAgIE5nTW9kdWxlLFxuICAgIE5PX0VSUk9SU19TQ0hFTUEsXG4gICAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEFwcCwgZ2V0VmFsaWRKU09OLCBVc2VyRGVmaW5lZEV4ZWN1dGlvbkNvbnRleHQgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyB0cmFuc3BpbGUsIHNjb3BlQ29tcG9uZW50U3R5bGVzIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuaW1wb3J0IHtcbiAgICBBcHBNYW5hZ2VyU2VydmljZSxcbiAgICBCYXNlUGFnZUNvbXBvbmVudCxcbiAgICBCYXNlUGFydGlhbENvbXBvbmVudCxcbiAgICBCYXNlUHJlZmFiQ29tcG9uZW50LFxuICAgIENvbXBvbmVudFJlZlByb3ZpZGVyLFxuICAgIENvbXBvbmVudFR5cGUsXG4gICAgUnVudGltZUJhc2VNb2R1bGUsXG4gICAgZ2V0UHJlZmFiTWluSnNvblVybFxufSBmcm9tICdAd20vcnVudGltZS9iYXNlJztcblxuaW1wb3J0IHsgQXBwUmVzb3VyY2VNYW5hZ2VyU2VydmljZSB9IGZyb20gJy4vYXBwLXJlc291cmNlLW1hbmFnZXIuc2VydmljZSc7XG5cbmludGVyZmFjZSBJUGFnZU1pbkpTT04ge1xuICAgIG1hcmt1cDogc3RyaW5nO1xuICAgIHNjcmlwdDogc3RyaW5nO1xuICAgIHN0eWxlczogc3RyaW5nO1xuICAgIHZhcmlhYmxlczogc3RyaW5nO1xuICAgIGNvbmZpZz86IHN0cmluZztcbn1cblxuZGVjbGFyZSBjb25zdCB3aW5kb3c6IGFueTtcblxuY29uc3QgZnJhZ21lbnRDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG5cbndpbmRvdy5yZXNvdXJjZUNhY2hlID0gZnJhZ21lbnRDYWNoZTtcblxuY29uc3QgY29tcG9uZW50RmFjdG9yeVJlZkNhY2hlID0gbmV3IE1hcDxDb21wb25lbnRUeXBlLCBNYXA8c3RyaW5nLCBhbnk+PigpO1xuXG5jb21wb25lbnRGYWN0b3J5UmVmQ2FjaGUuc2V0KENvbXBvbmVudFR5cGUuUEFHRSwgbmV3IE1hcDxzdHJpbmcsIGFueT4oKSk7XG5jb21wb25lbnRGYWN0b3J5UmVmQ2FjaGUuc2V0KENvbXBvbmVudFR5cGUuUEFSVElBTCwgbmV3IE1hcDxzdHJpbmcsIGFueT4oKSk7XG5jb21wb25lbnRGYWN0b3J5UmVmQ2FjaGUuc2V0KENvbXBvbmVudFR5cGUuUFJFRkFCLCBuZXcgTWFwPHN0cmluZywgYW55PigpKTtcblxuY29uc3QgX2RlY29kZVVSSUNvbXBvbmVudCA9IChzdHI6IHN0cmluZykgPT4gZGVjb2RlVVJJQ29tcG9uZW50KHN0ci5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG5cbmNvbnN0IGdldEZyYWdtZW50VXJsID0gKGZyYWdtZW50TmFtZTogc3RyaW5nLCB0eXBlOiBDb21wb25lbnRUeXBlKSA9PiB7XG4gICAgaWYgKHR5cGUgPT09IENvbXBvbmVudFR5cGUuUEFHRSB8fCB0eXBlID09PSBDb21wb25lbnRUeXBlLlBBUlRJQUwpIHtcbiAgICAgICAgcmV0dXJuIGAuL3BhZ2VzLyR7ZnJhZ21lbnROYW1lfS9wYWdlLm1pbi5qc29uYDtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IENvbXBvbmVudFR5cGUuUFJFRkFCKSB7XG4gICAgICAgIHJldHVybiBnZXRQcmVmYWJNaW5Kc29uVXJsKGZyYWdtZW50TmFtZSk7XG4gICAgfVxufTtcblxuY29uc3Qgc2NyaXB0Q2FjaGUgPSBuZXcgTWFwPHN0cmluZywgRnVuY3Rpb24+KCk7XG5jb25zdCBleGVjU2NyaXB0ID0gKFxuICAgIHNjcmlwdDogc3RyaW5nLFxuICAgIGlkZW50aWZpZXI6IHN0cmluZyxcbiAgICBjdHg6IHN0cmluZyxcbiAgICBpbnN0YW5jZTogYW55LFxuICAgIGFwcDogYW55LFxuICAgIHV0aWxzOiBhbnlcbikgPT4ge1xuICAgIGxldCBmbiA9IHNjcmlwdENhY2hlLmdldChpZGVudGlmaWVyKTtcbiAgICBpZiAoIWZuKSB7XG4gICAgICAgIGZuID0gbmV3IEZ1bmN0aW9uKGN0eCwgJ0FwcCcsICdVdGlscycsIHNjcmlwdCk7XG4gICAgICAgIHNjcmlwdENhY2hlLnNldChpZGVudGlmaWVyLCBmbik7XG4gICAgfVxuICAgIGZuKGluc3RhbmNlLCBhcHAsIHV0aWxzKTtcbn07XG5cbmNsYXNzIEJhc2VEeW5hbWljQ29tcG9uZW50IHtcbiAgICBpbml0KCkge31cbn1cblxuY29uc3QgZ2V0RHluYW1pY01vZHVsZSA9IChjb21wb25lbnRSZWY6IGFueSkgPT4ge1xuICAgIEBOZ01vZHVsZSh7XG4gICAgICAgIGRlY2xhcmF0aW9uczogW2NvbXBvbmVudFJlZl0sXG4gICAgICAgIGltcG9ydHM6IFtcbiAgICAgICAgICAgIFJ1bnRpbWVCYXNlTW9kdWxlXG4gICAgICAgIF0sXG4gICAgICAgIHNjaGVtYXM6IFtDVVNUT01fRUxFTUVOVFNfU0NIRU1BLCBOT19FUlJPUlNfU0NIRU1BXVxuICAgIH0pXG4gICAgY2xhc3MgRHluYW1pY01vZHVsZSB7fVxuXG4gICAgcmV0dXJuIER5bmFtaWNNb2R1bGU7XG59O1xuXG5jb25zdCBnZXREeW5hbWljQ29tcG9uZW50ID0gKFxuICAgIGNvbXBvbmVudE5hbWUsXG4gICAgdHlwZTogQ29tcG9uZW50VHlwZSxcbiAgICB0ZW1wbGF0ZTogc3RyaW5nLFxuICAgIGNzczogc3RyaW5nLFxuICAgIHNjcmlwdDogYW55LFxuICAgIHZhcmlhYmxlczogc3RyaW5nLFxuKSA9PiB7XG5cbiAgICBjb25zdCBjb21wb25lbnREZWYgPSB7XG4gICAgICAgIHRlbXBsYXRlLFxuICAgICAgICBzdHlsZXM6IFtjc3NdLFxuICAgICAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG4gICAgfTtcblxuICAgIGxldCBCYXNlQ2xhc3M6IGFueSA9IEJhc2VEeW5hbWljQ29tcG9uZW50O1xuICAgIGxldCBzZWxlY3RvciA9ICcnO1xuICAgIGxldCBjb250ZXh0ID0gJyc7XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBDb21wb25lbnRUeXBlLlBBR0U6XG4gICAgICAgICAgICBCYXNlQ2xhc3MgPSBCYXNlUGFnZUNvbXBvbmVudDtcbiAgICAgICAgICAgIHNlbGVjdG9yID0gYGFwcC1wYWdlLSR7Y29tcG9uZW50TmFtZX1gO1xuICAgICAgICAgICAgY29udGV4dCA9ICdQYWdlJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIENvbXBvbmVudFR5cGUuUEFSVElBTDpcbiAgICAgICAgICAgIEJhc2VDbGFzcyA9IEJhc2VQYXJ0aWFsQ29tcG9uZW50O1xuICAgICAgICAgICAgc2VsZWN0b3IgPSBgYXBwLXBhcnRpYWwtJHtjb21wb25lbnROYW1lfWA7XG4gICAgICAgICAgICBjb250ZXh0ID0gJ1BhcnRpYWwnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQ29tcG9uZW50VHlwZS5QUkVGQUI6XG4gICAgICAgICAgICBCYXNlQ2xhc3MgPSBCYXNlUHJlZmFiQ29tcG9uZW50O1xuICAgICAgICAgICAgc2VsZWN0b3IgPSBgYXBwLXByZWZhYi0ke2NvbXBvbmVudE5hbWV9YDtcbiAgICAgICAgICAgIGNvbnRleHQgPSAnUHJlZmFiJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIEBDb21wb25lbnQoe1xuICAgICAgICAuLi5jb21wb25lbnREZWYsXG4gICAgICAgIHNlbGVjdG9yLFxuICAgICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBwcm92aWRlOiBVc2VyRGVmaW5lZEV4ZWN1dGlvbkNvbnRleHQsXG4gICAgICAgICAgICAgICAgdXNlRXhpc3Rpbmc6IER5bmFtaWNDb21wb25lbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0pXG4gICAgY2xhc3MgRHluYW1pY0NvbXBvbmVudCBleHRlbmRzIEJhc2VDbGFzcyB7XG4gICAgICAgIHBhZ2VOYW1lO1xuICAgICAgICBwYXJ0aWFsTmFtZTtcbiAgICAgICAgcHJlZmFiTmFtZTtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIENvbXBvbmVudFR5cGUuUEFHRTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYWdlTmFtZSA9IGNvbXBvbmVudE5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgQ29tcG9uZW50VHlwZS5QQVJUSUFMOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRpYWxOYW1lID0gY29tcG9uZW50TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBDb21wb25lbnRUeXBlLlBSRUZBQjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmVmYWJOYW1lID0gY29tcG9uZW50TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN1cGVyLmluaXQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGV2YWxVc2VyU2NyaXB0KGluc3RhbmNlOiBhbnksIGFwcENvbnRleHQ6IGFueSwgdXRpbHM6IGFueSkge1xuICAgICAgICAgICAgZXhlY1NjcmlwdChzY3JpcHQsIHNlbGVjdG9yLCBjb250ZXh0LCBpbnN0YW5jZSwgYXBwQ29udGV4dCwgdXRpbHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0VmFyaWFibGVzKCkge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBEeW5hbWljQ29tcG9uZW50O1xufTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbXBvbmVudFJlZlByb3ZpZGVyU2VydmljZSBleHRlbmRzIENvbXBvbmVudFJlZlByb3ZpZGVyIHtcblxuICAgIHByaXZhdGUgbG9hZFJlc291cmNlc09mRnJhZ21lbnQoY29tcG9uZW50TmFtZSwgY29tcG9uZW50VHlwZSk6IFByb21pc2U8SVBhZ2VNaW5KU09OPiB7XG4gICAgICAgIGNvbnN0IHVybCA9IGdldEZyYWdtZW50VXJsKGNvbXBvbmVudE5hbWUsIGNvbXBvbmVudFR5cGUpO1xuXG4gICAgICAgIGNvbnN0IHJlc291cmNlID0gZnJhZ21lbnRDYWNoZS5nZXQodXJsKTtcblxuICAgICAgICBpZiAocmVzb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzb3VyY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVzb3VjZU1uZ3IuZ2V0KHVybCwgdHJ1ZSlcbiAgICAgICAgICAgIC50aGVuKCh7bWFya3VwLCBzY3JpcHQsIHN0eWxlcywgdmFyaWFibGVzfTogSVBhZ2VNaW5KU09OKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmt1cDogdHJhbnNwaWxlKF9kZWNvZGVVUklDb21wb25lbnQobWFya3VwKSksXG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdDogX2RlY29kZVVSSUNvbXBvbmVudChzY3JpcHQpLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZXM6IHNjb3BlQ29tcG9uZW50U3R5bGVzKGNvbXBvbmVudE5hbWUsIGNvbXBvbmVudFR5cGUsIF9kZWNvZGVVUklDb21wb25lbnQoc3R5bGVzKSksXG4gICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlczogZ2V0VmFsaWRKU09OKF9kZWNvZGVVUklDb21wb25lbnQodmFyaWFibGVzKSlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGZyYWdtZW50Q2FjaGUuc2V0KHVybCwgcmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgICAgfSwgZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gZS5kZXRhaWxzLnN0YXR1cztcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZ01hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgNDA0IDogdGhpcy5hcHAuYXBwTG9jYWxlLk1FU1NBR0VfUEFHRV9OT1RfRk9VTkQgfHwgJ1RoZSBwYWdlIHlvdSBhcmUgdHJ5aW5nIHRvIHJlYWNoIGlzIG5vdCBhdmFpbGFibGUnLFxuICAgICAgICAgICAgICAgICAgICA0MDMgOiB0aGlzLmFwcC5hcHBMb2NhbGUuTEFCRUxfQUNDRVNTX0RFTklFRCB8fCAnQWNjZXNzIERlbmllZCdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvck1zZ01hcFtzdGF0dXNdKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHJlc291Y2VNbmdyOiBBcHBSZXNvdXJjZU1hbmFnZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBwcml2YXRlIGFwcE1hbmFnZXI6IEFwcE1hbmFnZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGNvbXBpbGVyOiBDb21waWxlclxuICAgICkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBnZXRDb21wb25lbnRGYWN0b3J5UmVmKGNvbXBvbmVudE5hbWU6IHN0cmluZywgY29tcG9uZW50VHlwZTogQ29tcG9uZW50VHlwZSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIC8vIGNoZWNrIGluIHRoZSBjYWNoZS5cbiAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeU1hcCA9IGNvbXBvbmVudEZhY3RvcnlSZWZDYWNoZS5nZXQoY29tcG9uZW50VHlwZSk7XG4gICAgICAgIGxldCBjb21wb25lbnRGYWN0b3J5UmVmO1xuICAgICAgICBpZiAoY29tcG9uZW50RmFjdG9yeU1hcCkge1xuICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeVJlZiA9IGNvbXBvbmVudEZhY3RvcnlNYXAuZ2V0KGNvbXBvbmVudE5hbWUpO1xuXG4gICAgICAgICAgICBpZiAoY29tcG9uZW50RmFjdG9yeVJlZikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRGYWN0b3J5UmVmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubG9hZFJlc291cmNlc09mRnJhZ21lbnQoY29tcG9uZW50TmFtZSwgY29tcG9uZW50VHlwZSlcbiAgICAgICAgICAgIC50aGVuKCh7bWFya3VwLCBzY3JpcHQsIHN0eWxlcywgdmFyaWFibGVzfSkgID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudERlZiA9IGdldER5bmFtaWNDb21wb25lbnQoY29tcG9uZW50TmFtZSwgY29tcG9uZW50VHlwZSwgbWFya3VwLCBzdHlsZXMsIHNjcmlwdCwgSlNPTi5zdHJpbmdpZnkodmFyaWFibGVzKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9kdWxlRGVmID0gZ2V0RHluYW1pY01vZHVsZShjb21wb25lbnREZWYpO1xuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeVJlZiA9IHRoaXMuY29tcGlsZXJcbiAgICAgICAgICAgICAgICAgICAgLmNvbXBpbGVNb2R1bGVBbmRBbGxDb21wb25lbnRzU3luYyhtb2R1bGVEZWYpXG4gICAgICAgICAgICAgICAgICAgIC5jb21wb25lbnRGYWN0b3JpZXNcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihmYWN0b3J5ID0+IGZhY3RvcnkuY29tcG9uZW50VHlwZSA9PT0gY29tcG9uZW50RGVmKVswXTtcblxuICAgICAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnlSZWZDYWNoZS5nZXQoY29tcG9uZW50VHlwZSkuc2V0KGNvbXBvbmVudE5hbWUsIGNvbXBvbmVudEZhY3RvcnlSZWYpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudEZhY3RvcnlSZWY7XG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcE1hbmFnZXIubm90aWZ5QXBwKFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Vycm9yJ1xuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGNsZWFycyB0aGUgY2FjaGUgbWFwXG4gICAgcHVibGljIGNsZWFyQ29tcG9uZW50RmFjdG9yeVJlZkNhY2hlKCkge1xuICAgICAgICB0aGlzLnJlc291Y2VNbmdyLmNsZWFyQ2FjaGUoKTtcbiAgICAgICAgZnJhZ21lbnRDYWNoZS5jbGVhcigpO1xuICAgICAgICBjb21wb25lbnRGYWN0b3J5UmVmQ2FjaGUuZm9yRWFjaChtYXAgPT4ge1xuICAgICAgICAgICAgbWFwLmNsZWFyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==