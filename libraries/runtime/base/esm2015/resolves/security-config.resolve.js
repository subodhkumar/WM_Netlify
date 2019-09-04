import { Injectable } from '@angular/core';
import { getWmProjectProperties } from '@wm/core';
import { AppManagerService } from '../services/app.manager.service';
import * as i0 from "@angular/core";
import * as i1 from "../services/app.manager.service";
export class SecurityConfigResolve {
    constructor(appManager) {
        this.appManager = appManager;
        // if the project type is PREFAB, setting this flag will not trigger security/info call
        this.loaded = this.appManager.isPrefabType() || this.appManager.isTemplateBundleType() || !getWmProjectProperties().securityEnabled;
    }
    resolve() {
        return this.loaded || this.appManager.loadSecurityConfig().then(() => {
            this.loaded = true;
        });
    }
}
SecurityConfigResolve.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
SecurityConfigResolve.ctorParameters = () => [
    { type: AppManagerService }
];
SecurityConfigResolve.ngInjectableDef = i0.defineInjectable({ factory: function SecurityConfigResolve_Factory() { return new SecurityConfigResolve(i0.inject(i1.AppManagerService)); }, token: SecurityConfigResolve, providedIn: "root" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHktY29uZmlnLnJlc29sdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vcnVudGltZS9iYXNlLyIsInNvdXJjZXMiOlsicmVzb2x2ZXMvc2VjdXJpdHktY29uZmlnLnJlc29sdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUczQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7OztBQUtwRSxNQUFNLE9BQU8scUJBQXFCO0lBRzlCLFlBQW9CLFVBQTZCO1FBQTdCLGVBQVUsR0FBVixVQUFVLENBQW1CO1FBRTdDLHVGQUF1RjtRQUN2RixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxlQUFlLENBQUM7SUFDeEksQ0FBQztJQUVELE9BQU87UUFDSCxPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDakUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDOzs7WUFoQkosVUFBVSxTQUFDO2dCQUNSLFVBQVUsRUFBRSxNQUFNO2FBQ3JCOzs7O1lBSlEsaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUmVzb2x2ZSB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IGdldFdtUHJvamVjdFByb3BlcnRpZXMgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEFwcE1hbmFnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvYXBwLm1hbmFnZXIuc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKHtcbiAgICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgU2VjdXJpdHlDb25maWdSZXNvbHZlIGltcGxlbWVudHMgUmVzb2x2ZTxhbnk+IHtcbiAgICBsb2FkZWQ6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFwcE1hbmFnZXI6IEFwcE1hbmFnZXJTZXJ2aWNlKSB7XG5cbiAgICAgICAgLy8gaWYgdGhlIHByb2plY3QgdHlwZSBpcyBQUkVGQUIsIHNldHRpbmcgdGhpcyBmbGFnIHdpbGwgbm90IHRyaWdnZXIgc2VjdXJpdHkvaW5mbyBjYWxsXG4gICAgICAgIHRoaXMubG9hZGVkID0gdGhpcy5hcHBNYW5hZ2VyLmlzUHJlZmFiVHlwZSgpIHx8IHRoaXMuYXBwTWFuYWdlci5pc1RlbXBsYXRlQnVuZGxlVHlwZSgpIHx8ICFnZXRXbVByb2plY3RQcm9wZXJ0aWVzKCkuc2VjdXJpdHlFbmFibGVkO1xuICAgIH1cblxuICAgIHJlc29sdmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvYWRlZCB8fCB0aGlzLmFwcE1hbmFnZXIubG9hZFNlY3VyaXR5Q29uZmlnKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==