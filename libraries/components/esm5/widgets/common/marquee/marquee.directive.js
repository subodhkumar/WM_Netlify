import * as tslib_1 from "tslib";
import { Directive, Injector } from '@angular/core';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './marquee.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-marquee app-container';
var WIDGET_CONFIG = {
    widgetType: 'wm-marquee',
    hostClass: DEFAULT_CLS
};
var MarqueeDirective = /** @class */ (function (_super) {
    tslib_1.__extends(MarqueeDirective, _super);
    function MarqueeDirective(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this);
        return _this;
    }
    MarqueeDirective.initializeProps = registerProps();
    MarqueeDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmMarquee]',
                    providers: [
                        provideAsWidgetRef(MarqueeDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    MarqueeDirective.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return MarqueeDirective;
}(StylableComponent));
export { MarqueeDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFycXVlZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL21hcnF1ZWUvbWFycXVlZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3BELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFakUsSUFBTSxXQUFXLEdBQUcsMkJBQTJCLENBQUM7QUFDaEQsSUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxZQUFZO0lBQ3hCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUM7QUFFRjtJQU1zQyw0Q0FBaUI7SUFHbkQsMEJBQVksR0FBYTtRQUF6QixZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FHNUI7UUFERyxNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLENBQUMsQ0FBQzs7SUFDckMsQ0FBQztJQU5NLGdDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVA1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGFBQWE7b0JBQ3ZCLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQztxQkFDdkM7aUJBQ0o7Ozs7Z0JBbkJtQixRQUFROztJQTRCNUIsdUJBQUM7Q0FBQSxBQWRELENBTXNDLGlCQUFpQixHQVF0RDtTQVJZLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vbWFycXVlZS5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtbWFycXVlZSBhcHAtY29udGFpbmVyJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLW1hcnF1ZWUnLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFNcbn07XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtTWFycXVlZV0nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoTWFycXVlZURpcmVjdGl2ZSlcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIE1hcnF1ZWVEaXJlY3RpdmUgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICB9XG59XG4iXX0=