import { Directive } from '@angular/core';
import { FileUploadComponent } from '@wm/components';
import { hasCordova } from '@wm/core';
import { FileSelectorService } from '../../services/file-selector.service';
export class FileUploadDirective {
    constructor(fileSelectorService, fileUploadComponent) {
        this.fileSelectorService = fileSelectorService;
        this.fileUploadComponent = fileUploadComponent;
        fileUploadComponent._isMobileType = true;
        fileUploadComponent._isCordova = hasCordova();
        fileUploadComponent['openFileSelector'] = () => {
            this.openFileSelector().then((contents) => {
                this.fileUploadComponent.onFileSelect({}, contents);
            });
        };
    }
    openFileSelector() {
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
    }
}
FileUploadDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmFileUpload]'
            },] }
];
/** @nocollapse */
FileUploadDirective.ctorParameters = () => [
    { type: FileSelectorService },
    { type: FileUploadComponent }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS11cGxvYWQuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9maWxlLXVwbG9hZC9maWxlLXVwbG9hZC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUxQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXRDLE9BQU8sRUFBZSxtQkFBbUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBS3hGLE1BQU0sT0FBTyxtQkFBbUI7SUFFNUIsWUFDWSxtQkFBd0MsRUFDeEMsbUJBQXdDO1FBRHhDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFDeEMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUVoRCxtQkFBbUIsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQ3pDLG1CQUFtQixDQUFDLFVBQVUsR0FBRyxVQUFVLEVBQUUsQ0FBQztRQUM5QyxtQkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEdBQUcsRUFBRTtZQUMzQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUF1QixFQUFFLEVBQUU7Z0JBQ3JELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3hELENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUVNLGdCQUFnQjtRQUNuQixRQUFRLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUM3QyxLQUFLLE9BQU87Z0JBQ1IsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbkQsS0FBSyxPQUFPO2dCQUNSLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ25ELEtBQUssT0FBTztnQkFDUixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNsRDtnQkFDSSxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUNyRDtJQUNMLENBQUM7OztZQTdCSixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLGdCQUFnQjthQUM3Qjs7OztZQUpxQixtQkFBbUI7WUFIaEMsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEZpbGVVcGxvYWRDb21wb25lbnQgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5pbXBvcnQgeyBoYXNDb3Jkb3ZhIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBGaWxlQ29udGVudCwgRmlsZVNlbGVjdG9yU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2ZpbGUtc2VsZWN0b3Iuc2VydmljZSc7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtRmlsZVVwbG9hZF0nXG59KVxuZXhwb3J0IGNsYXNzIEZpbGVVcGxvYWREaXJlY3RpdmUge1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgZmlsZVNlbGVjdG9yU2VydmljZTogRmlsZVNlbGVjdG9yU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBmaWxlVXBsb2FkQ29tcG9uZW50OiBGaWxlVXBsb2FkQ29tcG9uZW50XG4gICAgKSB7XG4gICAgICAgIGZpbGVVcGxvYWRDb21wb25lbnQuX2lzTW9iaWxlVHlwZSA9IHRydWU7XG4gICAgICAgIGZpbGVVcGxvYWRDb21wb25lbnQuX2lzQ29yZG92YSA9IGhhc0NvcmRvdmEoKTtcbiAgICAgICAgZmlsZVVwbG9hZENvbXBvbmVudFsnb3BlbkZpbGVTZWxlY3RvciddID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vcGVuRmlsZVNlbGVjdG9yKCkudGhlbigoY29udGVudHM6IEZpbGVDb250ZW50W10pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGVVcGxvYWRDb21wb25lbnQub25GaWxlU2VsZWN0KHt9LCBjb250ZW50cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3BlbkZpbGVTZWxlY3RvcigpOiBQcm9taXNlPEZpbGVDb250ZW50W10+IHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmZpbGVVcGxvYWRDb21wb25lbnRbJ2NvbnRlbnR0eXBlJ10pIHtcbiAgICAgICAgICAgIGNhc2UgJ2ltYWdlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlU2VsZWN0b3JTZXJ2aWNlLnNlbGVjdEltYWdlcygpO1xuICAgICAgICAgICAgY2FzZSAndmlkZW8nOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGVTZWxlY3RvclNlcnZpY2Uuc2VsZWN0VmlkZW9zKCk7XG4gICAgICAgICAgICBjYXNlICdhdWRpbyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsZVNlbGVjdG9yU2VydmljZS5zZWxlY3RBdWRpbygpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlU2VsZWN0b3JTZXJ2aWNlLnNlbGVjdEZpbGVzKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=