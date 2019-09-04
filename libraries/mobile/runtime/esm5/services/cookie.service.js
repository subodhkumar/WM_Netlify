import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
var STORAGE_KEY = 'wavemaker.persistedcookies';
var CookieService = /** @class */ (function () {
    function CookieService() {
        this.cookieInfo = {};
        this.serviceName = 'CookeService';
    }
    CookieService.prototype.persistCookie = function (hostname, cookieName, cookieValue) {
        var _this = this;
        return new Promise(function (resolve) {
            if (cookieValue) {
                resolve(cookieValue);
            }
            else {
                _this.getCookie(hostname, cookieName)
                    .then(function (data) { return resolve(data.cookieValue); });
            }
        }).then(function (value) {
            _this.cookieInfo[hostname + '-' + cookieName] = {
                hostname: hostname.replace(/:[0-9]+/, ''),
                name: cookieName,
                value: _this.rotateLTR(value)
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_this.cookieInfo));
        });
    };
    CookieService.prototype.getCookie = function (hostname, cookieName) {
        return new Promise(function (resolve, reject) {
            window['cookieEmperor'].getCookie(hostname, cookieName, resolve, reject);
        });
    };
    CookieService.prototype.setCookie = function (hostname, cookieName, cookieValue) {
        return new Promise(function (resolve, reject) {
            window['cookieEmperor'].setCookie(hostname, cookieName, cookieValue, resolve, reject);
        });
    };
    CookieService.prototype.clearAll = function () {
        return new Promise(function (resolve, reject) { return window['cookieEmperor'].clearAll(resolve, reject); });
    };
    /**
     * Loads persisted cookies from local storage and adds them to the browser.
     * @returns {*}
     */
    CookieService.prototype.start = function () {
        var _this = this;
        var cookieInfoStr = localStorage.getItem(STORAGE_KEY), promises = [];
        if (cookieInfoStr) {
            var cookieInfo = JSON.parse(cookieInfoStr);
            _.forEach(cookieInfo, function (c) {
                if (c.name && c.value) {
                    var promise = new Promise(function (resolve, reject) {
                        window['cookieEmperor'].setCookie(c.hostname, c.name, _this.rotateRTL(c.value), resolve, reject);
                    });
                    promises.push(promise);
                }
            });
        }
        return Promise.all(promises);
    };
    /**
     * Just rotates the given string exactly from 1/3 of string length in left to right direction.
     * @param str
     * @returns {string}
     */
    CookieService.prototype.rotateLTR = function (str) {
        var arr = str.split(''), tArr = [], shift = Math.floor(str.length / 3);
        arr.forEach(function (v, i) {
            tArr[(i + shift) % arr.length] = arr[i];
        });
        return tArr.join('');
    };
    /**
     * Just rotates the given string exactly from 1/3 of string length in  right to left direction..
     * @param str
     * @returns {string}
     */
    CookieService.prototype.rotateRTL = function (str) {
        var arr = str.split(''), tArr = [], shift = Math.floor(str.length / 3);
        arr.forEach(function (v, i) {
            tArr[(arr.length + i - shift) % arr.length] = arr[i];
        });
        return tArr.join('');
    };
    CookieService.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] }
    ];
    CookieService.ngInjectableDef = i0.defineInjectable({ factory: function CookieService_Factory() { return new CookieService(); }, token: CookieService, providedIn: "root" });
    return CookieService;
}());
export { CookieService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL3J1bnRpbWUvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9jb29raWUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOztBQU0zQyxJQUFNLFdBQVcsR0FBRyw0QkFBNEIsQ0FBQztBQVFqRDtJQUFBO1FBS1ksZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUVqQixnQkFBVyxHQUFHLGNBQWMsQ0FBQztLQXNGdkM7SUFwRlUscUNBQWEsR0FBcEIsVUFBcUIsUUFBZ0IsRUFBRSxVQUFrQixFQUFFLFdBQW9CO1FBQS9FLGlCQWdCQztRQWZHLE9BQU8sSUFBSSxPQUFPLENBQVMsVUFBQSxPQUFPO1lBQzFCLElBQUksV0FBVyxFQUFFO2dCQUNiLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUN4QjtpQkFBTTtnQkFDSCxLQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUM7cUJBQy9CLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQXpCLENBQXlCLENBQUMsQ0FBQzthQUNoRDtRQUNMLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLEtBQUs7WUFDVCxLQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxHQUFHLEdBQUcsVUFBVSxDQUFDLEdBQUc7Z0JBQzNDLFFBQVEsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7Z0JBQ3pDLElBQUksRUFBRSxVQUFVO2dCQUNoQixLQUFLLEVBQUUsS0FBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7YUFDL0IsQ0FBQztZQUNGLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSSxDQUFDLFVBQVUs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LEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6QixDQUFDOztnQkE1RkosVUFBVSxTQUFDO29CQUNSLFVBQVUsRUFBRSxNQUFNO2lCQUNyQjs7O3dCQWhCRDtDQTJHQyxBQTdGRCxJQTZGQztTQTFGWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBJRGV2aWNlU3RhcnRVcFNlcnZpY2UgfSBmcm9tICdAd20vbW9iaWxlL2NvcmUnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IFNUT1JBR0VfS0VZID0gJ3dhdmVtYWtlci5wZXJzaXN0ZWRjb29raWVzJztcblxuaW50ZXJmYWNlIENvb2tpZUluZm8ge1xuICAgIGhvc3RuYW1lOiBzdHJpbmc7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHZhbHVlOiBzdHJpbmc7XG59XG5cbkBJbmplY3RhYmxlKHtcbiAgICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgQ29va2llU2VydmljZSBpbXBsZW1lbnRzIElEZXZpY2VTdGFydFVwU2VydmljZSB7XG5cbiAgICBwcml2YXRlIGNvb2tpZUluZm8gPSB7fTtcblxuICAgIHB1YmxpYyBzZXJ2aWNlTmFtZSA9ICdDb29rZVNlcnZpY2UnO1xuXG4gICAgcHVibGljIHBlcnNpc3RDb29raWUoaG9zdG5hbWU6IHN0cmluZywgY29va2llTmFtZTogc3RyaW5nLCBjb29raWVWYWx1ZT86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPihyZXNvbHZlID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY29va2llVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjb29raWVWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRDb29raWUoaG9zdG5hbWUsIGNvb2tpZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHJlc29sdmUoZGF0YS5jb29raWVWYWx1ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLnRoZW4odmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29va2llSW5mb1tob3N0bmFtZSArICctJyArIGNvb2tpZU5hbWVdID0ge1xuICAgICAgICAgICAgICAgICAgICBob3N0bmFtZTogaG9zdG5hbWUucmVwbGFjZSgvOlswLTldKy8sICcnKSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogY29va2llTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMucm90YXRlTFRSKHZhbHVlKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oU1RPUkFHRV9LRVksIEpTT04uc3RyaW5naWZ5KHRoaXMuY29va2llSW5mbykpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldENvb2tpZShob3N0bmFtZTogc3RyaW5nLCBjb29raWVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgd2luZG93Wydjb29raWVFbXBlcm9yJ10uZ2V0Q29va2llKGhvc3RuYW1lLCBjb29raWVOYW1lLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0Q29va2llKGhvc3RuYW1lOiBzdHJpbmcsIGNvb2tpZU5hbWU6IHN0cmluZywgY29va2llVmFsdWU6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB3aW5kb3dbJ2Nvb2tpZUVtcGVyb3InXS5zZXRDb29raWUoaG9zdG5hbWUsIGNvb2tpZU5hbWUsIGNvb2tpZVZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJBbGwoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4gd2luZG93Wydjb29raWVFbXBlcm9yJ10uY2xlYXJBbGwocmVzb2x2ZSwgcmVqZWN0KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZHMgcGVyc2lzdGVkIGNvb2tpZXMgZnJvbSBsb2NhbCBzdG9yYWdlIGFuZCBhZGRzIHRoZW0gdG8gdGhlIGJyb3dzZXIuXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgcHVibGljIHN0YXJ0KCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IGNvb2tpZUluZm9TdHIgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShTVE9SQUdFX0tFWSksXG4gICAgICAgICAgICBwcm9taXNlcyA9IFtdO1xuICAgICAgICBpZiAoY29va2llSW5mb1N0cikge1xuICAgICAgICAgICAgY29uc3QgY29va2llSW5mbyA9IEpTT04ucGFyc2UoY29va2llSW5mb1N0cikgYXMgTWFwPHN0cmluZywgQ29va2llSW5mbz47XG4gICAgICAgICAgICBfLmZvckVhY2goY29va2llSW5mbywgYyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGMubmFtZSAmJiBjLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3dbJ2Nvb2tpZUVtcGVyb3InXS5zZXRDb29raWUoYy5ob3N0bmFtZSwgYy5uYW1lLCB0aGlzLnJvdGF0ZVJUTChjLnZhbHVlKSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBKdXN0IHJvdGF0ZXMgdGhlIGdpdmVuIHN0cmluZyBleGFjdGx5IGZyb20gMS8zIG9mIHN0cmluZyBsZW5ndGggaW4gbGVmdCB0byByaWdodCBkaXJlY3Rpb24uXG4gICAgICogQHBhcmFtIHN0clxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHJpdmF0ZSByb3RhdGVMVFIoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBhcnIgPSBzdHIuc3BsaXQoJycpLFxuICAgICAgICAgICAgdEFyciA9IFtdLFxuICAgICAgICAgICAgc2hpZnQgPSBNYXRoLmZsb29yKHN0ci5sZW5ndGggLyAzKTtcbiAgICAgICAgYXJyLmZvckVhY2goKHYsIGkpID0+IHtcbiAgICAgICAgICAgIHRBcnJbKGkgKyBzaGlmdCkgJSBhcnIubGVuZ3RoXSA9IGFycltpXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0QXJyLmpvaW4oJycpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEp1c3Qgcm90YXRlcyB0aGUgZ2l2ZW4gc3RyaW5nIGV4YWN0bHkgZnJvbSAxLzMgb2Ygc3RyaW5nIGxlbmd0aCBpbiAgcmlnaHQgdG8gbGVmdCBkaXJlY3Rpb24uLlxuICAgICAqIEBwYXJhbSBzdHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHByaXZhdGUgcm90YXRlUlRMKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgYXJyID0gc3RyLnNwbGl0KCcnKSxcbiAgICAgICAgICAgIHRBcnIgPSBbXSxcbiAgICAgICAgICAgIHNoaWZ0ID0gTWF0aC5mbG9vcihzdHIubGVuZ3RoIC8gMyk7XG4gICAgICAgIGFyci5mb3JFYWNoKCh2LCBpKSA9PiB7XG4gICAgICAgICAgICB0QXJyWyhhcnIubGVuZ3RoICsgaSAtIHNoaWZ0KSAlIGFyci5sZW5ndGhdID0gYXJyW2ldO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRBcnIuam9pbignJyk7XG4gICAgfVxufVxuIl19