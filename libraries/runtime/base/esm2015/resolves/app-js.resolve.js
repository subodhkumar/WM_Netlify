import * as tslib_1 from "tslib";
import { Injectable, Injector } from '@angular/core';
import { App, UtilsService } from '@wm/core';
import { AppJSProvider } from '../types/types';
let appJsLoaded = false;
export class AppJSResolve {
    constructor(inj, app, utilService, appJsProvider) {
        this.inj = inj;
        this.app = app;
        this.utilService = utilService;
        this.appJsProvider = appJsProvider;
    }
    resolve() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (appJsLoaded) {
                return true;
            }
            try {
                // execute app.js
                const appScriptFn = yield this.appJsProvider.getAppScriptFn();
                appScriptFn(this.app, this.utilService, this.inj);
            }
            catch (e) {
                console.warn('Error in executing app.js', e);
            }
            appJsLoaded = true;
            return true;
        });
    }
}
AppJSResolve.decorators = [
    { type: Injectable }
];
/** @nocollapse */
AppJSResolve.ctorParameters = () => [
    { type: Injector },
    { type: App },
    { type: UtilsService },
    { type: AppJSProvider }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWpzLnJlc29sdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vcnVudGltZS9iYXNlLyIsInNvdXJjZXMiOlsicmVzb2x2ZXMvYXBwLWpzLnJlc29sdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3JELE9BQU8sRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTdDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvQyxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFHeEIsTUFBTSxPQUFPLFlBQVk7SUFFckIsWUFDWSxHQUFhLEVBQ2IsR0FBUSxFQUNSLFdBQXlCLEVBQ3pCLGFBQTRCO1FBSDVCLFFBQUcsR0FBSCxHQUFHLENBQVU7UUFDYixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ1IsZ0JBQVcsR0FBWCxXQUFXLENBQWM7UUFDekIsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFDckMsQ0FBQztJQUVFLE9BQU87O1lBQ1QsSUFBSSxXQUFXLEVBQUU7Z0JBQ2IsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUVELElBQUk7Z0JBQ0EsaUJBQWlCO2dCQUNqQixNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQzlELFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3JEO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNoRDtZQUVELFdBQVcsR0FBRyxJQUFJLENBQUM7WUFFbkIsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQUFBOzs7WUExQkosVUFBVTs7OztZQVRVLFFBQVE7WUFHcEIsR0FBRztZQUFFLFlBQVk7WUFFakIsYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSZXNvbHZlIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgQXBwLCBVdGlsc1NlcnZpY2UgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEFwcEpTUHJvdmlkZXIgfSBmcm9tICcuLi90eXBlcy90eXBlcyc7XG5cbmxldCBhcHBKc0xvYWRlZCA9IGZhbHNlO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQXBwSlNSZXNvbHZlIGltcGxlbWVudHMgUmVzb2x2ZTxhbnk+IHtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGluajogSW5qZWN0b3IsXG4gICAgICAgIHByaXZhdGUgYXBwOiBBcHAsXG4gICAgICAgIHByaXZhdGUgdXRpbFNlcnZpY2U6IFV0aWxzU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBhcHBKc1Byb3ZpZGVyOiBBcHBKU1Byb3ZpZGVyXG4gICAgKSB7fVxuXG4gICAgYXN5bmMgcmVzb2x2ZSgpIHtcbiAgICAgICAgaWYgKGFwcEpzTG9hZGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBleGVjdXRlIGFwcC5qc1xuICAgICAgICAgICAgY29uc3QgYXBwU2NyaXB0Rm4gPSBhd2FpdCB0aGlzLmFwcEpzUHJvdmlkZXIuZ2V0QXBwU2NyaXB0Rm4oKTtcbiAgICAgICAgICAgIGFwcFNjcmlwdEZuKHRoaXMuYXBwLCB0aGlzLnV0aWxTZXJ2aWNlLCB0aGlzLmluaik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignRXJyb3IgaW4gZXhlY3V0aW5nIGFwcC5qcycsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXBwSnNMb2FkZWQgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbiJdfQ==