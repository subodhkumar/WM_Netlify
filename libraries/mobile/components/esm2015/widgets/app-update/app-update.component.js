import { HttpClient } from '@angular/common/http';
import { Component, ElementRef } from '@angular/core';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { addClass, hasCordova, noop, removeClass, setCSS } from '@wm/core';
import { DeviceFileDownloadService, DeviceService } from '@wm/mobile/core';
const DEFAULT_CLS = 'app-update-dialog modal fade in hidden';
const AUTO_UPDATE_FILENAME = 'app-auto-update.apk';
export class AppUpdateComponent {
    constructor(deviceService, fileDownloadService, elRef, file, fileOpener, http) {
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
            this.getBuildMeta().then(buildMeta => {
                if (buildMeta && buildMeta.buildMode === 'DEVELOPMENT_MODE') {
                    this.file.removeFile(cordova.file.externalApplicationStorageDirectory, AUTO_UPDATE_FILENAME).catch(noop);
                    this.checkForUpdate()
                        .then(this.getUserConfirmation.bind(this), noop);
                }
            });
        }
    }
    cancel() {
        addClass(this.elRef.nativeElement, 'hidden');
    }
    installLatestVersion() {
        const apkFile = cordova.file.externalApplicationStorageDirectory + AUTO_UPDATE_FILENAME, downloadLink = `${this._buildMeta.host}/appBuild/rest/mobileBuilds/android/download?token=${this._buildMeta.token}&buildNumber=${this._buildMeta.latestBuildNumber}&fileName=${AUTO_UPDATE_FILENAME}&releaseVersion=${this._buildMeta.platformVersion}`, progressObserver = { next: e => { this.downloadProgress = (e.loaded / e.total) * 100; }, error: null, complete: null };
        this.fileDownloadService.download(downloadLink, false, cordova.file.externalApplicationStorageDirectory, AUTO_UPDATE_FILENAME, progressObserver).then(() => {
            this.fileOpener.open(apkFile, 'application/vnd.android.package-archive');
        }, function () {
            this.message = 'Failed to download latest version.';
        });
        this.message = `Downloading the latest version [${this._buildMeta.latestVersion}].`;
        this.downloading = true;
    }
    checkForUpdate() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this._buildMeta.host}/appBuild/rest/mobileBuilds/latest_build?token=${this._buildMeta.token}&releaseVersion=${this._buildMeta.platformVersion}`)
                .toPromise()
                .then((response) => {
                const latestBuildNumber = response.success.body.buildNumber, latestVersion = response.success.body.version;
                if (this._buildMeta.buildNumber < latestBuildNumber) {
                    this._buildMeta.latestBuildNumber = latestBuildNumber;
                    this._buildMeta.latestVersion = latestVersion;
                    resolve(latestBuildNumber);
                }
                else {
                    reject();
                }
            }, reject);
        });
    }
    getBuildMeta() {
        if (!this._buildMeta) {
            return this.file.readAsText(cordova.file.applicationDirectory + 'www/', 'build_meta.json')
                .then(data => {
                this._buildMeta = JSON.parse(data);
                return this._buildMeta;
            }, noop);
        }
        return Promise.resolve(this._buildMeta);
    }
    getUserConfirmation() {
        this.downloadProgress = 0;
        this.downloading = false;
        this.message = 'There is an update available. Would you like to update the app?';
        removeClass(this.elRef.nativeElement, 'hidden');
    }
}
AppUpdateComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmAppUpdate]',
                template: "<div class=\"modal-dialog\">\n    <div class=\"modal-content\"> \n        <div class=\"modal-body\"> \n            <span [textContent]=\"message\"></span>\n            <div class=\"progress\" [hidden]=\"!downloading\">\n                <div class=\"progress-bar\" [style.width.%]=\"downloadProgress\"></div>\n            </div>\n        </div>\n        <div class=\"modal-footer\"> \n            <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\" (click)=\"cancel()\">Skip update</button>\n            <button type=\"button\" class=\"btn btn-primary\" [hidden]=\"downloading\" (click)=\"installLatestVersion()\">Update</button>\n        </div>\n    </div>\n</div>"
            }] }
];
/** @nocollapse */
AppUpdateComponent.ctorParameters = () => [
    { type: DeviceService },
    { type: DeviceFileDownloadService },
    { type: ElementRef },
    { type: File },
    { type: FileOpener },
    { type: HttpClient }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXVwZGF0ZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2FwcC11cGRhdGUvYXBwLXVwZGF0ZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXRELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFdkQsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDM0UsT0FBTyxFQUFFLHlCQUF5QixFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBSTNFLE1BQU0sV0FBVyxHQUFHLHdDQUF3QyxDQUFDO0FBRTdELE1BQU0sb0JBQW9CLEdBQUcscUJBQXFCLENBQUM7QUFNbkQsTUFBTSxPQUFPLGtCQUFrQjtJQVEzQixZQUNZLGFBQTRCLEVBQzVCLG1CQUE4QyxFQUM5QyxLQUFpQixFQUNqQixJQUFVLEVBQ1YsVUFBc0IsRUFDdEIsSUFBZ0I7UUFMaEIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUEyQjtRQUM5QyxVQUFLLEdBQUwsS0FBSyxDQUFZO1FBQ2pCLFNBQUksR0FBSixJQUFJLENBQU07UUFDVixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLFNBQUksR0FBSixJQUFJLENBQVk7UUFackIscUJBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLFlBQU8sR0FBRyxpRUFBaUUsQ0FBQztRQWEv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QTBDO2FBQzdDOzs7O1lBWG1DLGFBQWE7WUFBeEMseUJBQXlCO1lBTmQsVUFBVTtZQUVyQixJQUFJO1lBQ0osVUFBVTtZQUpWLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEZpbGUgfSBmcm9tICdAaW9uaWMtbmF0aXZlL2ZpbGUnO1xuaW1wb3J0IHsgRmlsZU9wZW5lciB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvZmlsZS1vcGVuZXInO1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgaGFzQ29yZG92YSwgbm9vcCwgcmVtb3ZlQ2xhc3MsIHNldENTUyB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IERldmljZUZpbGVEb3dubG9hZFNlcnZpY2UsIERldmljZVNlcnZpY2UgfSBmcm9tICdAd20vbW9iaWxlL2NvcmUnO1xuXG5kZWNsYXJlIGNvbnN0IGNvcmRvdmE7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC11cGRhdGUtZGlhbG9nIG1vZGFsIGZhZGUgaW4gaGlkZGVuJztcblxuY29uc3QgQVVUT19VUERBVEVfRklMRU5BTUUgPSAnYXBwLWF1dG8tdXBkYXRlLmFwayc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtQXBwVXBkYXRlXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2FwcC11cGRhdGUuY29tcG9uZW50Lmh0bWwnXG59KVxuZXhwb3J0IGNsYXNzIEFwcFVwZGF0ZUNvbXBvbmVudCB7XG5cbiAgICBwdWJsaWMgZG93bmxvYWRQcm9ncmVzcyA9IDA7XG4gICAgcHVibGljIGRvd25sb2FkaW5nID0gZmFsc2U7XG4gICAgcHVibGljIG1lc3NhZ2UgPSAnVGhlcmUgaXMgYW4gdXBkYXRlIGF2YWlsYWJsZS4gV291bGQgeW91IGxpa2UgdG8gdXBkYXRlIHRoZSBhcHA/JztcblxuICAgIHByaXZhdGUgX2J1aWxkTWV0YTogYW55O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgZGV2aWNlU2VydmljZTogRGV2aWNlU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBmaWxlRG93bmxvYWRTZXJ2aWNlOiBEZXZpY2VGaWxlRG93bmxvYWRTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGVsUmVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwcml2YXRlIGZpbGU6IEZpbGUsXG4gICAgICAgIHByaXZhdGUgZmlsZU9wZW5lcjogRmlsZU9wZW5lcixcbiAgICAgICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50XG4gICAgKSB7XG5cbiAgICAgICAgYWRkQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCBERUZBVUxUX0NMUyk7XG4gICAgICAgIHNldENTUyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgIGlmIChoYXNDb3Jkb3ZhKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0QnVpbGRNZXRhKCkudGhlbihidWlsZE1ldGEgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChidWlsZE1ldGEgJiYgYnVpbGRNZXRhLmJ1aWxkTW9kZSA9PT0gJ0RFVkVMT1BNRU5UX01PREUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlsZS5yZW1vdmVGaWxlKGNvcmRvdmEuZmlsZS5leHRlcm5hbEFwcGxpY2F0aW9uU3RvcmFnZURpcmVjdG9yeSwgQVVUT19VUERBVEVfRklMRU5BTUUpLmNhdGNoKG5vb3ApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrRm9yVXBkYXRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuZ2V0VXNlckNvbmZpcm1hdGlvbi5iaW5kKHRoaXMpLCBub29wKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjYW5jZWwoKSB7XG4gICAgICAgIGFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2hpZGRlbicpO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbnN0YWxsTGF0ZXN0VmVyc2lvbigpIHtcbiAgICAgICAgY29uc3QgYXBrRmlsZSA9ICBjb3Jkb3ZhLmZpbGUuZXh0ZXJuYWxBcHBsaWNhdGlvblN0b3JhZ2VEaXJlY3RvcnkgKyBBVVRPX1VQREFURV9GSUxFTkFNRSxcbiAgICAgICAgICAgIGRvd25sb2FkTGluayA9IGAke3RoaXMuX2J1aWxkTWV0YS5ob3N0fS9hcHBCdWlsZC9yZXN0L21vYmlsZUJ1aWxkcy9hbmRyb2lkL2Rvd25sb2FkP3Rva2VuPSR7dGhpcy5fYnVpbGRNZXRhLnRva2VufSZidWlsZE51bWJlcj0ke3RoaXMuX2J1aWxkTWV0YS5sYXRlc3RCdWlsZE51bWJlcn0mZmlsZU5hbWU9JHtBVVRPX1VQREFURV9GSUxFTkFNRX0mcmVsZWFzZVZlcnNpb249JHt0aGlzLl9idWlsZE1ldGEucGxhdGZvcm1WZXJzaW9ufWAsXG4gICAgICAgICAgICBwcm9ncmVzc09ic2VydmVyID0geyBuZXh0OiBlID0+IHsgdGhpcy5kb3dubG9hZFByb2dyZXNzID0gKGUubG9hZGVkIC8gZS50b3RhbCkgKiAxMDA7IH0sIGVycm9yOiBudWxsLCBjb21wbGV0ZTogbnVsbH07XG4gICAgICAgIHRoaXMuZmlsZURvd25sb2FkU2VydmljZS5kb3dubG9hZChcbiAgICAgICAgICAgIGRvd25sb2FkTGluayxcbiAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgY29yZG92YS5maWxlLmV4dGVybmFsQXBwbGljYXRpb25TdG9yYWdlRGlyZWN0b3J5LFxuICAgICAgICAgICAgQVVUT19VUERBVEVfRklMRU5BTUUsXG4gICAgICAgICAgICBwcm9ncmVzc09ic2VydmVyKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGVPcGVuZXIub3BlbihhcGtGaWxlLCAnYXBwbGljYXRpb24vdm5kLmFuZHJvaWQucGFja2FnZS1hcmNoaXZlJyk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlID0gJ0ZhaWxlZCB0byBkb3dubG9hZCBsYXRlc3QgdmVyc2lvbi4nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IGBEb3dubG9hZGluZyB0aGUgbGF0ZXN0IHZlcnNpb24gWyR7dGhpcy5fYnVpbGRNZXRhLmxhdGVzdFZlcnNpb259XS5gO1xuICAgICAgICB0aGlzLmRvd25sb2FkaW5nID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrRm9yVXBkYXRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5odHRwLmdldChgJHt0aGlzLl9idWlsZE1ldGEuaG9zdH0vYXBwQnVpbGQvcmVzdC9tb2JpbGVCdWlsZHMvbGF0ZXN0X2J1aWxkP3Rva2VuPSR7dGhpcy5fYnVpbGRNZXRhLnRva2VufSZyZWxlYXNlVmVyc2lvbj0ke3RoaXMuX2J1aWxkTWV0YS5wbGF0Zm9ybVZlcnNpb259YClcbiAgICAgICAgICAgICAgICAudG9Qcm9taXNlKClcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXRlc3RCdWlsZE51bWJlciA9IHJlc3BvbnNlLnN1Y2Nlc3MuYm9keS5idWlsZE51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhdGVzdFZlcnNpb24gPSAgcmVzcG9uc2Uuc3VjY2Vzcy5ib2R5LnZlcnNpb247XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9idWlsZE1ldGEuYnVpbGROdW1iZXIgPCBsYXRlc3RCdWlsZE51bWJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRNZXRhLmxhdGVzdEJ1aWxkTnVtYmVyID0gbGF0ZXN0QnVpbGROdW1iZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9idWlsZE1ldGEubGF0ZXN0VmVyc2lvbiA9IGxhdGVzdFZlcnNpb247XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGxhdGVzdEJ1aWxkTnVtYmVyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRCdWlsZE1ldGEoKSB7XG4gICAgICAgIGlmICghdGhpcy5fYnVpbGRNZXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlLnJlYWRBc1RleHQoY29yZG92YS5maWxlLmFwcGxpY2F0aW9uRGlyZWN0b3J5ICsgJ3d3dy8nLCAnYnVpbGRfbWV0YS5qc29uJylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRNZXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2J1aWxkTWV0YTtcbiAgICAgICAgICAgICAgICB9LCBub29wKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2J1aWxkTWV0YSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRVc2VyQ29uZmlybWF0aW9uKCkge1xuICAgICAgICB0aGlzLmRvd25sb2FkUHJvZ3Jlc3MgPSAwO1xuICAgICAgICB0aGlzLmRvd25sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9ICdUaGVyZSBpcyBhbiB1cGRhdGUgYXZhaWxhYmxlLiBXb3VsZCB5b3UgbGlrZSB0byB1cGRhdGUgdGhlIGFwcD8nO1xuICAgICAgICByZW1vdmVDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdoaWRkZW4nKTtcbiAgICB9XG59XG4iXX0=