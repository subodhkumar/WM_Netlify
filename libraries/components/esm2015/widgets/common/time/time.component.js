import { Component, Inject, Injector, NgZone, ViewChild } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { TimepickerComponent } from 'ngx-bootstrap';
import { $appDigest, addClass, addEventListenerOnElement, adjustContainerPosition, AppDefaults, FormWidgetType, getDisplayDateTimeFormat, getFormattedDate, getNativeDateObject } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './time.props';
import { provideAsNgValidators, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { BaseDateTimeComponent } from '../base/base-date-time.component';
const CURRENT_TIME = 'CURRENT_TIME';
const DEFAULT_CLS = 'input-group app-timeinput';
const WIDGET_CONFIG = { widgetType: 'wm-time', hostClass: DEFAULT_CLS };
export class TimeComponent extends BaseDateTimeComponent {
    constructor(inj, ngZone, appDefaults, evtMngrPlugins) {
        super(inj, WIDGET_CONFIG);
        this.ngZone = ngZone;
        this.appDefaults = appDefaults;
        /**
         * This is an internal property used to toggle the timepicker dropdown
         */
        this.status = { isopen: false };
        // KeyEventsPlugin
        this.keyEventPlugin = evtMngrPlugins[1];
        styler(this.nativeElement, this);
        /**
         * Destroy the timer once the date widget is gone
         */
        this.registerDestroyListener(() => this.clearTimeInterval());
        this.timepattern = this.appDefaults.timeFormat || getDisplayDateTimeFormat(FormWidgetType.TIME);
        this.updateFormat('timepattern');
    }
    get timestamp() {
        return this.bsTimeValue ? this.bsTimeValue.valueOf() : undefined;
    }
    get datavalue() {
        if (this.isCurrentTime && !this.bsTimeValue) {
            return CURRENT_TIME;
        }
        return getFormattedDate(this.datePipe, this.bsTimeValue, this.outputformat) || '';
    }
    /**Todo[Shubham]: needs to be redefined
     * This property sets the default value for the time selection
     */
    set datavalue(newVal) {
        if (newVal) {
            if (newVal === CURRENT_TIME) {
                this.isCurrentTime = true;
                this.setTimeInterval();
            }
            else {
                this.clearTimeInterval();
                this.bsTimeValue = getNativeDateObject(newVal);
                this.isCurrentTime = false;
            }
        }
        else {
            this.bsTimeValue = undefined;
            this.clearTimeInterval();
            this.isCurrentTime = false;
        }
        this.invokeOnChange(this.datavalue);
        $appDigest();
    }
    get displayValue() {
        return getFormattedDate(this.datePipe, this.bsTimeValue, this.timepattern) || '';
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        if (key === 'timepattern') {
            this.updateFormat('timepattern');
        }
        if (key === 'mintime') {
            this.minTime = getNativeDateObject(nv); // TODO it is supposed to be time conversion, not to the day
            this.mintimeMaxtimeValidation();
        }
        else if (key === 'maxtime') {
            this.maxTime = getNativeDateObject(nv);
            this.mintimeMaxtimeValidation();
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    /**
     * This is an internal method used to validate mintime and maxtime
     */
    mintimeMaxtimeValidation() {
        this.timeNotInRange = this.minTime && this.maxTime && (this.bsTimeValue < this.minTime || this.bsTimeValue > this.maxTime);
        this.invokeOnChange(this.datavalue, undefined, false);
    }
    /**
     * This is an internal method used to toggle the dropdown of the time widget
     */
    toggleDropdown($event) {
        if ($event.type === 'click') {
            this.invokeEventCallback('click', { $event: $event });
        }
        if ($event.target && $($event.target).is('input') && !(this.isDropDownDisplayEnabledOnInput(this.showdropdownon))) {
            return;
        }
        this.ngZone.run(() => {
            this.status.isopen = !this.status.isopen;
        });
        this.addBodyClickListener(this.status.isopen);
    }
    /**
     * This is an internal method used to Prevent time picker close while changing time value
     */
    preventTpClose($event) {
        $event.stopImmediatePropagation();
    }
    addBodyClickListener(skipListener) {
        if (!skipListener) {
            return;
        }
        const bodyElement = document.querySelector('body');
        setTimeout(() => {
            const dropdownElement = $(bodyElement).find('>bs-dropdown-container .dropdown-menu').get(0);
            this.deregisterEventListener = addEventListenerOnElement(bodyElement, dropdownElement, this.nativeElement, 'click', this.isDropDownDisplayEnabledOnInput(this.showdropdownon), () => {
                this.status.isopen = false;
            }, 0 /* ONCE */, true);
        }, 350);
    }
    /**
     * This is an internal method triggered when pressing key on the time input
     */
    onDisplayKeydown(event) {
        if (this.isDropDownDisplayEnabledOnInput(this.showdropdownon)) {
            event.stopPropagation();
            const action = this.keyEventPlugin.constructor.getEventFullKey(event);
            if (action === 'enter' || action === 'arrowdown') {
                event.preventDefault();
                this.toggleDropdown(event);
            }
            else {
                this.hideTimepickerDropdown();
            }
        }
        else {
            this.hideTimepickerDropdown();
        }
    }
    /**
     * This is an internal method triggered when the time input changes
     */
    onDisplayTimeChange($event) {
        const newVal = getNativeDateObject($event.target.value);
        // time pattern validation
        // if invalid pattern is entered, device is showing an error.
        if (!this.formatValidation(newVal, $event.target.value)) {
            return;
        }
        this.invalidDateTimeFormat = false;
        this.onTimeChange(newVal);
    }
    onInputBlur($event) {
        if (!$($event.relatedTarget).hasClass('bs-timepicker-field')) {
            this.invokeOnTouched();
            this.invokeEventCallback('blur', { $event });
        }
    }
    /**
     * This is an internal method used to execute the on time change functionality
     */
    onTimeChange(newVal, isNativePicker) {
        let timeValue, timeInputValue, minTimeMeridian, maxTimeMeridian;
        // For nativePicker, newVal is event, get the dateobject from the event.
        if (isNativePicker) {
            newVal = getNativeDateObject(newVal.target.value);
        }
        if (newVal) {
            this.bsTimeValue = newVal;
            // if the newVal is valid but not in the given range then highlight the input field
            this.timeNotInRange = this.minTime && this.maxTime && (newVal < this.minTime || newVal > this.maxTime);
        }
        else {
            // sometimes library is not returning the correct value when the min and max time are given, displaying the datavalue based on the value given by the user
            if (this.bsTimePicker && this.bsTimePicker.min && this.bsTimePicker.max) {
                minTimeMeridian = moment(new Date(this.bsTimePicker.min)).format('A');
                maxTimeMeridian = moment(new Date(this.bsTimePicker.max)).format('A');
                timeValue = this.bsTimePicker.hours + ':' + (this.bsTimePicker.minutes || 0) + ':' + (this.bsTimePicker.seconds || 0) + (this.bsTimePicker.showMeridian ? (' ' + minTimeMeridian) : '');
                timeInputValue = getNativeDateObject(timeValue);
                this.bsTimePicker.meridian = minTimeMeridian;
                this.timeNotInRange = (this.bsTimePicker.min > timeInputValue || this.bsTimePicker.max < timeInputValue);
            }
            this.bsTimeValue = timeInputValue;
        }
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue, {}, true);
    }
    /**
     * This is an internal method used to maintain a time interval to update the time model when the data value is set to CURRENT_TIME
     */
    setTimeInterval() {
        if (this.timeinterval) {
            return;
        }
        this.timeinterval = setInterval(() => {
            const now = new Date();
            now.setSeconds(now.getSeconds() + 1);
            this.datavalue = CURRENT_TIME;
            this.onTimeChange(now);
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
     * This function sets the value isOpen/isTimeOpen (i.e when datepicker popup is closed) based on widget type(i.e  DateTime, Time)
     * @param val - isOpen/isTimeOpen is set based on the timepicker popup is open/closed
     */
    setIsTimeOpen(val) {
        this.status.isopen = val;
    }
    // Change event is registered from the template, Prevent the framework from registering one more event
    handleEvent(node, eventName, eventCallback, locals) {
        if (!_.includes(['blur', 'focus', 'change', 'click'], eventName)) {
            super.handleEvent(node, eventName, eventCallback, locals);
        }
    }
    hideTimepickerDropdown() {
        this.invokeOnTouched();
        this.status.isopen = false;
        if (this.deregisterEventListener) {
            this.deregisterEventListener();
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
    /**
     * This is an internal method to add css class for dropdown while opening the time dropdown
     */
    onShown() {
        const tpElements = document.querySelectorAll('timepicker');
        _.forEach(tpElements, element => {
            addClass(element.parentElement, 'app-datetime', true);
        });
        this.focusTimePickerPopover(this);
        this.bindTimePickerKeyboardEvents();
        adjustContainerPosition($('bs-dropdown-container'), this.nativeElement, this.bsDropdown._dropdown, $('bs-dropdown-container .dropdown-menu'));
    }
}
TimeComponent.initializeProps = registerProps();
TimeComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmTime]',
                template: "<ng-container *ngIf=\"useDatapicker; then timePickerTemplate else nativeTimeTemplate\">\n</ng-container>\n\n<ng-template #timePickerTemplate>\n    <div dropdown [isOpen]=\"status.isopen\" (onShown)=\"onShown()\" (onHidden)=\"hideTimepickerDropdown()\" container=\"body\" style=\"display: inherit\">\n        <input class=\"form-control app-textbox display-input\" aria-label=\"Set the time\"\n               focus-target\n               [tabindex]=\"tabindex\"\n               [name]=\"name\"\n               type=\"text\"\n               [value]=\"displayValue\"\n               [disabled]=\"disabled || readonly || isCurrentTime\"\n               [autofocus]=\"autofocus\"\n               [required]=\"required\"\n               [attr.placeholder]=\"placeholder\"\n               [attr.accesskey]=\"shortcutkey\"\n               [required]=\"required\"\n               (click)=\"toggleDropdown($event)\"\n               (focus)=\"invokeOnFocus($event)\"\n               (blur)=\"onInputBlur($event)\"\n               (change)=\"onDisplayTimeChange($event)\"\n               (keydown)=\"onDisplayKeydown($event)\">\n        <span class=\"input-group-btn dropdown-toggle\">\n          <button type=\"button\" class=\"btn btn-default btn-date\" [tabindex]=\"tabindex\" [disabled]=\"disabled || readonly || isCurrentTime\" aria-label=\"Select time\" aria-haspopup=\"true\" aria-expanded=\"false\" (click)=\"toggleDropdown($event)\"><i aria-hidden=\"true\" class=\"app-icon wi wi-access-time\"></i></button>\n        </span>\n        <div *dropdownMenu class=\"dropdown-menu\" (click)=\"preventTpClose($event)\">\n            <timepicker class=\"model-holder\"\n                        [showMeridian]=\"ismeridian\"\n                        [readonlyInput]=\"isDisabled\"\n                        [(ngModel)]=\"bsTimeValue\"\n                        [disabled]=\"disabled || readonly || isCurrentTime\"\n                        [min]=\"minTime\"\n                        [max]=\"maxTime\"\n                        [hourStep]=\"hourstep\"\n                        [minuteStep]=\"minutestep\"\n                        [secondsStep]=\"secondsstep\"\n                        [mousewheel]=\"true\"\n                        [arrowkeys]=\"true\"\n                        (isValid)=\"isValid($event)\"\n                        [showSeconds]=\"showseconds\" (ngModelChange)=\"onTimeChange($event)\"></timepicker>\n        </div>\n    </div>\n</ng-template>\n<ng-template #nativeTimeTemplate>\n    <input type=\"time\" class=\"form-control app-textbox\"\n           role=\"input\"\n           [value]=\"displayValue\"\n           [required]=\"required\"\n           [disabled]=\"disabled || readonly || isCurrentTime\"\n           (change)=\"onTimeChange($event, true)\"\n           (focus)=\"invokeOnFocus($event)\"\n           (blur)=\"invokeOnTouched($event)\">\n</ng-template>\n",
                providers: [
                    provideAsNgValueAccessor(TimeComponent),
                    provideAsNgValidators(TimeComponent),
                    provideAsWidgetRef(TimeComponent)
                ]
            }] }
];
/** @nocollapse */
TimeComponent.ctorParameters = () => [
    { type: Injector },
    { type: NgZone },
    { type: AppDefaults },
    { type: undefined, decorators: [{ type: Inject, args: [EVENT_MANAGER_PLUGINS,] }] }
];
TimeComponent.propDecorators = {
    bsTimePicker: [{ type: ViewChild, args: [TimepickerComponent,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RpbWUvdGltZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBYSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFbEUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBELE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLHlCQUF5QixFQUFFLHVCQUF1QixFQUFFLFdBQVcsRUFBYyxjQUFjLEVBQUUsd0JBQXdCLEVBQUUsZ0JBQWdCLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFOU0sT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDN0MsT0FBTyxFQUFFLHFCQUFxQixFQUFFLHdCQUF3QixFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDbEgsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFFekUsTUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDO0FBQ3BDLE1BQU0sV0FBVyxHQUFHLDJCQUEyQixDQUFDO0FBQ2hELE1BQU0sYUFBYSxHQUFHLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFhdEUsTUFBTSxPQUFPLGFBQWMsU0FBUSxxQkFBcUI7SUFrRnBELFlBQ0ksR0FBYSxFQUNMLE1BQWMsRUFDZCxXQUF3QixFQUNELGNBQWM7UUFFN0MsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMs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LENBQUMsdUJBQXVCLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDLENBQUM7SUFDbEosQ0FBQzs7QUFoVE0sNkJBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFWNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxVQUFVO2dCQUNwQixpMEZBQW9DO2dCQUNwQyxTQUFTLEVBQUU7b0JBQ1Asd0JBQXdCLENBQUMsYUFBYSxDQUFDO29CQUN2QyxxQkFBcUIsQ0FBQyxhQUFhLENBQUM7b0JBQ3BDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQztpQkFDcEM7YUFDSjs7OztZQTFCMkIsUUFBUTtZQUFFLE1BQU07WUFLdUMsV0FBVzs0Q0E0R3JGLE1BQU0sU0FBQyxxQkFBcUI7OzsyQkFOaEMsU0FBUyxTQUFDLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0LCBJbmplY3RvciwgTmdab25lLCBPbkRlc3Ryb3ksIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRVZFTlRfTUFOQUdFUl9QTFVHSU5TIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbmltcG9ydCB7IFRpbWVwaWNrZXJDb21wb25lbnQgfSBmcm9tICduZ3gtYm9vdHN0cmFwJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgYWRkQ2xhc3MsIGFkZEV2ZW50TGlzdGVuZXJPbkVsZW1lbnQsIGFkanVzdENvbnRhaW5lclBvc2l0aW9uLCBBcHBEZWZhdWx0cywgRVZFTlRfTElGRSwgRm9ybVdpZGdldFR5cGUsIGdldERpc3BsYXlEYXRlVGltZUZvcm1hdCwgZ2V0Rm9ybWF0dGVkRGF0ZSwgZ2V0TmF0aXZlRGF0ZU9iamVjdCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi90aW1lLnByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc05nVmFsaWRhdG9ycywgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgQmFzZURhdGVUaW1lQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9iYXNlLWRhdGUtdGltZS5jb21wb25lbnQnO1xuXG5jb25zdCBDVVJSRU5UX1RJTUUgPSAnQ1VSUkVOVF9USU1FJztcbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2lucHV0LWdyb3VwIGFwcC10aW1laW5wdXQnO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tdGltZScsIGhvc3RDbGFzczogREVGQVVMVF9DTFN9O1xuXG5kZWNsYXJlIGNvbnN0IF8sIG1vbWVudCwgJDtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21UaW1lXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3RpbWUuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IoVGltZUNvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc05nVmFsaWRhdG9ycyhUaW1lQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFRpbWVDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBUaW1lQ29tcG9uZW50IGV4dGVuZHMgQmFzZURhdGVUaW1lQ29tcG9uZW50IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuICAgIC8qKlxuICAgICAqIFRoaXMgcHJvcGVydHkgc2V0cyB0aGUgZGlzcGxheSBwYXR0ZXJuIG9mIHRoZSB0aW1lIHNlbGVjdGVkXG4gICAgICovXG4gICAgdGltZXBhdHRlcm46IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFRoaXMgcHJvcGVydHkgc2V0cyB0aGUgb3V0cHV0IGZvcm1hdCBmb3IgdGhlIHNlbGVjdGVkIHRpbWUgZGF0YXZhbHVlXG4gICAgICovXG4gICAgb3V0cHV0Zm9ybWF0OiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgc2hvd2Ryb3Bkb3dub246IHN0cmluZztcblxuICAgIHByaXZhdGUgZGVyZWdpc3RlckV2ZW50TGlzdGVuZXI7XG5cbiAgICBnZXQgdGltZXN0YW1wKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ic1RpbWVWYWx1ZSA/IHRoaXMuYnNUaW1lVmFsdWUudmFsdWVPZigpIDogdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGdldCBkYXRhdmFsdWUoKTogYW55IHtcbiAgICAgICAgaWYgKHRoaXMuaXNDdXJyZW50VGltZSAmJiAhdGhpcy5ic1RpbWVWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIENVUlJFTlRfVElNRTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2V0Rm9ybWF0dGVkRGF0ZSh0aGlzLmRhdGVQaXBlLCB0aGlzLmJzVGltZVZhbHVlLCB0aGlzLm91dHB1dGZvcm1hdCkgfHwgJyc7XG4gICAgfVxuXG4gICAgLyoqVG9kb1tTaHViaGFtXTogbmVlZHMgdG8gYmUgcmVkZWZpbmVkXG4gICAgICogVGhpcyBwcm9wZXJ0eSBzZXRzIHRoZSBkZWZhdWx0IHZhbHVlIGZvciB0aGUgdGltZSBzZWxlY3Rpb25cbiAgICAgKi9cbiAgICBzZXQgZGF0YXZhbHVlKG5ld1ZhbDogYW55KSB7XG4gICAgICAgIGlmIChuZXdWYWwpIHtcbiAgICAgICAgICAgIGlmIChuZXdWYWwgPT09IENVUlJFTlRfVElNRSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDdXJyZW50VGltZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaW1lSW50ZXJ2YWwoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhclRpbWVJbnRlcnZhbCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYnNUaW1lVmFsdWUgPSBnZXROYXRpdmVEYXRlT2JqZWN0KG5ld1ZhbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0N1cnJlbnRUaW1lID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmJzVGltZVZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5jbGVhclRpbWVJbnRlcnZhbCgpO1xuICAgICAgICAgICAgdGhpcy5pc0N1cnJlbnRUaW1lID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSk7XG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICB9XG5cbiAgICBnZXQgZGlzcGxheVZhbHVlKCkge1xuICAgICAgICByZXR1cm4gZ2V0Rm9ybWF0dGVkRGF0ZSh0aGlzLmRhdGVQaXBlLCB0aGlzLmJzVGltZVZhbHVlLCB0aGlzLnRpbWVwYXR0ZXJuKSB8fCAnJztcbiAgICB9XG5cbiAgICAvKiBJbnRlcm5hbCBwcm9wZXJ0eSB0byBoYXZlIGEgZmxhZyB0byBjaGVjayB0aGUgZ2l2ZW4gZGF0YXZhbHVlIGlzIG9mIEN1cnJlbnQgdGltZSovXG4gICAgcHJpdmF0ZSBpc0N1cnJlbnRUaW1lOiBib29sZWFuO1xuXG4gICAgcHJpdmF0ZSB0aW1laW50ZXJ2YWw6IGFueTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgcHJvcGVydHkgdXNlZCB0byBtYXAgaXQgdG8gdGhlIHdpZGdldFxuICAgICAqL1xuICAgIHByaXZhdGUgbWluVGltZTogRGF0ZTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgcHJvcGVydHkgdXNlZCB0byBtYXAgaXQgdG8gdGhlIHdpZGdldFxuICAgICAqL1xuICAgIHByaXZhdGUgbWF4VGltZTogRGF0ZTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgcHJvcGVydHkgdXNlZCB0byB0b2dnbGUgdGhlIHRpbWVwaWNrZXIgZHJvcGRvd25cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXR1cyA9IHsgaXNvcGVuOiBmYWxzZSB9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBpcyBhbiBpbnRlcm5hbCBwcm9wZXJ0eSB1c2VkIHRvIG1hcCB0aGUgbWFpbiBtb2RlbCB0byB0aGUgdGltZSB3aWRnZXRcbiAgICAgKi9cbiAgICBwcml2YXRlIGJzVGltZVZhbHVlOiBEYXRlO1xuXG4gICAgcHJpdmF0ZSBrZXlFdmVudFBsdWdpbjtcblxuICAgIEBWaWV3Q2hpbGQoVGltZXBpY2tlckNvbXBvbmVudCkgYnNUaW1lUGlja2VyO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIHByaXZhdGUgbmdab25lOiBOZ1pvbmUsXG4gICAgICAgIHByaXZhdGUgYXBwRGVmYXVsdHM6IEFwcERlZmF1bHRzLFxuICAgICAgICBASW5qZWN0KEVWRU5UX01BTkFHRVJfUExVR0lOUykgZXZ0TW5nclBsdWdpbnNcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICAvLyBLZXlFdmVudHNQbHVnaW5cbiAgICAgICAgdGhpcy5rZXlFdmVudFBsdWdpbiA9IGV2dE1uZ3JQbHVnaW5zWzFdO1xuXG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogRGVzdHJveSB0aGUgdGltZXIgb25jZSB0aGUgZGF0ZSB3aWRnZXQgaXMgZ29uZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiB0aGlzLmNsZWFyVGltZUludGVydmFsKCkpO1xuXG4gICAgICAgIHRoaXMudGltZXBhdHRlcm4gPSB0aGlzLmFwcERlZmF1bHRzLnRpbWVGb3JtYXQgfHwgZ2V0RGlzcGxheURhdGVUaW1lRm9ybWF0KEZvcm1XaWRnZXRUeXBlLlRJTUUpO1xuICAgICAgICB0aGlzLnVwZGF0ZUZvcm1hdCgndGltZXBhdHRlcm4nKTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAndGFiaW5kZXgnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ3RpbWVwYXR0ZXJuJykge1xuICAgICAgICAgICB0aGlzLnVwZGF0ZUZvcm1hdCgndGltZXBhdHRlcm4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5ID09PSAnbWludGltZScpIHtcbiAgICAgICAgICAgIHRoaXMubWluVGltZSA9IGdldE5hdGl2ZURhdGVPYmplY3QobnYpOyAvLyBUT0RPIGl0IGlzIHN1cHBvc2VkIHRvIGJlIHRpbWUgY29udmVyc2lvbiwgbm90IHRvIHRoZSBkYXlcbiAgICAgICAgICAgIHRoaXMubWludGltZU1heHRpbWVWYWxpZGF0aW9uKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbWF4dGltZScpIHtcbiAgICAgICAgICAgIHRoaXMubWF4VGltZSA9IGdldE5hdGl2ZURhdGVPYmplY3QobnYpO1xuICAgICAgICAgICAgdGhpcy5taW50aW1lTWF4dGltZVZhbGlkYXRpb24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBpcyBhbiBpbnRlcm5hbCBtZXRob2QgdXNlZCB0byB2YWxpZGF0ZSBtaW50aW1lIGFuZCBtYXh0aW1lXG4gICAgICovXG4gICAgcHJpdmF0ZSBtaW50aW1lTWF4dGltZVZhbGlkYXRpb24oKSB7XG4gICAgICAgIHRoaXMudGltZU5vdEluUmFuZ2UgPSB0aGlzLm1pblRpbWUgJiYgdGhpcy5tYXhUaW1lICYmICh0aGlzLmJzVGltZVZhbHVlIDwgdGhpcy5taW5UaW1lIHx8IHRoaXMuYnNUaW1lVmFsdWUgPiB0aGlzLm1heFRpbWUpO1xuICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB1c2VkIHRvIHRvZ2dsZSB0aGUgZHJvcGRvd24gb2YgdGhlIHRpbWUgd2lkZ2V0XG4gICAgICovXG4gICAgcHJpdmF0ZSB0b2dnbGVEcm9wZG93bigkZXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCRldmVudC50eXBlID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2NsaWNrJywgeyRldmVudDogJGV2ZW50fSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCRldmVudC50YXJnZXQgJiYgJCgkZXZlbnQudGFyZ2V0KS5pcygnaW5wdXQnKSAmJiAhKHRoaXMuaXNEcm9wRG93bkRpc3BsYXlFbmFibGVkT25JbnB1dCh0aGlzLnNob3dkcm9wZG93bm9uKSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXMuaXNvcGVuID0gIXRoaXMuc3RhdHVzLmlzb3BlbjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGRCb2R5Q2xpY2tMaXN0ZW5lcih0aGlzLnN0YXR1cy5pc29wZW4pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHVzZWQgdG8gUHJldmVudCB0aW1lIHBpY2tlciBjbG9zZSB3aGlsZSBjaGFuZ2luZyB0aW1lIHZhbHVlXG4gICAgICovXG4gICAgcHJpdmF0ZSBwcmV2ZW50VHBDbG9zZSgkZXZlbnQpIHtcbiAgICAgICAgJGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkQm9keUNsaWNrTGlzdGVuZXIoc2tpcExpc3RlbmVyKSB7XG4gICAgICAgIGlmICghc2tpcExpc3RlbmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYm9keUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZHJvcGRvd25FbGVtZW50ID0gJChib2R5RWxlbWVudCkuZmluZCgnPmJzLWRyb3Bkb3duLWNvbnRhaW5lciAuZHJvcGRvd24tbWVudScpLmdldCgwKTtcbiAgICAgICAgICAgIHRoaXMuZGVyZWdpc3RlckV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudExpc3RlbmVyT25FbGVtZW50KGJvZHlFbGVtZW50LCBkcm9wZG93bkVsZW1lbnQsIHRoaXMubmF0aXZlRWxlbWVudCwgJ2NsaWNrJywgdGhpcy5pc0Ryb3BEb3duRGlzcGxheUVuYWJsZWRPbklucHV0KHRoaXMuc2hvd2Ryb3Bkb3dub24pLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0dXMuaXNvcGVuID0gZmFsc2U7XG4gICAgICAgICAgICB9LCBFVkVOVF9MSUZFLk9OQ0UsIHRydWUpO1xuICAgICAgICB9LCAzNTApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHRyaWdnZXJlZCB3aGVuIHByZXNzaW5nIGtleSBvbiB0aGUgdGltZSBpbnB1dFxuICAgICAqL1xuICAgIHByaXZhdGUgb25EaXNwbGF5S2V5ZG93bihldmVudCkge1xuICAgICAgICBpZiAodGhpcy5pc0Ryb3BEb3duRGlzcGxheUVuYWJsZWRPbklucHV0KHRoaXMuc2hvd2Ryb3Bkb3dub24pKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMua2V5RXZlbnRQbHVnaW4uY29uc3RydWN0b3IuZ2V0RXZlbnRGdWxsS2V5KGV2ZW50KTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdlbnRlcicgfHwgYWN0aW9uID09PSAnYXJyb3dkb3duJykge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVEcm9wZG93bihldmVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZVRpbWVwaWNrZXJEcm9wZG93bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5oaWRlVGltZXBpY2tlckRyb3Bkb3duKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB0cmlnZ2VyZWQgd2hlbiB0aGUgdGltZSBpbnB1dCBjaGFuZ2VzXG4gICAgICovXG4gICAgb25EaXNwbGF5VGltZUNoYW5nZSgkZXZlbnQpIHtcbiAgICAgICAgY29uc3QgbmV3VmFsID0gZ2V0TmF0aXZlRGF0ZU9iamVjdCgkZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgLy8gdGltZSBwYXR0ZXJuIHZhbGlkYXRpb25cbiAgICAgICAgLy8gaWYgaW52YWxpZCBwYXR0ZXJuIGlzIGVudGVyZWQsIGRldmljZSBpcyBzaG93aW5nIGFuIGVycm9yLlxuICAgICAgICBpZiAoIXRoaXMuZm9ybWF0VmFsaWRhdGlvbihuZXdWYWwsICRldmVudC50YXJnZXQudmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnZhbGlkRGF0ZVRpbWVGb3JtYXQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5vblRpbWVDaGFuZ2UobmV3VmFsKTtcbiAgICB9XG5cbiAgICBvbklucHV0Qmx1cigkZXZlbnQpIHtcbiAgICAgICAgaWYgKCEkKCRldmVudC5yZWxhdGVkVGFyZ2V0KS5oYXNDbGFzcygnYnMtdGltZXBpY2tlci1maWVsZCcpKSB7XG4gICAgICAgICAgICB0aGlzLmludm9rZU9uVG91Y2hlZCgpO1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdibHVyJywgeyRldmVudH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBpcyBhbiBpbnRlcm5hbCBtZXRob2QgdXNlZCB0byBleGVjdXRlIHRoZSBvbiB0aW1lIGNoYW5nZSBmdW5jdGlvbmFsaXR5XG4gICAgICovXG4gICAgcHJpdmF0ZSBvblRpbWVDaGFuZ2UobmV3VmFsLCBpc05hdGl2ZVBpY2tlcj86IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IHRpbWVWYWx1ZSxcbiAgICAgICAgICAgIHRpbWVJbnB1dFZhbHVlLFxuICAgICAgICAgICAgbWluVGltZU1lcmlkaWFuLFxuICAgICAgICAgICAgbWF4VGltZU1lcmlkaWFuO1xuICAgICAgICAvLyBGb3IgbmF0aXZlUGlja2VyLCBuZXdWYWwgaXMgZXZlbnQsIGdldCB0aGUgZGF0ZW9iamVjdCBmcm9tIHRoZSBldmVudC5cbiAgICAgICAgaWYgKGlzTmF0aXZlUGlja2VyKSB7XG4gICAgICAgICAgICBuZXdWYWwgPSBnZXROYXRpdmVEYXRlT2JqZWN0KG5ld1ZhbC50YXJnZXQudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZXdWYWwpIHtcbiAgICAgICAgICAgIHRoaXMuYnNUaW1lVmFsdWUgPSBuZXdWYWw7XG4gICAgICAgICAgICAvLyBpZiB0aGUgbmV3VmFsIGlzIHZhbGlkIGJ1dCBub3QgaW4gdGhlIGdpdmVuIHJhbmdlIHRoZW4gaGlnaGxpZ2h0IHRoZSBpbnB1dCBmaWVsZFxuICAgICAgICAgICAgdGhpcy50aW1lTm90SW5SYW5nZSA9IHRoaXMubWluVGltZSAmJiB0aGlzLm1heFRpbWUgJiYgKG5ld1ZhbCA8IHRoaXMubWluVGltZSB8fCBuZXdWYWwgPiB0aGlzLm1heFRpbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc29tZXRpbWVzIGxpYnJhcnkgaXMgbm90IHJldHVybmluZyB0aGUgY29ycmVjdCB2YWx1ZSB3aGVuIHRoZSBtaW4gYW5kIG1heCB0aW1lIGFyZSBnaXZlbiwgZGlzcGxheWluZyB0aGUgZGF0YXZhbHVlIGJhc2VkIG9uIHRoZSB2YWx1ZSBnaXZlbiBieSB0aGUgdXNlclxuICAgICAgICAgICAgaWYgKHRoaXMuYnNUaW1lUGlja2VyICYmIHRoaXMuYnNUaW1lUGlja2VyLm1pbiAmJiB0aGlzLmJzVGltZVBpY2tlci5tYXgpIHtcbiAgICAgICAgICAgICAgICBtaW5UaW1lTWVyaWRpYW4gPSBtb21lbnQobmV3IERhdGUodGhpcy5ic1RpbWVQaWNrZXIubWluKSkuZm9ybWF0KCdBJyk7XG4gICAgICAgICAgICAgICAgbWF4VGltZU1lcmlkaWFuID0gbW9tZW50KG5ldyBEYXRlKHRoaXMuYnNUaW1lUGlja2VyLm1heCkpLmZvcm1hdCgnQScpO1xuICAgICAgICAgICAgICAgIHRpbWVWYWx1ZSA9IHRoaXMuYnNUaW1lUGlja2VyLmhvdXJzICsgJzonICsgKHRoaXMuYnNUaW1lUGlja2VyLm1pbnV0ZXMgfHwgMCkgKyAnOicgKyAodGhpcy5ic1RpbWVQaWNrZXIuc2Vjb25kcyB8fCAwKSArICh0aGlzLmJzVGltZVBpY2tlci5zaG93TWVyaWRpYW4gPyAoJyAnICsgbWluVGltZU1lcmlkaWFuKSA6ICcnKTtcbiAgICAgICAgICAgICAgICB0aW1lSW5wdXRWYWx1ZSA9ICBnZXROYXRpdmVEYXRlT2JqZWN0KHRpbWVWYWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ic1RpbWVQaWNrZXIubWVyaWRpYW4gPSBtaW5UaW1lTWVyaWRpYW47XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lTm90SW5SYW5nZSA9ICh0aGlzLmJzVGltZVBpY2tlci5taW4gPiB0aW1lSW5wdXRWYWx1ZSB8fCB0aGlzLmJzVGltZVBpY2tlci5tYXggPCB0aW1lSW5wdXRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJzVGltZVZhbHVlID0gdGltZUlucHV0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnZva2VPblRvdWNoZWQoKTtcbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwge30sIHRydWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHVzZWQgdG8gbWFpbnRhaW4gYSB0aW1lIGludGVydmFsIHRvIHVwZGF0ZSB0aGUgdGltZSBtb2RlbCB3aGVuIHRoZSBkYXRhIHZhbHVlIGlzIHNldCB0byBDVVJSRU5UX1RJTUVcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldFRpbWVJbnRlcnZhbCgpIHtcbiAgICAgICAgaWYgKHRoaXMudGltZWludGVydmFsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aW1laW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCggKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIG5vdy5zZXRTZWNvbmRzKG5vdy5nZXRTZWNvbmRzKCkgKyAxKTtcbiAgICAgICAgICAgIHRoaXMuZGF0YXZhbHVlID0gQ1VSUkVOVF9USU1FO1xuICAgICAgICAgICAgdGhpcy5vblRpbWVDaGFuZ2Uobm93KTtcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBpcyBhbiBpbnRlcm5hbCBtZXRob2QgdXNlZCB0byBjbGVhciB0aGUgdGltZSBpbnRlcnZhbCBjcmVhdGVkXG4gICAgICovXG4gICAgcHJpdmF0ZSBjbGVhclRpbWVJbnRlcnZhbCgpIHtcbiAgICAgICAgaWYgKHRoaXMudGltZWludGVydmFsKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMudGltZWludGVydmFsKTtcbiAgICAgICAgICAgIHRoaXMudGltZWludGVydmFsID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gc2V0cyB0aGUgdmFsdWUgaXNPcGVuL2lzVGltZU9wZW4gKGkuZSB3aGVuIGRhdGVwaWNrZXIgcG9wdXAgaXMgY2xvc2VkKSBiYXNlZCBvbiB3aWRnZXQgdHlwZShpLmUgIERhdGVUaW1lLCBUaW1lKVxuICAgICAqIEBwYXJhbSB2YWwgLSBpc09wZW4vaXNUaW1lT3BlbiBpcyBzZXQgYmFzZWQgb24gdGhlIHRpbWVwaWNrZXIgcG9wdXAgaXMgb3Blbi9jbG9zZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldElzVGltZU9wZW4odmFsOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuc3RhdHVzLmlzb3BlbiA9IHZhbDtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgZXZlbnQgaXMgcmVnaXN0ZXJlZCBmcm9tIHRoZSB0ZW1wbGF0ZSwgUHJldmVudCB0aGUgZnJhbWV3b3JrIGZyb20gcmVnaXN0ZXJpbmcgb25lIG1vcmUgZXZlbnRcbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBldmVudENhbGxiYWNrOiBGdW5jdGlvbiwgbG9jYWxzOiBhbnkpIHtcbiAgICAgICAgaWYgKCFfLmluY2x1ZGVzKFsnYmx1cicsICdmb2N1cycsICdjaGFuZ2UnLCAnY2xpY2snXSwgZXZlbnROYW1lKSkge1xuICAgICAgICAgICAgc3VwZXIuaGFuZGxlRXZlbnQobm9kZSwgZXZlbnROYW1lLCBldmVudENhbGxiYWNrLCBsb2NhbHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoaWRlVGltZXBpY2tlckRyb3Bkb3duKCkge1xuICAgICAgICB0aGlzLmludm9rZU9uVG91Y2hlZCgpO1xuICAgICAgICB0aGlzLnN0YXR1cy5pc29wZW4gPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuZGVyZWdpc3RlckV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZGVyZWdpc3RlckV2ZW50TGlzdGVuZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaXNWYWxpZChldmVudCkge1xuICAgICAgICBpZiAoIWV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBlbnRlcmVkRGF0ZSA9ICQodGhpcy5uYXRpdmVFbGVtZW50KS5maW5kKCdpbnB1dCcpLnZhbCgpO1xuICAgICAgICAgICAgY29uc3QgbmV3VmFsID0gZ2V0TmF0aXZlRGF0ZU9iamVjdChlbnRlcmVkRGF0ZSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZm9ybWF0VmFsaWRhdGlvbihuZXdWYWwsIGVudGVyZWREYXRlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB0byBhZGQgY3NzIGNsYXNzIGZvciBkcm9wZG93biB3aGlsZSBvcGVuaW5nIHRoZSB0aW1lIGRyb3Bkb3duXG4gICAgICovXG4gICAgcHVibGljIG9uU2hvd24oKSB7XG4gICAgICAgIGNvbnN0IHRwRWxlbWVudHMgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgndGltZXBpY2tlcicpO1xuICAgICAgICBfLmZvckVhY2godHBFbGVtZW50cywgZWxlbWVudCA9PiB7XG4gICAgICAgICAgICBhZGRDbGFzcyhlbGVtZW50LnBhcmVudEVsZW1lbnQgYXMgSFRNTEVsZW1lbnQsICdhcHAtZGF0ZXRpbWUnLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZm9jdXNUaW1lUGlja2VyUG9wb3Zlcih0aGlzKTtcbiAgICAgICAgdGhpcy5iaW5kVGltZVBpY2tlcktleWJvYXJkRXZlbnRzKCk7XG4gICAgICAgIGFkanVzdENvbnRhaW5lclBvc2l0aW9uKCQoJ2JzLWRyb3Bkb3duLWNvbnRhaW5lcicpLCB0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMuYnNEcm9wZG93bi5fZHJvcGRvd24sICQoJ2JzLWRyb3Bkb3duLWNvbnRhaW5lciAuZHJvcGRvd24tbWVudScpKTtcbiAgICB9XG59XG4iXX0=