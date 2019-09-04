import * as tslib_1 from "tslib";
import { Component, Injector } from '@angular/core';
import { styler } from '../../framework/styler';
import { DISPLAY_TYPE } from '../../framework/constants';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './audio.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-audio';
var WIDGET_CONFIG = {
    widgetType: 'wm-audio',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};
var AudioComponent = /** @class */ (function (_super) {
    tslib_1.__extends(AudioComponent, _super);
    function AudioComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this);
        return _this;
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
    AudioComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return AudioComponent;
}(StylableComponent));
export { AudioComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaW8uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9hdWRpby9hdWRpby5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVoRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDekQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUdqRSxJQUFNLFdBQVcsR0FBRyxXQUFXLENBQUM7QUFDaEMsSUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxVQUFVO0lBQ3RCLFNBQVMsRUFBRSxXQUFXO0lBQ3RCLFdBQVcsRUFBRSxZQUFZLENBQUMsWUFBWTtDQUN6QyxDQUFDO0FBRUY7SUFPb0MsMENBQWlCO0lBVWpELHdCQUFZLEdBQWE7UUFBekIsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBRzVCO1FBREcsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSSxDQUFDLENBQUM7O0lBQ3JDLENBQUM7SUFiTSw4QkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFSNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxXQUFXO29CQUNyQix1VkFBcUM7b0JBQ3JDLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxjQUFjLENBQUM7cUJBQ3JDO2lCQUNKOzs7O2dCQXZCbUIsUUFBUTs7SUF1QzVCLHFCQUFDO0NBQUEsQUF0QkQsQ0FPb0MsaUJBQWlCLEdBZXBEO1NBZlksY0FBYyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IERJU1BMQVlfVFlQRSB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9jb25zdGFudHMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9hdWRpby5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1hdWRpbyc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1hdWRpbycsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMUyxcbiAgICBkaXNwbGF5VHlwZTogRElTUExBWV9UWVBFLklOTElORV9CTE9DS1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21BdWRpb10nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9hdWRpby5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihBdWRpb0NvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIEF1ZGlvQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgbXAzZm9ybWF0OiBzdHJpbmc7XG4gICAgcHVibGljIG11dGVkOiBib29sZWFuO1xuICAgIHB1YmxpYyBjb250cm9sczogYm9vbGVhbjtcbiAgICBwdWJsaWMgbG9vcDogYm9vbGVhbjtcbiAgICBwdWJsaWMgYXVkaW9wcmVsb2FkOiBhbnk7XG4gICAgcHVibGljIGF1ZGlvc3VwcG9ydG1lc3NhZ2U6IGFueTtcbiAgICBwdWJsaWMgYXV0b3BsYXk6IGJvb2xlYW47XG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuXG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgIH1cbn1cbiJdfQ==