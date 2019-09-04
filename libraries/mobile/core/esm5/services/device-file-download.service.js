import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { File } from '@ionic-native/file';
import { filter, map } from 'rxjs/operators';
import { FileExtensionFromMimePipe } from '@wm/components';
import { DeviceFileService } from './device-file.service';
import * as i0 from "@angular/core";
import * as i1 from "@ionic-native/file";
import * as i2 from "@angular/common/http";
import * as i3 from "./device-file.service";
import * as i4 from "@wm/components";
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
        var req = new HttpRequest('GET', url, {
            responseType: 'blob',
            reportProgress: progressObserver != null
        });
        return this.http.request(req)
            .pipe(map(function (e) {
            if (progressObserver && progressObserver.next && e.type === HttpEventType.DownloadProgress) {
                progressObserver.next(e);
            }
            return e;
        }), filter(function (e) { return e.type === HttpEventType.Response; }), map(function (e) {
            if (progressObserver && progressObserver.complete) {
                progressObserver.complete();
            }
            return e;
        }))
            .toPromise();
    };
    DeviceFileDownloadService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    DeviceFileDownloadService.ctorParameters = function () { return [
        { type: File },
        { type: HttpClient },
        { type: DeviceFileService },
        { type: FileExtensionFromMimePipe }
    ]; };
    DeviceFileDownloadService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceFileDownloadService_Factory() { return new DeviceFileDownloadService(i0.inject(i1.File), i0.inject(i2.HttpClient), i0.inject(i3.DeviceFileService), i0.inject(i4.FileExtensionFromMimePipe)); }, token: DeviceFileDownloadService, providedIn: "root" });
    return DeviceFileDownloadService;
}());
export { DeviceFileDownloadService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLWZpbGUtZG93bmxvYWQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29yZS8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL2RldmljZS1maWxlLWRvd25sb2FkLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsVUFBVSxFQUFhLGFBQWEsRUFBRSxXQUFXLEVBQWdCLE1BQU0sc0JBQXNCLENBQUM7QUFFdkcsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0MsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFM0QsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7Ozs7OztBQUUxRCxJQUFNLHdCQUF3QixHQUFHLENBQUMsQ0FBQztBQUduQztJQU1JLG1DQUNZLFdBQWlCLEVBQ2pCLElBQWdCLEVBQ2hCLGlCQUFvQyxFQUNyQyx5QkFBb0Q7UUFIbkQsZ0JBQVcsR0FBWCxXQUFXLENBQU07UUFDakIsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUNoQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1FBQ3JDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFQdkQsbUJBQWMsR0FBRyxFQUFFLENBQUM7UUFDcEIseUJBQW9CLEdBQUcsQ0FBQyxDQUFDO0lBUWpDLENBQUM7SUFFTSw0Q0FBUSxHQUFmLFVBQWdCLEdBQVcsRUFBRSxZQUFxQixFQUFFLFVBQW1CLEVBQUUsUUFBaUIsRUFBRSxnQkFBZ0M7UUFDeEgsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENB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SSxPQUFBLENBQUMsQ0FBQyxJQUFJLEtBQUssYUFBYSxDQUFDLFFBQVEsRUFBakMsQ0FBaUMsQ0FBQyxFQUM5QyxHQUFHLENBQUUsVUFBQSxDQUFDO1lBQ0YsSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUU7Z0JBQy9DLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQy9CO1lBQ0QsT0FBUSxDQUF1QixDQUFDO1FBQ3BDLENBQUMsQ0FBQyxDQUNMO2FBQ0EsU0FBUyxFQUFFLENBQUM7SUFDckIsQ0FBQzs7Z0JBM0lKLFVBQVUsU0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7Ozs7Z0JBWHpCLElBQUk7Z0JBRkosVUFBVTtnQkFRVixpQkFBaUI7Z0JBRmpCLHlCQUF5Qjs7O29DQVBsQztDQTBKQyxBQTVJRCxJQTRJQztTQTNJWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwRXZlbnQsIEh0dHBFdmVudFR5cGUsIEh0dHBSZXF1ZXN0LCBIdHRwUmVzcG9uc2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IEZpbGUgfSBmcm9tICdAaW9uaWMtbmF0aXZlL2ZpbGUnO1xuaW1wb3J0IHsgT2JzZXJ2ZXIgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZpbHRlciwgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBGaWxlRXh0ZW5zaW9uRnJvbU1pbWVQaXBlIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5pbXBvcnQgeyBEZXZpY2VGaWxlU2VydmljZSB9IGZyb20gJy4vZGV2aWNlLWZpbGUuc2VydmljZSc7XG5cbmNvbnN0IE1BWF9DT05DVVJSRU5UX0RPV05MT0FEUyA9IDI7XG5kZWNsYXJlIGNvbnN0IF87XG5cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgRGV2aWNlRmlsZURvd25sb2FkU2VydmljZSB7XG5cbiAgICBwcml2YXRlIF9kb3dubG9hZFF1ZXVlID0gW107XG4gICAgcHJpdmF0ZSBfY29uY3VycmVudERvd25sb2FkcyA9IDA7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBjb3Jkb3ZhRmlsZTogRmlsZSxcbiAgICAgICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICBwcml2YXRlIGRldmljZUZpbGVTZXJ2aWNlOiBEZXZpY2VGaWxlU2VydmljZSxcbiAgICAgICAgcHVibGljIGZpbGVFeHRlbnNpb25Gcm9tTWltZVBpcGU6IEZpbGVFeHRlbnNpb25Gcm9tTWltZVBpcGUpIHtcblxuICAgIH1cblxuICAgIHB1YmxpYyBkb3dubG9hZCh1cmw6IHN0cmluZywgaXNQZXJzaXN0ZW50OiBib29sZWFuLCBkZXN0Rm9sZGVyPzogc3RyaW5nLCBkZXN0RmlsZT86IHN0cmluZywgcHJvZ3Jlc3NPYnNlcnZlcj86IE9ic2VydmVyPGFueT4pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRUb0Rvd25sb2FkUXVldWUodXJsLCBpc1BlcnNpc3RlbnQsIGRlc3RGb2xkZXIsIGRlc3RGaWxlLCBwcm9ncmVzc09ic2VydmVyKTtcbiAgICB9XG5cbiAgICAvLyBBZGRzIHRvIGRvd25sb2FkIHJlcXVlc3QgcXVldWVcbiAgICBwcml2YXRlIGFkZFRvRG93bmxvYWRRdWV1ZSh1cmw6IHN0cmluZywgaXNQZXJzaXN0ZW50OiBib29sZWFuLCBkZXN0Rm9sZGVyPzogc3RyaW5nLCBkZXN0RmlsZT86IHN0cmluZywgcHJvZ3Jlc3NPYnNlcnZlcj86IE9ic2VydmVyPGFueT4pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9kb3dubG9hZFF1ZXVlLnB1c2goe1xuICAgICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICAgIGlzUGVyc2lzdGVudDogaXNQZXJzaXN0ZW50LFxuICAgICAgICAgICAgICAgIGRlc3RGb2xkZXI6IGRlc3RGb2xkZXIsXG4gICAgICAgICAgICAgICAgZGVzdEZpbGU6IGRlc3RGaWxlLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHJlc29sdmUsXG4gICAgICAgICAgICAgICAgcmVqZWN0OiByZWplY3QsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NPYnNlcnZlcjogcHJvZ3Jlc3NPYnNlcnZlclxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5fY29uY3VycmVudERvd25sb2FkcyA8IE1BWF9DT05DVVJSRU5UX0RPV05MT0FEUykge1xuICAgICAgICAgICAgICAgIHRoaXMuZG93bmxvYWROZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZG93bmxvYWROZXh0KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZG93bmxvYWRRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCByZXEgPSB0aGlzLl9kb3dubG9hZFF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICB0aGlzLmRvd25sb2FkRmlsZShyZXEpLnRoZW4oZmlsZVBhdGggPT4ge1xuICAgICAgICAgICAgICAgIHJlcS5yZXNvbHZlKGZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRvd25sb2FkTmV4dCgpO1xuICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlcS5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRvd25sb2FkTmV4dCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTdGFydCBwcm9jZXNzaW5nIGEgZG93bmxvYWQgcmVxdWVzdFxuICAgIHByaXZhdGUgZG93bmxvYWRGaWxlKHJlcSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGxldCBmaWxlUGF0aCwgYmxvYjtcbiAgICAgICAgdGhpcy5fY29uY3VycmVudERvd25sb2FkcysrO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnNlbmRIdHRwUmVxdWVzdChyZXEudXJsLCByZXEucHJvZ3Jlc3NPYnNlcnZlcikudGhlbigoZSkgPT4ge1xuICAgICAgICAgICAgYmxvYiA9IChlIGFzIEh0dHBSZXNwb25zZTxCbG9iPikuYm9keTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbGVOYW1lKGUsIHJlcSwgYmxvYi50eXBlKTtcbiAgICAgICAgfSkudGhlbigoZmlsZU5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmICghcmVxLmRlc3RGb2xkZXIpIHtcbiAgICAgICAgICAgICAgICByZXEuZGVzdEZvbGRlciA9IHRoaXMuZGV2aWNlRmlsZVNlcnZpY2UuZmluZEZvbGRlclBhdGgocmVxLmlzUGVyc2lzdGVudCwgZmlsZU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZVBhdGggPSByZXEuZGVzdEZvbGRlciArIGZpbGVOYW1lO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29yZG92YUZpbGUud3JpdGVGaWxlKHJlcS5kZXN0Rm9sZGVyLCBmaWxlTmFtZSwgYmxvYik7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fY29uY3VycmVudERvd25sb2Fkcy0tO1xuICAgICAgICAgICAgcmV0dXJuIGZpbGVQYXRoO1xuICAgICAgICB9LCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2NvbmN1cnJlbnREb3dubG9hZHMtLTtcbiAgICAgICAgICAgIHRoaXMuY29yZG92YUZpbGUucmVtb3ZlRmlsZShyZXEuZGVzdEZvbGRlciwgcmVxLmRlc3RGaWxlKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChgRmFpbGVkIHRvIGRvd25sb2FkZWQgICR7cmVxLnVybH0gd2l0aCBlcnJvciAke0pTT04uc3RyaW5naWZ5KHJlc3BvbnNlKX1gKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZmlsZW5hbWVcbiAgICAgKiAxLiBpZiBmaWxlbmFtZSBleGlzdHMganVzdCByZXR1cm5cbiAgICAgKiAyLiByZXRyaWV2ZSB0aGUgZmlsZW5hbWUgZnJvbSByZXNwb25zZSBoZWFkZXJzIGkuZS4gY29udGVudC1kaXNwb3NpdGlvblxuICAgICAqIDMuIHBpY2sgdGhlIGZpbGVuYW1lIGZyb20gdGhlIGVuZCBvZiB0aGUgdXJsXG4gICAgICogSWYgZmlsZW5hbWUgZG9lc250IGNvbnRhaW4gdGhlIGV4dGVuc2lvbiB0aGVuIGV4dHJhY3QgdXNpbmcgbWltZVR5cGUuXG4gICAgICogR2VuZXJhdGVzIG5ld0ZpbGVOYW1lIGlmIGZpbGVuYW1lIGFscmVhZHkgZXhpc3RzLlxuICAgICAqIEBwYXJhbSByZXNwb25zZSwgZG93bmxvYWQgZmlsZSByZXNwb25zZVxuICAgICAqIEBwYXJhbSByZXEsIGRvd25sb2FkIHJlcXVlc3QgcGFyYW1zXG4gICAgICogQHBhcmFtIG1pbWVUeXBlIG1pbWUgdHlwZSBvZiBmaWxlXG4gICAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn1cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEZpbGVOYW1lKHJlc3BvbnNlLCByZXEsIG1pbWVUeXBlKSB7XG4gICAgICAgIGNvbnN0IGRpc3Bvc2l0aW9uID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtRGlzcG9zaXRpb24nKTtcbiAgICAgICAgbGV0IGZpbGVuYW1lID0gcmVxLmRlc3RGaWxlO1xuICAgICAgICBpZiAoIWZpbGVuYW1lICYmIGRpc3Bvc2l0aW9uICYmIGRpc3Bvc2l0aW9uLmluZGV4T2YoJ2F0dGFjaG1lbnQnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVuYW1lUmVnZXggPSAvZmlsZW5hbWVbXjs9XFxuXSo9KChbJ1wiXSkuKj9cXDJ8W147XFxuXSopLztcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBmaWxlbmFtZVJlZ2V4LmV4ZWMoZGlzcG9zaXRpb24pO1xuICAgICAgICAgICAgaWYgKG1hdGNoZXMgIT09IG51bGwgJiYgbWF0Y2hlc1sxXSkge1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lID0gbWF0Y2hlc1sxXS5yZXBsYWNlKC9bJ1wiXS9nLCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmaWxlbmFtZSkge1xuICAgICAgICAgICAgZmlsZW5hbWUgPSByZXEudXJsLnNwbGl0KCc/JylbMF07XG4gICAgICAgICAgICBmaWxlbmFtZSA9IGZpbGVuYW1lLnNwbGl0KCcvJykucG9wKCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZmlsZUV4dGVuc2lvbjtcbiAgICAgICAgaWYgKG1pbWVUeXBlKSB7XG4gICAgICAgICAgICBmaWxlRXh0ZW5zaW9uID0gdGhpcy5maWxlRXh0ZW5zaW9uRnJvbU1pbWVQaXBlLnRyYW5zZm9ybShtaW1lVHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGhhc0ZpbGVFeHRlbnNpb247XG4gICAgICAgIC8vIG9uZSBvciBtb3JlIGZpbGUgZXh0ZW5zaW9ucyBjYW4gaGF2ZSBzYW1lIG1pbWVUeXBlIHRoZW4gbG9vcCBvdmVyIHRoZSBmaWxlIGV4dGVuc2lvbnMuXG4gICAgICAgIGlmIChfLmlzQXJyYXkoZmlsZUV4dGVuc2lvbikpIHtcbiAgICAgICAgICAgIGhhc0ZpbGVFeHRlbnNpb24gPSBfLmZpbmQoZmlsZUV4dGVuc2lvbiwgZXh0ZW5zaW9uID0+IF8uZW5kc1dpdGgoZmlsZW5hbWUsIGV4dGVuc2lvbikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaGFzRmlsZUV4dGVuc2lvbiAmJiAhXy5lbmRzV2l0aChmaWxlbmFtZSwgZmlsZUV4dGVuc2lvbikpIHtcbiAgICAgICAgICAgIGZpbGVuYW1lID0gZmlsZW5hbWUgKyBmaWxlRXh0ZW5zaW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZm9sZGVyID0gcmVxLmRlc3RGb2xkZXIgfHwgdGhpcy5kZXZpY2VGaWxlU2VydmljZS5maW5kRm9sZGVyUGF0aChyZXEuaXNQZXJzaXN0ZW50LCBmaWxlbmFtZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmRldmljZUZpbGVTZXJ2aWNlLm5ld0ZpbGVOYW1lKGZvbGRlciwgZmlsZW5hbWUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VuZEh0dHBSZXF1ZXN0KHVybDogc3RyaW5nLCBwcm9ncmVzc09ic2VydmVyOiBPYnNlcnZlcjxIdHRwRXZlbnQ8YW55Pj4pOiBQcm9taXNlPEh0dHBSZXNwb25zZTxhbnk+PiB7XG4gICAgICAgIGNvbnN0IHJlcSA9IG5ldyBIdHRwUmVxdWVzdCgnR0VUJywgdXJsLCB7XG4gICAgICAgICAgICByZXNwb25zZVR5cGU6ICdibG9iJyxcbiAgICAgICAgICAgIHJlcG9ydFByb2dyZXNzOiBwcm9ncmVzc09ic2VydmVyICE9IG51bGxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHAucmVxdWVzdChyZXEpXG4gICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICBtYXAoZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzc09ic2VydmVyICYmIHByb2dyZXNzT2JzZXJ2ZXIubmV4dCAmJiBlLnR5cGUgPT09IEh0dHBFdmVudFR5cGUuRG93bmxvYWRQcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NPYnNlcnZlci5uZXh0KGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGZpbHRlcihlID0+IGUudHlwZSA9PT0gSHR0cEV2ZW50VHlwZS5SZXNwb25zZSksXG4gICAgICAgICAgICAgICAgbWFwKCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyZXNzT2JzZXJ2ZXIgJiYgcHJvZ3Jlc3NPYnNlcnZlci5jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NPYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoZSBhcyBIdHRwUmVzcG9uc2U8YW55Pik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC50b1Byb21pc2UoKTtcbiAgICB9XG59XG4iXX0=