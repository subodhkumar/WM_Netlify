import * as tslib_1 from "tslib";
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { registerProps } from './input-calendar.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';
var WIDGET_CONFIG = {
    widgetType: 'wm-input-calendar',
    hostClass: 'app-input-wrapper'
};
var InputCalendarComponent = /** @class */ (function (_super) {
    tslib_1.__extends(InputCalendarComponent, _super);
    function InputCalendarComponent(inj) {
        return _super.call(this, inj, WIDGET_CONFIG) || this;
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
    InputCalendarComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    InputCalendarComponent.propDecorators = {
        inputEl: [{ type: ViewChild, args: ['input',] }],
        ngModel: [{ type: ViewChild, args: [NgModel,] }]
    };
    return InputCalendarComponent;
}(BaseInput));
export { InputCalendarComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtY2FsZW5kYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90ZXh0L2NhbGVuZGFyL2lucHV0LWNhbGVuZGFyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHekMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUU5RixJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLG1CQUFtQjtJQUMvQixTQUFTLEVBQUUsbUJBQW1CO0NBQ2pDLENBQUM7QUFFRjtJQVE0QyxrREFBUztJQW9CakQsZ0NBQVksR0FBYTtlQUNyQixrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDO0lBQzdCLENBQUM7SUFyQk0sc0NBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBVDVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsOEhBQThIO29CQUN4SSxpcUJBQThDO29CQUM5QyxTQUFTLEVBQUU7d0JBQ1Asd0JBQXdCLENBQUMsc0JBQXNCLENBQUM7d0JBQ2hELGtCQUFrQixDQUFDLHNCQUFzQixDQUFDO3FCQUM3QztpQkFDSjs7OztnQkFwQitCLFFBQVE7OzswQkFzQ25DLFNBQVMsU0FBQyxPQUFPOzBCQUNqQixTQUFTLFNBQUMsT0FBTzs7SUFLdEIsNkJBQUM7Q0FBQSxBQS9CRCxDQVE0QyxTQUFTLEdBdUJwRDtTQXZCWSxzQkFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5nTW9kZWwgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vaW5wdXQtY2FsZW5kYXIucHJvcHMnO1xuaW1wb3J0IHsgQmFzZUlucHV0IH0gZnJvbSAnLi4vYmFzZS9iYXNlLWlucHV0JztcbmltcG9ydCB7IHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20taW5wdXQtY2FsZW5kYXInLFxuICAgIGhvc3RDbGFzczogJ2FwcC1pbnB1dC13cmFwcGVyJ1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd3bS1pbnB1dFt0eXBlPVwiZGF0ZVwiXSwgd20taW5wdXRbdHlwZT1cImRhdGV0aW1lLWxvY2FsXCJdLCB3bS1pbnB1dFt0eXBlPVwibW9udGhcIl0sIHdtLWlucHV0W3R5cGU9XCJ0aW1lXCJdLCB3bS1pbnB1dFt0eXBlPVwid2Vla1wiXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2lucHV0LWNhbGVuZGFyLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKElucHV0Q2FsZW5kYXJDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoSW5wdXRDYWxlbmRhckNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIElucHV0Q2FsZW5kYXJDb21wb25lbnQgZXh0ZW5kcyBCYXNlSW5wdXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgcmVxdWlyZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIGRpc2FibGVkOiBib29sZWFuO1xuICAgIHB1YmxpYyB0eXBlOiBzdHJpbmc7XG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcbiAgICBwdWJsaWMgcmVhZG9ubHk6IHN0cmluZztcbiAgICBwdWJsaWMgbWludmFsdWU6IGFueTtcbiAgICBwdWJsaWMgbWF4dmFsdWU6IGFueTtcbiAgICBwdWJsaWMgc3RlcDogbnVtYmVyO1xuICAgIHB1YmxpYyB0YWJpbmRleDogYW55O1xuICAgIHB1YmxpYyBwbGFjZWhvbGRlcjogYW55O1xuICAgIHB1YmxpYyBzaG9ydGN1dGtleTogc3RyaW5nO1xuICAgIHB1YmxpYyBhdXRvZm9jdXM6IGJvb2xlYW47XG4gICAgcHVibGljIGF1dG9jb21wbGV0ZTogYW55O1xuXG4gICAgQFZpZXdDaGlsZCgnaW5wdXQnKSBpbnB1dEVsOiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoTmdNb2RlbCkgbmdNb2RlbDogTmdNb2RlbDtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICB9XG59XG4iXX0=