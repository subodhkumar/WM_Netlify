import * as tslib_1 from "tslib";
import { Compiler, Component, CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule, NO_ERRORS_SCHEMA, ViewEncapsulation } from '@angular/core';
import { App, extendProto, isDefined } from '@wm/core';
import { transpile } from '@wm/transpiler';
import { initComponentsBuildTask } from '@wm/build-task';
import { AppManagerService } from './app.manager.service';
import { RuntimeBaseModule } from '../runtime-base.module';
initComponentsBuildTask();
var componentFactoryRefCache = new Map();
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
var ɵ0 = getDynamicModule;
var getDynamicComponent = function (selector, template, css) {
    if (css === void 0) { css = ''; }
    var componentDef = {
        template: template,
        styles: [css],
        encapsulation: ViewEncapsulation.None
    };
    var DynamicComponent = /** @class */ (function () {
        function DynamicComponent() {
        }
        DynamicComponent.decorators = [
            { type: Component, args: [tslib_1.__assign({}, componentDef, { selector: selector }),] },
        ];
        return DynamicComponent;
    }());
    return DynamicComponent;
};
var ɵ1 = getDynamicComponent;
var DynamicComponentRefProviderService = /** @class */ (function () {
    function DynamicComponentRefProviderService(app, appManager, compiler) {
        this.app = app;
        this.appManager = appManager;
        this.compiler = compiler;
        this.counter = 1;
    }
    DynamicComponentRefProviderService.prototype.getComponentFactoryRef = function (selector, markup, options) {
        if (options === void 0) { options = {}; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var componentFactoryRef, componentDef_1, moduleDef;
            return tslib_1.__generator(this, function (_a) {
                componentFactoryRef = componentFactoryRefCache.get(selector);
                markup = options.transpile ? transpile(markup) : markup;
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
        if (context === void 0) { context = {}; }
        if (options === void 0) { options = {}; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var componentFactoryRef, component;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options.transpile = isDefined(options.transpile) ? options.transpile : true;
                        options.noCache = isDefined(options.noCache) ? options.noCache : true;
                        options.selector = isDefined(options.selector) ? options.selector : 'wm-dynamic-component-' + this.counter++;
                        return [4 /*yield*/, this.getComponentFactoryRef(options.selector, markup, options)];
                    case 1:
                        componentFactoryRef = _a.sent();
                        component = this.app.dynamicComponentContainerRef.createComponent(componentFactoryRef, 0);
                        extendProto(component.instance, context);
                        target.appendChild(component.location.nativeElement);
                        return [2 /*return*/];
                }
            });
        });
    };
    DynamicComponentRefProviderService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    DynamicComponentRefProviderService.ctorParameters = function () { return [
        { type: App },
        { type: AppManagerService },
        { type: Compiler }
    ]; };
    return DynamicComponentRefProviderService;
}());
export { DynamicComponentRefProviderService };
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1pYy1jb21wb25lbnQtcmVmLXByb3ZpZGVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vcnVudGltZS9iYXNlLyIsInNvdXJjZXMiOlsic2VydmljZXMvZHluYW1pYy1jb21wb25lbnQtcmVmLXByb3ZpZGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCxRQUFRLEVBQ1IsU0FBUyxFQUNULHNCQUFzQixFQUN0QixVQUFVLEVBQ1YsUUFBUSxFQUNSLGdCQUFnQixFQUNoQixpQkFBaUIsRUFDcEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3ZELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV6RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUUzRCx1QkFBdUIsRUFBRSxDQUFDO0FBRTFCLElBQU0sd0JBQXdCLEdBQUcsSUFBSSxHQUFHLEVBQWUsQ0FBQztBQUV4RCxJQUFNLGdCQUFnQixHQUFHLFVBQUMsWUFBaUI7SUFDdkM7UUFBQTtRQU9xQixDQUFDOztvQkFQckIsUUFBUSxTQUFDO3dCQUNOLFlBQVksRUFBRSxDQUFDLFlBQVksQ0FBQzt3QkFDNUIsT0FBTyxFQUFFOzRCQUNMLGlCQUFpQjt5QkFDcEI7d0JBQ0QsT0FBTyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsZ0JBQWdCLENBQUM7cUJBQ3REOztRQUNvQixvQkFBQztLQUFBLEFBUHRCLElBT3NCO0lBRXRCLE9BQU8sYUFBYSxDQUFDO0FBQ3pCLENBQUMsQ0FBQzs7QUFFRixJQUFNLG1CQUFtQixHQUFHLFVBQ3hCLFFBQVEs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UyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDekMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDOzs7OztLQUN4RDs7Z0JBL0NKLFVBQVU7Ozs7Z0JBN0NGLEdBQUc7Z0JBSUgsaUJBQWlCO2dCQWJ0QixRQUFROztJQXNHWix5Q0FBQztDQUFBLEFBaERELElBZ0RDO1NBL0NZLGtDQUFrQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ29tcGlsZXIsXG4gICAgQ29tcG9uZW50LFxuICAgIENVU1RPTV9FTEVNRU5UU19TQ0hFTUEsXG4gICAgSW5qZWN0YWJsZSxcbiAgICBOZ01vZHVsZSxcbiAgICBOT19FUlJPUlNfU0NIRU1BLFxuICAgIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBcHAsIGV4dGVuZFByb3RvLCBpc0RlZmluZWQgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyB0cmFuc3BpbGUgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5pbXBvcnQgeyBpbml0Q29tcG9uZW50c0J1aWxkVGFzayB9IGZyb20gJ0B3bS9idWlsZC10YXNrJztcblxuaW1wb3J0IHsgQXBwTWFuYWdlclNlcnZpY2UgfSBmcm9tICcuL2FwcC5tYW5hZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgUnVudGltZUJhc2VNb2R1bGUgfSBmcm9tICcuLi9ydW50aW1lLWJhc2UubW9kdWxlJztcblxuaW5pdENvbXBvbmVudHNCdWlsZFRhc2soKTtcblxuY29uc3QgY29tcG9uZW50RmFjdG9yeVJlZkNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcblxuY29uc3QgZ2V0RHluYW1pY01vZHVsZSA9IChjb21wb25lbnRSZWY6IGFueSkgPT4ge1xuICAgIEBOZ01vZHVsZSh7XG4gICAgICAgIGRlY2xhcmF0aW9uczogW2NvbXBvbmVudFJlZl0sXG4gICAgICAgIGltcG9ydHM6IFtcbiAgICAgICAgICAgIFJ1bnRpbWVCYXNlTW9kdWxlXG4gICAgICAgIF0sXG4gICAgICAgIHNjaGVtYXM6IFtDVVNUT01fRUxFTUVOVFNfU0NIRU1BLCBOT19FUlJPUlNfU0NIRU1BXVxuICAgIH0pXG4gICAgY2xhc3MgRHluYW1pY01vZHVsZSB7fVxuXG4gICAgcmV0dXJuIER5bmFtaWNNb2R1bGU7XG59O1xuXG5jb25zdCBnZXREeW5hbWljQ29tcG9uZW50ID0gKFxuICAgIHNlbGVjdG9yLFxuICAgIHRlbXBsYXRlOiBzdHJpbmcsXG4gICAgY3NzOiBzdHJpbmcgPSAnJykgPT4ge1xuXG4gICAgY29uc3QgY29tcG9uZW50RGVmID0ge1xuICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgc3R5bGVzOiBbY3NzXSxcbiAgICAgICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxuICAgIH07XG5cbiAgICBAQ29tcG9uZW50KHtcbiAgICAgICAgLi4uY29tcG9uZW50RGVmLFxuICAgICAgICBzZWxlY3RvclxuICAgIH0pXG4gICAgY2xhc3MgRHluYW1pY0NvbXBvbmVudCB7XG4gICAgfVxuXG4gICAgcmV0dXJuIER5bmFtaWNDb21wb25lbnQ7XG59O1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRHluYW1pY0NvbXBvbmVudFJlZlByb3ZpZGVyU2VydmljZSB7XG4gICAgcHJpdmF0ZSBjb3VudGVyID0gMTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBwcml2YXRlIGFwcE1hbmFnZXI6IEFwcE1hbmFnZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGNvbXBpbGVyOiBDb21waWxlclxuICAgICkge31cblxuICAgIHB1YmxpYyBhc3luYyBnZXRDb21wb25lbnRGYWN0b3J5UmVmKHNlbGVjdG9yOiBzdHJpbmcsIG1hcmt1cDogc3RyaW5nLCBvcHRpb25zOiBhbnkgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIC8vIGNoZWNrIGluIHRoZSBjYWNoZS5cbiAgICAgICAgbGV0IGNvbXBvbmVudEZhY3RvcnlSZWYgPSBjb21wb25lbnRGYWN0b3J5UmVmQ2FjaGUuZ2V0KHNlbGVjdG9yKTtcblxuICAgICAgICBtYXJrdXAgPSBvcHRpb25zLnRyYW5zcGlsZSA/IHRyYW5zcGlsZShtYXJrdXApIDogbWFya3VwO1xuICAgICAgICBpZiAoIWNvbXBvbmVudEZhY3RvcnlSZWYgfHwgb3B0aW9ucy5ub0NhY2hlKSB7XG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnREZWYgPSBnZXREeW5hbWljQ29tcG9uZW50KHNlbGVjdG9yLCBtYXJrdXAsIG9wdGlvbnMuc3R5bGVzKTtcbiAgICAgICAgICAgIGNvbnN0IG1vZHVsZURlZiA9IGdldER5bmFtaWNNb2R1bGUoY29tcG9uZW50RGVmKTtcblxuICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeVJlZiA9IHRoaXMuY29tcGlsZXJcbiAgICAgICAgICAgICAgICAuY29tcGlsZU1vZHVsZUFuZEFsbENvbXBvbmVudHNTeW5jKG1vZHVsZURlZilcbiAgICAgICAgICAgICAgICAuY29tcG9uZW50RmFjdG9yaWVzXG4gICAgICAgICAgICAgICAgLmZpbHRlcihmYWN0b3J5ID0+IGZhY3RvcnkuY29tcG9uZW50VHlwZSA9PT0gY29tcG9uZW50RGVmKVswXTtcblxuICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeVJlZkNhY2hlLnNldChzZWxlY3RvciwgY29tcG9uZW50RmFjdG9yeVJlZik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudEZhY3RvcnlSZWY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgY29tcG9uZW50IGR5bmFtaWNhbGx5IGFuZCBhZGQgaXQgdG8gdGhlIERPTVxuICAgICAqIEBwYXJhbSB0YXJnZXQ6IEhUTUwgZWxlbWVudCB3aGVyZSB3ZSBuZWVkIHRvIGFwcGVuZCB0aGUgY3JlYXRlZCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0gbWFya3VwOiBUZW1wbGF0ZSBvZiB0aGUgY29tcG9uZW50XG4gICAgICogQHBhcmFtIGNvbnRleHQ6IFNjb3BlIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0gb3B0aW9uczogV2UgaGF2ZSBvcHRpb25zIGxpa2VcbiAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yIG9mIHRoZSBjb21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNwaWxlOiBmbGFnIGZvciB0cmFuc3BpbGluZyBIVE1MLiBCeSBkZWZhdWx0IGl0IGlzIHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgbm9jYWNoZTogZmxhZyBmb3IgcmVuZGVyIGl0IGZyb20gY2FjaGUgb3Igbm90LiBCeSBkZWZhdWx0IGl0IGlzIHRydWVcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgYWRkQ29tcG9uZW50KHRhcmdldDogSFRNTEVsZW1lbnQsIG1hcmt1cDogc3RyaW5nLCBjb250ZXh0ID0ge30sIG9wdGlvbnM6IGFueSA9IHt9KSB7XG4gICAgICAgIG9wdGlvbnMudHJhbnNwaWxlID0gaXNEZWZpbmVkKG9wdGlvbnMudHJhbnNwaWxlKSA/IG9wdGlvbnMudHJhbnNwaWxlIDogdHJ1ZTtcbiAgICAgICAgb3B0aW9ucy5ub0NhY2hlID0gaXNEZWZpbmVkKG9wdGlvbnMubm9DYWNoZSkgPyBvcHRpb25zLm5vQ2FjaGUgOiB0cnVlO1xuICAgICAgICBvcHRpb25zLnNlbGVjdG9yID0gaXNEZWZpbmVkKG9wdGlvbnMuc2VsZWN0b3IpID8gb3B0aW9ucy5zZWxlY3RvciA6ICd3bS1keW5hbWljLWNvbXBvbmVudC0nKyB0aGlzLmNvdW50ZXIrKztcbiAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeVJlZiA9IGF3YWl0IHRoaXMuZ2V0Q29tcG9uZW50RmFjdG9yeVJlZihvcHRpb25zLnNlbGVjdG9yLCBtYXJrdXAsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLmFwcC5keW5hbWljQ29tcG9uZW50Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudChjb21wb25lbnRGYWN0b3J5UmVmLCAwKTtcbiAgICAgICAgZXh0ZW5kUHJvdG8oY29tcG9uZW50Lmluc3RhbmNlLCBjb250ZXh0KTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNvbXBvbmVudC5sb2NhdGlvbi5uYXRpdmVFbGVtZW50KTtcbiAgICB9XG59XG4iXX0=