import * as tslib_1 from "tslib";
import { Directive, HostBinding, Injector } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './button-group.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'btn-group app-button-group';
var WIDGET_CONFIG = {
    widgetType: 'wm-buttongroup',
    hostClass: DEFAULT_CLS
};
var ButtonGroupDirective = /** @class */ (function (_super) {
    tslib_1.__extends(ButtonGroupDirective, _super);
    function ButtonGroupDirective(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER);
        return _this;
    }
    ButtonGroupDirective.initializeProps = registerProps();
    ButtonGroupDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmButtonGroup]',
                    providers: [
                        provideAsWidgetRef(ButtonGroupDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    ButtonGroupDirective.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    ButtonGroupDirective.propDecorators = {
        vertical: [{ type: HostBinding, args: ['class.btn-group-vertical',] }]
    };
    return ButtonGroupDirective;
}(StylableComponent));
export { ButtonGroupDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLWdyb3VwLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vYnV0dG9uLWdyb3VwL2J1dHRvbi1ncm91cC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVqRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFbkUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRWpFLElBQU0sV0FBVyxHQUFHLDRCQUE0QixDQUFDO0FBQ2pELElBQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsZ0JBQWdCO0lBQzVCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUM7QUFFRjtJQU0wQyxnREFBaUI7SUFJdkQsOEJBQVksR0FBYTtRQUF6QixZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FHNUI7UUFERyxNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7O0lBQ2xFLENBQUM7SUFQTSxvQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFQNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxpQkFBaUI7b0JBQzNCLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDM0M7aUJBQ0o7Ozs7Z0JBbkJnQyxRQUFROzs7MkJBc0JwQyxXQUFXLFNBQUMsMEJBQTBCOztJQU8zQywyQkFBQztDQUFBLEFBZkQsQ0FNMEMsaUJBQWlCLEdBUzFEO1NBVFksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBIb3N0QmluZGluZywgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2J1dHRvbi1ncm91cC5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdidG4tZ3JvdXAgYXBwLWJ1dHRvbi1ncm91cCc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1idXR0b25ncm91cCcsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21CdXR0b25Hcm91cF0nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQnV0dG9uR3JvdXBEaXJlY3RpdmUpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBCdXR0b25Hcm91cERpcmVjdGl2ZSBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuICAgIEBIb3N0QmluZGluZygnY2xhc3MuYnRuLWdyb3VwLXZlcnRpY2FsJykgdmVydGljYWw6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuQ09OVEFJTkVSKTtcbiAgICB9XG59XG4iXX0=