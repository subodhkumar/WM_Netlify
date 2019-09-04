import { ApplicationRef, Component, ElementRef, NgZone, ViewEncapsulation, ViewChild, ViewContainerRef } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { setTheme } from 'ngx-bootstrap';
import { $invokeWatchers, AbstractDialogService, AbstractSpinnerService, getWmProjectProperties, hasCordova, setAppRef, setNgZone, setPipeProvider, App, addClass, removeClass } from '@wm/core';
import { OAuthService } from '@wm/oAuth';
import { PipeProvider } from '../../services/pipe-provider.service';
var AppComponent = /** @class */ (function () {
    function AppComponent(_pipeProvider, _appRef, elRef, oAuthService, dialogService, spinnerService, ngZone, router, app) {
        var _this = this;
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
        oAuthService.getOAuthProvidersAsObservable().subscribe(function (providers) {
            _this.providersConfig = providers;
            if (providers.length) {
                _this.showOAuthDialog();
            }
            else {
                _this.closeOAuthDialog();
            }
        });
        // Subscribe to the message source to show/hide app spinner
        this.spinnerService.getMessageSource().asObservable().subscribe(function (data) {
            // setTimeout is to avoid 'ExpressionChangedAfterItHasBeenCheckedError'
            setTimeout(function () {
                _this.spinner.show = data.show;
                _this.spinner.messages = data.messages;
            });
        });
        // set theme to bs3 on ngx-bootstrap. This avoids runtime calculation to determine bs theme. Thus resolves performance.
        setTheme('bs3');
        if (hasCordova() && !window['wmDeviceReady']) {
            document.addEventListener('wmDeviceReady', function () { return _this.startApp = true; });
        }
        else {
            this.startApp = true;
        }
        var spinnerId;
        this.router.events.subscribe(function (e) {
            if (e instanceof NavigationStart) {
                spinnerId = _this.spinnerService.show('', 'globalSpinner');
                var node = document.querySelector('app-page-outlet');
                if (node) {
                    addClass(node, 'page-load-in-progress');
                }
            }
            else if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
                setTimeout(function () {
                    _this.spinnerService.hide(spinnerId);
                    var node = document.querySelector('app-page-outlet');
                    if (node) {
                        removeClass(node, 'page-load-in-progress');
                    }
                }, 1000);
            }
        });
    }
    AppComponent.prototype.showOAuthDialog = function () {
        if (!this.isOAuthDialogOpen) {
            this.isOAuthDialogOpen = true;
            this.dialogService.open('oAuthLoginDialog', this);
        }
    };
    AppComponent.prototype.closeOAuthDialog = function () {
        if (this.isOAuthDialogOpen) {
            this.isOAuthDialogOpen = false;
            this.dialogService.close('oAuthLoginDialog', this);
        }
    };
    AppComponent.prototype.ngAfterViewInit = function () {
        this.app.dynamicComponentContainerRef = this.dynamicComponentContainerRef;
    };
    AppComponent.prototype.ngDoCheck = function () {
        $invokeWatchers();
    };
    AppComponent.decorators = [
        { type: Component, args: [{
                    selector: 'app-root',
                    template: "<ng-container *ngIf=\"startApp\">\n    <router-outlet></router-outlet>\n    <div wmContainer partialContainer content=\"Common\" hidden class=\"ng-hide\" *ngIf=\"isApplicationType\"></div>\n    <app-spinner [show]=\"spinner.show\" [spinnermessages]=\"spinner.messages\"></app-spinner>\n    <div wmDialog name=\"oAuthLoginDialog\" title.bind=\"'Application is requesting you to sign in with'\"\n         close.event=\"closeOAuthDialog()\">\n        <ng-template #dialogBody>\n            <ul class=\"list-items\">\n                <li class=\"list-item\" *ngFor=\"let provider of providersConfig\">\n                    <button class=\"btn\" (click)=\"provider.invoke()\">{{provider.name}}</button>\n                </li>\n            </ul>\n        </ng-template>\n    </div>\n    <div wmConfirmDialog name=\"_app-confirm-dialog\" title.bind=\"title\" message.bind=\"message\" oktext.bind=\"oktext\"\n         canceltext.bind=\"canceltext\" closable=\"false\"\n         iconclass.bind=\"iconclass\" ok.event=\"onOk()\" cancel.event=\"onCancel()\" close.event=\"onClose()\" opened.event=\"onOpen()\"></div>\n    <div wmAppExt></div>\n    <i id=\"wm-mobile-display\"></i>\n</ng-container>\n<!--Dummy container to create the component dynamically-->\n<ng-container #dynamicComponent></ng-container>\n",
                    encapsulation: ViewEncapsulation.None
                }] }
    ];
    /** @nocollapse */
    AppComponent.ctorParameters = function () { return [
        { type: PipeProvider },
        { type: ApplicationRef },
        { type: ElementRef },
        { type: OAuthService },
        { type: AbstractDialogService },
        { type: AbstractSpinnerService },
        { type: NgZone },
        { type: Router },
        { type: App }
    ]; };
    AppComponent.propDecorators = {
        dynamicComponentContainerRef: [{ type: ViewChild, args: ['dynamicComponent', { read: ViewContainerRef },] }]
    };
    return AppComponent;
}());
export { AppComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJjb21wb25lbnRzL2FwcC1jb21wb25lbnQvYXBwLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBVyxVQUFVLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFDdEosT0FBTyxFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRTVHLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFFLGVBQWUsRUFBRSxxQkFBcUIsRUFBRSxzQkFBc0IsRUFBRSxzQkFBc0IsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDak0sT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFPcEU7SUFZSSxzQkFDSSxhQUEyQixFQUMzQixPQUF1QixFQUNmLEtBQWlCLEVBQ2pCLFlBQTBCLEVBQzFCLGFBQW9DLEVBQ3BDLGNBQXNDLEVBQzlDLE1BQWMsRUFDTixNQUFjLEVBQ2QsR0FBUTtRQVRwQixpQkErREM7UUE1RFcsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUNqQixpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQixrQkFBYSxHQUFiLGFBQWEsQ0FBdUI7UUFDcEMsbUJBQWMsR0FBZCxjQUFjLENBQXdCO1FBRXRDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxRQUFHLEdBQUgsR0FBRyxD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LElBQUksQ0FBQztZQUM5QixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNyRDtJQUNMLENBQUM7SUFFRCx1Q0FBZ0IsR0FBaEI7UUFDSSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUN4QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1lBQy9CLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3REO0lBQ0wsQ0FBQztJQUVELHNDQUFlLEdBQWY7UUFDSSxJQUFJLENBQUMsR0FBRyxDQUFDLDRCQUE0QixHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQztJQUM5RSxDQUFDO0lBRUQsZ0NBQVMsR0FBVDtRQUNJLGVBQWUsRUFBRSxDQUFDO0lBQ3RCLENBQUM7O2dCQXBHSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLFVBQVU7b0JBQ3BCLDZ4Q0FBbUM7b0JBQ25DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2lCQUN4Qzs7OztnQkFYUSxZQUFZO2dCQVBaLGNBQWM7Z0JBQXNCLFVBQVU7Z0JBTTlDLFlBQVk7Z0JBREsscUJBQXFCO2dCQUFFLHNCQUFzQjtnQkFMZCxNQUFNO2dCQUNhLE1BQU07Z0JBSWtFLEdBQUc7OzsrQ0FrQmxKLFNBQVMsU0FBQyxrQkFBa0IsRUFBRSxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBQzs7SUE0RjNELG1CQUFDO0NBQUEsQUFyR0QsSUFxR0M7U0FoR1ksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcGxpY2F0aW9uUmVmLCBDb21wb25lbnQsIERvQ2hlY2ssIEVsZW1lbnRSZWYsIE5nWm9uZSwgVmlld0VuY2Fwc3VsYXRpb24sIFZpZXdDaGlsZCwgVmlld0NvbnRhaW5lclJlZiwgQWZ0ZXJWaWV3SW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmF2aWdhdGlvbkNhbmNlbCwgTmF2aWdhdGlvbkVuZCwgTmF2aWdhdGlvbkVycm9yLCBOYXZpZ2F0aW9uU3RhcnQsIFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IHNldFRoZW1lIH0gZnJvbSAnbmd4LWJvb3RzdHJhcCc7XG5cbmltcG9ydCB7ICRpbnZva2VXYXRjaGVycywgQWJzdHJhY3REaWFsb2dTZXJ2aWNlLCBBYnN0cmFjdFNwaW5uZXJTZXJ2aWNlLCBnZXRXbVByb2plY3RQcm9wZXJ0aWVzLCBoYXNDb3Jkb3ZhLCBzZXRBcHBSZWYsIHNldE5nWm9uZSwgc2V0UGlwZVByb3ZpZGVyLCBBcHAsIGFkZENsYXNzLCByZW1vdmVDbGFzcyB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IE9BdXRoU2VydmljZSB9IGZyb20gJ0B3bS9vQXV0aCc7XG5pbXBvcnQgeyBQaXBlUHJvdmlkZXIgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9waXBlLXByb3ZpZGVyLnNlcnZpY2UnO1xuXG5pbnRlcmZhY2UgU1BJTk5FUiB7XG4gICAgc2hvdzogYm9vbGVhbjtcbiAgICBtZXNzYWdlczogQXJyYXk8c3RyaW5nPjtcbn1cblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhcHAtcm9vdCcsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2FwcC5jb21wb25lbnQuaHRtbCcsXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBBcHBDb21wb25lbnQgaW1wbGVtZW50cyBEb0NoZWNrLCBBZnRlclZpZXdJbml0IHtcbiAgICBwdWJsaWMgc3RhcnRBcHAgPSBmYWxzZTtcbiAgICBwdWJsaWMgaXNBcHBsaWNhdGlvblR5cGUgPSBmYWxzZTtcblxuICAgIEBWaWV3Q2hpbGQoJ2R5bmFtaWNDb21wb25lbnQnLCB7cmVhZDogVmlld0NvbnRhaW5lclJlZn0pIGR5bmFtaWNDb21wb25lbnRDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgICBzcGlubmVyOiBTUElOTkVSID0ge3Nob3c6IGZhbHNlLCBtZXNzYWdlczogW119O1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBfcGlwZVByb3ZpZGVyOiBQaXBlUHJvdmlkZXIsXG4gICAgICAgIF9hcHBSZWY6IEFwcGxpY2F0aW9uUmVmLFxuICAgICAgICBwcml2YXRlIGVsUmVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwcml2YXRlIG9BdXRoU2VydmljZTogT0F1dGhTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGRpYWxvZ1NlcnZpY2U6IEFic3RyYWN0RGlhbG9nU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBzcGlubmVyU2VydmljZTogQWJzdHJhY3RTcGlubmVyU2VydmljZSxcbiAgICAgICAgbmdab25lOiBOZ1pvbmUsXG4gICAgICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICAgICAgIHByaXZhdGUgYXBwOiBBcHBcbiAgICApIHtcbiAgICAgICAgc2V0UGlwZVByb3ZpZGVyKF9waXBlUHJvdmlkZXIpO1xuICAgICAgICBzZXROZ1pvbmUobmdab25lKTtcbiAgICAgICAgc2V0QXBwUmVmKF9hcHBSZWYpO1xuXG4gICAgICAgIHRoaXMuaXNBcHBsaWNhdGlvblR5cGUgPSBnZXRXbVByb2plY3RQcm9wZXJ0aWVzKCkudHlwZSA9PT0gJ0FQUExJQ0FUSU9OJztcblxuICAgICAgICAvLyBzdWJzY3JpYmUgdG8gT0F1dGggY2hhbmdlc1xuICAgICAgICBvQXV0aFNlcnZpY2UuZ2V0T0F1dGhQcm92aWRlcnNBc09ic2VydmFibGUoKS5zdWJzY3JpYmUoKHByb3ZpZGVyczogYW55KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb3ZpZGVyc0NvbmZpZyA9IHByb3ZpZGVycztcbiAgICAgICAgICAgIGlmIChwcm92aWRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93T0F1dGhEaWFsb2coKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZU9BdXRoRGlhbG9nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFN1YnNjcmliZSB0byB0aGUgbWVzc2FnZSBzb3VyY2UgdG8gc2hvdy9oaWRlIGFwcCBzcGlubmVyXG4gICAgICAgIHRoaXMuc3Bpbm5lclNlcnZpY2UuZ2V0TWVzc2FnZVNvdXJjZSgpLmFzT2JzZXJ2YWJsZSgpLnN1YnNjcmliZSgoZGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICAvLyBzZXRUaW1lb3V0IGlzIHRvIGF2b2lkICdFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEVycm9yJ1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zcGlubmVyLnNob3cgPSBkYXRhLnNob3c7XG4gICAgICAgICAgICAgICAgdGhpcy5zcGlubmVyLm1lc3NhZ2VzID0gZGF0YS5tZXNzYWdlcztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBzZXQgdGhlbWUgdG8gYnMzIG9uIG5neC1ib290c3RyYXAuIFRoaXMgYXZvaWRzIHJ1bnRpbWUgY2FsY3VsYXRpb24gdG8gZGV0ZXJtaW5lIGJzIHRoZW1lLiBUaHVzIHJlc29sdmVzIHBlcmZvcm1hbmNlLlxuICAgICAgICBzZXRUaGVtZSgnYnMzJyk7XG4gICAgICAgIGlmIChoYXNDb3Jkb3ZhKCkgJiYgIXdpbmRvd1snd21EZXZpY2VSZWFkeSddKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd3bURldmljZVJlYWR5JyAsICgpID0+IHRoaXMuc3RhcnRBcHAgPSB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRBcHAgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNwaW5uZXJJZDtcblxuICAgICAgICB0aGlzLnJvdXRlci5ldmVudHMuc3Vic2NyaWJlKGUgPT4ge1xuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uU3RhcnQpIHtcbiAgICAgICAgICAgICAgICBzcGlubmVySWQgPSB0aGlzLnNwaW5uZXJTZXJ2aWNlLnNob3coJycsICdnbG9iYWxTcGlubmVyJyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FwcC1wYWdlLW91dGxldCcpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZENsYXNzKG5vZGUsICdwYWdlLWxvYWQtaW4tcHJvZ3Jlc3MnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uRW5kIHx8IGUgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uQ2FuY2VsIHx8IGUgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGlubmVyU2VydmljZS5oaWRlKHNwaW5uZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhcHAtcGFnZS1vdXRsZXQnKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUNsYXNzKG5vZGUsICdwYWdlLWxvYWQtaW4tcHJvZ3Jlc3MnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm92aWRlcnNDb25maWc7XG4gICAgaXNPQXV0aERpYWxvZ09wZW4gPSBmYWxzZTtcblxuICAgIHNob3dPQXV0aERpYWxvZygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzT0F1dGhEaWFsb2dPcGVuKSB7XG4gICAgICAgICAgICB0aGlzLmlzT0F1dGhEaWFsb2dPcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZGlhbG9nU2VydmljZS5vcGVuKCdvQXV0aExvZ2luRGlhbG9nJywgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbG9zZU9BdXRoRGlhbG9nKCkge1xuICAgICAgICBpZiAodGhpcy5pc09BdXRoRGlhbG9nT3Blbikge1xuICAgICAgICAgICAgdGhpcy5pc09BdXRoRGlhbG9nT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5kaWFsb2dTZXJ2aWNlLmNsb3NlKCdvQXV0aExvZ2luRGlhbG9nJywgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHRoaXMuYXBwLmR5bmFtaWNDb21wb25lbnRDb250YWluZXJSZWYgPSB0aGlzLmR5bmFtaWNDb21wb25lbnRDb250YWluZXJSZWY7XG4gICAgfVxuXG4gICAgbmdEb0NoZWNrKCkge1xuICAgICAgICAkaW52b2tlV2F0Y2hlcnMoKTtcbiAgICB9XG59XG4iXX0=