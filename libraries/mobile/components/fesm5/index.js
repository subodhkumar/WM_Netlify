import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { MediaCapture } from '@ionic-native/media-capture';
import { Camera } from '@ionic-native/camera';
import { DeviceFileDownloadService, DeviceService, DeviceFileCacheService, NetworkService } from '@wm/mobile/core';
import { addClass, hasCordova, noop, removeClass, setCSS, convertToBlob, $appDigest, isIos, isIphone, $parseExpr, isArray, isObject, isString, AbstractNavigationService, App, removeAttr, setAttr, switchClass, isNumber, setCSSFromObj } from '@wm/core';
import { __extends, __values, __assign, __spread } from 'tslib';
import { WidgetRef, PROP_BOOLEAN, PROP_STRING, register, APPLY_STYLES_TYPE, provideAsWidgetRef, StylableComponent, styler, PROP_NUMBER, DateComponent, DatetimeComponent, FileUploadComponent, PROP_ANY, LeftPanelDirective, PageDirective, BaseComponent, getImageUrl, SearchComponent, TimeComponent, getEvaluatedData, WmComponentsModule } from '@wm/components';
import { Directive, HostListener, Inject, Component, ElementRef, Injector, ChangeDetectorRef, EventEmitter, Input, Output, Injectable, Self, ContentChild, Attribute, ViewChild, defineInjectable, NgModule, inject } from '@angular/core';

var AnchorDirective = /** @class */ (function () {
    function AnchorDirective(widget) {
        this.widget = widget;
    }
    AnchorDirective.prototype.onClick = function () {
        var href = this.widget.hyperlink;
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
    };
    AnchorDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmAnchor]'
                },] }
    ];
    /** @nocollapse */
    AnchorDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [WidgetRef,] }] }
    ]; };
    AnchorDirective.propDecorators = {
        onClick: [{ type: HostListener, args: ['click',] }]
    };
    return AnchorDirective;
}());

var DEFAULT_CLS = 'app-update-dialog modal fade in hidden';
var AUTO_UPDATE_FILENAME = 'app-auto-update.apk';
var AppUpdateComponent = /** @class */ (function () {
    function AppUpdateComponent(deviceService, fileDownloadService, elRef, file, fileOpener, http) {
        var _this = this;
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
            this.getBuildMeta().then(function (buildMeta) {
                if (buildMeta && buildMeta.buildMode === 'DEVELOPMENT_MODE') {
                    _this.file.removeFile(cordova.file.externalApplicationStorageDirectory, AUTO_UPDATE_FILENAME).catch(noop);
                    _this.checkForUpdate()
                        .then(_this.getUserConfirmation.bind(_this), noop);
                }
            });
        }
    }
    AppUpdateComponent.prototype.cancel = function () {
        addClass(this.elRef.nativeElement, 'hidden');
    };
    AppUpdateComponent.prototype.installLatestVersion = function () {
        var _this = this;
        var apkFile = cordova.file.externalApplicationStorageDirectory + AUTO_UPDATE_FILENAME, downloadLink = this._buildMeta.host + "/appBuild/rest/mobileBuilds/android/download?token=" + this._buildMeta.token + "&buildNumber=" + this._buildMeta.latestBuildNumber + "&fileName=" + AUTO_UPDATE_FILENAME + "&releaseVersion=" + this._buildMeta.platformVersion, progressObserver = { next: function (e) { _this.downloadProgress = (e.loaded / e.total) * 100; }, error: null, complete: null };
        this.fileDownloadService.download(downloadLink, false, cordova.file.externalApplicationStorageDirectory, AUTO_UPDATE_FILENAME, progressObserver).then(function () {
            _this.fileOpener.open(apkFile, 'application/vnd.android.package-archive');
        }, function () {
            this.message = 'Failed to download latest version.';
        });
        this.message = "Downloading the latest version [" + this._buildMeta.latestVersion + "].";
        this.downloading = true;
    };
    AppUpdateComponent.prototype.checkForUpdate = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.http.get(_this._buildMeta.host + "/appBuild/rest/mobileBuilds/latest_build?token=" + _this._buildMeta.token + "&releaseVersion=" + _this._buildMeta.platformVersion)
                .toPromise()
                .then(function (response) {
                var latestBuildNumber = response.success.body.buildNumber, latestVersion = response.success.body.version;
                if (_this._buildMeta.buildNumber < latestBuildNumber) {
                    _this._buildMeta.latestBuildNumber = latestBuildNumber;
                    _this._buildMeta.latestVersion = latestVersion;
                    resolve(latestBuildNumber);
                }
                else {
                    reject();
                }
            }, reject);
        });
    };
    AppUpdateComponent.prototype.getBuildMeta = function () {
        var _this = this;
        if (!this._buildMeta) {
            return this.file.readAsText(cordova.file.applicationDirectory + 'www/', 'build_meta.json')
                .then(function (data) {
                _this._buildMeta = JSON.parse(data);
                return _this._buildMeta;
            }, noop);
        }
        return Promise.resolve(this._buildMeta);
    };
    AppUpdateComponent.prototype.getUserConfirmation = function () {
        this.downloadProgress = 0;
        this.downloading = false;
        this.message = 'There is an update available. Would you like to update the app?';
        removeClass(this.elRef.nativeElement, 'hidden');
    };
    AppUpdateComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmAppUpdate]',
                    template: "<div class=\"modal-dialog\">\n    <div class=\"modal-content\"> \n        <div class=\"modal-body\"> \n            <span [textContent]=\"message\"></span>\n            <div class=\"progress\" [hidden]=\"!downloading\">\n                <div class=\"progress-bar\" [style.width.%]=\"downloadProgress\"></div>\n            </div>\n        </div>\n        <div class=\"modal-footer\"> \n            <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\" (click)=\"cancel()\">Skip update</button>\n            <button type=\"button\" class=\"btn btn-primary\" [hidden]=\"downloading\" (click)=\"installLatestVersion()\">Update</button>\n        </div>\n    </div>\n</div>"
                }] }
    ];
    /** @nocollapse */
    AppUpdateComponent.ctorParameters = function () { return [
        { type: DeviceService },
        { type: DeviceFileDownloadService },
        { type: ElementRef },
        { type: File },
        { type: FileOpener },
        { type: HttpClient }
    ]; };
    return AppUpdateComponent;
}());

var registerProps = function () {
    register('wm-barcodescanner', new Map([
        ['barcodeformat', __assign({ value: 'ALL' }, PROP_STRING)],
        ['caption', __assign({ value: '' }, PROP_STRING)],
        ['class', PROP_STRING],
        ['iconclass', __assign({ value: 'glyphicon glyphicon-barcode' }, PROP_STRING)],
        ['iconsize', __assign({ value: '2em' }, PROP_STRING)],
        ['name', PROP_STRING],
        ['show', __assign({ value: true }, PROP_BOOLEAN)]
    ]));
};

