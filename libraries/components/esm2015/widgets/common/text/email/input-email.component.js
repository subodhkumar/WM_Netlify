import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { registerProps } from './input-email.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';
const WIDGET_CONFIG = {
    widgetType: 'wm-input-email',
    hostClass: 'app-input-wrapper'
};
export class InputEmailComponent extends BaseInput {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
    }
}
InputEmailComponent.initializeProps = registerProps();
InputEmailComponent.decorators = [
    { type: Component, args: [{
                selector: 'wm-input[type="email"]',
                template: "<input class=\"form-control app-textbox\"\n       focus-target\n       role=\"input\"\n       type=\"email\"\n       [attr.name]=\"name\"\n       [(ngModel)]=\"datavalue\"\n       [ngModelOptions]=\"ngModelOptions\"\n       [readonly]=\"readonly\"\n       [required]=\"required\"\n       [disabled]=\"disabled\"\n       [maxlength]=\"maxchars\"\n       [pattern]=\"regexp\"\n       [attr.tabindex]=\"tabindex\"\n       [attr.placeholder]=\"placeholder\"\n       [attr.accesskey]=\"shortcutkey\"\n       [autofocus]=\"autofocus\"\n       (blur)=\"handleBlur($event)\"\n       (ngModelChange)=\"handleChange($event)\"\n       [autocomplete]=\"autocomplete ? 'on' : 'off'\"\n       (keyup.enter)=\"flushViewChanges(input.value)\"\n       email\n       #input>",
                providers: [
                    provideAsNgValueAccessor(InputEmailComponent),
                    provideAsWidgetRef(InputEmailComponent)
                ]
            }] }
];
/** @nocollapse */
InputEmailComponent.ctorParameters = () => [
    { type: Injector }
];
InputEmailComponent.propDecorators = {
    inputEl: [{ type: ViewChild, args: ['input',] }],
    ngModel: [{ type: ViewChild, args: [NgModel,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtZW1haWwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90ZXh0L2VtYWlsL2lucHV0LWVtYWlsLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRTlGLE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsZ0JBQWdCO0lBQzVCLFNBQVMsRUFBRSxtQkFBbUI7Q0FDakMsQ0FBQztBQVVGLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxTQUFTO0lBa0I5QyxZQUFZLEdBQWE7UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUM5QixDQUFDOztBQW5CTSxtQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVQ1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLHdCQUF3QjtnQkFDbEMsZ3dCQUEyQztnQkFDM0MsU0FBUyxFQUFFO29CQUNQLHdCQUF3QixDQUFDLG1CQUFtQixDQUFDO29CQUM3QyxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQztpQkFDMUM7YUFDSjs7OztZQXBCK0IsUUFBUTs7O3NCQW9DbkMsU0FBUyxTQUFDLE9BQU87c0JBQ2pCLFNBQVMsU0FBQyxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3RvciwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOZ01vZGVsIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2lucHV0LWVtYWlsLnByb3BzJztcbmltcG9ydCB7IEJhc2VJbnB1dCB9IGZyb20gJy4uL2Jhc2UvYmFzZS1pbnB1dCc7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWlucHV0LWVtYWlsJyxcbiAgICBob3N0Q2xhc3M6ICdhcHAtaW5wdXQtd3JhcHBlcidcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnd20taW5wdXRbdHlwZT1cImVtYWlsXCJdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaW5wdXQtZW1haWwuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IoSW5wdXRFbWFpbENvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihJbnB1dEVtYWlsQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgSW5wdXRFbWFpbENvbXBvbmVudCBleHRlbmRzIEJhc2VJbnB1dCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyByZXF1aXJlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgbWF4Y2hhcnM6IG51bWJlcjtcbiAgICBwdWJsaWMgZGlzYWJsZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcbiAgICBwdWJsaWMgcmVhZG9ubHk6IGJvb2xlYW47XG4gICAgcHVibGljIHRhYmluZGV4OiBhbnk7XG4gICAgcHVibGljIHNob3J0Y3V0a2V5OiBzdHJpbmc7XG4gICAgcHVibGljIGF1dG9mb2N1czogYm9vbGVhbjtcbiAgICBwdWJsaWMgYXV0b2NvbXBsZXRlOiBhbnk7XG4gICAgcHVibGljIHJlZ2V4cDogc3RyaW5nO1xuICAgIHB1YmxpYyBwbGFjZWhvbGRlcjogYW55O1xuXG4gICAgQFZpZXdDaGlsZCgnaW5wdXQnKSBpbnB1dEVsOiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoTmdNb2RlbCkgbmdNb2RlbDogTmdNb2RlbDtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICB9XG59XG4iXX0=