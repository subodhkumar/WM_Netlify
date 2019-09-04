import { Directive, ElementRef } from '@angular/core';
import { addClass, AbstractNavigationService, App } from '@wm/core';
import { PageDirective } from '@wm/components';
import { DeviceService } from '@wm/mobile/core';
var MobilePageDirective = /** @class */ (function () {
    function MobilePageDirective(app, elRef, deviceService, page, navigationService) {
        var _this = this;
        this.deviceService = deviceService;
        this.page = page;
        this.navigationService = navigationService;
        addClass(elRef.nativeElement, 'mobile-app-page');
        this._$ele = $(elRef.nativeElement);
        page.subscribe('wmMobileTabbar:ready', function () { return _this._$ele.addClass('has-tabbar'); });
        // add backbutton listener on every page.
        deviceService.onBackButtonTap(function ($event) {
            if (app.landingPageName === app.activePageName) {
                window.navigator['app'].exitApp();
            }
            else {
                _this.navigationService.goToPrevious();
            }
            return false;
        });
    }
    MobilePageDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmPage]'
                },] }
    ];
    /** @nocollapse */
    MobilePageDirective.ctorParameters = function () { return [
        { type: App },
        { type: ElementRef },
        { type: DeviceService },
        { type: PageDirective },
        { type: AbstractNavigationService }
    ]; };
    return MobilePageDirective;
}());
export { MobilePageDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL3BhZ2UvcGFnZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdEQsT0FBTyxFQUFFLFFBQVEsRUFBRSx5QkFBeUIsRUFBRSxHQUFHLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDcEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUloRDtJQU9JLDZCQUFZLEdBQVEsRUFDUixLQUFpQixFQUNULGFBQTRCLEVBQzVCLElBQW1CLEVBQ25CLGlCQUE0QztRQUpoRSxpQkFrQkM7UUFoQm1CLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLFNBQUksR0FBSixJQUFJLENBQWU7UUFDbkIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUEyQjtRQUM1RCxRQUFRLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBakMsQ0FBaUMsQ0FBQyxDQUFDO1FBRWhGLHlDQUF5QztRQUN6QyxhQUFhLENBQUMsZUFBZSxDQUFDLFVBQUEsTUFBTTtZQUNoQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLEtBQUssR0FBRyxDQUFDLGNBQWMsRUFBRTtnQkFDNUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNyQztpQkFBTTtnQkFDSCxLQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDekM7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7O2dCQXpCSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLFVBQVU7aUJBQ3ZCOzs7O2dCQVI2QyxHQUFHO2dCQUY3QixVQUFVO2dCQUlyQixhQUFhO2dCQURiLGFBQWE7Z0JBREgseUJBQXlCOztJQWdDNUMsMEJBQUM7Q0FBQSxBQTFCRCxJQTBCQztTQXZCWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgYWRkQ2xhc3MsIEFic3RyYWN0TmF2aWdhdGlvblNlcnZpY2UsIEFwcCB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IFBhZ2VEaXJlY3RpdmUgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5pbXBvcnQgeyBEZXZpY2VTZXJ2aWNlIH0gZnJvbSAnQHdtL21vYmlsZS9jb3JlJztcblxuZGVjbGFyZSBjb25zdCAkO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bVBhZ2VdJ1xufSlcbmV4cG9ydCBjbGFzcyBNb2JpbGVQYWdlRGlyZWN0aXZlIHtcblxuICAgIHByaXZhdGUgXyRlbGU7XG5cbiAgICBjb25zdHJ1Y3RvcihhcHA6IEFwcCxcbiAgICAgICAgICAgICAgICBlbFJlZjogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGRldmljZVNlcnZpY2U6IERldmljZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBwYWdlOiBQYWdlRGlyZWN0aXZlLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgbmF2aWdhdGlvblNlcnZpY2U6IEFic3RyYWN0TmF2aWdhdGlvblNlcnZpY2UpIHtcbiAgICAgICAgYWRkQ2xhc3MoZWxSZWYubmF0aXZlRWxlbWVudCwgJ21vYmlsZS1hcHAtcGFnZScpO1xuICAgICAgICB0aGlzLl8kZWxlID0gJChlbFJlZi5uYXRpdmVFbGVtZW50KTtcbiAgICAgICAgcGFnZS5zdWJzY3JpYmUoJ3dtTW9iaWxlVGFiYmFyOnJlYWR5JywgKCkgPT4gdGhpcy5fJGVsZS5hZGRDbGFzcygnaGFzLXRhYmJhcicpKTtcblxuICAgICAgICAvLyBhZGQgYmFja2J1dHRvbiBsaXN0ZW5lciBvbiBldmVyeSBwYWdlLlxuICAgICAgICBkZXZpY2VTZXJ2aWNlLm9uQmFja0J1dHRvblRhcCgkZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGFwcC5sYW5kaW5nUGFnZU5hbWUgPT09IGFwcC5hY3RpdmVQYWdlTmFtZSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5uYXZpZ2F0b3JbJ2FwcCddLmV4aXRBcHAoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uYXZpZ2F0aW9uU2VydmljZS5nb1RvUHJldmlvdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19