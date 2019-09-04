import { Observer } from 'rxjs/Observer';
import { App } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
import { LocalDBManagementService } from './local-db-management.service';
import { PullInfo } from './change-log.service';
import { LocalKeyValueService } from './local-key-value.service';
/**
 * LocalDBDataPullService has API to pull data from remote Server to local Database.
 */
export declare class LocalDBDataPullService {
    private app;
    private localDBManagementService;
    private localKeyValueService;
    private networkService;
    constructor(app: App, localDBManagementService: LocalDBManagementService, localKeyValueService: LocalKeyValueService, networkService: NetworkService);
    /**
     * If deltaFieldName is set,last pull time is greater than zero and query used in last pull is same as the
     * query for the current pull, then delta criteria is attached to the query.
     *
     * @param db
     * @param entityName
     * @param query
     * @returns {any}
     */
    private addDeltaCriteria;
    /**
     * copies the data from remote db to local db
     * @param {DBInfo} db
     * @param {string} entityName
     * @param {boolean} clearDataBeforePull
     * @param pullPromise
     * @param {Observer<any>} progressObserver
     * @returns {Promise<any>}
     */
    private copyDataFromRemoteDBToLocalDB;
    private evalIfBind;
    /**
     * Executes DatabaseService.countTableDataWithQuery as a promise API.
     * @param params
     * @returns Promise
     */
    private executeDatabaseCountQuery;
    /**
     * Executes DatabaseService.searchTableDataWithQuery as a promise API.
     * @param params
     * @returns Promise
     */
    private executeDatabaseSearchQuery;
    /**
     * Computes the maximum number of records to pull.
     *
     * @param db
     * @param entitySchema
     * @param filter
     * @param pullPromise
     * @returns {*}
     */
    private getTotalRecordsToPull;
    private prepareQuery;
    /**
     *
     * @param db
     * @param clearDataBeforePull
     * @param pullPromise
     * @param progressObserver
     * @returns {*}
     */
    private _pullDbData;
    /**
     * Pulls data of the given entity from remote server.
     * @param db
     * @param entityName
     * @param sort
     * @param maxNoOfPages
     * @param pageSize
     * @param currentPage
     * @param filter
     * @param pullPromise
     * @param promise
     * @returns {*}
     */
    private _pullEntityData;
    /**
     * If fn fails and network is not there
     * @param fn
     * @param pullPromise
     * @returns {*}
     */
    private retryIfNetworkFails;
    /**
     * Tries to cancel the corresponding pull process that gave the given promise.
     * @param promise
     * @returns {any}
     */
    cancel(promise: Promise<any>): Promise<string | PullInfo>;
    /**
     * fetches the database from the dbName.
     * @param dbName
     * @returns {Promise<any>}
     */
    getDb(dbName: string): Promise<any>;
    /**
     * @returns {any} that has total no of records fetched, start and end timestamps of last successful pull
     * of data from remote server.
     */
    getLastPullInfo(): Promise<PullInfo>;
    /**
     * Clears (based on parameter) and pulls data ('BUNDLED' data based on parameter) from server using the
     * configured rules in offline configuration.
     *
     * @param clearDataBeforePull boolean
     * @param {Observer<any>} progressObserver
     * @returns {any}
     */
    pullAllDbData(clearDataBeforePull: boolean, progressObserver: Observer<any>): Promise<PullInfo>;
    /**
     * Clears (based on parameter) and pulls data ('BUNDLED' data based on parameter) of the given database from server using
     * the configured rules in offline configuration.
     *
     * @param {string} databaseName
     * @param {boolean} clearDataBeforePull
     * @param {Observer<any>} progressObserver
     * @returns {Promise}
     */
    pullDbData(databaseName: string, clearDataBeforePull: boolean, progressObserver: Observer<any>): Promise<any>;
    /**
     * Clears (based on parameter) and pulls data of the given entity and database from
     * server using the configured rules in offline configuration.
     * @param databaseName, name of the database from which data has to be pulled.
     * @param entityName, name of the entity from which data has to be pulled
     * @param clearDataBeforePull, if set to true, then data of the entity will be deleted.
     * @param progressObserver, observer the progress values
     */
    pullEntityData(databaseName: string, entityName: string, clearDataBeforePull: boolean, progressObserver: Observer<any>): Promise<any>;
}
