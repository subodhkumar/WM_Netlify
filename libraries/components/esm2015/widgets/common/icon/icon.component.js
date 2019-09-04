import { Component, HostBinding, Injector } from '@angular/core';
import { styler } from '../../framework/styler';
import { registerProps } from './icon.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'app-icon-wrapper';
const WIDGET_CONFIG = {
    widgetType: 'wm-icon',
    hostClass: DEFAULT_CLS
};
export class IconComponent extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
}
IconComponent.initializeProps = registerProps();
IconComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmIcon]',
                template: "<i class=\"app-icon {{iconclass}}\"></i>\n<span class=\"sr-only\" *ngIf=\"iconclass\">{{caption}} {{appLocale.LABEL_ICON}}</span>\n<label class=\"app-label\" [textContent]=\"caption\" *ngIf=\"caption\"></label>",
                providers: [
                    provideAsWidgetRef(IconComponent)
                ]
            }] }
];
/** @nocollapse */
IconComponent.ctorParameters = () => [
    { type: Injector }
];
IconComponent.propDecorators = {
    iconposition: [{ type: HostBinding, args: ['attr.icon-position',] }],
    iconsize: [{ type: HostBinding, args: ['style.fontSize',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2ljb24vaWNvbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWpFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVoRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRWpFLE1BQU0sV0FBVyxHQUFHLGtCQUFrQixDQUFDO0FBQ3ZDLE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsU0FBUztJQUNyQixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFDO0FBU0YsTUFBTSxPQUFPLGFBQWMsU0FBUSxpQkFBaUI7SUFRaEQsWUFBWSxHQUFhO1FBQ3JCLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQzs7QUFYTSw2QkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVI1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLFVBQVU7Z0JBQ3BCLDhOQUFvQztnQkFDcEMsU0FBUyxFQUFFO29CQUNQLGtCQUFrQixDQUFDLGFBQWEsQ0FBQztpQkFDcEM7YUFDSjs7OztZQXBCZ0MsUUFBUTs7OzJCQTBCcEMsV0FBVyxTQUFDLG9CQUFvQjt1QkFDaEMsV0FBVyxTQUFDLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSG9zdEJpbmRpbmcsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9pY29uLnByb3BzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWljb24td3JhcHBlcic7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1pY29uJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bUljb25dJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaWNvbi5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihJY29uQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgSWNvbkNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIGljb25jbGFzczogYW55O1xuICAgIHB1YmxpYyBjYXB0aW9uOiBzdHJpbmc7XG4gICAgQEhvc3RCaW5kaW5nKCdhdHRyLmljb24tcG9zaXRpb24nKSBpY29ucG9zaXRpb246IHN0cmluZztcbiAgICBASG9zdEJpbmRpbmcoJ3N0eWxlLmZvbnRTaXplJykgaWNvbnNpemU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICB9XG59XG4iXX0=