(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@ionic-native/app-version'), require('rxjs/operators'), require('@wm/components'), require('@ionic-native/file-opener'), require('@angular/common/http'), require('@ionic-native/network'), require('@ionic-native/file'), require('@angular/core'), require('@wm/core')) :
    typeof define === 'function' && define.amd ? define('@wm/mobile/core', ['exports', '@ionic-native/app-version', 'rxjs/operators', '@wm/components', '@ionic-native/file-opener', '@angular/common/http', '@ionic-native/network', '@ionic-native/file', '@angular/core', '@wm/core'], factory) :
    (factory((global.wm = global.wm || {}, global.wm.mobile = global.wm.mobile || {}, global.wm.mobile.core = {}),global.ionicNative.plugins,global.rxjs.operators,global.wm.components,global.ionicNative.plugins,global.ng.common.http,global.ionicNative.plugins,global.ionicNative.plugins,global.ng.core,global.wm.core));
}(this, (function (exports,i1,operators,i4,i2,i2$1,i3,i1$1,i0,i1$2) { 'use strict';

    (function (FileType) {
        FileType["AUDIO"] = "AUDIO";
        FileType["DOCUMENT"] = "DOCUMENT";
        FileType["IMAGE"] = "IMAGE";
        FileType["VIDEO"] = "VIDEO";
    })(exports.FileType || (exports.FileType = {}));
    var IMAGE_EXTENSIONS = ['gif', 'jpg', 'png', 'svg', 'webp', 'jpeg', 'jif', 'jfif', 'jfi'], VIDEO_EXTENSIONS = ['mp4', 'mpg', 'avi', 'wma', 'mp2', '3gp', '3g2', 'm4p', 'm4v', 'mpg', 'fiv'], AUDIO_EXTENSIONS = ['mp3', 'm4p', 'aiff', 'aa', 'aax', 'wma'];
    var APP_FOLDER_STRUCTURE = [{
            name: '{APP_NAME}',
            children: [{
                    name: 'Media',
                    children: [
                        {
                            name: '{APP_NAME} Images',
                            fileType: exports.FileType.IMAGE
                        },
                        {
                            name: '{APP_NAME} Audio',
                            fileType: exports.FileType.AUDIO
                        },
                        {
                            name: '{APP_NAME} Vedios',
                            fileType: exports.FileType.VIDEO
                        },
                        {
                            name: '{APP_NAME} Documents',
                            fileType: exports.FileType.DOCUMENT
                        }
                    ]
                }]
        }];
    var DeviceFileService = /** @class */ (function () {
        function DeviceFileService(cordovaAppVersion, cordovaFile) {
            this.cordovaAppVersion = cordovaAppVersion;
            this.cordovaFile = cordovaFile;
            this.serviceName = DeviceFileService.name;
            this._fileTypeVsPathMap = {
                'temporary': {},
                'persistent': {}
            };
        }
        DeviceFileService.prototype.addMediaToGallery = function (filePath) {
            if (i1$2.isAndroid() && this.isPersistentType(filePath)) {
                return new Promise(function (resolve, reject) {
                    cordova.plugins.MediaScannerPlugin.scanFile(filePath, resolve, reject);
                });
            }
            return Promise.resolve();
        };
        DeviceFileService.prototype.appendToFileName = function (fileName, attachment) {
            var splits;
            attachment = attachment || '_' + _.now();
            fileName = fileName || 'noname';
            splits = fileName.split('.');
            if (splits.length > 1) {
                splits[splits.length - 2] = splits[splits.length - 2] + attachment;
                return splits.join('.');
            }
            return fileName + attachment;
        };
        DeviceFileService.prototype.clearTemporaryStorage = function () {
            return this.cordovaFile.removeRecursively(this.getTemporaryRootPath() + this._appName + '/', 'Media');
        };
        DeviceFileService.prototype.copy = function (persistent, sourceFilePath) {
            var _this = this;
            var sourceFilename = sourceFilePath.split('/').pop(), destFolder = this.findFolderPath(persistent, sourceFilename), sourceFolder = sourceFilePath.substring(0, sourceFilePath.lastIndexOf('/'));
            return this.newFileName(destFolder, sourceFilename)
                .then(function (destFilename) {
                return _this.cordovaFile.copyFile(sourceFolder, sourceFilename, destFolder, destFilename)
                    .then(function () { return destFolder + destFilename; });
            });
        };
        DeviceFileService.prototype.findFolderPath = function (persistent, fileName) {
            var typeMap = persistent ? this._fileTypeVsPathMap.persistent : this._fileTypeVsPathMap.temporary, fileType = this.findFileType(fileName);
            return typeMap[fileType] || typeMap[exports.FileType.DOCUMENT];
        };
        DeviceFileService.prototype.getPersistentRootPath = function () {
            return cordova.file.dataDirectory;
        };
        DeviceFileService.prototype.getTemporaryRootPath = function () {
            return cordova.file.cacheDirectory;
        };
        DeviceFileService.prototype.getUploadDirectory = function () {
            return this._uploadDir;
        };
        DeviceFileService.prototype.isPersistentType = function (filePath) {
            return filePath.startsWith(this.getPersistentRootPath());
        };
        DeviceFileService.prototype.isValidPath = function (filePath) {
            var folder, fileName;
            if (!filePath) {
                return Promise.reject('File path is required');
            }
            folder = filePath.substring(0, filePath.lastIndexOf('/') + 1);
            fileName = filePath.split('/').pop();
            return this.cordovaFile.checkFile(folder, fileName)
                .then(function () { return filePath; });
        };
        DeviceFileService.prototype.listFiles = function (folder, search) {
            return new Promise(function (resolve, reject) {
                resolveLocalFileSystemURL(folder, function (directory) {
                    if (!directory.files) {
                        directory.createReader().readEntries(function (entries) {
                            if (search) {
                                entries = entries.filter(function (e) { return e.name.match(search); });
                            }
                            entries = entries.map(function (e) {
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
        };
        DeviceFileService.prototype.newFileName = function (folder, fileName) {
            var _this = this;
            return this.cordovaFile.checkFile(folder, fileName)
                .then(function () {
                var extIndex = fileName.lastIndexOf('.');
                if (extIndex > 0) {
                    fileName = fileName.substring(0, extIndex) + '_' + _.now() + '.' + fileName.substring(extIndex + 1);
                }
                else {
                    fileName = fileName + '_' + _.now();
                }
                return _this.newFileName(folder, fileName);
            }, function () { return fileName; });
        };
        DeviceFileService.prototype.removeFile = function (filePath) {
            var i = filePath.lastIndexOf('/'), dir = filePath.substring(0, i), file = filePath.substring(i + 1);
            return this.cordovaFile.removeFile(dir, file);
        };
        /**
         * removes the directory at the specified location.
         *
         * @param dirPath absolute path of directory
         */
        DeviceFileService.prototype.removeDir = function (dirPath) {
            var _this = this;
            var i = dirPath.lastIndexOf('/'), parentdir = dirPath.substring(0, i + 1), dir = dirPath.substring(i + 1), movedDir = dir + _.now();
            return this.cordovaFile.checkDir(parentdir, dir)
                .then(function () {
                /**
                 * If folder is remove directly without moving, then INVALID_MODIFICATION_ERR is thrown in android
                 * when a copy operation is done with the same directory name. To avoid this, directory will be moved
                 * first and removed.
                 */
                return _this.cordovaFile.moveDir(parentdir, dir, parentdir, movedDir)
                    .then(function () { return _this.cordovaFile.removeDir(parentdir, movedDir); });
            }).catch(i1$2.noop);
        };
        DeviceFileService.prototype.start = function () {
            var _this = this;
            /**
             * Default READ_CHUNK_SIZE is 256 Kb. But with that setting readJson method is failing. This is an issue
             * with cordova file plugin. So, increasing it to 512 Kb to read large database schema files (>256 Kb).
             */
            FileReader.READ_CHUNK_SIZE = 512 * 1024;
            return new Promise(function (resolve, reject) {
                _this.cordovaAppVersion.getAppName().then(function (appName) {
                    var promises = [];
                    _this._appName = appName;
                    promises.push(_this.createFolderIfNotExists(_this.getTemporaryRootPath(), APP_FOLDER_STRUCTURE, _this._fileTypeVsPathMap.temporary));
                    promises.push(_this.createFolderIfNotExists(_this.getPersistentRootPath(), APP_FOLDER_STRUCTURE, _this._fileTypeVsPathMap.persistent));
                    promises.push(_this.setupUploadDirectory());
                    return Promise.all(promises);
                }).then(function () {
                    if (i1$2.isAndroid()) {
                        // this is necessary to prevent multiple file permission popup.
                        return _this.cordovaFile.readAsText(cordova.file.externalRootDirectory, 'random-file-for-permission').catch(i1$2.noop);
                    }
                }).then(resolve, reject);
            });
        };
        DeviceFileService.prototype.createFolderIfNotExists = function (parent, folders, fileTypeLocationMap) {
            var _this = this;
            var childPromises = [];
            if (folders) {
                folders.forEach(function (folder) {
                    var folderPath;
                    folder.name = folder.name.replace('{APP_NAME}', _this._appName);
                    folderPath = parent + folder.name + '/';
                    if (folder.fileType && !fileTypeLocationMap[folder.fileType]) {
                        fileTypeLocationMap[folder.fileType] = folderPath;
                    }
                    var p = _this.cordovaFile.createDir(parent, folder.name, false)
                        .then(function () { return _this.createFolderIfNotExists(folderPath, folder.children, fileTypeLocationMap); }, function () { return _this.createFolderIfNotExists(folderPath, folder.children, fileTypeLocationMap); });
                    childPromises.push(p);
                });
            }
            if (childPromises.length > 0) {
                return Promise.all(childPromises);
            }
        };
        DeviceFileService.prototype.findFileType = function (fileName) {
            var extension;
            if (fileName.indexOf('.') > 0) {
                extension = fileName.split('.').pop().toLowerCase();
                if (IMAGE_EXTENSIONS.some(function (a) { return a === extension; })) {
                    return exports.FileType.IMAGE;
                }
                if (VIDEO_EXTENSIONS.some(function (a) { return a === extension; })) {
                    return exports.FileType.VIDEO;
                }
                if (AUDIO_EXTENSIONS.some(function (a) { return a === extension; })) {
                    return exports.FileType.AUDIO;
                }
            }
            return exports.FileType.DOCUMENT;
        };
        DeviceFileService.prototype.setupUploadDirectory = function () {
            var _this = this;
            var uploadsDirName = 'uploads', appDir = cordova.file.dataDirectory;
            return this.cordovaFile.checkDir(appDir, uploadsDirName)
                .then(function () { return _this._uploadDir = appDir + uploadsDirName; }, function () {
                return _this.cordovaFile.createDir(appDir, uploadsDirName, true)
                    .then(function () { return _this._uploadDir = appDir + uploadsDirName; });
            });
        };
        DeviceFileService.decorators = [
            { type: i0.Injectable, args: [{ providedIn: 'root' },] }
        ];
        /** @nocollapse */
        DeviceFileService.ctorParameters = function () {
            return [
                { type: i1.AppVersion },
                { type: i1$1.File }
            ];
        };
        DeviceFileService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceFileService_Factory() { return new DeviceFileService(i0.inject(i1.AppVersion), i0.inject(i1$1.File)); }, token: DeviceFileService, providedIn: "root" });
        return DeviceFileService;
    }());

    var MAX_CONCURRENT_DOWNLOADS = 2;
    var DeviceFileDownloadService = /** @class */ (function () {
        function DeviceFileDownloadService(cordovaFile, http, deviceFileService, fileExtensionFromMimePipe) {
            this.cordovaFile = cordovaFile;
            this.http = http;
            this.deviceFileService = deviceFileService;
            this.fileExtensionFromMimePipe = fileExtensionFromMimePipe;
            this._downloadQueue = [];
            this._concurrentDownloads = 0;
        }
        DeviceFileDownloadService.prototype.download = function (url, isPersistent, destFolder, destFile, progressObserver) {
            return this.addToDownloadQueue(url, isPersistent, destFolder, destFile, progressObserver);
        };
        // Adds to download request queue
        DeviceFileDownloadService.prototype.addToDownloadQueue = function (url, isPersistent, destFolder, destFile, progressObserver) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this._downloadQueue.push({
                    url: url,
                    isPersistent: isPersistent,
                    destFolder: destFolder,
                    destFile: destFile,
                    resolve: resolve,
                    reject: reject,
                    progressObserver: progressObserver
                });
                if (_this._concurrentDownloads < MAX_CONCURRENT_DOWNLOADS) {
                    _this.downloadNext();
                }
            });
        };
        DeviceFileDownloadService.prototype.downloadNext = function () {
            var _this = this;
            if (this._downloadQueue.length > 0) {
                var req_1 = this._downloadQueue.shift();
                this.downloadFile(req_1).then(function (filePath) {
                    req_1.resolve(filePath);
                    _this.downloadNext();
                }, function () {
                    req_1.reject();
                    _this.downloadNext();
                });
            }
        };
        // Start processing a download request
        DeviceFileDownloadService.prototype.downloadFile = function (req) {
            var _this = this;
            var filePath, blob;
            this._concurrentDownloads++;
            return this.sendHttpRequest(req.url, req.progressObserver).then(function (e) {
                blob = e.body;
                return _this.getFileName(e, req, blob.type);
            }).then(function (fileName) {
                if (!req.destFolder) {
                    req.destFolder = _this.deviceFileService.findFolderPath(req.isPersistent, fileName);
                }
                filePath = req.destFolder + fileName;
                return _this.cordovaFile.writeFile(req.destFolder, fileName, blob);
            }).then(function () {
                _this._concurrentDownloads--;
                return filePath;
            }, function (response) {
                _this._concurrentDownloads--;
                _this.cordovaFile.removeFile(req.destFolder, req.destFile);
                return Promise.reject("Failed to downloaded  " + req.url + " with error " + JSON.stringify(response));
            });
        };
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
        DeviceFileDownloadService.prototype.getFileName = function (response, req, mimeType) {
            var disposition = response.headers.get('Content-Disposition');
            var filename = req.destFile;
            if (!filename && disposition && disposition.indexOf('attachment') !== -1) {
                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = filenameRegex.exec(disposition);
                if (matches !== null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            if (!filename) {
                filename = req.url.split('?')[0];
                filename = filename.split('/').pop();
            }
            var fileExtension;
            if (mimeType) {
                fileExtension = this.fileExtensionFromMimePipe.transform(mimeType);
            }
            var hasFileExtension;
            // one or more file extensions can have same mimeType then loop over the file extensions.
            if (_.isArray(fileExtension)) {
                hasFileExtension = _.find(fileExtension, function (extension) { return _.endsWith(filename, extension); });
            }
            if (!hasFileExtension && !_.endsWith(filename, fileExtension)) {
                filename = filename + fileExtension;
            }
            var folder = req.destFolder || this.deviceFileService.findFolderPath(req.isPersistent, filename);
            return this.deviceFileService.newFileName(folder, filename);
        };
        DeviceFileDownloadService.prototype.sendHttpRequest = function (url, progressObserver) {
            var req = new i2$1.HttpRequest('GET', url, {
                responseType: 'blob',
                reportProgress: progressObserver != null
            });
            return this.http.request(req)
                .pipe(operators.map(function (e) {
                if (progressObserver && progressObserver.next && e.type === i2$1.HttpEventType.DownloadProgress) {
                    progressObserver.next(e);
                }
                return e;
            }), operators.filter(function (e) { return e.type === i2$1.HttpEventType.Response; }), operators.map(function (e) {
                if (progressObserver && progressObserver.complete) {
                    progressObserver.complete();
                }
                return e;
            }))
                .toPromise();
        };
        DeviceFileDownloadService.decorators = [
            { type: i0.Injectable, args: [{ providedIn: 'root' },] }
        ];
        /** @nocollapse */
        DeviceFileDownloadService.ctorParameters = function () {
            return [
                { type: i1$1.File },
                { type: i2$1.HttpClient },
                { type: DeviceFileService },
                { type: i4.FileExtensionFromMimePipe }
            ];
        };
        DeviceFileDownloadService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceFileDownloadService_Factory() { return new DeviceFileDownloadService(i0.inject(i1$1.File), i0.inject(i2$1.HttpClient), i0.inject(DeviceFileService), i0.inject(i4.FileExtensionFromMimePipe)); }, token: DeviceFileDownloadService, providedIn: "root" });
        return DeviceFileDownloadService;
    }());

    var CACHE_FILE_INDEX_NAME = 'appCache.json';
    var DeviceFileCacheService = /** @class */ (function () {
        function DeviceFileCacheService(cordovaFile, fileService, downloadService) {
            this.cordovaFile = cordovaFile;
            this.fileService = fileService;
            this.downloadService = downloadService;
            this.serviceName = DeviceFileCacheService.name;
            this._cacheIndex = {};
        }
        DeviceFileCacheService.prototype.addEntry = function (url, filepath) {
            this._cacheIndex[url] = filepath;
            this.writeCacheIndexToFile();
        };
        DeviceFileCacheService.prototype.getLocalPath = function (url, downloadIfNotExists, isPersistent) {
            var _this = this;
            var filePath = this._cacheIndex[url];
            return this.fileService.isValidPath(filePath)
                .catch(function () {
                delete _this._cacheIndex[url];
                if (downloadIfNotExists) {
                    return _this.download(url, isPersistent);
                }
                else {
                    Promise.reject('No cache entry for ' + url);
                }
            });
        };
        DeviceFileCacheService.prototype.invalidateCache = function () {
            this._cacheIndex = {};
            this.writeCacheIndexToFile();
            this.fileService.clearTemporaryStorage();
        };
        DeviceFileCacheService.prototype.start = function () {
            var _this = this;
            return this.cordovaFile.readAsText(cordova.file.dataDirectory, CACHE_FILE_INDEX_NAME)
                .then(function (content) {
                _this._cacheIndex = JSON.parse(content);
            }, i1$2.noop);
        };
        DeviceFileCacheService.prototype.download = function (url, isPersistent) {
            var _this = this;
            return this.downloadService.download(url, isPersistent)
                .then(function (filepath) {
                _this._cacheIndex[url] = filepath;
                _this.writeCacheIndexToFile();
                return filepath;
            });
        };
        DeviceFileCacheService.prototype.writeCacheIndexToFile = function () {
            var _this = this;
            if (!this._writing) {
                this._writing = true;
                this.cordovaFile.writeFile(cordova.file.dataDirectory, CACHE_FILE_INDEX_NAME, JSON.stringify(this._cacheIndex), {
                    replace: true
                })
                    .catch(i1$2.noop)
                    .then(function () {
                    if (_this._saveCache) {
                        setTimeout(function () {
                            _this._writing = false;
                            _this._saveCache = false;
                            _this.writeCacheIndexToFile();
                        }, 5000);
                    }
                    else {
                        _this._writing = false;
                    }
                });
            }
            else {
                this._saveCache = true;
            }
        };
        DeviceFileCacheService.decorators = [
            { type: i0.Injectable, args: [{ providedIn: 'root' },] }
        ];
        /** @nocollapse */
        DeviceFileCacheService.ctorParameters = function () {
            return [
                { type: i1$1.File },
                { type: DeviceFileService },
                { type: DeviceFileDownloadService }
            ];
        };
        DeviceFileCacheService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceFileCacheService_Factory() { return new DeviceFileCacheService(i0.inject(i1$1.File), i0.inject(DeviceFileService), i0.inject(DeviceFileDownloadService)); }, token: DeviceFileCacheService, providedIn: "root" });
        return DeviceFileCacheService;
    }());

    var DeviceFileOpenerService = /** @class */ (function () {
        function DeviceFileOpenerService(cordovaFile, cordovaFileOpener, fileService, cacheService, downloadService) {
            this.cordovaFile = cordovaFile;
            this.cordovaFileOpener = cordovaFileOpener;
            this.fileService = fileService;
            this.cacheService = cacheService;
            this.downloadService = downloadService;
            this.serviceName = DeviceFileOpenerService.name;
        }
        // this method returns the mime type of file from the filePath.
        DeviceFileOpenerService.prototype.getFileMimeType = function (filePath) {
            return new Promise(function (resolve) {
                // Read the file entry from the file URL
                resolveLocalFileSystemURL(filePath, function (fileEntry) {
                    fileEntry.file(function (metadata) {
                        resolve(metadata.type);
                    });
                });
            });
        };
        DeviceFileOpenerService.prototype.openRemoteFile = function (url, extension, fileName) {
            var _this = this;
            return this.getLocalPath(url, extension, fileName)
                .then(function (filePath) {
                return _this.getFileMimeType(filePath).then(function (type) {
                    return _this.cordovaFileOpener.open(filePath, type);
                });
            });
        };
        DeviceFileOpenerService.prototype.start = function () {
            var _this = this;
            var downloadsParent;
            if (i1$2.isAndroid()) {
                downloadsParent = cordova.file.externalCacheDirectory;
            }
            else if (i1$2.isIos()) {
                downloadsParent = cordova.file.documentsDirectory + 'NoCloud/';
            }
            else {
                downloadsParent = cordova.file.dataDirectory;
            }
            return this.cordovaFile.createDir(downloadsParent, 'downloads', false)
                .catch(i1$2.noop)
                .then(function () {
                _this._downloadsFolder = downloadsParent + 'downloads/';
            });
        };
        DeviceFileOpenerService.prototype.generateFileName = function (url, extension) {
            var fileName = url.split('?')[0];
            fileName = fileName.split('/').pop();
            fileName = this.fileService.appendToFileName(fileName, '' + _.now());
            if (extension) {
                return fileName.split('.')[0] + '.' + extension;
            }
            return fileName;
        };
        DeviceFileOpenerService.prototype.getLocalPath = function (url, extension, filename) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                return _this.cacheService.getLocalPath(url, false, false)
                    .then(function (filePath) {
                    var fileName, i, fromDir, fromFile;
                    // Is it part of downloaded folder.
                    if (filePath.startsWith(_this._downloadsFolder)) {
                        resolve(filePath);
                    }
                    else {
                        fileName = filename || _this.generateFileName(url, extension);
                        i = filePath.lastIndexOf('/');
                        fromDir = filePath.substring(0, i);
                        fromFile = filePath.substring(i + 1);
                        _this.cordovaFile.copyFile(fromDir, fromFile, _this._downloadsFolder, fileName)
                            .then(function () {
                            var newFilePath = _this._downloadsFolder + fileName;
                            _this.cacheService.addEntry(url, newFilePath);
                            resolve(newFilePath);
                        });
                    }
                }).catch(function () {
                    _this.downloadService.download(url, false, _this._downloadsFolder, filename)
                        .then(function (filePath) {
                        _this.cacheService.addEntry(url, filePath);
                        resolve(filePath);
                    }, reject);
                });
            });
        };
        DeviceFileOpenerService.decorators = [
            { type: i0.Injectable, args: [{ providedIn: 'root' },] }
        ];
        /** @nocollapse */
        DeviceFileOpenerService.ctorParameters = function () {
            return [
                { type: i1$1.File },
                { type: i2.FileOpener },
                { type: DeviceFileService },
                { type: DeviceFileCacheService },
                { type: DeviceFileDownloadService }
            ];
        };
        DeviceFileOpenerService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceFileOpenerService_Factory() { return new DeviceFileOpenerService(i0.inject(i1$1.File), i0.inject(i2.FileOpener), i0.inject(DeviceFileService), i0.inject(DeviceFileCacheService), i0.inject(DeviceFileDownloadService)); }, token: DeviceFileOpenerService, providedIn: "root" });
        return DeviceFileOpenerService;
    }());

    var REGISTRY_FILE_NAME = 'registry.info';
    var DeviceService = /** @class */ (function () {
        function DeviceService(file) {
            var _this = this;
            this.file = file;
            this._registry = {};
            this._isReady = false;
            this._whenReadyPromises = [];
            this._backBtnTapListeners = [];
            this._startUpServices = [];
            var maxWaitTime = 10;
            setTimeout(function () {
                if (!_this._isReady) {
                    console.warn("Device is not ready even after " + maxWaitTime + " seconds");
                    console.warn('Waiting For %O', _this._startUpServices.map(function (i) { return i.serviceName; }));
                }
            }, maxWaitTime * 1000);
            document.addEventListener('backbutton', this.executeBackTapListeners.bind(this));
        }
        DeviceService.prototype.executeBackTapListeners = function ($event) {
            _.forEach(this._backBtnTapListeners, function (fn) {
                return fn($event) !== false;
            });
            // explicitly applying the digest cycle as the backbutton listener is not rendering the page content.
            // This is because zone is not run (there is no change detection)
            // https://weblogs.thinktecture.com/thomas/2017/02/cordova-vs-zonejs-or-why-is-angulars-document-event-listener-not-in-a-zone.html
            i1$2.$appDigest();
        };
        DeviceService.prototype.addStartUpService = function (service) {
            this._startUpServices.push(service);
        };
        DeviceService.prototype.onBackButtonTap = function (fn) {
            var _this = this;
            this._backBtnTapListeners.unshift(fn);
            return function () {
                var i = _this._backBtnTapListeners.indexOf(fn);
                if (i >= 0) {
                    _this._backBtnTapListeners.splice(i, 1);
                }
            };
        };
        DeviceService.prototype.start = function () {
            var _this = this;
            if (this._isReady || this._startUpServices.length === 0) {
                this._isReady = true;
                return Promise.resolve();
            }
            else {
                return new Promise(function (resolve) {
                    if (i1$2.hasCordova()) {
                        document.addEventListener('deviceready', function () { return resolve(); }, false);
                    }
                    else {
                        resolve();
                    }
                }).then(function () {
                    if (window['cordova']) {
                        return _this.file.readAsText(cordova.file.dataDirectory, REGISTRY_FILE_NAME)
                            .then(function (content) { return _this._registry = JSON.parse(content); }, i1$2.noop);
                    }
                }).then(function () {
                    return Promise.all(_this._startUpServices.map(function (s) {
                        return s.start().catch(function (error) {
                            console.error('%s failed to start due to: %O', s.serviceName, error);
                            return Promise.reject(error);
                        });
                    }));
                }).then(function () {
                    window['wmDeviceReady'] = true;
                    document.dispatchEvent(new CustomEvent('wmDeviceReady'));
                    _this._startUpServices.length = 0;
                    _this._whenReadyPromises.forEach(function (fn) { return fn(); });
                    _this._isReady = true;
                });
            }
        };
        DeviceService.prototype.whenReady = function () {
            var _this = this;
            if (this._isReady) {
                return Promise.resolve();
            }
            else {
                return new Promise(function (resolve) {
                    _this._whenReadyPromises.push(resolve);
                });
            }
        };
        /**
         * @returns {Promise<number>} promise resolved with the app build time
         */
        DeviceService.prototype.getAppBuildTime = function () {
            return this.file.readAsText(cordova.file.applicationDirectory + 'www', 'config.json')
                .then(function (appConfig) { return (JSON.parse(appConfig).buildTime); });
        };
        /**
         * Stores an entry that survives app restarts and updates.
         *
         * @param {string} key
         * @param {Object} value
         * @returns {Promise<any>}
         */
        DeviceService.prototype.storeEntry = function (key, value) {
            this._registry[key] = value;
            return this.file.writeFile(cordova.file.dataDirectory, REGISTRY_FILE_NAME, JSON.stringify(this._registry), { replace: true });
        };
        /**
         * @param {string} key
         * @returns {any} entry corresponding to the key
         */
        DeviceService.prototype.getEntry = function (key) {
            return this._registry[key];
        };
        DeviceService.decorators = [
            { type: i0.Injectable, args: [{ providedIn: 'root' },] }
        ];
        /** @nocollapse */
        DeviceService.ctorParameters = function () {
            return [
                { type: i1$1.File }
            ];
        };
        DeviceService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceService_Factory() { return new DeviceService(i0.inject(i1$1.File)); }, token: DeviceService, providedIn: "root" });
        return DeviceService;
    }());

    var AUTO_CONNECT_KEY = 'WM.NetworkService._autoConnect', IS_CONNECTED_KEY = 'WM.NetworkService.isConnected', excludedList = [new RegExp('/wmProperties.js')], originalXMLHttpRequestOpen = XMLHttpRequest.prototype.open, originalXMLHttpRequestSend = XMLHttpRequest.prototype.send, networkState = {
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
    var blockUrl = function (url) {
        var block = !networkState.isConnected && _.startsWith(url, 'http');
        if (block) {
            block = !_.find(excludedList, function (regExp) { return regExp.test(url); });
        }
        return block;
    };
    var ɵ0 = blockUrl;
    // Intercept all XHR calls
    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        if (async === void 0) {
            async = true;
        }
        if (blockUrl(url)) {
            var urlSplits = url.split('://');
            var pathIndex = urlSplits[1].indexOf('/');
            urlSplits[1] = 'localhost' + (pathIndex > 0 ? urlSplits[1].substr(pathIndex) : '/');
            url = urlSplits.join('://');
        }
        return originalXMLHttpRequestOpen.apply(this, [method, url, async, user, password]);
    };
    var NetworkService = /** @class */ (function () {
        function NetworkService(httpClient, app, network) {
            var _this = this;
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
            this.disableAutoConnect = function () { return _this.setAutoConnect(false); };
            /**
             * Returns true, if app is connected to server. Otherwise, returns false.
             *
             * @returns {boolean} Returns true, if app is connected to server. Otherwise, returns false.
             */
            this.isConnected = function () {
                // checking for connection type.
                if (_.get(navigator, 'connection') && navigator.connection.type) {
                    networkState.isConnected = networkState.isConnected && (navigator.connection.type !== 'none');
                }
                _this.checkForNetworkStateChange();
                return networkState.isConnected;
            };
            /**
             * Returns true if app is trying to connect to server. Otherwise, returns false.
             *
             * @returns {boolean} Returns true if app is trying to connect to server. Otherwise, returns false.
             */
            this.isConnecting = function () { return networkState.isConnecting; };
        }
        /**
         * This method attempts to connect app to the server and returns a promise that will be resolved with
         * a boolean value based on the operation result.
         *
         * @returns {object} promise
         */
        NetworkService.prototype.connect = function () {
            this.setAutoConnect(true);
            return this.tryToConnect();
        };
        /**
         * This method disconnects the app from the server and returns a promise that will be resolved with
         * a boolean value based on the operation result. Use connect method to reconnect.
         *
         * @returns {object} promise
         */
        NetworkService.prototype.disconnect = function () {
            var p = this.tryToDisconnect();
            this.disableAutoConnect();
            return p;
        };
        /**
         * If pingServer is true, then it returns a promise that will be resolved with boolean based on service availability
         * check.If pingServer is false, returns a boolean value based on the last known service availability.
         *
         * @returns {boolean} if pingServer is true, then a promise is returned. Otherwise, a boolean value.
         */
        NetworkService.prototype.isAvailable = function (pingServer) {
            var _this = this;
            if (pingServer === void 0) {
                pingServer = false;
            }
            if (pingServer) {
                return this.isServiceAvailable().then(function () {
                    _this.checkForNetworkStateChange();
                    return networkState.isServiceAvailable;
                });
            }
            return networkState.isServiceAvailable;
        };
        /**
         * This method returns a promise that is resolved when connection is established with server.
         *
         * @returns {object} promise a promise that is resolved with the returned object of fn
         */
        NetworkService.prototype.onConnect = function () {
            var _this = this;
            var defer, cancelSubscription;
            if (this.isConnected()) {
                return Promise.resolve();
            }
            defer = i1$2.getAbortableDefer();
            cancelSubscription = this.app.subscribe('onNetworkStateChange', function () {
                if (_this.isConnected()) {
                    defer.resolve(true);
                    cancelSubscription();
                }
            });
            defer.promise.catch(function () {
                cancelSubscription();
            });
            return defer.promise;
        };
        /**
         * This is a util method. If fn cannot execute successfully and network lost connection, then the fn will
         * be invoked when network is back. The returned can also be aborted.
         *
         * @param {function()} fn method to invoke.
         * @returns {object} promise a promise that is resolved with the returned object of fn
         */
        NetworkService.prototype.retryIfNetworkFails = function (fn) {
            var _this = this;
            var defer = i1$2.getAbortableDefer();
            i1$2.retryIfFails(fn, 0, 0, function () {
                var onConnectPromise;
                if (!_this.isConnected()) {
                    onConnectPromise = _this.onConnect();
                    defer.promise.catch(function () {
                        onConnectPromise.abort();
                    });
                    return onConnectPromise;
                }
                return false;
            }).then(defer.resolve, defer.reject);
            return defer.promise;
        };
        NetworkService.prototype.start = function () {
            var _this = this;
            if (window['cordova']) {
                // Connection constant will be available only when network plugin is included.
                if (window['Connection'] && navigator.connection) {
                    networkState.isNetworkAvailable = navigator.connection.type !== 'none';
                    networkState.isConnected = networkState.isNetworkAvailable && networkState.isConnected;
                    /*
                     * When the device comes online, check is the service is available. If the service is available and auto
                     * connect flag is true, then app is automatically connected to remote server.
                     */
                    this.network.onConnect().subscribe(function () {
                        networkState.isNetworkAvailable = true;
                        _this.tryToConnect().catch(i1$2.noop);
                    });
                    /*
                     *When device goes offline, then change the network state and emit that notifies about network state change.
                     */
                    this.network.onDisconnect().subscribe(function () {
                        networkState.isNetworkAvailable = false;
                        networkState.isServiceAvailable = false;
                        _this.tryToDisconnect();
                    });
                    this.app.subscribe('onNetworkStateChange', function (data) {
                        /**
                         * If network is available and server is not available,then
                         * try to connect when server is available.
                         */
                        if (data.isNetworkAvailable && !data.isServiceAvailable && !_this._isCheckingServer) {
                            _this._isCheckingServer = true;
                            _this.checkForServiceAvailiblity().then(function () {
                                _this._isCheckingServer = false;
                                _this.connect();
                            }, function () {
                                _this._isCheckingServer = false;
                            });
                        }
                    });
                }
            }
            // to set the default n/w connection values.
            return this.tryToConnect(true).catch(i1$2.noop);
        };
        /**
         * This function adds the given regular expression to the unblockList. Even app is in offline mode,
         * the urls matching with the given regular expression are not blocked by NetworkService.
         *
         * @param {string} urlRegex regular expression
         */
        NetworkService.prototype.unblock = function (urlRegex) {
            excludedList.push(new RegExp(urlRegex));
        };
        NetworkService.prototype.checkForNetworkStateChange = function () {
            if (!_.isEqual(this._lastKnownNetworkState, networkState)) {
                this._lastKnownNetworkState = _.clone(networkState);
                this.app.notify('onNetworkStateChange', this._lastKnownNetworkState);
            }
        };
        /**
         * Returns a promise that is resolved when server is available.
         * @returns {*}
         */
        NetworkService.prototype.checkForServiceAvailiblity = function () {
            var _this = this;
            var maxTimeout = 4500;
            return new Promise(function (resolve) {
                var intervalId = setInterval(function () {
                    if (networkState.isNetworkAvailable) {
                        _this.isServiceAvailable(maxTimeout).then(function (available) {
                            if (available) {
                                clearInterval(intervalId);
                                resolve();
                            }
                        });
                    }
                }, 5000);
            });
        };
        /**
         * Pings server to check whether server is available. Based on ping response network state is modified.
         * @returns {*} a promise that resolved with true, if server responds with valid status.
         * Otherwise, the promise is resolved with false.
         */
        NetworkService.prototype.isServiceAvailable = function (maxTimeout) {
            return this.pingServer(maxTimeout).then(function (response) {
                networkState.isServiceAvailable = response;
                if (!networkState.isServiceAvailable) {
                    networkState.isConnecting = false;
                    networkState.isConnected = false;
                }
                return response;
            });
        };
        /**
         * Pings server
         * @returns {*} a promise that resolved with true, if server responds with valid status.
         * Otherwise, the promise is resolved with false.
         * default timeout value is 1min.
         */
        NetworkService.prototype.pingServer = function (maxTimeout) {
            var _this = this;
            if (maxTimeout === void 0) {
                maxTimeout = 60000;
            }
            return new Promise(function (resolve) {
                var oReq = new XMLHttpRequest();
                var baseURL = _this.app.deployedUrl;
                if (baseURL && !_.endsWith(baseURL, '/')) {
                    baseURL += '/';
                }
                else {
                    baseURL = baseURL || '';
                }
                var timer = setTimeout(function () {
                    oReq.abort(); // abort request
                    resolve(false);
                }, maxTimeout);
                oReq.addEventListener('load', function () {
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
                oReq.addEventListener('error', function () { return resolve(false); });
                oReq.open('GET', baseURL + 'services/application/wmProperties.js?t=' + Date.now());
                oReq.send();
            });
        };
        NetworkService.prototype.setAutoConnect = function (flag) {
            this._autoConnect = flag;
            localStorage.setItem(AUTO_CONNECT_KEY, '' + flag);
        };
        /**
         * Tries to connect to remote server. Network State will be changed based on the success of connection
         * operation and emits an event notifying the network state change.
         *
         * @param silentMode {boolean} if true and connection is successful, then no event is emitted. Otherwise,
         * events are emitted for network status change.
         * @returns {*} a promise
         */
        NetworkService.prototype.tryToConnect = function (silentMode) {
            var _this = this;
            if (silentMode === void 0) {
                silentMode = false;
            }
            return new Promise(function (resolve, reject) {
                _this.isServiceAvailable(5000).then(function () {
                    if (networkState.isServiceAvailable && _this._autoConnect) {
                        networkState.isConnecting = true;
                        if (!silentMode) {
                            _this.checkForNetworkStateChange();
                        }
                        setTimeout(function () {
                            networkState.isConnecting = false;
                            networkState.isConnected = true;
                            localStorage.setItem(IS_CONNECTED_KEY, '' + true);
                            if (!silentMode) {
                                _this.checkForNetworkStateChange();
                            }
                            resolve(true);
                        }, silentMode ? 0 : 5000);
                    }
                    else {
                        networkState.isConnecting = false;
                        networkState.isConnected = false;
                        localStorage.setItem(IS_CONNECTED_KEY, '' + false);
                        reject();
                        _this.checkForNetworkStateChange();
                    }
                });
            });
        };
        NetworkService.prototype.tryToDisconnect = function () {
            networkState.isConnected = false;
            networkState.isConnecting = false;
            this.checkForNetworkStateChange();
            localStorage.setItem(IS_CONNECTED_KEY, '' + networkState.isConnected);
            return Promise.resolve(networkState.isConnected);
        };
        NetworkService.decorators = [
            { type: i0.Injectable, args: [{ providedIn: 'root' },] }
        ];
        /** @nocollapse */
        NetworkService.ctorParameters = function () {
            return [
                { type: i2$1.HttpClient },
                { type: i1$2.App },
                { type: i3.Network }
            ];
        };
        NetworkService.ngInjectableDef = i0.defineInjectable({ factory: function NetworkService_Factory() { return new NetworkService(i0.inject(i2$1.HttpClient), i0.inject(i1$2.App), i0.inject(i3.Network)); }, token: NetworkService, providedIn: "root" });
        return NetworkService;
    }());

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
            if (i1$2.hasCordova()) {
                deviceService.addStartUpService(deviceFileService);
                deviceService.addStartUpService(fileCacheService);
                deviceService.addStartUpService(fileOpener);
            }
            this.initialized = true;
        };
        MobileCoreModule.initialized = false;
        MobileCoreModule.decorators = [
            { type: i0.NgModule, args: [{
                        declarations: [],
                        imports: [],
                        providers: [
                        // add providers to mobile-runtime module.
                        ],
                        bootstrap: []
                    },] }
        ];
        /** @nocollapse */
        MobileCoreModule.ctorParameters = function () {
            return [
                { type: DeviceService },
                { type: DeviceFileService },
                { type: DeviceFileCacheService },
                { type: DeviceFileOpenerService },
                { type: NetworkService }
            ];
        };
        return MobileCoreModule;
    }());

    var UploadRequest = /** @class */ (function () {
        function UploadRequest(url, cordovaFile) {
            this.url = url;
            this.cordovaFile = cordovaFile;
            this._files = [];
            this._params = [];
            this._headers = [];
        }
        UploadRequest.prototype.addFile = function (name, path, filename) {
            this._files.push({
                name: name,
                path: path,
                fileName: filename
            });
            return this;
        };
        UploadRequest.prototype.addHeader = function (name, value) {
            this._headers.push({
                name: name,
                value: value
            });
            return this;
        };
        UploadRequest.prototype.addParam = function (name, value) {
            this._params.push({
                name: name,
                value: value
            });
            return this;
        };
        UploadRequest.prototype.post = function () {
            var _this = this;
            var formData = new FormData();
            this._params.forEach(function (e) { return formData.append(e.name, e.value); });
            return Promise.all(this._files.map(function (e) {
                if (e.path) {
                    return i1$2.convertToBlob(e.path)
                        .then(function (result) {
                        return {
                            name: e.name,
                            fileName: e.fileName,
                            blob: result.blob
                        };
                    });
                }
                return e;
            })).then(function (params) {
                params.forEach(function (e) { return formData.append(e.name, e.blob || e.path, e.fileName); });
                return new Promise(function (resolve, reject) {
                    var request = new XMLHttpRequest();
                    request.open('POST', _this.url);
                    _this._headers.forEach(function (e) { return request.setRequestHeader(e.name, e.value); });
                    request.onload = function () {
                        resolve({
                            headers: function (name) { return request.getResponseHeader(name); },
                            response: request.response,
                            text: request.responseText
                        });
                    };
                    request.onerror = reject;
                    request.onabort = reject;
                    request.send(formData);
                });
            });
        };
        return UploadRequest;
    }());
    var DeviceFileUploadService = /** @class */ (function () {
        function DeviceFileUploadService(cordovaFile) {
            this.cordovaFile = cordovaFile;
        }
        DeviceFileUploadService.prototype.upload = function (url, fileParamName, path, fileName, params, headers) {
            var req = new UploadRequest(url, this.cordovaFile)
                .addFile(fileParamName, path, fileName);
            _.forEach(params, function (k, v) { return req.addParam(k, v); });
            _.forEach(headers, function (k, v) { return req.addHeader(k, v); });
            return req.post();
        };
        DeviceFileUploadService.decorators = [
            { type: i0.Injectable, args: [{ providedIn: 'root' },] }
        ];
        /** @nocollapse */
        DeviceFileUploadService.ctorParameters = function () {
            return [
                { type: i1$1.File }
            ];
        };
        DeviceFileUploadService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceFileUploadService_Factory() { return new DeviceFileUploadService(i0.inject(i1$1.File)); }, token: DeviceFileUploadService, providedIn: "root" });
        return DeviceFileUploadService;
    }());

    var ExtAppMessageService = /** @class */ (function () {
        function ExtAppMessageService(app) {
            var _this = this;
            this.app = app;
            this.handlers = [];
            document.addEventListener('externalAppMessageReceived', function (e) {
                var message = (e['detail'].message);
                _this.handlers.forEach(function (handler) {
                    var matches = handler && message.address.match(handler.pattern);
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
        ExtAppMessageService.prototype.subscribe = function (messageAddressPattern, listener) {
            var _this = this;
            var handler = {
                pattern: new RegExp(messageAddressPattern),
                callBack: listener
            };
            this.handlers.push(handler);
            return function () { return _.remove(_this.handlers, handler); };
        };
        ExtAppMessageService.decorators = [
            { type: i0.Injectable, args: [{ providedIn: 'root' },] }
        ];
        /** @nocollapse */
        ExtAppMessageService.ctorParameters = function () {
            return [
                { type: i1$2.App }
            ];
        };
        ExtAppMessageService.ngInjectableDef = i0.defineInjectable({ factory: function ExtAppMessageService_Factory() { return new ExtAppMessageService(i0.inject(i1$2.App)); }, token: ExtAppMessageService, providedIn: "root" });
        return ExtAppMessageService;
    }());
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
            var str = subString(url, indexOf(url, '?') + 1, indexOf(url, '#')), data = {};
            _.forEach(_.split(str, '&'), function (entry) {
                var esplits = entry.split('=');
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
            var handleOpenURL = window['handleOpenURL'];
            if (handleOpenURL.isReady && !_.startsWith(url, 'http')) {
                var message = createMessage(url);
                var e = new window['CustomEvent']('externalAppMessageReceived', {
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

    exports.MobileCoreModule = MobileCoreModule;
    exports.DeviceFileCacheService = DeviceFileCacheService;
    exports.DeviceFileDownloadService = DeviceFileDownloadService;
    exports.DeviceFileOpenerService = DeviceFileOpenerService;
    exports.DeviceFileService = DeviceFileService;
    exports.UploadRequest = UploadRequest;
    exports.DeviceFileUploadService = DeviceFileUploadService;
    exports.DeviceService = DeviceService;
    exports.ExtAppMessageService = ExtAppMessageService;
    exports.NetworkService = NetworkService;
    exports.ɵ0 = ɵ0;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=index.umd.js.map