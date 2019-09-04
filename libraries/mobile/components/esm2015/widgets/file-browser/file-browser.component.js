import { Component, EventEmitter, Input, Output } from '@angular/core';
import { $appDigest, isIos } from '@wm/core';
import { DeviceService } from '@wm/mobile/core';
export class FileBrowserComponent {
    constructor(deviceService) {
        this.deviceService = deviceService;
        this.selectedFiles = [];
        this.submitEmitter = new EventEmitter();
    }
    getFileExtension(fileName) {
        const extIndex = fileName ? fileName.lastIndexOf('.') : -1;
        if (extIndex > 0) {
            return fileName.substring(extIndex + 1);
        }
        return '';
    }
    ngOnDestroy() {
        if (this.backButtonListenerDeregister) {
            this.backButtonListenerDeregister();
        }
    }
    onFileClick(file) {
        if (file.isFile) {
            if (file.isSelected) {
                this.deselectFile(file);
            }
            else {
                this.selectFile(file);
            }
        }
        else {
            this.goToFolder(file);
        }
    }
    set show(flag) {
        let rootDir = cordova.file.externalRootDirectory;
        this.isVisible = flag;
        if (flag) {
            if (!this.currentFolder) {
                if (isIos()) {
                    rootDir = cordova.file.documentsDirectory;
                }
                resolveLocalFileSystemURL(rootDir, root => this.goToFolder(root));
            }
            this.backButtonListenerDeregister = this.deviceService.onBackButtonTap(() => {
                if (this.isVisible) {
                    if (this.currentFolder.parent) {
                        this.onFileClick(this.currentFolder.parent);
                    }
                    else {
                        this.isVisible = false;
                    }
                    $appDigest();
                    return false;
                }
            });
        }
        else if (this.backButtonListenerDeregister) {
            this.backButtonListenerDeregister();
        }
    }
    submit() {
        const files = [];
        this.loadFileSize(this.selectedFiles).then(() => {
            _.forEach(this.selectedFiles, function (f) {
                f.isSelected = false;
                files.push({ path: f.nativeURL,
                    name: f.name,
                    size: f.size });
            });
            this.selectedFiles = [];
            this.isVisible = false;
            this.submitEmitter.next({ files: files });
        });
    }
    deselectFile(file) {
        _.remove(this.selectedFiles, file);
        file.isSelected = false;
    }
    goToFolder(folder) {
        if (!folder.files) {
            this.loadFolder(folder, this.fileTypeToSelect)
                .then(files => {
                folder.files = files;
                folder.parent = this.currentFolder;
                this.currentFolder = folder;
            });
        }
        else {
            this.currentFolder = folder;
        }
    }
    loadFileSize(files) {
        return Promise.all(files.map(f => {
            return new Promise((resolve, reject) => {
                f.file(o => {
                    f.size = o.size;
                    resolve();
                }, reject);
            });
        }));
    }
    loadFolder(folder, fileTypeToSelect) {
        return new Promise((resolve, reject) => {
            let fileTypeToShow;
            folder.createReader().readEntries((entries) => {
                if (!_.isEmpty(fileTypeToSelect)) {
                    fileTypeToShow = _.split(fileTypeToSelect, ',');
                    entries = _.filter(entries, e => {
                        return !e.isFile || _.findIndex(fileTypeToShow, ext => _.endsWith(e.name, '.' + ext)) >= 0;
                    });
                }
                resolve(_.sortBy(entries, e => (e.isFile ? '1_' : '0_') + e.name.toLowerCase()));
            }, reject);
        });
    }
    refreshFolder() {
        return this.loadFolder(this.currentFolder, this.fileTypeToSelect)
            .then(files => this.currentFolder.files = files);
    }
    selectFile(file) {
        if (!this.multiple && this.selectedFiles.length > 0) {
            this.selectedFiles[0].isSelected = false;
            this.selectedFiles = [];
        }
        this.selectedFiles.push(file);
        file.isSelected = true;
    }
}
FileBrowserComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmMobileFileBrowser]',
                template: "<div class=\"app-file-browser\" *ngIf=\"isVisible && currentFolder\">\n    <div class=\"modal-backdrop fade\" [class.in]=\"isVisible\"></div>\n    <div class=\"modal fade\" style=\"display: block;\" [class.in]=\"isVisible\" >\n        <div class=\"modal-dialog\">\n            <div class=\"modal-content\">\n                <div class=\"modal-header clearfix\">\n                    <h4 class=\"modal-title pull-left\">\n                        <span (click)=\"onFileClick(currentFolder.parent)\" [hidden]=\"!!!currentFolder.parent\">\n                            <i class=\"wi wi-long-arrow-left\"></i>\n                        </span>\n                     {{currentFolder.name}}\n                    </h4>\n                    <div class=\"selected-file-button pull-right\" (click)=\"refreshFolder()\">\n                        <i class=\"wi wi-refresh\"></i>\n                    </div>\n                </div>\n                <div class=\"modal-body\">\n                    <div class=\"file-info-box\" *ngFor=\"let file of currentFolder.files\">\n                        <div class=\"file-info\"  [class.bg-primary]=\"file.isSelected\" (click)=\"onFileClick(file)\">\n                            <i class=\"file-icon wi wi-folder\" *ngIf=\"!file.isFile\"></i>\n                            <i class=\"file-icon wi wi-file {{getFileExtension(file.name)}}\" *ngIf=\"file.isFile\"></i>\n                            <span class=\"file-name\">{{file.name}}</span>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"modal-footer\">\n                    <button type=\"button\" class=\"btn btn-primary\" *ngIf=\"selectedFiles && selectedFiles.length > 0\" (click)=\"submit()\">\n                        Done <span class=\"badge badge-light\">{{selectedFiles.length}}</span>\n                    </button>\n                    <button type=\"button\" class=\"btn btn-default\" (click)=\"show = false;\">Close</button>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>"
            }] }
];
/** @nocollapse */
FileBrowserComponent.ctorParameters = () => [
    { type: DeviceService }
];
FileBrowserComponent.propDecorators = {
    fileTypeToSelect: [{ type: Input }],
    multiple: [{ type: Input }],
    submitEmitter: [{ type: Output, args: ['submit',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1icm93c2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvZmlsZS1icm93c2VyL2ZpbGUtYnJvd3Nlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFhLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVsRixPQUFPLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUM3QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUF3QmhELE1BQU0sT0FBTyxvQkFBb0I7SUFXN0IsWUFBb0IsYUFBNEI7UUFBNUIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFOekMsa0JBQWEsR0FBVyxFQUFFLENBQUM7UUFDaEIsa0JBQWEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO0lBS0YsQ0FBQztJQUc3QyxnQkFBZ0IsQ0FBQyxRQUFnQjtRQUNwQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNELElBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtZQUNkLE9BQU8sUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDM0M7UUFDRCxPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFTSxXQUFXO1FBQ2QsSUFBSSxJQUFJLENBQUMsNEJBQTRCLEVBQUU7WUFDbkMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRU0sV0FBVyxDQUFDLElBQUk7UUFDbkIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFF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dkJRLGFBQWE7OzsrQkEyQmpCLEtBQUs7dUJBQ0wsS0FBSzs0QkFFTCxNQUFNLFNBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT25EZXN0cm95LCBPdXRwdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgaXNJb3MgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBEZXZpY2VTZXJ2aWNlIH0gZnJvbSAnQHdtL21vYmlsZS9jb3JlJztcblxuZGVjbGFyZSBjb25zdCBfO1xuZGVjbGFyZSBjb25zdCBjb3Jkb3ZhO1xuZGVjbGFyZSBjb25zdCByZXNvbHZlTG9jYWxGaWxlU3lzdGVtVVJMO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZpbGUge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBzaXplOiBudW1iZXI7XG4gICAgaXNTZWxlY3RlZDogYm9vbGVhbjtcbiAgICBmaWxlOiAoc3VjY2VzczogKG5hdnRpdmVGaWxlT2JqZWN0OiBhbnkpID0+IHZvaWQsIGZhaWx1cmU6IChtZXNzYWdlOiBhbnkpID0+IGFueSkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGb2xkZXIge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBmaWxlczogRmlsZVtdO1xuICAgIGZvbGRlcnM6IEZvbGRlcltdO1xuICAgIHBhcmVudDogRm9sZGVyO1xufVxuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bU1vYmlsZUZpbGVCcm93c2VyXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ZpbGUtYnJvd3Nlci5jb21wb25lbnQuaHRtbCdcbn0pXG5leHBvcnQgY2xhc3MgRmlsZUJyb3dzZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuXG4gICAgcHVibGljIGN1cnJlbnRGb2xkZXI6IEZvbGRlcjtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsZVR5cGVUb1NlbGVjdDogc3RyaW5nO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtdWx0aXBsZTogYm9vbGVhbjtcbiAgICBwdWJsaWMgc2VsZWN0ZWRGaWxlczogRmlsZVtdID0gW107XG4gICAgQE91dHB1dCgnc3VibWl0Jykgc3VibWl0RW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBwdWJsaWMgaXNWaXNpYmxlOiBib29sZWFuO1xuXG4gICAgcHJpdmF0ZSBiYWNrQnV0dG9uTGlzdGVuZXJEZXJlZ2lzdGVyOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRldmljZVNlcnZpY2U6IERldmljZVNlcnZpY2UpIHt9XG5cblxuICAgIHB1YmxpYyBnZXRGaWxlRXh0ZW5zaW9uKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBleHRJbmRleCA9IGZpbGVOYW1lID8gZmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKSA6IC0xO1xuICAgICAgICBpZiAoZXh0SW5kZXggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsZU5hbWUuc3Vic3RyaW5nKGV4dEluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYmFja0J1dHRvbkxpc3RlbmVyRGVyZWdpc3Rlcikge1xuICAgICAgICAgICAgdGhpcy5iYWNrQnV0dG9uTGlzdGVuZXJEZXJlZ2lzdGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb25GaWxlQ2xpY2soZmlsZSk6IHZvaWQge1xuICAgICAgICBpZiAoZmlsZS5pc0ZpbGUpIHtcbiAgICAgICAgICAgIGlmIChmaWxlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0RmlsZShmaWxlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RGaWxlKGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nb1RvRm9sZGVyKGZpbGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBzaG93KGZsYWc6IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IHJvb3REaXIgPSBjb3Jkb3ZhLmZpbGUuZXh0ZXJuYWxSb290RGlyZWN0b3J5O1xuICAgICAgICB0aGlzLmlzVmlzaWJsZSA9IGZsYWc7XG4gICAgICAgIGlmIChmbGFnKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY3VycmVudEZvbGRlcikge1xuICAgICAgICAgICAgICAgIGlmIChpc0lvcygpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJvb3REaXIgPSBjb3Jkb3ZhLmZpbGUuZG9jdW1lbnRzRGlyZWN0b3J5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlTG9jYWxGaWxlU3lzdGVtVVJMKHJvb3REaXIsIHJvb3QgPT4gdGhpcy5nb1RvRm9sZGVyKHJvb3QpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYmFja0J1dHRvbkxpc3RlbmVyRGVyZWdpc3RlciA9IHRoaXMuZGV2aWNlU2VydmljZS5vbkJhY2tCdXR0b25UYXAoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzVmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50Rm9sZGVyLnBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkZpbGVDbGljayh0aGlzLmN1cnJlbnRGb2xkZXIucGFyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5iYWNrQnV0dG9uTGlzdGVuZXJEZXJlZ2lzdGVyKSB7XG4gICAgICAgICAgICB0aGlzLmJhY2tCdXR0b25MaXN0ZW5lckRlcmVnaXN0ZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdWJtaXQoKSB7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gW107XG4gICAgICAgIHRoaXMubG9hZEZpbGVTaXplKHRoaXMuc2VsZWN0ZWRGaWxlcykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBfLmZvckVhY2godGhpcy5zZWxlY3RlZEZpbGVzLCBmdW5jdGlvbiAoZikge1xuICAgICAgICAgICAgICAgIGYuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goeyBwYXRoOiBmLm5hdGl2ZVVSTCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogZi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBzaXplIDogZi5zaXplfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGaWxlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5pc1Zpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc3VibWl0RW1pdHRlci5uZXh0KHtmaWxlczogZmlsZXN9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkZXNlbGVjdEZpbGUoZmlsZTogRmlsZSk6IHZvaWQge1xuICAgICAgICBfLnJlbW92ZSh0aGlzLnNlbGVjdGVkRmlsZXMsIGZpbGUpO1xuICAgICAgICBmaWxlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdvVG9Gb2xkZXIoZm9sZGVyOiBGb2xkZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKCFmb2xkZXIuZmlsZXMpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEZvbGRlcihmb2xkZXIsIHRoaXMuZmlsZVR5cGVUb1NlbGVjdClcbiAgICAgICAgICAgICAgICAudGhlbihmaWxlcyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZvbGRlci5maWxlcyA9IGZpbGVzO1xuICAgICAgICAgICAgICAgICAgICBmb2xkZXIucGFyZW50ID0gdGhpcy5jdXJyZW50Rm9sZGVyO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRGb2xkZXIgPSBmb2xkZXI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRGb2xkZXIgPSBmb2xkZXI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRGaWxlU2l6ZShmaWxlczogRmlsZVtdKTogUHJvbWlzZTx2b2lkW10+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGZpbGVzLm1hcChmID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgZi5maWxlKG8gPT4ge1xuICAgICAgICAgICAgICAgICAgICBmLnNpemUgPSBvLnNpemU7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRGb2xkZXIoZm9sZGVyOiBhbnksIGZpbGVUeXBlVG9TZWxlY3Q6IHN0cmluZyk6IFByb21pc2U8RmlsZVtdPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgZmlsZVR5cGVUb1Nob3c7XG4gICAgICAgICAgICBmb2xkZXIuY3JlYXRlUmVhZGVyKCkucmVhZEVudHJpZXMoKGVudHJpZXM6ICBGaWxlW10pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNFbXB0eShmaWxlVHlwZVRvU2VsZWN0KSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlVHlwZVRvU2hvdyA9IF8uc3BsaXQoZmlsZVR5cGVUb1NlbGVjdCwgJywnKTtcbiAgICAgICAgICAgICAgICAgICAgZW50cmllcyA9IF8uZmlsdGVyKGVudHJpZXMsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFlLmlzRmlsZSB8fCBfLmZpbmRJbmRleChmaWxlVHlwZVRvU2hvdywgZXh0ID0+IF8uZW5kc1dpdGgoZS5uYW1lLCAnLicgKyBleHQpKSA+PSAwO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShfLnNvcnRCeShlbnRyaWVzLCBlID0+IChlLmlzRmlsZSA/ICcxXycgOiAnMF8nKSArIGUubmFtZS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgcmVmcmVzaEZvbGRlcigpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2FkRm9sZGVyKHRoaXMuY3VycmVudEZvbGRlciwgdGhpcy5maWxlVHlwZVRvU2VsZWN0KVxuICAgICAgICAgICAgLnRoZW4oZmlsZXMgPT4gdGhpcy5jdXJyZW50Rm9sZGVyLmZpbGVzID0gZmlsZXMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VsZWN0RmlsZShmaWxlKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5tdWx0aXBsZSAmJiB0aGlzLnNlbGVjdGVkRmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEZpbGVzWzBdLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGaWxlcyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRGaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICBmaWxlLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgIH1cbn1cbiJdfQ==