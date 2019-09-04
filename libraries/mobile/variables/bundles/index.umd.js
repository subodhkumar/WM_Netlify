(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@ionic-native/app-version'), require('@ionic-native/barcode-scanner'), require('@ionic-native/calendar'), require('@ionic-native/camera'), require('@ionic-native/device'), require('@ionic-native/contacts'), require('@ionic-native/media-capture'), require('@ionic-native/geolocation'), require('@ionic-native/vibration'), require('@wm/mobile/core'), require('@wm/mobile/offline'), require('@wm/security'), require('@wm/core'), require('@wm/variables'), require('@wm/mobile/components')) :
    typeof define === 'function' && define.amd ? define('@wm/mobile/variables', ['exports', '@angular/core', '@ionic-native/app-version', '@ionic-native/barcode-scanner', '@ionic-native/calendar', '@ionic-native/camera', '@ionic-native/device', '@ionic-native/contacts', '@ionic-native/media-capture', '@ionic-native/geolocation', '@ionic-native/vibration', '@wm/mobile/core', '@wm/mobile/offline', '@wm/security', '@wm/core', '@wm/variables', '@wm/mobile/components'], factory) :
    (factory((global.wm = global.wm || {}, global.wm.mobile = global.wm.mobile || {}, global.wm.mobile.variables = {}),global.ng.core,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.wm.mobile.core,global.wm.mobile.offline,global.wm.security,global.wm.core,global.wm.variables,global.wm.mobile.components));
}(this, (function (exports,core,appVersion,barcodeScanner,calendar,camera,device,contacts,mediaCapture,geolocation,vibration,core$1,offline,security,core$2,variables,components) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p]; };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var DEFAULT_TIME = new Date().getTime();
    /*3 months timestamp value*/
    var DELTA_VALUE_DATE = (3 * 30 * 24 * 60 * 60 * 1000);
    var DEFAULT_START_DATE = (DEFAULT_TIME - DELTA_VALUE_DATE);
    var DEFAULT_END_DATE = (DEFAULT_TIME + DELTA_VALUE_DATE);
    var EVENT_META = {
        title: '',
        message: '',
        location: '',
        startDate: new Date(),
        endDate: new Date()
    };
    /**
     * this file contains all calendar operations under 'calendar' service.
     */
    var CalendarService = /** @class */ (function (_super) {
        __extends(CalendarService, _super);
        function CalendarService(calendar$$1) {
            var _this = _super.call(this) || this;
            _this.name = 'calendar';
            _this.operations = [];
            _this.operations.push(new CreateEventOperation(calendar$$1), new DeleteEventOperation(calendar$$1), new GetEventsOperation(calendar$$1));
            return _this;
        }
        return CalendarService;
    }(variables.DeviceVariableService));
    var CreateEventOperation = /** @class */ (function () {
        function CreateEventOperation(calendar$$1) {
            this.calendar = calendar$$1;
            this.name = 'createEvent';
            this.properties = [
                { target: 'eventTitle', type: 'string', dataBinding: true },
                { target: 'eventNotes', type: 'string', dataBinding: true },
                { target: 'eventLocation', type: 'string', dataBinding: true },
                { target: 'eventStart', type: 'datetime', dataBinding: true },
                { target: 'eventEnd', type: 'datetime', dataBinding: true }
            ];
            this.requiredCordovaPlugins = ['CALENDAR'];
        }
        CreateEventOperation.prototype.invoke = function (variable, options, eventInfo) {
            return this.calendar.createEvent(eventInfo.get('eventTitle'), eventInfo.get('eventLocation'), eventInfo.get('eventNotes'), new Date(eventInfo.get('eventStart') || 0), new Date(eventInfo.get('eventEnd') || 0));
        };
        return CreateEventOperation;
    }());
    var DeleteEventOperation = /** @class */ (function () {
        function DeleteEventOperation(calendar$$1) {
            this.calendar = calendar$$1;
            this.name = 'deleteEvent';
            this.properties = [
                { target: 'eventTitle', type: 'string', dataBinding: true },
                { target: 'eventNotes', type: 'string', dataBinding: true },
                { target: 'eventLocation', type: 'string', dataBinding: true },
                { target: 'eventStart', type: 'datetime', dataBinding: true },
                { target: 'eventEnd', type: 'datetime', dataBinding: true }
            ];
            this.requiredCordovaPlugins = ['CALENDAR'];
        }
        DeleteEventOperation.prototype.invoke = function (variable, options, eventInfo) {
            return this.calendar.deleteEvent(eventInfo.get('eventTitle'), eventInfo.get('eventLocation'), eventInfo.get('eventNotes'), new Date(eventInfo.get('eventStart') || DEFAULT_START_DATE), new Date(eventInfo.get('eventEnd') || DEFAULT_END_DATE));
        };
        return DeleteEventOperation;
    }());
    var GetEventsOperation = /** @class */ (function () {
        function GetEventsOperation(calendar$$1) {
            this.calendar = calendar$$1;
            this.name = 'getEvents';
            this.model = [EVENT_META];
            this.properties = [
                { target: 'eventTitle', type: 'string', dataBinding: true },
                { target: 'eventNotes', type: 'string', dataBinding: true },
                { target: 'eventLocation', type: 'string', dataBinding: true },
                { target: 'eventStart', type: 'datetime', dataBinding: true },
                { target: 'eventEnd', type: 'datetime', dataBinding: true }
            ];
            this.requiredCordovaPlugins = ['CALENDAR'];
        }
        GetEventsOperation.prototype.invoke = function (variable, options, eventInfo) {
            return this.calendar.findEvent(eventInfo.get('eventTitle'), eventInfo.get('eventLocation'), eventInfo.get('eventNotes'), new Date(eventInfo.get('eventStart') || DEFAULT_START_DATE), new Date(eventInfo.get('eventEnd') || DEFAULT_END_DATE));
        };
        return GetEventsOperation;
    }());

    var CameraService = /** @class */ (function (_super) {
        __extends(CameraService, _super);
        function CameraService(camera$$1, mediaCapture$$1) {
            var _this = _super.call(this) || this;
            _this.name = 'camera';
            _this.operations = [];
            _this.operations.push(new CaptureImageOperation(camera$$1), new CaptureVideoOperation(mediaCapture$$1));
            return _this;
        }
        return CameraService;
    }(variables.DeviceVariableService));
    var CaptureImageOperation = /** @class */ (function () {
        function CaptureImageOperation(camera$$1) {
            this.camera = camera$$1;
            this.name = 'captureImage';
            this.model = {
                imagePath: 'resources/images/imagelists/default-image.png'
            };
            this.properties = [
                { target: 'allowImageEdit', type: 'boolean', value: false, dataBinding: true },
                { target: 'imageQuality', type: 'number', value: 80, dataBinding: true },
                { target: 'imageEncodingType', type: 'list', options: { '0': 'JPEG', '1': 'PNG' }, value: '0', dataBinding: true },
                { target: 'correctOrientation', type: 'boolean', value: true, dataBinding: true },
                { target: 'imageTargetWidth', type: 'number', dataBinding: true },
                { target: 'imageTargetHeight', type: 'number', dataBinding: true }
            ];
            this.requiredCordovaPlugins = ['CAMERA', 'CAPTURE'];
        }
        CaptureImageOperation.prototype.invoke = function (variable, options, dataBindings) {
            var imageTargetWidth = dataBindings.get('imageTargetWidth'), imageTargetHeight = dataBindings.get('imageTargetHeight');
            var imageEncodingType = parseInt(dataBindings.get('imageEncodingType'), 10), cameraOptions;
            if (isNaN(imageEncodingType)) {
                imageEncodingType = (dataBindings.get('imageEncodingType') === 'JPEG' ? 0 : 1);
            }
            cameraOptions = {
                quality: dataBindings.get('imageQuality'),
                destinationType: 1,
                sourceType: 1,
                allowEdit: dataBindings.get('allowImageEdit'),
                encodingType: imageEncodingType,
                mediaType: 0,
                correctOrientation: dataBindings.get('correctOrientation'),
                targetWidth: core$2.isNumber(imageTargetWidth) ? imageTargetWidth : undefined,
                targetHeight: core$2.isNumber(imageTargetHeight) ? imageTargetHeight : undefined,
            };
            return this.camera.getPicture(cameraOptions).then(function (data) {
                return { imagePath: data };
            });
        };
        return CaptureImageOperation;
    }());
    var CaptureVideoOperation = /** @class */ (function () {
        function CaptureVideoOperation(mediaCapture$$1) {
            this.mediaCapture = mediaCapture$$1;
            this.name = 'captureVideo';
            this.model = {
                videoPath: ''
            };
            this.properties = [];
            this.requiredCordovaPlugins = ['CAMERA', 'CAPTURE'];
        }
        CaptureVideoOperation.prototype.invoke = function (variable, options) {
            return this.mediaCapture.captureVideo({
                limit: 1
            }).then(function (data) {
                return { videoPath: data[0].fullPath };
            });
        };
        return CaptureVideoOperation;
    }());

    var FileService = /** @class */ (function (_super) {
        __extends(FileService, _super);
        function FileService(fileOpener, fileUploader) {
            var _this = _super.call(this) || this;
            _this.name = 'file';
            _this.operations = [];
            _this.operations.push(new OpenFileOperation(fileOpener), new UploadFileOperation(fileUploader));
            return _this;
        }
        return FileService;
    }(variables.DeviceVariableService));
    var OpenFileOperation = /** @class */ (function () {
        function OpenFileOperation(fileOpener) {
            this.fileOpener = fileOpener;
            this._defaultFileTypesToOpen = {
                'doc': { 'label': 'Microsoft Office Word Document', 'mimeType': 'application/msword', 'extension': 'doc' },
                'pdf': { 'label': 'PDF Document', 'mimeType': 'application/pdf', 'extension': 'pdf' },
                'ppt': { 'label': 'Microsoft Office Powerpoint', 'mimeType': 'application/vnd.ms-powerpoint', 'extension': 'ppt' },
                'xls': { 'label': 'Microsoft Office Excel', 'mimeType': 'application/vnd.ms-excel', 'extension': 'xls' }
            };
            this.name = 'openFile';
            this.model = {};
            this.properties = [
                { target: 'filePath', type: 'string', value: '', dataBinding: true },
                { target: 'fileType', type: 'list', options: _.mapValues(this._defaultFileTypesToOpen, 'label'), value: 'pdf', dataBinding: true, hide: true },
                { target: 'spinnerContext', hide: false },
                { target: 'spinnerMessage', hide: false }
            ];
            this.requiredCordovaPlugins = [];
        }
        OpenFileOperation.prototype.invoke = function (variable, options, dataBindings) {
            var fileType = this._defaultFileTypesToOpen[dataBindings.get('fileType')];
            var filePath = dataBindings.get('filePath');
            // if relative path is given, then append url with deployedUrl, to access files in resources.
            if (!core$2.isValidWebURL(filePath)) {
                filePath = variables.$rootScope.project.deployedUrl + filePath;
            }
            return this.fileOpener.openRemoteFile(filePath, fileType.extension);
        };
        return OpenFileOperation;
    }());
    var UploadFileOperation = /** @class */ (function () {
        function UploadFileOperation(fileUploader) {
            this.fileUploader = fileUploader;
            this.name = 'upload';
            this.model = {
                fileName: '',
                path: '',
                length: 0,
                success: false,
                inlinePath: '',
                errorMessage: '',
                inProgress: false,
                loaded: 0
            };
            this.properties = [
                { target: 'localFile', type: 'string', value: '', dataBinding: true },
                { target: 'remoteFolder', type: 'string', value: '', dataBinding: true },
                { target: 'onProgress', hide: false },
                { target: 'spinnerContext', hide: false },
                { target: 'spinnerMessage', hide: false }
            ];
            this.requiredCordovaPlugins = [];
        }
        UploadFileOperation.prototype.invoke = function (variable, options, dataBindings) {
            var serverUrl = variables.$rootScope.project.deployedUrl + 'services/file/uploadFile?relativePath=' + (dataBindings.get('remoteFolder') || ''), filePath = dataBindings.get('localFile'), fileName = filePath.split('/').pop(), data = {
                fileName: fileName,
                fileSize: 0,
                inProgress: true,
                length: 0,
                loaded: 0
            };
            return this.fileUploader.upload(serverUrl, 'files', filePath, fileName)
                .then(function (uploadResponse) {
                _.assignIn(data, JSON.parse(uploadResponse.text)[0]);
                data.loaded = data.length;
                return data;
            });
        };
        return UploadFileOperation;
    }());

    var APP_IS_OFFLINE = 'App is offline.';
    var OFFLINE_PLUGIN_NOT_FOUND = 'Offline DB Plugin is required, but missing.';
    var ON_BEFORE_BLOCKED = 'onBefore callback returned false.';
    var REQUIRED_PLUGINS = ['OFFLINE_DB', 'NETWORK'];
    var DatasyncService = /** @class */ (function (_super) {
        __extends(DatasyncService, _super);
        function DatasyncService(app, changeLogService, fileSelectorService, localDBManagementService, localDBDataPullService, processManagementService, securityService, networkService) {
            var _this = _super.call(this) || this;
            _this.name = 'datasync';
            _this.operations = [];
            _this.operations.push(new ExportDBOperation(localDBManagementService));
            _this.operations.push(new GetOfflineChangesOperation(changeLogService));
            _this.operations.push(new ImportDBOperation(fileSelectorService, localDBManagementService));
            _this.operations.push(new LastPullInfoOperation(localDBDataPullService));
            _this.operations.push(new LastPushInfoOperation(changeLogService));
            _this.operations.push(new PullOperation(app, processManagementService, networkService, securityService, localDBDataPullService));
            _this.operations.push(new PushOperation(app, changeLogService, processManagementService, networkService, securityService));
            return _this;
        }
        return DatasyncService;
    }(variables.DeviceVariableService));
    var ExportDBOperation = /** @class */ (function () {
        function ExportDBOperation(localDBManagementService) {
            this.localDBManagementService = localDBManagementService;
            this.name = 'exportDB';
            this.model = { path: '' };
            this.properties = [
                { target: 'spinnerContext', hide: false },
                { target: 'spinnerMessage', hide: false }
            ];
            this.requiredCordovaPlugins = REQUIRED_PLUGINS;
        }
        ExportDBOperation.prototype.invoke = function (variable, options, dataBindings) {
            if (window['SQLitePlugin']) {
                return this.localDBManagementService.exportDB();
            }
            return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
        };
        return ExportDBOperation;
    }());
    var GetOfflineChangesOperation = /** @class */ (function () {
        function GetOfflineChangesOperation(changeLogService) {
            this.changeLogService = changeLogService;
            this.name = 'getOfflineChanges';
            this.model = {
                total: 0,
                pendingToSync: GetOfflineChangesOperation.CHANGE_LOG_SET,
                failedToSync: GetOfflineChangesOperation.CHANGE_LOG_SET
            };
            this.properties = [
                { target: 'startUpdate', type: 'boolean', value: true, hide: true },
                { target: 'autoUpdate', type: 'boolean', value: true, hide: true }
            ];
            this.requiredCordovaPlugins = REQUIRED_PLUGINS;
        }
        GetOfflineChangesOperation.prototype.invoke = function (variable, options, dataBindings) {
            if (window['SQLitePlugin']) {
                return getOfflineChanges(this.changeLogService);
            }
            return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
        };
        GetOfflineChangesOperation.DATA_CHANGE_TEMPLATE = {
            service: 'DatabaseService',
            operation: 'operation',
            params: {
                data: {},
                dataModelName: 'dataModelName',
                entityName: 'entityName'
            },
            hasError: 0,
            errorMessage: ''
        };
        GetOfflineChangesOperation.CHANGE_LOG_SET = {
            total: 0,
            database: {
                create: [GetOfflineChangesOperation.DATA_CHANGE_TEMPLATE],
                update: [GetOfflineChangesOperation.DATA_CHANGE_TEMPLATE],
                delete: [GetOfflineChangesOperation.DATA_CHANGE_TEMPLATE]
            },
            uploads: [{
                    service: 'OfflineFileUploadService',
                    operation: 'uploadToServer',
                    params: {
                        file: 'localFilePath',
                        serverUrl: 'serverUrl',
                        ftOptions: {}
                    },
                    hasError: 0,
                    errorMessage: ''
                }]
        };
        return GetOfflineChangesOperation;
    }());
    var LastPullInfoOperation = /** @class */ (function () {
        function LastPullInfoOperation(localDBDataPullService) {
            this.localDBDataPullService = localDBDataPullService;
            this.name = 'lastPullInfo';
            this.model = {
                databases: [{
                        name: 'datbaseName',
                        entities: [{
                                entityName: 'entityName',
                                pulledRecordCount: 0
                            }],
                        pulledRecordCount: 0
                    }],
                totalPulledRecordCount: 0,
                startTime: new Date().toJSON(),
                endTime: new Date().toJSON()
            };
            this.properties = [
                { target: 'startUpdate', type: 'boolean', value: true, hide: true },
                { target: 'spinnerContext', hide: false },
                { target: 'spinnerMessage', hide: false }
            ];
            this.requiredCordovaPlugins = REQUIRED_PLUGINS;
        }
        LastPullInfoOperation.prototype.invoke = function (variable, options, dataBindings) {
            if (window['SQLitePlugin']) {
                return this.localDBDataPullService.getLastPullInfo();
            }
            return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
        };
        return LastPullInfoOperation;
    }());
    var LastPushInfoOperation = /** @class */ (function () {
        function LastPushInfoOperation(changeLogService) {
            this.changeLogService = changeLogService;
            this.name = 'lastPushInfo';
            this.model = {
                successfulTaskCount: 0,
                failedTaskCount: 0,
                completedTaskCount: 0,
                totalTaskCount: 0,
                startTime: new Date().toJSON(),
                endTime: new Date().toJSON()
            };
            this.properties = [
                { target: 'startUpdate', type: 'boolean', value: true, hide: true },
                { target: 'spinnerContext', hide: false },
                { target: 'spinnerMessage', hide: false }
            ];
            this.requiredCordovaPlugins = REQUIRED_PLUGINS;
        }
        LastPushInfoOperation.prototype.invoke = function (variable, options, dataBindings) {
            if (window['SQLitePlugin']) {
                return this.changeLogService.getLastPushInfo();
            }
            return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
        };
        return LastPushInfoOperation;
    }());
    var ImportDBOperation = /** @class */ (function () {
        function ImportDBOperation(fileSelectorService, localDBManagementService) {
            this.fileSelectorService = fileSelectorService;
            this.localDBManagementService = localDBManagementService;
            this.name = 'importDB';
            this.model = {};
            this.properties = [
                { target: 'spinnerContext', hide: false },
                { target: 'spinnerMessage', hide: false }
            ];
            this.requiredCordovaPlugins = REQUIRED_PLUGINS;
        }
        ImportDBOperation.prototype.invoke = function (variable, options, dataBindings) {
            var _this = this;
            if (window['SQLitePlugin']) {
                return this.fileSelectorService.selectFiles(false, 'zip')
                    .then(function (files) {
                    if (files && files.length) {
                        return _this.localDBManagementService.importDB(files[0].path, true);
                    }
                });
            }
            return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
        };
        return ImportDBOperation;
    }());
    var PullOperation = /** @class */ (function () {
        function PullOperation(app, processManagementService, networkService, securityService, localDBDataPullService) {
            this.app = app;
            this.processManagementService = processManagementService;
            this.networkService = networkService;
            this.securityService = securityService;
            this.localDBDataPullService = localDBDataPullService;
            this.name = 'pull';
            this.model = {
                totalTaskCount: 0,
                completedTaskCount: 0,
                inProgress: false
            };
            this.properties = [
                { target: 'clearData', type: 'boolean', widgettype: 'boolean-inputfirst', value: true, group: 'properties', subGroup: 'behavior' },
                { target: 'startUpdate', type: 'boolean', hide: false },
                { target: 'onBefore', hide: false },
                { target: 'onProgress', hide: false },
                { target: 'showProgress', hide: false }
            ];
            this.requiredCordovaPlugins = REQUIRED_PLUGINS;
        }
        PullOperation.prototype.invoke = function (variable, options, dataBindings) {
            var _this = this;
            var progressInstance;
            return canExecute(variable, this.networkService, this.securityService)
                .then(function () {
                if (variable.showProgress) {
                    return _this.processManagementService.createInstance(_this.app.appLocale.LABEL_DATA_PULL_PROGRESS, 0, 0);
                }
                return null;
            }).then(function (instance) {
                var progressObserver = {
                    next: function (pullInfo) {
                        // variable.dataSet = progress; Todo: progress
                        variables.initiateCallback('onProgress', variable, pullInfo);
                        if (progressInstance) {
                            progressInstance.set('max', pullInfo.totalRecordsToPull);
                            progressInstance.set('value', pullInfo.totalPulledRecordCount);
                        }
                    }, error: core$2.noop, complete: core$2.noop
                };
                var clearData = variable.clearData === 'true' || variable.clearData === true, pullPromise = _this.localDBDataPullService.pullAllDbData(clearData, progressObserver);
                if (instance) {
                    progressInstance = instance;
                    progressInstance.set('stopButtonLabel', _this.app.appLocale.LABEL_DATA_PULL_PROGRESS_STOP_BTN);
                    progressInstance.set('onStop', function () {
                        _this.localDBDataPullService.cancel(pullPromise);
                    });
                }
                return pullPromise;
            }).catch(function (pullInfo) { return pullInfo; })
                .then(function (pullInfo) {
                if (progressInstance) {
                    progressInstance.destroy();
                }
                return pullInfo;
            });
        };
        return PullOperation;
    }());
    var PushOperation = /** @class */ (function () {
        function PushOperation(app, changeLogService, processManagementService, networkService, securityService) {
            this.app = app;
            this.changeLogService = changeLogService;
            this.processManagementService = processManagementService;
            this.networkService = networkService;
            this.securityService = securityService;
            this.name = 'push';
            this.model = {
                successfulTaskCount: 0,
                failedTaskCount: 0,
                completedTaskCount: 0,
                totalTaskCount: 0,
                inProgress: false
            };
            this.properties = [
                { target: 'onBefore', hide: false },
                { target: 'onProgress', hide: false },
                { target: 'showProgress', 'hide': false, 'value': true }
            ];
            this.requiredCordovaPlugins = REQUIRED_PLUGINS;
        }
        PushOperation.prototype.invoke = function (variable, options, dataBindings) {
            var _this = this;
            var progressInstance;
            if (this.changeLogService.isFlushInProgress()) {
                return Promise.resolve();
            }
            return canExecute(variable, this.networkService, this.securityService)
                .then(function () { return getOfflineChanges(_this.changeLogService); })
                .then(function (changes) {
                if (changes.pendingToSync.total <= 0) {
                    return Promise.reject(_.clone(_this.model));
                }
            }).then(function () {
                if (variable.showProgress) {
                    return _this.processManagementService.createInstance(_this.app.appLocale.LABEL_DATA_PUSH_PROGRESS, 0, 0);
                }
                return null;
            }).then(function (instance) {
                var progressObserver = {
                    next: function (pushInfo) {
                        pushInfo = addOldPropertiesForPushData(pushInfo);
                        variables.initiateCallback('onProgress', variable, pushInfo);
                        if (progressInstance) {
                            progressInstance.set('max', pushInfo.totalTaskCount);
                            progressInstance.set('value', pushInfo.completedTaskCount);
                        }
                    }, error: core$2.noop, complete: core$2.noop
                };
                var pushPromise = _this.changeLogService.flush(progressObserver);
                if (instance) {
                    progressInstance = instance;
                    progressInstance.set('stopButtonLabel', _this.app.appLocale.LABEL_DATA_PUSH_PROGRESS_STOP_BTN);
                    progressInstance.set('onStop', function () { return _this.changeLogService.stop(); });
                }
                return pushPromise;
            })
                .catch(function (pushInfo) { return pushInfo; })
                .then(function (pushInfo) {
                if (progressInstance) {
                    progressInstance.destroy();
                }
                if (pushInfo && pushInfo.totalTaskCount !== undefined) {
                    pushInfo = addOldPropertiesForPushData(pushInfo);
                    if (pushInfo.failedTaskCount !== 0) {
                        return Promise.reject(pushInfo);
                    }
                    return pushInfo;
                }
                return Promise.reject(pushInfo);
            });
        };
        return PushOperation;
    }());
    /**
     * This function adds the old properties to the push dataSet to support old projects.
     * @param data
     * @returns {*}
     */
    var addOldPropertiesForPushData = function (data) {
        var result = _.clone(data);
        result.success = data.successfulTaskCount;
        result.error = data.failedTaskCount;
        result.completed = data.completedTaskCount;
        result.total = data.totalTaskCount;
        return result;
    };
    var canExecute = function (variable, networkService, securityService) {
        if (!window['SQLitePlugin']) {
            return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
        }
        if (!networkService.isConnected()) {
            return Promise.reject(APP_IS_OFFLINE);
        }
        return core$2.toPromise(variables.initiateCallback(variables.VARIABLE_CONSTANTS.EVENT.BEFORE, variable, null))
            .then(function (proceed) {
            if (proceed === false) {
                return Promise.reject(ON_BEFORE_BLOCKED);
            }
            // If user is authenticated and online, then start the data pull process.
            return securityService.onUserLogin();
        });
    };
    var generateChangeSet = function (changes) {
        var createChanges = _.filter(changes, function (c) {
            return c.service === 'DatabaseService' &&
                (c.operation === 'insertTableData'
                    || c.operation === 'insertMultiPartTableData');
        }), updateChanges = _.filter(changes, function (c) {
            return c.service === 'DatabaseService' &&
                (c.operation === 'updateTableData'
                    || c.operation === 'updateMultiPartTableData');
        });
        return {
            total: changes ? changes.length : 0,
            database: {
                create: createChanges,
                update: updateChanges,
                delete: _.filter(changes, { service: 'DatabaseService', operation: 'deleteTableData' })
            },
            uploads: _.filter(changes, { service: 'OfflineFileUploadService', operation: 'uploadToServer' })
        };
    };
    var getOfflineChanges = function (changeLogService) {
        return changeLogService.getChanges().then(function (changes) {
            return {
                'total': changes ? changes.length : 0,
                'pendingToSync': generateChangeSet(_.filter(changes, { 'hasError': 0 })),
                'failedToSync': generateChangeSet(_.filter(changes, { 'hasError': 1 }))
            };
        });
    };

    /**
     * this file contains all device operations under 'device' service.
     */
    var DeviceService = /** @class */ (function (_super) {
        __extends(DeviceService, _super);
        function DeviceService(app, appVersion$$1, device$$1, geoLocation, networkService, vibrateService) {
            var _this = _super.call(this) || this;
            _this.name = 'device';
            _this.operations = [];
            _this.operations.push(new AppInfoOperation(device$$1, appVersion$$1), new CurrentGeoPositionOperation(geoLocation), new DeviceInfoOperation(device$$1), new GetNetworkInfoOperation(app, networkService), new GoOfflineOperation(networkService), new GoOnlineOperation(networkService), new VibrateOperation(vibrateService));
            app.subscribe('onNetworkStateChange', function (data) {
                app.networkStatus = data;
                core$2.$appDigest();
            });
            app.networkStatus = {
                isConnecting: false,
                isConnected: true,
                isNetworkAvailable: true,
                isServiceAvailable: true
            };
            return _this;
        }
        return DeviceService;
    }(variables.DeviceVariableService));
    /**
     * This class handles 'getAppInfo' device operation.
     */
    var AppInfoOperation = /** @class */ (function () {
        function AppInfoOperation(device$$1, appVersion$$1) {
            this.device = device$$1;
            this.appVersion = appVersion$$1;
            this.name = 'getAppInfo';
            this.model = {
                appversion: 'X.X.X',
                cordovaversion: 'X.X.X'
            };
            this.properties = [
                { target: 'startUpdate', type: 'boolean', value: true, hide: true }
            ];
        }
        AppInfoOperation.prototype.invoke = function (variable, options) {
            var cordovaVersion = this.device.cordova;
            return this.appVersion.getVersionNumber().then(function (appVersion$$1) {
                return {
                    appversion: appVersion$$1,
                    cordovaversion: cordovaVersion
                };
            });
        };
        return AppInfoOperation;
    }());
    /**
     * This class handles 'getCurrentGeoPosition' device operation.
     */
    var CurrentGeoPositionOperation = /** @class */ (function () {
        function CurrentGeoPositionOperation(geoLocation) {
            this.geoLocation = geoLocation;
            this.name = 'getCurrentGeoPosition';
            this.model = {
                coords: {
                    latitude: 0,
                    longitude: 0,
                    altitude: 0,
                    accuracy: 0,
                    altitudeAccuracy: 0,
                    heading: 0,
                    speed: 0
                },
                timestamp: 0
            };
            this.properties = [
                { target: 'startUpdate', type: 'boolean', value: true, hide: true },
                { target: 'autoUpdate', type: 'boolean', value: true, hide: true },
                { target: 'geolocationHighAccuracy', type: 'boolean', value: true, dataBinding: true },
                { target: 'geolocationMaximumAge', type: 'number', value: 3, dataBinding: true },
                { target: 'geolocationTimeout', type: 'number', value: 5, dataBinding: true }
            ];
            this.requiredCordovaPlugins = ['GEOLOCATION'];
            this.waitingQueue = [];
            this.options = {
                maximumAge: 3000,
                timeout: (2 * 60) * 1000,
                enableHighAccuracy: true
            };
        }
        CurrentGeoPositionOperation.prototype.watchPosition = function () {
            var _this = this;
            if (this.watchId) {
                navigator.geolocation.clearWatch(this.watchId);
                this.watchId = null;
            }
            var options = window['WM_GEO_LOCATION_OPTIONS'] || this.options;
            this.watchId = navigator.geolocation.watchPosition(function (position) {
                _this.lastKnownPosition = {
                    coords: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        altitude: position.coords.altitude,
                        accuracy: position.coords.accuracy,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed
                    },
                    timestamp: position.timestamp
                };
                if (_this.waitingQueue.length > 0) {
                    _this.waitingQueue.forEach(function (fn) { return fn(_this.lastKnownPosition); });
                    _this.waitingQueue.length = 0;
                }
                $(document).off('touchend.usergesture');
            }, function () {
                _this.watchId = null;
            }, options);
        };
        CurrentGeoPositionOperation.prototype.invoke = function (variable, options, dataBindings) {
            var _this = this;
            if (!this.watchId || !this.lastKnownPosition) {
                this.watchPosition();
                $(document).on('touchend.usergesture', function () { return _this.watchPosition(); });
            }
            var geoLocationOptions = {
                maximumAge: dataBindings.get('geolocationMaximumAge') * 1000,
                timeout: dataBindings.get('geolocationTimeout') * 1000,
                enableHighAccuracy: dataBindings.get('geolocationHighAccuracy')
            };
            if (this.lastKnownPosition) {
                return Promise.resolve(this.lastKnownPosition);
            }
            return new Promise(function (resolve) {
                var c = function (position) {
                    resolve(position);
                };
                setTimeout(function () {
                    var index = _this.waitingQueue.indexOf(c);
                    if (index > -1) {
                        _this.waitingQueue.splice(index, 1);
                        resolve(_this.model);
                    }
                }, _this.options.timeout);
                _this.waitingQueue.push(c);
            });
        };
        return CurrentGeoPositionOperation;
    }());
    /**
     * This class handles 'getDeviceInfo' device operation.
     */
    var DeviceInfoOperation = /** @class */ (function () {
        function DeviceInfoOperation(device$$1) {
            this.device = device$$1;
            this.name = 'getDeviceInfo';
            this.model = {
                deviceModel: 'DEVICEMODEL',
                os: 'DEVICEOS',
                osVersion: 'X.X.X',
                deviceUUID: 'DEVICEUUID'
            };
            this.properties = [
                { target: 'startUpdate', type: 'boolean', value: true, hide: true }
            ];
        }
        DeviceInfoOperation.prototype.invoke = function (variable, options) {
            var response = {
                'deviceModel': this.device.model,
                'os': this.device.platform,
                'osVersion': this.device.version,
                'deviceUUID': this.device.uuid
            };
            return Promise.resolve(response);
        };
        return DeviceInfoOperation;
    }());
    var GetNetworkInfoOperation = /** @class */ (function () {
        function GetNetworkInfoOperation(app, networkService) {
            this.app = app;
            this.networkService = networkService;
            this.name = 'getNetworkInfo';
            this.model = {
                connectionType: 'NONE',
                isConnecting: false,
                isNetworkAvailable: true,
                isOnline: true,
                isOffline: false
            };
            this.properties = [
                { target: 'autoUpdate', type: 'boolean', value: true, hide: true },
                { target: 'startUpdate', type: 'boolean', value: true, hide: true },
                { target: 'networkStatus', type: 'object', value: 'bind:App.networkStatus', dataBinding: true, hide: true },
                { target: 'onOnline', hide: false },
                { target: 'onOffline', hide: false }
            ];
            this.requiredCordovaPlugins = ['NETWORK'];
        }
        GetNetworkInfoOperation.prototype.invoke = function (variable, options, dataBindings) {
            var data = {
                connectionType: navigator.connection.type,
                isConnecting: this.app.networkStatus.isConnecting,
                isNetworkAvailable: this.app.networkStatus.isNetworkAvailable,
                isOnline: this.app.networkStatus.isConnected,
                isOffline: !this.app.networkStatus.isConnected
            };
            if (this.networkService.isConnected()) {
                variables.initiateCallback('onOnline', variable, data);
            }
            else {
                variables.initiateCallback('onOffline', variable, data);
            }
            return Promise.resolve(data);
        };
        return GetNetworkInfoOperation;
    }());
    var GoOfflineOperation = /** @class */ (function () {
        function GoOfflineOperation(networkService) {
            this.networkService = networkService;
            this.name = 'goOffline';
            this.model = {};
            this.properties = [];
            this.requiredCordovaPlugins = ['NETWORK'];
        }
        GoOfflineOperation.prototype.invoke = function (variable, options, dataBindings) {
            return this.networkService.disconnect();
        };
        return GoOfflineOperation;
    }());
    var GoOnlineOperation = /** @class */ (function () {
        function GoOnlineOperation(networkService) {
            this.networkService = networkService;
            this.name = 'goOnline';
            this.model = {};
            this.properties = [];
            this.requiredCordovaPlugins = ['NETWORK'];
        }
        GoOnlineOperation.prototype.invoke = function (variable, options, dataBindings) {
            return this.networkService.connect();
        };
        return GoOnlineOperation;
    }());
    /**
     * This class handles 'vibrate' device operation.
     */
    var VibrateOperation = /** @class */ (function () {
        function VibrateOperation(vibrationService) {
            this.vibrationService = vibrationService;
            this.name = 'vibrate';
            this.model = {
                appversion: 'X.X.X',
                cordovaversion: 'X.X.X'
            };
            this.properties = [
                { target: 'vibrationtime', type: 'number', value: 2, dataBinding: true }
            ];
            this.requiredCordovaPlugins = ['VIBRATE'];
        }
        VibrateOperation.prototype.invoke = function (variable, options, dataBindings) {
            this.vibrationService.vibrate(dataBindings.get('vibrationtime') * 1000);
            return Promise.resolve();
        };
        return VibrateOperation;
    }());

    var ContactsService = /** @class */ (function (_super) {
        __extends(ContactsService, _super);
        function ContactsService(contacts$$1) {
            var _this = _super.call(this) || this;
            _this.name = 'contacts';
            _this.operations = [];
            _this.operations.push(new GetContactsOperation(contacts$$1));
            return _this;
        }
        return ContactsService;
    }(variables.DeviceVariableService));
    var GetContactsOperation = /** @class */ (function () {
        function GetContactsOperation(contacts$$1) {
            this.contacts = contacts$$1;
            this.name = 'getContacts';
            this.model = {
                id: '',
                displayName: '',
                phoneNumbers: [{ value: '' }]
            };
            this.properties = [
                { target: 'startUpdate', type: 'boolean' },
                { target: 'autoUpdate', type: 'boolean' },
                { target: 'contactFilter', type: 'string', value: '', dataBinding: true }
            ];
            this.requiredCordovaPlugins = ['CONTACTS'];
            this.waitingCalls = [];
        }
        GetContactsOperation.prototype.extractDisplayName = function (c) {
            var name = c.displayName;
            // In IOS, displayName is undefined, so using the formatted name.
            if (!name || name === '') {
                if (c.name.formatted) {
                    return c.name.formatted;
                }
            }
            return name;
        };
        GetContactsOperation.prototype.processNextCall = function () {
            if (this.waitingCalls.length > 0) {
                this.waitingCalls[0]();
            }
        };
        GetContactsOperation.prototype.findContacts = function (requiredFields, findOptions) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                // Contacts plugin is not processing two simultaneous calls. It is anwsering to only call.
                _this.waitingCalls.push(function () {
                    _this.contacts.find(requiredFields, findOptions).then(function (data) {
                        if (data != null) {
                            var contacts$$1 = data.filter(function (c) {
                                c.displayName = _this.extractDisplayName(c);
                                return c.phoneNumbers && c.phoneNumbers.length > 0;
                            });
                            resolve(contacts$$1);
                        }
                    }, reject).then(function () {
                        _this.waitingCalls.shift();
                        _this.processNextCall();
                    });
                });
                if (_this.waitingCalls.length === 1) {
                    _this.processNextCall();
                }
            });
        };
        GetContactsOperation.prototype.invoke = function (variable, options, dataBindings) {
            var requiredFields = ['displayName', 'name'];
            var findOptions = {
                filter: dataBindings.get('contactFilter'),
                multiple: true
            };
            return this.findContacts(requiredFields, findOptions);
        };
        return GetContactsOperation;
    }());

    var barcodeFormatOptions = {
        'ALL': 'ALL',
        'CODABAR': 'CODABAR (not supported in iOS)',
        'CODE_39': 'CODE_39',
        'CODE_93': 'CODE_93 (not supported in iOS)',
        'CODE_128': 'CODE_128',
        'DATA_MATRIX': 'DATA_MATRIX',
        'EAN_8': 'EAN_8',
        'EAN_13': 'EAN_13',
        'ITF': 'ITF',
        'PDF_417': 'PDF_417 (not supported in iOS)',
        'QR_CODE': 'QR_CODE',
        'RSS14': 'RSS14 (not supported in iOS)',
        'RSS_EXPANDED': 'RSS_EXPANDED (not supported in iOS)',
        'UPC_E': 'UPC_E',
        'UPC_A': 'UPC_A'
    };
    var ScanService = /** @class */ (function (_super) {
        __extends(ScanService, _super);
        function ScanService(barcodeScanner$$1) {
            var _this = _super.call(this) || this;
            _this.name = 'scan';
            _this.operations = [];
            _this.operations.push(new ScanOperation(barcodeScanner$$1));
            return _this;
        }
        return ScanService;
    }(variables.DeviceVariableService));
    var ScanOperation = /** @class */ (function () {
        function ScanOperation(barcodeScanner$$1) {
            this.barcodeScanner = barcodeScanner$$1;
            this.name = 'scanBarCode';
            this.model = {
                text: 'BAR CODE',
                format: 'TEXT',
                cancelled: false
            };
            this.properties = [
                {
                    target: 'barcodeFormat',
                    type: 'list',
                    options: barcodeFormatOptions,
                    value: 'ALL',
                    group: 'properties',
                    subGroup: 'behavior',
                    hide: false
                }
            ];
            this.requiredCordovaPlugins = ['BARCODE_SCANNER'];
        }
        ScanOperation.prototype.invoke = function (variable, options) {
            var scanOptions;
            if (variable.barcodeFormat && variable.barcodeFormat !== 'ALL') {
                scanOptions = { formats: variable.barcodeFormat };
            }
            return this.barcodeScanner.scan(scanOptions);
        };
        return ScanOperation;
    }());

    var VariablesModule = /** @class */ (function () {
        function VariablesModule(app, appVersion$$1, barcodeScanner$$1, changeLogService, calendar$$1, contacts$$1, camera$$1, fileOpener, fileSelectorService, fileUploader, device$$1, geoLocation, localDBDataPullService, localDBManagementService, mediaCapture$$1, processManagementService, securityService, networkService, vibrateService) {
            VariablesModule.initialize(app, appVersion$$1, barcodeScanner$$1, changeLogService, calendar$$1, contacts$$1, camera$$1, fileOpener, fileSelectorService, fileUploader, device$$1, geoLocation, localDBDataPullService, localDBManagementService, mediaCapture$$1, processManagementService, securityService, networkService, vibrateService);
        }
        // Device variable services have to be added only once in the app life-cycle.
        VariablesModule.initialize = function (app, appVersion$$1, barcodeScanner$$1, changeLogService, calendar$$1, contacts$$1, camera$$1, fileOpener, fileSelectorService, fileUploader, device$$1, geoLocation, localDBDataPullService, localDBManagementService, mediaCapture$$1, processManagementService, securityService, networkService, vibrateService) {
            if (this.initialized) {
                return;
            }
            this.initialized = true;
            var deviceVariableManager = variables.VariableManagerFactory.get(variables.VARIABLE_CONSTANTS.CATEGORY.DEVICE);
            deviceVariableManager.registerService(new CameraService(camera$$1, mediaCapture$$1));
            deviceVariableManager.registerService(new CalendarService(calendar$$1));
            deviceVariableManager.registerService(new FileService(fileOpener, fileUploader));
            deviceVariableManager.registerService(new ContactsService(contacts$$1));
            deviceVariableManager.registerService(new DatasyncService(app, changeLogService, fileSelectorService, localDBManagementService, localDBDataPullService, processManagementService, securityService, networkService));
            deviceVariableManager.registerService(new DeviceService(app, appVersion$$1, device$$1, geoLocation, networkService, vibrateService));
            deviceVariableManager.registerService(new ScanService(barcodeScanner$$1));
        };
        VariablesModule.initialized = false;
        VariablesModule.decorators = [
            { type: core.NgModule, args: [{
                        imports: [
                            offline.OfflineModule
                        ],
                        declarations: [],
                        providers: [
                        // add providers to mobile-runtime module.
                        ]
                    },] }
        ];
        /** @nocollapse */
        VariablesModule.ctorParameters = function () {
            return [
                { type: core$2.App },
                { type: appVersion.AppVersion },
                { type: barcodeScanner.BarcodeScanner },
                { type: offline.ChangeLogService },
                { type: calendar.Calendar },
                { type: contacts.Contacts },
                { type: camera.Camera },
                { type: core$1.DeviceFileOpenerService },
                { type: components.FileSelectorService },
                { type: core$1.DeviceFileUploadService },
                { type: device.Device },
                { type: geolocation.Geolocation },
                { type: offline.LocalDBDataPullService },
                { type: offline.LocalDBManagementService },
                { type: mediaCapture.MediaCapture },
                { type: components.ProcessManagementService },
                { type: security.SecurityService },
                { type: core$1.NetworkService },
                { type: vibration.Vibration }
            ];
        };
        return VariablesModule;
    }());

    /**
     * Generated bundle index. Do not edit.
     */

    exports.VariablesModule = VariablesModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=index.umd.js.map