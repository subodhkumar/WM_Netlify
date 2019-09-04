import { DeviceFileUploadService } from '@wm/mobile/core';
import { Change, PushService } from './change-log.service';
export declare class PushServiceImpl implements PushService {
    private deviceFileUploadService;
    constructor(deviceFileUploadService: DeviceFileUploadService);
    private getPromiseFromObs;
    push(change: Change): Promise<any>;
}
