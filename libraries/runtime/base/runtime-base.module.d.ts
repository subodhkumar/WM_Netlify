import { ModuleWithProviders } from '@angular/core';
export declare function InitializeApp(I18nService: any): () => any;
export declare function setAngularLocale(I18nService: any): any;
export declare const carouselModule: ModuleWithProviders<any>;
export declare const bsDropDownModule: ModuleWithProviders<any>;
export declare const popoverModule: ModuleWithProviders<any>;
export declare const tooltipModule: ModuleWithProviders<any>;
export declare class RuntimeBaseModule {
    static addCustomEventPolyfill(): boolean;
    static forRoot(): ModuleWithProviders;
    constructor();
}
export declare const WM_MODULES_FOR_ROOT: ModuleWithProviders<any>[];
