import { HttpClient } from '@angular/common/http';
import { Component, ElementRef } from '@angular/core';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { addClass, hasCordova, noop, removeClass, setCSS } from '@wm/core';
import { DeviceFileDownloadService, DeviceService } from '@wm/mobile/core';
var DEFAULT_CLS = 'app-update-dialog modal fade in hidden';
var AUTO_UPDATE_FILENAME = 'app-auto-update.apk';
var AppUpdateComponent = /** @class */ (function () {
    function AppUpdateComponent(deviceService, fileDownloadService, elRef, file, fileOpener, http) {
        var _this = this;
        this.deviceService = deviceService;
        this.fileDownloadService = fileDownloadService;
        this.elRef = elRef;
        this.file = file;
        this.fileOpener = fileOpener;
        this.http = http;
        this.downloadProgress = 0;
        this.downloading = false;
        this.message = 'There is an update available. Would you like to update the app?';
        addClass(this.elRef.nativeElement, DEFAULT_CLS);
        setCSS(this.elRef.nativeElement, 'display', 'block');
        if (hasCordova()) {
            this.getBuildMeta().then(function (buildMeta) {
                if (buildMeta && buildMeta.buildMode === 'DEVELOPMENT_MODE') {
                    _this.file.removeFile(cordova.file.externalApplicationStorageDirectory, AUTO_UPDATE_FILENAME).catch(noop);
                    _this.checkForUpdate()
                        .then(_this.getUserConfirmation.bind(_this), noop);
                }
            });
        }
    }
    AppUpdateComponent.prototype.cancel = function () {
        addClass(this.elRef.nativeElement, 'hidden');
    };
    AppUpdateComponent.prototype.installLatestVersion = function () {
        var _this = this;
        var apkFile = cordova.file.externalApplicationStorageDirectory + AUTO_UPDATE_FILENAME, downloadLink = this._buildMeta.host + "/appBuild/rest/mobileBuilds/android/download?token=" + this._buildMeta.token + "&buildNumber=" + this._buildMeta.latestBuildNumber + "&fileName=" + AUTO_UPDATE_FILENAME + "&releaseVersion=" + this._buildMeta.platformVersion, progressObserver = { next: function (e) { _this.downloadProgress = (e.loaded / e.total) * 100; }, error: null, complete: null };
        this.fileDownloadService.download(downloadLink, false, cordova.file.externalApplicationStorageDirectory, AUTO_UPDATE_FILENAME, progressObserver).then(function () {
            _this.fileOpener.open(apkFile, 'application/vnd.android.package-archive');
        }, function () {
            this.message = 'Failed to download latest version.';
        });
        this.message = "Downloading the latest version [" + this._buildMeta.latestVersion + "].";
        this.downloading = true;
    };
    AppUpdateComponent.prototype.checkForUpdate = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.http.get(_this._buildMeta.host + "/appBuild/rest/mobileBuilds/latest_build?token=" + _this._buildMeta.token + "&releaseVersion=" + _this._buildMeta.platformVersion)
                .toPromise()
                .then(function (response) {
                var latestBuildNumber = response.success.body.buildNumber, latestVersion = response.success.body.version;
                if (_this._buildMeta.buildNumber < latestBuildNumber) {
                    _this._buildMeta.latestBuildNumber = latestBuildNumber;
                    _this._buildMeta.latestVersion = latestVersion;
                    resolve(latestBuildNumber);
                }
                else {
                    reject();
                }
            }, reject);
        });
    };
    AppUpdateComponent.prototype.getBuildMeta = function () {
        var _this = this;
        if (!this._buildMeta) {
            return this.file.readAsText(cordova.file.applicationDirectory + 'www/', 'build_meta.json')
                .then(function (data) {
                _this._buildMeta = JSON.parse(data);
                return _this._buildMeta;
            }, noop);
        }
        return Promise.resolve(this._buildMeta);
    };
    AppUpdateComponent.prototype.getUserConfirmation = function () {
        this.downloadProgress = 0;
        this.downloading = false;
        this.message = 'There is an update available. Would you like to update the app?';
        removeClass(this.elRef.nativeElement, 'hidden');
    };
    AppUpdateComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmAppUpdate]',
                    template: "<div class=\"modal-dialog\">\n    <div class=\"modal-content\"> \n        <div class=\"modal-body\"> \n            <span [textContent]=\"message\"></span>\n            <div class=\"progress\" [hidden]=\"!downloading\">\n                <div class=\"progress-bar\" [style.width.%]=\"downloadProgress\"></div>\n            </div>\n        </div>\n        <div class=\"modal-footer\"> \n            <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\" (click)=\"cancel()\">Skip update</button>\n            <button type=\"button\" class=\"btn btn-primary\" [hidden]=\"downloading\" (click)=\"installLatestVersion()\">Update</button>\n        </div>\n    </div>\n</div>"
                }] }
    ];
    /** @nocollapse */
    AppUpdateComponent.ctorParameters = function () { return [
        { type: DeviceService },
        { type: DeviceFileDownloadService },
        { type: ElementRef },
        { type: File },
        { type: FileOpener },
        { type: HttpClient }
    ]; };
    return AppUpdateComponent;
}());
export { AppUpdateComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXVwZGF0ZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2FwcC11cGRhdGUvYXBwLXVwZGF0ZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXRELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFdkQsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDM0UsT0FBTyxFQUFFLHlCQUF5QixFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBSTNFLElBQU0sV0FBVyxHQUFHLHdDQUF3QyxDQUFDO0FBRTdELElBQU0sb0JBQW9CLEdBQUcscUJBQXFCLENBQUM7QUFFbkQ7SUFZSSw0QkFDWSxhQUE0QixFQUM1QixtQkFBOEMsRUFDOUMsS0FBaUIsRUFDakIsSUFBVSxFQUNWLFVBQXNCLEVBQ3RCLElBQWdCO1FBTjVCLGlCQW9CQztRQW5CVyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQTJCO1FBQzlDLFVBQUssR0FBTCxLQUFLLENBQVk7UUFDakIsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUNWLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsU0FBSSxHQUFKLElBQUksQ0FBWTtRQVpyQixxQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDckIsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFDcEIsWUFBTyxHQUFHLGlFQUFpRSxDQUFDO1FBYS9FLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JELElBQUksVUFBVSxFQUFFLEVBQUU7WUFDZCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUEsU0FBUztnQkFDOUIsSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLFNBQVMsS0FBSyxrQkFBa0IsRUFBRTtvQkFDekQsS0FBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDekcsS0FBSSxDQUFDLGNBQWMsRUFBRTt5QkFDaEIsSUFBSSxDQUFDLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQ3hEO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDTjtJQUNMLENBQUM7SUFFTSxtQ0FBTSxHQUFiO1FBQ0ksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFTSxpREFBb0IsR0FBM0I7UUFBQSxpQkFnQkM7UUFmRyxJQUFNLE9BQU8sR0FBSSxPQUFPLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxHQUFHLG9CQUFvQixFQUNwRixZQUFZLEdBQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLDJEQUFzRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUsscUJBQWdCLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLGtCQUFhLG9CQUFvQix3QkFBbUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFpQixFQUN2UCxnQkFBZ0IsR0FBRyxFQUFFLElBQUksRUFBRSxVQUFBLENBQUMsSUFBTSxLQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUM7UUFDMUgsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FDN0IsWUFBWSxFQUNaLEtBQUssRUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxFQUNoRCxvQkFBb0IsRUFDcEIsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDbkIsS0FBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHlDQUF5QyxDQUFDLENBQUM7UUFDN0UsQ0FBQyxFQUFFO1lBQ0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxvQ0FBb0MsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNQLElBQUksQ0FBQyxPQUFPLEdBQUcscUNBQW1DLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxPQUFJLENBQUM7UUFDcEYsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDNUIsQ0FBQztJQUVPLDJDQUFjLEdBQXRCO1FBQUEsaUJBZ0JDO1FBZkcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLEtBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFJLEtBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSx1REFBa0QsS0FBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLHdCQUFtQixLQUFJLENBQUMsVUFBVSxDQUFDLGVBQWlCLENBQUM7aUJBQzVKLFNBQVMsRUFBRTtpQkFDWCxJQUFJLENBQUMsVUFBQyxRQUFhO2dCQUNoQixJQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFDdkQsYUFBYSxHQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDbkQsSUFBSSxLQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxpQkFBaUIsRUFBRTtvQkFDakQsS0FBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztvQkFDdEQsS0FBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO29CQUM5QyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztpQkFDOUI7cUJBQU07b0JBQ0gsTUFBTSxFQUFFLENBQUM7aUJBQ1o7WUFDTCxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8seUNBQVksR0FBcEI7UUFBQSxpQkFTQztRQVJHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxNQUFNLEVBQUUsaUJBQWlCLENBQUM7aUJBQ3JGLElBQUksQ0FBQyxVQUFBLElBQUk7Z0JBQ04sS0FBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLEtBQUksQ0FBQyxVQUFVLENBQUM7WUFDM0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU8sZ0RBQW1CLEdBQTNCO1FBQ0ksSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLGlFQUFpRSxDQUFDO1FBQ2pGLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNwRCxDQUFDOztnQkExRkosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxlQUFlO29CQUN6Qix5ckJBQTBDO2lCQUM3Qzs7OztnQkFYbUMsYUFBYTtnQkFBeEMseUJBQXlCO2dCQU5kLFVBQVU7Z0JBRXJCLElBQUk7Z0JBQ0osVUFBVTtnQkFKVixVQUFVOztJQTBHbkIseUJBQUM7Q0FBQSxBQTNGRCxJQTJGQztTQXZGWSxrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEZpbGUgfSBmcm9tICdAaW9uaWMtbmF0aXZlL2ZpbGUnO1xuaW1wb3J0IHsgRmlsZU9wZW5lciB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvZmlsZS1vcGVuZXInO1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgaGFzQ29yZG92YSwgbm9vcCwgcmVtb3ZlQ2xhc3MsIHNldENTUyB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IERldmljZUZpbGVEb3dubG9hZFNlcnZpY2UsIERldmljZVNlcnZpY2UgfSBmcm9tICdAd20vbW9iaWxlL2NvcmUnO1xuXG5kZWNsYXJlIGNvbnN0IGNvcmRvdmE7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC11cGRhdGUtZGlhbG9nIG1vZGFsIGZhZGUgaW4gaGlkZGVuJztcblxuY29uc3QgQVVUT19VUERBVEVfRklMRU5BTUUgPSAnYXBwLWF1dG8tdXBkYXRlLmFwayc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtQXBwVXBkYXRlXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2FwcC11cGRhdGUuY29tcG9uZW50Lmh0bWwnXG59KVxuZXhwb3J0IGNsYXNzIEFwcFVwZGF0ZUNvbXBvbmVudCB7XG5cbiAgICBwdWJsaWMgZG93bmxvYWRQcm9ncmVzcyA9IDA7XG4gICAgcHVibGljIGRvd25sb2FkaW5nID0gZmFsc2U7XG4gICAgcHVibGljIG1lc3NhZ2UgPSAnVGhlcmUgaXMgYW4gdXBkYXRlIGF2YWlsYWJsZS4gV291bGQgeW91IGxpa2UgdG8gdXBkYXRlIHRoZSBhcHA/JztcblxuICAgIHByaXZhdGUgX2J1aWxkTWV0YTogYW55O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgZGV2aWNlU2VydmljZTogRGV2aWNlU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBmaWxlRG93bmxvYWRTZXJ2aWNlOiBEZXZpY2VGaWxlRG93bmxvYWRTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGVsUmVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwcml2YXRlIGZpbGU6IEZpbGUsXG4gICAgICAgIHByaXZhdGUgZmlsZU9wZW5lcjogRmlsZU9wZW5lcixcbiAgICAgICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50XG4gICAgKSB7XG5cbiAgICAgICAgYWRkQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCBERUZBVUxUX0NMUyk7XG4gICAgICAgIHNldENTUyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgIGlmIChoYXNDb3Jkb3ZhKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0QnVpbGRNZXRhKCkudGhlbihidWlsZE1ldGEgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChidWlsZE1ldGEgJiYgYnVpbGRNZXRhLmJ1aWxkTW9kZSA9PT0gJ0RFVkVMT1BNRU5UX01PREUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlsZS5yZW1vdmVGaWxlKGNvcmRvdmEuZmlsZS5leHRlcm5hbEFwcGxpY2F0aW9uU3RvcmFnZURpcmVjdG9yeSwgQVVUT19VUERBVEVfRklMRU5BTUUpLmNhdGNoKG5vb3ApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrRm9yVXBkYXRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuZ2V0VXNlckNvbmZpcm1hdGlvbi5iaW5kKHRoaXMpLCBub29wKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjYW5jZWwoKSB7XG4gICAgICAgIGFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2hpZGRlbicpO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbnN0YWxsTGF0ZXN0VmVyc2lvbigpIHtcbiAgICAgICAgY29uc3QgYXBrRmlsZSA9ICBjb3Jkb3ZhLmZpbGUuZXh0ZXJuYWxBcHBsaWNhdGlvblN0b3JhZ2VEaXJlY3RvcnkgKyBBVVRPX1VQREFURV9GSUxFTkFNRSxcbiAgICAgICAgICAgIGRvd25sb2FkTGluayA9IGAke3RoaXMuX2J1aWxkTWV0YS5ob3N0fS9hcHBCdWlsZC9yZXN0L21vYmlsZUJ1aWxkcy9hbmRyb2lkL2Rvd25sb2FkP3Rva2VuPSR7dGhpcy5fYnVpbGRNZXRhLnRva2VufSZidWlsZE51bWJlcj0ke3RoaXMuX2J1aWxkTWV0YS5sYXRlc3RCdWlsZE51bWJlcn0mZmlsZU5hbWU9JHtBVVRPX1VQREFURV9GSUxFTkFNRX0mcmVsZWFzZVZlcnNpb249JHt0aGlzLl9idWlsZE1ldGEucGxhdGZvcm1WZXJzaW9ufWAsXG4gICAgICAgICAgICBwcm9ncmVzc09ic2VydmVyID0geyBuZXh0OiBlID0+IHsgdGhpcy5kb3dubG9hZFByb2dyZXNzID0gKGUubG9hZGVkIC8gZS50b3RhbCkgKiAxMDA7IH0sIGVycm9yOiBudWxsLCBjb21wbGV0ZTogbnVsbH07XG4gICAgICAgIHRoaXMuZmlsZURvd25sb2FkU2VydmljZS5kb3dubG9hZChcbiAgICAgICAgICAgIGRvd25sb2FkTGluayxcbiAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgY29yZG92YS5maWxlLmV4dGVybmFsQXBwbGljYXRpb25TdG9yYWdlRGlyZWN0b3J5LFxuICAgICAgICAgICAgQVVUT19VUERBVEVfRklMRU5BTUUsXG4gICAgICAgICAgICBwcm9ncmVzc09ic2VydmVyKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGVPcGVuZXIub3BlbihhcGtGaWxlLCAnYXBwbGljYXRpb24vdm5kLmFuZHJvaWQucGFja2FnZS1hcmNoaXZlJyk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlID0gJ0ZhaWxlZCB0byBkb3dubG9hZCBsYXRlc3QgdmVyc2lvbi4nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IGBEb3dubG9hZGluZyB0aGUgbGF0ZXN0IHZlcnNpb24gWyR7dGhpcy5fYnVpbGRNZXRhLmxhdGVzdFZlcnNpb259XS5gO1xuICAgICAgICB0aGlzLmRvd25sb2FkaW5nID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrRm9yVXBkYXRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5odHRwLmdldChgJHt0aGlzLl9idWlsZE1ldGEuaG9zdH0vYXBwQnVpbGQvcmVzdC9tb2JpbGVCdWlsZHMvbGF0ZXN0X2J1aWxkP3Rva2VuPSR7dGhpcy5fYnVpbGRNZXRhLnRva2VufSZyZWxlYXNlVmVyc2lvbj0ke3RoaXMuX2J1aWxkTWV0YS5wbGF0Zm9ybVZlcnNpb259YClcbiAgICAgICAgICAgICAgICAudG9Qcm9taXNlKClcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXRlc3RCdWlsZE51bWJlciA9IHJlc3BvbnNlLnN1Y2Nlc3MuYm9keS5idWlsZE51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhdGVzdFZlcnNpb24gPSAgcmVzcG9uc2Uuc3VjY2Vzcy5ib2R5LnZlcnNpb247XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9idWlsZE1ldGEuYnVpbGROdW1iZXIgPCBsYXRlc3RCdWlsZE51bWJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRNZXRhLmxhdGVzdEJ1aWxkTnVtYmVyID0gbGF0ZXN0QnVpbGROdW1iZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9idWlsZE1ldGEubGF0ZXN0VmVyc2lvbiA9IGxhdGVzdFZlcnNpb247XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGxhdGVzdEJ1aWxkTnVtYmVyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRCdWlsZE1ldGEoKSB7XG4gICAgICAgIGlmICghdGhpcy5fYnVpbGRNZXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlLnJlYWRBc1RleHQoY29yZG92YS5maWxlLmFwcGxpY2F0aW9uRGlyZWN0b3J5ICsgJ3d3dy8nLCAnYnVpbGRfbWV0YS5qc29uJylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRNZXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2J1aWxkTWV0YTtcbiAgICAgICAgICAgICAgICB9LCBub29wKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2J1aWxkTWV0YSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRVc2VyQ29uZmlybWF0aW9uKCkge1xuICAgICAgICB0aGlzLmRvd25sb2FkUHJvZ3Jlc3MgPSAwO1xuICAgICAgICB0aGlzLmRvd25sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9ICdUaGVyZSBpcyBhbiB1cGRhdGUgYXZhaWxhYmxlLiBXb3VsZCB5b3UgbGlrZSB0byB1cGRhdGUgdGhlIGFwcD8nO1xuICAgICAgICByZW1vdmVDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdoaWRkZW4nKTtcbiAgICB9XG59XG4iXX0=