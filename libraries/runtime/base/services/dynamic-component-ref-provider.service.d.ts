import { Compiler } from '@angular/core';
import { App } from '@wm/core';
import { AppManagerService } from './app.manager.service';
export declare class DynamicComponentRefProviderService {
    private app;
    private appManager;
    private compiler;
    private counter;
    constructor(app: App, appManager: AppManagerService, compiler: Compiler);
    getComponentFactoryRef(selector: string, markup: string, options?: any): Promise<any>;
    /**
     * Creates the component dynamically and add it to the DOM
     * @param target: HTML element where we need to append the created component
     * @param markup: Template of the component
     * @param context: Scope of the component
     * @param options: We have options like
                       selector: selector of the component
                       transpile: flag for transpiling HTML. By default it is true
                       nocache: flag for render it from cache or not. By default it is true
     */
    addComponent(target: HTMLElement, markup: string, context?: {}, options?: any): Promise<void>;
}
