import { Attribute, Component, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { App, DataSource, isAudioFile, isImageFile, isVideoFile } from '@wm/core';
import { registerProps } from './file-upload.props';
import { StylableComponent } from '../base/stylable.component';
import { styler } from '../../framework/styler';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'app-fileupload';
const WIDGET_CONFIG = {
    widgetType: 'wm-fileupload',
    hostClass: DEFAULT_CLS
};
export class FileUploadComponent extends StylableComponent {
    constructor(inj, app, onSelectEvt) {
        super(inj, WIDGET_CONFIG);
        this.app = app;
        this.onSelectEvt = onSelectEvt;
        this.selectedFiles = [];
        this.fileTransfers = {};
        this.caption = 'Upload';
        this.formName = '';
        this.DEFAULT_CAPTIONS = {
            MULTIPLE_SELECT: 'Drop your files here.',
            SELECT: 'Select'
        };
        this.DEVICE_CONTENTTYPES = {
            IMAGE: 'image',
            VIDEO: 'video',
            AUDIO: 'audio',
            FILES: 'files'
        };
        this.FILESIZE_MB = 1048576;
        // parentPrefabScope = element.closest('.app-prefab').isolateScope(),
        this.CONSTANT_FILE_SERVICE = 'FileService';
        this.uploadData = {
            file: undefined,
            uploadPath: undefined
        };
        this.chooseFilter = '';
        this.fileUploadMessage = 'You can also browse for files';
        this.uploadedFiles = {
            fileName: '',
            path: '',
            length: '',
            status: ''
        };
        this.uploadUrl = 'services';
        // styler(this.nativeElement, this);
    }
    /*_hasOnSuccessEvt = WM.isDefined(attrs.onSuccess);
     _hasOnErrorEvt = WM.isDefined(attrs.onError);*/
    // Checking if the selected file is valid for the choosen filter type
    isValidFile(filename, contenttype, extensionName, isMobileType) {
        let isValid, contentTypes;
        if (!contenttype) {
            return true;
        }
        contentTypes = _.toLower(contenttype).split(',');
        if (_.includes(contentTypes, 'image/*') || (_.includes(contentTypes, 'image') && isMobileType)) {
            isValid = isImageFile(filename);
            // If one of the content type chosen is image and user uploads image it is valid file
            if (isValid) {
                return isValid;
            }
        }
        if (_.includes(contentTypes, 'audio/*') || (_.includes(contentTypes, 'audio') && isMobileType)) {
            isValid = isAudioFile(filename);
            // If one of the content type chosen is audio/* and user uploads audio it is valid file
            if (isValid) {
                return isValid;
            }
        }
        if (_.includes(contentTypes, 'video/*') || (_.includes(contentTypes, 'video') && isMobileType)) {
            isValid = isVideoFile(filename);
            // If one of the content type chosen is video/* and user uploads video it is valid file
            if (isValid) {
                return isValid;
            }
        }
        /*content type and the uploaded file extension should be same*/
        if (_.includes(contentTypes, '.' + _.toLower(extensionName))) {
            isValid = true;
        }
        return isValid;
    }
    /* this return the array of files which are having the file size not more than maxfilesize and filters based on contenttype */
    getValidFiles($files) {
        const validFiles = [];
        const errorFiles = [];
        const MAXFILEUPLOAD_SIZE = parseFloat(this.maxfilesize) * this.FILESIZE_MB || this.FILESIZE_MB;
        const MAX_FILE_UPLOAD_FORMATTED_SIZE = (this.maxfilesize || '1') + 'MB';
        // if contenttype is files for mobile projects.
        if (this.chooseFilter === this.DEVICE_CONTENTTYPES.FILES) {
            this.chooseFilter = '';
        }
        _.forEach($files, (file) => {
            /* check for the file content type before uploading */
            if (!this.isValidFile(file.name, this.chooseFilter, this.getFileExtension(file.name), this._isMobileType)) {
                const msg = `${this.appLocale.LABEL_FILE_EXTENTION_VALIDATION_MESSAGE} ${this.chooseFilter}`;
                this.app.notifyApp(msg, 'Error');
                const error = {
                    key: 'INVALID_FILE_EXTENSION',
                    message: msg
                };
                file.error = error;
                errorFiles.push(file);
                return;
            }
            if (file.size > MAXFILEUPLOAD_SIZE) {
                const msg = `${this.appLocale.LABEL_FILE_EXCEED_VALIDATION_MESSAGE} ${MAX_FILE_UPLOAD_FORMATTED_SIZE}`;
                this.app.notifyApp(msg, 'Error');
                const error = {
                    key: 'INVALID_FILE_SIZE',
                    message: msg
                };
                file.error = error;
                errorFiles.push(file);
                return;
            }
            validFiles.push(file);
        });
        return {
            validFiles: validFiles,
            errorFiles: errorFiles
        };
    }
    /*Overwrite the caption only if they are default*/
    getCaption(caption, isMultiple, isMobileType) {
        if (_.includes(this.DEFAULT_CAPTIONS, caption)) {
            return isMultiple && !isMobileType ? this.DEFAULT_CAPTIONS.MULTIPLE_SELECT : this.DEFAULT_CAPTIONS.SELECT;
        }
        return caption;
    }
    /* change server path based on user option */
    changeServerUploadPath(path) {
        this.selectedUploadTypePath = path;
    }
    /* this function returns the fileextension */
    getFileExtension(fileName) {
        if (fileName && _.includes(fileName, '.')) {
            return fileName.substring(fileName.lastIndexOf('.') + 1);
        }
        return 'file';
    }
    /**
     * Calls select Event
     * @param $event
     * @param $files
     */
    onSelectEventCall($event, $files) {
        this.selectedFiles = $files;
        setTimeout(() => {
            this.invokeEventCallback('select', {
                $event: $.extend($event.$files || {}, $files),
                selectedFiles: $files
            });
        });
    }
    onFileElemClick() {
        const fileInputElem = $('.file-input')[0];
        fileInputElem.value = null;
    }
    /*this function to append upload status dom elements to widget */
    onFileSelect($event, $files) {
        let beforeSelectVal;
        const files = this.getValidFiles($files);
        $files = files.validFiles;
        // Trigger error callback event if any invalid file found.
        if (!_.isEmpty(files.errorFiles)) {
            this.invokeEventCallback('error', {
                $event,
                files: files.errorFiles
            });
        }
        // Make call if there are valid files else no call is made
        if ($files.length) {
            this.progressObservable = new Subject();
            // EVENT: ON_BEFORE_SELECT
            beforeSelectVal = this.invokeEventCallback('beforeselect', {
                $event: $.extend($event.$files || {}, $files),
                files: $files
            });
            if (this.datasource) {
                this.datasource._progressObservable = this.progressObservable;
                this.datasource._progressObservable.asObservable().subscribe((progressObj) => {
                    _.forEach(this.selectedFiles, (file) => {
                        if (file.name === progressObj.fileName) {
                            file.progress = progressObj.progress;
                            if (file.progress === 100) {
                                file.status = 'success';
                            }
                            else {
                                file.status = progressObj.status;
                            }
                        }
                    });
                });
            }
            else {
                this.selectedFiles = $files;
            }
            if (beforeSelectVal !== false) {
                // EVENT: ON_SELECT
                this.onSelectEventCall($event, $files);
            }
        }
    }
    /**
     * Aborts a file upload request
     * @param $file, the file for which the request is to be aborted
     */
    abortFileUpload($file) {
        this.datasource.execute(DataSource.Operation.CANCEL, $file);
    }
    /* Define the property change handler. This function will be triggered when there is a change in the widget property */
    onPropertyChange(key, nv, ov) {
        /*Monitoring changes for styles or properties and accordingly handling respective changes.*/
        switch (key) {
            case 'uploadpath':
                // TODO Srinivas: why do we need uploadpath
                this.changeServerUploadPath(nv);
                break;
            case 'contenttype':
                this.chooseFilter = nv.split(' ').join(',');
                break;
            case 'multiple':
                this.formName = this.name + (this.multiple ? '-multiple-fileupload' : '-single-fileupload');
                this.caption = this.getCaption(this.caption, this.multiple, this._isMobileType);
                break;
            case 'fileuploadmessage':
                this.fileUploadMessage = nv;
        }
        super.onPropertyChange(key, nv, ov);
    }
    ngOnInit() {
        super.ngOnInit();
    }
    ngAfterViewInit() {
        styler(this.nativeElement.querySelector('.app-button, .drop-box'), this);
    }
}
FileUploadComponent.initializeProps = registerProps();
FileUploadComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmFileUpload]',
                template: "<div class=\"app-fileupload\" init-widget>\n    <!-- drag and drop files UI in web -->\n    <div class=\"app-multi-file-upload\" *ngIf=\"!_isMobileType && multiple\">\n        <div class=\"drop-box\" drag-files=\"onFileSelect($event,$event.target.files)\">\n            <i class=\"{{iconclass}}\"></i>\n            <div class=\"message\">\n                <label [innerHtml]=\"caption\" class=\"caption\"></label>\n                <form class=\"form-horizontal\" name=\"{{formName}}\">\n                    <input class=\"file-input\" aria-label=\"Select File\" type=\"file\" name=\"files\" *ngIf=\"multiple\" [disabled]=\"disabled\" [accept]=\"chooseFilter\" (click)=\"onFileElemClick()\" (change)=\"onFileSelect($event, $event.target.files)\" multiple >\n                    <a href=\"javascript:void(0);\" class=\"app-anchor\">{{fileUploadMessage}}</a>\n                </form>\n            </div>\n        </div>\n    </div>\n    <!-- single file upload in web and single , multiple file upload UI in mobile runmode -->\n    <div class=\"app-single-file-upload\" *ngIf=\"!_isCordova && (!multiple || _isMobileType)\">\n        <div class=\"app-button-wrapper\">\n            <form class=\"form-horizontal\" name=\"{{formName}}\">\n                <!-- support for file upload in Mobileapp in its runmode (Web) -->\n                <input class=\"file-input\" aria-label=\"Select files\" type=\"file\" name=\"files\" *ngIf=\"multiple\" [disabled]=\"disabled\" [accept]=\"chooseFilter\" (click)=\"onFileElemClick()\" (change)=\"onFileSelect($event, $event.target.files)\" multiple>\n                <input class=\"file-input\" aria-label=\"Select Files\" type=\"file\" name=\"files\" *ngIf=\"!multiple\" [disabled]=\"disabled\" [accept]=\"chooseFilter\" (click)=\"onFileElemClick()\" (change)=\"onFileSelect($event, $event.target.files)\" >\n                <button focus-target class=\"app-button btn btn-default\">\n                    <i class=\"{{iconclass}}\" aria-hidden=\"true\"></i>\n                    <span class=\"caption\">{{caption}}</span>\n                </button>\n            </form>\n        </div>\n        <div class=\"app-files-upload-status single\"></div>\n    </div>\n    <!-- support for file upload in Mobile Application (device) -->\n    <button *ngIf=\"_isCordova\" focus-target class=\"app-button btn btn-default\" (click)=\"openFileSelector()\" [disabled]=\"disabled\">\n        <i class=\"{{iconclass}}\"></i>\n        <span class=\"caption\">{{caption}}</span>\n    </button>\n    <!-- list of selectedfiles UI -->\n    <ul class=\"list-group file-upload\" [ngStyle]=\"{height: filelistheight, overflow: overflow}\" *ngIf=\"selectedFiles.length > 0\" >\n        <div *ngFor=\"let ft of selectedFiles\">\n            <li class=\"list-group-item file-upload-status\" *ngIf=\"ft.status !== 'abort'\">\n                <div class=\"media upload-file-list\">\n                    <div class=\"media-left media-middle file-icon {{getFileExtension(ft.name) | fileIconClass}}\" title=\"{{getFileExtension(ft.name)}}\"></div>\n                    <div class=\"media-body media-middle file-details\">\n                        <p class=\"uploaddetails\">\n                            <label class=\"upload-title\">{{ft.name}}</label><br/>\n                            <span class=\"filesize\" *ngIf=\"ft.fileLength  !== 0\">{{ft.size | filesize:0}}</span>\n                        </p>\n                        <div class=\"progress\" *ngIf=\"ft.status === 'onProgress'\">\n                            <div class=\"progress-bar progress-bar-striped progress-bar-info\" [ngStyle]=\"{width: (ft.progress +'%')}\"></div>\n                        </div>\n                    </div>\n                    <div class=\"media-right media-middle\" *ngIf=\"ft.status === 'onProgress' || ft.status === 'queued'\">\n                        <a class=\"btn btn-transparent file-upload-stop\" type=\"button\" (click)=\"abortFileUpload(ft)\">\n                            <i class=\"wi wi-close\"></i>\n                        </a>\n                    </div>\n                    <div class=\"media-right media-middle\"  *ngIf=\"ft.status === 'success'\">\n                        <span class=\"status-icon {{ft.status | stateClass }}\"></span>\n                    </div>\n                </div>\n            </li>\n        </div>\n    </ul>\n</div>\n",
                providers: [
                    provideAsWidgetRef(FileUploadComponent)
                ]
            }] }
];
/** @nocollapse */
FileUploadComponent.ctorParameters = () => [
    { type: Injector },
    { type: App },
    { type: undefined, decorators: [{ type: Attribute, args: ['select.event',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS11cGxvYWQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9maWxlLXVwbG9hZC9maWxlLXVwbG9hZC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUV0RixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRS9CLE9BQU8sRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRWxGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFJakUsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUM7QUFDckMsTUFBTSxhQUFhLEdBQUc7SUFDbEIsVUFBVSxFQUFFLGVBQWU7SUFDM0IsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQVVGLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxpQkFBaUI7SUFtUHRELFlBQVksR0FBYSxFQUFVLEdBQVEsRUFBb0MsV0FBVztRQUN0RixLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBREssUUFBRyxHQUFILEdBQUcsQ0FBSztRQUFvQyxnQkFBVyxHQUFYLFdBQVcsQ0FBQTtRQWpQMUYsa0JBQWEsR0FBUSxFQUFFLENBQUM7UUFJeEIsa0JBQWEsR0FBRyxFQUFFLENBQUM7UUFDbkIsWUFBTyxHQUFHLFFBQVEsQ0FBQztRQUNuQixhQUFRLEdBQUcs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Qzs7WUFUNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxnQkFBZ0I7Z0JBQzFCLHN4SUFBMkM7Z0JBQzNDLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQztpQkFDMUM7YUFDSjs7OztZQXpCNkMsUUFBUTtZQUk3QyxHQUFHOzRDQTBRc0MsU0FBUyxTQUFDLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBBdHRyaWJ1dGUsIENvbXBvbmVudCwgSW5qZWN0b3IsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IEFwcCwgRGF0YVNvdXJjZSwgaXNBdWRpb0ZpbGUsIGlzSW1hZ2VGaWxlLCBpc1ZpZGVvRmlsZSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vZmlsZS11cGxvYWQucHJvcHMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXywgJDtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWZpbGV1cGxvYWQnO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tZmlsZXVwbG9hZCcsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21GaWxlVXBsb2FkXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ZpbGUtdXBsb2FkLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKEZpbGVVcGxvYWRDb21wb25lbnQpXG4gICAgXVxufSlcblxuZXhwb3J0IGNsYXNzIEZpbGVVcGxvYWRDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcbiAgICBzZWxlY3RlZEZpbGVzOiBhbnkgPSBbXTtcbiAgICBwcm9ncmVzc09ic2VydmFibGU7XG4gICAgbmFtZTtcbiAgICBtdWx0aXBsZTtcbiAgICBmaWxlVHJhbnNmZXJzID0ge307XG4gICAgY2FwdGlvbiA9ICdVcGxvYWQnO1xuICAgIGZvcm1OYW1lID0gJyc7XG4gICAgbWF4ZmlsZXNpemU7XG4gICAgc2VsZWN0ZWRVcGxvYWRUeXBlUGF0aDtcbiAgICBERUZBVUxUX0NBUFRJT05TID0ge1xuICAgICAgICBNVUxUSVBMRV9TRUxFQ1Q6ICdEcm9wIHlvdXIgZmlsZXMgaGVyZS4nLFxuICAgICAgICBTRUxFQ1Q6ICdTZWxlY3QnXG4gICAgfTtcbiAgICBERVZJQ0VfQ09OVEVOVFRZUEVTID0ge1xuICAgICAgICBJTUFHRTogJ2ltYWdlJyxcbiAgICAgICAgVklERU86ICd2aWRlbycsXG4gICAgICAgIEFVRElPOiAnYXVkaW8nLFxuICAgICAgICBGSUxFUzogJ2ZpbGVzJ1xuICAgIH07XG4gICAgRklMRVNJWkVfTUIgPSAxMDQ4NTc2O1xuICAgIHdpZGdldFByb3BzO1xuICAgIF9pc01vYmlsZVR5cGU7XG4gICAgX2lzQ29yZG92YTtcbiAgICAvLyBwYXJlbnRQcmVmYWJTY29wZSA9IGVsZW1lbnQuY2xvc2VzdCgnLmFwcC1wcmVmYWInKS5pc29sYXRlU2NvcGUoKSxcbiAgICBDT05TVEFOVF9GSUxFX1NFUlZJQ0UgPSAnRmlsZVNlcnZpY2UnO1xuICAgIHVwbG9hZERhdGEgPSB7XG4gICAgICAgIGZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgdXBsb2FkUGF0aDogdW5kZWZpbmVkXG4gICAgfTtcbiAgICBjaG9vc2VGaWx0ZXIgPSAnJztcbiAgICBkYXRhc291cmNlO1xuICAgIGZpbGVVcGxvYWRNZXNzYWdlID0gJ1lvdSBjYW4gYWxzbyBicm93c2UgZm9yIGZpbGVzJztcbiAgICB1cGxvYWRlZEZpbGVzID0ge1xuICAgICAgICBmaWxlTmFtZTogJycsXG4gICAgICAgIHBhdGg6ICcnLFxuICAgICAgICBsZW5ndGg6ICcnLFxuICAgICAgICBzdGF0dXM6ICcnXG4gICAgfTtcbiAgICAvKl9oYXNPblN1Y2Nlc3NFdnQgPSBXTS5pc0RlZmluZWQoYXR0cnMub25TdWNjZXNzKTtcbiAgICAgX2hhc09uRXJyb3JFdnQgPSBXTS5pc0RlZmluZWQoYXR0cnMub25FcnJvcik7Ki9cblxuICAgIC8vIENoZWNraW5nIGlmIHRoZSBzZWxlY3RlZCBmaWxlIGlzIHZhbGlkIGZvciB0aGUgY2hvb3NlbiBmaWx0ZXIgdHlwZVxuICAgIGlzVmFsaWRGaWxlKGZpbGVuYW1lLCBjb250ZW50dHlwZSwgZXh0ZW5zaW9uTmFtZSwgaXNNb2JpbGVUeXBlKSB7XG4gICAgICAgIGxldCBpc1ZhbGlkLCBjb250ZW50VHlwZXM7XG5cbiAgICAgICAgaWYgKCFjb250ZW50dHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY29udGVudFR5cGVzID0gXy50b0xvd2VyKGNvbnRlbnR0eXBlKS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIGlmIChfLmluY2x1ZGVzKGNvbnRlbnRUeXBlcywgJ2ltYWdlLyonKSB8fCAoXy5pbmNsdWRlcyhjb250ZW50VHlwZXMsICdpbWFnZScpICYmIGlzTW9iaWxlVHlwZSkpIHtcbiAgICAgICAgICAgIGlzVmFsaWQgPSBpc0ltYWdlRmlsZShmaWxlbmFtZSk7XG4gICAgICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGNvbnRlbnQgdHlwZSBjaG9zZW4gaXMgaW1hZ2UgYW5kIHVzZXIgdXBsb2FkcyBpbWFnZSBpdCBpcyB2YWxpZCBmaWxlXG4gICAgICAgICAgICBpZiAoaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChfLmluY2x1ZGVzKGNvbnRlbnRUeXBlcywgJ2F1ZGlvLyonKSB8fCAoXy5pbmNsdWRlcyhjb250ZW50VHlwZXMsICdhdWRpbycpICYmIGlzTW9iaWxlVHlwZSkpIHtcbiAgICAgICAgICAgIGlzVmFsaWQgPSBpc0F1ZGlvRmlsZShmaWxlbmFtZSk7XG4gICAgICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGNvbnRlbnQgdHlwZSBjaG9zZW4gaXMgYXVkaW8vKiBhbmQgdXNlciB1cGxvYWRzIGF1ZGlvIGl0IGlzIHZhbGlkIGZpbGVcbiAgICAgICAgICAgIGlmIChpc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8uaW5jbHVkZXMoY29udGVudFR5cGVzLCAndmlkZW8vKicpIHx8IChfLmluY2x1ZGVzKGNvbnRlbnRUeXBlcywgJ3ZpZGVvJykgJiYgaXNNb2JpbGVUeXBlKSkge1xuICAgICAgICAgICAgaXNWYWxpZCA9IGlzVmlkZW9GaWxlKGZpbGVuYW1lKTtcbiAgICAgICAgICAgIC8vIElmIG9uZSBvZiB0aGUgY29udGVudCB0eXBlIGNob3NlbiBpcyB2aWRlby8qIGFuZCB1c2VyIHVwbG9hZHMgdmlkZW8gaXQgaXMgdmFsaWQgZmlsZVxuICAgICAgICAgICAgaWYgKGlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKmNvbnRlbnQgdHlwZSBhbmQgdGhlIHVwbG9hZGVkIGZpbGUgZXh0ZW5zaW9uIHNob3VsZCBiZSBzYW1lKi9cbiAgICAgICAgaWYgKF8uaW5jbHVkZXMoY29udGVudFR5cGVzLCAnLicgKyBfLnRvTG93ZXIoZXh0ZW5zaW9uTmFtZSkpKSB7XG4gICAgICAgICAgICBpc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICAvKiB0aGlzIHJldHVybiB0aGUgYXJyYXkgb2YgZmlsZXMgd2hpY2ggYXJlIGhhdmluZyB0aGUgZmlsZSBzaXplIG5vdCBtb3JlIHRoYW4gbWF4ZmlsZXNpemUgYW5kIGZpbHRlcnMgYmFzZWQgb24gY29udGVudHR5cGUgKi9cbiAgICBnZXRWYWxpZEZpbGVzKCRmaWxlcykge1xuICAgICAgICBjb25zdCB2YWxpZEZpbGVzID0gW107XG4gICAgICAgIGNvbnN0IGVycm9yRmlsZXMgPSBbXTtcbiAgICAgICAgY29uc3QgTUFYRklMRVVQTE9BRF9TSVpFID0gcGFyc2VGbG9hdCh0aGlzLm1heGZpbGVzaXplKSAqIHRoaXMuRklMRVNJWkVfTUIgfHwgdGhpcy5GSUxFU0laRV9NQjtcbiAgICAgICAgY29uc3QgTUFYX0ZJTEVfVVBMT0FEX0ZPUk1BVFRFRF9TSVpFID0gKHRoaXMubWF4ZmlsZXNpemUgfHwgJzEnKSArICdNQic7XG5cbiAgICAgICAgLy8gaWYgY29udGVudHR5cGUgaXMgZmlsZXMgZm9yIG1vYmlsZSBwcm9qZWN0cy5cbiAgICAgICAgaWYgKHRoaXMuY2hvb3NlRmlsdGVyID09PSB0aGlzLkRFVklDRV9DT05URU5UVFlQRVMuRklMRVMpIHtcbiAgICAgICAgICAgIHRoaXMuY2hvb3NlRmlsdGVyID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBfLmZvckVhY2goJGZpbGVzLCAoZmlsZSkgPT4ge1xuICAgICAgICAgICAgLyogY2hlY2sgZm9yIHRoZSBmaWxlIGNvbnRlbnQgdHlwZSBiZWZvcmUgdXBsb2FkaW5nICovXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNWYWxpZEZpbGUoZmlsZS5uYW1lLCB0aGlzLmNob29zZUZpbHRlciwgdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKGZpbGUubmFtZSksIHRoaXMuX2lzTW9iaWxlVHlwZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBgJHt0aGlzLmFwcExvY2FsZS5MQUJFTF9GSUxFX0VYVEVOVElPTl9WQUxJREFUSU9OX01FU1NBR0V9ICR7dGhpcy5jaG9vc2VGaWx0ZXJ9YDtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcC5ub3RpZnlBcHAobXNnLCAnRXJyb3InKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnSU5WQUxJRF9GSUxFX0VYVEVOU0lPTicsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1zZ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZmlsZS5lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgIGVycm9yRmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZmlsZS5zaXplID4gTUFYRklMRVVQTE9BRF9TSVpFKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gYCR7dGhpcy5hcHBMb2NhbGUuTEFCRUxfRklMRV9FWENFRURfVkFMSURBVElPTl9NRVNTQUdFfSAke01BWF9GSUxFX1VQTE9BRF9GT1JNQVRURURfU0laRX1gO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwLm5vdGlmeUFwcChtc2csICdFcnJvcicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0ge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdJTlZBTElEX0ZJTEVfU0laRScsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1zZ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZmlsZS5lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgIGVycm9yRmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWxpZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsaWRGaWxlczogdmFsaWRGaWxlcyxcbiAgICAgICAgICAgIGVycm9yRmlsZXM6IGVycm9yRmlsZXNcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKk92ZXJ3cml0ZSB0aGUgY2FwdGlvbiBvbmx5IGlmIHRoZXkgYXJlIGRlZmF1bHQqL1xuICAgIGdldENhcHRpb24oY2FwdGlvbiwgaXNNdWx0aXBsZSwgaXNNb2JpbGVUeXBlKSB7XG4gICAgICAgIGlmIChfLmluY2x1ZGVzKHRoaXMuREVGQVVMVF9DQVBUSU9OUywgY2FwdGlvbikpIHtcbiAgICAgICAgICAgIHJldHVybiBpc011bHRpcGxlICYmICFpc01vYmlsZVR5cGUgPyB0aGlzLkRFRkFVTFRfQ0FQVElPTlMuTVVMVElQTEVfU0VMRUNUIDogdGhpcy5ERUZBVUxUX0NBUFRJT05TLlNFTEVDVDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FwdGlvbjtcbiAgICB9XG5cbiAgICB1cGxvYWRVcmwgPSAnc2VydmljZXMnO1xuXG4gICAgLyogY2hhbmdlIHNlcnZlciBwYXRoIGJhc2VkIG9uIHVzZXIgb3B0aW9uICovXG4gICAgY2hhbmdlU2VydmVyVXBsb2FkUGF0aChwYXRoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRVcGxvYWRUeXBlUGF0aCA9IHBhdGg7XG4gICAgfVxuXG4gICAgLyogdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBmaWxlZXh0ZW5zaW9uICovXG4gICAgZ2V0RmlsZUV4dGVuc2lvbihmaWxlTmFtZSkge1xuICAgICAgICBpZiAoZmlsZU5hbWUgJiYgXy5pbmNsdWRlcyhmaWxlTmFtZSwgJy4nKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGVOYW1lLnN1YnN0cmluZyhmaWxlTmFtZS5sYXN0SW5kZXhPZignLicpICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdmaWxlJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxscyBzZWxlY3QgRXZlbnRcbiAgICAgKiBAcGFyYW0gJGV2ZW50XG4gICAgICogQHBhcmFtICRmaWxlc1xuICAgICAqL1xuICAgIG9uU2VsZWN0RXZlbnRDYWxsKCRldmVudCwgJGZpbGVzKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRGaWxlcyA9ICRmaWxlcztcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3NlbGVjdCcsIHtcbiAgICAgICAgICAgICAgICAkZXZlbnQ6ICQuZXh0ZW5kKCRldmVudC4kZmlsZXMgfHwge30sICRmaWxlcyksXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRGaWxlczogJGZpbGVzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25GaWxlRWxlbUNsaWNrKCkge1xuICAgICAgICBjb25zdCBmaWxlSW5wdXRFbGVtID0gJCgnLmZpbGUtaW5wdXQnKVswXTtcbiAgICAgICAgZmlsZUlucHV0RWxlbS52YWx1ZSA9IG51bGw7XG4gICAgfVxuXG4gICAgLyp0aGlzIGZ1bmN0aW9uIHRvIGFwcGVuZCB1cGxvYWQgc3RhdHVzIGRvbSBlbGVtZW50cyB0byB3aWRnZXQgKi9cbiAgICBvbkZpbGVTZWxlY3QoJGV2ZW50LCAkZmlsZXMpIHtcbiAgICAgICAgbGV0IGJlZm9yZVNlbGVjdFZhbDtcbiAgICAgICAgY29uc3QgZmlsZXMgPSB0aGlzLmdldFZhbGlkRmlsZXMoJGZpbGVzKTtcbiAgICAgICAgJGZpbGVzID0gZmlsZXMudmFsaWRGaWxlcztcblxuICAgICAgICAvLyBUcmlnZ2VyIGVycm9yIGNhbGxiYWNrIGV2ZW50IGlmIGFueSBpbnZhbGlkIGZpbGUgZm91bmQuXG4gICAgICAgIGlmICghXy5pc0VtcHR5KGZpbGVzLmVycm9yRmlsZXMpKSB7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2Vycm9yJywge1xuICAgICAgICAgICAgICAgICRldmVudCxcbiAgICAgICAgICAgICAgICBmaWxlczogZmlsZXMuZXJyb3JGaWxlc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYWtlIGNhbGwgaWYgdGhlcmUgYXJlIHZhbGlkIGZpbGVzIGVsc2Ugbm8gY2FsbCBpcyBtYWRlXG4gICAgICAgIGlmICgkZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzT2JzZXJ2YWJsZSA9IG5ldyBTdWJqZWN0KCk7XG4gICAgICAgICAgICAvLyBFVkVOVDogT05fQkVGT1JFX1NFTEVDVFxuICAgICAgICAgICAgYmVmb3JlU2VsZWN0VmFsID0gdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVzZWxlY3QnLCB7XG4gICAgICAgICAgICAgICAgJGV2ZW50OiAkLmV4dGVuZCgkZXZlbnQuJGZpbGVzIHx8IHt9LCAkZmlsZXMpLFxuICAgICAgICAgICAgICAgIGZpbGVzOiAkZmlsZXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YXNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YXNvdXJjZS5fcHJvZ3Jlc3NPYnNlcnZhYmxlID0gdGhpcy5wcm9ncmVzc09ic2VydmFibGU7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhc291cmNlLl9wcm9ncmVzc09ic2VydmFibGUuYXNPYnNlcnZhYmxlKCkuc3Vic2NyaWJlKChwcm9ncmVzc09iaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2godGhpcy5zZWxlY3RlZEZpbGVzLCAoZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUubmFtZSA9PT0gcHJvZ3Jlc3NPYmouZmlsZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gcHJvZ3Jlc3NPYmoucHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUucHJvZ3Jlc3MgPT09IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnN0YXR1cyA9ICdzdWNjZXNzJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnN0YXR1cyA9IHByb2dyZXNzT2JqLnN0YXR1cztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMgPSAkZmlsZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmVmb3JlU2VsZWN0VmFsICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIC8vIEVWRU5UOiBPTl9TRUxFQ1RcbiAgICAgICAgICAgICAgICB0aGlzLm9uU2VsZWN0RXZlbnRDYWxsKCRldmVudCwgJGZpbGVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFib3J0cyBhIGZpbGUgdXBsb2FkIHJlcXVlc3RcbiAgICAgKiBAcGFyYW0gJGZpbGUsIHRoZSBmaWxlIGZvciB3aGljaCB0aGUgcmVxdWVzdCBpcyB0byBiZSBhYm9ydGVkXG4gICAgICovXG4gICAgYWJvcnRGaWxlVXBsb2FkKCRmaWxlKSB7XG4gICAgICAgIHRoaXMuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkNBTkNFTCwgJGZpbGUpO1xuICAgIH1cblxuICAgIC8qIERlZmluZSB0aGUgcHJvcGVydHkgY2hhbmdlIGhhbmRsZXIuIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiB0aGVyZSBpcyBhIGNoYW5nZSBpbiB0aGUgd2lkZ2V0IHByb3BlcnR5ICovXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdikge1xuICAgICAgICAvKk1vbml0b3JpbmcgY2hhbmdlcyBmb3Igc3R5bGVzIG9yIHByb3BlcnRpZXMgYW5kIGFjY29yZGluZ2x5IGhhbmRsaW5nIHJlc3BlY3RpdmUgY2hhbmdlcy4qL1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSAndXBsb2FkcGF0aCc6XG4gICAgICAgICAgICAgICAgLy8gVE9ETyBTcmluaXZhczogd2h5IGRvIHdlIG5lZWQgdXBsb2FkcGF0aFxuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlU2VydmVyVXBsb2FkUGF0aChudik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb250ZW50dHlwZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jaG9vc2VGaWx0ZXIgPSBudi5zcGxpdCgnICcpLmpvaW4oJywnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ211bHRpcGxlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm1OYW1lID0gdGhpcy5uYW1lICsgKHRoaXMubXVsdGlwbGUgPyAnLW11bHRpcGxlLWZpbGV1cGxvYWQnIDogJy1zaW5nbGUtZmlsZXVwbG9hZCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FwdGlvbiA9IHRoaXMuZ2V0Q2FwdGlvbih0aGlzLmNhcHRpb24sIHRoaXMubXVsdGlwbGUsIHRoaXMuX2lzTW9iaWxlVHlwZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdmaWxldXBsb2FkbWVzc2FnZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkTWVzc2FnZSA9IG52O1xuICAgICAgICB9XG5cbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3RvciwgcHJpdmF0ZSBhcHA6IEFwcCwgQEF0dHJpYnV0ZSgnc2VsZWN0LmV2ZW50JykgcHVibGljIG9uU2VsZWN0RXZ0KSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIC8vIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBzdXBlci5uZ09uSW5pdCgpO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgc3R5bGVyKCB0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmFwcC1idXR0b24sIC5kcm9wLWJveCcpLCB0aGlzKTtcbiAgICB9XG59XG4iXX0=