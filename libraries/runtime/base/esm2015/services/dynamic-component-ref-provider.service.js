import * as tslib_1 from "tslib";
import { Compiler, Component, CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule, NO_ERRORS_SCHEMA, ViewEncapsulation } from '@angular/core';
import { App, extendProto, isDefined } from '@wm/core';
import { transpile } from '@wm/transpiler';
import { initComponentsBuildTask } from '@wm/build-task';
import { AppManagerService } from './app.manager.service';
import { RuntimeBaseModule } from '../runtime-base.module';
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
const ɵ0 = getDynamicModule;
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
const ɵ1 = getDynamicComponent;
export class DynamicComponentRefProviderService {
    constructor(app, appManager, compiler) {
        this.app = app;
        this.appManager = appManager;
        this.compiler = compiler;
        this.counter = 1;
    }
    getComponentFactoryRef(selector, markup, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1pYy1jb21wb25lbnQtcmVmLXByb3ZpZGVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vcnVudGltZS9iYXNlLyIsInNvdXJjZXMiOlsic2VydmljZXMvZHluYW1pYy1jb21wb25lbnQtcmVmLXByb3ZpZGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCxRQUFRLEVBQ1IsU0FBUyxFQUNULHNCQUFzQixFQUN0QixVQUFVLEVBQ1YsUUFBUSxFQUNSLGdCQUFnQixFQUNoQixpQkFBaUIsRUFDcEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3ZELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV6RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUUzRCx1QkFBdUIsRUFBRSxDQUFDO0FBRTFCLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxHQUFHLEVBQWUsQ0FBQztBQUV4RCxNQUFNLGdCQUFnQixHQUFHLENBQUMsWUFBaUIsRUFBRSxFQUFFO0lBQzNDLE1BT00sYUFBYTs7O2dCQVBsQixRQUFRLFNBQUM7b0JBQ04sWUFBWSxFQUFFLENBQUMsWUFBWSxDQUFDO29CQUM1QixPQUFPLEVBQUU7d0JBQ0wsaUJBQWlCO3FCQUNwQjtvQkFDRCxPQUFPLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxnQkFBZ0IsQ0FBQztpQkFDdEQ7O0lBR0QsT0FBTyxhQUFhLENBQUM7QUFDekIsQ0FBQyxDQUFDOztBQUVGLE1BQU0sbUJBQW1CLEdBQUcsQ0FDeEIsUUFBUSxFQUNSLFFBQWdCLEVBQ2hCLE1BQWMsRUFB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L0NKLFVBQVU7Ozs7WUE3Q0YsR0FBRztZQUlILGlCQUFpQjtZQWJ0QixRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDb21waWxlcixcbiAgICBDb21wb25lbnQsXG4gICAgQ1VTVE9NX0VMRU1FTlRTX1NDSEVNQSxcbiAgICBJbmplY3RhYmxlLFxuICAgIE5nTW9kdWxlLFxuICAgIE5PX0VSUk9SU19TQ0hFTUEsXG4gICAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEFwcCwgZXh0ZW5kUHJvdG8sIGlzRGVmaW5lZCB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IHRyYW5zcGlsZSB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcbmltcG9ydCB7IGluaXRDb21wb25lbnRzQnVpbGRUYXNrIH0gZnJvbSAnQHdtL2J1aWxkLXRhc2snO1xuXG5pbXBvcnQgeyBBcHBNYW5hZ2VyU2VydmljZSB9IGZyb20gJy4vYXBwLm1hbmFnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBSdW50aW1lQmFzZU1vZHVsZSB9IGZyb20gJy4uL3J1bnRpbWUtYmFzZS5tb2R1bGUnO1xuXG5pbml0Q29tcG9uZW50c0J1aWxkVGFzaygpO1xuXG5jb25zdCBjb21wb25lbnRGYWN0b3J5UmVmQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgYW55PigpO1xuXG5jb25zdCBnZXREeW5hbWljTW9kdWxlID0gKGNvbXBvbmVudFJlZjogYW55KSA9PiB7XG4gICAgQE5nTW9kdWxlKHtcbiAgICAgICAgZGVjbGFyYXRpb25zOiBbY29tcG9uZW50UmVmXSxcbiAgICAgICAgaW1wb3J0czogW1xuICAgICAgICAgICAgUnVudGltZUJhc2VNb2R1bGVcbiAgICAgICAgXSxcbiAgICAgICAgc2NoZW1hczogW0NVU1RPTV9FTEVNRU5UU19TQ0hFTUEsIE5PX0VSUk9SU19TQ0hFTUFdXG4gICAgfSlcbiAgICBjbGFzcyBEeW5hbWljTW9kdWxlIHt9XG5cbiAgICByZXR1cm4gRHluYW1pY01vZHVsZTtcbn07XG5cbmNvbnN0IGdldER5bmFtaWNDb21wb25lbnQgPSAoXG4gICAgc2VsZWN0b3IsXG4gICAgdGVtcGxhdGU6IHN0cmluZyxcbiAgICBjc3M6IHN0cmluZyA9ICcnKSA9PiB7XG5cbiAgICBjb25zdCBjb21wb25lbnREZWYgPSB7XG4gICAgICAgIHRlbXBsYXRlLFxuICAgICAgICBzdHlsZXM6IFtjc3NdLFxuICAgICAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG4gICAgfTtcblxuICAgIEBDb21wb25lbnQoe1xuICAgICAgICAuLi5jb21wb25lbnREZWYsXG4gICAgICAgIHNlbGVjdG9yXG4gICAgfSlcbiAgICBjbGFzcyBEeW5hbWljQ29tcG9uZW50IHtcbiAgICB9XG5cbiAgICByZXR1cm4gRHluYW1pY0NvbXBvbmVudDtcbn07XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEeW5hbWljQ29tcG9uZW50UmVmUHJvdmlkZXJTZXJ2aWNlIHtcbiAgICBwcml2YXRlIGNvdW50ZXIgPSAxO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgYXBwOiBBcHAsXG4gICAgICAgIHByaXZhdGUgYXBwTWFuYWdlcjogQXBwTWFuYWdlclNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgY29tcGlsZXI6IENvbXBpbGVyXG4gICAgKSB7fVxuXG4gICAgcHVibGljIGFzeW5jIGdldENvbXBvbmVudEZhY3RvcnlSZWYoc2VsZWN0b3I6IHN0cmluZywgbWFya3VwOiBzdHJpbmcsIG9wdGlvbnM6IGFueSA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgLy8gY2hlY2sgaW4gdGhlIGNhY2hlLlxuICAgICAgICBsZXQgY29tcG9uZW50RmFjdG9yeVJlZiA9IGNvbXBvbmVudEZhY3RvcnlSZWZDYWNoZS5nZXQoc2VsZWN0b3IpO1xuXG4gICAgICAgIG1hcmt1cCA9IG9wdGlvbnMudHJhbnNwaWxlID8gdHJhbnNwaWxlKG1hcmt1cCkgOiBtYXJrdXA7XG4gICAgICAgIGlmICghY29tcG9uZW50RmFjdG9yeVJlZiB8fCBvcHRpb25zLm5vQ2FjaGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudERlZiA9IGdldER5bmFtaWNDb21wb25lbnQoc2VsZWN0b3IsIG1hcmt1cCwgb3B0aW9ucy5zdHlsZXMpO1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlRGVmID0gZ2V0RHluYW1pY01vZHVsZShjb21wb25lbnREZWYpO1xuXG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5UmVmID0gdGhpcy5jb21waWxlclxuICAgICAgICAgICAgICAgIC5jb21waWxlTW9kdWxlQW5kQWxsQ29tcG9uZW50c1N5bmMobW9kdWxlRGVmKVxuICAgICAgICAgICAgICAgIC5jb21wb25lbnRGYWN0b3JpZXNcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGZhY3RvcnkgPT4gZmFjdG9yeS5jb21wb25lbnRUeXBlID09PSBjb21wb25lbnREZWYpWzBdO1xuXG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5UmVmQ2FjaGUuc2V0KHNlbGVjdG9yLCBjb21wb25lbnRGYWN0b3J5UmVmKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50RmFjdG9yeVJlZjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRoZSBjb21wb25lbnQgZHluYW1pY2FsbHkgYW5kIGFkZCBpdCB0byB0aGUgRE9NXG4gICAgICogQHBhcmFtIHRhcmdldDogSFRNTCBlbGVtZW50IHdoZXJlIHdlIG5lZWQgdG8gYXBwZW5kIHRoZSBjcmVhdGVkIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSBtYXJrdXA6IFRlbXBsYXRlIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0gY29udGV4dDogU2NvcGUgb2YgdGhlIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSBvcHRpb25zOiBXZSBoYXZlIG9wdGlvbnMgbGlrZVxuICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rvcjogc2VsZWN0b3Igb2YgdGhlIGNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgICAgICB0cmFuc3BpbGU6IGZsYWcgZm9yIHRyYW5zcGlsaW5nIEhUTUwuIEJ5IGRlZmF1bHQgaXQgaXMgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICBub2NhY2hlOiBmbGFnIGZvciByZW5kZXIgaXQgZnJvbSBjYWNoZSBvciBub3QuIEJ5IGRlZmF1bHQgaXQgaXMgdHJ1ZVxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBhZGRDb21wb25lbnQodGFyZ2V0OiBIVE1MRWxlbWVudCwgbWFya3VwOiBzdHJpbmcsIGNvbnRleHQgPSB7fSwgb3B0aW9uczogYW55ID0ge30pIHtcbiAgICAgICAgb3B0aW9ucy50cmFuc3BpbGUgPSBpc0RlZmluZWQob3B0aW9ucy50cmFuc3BpbGUpID8gb3B0aW9ucy50cmFuc3BpbGUgOiB0cnVlO1xuICAgICAgICBvcHRpb25zLm5vQ2FjaGUgPSBpc0RlZmluZWQob3B0aW9ucy5ub0NhY2hlKSA/IG9wdGlvbnMubm9DYWNoZSA6IHRydWU7XG4gICAgICAgIG9wdGlvbnMuc2VsZWN0b3IgPSBpc0RlZmluZWQob3B0aW9ucy5zZWxlY3RvcikgPyBvcHRpb25zLnNlbGVjdG9yIDogJ3dtLWR5bmFtaWMtY29tcG9uZW50LScrIHRoaXMuY291bnRlcisrO1xuICAgICAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5UmVmID0gYXdhaXQgdGhpcy5nZXRDb21wb25lbnRGYWN0b3J5UmVmKG9wdGlvbnMuc2VsZWN0b3IsIG1hcmt1cCwgb3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuYXBwLmR5bmFtaWNDb21wb25lbnRDb250YWluZXJSZWYuY3JlYXRlQ29tcG9uZW50KGNvbXBvbmVudEZhY3RvcnlSZWYsIDApO1xuICAgICAgICBleHRlbmRQcm90byhjb21wb25lbnQuaW5zdGFuY2UsIGNvbnRleHQpO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoY29tcG9uZW50LmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpO1xuICAgIH1cbn1cbiJdfQ==