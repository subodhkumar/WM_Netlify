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
import { DeviceFileOpenerService, DeviceFileUploadService, NetworkService } from '@wm/mobile/core';
import { ChangeLogService, LocalDBManagementService, LocalDBDataPullService, OfflineModule } from '@wm/mobile/offline';
import { SecurityService } from '@wm/security';
import { isNumber, isValidWebURL, noop, toPromise, $appDigest, App } from '@wm/core';
import { DeviceVariableService, $rootScope, initiateCallback, VARIABLE_CONSTANTS, VariableManagerFactory } from '@wm/variables';
import { FileSelectorService, ProcessManagementService } from '@wm/mobile/components';

const DEFAULT_TIME = new Date().getTime();
/*3 months timestamp value*/
const DELTA_VALUE_DATE = (3 * 30 * 24 * 60 * 60 * 1000);
const DEFAULT_START_DATE = (DEFAULT_TIME - DELTA_VALUE_DATE);
const DEFAULT_END_DATE = (DEFAULT_TIME + DELTA_VALUE_DATE);
const EVENT_META = {
    title: '',
    message: '',
    location: '',
    startDate: new Date(),
    endDate: new Date()
};
/**
 * this file contains all calendar operations under 'calendar' service.
 */
class CalendarService extends DeviceVariableService {
    constructor(calendar) {
        super();
        this.name = 'calendar';
        this.operations = [];
        this.operations.push(new CreateEventOperation(calendar), new DeleteEventOperation(calendar), new GetEventsOperation(calendar));
    }
}
class CreateEventOperation {
    constructor(calendar) {
        this.calendar = calendar;
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
    invoke(variable, options, eventInfo) {
        return this.calendar.createEvent(eventInfo.get('eventTitle'), eventInfo.get('eventLocation'), eventInfo.get('eventNotes'), new Date(eventInfo.get('eventStart') || 0), new Date(eventInfo.get('eventEnd') || 0));
    }
}
class DeleteEventOperation {
    constructor(calendar) {
        this.calendar = calendar;
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
    invoke(variable, options, eventInfo) {
        return this.calendar.deleteEvent(eventInfo.get('eventTitle'), eventInfo.get('eventLocation'), eventInfo.get('eventNotes'), new Date(eventInfo.get('eventStart') || DEFAULT_START_DATE), new Date(eventInfo.get('eventEnd') || DEFAULT_END_DATE));
    }
}
class GetEventsOperation {
    constructor(calendar) {
        this.calendar = calendar;
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
    invoke(variable, options, eventInfo) {
        return this.calendar.findEvent(eventInfo.get('eventTitle'), eventInfo.get('eventLocation'), eventInfo.get('eventNotes'), new Date(eventInfo.get('eventStart') || DEFAULT_START_DATE), new Date(eventInfo.get('eventEnd') || DEFAULT_END_DATE));
    }
}

class CameraService extends DeviceVariableService {
    constructor(camera, mediaCapture) {
        super();
        this.name = 'camera';
        this.operations = [];
        this.operations.push(new CaptureImageOperation(camera), new CaptureVideoOperation(mediaCapture));
    }
}
class CaptureImageOperation {
    constructor(camera) {
        this.camera = camera;
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
    invoke(variable, options, dataBindings) {
        const imageTargetWidth = dataBindings.get('imageTargetWidth'), imageTargetHeight = dataBindings.get('imageTargetHeight');
        let imageEncodingType = parseInt(dataBindings.get('imageEncodingType'), 10), cameraOptions;
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
            targetWidth: isNumber(imageTargetWidth) ? imageTargetWidth : undefined,
            targetHeight: isNumber(imageTargetHeight) ? imageTargetHeight : undefined,
        };
        return this.camera.getPicture(cameraOptions).then(data => {
            return { imagePath: data };
        });
    }
}
class CaptureVideoOperation {
    constructor(mediaCapture) {
        this.mediaCapture = mediaCapture;
        this.name = 'captureVideo';
        this.model = {
            videoPath: ''
        };
        this.properties = [];
        this.requiredCordovaPlugins = ['CAMERA', 'CAPTURE'];
    }
    invoke(variable, options) {
        return this.mediaCapture.captureVideo({
            limit: 1
        }).then(data => {
            return { videoPath: data[0].fullPath };
        });
    }
}

class FileService extends DeviceVariableService {
    constructor(fileOpener, fileUploader) {
        super();
        this.name = 'file';
        this.operations = [];
        this.operations.push(new OpenFileOperation(fileOpener), new UploadFileOperation(fileUploader));
    }
}
class OpenFileOperation {
    constructor(fileOpener) {
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
    invoke(variable, options, dataBindings) {
        const fileType = this._defaultFileTypesToOpen[dataBindings.get('fileType')];
        let filePath = dataBindings.get('filePath');
        // if relative path is given, then append url with deployedUrl, to access files in resources.
        if (!isValidWebURL(filePath)) {
            filePath = $rootScope.project.deployedUrl + filePath;
        }
        return this.fileOpener.openRemoteFile(filePath, fileType.extension);
    }
}
class UploadFileOperation {
    constructor(fileUploader) {
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
    invoke(variable, options, dataBindings) {
        const serverUrl = $rootScope.project.deployedUrl + 'services/file/uploadFile?relativePath=' + (dataBindings.get('remoteFolder') || ''), filePath = dataBindings.get('localFile'), fileName = filePath.split('/').pop(), data = {
            fileName: fileName,
            fileSize: 0,
            inProgress: true,
            length: 0,
            loaded: 0
        };
        return this.fileUploader.upload(serverUrl, 'files', filePath, fileName)
            .then(uploadResponse => {
            _.assignIn(data, JSON.parse(uploadResponse.text)[0]);
            data.loaded = data.length;
            return data;
        });
    }
}

const APP_IS_OFFLINE = 'App is offline.';
const OFFLINE_PLUGIN_NOT_FOUND = 'Offline DB Plugin is required, but missing.';
const ON_BEFORE_BLOCKED = 'onBefore callback returned false.';
const REQUIRED_PLUGINS = ['OFFLINE_DB', 'NETWORK'];
class DatasyncService extends DeviceVariableService {
    constructor(app, changeLogService, fileSelectorService, localDBManagementService, localDBDataPullService, processManagementService, securityService, networkService) {
        super();
        this.name = 'datasync';
        this.operations = [];
        this.operations.push(new ExportDBOperation(localDBManagementService));
        this.operations.push(new GetOfflineChangesOperation(changeLogService));
        this.operations.push(new ImportDBOperation(fileSelectorService, localDBManagementService));
        this.operations.push(new LastPullInfoOperation(localDBDataPullService));
        this.operations.push(new LastPushInfoOperation(changeLogService));
        this.operations.push(new PullOperation(app, processManagementService, networkService, securityService, localDBDataPullService));
        this.operations.push(new PushOperation(app, changeLogService, processManagementService, networkService, securityService));
    }
}
class ExportDBOperation {
    constructor(localDBManagementService) {
        this.localDBManagementService = localDBManagementService;
        this.name = 'exportDB';
        this.model = { path: '' };
        this.properties = [
            { target: 'spinnerContext', hide: false },
            { target: 'spinnerMessage', hide: false }
        ];
        this.requiredCordovaPlugins = REQUIRED_PLUGINS;
    }
    invoke(variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return this.localDBManagementService.exportDB();
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}
class GetOfflineChangesOperation {
    constructor(changeLogService) {
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
    invoke(variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return getOfflineChanges(this.changeLogService);
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}
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
class LastPullInfoOperation {
    constructor(localDBDataPullService) {
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
    invoke(variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return this.localDBDataPullService.getLastPullInfo();
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}
class LastPushInfoOperation {
    constructor(changeLogService) {
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
    invoke(variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return this.changeLogService.getLastPushInfo();
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}
class ImportDBOperation {
    constructor(fileSelectorService, localDBManagementService) {
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
    invoke(variable, options, dataBindings) {
        if (window['SQLitePlugin']) {
            return this.fileSelectorService.selectFiles(false, 'zip')
                .then(files => {
                if (files && files.length) {
                    return this.localDBManagementService.importDB(files[0].path, true);
                }
            });
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}
class PullOperation {
    constructor(app, processManagementService, networkService, securityService, localDBDataPullService) {
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
    invoke(variable, options, dataBindings) {
        let progressInstance;
        return canExecute(variable, this.networkService, this.securityService)
            .then(() => {
            if (variable.showProgress) {
                return this.processManagementService.createInstance(this.app.appLocale.LABEL_DATA_PULL_PROGRESS, 0, 0);
            }
            return null;
        }).then((instance) => {
            const progressObserver = {
                next: (pullInfo) => {
                    // variable.dataSet = progress; Todo: progress
                    initiateCallback('onProgress', variable, pullInfo);
                    if (progressInstance) {
                        progressInstance.set('max', pullInfo.totalRecordsToPull);
                        progressInstance.set('value', pullInfo.totalPulledRecordCount);
                    }
                }, error: noop, complete: noop
            };
            const clearData = variable.clearData === 'true' || variable.clearData === true, pullPromise = this.localDBDataPullService.pullAllDbData(clearData, progressObserver);
            if (instance) {
                progressInstance = instance;
                progressInstance.set('stopButtonLabel', this.app.appLocale.LABEL_DATA_PULL_PROGRESS_STOP_BTN);
                progressInstance.set('onStop', () => {
                    this.localDBDataPullService.cancel(pullPromise);
                });
            }
            return pullPromise;
        }).catch(pullInfo => pullInfo)
            .then(pullInfo => {
            if (progressInstance) {
                progressInstance.destroy();
            }
            return pullInfo;
        });
    }
}
class PushOperation {
    constructor(app, changeLogService, processManagementService, networkService, securityService) {
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
    invoke(variable, options, dataBindings) {
        let progressInstance;
        if (this.changeLogService.isFlushInProgress()) {
            return Promise.resolve();
        }
        return canExecute(variable, this.networkService, this.securityService)
            .then(() => getOfflineChanges(this.changeLogService))
            .then(changes => {
            if (changes.pendingToSync.total <= 0) {
                return Promise.reject(_.clone(this.model));
            }
        }).then(() => {
            if (variable.showProgress) {
                return this.processManagementService.createInstance(this.app.appLocale.LABEL_DATA_PUSH_PROGRESS, 0, 0);
            }
            return null;
        }).then((instance) => {
            const progressObserver = {
                next: (pushInfo) => {
                    pushInfo = addOldPropertiesForPushData(pushInfo);
                    initiateCallback('onProgress', variable, pushInfo);
                    if (progressInstance) {
                        progressInstance.set('max', pushInfo.totalTaskCount);
                        progressInstance.set('value', pushInfo.completedTaskCount);
                    }
                }, error: noop, complete: noop
            };
            const pushPromise = this.changeLogService.flush(progressObserver);
            if (instance) {
                progressInstance = instance;
                progressInstance.set('stopButtonLabel', this.app.appLocale.LABEL_DATA_PUSH_PROGRESS_STOP_BTN);
                progressInstance.set('onStop', () => this.changeLogService.stop());
            }
            return pushPromise;
        })
            .catch(pushInfo => pushInfo)
            .then(pushInfo => {
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
    }
}
/**
 * This function adds the old properties to the push dataSet to support old projects.
 * @param data
 * @returns {*}
 */
const addOldPropertiesForPushData = data => {
    const result = _.clone(data);
    result.success = data.successfulTaskCount;
    result.error = data.failedTaskCount;
    result.completed = data.completedTaskCount;
    result.total = data.totalTaskCount;
    return result;
};
const canExecute = (variable, networkService, securityService) => {
    if (!window['SQLitePlugin']) {
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
    if (!networkService.isConnected()) {
        return Promise.reject(APP_IS_OFFLINE);
    }
    return toPromise(initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE, variable, null))
        .then(proceed => {
        if (proceed === false) {
            return Promise.reject(ON_BEFORE_BLOCKED);
        }
        // If user is authenticated and online, then start the data pull process.
        return securityService.onUserLogin();
    });
};
const generateChangeSet = (changes) => {
    const createChanges = _.filter(changes, c => {
        return c.service === 'DatabaseService' &&
            (c.operation === 'insertTableData'
                || c.operation === 'insertMultiPartTableData');
    }), updateChanges = _.filter(changes, c => {
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
const getOfflineChanges = (changeLogService) => {
    return changeLogService.getChanges().then(changes => {
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
class DeviceService extends DeviceVariableService {
    constructor(app, appVersion, device, geoLocation, networkService, vibrateService) {
        super();
        this.name = 'device';
        this.operations = [];
        this.operations.push(new AppInfoOperation(device, appVersion), new CurrentGeoPositionOperation(geoLocation), new DeviceInfoOperation(device), new GetNetworkInfoOperation(app, networkService), new GoOfflineOperation(networkService), new GoOnlineOperation(networkService), new VibrateOperation(vibrateService));
        app.subscribe('onNetworkStateChange', data => {
            app.networkStatus = data;
            $appDigest();
        });
        app.networkStatus = {
            isConnecting: false,
            isConnected: true,
            isNetworkAvailable: true,
            isServiceAvailable: true
        };
    }
}
/**
 * This class handles 'getAppInfo' device operation.
 */
class AppInfoOperation {
    constructor(device, appVersion) {
        this.device = device;
        this.appVersion = appVersion;
        this.name = 'getAppInfo';
        this.model = {
            appversion: 'X.X.X',
            cordovaversion: 'X.X.X'
        };
        this.properties = [
            { target: 'startUpdate', type: 'boolean', value: true, hide: true }
        ];
    }
    invoke(variable, options) {
        const cordovaVersion = this.device.cordova;
        return this.appVersion.getVersionNumber().then(appVersion => {
            return {
                appversion: appVersion,
                cordovaversion: cordovaVersion
            };
        });
    }
}
/**
 * This class handles 'getCurrentGeoPosition' device operation.
 */
class CurrentGeoPositionOperation {
    constructor(geoLocation) {
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
    watchPosition() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        const options = window['WM_GEO_LOCATION_OPTIONS'] || this.options;
        this.watchId = navigator.geolocation.watchPosition(position => {
            this.lastKnownPosition = {
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
            if (this.waitingQueue.length > 0) {
                this.waitingQueue.forEach(fn => fn(this.lastKnownPosition));
                this.waitingQueue.length = 0;
            }
            $(document).off('touchend.usergesture');
        }, () => {
            this.watchId = null;
        }, options);
    }
    invoke(variable, options, dataBindings) {
        if (!this.watchId || !this.lastKnownPosition) {
            this.watchPosition();
            $(document).on('touchend.usergesture', () => this.watchPosition());
        }
        const geoLocationOptions = {
            maximumAge: dataBindings.get('geolocationMaximumAge') * 1000,
            timeout: dataBindings.get('geolocationTimeout') * 1000,
            enableHighAccuracy: dataBindings.get('geolocationHighAccuracy')
        };
        if (this.lastKnownPosition) {
            return Promise.resolve(this.lastKnownPosition);
        }
        return new Promise(resolve => {
            const c = position => {
                resolve(position);
            };
            setTimeout(() => {
                const index = this.waitingQueue.indexOf(c);
                if (index > -1) {
                    this.waitingQueue.splice(index, 1);
                    resolve(this.model);
                }
            }, this.options.timeout);
            this.waitingQueue.push(c);
        });
    }
}
/**
 * This class handles 'getDeviceInfo' device operation.
 */
class DeviceInfoOperation {
    constructor(device) {
        this.device = device;
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
    invoke(variable, options) {
        const response = {
            'deviceModel': this.device.model,
            'os': this.device.platform,
            'osVersion': this.device.version,
            'deviceUUID': this.device.uuid
        };
        return Promise.resolve(response);
    }
}
class GetNetworkInfoOperation {
    constructor(app, networkService) {
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
    invoke(variable, options, dataBindings) {
        const data = {
            connectionType: navigator.connection.type,
            isConnecting: this.app.networkStatus.isConnecting,
            isNetworkAvailable: this.app.networkStatus.isNetworkAvailable,
            isOnline: this.app.networkStatus.isConnected,
            isOffline: !this.app.networkStatus.isConnected
        };
        if (this.networkService.isConnected()) {
            initiateCallback('onOnline', variable, data);
        }
        else {
            initiateCallback('onOffline', variable, data);
        }
        return Promise.resolve(data);
    }
}
class GoOfflineOperation {
    constructor(networkService) {
        this.networkService = networkService;
        this.name = 'goOffline';
        this.model = {};
        this.properties = [];
        this.requiredCordovaPlugins = ['NETWORK'];
    }
    invoke(variable, options, dataBindings) {
        return this.networkService.disconnect();
    }
}
class GoOnlineOperation {
    constructor(networkService) {
        this.networkService = networkService;
        this.name = 'goOnline';
        this.model = {};
        this.properties = [];
        this.requiredCordovaPlugins = ['NETWORK'];
    }
    invoke(variable, options, dataBindings) {
        return this.networkService.connect();
    }
}
/**
 * This class handles 'vibrate' device operation.
 */
class VibrateOperation {
    constructor(vibrationService) {
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
    invoke(variable, options, dataBindings) {
        this.vibrationService.vibrate(dataBindings.get('vibrationtime') * 1000);
        return Promise.resolve();
    }
}

class ContactsService extends DeviceVariableService {
    constructor(contacts) {
        super();
        this.name = 'contacts';
        this.operations = [];
        this.operations.push(new GetContactsOperation(contacts));
    }
}
class GetContactsOperation {
    constructor(contacts) {
        this.contacts = contacts;
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
    extractDisplayName(c) {
        const name = c.displayName;
        // In IOS, displayName is undefined, so using the formatted name.
        if (!name || name === '') {
            if (c.name.formatted) {
                return c.name.formatted;
            }
        }
        return name;
    }
    processNextCall() {
        if (this.waitingCalls.length > 0) {
            this.waitingCalls[0]();
        }
    }
    findContacts(requiredFields, findOptions) {
        return new Promise((resolve, reject) => {
            // Contacts plugin is not processing two simultaneous calls. It is anwsering to only call.
            this.waitingCalls.push(() => {
                this.contacts.find(requiredFields, findOptions).then(data => {
                    if (data != null) {
                        const contacts = data.filter(c => {
                            c.displayName = this.extractDisplayName(c);
                            return c.phoneNumbers && c.phoneNumbers.length > 0;
                        });
                        resolve(contacts);
                    }
                }, reject).then(() => {
                    this.waitingCalls.shift();
                    this.processNextCall();
                });
            });
            if (this.waitingCalls.length === 1) {
                this.processNextCall();
            }
        });
    }
    invoke(variable, options, dataBindings) {
        const requiredFields = ['displayName', 'name'];
        const findOptions = {
            filter: dataBindings.get('contactFilter'),
            multiple: true
        };
        return this.findContacts(requiredFields, findOptions);
    }
}

const barcodeFormatOptions = {
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
class ScanService extends DeviceVariableService {
    constructor(barcodeScanner) {
        super();
        this.name = 'scan';
        this.operations = [];
        this.operations.push(new ScanOperation(barcodeScanner));
    }
}
class ScanOperation {
    constructor(barcodeScanner) {
        this.barcodeScanner = barcodeScanner;
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
    invoke(variable, options) {
        let scanOptions;
        if (variable.barcodeFormat && variable.barcodeFormat !== 'ALL') {
            scanOptions = { formats: variable.barcodeFormat };
        }
        return this.barcodeScanner.scan(scanOptions);
    }
}

class VariablesModule {
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

/**
 * Generated bundle index. Do not edit.
 */

export { VariablesModule };

//# sourceMappingURL=index.js.map