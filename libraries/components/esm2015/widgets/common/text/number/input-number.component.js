import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { registerProps } from './input-number.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';
const WIDGET_CONFIG = {
    widgetType: 'wm-input-number',
    hostClass: 'app-input-wrapper'
};
export class InputNumberComponent extends BaseInput {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
    }
    onArrowPress($event) {
        if (this.step === 0) {
            $event.preventDefault();
        }
    }
    validateInputEntry($event) {
        if ($event.key === 'e' && $event.target.value.indexOf($event.key) !== -1) {
            return false;
        }
    }
}
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
InputNumberComponent.ctorParameters = () => [
    { type: Injector }
];
InputNumberComponent.propDecorators = {
    inputEl: [{ type: ViewChild, args: ['input',] }],
    ngModel: [{ type: ViewChild, args: [NgModel,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtbnVtYmVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGV4dC9udW1iZXIvaW5wdXQtbnVtYmVyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDckQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRTlGLE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsaUJBQWlCO0lBQzdCLFNBQVMsRUFBRSxtQkFBbUI7Q0FDakMsQ0FBQztBQVVGLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxTQUFTO0lBcUIvQyxZQUFZLEdBQWE7UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsWUFBWSxDQUFDLE1BQU07UUFDZixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ2xCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUMxQjtJQUNMLENBQUM7SUFFTSxrQkFBa0IsQ0FBQyxNQUFNO1FBQzVCLElBQUksTUFBTSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUN2RSxPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7O0FBbENNLG9DQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBVDVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUseUJBQXlCO2dCQUNuQyxnL0JBQTRDO2dCQUM1QyxTQUFTLEVBQUU7b0JBQ1Asd0JBQXdCLENBQUMsb0JBQW9CLENBQUM7b0JBQzlDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDO2lCQUMzQzthQUNKOzs7O1lBcEIrQixRQUFROzs7c0JBcUNuQyxTQUFTLFNBQUMsT0FBTztzQkFDakIsU0FBUyxTQUFDLE9BQU8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5nTW9kZWwgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vaW5wdXQtbnVtYmVyLnByb3BzJztcbmltcG9ydCB7IEJhc2VJbnB1dCB9IGZyb20gJy4uL2Jhc2UvYmFzZS1pbnB1dCc7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWlucHV0LW51bWJlcicsXG4gICAgaG9zdENsYXNzOiAnYXBwLWlucHV0LXdyYXBwZXInXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3dtLWlucHV0W3R5cGU9XCJudW1iZXJcIl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9pbnB1dC1udW1iZXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IoSW5wdXROdW1iZXJDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoSW5wdXROdW1iZXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBJbnB1dE51bWJlckNvbXBvbmVudCBleHRlbmRzIEJhc2VJbnB1dCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyByZXF1aXJlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgbWF4Y2hhcnM6IG51bWJlcjtcbiAgICBwdWJsaWMgZGlzYWJsZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcbiAgICBwdWJsaWMgcmVhZG9ubHk6IGJvb2xlYW47XG4gICAgcHVibGljIG1pbnZhbHVlOiBudW1iZXI7XG4gICAgcHVibGljIG1heHZhbHVlOiBudW1iZXI7XG4gICAgcHVibGljIHRhYmluZGV4OiBhbnk7XG4gICAgcHVibGljIHBsYWNlaG9sZGVyOiBhbnk7XG4gICAgcHVibGljIHNob3J0Y3V0a2V5OiBzdHJpbmc7XG4gICAgcHVibGljIGF1dG9mb2N1czogYm9vbGVhbjtcbiAgICBwdWJsaWMgYXV0b2NvbXBsZXRlOiBhbnk7XG5cbiAgICBAVmlld0NoaWxkKCdpbnB1dCcpIGlucHV0RWw6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZChOZ01vZGVsKSBuZ01vZGVsOiBOZ01vZGVsO1xuXG4gICAgcHVibGljIHN0ZXA7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgfVxuXG4gICAgb25BcnJvd1ByZXNzKCRldmVudCkge1xuICAgICAgICBpZiAodGhpcy5zdGVwID09PSAwKSB7XG4gICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHZhbGlkYXRlSW5wdXRFbnRyeSgkZXZlbnQpIHtcbiAgICAgICAgaWYgKCRldmVudC5rZXkgPT09ICdlJyAmJiAgJGV2ZW50LnRhcmdldC52YWx1ZS5pbmRleE9mKCRldmVudC5rZXkpICE9PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19