import * as tslib_1 from "tslib";
import { Injectable, Injector } from '@angular/core';
import { App, UtilsService } from '@wm/core';
import { AppJSProvider } from '../types/types';
var appJsLoaded = false;
var AppJSResolve = /** @class */ (function () {
    function AppJSResolve(inj, app, utilService, appJsProvider) {
        this.inj = inj;
        this.app = app;
        this.utilService = utilService;
        this.appJsProvider = appJsProvider;
    }
    AppJSResolve.prototype.resolve = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var appScriptFn, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (appJsLoaded) {
                            return [2 /*return*/, true];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.appJsProvider.getAppScriptFn()];
                    case 2:
                        appScriptFn = _a.sent();
                        appScriptFn(this.app, this.utilService, this.inj);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.warn('Error in executing app.js', e_1);
                        return [3 /*break*/, 4];
                    case 4:
                        appJsLoaded = true;
                        return [2 /*return*/, true];
                }
            });
        });
    };
    AppJSResolve.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    AppJSResolve.ctorParameters = function () { return [
        { type: Injector },
        { type: App },
        { type: UtilsService },
        { type: AppJSProvider }
    ]; };
    return AppJSResolve;
}());
export { AppJSResolve };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWpzLnJlc29sdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vcnVudGltZS9iYXNlLyIsInNvdXJjZXMiOlsicmVzb2x2ZXMvYXBwLWpzLnJlc29sdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3JELE9BQU8sRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTdDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvQyxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFFeEI7SUFHSSxzQkFDWSxHQUFhLEVBQ2IsR0FBUSxFQUNSLFdBQXlCLEVBQ3pCLGFBQTRCO1FBSDVCLFFBQUcsR0FBSCxHQUFHLENBQVU7UUFDYixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ1IsZ0JBQVcsR0FBWCxXQUFXLENBQWM7UUFDekIsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFDckMsQ0FBQztJQUVFLDhCQUFPLEdBQWI7Ozs7Ozt3QkFDSSxJQUFJLFdBQVcsRUFBRTs0QkFDYixzQkFBTyxJQUFJLEVBQUM7eUJBQ2Y7Ozs7d0JBSXVCLHFCQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLEVBQUE7O3dCQUF2RCxXQUFXLEdBQUcsU0FBeUM7d0JBQzdELFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzs7O3dCQUVsRCxPQUFPLENBQUMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLEdBQUMsQ0FBQyxDQUFDOzs7d0JBR2pELFdBQVcsR0FBRyxJQUFJLENBQUM7d0JBRW5CLHNCQUFPLElBQUksRUFBQzs7OztLQUNmOztnQkExQkosVUFBVTs7OztnQkFUVSxRQUFRO2dCQUdwQixHQUFHO2dCQUFFLFlBQVk7Z0JBRWpCLGFBQWE7O0lBK0J0QixtQkFBQztDQUFBLEFBM0JELElBMkJDO1NBMUJZLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUmVzb2x2ZSB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IEFwcCwgVXRpbHNTZXJ2aWNlIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBcHBKU1Byb3ZpZGVyIH0gZnJvbSAnLi4vdHlwZXMvdHlwZXMnO1xuXG5sZXQgYXBwSnNMb2FkZWQgPSBmYWxzZTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFwcEpTUmVzb2x2ZSBpbXBsZW1lbnRzIFJlc29sdmU8YW55PiB7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBpbmo6IEluamVjdG9yLFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBwcml2YXRlIHV0aWxTZXJ2aWNlOiBVdGlsc1NlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgYXBwSnNQcm92aWRlcjogQXBwSlNQcm92aWRlclxuICAgICkge31cblxuICAgIGFzeW5jIHJlc29sdmUoKSB7XG4gICAgICAgIGlmIChhcHBKc0xvYWRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gZXhlY3V0ZSBhcHAuanNcbiAgICAgICAgICAgIGNvbnN0IGFwcFNjcmlwdEZuID0gYXdhaXQgdGhpcy5hcHBKc1Byb3ZpZGVyLmdldEFwcFNjcmlwdEZuKCk7XG4gICAgICAgICAgICBhcHBTY3JpcHRGbih0aGlzLmFwcCwgdGhpcy51dGlsU2VydmljZSwgdGhpcy5pbmopO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0Vycm9yIGluIGV4ZWN1dGluZyBhcHAuanMnLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFwcEpzTG9hZGVkID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4iXX0=