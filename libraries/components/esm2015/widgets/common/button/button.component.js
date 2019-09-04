import { Component, HostBinding, Injector } from '@angular/core';
import { styler } from '../../framework/styler';
import { DISPLAY_TYPE } from '../../framework/constants';
import { registerProps } from './button.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'btn app-button';
const WIDGET_CONFIG = {
    widgetType: 'wm-button',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};
export class ButtonComponent extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
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
ButtonComponent.ctorParameters = () => [
    { type: Injector }
];
ButtonComponent.propDecorators = {
    type: [{ type: HostBinding, args: ['type',] }],
    tabindex: [{ type: HostBinding, args: ['tabIndex',] }],
    disabled: [{ type: HostBinding, args: ['disabled',] }],
    shortcutkey: [{ type: HostBinding, args: ['attr.accesskey',] }],
    iconposition: [{ type: HostBinding, args: ['attr.icon-position',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vYnV0dG9uL2J1dHRvbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWpFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVoRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDekQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRWpFLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDO0FBQ3JDLE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsV0FBVztJQUN2QixTQUFTLEVBQUUsV0FBVztJQUN0QixXQUFXLEVBQUUsWUFBWSxDQUFDLFlBQVk7Q0FDekMsQ0FBQztBQVNGLE1BQU0sT0FBTyxlQUFnQixTQUFRLGlCQUFpQjtJQWFsRCxZQUFZLEdBQWE7UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDOztBQWZNLCtCQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBUjVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsa0JBQWtCO2dCQUM1QiwyckJBQXNDO2dCQUN0QyxTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsZUFBZSxDQUFDO2lCQUN0QzthQUNKOzs7O1lBdEJnQyxRQUFROzs7bUJBOEJwQyxXQUFXLFNBQUMsTUFBTTt1QkFDbEIsV0FBVyxTQUFDLFVBQVU7dUJBQ3RCLFdBQVcsU0FBQyxVQUFVOzBCQUN0QixXQUFXLFNBQUMsZ0JBQWdCOzJCQUM1QixXQUFXLFNBQUMsb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBIb3N0QmluZGluZywgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IERJU1BMQVlfVFlQRSB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9jb25zdGFudHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vYnV0dG9uLnByb3BzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYnRuIGFwcC1idXR0b24nO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tYnV0dG9uJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTLFxuICAgIGRpc3BsYXlUeXBlOiBESVNQTEFZX1RZUEUuSU5MSU5FX0JMT0NLXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2J1dHRvblt3bUJ1dHRvbl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9idXR0b24uY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQnV0dG9uQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgQnV0dG9uQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgaWNvbnVybDogc3RyaW5nO1xuICAgIHB1YmxpYyBpY29uY2xhc3M6IHN0cmluZztcbiAgICBwdWJsaWMgY2FwdGlvbjogc3RyaW5nO1xuICAgIHB1YmxpYyBiYWRnZXZhbHVlOiBzdHJpbmc7XG4gICAgQEhvc3RCaW5kaW5nKCd0eXBlJykgdHlwZTogc3RyaW5nO1xuICAgIEBIb3N0QmluZGluZygndGFiSW5kZXgnKSB0YWJpbmRleDogbnVtYmVyO1xuICAgIEBIb3N0QmluZGluZygnZGlzYWJsZWQnKSBkaXNhYmxlZDogYm9vbGVhbjtcbiAgICBASG9zdEJpbmRpbmcoJ2F0dHIuYWNjZXNza2V5Jykgc2hvcnRjdXRrZXk6IHN0cmluZztcbiAgICBASG9zdEJpbmRpbmcoJ2F0dHIuaWNvbi1wb3NpdGlvbicpIGljb25wb3NpdGlvbjogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICB9XG59XG4iXX0=