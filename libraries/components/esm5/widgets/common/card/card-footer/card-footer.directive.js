import * as tslib_1 from "tslib";
import { Directive, Injector } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './card-footer.props';
var DEFAULT_CLS = 'app-card-footer text-muted card-footer';
var WIDGET_CONFIG = {
    widgetType: 'wm-card-footer',
    hostClass: DEFAULT_CLS
};
var CardFooterDirective = /** @class */ (function (_super) {
    tslib_1.__extends(CardFooterDirective, _super);
    function CardFooterDirective(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER);
        return _this;
    }
    CardFooterDirective.initializeProps = registerProps();
    CardFooterDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmCardFooter]'
                },] }
    ];
    /** @nocollapse */
    CardFooterDirective.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return CardFooterDirective;
}(StylableComponent));
export { CardFooterDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZC1mb290ZXIuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jYXJkL2NhcmQtZm9vdGVyL2NhcmQtZm9vdGVyLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHcEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUVwRCxJQUFNLFdBQVcsR0FBRyx3Q0FBd0MsQ0FBQztBQUM3RCxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGdCQUFnQjtJQUM1QixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFDO0FBRUY7SUFHeUMsK0NBQWlCO0lBR3RELDZCQUFZLEdBQWE7UUFBekIsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBRTVCO1FBREcsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSSxFQUFFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztJQUNsRSxDQUFDO0lBTE0sbUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBSjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsZ0JBQWdCO2lCQUM3Qjs7OztnQkFmbUIsUUFBUTs7SUF1QjVCLDBCQUFDO0NBQUEsQUFWRCxDQUd5QyxpQkFBaUIsR0FPekQ7U0FQWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi8uLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9jYXJkLWZvb3Rlci5wcm9wcyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1jYXJkLWZvb3RlciB0ZXh0LW11dGVkIGNhcmQtZm9vdGVyJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWNhcmQtZm9vdGVyJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bUNhcmRGb290ZXJdJ1xufSlcbmV4cG9ydCBjbGFzcyBDYXJkRm9vdGVyRGlyZWN0aXZlIGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLkNPTlRBSU5FUik7XG4gICAgfVxufVxuIl19