var DEFAULT_CLS$1 = 'btn app-barcode';
var WIDGET_CONFIG = { widgetType: 'wm-barcodescanner', hostClass: DEFAULT_CLS$1 };
var BarcodeScannerComponent = /** @class */ (function (_super) {
    __extends(BarcodeScannerComponent, _super);
    function BarcodeScannerComponent(scanner, inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.scanner = scanner;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        return _this;
    }
    BarcodeScannerComponent.prototype.openBarcodescanner = function ($event) {
        var _this = this;
        this.scan().then(function (text) {
            _this.datavalue = text;
            _this.invokeEventCallback('success', { $event: $event });
        });
    };
    BarcodeScannerComponent.prototype.scan = function () {
        var options;
        if (hasCordova()) {
            if (this.barcodeformat && this.barcodeformat !== 'ALL') {
                options = {
                    formats: this.barcodeformat
                };
            }
            return this.scanner.scan(options)
                .then(function (data) { return data.text; });
        }
        return Promise.resolve('BAR_CODE');
    };
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
    BarcodeScannerComponent.ctorParameters = function () { return [
        { type: BarcodeScanner },
        { type: Injector }
    ]; };
    BarcodeScannerComponent.propDecorators = {
        openBarcodescanner: [{ type: HostListener, args: ['click', ['$event'],] }]
    };
    return BarcodeScannerComponent;
}(StylableComponent));

var registerProps$1 = function () {
    register('wm-camera', new Map([
        ['allowedit', __assign({ value: false }, PROP_BOOLEAN)],
        ['capturetype', __assign({ value: 'IMAGE' }, PROP_STRING)],
        ['caption', __assign({ value: '' }, PROP_STRING)],
        ['class', PROP_STRING],
        ['correctorientation', __assign({ value: false }, PROP_BOOLEAN)],
        ['datavalue', __assign({ value: '' }, PROP_STRING)],
        ['iconclass', __assign({ value: 'wi wi-photo-camera' }, PROP_STRING)],
        ['iconsize', __assign({ value: '2em' }, PROP_STRING)],
        ['imagequality', __assign({ value: 80 }, PROP_NUMBER)],
        ['imageencodingtype', __assign({ value: 'JPEG' }, PROP_STRING)],
        ['imagetargetwidth', PROP_NUMBER],
        ['imagetargetheight', PROP_NUMBER],
        ['localFile', __assign({ value: '' }, PROP_STRING)],
        ['localFilePath', __assign({ value: '' }, PROP_STRING)],
        ['name', PROP_STRING],
        ['savetogallery', __assign({ value: false }, PROP_BOOLEAN)],
        ['show', __assign({ value: true }, PROP_BOOLEAN)]
    ]));
};

var DEFAULT_CLS$2 = 'btn app-camera';
var WIDGET_CONFIG$1 = { widgetType: 'wm-camera', hostClass: DEFAULT_CLS$2 };
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
var CameraComponent = /** @class */ (function (_super) {
    __extends(CameraComponent, _super);
    function CameraComponent(camera, mediaCapture, inj, elRef, cdr) {
        var _this = _super.call(this, inj, WIDGET_CONFIG$1) || this;
        _this.camera = camera;
        _this.mediaCapture = mediaCapture;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        return _this;
    }
    CameraComponent.prototype.openCamera = function ($event) {
        var _this = this;
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
                    .then(function (path) { return _this.updateModel($event, path); });
            }
            else {
                this._cameraOptions = {
                    limit: 1
                };
                // start video capture
                this.mediaCapture.captureVideo(this._cameraOptions)
                    .then(function (mediaFiles) { return _this.updateModel($event, mediaFiles[0].fullPath); });
            }
        }
        else {
            this.invokeEventCallback('success', { $event: $event });
        }
    };
    CameraComponent.prototype.updateModel = function ($event, value) {
        var _this = this;
        this.localFilePath = this.datavalue = value;
        convertToBlob(value)
            .then(function (result) {
            _this.localFile = result.blob;
            _this.invokeEventCallback('success', { $event: $event, localFilePath: _this.localFilePath, localFile: _this.localFile });
        }, function () {
            _this.localFile = undefined;
        });
    };
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
    CameraComponent.ctorParameters = function () { return [
        { type: Camera },
        { type: MediaCapture },
        { type: Injector },
        { type: ElementRef },
        { type: ChangeDetectorRef }
    ]; };
    CameraComponent.propDecorators = {
        openCamera: [{ type: HostListener, args: ['click', ['$event'],] }]
    };
    return CameraComponent;
}(StylableComponent));

var DateDirective = /** @class */ (function () {
    function DateDirective(dateComponent) {
        dateComponent.useDatapicker = false;
        dateComponent.datepattern = 'yyyy-MM-dd';
        dateComponent.updateFormat('datepattern');
    }
    DateDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmDate]'
                },] }
    ];
    /** @nocollapse */
    DateDirective.ctorParameters = function () { return [
        { type: DateComponent }
    ]; };
    return DateDirective;
}());

var DateTimeDirective = /** @class */ (function () {
    function DateTimeDirective(dateTimeComponent) {
        dateTimeComponent.useDatapicker = false;
        dateTimeComponent.datepattern = 'yyyy-MM-ddTHH:mm:ss';
        dateTimeComponent.updateFormat('datepattern');
    }
    DateTimeDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmDateTime]'
                },] }
    ];
    /** @nocollapse */
    DateTimeDirective.ctorParameters = function () { return [
        { type: DatetimeComponent }
    ]; };
    return DateTimeDirective;
}());

