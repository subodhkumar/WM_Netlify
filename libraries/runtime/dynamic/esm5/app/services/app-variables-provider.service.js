import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { AppVariablesProvider } from '@wm/runtime/base';
import { AppResourceManagerService } from './app-resource-manager.service';
import * as i0 from "@angular/core";
import * as i1 from "./app-resource-manager.service";
var AppVariablesProviderService = /** @class */ (function (_super) {
    tslib_1.__extends(AppVariablesProviderService, _super);
    function AppVariablesProviderService(resourceManager) {
        var _this = _super.call(this) || this;
        _this.resourceManager = resourceManager;
        return _this;
    }
    AppVariablesProviderService.prototype.getAppVariables = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.resourceManager.get('./app.variables.json')];
            });
        });
    };
    AppVariablesProviderService.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] }
    ];
    /** @nocollapse */
    AppVariablesProviderService.ctorParameters = function () { return [
        { type: AppResourceManagerService }
    ]; };
    AppVariablesProviderService.ngInjectableDef = i0.defineInjectable({ factory: function AppVariablesProviderService_Factory() { return new AppVariablesProviderService(i0.inject(i1.AppResourceManagerService)); }, token: AppVariablesProviderService, providedIn: "root" });
    return AppVariablesProviderService;
}(AppVariablesProvider));
export { AppVariablesProviderService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXZhcmlhYmxlcy1wcm92aWRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvZHluYW1pYy8iLCJzb3VyY2VzIjpbImFwcC9zZXJ2aWNlcy9hcHAtdmFyaWFibGVzLXByb3ZpZGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDeEQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7OztBQUUzRTtJQUdpRCx1REFBb0I7SUFDakUscUNBQW9CLGVBQTBDO1FBQTlELFlBQ0ksaUJBQU8sU0FDVjtRQUZtQixxQkFBZSxHQUFmLGVBQWUsQ0FBMkI7O0lBRTlELENBQUM7SUFFWSxxREFBZSxHQUE1Qjs7O2dCQUNJLHNCQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLEVBQUM7OztLQUMzRDs7Z0JBVkosVUFBVSxTQUFDO29CQUNSLFVBQVUsRUFBRSxNQUFNO2lCQUNyQjs7OztnQkFKUSx5QkFBeUI7OztzQ0FGbEM7Q0FlQyxBQVhELENBR2lELG9CQUFvQixHQVFwRTtTQVJZLDJCQUEyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFwcFZhcmlhYmxlc1Byb3ZpZGVyIH0gZnJvbSAnQHdtL3J1bnRpbWUvYmFzZSc7XG5pbXBvcnQgeyBBcHBSZXNvdXJjZU1hbmFnZXJTZXJ2aWNlIH0gZnJvbSAnLi9hcHAtcmVzb3VyY2UtbWFuYWdlci5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoe1xuICAgIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBBcHBWYXJpYWJsZXNQcm92aWRlclNlcnZpY2UgZXh0ZW5kcyBBcHBWYXJpYWJsZXNQcm92aWRlciB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByZXNvdXJjZU1hbmFnZXI6IEFwcFJlc291cmNlTWFuYWdlclNlcnZpY2UpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZ2V0QXBwVmFyaWFibGVzKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc291cmNlTWFuYWdlci5nZXQoJy4vYXBwLnZhcmlhYmxlcy5qc29uJyk7XG4gICAgfVxufVxuIl19