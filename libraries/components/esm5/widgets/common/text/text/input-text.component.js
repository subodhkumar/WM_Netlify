import * as tslib_1 from "tslib";
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { registerProps } from './input-text.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';
var WIDGET_CONFIG = {
    widgetType: 'wm-input-text',
    hostClass: 'app-input-wrapper'
};
var InputTextComponent = /** @class */ (function (_super) {
    tslib_1.__extends(InputTextComponent, _super);
    function InputTextComponent(inj) {
        return _super.call(this, inj, WIDGET_CONFIG) || this;
    }
    /* Define the property change handler. This function will be triggered when there is a change in the widget property */
    InputTextComponent.prototype.onPropertyChange = function (key, nv, ov) {
        var _this = this;
        /*Monitoring changes for styles or properties and accordingly handling respective changes.*/
        switch (key) {
            case 'displayformat':
                this.maskVal = [];
                _.forEach(this.displayformat, function (dF) {
                    // This condition is used to support all numbers from 0-9
                    if (dF === '9') {
                        _this.maskVal.push(/\d/);
                    }
                    // This condition is used to support all capital and small alphabets
                    else if (dF === 'A') {
                        _this.maskVal.push(/[A-Z, a-z]/);
                    }
                    // This condition is used to support all small alphabets
                    else if (dF === 'a') {
                        _this.maskVal.push(/[a-z]/);
                    }
                    // This condition is used to support all characters except new line
                    else if (dF === '*') {
                        _this.maskVal.push(/\w/);
                    }
                    else {
                        _this.maskVal.push(dF);
                    }
                });
                break;
            default:
                _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    Object.defineProperty(InputTextComponent.prototype, "mask", {
        get: function () {
            if (this.displayformat) {
                return { mask: this.maskVal, showMask: true };
            }
            else {
                return { mask: false };
            }
        },
        enumerable: true,
        configurable: true
    });
    InputTextComponent.initializeProps = registerProps();
    InputTextComponent.decorators = [
        { type: Component, args: [{
                    selector: 'wm-input[type="text"], wm-input:not([type]), wm-input[type="password"], wm-input[type="search"], wm-input[type="tel"], wm-input[type="url"]',
                    template: "<input class=\"form-control app-textbox\"\n       focus-target\n       role=\"input\"\n       [type]=\"type\"\n       [attr.name]=\"name\"\n       [(ngModel)]=\"datavalue\"\n       [textMask]=\"mask\"\n       [ngModelOptions]=\"ngModelOptions\"\n       [readonly]=\"readonly\"\n       [required]=\"required\"\n       [disabled]=\"disabled\"\n       [maxlength]=\"maxchars\"\n       [pattern]=\"regexp\"\n       [attr.tabindex]=\"tabindex\"\n       [attr.placeholder]=\"placeholder\"\n       [attr.accesskey]=\"shortcutkey\"\n       [autofocus]=\"autofocus\"\n       (ngModelChange)=\"handleChange($event)\"\n       (blur)=\"handleBlur($event)\"\n       [autocomplete]=\"autocomplete ? 'on' : 'off'\"\n       (keyup.enter)=\"flushViewChanges(input.value)\"\n       #input>",
                    providers: [
                        provideAsNgValueAccessor(InputTextComponent),
                        provideAsWidgetRef(InputTextComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    InputTextComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    InputTextComponent.propDecorators = {
        inputEl: [{ type: ViewChild, args: ['input',] }],
        ngModel: [{ type: ViewChild, args: [NgModel,] }]
    };
    return InputTextComponent;
}(BaseInput));
export { InputTextComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtdGV4dC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RleHQvdGV4dC9pbnB1dC10ZXh0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHekMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUk5RixJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGVBQWU7SUFDM0IsU0FBUyxFQUFFLG1CQUFtQjtDQUNqQyxDQUFDO0FBRUY7SUFRd0MsOENBQVM7SUFxQjdDLDRCQUFZLEdBQWE7ZUFDckIsa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQztJQUM3QixDQUFDO0lBRUQsdUhBQXVIO0lBQ3ZILDZDQUFnQixHQUFoQixVQUFpQixHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFBNUIsaUJBNkJDO1FBNUJHLDRGQUE0RjtRQUM1RixRQUFRLEdBQUcsRUFBRTtZQUNULEtBQUssZUFBZTtnQkFDaEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBQ2xCLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFDLEVBQUU7b0JBQzdCLHlEQUF5RDtvQkFDekQsSUFBSSxFQUFFLEtBQUssR0FBRyxFQUFFO3dCQUNaLEtBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUMzQjtvQkFDRCxvRUFBb0U7eUJBQy9ELElBQUksRUFBRSxLQUFLLEdBQUcsRUFBRTt3QkFDakIsS0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7cUJBQ25DO29CQUNELHdEQUF3RDt5QkFDbkQsSUFBSSxFQUFFLEtBQUssR0FBRyxFQUFFO3dCQUNqQixLQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDOUI7b0JBQ0QsbUVBQW1FO3lCQUM5RCxJQUFJLEVBQUUsS0FBSyxHQUFHLEVBQUU7d0JBQ2pCLEtBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUMzQjt5QkFBTTt3QkFDSCxLQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDekI7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsTUFBTTtZQUNWO2dCQUNJLGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDM0M7SUFDTCxDQUFDO0lBRUQsc0JBQUksb0NBQUk7YUFBUjtZQUNJLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDcEIsT0FBTyxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQzthQUMvQztpQkFBTTtnQkFDSCxPQUFPLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDO2FBQ3hCO1FBQ0wsQ0FBQzs7O09BQUE7SUE5RE0sa0NBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBVDVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsNklBQTZJO29CQUN2Siwrd0JBQTBDO29CQUMxQyxTQUFTLEVBQUU7d0JBQ1Asd0JBQXdCLENBQUMsa0JBQWtCLENBQUM7d0JBQzVDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDO3FCQUN6QztpQkFDSjs7OztnQkF0QitCLFFBQVE7OzswQkF5Q25DLFNBQVMsU0FBQyxPQUFPOzBCQUNqQixTQUFTLFNBQUMsT0FBTzs7SUE2Q3RCLHlCQUFDO0NBQUEsQUF4RUQsQ0FRd0MsU0FBUyxHQWdFaEQ7U0FoRVksa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3RvciwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOZ01vZGVsIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2lucHV0LXRleHQucHJvcHMnO1xuaW1wb3J0IHsgQmFzZUlucHV0IH0gZnJvbSAnLi4vYmFzZS9iYXNlLWlucHV0JztcbmltcG9ydCB7IHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1pbnB1dC10ZXh0JyxcbiAgICBob3N0Q2xhc3M6ICdhcHAtaW5wdXQtd3JhcHBlcidcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnd20taW5wdXRbdHlwZT1cInRleHRcIl0sIHdtLWlucHV0Om5vdChbdHlwZV0pLCB3bS1pbnB1dFt0eXBlPVwicGFzc3dvcmRcIl0sIHdtLWlucHV0W3R5cGU9XCJzZWFyY2hcIl0sIHdtLWlucHV0W3R5cGU9XCJ0ZWxcIl0sIHdtLWlucHV0W3R5cGU9XCJ1cmxcIl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9pbnB1dC10ZXh0LmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKElucHV0VGV4dENvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihJbnB1dFRleHRDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBJbnB1dFRleHRDb21wb25lbnQgZXh0ZW5kcyBCYXNlSW5wdXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgcmVxdWlyZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIG1heGNoYXJzOiBudW1iZXI7XG4gICAgcHVibGljIHJlZ2V4cDogc3RyaW5nO1xuICAgIHB1YmxpYyBkaXNwbGF5Zm9ybWF0OiBzdHJpbmc7XG4gICAgcHVibGljIGRpc2FibGVkOiBib29sZWFuO1xuICAgIHB1YmxpYyB0eXBlOiBhbnk7XG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcbiAgICBwdWJsaWMgcmVhZG9ubHk6IGJvb2xlYW47XG4gICAgcHVibGljIHRhYmluZGV4OiBhbnk7XG4gICAgcHVibGljIHBsYWNlaG9sZGVyOiBhbnk7XG4gICAgcHVibGljIHNob3J0Y3V0a2V5OiBzdHJpbmc7XG4gICAgcHVibGljIGF1dG9mb2N1czogYm9vbGVhbjtcbiAgICBwdWJsaWMgYXV0b2NvbXBsZXRlOiBhbnk7XG4gICAgcHVibGljIG1hc2tWYWw6IGFueTtcblxuICAgIEBWaWV3Q2hpbGQoJ2lucHV0JykgaW5wdXRFbDogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKE5nTW9kZWwpIG5nTW9kZWw6IE5nTW9kZWw7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgfVxuXG4gICAgLyogRGVmaW5lIHRoZSBwcm9wZXJ0eSBjaGFuZ2UgaGFuZGxlci4gVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHRoZXJlIGlzIGEgY2hhbmdlIGluIHRoZSB3aWRnZXQgcHJvcGVydHkgKi9cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KSB7XG4gICAgICAgIC8qTW9uaXRvcmluZyBjaGFuZ2VzIGZvciBzdHlsZXMgb3IgcHJvcGVydGllcyBhbmQgYWNjb3JkaW5nbHkgaGFuZGxpbmcgcmVzcGVjdGl2ZSBjaGFuZ2VzLiovXG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICBjYXNlICdkaXNwbGF5Zm9ybWF0JzpcbiAgICAgICAgICAgICAgICB0aGlzLm1hc2tWYWwgPSBbXTtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2godGhpcy5kaXNwbGF5Zm9ybWF0LCAoZEYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBjb25kaXRpb24gaXMgdXNlZCB0byBzdXBwb3J0IGFsbCBudW1iZXJzIGZyb20gMC05XG4gICAgICAgICAgICAgICAgICAgIGlmIChkRiA9PT0gJzknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hc2tWYWwucHVzaCgvXFxkLyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBjb25kaXRpb24gaXMgdXNlZCB0byBzdXBwb3J0IGFsbCBjYXBpdGFsIGFuZCBzbWFsbCBhbHBoYWJldHNcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZEYgPT09ICdBJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXNrVmFsLnB1c2goL1tBLVosIGEtel0vKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGNvbmRpdGlvbiBpcyB1c2VkIHRvIHN1cHBvcnQgYWxsIHNtYWxsIGFscGhhYmV0c1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChkRiA9PT0gJ2EnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hc2tWYWwucHVzaCgvW2Etel0vKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGNvbmRpdGlvbiBpcyB1c2VkIHRvIHN1cHBvcnQgYWxsIGNoYXJhY3RlcnMgZXhjZXB0IG5ldyBsaW5lXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRGID09PSAnKicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFza1ZhbC5wdXNoKC9cXHcvKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFza1ZhbC5wdXNoKGRGKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBtYXNrKCkge1xuICAgICAgICBpZiAodGhpcy5kaXNwbGF5Zm9ybWF0KSB7XG4gICAgICAgICAgICByZXR1cm4ge21hc2s6IHRoaXMubWFza1ZhbCwgc2hvd01hc2s6IHRydWV9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHttYXNrOiBmYWxzZX07XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=