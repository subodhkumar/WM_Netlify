import { ChangeDetectorRef, Component, Inject, Injector, NgZone, ViewChild } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { BsDatepickerDirective, TimepickerComponent } from 'ngx-bootstrap';
import { addClass, addEventListenerOnElement, adjustContainerPosition, AppDefaults, FormWidgetType, getDateObj, getDisplayDateTimeFormat, getFormattedDate, getNativeDateObject } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './date-time.props';
import { provideAsNgValidators, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { BaseDateTimeComponent } from '../base/base-date-time.component';
const DEFAULT_CLS = 'app-datetime input-group';
const WIDGET_CONFIG = { widgetType: 'wm-datetime', hostClass: DEFAULT_CLS };
const CURRENT_DATE = 'CURRENT_DATE';
export class DatetimeComponent extends BaseDateTimeComponent {
    constructor(inj, ngZone, cdRef, appDefaults, evtMngrPlugins) {
        super(inj, WIDGET_CONFIG);
        this.ngZone = ngZone;
        this.cdRef = cdRef;
        this.appDefaults = appDefaults;
        this.isEnterPressedOnDateInput = false;
        /**
         * This property checks if the timePicker is Open
         */
        this.isTimeOpen = false;
        /**
         * This property checks if the datePicker is Open
         */
        this.isDateOpen = false;
        /**
         * This property is set to TRUE if the time component value is set to CURRENT_TIME; In this case the timer keeps changing the time value until the widget is available.
         */
        this.isCurrentDate = false;
        this._debouncedOnChange = _.debounce(this.invokeOnChange, 10);
        this.registerDestroyListener(() => this.clearTimeInterval());
        styler(this.nativeElement, this);
        // KeyEventsPlugin
        this.keyEventPlugin = evtMngrPlugins[1];
        this.dateContainerCls = `app-date-${this.widgetId}`;
        this._dateOptions.containerClass = `app-date ${this.dateContainerCls}`;
        this._dateOptions.showWeekNumbers = false;
        this.datepattern = this.appDefaults.dateTimeFormat || getDisplayDateTimeFormat(FormWidgetType.DATETIME);
        this.updateFormat('datepattern');
    }
    get timestamp() {
        return this.proxyModel ? this.proxyModel.valueOf() : undefined;
    }
    /**
     * The displayValue is the display value of the bsDateTimeValue after applying the datePattern on it.
     * @returns {any|string}
     */
    get displayValue() {
        return getFormattedDate(this.datePipe, this.proxyModel, this._dateOptions.dateInputFormat) || '';
    }
    get datavalue() {
        if (this.isCurrentDate && !this.proxyModel) {
            return CURRENT_DATE;
        }
        return getFormattedDate(this.datePipe, this.proxyModel, this.outputformat);
    }
    /**Todo[Shubham]: needs to be redefined
     * This property sets the default value for the date selection
     */
    set datavalue(newVal) {
        if (newVal === CURRENT_DATE) {
            this.isCurrentDate = true;
            this.setTimeInterval();
        }
        else {
            this.proxyModel = newVal ? getDateObj(newVal) : undefined;
            this.clearTimeInterval();
            this.isCurrentDate = false;
        }
        this.bsTimeValue = this.bsDateValue = this.proxyModel;
        this.cdRef.detectChanges();
    }
    /**
     * This is an internal method used to maintain a time interval to update the time model when the data value is set to CURRENT_TIME
     */
    setTimeInterval() {
        if (this.timeinterval) {
            return;
        }
        this.timeinterval = setInterval(() => {
            const currentTime = new Date();
            this.onModelUpdate(currentTime);
        }, 1000);
    }
    /**
     * This is an internal method used to clear the time interval created
     */
    clearTimeInterval() {
        if (this.timeinterval) {
            clearInterval(this.timeinterval);
            this.timeinterval = null;
        }
    }
    /**
     * This is an internal method to toggle the time picker
     */
    toggleTimePicker(newVal, $event) {
        this.isTimeOpen = newVal;
        if ($event && $event.type === 'click') {
            this.invokeEventCallback('click', { $event: $event });
        }
        this.addTimepickerClickListener(this.isTimeOpen);
    }
    addTimepickerClickListener(skipListener) {
        if (!skipListener) {
            return;
        }
        const bodyElement = document.querySelector('body');
        setTimeout(() => {
            const dropdownElement = $(bodyElement).find('>bs-dropdown-container .dropdown-menu').get(0);
            this.deregisterTimepickeEventListener = addEventListenerOnElement(bodyElement, dropdownElement, this.nativeElement, 'click', this.isDropDownDisplayEnabledOnInput(this.showdropdownon), () => {
                this.toggleTimePicker(false);
            }, 0 /* ONCE */, true);
        }, 350);
    }
    /**
     * This function sets the value isOpen/isTimeOpen (i.e when datepicker popup is closed) based on widget type(i.e  DateTime, Time)
     * @param val - isOpen/isTimeOpen is set based on the timepicker popup is open/closed
     */
    setIsTimeOpen(val) {
        this.isTimeOpen = val;
    }
    hideTimepickerDropdown() {
        this.invokeOnTouched();
        this.toggleTimePicker(false);
        if (this.deregisterTimepickeEventListener) {
            this.deregisterTimepickeEventListener();
        }
    }
    /**
     * This is an internal method to add a click listener once the time dropdown is open
     */
    onTimepickerOpen() {
        // adding class for time widget dropdown menu
        const tpElements = document.querySelectorAll('timepicker');
        _.forEach(tpElements, (element) => {
            addClass(element.parentElement, 'app-datetime', true);
        });
        this.bsDatePickerDirective.hide();
        this.focusTimePickerPopover(this);
        this.bindTimePickerKeyboardEvents();
        adjustContainerPosition($('bs-dropdown-container'), this.nativeElement, this.bsDropdown._dropdown, $('bs-dropdown-container .dropdown-menu'));
    }
    onDatePickerOpen() {
        this.isDateOpen = !this.isDateOpen;
        this.toggleTimePicker(false);
        this.bsDateValue ? this.activeDate = this.bsDateValue : this.activeDate = new Date();
        if (!this.bsDateValue) {
            this.hightlightToday();
        }
        this.addDatepickerKeyboardEvents(this, true);
        adjustContainerPosition($('bs-datepicker-container'), this.nativeElement, this.bsDatePickerDirective._datepicker);
    }
    /**
     * This is an internal method to update the model
     */
    onModelUpdate(newVal, type) {
        if (type === 'date') {
            this.invalidDateTimeFormat = false;
            if (getFormattedDate(this.datePipe, newVal, this._dateOptions.dateInputFormat) === this.displayValue) {
                $(this.nativeElement).find('.display-input').val(this.displayValue);
            }
        }
        // min date and max date validation in web.
        // if invalid dates are entered, device is showing validation message.
        this.minDateMaxDateValidationOnInput(newVal);
        if (!newVal) {
            // Set timevalue as 00:00:00 if we remove any one from hours/minutes/seconds field in timepicker after selecting date
            if (this.bsDateValue && this.bsTimePicker && (this.bsTimePicker.hours === '' || this.bsTimePicker.minutes === '' || this.bsTimePicker.seconds === '')) {
                this.bsDateValue = this.bsTimeValue = this.proxyModel = moment(this.bsDateValue).startOf('day').toDate();
            }
            else {
                this.bsDateValue = this.bsTimeValue = this.proxyModel = undefined;
            }
            this._debouncedOnChange(this.datavalue, {}, true);
            return;
        }
        if (type === 'date') {
            if (this.isDateOpen) {
                this.toggleTimePicker(true);
            }
        }
        this.proxyModel = newVal;
        if (this.proxyModel) {
            this.bsDateValue = this.bsTimeValue = this.proxyModel;
        }
        this._debouncedOnChange(this.datavalue, {}, true);
        this.cdRef.detectChanges();
    }
    /**
     * This is an internal method used to Prevent time picker close while changing time value
     */
    preventTpClose($event) {
        $event.stopImmediatePropagation();
    }
    /**
     * This is an internal method used to toggle the dropdown of the date widget
     */
    toggleDpDropdown($event) {
        if ($event.type === 'click') {
            this.invokeEventCallback('click', { $event: $event });
        }
        if ($event.target && $($event.target).is('input') && !(this.isDropDownDisplayEnabledOnInput(this.showdropdownon))) {
            $event.stopPropagation();
            return;
        }
        this.bsDatePickerDirective.toggle();
        this.addBodyClickListener(this.bsDatePickerDirective.isOpen);
    }
    addBodyClickListener(skipListener) {
        if (!skipListener) {
            return;
        }
        const bodyElement = document.querySelector('body');
        setTimeout(() => {
            const bsDateContainerElement = bodyElement.querySelector(`.${this.dateContainerCls}`);
            this.deregisterDatepickerEventListener = addEventListenerOnElement(bodyElement, bsDateContainerElement, this.nativeElement, 'click', this.isDropDownDisplayEnabledOnInput(this.showdropdownon), () => {
                this.bsDatePickerDirective.hide();
            }, 0 /* ONCE */, true);
        }, 350);
    }
    hideDatepickerDropdown() {
        this.isDateOpen = false;
        this.invokeOnTouched();
        this.bsDatePickerDirective.hide();
        this.isEnterPressedOnDateInput = false;
        if (this.deregisterDatepickerEventListener) {
            this.deregisterDatepickerEventListener();
        }
    }
    onDateChange($event, isNativePicker) {
        if (this.isEnterPressedOnDateInput) {
            this.isEnterPressedOnDateInput = false;
            return;
        }
        let newVal = $event.target.value.trim();
        newVal = newVal ? getNativeDateObject(newVal) : undefined;
        // datetime pattern validation
        // if invalid pattern is entered, device is showing an error.
        if (!this.formatValidation(newVal, $event.target.value, isNativePicker)) {
            return;
        }
        // min date and max date validation in mobile view.
        // if invalid dates are entered, device is showing an alert.
        if (isNativePicker && this.minDateMaxDateValidationOnInput(newVal, $event, this.displayValue, isNativePicker)) {
            return;
        }
        this.invalidDateTimeFormat = false;
        this.onModelUpdate(newVal);
    }
    /**
     * This is an internal method triggered when pressing key on the datetime input
     */
    onDisplayKeydown(event) {
        if (this.isDropDownDisplayEnabledOnInput(this.showdropdownon)) {
            event.stopPropagation();
            let newVal = event.target.value.trim();
            newVal = newVal ? getNativeDateObject(newVal) : undefined;
            const action = this.keyEventPlugin.constructor.getEventFullKey(event);
            if (action === 'enter' || action === 'arrowdown') {
                event.preventDefault();
                const formattedDate = getFormattedDate(this.datePipe, newVal, this._dateOptions.dateInputFormat);
                const inputVal = event.target.value.trim();
                if (inputVal && this.datepattern === 'timestamp') {
                    if (!_.isNaN(inputVal) && _.parseInt(inputVal) !== formattedDate) {
                        this.invalidDateTimeFormat = true;
                        this.invokeOnChange(this.datavalue, event, false);
                    }
                }
                else if (inputVal && inputVal !== formattedDate) {
                    this.invalidDateTimeFormat = true;
                    this.invokeOnChange(this.datavalue, event, false);
                }
                else {
                    this.invalidDateTimeFormat = false;
                    this.isEnterPressedOnDateInput = true;
                    this.bsDatePickerDirective.bsValue = newVal;
                }
                this.toggleDpDropdown(event);
            }
            else {
                this.hideDatepickerDropdown();
                this.hideTimepickerDropdown();
            }
        }
        else {
            this.hideDatepickerDropdown();
            this.hideTimepickerDropdown();
        }
    }
    isValid(event) {
        if (!event) {
            const enteredDate = $(this.nativeElement).find('input').val();
            const newVal = getNativeDateObject(enteredDate);
            if (!this.formatValidation(newVal, enteredDate)) {
                return;
            }
        }
    }
    // change and blur events are added from the template
    handleEvent(node, eventName, callback, locals) {
        if (!_.includes(['blur', 'focus', 'change', 'click'], eventName)) {
            super.handleEvent(node, eventName, callback, locals);
        }
    }
    onInputBlur($event) {
        if (!$($event.relatedTarget).hasClass('current-date')) {
            this.invokeOnTouched();
            this.invokeEventCallback('blur', { $event });
        }
    }
}
DatetimeComponent.initializeProps = registerProps();
DatetimeComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmDateTime]',
                template: "<ng-container *ngIf=\"useDatapicker; then dataPickerTemplate else nativeDateTemplate\"></ng-container>\n\n<ng-template #dataPickerTemplate>\n    <div dropdown [isOpen]=\"isTimeOpen\" autoClose=\"false\" [container]=\"'body'\" (onShown)=\"onTimepickerOpen()\"\n         style=\"display: inherit;\">\n        <input class=\"form-control app-textbox display-input\" aria-label=\"Set the date and time\"\n               focus-target\n               [name]=\"name\"\n               [tabindex]=\"tabindex\"\n               type=\"text\"\n               [value]=\"displayValue\"\n               (click)=\"toggleDpDropdown($event)\"\n               (focus)=\"invokeOnFocus($event)\"\n               (blur)=\"onInputBlur($event)\"\n               (change)=\"onDateChange($event)\"\n               [autofocus]=\"autofocus\"\n               [disabled]=\"disabled || readonly || isCurrentDate\"\n               [required]=\"required\"\n               [attr.placeholder]=\"placeholder\"\n               [attr.accesskey]=\"shortcutkey\"\n               (keydown)=\"onDisplayKeydown($event)\">\n        <div style=\"width: 0;display: inline-block;\" aria-label=\"datepicker dropdownmenu\" aria-controls=\"date\">\n            <input class=\"model-holder\"\n                   focus-target\n                   [container]=\"'body'\"\n                   [bsConfig]=\"_dateOptions\"\n                   [isOpen]=\"isDateOpen\"\n                   (onShown)=\"onDatePickerOpen()\"\n                   (onHidden)=\"hideDatepickerDropdown()\"\n                   #datepicker=bsDatepicker\n                   bsDatepicker\n                   [isDisabled]=\"disabled || readonly || isCurrentDate\"\n                   [bsValue]=\"bsDateValue\"\n                   (bsValueChange)=\"onModelUpdate($event, 'date')\">\n        </div>\n        <span class=\"input-group-btn\">\n            <button type=\"button\" class=\"btn btn-default btn-date\"\n                    [tabindex]=\"tabindex\" [disabled]=\"disabled || readonly || isCurrentDate\" aria-label=\"Select date\" aria-haspopup=\"true\"\n                    aria-expanded=\"false\" (click)=\"toggleDpDropdown($event)\">\n                <i aria-hidden=\"true\" class=\"app-icon wi wi-calendar\"></i>\n            </button>\n            <button type=\"button\" class=\"btn btn-default btn-time\"\n                    [tabindex]=\"tabindex\" [disabled]=\"disabled || readonly || isCurrentDate\" aria-label=\"Select time\" aria-haspopup=\"true\"\n                    aria-expanded=\"false\" (click)=\"toggleTimePicker(!isTimeOpen, $event)\">\n                <i aria-hidden=\"true\" class=\"app-icon wi wi-access-time\"></i>\n            </button>\n        </span>\n        <div *dropdownMenu class=\"dropdown-menu\" aria-label=\"timepicker dropdown\" aria-controls=\"time\"\n             (click)=\"preventTpClose($event)\">\n            <timepicker class=\"model-holder\"\n                        [showMeridian]=\"ismeridian\"\n                        [readonlyInput]=\"disabled || readonly || isCurrentDate\"\n                        [(ngModel)]=\"bsTimeValue\"\n                        [min]=\"minTime\"\n                        [max]=\"maxTime\"\n                        [hourStep]=\"hourstep\"\n                        [minuteStep]=\"minutestep\"\n                        [secondsStep]=\"secondsstep\"\n                        [mousewheel]=\"true\"\n                        [arrowkeys]=\"true\"\n                        (isValid)=\"isValid($event)\"\n                        [showSeconds]=\"showseconds\" (ngModelChange)=\"onModelUpdate($event, 'time')\"></timepicker>\n        </div>\n    </div>\n</ng-template>\n<ng-template #nativeDateTemplate>\n    <input type=\"datetime-local\" class=\"form-control app-textbox\"\n           role=\"input\"\n           step=\"any\"\n           [value]=\"displayValue\"\n           [required]=\"required\"\n           [disabled]=\"disabled || readonly || isCurrentDate\"\n           (change)=\"onDateChange($event, true)\">\n</ng-template>\n",
                providers: [
                    provideAsNgValueAccessor(DatetimeComponent),
                    provideAsNgValidators(DatetimeComponent),
                    provideAsWidgetRef(DatetimeComponent)
                ]
            }] }
];
/** @nocollapse */
DatetimeComponent.ctorParameters = () => [
    { type: Injector },
    { type: NgZone },
    { type: ChangeDetectorRef },
    { type: AppDefaults },
    { type: undefined, decorators: [{ type: Inject, args: [EVENT_MANAGER_PLUGINS,] }] }
];
DatetimeComponent.propDecorators = {
    bsDatePickerDirective: [{ type: ViewChild, args: [BsDatepickerDirective,] }],
    bsTimePicker: [{ type: ViewChild, args: [TimepickerComponent,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS10aW1lLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZGF0ZS10aW1lL2RhdGUtdGltZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQWEsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVILE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRWxFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzRSxPQUFPLEVBQUUsUUFBUSxFQUFFLHlCQUF5QixFQUFFLHVCQUF1QixFQUFFLFdBQVcsRUFBYyxjQUFjLEVBQUUsVUFBVSxFQUFFLHdCQUF3QixFQUFFLGdCQUFnQixFQUFFLG1CQUFtQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTlNLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbEQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLHdCQUF3QixFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDbEgsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFJekUsTUFBTSxXQUFXLEdBQUcsMEJBQTBCLENBQUM7QUFDL0MsTUFBTSxhQUFhLEdBQUcsRUFBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQUUxRSxNQUFNLFlBQVksR0FBRyxjQUFjLENBQUM7QUFXcEMsTUFBTSxPQUFPLGlCQUFrQixTQUFRLHFCQUFxQjtJQStFeEQsWUFDSSxHQUFhLEVBQ0wsTUFBYyxFQUNkLEtBQXdCLEVB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Q1Y7U0FDSjtJQUNMLENBQUM7SUFFRCxxREFBcUQ7SUFDM0MsV0FBVyxDQUFDLElBQWlCLEVBQUUsU0FBaUIsRUFBRSxRQUFrQixFQUFFLE1BQVc7UUFDdkYsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRTtZQUM5RCxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3hEO0lBQ0wsQ0FBQztJQUVELFdBQVcsQ0FBQyxNQUFNO1FBQ2QsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ25ELElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQztTQUM5QztJQUNMLENBQUM7O0FBN1ZNLGlDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBVjVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsY0FBYztnQkFDeEIsMDdIQUF5QztnQkFDekMsU0FBUyxFQUFFO29CQUNQLHdCQUF3QixDQUFDLGlCQUFpQixDQUFDO29CQUMzQyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQztvQkFDeEMsa0JBQWtCLENBQUMsaUJBQWlCLENBQUM7aUJBQ3hDO2FBQ0o7Ozs7WUEzQjZELFFBQVE7WUFBRSxNQUFNO1lBQXRELGlCQUFpQjtZQUs4QixXQUFXOzRDQTJHekUsTUFBTSxTQUFDLHFCQUFxQjs7O29DQXZEaEMsU0FBUyxTQUFDLHFCQUFxQjsyQkFDL0IsU0FBUyxTQUFDLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnQsIEluamVjdCwgSW5qZWN0b3IsIE5nWm9uZSwgT25EZXN0cm95LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEVWRU5UX01BTkFHRVJfUExVR0lOUyB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG5pbXBvcnQgeyBCc0RhdGVwaWNrZXJEaXJlY3RpdmUsIFRpbWVwaWNrZXJDb21wb25lbnQgfSBmcm9tICduZ3gtYm9vdHN0cmFwJztcblxuaW1wb3J0IHsgYWRkQ2xhc3MsIGFkZEV2ZW50TGlzdGVuZXJPbkVsZW1lbnQsIGFkanVzdENvbnRhaW5lclBvc2l0aW9uLCBBcHBEZWZhdWx0cywgRVZFTlRfTElGRSwgRm9ybVdpZGdldFR5cGUsIGdldERhdGVPYmosIGdldERpc3BsYXlEYXRlVGltZUZvcm1hdCwgZ2V0Rm9ybWF0dGVkRGF0ZSwgZ2V0TmF0aXZlRGF0ZU9iamVjdCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9kYXRlLXRpbWUucHJvcHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzTmdWYWxpZGF0b3JzLCBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBCYXNlRGF0ZVRpbWVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL2Jhc2UtZGF0ZS10aW1lLmNvbXBvbmVudCc7XG5cbmRlY2xhcmUgY29uc3QgbW9tZW50LCAkLCBfO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtZGF0ZXRpbWUgaW5wdXQtZ3JvdXAnO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tZGF0ZXRpbWUnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuY29uc3QgQ1VSUkVOVF9EQVRFID0gJ0NVUlJFTlRfREFURSc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtRGF0ZVRpbWVdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vZGF0ZS10aW1lLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKERhdGV0aW1lQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzTmdWYWxpZGF0b3JzKERhdGV0aW1lQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKERhdGV0aW1lQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgRGF0ZXRpbWVDb21wb25lbnQgZXh0ZW5kcyBCYXNlRGF0ZVRpbWVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG4gICAgLyoqXG4gICAgICogVGhlIGJlbG93IHByb3BldGllcyBwcmVmaXhlZCB3aXRoIFwiYnNcIiBhbHdheXMgaG9sZHMgdGhlIHZhbHVlIHRoYXQgaXMgc2VsZWN0ZWQgZnJvbSB0aGUgZGF0ZXBpY2tlci5cbiAgICAgKiBUaGUgYnNEYXRlVGltZVZhbHVlID0gYnNEYXRlVmFsdWUgKyBic1RpbWVWYWx1ZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGJzRGF0ZVRpbWVWYWx1ZTogYW55O1xuICAgIHByaXZhdGUgYnNEYXRlVmFsdWU7XG4gICAgcHJpdmF0ZSBic1RpbWVWYWx1ZTtcbiAgICBwcml2YXRlIHByb3h5TW9kZWw7XG5cbiAgICBwdWJsaWMgc2hvd2Ryb3Bkb3dub246IHN0cmluZztcbiAgICBwcml2YXRlIGtleUV2ZW50UGx1Z2luO1xuICAgIHByaXZhdGUgZGVyZWdpc3RlckRhdGVwaWNrZXJFdmVudExpc3RlbmVyO1xuICAgIHByaXZhdGUgZGVyZWdpc3RlclRpbWVwaWNrZUV2ZW50TGlzdGVuZXI7XG4gICAgcHJpdmF0ZSBpc0VudGVyUHJlc3NlZE9uRGF0ZUlucHV0ID0gZmFsc2U7XG5cbiAgICBnZXQgdGltZXN0YW1wKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm94eU1vZGVsID8gdGhpcy5wcm94eU1vZGVsLnZhbHVlT2YoKSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGlzcGxheVZhbHVlIGlzIHRoZSBkaXNwbGF5IHZhbHVlIG9mIHRoZSBic0RhdGVUaW1lVmFsdWUgYWZ0ZXIgYXBwbHlpbmcgdGhlIGRhdGVQYXR0ZXJuIG9uIGl0LlxuICAgICAqIEByZXR1cm5zIHthbnl8c3RyaW5nfVxuICAgICAqL1xuICAgIGdldCBkaXNwbGF5VmFsdWUoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIGdldEZvcm1hdHRlZERhdGUodGhpcy5kYXRlUGlwZSwgdGhpcy5wcm94eU1vZGVsLCB0aGlzLl9kYXRlT3B0aW9ucy5kYXRlSW5wdXRGb3JtYXQpIHx8ICcnO1xuICAgIH1cblxuICAgIEBWaWV3Q2hpbGQoQnNEYXRlcGlja2VyRGlyZWN0aXZlKSBic0RhdGVQaWNrZXJEaXJlY3RpdmU7XG4gICAgQFZpZXdDaGlsZChUaW1lcGlja2VyQ29tcG9uZW50KSBic1RpbWVQaWNrZXI7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHByb3BlcnR5IGNoZWNrcyBpZiB0aGUgdGltZVBpY2tlciBpcyBPcGVuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc1RpbWVPcGVuID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHByb3BlcnR5IGNoZWNrcyBpZiB0aGUgZGF0ZVBpY2tlciBpcyBPcGVuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc0RhdGVPcGVuID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHRpbWVpbnRlcnZhbCBpcyB1c2VkIHRvIHJ1biB0aGUgdGltZXIgd2hlbiB0aGUgdGltZSBjb21wb25lbnQgdmFsdWUgaXMgc2V0IHRvIENVUlJFTlRfVElNRSBpbiBwcm9wZXJ0aWVzIHBhbmVsLlxuICAgICAqL1xuICAgIHByaXZhdGUgdGltZWludGVydmFsOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHByb3BlcnR5IGlzIHNldCB0byBUUlVFIGlmIHRoZSB0aW1lIGNvbXBvbmVudCB2YWx1ZSBpcyBzZXQgdG8gQ1VSUkVOVF9USU1FOyBJbiB0aGlzIGNhc2UgdGhlIHRpbWVyIGtlZXBzIGNoYW5naW5nIHRoZSB0aW1lIHZhbHVlIHVudGlsIHRoZSB3aWRnZXQgaXMgYXZhaWxhYmxlLlxuICAgICAqL1xuICAgIHByaXZhdGUgaXNDdXJyZW50RGF0ZSA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfZGVib3VuY2VkT25DaGFuZ2U6IEZ1bmN0aW9uID0gIF8uZGVib3VuY2UodGhpcy5pbnZva2VPbkNoYW5nZSwgMTApO1xuXG4gICAgcHJpdmF0ZSBkYXRlQ29udGFpbmVyQ2xzOiBzdHJpbmc7XG5cbiAgICBnZXQgZGF0YXZhbHVlKCk6IGFueSB7XG4gICAgICAgIGlmICh0aGlzLmlzQ3VycmVudERhdGUgJiYgIXRoaXMucHJveHlNb2RlbCkge1xuICAgICAgICAgICAgcmV0dXJuIENVUlJFTlRfREFURTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2V0Rm9ybWF0dGVkRGF0ZSh0aGlzLmRhdGVQaXBlLCB0aGlzLnByb3h5TW9kZWwsIHRoaXMub3V0cHV0Zm9ybWF0KTtcbiAgICB9XG5cbiAgICAvKipUb2RvW1NodWJoYW1dOiBuZWVkcyB0byBiZSByZWRlZmluZWRcbiAgICAgKiBUaGlzIHByb3BlcnR5IHNldHMgdGhlIGRlZmF1bHQgdmFsdWUgZm9yIHRoZSBkYXRlIHNlbGVjdGlvblxuICAgICAqL1xuICAgIHNldCBkYXRhdmFsdWUobmV3VmFsOiBhbnkpIHtcbiAgICAgICAgaWYgKG5ld1ZhbCA9PT0gQ1VSUkVOVF9EQVRFKSB7XG4gICAgICAgICAgICB0aGlzLmlzQ3VycmVudERhdGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zZXRUaW1lSW50ZXJ2YWwoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHJveHlNb2RlbCA9IG5ld1ZhbCA/IGdldERhdGVPYmoobmV3VmFsKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lSW50ZXJ2YWwoKTtcbiAgICAgICAgICAgIHRoaXMuaXNDdXJyZW50RGF0ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnNUaW1lVmFsdWUgPSB0aGlzLmJzRGF0ZVZhbHVlID0gdGhpcy5wcm94eU1vZGVsO1xuICAgICAgICB0aGlzLmNkUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgICAgcHJpdmF0ZSBjZFJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgIHByaXZhdGUgYXBwRGVmYXVsdHM6IEFwcERlZmF1bHRzLFxuICAgICAgICBASW5qZWN0KEVWRU5UX01BTkFHRVJfUExVR0lOUykgZXZ0TW5nclBsdWdpbnNcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiB0aGlzLmNsZWFyVGltZUludGVydmFsKCkpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICAgICAgLy8gS2V5RXZlbnRzUGx1Z2luXG4gICAgICAgIHRoaXMua2V5RXZlbnRQbHVnaW4gPSBldnRNbmdyUGx1Z2luc1sxXTtcbiAgICAgICAgdGhpcy5kYXRlQ29udGFpbmVyQ2xzID0gYGFwcC1kYXRlLSR7dGhpcy53aWRnZXRJZH1gO1xuICAgICAgICB0aGlzLl9kYXRlT3B0aW9ucy5jb250YWluZXJDbGFzcyA9IGBhcHAtZGF0ZSAke3RoaXMuZGF0ZUNvbnRhaW5lckNsc31gO1xuICAgICAgICB0aGlzLl9kYXRlT3B0aW9ucy5zaG93V2Vla051bWJlcnMgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmRhdGVwYXR0ZXJuID0gdGhpcy5hcHBEZWZhdWx0cy5kYXRlVGltZUZvcm1hdCB8fCBnZXREaXNwbGF5RGF0ZVRpbWVGb3JtYXQoRm9ybVdpZGdldFR5cGUuREFURVRJTUUpO1xuICAgICAgICB0aGlzLnVwZGF0ZUZvcm1hdCgnZGF0ZXBhdHRlcm4nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB1c2VkIHRvIG1haW50YWluIGEgdGltZSBpbnRlcnZhbCB0byB1cGRhdGUgdGhlIHRpbWUgbW9kZWwgd2hlbiB0aGUgZGF0YSB2YWx1ZSBpcyBzZXQgdG8gQ1VSUkVOVF9USU1FXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRUaW1lSW50ZXJ2YWwoKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWVpbnRlcnZhbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZWludGVydmFsID0gc2V0SW50ZXJ2YWwoICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHRoaXMub25Nb2RlbFVwZGF0ZShjdXJyZW50VGltZSk7XG4gICAgICAgIH0sIDEwMDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHVzZWQgdG8gY2xlYXIgdGhlIHRpbWUgaW50ZXJ2YWwgY3JlYXRlZFxuICAgICAqL1xuICAgIHByaXZhdGUgY2xlYXJUaW1lSW50ZXJ2YWwoKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWVpbnRlcnZhbCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVpbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGlzLnRpbWVpbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB0byB0b2dnbGUgdGhlIHRpbWUgcGlja2VyXG4gICAgICovXG4gICAgcHJpdmF0ZSB0b2dnbGVUaW1lUGlja2VyKG5ld1ZhbCwgJGV2ZW50PzogYW55KSB7XG4gICAgICAgIHRoaXMuaXNUaW1lT3BlbiA9IG5ld1ZhbDtcbiAgICAgICAgaWYgKCRldmVudCAmJiAkZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdjbGljaycsIHskZXZlbnQ6ICRldmVudH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWRkVGltZXBpY2tlckNsaWNrTGlzdGVuZXIodGhpcy5pc1RpbWVPcGVuKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZFRpbWVwaWNrZXJDbGlja0xpc3RlbmVyKHNraXBMaXN0ZW5lcikge1xuICAgICAgICBpZiAoIXNraXBMaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJvZHlFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRyb3Bkb3duRWxlbWVudCA9ICQoYm9keUVsZW1lbnQpLmZpbmQoJz5icy1kcm9wZG93bi1jb250YWluZXIgLmRyb3Bkb3duLW1lbnUnKS5nZXQoMCk7XG4gICAgICAgICAgICB0aGlzLmRlcmVnaXN0ZXJUaW1lcGlja2VFdmVudExpc3RlbmVyID0gYWRkRXZlbnRMaXN0ZW5lck9uRWxlbWVudChib2R5RWxlbWVudCwgZHJvcGRvd25FbGVtZW50LCB0aGlzLm5hdGl2ZUVsZW1lbnQsICdjbGljaycsIHRoaXMuaXNEcm9wRG93bkRpc3BsYXlFbmFibGVkT25JbnB1dCh0aGlzLnNob3dkcm9wZG93bm9uKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlVGltZVBpY2tlcihmYWxzZSk7XG4gICAgICAgICAgICB9LCBFVkVOVF9MSUZFLk9OQ0UsIHRydWUpO1xuICAgICAgICB9LCAzNTApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gc2V0cyB0aGUgdmFsdWUgaXNPcGVuL2lzVGltZU9wZW4gKGkuZSB3aGVuIGRhdGVwaWNrZXIgcG9wdXAgaXMgY2xvc2VkKSBiYXNlZCBvbiB3aWRnZXQgdHlwZShpLmUgIERhdGVUaW1lLCBUaW1lKVxuICAgICAqIEBwYXJhbSB2YWwgLSBpc09wZW4vaXNUaW1lT3BlbiBpcyBzZXQgYmFzZWQgb24gdGhlIHRpbWVwaWNrZXIgcG9wdXAgaXMgb3Blbi9jbG9zZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldElzVGltZU9wZW4odmFsOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuaXNUaW1lT3BlbiA9IHZhbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhpZGVUaW1lcGlja2VyRHJvcGRvd24oKSB7XG4gICAgICAgIHRoaXMuaW52b2tlT25Ub3VjaGVkKCk7XG4gICAgICAgIHRoaXMudG9nZ2xlVGltZVBpY2tlcihmYWxzZSk7XG4gICAgICAgIGlmICh0aGlzLmRlcmVnaXN0ZXJUaW1lcGlja2VFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLmRlcmVnaXN0ZXJUaW1lcGlja2VFdmVudExpc3RlbmVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB0byBhZGQgYSBjbGljayBsaXN0ZW5lciBvbmNlIHRoZSB0aW1lIGRyb3Bkb3duIGlzIG9wZW5cbiAgICAgKi9cbiAgICBwcml2YXRlIG9uVGltZXBpY2tlck9wZW4oKSB7XG4gICAgICAgIC8vIGFkZGluZyBjbGFzcyBmb3IgdGltZSB3aWRnZXQgZHJvcGRvd24gbWVudVxuICAgICAgICBjb25zdCB0cEVsZW1lbnRzICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3RpbWVwaWNrZXInKTtcbiAgICAgICAgXy5mb3JFYWNoKHRwRWxlbWVudHMsIChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgICBhZGRDbGFzcyhlbGVtZW50LnBhcmVudEVsZW1lbnQgYXMgSFRNTEVsZW1lbnQsICdhcHAtZGF0ZXRpbWUnLCB0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ic0RhdGVQaWNrZXJEaXJlY3RpdmUuaGlkZSgpO1xuICAgICAgICB0aGlzLmZvY3VzVGltZVBpY2tlclBvcG92ZXIodGhpcyk7XG4gICAgICAgIHRoaXMuYmluZFRpbWVQaWNrZXJLZXlib2FyZEV2ZW50cygpO1xuICAgICAgICBhZGp1c3RDb250YWluZXJQb3NpdGlvbigkKCdicy1kcm9wZG93bi1jb250YWluZXInKSwgdGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLmJzRHJvcGRvd24uX2Ryb3Bkb3duLCAkKCdicy1kcm9wZG93bi1jb250YWluZXIgLmRyb3Bkb3duLW1lbnUnKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkRhdGVQaWNrZXJPcGVuKCkge1xuICAgICAgICB0aGlzLmlzRGF0ZU9wZW4gPSAhdGhpcy5pc0RhdGVPcGVuO1xuICAgICAgICB0aGlzLnRvZ2dsZVRpbWVQaWNrZXIoZmFsc2UpO1xuICAgICAgICB0aGlzLmJzRGF0ZVZhbHVlID8gdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5ic0RhdGVWYWx1ZSA6IHRoaXMuYWN0aXZlRGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGlmICghdGhpcy5ic0RhdGVWYWx1ZSkge1xuICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRUb2RheSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWRkRGF0ZXBpY2tlcktleWJvYXJkRXZlbnRzKHRoaXMsIHRydWUpO1xuICAgICAgICBhZGp1c3RDb250YWluZXJQb3NpdGlvbigkKCdicy1kYXRlcGlja2VyLWNvbnRhaW5lcicpLCB0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMuYnNEYXRlUGlja2VyRGlyZWN0aXZlLl9kYXRlcGlja2VyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB0byB1cGRhdGUgdGhlIG1vZGVsXG4gICAgICovXG4gICAgcHJpdmF0ZSBvbk1vZGVsVXBkYXRlKG5ld1ZhbCwgdHlwZT8pIHtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdkYXRlJykge1xuICAgICAgICAgICAgdGhpcy5pbnZhbGlkRGF0ZVRpbWVGb3JtYXQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChnZXRGb3JtYXR0ZWREYXRlKHRoaXMuZGF0ZVBpcGUsIG5ld1ZhbCwgdGhpcy5fZGF0ZU9wdGlvbnMuZGF0ZUlucHV0Rm9ybWF0KSA9PT0gdGhpcy5kaXNwbGF5VmFsdWUpIHtcbiAgICAgICAgICAgICAgICQodGhpcy5uYXRpdmVFbGVtZW50KS5maW5kKCcuZGlzcGxheS1pbnB1dCcpLnZhbCh0aGlzLmRpc3BsYXlWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gbWluIGRhdGUgYW5kIG1heCBkYXRlIHZhbGlkYXRpb24gaW4gd2ViLlxuICAgICAgICAvLyBpZiBpbnZhbGlkIGRhdGVzIGFyZSBlbnRlcmVkLCBkZXZpY2UgaXMgc2hvd2luZyB2YWxpZGF0aW9uIG1lc3NhZ2UuXG4gICAgICAgIHRoaXMubWluRGF0ZU1heERhdGVWYWxpZGF0aW9uT25JbnB1dChuZXdWYWwpO1xuICAgICAgICBpZiAoIW5ld1ZhbCkge1xuICAgICAgICAgICAgLy8gU2V0IHRpbWV2YWx1ZSBhcyAwMDowMDowMCBpZiB3ZSByZW1vdmUgYW55IG9uZSBmcm9tIGhvdXJzL21pbnV0ZXMvc2Vjb25kcyBmaWVsZCBpbiB0aW1lcGlja2VyIGFmdGVyIHNlbGVjdGluZyBkYXRlXG4gICAgICAgICAgICBpZiAodGhpcy5ic0RhdGVWYWx1ZSAmJiB0aGlzLmJzVGltZVBpY2tlciAmJiAodGhpcy5ic1RpbWVQaWNrZXIuaG91cnMgPT09ICcnIHx8IHRoaXMuYnNUaW1lUGlja2VyLm1pbnV0ZXMgPT09ICcnIHx8IHRoaXMuYnNUaW1lUGlja2VyLnNlY29uZHMgPT09ICcnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYnNEYXRlVmFsdWUgPSB0aGlzLmJzVGltZVZhbHVlID0gdGhpcy5wcm94eU1vZGVsID0gbW9tZW50KHRoaXMuYnNEYXRlVmFsdWUpLnN0YXJ0T2YoJ2RheScpLnRvRGF0ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJzRGF0ZVZhbHVlID0gdGhpcy5ic1RpbWVWYWx1ZSA9IHRoaXMucHJveHlNb2RlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2RlYm91bmNlZE9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCB7fSwgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09ICdkYXRlJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNEYXRlT3Blbikge1xuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlVGltZVBpY2tlcih0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3h5TW9kZWwgPSBuZXdWYWw7XG4gICAgICAgIGlmICh0aGlzLnByb3h5TW9kZWwpIHtcbiAgICAgICAgICAgIHRoaXMuYnNEYXRlVmFsdWUgPSB0aGlzLmJzVGltZVZhbHVlID0gdGhpcy5wcm94eU1vZGVsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2RlYm91bmNlZE9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCB7fSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuY2RSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHVzZWQgdG8gUHJldmVudCB0aW1lIHBpY2tlciBjbG9zZSB3aGlsZSBjaGFuZ2luZyB0aW1lIHZhbHVlXG4gICAgICovXG4gICAgcHJpdmF0ZSBwcmV2ZW50VHBDbG9zZSgkZXZlbnQpIHtcbiAgICAgICAgJGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHVzZWQgdG8gdG9nZ2xlIHRoZSBkcm9wZG93biBvZiB0aGUgZGF0ZSB3aWRnZXRcbiAgICAgKi9cbiAgICBwcml2YXRlIHRvZ2dsZURwRHJvcGRvd24oJGV2ZW50KSB7XG4gICAgICAgIGlmICgkZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdjbGljaycsIHskZXZlbnQ6ICRldmVudH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkZXZlbnQudGFyZ2V0ICYmICQoJGV2ZW50LnRhcmdldCkuaXMoJ2lucHV0JykgJiYgISh0aGlzLmlzRHJvcERvd25EaXNwbGF5RW5hYmxlZE9uSW5wdXQodGhpcy5zaG93ZHJvcGRvd25vbikpKSB7XG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ic0RhdGVQaWNrZXJEaXJlY3RpdmUudG9nZ2xlKCk7XG4gICAgICAgIHRoaXMuYWRkQm9keUNsaWNrTGlzdGVuZXIodGhpcy5ic0RhdGVQaWNrZXJEaXJlY3RpdmUuaXNPcGVuKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZEJvZHlDbGlja0xpc3RlbmVyKHNraXBMaXN0ZW5lcikge1xuICAgICAgICBpZiAoIXNraXBMaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJvZHlFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJzRGF0ZUNvbnRhaW5lckVsZW1lbnQgPSBib2R5RWxlbWVudC5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLmRhdGVDb250YWluZXJDbHN9YCk7XG4gICAgICAgICAgICB0aGlzLmRlcmVnaXN0ZXJEYXRlcGlja2VyRXZlbnRMaXN0ZW5lciA9IGFkZEV2ZW50TGlzdGVuZXJPbkVsZW1lbnQoYm9keUVsZW1lbnQsIGJzRGF0ZUNvbnRhaW5lckVsZW1lbnQsIHRoaXMubmF0aXZlRWxlbWVudCwgJ2NsaWNrJywgdGhpcy5pc0Ryb3BEb3duRGlzcGxheUVuYWJsZWRPbklucHV0KHRoaXMuc2hvd2Ryb3Bkb3dub24pLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ic0RhdGVQaWNrZXJEaXJlY3RpdmUuaGlkZSgpO1xuICAgICAgICAgICAgfSwgRVZFTlRfTElGRS5PTkNFLCB0cnVlKTtcbiAgICAgICAgfSwgMzUwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhpZGVEYXRlcGlja2VyRHJvcGRvd24oKSB7XG4gICAgICAgIHRoaXMuaXNEYXRlT3BlbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmludm9rZU9uVG91Y2hlZCgpO1xuICAgICAgICB0aGlzLmJzRGF0ZVBpY2tlckRpcmVjdGl2ZS5oaWRlKCk7XG4gICAgICAgIHRoaXMuaXNFbnRlclByZXNzZWRPbkRhdGVJbnB1dCA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5kZXJlZ2lzdGVyRGF0ZXBpY2tlckV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZGVyZWdpc3RlckRhdGVwaWNrZXJFdmVudExpc3RlbmVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRGF0ZUNoYW5nZSgkZXZlbnQsIGlzTmF0aXZlUGlja2VyKSB7XG4gICAgICAgIGlmICh0aGlzLmlzRW50ZXJQcmVzc2VkT25EYXRlSW5wdXQpIHtcbiAgICAgICAgICAgIHRoaXMuaXNFbnRlclByZXNzZWRPbkRhdGVJbnB1dCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBuZXdWYWwgPSAkZXZlbnQudGFyZ2V0LnZhbHVlLnRyaW0oKTtcbiAgICAgICAgbmV3VmFsID0gbmV3VmFsID8gZ2V0TmF0aXZlRGF0ZU9iamVjdChuZXdWYWwpIDogdW5kZWZpbmVkO1xuICAgICAgICAvLyBkYXRldGltZSBwYXR0ZXJuIHZhbGlkYXRpb25cbiAgICAgICAgLy8gaWYgaW52YWxpZCBwYXR0ZXJuIGlzIGVudGVyZWQsIGRldmljZSBpcyBzaG93aW5nIGFuIGVycm9yLlxuICAgICAgICBpZiAoIXRoaXMuZm9ybWF0VmFsaWRhdGlvbihuZXdWYWwsICRldmVudC50YXJnZXQudmFsdWUsIGlzTmF0aXZlUGlja2VyKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIG1pbiBkYXRlIGFuZCBtYXggZGF0ZSB2YWxpZGF0aW9uIGluIG1vYmlsZSB2aWV3LlxuICAgICAgICAvLyBpZiBpbnZhbGlkIGRhdGVzIGFyZSBlbnRlcmVkLCBkZXZpY2UgaXMgc2hvd2luZyBhbiBhbGVydC5cbiAgICAgICAgaWYgKGlzTmF0aXZlUGlja2VyICYmIHRoaXMubWluRGF0ZU1heERhdGVWYWxpZGF0aW9uT25JbnB1dChuZXdWYWwsICRldmVudCwgdGhpcy5kaXNwbGF5VmFsdWUsIGlzTmF0aXZlUGlja2VyKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW52YWxpZERhdGVUaW1lRm9ybWF0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25Nb2RlbFVwZGF0ZShuZXdWYWwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHRyaWdnZXJlZCB3aGVuIHByZXNzaW5nIGtleSBvbiB0aGUgZGF0ZXRpbWUgaW5wdXRcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uRGlzcGxheUtleWRvd24oZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEcm9wRG93bkRpc3BsYXlFbmFibGVkT25JbnB1dCh0aGlzLnNob3dkcm9wZG93bm9uKSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBsZXQgbmV3VmFsID0gZXZlbnQudGFyZ2V0LnZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIG5ld1ZhbCA9IG5ld1ZhbCA/IGdldE5hdGl2ZURhdGVPYmplY3QobmV3VmFsKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMua2V5RXZlbnRQbHVnaW4uY29uc3RydWN0b3IuZ2V0RXZlbnRGdWxsS2V5KGV2ZW50KTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdlbnRlcicgfHwgYWN0aW9uID09PSAnYXJyb3dkb3duJykge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybWF0dGVkRGF0ZSA9IGdldEZvcm1hdHRlZERhdGUodGhpcy5kYXRlUGlwZSwgbmV3VmFsLCB0aGlzLl9kYXRlT3B0aW9ucy5kYXRlSW5wdXRGb3JtYXQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0VmFsID0gZXZlbnQudGFyZ2V0LnZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXRWYWwgJiYgdGhpcy5kYXRlcGF0dGVybiA9PT0gJ3RpbWVzdGFtcCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfLmlzTmFOKGlucHV0VmFsKSAmJiBfLnBhcnNlSW50KGlucHV0VmFsKSAhPT0gZm9ybWF0dGVkRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZhbGlkRGF0ZVRpbWVGb3JtYXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgZXZlbnQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5wdXRWYWwgJiYgaW5wdXRWYWwgIT09IGZvcm1hdHRlZERhdGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZERhdGVUaW1lRm9ybWF0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgZXZlbnQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludmFsaWREYXRlVGltZUZvcm1hdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRW50ZXJQcmVzc2VkT25EYXRlSW5wdXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJzRGF0ZVBpY2tlckRpcmVjdGl2ZS5ic1ZhbHVlID0gIG5ld1ZhbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVEcERyb3Bkb3duKGV2ZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlRGF0ZXBpY2tlckRyb3Bkb3duKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlVGltZXBpY2tlckRyb3Bkb3duKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVEYXRlcGlja2VyRHJvcGRvd24oKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZVRpbWVwaWNrZXJEcm9wZG93bigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1ZhbGlkKGV2ZW50KSB7XG4gICAgICAgIGlmICghZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGVudGVyZWREYXRlID0gJCh0aGlzLm5hdGl2ZUVsZW1lbnQpLmZpbmQoJ2lucHV0JykudmFsKCk7XG4gICAgICAgICAgICBjb25zdCBuZXdWYWwgPSBnZXROYXRpdmVEYXRlT2JqZWN0KGVudGVyZWREYXRlKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5mb3JtYXRWYWxpZGF0aW9uKG5ld1ZhbCwgZW50ZXJlZERhdGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2hhbmdlIGFuZCBibHVyIGV2ZW50cyBhcmUgYWRkZWQgZnJvbSB0aGUgdGVtcGxhdGVcbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIGxvY2FsczogYW55KSB7XG4gICAgICAgIGlmICghXy5pbmNsdWRlcyhbJ2JsdXInLCAnZm9jdXMnLCAnY2hhbmdlJywgJ2NsaWNrJ10sIGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgIHN1cGVyLmhhbmRsZUV2ZW50KG5vZGUsIGV2ZW50TmFtZSwgY2FsbGJhY2ssIGxvY2Fscyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbklucHV0Qmx1cigkZXZlbnQpIHtcbiAgICAgICAgaWYgKCEkKCRldmVudC5yZWxhdGVkVGFyZ2V0KS5oYXNDbGFzcygnY3VycmVudC1kYXRlJykpIHtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlT25Ub3VjaGVkKCk7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JsdXInLCB7JGV2ZW50fSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=