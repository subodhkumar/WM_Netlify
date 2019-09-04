import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { $appDigest, hasCordova, noop } from '@wm/core';
import * as i0 from "@angular/core";
import * as i1 from "@ionic-native/file";
var REGISTRY_FILE_NAME = 'registry.info';
var DeviceService = /** @class */ (function () {
    function DeviceService(file) {
        var _this = this;
        this.file = file;
        this._registry = {};
        this._isReady = false;
        this._whenReadyPromises = [];
        this._backBtnTapListeners = [];
        this._startUpServices = [];
        var maxWaitTime = 10;
        setTimeout(function () {
            if (!_this._isReady) {
                console.warn("Device is not ready even after " + maxWaitTime + " seconds");
                console.warn('Waiting For %O', _this._startUpServices.map(function (i) { return i.serviceName; }));
            }
        }, maxWaitTime * 1000);
        document.addEventListener('backbutton', this.executeBackTapListeners.bind(this));
    }
    DeviceService.prototype.executeBackTapListeners = function ($event) {
        _.forEach(this._backBtnTapListeners, function (fn) {
            return fn($event) !== false;
        });
        // explicitly applying the digest cycle as the backbutton listener is not rendering the page content.
        // This is because zone is not run (there is no change detection)
        // https://weblogs.thinktecture.com/thomas/2017/02/cordova-vs-zonejs-or-why-is-angulars-document-event-listener-not-in-a-zone.html
        $appDigest();
    };
    DeviceService.prototype.addStartUpService = function (service) {
        this._startUpServices.push(service);
    };
    DeviceService.prototype.onBackButtonTap = function (fn) {
        var _this = this;
        this._backBtnTapListeners.unshift(fn);
        return function () {
            var i = _this._backBtnTapListeners.indexOf(fn);
            if (i >= 0) {
                _this._backBtnTapListeners.splice(i, 1);
            }
        };
    };
    DeviceService.prototype.start = function () {
        var _this = this;
        if (this._isReady || this._startUpServices.length === 0) {
            this._isReady = true;
            return Promise.resolve();
        }
        else {
            return new Promise(function (resolve) {
                if (hasCordova()) {
                    document.addEventListener('deviceready', function () { return resolve(); }, false);
                }
                else {
                    resolve();
                }
            }).then(function () {
                if (window['cordova']) {
                    return _this.file.readAsText(cordova.file.dataDirectory, REGISTRY_FILE_NAME)
                        .then(function (content) { return _this._registry = JSON.parse(content); }, noop);
                }
            }).then(function () {
                return Promise.all(_this._startUpServices.map(function (s) {
                    return s.start().catch(function (error) {
                        console.error('%s failed to start due to: %O', s.serviceName, error);
                        return Promise.reject(error);
                    });
                }));
            }).then(function () {
                window['wmDeviceReady'] = true;
                document.dispatchEvent(new CustomEvent('wmDeviceReady'));
                _this._startUpServices.length = 0;
                _this._whenReadyPromises.forEach(function (fn) { return fn(); });
                _this._isReady = true;
            });
        }
    };
    DeviceService.prototype.whenReady = function () {
        var _this = this;
        if (this._isReady) {
            return Promise.resolve();
        }
        else {
            return new Promise(function (resolve) {
                _this._whenReadyPromises.push(resolve);
            });
        }
    };
    /**
     * @returns {Promise<number>} promise resolved with the app build time
     */
    DeviceService.prototype.getAppBuildTime = function () {
        return this.file.readAsText(cordova.file.applicationDirectory + 'www', 'config.json')
            .then(function (appConfig) { return (JSON.parse(appConfig).buildTime); });
    };
    /**
     * Stores an entry that survives app restarts and updates.
     *
     * @param {string} key
     * @param {Object} value
     * @returns {Promise<any>}
     */
    DeviceService.prototype.storeEntry = function (key, value) {
        this._registry[key] = value;
        return this.file.writeFile(cordova.file.dataDirectory, REGISTRY_FILE_NAME, JSON.stringify(this._registry), { replace: true });
    };
    /**
     * @param {string} key
     * @returns {any} entry corresponding to the key
     */
    DeviceService.prototype.getEntry = function (key) {
        return this._registry[key];
    };
    DeviceService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    DeviceService.ctorParameters = function () { return [
        { type: File }
    ]; };
    DeviceService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceService_Factory() { return new DeviceService(i0.inject(i1.File)); }, token: DeviceService, providedIn: "root" });
    return DeviceService;
}());
export { DeviceService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvcmUvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9kZXZpY2Uuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUUxQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7OztBQU14RCxJQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQztBQUUzQztJQVNJLHVCQUEyQixJQUFVO1FBQXJDLGlCQVNDO1FBVDBCLFNBQUksR0FBSixJQUFJLENBQU07UUFON0IsY0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNmLGFBQVEsR0FBRyxLQUFLLENBQUM7UUFDakIsdUJBQWtCLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLHlCQUFvQixHQUFHLEVBQUUsQ0FBQztRQUMxQixxQkFBZ0IsR0FBNEIsRUFBRSxDQUFDO1FBR25ELElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUN2QixVQUFVLENBQUM7WUFDUCxJQUFJLENBQUMsS0FBSSxDQUFDLFFBQVEsRUFBRTtnQkFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyxvQ0FBa0MsV0FBVyxhQUFVLENBQUMsQ0FBQztnQkFDdEUsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLFdBQVcsRUFBYixDQUFhLENBQUMsQ0FBQyxDQUFDO2FBQ2pGO1FBQ0wsQ0FBQyxFQUFFLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN2QixRQUFRLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMs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LENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7T0FHRztJQUNJLGdDQUFRLEdBQWYsVUFBZ0IsR0FBVztRQUN2QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0IsQ0FBQzs7Z0JBcEhKLFVBQVUsU0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7Ozs7Z0JBVnpCLElBQUk7Ozt3QkFGYjtDQWlJQyxBQXJIRCxJQXFIQztTQXBIWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBGaWxlIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9maWxlJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgaGFzQ29yZG92YSwgbm9vcCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgSURldmljZVN0YXJ0VXBTZXJ2aWNlIH0gZnJvbSAnLi9kZXZpY2Utc3RhcnQtdXAtc2VydmljZSc7XG5cbmRlY2xhcmUgY29uc3QgY29yZG92YSwgXztcblxuY29uc3QgUkVHSVNUUllfRklMRV9OQU1FID0gJ3JlZ2lzdHJ5LmluZm8nO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIERldmljZVNlcnZpY2Uge1xuXG4gICAgcHJpdmF0ZSBfcmVnaXN0cnkgPSB7fTtcbiAgICBwcml2YXRlIF9pc1JlYWR5ID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfd2hlblJlYWR5UHJvbWlzZXMgPSBbXTtcbiAgICBwcml2YXRlIF9iYWNrQnRuVGFwTGlzdGVuZXJzID0gW107XG4gICAgcHJpdmF0ZSBfc3RhcnRVcFNlcnZpY2VzOiBJRGV2aWNlU3RhcnRVcFNlcnZpY2VbXSA9IFtdO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHByaXZhdGUgZmlsZTogRmlsZSkge1xuICAgICAgICBjb25zdCBtYXhXYWl0VGltZSA9IDEwO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNSZWFkeSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRGV2aWNlIGlzIG5vdCByZWFkeSBldmVuIGFmdGVyICR7bWF4V2FpdFRpbWV9IHNlY29uZHNgKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1dhaXRpbmcgRm9yICVPJywgdGhpcy5fc3RhcnRVcFNlcnZpY2VzLm1hcChpID0+IGkuc2VydmljZU5hbWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgbWF4V2FpdFRpbWUgKiAxMDAwKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYmFja2J1dHRvbicsIHRoaXMuZXhlY3V0ZUJhY2tUYXBMaXN0ZW5lcnMuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgcHVibGljIGV4ZWN1dGVCYWNrVGFwTGlzdGVuZXJzKCRldmVudCkge1xuICAgICAgICBfLmZvckVhY2godGhpcy5fYmFja0J0blRhcExpc3RlbmVycywgZm4gPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZuKCRldmVudCkgIT09IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gZXhwbGljaXRseSBhcHBseWluZyB0aGUgZGlnZXN0IGN5Y2xlIGFzIHRoZSBiYWNrYnV0dG9uIGxpc3RlbmVyIGlzIG5vdCByZW5kZXJpbmcgdGhlIHBhZ2UgY29udGVudC5cbiAgICAgICAgLy8gVGhpcyBpcyBiZWNhdXNlIHpvbmUgaXMgbm90IHJ1biAodGhlcmUgaXMgbm8gY2hhbmdlIGRldGVjdGlvbilcbiAgICAgICAgLy8gaHR0cHM6Ly93ZWJsb2dzLnRoaW5rdGVjdHVyZS5jb20vdGhvbWFzLzIwMTcvMDIvY29yZG92YS12cy16b25lanMtb3Itd2h5LWlzLWFuZ3VsYXJzLWRvY3VtZW50LWV2ZW50LWxpc3RlbmVyLW5vdC1pbi1hLXpvbmUuaHRtbFxuICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZFN0YXJ0VXBTZXJ2aWNlKHNlcnZpY2U6IElEZXZpY2VTdGFydFVwU2VydmljZSkge1xuICAgICAgICB0aGlzLl9zdGFydFVwU2VydmljZXMucHVzaChzZXJ2aWNlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25CYWNrQnV0dG9uVGFwKGZuOiAoJGV2ZW50KSA9PiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX2JhY2tCdG5UYXBMaXN0ZW5lcnMudW5zaGlmdChmbik7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpID0gdGhpcy5fYmFja0J0blRhcExpc3RlbmVycy5pbmRleE9mKGZuKTtcbiAgICAgICAgICAgIGlmIChpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9iYWNrQnRuVGFwTGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1JlYWR5IHx8IHRoaXMuX3N0YXJ0VXBTZXJ2aWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2lzUmVhZHkgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGhhc0NvcmRvdmEoKSkge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdkZXZpY2VyZWFkeScsICgpID0+IHJlc29sdmUoKSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAod2luZG93Wydjb3Jkb3ZhJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5yZWFkQXNUZXh0KGNvcmRvdmEuZmlsZS5kYXRhRGlyZWN0b3J5LCBSRUdJU1RSWV9GSUxFX05BTUUpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihjb250ZW50ID0+ICB0aGlzLl9yZWdpc3RyeSA9IEpTT04ucGFyc2UoY29udGVudCksIG5vb3ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbCh0aGlzLl9zdGFydFVwU2VydmljZXMubWFwKHMgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcy5zdGFydCgpLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignJXMgZmFpbGVkIHRvIHN0YXJ0IGR1ZSB0bzogJU8nLCBzLnNlcnZpY2VOYW1lLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB3aW5kb3dbJ3dtRGV2aWNlUmVhZHknXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3dtRGV2aWNlUmVhZHknKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RhcnRVcFNlcnZpY2VzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5fd2hlblJlYWR5UHJvbWlzZXMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1JlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHdoZW5SZWFkeSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVhZHkpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX3doZW5SZWFkeVByb21pc2VzLnB1c2gocmVzb2x2ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj59IHByb21pc2UgcmVzb2x2ZWQgd2l0aCB0aGUgYXBwIGJ1aWxkIHRpbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0QXBwQnVpbGRUaW1lKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUucmVhZEFzVGV4dChjb3Jkb3ZhLmZpbGUuYXBwbGljYXRpb25EaXJlY3RvcnkgKyAnd3d3JywgJ2NvbmZpZy5qc29uJylcbiAgICAgICAgICAgIC50aGVuKGFwcENvbmZpZyA9PiAoSlNPTi5wYXJzZShhcHBDb25maWcpLmJ1aWxkVGltZSkgYXMgbnVtYmVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdG9yZXMgYW4gZW50cnkgdGhhdCBzdXJ2aXZlcyBhcHAgcmVzdGFydHMgYW5kIHVwZGF0ZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gICAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RvcmVFbnRyeShrZXk6IHN0cmluZywgdmFsdWU6IE9iamVjdCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHRoaXMuX3JlZ2lzdHJ5W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS53cml0ZUZpbGUoY29yZG92YS5maWxlLmRhdGFEaXJlY3RvcnksXG4gICAgICAgICAgICBSRUdJU1RSWV9GSUxFX05BTUUsXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh0aGlzLl9yZWdpc3RyeSksXG4gICAgICAgICAgICB7IHJlcGxhY2U6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgICAqIEByZXR1cm5zIHthbnl9IGVudHJ5IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGtleVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRFbnRyeShrZXk6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWdpc3RyeVtrZXldO1xuICAgIH1cbn1cbiJdfQ==