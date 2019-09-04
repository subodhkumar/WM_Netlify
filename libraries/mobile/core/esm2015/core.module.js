import { NgModule } from '@angular/core';
import { hasCordova } from '@wm/core';
import { DeviceFileCacheService } from './services/device-file-cache.service';
import { DeviceFileOpenerService } from './services/device-file-opener.service';
import { DeviceFileService } from './services/device-file.service';
import { DeviceService } from './services/device.service';
import { NetworkService } from './services/network.service';
export class MobileCoreModule {
    constructor(deviceService, deviceFileService, fileCacheService, fileOpener, networkService) {
        MobileCoreModule.addStartupServices(deviceService, deviceFileService, fileCacheService, fileOpener, networkService);
    }
    // Startup services have to be added only once in the app life-cycle.
    static addStartupServices(deviceService, deviceFileService, fileCacheService, fileOpener, networkService) {
        if (this.initialized) {
            return;
        }
        deviceService.addStartUpService(networkService);
        if (hasCordova()) {
            deviceService.addStartUpService(deviceFileService);
            deviceService.addStartUpService(fileCacheService);
            deviceService.addStartUpService(fileOpener);
        }
        this.initialized = true;
    }
}
MobileCoreModule.initialized = false;
MobileCoreModule.decorators = [
    { type: NgModule, args: [{
                declarations: [],
                imports: [],
                providers: [
                // add providers to mobile-runtime module.
                ],
                bootstrap: []
            },] }
];
/** @nocollapse */
MobileCoreModule.ctorParameters = () => [
    { type: DeviceService },
    { type: DeviceFileService },
    { type: DeviceFileCacheService },
    { type: DeviceFileOpenerService },
    { type: NetworkService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvcmUvIiwic291cmNlcyI6WyJjb3JlLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXpDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdEMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDaEYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDbkUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQVU1RCxNQUFNLE9BQU8sZ0JBQWdCO0lBb0J6QixZQUNJLGFBQTRCLEVBQzVCLGlCQUFvQyxFQUNwQyxnQkFBd0MsRUFDeEMsVUFBbUMsRUFDbkMsY0FBOEI7UUFFOUIsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLGlCQUFpQixFQUFHLGdCQUFnQixFQUFFLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUN6SCxDQUFDO0lBMUJELHFFQUFxRTtJQUNyRSxNQUFNLENBQUMsa0JBQWtCLENBQUMsYUFBNEIsRUFDcEMsaUJBQW9DLEVBQ3BDLGdCQUF3QyxFQUN4QyxVQUFtQyxFQUNuQyxjQUE4QjtRQUM1QyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsT0FBTztTQUNWO1FBQ0QsYUFBYSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2hELElBQUksVUFBVSxFQUFFLEVBQUU7WUFDZCxhQUFhLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNuRCxhQUFhLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNsRCxhQUFhLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDL0M7UUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztJQUM1QixDQUFDOztBQWpCTSw0QkFBVyxHQUFHLEtBQUssQ0FBQzs7WUFUOUIsUUFBUSxTQUFDO2dCQUNOLFlBQVksRUFBRSxFQUFFO2dCQUNoQixPQUFPLEVBQUUsRUFBRTtnQkFDWCxTQUFTLEVBQUU7Z0JBQ1AsMENBQTBDO2lCQUM3QztnQkFDRCxTQUFTLEVBQUUsRUFBRTthQUNoQjs7OztZQVZRLGFBQWE7WUFEYixpQkFBaUI7WUFGakIsc0JBQXNCO1lBQ3RCLHVCQUF1QjtZQUd2QixjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgaGFzQ29yZG92YSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgRGV2aWNlRmlsZUNhY2hlU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvZGV2aWNlLWZpbGUtY2FjaGUuc2VydmljZSc7XG5pbXBvcnQgeyBEZXZpY2VGaWxlT3BlbmVyU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvZGV2aWNlLWZpbGUtb3BlbmVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgRGV2aWNlRmlsZVNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL2RldmljZS1maWxlLnNlcnZpY2UnO1xuaW1wb3J0IHsgRGV2aWNlU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvZGV2aWNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgTmV0d29ya1NlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL25ldHdvcmsuc2VydmljZSc7XG5cbkBOZ01vZHVsZSh7XG4gICAgZGVjbGFyYXRpb25zOiBbXSxcbiAgICBpbXBvcnRzOiBbXSxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgLy8gYWRkIHByb3ZpZGVycyB0byBtb2JpbGUtcnVudGltZSBtb2R1bGUuXG4gICAgXSxcbiAgICBib290c3RyYXA6IFtdXG59KVxuZXhwb3J0IGNsYXNzIE1vYmlsZUNvcmVNb2R1bGUge1xuICAgIHN0YXRpYyBpbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIC8vIFN0YXJ0dXAgc2VydmljZXMgaGF2ZSB0byBiZSBhZGRlZCBvbmx5IG9uY2UgaW4gdGhlIGFwcCBsaWZlLWN5Y2xlLlxuICAgIHN0YXRpYyBhZGRTdGFydHVwU2VydmljZXMoZGV2aWNlU2VydmljZTogRGV2aWNlU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VGaWxlU2VydmljZTogRGV2aWNlRmlsZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgZmlsZUNhY2hlU2VydmljZTogRGV2aWNlRmlsZUNhY2hlU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICBmaWxlT3BlbmVyOiBEZXZpY2VGaWxlT3BlbmVyU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICBuZXR3b3JrU2VydmljZTogTmV0d29ya1NlcnZpY2UpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkZXZpY2VTZXJ2aWNlLmFkZFN0YXJ0VXBTZXJ2aWNlKG5ldHdvcmtTZXJ2aWNlKTtcbiAgICAgICAgaWYgKGhhc0NvcmRvdmEoKSkge1xuICAgICAgICAgICAgZGV2aWNlU2VydmljZS5hZGRTdGFydFVwU2VydmljZShkZXZpY2VGaWxlU2VydmljZSk7XG4gICAgICAgICAgICBkZXZpY2VTZXJ2aWNlLmFkZFN0YXJ0VXBTZXJ2aWNlKGZpbGVDYWNoZVNlcnZpY2UpO1xuICAgICAgICAgICAgZGV2aWNlU2VydmljZS5hZGRTdGFydFVwU2VydmljZShmaWxlT3BlbmVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZGV2aWNlU2VydmljZTogRGV2aWNlU2VydmljZSxcbiAgICAgICAgZGV2aWNlRmlsZVNlcnZpY2U6IERldmljZUZpbGVTZXJ2aWNlLFxuICAgICAgICBmaWxlQ2FjaGVTZXJ2aWNlOiBEZXZpY2VGaWxlQ2FjaGVTZXJ2aWNlLFxuICAgICAgICBmaWxlT3BlbmVyOiBEZXZpY2VGaWxlT3BlbmVyU2VydmljZSxcbiAgICAgICAgbmV0d29ya1NlcnZpY2U6IE5ldHdvcmtTZXJ2aWNlXG4gICAgKSB7XG4gICAgICAgIE1vYmlsZUNvcmVNb2R1bGUuYWRkU3RhcnR1cFNlcnZpY2VzKGRldmljZVNlcnZpY2UsIGRldmljZUZpbGVTZXJ2aWNlLCAgZmlsZUNhY2hlU2VydmljZSwgZmlsZU9wZW5lciwgbmV0d29ya1NlcnZpY2UpO1xuICAgIH1cbn1cbiJdfQ==