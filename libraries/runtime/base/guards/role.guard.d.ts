import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { AbstractToasterService, App } from '@wm/core';
import { SecurityService } from '@wm/security';
import { AuthGuard } from './auth.guard';
import { AppManagerService } from '../services/app.manager.service';
export declare class RoleGuard implements CanActivate {
    private securityService;
    private authGuard;
    private toasterService;
    private app;
    private appManager;
    constructor(securityService: SecurityService, authGuard: AuthGuard, toasterService: AbstractToasterService, app: App, appManager: AppManagerService);
    canActivate(route: ActivatedRouteSnapshot): Promise<boolean>;
}
