import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { registerProps } from './input-color.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';
const WIDGET_CONFIG = {
    widgetType: 'wm-input-color',
    hostClass: 'app-input-wrapper'
};
export class InputColorComponent extends BaseInput {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
    }
}
InputColorComponent.initializeProps = registerProps();
InputColorComponent.decorators = [
    { type: Component, args: [{
                selector: 'wm-input[type="color"]',
                template: "<input class=\"form-control app-textbox\"\n       focus-target\n       type=\"color\"\n       role=\"input\"\n       [attr.name]=\"name\"\n       [(ngModel)]=\"datavalue\"\n       [readonly]=\"readonly\"\n       [required]=\"required\"\n       [disabled]=\"disabled\"\n       [maxlength]=\"maxchars\"\n       [attr.tabindex]=\"tabindex\"\n       [attr.placeholder]=\"placeholder\"\n       [attr.accesskey]=\"shortcutkey\"\n       [autofocus]=\"autofocus\"\n       (blur)=\"handleBlur($event)\"\n       (ngModelChange)=\"handleChange($event)\"\n       #input>",
                providers: [
                    provideAsNgValueAccessor(InputColorComponent),
                    provideAsWidgetRef(InputColorComponent)
                ]
            }] }
];
/** @nocollapse */
InputColorComponent.ctorParameters = () => [
    { type: Injector }
];
InputColorComponent.propDecorators = {
    inputEl: [{ type: ViewChild, args: ['input',] }],
    ngModel: [{ type: ViewChild, args: [NgModel,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtY29sb3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90ZXh0L2NvbG9yL2lucHV0LWNvbG9yLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRTlGLE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsZ0JBQWdCO0lBQzVCLFNBQVMsRUFBRSxtQkFBbUI7Q0FDakMsQ0FBQztBQVVGLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxTQUFTO0lBZTlDLFlBQVksR0FBYTtRQUNyQixLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQzlCLENBQUM7O0FBaEJNLG1DQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBVDVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsd0JBQXdCO2dCQUNsQywwakJBQTJDO2dCQUMzQyxTQUFTLEVBQUU7b0JBQ1Asd0JBQXdCLENBQUMsbUJBQW1CLENBQUM7b0JBQzdDLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDO2lCQUMxQzthQUNKOzs7O1lBcEIrQixRQUFROzs7c0JBaUNuQyxTQUFTLFNBQUMsT0FBTztzQkFDakIsU0FBUyxTQUFDLE9BQU8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5nTW9kZWwgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vaW5wdXQtY29sb3IucHJvcHMnO1xuaW1wb3J0IHsgQmFzZUlucHV0IH0gZnJvbSAnLi4vYmFzZS9iYXNlLWlucHV0JztcbmltcG9ydCB7IHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20taW5wdXQtY29sb3InLFxuICAgIGhvc3RDbGFzczogJ2FwcC1pbnB1dC13cmFwcGVyJ1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd3bS1pbnB1dFt0eXBlPVwiY29sb3JcIl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9pbnB1dC1jb2xvci5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihJbnB1dENvbG9yQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKElucHV0Q29sb3JDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBJbnB1dENvbG9yQ29tcG9uZW50IGV4dGVuZHMgQmFzZUlucHV0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIHJlcXVpcmVkOiBib29sZWFuO1xuICAgIHB1YmxpYyBtYXhjaGFyczogbnVtYmVyO1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gICAgcHVibGljIHJlYWRvbmx5OiBib29sZWFuO1xuICAgIHB1YmxpYyB0YWJpbmRleDogYW55O1xuICAgIHB1YmxpYyBzaG9ydGN1dGtleTogc3RyaW5nO1xuICAgIHB1YmxpYyBhdXRvZm9jdXM6IGJvb2xlYW47XG4gICAgcHVibGljIGRpc2FibGVkOiBib29sZWFuO1xuICAgIHB1YmxpYyBwbGFjZWhvbGRlcjogYW55O1xuICAgIEBWaWV3Q2hpbGQoJ2lucHV0JykgaW5wdXRFbDogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKE5nTW9kZWwpIG5nTW9kZWw6IE5nTW9kZWw7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgfVxufVxuIl19