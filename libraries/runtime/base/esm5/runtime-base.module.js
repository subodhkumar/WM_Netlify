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
    return function () {
        _WM_APP_PROJECT.id = location.href.split('/')[3];
        _WM_APP_PROJECT.cdnUrl = document.querySelector('[name="cdnUrl"]') && document.querySelector('[name="cdnUrl"]').getAttribute('content');
        _WM_APP_PROJECT.ngDest = 'ng-bundle/';
        return I18nService.loadDefaultLocale();
    };
}
export function setAngularLocale(I18nService) {
    return I18nService.isAngularLocaleLoaded() ? I18nService.getSelectedLocale() : I18nService.getDefaultSupportedLocale();
}
var definitions = [
    AccessrolesDirective,
    PartialContainerDirective,
    AppSpinnerComponent,
    CustomToasterComponent,
    PrefabDirective,
    AppComponent,
    PrefabPreviewComponent,
    EmptyPageComponent
];
export var carouselModule = CarouselModule.forRoot();
export var bsDropDownModule = BsDropdownModule.forRoot();
export var popoverModule = PopoverModule.forRoot();
export var tooltipModule = TooltipModule.forRoot();
// setting parseExpr as exprEvaluator for swipeAnimation
$.fn.swipeAnimation.expressionEvaluator = $parseExpr;
var RuntimeBaseModule = /** @class */ (function () {
    function RuntimeBaseModule() {
        RuntimeBaseModule.addCustomEventPolyfill();
    }
    // this polyfill is to add support for CustomEvent in IE11
    RuntimeBaseModule.addCustomEventPolyfill = function () {
        if (typeof window['CustomEvent'] === 'function') {
            return false;
        }
        var CustomEvent = function (event, params) {
            params = params || { bubbles: false, cancelable: false, detail: null };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
        CustomEvent.prototype = window['Event'].prototype;
        window['CustomEvent'] = CustomEvent;
    };
    RuntimeBaseModule.forRoot = function () {
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
    };
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
    RuntimeBaseModule.ctorParameters = function () { return []; };
    return RuntimeBaseModule;
}());
export { RuntimeBaseModule };
export var WM_MODULES_FOR_ROOT = [
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS1iYXNlLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJydW50aW1lLWJhc2UubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxlQUFlLEVBQUUsU0FBUyxFQUF1QixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDeEYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUUzRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTVHLE9BQU8sRUFDSCxlQUFlLEVBQ2YsVUFBVSxFQUNWLG1CQUFtQixFQUNuQix5QkFBeUIsRUFDekIsc0JBQXNCLEVBQ3RCLHNCQUFzQixFQUN0QixHQUFHLEVBQ0gsV0FBVyxFQUNYLFVBQVUsRUFDViwyQkFBMkIsRUFDOUIsTUFBTSxVQUFVLENBQUM7QUFDbEIsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDekQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM5QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDN0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNoRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sV0FB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Z0JBQWdCO3dCQUVoQixjQUFjO3dCQUNkLGdCQUFnQjt3QkFDaEIsYUFBYTt3QkFDYixhQUFhO3dCQUViLFdBQVc7d0JBQ1gsa0JBQWtCO3dCQUNsQixtQkFBbUI7d0JBQ25CLFVBQVU7d0JBQ1YsY0FBYzt3QkFDZCxXQUFXO3dCQUNYLGVBQWU7d0JBQ2YsaUJBQWlCO3FCQUNwQjtvQkFDRCxPQUFPLEVBQUU7d0JBQ0wsV0FBVzt3QkFFWCxZQUFZO3dCQUNaLFdBQVc7d0JBQ1gsbUJBQW1CO3dCQUVuQixXQUFXO3dCQUNYLGNBQWM7d0JBQ2QsZ0JBQWdCO3dCQUNoQixhQUFhO3dCQUNiLGFBQWE7d0JBRWIsa0JBQWtCO3dCQUNsQixtQkFBbUI7d0JBQ25CLFVBQVU7d0JBQ1YsY0FBYzt3QkFDZCxXQUFXO3dCQUNYLGVBQWU7d0JBQ2YsaUJBQWlCO3FCQUNwQjtvQkFDRCxlQUFlLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztpQkFDNUM7Ozs7SUFpRUQsd0JBQUM7Q0FBQSxBQTlHRCxJQThHQztTQWhFWSxpQkFBaUI7QUFrRTlCLE1BQU0sQ0FBQyxJQUFNLG1CQUFtQixHQUFHO0lBQy9CLGtCQUFrQixDQUFDLE9BQU8sRUFBRTtJQUM1QixtQkFBbUIsQ0FBQyxPQUFPLEVBQUU7SUFDN0IsV0FBVyxDQUFDLE9BQU8sRUFBRTtJQUNyQixVQUFVLENBQUMsT0FBTyxFQUFFO0lBQ3BCLGNBQWMsQ0FBQyxPQUFPLEVBQUU7SUFDeEIsV0FBVyxDQUFDLE9BQU8sRUFBRTtJQUNyQixlQUFlLENBQUMsT0FBTyxFQUFFO0lBQ3pCLGlCQUFpQixDQUFDLE9BQU8sRUFBRTtJQUMzQixpQkFBaUIsQ0FBQyxPQUFPLEVBQUU7Q0FDOUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QVBQX0lOSVRJQUxJWkVSLCBMT0NBTEVfSUQsIE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSwgRGF0ZVBpcGUsIERlY2ltYWxQaXBlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IEhUVFBfSU5URVJDRVBUT1JTLCBIdHRwQ2xpZW50TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQgeyBCc0Ryb3Bkb3duTW9kdWxlLCBDYXJvdXNlbE1vZHVsZSwgTW9kYWxNb2R1bGUsIFBvcG92ZXJNb2R1bGUsIFRvb2x0aXBNb2R1bGUgfSBmcm9tICduZ3gtYm9vdHN0cmFwJztcblxuaW1wb3J0IHtcbiAgICBfV01fQVBQX1BST0pFQ1QsXG4gICAgJHBhcnNlRXhwcixcbiAgICBBYnN0cmFjdEkxOG5TZXJ2aWNlLFxuICAgIEFic3RyYWN0TmF2aWdhdGlvblNlcnZpY2UsXG4gICAgQWJzdHJhY3RTcGlubmVyU2VydmljZSxcbiAgICBBYnN0cmFjdFRvYXN0ZXJTZXJ2aWNlLFxuICAgIEFwcCxcbiAgICBBcHBEZWZhdWx0cyxcbiAgICBDb3JlTW9kdWxlLFxuICAgIER5bmFtaWNDb21wb25lbnRSZWZQcm92aWRlclxufSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBXbUNvbXBvbmVudHNNb2R1bGUgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5pbXBvcnQgeyBNb2JpbGVSdW50aW1lTW9kdWxlIH0gZnJvbSAnQHdtL21vYmlsZS9ydW50aW1lJztcbmltcG9ydCB7IFNlY3VyaXR5TW9kdWxlIH0gZnJvbSAnQHdtL3NlY3VyaXR5JztcbmltcG9ydCB7IEh0dHBTZXJ2aWNlTW9kdWxlIH0gZnJvbSAnQHdtL2h0dHAnO1xuaW1wb3J0IHsgVmFyaWFibGVzTW9kdWxlIH0gZnJvbSAnQHdtL3ZhcmlhYmxlcyc7XG5pbXBvcnQgeyBPQXV0aE1vZHVsZSB9IGZyb20gJ0B3bS9vQXV0aCc7XG5cbmltcG9ydCB7IEFjY2Vzc3JvbGVzRGlyZWN0aXZlIH0gZnJvbSAnLi9kaXJlY3RpdmVzL2FjY2Vzc3JvbGVzLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBQYXJ0aWFsQ29udGFpbmVyRGlyZWN0aXZlIH0gZnJvbSAnLi9kaXJlY3RpdmVzL3BhcnRpYWwtY29udGFpbmVyLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBBcHBTcGlubmVyQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL2FwcC1zcGlubmVyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBDdXN0b21Ub2FzdGVyQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL2N1c3RvbS10b2FzdGVyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBFbXB0eVBhZ2VDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvZW1wdHktY29tcG9uZW50L2VtcHR5LXBhZ2UuY29tcG9uZW50JztcbmltcG9ydCB7IFByZWZhYkRpcmVjdGl2ZSB9IGZyb20gJy4vZGlyZWN0aXZlcy9wcmVmYWIuZGlyZWN0aXZlJztcbmltcG9ydCB7IEFwcFJlZiB9IGZyb20gJy4vc2VydmljZXMvYXBwLnNlcnZpY2UnO1xuaW1wb3J0IHsgVG9hc3RlclNlcnZpY2VJbXBsIH0gZnJvbSAnLi9zZXJ2aWNlcy90b2FzdGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgSTE4blNlcnZpY2VJbXBsIH0gZnJvbSAnLi9zZXJ2aWNlcy9pMThuLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3Bpbm5lclNlcnZpY2VJbXBsIH0gZnJvbSAnLi9zZXJ2aWNlcy9zcGlubmVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgTmF2aWdhdGlvblNlcnZpY2VJbXBsIH0gZnJvbSAnLi9zZXJ2aWNlcy9uYXZpZ2F0aW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXBwRGVmYXVsdHNTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9hcHAtZGVmYXVsdHMuc2VydmljZSc7XG5pbXBvcnQgeyBBcHBNYW5hZ2VyU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvYXBwLm1hbmFnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBQcmVmYWJNYW5hZ2VyU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvcHJlZmFiLW1hbmFnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBBdXRoR3VhcmQgfSBmcm9tICcuL2d1YXJkcy9hdXRoLmd1YXJkJztcbmltcG9ydCB7IFJvbGVHdWFyZCB9IGZyb20gJy4vZ3VhcmRzL3JvbGUuZ3VhcmQnO1xuaW1wb3J0IHsgUGFnZU5vdEZvdW5kR2F1cmQgfSBmcm9tICcuL2d1YXJkcy9wYWdlLW5vdC1mb3VuZC5nYXVyZCc7XG5pbXBvcnQgeyBBcHBKU1Jlc29sdmUgfSBmcm9tICcuL3Jlc29sdmVzL2FwcC1qcy5yZXNvbHZlJztcbmltcG9ydCB7IEkxOG5SZXNvbHZlIH0gZnJvbSAnLi9yZXNvbHZlcy9pMThuLnJlc29sdmUnO1xuaW1wb3J0IHsgQXBwQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL2FwcC1jb21wb25lbnQvYXBwLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBIdHRwQ2FsbEludGVyY2VwdG9yIH0gZnJvbSAnLi9zZXJ2aWNlcy9odHRwLWludGVyY2VwdG9yLnNlcnZpY2VzJztcbmltcG9ydCB7IFByZWZhYlByZXZpZXdDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvcHJlZmFiLXByZXZpZXcuY29tcG9uZW50JztcbmltcG9ydCB7IER5bmFtaWNDb21wb25lbnRSZWZQcm92aWRlclNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL2R5bmFtaWMtY29tcG9uZW50LXJlZi1wcm92aWRlci5zZXJ2aWNlJztcbmltcG9ydCB7Q2FuRGVhY3RpdmF0ZVBhZ2VHdWFyZH0gZnJvbSAnLi9ndWFyZHMvY2FuLWRlYWN0aXZhdGUtcGFnZS5ndWFyZCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBJbml0aWFsaXplQXBwKEkxOG5TZXJ2aWNlKSB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgX1dNX0FQUF9QUk9KRUNULmlkID0gbG9jYXRpb24uaHJlZi5zcGxpdCgnLycpWzNdO1xuICAgICAgICBfV01fQVBQX1BST0pFQ1QuY2RuVXJsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW25hbWU9XCJjZG5VcmxcIl0nKSAmJiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbbmFtZT1cImNkblVybFwiXScpLmdldEF0dHJpYnV0ZSgnY29udGVudCcpO1xuICAgICAgICBfV01fQVBQX1BST0pFQ1QubmdEZXN0ID0gJ25nLWJ1bmRsZS8nO1xuICAgICAgICByZXR1cm4gSTE4blNlcnZpY2UubG9hZERlZmF1bHRMb2NhbGUoKTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QW5ndWxhckxvY2FsZShJMThuU2VydmljZSkge1xuICAgIHJldHVybiBJMThuU2VydmljZS5pc0FuZ3VsYXJMb2NhbGVMb2FkZWQoKSA/IEkxOG5TZXJ2aWNlLmdldFNlbGVjdGVkTG9jYWxlKCkgOiBJMThuU2VydmljZS5nZXREZWZhdWx0U3VwcG9ydGVkTG9jYWxlKCk7XG59XG5cbmNvbnN0IGRlZmluaXRpb25zID0gW1xuICAgIEFjY2Vzc3JvbGVzRGlyZWN0aXZlLFxuICAgIFBhcnRpYWxDb250YWluZXJEaXJlY3RpdmUsXG4gICAgQXBwU3Bpbm5lckNvbXBvbmVudCxcbiAgICBDdXN0b21Ub2FzdGVyQ29tcG9uZW50LFxuICAgIFByZWZhYkRpcmVjdGl2ZSxcbiAgICBBcHBDb21wb25lbnQsXG4gICAgUHJlZmFiUHJldmlld0NvbXBvbmVudCxcbiAgICBFbXB0eVBhZ2VDb21wb25lbnRcbl07XG5cbmV4cG9ydCBjb25zdCBjYXJvdXNlbE1vZHVsZSA9IENhcm91c2VsTW9kdWxlLmZvclJvb3QoKTtcbmV4cG9ydCBjb25zdCBic0Ryb3BEb3duTW9kdWxlID0gQnNEcm9wZG93bk1vZHVsZS5mb3JSb290KCk7XG5leHBvcnQgY29uc3QgcG9wb3Zlck1vZHVsZSA9IFBvcG92ZXJNb2R1bGUuZm9yUm9vdCgpO1xuZXhwb3J0IGNvbnN0IHRvb2x0aXBNb2R1bGUgPSBUb29sdGlwTW9kdWxlLmZvclJvb3QoKTtcblxuLy8gc2V0dGluZyBwYXJzZUV4cHIgYXMgZXhwckV2YWx1YXRvciBmb3Igc3dpcGVBbmltYXRpb25cbigkLmZuIGFzIGFueSkuc3dpcGVBbmltYXRpb24uZXhwcmVzc2lvbkV2YWx1YXRvciA9ICRwYXJzZUV4cHI7XG5cbkBOZ01vZHVsZSh7XG4gICAgZGVjbGFyYXRpb25zOiBkZWZpbml0aW9ucyxcbiAgICBpbXBvcnRzOiBbXG4gICAgICAgIENvbW1vbk1vZHVsZSxcbiAgICAgICAgRm9ybXNNb2R1bGUsXG4gICAgICAgIFJvdXRlck1vZHVsZSxcbiAgICAgICAgUmVhY3RpdmVGb3Jtc01vZHVsZSxcbiAgICAgICAgSHR0cENsaWVudE1vZHVsZSxcblxuICAgICAgICBjYXJvdXNlbE1vZHVsZSxcbiAgICAgICAgYnNEcm9wRG93bk1vZHVsZSxcbiAgICAgICAgcG9wb3Zlck1vZHVsZSxcbiAgICAgICAgdG9vbHRpcE1vZHVsZSxcblxuICAgICAgICBNb2RhbE1vZHVsZSxcbiAgICAgICAgV21Db21wb25lbnRzTW9kdWxlLFxuICAgICAgICBNb2JpbGVSdW50aW1lTW9kdWxlLFxuICAgICAgICBDb3JlTW9kdWxlLFxuICAgICAgICBTZWN1cml0eU1vZHVsZSxcbiAgICAgICAgT0F1dGhNb2R1bGUsXG4gICAgICAgIFZhcmlhYmxlc01vZHVsZSxcbiAgICAgICAgSHR0cFNlcnZpY2VNb2R1bGUsXG4gICAgXSxcbiAgICBleHBvcnRzOiBbXG4gICAgICAgIGRlZmluaXRpb25zLFxuXG4gICAgICAgIENvbW1vbk1vZHVsZSxcbiAgICAgICAgRm9ybXNNb2R1bGUsXG4gICAgICAgIFJlYWN0aXZlRm9ybXNNb2R1bGUsXG5cbiAgICAgICAgTW9kYWxNb2R1bGUsXG4gICAgICAgIENhcm91c2VsTW9kdWxlLFxuICAgICAgICBCc0Ryb3Bkb3duTW9kdWxlLFxuICAgICAgICBQb3BvdmVyTW9kdWxlLFxuICAgICAgICBUb29sdGlwTW9kdWxlLFxuXG4gICAgICAgIFdtQ29tcG9uZW50c01vZHVsZSxcbiAgICAgICAgTW9iaWxlUnVudGltZU1vZHVsZSxcbiAgICAgICAgQ29yZU1vZHVsZSxcbiAgICAgICAgU2VjdXJpdHlNb2R1bGUsXG4gICAgICAgIE9BdXRoTW9kdWxlLFxuICAgICAgICBWYXJpYWJsZXNNb2R1bGUsXG4gICAgICAgIEh0dHBTZXJ2aWNlTW9kdWxlXG4gICAgXSxcbiAgICBlbnRyeUNvbXBvbmVudHM6IFtDdXN0b21Ub2FzdGVyQ29tcG9uZW50XVxufSlcbmV4cG9ydCBjbGFzcyBSdW50aW1lQmFzZU1vZHVsZSB7XG5cbiAgICAvLyB0aGlzIHBvbHlmaWxsIGlzIHRvIGFkZCBzdXBwb3J0IGZvciBDdXN0b21FdmVudCBpbiBJRTExXG4gICAgc3RhdGljIGFkZEN1c3RvbUV2ZW50UG9seWZpbGwoKSB7XG4gICAgICAgICAgICBpZiAoIHR5cGVvZiB3aW5kb3dbJ0N1c3RvbUV2ZW50J10gPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBDdXN0b21FdmVudCA9IChldmVudCwgcGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgcGFyYW1zID0gcGFyYW1zIHx8IHsgYnViYmxlczogZmFsc2UsIGNhbmNlbGFibGU6IGZhbHNlLCBkZXRhaWw6IG51bGwgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCggJ0N1c3RvbUV2ZW50JyApO1xuICAgICAgICAgICAgICAgIGV2dC5pbml0Q3VzdG9tRXZlbnQoIGV2ZW50LCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXZ0O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgQ3VzdG9tRXZlbnQucHJvdG90eXBlID0gd2luZG93WydFdmVudCddLnByb3RvdHlwZTtcblxuICAgICAgICAgICAgd2luZG93WydDdXN0b21FdmVudCddID0gQ3VzdG9tRXZlbnQ7XG4gICAgfVxuXG4gICAgc3RhdGljIGZvclJvb3QoKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuZ01vZHVsZTogUnVudGltZUJhc2VNb2R1bGUsXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgICAgICAgICB7cHJvdmlkZTogQXBwLCB1c2VDbGFzczogQXBwUmVmfSxcbiAgICAgICAgICAgICAgICB7cHJvdmlkZTogQWJzdHJhY3RUb2FzdGVyU2VydmljZSwgdXNlQ2xhc3M6IFRvYXN0ZXJTZXJ2aWNlSW1wbH0sXG4gICAgICAgICAgICAgICAge3Byb3ZpZGU6IEFic3RyYWN0STE4blNlcnZpY2UsIHVzZUNsYXNzOiBJMThuU2VydmljZUltcGx9LFxuICAgICAgICAgICAgICAgIHtwcm92aWRlOiBBYnN0cmFjdFNwaW5uZXJTZXJ2aWNlLCB1c2VDbGFzczogU3Bpbm5lclNlcnZpY2VJbXBsfSxcbiAgICAgICAgICAgICAgICB7cHJvdmlkZTogQWJzdHJhY3ROYXZpZ2F0aW9uU2VydmljZSwgdXNlQ2xhc3M6IE5hdmlnYXRpb25TZXJ2aWNlSW1wbH0sXG4gICAgICAgICAgICAgICAge3Byb3ZpZGU6IEFwcERlZmF1bHRzLCB1c2VDbGFzczogQXBwRGVmYXVsdHNTZXJ2aWNlfSxcbiAgICAgICAgICAgICAgICB7cHJvdmlkZTogRHluYW1pY0NvbXBvbmVudFJlZlByb3ZpZGVyLCB1c2VDbGFzczogRHluYW1pY0NvbXBvbmVudFJlZlByb3ZpZGVyU2VydmljZX0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBwcm92aWRlOiBBUFBfSU5JVElBTElaRVIsXG4gICAgICAgICAgICAgICAgICAgIHVzZUZhY3Rvcnk6IEluaXRpYWxpemVBcHAsXG4gICAgICAgICAgICAgICAgICAgIGRlcHM6IFtBYnN0cmFjdEkxOG5TZXJ2aWNlXSxcbiAgICAgICAgICAgICAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvdmlkZTogTE9DQUxFX0lELFxuICAgICAgICAgICAgICAgICAgICB1c2VGYWN0b3J5OiBzZXRBbmd1bGFyTG9jYWxlLFxuICAgICAgICAgICAgICAgICAgICBkZXBzOiBbQWJzdHJhY3RJMThuU2VydmljZV1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvdmlkZTogSFRUUF9JTlRFUkNFUFRPUlMsXG4gICAgICAgICAgICAgICAgICAgIHVzZUNsYXNzOiBIdHRwQ2FsbEludGVyY2VwdG9yLFxuICAgICAgICAgICAgICAgICAgICBtdWx0aTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRGVjaW1hbFBpcGUsXG4gICAgICAgICAgICAgICAgRGF0ZVBpcGUsXG4gICAgICAgICAgICAgICAgQXBwTWFuYWdlclNlcnZpY2UsXG4gICAgICAgICAgICAgICAgUHJlZmFiTWFuYWdlclNlcnZpY2UsXG4gICAgICAgICAgICAgICAgQXV0aEd1YXJkLFxuICAgICAgICAgICAgICAgIFJvbGVHdWFyZCxcbiAgICAgICAgICAgICAgICBQYWdlTm90Rm91bmRHYXVyZCxcbiAgICAgICAgICAgICAgICBDYW5EZWFjdGl2YXRlUGFnZUd1YXJkLFxuICAgICAgICAgICAgICAgIEFwcEpTUmVzb2x2ZSxcbiAgICAgICAgICAgICAgICBJMThuUmVzb2x2ZVxuICAgICAgICAgICAgXVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBSdW50aW1lQmFzZU1vZHVsZS5hZGRDdXN0b21FdmVudFBvbHlmaWxsKCk7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgV01fTU9EVUxFU19GT1JfUk9PVCA9IFtcbiAgICBXbUNvbXBvbmVudHNNb2R1bGUuZm9yUm9vdCgpLFxuICAgIE1vYmlsZVJ1bnRpbWVNb2R1bGUuZm9yUm9vdCgpLFxuICAgIE1vZGFsTW9kdWxlLmZvclJvb3QoKSxcbiAgICBDb3JlTW9kdWxlLmZvclJvb3QoKSxcbiAgICBTZWN1cml0eU1vZHVsZS5mb3JSb290KCksXG4gICAgT0F1dGhNb2R1bGUuZm9yUm9vdCgpLFxuICAgIFZhcmlhYmxlc01vZHVsZS5mb3JSb290KCksXG4gICAgSHR0cFNlcnZpY2VNb2R1bGUuZm9yUm9vdCgpLFxuICAgIFJ1bnRpbWVCYXNlTW9kdWxlLmZvclJvb3QoKVxuXTtcbiJdfQ==