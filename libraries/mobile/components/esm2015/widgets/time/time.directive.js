import { Directive } from '@angular/core';
import { TimeComponent } from '@wm/components';
export class TimeDirective {
    constructor(timeComponent) {
        timeComponent.useDatapicker = false;
    }
}
TimeDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmTime]'
            },] }
];
/** @nocollapse */
TimeDirective.ctorParameters = () => [
    { type: TimeComponent }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL3RpbWUvdGltZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUxQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFLL0MsTUFBTSxPQUFPLGFBQWE7SUFFdEIsWUFBWSxhQUE0QjtRQUNwQyxhQUFhLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUN4QyxDQUFDOzs7WUFQSixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLFVBQVU7YUFDdkI7Ozs7WUFKUSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFRpbWVDb21wb25lbnQgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtVGltZV0nXG59KVxuZXhwb3J0IGNsYXNzIFRpbWVEaXJlY3RpdmUge1xuXG4gICAgY29uc3RydWN0b3IodGltZUNvbXBvbmVudDogVGltZUNvbXBvbmVudCkge1xuICAgICAgICB0aW1lQ29tcG9uZW50LnVzZURhdGFwaWNrZXIgPSBmYWxzZTtcbiAgICB9XG59XG4iXX0=