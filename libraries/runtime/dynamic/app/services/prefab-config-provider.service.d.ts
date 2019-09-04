import { PrefabConfigProvider } from '@wm/runtime/base';
import { AppResourceManagerService } from './app-resource-manager.service';
export declare class PrefabConfigProviderService extends PrefabConfigProvider {
    private resourceMngr;
    constructor(resourceMngr: AppResourceManagerService);
    getConfig(prefabName: string): Promise<any>;
}
