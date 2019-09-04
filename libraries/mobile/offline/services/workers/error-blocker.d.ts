import { Change, FlushContext, Worker } from '../change-log.service';
import { LocalDBManagementService } from '../local-db-management.service';
export declare class ErrorBlocker implements Worker {
    private localDBManagementService;
    private errorStore;
    constructor(localDBManagementService: LocalDBManagementService);
    preFlush(context: FlushContext): void;
    preCall(change: Change): Promise<void>;
    postCallSuccess(change: Change): Promise<void>;
    postCallError(change: Change): Promise<void>;
    /**
     * If there is an earlier call of the object or its relations that got failed, then this call will be
     * marked for discard.
     *
     * @param store LocalDBStore
     * @param change change to block
     * @param dataModelName
     * @param entityName
     * @param data
     */
    private blockCall;
    private checkForPreviousError;
    private hasError;
    private removeError;
    private recordError;
}
