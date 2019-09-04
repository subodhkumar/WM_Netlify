import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { MediaCapture } from '@ionic-native/media-capture';
import { Camera } from '@ionic-native/camera';
import { DeviceFileDownloadService, DeviceService, DeviceFileCacheService, NetworkService } from '@wm/mobile/core';
import { addClass, hasCordova, noop, removeClass, setCSS, convertToBlob, $appDigest, isIos, isIphone, $parseExpr, isArray, isObject, isString, AbstractNavigationService, App, removeAttr, setAttr, switchClass, isNumber, setCSSFromObj } from '@wm/core';
import { WidgetRef, PROP_BOOLEAN, PROP_STRING, register, APPLY_STYLES_TYPE, provideAsWidgetRef, StylableComponent, styler, PROP_NUMBER, DateComponent, DatetimeComponent, FileUploadComponent, PROP_ANY, LeftPanelDirective, PageDirective, BaseComponent, getImageUrl, SearchComponent, TimeComponent, getEvaluatedData, WmComponentsModule } from '@wm/components';
import { Directive, HostListener, Inject, Component, ElementRef, Injector, ChangeDetectorRef, EventEmitter, Input, Output, Injectable, ContentChild, Attribute, Self, ViewChild, NgModule, defineInjectable, inject } from '@angular/core';

class AnchorDirective {
    constructor(widget) {
        this.widget = widget;
    }
    onClick() {
        let href = this.widget.hyperlink;
        if (href) {
            if (href.indexOf(':') >= 0 && !(_.startsWith(href, 'http://') || _.startsWith(href, 'https://'))) {
                return;
            }
            else if (_.startsWith(href, '#')) {
                window.location.href = window.location.origin + window.location.pathname + href;
                return;
            }
            else if (_.startsWith(href, '//')) {
                href = 'https:' + href;
            }
            cordova.InAppBrowser.open(href, this.widget.target);
        }
    }
}
AnchorDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmAnchor]'
            },] }
];
/** @nocollapse */
AnchorDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [WidgetRef,] }] }
];
AnchorDirective.propDecorators = {
    onClick: [{ type: HostListener, args: ['click',] }]
};

