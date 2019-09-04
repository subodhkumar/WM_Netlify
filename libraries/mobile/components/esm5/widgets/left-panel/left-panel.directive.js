import { Directive, ElementRef } from '@angular/core';
import { LeftPanelDirective, PageDirective } from '@wm/components';
import { addClass } from '@wm/core';
import { DeviceService } from '@wm/mobile/core';
var MobileLeftPanelDirective = /** @class */ (function () {
    function MobileLeftPanelDirective(page, leftPanelRef, deviceService, elRef) {
        var _this = this;
        this.page = page;
        this.leftPanelRef = leftPanelRef;
        this.deviceService = deviceService;
        addClass(elRef.nativeElement, 'wm-mobile-app-left-panel');
        page.notify('wmLeftPanel:ready', leftPanelRef);
        page.subscribe('wmLeftPanel:expand', function () {
            _this._backBtnListenerDestroyer = deviceService.onBackButtonTap(function () {
                leftPanelRef.collapse();
                return false;
            });
        });
        page.subscribe('wmLeftPanel:collapse', function () {
            _this.destroyBackBtnListener();
        });
    }
    MobileLeftPanelDirective.prototype.ngOnDestroy = function () {
        this.destroyBackBtnListener();
    };
    MobileLeftPanelDirective.prototype.destroyBackBtnListener = function () {
        if (this._backBtnListenerDestroyer) {
            this._backBtnListenerDestroyer();
            this._backBtnListenerDestroyer = null;
        }
    };
    MobileLeftPanelDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmLeftPanel]'
                },] }
    ];
    /** @nocollapse */
    MobileLeftPanelDirective.ctorParameters = function () { return [
        { type: PageDirective },
        { type: LeftPanelDirective },
        { type: DeviceService },
        { type: ElementRef }
    ]; };
    return MobileLeftPanelDirective;
}());
export { MobileLeftPanelDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVmdC1wYW5lbC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2xlZnQtcGFuZWwvbGVmdC1wYW5lbC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQWEsTUFBTSxlQUFlLENBQUM7QUFFakUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ25FLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDcEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRWhEO0lBT0ksa0NBQ1ksSUFBbUIsRUFDbkIsWUFBZ0MsRUFDaEMsYUFBNEIsRUFDcEMsS0FBaUI7UUFKckIsaUJBaUJDO1FBaEJXLFNBQUksR0FBSixJQUFJLENBQWU7UUFDbkIsaUJBQVksR0FBWixZQUFZLENBQW9CO1FBQ2hDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBR3BDLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLDBCQUEwQixDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixFQUFFO1lBQ2pDLEtBQUksQ0FBQyx5QkFBeUIsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDO2dCQUMzRCxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3hCLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixFQUFFO1lBQ25DLEtBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLDhDQUFXLEdBQWxCO1FBQ0ksSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVPLHlEQUFzQixHQUE5QjtRQUNJLElBQUksSUFBSSxDQUFDLHlCQUF5QixFQUFFO1lBQ2hDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUM7U0FDekM7SUFDTCxDQUFDOztnQkFuQ0osU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxlQUFlO2lCQUM1Qjs7OztnQkFONEIsYUFBYTtnQkFBakMsa0JBQWtCO2dCQUVsQixhQUFhO2dCQUpGLFVBQVU7O0lBMEM5QiwrQkFBQztDQUFBLEFBcENELElBb0NDO1NBakNZLHdCQUF3QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IExlZnRQYW5lbERpcmVjdGl2ZSwgUGFnZURpcmVjdGl2ZSB9IGZyb20gJ0B3bS9jb21wb25lbnRzJztcbmltcG9ydCB7IGFkZENsYXNzIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgRGV2aWNlU2VydmljZSB9IGZyb20gJ0B3bS9tb2JpbGUvY29yZSc7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtTGVmdFBhbmVsXSdcbn0pXG5leHBvcnQgY2xhc3MgTW9iaWxlTGVmdFBhbmVsRGlyZWN0aXZlIGltcGxlbWVudHMgT25EZXN0cm95IHtcblxuICAgIHByaXZhdGUgX2JhY2tCdG5MaXN0ZW5lckRlc3Ryb3llcjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHBhZ2U6IFBhZ2VEaXJlY3RpdmUsXG4gICAgICAgIHByaXZhdGUgbGVmdFBhbmVsUmVmOiBMZWZ0UGFuZWxEaXJlY3RpdmUsXG4gICAgICAgIHByaXZhdGUgZGV2aWNlU2VydmljZTogRGV2aWNlU2VydmljZSxcbiAgICAgICAgZWxSZWY6IEVsZW1lbnRSZWZcbiAgICApIHtcbiAgICAgICAgYWRkQ2xhc3MoZWxSZWYubmF0aXZlRWxlbWVudCwgJ3dtLW1vYmlsZS1hcHAtbGVmdC1wYW5lbCcpO1xuICAgICAgICBwYWdlLm5vdGlmeSgnd21MZWZ0UGFuZWw6cmVhZHknLCBsZWZ0UGFuZWxSZWYpO1xuICAgICAgICBwYWdlLnN1YnNjcmliZSgnd21MZWZ0UGFuZWw6ZXhwYW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fYmFja0J0bkxpc3RlbmVyRGVzdHJveWVyID0gZGV2aWNlU2VydmljZS5vbkJhY2tCdXR0b25UYXAoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxlZnRQYW5lbFJlZi5jb2xsYXBzZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcGFnZS5zdWJzY3JpYmUoJ3dtTGVmdFBhbmVsOmNvbGxhcHNlJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95QmFja0J0bkxpc3RlbmVyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5kZXN0cm95QmFja0J0bkxpc3RlbmVyKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkZXN0cm95QmFja0J0bkxpc3RlbmVyKCkge1xuICAgICAgICBpZiAodGhpcy5fYmFja0J0bkxpc3RlbmVyRGVzdHJveWVyKSB7XG4gICAgICAgICAgICB0aGlzLl9iYWNrQnRuTGlzdGVuZXJEZXN0cm95ZXIoKTtcbiAgICAgICAgICAgIHRoaXMuX2JhY2tCdG5MaXN0ZW5lckRlc3Ryb3llciA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=