import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AbstractHttpService } from '@wm/core';
import { getAccessToken, performAuthorization, removeAccessToken } from './oAuth.utils';
export class OAuthService {
    constructor(httpService) {
        this.httpService = httpService;
        this.providers = new Subject();
        this.providersConfig = [];
    }
    getOAuthProvidersAsObservable() {
        return this.providers.asObservable();
    }
    addProviderConfig(provider) {
        if (!(_.find(this.providersConfig, { 'name': provider.name }))) {
            this.providersConfig.push(provider);
        }
        this.providers.next(this.providersConfig);
    }
    removeProviderConfig(providerId) {
        _.remove(this.providersConfig, provider => provider.name === providerId);
        this.providers.next(this.providersConfig);
    }
    perfromOAuthorization(url, providerId, onSuccess, onError) {
        performAuthorization(url, providerId, onSuccess, onError, this.httpService, this.addProviderConfig.bind(this), this.removeProviderConfig.bind(this));
    }
    getAccessToken(provider, checkLocalStorage) {
        return getAccessToken(provider, checkLocalStorage);
    }
    removeAccessToken(provider) {
        removeAccessToken(provider);
    }
}
OAuthService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
OAuthService.ctorParameters = () => [
    { type: AbstractHttpService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib0F1dGguc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9vQXV0aC8iLCJzb3VyY2VzIjpbIm9BdXRoLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzQyxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUvQyxPQUFPLEVBQUUsY0FBYyxFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBS3hGLE1BQU0sT0FBTyxZQUFZO0lBQ3JCLFlBQW9CLFdBQWdDO1FBQWhDLGdCQUFXLEdBQVgsV0FBVyxDQUFxQjtRQUVwRCxjQUFTLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUUxQixvQkFBZSxHQUFHLEVBQUUsQ0FBQztJQUprQyxDQUFDO0lBTXhELDZCQUE2QjtRQUN6QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDekMsQ0FBQztJQUVELGlCQUFpQixDQUFDLFFBQVE7UUFDdEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUMsTUFBTSxFQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDM0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDdkM7UUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELG9CQUFvQixDQUFDLFVBQVU7UUFDM0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELHFCQUFxQixDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE9BQU87UUFDckQsb0JBQW9CLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekosQ0FBQztJQUVELGNBQWMsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCO1FBQ3RDLE9BQU8sY0FBYyxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxRQUFRO1FBQ3RCLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7OztZQWxDSixVQUFVOzs7O1lBTkYsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IEFic3RyYWN0SHR0cFNlcnZpY2UgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IGdldEFjY2Vzc1Rva2VuLCBwZXJmb3JtQXV0aG9yaXphdGlvbiwgcmVtb3ZlQWNjZXNzVG9rZW4gfSBmcm9tICcuL29BdXRoLnV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgT0F1dGhTZXJ2aWNlIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHBTZXJ2aWNlOiBBYnN0cmFjdEh0dHBTZXJ2aWNlKSB7fVxuXG4gICAgcHJvdmlkZXJzID0gbmV3IFN1YmplY3QoKTtcblxuICAgIHByb3ZpZGVyc0NvbmZpZyA9IFtdO1xuXG4gICAgZ2V0T0F1dGhQcm92aWRlcnNBc09ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvdmlkZXJzLmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIGFkZFByb3ZpZGVyQ29uZmlnKHByb3ZpZGVyKSB7XG4gICAgICAgIGlmICghKF8uZmluZCh0aGlzLnByb3ZpZGVyc0NvbmZpZywgeyduYW1lJyA6IHByb3ZpZGVyLm5hbWV9KSkpIHtcbiAgICAgICAgICAgIHRoaXMucHJvdmlkZXJzQ29uZmlnLnB1c2gocHJvdmlkZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvdmlkZXJzLm5leHQodGhpcy5wcm92aWRlcnNDb25maWcpO1xuICAgIH1cblxuICAgIHJlbW92ZVByb3ZpZGVyQ29uZmlnKHByb3ZpZGVySWQpIHtcbiAgICAgICAgXy5yZW1vdmUodGhpcy5wcm92aWRlcnNDb25maWcsIHByb3ZpZGVyID0+IHByb3ZpZGVyLm5hbWUgPT09IHByb3ZpZGVySWQpO1xuICAgICAgICB0aGlzLnByb3ZpZGVycy5uZXh0KHRoaXMucHJvdmlkZXJzQ29uZmlnKTtcbiAgICB9XG5cbiAgICBwZXJmcm9tT0F1dGhvcml6YXRpb24odXJsLCBwcm92aWRlcklkLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcbiAgICAgICAgcGVyZm9ybUF1dGhvcml6YXRpb24odXJsLCBwcm92aWRlcklkLCBvblN1Y2Nlc3MsIG9uRXJyb3IsIHRoaXMuaHR0cFNlcnZpY2UsIHRoaXMuYWRkUHJvdmlkZXJDb25maWcuYmluZCh0aGlzKSwgdGhpcy5yZW1vdmVQcm92aWRlckNvbmZpZy5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBnZXRBY2Nlc3NUb2tlbihwcm92aWRlciwgY2hlY2tMb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgcmV0dXJuIGdldEFjY2Vzc1Rva2VuKHByb3ZpZGVyLCBjaGVja0xvY2FsU3RvcmFnZSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQWNjZXNzVG9rZW4ocHJvdmlkZXIpIHtcbiAgICAgICAgcmVtb3ZlQWNjZXNzVG9rZW4ocHJvdmlkZXIpO1xuICAgIH1cbn1cbiJdfQ==