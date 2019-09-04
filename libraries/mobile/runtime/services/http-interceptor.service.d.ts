import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { File } from '@ionic-native/file';
import { Observable } from 'rxjs';
import { App } from '@wm/core';
import { DeviceFileDownloadService, DeviceService, NetworkService } from '@wm/mobile/core';
import { SecurityService } from '@wm/security';
export declare class MobileHttpInterceptor implements HttpInterceptor {
    private app;
    private deviceService;
    private networkService;
    private requestInterceptors;
    constructor(app: App, file: File, deviceFileDownloadService: DeviceFileDownloadService, deviceService: DeviceService, networkService: NetworkService, securityService: SecurityService);
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
    private getInterceptors;
    private onHttpError;
}
