import { Directive } from '@angular/core';
import { DateComponent } from '@wm/components';
var DateDirective = /** @class */ (function () {
    function DateDirective(dateComponent) {
        dateComponent.useDatapicker = false;
        dateComponent.datepattern = 'yyyy-MM-dd';
        dateComponent.updateFormat('datepattern');
    }
    DateDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmDate]'
                },] }
    ];
    /** @nocollapse */
    DateDirective.ctorParameters = function () { return [
        { type: DateComponent }
    ]; };
    return DateDirective;
}());
export { DateDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2RhdGUvZGF0ZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUxQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFL0M7SUFLSSx1QkFBWSxhQUE0QjtRQUNwQyxhQUFhLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztRQUNwQyxhQUFhLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQztRQUN6QyxhQUFhLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlDLENBQUM7O2dCQVRKLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsVUFBVTtpQkFDdkI7Ozs7Z0JBSlEsYUFBYTs7SUFZdEIsb0JBQUM7Q0FBQSxBQVZELElBVUM7U0FQWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IERhdGVDb21wb25lbnQgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtRGF0ZV0nXG59KVxuZXhwb3J0IGNsYXNzIERhdGVEaXJlY3RpdmUge1xuXG4gICAgY29uc3RydWN0b3IoZGF0ZUNvbXBvbmVudDogRGF0ZUNvbXBvbmVudCkge1xuICAgICAgICBkYXRlQ29tcG9uZW50LnVzZURhdGFwaWNrZXIgPSBmYWxzZTtcbiAgICAgICAgZGF0ZUNvbXBvbmVudC5kYXRlcGF0dGVybiA9ICd5eXl5LU1NLWRkJztcbiAgICAgICAgZGF0ZUNvbXBvbmVudC51cGRhdGVGb3JtYXQoJ2RhdGVwYXR0ZXJuJyk7XG4gICAgfVxufVxuIl19