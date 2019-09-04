import { MetadataService } from '@wm/variables';
import { PrefabConfigProvider } from '../types/types';
export declare class PrefabManagerService {
    private $metadata;
    private prefabConfigProvider;
    constructor($metadata: MetadataService, prefabConfigProvider: PrefabConfigProvider);
    getConfig(prefabName: any): Promise<any>;
    loadServiceDefs(prefabName: any): Promise<any>;
    protected loadStyles(prefabName: any, { resources: { styles } }?: {
        resources: {
            styles: any[];
        };
    }): Promise<void>;
    protected loadScripts(prefabName: any, { resources: { scripts } }?: {
        resources: {
            scripts: any[];
        };
    }): Promise<any>;
    private setInProgress;
    private resolveInProgress;
    loadDependencies(prefabName: any): Promise<void>;
}
