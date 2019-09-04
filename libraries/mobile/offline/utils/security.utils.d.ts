import { File } from '@ionic-native/file';
import { App } from '@wm/core';
import { DeviceService, NetworkService } from '@wm/mobile/core';
import { SecurityService } from '@wm/security';
export declare class SecurityOfflineBehaviour {
    private app;
    private file;
    private deviceService;
    private networkService;
    private securityService;
    private saveSecurityConfigLocally;
    private securityConfig;
    constructor(app: App, file: File, deviceService: DeviceService, networkService: NetworkService, securityService: SecurityService);
    add(): void;
    private _saveSecurityConfigLocally;
    private clearLastLoggedInUser;
    private readLocalSecurityConfig;
    private readFileAsTxt;
}