var FileBrowserComponent = /** @class */ (function () {
    function FileBrowserComponent(deviceService) {
        this.deviceService = deviceService;
        this.selectedFiles = [];
        this.submitEmitter = new EventEmitter();
    }
    FileBrowserComponent.prototype.getFileExtension = function (fileName) {
        var extIndex = fileName ? fileName.lastIndexOf('.') : -1;
        if (extIndex > 0) {
            return fileName.substring(extIndex + 1);
        }
        return '';
    };
    FileBrowserComponent.prototype.ngOnDestroy = function () {
        if (this.backButtonListenerDeregister) {
            this.backButtonListenerDeregister();
        }
    };
    FileBrowserComponent.prototype.onFileClick = function (file) {
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
    };
    Object.defineProperty(FileBrowserComponent.prototype, "show", {
        set: function (flag) {
            var _this = this;
            var rootDir = cordova.file.externalRootDirectory;
            this.isVisible = flag;
            if (flag) {
                if (!this.currentFolder) {
                    if (isIos()) {
                        rootDir = cordova.file.documentsDirectory;
                    }
                    resolveLocalFileSystemURL(rootDir, function (root) { return _this.goToFolder(root); });
                }
                this.backButtonListenerDeregister = this.deviceService.onBackButtonTap(function () {
                    if (_this.isVisible) {
                        if (_this.currentFolder.parent) {
                            _this.onFileClick(_this.currentFolder.parent);
                        }
                        else {
                            _this.isVisible = false;
                        }
                        $appDigest();
                        return false;
                    }
                });
            }
            else if (this.backButtonListenerDeregister) {
                this.backButtonListenerDeregister();
            }
        },
        enumerable: true,
        configurable: true
    });
    FileBrowserComponent.prototype.submit = function () {
        var _this = this;
        var files = [];
        this.loadFileSize(this.selectedFiles).then(function () {
            _.forEach(_this.selectedFiles, function (f) {
                f.isSelected = false;
                files.push({ path: f.nativeURL,
                    name: f.name,
                    size: f.size });
            });
            _this.selectedFiles = [];
            _this.isVisible = false;
            _this.submitEmitter.next({ files: files });
        });
    };
    FileBrowserComponent.prototype.deselectFile = function (file) {
        _.remove(this.selectedFiles, file);
        file.isSelected = false;
    };
    FileBrowserComponent.prototype.goToFolder = function (folder) {
        var _this = this;
        if (!folder.files) {
            this.loadFolder(folder, this.fileTypeToSelect)
                .then(function (files) {
                folder.files = files;
                folder.parent = _this.currentFolder;
                _this.currentFolder = folder;
            });
        }
        else {
            this.currentFolder = folder;
        }
    };
    FileBrowserComponent.prototype.loadFileSize = function (files) {
        return Promise.all(files.map(function (f) {
            return new Promise(function (resolve, reject) {
                f.file(function (o) {
                    f.size = o.size;
                    resolve();
                }, reject);
            });
        }));
    };
    FileBrowserComponent.prototype.loadFolder = function (folder, fileTypeToSelect) {
        return new Promise(function (resolve, reject) {
            var fileTypeToShow;
            folder.createReader().readEntries(function (entries) {
                if (!_.isEmpty(fileTypeToSelect)) {
                    fileTypeToShow = _.split(fileTypeToSelect, ',');
                    entries = _.filter(entries, function (e) {
                        return !e.isFile || _.findIndex(fileTypeToShow, function (ext) { return _.endsWith(e.name, '.' + ext); }) >= 0;
                    });
                }
                resolve(_.sortBy(entries, function (e) { return (e.isFile ? '1_' : '0_') + e.name.toLowerCase(); }));
            }, reject);
        });
    };
    FileBrowserComponent.prototype.refreshFolder = function () {
        var _this = this;
        return this.loadFolder(this.currentFolder, this.fileTypeToSelect)
            .then(function (files) { return _this.currentFolder.files = files; });
    };
    FileBrowserComponent.prototype.selectFile = function (file) {
        if (!this.multiple && this.selectedFiles.length > 0) {
            this.selectedFiles[0].isSelected = false;
            this.selectedFiles = [];
        }
        this.selectedFiles.push(file);
        file.isSelected = true;
    };
    FileBrowserComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmMobileFileBrowser]',
                    template: "<div class=\"app-file-browser\" *ngIf=\"isVisible && currentFolder\">\n    <div class=\"modal-backdrop fade\" [class.in]=\"isVisible\"></div>\n    <div class=\"modal fade\" style=\"display: block;\" [class.in]=\"isVisible\" >\n        <div class=\"modal-dialog\">\n            <div class=\"modal-content\">\n                <div class=\"modal-header clearfix\">\n                    <h4 class=\"modal-title pull-left\">\n                        <span (click)=\"onFileClick(currentFolder.parent)\" [hidden]=\"!!!currentFolder.parent\">\n                            <i class=\"wi wi-long-arrow-left\"></i>\n                        </span>\n                     {{currentFolder.name}}\n                    </h4>\n                    <div class=\"selected-file-button pull-right\" (click)=\"refreshFolder()\">\n                        <i class=\"wi wi-refresh\"></i>\n                    </div>\n                </div>\n                <div class=\"modal-body\">\n                    <div class=\"file-info-box\" *ngFor=\"let file of currentFolder.files\">\n                        <div class=\"file-info\"  [class.bg-primary]=\"file.isSelected\" (click)=\"onFileClick(file)\">\n                            <i class=\"file-icon wi wi-folder\" *ngIf=\"!file.isFile\"></i>\n                            <i class=\"file-icon wi wi-file {{getFileExtension(file.name)}}\" *ngIf=\"file.isFile\"></i>\n                            <span class=\"file-name\">{{file.name}}</span>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"modal-footer\">\n                    <button type=\"button\" class=\"btn btn-primary\" *ngIf=\"selectedFiles && selectedFiles.length > 0\" (click)=\"submit()\">\n                        Done <span class=\"badge badge-light\">{{selectedFiles.length}}</span>\n                    </button>\n                    <button type=\"button\" class=\"btn btn-default\" (click)=\"show = false;\">Close</button>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>"
                }] }
    ];
    /** @nocollapse */
    FileBrowserComponent.ctorParameters = function () { return [
        { type: DeviceService }
    ]; };
    FileBrowserComponent.propDecorators = {
        fileTypeToSelect: [{ type: Input }],
        multiple: [{ type: Input }],
        submitEmitter: [{ type: Output, args: ['submit',] }]
    };
    return FileBrowserComponent;
}());

var FileSelectorService = /** @class */ (function () {
    function FileSelectorService(camera) {
        this.camera = camera;
    }
    FileSelectorService.prototype.selectAudio = function (multiple) {
        var _this = this;
        if (multiple === void 0) { multiple = false; }
        return new Promise(function (resolve, reject) {
            // if multiple is true allows user to select multiple songs
            // if icloud is true will show iCloud songs
            (window['plugins']['mediapicker']).getAudio(resolve, reject, multiple, isIphone());
        }).then(function (files) {
            var filePaths = _.map(_.isArray(files) ? files : [files], 'exportedurl');
            return _this.getFiles(filePaths);
        });
    };
    FileSelectorService.prototype.setFileBrowser = function (f) {
        this.fileBrowserComponent = f;
    };
    FileSelectorService.prototype.selectFiles = function (multiple, fileTypeToSelect) {
        var _this = this;
        if (multiple === void 0) { multiple = false; }
        if (!this.fileBrowserComponent) {
            return Promise.reject('File Browser component is not present.');
        }
        this.fileBrowserComponent.multiple = multiple;
        this.fileBrowserComponent.fileTypeToSelect = fileTypeToSelect;
        this.fileBrowserComponent.show = true;
        return new Promise(function (resolve, reject) {
            var subscription = _this.fileBrowserComponent.submitEmitter.subscribe(function (result) {
                return _this.getFiles(_.map(result.files, 'path'))
                    .then(function (files) {
                    subscription.unsubscribe();
                    _this.fileBrowserComponent.show = false;
                    resolve(files);
                }, function () {
                    subscription.unsubscribe();
                    _this.fileBrowserComponent.show = false;
                    reject();
                });
            });
        });
    };
    FileSelectorService.prototype.selectImages = function (multiple) {
        var _this = this;
        if (multiple === void 0) { multiple = false; }
        var maxImg = multiple ? 10 : 1;
        return new Promise(function (resolve, reject) {
            window.imagePicker.getPictures(resolve, reject, {
                mediaType: 0,
                maxImages: maxImg
            });
        }).then(function (files) {
            var selectedFiles = files.map(function (filepath) {
                if (filepath.indexOf('://') < 0) {
                    return 'file://' + filepath;
                }
                return filepath;
            });
            return _this.getFiles(selectedFiles);
        });
    };
    FileSelectorService.prototype.selectVideos = function (multiple) {
        var _this = this;
        if (multiple === void 0) { multiple = false; }
        var cameraOptions = {
            destinationType: 1,
            sourceType: 0,
            mediaType: 1 // allows video selection
        };
        return this.camera.getPicture(cameraOptions)
            .then(function (filepath) {
            if (filepath.indexOf('://') < 0) {
                filepath = 'file://' + filepath;
            }
            return _this.getFiles([filepath]);
        });
    };
    /**
     * Converts the file to blob using filepath
     * @param filePaths, array of file paths
     * @returns fileObj having name, path, content
     */
    FileSelectorService.prototype.getFiles = function (filePaths) {
        return Promise.all(_.map(filePaths, function (filePath) { return convertToBlob(filePath); }))
            .then(function (filesList) {
            return _.map(filesList, function (fileObj) {
                var path = fileObj.filepath;
                return {
                    name: path.split('/').pop(),
                    path: path,
                    content: fileObj.blob,
                    size: fileObj.blob.size
                };
            });
        });
    };
    FileSelectorService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    FileSelectorService.ctorParameters = function () { return [
        { type: Camera }
    ]; };
    FileSelectorService.ngInjectableDef = defineInjectable({ factory: function FileSelectorService_Factory() { return new FileSelectorService(inject(Camera)); }, token: FileSelectorService, providedIn: "root" });
    return FileSelectorService;
}());

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

