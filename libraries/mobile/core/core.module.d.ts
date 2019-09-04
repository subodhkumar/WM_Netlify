import { DeviceFileCacheService } from './services/device-file-cache.service';
import { DeviceFileOpenerService } from './services/device-file-opener.service';
import { DeviceFileService } from './services/device-file.service';
import { DeviceService } from './services/device.service';
import { NetworkService } from './services/network.service';
export declare class MobileCoreModule {
    static initialized: boolean;
    static addStartupServices(deviceService: DeviceService, deviceFileService: DeviceFileService, fileCacheService: DeviceFileCacheService, fileOpener: DeviceFileOpenerService, networkService: NetworkService): void;
    constructor(deviceService: DeviceService, deviceFileService: DeviceFileService, fileCacheService: DeviceFileCacheService, fileOpener: DeviceFileOpenerService, networkService: NetworkService);
}
