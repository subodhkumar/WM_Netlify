import { NgModule } from '@angular/core';
import { hasCordova } from '@wm/core';
import { DeviceFileCacheService } from './services/device-file-cache.service';
import { DeviceFileOpenerService } from './services/device-file-opener.service';
import { DeviceFileService } from './services/device-file.service';
import { DeviceService } from './services/device.service';
import { NetworkService } from './services/network.service';
var MobileCoreModule = /** @class */ (function () {
    function MobileCoreModule(deviceService, deviceFileService, fileCacheService, fileOpener, networkService) {
        MobileCoreModule.addStartupServices(deviceService, deviceFileService, fileCacheService, fileOpener, networkService);
    }
    // Startup services have to be added only once in the app life-cycle.
    MobileCoreModule.addStartupServices = function (deviceService, deviceFileService, fileCacheService, fileOpener, networkService) {
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
    };
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
    MobileCoreModule.ctorParameters = function () { return [
        { type: DeviceService },
        { type: DeviceFileService },
        { type: DeviceFileCacheService },
        { type: DeviceFileOpenerService },
        { type: NetworkService }
    ]; };
    return MobileCoreModule;
}());
export { MobileCoreModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvcmUvIiwic291cmNlcyI6WyJjb3JlLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXpDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdEMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDaEYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDbkUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUU1RDtJQTRCSSwwQkFDSSxhQUE0QixFQUM1QixpQkFBb0MsRUFDcEMsZ0JBQXdDLEVBQ3hDLFVBQW1DLEVBQ25DLGNBQThCO1FBRTlCLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxpQkFBaUIsRUFBRyxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDekgsQ0FBQztJQTFCRCxxRUFBcUU7SUFDOUQsbUNBQWtCLEdBQXpCLFVBQTBCLGFBQTRCLEVBQ3BDLGlCQUFvQyxFQUNwQyxnQkFBd0MsRUFDeEMsVUFBbUMsRUFDbkMsY0FBOEI7UUFDNUMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLE9BQU87U0FDVjtRQUNELGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNoRCxJQUFJLFVBQVUsRUFBRSxFQUFFO1lBQ2QsYUFBYSxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDbkQsYUFBYSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDbEQsYUFBYSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQy9DO1FBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDNUIsQ0FBQztJQWpCTSw0QkFBVyxHQUFHLEtBQUssQ0FBQzs7Z0JBVDlCLFFBQVEsU0FBQztvQkFDTixZQUFZLEVBQUUsRUFBRTtvQkFDaEIsT0FBTyxFQUFFLEVBQUU7b0JBQ1gsU0FBUyxFQUFFO29CQUNQLDBDQUEwQztxQkFDN0M7b0JBQ0QsU0FBUyxFQUFFLEVBQUU7aUJBQ2hCOzs7O2dCQVZRLGFBQWE7Z0JBRGIsaUJBQWlCO2dCQUZqQixzQkFBc0I7Z0JBQ3RCLHVCQUF1QjtnQkFHdkIsY0FBYzs7SUF1Q3ZCLHVCQUFDO0NBQUEsQUFyQ0QsSUFxQ0M7U0E3QlksZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgaGFzQ29yZG92YSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgRGV2aWNlRmlsZUNhY2hlU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvZGV2aWNlLWZpbGUtY2FjaGUuc2VydmljZSc7XG5pbXBvcnQgeyBEZXZpY2VGaWxlT3BlbmVyU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvZGV2aWNlLWZpbGUtb3BlbmVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgRGV2aWNlRmlsZVNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL2RldmljZS1maWxlLnNlcnZpY2UnO1xuaW1wb3J0IHsgRGV2aWNlU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvZGV2aWNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgTmV0d29ya1NlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL25ldHdvcmsuc2VydmljZSc7XG5cbkBOZ01vZHVsZSh7XG4gICAgZGVjbGFyYXRpb25zOiBbXSxcbiAgICBpbXBvcnRzOiBbXSxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgLy8gYWRkIHByb3ZpZGVycyB0byBtb2JpbGUtcnVudGltZSBtb2R1bGUuXG4gICAgXSxcbiAgICBib290c3RyYXA6IFtdXG59KVxuZXhwb3J0IGNsYXNzIE1vYmlsZUNvcmVNb2R1bGUge1xuICAgIHN0YXRpYyBpbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIC8vIFN0YXJ0dXAgc2VydmljZXMgaGF2ZSB0byBiZSBhZGRlZCBvbmx5IG9uY2UgaW4gdGhlIGFwcCBsaWZlLWN5Y2xlLlxuICAgIHN0YXRpYyBhZGRTdGFydHVwU2VydmljZXMoZGV2aWNlU2VydmljZTogRGV2aWNlU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VGaWxlU2VydmljZTogRGV2aWNlRmlsZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgZmlsZUNhY2hlU2VydmljZTogRGV2aWNlRmlsZUNhY2hlU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICBmaWxlT3BlbmVyOiBEZXZpY2VGaWxlT3BlbmVyU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICBuZXR3b3JrU2VydmljZTogTmV0d29ya1NlcnZpY2UpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkZXZpY2VTZXJ2aWNlLmFkZFN0YXJ0VXBTZXJ2aWNlKG5ldHdvcmtTZXJ2aWNlKTtcbiAgICAgICAgaWYgKGhhc0NvcmRvdmEoKSkge1xuICAgICAgICAgICAgZGV2aWNlU2VydmljZS5hZGRTdGFydFVwU2VydmljZShkZXZpY2VGaWxlU2VydmljZSk7XG4gICAgICAgICAgICBkZXZpY2VTZXJ2aWNlLmFkZFN0YXJ0VXBTZXJ2aWNlKGZpbGVDYWNoZVNlcnZpY2UpO1xuICAgICAgICAgICAgZGV2aWNlU2VydmljZS5hZGRTdGFydFVwU2VydmljZShmaWxlT3BlbmVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZGV2aWNlU2VydmljZTogRGV2aWNlU2VydmljZSxcbiAgICAgICAgZGV2aWNlRmlsZVNlcnZpY2U6IERldmljZUZpbGVTZXJ2aWNlLFxuICAgICAgICBmaWxlQ2FjaGVTZXJ2aWNlOiBEZXZpY2VGaWxlQ2FjaGVTZXJ2aWNlLFxuICAgICAgICBmaWxlT3BlbmVyOiBEZXZpY2VGaWxlT3BlbmVyU2VydmljZSxcbiAgICAgICAgbmV0d29ya1NlcnZpY2U6IE5ldHdvcmtTZXJ2aWNlXG4gICAgKSB7XG4gICAgICAgIE1vYmlsZUNvcmVNb2R1bGUuYWRkU3RhcnR1cFNlcnZpY2VzKGRldmljZVNlcnZpY2UsIGRldmljZUZpbGVTZXJ2aWNlLCAgZmlsZUNhY2hlU2VydmljZSwgZmlsZU9wZW5lciwgbmV0d29ya1NlcnZpY2UpO1xuICAgIH1cbn1cbiJdfQ==