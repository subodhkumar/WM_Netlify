import { NgModule } from '@angular/core';
import { SecurityService } from './security.service';
export class SecurityModule {
    static forRoot() {
        return {
            ngModule: SecurityModule,
            providers: [SecurityService]
        };
    }
}
SecurityModule.decorators = [
    { type: NgModule, args: [{},] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHkubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3NlY3VyaXR5LyIsInNvdXJjZXMiOlsic2VjdXJpdHkubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBdUIsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTlELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUdyRCxNQUFNLE9BQU8sY0FBYztJQUN2QixNQUFNLENBQUMsT0FBTztRQUNWLE9BQU87WUFDSCxRQUFRLEVBQUUsY0FBYztZQUN4QixTQUFTLEVBQUUsQ0FBQyxlQUFlLENBQUM7U0FDL0IsQ0FBQztJQUNOLENBQUM7OztZQVBKLFFBQVEsU0FBQyxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgU2VjdXJpdHlTZXJ2aWNlIH0gZnJvbSAnLi9zZWN1cml0eS5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKHt9KVxuZXhwb3J0IGNsYXNzIFNlY3VyaXR5TW9kdWxlIHtcbiAgICBzdGF0aWMgZm9yUm9vdCgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5nTW9kdWxlOiBTZWN1cml0eU1vZHVsZSxcbiAgICAgICAgICAgIHByb3ZpZGVyczogW1NlY3VyaXR5U2VydmljZV1cbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=