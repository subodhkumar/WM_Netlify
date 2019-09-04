import { Injectable } from '@angular/core';
import { getWmProjectProperties } from '@wm/core';
import { AppManagerService } from '../services/app.manager.service';
import * as i0 from "@angular/core";
import * as i1 from "../services/app.manager.service";
var SecurityConfigResolve = /** @class */ (function () {
    function SecurityConfigResolve(appManager) {
        this.appManager = appManager;
        // if the project type is PREFAB, setting this flag will not trigger security/info call
        this.loaded = this.appManager.isPrefabType() || this.appManager.isTemplateBundleType() || !getWmProjectProperties().securityEnabled;
    }
    SecurityConfigResolve.prototype.resolve = function () {
        var _this = this;
        return this.loaded || this.appManager.loadSecurityConfig().then(function () {
            _this.loaded = true;
        });
    };
    SecurityConfigResolve.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] }
    ];
    /** @nocollapse */
    SecurityConfigResolve.ctorParameters = function () { return [
        { type: AppManagerService }
    ]; };
    SecurityConfigResolve.ngInjectableDef = i0.defineInjectable({ factory: function SecurityConfigResolve_Factory() { return new SecurityConfigResolve(i0.inject(i1.AppManagerService)); }, token: SecurityConfigResolve, providedIn: "root" });
    return SecurityConfigResolve;
}());
export { SecurityConfigResolve };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHktY29uZmlnLnJlc29sdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vcnVudGltZS9iYXNlLyIsInNvdXJjZXMiOlsicmVzb2x2ZXMvc2VjdXJpdHktY29uZmlnLnJlc29sdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUczQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7OztBQUVwRTtJQU1JLCtCQUFvQixVQUE2QjtRQUE3QixlQUFVLEdBQVYsVUFBVSxDQUFtQjtRQUU3Qyx1RkFBdUY7UUFDdkYsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsZUFBZSxDQUFDO0lBQ3hJLENBQUM7SUFFRCx1Q0FBTyxHQUFQO1FBQUEsaUJBSUM7UUFIRyxPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQztZQUM1RCxLQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7O2dCQWhCSixVQUFVLFNBQUM7b0JBQ1IsVUFBVSxFQUFFLE1BQU07aUJBQ3JCOzs7O2dCQUpRLGlCQUFpQjs7O2dDQUwxQjtDQXdCQyxBQWpCRCxJQWlCQztTQWRZLHFCQUFxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJlc29sdmUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBnZXRXbVByb2plY3RQcm9wZXJ0aWVzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBcHBNYW5hZ2VyU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL2FwcC5tYW5hZ2VyLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSh7XG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFNlY3VyaXR5Q29uZmlnUmVzb2x2ZSBpbXBsZW1lbnRzIFJlc29sdmU8YW55PiB7XG4gICAgbG9hZGVkOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBhcHBNYW5hZ2VyOiBBcHBNYW5hZ2VyU2VydmljZSkge1xuXG4gICAgICAgIC8vIGlmIHRoZSBwcm9qZWN0IHR5cGUgaXMgUFJFRkFCLCBzZXR0aW5nIHRoaXMgZmxhZyB3aWxsIG5vdCB0cmlnZ2VyIHNlY3VyaXR5L2luZm8gY2FsbFxuICAgICAgICB0aGlzLmxvYWRlZCA9IHRoaXMuYXBwTWFuYWdlci5pc1ByZWZhYlR5cGUoKSB8fCB0aGlzLmFwcE1hbmFnZXIuaXNUZW1wbGF0ZUJ1bmRsZVR5cGUoKSB8fCAhZ2V0V21Qcm9qZWN0UHJvcGVydGllcygpLnNlY3VyaXR5RW5hYmxlZDtcbiAgICB9XG5cbiAgICByZXNvbHZlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2FkZWQgfHwgdGhpcy5hcHBNYW5hZ2VyLmxvYWRTZWN1cml0eUNvbmZpZygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=