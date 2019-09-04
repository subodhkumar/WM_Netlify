import * as tslib_1 from "tslib";
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { registerProps } from './input-color.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';
var WIDGET_CONFIG = {
    widgetType: 'wm-input-color',
    hostClass: 'app-input-wrapper'
};
var InputColorComponent = /** @class */ (function (_super) {
    tslib_1.__extends(InputColorComponent, _super);
    function InputColorComponent(inj) {
        return _super.call(this, inj, WIDGET_CONFIG) || this;
    }
    InputColorComponent.initializeProps = registerProps();
    InputColorComponent.decorators = [
        { type: Component, args: [{
                    selector: 'wm-input[type="color"]',
                    template: "<input class=\"form-control app-textbox\"\n       focus-target\n       type=\"color\"\n       role=\"input\"\n       [attr.name]=\"name\"\n       [(ngModel)]=\"datavalue\"\n       [readonly]=\"readonly\"\n       [required]=\"required\"\n       [disabled]=\"disabled\"\n       [maxlength]=\"maxchars\"\n       [attr.tabindex]=\"tabindex\"\n       [attr.placeholder]=\"placeholder\"\n       [attr.accesskey]=\"shortcutkey\"\n       [autofocus]=\"autofocus\"\n       (blur)=\"handleBlur($event)\"\n       (ngModelChange)=\"handleChange($event)\"\n       #input>",
                    providers: [
                        provideAsNgValueAccessor(InputColorComponent),
                        provideAsWidgetRef(InputColorComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    InputColorComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    InputColorComponent.propDecorators = {
        inputEl: [{ type: ViewChild, args: ['input',] }],
        ngModel: [{ type: ViewChild, args: [NgModel,] }]
    };
    return InputColorComponent;
}(BaseInput));
export { InputColorComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtY29sb3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90ZXh0L2NvbG9yL2lucHV0LWNvbG9yLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHekMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUU5RixJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGdCQUFnQjtJQUM1QixTQUFTLEVBQUUsbUJBQW1CO0NBQ2pDLENBQUM7QUFFRjtJQVF5QywrQ0FBUztJQWU5Qyw2QkFBWSxHQUFhO2VBQ3JCLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUM7SUFDN0IsQ0FBQztJQWhCTSxtQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFUNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSx3QkFBd0I7b0JBQ2xDLDBqQkFBMkM7b0JBQzNDLFNBQVMsRUFBRTt3QkFDUCx3QkFBd0IsQ0FBQyxtQkFBbUIsQ0FBQzt3QkFDN0Msa0JBQWtCLENBQUMsbUJBQW1CLENBQUM7cUJBQzFDO2lCQUNKOzs7O2dCQXBCK0IsUUFBUTs7OzBCQWlDbkMsU0FBUyxTQUFDLE9BQU87MEJBQ2pCLFNBQVMsU0FBQyxPQUFPOztJQUt0QiwwQkFBQztDQUFBLEFBMUJELENBUXlDLFNBQVMsR0FrQmpEO1NBbEJZLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5qZWN0b3IsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmdNb2RlbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9pbnB1dC1jb2xvci5wcm9wcyc7XG5pbXBvcnQgeyBCYXNlSW5wdXQgfSBmcm9tICcuLi9iYXNlL2Jhc2UtaW5wdXQnO1xuaW1wb3J0IHsgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1pbnB1dC1jb2xvcicsXG4gICAgaG9zdENsYXNzOiAnYXBwLWlucHV0LXdyYXBwZXInXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3dtLWlucHV0W3R5cGU9XCJjb2xvclwiXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2lucHV0LWNvbG9yLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKElucHV0Q29sb3JDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoSW5wdXRDb2xvckNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIElucHV0Q29sb3JDb21wb25lbnQgZXh0ZW5kcyBCYXNlSW5wdXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgcmVxdWlyZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIG1heGNoYXJzOiBudW1iZXI7XG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcbiAgICBwdWJsaWMgcmVhZG9ubHk6IGJvb2xlYW47XG4gICAgcHVibGljIHRhYmluZGV4OiBhbnk7XG4gICAgcHVibGljIHNob3J0Y3V0a2V5OiBzdHJpbmc7XG4gICAgcHVibGljIGF1dG9mb2N1czogYm9vbGVhbjtcbiAgICBwdWJsaWMgZGlzYWJsZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIHBsYWNlaG9sZGVyOiBhbnk7XG4gICAgQFZpZXdDaGlsZCgnaW5wdXQnKSBpbnB1dEVsOiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoTmdNb2RlbCkgbmdNb2RlbDogTmdNb2RlbDtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICB9XG59XG4iXX0=