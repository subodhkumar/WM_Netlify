import { App } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
import { FileSelectorService, ProcessManagementService } from '@wm/mobile/components';
import { ChangeLogService, LocalDBManagementService, LocalDBDataPullService } from '@wm/mobile/offline';
import { DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';
import { SecurityService } from '@wm/security';
export declare class DatasyncService extends DeviceVariableService {
    readonly name = "datasync";
    readonly operations: IDeviceVariableOperation[];
    constructor(app: App, changeLogService: ChangeLogService, fileSelectorService: FileSelectorService, localDBManagementService: LocalDBManagementService, localDBDataPullService: LocalDBDataPullService, processManagementService: ProcessManagementService, securityService: SecurityService, networkService: NetworkService);
}
