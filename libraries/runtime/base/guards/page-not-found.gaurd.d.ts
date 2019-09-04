import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { App } from '@wm/core';
import { AppManagerService } from '../services/app.manager.service';
export declare class PageNotFoundGaurd implements CanActivate {
    private app;
    private appManager;
    constructor(app: App, appManager: AppManagerService);
    canActivate(route: ActivatedRouteSnapshot): Promise<boolean>;
}
