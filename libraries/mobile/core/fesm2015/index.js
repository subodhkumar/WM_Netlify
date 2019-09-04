import { AppVersion } from '@ionic-native/app-version';
import { filter, map } from 'rxjs/operators';
import { FileExtensionFromMimePipe } from '@wm/components';
import { FileOpener } from '@ionic-native/file-opener';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Network } from '@ionic-native/network';
import { File } from '@ionic-native/file';
import { Injectable, NgModule, defineInjectable, inject } from '@angular/core';
import { isAndroid, noop, isIos, $appDigest, hasCordova, App, getAbortableDefer, retryIfFails, convertToBlob } from '@wm/core';

var FileType;
(function (FileType) {
    FileType["AUDIO"] = "AUDIO";
    FileType["DOCUMENT"] = "DOCUMENT";
    FileType["IMAGE"] = "IMAGE";
    FileType["VIDEO"] = "VIDEO";
})(FileType || (FileType = {}));
const IMAGE_EXTENSIONS = ['gif', 'jpg', 'png', 'svg', 'webp', 'jpeg', 'jif', 'jfif', 'jfi'], VIDEO_EXTENSIONS = ['mp4', 'mpg', 'avi', 'wma', 'mp2', '3gp', '3g2', 'm4p', 'm4v', 'mpg', 'fiv'], AUDIO_EXTENSIONS = ['mp3', 'm4p', 'aiff', 'aa', 'aax', 'wma'];
const APP_FOLDER_STRUCTURE = [{
        name: '{APP_NAME}',
        children: [{
                name: 'Media',
                children: [
                    {
                        name: '{APP_NAME} Images',
                        fileType: FileType.IMAGE
                    },
                    {
                        name: '{APP_NAME} Audio',
                        fileType: FileType.AUDIO
                    },
                    {
                        name: '{APP_NAME} Vedios',
                        fileType: FileType.VIDEO
                    },
                    {
                        name: '{APP_NAME} Documents',
                        fileType: FileType.DOCUMENT
                    }
                ]
            }]
    }];
