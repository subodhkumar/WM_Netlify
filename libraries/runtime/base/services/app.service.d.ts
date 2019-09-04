import { Injector } from '@angular/core';
import { AbstractHttpService, AbstractI18nService } from '@wm/core';
import { SecurityService } from '@wm/security';
export declare class AppRef {
    private inj;
    private i18nService;
    private httpService;
    private securityService;
    Variables: any;
    Actions: any;
    onAppVariablesReady: (...args: any[]) => void;
    onSessionTimeout: (...args: any[]) => void;
    onPageReady: (...args: any[]) => void;
    onBeforePageLeave: (...args: any[]) => void;
    onBeforeServiceCall: (...args: any[]) => void;
    onServiceSuccess: (...args: any[]) => void;
    onServiceError: (...args: any[]) => void;
    dynamicComponentContainerRef: {};
    projectName: string;
    isPrefabType: boolean;
    isApplicationType: boolean;
    isTabletApplicationType: boolean;
    isTemplateBundleType: boolean;
    appLocale: any;
    changeLocale: any;
    getSelectedLocale: any;
    private _eventNotifier;
    landingPageName: string;
    reload(): void;
    constructor(inj: Injector, i18nService: AbstractI18nService, httpService: AbstractHttpService, securityService: SecurityService);
    notify(eventName: string, ...data: Array<any>): void;
    getDependency(injToken: any): any;
    /**
     * triggers the onSessionTimeout callback in app.js
     */
    on401(): void;
    subscribe(eventName: any, callback: (data: any) => void): () => void;
    notifyApp(template: any, type: any, title: any): void;
}
