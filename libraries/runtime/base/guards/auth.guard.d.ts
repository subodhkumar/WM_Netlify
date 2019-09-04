import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { SecurityService } from '@wm/security';
import { AppManagerService } from '../services/app.manager.service';
export declare class AuthGuard implements CanActivate {
    private securityService;
    private appManager;
    constructor(securityService: SecurityService, appManager: AppManagerService);
    loadSecurityConfig(): Promise<boolean>;
    isAuthenticated(): Promise<any>;
    canActivate(route: ActivatedRouteSnapshot): Promise<any>;
}
