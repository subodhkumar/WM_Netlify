import { Directive } from '@angular/core';
import { DatetimeComponent } from '@wm/components';
var DateTimeDirective = /** @class */ (function () {
    function DateTimeDirective(dateTimeComponent) {
        dateTimeComponent.useDatapicker = false;
        dateTimeComponent.datepattern = 'yyyy-MM-ddTHH:mm:ss';
        dateTimeComponent.updateFormat('datepattern');
    }
    DateTimeDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmDateTime]'
                },] }
    ];
    /** @nocollapse */
    DateTimeDirective.ctorParameters = function () { return [
        { type: DatetimeComponent }
    ]; };
    return DateTimeDirective;
}());
export { DateTimeDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS10aW1lLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvZGF0ZS10aW1lL2RhdGUtdGltZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUxQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVuRDtJQUtJLDJCQUFZLGlCQUFvQztRQUM1QyxpQkFBaUIsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1FBQ3hDLGlCQUFpQixDQUFDLFdBQVcsR0FBRyxxQkFBcUIsQ0FBQztRQUN0RCxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDbEQsQ0FBQzs7Z0JBVEosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxjQUFjO2lCQUMzQjs7OztnQkFKUSxpQkFBaUI7O0lBWTFCLHdCQUFDO0NBQUEsQUFWRCxJQVVDO1NBUFksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IERhdGV0aW1lQ29tcG9uZW50IH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bURhdGVUaW1lXSdcbn0pXG5leHBvcnQgY2xhc3MgRGF0ZVRpbWVEaXJlY3RpdmUge1xuXG4gICAgY29uc3RydWN0b3IoZGF0ZVRpbWVDb21wb25lbnQ6IERhdGV0aW1lQ29tcG9uZW50KSB7XG4gICAgICAgIGRhdGVUaW1lQ29tcG9uZW50LnVzZURhdGFwaWNrZXIgPSBmYWxzZTtcbiAgICAgICAgZGF0ZVRpbWVDb21wb25lbnQuZGF0ZXBhdHRlcm4gPSAneXl5eS1NTS1kZFRISDptbTpzcyc7XG4gICAgICAgIGRhdGVUaW1lQ29tcG9uZW50LnVwZGF0ZUZvcm1hdCgnZGF0ZXBhdHRlcm4nKTtcbiAgICB9XG59XG4iXX0=