var DEFAULT_IMAGE = 'resources/images/imagelists/default-image.png';
var ImageCacheDirective = /** @class */ (function () {
    function ImageCacheDirective(componentInstance, deviceFileCacheService) {
        this.componentInstance = componentInstance;
        this.deviceFileCacheService = deviceFileCacheService;
        this._isEnabled = false;
        this._lastUrl = '';
    }
    ImageCacheDirective.prototype.ngDoCheck = function () {
        var _this = this;
        if (this._isEnabled && this.componentInstance.imgSource && this.componentInstance.imgSource.startsWith('http')) {
            if (this._lastUrl !== this.componentInstance.imgSource) {
                this._lastUrl = this.componentInstance.imgSource;
                this.componentInstance.imgSource = DEFAULT_IMAGE;
                this.getLocalPath(this._lastUrl).then(function (localPath) {
                    _this._cacheUrl = localPath;
                    _this.componentInstance.imgSource = _this._cacheUrl;
                });
            }
            else if (this._cacheUrl) {
                this.componentInstance.imgSource = this._cacheUrl;
            }
        }
    };
    Object.defineProperty(ImageCacheDirective.prototype, "wmImageCache", {
        set: function (val) {
            this._isEnabled = (hasCordova() && val === 'true');
        },
        enumerable: true,
        configurable: true
    });
    ImageCacheDirective.prototype.getLocalPath = function (val) {
        if (hasCordova() && val && val.indexOf('{{') < 0 && val.startsWith('http')) {
            return this.deviceFileCacheService.getLocalPath(val, true, true)
                .catch(noop);
        }
        return Promise.resolve(val);
    };
    ImageCacheDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmImageCache]'
                },] }
    ];
    /** @nocollapse */
    ImageCacheDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] },
        { type: DeviceFileCacheService }
    ]; };
    ImageCacheDirective.propDecorators = {
        wmImageCache: [{ type: Input }]
    };
    return ImageCacheDirective;
}());

var registerProps$2 = function () {
    register('wm-media-list', new Map([
        ['class', PROP_STRING],
        ['dataset', PROP_ANY],
        ['layout', __assign({ value: 'Single-row' }, PROP_STRING)],
        ['mediaurl', PROP_STRING],
        ['name', PROP_STRING],
        ['offline', __assign({ value: true }, PROP_BOOLEAN)],
        ['show', __assign({ value: true }, PROP_BOOLEAN)],
        ['thumbnailheight', __assign({ value: '100pt' }, PROP_STRING)],
        ['thumbnailwidth', __assign({ value: '100pt' }, PROP_STRING)],
        ['thumbnailurl', PROP_STRING],
    ]));
};

var DEFAULT_CLS$3 = 'app-medialist';
var WIDGET_CONFIG$2 = { widgetType: 'wm-media-list', hostClass: DEFAULT_CLS$3 };
var Layout;
(function (Layout) {
    Layout["SINGLE_ROW"] = "Single-row";
    Layout["MULTI_ROW"] = "Multi-row";
})(Layout || (Layout = {}));
var MediaListComponent = /** @class */ (function (_super) {
    __extends(MediaListComponent, _super);
    function MediaListComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG$2) || this;
        _this.selectedMediaIndex = -1;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        return _this;
    }
    MediaListComponent.prototype.appendToBody = function () {
        var _this = this;
        if (!this.$fullScreenEle) {
            setTimeout(function () {
                _this.$fullScreenEle = _this.$element.find('>.app-media-fullscreen');
                _this.$fullScreenEle.appendTo('body:first');
            }, 100);
        }
        return true;
    };
    MediaListComponent.prototype.onPropertyChange = function (key, nv, ov) {
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
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    MediaListComponent.prototype.exitFullScreen = function () {
        this.selectedMediaIndex = -1;
        this.$fullScreenEle.appendTo(this.$element);
        this.$fullScreenEle = null;
        $appDigest();
    };
    MediaListComponent.prototype.getPicTitle = function () {
        return this.selectedMediaIndex + 1 + '/' + this.fieldDefs.length;
    };
    MediaListComponent.prototype.showFullScreen = function (i) {
        this.selectedMediaIndex = i;
        $appDigest();
    };
    MediaListComponent.prototype.showNext = function () {
        if (this.selectedMediaIndex < this.fieldDefs.length - 1) {
            this.selectedMediaIndex++;
            $appDigest();
        }
    };
    // Returns the field value (src) from the fieldDefs
    MediaListComponent.prototype.getSrc = function (field) {
        if (field) {
            return this.fieldDefs[this.selectedMediaIndex][field];
        }
        return '';
    };
    MediaListComponent.prototype.showPrev = function () {
        if (this.selectedMediaIndex > 0) {
            this.selectedMediaIndex--;
            $appDigest();
        }
    };
    MediaListComponent.prototype.onDataChange = function (nv) {
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
    };
    /** With given data, creates media list items*/
    MediaListComponent.prototype.updateFieldDefs = function (data) {
        var _this = this;
        this.fieldDefs = data;
        data.forEach(function (field) {
            field.mediaUrlVal = $parseExpr(_this.mediaurl)(field);
            field.thumbnailUrlVal = $parseExpr(_this.thumbnailurl)(field);
        });
        this.fieldDefs = data;
    };
    /**
     * used to track list items by Index.
     * @param {number} index value of the list item
     * @returns {number} index.
     */
    MediaListComponent.prototype.listTrackByFn = function (index) {
        return index;
    };
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
    MediaListComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    MediaListComponent.propDecorators = {
        mediaListTemplate: [{ type: ContentChild, args: ['mediaListTemplate',] }]
    };
    return MediaListComponent;
}(StylableComponent));

