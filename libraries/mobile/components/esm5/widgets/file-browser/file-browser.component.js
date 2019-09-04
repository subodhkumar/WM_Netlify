import { Component, EventEmitter, Input, Output } from '@angular/core';
import { $appDigest, isIos } from '@wm/core';
import { DeviceService } from '@wm/mobile/core';
var FileBrowserComponent = /** @class */ (function () {
    function FileBrowserComponent(deviceService) {
        this.deviceService = deviceService;
        this.selectedFiles = [];
        this.submitEmitter = new EventEmitter();
    }
    FileBrowserComponent.prototype.getFileExtension = function (fileName) {
        var extIndex = fileName ? fileName.lastIndexOf('.') : -1;
        if (extIndex > 0) {
            return fileName.substring(extIndex + 1);
        }
        return '';
    };
    FileBrowserComponent.prototype.ngOnDestroy = function () {
        if (this.backButtonListenerDeregister) {
            this.backButtonListenerDeregister();
        }
    };
    FileBrowserComponent.prototype.onFileClick = function (file) {
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
    };
    Object.defineProperty(FileBrowserComponent.prototype, "show", {
        set: function (flag) {
            var _this = this;
            var rootDir = cordova.file.externalRootDirectory;
            this.isVisible = flag;
            if (flag) {
                if (!this.currentFolder) {
                    if (isIos()) {
                        rootDir = cordova.file.documentsDirectory;
                    }
                    resolveLocalFileSystemURL(rootDir, function (root) { return _this.goToFolder(root); });
                }
                this.backButtonListenerDeregister = this.deviceService.onBackButtonTap(function () {
                    if (_this.isVisible) {
                        if (_this.currentFolder.parent) {
                            _this.onFileClick(_this.currentFolder.parent);
                        }
                        else {
                            _this.isVisible = false;
                        }
                        $appDigest();
                        return false;
                    }
                });
            }
            else if (this.backButtonListenerDeregister) {
                this.backButtonListenerDeregister();
            }
        },
        enumerable: true,
        configurable: true
    });
    FileBrowserComponent.prototype.submit = function () {
        var _this = this;
        var files = [];
        this.loadFileSize(this.selectedFiles).then(function () {
            _.forEach(_this.selectedFiles, function (f) {
                f.isSelected = false;
                files.push({ path: f.nativeURL,
                    name: f.name,
                    size: f.size });
            });
            _this.selectedFiles = [];
            _this.isVisible = false;
            _this.submitEmitter.next({ files: files });
        });
    };
    FileBrowserComponent.prototype.deselectFile = function (file) {
        _.remove(this.selectedFiles, file);
        file.isSelected = false;
    };
    FileBrowserComponent.prototype.goToFolder = function (folder) {
        var _this = this;
        if (!folder.files) {
            this.loadFolder(folder, this.fileTypeToSelect)
                .then(function (files) {
                folder.files = files;
                folder.parent = _this.currentFolder;
                _this.currentFolder = folder;
            });
        }
        else {
            this.currentFolder = folder;
        }
    };
    FileBrowserComponent.prototype.loadFileSize = function (files) {
        return Promise.all(files.map(function (f) {
            return new Promise(function (resolve, reject) {
                f.file(function (o) {
                    f.size = o.size;
                    resolve();
                }, reject);
            });
        }));
    };
    FileBrowserComponent.prototype.loadFolder = function (folder, fileTypeToSelect) {
        return new Promise(function (resolve, reject) {
            var fileTypeToShow;
            folder.createReader().readEntries(function (entries) {
                if (!_.isEmpty(fileTypeToSelect)) {
                    fileTypeToShow = _.split(fileTypeToSelect, ',');
                    entries = _.filter(entries, function (e) {
                        return !e.isFile || _.findIndex(fileTypeToShow, function (ext) { return _.endsWith(e.name, '.' + ext); }) >= 0;
                    });
                }
                resolve(_.sortBy(entries, function (e) { return (e.isFile ? '1_' : '0_') + e.name.toLowerCase(); }));
            }, reject);
        });
    };
    FileBrowserComponent.prototype.refreshFolder = function () {
        var _this = this;
        return this.loadFolder(this.currentFolder, this.fileTypeToSelect)
            .then(function (files) { return _this.currentFolder.files = files; });
    };
    FileBrowserComponent.prototype.selectFile = function (file) {
        if (!this.multiple && this.selectedFiles.length > 0) {
            this.selectedFiles[0].isSelected = false;
            this.selectedFiles = [];
        }
        this.selectedFiles.push(file);
        file.isSelected = true;
    };
    FileBrowserComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmMobileFileBrowser]',
                    template: "<div class=\"app-file-browser\" *ngIf=\"isVisible && currentFolder\">\n    <div class=\"modal-backdrop fade\" [class.in]=\"isVisible\"></div>\n    <div class=\"modal fade\" style=\"display: block;\" [class.in]=\"isVisible\" >\n        <div class=\"modal-dialog\">\n            <div class=\"modal-content\">\n                <div class=\"modal-header clearfix\">\n                    <h4 class=\"modal-title pull-left\">\n                        <span (click)=\"onFileClick(currentFolder.parent)\" [hidden]=\"!!!currentFolder.parent\">\n                            <i class=\"wi wi-long-arrow-left\"></i>\n                        </span>\n                     {{currentFolder.name}}\n                    </h4>\n                    <div class=\"selected-file-button pull-right\" (click)=\"refreshFolder()\">\n                        <i class=\"wi wi-refresh\"></i>\n                    </div>\n                </div>\n                <div class=\"modal-body\">\n                    <div class=\"file-info-box\" *ngFor=\"let file of currentFolder.files\">\n                        <div class=\"file-info\"  [class.bg-primary]=\"file.isSelected\" (click)=\"onFileClick(file)\">\n                            <i class=\"file-icon wi wi-folder\" *ngIf=\"!file.isFile\"></i>\n                            <i class=\"file-icon wi wi-file {{getFileExtension(file.name)}}\" *ngIf=\"file.isFile\"></i>\n                            <span class=\"file-name\">{{file.name}}</span>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"modal-footer\">\n                    <button type=\"button\" class=\"btn btn-primary\" *ngIf=\"selectedFiles && selectedFiles.length > 0\" (click)=\"submit()\">\n                        Done <span class=\"badge badge-light\">{{selectedFiles.length}}</span>\n                    </button>\n                    <button type=\"button\" class=\"btn btn-default\" (click)=\"show = false;\">Close</button>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>"
                }] }
    ];
    /** @nocollapse */
    FileBrowserComponent.ctorParameters = function () { return [
        { type: DeviceService }
    ]; };
    FileBrowserComponent.propDecorators = {
        fileTypeToSelect: [{ type: Input }],
        multiple: [{ type: Input }],
        submitEmitter: [{ type: Output, args: ['submit',] }]
    };
    return FileBrowserComponent;
}());
export { FileBrowserComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1icm93c2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvZmlsZS1icm93c2VyL2ZpbGUtYnJvd3Nlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFhLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVsRixPQUFPLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUM3QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFvQmhEO0lBZUksOEJBQW9CLGFBQTRCO1FBQTVCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBTnpDLGtCQUFhLEdBQVcsRUFBRSxDQUFDO1FBQ2hCLGtCQUFhLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUtGLENBQUM7SUFHN0MsK0NBQWdCLEdBQXZCLFVBQXdCLFFBQWdCO1FBQ3BDLElBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0QsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFO1lBQ2QsT0FBTyxRQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUMzQztRQUNELE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVNLDBDQUFXLEdBQWxCO1FBQ0ksSUFBSSxJQUFJLENBQUMsNEJBQTRCLEVBQUU7WUFDbkMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRU0sMENBQVcsR0FBbEIsVUFBbUIsSUFBSTtRQUNuQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDYixJQUFJLElBQUksQ0FBQyxVQUFV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QUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDM0IsQ0FBQzs7Z0JBOUlKLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsdUJBQXVCO29CQUNqQyxzaEVBQTRDO2lCQUMvQzs7OztnQkF2QlEsYUFBYTs7O21DQTJCakIsS0FBSzsyQkFDTCxLQUFLO2dDQUVMLE1BQU0sU0FBQyxRQUFROztJQXFJcEIsMkJBQUM7Q0FBQSxBQS9JRCxJQStJQztTQTNJWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE9uRGVzdHJveSwgT3V0cHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7ICRhcHBEaWdlc3QsIGlzSW9zIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgRGV2aWNlU2VydmljZSB9IGZyb20gJ0B3bS9tb2JpbGUvY29yZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcbmRlY2xhcmUgY29uc3QgY29yZG92YTtcbmRlY2xhcmUgY29uc3QgcmVzb2x2ZUxvY2FsRmlsZVN5c3RlbVVSTDtcblxuZXhwb3J0IGludGVyZmFjZSBGaWxlIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgc2l6ZTogbnVtYmVyO1xuICAgIGlzU2VsZWN0ZWQ6IGJvb2xlYW47XG4gICAgZmlsZTogKHN1Y2Nlc3M6IChuYXZ0aXZlRmlsZU9iamVjdDogYW55KSA9PiB2b2lkLCBmYWlsdXJlOiAobWVzc2FnZTogYW55KSA9PiBhbnkpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRm9sZGVyIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZmlsZXM6IEZpbGVbXTtcbiAgICBmb2xkZXJzOiBGb2xkZXJbXTtcbiAgICBwYXJlbnQ6IEZvbGRlcjtcbn1cblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21Nb2JpbGVGaWxlQnJvd3Nlcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9maWxlLWJyb3dzZXIuY29tcG9uZW50Lmh0bWwnXG59KVxuZXhwb3J0IGNsYXNzIEZpbGVCcm93c2VyQ29tcG9uZW50IGltcGxlbWVudHMgT25EZXN0cm95IHtcblxuICAgIHB1YmxpYyBjdXJyZW50Rm9sZGVyOiBGb2xkZXI7XG4gICAgQElucHV0KCkgcHVibGljIGZpbGVUeXBlVG9TZWxlY3Q6IHN0cmluZztcbiAgICBASW5wdXQoKSBwdWJsaWMgbXVsdGlwbGU6IGJvb2xlYW47XG4gICAgcHVibGljIHNlbGVjdGVkRmlsZXM6IEZpbGVbXSA9IFtdO1xuICAgIEBPdXRwdXQoJ3N1Ym1pdCcpIHN1Ym1pdEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgcHVibGljIGlzVmlzaWJsZTogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgYmFja0J1dHRvbkxpc3RlbmVyRGVyZWdpc3RlcjogYW55O1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBkZXZpY2VTZXJ2aWNlOiBEZXZpY2VTZXJ2aWNlKSB7fVxuXG5cbiAgICBwdWJsaWMgZ2V0RmlsZUV4dGVuc2lvbihmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgZXh0SW5kZXggPSBmaWxlTmFtZSA/IGZpbGVOYW1lLmxhc3RJbmRleE9mKCcuJykgOiAtMTtcbiAgICAgICAgaWYgKGV4dEluZGV4ID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGVOYW1lLnN1YnN0cmluZyhleHRJbmRleCArIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIGlmICh0aGlzLmJhY2tCdXR0b25MaXN0ZW5lckRlcmVnaXN0ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuYmFja0J1dHRvbkxpc3RlbmVyRGVyZWdpc3RlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG9uRmlsZUNsaWNrKGZpbGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKGZpbGUuaXNGaWxlKSB7XG4gICAgICAgICAgICBpZiAoZmlsZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdEZpbGUoZmlsZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0RmlsZShmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ29Ub0ZvbGRlcihmaWxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgc2hvdyhmbGFnOiBib29sZWFuKSB7XG4gICAgICAgIGxldCByb290RGlyID0gY29yZG92YS5maWxlLmV4dGVybmFsUm9vdERpcmVjdG9yeTtcbiAgICAgICAgdGhpcy5pc1Zpc2libGUgPSBmbGFnO1xuICAgICAgICBpZiAoZmxhZykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRGb2xkZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNJb3MoKSkge1xuICAgICAgICAgICAgICAgICAgICByb290RGlyID0gY29yZG92YS5maWxlLmRvY3VtZW50c0RpcmVjdG9yeTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZUxvY2FsRmlsZVN5c3RlbVVSTChyb290RGlyLCByb290ID0+IHRoaXMuZ29Ub0ZvbGRlcihyb290KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJhY2tCdXR0b25MaXN0ZW5lckRlcmVnaXN0ZXIgPSB0aGlzLmRldmljZVNlcnZpY2Uub25CYWNrQnV0dG9uVGFwKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1Zpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEZvbGRlci5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25GaWxlQ2xpY2sodGhpcy5jdXJyZW50Rm9sZGVyLnBhcmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYmFja0J1dHRvbkxpc3RlbmVyRGVyZWdpc3Rlcikge1xuICAgICAgICAgICAgdGhpcy5iYWNrQnV0dG9uTGlzdGVuZXJEZXJlZ2lzdGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3VibWl0KCkge1xuICAgICAgICBjb25zdCBmaWxlcyA9IFtdO1xuICAgICAgICB0aGlzLmxvYWRGaWxlU2l6ZSh0aGlzLnNlbGVjdGVkRmlsZXMpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuc2VsZWN0ZWRGaWxlcywgZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgICAgICAgICBmLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKHsgcGF0aDogZi5uYXRpdmVVUkwsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGYubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgc2l6ZSA6IGYuc2l6ZX0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuaXNWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnN1Ym1pdEVtaXR0ZXIubmV4dCh7ZmlsZXM6IGZpbGVzfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGVzZWxlY3RGaWxlKGZpbGU6IEZpbGUpOiB2b2lkIHtcbiAgICAgICAgXy5yZW1vdmUodGhpcy5zZWxlY3RlZEZpbGVzLCBmaWxlKTtcbiAgICAgICAgZmlsZS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnb1RvRm9sZGVyKGZvbGRlcjogRm9sZGVyKTogdm9pZCB7XG4gICAgICAgIGlmICghZm9sZGVyLmZpbGVzKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRGb2xkZXIoZm9sZGVyLCB0aGlzLmZpbGVUeXBlVG9TZWxlY3QpXG4gICAgICAgICAgICAgICAgLnRoZW4oZmlsZXMgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmb2xkZXIuZmlsZXMgPSBmaWxlcztcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyLnBhcmVudCA9IHRoaXMuY3VycmVudEZvbGRlcjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Rm9sZGVyID0gZm9sZGVyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50Rm9sZGVyID0gZm9sZGVyO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2FkRmlsZVNpemUoZmlsZXM6IEZpbGVbXSk6IFByb21pc2U8dm9pZFtdPiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChmaWxlcy5tYXAoZiA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGYuZmlsZShvID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZi5zaXplID0gby5zaXplO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2FkRm9sZGVyKGZvbGRlcjogYW55LCBmaWxlVHlwZVRvU2VsZWN0OiBzdHJpbmcpOiBQcm9taXNlPEZpbGVbXT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbGVUeXBlVG9TaG93O1xuICAgICAgICAgICAgZm9sZGVyLmNyZWF0ZVJlYWRlcigpLnJlYWRFbnRyaWVzKChlbnRyaWVzOiAgRmlsZVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFfLmlzRW1wdHkoZmlsZVR5cGVUb1NlbGVjdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVR5cGVUb1Nob3cgPSBfLnNwbGl0KGZpbGVUeXBlVG9TZWxlY3QsICcsJyk7XG4gICAgICAgICAgICAgICAgICAgIGVudHJpZXMgPSBfLmZpbHRlcihlbnRyaWVzLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhZS5pc0ZpbGUgfHwgXy5maW5kSW5kZXgoZmlsZVR5cGVUb1Nob3csIGV4dCA9PiBfLmVuZHNXaXRoKGUubmFtZSwgJy4nICsgZXh0KSkgPj0gMDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc29sdmUoXy5zb3J0QnkoZW50cmllcywgZSA9PiAoZS5pc0ZpbGUgPyAnMV8nIDogJzBfJykgKyBlLm5hbWUudG9Mb3dlckNhc2UoKSkpO1xuICAgICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIHJlZnJlc2hGb2xkZXIoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9hZEZvbGRlcih0aGlzLmN1cnJlbnRGb2xkZXIsIHRoaXMuZmlsZVR5cGVUb1NlbGVjdClcbiAgICAgICAgICAgIC50aGVuKGZpbGVzID0+IHRoaXMuY3VycmVudEZvbGRlci5maWxlcyA9IGZpbGVzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbGVjdEZpbGUoZmlsZSk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMubXVsdGlwbGUgJiYgdGhpcy5zZWxlY3RlZEZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGaWxlc1swXS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgZmlsZS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICB9XG59XG4iXX0=