import { Directive } from '@angular/core';
import { DatetimeComponent } from '@wm/components';
export class DateTimeDirective {
    constructor(dateTimeComponent) {
        dateTimeComponent.useDatapicker = false;
        dateTimeComponent.datepattern = 'yyyy-MM-ddTHH:mm:ss';
        dateTimeComponent.updateFormat('datepattern');
    }
}
DateTimeDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmDateTime]'
            },] }
];
/** @nocollapse */
DateTimeDirective.ctorParameters = () => [
    { type: DatetimeComponent }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS10aW1lLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvZGF0ZS10aW1lL2RhdGUtdGltZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUxQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUtuRCxNQUFNLE9BQU8saUJBQWlCO0lBRTFCLFlBQVksaUJBQW9DO1FBQzVDLGlCQUFpQixDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7UUFDeEMsaUJBQWlCLENBQUMsV0FBVyxHQUFHLHFCQUFxQixDQUFDO1FBQ3RELGlCQUFpQixDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNsRCxDQUFDOzs7WUFUSixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLGNBQWM7YUFDM0I7Ozs7WUFKUSxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgRGF0ZXRpbWVDb21wb25lbnQgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtRGF0ZVRpbWVdJ1xufSlcbmV4cG9ydCBjbGFzcyBEYXRlVGltZURpcmVjdGl2ZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihkYXRlVGltZUNvbXBvbmVudDogRGF0ZXRpbWVDb21wb25lbnQpIHtcbiAgICAgICAgZGF0ZVRpbWVDb21wb25lbnQudXNlRGF0YXBpY2tlciA9IGZhbHNlO1xuICAgICAgICBkYXRlVGltZUNvbXBvbmVudC5kYXRlcGF0dGVybiA9ICd5eXl5LU1NLWRkVEhIOm1tOnNzJztcbiAgICAgICAgZGF0ZVRpbWVDb21wb25lbnQudXBkYXRlRm9ybWF0KCdkYXRlcGF0dGVybicpO1xuICAgIH1cbn1cbiJdfQ==