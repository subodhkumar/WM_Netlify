import { noop, toPromise } from '@wm/core';
import { DeviceVariableService, initiateCallback, VARIABLE_CONSTANTS } from '@wm/variables';
const APP_IS_OFFLINE = 'App is offline.';
const OFFLINE_PLUGIN_NOT_FOUND = 'Offline DB Plugin is required, but missing.';
const ON_BEFORE_BLOCKED = 'onBefore callback returned false.';
const REQUIRED_PLUGINS = ['OFFLINE_DB', 'NETWORK'];
export class DatasyncService extends DeviceVariableService {
    constructor(app, changeLogService, fileSelectorService, localDBManagementService, localDBDataPullService, processManagementService, securityService, networkService) {
        super();
        this.name = 'datasync';
        this.operations = [];
        this.operations.push(new ExportDBOperation(localDBManagementService));
        this.operations.push(new GetOfflineChangesOperation(changeLogService));
        this.operations.push(new ImportDBOperation(fileSelectorService, localDBManagementService));
        this.operations.push(new LastPullInfoOperation(localDBDataPullService));
        this.operations.push(new LastPushInfoOperation(changeLogService));
        this.operations.push(new PullOperation(app, processManagementService, networkService, securityService, localDBDataPullService));
        this.operations.push(new PushOperation(app, changeLogService, processManagementService, networkService, securityService));
    }
}
class ExportDBOperation {
    constructor(localDBManagementService) {
        this.localDBManagementService = localDBManagementService;
        this.name = 'exportDB';
        this.model = { path: '' };
        this.properties = [
            { target: 'spinnerContext', hide: false },
            { target: 'spinnerMessage', hide: false }
        ];
        this.requiredCordovaPlugins = REQUIRED_PLUGINS;
    }
    invoke(variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return this.localDBManagementService.exportDB();
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}
class GetOfflineChangesOperation {
    constructor(changeLogService) {
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
    invoke(variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return getOfflineChanges(this.changeLogService);
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}
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
class LastPullInfoOperation {
    constructor(localDBDataPullService) {
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
    invoke(variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return this.localDBDataPullService.getLastPullInfo();
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}
class LastPushInfoOperation {
    constructor(changeLogService) {
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
    invoke(variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return this.changeLogService.getLastPushInfo();
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}
class ImportDBOperation {
    constructor(fileSelectorService, localDBManagementService) {
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
    invoke(variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return this.fileSelectorService.selectFiles(false, 'zip')
                .then(files => {
                if (files && files.length) {
                    return this.localDBManagementService.importDB(files[0].path, true);
                }
            });
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}
class PullOperation {
    constructor(app, processManagementService, networkService, securityService, localDBDataPullService) {
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
    invoke(variable, options, dataBindings) {
        let progressInstance;
        return canExecute(variable, this.networkService, this.securityService)
            .then(() => {
            if (variable.showProgress) {
                return this.processManagementService.createInstance(this.app.appLocale.LABEL_DATA_PULL_PROGRESS, 0, 0);
            }
            return null;
        }).then((instance) => {
            const progressObserver = {
                next: (pullInfo) => {
                    // variable.dataSet = progress; Todo: progress
                    initiateCallback('onProgress', variable, pullInfo);
                    if (progressInstance) {
                        progressInstance.set('max', pullInfo.totalRecordsToPull);
                        progressInstance.set('value', pullInfo.totalPulledRecordCount);
                    }
                }, error: noop, complete: noop
            };
            const clearData = variable.clearData === 'true' || variable.clearData === true, pullPromise = this.localDBDataPullService.pullAllDbData(clearData, progressObserver);
            if (instance) {
                progressInstance = instance;
                progressInstance.set('stopButtonLabel', this.app.appLocale.LABEL_DATA_PULL_PROGRESS_STOP_BTN);
                progressInstance.set('onStop', () => {
                    this.localDBDataPullService.cancel(pullPromise);
                });
            }
            return pullPromise;
        }).catch(pullInfo => pullInfo)
            .then(pullInfo => {
            if (progressInstance) {
                progressInstance.destroy();
            }
            return pullInfo;
        });
    }
}
class PushOperation {
    constructor(app, changeLogService, processManagementService, networkService, securityService) {
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
    invoke(variable, options, dataBindings) {
        let progressInstance;
        if (this.changeLogService.isFlushInProgress()) {
            return Promise.resolve();
        }
        return canExecute(variable, this.networkService, this.securityService)
            .then(() => getOfflineChanges(this.changeLogService))
            .then(changes => {
            if (changes.pendingToSync.total <= 0) {
                return Promise.reject(_.clone(this.model));
            }
        }).then(() => {
            if (variable.showProgress) {
                return this.processManagementService.createInstance(this.app.appLocale.LABEL_DATA_PUSH_PROGRESS, 0, 0);
            }
            return null;
        }).then((instance) => {
            const progressObserver = {
                next: (pushInfo) => {
                    pushInfo = addOldPropertiesForPushData(pushInfo);
                    initiateCallback('onProgress', variable, pushInfo);
                    if (progressInstance) {
                        progressInstance.set('max', pushInfo.totalTaskCount);
                        progressInstance.set('value', pushInfo.completedTaskCount);
                    }
                }, error: noop, complete: noop
            };
            const pushPromise = this.changeLogService.flush(progressObserver);
            if (instance) {
                progressInstance = instance;
                progressInstance.set('stopButtonLabel', this.app.appLocale.LABEL_DATA_PUSH_PROGRESS_STOP_BTN);
                progressInstance.set('onStop', () => this.changeLogService.stop());
            }
            return pushPromise;
        })
            .catch(pushInfo => pushInfo)
            .then(pushInfo => {
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
    }
}
/**
 * This function adds the old properties to the push dataSet to support old projects.
 * @param data
 * @returns {*}
 */
const addOldPropertiesForPushData = data => {
    const result = _.clone(data);
    result.success = data.successfulTaskCount;
    result.error = data.failedTaskCount;
    result.completed = data.completedTaskCount;
    result.total = data.totalTaskCount;
    return result;
};
const ɵ0 = addOldPropertiesForPushData;
const canExecute = (variable, networkService, securityService) => {
    if (!window['SQLitePlugin']) {
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
    if (!networkService.isConnected()) {
        return Promise.reject(APP_IS_OFFLINE);
    }
    return toPromise(initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE, variable, null))
        .then(proceed => {
        if (proceed === false) {
            return Promise.reject(ON_BEFORE_BLOCKED);
        }
        // If user is authenticated and online, then start the data pull process.
        return securityService.onUserLogin();
    });
};
const ɵ1 = canExecute;
const generateChangeSet = (changes) => {
    const createChanges = _.filter(changes, c => {
        return c.service === 'DatabaseService' &&
            (c.operation === 'insertTableData'
                || c.operation === 'insertMultiPartTableData');
    }), updateChanges = _.filter(changes, c => {
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
const ɵ2 = generateChangeSet;
const getOfflineChanges = (changeLogService) => {
    return changeLogService.getChanges().then(changes => {
        return {
            'total': changes ? changes.length : 0,
            'pendingToSync': generateChangeSet(_.filter(changes, { 'hasError': 0 })),
            'failedToSync': generateChangeSet(_.filter(changes, { 'hasError': 1 }))
        };
    });
};
const ɵ3 = getOfflineChanges;
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YXN5bmMtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvdmFyaWFibGVzLyIsInNvdXJjZXMiOlsic2VydmljZXMvZGF0YXN5bmMtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQU8sSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUloRCxPQUFPLEVBQUUscUJBQXFCLEVBQTRCLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBS3RILE1BQU0sY0FBYyxHQUFHLGlCQUFpQixDQUFDO0FBQ3pDLE1BQU0sd0JBQXdCLEdBQUcsNkNBQTZDLENBQUM7QUFDL0UsTUFBTSxpQkFBaUIsR0FBRyxtQ0FBbUMsQ0FBQztBQUM5RCxNQUFNLGdCQUFnQixHQUFHLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBRW5ELE1BQU0sT0FBTyxlQUFnQixTQUFRLHFCQUFxQjtJQUl0RCxZQUFZLEdBQVEsRUFDUixnQkFBa0MsRUFDbEMsbUJBQXdDLEVBQ3hDLHdCQUFrRCxFQUNsRCxzQkFBOEMsRUFDOUMsd0JBQWtELEVBQ2xELGVBQWdDLEVBQ2hDLGNBQThCO1FBQ3RDLEtBQUssRUFBRSxDQUFDO1FBWEksU0FBSSxHQUFHLFVBQVUsQ0FBQztRQUNsQixlQUFVLEdBQStCLEVBQUUsQ0FBQztRQVd4RCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFpQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDBCQUEwQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQztRQUMzRixJQUFJLENBQUMsVUFBVSxDQUFDLElB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LENBQUM7QUFDTixDQUFDLENBQUM7O0FBRUYsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLGdCQUFrQyxFQUFFLEVBQUU7SUFDN0QsT0FBTyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDaEQsT0FBTztZQUNILE9BQU8sRUFBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsZUFBZSxFQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUMsVUFBVSxFQUFHLENBQUMsRUFBQyxDQUFDLENBQUM7WUFDeEUsY0FBYyxFQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUMsVUFBVSxFQUFHLENBQUMsRUFBQyxDQUFDLENBQUM7U0FDMUUsQ0FBQztJQUNOLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2ZXIgfSBmcm9tICdyeGpzL2luZGV4JztcblxuaW1wb3J0IHsgQXBwLCBub29wLCB0b1Byb21pc2UgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBOZXR3b3JrU2VydmljZSB9IGZyb20gJ0B3bS9tb2JpbGUvY29yZSc7XG5pbXBvcnQgeyBGaWxlU2VsZWN0b3JTZXJ2aWNlLCBQcm9jZXNzQXBpLCBQcm9jZXNzTWFuYWdlbWVudFNlcnZpY2UgfSBmcm9tICdAd20vbW9iaWxlL2NvbXBvbmVudHMnO1xuaW1wb3J0IHsgQ2hhbmdlLCBDaGFuZ2VMb2dTZXJ2aWNlLCBMb2NhbERCTWFuYWdlbWVudFNlcnZpY2UsIExvY2FsREJEYXRhUHVsbFNlcnZpY2UsIFB1c2hJbmZvLCBQdWxsSW5mbyB9IGZyb20gJ0B3bS9tb2JpbGUvb2ZmbGluZSc7XG5pbXBvcnQgeyBEZXZpY2VWYXJpYWJsZVNlcnZpY2UsIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiwgaW5pdGlhdGVDYWxsYmFjaywgVkFSSUFCTEVfQ09OU1RBTlRTIH0gZnJvbSAnQHdtL3ZhcmlhYmxlcyc7XG5pbXBvcnQgeyBTZWN1cml0eVNlcnZpY2UgfSBmcm9tICdAd20vc2VjdXJpdHknO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IEFQUF9JU19PRkZMSU5FID0gJ0FwcCBpcyBvZmZsaW5lLic7XG5jb25zdCBPRkZMSU5FX1BMVUdJTl9OT1RfRk9VTkQgPSAnT2ZmbGluZSBEQiBQbHVnaW4gaXMgcmVxdWlyZWQsIGJ1dCBtaXNzaW5nLic7XG5jb25zdCBPTl9CRUZPUkVfQkxPQ0tFRCA9ICdvbkJlZm9yZSBjYWxsYmFjayByZXR1cm5lZCBmYWxzZS4nO1xuY29uc3QgUkVRVUlSRURfUExVR0lOUyA9IFsnT0ZGTElORV9EQicsICdORVRXT1JLJ107XG5cbmV4cG9ydCBjbGFzcyBEYXRhc3luY1NlcnZpY2UgZXh0ZW5kcyBEZXZpY2VWYXJpYWJsZVNlcnZpY2Uge1xuICAgIHB1YmxpYyByZWFkb25seSBuYW1lID0gJ2RhdGFzeW5jJztcbiAgICBwdWJsaWMgcmVhZG9ubHkgb3BlcmF0aW9uczogSURldmljZVZhcmlhYmxlT3BlcmF0aW9uW10gPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKGFwcDogQXBwLFxuICAgICAgICAgICAgICAgIGNoYW5nZUxvZ1NlcnZpY2U6IENoYW5nZUxvZ1NlcnZpY2UsXG4gICAgICAgICAgICAgICAgZmlsZVNlbGVjdG9yU2VydmljZTogRmlsZVNlbGVjdG9yU2VydmljZSxcbiAgICAgICAgICAgICAgICBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2U6IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSxcbiAgICAgICAgICAgICAgICBsb2NhbERCRGF0YVB1bGxTZXJ2aWNlOiBMb2NhbERCRGF0YVB1bGxTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIHByb2Nlc3NNYW5hZ2VtZW50U2VydmljZTogUHJvY2Vzc01hbmFnZW1lbnRTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIHNlY3VyaXR5U2VydmljZTogU2VjdXJpdHlTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIG5ldHdvcmtTZXJ2aWNlOiBOZXR3b3JrU2VydmljZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm9wZXJhdGlvbnMucHVzaChuZXcgRXhwb3J0REJPcGVyYXRpb24obG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlKSk7XG4gICAgICAgIHRoaXMub3BlcmF0aW9ucy5wdXNoKG5ldyBHZXRPZmZsaW5lQ2hhbmdlc09wZXJhdGlvbihjaGFuZ2VMb2dTZXJ2aWNlKSk7XG4gICAgICAgIHRoaXMub3BlcmF0aW9ucy5wdXNoKG5ldyBJbXBvcnREQk9wZXJhdGlvbihmaWxlU2VsZWN0b3JTZXJ2aWNlLCBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2UpKTtcbiAgICAgICAgdGhpcy5vcGVyYXRpb25zLnB1c2gobmV3IExhc3RQdWxsSW5mb09wZXJhdGlvbihsb2NhbERCRGF0YVB1bGxTZXJ2aWNlKSk7XG4gICAgICAgIHRoaXMub3BlcmF0aW9ucy5wdXNoKG5ldyBMYXN0UHVzaEluZm9PcGVyYXRpb24oY2hhbmdlTG9nU2VydmljZSkpO1xuICAgICAgICB0aGlzLm9wZXJhdGlvbnMucHVzaChuZXcgUHVsbE9wZXJhdGlvbihhcHAsIHByb2Nlc3NNYW5hZ2VtZW50U2VydmljZSwgbmV0d29ya1NlcnZpY2UsIHNlY3VyaXR5U2VydmljZSwgbG9jYWxEQkRhdGFQdWxsU2VydmljZSkpO1xuICAgICAgICB0aGlzLm9wZXJhdGlvbnMucHVzaChuZXcgUHVzaE9wZXJhdGlvbihhcHAsIGNoYW5nZUxvZ1NlcnZpY2UsIHByb2Nlc3NNYW5hZ2VtZW50U2VydmljZSwgbmV0d29ya1NlcnZpY2UsIHNlY3VyaXR5U2VydmljZSkpO1xuICAgIH1cbn1cblxuY2xhc3MgRXhwb3J0REJPcGVyYXRpb24gaW1wbGVtZW50cyBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb24ge1xuICAgIHB1YmxpYyByZWFkb25seSBuYW1lID0gJ2V4cG9ydERCJztcbiAgICBwdWJsaWMgcmVhZG9ubHkgbW9kZWwgPSB7cGF0aDogJyd9O1xuICAgIHB1YmxpYyByZWFkb25seSBwcm9wZXJ0aWVzID0gW1xuICAgICAgICB7dGFyZ2V0OiAnc3Bpbm5lckNvbnRleHQnLCBoaWRlOiBmYWxzZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdzcGlubmVyTWVzc2FnZScsIGhpZGU6IGZhbHNlfVxuICAgIF07XG4gICAgcHVibGljIHJlYWRvbmx5IHJlcXVpcmVkQ29yZG92YVBsdWdpbnMgPSBSRVFVSVJFRF9QTFVHSU5TO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2U6IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSkge1xuICAgIH1cblxuICAgIHB1YmxpYyBpbnZva2UodmFyaWFibGU6IGFueSwgb3B0aW9uczogYW55LCBkYXRhQmluZGluZ3M6IE1hcDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBpZiAod2luZG93WydTUUxpdGVQbHVnaW4nXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLmV4cG9ydERCKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KE9GRkxJTkVfUExVR0lOX05PVF9GT1VORCk7XG4gICAgfVxufVxuXG5cbmNsYXNzIEdldE9mZmxpbmVDaGFuZ2VzT3BlcmF0aW9uIGltcGxlbWVudHMgSURldmljZVZhcmlhYmxlT3BlcmF0aW9uIHtcbiAgICBwcml2YXRlIHN0YXRpYyBEQVRBX0NIQU5HRV9URU1QTEFURSA9IHtcbiAgICAgICAgc2VydmljZTogJ0RhdGFiYXNlU2VydmljZScsXG4gICAgICAgIG9wZXJhdGlvbjogJ29wZXJhdGlvbicsXG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgZGF0YToge30sXG4gICAgICAgICAgICBkYXRhTW9kZWxOYW1lOiAnZGF0YU1vZGVsTmFtZScsXG4gICAgICAgICAgICBlbnRpdHlOYW1lOiAnZW50aXR5TmFtZSdcbiAgICAgICAgfSxcbiAgICAgICAgaGFzRXJyb3I6IDAsXG4gICAgICAgIGVycm9yTWVzc2FnZTogJydcbiAgICB9O1xuICAgIHByaXZhdGUgc3RhdGljIENIQU5HRV9MT0dfU0VUID0ge1xuICAgICAgICB0b3RhbDogMCxcbiAgICAgICAgZGF0YWJhc2U6IHtcbiAgICAgICAgICAgIGNyZWF0ZTogW0dldE9mZmxpbmVDaGFuZ2VzT3BlcmF0aW9uLkRBVEFfQ0hBTkdFX1RFTVBMQVRFXSxcbiAgICAgICAgICAgIHVwZGF0ZTogW0dldE9mZmxpbmVDaGFuZ2VzT3BlcmF0aW9uLkRBVEFfQ0hBTkdFX1RFTVBMQVRFXSxcbiAgICAgICAgICAgIGRlbGV0ZTogW0dldE9mZmxpbmVDaGFuZ2VzT3BlcmF0aW9uLkRBVEFfQ0hBTkdFX1RFTVBMQVRFXVxuICAgICAgICB9LFxuICAgICAgICB1cGxvYWRzOiBbe1xuICAgICAgICAgICAgc2VydmljZTogJ09mZmxpbmVGaWxlVXBsb2FkU2VydmljZScsXG4gICAgICAgICAgICBvcGVyYXRpb246ICd1cGxvYWRUb1NlcnZlcicsXG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICBmaWxlOiAnbG9jYWxGaWxlUGF0aCcsXG4gICAgICAgICAgICAgICAgc2VydmVyVXJsOiAnc2VydmVyVXJsJyxcbiAgICAgICAgICAgICAgICBmdE9wdGlvbnM6IHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGFzRXJyb3I6IDAsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICcnXG4gICAgICAgIH1dXG4gICAgfTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9ICdnZXRPZmZsaW5lQ2hhbmdlcyc7XG4gICAgcHVibGljIHJlYWRvbmx5IG1vZGVsID0ge1xuICAgICAgICB0b3RhbDogMCxcbiAgICAgICAgcGVuZGluZ1RvU3luYzogR2V0T2ZmbGluZUNoYW5nZXNPcGVyYXRpb24uQ0hBTkdFX0xPR19TRVQsXG4gICAgICAgIGZhaWxlZFRvU3luYzogR2V0T2ZmbGluZUNoYW5nZXNPcGVyYXRpb24uQ0hBTkdFX0xPR19TRVRcbiAgICB9O1xuICAgIHB1YmxpYyByZWFkb25seSBwcm9wZXJ0aWVzID0gW1xuICAgICAgICB7dGFyZ2V0OiAnc3RhcnRVcGRhdGUnLCB0eXBlOiAnYm9vbGVhbicsIHZhbHVlOiB0cnVlLCBoaWRlOiB0cnVlfSxcbiAgICAgICAge3RhcmdldDogJ2F1dG9VcGRhdGUnLCB0eXBlOiAnYm9vbGVhbicsIHZhbHVlOiB0cnVlLCBoaWRlOiB0cnVlfVxuICAgIF07XG4gICAgcHVibGljIHJlYWRvbmx5IHJlcXVpcmVkQ29yZG92YVBsdWdpbnMgPSBSRVFVSVJFRF9QTFVHSU5TO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBjaGFuZ2VMb2dTZXJ2aWNlOiBDaGFuZ2VMb2dTZXJ2aWNlKSB7XG4gICAgfVxuXG4gICAgcHVibGljIGludm9rZSh2YXJpYWJsZTogYW55LCBvcHRpb25zOiBhbnksIGRhdGFCaW5kaW5nczogTWFwPHN0cmluZywgYW55Pik6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGlmICh3aW5kb3dbJ1NRTGl0ZVBsdWdpbiddKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0T2ZmbGluZUNoYW5nZXModGhpcy5jaGFuZ2VMb2dTZXJ2aWNlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoT0ZGTElORV9QTFVHSU5fTk9UX0ZPVU5EKTtcbiAgICB9XG59XG5cbmNsYXNzIExhc3RQdWxsSW5mb09wZXJhdGlvbiBpbXBsZW1lbnRzIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiB7XG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWUgPSAnbGFzdFB1bGxJbmZvJztcbiAgICBwdWJsaWMgcmVhZG9ubHkgbW9kZWwgPSB7XG4gICAgICAgIGRhdGFiYXNlcyA6IFt7XG4gICAgICAgICAgICBuYW1lIDogJ2RhdGJhc2VOYW1lJyxcbiAgICAgICAgICAgIGVudGl0aWVzOiBbe1xuICAgICAgICAgICAgICAgIGVudGl0eU5hbWU6ICdlbnRpdHlOYW1lJyxcbiAgICAgICAgICAgICAgICBwdWxsZWRSZWNvcmRDb3VudDogMFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBwdWxsZWRSZWNvcmRDb3VudDogMFxuICAgICAgICB9XSxcbiAgICAgICAgdG90YWxQdWxsZWRSZWNvcmRDb3VudDogMCxcbiAgICAgICAgc3RhcnRUaW1lOiBuZXcgRGF0ZSgpLnRvSlNPTigpLFxuICAgICAgICBlbmRUaW1lOiBuZXcgRGF0ZSgpLnRvSlNPTigpXG4gICAgfTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJvcGVydGllcyA9IFtcbiAgICAgICAge3RhcmdldDogJ3N0YXJ0VXBkYXRlJywgdHlwZTogJ2Jvb2xlYW4nLCB2YWx1ZTogdHJ1ZSwgaGlkZTogdHJ1ZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdzcGlubmVyQ29udGV4dCcsIGhpZGU6IGZhbHNlfSxcbiAgICAgICAge3RhcmdldDogJ3NwaW5uZXJNZXNzYWdlJywgaGlkZTogZmFsc2V9XG4gICAgXTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmVxdWlyZWRDb3Jkb3ZhUGx1Z2lucyA9IFJFUVVJUkVEX1BMVUdJTlM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGxvY2FsREJEYXRhUHVsbFNlcnZpY2U6IExvY2FsREJEYXRhUHVsbFNlcnZpY2UpIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW52b2tlKHZhcmlhYmxlOiBhbnksIG9wdGlvbnM6IGFueSwgZGF0YUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgaWYgKHdpbmRvd1snU1FMaXRlUGx1Z2luJ10pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsREJEYXRhUHVsbFNlcnZpY2UuZ2V0TGFzdFB1bGxJbmZvKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KE9GRkxJTkVfUExVR0lOX05PVF9GT1VORCk7XG4gICAgfVxufVxuXG5jbGFzcyBMYXN0UHVzaEluZm9PcGVyYXRpb24gaW1wbGVtZW50cyBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb24ge1xuICAgIHB1YmxpYyByZWFkb25seSBuYW1lID0gJ2xhc3RQdXNoSW5mbyc7XG4gICAgcHVibGljIHJlYWRvbmx5IG1vZGVsID0ge1xuICAgICAgICBzdWNjZXNzZnVsVGFza0NvdW50OiAwLFxuICAgICAgICBmYWlsZWRUYXNrQ291bnQ6IDAsXG4gICAgICAgIGNvbXBsZXRlZFRhc2tDb3VudDogMCxcbiAgICAgICAgdG90YWxUYXNrQ291bnQ6IDAsXG4gICAgICAgIHN0YXJ0VGltZTogbmV3IERhdGUoKS50b0pTT04oKSxcbiAgICAgICAgZW5kVGltZTogbmV3IERhdGUoKS50b0pTT04oKVxuICAgIH07XG4gICAgcHVibGljIHJlYWRvbmx5IHByb3BlcnRpZXMgPSBbXG4gICAgICAgIHt0YXJnZXQ6ICdzdGFydFVwZGF0ZScsIHR5cGU6ICdib29sZWFuJywgdmFsdWU6IHRydWUsIGhpZGU6IHRydWV9LFxuICAgICAgICB7dGFyZ2V0OiAnc3Bpbm5lckNvbnRleHQnLCBoaWRlOiBmYWxzZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdzcGlubmVyTWVzc2FnZScsIGhpZGU6IGZhbHNlfVxuICAgIF07XG4gICAgcHVibGljIHJlYWRvbmx5IHJlcXVpcmVkQ29yZG92YVBsdWdpbnMgPSBSRVFVSVJFRF9QTFVHSU5TO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBjaGFuZ2VMb2dTZXJ2aWNlOiBDaGFuZ2VMb2dTZXJ2aWNlKSB7XG4gICAgfVxuXG4gICAgcHVibGljIGludm9rZSh2YXJpYWJsZTogYW55LCBvcHRpb25zOiBhbnksIGRhdGFCaW5kaW5nczogTWFwPHN0cmluZywgYW55Pik6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGlmICh3aW5kb3dbJ1NRTGl0ZVBsdWdpbiddKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGFuZ2VMb2dTZXJ2aWNlLmdldExhc3RQdXNoSW5mbygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChPRkZMSU5FX1BMVUdJTl9OT1RfRk9VTkQpO1xuICAgIH1cbn1cblxuY2xhc3MgSW1wb3J0REJPcGVyYXRpb24gaW1wbGVtZW50cyBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb24ge1xuICAgIHB1YmxpYyByZWFkb25seSBuYW1lID0gJ2ltcG9ydERCJztcbiAgICBwdWJsaWMgcmVhZG9ubHkgbW9kZWwgPSB7fTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJvcGVydGllcyA9IFtcbiAgICAgICAge3RhcmdldDogJ3NwaW5uZXJDb250ZXh0JywgaGlkZTogZmFsc2V9LFxuICAgICAgICB7dGFyZ2V0OiAnc3Bpbm5lck1lc3NhZ2UnLCBoaWRlOiBmYWxzZX1cbiAgICBdO1xuICAgIHB1YmxpYyByZWFkb25seSByZXF1aXJlZENvcmRvdmFQbHVnaW5zID0gUkVRVUlSRURfUExVR0lOUztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGZpbGVTZWxlY3RvclNlcnZpY2U6IEZpbGVTZWxlY3RvclNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlOiBMb2NhbERCTWFuYWdlbWVudFNlcnZpY2UpIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW52b2tlKHZhcmlhYmxlOiBhbnksIG9wdGlvbnM6IGFueSwgZGF0YUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgaWYgKHdpbmRvd1snU1FMaXRlUGx1Z2luJ10pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGVTZWxlY3RvclNlcnZpY2Uuc2VsZWN0RmlsZXMoZmFsc2UsICAnemlwJylcbiAgICAgICAgICAgICAgICAudGhlbihmaWxlcyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVzICYmIGZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbERCTWFuYWdlbWVudFNlcnZpY2UuaW1wb3J0REIoZmlsZXNbMF0ucGF0aCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KE9GRkxJTkVfUExVR0lOX05PVF9GT1VORCk7XG4gICAgfVxufVxuXG5jbGFzcyBQdWxsT3BlcmF0aW9uIGltcGxlbWVudHMgSURldmljZVZhcmlhYmxlT3BlcmF0aW9uIHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9ICdwdWxsJztcbiAgICBwdWJsaWMgcmVhZG9ubHkgbW9kZWwgPSB7XG4gICAgICAgIHRvdGFsVGFza0NvdW50OiAwLFxuICAgICAgICBjb21wbGV0ZWRUYXNrQ291bnQ6IDAsXG4gICAgICAgIGluUHJvZ3Jlc3M6IGZhbHNlXG4gICAgfTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJvcGVydGllcyA9IFtcbiAgICAgICAge3RhcmdldDogJ2NsZWFyRGF0YScsIHR5cGU6ICdib29sZWFuJywgd2lkZ2V0dHlwZTogJ2Jvb2xlYW4taW5wdXRmaXJzdCcsIHZhbHVlOiB0cnVlLCBncm91cDogJ3Byb3BlcnRpZXMnLCBzdWJHcm91cDogJ2JlaGF2aW9yJ30sXG4gICAgICAgIHt0YXJnZXQ6ICdzdGFydFVwZGF0ZScsIHR5cGU6ICdib29sZWFuJywgaGlkZTogZmFsc2V9LFxuICAgICAgICB7dGFyZ2V0OiAnb25CZWZvcmUnLCBoaWRlOiBmYWxzZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdvblByb2dyZXNzJywgaGlkZTogZmFsc2V9LFxuICAgICAgICB7dGFyZ2V0OiAnc2hvd1Byb2dyZXNzJywgaGlkZTogZmFsc2V9XG4gICAgXTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmVxdWlyZWRDb3Jkb3ZhUGx1Z2lucyA9IFJFUVVJUkVEX1BMVUdJTlM7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBhcHA6IEFwcCxcbiAgICAgICAgcHJpdmF0ZSBwcm9jZXNzTWFuYWdlbWVudFNlcnZpY2U6IFByb2Nlc3NNYW5hZ2VtZW50U2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBuZXR3b3JrU2VydmljZTogTmV0d29ya1NlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgc2VjdXJpdHlTZXJ2aWNlOiBTZWN1cml0eVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgbG9jYWxEQkRhdGFQdWxsU2VydmljZTogTG9jYWxEQkRhdGFQdWxsU2VydmljZSkge1xuICAgIH1cblxuICAgIHB1YmxpYyBpbnZva2UodmFyaWFibGU6IGFueSwgb3B0aW9uczogYW55LCBkYXRhQmluZGluZ3M6IE1hcDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBsZXQgcHJvZ3Jlc3NJbnN0YW5jZTtcbiAgICAgICAgcmV0dXJuIGNhbkV4ZWN1dGUodmFyaWFibGUsIHRoaXMubmV0d29ya1NlcnZpY2UsIHRoaXMuc2VjdXJpdHlTZXJ2aWNlKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh2YXJpYWJsZS5zaG93UHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc01hbmFnZW1lbnRTZXJ2aWNlLmNyZWF0ZUluc3RhbmNlKHRoaXMuYXBwLmFwcExvY2FsZS5MQUJFTF9EQVRBX1BVTExfUFJPR1JFU1MsIDAsIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pLnRoZW4oKGluc3RhbmNlOiBQcm9jZXNzQXBpKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NPYnNlcnZlcjogT2JzZXJ2ZXI8UHVsbEluZm8+ID0ge1xuICAgICAgICAgICAgICAgICAgICBuZXh0OiAocHVsbEluZm86IFB1bGxJbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB2YXJpYWJsZS5kYXRhU2V0ID0gcHJvZ3Jlc3M7IFRvZG86IHByb2dyZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKCdvblByb2dyZXNzJywgdmFyaWFibGUsIHB1bGxJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzc0luc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NJbnN0YW5jZS5zZXQoJ21heCcsIHB1bGxJbmZvLnRvdGFsUmVjb3Jkc1RvUHVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NJbnN0YW5jZS5zZXQoJ3ZhbHVlJywgcHVsbEluZm8udG90YWxQdWxsZWRSZWNvcmRDb3VudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIGVycm9yOiBub29wLCBjb21wbGV0ZTogbm9vcH07XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjbGVhckRhdGEgPSB2YXJpYWJsZS5jbGVhckRhdGEgPT09ICd0cnVlJyB8fCB2YXJpYWJsZS5jbGVhckRhdGEgPT09IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHB1bGxQcm9taXNlID0gdGhpcy5sb2NhbERCRGF0YVB1bGxTZXJ2aWNlLnB1bGxBbGxEYkRhdGEoY2xlYXJEYXRhLCBwcm9ncmVzc09ic2VydmVyKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NJbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0luc3RhbmNlLnNldCgnc3RvcEJ1dHRvbkxhYmVsJywgdGhpcy5hcHAuYXBwTG9jYWxlLkxBQkVMX0RBVEFfUFVMTF9QUk9HUkVTU19TVE9QX0JUTik7XG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzSW5zdGFuY2Uuc2V0KCdvblN0b3AnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2FsREJEYXRhUHVsbFNlcnZpY2UuY2FuY2VsKHB1bGxQcm9taXNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHB1bGxQcm9taXNlO1xuICAgICAgICB9KS5jYXRjaChwdWxsSW5mbyA9PiBwdWxsSW5mbylcbiAgICAgICAgICAgIC50aGVuKHB1bGxJbmZvID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3NJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0luc3RhbmNlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHB1bGxJbmZvO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jbGFzcyBQdXNoT3BlcmF0aW9uIGltcGxlbWVudHMgSURldmljZVZhcmlhYmxlT3BlcmF0aW9uIHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9ICdwdXNoJztcbiAgICBwdWJsaWMgcmVhZG9ubHkgbW9kZWwgPSB7XG4gICAgICAgIHN1Y2Nlc3NmdWxUYXNrQ291bnQ6IDAsXG4gICAgICAgIGZhaWxlZFRhc2tDb3VudDogMCxcbiAgICAgICAgY29tcGxldGVkVGFza0NvdW50OiAwLFxuICAgICAgICB0b3RhbFRhc2tDb3VudDogMCxcbiAgICAgICAgaW5Qcm9ncmVzczogZmFsc2VcbiAgICB9O1xuICAgIHB1YmxpYyByZWFkb25seSBwcm9wZXJ0aWVzID0gW1xuICAgICAgICB7dGFyZ2V0OiAnb25CZWZvcmUnLCBoaWRlOiBmYWxzZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdvblByb2dyZXNzJywgaGlkZTogZmFsc2V9LFxuICAgICAgICB7dGFyZ2V0OiAnc2hvd1Byb2dyZXNzJywgJ2hpZGUnOiBmYWxzZSwgJ3ZhbHVlJzogdHJ1ZX1cbiAgICBdO1xuICAgIHB1YmxpYyByZWFkb25seSByZXF1aXJlZENvcmRvdmFQbHVnaW5zID0gUkVRVUlSRURfUExVR0lOUztcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgYXBwOiBBcHAsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBjaGFuZ2VMb2dTZXJ2aWNlOiBDaGFuZ2VMb2dTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgcHJvY2Vzc01hbmFnZW1lbnRTZXJ2aWNlOiBQcm9jZXNzTWFuYWdlbWVudFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBuZXR3b3JrU2VydmljZTogTmV0d29ya1NlcnZpY2UsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBzZWN1cml0eVNlcnZpY2U6IFNlY3VyaXR5U2VydmljZSkge1xuICAgIH1cblxuICAgIHB1YmxpYyBpbnZva2UodmFyaWFibGU6IGFueSwgb3B0aW9uczogYW55LCBkYXRhQmluZGluZ3M6IE1hcDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBsZXQgcHJvZ3Jlc3NJbnN0YW5jZTtcbiAgICAgICAgaWYgKHRoaXMuY2hhbmdlTG9nU2VydmljZS5pc0ZsdXNoSW5Qcm9ncmVzcygpKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbkV4ZWN1dGUodmFyaWFibGUsIHRoaXMubmV0d29ya1NlcnZpY2UsIHRoaXMuc2VjdXJpdHlTZXJ2aWNlKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gZ2V0T2ZmbGluZUNoYW5nZXModGhpcy5jaGFuZ2VMb2dTZXJ2aWNlKSlcbiAgICAgICAgICAgIC50aGVuKGNoYW5nZXMgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjaGFuZ2VzLnBlbmRpbmdUb1N5bmMudG90YWwgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXy5jbG9uZSh0aGlzLm1vZGVsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHZhcmlhYmxlLnNob3dQcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzTWFuYWdlbWVudFNlcnZpY2UuY3JlYXRlSW5zdGFuY2UodGhpcy5hcHAuYXBwTG9jYWxlLkxBQkVMX0RBVEFfUFVTSF9QUk9HUkVTUywgMCwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSkudGhlbigoaW5zdGFuY2U6IFByb2Nlc3NBcGkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9ncmVzc09ic2VydmVyOiBPYnNlcnZlcjxQdXNoSW5mbz4gPSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQ6IChwdXNoSW5mbzogUHVzaEluZm8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1c2hJbmZvID0gYWRkT2xkUHJvcGVydGllc0ZvclB1c2hEYXRhKHB1c2hJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soJ29uUHJvZ3Jlc3MnLCB2YXJpYWJsZSwgcHVzaEluZm8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyZXNzSW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0luc3RhbmNlLnNldCgnbWF4JywgcHVzaEluZm8udG90YWxUYXNrQ291bnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzSW5zdGFuY2Uuc2V0KCd2YWx1ZScsIHB1c2hJbmZvLmNvbXBsZXRlZFRhc2tDb3VudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIGVycm9yOiBub29wLCBjb21wbGV0ZTogbm9vcH07XG4gICAgICAgICAgICAgICAgY29uc3QgcHVzaFByb21pc2UgPSB0aGlzLmNoYW5nZUxvZ1NlcnZpY2UuZmx1c2gocHJvZ3Jlc3NPYnNlcnZlcik7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzSW5zdGFuY2UgPSBpbnN0YW5jZTtcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NJbnN0YW5jZS5zZXQoJ3N0b3BCdXR0b25MYWJlbCcsIHRoaXMuYXBwLmFwcExvY2FsZS5MQUJFTF9EQVRBX1BVU0hfUFJPR1JFU1NfU1RPUF9CVE4pO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0luc3RhbmNlLnNldCgnb25TdG9wJywgKCkgPT4gdGhpcy5jaGFuZ2VMb2dTZXJ2aWNlLnN0b3AoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBwdXNoUHJvbWlzZTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2gocHVzaEluZm8gPT4gcHVzaEluZm8pXG4gICAgICAgICAgICAudGhlbihwdXNoSW5mbyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHByb2dyZXNzSW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NJbnN0YW5jZS5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwdXNoSW5mbyAmJiBwdXNoSW5mby50b3RhbFRhc2tDb3VudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHB1c2hJbmZvID0gYWRkT2xkUHJvcGVydGllc0ZvclB1c2hEYXRhKHB1c2hJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHB1c2hJbmZvLmZhaWxlZFRhc2tDb3VudCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHB1c2hJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHVzaEluZm87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChwdXNoSW5mbyk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBhZGRzIHRoZSBvbGQgcHJvcGVydGllcyB0byB0aGUgcHVzaCBkYXRhU2V0IHRvIHN1cHBvcnQgb2xkIHByb2plY3RzLlxuICogQHBhcmFtIGRhdGFcbiAqIEByZXR1cm5zIHsqfVxuICovXG5jb25zdCBhZGRPbGRQcm9wZXJ0aWVzRm9yUHVzaERhdGEgPSBkYXRhID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBfLmNsb25lKGRhdGEpO1xuICAgIHJlc3VsdC5zdWNjZXNzID0gZGF0YS5zdWNjZXNzZnVsVGFza0NvdW50O1xuICAgIHJlc3VsdC5lcnJvciA9IGRhdGEuZmFpbGVkVGFza0NvdW50O1xuICAgIHJlc3VsdC5jb21wbGV0ZWQgPSBkYXRhLmNvbXBsZXRlZFRhc2tDb3VudDtcbiAgICByZXN1bHQudG90YWwgPSBkYXRhLnRvdGFsVGFza0NvdW50O1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5jb25zdCBjYW5FeGVjdXRlID0gKHZhcmlhYmxlOiBhbnksIG5ldHdvcmtTZXJ2aWNlOiBOZXR3b3JrU2VydmljZSwgc2VjdXJpdHlTZXJ2aWNlOiBTZWN1cml0eVNlcnZpY2UpID0+IHtcbiAgICBpZiAoIXdpbmRvd1snU1FMaXRlUGx1Z2luJ10pIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KE9GRkxJTkVfUExVR0lOX05PVF9GT1VORCk7XG4gICAgfVxuICAgIGlmICghbmV0d29ya1NlcnZpY2UuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoQVBQX0lTX09GRkxJTkUpO1xuICAgIH1cbiAgICByZXR1cm4gdG9Qcm9taXNlKGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkJFRk9SRSwgdmFyaWFibGUsIG51bGwpKVxuICAgICAgICAudGhlbihwcm9jZWVkID0+IHtcbiAgICAgICAgICAgIGlmIChwcm9jZWVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChPTl9CRUZPUkVfQkxPQ0tFRCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQgYW5kIG9ubGluZSwgdGhlbiBzdGFydCB0aGUgZGF0YSBwdWxsIHByb2Nlc3MuXG4gICAgICAgICAgICByZXR1cm4gc2VjdXJpdHlTZXJ2aWNlLm9uVXNlckxvZ2luKCk7XG4gICAgICAgIH0pO1xufTtcblxuY29uc3QgZ2VuZXJhdGVDaGFuZ2VTZXQgPSAoY2hhbmdlczogQ2hhbmdlW10pID0+IHtcbiAgICBjb25zdCBjcmVhdGVDaGFuZ2VzID0gIF8uZmlsdGVyKGNoYW5nZXMsIGMgPT4ge1xuICAgICAgICByZXR1cm4gYy5zZXJ2aWNlID09PSAnRGF0YWJhc2VTZXJ2aWNlJyAmJlxuICAgICAgICAgICAgKGMub3BlcmF0aW9uID09PSAnaW5zZXJ0VGFibGVEYXRhJ1xuICAgICAgICAgICAgICAgIHx8IGMub3BlcmF0aW9uID09PSAnaW5zZXJ0TXVsdGlQYXJ0VGFibGVEYXRhJyk7XG4gICAgfSksIHVwZGF0ZUNoYW5nZXMgPSAgXy5maWx0ZXIoY2hhbmdlcywgYyA9PiB7XG4gICAgICAgIHJldHVybiBjLnNlcnZpY2UgPT09ICdEYXRhYmFzZVNlcnZpY2UnICYmXG4gICAgICAgICAgICAoYy5vcGVyYXRpb24gPT09ICd1cGRhdGVUYWJsZURhdGEnXG4gICAgICAgICAgICAgICAgfHwgYy5vcGVyYXRpb24gPT09ICd1cGRhdGVNdWx0aVBhcnRUYWJsZURhdGEnKTtcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgICB0b3RhbDogY2hhbmdlcyA/IGNoYW5nZXMubGVuZ3RoIDogMCxcbiAgICAgICAgZGF0YWJhc2U6IHtcbiAgICAgICAgICAgIGNyZWF0ZTogY3JlYXRlQ2hhbmdlcyxcbiAgICAgICAgICAgIHVwZGF0ZTogdXBkYXRlQ2hhbmdlcyxcbiAgICAgICAgICAgIGRlbGV0ZTogXy5maWx0ZXIoY2hhbmdlcywge3NlcnZpY2U6ICdEYXRhYmFzZVNlcnZpY2UnLCBvcGVyYXRpb246ICdkZWxldGVUYWJsZURhdGEnfSlcbiAgICAgICAgfSxcbiAgICAgICAgdXBsb2FkczogXy5maWx0ZXIoY2hhbmdlcywge3NlcnZpY2U6ICdPZmZsaW5lRmlsZVVwbG9hZFNlcnZpY2UnLCBvcGVyYXRpb246ICd1cGxvYWRUb1NlcnZlcid9KVxuICAgIH07XG59O1xuXG5jb25zdCBnZXRPZmZsaW5lQ2hhbmdlcyA9IChjaGFuZ2VMb2dTZXJ2aWNlOiBDaGFuZ2VMb2dTZXJ2aWNlKSA9PiB7XG4gICAgcmV0dXJuIGNoYW5nZUxvZ1NlcnZpY2UuZ2V0Q2hhbmdlcygpLnRoZW4oY2hhbmdlcyA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndG90YWwnIDogY2hhbmdlcyA/IGNoYW5nZXMubGVuZ3RoIDogMCxcbiAgICAgICAgICAgICdwZW5kaW5nVG9TeW5jJyA6IGdlbmVyYXRlQ2hhbmdlU2V0KF8uZmlsdGVyKGNoYW5nZXMsIHsnaGFzRXJyb3InIDogMH0pKSxcbiAgICAgICAgICAgICdmYWlsZWRUb1N5bmMnIDogZ2VuZXJhdGVDaGFuZ2VTZXQoXy5maWx0ZXIoY2hhbmdlcywgeydoYXNFcnJvcicgOiAxfSkpXG4gICAgICAgIH07XG4gICAgfSk7XG59O1xuIl19