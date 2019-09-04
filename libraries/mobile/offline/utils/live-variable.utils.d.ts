import { NetworkService } from '@wm/mobile/core';
import { AbstractHttpService } from '@wm/core';
import { LocalDBStore } from '../models/local-db-store';
import { ChangeLogService } from '../services/change-log.service';
import { LocalDBManagementService } from '../services/local-db-management.service';
import { LocalDbService } from '../services/local-db.service';
export declare class LiveVariableOfflineBehaviour {
    private changeLogService;
    private httpService;
    private localDBManagementService;
    private networkService;
    private offlineDBService;
    private onlineDBService;
    constructor(changeLogService: ChangeLogService, httpService: AbstractHttpService, localDBManagementService: LocalDBManagementService, networkService: NetworkService, offlineDBService: LocalDbService);
    add(): void;
    getStore(params: any): Promise<LocalDBStore>;
    private hasBlob;
    private localDBcall;
    private remoteDBcall;
    /**
     * Finds out the nested objects to save and prepares a cloned params.
     */
    private prepareToCascade;
}
