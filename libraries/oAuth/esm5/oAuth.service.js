import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AbstractHttpService } from '@wm/core';
import { getAccessToken, performAuthorization, removeAccessToken } from './oAuth.utils';
var OAuthService = /** @class */ (function () {
    function OAuthService(httpService) {
        this.httpService = httpService;
        this.providers = new Subject();
        this.providersConfig = [];
    }
    OAuthService.prototype.getOAuthProvidersAsObservable = function () {
        return this.providers.asObservable();
    };
    OAuthService.prototype.addProviderConfig = function (provider) {
        if (!(_.find(this.providersConfig, { 'name': provider.name }))) {
            this.providersConfig.push(provider);
        }
        this.providers.next(this.providersConfig);
    };
    OAuthService.prototype.removeProviderConfig = function (providerId) {
        _.remove(this.providersConfig, function (provider) { return provider.name === providerId; });
        this.providers.next(this.providersConfig);
    };
    OAuthService.prototype.perfromOAuthorization = function (url, providerId, onSuccess, onError) {
        performAuthorization(url, providerId, onSuccess, onError, this.httpService, this.addProviderConfig.bind(this), this.removeProviderConfig.bind(this));
    };
    OAuthService.prototype.getAccessToken = function (provider, checkLocalStorage) {
        return getAccessToken(provider, checkLocalStorage);
    };
    OAuthService.prototype.removeAccessToken = function (provider) {
        removeAccessToken(provider);
    };
    OAuthService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    OAuthService.ctorParameters = function () { return [
        { type: AbstractHttpService }
    ]; };
    return OAuthService;
}());
export { OAuthService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib0F1dGguc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9vQXV0aC8iLCJzb3VyY2VzIjpbIm9BdXRoLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzQyxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUvQyxPQUFPLEVBQUUsY0FBYyxFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBSXhGO0lBRUksc0JBQW9CLFdBQWdDO1FBQWhDLGdCQUFXLEdBQVgsV0FBVyxDQUFxQjtRQUVwRCxjQUFTLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUUxQixvQkFBZSxHQUFHLEVBQUUsQ0FBQztJQUprQyxDQUFDO0lBTXhELG9EQUE2QixHQUE3QjtRQUNJLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBRUQsd0NBQWlCLEdBQWpCLFVBQWtCLFFBQVE7UUFDdEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUMsTUFBTSxFQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDM0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDdkM7UUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELDJDQUFvQixHQUFwQixVQUFxQixVQUFVO1FBQzNCLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUE1QixDQUE0QixDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCw0Q0FBcUIsR0FBckIsVUFBc0IsR0FBRyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsT0FBTztRQUNyRCxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN6SixDQUFDO0lBRUQscUNBQWMsR0FBZCxVQUFlLFFBQVEsRUFBRSxpQkFBaUI7UUFDdEMsT0FBTyxjQUFjLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELHdDQUFpQixHQUFqQixVQUFrQixRQUFRO1FBQ3RCLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7O2dCQWxDSixVQUFVOzs7O2dCQU5GLG1CQUFtQjs7SUF5QzVCLG1CQUFDO0NBQUEsQUFuQ0QsSUFtQ0M7U0FsQ1ksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBBYnN0cmFjdEh0dHBTZXJ2aWNlIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBnZXRBY2Nlc3NUb2tlbiwgcGVyZm9ybUF1dGhvcml6YXRpb24sIHJlbW92ZUFjY2Vzc1Rva2VuIH0gZnJvbSAnLi9vQXV0aC51dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE9BdXRoU2VydmljZSB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwU2VydmljZTogQWJzdHJhY3RIdHRwU2VydmljZSkge31cblxuICAgIHByb3ZpZGVycyA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgICBwcm92aWRlcnNDb25maWcgPSBbXTtcblxuICAgIGdldE9BdXRoUHJvdmlkZXJzQXNPYnNlcnZhYmxlKCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3ZpZGVycy5hc09ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICBhZGRQcm92aWRlckNvbmZpZyhwcm92aWRlcikge1xuICAgICAgICBpZiAoIShfLmZpbmQodGhpcy5wcm92aWRlcnNDb25maWcsIHsnbmFtZScgOiBwcm92aWRlci5uYW1lfSkpKSB7XG4gICAgICAgICAgICB0aGlzLnByb3ZpZGVyc0NvbmZpZy5wdXNoKHByb3ZpZGVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3ZpZGVycy5uZXh0KHRoaXMucHJvdmlkZXJzQ29uZmlnKTtcbiAgICB9XG5cbiAgICByZW1vdmVQcm92aWRlckNvbmZpZyhwcm92aWRlcklkKSB7XG4gICAgICAgIF8ucmVtb3ZlKHRoaXMucHJvdmlkZXJzQ29uZmlnLCBwcm92aWRlciA9PiBwcm92aWRlci5uYW1lID09PSBwcm92aWRlcklkKTtcbiAgICAgICAgdGhpcy5wcm92aWRlcnMubmV4dCh0aGlzLnByb3ZpZGVyc0NvbmZpZyk7XG4gICAgfVxuXG4gICAgcGVyZnJvbU9BdXRob3JpemF0aW9uKHVybCwgcHJvdmlkZXJJZCwgb25TdWNjZXNzLCBvbkVycm9yKSB7XG4gICAgICAgIHBlcmZvcm1BdXRob3JpemF0aW9uKHVybCwgcHJvdmlkZXJJZCwgb25TdWNjZXNzLCBvbkVycm9yLCB0aGlzLmh0dHBTZXJ2aWNlLCB0aGlzLmFkZFByb3ZpZGVyQ29uZmlnLmJpbmQodGhpcyksIHRoaXMucmVtb3ZlUHJvdmlkZXJDb25maWcuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgZ2V0QWNjZXNzVG9rZW4ocHJvdmlkZXIsIGNoZWNrTG9jYWxTdG9yYWdlKSB7XG4gICAgICAgIHJldHVybiBnZXRBY2Nlc3NUb2tlbihwcm92aWRlciwgY2hlY2tMb2NhbFN0b3JhZ2UpO1xuICAgIH1cblxuICAgIHJlbW92ZUFjY2Vzc1Rva2VuKHByb3ZpZGVyKSB7XG4gICAgICAgIHJlbW92ZUFjY2Vzc1Rva2VuKHByb3ZpZGVyKTtcbiAgICB9XG59XG4iXX0=