var MediaListItemDirective = /** @class */ (function () {
    function MediaListItemDirective() {
    }
    Object.defineProperty(MediaListItemDirective.prototype, "wmMediaListItem", {
        set: function (val) {
            this.item = val;
        },
        enumerable: true,
        configurable: true
    });
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
    return MediaListItemDirective;
}());

var MobileLeftPanelDirective = /** @class */ (function () {
    function MobileLeftPanelDirective(page, leftPanelRef, deviceService, elRef) {
        var _this = this;
        this.page = page;
        this.leftPanelRef = leftPanelRef;
        this.deviceService = deviceService;
        addClass(elRef.nativeElement, 'wm-mobile-app-left-panel');
        page.notify('wmLeftPanel:ready', leftPanelRef);
        page.subscribe('wmLeftPanel:expand', function () {
            _this._backBtnListenerDestroyer = deviceService.onBackButtonTap(function () {
                leftPanelRef.collapse();
                return false;
            });
        });
        page.subscribe('wmLeftPanel:collapse', function () {
            _this.destroyBackBtnListener();
        });
    }
    MobileLeftPanelDirective.prototype.ngOnDestroy = function () {
        this.destroyBackBtnListener();
    };
    MobileLeftPanelDirective.prototype.destroyBackBtnListener = function () {
        if (this._backBtnListenerDestroyer) {
            this._backBtnListenerDestroyer();
            this._backBtnListenerDestroyer = null;
        }
    };
    MobileLeftPanelDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmLeftPanel]'
                },] }
    ];
    /** @nocollapse */
    MobileLeftPanelDirective.ctorParameters = function () { return [
        { type: PageDirective },
        { type: LeftPanelDirective },
        { type: DeviceService },
        { type: ElementRef }
    ]; };
    return MobileLeftPanelDirective;
}());

var MobilePageDirective = /** @class */ (function () {
    function MobilePageDirective(app, elRef, deviceService, page, navigationService) {
        var _this = this;
        this.deviceService = deviceService;
        this.page = page;
        this.navigationService = navigationService;
        addClass(elRef.nativeElement, 'mobile-app-page');
        this._$ele = $(elRef.nativeElement);
        page.subscribe('wmMobileTabbar:ready', function () { return _this._$ele.addClass('has-tabbar'); });
        // add backbutton listener on every page.
        deviceService.onBackButtonTap(function ($event) {
            if (app.landingPageName === app.activePageName) {
                window.navigator['app'].exitApp();
            }
            else {
                _this.navigationService.goToPrevious();
            }
            return false;
        });
    }
    MobilePageDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmPage]'
                },] }
    ];
    /** @nocollapse */
    MobilePageDirective.ctorParameters = function () { return [
        { type: App },
        { type: ElementRef },
        { type: DeviceService },
        { type: PageDirective },
        { type: AbstractNavigationService }
    ]; };
    return MobilePageDirective;
}());

var navbarProps = new Map([
    ['backbutton', __assign({ value: true }, PROP_BOOLEAN)],
    ['backbuttoniconclass', __assign({ value: 'wi wi-back' }, PROP_STRING)],
    ['backbuttonlabel', __assign({ value: '' }, PROP_STRING)],
    ['backgroundattachment', PROP_STRING],
    ['backgroundcolor', PROP_STRING],
    ['backgroundgradient', PROP_STRING],
    ['backgroundimage', PROP_STRING],
    ['backgroundposition', PROP_STRING],
    ['backgroundrepeat', PROP_STRING],
    ['backgroundsize', PROP_STRING],
    ['class', PROP_STRING],
    ['datafield', __assign({ value: 'All Fields' }, PROP_STRING)],
    ['dataset', PROP_ANY],
    ['datasource', PROP_STRING],
    ['datavalue', PROP_STRING],
    ['debouncetime', __assign({ value: 250 }, PROP_NUMBER)],
    ['defaultview', PROP_STRING],
    ['displayimagesrc', PROP_STRING],
    ['displaylabel', PROP_STRING],
    ['imgsrc', PROP_STRING],
    ['query', __assign({ value: '' }, PROP_STRING)],
    ['leftnavpaneliconclass', __assign({ value: 'wi wi-menu' }, PROP_STRING)],
    ['matchmode', PROP_STRING],
    ['name', PROP_STRING],
    ['readonlySearchBar', PROP_BOOLEAN],
    ['searchbutton', __assign({ value: false }, PROP_BOOLEAN)],
    ['searchbuttoniconclass', __assign({ value: 'wi wi-search' }, PROP_STRING)],
    ['searchbuttonlabel', __assign({ value: '' }, PROP_STRING)],
    ['show', __assign({ value: true }, PROP_BOOLEAN)],
    ['showLeftnavbtn', __assign({ value: true }, PROP_BOOLEAN)],
    ['searchkey', PROP_STRING],
    ['searchplaceholder', __assign({ value: 'Search' }, PROP_STRING)],
    ['showSearchbar', PROP_BOOLEAN],
    ['title', PROP_STRING]
]);
var registerProps$3 = function () {
    register('wm-mobile-navbar', navbarProps);
};

