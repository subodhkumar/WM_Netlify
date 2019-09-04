import * as tslib_1 from "tslib";
import { Directive, Injector, SecurityContext } from '@angular/core';
import { setProperty, toggleClass } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './label.props';
import { StylableComponent } from '../base/stylable.component';
import { DISPLAY_TYPE } from '../../framework/constants';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
var DEFAULT_CLS = 'app-label';
var WIDGET_CONFIG = {
    widgetType: 'wm-label',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};
var LabelDirective = /** @class */ (function (_super) {
    tslib_1.__extends(LabelDirective, _super);
    function LabelDirective(inj, trustAsPipe) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.trustAsPipe = trustAsPipe;
        styler(_this.nativeElement, _this);
        return _this;
    }
    LabelDirective.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'caption') {
            if (_.isObject(nv)) {
                setProperty(this.nativeElement, 'textContent', JSON.stringify(nv));
            }
            else {
                setProperty(this.nativeElement, 'innerHTML', this.trustAsPipe.transform(nv, SecurityContext.HTML));
            }
        }
        else if (key === 'required') {
            toggleClass(this.nativeElement, 'required', nv);
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    LabelDirective.initializeProps = registerProps();
    LabelDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmLabel]',
                    providers: [
                        provideAsWidgetRef(LabelDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    LabelDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: TrustAsPipe }
    ]; };
    return LabelDirective;
}(StylableComponent));
export { LabelDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWwuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9sYWJlbC9sYWJlbC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVyRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVwRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFaEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDekQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDakUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBSTNELElBQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQztBQUNoQyxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLFVBQVU7SUFDdEIsU0FBUyxFQUFFLFdBQVc7SUFDdEIsV0FBVyxFQUFFLFlBQVksQ0FBQyxZQUFZO0NBQ3pDLENBQUM7QUFFRjtJQU1vQywwQ0FBaUI7SUFHakQsd0JBQVksR0FBYSxFQUFVLFdBQXdCO1FBQTNELFlBQ0ksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQUc1QjtRQUprQyxpQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUd2RCxNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLENBQUMsQ0FBQzs7SUFDckMsQ0FBQztJQUVELHlDQUFnQixHQUFoQixVQUFpQixHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUc7UUFFekIsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO1lBQ25CLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDaEIsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN0RTtpQkFBTTtnQkFDSCxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ3RHO1NBRUo7YUFBTSxJQUFJLEdBQUcsS0FBSyxVQUFVLEVBQUU7WUFDM0IsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ25EO2FBQU07WUFDSCxpQkFBTSxnQkFBZ0IsWUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztJQXRCTSw4QkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFQNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxXQUFXO29CQUNyQixTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsY0FBYyxDQUFDO3FCQUNyQztpQkFDSjs7OztnQkExQm1CLFFBQVE7Z0JBVW5CLFdBQVc7O0lBeUNwQixxQkFBQztDQUFBLEFBOUJELENBTW9DLGlCQUFpQixHQXdCcEQ7U0F4QlksY0FBYyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSW5qZWN0b3IsIFNlY3VyaXR5Q29udGV4dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBzZXRQcm9wZXJ0eSwgdG9nZ2xlQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9sYWJlbC5wcm9wcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IERJU1BMQVlfVFlQRSB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9jb25zdGFudHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IFRydXN0QXNQaXBlIH0gZnJvbSAnLi4vLi4vLi4vcGlwZXMvdHJ1c3QtYXMucGlwZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWxhYmVsJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWxhYmVsJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTLFxuICAgIGRpc3BsYXlUeXBlOiBESVNQTEFZX1RZUEUuSU5MSU5FX0JMT0NLXG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bUxhYmVsXScsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihMYWJlbERpcmVjdGl2ZSlcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIExhYmVsRGlyZWN0aXZlIGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yLCBwcml2YXRlIHRydXN0QXNQaXBlOiBUcnVzdEFzUGlwZSkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuXG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3Y/KSB7XG5cbiAgICAgICAgaWYgKGtleSA9PT0gJ2NhcHRpb24nKSB7XG4gICAgICAgICAgICBpZiAoXy5pc09iamVjdChudikpIHtcbiAgICAgICAgICAgICAgICBzZXRQcm9wZXJ0eSh0aGlzLm5hdGl2ZUVsZW1lbnQsICd0ZXh0Q29udGVudCcsIEpTT04uc3RyaW5naWZ5KG52KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFByb3BlcnR5KHRoaXMubmF0aXZlRWxlbWVudCwgJ2lubmVySFRNTCcsIHRoaXMudHJ1c3RBc1BpcGUudHJhbnNmb3JtKG52LCBTZWN1cml0eUNvbnRleHQuSFRNTCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncmVxdWlyZWQnKSB7XG4gICAgICAgICAgICB0b2dnbGVDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdyZXF1aXJlZCcsIG52KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19