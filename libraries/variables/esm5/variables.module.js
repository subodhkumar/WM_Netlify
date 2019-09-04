import { NgModule } from '@angular/core';
import { CommonModule, HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { HttpServiceModule } from '@wm/http';
import { SecurityModule } from '@wm/security';
import { OAuthModule } from '@wm/oAuth';
import { VariablesService } from './service/variables.service';
import { MetadataService } from './service/metadata-service/metadata.service';
export var toastrModule = ToastrModule.forRoot({ maxOpened: 1, autoDismiss: true });
var VariablesModule = /** @class */ (function () {
    function VariablesModule() {
    }
    VariablesModule.forRoot = function () {
        return {
            ngModule: VariablesModule,
            providers: [
                VariablesService,
                MetadataService,
                Location,
                { provide: LocationStrategy, useClass: HashLocationStrategy }
            ]
        };
    };
    VariablesModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        CommonModule,
                        toastrModule,
                        HttpClientModule,
                        HttpServiceModule,
                        OAuthModule,
                        SecurityModule
                    ],
                    declarations: []
                },] }
    ];
    return VariablesModule;
}());
export { VariablesModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyaWFibGVzLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJ2YXJpYWJsZXMubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBdUIsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBQyxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDL0YsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFeEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUUxQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDN0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM5QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXhDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUU5RSxNQUFNLENBQUMsSUFBTSxZQUFZLEdBQXdCLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBRXpHO0lBQUE7SUF3QkEsQ0FBQztJQVhVLHVCQUFPLEdBQWQ7UUFDSSxPQUFPO1lBQ0gsUUFBUSxFQUFFLGVBQWU7WUFDekIsU0FBUyxFQUFFO2dCQUNQLGdCQUFnQjtnQkFDaEIsZUFBZTtnQkFDZixRQUFRO2dCQUNSLEVBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBQzthQUM5RDtTQUNKLENBQUM7SUFDTixDQUFDOztnQkF2QkosUUFBUSxTQUFDO29CQUNOLE9BQU8sRUFBRTt3QkFDTCxZQUFZO3dCQUNaLFlBQVk7d0JBQ1osZ0JBQWdCO3dCQUNoQixpQkFBaUI7d0JBQ2pCLFdBQVc7d0JBQ1gsY0FBYztxQkFDakI7b0JBQ0QsWUFBWSxFQUFFLEVBQUU7aUJBQ25COztJQWNELHNCQUFDO0NBQUEsQUF4QkQsSUF3QkM7U0FiWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29tbW9uTW9kdWxlLCBIYXNoTG9jYXRpb25TdHJhdGVneSwgTG9jYXRpb24sIExvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBIdHRwQ2xpZW50TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQgeyBUb2FzdHJNb2R1bGUgfSBmcm9tICduZ3gtdG9hc3RyJztcblxuaW1wb3J0IHsgSHR0cFNlcnZpY2VNb2R1bGUgfSBmcm9tICdAd20vaHR0cCc7XG5pbXBvcnQgeyBTZWN1cml0eU1vZHVsZSB9IGZyb20gJ0B3bS9zZWN1cml0eSc7XG5pbXBvcnQgeyBPQXV0aE1vZHVsZSB9IGZyb20gJ0B3bS9vQXV0aCc7XG5cbmltcG9ydCB7IFZhcmlhYmxlc1NlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2UvdmFyaWFibGVzLnNlcnZpY2UnO1xuaW1wb3J0IHsgTWV0YWRhdGFTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlL21ldGFkYXRhLXNlcnZpY2UvbWV0YWRhdGEuc2VydmljZSc7XG5cbmV4cG9ydCBjb25zdCB0b2FzdHJNb2R1bGU6IE1vZHVsZVdpdGhQcm92aWRlcnMgPSBUb2FzdHJNb2R1bGUuZm9yUm9vdCh7bWF4T3BlbmVkOiAxLCBhdXRvRGlzbWlzczogdHJ1ZX0pO1xuXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtcbiAgICAgICAgQ29tbW9uTW9kdWxlLFxuICAgICAgICB0b2FzdHJNb2R1bGUsXG4gICAgICAgIEh0dHBDbGllbnRNb2R1bGUsXG4gICAgICAgIEh0dHBTZXJ2aWNlTW9kdWxlLFxuICAgICAgICBPQXV0aE1vZHVsZSxcbiAgICAgICAgU2VjdXJpdHlNb2R1bGVcbiAgICBdLFxuICAgIGRlY2xhcmF0aW9uczogW11cbn0pXG5leHBvcnQgY2xhc3MgVmFyaWFibGVzTW9kdWxlIHtcblxuICAgIHN0YXRpYyBmb3JSb290KCk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmdNb2R1bGU6IFZhcmlhYmxlc01vZHVsZSxcbiAgICAgICAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICAgICAgICAgIFZhcmlhYmxlc1NlcnZpY2UsXG4gICAgICAgICAgICAgICAgTWV0YWRhdGFTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIExvY2F0aW9uLFxuICAgICAgICAgICAgICAgIHtwcm92aWRlOiBMb2NhdGlvblN0cmF0ZWd5LCB1c2VDbGFzczogSGFzaExvY2F0aW9uU3RyYXRlZ3l9XG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19