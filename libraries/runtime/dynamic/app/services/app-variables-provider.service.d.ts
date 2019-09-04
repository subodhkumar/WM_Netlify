import { AppVariablesProvider } from '@wm/runtime/base';
import { AppResourceManagerService } from './app-resource-manager.service';
export declare class AppVariablesProviderService extends AppVariablesProvider {
    private resourceManager;
    constructor(resourceManager: AppResourceManagerService);
    getAppVariables(): Promise<any>;
}
