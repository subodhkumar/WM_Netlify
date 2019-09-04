import * as tslib_1 from "tslib";
import { noop, toPromise } from '@wm/core';
import { DeviceVariableService, initiateCallback, VARIABLE_CONSTANTS } from '@wm/variables';
var APP_IS_OFFLINE = 'App is offline.';
var OFFLINE_PLUGIN_NOT_FOUND = 'Offline DB Plugin is required, but missing.';
var ON_BEFORE_BLOCKED = 'onBefore callback returned false.';
var REQUIRED_PLUGINS = ['OFFLINE_DB', 'NETWORK'];
var DatasyncService = /** @class */ (function (_super) {
    tslib_1.__extends(DatasyncService, _super);
    function DatasyncService(app, changeLogService, fileSelectorService, localDBManagementService, localDBDataPullService, processManagementService, securityService, networkService) {
        var _this = _super.call(this) || this;
        _this.name = 'datasync';
        _this.operations = [];
        _this.operations.push(new ExportDBOperation(localDBManagementService));
        _this.operations.push(new GetOfflineChangesOperation(changeLogService));
        _this.operations.push(new ImportDBOperation(fileSelectorService, localDBManagementService));
        _this.operations.push(new LastPullInfoOperation(localDBDataPullService));
        _this.operations.push(new LastPushInfoOperation(changeLogService));
        _this.operations.push(new PullOperation(app, processManagementService, networkService, securityService, localDBDataPullService));
        _this.operations.push(new PushOperation(app, changeLogService, processManagementService, networkService, securityService));
        return _this;
    }
    return DatasyncService;
}(DeviceVariableService));
export { DatasyncService };
var ExportDBOperation = /** @class */ (function () {
    function ExportDBOperation(localDBManagementService) {
        this.localDBManagementService = localDBManagementService;
        this.name = 'exportDB';
        this.model = { path: '' };
        this.properties = [
            { target: 'spinnerContext', hide: false },
            { target: 'spinnerMessage', hide: false }
        ];
        this.requiredCordovaPlugins = REQUIRED_PLUGINS;
    }
    ExportDBOperation.prototype.invoke = function (variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return this.localDBManagementService.exportDB();
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    };
    return ExportDBOperation;
}());
var GetOfflineChangesOperation = /** @class */ (function () {
    function GetOfflineChangesOperation(changeLogService) {
        this.changeLogService = changeLogService;
        this.name = 'getOfflineChanges';
        this.model = {
            total: 0,
            pendingToSync: GetOfflineChangesOperation.CHANGE_LOG_SET,
            failedToSync: GetOfflineChangesOperation.CHANGE_LOG_SET
        };
        this.properties = [
            { target: 'startUpdate', type: 'boolean', value: true, hide: true },
            { target: 'autoUpdate', type: 'boolean', value: true, hide: true }
        ];
        this.requiredCordovaPlugins = REQUIRED_PLUGINS;
    }
    GetOfflineChangesOperation.prototype.invoke = function (variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return getOfflineChanges(this.changeLogService);
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    };
    GetOfflineChangesOperation.DATA_CHANGE_TEMPLATE = {
        service: 'DatabaseService',
        operation: 'operation',
        params: {
            data: {},
            dataModelName: 'dataModelName',
            entityName: 'entityName'
        },
        hasError: 0,
        errorMessage: ''
    };
    GetOfflineChangesOperation.CHANGE_LOG_SET = {
        total: 0,
        database: {
            create: [GetOfflineChangesOperation.DATA_CHANGE_TEMPLATE],
            update: [GetOfflineChangesOperation.DATA_CHANGE_TEMPLATE],
            delete: [GetOfflineChangesOperation.DATA_CHANGE_TEMPLATE]
        },
        uploads: [{
                service: 'OfflineFileUploadService',
                operation: 'uploadToServer',
                params: {
                    file: 'localFilePath',
                    serverUrl: 'serverUrl',
                    ftOptions: {}
                },
                hasError: 0,
                errorMessage: ''
            }]
    };
    return GetOfflineChangesOperation;
}());
var LastPullInfoOperation = /** @class */ (function () {
    function LastPullInfoOperation(localDBDataPullService) {
        this.localDBDataPullService = localDBDataPullService;
        this.name = 'lastPullInfo';
        this.model = {
            databases: [{
                    name: 'datbaseName',
                    entities: [{
                            entityName: 'entityName',
                            pulledRecordCount: 0
                        }],
                    pulledRecordCount: 0
                }],
            totalPulledRecordCount: 0,
            startTime: new Date().toJSON(),
            endTime: new Date().toJSON()
        };
        this.properties = [
            { target: 'startUpdate', type: 'boolean', value: true, hide: true },
            { target: 'spinnerContext', hide: false },
            { target: 'spinnerMessage', hide: false }
        ];
        this.requiredCordovaPlugins = REQUIRED_PLUGINS;
    }
    LastPullInfoOperation.prototype.invoke = function (variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return this.localDBDataPullService.getLastPullInfo();
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    };
    return LastPullInfoOperation;
}());
var LastPushInfoOperation = /** @class */ (function () {
    function LastPushInfoOperation(changeLogService) {
        this.changeLogService = changeLogService;
        this.name = 'lastPushInfo';
        this.model = {
            successfulTaskCount: 0,
            failedTaskCount: 0,
            completedTaskCount: 0,
            totalTaskCount: 0,
            startTime: new Date().toJSON(),
            endTime: new Date().toJSON()
        };
        this.properties = [
            { target: 'startUpdate', type: 'boolean', value: true, hide: true },
            { target: 'spinnerContext', hide: false },
            { target: 'spinnerMessage', hide: false }
        ];
        this.requiredCordovaPlugins = REQUIRED_PLUGINS;
    }
    LastPushInfoOperation.prototype.invoke = function (variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return this.changeLogService.getLastPushInfo();
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    };
    return LastPushInfoOperation;
}());
var ImportDBOperation = /** @class */ (function () {
    function ImportDBOperation(fileSelectorService, localDBManagementService) {
        this.fileSelectorService = fileSelectorService;
        this.localDBManagementService = localDBManagementService;
        this.name = 'importDB';
        this.model = {};
        this.properties = [
            { target: 'spinnerContext', hide: false },
            { target: 'spinnerMessage', hide: false }
        ];
        this.requiredCordovaPlugins = REQUIRED_PLUGINS;
    }
    ImportDBOperation.prototype.invoke = function (variable, options, dataBindings) {
        var _this = this;
        if (window['SQLitePlugin']) {
            return this.fileSelectorService.selectFiles(false, 'zip')
                .then(function (files) {
                if (files && files.length) {
                    return _this.localDBManagementService.importDB(files[0].path, true);
                }
            });
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    };
    return ImportDBOperation;
}());
var PullOperation = /** @class */ (function () {
    function PullOperation(app, processManagementService, networkService, securityService, localDBDataPullService) {
        this.app = app;
        this.processManagementService = processManagementService;
        this.networkService = networkService;
        this.securityService = securityService;
        this.localDBDataPullService = localDBDataPullService;
        this.name = 'pull';
        this.model = {
            totalTaskCount: 0,
            completedTaskCount: 0,
            inProgress: false
        };
        this.properties = [
            { target: 'clearData', type: 'boolean', widgettype: 'boolean-inputfirst', value: true, group: 'properties', subGroup: 'behavior' },
            { target: 'startUpdate', type: 'boolean', hide: false },
            { target: 'onBefore', hide: false },
            { target: 'onProgress', hide: false },
            { target: 'showProgress', hide: false }
        ];
        this.requiredCordovaPlugins = REQUIRED_PLUGINS;
    }
    PullOperation.prototype.invoke = function (variable, options, dataBindings) {
        var _this = this;
        var progressInstance;
        return canExecute(variable, this.networkService, this.securityService)
            .then(function () {
            if (variable.showProgress) {
                return _this.processManagementService.createInstance(_this.app.appLocale.LABEL_DATA_PULL_PROGRESS, 0, 0);
            }
            return null;
        }).then(function (instance) {
            var progressObserver = {
                next: function (pullInfo) {
                    // variable.dataSet = progress; Todo: progress
                    initiateCallback('onProgress', variable, pullInfo);
                    if (progressInstance) {
                        progressInstance.set('max', pullInfo.totalRecordsToPull);
                        progressInstance.set('value', pullInfo.totalPulledRecordCount);
                    }
                }, error: noop, complete: noop
            };
            var clearData = variable.clearData === 'true' || variable.clearData === true, pullPromise = _this.localDBDataPullService.pullAllDbData(clearData, progressObserver);
            if (instance) {
                progressInstance = instance;
                progressInstance.set('stopButtonLabel', _this.app.appLocale.LABEL_DATA_PULL_PROGRESS_STOP_BTN);
                progressInstance.set('onStop', function () {
                    _this.localDBDataPullService.cancel(pullPromise);
                });
            }
            return pullPromise;
        }).catch(function (pullInfo) { return pullInfo; })
            .then(function (pullInfo) {
            if (progressInstance) {
                progressInstance.destroy();
            }
            return pullInfo;
        });
    };
    return PullOperation;
}());
var PushOperation = /** @class */ (function () {
    function PushOperation(app, changeLogService, processManagementService, networkService, securityService) {
        this.app = app;
        this.changeLogService = changeLogService;
        this.processManagementService = processManagementService;
        this.networkService = networkService;
        this.securityService = securityService;
        this.name = 'push';
        this.model = {
            successfulTaskCount: 0,
            failedTaskCount: 0,
            completedTaskCount: 0,
            totalTaskCount: 0,
            inProgress: false
        };
        this.properties = [
            { target: 'onBefore', hide: false },
            { target: 'onProgress', hide: false },
            { target: 'showProgress', 'hide': false, 'value': true }
        ];
        this.requiredCordovaPlugins = REQUIRED_PLUGINS;
    }
    PushOperation.prototype.invoke = function (variable, options, dataBindings) {
        var _this = this;
        var progressInstance;
        if (this.changeLogService.isFlushInProgress()) {
            return Promise.resolve();
        }
        return canExecute(variable, this.networkService, this.securityService)
            .then(function () { return getOfflineChanges(_this.changeLogService); })
            .then(function (changes) {
            if (changes.pendingToSync.total <= 0) {
                return Promise.reject(_.clone(_this.model));
            }
        }).then(function () {
            if (variable.showProgress) {
                return _this.processManagementService.createInstance(_this.app.appLocale.LABEL_DATA_PUSH_PROGRESS, 0, 0);
            }
            return null;
        }).then(function (instance) {
            var progressObserver = {
                next: function (pushInfo) {
                    pushInfo = addOldPropertiesForPushData(pushInfo);
                    initiateCallback('onProgress', variable, pushInfo);
                    if (progressInstance) {
                        progressInstance.set('max', pushInfo.totalTaskCount);
                        progressInstance.set('value', pushInfo.completedTaskCount);
                    }
                }, error: noop, complete: noop
            };
            var pushPromise = _this.changeLogService.flush(progressObserver);
            if (instance) {
                progressInstance = instance;
                progressInstance.set('stopButtonLabel', _this.app.appLocale.LABEL_DATA_PUSH_PROGRESS_STOP_BTN);
                progressInstance.set('onStop', function () { return _this.changeLogService.stop(); });
            }
            return pushPromise;
        })
            .catch(function (pushInfo) { return pushInfo; })
            .then(function (pushInfo) {
            if (progressInstance) {
                progressInstance.destroy();
            }
            if (pushInfo && pushInfo.totalTaskCount !== undefined) {
                pushInfo = addOldPropertiesForPushData(pushInfo);
                if (pushInfo.failedTaskCount !== 0) {
                    return Promise.reject(pushInfo);
                }
                return pushInfo;
            }
            return Promise.reject(pushInfo);
        });
    };
    return PushOperation;
}());
/**
 * This function adds the old properties to the push dataSet to support old projects.
 * @param data
 * @returns {*}
 */
var addOldPropertiesForPushData = function (data) {
    var result = _.clone(data);
    result.success = data.successfulTaskCount;
    result.error = data.failedTaskCount;
    result.completed = data.completedTaskCount;
    result.total = data.totalTaskCount;
    return result;
};
var ɵ0 = addOldPropertiesForPushData;
var canExecute = function (variable, networkService, securityService) {
    if (!window['SQLitePlugin']) {
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
    if (!networkService.isConnected()) {
        return Promise.reject(APP_IS_OFFLINE);
    }
    return toPromise(initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE, variable, null))
        .then(function (proceed) {
        if (proceed === false) {
            return Promise.reject(ON_BEFORE_BLOCKED);
        }
        // If user is authenticated and online, then start the data pull process.
        return securityService.onUserLogin();
    });
};
var ɵ1 = canExecute;
var generateChangeSet = function (changes) {
    var createChanges = _.filter(changes, function (c) {
        return c.service === 'DatabaseService' &&
            (c.operation === 'insertTableData'
                || c.operation === 'insertMultiPartTableData');
    }), updateChanges = _.filter(changes, function (c) {
        return c.service === 'DatabaseService' &&
            (c.operation === 'updateTableData'
                || c.operation === 'updateMultiPartTableData');
    });
    return {
        total: changes ? changes.length : 0,
        database: {
            create: createChanges,
            update: updateChanges,
            delete: _.filter(changes, { service: 'DatabaseService', operation: 'deleteTableData' })
        },
        uploads: _.filter(changes, { service: 'OfflineFileUploadService', operation: 'uploadToServer' })
    };
};
var ɵ2 = generateChangeSet;
var getOfflineChanges = function (changeLogService) {
    return changeLogService.getChanges().then(function (changes) {
        return {
            'total': changes ? changes.length : 0,
            'pendingToSync': generateChangeSet(_.filter(changes, { 'hasError': 0 })),
            'failedToSync': generateChangeSet(_.filter(changes, { 'hasError': 1 }))
        };
    });
};
var ɵ3 = getOfflineChanges;
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YXN5bmMtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvdmFyaWFibGVzLyIsInNvdXJjZXMiOlsic2VydmljZXMvZGF0YXN5bmMtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsT0FBTyxFQUFPLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJaEQsT0FBTyxFQUFFLHFCQUFxQixFQUE0QixnQkFBZ0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUt0SCxJQUFNLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQztBQUN6QyxJQUFNLHdCQUF3QixHQUFHLDZDQUE2QyxDQUFDO0FBQy9FLElBQU0saUJBQWlCLEdBQUcsbUNBQW1DLENBQUM7QUFDOUQsSUFBTSxnQkFBZ0IsR0FBRyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztBQUVuRDtJQUFxQywyQ0FBcUI7SUFJdEQseUJBQVksR0FBUSxFQUNSLGdCQUFrQyxFQUNsQyxtQkFBd0MsRUFDeEMsd0JBQWtELEVBQ2xELHNCQUE4QyxFQUM5Qyx3QkFBa0QsRUFDbEQsZUFBZ0MsRUFDaEMsY0FBOEI7UUFQMUMsWUFRSSxpQkFBTyxTQVFWO1FBbkJlLFVBQUksR0FBRyxVQUFVLENBQUM7UUFDbEIsZ0JBQVUsR0FBK0IsRUFBRSxDQUFDO1FBV3hELEtBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLEtBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksMEJBQTBCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLEtBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsbUJBQW1CLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1FBQzNGLEtBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElB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QUUsU0FBUyxFQUFFLGlCQUFpQixFQUFDLENBQUM7U0FDeEY7UUFDRCxPQUFPLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBQyxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFDLENBQUM7S0FDakcsQ0FBQztBQUNOLENBQUMsQ0FBQzs7QUFFRixJQUFNLGlCQUFpQixHQUFHLFVBQUMsZ0JBQWtDO0lBQ3pELE9BQU8sZ0JBQWdCLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUEsT0FBTztRQUM3QyxPQUFPO1lBQ0gsT0FBTyxFQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxlQUFlLEVBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBQyxVQUFVLEVBQUcsQ0FBQyxFQUFDLENBQUMsQ0FBQztZQUN4RSxjQUFjLEVBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBQyxVQUFVLEVBQUcsQ0FBQyxFQUFDLENBQUMsQ0FBQztTQUMxRSxDQUFDO0lBQ04sQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPYnNlcnZlciB9IGZyb20gJ3J4anMvaW5kZXgnO1xuXG5pbXBvcnQgeyBBcHAsIG5vb3AsIHRvUHJvbWlzZSB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IE5ldHdvcmtTZXJ2aWNlIH0gZnJvbSAnQHdtL21vYmlsZS9jb3JlJztcbmltcG9ydCB7IEZpbGVTZWxlY3RvclNlcnZpY2UsIFByb2Nlc3NBcGksIFByb2Nlc3NNYW5hZ2VtZW50U2VydmljZSB9IGZyb20gJ0B3bS9tb2JpbGUvY29tcG9uZW50cyc7XG5pbXBvcnQgeyBDaGFuZ2UsIENoYW5nZUxvZ1NlcnZpY2UsIExvY2FsREJNYW5hZ2VtZW50U2VydmljZSwgTG9jYWxEQkRhdGFQdWxsU2VydmljZSwgUHVzaEluZm8sIFB1bGxJbmZvIH0gZnJvbSAnQHdtL21vYmlsZS9vZmZsaW5lJztcbmltcG9ydCB7IERldmljZVZhcmlhYmxlU2VydmljZSwgSURldmljZVZhcmlhYmxlT3BlcmF0aW9uLCBpbml0aWF0ZUNhbGxiYWNrLCBWQVJJQUJMRV9DT05TVEFOVFMgfSBmcm9tICdAd20vdmFyaWFibGVzJztcbmltcG9ydCB7IFNlY3VyaXR5U2VydmljZSB9IGZyb20gJ0B3bS9zZWN1cml0eSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuY29uc3QgQVBQX0lTX09GRkxJTkUgPSAnQXBwIGlzIG9mZmxpbmUuJztcbmNvbnN0IE9GRkxJTkVfUExVR0lOX05PVF9GT1VORCA9ICdPZmZsaW5lIERCIFBsdWdpbiBpcyByZXF1aXJlZCwgYnV0IG1pc3NpbmcuJztcbmNvbnN0IE9OX0JFRk9SRV9CTE9DS0VEID0gJ29uQmVmb3JlIGNhbGxiYWNrIHJldHVybmVkIGZhbHNlLic7XG5jb25zdCBSRVFVSVJFRF9QTFVHSU5TID0gWydPRkZMSU5FX0RCJywgJ05FVFdPUksnXTtcblxuZXhwb3J0IGNsYXNzIERhdGFzeW5jU2VydmljZSBleHRlbmRzIERldmljZVZhcmlhYmxlU2VydmljZSB7XG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWUgPSAnZGF0YXN5bmMnO1xuICAgIHB1YmxpYyByZWFkb25seSBvcGVyYXRpb25zOiBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb25bXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IoYXBwOiBBcHAsXG4gICAgICAgICAgICAgICAgY2hhbmdlTG9nU2VydmljZTogQ2hhbmdlTG9nU2VydmljZSxcbiAgICAgICAgICAgICAgICBmaWxlU2VsZWN0b3JTZXJ2aWNlOiBGaWxlU2VsZWN0b3JTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZTogTG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIGxvY2FsREJEYXRhUHVsbFNlcnZpY2U6IExvY2FsREJEYXRhUHVsbFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgcHJvY2Vzc01hbmFnZW1lbnRTZXJ2aWNlOiBQcm9jZXNzTWFuYWdlbWVudFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgc2VjdXJpdHlTZXJ2aWNlOiBTZWN1cml0eVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgbmV0d29ya1NlcnZpY2U6IE5ldHdvcmtTZXJ2aWNlKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMub3BlcmF0aW9ucy5wdXNoKG5ldyBFeHBvcnREQk9wZXJhdGlvbihsb2NhbERCTWFuYWdlbWVudFNlcnZpY2UpKTtcbiAgICAgICAgdGhpcy5vcGVyYXRpb25zLnB1c2gobmV3IEdldE9mZmxpbmVDaGFuZ2VzT3BlcmF0aW9uKGNoYW5nZUxvZ1NlcnZpY2UpKTtcbiAgICAgICAgdGhpcy5vcGVyYXRpb25zLnB1c2gobmV3IEltcG9ydERCT3BlcmF0aW9uKGZpbGVTZWxlY3RvclNlcnZpY2UsIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZSkpO1xuICAgICAgICB0aGlzLm9wZXJhdGlvbnMucHVzaChuZXcgTGFzdFB1bGxJbmZvT3BlcmF0aW9uKGxvY2FsREJEYXRhUHVsbFNlcnZpY2UpKTtcbiAgICAgICAgdGhpcy5vcGVyYXRpb25zLnB1c2gobmV3IExhc3RQdXNoSW5mb09wZXJhdGlvbihjaGFuZ2VMb2dTZXJ2aWNlKSk7XG4gICAgICAgIHRoaXMub3BlcmF0aW9ucy5wdXNoKG5ldyBQdWxsT3BlcmF0aW9uKGFwcCwgcHJvY2Vzc01hbmFnZW1lbnRTZXJ2aWNlLCBuZXR3b3JrU2VydmljZSwgc2VjdXJpdHlTZXJ2aWNlLCBsb2NhbERCRGF0YVB1bGxTZXJ2aWNlKSk7XG4gICAgICAgIHRoaXMub3BlcmF0aW9ucy5wdXNoKG5ldyBQdXNoT3BlcmF0aW9uKGFwcCwgY2hhbmdlTG9nU2VydmljZSwgcHJvY2Vzc01hbmFnZW1lbnRTZXJ2aWNlLCBuZXR3b3JrU2VydmljZSwgc2VjdXJpdHlTZXJ2aWNlKSk7XG4gICAgfVxufVxuXG5jbGFzcyBFeHBvcnREQk9wZXJhdGlvbiBpbXBsZW1lbnRzIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiB7XG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWUgPSAnZXhwb3J0REInO1xuICAgIHB1YmxpYyByZWFkb25seSBtb2RlbCA9IHtwYXRoOiAnJ307XG4gICAgcHVibGljIHJlYWRvbmx5IHByb3BlcnRpZXMgPSBbXG4gICAgICAgIHt0YXJnZXQ6ICdzcGlubmVyQ29udGV4dCcsIGhpZGU6IGZhbHNlfSxcbiAgICAgICAge3RhcmdldDogJ3NwaW5uZXJNZXNzYWdlJywgaGlkZTogZmFsc2V9XG4gICAgXTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmVxdWlyZWRDb3Jkb3ZhUGx1Z2lucyA9IFJFUVVJUkVEX1BMVUdJTlM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZTogTG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlKSB7XG4gICAgfVxuXG4gICAgcHVibGljIGludm9rZSh2YXJpYWJsZTogYW55LCBvcHRpb25zOiBhbnksIGRhdGFCaW5kaW5nczogTWFwPHN0cmluZywgYW55Pik6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGlmICh3aW5kb3dbJ1NRTGl0ZVBsdWdpbiddKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbERCTWFuYWdlbWVudFNlcnZpY2UuZXhwb3J0REIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoT0ZGTElORV9QTFVHSU5fTk9UX0ZPVU5EKTtcbiAgICB9XG59XG5cblxuY2xhc3MgR2V0T2ZmbGluZUNoYW5nZXNPcGVyYXRpb24gaW1wbGVtZW50cyBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb24ge1xuICAgIHByaXZhdGUgc3RhdGljIERBVEFfQ0hBTkdFX1RFTVBMQVRFID0ge1xuICAgICAgICBzZXJ2aWNlOiAnRGF0YWJhc2VTZXJ2aWNlJyxcbiAgICAgICAgb3BlcmF0aW9uOiAnb3BlcmF0aW9uJyxcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICBkYXRhOiB7fSxcbiAgICAgICAgICAgIGRhdGFNb2RlbE5hbWU6ICdkYXRhTW9kZWxOYW1lJyxcbiAgICAgICAgICAgIGVudGl0eU5hbWU6ICdlbnRpdHlOYW1lJ1xuICAgICAgICB9LFxuICAgICAgICBoYXNFcnJvcjogMCxcbiAgICAgICAgZXJyb3JNZXNzYWdlOiAnJ1xuICAgIH07XG4gICAgcHJpdmF0ZSBzdGF0aWMgQ0hBTkdFX0xPR19TRVQgPSB7XG4gICAgICAgIHRvdGFsOiAwLFxuICAgICAgICBkYXRhYmFzZToge1xuICAgICAgICAgICAgY3JlYXRlOiBbR2V0T2ZmbGluZUNoYW5nZXNPcGVyYXRpb24uREFUQV9DSEFOR0VfVEVNUExBVEVdLFxuICAgICAgICAgICAgdXBkYXRlOiBbR2V0T2ZmbGluZUNoYW5nZXNPcGVyYXRpb24uREFUQV9DSEFOR0VfVEVNUExBVEVdLFxuICAgICAgICAgICAgZGVsZXRlOiBbR2V0T2ZmbGluZUNoYW5nZXNPcGVyYXRpb24uREFUQV9DSEFOR0VfVEVNUExBVEVdXG4gICAgICAgIH0sXG4gICAgICAgIHVwbG9hZHM6IFt7XG4gICAgICAgICAgICBzZXJ2aWNlOiAnT2ZmbGluZUZpbGVVcGxvYWRTZXJ2aWNlJyxcbiAgICAgICAgICAgIG9wZXJhdGlvbjogJ3VwbG9hZFRvU2VydmVyJyxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIGZpbGU6ICdsb2NhbEZpbGVQYXRoJyxcbiAgICAgICAgICAgICAgICBzZXJ2ZXJVcmw6ICdzZXJ2ZXJVcmwnLFxuICAgICAgICAgICAgICAgIGZ0T3B0aW9uczoge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYXNFcnJvcjogMCxcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJydcbiAgICAgICAgfV1cbiAgICB9O1xuICAgIHB1YmxpYyByZWFkb25seSBuYW1lID0gJ2dldE9mZmxpbmVDaGFuZ2VzJztcbiAgICBwdWJsaWMgcmVhZG9ubHkgbW9kZWwgPSB7XG4gICAgICAgIHRvdGFsOiAwLFxuICAgICAgICBwZW5kaW5nVG9TeW5jOiBHZXRPZmZsaW5lQ2hhbmdlc09wZXJhdGlvbi5DSEFOR0VfTE9HX1NFVCxcbiAgICAgICAgZmFpbGVkVG9TeW5jOiBHZXRPZmZsaW5lQ2hhbmdlc09wZXJhdGlvbi5DSEFOR0VfTE9HX1NFVFxuICAgIH07XG4gICAgcHVibGljIHJlYWRvbmx5IHByb3BlcnRpZXMgPSBbXG4gICAgICAgIHt0YXJnZXQ6ICdzdGFydFVwZGF0ZScsIHR5cGU6ICdib29sZWFuJywgdmFsdWU6IHRydWUsIGhpZGU6IHRydWV9LFxuICAgICAgICB7dGFyZ2V0OiAnYXV0b1VwZGF0ZScsIHR5cGU6ICdib29sZWFuJywgdmFsdWU6IHRydWUsIGhpZGU6IHRydWV9XG4gICAgXTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmVxdWlyZWRDb3Jkb3ZhUGx1Z2lucyA9IFJFUVVJUkVEX1BMVUdJTlM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNoYW5nZUxvZ1NlcnZpY2U6IENoYW5nZUxvZ1NlcnZpY2UpIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW52b2tlKHZhcmlhYmxlOiBhbnksIG9wdGlvbnM6IGFueSwgZGF0YUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgaWYgKHdpbmRvd1snU1FMaXRlUGx1Z2luJ10pIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRPZmZsaW5lQ2hhbmdlcyh0aGlzLmNoYW5nZUxvZ1NlcnZpY2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChPRkZMSU5FX1BMVUdJTl9OT1RfRk9VTkQpO1xuICAgIH1cbn1cblxuY2xhc3MgTGFzdFB1bGxJbmZvT3BlcmF0aW9uIGltcGxlbWVudHMgSURldmljZVZhcmlhYmxlT3BlcmF0aW9uIHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9ICdsYXN0UHVsbEluZm8nO1xuICAgIHB1YmxpYyByZWFkb25seSBtb2RlbCA9IHtcbiAgICAgICAgZGF0YWJhc2VzIDogW3tcbiAgICAgICAgICAgIG5hbWUgOiAnZGF0YmFzZU5hbWUnLFxuICAgICAgICAgICAgZW50aXRpZXM6IFt7XG4gICAgICAgICAgICAgICAgZW50aXR5TmFtZTogJ2VudGl0eU5hbWUnLFxuICAgICAgICAgICAgICAgIHB1bGxlZFJlY29yZENvdW50OiAwXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIHB1bGxlZFJlY29yZENvdW50OiAwXG4gICAgICAgIH1dLFxuICAgICAgICB0b3RhbFB1bGxlZFJlY29yZENvdW50OiAwLFxuICAgICAgICBzdGFydFRpbWU6IG5ldyBEYXRlKCkudG9KU09OKCksXG4gICAgICAgIGVuZFRpbWU6IG5ldyBEYXRlKCkudG9KU09OKClcbiAgICB9O1xuICAgIHB1YmxpYyByZWFkb25seSBwcm9wZXJ0aWVzID0gW1xuICAgICAgICB7dGFyZ2V0OiAnc3RhcnRVcGRhdGUnLCB0eXBlOiAnYm9vbGVhbicsIHZhbHVlOiB0cnVlLCBoaWRlOiB0cnVlfSxcbiAgICAgICAge3RhcmdldDogJ3NwaW5uZXJDb250ZXh0JywgaGlkZTogZmFsc2V9LFxuICAgICAgICB7dGFyZ2V0OiAnc3Bpbm5lck1lc3NhZ2UnLCBoaWRlOiBmYWxzZX1cbiAgICBdO1xuICAgIHB1YmxpYyByZWFkb25seSByZXF1aXJlZENvcmRvdmFQbHVnaW5zID0gUkVRVUlSRURfUExVR0lOUztcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9jYWxEQkRhdGFQdWxsU2VydmljZTogTG9jYWxEQkRhdGFQdWxsU2VydmljZSkge1xuICAgIH1cblxuICAgIHB1YmxpYyBpbnZva2UodmFyaWFibGU6IGFueSwgb3B0aW9uczogYW55LCBkYXRhQmluZGluZ3M6IE1hcDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBpZiAod2luZG93WydTUUxpdGVQbHVnaW4nXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxEQkRhdGFQdWxsU2VydmljZS5nZXRMYXN0UHVsbEluZm8oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoT0ZGTElORV9QTFVHSU5fTk9UX0ZPVU5EKTtcbiAgICB9XG59XG5cbmNsYXNzIExhc3RQdXNoSW5mb09wZXJhdGlvbiBpbXBsZW1lbnRzIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiB7XG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWUgPSAnbGFzdFB1c2hJbmZvJztcbiAgICBwdWJsaWMgcmVhZG9ubHkgbW9kZWwgPSB7XG4gICAgICAgIHN1Y2Nlc3NmdWxUYXNrQ291bnQ6IDAsXG4gICAgICAgIGZhaWxlZFRhc2tDb3VudDogMCxcbiAgICAgICAgY29tcGxldGVkVGFza0NvdW50OiAwLFxuICAgICAgICB0b3RhbFRhc2tDb3VudDogMCxcbiAgICAgICAgc3RhcnRUaW1lOiBuZXcgRGF0ZSgpLnRvSlNPTigpLFxuICAgICAgICBlbmRUaW1lOiBuZXcgRGF0ZSgpLnRvSlNPTigpXG4gICAgfTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJvcGVydGllcyA9IFtcbiAgICAgICAge3RhcmdldDogJ3N0YXJ0VXBkYXRlJywgdHlwZTogJ2Jvb2xlYW4nLCB2YWx1ZTogdHJ1ZSwgaGlkZTogdHJ1ZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdzcGlubmVyQ29udGV4dCcsIGhpZGU6IGZhbHNlfSxcbiAgICAgICAge3RhcmdldDogJ3NwaW5uZXJNZXNzYWdlJywgaGlkZTogZmFsc2V9XG4gICAgXTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmVxdWlyZWRDb3Jkb3ZhUGx1Z2lucyA9IFJFUVVJUkVEX1BMVUdJTlM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNoYW5nZUxvZ1NlcnZpY2U6IENoYW5nZUxvZ1NlcnZpY2UpIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW52b2tlKHZhcmlhYmxlOiBhbnksIG9wdGlvbnM6IGFueSwgZGF0YUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgaWYgKHdpbmRvd1snU1FMaXRlUGx1Z2luJ10pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoYW5nZUxvZ1NlcnZpY2UuZ2V0TGFzdFB1c2hJbmZvKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KE9GRkxJTkVfUExVR0lOX05PVF9GT1VORCk7XG4gICAgfVxufVxuXG5jbGFzcyBJbXBvcnREQk9wZXJhdGlvbiBpbXBsZW1lbnRzIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiB7XG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWUgPSAnaW1wb3J0REInO1xuICAgIHB1YmxpYyByZWFkb25seSBtb2RlbCA9IHt9O1xuICAgIHB1YmxpYyByZWFkb25seSBwcm9wZXJ0aWVzID0gW1xuICAgICAgICB7dGFyZ2V0OiAnc3Bpbm5lckNvbnRleHQnLCBoaWRlOiBmYWxzZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdzcGlubmVyTWVzc2FnZScsIGhpZGU6IGZhbHNlfVxuICAgIF07XG4gICAgcHVibGljIHJlYWRvbmx5IHJlcXVpcmVkQ29yZG92YVBsdWdpbnMgPSBSRVFVSVJFRF9QTFVHSU5TO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgZmlsZVNlbGVjdG9yU2VydmljZTogRmlsZVNlbGVjdG9yU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2U6IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSkge1xuICAgIH1cblxuICAgIHB1YmxpYyBpbnZva2UodmFyaWFibGU6IGFueSwgb3B0aW9uczogYW55LCBkYXRhQmluZGluZ3M6IE1hcDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBpZiAod2luZG93WydTUUxpdGVQbHVnaW4nXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsZVNlbGVjdG9yU2VydmljZS5zZWxlY3RGaWxlcyhmYWxzZSwgICd6aXAnKVxuICAgICAgICAgICAgICAgIC50aGVuKGZpbGVzID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZmlsZXMgJiYgZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsREJNYW5hZ2VtZW50U2VydmljZS5pbXBvcnREQihmaWxlc1swXS5wYXRoLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoT0ZGTElORV9QTFVHSU5fTk9UX0ZPVU5EKTtcbiAgICB9XG59XG5cbmNsYXNzIFB1bGxPcGVyYXRpb24gaW1wbGVtZW50cyBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb24ge1xuICAgIHB1YmxpYyByZWFkb25seSBuYW1lID0gJ3B1bGwnO1xuICAgIHB1YmxpYyByZWFkb25seSBtb2RlbCA9IHtcbiAgICAgICAgdG90YWxUYXNrQ291bnQ6IDAsXG4gICAgICAgIGNvbXBsZXRlZFRhc2tDb3VudDogMCxcbiAgICAgICAgaW5Qcm9ncmVzczogZmFsc2VcbiAgICB9O1xuICAgIHB1YmxpYyByZWFkb25seSBwcm9wZXJ0aWVzID0gW1xuICAgICAgICB7dGFyZ2V0OiAnY2xlYXJEYXRhJywgdHlwZTogJ2Jvb2xlYW4nLCB3aWRnZXR0eXBlOiAnYm9vbGVhbi1pbnB1dGZpcnN0JywgdmFsdWU6IHRydWUsIGdyb3VwOiAncHJvcGVydGllcycsIHN1Ykdyb3VwOiAnYmVoYXZpb3InfSxcbiAgICAgICAge3RhcmdldDogJ3N0YXJ0VXBkYXRlJywgdHlwZTogJ2Jvb2xlYW4nLCBoaWRlOiBmYWxzZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdvbkJlZm9yZScsIGhpZGU6IGZhbHNlfSxcbiAgICAgICAge3RhcmdldDogJ29uUHJvZ3Jlc3MnLCBoaWRlOiBmYWxzZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdzaG93UHJvZ3Jlc3MnLCBoaWRlOiBmYWxzZX1cbiAgICBdO1xuICAgIHB1YmxpYyByZWFkb25seSByZXF1aXJlZENvcmRvdmFQbHVnaW5zID0gUkVRVUlSRURfUExVR0lOUztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBwcml2YXRlIHByb2Nlc3NNYW5hZ2VtZW50U2VydmljZTogUHJvY2Vzc01hbmFnZW1lbnRTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIG5ldHdvcmtTZXJ2aWNlOiBOZXR3b3JrU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBzZWN1cml0eVNlcnZpY2U6IFNlY3VyaXR5U2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBsb2NhbERCRGF0YVB1bGxTZXJ2aWNlOiBMb2NhbERCRGF0YVB1bGxTZXJ2aWNlKSB7XG4gICAgfVxuXG4gICAgcHVibGljIGludm9rZSh2YXJpYWJsZTogYW55LCBvcHRpb25zOiBhbnksIGRhdGFCaW5kaW5nczogTWFwPHN0cmluZywgYW55Pik6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGxldCBwcm9ncmVzc0luc3RhbmNlO1xuICAgICAgICByZXR1cm4gY2FuRXhlY3V0ZSh2YXJpYWJsZSwgdGhpcy5uZXR3b3JrU2VydmljZSwgdGhpcy5zZWN1cml0eVNlcnZpY2UpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHZhcmlhYmxlLnNob3dQcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzTWFuYWdlbWVudFNlcnZpY2UuY3JlYXRlSW5zdGFuY2UodGhpcy5hcHAuYXBwTG9jYWxlLkxBQkVMX0RBVEFfUFVMTF9QUk9HUkVTUywgMCwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSkudGhlbigoaW5zdGFuY2U6IFByb2Nlc3NBcGkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9ncmVzc09ic2VydmVyOiBPYnNlcnZlcjxQdWxsSW5mbz4gPSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQ6IChwdWxsSW5mbzogUHVsbEluZm8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHZhcmlhYmxlLmRhdGFTZXQgPSBwcm9ncmVzczsgVG9kbzogcHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soJ29uUHJvZ3Jlc3MnLCB2YXJpYWJsZSwgcHVsbEluZm8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyZXNzSW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0luc3RhbmNlLnNldCgnbWF4JywgcHVsbEluZm8udG90YWxSZWNvcmRzVG9QdWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0luc3RhbmNlLnNldCgndmFsdWUnLCBwdWxsSW5mby50b3RhbFB1bGxlZFJlY29yZENvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgZXJyb3I6IG5vb3AsIGNvbXBsZXRlOiBub29wfTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNsZWFyRGF0YSA9IHZhcmlhYmxlLmNsZWFyRGF0YSA9PT0gJ3RydWUnIHx8IHZhcmlhYmxlLmNsZWFyRGF0YSA9PT0gdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcHVsbFByb21pc2UgPSB0aGlzLmxvY2FsREJEYXRhUHVsbFNlcnZpY2UucHVsbEFsbERiRGF0YShjbGVhckRhdGEsIHByb2dyZXNzT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0luc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzSW5zdGFuY2Uuc2V0KCdzdG9wQnV0dG9uTGFiZWwnLCB0aGlzLmFwcC5hcHBMb2NhbGUuTEFCRUxfREFUQV9QVUxMX1BST0dSRVNTX1NUT1BfQlROKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NJbnN0YW5jZS5zZXQoJ29uU3RvcCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYWxEQkRhdGFQdWxsU2VydmljZS5jYW5jZWwocHVsbFByb21pc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHVsbFByb21pc2U7XG4gICAgICAgIH0pLmNhdGNoKHB1bGxJbmZvID0+IHB1bGxJbmZvKVxuICAgICAgICAgICAgLnRoZW4ocHVsbEluZm8gPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzc0luc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzSW5zdGFuY2UuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcHVsbEluZm87XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNsYXNzIFB1c2hPcGVyYXRpb24gaW1wbGVtZW50cyBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb24ge1xuICAgIHB1YmxpYyByZWFkb25seSBuYW1lID0gJ3B1c2gnO1xuICAgIHB1YmxpYyByZWFkb25seSBtb2RlbCA9IHtcbiAgICAgICAgc3VjY2Vzc2Z1bFRhc2tDb3VudDogMCxcbiAgICAgICAgZmFpbGVkVGFza0NvdW50OiAwLFxuICAgICAgICBjb21wbGV0ZWRUYXNrQ291bnQ6IDAsXG4gICAgICAgIHRvdGFsVGFza0NvdW50OiAwLFxuICAgICAgICBpblByb2dyZXNzOiBmYWxzZVxuICAgIH07XG4gICAgcHVibGljIHJlYWRvbmx5IHByb3BlcnRpZXMgPSBbXG4gICAgICAgIHt0YXJnZXQ6ICdvbkJlZm9yZScsIGhpZGU6IGZhbHNlfSxcbiAgICAgICAge3RhcmdldDogJ29uUHJvZ3Jlc3MnLCBoaWRlOiBmYWxzZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdzaG93UHJvZ3Jlc3MnLCAnaGlkZSc6IGZhbHNlLCAndmFsdWUnOiB0cnVlfVxuICAgIF07XG4gICAgcHVibGljIHJlYWRvbmx5IHJlcXVpcmVkQ29yZG92YVBsdWdpbnMgPSBSRVFVSVJFRF9QTFVHSU5TO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBhcHA6IEFwcCxcbiAgICAgICAgICAgICAgICBwcml2YXRlIGNoYW5nZUxvZ1NlcnZpY2U6IENoYW5nZUxvZ1NlcnZpY2UsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBwcm9jZXNzTWFuYWdlbWVudFNlcnZpY2U6IFByb2Nlc3NNYW5hZ2VtZW50U2VydmljZSxcbiAgICAgICAgICAgICAgICBwcml2YXRlIG5ldHdvcmtTZXJ2aWNlOiBOZXR3b3JrU2VydmljZSxcbiAgICAgICAgICAgICAgICBwcml2YXRlIHNlY3VyaXR5U2VydmljZTogU2VjdXJpdHlTZXJ2aWNlKSB7XG4gICAgfVxuXG4gICAgcHVibGljIGludm9rZSh2YXJpYWJsZTogYW55LCBvcHRpb25zOiBhbnksIGRhdGFCaW5kaW5nczogTWFwPHN0cmluZywgYW55Pik6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGxldCBwcm9ncmVzc0luc3RhbmNlO1xuICAgICAgICBpZiAodGhpcy5jaGFuZ2VMb2dTZXJ2aWNlLmlzRmx1c2hJblByb2dyZXNzKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FuRXhlY3V0ZSh2YXJpYWJsZSwgdGhpcy5uZXR3b3JrU2VydmljZSwgdGhpcy5zZWN1cml0eVNlcnZpY2UpXG4gICAgICAgICAgICAudGhlbigoKSA9PiBnZXRPZmZsaW5lQ2hhbmdlcyh0aGlzLmNoYW5nZUxvZ1NlcnZpY2UpKVxuICAgICAgICAgICAgLnRoZW4oY2hhbmdlcyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNoYW5nZXMucGVuZGluZ1RvU3luYy50b3RhbCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChfLmNsb25lKHRoaXMubW9kZWwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodmFyaWFibGUuc2hvd1Byb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NNYW5hZ2VtZW50U2VydmljZS5jcmVhdGVJbnN0YW5jZSh0aGlzLmFwcC5hcHBMb2NhbGUuTEFCRUxfREFUQV9QVVNIX1BST0dSRVNTLCAwLCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KS50aGVuKChpbnN0YW5jZTogUHJvY2Vzc0FwaSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzT2JzZXJ2ZXI6IE9ic2VydmVyPFB1c2hJbmZvPiA9IHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dDogKHB1c2hJbmZvOiBQdXNoSW5mbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHVzaEluZm8gPSBhZGRPbGRQcm9wZXJ0aWVzRm9yUHVzaERhdGEocHVzaEluZm8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjaygnb25Qcm9ncmVzcycsIHZhcmlhYmxlLCBwdXNoSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3NJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzSW5zdGFuY2Uuc2V0KCdtYXgnLCBwdXNoSW5mby50b3RhbFRhc2tDb3VudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NJbnN0YW5jZS5zZXQoJ3ZhbHVlJywgcHVzaEluZm8uY29tcGxldGVkVGFza0NvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgZXJyb3I6IG5vb3AsIGNvbXBsZXRlOiBub29wfTtcbiAgICAgICAgICAgICAgICBjb25zdCBwdXNoUHJvbWlzZSA9IHRoaXMuY2hhbmdlTG9nU2VydmljZS5mbHVzaChwcm9ncmVzc09ic2VydmVyKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NJbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0luc3RhbmNlLnNldCgnc3RvcEJ1dHRvbkxhYmVsJywgdGhpcy5hcHAuYXBwTG9jYWxlLkxBQkVMX0RBVEFfUFVTSF9QUk9HUkVTU19TVE9QX0JUTik7XG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzSW5zdGFuY2Uuc2V0KCdvblN0b3AnLCAoKSA9PiB0aGlzLmNoYW5nZUxvZ1NlcnZpY2Uuc3RvcCgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHB1c2hQcm9taXNlO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChwdXNoSW5mbyA9PiBwdXNoSW5mbylcbiAgICAgICAgICAgIC50aGVuKHB1c2hJbmZvID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3NJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0luc3RhbmNlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHB1c2hJbmZvICYmIHB1c2hJbmZvLnRvdGFsVGFza0NvdW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcHVzaEluZm8gPSBhZGRPbGRQcm9wZXJ0aWVzRm9yUHVzaERhdGEocHVzaEluZm8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHVzaEluZm8uZmFpbGVkVGFza0NvdW50ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocHVzaEluZm8pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwdXNoSW5mbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHB1c2hJbmZvKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlIG9sZCBwcm9wZXJ0aWVzIHRvIHRoZSBwdXNoIGRhdGFTZXQgdG8gc3VwcG9ydCBvbGQgcHJvamVjdHMuXG4gKiBAcGFyYW0gZGF0YVxuICogQHJldHVybnMgeyp9XG4gKi9cbmNvbnN0IGFkZE9sZFByb3BlcnRpZXNGb3JQdXNoRGF0YSA9IGRhdGEgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IF8uY2xvbmUoZGF0YSk7XG4gICAgcmVzdWx0LnN1Y2Nlc3MgPSBkYXRhLnN1Y2Nlc3NmdWxUYXNrQ291bnQ7XG4gICAgcmVzdWx0LmVycm9yID0gZGF0YS5mYWlsZWRUYXNrQ291bnQ7XG4gICAgcmVzdWx0LmNvbXBsZXRlZCA9IGRhdGEuY29tcGxldGVkVGFza0NvdW50O1xuICAgIHJlc3VsdC50b3RhbCA9IGRhdGEudG90YWxUYXNrQ291bnQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmNvbnN0IGNhbkV4ZWN1dGUgPSAodmFyaWFibGU6IGFueSwgbmV0d29ya1NlcnZpY2U6IE5ldHdvcmtTZXJ2aWNlLCBzZWN1cml0eVNlcnZpY2U6IFNlY3VyaXR5U2VydmljZSkgPT4ge1xuICAgIGlmICghd2luZG93WydTUUxpdGVQbHVnaW4nXSkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoT0ZGTElORV9QTFVHSU5fTk9UX0ZPVU5EKTtcbiAgICB9XG4gICAgaWYgKCFuZXR3b3JrU2VydmljZS5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChBUFBfSVNfT0ZGTElORSk7XG4gICAgfVxuICAgIHJldHVybiB0b1Byb21pc2UoaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuQkVGT1JFLCB2YXJpYWJsZSwgbnVsbCkpXG4gICAgICAgIC50aGVuKHByb2NlZWQgPT4ge1xuICAgICAgICAgICAgaWYgKHByb2NlZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KE9OX0JFRk9SRV9CTE9DS0VEKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIHVzZXIgaXMgYXV0aGVudGljYXRlZCBhbmQgb25saW5lLCB0aGVuIHN0YXJ0IHRoZSBkYXRhIHB1bGwgcHJvY2Vzcy5cbiAgICAgICAgICAgIHJldHVybiBzZWN1cml0eVNlcnZpY2Uub25Vc2VyTG9naW4oKTtcbiAgICAgICAgfSk7XG59O1xuXG5jb25zdCBnZW5lcmF0ZUNoYW5nZVNldCA9IChjaGFuZ2VzOiBDaGFuZ2VbXSkgPT4ge1xuICAgIGNvbnN0IGNyZWF0ZUNoYW5nZXMgPSAgXy5maWx0ZXIoY2hhbmdlcywgYyA9PiB7XG4gICAgICAgIHJldHVybiBjLnNlcnZpY2UgPT09ICdEYXRhYmFzZVNlcnZpY2UnICYmXG4gICAgICAgICAgICAoYy5vcGVyYXRpb24gPT09ICdpbnNlcnRUYWJsZURhdGEnXG4gICAgICAgICAgICAgICAgfHwgYy5vcGVyYXRpb24gPT09ICdpbnNlcnRNdWx0aVBhcnRUYWJsZURhdGEnKTtcbiAgICB9KSwgdXBkYXRlQ2hhbmdlcyA9ICBfLmZpbHRlcihjaGFuZ2VzLCBjID0+IHtcbiAgICAgICAgcmV0dXJuIGMuc2VydmljZSA9PT0gJ0RhdGFiYXNlU2VydmljZScgJiZcbiAgICAgICAgICAgIChjLm9wZXJhdGlvbiA9PT0gJ3VwZGF0ZVRhYmxlRGF0YSdcbiAgICAgICAgICAgICAgICB8fCBjLm9wZXJhdGlvbiA9PT0gJ3VwZGF0ZU11bHRpUGFydFRhYmxlRGF0YScpO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIHRvdGFsOiBjaGFuZ2VzID8gY2hhbmdlcy5sZW5ndGggOiAwLFxuICAgICAgICBkYXRhYmFzZToge1xuICAgICAgICAgICAgY3JlYXRlOiBjcmVhdGVDaGFuZ2VzLFxuICAgICAgICAgICAgdXBkYXRlOiB1cGRhdGVDaGFuZ2VzLFxuICAgICAgICAgICAgZGVsZXRlOiBfLmZpbHRlcihjaGFuZ2VzLCB7c2VydmljZTogJ0RhdGFiYXNlU2VydmljZScsIG9wZXJhdGlvbjogJ2RlbGV0ZVRhYmxlRGF0YSd9KVxuICAgICAgICB9LFxuICAgICAgICB1cGxvYWRzOiBfLmZpbHRlcihjaGFuZ2VzLCB7c2VydmljZTogJ09mZmxpbmVGaWxlVXBsb2FkU2VydmljZScsIG9wZXJhdGlvbjogJ3VwbG9hZFRvU2VydmVyJ30pXG4gICAgfTtcbn07XG5cbmNvbnN0IGdldE9mZmxpbmVDaGFuZ2VzID0gKGNoYW5nZUxvZ1NlcnZpY2U6IENoYW5nZUxvZ1NlcnZpY2UpID0+IHtcbiAgICByZXR1cm4gY2hhbmdlTG9nU2VydmljZS5nZXRDaGFuZ2VzKCkudGhlbihjaGFuZ2VzID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0b3RhbCcgOiBjaGFuZ2VzID8gY2hhbmdlcy5sZW5ndGggOiAwLFxuICAgICAgICAgICAgJ3BlbmRpbmdUb1N5bmMnIDogZ2VuZXJhdGVDaGFuZ2VTZXQoXy5maWx0ZXIoY2hhbmdlcywgeydoYXNFcnJvcicgOiAwfSkpLFxuICAgICAgICAgICAgJ2ZhaWxlZFRvU3luYycgOiBnZW5lcmF0ZUNoYW5nZVNldChfLmZpbHRlcihjaGFuZ2VzLCB7J2hhc0Vycm9yJyA6IDF9KSlcbiAgICAgICAgfTtcbiAgICB9KTtcbn07XG4iXX0=