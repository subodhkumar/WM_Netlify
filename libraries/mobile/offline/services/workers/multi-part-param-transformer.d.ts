import { DeviceFileService } from '@wm/mobile/core';
import { Change, Worker } from '../change-log.service';
import { LocalDBManagementService } from '../local-db-management.service';
export declare class MultiPartParamTransformer implements Worker {
    private deviceFileService;
    private localDBManagementService;
    constructor(deviceFileService: DeviceFileService, localDBManagementService: LocalDBManagementService);
    postCallSuccess(change: Change): void;
    transformParamsFromMap(change: Change): Promise<void>;
    transformParamsToMap(change: Change): Promise<{}>;
}
