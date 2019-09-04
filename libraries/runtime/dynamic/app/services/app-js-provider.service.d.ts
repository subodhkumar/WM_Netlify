import { HttpClient } from '@angular/common/http';
import { AppJSProvider } from '@wm/runtime/base';
export declare class AppJSProviderService extends AppJSProvider {
    private $http;
    constructor($http: HttpClient);
    getAppScriptFn(): Promise<Function>;
}
