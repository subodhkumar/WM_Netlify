import * as tslib_1 from "tslib";
import { Directive, Injector } from '@angular/core';
import { styler } from '../../framework/styler';
import { registerProps } from './top-nav.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-top-nav';
var WIDGET_CONFIG = { widgetType: 'wm-top-nav', hostClass: DEFAULT_CLS };
var TopNavDirective = /** @class */ (function (_super) {
    tslib_1.__extends(TopNavDirective, _super);
    function TopNavDirective(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this);
        return _this;
    }
    TopNavDirective.initializeProps = registerProps();
    TopNavDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmTopNav]',
                    providers: [
                        provideAsWidgetRef(TopNavDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    TopNavDirective.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return TopNavDirective;
}(StylableComponent));
export { TopNavDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wLW5hdi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RvcC1uYXYvdG9wLW5hdi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFakUsSUFBTSxXQUFXLEdBQUcsYUFBYSxDQUFDO0FBQ2xDLElBQU0sYUFBYSxHQUFHLEVBQUMsVUFBVSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFFekU7SUFNcUMsMkNBQWlCO0lBR2xELHlCQUFZLEdBQWE7UUFBekIsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBRzVCO1FBREcsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSSxDQUFDLENBQUM7O0lBQ3JDLENBQUM7SUFOTSwrQkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFQNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxZQUFZO29CQUN0QixTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsZUFBZSxDQUFDO3FCQUN0QztpQkFDSjs7OztnQkFmbUIsUUFBUTs7SUF3QjVCLHNCQUFDO0NBQUEsQUFkRCxDQU1xQyxpQkFBaUIsR0FRckQ7U0FSWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3RvcC1uYXYucHJvcHMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtdG9wLW5hdic7XG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS10b3AtbmF2JywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtVG9wTmF2XScsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihUb3BOYXZEaXJlY3RpdmUpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBUb3BOYXZEaXJlY3RpdmUgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICB9XG59XG4iXX0=