class DeviceFileService {
    constructor(cordovaAppVersion, cordovaFile) {
        this.cordovaAppVersion = cordovaAppVersion;
        this.cordovaFile = cordovaFile;
        this.serviceName = DeviceFileService.name;
        this._fileTypeVsPathMap = {
            'temporary': {},
            'persistent': {}
        };
    }
    addMediaToGallery(filePath) {
        if (isAndroid() && this.isPersistentType(filePath)) {
            return new Promise((resolve, reject) => {
                cordova.plugins.MediaScannerPlugin.scanFile(filePath, resolve, reject);
            });
        }
        return Promise.resolve();
    }
    appendToFileName(fileName, attachment) {
        let splits;
        attachment = attachment || '_' + _.now();
        fileName = fileName || 'noname';
        splits = fileName.split('.');
        if (splits.length > 1) {
            splits[splits.length - 2] = splits[splits.length - 2] + attachment;
            return splits.join('.');
        }
        return fileName + attachment;
    }
    clearTemporaryStorage() {
        return this.cordovaFile.removeRecursively(this.getTemporaryRootPath() + this._appName + '/', 'Media');
    }
    copy(persistent, sourceFilePath) {
        const sourceFilename = sourceFilePath.split('/').pop(), destFolder = this.findFolderPath(persistent, sourceFilename), sourceFolder = sourceFilePath.substring(0, sourceFilePath.lastIndexOf('/'));
        return this.newFileName(destFolder, sourceFilename)
            .then(destFilename => this.cordovaFile.copyFile(sourceFolder, sourceFilename, destFolder, destFilename)
            .then(() => destFolder + destFilename));
    }
    findFolderPath(persistent, fileName) {
        const typeMap = persistent ? this._fileTypeVsPathMap.persistent : this._fileTypeVsPathMap.temporary, fileType = this.findFileType(fileName);
        return typeMap[fileType] || typeMap[FileType.DOCUMENT];
    }
    getPersistentRootPath() {
        return cordova.file.dataDirectory;
    }
    getTemporaryRootPath() {
        return cordova.file.cacheDirectory;
    }
    getUploadDirectory() {
        return this._uploadDir;
    }
    isPersistentType(filePath) {
        return filePath.startsWith(this.getPersistentRootPath());
    }
    isValidPath(filePath) {
        let folder, fileName;
        if (!filePath) {
            return Promise.reject('File path is required');
        }
        folder = filePath.substring(0, filePath.lastIndexOf('/') + 1);
        fileName = filePath.split('/').pop();
        return this.cordovaFile.checkFile(folder, fileName)
            .then(() => filePath);
    }
    listFiles(folder, search) {
        return new Promise((resolve, reject) => {
            resolveLocalFileSystemURL(folder, directory => {
                if (!directory.files) {
                    directory.createReader().readEntries(entries => {
                        if (search) {
                            entries = entries.filter(e => e.name.match(search));
                        }
                        entries = entries.map(e => {
                            return {
                                name: e.name,
                                isDirectory: e.isDirectory,
                                path: e.nativeURL
                            };
                        });
                        resolve(entries);
                    }, reject);
                }
                else {
                    resolve([]);
                }
            }, reject);
        });
    }
    newFileName(folder, fileName) {
        return this.cordovaFile.checkFile(folder, fileName)
            .then(() => {
            const extIndex = fileName.lastIndexOf('.');
            if (extIndex > 0) {
                fileName = fileName.substring(0, extIndex) + '_' + _.now() + '.' + fileName.substring(extIndex + 1);
            }
            else {
                fileName = fileName + '_' + _.now();
            }
            return this.newFileName(folder, fileName);
        }, () => fileName);
    }
    removeFile(filePath) {
        const i = filePath.lastIndexOf('/'), dir = filePath.substring(0, i), file = filePath.substring(i + 1);
        return this.cordovaFile.removeFile(dir, file);
    }
    /**
     * removes the directory at the specified location.
     *
     * @param dirPath absolute path of directory
     */
    removeDir(dirPath) {
        const i = dirPath.lastIndexOf('/'), parentdir = dirPath.substring(0, i + 1), dir = dirPath.substring(i + 1), movedDir = dir + _.now();
        return this.cordovaFile.checkDir(parentdir, dir)
            .then(() => {
            /**
             * If folder is remove directly without moving, then INVALID_MODIFICATION_ERR is thrown in android
             * when a copy operation is done with the same directory name. To avoid this, directory will be moved
             * first and removed.
             */
            return this.cordovaFile.moveDir(parentdir, dir, parentdir, movedDir)
                .then(() => this.cordovaFile.removeDir(parentdir, movedDir));
        }).catch(noop);
    }
    start() {
        /**
         * Default READ_CHUNK_SIZE is 256 Kb. But with that setting readJson method is failing. This is an issue
         * with cordova file plugin. So, increasing it to 512 Kb to read large database schema files (>256 Kb).
         */
        FileReader.READ_CHUNK_SIZE = 512 * 1024;
        return new Promise((resolve, reject) => {
            this.cordovaAppVersion.getAppName().then(appName => {
                const promises = [];
                this._appName = appName;
                promises.push(this.createFolderIfNotExists(this.getTemporaryRootPath(), APP_FOLDER_STRUCTURE, this._fileTypeVsPathMap.temporary));
                promises.push(this.createFolderIfNotExists(this.getPersistentRootPath(), APP_FOLDER_STRUCTURE, this._fileTypeVsPathMap.persistent));
                promises.push(this.setupUploadDirectory());
                return Promise.all(promises);
            }).then(() => {
                if (isAndroid()) {
                    // this is necessary to prevent multiple file permission popup.
                    return this.cordovaFile.readAsText(cordova.file.externalRootDirectory, 'random-file-for-permission').catch(noop);
                }
            }).then(resolve, reject);
        });
    }
    createFolderIfNotExists(parent, folders, fileTypeLocationMap) {
        const childPromises = [];
        if (folders) {
            folders.forEach(folder => {
                let folderPath;
                folder.name = folder.name.replace('{APP_NAME}', this._appName);
                folderPath = parent + folder.name + '/';
                if (folder.fileType && !fileTypeLocationMap[folder.fileType]) {
                    fileTypeLocationMap[folder.fileType] = folderPath;
                }
                const p = this.cordovaFile.createDir(parent, folder.name, false)
                    .then(() => this.createFolderIfNotExists(folderPath, folder.children, fileTypeLocationMap), () => this.createFolderIfNotExists(folderPath, folder.children, fileTypeLocationMap));
                childPromises.push(p);
            });
        }
        if (childPromises.length > 0) {
            return Promise.all(childPromises);
        }
    }
    findFileType(fileName) {
        let extension;
        if (fileName.indexOf('.') > 0) {
            extension = fileName.split('.').pop().toLowerCase();
            if (IMAGE_EXTENSIONS.some(a => a === extension)) {
                return FileType.IMAGE;
            }
            if (VIDEO_EXTENSIONS.some(a => a === extension)) {
                return FileType.VIDEO;
            }
            if (AUDIO_EXTENSIONS.some(a => a === extension)) {
                return FileType.AUDIO;
            }
        }
        return FileType.DOCUMENT;
    }
    setupUploadDirectory() {
        const uploadsDirName = 'uploads', appDir = cordova.file.dataDirectory;
        return this.cordovaFile.checkDir(appDir, uploadsDirName)
            .then(() => this._uploadDir = appDir + uploadsDirName, () => this.cordovaFile.createDir(appDir, uploadsDirName, true)
            .then(() => this._uploadDir = appDir + uploadsDirName));
    }
}
DeviceFileService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
DeviceFileService.ctorParameters = () => [
    { type: AppVersion },
    { type: File }
];
DeviceFileService.ngInjectableDef = defineInjectable({ factory: function DeviceFileService_Factory() { return new DeviceFileService(inject(AppVersion), inject(File)); }, token: DeviceFileService, providedIn: "root" });

