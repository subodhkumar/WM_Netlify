import { Injectable } from '@angular/core';
import { AppManagerService } from '../services/app.manager.service';
import { AppVariablesProvider } from '../types/types';
import * as i0 from "@angular/core";
import * as i1 from "../services/app.manager.service";
import * as i2 from "../types/types";
let appVariablesLoaded = false;
export class AppVariablesResolve {
    constructor(appManager, appVariablesProvider) {
        this.appManager = appManager;
        this.appVariablesProvider = appVariablesProvider;
    }
    resolve() {
        // execute app.js
        if (appVariablesLoaded) {
            return true;
        }
        return this.appVariablesProvider.getAppVariables()
            .then((variables) => this.appManager.loadAppVariables(variables))
            .then(() => appVariablesLoaded = true);
    }
}
AppVariablesResolve.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
AppVariablesResolve.ctorParameters = () => [
    { type: AppManagerService },
    { type: AppVariablesProvider }
];
AppVariablesResolve.ngInjectableDef = i0.defineInjectable({ factory: function AppVariablesResolve_Factory() { return new AppVariablesResolve(i0.inject(i1.AppManagerService), i0.inject(i2.AppVariablesProvider)); }, token: AppVariablesResolve, providedIn: "root" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXZhcmlhYmxlcy5yZXNvbHZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbInJlc29sdmVzL2FwcC12YXJpYWJsZXMucmVzb2x2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzNDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7O0FBRXRELElBQUksa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0FBSy9CLE1BQU0sT0FBTyxtQkFBbUI7SUFFNUIsWUFDWSxVQUE2QixFQUM3QixvQkFBMEM7UUFEMUMsZUFBVSxHQUFWLFVBQVUsQ0FBbUI7UUFDN0IseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtJQUNuRCxDQUFDO0lBRUosT0FBTztRQUNILGlCQUFpQjtRQUNqQixJQUFJLGtCQUFrQixFQUFFO1lBQ3BCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxlQUFlLEVBQUU7YUFDN0MsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ2hFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMvQyxDQUFDOzs7WUFuQkosVUFBVSxTQUFDO2dCQUNSLFVBQVUsRUFBRSxNQUFNO2FBQ3JCOzs7O1lBUFEsaUJBQWlCO1lBQ2pCLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJlc29sdmUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBBcHBNYW5hZ2VyU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL2FwcC5tYW5hZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXBwVmFyaWFibGVzUHJvdmlkZXIgfSBmcm9tICcuLi90eXBlcy90eXBlcyc7XG5cbmxldCBhcHBWYXJpYWJsZXNMb2FkZWQgPSBmYWxzZTtcblxuQEluamVjdGFibGUoe1xuICAgIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBBcHBWYXJpYWJsZXNSZXNvbHZlIGltcGxlbWVudHMgUmVzb2x2ZTxhbnk+IHtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGFwcE1hbmFnZXI6IEFwcE1hbmFnZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGFwcFZhcmlhYmxlc1Byb3ZpZGVyOiBBcHBWYXJpYWJsZXNQcm92aWRlclxuICAgICkge31cblxuICAgIHJlc29sdmUoKSB7XG4gICAgICAgIC8vIGV4ZWN1dGUgYXBwLmpzXG4gICAgICAgIGlmIChhcHBWYXJpYWJsZXNMb2FkZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwVmFyaWFibGVzUHJvdmlkZXIuZ2V0QXBwVmFyaWFibGVzKClcbiAgICAgICAgICAgIC50aGVuKCh2YXJpYWJsZXMpID0+IHRoaXMuYXBwTWFuYWdlci5sb2FkQXBwVmFyaWFibGVzKHZhcmlhYmxlcykpXG4gICAgICAgICAgICAudGhlbigoKSA9PiBhcHBWYXJpYWJsZXNMb2FkZWQgPSB0cnVlKTtcbiAgICB9XG59XG4iXX0=