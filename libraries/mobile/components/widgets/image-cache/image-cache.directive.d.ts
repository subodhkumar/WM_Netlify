import { DoCheck } from '@angular/core';
import { DeviceFileCacheService } from '@wm/mobile/core';
export declare class ImageCacheDirective implements DoCheck {
    private componentInstance;
    private deviceFileCacheService;
    private _cacheUrl;
    private _isEnabled;
    private _lastUrl;
    constructor(componentInstance: any, deviceFileCacheService: DeviceFileCacheService);
    ngDoCheck(): void;
    wmImageCache: string;
    private getLocalPath;
}
