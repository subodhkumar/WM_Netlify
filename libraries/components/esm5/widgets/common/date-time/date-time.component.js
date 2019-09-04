import * as tslib_1 from "tslib";
import { ChangeDetectorRef, Component, Inject, Injector, NgZone, ViewChild } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { BsDatepickerDirective, TimepickerComponent } from 'ngx-bootstrap';
import { addClass, addEventListenerOnElement, adjustContainerPosition, AppDefaults, FormWidgetType, getDateObj, getDisplayDateTimeFormat, getFormattedDate, getNativeDateObject } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './date-time.props';
import { provideAsNgValidators, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { BaseDateTimeComponent } from '../base/base-date-time.component';
var DEFAULT_CLS = 'app-datetime input-group';
var WIDGET_CONFIG = { widgetType: 'wm-datetime', hostClass: DEFAULT_CLS };
var CURRENT_DATE = 'CURRENT_DATE';
var DatetimeComponent = /** @class */ (function (_super) {
    tslib_1.__extends(DatetimeComponent, _super);
    function DatetimeComponent(inj, ngZone, cdRef, appDefaults, evtMngrPlugins) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.ngZone = ngZone;
        _this.cdRef = cdRef;
        _this.appDefaults = appDefaults;
        _this.isEnterPressedOnDateInput = false;
        /**
         * This property checks if the timePicker is Open
         */
        _this.isTimeOpen = false;
        /**
         * This property checks if the datePicker is Open
         */
        _this.isDateOpen = false;
        /**
         * This property is set to TRUE if the time component value is set to CURRENT_TIME; In this case the timer keeps changing the time value until the widget is available.
         */
        _this.isCurrentDate = false;
        _this._debouncedOnChange = _.debounce(_this.invokeOnChange, 10);
        _this.registerDestroyListener(function () { return _this.clearTimeInterval(); });
        styler(_this.nativeElement, _this);
        // KeyEventsPlugin
        _this.keyEventPlugin = evtMngrPlugins[1];
        _this.dateContainerCls = "app-date-" + _this.widgetId;
        _this._dateOptions.containerClass = "app-date " + _this.dateContainerCls;
        _this._dateOptions.showWeekNumbers = false;
        _this.datepattern = _this.appDefaults.dateTimeFormat || getDisplayDateTimeFormat(FormWidgetType.DATETIME);
        _this.updateFormat('datepattern');
        return _this;
    }
    Object.defineProperty(DatetimeComponent.prototype, "timestamp", {
        get: function () {
            return this.proxyModel ? this.proxyModel.valueOf() : undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatetimeComponent.prototype, "displayValue", {
        /**
         * The displayValue is the display value of the bsDateTimeValue after applying the datePattern on it.
         * @returns {any|string}
         */
        get: function () {
            return getFormattedDate(this.datePipe, this.proxyModel, this._dateOptions.dateInputFormat) || '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatetimeComponent.prototype, "datavalue", {
        get: function () {
            if (this.isCurrentDate && !this.proxyModel) {
                return CURRENT_DATE;
            }
            return getFormattedDate(this.datePipe, this.proxyModel, this.outputformat);
        },
        /**Todo[Shubham]: needs to be redefined
         * This property sets the default value for the date selection
         */
        set: function (newVal) {
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
        },
        enumerable: true,
        configurable: true
    });
    /**
     * This is an internal method used to maintain a time interval to update the time model when the data value is set to CURRENT_TIME
     */
    DatetimeComponent.prototype.setTimeInterval = function () {
        var _this = this;
        if (this.timeinterval) {
            return;
        }
        this.timeinterval = setInterval(function () {
            var currentTime = new Date();
            _this.onModelUpdate(currentTime);
        }, 1000);
    };
    /**
     * This is an internal method used to clear the time interval created
     */
    DatetimeComponent.prototype.clearTimeInterval = function () {
        if (this.timeinterval) {
            clearInterval(this.timeinterval);
            this.timeinterval = null;
        }
    };
    /**
     * This is an internal method to toggle the time picker
     */
    DatetimeComponent.prototype.toggleTimePicker = function (newVal, $event) {
        this.isTimeOpen = newVal;
        if ($event && $event.type === 'click') {
            this.invokeEventCallback('click', { $event: $event });
        }
        this.addTimepickerClickListener(this.isTimeOpen);
    };
    DatetimeComponent.prototype.addTimepickerClickListener = function (skipListener) {
        var _this = this;
        if (!skipListener) {
            return;
        }
        var bodyElement = document.querySelector('body');
        setTimeout(function () {
            var dropdownElement = $(bodyElement).find('>bs-dropdown-container .dropdown-menu').get(0);
            _this.deregisterTimepickeEventListener = addEventListenerOnElement(bodyElement, dropdownElement, _this.nativeElement, 'click', _this.isDropDownDisplayEnabledOnInput(_this.showdropdownon), function () {
                _this.toggleTimePicker(false);
            }, 0 /* ONCE */, true);
        }, 350);
    };
    /**
     * This function sets the value isOpen/isTimeOpen (i.e when datepicker popup is closed) based on widget type(i.e  DateTime, Time)
     * @param val - isOpen/isTimeOpen is set based on the timepicker popup is open/closed
     */
    DatetimeComponent.prototype.setIsTimeOpen = function (val) {
        this.isTimeOpen = val;
    };
    DatetimeComponent.prototype.hideTimepickerDropdown = function () {
        this.invokeOnTouched();
        this.toggleTimePicker(false);
        if (this.deregisterTimepickeEventListener) {
            this.deregisterTimepickeEventListener();
        }
    };
    /**
     * This is an internal method to add a click listener once the time dropdown is open
     */
    DatetimeComponent.prototype.onTimepickerOpen = function () {
        // adding class for time widget dropdown menu
        var tpElements = document.querySelectorAll('timepicker');
        _.forEach(tpElements, function (element) {
            addClass(element.parentElement, 'app-datetime', true);
        });
        this.bsDatePickerDirective.hide();
        this.focusTimePickerPopover(this);
        this.bindTimePickerKeyboardEvents();
        adjustContainerPosition($('bs-dropdown-container'), this.nativeElement, this.bsDropdown._dropdown, $('bs-dropdown-container .dropdown-menu'));
    };
    DatetimeComponent.prototype.onDatePickerOpen = function () {
        this.isDateOpen = !this.isDateOpen;
        this.toggleTimePicker(false);
        this.bsDateValue ? this.activeDate = this.bsDateValue : this.activeDate = new Date();
        if (!this.bsDateValue) {
            this.hightlightToday();
        }
        this.addDatepickerKeyboardEvents(this, true);
        adjustContainerPosition($('bs-datepicker-container'), this.nativeElement, this.bsDatePickerDirective._datepicker);
    };
    /**
     * This is an internal method to update the model
     */
    DatetimeComponent.prototype.onModelUpdate = function (newVal, type) {
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
    };
    /**
     * This is an internal method used to Prevent time picker close while changing time value
     */
    DatetimeComponent.prototype.preventTpClose = function ($event) {
        $event.stopImmediatePropagation();
    };
    /**
     * This is an internal method used to toggle the dropdown of the date widget
     */
    DatetimeComponent.prototype.toggleDpDropdown = function ($event) {
        if ($event.type === 'click') {
            this.invokeEventCallback('click', { $event: $event });
        }
        if ($event.target && $($event.target).is('input') && !(this.isDropDownDisplayEnabledOnInput(this.showdropdownon))) {
            $event.stopPropagation();
            return;
        }
        this.bsDatePickerDirective.toggle();
        this.addBodyClickListener(this.bsDatePickerDirective.isOpen);
    };
    DatetimeComponent.prototype.addBodyClickListener = function (skipListener) {
        var _this = this;
        if (!skipListener) {
            return;
        }
        var bodyElement = document.querySelector('body');
        setTimeout(function () {
            var bsDateContainerElement = bodyElement.querySelector("." + _this.dateContainerCls);
            _this.deregisterDatepickerEventListener = addEventListenerOnElement(bodyElement, bsDateContainerElement, _this.nativeElement, 'click', _this.isDropDownDisplayEnabledOnInput(_this.showdropdownon), function () {
                _this.bsDatePickerDirective.hide();
            }, 0 /* ONCE */, true);
        }, 350);
    };
    DatetimeComponent.prototype.hideDatepickerDropdown = function () {
        this.isDateOpen = false;
        this.invokeOnTouched();
        this.bsDatePickerDirective.hide();
        this.isEnterPressedOnDateInput = false;
        if (this.deregisterDatepickerEventListener) {
            this.deregisterDatepickerEventListener();
        }
    };
    DatetimeComponent.prototype.onDateChange = function ($event, isNativePicker) {
        if (this.isEnterPressedOnDateInput) {
            this.isEnterPressedOnDateInput = false;
            return;
        }
        var newVal = $event.target.value.trim();
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
    };
    /**
     * This is an internal method triggered when pressing key on the datetime input
     */
    DatetimeComponent.prototype.onDisplayKeydown = function (event) {
        if (this.isDropDownDisplayEnabledOnInput(this.showdropdownon)) {
            event.stopPropagation();
            var newVal = event.target.value.trim();
            newVal = newVal ? getNativeDateObject(newVal) : undefined;
            var action = this.keyEventPlugin.constructor.getEventFullKey(event);
            if (action === 'enter' || action === 'arrowdown') {
                event.preventDefault();
                var formattedDate = getFormattedDate(this.datePipe, newVal, this._dateOptions.dateInputFormat);
                var inputVal = event.target.value.trim();
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
    };
    DatetimeComponent.prototype.isValid = function (event) {
        if (!event) {
            var enteredDate = $(this.nativeElement).find('input').val();
            var newVal = getNativeDateObject(enteredDate);
            if (!this.formatValidation(newVal, enteredDate)) {
                return;
            }
        }
    };
    // change and blur events are added from the template
    DatetimeComponent.prototype.handleEvent = function (node, eventName, callback, locals) {
        if (!_.includes(['blur', 'focus', 'change', 'click'], eventName)) {
            _super.prototype.handleEvent.call(this, node, eventName, callback, locals);
        }
    };
    DatetimeComponent.prototype.onInputBlur = function ($event) {
        if (!$($event.relatedTarget).hasClass('current-date')) {
            this.invokeOnTouched();
            this.invokeEventCallback('blur', { $event: $event });
        }
    };
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
    DatetimeComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: NgZone },
        { type: ChangeDetectorRef },
        { type: AppDefaults },
        { type: undefined, decorators: [{ type: Inject, args: [EVENT_MANAGER_PLUGINS,] }] }
    ]; };
    DatetimeComponent.propDecorators = {
        bsDatePickerDirective: [{ type: ViewChild, args: [BsDatepickerDirective,] }],
        bsTimePicker: [{ type: ViewChild, args: [TimepickerComponent,] }]
    };
    return DatetimeComponent;
}(BaseDateTimeComponent));
export { DatetimeComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS10aW1lLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZGF0ZS10aW1lL2RhdGUtdGltZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFhLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1SCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVsRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0UsT0FBTyxFQUFFLFFBQVEsRUFBRSx5QkFBeUIsRUFBRSx1QkFBdUIsRUFBRSxXQUFXLEVBQWMsY0FBYyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsRUFBRSxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU5TSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2xILE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBSXpFLElBQU0sV0FBVyxHQUFHLDBCQUEwQixDQUFDO0FBQy9DLElBQU0sYUFBYSxHQUFHLEVBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFFMUUsSUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDO0FBRXBDO0lBU3VDLDZDQUFxQjtJQStFeEQsMkJBQ0ksR0FBYSxFQUNMLE1BQWMsRUFDZCxLQUF3QixFQUN4QixXQUF3QixFQUNE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cUJBQXFCOytCQUMvQixTQUFTLFNBQUMsbUJBQW1COztJQWlVbEMsd0JBQUM7Q0FBQSxBQXhXRCxDQVN1QyxxQkFBcUIsR0ErVjNEO1NBL1ZZLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnQsIEluamVjdCwgSW5qZWN0b3IsIE5nWm9uZSwgT25EZXN0cm95LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEVWRU5UX01BTkFHRVJfUExVR0lOUyB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG5pbXBvcnQgeyBCc0RhdGVwaWNrZXJEaXJlY3RpdmUsIFRpbWVwaWNrZXJDb21wb25lbnQgfSBmcm9tICduZ3gtYm9vdHN0cmFwJztcblxuaW1wb3J0IHsgYWRkQ2xhc3MsIGFkZEV2ZW50TGlzdGVuZXJPbkVsZW1lbnQsIGFkanVzdENvbnRhaW5lclBvc2l0aW9uLCBBcHBEZWZhdWx0cywgRVZFTlRfTElGRSwgRm9ybVdpZGdldFR5cGUsIGdldERhdGVPYmosIGdldERpc3BsYXlEYXRlVGltZUZvcm1hdCwgZ2V0Rm9ybWF0dGVkRGF0ZSwgZ2V0TmF0aXZlRGF0ZU9iamVjdCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9kYXRlLXRpbWUucHJvcHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzTmdWYWxpZGF0b3JzLCBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBCYXNlRGF0ZVRpbWVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL2Jhc2UtZGF0ZS10aW1lLmNvbXBvbmVudCc7XG5cbmRlY2xhcmUgY29uc3QgbW9tZW50LCAkLCBfO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtZGF0ZXRpbWUgaW5wdXQtZ3JvdXAnO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tZGF0ZXRpbWUnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuY29uc3QgQ1VSUkVOVF9EQVRFID0gJ0NVUlJFTlRfREFURSc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtRGF0ZVRpbWVdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vZGF0ZS10aW1lLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKERhdGV0aW1lQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzTmdWYWxpZGF0b3JzKERhdGV0aW1lQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKERhdGV0aW1lQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgRGF0ZXRpbWVDb21wb25lbnQgZXh0ZW5kcyBCYXNlRGF0ZVRpbWVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG4gICAgLyoqXG4gICAgICogVGhlIGJlbG93IHByb3BldGllcyBwcmVmaXhlZCB3aXRoIFwiYnNcIiBhbHdheXMgaG9sZHMgdGhlIHZhbHVlIHRoYXQgaXMgc2VsZWN0ZWQgZnJvbSB0aGUgZGF0ZXBpY2tlci5cbiAgICAgKiBUaGUgYnNEYXRlVGltZVZhbHVlID0gYnNEYXRlVmFsdWUgKyBic1RpbWVWYWx1ZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGJzRGF0ZVRpbWVWYWx1ZTogYW55O1xuICAgIHByaXZhdGUgYnNEYXRlVmFsdWU7XG4gICAgcHJpdmF0ZSBic1RpbWVWYWx1ZTtcbiAgICBwcml2YXRlIHByb3h5TW9kZWw7XG5cbiAgICBwdWJsaWMgc2hvd2Ryb3Bkb3dub246IHN0cmluZztcbiAgICBwcml2YXRlIGtleUV2ZW50UGx1Z2luO1xuICAgIHByaXZhdGUgZGVyZWdpc3RlckRhdGVwaWNrZXJFdmVudExpc3RlbmVyO1xuICAgIHByaXZhdGUgZGVyZWdpc3RlclRpbWVwaWNrZUV2ZW50TGlzdGVuZXI7XG4gICAgcHJpdmF0ZSBpc0VudGVyUHJlc3NlZE9uRGF0ZUlucHV0ID0gZmFsc2U7XG5cbiAgICBnZXQgdGltZXN0YW1wKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm94eU1vZGVsID8gdGhpcy5wcm94eU1vZGVsLnZhbHVlT2YoKSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGlzcGxheVZhbHVlIGlzIHRoZSBkaXNwbGF5IHZhbHVlIG9mIHRoZSBic0RhdGVUaW1lVmFsdWUgYWZ0ZXIgYXBwbHlpbmcgdGhlIGRhdGVQYXR0ZXJuIG9uIGl0LlxuICAgICAqIEByZXR1cm5zIHthbnl8c3RyaW5nfVxuICAgICAqL1xuICAgIGdldCBkaXNwbGF5VmFsdWUoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIGdldEZvcm1hdHRlZERhdGUodGhpcy5kYXRlUGlwZSwgdGhpcy5wcm94eU1vZGVsLCB0aGlzLl9kYXRlT3B0aW9ucy5kYXRlSW5wdXRGb3JtYXQpIHx8ICcnO1xuICAgIH1cblxuICAgIEBWaWV3Q2hpbGQoQnNEYXRlcGlja2VyRGlyZWN0aXZlKSBic0RhdGVQaWNrZXJEaXJlY3RpdmU7XG4gICAgQFZpZXdDaGlsZChUaW1lcGlja2VyQ29tcG9uZW50KSBic1RpbWVQaWNrZXI7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHByb3BlcnR5IGNoZWNrcyBpZiB0aGUgdGltZVBpY2tlciBpcyBPcGVuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc1RpbWVPcGVuID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHByb3BlcnR5IGNoZWNrcyBpZiB0aGUgZGF0ZVBpY2tlciBpcyBPcGVuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc0RhdGVPcGVuID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHRpbWVpbnRlcnZhbCBpcyB1c2VkIHRvIHJ1biB0aGUgdGltZXIgd2hlbiB0aGUgdGltZSBjb21wb25lbnQgdmFsdWUgaXMgc2V0IHRvIENVUlJFTlRfVElNRSBpbiBwcm9wZXJ0aWVzIHBhbmVsLlxuICAgICAqL1xuICAgIHByaXZhdGUgdGltZWludGVydmFsOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHByb3BlcnR5IGlzIHNldCB0byBUUlVFIGlmIHRoZSB0aW1lIGNvbXBvbmVudCB2YWx1ZSBpcyBzZXQgdG8gQ1VSUkVOVF9USU1FOyBJbiB0aGlzIGNhc2UgdGhlIHRpbWVyIGtlZXBzIGNoYW5naW5nIHRoZSB0aW1lIHZhbHVlIHVudGlsIHRoZSB3aWRnZXQgaXMgYXZhaWxhYmxlLlxuICAgICAqL1xuICAgIHByaXZhdGUgaXNDdXJyZW50RGF0ZSA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfZGVib3VuY2VkT25DaGFuZ2U6IEZ1bmN0aW9uID0gIF8uZGVib3VuY2UodGhpcy5pbnZva2VPbkNoYW5nZSwgMTApO1xuXG4gICAgcHJpdmF0ZSBkYXRlQ29udGFpbmVyQ2xzOiBzdHJpbmc7XG5cbiAgICBnZXQgZGF0YXZhbHVlKCk6IGFueSB7XG4gICAgICAgIGlmICh0aGlzLmlzQ3VycmVudERhdGUgJiYgIXRoaXMucHJveHlNb2RlbCkge1xuICAgICAgICAgICAgcmV0dXJuIENVUlJFTlRfREFURTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2V0Rm9ybWF0dGVkRGF0ZSh0aGlzLmRhdGVQaXBlLCB0aGlzLnByb3h5TW9kZWwsIHRoaXMub3V0cHV0Zm9ybWF0KTtcbiAgICB9XG5cbiAgICAvKipUb2RvW1NodWJoYW1dOiBuZWVkcyB0byBiZSByZWRlZmluZWRcbiAgICAgKiBUaGlzIHByb3BlcnR5IHNldHMgdGhlIGRlZmF1bHQgdmFsdWUgZm9yIHRoZSBkYXRlIHNlbGVjdGlvblxuICAgICAqL1xuICAgIHNldCBkYXRhdmFsdWUobmV3VmFsOiBhbnkpIHtcbiAgICAgICAgaWYgKG5ld1ZhbCA9PT0gQ1VSUkVOVF9EQVRFKSB7XG4gICAgICAgICAgICB0aGlzLmlzQ3VycmVudERhdGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zZXRUaW1lSW50ZXJ2YWwoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHJveHlNb2RlbCA9IG5ld1ZhbCA/IGdldERhdGVPYmoobmV3VmFsKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lSW50ZXJ2YWwoKTtcbiAgICAgICAgICAgIHRoaXMuaXNDdXJyZW50RGF0ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnNUaW1lVmFsdWUgPSB0aGlzLmJzRGF0ZVZhbHVlID0gdGhpcy5wcm94eU1vZGVsO1xuICAgICAgICB0aGlzLmNkUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgICAgcHJpdmF0ZSBjZFJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgIHByaXZhdGUgYXBwRGVmYXVsdHM6IEFwcERlZmF1bHRzLFxuICAgICAgICBASW5qZWN0KEVWRU5UX01BTkFHRVJfUExVR0lOUykgZXZ0TW5nclBsdWdpbnNcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiB0aGlzLmNsZWFyVGltZUludGVydmFsKCkpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICAgICAgLy8gS2V5RXZlbnRzUGx1Z2luXG4gICAgICAgIHRoaXMua2V5RXZlbnRQbHVnaW4gPSBldnRNbmdyUGx1Z2luc1sxXTtcbiAgICAgICAgdGhpcy5kYXRlQ29udGFpbmVyQ2xzID0gYGFwcC1kYXRlLSR7dGhpcy53aWRnZXRJZH1gO1xuICAgICAgICB0aGlzLl9kYXRlT3B0aW9ucy5jb250YWluZXJDbGFzcyA9IGBhcHAtZGF0ZSAke3RoaXMuZGF0ZUNvbnRhaW5lckNsc31gO1xuICAgICAgICB0aGlzLl9kYXRlT3B0aW9ucy5zaG93V2Vla051bWJlcnMgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmRhdGVwYXR0ZXJuID0gdGhpcy5hcHBEZWZhdWx0cy5kYXRlVGltZUZvcm1hdCB8fCBnZXREaXNwbGF5RGF0ZVRpbWVGb3JtYXQoRm9ybVdpZGdldFR5cGUuREFURVRJTUUpO1xuICAgICAgICB0aGlzLnVwZGF0ZUZvcm1hdCgnZGF0ZXBhdHRlcm4nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB1c2VkIHRvIG1haW50YWluIGEgdGltZSBpbnRlcnZhbCB0byB1cGRhdGUgdGhlIHRpbWUgbW9kZWwgd2hlbiB0aGUgZGF0YSB2YWx1ZSBpcyBzZXQgdG8gQ1VSUkVOVF9USU1FXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRUaW1lSW50ZXJ2YWwoKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWVpbnRlcnZhbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZWludGVydmFsID0gc2V0SW50ZXJ2YWwoICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHRoaXMub25Nb2RlbFVwZGF0ZShjdXJyZW50VGltZSk7XG4gICAgICAgIH0sIDEwMDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHVzZWQgdG8gY2xlYXIgdGhlIHRpbWUgaW50ZXJ2YWwgY3JlYXRlZFxuICAgICAqL1xuICAgIHByaXZhdGUgY2xlYXJUaW1lSW50ZXJ2YWwoKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWVpbnRlcnZhbCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVpbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGlzLnRpbWVpbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB0byB0b2dnbGUgdGhlIHRpbWUgcGlja2VyXG4gICAgICovXG4gICAgcHJpdmF0ZSB0b2dnbGVUaW1lUGlja2VyKG5ld1ZhbCwgJGV2ZW50PzogYW55KSB7XG4gICAgICAgIHRoaXMuaXNUaW1lT3BlbiA9IG5ld1ZhbDtcbiAgICAgICAgaWYgKCRldmVudCAmJiAkZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdjbGljaycsIHskZXZlbnQ6ICRldmVudH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWRkVGltZXBpY2tlckNsaWNrTGlzdGVuZXIodGhpcy5pc1RpbWVPcGVuKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZFRpbWVwaWNrZXJDbGlja0xpc3RlbmVyKHNraXBMaXN0ZW5lcikge1xuICAgICAgICBpZiAoIXNraXBMaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJvZHlFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRyb3Bkb3duRWxlbWVudCA9ICQoYm9keUVsZW1lbnQpLmZpbmQoJz5icy1kcm9wZG93bi1jb250YWluZXIgLmRyb3Bkb3duLW1lbnUnKS5nZXQoMCk7XG4gICAgICAgICAgICB0aGlzLmRlcmVnaXN0ZXJUaW1lcGlja2VFdmVudExpc3RlbmVyID0gYWRkRXZlbnRMaXN0ZW5lck9uRWxlbWVudChib2R5RWxlbWVudCwgZHJvcGRvd25FbGVtZW50LCB0aGlzLm5hdGl2ZUVsZW1lbnQsICdjbGljaycsIHRoaXMuaXNEcm9wRG93bkRpc3BsYXlFbmFibGVkT25JbnB1dCh0aGlzLnNob3dkcm9wZG93bm9uKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlVGltZVBpY2tlcihmYWxzZSk7XG4gICAgICAgICAgICB9LCBFVkVOVF9MSUZFLk9OQ0UsIHRydWUpO1xuICAgICAgICB9LCAzNTApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gc2V0cyB0aGUgdmFsdWUgaXNPcGVuL2lzVGltZU9wZW4gKGkuZSB3aGVuIGRhdGVwaWNrZXIgcG9wdXAgaXMgY2xvc2VkKSBiYXNlZCBvbiB3aWRnZXQgdHlwZShpLmUgIERhdGVUaW1lLCBUaW1lKVxuICAgICAqIEBwYXJhbSB2YWwgLSBpc09wZW4vaXNUaW1lT3BlbiBpcyBzZXQgYmFzZWQgb24gdGhlIHRpbWVwaWNrZXIgcG9wdXAgaXMgb3Blbi9jbG9zZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldElzVGltZU9wZW4odmFsOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuaXNUaW1lT3BlbiA9IHZhbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhpZGVUaW1lcGlja2VyRHJvcGRvd24oKSB7XG4gICAgICAgIHRoaXMuaW52b2tlT25Ub3VjaGVkKCk7XG4gICAgICAgIHRoaXMudG9nZ2xlVGltZVBpY2tlcihmYWxzZSk7XG4gICAgICAgIGlmICh0aGlzLmRlcmVnaXN0ZXJUaW1lcGlja2VFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLmRlcmVnaXN0ZXJUaW1lcGlja2VFdmVudExpc3RlbmVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB0byBhZGQgYSBjbGljayBsaXN0ZW5lciBvbmNlIHRoZSB0aW1lIGRyb3Bkb3duIGlzIG9wZW5cbiAgICAgKi9cbiAgICBwcml2YXRlIG9uVGltZXBpY2tlck9wZW4oKSB7XG4gICAgICAgIC8vIGFkZGluZyBjbGFzcyBmb3IgdGltZSB3aWRnZXQgZHJvcGRvd24gbWVudVxuICAgICAgICBjb25zdCB0cEVsZW1lbnRzICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3RpbWVwaWNrZXInKTtcbiAgICAgICAgXy5mb3JFYWNoKHRwRWxlbWVudHMsIChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgICBhZGRDbGFzcyhlbGVtZW50LnBhcmVudEVsZW1lbnQgYXMgSFRNTEVsZW1lbnQsICdhcHAtZGF0ZXRpbWUnLCB0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ic0RhdGVQaWNrZXJEaXJlY3RpdmUuaGlkZSgpO1xuICAgICAgICB0aGlzLmZvY3VzVGltZVBpY2tlclBvcG92ZXIodGhpcyk7XG4gICAgICAgIHRoaXMuYmluZFRpbWVQaWNrZXJLZXlib2FyZEV2ZW50cygpO1xuICAgICAgICBhZGp1c3RDb250YWluZXJQb3NpdGlvbigkKCdicy1kcm9wZG93bi1jb250YWluZXInKSwgdGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLmJzRHJvcGRvd24uX2Ryb3Bkb3duLCAkKCdicy1kcm9wZG93bi1jb250YWluZXIgLmRyb3Bkb3duLW1lbnUnKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkRhdGVQaWNrZXJPcGVuKCkge1xuICAgICAgICB0aGlzLmlzRGF0ZU9wZW4gPSAhdGhpcy5pc0RhdGVPcGVuO1xuICAgICAgICB0aGlzLnRvZ2dsZVRpbWVQaWNrZXIoZmFsc2UpO1xuICAgICAgICB0aGlzLmJzRGF0ZVZhbHVlID8gdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5ic0RhdGVWYWx1ZSA6IHRoaXMuYWN0aXZlRGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGlmICghdGhpcy5ic0RhdGVWYWx1ZSkge1xuICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRUb2RheSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWRkRGF0ZXBpY2tlcktleWJvYXJkRXZlbnRzKHRoaXMsIHRydWUpO1xuICAgICAgICBhZGp1c3RDb250YWluZXJQb3NpdGlvbigkKCdicy1kYXRlcGlja2VyLWNvbnRhaW5lcicpLCB0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMuYnNEYXRlUGlja2VyRGlyZWN0aXZlLl9kYXRlcGlja2VyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB0byB1cGRhdGUgdGhlIG1vZGVsXG4gICAgICovXG4gICAgcHJpdmF0ZSBvbk1vZGVsVXBkYXRlKG5ld1ZhbCwgdHlwZT8pIHtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdkYXRlJykge1xuICAgICAgICAgICAgdGhpcy5pbnZhbGlkRGF0ZVRpbWVGb3JtYXQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChnZXRGb3JtYXR0ZWREYXRlKHRoaXMuZGF0ZVBpcGUsIG5ld1ZhbCwgdGhpcy5fZGF0ZU9wdGlvbnMuZGF0ZUlucHV0Rm9ybWF0KSA9PT0gdGhpcy5kaXNwbGF5VmFsdWUpIHtcbiAgICAgICAgICAgICAgICQodGhpcy5uYXRpdmVFbGVtZW50KS5maW5kKCcuZGlzcGxheS1pbnB1dCcpLnZhbCh0aGlzLmRpc3BsYXlWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gbWluIGRhdGUgYW5kIG1heCBkYXRlIHZhbGlkYXRpb24gaW4gd2ViLlxuICAgICAgICAvLyBpZiBpbnZhbGlkIGRhdGVzIGFyZSBlbnRlcmVkLCBkZXZpY2UgaXMgc2hvd2luZyB2YWxpZGF0aW9uIG1lc3NhZ2UuXG4gICAgICAgIHRoaXMubWluRGF0ZU1heERhdGVWYWxpZGF0aW9uT25JbnB1dChuZXdWYWwpO1xuICAgICAgICBpZiAoIW5ld1ZhbCkge1xuICAgICAgICAgICAgLy8gU2V0IHRpbWV2YWx1ZSBhcyAwMDowMDowMCBpZiB3ZSByZW1vdmUgYW55IG9uZSBmcm9tIGhvdXJzL21pbnV0ZXMvc2Vjb25kcyBmaWVsZCBpbiB0aW1lcGlja2VyIGFmdGVyIHNlbGVjdGluZyBkYXRlXG4gICAgICAgICAgICBpZiAodGhpcy5ic0RhdGVWYWx1ZSAmJiB0aGlzLmJzVGltZVBpY2tlciAmJiAodGhpcy5ic1RpbWVQaWNrZXIuaG91cnMgPT09ICcnIHx8IHRoaXMuYnNUaW1lUGlja2VyLm1pbnV0ZXMgPT09ICcnIHx8IHRoaXMuYnNUaW1lUGlja2VyLnNlY29uZHMgPT09ICcnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYnNEYXRlVmFsdWUgPSB0aGlzLmJzVGltZVZhbHVlID0gdGhpcy5wcm94eU1vZGVsID0gbW9tZW50KHRoaXMuYnNEYXRlVmFsdWUpLnN0YXJ0T2YoJ2RheScpLnRvRGF0ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJzRGF0ZVZhbHVlID0gdGhpcy5ic1RpbWVWYWx1ZSA9IHRoaXMucHJveHlNb2RlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2RlYm91bmNlZE9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCB7fSwgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09ICdkYXRlJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNEYXRlT3Blbikge1xuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlVGltZVBpY2tlcih0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3h5TW9kZWwgPSBuZXdWYWw7XG4gICAgICAgIGlmICh0aGlzLnByb3h5TW9kZWwpIHtcbiAgICAgICAgICAgIHRoaXMuYnNEYXRlVmFsdWUgPSB0aGlzLmJzVGltZVZhbHVlID0gdGhpcy5wcm94eU1vZGVsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2RlYm91bmNlZE9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCB7fSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuY2RSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHVzZWQgdG8gUHJldmVudCB0aW1lIHBpY2tlciBjbG9zZSB3aGlsZSBjaGFuZ2luZyB0aW1lIHZhbHVlXG4gICAgICovXG4gICAgcHJpdmF0ZSBwcmV2ZW50VHBDbG9zZSgkZXZlbnQpIHtcbiAgICAgICAgJGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHVzZWQgdG8gdG9nZ2xlIHRoZSBkcm9wZG93biBvZiB0aGUgZGF0ZSB3aWRnZXRcbiAgICAgKi9cbiAgICBwcml2YXRlIHRvZ2dsZURwRHJvcGRvd24oJGV2ZW50KSB7XG4gICAgICAgIGlmICgkZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdjbGljaycsIHskZXZlbnQ6ICRldmVudH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkZXZlbnQudGFyZ2V0ICYmICQoJGV2ZW50LnRhcmdldCkuaXMoJ2lucHV0JykgJiYgISh0aGlzLmlzRHJvcERvd25EaXNwbGF5RW5hYmxlZE9uSW5wdXQodGhpcy5zaG93ZHJvcGRvd25vbikpKSB7XG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ic0RhdGVQaWNrZXJEaXJlY3RpdmUudG9nZ2xlKCk7XG4gICAgICAgIHRoaXMuYWRkQm9keUNsaWNrTGlzdGVuZXIodGhpcy5ic0RhdGVQaWNrZXJEaXJlY3RpdmUuaXNPcGVuKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZEJvZHlDbGlja0xpc3RlbmVyKHNraXBMaXN0ZW5lcikge1xuICAgICAgICBpZiAoIXNraXBMaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJvZHlFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJzRGF0ZUNvbnRhaW5lckVsZW1lbnQgPSBib2R5RWxlbWVudC5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLmRhdGVDb250YWluZXJDbHN9YCk7XG4gICAgICAgICAgICB0aGlzLmRlcmVnaXN0ZXJEYXRlcGlja2VyRXZlbnRMaXN0ZW5lciA9IGFkZEV2ZW50TGlzdGVuZXJPbkVsZW1lbnQoYm9keUVsZW1lbnQsIGJzRGF0ZUNvbnRhaW5lckVsZW1lbnQsIHRoaXMubmF0aXZlRWxlbWVudCwgJ2NsaWNrJywgdGhpcy5pc0Ryb3BEb3duRGlzcGxheUVuYWJsZWRPbklucHV0KHRoaXMuc2hvd2Ryb3Bkb3dub24pLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ic0RhdGVQaWNrZXJEaXJlY3RpdmUuaGlkZSgpO1xuICAgICAgICAgICAgfSwgRVZFTlRfTElGRS5PTkNFLCB0cnVlKTtcbiAgICAgICAgfSwgMzUwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhpZGVEYXRlcGlja2VyRHJvcGRvd24oKSB7XG4gICAgICAgIHRoaXMuaXNEYXRlT3BlbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmludm9rZU9uVG91Y2hlZCgpO1xuICAgICAgICB0aGlzLmJzRGF0ZVBpY2tlckRpcmVjdGl2ZS5oaWRlKCk7XG4gICAgICAgIHRoaXMuaXNFbnRlclByZXNzZWRPbkRhdGVJbnB1dCA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5kZXJlZ2lzdGVyRGF0ZXBpY2tlckV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZGVyZWdpc3RlckRhdGVwaWNrZXJFdmVudExpc3RlbmVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRGF0ZUNoYW5nZSgkZXZlbnQsIGlzTmF0aXZlUGlja2VyKSB7XG4gICAgICAgIGlmICh0aGlzLmlzRW50ZXJQcmVzc2VkT25EYXRlSW5wdXQpIHtcbiAgICAgICAgICAgIHRoaXMuaXNFbnRlclByZXNzZWRPbkRhdGVJbnB1dCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBuZXdWYWwgPSAkZXZlbnQudGFyZ2V0LnZhbHVlLnRyaW0oKTtcbiAgICAgICAgbmV3VmFsID0gbmV3VmFsID8gZ2V0TmF0aXZlRGF0ZU9iamVjdChuZXdWYWwpIDogdW5kZWZpbmVkO1xuICAgICAgICAvLyBkYXRldGltZSBwYXR0ZXJuIHZhbGlkYXRpb25cbiAgICAgICAgLy8gaWYgaW52YWxpZCBwYXR0ZXJuIGlzIGVudGVyZWQsIGRldmljZSBpcyBzaG93aW5nIGFuIGVycm9yLlxuICAgICAgICBpZiAoIXRoaXMuZm9ybWF0VmFsaWRhdGlvbihuZXdWYWwsICRldmVudC50YXJnZXQudmFsdWUsIGlzTmF0aXZlUGlja2VyKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIG1pbiBkYXRlIGFuZCBtYXggZGF0ZSB2YWxpZGF0aW9uIGluIG1vYmlsZSB2aWV3LlxuICAgICAgICAvLyBpZiBpbnZhbGlkIGRhdGVzIGFyZSBlbnRlcmVkLCBkZXZpY2UgaXMgc2hvd2luZyBhbiBhbGVydC5cbiAgICAgICAgaWYgKGlzTmF0aXZlUGlja2VyICYmIHRoaXMubWluRGF0ZU1heERhdGVWYWxpZGF0aW9uT25JbnB1dChuZXdWYWwsICRldmVudCwgdGhpcy5kaXNwbGF5VmFsdWUsIGlzTmF0aXZlUGlja2VyKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW52YWxpZERhdGVUaW1lRm9ybWF0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25Nb2RlbFVwZGF0ZShuZXdWYWwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHRyaWdnZXJlZCB3aGVuIHByZXNzaW5nIGtleSBvbiB0aGUgZGF0ZXRpbWUgaW5wdXRcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uRGlzcGxheUtleWRvd24oZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEcm9wRG93bkRpc3BsYXlFbmFibGVkT25JbnB1dCh0aGlzLnNob3dkcm9wZG93bm9uKSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBsZXQgbmV3VmFsID0gZXZlbnQudGFyZ2V0LnZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIG5ld1ZhbCA9IG5ld1ZhbCA/IGdldE5hdGl2ZURhdGVPYmplY3QobmV3VmFsKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMua2V5RXZlbnRQbHVnaW4uY29uc3RydWN0b3IuZ2V0RXZlbnRGdWxsS2V5KGV2ZW50KTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdlbnRlcicgfHwgYWN0aW9uID09PSAnYXJyb3dkb3duJykge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybWF0dGVkRGF0ZSA9IGdldEZvcm1hdHRlZERhdGUodGhpcy5kYXRlUGlwZSwgbmV3VmFsLCB0aGlzLl9kYXRlT3B0aW9ucy5kYXRlSW5wdXRGb3JtYXQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0VmFsID0gZXZlbnQudGFyZ2V0LnZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXRWYWwgJiYgdGhpcy5kYXRlcGF0dGVybiA9PT0gJ3RpbWVzdGFtcCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfLmlzTmFOKGlucHV0VmFsKSAmJiBfLnBhcnNlSW50KGlucHV0VmFsKSAhPT0gZm9ybWF0dGVkRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZhbGlkRGF0ZVRpbWVGb3JtYXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgZXZlbnQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5wdXRWYWwgJiYgaW5wdXRWYWwgIT09IGZvcm1hdHRlZERhdGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZERhdGVUaW1lRm9ybWF0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgZXZlbnQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludmFsaWREYXRlVGltZUZvcm1hdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRW50ZXJQcmVzc2VkT25EYXRlSW5wdXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJzRGF0ZVBpY2tlckRpcmVjdGl2ZS5ic1ZhbHVlID0gIG5ld1ZhbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVEcERyb3Bkb3duKGV2ZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlRGF0ZXBpY2tlckRyb3Bkb3duKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlVGltZXBpY2tlckRyb3Bkb3duKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVEYXRlcGlja2VyRHJvcGRvd24oKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZVRpbWVwaWNrZXJEcm9wZG93bigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1ZhbGlkKGV2ZW50KSB7XG4gICAgICAgIGlmICghZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGVudGVyZWREYXRlID0gJCh0aGlzLm5hdGl2ZUVsZW1lbnQpLmZpbmQoJ2lucHV0JykudmFsKCk7XG4gICAgICAgICAgICBjb25zdCBuZXdWYWwgPSBnZXROYXRpdmVEYXRlT2JqZWN0KGVudGVyZWREYXRlKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5mb3JtYXRWYWxpZGF0aW9uKG5ld1ZhbCwgZW50ZXJlZERhdGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2hhbmdlIGFuZCBibHVyIGV2ZW50cyBhcmUgYWRkZWQgZnJvbSB0aGUgdGVtcGxhdGVcbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIGxvY2FsczogYW55KSB7XG4gICAgICAgIGlmICghXy5pbmNsdWRlcyhbJ2JsdXInLCAnZm9jdXMnLCAnY2hhbmdlJywgJ2NsaWNrJ10sIGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgIHN1cGVyLmhhbmRsZUV2ZW50KG5vZGUsIGV2ZW50TmFtZSwgY2FsbGJhY2ssIGxvY2Fscyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbklucHV0Qmx1cigkZXZlbnQpIHtcbiAgICAgICAgaWYgKCEkKCRldmVudC5yZWxhdGVkVGFyZ2V0KS5oYXNDbGFzcygnY3VycmVudC1kYXRlJykpIHtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlT25Ub3VjaGVkKCk7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JsdXInLCB7JGV2ZW50fSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=