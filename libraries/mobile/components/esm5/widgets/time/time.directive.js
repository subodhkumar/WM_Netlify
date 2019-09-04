import { Directive } from '@angular/core';
import { TimeComponent } from '@wm/components';
var TimeDirective = /** @class */ (function () {
    function TimeDirective(timeComponent) {
        timeComponent.useDatapicker = false;
    }
    TimeDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmTime]'
                },] }
    ];
    /** @nocollapse */
    TimeDirective.ctorParameters = function () { return [
        { type: TimeComponent }
    ]; };
    return TimeDirective;
}());
export { TimeDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL3RpbWUvdGltZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUxQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFL0M7SUFLSSx1QkFBWSxhQUE0QjtRQUNwQyxhQUFhLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUN4QyxDQUFDOztnQkFQSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLFVBQVU7aUJBQ3ZCOzs7O2dCQUpRLGFBQWE7O0lBVXRCLG9CQUFDO0NBQUEsQUFSRCxJQVFDO1NBTFksYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBUaW1lQ29tcG9uZW50IH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bVRpbWVdJ1xufSlcbmV4cG9ydCBjbGFzcyBUaW1lRGlyZWN0aXZlIHtcblxuICAgIGNvbnN0cnVjdG9yKHRpbWVDb21wb25lbnQ6IFRpbWVDb21wb25lbnQpIHtcbiAgICAgICAgdGltZUNvbXBvbmVudC51c2VEYXRhcGlja2VyID0gZmFsc2U7XG4gICAgfVxufVxuIl19