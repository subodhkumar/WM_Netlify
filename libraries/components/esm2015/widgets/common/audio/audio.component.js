import { Component, Injector } from '@angular/core';
import { styler } from '../../framework/styler';
import { DISPLAY_TYPE } from '../../framework/constants';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './audio.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'app-audio';
const WIDGET_CONFIG = {
    widgetType: 'wm-audio',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};
export class AudioComponent extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
}
AudioComponent.initializeProps = registerProps();
AudioComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmAudio]',
                template: "<audio [src]=\"mp3format | trustAs: 'resource'\" [muted]=\"muted\" [autoplay]=\"autoplay\" [controls]=\"controls\" [loop]=\"loop\" [preload]=\"audiopreload\" role=\"application\" aria-describedby=\"recorded audio\">\n    <source type=\"audio/mp3\" [src]=\"mp3format | trustAs: 'resource'\">\n    {{audiosupportmessage}}\n</audio>\n",
                providers: [
                    provideAsWidgetRef(AudioComponent)
                ]
            }] }
];
/** @nocollapse */
AudioComponent.ctorParameters = () => [
    { type: Injector }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaW8uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9hdWRpby9hdWRpby5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFcEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWhELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBR2pFLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQztBQUNoQyxNQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLFVBQVU7SUFDdEIsU0FBUyxFQUFFLFdBQVc7SUFDdEIsV0FBVyxFQUFFLFlBQVksQ0FBQyxZQUFZO0NBQ3pDLENBQUM7QUFTRixNQUFNLE9BQU8sY0FBZSxTQUFRLGlCQUFpQjtJQVVqRCxZQUFZLEdBQWE7UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUUxQixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDOztBQWJNLDhCQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBUjVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsV0FBVztnQkFDckIsdVZBQXFDO2dCQUNyQyxTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsY0FBYyxDQUFDO2lCQUNyQzthQUNKOzs7O1lBdkJtQixRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgRElTUExBWV9UWVBFIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2F1ZGlvLnByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWF1ZGlvJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWF1ZGlvJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTLFxuICAgIGRpc3BsYXlUeXBlOiBESVNQTEFZX1RZUEUuSU5MSU5FX0JMT0NLXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bUF1ZGlvXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2F1ZGlvLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKEF1ZGlvQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgQXVkaW9Db21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBtcDNmb3JtYXQ6IHN0cmluZztcbiAgICBwdWJsaWMgbXV0ZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIGNvbnRyb2xzOiBib29sZWFuO1xuICAgIHB1YmxpYyBsb29wOiBib29sZWFuO1xuICAgIHB1YmxpYyBhdWRpb3ByZWxvYWQ6IGFueTtcbiAgICBwdWJsaWMgYXVkaW9zdXBwb3J0bWVzc2FnZTogYW55O1xuICAgIHB1YmxpYyBhdXRvcGxheTogYm9vbGVhbjtcbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxufVxuIl19