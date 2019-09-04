import * as tslib_1 from "tslib";
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './navbar.props';
var DEFAULT_CLS = 'navbar navbar-default app-navbar';
var WIDGET_CONFIG = { widgetType: 'wm-navbar', hostClass: DEFAULT_CLS };
var NavbarComponent = /** @class */ (function (_super) {
    tslib_1.__extends(NavbarComponent, _super);
    function NavbarComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER);
        return _this;
    }
    NavbarComponent.prototype.toggleCollapse = function () {
        var _this = this;
        var $navContent = $(this.navContent.nativeElement);
        $navContent.animate({ 'height': 'toggle' });
        if ($navContent.hasClass('in')) {
            setTimeout(function () { return _this.toggleNavCollapse(); }, 500);
        }
        else {
            this.toggleNavCollapse();
        }
    };
    NavbarComponent.prototype.toggleNavCollapse = function () {
        this.navContent.nativeElement.classList.toggle('in');
    };
    NavbarComponent.initializeProps = registerProps();
    NavbarComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmNavbar]',
                    template: "<div class=\"container-fluid\">\n    <div class=\"navbar-header\">\n        <button type=\"button\" class=\"btn-transparent navbar-toggle collapsed\" data-toggle=\"collapse\" (click)=\"toggleCollapse()\" aria-expanded=\"false\">\n            <span class=\"sr-only\">Toggle navigation</span>\n            <i [ngClass]=\"menuiconclass\"></i>\n        </button>\n        <a class=\"navbar-brand\" [href]=\"(homelink | trustAs: 'resource') || '#/'\" *ngIf=\"title || imgsrc\">\n            <img data-identifier=\"img\" class=\"brand-image\" [alt]=\"Brand\" height=\"20\" *ngIf=\"imgsrc\" [src]=\"imgsrc | image\"/>\n            <span class=\"title\" [textContent]=\"title\"></span>\n        </a>\n    </div>\n    <div class=\"collapse navbar-collapse\" #navContent>\n        <ng-content></ng-content>\n    </div>\n</div>",
                    providers: [
                        provideAsWidgetRef(NavbarComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    NavbarComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    NavbarComponent.propDecorators = {
        navContent: [{ type: ViewChild, args: ['navContent',] }]
    };
    return NavbarComponent;
}(StylableComponent));
export { NavbarComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2YmFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbmF2YmFyL25hdmJhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTFGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFL0MsSUFBTSxXQUFXLEdBQUcsa0NBQWtDLENBQUM7QUFDdkQsSUFBTSxhQUFhLEdBQUcsRUFBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQUl4RTtJQU9xQywyQ0FBaUI7SUFRbEQseUJBQVksR0FBYTtRQUF6QixZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FFNUI7UUFERyxNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7O0lBQ2xFLENBQUM7SUFFTSx3Q0FBYyxHQUFyQjtRQUFBLGlCQVFDO1FBUEcsSUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDckQsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBQzNDLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM1QixVQUFVLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUF4QixDQUF3QixFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ25EO2FBQU07WUFDSCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUM1QjtJQUNMLENBQUM7SUFFTywyQ0FBaUIsR0FBekI7UUFDSSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUF4Qk0sK0JBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsWUFBWTtvQkFDdEIsNHpCQUFzQztvQkFDdEMsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztxQkFDdEM7aUJBQ0o7Ozs7Z0JBbEI4QyxRQUFROzs7NkJBeUJsRCxTQUFTLFNBQUMsWUFBWTs7SUFvQjNCLHNCQUFDO0NBQUEsQUFqQ0QsQ0FPcUMsaUJBQWlCLEdBMEJyRDtTQTFCWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3RvciwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEFQUExZX1NUWUxFU19UWVBFLCBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL25hdmJhci5wcm9wcyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ25hdmJhciBuYXZiYXItZGVmYXVsdCBhcHAtbmF2YmFyJztcbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLW5hdmJhcicsIGhvc3RDbGFzczogREVGQVVMVF9DTFN9O1xuXG5kZWNsYXJlIGNvbnN0ICQ7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtTmF2YmFyXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL25hdmJhci5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihOYXZiYXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBOYXZiYXJDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgbWVudWljb25jbGFzczogYW55O1xuICAgIHB1YmxpYyB0aXRsZTogc3RyaW5nO1xuICAgIHB1YmxpYyBpbWdzcmM6IHN0cmluZztcbiAgICBAVmlld0NoaWxkKCduYXZDb250ZW50JykgcHJpdmF0ZSBuYXZDb250ZW50OiBFbGVtZW50UmVmO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5DT05UQUlORVIpO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b2dnbGVDb2xsYXBzZSgpIHtcbiAgICAgICAgY29uc3QgJG5hdkNvbnRlbnQgPSAkKHRoaXMubmF2Q29udGVudC5uYXRpdmVFbGVtZW50KTtcbiAgICAgICAgJG5hdkNvbnRlbnQuYW5pbWF0ZSh7ICdoZWlnaHQnOiAndG9nZ2xlJ30pO1xuICAgICAgICBpZiAoJG5hdkNvbnRlbnQuaGFzQ2xhc3MoJ2luJykpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy50b2dnbGVOYXZDb2xsYXBzZSgpLCA1MDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVOYXZDb2xsYXBzZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0b2dnbGVOYXZDb2xsYXBzZSgpIHtcbiAgICAgICAgdGhpcy5uYXZDb250ZW50Lm5hdGl2ZUVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnaW4nKTtcbiAgICB9XG59XG4iXX0=