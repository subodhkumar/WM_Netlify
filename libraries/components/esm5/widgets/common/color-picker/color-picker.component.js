import * as tslib_1 from "tslib";
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { addClass, removeClass } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './color-picker.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';
var DEFAULT_CLS = 'input-group app-colorpicker';
var WIDGET_CONFIG = {
    widgetType: 'wm-colorpicker',
    hostClass: DEFAULT_CLS,
    displayType: 'inline-block'
};
var ColorPickerComponent = /** @class */ (function (_super) {
    tslib_1.__extends(ColorPickerComponent, _super);
    function ColorPickerComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this);
        return _this;
    }
    // To remove space occupied by colorpicker when it is closed
    ColorPickerComponent.prototype.colorPickerToggleChange = function (isOpen) {
        var colorPickerContainer = this.nativeElement.querySelector(".color-picker");
        (!isOpen) ? addClass(colorPickerContainer, 'hidden') : removeClass(colorPickerContainer, 'hidden');
    };
    // change and blur events are added from the template
    ColorPickerComponent.prototype.handleEvent = function (node, eventName, callback, locals) {
        if (eventName !== 'change' && eventName !== 'blur') {
            _super.prototype.handleEvent.call(this, this.inputEl.nativeElement, eventName, callback, locals);
        }
    };
    ColorPickerComponent.prototype.handleChange = function (newVal) {
        this.invokeOnChange(this.datavalue, { type: 'change' }, this.ngModel.valid);
    };
    ColorPickerComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        _super.prototype.onPropertyChange.call(this, key, nv, ov);
    };
    ColorPickerComponent.initializeProps = registerProps();
    ColorPickerComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmColorPicker]',
                    template: "<input class=\"form-control app-textbox\" aria-label=\"Enter the color code\" aria-haspopup=\"true\" aria-expanded=\"false\"\n       #input\n       focus-target\n       [attr.name]=\"name\"\n       [(colorPicker)]=\"datavalue\"\n       (colorPickerChange)=\"handleChange($event);\"\n       (cpToggleChange)=\"colorPickerToggleChange($event)\"\n       [cpPosition]=\"'bottom'\"\n       [attr.placeholder]=\"placeholder\"\n       [disabled]=\"readonly || disabled\"\n       [required]=\"required\"\n       [tabindex]=\"tabindex\"\n       [(ngModel)]=\"datavalue\"\n       (ngModelChange)=\"handleChange($event);\"\n       [ngModelOptions]=\"{updateOn: 'change'}\"\n       (blur)=\"invokeOnTouched($event)\"\n       [attr.accesskey]=\"shortcutkey\">\n<span class=\"input-group-addon colorpicker-container\">\n    <i class=\"colored-box\" [style.backgroundColor]=\"datavalue\">&nbsp;</i>\n</span>",
                    providers: [
                        provideAsNgValueAccessor(ColorPickerComponent),
                        provideAsWidgetRef(ColorPickerComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    ColorPickerComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    ColorPickerComponent.propDecorators = {
        ngModel: [{ type: ViewChild, args: [NgModel,] }],
        inputEl: [{ type: ViewChild, args: ['input', { read: ElementRef },] }]
    };
    return ColorPickerComponent;
}(BaseFormCustomComponent));
export { ColorPickerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItcGlja2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vY29sb3ItcGlja2VyL2NvbG9yLXBpY2tlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXpDLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBR2pELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDckQsT0FBTyxFQUFFLHdCQUF3QixFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM0YsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFHN0UsSUFBTSxXQUFXLEdBQUcsNkJBQTZCLENBQUM7QUFDbEQsSUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxnQkFBZ0I7SUFDNUIsU0FBUyxFQUFFLFdBQVc7SUFDdEIsV0FBVyxFQUFFLGNBQWM7Q0FDOUIsQ0FBQztBQUVGO0lBUTBDLGdEQUF1QjtJQWM3RCw4QkFBWSxHQUFhO1FBQXpCLFlBQ0ksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQUU1QjtRQURHLE1BQU0sQ0FBQyxLQUFJLENBQUMsYUFBYSxFQUFFLEtBQUksQ0FBQyxDQUFDOztJQUNyQyxDQUFDO0lBRUQsNERBQTREO0lBQ3JELHNEQUF1QixHQUE5QixVQUErQixNQUFlO1FBQzFDLElBQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFnQixDQUFDO1FBQzlGLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdkcsQ0FBQztJQUVELHFEQUFxRDtJQUMzQywwQ0FBVyxHQUFyQixVQUFzQixJQUFpQixFQUFFLFNBQWlCLEVBQUUsUUFBa0IsRUFBRSxNQUFXO1FBQ3ZGLElBQUksU0FBUyxLQUFLLFFBQVEsSUFBSSxTQUFTLEtBQUssTUFBTSxFQUFFO1lBQ2hELGlCQUFNLFdBQVcsWUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzlFO0lBQ0wsQ0FBQztJQUVNLDJDQUFZLEdBQW5CLFVBQW9CLE1BQWU7UUFDL0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVTLCtDQUFnQixHQUExQixVQUEyQixHQUFXLEVBQUUsRUFBTyxFQUFFLEVBQU87UUFDcEQsSUFBSSxHQUFHLEtBQUssVUFBVSxFQUFFO1lBQ3BCLE9BQU87U0FDVjtRQUNELGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQXhDTSxvQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFUNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxpQkFBaUI7b0JBQzNCLHc0QkFBNEM7b0JBQzVDLFNBQVMsRUFBRTt3QkFDUCx3QkFBd0IsQ0FBQyxvQkFBb0IsQ0FBQzt3QkFDOUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUM7cUJBQzNDO2lCQUNKOzs7O2dCQTFCK0IsUUFBUTs7OzBCQXNDbkMsU0FBUyxTQUFDLE9BQU87MEJBQ2pCLFNBQVMsU0FBQyxPQUFPLEVBQUUsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFDOztJQThCMUMsMkJBQUM7Q0FBQSxBQWxERCxDQVEwQyx1QkFBdUIsR0EwQ2hFO1NBMUNZLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5qZWN0b3IsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmdNb2RlbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vY29sb3ItcGlja2VyLnByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IEJhc2VGb3JtQ3VzdG9tQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9iYXNlLWZvcm0tY3VzdG9tLmNvbXBvbmVudCc7XG5cblxuY29uc3QgREVGQVVMVF9DTFMgPSAnaW5wdXQtZ3JvdXAgYXBwLWNvbG9ycGlja2VyJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWNvbG9ycGlja2VyJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTLFxuICAgIGRpc3BsYXlUeXBlOiAnaW5saW5lLWJsb2NrJ1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21Db2xvclBpY2tlcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9jb2xvci1waWNrZXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IoQ29sb3JQaWNrZXJDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQ29sb3JQaWNrZXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBDb2xvclBpY2tlckNvbXBvbmVudCBleHRlbmRzIEJhc2VGb3JtQ3VzdG9tQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIHJlcXVpcmVkOiBib29sZWFuO1xuICAgIHB1YmxpYyByZWFkb25seTogYm9vbGVhbjtcbiAgICBwdWJsaWMgZGlzYWJsZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcbiAgICBwdWJsaWMgcGxhY2Vob2xkZXI6IGFueTtcbiAgICBwdWJsaWMgdGFiaW5kZXg6IGFueTtcbiAgICBwdWJsaWMgc2hvcnRjdXRrZXk6IHN0cmluZztcblxuICAgIEBWaWV3Q2hpbGQoTmdNb2RlbCkgbmdNb2RlbDogTmdNb2RlbDtcbiAgICBAVmlld0NoaWxkKCdpbnB1dCcsIHtyZWFkOiBFbGVtZW50UmVmfSkgaW5wdXRFbDogRWxlbWVudFJlZjtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgLy8gVG8gcmVtb3ZlIHNwYWNlIG9jY3VwaWVkIGJ5IGNvbG9ycGlja2VyIHdoZW4gaXQgaXMgY2xvc2VkXG4gICAgcHVibGljIGNvbG9yUGlja2VyVG9nZ2xlQ2hhbmdlKGlzT3BlbjogYm9vbGVhbikge1xuICAgICAgICBjb25zdCBjb2xvclBpY2tlckNvbnRhaW5lciA9IHRoaXMubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKGAuY29sb3ItcGlja2VyYCkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICghaXNPcGVuKSA/IGFkZENsYXNzKGNvbG9yUGlja2VyQ29udGFpbmVyLCAnaGlkZGVuJykgOiByZW1vdmVDbGFzcyhjb2xvclBpY2tlckNvbnRhaW5lciwgJ2hpZGRlbicpO1xuICAgIH1cblxuICAgIC8vIGNoYW5nZSBhbmQgYmx1ciBldmVudHMgYXJlIGFkZGVkIGZyb20gdGhlIHRlbXBsYXRlXG4gICAgcHJvdGVjdGVkIGhhbmRsZUV2ZW50KG5vZGU6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uLCBsb2NhbHM6IGFueSkge1xuICAgICAgICBpZiAoZXZlbnROYW1lICE9PSAnY2hhbmdlJyAmJiBldmVudE5hbWUgIT09ICdibHVyJykge1xuICAgICAgICAgICAgc3VwZXIuaGFuZGxlRXZlbnQodGhpcy5pbnB1dEVsLm5hdGl2ZUVsZW1lbnQsIGV2ZW50TmFtZSwgY2FsbGJhY2ssIGxvY2Fscyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaGFuZGxlQ2hhbmdlKG5ld1ZhbDogYm9vbGVhbikge1xuICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCB7dHlwZTogJ2NoYW5nZSd9LCB0aGlzLm5nTW9kZWwudmFsaWQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdjogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICB9XG59XG4iXX0=