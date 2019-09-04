import { NgModule } from '@angular/core';
import { OAuthService } from './oAuth.service';
export class OAuthModule {
    static forRoot() {
        return {
            ngModule: OAuthModule,
            providers: [OAuthService]
        };
    }
}
OAuthModule.decorators = [
    { type: NgModule, args: [{},] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib0F1dGgubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL29BdXRoLyIsInNvdXJjZXMiOlsib0F1dGgubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBdUIsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUcvQyxNQUFNLE9BQU8sV0FBVztJQUVwQixNQUFNLENBQUMsT0FBTztRQUNWLE9BQU87WUFDSCxRQUFRLEVBQUUsV0FBVztZQUNyQixTQUFTLEVBQUUsQ0FBQyxZQUFZLENBQUM7U0FDNUIsQ0FBQztJQUNOLENBQUM7OztZQVJKLFFBQVEsU0FBQyxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgT0F1dGhTZXJ2aWNlIH0gZnJvbSAnLi9vQXV0aC5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKHt9KVxuZXhwb3J0IGNsYXNzIE9BdXRoTW9kdWxlIHtcblxuICAgIHN0YXRpYyBmb3JSb290KCk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmdNb2R1bGU6IE9BdXRoTW9kdWxlLFxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbT0F1dGhTZXJ2aWNlXVxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==