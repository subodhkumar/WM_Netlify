import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { DeviceFileCacheService } from './device-file-cache.service';
import { DeviceFileDownloadService } from './device-file-download.service';
import { DeviceFileService } from './device-file.service';
import { IDeviceStartUpService } from './device-start-up-service';
export declare class DeviceFileOpenerService implements IDeviceStartUpService {
    private cordovaFile;
    private cordovaFileOpener;
    private fileService;
    private cacheService;
    private downloadService;
    serviceName: string;
    private _downloadsFolder;
    constructor(cordovaFile: File, cordovaFileOpener: FileOpener, fileService: DeviceFileService, cacheService: DeviceFileCacheService, downloadService: DeviceFileDownloadService);
    getFileMimeType(filePath: any): Promise<any>;
    openRemoteFile(url: string, extension: string, fileName?: string): Promise<void>;
    start(): Promise<void>;
    private generateFileName;
    private getLocalPath;
}
