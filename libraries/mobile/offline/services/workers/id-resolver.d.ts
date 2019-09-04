import { Change, FlushContext, Worker } from './../change-log.service';
import { LocalDBManagementService } from './../local-db-management.service';
/**
 * In offline database, a insert could generate the Id of an entity. During flush, id of that entity might get changed.
 * Due to that, relationship inconsistency arises. To prevent that, wherever this entity is referred in the next flush
 * call, Id has to be replaced with that of new one.
 */
export declare class IdResolver implements Worker {
    private localDBManagementService;
    private idStore;
    private logger;
    private transactionLocalId;
    constructor(localDBManagementService: LocalDBManagementService);
    preFlush(context: FlushContext): void;
    preCall(change: Change): Promise<any>;
    postCallSuccess(change: Change, response: any): Promise<any>;
    postCallError(change: Change): Promise<void>;
    private getEntityIdStore;
    private pushIdToStore;
    private logResolution;
    private exchangeId;
    private exchangeIds;
}
