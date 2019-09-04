import * as tslib_1 from "tslib";
import { Directive, Injector } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './partial.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-partial clearfix';
var WIDGET_CONFIG = { widgetType: 'wm-partial', hostClass: DEFAULT_CLS };
var PartialDirective = /** @class */ (function (_super) {
    tslib_1.__extends(PartialDirective, _super);
    function PartialDirective(inj) {
        return _super.call(this, inj, WIDGET_CONFIG) || this;
    }
    PartialDirective.initializeProps = registerProps();
    PartialDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmPartial]',
                    providers: [
                        provideAsWidgetRef(PartialDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    PartialDirective.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return PartialDirective;
}(StylableComponent));
export { PartialDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3BhcnRpYWwvcGFydGlhbC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUVqRSxJQUFNLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQztBQUMzQyxJQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBRXpFO0lBTXNDLDRDQUFpQjtJQUVuRCwwQkFBWSxHQUFhO2VBQ3JCLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUM7SUFDN0IsQ0FBQztJQUhNLGdDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVA1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGFBQWE7b0JBQ3ZCLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQztxQkFDdkM7aUJBQ0o7Ozs7Z0JBZG1CLFFBQVE7O0lBb0I1Qix1QkFBQztDQUFBLEFBWEQsQ0FNc0MsaUJBQWlCLEdBS3REO1NBTFksZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3BhcnRpYWwucHJvcHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXBhcnRpYWwgY2xlYXJmaXgnO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tcGFydGlhbCcsIGhvc3RDbGFzczogREVGQVVMVF9DTFN9O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bVBhcnRpYWxdJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFBhcnRpYWxEaXJlY3RpdmUpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBQYXJ0aWFsRGlyZWN0aXZlIGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgIH1cbn1cbiJdfQ==