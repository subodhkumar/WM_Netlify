import { Directive } from '@angular/core';
import { FileUploadComponent } from '@wm/components';
import { hasCordova } from '@wm/core';
import { FileSelectorService } from '../../services/file-selector.service';
var FileUploadDirective = /** @class */ (function () {
    function FileUploadDirective(fileSelectorService, fileUploadComponent) {
        var _this = this;
        this.fileSelectorService = fileSelectorService;
        this.fileUploadComponent = fileUploadComponent;
        fileUploadComponent._isMobileType = true;
        fileUploadComponent._isCordova = hasCordova();
        fileUploadComponent['openFileSelector'] = function () {
            _this.openFileSelector().then(function (contents) {
                _this.fileUploadComponent.onFileSelect({}, contents);
            });
        };
    }
    FileUploadDirective.prototype.openFileSelector = function () {
        switch (this.fileUploadComponent['contenttype']) {
            case 'image':
                return this.fileSelectorService.selectImages();
            case 'video':
                return this.fileSelectorService.selectVideos();
            case 'audio':
                return this.fileSelectorService.selectAudio();
            default:
                return this.fileSelectorService.selectFiles();
        }
    };
    FileUploadDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmFileUpload]'
                },] }
    ];
    /** @nocollapse */
    FileUploadDirective.ctorParameters = function () { return [
        { type: FileSelectorService },
        { type: FileUploadComponent }
    ]; };
    return FileUploadDirective;
}());
export { FileUploadDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS11cGxvYWQuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9maWxlLXVwbG9hZC9maWxlLXVwbG9hZC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUxQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXRDLE9BQU8sRUFBZSxtQkFBbUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBRXhGO0lBS0ksNkJBQ1ksbUJBQXdDLEVBQ3hDLG1CQUF3QztRQUZwRCxpQkFXQztRQVZXLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFDeEMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUVoRCxtQkFBbUIsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQ3pDLG1CQUFtQixDQUFDLFVBQVUsR0FBRyxVQUFVLEVBQUUsQ0FBQztRQUM5QyxtQkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHO1lBQ3RDLEtBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLFFBQXVCO2dCQUNqRCxLQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQztJQUNOLENBQUM7SUFFTSw4Q0FBZ0IsR0FBdkI7UUFDSSxRQUFRLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUM3QyxLQUFLLE9BQU87Z0JBQ1IsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbkQsS0FBSyxPQUFPO2dCQUNSLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ25ELEtBQUssT0FBTztnQkFDUixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNsRDtnQkFDSSxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUNyRDtJQUNMLENBQUM7O2dCQTdCSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGdCQUFnQjtpQkFDN0I7Ozs7Z0JBSnFCLG1CQUFtQjtnQkFIaEMsbUJBQW1COztJQW1DNUIsMEJBQUM7Q0FBQSxBQTlCRCxJQThCQztTQTNCWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgRmlsZVVwbG9hZENvbXBvbmVudCB9IGZyb20gJ0B3bS9jb21wb25lbnRzJztcbmltcG9ydCB7IGhhc0NvcmRvdmEgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEZpbGVDb250ZW50LCBGaWxlU2VsZWN0b3JTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvZmlsZS1zZWxlY3Rvci5zZXJ2aWNlJztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21GaWxlVXBsb2FkXSdcbn0pXG5leHBvcnQgY2xhc3MgRmlsZVVwbG9hZERpcmVjdGl2ZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBmaWxlU2VsZWN0b3JTZXJ2aWNlOiBGaWxlU2VsZWN0b3JTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGZpbGVVcGxvYWRDb21wb25lbnQ6IEZpbGVVcGxvYWRDb21wb25lbnRcbiAgICApIHtcbiAgICAgICAgZmlsZVVwbG9hZENvbXBvbmVudC5faXNNb2JpbGVUeXBlID0gdHJ1ZTtcbiAgICAgICAgZmlsZVVwbG9hZENvbXBvbmVudC5faXNDb3Jkb3ZhID0gaGFzQ29yZG92YSgpO1xuICAgICAgICBmaWxlVXBsb2FkQ29tcG9uZW50WydvcGVuRmlsZVNlbGVjdG9yJ10gPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9wZW5GaWxlU2VsZWN0b3IoKS50aGVuKChjb250ZW50czogRmlsZUNvbnRlbnRbXSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZmlsZVVwbG9hZENvbXBvbmVudC5vbkZpbGVTZWxlY3Qoe30sIGNvbnRlbnRzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBvcGVuRmlsZVNlbGVjdG9yKCk6IFByb21pc2U8RmlsZUNvbnRlbnRbXT4ge1xuICAgICAgICBzd2l0Y2ggKHRoaXMuZmlsZVVwbG9hZENvbXBvbmVudFsnY29udGVudHR5cGUnXSkge1xuICAgICAgICAgICAgY2FzZSAnaW1hZ2UnOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGVTZWxlY3RvclNlcnZpY2Uuc2VsZWN0SW1hZ2VzKCk7XG4gICAgICAgICAgICBjYXNlICd2aWRlbyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsZVNlbGVjdG9yU2VydmljZS5zZWxlY3RWaWRlb3MoKTtcbiAgICAgICAgICAgIGNhc2UgJ2F1ZGlvJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlU2VsZWN0b3JTZXJ2aWNlLnNlbGVjdEF1ZGlvKCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGVTZWxlY3RvclNlcnZpY2Uuc2VsZWN0RmlsZXMoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==