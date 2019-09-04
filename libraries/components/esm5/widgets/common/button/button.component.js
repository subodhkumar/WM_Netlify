import * as tslib_1 from "tslib";
import { Component, HostBinding, Injector } from '@angular/core';
import { styler } from '../../framework/styler';
import { DISPLAY_TYPE } from '../../framework/constants';
import { registerProps } from './button.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'btn app-button';
var WIDGET_CONFIG = {
    widgetType: 'wm-button',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};
var ButtonComponent = /** @class */ (function (_super) {
    tslib_1.__extends(ButtonComponent, _super);
    function ButtonComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this);
        return _this;
    }
    ButtonComponent.initializeProps = registerProps();
    ButtonComponent.decorators = [
        { type: Component, args: [{
                    selector: 'button[wmButton]',
                    template: "<img data-identifier=\"img\" alt=\"button image\" class=\"button-image-icon\" [src]=\"iconurl | image\" *ngIf=\"iconurl\" [ngStyle]=\"{width:iconwidth, height:iconheight, margin:iconmargin}\"/>\n<i class=\"app-icon {{iconclass}}\" aria-hidden=\"true\" [ngStyle]=\"{width:iconwidth, height:iconheight, margin:iconmargin, fontSize:iconwidth}\" *ngIf=\"iconclass\"></i>\n<span class=\"sr-only\" *ngIf=\"iconclass\">{{caption | trustAs:'html'}} {{appLocale.LABEL_ICON}}</span>\n<span class=\"btn-caption\" [innerHTML]=\"caption | trustAs:'html'\"></span>\n<ng-content select=\".caret\"></ng-content>\n<span *ngIf=\"badgevalue\" class=\"badge pull-right\" [textContent]=\"badgevalue\"></span>",
                    providers: [
                        provideAsWidgetRef(ButtonComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    ButtonComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    ButtonComponent.propDecorators = {
        type: [{ type: HostBinding, args: ['type',] }],
        tabindex: [{ type: HostBinding, args: ['tabIndex',] }],
        disabled: [{ type: HostBinding, args: ['disabled',] }],
        shortcutkey: [{ type: HostBinding, args: ['attr.accesskey',] }],
        iconposition: [{ type: HostBinding, args: ['attr.icon-position',] }]
    };
    return ButtonComponent;
}(StylableComponent));
export { ButtonComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vYnV0dG9uL2J1dHRvbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVqRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFaEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUVqRSxJQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQztBQUNyQyxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLFdBQVc7SUFDdkIsU0FBUyxFQUFFLFdBQVc7SUFDdEIsV0FBVyxFQUFFLFlBQVksQ0FBQyxZQUFZO0NBQ3pDLENBQUM7QUFFRjtJQU9xQywyQ0FBaUI7SUFhbEQseUJBQVksR0FBYTtRQUF6QixZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FFNUI7UUFERyxNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLENBQUMsQ0FBQzs7SUFDckMsQ0FBQztJQWZNLCtCQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVI1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGtCQUFrQjtvQkFDNUIsMnJCQUFzQztvQkFDdEMsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztxQkFDdEM7aUJBQ0o7Ozs7Z0JBdEJnQyxRQUFROzs7dUJBOEJwQyxXQUFXLFNBQUMsTUFBTTsyQkFDbEIsV0FBVyxTQUFDLFVBQVU7MkJBQ3RCLFdBQVcsU0FBQyxVQUFVOzhCQUN0QixXQUFXLFNBQUMsZ0JBQWdCOytCQUM1QixXQUFXLFNBQUMsb0JBQW9COztJQU1yQyxzQkFBQztDQUFBLEFBeEJELENBT3FDLGlCQUFpQixHQWlCckQ7U0FqQlksZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSG9zdEJpbmRpbmcsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBESVNQTEFZX1RZUEUgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvY29uc3RhbnRzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2J1dHRvbi5wcm9wcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2J0biBhcHAtYnV0dG9uJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWJ1dHRvbicsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMUyxcbiAgICBkaXNwbGF5VHlwZTogRElTUExBWV9UWVBFLklOTElORV9CTE9DS1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdidXR0b25bd21CdXR0b25dJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vYnV0dG9uLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKEJ1dHRvbkNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIEJ1dHRvbkNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIGljb251cmw6IHN0cmluZztcbiAgICBwdWJsaWMgaWNvbmNsYXNzOiBzdHJpbmc7XG4gICAgcHVibGljIGNhcHRpb246IHN0cmluZztcbiAgICBwdWJsaWMgYmFkZ2V2YWx1ZTogc3RyaW5nO1xuICAgIEBIb3N0QmluZGluZygndHlwZScpIHR5cGU6IHN0cmluZztcbiAgICBASG9zdEJpbmRpbmcoJ3RhYkluZGV4JykgdGFiaW5kZXg6IG51bWJlcjtcbiAgICBASG9zdEJpbmRpbmcoJ2Rpc2FibGVkJykgZGlzYWJsZWQ6IGJvb2xlYW47XG4gICAgQEhvc3RCaW5kaW5nKCdhdHRyLmFjY2Vzc2tleScpIHNob3J0Y3V0a2V5OiBzdHJpbmc7XG4gICAgQEhvc3RCaW5kaW5nKCdhdHRyLmljb24tcG9zaXRpb24nKSBpY29ucG9zaXRpb246IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxufVxuIl19