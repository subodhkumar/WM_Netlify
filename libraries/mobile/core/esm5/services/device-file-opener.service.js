import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { isAndroid, isIos, noop } from '@wm/core';
import { DeviceFileCacheService } from './device-file-cache.service';
import { DeviceFileDownloadService } from './device-file-download.service';
import { DeviceFileService } from './device-file.service';
import * as i0 from "@angular/core";
import * as i1 from "@ionic-native/file";
import * as i2 from "@ionic-native/file-opener";
import * as i3 from "./device-file.service";
import * as i4 from "./device-file-cache.service";
import * as i5 from "./device-file-download.service";
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
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    DeviceFileOpenerService.ctorParameters = function () { return [
        { type: File },
        { type: FileOpener },
        { type: DeviceFileService },
        { type: DeviceFileCacheService },
        { type: DeviceFileDownloadService }
    ]; };
    DeviceFileOpenerService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceFileOpenerService_Factory() { return new DeviceFileOpenerService(i0.inject(i1.File), i0.inject(i2.FileOpener), i0.inject(i3.DeviceFileService), i0.inject(i4.DeviceFileCacheService), i0.inject(i5.DeviceFileDownloadService)); }, token: DeviceFileOpenerService, providedIn: "root" });
    return DeviceFileOpenerService;
}());
export { DeviceFileOpenerService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLWZpbGUtb3BlbmVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvcmUvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9kZXZpY2UtZmlsZS1vcGVuZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFdkQsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRWxELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3JFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDOzs7Ozs7O0FBTzFEO0lBT0ksaUNBQW9CLFdBQWlCLEVBQ2pCLGlCQUE2QixFQUM3QixXQUE4QixFQUM5QixZQUFvQyxFQUNwQyxlQUEwQztRQUoxQyxnQkFBVyxHQUFYLFdBQVcsQ0FBTTtRQUNqQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQVk7UUFDN0IsZ0JBQVcsR0FBWCxXQUFXLENBQW1CO1FBQzlCLGlCQUFZLEdBQVosWUFBWSxDQUF3QjtRQUNwQyxvQkFBZSxHQUFmLGVBQWUsQ0FBMkI7UUFSdkQsZ0JBQVcsR0FBRyx1QkFBdUIsQ0FBQyxJQUFJLENBQUM7SUFVbEQsQ0FBQztJQUVELCtEQUErRDtJQUN4RCxpREFBZSxHQUF0QixVQUF1QixRQUFRO1FBQzNCLE9BQU8sSUFBSSxPQUFPLENBQU8sVUFBQyxPQUFPO1lBQzdCLHdDQUF3QztZQUN4Qyx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsVUFBQSxTQUFTO2dCQUN6QyxTQUFTLENB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LElBMkZDO1NBMUZZLHVCQUF1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgRmlsZSB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvZmlsZSc7XG5pbXBvcnQgeyBGaWxlT3BlbmVyIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9maWxlLW9wZW5lcic7XG5cbmltcG9ydCB7IGlzQW5kcm9pZCwgaXNJb3MsIG5vb3AgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IERldmljZUZpbGVDYWNoZVNlcnZpY2UgfSBmcm9tICcuL2RldmljZS1maWxlLWNhY2hlLnNlcnZpY2UnO1xuaW1wb3J0IHsgRGV2aWNlRmlsZURvd25sb2FkU2VydmljZSB9IGZyb20gJy4vZGV2aWNlLWZpbGUtZG93bmxvYWQuc2VydmljZSc7XG5pbXBvcnQgeyBEZXZpY2VGaWxlU2VydmljZSB9IGZyb20gJy4vZGV2aWNlLWZpbGUuc2VydmljZSc7XG5pbXBvcnQgeyBJRGV2aWNlU3RhcnRVcFNlcnZpY2UgfSBmcm9tICcuL2RldmljZS1zdGFydC11cC1zZXJ2aWNlJztcblxuZGVjbGFyZSBjb25zdCBjb3Jkb3ZhO1xuZGVjbGFyZSBjb25zdCBfO1xuZGVjbGFyZSBjb25zdCByZXNvbHZlTG9jYWxGaWxlU3lzdGVtVVJMO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIERldmljZUZpbGVPcGVuZXJTZXJ2aWNlIGltcGxlbWVudHMgSURldmljZVN0YXJ0VXBTZXJ2aWNlIHtcblxuICAgIHB1YmxpYyBzZXJ2aWNlTmFtZSA9IERldmljZUZpbGVPcGVuZXJTZXJ2aWNlLm5hbWU7XG5cbiAgICBwcml2YXRlIF9kb3dubG9hZHNGb2xkZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvcmRvdmFGaWxlOiBGaWxlLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgY29yZG92YUZpbGVPcGVuZXI6IEZpbGVPcGVuZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBmaWxlU2VydmljZTogRGV2aWNlRmlsZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBjYWNoZVNlcnZpY2U6IERldmljZUZpbGVDYWNoZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBkb3dubG9hZFNlcnZpY2U6IERldmljZUZpbGVEb3dubG9hZFNlcnZpY2UpIHtcblxuICAgIH1cblxuICAgIC8vIHRoaXMgbWV0aG9kIHJldHVybnMgdGhlIG1pbWUgdHlwZSBvZiBmaWxlIGZyb20gdGhlIGZpbGVQYXRoLlxuICAgIHB1YmxpYyBnZXRGaWxlTWltZVR5cGUoZmlsZVBhdGgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PiAoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIC8vIFJlYWQgdGhlIGZpbGUgZW50cnkgZnJvbSB0aGUgZmlsZSBVUkxcbiAgICAgICAgICAgIHJlc29sdmVMb2NhbEZpbGVTeXN0ZW1VUkwoZmlsZVBhdGgsIGZpbGVFbnRyeSA9PiB7XG4gICAgICAgICAgICAgICAgZmlsZUVudHJ5LmZpbGUobWV0YWRhdGEgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1ldGFkYXRhLnR5cGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBvcGVuUmVtb3RlRmlsZSh1cmw6IHN0cmluZywgZXh0ZW5zaW9uOiBzdHJpbmcsIGZpbGVOYW1lPzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldExvY2FsUGF0aCh1cmwsIGV4dGVuc2lvbiwgZmlsZU5hbWUpXG4gICAgICAgICAgICAudGhlbihmaWxlUGF0aCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmlsZU1pbWVUeXBlKGZpbGVQYXRoKS50aGVuKHR5cGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb3Jkb3ZhRmlsZU9wZW5lci5vcGVuKGZpbGVQYXRoLCB0eXBlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGFydCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgbGV0IGRvd25sb2Fkc1BhcmVudDtcbiAgICAgICAgaWYgKGlzQW5kcm9pZCgpKSB7XG4gICAgICAgICAgICBkb3dubG9hZHNQYXJlbnQgPSBjb3Jkb3ZhLmZpbGUuZXh0ZXJuYWxDYWNoZURpcmVjdG9yeTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0lvcygpKSB7XG4gICAgICAgICAgICBkb3dubG9hZHNQYXJlbnQgPSBjb3Jkb3ZhLmZpbGUuZG9jdW1lbnRzRGlyZWN0b3J5ICsgJ05vQ2xvdWQvJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvd25sb2Fkc1BhcmVudCA9IGNvcmRvdmEuZmlsZS5kYXRhRGlyZWN0b3J5O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmNvcmRvdmFGaWxlLmNyZWF0ZURpcihkb3dubG9hZHNQYXJlbnQsICdkb3dubG9hZHMnLCBmYWxzZSlcbiAgICAgICAgICAgIC5jYXRjaChub29wKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Rvd25sb2Fkc0ZvbGRlciA9IGRvd25sb2Fkc1BhcmVudCArICdkb3dubG9hZHMvJztcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVGaWxlTmFtZSh1cmw6IHN0cmluZywgZXh0ZW5zaW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBsZXQgZmlsZU5hbWUgPSB1cmwuc3BsaXQoJz8nKVswXTtcbiAgICAgICAgZmlsZU5hbWUgPSBmaWxlTmFtZS5zcGxpdCgnLycpLnBvcCgpO1xuICAgICAgICBmaWxlTmFtZSA9IHRoaXMuZmlsZVNlcnZpY2UuYXBwZW5kVG9GaWxlTmFtZShmaWxlTmFtZSwgJycgKyBfLm5vdygpKTtcbiAgICAgICAgaWYgKGV4dGVuc2lvbikge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGVOYW1lLnNwbGl0KCcuJylbMF0gKyAnLicgKyBleHRlbnNpb247XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGVOYW1lO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TG9jYWxQYXRoKHVybDogc3RyaW5nLCBleHRlbnNpb24/OiBzdHJpbmcsIGZpbGVuYW1lPzogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWNoZVNlcnZpY2UuZ2V0TG9jYWxQYXRoKHVybCwgZmFsc2UsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAudGhlbiggZmlsZVBhdGggPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbGVOYW1lLCBpLCBmcm9tRGlyLCBmcm9tRmlsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElzIGl0IHBhcnQgb2YgZG93bmxvYWRlZCBmb2xkZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGguc3RhcnRzV2l0aCh0aGlzLl9kb3dubG9hZHNGb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmaWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gZmlsZW5hbWUgfHwgdGhpcy5nZW5lcmF0ZUZpbGVOYW1lKHVybCwgZXh0ZW5zaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpID0gZmlsZVBhdGgubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tRGlyID0gZmlsZVBhdGguc3Vic3RyaW5nKDAsIGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21GaWxlID0gZmlsZVBhdGguc3Vic3RyaW5nKGkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcmRvdmFGaWxlLmNvcHlGaWxlKGZyb21EaXIsIGZyb21GaWxlLCB0aGlzLl9kb3dubG9hZHNGb2xkZXIsIGZpbGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdGaWxlUGF0aCA9IHRoaXMuX2Rvd25sb2Fkc0ZvbGRlciArIGZpbGVOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZVNlcnZpY2UuYWRkRW50cnkodXJsLCBuZXdGaWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ld0ZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG93bmxvYWRTZXJ2aWNlLmRvd25sb2FkKHVybCwgZmFsc2UsIHRoaXMuX2Rvd25sb2Fkc0ZvbGRlciwgZmlsZW5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZmlsZVBhdGggPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlU2VydmljZS5hZGRFbnRyeSh1cmwsIGZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmaWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==