var DEFAULT_CLS$4 = 'app-mobile-header app-mobile-navbar';
var WIDGET_CONFIG$3 = { widgetType: 'wm-mobile-navbar', hostClass: DEFAULT_CLS$4 };
var MobileNavbarComponent = /** @class */ (function (_super) {
    __extends(MobileNavbarComponent, _super);
    function MobileNavbarComponent(app, page, deviceService, navigationService, inj, backbtnClickEvt) {
        var _this = _super.call(this, inj, WIDGET_CONFIG$3) || this;
        _this.page = page;
        _this.deviceService = deviceService;
        _this.navigationService = navigationService;
        _this.backbtnClickEvt = backbtnClickEvt;
        _this._isReady = false;
        page.subscribe('wmLeftPanel:ready', function (leftNavPanel) {
            if (_this.showLeftnavbtn) {
                _this.leftNavPanel = leftNavPanel;
            }
        });
        _this._backBtnListenerDestroyer = deviceService.onBackButtonTap(function ($event) {
            if (_this._isReady) {
                if (_this.backbtnClickEvt) {
                    _this.invokeEventCallback('backbtnclick', { $event: $event });
                    return false;
                }
            }
        });
        setTimeout(function () { return _this._isReady = true; }, 1000);
        return _this;
    }
    Object.defineProperty(MobileNavbarComponent.prototype, "datasource", {
        // getter setter is added to pass the datasource to searchcomponent.
        get: function () {
            return this._datasource;
        },
        set: function (nv) {
            this._datasource = nv;
            this.searchComponent.datasource = nv;
        },
        enumerable: true,
        configurable: true
    });
    MobileNavbarComponent.prototype.ngAfterViewInit = function () {
        this.searchComponent.binddisplayimagesrc = this.binddisplayimagesrc;
        this.searchComponent.displayimagesrc = this.binddisplayimagesrc ? this.binddisplayimagesrc : this.displayimagesrc;
        this.searchComponent.displaylabel = this.binddisplaylabel ? this.binddisplaylabel : this.displaylabel;
        this.searchComponent.datafield = this.datafield;
        this.searchComponent.binddataset = this.binddataset;
        this.searchComponent.dataset = this.dataset;
        this.searchComponent.searchkey = this.searchkey;
        this.searchComponent.datasource = this.datasource;
        this.searchComponent.matchmode = this.matchmode;
    };
    MobileNavbarComponent.prototype.goBack = function ($event) {
        /**
         * TODO: while trying navigating from details page to edit page in wavereads, app is navigating
         * as details -> editPage -> details. For now, keeping this callback to react after 1 second.
         */
        this.deviceService.executeBackTapListeners($event);
    };
    MobileNavbarComponent.prototype.ngOnDestroy = function () {
        this._backBtnListenerDestroyer();
        _super.prototype.ngOnDestroy.call(this);
    };
    MobileNavbarComponent.prototype.onPropertyChange = function (key, nv, ov) {
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
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    MobileNavbarComponent.prototype.onSubmission = function ($event) {
        this.invokeEventCallback('search', { $event: $event });
    };
    // switches the view based on defaultview
    MobileNavbarComponent.prototype.switchView = function (view) {
        this.showSearchbar = (view !== 'actionview');
    };
    // goto previous view or page
    MobileNavbarComponent.prototype.goBacktoPreviousView = function ($event) {
        if (this.defaultview === 'actionview') {
            // switches the view from search to action or action to search.
            this.switchView('actionview');
        }
        else {
            // goes back to the previous visited page.
            this.goBack($event);
        }
    };
    MobileNavbarComponent.prototype.onSelect = function ($event, widget, selectedValue) {
        this.datavalue = selectedValue;
        this.query = widget.query;
        this.invokeEventCallback('change', {
            $event: $event,
            newVal: selectedValue,
            oldVal: widget.prevDatavalue
        });
    };
    MobileNavbarComponent.prototype.onClear = function () {
        this.datavalue = '';
        this.query = '';
    };
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
    MobileNavbarComponent.ctorParameters = function () { return [
        { type: App },
        { type: PageDirective },
        { type: DeviceService },
        { type: AbstractNavigationService },
        { type: Injector },
        { type: undefined, decorators: [{ type: Attribute, args: ['backbtnclick.event',] }] }
    ]; };
    MobileNavbarComponent.propDecorators = {
        searchComponent: [{ type: ViewChild, args: [SearchComponent,] }]
    };
    return MobileNavbarComponent;
}(BaseComponent));

var registerProps$4 = function () {
    register('wm-network-info-toaster', new Map([]));
};

var DEFAULT_CLS$5 = 'network-info-toaster';
var WIDGET_CONFIG$4 = { widgetType: 'wm-network-info-toaster', hostClass: DEFAULT_CLS$5 };
var NetworkState;
(function (NetworkState) {
    NetworkState[NetworkState["CONNECTED"] = 1] = "CONNECTED";
    NetworkState[NetworkState["CONNECTING"] = 0] = "CONNECTING";
    NetworkState[NetworkState["SERVICE_AVAILABLE_BUT_NOT_CONNECTED"] = -1] = "SERVICE_AVAILABLE_BUT_NOT_CONNECTED";
    NetworkState[NetworkState["NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE"] = -2] = "NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE";
    NetworkState[NetworkState["NETWORK_NOT_AVAIABLE"] = -3] = "NETWORK_NOT_AVAIABLE";
})(NetworkState || (NetworkState = {}));
var NetworkInfoToasterComponent = /** @class */ (function (_super) {
    __extends(NetworkInfoToasterComponent, _super);
    function NetworkInfoToasterComponent(networkService, app, inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG$4) || this;
        _this.networkService = networkService;
        _this.showMessage = false;
        _this.isServiceConnected = false;
        _this.isServiceAvailable = false;
        styler(_this.$element, _this);
        _this.isServiceAvailable = _this.networkService.isAvailable();
        _this.isServiceConnected = _this.networkService.isConnected();
        _this._listenerDestroyer = app.subscribe('onNetworkStateChange', function (data) {
            var oldState = _this.networkState;
            var autoHide = false;
            if (data.isConnected) {
                _this.networkState = NetworkState.CONNECTED;
                autoHide = true;
            }
            else if (data.isConnecting) {
                _this.networkState = NetworkState.CONNECTING;
            }
            else if (data.isServiceAvailable) {
                _this.networkState = NetworkState.SERVICE_AVAILABLE_BUT_NOT_CONNECTED;
            }
            else if (data.isNetworkAvailable && !data.isServiceAvailable) {
                _this.networkState = NetworkState.NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE;
            }
            else {
                _this.networkState = NetworkState.NETWORK_NOT_AVAIABLE;
            }
            _this.showMessage = (!(oldState === undefined && data.isConnected) && oldState !== _this.networkState);
            if (autoHide && _this.showMessage) {
                setTimeout(function () {
                    _this.showMessage = false;
                    $appDigest();
                }, 5000);
            }
        });
        return _this;
    }
    NetworkInfoToasterComponent.prototype.connect = function () {
        this.networkService.connect();
    };
    NetworkInfoToasterComponent.prototype.hideMessage = function () {
        this.showMessage = false;
    };
    NetworkInfoToasterComponent.prototype.ngOnDestroy = function () {
        this._listenerDestroyer();
        _super.prototype.ngOnDestroy.call(this);
    };
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
    NetworkInfoToasterComponent.ctorParameters = function () { return [
        { type: NetworkService },
        { type: App },
        { type: Injector }
    ]; };
    return NetworkInfoToasterComponent;
}(StylableComponent));

