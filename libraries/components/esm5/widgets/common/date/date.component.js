import * as tslib_1 from "tslib";
import { ChangeDetectorRef, Component, Inject, Injector, ViewChild } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { BsDatepickerDirective } from 'ngx-bootstrap';
import { adjustContainerPosition, addEventListenerOnElement, AppDefaults, FormWidgetType, getDateObj, getDisplayDateTimeFormat, getFormattedDate } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './date.props';
import { provideAsNgValidators, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { BaseDateTimeComponent } from '../base/base-date-time.component';
var CURRENT_DATE = 'CURRENT_DATE';
var DEFAULT_CLS = 'app-date input-group';
var WIDGET_CONFIG = {
    widgetType: 'wm-date',
    hostClass: DEFAULT_CLS
};
var DateComponent = /** @class */ (function (_super) {
    tslib_1.__extends(DateComponent, _super);
    // TODO use BsLocaleService to set the current user's locale to see the localized labels
    function DateComponent(inj, cdRef, appDefaults, evtMngrPlugins) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.cdRef = cdRef;
        _this.appDefaults = appDefaults;
        _this.isCurrentDate = false;
        _this.isEnterPressedOnDateInput = false;
        styler(_this.nativeElement, _this);
        // KeyEventsPlugin
        _this.keyEventPlugin = evtMngrPlugins[1];
        _this.dateContainerCls = "app-date-" + _this.widgetId;
        _this._dateOptions.containerClass = "app-date " + _this.dateContainerCls;
        _this._dateOptions.showWeekNumbers = false;
        _this.datepattern = _this.appDefaults.dateFormat || getDisplayDateTimeFormat(FormWidgetType.DATE);
        _this.updateFormat('datepattern');
        return _this;
    }
    Object.defineProperty(DateComponent.prototype, "timestamp", {
        get: function () {
            return this.bsDataValue ? this.bsDataValue.valueOf() : undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DateComponent.prototype, "displayValue", {
        get: function () {
            return getFormattedDate(this.datePipe, this.bsDataValue, this._dateOptions.dateInputFormat) || '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DateComponent.prototype, "datavalue", {
        get: function () {
            return getFormattedDate(this.datePipe, this.bsDataValue, this.outputformat) || '';
        },
        // Todo[Shubham]: needs to be redefined
        // sets the dataValue and computes the display model values
        set: function (newVal) {
            if (newVal === CURRENT_DATE) {
                this.isCurrentDate = true;
                this.setTimeInterval();
                this.bsDataValue = new Date();
            }
            else {
                this.bsDataValue = newVal ? getDateObj(newVal) : undefined;
                this.clearTimeInterval();
            }
            // update the previous datavalue.
            this.invokeOnChange(this.datavalue, undefined, true);
            this.cdRef.detectChanges();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * This is an internal method triggered when the date input changes
     */
    DateComponent.prototype.onDisplayDateChange = function ($event, isNativePicker) {
        if (this.isEnterPressedOnDateInput) {
            this.isEnterPressedOnDateInput = false;
            return;
        }
        var newVal = getDateObj($event.target.value);
        // date pattern validation
        // if invalid pattern is entered, device is showing an error.
        if (!this.formatValidation(newVal, $event.target.value, isNativePicker)) {
            return;
        }
        // min date and max date validation in mobile view.
        // if invalid dates are entered, device is showing an alert.
        if (isNativePicker && this.minDateMaxDateValidationOnInput(newVal, $event, this.displayValue, isNativePicker)) {
            return;
        }
        this.setDataValue(newVal);
    };
    // sets the dataValue and computes the display model values
    DateComponent.prototype.setDataValue = function (newVal) {
        this.invalidDateTimeFormat = false;
        // min date and max date validation in web.
        // if invalid dates are entered, device is showing validation message.
        this.minDateMaxDateValidationOnInput(newVal);
        if (getFormattedDate(this.datePipe, newVal, this._dateOptions.dateInputFormat) === this.displayValue) {
            $(this.nativeElement).find('.app-dateinput').val(this.displayValue);
        }
        if (newVal) {
            this.bsDataValue = newVal;
        }
        else {
            this.bsDataValue = undefined;
        }
        this.invokeOnChange(this.datavalue, {}, true);
    };
    DateComponent.prototype.onDatePickerOpen = function () {
        this.isOpen = true;
        this.bsDataValue ? this.activeDate = this.bsDataValue : this.activeDate = new Date();
        if (!this.bsDataValue) {
            this.hightlightToday();
        }
        this.addDatepickerKeyboardEvents(this, false);
        adjustContainerPosition($('bs-datepicker-container'), this.nativeElement, this.bsDatePickerDirective._datepicker);
    };
    DateComponent.prototype.onInputBlur = function ($event) {
        if (!$($event.relatedTarget).hasClass('current-date')) {
            this.invokeOnTouched();
            this.invokeEventCallback('blur', { $event: $event });
        }
    };
    DateComponent.prototype.hideDatepickerDropdown = function () {
        this.invokeOnTouched();
        this.isOpen = false;
        this.isEnterPressedOnDateInput = false;
        if (this.deregisterEventListener) {
            this.deregisterEventListener();
        }
    };
    // change and blur events are added from the template
    DateComponent.prototype.handleEvent = function (node, eventName, callback, locals) {
        if (!_.includes(['blur', 'focus', 'change', 'click'], eventName)) {
            _super.prototype.handleEvent.call(this, node, eventName, callback, locals);
        }
    };
    /**
     * This is an internal method used to toggle the dropdown of the date widget
     */
    DateComponent.prototype.toggleDpDropdown = function ($event) {
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
    DateComponent.prototype.addBodyClickListener = function (skipListener) {
        var _this = this;
        if (!skipListener) {
            return;
        }
        var bodyElement = document.querySelector('body');
        setTimeout(function () {
            var bsDateContainerElement = bodyElement.querySelector("." + _this.dateContainerCls);
            _this.deregisterEventListener = addEventListenerOnElement(bodyElement, bsDateContainerElement, _this.nativeElement, 'click', _this.isDropDownDisplayEnabledOnInput(_this.showdropdownon), function () {
                _this.isOpen = false;
            }, 0 /* ONCE */, true);
        }, 350);
    };
    /**
     * This is an internal method triggered when pressing key on the date input
     */
    DateComponent.prototype.onDisplayKeydown = function (event) {
        if (this.isDropDownDisplayEnabledOnInput(this.showdropdownon)) {
            event.stopPropagation();
            var newVal = getDateObj(event.target.value);
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
            }
        }
        else {
            this.hideDatepickerDropdown();
        }
    };
    /**
     * This is an internal method used to maintain a time interval to update the time model when the data value is set to CURRENT_TIME
     */
    DateComponent.prototype.setTimeInterval = function () {
        var _this = this;
        if (this.timeinterval) {
            return;
        }
        this.timeinterval = setInterval(function () {
            _this.bsDataValue = new Date();
        }, 1000 * 60);
    };
    /**
     * This is an internal method used to clear the time interval created
     */
    DateComponent.prototype.clearTimeInterval = function () {
        if (this.timeinterval) {
            clearInterval(this.timeinterval);
            this.timeinterval = null;
        }
    };
    /**
     * This is an internal method triggered when the date selection changes
     */
    DateComponent.prototype.onDateChange = function (newVal) {
        var displayInputElem = this.nativeElement.querySelector('.display-input');
        if (this.isOpen) {
            setTimeout(function () { return displayInputElem.focus(); });
        }
        this.setDataValue(newVal);
    };
    DateComponent.initializeProps = registerProps();
    DateComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmDate]',
                    template: "<ng-container *ngIf=\"useDatapicker; then dataPickerTemplate else nativeDateTemplate\"></ng-container>\n<ng-template #dataPickerTemplate>\n    <input class=\"form-control app-textbox app-dateinput display-input\" aria-label=\"Select date\"\n           focus-target\n           type=\"text\"\n           [name]=\"name\"\n           [tabindex]=\"tabindex\"\n           [value]=\"displayValue\"\n           (click)=\"toggleDpDropdown($event)\"\n           (focus)=\"invokeOnFocus($event)\"\n           (blur)=\"onInputBlur($event)\"\n           [disabled]=\"disabled || readonly\"\n           [autofocus]=\"autofocus\"\n           [required]=\"required\"\n           [attr.placeholder]=\"placeholder\"\n           [attr.accesskey]=\"shortcutkey\"\n           (change)=\"onDisplayDateChange($event)\"\n           (keydown)=\"onDisplayKeydown($event)\">\n    <div style=\"width: 0;display: inline-block;\" aria-label=\"datepicker dropdownmenu\" aria-controls=\"date\">\n        <input class=\"model-holder\"\n               container=\"body\"\n               [bsConfig]=\"_dateOptions\"\n               [isOpen]=\"isOpen\"\n               #datepicker=\"bsDatepicker\"\n               bsDatepicker\n               [isDisabled]=\"disabled || readonly\"\n               [bsValue]=\"bsDataValue\"\n               (onShown)=\"onDatePickerOpen()\"\n               (onHidden)=\"hideDatepickerDropdown()\"\n               (bsValueChange)=\"onDateChange($event)\">\n    </div>\n    <span class=\"input-group-btn\">\n            <button type=\"button\" class=\"btn btn-default btn-time\" [tabindex]=\"tabindex\" [disabled]=\"disabled || readonly\"\n                    aria-label=\"Select date\" aria-haspopup=\"true\" aria-expanded=\"false\"\n                    (click)=\"toggleDpDropdown($event)\">\n                <i aria-hidden=\"true\" class=\"app-icon wi wi-calendar\"></i>\n            </button>\n    </span>\n</ng-template>\n<ng-template #nativeDateTemplate>\n    <input type=\"date\" class=\"form-control app-textbox app-dateinput\"\n           role=\"input\"\n           step=\"any\"\n           [value]=\"displayValue\"\n           [required]=\"required\"\n           [disabled]=\"disabled || readonly\"\n           (change)=\"onDisplayDateChange($event, true)\"\n           (focus)=\"invokeOnFocus($event)\"\n           (blur)=\"invokeOnTouched($event)\">\n</ng-template>\n",
                    providers: [
                        provideAsNgValueAccessor(DateComponent),
                        provideAsNgValidators(DateComponent),
                        provideAsWidgetRef(DateComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    DateComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: ChangeDetectorRef },
        { type: AppDefaults },
        { type: undefined, decorators: [{ type: Inject, args: [EVENT_MANAGER_PLUGINS,] }] }
    ]; };
    DateComponent.propDecorators = {
        bsDatePickerDirective: [{ type: ViewChild, args: [BsDatepickerDirective,] }]
    };
    return DateComponent;
}(BaseDateTimeComponent));
export { DateComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2RhdGUvZGF0ZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFbEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXRELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSx5QkFBeUIsRUFBRSxXQUFXLEVBQWMsY0FBYyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUvSyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFaEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM3QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNsSCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUl6RSxJQUFNLFlBQVksR0FBRyxjQUFjLENBQUM7QUFDcEMsSUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUM7QUFDM0MsSUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxTQUFTO0lBQ3JCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUM7QUFFRjtJQVNtQyx5Q0FBcUI7SUE0Q3BELHdGQUF3RjtJQUN4Rix1QkFDSSxHQUFhLEVBQ0wsS0FBd0IsRUFDeEIsV0FBd0IsRUFDRCxjQUFjO1FBSmpELFlBTUksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQVc1QjtRQWZXLFdB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QUFVLENBQUMsY0FBTSxPQUFBLGdCQUFnQixDQUFDLEtBQUssRUFBRSxFQUF4QixDQUF3QixDQUFDLENBQUM7U0FDOUM7UUFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFwT00sNkJBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBVjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsVUFBVTtvQkFDcEIsZzFFQUFvQztvQkFDcEMsU0FBUyxFQUFFO3dCQUNQLHdCQUF3QixDQUFDLGFBQWEsQ0FBQzt3QkFDdkMscUJBQXFCLENBQUMsYUFBYSxDQUFDO3dCQUNwQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUM7cUJBQ3BDO2lCQUNKOzs7O2dCQTlCOEMsUUFBUTtnQkFBOUMsaUJBQWlCO2dCQUttQyxXQUFXO2dEQTJFL0QsTUFBTSxTQUFDLHFCQUFxQjs7O3dDQVBoQyxTQUFTLFNBQUMscUJBQXFCOztJQTRMcEMsb0JBQUM7Q0FBQSxBQS9PRCxDQVNtQyxxQkFBcUIsR0FzT3ZEO1NBdE9ZLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBJbmplY3QsIEluamVjdG9yLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEVWRU5UX01BTkFHRVJfUExVR0lOUyB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG5pbXBvcnQgeyBCc0RhdGVwaWNrZXJEaXJlY3RpdmUgfSBmcm9tICduZ3gtYm9vdHN0cmFwJztcblxuaW1wb3J0IHsgYWRqdXN0Q29udGFpbmVyUG9zaXRpb24sIGFkZEV2ZW50TGlzdGVuZXJPbkVsZW1lbnQsIEFwcERlZmF1bHRzLCBFVkVOVF9MSUZFLCBGb3JtV2lkZ2V0VHlwZSwgZ2V0RGF0ZU9iaiwgZ2V0RGlzcGxheURhdGVUaW1lRm9ybWF0LCBnZXRGb3JtYXR0ZWREYXRlIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vZGF0ZS5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbGlkYXRvcnMsIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IEJhc2VEYXRlVGltZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2UvYmFzZS1kYXRlLXRpbWUuY29tcG9uZW50JztcblxuZGVjbGFyZSBjb25zdCBfLCAkO1xuXG5jb25zdCBDVVJSRU5UX0RBVEUgPSAnQ1VSUkVOVF9EQVRFJztcbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1kYXRlIGlucHV0LWdyb3VwJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWRhdGUnLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFNcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtRGF0ZV0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9kYXRlLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKERhdGVDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNOZ1ZhbGlkYXRvcnMoRGF0ZUNvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihEYXRlQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgRGF0ZUNvbXBvbmVudCBleHRlbmRzIEJhc2VEYXRlVGltZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHByaXZhdGUgYnNEYXRhVmFsdWU7XG4gICAgcHVibGljIHNob3dkcm9wZG93bm9uOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBkYXRlQ29udGFpbmVyQ2xzOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBpc0N1cnJlbnREYXRlID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBpc09wZW46IGJvb2xlYW47XG4gICAgcHJpdmF0ZSB0aW1laW50ZXJ2YWw7XG4gICAgcHJpdmF0ZSBpc0VudGVyUHJlc3NlZE9uRGF0ZUlucHV0ID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGtleUV2ZW50UGx1Z2luO1xuICAgIHByaXZhdGUgZGVyZWdpc3RlckV2ZW50TGlzdGVuZXI7XG5cbiAgICBnZXQgdGltZXN0YW1wKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ic0RhdGFWYWx1ZSA/IHRoaXMuYnNEYXRhVmFsdWUudmFsdWVPZigpIDogdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGdldCBkaXNwbGF5VmFsdWUoKSB7XG4gICAgICAgIHJldHVybiBnZXRGb3JtYXR0ZWREYXRlKHRoaXMuZGF0ZVBpcGUsIHRoaXMuYnNEYXRhVmFsdWUsIHRoaXMuX2RhdGVPcHRpb25zLmRhdGVJbnB1dEZvcm1hdCkgfHwgJyc7XG4gICAgfVxuXG4gICAgZ2V0IGRhdGF2YWx1ZSAoKSB7XG4gICAgICAgIHJldHVybiBnZXRGb3JtYXR0ZWREYXRlKHRoaXMuZGF0ZVBpcGUsIHRoaXMuYnNEYXRhVmFsdWUsIHRoaXMub3V0cHV0Zm9ybWF0KSB8fCAnJztcbiAgICB9XG5cbiAgICAvLyBUb2RvW1NodWJoYW1dOiBuZWVkcyB0byBiZSByZWRlZmluZWRcbiAgICAvLyBzZXRzIHRoZSBkYXRhVmFsdWUgYW5kIGNvbXB1dGVzIHRoZSBkaXNwbGF5IG1vZGVsIHZhbHVlc1xuICAgIHNldCBkYXRhdmFsdWUobmV3VmFsKSB7XG4gICAgICAgIGlmIChuZXdWYWwgPT09IENVUlJFTlRfREFURSkge1xuICAgICAgICAgICAgdGhpcy5pc0N1cnJlbnREYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc2V0VGltZUludGVydmFsKCk7XG4gICAgICAgICAgICB0aGlzLmJzRGF0YVZhbHVlID0gbmV3IERhdGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYnNEYXRhVmFsdWUgPSBuZXdWYWwgPyBnZXREYXRlT2JqKG5ld1ZhbCkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLmNsZWFyVGltZUludGVydmFsKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdXBkYXRlIHRoZSBwcmV2aW91cyBkYXRhdmFsdWUuXG4gICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsIHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuY2RSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIH1cblxuICAgIEBWaWV3Q2hpbGQoQnNEYXRlcGlja2VyRGlyZWN0aXZlKSBwcm90ZWN0ZWQgYnNEYXRlUGlja2VyRGlyZWN0aXZlO1xuXG4gICAgLy8gVE9ETyB1c2UgQnNMb2NhbGVTZXJ2aWNlIHRvIHNldCB0aGUgY3VycmVudCB1c2VyJ3MgbG9jYWxlIHRvIHNlZSB0aGUgbG9jYWxpemVkIGxhYmVsc1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBwcml2YXRlIGNkUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICAgICAgcHJpdmF0ZSBhcHBEZWZhdWx0czogQXBwRGVmYXVsdHMsXG4gICAgICAgIEBJbmplY3QoRVZFTlRfTUFOQUdFUl9QTFVHSU5TKSBldnRNbmdyUGx1Z2luc1xuICAgICkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcblxuICAgICAgICAvLyBLZXlFdmVudHNQbHVnaW5cbiAgICAgICAgdGhpcy5rZXlFdmVudFBsdWdpbiA9IGV2dE1uZ3JQbHVnaW5zWzFdO1xuICAgICAgICB0aGlzLmRhdGVDb250YWluZXJDbHMgPSBgYXBwLWRhdGUtJHt0aGlzLndpZGdldElkfWA7XG4gICAgICAgIHRoaXMuX2RhdGVPcHRpb25zLmNvbnRhaW5lckNsYXNzID0gYGFwcC1kYXRlICR7dGhpcy5kYXRlQ29udGFpbmVyQ2xzfWA7XG4gICAgICAgIHRoaXMuX2RhdGVPcHRpb25zLnNob3dXZWVrTnVtYmVycyA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZGF0ZXBhdHRlcm4gPSB0aGlzLmFwcERlZmF1bHRzLmRhdGVGb3JtYXQgfHwgZ2V0RGlzcGxheURhdGVUaW1lRm9ybWF0KEZvcm1XaWRnZXRUeXBlLkRBVEUpO1xuICAgICAgICB0aGlzLnVwZGF0ZUZvcm1hdCgnZGF0ZXBhdHRlcm4nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB0cmlnZ2VyZWQgd2hlbiB0aGUgZGF0ZSBpbnB1dCBjaGFuZ2VzXG4gICAgICovXG4gICAgb25EaXNwbGF5RGF0ZUNoYW5nZSgkZXZlbnQsIGlzTmF0aXZlUGlja2VyKSB7XG4gICAgICAgIGlmICh0aGlzLmlzRW50ZXJQcmVzc2VkT25EYXRlSW5wdXQpIHtcbiAgICAgICAgICAgIHRoaXMuaXNFbnRlclByZXNzZWRPbkRhdGVJbnB1dCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld1ZhbCA9IGdldERhdGVPYmooJGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgIC8vIGRhdGUgcGF0dGVybiB2YWxpZGF0aW9uXG4gICAgICAgIC8vIGlmIGludmFsaWQgcGF0dGVybiBpcyBlbnRlcmVkLCBkZXZpY2UgaXMgc2hvd2luZyBhbiBlcnJvci5cbiAgICAgICAgaWYgKCF0aGlzLmZvcm1hdFZhbGlkYXRpb24obmV3VmFsLCAkZXZlbnQudGFyZ2V0LnZhbHVlLCBpc05hdGl2ZVBpY2tlcikpIHtcbiAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIG1pbiBkYXRlIGFuZCBtYXggZGF0ZSB2YWxpZGF0aW9uIGluIG1vYmlsZSB2aWV3LlxuICAgICAgICAvLyBpZiBpbnZhbGlkIGRhdGVzIGFyZSBlbnRlcmVkLCBkZXZpY2UgaXMgc2hvd2luZyBhbiBhbGVydC5cbiAgICAgICAgaWYgKGlzTmF0aXZlUGlja2VyICYmIHRoaXMubWluRGF0ZU1heERhdGVWYWxpZGF0aW9uT25JbnB1dChuZXdWYWwsICRldmVudCwgdGhpcy5kaXNwbGF5VmFsdWUsIGlzTmF0aXZlUGlja2VyKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0RGF0YVZhbHVlKG5ld1ZhbCk7XG4gICAgfVxuXG4gICAgLy8gc2V0cyB0aGUgZGF0YVZhbHVlIGFuZCBjb21wdXRlcyB0aGUgZGlzcGxheSBtb2RlbCB2YWx1ZXNcbiAgICBwcml2YXRlIHNldERhdGFWYWx1ZShuZXdWYWwpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkRGF0ZVRpbWVGb3JtYXQgPSBmYWxzZTtcbiAgICAgICAgLy8gbWluIGRhdGUgYW5kIG1heCBkYXRlIHZhbGlkYXRpb24gaW4gd2ViLlxuICAgICAgICAvLyBpZiBpbnZhbGlkIGRhdGVzIGFyZSBlbnRlcmVkLCBkZXZpY2UgaXMgc2hvd2luZyB2YWxpZGF0aW9uIG1lc3NhZ2UuXG4gICAgICAgIHRoaXMubWluRGF0ZU1heERhdGVWYWxpZGF0aW9uT25JbnB1dChuZXdWYWwpO1xuICAgICAgICBpZiAoZ2V0Rm9ybWF0dGVkRGF0ZSh0aGlzLmRhdGVQaXBlLCBuZXdWYWwsIHRoaXMuX2RhdGVPcHRpb25zLmRhdGVJbnB1dEZvcm1hdCkgPT09IHRoaXMuZGlzcGxheVZhbHVlKSB7XG4gICAgICAgICAgICAkKHRoaXMubmF0aXZlRWxlbWVudCkuZmluZCgnLmFwcC1kYXRlaW5wdXQnKS52YWwodGhpcy5kaXNwbGF5VmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZXdWYWwpIHtcbiAgICAgICAgICAgIHRoaXMuYnNEYXRhVmFsdWUgPSBuZXdWYWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmJzRGF0YVZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsIHt9LCB0cnVlKTtcbiAgICB9XG5cbiAgICBvbkRhdGVQaWNrZXJPcGVuKCkge1xuICAgICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XG4gICAgICAgIHRoaXMuYnNEYXRhVmFsdWUgPyB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLmJzRGF0YVZhbHVlIDogdGhpcy5hY3RpdmVEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgaWYgKCF0aGlzLmJzRGF0YVZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRUb2RheSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWRkRGF0ZXBpY2tlcktleWJvYXJkRXZlbnRzKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgYWRqdXN0Q29udGFpbmVyUG9zaXRpb24oJCgnYnMtZGF0ZXBpY2tlci1jb250YWluZXInKSwgdGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLmJzRGF0ZVBpY2tlckRpcmVjdGl2ZS5fZGF0ZXBpY2tlcik7XG5cbiAgICB9XG4gICAgb25JbnB1dEJsdXIoJGV2ZW50KSB7XG4gICAgICAgIGlmICghJCgkZXZlbnQucmVsYXRlZFRhcmdldCkuaGFzQ2xhc3MoJ2N1cnJlbnQtZGF0ZScpKSB7XG4gICAgICAgICAgICB0aGlzLmludm9rZU9uVG91Y2hlZCgpO1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdibHVyJywgeyRldmVudH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoaWRlRGF0ZXBpY2tlckRyb3Bkb3duKCkge1xuICAgICAgICB0aGlzLmludm9rZU9uVG91Y2hlZCgpO1xuICAgICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzRW50ZXJQcmVzc2VkT25EYXRlSW5wdXQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuZGVyZWdpc3RlckV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZGVyZWdpc3RlckV2ZW50TGlzdGVuZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNoYW5nZSBhbmQgYmx1ciBldmVudHMgYXJlIGFkZGVkIGZyb20gdGhlIHRlbXBsYXRlXG4gICAgcHJvdGVjdGVkIGhhbmRsZUV2ZW50KG5vZGU6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uLCBsb2NhbHM6IGFueSkge1xuICAgICAgICBpZiAoIV8uaW5jbHVkZXMoWydibHVyJywgJ2ZvY3VzJywgJ2NoYW5nZScsICdjbGljayddLCBldmVudE5hbWUpKSB7XG4gICAgICAgICAgICBzdXBlci5oYW5kbGVFdmVudChub2RlLCBldmVudE5hbWUsIGNhbGxiYWNrLCBsb2NhbHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBpcyBhbiBpbnRlcm5hbCBtZXRob2QgdXNlZCB0byB0b2dnbGUgdGhlIGRyb3Bkb3duIG9mIHRoZSBkYXRlIHdpZGdldFxuICAgICAqL1xuICAgIHRvZ2dsZURwRHJvcGRvd24oJGV2ZW50KSB7XG4gICAgICAgIGlmICgkZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdjbGljaycsIHskZXZlbnQ6ICRldmVudH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkZXZlbnQudGFyZ2V0ICYmICQoJGV2ZW50LnRhcmdldCkuaXMoJ2lucHV0JykgJiYgISh0aGlzLmlzRHJvcERvd25EaXNwbGF5RW5hYmxlZE9uSW5wdXQodGhpcy5zaG93ZHJvcGRvd25vbikpKSB7XG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ic0RhdGVQaWNrZXJEaXJlY3RpdmUudG9nZ2xlKCk7XG4gICAgICAgIHRoaXMuYWRkQm9keUNsaWNrTGlzdGVuZXIodGhpcy5ic0RhdGVQaWNrZXJEaXJlY3RpdmUuaXNPcGVuKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZEJvZHlDbGlja0xpc3RlbmVyKHNraXBMaXN0ZW5lcikge1xuICAgICAgICBpZiAoIXNraXBMaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJvZHlFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJzRGF0ZUNvbnRhaW5lckVsZW1lbnQgPSBib2R5RWxlbWVudC5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLmRhdGVDb250YWluZXJDbHN9YCk7XG4gICAgICAgICAgICB0aGlzLmRlcmVnaXN0ZXJFdmVudExpc3RlbmVyID0gYWRkRXZlbnRMaXN0ZW5lck9uRWxlbWVudChib2R5RWxlbWVudCwgYnNEYXRlQ29udGFpbmVyRWxlbWVudCwgdGhpcy5uYXRpdmVFbGVtZW50LCAnY2xpY2snLCB0aGlzLmlzRHJvcERvd25EaXNwbGF5RW5hYmxlZE9uSW5wdXQodGhpcy5zaG93ZHJvcGRvd25vbiksICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgfSwgRVZFTlRfTElGRS5PTkNFLCB0cnVlKTtcbiAgICAgICAgfSwgMzUwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB0cmlnZ2VyZWQgd2hlbiBwcmVzc2luZyBrZXkgb24gdGhlIGRhdGUgaW5wdXRcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uRGlzcGxheUtleWRvd24oZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEcm9wRG93bkRpc3BsYXlFbmFibGVkT25JbnB1dCh0aGlzLnNob3dkcm9wZG93bm9uKSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCBuZXdWYWwgPSBnZXREYXRlT2JqKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb24gPSB0aGlzLmtleUV2ZW50UGx1Z2luLmNvbnN0cnVjdG9yLmdldEV2ZW50RnVsbEtleShldmVudCk7XG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnZW50ZXInIHx8IGFjdGlvbiA9PT0gJ2Fycm93ZG93bicpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZvcm1hdHRlZERhdGUgPSBnZXRGb3JtYXR0ZWREYXRlKHRoaXMuZGF0ZVBpcGUsIG5ld1ZhbCwgdGhpcy5fZGF0ZU9wdGlvbnMuZGF0ZUlucHV0Rm9ybWF0KTtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnB1dFZhbCA9IGV2ZW50LnRhcmdldC52YWx1ZS50cmltKCk7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0VmFsICYmIHRoaXMuZGF0ZXBhdHRlcm4gPT09ICd0aW1lc3RhbXAnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghXy5pc05hTihpbnB1dFZhbCkgJiYgXy5wYXJzZUludChpbnB1dFZhbCkgIT09IGZvcm1hdHRlZERhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZERhdGVUaW1lRm9ybWF0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsIGV2ZW50LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlucHV0VmFsICYmIGlucHV0VmFsICE9PSBmb3JtYXR0ZWREYXRlICkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludmFsaWREYXRlVGltZUZvcm1hdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsIGV2ZW50LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZhbGlkRGF0ZVRpbWVGb3JtYXQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0VudGVyUHJlc3NlZE9uRGF0ZUlucHV0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ic0RhdGVQaWNrZXJEaXJlY3RpdmUuYnNWYWx1ZSA9ICBuZXdWYWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlRHBEcm9wZG93bihldmVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZURhdGVwaWNrZXJEcm9wZG93bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5oaWRlRGF0ZXBpY2tlckRyb3Bkb3duKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB1c2VkIHRvIG1haW50YWluIGEgdGltZSBpbnRlcnZhbCB0byB1cGRhdGUgdGhlIHRpbWUgbW9kZWwgd2hlbiB0aGUgZGF0YSB2YWx1ZSBpcyBzZXQgdG8gQ1VSUkVOVF9USU1FXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRUaW1lSW50ZXJ2YWwoKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWVpbnRlcnZhbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZWludGVydmFsID0gc2V0SW50ZXJ2YWwoICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYnNEYXRhVmFsdWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB9LCAxMDAwICogNjApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgbWV0aG9kIHVzZWQgdG8gY2xlYXIgdGhlIHRpbWUgaW50ZXJ2YWwgY3JlYXRlZFxuICAgICAqL1xuICAgIHByaXZhdGUgY2xlYXJUaW1lSW50ZXJ2YWwoKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWVpbnRlcnZhbCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVpbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGlzLnRpbWVpbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIG1ldGhvZCB0cmlnZ2VyZWQgd2hlbiB0aGUgZGF0ZSBzZWxlY3Rpb24gY2hhbmdlc1xuICAgICAqL1xuICAgIG9uRGF0ZUNoYW5nZShuZXdWYWwpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZGlzcGxheUlucHV0RWxlbSA9IHRoaXMubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZGlzcGxheS1pbnB1dCcpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBpZiAodGhpcy5pc09wZW4pIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gZGlzcGxheUlucHV0RWxlbS5mb2N1cygpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldERhdGFWYWx1ZShuZXdWYWwpO1xuICAgIH1cbn1cbiJdfQ==