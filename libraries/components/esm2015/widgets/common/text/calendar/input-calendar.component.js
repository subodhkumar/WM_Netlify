import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { registerProps } from './input-calendar.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';
const WIDGET_CONFIG = {
    widgetType: 'wm-input-calendar',
    hostClass: 'app-input-wrapper'
};
export class InputCalendarComponent extends BaseInput {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
    }
}
InputCalendarComponent.initializeProps = registerProps();
InputCalendarComponent.decorators = [
    { type: Component, args: [{
                selector: 'wm-input[type="date"], wm-input[type="datetime-local"], wm-input[type="month"], wm-input[type="time"], wm-input[type="week"]',
                template: "<input class=\"form-control app-textbox\"\n       focus-target\n       role=\"input\"\n       [type]=\"type\"\n       [attr.name]=\"name\"\n       [(ngModel)]=\"datavalue\"\n       [readonly]=\"readonly\"\n       [required]=\"required\"\n       [disabled]=\"disabled\"\n       [min]=\"minvalue\"\n       [max]=\"maxvalue\"\n       [step]=\"step\"\n       [attr.tabindex]=\"tabindex\"\n       [attr.placeholder]=\"placeholder\"\n       [attr.accesskey]=\"shortcutkey\"\n       [autofocus]=\"autofocus\"\n       (blur)=\"handleBlur($event)\"\n       (ngModelChange)=\"handleChange($event)\"\n       [autocomplete]=\"autocomplete ? 'on' : 'off'\"\n       #input>\n",
                providers: [
                    provideAsNgValueAccessor(InputCalendarComponent),
                    provideAsWidgetRef(InputCalendarComponent)
                ]
            }] }
];
/** @nocollapse */
InputCalendarComponent.ctorParameters = () => [
    { type: Injector }
];
InputCalendarComponent.propDecorators = {
    inputEl: [{ type: ViewChild, args: ['input',] }],
    ngModel: [{ type: ViewChild, args: [NgModel,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtY2FsZW5kYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90ZXh0L2NhbGVuZGFyL2lucHV0LWNhbGVuZGFyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRTlGLE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsbUJBQW1CO0lBQy9CLFNBQVMsRUFBRSxtQkFBbUI7Q0FDakMsQ0FBQztBQVVGLE1BQU0sT0FBTyxzQkFBdUIsU0FBUSxTQUFTO0lBb0JqRCxZQUFZLEdBQWE7UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUM5QixDQUFDOztBQXJCTSxzQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVQ1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLDhIQUE4SDtnQkFDeEksaXFCQUE4QztnQkFDOUMsU0FBUyxFQUFFO29CQUNQLHdCQUF3QixDQUFDLHNCQUFzQixDQUFDO29CQUNoRCxrQkFBa0IsQ0FBQyxzQkFBc0IsQ0FBQztpQkFDN0M7YUFDSjs7OztZQXBCK0IsUUFBUTs7O3NCQXNDbkMsU0FBUyxTQUFDLE9BQU87c0JBQ2pCLFNBQVMsU0FBQyxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3RvciwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOZ01vZGVsIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2lucHV0LWNhbGVuZGFyLnByb3BzJztcbmltcG9ydCB7IEJhc2VJbnB1dCB9IGZyb20gJy4uL2Jhc2UvYmFzZS1pbnB1dCc7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWlucHV0LWNhbGVuZGFyJyxcbiAgICBob3N0Q2xhc3M6ICdhcHAtaW5wdXQtd3JhcHBlcidcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnd20taW5wdXRbdHlwZT1cImRhdGVcIl0sIHdtLWlucHV0W3R5cGU9XCJkYXRldGltZS1sb2NhbFwiXSwgd20taW5wdXRbdHlwZT1cIm1vbnRoXCJdLCB3bS1pbnB1dFt0eXBlPVwidGltZVwiXSwgd20taW5wdXRbdHlwZT1cIndlZWtcIl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9pbnB1dC1jYWxlbmRhci5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihJbnB1dENhbGVuZGFyQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKElucHV0Q2FsZW5kYXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBJbnB1dENhbGVuZGFyQ29tcG9uZW50IGV4dGVuZHMgQmFzZUlucHV0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIHJlcXVpcmVkOiBib29sZWFuO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgdHlwZTogc3RyaW5nO1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gICAgcHVibGljIHJlYWRvbmx5OiBzdHJpbmc7XG4gICAgcHVibGljIG1pbnZhbHVlOiBhbnk7XG4gICAgcHVibGljIG1heHZhbHVlOiBhbnk7XG4gICAgcHVibGljIHN0ZXA6IG51bWJlcjtcbiAgICBwdWJsaWMgdGFiaW5kZXg6IGFueTtcbiAgICBwdWJsaWMgcGxhY2Vob2xkZXI6IGFueTtcbiAgICBwdWJsaWMgc2hvcnRjdXRrZXk6IHN0cmluZztcbiAgICBwdWJsaWMgYXV0b2ZvY3VzOiBib29sZWFuO1xuICAgIHB1YmxpYyBhdXRvY29tcGxldGU6IGFueTtcblxuICAgIEBWaWV3Q2hpbGQoJ2lucHV0JykgaW5wdXRFbDogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKE5nTW9kZWwpIG5nTW9kZWw6IE5nTW9kZWw7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgfVxufVxuIl19