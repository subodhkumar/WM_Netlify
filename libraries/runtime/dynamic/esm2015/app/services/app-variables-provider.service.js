import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { AppVariablesProvider } from '@wm/runtime/base';
import { AppResourceManagerService } from './app-resource-manager.service';
import * as i0 from "@angular/core";
import * as i1 from "./app-resource-manager.service";
export class AppVariablesProviderService extends AppVariablesProvider {
    constructor(resourceManager) {
        super();
        this.resourceManager = resourceManager;
    }
    getAppVariables() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.resourceManager.get('./app.variables.json');
        });
    }
}
AppVariablesProviderService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
AppVariablesProviderService.ctorParameters = () => [
    { type: AppResourceManagerService }
];
AppVariablesProviderService.ngInjectableDef = i0.defineInjectable({ factory: function AppVariablesProviderService_Factory() { return new AppVariablesProviderService(i0.inject(i1.AppResourceManagerService)); }, token: AppVariablesProviderService, providedIn: "root" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXZhcmlhYmxlcy1wcm92aWRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvZHluYW1pYy8iLCJzb3VyY2VzIjpbImFwcC9zZXJ2aWNlcy9hcHAtdmFyaWFibGVzLXByb3ZpZGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDeEQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7OztBQUszRSxNQUFNLE9BQU8sMkJBQTRCLFNBQVEsb0JBQW9CO0lBQ2pFLFlBQW9CLGVBQTBDO1FBQzFELEtBQUssRUFBRSxDQUFDO1FBRFEsb0JBQWUsR0FBZixlQUFlLENBQTJCO0lBRTlELENBQUM7SUFFWSxlQUFlOztZQUN4QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDNUQsQ0FBQztLQUFBOzs7WUFWSixVQUFVLFNBQUM7Z0JBQ1IsVUFBVSxFQUFFLE1BQU07YUFDckI7Ozs7WUFKUSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBcHBWYXJpYWJsZXNQcm92aWRlciB9IGZyb20gJ0B3bS9ydW50aW1lL2Jhc2UnO1xuaW1wb3J0IHsgQXBwUmVzb3VyY2VNYW5hZ2VyU2VydmljZSB9IGZyb20gJy4vYXBwLXJlc291cmNlLW1hbmFnZXIuc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKHtcbiAgICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgQXBwVmFyaWFibGVzUHJvdmlkZXJTZXJ2aWNlIGV4dGVuZHMgQXBwVmFyaWFibGVzUHJvdmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVzb3VyY2VNYW5hZ2VyOiBBcHBSZXNvdXJjZU1hbmFnZXJTZXJ2aWNlKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGdldEFwcFZhcmlhYmxlcygpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXNvdXJjZU1hbmFnZXIuZ2V0KCcuL2FwcC52YXJpYWJsZXMuanNvbicpO1xuICAgIH1cbn1cbiJdfQ==