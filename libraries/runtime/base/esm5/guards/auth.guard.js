import { Injectable } from '@angular/core';
import { SecurityService } from '@wm/security';
import { AppManagerService } from '../services/app.manager.service';
var securityConfigLoaded = false;
var AuthGuard = /** @class */ (function () {
    function AuthGuard(securityService, appManager) {
        this.securityService = securityService;
        this.appManager = appManager;
    }
    AuthGuard.prototype.loadSecurityConfig = function () {
        if (securityConfigLoaded) {
            return Promise.resolve(true);
        }
        return this.appManager.loadSecurityConfig().then(function () { return securityConfigLoaded = true; });
    };
    AuthGuard.prototype.isAuthenticated = function () {
        var _this = this;
        return this.loadSecurityConfig()
            .then(function () {
            return new Promise(function (resolve, reject) {
                _this.securityService.isAuthenticated(resolve, reject);
            });
        });
    };
    AuthGuard.prototype.canActivate = function (route) {
        var _this = this;
        return this.isAuthenticated()
            .then(function (isLoggedIn) {
            if (isLoggedIn) {
                return Promise.resolve(true);
            }
            _this.appManager.handle401(route.routeConfig.path);
            return Promise.resolve(false);
        });
    };
    AuthGuard.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    AuthGuard.ctorParameters = function () { return [
        { type: SecurityService },
        { type: AppManagerService }
    ]; };
    return AuthGuard;
}());
export { AuthGuard };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5ndWFyZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJndWFyZHMvYXV0aC5ndWFyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFL0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFcEUsSUFBSSxvQkFBb0IsR0FBRyxLQUFLLENBQUM7QUFFakM7SUFHSSxtQkFBb0IsZUFBZ0MsRUFBVSxVQUE2QjtRQUF2RSxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFBVSxlQUFVLEdBQVYsVUFBVSxDQUFtQjtJQUFHLENBQUM7SUFFL0Ysc0NBQWtCLEdBQWxCO1FBQ0ksSUFBSSxvQkFBb0IsRUFBRTtZQUN0QixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDaEM7UUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBTSxPQUFBLG9CQUFvQixHQUFHLElBQUksRUFBM0IsQ0FBMkIsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFFRCxtQ0FBZSxHQUFmO1FBQUEsaUJBT0M7UUFORyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsRUFBRTthQUMzQixJQUFJLENBQUM7WUFDRixPQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07Z0JBQy9CLEtBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMxRCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVELCtCQUFXLEdBQVgsVUFBWSxLQUE2QjtRQUF6QyxpQkFXQztRQVZHLE9BQU8sSUFBSSxDQUFDLGVBQWUsRUFBRTthQUN4QixJQUFJLENBQUMsVUFBQSxVQUFVO1lBQ1osSUFBSSxVQUFVLEVBQUU7Z0JBQ1osT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hDO1lBRUQsS0FBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVsRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDOztnQkFqQ0osVUFBVTs7OztnQkFORixlQUFlO2dCQUVmLGlCQUFpQjs7SUFzQzFCLGdCQUFDO0NBQUEsQUFsQ0QsSUFrQ0M7U0FqQ1ksU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIENhbkFjdGl2YXRlIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgU2VjdXJpdHlTZXJ2aWNlIH0gZnJvbSAnQHdtL3NlY3VyaXR5JztcblxuaW1wb3J0IHsgQXBwTWFuYWdlclNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9hcHAubWFuYWdlci5zZXJ2aWNlJztcblxubGV0IHNlY3VyaXR5Q29uZmlnTG9hZGVkID0gZmFsc2U7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBdXRoR3VhcmQgaW1wbGVtZW50cyBDYW5BY3RpdmF0ZSB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNlY3VyaXR5U2VydmljZTogU2VjdXJpdHlTZXJ2aWNlLCBwcml2YXRlIGFwcE1hbmFnZXI6IEFwcE1hbmFnZXJTZXJ2aWNlKSB7fVxuXG4gICAgbG9hZFNlY3VyaXR5Q29uZmlnKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBpZiAoc2VjdXJpdHlDb25maWdMb2FkZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5hcHBNYW5hZ2VyLmxvYWRTZWN1cml0eUNvbmZpZygpLnRoZW4oKCkgPT4gc2VjdXJpdHlDb25maWdMb2FkZWQgPSB0cnVlKTtcbiAgICB9XG5cbiAgICBpc0F1dGhlbnRpY2F0ZWQoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9hZFNlY3VyaXR5Q29uZmlnKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlY3VyaXR5U2VydmljZS5pc0F1dGhlbnRpY2F0ZWQocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNhbkFjdGl2YXRlKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNBdXRoZW50aWNhdGVkKClcbiAgICAgICAgICAgIC50aGVuKGlzTG9nZ2VkSW4gPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpc0xvZ2dlZEluKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBNYW5hZ2VyLmhhbmRsZTQwMShyb3V0ZS5yb3V0ZUNvbmZpZy5wYXRoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuIl19