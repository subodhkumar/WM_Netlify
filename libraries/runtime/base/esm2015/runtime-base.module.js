import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BsDropdownModule, CarouselModule, ModalModule, PopoverModule, TooltipModule } from 'ngx-bootstrap';
import { _WM_APP_PROJECT, $parseExpr, AbstractI18nService, AbstractNavigationService, AbstractSpinnerService, AbstractToasterService, App, AppDefaults, CoreModule, DynamicComponentRefProvider } from '@wm/core';
import { WmComponentsModule } from '@wm/components';
import { MobileRuntimeModule } from '@wm/mobile/runtime';
import { SecurityModule } from '@wm/security';
import { HttpServiceModule } from '@wm/http';
import { VariablesModule } from '@wm/variables';
import { OAuthModule } from '@wm/oAuth';
import { AccessrolesDirective } from './directives/accessroles.directive';
import { PartialContainerDirective } from './directives/partial-container.directive';
import { AppSpinnerComponent } from './components/app-spinner.component';
import { CustomToasterComponent } from './components/custom-toaster.component';
import { EmptyPageComponent } from './components/empty-component/empty-page.component';
import { PrefabDirective } from './directives/prefab.directive';
import { AppRef } from './services/app.service';
import { ToasterServiceImpl } from './services/toaster.service';
import { I18nServiceImpl } from './services/i18n.service';
import { SpinnerServiceImpl } from './services/spinner.service';
import { NavigationServiceImpl } from './services/navigation.service';
import { AppDefaultsService } from './services/app-defaults.service';
import { AppManagerService } from './services/app.manager.service';
import { PrefabManagerService } from './services/prefab-manager.service';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { PageNotFoundGaurd } from './guards/page-not-found.gaurd';
import { AppJSResolve } from './resolves/app-js.resolve';
import { I18nResolve } from './resolves/i18n.resolve';
import { AppComponent } from './components/app-component/app.component';
import { HttpCallInterceptor } from './services/http-interceptor.services';
import { PrefabPreviewComponent } from './components/prefab-preview.component';
import { DynamicComponentRefProviderService } from './services/dynamic-component-ref-provider.service';
import { CanDeactivatePageGuard } from './guards/can-deactivate-page.guard';
export function InitializeApp(I18nService) {
    return () => {
        _WM_APP_PROJECT.id = location.href.split('/')[3];
        _WM_APP_PROJECT.cdnUrl = document.querySelector('[name="cdnUrl"]') && document.querySelector('[name="cdnUrl"]').getAttribute('content');
        _WM_APP_PROJECT.ngDest = 'ng-bundle/';
        return I18nService.loadDefaultLocale();
    };
}
export function setAngularLocale(I18nService) {
    return I18nService.isAngularLocaleLoaded() ? I18nService.getSelectedLocale() : I18nService.getDefaultSupportedLocale();
}
const definitions = [
    AccessrolesDirective,
    PartialContainerDirective,
    AppSpinnerComponent,
    CustomToasterComponent,
    PrefabDirective,
    AppComponent,
    PrefabPreviewComponent,
    EmptyPageComponent
];
export const carouselModule = CarouselModule.forRoot();
export const bsDropDownModule = BsDropdownModule.forRoot();
export const popoverModule = PopoverModule.forRoot();
export const tooltipModule = TooltipModule.forRoot();
// setting parseExpr as exprEvaluator for swipeAnimation
$.fn.swipeAnimation.expressionEvaluator = $parseExpr;
export class RuntimeBaseModule {
    constructor() {
        RuntimeBaseModule.addCustomEventPolyfill();
    }
    // this polyfill is to add support for CustomEvent in IE11
    static addCustomEventPolyfill() {
        if (typeof window['CustomEvent'] === 'function') {
            return false;
        }
        const CustomEvent = (event, params) => {
            params = params || { bubbles: false, cancelable: false, detail: null };
            const evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
        CustomEvent.prototype = window['Event'].prototype;
        window['CustomEvent'] = CustomEvent;
    }
    static forRoot() {
        return {
            ngModule: RuntimeBaseModule,
            providers: [
                { provide: App, useClass: AppRef },
                { provide: AbstractToasterService, useClass: ToasterServiceImpl },
                { provide: AbstractI18nService, useClass: I18nServiceImpl },
                { provide: AbstractSpinnerService, useClass: SpinnerServiceImpl },
                { provide: AbstractNavigationService, useClass: NavigationServiceImpl },
                { provide: AppDefaults, useClass: AppDefaultsService },
                { provide: DynamicComponentRefProvider, useClass: DynamicComponentRefProviderService },
                {
                    provide: APP_INITIALIZER,
                    useFactory: InitializeApp,
                    deps: [AbstractI18nService],
                    multi: true
                },
                {
                    provide: LOCALE_ID,
                    useFactory: setAngularLocale,
                    deps: [AbstractI18nService]
                },
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: HttpCallInterceptor,
                    multi: true
                },
                DecimalPipe,
                DatePipe,
                AppManagerService,
                PrefabManagerService,
                AuthGuard,
                RoleGuard,
                PageNotFoundGaurd,
                CanDeactivatePageGuard,
                AppJSResolve,
                I18nResolve
            ]
        };
    }
}
RuntimeBaseModule.decorators = [
    { type: NgModule, args: [{
                declarations: definitions,
                imports: [
                    CommonModule,
                    FormsModule,
                    RouterModule,
                    ReactiveFormsModule,
                    HttpClientModule,
                    carouselModule,
                    bsDropDownModule,
                    popoverModule,
                    tooltipModule,
                    ModalModule,
                    WmComponentsModule,
                    MobileRuntimeModule,
                    CoreModule,
                    SecurityModule,
                    OAuthModule,
                    VariablesModule,
                    HttpServiceModule,
                ],
                exports: [
                    definitions,
                    CommonModule,
                    FormsModule,
                    ReactiveFormsModule,
                    ModalModule,
                    CarouselModule,
                    BsDropdownModule,
                    PopoverModule,
                    TooltipModule,
                    WmComponentsModule,
                    MobileRuntimeModule,
                    CoreModule,
                    SecurityModule,
                    OAuthModule,
                    VariablesModule,
                    HttpServiceModule
                ],
                entryComponents: [CustomToasterComponent]
            },] }
];
/** @nocollapse */
RuntimeBaseModule.ctorParameters = () => [];
export const WM_MODULES_FOR_ROOT = [
    WmComponentsModule.forRoot(),
    MobileRuntimeModule.forRoot(),
    ModalModule.forRoot(),
    CoreModule.forRoot(),
    SecurityModule.forRoot(),
    OAuthModule.forRoot(),
    VariablesModule.forRoot(),
    HttpServiceModule.forRoot(),
    RuntimeBaseModule.forRoot()
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS1iYXNlLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJydW50aW1lLWJhc2UubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxlQUFlLEVBQUUsU0FBUyxFQUF1QixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDeEYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUUzRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTVHLE9BQU8sRUFDSCxlQUFlLEVBQ2YsVUFBVSxFQUNWLG1CQUFtQixFQUNuQix5QkFBeUIsRUFDekIsc0JBQXNCLEVBQ3RCLHNCQUFzQixFQUN0QixHQUFHLEVBQ0gsV0FBVyxFQUNYLFVBQVUsRUFDViwyQkFBMkIsRUFDOUIsTUFBTSxVQUFVLENBQUM7QUFDbEIsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDekQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM5QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDN0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNoRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sV0FB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LFlBQVk7b0JBQ1osV0FBVztvQkFDWCxZQUFZO29CQUNaLG1CQUFtQjtvQkFDbkIsZ0JBQWdCO29CQUVoQixjQUFjO29CQUNkLGdCQUFnQjtvQkFDaEIsYUFBYTtvQkFDYixhQUFhO29CQUViLFdBQVc7b0JBQ1gsa0JBQWtCO29CQUNsQixtQkFBbUI7b0JBQ25CLFVBQVU7b0JBQ1YsY0FBYztvQkFDZCxXQUFXO29CQUNYLGVBQWU7b0JBQ2YsaUJBQWlCO2lCQUNwQjtnQkFDRCxPQUFPLEVBQUU7b0JBQ0wsV0FBVztvQkFFWCxZQUFZO29CQUNaLFdBQVc7b0JBQ1gsbUJBQW1CO29CQUVuQixXQUFXO29CQUNYLGNBQWM7b0JBQ2QsZ0JBQWdCO29CQUNoQixhQUFhO29CQUNiLGFBQWE7b0JBRWIsa0JBQWtCO29CQUNsQixtQkFBbUI7b0JBQ25CLFVBQVU7b0JBQ1YsY0FBYztvQkFDZCxXQUFXO29CQUNYLGVBQWU7b0JBQ2YsaUJBQWlCO2lCQUNwQjtnQkFDRCxlQUFlLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQzthQUM1Qzs7OztBQW1FRCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRztJQUMvQixrQkFBa0IsQ0FBQyxPQUFPLEVBQUU7SUFDNUIsbUJBQW1CLENBQUMsT0FBTyxFQUFFO0lBQzdCLFdBQVcsQ0FBQyxPQUFPLEVBQUU7SUFDckIsVUFBVSxDQUFDLE9BQU8sRUFBRTtJQUNwQixjQUFjLENBQUMsT0FBTyxFQUFFO0lBQ3hCLFdBQVcsQ0FBQyxPQUFPLEVBQUU7SUFDckIsZUFBZSxDQUFDLE9BQU8sRUFBRTtJQUN6QixpQkFBaUIsQ0FBQyxPQUFPLEVBQUU7SUFDM0IsaUJBQWlCLENBQUMsT0FBTyxFQUFFO0NBQzlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FQUF9JTklUSUFMSVpFUiwgTE9DQUxFX0lELCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSb3V0ZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgRm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUsIERhdGVQaXBlLCBEZWNpbWFsUGlwZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBIVFRQX0lOVEVSQ0VQVE9SUywgSHR0cENsaWVudE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuaW1wb3J0IHsgQnNEcm9wZG93bk1vZHVsZSwgQ2Fyb3VzZWxNb2R1bGUsIE1vZGFsTW9kdWxlLCBQb3BvdmVyTW9kdWxlLCBUb29sdGlwTW9kdWxlIH0gZnJvbSAnbmd4LWJvb3RzdHJhcCc7XG5cbmltcG9ydCB7XG4gICAgX1dNX0FQUF9QUk9KRUNULFxuICAgICRwYXJzZUV4cHIsXG4gICAgQWJzdHJhY3RJMThuU2VydmljZSxcbiAgICBBYnN0cmFjdE5hdmlnYXRpb25TZXJ2aWNlLFxuICAgIEFic3RyYWN0U3Bpbm5lclNlcnZpY2UsXG4gICAgQWJzdHJhY3RUb2FzdGVyU2VydmljZSxcbiAgICBBcHAsXG4gICAgQXBwRGVmYXVsdHMsXG4gICAgQ29yZU1vZHVsZSxcbiAgICBEeW5hbWljQ29tcG9uZW50UmVmUHJvdmlkZXJcbn0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgV21Db21wb25lbnRzTW9kdWxlIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuaW1wb3J0IHsgTW9iaWxlUnVudGltZU1vZHVsZSB9IGZyb20gJ0B3bS9tb2JpbGUvcnVudGltZSc7XG5pbXBvcnQgeyBTZWN1cml0eU1vZHVsZSB9IGZyb20gJ0B3bS9zZWN1cml0eSc7XG5pbXBvcnQgeyBIdHRwU2VydmljZU1vZHVsZSB9IGZyb20gJ0B3bS9odHRwJztcbmltcG9ydCB7IFZhcmlhYmxlc01vZHVsZSB9IGZyb20gJ0B3bS92YXJpYWJsZXMnO1xuaW1wb3J0IHsgT0F1dGhNb2R1bGUgfSBmcm9tICdAd20vb0F1dGgnO1xuXG5pbXBvcnQgeyBBY2Nlc3Nyb2xlc0RpcmVjdGl2ZSB9IGZyb20gJy4vZGlyZWN0aXZlcy9hY2Nlc3Nyb2xlcy5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgUGFydGlhbENvbnRhaW5lckRpcmVjdGl2ZSB9IGZyb20gJy4vZGlyZWN0aXZlcy9wYXJ0aWFsLWNvbnRhaW5lci5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgQXBwU3Bpbm5lckNvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9hcHAtc3Bpbm5lci5jb21wb25lbnQnO1xuaW1wb3J0IHsgQ3VzdG9tVG9hc3RlckNvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9jdXN0b20tdG9hc3Rlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgRW1wdHlQYWdlQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL2VtcHR5LWNvbXBvbmVudC9lbXB0eS1wYWdlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQcmVmYWJEaXJlY3RpdmUgfSBmcm9tICcuL2RpcmVjdGl2ZXMvcHJlZmFiLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBBcHBSZWYgfSBmcm9tICcuL3NlcnZpY2VzL2FwcC5zZXJ2aWNlJztcbmltcG9ydCB7IFRvYXN0ZXJTZXJ2aWNlSW1wbCB9IGZyb20gJy4vc2VydmljZXMvdG9hc3Rlci5zZXJ2aWNlJztcbmltcG9ydCB7IEkxOG5TZXJ2aWNlSW1wbCB9IGZyb20gJy4vc2VydmljZXMvaTE4bi5zZXJ2aWNlJztcbmltcG9ydCB7IFNwaW5uZXJTZXJ2aWNlSW1wbCB9IGZyb20gJy4vc2VydmljZXMvc3Bpbm5lci5zZXJ2aWNlJztcbmltcG9ydCB7IE5hdmlnYXRpb25TZXJ2aWNlSW1wbCB9IGZyb20gJy4vc2VydmljZXMvbmF2aWdhdGlvbi5zZXJ2aWNlJztcbmltcG9ydCB7IEFwcERlZmF1bHRzU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvYXBwLWRlZmF1bHRzLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXBwTWFuYWdlclNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL2FwcC5tYW5hZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgUHJlZmFiTWFuYWdlclNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL3ByZWZhYi1tYW5hZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXV0aEd1YXJkIH0gZnJvbSAnLi9ndWFyZHMvYXV0aC5ndWFyZCc7XG5pbXBvcnQgeyBSb2xlR3VhcmQgfSBmcm9tICcuL2d1YXJkcy9yb2xlLmd1YXJkJztcbmltcG9ydCB7IFBhZ2VOb3RGb3VuZEdhdXJkIH0gZnJvbSAnLi9ndWFyZHMvcGFnZS1ub3QtZm91bmQuZ2F1cmQnO1xuaW1wb3J0IHsgQXBwSlNSZXNvbHZlIH0gZnJvbSAnLi9yZXNvbHZlcy9hcHAtanMucmVzb2x2ZSc7XG5pbXBvcnQgeyBJMThuUmVzb2x2ZSB9IGZyb20gJy4vcmVzb2x2ZXMvaTE4bi5yZXNvbHZlJztcbmltcG9ydCB7IEFwcENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9hcHAtY29tcG9uZW50L2FwcC5jb21wb25lbnQnO1xuaW1wb3J0IHsgSHR0cENhbGxJbnRlcmNlcHRvciB9IGZyb20gJy4vc2VydmljZXMvaHR0cC1pbnRlcmNlcHRvci5zZXJ2aWNlcyc7XG5pbXBvcnQgeyBQcmVmYWJQcmV2aWV3Q29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL3ByZWZhYi1wcmV2aWV3LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBEeW5hbWljQ29tcG9uZW50UmVmUHJvdmlkZXJTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9keW5hbWljLWNvbXBvbmVudC1yZWYtcHJvdmlkZXIuc2VydmljZSc7XG5pbXBvcnQge0NhbkRlYWN0aXZhdGVQYWdlR3VhcmR9IGZyb20gJy4vZ3VhcmRzL2Nhbi1kZWFjdGl2YXRlLXBhZ2UuZ3VhcmQnO1xuXG5leHBvcnQgZnVuY3Rpb24gSW5pdGlhbGl6ZUFwcChJMThuU2VydmljZSkge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIF9XTV9BUFBfUFJPSkVDVC5pZCA9IGxvY2F0aW9uLmhyZWYuc3BsaXQoJy8nKVszXTtcbiAgICAgICAgX1dNX0FQUF9QUk9KRUNULmNkblVybCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPVwiY2RuVXJsXCJdJykgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW25hbWU9XCJjZG5VcmxcIl0nKS5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnKTtcbiAgICAgICAgX1dNX0FQUF9QUk9KRUNULm5nRGVzdCA9ICduZy1idW5kbGUvJztcbiAgICAgICAgcmV0dXJuIEkxOG5TZXJ2aWNlLmxvYWREZWZhdWx0TG9jYWxlKCk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEFuZ3VsYXJMb2NhbGUoSTE4blNlcnZpY2UpIHtcbiAgICByZXR1cm4gSTE4blNlcnZpY2UuaXNBbmd1bGFyTG9jYWxlTG9hZGVkKCkgPyBJMThuU2VydmljZS5nZXRTZWxlY3RlZExvY2FsZSgpIDogSTE4blNlcnZpY2UuZ2V0RGVmYXVsdFN1cHBvcnRlZExvY2FsZSgpO1xufVxuXG5jb25zdCBkZWZpbml0aW9ucyA9IFtcbiAgICBBY2Nlc3Nyb2xlc0RpcmVjdGl2ZSxcbiAgICBQYXJ0aWFsQ29udGFpbmVyRGlyZWN0aXZlLFxuICAgIEFwcFNwaW5uZXJDb21wb25lbnQsXG4gICAgQ3VzdG9tVG9hc3RlckNvbXBvbmVudCxcbiAgICBQcmVmYWJEaXJlY3RpdmUsXG4gICAgQXBwQ29tcG9uZW50LFxuICAgIFByZWZhYlByZXZpZXdDb21wb25lbnQsXG4gICAgRW1wdHlQYWdlQ29tcG9uZW50XG5dO1xuXG5leHBvcnQgY29uc3QgY2Fyb3VzZWxNb2R1bGUgPSBDYXJvdXNlbE1vZHVsZS5mb3JSb290KCk7XG5leHBvcnQgY29uc3QgYnNEcm9wRG93bk1vZHVsZSA9IEJzRHJvcGRvd25Nb2R1bGUuZm9yUm9vdCgpO1xuZXhwb3J0IGNvbnN0IHBvcG92ZXJNb2R1bGUgPSBQb3BvdmVyTW9kdWxlLmZvclJvb3QoKTtcbmV4cG9ydCBjb25zdCB0b29sdGlwTW9kdWxlID0gVG9vbHRpcE1vZHVsZS5mb3JSb290KCk7XG5cbi8vIHNldHRpbmcgcGFyc2VFeHByIGFzIGV4cHJFdmFsdWF0b3IgZm9yIHN3aXBlQW5pbWF0aW9uXG4oJC5mbiBhcyBhbnkpLnN3aXBlQW5pbWF0aW9uLmV4cHJlc3Npb25FdmFsdWF0b3IgPSAkcGFyc2VFeHByO1xuXG5ATmdNb2R1bGUoe1xuICAgIGRlY2xhcmF0aW9uczogZGVmaW5pdGlvbnMsXG4gICAgaW1wb3J0czogW1xuICAgICAgICBDb21tb25Nb2R1bGUsXG4gICAgICAgIEZvcm1zTW9kdWxlLFxuICAgICAgICBSb3V0ZXJNb2R1bGUsXG4gICAgICAgIFJlYWN0aXZlRm9ybXNNb2R1bGUsXG4gICAgICAgIEh0dHBDbGllbnRNb2R1bGUsXG5cbiAgICAgICAgY2Fyb3VzZWxNb2R1bGUsXG4gICAgICAgIGJzRHJvcERvd25Nb2R1bGUsXG4gICAgICAgIHBvcG92ZXJNb2R1bGUsXG4gICAgICAgIHRvb2x0aXBNb2R1bGUsXG5cbiAgICAgICAgTW9kYWxNb2R1bGUsXG4gICAgICAgIFdtQ29tcG9uZW50c01vZHVsZSxcbiAgICAgICAgTW9iaWxlUnVudGltZU1vZHVsZSxcbiAgICAgICAgQ29yZU1vZHVsZSxcbiAgICAgICAgU2VjdXJpdHlNb2R1bGUsXG4gICAgICAgIE9BdXRoTW9kdWxlLFxuICAgICAgICBWYXJpYWJsZXNNb2R1bGUsXG4gICAgICAgIEh0dHBTZXJ2aWNlTW9kdWxlLFxuICAgIF0sXG4gICAgZXhwb3J0czogW1xuICAgICAgICBkZWZpbml0aW9ucyxcblxuICAgICAgICBDb21tb25Nb2R1bGUsXG4gICAgICAgIEZvcm1zTW9kdWxlLFxuICAgICAgICBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxuXG4gICAgICAgIE1vZGFsTW9kdWxlLFxuICAgICAgICBDYXJvdXNlbE1vZHVsZSxcbiAgICAgICAgQnNEcm9wZG93bk1vZHVsZSxcbiAgICAgICAgUG9wb3Zlck1vZHVsZSxcbiAgICAgICAgVG9vbHRpcE1vZHVsZSxcblxuICAgICAgICBXbUNvbXBvbmVudHNNb2R1bGUsXG4gICAgICAgIE1vYmlsZVJ1bnRpbWVNb2R1bGUsXG4gICAgICAgIENvcmVNb2R1bGUsXG4gICAgICAgIFNlY3VyaXR5TW9kdWxlLFxuICAgICAgICBPQXV0aE1vZHVsZSxcbiAgICAgICAgVmFyaWFibGVzTW9kdWxlLFxuICAgICAgICBIdHRwU2VydmljZU1vZHVsZVxuICAgIF0sXG4gICAgZW50cnlDb21wb25lbnRzOiBbQ3VzdG9tVG9hc3RlckNvbXBvbmVudF1cbn0pXG5leHBvcnQgY2xhc3MgUnVudGltZUJhc2VNb2R1bGUge1xuXG4gICAgLy8gdGhpcyBwb2x5ZmlsbCBpcyB0byBhZGQgc3VwcG9ydCBmb3IgQ3VzdG9tRXZlbnQgaW4gSUUxMVxuICAgIHN0YXRpYyBhZGRDdXN0b21FdmVudFBvbHlmaWxsKCkge1xuICAgICAgICAgICAgaWYgKCB0eXBlb2Ygd2luZG93WydDdXN0b21FdmVudCddID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgQ3VzdG9tRXZlbnQgPSAoZXZlbnQsIHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcyB8fCB7IGJ1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlOiBmYWxzZSwgZGV0YWlsOiBudWxsIH07XG4gICAgICAgICAgICAgICAgY29uc3QgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoICdDdXN0b21FdmVudCcgKTtcbiAgICAgICAgICAgICAgICBldnQuaW5pdEN1c3RvbUV2ZW50KCBldmVudCwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV2dDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIEN1c3RvbUV2ZW50LnByb3RvdHlwZSA9IHdpbmRvd1snRXZlbnQnXS5wcm90b3R5cGU7XG5cbiAgICAgICAgICAgIHdpbmRvd1snQ3VzdG9tRXZlbnQnXSA9IEN1c3RvbUV2ZW50O1xuICAgIH1cblxuICAgIHN0YXRpYyBmb3JSb290KCk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmdNb2R1bGU6IFJ1bnRpbWVCYXNlTW9kdWxlLFxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgICAgICAgICAge3Byb3ZpZGU6IEFwcCwgdXNlQ2xhc3M6IEFwcFJlZn0sXG4gICAgICAgICAgICAgICAge3Byb3ZpZGU6IEFic3RyYWN0VG9hc3RlclNlcnZpY2UsIHVzZUNsYXNzOiBUb2FzdGVyU2VydmljZUltcGx9LFxuICAgICAgICAgICAgICAgIHtwcm92aWRlOiBBYnN0cmFjdEkxOG5TZXJ2aWNlLCB1c2VDbGFzczogSTE4blNlcnZpY2VJbXBsfSxcbiAgICAgICAgICAgICAgICB7cHJvdmlkZTogQWJzdHJhY3RTcGlubmVyU2VydmljZSwgdXNlQ2xhc3M6IFNwaW5uZXJTZXJ2aWNlSW1wbH0sXG4gICAgICAgICAgICAgICAge3Byb3ZpZGU6IEFic3RyYWN0TmF2aWdhdGlvblNlcnZpY2UsIHVzZUNsYXNzOiBOYXZpZ2F0aW9uU2VydmljZUltcGx9LFxuICAgICAgICAgICAgICAgIHtwcm92aWRlOiBBcHBEZWZhdWx0cywgdXNlQ2xhc3M6IEFwcERlZmF1bHRzU2VydmljZX0sXG4gICAgICAgICAgICAgICAge3Byb3ZpZGU6IER5bmFtaWNDb21wb25lbnRSZWZQcm92aWRlciwgdXNlQ2xhc3M6IER5bmFtaWNDb21wb25lbnRSZWZQcm92aWRlclNlcnZpY2V9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvdmlkZTogQVBQX0lOSVRJQUxJWkVSLFxuICAgICAgICAgICAgICAgICAgICB1c2VGYWN0b3J5OiBJbml0aWFsaXplQXBwLFxuICAgICAgICAgICAgICAgICAgICBkZXBzOiBbQWJzdHJhY3RJMThuU2VydmljZV0sXG4gICAgICAgICAgICAgICAgICAgIG11bHRpOiB0cnVlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGU6IExPQ0FMRV9JRCxcbiAgICAgICAgICAgICAgICAgICAgdXNlRmFjdG9yeTogc2V0QW5ndWxhckxvY2FsZSxcbiAgICAgICAgICAgICAgICAgICAgZGVwczogW0Fic3RyYWN0STE4blNlcnZpY2VdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLFxuICAgICAgICAgICAgICAgICAgICB1c2VDbGFzczogSHR0cENhbGxJbnRlcmNlcHRvcixcbiAgICAgICAgICAgICAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIERlY2ltYWxQaXBlLFxuICAgICAgICAgICAgICAgIERhdGVQaXBlLFxuICAgICAgICAgICAgICAgIEFwcE1hbmFnZXJTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIFByZWZhYk1hbmFnZXJTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIEF1dGhHdWFyZCxcbiAgICAgICAgICAgICAgICBSb2xlR3VhcmQsXG4gICAgICAgICAgICAgICAgUGFnZU5vdEZvdW5kR2F1cmQsXG4gICAgICAgICAgICAgICAgQ2FuRGVhY3RpdmF0ZVBhZ2VHdWFyZCxcbiAgICAgICAgICAgICAgICBBcHBKU1Jlc29sdmUsXG4gICAgICAgICAgICAgICAgSTE4blJlc29sdmVcbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgUnVudGltZUJhc2VNb2R1bGUuYWRkQ3VzdG9tRXZlbnRQb2x5ZmlsbCgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IFdNX01PRFVMRVNfRk9SX1JPT1QgPSBbXG4gICAgV21Db21wb25lbnRzTW9kdWxlLmZvclJvb3QoKSxcbiAgICBNb2JpbGVSdW50aW1lTW9kdWxlLmZvclJvb3QoKSxcbiAgICBNb2RhbE1vZHVsZS5mb3JSb290KCksXG4gICAgQ29yZU1vZHVsZS5mb3JSb290KCksXG4gICAgU2VjdXJpdHlNb2R1bGUuZm9yUm9vdCgpLFxuICAgIE9BdXRoTW9kdWxlLmZvclJvb3QoKSxcbiAgICBWYXJpYWJsZXNNb2R1bGUuZm9yUm9vdCgpLFxuICAgIEh0dHBTZXJ2aWNlTW9kdWxlLmZvclJvb3QoKSxcbiAgICBSdW50aW1lQmFzZU1vZHVsZS5mb3JSb290KClcbl07XG4iXX0=