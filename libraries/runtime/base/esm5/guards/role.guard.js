import { Injectable } from '@angular/core';
import { AbstractToasterService, App } from '@wm/core';
import { SecurityService } from '@wm/security';
import { AuthGuard } from './auth.guard';
import { AppManagerService } from '../services/app.manager.service';
var RoleGuard = /** @class */ (function () {
    function RoleGuard(securityService, authGuard, toasterService, app, appManager) {
        this.securityService = securityService;
        this.authGuard = authGuard;
        this.toasterService = toasterService;
        this.app = app;
        this.appManager = appManager;
    }
    RoleGuard.prototype.canActivate = function (route) {
        var _this = this;
        var allowedRoles = route.data.allowedRoles;
        return this.authGuard.isAuthenticated()
            .then(function (isLoggedIn) {
            if (isLoggedIn) {
                var userRoles = _this.securityService.get().userInfo.userRoles;
                var hasAccess = _.intersection(allowedRoles, userRoles).length > 0;
                if (hasAccess) {
                    return Promise.resolve(true);
                }
                // current loggedin user doesn't have access to the page that the user is trying to view
                _this.appManager.notifyApp(_this.app.appLocale.LABEL_ACCESS_DENIED || 'Access Denied', 'error');
                return Promise.resolve(false);
            }
            else {
                // redirect to Login
                _this.appManager.handle401(route.routeConfig.path);
                return Promise.resolve(false);
            }
        });
    };
    RoleGuard.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    RoleGuard.ctorParameters = function () { return [
        { type: SecurityService },
        { type: AuthGuard },
        { type: AbstractToasterService },
        { type: App },
        { type: AppManagerService }
    ]; };
    return RoleGuard;
}());
export { RoleGuard };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZS5ndWFyZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJndWFyZHMvcm9sZS5ndWFyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzNDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxHQUFHLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDdkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUUvQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBSXBFO0lBR0ksbUJBQ1ksZUFBZ0MsRUFDaEMsU0FBb0IsRUFDcEIsY0FBc0MsRUFDdEMsR0FBUSxFQUNSLFVBQTZCO1FBSjdCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQyxjQUFTLEdBQVQsU0FBUyxDQUFXO1FBQ3BCLG1CQUFjLEdBQWQsY0FBYyxDQUF3QjtRQUN0QyxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ1IsZUFBVSxHQUFWLFVBQVUsQ0FBbUI7SUFDdEMsQ0FBQztJQUVKLCtCQUFXLEdBQVgsVUFBWSxLQUE2QjtRQUF6QyxpQkE0QkM7UUEzQkcsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7UUFFN0MsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRTthQUNsQyxJQUFJLENBQUMsVUFBQyxVQUFtQjtZQUN0QixJQUFJLFVBQVUsRUFBRTtnQkFDWixJQUFNLFNBQVMsR0FBRyxLQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7Z0JBQ2hFLElBQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBRXJFLElBQUksU0FBUyxFQUFFO29CQUNYLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDaEM7Z0JBRUQsd0ZBQXdGO2dCQUN4RixLQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FDckIsS0FBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLElBQUksZUFBZSxFQUN6RCxPQUFPLENBQ1YsQ0FBQztnQkFFRixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFFakM7aUJBQU07Z0JBQ0gsb0JBQW9CO2dCQUNwQixLQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVsRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDakM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7O2dCQXZDSixVQUFVOzs7O2dCQVBGLGVBQWU7Z0JBRWYsU0FBUztnQkFIVCxzQkFBc0I7Z0JBQUUsR0FBRztnQkFJM0IsaUJBQWlCOztJQTRDMUIsZ0JBQUM7Q0FBQSxBQXhDRCxJQXdDQztTQXZDWSxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgQ2FuQWN0aXZhdGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBBYnN0cmFjdFRvYXN0ZXJTZXJ2aWNlLCBBcHAgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBTZWN1cml0eVNlcnZpY2UgfSBmcm9tICdAd20vc2VjdXJpdHknO1xuXG5pbXBvcnQgeyBBdXRoR3VhcmQgfSBmcm9tICcuL2F1dGguZ3VhcmQnO1xuaW1wb3J0IHsgQXBwTWFuYWdlclNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9hcHAubWFuYWdlci5zZXJ2aWNlJztcblxuZGVjbGFyZSBjb25zdCBfOiBhbnk7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb2xlR3VhcmQgaW1wbGVtZW50cyBDYW5BY3RpdmF0ZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBzZWN1cml0eVNlcnZpY2U6IFNlY3VyaXR5U2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBhdXRoR3VhcmQ6IEF1dGhHdWFyZCxcbiAgICAgICAgcHJpdmF0ZSB0b2FzdGVyU2VydmljZTogQWJzdHJhY3RUb2FzdGVyU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBhcHA6IEFwcCxcbiAgICAgICAgcHJpdmF0ZSBhcHBNYW5hZ2VyOiBBcHBNYW5hZ2VyU2VydmljZVxuICAgICkge31cblxuICAgIGNhbkFjdGl2YXRlKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IGFsbG93ZWRSb2xlcyA9IHJvdXRlLmRhdGEuYWxsb3dlZFJvbGVzO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmF1dGhHdWFyZC5pc0F1dGhlbnRpY2F0ZWQoKVxuICAgICAgICAgICAgLnRoZW4oKGlzTG9nZ2VkSW46IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaXNMb2dnZWRJbikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyUm9sZXMgPSB0aGlzLnNlY3VyaXR5U2VydmljZS5nZXQoKS51c2VySW5mby51c2VyUm9sZXM7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc0FjY2VzcyA9IF8uaW50ZXJzZWN0aW9uKGFsbG93ZWRSb2xlcywgdXNlclJvbGVzKS5sZW5ndGggPiAwO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYXNBY2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBjdXJyZW50IGxvZ2dlZGluIHVzZXIgZG9lc24ndCBoYXZlIGFjY2VzcyB0byB0aGUgcGFnZSB0aGF0IHRoZSB1c2VyIGlzIHRyeWluZyB0byB2aWV3XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwTWFuYWdlci5ub3RpZnlBcHAoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcC5hcHBMb2NhbGUuTEFCRUxfQUNDRVNTX0RFTklFRCB8fCAnQWNjZXNzIERlbmllZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZXJyb3InXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyByZWRpcmVjdCB0byBMb2dpblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcE1hbmFnZXIuaGFuZGxlNDAxKHJvdXRlLnJvdXRlQ29uZmlnLnBhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==