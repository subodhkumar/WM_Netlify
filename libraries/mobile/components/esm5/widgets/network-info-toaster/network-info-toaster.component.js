import * as tslib_1 from "tslib";
import { Component, Injector } from '@angular/core';
import { provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { registerProps } from './network-info-toaster.props';
import { $appDigest, App } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
var DEFAULT_CLS = 'network-info-toaster';
var WIDGET_CONFIG = { widgetType: 'wm-network-info-toaster', hostClass: DEFAULT_CLS };
export var NetworkState;
(function (NetworkState) {
    NetworkState[NetworkState["CONNECTED"] = 1] = "CONNECTED";
    NetworkState[NetworkState["CONNECTING"] = 0] = "CONNECTING";
    NetworkState[NetworkState["SERVICE_AVAILABLE_BUT_NOT_CONNECTED"] = -1] = "SERVICE_AVAILABLE_BUT_NOT_CONNECTED";
    NetworkState[NetworkState["NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE"] = -2] = "NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE";
    NetworkState[NetworkState["NETWORK_NOT_AVAIABLE"] = -3] = "NETWORK_NOT_AVAIABLE";
})(NetworkState || (NetworkState = {}));
var NetworkInfoToasterComponent = /** @class */ (function (_super) {
    tslib_1.__extends(NetworkInfoToasterComponent, _super);
    function NetworkInfoToasterComponent(networkService, app, inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.networkService = networkService;
        _this.showMessage = false;
        _this.isServiceConnected = false;
        _this.isServiceAvailable = false;
        styler(_this.$element, _this);
        _this.isServiceAvailable = _this.networkService.isAvailable();
        _this.isServiceConnected = _this.networkService.isConnected();
        _this._listenerDestroyer = app.subscribe('onNetworkStateChange', function (data) {
            var oldState = _this.networkState;
            var autoHide = false;
            if (data.isConnected) {
                _this.networkState = NetworkState.CONNECTED;
                autoHide = true;
            }
            else if (data.isConnecting) {
                _this.networkState = NetworkState.CONNECTING;
            }
            else if (data.isServiceAvailable) {
                _this.networkState = NetworkState.SERVICE_AVAILABLE_BUT_NOT_CONNECTED;
            }
            else if (data.isNetworkAvailable && !data.isServiceAvailable) {
                _this.networkState = NetworkState.NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE;
            }
            else {
                _this.networkState = NetworkState.NETWORK_NOT_AVAIABLE;
            }
            _this.showMessage = (!(oldState === undefined && data.isConnected) && oldState !== _this.networkState);
            if (autoHide && _this.showMessage) {
                setTimeout(function () {
                    _this.showMessage = false;
                    $appDigest();
                }, 5000);
            }
        });
        return _this;
    }
    NetworkInfoToasterComponent.prototype.connect = function () {
        this.networkService.connect();
    };
    NetworkInfoToasterComponent.prototype.hideMessage = function () {
        this.showMessage = false;
    };
    NetworkInfoToasterComponent.prototype.ngOnDestroy = function () {
        this._listenerDestroyer();
        _super.prototype.ngOnDestroy.call(this);
    };
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
    NetworkInfoToasterComponent.ctorParameters = function () { return [
        { type: NetworkService },
        { type: App },
        { type: Injector }
    ]; };
    return NetworkInfoToasterComponent;
}(StylableComponent));
export { NetworkInfoToasterComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29yay1pbmZvLXRvYXN0ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9uZXR3b3JrLWluZm8tdG9hc3Rlci9uZXR3b3JrLWluZm8tdG9hc3Rlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBRS9ELE9BQU8sRUFBaUIsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVqRCxJQUFNLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQztBQUMzQyxJQUFNLGFBQWEsR0FBa0IsRUFBQyxVQUFVLEVBQUUseUJBQXlCLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBRXJHLE1BQU0sQ0FBTixJQUFZLFlBTVg7QUFORCxXQUFZLFlBQVk7SUFDcEIseURBQWEsQ0FBQTtJQUNiLDJEQUFjLENBQUE7SUFDZCw4R0FBd0MsQ0FBQTtJQUN4Qyw0SEFBK0MsQ0FBQTtJQUMvQyxnRkFBeUIsQ0FBQTtBQUM3QixDQUFDLEVBTlcsWUFBWSxLQUFaLFlBQVksUUFNdkI7QUFHRDtJQU9pRCx1REFBaUI7SUFVOUQscUNBQW9CLGNBQThCLEVBQUUsR0FBUSxFQUFFLEdBQWE7UUFBM0UsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBMkI1QjtRQTVCbUIsb0JBQWMsR0FBZCxjQUFjLENBQWdCO1FBUDNDLGlCQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLHdCQUFrQixHQUFHLEtBQUssQ0FBQztRQUMzQix3QkFBa0IsR0FBRyxLQUFLLENBQUM7UUFPOUIsTUFBTSxDQUFDLEtBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSSxDQUFDLENBQUM7UUFDNUIsS0FBSSxDQUFDLGtCQUFrQixHQUFhLEtBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdEUsS0FBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDNUQsS0FBSSxDQUFDLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEVBQUUsVUFBQyxJQUFJO1lBQ2pFLElBQU0sUUFBUSxHQUFHLEtBQUksQ0FBQyxZQUFZLENBQUM7WUFDbkMsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDbEIsS0FBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDO2dCQUMzQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2FBQ25CO2lCQUFNLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDMUIsS0FBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO2FBQy9DO2lCQUFNLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO2dCQUNoQyxLQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxtQ0FBbUMsQ0FBQzthQUN4RTtpQkFBTSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDNUQsS0FBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsMENBQTBDLENBQUM7YUFDL0U7aUJBQU07Z0JBQ0gsS0FBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsb0JBQW9CLENBQUM7YUFDekQ7WUFDRCxLQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFLLFFBQVEsS0FBSyxLQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDdEcsSUFBSSxRQUFRLElBQUksS0FBSSxDQUFDLFdBQVcsRUFBRTtnQkFDOUIsVUFBVSxDQUFDO29CQUNQLEtBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO29CQUN6QixVQUFVLEVBQUUsQ0FBQztnQkFDakIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ1o7UUFDTCxDQUFDLENBQUMsQ0FBQzs7SUFDUCxDQUFDO0lBRU0sNkNBQU8sR0FBZDtRQUNJLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVNLGlEQUFXLEdBQWxCO1FBQ0ksSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQUVNLGlEQUFXLEdBQWxCO1FBQ0ksSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDMUIsaUJBQU0sV0FBVyxXQUFFLENBQUM7SUFDeEIsQ0FBQztJQWxETSwyQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFSNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSx3QkFBd0I7b0JBQ2xDLDQ2Q0FBb0Q7b0JBQ3BELFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQywyQkFBMkIsQ0FBQztxQkFDbEQ7aUJBQ0o7Ozs7Z0JBcEJRLGNBQWM7Z0JBREYsR0FBRztnQkFMSixRQUFROztJQStFNUIsa0NBQUM7Q0FBQSxBQTNERCxDQU9pRCxpQkFBaUIsR0FvRGpFO1NBcERZLDJCQUEyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0b3IsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnLCBwcm92aWRlQXNXaWRnZXRSZWYsIFN0eWxhYmxlQ29tcG9uZW50LCBzdHlsZXIgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5cbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL25ldHdvcmstaW5mby10b2FzdGVyLnByb3BzJztcbmltcG9ydCB7ICRhcHBEaWdlc3QsIEFwcCB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IE5ldHdvcmtTZXJ2aWNlIH0gZnJvbSAnQHdtL21vYmlsZS9jb3JlJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnbmV0d29yay1pbmZvLXRvYXN0ZXInO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHt3aWRnZXRUeXBlOiAnd20tbmV0d29yay1pbmZvLXRvYXN0ZXInLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuZXhwb3J0IGVudW0gTmV0d29ya1N0YXRlIHtcbiAgICBDT05ORUNURUQgPSAxLFxuICAgIENPTk5FQ1RJTkcgPSAwLFxuICAgIFNFUlZJQ0VfQVZBSUxBQkxFX0JVVF9OT1RfQ09OTkVDVEVEID0gLTEsXG4gICAgTkVUV09SS19BVkFJQUJMRV9CVVRfU0VSVklDRV9OT1RfQVZBSUxBQkxFID0gLTIsXG4gICAgTkVUV09SS19OT1RfQVZBSUFCTEUgPSAtM1xufVxuXG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtTmV0d29ya0luZm9Ub2FzdGVyXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL25ldHdvcmstaW5mby10b2FzdGVyLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKE5ldHdvcmtJbmZvVG9hc3RlckNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIE5ldHdvcmtJbmZvVG9hc3RlckNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIHNob3dNZXNzYWdlID0gZmFsc2U7XG4gICAgcHVibGljIGlzU2VydmljZUNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHB1YmxpYyBpc1NlcnZpY2VBdmFpbGFibGUgPSBmYWxzZTtcbiAgICBwdWJsaWMgbmV0d29ya1N0YXRlOiBOZXR3b3JrU3RhdGU7XG5cbiAgICBwcml2YXRlIF9saXN0ZW5lckRlc3Ryb3llcjtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbmV0d29ya1NlcnZpY2U6IE5ldHdvcmtTZXJ2aWNlLCBhcHA6IEFwcCwgaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy4kZWxlbWVudCwgdGhpcyk7XG4gICAgICAgIHRoaXMuaXNTZXJ2aWNlQXZhaWxhYmxlID0gPGJvb2xlYW4+IHRoaXMubmV0d29ya1NlcnZpY2UuaXNBdmFpbGFibGUoKTtcbiAgICAgICAgdGhpcy5pc1NlcnZpY2VDb25uZWN0ZWQgPSB0aGlzLm5ldHdvcmtTZXJ2aWNlLmlzQ29ubmVjdGVkKCk7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVyRGVzdHJveWVyID0gYXBwLnN1YnNjcmliZSgnb25OZXR3b3JrU3RhdGVDaGFuZ2UnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb2xkU3RhdGUgPSB0aGlzLm5ldHdvcmtTdGF0ZTtcbiAgICAgICAgICAgIGxldCBhdXRvSGlkZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGRhdGEuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5ldHdvcmtTdGF0ZSA9IE5ldHdvcmtTdGF0ZS5DT05ORUNURUQ7XG4gICAgICAgICAgICAgICAgYXV0b0hpZGUgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRhLmlzQ29ubmVjdGluZykge1xuICAgICAgICAgICAgICAgIHRoaXMubmV0d29ya1N0YXRlID0gTmV0d29ya1N0YXRlLkNPTk5FQ1RJTkc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEuaXNTZXJ2aWNlQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXR3b3JrU3RhdGUgPSBOZXR3b3JrU3RhdGUuU0VSVklDRV9BVkFJTEFCTEVfQlVUX05PVF9DT05ORUNURUQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEuaXNOZXR3b3JrQXZhaWxhYmxlICYmICFkYXRhLmlzU2VydmljZUF2YWlsYWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubmV0d29ya1N0YXRlID0gTmV0d29ya1N0YXRlLk5FVFdPUktfQVZBSUFCTEVfQlVUX1NFUlZJQ0VfTk9UX0FWQUlMQUJMRTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXR3b3JrU3RhdGUgPSBOZXR3b3JrU3RhdGUuTkVUV09SS19OT1RfQVZBSUFCTEU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNob3dNZXNzYWdlID0gKCEob2xkU3RhdGUgPT09IHVuZGVmaW5lZCAmJiBkYXRhLmlzQ29ubmVjdGVkKSAgJiYgb2xkU3RhdGUgIT09IHRoaXMubmV0d29ya1N0YXRlKTtcbiAgICAgICAgICAgIGlmIChhdXRvSGlkZSAmJiB0aGlzLnNob3dNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd01lc3NhZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgICAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29ubmVjdCgpIHtcbiAgICAgICAgdGhpcy5uZXR3b3JrU2VydmljZS5jb25uZWN0KCk7XG4gICAgfVxuXG4gICAgcHVibGljIGhpZGVNZXNzYWdlKCkge1xuICAgICAgICB0aGlzLnNob3dNZXNzYWdlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCkge1xuICAgICAgICB0aGlzLl9saXN0ZW5lckRlc3Ryb3llcigpO1xuICAgICAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIH1cbn1cbiJdfQ==