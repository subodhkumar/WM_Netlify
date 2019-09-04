import { File } from '@ionic-native/file';
import { DeviceFileService, DeviceFileUploadService, NetworkService } from '@wm/mobile/core';
import { ChangeLogService } from '../services/change-log.service';
export declare class FileUploadOfflineBehaviour {
    private changeLogService;
    private deviceFileService;
    private deviceFileUploadService;
    private file;
    private networkService;
    private uploadDir;
    constructor(changeLogService: ChangeLogService, deviceFileService: DeviceFileService, deviceFileUploadService: DeviceFileUploadService, file: File, networkService: NetworkService, uploadDir: string);
    add(): void;
    uploadLater(url: string, fileParamName: string, localPath: string, fileName?: string, params?: any, headers?: any): Promise<any>;
}
