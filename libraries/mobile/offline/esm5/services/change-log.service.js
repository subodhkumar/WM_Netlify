import { Injectable } from '@angular/core';
import { executePromiseChain, getAbortableDefer, isString, noop } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
import { LocalDBManagementService } from './local-db-management.service';
import { LocalKeyValueService } from './local-key-value.service';
import * as i0 from "@angular/core";
import * as i1 from "./local-db-management.service";
import * as i2 from "./local-key-value.service";
import * as i3 from "@wm/mobile/core";
var PushService = /** @class */ (function () {
    function PushService() {
    }
    return PushService;
}());
export { PushService };
export var CONTEXT_KEY = 'changeLogService.flushContext';
export var LAST_PUSH_INFO_KEY = 'changeLogService.lastPushInfo';
var ChangeLogService = /** @class */ (function () {
    function ChangeLogService(localDBManagementService, localKeyValueService, pushService, networkService) {
        this.localDBManagementService = localDBManagementService;
        this.localKeyValueService = localKeyValueService;
        this.pushService = pushService;
        this.networkService = networkService;
        this.workers = [];
        this.currentPushInfo = {};
        this.addWorker(new FlushTracker(this, this.localKeyValueService, this.currentPushInfo));
    }
    /**
     * adds a service call to the log. Call will be invoked in next flush.
     *
     * @Param {string} name of service (This should be available through $injector)
     * @Param {string} name of method to invoke.
     * @Param {object} params
     */
    ChangeLogService.prototype.add = function (service, operation, params) {
        var _this = this;
        var change = {
            service: service,
            operation: operation,
            params: params,
            hasError: 0
        };
        return executePromiseChain(this.getWorkers('transformParamsToMap'), [change])
            .then(function () { return executePromiseChain(_this.getWorkers('onAddCall'), [change]); })
            .then(function () {
            change.params = JSON.stringify(change.params);
            return _this.getStore().then(function (store) { return store.add(change); }).then(noop);
        });
    };
    ChangeLogService.prototype.addWorker = function (worker) {
        this.workers.push(worker);
    };
    /**
     * Clears the current log.
     */
    ChangeLogService.prototype.clearLog = function () {
        return this.getStore().then(function (s) { return s.clear(); });
    };
    /**
     * Flush the current log. If a flush is already running, then the promise of that flush is returned back.
     */
    ChangeLogService.prototype.flush = function (progressObserver) {
        var _this = this;
        var flushPromise;
        if (!this.deferredFlush) {
            this.deferredFlush = getAbortableDefer();
            this.createContext().then(function (context) {
                _this.flushContext = context;
                return executePromiseChain(_this.getWorkers('preFlush'), [_this.flushContext]);
            })
                .then(function () {
                flushPromise = _this._flush(progressObserver);
                _this.deferredFlush.onAbort = function () { return flushPromise.abort(); };
                return flushPromise;
            })
                .catch(noop)
                .then(function () {
                Promise.resolve().then(function () {
                    if (_this.currentPushInfo.totalTaskCount === _this.currentPushInfo.completedTaskCount) {
                        return _this.flushContext.clear().then(function () { return _this.flushContext = null; });
                    }
                }).then(function () {
                    progressObserver.complete();
                    if (_this.currentPushInfo.failedTaskCount > 0) {
                        _this.deferredFlush.reject(_this.currentPushInfo);
                    }
                    else {
                        _this.deferredFlush.resolve(_this.currentPushInfo);
                    }
                    _this.deferredFlush = null;
                }).then(function () {
                    return executePromiseChain(_this.getWorkers('postFlush'), [_this.currentPushInfo, _this.flushContext]);
                });
            });
        }
        return this.deferredFlush.promise;
    };
    /**
     * Returns the complete change list
     */
    ChangeLogService.prototype.getChanges = function () {
        return this.getStore().then(function (s) { return s.filter(undefined, 'id', {
            offset: 0,
            limit: 500
        }); }).then(function (changes) {
            changes.forEach(function (change) {
                change.params = JSON.parse(change.params);
            });
            return changes;
        });
    };
    /**
     * @returns {array} an array of changes that failed with error.
     */
    ChangeLogService.prototype.getErrors = function () {
        return this.getStore().then(function (s) { return s.filter([{
                attributeName: 'hasError',
                attributeValue: 1,
                attributeType: 'NUMBER',
                filterCondition: 'EQUALS'
            }]); });
    };
    ChangeLogService.prototype.getLastPushInfo = function () {
        return this.localKeyValueService.get(LAST_PUSH_INFO_KEY)
            .then(function (info) {
            if (isString(info.startTime)) {
                info.startTime = new Date(info.startTime);
            }
            if (isString(info.endTime)) {
                info.endTime = new Date(info.endTime);
            }
            return info;
        });
    };
    /**
     * @returns {number} number of changes that are pending to push.
     */
    ChangeLogService.prototype.getLogLength = function () {
        return this.getStore().then(function (s) { return s.count([{
                attributeName: 'hasError',
                attributeValue: 0,
                attributeType: 'NUMBER',
                filterCondition: 'EQUALS'
            }]); });
    };
    /*
    * Retrieves the entity store to use by ChangeLogService.
    */
    ChangeLogService.prototype.getStore = function () {
        return this.localDBManagementService.getStore('wavemaker', 'offlineChangeLog');
    };
    /**
     * Returns true, if a flush process is in progress. Otherwise, returns false.
     *
     * @returns {boolean} returns true, if a flush process is in progress. Otherwise, returns false.
     */
    ChangeLogService.prototype.isFlushInProgress = function () {
        return !(_.isUndefined(this.deferredFlush) || _.isNull(this.deferredFlush));
    };
    /**
     * Stops the ongoing flush process.
     *
     * @returns {object} a promise that is resolved when the flush process is stopped.
     */
    ChangeLogService.prototype.stop = function () {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.deferredFlush) {
                _this.deferredFlush.promise.catch().then(resolve);
                _this.deferredFlush.promise.abort();
            }
            else {
                resolve();
            }
        });
    };
    ChangeLogService.prototype.createContext = function () {
        var _this = this;
        return this.localKeyValueService.get(CONTEXT_KEY)
            .then(function (context) {
            context = context || {};
            return {
                'clear': function () {
                    context = {};
                    return _this.localKeyValueService.remove(CONTEXT_KEY);
                },
                'get': function (key) {
                    var value = context[key];
                    if (!value) {
                        value = {};
                        context[key] = value;
                    }
                    return value;
                },
                'save': function () { return _this.localKeyValueService.put(CONTEXT_KEY, context); }
            };
        });
    };
    // Flushes the complete log one after another.
    ChangeLogService.prototype._flush = function (progressObserver, defer) {
        var _this = this;
        defer = defer || getAbortableDefer();
        if (defer.isAborted) {
            return Promise.resolve();
        }
        this.getNextChange()
            .then(function (change) {
            if (change) {
                change.params = JSON.parse(change.params);
                return _this.flushChange(change);
            }
        })
            .then(function (change) {
            progressObserver.next(_this.currentPushInfo);
            if (change) {
                return _this.getStore()
                    .then(function (s) { return s.delete(change.id); })
                    .then(function () { return _this._flush(progressObserver, defer); });
            }
            else {
                defer.resolve();
            }
        }, function (change) {
            if (_this.networkService.isConnected()) {
                change.hasError = 1;
                change.params = JSON.stringify(change.params);
                _this.getStore()
                    .then(function (s) { return s.save(change); })
                    .then(function () { return _this._flush(progressObserver, defer); });
            }
            else {
                var connectPromise_1 = _this.networkService.onConnect();
                defer.promise.catch(function () {
                    if (connectPromise_1) {
                        connectPromise_1.abort();
                    }
                });
                connectPromise_1.then(function () {
                    _this._flush(progressObserver, defer);
                    connectPromise_1 = null;
                });
            }
        });
        return defer.promise;
    };
    ChangeLogService.prototype.flushChange = function (change) {
        var _this = this;
        var self = this;
        return executePromiseChain(this.getWorkers('preCall'), [change])
            .then(function () { return change.hasError ? Promise.reject(change.errorMessage) : ''; })
            .then(function () { return executePromiseChain(_this.getWorkers('transformParamsFromMap'), [change]); })
            .then(function () { return _this.pushService.push(change); })
            .then(function () {
            return executePromiseChain(_.reverse(self.getWorkers('postCallSuccess')), [change, arguments])
                .then(function () { return change; });
        }).catch(function () {
            if (self.networkService.isConnected()) {
                return executePromiseChain(_.reverse(self.getWorkers('postCallError')), [change, arguments])
                    .catch(noop).then(function () { return Promise.reject(change); });
            }
            return Promise.reject(change);
        });
    };
    // Flushes the first registered change.
    ChangeLogService.prototype.getNextChange = function () {
        var filterCriteria = [{
                attributeName: 'hasError',
                attributeValue: 0,
                attributeType: 'NUMBER',
                filterCondition: 'EQUALS'
            }];
        return this.getStore().then(function (s) { return s.filter(filterCriteria, 'id', {
            offset: 0,
            limit: 1
        }); }).then(function (changes) {
            return changes && changes[0];
        });
    };
    ChangeLogService.prototype.getWorkers = function (type) {
        return _.map(this.workers, function (w) { return w[type] && w[type].bind(w); });
    };
    ChangeLogService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    ChangeLogService.ctorParameters = function () { return [
        { type: LocalDBManagementService },
        { type: LocalKeyValueService },
        { type: PushService },
        { type: NetworkService }
    ]; };
    ChangeLogService.ngInjectableDef = i0.defineInjectable({ factory: function ChangeLogService_Factory() { return new ChangeLogService(i0.inject(i1.LocalDBManagementService), i0.inject(i2.LocalKeyValueService), i0.inject(PushService), i0.inject(i3.NetworkService)); }, token: ChangeLogService, providedIn: "root" });
    return ChangeLogService;
}());
export { ChangeLogService };
var FlushTracker = /** @class */ (function () {
    function FlushTracker(changeLogService, localKeyValueService, pushInfo) {
        this.changeLogService = changeLogService;
        this.localKeyValueService = localKeyValueService;
        this.pushInfo = pushInfo;
        this.logger = window.console;
    }
    FlushTracker.prototype.onAddCall = function (change) {
        this.logger.debug('Added the following call %o to log.', change);
    };
    FlushTracker.prototype.preFlush = function (flushContext) {
        var _this = this;
        this.pushInfo.totalTaskCount = 0;
        this.pushInfo.successfulTaskCount = 0;
        this.pushInfo.failedTaskCount = 0;
        this.pushInfo.completedTaskCount = 0;
        this.pushInfo.inProgress = true;
        this.pushInfo.startTime = new Date();
        this.flushContext = flushContext;
        this.logger.debug('Starting flush');
        return this.changeLogService.getStore().then(function (store) {
            return store.count([{
                    attributeName: 'hasError',
                    attributeValue: 0,
                    attributeType: 'NUMBER',
                    filterCondition: 'EQUALS'
                }]);
        }).then(function (count) { return _this.pushInfo.totalTaskCount = count; });
    };
    FlushTracker.prototype.postFlush = function (stats, flushContext) {
        this.logger.debug('flush completed. {Success : %i , Error : %i , completed : %i, total : %i }.', this.pushInfo.successfulTaskCount, this.pushInfo.failedTaskCount, this.pushInfo.completedTaskCount, this.pushInfo.totalTaskCount);
        this.pushInfo.inProgress = false;
        this.pushInfo.endTime = new Date();
        this.localKeyValueService.put(LAST_PUSH_INFO_KEY, this.pushInfo);
        this.flushContext = null;
    };
    FlushTracker.prototype.preCall = function (change) {
        this.logger.debug('%i. Invoking call %o', (1 + this.pushInfo.completedTaskCount), change);
    };
    FlushTracker.prototype.postCallError = function (change, response) {
        this.pushInfo.completedTaskCount++;
        this.pushInfo.failedTaskCount++;
        this.logger.error('call failed with the response %o.', response);
        return this.flushContext.save();
    };
    FlushTracker.prototype.postCallSuccess = function (change, response) {
        this.pushInfo.completedTaskCount++;
        this.pushInfo.successfulTaskCount++;
        this.logger.debug('call returned the following response %o.', response);
        return this.flushContext.save();
    };
    return FlushTracker;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlLWxvZy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9vZmZsaW5lLyIsInNvdXJjZXMiOlsic2VydmljZXMvY2hhbmdlLWxvZy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFJM0MsT0FBTyxFQUFFLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDbEYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRWpELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ3pFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDJCQUEyQixDQUFDOzs7OztBQWlEakU7SUFBQTtJQUVBLENBQUM7SUFBRCxrQkFBQztBQUFELENBQUMsQUFGRCxJQUVDOztBQUVELE1BQU0sQ0FBQyxJQUFNLFdBQVcsR0FBRywrQkFBK0IsQ0FBQztBQUMzRCxNQUFNLENBQUMsSUFBTSxrQkFBa0IsR0FBRywrQkFBK0IsQ0FBQztBQUVsRTtJQVdJLDBCQUFvQix3QkFBa0QsRUFDbEQsb0JBQTBDLEVBQzFDLFdBQXdCLEVBQ3hCLGNBQThCO1FBSDlCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFDbEQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUMxQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN4QixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFYMUMsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQVkzQixJQUFJLENBQUMsZUFBZSxHQUFHLEVBQWMsQ0FBQztRQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksWUFBWSxDQUFDLElBQUksRUFBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7SUFDN0YsQ0FB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SUFDcEMsQ0FBQztJQUVNLHNDQUFlLEdBQXRCLFVBQXVCLE1BQWMsRUFBRSxRQUFhO1FBQ2hELElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsMENBQTBDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFDTCxtQkFBQztBQUFELENBQUMsQUE1REQsSUE0REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IE9ic2VydmVyIH0gZnJvbSAncnhqcy9pbmRleCc7XG5cbmltcG9ydCB7IGV4ZWN1dGVQcm9taXNlQ2hhaW4sIGdldEFib3J0YWJsZURlZmVyLCBpc1N0cmluZywgbm9vcCB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IE5ldHdvcmtTZXJ2aWNlIH0gZnJvbSAnQHdtL21vYmlsZS9jb3JlJztcblxuaW1wb3J0IHsgTG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlIH0gZnJvbSAnLi9sb2NhbC1kYi1tYW5hZ2VtZW50LnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9jYWxLZXlWYWx1ZVNlcnZpY2UgfSBmcm9tICcuL2xvY2FsLWtleS12YWx1ZS5zZXJ2aWNlJztcbmltcG9ydCB7IExvY2FsREJTdG9yZSB9IGZyb20gJy4uL21vZGVscy9sb2NhbC1kYi1zdG9yZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuZXhwb3J0IGludGVyZmFjZSBDaGFuZ2Uge1xuICAgIGlkPzogbnVtYmVyO1xuICAgIGVycm9yTWVzc2FnZT86IHN0cmluZztcbiAgICBoYXNFcnJvcjogbnVtYmVyO1xuICAgIG9wZXJhdGlvbjogc3RyaW5nO1xuICAgIHBhcmFtczogYW55O1xuICAgIHNlcnZpY2U6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGbHVzaENvbnRleHQge1xuICAgIGNsZWFyOiAoKSA9PiBQcm9taXNlPGFueT47XG4gICAgZ2V0OiAoa2V5OiBzdHJpbmcpID0+IGFueTtcbiAgICBzYXZlOiAoKSA9PiBQcm9taXNlPGFueT47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2VyIHtcbiAgICBvbkFkZENhbGw/OiAoY2hhbmdlOiBDaGFuZ2UpID0+IChQcm9taXNlPGFueT4gfCB2b2lkKTtcbiAgICBwcmVGbHVzaD86IChjb250ZXh0OiBGbHVzaENvbnRleHQpID0+IChQcm9taXNlPGFueT4gfCB2b2lkKTtcbiAgICBwb3N0Rmx1c2g/OiAocHVzaEluZm86IFB1c2hJbmZvLCBjb250ZXh0OiBGbHVzaENvbnRleHQpID0+IChQcm9taXNlPGFueT4gfCB2b2lkKTtcbiAgICBwcmVDYWxsPzogKGNoYW5nZTogQ2hhbmdlKSA9PiAoUHJvbWlzZTxhbnk+IHwgdm9pZCk7XG4gICAgcG9zdENhbGxFcnJvcj86IChjaGFuZ2U6IENoYW5nZSwgZXJyb3I6IGFueSkgPT4gKFByb21pc2U8YW55PiB8IHZvaWQpO1xuICAgIHBvc3RDYWxsU3VjY2Vzcz86IChjaGFuZ2U6IENoYW5nZSwgcmVzcG9uc2U6IGFueSkgPT4gKFByb21pc2U8YW55PiB8IHZvaWQpO1xuICAgIHRyYW5zZm9ybVBhcmFtc1RvTWFwPzogKGNoYW5nZTogQ2hhbmdlKSA9PiAoUHJvbWlzZTxhbnk+IHwgdm9pZCk7XG4gICAgdHJhbnNmb3JtUGFyYW1zRnJvbU1hcD86IChjaGFuZ2U6IENoYW5nZSkgPT4gKFByb21pc2U8YW55PiB8IHZvaWQpO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxJbmZvIHtcbiAgICBkYXRhYmFzZXM6IEFycmF5PGFueT47XG4gICAgdG90YWxSZWNvcmRzVG9QdWxsOiBudW1iZXI7XG4gICAgdG90YWxQdWxsZWRSZWNvcmRDb3VudDogbnVtYmVyO1xuICAgIHN0YXJ0VGltZTogRGF0ZTtcbiAgICBlbmRUaW1lOiBEYXRlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1c2hJbmZvIHtcbiAgICBjb21wbGV0ZWRUYXNrQ291bnQ6IG51bWJlcjtcbiAgICBlbmRUaW1lOiBEYXRlO1xuICAgIGZhaWxlZFRhc2tDb3VudDogbnVtYmVyO1xuICAgIGluUHJvZ3Jlc3M6IGJvb2xlYW47XG4gICAgc3RhcnRUaW1lOiBEYXRlO1xuICAgIHN1Y2Nlc3NmdWxUYXNrQ291bnQ6IG51bWJlcjtcbiAgICB0b3RhbFRhc2tDb3VudDogbnVtYmVyO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUHVzaFNlcnZpY2Uge1xuICAgIHB1YmxpYyBhYnN0cmFjdCBwdXNoKGNoYW5nZTogQ2hhbmdlKTogUHJvbWlzZTxhbnk+O1xufVxuXG5leHBvcnQgY29uc3QgQ09OVEVYVF9LRVkgPSAnY2hhbmdlTG9nU2VydmljZS5mbHVzaENvbnRleHQnO1xuZXhwb3J0IGNvbnN0IExBU1RfUFVTSF9JTkZPX0tFWSA9ICdjaGFuZ2VMb2dTZXJ2aWNlLmxhc3RQdXNoSW5mbyc7XG5cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIENoYW5nZUxvZ1NlcnZpY2Uge1xuXG4gICAgcHJpdmF0ZSB3b3JrZXJzOiBXb3JrZXJbXSA9IFtdO1xuXG4gICAgcHJpdmF0ZSBmbHVzaENvbnRleHQ6IEZsdXNoQ29udGV4dDtcblxuICAgIHByaXZhdGUgY3VycmVudFB1c2hJbmZvOiBQdXNoSW5mbztcblxuICAgIHByaXZhdGUgZGVmZXJyZWRGbHVzaDtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlOiBMb2NhbERCTWFuYWdlbWVudFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBsb2NhbEtleVZhbHVlU2VydmljZTogTG9jYWxLZXlWYWx1ZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBwdXNoU2VydmljZTogUHVzaFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBuZXR3b3JrU2VydmljZTogTmV0d29ya1NlcnZpY2UpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50UHVzaEluZm8gPSB7fSBhcyBQdXNoSW5mbztcbiAgICAgICAgdGhpcy5hZGRXb3JrZXIobmV3IEZsdXNoVHJhY2tlcih0aGlzLCAgdGhpcy5sb2NhbEtleVZhbHVlU2VydmljZSwgdGhpcy5jdXJyZW50UHVzaEluZm8pKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIGFkZHMgYSBzZXJ2aWNlIGNhbGwgdG8gdGhlIGxvZy4gQ2FsbCB3aWxsIGJlIGludm9rZWQgaW4gbmV4dCBmbHVzaC5cbiAgICAgKlxuICAgICAqIEBQYXJhbSB7c3RyaW5nfSBuYW1lIG9mIHNlcnZpY2UgKFRoaXMgc2hvdWxkIGJlIGF2YWlsYWJsZSB0aHJvdWdoICRpbmplY3RvcilcbiAgICAgKiBAUGFyYW0ge3N0cmluZ30gbmFtZSBvZiBtZXRob2QgdG8gaW52b2tlLlxuICAgICAqIEBQYXJhbSB7b2JqZWN0fSBwYXJhbXNcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkKHNlcnZpY2U6IHN0cmluZywgb3BlcmF0aW9uOiBzdHJpbmcsIHBhcmFtczogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGNoYW5nZTogQ2hhbmdlID0ge1xuICAgICAgICAgICAgc2VydmljZTogc2VydmljZSxcbiAgICAgICAgICAgIG9wZXJhdGlvbjogb3BlcmF0aW9uLFxuICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgICAgICBoYXNFcnJvcjogMFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZXhlY3V0ZVByb21pc2VDaGFpbih0aGlzLmdldFdvcmtlcnMoJ3RyYW5zZm9ybVBhcmFtc1RvTWFwJyksIFtjaGFuZ2VdKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gZXhlY3V0ZVByb21pc2VDaGFpbih0aGlzLmdldFdvcmtlcnMoJ29uQWRkQ2FsbCcpLCBbY2hhbmdlXSkpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2hhbmdlLnBhcmFtcyA9IEpTT04uc3RyaW5naWZ5KGNoYW5nZS5wYXJhbXMpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFN0b3JlKCkudGhlbihzdG9yZSA9PiBzdG9yZS5hZGQoY2hhbmdlKSkudGhlbihub29wKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRXb3JrZXIod29ya2VyOiBXb3JrZXIpIHtcbiAgICAgICAgdGhpcy53b3JrZXJzLnB1c2god29ya2VyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgdGhlIGN1cnJlbnQgbG9nLlxuICAgICAqL1xuICAgIHB1YmxpYyBjbGVhckxvZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RvcmUoKS50aGVuKCBzID0+IHMuY2xlYXIoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmx1c2ggdGhlIGN1cnJlbnQgbG9nLiBJZiBhIGZsdXNoIGlzIGFscmVhZHkgcnVubmluZywgdGhlbiB0aGUgcHJvbWlzZSBvZiB0aGF0IGZsdXNoIGlzIHJldHVybmVkIGJhY2suXG4gICAgICovXG4gICAgcHVibGljIGZsdXNoKHByb2dyZXNzT2JzZXJ2ZXI6IE9ic2VydmVyPFB1c2hJbmZvPik6IFByb21pc2U8UHVzaEluZm8+IHtcbiAgICAgICAgbGV0IGZsdXNoUHJvbWlzZTtcbiAgICAgICAgaWYgKCF0aGlzLmRlZmVycmVkRmx1c2gpIHtcbiAgICAgICAgICAgIHRoaXMuZGVmZXJyZWRGbHVzaCA9IGdldEFib3J0YWJsZURlZmVyKCk7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNvbnRleHQoKS50aGVuKGNvbnRleHQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZmx1c2hDb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVByb21pc2VDaGFpbih0aGlzLmdldFdvcmtlcnMoJ3ByZUZsdXNoJyksIFt0aGlzLmZsdXNoQ29udGV4dF0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZsdXNoUHJvbWlzZSA9IHRoaXMuX2ZsdXNoKHByb2dyZXNzT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVycmVkRmx1c2gub25BYm9ydCA9ICgpID0+IGZsdXNoUHJvbWlzZS5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmx1c2hQcm9taXNlO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKG5vb3ApXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRQdXNoSW5mby50b3RhbFRhc2tDb3VudCA9PT0gdGhpcy5jdXJyZW50UHVzaEluZm8uY29tcGxldGVkVGFza0NvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmx1c2hDb250ZXh0LmNsZWFyKCkudGhlbigoKSA9PiB0aGlzLmZsdXNoQ29udGV4dCA9IG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzT2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRQdXNoSW5mby5mYWlsZWRUYXNrQ291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZlcnJlZEZsdXNoLnJlamVjdCh0aGlzLmN1cnJlbnRQdXNoSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJyZWRGbHVzaC5yZXNvbHZlKHRoaXMuY3VycmVudFB1c2hJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJyZWRGbHVzaCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4ZWN1dGVQcm9taXNlQ2hhaW4odGhpcy5nZXRXb3JrZXJzKCdwb3N0Rmx1c2gnKSwgW3RoaXMuY3VycmVudFB1c2hJbmZvLCB0aGlzLmZsdXNoQ29udGV4dF0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5kZWZlcnJlZEZsdXNoLnByb21pc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY29tcGxldGUgY2hhbmdlIGxpc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q2hhbmdlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RvcmUoKS50aGVuKCBzID0+IHMuZmlsdGVyKHVuZGVmaW5lZCwgJ2lkJywge1xuICAgICAgICAgICAgb2Zmc2V0OiAwLFxuICAgICAgICAgICAgbGltaXQ6IDUwMFxuICAgICAgICB9KSkudGhlbihjaGFuZ2VzID0+IHtcbiAgICAgICAgICAgIGNoYW5nZXMuZm9yRWFjaChjaGFuZ2UgPT4ge1xuICAgICAgICAgICAgICAgIGNoYW5nZS5wYXJhbXMgPSBKU09OLnBhcnNlKGNoYW5nZS5wYXJhbXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gY2hhbmdlcztcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7YXJyYXl9IGFuIGFycmF5IG9mIGNoYW5nZXMgdGhhdCBmYWlsZWQgd2l0aCBlcnJvci5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RXJyb3JzKCk6IFByb21pc2U8Q2hhbmdlW10+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RvcmUoKS50aGVuKCBzID0+IHMuZmlsdGVyKFt7XG4gICAgICAgICAgICBhdHRyaWJ1dGVOYW1lOiAnaGFzRXJyb3InLFxuICAgICAgICAgICAgYXR0cmlidXRlVmFsdWU6IDEsXG4gICAgICAgICAgICBhdHRyaWJ1dGVUeXBlOiAnTlVNQkVSJyxcbiAgICAgICAgICAgIGZpbHRlckNvbmRpdGlvbjogJ0VRVUFMUydcbiAgICAgICAgfV0pKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXRMYXN0UHVzaEluZm8oKTogUHJvbWlzZTxQdXNoSW5mbz4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbEtleVZhbHVlU2VydmljZS5nZXQoTEFTVF9QVVNIX0lORk9fS0VZKVxuICAgICAgICAgICAgLnRoZW4oaW5mbyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlzU3RyaW5nKGluZm8uc3RhcnRUaW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBpbmZvLnN0YXJ0VGltZSA9IG5ldyBEYXRlKGluZm8uc3RhcnRUaW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlzU3RyaW5nKGluZm8uZW5kVGltZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5mby5lbmRUaW1lID0gbmV3IERhdGUoaW5mby5lbmRUaW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHJldHVybnMge251bWJlcn0gbnVtYmVyIG9mIGNoYW5nZXMgdGhhdCBhcmUgcGVuZGluZyB0byBwdXNoLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRMb2dMZW5ndGgoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RvcmUoKS50aGVuKCBzID0+IHMuY291bnQoW3tcbiAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWU6ICdoYXNFcnJvcicsXG4gICAgICAgICAgICBhdHRyaWJ1dGVWYWx1ZTogMCxcbiAgICAgICAgICAgIGF0dHJpYnV0ZVR5cGU6ICdOVU1CRVInLFxuICAgICAgICAgICAgZmlsdGVyQ29uZGl0aW9uOiAnRVFVQUxTJ1xuICAgICAgICB9XSkpO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBSZXRyaWV2ZXMgdGhlIGVudGl0eSBzdG9yZSB0byB1c2UgYnkgQ2hhbmdlTG9nU2VydmljZS5cbiAgICAqL1xuICAgIHB1YmxpYyBnZXRTdG9yZSgpOiBQcm9taXNlPExvY2FsREJTdG9yZT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbERCTWFuYWdlbWVudFNlcnZpY2UuZ2V0U3RvcmUoJ3dhdmVtYWtlcicsICdvZmZsaW5lQ2hhbmdlTG9nJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlLCBpZiBhIGZsdXNoIHByb2Nlc3MgaXMgaW4gcHJvZ3Jlc3MuIE90aGVyd2lzZSwgcmV0dXJucyBmYWxzZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXR1cm5zIHRydWUsIGlmIGEgZmx1c2ggcHJvY2VzcyBpcyBpbiBwcm9ncmVzcy4gT3RoZXJ3aXNlLCByZXR1cm5zIGZhbHNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBpc0ZsdXNoSW5Qcm9ncmVzcygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEoXy5pc1VuZGVmaW5lZCh0aGlzLmRlZmVycmVkRmx1c2gpIHx8IF8uaXNOdWxsKHRoaXMuZGVmZXJyZWRGbHVzaCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0b3BzIHRoZSBvbmdvaW5nIGZsdXNoIHByb2Nlc3MuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBmbHVzaCBwcm9jZXNzIGlzIHN0b3BwZWQuXG4gICAgICovXG4gICAgcHVibGljIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5kZWZlcnJlZEZsdXNoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlcnJlZEZsdXNoLnByb21pc2UuY2F0Y2goKS50aGVuKHJlc29sdmUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJyZWRGbHVzaC5wcm9taXNlLmFib3J0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVDb250ZXh0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbEtleVZhbHVlU2VydmljZS5nZXQoQ09OVEVYVF9LRVkpXG4gICAgICAgICAgICAudGhlbihjb250ZXh0ID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dCB8fCB7fTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAnY2xlYXInIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxLZXlWYWx1ZVNlcnZpY2UucmVtb3ZlKENPTlRFWFRfS0VZKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ2dldCcgOiBrZXkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gY29udGV4dFtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdzYXZlJyA6ICgpID0+IHRoaXMubG9jYWxLZXlWYWx1ZVNlcnZpY2UucHV0KENPTlRFWFRfS0VZLCBjb250ZXh0KVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBGbHVzaGVzIHRoZSBjb21wbGV0ZSBsb2cgb25lIGFmdGVyIGFub3RoZXIuXG4gICAgcHJpdmF0ZSBfZmx1c2gocHJvZ3Jlc3NPYnNlcnZlcjogT2JzZXJ2ZXI8UHVzaEluZm8+LCBkZWZlcj86IGFueSkge1xuICAgICAgICBkZWZlciA9IGRlZmVyIHx8IGdldEFib3J0YWJsZURlZmVyKCk7XG4gICAgICAgIGlmIChkZWZlci5pc0Fib3J0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdldE5leHRDaGFuZ2UoKVxuICAgICAgICAgICAgLnRoZW4oY2hhbmdlID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZS5wYXJhbXMgPSBKU09OLnBhcnNlKGNoYW5nZS5wYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mbHVzaENoYW5nZShjaGFuZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihjaGFuZ2UgPT4ge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzT2JzZXJ2ZXIubmV4dCh0aGlzLmN1cnJlbnRQdXNoSW5mbyk7XG4gICAgICAgICAgICAgICAgaWYgKGNoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTdG9yZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihzID0+IHMuZGVsZXRlKGNoYW5nZS5pZCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLl9mbHVzaChwcm9ncmVzc09ic2VydmVyLCBkZWZlcikpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBjaGFuZ2UgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm5ldHdvcmtTZXJ2aWNlLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlLmhhc0Vycm9yID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlLnBhcmFtcyA9IEpTT04uc3RyaW5naWZ5KGNoYW5nZS5wYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFN0b3JlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHMgPT4gcy5zYXZlKGNoYW5nZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLl9mbHVzaChwcm9ncmVzc09ic2VydmVyLCBkZWZlcikpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb25uZWN0UHJvbWlzZSA9IHRoaXMubmV0d29ya1NlcnZpY2Uub25Db25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVyLnByb21pc2UuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbm5lY3RQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ubmVjdFByb21pc2UuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmx1c2gocHJvZ3Jlc3NPYnNlcnZlciwgZGVmZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29ubmVjdFByb21pc2UgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmbHVzaENoYW5nZShjaGFuZ2U6IENoYW5nZSk6IFByb21pc2U8Q2hhbmdlPiB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gZXhlY3V0ZVByb21pc2VDaGFpbih0aGlzLmdldFdvcmtlcnMoJ3ByZUNhbGwnKSwgW2NoYW5nZV0pXG4gICAgICAgICAgICAudGhlbigoKSA9PiBjaGFuZ2UuaGFzRXJyb3IgPyBQcm9taXNlLnJlamVjdChjaGFuZ2UuZXJyb3JNZXNzYWdlKSA6ICcnKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gZXhlY3V0ZVByb21pc2VDaGFpbih0aGlzLmdldFdvcmtlcnMoJ3RyYW5zZm9ybVBhcmFtc0Zyb21NYXAnKSwgW2NoYW5nZV0pKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5wdXNoU2VydmljZS5wdXNoKGNoYW5nZSkpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVByb21pc2VDaGFpbihfLnJldmVyc2Uoc2VsZi5nZXRXb3JrZXJzKCdwb3N0Q2FsbFN1Y2Nlc3MnKSksIFtjaGFuZ2UsIGFyZ3VtZW50c10pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IGNoYW5nZSk7XG4gICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5uZXR3b3JrU2VydmljZS5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBleGVjdXRlUHJvbWlzZUNoYWluKF8ucmV2ZXJzZShzZWxmLmdldFdvcmtlcnMoJ3Bvc3RDYWxsRXJyb3InKSksIFtjaGFuZ2UsIGFyZ3VtZW50c10pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2gobm9vcCkudGhlbigoKSA9PiBQcm9taXNlLnJlamVjdChjaGFuZ2UpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGNoYW5nZSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cblxuXG4gICAgLy8gRmx1c2hlcyB0aGUgZmlyc3QgcmVnaXN0ZXJlZCBjaGFuZ2UuXG4gICAgcHJpdmF0ZSBnZXROZXh0Q2hhbmdlKCk6IFByb21pc2U8Q2hhbmdlPiB7XG4gICAgICAgIGNvbnN0IGZpbHRlckNyaXRlcmlhID0gW3tcbiAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWU6ICdoYXNFcnJvcicsXG4gICAgICAgICAgICBhdHRyaWJ1dGVWYWx1ZTogMCxcbiAgICAgICAgICAgIGF0dHJpYnV0ZVR5cGU6ICdOVU1CRVInLFxuICAgICAgICAgICAgZmlsdGVyQ29uZGl0aW9uOiAnRVFVQUxTJ1xuICAgICAgICB9XTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RvcmUoKS50aGVuKHMgPT4gcy5maWx0ZXIoZmlsdGVyQ3JpdGVyaWEsICdpZCcsIHtcbiAgICAgICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgICAgIGxpbWl0OiAxXG4gICAgICAgIH0pKS50aGVuKChjaGFuZ2VzOiBBcnJheTxDaGFuZ2U+KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY2hhbmdlcyAmJiBjaGFuZ2VzWzBdO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFdvcmtlcnModHlwZSkge1xuICAgICAgICByZXR1cm4gXy5tYXAodGhpcy53b3JrZXJzLCB3ID0+IHdbdHlwZV0gJiYgd1t0eXBlXS5iaW5kKHcpKTtcbiAgICB9XG59XG5cbmNsYXNzIEZsdXNoVHJhY2tlciB7XG5cbiAgICBwcml2YXRlIGZsdXNoQ29udGV4dDogRmx1c2hDb250ZXh0O1xuICAgIHByaXZhdGUgbG9nZ2VyOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNoYW5nZUxvZ1NlcnZpY2U6IENoYW5nZUxvZ1NlcnZpY2UsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBsb2NhbEtleVZhbHVlU2VydmljZTogTG9jYWxLZXlWYWx1ZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBwdXNoSW5mbzogUHVzaEluZm8pIHtcbiAgICAgICAgdGhpcy5sb2dnZXIgPSB3aW5kb3cuY29uc29sZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25BZGRDYWxsKGNoYW5nZTogQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdBZGRlZCB0aGUgZm9sbG93aW5nIGNhbGwgJW8gdG8gbG9nLicsIGNoYW5nZSk7XG4gICAgfVxuXG4gICAgcHVibGljIHByZUZsdXNoKGZsdXNoQ29udGV4dDogRmx1c2hDb250ZXh0KSB7XG4gICAgICAgIHRoaXMucHVzaEluZm8udG90YWxUYXNrQ291bnQgPSAwO1xuICAgICAgICB0aGlzLnB1c2hJbmZvLnN1Y2Nlc3NmdWxUYXNrQ291bnQgPSAwO1xuICAgICAgICB0aGlzLnB1c2hJbmZvLmZhaWxlZFRhc2tDb3VudCA9IDA7XG4gICAgICAgIHRoaXMucHVzaEluZm8uY29tcGxldGVkVGFza0NvdW50ID0gMDtcbiAgICAgICAgdGhpcy5wdXNoSW5mby5pblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wdXNoSW5mby5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB0aGlzLmZsdXNoQ29udGV4dCA9IGZsdXNoQ29udGV4dDtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1N0YXJ0aW5nIGZsdXNoJyk7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYW5nZUxvZ1NlcnZpY2UuZ2V0U3RvcmUoKS50aGVuKHN0b3JlID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzdG9yZS5jb3VudChbe1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWU6ICdoYXNFcnJvcicsXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlVmFsdWU6IDAsXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlVHlwZTogJ05VTUJFUicsXG4gICAgICAgICAgICAgICAgZmlsdGVyQ29uZGl0aW9uOiAnRVFVQUxTJ1xuICAgICAgICAgICAgfV0pO1xuICAgICAgICB9KS50aGVuKGNvdW50ID0+IHRoaXMucHVzaEluZm8udG90YWxUYXNrQ291bnQgPSBjb3VudCk7XG4gICAgfVxuXG4gICAgcHVibGljIHBvc3RGbHVzaChzdGF0czogUHVzaEluZm8gLCBmbHVzaENvbnRleHQ6IEZsdXNoQ29udGV4dCkge1xuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnZmx1c2ggY29tcGxldGVkLiB7U3VjY2VzcyA6ICVpICwgRXJyb3IgOiAlaSAsIGNvbXBsZXRlZCA6ICVpLCB0b3RhbCA6ICVpIH0uJyxcbiAgICAgICAgICAgIHRoaXMucHVzaEluZm8uc3VjY2Vzc2Z1bFRhc2tDb3VudCwgdGhpcy5wdXNoSW5mby5mYWlsZWRUYXNrQ291bnQsIHRoaXMucHVzaEluZm8uY29tcGxldGVkVGFza0NvdW50LCB0aGlzLnB1c2hJbmZvLnRvdGFsVGFza0NvdW50KTtcbiAgICAgICAgdGhpcy5wdXNoSW5mby5pblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgIHRoaXMucHVzaEluZm8uZW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHRoaXMubG9jYWxLZXlWYWx1ZVNlcnZpY2UucHV0KExBU1RfUFVTSF9JTkZPX0tFWSwgdGhpcy5wdXNoSW5mbyk7XG4gICAgICAgIHRoaXMuZmx1c2hDb250ZXh0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgcHJlQ2FsbChjaGFuZ2U6IENoYW5nZSkge1xuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnJWkuIEludm9raW5nIGNhbGwgJW8nLCAoMSArIHRoaXMucHVzaEluZm8uY29tcGxldGVkVGFza0NvdW50KSwgY2hhbmdlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcG9zdENhbGxFcnJvcihjaGFuZ2U6IENoYW5nZSwgcmVzcG9uc2U6IGFueSkge1xuICAgICAgICB0aGlzLnB1c2hJbmZvLmNvbXBsZXRlZFRhc2tDb3VudCsrO1xuICAgICAgICB0aGlzLnB1c2hJbmZvLmZhaWxlZFRhc2tDb3VudCsrO1xuICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignY2FsbCBmYWlsZWQgd2l0aCB0aGUgcmVzcG9uc2UgJW8uJywgcmVzcG9uc2UpO1xuICAgICAgICByZXR1cm4gdGhpcy5mbHVzaENvbnRleHQuc2F2ZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBwb3N0Q2FsbFN1Y2Nlc3MoY2hhbmdlOiBDaGFuZ2UsIHJlc3BvbnNlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5wdXNoSW5mby5jb21wbGV0ZWRUYXNrQ291bnQrKztcbiAgICAgICAgdGhpcy5wdXNoSW5mby5zdWNjZXNzZnVsVGFza0NvdW50Kys7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdjYWxsIHJldHVybmVkIHRoZSBmb2xsb3dpbmcgcmVzcG9uc2UgJW8uJywgcmVzcG9uc2UpO1xuICAgICAgICByZXR1cm4gdGhpcy5mbHVzaENvbnRleHQuc2F2ZSgpO1xuICAgIH1cbn1cbiJdfQ==