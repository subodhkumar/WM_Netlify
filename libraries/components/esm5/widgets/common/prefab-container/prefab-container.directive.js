import * as tslib_1 from "tslib";
import { Directive, Injector } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { styler } from '../../framework/styler';
import { registerProps } from './prefab-container.props';
var DEFAULT_CLS = 'app-prefab-container full-height';
var WIDGET_CONFIG = {
    widgetType: 'wm-prefab-container',
    hostClass: DEFAULT_CLS
};
var PrefabContainerDirective = /** @class */ (function (_super) {
    tslib_1.__extends(PrefabContainerDirective, _super);
    function PrefabContainerDirective(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this);
        return _this;
    }
    PrefabContainerDirective.initializeProps = registerProps();
    PrefabContainerDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmPrefabContainer]',
                    providers: [
                        provideAsWidgetRef(PrefabContainerDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    PrefabContainerDirective.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return PrefabContainerDirective;
}(StylableComponent));
export { PrefabContainerDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLWNvbnRhaW5lci5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3ByZWZhYi1jb250YWluZXIvcHJlZmFiLWNvbnRhaW5lci5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRS9ELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFekQsSUFBTSxXQUFXLEdBQUcsa0NBQWtDLENBQUM7QUFDdkQsSUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxxQkFBcUI7SUFDakMsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQUVGO0lBTThDLG9EQUFpQjtJQUczRCxrQ0FBWSxHQUFhO1FBQXpCLFlBQ0ksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQUU1QjtRQURHLE1BQU0sQ0FBQyxLQUFJLENBQUMsYUFBYSxFQUFFLEtBQUksQ0FBQyxDQUFDOztJQUNyQyxDQUFDO0lBTE0sd0NBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUDVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUscUJBQXFCO29CQUMvQixTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsd0JBQXdCLENBQUM7cUJBQy9DO2lCQUNKOzs7O2dCQW5CbUIsUUFBUTs7SUEyQjVCLCtCQUFDO0NBQUEsQUFiRCxDQU04QyxpQkFBaUIsR0FPOUQ7U0FQWSx3QkFBd0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9wcmVmYWItY29udGFpbmVyLnByb3BzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXByZWZhYi1jb250YWluZXIgZnVsbC1oZWlnaHQnO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tcHJlZmFiLWNvbnRhaW5lcicsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21QcmVmYWJDb250YWluZXJdJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFByZWZhYkNvbnRhaW5lckRpcmVjdGl2ZSlcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFByZWZhYkNvbnRhaW5lckRpcmVjdGl2ZSBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICB9XG59XG4iXX0=