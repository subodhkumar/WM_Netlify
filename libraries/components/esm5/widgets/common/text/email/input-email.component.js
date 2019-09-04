import * as tslib_1 from "tslib";
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { registerProps } from './input-email.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';
var WIDGET_CONFIG = {
    widgetType: 'wm-input-email',
    hostClass: 'app-input-wrapper'
};
var InputEmailComponent = /** @class */ (function (_super) {
    tslib_1.__extends(InputEmailComponent, _super);
    function InputEmailComponent(inj) {
        return _super.call(this, inj, WIDGET_CONFIG) || this;
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
    InputEmailComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    InputEmailComponent.propDecorators = {
        inputEl: [{ type: ViewChild, args: ['input',] }],
        ngModel: [{ type: ViewChild, args: [NgModel,] }]
    };
    return InputEmailComponent;
}(BaseInput));
export { InputEmailComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtZW1haWwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90ZXh0L2VtYWlsL2lucHV0LWVtYWlsLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHekMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUU5RixJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGdCQUFnQjtJQUM1QixTQUFTLEVBQUUsbUJBQW1CO0NBQ2pDLENBQUM7QUFFRjtJQVF5QywrQ0FBUztJQWtCOUMsNkJBQVksR0FBYTtlQUNyQixrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDO0lBQzdCLENBQUM7SUFuQk0sbUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBVDVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsd0JBQXdCO29CQUNsQyxnd0JBQTJDO29CQUMzQyxTQUFTLEVBQUU7d0JBQ1Asd0JBQXdCLENBQUMsbUJBQW1CLENBQUM7d0JBQzdDLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDO3FCQUMxQztpQkFDSjs7OztnQkFwQitCLFFBQVE7OzswQkFvQ25DLFNBQVMsU0FBQyxPQUFPOzBCQUNqQixTQUFTLFNBQUMsT0FBTzs7SUFLdEIsMEJBQUM7Q0FBQSxBQTdCRCxDQVF5QyxTQUFTLEdBcUJqRDtTQXJCWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5nTW9kZWwgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vaW5wdXQtZW1haWwucHJvcHMnO1xuaW1wb3J0IHsgQmFzZUlucHV0IH0gZnJvbSAnLi4vYmFzZS9iYXNlLWlucHV0JztcbmltcG9ydCB7IHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20taW5wdXQtZW1haWwnLFxuICAgIGhvc3RDbGFzczogJ2FwcC1pbnB1dC13cmFwcGVyJ1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd3bS1pbnB1dFt0eXBlPVwiZW1haWxcIl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9pbnB1dC1lbWFpbC5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihJbnB1dEVtYWlsQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKElucHV0RW1haWxDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBJbnB1dEVtYWlsQ29tcG9uZW50IGV4dGVuZHMgQmFzZUlucHV0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIHJlcXVpcmVkOiBib29sZWFuO1xuICAgIHB1YmxpYyBtYXhjaGFyczogbnVtYmVyO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyByZWFkb25seTogYm9vbGVhbjtcbiAgICBwdWJsaWMgdGFiaW5kZXg6IGFueTtcbiAgICBwdWJsaWMgc2hvcnRjdXRrZXk6IHN0cmluZztcbiAgICBwdWJsaWMgYXV0b2ZvY3VzOiBib29sZWFuO1xuICAgIHB1YmxpYyBhdXRvY29tcGxldGU6IGFueTtcbiAgICBwdWJsaWMgcmVnZXhwOiBzdHJpbmc7XG4gICAgcHVibGljIHBsYWNlaG9sZGVyOiBhbnk7XG5cbiAgICBAVmlld0NoaWxkKCdpbnB1dCcpIGlucHV0RWw6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZChOZ01vZGVsKSBuZ01vZGVsOiBOZ01vZGVsO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgIH1cbn1cbiJdfQ==