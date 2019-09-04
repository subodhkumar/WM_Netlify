import * as tslib_1 from "tslib";
import { Component, Injector } from '@angular/core';
import { APPLY_STYLES_TYPE, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { registerProps } from './widget-template.props';
var DEFAULT_CLS = 'app-widget-template';
var WIDGET_CONFIG = { widgetType: 'wm-widget-template', hostClass: DEFAULT_CLS };
var WidgetTemplateComponent = /** @class */ (function (_super) {
    tslib_1.__extends(WidgetTemplateComponent, _super);
    function WidgetTemplateComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        return _this;
    }
    WidgetTemplateComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    WidgetTemplateComponent.initializeProps = registerProps();
    WidgetTemplateComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmWidgetTemplate]',
                    template: "<span>Widget Template</span>",
                    providers: [
                        provideAsWidgetRef(WidgetTemplateComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    WidgetTemplateComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return WidgetTemplateComponent;
}(StylableComponent));
export { WidgetTemplateComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0LXRlbXBsYXRlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvd2lkZ2V0LXRlbXBsYXRlL3dpZGdldC10ZW1wbGF0ZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBELE9BQU8sRUFBRSxpQkFBaUIsRUFBaUIsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFakgsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRXhELElBQU0sV0FBVyxHQUFHLHFCQUFxQixDQUFDO0FBQzFDLElBQU0sYUFBYSxHQUFrQixFQUFDLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFFaEc7SUFPNkMsbURBQWlCO0lBRzFELGlDQUFZLEdBQWE7UUFBekIsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBRTVCO1FBREcsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSSxFQUFFLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUM7O0lBQzdFLENBQUM7SUFFTSxrREFBZ0IsR0FBdkIsVUFBd0IsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFHO1FBQ2hDLElBQUksR0FBRyxLQUFLLFVBQVUsRUFBRTtZQUNwQixPQUFPO1NBQ1Y7YUFBTTtZQUNILGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBYk0sdUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsb0JBQW9CO29CQUM5Qix3Q0FBK0M7b0JBQy9DLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyx1QkFBdUIsQ0FBQztxQkFDOUM7aUJBQ0o7Ozs7Z0JBZm1CLFFBQVE7O0lBK0I1Qiw4QkFBQztDQUFBLEFBdEJELENBTzZDLGlCQUFpQixHQWU3RDtTQWZZLHVCQUF1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIElXaWRnZXRDb25maWcsIHByb3ZpZGVBc1dpZGdldFJlZiwgU3R5bGFibGVDb21wb25lbnQsIHN0eWxlciB9IGZyb20gJ0B3bS9jb21wb25lbnRzJztcblxuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vd2lkZ2V0LXRlbXBsYXRlLnByb3BzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXdpZGdldC10ZW1wbGF0ZSc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge3dpZGdldFR5cGU6ICd3bS13aWRnZXQtdGVtcGxhdGUnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21XaWRnZXRUZW1wbGF0ZV0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi93aWRnZXQtdGVtcGxhdGUuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoV2lkZ2V0VGVtcGxhdGVDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBXaWRnZXRUZW1wbGF0ZUNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5TQ1JPTExBQkxFX0NPTlRBSU5FUik7XG4gICAgfVxuXG4gICAgcHVibGljIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3Y/KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19