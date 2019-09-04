import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { noop } from '@wm/core';
import { DeviceFileService } from './device-file.service';
import { DeviceFileDownloadService } from './device-file-download.service';
import * as i0 from "@angular/core";
import * as i1 from "@ionic-native/file";
import * as i2 from "./device-file.service";
import * as i3 from "./device-file-download.service";
const CACHE_FILE_INDEX_NAME = 'appCache.json';
export class DeviceFileCacheService {
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
DeviceFileCacheService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceFileCacheService_Factory() { return new DeviceFileCacheService(i0.inject(i1.File), i0.inject(i2.DeviceFileService), i0.inject(i3.DeviceFileDownloadService)); }, token: DeviceFileCacheService, providedIn: "root" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLWZpbGUtY2FjaGUuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29yZS8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL2RldmljZS1maWxlLWNhY2hlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFMUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUdoQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQzs7Ozs7QUFJM0UsTUFBTSxxQkFBcUIsR0FBRyxlQUFlLENBQUM7QUFHOUMsTUFBTSxPQUFPLHNCQUFzQjtJQVEvQixZQUEyQixXQUFpQixFQUNqQyxXQUE4QixFQUM5QixlQUEwQztRQUYxQixnQkFBVyxHQUFYLFdBQVcsQ0FBTTtRQUNqQyxnQkFBVyxHQUFYLFdBQVcsQ0FBbUI7UUFDOUIsb0JBQWUsR0FBZixlQUFlLENBQTJCO1FBUjlDLGdCQUFXLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDO1FBRXpDLGdCQUFXLEdBQUcsRUFBRSxDQUFDO0lBUXpCLENBQUM7SUFFTSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVE7UUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7UUFDakMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVNLFlBQVksQ0FBQyxHQUFXLEVBQUUsbUJBQTRCLEVBQUUsWUFBcUI7UUFDaEYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQzthQUNwQyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzdCLElBQUksbUJBQW1CLEVBQUU7Z0JBQ3JCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDM0M7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRyxHQUFHLENBQUMsQ0FBQzthQUMvQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ2YsQ0FBQztJQUVNLGVBQWU7UUFDbEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBQzdDLENBQUM7SUFFTSxLQUFLO1FBQ1IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxxQkFBcUIsQ0FBQzthQUNoRixJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDWixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pCLENBQUM7SUFFTyxRQUFRLENBQUMsR0FBVyxFQUFFLFlBQXFCO1FBQy9DLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFlBQVksQ0FBQzthQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDYixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQztZQUNqQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUM3QixPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFTyxxQkFBcUI7UUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQzFHO2dCQUNJLE9BQU8sRUFBRSxJQUFJO2FBQ2hCLENBQUM7aUJBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQztpQkFDWCxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNQLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtvQkFDakIsVUFBVSxDQUFDLEdBQUcsRUFBRTt3QkFDWixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzt3QkFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7d0JBQ3hCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO29CQUNqQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQ1o7cUJBQU07b0JBQ0gsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7aUJBQ3pCO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDVjthQUFNO1lBQ0gsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7U0FDMUI7SUFDTCxDQUFDOzs7WUE3RUosVUFBVSxTQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTs7OztZQVp6QixJQUFJO1lBS0osaUJBQWlCO1lBQ2pCLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgRmlsZSB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvZmlsZSc7XG5cbmltcG9ydCB7IG5vb3AgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IElEZXZpY2VTdGFydFVwU2VydmljZSB9IGZyb20gJy4vZGV2aWNlLXN0YXJ0LXVwLXNlcnZpY2UnO1xuaW1wb3J0IHsgRGV2aWNlRmlsZVNlcnZpY2UgfSBmcm9tICcuL2RldmljZS1maWxlLnNlcnZpY2UnO1xuaW1wb3J0IHsgRGV2aWNlRmlsZURvd25sb2FkU2VydmljZSB9IGZyb20gJy4vZGV2aWNlLWZpbGUtZG93bmxvYWQuc2VydmljZSc7XG5cbmRlY2xhcmUgY29uc3QgY29yZG92YTtcblxuY29uc3QgQ0FDSEVfRklMRV9JTkRFWF9OQU1FID0gJ2FwcENhY2hlLmpzb24nO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIERldmljZUZpbGVDYWNoZVNlcnZpY2UgaW1wbGVtZW50cyBJRGV2aWNlU3RhcnRVcFNlcnZpY2Uge1xuXG4gICAgcHVibGljIHNlcnZpY2VOYW1lID0gRGV2aWNlRmlsZUNhY2hlU2VydmljZS5uYW1lO1xuXG4gICAgcHJpdmF0ZSBfY2FjaGVJbmRleCA9IHt9O1xuICAgIHByaXZhdGUgX3dyaXRpbmc7XG4gICAgcHJpdmF0ZSBfc2F2ZUNhY2hlO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHByaXZhdGUgY29yZG92YUZpbGU6IEZpbGUsXG4gICAgICAgcHJpdmF0ZSBmaWxlU2VydmljZTogRGV2aWNlRmlsZVNlcnZpY2UsXG4gICAgICAgcHJpdmF0ZSBkb3dubG9hZFNlcnZpY2U6IERldmljZUZpbGVEb3dubG9hZFNlcnZpY2UpIHtcblxuICAgIH1cblxuICAgIHB1YmxpYyBhZGRFbnRyeSh1cmwsIGZpbGVwYXRoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NhY2hlSW5kZXhbdXJsXSA9IGZpbGVwYXRoO1xuICAgICAgICB0aGlzLndyaXRlQ2FjaGVJbmRleFRvRmlsZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMb2NhbFBhdGgodXJsOiBzdHJpbmcsIGRvd25sb2FkSWZOb3RFeGlzdHM6IGJvb2xlYW4sIGlzUGVyc2lzdGVudDogYm9vbGVhbik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGhpcy5fY2FjaGVJbmRleFt1cmxdO1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlU2VydmljZS5pc1ZhbGlkUGF0aChmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fY2FjaGVJbmRleFt1cmxdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG93bmxvYWRJZk5vdEV4aXN0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZG93bmxvYWQodXJsLCBpc1BlcnNpc3RlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QoJ05vIGNhY2hlIGVudHJ5IGZvciAnICsgdXJsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbnZhbGlkYXRlQ2FjaGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NhY2hlSW5kZXggPSB7fTtcbiAgICAgICAgdGhpcy53cml0ZUNhY2hlSW5kZXhUb0ZpbGUoKTtcbiAgICAgICAgdGhpcy5maWxlU2VydmljZS5jbGVhclRlbXBvcmFyeVN0b3JhZ2UoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcmRvdmFGaWxlLnJlYWRBc1RleHQoY29yZG92YS5maWxlLmRhdGFEaXJlY3RvcnksIENBQ0hFX0ZJTEVfSU5ERVhfTkFNRSlcbiAgICAgICAgICAgIC50aGVuKGNvbnRlbnQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlSW5kZXggPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgICAgICAgICAgfSwgbm9vcCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkb3dubG9hZCh1cmw6IHN0cmluZywgaXNQZXJzaXN0ZW50OiBib29sZWFuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZG93bmxvYWRTZXJ2aWNlLmRvd25sb2FkKHVybCwgaXNQZXJzaXN0ZW50KVxuICAgICAgICAgICAgLnRoZW4oZmlsZXBhdGggPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlSW5kZXhbdXJsXSA9IGZpbGVwYXRoO1xuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVDYWNoZUluZGV4VG9GaWxlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVwYXRoO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB3cml0ZUNhY2hlSW5kZXhUb0ZpbGUoKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fd3JpdGluZykge1xuICAgICAgICAgICAgdGhpcy5fd3JpdGluZyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmNvcmRvdmFGaWxlLndyaXRlRmlsZShjb3Jkb3ZhLmZpbGUuZGF0YURpcmVjdG9yeSwgQ0FDSEVfRklMRV9JTkRFWF9OQU1FLCBKU09OLnN0cmluZ2lmeSh0aGlzLl9jYWNoZUluZGV4KSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWVcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChub29wKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3NhdmVDYWNoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fd3JpdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NhdmVDYWNoZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud3JpdGVDYWNoZUluZGV4VG9GaWxlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3dyaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fc2F2ZUNhY2hlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==