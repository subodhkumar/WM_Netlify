import { File } from '@ionic-native/file';
import { IDeviceStartUpService } from './device-start-up-service';
import { DeviceFileService } from './device-file.service';
import { DeviceFileDownloadService } from './device-file-download.service';
export declare class DeviceFileCacheService implements IDeviceStartUpService {
    private cordovaFile;
    private fileService;
    private downloadService;
    serviceName: string;
    private _cacheIndex;
    private _writing;
    private _saveCache;
    constructor(cordovaFile: File, fileService: DeviceFileService, downloadService: DeviceFileDownloadService);
    addEntry(url: any, filepath: any): void;
    getLocalPath(url: string, downloadIfNotExists: boolean, isPersistent: boolean): Promise<string>;
    invalidateCache(): void;
    start(): Promise<void>;
    private download;
    private writeCacheIndexToFile;
}
