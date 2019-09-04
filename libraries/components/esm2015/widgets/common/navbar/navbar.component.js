import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './navbar.props';
const DEFAULT_CLS = 'navbar navbar-default app-navbar';
const WIDGET_CONFIG = { widgetType: 'wm-navbar', hostClass: DEFAULT_CLS };
export class NavbarComponent extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
    toggleCollapse() {
        const $navContent = $(this.navContent.nativeElement);
        $navContent.animate({ 'height': 'toggle' });
        if ($navContent.hasClass('in')) {
            setTimeout(() => this.toggleNavCollapse(), 500);
        }
        else {
            this.toggleNavCollapse();
        }
    }
    toggleNavCollapse() {
        this.navContent.nativeElement.classList.toggle('in');
    }
}
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
NavbarComponent.ctorParameters = () => [
    { type: Injector }
];
NavbarComponent.propDecorators = {
    navContent: [{ type: ViewChild, args: ['navContent',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2YmFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbmF2YmFyL25hdmJhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFMUYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ25FLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvQyxNQUFNLFdBQVcsR0FBRyxrQ0FBa0MsQ0FBQztBQUN2RCxNQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBV3hFLE1BQU0sT0FBTyxlQUFnQixTQUFRLGlCQUFpQjtJQVFsRCxZQUFZLEdBQWE7UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVNLGNBQWM7UUFDakIsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDckQsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBQzNDLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM1QixVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDbkQ7YUFBTTtZQUNILElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1NBQzVCO0lBQ0wsQ0FBQztJQUVPLGlCQUFpQjtRQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pELENBQUM7O0FBeEJNLCtCQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBUjVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsWUFBWTtnQkFDdEIsNHpCQUFzQztnQkFDdEMsU0FBUyxFQUFFO29CQUNQLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztpQkFDdEM7YUFDSjs7OztZQWxCOEMsUUFBUTs7O3lCQXlCbEQsU0FBUyxTQUFDLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vbmF2YmFyLnByb3BzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnbmF2YmFyIG5hdmJhci1kZWZhdWx0IGFwcC1uYXZiYXInO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tbmF2YmFyJywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbmRlY2xhcmUgY29uc3QgJDtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21OYXZiYXJdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vbmF2YmFyLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKE5hdmJhckNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIE5hdmJhckNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBtZW51aWNvbmNsYXNzOiBhbnk7XG4gICAgcHVibGljIHRpdGxlOiBzdHJpbmc7XG4gICAgcHVibGljIGltZ3NyYzogc3RyaW5nO1xuICAgIEBWaWV3Q2hpbGQoJ25hdkNvbnRlbnQnKSBwcml2YXRlIG5hdkNvbnRlbnQ6IEVsZW1lbnRSZWY7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLkNPTlRBSU5FUik7XG4gICAgfVxuXG4gICAgcHVibGljIHRvZ2dsZUNvbGxhcHNlKCkge1xuICAgICAgICBjb25zdCAkbmF2Q29udGVudCA9ICQodGhpcy5uYXZDb250ZW50Lm5hdGl2ZUVsZW1lbnQpO1xuICAgICAgICAkbmF2Q29udGVudC5hbmltYXRlKHsgJ2hlaWdodCc6ICd0b2dnbGUnfSk7XG4gICAgICAgIGlmICgkbmF2Q29udGVudC5oYXNDbGFzcygnaW4nKSkge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnRvZ2dsZU5hdkNvbGxhcHNlKCksIDUwMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZU5hdkNvbGxhcHNlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHRvZ2dsZU5hdkNvbGxhcHNlKCkge1xuICAgICAgICB0aGlzLm5hdkNvbnRlbnQubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdpbicpO1xuICAgIH1cbn1cbiJdfQ==