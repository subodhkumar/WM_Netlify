import * as tslib_1 from "tslib";
import { Component, HostBinding, Injector } from '@angular/core';
import { styler } from '../../framework/styler';
import { registerProps } from './icon.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-icon-wrapper';
var WIDGET_CONFIG = {
    widgetType: 'wm-icon',
    hostClass: DEFAULT_CLS
};
var IconComponent = /** @class */ (function (_super) {
    tslib_1.__extends(IconComponent, _super);
    function IconComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this);
        return _this;
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
    IconComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    IconComponent.propDecorators = {
        iconposition: [{ type: HostBinding, args: ['attr.icon-position',] }],
        iconsize: [{ type: HostBinding, args: ['style.fontSize',] }]
    };
    return IconComponent;
}(StylableComponent));
export { IconComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2ljb24vaWNvbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVqRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFaEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM3QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUVqRSxJQUFNLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQztBQUN2QyxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLFNBQVM7SUFDckIsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQUVGO0lBT21DLHlDQUFpQjtJQVFoRCx1QkFBWSxHQUFhO1FBQXpCLFlBQ0ksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQUc1QjtRQURHLE1BQU0sQ0FBQyxLQUFJLENBQUMsYUFBYSxFQUFFLEtBQUksQ0FBQyxDQUFDOztJQUNyQyxDQUFDO0lBWE0sNkJBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsVUFBVTtvQkFDcEIsOE5BQW9DO29CQUNwQyxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsYUFBYSxDQUFDO3FCQUNwQztpQkFDSjs7OztnQkFwQmdDLFFBQVE7OzsrQkEwQnBDLFdBQVcsU0FBQyxvQkFBb0I7MkJBQ2hDLFdBQVcsU0FBQyxnQkFBZ0I7O0lBT2pDLG9CQUFDO0NBQUEsQUFwQkQsQ0FPbUMsaUJBQWlCLEdBYW5EO1NBYlksYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSG9zdEJpbmRpbmcsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9pY29uLnByb3BzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWljb24td3JhcHBlcic7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1pY29uJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bUljb25dJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaWNvbi5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihJY29uQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgSWNvbkNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIGljb25jbGFzczogYW55O1xuICAgIHB1YmxpYyBjYXB0aW9uOiBzdHJpbmc7XG4gICAgQEhvc3RCaW5kaW5nKCdhdHRyLmljb24tcG9zaXRpb24nKSBpY29ucG9zaXRpb246IHN0cmluZztcbiAgICBASG9zdEJpbmRpbmcoJ3N0eWxlLmZvbnRTaXplJykgaWNvbnNpemU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICB9XG59XG4iXX0=