import * as tslib_1 from "tslib";
import { Directive, Injector } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { registerProps } from './dialog-footer.props';
import { provideAsWidgetRef } from '../../../../../utils/widget-utils';
var WIDGET_INFO = {
    widgetType: 'wm-dialogfooter',
    hostClass: 'app-dialog-footer modal-footer'
};
var DialogFooterDirective = /** @class */ (function (_super) {
    tslib_1.__extends(DialogFooterDirective, _super);
    function DialogFooterDirective(inj) {
        return _super.call(this, inj, WIDGET_INFO) || this;
    }
    DialogFooterDirective.initializeProps = registerProps();
    DialogFooterDirective.decorators = [
        { type: Directive, args: [{
                    selector: 'div[wmDialogFooter]',
                    providers: [
                        provideAsWidgetRef(DialogFooterDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    DialogFooterDirective.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return DialogFooterDirective;
}(BaseComponent));
export { DialogFooterDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWZvb3Rlci5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2RpYWxvZy9iYXNlL2RpYWxvZy1mb290ZXIvZGlhbG9nLWZvb3Rlci5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3BELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFFdkUsSUFBTSxXQUFXLEdBQWtCO0lBQy9CLFVBQVUsRUFBRSxpQkFBaUI7SUFDN0IsU0FBUyxFQUFFLGdDQUFnQztDQUM5QyxDQUFDO0FBRUY7SUFNMkMsaURBQWE7SUFHcEQsK0JBQVksR0FBYTtlQUNyQixrQkFBTSxHQUFHLEVBQUUsV0FBVyxDQUFDO0lBQzNCLENBQUM7SUFKTSxxQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFQNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxxQkFBcUI7b0JBQy9CLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxxQkFBcUIsQ0FBQztxQkFDNUM7aUJBQ0o7Ozs7Z0JBakJtQixRQUFROztJQXdCNUIsNEJBQUM7Q0FBQSxBQVpELENBTTJDLGFBQWEsR0FNdkQ7U0FOWSxxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgQmFzZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvYmFzZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vZGlhbG9nLWZvb3Rlci5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBXSURHRVRfSU5GTzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tZGlhbG9nZm9vdGVyJyxcbiAgICBob3N0Q2xhc3M6ICdhcHAtZGlhbG9nLWZvb3RlciBtb2RhbC1mb290ZXInXG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bURpYWxvZ0Zvb3Rlcl0nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoRGlhbG9nRm9vdGVyRGlyZWN0aXZlKVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgRGlhbG9nRm9vdGVyRGlyZWN0aXZlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfSU5GTyk7XG4gICAgfVxufVxuIl19