const MAX_CONCURRENT_DOWNLOADS = 2;
class DeviceFileDownloadService {
    constructor(cordovaFile, http, deviceFileService, fileExtensionFromMimePipe) {
        this.cordovaFile = cordovaFile;
        this.http = http;
        this.deviceFileService = deviceFileService;
        this.fileExtensionFromMimePipe = fileExtensionFromMimePipe;
        this._downloadQueue = [];
        this._concurrentDownloads = 0;
    }
    download(url, isPersistent, destFolder, destFile, progressObserver) {
        return this.addToDownloadQueue(url, isPersistent, destFolder, destFile, progressObserver);
    }
    // Adds to download request queue
    addToDownloadQueue(url, isPersistent, destFolder, destFile, progressObserver) {
        return new Promise((resolve, reject) => {
            this._downloadQueue.push({
                url: url,
                isPersistent: isPersistent,
                destFolder: destFolder,
                destFile: destFile,
                resolve: resolve,
                reject: reject,
                progressObserver: progressObserver
            });
            if (this._concurrentDownloads < MAX_CONCURRENT_DOWNLOADS) {
                this.downloadNext();
            }
        });
    }
    downloadNext() {
        if (this._downloadQueue.length > 0) {
            const req = this._downloadQueue.shift();
            this.downloadFile(req).then(filePath => {
                req.resolve(filePath);
                this.downloadNext();
            }, () => {
                req.reject();
                this.downloadNext();
            });
        }
    }
    // Start processing a download request
    downloadFile(req) {
        let filePath, blob;
        this._concurrentDownloads++;
        return this.sendHttpRequest(req.url, req.progressObserver).then((e) => {
            blob = e.body;
            return this.getFileName(e, req, blob.type);
        }).then((fileName) => {
            if (!req.destFolder) {
                req.destFolder = this.deviceFileService.findFolderPath(req.isPersistent, fileName);
            }
            filePath = req.destFolder + fileName;
            return this.cordovaFile.writeFile(req.destFolder, fileName, blob);
        }).then(() => {
            this._concurrentDownloads--;
            return filePath;
        }, (response) => {
            this._concurrentDownloads--;
            this.cordovaFile.removeFile(req.destFolder, req.destFile);
            return Promise.reject(`Failed to downloaded  ${req.url} with error ${JSON.stringify(response)}`);
        });
    }
    /**
     * Returns the filename
     * 1. if filename exists just return
     * 2. retrieve the filename from response headers i.e. content-disposition
     * 3. pick the filename from the end of the url
     * If filename doesnt contain the extension then extract using mimeType.
     * Generates newFileName if filename already exists.
     * @param response, download file response
     * @param req, download request params
     * @param mimeType mime type of file
     * @returns {Promise<string>}
     */
    getFileName(response, req, mimeType) {
        const disposition = response.headers.get('Content-Disposition');
        let filename = req.destFile;
        if (!filename && disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches !== null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        if (!filename) {
            filename = req.url.split('?')[0];
            filename = filename.split('/').pop();
        }
        let fileExtension;
        if (mimeType) {
            fileExtension = this.fileExtensionFromMimePipe.transform(mimeType);
        }
        let hasFileExtension;
        // one or more file extensions can have same mimeType then loop over the file extensions.
        if (_.isArray(fileExtension)) {
            hasFileExtension = _.find(fileExtension, extension => _.endsWith(filename, extension));
        }
        if (!hasFileExtension && !_.endsWith(filename, fileExtension)) {
            filename = filename + fileExtension;
        }
        const folder = req.destFolder || this.deviceFileService.findFolderPath(req.isPersistent, filename);
        return this.deviceFileService.newFileName(folder, filename);
    }
    sendHttpRequest(url, progressObserver) {
        const req = new HttpRequest('GET', url, {
            responseType: 'blob',
            reportProgress: progressObserver != null
        });
        return this.http.request(req)
            .pipe(map(e => {
            if (progressObserver && progressObserver.next && e.type === HttpEventType.DownloadProgress) {
                progressObserver.next(e);
            }
            return e;
        }), filter(e => e.type === HttpEventType.Response), map(e => {
            if (progressObserver && progressObserver.complete) {
                progressObserver.complete();
            }
            return e;
        }))
            .toPromise();
    }
}
DeviceFileDownloadService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
DeviceFileDownloadService.ctorParameters = () => [
    { type: File },
    { type: HttpClient },
    { type: DeviceFileService },
    { type: FileExtensionFromMimePipe }
];
DeviceFileDownloadService.ngInjectableDef = defineInjectable({ factory: function DeviceFileDownloadService_Factory() { return new DeviceFileDownloadService(inject(File), inject(HttpClient), inject(DeviceFileService), inject(FileExtensionFromMimePipe)); }, token: DeviceFileDownloadService, providedIn: "root" });

const CACHE_FILE_INDEX_NAME = 'appCache.json';
class DeviceFileCacheService {
    constructor(cordovaFile, fileService, downloadService) {
        this.cordovaFile = cordovaFile;
        this.fileService = fileService;
        this.downloadService = downloadService;
        this.serviceName = DeviceFileCacheService.name;
        this._cacheIndex = {};
    }
    addEntry(url, filepath) {
        this._cacheIndex[url] = filepath;
        this.writeCacheIndexToFile();
    }
    getLocalPath(url, downloadIfNotExists, isPersistent) {
        const filePath = this._cacheIndex[url];
        return this.fileService.isValidPath(filePath)
            .catch(() => {
            delete this._cacheIndex[url];
            if (downloadIfNotExists) {
                return this.download(url, isPersistent);
            }
            else {
                Promise.reject('No cache entry for ' + url);
            }
        });
    }
    invalidateCache() {
        this._cacheIndex = {};
        this.writeCacheIndexToFile();
        this.fileService.clearTemporaryStorage();
    }
    start() {
        return this.cordovaFile.readAsText(cordova.file.dataDirectory, CACHE_FILE_INDEX_NAME)
            .then(content => {
            this._cacheIndex = JSON.parse(content);
        }, noop);
    }
    download(url, isPersistent) {
        return this.downloadService.download(url, isPersistent)
            .then(filepath => {
            this._cacheIndex[url] = filepath;
            this.writeCacheIndexToFile();
            return filepath;
        });
    }
    writeCacheIndexToFile() {
        if (!this._writing) {
            this._writing = true;
            this.cordovaFile.writeFile(cordova.file.dataDirectory, CACHE_FILE_INDEX_NAME, JSON.stringify(this._cacheIndex), {
                replace: true
            })
                .catch(noop)
                .then(() => {
                if (this._saveCache) {
                    setTimeout(() => {
                        this._writing = false;
                        this._saveCache = false;
                        this.writeCacheIndexToFile();
                    }, 5000);
                }
                else {
                    this._writing = false;
                }
            });
        }
        else {
            this._saveCache = true;
        }
    }
}
DeviceFileCacheService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
DeviceFileCacheService.ctorParameters = () => [
    { type: File },
    { type: DeviceFileService },
    { type: DeviceFileDownloadService }
];
DeviceFileCacheService.ngInjectableDef = defineInjectable({ factory: function DeviceFileCacheService_Factory() { return new DeviceFileCacheService(inject(File), inject(DeviceFileService), inject(DeviceFileDownloadService)); }, token: DeviceFileCacheService, providedIn: "root" });

class DeviceFileOpenerService {
    constructor(cordovaFile, cordovaFileOpener, fileService, cacheService, downloadService) {
        this.cordovaFile = cordovaFile;
        this.cordovaFileOpener = cordovaFileOpener;
        this.fileService = fileService;
        this.cacheService = cacheService;
        this.downloadService = downloadService;
        this.serviceName = DeviceFileOpenerService.name;
    }
    // this method returns the mime type of file from the filePath.
    getFileMimeType(filePath) {
        return new Promise((resolve) => {
            // Read the file entry from the file URL
            resolveLocalFileSystemURL(filePath, fileEntry => {
                fileEntry.file(metadata => {
                    resolve(metadata.type);
                });
            });
        });
    }
    openRemoteFile(url, extension, fileName) {
        return this.getLocalPath(url, extension, fileName)
            .then(filePath => {
            return this.getFileMimeType(filePath).then(type => {
                return this.cordovaFileOpener.open(filePath, type);
            });
        });
    }
    start() {
        let downloadsParent;
        if (isAndroid()) {
            downloadsParent = cordova.file.externalCacheDirectory;
        }
        else if (isIos()) {
            downloadsParent = cordova.file.documentsDirectory + 'NoCloud/';
        }
        else {
            downloadsParent = cordova.file.dataDirectory;
        }
        return this.cordovaFile.createDir(downloadsParent, 'downloads', false)
            .catch(noop)
            .then(() => {
            this._downloadsFolder = downloadsParent + 'downloads/';
        });
    }
    generateFileName(url, extension) {
        let fileName = url.split('?')[0];
        fileName = fileName.split('/').pop();
        fileName = this.fileService.appendToFileName(fileName, '' + _.now());
        if (extension) {
            return fileName.split('.')[0] + '.' + extension;
        }
        return fileName;
    }
    getLocalPath(url, extension, filename) {
        return new Promise((resolve, reject) => {
            return this.cacheService.getLocalPath(url, false, false)
                .then(filePath => {
                let fileName, i, fromDir, fromFile;
                // Is it part of downloaded folder.
                if (filePath.startsWith(this._downloadsFolder)) {
                    resolve(filePath);
                }
                else {
                    fileName = filename || this.generateFileName(url, extension);
                    i = filePath.lastIndexOf('/');
                    fromDir = filePath.substring(0, i);
                    fromFile = filePath.substring(i + 1);
                    this.cordovaFile.copyFile(fromDir, fromFile, this._downloadsFolder, fileName)
                        .then(() => {
                        const newFilePath = this._downloadsFolder + fileName;
                        this.cacheService.addEntry(url, newFilePath);
                        resolve(newFilePath);
                    });
                }
            }).catch(() => {
                this.downloadService.download(url, false, this._downloadsFolder, filename)
                    .then(filePath => {
                    this.cacheService.addEntry(url, filePath);
                    resolve(filePath);
                }, reject);
            });
        });
    }
}
DeviceFileOpenerService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
DeviceFileOpenerService.ctorParameters = () => [
    { type: File },
    { type: FileOpener },
    { type: DeviceFileService },
    { type: DeviceFileCacheService },
    { type: DeviceFileDownloadService }
];
DeviceFileOpenerService.ngInjectableDef = defineInjectable({ factory: function DeviceFileOpenerService_Factory() { return new DeviceFileOpenerService(inject(File), inject(FileOpener), inject(DeviceFileService), inject(DeviceFileCacheService), inject(DeviceFileDownloadService)); }, token: DeviceFileOpenerService, providedIn: "root" });

const REGISTRY_FILE_NAME = 'registry.info';
class DeviceService {
    constructor(file) {
        this.file = file;
        this._registry = {};
        this._isReady = false;
        this._whenReadyPromises = [];
        this._backBtnTapListeners = [];
        this._startUpServices = [];
        const maxWaitTime = 10;
        setTimeout(() => {
            if (!this._isReady) {
                console.warn(`Device is not ready even after ${maxWaitTime} seconds`);
                console.warn('Waiting For %O', this._startUpServices.map(i => i.serviceName));
            }
        }, maxWaitTime * 1000);
        document.addEventListener('backbutton', this.executeBackTapListeners.bind(this));
    }
    executeBackTapListeners($event) {
        _.forEach(this._backBtnTapListeners, fn => {
            return fn($event) !== false;
        });
        // explicitly applying the digest cycle as the backbutton listener is not rendering the page content.
        // This is because zone is not run (there is no change detection)
        // https://weblogs.thinktecture.com/thomas/2017/02/cordova-vs-zonejs-or-why-is-angulars-document-event-listener-not-in-a-zone.html
        $appDigest();
    }
    addStartUpService(service) {
        this._startUpServices.push(service);
    }
    onBackButtonTap(fn) {
        this._backBtnTapListeners.unshift(fn);
        return () => {
            const i = this._backBtnTapListeners.indexOf(fn);
            if (i >= 0) {
                this._backBtnTapListeners.splice(i, 1);
            }
        };
    }
    start() {
        if (this._isReady || this._startUpServices.length === 0) {
            this._isReady = true;
            return Promise.resolve();
        }
        else {
            return new Promise((resolve) => {
                if (hasCordova()) {
                    document.addEventListener('deviceready', () => resolve(), false);
                }
                else {
                    resolve();
                }
            }).then(() => {
                if (window['cordova']) {
                    return this.file.readAsText(cordova.file.dataDirectory, REGISTRY_FILE_NAME)
                        .then(content => this._registry = JSON.parse(content), noop);
                }
            }).then(() => {
                return Promise.all(this._startUpServices.map(s => {
                    return s.start().catch((error) => {
                        console.error('%s failed to start due to: %O', s.serviceName, error);
                        return Promise.reject(error);
                    });
                }));
            }).then(() => {
                window['wmDeviceReady'] = true;
                document.dispatchEvent(new CustomEvent('wmDeviceReady'));
                this._startUpServices.length = 0;
                this._whenReadyPromises.forEach(fn => fn());
                this._isReady = true;
            });
        }
    }
    whenReady() {
        if (this._isReady) {
            return Promise.resolve();
        }
        else {
            return new Promise((resolve) => {
                this._whenReadyPromises.push(resolve);
            });
        }
    }
    /**
     * @returns {Promise<number>} promise resolved with the app build time
     */
    getAppBuildTime() {
        return this.file.readAsText(cordova.file.applicationDirectory + 'www', 'config.json')
            .then(appConfig => (JSON.parse(appConfig).buildTime));
    }
    /**
     * Stores an entry that survives app restarts and updates.
     *
     * @param {string} key
     * @param {Object} value
     * @returns {Promise<any>}
     */
    storeEntry(key, value) {
        this._registry[key] = value;
        return this.file.writeFile(cordova.file.dataDirectory, REGISTRY_FILE_NAME, JSON.stringify(this._registry), { replace: true });
    }
    /**
     * @param {string} key
     * @returns {any} entry corresponding to the key
     */
    getEntry(key) {
        return this._registry[key];
    }
}
DeviceService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
DeviceService.ctorParameters = () => [
    { type: File }
];
DeviceService.ngInjectableDef = defineInjectable({ factory: function DeviceService_Factory() { return new DeviceService(inject(File)); }, token: DeviceService, providedIn: "root" });

const AUTO_CONNECT_KEY = 'WM.NetworkService._autoConnect', IS_CONNECTED_KEY = 'WM.NetworkService.isConnected', excludedList = [new RegExp('/wmProperties.js')], originalXMLHttpRequestOpen = XMLHttpRequest.prototype.open, originalXMLHttpRequestSend = XMLHttpRequest.prototype.send, networkState = {
    isConnecting: false,
    isConnected: localStorage.getItem(IS_CONNECTED_KEY) === 'true',
    isNetworkAvailable: true,
    isServiceAvailable: true
};
/**
 * If server is not connected and url does not match the unblock list of regular expressions,
 * then this function return true. Otherwise, return false.
 * @param url
 * @returns {boolean}
 */
const blockUrl = url => {
    let block = !networkState.isConnected && _.startsWith(url, 'http');
    if (block) {
        block = !_.find(excludedList, regExp => regExp.test(url));
    }
    return block;
};
const ɵ0 = blockUrl;
// Intercept all XHR calls
XMLHttpRequest.prototype.open = function (method, url, async = true, user, password) {
    if (blockUrl(url)) {
        const urlSplits = url.split('://');
        const pathIndex = urlSplits[1].indexOf('/');
        urlSplits[1] = 'localhost' + (pathIndex > 0 ? urlSplits[1].substr(pathIndex) : '/');
        url = urlSplits.join('://');
    }
    return originalXMLHttpRequestOpen.apply(this, [method, url, async, user, password]);
};
class NetworkService {
    constructor(httpClient, app, network) {
        this.httpClient = httpClient;
        this.app = app;
        this.network = network;
        this.serviceName = NetworkService.name;
        this._autoConnect = localStorage.getItem(AUTO_CONNECT_KEY) !== 'false';
        this._isCheckingServer = false;
        /**
         * When the auto connect is enabled, then app is automatically connected  whenever server is available.
         * Every time when app goes offline, auto connect is enabled. Before app coming to online, one can disable
         * the auto connection flow using this method.
         */
        this.disableAutoConnect = () => this.setAutoConnect(false);
        /**
         * Returns true, if app is connected to server. Otherwise, returns false.
         *
         * @returns {boolean} Returns true, if app is connected to server. Otherwise, returns false.
         */
        this.isConnected = () => {
            // checking for connection type.
            if (_.get(navigator, 'connection') && navigator.connection.type) {
                networkState.isConnected = networkState.isConnected && (navigator.connection.type !== 'none');
            }
            this.checkForNetworkStateChange();
            return networkState.isConnected;
        };
        /**
         * Returns true if app is trying to connect to server. Otherwise, returns false.
         *
         * @returns {boolean} Returns true if app is trying to connect to server. Otherwise, returns false.
         */
        this.isConnecting = () => networkState.isConnecting;
    }
    /**
     * This method attempts to connect app to the server and returns a promise that will be resolved with
     * a boolean value based on the operation result.
     *
     * @returns {object} promise
     */
    connect() {
        this.setAutoConnect(true);
        return this.tryToConnect();
    }
    /**
     * This method disconnects the app from the server and returns a promise that will be resolved with
     * a boolean value based on the operation result. Use connect method to reconnect.
     *
     * @returns {object} promise
     */
    disconnect() {
        const p = this.tryToDisconnect();
        this.disableAutoConnect();
        return p;
    }
    /**
     * If pingServer is true, then it returns a promise that will be resolved with boolean based on service availability
     * check.If pingServer is false, returns a boolean value based on the last known service availability.
     *
     * @returns {boolean} if pingServer is true, then a promise is returned. Otherwise, a boolean value.
     */
    isAvailable(pingServer = false) {
        if (pingServer) {
            return this.isServiceAvailable().then(() => {
                this.checkForNetworkStateChange();
                return networkState.isServiceAvailable;
            });
        }
        return networkState.isServiceAvailable;
    }
    /**
     * This method returns a promise that is resolved when connection is established with server.
     *
     * @returns {object} promise a promise that is resolved with the returned object of fn
     */
    onConnect() {
        let defer, cancelSubscription;
        if (this.isConnected()) {
            return Promise.resolve();
        }
        defer = getAbortableDefer();
        cancelSubscription = this.app.subscribe('onNetworkStateChange', () => {
            if (this.isConnected()) {
                defer.resolve(true);
                cancelSubscription();
            }
        });
        defer.promise.catch(function () {
            cancelSubscription();
        });
        return defer.promise;
    }
    /**
     * This is a util method. If fn cannot execute successfully and network lost connection, then the fn will
     * be invoked when network is back. The returned can also be aborted.
     *
     * @param {function()} fn method to invoke.
     * @returns {object} promise a promise that is resolved with the returned object of fn
     */
    retryIfNetworkFails(fn) {
        const defer = getAbortableDefer();
        retryIfFails(fn, 0, 0, () => {
            let onConnectPromise;
            if (!this.isConnected()) {
                onConnectPromise = this.onConnect();
                defer.promise.catch(function () {
                    onConnectPromise.abort();
                });
                return onConnectPromise;
            }
            return false;
        }).then(defer.resolve, defer.reject);
        return defer.promise;
    }
    start() {
        if (window['cordova']) {
            // Connection constant will be available only when network plugin is included.
            if (window['Connection'] && navigator.connection) {
                networkState.isNetworkAvailable = navigator.connection.type !== 'none';
                networkState.isConnected = networkState.isNetworkAvailable && networkState.isConnected;
                /*
                 * When the device comes online, check is the service is available. If the service is available and auto
                 * connect flag is true, then app is automatically connected to remote server.
                 */
                this.network.onConnect().subscribe(() => {
                    networkState.isNetworkAvailable = true;
                    this.tryToConnect().catch(noop);
                });
                /*
                 *When device goes offline, then change the network state and emit that notifies about network state change.
                 */
                this.network.onDisconnect().subscribe(() => {
                    networkState.isNetworkAvailable = false;
                    networkState.isServiceAvailable = false;
                    this.tryToDisconnect();
                });
                this.app.subscribe('onNetworkStateChange', (data) => {
                    /**
                     * If network is available and server is not available,then
                     * try to connect when server is available.
                     */
                    if (data.isNetworkAvailable && !data.isServiceAvailable && !this._isCheckingServer) {
                        this._isCheckingServer = true;
                        this.checkForServiceAvailiblity().then(() => {
                            this._isCheckingServer = false;
                            this.connect();
                        }, () => {
                            this._isCheckingServer = false;
                        });
                    }
                });
            }
        }
        // to set the default n/w connection values.
        return this.tryToConnect(true).catch(noop);
    }
    /**
     * This function adds the given regular expression to the unblockList. Even app is in offline mode,
     * the urls matching with the given regular expression are not blocked by NetworkService.
     *
     * @param {string} urlRegex regular expression
     */
    unblock(urlRegex) {
        excludedList.push(new RegExp(urlRegex));
    }
    checkForNetworkStateChange() {
        if (!_.isEqual(this._lastKnownNetworkState, networkState)) {
            this._lastKnownNetworkState = _.clone(networkState);
            this.app.notify('onNetworkStateChange', this._lastKnownNetworkState);
        }
    }
    /**
     * Returns a promise that is resolved when server is available.
     * @returns {*}
     */
    checkForServiceAvailiblity() {
        const maxTimeout = 4500;
        return new Promise(resolve => {
            const intervalId = setInterval(() => {
                if (networkState.isNetworkAvailable) {
                    this.isServiceAvailable(maxTimeout).then(available => {
                        if (available) {
                            clearInterval(intervalId);
                            resolve();
                        }
                    });
                }
            }, 5000);
        });
    }
    /**
     * Pings server to check whether server is available. Based on ping response network state is modified.
     * @returns {*} a promise that resolved with true, if server responds with valid status.
     * Otherwise, the promise is resolved with false.
     */
    isServiceAvailable(maxTimeout) {
        return this.pingServer(maxTimeout).then(response => {
            networkState.isServiceAvailable = response;
            if (!networkState.isServiceAvailable) {
                networkState.isConnecting = false;
                networkState.isConnected = false;
            }
            return response;
        });
    }
    /**
     * Pings server
     * @returns {*} a promise that resolved with true, if server responds with valid status.
     * Otherwise, the promise is resolved with false.
     * default timeout value is 1min.
     */
    pingServer(maxTimeout = 60000) {
        return new Promise(resolve => {
            const oReq = new XMLHttpRequest();
            let baseURL = this.app.deployedUrl;
            if (baseURL && !_.endsWith(baseURL, '/')) {
                baseURL += '/';
            }
            else {
                baseURL = baseURL || '';
            }
            const timer = setTimeout(() => {
                oReq.abort(); // abort request
                resolve(false);
            }, maxTimeout);
            oReq.addEventListener('load', () => {
                if (oReq.status === 200) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
                if (timer) {
                    clearTimeout(timer);
                }
            });
            oReq.addEventListener('error', () => resolve(false));
            oReq.open('GET', baseURL + 'services/application/wmProperties.js?t=' + Date.now());
            oReq.send();
        });
    }
    setAutoConnect(flag) {
        this._autoConnect = flag;
        localStorage.setItem(AUTO_CONNECT_KEY, '' + flag);
    }
    /**
     * Tries to connect to remote server. Network State will be changed based on the success of connection
     * operation and emits an event notifying the network state change.
     *
     * @param silentMode {boolean} if true and connection is successful, then no event is emitted. Otherwise,
     * events are emitted for network status change.
     * @returns {*} a promise
     */
    tryToConnect(silentMode = false) {
        return new Promise((resolve, reject) => {
            this.isServiceAvailable(5000).then(() => {
                if (networkState.isServiceAvailable && this._autoConnect) {
                    networkState.isConnecting = true;
                    if (!silentMode) {
                        this.checkForNetworkStateChange();
                    }
                    setTimeout(() => {
                        networkState.isConnecting = false;
                        networkState.isConnected = true;
                        localStorage.setItem(IS_CONNECTED_KEY, '' + true);
                        if (!silentMode) {
                            this.checkForNetworkStateChange();
                        }
                        resolve(true);
                    }, silentMode ? 0 : 5000);
                }
                else {
                    networkState.isConnecting = false;
                    networkState.isConnected = false;
                    localStorage.setItem(IS_CONNECTED_KEY, '' + false);
                    reject();
                    this.checkForNetworkStateChange();
                }
            });
        });
    }
    tryToDisconnect() {
        networkState.isConnected = false;
        networkState.isConnecting = false;
        this.checkForNetworkStateChange();
        localStorage.setItem(IS_CONNECTED_KEY, '' + networkState.isConnected);
        return Promise.resolve(networkState.isConnected);
    }
}
NetworkService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
NetworkService.ctorParameters = () => [
    { type: HttpClient },
    { type: App },
    { type: Network }
];
NetworkService.ngInjectableDef = defineInjectable({ factory: function NetworkService_Factory() { return new NetworkService(inject(HttpClient), inject(App), inject(Network)); }, token: NetworkService, providedIn: "root" });

class MobileCoreModule {
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

class UploadRequest {
    constructor(url, cordovaFile) {
        this.url = url;
        this.cordovaFile = cordovaFile;
        this._files = [];
        this._params = [];
        this._headers = [];
    }
    addFile(name, path, filename) {
        this._files.push({
            name: name,
            path: path,
            fileName: filename
        });
        return this;
    }
    addHeader(name, value) {
        this._headers.push({
            name: name,
            value: value
        });
        return this;
    }
    addParam(name, value) {
        this._params.push({
            name: name,
            value: value
        });
        return this;
    }
    post() {
        const formData = new FormData();
        this._params.forEach(e => formData.append(e.name, e.value));
        return Promise.all(this._files.map(e => {
            if (e.path) {
                return convertToBlob(e.path)
                    .then(result => {
                    return {
                        name: e.name,
                        fileName: e.fileName,
                        blob: result.blob
                    };
                });
            }
            return e;
        })).then(params => {
            params.forEach(e => formData.append(e.name, e.blob || e.path, e.fileName));
            return new Promise((resolve, reject) => {
                const request = new XMLHttpRequest();
                request.open('POST', this.url);
                this._headers.forEach(e => request.setRequestHeader(e.name, e.value));
                request.onload = () => {
                    resolve({
                        headers: (name) => request.getResponseHeader(name),
                        response: request.response,
                        text: request.responseText
                    });
                };
                request.onerror = reject;
                request.onabort = reject;
                request.send(formData);
            });
        });
    }
}
class DeviceFileUploadService {
    constructor(cordovaFile) {
        this.cordovaFile = cordovaFile;
    }
    upload(url, fileParamName, path, fileName, params, headers) {
        const req = new UploadRequest(url, this.cordovaFile)
            .addFile(fileParamName, path, fileName);
        _.forEach(params, (k, v) => req.addParam(k, v));
        _.forEach(headers, (k, v) => req.addHeader(k, v));
        return req.post();
    }
}
DeviceFileUploadService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
DeviceFileUploadService.ctorParameters = () => [
    { type: File }
];
DeviceFileUploadService.ngInjectableDef = defineInjectable({ factory: function DeviceFileUploadService_Factory() { return new DeviceFileUploadService(inject(File)); }, token: DeviceFileUploadService, providedIn: "root" });

class ExtAppMessageService {
    constructor(app) {
        this.app = app;
        this.handlers = [];
        document.addEventListener('externalAppMessageReceived', e => {
            const message = (e['detail'].message);
            this.handlers.forEach(handler => {
                const matches = handler && message.address.match(handler.pattern);
                if (matches && matches.length > 0) {
                    handler.callBack(message);
                }
            });
        });
    }
    /**
     * adds a listener for a message whose address matches with the given regex pattern.
     *
     * @param {string} messageAddressPattern a regex pattern that is used to target messages to listen.
     * @param {Function} listener function to invoke when message that matches regex is received.
     *                  message received will be sent as first argument.
     * @returns {Function} a function which removes the listener when invoked.
     */
    subscribe(messageAddressPattern, listener) {
        const handler = {
            pattern: new RegExp(messageAddressPattern),
            callBack: listener
        };
        this.handlers.push(handler);
        return () => _.remove(this.handlers, handler);
    }
}
ExtAppMessageService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
ExtAppMessageService.ctorParameters = () => [
    { type: App }
];
ExtAppMessageService.ngInjectableDef = defineInjectable({ factory: function ExtAppMessageService_Factory() { return new ExtAppMessageService(inject(App)); }, token: ExtAppMessageService, providedIn: "root" });
(function (window, document) {
    // listen app-to-app communication via url schemes
    function subString(str, begin, end) {
        end = end < 0 ? undefined : end;
        return (str && begin >= 0 && str.length > begin && str.substring(begin, end)) || undefined;
    }
    function indexOf(str, pattern) {
        return str && str.indexOf(pattern);
    }
    function extractData(url) {
        const str = subString(url, indexOf(url, '?') + 1, indexOf(url, '#')), data = {};
        _.forEach(_.split(str, '&'), entry => {
            const esplits = entry.split('=');
            data[esplits[0]] = esplits[1];
        });
        return data;
    }
    function extractAddress(url) {
        return subString(url, indexOf(url, '://') + 3, indexOf(url, '?'));
    }
    function createMessage(url) {
        return {
            'address': extractAddress(url),
            'data': extractData(url)
        };
    }
    window['handleOpenURL'] = function (url) {
        const handleOpenURL = window['handleOpenURL'];
        if (handleOpenURL.isReady && !_.startsWith(url, 'http')) {
            const message = createMessage(url);
            const e = new window['CustomEvent']('externalAppMessageReceived', {
                'detail': {
                    'message': message
                }
            });
            document.dispatchEvent(e);
        }
        handleOpenURL.lastURL = url;
    };
}(window, document));

/**
 * Generated bundle index. Do not edit.
 */

export { MobileCoreModule, DeviceFileCacheService, DeviceFileDownloadService, DeviceFileOpenerService, FileType, DeviceFileService, UploadRequest, DeviceFileUploadService, DeviceService, ExtAppMessageService, NetworkService, ɵ0 };

//# sourceMappingURL=index.js.map