var PageContentLoaderComponent = /** @class */ (function () {
    function PageContentLoaderComponent(el) {
        addClass(el.nativeElement, 'app-page-content-loader');
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
    PageContentLoaderComponent.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    return PageContentLoaderComponent;
}());

var MAX_PROCESS = 3;
var ProcessManagerComponent = /** @class */ (function () {
    function ProcessManagerComponent(el) {
        this.el = el;
        this.isVisible = true;
        this.instances = [];
        this.queue = [];
        addClass(this.el.nativeElement, 'app-global-progress-bar modal default');
    }
    ProcessManagerComponent.prototype.createInstance = function (name, min, max) {
        var _this = this;
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 100; }
        var instance = {
            max: max,
            min: min,
            name: name,
            onStop: null,
            progressLabel: '',
            show: min !== max,
            stopButtonLabel: 'Cancel',
            value: 0
        };
        var api = {
            get: function (propertyName) { return instance[propertyName]; },
            set: function (propertyName, propertyValue) { return _this.setInstaceProperty(instance, propertyName, propertyValue); },
            destroy: function () { return _this.removeInstance(instance); }
        };
        return this.addToQueue(instance).then(function () { return api; });
    };
    ProcessManagerComponent.prototype.getVisibleInstances = function () {
        return this.instances.filter(function (i) { return i.show; });
    };
    ProcessManagerComponent.prototype.ngDoCheck = function () {
        var hasInstancesToShow = !!this.instances.find(function (i) { return i.show; });
        if (this.isVisible && !hasInstancesToShow) {
            setAttr(this.el.nativeElement, 'hidden', 'true');
            this.isVisible = false;
        }
        else if (!this.isVisible && hasInstancesToShow) {
            removeAttr(this.el.nativeElement, 'hidden');
            this.isVisible = true;
        }
    };
    ProcessManagerComponent.prototype.addToQueue = function (instance) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.queue.push(function () {
                if (_this.instances.length < MAX_PROCESS) {
                    _this.instances.push(instance);
                    resolve(instance);
                }
                else {
                    return false;
                }
            });
            _this.flushQueue();
        });
    };
    ProcessManagerComponent.prototype.flushQueue = function () {
        if (this.queue.length > 0 && this.queue[0]() !== false) {
            this.queue.shift();
            this.flushQueue();
        }
    };
    ProcessManagerComponent.prototype.removeInstance = function (instance) {
        var _this = this;
        return new Promise(function (resolve) {
            setTimeout(function () {
                _.remove(_this.instances, instance);
                _this.flushQueue();
                resolve();
            }, 1000);
        });
    };
    ProcessManagerComponent.prototype.setInstaceProperty = function (instance, propertyName, propertyValue) {
        var _this = this;
        if (propertyName === 'value') {
            if (instance.value >= instance.max) {
                propertyValue = instance.max;
            }
            instance.value = propertyValue;
            instance.progressLabel = instance.value + '/' + instance.max;
        }
        else if (propertyName === 'onStop' && _.isFunction(propertyValue)) {
            instance.onStop = function () {
                propertyValue();
                return _this.removeInstance(instance);
            };
        }
        else {
            instance[propertyName] = propertyValue;
        }
        instance.show = instance.min !== instance.max;
    };
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
    ProcessManagerComponent.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    return ProcessManagerComponent;
}());

var SearchDirective = /** @class */ (function () {
    function SearchDirective(elRef) {
        switchClass(elRef.nativeElement, 'app-mobile-search');
    }
    SearchDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmSearch]'
                },] }
    ];
    /** @nocollapse */
    SearchDirective.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    return SearchDirective;
}());

var registerProps$5 = function () {
    register('wm-segment-content', new Map([
        ['caption', __assign({ value: '' }, PROP_STRING)],
        ['class', PROP_STRING],
        ['content', PROP_STRING],
        ['iconclass', __assign({ value: '' }, PROP_STRING)],
        ['loadmode', PROP_STRING],
        ['loaddelay', __assign({ value: 10 }, PROP_NUMBER)],
        ['name', PROP_STRING],
        ['show', __assign({ value: true }, PROP_BOOLEAN)]
    ]));
};

var registerProps$6 = function () {
    register('wm-segmented-control', new Map([
        ['class', PROP_STRING],
        ['name', PROP_STRING],
        ['show', __assign({ value: true }, PROP_BOOLEAN)]
    ]));
};

var DEFAULT_CLS$6 = 'app-segmented-control';
var WIDGET_CONFIG$5 = { widgetType: 'wm-segmented-control', hostClass: DEFAULT_CLS$6 };
var SegmentedControlComponent = /** @class */ (function (_super) {
    __extends(SegmentedControlComponent, _super);
    function SegmentedControlComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG$5) || this;
        _this.contents = [];
        _this.currentSelectedIndex = 0;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        return _this;
    }
    SegmentedControlComponent.prototype.addContent = function (content) {
        this.contents.push(content);
    };
    SegmentedControlComponent.prototype.goToNext = function () {
        this.showContent(this.currentSelectedIndex + 1);
    };
    SegmentedControlComponent.prototype.goToPrev = function () {
        this.showContent(this.currentSelectedIndex - 1);
    };
    SegmentedControlComponent.prototype.ngAfterViewInit = function () {
        var e_1, _a;
        this._$container = this.$element.find('>.app-segments-container');
        var childEls = this._$container.find('>.list-inline >li');
        var maxWidth = this.contents.length * 100 + "%";
        setCSSFromObj(this._$container[0], {
            maxWidth: maxWidth,
            width: maxWidth,
            'white-space': 'nowrap',
            transition: 'transform 0.2s linear'
        });
        var width = 100 / this.contents.length + "%";
        try {
            for (var _b = __values(Array.from(childEls)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                setCSS(child, 'width', width);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.showContent(0, undefined, true);
    };
    SegmentedControlComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    SegmentedControlComponent.prototype.removeContent = function (content) {
        var index = this.contents.findIndex(function (c) {
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
    };
    SegmentedControlComponent.prototype.showContent = function (content, $event, defaultLoad) {
        var index;
        var selectedContent;
        if (isNumber(content)) {
            index = content;
            if (this.contents.length) {
                selectedContent = this.contents[index];
            }
        }
        else {
            selectedContent = content;
            index = this.contents.findIndex(function (c) {
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
        var eventData = {
            $old: this.currentSelectedIndex,
            $new: index
        };
        this.currentSelectedIndex = index;
        this.invokeEventCallback('beforesegmentchange', eventData);
        setCSS(this._$container[0], 'transform', "translate3d(" + -1 * index / this.contents.length * 100 + "%, 0, 0)");
        this.invokeEventCallback('segmentchange', eventData);
    };
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
    SegmentedControlComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return SegmentedControlComponent;
}(StylableComponent));

var DEFAULT_CLS$7 = 'app-segment-content clearfix';
var WIDGET_CONFIG$6 = { widgetType: 'wm-segment-content', hostClass: DEFAULT_CLS$7 };
var SegmentContentComponent = /** @class */ (function (_super) {
    __extends(SegmentContentComponent, _super);
    function SegmentContentComponent(segmentedControl, inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG$6) || this;
        _this.segmentedControl = segmentedControl;
        _this.compile = false;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        segmentedControl.addContent(_this);
        return _this;
    }
    SegmentContentComponent.prototype.ngAfterViewInit = function () {
        // load the content on demand when loadmode is not specified
        if (!this.loadmode) {
            this.loadContent(true);
        }
    };
    SegmentContentComponent.prototype.navigate = function () {
        this.segmentedControl.showContent(this);
    };
    // sets the compile flag to load the content
    SegmentContentComponent.prototype._loadContent = function () {
        if (!this.compile) {
            this.compile = true;
            this.invokeEventCallback('ready');
        }
    };
    SegmentContentComponent.prototype.loadContent = function (defaultLoad) {
        if (this.loadmode === 'after-delay' || defaultLoad) {
            setTimeout(this._loadContent.bind(this), defaultLoad ? 0 : this.loaddelay);
        }
        else {
            this._loadContent();
        }
    };
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
    SegmentContentComponent.ctorParameters = function () { return [
        { type: SegmentedControlComponent },
        { type: Injector }
    ]; };
    return SegmentContentComponent;
}(StylableComponent));

var TimeDirective = /** @class */ (function () {
    function TimeDirective(timeComponent) {
        timeComponent.useDatapicker = false;
    }
    TimeDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmTime]'
                },] }
    ];
    /** @nocollapse */
    TimeDirective.ctorParameters = function () { return [
        { type: TimeComponent }
    ]; };
    return TimeDirective;
}());

