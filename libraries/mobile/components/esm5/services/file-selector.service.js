import { Injectable } from '@angular/core';
import { Camera } from '@ionic-native/camera';
import { convertToBlob, isIphone } from '@wm/core';
import * as i0 from "@angular/core";
import * as i1 from "@ionic-native/camera";
var FileSelectorService = /** @class */ (function () {
    function FileSelectorService(camera) {
        this.camera = camera;
    }
    FileSelectorService.prototype.selectAudio = function (multiple) {
        var _this = this;
        if (multiple === void 0) { multiple = false; }
        return new Promise(function (resolve, reject) {
            // if multiple is true allows user to select multiple songs
            // if icloud is true will show iCloud songs
            (window['plugins']['mediapicker']).getAudio(resolve, reject, multiple, isIphone());
        }).then(function (files) {
            var filePaths = _.map(_.isArray(files) ? files : [files], 'exportedurl');
            return _this.getFiles(filePaths);
        });
    };
    FileSelectorService.prototype.setFileBrowser = function (f) {
        this.fileBrowserComponent = f;
    };
    FileSelectorService.prototype.selectFiles = function (multiple, fileTypeToSelect) {
        var _this = this;
        if (multiple === void 0) { multiple = false; }
        if (!this.fileBrowserComponent) {
            return Promise.reject('File Browser component is not present.');
        }
        this.fileBrowserComponent.multiple = multiple;
        this.fileBrowserComponent.fileTypeToSelect = fileTypeToSelect;
        this.fileBrowserComponent.show = true;
        return new Promise(function (resolve, reject) {
            var subscription = _this.fileBrowserComponent.submitEmitter.subscribe(function (result) {
                return _this.getFiles(_.map(result.files, 'path'))
                    .then(function (files) {
                    subscription.unsubscribe();
                    _this.fileBrowserComponent.show = false;
                    resolve(files);
                }, function () {
                    subscription.unsubscribe();
                    _this.fileBrowserComponent.show = false;
                    reject();
                });
            });
        });
    };
    FileSelectorService.prototype.selectImages = function (multiple) {
        var _this = this;
        if (multiple === void 0) { multiple = false; }
        var maxImg = multiple ? 10 : 1;
        return new Promise(function (resolve, reject) {
            window.imagePicker.getPictures(resolve, reject, {
                mediaType: 0,
                maxImages: maxImg
            });
        }).then(function (files) {
            var selectedFiles = files.map(function (filepath) {
                if (filepath.indexOf('://') < 0) {
                    return 'file://' + filepath;
                }
                return filepath;
            });
            return _this.getFiles(selectedFiles);
        });
    };
    FileSelectorService.prototype.selectVideos = function (multiple) {
        var _this = this;
        if (multiple === void 0) { multiple = false; }
        var cameraOptions = {
            destinationType: 1,
            sourceType: 0,
            mediaType: 1 // allows video selection
        };
        return this.camera.getPicture(cameraOptions)
            .then(function (filepath) {
            if (filepath.indexOf('://') < 0) {
                filepath = 'file://' + filepath;
            }
            return _this.getFiles([filepath]);
        });
    };
    /**
     * Converts the file to blob using filepath
     * @param filePaths, array of file paths
     * @returns fileObj having name, path, content
     */
    FileSelectorService.prototype.getFiles = function (filePaths) {
        return Promise.all(_.map(filePaths, function (filePath) { return convertToBlob(filePath); }))
            .then(function (filesList) {
            return _.map(filesList, function (fileObj) {
                var path = fileObj.filepath;
                return {
                    name: path.split('/').pop(),
                    path: path,
                    content: fileObj.blob,
                    size: fileObj.blob.size
                };
            });
        });
    };
    FileSelectorService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    FileSelectorService.ctorParameters = function () { return [
        { type: Camera }
    ]; };
    FileSelectorService.ngInjectableDef = i0.defineInjectable({ factory: function FileSelectorService_Factory() { return new FileSelectorService(i0.inject(i1.Camera)); }, token: FileSelectorService, providedIn: "root" });
    return FileSelectorService;
}());
export { FileSelectorService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zZWxlY3Rvci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsic2VydmljZXMvZmlsZS1zZWxlY3Rvci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRTlDLE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLE1BQU0sVUFBVSxDQUFDOzs7QUFZbkQ7SUFLSSw2QkFBMkIsTUFBYztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7SUFBRyxDQUFDO0lBRXRDLHlDQUFXLEdBQWxCLFVBQW1CLFFBQWdCO1FBQW5DLGlCQVNDO1FBVGtCLHlCQUFBLEVBQUEsZ0JBQWdCO1FBQy9CLE9BQU8sSUFBSSxPQUFPLENBQU0sVUFBQyxPQUFPLEVBQUUsTUFBTTtZQUNwQywyREFBMkQ7WUFDM0QsMkNBQTJDO1lBQzNDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkYsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsS0FBSztZQUNULElBQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzNFLE9BQU8sS0FBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSw0Q0FBYyxHQUFyQixVQUFzQixDQUF1QjtRQUN6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QUFFO2dCQUM3QixRQUFRLEdBQUcsU0FBUyxHQUFHLFFBQVEsQ0FBQzthQUNuQztZQUNELE9BQU8sS0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLHNDQUFRLEdBQWhCLFVBQWlCLFNBQW1CO1FBQ2hDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxVQUFBLFFBQVEsSUFBSSxPQUFBLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBdkIsQ0FBdUIsQ0FBQyxDQUFDO2FBQ3BFLElBQUksQ0FBQyxVQUFBLFNBQVM7WUFDWCxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFVBQUEsT0FBTztnQkFDM0IsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztnQkFDOUIsT0FBTztvQkFDSCxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUU7b0JBQzNCLElBQUksRUFBRSxJQUFJO29CQUNWLE9BQU8sRUFBRSxPQUFPLENBQUMsSUFBSTtvQkFDckIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSTtpQkFDMUIsQ0FBQztZQUNOLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDOztnQkFwR0osVUFBVSxTQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTs7OztnQkFkekIsTUFBTTs7OzhCQUZmO0NBcUhDLEFBckdELElBcUdDO1NBcEdZLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQ2FtZXJhIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9jYW1lcmEnO1xuXG5pbXBvcnQgeyBjb252ZXJ0VG9CbG9iLCBpc0lwaG9uZSB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IEZpbGVCcm93c2VyQ29tcG9uZW50IH0gZnJvbSAnLi4vd2lkZ2V0cy9maWxlLWJyb3dzZXIvZmlsZS1icm93c2VyLmNvbXBvbmVudCc7XG5cbmRlY2xhcmUgY29uc3QgXztcbmRlY2xhcmUgY29uc3Qgd2luZG93O1xuXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVDb250ZW50IHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgcGF0aDogc3RyaW5nO1xuICAgIGJsb2I6IGFueTtcbn1cblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBGaWxlU2VsZWN0b3JTZXJ2aWNlIHtcblxuICAgIHByaXZhdGUgZmlsZUJyb3dzZXJDb21wb25lbnQ6IEZpbGVCcm93c2VyQ29tcG9uZW50O1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHByaXZhdGUgY2FtZXJhOiBDYW1lcmEpIHt9XG5cbiAgICBwdWJsaWMgc2VsZWN0QXVkaW8obXVsdGlwbGUgPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIC8vIGlmIG11bHRpcGxlIGlzIHRydWUgYWxsb3dzIHVzZXIgdG8gc2VsZWN0IG11bHRpcGxlIHNvbmdzXG4gICAgICAgICAgICAvLyBpZiBpY2xvdWQgaXMgdHJ1ZSB3aWxsIHNob3cgaUNsb3VkIHNvbmdzXG4gICAgICAgICAgICAod2luZG93WydwbHVnaW5zJ11bJ21lZGlhcGlja2VyJ10pLmdldEF1ZGlvKHJlc29sdmUsIHJlamVjdCwgbXVsdGlwbGUsIGlzSXBob25lKCkpO1xuICAgICAgICB9KS50aGVuKGZpbGVzID0+ICB7XG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aHMgPSBfLm1hcChfLmlzQXJyYXkoZmlsZXMpID8gZmlsZXMgOiBbZmlsZXNdLCAnZXhwb3J0ZWR1cmwnKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbGVzKGZpbGVQYXRocyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRGaWxlQnJvd3NlcihmOiBGaWxlQnJvd3NlckNvbXBvbmVudCkge1xuICAgICAgICB0aGlzLmZpbGVCcm93c2VyQ29tcG9uZW50ID0gZjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2VsZWN0RmlsZXMobXVsdGlwbGUgPSBmYWxzZSwgZmlsZVR5cGVUb1NlbGVjdD86IHN0cmluZyk6IFByb21pc2U8RmlsZUNvbnRlbnRbXT4ge1xuICAgICAgICBpZiAoIXRoaXMuZmlsZUJyb3dzZXJDb21wb25lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnRmlsZSBCcm93c2VyIGNvbXBvbmVudCBpcyBub3QgcHJlc2VudC4nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpbGVCcm93c2VyQ29tcG9uZW50Lm11bHRpcGxlID0gbXVsdGlwbGU7XG4gICAgICAgIHRoaXMuZmlsZUJyb3dzZXJDb21wb25lbnQuZmlsZVR5cGVUb1NlbGVjdCA9IGZpbGVUeXBlVG9TZWxlY3Q7XG4gICAgICAgIHRoaXMuZmlsZUJyb3dzZXJDb21wb25lbnQuc2hvdyA9IHRydWU7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnlbXT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5maWxlQnJvd3NlckNvbXBvbmVudC5zdWJtaXRFbWl0dGVyLnN1YnNjcmliZShyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbGVzKF8ubWFwKHJlc3VsdC5maWxlcywgJ3BhdGgnKSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZmlsZXMgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbGVCcm93c2VyQ29tcG9uZW50LnNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmlsZXMpO1xuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmlsZUJyb3dzZXJDb21wb25lbnQuc2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZWxlY3RJbWFnZXMobXVsdGlwbGUgPSBmYWxzZSk6IFByb21pc2U8RmlsZUNvbnRlbnRbXT4ge1xuICAgICAgICBjb25zdCBtYXhJbWcgPSBtdWx0aXBsZSA/IDEwIDogMTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgd2luZG93LmltYWdlUGlja2VyLmdldFBpY3R1cmVzKHJlc29sdmUsIHJlamVjdCxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1lZGlhVHlwZSA6IDAsICAvLyBhbGxvd3MgcGljdHVyZSBzZWxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgbWF4SW1hZ2VzOiBtYXhJbWdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9KS50aGVuKGZpbGVzID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkRmlsZXMgPSBmaWxlcy5tYXAoZmlsZXBhdGggPT4ge1xuICAgICAgICAgICAgICAgIGlmIChmaWxlcGF0aC5pbmRleE9mKCc6Ly8nKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdmaWxlOi8vJyArIGZpbGVwYXRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsZXBhdGg7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbGVzKHNlbGVjdGVkRmlsZXMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2VsZWN0VmlkZW9zKG11bHRpcGxlID0gZmFsc2UpOiBQcm9taXNlPEZpbGVDb250ZW50W10+IHtcbiAgICAgICAgY29uc3QgY2FtZXJhT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uVHlwZSAgIDogMSwgIC8vIGZpbGVfdXJpXG4gICAgICAgICAgICBzb3VyY2VUeXBlICAgICAgICA6IDAsICAvLyBwaG90b2xpYnJhcnlcbiAgICAgICAgICAgIG1lZGlhVHlwZSAgICAgICAgIDogMSAgLy8gYWxsb3dzIHZpZGVvIHNlbGVjdGlvblxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLmNhbWVyYS5nZXRQaWN0dXJlKGNhbWVyYU9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihmaWxlcGF0aCA9PiB7XG4gICAgICAgICAgICBpZiAoZmlsZXBhdGguaW5kZXhPZignOi8vJykgPCAwKSB7XG4gICAgICAgICAgICAgICAgZmlsZXBhdGggPSAnZmlsZTovLycgKyBmaWxlcGF0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbGVzKFtmaWxlcGF0aF0pO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSBmaWxlIHRvIGJsb2IgdXNpbmcgZmlsZXBhdGhcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGhzLCBhcnJheSBvZiBmaWxlIHBhdGhzXG4gICAgICogQHJldHVybnMgZmlsZU9iaiBoYXZpbmcgbmFtZSwgcGF0aCwgY29udGVudFxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0RmlsZXMoZmlsZVBhdGhzOiBzdHJpbmdbXSk6IFByb21pc2U8RmlsZUNvbnRlbnRbXT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXy5tYXAoZmlsZVBhdGhzLCBmaWxlUGF0aCA9PiBjb252ZXJ0VG9CbG9iKGZpbGVQYXRoKSkpXG4gICAgICAgICAgICAudGhlbihmaWxlc0xpc3QgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLm1hcChmaWxlc0xpc3QsIGZpbGVPYmogPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoID0gZmlsZU9iai5maWxlcGF0aDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHBhdGguc3BsaXQoJy8nKS5wb3AoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBmaWxlT2JqLmJsb2IsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiBmaWxlT2JqLmJsb2Iuc2l6ZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuIl19