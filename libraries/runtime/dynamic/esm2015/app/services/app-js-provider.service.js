import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppJSProvider } from '@wm/runtime/base';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export class AppJSProviderService extends AppJSProvider {
    constructor($http) {
        super();
        this.$http = $http;
    }
    getAppScriptFn() {
        return this.$http.get('./app.js', { responseType: 'text' })
            .toPromise()
            .then(script => new Function('App', 'Utils', 'Injector', script));
    }
}
AppJSProviderService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
AppJSProviderService.ctorParameters = () => [
    { type: HttpClient }
];
AppJSProviderService.ngInjectableDef = i0.defineInjectable({ factory: function AppJSProviderService_Factory() { return new AppJSProviderService(i0.inject(i1.HttpClient)); }, token: AppJSProviderService, providedIn: "root" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWpzLXByb3ZpZGVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vcnVudGltZS9keW5hbWljLyIsInNvdXJjZXMiOlsiYXBwL3NlcnZpY2VzL2FwcC1qcy1wcm92aWRlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRWxELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQzs7O0FBS2pELE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxhQUFhO0lBQ25ELFlBQW9CLEtBQWlCO1FBQ2pDLEtBQUssRUFBRSxDQUFDO1FBRFEsVUFBSyxHQUFMLEtBQUssQ0FBWTtJQUVyQyxDQUFDO0lBRU0sY0FBYztRQUNqQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxFQUFDLFlBQVksRUFBRSxNQUFNLEVBQUMsQ0FBQzthQUNwRCxTQUFTLEVBQUU7YUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzFFLENBQUM7OztZQVpKLFVBQVUsU0FBQztnQkFDUixVQUFVLEVBQUUsTUFBTTthQUNyQjs7OztZQU5RLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQgeyBBcHBKU1Byb3ZpZGVyIH0gZnJvbSAnQHdtL3J1bnRpbWUvYmFzZSc7XG5cbkBJbmplY3RhYmxlKHtcbiAgICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgQXBwSlNQcm92aWRlclNlcnZpY2UgZXh0ZW5kcyBBcHBKU1Byb3ZpZGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRodHRwOiBIdHRwQ2xpZW50KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEFwcFNjcmlwdEZuKCk6IFByb21pc2U8RnVuY3Rpb24+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAuZ2V0KCcuL2FwcC5qcycsIHtyZXNwb25zZVR5cGU6ICd0ZXh0J30pXG4gICAgICAgICAgICAudG9Qcm9taXNlKClcbiAgICAgICAgICAgIC50aGVuKHNjcmlwdCA9PiBuZXcgRnVuY3Rpb24oJ0FwcCcsICdVdGlscycsICdJbmplY3RvcicsIHNjcmlwdCkpO1xuICAgIH1cbn1cbiJdfQ==