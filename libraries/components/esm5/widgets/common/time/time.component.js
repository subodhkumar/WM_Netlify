import * as tslib_1 from "tslib";
import { Component, Inject, Injector, NgZone, ViewChild } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { TimepickerComponent } from 'ngx-bootstrap';
import { $appDigest, addClass, addEventListenerOnElement, adjustContainerPosition, AppDefaults, FormWidgetType, getDisplayDateTimeFormat, getFormattedDate, getNativeDateObject } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './time.props';
import { provideAsNgValidators, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { BaseDateTimeComponent } from '../base/base-date-time.component';
var CURRENT_TIME = 'CURRENT_TIME';
var DEFAULT_CLS = 'input-group app-timeinput';
var WIDGET_CONFIG = { widgetType: 'wm-time', hostClass: DEFAULT_CLS };
var TimeComponent = /** @class */ (function (_super) {
    tslib_1.__extends(TimeComponent, _super);
    function TimeComponent(inj, ngZone, appDefaults, evtMngrPlugins) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.ngZone = ngZone;
        _this.appDefaults = appDefaults;
        /**
         * This is an internal property used to toggle the timepicker dropdown
         */
        _this.status = { isopen: false };
        // KeyEventsPlugin
        _this.keyEventPlugin = evtMngrPlugins[1];
        styler(_this.nativeElement, _this);
        /**
         * Destroy the timer once the date widget is gone
         */
        _this.registerDestroyListener(function () { return _this.clearTimeInterval(); });
        _this.timepattern = _this.appDefaults.timeFormat || getDisplayDateTimeFormat(FormWidgetType.TIME);
        _this.updateFormat('timepattern');
        return _this;
    }
    Object.defineProperty(TimeComponent.prototype, "timestamp", {
        get: function () {
            return this.bsTimeValue ? this.bsTimeValue.valueOf() : undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeComponent.prototype, "datavalue", {
        get: function () {
            if (this.isCurrentTime && !this.bsTimeValue) {
                return CURRENT_TIME;
            }
            return getFormattedDate(this.datePipe, this.bsTimeValue, this.outputformat) || '';
        },
        /**Todo[Shubham]: needs to be redefined
         * This property sets the default value for the time selection
         */
        set: function (newVal) {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeComponent.prototype, "displayValue", {
        get: function () {
            return getFormattedDate(this.datePipe, this.bsTimeValue, this.timepattern) || '';
        },
        enumerable: true,
        configurable: true
    });
    TimeComponent.prototype.onPropertyChange = function (key, nv, ov) {
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
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    /**
     * This is an internal method used to validate mintime and maxtime
     */
    TimeComponent.prototype.mintimeMaxtimeValidation = function () {
        this.timeNotInRange = this.minTime && this.maxTime && (this.bsTimeValue < this.minTime || this.bsTimeValue > this.maxTime);
        this.invokeOnChange(this.datavalue, undefined, false);
    };
    /**
     * This is an internal method used to toggle the dropdown of the time widget
     */
    TimeComponent.prototype.toggleDropdown = function ($event) {
        var _this = this;
        if ($event.type === 'click') {
            this.invokeEventCallback('click', { $event: $event });
        }
        if ($event.target && $($event.target).is('input') && !(this.isDropDownDisplayEnabledOnInput(this.showdropdownon))) {
            return;
        }
        this.ngZone.run(function () {
            _this.status.isopen = !_this.status.isopen;
        });
        this.addBodyClickListener(this.status.isopen);
    };
    /**
     * This is an internal method used to Prevent time picker close while changing time value
     */
    TimeComponent.prototype.preventTpClose = function ($event) {
        $event.stopImmediatePropagation();
    };
    TimeComponent.prototype.addBodyClickListener = function (skipListener) {
        var _this = this;
        if (!skipListener) {
            return;
        }
        var bodyElement = document.querySelector('body');
        setTimeout(function () {
            var dropdownElement = $(bodyElement).find('>bs-dropdown-container .dropdown-menu').get(0);
            _this.deregisterEventListener = addEventListenerOnElement(bodyElement, dropdownElement, _this.nativeElement, 'click', _this.isDropDownDisplayEnabledOnInput(_this.showdropdownon), function () {
                _this.status.isopen = false;
            }, 0 /* ONCE */, true);
        }, 350);
    };
    /**
     * This is an internal method triggered when pressing key on the time input
     */
    TimeComponent.prototype.onDisplayKeydown = function (event) {
        if (this.isDropDownDisplayEnabledOnInput(this.showdropdownon)) {
            event.stopPropagation();
            var action = this.keyEventPlugin.constructor.getEventFullKey(event);
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
    };
    /**
     * This is an internal method triggered when the time input changes
     */
    TimeComponent.prototype.onDisplayTimeChange = function ($event) {
        var newVal = getNativeDateObject($event.target.value);
        // time pattern validation
        // if invalid pattern is entered, device is showing an error.
        if (!this.formatValidation(newVal, $event.target.value)) {
            return;
        }
        this.invalidDateTimeFormat = false;
        this.onTimeChange(newVal);
    };
    TimeComponent.prototype.onInputBlur = function ($event) {
        if (!$($event.relatedTarget).hasClass('bs-timepicker-field')) {
            this.invokeOnTouched();
            this.invokeEventCallback('blur', { $event: $event });
        }
    };
    /**
     * This is an internal method used to execute the on time change functionality
     */
    TimeComponent.prototype.onTimeChange = function (newVal, isNativePicker) {
        var timeValue, timeInputValue, minTimeMeridian, maxTimeMeridian;
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
    };
    /**
     * This is an internal method used to maintain a time interval to update the time model when the data value is set to CURRENT_TIME
     */
    TimeComponent.prototype.setTimeInterval = function () {
        var _this = this;
        if (this.timeinterval) {
            return;
        }
        this.timeinterval = setInterval(function () {
            var now = new Date();
            now.setSeconds(now.getSeconds() + 1);
            _this.datavalue = CURRENT_TIME;
            _this.onTimeChange(now);
        }, 1000);
    };
    /**
     * This is an internal method used to clear the time interval created
     */
    TimeComponent.prototype.clearTimeInterval = function () {
        if (this.timeinterval) {
            clearInterval(this.timeinterval);
            this.timeinterval = null;
        }
    };
    /**
     * This function sets the value isOpen/isTimeOpen (i.e when datepicker popup is closed) based on widget type(i.e  DateTime, Time)
     * @param val - isOpen/isTimeOpen is set based on the timepicker popup is open/closed
     */
    TimeComponent.prototype.setIsTimeOpen = function (val) {
        this.status.isopen = val;
    };
    // Change event is registered from the template, Prevent the framework from registering one more event
    TimeComponent.prototype.handleEvent = function (node, eventName, eventCallback, locals) {
        if (!_.includes(['blur', 'focus', 'change', 'click'], eventName)) {
            _super.prototype.handleEvent.call(this, node, eventName, eventCallback, locals);
        }
    };
    TimeComponent.prototype.hideTimepickerDropdown = function () {
        this.invokeOnTouched();
        this.status.isopen = false;
        if (this.deregisterEventListener) {
            this.deregisterEventListener();
        }
    };
    TimeComponent.prototype.isValid = function (event) {
        if (!event) {
            var enteredDate = $(this.nativeElement).find('input').val();
            var newVal = getNativeDateObject(enteredDate);
            if (!this.formatValidation(newVal, enteredDate)) {
                return;
            }
        }
    };
    /**
     * This is an internal method to add css class for dropdown while opening the time dropdown
     */
    TimeComponent.prototype.onShown = function () {
        var tpElements = document.querySelectorAll('timepicker');
        _.forEach(tpElements, function (element) {
            addClass(element.parentElement, 'app-datetime', true);
        });
        this.focusTimePickerPopover(this);
        this.bindTimePickerKeyboardEvents();
        adjustContainerPosition($('bs-dropdown-container'), this.nativeElement, this.bsDropdown._dropdown, $('bs-dropdown-container .dropdown-menu'));
    };
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
    TimeComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: NgZone },
        { type: AppDefaults },
        { type: undefined, decorators: [{ type: Inject, args: [EVENT_MANAGER_PLUGINS,] }] }
    ]; };
    TimeComponent.propDecorators = {
        bsTimePicker: [{ type: ViewChild, args: [TimepickerComponent,] }]
    };
    return TimeComponent;
}(BaseDateTimeComponent));
export { TimeComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RpbWUvdGltZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQWEsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzFGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRWxFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVwRCxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSx5QkFBeUIsRUFBRSx1QkFBdUIsRUFBRSxXQUFXLEVBQWMsY0FBYyxFQUFFLHdCQUF3QixFQUFFLGdCQUFnQixFQUFFLG1CQUFtQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTlNLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2xILE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBRXpFLElBQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQztBQUNwQyxJQUFNLFdBQVcsR0FBRywyQkFBMkIsQ0FBQztBQUNoRCxJQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBSXRFO0lBU21DLHlDQUFxQjtJQWtGcEQsdUJBQ0ksR0FBYSxFQUNMLE1BQWMsRUFDZCxXQUF3QixFQUNELGNBQWM7UUFKakQsWUFNSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBYTVCO1FBakJX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SUFBSSxDQUFDLENBQUM7UUFDekUsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7UUFDcEMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO0lBQ2xKLENBQUM7SUFoVE0sNkJBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBVjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsVUFBVTtvQkFDcEIsaTBGQUFvQztvQkFDcEMsU0FBUyxFQUFFO3dCQUNQLHdCQUF3QixDQUFDLGFBQWEsQ0FBQzt3QkFDdkMscUJBQXFCLENBQUMsYUFBYSxDQUFDO3dCQUNwQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUM7cUJBQ3BDO2lCQUNKOzs7O2dCQTFCMkIsUUFBUTtnQkFBRSxNQUFNO2dCQUt1QyxXQUFXO2dEQTRHckYsTUFBTSxTQUFDLHFCQUFxQjs7OytCQU5oQyxTQUFTLFNBQUMsbUJBQW1COztJQWtPbEMsb0JBQUM7Q0FBQSxBQTNURCxDQVNtQyxxQkFBcUIsR0FrVHZEO1NBbFRZLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEluamVjdCwgSW5qZWN0b3IsIE5nWm9uZSwgT25EZXN0cm95LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEVWRU5UX01BTkFHRVJfUExVR0lOUyB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG5pbXBvcnQgeyBUaW1lcGlja2VyQ29tcG9uZW50IH0gZnJvbSAnbmd4LWJvb3RzdHJhcCc7XG5cbmltcG9ydCB7ICRhcHBEaWdlc3QsIGFkZENsYXNzLCBhZGRFdmVudExpc3RlbmVyT25FbGVtZW50LCBhZGp1c3RDb250YWluZXJQb3NpdGlvbiwgQXBwRGVmYXVsdHMsIEVWRU5UX0xJRkUsIEZvcm1XaWRnZXRUeXBlLCBnZXREaXNwbGF5RGF0ZVRpbWVGb3JtYXQsIGdldEZvcm1hdHRlZERhdGUsIGdldE5hdGl2ZURhdGVPYmplY3QgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vdGltZS5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbGlkYXRvcnMsIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IEJhc2VEYXRlVGltZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2UvYmFzZS1kYXRlLXRpbWUuY29tcG9uZW50JztcblxuY29uc3QgQ1VSUkVOVF9USU1FID0gJ0NVUlJFTlRfVElNRSc7XG5jb25zdCBERUZBVUxUX0NMUyA9ICdpbnB1dC1ncm91cCBhcHAtdGltZWlucHV0JztcbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLXRpbWUnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuZGVjbGFyZSBjb25zdCBfLCBtb21lbnQsICQ7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtVGltZV0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi90aW1lLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKFRpbWVDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNOZ1ZhbGlkYXRvcnMoVGltZUNvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihUaW1lQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgVGltZUNvbXBvbmVudCBleHRlbmRzIEJhc2VEYXRlVGltZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcbiAgICAvKipcbiAgICAgKiBUaGlzIHByb3BlcnR5IHNldHMgdGhlIGRpc3BsYXkgcGF0dGVybiBvZiB0aGUgdGltZSBzZWxlY3RlZFxuICAgICAqL1xuICAgIHRpbWVwYXR0ZXJuOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHByb3BlcnR5IHNldHMgdGhlIG91dHB1dCBmb3JtYXQgZm9yIHRoZSBzZWxlY3RlZCB0aW1lIGRhdGF2YWx1ZVxuICAgICAqL1xuICAgIG91dHB1dGZvcm1hdDogc3RyaW5nO1xuXG4gICAgcHVibGljIHNob3dkcm9wZG93bm9uOiBzdHJpbmc7XG5cbiAgICBwcml2YXRlIGRlcmVnaXN0ZXJFdmVudExpc3RlbmVyO1xuXG4gICAgZ2V0IHRpbWVzdGFtcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnNUaW1lVmFsdWUgPyB0aGlzLmJzVGltZVZhbHVlLnZhbHVlT2YoKSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBnZXQgZGF0YXZhbHVlKCk6IGFueSB7XG4gICAgICAgIGlmICh0aGlzLmlzQ3VycmVudFRpbWUgJiYgIXRoaXMuYnNUaW1lVmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBDVVJSRU5UX1RJTUU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdldEZvcm1hdHRlZERhdGUodGhpcy5kYXRlUGlwZSwgdGhpcy5ic1RpbWVWYWx1ZSwgdGhpcy5vdXRwdXRmb3JtYXQpIHx8ICcnO1xuICAgIH1cblxuICAgIC8qKlRvZG9bU2h1YmhhbV06IG5lZWRzIHRvIGJlIHJlZGVmaW5lZFxuICAgICAqIFRoaXMgcHJvcGVydHkgc2V0cyB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhlIHRpbWUgc2VsZWN0aW9uXG4gICAgICovXG4gICAgc2V0IGRhdGF2YWx1ZShuZXdWYWw6IGFueSkge1xuICAgICAgICBpZiAobmV3VmFsKSB7XG4gICAgICAgICAgICBpZiAobmV3VmFsID09PSBDVVJSRU5UX1RJTUUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ3VycmVudFRpbWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGltZUludGVydmFsKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lSW50ZXJ2YWwoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJzVGltZVZhbHVlID0gZ2V0TmF0aXZlRGF0ZU9iamVjdChuZXdWYWwpO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDdXJyZW50VGltZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ic1RpbWVWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lSW50ZXJ2YWwoKTtcbiAgICAgICAgICAgIHRoaXMuaXNDdXJyZW50VGltZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUpO1xuICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgfVxuXG4gICAgZ2V0IGRpc3BsYXlWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIGdldEZvcm1hdHRlZERhdGUodGhpcy5kYXRlUGlwZSwgdGhpcy5ic1RpbWVWYWx1ZSwgdGhpcy50aW1lcGF0dGVybikgfHwgJyc7XG4gICAgfVxuXG4gICAgLyogSW50ZXJuYWwgcHJvcGVydHkgdG8gaGF2ZSBhIGZsYWcgdG8gY2hlY2sgdGhlIGdpdmVuIGRhdGF2YWx1ZSBpcyBvZiBDdXJyZW50IHRpbWUqL1xuICAgIHByaXZhdGUgaXNDdXJyZW50VGltZTogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgdGltZWludGVydmFsOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIHByb3BlcnR5IHVzZWQgdG8gbWFwIGl0IHRvIHRoZSB3aWRnZXRcbiAgICAgKi9cbiAgICBwcml2YXRlIG1pblRpbWU6IERhdGU7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIHByb3BlcnR5IHVzZWQgdG8gbWFwIGl0IHRvIHRoZSB3aWRnZXRcbiAgICAgKi9cbiAgICBwcml2YXRlIG1heFRpbWU6IERhdGU7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIHByb3BlcnR5IHVzZWQgdG8gdG9nZ2xlIHRoZSB0aW1lcGlja2VyIGRyb3Bkb3duXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0dXMgPSB7IGlzb3BlbjogZmFsc2UgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgcHJvcGVydHkgdXNlZCB0byBtYXAgdGhlIG1haW4gbW9kZWwgdG8gdGhlIHRpbWUgd2lkZ2V0XG4gICAgICovXG4gICAgcHJpdmF0ZSBic1RpbWVWYWx1ZTogRGF0ZTtcblxuICAgIHByaXZhdGUga2V5RXZlbnRQbHVnaW47XG5cbiAgICBAVmlld0NoaWxkKFRpbWVwaWNrZXJDb21wb25lbnQpIGJzVGltZVBpY2tlcjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBwcml2YXRlIG5nWm9uZTogTmdab25lLFxuICAgICAgICBwcml2YXRlIGFwcERlZmF1bHRzOiBBcHBEZWZhdWx0cyxcbiAgICAgICAgQEluamVjdChFVkVOVF9NQU5BR0VSX1BMVUdJTlMpIGV2dE1uZ3JQbHVnaW5zXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgLy8gS2V5RXZlbnRzUGx1Z2luXG4gICAgICAgIHRoaXMua2V5RXZlbnRQbHVnaW4gPSBldnRNbmdyUGx1Z2luc1sxXTtcblxuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlc3Ryb3kgdGhlIHRpbWVyIG9uY2UgdGhlIGRhdGUgd2lkZ2V0IGlzIGdvbmVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoKCkgPT4gdGhpcy5jbGVhclRpbWVJbnRlcnZhbCgpKTtcblxuICAgICAgICB0aGlzLnRpbWVwYXR0ZXJuID0gdGhpcy5hcHBEZWZhdWx0cy50aW1lRm9ybWF0IHx8IGdldERpc3BsYXlEYXRlVGltZUZvcm1hdChGb3JtV2lkZ2V0VHlwZS5USU1FKTtcbiAgICAgICAgdGhpcy51cGRhdGVGb3JtYXQoJ3RpbWVwYXR0ZXJuJyk7XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3RhYmluZGV4Jykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkgPT09ICd0aW1lcGF0dGVybicpIHtcbiAgICAgICAgICAgdGhpcy51cGRhdGVGb3JtYXQoJ3RpbWVwYXR0ZXJuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ21pbnRpbWUnKSB7XG4gICAgICAgICAgICB0aGlzLm1pblRpbWUgPSBnZXROYXRpdmVEYXRlT2JqZWN0KG52KTsgLy8gVE9ETyBpdCBpcyBzdXBwb3NlZCB0byBiZSB0aW1lIGNvbnZlcnNpb24sIG5vdCB0byB0aGUgZGF5XG4gICAgICAgICAgICB0aGlzLm1pbnRpbWVNYXh0aW1lVmFsaWRhdGlvbigpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ21heHRpbWUnKSB7XG4gICAgICAgICAgICB0aGlzLm1heFRpbWUgPSBnZXROYXRpdmVEYXRlT2JqZWN0KG52KTtcbiAgICAgICAgICAgIHRoaXMubWludGltZU1heHRpbWVWYWxpZGF0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHVzZWQgdG8gdmFsaWRhdGUgbWludGltZSBhbmQgbWF4dGltZVxuICAgICAqL1xuICAgIHByaXZhdGUgbWludGltZU1heHRpbWVWYWxpZGF0aW9uKCkge1xuICAgICAgICB0aGlzLnRpbWVOb3RJblJhbmdlID0gdGhpcy5taW5UaW1lICYmIHRoaXMubWF4VGltZSAmJiAodGhpcy5ic1RpbWVWYWx1ZSA8IHRoaXMubWluVGltZSB8fCB0aGlzLmJzVGltZVZhbHVlID4gdGhpcy5tYXhUaW1lKTtcbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBpcyBhbiBpbnRlcm5hbCBtZXRob2QgdXNlZCB0byB0b2dnbGUgdGhlIGRyb3Bkb3duIG9mIHRoZSB0aW1lIHdpZGdldFxuICAgICAqL1xuICAgIHByaXZhdGUgdG9nZ2xlRHJvcGRvd24oJGV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICgkZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdjbGljaycsIHskZXZlbnQ6ICRldmVudH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkZXZlbnQudGFyZ2V0ICYmICQoJGV2ZW50LnRhcmdldCkuaXMoJ2lucHV0JykgJiYgISh0aGlzLmlzRHJvcERvd25EaXNwbGF5RW5hYmxlZE9uSW5wdXQodGhpcy5zaG93ZHJvcGRvd25vbikpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzLmlzb3BlbiA9ICF0aGlzLnN0YXR1cy5pc29wZW47XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkQm9keUNsaWNrTGlzdGVuZXIodGhpcy5zdGF0dXMuaXNvcGVuKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB1c2VkIHRvIFByZXZlbnQgdGltZSBwaWNrZXIgY2xvc2Ugd2hpbGUgY2hhbmdpbmcgdGltZSB2YWx1ZVxuICAgICAqL1xuICAgIHByaXZhdGUgcHJldmVudFRwQ2xvc2UoJGV2ZW50KSB7XG4gICAgICAgICRldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZEJvZHlDbGlja0xpc3RlbmVyKHNraXBMaXN0ZW5lcikge1xuICAgICAgICBpZiAoIXNraXBMaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJvZHlFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRyb3Bkb3duRWxlbWVudCA9ICQoYm9keUVsZW1lbnQpLmZpbmQoJz5icy1kcm9wZG93bi1jb250YWluZXIgLmRyb3Bkb3duLW1lbnUnKS5nZXQoMCk7XG4gICAgICAgICAgICB0aGlzLmRlcmVnaXN0ZXJFdmVudExpc3RlbmVyID0gYWRkRXZlbnRMaXN0ZW5lck9uRWxlbWVudChib2R5RWxlbWVudCwgZHJvcGRvd25FbGVtZW50LCB0aGlzLm5hdGl2ZUVsZW1lbnQsICdjbGljaycsIHRoaXMuaXNEcm9wRG93bkRpc3BsYXlFbmFibGVkT25JbnB1dCh0aGlzLnNob3dkcm9wZG93bm9uKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzLmlzb3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgfSwgRVZFTlRfTElGRS5PTkNFLCB0cnVlKTtcbiAgICAgICAgfSwgMzUwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB0cmlnZ2VyZWQgd2hlbiBwcmVzc2luZyBrZXkgb24gdGhlIHRpbWUgaW5wdXRcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uRGlzcGxheUtleWRvd24oZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEcm9wRG93bkRpc3BsYXlFbmFibGVkT25JbnB1dCh0aGlzLnNob3dkcm9wZG93bm9uKSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb24gPSB0aGlzLmtleUV2ZW50UGx1Z2luLmNvbnN0cnVjdG9yLmdldEV2ZW50RnVsbEtleShldmVudCk7XG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnZW50ZXInIHx8IGFjdGlvbiA9PT0gJ2Fycm93ZG93bicpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlRHJvcGRvd24oZXZlbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGVUaW1lcGlja2VyRHJvcGRvd24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZVRpbWVwaWNrZXJEcm9wZG93bigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBpcyBhbiBpbnRlcm5hbCBtZXRob2QgdHJpZ2dlcmVkIHdoZW4gdGhlIHRpbWUgaW5wdXQgY2hhbmdlc1xuICAgICAqL1xuICAgIG9uRGlzcGxheVRpbWVDaGFuZ2UoJGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IG5ld1ZhbCA9IGdldE5hdGl2ZURhdGVPYmplY3QoJGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgIC8vIHRpbWUgcGF0dGVybiB2YWxpZGF0aW9uXG4gICAgICAgIC8vIGlmIGludmFsaWQgcGF0dGVybiBpcyBlbnRlcmVkLCBkZXZpY2UgaXMgc2hvd2luZyBhbiBlcnJvci5cbiAgICAgICAgaWYgKCF0aGlzLmZvcm1hdFZhbGlkYXRpb24obmV3VmFsLCAkZXZlbnQudGFyZ2V0LnZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW52YWxpZERhdGVUaW1lRm9ybWF0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25UaW1lQ2hhbmdlKG5ld1ZhbCk7XG4gICAgfVxuXG4gICAgb25JbnB1dEJsdXIoJGV2ZW50KSB7XG4gICAgICAgIGlmICghJCgkZXZlbnQucmVsYXRlZFRhcmdldCkuaGFzQ2xhc3MoJ2JzLXRpbWVwaWNrZXItZmllbGQnKSkge1xuICAgICAgICAgICAgdGhpcy5pbnZva2VPblRvdWNoZWQoKTtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnYmx1cicsIHskZXZlbnR9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHVzZWQgdG8gZXhlY3V0ZSB0aGUgb24gdGltZSBjaGFuZ2UgZnVuY3Rpb25hbGl0eVxuICAgICAqL1xuICAgIHByaXZhdGUgb25UaW1lQ2hhbmdlKG5ld1ZhbCwgaXNOYXRpdmVQaWNrZXI/OiBib29sZWFuKSB7XG4gICAgICAgIGxldCB0aW1lVmFsdWUsXG4gICAgICAgICAgICB0aW1lSW5wdXRWYWx1ZSxcbiAgICAgICAgICAgIG1pblRpbWVNZXJpZGlhbixcbiAgICAgICAgICAgIG1heFRpbWVNZXJpZGlhbjtcbiAgICAgICAgLy8gRm9yIG5hdGl2ZVBpY2tlciwgbmV3VmFsIGlzIGV2ZW50LCBnZXQgdGhlIGRhdGVvYmplY3QgZnJvbSB0aGUgZXZlbnQuXG4gICAgICAgIGlmIChpc05hdGl2ZVBpY2tlcikge1xuICAgICAgICAgICAgbmV3VmFsID0gZ2V0TmF0aXZlRGF0ZU9iamVjdChuZXdWYWwudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV3VmFsKSB7XG4gICAgICAgICAgICB0aGlzLmJzVGltZVZhbHVlID0gbmV3VmFsO1xuICAgICAgICAgICAgLy8gaWYgdGhlIG5ld1ZhbCBpcyB2YWxpZCBidXQgbm90IGluIHRoZSBnaXZlbiByYW5nZSB0aGVuIGhpZ2hsaWdodCB0aGUgaW5wdXQgZmllbGRcbiAgICAgICAgICAgIHRoaXMudGltZU5vdEluUmFuZ2UgPSB0aGlzLm1pblRpbWUgJiYgdGhpcy5tYXhUaW1lICYmIChuZXdWYWwgPCB0aGlzLm1pblRpbWUgfHwgbmV3VmFsID4gdGhpcy5tYXhUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNvbWV0aW1lcyBsaWJyYXJ5IGlzIG5vdCByZXR1cm5pbmcgdGhlIGNvcnJlY3QgdmFsdWUgd2hlbiB0aGUgbWluIGFuZCBtYXggdGltZSBhcmUgZ2l2ZW4sIGRpc3BsYXlpbmcgdGhlIGRhdGF2YWx1ZSBiYXNlZCBvbiB0aGUgdmFsdWUgZ2l2ZW4gYnkgdGhlIHVzZXJcbiAgICAgICAgICAgIGlmICh0aGlzLmJzVGltZVBpY2tlciAmJiB0aGlzLmJzVGltZVBpY2tlci5taW4gJiYgdGhpcy5ic1RpbWVQaWNrZXIubWF4KSB7XG4gICAgICAgICAgICAgICAgbWluVGltZU1lcmlkaWFuID0gbW9tZW50KG5ldyBEYXRlKHRoaXMuYnNUaW1lUGlja2VyLm1pbikpLmZvcm1hdCgnQScpO1xuICAgICAgICAgICAgICAgIG1heFRpbWVNZXJpZGlhbiA9IG1vbWVudChuZXcgRGF0ZSh0aGlzLmJzVGltZVBpY2tlci5tYXgpKS5mb3JtYXQoJ0EnKTtcbiAgICAgICAgICAgICAgICB0aW1lVmFsdWUgPSB0aGlzLmJzVGltZVBpY2tlci5ob3VycyArICc6JyArICh0aGlzLmJzVGltZVBpY2tlci5taW51dGVzIHx8IDApICsgJzonICsgKHRoaXMuYnNUaW1lUGlja2VyLnNlY29uZHMgfHwgMCkgKyAodGhpcy5ic1RpbWVQaWNrZXIuc2hvd01lcmlkaWFuID8gKCcgJyArIG1pblRpbWVNZXJpZGlhbikgOiAnJyk7XG4gICAgICAgICAgICAgICAgdGltZUlucHV0VmFsdWUgPSAgZ2V0TmF0aXZlRGF0ZU9iamVjdCh0aW1lVmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuYnNUaW1lUGlja2VyLm1lcmlkaWFuID0gbWluVGltZU1lcmlkaWFuO1xuICAgICAgICAgICAgICAgIHRoaXMudGltZU5vdEluUmFuZ2UgPSAodGhpcy5ic1RpbWVQaWNrZXIubWluID4gdGltZUlucHV0VmFsdWUgfHwgdGhpcy5ic1RpbWVQaWNrZXIubWF4IDwgdGltZUlucHV0VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ic1RpbWVWYWx1ZSA9IHRpbWVJbnB1dFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW52b2tlT25Ub3VjaGVkKCk7XG4gICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsIHt9LCB0cnVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB1c2VkIHRvIG1haW50YWluIGEgdGltZSBpbnRlcnZhbCB0byB1cGRhdGUgdGhlIHRpbWUgbW9kZWwgd2hlbiB0aGUgZGF0YSB2YWx1ZSBpcyBzZXQgdG8gQ1VSUkVOVF9USU1FXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRUaW1lSW50ZXJ2YWwoKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWVpbnRlcnZhbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZWludGVydmFsID0gc2V0SW50ZXJ2YWwoICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICBub3cuc2V0U2Vjb25kcyhub3cuZ2V0U2Vjb25kcygpICsgMSk7XG4gICAgICAgICAgICB0aGlzLmRhdGF2YWx1ZSA9IENVUlJFTlRfVElNRTtcbiAgICAgICAgICAgIHRoaXMub25UaW1lQ2hhbmdlKG5vdyk7XG4gICAgICAgIH0sIDEwMDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHVzZWQgdG8gY2xlYXIgdGhlIHRpbWUgaW50ZXJ2YWwgY3JlYXRlZFxuICAgICAqL1xuICAgIHByaXZhdGUgY2xlYXJUaW1lSW50ZXJ2YWwoKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWVpbnRlcnZhbCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVpbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGlzLnRpbWVpbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHNldHMgdGhlIHZhbHVlIGlzT3Blbi9pc1RpbWVPcGVuIChpLmUgd2hlbiBkYXRlcGlja2VyIHBvcHVwIGlzIGNsb3NlZCkgYmFzZWQgb24gd2lkZ2V0IHR5cGUoaS5lICBEYXRlVGltZSwgVGltZSlcbiAgICAgKiBAcGFyYW0gdmFsIC0gaXNPcGVuL2lzVGltZU9wZW4gaXMgc2V0IGJhc2VkIG9uIHRoZSB0aW1lcGlja2VyIHBvcHVwIGlzIG9wZW4vY2xvc2VkXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRJc1RpbWVPcGVuKHZhbDogYm9vbGVhbikge1xuICAgICAgICB0aGlzLnN0YXR1cy5pc29wZW4gPSB2YWw7XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIGV2ZW50IGlzIHJlZ2lzdGVyZWQgZnJvbSB0aGUgdGVtcGxhdGUsIFByZXZlbnQgdGhlIGZyYW1ld29yayBmcm9tIHJlZ2lzdGVyaW5nIG9uZSBtb3JlIGV2ZW50XG4gICAgcHJvdGVjdGVkIGhhbmRsZUV2ZW50KG5vZGU6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgZXZlbnRDYWxsYmFjazogRnVuY3Rpb24sIGxvY2FsczogYW55KSB7XG4gICAgICAgIGlmICghXy5pbmNsdWRlcyhbJ2JsdXInLCAnZm9jdXMnLCAnY2hhbmdlJywgJ2NsaWNrJ10sIGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgIHN1cGVyLmhhbmRsZUV2ZW50KG5vZGUsIGV2ZW50TmFtZSwgZXZlbnRDYWxsYmFjaywgbG9jYWxzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaGlkZVRpbWVwaWNrZXJEcm9wZG93bigpIHtcbiAgICAgICAgdGhpcy5pbnZva2VPblRvdWNoZWQoKTtcbiAgICAgICAgdGhpcy5zdGF0dXMuaXNvcGVuID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLmRlcmVnaXN0ZXJFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLmRlcmVnaXN0ZXJFdmVudExpc3RlbmVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGlzVmFsaWQoZXZlbnQpIHtcbiAgICAgICAgaWYgKCFldmVudCkge1xuICAgICAgICAgICAgY29uc3QgZW50ZXJlZERhdGUgPSAkKHRoaXMubmF0aXZlRWxlbWVudCkuZmluZCgnaW5wdXQnKS52YWwoKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1ZhbCA9IGdldE5hdGl2ZURhdGVPYmplY3QoZW50ZXJlZERhdGUpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmZvcm1hdFZhbGlkYXRpb24obmV3VmFsLCBlbnRlcmVkRGF0ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBpcyBhbiBpbnRlcm5hbCBtZXRob2QgdG8gYWRkIGNzcyBjbGFzcyBmb3IgZHJvcGRvd24gd2hpbGUgb3BlbmluZyB0aGUgdGltZSBkcm9wZG93blxuICAgICAqL1xuICAgIHB1YmxpYyBvblNob3duKCkge1xuICAgICAgICBjb25zdCB0cEVsZW1lbnRzICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3RpbWVwaWNrZXInKTtcbiAgICAgICAgXy5mb3JFYWNoKHRwRWxlbWVudHMsIGVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgYWRkQ2xhc3MoZWxlbWVudC5wYXJlbnRFbGVtZW50IGFzIEhUTUxFbGVtZW50LCAnYXBwLWRhdGV0aW1lJywgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmZvY3VzVGltZVBpY2tlclBvcG92ZXIodGhpcyk7XG4gICAgICAgIHRoaXMuYmluZFRpbWVQaWNrZXJLZXlib2FyZEV2ZW50cygpO1xuICAgICAgICBhZGp1c3RDb250YWluZXJQb3NpdGlvbigkKCdicy1kcm9wZG93bi1jb250YWluZXInKSwgdGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLmJzRHJvcGRvd24uX2Ryb3Bkb3duLCAkKCdicy1kcm9wZG93bi1jb250YWluZXIgLmRyb3Bkb3duLW1lbnUnKSk7XG4gICAgfVxufVxuIl19