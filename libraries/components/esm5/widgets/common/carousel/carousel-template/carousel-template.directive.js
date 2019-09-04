import * as tslib_1 from "tslib";
import { Directive, Injector } from '@angular/core';
import { styler } from '../../../framework/styler';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './carousel-template.props';
var DEFAULT_CLS = 'app-carousel-item';
var WIDGET_CONFIG = {
    widgetType: 'wm-carousel-template',
    hostClass: DEFAULT_CLS
};
var CarouselTemplateDirective = /** @class */ (function (_super) {
    tslib_1.__extends(CarouselTemplateDirective, _super);
    function CarouselTemplateDirective(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this);
        return _this;
    }
    CarouselTemplateDirective.initializeProps = registerProps();
    CarouselTemplateDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmCarouselTemplate]'
                },] }
    ];
    /** @nocollapse */
    CarouselTemplateDirective.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return CarouselTemplateDirective;
}(StylableComponent));
export { CarouselTemplateDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Fyb3VzZWwtdGVtcGxhdGUuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jYXJvdXNlbC9jYXJvdXNlbC10ZW1wbGF0ZS9jYXJvdXNlbC10ZW1wbGF0ZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3BELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFMUQsSUFBTSxXQUFXLEdBQUcsbUJBQW1CLENBQUM7QUFDeEMsSUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxzQkFBc0I7SUFDbEMsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQUVGO0lBRytDLHFEQUFpQjtJQUc1RCxtQ0FBWSxHQUFhO1FBQXpCLFlBQ0ksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQUU1QjtRQURHLE1BQU0sQ0FBQyxLQUFJLENBQUMsYUFBYSxFQUFFLEtBQUksQ0FBQyxDQUFDOztJQUNyQyxDQUFDO0lBTE0seUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBSjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsc0JBQXNCO2lCQUNuQzs7OztnQkFmbUIsUUFBUTs7SUF1QjVCLGdDQUFDO0NBQUEsQUFWRCxDQUcrQyxpQkFBaUIsR0FPL0Q7U0FQWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2Nhcm91c2VsLXRlbXBsYXRlLnByb3BzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWNhcm91c2VsLWl0ZW0nO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tY2Fyb3VzZWwtdGVtcGxhdGUnLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFNcbn07XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtQ2Fyb3VzZWxUZW1wbGF0ZV0nXG59KVxuZXhwb3J0IGNsYXNzIENhcm91c2VsVGVtcGxhdGVEaXJlY3RpdmUgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxufVxuIl19