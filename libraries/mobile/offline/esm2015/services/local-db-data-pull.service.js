import { Injectable } from '@angular/core';
import { $parseExpr, App, defer, getAbortableDefer, noop } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
import { LiveVariableUtils, LVService } from '@wm/variables';
import { LocalDBManagementService } from './local-db-management.service';
import { LocalKeyValueService } from './local-key-value.service';
import { PullType } from '../models/config';
import * as i0 from "@angular/core";
import * as i1 from "@wm/core";
import * as i2 from "./local-db-management.service";
import * as i3 from "./local-key-value.service";
import * as i4 from "@wm/mobile/core";
const LAST_PULL_INFO_KEY = 'localDBManager.lastPullInfo';
const ɵ0 = () => {
    const promises = {};
    return {
        start: promise => {
            promise.$$pullProcessId = 'PULL_' + _.now();
        },
        add: (pullPromise, promise) => {
            const pullProcessId = pullPromise.$$pullProcessId;
            if (!promises[pullProcessId]) {
                promises[pullProcessId] = [];
            }
            promises[pullProcessId].push(promise);
        },
        remove: (pullPromise, promise) => {
            const pullProcessId = pullPromise.$$pullProcessId;
            _.remove(promises[pullProcessId], promise);
            if (_.isEmpty(promises[pullProcessId])) {
                delete promises[pullProcessId];
            }
        },
        abort: (pullPromise) => {
            const pullProcessId = pullPromise.$$pullProcessId;
            if (promises[pullProcessId]) {
                _.forEach(promises[pullProcessId], function (p) {
                    if (p && p.abort) {
                        p.abort();
                    }
                });
                delete promises[pullProcessId];
            }
            pullPromise.$$isMarkedToAbort = true;
            return pullPromise.catch(function () {
                return 'cancelled';
            });
        }
    };
};
/**
 * a utility api to abort pull process.
 *
 * @type {{start, add, remove, abort}}
 */
const pullProcessManager = (ɵ0)();
/**
 * LocalDBDataPullService has API to pull data from remote Server to local Database.
 */
export class LocalDBDataPullService {
    constructor(app, localDBManagementService, localKeyValueService, networkService) {
        this.app = app;
        this.localDBManagementService = localDBManagementService;
        this.localKeyValueService = localKeyValueService;
        this.networkService = networkService;
        // Listen for db creation. When db is created, then initialize last pull info.
        this.localDBManagementService.registerCallback({
            onDbCreate: (info) => {
                this.localKeyValueService.put(LAST_PULL_INFO_KEY, {
                    databases: [],
                    totalRecordsToPull: 0,
                    totalPulledRecordCount: 0,
                    startTime: new Date(0),
                    endTime: new Date(info.dbSeedCreatedOn)
                });
            }
        });
    }
    /**
     * If deltaFieldName is set,last pull time is greater than zero and query used in last pull is same as the
     * query for the current pull, then delta criteria is attached to the query.
     *
     * @param db
     * @param entityName
     * @param query
     * @returns {any}
     */
    addDeltaCriteria(db, entityName, query) {
        const entitySchema = db.schema.entities[entityName], deltaFieldName = entitySchema.pullConfig.deltaFieldName, deltaField = _.find(entitySchema.columns, { 'fieldName': deltaFieldName }) || {};
        let isBundledEntity;
        if (!_.isEmpty(deltaFieldName)) {
            return this.localDBManagementService.isBundled(db.schema.name, entityName)
                .then(flag => isBundledEntity = flag)
                .then(() => this.getLastPullInfo())
                .then(lastPullInfo => {
                let lastPullTime = (lastPullInfo && lastPullInfo.startTime && lastPullInfo.startTime.getTime());
                const lastPullDBInfo = _.find(lastPullInfo && lastPullInfo.databases, { 'name': db.schema.name }), lastPullEntityInfo = _.find(lastPullDBInfo && lastPullDBInfo.entities, { 'entityName': entityName }) || {};
                if (!lastPullTime && isBundledEntity) {
                    // For bundled entity when there is no last pull, fetch records that got modified after db creation.
                    lastPullTime = (lastPullInfo && lastPullInfo.endTime && lastPullInfo.endTime.getTime());
                    lastPullEntityInfo.query = query;
                }
                if (lastPullEntityInfo.query === query && lastPullTime > 0) {
                    if (_.isEmpty(query)) {
                        query = '';
                    }
                    else {
                        query += ' AND ';
                    }
                    if (deltaField.sqlType === 'datetime') {
                        query += deltaFieldName + ' > wm_dt(\'' + moment(lastPullTime).utc().format('YYYY-MM-DDTHH:mm:ss') + '\')';
                    }
                    else {
                        query += deltaFieldName + ' > wm_ts(\'' + lastPullTime + '\')';
                    }
                }
                return query;
            }, () => Promise.resolve(query));
        }
        return Promise.resolve(query);
    }
    /**
     * copies the data from remote db to local db
     * @param {DBInfo} db
     * @param {string} entityName
     * @param {boolean} clearDataBeforePull
     * @param pullPromise
     * @param {Observer<any>} progressObserver
     * @returns {Promise<any>}
     */
    copyDataFromRemoteDBToLocalDB(db, entityName, clearDataBeforePull, pullPromise, progressObserver) {
        const store = db.stores[entityName], entitySchema = db.schema.entities[entityName], result = {
            entityName: entityName,
            totalRecordsToPull: 0,
            pulledRecordCount: 0
        };
        let inProgress = 0, pullComplete = false, filter;
        return new Promise((resolve, reject) => {
            this.prepareQuery(db, entityName)
                .then(query => {
                result.query = query;
                return this.addDeltaCriteria(db, entityName, query);
            }).then(query => {
                // Clear if clearDataBeforePull is true and delta query is not used
                if (clearDataBeforePull && result.query === query) {
                    return store.clear()
                        .then(() => {
                        return query;
                    });
                }
                return query;
            }).then(query => {
                filter = _.isEmpty(query) ? '' : 'q=' + query;
                return this.getTotalRecordsToPull(db, entitySchema, filter, pullPromise);
            }).then(maxNoOfRecords => {
                const pageSize = entitySchema.pullConfig.size || 100, maxNoOfPages = Math.ceil(maxNoOfRecords / pageSize);
                result.totalRecordsToPull = maxNoOfRecords;
                let sort = entitySchema.pullConfig.orderBy;
                sort = (_.isEmpty(sort) ? '' : sort + ',') + store.primaryKeyName;
                progressObserver.next(result);
                const _progressObserver = { next: data => {
                        inProgress++;
                        data = _.slice(data, 0, result.totalRecordsToPull - result.pulledRecordCount);
                        store.saveAll(data).then(() => {
                            result.pulledRecordCount += data ? data.length : 0;
                            progressObserver.next(result);
                        }).catch(noop)
                            .then(() => {
                            inProgress--;
                            if (inProgress === 0 && pullComplete) {
                                resolve(result);
                            }
                        });
                    }, error: null, complete: null
                };
                return this._pullEntityData(db, entityName, filter, sort, maxNoOfPages, pageSize, 1, pullPromise, undefined, _progressObserver);
            }).then(null, reject)
                .catch(noop)
                .then(() => {
                pullComplete = true;
                if (inProgress === 0) {
                    resolve(result);
                }
            });
        });
    }
    // If expression starts with 'bind:', then expression is evaluated and result is returned.
    evalIfBind(expression) {
        if (_.startsWith(expression, 'bind:')) {
            expression = expression.replace(/\[\$\i\]/g, '[0]');
            return $parseExpr(expression.replace('bind:', ''))(this.app);
        }
        return expression;
    }
    /**
     * Executes DatabaseService.countTableDataWithQuery as a promise API.
     * @param params
     * @returns Promise
     */
    executeDatabaseCountQuery(params) {
        return new Promise((resolve, reject) => {
            LVService.countTableDataWithQuery(params, null, null).subscribe(response => resolve(response.body), reject);
        });
    }
    /**
     * Executes DatabaseService.searchTableDataWithQuery as a promise API.
     * @param params
     * @returns Promise
     */
    executeDatabaseSearchQuery(params) {
        return new Promise((resolve, reject) => {
            return LVService.searchTableDataWithQuery(params, null, null).subscribe(response => resolve(response && response.body && response.body.content), reject);
        });
    }
    /**
     * Computes the maximum number of records to pull.
     *
     * @param db
     * @param entitySchema
     * @param filter
     * @param pullPromise
     * @returns {*}
     */
    getTotalRecordsToPull(db, entitySchema, filter, pullPromise) {
        const params = {
            dataModelName: db.schema.name,
            entityName: entitySchema.entityName,
            data: filter
        };
        return this.retryIfNetworkFails(() => {
            return this.executeDatabaseCountQuery(params).then(function (response) {
                const totalRecordCount = response, maxRecordsToPull = _.parseInt(entitySchema.pullConfig.maxNumberOfRecords);
                if (_.isNaN(maxRecordsToPull) || maxRecordsToPull <= 0 || totalRecordCount < maxRecordsToPull) {
                    return totalRecordCount;
                }
                return maxRecordsToPull;
            });
        }, pullPromise);
    }
    prepareQuery(db, entityName) {
        let query;
        const entitySchema = db.schema.entities[entityName];
        return this.localDBManagementService.isBundled(db.schema.name, entityName)
            .then(isBundledEntity => {
            let hasNullAttributeValue = false;
            if (isBundledEntity || _.isEmpty(entitySchema.pullConfig.query)) {
                query = _.cloneDeep(entitySchema.pullConfig.filter);
                query = _.map(query, v => {
                    v.attributeValue = this.evalIfBind(v.attributeValue);
                    hasNullAttributeValue = hasNullAttributeValue || _.isNil(v.attributeValue);
                    return v;
                });
                if (hasNullAttributeValue) {
                    return Promise.reject('Null criteria values are present');
                }
                query = _.sortBy(query, 'attributeName');
                query = LiveVariableUtils.getSearchQuery(query, ' AND ', true);
            }
            else {
                query = this.evalIfBind(entitySchema.pullConfig.query);
            }
            if (_.isNil(query)) {
                return Promise.resolve(null);
            }
            return Promise.resolve(encodeURIComponent(query));
        });
    }
    /**
     *
     * @param db
     * @param clearDataBeforePull
     * @param pullPromise
     * @param progressObserver
     * @returns {*}
     */
    _pullDbData(db, clearDataBeforePull, pullPromise, progressObserver) {
        const datamodelName = db.schema.name, result = {
            name: db.schema.name,
            entities: [],
            totalRecordsToPull: 0,
            pulledRecordCount: 0,
            completedTaskCount: 0,
            totalTaskCount: 0
        };
        const storePromises = [];
        _.forEach(db.schema.entities, entity => {
            storePromises.push(this.localDBManagementService.getStore(datamodelName, entity.entityName));
        });
        return new Promise((resolve, reject) => {
            Promise.all(storePromises)
                .then((stores) => {
                const entities = [];
                stores.forEach(store => {
                    const pullConfig = store.entitySchema.pullConfig;
                    const pullType = pullConfig.pullType;
                    if (pullType === PullType.APP_START || (pullType === PullType.BUNDLED && pullConfig.deltaFieldName)) {
                        entities.push(store.entitySchema);
                    }
                });
                const pullPromises = _.chain(entities)
                    .map(entity => {
                    const _progressObserver = {
                        next: info => {
                            const i = _.findIndex(result.entities, { 'entityName': info.entityName });
                            if (i >= 0) {
                                result.entities[i] = info;
                            }
                            else {
                                result.entities.push(info);
                            }
                            result.pulledRecordCount = _.reduce(result.entities, function (sum, entityPullInfo) {
                                return sum + entityPullInfo.pulledRecordCount;
                            }, 0);
                            result.totalRecordsToPull = _.reduce(result.entities, function (sum, entityPullInfo) {
                                return sum + entityPullInfo.totalRecordsToPull;
                            }, 0);
                            progressObserver.next(result);
                        }, error: null, complete: null
                    };
                    return this.copyDataFromRemoteDBToLocalDB(db, entity.entityName, clearDataBeforePull, pullPromise, _progressObserver)
                        .then(function (info) {
                        result.completedTaskCount++;
                        progressObserver.next(result);
                        return info;
                    }, null);
                }).value();
                result.totalTaskCount = pullPromises.length;
                progressObserver.next(result);
                Promise.all(pullPromises).then(resolve, reject);
            });
        });
    }
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
    _pullEntityData(db, entityName, filter, sort, maxNoOfPages, pageSize, currentPage, pullPromise, deferred, progressObserver) {
        const dataModelName = db.schema.name;
        if (!deferred) {
            deferred = defer();
        }
        if (currentPage > maxNoOfPages) {
            return deferred.resolve();
        }
        const params = {
            dataModelName: dataModelName,
            entityName: entityName,
            page: currentPage,
            size: pageSize,
            data: filter,
            sort: sort,
            onlyOnline: true,
            skipLocalDB: true
        };
        this.retryIfNetworkFails(() => {
            return this.executeDatabaseSearchQuery(params);
        }, pullPromise).then(response => {
            progressObserver.next(response);
            this._pullEntityData(db, entityName, filter, sort, maxNoOfPages, pageSize, currentPage + 1, pullPromise, deferred, progressObserver);
        }, deferred.reject);
        return deferred.promise;
    }
    /**
     * If fn fails and network is not there
     * @param fn
     * @param pullPromise
     * @returns {*}
     */
    retryIfNetworkFails(fn, pullPromise) {
        if (pullPromise.$$isMarkedToAbort) {
            return Promise.reject('aborted');
        }
        const promise = this.networkService.retryIfNetworkFails(fn);
        pullProcessManager.add(pullPromise, promise);
        promise.catch(noop)
            .then(() => {
            pullProcessManager.remove(pullPromise, promise);
        });
        return promise;
    }
    /**
     * Tries to cancel the corresponding pull process that gave the given promise.
     * @param promise
     * @returns {any}
     */
    cancel(promise) {
        return pullProcessManager.abort(promise);
    }
    /**
     * fetches the database from the dbName.
     * @param dbName
     * @returns {Promise<any>}
     */
    getDb(dbName) {
        return this.localDBManagementService.loadDatabases()
            .then(databases => {
            const db = _.find(databases, { 'name': dbName });
            return db || Promise.reject('Local database (' + dbName + ') not found');
        });
    }
    /**
     * @returns {any} that has total no of records fetched, start and end timestamps of last successful pull
     * of data from remote server.
     */
    getLastPullInfo() {
        return this.localKeyValueService.get(LAST_PULL_INFO_KEY).then(info => {
            if (_.isString(info.startTime)) {
                info.startTime = new Date(info.startTime);
            }
            if (_.isString(info.endTime)) {
                info.endTime = new Date(info.endTime);
            }
            return info;
        });
    }
    /**
     * Clears (based on parameter) and pulls data ('BUNDLED' data based on parameter) from server using the
     * configured rules in offline configuration.
     *
     * @param clearDataBeforePull boolean
     * @param {Observer<any>} progressObserver
     * @returns {any}
     */
    pullAllDbData(clearDataBeforePull, progressObserver) {
        const deferred = getAbortableDefer(), pullInfo = {
            completedTaskCount: 0,
            totalTaskCount: 0,
            inProgress: true,
            databases: [],
            totalRecordsToPull: 0,
            totalPulledRecordCount: 0,
            startTime: new Date(),
            endTime: new Date()
        };
        this.localDBManagementService.loadDatabases()
            .then(databases => {
            const dataPullPromises = _.chain(databases).filter(function (db) {
                return !db.schema.isInternal;
            }).map(db => {
                pullProcessManager.start(deferred.promise);
                const _progressObserver = { next: data => {
                        const i = _.findIndex(pullInfo.databases, { 'name': data.name });
                        if (i >= 0) {
                            pullInfo.databases[i] = data;
                        }
                        else {
                            pullInfo.databases.push(data);
                        }
                        pullInfo.totalTaskCount = _.reduce(pullInfo.databases, function (sum, dbPullInfo) {
                            return sum + dbPullInfo.totalTaskCount;
                        }, 0);
                        pullInfo.completedTaskCount = _.reduce(pullInfo.databases, function (sum, dbPullInfo) {
                            return sum + dbPullInfo.completedTaskCount;
                        }, 0);
                        pullInfo.totalPulledRecordCount = _.reduce(pullInfo.databases, function (sum, dbPullInfo) {
                            return sum + dbPullInfo.pulledRecordCount;
                        }, 0);
                        pullInfo.totalRecordsToPull = _.reduce(pullInfo.databases, function (sum, dbPullInfo) {
                            return sum + dbPullInfo.totalRecordsToPull;
                        }, 0);
                        progressObserver.next(pullInfo);
                    }, error: null, complete: null
                };
                return this._pullDbData(db, clearDataBeforePull, deferred.promise, _progressObserver);
            }).value();
            return Promise.all(dataPullPromises);
        }).then(() => {
            pullInfo.endTime = new Date();
            pullInfo.inProgress = false;
            this.localKeyValueService.put(LAST_PULL_INFO_KEY, pullInfo);
            deferred.resolve(pullInfo);
        }, deferred.reject);
        return deferred.promise;
    }
    /**
     * Clears (based on parameter) and pulls data ('BUNDLED' data based on parameter) of the given database from server using
     * the configured rules in offline configuration.
     *
     * @param {string} databaseName
     * @param {boolean} clearDataBeforePull
     * @param {Observer<any>} progressObserver
     * @returns {Promise}
     */
    pullDbData(databaseName, clearDataBeforePull, progressObserver) {
        const deferred = getAbortableDefer();
        this.getDb(databaseName).then(db => {
            return this._pullDbData(db, clearDataBeforePull, deferred.promise, progressObserver);
        }).then(deferred.resolve, deferred.reject);
        return deferred.promise;
    }
    /**
     * Clears (based on parameter) and pulls data of the given entity and database from
     * server using the configured rules in offline configuration.
     * @param databaseName, name of the database from which data has to be pulled.
     * @param entityName, name of the entity from which data has to be pulled
     * @param clearDataBeforePull, if set to true, then data of the entity will be deleted.
     * @param progressObserver, observer the progress values
     */
    pullEntityData(databaseName, entityName, clearDataBeforePull, progressObserver) {
        const deferred = getAbortableDefer();
        this.getDb(databaseName)
            .then((db) => {
            return this.copyDataFromRemoteDBToLocalDB(db, entityName, clearDataBeforePull, deferred.promise, progressObserver);
        }).then(deferred.resolve, deferred.reject);
        return deferred.promise;
    }
}
LocalDBDataPullService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
LocalDBDataPullService.ctorParameters = () => [
    { type: App },
    { type: LocalDBManagementService },
    { type: LocalKeyValueService },
    { type: NetworkService }
];
LocalDBDataPullService.ngInjectableDef = i0.defineInjectable({ factory: function LocalDBDataPullService_Factory() { return new LocalDBDataPullService(i0.inject(i1.App), i0.inject(i2.LocalDBManagementService), i0.inject(i3.LocalKeyValueService), i0.inject(i4.NetworkService)); }, token: LocalDBDataPullService, providedIn: "root" });
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwtZGItZGF0YS1wdWxsLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL29mZmxpbmUvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9sb2NhbC1kYi1kYXRhLXB1bGwuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBSTNDLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDM0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRWpELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFN0QsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFFekUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDakUsT0FBTyxFQUFzQixRQUFRLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQzs7Ozs7O0FBR2hFLE1BQU8sa0JBQWtCLEdBQUcsNkJBQTZCLENBQUM7V0FPOUIsR0FBRyxFQUFFO0lBQzdCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNwQixPQUFPO1FBQ0gsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUFFO1lBQ2IsT0FBTyxDQUFDLGVBQWUsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2hELENBQUM7UUFDRCxHQUFHLEVBQUUsQ0FBQyxXQUE4QixFQUFFLE9BQXFCLEVBQUUsRUFBRTtZQUMzRCxNQUFNLGFBQWEsR0FBSSxXQUFtQixDQUFDLGVBQWUsQ0FBQztZQUMzRCxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUMxQixRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ2hDO1lB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UUFBUSxHQUFHLGlCQUFpQixFQUFFLENBQUM7UUFFckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7YUFDbkIsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7WUFDVCxPQUFPLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUMzSCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFM0MsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDO0lBQzVCLENBQUM7OztZQTdmSixVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7O1lBM0RYLEdBQUc7WUFLZix3QkFBd0I7WUFFeEIsb0JBQW9CO1lBTnBCLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IE9ic2VydmVyIH0gZnJvbSAncnhqcy9PYnNlcnZlcic7XG5cbmltcG9ydCB7ICRwYXJzZUV4cHIsIEFwcCwgZGVmZXIsIGdldEFib3J0YWJsZURlZmVyLCBub29wIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgTmV0d29ya1NlcnZpY2UgfSBmcm9tICdAd20vbW9iaWxlL2NvcmUnO1xuXG5pbXBvcnQgeyBMaXZlVmFyaWFibGVVdGlscywgTFZTZXJ2aWNlIH0gZnJvbSAnQHdtL3ZhcmlhYmxlcyc7XG5cbmltcG9ydCB7IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSB9IGZyb20gJy4vbG9jYWwtZGItbWFuYWdlbWVudC5zZXJ2aWNlJztcbmltcG9ydCB7IFB1bGxJbmZvIH0gZnJvbSAnLi9jaGFuZ2UtbG9nLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9jYWxLZXlWYWx1ZVNlcnZpY2UgfSBmcm9tICcuL2xvY2FsLWtleS12YWx1ZS5zZXJ2aWNlJztcbmltcG9ydCB7IERCSW5mbywgRW50aXR5SW5mbywgUHVsbFR5cGUgfSBmcm9tICcuLi9tb2RlbHMvY29uZmlnJztcblxuZGVjbGFyZSBjb25zdCBfLCBtb21lbnQ7XG5jb25zdCAgTEFTVF9QVUxMX0lORk9fS0VZID0gJ2xvY2FsREJNYW5hZ2VyLmxhc3RQdWxsSW5mbyc7XG5cbi8qKlxuICogYSB1dGlsaXR5IGFwaSB0byBhYm9ydCBwdWxsIHByb2Nlc3MuXG4gKlxuICogQHR5cGUge3tzdGFydCwgYWRkLCByZW1vdmUsIGFib3J0fX1cbiAqL1xuY29uc3QgcHVsbFByb2Nlc3NNYW5hZ2VyID0gKCgpID0+IHtcbiAgICBjb25zdCBwcm9taXNlcyA9IHt9O1xuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0OiBwcm9taXNlID0+IHtcbiAgICAgICAgICAgIHByb21pc2UuJCRwdWxsUHJvY2Vzc0lkID0gJ1BVTExfJyArIF8ubm93KCk7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZDogKHB1bGxQcm9taXNlOiBQcm9taXNlPFB1bGxJbmZvPiwgcHJvbWlzZTogUHJvbWlzZTxhbnk+KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwdWxsUHJvY2Vzc0lkID0gKHB1bGxQcm9taXNlIGFzIGFueSkuJCRwdWxsUHJvY2Vzc0lkO1xuICAgICAgICAgICAgaWYgKCFwcm9taXNlc1twdWxsUHJvY2Vzc0lkXSkge1xuICAgICAgICAgICAgICAgIHByb21pc2VzW3B1bGxQcm9jZXNzSWRdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcm9taXNlc1twdWxsUHJvY2Vzc0lkXS5wdXNoKHByb21pc2UpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmU6IChwdWxsUHJvbWlzZTogUHJvbWlzZTxQdWxsSW5mbz4sIHByb21pc2U6IFByb21pc2U8YW55PikgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHVsbFByb2Nlc3NJZCA9IChwdWxsUHJvbWlzZSBhcyBhbnkpLiQkcHVsbFByb2Nlc3NJZDtcbiAgICAgICAgICAgIF8ucmVtb3ZlKHByb21pc2VzW3B1bGxQcm9jZXNzSWRdLCBwcm9taXNlKTtcbiAgICAgICAgICAgIGlmIChfLmlzRW1wdHkocHJvbWlzZXNbcHVsbFByb2Nlc3NJZF0pKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHByb21pc2VzW3B1bGxQcm9jZXNzSWRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBhYm9ydDogKHB1bGxQcm9taXNlOiBQcm9taXNlPFB1bGxJbmZvPikgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHVsbFByb2Nlc3NJZCA9IChwdWxsUHJvbWlzZSBhcyBhbnkpLiQkcHVsbFByb2Nlc3NJZDtcbiAgICAgICAgICAgIGlmIChwcm9taXNlc1twdWxsUHJvY2Vzc0lkXSkge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChwcm9taXNlc1twdWxsUHJvY2Vzc0lkXSwgZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHAgJiYgcC5hYm9ydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcC5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHByb21pc2VzW3B1bGxQcm9jZXNzSWRdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgKHB1bGxQcm9taXNlIGFzIGFueSkuJCRpc01hcmtlZFRvQWJvcnQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIHB1bGxQcm9taXNlLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2NhbmNlbGxlZCc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIExvY2FsREJEYXRhUHVsbFNlcnZpY2UgaGFzIEFQSSB0byBwdWxsIGRhdGEgZnJvbSByZW1vdGUgU2VydmVyIHRvIGxvY2FsIERhdGFiYXNlLlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBMb2NhbERCRGF0YVB1bGxTZXJ2aWNlIHtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBwcml2YXRlIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZTogTG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGxvY2FsS2V5VmFsdWVTZXJ2aWNlOiBMb2NhbEtleVZhbHVlU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBuZXR3b3JrU2VydmljZTogTmV0d29ya1NlcnZpY2VcbiAgICApIHtcbiAgICAgICAgLy8gTGlzdGVuIGZvciBkYiBjcmVhdGlvbi4gV2hlbiBkYiBpcyBjcmVhdGVkLCB0aGVuIGluaXRpYWxpemUgbGFzdCBwdWxsIGluZm8uXG4gICAgICAgIHRoaXMubG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLnJlZ2lzdGVyQ2FsbGJhY2soe1xuICAgICAgICAgICAgb25EYkNyZWF0ZTogKGluZm8pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsS2V5VmFsdWVTZXJ2aWNlLnB1dChMQVNUX1BVTExfSU5GT19LRVksIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YWJhc2VzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxSZWNvcmRzVG9QdWxsOiAwLFxuICAgICAgICAgICAgICAgICAgICB0b3RhbFB1bGxlZFJlY29yZENvdW50OiAwLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWU6IG5ldyBEYXRlKDApLFxuICAgICAgICAgICAgICAgICAgICBlbmRUaW1lOiBuZXcgRGF0ZShpbmZvLmRiU2VlZENyZWF0ZWRPbilcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSWYgZGVsdGFGaWVsZE5hbWUgaXMgc2V0LGxhc3QgcHVsbCB0aW1lIGlzIGdyZWF0ZXIgdGhhbiB6ZXJvIGFuZCBxdWVyeSB1c2VkIGluIGxhc3QgcHVsbCBpcyBzYW1lIGFzIHRoZVxuICAgICAqIHF1ZXJ5IGZvciB0aGUgY3VycmVudCBwdWxsLCB0aGVuIGRlbHRhIGNyaXRlcmlhIGlzIGF0dGFjaGVkIHRvIHRoZSBxdWVyeS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBkYlxuICAgICAqIEBwYXJhbSBlbnRpdHlOYW1lXG4gICAgICogQHBhcmFtIHF1ZXJ5XG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwcml2YXRlIGFkZERlbHRhQ3JpdGVyaWEoZGI6IERCSW5mbywgZW50aXR5TmFtZTogc3RyaW5nLCBxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3QgZW50aXR5U2NoZW1hID0gZGIuc2NoZW1hLmVudGl0aWVzW2VudGl0eU5hbWVdLFxuICAgICAgICAgICAgZGVsdGFGaWVsZE5hbWUgPSBlbnRpdHlTY2hlbWEucHVsbENvbmZpZy5kZWx0YUZpZWxkTmFtZSxcbiAgICAgICAgICAgIGRlbHRhRmllbGQgPSBfLmZpbmQoZW50aXR5U2NoZW1hLmNvbHVtbnMsIHsnZmllbGROYW1lJyA6IGRlbHRhRmllbGROYW1lfSkgfHwge307XG5cbiAgICAgICAgbGV0IGlzQnVuZGxlZEVudGl0eTtcblxuICAgICAgICBpZiAoIV8uaXNFbXB0eShkZWx0YUZpZWxkTmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsREJNYW5hZ2VtZW50U2VydmljZS5pc0J1bmRsZWQoZGIuc2NoZW1hLm5hbWUsIGVudGl0eU5hbWUpXG4gICAgICAgICAgICAgICAgLnRoZW4oZmxhZyA9PiBpc0J1bmRsZWRFbnRpdHkgPSBmbGFnKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMuZ2V0TGFzdFB1bGxJbmZvKCkpXG4gICAgICAgICAgICAgICAgLnRoZW4obGFzdFB1bGxJbmZvID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxhc3RQdWxsVGltZSA9IChsYXN0UHVsbEluZm8gJiYgbGFzdFB1bGxJbmZvLnN0YXJ0VGltZSAmJiBsYXN0UHVsbEluZm8uc3RhcnRUaW1lLmdldFRpbWUoKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RQdWxsREJJbmZvID0gXy5maW5kKGxhc3RQdWxsSW5mbyAmJiBsYXN0UHVsbEluZm8uZGF0YWJhc2VzLCB7J25hbWUnIDogZGIuc2NoZW1hLm5hbWV9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQdWxsRW50aXR5SW5mbyA9IF8uZmluZChsYXN0UHVsbERCSW5mbyAmJiBsYXN0UHVsbERCSW5mby5lbnRpdGllcywgeydlbnRpdHlOYW1lJyA6IGVudGl0eU5hbWV9KSB8fCB7fTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWxhc3RQdWxsVGltZSAmJiBpc0J1bmRsZWRFbnRpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciBidW5kbGVkIGVudGl0eSB3aGVuIHRoZXJlIGlzIG5vIGxhc3QgcHVsbCwgZmV0Y2ggcmVjb3JkcyB0aGF0IGdvdCBtb2RpZmllZCBhZnRlciBkYiBjcmVhdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQdWxsVGltZSA9IChsYXN0UHVsbEluZm8gJiYgbGFzdFB1bGxJbmZvLmVuZFRpbWUgJiYgbGFzdFB1bGxJbmZvLmVuZFRpbWUuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQdWxsRW50aXR5SW5mby5xdWVyeSA9IHF1ZXJ5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0UHVsbEVudGl0eUluZm8ucXVlcnkgPT09IHF1ZXJ5ICYmIGxhc3RQdWxsVGltZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfLmlzRW1wdHkocXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnkgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnkgKz0gJyBBTkQgJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWx0YUZpZWxkLnNxbFR5cGUgPT09ICdkYXRldGltZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyeSArPSBkZWx0YUZpZWxkTmFtZSArICcgPiB3bV9kdChcXCcnICsgbW9tZW50KGxhc3RQdWxsVGltZSkudXRjKCkuZm9ybWF0KCdZWVlZLU1NLUREVEhIOm1tOnNzJykgKyAnXFwnKSc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5ICs9IGRlbHRhRmllbGROYW1lICsgJyA+IHdtX3RzKFxcJycgKyBsYXN0UHVsbFRpbWUgKyAnXFwnKSc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHF1ZXJ5O1xuICAgICAgICAgICAgICAgIH0sICgpID0+IFByb21pc2UucmVzb2x2ZShxdWVyeSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocXVlcnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNvcGllcyB0aGUgZGF0YSBmcm9tIHJlbW90ZSBkYiB0byBsb2NhbCBkYlxuICAgICAqIEBwYXJhbSB7REJJbmZvfSBkYlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBlbnRpdHlOYW1lXG4gICAgICogQHBhcmFtIHtib29sZWFufSBjbGVhckRhdGFCZWZvcmVQdWxsXG4gICAgICogQHBhcmFtIHB1bGxQcm9taXNlXG4gICAgICogQHBhcmFtIHtPYnNlcnZlcjxhbnk+fSBwcm9ncmVzc09ic2VydmVyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICAgKi9cbiAgICBwcml2YXRlIGNvcHlEYXRhRnJvbVJlbW90ZURCVG9Mb2NhbERCKGRiOiBEQkluZm8sIGVudGl0eU5hbWU6IHN0cmluZywgY2xlYXJEYXRhQmVmb3JlUHVsbDogYm9vbGVhbiwgcHVsbFByb21pc2U6IFByb21pc2U8UHVsbEluZm8+LCBwcm9ncmVzc09ic2VydmVyOiBPYnNlcnZlcjxhbnk+KSB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gKGRiIGFzIGFueSkuc3RvcmVzW2VudGl0eU5hbWVdLFxuICAgICAgICAgICAgZW50aXR5U2NoZW1hID0gZGIuc2NoZW1hLmVudGl0aWVzW2VudGl0eU5hbWVdLFxuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIGVudGl0eU5hbWU6IGVudGl0eU5hbWUsXG4gICAgICAgICAgICAgICAgdG90YWxSZWNvcmRzVG9QdWxsOiAwLFxuICAgICAgICAgICAgICAgIHB1bGxlZFJlY29yZENvdW50OiAwXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGxldCBpblByb2dyZXNzID0gMCxcbiAgICAgICAgICAgIHB1bGxDb21wbGV0ZSA9IGZhbHNlLFxuICAgICAgICAgICAgZmlsdGVyO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByZXBhcmVRdWVyeShkYiwgZW50aXR5TmFtZSlcbiAgICAgICAgICAgICAgICAudGhlbihxdWVyeSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQgYXMgYW55KS5xdWVyeSA9IHF1ZXJ5O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hZGREZWx0YUNyaXRlcmlhKGRiLCBlbnRpdHlOYW1lLCBxdWVyeSk7XG4gICAgICAgICAgICAgICAgfSkudGhlbihxdWVyeSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENsZWFyIGlmIGNsZWFyRGF0YUJlZm9yZVB1bGwgaXMgdHJ1ZSBhbmQgZGVsdGEgcXVlcnkgaXMgbm90IHVzZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsZWFyRGF0YUJlZm9yZVB1bGwgJiYgKHJlc3VsdCBhcyBhbnkpLnF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0b3JlLmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBxdWVyeTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcXVlcnk7XG4gICAgICAgICAgICAgICAgfSkudGhlbihxdWVyeSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IF8uaXNFbXB0eShxdWVyeSkgPyAnJyA6ICdxPScgKyBxdWVyeTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VG90YWxSZWNvcmRzVG9QdWxsKGRiLCBlbnRpdHlTY2hlbWEsIGZpbHRlciwgcHVsbFByb21pc2UpO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4obWF4Tm9PZlJlY29yZHMgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYWdlU2l6ZSA9IGVudGl0eVNjaGVtYS5wdWxsQ29uZmlnLnNpemUgfHwgMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4Tm9PZlBhZ2VzID0gTWF0aC5jZWlsKG1heE5vT2ZSZWNvcmRzIC8gcGFnZVNpemUpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC50b3RhbFJlY29yZHNUb1B1bGwgPSBtYXhOb09mUmVjb3JkcztcblxuICAgICAgICAgICAgICAgICAgICBsZXQgc29ydCA9IGVudGl0eVNjaGVtYS5wdWxsQ29uZmlnLm9yZGVyQnk7XG4gICAgICAgICAgICAgICAgICAgIHNvcnQgPSAoXy5pc0VtcHR5KHNvcnQpID8gJycgOiBzb3J0ICsgJywnKSArIHN0b3JlLnByaW1hcnlLZXlOYW1lO1xuXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzT2JzZXJ2ZXIubmV4dChyZXN1bHQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IF9wcm9ncmVzc09ic2VydmVyID0geyBuZXh0OiBkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblByb2dyZXNzKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IF8uc2xpY2UoZGF0YSwgMCwgcmVzdWx0LnRvdGFsUmVjb3Jkc1RvUHVsbCAtIHJlc3VsdC5wdWxsZWRSZWNvcmRDb3VudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmUuc2F2ZUFsbChkYXRhKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1bGxlZFJlY29yZENvdW50ICs9IGRhdGEgPyBkYXRhLmxlbmd0aCA6IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzT2JzZXJ2ZXIubmV4dChyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKG5vb3ApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUHJvZ3Jlc3MtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpblByb2dyZXNzID09PSAwICYmIHB1bGxDb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBlcnJvcjogbnVsbCwgY29tcGxldGU6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9wdWxsRW50aXR5RGF0YShkYiwgZW50aXR5TmFtZSwgZmlsdGVyLCBzb3J0LCBtYXhOb09mUGFnZXMsIHBhZ2VTaXplLCAxLCBwdWxsUHJvbWlzZSwgdW5kZWZpbmVkLCBfcHJvZ3Jlc3NPYnNlcnZlcik7XG4gICAgICAgICAgICAgICAgfSkudGhlbihudWxsLCByZWplY3QpXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChub29wKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwdWxsQ29tcGxldGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluUHJvZ3Jlc3MgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gSWYgZXhwcmVzc2lvbiBzdGFydHMgd2l0aCAnYmluZDonLCB0aGVuIGV4cHJlc3Npb24gaXMgZXZhbHVhdGVkIGFuZCByZXN1bHQgaXMgcmV0dXJuZWQuXG4gICAgcHJpdmF0ZSBldmFsSWZCaW5kKGV4cHJlc3Npb246IHN0cmluZykge1xuICAgICAgICBpZiAoXy5zdGFydHNXaXRoKGV4cHJlc3Npb24sICdiaW5kOicpKSB7XG4gICAgICAgICAgICBleHByZXNzaW9uID0gZXhwcmVzc2lvbi5yZXBsYWNlKC9cXFtcXCRcXGlcXF0vZywgJ1swXScpO1xuICAgICAgICAgICAgcmV0dXJuICRwYXJzZUV4cHIoZXhwcmVzc2lvbi5yZXBsYWNlKCdiaW5kOicsICcnKSkodGhpcy5hcHApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBleHByZXNzaW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIERhdGFiYXNlU2VydmljZS5jb3VudFRhYmxlRGF0YVdpdGhRdWVyeSBhcyBhIHByb21pc2UgQVBJLlxuICAgICAqIEBwYXJhbSBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlXG4gICAgICovXG4gICAgcHJpdmF0ZSBleGVjdXRlRGF0YWJhc2VDb3VudFF1ZXJ5KHBhcmFtczogT2JqZWN0KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIExWU2VydmljZS5jb3VudFRhYmxlRGF0YVdpdGhRdWVyeShwYXJhbXMsIG51bGwsIG51bGwpLnN1YnNjcmliZShyZXNwb25zZSA9PiByZXNvbHZlKHJlc3BvbnNlLmJvZHkpLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyBEYXRhYmFzZVNlcnZpY2Uuc2VhcmNoVGFibGVEYXRhV2l0aFF1ZXJ5IGFzIGEgcHJvbWlzZSBBUEkuXG4gICAgICogQHBhcmFtIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIFByb21pc2VcbiAgICAgKi9cbiAgICBwcml2YXRlIGV4ZWN1dGVEYXRhYmFzZVNlYXJjaFF1ZXJ5KHBhcmFtczogT2JqZWN0KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBMVlNlcnZpY2Uuc2VhcmNoVGFibGVEYXRhV2l0aFF1ZXJ5KHBhcmFtcywgbnVsbCwgbnVsbCkuc3Vic2NyaWJlKHJlc3BvbnNlID0+IHJlc29sdmUocmVzcG9uc2UgJiYgcmVzcG9uc2UuYm9keSAmJiByZXNwb25zZS5ib2R5LmNvbnRlbnQpLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb21wdXRlcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgcmVjb3JkcyB0byBwdWxsLlxuICAgICAqXG4gICAgICogQHBhcmFtIGRiXG4gICAgICogQHBhcmFtIGVudGl0eVNjaGVtYVxuICAgICAqIEBwYXJhbSBmaWx0ZXJcbiAgICAgKiBAcGFyYW0gcHVsbFByb21pc2VcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFRvdGFsUmVjb3Jkc1RvUHVsbChkYjogREJJbmZvLCBlbnRpdHlTY2hlbWE6IEVudGl0eUluZm8sIGZpbHRlcjogc3RyaW5nLCBwdWxsUHJvbWlzZTogUHJvbWlzZTxQdWxsSW5mbz4pOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgICAgICBkYXRhTW9kZWxOYW1lOiBkYi5zY2hlbWEubmFtZSxcbiAgICAgICAgICAgIGVudGl0eU5hbWU6IGVudGl0eVNjaGVtYS5lbnRpdHlOYW1lLFxuICAgICAgICAgICAgZGF0YTogZmlsdGVyXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLnJldHJ5SWZOZXR3b3JrRmFpbHMoKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZURhdGFiYXNlQ291bnRRdWVyeShwYXJhbXMpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG90YWxSZWNvcmRDb3VudCA9IHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgICAgICBtYXhSZWNvcmRzVG9QdWxsID0gXy5wYXJzZUludCgoZW50aXR5U2NoZW1hLnB1bGxDb25maWcgYXMgYW55KS5tYXhOdW1iZXJPZlJlY29yZHMpO1xuICAgICAgICAgICAgICAgIGlmIChfLmlzTmFOKG1heFJlY29yZHNUb1B1bGwpIHx8IG1heFJlY29yZHNUb1B1bGwgPD0gMCB8fCB0b3RhbFJlY29yZENvdW50IDwgbWF4UmVjb3Jkc1RvUHVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG90YWxSZWNvcmRDb3VudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1heFJlY29yZHNUb1B1bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgcHVsbFByb21pc2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcHJlcGFyZVF1ZXJ5KGRiOiBEQkluZm8sIGVudGl0eU5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGxldCBxdWVyeTtcbiAgICAgICAgY29uc3QgZW50aXR5U2NoZW1hID0gZGIuc2NoZW1hLmVudGl0aWVzW2VudGl0eU5hbWVdO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmxvY2FsREJNYW5hZ2VtZW50U2VydmljZS5pc0J1bmRsZWQoZGIuc2NoZW1hLm5hbWUsIGVudGl0eU5hbWUpXG4gICAgICAgICAgICAudGhlbihpc0J1bmRsZWRFbnRpdHkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBoYXNOdWxsQXR0cmlidXRlVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoaXNCdW5kbGVkRW50aXR5IHx8IF8uaXNFbXB0eShlbnRpdHlTY2hlbWEucHVsbENvbmZpZy5xdWVyeSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcXVlcnkgPSBfLmNsb25lRGVlcChlbnRpdHlTY2hlbWEucHVsbENvbmZpZy5maWx0ZXIpO1xuICAgICAgICAgICAgICAgICAgICBxdWVyeSA9IF8ubWFwKHF1ZXJ5LCB2ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHYuYXR0cmlidXRlVmFsdWUgPSB0aGlzLmV2YWxJZkJpbmQodi5hdHRyaWJ1dGVWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNOdWxsQXR0cmlidXRlVmFsdWUgPSBoYXNOdWxsQXR0cmlidXRlVmFsdWUgfHwgXy5pc05pbCh2LmF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhc051bGxBdHRyaWJ1dGVWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdOdWxsIGNyaXRlcmlhIHZhbHVlcyBhcmUgcHJlc2VudCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5ID0gXy5zb3J0QnkocXVlcnksICdhdHRyaWJ1dGVOYW1lJyk7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5ID0gTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0U2VhcmNoUXVlcnkocXVlcnksICcgQU5EICcsIHRydWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5ID0gdGhpcy5ldmFsSWZCaW5kKGVudGl0eVNjaGVtYS5wdWxsQ29uZmlnLnF1ZXJ5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF8uaXNOaWwocXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShlbmNvZGVVUklDb21wb25lbnQocXVlcnkpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGJcbiAgICAgKiBAcGFyYW0gY2xlYXJEYXRhQmVmb3JlUHVsbFxuICAgICAqIEBwYXJhbSBwdWxsUHJvbWlzZVxuICAgICAqIEBwYXJhbSBwcm9ncmVzc09ic2VydmVyXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgcHJpdmF0ZSBfcHVsbERiRGF0YShkYjogREJJbmZvLCBjbGVhckRhdGFCZWZvcmVQdWxsOiBib29sZWFuLCBwdWxsUHJvbWlzZTogUHJvbWlzZTxQdWxsSW5mbz4sIHByb2dyZXNzT2JzZXJ2ZXI6IE9ic2VydmVyPGFueT4pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBjb25zdCBkYXRhbW9kZWxOYW1lID0gZGIuc2NoZW1hLm5hbWUsXG4gICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogZGIuc2NoZW1hLm5hbWUsXG4gICAgICAgICAgICAgICAgZW50aXRpZXM6IFtdLFxuICAgICAgICAgICAgICAgIHRvdGFsUmVjb3Jkc1RvUHVsbDogMCxcbiAgICAgICAgICAgICAgICBwdWxsZWRSZWNvcmRDb3VudDogMCxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWRUYXNrQ291bnQ6IDAsXG4gICAgICAgICAgICAgICAgdG90YWxUYXNrQ291bnQ6IDBcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgc3RvcmVQcm9taXNlcyA9IFtdO1xuXG4gICAgICAgIF8uZm9yRWFjaChkYi5zY2hlbWEuZW50aXRpZXMsIGVudGl0eSA9PiB7XG4gICAgICAgICAgICBzdG9yZVByb21pc2VzLnB1c2godGhpcy5sb2NhbERCTWFuYWdlbWVudFNlcnZpY2UuZ2V0U3RvcmUoZGF0YW1vZGVsTmFtZSwgZW50aXR5LmVudGl0eU5hbWUpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIFByb21pc2UuYWxsKHN0b3JlUHJvbWlzZXMpXG4gICAgICAgICAgICAgICAgLnRoZW4oKHN0b3JlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbnRpdGllcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBzdG9yZXMuZm9yRWFjaChzdG9yZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwdWxsQ29uZmlnID0gc3RvcmUuZW50aXR5U2NoZW1hLnB1bGxDb25maWc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwdWxsVHlwZSA9IHB1bGxDb25maWcucHVsbFR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHVsbFR5cGUgPT09IFB1bGxUeXBlLkFQUF9TVEFSVCB8fCAocHVsbFR5cGUgPT09IFB1bGxUeXBlLkJVTkRMRUQgJiYgKHB1bGxDb25maWcgYXMgYW55KS5kZWx0YUZpZWxkTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRpdGllcy5wdXNoKHN0b3JlLmVudGl0eVNjaGVtYSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwdWxsUHJvbWlzZXMgPSBfLmNoYWluKGVudGl0aWVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChlbnRpdHkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgX3Byb2dyZXNzT2JzZXJ2ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dDogaW5mbyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGkgPSBfLmZpbmRJbmRleChyZXN1bHQuZW50aXRpZXMsIHsnZW50aXR5TmFtZSc6IGluZm8uZW50aXR5TmFtZX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuZW50aXRpZXNbaV0gPSBpbmZvO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmVudGl0aWVzLnB1c2goaW5mbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1bGxlZFJlY29yZENvdW50ID0gXy5yZWR1Y2UocmVzdWx0LmVudGl0aWVzLCBmdW5jdGlvbiAoc3VtLCBlbnRpdHlQdWxsSW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1bSArIGVudGl0eVB1bGxJbmZvLnB1bGxlZFJlY29yZENvdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnRvdGFsUmVjb3Jkc1RvUHVsbCA9IF8ucmVkdWNlKHJlc3VsdC5lbnRpdGllcywgZnVuY3Rpb24gKHN1bSwgZW50aXR5UHVsbEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdW0gKyBlbnRpdHlQdWxsSW5mby50b3RhbFJlY29yZHNUb1B1bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc09ic2VydmVyLm5leHQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBlcnJvcjogbnVsbCwgY29tcGxldGU6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb3B5RGF0YUZyb21SZW1vdGVEQlRvTG9jYWxEQihkYiwgZW50aXR5LmVudGl0eU5hbWUsIGNsZWFyRGF0YUJlZm9yZVB1bGwsIHB1bGxQcm9taXNlLCBfcHJvZ3Jlc3NPYnNlcnZlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuY29tcGxldGVkVGFza0NvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzT2JzZXJ2ZXIubmV4dChyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5mbztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSkudmFsdWUoKTtcblxuICAgICAgICAgICAgICAgIHJlc3VsdC50b3RhbFRhc2tDb3VudCA9IHB1bGxQcm9taXNlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NPYnNlcnZlci5uZXh0KHJlc3VsdCk7XG5cbiAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChwdWxsUHJvbWlzZXMpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWxscyBkYXRhIG9mIHRoZSBnaXZlbiBlbnRpdHkgZnJvbSByZW1vdGUgc2VydmVyLlxuICAgICAqIEBwYXJhbSBkYlxuICAgICAqIEBwYXJhbSBlbnRpdHlOYW1lXG4gICAgICogQHBhcmFtIHNvcnRcbiAgICAgKiBAcGFyYW0gbWF4Tm9PZlBhZ2VzXG4gICAgICogQHBhcmFtIHBhZ2VTaXplXG4gICAgICogQHBhcmFtIGN1cnJlbnRQYWdlXG4gICAgICogQHBhcmFtIGZpbHRlclxuICAgICAqIEBwYXJhbSBwdWxsUHJvbWlzZVxuICAgICAqIEBwYXJhbSBwcm9taXNlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgcHJpdmF0ZSBfcHVsbEVudGl0eURhdGEoZGI6IERCSW5mbywgZW50aXR5TmFtZTogc3RyaW5nLCBmaWx0ZXI6IHN0cmluZywgc29ydCwgbWF4Tm9PZlBhZ2VzOiBudW1iZXIsIHBhZ2VTaXplOiBudW1iZXIsIGN1cnJlbnRQYWdlOiBudW1iZXIsIHB1bGxQcm9taXNlOiBQcm9taXNlPFB1bGxJbmZvPiwgZGVmZXJyZWQ6IGFueSwgcHJvZ3Jlc3NPYnNlcnZlcj86IE9ic2VydmVyPGFueT4pIHtcbiAgICAgICAgY29uc3QgZGF0YU1vZGVsTmFtZSA9IGRiLnNjaGVtYS5uYW1lO1xuXG4gICAgICAgIGlmICghZGVmZXJyZWQpIHtcbiAgICAgICAgICAgIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjdXJyZW50UGFnZSA+IG1heE5vT2ZQYWdlcykge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgICAgICBkYXRhTW9kZWxOYW1lOiBkYXRhTW9kZWxOYW1lLFxuICAgICAgICAgICAgZW50aXR5TmFtZTogZW50aXR5TmFtZSxcbiAgICAgICAgICAgIHBhZ2U6IGN1cnJlbnRQYWdlLFxuICAgICAgICAgICAgc2l6ZTogcGFnZVNpemUsXG4gICAgICAgICAgICBkYXRhOiBmaWx0ZXIsXG4gICAgICAgICAgICBzb3J0OiBzb3J0LFxuICAgICAgICAgICAgb25seU9ubGluZTogdHJ1ZSxcbiAgICAgICAgICAgIHNraXBMb2NhbERCOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucmV0cnlJZk5ldHdvcmtGYWlscygoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5leGVjdXRlRGF0YWJhc2VTZWFyY2hRdWVyeShwYXJhbXMpO1xuICAgICAgICB9LCBwdWxsUHJvbWlzZSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBwcm9ncmVzc09ic2VydmVyLm5leHQocmVzcG9uc2UpO1xuICAgICAgICAgICAgdGhpcy5fcHVsbEVudGl0eURhdGEoZGIsIGVudGl0eU5hbWUsIGZpbHRlciwgc29ydCwgbWF4Tm9PZlBhZ2VzLCBwYWdlU2l6ZSwgY3VycmVudFBhZ2UgKyAxLCBwdWxsUHJvbWlzZSwgZGVmZXJyZWQsIHByb2dyZXNzT2JzZXJ2ZXIpO1xuICAgICAgICB9LCBkZWZlcnJlZC5yZWplY3QpO1xuXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogSWYgZm4gZmFpbHMgYW5kIG5ldHdvcmsgaXMgbm90IHRoZXJlXG4gICAgICogQHBhcmFtIGZuXG4gICAgICogQHBhcmFtIHB1bGxQcm9taXNlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgcHJpdmF0ZSByZXRyeUlmTmV0d29ya0ZhaWxzKGZuOiBGdW5jdGlvbiwgcHVsbFByb21pc2U6IFByb21pc2U8UHVsbEluZm8+KSB7XG4gICAgICAgIGlmICgocHVsbFByb21pc2UgYXMgYW55KS4kJGlzTWFya2VkVG9BYm9ydCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdhYm9ydGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IHRoaXMubmV0d29ya1NlcnZpY2UucmV0cnlJZk5ldHdvcmtGYWlscyhmbik7XG4gICAgICAgIHB1bGxQcm9jZXNzTWFuYWdlci5hZGQocHVsbFByb21pc2UsIHByb21pc2UpO1xuICAgICAgICBwcm9taXNlLmNhdGNoKG5vb3ApXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBwdWxsUHJvY2Vzc01hbmFnZXIucmVtb3ZlKHB1bGxQcm9taXNlLCBwcm9taXNlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyaWVzIHRvIGNhbmNlbCB0aGUgY29ycmVzcG9uZGluZyBwdWxsIHByb2Nlc3MgdGhhdCBnYXZlIHRoZSBnaXZlbiBwcm9taXNlLlxuICAgICAqIEBwYXJhbSBwcm9taXNlXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgY2FuY2VsKHByb21pc2U6IFByb21pc2U8YW55Pikge1xuICAgICAgICByZXR1cm4gcHVsbFByb2Nlc3NNYW5hZ2VyLmFib3J0KHByb21pc2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGZldGNoZXMgdGhlIGRhdGFiYXNlIGZyb20gdGhlIGRiTmFtZS5cbiAgICAgKiBAcGFyYW0gZGJOYW1lXG4gICAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RGIoZGJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLmxvYWREYXRhYmFzZXMoKVxuICAgICAgICAgICAgLnRoZW4oZGF0YWJhc2VzID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYiA9IF8uZmluZChkYXRhYmFzZXMsIHsnbmFtZScgOiBkYk5hbWV9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGIgfHwgUHJvbWlzZS5yZWplY3QoJ0xvY2FsIGRhdGFiYXNlICgnICsgZGJOYW1lICsgJykgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7YW55fSB0aGF0IGhhcyB0b3RhbCBubyBvZiByZWNvcmRzIGZldGNoZWQsIHN0YXJ0IGFuZCBlbmQgdGltZXN0YW1wcyBvZiBsYXN0IHN1Y2Nlc3NmdWwgcHVsbFxuICAgICAqIG9mIGRhdGEgZnJvbSByZW1vdGUgc2VydmVyLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRMYXN0UHVsbEluZm8oKTogUHJvbWlzZTxQdWxsSW5mbz4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbEtleVZhbHVlU2VydmljZS5nZXQoTEFTVF9QVUxMX0lORk9fS0VZKS50aGVuKGluZm8gPT4ge1xuICAgICAgICAgICAgaWYgKF8uaXNTdHJpbmcoaW5mby5zdGFydFRpbWUpKSB7XG4gICAgICAgICAgICAgICAgaW5mby5zdGFydFRpbWUgPSBuZXcgRGF0ZShpbmZvLnN0YXJ0VGltZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXy5pc1N0cmluZyhpbmZvLmVuZFRpbWUpKSB7XG4gICAgICAgICAgICAgICAgaW5mby5lbmRUaW1lID0gbmV3IERhdGUoaW5mby5lbmRUaW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgKGJhc2VkIG9uIHBhcmFtZXRlcikgYW5kIHB1bGxzIGRhdGEgKCdCVU5ETEVEJyBkYXRhIGJhc2VkIG9uIHBhcmFtZXRlcikgZnJvbSBzZXJ2ZXIgdXNpbmcgdGhlXG4gICAgICogY29uZmlndXJlZCBydWxlcyBpbiBvZmZsaW5lIGNvbmZpZ3VyYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2xlYXJEYXRhQmVmb3JlUHVsbCBib29sZWFuXG4gICAgICogQHBhcmFtIHtPYnNlcnZlcjxhbnk+fSBwcm9ncmVzc09ic2VydmVyXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgcHVsbEFsbERiRGF0YShjbGVhckRhdGFCZWZvcmVQdWxsOiBib29sZWFuLCBwcm9ncmVzc09ic2VydmVyOiBPYnNlcnZlcjxhbnk+KTogUHJvbWlzZTxQdWxsSW5mbz4ge1xuICAgICAgICBjb25zdCBkZWZlcnJlZCA9IGdldEFib3J0YWJsZURlZmVyKCksXG4gICAgICAgICAgICBwdWxsSW5mbyA9IHtcbiAgICAgICAgICAgIGNvbXBsZXRlZFRhc2tDb3VudDogMCxcbiAgICAgICAgICAgIHRvdGFsVGFza0NvdW50OiAwLFxuICAgICAgICAgICAgaW5Qcm9ncmVzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGFiYXNlczogW10sXG4gICAgICAgICAgICB0b3RhbFJlY29yZHNUb1B1bGw6IDAsXG4gICAgICAgICAgICB0b3RhbFB1bGxlZFJlY29yZENvdW50OiAwLFxuICAgICAgICAgICAgc3RhcnRUaW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgZW5kVGltZTogbmV3IERhdGUoKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLmxvYWREYXRhYmFzZXMoKVxuICAgICAgICAgICAgLnRoZW4oZGF0YWJhc2VzID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhUHVsbFByb21pc2VzID0gXy5jaGFpbihkYXRhYmFzZXMpLmZpbHRlcihmdW5jdGlvbiAoZGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFkYi5zY2hlbWEuaXNJbnRlcm5hbDtcbiAgICAgICAgICAgICAgICB9KS5tYXAoZGIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBwdWxsUHJvY2Vzc01hbmFnZXIuc3RhcnQoZGVmZXJyZWQucHJvbWlzZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgX3Byb2dyZXNzT2JzZXJ2ZXI6IE9ic2VydmVyPGFueT4gPSB7bmV4dDogZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGkgPSBfLmZpbmRJbmRleChwdWxsSW5mby5kYXRhYmFzZXMsIHsnbmFtZScgOiBkYXRhLm5hbWV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVsbEluZm8uZGF0YWJhc2VzW2ldID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1bGxJbmZvLmRhdGFiYXNlcy5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1bGxJbmZvLnRvdGFsVGFza0NvdW50ID0gXy5yZWR1Y2UocHVsbEluZm8uZGF0YWJhc2VzLCBmdW5jdGlvbiAoc3VtLCBkYlB1bGxJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VtICsgZGJQdWxsSW5mby50b3RhbFRhc2tDb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1bGxJbmZvLmNvbXBsZXRlZFRhc2tDb3VudCA9IF8ucmVkdWNlKHB1bGxJbmZvLmRhdGFiYXNlcywgZnVuY3Rpb24gKHN1bSwgZGJQdWxsSW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1bSArIGRiUHVsbEluZm8uY29tcGxldGVkVGFza0NvdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVsbEluZm8udG90YWxQdWxsZWRSZWNvcmRDb3VudCA9IF8ucmVkdWNlKHB1bGxJbmZvLmRhdGFiYXNlcywgZnVuY3Rpb24gKHN1bSwgZGJQdWxsSW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1bSArIGRiUHVsbEluZm8ucHVsbGVkUmVjb3JkQ291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdWxsSW5mby50b3RhbFJlY29yZHNUb1B1bGwgPSBfLnJlZHVjZShwdWxsSW5mby5kYXRhYmFzZXMsIGZ1bmN0aW9uIChzdW0sIGRiUHVsbEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdW0gKyBkYlB1bGxJbmZvLnRvdGFsUmVjb3Jkc1RvUHVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzT2JzZXJ2ZXIubmV4dChwdWxsSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZXJyb3I6IG51bGwsIGNvbXBsZXRlOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9wdWxsRGJEYXRhKGRiLCBjbGVhckRhdGFCZWZvcmVQdWxsLCBkZWZlcnJlZC5wcm9taXNlLCBfcHJvZ3Jlc3NPYnNlcnZlcik7XG4gICAgICAgICAgICAgICAgfSkudmFsdWUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoZGF0YVB1bGxQcm9taXNlcyk7XG4gICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBwdWxsSW5mby5lbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICBwdWxsSW5mby5pblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbEtleVZhbHVlU2VydmljZS5wdXQoTEFTVF9QVUxMX0lORk9fS0VZLCBwdWxsSW5mbyk7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShwdWxsSW5mbyk7XG4gICAgICAgIH0sIGRlZmVycmVkLnJlamVjdCk7XG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYXJzIChiYXNlZCBvbiBwYXJhbWV0ZXIpIGFuZCBwdWxscyBkYXRhICgnQlVORExFRCcgZGF0YSBiYXNlZCBvbiBwYXJhbWV0ZXIpIG9mIHRoZSBnaXZlbiBkYXRhYmFzZSBmcm9tIHNlcnZlciB1c2luZ1xuICAgICAqIHRoZSBjb25maWd1cmVkIHJ1bGVzIGluIG9mZmxpbmUgY29uZmlndXJhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhYmFzZU5hbWVcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNsZWFyRGF0YUJlZm9yZVB1bGxcbiAgICAgKiBAcGFyYW0ge09ic2VydmVyPGFueT59IHByb2dyZXNzT2JzZXJ2ZXJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBwdWJsaWMgcHVsbERiRGF0YShkYXRhYmFzZU5hbWU6IHN0cmluZywgY2xlYXJEYXRhQmVmb3JlUHVsbDogYm9vbGVhbiwgcHJvZ3Jlc3NPYnNlcnZlcjogT2JzZXJ2ZXI8YW55Pik6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IGRlZmVycmVkID0gZ2V0QWJvcnRhYmxlRGVmZXIoKTtcblxuICAgICAgICB0aGlzLmdldERiKGRhdGFiYXNlTmFtZSkudGhlbihkYiA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcHVsbERiRGF0YShkYiwgY2xlYXJEYXRhQmVmb3JlUHVsbCwgZGVmZXJyZWQucHJvbWlzZSwgcHJvZ3Jlc3NPYnNlcnZlcik7XG4gICAgICAgIH0pLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0KTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgKGJhc2VkIG9uIHBhcmFtZXRlcikgYW5kIHB1bGxzIGRhdGEgb2YgdGhlIGdpdmVuIGVudGl0eSBhbmQgZGF0YWJhc2UgZnJvbVxuICAgICAqIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBydWxlcyBpbiBvZmZsaW5lIGNvbmZpZ3VyYXRpb24uXG4gICAgICogQHBhcmFtIGRhdGFiYXNlTmFtZSwgbmFtZSBvZiB0aGUgZGF0YWJhc2UgZnJvbSB3aGljaCBkYXRhIGhhcyB0byBiZSBwdWxsZWQuXG4gICAgICogQHBhcmFtIGVudGl0eU5hbWUsIG5hbWUgb2YgdGhlIGVudGl0eSBmcm9tIHdoaWNoIGRhdGEgaGFzIHRvIGJlIHB1bGxlZFxuICAgICAqIEBwYXJhbSBjbGVhckRhdGFCZWZvcmVQdWxsLCBpZiBzZXQgdG8gdHJ1ZSwgdGhlbiBkYXRhIG9mIHRoZSBlbnRpdHkgd2lsbCBiZSBkZWxldGVkLlxuICAgICAqIEBwYXJhbSBwcm9ncmVzc09ic2VydmVyLCBvYnNlcnZlciB0aGUgcHJvZ3Jlc3MgdmFsdWVzXG4gICAgICovXG4gICAgcHVibGljIHB1bGxFbnRpdHlEYXRhKGRhdGFiYXNlTmFtZTogc3RyaW5nLCBlbnRpdHlOYW1lOiBzdHJpbmcsIGNsZWFyRGF0YUJlZm9yZVB1bGw6IGJvb2xlYW4sIHByb2dyZXNzT2JzZXJ2ZXI6IE9ic2VydmVyPGFueT4pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBjb25zdCBkZWZlcnJlZCA9IGdldEFib3J0YWJsZURlZmVyKCk7XG5cbiAgICAgICAgdGhpcy5nZXREYihkYXRhYmFzZU5hbWUpXG4gICAgICAgICAgICAudGhlbigoZGIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb3B5RGF0YUZyb21SZW1vdGVEQlRvTG9jYWxEQihkYiwgZW50aXR5TmFtZSwgY2xlYXJEYXRhQmVmb3JlUHVsbCwgZGVmZXJyZWQucHJvbWlzZSwgcHJvZ3Jlc3NPYnNlcnZlcik7XG4gICAgICAgIH0pLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0KTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG59XG4iXX0=