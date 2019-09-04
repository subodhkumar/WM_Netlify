import * as tslib_1 from "tslib";
import { Component, Injector, SecurityContext } from '@angular/core';
import { encodeUrl, isInsecureContentRequest } from '@wm/core';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './iframe.props';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'embed-responsive app-iframe';
var WIDGET_CONFIG = {
    widgetType: 'wm-iframe',
    hostClass: DEFAULT_CLS
};
var IframeComponent = /** @class */ (function (_super) {
    tslib_1.__extends(IframeComponent, _super);
    function IframeComponent(inj, trustAsPipe) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.trustAsPipe = trustAsPipe;
        /**
         * this property member is set to true when the content request url doesn't match windows protocol
         */
        _this.showContentLoadError = false;
        styler(_this.nativeElement, _this);
        return _this;
    }
    IframeComponent.prototype.computeIframeSrc = function () {
        this.showContentLoadError = false;
        this._iframesrc = undefined;
        if (this.iframesrc) {
            var url = this.iframesrc;
            if (this.encodeurl) {
                url = encodeUrl(this.iframesrc);
            }
            var trustedUrl = this.trustAsPipe.transform(url, SecurityContext.RESOURCE_URL);
            if (isInsecureContentRequest(url)) {
                this.showContentLoadError = true;
                this.errorMsg = this.appLocale.MESSAGE_ERROR_CONTENT_DISPLAY + " " + this.iframesrc;
                this.hintMsg = this.errorMsg;
            }
            this._iframesrc = trustedUrl;
        }
    };
    IframeComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'iframesrc' || key === 'encodeurl') {
            this.computeIframeSrc();
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    IframeComponent.initializeProps = registerProps();
    IframeComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmIframe]',
                    template: "<iframe title=\"\" class=\"embed-responsive-item iframe-content\" role=\"document\"\n        scrolling=\"auto\"\n        marginheight=\"0\"\n        marginwidth=\"0\"\n        frameborder=\"0\"\n        [name]=\"name\"\n        [attr.src]=\"_iframesrc\"\n        seamless=\"seamless\">\n</iframe>\n<div class=\"wm-content-info readonly-wrapper\" *ngIf=\"showContentLoadError\">\n    <p class=\"wm-message\" [title]=\"hintMsg\" [textContent]=\"errMsg\"></p>\n</div>",
                    providers: [
                        provideAsWidgetRef(IframeComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    IframeComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: TrustAsPipe }
    ]; };
    return IframeComponent;
}(StylableComponent));
export { IframeComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWZyYW1lLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vaWZyYW1lL2lmcmFtZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUdyRSxPQUFPLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRS9ELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVoRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzNELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRWpFLElBQU0sV0FBVyxHQUFHLDZCQUE2QixDQUFDO0FBQ2xELElBQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsV0FBVztJQUN2QixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFDO0FBRUY7SUFPcUMsMkNBQWlCO0lBaUJsRCx5QkFBWSxHQUFhLEVBQVUsV0FBd0I7UUFBM0QsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBRTVCO1FBSGtDLGlCQUFXLEdBQVgsV0FBVyxDQUFhO1FBTDNEOztXQUVHO1FBQ0ksMEJBQW9CLEdBQUcsS0FBSyxDQUFDO1FBSWhDLE1BQU0sQ0FBQyxLQUFJLENBQUMsYUFBYSxFQUFFLEtBQUksQ0FBQyxDQUFDOztJQUNyQyxDQUFDO0lBRVMsMENBQWdCLEdBQTFCO1FBQ0ksSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztRQUNsQyxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUU1QixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDaEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUN6QixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ2hCLEdBQUcsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ25DO1lBRUQsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVqRixJQUFJLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMvQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO2dCQUVqQyxJQUFJLENBQUMsUUFBUSxHQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsNkJBQTZCLFNBQUksSUFBSSxDQUFDLFNBQVcsQ0FBQztnQkFDcEYsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7U0FDaEM7SUFDTCxDQUFDO0lBRUQsMENBQWdCLEdBQWhCLFVBQWlCLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRztRQUN6QixJQUFJLEdBQUcsS0FBSyxXQUFXLElBQUksR0FBRyxLQUFLLFdBQVcsRUFBRTtZQUM1QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUMzQjthQUFNO1lBQ0gsaUJBQU0sZ0JBQWdCLFlBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN2QztJQUNMLENBQUM7SUFsRE0sK0JBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsWUFBWTtvQkFDdEIsNGRBQXNDO29CQUN0QyxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsZUFBZSxDQUFDO3FCQUN0QztpQkFDSjs7OztnQkF4Qm1CLFFBQVE7Z0JBU25CLFdBQVc7O0lBb0VwQixzQkFBQztDQUFBLEFBM0RELENBT3FDLGlCQUFpQixHQW9EckQ7U0FwRFksZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0b3IsIFNlY3VyaXR5Q29udGV4dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU2FmZVJlc291cmNlVXJsIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbmltcG9ydCB7IGVuY29kZVVybCwgaXNJbnNlY3VyZUNvbnRlbnRSZXF1ZXN0IH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9pZnJhbWUucHJvcHMnO1xuaW1wb3J0IHsgVHJ1c3RBc1BpcGUgfSBmcm9tICcuLi8uLi8uLi9waXBlcy90cnVzdC1hcy5waXBlJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2VtYmVkLXJlc3BvbnNpdmUgYXBwLWlmcmFtZSc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1pZnJhbWUnLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFNcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtSWZyYW1lXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2lmcmFtZS5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihJZnJhbWVDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBJZnJhbWVDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBpZnJhbWVzcmM6IHN0cmluZztcbiAgICBwdWJsaWMgZW5jb2RldXJsOiBib29sZWFuO1xuXG4gICAgcHVibGljIF9pZnJhbWVzcmM6IFNhZmVSZXNvdXJjZVVybDtcbiAgICBwcml2YXRlIGVycm9yTXNnOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBoaW50TXNnOiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgY2FwdGlvbjogYW55O1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogdGhpcyBwcm9wZXJ0eSBtZW1iZXIgaXMgc2V0IHRvIHRydWUgd2hlbiB0aGUgY29udGVudCByZXF1ZXN0IHVybCBkb2Vzbid0IG1hdGNoIHdpbmRvd3MgcHJvdG9jb2xcbiAgICAgKi9cbiAgICBwdWJsaWMgc2hvd0NvbnRlbnRMb2FkRXJyb3IgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIHByaXZhdGUgdHJ1c3RBc1BpcGU6IFRydXN0QXNQaXBlKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjb21wdXRlSWZyYW1lU3JjKCkge1xuICAgICAgICB0aGlzLnNob3dDb250ZW50TG9hZEVycm9yID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lmcmFtZXNyYyA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAodGhpcy5pZnJhbWVzcmMpIHtcbiAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLmlmcmFtZXNyYztcbiAgICAgICAgICAgIGlmICh0aGlzLmVuY29kZXVybCkge1xuICAgICAgICAgICAgICAgIHVybCA9IGVuY29kZVVybCh0aGlzLmlmcmFtZXNyYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHRydXN0ZWRVcmwgPSB0aGlzLnRydXN0QXNQaXBlLnRyYW5zZm9ybSh1cmwsIFNlY3VyaXR5Q29udGV4dC5SRVNPVVJDRV9VUkwpO1xuXG4gICAgICAgICAgICBpZiAoaXNJbnNlY3VyZUNvbnRlbnRSZXF1ZXN0KHVybCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDb250ZW50TG9hZEVycm9yID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JNc2cgPSBgJHt0aGlzLmFwcExvY2FsZS5NRVNTQUdFX0VSUk9SX0NPTlRFTlRfRElTUExBWX0gJHt0aGlzLmlmcmFtZXNyY31gO1xuICAgICAgICAgICAgICAgIHRoaXMuaGludE1zZyA9IHRoaXMuZXJyb3JNc2c7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2lmcmFtZXNyYyA9IHRydXN0ZWRVcmw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92Pykge1xuICAgICAgICBpZiAoa2V5ID09PSAnaWZyYW1lc3JjJyB8fCBrZXkgPT09ICdlbmNvZGV1cmwnKSB7XG4gICAgICAgICAgICB0aGlzLmNvbXB1dGVJZnJhbWVTcmMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19