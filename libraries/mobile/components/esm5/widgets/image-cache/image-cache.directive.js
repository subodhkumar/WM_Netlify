import { Directive, Inject, Input, Self } from '@angular/core';
import { WidgetRef } from '@wm/components';
import { hasCordova, noop } from '@wm/core';
import { DeviceFileCacheService } from '@wm/mobile/core';
var DEFAULT_IMAGE = 'resources/images/imagelists/default-image.png';
var ImageCacheDirective = /** @class */ (function () {
    function ImageCacheDirective(componentInstance, deviceFileCacheService) {
        this.componentInstance = componentInstance;
        this.deviceFileCacheService = deviceFileCacheService;
        this._isEnabled = false;
        this._lastUrl = '';
    }
    ImageCacheDirective.prototype.ngDoCheck = function () {
        var _this = this;
        if (this._isEnabled && this.componentInstance.imgSource && this.componentInstance.imgSource.startsWith('http')) {
            if (this._lastUrl !== this.componentInstance.imgSource) {
                this._lastUrl = this.componentInstance.imgSource;
                this.componentInstance.imgSource = DEFAULT_IMAGE;
                this.getLocalPath(this._lastUrl).then(function (localPath) {
                    _this._cacheUrl = localPath;
                    _this.componentInstance.imgSource = _this._cacheUrl;
                });
            }
            else if (this._cacheUrl) {
                this.componentInstance.imgSource = this._cacheUrl;
            }
        }
    };
    Object.defineProperty(ImageCacheDirective.prototype, "wmImageCache", {
        set: function (val) {
            this._isEnabled = (hasCordova() && val === 'true');
        },
        enumerable: true,
        configurable: true
    });
    ImageCacheDirective.prototype.getLocalPath = function (val) {
        if (hasCordova() && val && val.indexOf('{{') < 0 && val.startsWith('http')) {
            return this.deviceFileCacheService.getLocalPath(val, true, true)
                .catch(noop);
        }
        return Promise.resolve(val);
    };
    ImageCacheDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmImageCache]'
                },] }
    ];
    /** @nocollapse */
    ImageCacheDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] },
        { type: DeviceFileCacheService }
    ]; };
    ImageCacheDirective.propDecorators = {
        wmImageCache: [{ type: Input }]
    };
    return ImageCacheDirective;
}());
export { ImageCacheDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UtY2FjaGUuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9pbWFnZS1jYWNoZS9pbWFnZS1jYWNoZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBVyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV4RSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDNUMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFekQsSUFBTSxhQUFhLEdBQUksK0NBQStDLENBQUM7QUFFdkU7SUFTSSw2QkFDdUMsaUJBQWlCLEVBQzVDLHNCQUE4QztRQURuQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQUE7UUFDNUMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtRQUxsRCxlQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ25CLGFBQVEsR0FBRyxFQUFFLENBQUM7SUFLbkIsQ0FBQztJQUVHLHVDQUFTLEdBQWhCO1FBQUEsaUJBYUM7UUFaRyxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM1RyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRTtnQkFDcEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDO2dCQUNqRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxHQUFHLGFBQWEsQ0FBQztnQkFDakQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsU0FBUztvQkFDNUMsS0FBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7b0JBQzNCLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEdBQUcsS0FBSSxDQUFDLFNBQVMsQ0FBQztnQkFDdEQsQ0FBQyxDQUFDLENBQUM7YUFDTjtpQkFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQzthQUNyRDtTQUNKO0lBQ0wsQ0FBQztJQUVELHNCQUNJLDZDQUFZO2FBRGhCLFVBQ2lCLEdBQVc7WUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLEdBQUcsS0FBSyxNQUFNLENBQUMsQ0FBQztRQUN2RCxDQUFDOzs7T0FBQTtJQUVPLDBDQUFZLEdBQXBCLFVBQXFCLEdBQVc7UUFDNUIsSUFBSSxVQUFVLEVBQUUsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUssR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6RSxPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7aUJBQzNELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNwQjtRQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoQyxDQUFDOztnQkF4Q0osU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxnQkFBZ0I7aUJBQzdCOzs7O2dEQVFRLElBQUksWUFBSSxNQUFNLFNBQUMsU0FBUztnQkFkeEIsc0JBQXNCOzs7K0JBaUMxQixLQUFLOztJQVlWLDBCQUFDO0NBQUEsQUF6Q0QsSUF5Q0M7U0F0Q1ksbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBEb0NoZWNrLCBJbmplY3QsIElucHV0LCBTZWxmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFdpZGdldFJlZiB9IGZyb20gJ0B3bS9jb21wb25lbnRzJztcbmltcG9ydCB7IGhhc0NvcmRvdmEsIG5vb3AgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBEZXZpY2VGaWxlQ2FjaGVTZXJ2aWNlIH0gZnJvbSAnQHdtL21vYmlsZS9jb3JlJztcblxuY29uc3QgREVGQVVMVF9JTUFHRSA9ICAncmVzb3VyY2VzL2ltYWdlcy9pbWFnZWxpc3RzL2RlZmF1bHQtaW1hZ2UucG5nJztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21JbWFnZUNhY2hlXSdcbn0pXG5leHBvcnQgY2xhc3MgSW1hZ2VDYWNoZURpcmVjdGl2ZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuXG4gICAgcHJpdmF0ZSBfY2FjaGVVcmw7XG4gICAgcHJpdmF0ZSBfaXNFbmFibGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfbGFzdFVybCA9ICcnO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIEBTZWxmKCkgQEluamVjdChXaWRnZXRSZWYpIHByaXZhdGUgY29tcG9uZW50SW5zdGFuY2UsXG4gICAgICAgIHByaXZhdGUgZGV2aWNlRmlsZUNhY2hlU2VydmljZTogRGV2aWNlRmlsZUNhY2hlU2VydmljZVxuICAgICkge31cblxuICAgIHB1YmxpYyBuZ0RvQ2hlY2soKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0VuYWJsZWQgJiYgdGhpcy5jb21wb25lbnRJbnN0YW5jZS5pbWdTb3VyY2UgJiYgdGhpcy5jb21wb25lbnRJbnN0YW5jZS5pbWdTb3VyY2Uuc3RhcnRzV2l0aCgnaHR0cCcpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbGFzdFVybCAhPT0gdGhpcy5jb21wb25lbnRJbnN0YW5jZS5pbWdTb3VyY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXN0VXJsID0gdGhpcy5jb21wb25lbnRJbnN0YW5jZS5pbWdTb3VyY2U7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnRJbnN0YW5jZS5pbWdTb3VyY2UgPSBERUZBVUxUX0lNQUdFO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0TG9jYWxQYXRoKHRoaXMuX2xhc3RVcmwpLnRoZW4oKGxvY2FsUGF0aCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZVVybCA9IGxvY2FsUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnRJbnN0YW5jZS5pbWdTb3VyY2UgPSB0aGlzLl9jYWNoZVVybDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fY2FjaGVVcmwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudEluc3RhbmNlLmltZ1NvdXJjZSA9IHRoaXMuX2NhY2hlVXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBzZXQgd21JbWFnZUNhY2hlKHZhbDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2lzRW5hYmxlZCA9IChoYXNDb3Jkb3ZhKCkgJiYgdmFsID09PSAndHJ1ZScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TG9jYWxQYXRoKHZhbDogc3RyaW5nKSB7XG4gICAgICAgIGlmIChoYXNDb3Jkb3ZhKCkgJiYgdmFsICYmIHZhbC5pbmRleE9mKCd7eycpIDwgMCAgJiYgdmFsLnN0YXJ0c1dpdGgoJ2h0dHAnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlRmlsZUNhY2hlU2VydmljZS5nZXRMb2NhbFBhdGgodmFsLCB0cnVlLCB0cnVlKVxuICAgICAgICAgICAgICAgIC5jYXRjaChub29wKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbCk7XG4gICAgfVxufVxuIl19