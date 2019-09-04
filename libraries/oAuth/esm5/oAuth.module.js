import { NgModule } from '@angular/core';
import { OAuthService } from './oAuth.service';
var OAuthModule = /** @class */ (function () {
    function OAuthModule() {
    }
    OAuthModule.forRoot = function () {
        return {
            ngModule: OAuthModule,
            providers: [OAuthService]
        };
    };
    OAuthModule.decorators = [
        { type: NgModule, args: [{},] }
    ];
    return OAuthModule;
}());
export { OAuthModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib0F1dGgubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL29BdXRoLyIsInNvdXJjZXMiOlsib0F1dGgubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBdUIsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQztJQUFBO0lBU0EsQ0FBQztJQU5VLG1CQUFPLEdBQWQ7UUFDSSxPQUFPO1lBQ0gsUUFBUSxFQUFFLFdBQVc7WUFDckIsU0FBUyxFQUFFLENBQUMsWUFBWSxDQUFDO1NBQzVCLENBQUM7SUFDTixDQUFDOztnQkFSSixRQUFRLFNBQUMsRUFBRTs7SUFTWixrQkFBQztDQUFBLEFBVEQsSUFTQztTQVJZLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBPQXV0aFNlcnZpY2UgfSBmcm9tICcuL29BdXRoLnNlcnZpY2UnO1xuXG5ATmdNb2R1bGUoe30pXG5leHBvcnQgY2xhc3MgT0F1dGhNb2R1bGUge1xuXG4gICAgc3RhdGljIGZvclJvb3QoKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuZ01vZHVsZTogT0F1dGhNb2R1bGUsXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtPQXV0aFNlcnZpY2VdXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19