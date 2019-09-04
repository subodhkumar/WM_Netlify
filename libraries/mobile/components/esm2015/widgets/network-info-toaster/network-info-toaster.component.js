import { Component, Injector } from '@angular/core';
import { provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { registerProps } from './network-info-toaster.props';
import { $appDigest, App } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
const DEFAULT_CLS = 'network-info-toaster';
const WIDGET_CONFIG = { widgetType: 'wm-network-info-toaster', hostClass: DEFAULT_CLS };
export var NetworkState;
(function (NetworkState) {
    NetworkState[NetworkState["CONNECTED"] = 1] = "CONNECTED";
    NetworkState[NetworkState["CONNECTING"] = 0] = "CONNECTING";
    NetworkState[NetworkState["SERVICE_AVAILABLE_BUT_NOT_CONNECTED"] = -1] = "SERVICE_AVAILABLE_BUT_NOT_CONNECTED";
    NetworkState[NetworkState["NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE"] = -2] = "NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE";
    NetworkState[NetworkState["NETWORK_NOT_AVAIABLE"] = -3] = "NETWORK_NOT_AVAIABLE";
})(NetworkState || (NetworkState = {}));
export class NetworkInfoToasterComponent extends StylableComponent {
    constructor(networkService, app, inj) {
        super(inj, WIDGET_CONFIG);
        this.networkService = networkService;
        this.showMessage = false;
        this.isServiceConnected = false;
        this.isServiceAvailable = false;
        styler(this.$element, this);
        this.isServiceAvailable = this.networkService.isAvailable();
        this.isServiceConnected = this.networkService.isConnected();
        this._listenerDestroyer = app.subscribe('onNetworkStateChange', (data) => {
            const oldState = this.networkState;
            let autoHide = false;
            if (data.isConnected) {
                this.networkState = NetworkState.CONNECTED;
                autoHide = true;
            }
            else if (data.isConnecting) {
                this.networkState = NetworkState.CONNECTING;
            }
            else if (data.isServiceAvailable) {
                this.networkState = NetworkState.SERVICE_AVAILABLE_BUT_NOT_CONNECTED;
            }
            else if (data.isNetworkAvailable && !data.isServiceAvailable) {
                this.networkState = NetworkState.NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE;
            }
            else {
                this.networkState = NetworkState.NETWORK_NOT_AVAIABLE;
            }
            this.showMessage = (!(oldState === undefined && data.isConnected) && oldState !== this.networkState);
            if (autoHide && this.showMessage) {
                setTimeout(() => {
                    this.showMessage = false;
                    $appDigest();
                }, 5000);
            }
        });
    }
    connect() {
        this.networkService.connect();
    }
    hideMessage() {
        this.showMessage = false;
    }
    ngOnDestroy() {
        this._listenerDestroyer();
        super.ngOnDestroy();
    }
}
NetworkInfoToasterComponent.initializeProps = registerProps();
NetworkInfoToasterComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmNetworkInfoToaster]',
                template: "<div class=\"network-info-toaster-content\" [ngSwitch]=\"networkState\" *ngIf=\"showMessage\">\n    <div class=\"info\" *ngSwitchCase=\"-3\">\n       <label class=\"message\" [textContent]=\"appLocale.MESSAGE_NETWORK_NOT_AVAILABLE\"></label>\n       <button class=\"btn btn-default hide-btn\" (click)=\"hideMessage()\" [textContent]=\"appLocale.LABEL_HIDE_NETWORK_INFO\"></button>\n    </div>\n    <div class=\"info\" *ngSwitchCase=\"-2\">\n       <label class=\"message\" [textContent]=\"appLocale.MESSAGE_SERVICE_NOT_AVAILABLE\"></label>\n       <button class=\"btn btn-default hide-btn\" (click)=\"hideMessage()\" [textContent]=\"appLocale.LABEL_HIDE_NETWORK_INFO\"></button>\n    </div>\n    <div class=\"info\" *ngSwitchCase=\"-1\">\n       <label class=\"message\" [textContent]=\"appLocale.MESSAGE_SERVICE_AVAILABLE\"></label>\n       <button class=\"btn btn-default hide-btn\" (click)=\"hideMessage()\" [textContent]=\"appLocale.LABEL_HIDE_NETWORK_INFO\"></button>\n       <button class=\"btn btn-primary connect-btn\" (click)=\"connect()\" [textContent]=\"appLocale.LABEL_CONNECT_TO_SERVICE\"></button>\n    </div>\n    <div class=\"info\" *ngSwitchCase=\"0\">\n       <label class=\"message\" [textContent]=\"appLocale.MESSAGE_SERVICE_CONNECTING\"></label>\n    </div>\n    <div class=\"info\" *ngSwitchCase=\"1\">\n       <label class=\"message\" [textContent]=\"appLocale.MESSAGE_SERVICE_CONNECTED\"></label>\n    </div>\n</div>",
                providers: [
                    provideAsWidgetRef(NetworkInfoToasterComponent)
                ]
            }] }
];
/** @nocollapse */
NetworkInfoToasterComponent.ctorParameters = () => [
    { type: NetworkService },
    { type: App },
    { type: Injector }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29yay1pbmZvLXRvYXN0ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9uZXR3b3JrLWluZm8tdG9hc3Rlci9uZXR3b3JrLWluZm8tdG9hc3Rlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQWEsTUFBTSxlQUFlLENBQUM7QUFFL0QsT0FBTyxFQUFpQixrQkFBa0IsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU5RixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDM0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRWpELE1BQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDO0FBQzNDLE1BQU0sYUFBYSxHQUFrQixFQUFDLFVBQVUsRUFBRSx5QkFBeUIsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFFckcsTUFBTSxDQUFOLElBQVksWUFNWDtBQU5ELFdBQVksWUFBWTtJQUNwQix5REFBYSxDQUFBO0lBQ2IsMkRBQWMsQ0FBQTtJQUNkLDhHQUF3QyxDQUFBO0lBQ3hDLDRIQUErQyxDQUFBO0lBQy9DLGdGQUF5QixDQUFBO0FBQzdCLENBQUMsRUFOVyxZQUFZLEtBQVosWUFBWSxRQU12QjtBQVVELE1BQU0sT0FBTywyQkFBNEIsU0FBUSxpQkFBaUI7SUFVOUQsWUFBb0IsY0FBOEIsRUFBRSxHQUFRLEVBQUUsR0FBYTtRQUN2RSxLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRFYsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBUDNDLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLHVCQUFrQixHQUFHLEtBQUssQ0FBQztRQUMzQix1QkFBa0IsR0FBRyxLQUFLLENBQUM7UUFPOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLGtCQUFrQixHQUFhLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdEUsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDNUQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNyRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ25DLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztZQUNyQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQztnQkFDM0MsUUFBUSxHQUFHLElBQUksQ0FBQzthQUNuQjtpQkFBTSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQzthQUMvQztpQkFBTSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsbUNBQW1DLENBQUM7YUFDeEU7aUJBQU0sSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzVELElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLDBDQUEwQyxDQUFDO2FBQy9FO2lCQUFNO2dCQUNILElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLG9CQUFvQixDQUFDO2FBQ3pEO1lBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSyxRQUFRLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3RHLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQzlCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQ1osSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7b0JBQ3pCLFVBQVUsRUFBRSxDQUFDO2dCQUNqQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDWjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLE9BQU87UUFDVixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFTSxXQUFXO1FBQ2QsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQUVNLFdBQVc7UUFDZCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMxQixLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDeEIsQ0FBQzs7QUFsRE0sMkNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFSNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSx3QkFBd0I7Z0JBQ2xDLDQ2Q0FBb0Q7Z0JBQ3BELFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQywyQkFBMkIsQ0FBQztpQkFDbEQ7YUFDSjs7OztZQXBCUSxjQUFjO1lBREYsR0FBRztZQUxKLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEluamVjdG9yLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgSVdpZGdldENvbmZpZywgcHJvdmlkZUFzV2lkZ2V0UmVmLCBTdHlsYWJsZUNvbXBvbmVudCwgc3R5bGVyIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9uZXR3b3JrLWluZm8tdG9hc3Rlci5wcm9wcyc7XG5pbXBvcnQgeyAkYXBwRGlnZXN0LCBBcHAgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBOZXR3b3JrU2VydmljZSB9IGZyb20gJ0B3bS9tb2JpbGUvY29yZSc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ25ldHdvcmstaW5mby10b2FzdGVyJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7d2lkZ2V0VHlwZTogJ3dtLW5ldHdvcmstaW5mby10b2FzdGVyJywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbmV4cG9ydCBlbnVtIE5ldHdvcmtTdGF0ZSB7XG4gICAgQ09OTkVDVEVEID0gMSxcbiAgICBDT05ORUNUSU5HID0gMCxcbiAgICBTRVJWSUNFX0FWQUlMQUJMRV9CVVRfTk9UX0NPTk5FQ1RFRCA9IC0xLFxuICAgIE5FVFdPUktfQVZBSUFCTEVfQlVUX1NFUlZJQ0VfTk9UX0FWQUlMQUJMRSA9IC0yLFxuICAgIE5FVFdPUktfTk9UX0FWQUlBQkxFID0gLTNcbn1cblxuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bU5ldHdvcmtJbmZvVG9hc3Rlcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9uZXR3b3JrLWluZm8tdG9hc3Rlci5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihOZXR3b3JrSW5mb1RvYXN0ZXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBOZXR3b3JrSW5mb1RvYXN0ZXJDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBzaG93TWVzc2FnZSA9IGZhbHNlO1xuICAgIHB1YmxpYyBpc1NlcnZpY2VDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICBwdWJsaWMgaXNTZXJ2aWNlQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgcHVibGljIG5ldHdvcmtTdGF0ZTogTmV0d29ya1N0YXRlO1xuXG4gICAgcHJpdmF0ZSBfbGlzdGVuZXJEZXN0cm95ZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5ldHdvcmtTZXJ2aWNlOiBOZXR3b3JrU2VydmljZSwgYXBwOiBBcHAsIGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMuJGVsZW1lbnQsIHRoaXMpO1xuICAgICAgICB0aGlzLmlzU2VydmljZUF2YWlsYWJsZSA9IDxib29sZWFuPiB0aGlzLm5ldHdvcmtTZXJ2aWNlLmlzQXZhaWxhYmxlKCk7XG4gICAgICAgIHRoaXMuaXNTZXJ2aWNlQ29ubmVjdGVkID0gdGhpcy5uZXR3b3JrU2VydmljZS5pc0Nvbm5lY3RlZCgpO1xuICAgICAgICB0aGlzLl9saXN0ZW5lckRlc3Ryb3llciA9IGFwcC5zdWJzY3JpYmUoJ29uTmV0d29ya1N0YXRlQ2hhbmdlJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9sZFN0YXRlID0gdGhpcy5uZXR3b3JrU3RhdGU7XG4gICAgICAgICAgICBsZXQgYXV0b0hpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChkYXRhLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXR3b3JrU3RhdGUgPSBOZXR3b3JrU3RhdGUuQ09OTkVDVEVEO1xuICAgICAgICAgICAgICAgIGF1dG9IaWRlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS5pc0Nvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5ldHdvcmtTdGF0ZSA9IE5ldHdvcmtTdGF0ZS5DT05ORUNUSU5HO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRhLmlzU2VydmljZUF2YWlsYWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubmV0d29ya1N0YXRlID0gTmV0d29ya1N0YXRlLlNFUlZJQ0VfQVZBSUxBQkxFX0JVVF9OT1RfQ09OTkVDVEVEO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRhLmlzTmV0d29ya0F2YWlsYWJsZSAmJiAhZGF0YS5pc1NlcnZpY2VBdmFpbGFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5ldHdvcmtTdGF0ZSA9IE5ldHdvcmtTdGF0ZS5ORVRXT1JLX0FWQUlBQkxFX0JVVF9TRVJWSUNFX05PVF9BVkFJTEFCTEU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubmV0d29ya1N0YXRlID0gTmV0d29ya1N0YXRlLk5FVFdPUktfTk9UX0FWQUlBQkxFO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zaG93TWVzc2FnZSA9ICghKG9sZFN0YXRlID09PSB1bmRlZmluZWQgJiYgZGF0YS5pc0Nvbm5lY3RlZCkgICYmIG9sZFN0YXRlICE9PSB0aGlzLm5ldHdvcmtTdGF0ZSk7XG4gICAgICAgICAgICBpZiAoYXV0b0hpZGUgJiYgdGhpcy5zaG93TWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dNZXNzYWdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbm5lY3QoKSB7XG4gICAgICAgIHRoaXMubmV0d29ya1NlcnZpY2UuY29ubmVjdCgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBoaWRlTWVzc2FnZSgpIHtcbiAgICAgICAgdGhpcy5zaG93TWVzc2FnZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJEZXN0cm95ZXIoKTtcbiAgICAgICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB9XG59XG4iXX0=