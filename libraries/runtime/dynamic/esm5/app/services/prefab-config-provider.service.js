import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { getPrefabConfigUrl, PrefabConfigProvider } from '@wm/runtime/base';
import { AppResourceManagerService } from './app-resource-manager.service';
var cache = new Map();
var PrefabConfigProviderService = /** @class */ (function (_super) {
    tslib_1.__extends(PrefabConfigProviderService, _super);
    function PrefabConfigProviderService(resourceMngr) {
        var _this = _super.call(this) || this;
        _this.resourceMngr = resourceMngr;
        return _this;
    }
    PrefabConfigProviderService.prototype.getConfig = function (prefabName) {
        var config = cache.get(prefabName);
        if (config) {
            return Promise.resolve(config);
        }
        return this.resourceMngr.get(getPrefabConfigUrl(prefabName))
            .then(function (_config) {
            cache.set(prefabName, _config);
            return _config;
        });
    };
    PrefabConfigProviderService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    PrefabConfigProviderService.ctorParameters = function () { return [
        { type: AppResourceManagerService }
    ]; };
    return PrefabConfigProviderService;
}(PrefabConfigProvider));
export { PrefabConfigProviderService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLWNvbmZpZy1wcm92aWRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvZHluYW1pYy8iLCJzb3VyY2VzIjpbImFwcC9zZXJ2aWNlcy9wcmVmYWItY29uZmlnLXByb3ZpZGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFNUUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFM0UsSUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWUsQ0FBQztBQUNyQztJQUNpRCx1REFBb0I7SUFFakUscUNBQW9CLFlBQXVDO1FBQTNELFlBQ0ksaUJBQU8sU0FDVjtRQUZtQixrQkFBWSxHQUFaLFlBQVksQ0FBMkI7O0lBRTNELENBQUM7SUFFTSwrQ0FBUyxHQUFoQixVQUFpQixVQUFrQjtRQUMvQixJQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JDLElBQUksTUFBTSxFQUFFO1lBQ1IsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2xDO1FBRUQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUN2RCxJQUFJLENBQUMsVUFBQSxPQUFPO1lBQ1QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0IsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDOztnQkFsQkosVUFBVTs7OztnQkFIRix5QkFBeUI7O0lBc0JsQyxrQ0FBQztDQUFBLEFBbkJELENBQ2lELG9CQUFvQixHQWtCcEU7U0FsQlksMkJBQTJCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBnZXRQcmVmYWJDb25maWdVcmwsIFByZWZhYkNvbmZpZ1Byb3ZpZGVyIH0gZnJvbSAnQHdtL3J1bnRpbWUvYmFzZSc7XG5cbmltcG9ydCB7IEFwcFJlc291cmNlTWFuYWdlclNlcnZpY2UgfSBmcm9tICcuL2FwcC1yZXNvdXJjZS1tYW5hZ2VyLnNlcnZpY2UnO1xuXG5jb25zdCBjYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUHJlZmFiQ29uZmlnUHJvdmlkZXJTZXJ2aWNlIGV4dGVuZHMgUHJlZmFiQ29uZmlnUHJvdmlkZXIge1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByZXNvdXJjZU1uZ3I6IEFwcFJlc291cmNlTWFuYWdlclNlcnZpY2UpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q29uZmlnKHByZWZhYk5hbWU6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IGNhY2hlLmdldChwcmVmYWJOYW1lKTtcbiAgICAgICAgaWYgKGNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVzb3VyY2VNbmdyLmdldChnZXRQcmVmYWJDb25maWdVcmwocHJlZmFiTmFtZSkpXG4gICAgICAgICAgICAudGhlbihfY29uZmlnID0+IHtcbiAgICAgICAgICAgICAgICBjYWNoZS5zZXQocHJlZmFiTmFtZSwgX2NvbmZpZyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9jb25maWc7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=