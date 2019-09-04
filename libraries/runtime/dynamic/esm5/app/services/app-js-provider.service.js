import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppJSProvider } from '@wm/runtime/base';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
var AppJSProviderService = /** @class */ (function (_super) {
    tslib_1.__extends(AppJSProviderService, _super);
    function AppJSProviderService($http) {
        var _this = _super.call(this) || this;
        _this.$http = $http;
        return _this;
    }
    AppJSProviderService.prototype.getAppScriptFn = function () {
        return this.$http.get('./app.js', { responseType: 'text' })
            .toPromise()
            .then(function (script) { return new Function('App', 'Utils', 'Injector', script); });
    };
    AppJSProviderService.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] }
    ];
    /** @nocollapse */
    AppJSProviderService.ctorParameters = function () { return [
        { type: HttpClient }
    ]; };
    AppJSProviderService.ngInjectableDef = i0.defineInjectable({ factory: function AppJSProviderService_Factory() { return new AppJSProviderService(i0.inject(i1.HttpClient)); }, token: AppJSProviderService, providedIn: "root" });
    return AppJSProviderService;
}(AppJSProvider));
export { AppJSProviderService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWpzLXByb3ZpZGVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vcnVudGltZS9keW5hbWljLyIsInNvdXJjZXMiOlsiYXBwL3NlcnZpY2VzL2FwcC1qcy1wcm92aWRlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUVsRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7OztBQUVqRDtJQUcwQyxnREFBYTtJQUNuRCw4QkFBb0IsS0FBaUI7UUFBckMsWUFDSSxpQkFBTyxTQUNWO1FBRm1CLFdBQUssR0FBTCxLQUFLLENBQVk7O0lBRXJDLENBQUM7SUFFTSw2Q0FBYyxHQUFyQjtRQUNJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUMsWUFBWSxFQUFFLE1BQU0sRUFBQyxDQUFDO2FBQ3BELFNBQVMsRUFBRTthQUNYLElBQUksQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxFQUFoRCxDQUFnRCxDQUFDLENBQUM7SUFDMUUsQ0FBQzs7Z0JBWkosVUFBVSxTQUFDO29CQUNSLFVBQVUsRUFBRSxNQUFNO2lCQUNyQjs7OztnQkFOUSxVQUFVOzs7K0JBRG5CO0NBa0JDLEFBYkQsQ0FHMEMsYUFBYSxHQVV0RDtTQVZZLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IEFwcEpTUHJvdmlkZXIgfSBmcm9tICdAd20vcnVudGltZS9iYXNlJztcblxuQEluamVjdGFibGUoe1xuICAgIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBBcHBKU1Byb3ZpZGVyU2VydmljZSBleHRlbmRzIEFwcEpTUHJvdmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGh0dHA6IEh0dHBDbGllbnQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0QXBwU2NyaXB0Rm4oKTogUHJvbWlzZTxGdW5jdGlvbj4ge1xuICAgICAgICByZXR1cm4gdGhpcy4kaHR0cC5nZXQoJy4vYXBwLmpzJywge3Jlc3BvbnNlVHlwZTogJ3RleHQnfSlcbiAgICAgICAgICAgIC50b1Byb21pc2UoKVxuICAgICAgICAgICAgLnRoZW4oc2NyaXB0ID0+IG5ldyBGdW5jdGlvbignQXBwJywgJ1V0aWxzJywgJ0luamVjdG9yJywgc2NyaXB0KSk7XG4gICAgfVxufVxuIl19