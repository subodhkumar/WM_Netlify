import { Observer } from 'rxjs/index';
import { NetworkService } from '@wm/mobile/core';
import { LocalDBManagementService } from './local-db-management.service';
import { LocalKeyValueService } from './local-key-value.service';
import { LocalDBStore } from '../models/local-db-store';
export interface Change {
    id?: number;
    errorMessage?: string;
    hasError: number;
    operation: string;
    params: any;
    service: string;
}
export interface FlushContext {
    clear: () => Promise<any>;
    get: (key: string) => any;
    save: () => Promise<any>;
}
export interface Worker {
    onAddCall?: (change: Change) => (Promise<any> | void);
    preFlush?: (context: FlushContext) => (Promise<any> | void);
    postFlush?: (pushInfo: PushInfo, context: FlushContext) => (Promise<any> | void);
    preCall?: (change: Change) => (Promise<any> | void);
    postCallError?: (change: Change, error: any) => (Promise<any> | void);
    postCallSuccess?: (change: Change, response: any) => (Promise<any> | void);
    transformParamsToMap?: (change: Change) => (Promise<any> | void);
    transformParamsFromMap?: (change: Change) => (Promise<any> | void);
}
export interface PullInfo {
    databases: Array<any>;
    totalRecordsToPull: number;
    totalPulledRecordCount: number;
    startTime: Date;
    endTime: Date;
}
export interface PushInfo {
    completedTaskCount: number;
    endTime: Date;
    failedTaskCount: number;
    inProgress: boolean;
    startTime: Date;
    successfulTaskCount: number;
    totalTaskCount: number;
}
export declare abstract class PushService {
    abstract push(change: Change): Promise<any>;
}
export declare const CONTEXT_KEY = "changeLogService.flushContext";
export declare const LAST_PUSH_INFO_KEY = "changeLogService.lastPushInfo";
export declare class ChangeLogService {
    private localDBManagementService;
    private localKeyValueService;
    private pushService;
    private networkService;
    private workers;
    private flushContext;
    private currentPushInfo;
    private deferredFlush;
    constructor(localDBManagementService: LocalDBManagementService, localKeyValueService: LocalKeyValueService, pushService: PushService, networkService: NetworkService);
    /**
     * adds a service call to the log. Call will be invoked in next flush.
     *
     * @Param {string} name of service (This should be available through $injector)
     * @Param {string} name of method to invoke.
     * @Param {object} params
     */
    add(service: string, operation: string, params: any): Promise<void>;
    addWorker(worker: Worker): void;
    /**
     * Clears the current log.
     */
    clearLog(): Promise<any>;
    /**
     * Flush the current log. If a flush is already running, then the promise of that flush is returned back.
     */
    flush(progressObserver: Observer<PushInfo>): Promise<PushInfo>;
    /**
     * Returns the complete change list
     */
    getChanges(): Promise<any[]>;
    /**
     * @returns {array} an array of changes that failed with error.
     */
    getErrors(): Promise<Change[]>;
    getLastPushInfo(): Promise<PushInfo>;
    /**
     * @returns {number} number of changes that are pending to push.
     */
    getLogLength(): Promise<number>;
    getStore(): Promise<LocalDBStore>;
    /**
     * Returns true, if a flush process is in progress. Otherwise, returns false.
     *
     * @returns {boolean} returns true, if a flush process is in progress. Otherwise, returns false.
     */
    isFlushInProgress(): boolean;
    /**
     * Stops the ongoing flush process.
     *
     * @returns {object} a promise that is resolved when the flush process is stopped.
     */
    stop(): Promise<void>;
    private createContext;
    private _flush;
    private flushChange;
    private getNextChange;
    private getWorkers;
}
