import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { App, getWmProjectProperties } from '@wm/core';
import { AppComponent, AppJSProvider, AppVariablesProvider, ComponentRefProvider, PrefabConfigProvider, WM_MODULES_FOR_ROOT, PartialRefProvider } from '@wm/runtime/base';
import { routes } from './app.routes';
import { PageWrapperComponent } from './components/page-wrapper.component';
import { AppJSProviderService } from './services/app-js-provider.service';
import { AppVariablesProviderService } from './services/app-variables-provider.service';
import { ComponentRefProviderService } from './services/component-ref-provider.service';
import { PrefabConfigProviderService } from './services/prefab-config-provider.service';
import { AppResourceManagerService } from './services/app-resource-manager.service';
export const routerModule = RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'top' });
export const toastrModule = ToastrModule.forRoot({ maxOpened: 1, autoDismiss: true });
export const httpClientXsrfModule = HttpClientXsrfModule.withOptions({
    cookieName: 'wm_xsrf_token',
    headerName: getWmProjectProperties().xsrf_header_name
});
export class AppModule {
    constructor(app, inj, componentRefProvider) {
        this.app = app;
        this.inj = inj;
        this.componentRefProvider = componentRefProvider;
        if (window['cordova']) {
            // clear the cached urls on logout, to load the Login Page and not the Main Page as app reload(window.location.reload) is not invoked in mobile
            this.app.subscribe('userLoggedOut', this.componentRefProvider.clearComponentFactoryRefCache.bind(this.componentRefProvider));
        }
    }
}
AppModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    PageWrapperComponent
                ],
                imports: [
                    BrowserModule,
                    CommonModule,
                    RouterModule,
                    HttpClientModule,
                    BrowserAnimationsModule,
                    routerModule,
                    toastrModule,
                    httpClientXsrfModule,
                    WM_MODULES_FOR_ROOT
                ],
                providers: [
                    AppResourceManagerService,
                    { provide: AppJSProvider, useClass: AppJSProviderService },
                    { provide: AppVariablesProvider, useClass: AppVariablesProviderService },
                    { provide: ComponentRefProvider, useClass: ComponentRefProviderService },
                    { provide: PartialRefProvider, useClass: ComponentRefProviderService },
                    { provide: PrefabConfigProvider, useClass: PrefabConfigProviderService }
                ],
                bootstrap: [AppComponent]
            },] }
];
/** @nocollapse */
AppModule.ctorParameters = () => [
    { type: App },
    { type: Injector },
    { type: ComponentRefProvider }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2R5bmFtaWMvIiwic291cmNlcyI6WyJhcHAvYXBwLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUM5RSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUUvRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRTFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdkQsT0FBTyxFQUNILFlBQVksRUFDWixhQUFhLEVBQ2Isb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsbUJBQW1CLEVBQ25CLGtCQUFrQixFQUNyQixNQUFNLGtCQUFrQixDQUFDO0FBRTFCLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDM0UsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDMUUsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDeEYsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDeEYsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDeEYsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFFcEYsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBRSx5QkFBeUIsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0FBQzVHLE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNyRixNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQyxXQUFXLENBQUM7SUFDakUsVUFBVSxFQUFFLGVBQWU7SUFDM0IsVUFBVSxFQUFFLHNCQUFzQixFQUFFLENBQUMsZ0JBQWdCO0NBQ3hELENBQUMsQ0FBQztBQTZCSCxNQUFNLE9BQU8sU0FBUztJQUNsQixZQUFvQixHQUFRLEVBQVUsR0FBYSxFQUFVLG9CQUEwQztRQUFuRixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQVUsUUFBRyxHQUFILEdBQUcsQ0FBVTtRQUFVLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7UUFDbkcsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDbkIsK0lBQStJO1lBQy9JLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7U0FDaEk7SUFDTCxDQUFDOzs7WUFqQ0osUUFBUSxTQUFDO2dCQUNOLFlBQVksRUFBRTtvQkFDVixvQkFBb0I7aUJBQ3ZCO2dCQUNELE9BQU8sRUFBRTtvQkFDTCxhQUFhO29CQUNiLFlBQVk7b0JBQ1osWUFBWTtvQkFDWixnQkFBZ0I7b0JBQ2hCLHVCQUF1QjtvQkFFdkIsWUFBWTtvQkFDWixZQUFZO29CQUNaLG9CQUFvQjtvQkFFcEIsbUJBQW1CO2lCQUN0QjtnQkFDRCxTQUFTLEVBQUU7b0JBQ1AseUJBQXlCO29CQUN6QixFQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFDO29CQUN4RCxFQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsMkJBQTJCLEVBQUM7b0JBQ3RFLEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSwyQkFBMkIsRUFBQztvQkFDdEUsRUFBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLDJCQUEyQixFQUFDO29CQUNwRSxFQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsMkJBQTJCLEVBQUM7aUJBQ3pFO2dCQUNELFNBQVMsRUFBRSxDQUFDLFlBQVksQ0FBQzthQUM1Qjs7OztZQXJEUSxHQUFHO1lBVEgsUUFBUTtZQWViLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdG9yLCBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQnJvd3Nlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IFJvdXRlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBIdHRwQ2xpZW50TW9kdWxlLCBIdHRwQ2xpZW50WHNyZk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEJyb3dzZXJBbmltYXRpb25zTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci9hbmltYXRpb25zJztcblxuaW1wb3J0IHsgVG9hc3RyTW9kdWxlIH0gZnJvbSAnbmd4LXRvYXN0cic7XG5cbmltcG9ydCB7IEFwcCwgZ2V0V21Qcm9qZWN0UHJvcGVydGllcyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHtcbiAgICBBcHBDb21wb25lbnQsXG4gICAgQXBwSlNQcm92aWRlcixcbiAgICBBcHBWYXJpYWJsZXNQcm92aWRlcixcbiAgICBDb21wb25lbnRSZWZQcm92aWRlcixcbiAgICBQcmVmYWJDb25maWdQcm92aWRlcixcbiAgICBXTV9NT0RVTEVTX0ZPUl9ST09ULFxuICAgIFBhcnRpYWxSZWZQcm92aWRlclxufSBmcm9tICdAd20vcnVudGltZS9iYXNlJztcblxuaW1wb3J0IHsgcm91dGVzIH0gZnJvbSAnLi9hcHAucm91dGVzJztcbmltcG9ydCB7IFBhZ2VXcmFwcGVyQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL3BhZ2Utd3JhcHBlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgQXBwSlNQcm92aWRlclNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL2FwcC1qcy1wcm92aWRlci5zZXJ2aWNlJztcbmltcG9ydCB7IEFwcFZhcmlhYmxlc1Byb3ZpZGVyU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvYXBwLXZhcmlhYmxlcy1wcm92aWRlci5zZXJ2aWNlJztcbmltcG9ydCB7IENvbXBvbmVudFJlZlByb3ZpZGVyU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvY29tcG9uZW50LXJlZi1wcm92aWRlci5zZXJ2aWNlJztcbmltcG9ydCB7IFByZWZhYkNvbmZpZ1Byb3ZpZGVyU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvcHJlZmFiLWNvbmZpZy1wcm92aWRlci5zZXJ2aWNlJztcbmltcG9ydCB7IEFwcFJlc291cmNlTWFuYWdlclNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL2FwcC1yZXNvdXJjZS1tYW5hZ2VyLnNlcnZpY2UnO1xuXG5leHBvcnQgY29uc3Qgcm91dGVyTW9kdWxlID0gUm91dGVyTW9kdWxlLmZvclJvb3Qocm91dGVzLCB7dXNlSGFzaDogdHJ1ZSwgc2Nyb2xsUG9zaXRpb25SZXN0b3JhdGlvbjogJ3RvcCd9KTtcbmV4cG9ydCBjb25zdCB0b2FzdHJNb2R1bGUgPSBUb2FzdHJNb2R1bGUuZm9yUm9vdCh7bWF4T3BlbmVkOiAxLCBhdXRvRGlzbWlzczogdHJ1ZSB9KTtcbmV4cG9ydCBjb25zdCBodHRwQ2xpZW50WHNyZk1vZHVsZSA9IEh0dHBDbGllbnRYc3JmTW9kdWxlLndpdGhPcHRpb25zKHtcbiAgICBjb29raWVOYW1lOiAnd21feHNyZl90b2tlbicsXG4gICAgaGVhZGVyTmFtZTogZ2V0V21Qcm9qZWN0UHJvcGVydGllcygpLnhzcmZfaGVhZGVyX25hbWVcbn0pO1xuXG5ATmdNb2R1bGUoe1xuICAgIGRlY2xhcmF0aW9uczogW1xuICAgICAgICBQYWdlV3JhcHBlckNvbXBvbmVudFxuICAgIF0sXG4gICAgaW1wb3J0czogW1xuICAgICAgICBCcm93c2VyTW9kdWxlLFxuICAgICAgICBDb21tb25Nb2R1bGUsXG4gICAgICAgIFJvdXRlck1vZHVsZSxcbiAgICAgICAgSHR0cENsaWVudE1vZHVsZSxcbiAgICAgICAgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGUsXG5cbiAgICAgICAgcm91dGVyTW9kdWxlLFxuICAgICAgICB0b2FzdHJNb2R1bGUsXG4gICAgICAgIGh0dHBDbGllbnRYc3JmTW9kdWxlLFxuXG4gICAgICAgIFdNX01PRFVMRVNfRk9SX1JPT1RcbiAgICBdLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBBcHBSZXNvdXJjZU1hbmFnZXJTZXJ2aWNlLFxuICAgICAgICB7cHJvdmlkZTogQXBwSlNQcm92aWRlciwgdXNlQ2xhc3M6IEFwcEpTUHJvdmlkZXJTZXJ2aWNlfSxcbiAgICAgICAge3Byb3ZpZGU6IEFwcFZhcmlhYmxlc1Byb3ZpZGVyLCB1c2VDbGFzczogQXBwVmFyaWFibGVzUHJvdmlkZXJTZXJ2aWNlfSxcbiAgICAgICAge3Byb3ZpZGU6IENvbXBvbmVudFJlZlByb3ZpZGVyLCB1c2VDbGFzczogQ29tcG9uZW50UmVmUHJvdmlkZXJTZXJ2aWNlfSxcbiAgICAgICAge3Byb3ZpZGU6IFBhcnRpYWxSZWZQcm92aWRlciwgdXNlQ2xhc3M6IENvbXBvbmVudFJlZlByb3ZpZGVyU2VydmljZX0sXG4gICAgICAgIHtwcm92aWRlOiBQcmVmYWJDb25maWdQcm92aWRlciwgdXNlQ2xhc3M6IFByZWZhYkNvbmZpZ1Byb3ZpZGVyU2VydmljZX1cbiAgICBdLFxuICAgIGJvb3RzdHJhcDogW0FwcENvbXBvbmVudF1cbn0pXG5leHBvcnQgY2xhc3MgQXBwTW9kdWxlIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFwcDogQXBwLCBwcml2YXRlIGluajogSW5qZWN0b3IsIHByaXZhdGUgY29tcG9uZW50UmVmUHJvdmlkZXI6IENvbXBvbmVudFJlZlByb3ZpZGVyKSB7XG4gICAgICAgIGlmICh3aW5kb3dbJ2NvcmRvdmEnXSkge1xuICAgICAgICAgICAgLy8gY2xlYXIgdGhlIGNhY2hlZCB1cmxzIG9uIGxvZ291dCwgdG8gbG9hZCB0aGUgTG9naW4gUGFnZSBhbmQgbm90IHRoZSBNYWluIFBhZ2UgYXMgYXBwIHJlbG9hZCh3aW5kb3cubG9jYXRpb24ucmVsb2FkKSBpcyBub3QgaW52b2tlZCBpbiBtb2JpbGVcbiAgICAgICAgICAgIHRoaXMuYXBwLnN1YnNjcmliZSgndXNlckxvZ2dlZE91dCcsIHRoaXMuY29tcG9uZW50UmVmUHJvdmlkZXIuY2xlYXJDb21wb25lbnRGYWN0b3J5UmVmQ2FjaGUuYmluZCh0aGlzLmNvbXBvbmVudFJlZlByb3ZpZGVyKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=