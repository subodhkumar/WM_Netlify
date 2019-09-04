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
export class DeviceFileOpenerService {
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
DeviceFileOpenerService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceFileOpenerService_Factory() { return new DeviceFileOpenerService(i0.inject(i1.File), i0.inject(i2.FileOpener), i0.inject(i3.DeviceFileService), i0.inject(i4.DeviceFileCacheService), i0.inject(i5.DeviceFileDownloadService)); }, token: DeviceFileOpenerService, providedIn: "root" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLWZpbGUtb3BlbmVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvcmUvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9kZXZpY2UtZmlsZS1vcGVuZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFdkQsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRWxELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3JFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDOzs7Ozs7O0FBUTFELE1BQU0sT0FBTyx1QkFBdUI7SUFNaEMsWUFBb0IsV0FBaUIsRUFDakIsaUJBQTZCLEVBQzdCLFdBQThCLEVBQzlCLFlBQW9DLEVBQ3BDLGVBQTBDO1FBSjFDLGdCQUFXLEdBQVgsV0FBVyxDQUFNO1FBQ2pCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBWTtRQUM3QixnQkFBVyxHQUFYLFdBQVcsQ0FBbUI7UUFDOUIsaUJBQVksR0FBWixZQUFZLENBQXdCO1FBQ3BDLG9CQUFlLEdBQWYsZUFBZSxDQUEyQjtRQVJ2RCxnQkFBVyxHQUFHLHVCQUF1QixDQUFDLElBQUksQ0FBQztJQVVsRCxDQUFDO0lBRUQsK0RBQStEO0lBQ3hELGVBQWUsQ0FBQyxRQUFRO1FBQzNCLE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNqQyx3Q0FBd0M7WUFDeEMseUJBQXlCLENBQUMsUUFBUSxFQUFFLFNBQVMs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LCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEZpbGUgfSBmcm9tICdAaW9uaWMtbmF0aXZlL2ZpbGUnO1xuaW1wb3J0IHsgRmlsZU9wZW5lciB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvZmlsZS1vcGVuZXInO1xuXG5pbXBvcnQgeyBpc0FuZHJvaWQsIGlzSW9zLCBub29wIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBEZXZpY2VGaWxlQ2FjaGVTZXJ2aWNlIH0gZnJvbSAnLi9kZXZpY2UtZmlsZS1jYWNoZS5zZXJ2aWNlJztcbmltcG9ydCB7IERldmljZUZpbGVEb3dubG9hZFNlcnZpY2UgfSBmcm9tICcuL2RldmljZS1maWxlLWRvd25sb2FkLnNlcnZpY2UnO1xuaW1wb3J0IHsgRGV2aWNlRmlsZVNlcnZpY2UgfSBmcm9tICcuL2RldmljZS1maWxlLnNlcnZpY2UnO1xuaW1wb3J0IHsgSURldmljZVN0YXJ0VXBTZXJ2aWNlIH0gZnJvbSAnLi9kZXZpY2Utc3RhcnQtdXAtc2VydmljZSc7XG5cbmRlY2xhcmUgY29uc3QgY29yZG92YTtcbmRlY2xhcmUgY29uc3QgXztcbmRlY2xhcmUgY29uc3QgcmVzb2x2ZUxvY2FsRmlsZVN5c3RlbVVSTDtcblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBEZXZpY2VGaWxlT3BlbmVyU2VydmljZSBpbXBsZW1lbnRzIElEZXZpY2VTdGFydFVwU2VydmljZSB7XG5cbiAgICBwdWJsaWMgc2VydmljZU5hbWUgPSBEZXZpY2VGaWxlT3BlbmVyU2VydmljZS5uYW1lO1xuXG4gICAgcHJpdmF0ZSBfZG93bmxvYWRzRm9sZGVyO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBjb3Jkb3ZhRmlsZTogRmlsZSxcbiAgICAgICAgICAgICAgICBwcml2YXRlIGNvcmRvdmFGaWxlT3BlbmVyOiBGaWxlT3BlbmVyLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgZmlsZVNlcnZpY2U6IERldmljZUZpbGVTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgY2FjaGVTZXJ2aWNlOiBEZXZpY2VGaWxlQ2FjaGVTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgZG93bmxvYWRTZXJ2aWNlOiBEZXZpY2VGaWxlRG93bmxvYWRTZXJ2aWNlKSB7XG5cbiAgICB9XG5cbiAgICAvLyB0aGlzIG1ldGhvZCByZXR1cm5zIHRoZSBtaW1lIHR5cGUgb2YgZmlsZSBmcm9tIHRoZSBmaWxlUGF0aC5cbiAgICBwdWJsaWMgZ2V0RmlsZU1pbWVUeXBlKGZpbGVQYXRoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4gKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyBSZWFkIHRoZSBmaWxlIGVudHJ5IGZyb20gdGhlIGZpbGUgVVJMXG4gICAgICAgICAgICByZXNvbHZlTG9jYWxGaWxlU3lzdGVtVVJMKGZpbGVQYXRoLCBmaWxlRW50cnkgPT4ge1xuICAgICAgICAgICAgICAgIGZpbGVFbnRyeS5maWxlKG1ldGFkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtZXRhZGF0YS50eXBlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3BlblJlbW90ZUZpbGUodXJsOiBzdHJpbmcsIGV4dGVuc2lvbjogc3RyaW5nLCBmaWxlTmFtZT86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRMb2NhbFBhdGgodXJsLCBleHRlbnNpb24sIGZpbGVOYW1lKVxuICAgICAgICAgICAgLnRoZW4oZmlsZVBhdGggPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbGVNaW1lVHlwZShmaWxlUGF0aCkudGhlbih0eXBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29yZG92YUZpbGVPcGVuZXIub3BlbihmaWxlUGF0aCwgdHlwZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGxldCBkb3dubG9hZHNQYXJlbnQ7XG4gICAgICAgIGlmIChpc0FuZHJvaWQoKSkge1xuICAgICAgICAgICAgZG93bmxvYWRzUGFyZW50ID0gY29yZG92YS5maWxlLmV4dGVybmFsQ2FjaGVEaXJlY3Rvcnk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNJb3MoKSkge1xuICAgICAgICAgICAgZG93bmxvYWRzUGFyZW50ID0gY29yZG92YS5maWxlLmRvY3VtZW50c0RpcmVjdG9yeSArICdOb0Nsb3VkLyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb3dubG9hZHNQYXJlbnQgPSBjb3Jkb3ZhLmZpbGUuZGF0YURpcmVjdG9yeTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jb3Jkb3ZhRmlsZS5jcmVhdGVEaXIoZG93bmxvYWRzUGFyZW50LCAnZG93bmxvYWRzJywgZmFsc2UpXG4gICAgICAgICAgICAuY2F0Y2gobm9vcClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kb3dubG9hZHNGb2xkZXIgPSBkb3dubG9hZHNQYXJlbnQgKyAnZG93bmxvYWRzLyc7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlRmlsZU5hbWUodXJsOiBzdHJpbmcsIGV4dGVuc2lvbjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGZpbGVOYW1lID0gdXJsLnNwbGl0KCc/JylbMF07XG4gICAgICAgIGZpbGVOYW1lID0gZmlsZU5hbWUuc3BsaXQoJy8nKS5wb3AoKTtcbiAgICAgICAgZmlsZU5hbWUgPSB0aGlzLmZpbGVTZXJ2aWNlLmFwcGVuZFRvRmlsZU5hbWUoZmlsZU5hbWUsICcnICsgXy5ub3coKSk7XG4gICAgICAgIGlmIChleHRlbnNpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBmaWxlTmFtZS5zcGxpdCgnLicpWzBdICsgJy4nICsgZXh0ZW5zaW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWxlTmFtZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldExvY2FsUGF0aCh1cmw6IHN0cmluZywgZXh0ZW5zaW9uPzogc3RyaW5nLCBmaWxlbmFtZT86IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVTZXJ2aWNlLmdldExvY2FsUGF0aCh1cmwsIGZhbHNlLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZpbGVQYXRoID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaWxlTmFtZSwgaSwgZnJvbURpciwgZnJvbUZpbGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJcyBpdCBwYXJ0IG9mIGRvd25sb2FkZWQgZm9sZGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoLnN0YXJ0c1dpdGgodGhpcy5fZG93bmxvYWRzRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IGZpbGVuYW1lIHx8IHRoaXMuZ2VuZXJhdGVGaWxlTmFtZSh1cmwsIGV4dGVuc2lvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSA9IGZpbGVQYXRoLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbURpciA9IGZpbGVQYXRoLnN1YnN0cmluZygwLCBpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tRmlsZSA9IGZpbGVQYXRoLnN1YnN0cmluZyhpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3Jkb3ZhRmlsZS5jb3B5RmlsZShmcm9tRGlyLCBmcm9tRmlsZSwgdGhpcy5fZG93bmxvYWRzRm9sZGVyLCBmaWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RmlsZVBhdGggPSB0aGlzLl9kb3dubG9hZHNGb2xkZXIgKyBmaWxlTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVTZXJ2aWNlLmFkZEVudHJ5KHVybCwgbmV3RmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXdGaWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRvd25sb2FkU2VydmljZS5kb3dubG9hZCh1cmwsIGZhbHNlLCB0aGlzLl9kb3dubG9hZHNGb2xkZXIsIGZpbGVuYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZpbGVQYXRoID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZVNlcnZpY2UuYWRkRW50cnkodXJsLCBmaWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=