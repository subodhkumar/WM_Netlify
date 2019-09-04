import { AbstractHttpService } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
import { ChangeLogService } from '../services/change-log.service';
import { LocalDBManagementService } from '../services/local-db-management.service';
export declare class NamedQueryExecutionOfflineBehaviour {
    private changeLogService;
    private httpService;
    private localDBManagementService;
    private networkService;
    constructor(changeLogService: ChangeLogService, httpService: AbstractHttpService, localDBManagementService: LocalDBManagementService, networkService: NetworkService);
    add(): void;
    private executeLocally;
    private substring;
    private getHttpParamMap;
}
