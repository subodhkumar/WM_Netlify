import { Injectable } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version';
import { File } from '@ionic-native/file';
import { isAndroid, noop } from '@wm/core';
import * as i0 from "@angular/core";
import * as i1 from "@ionic-native/app-version";
import * as i2 from "@ionic-native/file";
export var FileType;
(function (FileType) {
    FileType["AUDIO"] = "AUDIO";
    FileType["DOCUMENT"] = "DOCUMENT";
    FileType["IMAGE"] = "IMAGE";
    FileType["VIDEO"] = "VIDEO";
})(FileType || (FileType = {}));
var IMAGE_EXTENSIONS = ['gif', 'jpg', 'png', 'svg', 'webp', 'jpeg', 'jif', 'jfif', 'jfi'], VIDEO_EXTENSIONS = ['mp4', 'mpg', 'avi', 'wma', 'mp2', '3gp', '3g2', 'm4p', 'm4v', 'mpg', 'fiv'], AUDIO_EXTENSIONS = ['mp3', 'm4p', 'aiff', 'aa', 'aax', 'wma'];
var APP_FOLDER_STRUCTURE = [{
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
        if (isAndroid() && this.isPersistentType(filePath)) {
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
            .then(function (destFilename) { return _this.cordovaFile.copyFile(sourceFolder, sourceFilename, destFolder, destFilename)
            .then(function () { return destFolder + destFilename; }); });
    };
    DeviceFileService.prototype.findFolderPath = function (persistent, fileName) {
        var typeMap = persistent ? this._fileTypeVsPathMap.persistent : this._fileTypeVsPathMap.temporary, fileType = this.findFileType(fileName);
        return typeMap[fileType] || typeMap[FileType.DOCUMENT];
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
        }).catch(noop);
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
                if (isAndroid()) {
                    // this is necessary to prevent multiple file permission popup.
                    return _this.cordovaFile.readAsText(cordova.file.externalRootDirectory, 'random-file-for-permission').catch(noop);
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
                return FileType.IMAGE;
            }
            if (VIDEO_EXTENSIONS.some(function (a) { return a === extension; })) {
                return FileType.VIDEO;
            }
            if (AUDIO_EXTENSIONS.some(function (a) { return a === extension; })) {
                return FileType.AUDIO;
            }
        }
        return FileType.DOCUMENT;
    };
    DeviceFileService.prototype.setupUploadDirectory = function () {
        var _this = this;
        var uploadsDirName = 'uploads', appDir = cordova.file.dataDirectory;
        return this.cordovaFile.checkDir(appDir, uploadsDirName)
            .then(function () { return _this._uploadDir = appDir + uploadsDirName; }, function () { return _this.cordovaFile.createDir(appDir, uploadsDirName, true)
            .then(function () { return _this._uploadDir = appDir + uploadsDirName; }); });
    };
    DeviceFileService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    DeviceFileService.ctorParameters = function () { return [
        { type: AppVersion },
        { type: File }
    ]; };
    DeviceFileService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceFileService_Factory() { return new DeviceFileService(i0.inject(i1.AppVersion), i0.inject(i2.File)); }, token: DeviceFileService, providedIn: "root" });
    return DeviceFileService;
}());
export { DeviceFileService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLWZpbGUuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29yZS8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL2RldmljZS1maWxlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdkQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE1BQU0sVUFBVSxDQUFDOzs7O0FBUzNDLE1BQU0sQ0FBTixJQUFZLFFBS1g7QUFMRCxXQUFZLFFBQVE7SUFDaEIsMkJBQWUsQ0FBQTtJQUNmLGlDQUFxQixDQUFBO0lBQ3JCLDJCQUFlLENBQUE7SUFDZiwyQkFBZSxDQUFBO0FBQ25CLENBQUMsRUFMVyxRQUFRLEtBQVIsUUFBUSxRQUtuQjtBQUVELElBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUN2RixnQkFBZ0IsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFDaEcsZ0JBQWdCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBRWxFLElBQU0sb0JBQW9CLEdBQUcsQ0FBQztRQUMxQixJQUFJLEVBQUcsWUFBWTtRQUNuQixRQUFRLEVBQUcsQ0FBQztnQkFDUixJQUFJLEVBQUcs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IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBcHBWZXJzaW9uIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9hcHAtdmVyc2lvbic7XG5pbXBvcnQgeyBGaWxlIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9maWxlJztcblxuaW1wb3J0IHsgaXNBbmRyb2lkLCBub29wIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBJRGV2aWNlU3RhcnRVcFNlcnZpY2UgfSBmcm9tICcuL2RldmljZS1zdGFydC11cC1zZXJ2aWNlJztcblxuZGVjbGFyZSBjb25zdCBfO1xuZGVjbGFyZSBjb25zdCBjb3Jkb3ZhO1xuZGVjbGFyZSBjb25zdCByZXNvbHZlTG9jYWxGaWxlU3lzdGVtVVJMO1xuZGVjbGFyZSBjb25zdCBGaWxlUmVhZGVyO1xuXG5leHBvcnQgZW51bSBGaWxlVHlwZSB7XG4gICAgQVVESU8gPSAnQVVESU8nLFxuICAgIERPQ1VNRU5UID0gJ0RPQ1VNRU5UJyxcbiAgICBJTUFHRSA9ICdJTUFHRScsXG4gICAgVklERU8gPSAnVklERU8nXG59XG5cbmNvbnN0IElNQUdFX0VYVEVOU0lPTlMgPSBbJ2dpZicsICdqcGcnLCAncG5nJywgJ3N2ZycsICd3ZWJwJywgJ2pwZWcnLCAnamlmJywgJ2pmaWYnLCAnamZpJ10sXG4gICAgVklERU9fRVhURU5TSU9OUyA9IFsnbXA0JywgJ21wZycsICdhdmknLCAnd21hJywgJ21wMicsICczZ3AnLCAnM2cyJywgJ200cCcsICdtNHYnLCAnbXBnJywgJ2ZpdiddLFxuICAgIEFVRElPX0VYVEVOU0lPTlMgPSBbJ21wMycsICdtNHAnLCAnYWlmZicsICdhYScsICdhYXgnLCAnd21hJ107XG5cbmNvbnN0IEFQUF9GT0xERVJfU1RSVUNUVVJFID0gW3tcbiAgICBuYW1lIDogJ3tBUFBfTkFNRX0nLFxuICAgIGNoaWxkcmVuIDogW3tcbiAgICAgICAgbmFtZSA6ICdNZWRpYScsXG4gICAgICAgIGNoaWxkcmVuIDogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWUgOiAne0FQUF9OQU1FfSBJbWFnZXMnLFxuICAgICAgICAgICAgICAgIGZpbGVUeXBlIDogRmlsZVR5cGUuSU1BR0VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZSA6ICd7QVBQX05BTUV9IEF1ZGlvJyxcbiAgICAgICAgICAgICAgICBmaWxlVHlwZSA6IEZpbGVUeXBlLkFVRElPXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWUgOiAne0FQUF9OQU1FfSBWZWRpb3MnLFxuICAgICAgICAgICAgICAgIGZpbGVUeXBlIDogRmlsZVR5cGUuVklERU9cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZSA6ICd7QVBQX05BTUV9IERvY3VtZW50cycsXG4gICAgICAgICAgICAgICAgZmlsZVR5cGUgOiBGaWxlVHlwZS5ET0NVTUVOVFxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfV1cbn1dO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIERldmljZUZpbGVTZXJ2aWNlIGltcGxlbWVudHMgSURldmljZVN0YXJ0VXBTZXJ2aWNlIHtcblxuICAgIHB1YmxpYyBzZXJ2aWNlTmFtZSA9IERldmljZUZpbGVTZXJ2aWNlLm5hbWU7XG5cbiAgICBwcml2YXRlIF9hcHBOYW1lOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfZmlsZVR5cGVWc1BhdGhNYXAgPSB7XG4gICAgICAgICd0ZW1wb3JhcnknIDoge30sXG4gICAgICAgICdwZXJzaXN0ZW50JyA6IHt9XG4gICAgfTtcbiAgICBwcml2YXRlIF91cGxvYWREaXI6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY29yZG92YUFwcFZlcnNpb246IEFwcFZlcnNpb24sIHByaXZhdGUgY29yZG92YUZpbGU6IEZpbGUpIHtcblxuICAgIH1cblxuICAgIHB1YmxpYyBhZGRNZWRpYVRvR2FsbGVyeShmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmIChpc0FuZHJvaWQoKSAmJiB0aGlzLmlzUGVyc2lzdGVudFR5cGUoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvcmRvdmEucGx1Z2lucy5NZWRpYVNjYW5uZXJQbHVnaW4uc2NhbkZpbGUoZmlsZVBhdGgsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFwcGVuZFRvRmlsZU5hbWUoZmlsZU5hbWU6IHN0cmluZywgYXR0YWNobWVudD86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGxldCBzcGxpdHM7XG4gICAgICAgIGF0dGFjaG1lbnQgPSBhdHRhY2htZW50IHx8ICdfJyArIF8ubm93KCk7XG4gICAgICAgIGZpbGVOYW1lID0gZmlsZU5hbWUgfHwgJ25vbmFtZSc7XG4gICAgICAgIHNwbGl0cyA9IGZpbGVOYW1lLnNwbGl0KCcuJyk7XG4gICAgICAgIGlmIChzcGxpdHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgc3BsaXRzW3NwbGl0cy5sZW5ndGggLSAyXSA9IHNwbGl0c1tzcGxpdHMubGVuZ3RoIC0gMl0gKyBhdHRhY2htZW50O1xuICAgICAgICAgICAgcmV0dXJuIHNwbGl0cy5qb2luKCcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGVOYW1lICsgYXR0YWNobWVudDtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJUZW1wb3JhcnlTdG9yYWdlKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcmRvdmFGaWxlLnJlbW92ZVJlY3Vyc2l2ZWx5KHRoaXMuZ2V0VGVtcG9yYXJ5Um9vdFBhdGgoKSArIHRoaXMuX2FwcE5hbWUgKyAnLycsICdNZWRpYScpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb3B5KHBlcnNpc3RlbnQ6IGJvb2xlYW4sIHNvdXJjZUZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgc291cmNlRmlsZW5hbWUgPSBzb3VyY2VGaWxlUGF0aC5zcGxpdCgnLycpLnBvcCgpLFxuICAgICAgICAgICAgZGVzdEZvbGRlciA9IHRoaXMuZmluZEZvbGRlclBhdGgocGVyc2lzdGVudCwgc291cmNlRmlsZW5hbWUpLFxuICAgICAgICAgICAgc291cmNlRm9sZGVyID0gc291cmNlRmlsZVBhdGguc3Vic3RyaW5nKDAsIHNvdXJjZUZpbGVQYXRoLmxhc3RJbmRleE9mKCcvJykpO1xuICAgICAgICByZXR1cm4gdGhpcy5uZXdGaWxlTmFtZShkZXN0Rm9sZGVyLCBzb3VyY2VGaWxlbmFtZSlcbiAgICAgICAgICAgIC50aGVuKCBkZXN0RmlsZW5hbWUgPT4gdGhpcy5jb3Jkb3ZhRmlsZS5jb3B5RmlsZShzb3VyY2VGb2xkZXIsIHNvdXJjZUZpbGVuYW1lLCBkZXN0Rm9sZGVyLCBkZXN0RmlsZW5hbWUpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gZGVzdEZvbGRlciArIGRlc3RGaWxlbmFtZSkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBmaW5kRm9sZGVyUGF0aChwZXJzaXN0ZW50OiBib29sZWFuLCBmaWxlTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHR5cGVNYXAgPSBwZXJzaXN0ZW50ID8gdGhpcy5fZmlsZVR5cGVWc1BhdGhNYXAucGVyc2lzdGVudCA6IHRoaXMuX2ZpbGVUeXBlVnNQYXRoTWFwLnRlbXBvcmFyeSxcbiAgICAgICAgICAgIGZpbGVUeXBlID0gdGhpcy5maW5kRmlsZVR5cGUoZmlsZU5hbWUpO1xuICAgICAgICByZXR1cm4gdHlwZU1hcFtmaWxlVHlwZV0gfHwgdHlwZU1hcFtGaWxlVHlwZS5ET0NVTUVOVF07XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBlcnNpc3RlbnRSb290UGF0aCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gY29yZG92YS5maWxlLmRhdGFEaXJlY3Rvcnk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFRlbXBvcmFyeVJvb3RQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBjb3Jkb3ZhLmZpbGUuY2FjaGVEaXJlY3Rvcnk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFVwbG9hZERpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fdXBsb2FkRGlyO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc1BlcnNpc3RlbnRUeXBlKGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZpbGVQYXRoLnN0YXJ0c1dpdGgodGhpcy5nZXRQZXJzaXN0ZW50Um9vdFBhdGgoKSk7XG4gICAgfVxuXG4gICAgcHVibGljIGlzVmFsaWRQYXRoKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBsZXQgZm9sZGVyLCBmaWxlTmFtZTtcbiAgICAgICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdGaWxlIHBhdGggaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBmb2xkZXIgPSBmaWxlUGF0aC5zdWJzdHJpbmcoMCwgZmlsZVBhdGgubGFzdEluZGV4T2YoJy8nKSArIDEpO1xuICAgICAgICBmaWxlTmFtZSA9IGZpbGVQYXRoLnNwbGl0KCcvJykucG9wKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcmRvdmFGaWxlLmNoZWNrRmlsZShmb2xkZXIsIGZpbGVOYW1lKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gZmlsZVBhdGgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBsaXN0RmlsZXMoZm9sZGVyOiBzdHJpbmcsIHNlYXJjaDogc3RyaW5nIHwgUmVnRXhwKTogUHJvbWlzZTxNYXA8c3RyaW5nLCBhbnk+W10+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmVMb2NhbEZpbGVTeXN0ZW1VUkwoZm9sZGVyLCBkaXJlY3RvcnkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghZGlyZWN0b3J5LmZpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeS5jcmVhdGVSZWFkZXIoKS5yZWFkRW50cmllcyhlbnRyaWVzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWFyY2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyaWVzID0gZW50cmllcy5maWx0ZXIoZSA9PiBlLm5hbWUubWF0Y2goc2VhcmNoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRyaWVzID0gZW50cmllcy5tYXAoIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgOiBlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRGlyZWN0b3J5IDogZS5pc0RpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA6IGUubmF0aXZlVVJMXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKFtdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmV3RmlsZU5hbWUoZm9sZGVyOiBzdHJpbmcsIGZpbGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb3Jkb3ZhRmlsZS5jaGVja0ZpbGUoZm9sZGVyLCBmaWxlTmFtZSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBleHRJbmRleCA9IGZpbGVOYW1lLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICAgICAgICAgICAgaWYgKGV4dEluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IGZpbGVOYW1lLnN1YnN0cmluZygwLCBleHRJbmRleCkgKyAnXycgKyBfLm5vdygpICsgJy4nICsgZmlsZU5hbWUuc3Vic3RyaW5nKGV4dEluZGV4ICsgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBmaWxlTmFtZSArICdfJyArIF8ubm93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5ld0ZpbGVOYW1lKGZvbGRlciwgZmlsZU5hbWUpO1xuICAgICAgICAgICAgfSwgKCkgPT4gZmlsZU5hbWUpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBjb25zdCBpID0gZmlsZVBhdGgubGFzdEluZGV4T2YoJy8nKSxcbiAgICAgICAgICAgIGRpciA9IGZpbGVQYXRoLnN1YnN0cmluZygwLCBpKSxcbiAgICAgICAgICAgIGZpbGUgPSBmaWxlUGF0aC5zdWJzdHJpbmcoaSArIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5jb3Jkb3ZhRmlsZS5yZW1vdmVGaWxlKGRpciwgZmlsZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmVtb3ZlcyB0aGUgZGlyZWN0b3J5IGF0IHRoZSBzcGVjaWZpZWQgbG9jYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGlyUGF0aCBhYnNvbHV0ZSBwYXRoIG9mIGRpcmVjdG9yeVxuICAgICAqL1xuICAgIHB1YmxpYyByZW1vdmVEaXIoZGlyUGF0aDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgY29uc3QgaSA9IGRpclBhdGgubGFzdEluZGV4T2YoJy8nKSxcbiAgICAgICAgICAgIHBhcmVudGRpciA9IGRpclBhdGguc3Vic3RyaW5nKDAsIGkgKyAxKSxcbiAgICAgICAgICAgIGRpciA9IGRpclBhdGguc3Vic3RyaW5nKGkgKyAxKSxcbiAgICAgICAgICAgIG1vdmVkRGlyID0gZGlyICsgXy5ub3coKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29yZG92YUZpbGUuY2hlY2tEaXIocGFyZW50ZGlyLCBkaXIpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogSWYgZm9sZGVyIGlzIHJlbW92ZSBkaXJlY3RseSB3aXRob3V0IG1vdmluZywgdGhlbiBJTlZBTElEX01PRElGSUNBVElPTl9FUlIgaXMgdGhyb3duIGluIGFuZHJvaWRcbiAgICAgICAgICAgICAgICAgKiB3aGVuIGEgY29weSBvcGVyYXRpb24gaXMgZG9uZSB3aXRoIHRoZSBzYW1lIGRpcmVjdG9yeSBuYW1lLiBUbyBhdm9pZCB0aGlzLCBkaXJlY3Rvcnkgd2lsbCBiZSBtb3ZlZFxuICAgICAgICAgICAgICAgICAqIGZpcnN0IGFuZCByZW1vdmVkLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvcmRvdmFGaWxlLm1vdmVEaXIocGFyZW50ZGlyLCBkaXIsIHBhcmVudGRpciwgbW92ZWREaXIpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMuY29yZG92YUZpbGUucmVtb3ZlRGlyKHBhcmVudGRpciwgbW92ZWREaXIpKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKG5vb3ApO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGFydCgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogRGVmYXVsdCBSRUFEX0NIVU5LX1NJWkUgaXMgMjU2IEtiLiBCdXQgd2l0aCB0aGF0IHNldHRpbmcgcmVhZEpzb24gbWV0aG9kIGlzIGZhaWxpbmcuIFRoaXMgaXMgYW4gaXNzdWVcbiAgICAgICAgICogd2l0aCBjb3Jkb3ZhIGZpbGUgcGx1Z2luLiBTbywgaW5jcmVhc2luZyBpdCB0byA1MTIgS2IgdG8gcmVhZCBsYXJnZSBkYXRhYmFzZSBzY2hlbWEgZmlsZXMgKD4yNTYgS2IpLlxuICAgICAgICAgKi9cbiAgICAgICAgRmlsZVJlYWRlci5SRUFEX0NIVU5LX1NJWkUgPSA1MTIgKiAxMDI0O1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb3Jkb3ZhQXBwVmVyc2lvbi5nZXRBcHBOYW1lKCkudGhlbihhcHBOYW1lID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FwcE5hbWUgPSBhcHBOYW1lO1xuICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy5jcmVhdGVGb2xkZXJJZk5vdEV4aXN0cyh0aGlzLmdldFRlbXBvcmFyeVJvb3RQYXRoKCksXG4gICAgICAgICAgICAgICAgICAgIEFQUF9GT0xERVJfU1RSVUNUVVJFLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9maWxlVHlwZVZzUGF0aE1hcC50ZW1wb3JhcnkpKTtcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuY3JlYXRlRm9sZGVySWZOb3RFeGlzdHModGhpcy5nZXRQZXJzaXN0ZW50Um9vdFBhdGgoKSxcbiAgICAgICAgICAgICAgICAgICAgQVBQX0ZPTERFUl9TVFJVQ1RVUkUsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZpbGVUeXBlVnNQYXRoTWFwLnBlcnNpc3RlbnQpKTtcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuc2V0dXBVcGxvYWREaXJlY3RvcnkoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpc0FuZHJvaWQoKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIG5lY2Vzc2FyeSB0byBwcmV2ZW50IG11bHRpcGxlIGZpbGUgcGVybWlzc2lvbiBwb3B1cC5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29yZG92YUZpbGUucmVhZEFzVGV4dChjb3Jkb3ZhLmZpbGUuZXh0ZXJuYWxSb290RGlyZWN0b3J5LCAncmFuZG9tLWZpbGUtZm9yLXBlcm1pc3Npb24nKS5jYXRjaChub29wKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlRm9sZGVySWZOb3RFeGlzdHMocGFyZW50OiBzdHJpbmcsIGZvbGRlcnMsIGZpbGVUeXBlTG9jYXRpb25NYXApIHtcbiAgICAgICAgY29uc3QgY2hpbGRQcm9taXNlcyA9IFtdO1xuICAgICAgICBpZiAoZm9sZGVycykge1xuICAgICAgICAgICAgZm9sZGVycy5mb3JFYWNoKGZvbGRlciA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGZvbGRlclBhdGg7XG4gICAgICAgICAgICAgICAgZm9sZGVyLm5hbWUgPSBmb2xkZXIubmFtZS5yZXBsYWNlKCd7QVBQX05BTUV9JywgdGhpcy5fYXBwTmFtZSk7XG4gICAgICAgICAgICAgICAgZm9sZGVyUGF0aCA9IHBhcmVudCArIGZvbGRlci5uYW1lICsgJy8nO1xuICAgICAgICAgICAgICAgIGlmIChmb2xkZXIuZmlsZVR5cGUgJiYgIWZpbGVUeXBlTG9jYXRpb25NYXBbZm9sZGVyLmZpbGVUeXBlXSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlVHlwZUxvY2F0aW9uTWFwW2ZvbGRlci5maWxlVHlwZV0gPSBmb2xkZXJQYXRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBwID0gdGhpcy5jb3Jkb3ZhRmlsZS5jcmVhdGVEaXIocGFyZW50LCBmb2xkZXIubmFtZSwgZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMuY3JlYXRlRm9sZGVySWZOb3RFeGlzdHMoZm9sZGVyUGF0aCwgZm9sZGVyLmNoaWxkcmVuLCBmaWxlVHlwZUxvY2F0aW9uTWFwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHRoaXMuY3JlYXRlRm9sZGVySWZOb3RFeGlzdHMoZm9sZGVyUGF0aCwgZm9sZGVyLmNoaWxkcmVuLCBmaWxlVHlwZUxvY2F0aW9uTWFwKSk7XG4gICAgICAgICAgICAgICAgY2hpbGRQcm9taXNlcy5wdXNoKHApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoaWxkUHJvbWlzZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGNoaWxkUHJvbWlzZXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kRmlsZVR5cGUoZmlsZU5hbWUpIHtcbiAgICAgICAgbGV0IGV4dGVuc2lvbjtcbiAgICAgICAgaWYgKGZpbGVOYW1lLmluZGV4T2YoJy4nKSA+IDApIHtcbiAgICAgICAgICAgIGV4dGVuc2lvbiA9IGZpbGVOYW1lLnNwbGl0KCcuJykucG9wKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGlmIChJTUFHRV9FWFRFTlNJT05TLnNvbWUoYSA9PiBhID09PSBleHRlbnNpb24pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEZpbGVUeXBlLklNQUdFO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFZJREVPX0VYVEVOU0lPTlMuc29tZShhID0+IGEgPT09IGV4dGVuc2lvbikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gRmlsZVR5cGUuVklERU87XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQVVESU9fRVhURU5TSU9OUy5zb21lKGEgPT4gYSA9PT0gZXh0ZW5zaW9uKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBGaWxlVHlwZS5BVURJTztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gRmlsZVR5cGUuRE9DVU1FTlQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXR1cFVwbG9hZERpcmVjdG9yeSgpIHtcbiAgICAgICAgY29uc3QgdXBsb2Fkc0Rpck5hbWUgPSAndXBsb2FkcycsXG4gICAgICAgICAgICBhcHBEaXIgPSBjb3Jkb3ZhLmZpbGUuZGF0YURpcmVjdG9yeTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29yZG92YUZpbGUuY2hlY2tEaXIoYXBwRGlyLCB1cGxvYWRzRGlyTmFtZSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMuX3VwbG9hZERpciA9IGFwcERpciArIHVwbG9hZHNEaXJOYW1lLFxuICAgICAgICAgICAgICAgICgpID0+IHRoaXMuY29yZG92YUZpbGUuY3JlYXRlRGlyKGFwcERpciwgdXBsb2Fkc0Rpck5hbWUsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMuX3VwbG9hZERpciA9IGFwcERpciArIHVwbG9hZHNEaXJOYW1lKSk7XG4gICAgfVxufVxuIl19