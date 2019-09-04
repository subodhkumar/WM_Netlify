import { ModuleWithProviders } from '@angular/core';
import { App, AbstractHttpService } from '@wm/core';
import { DeviceFileOpenerService, DeviceService, ExtAppMessageService, NetworkService } from '@wm/mobile/core';
import { SecurityService } from '@wm/security';
import { CookieService } from './services/cookie.service';
import { WebProcessService } from './services/webprocess.service';
export declare const MAX_WAIT_TIME_4_OAUTH_MESSAGE = 60000;
export declare class MobileRuntimeModule {
    private app;
    private cookieService;
    private deviceFileOpenerService;
    private deviceService;
    private securityService;
    private httpService;
    private extAppMessageService;
    private networkService;
    private webProcessService;
    static forRoot(): ModuleWithProviders;
    private static initialized;
    private static initializeRuntime;
    private _$appEl;
    constructor(app: App, cookieService: CookieService, deviceFileOpenerService: DeviceFileOpenerService, deviceService: DeviceService, securityService: SecurityService, httpService: AbstractHttpService, extAppMessageService: ExtAppMessageService, networkService: NetworkService, webProcessService: WebProcessService);
    private exposeOAuthService;
    private applyOSTheme;
    private handleKeyBoardClass;
    private getDeployedUrl;
    private getDeviceOS;
    private addAuthInBrowser;
}
