import { NgModule } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Calendar } from '@ionic-native/calendar';
import { Camera } from '@ionic-native/camera';
import { Device } from '@ionic-native/device';
import { Contacts } from '@ionic-native/contacts';
import { MediaCapture } from '@ionic-native/media-capture';
import { Geolocation } from '@ionic-native/geolocation';
import { Vibration } from '@ionic-native/vibration';
import { App } from '@wm/core';
import { DeviceFileOpenerService, DeviceFileUploadService, NetworkService } from '@wm/mobile/core';
import { ChangeLogService, LocalDBManagementService, LocalDBDataPullService, OfflineModule } from '@wm/mobile/offline';
import { SecurityService } from '@wm/security';
import { VARIABLE_CONSTANTS, VariableManagerFactory } from '@wm/variables';
import { CalendarService } from './services/calendar-service';
import { CameraService } from './services/camera-service';
import { FileService } from './services/file-service';
import { DatasyncService } from './services/datasync-service';
import { DeviceService } from './services/device-service';
import { ContactsService } from './services/contacts-service';
import { ScanService } from './services/scan-service';
import { FileSelectorService, ProcessManagementService } from '@wm/mobile/components';
export class VariablesModule {
    constructor(app, appVersion, barcodeScanner, changeLogService, calendar, contacts, camera, fileOpener, fileSelectorService, fileUploader, device, geoLocation, localDBDataPullService, localDBManagementService, mediaCapture, processManagementService, securityService, networkService, vibrateService) {
        VariablesModule.initialize(app, appVersion, barcodeScanner, changeLogService, calendar, contacts, camera, fileOpener, fileSelectorService, fileUploader, device, geoLocation, localDBDataPullService, localDBManagementService, mediaCapture, processManagementService, securityService, networkService, vibrateService);
    }
    // Device variable services have to be added only once in the app life-cycle.
    static initialize(app, appVersion, barcodeScanner, changeLogService, calendar, contacts, camera, fileOpener, fileSelectorService, fileUploader, device, geoLocation, localDBDataPullService, localDBManagementService, mediaCapture, processManagementService, securityService, networkService, vibrateService) {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        const deviceVariableManager = VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.DEVICE);
        deviceVariableManager.registerService(new CameraService(camera, mediaCapture));
        deviceVariableManager.registerService(new CalendarService(calendar));
        deviceVariableManager.registerService(new FileService(fileOpener, fileUploader));
        deviceVariableManager.registerService(new ContactsService(contacts));
        deviceVariableManager.registerService(new DatasyncService(app, changeLogService, fileSelectorService, localDBManagementService, localDBDataPullService, processManagementService, securityService, networkService));
        deviceVariableManager.registerService(new DeviceService(app, appVersion, device, geoLocation, networkService, vibrateService));
        deviceVariableManager.registerService(new ScanService(barcodeScanner));
    }
}
VariablesModule.initialized = false;
VariablesModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    OfflineModule
                ],
                declarations: [],
                providers: [
                // add providers to mobile-runtime module.
                ]
            },] }
];
/** @nocollapse */
VariablesModule.ctorParameters = () => [
    { type: App },
    { type: AppVersion },
    { type: BarcodeScanner },
    { type: ChangeLogService },
    { type: Calendar },
    { type: Contacts },
    { type: Camera },
    { type: DeviceFileOpenerService },
    { type: FileSelectorService },
    { type: DeviceFileUploadService },
    { type: Device },
    { type: Geolocation },
    { type: LocalDBDataPullService },
    { type: LocalDBManagementService },
    { type: MediaCapture },
    { type: ProcessManagementService },
    { type: SecurityService },
    { type: NetworkService },
    { type: Vibration }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyaWFibGVzLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvdmFyaWFibGVzLyIsInNvdXJjZXMiOlsidmFyaWFibGVzLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXpDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDOUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRXBELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDL0IsT0FBTyxFQUFFLHVCQUF1QixFQUFFLHVCQUF1QixFQUFFLGNBQWMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ25HLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSx3QkFBd0IsRUFBRSxzQkFBc0IsRUFBRSxhQUFhLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN2SCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQy9DLE9BQU8sRUFBeUIsa0JBQWtCLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFbEcsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzlE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VyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDM0UsQ0FBQzs7QUFqQ2MsMkJBQVcsR0FBRyxLQUFLLENBQUM7O1lBWHRDLFFBQVEsU0FBQztnQkFDTixPQUFPLEVBQUU7b0JBQ0wsYUFBYTtpQkFDaEI7Z0JBQ0QsWUFBWSxFQUFFLEVBQUU7Z0JBQ2hCLFNBQVMsRUFBRTtnQkFDUCwwQ0FBMEM7aUJBQzdDO2FBQ0o7Ozs7WUF2QlEsR0FBRztZQVZILFVBQVU7WUFDVixjQUFjO1lBV2QsZ0JBQWdCO1lBVmhCLFFBQVE7WUFHUixRQUFRO1lBRlIsTUFBTTtZQVFOLHVCQUF1QjtZQVl2QixtQkFBbUI7WUFaTSx1QkFBdUI7WUFQaEQsTUFBTTtZQUdOLFdBQVc7WUFLaUMsc0JBQXNCO1lBQWhELHdCQUF3QjtZQU4xQyxZQUFZO1lBaUJTLHdCQUF3QjtZQVY3QyxlQUFlO1lBRm1DLGNBQWM7WUFIaEUsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEFwcFZlcnNpb24gfSBmcm9tICdAaW9uaWMtbmF0aXZlL2FwcC12ZXJzaW9uJztcbmltcG9ydCB7IEJhcmNvZGVTY2FubmVyIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9iYXJjb2RlLXNjYW5uZXInO1xuaW1wb3J0IHsgQ2FsZW5kYXIgfSBmcm9tICdAaW9uaWMtbmF0aXZlL2NhbGVuZGFyJztcbmltcG9ydCB7IENhbWVyYSB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvY2FtZXJhJztcbmltcG9ydCB7IERldmljZSB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvZGV2aWNlJztcbmltcG9ydCB7IENvbnRhY3RzIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9jb250YWN0cyc7XG5pbXBvcnQgeyBNZWRpYUNhcHR1cmUgfSBmcm9tICdAaW9uaWMtbmF0aXZlL21lZGlhLWNhcHR1cmUnO1xuaW1wb3J0IHsgR2VvbG9jYXRpb24gfSBmcm9tICdAaW9uaWMtbmF0aXZlL2dlb2xvY2F0aW9uJztcbmltcG9ydCB7IFZpYnJhdGlvbiB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvdmlicmF0aW9uJztcblxuaW1wb3J0IHsgQXBwIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgRGV2aWNlRmlsZU9wZW5lclNlcnZpY2UsIERldmljZUZpbGVVcGxvYWRTZXJ2aWNlLCBOZXR3b3JrU2VydmljZSB9IGZyb20gJ0B3bS9tb2JpbGUvY29yZSc7XG5pbXBvcnQgeyBDaGFuZ2VMb2dTZXJ2aWNlLCBMb2NhbERCTWFuYWdlbWVudFNlcnZpY2UsIExvY2FsREJEYXRhUHVsbFNlcnZpY2UsIE9mZmxpbmVNb2R1bGUgfSBmcm9tICdAd20vbW9iaWxlL29mZmxpbmUnO1xuaW1wb3J0IHsgU2VjdXJpdHlTZXJ2aWNlIH0gZnJvbSAnQHdtL3NlY3VyaXR5JztcbmltcG9ydCB7IERldmljZVZhcmlhYmxlTWFuYWdlciwgVkFSSUFCTEVfQ09OU1RBTlRTLCBWYXJpYWJsZU1hbmFnZXJGYWN0b3J5IH0gZnJvbSAnQHdtL3ZhcmlhYmxlcyc7XG5cbmltcG9ydCB7IENhbGVuZGFyU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvY2FsZW5kYXItc2VydmljZSc7XG5pbXBvcnQgeyBDYW1lcmFTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9jYW1lcmEtc2VydmljZSc7XG5pbXBvcnQgeyBGaWxlU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvZmlsZS1zZXJ2aWNlJztcbmltcG9ydCB7IERhdGFzeW5jU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvZGF0YXN5bmMtc2VydmljZSc7XG5pbXBvcnQgeyBEZXZpY2VTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9kZXZpY2Utc2VydmljZSc7XG5pbXBvcnQgeyBDb250YWN0c1NlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL2NvbnRhY3RzLXNlcnZpY2UnO1xuaW1wb3J0IHsgU2NhblNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL3NjYW4tc2VydmljZSc7XG5pbXBvcnQgeyBGaWxlU2VsZWN0b3JTZXJ2aWNlLCBQcm9jZXNzTWFuYWdlbWVudFNlcnZpY2UgfSBmcm9tICdAd20vbW9iaWxlL2NvbXBvbmVudHMnO1xuXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtcbiAgICAgICAgT2ZmbGluZU1vZHVsZVxuICAgIF0sXG4gICAgZGVjbGFyYXRpb25zOiBbXSxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgLy8gYWRkIHByb3ZpZGVycyB0byBtb2JpbGUtcnVudGltZSBtb2R1bGUuXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBWYXJpYWJsZXNNb2R1bGUge1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAvLyBEZXZpY2UgdmFyaWFibGUgc2VydmljZXMgaGF2ZSB0byBiZSBhZGRlZCBvbmx5IG9uY2UgaW4gdGhlIGFwcCBsaWZlLWN5Y2xlLlxuICAgIHByaXZhdGUgc3RhdGljIGluaXRpYWxpemUoYXBwOiBBcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBWZXJzaW9uOiBBcHBWZXJzaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFyY29kZVNjYW5uZXI6IEJhcmNvZGVTY2FubmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlTG9nU2VydmljZTogQ2hhbmdlTG9nU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGVuZGFyOiBDYWxlbmRhcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhY3RzOiBDb250YWN0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbWVyYTogQ2FtZXJhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU9wZW5lcjogRGV2aWNlRmlsZU9wZW5lclNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlU2VsZWN0b3JTZXJ2aWNlOiBGaWxlU2VsZWN0b3JTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVVwbG9hZGVyOiBEZXZpY2VGaWxlVXBsb2FkU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZTogRGV2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VvTG9jYXRpb246IEdlb2xvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxEQkRhdGFQdWxsU2VydmljZTogTG9jYWxEQkRhdGFQdWxsU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZTogTG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVkaWFDYXB0dXJlOiBNZWRpYUNhcHR1cmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzTWFuYWdlbWVudFNlcnZpY2U6IFByb2Nlc3NNYW5hZ2VtZW50U2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY3VyaXR5U2VydmljZTogU2VjdXJpdHlTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV0d29ya1NlcnZpY2U6IE5ldHdvcmtTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlicmF0ZVNlcnZpY2U6IFZpYnJhdGlvbikge1xuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBkZXZpY2VWYXJpYWJsZU1hbmFnZXIgPSBWYXJpYWJsZU1hbmFnZXJGYWN0b3J5LmdldChWQVJJQUJMRV9DT05TVEFOVFMuQ0FURUdPUlkuREVWSUNFKSBhcyBEZXZpY2VWYXJpYWJsZU1hbmFnZXI7XG4gICAgICAgIGRldmljZVZhcmlhYmxlTWFuYWdlci5yZWdpc3RlclNlcnZpY2UobmV3IENhbWVyYVNlcnZpY2UoY2FtZXJhLCBtZWRpYUNhcHR1cmUpKTtcbiAgICAgICAgZGV2aWNlVmFyaWFibGVNYW5hZ2VyLnJlZ2lzdGVyU2VydmljZShuZXcgQ2FsZW5kYXJTZXJ2aWNlKGNhbGVuZGFyKSk7XG4gICAgICAgIGRldmljZVZhcmlhYmxlTWFuYWdlci5yZWdpc3RlclNlcnZpY2UobmV3IEZpbGVTZXJ2aWNlKGZpbGVPcGVuZXIsIGZpbGVVcGxvYWRlcikpO1xuICAgICAgICBkZXZpY2VWYXJpYWJsZU1hbmFnZXIucmVnaXN0ZXJTZXJ2aWNlKG5ldyBDb250YWN0c1NlcnZpY2UoY29udGFjdHMpKTtcbiAgICAgICAgZGV2aWNlVmFyaWFibGVNYW5hZ2VyLnJlZ2lzdGVyU2VydmljZShuZXcgRGF0YXN5bmNTZXJ2aWNlKGFwcCwgY2hhbmdlTG9nU2VydmljZSwgZmlsZVNlbGVjdG9yU2VydmljZSwgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLCBsb2NhbERCRGF0YVB1bGxTZXJ2aWNlLCBwcm9jZXNzTWFuYWdlbWVudFNlcnZpY2UsIHNlY3VyaXR5U2VydmljZSwgbmV0d29ya1NlcnZpY2UpKTtcbiAgICAgICAgZGV2aWNlVmFyaWFibGVNYW5hZ2VyLnJlZ2lzdGVyU2VydmljZShuZXcgRGV2aWNlU2VydmljZShhcHAsIGFwcFZlcnNpb24sIGRldmljZSwgZ2VvTG9jYXRpb24sIG5ldHdvcmtTZXJ2aWNlLCB2aWJyYXRlU2VydmljZSkpO1xuICAgICAgICBkZXZpY2VWYXJpYWJsZU1hbmFnZXIucmVnaXN0ZXJTZXJ2aWNlKG5ldyBTY2FuU2VydmljZShiYXJjb2RlU2Nhbm5lcikpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBhcHA6IEFwcCxcbiAgICAgICAgYXBwVmVyc2lvbjogQXBwVmVyc2lvbixcbiAgICAgICAgYmFyY29kZVNjYW5uZXI6IEJhcmNvZGVTY2FubmVyLFxuICAgICAgICBjaGFuZ2VMb2dTZXJ2aWNlOiBDaGFuZ2VMb2dTZXJ2aWNlLFxuICAgICAgICBjYWxlbmRhcjogQ2FsZW5kYXIsXG4gICAgICAgIGNvbnRhY3RzOiBDb250YWN0cyxcbiAgICAgICAgY2FtZXJhOiBDYW1lcmEsXG4gICAgICAgIGZpbGVPcGVuZXI6IERldmljZUZpbGVPcGVuZXJTZXJ2aWNlLFxuICAgICAgICBmaWxlU2VsZWN0b3JTZXJ2aWNlOiBGaWxlU2VsZWN0b3JTZXJ2aWNlLFxuICAgICAgICBmaWxlVXBsb2FkZXI6IERldmljZUZpbGVVcGxvYWRTZXJ2aWNlLFxuICAgICAgICBkZXZpY2U6IERldmljZSxcbiAgICAgICAgZ2VvTG9jYXRpb246IEdlb2xvY2F0aW9uLFxuICAgICAgICBsb2NhbERCRGF0YVB1bGxTZXJ2aWNlOiBMb2NhbERCRGF0YVB1bGxTZXJ2aWNlLFxuICAgICAgICBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2U6IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSxcbiAgICAgICAgbWVkaWFDYXB0dXJlOiBNZWRpYUNhcHR1cmUsXG4gICAgICAgIHByb2Nlc3NNYW5hZ2VtZW50U2VydmljZTogUHJvY2Vzc01hbmFnZW1lbnRTZXJ2aWNlLFxuICAgICAgICBzZWN1cml0eVNlcnZpY2U6IFNlY3VyaXR5U2VydmljZSxcbiAgICAgICAgbmV0d29ya1NlcnZpY2U6IE5ldHdvcmtTZXJ2aWNlLFxuICAgICAgICB2aWJyYXRlU2VydmljZTogVmlicmF0aW9uXG4gICAgKSB7XG4gICAgICAgIFZhcmlhYmxlc01vZHVsZS5pbml0aWFsaXplKGFwcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcFZlcnNpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXJjb2RlU2Nhbm5lcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZUxvZ1NlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxlbmRhcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhY3RzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FtZXJhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU9wZW5lcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTZWxlY3RvclNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlVXBsb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW9Mb2NhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsREJEYXRhUHVsbFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWRpYUNhcHR1cmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzTWFuYWdlbWVudFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWN1cml0eVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXR3b3JrU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpYnJhdGVTZXJ2aWNlKTtcbiAgICB9XG59XG4iXX0=