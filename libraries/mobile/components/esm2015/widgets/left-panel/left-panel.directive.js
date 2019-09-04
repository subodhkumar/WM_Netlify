import { Directive, ElementRef } from '@angular/core';
import { LeftPanelDirective, PageDirective } from '@wm/components';
import { addClass } from '@wm/core';
import { DeviceService } from '@wm/mobile/core';
export class MobileLeftPanelDirective {
    constructor(page, leftPanelRef, deviceService, elRef) {
        this.page = page;
        this.leftPanelRef = leftPanelRef;
        this.deviceService = deviceService;
        addClass(elRef.nativeElement, 'wm-mobile-app-left-panel');
        page.notify('wmLeftPanel:ready', leftPanelRef);
        page.subscribe('wmLeftPanel:expand', () => {
            this._backBtnListenerDestroyer = deviceService.onBackButtonTap(() => {
                leftPanelRef.collapse();
                return false;
            });
        });
        page.subscribe('wmLeftPanel:collapse', () => {
            this.destroyBackBtnListener();
        });
    }
    ngOnDestroy() {
        this.destroyBackBtnListener();
    }
    destroyBackBtnListener() {
        if (this._backBtnListenerDestroyer) {
            this._backBtnListenerDestroyer();
            this._backBtnListenerDestroyer = null;
        }
    }
}
MobileLeftPanelDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmLeftPanel]'
            },] }
];
/** @nocollapse */
MobileLeftPanelDirective.ctorParameters = () => [
    { type: PageDirective },
    { type: LeftPanelDirective },
    { type: DeviceService },
    { type: ElementRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVmdC1wYW5lbC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2xlZnQtcGFuZWwvbGVmdC1wYW5lbC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQWEsTUFBTSxlQUFlLENBQUM7QUFFakUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ25FLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDcEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBS2hELE1BQU0sT0FBTyx3QkFBd0I7SUFJakMsWUFDWSxJQUFtQixFQUNuQixZQUFnQyxFQUNoQyxhQUE0QixFQUNwQyxLQUFpQjtRQUhULFNBQUksR0FBSixJQUFJLENBQWU7UUFDbkIsaUJBQVksR0FBWixZQUFZLENBQW9CO1FBQ2hDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBR3BDLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLDBCQUEwQixDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtZQUN0QyxJQUFJLENBQUMseUJBQXlCLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hFLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO1lBQ3hDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLFdBQVc7UUFDZCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRU8sc0JBQXNCO1FBQzFCLElBQUksSUFBSSxDQUFDLHlCQUF5QixFQUFFO1lBQ2hDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUM7U0FDekM7SUFDTCxDQUFDOzs7WUFuQ0osU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxlQUFlO2FBQzVCOzs7O1lBTjRCLGFBQWE7WUFBakMsa0JBQWtCO1lBRWxCLGFBQWE7WUFKRixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgTGVmdFBhbmVsRGlyZWN0aXZlLCBQYWdlRGlyZWN0aXZlIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuaW1wb3J0IHsgYWRkQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBEZXZpY2VTZXJ2aWNlIH0gZnJvbSAnQHdtL21vYmlsZS9jb3JlJztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21MZWZ0UGFuZWxdJ1xufSlcbmV4cG9ydCBjbGFzcyBNb2JpbGVMZWZ0UGFuZWxEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuXG4gICAgcHJpdmF0ZSBfYmFja0J0bkxpc3RlbmVyRGVzdHJveWVyO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgcGFnZTogUGFnZURpcmVjdGl2ZSxcbiAgICAgICAgcHJpdmF0ZSBsZWZ0UGFuZWxSZWY6IExlZnRQYW5lbERpcmVjdGl2ZSxcbiAgICAgICAgcHJpdmF0ZSBkZXZpY2VTZXJ2aWNlOiBEZXZpY2VTZXJ2aWNlLFxuICAgICAgICBlbFJlZjogRWxlbWVudFJlZlxuICAgICkge1xuICAgICAgICBhZGRDbGFzcyhlbFJlZi5uYXRpdmVFbGVtZW50LCAnd20tbW9iaWxlLWFwcC1sZWZ0LXBhbmVsJyk7XG4gICAgICAgIHBhZ2Uubm90aWZ5KCd3bUxlZnRQYW5lbDpyZWFkeScsIGxlZnRQYW5lbFJlZik7XG4gICAgICAgIHBhZ2Uuc3Vic2NyaWJlKCd3bUxlZnRQYW5lbDpleHBhbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9iYWNrQnRuTGlzdGVuZXJEZXN0cm95ZXIgPSBkZXZpY2VTZXJ2aWNlLm9uQmFja0J1dHRvblRhcCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGVmdFBhbmVsUmVmLmNvbGxhcHNlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBwYWdlLnN1YnNjcmliZSgnd21MZWZ0UGFuZWw6Y29sbGFwc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3lCYWNrQnRuTGlzdGVuZXIoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCkge1xuICAgICAgICB0aGlzLmRlc3Ryb3lCYWNrQnRuTGlzdGVuZXIoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRlc3Ryb3lCYWNrQnRuTGlzdGVuZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLl9iYWNrQnRuTGlzdGVuZXJEZXN0cm95ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2JhY2tCdG5MaXN0ZW5lckRlc3Ryb3llcigpO1xuICAgICAgICAgICAgdGhpcy5fYmFja0J0bkxpc3RlbmVyRGVzdHJveWVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==