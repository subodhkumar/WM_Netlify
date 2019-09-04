import { Directive, ElementRef } from '@angular/core';
import { addClass, AbstractNavigationService, App } from '@wm/core';
import { PageDirective } from '@wm/components';
import { DeviceService } from '@wm/mobile/core';
export class MobilePageDirective {
    constructor(app, elRef, deviceService, page, navigationService) {
        this.deviceService = deviceService;
        this.page = page;
        this.navigationService = navigationService;
        addClass(elRef.nativeElement, 'mobile-app-page');
        this._$ele = $(elRef.nativeElement);
        page.subscribe('wmMobileTabbar:ready', () => this._$ele.addClass('has-tabbar'));
        // add backbutton listener on every page.
        deviceService.onBackButtonTap($event => {
            if (app.landingPageName === app.activePageName) {
                window.navigator['app'].exitApp();
            }
            else {
                this.navigationService.goToPrevious();
            }
            return false;
        });
    }
}
MobilePageDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmPage]'
            },] }
];
/** @nocollapse */
MobilePageDirective.ctorParameters = () => [
    { type: App },
    { type: ElementRef },
    { type: DeviceService },
    { type: PageDirective },
    { type: AbstractNavigationService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL3BhZ2UvcGFnZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdEQsT0FBTyxFQUFFLFFBQVEsRUFBRSx5QkFBeUIsRUFBRSxHQUFHLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDcEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQU9oRCxNQUFNLE9BQU8sbUJBQW1CO0lBSTVCLFlBQVksR0FBUSxFQUNSLEtBQWlCLEVBQ1QsYUFBNEIsRUFDNUIsSUFBbUIsRUFDbkIsaUJBQTRDO1FBRjVDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLFNBQUksR0FBSixJQUFJLENBQWU7UUFDbkIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUEyQjtRQUM1RCxRQUFRLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFFaEYseUNBQXlDO1FBQ3pDLGFBQWEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDbkMsSUFBSSxHQUFHLENBQUMsZUFBZSxLQUFLLEdBQUcsQ0FBQyxjQUFjLEVBQUU7Z0JBQzVDLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDckM7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3pDO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDOzs7WUF6QkosU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxVQUFVO2FBQ3ZCOzs7O1lBUjZDLEdBQUc7WUFGN0IsVUFBVTtZQUlyQixhQUFhO1lBRGIsYUFBYTtZQURILHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgQWJzdHJhY3ROYXZpZ2F0aW9uU2VydmljZSwgQXBwIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgUGFnZURpcmVjdGl2ZSB9IGZyb20gJ0B3bS9jb21wb25lbnRzJztcbmltcG9ydCB7IERldmljZVNlcnZpY2UgfSBmcm9tICdAd20vbW9iaWxlL2NvcmUnO1xuXG5kZWNsYXJlIGNvbnN0ICQ7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtUGFnZV0nXG59KVxuZXhwb3J0IGNsYXNzIE1vYmlsZVBhZ2VEaXJlY3RpdmUge1xuXG4gICAgcHJpdmF0ZSBfJGVsZTtcblxuICAgIGNvbnN0cnVjdG9yKGFwcDogQXBwLFxuICAgICAgICAgICAgICAgIGVsUmVmOiBFbGVtZW50UmVmLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgZGV2aWNlU2VydmljZTogRGV2aWNlU2VydmljZSxcbiAgICAgICAgICAgICAgICBwcml2YXRlIHBhZ2U6IFBhZ2VEaXJlY3RpdmUsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBuYXZpZ2F0aW9uU2VydmljZTogQWJzdHJhY3ROYXZpZ2F0aW9uU2VydmljZSkge1xuICAgICAgICBhZGRDbGFzcyhlbFJlZi5uYXRpdmVFbGVtZW50LCAnbW9iaWxlLWFwcC1wYWdlJyk7XG4gICAgICAgIHRoaXMuXyRlbGUgPSAkKGVsUmVmLm5hdGl2ZUVsZW1lbnQpO1xuICAgICAgICBwYWdlLnN1YnNjcmliZSgnd21Nb2JpbGVUYWJiYXI6cmVhZHknLCAoKSA9PiB0aGlzLl8kZWxlLmFkZENsYXNzKCdoYXMtdGFiYmFyJykpO1xuXG4gICAgICAgIC8vIGFkZCBiYWNrYnV0dG9uIGxpc3RlbmVyIG9uIGV2ZXJ5IHBhZ2UuXG4gICAgICAgIGRldmljZVNlcnZpY2Uub25CYWNrQnV0dG9uVGFwKCRldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoYXBwLmxhbmRpbmdQYWdlTmFtZSA9PT0gYXBwLmFjdGl2ZVBhZ2VOYW1lKSB7XG4gICAgICAgICAgICAgICAgd2luZG93Lm5hdmlnYXRvclsnYXBwJ10uZXhpdEFwcCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5hdmlnYXRpb25TZXJ2aWNlLmdvVG9QcmV2aW91cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=