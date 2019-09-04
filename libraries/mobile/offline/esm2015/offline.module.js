import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { File } from '@ionic-native/file';
import { AbstractHttpService, App, hasCordova, noop } from '@wm/core';
import { DeviceFileService, DeviceFileUploadService, DeviceService, NetworkService } from '@wm/mobile/core';
import { SecurityService } from '@wm/security';
import { ChangeLogService } from './services/change-log.service';
import { LocalDBManagementService } from './services/local-db-management.service';
import { LocalDbService } from './services/local-db.service';
import { FileHandler, UploadedFilesImportAndExportService } from './services/workers/file-handler';
import { ErrorBlocker } from './services/workers/error-blocker';
import { IdResolver } from './services/workers/id-resolver';
import { MultiPartParamTransformer } from './services/workers/multi-part-param-transformer';
import { LiveVariableOfflineBehaviour } from './utils/live-variable.utils';
import { FileUploadOfflineBehaviour } from './utils/file-upload.utils';
import { NamedQueryExecutionOfflineBehaviour } from './utils/query-executor.utils';
import { SecurityOfflineBehaviour } from './utils/security.utils';
export class OfflineModule {
    constructor(app, changeLogService, deviceService, deviceFileService, deviceFileUploadService, file, httpService, localDBManagementService, localDbService, networkService, securityService) {
        if (hasCordova()) {
            OfflineModule.initialize(app, changeLogService, deviceService, deviceFileService, deviceFileUploadService, file, httpService, localDBManagementService, localDbService, networkService, securityService);
        }
    }
    // Startup services have to be added only once in the app life-cycle.
    static initialize(app, changeLogService, deviceService, deviceFileService, deviceFileUploadService, file, httpService, localDBManagementService, localDbService, networkService, securityService) {
        if (this.initialized) {
            return;
        }
        deviceService.addStartUpService({
            serviceName: 'OfflineStartupService',
            start: () => {
                if (window['SQLitePlugin']) {
                    localDBManagementService.setLogSQl((sessionStorage.getItem('wm.logSql') === 'true') || (sessionStorage.getItem('debugMode') === 'true'));
                    window.logSql = (flag = true) => {
                        localDBManagementService.setLogSQl(flag);
                        sessionStorage.setItem('wm.logSql', flag ? 'true' : 'false');
                    };
                    window.executeLocalSql = (dbName, query, params) => {
                        localDBManagementService.executeSQLQuery(dbName, query, params, true);
                    };
                    return localDBManagementService.loadDatabases().then(() => {
                        changeLogService.addWorker(new IdResolver(localDBManagementService));
                        changeLogService.addWorker(new ErrorBlocker(localDBManagementService));
                        changeLogService.addWorker(new FileHandler());
                        changeLogService.addWorker(new MultiPartParamTransformer(deviceFileService, localDBManagementService));
                        new LiveVariableOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService, localDbService).add();
                        new FileUploadOfflineBehaviour(changeLogService, deviceFileService, deviceFileUploadService, file, networkService, deviceFileService.getUploadDirectory()).add();
                        new NamedQueryExecutionOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService).add();
                        localDBManagementService.registerCallback(new UploadedFilesImportAndExportService(changeLogService, deviceFileService, localDBManagementService, file));
                        changeLogService.addWorker({
                            onAddCall: () => {
                                if (!networkService.isConnected()) {
                                    networkService.disableAutoConnect();
                                }
                            },
                            postFlush: stats => {
                                if (stats.totalTaskCount > 0) {
                                    localDBManagementService.close()
                                        .catch(noop)
                                        .then(() => {
                                        location.assign(window.location.origin + window.location.pathname);
                                    });
                                }
                            }
                        });
                    });
                }
                return Promise.resolve();
            }
        });
        new SecurityOfflineBehaviour(app, file, deviceService, networkService, securityService).add();
    }
}
OfflineModule.initialized = false;
OfflineModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule
                ],
                declarations: [],
                exports: [],
                providers: [
                // add providers to mobile-runtime module.
                ],
                entryComponents: []
            },] }
];
/** @nocollapse */
OfflineModule.ctorParameters = () => [
    { type: App },
    { type: ChangeLogService },
    { type: DeviceService },
    { type: DeviceFileService },
    { type: DeviceFileUploadService },
    { type: File },
    { type: AbstractHttpService },
    { type: LocalDBManagementService },
    { type: LocalDbService },
    { type: NetworkService },
    { type: SecurityService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2ZmbGluZS5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL29mZmxpbmUvIiwic291cmNlcyI6WyJvZmZsaW5lLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFMUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3RFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSx1QkFBdUIsRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDNUcsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUUvQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNqRSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNsRixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxtQ0FBbUMsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ25HLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUNoRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDNUQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0saURBQWlELENBQUM7QUFDNUYsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM0UsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdkUsT0FBTyxFQUFFLG1DQUFtQyxFQUFFLE1BQU0sOEJBQThC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ZjtnQkFDRCxZQUFZLEVBQUUsRUFBRTtnQkFDaEIsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsU0FBUyxFQUFFO2dCQUNQLDBDQUEwQztpQkFDN0M7Z0JBQ0QsZUFBZSxFQUFFLEVBQUU7YUFDdEI7Ozs7WUExQjZCLEdBQUc7WUFJeEIsZ0JBQWdCO1lBSDRCLGFBQWE7WUFBekQsaUJBQWlCO1lBQUUsdUJBQXVCO1lBSDFDLElBQUk7WUFFSixtQkFBbUI7WUFLbkIsd0JBQXdCO1lBQ3hCLGNBQWM7WUFMNkMsY0FBYztZQUN6RSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7IEZpbGUgfSBmcm9tICdAaW9uaWMtbmF0aXZlL2ZpbGUnO1xuXG5pbXBvcnQgeyBBYnN0cmFjdEh0dHBTZXJ2aWNlLCBBcHAsIGhhc0NvcmRvdmEsIG5vb3AgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBEZXZpY2VGaWxlU2VydmljZSwgRGV2aWNlRmlsZVVwbG9hZFNlcnZpY2UsIERldmljZVNlcnZpY2UsIE5ldHdvcmtTZXJ2aWNlIH0gZnJvbSAnQHdtL21vYmlsZS9jb3JlJztcbmltcG9ydCB7IFNlY3VyaXR5U2VydmljZSB9IGZyb20gJ0B3bS9zZWN1cml0eSc7XG5cbmltcG9ydCB7IENoYW5nZUxvZ1NlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL2NoYW5nZS1sb2cuc2VydmljZSc7XG5pbXBvcnQgeyBMb2NhbERCTWFuYWdlbWVudFNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL2xvY2FsLWRiLW1hbmFnZW1lbnQuc2VydmljZSc7XG5pbXBvcnQgeyBMb2NhbERiU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvbG9jYWwtZGIuc2VydmljZSc7XG5pbXBvcnQgeyBGaWxlSGFuZGxlciwgVXBsb2FkZWRGaWxlc0ltcG9ydEFuZEV4cG9ydFNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL3dvcmtlcnMvZmlsZS1oYW5kbGVyJztcbmltcG9ydCB7IEVycm9yQmxvY2tlciB9IGZyb20gJy4vc2VydmljZXMvd29ya2Vycy9lcnJvci1ibG9ja2VyJztcbmltcG9ydCB7IElkUmVzb2x2ZXIgfSBmcm9tICcuL3NlcnZpY2VzL3dvcmtlcnMvaWQtcmVzb2x2ZXInO1xuaW1wb3J0IHsgTXVsdGlQYXJ0UGFyYW1UcmFuc2Zvcm1lciB9IGZyb20gJy4vc2VydmljZXMvd29ya2Vycy9tdWx0aS1wYXJ0LXBhcmFtLXRyYW5zZm9ybWVyJztcbmltcG9ydCB7IExpdmVWYXJpYWJsZU9mZmxpbmVCZWhhdmlvdXIgfSBmcm9tICcuL3V0aWxzL2xpdmUtdmFyaWFibGUudXRpbHMnO1xuaW1wb3J0IHsgRmlsZVVwbG9hZE9mZmxpbmVCZWhhdmlvdXIgfSBmcm9tICcuL3V0aWxzL2ZpbGUtdXBsb2FkLnV0aWxzJztcbmltcG9ydCB7IE5hbWVkUXVlcnlFeGVjdXRpb25PZmZsaW5lQmVoYXZpb3VyIH0gZnJvbSAnLi91dGlscy9xdWVyeS1leGVjdXRvci51dGlscyc7XG5pbXBvcnQgeyBTZWN1cml0eU9mZmxpbmVCZWhhdmlvdXIgfSBmcm9tICcuL3V0aWxzL3NlY3VyaXR5LnV0aWxzJztcblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAgIENvbW1vbk1vZHVsZVxuICAgIF0sXG4gICAgZGVjbGFyYXRpb25zOiBbXSxcbiAgICBleHBvcnRzOiBbXSxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgLy8gYWRkIHByb3ZpZGVycyB0byBtb2JpbGUtcnVudGltZSBtb2R1bGUuXG4gICAgXSxcbiAgICBlbnRyeUNvbXBvbmVudHM6IFtdXG59KVxuZXhwb3J0IGNsYXNzIE9mZmxpbmVNb2R1bGUge1xuICAgIHN0YXRpYyBpbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIC8vIFN0YXJ0dXAgc2VydmljZXMgaGF2ZSB0byBiZSBhZGRlZCBvbmx5IG9uY2UgaW4gdGhlIGFwcCBsaWZlLWN5Y2xlLlxuICAgIHN0YXRpYyBpbml0aWFsaXplKGFwcDogQXBwLFxuICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZUxvZ1NlcnZpY2U6IENoYW5nZUxvZ1NlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgZGV2aWNlU2VydmljZTogRGV2aWNlU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VGaWxlU2VydmljZTogRGV2aWNlRmlsZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgZGV2aWNlRmlsZVVwbG9hZFNlcnZpY2U6IERldmljZUZpbGVVcGxvYWRTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IEZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgaHR0cFNlcnZpY2U6IEFic3RyYWN0SHR0cFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlOiBMb2NhbERCTWFuYWdlbWVudFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgbG9jYWxEYlNlcnZpY2U6IExvY2FsRGJTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgIG5ldHdvcmtTZXJ2aWNlOiBOZXR3b3JrU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICBzZWN1cml0eVNlcnZpY2U6IFNlY3VyaXR5U2VydmljZSkge1xuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZGV2aWNlU2VydmljZS5hZGRTdGFydFVwU2VydmljZSh7XG4gICAgICAgICAgICBzZXJ2aWNlTmFtZTogJ09mZmxpbmVTdGFydHVwU2VydmljZScsXG4gICAgICAgICAgICBzdGFydDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh3aW5kb3dbJ1NRTGl0ZVBsdWdpbiddKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZS5zZXRMb2dTUWwoKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3dtLmxvZ1NxbCcpID09PSAndHJ1ZScpIHx8IChzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdkZWJ1Z01vZGUnKSA9PT0gJ3RydWUnKSk7XG4gICAgICAgICAgICAgICAgICAgICh3aW5kb3cgYXMgYW55KS5sb2dTcWwgPSAoZmxhZyA9IHRydWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZS5zZXRMb2dTUWwoZmxhZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd3bS5sb2dTcWwnLCBmbGFnID8gJ3RydWUnIDogJ2ZhbHNlJyk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICh3aW5kb3cgYXMgYW55KS5leGVjdXRlTG9jYWxTcWwgPSAoZGJOYW1lLCBxdWVyeSwgcGFyYW1zPykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLmV4ZWN1dGVTUUxRdWVyeShkYk5hbWUsIHF1ZXJ5LCBwYXJhbXMsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLmxvYWREYXRhYmFzZXMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZUxvZ1NlcnZpY2UuYWRkV29ya2VyKG5ldyBJZFJlc29sdmVyKGxvY2FsREJNYW5hZ2VtZW50U2VydmljZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlTG9nU2VydmljZS5hZGRXb3JrZXIobmV3IEVycm9yQmxvY2tlcihsb2NhbERCTWFuYWdlbWVudFNlcnZpY2UpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZUxvZ1NlcnZpY2UuYWRkV29ya2VyKG5ldyBGaWxlSGFuZGxlcigpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZUxvZ1NlcnZpY2UuYWRkV29ya2VyKG5ldyBNdWx0aVBhcnRQYXJhbVRyYW5zZm9ybWVyKGRldmljZUZpbGVTZXJ2aWNlLCBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2UpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBMaXZlVmFyaWFibGVPZmZsaW5lQmVoYXZpb3VyKGNoYW5nZUxvZ1NlcnZpY2UsIGh0dHBTZXJ2aWNlLCBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2UsIG5ldHdvcmtTZXJ2aWNlLCBsb2NhbERiU2VydmljZSkuYWRkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRmlsZVVwbG9hZE9mZmxpbmVCZWhhdmlvdXIoY2hhbmdlTG9nU2VydmljZSwgZGV2aWNlRmlsZVNlcnZpY2UsIGRldmljZUZpbGVVcGxvYWRTZXJ2aWNlLCBmaWxlLCBuZXR3b3JrU2VydmljZSwgZGV2aWNlRmlsZVNlcnZpY2UuZ2V0VXBsb2FkRGlyZWN0b3J5KCkpLmFkZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IE5hbWVkUXVlcnlFeGVjdXRpb25PZmZsaW5lQmVoYXZpb3VyKGNoYW5nZUxvZ1NlcnZpY2UsIGh0dHBTZXJ2aWNlLCBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2UsIG5ldHdvcmtTZXJ2aWNlKS5hZGQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZS5yZWdpc3RlckNhbGxiYWNrKG5ldyBVcGxvYWRlZEZpbGVzSW1wb3J0QW5kRXhwb3J0U2VydmljZShjaGFuZ2VMb2dTZXJ2aWNlLCBkZXZpY2VGaWxlU2VydmljZSwgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLCBmaWxlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VMb2dTZXJ2aWNlLmFkZFdvcmtlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25BZGRDYWxsOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbmV0d29ya1NlcnZpY2UuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV0d29ya1NlcnZpY2UuZGlzYWJsZUF1dG9Db25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RGbHVzaDogc3RhdHMgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHMudG90YWxUYXNrQ291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2UuY2xvc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChub29wKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uYXNzaWduKHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBuZXcgU2VjdXJpdHlPZmZsaW5lQmVoYXZpb3VyKGFwcCwgZmlsZSwgZGV2aWNlU2VydmljZSwgbmV0d29ya1NlcnZpY2UsIHNlY3VyaXR5U2VydmljZSkuYWRkKCk7XG4gICAgfVxuXG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgYXBwOiBBcHAsXG4gICAgICAgIGNoYW5nZUxvZ1NlcnZpY2U6IENoYW5nZUxvZ1NlcnZpY2UsXG4gICAgICAgIGRldmljZVNlcnZpY2U6IERldmljZVNlcnZpY2UsXG4gICAgICAgIGRldmljZUZpbGVTZXJ2aWNlOiBEZXZpY2VGaWxlU2VydmljZSxcbiAgICAgICAgZGV2aWNlRmlsZVVwbG9hZFNlcnZpY2U6IERldmljZUZpbGVVcGxvYWRTZXJ2aWNlLFxuICAgICAgICBmaWxlOiBGaWxlLFxuICAgICAgICBodHRwU2VydmljZTogQWJzdHJhY3RIdHRwU2VydmljZSxcbiAgICAgICAgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlOiBMb2NhbERCTWFuYWdlbWVudFNlcnZpY2UsXG4gICAgICAgIGxvY2FsRGJTZXJ2aWNlOiBMb2NhbERiU2VydmljZSxcbiAgICAgICAgbmV0d29ya1NlcnZpY2U6IE5ldHdvcmtTZXJ2aWNlLFxuICAgICAgICBzZWN1cml0eVNlcnZpY2U6IFNlY3VyaXR5U2VydmljZVxuICAgICkge1xuICAgICAgICBpZiAoaGFzQ29yZG92YSgpKSB7XG4gICAgICAgICAgICBPZmZsaW5lTW9kdWxlLmluaXRpYWxpemUoYXBwLFxuICAgICAgICAgICAgICAgIGNoYW5nZUxvZ1NlcnZpY2UsXG4gICAgICAgICAgICAgICAgZGV2aWNlU2VydmljZSxcbiAgICAgICAgICAgICAgICBkZXZpY2VGaWxlU2VydmljZSxcbiAgICAgICAgICAgICAgICBkZXZpY2VGaWxlVXBsb2FkU2VydmljZSxcbiAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgIGh0dHBTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZSxcbiAgICAgICAgICAgICAgICBsb2NhbERiU2VydmljZSxcbiAgICAgICAgICAgICAgICBuZXR3b3JrU2VydmljZSxcbiAgICAgICAgICAgICAgICBzZWN1cml0eVNlcnZpY2UpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19