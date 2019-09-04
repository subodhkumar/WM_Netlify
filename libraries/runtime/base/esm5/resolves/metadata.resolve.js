import { Injectable } from '@angular/core';
import { AppManagerService } from '../services/app.manager.service';
import * as i0 from "@angular/core";
import * as i1 from "../services/app.manager.service";
var metadataResolved = false;
var MetadataResolve = /** @class */ (function () {
    function MetadataResolve(appManager) {
        this.appManager = appManager;
    }
    MetadataResolve.prototype.resolve = function () {
        return metadataResolved || this.appManager.loadMetadata().then(function () { return metadataResolved = true; });
    };
    MetadataResolve.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] }
    ];
    /** @nocollapse */
    MetadataResolve.ctorParameters = function () { return [
        { type: AppManagerService }
    ]; };
    MetadataResolve.ngInjectableDef = i0.defineInjectable({ factory: function MetadataResolve_Factory() { return new MetadataResolve(i0.inject(i1.AppManagerService)); }, token: MetadataResolve, providedIn: "root" });
    return MetadataResolve;
}());
export { MetadataResolve };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEucmVzb2x2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJyZXNvbHZlcy9tZXRhZGF0YS5yZXNvbHZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHM0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7OztBQUVwRSxJQUFJLGdCQUFnQixHQUFHLEtBQUssQ0FBQztBQUU3QjtJQUlJLHlCQUFvQixVQUE2QjtRQUE3QixlQUFVLEdBQVYsVUFBVSxDQUFtQjtJQUFHLENBQUM7SUFFckQsaUNBQU8sR0FBUDtRQUNJLE9BQU8sZ0JBQWdCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBTSxPQUFBLGdCQUFnQixHQUFHLElBQUksRUFBdkIsQ0FBdUIsQ0FBQyxDQUFDO0lBQ2xHLENBQUM7O2dCQVJKLFVBQVUsU0FBQztvQkFDUixVQUFVLEVBQUUsTUFBTTtpQkFDckI7Ozs7Z0JBTlEsaUJBQWlCOzs7MEJBSDFCO0NBZ0JDLEFBVEQsSUFTQztTQU5ZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSZXNvbHZlIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgQXBwTWFuYWdlclNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9hcHAubWFuYWdlci5zZXJ2aWNlJztcblxubGV0IG1ldGFkYXRhUmVzb2x2ZWQgPSBmYWxzZTtcblxuQEluamVjdGFibGUoe1xuICAgIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBNZXRhZGF0YVJlc29sdmUgaW1wbGVtZW50cyBSZXNvbHZlPGFueT4ge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgYXBwTWFuYWdlcjogQXBwTWFuYWdlclNlcnZpY2UpIHt9XG5cbiAgICByZXNvbHZlKCkge1xuICAgICAgICByZXR1cm4gbWV0YWRhdGFSZXNvbHZlZCB8fCB0aGlzLmFwcE1hbmFnZXIubG9hZE1ldGFkYXRhKCkudGhlbigoKSA9PiBtZXRhZGF0YVJlc29sdmVkID0gdHJ1ZSk7XG4gICAgfVxufVxuIl19