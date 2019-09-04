import { Resolve } from '@angular/router';
import { AppManagerService } from '../services/app.manager.service';
import { AppVariablesProvider } from '../types/types';
export declare class AppVariablesResolve implements Resolve<any> {
    private appManager;
    private appVariablesProvider;
    constructor(appManager: AppManagerService, appVariablesProvider: AppVariablesProvider);
    resolve(): true | Promise<boolean>;
}
