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
const MAX_CONCURRENT_DOWNLOADS = 2;
export class DeviceFileDownloadService {
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
DeviceFileDownloadService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceFileDownloadService_Factory() { return new DeviceFileDownloadService(i0.inject(i1.File), i0.inject(i2.HttpClient), i0.inject(i3.DeviceFileService), i0.inject(i4.FileExtensionFromMimePipe)); }, token: DeviceFileDownloadService, providedIn: "root" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLWZpbGUtZG93bmxvYWQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29yZS8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL2RldmljZS1maWxlLWRvd25sb2FkLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsVUFBVSxFQUFhLGFBQWEsRUFBRSxXQUFXLEVBQWdCLE1BQU0sc0JBQXNCLENBQUM7QUFFdkcsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0MsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFM0QsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7Ozs7OztBQUUxRCxNQUFNLHdCQUF3QixHQUFHLENBQUMsQ0FBQztBQUluQyxNQUFNLE9BQU8seUJBQXlCO0lBS2xDLFlBQ1ksV0FBaUIsRUFDakIsSUFBZ0IsRUFDaEIsaUJBQW9DLEVBQ3JDLHlCQUFvRDtRQUhuRCxnQkFBVyxHQUFYLFdBQVcsQ0FBTTtRQUNqQixTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2hCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7UUFDckMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQVB2RCxtQkFBYyxHQUFHLEVBQUUsQ0FBQztRQUNwQix5QkFBb0IsR0FBRyxDQUFDLENBQUM7SUFRakMsQ0FBQztJQUVNLFFBQVEsQ0FBQyxHQUFXLEVBQUUsWUFBcUIsRUFBRSxVQUFtQixFQUFFLFFBQWlCLEVBQUUsZ0JBQWdDO1FBQ3hILE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxnQkFB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QUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFDOUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ0wsSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUU7Z0JBQy9DLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQy9CO1lBQ0QsT0FBUSxDQUF1QixDQUFDO1FBQ3BDLENBQUMsQ0FBQyxDQUNMO2FBQ0EsU0FBUyxFQUFFLENBQUM7SUFDckIsQ0FBQzs7O1lBM0lKLFVBQVUsU0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7Ozs7WUFYekIsSUFBSTtZQUZKLFVBQVU7WUFRVixpQkFBaUI7WUFGakIseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cEV2ZW50LCBIdHRwRXZlbnRUeXBlLCBIdHRwUmVxdWVzdCwgSHR0cFJlc3BvbnNlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQgeyBGaWxlIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9maWxlJztcbmltcG9ydCB7IE9ic2VydmVyIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBmaWx0ZXIsIG1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgRmlsZUV4dGVuc2lvbkZyb21NaW1lUGlwZSB9IGZyb20gJ0B3bS9jb21wb25lbnRzJztcblxuaW1wb3J0IHsgRGV2aWNlRmlsZVNlcnZpY2UgfSBmcm9tICcuL2RldmljZS1maWxlLnNlcnZpY2UnO1xuXG5jb25zdCBNQVhfQ09OQ1VSUkVOVF9ET1dOTE9BRFMgPSAyO1xuZGVjbGFyZSBjb25zdCBfO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIERldmljZUZpbGVEb3dubG9hZFNlcnZpY2Uge1xuXG4gICAgcHJpdmF0ZSBfZG93bmxvYWRRdWV1ZSA9IFtdO1xuICAgIHByaXZhdGUgX2NvbmN1cnJlbnREb3dubG9hZHMgPSAwO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgY29yZG92YUZpbGU6IEZpbGUsXG4gICAgICAgIHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICAgICAgcHJpdmF0ZSBkZXZpY2VGaWxlU2VydmljZTogRGV2aWNlRmlsZVNlcnZpY2UsXG4gICAgICAgIHB1YmxpYyBmaWxlRXh0ZW5zaW9uRnJvbU1pbWVQaXBlOiBGaWxlRXh0ZW5zaW9uRnJvbU1pbWVQaXBlKSB7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgZG93bmxvYWQodXJsOiBzdHJpbmcsIGlzUGVyc2lzdGVudDogYm9vbGVhbiwgZGVzdEZvbGRlcj86IHN0cmluZywgZGVzdEZpbGU/OiBzdHJpbmcsIHByb2dyZXNzT2JzZXJ2ZXI/OiBPYnNlcnZlcjxhbnk+KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkVG9Eb3dubG9hZFF1ZXVlKHVybCwgaXNQZXJzaXN0ZW50LCBkZXN0Rm9sZGVyLCBkZXN0RmlsZSwgcHJvZ3Jlc3NPYnNlcnZlcik7XG4gICAgfVxuXG4gICAgLy8gQWRkcyB0byBkb3dubG9hZCByZXF1ZXN0IHF1ZXVlXG4gICAgcHJpdmF0ZSBhZGRUb0Rvd25sb2FkUXVldWUodXJsOiBzdHJpbmcsIGlzUGVyc2lzdGVudDogYm9vbGVhbiwgZGVzdEZvbGRlcj86IHN0cmluZywgZGVzdEZpbGU/OiBzdHJpbmcsIHByb2dyZXNzT2JzZXJ2ZXI/OiBPYnNlcnZlcjxhbnk+KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fZG93bmxvYWRRdWV1ZS5wdXNoKHtcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICBpc1BlcnNpc3RlbnQ6IGlzUGVyc2lzdGVudCxcbiAgICAgICAgICAgICAgICBkZXN0Rm9sZGVyOiBkZXN0Rm9sZGVyLFxuICAgICAgICAgICAgICAgIGRlc3RGaWxlOiBkZXN0RmlsZSxcbiAgICAgICAgICAgICAgICByZXNvbHZlOiByZXNvbHZlLFxuICAgICAgICAgICAgICAgIHJlamVjdDogcmVqZWN0LFxuICAgICAgICAgICAgICAgIHByb2dyZXNzT2JzZXJ2ZXI6IHByb2dyZXNzT2JzZXJ2ZXJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NvbmN1cnJlbnREb3dubG9hZHMgPCBNQVhfQ09OQ1VSUkVOVF9ET1dOTE9BRFMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRvd25sb2FkTmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRvd25sb2FkTmV4dCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2Rvd25sb2FkUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgcmVxID0gdGhpcy5fZG93bmxvYWRRdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgdGhpcy5kb3dubG9hZEZpbGUocmVxKS50aGVuKGZpbGVQYXRoID0+IHtcbiAgICAgICAgICAgICAgICByZXEucmVzb2x2ZShmaWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kb3dubG9hZE5leHQoKTtcbiAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXEucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kb3dubG9hZE5leHQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU3RhcnQgcHJvY2Vzc2luZyBhIGRvd25sb2FkIHJlcXVlc3RcbiAgICBwcml2YXRlIGRvd25sb2FkRmlsZShyZXEpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBsZXQgZmlsZVBhdGgsIGJsb2I7XG4gICAgICAgIHRoaXMuX2NvbmN1cnJlbnREb3dubG9hZHMrKztcblxuICAgICAgICByZXR1cm4gdGhpcy5zZW5kSHR0cFJlcXVlc3QocmVxLnVybCwgcmVxLnByb2dyZXNzT2JzZXJ2ZXIpLnRoZW4oKGUpID0+IHtcbiAgICAgICAgICAgIGJsb2IgPSAoZSBhcyBIdHRwUmVzcG9uc2U8QmxvYj4pLmJvZHk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRGaWxlTmFtZShlLCByZXEsIGJsb2IudHlwZSk7XG4gICAgICAgIH0pLnRoZW4oKGZpbGVOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXJlcS5kZXN0Rm9sZGVyKSB7XG4gICAgICAgICAgICAgICAgcmVxLmRlc3RGb2xkZXIgPSB0aGlzLmRldmljZUZpbGVTZXJ2aWNlLmZpbmRGb2xkZXJQYXRoKHJlcS5pc1BlcnNpc3RlbnQsIGZpbGVOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGVQYXRoID0gcmVxLmRlc3RGb2xkZXIgKyBmaWxlTmFtZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvcmRvdmFGaWxlLndyaXRlRmlsZShyZXEuZGVzdEZvbGRlciwgZmlsZU5hbWUsIGJsb2IpO1xuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2NvbmN1cnJlbnREb3dubG9hZHMtLTtcbiAgICAgICAgICAgIHJldHVybiBmaWxlUGF0aDtcbiAgICAgICAgfSwgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9jb25jdXJyZW50RG93bmxvYWRzLS07XG4gICAgICAgICAgICB0aGlzLmNvcmRvdmFGaWxlLnJlbW92ZUZpbGUocmVxLmRlc3RGb2xkZXIsIHJlcS5kZXN0RmlsZSk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoYEZhaWxlZCB0byBkb3dubG9hZGVkICAke3JlcS51cmx9IHdpdGggZXJyb3IgJHtKU09OLnN0cmluZ2lmeShyZXNwb25zZSl9YCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGZpbGVuYW1lXG4gICAgICogMS4gaWYgZmlsZW5hbWUgZXhpc3RzIGp1c3QgcmV0dXJuXG4gICAgICogMi4gcmV0cmlldmUgdGhlIGZpbGVuYW1lIGZyb20gcmVzcG9uc2UgaGVhZGVycyBpLmUuIGNvbnRlbnQtZGlzcG9zaXRpb25cbiAgICAgKiAzLiBwaWNrIHRoZSBmaWxlbmFtZSBmcm9tIHRoZSBlbmQgb2YgdGhlIHVybFxuICAgICAqIElmIGZpbGVuYW1lIGRvZXNudCBjb250YWluIHRoZSBleHRlbnNpb24gdGhlbiBleHRyYWN0IHVzaW5nIG1pbWVUeXBlLlxuICAgICAqIEdlbmVyYXRlcyBuZXdGaWxlTmFtZSBpZiBmaWxlbmFtZSBhbHJlYWR5IGV4aXN0cy5cbiAgICAgKiBAcGFyYW0gcmVzcG9uc2UsIGRvd25sb2FkIGZpbGUgcmVzcG9uc2VcbiAgICAgKiBAcGFyYW0gcmVxLCBkb3dubG9hZCByZXF1ZXN0IHBhcmFtc1xuICAgICAqIEBwYXJhbSBtaW1lVHlwZSBtaW1lIHR5cGUgb2YgZmlsZVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRGaWxlTmFtZShyZXNwb25zZSwgcmVxLCBtaW1lVHlwZSkge1xuICAgICAgICBjb25zdCBkaXNwb3NpdGlvbiA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LURpc3Bvc2l0aW9uJyk7XG4gICAgICAgIGxldCBmaWxlbmFtZSA9IHJlcS5kZXN0RmlsZTtcbiAgICAgICAgaWYgKCFmaWxlbmFtZSAmJiBkaXNwb3NpdGlvbiAmJiBkaXNwb3NpdGlvbi5pbmRleE9mKCdhdHRhY2htZW50JykgIT09IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlbmFtZVJlZ2V4ID0gL2ZpbGVuYW1lW147PVxcbl0qPSgoWydcIl0pLio/XFwyfFteO1xcbl0qKS87XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gZmlsZW5hbWVSZWdleC5leGVjKGRpc3Bvc2l0aW9uKTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVzICE9PSBudWxsICYmIG1hdGNoZXNbMV0pIHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZSA9IG1hdGNoZXNbMV0ucmVwbGFjZSgvWydcIl0vZywgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghZmlsZW5hbWUpIHtcbiAgICAgICAgICAgIGZpbGVuYW1lID0gcmVxLnVybC5zcGxpdCgnPycpWzBdO1xuICAgICAgICAgICAgZmlsZW5hbWUgPSBmaWxlbmFtZS5zcGxpdCgnLycpLnBvcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGZpbGVFeHRlbnNpb247XG4gICAgICAgIGlmIChtaW1lVHlwZSkge1xuICAgICAgICAgICAgZmlsZUV4dGVuc2lvbiA9IHRoaXMuZmlsZUV4dGVuc2lvbkZyb21NaW1lUGlwZS50cmFuc2Zvcm0obWltZVR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBoYXNGaWxlRXh0ZW5zaW9uO1xuICAgICAgICAvLyBvbmUgb3IgbW9yZSBmaWxlIGV4dGVuc2lvbnMgY2FuIGhhdmUgc2FtZSBtaW1lVHlwZSB0aGVuIGxvb3Agb3ZlciB0aGUgZmlsZSBleHRlbnNpb25zLlxuICAgICAgICBpZiAoXy5pc0FycmF5KGZpbGVFeHRlbnNpb24pKSB7XG4gICAgICAgICAgICBoYXNGaWxlRXh0ZW5zaW9uID0gXy5maW5kKGZpbGVFeHRlbnNpb24sIGV4dGVuc2lvbiA9PiBfLmVuZHNXaXRoKGZpbGVuYW1lLCBleHRlbnNpb24pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWhhc0ZpbGVFeHRlbnNpb24gJiYgIV8uZW5kc1dpdGgoZmlsZW5hbWUsIGZpbGVFeHRlbnNpb24pKSB7XG4gICAgICAgICAgICBmaWxlbmFtZSA9IGZpbGVuYW1lICsgZmlsZUV4dGVuc2lvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZvbGRlciA9IHJlcS5kZXN0Rm9sZGVyIHx8IHRoaXMuZGV2aWNlRmlsZVNlcnZpY2UuZmluZEZvbGRlclBhdGgocmVxLmlzUGVyc2lzdGVudCwgZmlsZW5hbWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5kZXZpY2VGaWxlU2VydmljZS5uZXdGaWxlTmFtZShmb2xkZXIsIGZpbGVuYW1lKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbmRIdHRwUmVxdWVzdCh1cmw6IHN0cmluZywgcHJvZ3Jlc3NPYnNlcnZlcjogT2JzZXJ2ZXI8SHR0cEV2ZW50PGFueT4+KTogUHJvbWlzZTxIdHRwUmVzcG9uc2U8YW55Pj4ge1xuICAgICAgICBjb25zdCByZXEgPSBuZXcgSHR0cFJlcXVlc3QoJ0dFVCcsIHVybCwge1xuICAgICAgICAgICAgcmVzcG9uc2VUeXBlOiAnYmxvYicsXG4gICAgICAgICAgICByZXBvcnRQcm9ncmVzczogcHJvZ3Jlc3NPYnNlcnZlciAhPSBudWxsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwLnJlcXVlc3QocmVxKVxuICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgbWFwKGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3NPYnNlcnZlciAmJiBwcm9ncmVzc09ic2VydmVyLm5leHQgJiYgZS50eXBlID09PSBIdHRwRXZlbnRUeXBlLkRvd25sb2FkUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzT2JzZXJ2ZXIubmV4dChlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBmaWx0ZXIoZSA9PiBlLnR5cGUgPT09IEh0dHBFdmVudFR5cGUuUmVzcG9uc2UpLFxuICAgICAgICAgICAgICAgIG1hcCggZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzc09ic2VydmVyICYmIHByb2dyZXNzT2JzZXJ2ZXIuY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzT2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGUgYXMgSHR0cFJlc3BvbnNlPGFueT4pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAudG9Qcm9taXNlKCk7XG4gICAgfVxufVxuIl19