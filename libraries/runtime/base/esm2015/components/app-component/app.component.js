import { ApplicationRef, Component, ElementRef, NgZone, ViewEncapsulation, ViewChild, ViewContainerRef } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { setTheme } from 'ngx-bootstrap';
import { $invokeWatchers, AbstractDialogService, AbstractSpinnerService, getWmProjectProperties, hasCordova, setAppRef, setNgZone, setPipeProvider, App, addClass, removeClass } from '@wm/core';
import { OAuthService } from '@wm/oAuth';
import { PipeProvider } from '../../services/pipe-provider.service';
export class AppComponent {
    constructor(_pipeProvider, _appRef, elRef, oAuthService, dialogService, spinnerService, ngZone, router, app) {
        this.elRef = elRef;
        this.oAuthService = oAuthService;
        this.dialogService = dialogService;
        this.spinnerService = spinnerService;
        this.router = router;
        this.app = app;
        this.startApp = false;
        this.isApplicationType = false;
        this.spinner = { show: false, messages: [] };
        this.isOAuthDialogOpen = false;
        setPipeProvider(_pipeProvider);
        setNgZone(ngZone);
        setAppRef(_appRef);
        this.isApplicationType = getWmProjectProperties().type === 'APPLICATION';
        // subscribe to OAuth changes
        oAuthService.getOAuthProvidersAsObservable().subscribe((providers) => {
            this.providersConfig = providers;
            if (providers.length) {
                this.showOAuthDialog();
            }
            else {
                this.closeOAuthDialog();
            }
        });
        // Subscribe to the message source to show/hide app spinner
        this.spinnerService.getMessageSource().asObservable().subscribe((data) => {
            // setTimeout is to avoid 'ExpressionChangedAfterItHasBeenCheckedError'
            setTimeout(() => {
                this.spinner.show = data.show;
                this.spinner.messages = data.messages;
            });
        });
        // set theme to bs3 on ngx-bootstrap. This avoids runtime calculation to determine bs theme. Thus resolves performance.
        setTheme('bs3');
        if (hasCordova() && !window['wmDeviceReady']) {
            document.addEventListener('wmDeviceReady', () => this.startApp = true);
        }
        else {
            this.startApp = true;
        }
        let spinnerId;
        this.router.events.subscribe(e => {
            if (e instanceof NavigationStart) {
                spinnerId = this.spinnerService.show('', 'globalSpinner');
                const node = document.querySelector('app-page-outlet');
                if (node) {
                    addClass(node, 'page-load-in-progress');
                }
            }
            else if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
                setTimeout(() => {
                    this.spinnerService.hide(spinnerId);
                    const node = document.querySelector('app-page-outlet');
                    if (node) {
                        removeClass(node, 'page-load-in-progress');
                    }
                }, 1000);
            }
        });
    }
    showOAuthDialog() {
        if (!this.isOAuthDialogOpen) {
            this.isOAuthDialogOpen = true;
            this.dialogService.open('oAuthLoginDialog', this);
        }
    }
    closeOAuthDialog() {
        if (this.isOAuthDialogOpen) {
            this.isOAuthDialogOpen = false;
            this.dialogService.close('oAuthLoginDialog', this);
        }
    }
    ngAfterViewInit() {
        this.app.dynamicComponentContainerRef = this.dynamicComponentContainerRef;
    }
    ngDoCheck() {
        $invokeWatchers();
    }
}
AppComponent.decorators = [
    { type: Component, args: [{
                selector: 'app-root',
                template: "<ng-container *ngIf=\"startApp\">\n    <router-outlet></router-outlet>\n    <div wmContainer partialContainer content=\"Common\" hidden class=\"ng-hide\" *ngIf=\"isApplicationType\"></div>\n    <app-spinner [show]=\"spinner.show\" [spinnermessages]=\"spinner.messages\"></app-spinner>\n    <div wmDialog name=\"oAuthLoginDialog\" title.bind=\"'Application is requesting you to sign in with'\"\n         close.event=\"closeOAuthDialog()\">\n        <ng-template #dialogBody>\n            <ul class=\"list-items\">\n                <li class=\"list-item\" *ngFor=\"let provider of providersConfig\">\n                    <button class=\"btn\" (click)=\"provider.invoke()\">{{provider.name}}</button>\n                </li>\n            </ul>\n        </ng-template>\n    </div>\n    <div wmConfirmDialog name=\"_app-confirm-dialog\" title.bind=\"title\" message.bind=\"message\" oktext.bind=\"oktext\"\n         canceltext.bind=\"canceltext\" closable=\"false\"\n         iconclass.bind=\"iconclass\" ok.event=\"onOk()\" cancel.event=\"onCancel()\" close.event=\"onClose()\" opened.event=\"onOpen()\"></div>\n    <div wmAppExt></div>\n    <i id=\"wm-mobile-display\"></i>\n</ng-container>\n<!--Dummy container to create the component dynamically-->\n<ng-container #dynamicComponent></ng-container>\n",
                encapsulation: ViewEncapsulation.None
            }] }
];
/** @nocollapse */
AppComponent.ctorParameters = () => [
    { type: PipeProvider },
    { type: ApplicationRef },
    { type: ElementRef },
    { type: OAuthService },
    { type: AbstractDialogService },
    { type: AbstractSpinnerService },
    { type: NgZone },
    { type: Router },
    { type: App }
];
AppComponent.propDecorators = {
    dynamicComponentContainerRef: [{ type: ViewChild, args: ['dynamicComponent', { read: ViewContainerRef },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJjb21wb25lbnRzL2FwcC1jb21wb25lbnQvYXBwLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBVyxVQUFVLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFDdEosT0FBTyxFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRTVHLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFFLGVBQWUsRUFBRSxxQkFBcUIsRUFBRSxzQkFBc0IsRUFBRSxzQkFBc0IsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDak0sT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFZcEUsTUFBTSxPQUFPLFlBQVk7SUFPckIsWUFDSSxhQUEyQixFQUMzQixPQUF1QixFQUNmLEtBQWlCLEVBQ2pCLFlBQTBCLEVBQzFCLGFBQW9DLEVBQ3BDLGNBQXNDLEVBQzlDLE1BQWMsRUFDTixNQUFjLEVBQ2QsR0FBUTtRQU5SLFVBQUssR0FBTCxLQUFLLENBQVk7UUFDakIsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDMUIsa0JBQWEsR0FBYixhQUFhLENBQXVCO1FBQ3BDLG1CQUFjLEdBQWQsY0FBYyxDQUF3QjtRQUV0QyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsUUFBRyxHQUFILEdBQUcs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LEVBQUU7WUFDekIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztZQUM5QixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNyRDtJQUNMLENBQUM7SUFFRCxnQkFBZ0I7UUFDWixJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUN4QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1lBQy9CLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3REO0lBQ0wsQ0FBQztJQUVELGVBQWU7UUFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLDRCQUE0QixHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQztJQUM5RSxDQUFDO0lBRUQsU0FBUztRQUNMLGVBQWUsRUFBRSxDQUFDO0lBQ3RCLENBQUM7OztZQXBHSixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLFVBQVU7Z0JBQ3BCLDZ4Q0FBbUM7Z0JBQ25DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2FBQ3hDOzs7O1lBWFEsWUFBWTtZQVBaLGNBQWM7WUFBc0IsVUFBVTtZQU05QyxZQUFZO1lBREsscUJBQXFCO1lBQUUsc0JBQXNCO1lBTGQsTUFBTTtZQUNhLE1BQU07WUFJa0UsR0FBRzs7OzJDQWtCbEosU0FBUyxTQUFDLGtCQUFrQixFQUFFLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwbGljYXRpb25SZWYsIENvbXBvbmVudCwgRG9DaGVjaywgRWxlbWVudFJlZiwgTmdab25lLCBWaWV3RW5jYXBzdWxhdGlvbiwgVmlld0NoaWxkLCBWaWV3Q29udGFpbmVyUmVmLCBBZnRlclZpZXdJbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uQ2FuY2VsLCBOYXZpZ2F0aW9uRW5kLCBOYXZpZ2F0aW9uRXJyb3IsIE5hdmlnYXRpb25TdGFydCwgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgc2V0VGhlbWUgfSBmcm9tICduZ3gtYm9vdHN0cmFwJztcblxuaW1wb3J0IHsgJGludm9rZVdhdGNoZXJzLCBBYnN0cmFjdERpYWxvZ1NlcnZpY2UsIEFic3RyYWN0U3Bpbm5lclNlcnZpY2UsIGdldFdtUHJvamVjdFByb3BlcnRpZXMsIGhhc0NvcmRvdmEsIHNldEFwcFJlZiwgc2V0Tmdab25lLCBzZXRQaXBlUHJvdmlkZXIsIEFwcCwgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgT0F1dGhTZXJ2aWNlIH0gZnJvbSAnQHdtL29BdXRoJztcbmltcG9ydCB7IFBpcGVQcm92aWRlciB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL3BpcGUtcHJvdmlkZXIuc2VydmljZSc7XG5cbmludGVyZmFjZSBTUElOTkVSIHtcbiAgICBzaG93OiBib29sZWFuO1xuICAgIG1lc3NhZ2VzOiBBcnJheTxzdHJpbmc+O1xufVxuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FwcC1yb290JyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vYXBwLmNvbXBvbmVudC5odG1sJyxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIEFwcENvbXBvbmVudCBpbXBsZW1lbnRzIERvQ2hlY2ssIEFmdGVyVmlld0luaXQge1xuICAgIHB1YmxpYyBzdGFydEFwcCA9IGZhbHNlO1xuICAgIHB1YmxpYyBpc0FwcGxpY2F0aW9uVHlwZSA9IGZhbHNlO1xuXG4gICAgQFZpZXdDaGlsZCgnZHluYW1pY0NvbXBvbmVudCcsIHtyZWFkOiBWaWV3Q29udGFpbmVyUmVmfSkgZHluYW1pY0NvbXBvbmVudENvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZjtcblxuICAgIHNwaW5uZXI6IFNQSU5ORVIgPSB7c2hvdzogZmFsc2UsIG1lc3NhZ2VzOiBbXX07XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIF9waXBlUHJvdmlkZXI6IFBpcGVQcm92aWRlcixcbiAgICAgICAgX2FwcFJlZjogQXBwbGljYXRpb25SZWYsXG4gICAgICAgIHByaXZhdGUgZWxSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgIHByaXZhdGUgb0F1dGhTZXJ2aWNlOiBPQXV0aFNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgZGlhbG9nU2VydmljZTogQWJzdHJhY3REaWFsb2dTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHNwaW5uZXJTZXJ2aWNlOiBBYnN0cmFjdFNwaW5uZXJTZXJ2aWNlLFxuICAgICAgICBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgICAgICAgcHJpdmF0ZSBhcHA6IEFwcFxuICAgICkge1xuICAgICAgICBzZXRQaXBlUHJvdmlkZXIoX3BpcGVQcm92aWRlcik7XG4gICAgICAgIHNldE5nWm9uZShuZ1pvbmUpO1xuICAgICAgICBzZXRBcHBSZWYoX2FwcFJlZik7XG5cbiAgICAgICAgdGhpcy5pc0FwcGxpY2F0aW9uVHlwZSA9IGdldFdtUHJvamVjdFByb3BlcnRpZXMoKS50eXBlID09PSAnQVBQTElDQVRJT04nO1xuXG4gICAgICAgIC8vIHN1YnNjcmliZSB0byBPQXV0aCBjaGFuZ2VzXG4gICAgICAgIG9BdXRoU2VydmljZS5nZXRPQXV0aFByb3ZpZGVyc0FzT2JzZXJ2YWJsZSgpLnN1YnNjcmliZSgocHJvdmlkZXJzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJvdmlkZXJzQ29uZmlnID0gcHJvdmlkZXJzO1xuICAgICAgICAgICAgaWYgKHByb3ZpZGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dPQXV0aERpYWxvZygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlT0F1dGhEaWFsb2coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU3Vic2NyaWJlIHRvIHRoZSBtZXNzYWdlIHNvdXJjZSB0byBzaG93L2hpZGUgYXBwIHNwaW5uZXJcbiAgICAgICAgdGhpcy5zcGlubmVyU2VydmljZS5nZXRNZXNzYWdlU291cmNlKCkuYXNPYnNlcnZhYmxlKCkuc3Vic2NyaWJlKChkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8vIHNldFRpbWVvdXQgaXMgdG8gYXZvaWQgJ0V4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXJyb3InXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNwaW5uZXIuc2hvdyA9IGRhdGEuc2hvdztcbiAgICAgICAgICAgICAgICB0aGlzLnNwaW5uZXIubWVzc2FnZXMgPSBkYXRhLm1lc3NhZ2VzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHNldCB0aGVtZSB0byBiczMgb24gbmd4LWJvb3RzdHJhcC4gVGhpcyBhdm9pZHMgcnVudGltZSBjYWxjdWxhdGlvbiB0byBkZXRlcm1pbmUgYnMgdGhlbWUuIFRodXMgcmVzb2x2ZXMgcGVyZm9ybWFuY2UuXG4gICAgICAgIHNldFRoZW1lKCdiczMnKTtcbiAgICAgICAgaWYgKGhhc0NvcmRvdmEoKSAmJiAhd2luZG93Wyd3bURldmljZVJlYWR5J10pIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3dtRGV2aWNlUmVhZHknICwgKCkgPT4gdGhpcy5zdGFydEFwcCA9IHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGFydEFwcCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3Bpbm5lcklkO1xuXG4gICAgICAgIHRoaXMucm91dGVyLmV2ZW50cy5zdWJzY3JpYmUoZSA9PiB7XG4gICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIE5hdmlnYXRpb25TdGFydCkge1xuICAgICAgICAgICAgICAgIHNwaW5uZXJJZCA9IHRoaXMuc3Bpbm5lclNlcnZpY2Uuc2hvdygnJywgJ2dsb2JhbFNwaW5uZXInKTtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYXBwLXBhZ2Utb3V0bGV0JykgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkQ2xhc3Mobm9kZSwgJ3BhZ2UtbG9hZC1pbi1wcm9ncmVzcycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZSBpbnN0YW5jZW9mIE5hdmlnYXRpb25FbmQgfHwgZSBpbnN0YW5jZW9mIE5hdmlnYXRpb25DYW5jZWwgfHwgZSBpbnN0YW5jZW9mIE5hdmlnYXRpb25FcnJvcikge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwaW5uZXJTZXJ2aWNlLmhpZGUoc3Bpbm5lcklkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FwcC1wYWdlLW91dGxldCcpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3Mobm9kZSwgJ3BhZ2UtbG9hZC1pbi1wcm9ncmVzcycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb3ZpZGVyc0NvbmZpZztcbiAgICBpc09BdXRoRGlhbG9nT3BlbiA9IGZhbHNlO1xuXG4gICAgc2hvd09BdXRoRGlhbG9nKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNPQXV0aERpYWxvZ09wZW4pIHtcbiAgICAgICAgICAgIHRoaXMuaXNPQXV0aERpYWxvZ09wZW4gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5kaWFsb2dTZXJ2aWNlLm9wZW4oJ29BdXRoTG9naW5EaWFsb2cnLCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsb3NlT0F1dGhEaWFsb2coKSB7XG4gICAgICAgIGlmICh0aGlzLmlzT0F1dGhEaWFsb2dPcGVuKSB7XG4gICAgICAgICAgICB0aGlzLmlzT0F1dGhEaWFsb2dPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmRpYWxvZ1NlcnZpY2UuY2xvc2UoJ29BdXRoTG9naW5EaWFsb2cnLCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgdGhpcy5hcHAuZHluYW1pY0NvbXBvbmVudENvbnRhaW5lclJlZiA9IHRoaXMuZHluYW1pY0NvbXBvbmVudENvbnRhaW5lclJlZjtcbiAgICB9XG5cbiAgICBuZ0RvQ2hlY2soKSB7XG4gICAgICAgICRpbnZva2VXYXRjaGVycygpO1xuICAgIH1cbn1cbiJdfQ==