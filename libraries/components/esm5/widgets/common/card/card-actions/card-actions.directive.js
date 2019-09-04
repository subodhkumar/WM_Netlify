import * as tslib_1 from "tslib";
import { Directive, Injector } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './card-actions.props';
var DEFAULT_CLS = 'app-card-actions';
var WIDGET_CONFIG = {
    widgetType: 'wm-card-actions',
    hostClass: DEFAULT_CLS
};
var CardActionsDirective = /** @class */ (function (_super) {
    tslib_1.__extends(CardActionsDirective, _super);
    function CardActionsDirective(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER);
        return _this;
    }
    CardActionsDirective.initializeProps = registerProps();
    CardActionsDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmCardActions]'
                },] }
    ];
    /** @nocollapse */
    CardActionsDirective.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return CardActionsDirective;
}(StylableComponent));
export { CardActionsDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZC1hY3Rpb25zLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vY2FyZC9jYXJkLWFjdGlvbnMvY2FyZC1hY3Rpb25zLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHcEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUVyRCxJQUFNLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQztBQUN2QyxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGlCQUFpQjtJQUM3QixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFDO0FBRUY7SUFHMEMsZ0RBQWlCO0lBR3ZELDhCQUFZLEdBQWE7UUFBekIsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBRTVCO1FBREcsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSSxFQUFFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztJQUNsRSxDQUFDO0lBTE0sb0NBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBSjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsaUJBQWlCO2lCQUM5Qjs7OztnQkFmbUIsUUFBUTs7SUF1QjVCLDJCQUFDO0NBQUEsQUFWRCxDQUcwQyxpQkFBaUIsR0FPMUQ7U0FQWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi8uLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9jYXJkLWFjdGlvbnMucHJvcHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtY2FyZC1hY3Rpb25zJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWNhcmQtYWN0aW9ucycsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21DYXJkQWN0aW9uc10nXG59KVxuZXhwb3J0IGNsYXNzIENhcmRBY3Rpb25zRGlyZWN0aXZlIGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLkNPTlRBSU5FUik7XG4gICAgfVxufVxuIl19