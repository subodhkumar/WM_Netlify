import { File } from '@ionic-native/file';
import { AbstractHttpService, App } from '@wm/core';
import { DeviceFileService, DeviceFileUploadService, DeviceService, NetworkService } from '@wm/mobile/core';
import { SecurityService } from '@wm/security';
import { ChangeLogService } from './services/change-log.service';
import { LocalDBManagementService } from './services/local-db-management.service';
import { LocalDbService } from './services/local-db.service';
export declare class OfflineModule {
    static initialized: boolean;
    static initialize(app: App, changeLogService: ChangeLogService, deviceService: DeviceService, deviceFileService: DeviceFileService, deviceFileUploadService: DeviceFileUploadService, file: File, httpService: AbstractHttpService, localDBManagementService: LocalDBManagementService, localDbService: LocalDbService, networkService: NetworkService, securityService: SecurityService): void;
    constructor(app: App, changeLogService: ChangeLogService, deviceService: DeviceService, deviceFileService: DeviceFileService, deviceFileUploadService: DeviceFileUploadService, file: File, httpService: AbstractHttpService, localDBManagementService: LocalDBManagementService, localDbService: LocalDbService, networkService: NetworkService, securityService: SecurityService);
}
