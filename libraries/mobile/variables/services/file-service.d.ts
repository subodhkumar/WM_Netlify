import { DeviceFileOpenerService, DeviceFileUploadService } from '@wm/mobile/core';
import { DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';
export declare class FileService extends DeviceVariableService {
    name: string;
    operations: IDeviceVariableOperation[];
    constructor(fileOpener: DeviceFileOpenerService, fileUploader: DeviceFileUploadService);
}
