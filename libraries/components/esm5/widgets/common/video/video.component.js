import * as tslib_1 from "tslib";
import { Component, Injector, SecurityContext } from '@angular/core';
import { appendNode, createElement, removeNode } from '@wm/core';
import { styler } from '../../framework/styler';
import { DISPLAY_TYPE } from '../../framework/constants';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './video.props';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-video';
var WIDGET_CONFIG = {
    widgetType: 'wm-video',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};
var VideoComponent = /** @class */ (function (_super) {
    tslib_1.__extends(VideoComponent, _super);
    function VideoComponent(inj, trustAsPipe) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.trustAsPipe = trustAsPipe;
        /**
         * subtitle language property eg: en
         */
        _this.subtitlelang = 'en';
        styler(_this.nativeElement, _this);
        return _this;
    }
    // DO NOT use ngIf binding for the track. As of v6.0.Beta7 there is an error creating a void track node
    VideoComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'subtitlesource') {
            var track = this.nativeElement.querySelector('track');
            if (track) {
                removeNode(track, true);
            }
            track = createElement('track', {
                kind: 'subtitles',
                label: this.subtitlelang,
                srclang: this.subtitlelang,
                src: this.trustAsPipe.transform(nv, SecurityContext.RESOURCE_URL),
                default: ''
            }, true);
            appendNode(track, this.nativeElement.querySelector('video'));
        }
        _super.prototype.onPropertyChange.call(this, key, nv, ov);
    };
    VideoComponent.initializeProps = registerProps();
    VideoComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmVideo]',
                    template: "<video [preload]=\"videopreload\" role=\"application\"\n       [src]=\"mp4format | trustAs: 'resource'\"\n       [muted]=\"muted\"\n       [poster]=\"videoposter | image\"\n       [controls]=\"controls\"\n       [loop]=\"loop\"\n       [autoplay]=\"autoplay\">\n    <source type=\"video/mp4\" [src]=\"mp4format | trustAs: 'resource'\" *ngIf=\"mp4format\">\n    <source type=\"video/webm\" [src]=\"webmformat | trustAs: 'resource'\" *ngIf=\"webmformat\">\n    <source type=\"video/ogg\" [src]=\"oggformat | trustAs: 'resource'\" *ngIf=\"oggformat\">\n    {{videosupportmessage}}\n</video>",
                    providers: [
                        provideAsWidgetRef(VideoComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    VideoComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: TrustAsPipe }
    ]; };
    return VideoComponent;
}(StylableComponent));
export { VideoComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlkZW8uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi92aWRlby92aWRlby5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVyRSxPQUFPLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFakUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUVqRSxJQUFNLFdBQVcsR0FBRyxXQUFXLENBQUM7QUFDaEMsSUFBTSxhQUFhLEdBQUc7SUFDbEIsVUFBVSxFQUFFLFVBQVU7SUFDdEIsU0FBUyxFQUFFLFdBQVc7SUFDdEIsV0FBVyxFQUFFLFlBQVksQ0FBQyxZQUFZO0NBQ3pDLENBQUM7QUFFRjtJQU9vQywwQ0FBaUI7SUFpQmpELHdCQUFZLEdBQWEsRUFBVSxXQUF3QjtRQUEzRCxZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FFNUI7UUFIa0MsaUJBQVcsR0FBWCxXQUFXLENBQWE7UUFmM0Q7O1dBRUc7UUFDSSxrQkFBWSxHQUFHLElBQUksQ0FBQztRQWN2QixNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLENBQUMsQ0FBQzs7SUFDckMsQ0FBQztJQUVELHVHQUF1RztJQUN2Ryx5Q0FBZ0IsR0FBaEIsVUFBaUIsR0FBVyxFQUFFLEVBQU8sRUFBRSxFQUFRO1FBQzNDLElBQUksR0FBRyxLQUFLLGdCQUFnQixFQUFFO1lBQzFCLElBQUksS0FBSyxHQUFnQixJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuRSxJQUFJLEtBQUssRUFBRTtnQkFDUCxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQzNCO1lBRUQsS0FBSyxHQUFHLGFBQWEsQ0FBQyxPQUFPLEVBQUU7Z0JBQzNCLElBQUksRUFBRSxXQUFXO2dCQUNqQixLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVk7Z0JBQ3hCLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWTtnQkFDMUIsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxlQUFlLENBQUMsWUFBWSxDQUFDO2dCQUNqRSxPQUFPLEVBQUUsRUFBRTthQUNkLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFVCxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDaEU7UUFFRCxpQkFBTSxnQkFBZ0IsWUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUF6Q00sOEJBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsV0FBVztvQkFDckIsdWxCQUFxQztvQkFDckMsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLGNBQWMsQ0FBQztxQkFDckM7aUJBQ0o7Ozs7Z0JBeEJtQixRQUFRO2dCQVFuQixXQUFXOztJQTREcEIscUJBQUM7Q0FBQSxBQWxERCxDQU9vQyxpQkFBaUIsR0EyQ3BEO1NBM0NZLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEluamVjdG9yLCBTZWN1cml0eUNvbnRleHQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgYXBwZW5kTm9kZSwgY3JlYXRlRWxlbWVudCwgcmVtb3ZlTm9kZSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBESVNQTEFZX1RZUEUgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvY29uc3RhbnRzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vdmlkZW8ucHJvcHMnO1xuaW1wb3J0IHsgVHJ1c3RBc1BpcGUgfSBmcm9tICcuLi8uLi8uLi9waXBlcy90cnVzdC1hcy5waXBlJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC12aWRlbyc7XG5jb25zdCBXSURHRVRfQ09ORklHID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS12aWRlbycsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMUyxcbiAgICBkaXNwbGF5VHlwZTogRElTUExBWV9UWVBFLklOTElORV9CTE9DS1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21WaWRlb10nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi92aWRlby5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihWaWRlb0NvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFZpZGVvQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG4gICAgLyoqXG4gICAgICogc3VidGl0bGUgbGFuZ3VhZ2UgcHJvcGVydHkgZWc6IGVuXG4gICAgICovXG4gICAgcHVibGljIHN1YnRpdGxlbGFuZyA9ICdlbic7XG4gICAgcHVibGljIHZpZGVvcHJlbG9hZDogYW55O1xuICAgIHB1YmxpYyBtcDRmb3JtYXQ6IHN0cmluZztcbiAgICBwdWJsaWMgbXV0ZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIHZpZGVvcG9zdGVyOiBhbnk7XG4gICAgcHVibGljIGNvbnRyb2xzOiBib29sZWFuO1xuICAgIHB1YmxpYyBsb29wOiBib29sZWFuO1xuICAgIHB1YmxpYyBhdXRvcGxheTogYm9vbGVhbjtcbiAgICBwdWJsaWMgd2VibWZvcm1hdDogc3RyaW5nO1xuICAgIHB1YmxpYyBvZ2dmb3JtYXQ6IHN0cmluZztcbiAgICBwdWJsaWMgdmlkZW9zdXBwb3J0bWVzc2FnZTogYW55O1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3RvciwgcHJpdmF0ZSB0cnVzdEFzUGlwZTogVHJ1c3RBc1BpcGUpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgLy8gRE8gTk9UIHVzZSBuZ0lmIGJpbmRpbmcgZm9yIHRoZSB0cmFjay4gQXMgb2YgdjYuMC5CZXRhNyB0aGVyZSBpcyBhbiBlcnJvciBjcmVhdGluZyBhIHZvaWQgdHJhY2sgbm9kZVxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdzdWJ0aXRsZXNvdXJjZScpIHtcbiAgICAgICAgICAgIGxldCB0cmFjazogSFRNTEVsZW1lbnQgPSB0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcigndHJhY2snKTtcbiAgICAgICAgICAgIGlmICh0cmFjaykge1xuICAgICAgICAgICAgICAgIHJlbW92ZU5vZGUodHJhY2ssIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cmFjayA9IGNyZWF0ZUVsZW1lbnQoJ3RyYWNrJywge1xuICAgICAgICAgICAgICAgIGtpbmQ6ICdzdWJ0aXRsZXMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnN1YnRpdGxlbGFuZyxcbiAgICAgICAgICAgICAgICBzcmNsYW5nOiB0aGlzLnN1YnRpdGxlbGFuZyxcbiAgICAgICAgICAgICAgICBzcmM6IHRoaXMudHJ1c3RBc1BpcGUudHJhbnNmb3JtKG52LCBTZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGFwcGVuZE5vZGUodHJhY2ssIHRoaXMubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCd2aWRlbycpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgIH1cbn1cbiJdfQ==