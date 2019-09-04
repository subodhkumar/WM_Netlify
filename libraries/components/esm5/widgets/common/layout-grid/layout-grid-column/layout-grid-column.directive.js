import * as tslib_1 from "tslib";
import { Attribute, Directive, Injector } from '@angular/core';
import { isMobileApp, setCSS, switchClass } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './layout-grid-column.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
var DEFAULT_CLS = 'app-grid-column';
var WIDGET_CONFIG = {
    widgetType: 'wm-gridcolumn',
    hostClass: DEFAULT_CLS
};
var LayoutGridColumnDirective = /** @class */ (function (_super) {
    tslib_1.__extends(LayoutGridColumnDirective, _super);
    function LayoutGridColumnDirective(inj, height) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        // if the height is provided set the overflow to auto
        if (height) {
            setCSS(_this.nativeElement, 'overflow', 'auto');
        }
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER);
        return _this;
    }
    LayoutGridColumnDirective.prototype.onPropertyChange = function (key, nv, ov) {
        var prefix = isMobileApp() ? 'xs' : 'sm';
        if (key === 'columnwidth') {
            switchClass(this.nativeElement, "col-" + prefix + "-" + nv, ov ? "col-" + prefix + "-" + ov : '');
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    LayoutGridColumnDirective.initializeProps = registerProps();
    LayoutGridColumnDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmLayoutGridColumn]',
                    providers: [
                        provideAsWidgetRef(LayoutGridColumnDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    LayoutGridColumnDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: undefined, decorators: [{ type: Attribute, args: ['height',] }] }
    ]; };
    return LayoutGridColumnDirective;
}(StylableComponent));
export { LayoutGridColumnDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LWdyaWQtY29sdW1uLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbGF5b3V0LWdyaWQvbGF5b3V0LWdyaWQtY29sdW1uL2xheW91dC1ncmlkLWNvbHVtbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUvRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFNUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXRFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUVwRSxJQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQztBQUN0QyxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGVBQWU7SUFDM0IsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQUVGO0lBTStDLHFEQUFpQjtJQUU1RCxtQ0FBWSxHQUFhLEVBQXVCLE1BQU07UUFBdEQsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBUTVCO1FBTkcscURBQXFEO1FBQ3JELElBQUksTUFBTSxFQUFFO1lBQ1IsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ2xEO1FBRUQsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSSxFQUFFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztJQUNsRSxDQUFDO0lBRUQsb0RBQWdCLEdBQWhCLFVBQWlCLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRztRQUN6QixJQUFNLE1BQU0sR0FBRyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDM0MsSUFBSSxHQUFHLEtBQUssYUFBYSxFQUFFO1lBQ3ZCLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFNBQU8sTUFBTSxTQUFJLEVBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQU8sTUFBTSxTQUFJLEVBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDM0Y7YUFBTTtZQUNILGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBbkJNLHlDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVA1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLHlCQUF5QixDQUFDO3FCQUNoRDtpQkFDSjs7OztnQkFyQjhCLFFBQVE7Z0RBd0JQLFNBQVMsU0FBQyxRQUFROztJQW1CbEQsZ0NBQUM7Q0FBQSxBQTNCRCxDQU0rQyxpQkFBaUIsR0FxQi9EO1NBckJZLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF0dHJpYnV0ZSwgRGlyZWN0aXZlLCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBpc01vYmlsZUFwcCwgc2V0Q1NTLCBzd2l0Y2hDbGFzcyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2xheW91dC1ncmlkLWNvbHVtbi5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtZ3JpZC1jb2x1bW4nO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tZ3JpZGNvbHVtbicsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21MYXlvdXRHcmlkQ29sdW1uXScsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihMYXlvdXRHcmlkQ29sdW1uRGlyZWN0aXZlKVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgTGF5b3V0R3JpZENvbHVtbkRpcmVjdGl2ZSBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIEBBdHRyaWJ1dGUoJ2hlaWdodCcpIGhlaWdodCkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuXG4gICAgICAgIC8vIGlmIHRoZSBoZWlnaHQgaXMgcHJvdmlkZWQgc2V0IHRoZSBvdmVyZmxvdyB0byBhdXRvXG4gICAgICAgIGlmIChoZWlnaHQpIHtcbiAgICAgICAgICAgIHNldENTUyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdvdmVyZmxvdycsICdhdXRvJyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5DT05UQUlORVIpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3Y/KSB7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IGlzTW9iaWxlQXBwKCkgPyAneHMnIDogJ3NtJztcbiAgICAgICAgaWYgKGtleSA9PT0gJ2NvbHVtbndpZHRoJykge1xuICAgICAgICAgICAgc3dpdGNoQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCBgY29sLSR7cHJlZml4fS0ke252fWAsIG92ID8gYGNvbC0ke3ByZWZpeH0tJHtvdn1gIDogJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=