import * as tslib_1 from "tslib";
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { registerProps } from './input-number.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';
var WIDGET_CONFIG = {
    widgetType: 'wm-input-number',
    hostClass: 'app-input-wrapper'
};
var InputNumberComponent = /** @class */ (function (_super) {
    tslib_1.__extends(InputNumberComponent, _super);
    function InputNumberComponent(inj) {
        return _super.call(this, inj, WIDGET_CONFIG) || this;
    }
    InputNumberComponent.prototype.onArrowPress = function ($event) {
        if (this.step === 0) {
            $event.preventDefault();
        }
    };
    InputNumberComponent.prototype.validateInputEntry = function ($event) {
        if ($event.key === 'e' && $event.target.value.indexOf($event.key) !== -1) {
            return false;
        }
    };
    InputNumberComponent.initializeProps = registerProps();
    InputNumberComponent.decorators = [
        { type: Component, args: [{
                    selector: 'wm-input[type="number"]',
                    template: "<input class=\"form-control app-textbox\"\n       [ngClass]=\"{'step-hidden': step === 0}\"\n       focus-target\n       role=\"input\"\n       type=\"number\"\n       [attr.name]=\"name\"\n       [(ngModel)]=\"datavalue\"\n       [ngModelOptions]=\"ngModelOptions\"\n       [readonly]=\"readonly\"\n       [required]=\"required\"\n       [disabled]=\"disabled\"\n       [maxlength]=\"maxchars\"\n       [min]=\"minvalue\"\n       [max]=\"maxvalue\"\n       [step]=\"step\"\n       [attr.tabindex]=\"tabindex\"\n       [attr.placeholder]=\"placeholder\"\n       [attr.accesskey]=\"shortcutkey\"\n       [autofocus]=\"autofocus\"\n       (blur)=\"handleBlur($event)\"\n       (ngModelChange)=\"handleChange($event)\"\n       [autocomplete]=\"autocomplete ? 'on' : 'off'\"\n       (keyup.enter)=\"flushViewChanges(input.value)\"\n       (keydown.ArrowUp)=\"onArrowPress($event)\"\n       (keydown.ArrowDown)=\"onArrowPress($event)\"\n       (keypress)=\"validateInputEntry($event)\"\n       #input>",
                    providers: [
                        provideAsNgValueAccessor(InputNumberComponent),
                        provideAsWidgetRef(InputNumberComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    InputNumberComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    InputNumberComponent.propDecorators = {
        inputEl: [{ type: ViewChild, args: ['input',] }],
        ngModel: [{ type: ViewChild, args: [NgModel,] }]
    };
    return InputNumberComponent;
}(BaseInput));
export { InputNumberComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtbnVtYmVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGV4dC9udW1iZXIvaW5wdXQtbnVtYmVyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHekMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUU5RixJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGlCQUFpQjtJQUM3QixTQUFTLEVBQUUsbUJBQW1CO0NBQ2pDLENBQUM7QUFFRjtJQVEwQyxnREFBUztJQXFCL0MsOEJBQVksR0FBYTtlQUNyQixrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDO0lBQzdCLENBQUM7SUFFRCwyQ0FBWSxHQUFaLFVBQWEsTUFBTTtRQUNmLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7WUFDbEIsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQzFCO0lBQ0wsQ0FBQztJQUVNLGlEQUFrQixHQUF6QixVQUEwQixNQUFNO1FBQzVCLElBQUksTUFBTSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUN2RSxPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFsQ00sb0NBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBVDVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUseUJBQXlCO29CQUNuQyxnL0JBQTRDO29CQUM1QyxTQUFTLEVBQUU7d0JBQ1Asd0JBQXdCLENBQUMsb0JBQW9CLENBQUM7d0JBQzlDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDO3FCQUMzQztpQkFDSjs7OztnQkFwQitCLFFBQVE7OzswQkFxQ25DLFNBQVMsU0FBQyxPQUFPOzBCQUNqQixTQUFTLFNBQUMsT0FBTzs7SUFtQnRCLDJCQUFDO0NBQUEsQUE1Q0QsQ0FRMEMsU0FBUyxHQW9DbEQ7U0FwQ1ksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3RvciwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOZ01vZGVsIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2lucHV0LW51bWJlci5wcm9wcyc7XG5pbXBvcnQgeyBCYXNlSW5wdXQgfSBmcm9tICcuLi9iYXNlL2Jhc2UtaW5wdXQnO1xuaW1wb3J0IHsgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1pbnB1dC1udW1iZXInLFxuICAgIGhvc3RDbGFzczogJ2FwcC1pbnB1dC13cmFwcGVyJ1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd3bS1pbnB1dFt0eXBlPVwibnVtYmVyXCJdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaW5wdXQtbnVtYmVyLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKElucHV0TnVtYmVyQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKElucHV0TnVtYmVyQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgSW5wdXROdW1iZXJDb21wb25lbnQgZXh0ZW5kcyBCYXNlSW5wdXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgcmVxdWlyZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIG1heGNoYXJzOiBudW1iZXI7XG4gICAgcHVibGljIGRpc2FibGVkOiBib29sZWFuO1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gICAgcHVibGljIHJlYWRvbmx5OiBib29sZWFuO1xuICAgIHB1YmxpYyBtaW52YWx1ZTogbnVtYmVyO1xuICAgIHB1YmxpYyBtYXh2YWx1ZTogbnVtYmVyO1xuICAgIHB1YmxpYyB0YWJpbmRleDogYW55O1xuICAgIHB1YmxpYyBwbGFjZWhvbGRlcjogYW55O1xuICAgIHB1YmxpYyBzaG9ydGN1dGtleTogc3RyaW5nO1xuICAgIHB1YmxpYyBhdXRvZm9jdXM6IGJvb2xlYW47XG4gICAgcHVibGljIGF1dG9jb21wbGV0ZTogYW55O1xuXG4gICAgQFZpZXdDaGlsZCgnaW5wdXQnKSBpbnB1dEVsOiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoTmdNb2RlbCkgbmdNb2RlbDogTmdNb2RlbDtcblxuICAgIHB1YmxpYyBzdGVwO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgIH1cblxuICAgIG9uQXJyb3dQcmVzcygkZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RlcCA9PT0gMCkge1xuICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyB2YWxpZGF0ZUlucHV0RW50cnkoJGV2ZW50KSB7XG4gICAgICAgIGlmICgkZXZlbnQua2V5ID09PSAnZScgJiYgICRldmVudC50YXJnZXQudmFsdWUuaW5kZXhPZigkZXZlbnQua2V5KSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==