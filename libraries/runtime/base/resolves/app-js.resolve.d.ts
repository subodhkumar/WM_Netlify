import { Injector } from '@angular/core';
import { Resolve } from '@angular/router';
import { App, UtilsService } from '@wm/core';
import { AppJSProvider } from '../types/types';
export declare class AppJSResolve implements Resolve<any> {
    private inj;
    private app;
    private utilService;
    private appJsProvider;
    constructor(inj: Injector, app: App, utilService: UtilsService, appJsProvider: AppJSProvider);
    resolve(): Promise<boolean>;
}
