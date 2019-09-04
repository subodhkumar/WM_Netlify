import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { addClass, removeClass } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './color-picker.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';
const DEFAULT_CLS = 'input-group app-colorpicker';
const WIDGET_CONFIG = {
    widgetType: 'wm-colorpicker',
    hostClass: DEFAULT_CLS,
    displayType: 'inline-block'
};
export class ColorPickerComponent extends BaseFormCustomComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
    // To remove space occupied by colorpicker when it is closed
    colorPickerToggleChange(isOpen) {
        const colorPickerContainer = this.nativeElement.querySelector(`.color-picker`);
        (!isOpen) ? addClass(colorPickerContainer, 'hidden') : removeClass(colorPickerContainer, 'hidden');
    }
    // change and blur events are added from the template
    handleEvent(node, eventName, callback, locals) {
        if (eventName !== 'change' && eventName !== 'blur') {
            super.handleEvent(this.inputEl.nativeElement, eventName, callback, locals);
        }
    }
    handleChange(newVal) {
        this.invokeOnChange(this.datavalue, { type: 'change' }, this.ngModel.valid);
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        super.onPropertyChange(key, nv, ov);
    }
}
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
ColorPickerComponent.ctorParameters = () => [
    { type: Injector }
];
ColorPickerComponent.propDecorators = {
    ngModel: [{ type: ViewChild, args: [NgModel,] }],
    inputEl: [{ type: ViewChild, args: ['input', { read: ElementRef },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItcGlja2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vY29sb3ItcGlja2VyL2NvbG9yLXBpY2tlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFekMsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHakQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMzRixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUc3RSxNQUFNLFdBQVcsR0FBRyw2QkFBNkIsQ0FBQztBQUNsRCxNQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGdCQUFnQjtJQUM1QixTQUFTLEVBQUUsV0FBVztJQUN0QixXQUFXLEVBQUUsY0FBYztDQUM5QixDQUFDO0FBVUYsTUFBTSxPQUFPLG9CQUFxQixTQUFRLHVCQUF1QjtJQWM3RCxZQUFZLEdBQWE7UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsNERBQTREO0lBQ3JELHVCQUF1QixDQUFDLE1BQWU7UUFDMUMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQWdCLENBQUM7UUFDOUYsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN2RyxDQUFDO0lBRUQscURBQXFEO0lBQzNDLFdBQVcsQ0FBQyxJQUFpQixFQUFFLFNBQWlCLEVBQUUsUUFBa0IsRUFBRSxNQUFXO1FBQ3ZGLElBQUksU0FBUyxLQUFLLFFBQVEsSUFBSSxTQUFTLEtBQUssTUFBTSxFQUFFO1lBQ2hELEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUM5RTtJQUNMLENBQUM7SUFFTSxZQUFZLENBQUMsTUFBZTtRQUMvQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRVMsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLEVBQU8sRUFBRSxFQUFPO1FBQ3BELElBQUksR0FBRyxLQUFLLFVBQVUsRUFBRTtZQUNwQixPQUFPO1NBQ1Y7UUFDRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4QyxDQUFDOztBQXhDTSxvQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVQ1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLGlCQUFpQjtnQkFDM0IsdzRCQUE0QztnQkFDNUMsU0FBUyxFQUFFO29CQUNQLHdCQUF3QixDQUFDLG9CQUFvQixDQUFDO29CQUM5QyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQztpQkFDM0M7YUFDSjs7OztZQTFCK0IsUUFBUTs7O3NCQXNDbkMsU0FBUyxTQUFDLE9BQU87c0JBQ2pCLFNBQVMsU0FBQyxPQUFPLEVBQUUsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3RvciwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOZ01vZGVsIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9jb2xvci1waWNrZXIucHJvcHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgQmFzZUZvcm1DdXN0b21Db21wb25lbnQgfSBmcm9tICcuLi9iYXNlL2Jhc2UtZm9ybS1jdXN0b20uY29tcG9uZW50JztcblxuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdpbnB1dC1ncm91cCBhcHAtY29sb3JwaWNrZXInO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tY29sb3JwaWNrZXInLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFMsXG4gICAgZGlzcGxheVR5cGU6ICdpbmxpbmUtYmxvY2snXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bUNvbG9yUGlja2VyXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2NvbG9yLXBpY2tlci5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihDb2xvclBpY2tlckNvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihDb2xvclBpY2tlckNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIENvbG9yUGlja2VyQ29tcG9uZW50IGV4dGVuZHMgQmFzZUZvcm1DdXN0b21Db21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgcmVxdWlyZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIHJlYWRvbmx5OiBib29sZWFuO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyBwbGFjZWhvbGRlcjogYW55O1xuICAgIHB1YmxpYyB0YWJpbmRleDogYW55O1xuICAgIHB1YmxpYyBzaG9ydGN1dGtleTogc3RyaW5nO1xuXG4gICAgQFZpZXdDaGlsZChOZ01vZGVsKSBuZ01vZGVsOiBOZ01vZGVsO1xuICAgIEBWaWV3Q2hpbGQoJ2lucHV0Jywge3JlYWQ6IEVsZW1lbnRSZWZ9KSBpbnB1dEVsOiBFbGVtZW50UmVmO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICB9XG5cbiAgICAvLyBUbyByZW1vdmUgc3BhY2Ugb2NjdXBpZWQgYnkgY29sb3JwaWNrZXIgd2hlbiBpdCBpcyBjbG9zZWRcbiAgICBwdWJsaWMgY29sb3JQaWNrZXJUb2dnbGVDaGFuZ2UoaXNPcGVuOiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IGNvbG9yUGlja2VyQ29udGFpbmVyID0gdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb2xvci1waWNrZXJgKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgKCFpc09wZW4pID8gYWRkQ2xhc3MoY29sb3JQaWNrZXJDb250YWluZXIsICdoaWRkZW4nKSA6IHJlbW92ZUNsYXNzKGNvbG9yUGlja2VyQ29udGFpbmVyLCAnaGlkZGVuJyk7XG4gICAgfVxuXG4gICAgLy8gY2hhbmdlIGFuZCBibHVyIGV2ZW50cyBhcmUgYWRkZWQgZnJvbSB0aGUgdGVtcGxhdGVcbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIGxvY2FsczogYW55KSB7XG4gICAgICAgIGlmIChldmVudE5hbWUgIT09ICdjaGFuZ2UnICYmIGV2ZW50TmFtZSAhPT0gJ2JsdXInKSB7XG4gICAgICAgICAgICBzdXBlci5oYW5kbGVFdmVudCh0aGlzLmlucHV0RWwubmF0aXZlRWxlbWVudCwgZXZlbnROYW1lLCBjYWxsYmFjaywgbG9jYWxzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBoYW5kbGVDaGFuZ2UobmV3VmFsOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsIHt0eXBlOiAnY2hhbmdlJ30sIHRoaXMubmdNb2RlbC52YWxpZCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3RhYmluZGV4Jykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgIH1cbn1cbiJdfQ==