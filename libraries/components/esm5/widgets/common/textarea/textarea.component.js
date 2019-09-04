import * as tslib_1 from "tslib";
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { registerProps } from './textarea.props';
import { BaseInput } from '../text/base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
var WIDGET_CONFIG = {
    widgetType: 'wm-textarea',
    hostClass: 'app-input-wrapper'
};
var TextareaComponent = /** @class */ (function (_super) {
    tslib_1.__extends(TextareaComponent, _super);
    function TextareaComponent(inj) {
        return _super.call(this, inj, WIDGET_CONFIG) || this;
    }
    TextareaComponent.initializeProps = registerProps();
    TextareaComponent.decorators = [
        { type: Component, args: [{
                    selector: 'wm-textarea',
                    template: "<textarea class=\"form-control app-textarea\"\n          focus-target\n          role=\"input\"\n          [attr.name]=\"name\"\n          [(ngModel)]=\"datavalue\"\n          [ngModelOptions]=\"ngModelOptions\"\n          [readonly]=\"readonly\"\n          [required]=\"required\"\n          [disabled]=\"disabled\"\n          [maxlength]=\"maxchars\"\n          [attr.tabindex]=\"tabindex\"\n          [attr.placeholder]=\"placeholder\"\n          [attr.accesskey]=\"shortcutkey\"\n          [autofocus]=\"autofocus\"\n          (blur)=\"handleBlur($event)\"\n          (ngModelChange)=\"handleChange($event)\"\n          #textarea\n></textarea>",
                    providers: [
                        provideAsNgValueAccessor(TextareaComponent),
                        provideAsWidgetRef(TextareaComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    TextareaComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    TextareaComponent.propDecorators = {
        inputEl: [{ type: ViewChild, args: ['textarea',] }],
        ngModel: [{ type: ViewChild, args: [NgModel,] }]
    };
    return TextareaComponent;
}(BaseInput));
export { TextareaComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dGFyZWEuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90ZXh0YXJlYS90ZXh0YXJlYS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXpDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDcEQsT0FBTyxFQUFFLHdCQUF3QixFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFM0YsSUFBTSxhQUFhLEdBQUc7SUFDbEIsVUFBVSxFQUFFLGFBQWE7SUFDekIsU0FBUyxFQUFFLG1CQUFtQjtDQUNqQyxDQUFDO0FBRUY7SUFRdUMsNkNBQVM7SUFjNUMsMkJBQVksR0FBYTtlQUNyQixrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDO0lBQzdCLENBQUM7SUFmTSxpQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFUNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxhQUFhO29CQUN2QixtcEJBQXdDO29CQUN4QyxTQUFTLEVBQUU7d0JBQ1Asd0JBQXdCLENBQUMsaUJBQWlCLENBQUM7d0JBQzNDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDO3FCQUN4QztpQkFDSjs7OztnQkFuQitCLFFBQVE7OzswQkErQm5DLFNBQVMsU0FBQyxVQUFVOzBCQUNwQixTQUFTLFNBQUMsT0FBTzs7SUFLdEIsd0JBQUM7Q0FBQSxBQXpCRCxDQVF1QyxTQUFTLEdBaUIvQztTQWpCWSxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5nTW9kZWwgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3RleHRhcmVhLnByb3BzJztcbmltcG9ydCB7IEJhc2VJbnB1dCB9IGZyb20gJy4uL3RleHQvYmFzZS9iYXNlLWlucHV0JztcbmltcG9ydCB7IHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgV0lER0VUX0NPTkZJRyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tdGV4dGFyZWEnLFxuICAgIGhvc3RDbGFzczogJ2FwcC1pbnB1dC13cmFwcGVyJ1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd3bS10ZXh0YXJlYScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3RleHRhcmVhLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKFRleHRhcmVhQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFRleHRhcmVhQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgVGV4dGFyZWFDb21wb25lbnQgZXh0ZW5kcyBCYXNlSW5wdXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG4gICAgcHVibGljIHJlcXVpcmVkOiBib29sZWFuO1xuICAgIHB1YmxpYyBtYXhjaGFyczogbnVtYmVyO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyByZWFkb25seTogYm9vbGVhbjtcbiAgICBwdWJsaWMgdGFiaW5kZXg6IGFueTtcbiAgICBwdWJsaWMgcGxhY2Vob2xkZXI6IGFueTtcbiAgICBwdWJsaWMgc2hvcnRjdXRrZXk6IHN0cmluZztcbiAgICBwdWJsaWMgYXV0b2ZvY3VzOiBib29sZWFuO1xuICAgIEBWaWV3Q2hpbGQoJ3RleHRhcmVhJykgaW5wdXRFbDogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKE5nTW9kZWwpIG5nTW9kZWw6IE5nTW9kZWw7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgfVxufVxuIl19