import * as tslib_1 from "tslib";
import { Attribute, Component, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { App, DataSource, isAudioFile, isImageFile, isVideoFile } from '@wm/core';
import { registerProps } from './file-upload.props';
import { StylableComponent } from '../base/stylable.component';
import { styler } from '../../framework/styler';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-fileupload';
var WIDGET_CONFIG = {
    widgetType: 'wm-fileupload',
    hostClass: DEFAULT_CLS
};
var FileUploadComponent = /** @class */ (function (_super) {
    tslib_1.__extends(FileUploadComponent, _super);
    function FileUploadComponent(inj, app, onSelectEvt) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.app = app;
        _this.onSelectEvt = onSelectEvt;
        _this.selectedFiles = [];
        _this.fileTransfers = {};
        _this.caption = 'Upload';
        _this.formName = '';
        _this.DEFAULT_CAPTIONS = {
            MULTIPLE_SELECT: 'Drop your files here.',
            SELECT: 'Select'
        };
        _this.DEVICE_CONTENTTYPES = {
            IMAGE: 'image',
            VIDEO: 'video',
            AUDIO: 'audio',
            FILES: 'files'
        };
        _this.FILESIZE_MB = 1048576;
        // parentPrefabScope = element.closest('.app-prefab').isolateScope(),
        _this.CONSTANT_FILE_SERVICE = 'FileService';
        _this.uploadData = {
            file: undefined,
            uploadPath: undefined
        };
        _this.chooseFilter = '';
        _this.fileUploadMessage = 'You can also browse for files';
        _this.uploadedFiles = {
            fileName: '',
            path: '',
            length: '',
            status: ''
        };
        _this.uploadUrl = 'services';
        return _this;
        // styler(this.nativeElement, this);
    }
    /*_hasOnSuccessEvt = WM.isDefined(attrs.onSuccess);
     _hasOnErrorEvt = WM.isDefined(attrs.onError);*/
    // Checking if the selected file is valid for the choosen filter type
    FileUploadComponent.prototype.isValidFile = function (filename, contenttype, extensionName, isMobileType) {
        var isValid, contentTypes;
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
    };
    /* this return the array of files which are having the file size not more than maxfilesize and filters based on contenttype */
    FileUploadComponent.prototype.getValidFiles = function ($files) {
        var _this = this;
        var validFiles = [];
        var errorFiles = [];
        var MAXFILEUPLOAD_SIZE = parseFloat(this.maxfilesize) * this.FILESIZE_MB || this.FILESIZE_MB;
        var MAX_FILE_UPLOAD_FORMATTED_SIZE = (this.maxfilesize || '1') + 'MB';
        // if contenttype is files for mobile projects.
        if (this.chooseFilter === this.DEVICE_CONTENTTYPES.FILES) {
            this.chooseFilter = '';
        }
        _.forEach($files, function (file) {
            /* check for the file content type before uploading */
            if (!_this.isValidFile(file.name, _this.chooseFilter, _this.getFileExtension(file.name), _this._isMobileType)) {
                var msg = _this.appLocale.LABEL_FILE_EXTENTION_VALIDATION_MESSAGE + " " + _this.chooseFilter;
                _this.app.notifyApp(msg, 'Error');
                var error = {
                    key: 'INVALID_FILE_EXTENSION',
                    message: msg
                };
                file.error = error;
                errorFiles.push(file);
                return;
            }
            if (file.size > MAXFILEUPLOAD_SIZE) {
                var msg = _this.appLocale.LABEL_FILE_EXCEED_VALIDATION_MESSAGE + " " + MAX_FILE_UPLOAD_FORMATTED_SIZE;
                _this.app.notifyApp(msg, 'Error');
                var error = {
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
    };
    /*Overwrite the caption only if they are default*/
    FileUploadComponent.prototype.getCaption = function (caption, isMultiple, isMobileType) {
        if (_.includes(this.DEFAULT_CAPTIONS, caption)) {
            return isMultiple && !isMobileType ? this.DEFAULT_CAPTIONS.MULTIPLE_SELECT : this.DEFAULT_CAPTIONS.SELECT;
        }
        return caption;
    };
    /* change server path based on user option */
    FileUploadComponent.prototype.changeServerUploadPath = function (path) {
        this.selectedUploadTypePath = path;
    };
    /* this function returns the fileextension */
    FileUploadComponent.prototype.getFileExtension = function (fileName) {
        if (fileName && _.includes(fileName, '.')) {
            return fileName.substring(fileName.lastIndexOf('.') + 1);
        }
        return 'file';
    };
    /**
     * Calls select Event
     * @param $event
     * @param $files
     */
    FileUploadComponent.prototype.onSelectEventCall = function ($event, $files) {
        var _this = this;
        this.selectedFiles = $files;
        setTimeout(function () {
            _this.invokeEventCallback('select', {
                $event: $.extend($event.$files || {}, $files),
                selectedFiles: $files
            });
        });
    };
    FileUploadComponent.prototype.onFileElemClick = function () {
        var fileInputElem = $('.file-input')[0];
        fileInputElem.value = null;
    };
    /*this function to append upload status dom elements to widget */
    FileUploadComponent.prototype.onFileSelect = function ($event, $files) {
        var _this = this;
        var beforeSelectVal;
        var files = this.getValidFiles($files);
        $files = files.validFiles;
        // Trigger error callback event if any invalid file found.
        if (!_.isEmpty(files.errorFiles)) {
            this.invokeEventCallback('error', {
                $event: $event,
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
                this.datasource._progressObservable.asObservable().subscribe(function (progressObj) {
                    _.forEach(_this.selectedFiles, function (file) {
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
    };
    /**
     * Aborts a file upload request
     * @param $file, the file for which the request is to be aborted
     */
    FileUploadComponent.prototype.abortFileUpload = function ($file) {
        this.datasource.execute(DataSource.Operation.CANCEL, $file);
    };
    /* Define the property change handler. This function will be triggered when there is a change in the widget property */
    FileUploadComponent.prototype.onPropertyChange = function (key, nv, ov) {
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
        _super.prototype.onPropertyChange.call(this, key, nv, ov);
    };
    FileUploadComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
    };
    FileUploadComponent.prototype.ngAfterViewInit = function () {
        styler(this.nativeElement.querySelector('.app-button, .drop-box'), this);
    };
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
    FileUploadComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: App },
        { type: undefined, decorators: [{ type: Attribute, args: ['select.event',] }] }
    ]; };
    return FileUploadComponent;
}(StylableComponent));
export { FileUploadComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS11cGxvYWQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9maWxlLXVwbG9hZC9maWxlLXVwbG9hZC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFFdEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUUvQixPQUFPLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVsRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBSWpFLElBQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDO0FBQ3JDLElBQU0sYUFBYSxHQUFHO0lBQ2xCLFVBQVUsRUFBRSxlQUFlO0lBQzNCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUM7QUFFRjtJQVF5QywrQ0FBaUI7SUFtUHRELDZCQUFZLEdBQWEsRUFBVSxHQUFRLEVBQW9DLFdBQVc7UUFBMUYsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBRTVCO1FBSGtDLFNBQUcsR0FBSCxHQUFHLENBQUs7UUFBb0MsaUJBQVcsR0FBWCxXQUFXLENBQUE7UUFqUDFGLG1CQUFhLEdBQVEsRUFBRSxDQUFDO1FBSXhCLG1CQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ25CLGFBQU8sR0FBRyxRQUFRLENBQUM7UUFDbkIsY0FBUSxHQUFHLEVBQUUsQ0FBQztR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SUFDOUUsQ0FBQztJQTdQTSxtQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFUNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLHN4SUFBMkM7b0JBQzNDLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQztxQkFDMUM7aUJBQ0o7Ozs7Z0JBekI2QyxRQUFRO2dCQUk3QyxHQUFHO2dEQTBRc0MsU0FBUyxTQUFDLGNBQWM7O0lBWTFFLDBCQUFDO0NBQUEsQUF2UUQsQ0FReUMsaUJBQWlCLEdBK1B6RDtTQS9QWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBBdHRyaWJ1dGUsIENvbXBvbmVudCwgSW5qZWN0b3IsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IEFwcCwgRGF0YVNvdXJjZSwgaXNBdWRpb0ZpbGUsIGlzSW1hZ2VGaWxlLCBpc1ZpZGVvRmlsZSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vZmlsZS11cGxvYWQucHJvcHMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXywgJDtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWZpbGV1cGxvYWQnO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tZmlsZXVwbG9hZCcsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21GaWxlVXBsb2FkXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ZpbGUtdXBsb2FkLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKEZpbGVVcGxvYWRDb21wb25lbnQpXG4gICAgXVxufSlcblxuZXhwb3J0IGNsYXNzIEZpbGVVcGxvYWRDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcbiAgICBzZWxlY3RlZEZpbGVzOiBhbnkgPSBbXTtcbiAgICBwcm9ncmVzc09ic2VydmFibGU7XG4gICAgbmFtZTtcbiAgICBtdWx0aXBsZTtcbiAgICBmaWxlVHJhbnNmZXJzID0ge307XG4gICAgY2FwdGlvbiA9ICdVcGxvYWQnO1xuICAgIGZvcm1OYW1lID0gJyc7XG4gICAgbWF4ZmlsZXNpemU7XG4gICAgc2VsZWN0ZWRVcGxvYWRUeXBlUGF0aDtcbiAgICBERUZBVUxUX0NBUFRJT05TID0ge1xuICAgICAgICBNVUxUSVBMRV9TRUxFQ1Q6ICdEcm9wIHlvdXIgZmlsZXMgaGVyZS4nLFxuICAgICAgICBTRUxFQ1Q6ICdTZWxlY3QnXG4gICAgfTtcbiAgICBERVZJQ0VfQ09OVEVOVFRZUEVTID0ge1xuICAgICAgICBJTUFHRTogJ2ltYWdlJyxcbiAgICAgICAgVklERU86ICd2aWRlbycsXG4gICAgICAgIEFVRElPOiAnYXVkaW8nLFxuICAgICAgICBGSUxFUzogJ2ZpbGVzJ1xuICAgIH07XG4gICAgRklMRVNJWkVfTUIgPSAxMDQ4NTc2O1xuICAgIHdpZGdldFByb3BzO1xuICAgIF9pc01vYmlsZVR5cGU7XG4gICAgX2lzQ29yZG92YTtcbiAgICAvLyBwYXJlbnRQcmVmYWJTY29wZSA9IGVsZW1lbnQuY2xvc2VzdCgnLmFwcC1wcmVmYWInKS5pc29sYXRlU2NvcGUoKSxcbiAgICBDT05TVEFOVF9GSUxFX1NFUlZJQ0UgPSAnRmlsZVNlcnZpY2UnO1xuICAgIHVwbG9hZERhdGEgPSB7XG4gICAgICAgIGZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgdXBsb2FkUGF0aDogdW5kZWZpbmVkXG4gICAgfTtcbiAgICBjaG9vc2VGaWx0ZXIgPSAnJztcbiAgICBkYXRhc291cmNlO1xuICAgIGZpbGVVcGxvYWRNZXNzYWdlID0gJ1lvdSBjYW4gYWxzbyBicm93c2UgZm9yIGZpbGVzJztcbiAgICB1cGxvYWRlZEZpbGVzID0ge1xuICAgICAgICBmaWxlTmFtZTogJycsXG4gICAgICAgIHBhdGg6ICcnLFxuICAgICAgICBsZW5ndGg6ICcnLFxuICAgICAgICBzdGF0dXM6ICcnXG4gICAgfTtcbiAgICAvKl9oYXNPblN1Y2Nlc3NFdnQgPSBXTS5pc0RlZmluZWQoYXR0cnMub25TdWNjZXNzKTtcbiAgICAgX2hhc09uRXJyb3JFdnQgPSBXTS5pc0RlZmluZWQoYXR0cnMub25FcnJvcik7Ki9cblxuICAgIC8vIENoZWNraW5nIGlmIHRoZSBzZWxlY3RlZCBmaWxlIGlzIHZhbGlkIGZvciB0aGUgY2hvb3NlbiBmaWx0ZXIgdHlwZVxuICAgIGlzVmFsaWRGaWxlKGZpbGVuYW1lLCBjb250ZW50dHlwZSwgZXh0ZW5zaW9uTmFtZSwgaXNNb2JpbGVUeXBlKSB7XG4gICAgICAgIGxldCBpc1ZhbGlkLCBjb250ZW50VHlwZXM7XG5cbiAgICAgICAgaWYgKCFjb250ZW50dHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY29udGVudFR5cGVzID0gXy50b0xvd2VyKGNvbnRlbnR0eXBlKS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIGlmIChfLmluY2x1ZGVzKGNvbnRlbnRUeXBlcywgJ2ltYWdlLyonKSB8fCAoXy5pbmNsdWRlcyhjb250ZW50VHlwZXMsICdpbWFnZScpICYmIGlzTW9iaWxlVHlwZSkpIHtcbiAgICAgICAgICAgIGlzVmFsaWQgPSBpc0ltYWdlRmlsZShmaWxlbmFtZSk7XG4gICAgICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGNvbnRlbnQgdHlwZSBjaG9zZW4gaXMgaW1hZ2UgYW5kIHVzZXIgdXBsb2FkcyBpbWFnZSBpdCBpcyB2YWxpZCBmaWxlXG4gICAgICAgICAgICBpZiAoaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChfLmluY2x1ZGVzKGNvbnRlbnRUeXBlcywgJ2F1ZGlvLyonKSB8fCAoXy5pbmNsdWRlcyhjb250ZW50VHlwZXMsICdhdWRpbycpICYmIGlzTW9iaWxlVHlwZSkpIHtcbiAgICAgICAgICAgIGlzVmFsaWQgPSBpc0F1ZGlvRmlsZShmaWxlbmFtZSk7XG4gICAgICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGNvbnRlbnQgdHlwZSBjaG9zZW4gaXMgYXVkaW8vKiBhbmQgdXNlciB1cGxvYWRzIGF1ZGlvIGl0IGlzIHZhbGlkIGZpbGVcbiAgICAgICAgICAgIGlmIChpc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8uaW5jbHVkZXMoY29udGVudFR5cGVzLCAndmlkZW8vKicpIHx8IChfLmluY2x1ZGVzKGNvbnRlbnRUeXBlcywgJ3ZpZGVvJykgJiYgaXNNb2JpbGVUeXBlKSkge1xuICAgICAgICAgICAgaXNWYWxpZCA9IGlzVmlkZW9GaWxlKGZpbGVuYW1lKTtcbiAgICAgICAgICAgIC8vIElmIG9uZSBvZiB0aGUgY29udGVudCB0eXBlIGNob3NlbiBpcyB2aWRlby8qIGFuZCB1c2VyIHVwbG9hZHMgdmlkZW8gaXQgaXMgdmFsaWQgZmlsZVxuICAgICAgICAgICAgaWYgKGlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKmNvbnRlbnQgdHlwZSBhbmQgdGhlIHVwbG9hZGVkIGZpbGUgZXh0ZW5zaW9uIHNob3VsZCBiZSBzYW1lKi9cbiAgICAgICAgaWYgKF8uaW5jbHVkZXMoY29udGVudFR5cGVzLCAnLicgKyBfLnRvTG93ZXIoZXh0ZW5zaW9uTmFtZSkpKSB7XG4gICAgICAgICAgICBpc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICAvKiB0aGlzIHJldHVybiB0aGUgYXJyYXkgb2YgZmlsZXMgd2hpY2ggYXJlIGhhdmluZyB0aGUgZmlsZSBzaXplIG5vdCBtb3JlIHRoYW4gbWF4ZmlsZXNpemUgYW5kIGZpbHRlcnMgYmFzZWQgb24gY29udGVudHR5cGUgKi9cbiAgICBnZXRWYWxpZEZpbGVzKCRmaWxlcykge1xuICAgICAgICBjb25zdCB2YWxpZEZpbGVzID0gW107XG4gICAgICAgIGNvbnN0IGVycm9yRmlsZXMgPSBbXTtcbiAgICAgICAgY29uc3QgTUFYRklMRVVQTE9BRF9TSVpFID0gcGFyc2VGbG9hdCh0aGlzLm1heGZpbGVzaXplKSAqIHRoaXMuRklMRVNJWkVfTUIgfHwgdGhpcy5GSUxFU0laRV9NQjtcbiAgICAgICAgY29uc3QgTUFYX0ZJTEVfVVBMT0FEX0ZPUk1BVFRFRF9TSVpFID0gKHRoaXMubWF4ZmlsZXNpemUgfHwgJzEnKSArICdNQic7XG5cbiAgICAgICAgLy8gaWYgY29udGVudHR5cGUgaXMgZmlsZXMgZm9yIG1vYmlsZSBwcm9qZWN0cy5cbiAgICAgICAgaWYgKHRoaXMuY2hvb3NlRmlsdGVyID09PSB0aGlzLkRFVklDRV9DT05URU5UVFlQRVMuRklMRVMpIHtcbiAgICAgICAgICAgIHRoaXMuY2hvb3NlRmlsdGVyID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBfLmZvckVhY2goJGZpbGVzLCAoZmlsZSkgPT4ge1xuICAgICAgICAgICAgLyogY2hlY2sgZm9yIHRoZSBmaWxlIGNvbnRlbnQgdHlwZSBiZWZvcmUgdXBsb2FkaW5nICovXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNWYWxpZEZpbGUoZmlsZS5uYW1lLCB0aGlzLmNob29zZUZpbHRlciwgdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKGZpbGUubmFtZSksIHRoaXMuX2lzTW9iaWxlVHlwZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBgJHt0aGlzLmFwcExvY2FsZS5MQUJFTF9GSUxFX0VYVEVOVElPTl9WQUxJREFUSU9OX01FU1NBR0V9ICR7dGhpcy5jaG9vc2VGaWx0ZXJ9YDtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcC5ub3RpZnlBcHAobXNnLCAnRXJyb3InKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnSU5WQUxJRF9GSUxFX0VYVEVOU0lPTicsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1zZ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZmlsZS5lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgIGVycm9yRmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZmlsZS5zaXplID4gTUFYRklMRVVQTE9BRF9TSVpFKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gYCR7dGhpcy5hcHBMb2NhbGUuTEFCRUxfRklMRV9FWENFRURfVkFMSURBVElPTl9NRVNTQUdFfSAke01BWF9GSUxFX1VQTE9BRF9GT1JNQVRURURfU0laRX1gO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwLm5vdGlmeUFwcChtc2csICdFcnJvcicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0ge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdJTlZBTElEX0ZJTEVfU0laRScsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1zZ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZmlsZS5lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgIGVycm9yRmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWxpZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsaWRGaWxlczogdmFsaWRGaWxlcyxcbiAgICAgICAgICAgIGVycm9yRmlsZXM6IGVycm9yRmlsZXNcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKk92ZXJ3cml0ZSB0aGUgY2FwdGlvbiBvbmx5IGlmIHRoZXkgYXJlIGRlZmF1bHQqL1xuICAgIGdldENhcHRpb24oY2FwdGlvbiwgaXNNdWx0aXBsZSwgaXNNb2JpbGVUeXBlKSB7XG4gICAgICAgIGlmIChfLmluY2x1ZGVzKHRoaXMuREVGQVVMVF9DQVBUSU9OUywgY2FwdGlvbikpIHtcbiAgICAgICAgICAgIHJldHVybiBpc011bHRpcGxlICYmICFpc01vYmlsZVR5cGUgPyB0aGlzLkRFRkFVTFRfQ0FQVElPTlMuTVVMVElQTEVfU0VMRUNUIDogdGhpcy5ERUZBVUxUX0NBUFRJT05TLlNFTEVDVDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FwdGlvbjtcbiAgICB9XG5cbiAgICB1cGxvYWRVcmwgPSAnc2VydmljZXMnO1xuXG4gICAgLyogY2hhbmdlIHNlcnZlciBwYXRoIGJhc2VkIG9uIHVzZXIgb3B0aW9uICovXG4gICAgY2hhbmdlU2VydmVyVXBsb2FkUGF0aChwYXRoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRVcGxvYWRUeXBlUGF0aCA9IHBhdGg7XG4gICAgfVxuXG4gICAgLyogdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBmaWxlZXh0ZW5zaW9uICovXG4gICAgZ2V0RmlsZUV4dGVuc2lvbihmaWxlTmFtZSkge1xuICAgICAgICBpZiAoZmlsZU5hbWUgJiYgXy5pbmNsdWRlcyhmaWxlTmFtZSwgJy4nKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGVOYW1lLnN1YnN0cmluZyhmaWxlTmFtZS5sYXN0SW5kZXhPZignLicpICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdmaWxlJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxscyBzZWxlY3QgRXZlbnRcbiAgICAgKiBAcGFyYW0gJGV2ZW50XG4gICAgICogQHBhcmFtICRmaWxlc1xuICAgICAqL1xuICAgIG9uU2VsZWN0RXZlbnRDYWxsKCRldmVudCwgJGZpbGVzKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRGaWxlcyA9ICRmaWxlcztcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3NlbGVjdCcsIHtcbiAgICAgICAgICAgICAgICAkZXZlbnQ6ICQuZXh0ZW5kKCRldmVudC4kZmlsZXMgfHwge30sICRmaWxlcyksXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRGaWxlczogJGZpbGVzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25GaWxlRWxlbUNsaWNrKCkge1xuICAgICAgICBjb25zdCBmaWxlSW5wdXRFbGVtID0gJCgnLmZpbGUtaW5wdXQnKVswXTtcbiAgICAgICAgZmlsZUlucHV0RWxlbS52YWx1ZSA9IG51bGw7XG4gICAgfVxuXG4gICAgLyp0aGlzIGZ1bmN0aW9uIHRvIGFwcGVuZCB1cGxvYWQgc3RhdHVzIGRvbSBlbGVtZW50cyB0byB3aWRnZXQgKi9cbiAgICBvbkZpbGVTZWxlY3QoJGV2ZW50LCAkZmlsZXMpIHtcbiAgICAgICAgbGV0IGJlZm9yZVNlbGVjdFZhbDtcbiAgICAgICAgY29uc3QgZmlsZXMgPSB0aGlzLmdldFZhbGlkRmlsZXMoJGZpbGVzKTtcbiAgICAgICAgJGZpbGVzID0gZmlsZXMudmFsaWRGaWxlcztcblxuICAgICAgICAvLyBUcmlnZ2VyIGVycm9yIGNhbGxiYWNrIGV2ZW50IGlmIGFueSBpbnZhbGlkIGZpbGUgZm91bmQuXG4gICAgICAgIGlmICghXy5pc0VtcHR5KGZpbGVzLmVycm9yRmlsZXMpKSB7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2Vycm9yJywge1xuICAgICAgICAgICAgICAgICRldmVudCxcbiAgICAgICAgICAgICAgICBmaWxlczogZmlsZXMuZXJyb3JGaWxlc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYWtlIGNhbGwgaWYgdGhlcmUgYXJlIHZhbGlkIGZpbGVzIGVsc2Ugbm8gY2FsbCBpcyBtYWRlXG4gICAgICAgIGlmICgkZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzT2JzZXJ2YWJsZSA9IG5ldyBTdWJqZWN0KCk7XG4gICAgICAgICAgICAvLyBFVkVOVDogT05fQkVGT1JFX1NFTEVDVFxuICAgICAgICAgICAgYmVmb3JlU2VsZWN0VmFsID0gdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVzZWxlY3QnLCB7XG4gICAgICAgICAgICAgICAgJGV2ZW50OiAkLmV4dGVuZCgkZXZlbnQuJGZpbGVzIHx8IHt9LCAkZmlsZXMpLFxuICAgICAgICAgICAgICAgIGZpbGVzOiAkZmlsZXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YXNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YXNvdXJjZS5fcHJvZ3Jlc3NPYnNlcnZhYmxlID0gdGhpcy5wcm9ncmVzc09ic2VydmFibGU7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhc291cmNlLl9wcm9ncmVzc09ic2VydmFibGUuYXNPYnNlcnZhYmxlKCkuc3Vic2NyaWJlKChwcm9ncmVzc09iaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2godGhpcy5zZWxlY3RlZEZpbGVzLCAoZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUubmFtZSA9PT0gcHJvZ3Jlc3NPYmouZmlsZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gcHJvZ3Jlc3NPYmoucHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUucHJvZ3Jlc3MgPT09IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnN0YXR1cyA9ICdzdWNjZXNzJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnN0YXR1cyA9IHByb2dyZXNzT2JqLnN0YXR1cztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMgPSAkZmlsZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmVmb3JlU2VsZWN0VmFsICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIC8vIEVWRU5UOiBPTl9TRUxFQ1RcbiAgICAgICAgICAgICAgICB0aGlzLm9uU2VsZWN0RXZlbnRDYWxsKCRldmVudCwgJGZpbGVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFib3J0cyBhIGZpbGUgdXBsb2FkIHJlcXVlc3RcbiAgICAgKiBAcGFyYW0gJGZpbGUsIHRoZSBmaWxlIGZvciB3aGljaCB0aGUgcmVxdWVzdCBpcyB0byBiZSBhYm9ydGVkXG4gICAgICovXG4gICAgYWJvcnRGaWxlVXBsb2FkKCRmaWxlKSB7XG4gICAgICAgIHRoaXMuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkNBTkNFTCwgJGZpbGUpO1xuICAgIH1cblxuICAgIC8qIERlZmluZSB0aGUgcHJvcGVydHkgY2hhbmdlIGhhbmRsZXIuIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiB0aGVyZSBpcyBhIGNoYW5nZSBpbiB0aGUgd2lkZ2V0IHByb3BlcnR5ICovXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdikge1xuICAgICAgICAvKk1vbml0b3JpbmcgY2hhbmdlcyBmb3Igc3R5bGVzIG9yIHByb3BlcnRpZXMgYW5kIGFjY29yZGluZ2x5IGhhbmRsaW5nIHJlc3BlY3RpdmUgY2hhbmdlcy4qL1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSAndXBsb2FkcGF0aCc6XG4gICAgICAgICAgICAgICAgLy8gVE9ETyBTcmluaXZhczogd2h5IGRvIHdlIG5lZWQgdXBsb2FkcGF0aFxuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlU2VydmVyVXBsb2FkUGF0aChudik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb250ZW50dHlwZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jaG9vc2VGaWx0ZXIgPSBudi5zcGxpdCgnICcpLmpvaW4oJywnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ211bHRpcGxlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm1OYW1lID0gdGhpcy5uYW1lICsgKHRoaXMubXVsdGlwbGUgPyAnLW11bHRpcGxlLWZpbGV1cGxvYWQnIDogJy1zaW5nbGUtZmlsZXVwbG9hZCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FwdGlvbiA9IHRoaXMuZ2V0Q2FwdGlvbih0aGlzLmNhcHRpb24sIHRoaXMubXVsdGlwbGUsIHRoaXMuX2lzTW9iaWxlVHlwZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdmaWxldXBsb2FkbWVzc2FnZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkTWVzc2FnZSA9IG52O1xuICAgICAgICB9XG5cbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3RvciwgcHJpdmF0ZSBhcHA6IEFwcCwgQEF0dHJpYnV0ZSgnc2VsZWN0LmV2ZW50JykgcHVibGljIG9uU2VsZWN0RXZ0KSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIC8vIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBzdXBlci5uZ09uSW5pdCgpO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgc3R5bGVyKCB0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmFwcC1idXR0b24sIC5kcm9wLWJveCcpLCB0aGlzKTtcbiAgICB9XG59XG4iXX0=