var registerProps$7 = function () {
    register('wm-mobile-tabbar', new Map([
        ['class', PROP_STRING],
        ['dataset', PROP_ANY],
        ['itemicon', PROP_STRING],
        ['itemlabel', PROP_STRING],
        ['itemlink', PROP_STRING],
        ['morebuttoniconclass', __assign({ value: 'wi wi-more-horiz' }, PROP_STRING)],
        ['morebuttonlabel', __assign({ value: 'more' }, PROP_STRING)],
        ['name', PROP_STRING],
        ['show', __assign({ value: true }, PROP_BOOLEAN)]
    ]));
};

var DEFAULT_CLS$8 = 'app-tabbar app-top-nav';
var WIDGET_CONFIG$7 = { widgetType: 'wm-mobile-tabbar', hostClass: DEFAULT_CLS$8 };
var MobileTabbarComponent = /** @class */ (function (_super) {
    __extends(MobileTabbarComponent, _super);
    function MobileTabbarComponent(page, inj, binditemlabel, binditemicon, binditemlink) {
        var _this = _super.call(this, inj, WIDGET_CONFIG$7) || this;
        _this.page = page;
        _this.binditemlabel = binditemlabel;
        _this.binditemicon = binditemicon;
        _this.binditemlink = binditemlink;
        _this.tabItems = [];
        _this.layout = {};
        _this._layouts = [
            { minwidth: 2048, max: 12 },
            { minwidth: 1024, max: 10 },
            { minwidth: 768, max: 7 },
            { minwidth: 480, max: 5 },
            { minwidth: 0, max: 4 }
        ];
        styler(_this.nativeElement, _this);
        page.notify('wmMobileTabbar:ready', _this);
        return _this;
    }
    MobileTabbarComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'dataset') {
            if (nv) {
                this.tabItems = this.getTabItems(nv);
            }
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    MobileTabbarComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        setTimeout(function () {
            _this.layout = _this.getSuitableLayout();
            $(window).on('resize.tabbar', _.debounce(function () { return _this.layout = _this.getSuitableLayout(); }, 20));
        });
        _super.prototype.ngAfterViewInit.call(this);
    };
    MobileTabbarComponent.prototype.ngOnDestroy = function () {
        $(window).off('.tabbar');
        _super.prototype.ngOnDestroy.call(this);
    };
    // triggered on item selection
    MobileTabbarComponent.prototype.onItemSelect = function ($event, selectedItem) {
        this.invokeEventCallback('select', { $event: $event, $item: selectedItem.value || selectedItem.label });
    };
    MobileTabbarComponent.prototype.getItems = function (itemArray) {
        return itemArray.map(function (item) { return ({
            label: item,
            icon: 'wi wi-' + item
        }); });
    };
    MobileTabbarComponent.prototype.getSuitableLayout = function () {
        var avaiableWidth = $(this.nativeElement).parent().width();
        return this._layouts.find(function (l) { return avaiableWidth >= l.minwidth; });
    };
    MobileTabbarComponent.prototype.getTabItems = function (value) {
        var _this = this;
        if (_.isArray(value)) {
            if (_.isObject(value[0])) {
                return value.map(function (item) {
                    var link = getEvaluatedData(item, { expression: 'itemlink', 'bindExpression': _this.binditemlink }, _this.viewParent) || item.link;
                    var activePageName = window.location.hash.substr(2);
                    return {
                        label: getEvaluatedData(item, { expression: 'itemlabel', bindExpression: _this.binditemlabel }, _this.viewParent) || item.label,
                        icon: getEvaluatedData(item, { expression: 'itemicon', bindExpression: _this.binditemicon }, _this.viewParent) || item.icon,
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
    };
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
    MobileTabbarComponent.ctorParameters = function () { return [
        { type: PageDirective },
        { type: Injector },
        { type: undefined, decorators: [{ type: Attribute, args: ['itemlabel.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['itemicon.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['itemicon.bind',] }] }
    ]; };
    return MobileTabbarComponent;
}(StylableComponent));

var registerProps$8 = function () {
    register('wm-widget-template', new Map([
        ['name', PROP_STRING],
        ['show', __assign({ value: true }, PROP_BOOLEAN)]
    ]));
};

var DEFAULT_CLS$9 = 'app-widget-template';
var WIDGET_CONFIG$8 = { widgetType: 'wm-widget-template', hostClass: DEFAULT_CLS$9 };
var WidgetTemplateComponent = /** @class */ (function (_super) {
    __extends(WidgetTemplateComponent, _super);
    function WidgetTemplateComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG$8) || this;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        return _this;
    }
    WidgetTemplateComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
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
    WidgetTemplateComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return WidgetTemplateComponent;
}(StylableComponent));

var wmMobileComponents = [
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
var PIPES = [];
var WmMobileComponentsModule = /** @class */ (function () {
    function WmMobileComponentsModule() {
    }
    WmMobileComponentsModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        CommonModule,
                        WmComponentsModule
                    ],
                    declarations: __spread(wmMobileComponents, PIPES),
                    exports: __spread(wmMobileComponents, PIPES),
                    providers: [
                    // add providers to mobile-runtime module.
                    ],
                    entryComponents: []
                },] }
    ];
    return WmMobileComponentsModule;
}());

var ProcessManagementService = /** @class */ (function () {
    function ProcessManagementService() {
    }
    ProcessManagementService.prototype.setUIComponent = function (processManagerComponent) {
        this.processManagerComponent = processManagerComponent;
    };
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
    ProcessManagementService.prototype.createInstance = function (name, min, max) {
        if (!this.processManagerComponent) {
            return Promise.reject('ProcessManagerComponent is missing');
        }
        return this.processManagerComponent.createInstance(name, min, max);
    };
    ProcessManagementService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    ProcessManagementService.ngInjectableDef = defineInjectable({ factory: function ProcessManagementService_Factory() { return new ProcessManagementService(); }, token: ProcessManagementService, providedIn: "root" });
    return ProcessManagementService;
}());

/**
 * Generated bundle index. Do not edit.
 */

export { AnchorDirective as ɵa, AppUpdateComponent as ɵb, BarcodeScannerComponent as ɵc, CameraComponent as ɵd, DateTimeDirective as ɵf, DateDirective as ɵe, FileUploadDirective as ɵg, ImageCacheDirective as ɵh, MobileLeftPanelDirective as ɵk, MediaListItemDirective as ɵj, MediaListComponent as ɵi, MobileNavbarComponent as ɵl, NetworkInfoToasterComponent as ɵo, PageContentLoaderComponent as ɵp, MobilePageDirective as ɵm, SearchDirective as ɵq, SegmentContentComponent as ɵr, SegmentedControlComponent as ɵs, MobileTabbarComponent as ɵn, TimeDirective as ɵt, WidgetTemplateComponent as ɵu, WmMobileComponentsModule, FileSelectorService, ProcessManagementService, FileBrowserComponent, ProcessManagerComponent };

//# sourceMappingURL=index.js.map