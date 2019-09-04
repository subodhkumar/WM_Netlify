import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { registerProps } from './input-text.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';
const WIDGET_CONFIG = {
    widgetType: 'wm-input-text',
    hostClass: 'app-input-wrapper'
};
export class InputTextComponent extends BaseInput {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
    }
    /* Define the property change handler. This function will be triggered when there is a change in the widget property */
    onPropertyChange(key, nv, ov) {
        /*Monitoring changes for styles or properties and accordingly handling respective changes.*/
        switch (key) {
            case 'displayformat':
                this.maskVal = [];
                _.forEach(this.displayformat, (dF) => {
                    // This condition is used to support all numbers from 0-9
                    if (dF === '9') {
                        this.maskVal.push(/\d/);
                    }
                    // This condition is used to support all capital and small alphabets
                    else if (dF === 'A') {
                        this.maskVal.push(/[A-Z, a-z]/);
                    }
                    // This condition is used to support all small alphabets
                    else if (dF === 'a') {
                        this.maskVal.push(/[a-z]/);
                    }
                    // This condition is used to support all characters except new line
                    else if (dF === '*') {
                        this.maskVal.push(/\w/);
                    }
                    else {
                        this.maskVal.push(dF);
                    }
                });
                break;
            default:
                super.onPropertyChange(key, nv, ov);
        }
    }
    get mask() {
        if (this.displayformat) {
            return { mask: this.maskVal, showMask: true };
        }
        else {
            return { mask: false };
        }
    }
}
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
InputTextComponent.ctorParameters = () => [
    { type: Injector }
];
InputTextComponent.propDecorators = {
    inputEl: [{ type: ViewChild, args: ['input',] }],
    ngModel: [{ type: ViewChild, args: [NgModel,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtdGV4dC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RleHQvdGV4dC9pbnB1dC10ZXh0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBSTlGLE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsZUFBZTtJQUMzQixTQUFTLEVBQUUsbUJBQW1CO0NBQ2pDLENBQUM7QUFVRixNQUFNLE9BQU8sa0JBQW1CLFNBQVEsU0FBUztJQXFCN0MsWUFBWSxHQUFhO1FBQ3JCLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELHVIQUF1SDtJQUN2SCxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFDeEIsNEZBQTRGO1FBQzVGLFFBQVEsR0FBRyxFQUFFO1lBQ1QsS0FBSyxlQUFlO2dCQUNoQixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUU7b0JBQ2pDLHlEQUF5RDtvQkFDekQsSUFBSSxFQUFFLEtBQUssR0FBRyxFQUFFO3dCQUNaLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUMzQjtvQkFDRCxvRUFBb0U7eUJBQy9ELElBQUksRUFBRSxLQUFLLEdBQUcsRUFBRTt3QkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7cUJBQ25DO29CQUNELHdEQUF3RDt5QkFDbkQsSUFBSSxFQUFFLEtBQUssR0FBRyxFQUFFO3dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDOUI7b0JBQ0QsbUVBQW1FO3lCQUM5RCxJQUFJLEVBQUUsS0FBSyxHQUFHLEVBQUU7d0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUMzQjt5QkFBTTt3QkFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDekI7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsTUFBTTtZQUNWO2dCQUNJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzNDO0lBQ0wsQ0FBQztJQUVELElBQUksSUFBSTtRQUNKLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNwQixPQUFPLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDO1NBQy9DO2FBQU07WUFDSCxPQUFPLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDO1NBQ3hCO0lBQ0wsQ0FBQzs7QUE5RE0sa0NBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFUNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSw2SUFBNkk7Z0JBQ3ZKLCt3QkFBMEM7Z0JBQzFDLFNBQVMsRUFBRTtvQkFDUCx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUMsa0JBQWtCLENBQUMsa0JBQWtCLENBQUM7aUJBQ3pDO2FBQ0o7Ozs7WUF0QitCLFFBQVE7OztzQkF5Q25DLFNBQVMsU0FBQyxPQUFPO3NCQUNqQixTQUFTLFNBQUMsT0FBTyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5qZWN0b3IsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmdNb2RlbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9pbnB1dC10ZXh0LnByb3BzJztcbmltcG9ydCB7IEJhc2VJbnB1dCB9IGZyb20gJy4uL2Jhc2UvYmFzZS1pbnB1dCc7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20taW5wdXQtdGV4dCcsXG4gICAgaG9zdENsYXNzOiAnYXBwLWlucHV0LXdyYXBwZXInXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3dtLWlucHV0W3R5cGU9XCJ0ZXh0XCJdLCB3bS1pbnB1dDpub3QoW3R5cGVdKSwgd20taW5wdXRbdHlwZT1cInBhc3N3b3JkXCJdLCB3bS1pbnB1dFt0eXBlPVwic2VhcmNoXCJdLCB3bS1pbnB1dFt0eXBlPVwidGVsXCJdLCB3bS1pbnB1dFt0eXBlPVwidXJsXCJdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaW5wdXQtdGV4dC5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihJbnB1dFRleHRDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoSW5wdXRUZXh0Q29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgSW5wdXRUZXh0Q29tcG9uZW50IGV4dGVuZHMgQmFzZUlucHV0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIHJlcXVpcmVkOiBib29sZWFuO1xuICAgIHB1YmxpYyBtYXhjaGFyczogbnVtYmVyO1xuICAgIHB1YmxpYyByZWdleHA6IHN0cmluZztcbiAgICBwdWJsaWMgZGlzcGxheWZvcm1hdDogc3RyaW5nO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgdHlwZTogYW55O1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gICAgcHVibGljIHJlYWRvbmx5OiBib29sZWFuO1xuICAgIHB1YmxpYyB0YWJpbmRleDogYW55O1xuICAgIHB1YmxpYyBwbGFjZWhvbGRlcjogYW55O1xuICAgIHB1YmxpYyBzaG9ydGN1dGtleTogc3RyaW5nO1xuICAgIHB1YmxpYyBhdXRvZm9jdXM6IGJvb2xlYW47XG4gICAgcHVibGljIGF1dG9jb21wbGV0ZTogYW55O1xuICAgIHB1YmxpYyBtYXNrVmFsOiBhbnk7XG5cbiAgICBAVmlld0NoaWxkKCdpbnB1dCcpIGlucHV0RWw6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZChOZ01vZGVsKSBuZ01vZGVsOiBOZ01vZGVsO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgIH1cblxuICAgIC8qIERlZmluZSB0aGUgcHJvcGVydHkgY2hhbmdlIGhhbmRsZXIuIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiB0aGVyZSBpcyBhIGNoYW5nZSBpbiB0aGUgd2lkZ2V0IHByb3BlcnR5ICovXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdikge1xuICAgICAgICAvKk1vbml0b3JpbmcgY2hhbmdlcyBmb3Igc3R5bGVzIG9yIHByb3BlcnRpZXMgYW5kIGFjY29yZGluZ2x5IGhhbmRsaW5nIHJlc3BlY3RpdmUgY2hhbmdlcy4qL1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSAnZGlzcGxheWZvcm1hdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5tYXNrVmFsID0gW107XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuZGlzcGxheWZvcm1hdCwgKGRGKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgY29uZGl0aW9uIGlzIHVzZWQgdG8gc3VwcG9ydCBhbGwgbnVtYmVycyBmcm9tIDAtOVxuICAgICAgICAgICAgICAgICAgICBpZiAoZEYgPT09ICc5Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXNrVmFsLnB1c2goL1xcZC8pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgY29uZGl0aW9uIGlzIHVzZWQgdG8gc3VwcG9ydCBhbGwgY2FwaXRhbCBhbmQgc21hbGwgYWxwaGFiZXRzXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRGID09PSAnQScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFza1ZhbC5wdXNoKC9bQS1aLCBhLXpdLyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBjb25kaXRpb24gaXMgdXNlZCB0byBzdXBwb3J0IGFsbCBzbWFsbCBhbHBoYWJldHNcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZEYgPT09ICdhJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXNrVmFsLnB1c2goL1thLXpdLyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBjb25kaXRpb24gaXMgdXNlZCB0byBzdXBwb3J0IGFsbCBjaGFyYWN0ZXJzIGV4Y2VwdCBuZXcgbGluZVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChkRiA9PT0gJyonKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hc2tWYWwucHVzaCgvXFx3Lyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hc2tWYWwucHVzaChkRik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgbWFzaygpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzcGxheWZvcm1hdCkge1xuICAgICAgICAgICAgcmV0dXJuIHttYXNrOiB0aGlzLm1hc2tWYWwsIHNob3dNYXNrOiB0cnVlfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB7bWFzazogZmFsc2V9O1xuICAgICAgICB9XG4gICAgfVxufVxuIl19