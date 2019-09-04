import { Injectable } from '@angular/core';
import { AppManagerService } from '../services/app.manager.service';
import { AppVariablesProvider } from '../types/types';
import * as i0 from "@angular/core";
import * as i1 from "../services/app.manager.service";
import * as i2 from "../types/types";
var appVariablesLoaded = false;
var AppVariablesResolve = /** @class */ (function () {
    function AppVariablesResolve(appManager, appVariablesProvider) {
        this.appManager = appManager;
        this.appVariablesProvider = appVariablesProvider;
    }
    AppVariablesResolve.prototype.resolve = function () {
        var _this = this;
        // execute app.js
        if (appVariablesLoaded) {
            return true;
        }
        return this.appVariablesProvider.getAppVariables()
            .then(function (variables) { return _this.appManager.loadAppVariables(variables); })
            .then(function () { return appVariablesLoaded = true; });
    };
    AppVariablesResolve.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] }
    ];
    /** @nocollapse */
    AppVariablesResolve.ctorParameters = function () { return [
        { type: AppManagerService },
        { type: AppVariablesProvider }
    ]; };
    AppVariablesResolve.ngInjectableDef = i0.defineInjectable({ factory: function AppVariablesResolve_Factory() { return new AppVariablesResolve(i0.inject(i1.AppManagerService), i0.inject(i2.AppVariablesProvider)); }, token: AppVariablesResolve, providedIn: "root" });
    return AppVariablesResolve;
}());
export { AppVariablesResolve };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXZhcmlhYmxlcy5yZXNvbHZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbInJlc29sdmVzL2FwcC12YXJpYWJsZXMucmVzb2x2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzNDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7O0FBRXRELElBQUksa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0FBRS9CO0lBS0ksNkJBQ1ksVUFBNkIsRUFDN0Isb0JBQTBDO1FBRDFDLGVBQVUsR0FBVixVQUFVLENBQW1CO1FBQzdCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7SUFDbkQsQ0FBQztJQUVKLHFDQUFPLEdBQVA7UUFBQSxpQkFTQztRQVJHLGlCQUFpQjtRQUNqQixJQUFJLGtCQUFrQixFQUFFO1lBQ3BCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxlQUFlLEVBQUU7YUFDN0MsSUFBSSxDQUFDLFVBQUMsU0FBUyxJQUFLLE9BQUEsS0FBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQzthQUNoRSxJQUFJLENBQUMsY0FBTSxPQUFBLGtCQUFrQixHQUFHLElBQUksRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7O2dCQW5CSixVQUFVLFNBQUM7b0JBQ1IsVUFBVSxFQUFFLE1BQU07aUJBQ3JCOzs7O2dCQVBRLGlCQUFpQjtnQkFDakIsb0JBQW9COzs7OEJBSjdCO0NBNEJDLEFBcEJELElBb0JDO1NBakJZLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJlc29sdmUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBBcHBNYW5hZ2VyU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL2FwcC5tYW5hZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXBwVmFyaWFibGVzUHJvdmlkZXIgfSBmcm9tICcuLi90eXBlcy90eXBlcyc7XG5cbmxldCBhcHBWYXJpYWJsZXNMb2FkZWQgPSBmYWxzZTtcblxuQEluamVjdGFibGUoe1xuICAgIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBBcHBWYXJpYWJsZXNSZXNvbHZlIGltcGxlbWVudHMgUmVzb2x2ZTxhbnk+IHtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGFwcE1hbmFnZXI6IEFwcE1hbmFnZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGFwcFZhcmlhYmxlc1Byb3ZpZGVyOiBBcHBWYXJpYWJsZXNQcm92aWRlclxuICAgICkge31cblxuICAgIHJlc29sdmUoKSB7XG4gICAgICAgIC8vIGV4ZWN1dGUgYXBwLmpzXG4gICAgICAgIGlmIChhcHBWYXJpYWJsZXNMb2FkZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwVmFyaWFibGVzUHJvdmlkZXIuZ2V0QXBwVmFyaWFibGVzKClcbiAgICAgICAgICAgIC50aGVuKCh2YXJpYWJsZXMpID0+IHRoaXMuYXBwTWFuYWdlci5sb2FkQXBwVmFyaWFibGVzKHZhcmlhYmxlcykpXG4gICAgICAgICAgICAudGhlbigoKSA9PiBhcHBWYXJpYWJsZXNMb2FkZWQgPSB0cnVlKTtcbiAgICB9XG59XG4iXX0=