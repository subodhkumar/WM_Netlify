import { Component, Injector, SecurityContext } from '@angular/core';
import { encodeUrl, isInsecureContentRequest } from '@wm/core';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './iframe.props';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'embed-responsive app-iframe';
const WIDGET_CONFIG = {
    widgetType: 'wm-iframe',
    hostClass: DEFAULT_CLS
};
export class IframeComponent extends StylableComponent {
    constructor(inj, trustAsPipe) {
        super(inj, WIDGET_CONFIG);
        this.trustAsPipe = trustAsPipe;
        /**
         * this property member is set to true when the content request url doesn't match windows protocol
         */
        this.showContentLoadError = false;
        styler(this.nativeElement, this);
    }
    computeIframeSrc() {
        this.showContentLoadError = false;
        this._iframesrc = undefined;
        if (this.iframesrc) {
            let url = this.iframesrc;
            if (this.encodeurl) {
                url = encodeUrl(this.iframesrc);
            }
            const trustedUrl = this.trustAsPipe.transform(url, SecurityContext.RESOURCE_URL);
            if (isInsecureContentRequest(url)) {
                this.showContentLoadError = true;
                this.errorMsg = `${this.appLocale.MESSAGE_ERROR_CONTENT_DISPLAY} ${this.iframesrc}`;
                this.hintMsg = this.errorMsg;
            }
            this._iframesrc = trustedUrl;
        }
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'iframesrc' || key === 'encodeurl') {
            this.computeIframeSrc();
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
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
IframeComponent.ctorParameters = () => [
    { type: Injector },
    { type: TrustAsPipe }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWZyYW1lLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vaWZyYW1lL2lmcmFtZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3JFLE9BQU8sRUFBRSxTQUFTLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFL0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWhELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFakUsTUFBTSxXQUFXLEdBQUcsNkJBQTZCLENBQUM7QUFDbEQsTUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxXQUFXO0lBQ3ZCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUM7QUFTRixNQUFNLE9BQU8sZUFBZ0IsU0FBUSxpQkFBaUI7SUFpQmxELFlBQVksR0FBYSxFQUFVLFdBQXdCO1FBQ3ZELEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFESyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUwzRDs7V0FFRztRQUNJLHlCQUFvQixHQUFHLEtBQUssQ0FBQztRQUloQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRVMsZ0JBQWdCO1FBQ3RCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7UUFDbEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFFNUIsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2hCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDekIsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNoQixHQUFHLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNuQztZQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFakYsSUFBSSx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztnQkFFakMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsNkJBQTZCLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNwRixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztTQUNoQztJQUNMLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUc7UUFDekIsSUFBSSxHQUFHLEtBQUssV0FBVyxJQUFJLEdBQUcsS0FBSyxXQUFXLEVBQUU7WUFDNUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDM0I7YUFBTTtZQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQzs7QUFsRE0sK0JBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFSNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxZQUFZO2dCQUN0Qiw0ZEFBc0M7Z0JBQ3RDLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxlQUFlLENBQUM7aUJBQ3RDO2FBQ0o7Ozs7WUF4Qm1CLFFBQVE7WUFTbkIsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0b3IsIFNlY3VyaXR5Q29udGV4dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU2FmZVJlc291cmNlVXJsIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbmltcG9ydCB7IGVuY29kZVVybCwgaXNJbnNlY3VyZUNvbnRlbnRSZXF1ZXN0IH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9pZnJhbWUucHJvcHMnO1xuaW1wb3J0IHsgVHJ1c3RBc1BpcGUgfSBmcm9tICcuLi8uLi8uLi9waXBlcy90cnVzdC1hcy5waXBlJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2VtYmVkLXJlc3BvbnNpdmUgYXBwLWlmcmFtZSc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1pZnJhbWUnLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFNcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtSWZyYW1lXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2lmcmFtZS5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihJZnJhbWVDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBJZnJhbWVDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBpZnJhbWVzcmM6IHN0cmluZztcbiAgICBwdWJsaWMgZW5jb2RldXJsOiBib29sZWFuO1xuXG4gICAgcHVibGljIF9pZnJhbWVzcmM6IFNhZmVSZXNvdXJjZVVybDtcbiAgICBwcml2YXRlIGVycm9yTXNnOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBoaW50TXNnOiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgY2FwdGlvbjogYW55O1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogdGhpcyBwcm9wZXJ0eSBtZW1iZXIgaXMgc2V0IHRvIHRydWUgd2hlbiB0aGUgY29udGVudCByZXF1ZXN0IHVybCBkb2Vzbid0IG1hdGNoIHdpbmRvd3MgcHJvdG9jb2xcbiAgICAgKi9cbiAgICBwdWJsaWMgc2hvd0NvbnRlbnRMb2FkRXJyb3IgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIHByaXZhdGUgdHJ1c3RBc1BpcGU6IFRydXN0QXNQaXBlKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjb21wdXRlSWZyYW1lU3JjKCkge1xuICAgICAgICB0aGlzLnNob3dDb250ZW50TG9hZEVycm9yID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lmcmFtZXNyYyA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAodGhpcy5pZnJhbWVzcmMpIHtcbiAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLmlmcmFtZXNyYztcbiAgICAgICAgICAgIGlmICh0aGlzLmVuY29kZXVybCkge1xuICAgICAgICAgICAgICAgIHVybCA9IGVuY29kZVVybCh0aGlzLmlmcmFtZXNyYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHRydXN0ZWRVcmwgPSB0aGlzLnRydXN0QXNQaXBlLnRyYW5zZm9ybSh1cmwsIFNlY3VyaXR5Q29udGV4dC5SRVNPVVJDRV9VUkwpO1xuXG4gICAgICAgICAgICBpZiAoaXNJbnNlY3VyZUNvbnRlbnRSZXF1ZXN0KHVybCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDb250ZW50TG9hZEVycm9yID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JNc2cgPSBgJHt0aGlzLmFwcExvY2FsZS5NRVNTQUdFX0VSUk9SX0NPTlRFTlRfRElTUExBWX0gJHt0aGlzLmlmcmFtZXNyY31gO1xuICAgICAgICAgICAgICAgIHRoaXMuaGludE1zZyA9IHRoaXMuZXJyb3JNc2c7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2lmcmFtZXNyYyA9IHRydXN0ZWRVcmw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92Pykge1xuICAgICAgICBpZiAoa2V5ID09PSAnaWZyYW1lc3JjJyB8fCBrZXkgPT09ICdlbmNvZGV1cmwnKSB7XG4gICAgICAgICAgICB0aGlzLmNvbXB1dGVJZnJhbWVTcmMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19