import { Compiler } from '@angular/core';
import { App } from '@wm/core';
import { AppManagerService, ComponentRefProvider, ComponentType } from '@wm/runtime/base';
import { AppResourceManagerService } from './app-resource-manager.service';
export declare class ComponentRefProviderService extends ComponentRefProvider {
    private resouceMngr;
    private app;
    private appManager;
    private compiler;
    private loadResourcesOfFragment;
    constructor(resouceMngr: AppResourceManagerService, app: App, appManager: AppManagerService, compiler: Compiler);
    getComponentFactoryRef(componentName: string, componentType: ComponentType): Promise<any>;
    clearComponentFactoryRefCache(): void;
}
