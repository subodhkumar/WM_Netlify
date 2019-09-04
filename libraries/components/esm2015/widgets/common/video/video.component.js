import { Component, Injector, SecurityContext } from '@angular/core';
import { appendNode, createElement, removeNode } from '@wm/core';
import { styler } from '../../framework/styler';
import { DISPLAY_TYPE } from '../../framework/constants';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './video.props';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'app-video';
const WIDGET_CONFIG = {
    widgetType: 'wm-video',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};
export class VideoComponent extends StylableComponent {
    constructor(inj, trustAsPipe) {
        super(inj, WIDGET_CONFIG);
        this.trustAsPipe = trustAsPipe;
        /**
         * subtitle language property eg: en
         */
        this.subtitlelang = 'en';
        styler(this.nativeElement, this);
    }
    // DO NOT use ngIf binding for the track. As of v6.0.Beta7 there is an error creating a void track node
    onPropertyChange(key, nv, ov) {
        if (key === 'subtitlesource') {
            let track = this.nativeElement.querySelector('track');
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
        super.onPropertyChange(key, nv, ov);
    }
}
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
VideoComponent.ctorParameters = () => [
    { type: Injector },
    { type: TrustAsPipe }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlkZW8uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi92aWRlby92aWRlby5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXJFLE9BQU8sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVqRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDOUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzNELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRWpFLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQztBQUNoQyxNQUFNLGFBQWEsR0FBRztJQUNsQixVQUFVLEVBQUUsVUFBVTtJQUN0QixTQUFTLEVBQUUsV0FBVztJQUN0QixXQUFXLEVBQUUsWUFBWSxDQUFDLFlBQVk7Q0FDekMsQ0FBQztBQVNGLE1BQU0sT0FBTyxjQUFlLFNBQVEsaUJBQWlCO0lBaUJqRCxZQUFZLEdBQWEsRUFBVSxXQUF3QjtRQUN2RCxLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBREssZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFmM0Q7O1dBRUc7UUFDSSxpQkFBWSxHQUFHLElBQUksQ0FBQztRQWN2QixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsdUdBQXVHO0lBQ3ZHLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxFQUFPLEVBQUUsRUFBUTtRQUMzQyxJQUFJLEdBQUcsS0FBSyxnQkFBZ0IsRUFBRTtZQUMxQixJQUFJLEtBQUssR0FBZ0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkUsSUFBSSxLQUFLLEVBQUU7Z0JBQ1AsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzthQUMzQjtZQUVELEtBQUssR0FBRyxhQUFhLENBQUMsT0FBTyxFQUFFO2dCQUMzQixJQUFJLEVBQUUsV0FBVztnQkFDakIsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZO2dCQUN4QixPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7Z0JBQzFCLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsZUFBZSxDQUFDLFlBQVksQ0FBQztnQkFDakUsT0FBTyxFQUFFLEVBQUU7YUFDZCxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRVQsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2hFO1FBRUQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDeEMsQ0FBQzs7QUF6Q00sOEJBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFSNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxXQUFXO2dCQUNyQix1bEJBQXFDO2dCQUNyQyxTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsY0FBYyxDQUFDO2lCQUNyQzthQUNKOzs7O1lBeEJtQixRQUFRO1lBUW5CLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEluamVjdG9yLCBTZWN1cml0eUNvbnRleHQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgYXBwZW5kTm9kZSwgY3JlYXRlRWxlbWVudCwgcmVtb3ZlTm9kZSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBESVNQTEFZX1RZUEUgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvY29uc3RhbnRzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vdmlkZW8ucHJvcHMnO1xuaW1wb3J0IHsgVHJ1c3RBc1BpcGUgfSBmcm9tICcuLi8uLi8uLi9waXBlcy90cnVzdC1hcy5waXBlJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC12aWRlbyc7XG5jb25zdCBXSURHRVRfQ09ORklHID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS12aWRlbycsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMUyxcbiAgICBkaXNwbGF5VHlwZTogRElTUExBWV9UWVBFLklOTElORV9CTE9DS1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21WaWRlb10nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi92aWRlby5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihWaWRlb0NvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFZpZGVvQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG4gICAgLyoqXG4gICAgICogc3VidGl0bGUgbGFuZ3VhZ2UgcHJvcGVydHkgZWc6IGVuXG4gICAgICovXG4gICAgcHVibGljIHN1YnRpdGxlbGFuZyA9ICdlbic7XG4gICAgcHVibGljIHZpZGVvcHJlbG9hZDogYW55O1xuICAgIHB1YmxpYyBtcDRmb3JtYXQ6IHN0cmluZztcbiAgICBwdWJsaWMgbXV0ZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIHZpZGVvcG9zdGVyOiBhbnk7XG4gICAgcHVibGljIGNvbnRyb2xzOiBib29sZWFuO1xuICAgIHB1YmxpYyBsb29wOiBib29sZWFuO1xuICAgIHB1YmxpYyBhdXRvcGxheTogYm9vbGVhbjtcbiAgICBwdWJsaWMgd2VibWZvcm1hdDogc3RyaW5nO1xuICAgIHB1YmxpYyBvZ2dmb3JtYXQ6IHN0cmluZztcbiAgICBwdWJsaWMgdmlkZW9zdXBwb3J0bWVzc2FnZTogYW55O1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3RvciwgcHJpdmF0ZSB0cnVzdEFzUGlwZTogVHJ1c3RBc1BpcGUpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgLy8gRE8gTk9UIHVzZSBuZ0lmIGJpbmRpbmcgZm9yIHRoZSB0cmFjay4gQXMgb2YgdjYuMC5CZXRhNyB0aGVyZSBpcyBhbiBlcnJvciBjcmVhdGluZyBhIHZvaWQgdHJhY2sgbm9kZVxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdzdWJ0aXRsZXNvdXJjZScpIHtcbiAgICAgICAgICAgIGxldCB0cmFjazogSFRNTEVsZW1lbnQgPSB0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcigndHJhY2snKTtcbiAgICAgICAgICAgIGlmICh0cmFjaykge1xuICAgICAgICAgICAgICAgIHJlbW92ZU5vZGUodHJhY2ssIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cmFjayA9IGNyZWF0ZUVsZW1lbnQoJ3RyYWNrJywge1xuICAgICAgICAgICAgICAgIGtpbmQ6ICdzdWJ0aXRsZXMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnN1YnRpdGxlbGFuZyxcbiAgICAgICAgICAgICAgICBzcmNsYW5nOiB0aGlzLnN1YnRpdGxlbGFuZyxcbiAgICAgICAgICAgICAgICBzcmM6IHRoaXMudHJ1c3RBc1BpcGUudHJhbnNmb3JtKG52LCBTZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGFwcGVuZE5vZGUodHJhY2ssIHRoaXMubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCd2aWRlbycpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgIH1cbn1cbiJdfQ==