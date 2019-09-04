import { Resolve } from '@angular/router';
import { AppManagerService } from '../services/app.manager.service';
export declare class SecurityConfigResolve implements Resolve<any> {
    private appManager;
    loaded: boolean;
    constructor(appManager: AppManagerService);
    resolve(): true | Promise<void>;
}
