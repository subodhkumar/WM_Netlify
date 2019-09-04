import * as tslib_1 from "tslib";
import { Directive, Injector } from '@angular/core';
import { addClass } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './container.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-container';
var WIDGET_CONFIG = {
    widgetType: 'wm-container',
    hostClass: DEFAULT_CLS
};
var ContainerDirective = /** @class */ (function (_super) {
    tslib_1.__extends(ContainerDirective, _super);
    function ContainerDirective(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        addClass(_this.nativeElement, DEFAULT_CLS);
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER);
        return _this;
    }
    ContainerDirective.initializeProps = registerProps();
    ContainerDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmContainer]',
                    providers: [
                        provideAsWidgetRef(ContainerDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    ContainerDirective.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return ContainerDirective;
}(StylableComponent));
export { ContainerDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vY29udGFpbmVyL2NvbnRhaW5lci5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFcEMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRW5FLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUVqRSxJQUFNLFdBQVcsR0FBRyxlQUFlLENBQUM7QUFDcEMsSUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxjQUFjO0lBQzFCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUM7QUFFRjtJQU13Qyw4Q0FBaUI7SUFHckQsNEJBQVksR0FBYTtRQUF6QixZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FJNUI7UUFGRyxRQUFRLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMxQyxNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7O0lBQ2xFLENBQUM7SUFQTSxrQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFQNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxlQUFlO29CQUN6QixTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsa0JBQWtCLENBQUM7cUJBQ3pDO2lCQUNKOzs7O2dCQXJCbUIsUUFBUTs7SUErQjVCLHlCQUFDO0NBQUEsQUFmRCxDQU13QyxpQkFBaUIsR0FTeEQ7U0FUWSxrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGFkZENsYXNzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2NvbnRhaW5lci5wcm9wcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1jb250YWluZXInO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tY29udGFpbmVyJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bUNvbnRhaW5lcl0nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQ29udGFpbmVyRGlyZWN0aXZlKVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgQ29udGFpbmVyRGlyZWN0aXZlIGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgYWRkQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCBERUZBVUxUX0NMUyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLkNPTlRBSU5FUik7XG4gICAgfVxufVxuIl19