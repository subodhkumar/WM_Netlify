import { Directive } from '@angular/core';
import { DateComponent } from '@wm/components';
export class DateDirective {
    constructor(dateComponent) {
        dateComponent.useDatapicker = false;
        dateComponent.datepattern = 'yyyy-MM-dd';
        dateComponent.updateFormat('datepattern');
    }
}
DateDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmDate]'
            },] }
];
/** @nocollapse */
DateDirective.ctorParameters = () => [
    { type: DateComponent }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2RhdGUvZGF0ZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUxQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFLL0MsTUFBTSxPQUFPLGFBQWE7SUFFdEIsWUFBWSxhQUE0QjtRQUNwQyxhQUFhLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztRQUNwQyxhQUFhLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQztRQUN6QyxhQUFhLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlDLENBQUM7OztZQVRKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsVUFBVTthQUN2Qjs7OztZQUpRLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgRGF0ZUNvbXBvbmVudCB9IGZyb20gJ0B3bS9jb21wb25lbnRzJztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21EYXRlXSdcbn0pXG5leHBvcnQgY2xhc3MgRGF0ZURpcmVjdGl2ZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihkYXRlQ29tcG9uZW50OiBEYXRlQ29tcG9uZW50KSB7XG4gICAgICAgIGRhdGVDb21wb25lbnQudXNlRGF0YXBpY2tlciA9IGZhbHNlO1xuICAgICAgICBkYXRlQ29tcG9uZW50LmRhdGVwYXR0ZXJuID0gJ3l5eXktTU0tZGQnO1xuICAgICAgICBkYXRlQ29tcG9uZW50LnVwZGF0ZUZvcm1hdCgnZGF0ZXBhdHRlcm4nKTtcbiAgICB9XG59XG4iXX0=