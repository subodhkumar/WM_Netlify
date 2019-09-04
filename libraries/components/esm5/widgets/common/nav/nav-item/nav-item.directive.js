import * as tslib_1 from "tslib";
import { Directive, HostListener, Injector } from '@angular/core';
import { addClass } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { registerProps } from './nav-item.props';
import { StylableComponent } from '../../base/stylable.component';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
var DEFAULT_CLS = 'app-nav-item';
var WIDGET_CONFIG = { widgetType: 'wm-nav-item', hostClass: DEFAULT_CLS };
var NavItemDirective = /** @class */ (function (_super) {
    tslib_1.__extends(NavItemDirective, _super);
    function NavItemDirective(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER);
        return _this;
    }
    NavItemDirective.prototype.makeActive = function () {
        var parentNode = this.nativeElement.parentNode;
        $(parentNode).find('> li.active').removeClass('active');
        addClass(this.nativeElement, 'active');
    };
    NavItemDirective.initializeProps = registerProps();
    NavItemDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmNavItem]',
                    providers: [
                        provideAsWidgetRef(NavItemDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    NavItemDirective.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    NavItemDirective.propDecorators = {
        makeActive: [{ type: HostListener, args: ['click',] }, { type: HostListener, args: ['keydown.enter',] }]
    };
    return NavItemDirective;
}(StylableComponent));
export { NavItemDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2LWl0ZW0uZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9uYXYvbmF2LWl0ZW0vbmF2LWl0ZW0uZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbEUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVwQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBSXBFLElBQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQztBQUNuQyxJQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBRTFFO0lBTXNDLDRDQUFpQjtJQVduRCwwQkFBWSxHQUFhO1FBQXpCLFlBQ0ksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQUU1QjtRQURHLE1BQU0sQ0FBQyxLQUFJLENBQUMsYUFBYSxFQUFFLEtBQUksRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7SUFDbEUsQ0FBQztJQVRELHFDQUFVLEdBRlY7UUFHSSxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQztRQUNqRCxDQUFDLENBQUMsVUFBeUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkUsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQVJNLGdDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVA1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGFBQWE7b0JBQ3ZCLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQztxQkFDdkM7aUJBQ0o7Ozs7Z0JBbEJpQyxRQUFROzs7NkJBc0JyQyxZQUFZLFNBQUMsT0FBTyxjQUNwQixZQUFZLFNBQUMsZUFBZTs7SUFXakMsdUJBQUM7Q0FBQSxBQXJCRCxDQU1zQyxpQkFBaUIsR0FldEQ7U0FmWSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEhvc3RMaXN0ZW5lciwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGFkZENsYXNzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9uYXYtaXRlbS5wcm9wcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgJDtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLW5hdi1pdGVtJztcbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLW5hdi1pdGVtJywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtTmF2SXRlbV0nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoTmF2SXRlbURpcmVjdGl2ZSlcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIE5hdkl0ZW1EaXJlY3RpdmUgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJylcbiAgICBASG9zdExpc3RlbmVyKCdrZXlkb3duLmVudGVyJylcbiAgICBtYWtlQWN0aXZlKCkge1xuICAgICAgICBjb25zdCBwYXJlbnROb2RlID0gdGhpcy5uYXRpdmVFbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICAgICQocGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudCkuZmluZCgnPiBsaS5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIGFkZENsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgJ2FjdGl2ZScpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuQ09OVEFJTkVSKTtcbiAgICB9XG59XG4iXX0=