const DEFAULT_CLS = 'app-update-dialog modal fade in hidden';
const AUTO_UPDATE_FILENAME = 'app-auto-update.apk';
class AppUpdateComponent {
    constructor(deviceService, fileDownloadService, elRef, file, fileOpener, http) {
        this.deviceService = deviceService;
        this.fileDownloadService = fileDownloadService;
        this.elRef = elRef;
        this.file = file;
        this.fileOpener = fileOpener;
        this.http = http;
        this.downloadProgress = 0;
        this.downloading = false;
        this.message = 'There is an update available. Would you like to update the app?';
        addClass(this.elRef.nativeElement, DEFAULT_CLS);
        setCSS(this.elRef.nativeElement, 'display', 'block');
        if (hasCordova()) {
            this.getBuildMeta().then(buildMeta => {
                if (buildMeta && buildMeta.buildMode === 'DEVELOPMENT_MODE') {
                    this.file.removeFile(cordova.file.externalApplicationStorageDirectory, AUTO_UPDATE_FILENAME).catch(noop);
                    this.checkForUpdate()
                        .then(this.getUserConfirmation.bind(this), noop);
                }
            });
        }
    }
    cancel() {
        addClass(this.elRef.nativeElement, 'hidden');
    }
    installLatestVersion() {
        const apkFile = cordova.file.externalApplicationStorageDirectory + AUTO_UPDATE_FILENAME, downloadLink = `${this._buildMeta.host}/appBuild/rest/mobileBuilds/android/download?token=${this._buildMeta.token}&buildNumber=${this._buildMeta.latestBuildNumber}&fileName=${AUTO_UPDATE_FILENAME}&releaseVersion=${this._buildMeta.platformVersion}`, progressObserver = { next: e => { this.downloadProgress = (e.loaded / e.total) * 100; }, error: null, complete: null };
        this.fileDownloadService.download(downloadLink, false, cordova.file.externalApplicationStorageDirectory, AUTO_UPDATE_FILENAME, progressObserver).then(() => {
            this.fileOpener.open(apkFile, 'application/vnd.android.package-archive');
        }, function () {
            this.message = 'Failed to download latest version.';
        });
        this.message = `Downloading the latest version [${this._buildMeta.latestVersion}].`;
        this.downloading = true;
    }
    checkForUpdate() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this._buildMeta.host}/appBuild/rest/mobileBuilds/latest_build?token=${this._buildMeta.token}&releaseVersion=${this._buildMeta.platformVersion}`)
                .toPromise()
                .then((response) => {
                const latestBuildNumber = response.success.body.buildNumber, latestVersion = response.success.body.version;
                if (this._buildMeta.buildNumber < latestBuildNumber) {
                    this._buildMeta.latestBuildNumber = latestBuildNumber;
                    this._buildMeta.latestVersion = latestVersion;
                    resolve(latestBuildNumber);
                }
                else {
                    reject();
                }
            }, reject);
        });
    }
    getBuildMeta() {
        if (!this._buildMeta) {
            return this.file.readAsText(cordova.file.applicationDirectory + 'www/', 'build_meta.json')
                .then(data => {
                this._buildMeta = JSON.parse(data);
                return this._buildMeta;
            }, noop);
        }
        return Promise.resolve(this._buildMeta);
    }
    getUserConfirmation() {
        this.downloadProgress = 0;
        this.downloading = false;
        this.message = 'There is an update available. Would you like to update the app?';
        removeClass(this.elRef.nativeElement, 'hidden');
    }
}
AppUpdateComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmAppUpdate]',
                template: "<div class=\"modal-dialog\">\n    <div class=\"modal-content\"> \n        <div class=\"modal-body\"> \n            <span [textContent]=\"message\"></span>\n            <div class=\"progress\" [hidden]=\"!downloading\">\n                <div class=\"progress-bar\" [style.width.%]=\"downloadProgress\"></div>\n            </div>\n        </div>\n        <div class=\"modal-footer\"> \n            <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\" (click)=\"cancel()\">Skip update</button>\n            <button type=\"button\" class=\"btn btn-primary\" [hidden]=\"downloading\" (click)=\"installLatestVersion()\">Update</button>\n        </div>\n    </div>\n</div>"
            }] }
];
/** @nocollapse */
AppUpdateComponent.ctorParameters = () => [
    { type: DeviceService },
    { type: DeviceFileDownloadService },
    { type: ElementRef },
    { type: File },
    { type: FileOpener },
    { type: HttpClient }
];

const registerProps = () => {
    register('wm-barcodescanner', new Map([
        ['barcodeformat', Object.assign({ value: 'ALL' }, PROP_STRING)],
        ['caption', Object.assign({ value: '' }, PROP_STRING)],
        ['class', PROP_STRING],
        ['iconclass', Object.assign({ value: 'glyphicon glyphicon-barcode' }, PROP_STRING)],
        ['iconsize', Object.assign({ value: '2em' }, PROP_STRING)],
        ['name', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)]
    ]));
};

const DEFAULT_CLS$1 = 'btn app-barcode';
const WIDGET_CONFIG = { widgetType: 'wm-barcodescanner', hostClass: DEFAULT_CLS$1 };
class BarcodeScannerComponent extends StylableComponent {
    constructor(scanner, inj) {
        super(inj, WIDGET_CONFIG);
        this.scanner = scanner;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }
    openBarcodescanner($event) {
        this.scan().then(text => {
            this.datavalue = text;
            this.invokeEventCallback('success', { $event });
        });
    }
    scan() {
        let options;
        if (hasCordova()) {
            if (this.barcodeformat && this.barcodeformat !== 'ALL') {
                options = {
                    formats: this.barcodeformat
                };
            }
            return this.scanner.scan(options)
                .then(data => data.text);
        }
        return Promise.resolve('BAR_CODE');
    }
}
BarcodeScannerComponent.initializeProps = registerProps();
BarcodeScannerComponent.decorators = [
    { type: Component, args: [{
                selector: 'button[wmBarcodescanner]',
                template: "<i [ngClass]=\"iconclass\" [ngStyle]=\"{'font-size': iconsize}\"></i>\n<span class=\"btn-caption\" [textContent]=\"caption\"></span>",
                providers: [
                    provideAsWidgetRef(BarcodeScannerComponent)
                ]
            }] }
];
/** @nocollapse */
BarcodeScannerComponent.ctorParameters = () => [
    { type: BarcodeScanner },
    { type: Injector }
];
BarcodeScannerComponent.propDecorators = {
    openBarcodescanner: [{ type: HostListener, args: ['click', ['$event'],] }]
};

const registerProps$1 = () => {
    register('wm-camera', new Map([
        ['allowedit', Object.assign({ value: false }, PROP_BOOLEAN)],
        ['capturetype', Object.assign({ value: 'IMAGE' }, PROP_STRING)],
        ['caption', Object.assign({ value: '' }, PROP_STRING)],
        ['class', PROP_STRING],
        ['correctorientation', Object.assign({ value: false }, PROP_BOOLEAN)],
        ['datavalue', Object.assign({ value: '' }, PROP_STRING)],
        ['iconclass', Object.assign({ value: 'wi wi-photo-camera' }, PROP_STRING)],
        ['iconsize', Object.assign({ value: '2em' }, PROP_STRING)],
        ['imagequality', Object.assign({ value: 80 }, PROP_NUMBER)],
        ['imageencodingtype', Object.assign({ value: 'JPEG' }, PROP_STRING)],
        ['imagetargetwidth', PROP_NUMBER],
        ['imagetargetheight', PROP_NUMBER],
        ['localFile', Object.assign({ value: '' }, PROP_STRING)],
        ['localFilePath', Object.assign({ value: '' }, PROP_STRING)],
        ['name', PROP_STRING],
        ['savetogallery', Object.assign({ value: false }, PROP_BOOLEAN)],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)]
    ]));
};

const DEFAULT_CLS$2 = 'btn app-camera';
const WIDGET_CONFIG$1 = { widgetType: 'wm-camera', hostClass: DEFAULT_CLS$2 };
var CAPTURE_TYPE;
(function (CAPTURE_TYPE) {
    CAPTURE_TYPE["IMAGE"] = "IMAGE";
    CAPTURE_TYPE["PNG"] = "PNG";
})(CAPTURE_TYPE || (CAPTURE_TYPE = {}));
var ENCODING_TYPE;
(function (ENCODING_TYPE) {
    ENCODING_TYPE["JPEG"] = "JPEG";
    ENCODING_TYPE["PNG"] = "PNG";
})(ENCODING_TYPE || (ENCODING_TYPE = {}));
class CameraComponent extends StylableComponent {
    constructor(camera, mediaCapture, inj, elRef, cdr) {
        super(inj, WIDGET_CONFIG$1);
        this.camera = camera;
        this.mediaCapture = mediaCapture;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }
    openCamera($event) {
        if (hasCordova()) {
            if (this.capturetype === CAPTURE_TYPE.IMAGE) {
                this._cameraOptions = {
                    quality: this.imagequality,
                    destinationType: 1,
                    sourceType: 1,
                    allowEdit: this.allowedit,
                    correctOrientation: this.correctorientation,
                    encodingType: this.imageencodingtype === ENCODING_TYPE.JPEG ? 0 : 1,
                    saveToPhotoAlbum: this.savetogallery,
                    targetWidth: this.imagetargetwidth,
                    targetHeight: this.imagetargetheight
                };
                // start camera
                this.camera.getPicture(this._cameraOptions)
                    .then(path => this.updateModel($event, path));
            }
            else {
                this._cameraOptions = {
                    limit: 1
                };
                // start video capture
                this.mediaCapture.captureVideo(this._cameraOptions)
                    .then(mediaFiles => this.updateModel($event, mediaFiles[0].fullPath));
            }
        }
        else {
            this.invokeEventCallback('success', { $event });
        }
    }
    updateModel($event, value) {
        this.localFilePath = this.datavalue = value;
        convertToBlob(value)
            .then(result => {
            this.localFile = result.blob;
            this.invokeEventCallback('success', { $event, localFilePath: this.localFilePath, localFile: this.localFile });
        }, () => {
            this.localFile = undefined;
        });
    }
}
CameraComponent.initializeProps = registerProps$1();
CameraComponent.decorators = [
    { type: Component, args: [{
                selector: 'button[wmCamera]',
                template: "<i [ngClass]=\"iconclass\" [ngStyle]=\"{'font-size': iconsize}\"></i>",
                providers: [
                    provideAsWidgetRef(CameraComponent)
                ]
            }] }
];
/** @nocollapse */
CameraComponent.ctorParameters = () => [
    { type: Camera },
    { type: MediaCapture },
    { type: Injector },
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
CameraComponent.propDecorators = {
    openCamera: [{ type: HostListener, args: ['click', ['$event'],] }]
};

class DateDirective {
    constructor(dateComponent) {
        dateComponent.useDatapicker = false;
        dateComponent.datepattern = 'yyyy-MM-dd';
        dateComponent.updateFormat('datepattern');
    }
}
DateDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmDate]'
            },] }
];
/** @nocollapse */
DateDirective.ctorParameters = () => [
    { type: DateComponent }
];

class DateTimeDirective {
    constructor(dateTimeComponent) {
        dateTimeComponent.useDatapicker = false;
        dateTimeComponent.datepattern = 'yyyy-MM-ddTHH:mm:ss';
        dateTimeComponent.updateFormat('datepattern');
    }
}
DateTimeDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmDateTime]'
            },] }
];
/** @nocollapse */
DateTimeDirective.ctorParameters = () => [
    { type: DatetimeComponent }
];

class FileBrowserComponent {
    constructor(deviceService) {
        this.deviceService = deviceService;
        this.selectedFiles = [];
        this.submitEmitter = new EventEmitter();
    }
    getFileExtension(fileName) {
        const extIndex = fileName ? fileName.lastIndexOf('.') : -1;
        if (extIndex > 0) {
            return fileName.substring(extIndex + 1);
        }
        return '';
    }
    ngOnDestroy() {
        if (this.backButtonListenerDeregister) {
            this.backButtonListenerDeregister();
        }
    }
    onFileClick(file) {
        if (file.isFile) {
            if (file.isSelected) {
                this.deselectFile(file);
            }
            else {
                this.selectFile(file);
            }
        }
        else {
            this.goToFolder(file);
        }
    }
    set show(flag) {
        let rootDir = cordova.file.externalRootDirectory;
        this.isVisible = flag;
        if (flag) {
            if (!this.currentFolder) {
                if (isIos()) {
                    rootDir = cordova.file.documentsDirectory;
                }
                resolveLocalFileSystemURL(rootDir, root => this.goToFolder(root));
            }
            this.backButtonListenerDeregister = this.deviceService.onBackButtonTap(() => {
                if (this.isVisible) {
                    if (this.currentFolder.parent) {
                        this.onFileClick(this.currentFolder.parent);
                    }
                    else {
                        this.isVisible = false;
                    }
                    $appDigest();
                    return false;
                }
            });
        }
        else if (this.backButtonListenerDeregister) {
            this.backButtonListenerDeregister();
        }
    }
    submit() {
        const files = [];
        this.loadFileSize(this.selectedFiles).then(() => {
            _.forEach(this.selectedFiles, function (f) {
                f.isSelected = false;
                files.push({ path: f.nativeURL,
                    name: f.name,
                    size: f.size });
            });
            this.selectedFiles = [];
            this.isVisible = false;
            this.submitEmitter.next({ files: files });
        });
    }
    deselectFile(file) {
        _.remove(this.selectedFiles, file);
        file.isSelected = false;
    }
    goToFolder(folder) {
        if (!folder.files) {
            this.loadFolder(folder, this.fileTypeToSelect)
                .then(files => {
                folder.files = files;
                folder.parent = this.currentFolder;
                this.currentFolder = folder;
            });
        }
        else {
            this.currentFolder = folder;
        }
    }
    loadFileSize(files) {
        return Promise.all(files.map(f => {
            return new Promise((resolve, reject) => {
                f.file(o => {
                    f.size = o.size;
                    resolve();
                }, reject);
            });
        }));
    }
    loadFolder(folder, fileTypeToSelect) {
        return new Promise((resolve, reject) => {
            let fileTypeToShow;
            folder.createReader().readEntries((entries) => {
                if (!_.isEmpty(fileTypeToSelect)) {
                    fileTypeToShow = _.split(fileTypeToSelect, ',');
                    entries = _.filter(entries, e => {
                        return !e.isFile || _.findIndex(fileTypeToShow, ext => _.endsWith(e.name, '.' + ext)) >= 0;
                    });
                }
                resolve(_.sortBy(entries, e => (e.isFile ? '1_' : '0_') + e.name.toLowerCase()));
            }, reject);
        });
    }
    refreshFolder() {
        return this.loadFolder(this.currentFolder, this.fileTypeToSelect)
            .then(files => this.currentFolder.files = files);
    }
    selectFile(file) {
        if (!this.multiple && this.selectedFiles.length > 0) {
            this.selectedFiles[0].isSelected = false;
            this.selectedFiles = [];
        }
        this.selectedFiles.push(file);
        file.isSelected = true;
    }
}
FileBrowserComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmMobileFileBrowser]',
                template: "<div class=\"app-file-browser\" *ngIf=\"isVisible && currentFolder\">\n    <div class=\"modal-backdrop fade\" [class.in]=\"isVisible\"></div>\n    <div class=\"modal fade\" style=\"display: block;\" [class.in]=\"isVisible\" >\n        <div class=\"modal-dialog\">\n            <div class=\"modal-content\">\n                <div class=\"modal-header clearfix\">\n                    <h4 class=\"modal-title pull-left\">\n                        <span (click)=\"onFileClick(currentFolder.parent)\" [hidden]=\"!!!currentFolder.parent\">\n                            <i class=\"wi wi-long-arrow-left\"></i>\n                        </span>\n                     {{currentFolder.name}}\n                    </h4>\n                    <div class=\"selected-file-button pull-right\" (click)=\"refreshFolder()\">\n                        <i class=\"wi wi-refresh\"></i>\n                    </div>\n                </div>\n                <div class=\"modal-body\">\n                    <div class=\"file-info-box\" *ngFor=\"let file of currentFolder.files\">\n                        <div class=\"file-info\"  [class.bg-primary]=\"file.isSelected\" (click)=\"onFileClick(file)\">\n                            <i class=\"file-icon wi wi-folder\" *ngIf=\"!file.isFile\"></i>\n                            <i class=\"file-icon wi wi-file {{getFileExtension(file.name)}}\" *ngIf=\"file.isFile\"></i>\n                            <span class=\"file-name\">{{file.name}}</span>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"modal-footer\">\n                    <button type=\"button\" class=\"btn btn-primary\" *ngIf=\"selectedFiles && selectedFiles.length > 0\" (click)=\"submit()\">\n                        Done <span class=\"badge badge-light\">{{selectedFiles.length}}</span>\n                    </button>\n                    <button type=\"button\" class=\"btn btn-default\" (click)=\"show = false;\">Close</button>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>"
            }] }
];
/** @nocollapse */
FileBrowserComponent.ctorParameters = () => [
    { type: DeviceService }
];
FileBrowserComponent.propDecorators = {
    fileTypeToSelect: [{ type: Input }],
    multiple: [{ type: Input }],
    submitEmitter: [{ type: Output, args: ['submit',] }]
};

class FileSelectorService {
    constructor(camera) {
        this.camera = camera;
    }
    selectAudio(multiple = false) {
        return new Promise((resolve, reject) => {
            // if multiple is true allows user to select multiple songs
            // if icloud is true will show iCloud songs
            (window['plugins']['mediapicker']).getAudio(resolve, reject, multiple, isIphone());
        }).then(files => {
            const filePaths = _.map(_.isArray(files) ? files : [files], 'exportedurl');
            return this.getFiles(filePaths);
        });
    }
    setFileBrowser(f) {
        this.fileBrowserComponent = f;
    }
    selectFiles(multiple = false, fileTypeToSelect) {
        if (!this.fileBrowserComponent) {
            return Promise.reject('File Browser component is not present.');
        }
        this.fileBrowserComponent.multiple = multiple;
        this.fileBrowserComponent.fileTypeToSelect = fileTypeToSelect;
        this.fileBrowserComponent.show = true;
        return new Promise((resolve, reject) => {
            const subscription = this.fileBrowserComponent.submitEmitter.subscribe(result => {
                return this.getFiles(_.map(result.files, 'path'))
                    .then(files => {
                    subscription.unsubscribe();
                    this.fileBrowserComponent.show = false;
                    resolve(files);
                }, () => {
                    subscription.unsubscribe();
                    this.fileBrowserComponent.show = false;
                    reject();
                });
            });
        });
    }
    selectImages(multiple = false) {
        const maxImg = multiple ? 10 : 1;
        return new Promise((resolve, reject) => {
            window.imagePicker.getPictures(resolve, reject, {
                mediaType: 0,
                maxImages: maxImg
            });
        }).then(files => {
            const selectedFiles = files.map(filepath => {
                if (filepath.indexOf('://') < 0) {
                    return 'file://' + filepath;
                }
                return filepath;
            });
            return this.getFiles(selectedFiles);
        });
    }
    selectVideos(multiple = false) {
        const cameraOptions = {
            destinationType: 1,
            sourceType: 0,
            mediaType: 1 // allows video selection
        };
        return this.camera.getPicture(cameraOptions)
            .then(filepath => {
            if (filepath.indexOf('://') < 0) {
                filepath = 'file://' + filepath;
            }
            return this.getFiles([filepath]);
        });
    }
    /**
     * Converts the file to blob using filepath
     * @param filePaths, array of file paths
     * @returns fileObj having name, path, content
     */
    getFiles(filePaths) {
        return Promise.all(_.map(filePaths, filePath => convertToBlob(filePath)))
            .then(filesList => {
            return _.map(filesList, fileObj => {
                const path = fileObj.filepath;
                return {
                    name: path.split('/').pop(),
                    path: path,
                    content: fileObj.blob,
                    size: fileObj.blob.size
                };
            });
        });
    }
}
FileSelectorService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
FileSelectorService.ctorParameters = () => [
    { type: Camera }
];
FileSelectorService.ngInjectableDef = defineInjectable({ factory: function FileSelectorService_Factory() { return new FileSelectorService(inject(Camera)); }, token: FileSelectorService, providedIn: "root" });

class FileUploadDirective {
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

const DEFAULT_IMAGE = 'resources/images/imagelists/default-image.png';
class ImageCacheDirective {
    constructor(componentInstance, deviceFileCacheService) {
        this.componentInstance = componentInstance;
        this.deviceFileCacheService = deviceFileCacheService;
        this._isEnabled = false;
        this._lastUrl = '';
    }
    ngDoCheck() {
        if (this._isEnabled && this.componentInstance.imgSource && this.componentInstance.imgSource.startsWith('http')) {
            if (this._lastUrl !== this.componentInstance.imgSource) {
                this._lastUrl = this.componentInstance.imgSource;
                this.componentInstance.imgSource = DEFAULT_IMAGE;
                this.getLocalPath(this._lastUrl).then((localPath) => {
                    this._cacheUrl = localPath;
                    this.componentInstance.imgSource = this._cacheUrl;
                });
            }
            else if (this._cacheUrl) {
                this.componentInstance.imgSource = this._cacheUrl;
            }
        }
    }
    set wmImageCache(val) {
        this._isEnabled = (hasCordova() && val === 'true');
    }
    getLocalPath(val) {
        if (hasCordova() && val && val.indexOf('{{') < 0 && val.startsWith('http')) {
            return this.deviceFileCacheService.getLocalPath(val, true, true)
                .catch(noop);
        }
        return Promise.resolve(val);
    }
}
ImageCacheDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmImageCache]'
            },] }
];
/** @nocollapse */
ImageCacheDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] },
    { type: DeviceFileCacheService }
];
ImageCacheDirective.propDecorators = {
    wmImageCache: [{ type: Input }]
};

const registerProps$2 = () => {
    register('wm-media-list', new Map([
        ['class', PROP_STRING],
        ['dataset', PROP_ANY],
        ['layout', Object.assign({ value: 'Single-row' }, PROP_STRING)],
        ['mediaurl', PROP_STRING],
        ['name', PROP_STRING],
        ['offline', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['thumbnailheight', Object.assign({ value: '100pt' }, PROP_STRING)],
        ['thumbnailwidth', Object.assign({ value: '100pt' }, PROP_STRING)],
        ['thumbnailurl', PROP_STRING],
    ]));
};

const DEFAULT_CLS$3 = 'app-medialist';
const WIDGET_CONFIG$2 = { widgetType: 'wm-media-list', hostClass: DEFAULT_CLS$3 };
var Layout;
(function (Layout) {
    Layout["SINGLE_ROW"] = "Single-row";
    Layout["MULTI_ROW"] = "Multi-row";
})(Layout || (Layout = {}));
class MediaListComponent extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG$2);
        this.selectedMediaIndex = -1;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }
    appendToBody() {
        if (!this.$fullScreenEle) {
            setTimeout(() => {
                this.$fullScreenEle = this.$element.find('>.app-media-fullscreen');
                this.$fullScreenEle.appendTo('body:first');
            }, 100);
        }
        return true;
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'dataset') {
            this.onDataChange(nv);
        }
        else if (key === 'layout') {
            if (nv === Layout.SINGLE_ROW) {
                addClass(this.nativeElement, 'singlerow');
            }
            else {
                removeClass(this.nativeElement, 'singlerow');
            }
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    exitFullScreen() {
        this.selectedMediaIndex = -1;
        this.$fullScreenEle.appendTo(this.$element);
        this.$fullScreenEle = null;
        $appDigest();
    }
    getPicTitle() {
        return this.selectedMediaIndex + 1 + '/' + this.fieldDefs.length;
    }
    showFullScreen(i) {
        this.selectedMediaIndex = i;
        $appDigest();
    }
    showNext() {
        if (this.selectedMediaIndex < this.fieldDefs.length - 1) {
            this.selectedMediaIndex++;
            $appDigest();
        }
    }
    // Returns the field value (src) from the fieldDefs
    getSrc(field) {
        if (field) {
            return this.fieldDefs[this.selectedMediaIndex][field];
        }
        return '';
    }
    showPrev() {
        if (this.selectedMediaIndex > 0) {
            this.selectedMediaIndex--;
            $appDigest();
        }
    }
    onDataChange(nv) {
        if (nv) {
            if (isObject(nv) && !isArray(nv)) {
                nv = [nv];
            }
            if (!this.binddataset) {
                if (isString(nv)) {
                    nv = nv.split(',');
                }
            }
            if (isArray(nv)) {
                this.updateFieldDefs(nv);
            }
        }
        else {
            this.updateFieldDefs([]);
        }
    }
    /** With given data, creates media list items*/
    updateFieldDefs(data) {
        this.fieldDefs = data;
        data.forEach(field => {
            field.mediaUrlVal = $parseExpr(this.mediaurl)(field);
            field.thumbnailUrlVal = $parseExpr(this.thumbnailurl)(field);
        });
        this.fieldDefs = data;
    }
    /**
     * used to track list items by Index.
     * @param {number} index value of the list item
     * @returns {number} index.
     */
    listTrackByFn(index) {
        return index;
    }
}
MediaListComponent.initializeProps = registerProps$2();
MediaListComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmMediaList]',
                template: "<ul class=\"list-unstyled list-inline app-media-thumbnail\">\n    <li *ngFor=\"let item of fieldDefs; index as index;\" [ngStyle]=\"{width: thumbnailwidth, height: thumbnailheight}\" (click)=\"showFullScreen(index)\">\n        <div class=\"thumbnail\">\n            <ng-container [ngTemplateOutlet]=\"imgTemplate\"\n                          [ngTemplateOutletContext]=\"{src: item.thumbnailUrlVal, class: 'thumbnail-image'}\">\n            </ng-container>\n            <div class=\"thumbnail-details\">\n                <ng-container [ngTemplateOutlet]=\"mediaListTemplate\" [ngTemplateOutletContext]=\"{item:item, index:index}\" [wmMediaListItem]=\"item\">\n                </ng-container>\n            </div>\n        </div>\n    </li>\n</ul>\n<div class=\"app-media-fullscreen\" *ngIf=\"selectedMediaIndex >= 0 && appendToBody()\">\n    <header wmMobileNavbar\n            backbutton=\"true\"\n            backbtnclick.event=\"exitFullScreen()\"\n            showLeftnavbtn=\"false\"\n            backbuttoniconclass.event=\"wi wi-chevron-left\"\n            title.bind=\"getPicTitle()\">\n    </header>\n    <div wmContent>\n        <div wmPageContent>\n            <div class=\"media-content\">\n                <div class=\"image-container\"  (swipeleft)=\"showNext()\" (swiperight)=\"showPrev()\">\n                    <ng-container [ngTemplateOutlet]=\"imgTemplate\"\n                                  [ngTemplateOutletContext]=\"{field: 'mediaUrlVal', class: 'center-block'}\">\n                    </ng-container>\n                    <a class=\"app-media-fullscreen-nav-control left\" [hidden]=\"!(selectedMediaIndex > 0)\" (click)=\"showPrev()\">\n                        <i class=\"wi wi-chevron-left\"></i>\n                    </a>\n                    <a class=\"app-media-fullscreen-nav-control right\" [hidden]=\"!(selectedMediaIndex < fieldDefs.length-1)\" (click)=\"showNext()\">\n                        <i class=\"wi wi-chevron-right\"></i>\n                    </a>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n\n<ng-template #imgTemplate let-src=\"src\" let-classname=\"class\" let-field=\"field\">\n    <img wmPicture class=\"{{classname}}\" picturesource.bind=\"src || getSrc(field)\" wmImageCache=\"{{offline}}\" />\n</ng-template>",
                providers: [
                    provideAsWidgetRef(MediaListComponent)
                ]
            }] }
];
/** @nocollapse */
MediaListComponent.ctorParameters = () => [
    { type: Injector }
];
MediaListComponent.propDecorators = {
    mediaListTemplate: [{ type: ContentChild, args: ['mediaListTemplate',] }]
};

class MediaListItemDirective {
    set wmMediaListItem(val) {
        this.item = val;
    }
}
MediaListItemDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmMediaListItem]',
                providers: [
                    provideAsWidgetRef(MediaListItemDirective)
                ]
            },] }
];
MediaListItemDirective.propDecorators = {
    wmMediaListItem: [{ type: Input }]
};

class MobileLeftPanelDirective {
    constructor(page, leftPanelRef, deviceService, elRef) {
        this.page = page;
        this.leftPanelRef = leftPanelRef;
        this.deviceService = deviceService;
        addClass(elRef.nativeElement, 'wm-mobile-app-left-panel');
        page.notify('wmLeftPanel:ready', leftPanelRef);
        page.subscribe('wmLeftPanel:expand', () => {
            this._backBtnListenerDestroyer = deviceService.onBackButtonTap(() => {
                leftPanelRef.collapse();
                return false;
            });
        });
        page.subscribe('wmLeftPanel:collapse', () => {
            this.destroyBackBtnListener();
        });
    }
    ngOnDestroy() {
        this.destroyBackBtnListener();
    }
    destroyBackBtnListener() {
        if (this._backBtnListenerDestroyer) {
            this._backBtnListenerDestroyer();
            this._backBtnListenerDestroyer = null;
        }
    }
}
MobileLeftPanelDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmLeftPanel]'
            },] }
];
/** @nocollapse */
MobileLeftPanelDirective.ctorParameters = () => [
    { type: PageDirective },
    { type: LeftPanelDirective },
    { type: DeviceService },
    { type: ElementRef }
];

class MobilePageDirective {
    constructor(app, elRef, deviceService, page, navigationService) {
        this.deviceService = deviceService;
        this.page = page;
        this.navigationService = navigationService;
        addClass(elRef.nativeElement, 'mobile-app-page');
        this._$ele = $(elRef.nativeElement);
        page.subscribe('wmMobileTabbar:ready', () => this._$ele.addClass('has-tabbar'));
        // add backbutton listener on every page.
        deviceService.onBackButtonTap($event => {
            if (app.landingPageName === app.activePageName) {
                window.navigator['app'].exitApp();
            }
            else {
                this.navigationService.goToPrevious();
            }
            return false;
        });
    }
}
MobilePageDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmPage]'
            },] }
];
/** @nocollapse */
MobilePageDirective.ctorParameters = () => [
    { type: App },
    { type: ElementRef },
    { type: DeviceService },
    { type: PageDirective },
    { type: AbstractNavigationService }
];

const navbarProps = new Map([
    ['backbutton', Object.assign({ value: true }, PROP_BOOLEAN)],
    ['backbuttoniconclass', Object.assign({ value: 'wi wi-back' }, PROP_STRING)],
    ['backbuttonlabel', Object.assign({ value: '' }, PROP_STRING)],
    ['backgroundattachment', PROP_STRING],
    ['backgroundcolor', PROP_STRING],
    ['backgroundgradient', PROP_STRING],
    ['backgroundimage', PROP_STRING],
    ['backgroundposition', PROP_STRING],
    ['backgroundrepeat', PROP_STRING],
    ['backgroundsize', PROP_STRING],
    ['class', PROP_STRING],
    ['datafield', Object.assign({ value: 'All Fields' }, PROP_STRING)],
    ['dataset', PROP_ANY],
    ['datasource', PROP_STRING],
    ['datavalue', PROP_STRING],
    ['debouncetime', Object.assign({ value: 250 }, PROP_NUMBER)],
    ['defaultview', PROP_STRING],
    ['displayimagesrc', PROP_STRING],
    ['displaylabel', PROP_STRING],
    ['imgsrc', PROP_STRING],
    ['query', Object.assign({ value: '' }, PROP_STRING)],
    ['leftnavpaneliconclass', Object.assign({ value: 'wi wi-menu' }, PROP_STRING)],
    ['matchmode', PROP_STRING],
    ['name', PROP_STRING],
    ['readonlySearchBar', PROP_BOOLEAN],
    ['searchbutton', Object.assign({ value: false }, PROP_BOOLEAN)],
    ['searchbuttoniconclass', Object.assign({ value: 'wi wi-search' }, PROP_STRING)],
    ['searchbuttonlabel', Object.assign({ value: '' }, PROP_STRING)],
    ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
    ['showLeftnavbtn', Object.assign({ value: true }, PROP_BOOLEAN)],
    ['searchkey', PROP_STRING],
    ['searchplaceholder', Object.assign({ value: 'Search' }, PROP_STRING)],
    ['showSearchbar', PROP_BOOLEAN],
    ['title', PROP_STRING]
]);
const registerProps$3 = () => {
    register('wm-mobile-navbar', navbarProps);
};

const DEFAULT_CLS$4 = 'app-mobile-header app-mobile-navbar';
const WIDGET_CONFIG$3 = { widgetType: 'wm-mobile-navbar', hostClass: DEFAULT_CLS$4 };
class MobileNavbarComponent extends BaseComponent {
    constructor(app, page, deviceService, navigationService, inj, backbtnClickEvt) {
        super(inj, WIDGET_CONFIG$3);
        this.page = page;
        this.deviceService = deviceService;
        this.navigationService = navigationService;
        this.backbtnClickEvt = backbtnClickEvt;
        this._isReady = false;
        page.subscribe('wmLeftPanel:ready', (leftNavPanel) => {
            if (this.showLeftnavbtn) {
                this.leftNavPanel = leftNavPanel;
            }
        });
        this._backBtnListenerDestroyer = deviceService.onBackButtonTap($event => {
            if (this._isReady) {
                if (this.backbtnClickEvt) {
                    this.invokeEventCallback('backbtnclick', { $event });
                    return false;
                }
            }
        });
        setTimeout(() => this._isReady = true, 1000);
    }
    // getter setter is added to pass the datasource to searchcomponent.
    get datasource() {
        return this._datasource;
    }
    set datasource(nv) {
        this._datasource = nv;
        this.searchComponent.datasource = nv;
    }
    ngAfterViewInit() {
        this.searchComponent.binddisplayimagesrc = this.binddisplayimagesrc;
        this.searchComponent.displayimagesrc = this.binddisplayimagesrc ? this.binddisplayimagesrc : this.displayimagesrc;
        this.searchComponent.displaylabel = this.binddisplaylabel ? this.binddisplaylabel : this.displaylabel;
        this.searchComponent.datafield = this.datafield;
        this.searchComponent.binddataset = this.binddataset;
        this.searchComponent.dataset = this.dataset;
        this.searchComponent.searchkey = this.searchkey;
        this.searchComponent.datasource = this.datasource;
        this.searchComponent.matchmode = this.matchmode;
    }
    goBack($event) {
        /**
         * TODO: while trying navigating from details page to edit page in wavereads, app is navigating
         * as details -> editPage -> details. For now, keeping this callback to react after 1 second.
         */
        this.deviceService.executeBackTapListeners($event);
    }
    ngOnDestroy() {
        this._backBtnListenerDestroyer();
        super.ngOnDestroy();
    }
    onPropertyChange(key, nv, ov) {
        if (this.searchComponent) {
            if (key === 'datafield') {
                this.searchComponent.datafield = this.datafield;
            }
            if (key === 'displaylabel') {
                this.searchComponent.displaylabel = this.binddisplaylabel ? this.binddisplaylabel : this.displaylabel;
            }
        }
        if (key === 'imgsrc') {
            this.imagesrc = getImageUrl(nv);
        }
        else if (key === 'dataset') ;
        else if (key === 'defaultview') {
            this.showSearchbar = (nv === 'searchview');
        }
        else if (key === 'datavalue') {
            this.query = nv;
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    onSubmission($event) {
        this.invokeEventCallback('search', { $event });
    }
    // switches the view based on defaultview
    switchView(view) {
        this.showSearchbar = (view !== 'actionview');
    }
    // goto previous view or page
    goBacktoPreviousView($event) {
        if (this.defaultview === 'actionview') {
            // switches the view from search to action or action to search.
            this.switchView('actionview');
        }
        else {
            // goes back to the previous visited page.
            this.goBack($event);
        }
    }
    onSelect($event, widget, selectedValue) {
        this.datavalue = selectedValue;
        this.query = widget.query;
        this.invokeEventCallback('change', {
            $event,
            newVal: selectedValue,
            oldVal: widget.prevDatavalue
        });
    }
    onClear() {
        this.datavalue = '';
        this.query = '';
    }
}
MobileNavbarComponent.initializeProps = registerProps$3();
MobileNavbarComponent.decorators = [
    { type: Component, args: [{
                selector: 'header[wmMobileNavbar]',
                template: "<nav class=\"navbar\" *ngIf=\"!showSearchbar\">\n    <div class=\"mobile-navbar-left\">\n        <ul class=\"nav navbar-nav navbar-left\">\n            <li *ngIf=\"leftNavPanel\" >\n                <a (click)=\"leftNavPanel.toggle();\"  href=\"javascript: void(0);\">\n                    <i [ngClass]=\"leftnavpaneliconclass\"></i>\n                    </a>\n                </li>\n            <li *ngIf=\"backbutton\">\n                <a class=\"btn-back\" type=\"button\" (click)=\"goBack($event)\"  href=\"javascript: void(0);\">\n                    <i [ngClass]=\"backbuttoniconclass\"></i><span [innerText]=\"backbuttonlabel\"></span>\n                </a>\n            </li>\n        </ul>\n    </div>\n    <div class=\"mobile-navbar-center\">\n        <div class=\"navbar-header\">\n            <h1 class=\"navbar-brand\">\n                <img data-identifier=\"img\" class=\"brand-image\" [alt]=\"title\" width=\"32\" height=\"32\" *ngIf=\"imgsrc\" [src]=\"imgsrc\"/>\n                <span class=\"title\" [innerText]=\"title || ''\"></span>\n                </h1>\n            </div>\n        </div>\n    <div class=\"mobile-navbar-right\">\n        <ul class=\"nav navbar-nav navbar-right\">\n            <li>\n                <ng-content></ng-content>\n            </li>\n            <li *ngIf=\"searchbutton\">\n                <a class=\"btn-search btn-transparent\" type=\"button\" (click)=\"showSearchbar = true\"  href=\"javascript: void(0);\">\n                    <i [ngClass]=\"searchbuttoniconclass\"></i><span [innerText]=\"searchbuttonlabel\"></span>\n                </a>\n            </li>\n        </ul>\n    </div>\n</nav>\n<nav class=\"navbar searchbar\" [hidden]=\"!showSearchbar\">\n    <div class=\"mobile-navbar-left\">\n        <ul class=\"nav navbar-nav navbar-left\">\n            <li>\n                <a class=\"btn-back\" type=\"button\" (click)=\"goBacktoPreviousView($event)\" href=\"javascript:void(0);\">\n                    <i [ngClass]=\"backbuttoniconclass\"></i>\n                </a>\n            </li>\n        </ul>\n    </div>\n    <div class=\"mobile-navbar-center search-container\">\n        <div wmSearch query.bind=\"query\"\n             clearsearch.event=\"onClear();\"\n             select.event=\"onSelect($event, widget, selectedValue)\"\n             searchkey.bind=\"searchkey\"\n             dataset.bind=\"dataset\"\n             displayimagesrc.bind=\"displayimagesrc\"\n             datavalue.bind=\"datavalue\"\n             submit.event=\"onSubmission($event, widget, value)\"\n             placeholder.bind=\"searchplaceholder\"\n             navsearchbar=\"true\"\n             readonly.bind=\"readonlySearchBar\">\n        </div>\n    </div>\n    <div class=\"mobile-navbar-right\">\n        <ul class=\"nav navbar-nav navbar-right\">\n            <li>\n                <a class=\"btn-cancel btn-transparent\" type=\"button\" (click)=\"showSearchbar = false;\"  href=\"javascript: void(0);\"> Cancel </a>\n            </li>\n        </ul>\n    </div>\n</nav>",
                providers: [
                    provideAsWidgetRef(MobileNavbarComponent)
                ]
            }] }
];
/** @nocollapse */
MobileNavbarComponent.ctorParameters = () => [
    { type: App },
    { type: PageDirective },
    { type: DeviceService },
    { type: AbstractNavigationService },
    { type: Injector },
    { type: undefined, decorators: [{ type: Attribute, args: ['backbtnclick.event',] }] }
];
MobileNavbarComponent.propDecorators = {
    searchComponent: [{ type: ViewChild, args: [SearchComponent,] }]
};

const registerProps$4 = () => {
    register('wm-network-info-toaster', new Map([]));
};

const DEFAULT_CLS$5 = 'network-info-toaster';
const WIDGET_CONFIG$4 = { widgetType: 'wm-network-info-toaster', hostClass: DEFAULT_CLS$5 };
var NetworkState;
(function (NetworkState) {
    NetworkState[NetworkState["CONNECTED"] = 1] = "CONNECTED";
    NetworkState[NetworkState["CONNECTING"] = 0] = "CONNECTING";
    NetworkState[NetworkState["SERVICE_AVAILABLE_BUT_NOT_CONNECTED"] = -1] = "SERVICE_AVAILABLE_BUT_NOT_CONNECTED";
    NetworkState[NetworkState["NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE"] = -2] = "NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE";
    NetworkState[NetworkState["NETWORK_NOT_AVAIABLE"] = -3] = "NETWORK_NOT_AVAIABLE";
})(NetworkState || (NetworkState = {}));
class NetworkInfoToasterComponent extends StylableComponent {
    constructor(networkService, app, inj) {
        super(inj, WIDGET_CONFIG$4);
        this.networkService = networkService;
        this.showMessage = false;
        this.isServiceConnected = false;
        this.isServiceAvailable = false;
        styler(this.$element, this);
        this.isServiceAvailable = this.networkService.isAvailable();
        this.isServiceConnected = this.networkService.isConnected();
        this._listenerDestroyer = app.subscribe('onNetworkStateChange', (data) => {
            const oldState = this.networkState;
            let autoHide = false;
            if (data.isConnected) {
                this.networkState = NetworkState.CONNECTED;
                autoHide = true;
            }
            else if (data.isConnecting) {
                this.networkState = NetworkState.CONNECTING;
            }
            else if (data.isServiceAvailable) {
                this.networkState = NetworkState.SERVICE_AVAILABLE_BUT_NOT_CONNECTED;
            }
            else if (data.isNetworkAvailable && !data.isServiceAvailable) {
                this.networkState = NetworkState.NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE;
            }
            else {
                this.networkState = NetworkState.NETWORK_NOT_AVAIABLE;
            }
            this.showMessage = (!(oldState === undefined && data.isConnected) && oldState !== this.networkState);
            if (autoHide && this.showMessage) {
                setTimeout(() => {
                    this.showMessage = false;
                    $appDigest();
                }, 5000);
            }
        });
    }
    connect() {
        this.networkService.connect();
    }
    hideMessage() {
        this.showMessage = false;
    }
    ngOnDestroy() {
        this._listenerDestroyer();
        super.ngOnDestroy();
    }
}
NetworkInfoToasterComponent.initializeProps = registerProps$4();
NetworkInfoToasterComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmNetworkInfoToaster]',
                template: "<div class=\"network-info-toaster-content\" [ngSwitch]=\"networkState\" *ngIf=\"showMessage\">\n    <div class=\"info\" *ngSwitchCase=\"-3\">\n       <label class=\"message\" [textContent]=\"appLocale.MESSAGE_NETWORK_NOT_AVAILABLE\"></label>\n       <button class=\"btn btn-default hide-btn\" (click)=\"hideMessage()\" [textContent]=\"appLocale.LABEL_HIDE_NETWORK_INFO\"></button>\n    </div>\n    <div class=\"info\" *ngSwitchCase=\"-2\">\n       <label class=\"message\" [textContent]=\"appLocale.MESSAGE_SERVICE_NOT_AVAILABLE\"></label>\n       <button class=\"btn btn-default hide-btn\" (click)=\"hideMessage()\" [textContent]=\"appLocale.LABEL_HIDE_NETWORK_INFO\"></button>\n    </div>\n    <div class=\"info\" *ngSwitchCase=\"-1\">\n       <label class=\"message\" [textContent]=\"appLocale.MESSAGE_SERVICE_AVAILABLE\"></label>\n       <button class=\"btn btn-default hide-btn\" (click)=\"hideMessage()\" [textContent]=\"appLocale.LABEL_HIDE_NETWORK_INFO\"></button>\n       <button class=\"btn btn-primary connect-btn\" (click)=\"connect()\" [textContent]=\"appLocale.LABEL_CONNECT_TO_SERVICE\"></button>\n    </div>\n    <div class=\"info\" *ngSwitchCase=\"0\">\n       <label class=\"message\" [textContent]=\"appLocale.MESSAGE_SERVICE_CONNECTING\"></label>\n    </div>\n    <div class=\"info\" *ngSwitchCase=\"1\">\n       <label class=\"message\" [textContent]=\"appLocale.MESSAGE_SERVICE_CONNECTED\"></label>\n    </div>\n</div>",
                providers: [
                    provideAsWidgetRef(NetworkInfoToasterComponent)
                ]
            }] }
];
/** @nocollapse */
NetworkInfoToasterComponent.ctorParameters = () => [
    { type: NetworkService },
    { type: App },
    { type: Injector }
];

class PageContentLoaderComponent {
    constructor(el) {
        addClass(el.nativeElement, 'app-page-content-loader');
    }
}
PageContentLoaderComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmPageContentLoader]',
                template: "<div class=\"loader bg-primary\"></div>\n<div class=\"load-info\"></div>",
                providers: [
                    provideAsWidgetRef(PageContentLoaderComponent)
                ]
            }] }
];
/** @nocollapse */
PageContentLoaderComponent.ctorParameters = () => [
    { type: ElementRef }
];

const MAX_PROCESS = 3;
class ProcessManagerComponent {
    constructor(el) {
        this.el = el;
        this.isVisible = true;
        this.instances = [];
        this.queue = [];
        addClass(this.el.nativeElement, 'app-global-progress-bar modal default');
    }
    createInstance(name, min = 0, max = 100) {
        const instance = {
            max: max,
            min: min,
            name: name,
            onStop: null,
            progressLabel: '',
            show: min !== max,
            stopButtonLabel: 'Cancel',
            value: 0
        };
        const api = {
            get: (propertyName) => instance[propertyName],
            set: (propertyName, propertyValue) => this.setInstaceProperty(instance, propertyName, propertyValue),
            destroy: () => this.removeInstance(instance)
        };
        return this.addToQueue(instance).then(() => api);
    }
    getVisibleInstances() {
        return this.instances.filter(i => i.show);
    }
    ngDoCheck() {
        const hasInstancesToShow = !!this.instances.find(i => i.show);
        if (this.isVisible && !hasInstancesToShow) {
            setAttr(this.el.nativeElement, 'hidden', 'true');
            this.isVisible = false;
        }
        else if (!this.isVisible && hasInstancesToShow) {
            removeAttr(this.el.nativeElement, 'hidden');
            this.isVisible = true;
        }
    }
    addToQueue(instance) {
        return new Promise(resolve => {
            this.queue.push(() => {
                if (this.instances.length < MAX_PROCESS) {
                    this.instances.push(instance);
                    resolve(instance);
                }
                else {
                    return false;
                }
            });
            this.flushQueue();
        });
    }
    flushQueue() {
        if (this.queue.length > 0 && this.queue[0]() !== false) {
            this.queue.shift();
            this.flushQueue();
        }
    }
    removeInstance(instance) {
        return new Promise(resolve => {
            setTimeout(() => {
                _.remove(this.instances, instance);
                this.flushQueue();
                resolve();
            }, 1000);
        });
    }
    setInstaceProperty(instance, propertyName, propertyValue) {
        if (propertyName === 'value') {
            if (instance.value >= instance.max) {
                propertyValue = instance.max;
            }
            instance.value = propertyValue;
            instance.progressLabel = instance.value + '/' + instance.max;
        }
        else if (propertyName === 'onStop' && _.isFunction(propertyValue)) {
            instance.onStop = () => {
                propertyValue();
                return this.removeInstance(instance);
            };
        }
        else {
            instance[propertyName] = propertyValue;
        }
        instance.show = instance.min !== instance.max;
    }
}
ProcessManagerComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmProcessManager]',
                template: "<ng-container *ngIf=\"instances.length > 0\">\n   <div class=\"modal-dialog app-dialog\">\n       <div class=\"modal-content\">\n           <ul class=\"instance-list list-unstyled\">\n               <li *ngFor=\"let instance of getVisibleInstances(instances); index as i\" class=\"instance-list-item\">\n                   <div class=\"row\">\n                       <div class=\"col-xs-8\">\n                           <label class=\"app-global-progress-bar-name h6\">{{instance.name}}</label>\n                       </div>\n                       <div class=\"col-xs-4 app-global-progress-bar-progress-label-col\">\n                           <label class=\"app-global-progress-bar-progress-label h6\">\n                                   {{instance.progressLabel}}</label>\n                       </div>\n                   </div>\n                   <ng-template [ngTemplateOutlet]=\"progressTemplate\" [ngTemplateOutletContext]=\"{instance: instance}\"></ng-template>\n                   <button class=\"btn btn-secondary pull-right stop-btn\" *ngIf=\"instance.onStop\" (click)=\"instance.onStop();\">\n                       {{instance.stopButtonLabel}}\n                   </button>\n                   <div style=\"clear: both;\"></div>\n               </li>\n               <li class=\"instance-list-item\" *ngIf=\"queue.length > 0\">\n                   <label class=\"global-progress-bar-ui-primary-label h6\">\n                       ({{queue.length}}) queued\n                   </label>\n               </li>\n           </ul>\n       </div>\n   </div>\n</ng-container>\n<ng-template #progressTemplate let-instance=\"instance\">\n    <div wmProgressBar minvalue.bind=\"instance.min\" maxvalue.bind=\"instance.max\" datavalue.bind=\"instance.value\"></div>\n</ng-template>",
                providers: [
                    provideAsWidgetRef(ProcessManagerComponent)
                ]
            }] }
];
/** @nocollapse */
ProcessManagerComponent.ctorParameters = () => [
    { type: ElementRef }
];

class SearchDirective {
    constructor(elRef) {
        switchClass(elRef.nativeElement, 'app-mobile-search');
    }
}
SearchDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmSearch]'
            },] }
];
/** @nocollapse */
SearchDirective.ctorParameters = () => [
    { type: ElementRef }
];

const registerProps$5 = () => {
    register('wm-segment-content', new Map([
        ['caption', Object.assign({ value: '' }, PROP_STRING)],
        ['class', PROP_STRING],
        ['content', PROP_STRING],
        ['iconclass', Object.assign({ value: '' }, PROP_STRING)],
        ['loadmode', PROP_STRING],
        ['loaddelay', Object.assign({ value: 10 }, PROP_NUMBER)],
        ['name', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)]
    ]));
};

const registerProps$6 = () => {
    register('wm-segmented-control', new Map([
        ['class', PROP_STRING],
        ['name', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)]
    ]));
};

const DEFAULT_CLS$6 = 'app-segmented-control';
const WIDGET_CONFIG$5 = { widgetType: 'wm-segmented-control', hostClass: DEFAULT_CLS$6 };
class SegmentedControlComponent extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG$5);
        this.contents = [];
        this.currentSelectedIndex = 0;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }
    addContent(content) {
        this.contents.push(content);
    }
    goToNext() {
        this.showContent(this.currentSelectedIndex + 1);
    }
    goToPrev() {
        this.showContent(this.currentSelectedIndex - 1);
    }
    ngAfterViewInit() {
        this._$container = this.$element.find('>.app-segments-container');
        const childEls = this._$container.find('>.list-inline >li');
        const maxWidth = `${this.contents.length * 100}%`;
        setCSSFromObj(this._$container[0], {
            maxWidth: maxWidth,
            width: maxWidth,
            'white-space': 'nowrap',
            transition: 'transform 0.2s linear'
        });
        const width = `${100 / this.contents.length}%`;
        for (const child of Array.from(childEls)) {
            setCSS(child, 'width', width);
        }
        this.showContent(0, undefined, true);
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    removeContent(content) {
        const index = this.contents.findIndex(c => {
            return c === content;
        });
        if (index >= 0) {
            this.contents.splice(index, 1);
            if (index < this.contents.length) {
                this.showContent(index);
            }
            else if (this.contents.length > 0) {
                this.showContent(0);
            }
        }
    }
    showContent(content, $event, defaultLoad) {
        let index;
        let selectedContent;
        if (isNumber(content)) {
            index = content;
            if (this.contents.length) {
                selectedContent = this.contents[index];
            }
        }
        else {
            selectedContent = content;
            index = this.contents.findIndex(c => {
                return c === content;
            });
        }
        if (selectedContent) {
            selectedContent.loadContent(defaultLoad);
        }
        if (index < 0 || index >= this.contents.length) {
            return;
        }
        if ($event) {
            $event.stopPropagation();
        }
        const eventData = {
            $old: this.currentSelectedIndex,
            $new: index
        };
        this.currentSelectedIndex = index;
        this.invokeEventCallback('beforesegmentchange', eventData);
        setCSS(this._$container[0], 'transform', `translate3d(${-1 * index / this.contents.length * 100}%, 0, 0)`);
        this.invokeEventCallback('segmentchange', eventData);
    }
}
SegmentedControlComponent.initializeProps = registerProps$6();
SegmentedControlComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmSegmentedControl]',
                template: "<div class=\"app-segments-container\"> \n    <ul class=\"list-inline\">\n        <ng-content></ng-content>\n    </ul>\n    </div> \n<div class=\"btn-group btn-group-justified\"> \n    <a class=\"btn btn-default\" *ngFor=\"let content of contents; index as i\"\n       [ngClass]=\"{'active btn-primary' : i == currentSelectedIndex}\"\n       (click)=\"showContent(i, $event);\">\n        <i class=\"app-icon\" [ngClass]=\"content.iconclass\"></i>{{content.caption}}\n    </a> \n</div> ",
                providers: [
                    provideAsWidgetRef(SegmentedControlComponent)
                ]
            }] }
];
/** @nocollapse */
SegmentedControlComponent.ctorParameters = () => [
    { type: Injector }
];

const DEFAULT_CLS$7 = 'app-segment-content clearfix';
const WIDGET_CONFIG$6 = { widgetType: 'wm-segment-content', hostClass: DEFAULT_CLS$7 };
class SegmentContentComponent extends StylableComponent {
    constructor(segmentedControl, inj) {
        super(inj, WIDGET_CONFIG$6);
        this.segmentedControl = segmentedControl;
        this.compile = false;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        segmentedControl.addContent(this);
    }
    ngAfterViewInit() {
        // load the content on demand when loadmode is not specified
        if (!this.loadmode) {
            this.loadContent(true);
        }
    }
    navigate() {
        this.segmentedControl.showContent(this);
    }
    // sets the compile flag to load the content
    _loadContent() {
        if (!this.compile) {
            this.compile = true;
            this.invokeEventCallback('ready');
        }
    }
    loadContent(defaultLoad) {
        if (this.loadmode === 'after-delay' || defaultLoad) {
            setTimeout(this._loadContent.bind(this), defaultLoad ? 0 : this.loaddelay);
        }
        else {
            this._loadContent();
        }
    }
}
SegmentContentComponent.initializeProps = registerProps$5();
SegmentContentComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmSegmentContent]',
                template: "<ng-content *ngIf=\"compile\"></ng-content>",
                providers: [
                    provideAsWidgetRef(SegmentContentComponent)
                ]
            }] }
];
/** @nocollapse */
SegmentContentComponent.ctorParameters = () => [
    { type: SegmentedControlComponent },
    { type: Injector }
];

class TimeDirective {
    constructor(timeComponent) {
        timeComponent.useDatapicker = false;
    }
}
TimeDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmTime]'
            },] }
];
/** @nocollapse */
TimeDirective.ctorParameters = () => [
    { type: TimeComponent }
];

const registerProps$7 = () => {
    register('wm-mobile-tabbar', new Map([
        ['class', PROP_STRING],
        ['dataset', PROP_ANY],
        ['itemicon', PROP_STRING],
        ['itemlabel', PROP_STRING],
        ['itemlink', PROP_STRING],
        ['morebuttoniconclass', Object.assign({ value: 'wi wi-more-horiz' }, PROP_STRING)],
        ['morebuttonlabel', Object.assign({ value: 'more' }, PROP_STRING)],
        ['name', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)]
    ]));
};

const DEFAULT_CLS$8 = 'app-tabbar app-top-nav';
const WIDGET_CONFIG$7 = { widgetType: 'wm-mobile-tabbar', hostClass: DEFAULT_CLS$8 };
class MobileTabbarComponent extends StylableComponent {
    constructor(page, inj, binditemlabel, binditemicon, binditemlink) {
        super(inj, WIDGET_CONFIG$7);
        this.page = page;
        this.binditemlabel = binditemlabel;
        this.binditemicon = binditemicon;
        this.binditemlink = binditemlink;
        this.tabItems = [];
        this.layout = {};
        this._layouts = [
            { minwidth: 2048, max: 12 },
            { minwidth: 1024, max: 10 },
            { minwidth: 768, max: 7 },
            { minwidth: 480, max: 5 },
            { minwidth: 0, max: 4 }
        ];
        styler(this.nativeElement, this);
        page.notify('wmMobileTabbar:ready', this);
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'dataset') {
            if (nv) {
                this.tabItems = this.getTabItems(nv);
            }
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.layout = this.getSuitableLayout();
            $(window).on('resize.tabbar', _.debounce(() => this.layout = this.getSuitableLayout(), 20));
        });
        super.ngAfterViewInit();
    }
    ngOnDestroy() {
        $(window).off('.tabbar');
        super.ngOnDestroy();
    }
    // triggered on item selection
    onItemSelect($event, selectedItem) {
        this.invokeEventCallback('select', { $event, $item: selectedItem.value || selectedItem.label });
    }
    getItems(itemArray) {
        return itemArray.map(item => ({
            label: item,
            icon: 'wi wi-' + item
        }));
    }
    getSuitableLayout() {
        const avaiableWidth = $(this.nativeElement).parent().width();
        return this._layouts.find(l => avaiableWidth >= l.minwidth);
    }
    getTabItems(value) {
        if (_.isArray(value)) {
            if (_.isObject(value[0])) {
                return value.map(item => {
                    const link = getEvaluatedData(item, { expression: 'itemlink', 'bindExpression': this.binditemlink }, this.viewParent) || item.link;
                    const activePageName = window.location.hash.substr(2);
                    return {
                        label: getEvaluatedData(item, { expression: 'itemlabel', bindExpression: this.binditemlabel }, this.viewParent) || item.label,
                        icon: getEvaluatedData(item, { expression: 'itemicon', bindExpression: this.binditemicon }, this.viewParent) || item.icon,
                        link: link,
                        active: _.includes([activePageName, '#' + activePageName, '#/' + activePageName], link)
                    };
                });
            }
            else {
                return this.getItems(value);
            }
        }
        else if (_.isString(value)) {
            return this.getItems(value.split(','));
        }
    }
}
MobileTabbarComponent.initializeProps = registerProps$7();
MobileTabbarComponent.decorators = [
    { type: Component, args: [{
                selector: 'div[wmMobileTabbar]',
                template: "<nav class=\"navbar navbar-default\">\n    <ul class=\"tab-items nav navbar-nav\">\n        <li class=\"tab-item\" *ngFor=\"let item of tabItems; index as i\" [class.hidden]=\"!(tabItems.length === layout.max || i < layout.max)\" >\n            <a [class.active]=\"item.active\" [href]=\"(item.link || 'javascript:void(0)')| trustAs: 'resource'\" (click)=\"onItemSelect($event, item)\">\n                <i class=\"app-icon\" [ngClass]=\"item.icon\"></i><label>{{item.label}}</label>\n            </a>\n        </li>\n        <li class=\"menu-items dropdown\" [class.hidden]=\"tabItems.length <= layout.max\" [ngClass]=\"{dropup : position === bottom}\">\n            <a (click)=\"showMoreMenu = !showMoreMenu\" href=\"javascript:void(0)\">\n                <i class=\"app-icon {{morebuttoniconclass}}\"></i><label>{{morebuttonlabel}}</label>\n            </a>\n            <ul class=\"dropdown-menu dropdown-menu-right\" [ngClass]=\"{'nav navbar-nav' : menutype === thumbnail}\" *ngIf=\"showMoreMenu\">\n                <li role=\"menuitem\" class=\"menu-item\" *ngFor=\"let item of tabItems;index as i\" [class.hidden]=\"i < layout.max\">\n                    <a [ngClass]=\"{active : item.active}\" [href]=\"(item.link || 'javascript:void(0)')| trustAs: 'resource'\" (click)=\"onItemSelect($event, item)\" class=\"dropdown-item\">\n                        <i class=\"app-icon\" [ngClass]=\"item.icon\"></i><label>{{item.label}}</label>\n                    </a>\n                </li>\n            </ul>\n        </li>\n    </ul>\n</nav>\n",
                providers: [
                    provideAsWidgetRef(MobileTabbarComponent)
                ]
            }] }
];
/** @nocollapse */
MobileTabbarComponent.ctorParameters = () => [
    { type: PageDirective },
    { type: Injector },
    { type: undefined, decorators: [{ type: Attribute, args: ['itemlabel.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['itemicon.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['itemicon.bind',] }] }
];

const registerProps$8 = () => {
    register('wm-widget-template', new Map([
        ['name', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)]
    ]));
};

const DEFAULT_CLS$9 = 'app-widget-template';
const WIDGET_CONFIG$8 = { widgetType: 'wm-widget-template', hostClass: DEFAULT_CLS$9 };
class WidgetTemplateComponent extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG$8);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
WidgetTemplateComponent.initializeProps = registerProps$8();
WidgetTemplateComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmWidgetTemplate]',
                template: "<span>Widget Template</span>",
                providers: [
                    provideAsWidgetRef(WidgetTemplateComponent)
                ]
            }] }
];
/** @nocollapse */
WidgetTemplateComponent.ctorParameters = () => [
    { type: Injector }
];

const wmMobileComponents = [
    AnchorDirective,
    AppUpdateComponent,
    BarcodeScannerComponent,
    CameraComponent,
    DateDirective,
    DateTimeDirective,
    FileBrowserComponent,
    FileUploadDirective,
    ImageCacheDirective,
    MediaListComponent,
    MediaListItemDirective,
    MobileLeftPanelDirective,
    MobileNavbarComponent,
    MobilePageDirective,
    MobileTabbarComponent,
    NetworkInfoToasterComponent,
    PageContentLoaderComponent,
    ProcessManagerComponent,
    SearchDirective,
    SegmentContentComponent,
    SegmentedControlComponent,
    TimeDirective,
    WidgetTemplateComponent
];
const PIPES = [];
class WmMobileComponentsModule {
}
WmMobileComponentsModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    WmComponentsModule
                ],
                declarations: [...wmMobileComponents, ...PIPES],
                exports: [...wmMobileComponents, ...PIPES],
                providers: [
                // add providers to mobile-runtime module.
                ],
                entryComponents: []
            },] }
];

class ProcessManagementService {
    setUIComponent(processManagerComponent) {
        this.processManagerComponent = processManagerComponent;
    }
    /**
     * Returns a promise that will be resolved when an instance is available. At max, 3 instances can only run
     * in parallel and rest has to wait till a process is completed.
     *
     * A progress instance has the following properties.
     *
     *   1) min {number} minimum value, default value is 0 </br>
     *   2) max {number} maximum value, default value is 100 </br>
     *   3) value {number} progress value </br>
     *   4) progressLabel {string} process name </br>
     *   5) stopButtonLabel {string} label for stop button, default value is 'Cancel' </br>
     *   6) onStop {function} function to invoke when stop button is clicked. </br>
     *
     * A progress instance has 3 methods </br>
     *   1) set(property, value) -- sets value to the corresponding property </br>
     *   2) get(property) -- returns property value </br>
     *   3) destroy() -- closes the instance. </br>
     *
     * A progress instance will get auto closed when value and max are equal or when destroy method is called.
     *
     * @param {string} name name of the process whose progress is going to be shown
     * @param {number} min minimum value
     * @param {number} max maximum value
     *
     * @returns {object} a promise
     */
    createInstance(name, min, max) {
        if (!this.processManagerComponent) {
            return Promise.reject('ProcessManagerComponent is missing');
        }
        return this.processManagerComponent.createInstance(name, min, max);
    }
}
ProcessManagementService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
ProcessManagementService.ngInjectableDef = defineInjectable({ factory: function ProcessManagementService_Factory() { return new ProcessManagementService(); }, token: ProcessManagementService, providedIn: "root" });

/**
 * Generated bundle index. Do not edit.
 */

export { AnchorDirective as ɵa, AppUpdateComponent as ɵb, BarcodeScannerComponent as ɵc, CameraComponent as ɵd, DateTimeDirective as ɵf, DateDirective as ɵe, FileUploadDirective as ɵg, ImageCacheDirective as ɵh, MobileLeftPanelDirective as ɵk, MediaListItemDirective as ɵj, MediaListComponent as ɵi, MobileNavbarComponent as ɵl, NetworkInfoToasterComponent as ɵo, PageContentLoaderComponent as ɵp, MobilePageDirective as ɵm, SearchDirective as ɵq, SegmentContentComponent as ɵr, SegmentedControlComponent as ɵs, MobileTabbarComponent as ɵn, TimeDirective as ɵt, WidgetTemplateComponent as ɵu, WmMobileComponentsModule, FileSelectorService, ProcessManagementService, FileBrowserComponent, ProcessManagerComponent };

//# sourceMappingURL=index.js.map