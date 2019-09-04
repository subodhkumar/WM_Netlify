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
var OfflineModule = /** @class */ (function () {
    function OfflineModule(app, changeLogService, deviceService, deviceFileService, deviceFileUploadService, file, httpService, localDBManagementService, localDbService, networkService, securityService) {
        if (hasCordova()) {
            OfflineModule.initialize(app, changeLogService, deviceService, deviceFileService, deviceFileUploadService, file, httpService, localDBManagementService, localDbService, networkService, securityService);
        }
    }
    // Startup services have to be added only once in the app life-cycle.
    OfflineModule.initialize = function (app, changeLogService, deviceService, deviceFileService, deviceFileUploadService, file, httpService, localDBManagementService, localDbService, networkService, securityService) {
        if (this.initialized) {
            return;
        }
        deviceService.addStartUpService({
            serviceName: 'OfflineStartupService',
            start: function () {
                if (window['SQLitePlugin']) {
                    localDBManagementService.setLogSQl((sessionStorage.getItem('wm.logSql') === 'true') || (sessionStorage.getItem('debugMode') === 'true'));
                    window.logSql = function (flag) {
                        if (flag === void 0) { flag = true; }
                        localDBManagementService.setLogSQl(flag);
                        sessionStorage.setItem('wm.logSql', flag ? 'true' : 'false');
                    };
                    window.executeLocalSql = function (dbName, query, params) {
                        localDBManagementService.executeSQLQuery(dbName, query, params, true);
                    };
                    return localDBManagementService.loadDatabases().then(function () {
                        changeLogService.addWorker(new IdResolver(localDBManagementService));
                        changeLogService.addWorker(new ErrorBlocker(localDBManagementService));
                        changeLogService.addWorker(new FileHandler());
                        changeLogService.addWorker(new MultiPartParamTransformer(deviceFileService, localDBManagementService));
                        new LiveVariableOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService, localDbService).add();
                        new FileUploadOfflineBehaviour(changeLogService, deviceFileService, deviceFileUploadService, file, networkService, deviceFileService.getUploadDirectory()).add();
                        new NamedQueryExecutionOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService).add();
                        localDBManagementService.registerCallback(new UploadedFilesImportAndExportService(changeLogService, deviceFileService, localDBManagementService, file));
                        changeLogService.addWorker({
                            onAddCall: function () {
                                if (!networkService.isConnected()) {
                                    networkService.disableAutoConnect();
                                }
                            },
                            postFlush: function (stats) {
                                if (stats.totalTaskCount > 0) {
                                    localDBManagementService.close()
                                        .catch(noop)
                                        .then(function () {
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
    };
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
    OfflineModule.ctorParameters = function () { return [
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
    ]; };
    return OfflineModule;
}());
export { OfflineModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2ZmbGluZS5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL29mZmxpbmUvIiwic291cmNlcyI6WyJvZmZsaW5lLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFMUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3RFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSx1QkFBdUIsRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDNUcsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUUvQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNqRSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNsRixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxtQ0FBbUMsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ25HLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUNoRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDNUQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0saURBQWlELENBQUM7QUFDNUYsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM0UsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdkUsT0FBTyxFQUFFLG1DQUFtQyxFQUFFLE1BQU0sOEJBQThC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QTBDO3FCQUM3QztvQkFDRCxlQUFlLEVBQUUsRUFBRTtpQkFDdEI7Ozs7Z0JBMUI2QixHQUFHO2dCQUl4QixnQkFBZ0I7Z0JBSDRCLGFBQWE7Z0JBQXpELGlCQUFpQjtnQkFBRSx1QkFBdUI7Z0JBSDFDLElBQUk7Z0JBRUosbUJBQW1CO2dCQUtuQix3QkFBd0I7Z0JBQ3hCLGNBQWM7Z0JBTDZDLGNBQWM7Z0JBQ3pFLGVBQWU7O0lBb0h4QixvQkFBQztDQUFBLEFBdEdELElBc0dDO1NBM0ZZLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgRmlsZSB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvZmlsZSc7XG5cbmltcG9ydCB7IEFic3RyYWN0SHR0cFNlcnZpY2UsIEFwcCwgaGFzQ29yZG92YSwgbm9vcCB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IERldmljZUZpbGVTZXJ2aWNlLCBEZXZpY2VGaWxlVXBsb2FkU2VydmljZSwgRGV2aWNlU2VydmljZSwgTmV0d29ya1NlcnZpY2UgfSBmcm9tICdAd20vbW9iaWxlL2NvcmUnO1xuaW1wb3J0IHsgU2VjdXJpdHlTZXJ2aWNlIH0gZnJvbSAnQHdtL3NlY3VyaXR5JztcblxuaW1wb3J0IHsgQ2hhbmdlTG9nU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvY2hhbmdlLWxvZy5zZXJ2aWNlJztcbmltcG9ydCB7IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvbG9jYWwtZGItbWFuYWdlbWVudC5zZXJ2aWNlJztcbmltcG9ydCB7IExvY2FsRGJTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9sb2NhbC1kYi5zZXJ2aWNlJztcbmltcG9ydCB7IEZpbGVIYW5kbGVyLCBVcGxvYWRlZEZpbGVzSW1wb3J0QW5kRXhwb3J0U2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvd29ya2Vycy9maWxlLWhhbmRsZXInO1xuaW1wb3J0IHsgRXJyb3JCbG9ja2VyIH0gZnJvbSAnLi9zZXJ2aWNlcy93b3JrZXJzL2Vycm9yLWJsb2NrZXInO1xuaW1wb3J0IHsgSWRSZXNvbHZlciB9IGZyb20gJy4vc2VydmljZXMvd29ya2Vycy9pZC1yZXNvbHZlcic7XG5pbXBvcnQgeyBNdWx0aVBhcnRQYXJhbVRyYW5zZm9ybWVyIH0gZnJvbSAnLi9zZXJ2aWNlcy93b3JrZXJzL211bHRpLXBhcnQtcGFyYW0tdHJhbnNmb3JtZXInO1xuaW1wb3J0IHsgTGl2ZVZhcmlhYmxlT2ZmbGluZUJlaGF2aW91ciB9IGZyb20gJy4vdXRpbHMvbGl2ZS12YXJpYWJsZS51dGlscyc7XG5pbXBvcnQgeyBGaWxlVXBsb2FkT2ZmbGluZUJlaGF2aW91ciB9IGZyb20gJy4vdXRpbHMvZmlsZS11cGxvYWQudXRpbHMnO1xuaW1wb3J0IHsgTmFtZWRRdWVyeUV4ZWN1dGlvbk9mZmxpbmVCZWhhdmlvdXIgfSBmcm9tICcuL3V0aWxzL3F1ZXJ5LWV4ZWN1dG9yLnV0aWxzJztcbmltcG9ydCB7IFNlY3VyaXR5T2ZmbGluZUJlaGF2aW91ciB9IGZyb20gJy4vdXRpbHMvc2VjdXJpdHkudXRpbHMnO1xuXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtcbiAgICAgICAgQ29tbW9uTW9kdWxlXG4gICAgXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtdLFxuICAgIGV4cG9ydHM6IFtdLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICAvLyBhZGQgcHJvdmlkZXJzIHRvIG1vYmlsZS1ydW50aW1lIG1vZHVsZS5cbiAgICBdLFxuICAgIGVudHJ5Q29tcG9uZW50czogW11cbn0pXG5leHBvcnQgY2xhc3MgT2ZmbGluZU1vZHVsZSB7XG4gICAgc3RhdGljIGluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgLy8gU3RhcnR1cCBzZXJ2aWNlcyBoYXZlIHRvIGJlIGFkZGVkIG9ubHkgb25jZSBpbiB0aGUgYXBwIGxpZmUtY3ljbGUuXG4gICAgc3RhdGljIGluaXRpYWxpemUoYXBwOiBBcHAsXG4gICAgICAgICAgICAgICAgICAgICAgY2hhbmdlTG9nU2VydmljZTogQ2hhbmdlTG9nU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VTZXJ2aWNlOiBEZXZpY2VTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgIGRldmljZUZpbGVTZXJ2aWNlOiBEZXZpY2VGaWxlU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VGaWxlVXBsb2FkU2VydmljZTogRGV2aWNlRmlsZVVwbG9hZFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgZmlsZTogRmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICBodHRwU2VydmljZTogQWJzdHJhY3RIdHRwU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2U6IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICBsb2NhbERiU2VydmljZTogTG9jYWxEYlNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgbmV0d29ya1NlcnZpY2U6IE5ldHdvcmtTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgIHNlY3VyaXR5U2VydmljZTogU2VjdXJpdHlTZXJ2aWNlKSB7XG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkZXZpY2VTZXJ2aWNlLmFkZFN0YXJ0VXBTZXJ2aWNlKHtcbiAgICAgICAgICAgIHNlcnZpY2VOYW1lOiAnT2ZmbGluZVN0YXJ0dXBTZXJ2aWNlJyxcbiAgICAgICAgICAgIHN0YXJ0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvd1snU1FMaXRlUGx1Z2luJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLnNldExvZ1NRbCgoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnd20ubG9nU3FsJykgPT09ICd0cnVlJykgfHwgKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2RlYnVnTW9kZScpID09PSAndHJ1ZScpKTtcbiAgICAgICAgICAgICAgICAgICAgKHdpbmRvdyBhcyBhbnkpLmxvZ1NxbCA9IChmbGFnID0gdHJ1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLnNldExvZ1NRbChmbGFnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3dtLmxvZ1NxbCcsIGZsYWcgPyAndHJ1ZScgOiAnZmFsc2UnKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgKHdpbmRvdyBhcyBhbnkpLmV4ZWN1dGVMb2NhbFNxbCA9IChkYk5hbWUsIHF1ZXJ5LCBwYXJhbXM/KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2UuZXhlY3V0ZVNRTFF1ZXJ5KGRiTmFtZSwgcXVlcnksIHBhcmFtcywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2UubG9hZERhdGFiYXNlcygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlTG9nU2VydmljZS5hZGRXb3JrZXIobmV3IElkUmVzb2x2ZXIobG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VMb2dTZXJ2aWNlLmFkZFdvcmtlcihuZXcgRXJyb3JCbG9ja2VyKGxvY2FsREJNYW5hZ2VtZW50U2VydmljZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlTG9nU2VydmljZS5hZGRXb3JrZXIobmV3IEZpbGVIYW5kbGVyKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlTG9nU2VydmljZS5hZGRXb3JrZXIobmV3IE11bHRpUGFydFBhcmFtVHJhbnNmb3JtZXIoZGV2aWNlRmlsZVNlcnZpY2UsIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IExpdmVWYXJpYWJsZU9mZmxpbmVCZWhhdmlvdXIoY2hhbmdlTG9nU2VydmljZSwgaHR0cFNlcnZpY2UsIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZSwgbmV0d29ya1NlcnZpY2UsIGxvY2FsRGJTZXJ2aWNlKS5hZGQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBGaWxlVXBsb2FkT2ZmbGluZUJlaGF2aW91cihjaGFuZ2VMb2dTZXJ2aWNlLCBkZXZpY2VGaWxlU2VydmljZSwgZGV2aWNlRmlsZVVwbG9hZFNlcnZpY2UsIGZpbGUsIG5ldHdvcmtTZXJ2aWNlLCBkZXZpY2VGaWxlU2VydmljZS5nZXRVcGxvYWREaXJlY3RvcnkoKSkuYWRkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgTmFtZWRRdWVyeUV4ZWN1dGlvbk9mZmxpbmVCZWhhdmlvdXIoY2hhbmdlTG9nU2VydmljZSwgaHR0cFNlcnZpY2UsIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZSwgbmV0d29ya1NlcnZpY2UpLmFkZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLnJlZ2lzdGVyQ2FsbGJhY2sobmV3IFVwbG9hZGVkRmlsZXNJbXBvcnRBbmRFeHBvcnRTZXJ2aWNlKGNoYW5nZUxvZ1NlcnZpY2UsIGRldmljZUZpbGVTZXJ2aWNlLCBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2UsIGZpbGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZUxvZ1NlcnZpY2UuYWRkV29ya2VyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkFkZENhbGw6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFuZXR3b3JrU2VydmljZS5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXR3b3JrU2VydmljZS5kaXNhYmxlQXV0b0Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdEZsdXNoOiBzdGF0cyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0cy50b3RhbFRhc2tDb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZS5jbG9zZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKG5vb3ApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5hc3NpZ24od2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG5ldyBTZWN1cml0eU9mZmxpbmVCZWhhdmlvdXIoYXBwLCBmaWxlLCBkZXZpY2VTZXJ2aWNlLCBuZXR3b3JrU2VydmljZSwgc2VjdXJpdHlTZXJ2aWNlKS5hZGQoKTtcbiAgICB9XG5cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBhcHA6IEFwcCxcbiAgICAgICAgY2hhbmdlTG9nU2VydmljZTogQ2hhbmdlTG9nU2VydmljZSxcbiAgICAgICAgZGV2aWNlU2VydmljZTogRGV2aWNlU2VydmljZSxcbiAgICAgICAgZGV2aWNlRmlsZVNlcnZpY2U6IERldmljZUZpbGVTZXJ2aWNlLFxuICAgICAgICBkZXZpY2VGaWxlVXBsb2FkU2VydmljZTogRGV2aWNlRmlsZVVwbG9hZFNlcnZpY2UsXG4gICAgICAgIGZpbGU6IEZpbGUsXG4gICAgICAgIGh0dHBTZXJ2aWNlOiBBYnN0cmFjdEh0dHBTZXJ2aWNlLFxuICAgICAgICBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2U6IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSxcbiAgICAgICAgbG9jYWxEYlNlcnZpY2U6IExvY2FsRGJTZXJ2aWNlLFxuICAgICAgICBuZXR3b3JrU2VydmljZTogTmV0d29ya1NlcnZpY2UsXG4gICAgICAgIHNlY3VyaXR5U2VydmljZTogU2VjdXJpdHlTZXJ2aWNlXG4gICAgKSB7XG4gICAgICAgIGlmIChoYXNDb3Jkb3ZhKCkpIHtcbiAgICAgICAgICAgIE9mZmxpbmVNb2R1bGUuaW5pdGlhbGl6ZShhcHAsXG4gICAgICAgICAgICAgICAgY2hhbmdlTG9nU2VydmljZSxcbiAgICAgICAgICAgICAgICBkZXZpY2VTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIGRldmljZUZpbGVTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIGRldmljZUZpbGVVcGxvYWRTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgICAgICAgaHR0cFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIGxvY2FsRGJTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIG5ldHdvcmtTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIHNlY3VyaXR5U2VydmljZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=