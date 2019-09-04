import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { registerProps } from './textarea.props';
import { BaseInput } from '../text/base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
const WIDGET_CONFIG = {
    widgetType: 'wm-textarea',
    hostClass: 'app-input-wrapper'
};
export class TextareaComponent extends BaseInput {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
    }
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
TextareaComponent.ctorParameters = () => [
    { type: Injector }
];
TextareaComponent.propDecorators = {
    inputEl: [{ type: ViewChild, args: ['textarea',] }],
    ngModel: [{ type: ViewChild, args: [NgModel,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dGFyZWEuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90ZXh0YXJlYS90ZXh0YXJlYS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFekMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUUzRixNQUFNLGFBQWEsR0FBRztJQUNsQixVQUFVLEVBQUUsYUFBYTtJQUN6QixTQUFTLEVBQUUsbUJBQW1CO0NBQ2pDLENBQUM7QUFVRixNQUFNLE9BQU8saUJBQWtCLFNBQVEsU0FBUztJQWM1QyxZQUFZLEdBQWE7UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUM5QixDQUFDOztBQWZNLGlDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBVDVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsYUFBYTtnQkFDdkIsbXBCQUF3QztnQkFDeEMsU0FBUyxFQUFFO29CQUNQLHdCQUF3QixDQUFDLGlCQUFpQixDQUFDO29CQUMzQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQztpQkFDeEM7YUFDSjs7OztZQW5CK0IsUUFBUTs7O3NCQStCbkMsU0FBUyxTQUFDLFVBQVU7c0JBQ3BCLFNBQVMsU0FBQyxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3RvciwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOZ01vZGVsIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi90ZXh0YXJlYS5wcm9wcyc7XG5pbXBvcnQgeyBCYXNlSW5wdXQgfSBmcm9tICcuLi90ZXh0L2Jhc2UvYmFzZS1pbnB1dCc7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLXRleHRhcmVhJyxcbiAgICBob3N0Q2xhc3M6ICdhcHAtaW5wdXQtd3JhcHBlcidcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnd20tdGV4dGFyZWEnLFxuICAgIHRlbXBsYXRlVXJsOiAnLi90ZXh0YXJlYS5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihUZXh0YXJlYUNvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihUZXh0YXJlYUNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFRleHRhcmVhQ29tcG9uZW50IGV4dGVuZHMgQmFzZUlucHV0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuICAgIHB1YmxpYyByZXF1aXJlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgbWF4Y2hhcnM6IG51bWJlcjtcbiAgICBwdWJsaWMgZGlzYWJsZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcbiAgICBwdWJsaWMgcmVhZG9ubHk6IGJvb2xlYW47XG4gICAgcHVibGljIHRhYmluZGV4OiBhbnk7XG4gICAgcHVibGljIHBsYWNlaG9sZGVyOiBhbnk7XG4gICAgcHVibGljIHNob3J0Y3V0a2V5OiBzdHJpbmc7XG4gICAgcHVibGljIGF1dG9mb2N1czogYm9vbGVhbjtcbiAgICBAVmlld0NoaWxkKCd0ZXh0YXJlYScpIGlucHV0RWw6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZChOZ01vZGVsKSBuZ01vZGVsOiBOZ01vZGVsO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgIH1cbn1cbiJdfQ==