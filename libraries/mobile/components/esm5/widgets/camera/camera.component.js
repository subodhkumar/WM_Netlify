import * as tslib_1 from "tslib";
import { ChangeDetectorRef, Component, ElementRef, HostListener, Injector } from '@angular/core';
import { Camera } from '@ionic-native/camera';
import { MediaCapture } from '@ionic-native/media-capture';
import { APPLY_STYLES_TYPE, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { convertToBlob, hasCordova } from '@wm/core';
import { registerProps } from './camera.props';
var DEFAULT_CLS = 'btn app-camera';
var WIDGET_CONFIG = { widgetType: 'wm-camera', hostClass: DEFAULT_CLS };
export var CAPTURE_TYPE;
(function (CAPTURE_TYPE) {
    CAPTURE_TYPE["IMAGE"] = "IMAGE";
    CAPTURE_TYPE["PNG"] = "PNG";
})(CAPTURE_TYPE || (CAPTURE_TYPE = {}));
export var ENCODING_TYPE;
(function (ENCODING_TYPE) {
    ENCODING_TYPE["JPEG"] = "JPEG";
    ENCODING_TYPE["PNG"] = "PNG";
})(ENCODING_TYPE || (ENCODING_TYPE = {}));
var CameraComponent = /** @class */ (function (_super) {
    tslib_1.__extends(CameraComponent, _super);
    function CameraComponent(camera, mediaCapture, inj, elRef, cdr) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.camera = camera;
        _this.mediaCapture = mediaCapture;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        return _this;
    }
    CameraComponent.prototype.openCamera = function ($event) {
        var _this = this;
        if (hasCordova()) {
            if (this.capturetype === CAPTURE_TYPE.IMAGE) {
                this._cameraOptions = {
                    quality: this.imagequality,
                    destinationType: 1,
                    sourceType: 1,
                    allowEdit: this.allowedit,
                    correctOrientation: this.correctorientation,
                    encodingType: this.imageencodingtype === ENCODING_TYPE.JPEG ? 0 : 1,
                    saveToPhotoAlbum: this.savetogallery,
                    targetWidth: this.imagetargetwidth,
                    targetHeight: this.imagetargetheight
                };
                // start camera
                this.camera.getPicture(this._cameraOptions)
                    .then(function (path) { return _this.updateModel($event, path); });
            }
            else {
                this._cameraOptions = {
                    limit: 1
                };
                // start video capture
                this.mediaCapture.captureVideo(this._cameraOptions)
                    .then(function (mediaFiles) { return _this.updateModel($event, mediaFiles[0].fullPath); });
            }
        }
        else {
            this.invokeEventCallback('success', { $event: $event });
        }
    };
    CameraComponent.prototype.updateModel = function ($event, value) {
        var _this = this;
        this.localFilePath = this.datavalue = value;
        convertToBlob(value)
            .then(function (result) {
            _this.localFile = result.blob;
            _this.invokeEventCallback('success', { $event: $event, localFilePath: _this.localFilePath, localFile: _this.localFile });
        }, function () {
            _this.localFile = undefined;
        });
    };
    CameraComponent.initializeProps = registerProps();
    CameraComponent.decorators = [
        { type: Component, args: [{
                    selector: 'button[wmCamera]',
                    template: "<i [ngClass]=\"iconclass\" [ngStyle]=\"{'font-size': iconsize}\"></i>",
                    providers: [
                        provideAsWidgetRef(CameraComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    CameraComponent.ctorParameters = function () { return [
        { type: Camera },
        { type: MediaCapture },
        { type: Injector },
        { type: ElementRef },
        { type: ChangeDetectorRef }
    ]; };
    CameraComponent.propDecorators = {
        openCamera: [{ type: HostListener, args: ['click', ['$event'],] }]
    };
    return CameraComponent;
}(StylableComponent));
export { CameraComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FtZXJhLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY2FtZXJhL2NhbWVyYS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFakcsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUUzRCxPQUFPLEVBQUUsaUJBQWlCLEVBQWlCLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2pILE9BQU8sRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXJELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvQyxJQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQztBQUNyQyxJQUFNLGFBQWEsR0FBa0IsRUFBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQUV2RixNQUFNLENBQU4sSUFBWSxZQUdYO0FBSEQsV0FBWSxZQUFZO0lBQ3BCLCtCQUFlLENBQUE7SUFDZiwyQkFBVyxDQUFBO0FBQ2YsQ0FBQyxFQUhXLFlBQVksS0FBWixZQUFZLFFBR3ZCO0FBRUQsTUFBTSxDQUFOLElBQVksYUFHWDtBQUhELFdBQVksYUFBYTtJQUNyQiw4QkFBYSxDQUFBO0lBQ2IsNEJBQVcsQ0FBQTtBQUNmLENBQUMsRUFIVyxhQUFhLEtBQWIsYUFBYSxRQUd4QjtBQUVEO0lBT3FDLDJDQUFpQjtJQWtCbEQseUJBQW9CLE1BQWMsRUFBVSxZQUEwQixFQUFFLEdBQWEsRUFBRSxLQUFpQixFQUFFLEdB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LFFBQVE7Z0JBQWxDLFVBQVU7Z0JBQXhDLGlCQUFpQjs7OzZCQXFEckIsWUFBWSxTQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQzs7SUF5Q3JDLHNCQUFDO0NBQUEsQUF2RUQsQ0FPcUMsaUJBQWlCLEdBZ0VyRDtTQWhFWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSG9zdExpc3RlbmVyLCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBDYW1lcmEgfSBmcm9tICdAaW9uaWMtbmF0aXZlL2NhbWVyYSc7XG5pbXBvcnQgeyBNZWRpYUNhcHR1cmUgfSBmcm9tICdAaW9uaWMtbmF0aXZlL21lZGlhLWNhcHR1cmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgSVdpZGdldENvbmZpZywgcHJvdmlkZUFzV2lkZ2V0UmVmLCBTdHlsYWJsZUNvbXBvbmVudCwgc3R5bGVyIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuaW1wb3J0IHsgY29udmVydFRvQmxvYiwgaGFzQ29yZG92YSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vY2FtZXJhLnByb3BzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYnRuIGFwcC1jYW1lcmEnO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHt3aWRnZXRUeXBlOiAnd20tY2FtZXJhJywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbmV4cG9ydCBlbnVtIENBUFRVUkVfVFlQRSB7XG4gICAgSU1BR0UgPSAnSU1BR0UnLFxuICAgIFBORyA9ICdQTkcnXG59XG5cbmV4cG9ydCBlbnVtIEVOQ09ESU5HX1RZUEUge1xuICAgIEpQRUcgPSAnSlBFRycsXG4gICAgUE5HID0gJ1BORydcbn1cblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdidXR0b25bd21DYW1lcmFdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vY2FtZXJhLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKENhbWVyYUNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIENhbWVyYUNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuICAgIHB1YmxpYyBhbGxvd2VkaXQ6IGJvb2xlYW47XG4gICAgcHVibGljIGNvcnJlY3RvcmllbnRhdGlvbjogYm9vbGVhbjtcbiAgICBwdWJsaWMgY2FwdHVyZXR5cGU6IHN0cmluZztcbiAgICBwdWJsaWMgZGF0YXZhbHVlOiBzdHJpbmc7XG4gICAgcHVibGljIGltYWdlcXVhbGl0eTogbnVtYmVyO1xuICAgIHB1YmxpYyBpbWFnZWVuY29kaW5ndHlwZTogc3RyaW5nO1xuICAgIHB1YmxpYyBpbWFnZXRhcmdldHdpZHRoOiBudW1iZXI7XG4gICAgcHVibGljIGltYWdldGFyZ2V0aGVpZ2h0OiBudW1iZXI7XG4gICAgcHVibGljIGxvY2FsRmlsZTogYW55O1xuICAgIHB1YmxpYyBsb2NhbEZpbGVQYXRoOiBzdHJpbmc7XG4gICAgcHVibGljIHNhdmV0b2dhbGxlcnk6IGJvb2xlYW47XG4gICAgcHVibGljIGljb25zaXplOiBhbnk7XG4gICAgcHVibGljIGljb25jbGFzczogYW55O1xuXG4gICAgcHJpdmF0ZSBfY2FtZXJhT3B0aW9uczogYW55O1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBjYW1lcmE6IENhbWVyYSwgcHJpdmF0ZSBtZWRpYUNhcHR1cmU6IE1lZGlhQ2FwdHVyZSwgaW5qOiBJbmplY3RvciwgZWxSZWY6IEVsZW1lbnRSZWYsIGNkcjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuU0NST0xMQUJMRV9DT05UQUlORVIpO1xuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJywgWyckZXZlbnQnXSlcbiAgICBwdWJsaWMgb3BlbkNhbWVyYSgkZXZlbnQpIHtcbiAgICAgICAgaWYgKGhhc0NvcmRvdmEoKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2FwdHVyZXR5cGUgPT09IENBUFRVUkVfVFlQRS5JTUFHRSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbWVyYU9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHF1YWxpdHkgICAgICAgICAgIDogdGhpcy5pbWFnZXF1YWxpdHksXG4gICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uVHlwZSAgIDogMSwgLy8gMC1kYXRhIHVybCwxLSBmaWxlIHVybFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2VUeXBlICAgICAgICA6IDEsIC8vIG9ubHkgY2FtZXJhXG4gICAgICAgICAgICAgICAgICAgIGFsbG93RWRpdCAgICAgICAgIDogdGhpcy5hbGxvd2VkaXQsXG4gICAgICAgICAgICAgICAgICAgIGNvcnJlY3RPcmllbnRhdGlvbjogdGhpcy5jb3JyZWN0b3JpZW50YXRpb24sXG4gICAgICAgICAgICAgICAgICAgIGVuY29kaW5nVHlwZSAgICAgIDogdGhpcy5pbWFnZWVuY29kaW5ndHlwZSA9PT0gRU5DT0RJTkdfVFlQRS5KUEVHID8gMCA6IDEsXG4gICAgICAgICAgICAgICAgICAgIHNhdmVUb1Bob3RvQWxidW0gIDogdGhpcy5zYXZldG9nYWxsZXJ5LFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRXaWR0aCAgICAgICA6IHRoaXMuaW1hZ2V0YXJnZXR3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0SGVpZ2h0ICAgICAgOiB0aGlzLmltYWdldGFyZ2V0aGVpZ2h0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyBzdGFydCBjYW1lcmFcbiAgICAgICAgICAgICAgICB0aGlzLmNhbWVyYS5nZXRQaWN0dXJlKHRoaXMuX2NhbWVyYU9wdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHBhdGggPT4gdGhpcy51cGRhdGVNb2RlbCgkZXZlbnQsIHBhdGgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FtZXJhT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8vIHN0YXJ0IHZpZGVvIGNhcHR1cmVcbiAgICAgICAgICAgICAgICB0aGlzLm1lZGlhQ2FwdHVyZS5jYXB0dXJlVmlkZW8odGhpcy5fY2FtZXJhT3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4obWVkaWFGaWxlcyA9PiB0aGlzLnVwZGF0ZU1vZGVsKCRldmVudCwgbWVkaWFGaWxlc1swXS5mdWxsUGF0aCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzdWNjZXNzJywgeyRldmVudH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVNb2RlbCgkZXZlbnQsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMubG9jYWxGaWxlUGF0aCA9IHRoaXMuZGF0YXZhbHVlID0gdmFsdWU7XG4gICAgICAgIGNvbnZlcnRUb0Jsb2IodmFsdWUpXG4gICAgICAgICAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxGaWxlID0gcmVzdWx0LmJsb2I7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzdWNjZXNzJywgeyRldmVudCwgbG9jYWxGaWxlUGF0aDogdGhpcy5sb2NhbEZpbGVQYXRoLCBsb2NhbEZpbGU6IHRoaXMubG9jYWxGaWxlfSk7XG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbEZpbGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=