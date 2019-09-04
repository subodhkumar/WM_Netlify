import { Injectable } from '@angular/core';
import { AppManagerService } from '../services/app.manager.service';
import * as i0 from "@angular/core";
import * as i1 from "../services/app.manager.service";
let metadataResolved = false;
export class MetadataResolve {
    constructor(appManager) {
        this.appManager = appManager;
    }
    resolve() {
        return metadataResolved || this.appManager.loadMetadata().then(() => metadataResolved = true);
    }
}
MetadataResolve.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
MetadataResolve.ctorParameters = () => [
    { type: AppManagerService }
];
MetadataResolve.ngInjectableDef = i0.defineInjectable({ factory: function MetadataResolve_Factory() { return new MetadataResolve(i0.inject(i1.AppManagerService)); }, token: MetadataResolve, providedIn: "root" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEucmVzb2x2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJyZXNvbHZlcy9tZXRhZGF0YS5yZXNvbHZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHM0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7OztBQUVwRSxJQUFJLGdCQUFnQixHQUFHLEtBQUssQ0FBQztBQUs3QixNQUFNLE9BQU8sZUFBZTtJQUN4QixZQUFvQixVQUE2QjtRQUE3QixlQUFVLEdBQVYsVUFBVSxDQUFtQjtJQUFHLENBQUM7SUFFckQsT0FBTztRQUNILE9BQU8sZ0JBQWdCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDbEcsQ0FBQzs7O1lBUkosVUFBVSxTQUFDO2dCQUNSLFVBQVUsRUFBRSxNQUFNO2FBQ3JCOzs7O1lBTlEsaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUmVzb2x2ZSB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IEFwcE1hbmFnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvYXBwLm1hbmFnZXIuc2VydmljZSc7XG5cbmxldCBtZXRhZGF0YVJlc29sdmVkID0gZmFsc2U7XG5cbkBJbmplY3RhYmxlKHtcbiAgICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgTWV0YWRhdGFSZXNvbHZlIGltcGxlbWVudHMgUmVzb2x2ZTxhbnk+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFwcE1hbmFnZXI6IEFwcE1hbmFnZXJTZXJ2aWNlKSB7fVxuXG4gICAgcmVzb2x2ZSgpIHtcbiAgICAgICAgcmV0dXJuIG1ldGFkYXRhUmVzb2x2ZWQgfHwgdGhpcy5hcHBNYW5hZ2VyLmxvYWRNZXRhZGF0YSgpLnRoZW4oKCkgPT4gbWV0YWRhdGFSZXNvbHZlZCA9IHRydWUpO1xuICAgIH1cbn1cbiJdfQ==