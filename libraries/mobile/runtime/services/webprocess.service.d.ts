import { App, AbstractHttpService } from '@wm/core';
import { ExtAppMessageService } from '@wm/mobile/core';
import { CookieService } from './cookie.service';
export declare class WebProcessService {
    private app;
    private cookieService;
    private httpService;
    private extAppMessageService;
    constructor(app: App, cookieService: CookieService, httpService: AbstractHttpService, extAppMessageService: ExtAppMessageService);
    execute(process: string, hookUrl: string, useSystemBrowser?: boolean): Promise<any>;
    private executeWithSystemBrowser;
    private executeWithInAppBrowser;
    private getScriptToInject;
}
