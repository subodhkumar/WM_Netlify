import { Injector } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientXsrfModule } from '@angular/common/http';
import { App } from '@wm/core';
import { ComponentRefProvider } from '@wm/runtime/base';
export declare const routerModule: import("@angular/core").ModuleWithProviders<RouterModule>;
export declare const toastrModule: import("@angular/core").ModuleWithProviders<any>;
export declare const httpClientXsrfModule: import("@angular/core").ModuleWithProviders<HttpClientXsrfModule>;
export declare class AppModule {
    private app;
    private inj;
    private componentRefProvider;
    constructor(app: App, inj: Injector, componentRefProvider: ComponentRefProvider);
}
