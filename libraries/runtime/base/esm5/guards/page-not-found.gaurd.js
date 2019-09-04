import { Injectable } from '@angular/core';
import { App } from '@wm/core';
import { AppManagerService } from '../services/app.manager.service';
var PageNotFoundGaurd = /** @class */ (function () {
    function PageNotFoundGaurd(app, appManager) {
        this.app = app;
        this.appManager = appManager;
    }
    PageNotFoundGaurd.prototype.canActivate = function (route) {
        this.appManager.notifyApp(this.app.appLocale.MESSAGE_PAGE_NOT_FOUND || 'The page you are trying to reach is not available', 'error');
        return Promise.resolve(false);
    };
    PageNotFoundGaurd.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    PageNotFoundGaurd.ctorParameters = function () { return [
        { type: App },
        { type: AppManagerService }
    ]; };
    return PageNotFoundGaurd;
}());
export { PageNotFoundGaurd };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS1ub3QtZm91bmQuZ2F1cmQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vcnVudGltZS9iYXNlLyIsInNvdXJjZXMiOlsiZ3VhcmRzL3BhZ2Utbm90LWZvdW5kLmdhdXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHM0MsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUMvQixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUlwRTtJQUdJLDJCQUNZLEdBQVEsRUFDUixVQUE2QjtRQUQ3QixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ1IsZUFBVSxHQUFWLFVBQVUsQ0FBbUI7SUFDdEMsQ0FBQztJQUVKLHVDQUFXLEdBQVgsVUFBWSxLQUE2QjtRQUNyQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLElBQUksbURBQW1ELEVBQ2hHLE9BQU8sQ0FDVixDQUFDO1FBQ0YsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7O2dCQWRKLFVBQVU7Ozs7Z0JBTEYsR0FBRztnQkFDSCxpQkFBaUI7O0lBbUIxQix3QkFBQztDQUFBLEFBZkQsSUFlQztTQWRZLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIENhbkFjdGl2YXRlIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgQXBwIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgQXBwTWFuYWdlclNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9hcHAubWFuYWdlci5zZXJ2aWNlJztcblxuZGVjbGFyZSBjb25zdCBfOiBhbnk7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQYWdlTm90Rm91bmRHYXVyZCBpbXBsZW1lbnRzIENhbkFjdGl2YXRlIHtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBwcml2YXRlIGFwcE1hbmFnZXI6IEFwcE1hbmFnZXJTZXJ2aWNlXG4gICAgKSB7fVxuXG4gICAgY2FuQWN0aXZhdGUocm91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgdGhpcy5hcHBNYW5hZ2VyLm5vdGlmeUFwcChcbiAgICAgICAgICAgIHRoaXMuYXBwLmFwcExvY2FsZS5NRVNTQUdFX1BBR0VfTk9UX0ZPVU5EIHx8ICdUaGUgcGFnZSB5b3UgYXJlIHRyeWluZyB0byByZWFjaCBpcyBub3QgYXZhaWxhYmxlJyxcbiAgICAgICAgICAgICdlcnJvcidcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gICAgfVxufVxuIl19