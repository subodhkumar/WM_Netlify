import { from } from 'rxjs';
import { LVService } from '@wm/variables';
import { noop, triggerFn } from '@wm/core';
import { WM_LOCAL_OFFLINE_CALL } from './utils';
var apiConfiguration = [{
        'name': 'insertTableData',
        'type': 'INSERT'
    }, {
        'name': 'insertMultiPartTableData',
        'type': 'INSERT'
    }, {
        'name': 'updateTableData',
        'type': 'UPDATE'
    }, {
        'name': 'updateMultiPartTableData',
        'type': 'UPDATE'
    }, {
        'name': 'deleteTableData',
        'type': 'DELETE'
    }, {
        'name': 'readTableData',
        'type': 'READ',
        'saveResponse': true
    }, {
        'name': 'searchTableData',
        'type': 'READ',
        'saveResponse': true
    }, {
        'name': 'searchTableDataWithQuery',
        'type': 'READ',
        'saveResponse': true
    }, {
        'name': 'getDistinctDataByFields',
        'type': 'READ',
        'saveResponse': false
    }];
var isOfflineBehaviorAdded = false;
var LiveVariableOfflineBehaviour = /** @class */ (function () {
    function LiveVariableOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService, offlineDBService) {
        this.changeLogService = changeLogService;
        this.httpService = httpService;
        this.localDBManagementService = localDBManagementService;
        this.networkService = networkService;
        this.offlineDBService = offlineDBService;
        this.onlineDBService = LVService;
    }
    LiveVariableOfflineBehaviour.prototype.add = function () {
        var _this = this;
        if (!isOfflineBehaviorAdded) {
            isOfflineBehaviorAdded = true;
            var onlineHandler_1 = this.httpService.sendCallAsObservable;
            if (onlineHandler_1) {
                this.httpService.sendCallAsObservable = function (reqParams, params) {
                    if (!params && _.get(reqParams, 'url')) {
                        params = { url: reqParams.url };
                    }
                    // reqParams will contain the full path of insert/update call which will be processed again in parseConfig method
                    // and will be appended again with '/services/./.' which will result in deployedUrl + '/service/./.' + '/service/./.' which is wrong.
                    // Hence passing url in params
                    var clonedParamsUrl = _.clone(params.url);
                    params = _.extend(params, reqParams);
                    var operation = _.find(apiConfiguration, { name: _.get(params, 'operation') });
                    if (_this.networkService.isConnected() || params.onlyOnline || !operation || !params.dataModelName) {
                        return from(_this.remoteDBcall(operation, onlineHandler_1, params));
                    }
                    // converting promise to observable as LVService returns a observable
                    return from(_this.localDBManagementService.isOperationAllowed(params.dataModelName, params.entityName, operation.type)
                        .then(function (isAllowedInOffline) {
                        if (!isAllowedInOffline) {
                            return _this.remoteDBcall(operation, onlineHandler_1, params);
                        }
                        else {
                            var cascader_1;
                            return Promise.resolve().then(function () {
                                if (!params.isCascadingStopped &&
                                    (operation.name === 'insertTableData'
                                        || operation.name === 'updateTableData')) {
                                    return _this.prepareToCascade(params).then(function (c) { return cascader_1 = c; });
                                }
                            }).then(function () {
                                return new Promise(function (resolve, reject) {
                                    _this.localDBcall(operation, params, resolve, reject, clonedParamsUrl);
                                });
                            }).then(function (response) {
                                if (cascader_1) {
                                    return cascader_1.cascade().then(function () {
                                        return _this.getStore(params).then(function (store) {
                                            return store.refresh(response.body);
                                        }).then(function (data) {
                                            // data includes parent and child data.
                                            if (response && response.body) {
                                                response.body = data;
                                            }
                                            return response;
                                        });
                                    });
                                }
                                return response;
                            });
                        }
                    }));
                };
            }
        }
    };
    LiveVariableOfflineBehaviour.prototype.getStore = function (params) {
        return this.localDBManagementService.getStore(params.dataModelName, params.entityName);
    };
    // set hasBlob flag on params when blob field is present
    LiveVariableOfflineBehaviour.prototype.hasBlob = function (store) {
        var blobColumns = _.filter(store.entitySchema.columns, {
            'sqlType': 'blob'
        });
        return !!blobColumns.length;
    };
    /*
     * During offline, LocalDBService will answer to all the calls. All data modifications will be recorded
     * and will be reported to DatabaseService when device goes online.
     */
    LiveVariableOfflineBehaviour.prototype.localDBcall = function (operation, params, successCallback, failureCallback, clonedParamsUrl) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.offlineDBService[operation.name](params, function (response) {
                if (operation.type === 'READ') {
                    resolve(response);
                }
                else {
                    // add to change log
                    params.onlyOnline = true;
                    params.url = clonedParamsUrl;
                    return _this.changeLogService.add('DatabaseService', operation.name, params)
                        .then(function () { return resolve(response); });
                }
            });
        }).then(function (response) {
            response = { body: response, type: WM_LOCAL_OFFLINE_CALL };
            triggerFn(successCallback, response);
            return response;
        }, failureCallback);
    };
    /*
     * During online, all read operations data will be pushed to offline database. Similarly, Update and Delete
     * operations are synced with the offline database.
     */
    LiveVariableOfflineBehaviour.prototype.remoteDBcall = function (operation, onlineHandler, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            onlineHandler.call(_this.httpService, params).subscribe(function (response) {
                if (response && response.type) {
                    if (!params.skipLocalDB) {
                        _this.offlineDBService.getStore(params).then(function (store) {
                            if (operation.type === 'READ' && operation.saveResponse) {
                                store.saveAll(response.body.content);
                            }
                            else if (operation.type === 'INSERT') {
                                params = _.clone(params);
                                params.data = _.clone(response.body);
                                _this.offlineDBService[operation.name](params, noop, noop);
                            }
                            else {
                                _this.offlineDBService[operation.name](params, noop, noop);
                            }
                        }).catch(noop);
                    }
                    resolve(response);
                }
            }, function (err) {
                reject(err);
            });
        });
    };
    /**
     * Finds out the nested objects to save and prepares a cloned params.
     */
    LiveVariableOfflineBehaviour.prototype.prepareToCascade = function (params) {
        var _this = this;
        return this.getStore(params).then(function (store) {
            var childObjectPromises = [];
            _.forEach(params.data, function (v, k) {
                var column, foreignRelation, childParams;
                // NOTE: Save only one-to-one relations for cascade
                if (_.isObject(v) && !_.isArray(v)) {
                    column = store.entitySchema.columns.find(function (c) {
                        if (c.primaryKey && c.foreignRelations) {
                            foreignRelation = c.foreignRelations.find(function (f) { return f.sourceFieldName === k; });
                        }
                        return !!foreignRelation;
                    });
                }
                if (column) {
                    childParams = _.cloneDeep(params);
                    childParams.entityName = foreignRelation.targetEntity;
                    childParams.data = v;
                    var childPromise = _this.getStore(childParams).then(function (childStore) {
                        var parent = params.data;
                        var targetColumns = childStore.entitySchema.columns.find(function (c) { return c.name === foreignRelation.targetColumn; });
                        if (targetColumns && targetColumns.foreignRelations) {
                            var parentFieldName = targetColumns.foreignRelations.find(function (f) { return f.targetTable === store.entitySchema.name; }).sourceFieldName;
                            childParams.data[parentFieldName] = parent;
                        }
                        parent[k] = null;
                        childParams.onlyOnline = false;
                        childParams.isCascadingStopped = true;
                        childParams.hasBlob = _this.hasBlob(childStore);
                        childParams.url = '';
                        return function () {
                            return Promise.resolve().then(function () {
                                var primaryKeyValue = childStore.getValue(childParams.data, childStore.primaryKeyField.fieldName);
                                return primaryKeyValue ? childStore.get(primaryKeyValue) : null;
                            }).then(function (object) {
                                var operation;
                                if (object) {
                                    operation = childParams.hasBlob ? 'updateMultiPartTableData' : 'updateTableData';
                                }
                                else {
                                    operation = childParams.hasBlob ? 'insertMultiPartTableData' : 'insertTableData';
                                }
                                return _this.onlineDBService[operation](childParams).toPromise();
                            });
                        };
                    });
                    childObjectPromises.push(childPromise);
                }
            });
            return Promise.all(childObjectPromises).then(function (result) {
                return {
                    cascade: function () { return Promise.all(result.map(function (fn) { return fn(); })); }
                };
            });
        });
    };
    return LiveVariableOfflineBehaviour;
}());
export { LiveVariableOfflineBehaviour };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl2ZS12YXJpYWJsZS51dGlscy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvb2ZmbGluZS8iLCJzb3VyY2VzIjpbInV0aWxzL2xpdmUtdmFyaWFibGUudXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU1QixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzFDLE9BQU8sRUFBdUIsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQU9oRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFJaEQsSUFBTSxnQkFBZ0IsR0FBRyxDQUFDO1FBQ2xCLE1BQU0sRUFBRyxpQkFBaUI7UUFDMUIsTUFBTSxFQUFHLFFBQVE7S0FDcEIsRUFBRTtRQUNDLE1BQU0sRUFBRywwQkFBMEI7UUFDbkMsTUFBTSxFQUFHLFFBQVE7S0FDcEIsRUFBRTtRQUNDLE1BQU0sRUFBRyxpQkFBaUI7UUFDMUIsTUFBTSxFQUFHLFFBQVE7S0FDcEIsRUFBRTtRQUNDLE1BQU0sRUFBRywwQkFBMEI7UUFDbkMsTUFBTSxFQUFHLFFBQVE7S0FDcEIsRUFBRTtRQUNDLE1BQU0sRUFBRyxpQkFBaUI7UUFDMUIsTUFBTSxFQUFHLFFBQVE7S0FDcEIsRUFBRTtRQUNDLE1BQU0sRUFBRyxlQUFlO1FBQ3hCLE1BQU0sRUFBRyxNQUFNO1FBQ2YsY0FBYyxFQUFFLElBQUk7S0FDdkIsRUFBRTtRQUNDLE1BQU0sRUFBRyxpQkFBaUI7UUFDMUIsTUFBTSxFQUFHLE1BQU07UUFDZixjQUFjLEVBQUUsSUFBSTtLQUN2QixFQUFFO1FBQ0MsTUFBTSxFQUFHLDBCQUEwQjtRQUNuQyxNQUFNLEVBQUcsTUFBTTtRQUNmLGNBQWMsRUFBRSxJQUFJO0tBQ3ZCLEVBQUU7UUFDQyxNQUFNLEVBQUcseUJBQXlCO1FBQ2xDLE1BQU0sRUFBRyxNQUFNO1FBQ2YsY0FBYyxF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IjpbImltcG9ydCB7IGZyb20gfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgTFZTZXJ2aWNlIH0gZnJvbSAnQHdtL3ZhcmlhYmxlcyc7XG5cbmltcG9ydCB7IE5ldHdvcmtTZXJ2aWNlIH0gZnJvbSAnQHdtL21vYmlsZS9jb3JlJztcbmltcG9ydCB7IEFic3RyYWN0SHR0cFNlcnZpY2UsIG5vb3AsIHRyaWdnZXJGbiB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQ29sdW1uSW5mbywgRm9yZWlnblJlbGF0aW9uSW5mbyB9IGZyb20gJy4uL21vZGVscy9jb25maWcnO1xuaW1wb3J0IHsgTG9jYWxEQlN0b3JlIH0gZnJvbSAnLi4vbW9kZWxzL2xvY2FsLWRiLXN0b3JlJztcbmltcG9ydCB7IENoYW5nZUxvZ1NlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9jaGFuZ2UtbG9nLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvbG9jYWwtZGItbWFuYWdlbWVudC5zZXJ2aWNlJztcbmltcG9ydCB7IExvY2FsRGJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvbG9jYWwtZGIuc2VydmljZSc7XG5pbXBvcnQgeyBXTV9MT0NBTF9PRkZMSU5FX0NBTEwgfSBmcm9tICcuL3V0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBhcGlDb25maWd1cmF0aW9uID0gW3tcbiAgICAgICAgJ25hbWUnIDogJ2luc2VydFRhYmxlRGF0YScsXG4gICAgICAgICd0eXBlJyA6ICdJTlNFUlQnXG4gICAgfSwge1xuICAgICAgICAnbmFtZScgOiAnaW5zZXJ0TXVsdGlQYXJ0VGFibGVEYXRhJyxcbiAgICAgICAgJ3R5cGUnIDogJ0lOU0VSVCdcbiAgICB9LCB7XG4gICAgICAgICduYW1lJyA6ICd1cGRhdGVUYWJsZURhdGEnLFxuICAgICAgICAndHlwZScgOiAnVVBEQVRFJ1xuICAgIH0sIHtcbiAgICAgICAgJ25hbWUnIDogJ3VwZGF0ZU11bHRpUGFydFRhYmxlRGF0YScsXG4gICAgICAgICd0eXBlJyA6ICdVUERBVEUnXG4gICAgfSwge1xuICAgICAgICAnbmFtZScgOiAnZGVsZXRlVGFibGVEYXRhJyxcbiAgICAgICAgJ3R5cGUnIDogJ0RFTEVURSdcbiAgICB9LCB7XG4gICAgICAgICduYW1lJyA6ICdyZWFkVGFibGVEYXRhJyxcbiAgICAgICAgJ3R5cGUnIDogJ1JFQUQnLFxuICAgICAgICAnc2F2ZVJlc3BvbnNlJzogdHJ1ZVxuICAgIH0sIHtcbiAgICAgICAgJ25hbWUnIDogJ3NlYXJjaFRhYmxlRGF0YScsXG4gICAgICAgICd0eXBlJyA6ICdSRUFEJyxcbiAgICAgICAgJ3NhdmVSZXNwb25zZSc6IHRydWVcbiAgICB9LCB7XG4gICAgICAgICduYW1lJyA6ICdzZWFyY2hUYWJsZURhdGFXaXRoUXVlcnknLFxuICAgICAgICAndHlwZScgOiAnUkVBRCcsXG4gICAgICAgICdzYXZlUmVzcG9uc2UnOiB0cnVlXG4gICAgfSwge1xuICAgICAgICAnbmFtZScgOiAnZ2V0RGlzdGluY3REYXRhQnlGaWVsZHMnLFxuICAgICAgICAndHlwZScgOiAnUkVBRCcsXG4gICAgICAgICdzYXZlUmVzcG9uc2UnOiBmYWxzZVxuICAgIH1dO1xuXG5sZXQgaXNPZmZsaW5lQmVoYXZpb3JBZGRlZCA9IGZhbHNlO1xuXG5leHBvcnQgY2xhc3MgTGl2ZVZhcmlhYmxlT2ZmbGluZUJlaGF2aW91ciB7XG5cbiAgICBwcml2YXRlIG9ubGluZURCU2VydmljZSA9IExWU2VydmljZTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGNoYW5nZUxvZ1NlcnZpY2U6IENoYW5nZUxvZ1NlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgaHR0cFNlcnZpY2U6IEFic3RyYWN0SHR0cFNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlOiBMb2NhbERCTWFuYWdlbWVudFNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgbmV0d29ya1NlcnZpY2U6IE5ldHdvcmtTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIG9mZmxpbmVEQlNlcnZpY2U6IExvY2FsRGJTZXJ2aWNlXG4gICAgKSB7fVxuXG4gICAgcHVibGljIGFkZCAoKSB7XG4gICAgICAgIGlmICghaXNPZmZsaW5lQmVoYXZpb3JBZGRlZCkge1xuICAgICAgICAgICAgaXNPZmZsaW5lQmVoYXZpb3JBZGRlZCA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBvbmxpbmVIYW5kbGVyID0gdGhpcy5odHRwU2VydmljZS5zZW5kQ2FsbEFzT2JzZXJ2YWJsZTtcbiAgICAgICAgICAgIGlmIChvbmxpbmVIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5odHRwU2VydmljZS5zZW5kQ2FsbEFzT2JzZXJ2YWJsZSA9IChyZXFQYXJhbXMsIHBhcmFtcyk6IGFueSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGFyYW1zICYmIF8uZ2V0KHJlcVBhcmFtcywgJ3VybCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSB7dXJsOiByZXFQYXJhbXMudXJsfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyByZXFQYXJhbXMgd2lsbCBjb250YWluIHRoZSBmdWxsIHBhdGggb2YgaW5zZXJ0L3VwZGF0ZSBjYWxsIHdoaWNoIHdpbGwgYmUgcHJvY2Vzc2VkIGFnYWluIGluIHBhcnNlQ29uZmlnIG1ldGhvZFxuICAgICAgICAgICAgICAgICAgICAvLyBhbmQgd2lsbCBiZSBhcHBlbmRlZCBhZ2FpbiB3aXRoICcvc2VydmljZXMvLi8uJyB3aGljaCB3aWxsIHJlc3VsdCBpbiBkZXBsb3llZFVybCArICcvc2VydmljZS8uLy4nICsgJy9zZXJ2aWNlLy4vLicgd2hpY2ggaXMgd3JvbmcuXG4gICAgICAgICAgICAgICAgICAgIC8vIEhlbmNlIHBhc3NpbmcgdXJsIGluIHBhcmFtc1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9uZWRQYXJhbXNVcmwgPSBfLmNsb25lKHBhcmFtcy51cmwpO1xuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBfLmV4dGVuZChwYXJhbXMsIHJlcVBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IF8uZmluZChhcGlDb25maWd1cmF0aW9uLCB7bmFtZTogXy5nZXQocGFyYW1zLCAnb3BlcmF0aW9uJyl9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubmV0d29ya1NlcnZpY2UuaXNDb25uZWN0ZWQoKSB8fCBwYXJhbXMub25seU9ubGluZSB8fCAhb3BlcmF0aW9uIHx8ICFwYXJhbXMuZGF0YU1vZGVsTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZyb20odGhpcy5yZW1vdGVEQmNhbGwob3BlcmF0aW9uLCBvbmxpbmVIYW5kbGVyLCBwYXJhbXMpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBjb252ZXJ0aW5nIHByb21pc2UgdG8gb2JzZXJ2YWJsZSBhcyBMVlNlcnZpY2UgcmV0dXJucyBhIG9ic2VydmFibGVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZyb20odGhpcy5sb2NhbERCTWFuYWdlbWVudFNlcnZpY2UuaXNPcGVyYXRpb25BbGxvd2VkKHBhcmFtcy5kYXRhTW9kZWxOYW1lLCBwYXJhbXMuZW50aXR5TmFtZSwgb3BlcmF0aW9uLnR5cGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihpc0FsbG93ZWRJbk9mZmxpbmUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNBbGxvd2VkSW5PZmZsaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbW90ZURCY2FsbChvcGVyYXRpb24sIG9ubGluZUhhbmRsZXIsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhc2NhZGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXBhcmFtcy5pc0Nhc2NhZGluZ1N0b3BwZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAob3BlcmF0aW9uLm5hbWUgPT09ICdpbnNlcnRUYWJsZURhdGEnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IG9wZXJhdGlvbi5uYW1lID09PSAndXBkYXRlVGFibGVEYXRhJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wcmVwYXJlVG9DYXNjYWRlKHBhcmFtcykudGhlbihjID0+IGNhc2NhZGVyID0gYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2FsREJjYWxsKG9wZXJhdGlvbiwgcGFyYW1zLCByZXNvbHZlLCByZWplY3QsIGNsb25lZFBhcmFtc1VybCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbiggKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXNjYWRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYXNjYWRlci5jYXNjYWRlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFN0b3JlKHBhcmFtcykudGhlbihzdG9yZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RvcmUucmVmcmVzaChyZXNwb25zZS5ib2R5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRhdGEgaW5jbHVkZXMgcGFyZW50IGFuZCBjaGlsZCBkYXRhLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5ib2R5ID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldFN0b3JlKHBhcmFtczogYW55KTogUHJvbWlzZTxMb2NhbERCU3RvcmU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLmdldFN0b3JlKHBhcmFtcy5kYXRhTW9kZWxOYW1lLCBwYXJhbXMuZW50aXR5TmFtZSk7XG4gICAgfVxuXG4gICAgLy8gc2V0IGhhc0Jsb2IgZmxhZyBvbiBwYXJhbXMgd2hlbiBibG9iIGZpZWxkIGlzIHByZXNlbnRcbiAgICBwcml2YXRlIGhhc0Jsb2Ioc3RvcmUpIHtcbiAgICAgICAgY29uc3QgYmxvYkNvbHVtbnMgPSBfLmZpbHRlcihzdG9yZS5lbnRpdHlTY2hlbWEuY29sdW1ucywge1xuICAgICAgICAgICAgJ3NxbFR5cGUnIDogJ2Jsb2InXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gISFibG9iQ29sdW1ucy5sZW5ndGg7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBEdXJpbmcgb2ZmbGluZSwgTG9jYWxEQlNlcnZpY2Ugd2lsbCBhbnN3ZXIgdG8gYWxsIHRoZSBjYWxscy4gQWxsIGRhdGEgbW9kaWZpY2F0aW9ucyB3aWxsIGJlIHJlY29yZGVkXG4gICAgICogYW5kIHdpbGwgYmUgcmVwb3J0ZWQgdG8gRGF0YWJhc2VTZXJ2aWNlIHdoZW4gZGV2aWNlIGdvZXMgb25saW5lLlxuICAgICAqL1xuICAgIHByaXZhdGUgbG9jYWxEQmNhbGwob3BlcmF0aW9uLCBwYXJhbXMsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrLCBjbG9uZWRQYXJhbXNVcmwpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vZmZsaW5lREJTZXJ2aWNlW29wZXJhdGlvbi5uYW1lXShwYXJhbXMsIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBpZiAob3BlcmF0aW9uLnR5cGUgPT09ICdSRUFEJykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdG8gY2hhbmdlIGxvZ1xuICAgICAgICAgICAgICAgICAgICBwYXJhbXMub25seU9ubGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtcy51cmwgPSBjbG9uZWRQYXJhbXNVcmw7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNoYW5nZUxvZ1NlcnZpY2UuYWRkKCdEYXRhYmFzZVNlcnZpY2UnLCBvcGVyYXRpb24ubmFtZSwgcGFyYW1zKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gcmVzb2x2ZShyZXNwb25zZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSB7Ym9keSA6IHJlc3BvbnNlLCB0eXBlOiBXTV9MT0NBTF9PRkZMSU5FX0NBTEx9O1xuICAgICAgICAgICAgdHJpZ2dlckZuKHN1Y2Nlc3NDYWxsYmFjaywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9LCBmYWlsdXJlQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogRHVyaW5nIG9ubGluZSwgYWxsIHJlYWQgb3BlcmF0aW9ucyBkYXRhIHdpbGwgYmUgcHVzaGVkIHRvIG9mZmxpbmUgZGF0YWJhc2UuIFNpbWlsYXJseSwgVXBkYXRlIGFuZCBEZWxldGVcbiAgICAgKiBvcGVyYXRpb25zIGFyZSBzeW5jZWQgd2l0aCB0aGUgb2ZmbGluZSBkYXRhYmFzZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlbW90ZURCY2FsbChvcGVyYXRpb24sIG9ubGluZUhhbmRsZXIsIHBhcmFtcyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBvbmxpbmVIYW5kbGVyLmNhbGwodGhpcy5odHRwU2VydmljZSwgcGFyYW1zKS5zdWJzY3JpYmUocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLnNraXBMb2NhbERCKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9mZmxpbmVEQlNlcnZpY2UuZ2V0U3RvcmUocGFyYW1zKS50aGVuKChzdG9yZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcGVyYXRpb24udHlwZSA9PT0gJ1JFQUQnICYmIG9wZXJhdGlvbi5zYXZlUmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmUuc2F2ZUFsbChyZXNwb25zZS5ib2R5LmNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3BlcmF0aW9uLnR5cGUgPT09ICdJTlNFUlQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcyA9IF8uY2xvbmUocGFyYW1zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmRhdGEgPSBfLmNsb25lKHJlc3BvbnNlLmJvZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9mZmxpbmVEQlNlcnZpY2Vbb3BlcmF0aW9uLm5hbWVdKHBhcmFtcywgbm9vcCwgbm9vcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZsaW5lREJTZXJ2aWNlW29wZXJhdGlvbi5uYW1lXShwYXJhbXMsIG5vb3AsIG5vb3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKG5vb3ApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyBvdXQgdGhlIG5lc3RlZCBvYmplY3RzIHRvIHNhdmUgYW5kIHByZXBhcmVzIGEgY2xvbmVkIHBhcmFtcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHByZXBhcmVUb0Nhc2NhZGUocGFyYW1zKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RvcmUocGFyYW1zKS50aGVuKHN0b3JlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkT2JqZWN0UHJvbWlzZXMgPSBbXTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChwYXJhbXMuZGF0YSwgKHYsIGspID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgY29sdW1uOiBDb2x1bW5JbmZvLFxuICAgICAgICAgICAgICAgICAgICBmb3JlaWduUmVsYXRpb246IEZvcmVpZ25SZWxhdGlvbkluZm8sXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkUGFyYW1zO1xuICAgICAgICAgICAgICAgIC8vIE5PVEU6IFNhdmUgb25seSBvbmUtdG8tb25lIHJlbGF0aW9ucyBmb3IgY2FzY2FkZVxuICAgICAgICAgICAgICAgIGlmIChfLmlzT2JqZWN0KHYpICYmICFfLmlzQXJyYXkodikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uID0gc3RvcmUuZW50aXR5U2NoZW1hLmNvbHVtbnMuZmluZChjID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjLnByaW1hcnlLZXkgJiYgYy5mb3JlaWduUmVsYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yZWlnblJlbGF0aW9uID0gYy5mb3JlaWduUmVsYXRpb25zLmZpbmQoIGYgPT4gZi5zb3VyY2VGaWVsZE5hbWUgPT09IGspO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICEhZm9yZWlnblJlbGF0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNvbHVtbikge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZFBhcmFtcyA9IF8uY2xvbmVEZWVwKHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkUGFyYW1zLmVudGl0eU5hbWUgPSBmb3JlaWduUmVsYXRpb24udGFyZ2V0RW50aXR5O1xuICAgICAgICAgICAgICAgICAgICBjaGlsZFBhcmFtcy5kYXRhID0gdjtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRQcm9taXNlID0gdGhpcy5nZXRTdG9yZShjaGlsZFBhcmFtcykudGhlbihjaGlsZFN0b3JlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHBhcmFtcy5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0Q29sdW1ucyA9IGNoaWxkU3RvcmUuZW50aXR5U2NoZW1hLmNvbHVtbnMuZmluZChjID0+IGMubmFtZSA9PT0gZm9yZWlnblJlbGF0aW9uLnRhcmdldENvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Q29sdW1ucyAmJiB0YXJnZXRDb2x1bW5zLmZvcmVpZ25SZWxhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnRGaWVsZE5hbWUgPSB0YXJnZXRDb2x1bW5zLmZvcmVpZ25SZWxhdGlvbnMuZmluZCggZiA9PiBmLnRhcmdldFRhYmxlID09PSBzdG9yZS5lbnRpdHlTY2hlbWEubmFtZSkuc291cmNlRmllbGROYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkUGFyYW1zLmRhdGFbcGFyZW50RmllbGROYW1lXSA9IHBhcmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFtrXSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFBhcmFtcy5vbmx5T25saW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFBhcmFtcy5pc0Nhc2NhZGluZ1N0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRQYXJhbXMuaGFzQmxvYiA9IHRoaXMuaGFzQmxvYihjaGlsZFN0b3JlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkUGFyYW1zLnVybCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmltYXJ5S2V5VmFsdWUgPSBjaGlsZFN0b3JlLmdldFZhbHVlKGNoaWxkUGFyYW1zLmRhdGEsIGNoaWxkU3RvcmUucHJpbWFyeUtleUZpZWxkLmZpZWxkTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJpbWFyeUtleVZhbHVlID8gY2hpbGRTdG9yZS5nZXQocHJpbWFyeUtleVZhbHVlKSA6IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4ob2JqZWN0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvcGVyYXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uID0gY2hpbGRQYXJhbXMuaGFzQmxvYiA/ICd1cGRhdGVNdWx0aVBhcnRUYWJsZURhdGEnIDogJ3VwZGF0ZVRhYmxlRGF0YSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbiA9IGNoaWxkUGFyYW1zLmhhc0Jsb2IgPyAnaW5zZXJ0TXVsdGlQYXJ0VGFibGVEYXRhJyA6ICdpbnNlcnRUYWJsZURhdGEnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25saW5lREJTZXJ2aWNlW29wZXJhdGlvbl0oY2hpbGRQYXJhbXMpLnRvUHJvbWlzZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjaGlsZE9iamVjdFByb21pc2VzLnB1c2goY2hpbGRQcm9taXNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChjaGlsZE9iamVjdFByb21pc2VzKS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzY2FkZTogKCkgPT4gUHJvbWlzZS5hbGwocmVzdWx0Lm1hcChmbiA9PiBmbigpKSlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==