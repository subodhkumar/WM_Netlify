import * as tslib_1 from "tslib";
import { ViewChild } from '@angular/core';
import { BsDropdownDirective } from 'ngx-bootstrap';
import { getDateObj, getFormattedDate, getNativeDateObject, isString, setAttr } from '@wm/core';
import { BaseFormCustomComponent } from './base-form-custom.component';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { ToDatePipe } from '../../../pipes/custom-pipes';
var CURRENT_DATE = 'CURRENT_DATE';
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var DATEPICKER_DROPDOWN_OPTIONS = {
    BUTTON: 'button',
    DEFAULT: 'default'
};
var BaseDateTimeComponent = /** @class */ (function (_super) {
    tslib_1.__extends(BaseDateTimeComponent, _super);
    function BaseDateTimeComponent(inj, WIDGET_CONFIG) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.useDatapicker = true;
        /**
         * This is an internal property used to map the containerClass, showWeekNumbers etc., to the bsDatepicker
         */
        _this._dateOptions = new BsDatepickerConfig();
        _this.datePipe = _this.inj.get(ToDatePipe);
        return _this;
    }
    /**
     * returns true if the input value is default (i.e open date picker on input click)
     * @param1 dropdownvalue, user selected value (by default datepicker opens on input click)
     * **/
    BaseDateTimeComponent.prototype.isDropDownDisplayEnabledOnInput = function (dropdownvalue) {
        return dropdownvalue === DATEPICKER_DROPDOWN_OPTIONS.DEFAULT;
    };
    /**
     * This method is used to show validation message depending on the isNativePicker flag.
     */
    BaseDateTimeComponent.prototype.showValidation = function ($event, displayValue, isNativePicker, msg) {
        if (isNativePicker) {
            alert(msg);
            return $($event.target).val(displayValue);
        }
    };
    BaseDateTimeComponent.prototype.resetDisplayInput = function () {
        $(this.nativeElement).find('.display-input').val('');
    };
    BaseDateTimeComponent.prototype.validate = function () {
        if (this.invalidDateTimeFormat) {
            return {
                invalidDateTimeFormat: {
                    valid: false
                }
            };
        }
        if (!_.isUndefined(this.dateNotInRange) && this.dateNotInRange) {
            return {
                dateNotInRange: {
                    valid: false
                },
            };
        }
        if (!_.isUndefined(this.timeNotInRange) && this.timeNotInRange) {
            return {
                timeNotInRange: {
                    valid: false
                },
            };
        }
        return null;
    };
    /**
     * This method is used to validate date pattern and time pattern
     * If user selects one pattern in design time and if he tries to enter the date in another pattern then the device is throwing an error
     */
    BaseDateTimeComponent.prototype.formatValidation = function (newVal, inputVal, isNativePicker) {
        var pattern = this.datepattern || this.timepattern;
        var formattedDate = getFormattedDate(this.datePipe, newVal, pattern);
        inputVal = inputVal.trim();
        if (inputVal) {
            if (pattern === 'timestamp') {
                if (!_.isNaN(inputVal) && _.parseInt(inputVal) !== formattedDate) {
                    this.invalidDateTimeFormat = true;
                    this.invokeOnChange(this.datavalue, undefined, false);
                    return false;
                }
            }
            else {
                if (isNativePicker) {
                    // format the date value only when inputVal is obtained from $event.target.value, as the format doesnt match.
                    inputVal = getFormattedDate(this.datePipe, inputVal, pattern);
                }
                if (inputVal !== formattedDate) {
                    this.invalidDateTimeFormat = true;
                    this.invokeOnChange(this.datavalue, undefined, false);
                    return false;
                }
            }
        }
        return true;
    };
    /**
     * This method is used to validate min date, max date, exclude dates and exclude days
     * In mobile if invalid dates are entered, device is showing an alert.
     * In web if invalid dates are entered, device is showing validation message.
     */
    BaseDateTimeComponent.prototype.minDateMaxDateValidationOnInput = function (newVal, $event, displayValue, isNativePicker) {
        var _this = this;
        if (newVal) {
            newVal = moment(newVal).startOf('day').toDate();
            var minDate = moment(getDateObj(this.mindate)).startOf('day').toDate();
            var maxDate = moment(getDateObj(this.maxdate)).startOf('day').toDate();
            if (this.mindate && newVal < minDate) {
                var msg = this.appLocale.LABEL_MINDATE_VALIDATION_MESSAGE + " " + this.mindate + ".";
                this.dateNotInRange = true;
                this.invokeOnChange(this.datavalue, undefined, false);
                return this.showValidation($event, displayValue, isNativePicker, msg);
            }
            if (this.maxdate && newVal > maxDate) {
                var msg = this.appLocale.LABEL_MAXDATE_VALIDATION_MESSAGE + " " + this.maxdate + ".";
                this.dateNotInRange = true;
                this.invokeOnChange(this.datavalue, undefined, false);
                return this.showValidation($event, displayValue, isNativePicker, msg);
            }
            if (this.excludedates) {
                var excludeDatesArray = void 0;
                if (isString(this.excludedates)) {
                    excludeDatesArray = _.split(this.excludedates, ',');
                }
                else {
                    excludeDatesArray = this.excludedates;
                }
                excludeDatesArray = excludeDatesArray.map(function (d) { return getFormattedDate(_this.datePipe, d, _this.datepattern); });
                if (excludeDatesArray.indexOf(getFormattedDate(this.datePipe, newVal, this.datepattern)) > -1) {
                    this.dateNotInRange = true;
                    this.invokeOnChange(this.datavalue, undefined, false);
                    return;
                }
            }
            if (this.excludedays) {
                var excludeDaysArray = _.split(this.excludedays, ',');
                if (excludeDaysArray.indexOf(newVal.getDay().toString()) > -1) {
                    this.dateNotInRange = true;
                    this.invokeOnChange(this.datavalue, undefined, false);
                    return;
                }
            }
        }
        if (!isNativePicker) {
            this.dateNotInRange = false;
            this.invokeOnChange(this.datavalue, undefined, false);
        }
    };
    /**
     * This method is used to highlight the current date
     */
    BaseDateTimeComponent.prototype.hightlightToday = function () {
        var toDay = new Date().getDate().toString();
        _.filter($("span:contains(" + toDay + ")").not('.is-other-month'), function (obj) {
            if ($(obj).text() === toDay) {
                $(obj).addClass('current-date text-info');
            }
        });
    };
    /**
     * This method is used to find the new date is from another year or not
     * @param newDate - newly selected date value
     */
    BaseDateTimeComponent.prototype.isOtheryear = function (newDate) {
        return (newDate.getMonth() === 0 && this.activeDate.getMonth() === 11) || (newDate.getMonth() === 11 && this.activeDate.getMonth() === 0);
    };
    /**
     * This method is used to set focus for active day
     * @param newDate - newly selected date value
     * @param isMouseEvent - boolean value represents the event is mouse event/ keyboard event
     */
    BaseDateTimeComponent.prototype.setActiveDateFocus = function (newDate, isMouseEvent) {
        var _this = this;
        var activeMonth = this.activeDate.getMonth();
        // check for keyboard event
        if (!isMouseEvent) {
            if (newDate.getMonth() < activeMonth) {
                this.isOtheryear(newDate) ? this.goToOtherMonthOryear('next', 'days') : this.goToOtherMonthOryear('previous', 'days');
            }
            else if (newDate.getMonth() > activeMonth) {
                this.isOtheryear(newDate) ? this.goToOtherMonthOryear('previous', 'days') : this.goToOtherMonthOryear('next', 'days');
            }
        }
        setTimeout(function () {
            if (newDate.getMonth() === new Date().getMonth() && newDate.getFullYear() === new Date().getFullYear()) {
                _this.hightlightToday();
            }
            var newDay = newDate.getDate().toString();
            _.filter($("span:contains(" + newDay + ")").not('.is-other-month'), function (obj) {
                if ($(obj).text() === newDay) {
                    $(obj).focus();
                    _this.activeDate = newDate;
                }
            });
        });
    };
    /**
     * This method is used to load other month days or other month or other year
     * @param btnClass - class(previous/next) of the button which we have to click
     * @param timePeriod - String value decides to load other month days or other month or other year
     */
    BaseDateTimeComponent.prototype.goToOtherMonthOryear = function (btnClass, timePeriod) {
        var $node = $(".bs-datepicker-head ." + btnClass);
        if ($node.attr('disabled')) {
            return;
        }
        $node.trigger('click');
        if (timePeriod === 'days') {
            this.loadDays();
        }
        else if (timePeriod === 'month') {
            this.loadMonths();
        }
        else if (timePeriod === 'year') {
            this.loadYears();
        }
    };
    /**
    * This method sets the mouse events to Datepicker popup. These events are required when we navigate date picker through mouse.
     */
    BaseDateTimeComponent.prototype.addDatepickerMouseEvents = function () {
        var _this = this;
        var datePikcerHead = $(".bs-datepicker-head");
        datePikcerHead.find(".previous").click(function (event) {
            // check for original mouse click
            if (event.originalEvent) {
                _this.setFocusForDate(-1);
            }
        });
        datePikcerHead.find(".next").click(function (event) {
            // check for original mouse click
            if (event.originalEvent) {
                _this.setFocusForDate(1);
            }
        });
        datePikcerHead.find(".current").click(function (event) {
            // check for original mouse click
            if (event.originalEvent) {
                _this.setFocusForCurrentMonthOryear();
            }
        });
        $('.bs-datepicker-body').click(function (event) {
            event.stopPropagation();
            // check for original mouse click
            if (event.originalEvent) {
                _this.setFocusForMonthOrDay();
            }
        });
    };
    /**
     * This method sets focus for months/days depending on the loaded datepicker table
     */
    BaseDateTimeComponent.prototype.setFocusForMonthOrDay = function () {
        var activeMonthOrYear = $(".bs-datepicker-head .current").first().text();
        var datePickerBody = $('.bs-datepicker-body');
        if (datePickerBody.find('table.months').length > 0) {
            if (_.parseInt(activeMonthOrYear) !== this.activeDate.getFullYear()) {
                this.loadMonths();
            }
            var newDate = new Date(_.parseInt(activeMonthOrYear), this.activeDate.getMonth(), this.activeDate.getDate());
            this.setActiveMonthFocus(newDate, true);
        }
        else if (datePickerBody.find('table.days').length > 0) {
            var newMonth = months.indexOf(activeMonthOrYear);
            if (newMonth !== this.activeDate.getMonth()) {
                this.loadDays();
            }
            var newDate = new Date(this.activeDate.getFullYear(), newMonth, 1);
            this.setActiveDateFocus(newDate, true);
        }
    };
    /**
     * This method sets focus for months/years depending on the loaded datepicker table
     */
    BaseDateTimeComponent.prototype.setFocusForCurrentMonthOryear = function () {
        var datePickerBody = $('.bs-datepicker-body');
        if (datePickerBody.find('table.months').length > 0) {
            this.loadMonths();
            this.setActiveMonthFocus(this.activeDate, true);
        }
        else if (datePickerBody.find('table.years').length > 0) {
            this.loadYears();
            this.setActiveYearFocus(this.activeDate, true);
        }
    };
    /**
     * This method sets focus for months/years/days depending on the loaded datepicker table
     */
    BaseDateTimeComponent.prototype.setFocusForDate = function (count) {
        var datePickerBody = $('.bs-datepicker-body');
        if (datePickerBody.find('table.months').length > 0) {
            this.loadMonths();
            var newDate = new Date(this.activeDate.getFullYear() + count, 0, this.activeDate.getDate());
            this.setActiveMonthFocus(newDate, true);
        }
        else if (datePickerBody.find('table.years').length > 0) {
            this.loadYears();
            var startYear = datePickerBody.find('table.years span').first().text();
            var newDate = new Date(_.parseInt(startYear), this.activeDate.getMonth(), this.activeDate.getDate());
            this.setActiveYearFocus(newDate, true);
        }
        else if (datePickerBody.find('table.days').length > 0) {
            this.loadDays();
            var newDate = new Date(this.activeDate.getFullYear(), this.activeDate.getMonth() + count, 1);
            this.setActiveDateFocus(newDate, true);
        }
    };
    /**
     * This method is used to add keyboard events while opening the date picker
     * @param scope - scope of the date/datetime widget
     * @param isDateTime - boolean value represents the loaded widget is date or datetime
     */
    BaseDateTimeComponent.prototype.addDatepickerKeyboardEvents = function (scope, isDateTime) {
        var _this = this;
        this.keyEventPluginInstance = scope.keyEventPlugin.constructor;
        this.elementScope = scope;
        var dateContainer = document.querySelector("." + scope.dateContainerCls);
        setAttr(dateContainer, 'tabindex', '0');
        dateContainer.onkeydown = function (event) {
            var action = _this.keyEventPluginInstance.getEventFullKey(event);
            // Check for Shift+Tab key or Tab key or escape
            if (action === 'shift.tab' || action === 'escape' || (action === 'tab' && !isDateTime)) {
                _this.elementScope.hideDatepickerDropdown();
                var displayInputElem_1 = _this.elementScope.nativeElement.querySelector('.display-input');
                setTimeout(function () { return displayInputElem_1.focus(); });
            }
            if (action === 'tab' && isDateTime) {
                _this.bsDatePickerDirective.hide();
                _this.elementScope.toggleTimePicker(true);
            }
        };
        this.loadDays();
        this.setActiveDateFocus(this.activeDate);
    };
    /**
     * This method is used to add tabindex, keybord and mouse events for days
     */
    BaseDateTimeComponent.prototype.loadDays = function () {
        var _this = this;
        setTimeout(function () {
            $('.bs-datepicker-body').attr('tabindex', '0');
            $('[bsdatepickerdaydecorator]').not('.is-other-month').attr('tabindex', '0');
            _this.addKeyBoardEventsForDays();
            _this.addDatepickerMouseEvents();
        });
    };
    /**
     * This method sets keyboard events for days
     */
    BaseDateTimeComponent.prototype.addKeyBoardEventsForDays = function () {
        var _this = this;
        var datePickerBody = $('.bs-datepicker-body');
        if (datePickerBody.length > 0) {
            datePickerBody[0].addEventListener('mouseenter', function (event) {
                event.stopPropagation();
            }, true);
        }
        datePickerBody.keydown(function (event) {
            var action = _this.keyEventPluginInstance.getEventFullKey(event);
            var newdate;
            if (action === 'arrowdown') {
                event.preventDefault();
                newdate = moment(_this.activeDate).add(+7, 'days').toDate();
                _this.setActiveDateFocus(newdate);
            }
            else if (action === 'arrowup') {
                event.preventDefault();
                newdate = moment(_this.activeDate).add(-7, 'days').toDate();
                _this.setActiveDateFocus(newdate);
            }
            else if (action === 'arrowleft') {
                newdate = moment(_this.activeDate).add(-1, 'days').toDate();
                _this.setActiveDateFocus(newdate);
            }
            else if (action === 'arrowright') {
                newdate = moment(_this.activeDate).add(+1, 'days').toDate();
                _this.setActiveDateFocus(newdate);
            }
            else if (action === 'control.arrowup') {
                // clicking on table header month name to load list of months
                $('.bs-datepicker-head .current').first().click();
                _this.loadMonths();
                _this.setActiveMonthFocus(_this.activeDate);
            }
            else if (action === 'enter') {
                if ($(document.activeElement).hasClass('disabled')) {
                    return;
                }
                $(document.activeElement).click();
                _this.elementScope.hideDatepickerDropdown();
                var displayInputElem_2 = _this.elementScope.nativeElement.querySelector('.display-input');
                setTimeout(function () { return displayInputElem_2.focus(); });
            }
        });
    };
    /**
     * This method is used to add tabindex, keybord and mouse events for months
     */
    BaseDateTimeComponent.prototype.loadMonths = function () {
        var _this = this;
        setTimeout(function () {
            var datePickerBody = $('.bs-datepicker-body');
            datePickerBody.attr('tabindex', '0');
            datePickerBody.find('table.months span').attr('tabindex', '0');
            _this.addKeyBoardEventsForMonths();
            _this.addDatepickerMouseEvents();
        });
    };
    /**
     * This method sets keyboard events for months
     */
    BaseDateTimeComponent.prototype.addKeyBoardEventsForMonths = function () {
        var _this = this;
        $('.bs-datepicker-body').keydown(function (event) {
            var action = _this.keyEventPluginInstance.getEventFullKey(event);
            var newdate;
            if (action === 'arrowdown') {
                event.preventDefault();
                newdate = moment(_this.activeDate).add(+3, 'month').toDate();
                _this.setActiveMonthFocus(newdate);
            }
            else if (action === 'arrowup') {
                event.preventDefault();
                newdate = moment(_this.activeDate).add(-3, 'month').toDate();
                _this.setActiveMonthFocus(newdate);
            }
            else if (action === 'arrowleft') {
                newdate = moment(_this.activeDate).add(-1, 'month').toDate();
                _this.setActiveMonthFocus(newdate);
            }
            else if (action === 'arrowright') {
                newdate = moment(_this.activeDate).add(+1, 'month').toDate();
                _this.setActiveMonthFocus(newdate);
            }
            else if (action === 'control.arrowup') {
                // clicking on table header year to load list of years
                $('.bs-datepicker-head .current').first().click();
                _this.loadYears();
                _this.setActiveYearFocus(_this.activeDate);
            }
            else if (action === 'control.arrowdown' || action === 'enter') {
                if ($(document.activeElement).parent().hasClass('disabled')) {
                    return;
                }
                $(document.activeElement).click();
                _this.loadDays();
                var newDate = new Date(_this.activeDate.getFullYear(), _this.activeDate.getMonth(), 1);
                _this.setActiveDateFocus(newDate);
            }
        });
    };
    /**
     * This method is used to add tabindex, keybord and mouse events for years
     */
    BaseDateTimeComponent.prototype.loadYears = function () {
        var _this = this;
        setTimeout(function () {
            var datePickerBody = $('.bs-datepicker-body');
            datePickerBody.attr('tabindex', '0');
            datePickerBody.find('table.years span').attr('tabindex', '0');
            _this.addKeyBoardEventsForYears();
            _this.addDatepickerMouseEvents();
        });
    };
    /**
     * This method is used to set focus for active month
     */
    BaseDateTimeComponent.prototype.setActiveMonthFocus = function (newDate, isMoouseEvent) {
        var _this = this;
        var newMonth = months[newDate.getMonth()];
        // check for keyboard event
        if (!isMoouseEvent) {
            if (newDate.getFullYear() < this.activeDate.getFullYear()) {
                this.goToOtherMonthOryear('previous', 'month');
            }
            else if (newDate.getFullYear() > this.activeDate.getFullYear()) {
                this.goToOtherMonthOryear('next', 'month');
            }
        }
        setTimeout(function () {
            $(".bs-datepicker-body table.months span:contains(" + newMonth + ")").focus();
            _this.activeDate = newDate;
        });
    };
    /**
     * This method sets keyboard events for years
     */
    BaseDateTimeComponent.prototype.addKeyBoardEventsForYears = function () {
        var _this = this;
        $('.bs-datepicker-body').keydown(function (event) {
            var action = _this.keyEventPluginInstance.getEventFullKey(event);
            var newdate;
            if (action === 'arrowdown') {
                event.preventDefault();
                newdate = moment(_this.activeDate).add(+4, 'year').toDate();
                _this.setActiveYearFocus(newdate);
            }
            else if (action === 'arrowup') {
                event.preventDefault();
                newdate = moment(_this.activeDate).add(-4, 'year').toDate();
                _this.setActiveYearFocus(newdate);
            }
            else if (action === 'arrowleft') {
                newdate = moment(_this.activeDate).add(-1, 'year').toDate();
                _this.setActiveYearFocus(newdate);
            }
            else if (action === 'arrowright') {
                newdate = moment(_this.activeDate).add(+1, 'year').toDate();
                _this.setActiveYearFocus(newdate);
            }
            else if (action === 'control.arrowdown' || action === 'enter') {
                if ($(document.activeElement).parent().hasClass('disabled')) {
                    return;
                }
                $(document.activeElement).click();
                _this.loadMonths();
                _this.setActiveMonthFocus(_this.activeDate);
            }
        });
    };
    /**
     * This method is used to set focus for active year
     */
    BaseDateTimeComponent.prototype.setActiveYearFocus = function (newDate, isMouseEvent) {
        var _this = this;
        var newYear = newDate.getFullYear();
        var datePickerYears = $('.bs-datepicker-body table.years span');
        var startYear = datePickerYears.first().text();
        var endYear = datePickerYears.last().text();
        // check for keyboard event
        if (!isMouseEvent) {
            if (newDate.getFullYear() < _.parseInt(startYear)) {
                this.goToOtherMonthOryear('previous', 'year');
            }
            else if (newDate.getFullYear() > _.parseInt(endYear)) {
                this.goToOtherMonthOryear('next', 'year');
            }
        }
        setTimeout(function () {
            $(".bs-datepicker-body table.years span:contains(" + newYear + ")").focus();
            _this.activeDate = newDate;
        });
    };
    /**
     * This method sets focus for timepicker first input field(hours field) while opening time picker
     * @param scope - scope of the time picker widget
     */
    BaseDateTimeComponent.prototype.focusTimePickerPopover = function (scope) {
        this.keyEventPluginInstance = scope.keyEventPlugin.constructor;
        this.elementScope = scope;
        // setTimeout is used so that by then time input has the updated value. focus is setting back to the input field
        this.elementScope.ngZone.runOutsideAngular(function () {
            setTimeout(function () {
                $('timepicker .form-group:first > input.form-control').focus();
            });
        });
    };
    /**
     * This function sets the keyboard events to Timepicker popup
     */
    BaseDateTimeComponent.prototype.bindTimePickerKeyboardEvents = function () {
        var _this = this;
        setTimeout(function () {
            var $timepickerPopup = $('body').find('> bs-dropdown-container timepicker');
            $timepickerPopup.attr('tabindex', 0);
            _this.addEventsOnTimePicker($timepickerPopup);
        });
    };
    /**
     * This function checks whether the given date is valid or not
     * @returns boolean value, true if date is valid else returns false
     */
    BaseDateTimeComponent.prototype.isValidDate = function (date) {
        return date && date instanceof Date && !isNaN(date.getTime());
    };
    /**
     * This function checks whether the given time is valid or not
     */
    BaseDateTimeComponent.prototype.timeFormatValidation = function () {
        var enteredDate = $(this.nativeElement).find('input').val();
        var newVal = getNativeDateObject(enteredDate);
        if (!this.formatValidation(newVal, enteredDate)) {
            return;
        }
        this.invalidDateTimeFormat = false;
        this.invokeOnChange(this.datavalue, undefined, false);
    };
    /**
     * This function sets the events to given element
     * @param $el - element on which the event is added
     */
    BaseDateTimeComponent.prototype.addEventsOnTimePicker = function ($el) {
        var _this = this;
        $el.on('keydown', function (evt) {
            var $target = $(evt.target);
            var $parent = $target.parent();
            var elementScope = _this.elementScope;
            var action = _this.keyEventPluginInstance.getEventFullKey(evt);
            var stopPropogation, preventDefault;
            if (action === 'escape') {
                elementScope.hideTimepickerDropdown();
            }
            if ($target.hasClass('bs-timepicker-field')) {
                if ($parent.is(':first-child')) {
                    if (action === 'shift.tab' || action === 'enter' || action === 'escape') {
                        elementScope.setIsTimeOpen(false);
                        _this.focus();
                        stopPropogation = true;
                        preventDefault = true;
                    }
                }
                else if ($parent.is(':last-child') || ($parent.next().next().find('button.disabled').length)) {
                    if (action === 'tab' || action === 'escape' || action === 'enter') {
                        elementScope.setIsTimeOpen(false);
                        _this.focus();
                        stopPropogation = true;
                        preventDefault = true;
                    }
                }
                else {
                    if (action === 'enter' || action === 'escape') {
                        elementScope.setIsTimeOpen(false);
                        _this.focus();
                        stopPropogation = true;
                        preventDefault = true;
                    }
                }
                if (stopPropogation) {
                    evt.stopPropagation();
                }
                if (preventDefault) {
                    evt.preventDefault();
                }
                if (elementScope.mintime && elementScope.maxtime && !_this.isValidDate(elementScope.bsTimeValue)) {
                    if (action === 'arrowdown') {
                        elementScope.bsTimeValue = elementScope.maxTime;
                    }
                    else if (action === 'arrowup') {
                        elementScope.bsTimeValue = elementScope.minTime;
                    }
                }
                if (action === 'tab') {
                    _this.invalidDateTimeFormat = false;
                    _this.invokeOnChange(_this.datavalue, undefined, false);
                    var pattern = _this.datepattern || _this.timepattern;
                    if (getFormattedDate(elementScope.datePipe, elementScope.bsTimeValue, pattern) === elementScope.displayValue) {
                        $(_this.nativeElement).find('.display-input').val(elementScope.displayValue);
                    }
                }
                if (action === 'arrowdown' || action === 'arrowup') {
                    _this.timeFormatValidation();
                }
            }
            else if ($target.hasClass('btn-default')) {
                if (action === 'tab' || action === 'escape') {
                    elementScope.setIsTimeOpen(false);
                    _this.focus();
                }
            }
        });
        $el.find('a').on('click', function (evt) {
            var elementScope = _this.elementScope;
            var $target = $(evt.target);
            if (elementScope.mintime && elementScope.maxtime && !_this.isValidDate(elementScope.bsTimeValue)) {
                if ($target.find('span').hasClass('bs-chevron-down')) {
                    elementScope.bsTimeValue = elementScope.maxTime;
                }
                else if ($target.find('span').hasClass('bs-chevron-up')) {
                    elementScope.bsTimeValue = elementScope.minTime;
                }
            }
            _this.timeFormatValidation();
        });
    };
    BaseDateTimeComponent.prototype.updateFormat = function (pattern) {
        if (pattern === 'datepattern') {
            this._dateOptions.dateInputFormat = this.datepattern;
            this.showseconds = _.includes(this.datepattern, 's');
            this.ismeridian = _.includes(this.datepattern, 'h');
        }
        else if (pattern === 'timepattern') {
            this.showseconds = _.includes(this.timepattern, 's');
            this.ismeridian = _.includes(this.timepattern, 'h');
        }
    };
    BaseDateTimeComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        if (this.useDatapicker && key === 'datepattern') {
            this.updateFormat(key);
        }
        else if (key === 'showweeks') {
            this._dateOptions.showWeekNumbers = nv;
        }
        else if (key === 'mindate') {
            this._dateOptions.minDate = (nv === CURRENT_DATE) ? this.mindate = new Date() : getDateObj(nv);
            this.minDateMaxDateValidationOnInput(this.datavalue);
        }
        else if (key === 'maxdate') {
            this._dateOptions.maxDate = (nv === CURRENT_DATE) ? this.maxdate = new Date() : getDateObj(nv);
            this.minDateMaxDateValidationOnInput(this.datavalue);
        }
        else if (key === 'excludedates' || key === 'excludedays') {
            this.minDateMaxDateValidationOnInput(this.datavalue);
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    BaseDateTimeComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        _super.prototype.ngAfterViewInit.call(this);
        if (this.bsDatePickerDirective) {
            this.dateOnShowSubscription = this.bsDatePickerDirective
                .onShown
                .subscribe(function (cal) {
                cal.daysCalendar.subscribe(function (data) {
                    var excludedDates;
                    if (_this.excludedates) {
                        if (isString(_this.excludedates)) {
                            excludedDates = _.split(_this.excludedates, ',');
                        }
                        else {
                            excludedDates = _this.excludedates;
                        }
                        excludedDates = excludedDates.map(function (d) { return moment(d); });
                    }
                    data[0].weeks.forEach(function (week) {
                        week.days.forEach(function (day) {
                            if (!day.isDisabled && _this.excludedays) {
                                day.isDisabled = _.includes(_this.excludedays, day.dayIndex);
                            }
                            if (!day.isDisabled && excludedDates) {
                                var md_1 = moment(day.date);
                                day.isDisabled = excludedDates.some(function (ed) { return md_1.isSame(ed, 'day'); });
                            }
                        });
                    });
                });
            });
        }
    };
    BaseDateTimeComponent.prototype.ngOnDestroy = function () {
        if (this.dateOnShowSubscription) {
            this.dateOnShowSubscription.unsubscribe();
        }
        _super.prototype.ngOnDestroy.call(this);
    };
    BaseDateTimeComponent.propDecorators = {
        bsDropdown: [{ type: ViewChild, args: [BsDropdownDirective,] }]
    };
    return BaseDateTimeComponent;
}(BaseFormCustomComponent));
export { BaseDateTimeComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1kYXRlLXRpbWUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9iYXNlL2Jhc2UtZGF0ZS10aW1lLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFzQyxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHOUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBELE9BQU8sRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVoRyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUN2RSxPQUFPLEVBQUUsa0JBQWtCLEVBQXlCLE1BQU0sZUFBZSxDQUFDO0FBQzFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUl6RCxJQUFNLFlBQVksR0FBRyxjQUFjLENBQUM7QUFDcEMsSUFBTSxNQUFNLEdBQUcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQzFJLElBQU0sMkJBQTJCLEdBQUc7SUFDaEMsTUFBTSxFQUFFLFFBQVE7SUFDaEIsT0FBTyxFQUFFLFNBQVM7Q0FDckIsQ0FBQztBQUVGO0lBQW9ELGlEQUF1QjtJQThCdkUsK0JBQVksR0FBYSxFQUFFLGFBQWE7UUFBeEMsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBRTVCO1FBM0JNLG1CQUFhLEdBQUcsSUFBSSxDQUFDO1FBZ0I1Qjs7V0FFRztRQUNPLGtCQUFZLEdBQXVCLElBQUksa0JBQWtCLEVBQUUsQ0FBQztR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QUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTt3QkFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHOzRCQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxLQUFJLENBQUMsV0FBVyxFQUFFO2dDQUNyQyxHQUFHLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7NkJBQy9EOzRCQUVELElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLGFBQWEsRUFBRTtnQ0FDbEMsSUFBTSxJQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQ0FDNUIsR0FBRyxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsSUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQXBCLENBQW9CLENBQUMsQ0FBQzs2QkFDbkU7d0JBQ0wsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztTQUNWO0lBRUwsQ0FBQztJQUVELDJDQUFXLEdBQVg7UUFDSSxJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtZQUM3QixJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDN0M7UUFFRCxpQkFBTSxXQUFXLFdBQUUsQ0FBQztJQUN4QixDQUFDOzs2QkFwdEJBLFNBQVMsU0FBQyxtQkFBbUI7O0lBcXRCbEMsNEJBQUM7Q0FBQSxBQWp2QkQsQ0FBb0QsdUJBQXVCLEdBaXZCMUU7U0FqdkJxQixxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBJbmplY3RvciwgT25EZXN0cm95LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFZhbGlkYXRvciB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgQnNEcm9wZG93bkRpcmVjdGl2ZSB9IGZyb20gJ25neC1ib290c3RyYXAnO1xuXG5pbXBvcnQgeyBnZXREYXRlT2JqLCBnZXRGb3JtYXR0ZWREYXRlLCBnZXROYXRpdmVEYXRlT2JqZWN0LCBpc1N0cmluZywgc2V0QXR0ciB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQmFzZUZvcm1DdXN0b21Db21wb25lbnQgfSBmcm9tICcuL2Jhc2UtZm9ybS1jdXN0b20uY29tcG9uZW50JztcbmltcG9ydCB7IEJzRGF0ZXBpY2tlckNvbmZpZywgQnNEYXRlcGlja2VyRGlyZWN0aXZlIH0gZnJvbSAnbmd4LWJvb3RzdHJhcCc7XG5pbXBvcnQgeyBUb0RhdGVQaXBlIH0gZnJvbSAnLi4vLi4vLi4vcGlwZXMvY3VzdG9tLXBpcGVzJztcblxuZGVjbGFyZSBjb25zdCBtb21lbnQsIF8sICQ7XG5cbmNvbnN0IENVUlJFTlRfREFURSA9ICdDVVJSRU5UX0RBVEUnO1xuY29uc3QgbW9udGhzID0gWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ107XG5jb25zdCBEQVRFUElDS0VSX0RST1BET1dOX09QVElPTlMgPSB7XG4gICAgQlVUVE9OOiAnYnV0dG9uJyxcbiAgICBERUZBVUxUOiAnZGVmYXVsdCdcbn07XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlRGF0ZVRpbWVDb21wb25lbnQgZXh0ZW5kcyBCYXNlRm9ybUN1c3RvbUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgVmFsaWRhdG9yIHtcbiAgICBwdWJsaWMgZXhjbHVkZWRheXM6IHN0cmluZztcbiAgICBwdWJsaWMgZXhjbHVkZWRhdGVzO1xuICAgIHB1YmxpYyBvdXRwdXRmb3JtYXQ7XG4gICAgcHVibGljIG1pbmRhdGU7XG4gICAgcHVibGljIG1heGRhdGU7XG4gICAgcHVibGljIHVzZURhdGFwaWNrZXIgPSB0cnVlO1xuICAgIHByb3RlY3RlZCBhY3RpdmVEYXRlO1xuICAgIHByaXZhdGUga2V5RXZlbnRQbHVnaW5JbnN0YW5jZTtcbiAgICBwcml2YXRlIGVsZW1lbnRTY29wZTtcbiAgICBwdWJsaWMgZGF0ZXBhdHRlcm46IHN0cmluZztcbiAgICBwdWJsaWMgdGltZXBhdHRlcm46IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgc2hvd3NlY29uZHM6IGJvb2xlYW47XG4gICAgcHJvdGVjdGVkIGlzbWVyaWRpYW46IGJvb2xlYW47XG4gICAgcHJvdGVjdGVkIGRhdGVQaXBlO1xuXG4gICAgcHJvdGVjdGVkIGRhdGVOb3RJblJhbmdlOiBib29sZWFuO1xuICAgIHByb3RlY3RlZCB0aW1lTm90SW5SYW5nZTogYm9vbGVhbjtcbiAgICBwcm90ZWN0ZWQgaW52YWxpZERhdGVUaW1lRm9ybWF0OiBib29sZWFuO1xuXG4gICAgcHJpdmF0ZSBkYXRlT25TaG93U3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGFuIGludGVybmFsIHByb3BlcnR5IHVzZWQgdG8gbWFwIHRoZSBjb250YWluZXJDbGFzcywgc2hvd1dlZWtOdW1iZXJzIGV0Yy4sIHRvIHRoZSBic0RhdGVwaWNrZXJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RhdGVPcHRpb25zOiBCc0RhdGVwaWNrZXJDb25maWcgPSBuZXcgQnNEYXRlcGlja2VyQ29uZmlnKCk7XG4gICAgcHJvdGVjdGVkIGJzRGF0ZVBpY2tlckRpcmVjdGl2ZTogQnNEYXRlcGlja2VyRGlyZWN0aXZlO1xuXG4gICAgQFZpZXdDaGlsZChCc0Ryb3Bkb3duRGlyZWN0aXZlKSBwcm90ZWN0ZWQgYnNEcm9wZG93bjtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIFdJREdFVF9DT05GSUcpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgdGhpcy5kYXRlUGlwZSA9IHRoaXMuaW5qLmdldChUb0RhdGVQaXBlKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgdHJ1ZSBpZiB0aGUgaW5wdXQgdmFsdWUgaXMgZGVmYXVsdCAoaS5lIG9wZW4gZGF0ZSBwaWNrZXIgb24gaW5wdXQgY2xpY2spXG4gICAgICogQHBhcmFtMSBkcm9wZG93bnZhbHVlLCB1c2VyIHNlbGVjdGVkIHZhbHVlIChieSBkZWZhdWx0IGRhdGVwaWNrZXIgb3BlbnMgb24gaW5wdXQgY2xpY2spXG4gICAgICogKiovXG4gICAgcHJvdGVjdGVkIGlzRHJvcERvd25EaXNwbGF5RW5hYmxlZE9uSW5wdXQoZHJvcGRvd252YWx1ZSkge1xuICAgICAgICByZXR1cm4gZHJvcGRvd252YWx1ZSA9PT0gREFURVBJQ0tFUl9EUk9QRE9XTl9PUFRJT05TLkRFRkFVTFQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBzaG93IHZhbGlkYXRpb24gbWVzc2FnZSBkZXBlbmRpbmcgb24gdGhlIGlzTmF0aXZlUGlja2VyIGZsYWcuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzaG93VmFsaWRhdGlvbigkZXZlbnQsIGRpc3BsYXlWYWx1ZSwgaXNOYXRpdmVQaWNrZXIsIG1zZykge1xuICAgICAgICBpZiAoaXNOYXRpdmVQaWNrZXIpIHtcbiAgICAgICAgICAgIGFsZXJ0KG1zZyk7XG4gICAgICAgICAgICByZXR1cm4gJCgkZXZlbnQudGFyZ2V0KS52YWwoZGlzcGxheVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlc2V0RGlzcGxheUlucHV0KCkge1xuICAgICAgICAkKHRoaXMubmF0aXZlRWxlbWVudCkuZmluZCgnLmRpc3BsYXktaW5wdXQnKS52YWwoJycpO1xuICAgIH1cblxuICAgIHB1YmxpYyB2YWxpZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuaW52YWxpZERhdGVUaW1lRm9ybWF0KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGludmFsaWREYXRlVGltZUZvcm1hdDoge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZDogZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZCh0aGlzLmRhdGVOb3RJblJhbmdlKSAmJiB0aGlzLmRhdGVOb3RJblJhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGVOb3RJblJhbmdlOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZCh0aGlzLnRpbWVOb3RJblJhbmdlKSAmJiB0aGlzLnRpbWVOb3RJblJhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRpbWVOb3RJblJhbmdlOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gdmFsaWRhdGUgZGF0ZSBwYXR0ZXJuIGFuZCB0aW1lIHBhdHRlcm5cbiAgICAgKiBJZiB1c2VyIHNlbGVjdHMgb25lIHBhdHRlcm4gaW4gZGVzaWduIHRpbWUgYW5kIGlmIGhlIHRyaWVzIHRvIGVudGVyIHRoZSBkYXRlIGluIGFub3RoZXIgcGF0dGVybiB0aGVuIHRoZSBkZXZpY2UgaXMgdGhyb3dpbmcgYW4gZXJyb3JcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZm9ybWF0VmFsaWRhdGlvbihuZXdWYWwsIGlucHV0VmFsLCBpc05hdGl2ZVBpY2tlcj86IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgcGF0dGVybiA9IHRoaXMuZGF0ZXBhdHRlcm4gfHwgdGhpcy50aW1lcGF0dGVybjtcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkRGF0ZSA9IGdldEZvcm1hdHRlZERhdGUodGhpcy5kYXRlUGlwZSwgbmV3VmFsLCBwYXR0ZXJuKTtcbiAgICAgICAgaW5wdXRWYWwgPSBpbnB1dFZhbC50cmltKCk7XG4gICAgICAgIGlmIChpbnB1dFZhbCkge1xuICAgICAgICAgICAgaWYgKHBhdHRlcm4gPT09ICd0aW1lc3RhbXAnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfLmlzTmFOKGlucHV0VmFsKSAmJiBfLnBhcnNlSW50KGlucHV0VmFsKSAhPT0gZm9ybWF0dGVkRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludmFsaWREYXRlVGltZUZvcm1hdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsIHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNOYXRpdmVQaWNrZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9ybWF0IHRoZSBkYXRlIHZhbHVlIG9ubHkgd2hlbiBpbnB1dFZhbCBpcyBvYnRhaW5lZCBmcm9tICRldmVudC50YXJnZXQudmFsdWUsIGFzIHRoZSBmb3JtYXQgZG9lc250IG1hdGNoLlxuICAgICAgICAgICAgICAgICAgICBpbnB1dFZhbCA9IGdldEZvcm1hdHRlZERhdGUodGhpcy5kYXRlUGlwZSwgaW5wdXRWYWwsIHBhdHRlcm4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW5wdXRWYWwgIT09IGZvcm1hdHRlZERhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZhbGlkRGF0ZVRpbWVGb3JtYXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gdmFsaWRhdGUgbWluIGRhdGUsIG1heCBkYXRlLCBleGNsdWRlIGRhdGVzIGFuZCBleGNsdWRlIGRheXNcbiAgICAgKiBJbiBtb2JpbGUgaWYgaW52YWxpZCBkYXRlcyBhcmUgZW50ZXJlZCwgZGV2aWNlIGlzIHNob3dpbmcgYW4gYWxlcnQuXG4gICAgICogSW4gd2ViIGlmIGludmFsaWQgZGF0ZXMgYXJlIGVudGVyZWQsIGRldmljZSBpcyBzaG93aW5nIHZhbGlkYXRpb24gbWVzc2FnZS5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgbWluRGF0ZU1heERhdGVWYWxpZGF0aW9uT25JbnB1dChuZXdWYWwsICRldmVudD86IEV2ZW50LCBkaXNwbGF5VmFsdWU/OiBzdHJpbmcsIGlzTmF0aXZlUGlja2VyPzogYm9vbGVhbikge1xuICAgICAgICBpZiAobmV3VmFsKSB7XG4gICAgICAgICAgICBuZXdWYWwgPSBtb21lbnQobmV3VmFsKS5zdGFydE9mKCdkYXknKS50b0RhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IG1pbkRhdGUgPSBtb21lbnQoZ2V0RGF0ZU9iaih0aGlzLm1pbmRhdGUpKS5zdGFydE9mKCdkYXknKS50b0RhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IG1heERhdGUgPSAgbW9tZW50KGdldERhdGVPYmoodGhpcy5tYXhkYXRlKSkuc3RhcnRPZignZGF5JykudG9EYXRlKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5taW5kYXRlICYmIG5ld1ZhbCA8IG1pbkRhdGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBgJHt0aGlzLmFwcExvY2FsZS5MQUJFTF9NSU5EQVRFX1ZBTElEQVRJT05fTUVTU0FHRX0gJHt0aGlzLm1pbmRhdGV9LmA7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlTm90SW5SYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hvd1ZhbGlkYXRpb24oJGV2ZW50LCBkaXNwbGF5VmFsdWUsIGlzTmF0aXZlUGlja2VyLCBtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubWF4ZGF0ZSAmJiBuZXdWYWwgPiBtYXhEYXRlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gYCR7dGhpcy5hcHBMb2NhbGUuTEFCRUxfTUFYREFURV9WQUxJREFUSU9OX01FU1NBR0V9ICR7dGhpcy5tYXhkYXRlfS5gO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZU5vdEluUmFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsIHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNob3dWYWxpZGF0aW9uKCRldmVudCwgZGlzcGxheVZhbHVlLCBpc05hdGl2ZVBpY2tlciwgbXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmV4Y2x1ZGVkYXRlcykge1xuICAgICAgICAgICAgICAgIGxldCBleGNsdWRlRGF0ZXNBcnJheTtcbiAgICAgICAgICAgICAgICBpZiAoaXNTdHJpbmcodGhpcy5leGNsdWRlZGF0ZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGVEYXRlc0FycmF5ID0gXy5zcGxpdCh0aGlzLmV4Y2x1ZGVkYXRlcywgJywnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBleGNsdWRlRGF0ZXNBcnJheSA9IHRoaXMuZXhjbHVkZWRhdGVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBleGNsdWRlRGF0ZXNBcnJheSA9IGV4Y2x1ZGVEYXRlc0FycmF5Lm1hcChkID0+IGdldEZvcm1hdHRlZERhdGUodGhpcy5kYXRlUGlwZSwgZCwgdGhpcy5kYXRlcGF0dGVybikpO1xuICAgICAgICAgICAgICAgIGlmIChleGNsdWRlRGF0ZXNBcnJheS5pbmRleE9mKGdldEZvcm1hdHRlZERhdGUodGhpcy5kYXRlUGlwZSwgbmV3VmFsLCB0aGlzLmRhdGVwYXR0ZXJuKSkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGVOb3RJblJhbmdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5leGNsdWRlZGF5cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4Y2x1ZGVEYXlzQXJyYXkgPSAgXy5zcGxpdCh0aGlzLmV4Y2x1ZGVkYXlzLCAnLCcpO1xuICAgICAgICAgICAgICAgIGlmIChleGNsdWRlRGF5c0FycmF5LmluZGV4T2YobmV3VmFsLmdldERheSgpLnRvU3RyaW5nKCkpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlTm90SW5SYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsIHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc05hdGl2ZVBpY2tlcikge1xuICAgICAgICAgICAgdGhpcy5kYXRlTm90SW5SYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIGhpZ2hsaWdodCB0aGUgY3VycmVudCBkYXRlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhpZ2h0bGlnaHRUb2RheSgpIHtcbiAgICAgICAgY29uc3QgdG9EYXkgPSBuZXcgRGF0ZSgpLmdldERhdGUoKS50b1N0cmluZygpO1xuICAgICAgICBfLmZpbHRlcigkKGBzcGFuOmNvbnRhaW5zKCR7dG9EYXl9KWApLm5vdCgnLmlzLW90aGVyLW1vbnRoJyksIChvYmopID0+IHtcbiAgICAgICAgICAgIGlmICgkKG9iaikudGV4dCgpID09PSB0b0RheSkge1xuICAgICAgICAgICAgICAgICQob2JqKS5hZGRDbGFzcygnY3VycmVudC1kYXRlIHRleHQtaW5mbycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIGZpbmQgdGhlIG5ldyBkYXRlIGlzIGZyb20gYW5vdGhlciB5ZWFyIG9yIG5vdFxuICAgICAqIEBwYXJhbSBuZXdEYXRlIC0gbmV3bHkgc2VsZWN0ZWQgZGF0ZSB2YWx1ZVxuICAgICAqL1xuICAgIHByaXZhdGUgaXNPdGhlcnllYXIobmV3RGF0ZSkge1xuICAgICAgICByZXR1cm4gKG5ld0RhdGUuZ2V0TW9udGgoKSA9PT0gMCAmJiB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKSA9PT0gMTEpIHx8IChuZXdEYXRlLmdldE1vbnRoKCkgPT09IDExICYmIHRoaXMuYWN0aXZlRGF0ZS5nZXRNb250aCgpID09PSAwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIHNldCBmb2N1cyBmb3IgYWN0aXZlIGRheVxuICAgICAqIEBwYXJhbSBuZXdEYXRlIC0gbmV3bHkgc2VsZWN0ZWQgZGF0ZSB2YWx1ZVxuICAgICAqIEBwYXJhbSBpc01vdXNlRXZlbnQgLSBib29sZWFuIHZhbHVlIHJlcHJlc2VudHMgdGhlIGV2ZW50IGlzIG1vdXNlIGV2ZW50LyBrZXlib2FyZCBldmVudFxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0QWN0aXZlRGF0ZUZvY3VzKG5ld0RhdGUsIGlzTW91c2VFdmVudD86IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgYWN0aXZlTW9udGggPSB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKTtcbiAgICAgICAgLy8gY2hlY2sgZm9yIGtleWJvYXJkIGV2ZW50XG4gICAgICAgICBpZiAoIWlzTW91c2VFdmVudCkge1xuICAgICAgICAgICAgaWYgKG5ld0RhdGUuZ2V0TW9udGgoKSA8IGFjdGl2ZU1vbnRoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc090aGVyeWVhcihuZXdEYXRlKSA/ICB0aGlzLmdvVG9PdGhlck1vbnRoT3J5ZWFyKCduZXh0JywgJ2RheXMnKSA6ICB0aGlzLmdvVG9PdGhlck1vbnRoT3J5ZWFyKCdwcmV2aW91cycsICdkYXlzJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0RhdGUuZ2V0TW9udGgoKSA+IGFjdGl2ZU1vbnRoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc090aGVyeWVhcihuZXdEYXRlKSA/IHRoaXMuZ29Ub090aGVyTW9udGhPcnllYXIoJ3ByZXZpb3VzJywgJ2RheXMnKSA6IHRoaXMuZ29Ub090aGVyTW9udGhPcnllYXIoJ25leHQnLCAnZGF5cycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAobmV3RGF0ZS5nZXRNb250aCgpID09PSBuZXcgRGF0ZSgpLmdldE1vbnRoKCkgJiYgbmV3RGF0ZS5nZXRGdWxsWWVhcigpID09PSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRUb2RheSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbmV3RGF5ID0gbmV3RGF0ZS5nZXREYXRlKCkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIF8uZmlsdGVyKCQoYHNwYW46Y29udGFpbnMoJHtuZXdEYXl9KWApLm5vdCgnLmlzLW90aGVyLW1vbnRoJyksIChvYmopID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoJChvYmopLnRleHQoKSA9PT0gbmV3RGF5KSB7XG4gICAgICAgICAgICAgICAgICAgICQob2JqKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSBuZXdEYXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gbG9hZCBvdGhlciBtb250aCBkYXlzIG9yIG90aGVyIG1vbnRoIG9yIG90aGVyIHllYXJcbiAgICAgKiBAcGFyYW0gYnRuQ2xhc3MgLSBjbGFzcyhwcmV2aW91cy9uZXh0KSBvZiB0aGUgYnV0dG9uIHdoaWNoIHdlIGhhdmUgdG8gY2xpY2tcbiAgICAgKiBAcGFyYW0gdGltZVBlcmlvZCAtIFN0cmluZyB2YWx1ZSBkZWNpZGVzIHRvIGxvYWQgb3RoZXIgbW9udGggZGF5cyBvciBvdGhlciBtb250aCBvciBvdGhlciB5ZWFyXG4gICAgICovXG4gICAgcHJpdmF0ZSBnb1RvT3RoZXJNb250aE9yeWVhcihidG5DbGFzcywgdGltZVBlcmlvZCkge1xuICAgICAgICBjb25zdCAkbm9kZSA9ICQoYC5icy1kYXRlcGlja2VyLWhlYWQgLiR7YnRuQ2xhc3N9YCk7XG4gICAgICAgIGlmICgkbm9kZS5hdHRyKCdkaXNhYmxlZCcpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJG5vZGUudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgaWYgKHRpbWVQZXJpb2QgPT09ICdkYXlzJykge1xuICAgICAgICAgICAgdGhpcy5sb2FkRGF5cygpO1xuICAgICAgICB9IGVsc2UgaWYgKHRpbWVQZXJpb2QgPT09ICdtb250aCcpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZE1vbnRocygpO1xuICAgICAgICB9IGVsc2UgaWYgKHRpbWVQZXJpb2QgPT09ICd5ZWFyJykge1xuICAgICAgICAgICAgdGhpcy5sb2FkWWVhcnMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICogVGhpcyBtZXRob2Qgc2V0cyB0aGUgbW91c2UgZXZlbnRzIHRvIERhdGVwaWNrZXIgcG9wdXAuIFRoZXNlIGV2ZW50cyBhcmUgcmVxdWlyZWQgd2hlbiB3ZSBuYXZpZ2F0ZSBkYXRlIHBpY2tlciB0aHJvdWdoIG1vdXNlLlxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkRGF0ZXBpY2tlck1vdXNlRXZlbnRzKCkge1xuICAgICAgICBjb25zdCBkYXRlUGlrY2VySGVhZCA9ICQoYC5icy1kYXRlcGlja2VyLWhlYWRgKTtcbiAgICAgICAgZGF0ZVBpa2NlckhlYWQuZmluZChgLnByZXZpb3VzYCkuY2xpY2soKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAvLyBjaGVjayBmb3Igb3JpZ2luYWwgbW91c2UgY2xpY2tcbiAgICAgICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGb2N1c0ZvckRhdGUoLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZGF0ZVBpa2NlckhlYWQuZmluZChgLm5leHRgKS5jbGljaygoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIC8vIGNoZWNrIGZvciBvcmlnaW5hbCBtb3VzZSBjbGlja1xuICAgICAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEZvY3VzRm9yRGF0ZSgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRhdGVQaWtjZXJIZWFkLmZpbmQoYC5jdXJyZW50YCkuY2xpY2soKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAvLyBjaGVjayBmb3Igb3JpZ2luYWwgbW91c2UgY2xpY2tcbiAgICAgICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGb2N1c0ZvckN1cnJlbnRNb250aE9yeWVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgJCgnLmJzLWRhdGVwaWNrZXItYm9keScpLmNsaWNrKChldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAvLyBjaGVjayBmb3Igb3JpZ2luYWwgbW91c2UgY2xpY2tcbiAgICAgICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGb2N1c0Zvck1vbnRoT3JEYXkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2Qgc2V0cyBmb2N1cyBmb3IgbW9udGhzL2RheXMgZGVwZW5kaW5nIG9uIHRoZSBsb2FkZWQgZGF0ZXBpY2tlciB0YWJsZVxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0Rm9jdXNGb3JNb250aE9yRGF5KCkge1xuICAgICAgICBjb25zdCBhY3RpdmVNb250aE9yWWVhciA9ICQoYC5icy1kYXRlcGlja2VyLWhlYWQgLmN1cnJlbnRgKS5maXJzdCgpLnRleHQoKTtcbiAgICAgICAgY29uc3QgZGF0ZVBpY2tlckJvZHkgPSAkKCcuYnMtZGF0ZXBpY2tlci1ib2R5Jyk7XG4gICAgICAgIGlmIChkYXRlUGlja2VyQm9keS5maW5kKCd0YWJsZS5tb250aHMnKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAoXy5wYXJzZUludChhY3RpdmVNb250aE9yWWVhcikgIT09IHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkTW9udGhzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoXy5wYXJzZUludChhY3RpdmVNb250aE9yWWVhciksIHRoaXMuYWN0aXZlRGF0ZS5nZXRNb250aCgpLCB0aGlzLmFjdGl2ZURhdGUuZ2V0RGF0ZSgpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlTW9udGhGb2N1cyhuZXdEYXRlLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRlUGlja2VyQm9keS5maW5kKCd0YWJsZS5kYXlzJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgbmV3TW9udGggPSBtb250aHMuaW5kZXhPZihhY3RpdmVNb250aE9yWWVhcik7XG4gICAgICAgICAgICBpZiAobmV3TW9udGggIT09IHRoaXMuYWN0aXZlRGF0ZS5nZXRNb250aCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkRGF5cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpLCBuZXdNb250aCwgMSk7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZURhdGVGb2N1cyhuZXdEYXRlLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHNldHMgZm9jdXMgZm9yIG1vbnRocy95ZWFycyBkZXBlbmRpbmcgb24gdGhlIGxvYWRlZCBkYXRlcGlja2VyIHRhYmxlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRGb2N1c0ZvckN1cnJlbnRNb250aE9yeWVhcigpIHtcbiAgICAgICAgY29uc3QgZGF0ZVBpY2tlckJvZHkgPSAkKCcuYnMtZGF0ZXBpY2tlci1ib2R5Jyk7XG4gICAgICAgIGlmIChkYXRlUGlja2VyQm9keS5maW5kKCd0YWJsZS5tb250aHMnKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRNb250aHMoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlTW9udGhGb2N1cyh0aGlzLmFjdGl2ZURhdGUsIHRydWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGVQaWNrZXJCb2R5LmZpbmQoJ3RhYmxlLnllYXJzJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkWWVhcnMoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlWWVhckZvY3VzKHRoaXMuYWN0aXZlRGF0ZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBzZXRzIGZvY3VzIGZvciBtb250aHMveWVhcnMvZGF5cyBkZXBlbmRpbmcgb24gdGhlIGxvYWRlZCBkYXRlcGlja2VyIHRhYmxlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRGb2N1c0ZvckRhdGUoY291bnQpIHtcbiAgICAgICAgY29uc3QgZGF0ZVBpY2tlckJvZHkgPSAkKCcuYnMtZGF0ZXBpY2tlci1ib2R5Jyk7XG4gICAgICAgIGlmIChkYXRlUGlja2VyQm9keS5maW5kKCd0YWJsZS5tb250aHMnKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRNb250aHMoKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0RhdGUgPSBuZXcgRGF0ZSh0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSArIGNvdW50LCAwLCB0aGlzLmFjdGl2ZURhdGUuZ2V0RGF0ZSgpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlTW9udGhGb2N1cyhuZXdEYXRlLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRlUGlja2VyQm9keS5maW5kKCd0YWJsZS55ZWFycycpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMubG9hZFllYXJzKCk7XG4gICAgICAgICAgICBjb25zdCBzdGFydFllYXIgPSBkYXRlUGlja2VyQm9keS5maW5kKCd0YWJsZS55ZWFycyBzcGFuJykuZmlyc3QoKS50ZXh0KCk7XG4gICAgICAgICAgICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoXy5wYXJzZUludChzdGFydFllYXIpLCB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKSwgdGhpcy5hY3RpdmVEYXRlLmdldERhdGUoKSk7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZVllYXJGb2N1cyhuZXdEYXRlLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRlUGlja2VyQm9keS5maW5kKCd0YWJsZS5kYXlzJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkRGF5cygpO1xuICAgICAgICAgICAgY29uc3QgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKSArIGNvdW50LCAxKTtcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlRGF0ZUZvY3VzKG5ld0RhdGUsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBhZGQga2V5Ym9hcmQgZXZlbnRzIHdoaWxlIG9wZW5pbmcgdGhlIGRhdGUgcGlja2VyXG4gICAgICogQHBhcmFtIHNjb3BlIC0gc2NvcGUgb2YgdGhlIGRhdGUvZGF0ZXRpbWUgd2lkZ2V0XG4gICAgICogQHBhcmFtIGlzRGF0ZVRpbWUgLSBib29sZWFuIHZhbHVlIHJlcHJlc2VudHMgdGhlIGxvYWRlZCB3aWRnZXQgaXMgZGF0ZSBvciBkYXRldGltZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhZGREYXRlcGlja2VyS2V5Ym9hcmRFdmVudHMoc2NvcGUsIGlzRGF0ZVRpbWUpIHtcbiAgICAgICAgdGhpcy5rZXlFdmVudFBsdWdpbkluc3RhbmNlID0gc2NvcGUua2V5RXZlbnRQbHVnaW4uY29uc3RydWN0b3I7XG4gICAgICAgIHRoaXMuZWxlbWVudFNjb3BlID0gc2NvcGU7XG4gICAgICAgIGNvbnN0IGRhdGVDb250YWluZXIgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7c2NvcGUuZGF0ZUNvbnRhaW5lckNsc31gKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgc2V0QXR0cihkYXRlQ29udGFpbmVyLCAndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgICBkYXRlQ29udGFpbmVyLm9ua2V5ZG93biA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWN0aW9uID0gdGhpcy5rZXlFdmVudFBsdWdpbkluc3RhbmNlLmdldEV2ZW50RnVsbEtleShldmVudCk7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgU2hpZnQrVGFiIGtleSBvciBUYWIga2V5IG9yIGVzY2FwZVxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ3NoaWZ0LnRhYicgfHwgYWN0aW9uID09PSAnZXNjYXBlJyB8fCAoYWN0aW9uID09PSAndGFiJyAmJiAhaXNEYXRlVGltZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnRTY29wZS5oaWRlRGF0ZXBpY2tlckRyb3Bkb3duKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlzcGxheUlucHV0RWxlbSA9IHRoaXMuZWxlbWVudFNjb3BlLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmRpc3BsYXktaW5wdXQnKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGRpc3BsYXlJbnB1dEVsZW0uZm9jdXMoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSAndGFiJyAmJiBpc0RhdGVUaW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ic0RhdGVQaWNrZXJEaXJlY3RpdmUuaGlkZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudFNjb3BlLnRvZ2dsZVRpbWVQaWNrZXIodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubG9hZERheXMoKTtcbiAgICAgICAgdGhpcy5zZXRBY3RpdmVEYXRlRm9jdXModGhpcy5hY3RpdmVEYXRlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIGFkZCB0YWJpbmRleCwga2V5Ym9yZCBhbmQgbW91c2UgZXZlbnRzIGZvciBkYXlzXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkRGF5cygpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAkKCcuYnMtZGF0ZXBpY2tlci1ib2R5JykuYXR0cigndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgICAgICAgJCgnW2JzZGF0ZXBpY2tlcmRheWRlY29yYXRvcl0nKS5ub3QoJy5pcy1vdGhlci1tb250aCcpLmF0dHIoJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgICAgICAgIHRoaXMuYWRkS2V5Qm9hcmRFdmVudHNGb3JEYXlzKCk7XG4gICAgICAgICAgICB0aGlzLmFkZERhdGVwaWNrZXJNb3VzZUV2ZW50cygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBzZXRzIGtleWJvYXJkIGV2ZW50cyBmb3IgZGF5c1xuICAgICAqL1xuICAgIHByaXZhdGUgYWRkS2V5Qm9hcmRFdmVudHNGb3JEYXlzKCkge1xuICAgICAgICBjb25zdCBkYXRlUGlja2VyQm9keSA9ICQoJy5icy1kYXRlcGlja2VyLWJvZHknKTtcbiAgICAgICAgaWYgKGRhdGVQaWNrZXJCb2R5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGRhdGVQaWNrZXJCb2R5WzBdLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGRhdGVQaWNrZXJCb2R5LmtleWRvd24oKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb24gPSB0aGlzLmtleUV2ZW50UGx1Z2luSW5zdGFuY2UuZ2V0RXZlbnRGdWxsS2V5KGV2ZW50KTtcbiAgICAgICAgICAgIGxldCBuZXdkYXRlO1xuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ2Fycm93ZG93bicpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIG5ld2RhdGUgPSBtb21lbnQodGhpcy5hY3RpdmVEYXRlKS5hZGQoKzcsICdkYXlzJykudG9EYXRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVEYXRlRm9jdXMobmV3ZGF0ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2Fycm93dXAnKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBuZXdkYXRlID0gbW9tZW50KHRoaXMuYWN0aXZlRGF0ZSkuYWRkKC03LCAnZGF5cycpLnRvRGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlRGF0ZUZvY3VzKG5ld2RhdGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdhcnJvd2xlZnQnKSB7XG4gICAgICAgICAgICAgICAgbmV3ZGF0ZSA9IG1vbWVudCh0aGlzLmFjdGl2ZURhdGUpLmFkZCgtMSwgJ2RheXMnKS50b0RhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZURhdGVGb2N1cyhuZXdkYXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnYXJyb3dyaWdodCcpIHtcbiAgICAgICAgICAgICAgICBuZXdkYXRlID0gbW9tZW50KHRoaXMuYWN0aXZlRGF0ZSkuYWRkKCsxLCAnZGF5cycpLnRvRGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlRGF0ZUZvY3VzKG5ld2RhdGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdjb250cm9sLmFycm93dXAnKSB7XG4gICAgICAgICAgICAgICAgLy8gY2xpY2tpbmcgb24gdGFibGUgaGVhZGVyIG1vbnRoIG5hbWUgdG8gbG9hZCBsaXN0IG9mIG1vbnRoc1xuICAgICAgICAgICAgICAgICQoJy5icy1kYXRlcGlja2VyLWhlYWQgLmN1cnJlbnQnKS5maXJzdCgpLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkTW9udGhzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVNb250aEZvY3VzKHRoaXMuYWN0aXZlRGF0ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2VudGVyJykge1xuICAgICAgICAgICAgICAgIGlmICgkKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KS5jbGljaygpO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudFNjb3BlLmhpZGVEYXRlcGlja2VyRHJvcGRvd24oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkaXNwbGF5SW5wdXRFbGVtID0gdGhpcy5lbGVtZW50U2NvcGUubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZGlzcGxheS1pbnB1dCcpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gZGlzcGxheUlucHV0RWxlbS5mb2N1cygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBhZGQgdGFiaW5kZXgsIGtleWJvcmQgYW5kIG1vdXNlIGV2ZW50cyBmb3IgbW9udGhzXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkTW9udGhzKCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGVQaWNrZXJCb2R5ID0gJCgnLmJzLWRhdGVwaWNrZXItYm9keScpO1xuICAgICAgICAgICAgZGF0ZVBpY2tlckJvZHkuYXR0cigndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgICAgICAgZGF0ZVBpY2tlckJvZHkuZmluZCgndGFibGUubW9udGhzIHNwYW4nKS5hdHRyKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICAgICAgICB0aGlzLmFkZEtleUJvYXJkRXZlbnRzRm9yTW9udGhzKCk7XG4gICAgICAgICAgICB0aGlzLmFkZERhdGVwaWNrZXJNb3VzZUV2ZW50cygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBzZXRzIGtleWJvYXJkIGV2ZW50cyBmb3IgbW9udGhzXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRLZXlCb2FyZEV2ZW50c0Zvck1vbnRocygpIHtcbiAgICAgICAgJCgnLmJzLWRhdGVwaWNrZXItYm9keScpLmtleWRvd24oKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb24gPSB0aGlzLmtleUV2ZW50UGx1Z2luSW5zdGFuY2UuZ2V0RXZlbnRGdWxsS2V5KGV2ZW50KTtcbiAgICAgICAgICAgIGxldCBuZXdkYXRlO1xuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ2Fycm93ZG93bicpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIG5ld2RhdGUgPSBtb21lbnQodGhpcy5hY3RpdmVEYXRlKS5hZGQoKzMsICdtb250aCcpLnRvRGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlTW9udGhGb2N1cyhuZXdkYXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnYXJyb3d1cCcpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIG5ld2RhdGUgPSBtb21lbnQodGhpcy5hY3RpdmVEYXRlKS5hZGQoLTMsICdtb250aCcpLnRvRGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlTW9udGhGb2N1cyhuZXdkYXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnYXJyb3dsZWZ0Jykge1xuICAgICAgICAgICAgICAgIG5ld2RhdGUgPSBtb21lbnQodGhpcy5hY3RpdmVEYXRlKS5hZGQoLTEsICdtb250aCcpLnRvRGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlTW9udGhGb2N1cyhuZXdkYXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnYXJyb3dyaWdodCcpIHtcbiAgICAgICAgICAgICAgICBuZXdkYXRlID0gbW9tZW50KHRoaXMuYWN0aXZlRGF0ZSkuYWRkKCsxLCAnbW9udGgnKS50b0RhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZU1vbnRoRm9jdXMobmV3ZGF0ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2NvbnRyb2wuYXJyb3d1cCcpIHtcbiAgICAgICAgICAgICAgICAvLyBjbGlja2luZyBvbiB0YWJsZSBoZWFkZXIgeWVhciB0byBsb2FkIGxpc3Qgb2YgeWVhcnNcbiAgICAgICAgICAgICAgICAkKCcuYnMtZGF0ZXBpY2tlci1oZWFkIC5jdXJyZW50JykuZmlyc3QoKS5jbGljaygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZFllYXJzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVZZWFyRm9jdXModGhpcy5hY3RpdmVEYXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnY29udHJvbC5hcnJvd2Rvd24nIHx8IGFjdGlvbiA9PT0gJ2VudGVyJykge1xuICAgICAgICAgICAgICAgIGlmICgkKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpLnBhcmVudCgpLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KS5jbGljaygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZERheXMoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUodGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMuYWN0aXZlRGF0ZS5nZXRNb250aCgpLCAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZURhdGVGb2N1cyhuZXdEYXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBhZGQgdGFiaW5kZXgsIGtleWJvcmQgYW5kIG1vdXNlIGV2ZW50cyBmb3IgeWVhcnNcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvYWRZZWFycygpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkYXRlUGlja2VyQm9keSA9ICQoJy5icy1kYXRlcGlja2VyLWJvZHknKTtcbiAgICAgICAgICAgIGRhdGVQaWNrZXJCb2R5LmF0dHIoJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgICAgICAgIGRhdGVQaWNrZXJCb2R5LmZpbmQoJ3RhYmxlLnllYXJzIHNwYW4nKS5hdHRyKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICAgICAgICB0aGlzLmFkZEtleUJvYXJkRXZlbnRzRm9yWWVhcnMoKTtcbiAgICAgICAgICAgIHRoaXMuYWRkRGF0ZXBpY2tlck1vdXNlRXZlbnRzKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gc2V0IGZvY3VzIGZvciBhY3RpdmUgbW9udGhcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldEFjdGl2ZU1vbnRoRm9jdXMobmV3RGF0ZSwgaXNNb291c2VFdmVudD86IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgbmV3TW9udGggPSBtb250aHNbbmV3RGF0ZS5nZXRNb250aCgpXTtcbiAgICAgICAgLy8gY2hlY2sgZm9yIGtleWJvYXJkIGV2ZW50XG4gICAgICAgIGlmICghaXNNb291c2VFdmVudCkge1xuICAgICAgICAgICAgaWYgKG5ld0RhdGUuZ2V0RnVsbFllYXIoKSA8IHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nb1RvT3RoZXJNb250aE9yeWVhcigncHJldmlvdXMnLCAnbW9udGgnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3RGF0ZS5nZXRGdWxsWWVhcigpID4gdGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdvVG9PdGhlck1vbnRoT3J5ZWFyKCduZXh0JywgJ21vbnRoJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICAgICAgJChgLmJzLWRhdGVwaWNrZXItYm9keSB0YWJsZS5tb250aHMgc3Bhbjpjb250YWlucygke25ld01vbnRofSlgKS5mb2N1cygpO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gbmV3RGF0ZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2Qgc2V0cyBrZXlib2FyZCBldmVudHMgZm9yIHllYXJzXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRLZXlCb2FyZEV2ZW50c0ZvclllYXJzKCkge1xuICAgICAgICAkKCcuYnMtZGF0ZXBpY2tlci1ib2R5Jykua2V5ZG93bigoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMua2V5RXZlbnRQbHVnaW5JbnN0YW5jZS5nZXRFdmVudEZ1bGxLZXkoZXZlbnQpO1xuICAgICAgICAgICAgbGV0IG5ld2RhdGU7XG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnYXJyb3dkb3duJykge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgbmV3ZGF0ZSA9IG1vbWVudCh0aGlzLmFjdGl2ZURhdGUpLmFkZCgrNCwgJ3llYXInKS50b0RhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZVllYXJGb2N1cyhuZXdkYXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnYXJyb3d1cCcpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIG5ld2RhdGUgPSBtb21lbnQodGhpcy5hY3RpdmVEYXRlKS5hZGQoLTQsICd5ZWFyJykudG9EYXRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVZZWFyRm9jdXMobmV3ZGF0ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2Fycm93bGVmdCcpIHtcbiAgICAgICAgICAgICAgICBuZXdkYXRlID0gbW9tZW50KHRoaXMuYWN0aXZlRGF0ZSkuYWRkKC0xLCAneWVhcicpLnRvRGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlWWVhckZvY3VzKG5ld2RhdGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdhcnJvd3JpZ2h0Jykge1xuICAgICAgICAgICAgICAgIG5ld2RhdGUgPSBtb21lbnQodGhpcy5hY3RpdmVEYXRlKS5hZGQoKzEsICd5ZWFyJykudG9EYXRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVZZWFyRm9jdXMobmV3ZGF0ZSk7XG4gICAgICAgICAgICB9ICBlbHNlIGlmIChhY3Rpb24gPT09ICdjb250cm9sLmFycm93ZG93bicgfHwgYWN0aW9uID09PSAnZW50ZXInKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkucGFyZW50KCkuaGFzQ2xhc3MoJ2Rpc2FibGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkTW9udGhzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVNb250aEZvY3VzKHRoaXMuYWN0aXZlRGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gc2V0IGZvY3VzIGZvciBhY3RpdmUgeWVhclxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0QWN0aXZlWWVhckZvY3VzKG5ld0RhdGUsIGlzTW91c2VFdmVudD86IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgbmV3WWVhciA9IG5ld0RhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgY29uc3QgZGF0ZVBpY2tlclllYXJzID0gJCgnLmJzLWRhdGVwaWNrZXItYm9keSB0YWJsZS55ZWFycyBzcGFuJyk7XG4gICAgICAgIGNvbnN0IHN0YXJ0WWVhciA9IGRhdGVQaWNrZXJZZWFycy5maXJzdCgpLnRleHQoKTtcbiAgICAgICAgY29uc3QgZW5kWWVhciA9IGRhdGVQaWNrZXJZZWFycy5sYXN0KCkudGV4dCgpO1xuICAgICAgICAvLyBjaGVjayBmb3Iga2V5Ym9hcmQgZXZlbnRcbiAgICAgICAgaWYgKCFpc01vdXNlRXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChuZXdEYXRlLmdldEZ1bGxZZWFyKCkgPCBfLnBhcnNlSW50KHN0YXJ0WWVhcikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdvVG9PdGhlck1vbnRoT3J5ZWFyKCdwcmV2aW91cycsICd5ZWFyJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0RhdGUuZ2V0RnVsbFllYXIoKSA+IF8ucGFyc2VJbnQoZW5kWWVhcikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdvVG9PdGhlck1vbnRoT3J5ZWFyKCduZXh0JywgJ3llYXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICAgICAgICAkKGAuYnMtZGF0ZXBpY2tlci1ib2R5IHRhYmxlLnllYXJzIHNwYW46Y29udGFpbnMoJHtuZXdZZWFyfSlgKS5mb2N1cygpO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gbmV3RGF0ZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2Qgc2V0cyBmb2N1cyBmb3IgdGltZXBpY2tlciBmaXJzdCBpbnB1dCBmaWVsZChob3VycyBmaWVsZCkgd2hpbGUgb3BlbmluZyB0aW1lIHBpY2tlclxuICAgICAqIEBwYXJhbSBzY29wZSAtIHNjb3BlIG9mIHRoZSB0aW1lIHBpY2tlciB3aWRnZXRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZm9jdXNUaW1lUGlja2VyUG9wb3ZlcihzY29wZSkge1xuICAgICAgICB0aGlzLmtleUV2ZW50UGx1Z2luSW5zdGFuY2UgPSBzY29wZS5rZXlFdmVudFBsdWdpbi5jb25zdHJ1Y3RvcjtcbiAgICAgICAgdGhpcy5lbGVtZW50U2NvcGUgPSBzY29wZTtcbiAgICAgICAgLy8gc2V0VGltZW91dCBpcyB1c2VkIHNvIHRoYXQgYnkgdGhlbiB0aW1lIGlucHV0IGhhcyB0aGUgdXBkYXRlZCB2YWx1ZS4gZm9jdXMgaXMgc2V0dGluZyBiYWNrIHRvIHRoZSBpbnB1dCBmaWVsZFxuICAgICAgICB0aGlzLmVsZW1lbnRTY29wZS5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgJCgndGltZXBpY2tlciAuZm9ybS1ncm91cDpmaXJzdCA+IGlucHV0LmZvcm0tY29udHJvbCcpLmZvY3VzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cblxuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHNldHMgdGhlIGtleWJvYXJkIGV2ZW50cyB0byBUaW1lcGlja2VyIHBvcHVwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGJpbmRUaW1lUGlja2VyS2V5Ym9hcmRFdmVudHMoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgJHRpbWVwaWNrZXJQb3B1cCA9ICQoJ2JvZHknKS5maW5kKCc+IGJzLWRyb3Bkb3duLWNvbnRhaW5lciB0aW1lcGlja2VyJyk7XG4gICAgICAgICAgICAkdGltZXBpY2tlclBvcHVwLmF0dHIoJ3RhYmluZGV4JywgMCk7XG4gICAgICAgICAgICB0aGlzLmFkZEV2ZW50c09uVGltZVBpY2tlcigkdGltZXBpY2tlclBvcHVwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiBjaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gZGF0ZSBpcyB2YWxpZCBvciBub3RcbiAgICAgKiBAcmV0dXJucyBib29sZWFuIHZhbHVlLCB0cnVlIGlmIGRhdGUgaXMgdmFsaWQgZWxzZSByZXR1cm5zIGZhbHNlXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc1ZhbGlkRGF0ZShkYXRlKSB7XG4gICAgICAgIHJldHVybiBkYXRlICYmIGRhdGUgaW5zdGFuY2VvZiBEYXRlICYmICFpc05hTihkYXRlLmdldFRpbWUoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiBjaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gdGltZSBpcyB2YWxpZCBvciBub3RcbiAgICAgKi9cbiAgICBwcml2YXRlIHRpbWVGb3JtYXRWYWxpZGF0aW9uKCkge1xuICAgICAgICBjb25zdCBlbnRlcmVkRGF0ZSA9ICQodGhpcy5uYXRpdmVFbGVtZW50KS5maW5kKCdpbnB1dCcpLnZhbCgpO1xuICAgICAgICBjb25zdCBuZXdWYWwgPSBnZXROYXRpdmVEYXRlT2JqZWN0KGVudGVyZWREYXRlKTtcbiAgICAgICAgaWYgKCF0aGlzLmZvcm1hdFZhbGlkYXRpb24obmV3VmFsLCBlbnRlcmVkRGF0ZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmludmFsaWREYXRlVGltZUZvcm1hdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHNldHMgdGhlIGV2ZW50cyB0byBnaXZlbiBlbGVtZW50XG4gICAgICogQHBhcmFtICRlbCAtIGVsZW1lbnQgb24gd2hpY2ggdGhlIGV2ZW50IGlzIGFkZGVkXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRFdmVudHNPblRpbWVQaWNrZXIoJGVsOiBKUXVlcnkpIHtcbiAgICAgICAgJGVsLm9uKCdrZXlkb3duJywgZXZ0ID0+IHtcbiAgICAgICAgICAgIGNvbnN0ICR0YXJnZXQgPSAkKGV2dC50YXJnZXQpO1xuICAgICAgICAgICAgY29uc3QgJHBhcmVudCA9ICR0YXJnZXQucGFyZW50KCk7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50U2NvcGUgPSB0aGlzLmVsZW1lbnRTY29wZTtcblxuICAgICAgICAgICAgY29uc3QgYWN0aW9uID0gdGhpcy5rZXlFdmVudFBsdWdpbkluc3RhbmNlLmdldEV2ZW50RnVsbEtleShldnQpO1xuXG4gICAgICAgICAgICBsZXQgc3RvcFByb3BvZ2F0aW9uLCBwcmV2ZW50RGVmYXVsdDtcblxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ2VzY2FwZScpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50U2NvcGUuaGlkZVRpbWVwaWNrZXJEcm9wZG93bigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJHRhcmdldC5oYXNDbGFzcygnYnMtdGltZXBpY2tlci1maWVsZCcpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCRwYXJlbnQuaXMoJzpmaXJzdC1jaGlsZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdzaGlmdC50YWInIHx8IGFjdGlvbiA9PT0gJ2VudGVyJyB8fCBhY3Rpb24gPT09ICdlc2NhcGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50U2NvcGUuc2V0SXNUaW1lT3BlbihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9wUHJvcG9nYXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICgkcGFyZW50LmlzKCc6bGFzdC1jaGlsZCcpIHx8ICgkcGFyZW50Lm5leHQoKS5uZXh0KCkuZmluZCgnYnV0dG9uLmRpc2FibGVkJykubGVuZ3RoKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aW9uID09PSAndGFiJyB8fCBhY3Rpb24gPT09ICdlc2NhcGUnIHx8IGFjdGlvbiA9PT0gJ2VudGVyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFNjb3BlLnNldElzVGltZU9wZW4oZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcFByb3BvZ2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdlbnRlcicgfHwgYWN0aW9uID09PSAnZXNjYXBlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFNjb3BlLnNldElzVGltZU9wZW4oZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcFByb3BvZ2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3RvcFByb3BvZ2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudFNjb3BlLm1pbnRpbWUgJiYgZWxlbWVudFNjb3BlLm1heHRpbWUgJiYgIXRoaXMuaXNWYWxpZERhdGUoZWxlbWVudFNjb3BlLmJzVGltZVZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnYXJyb3dkb3duJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFNjb3BlLmJzVGltZVZhbHVlID0gZWxlbWVudFNjb3BlLm1heFRpbWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnYXJyb3d1cCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRTY29wZS5ic1RpbWVWYWx1ZSA9IGVsZW1lbnRTY29wZS5taW5UaW1lO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICd0YWInKSB7XG4gICAgICAgICAgICAgICAgICAgdGhpcy5pbnZhbGlkRGF0ZVRpbWVGb3JtYXQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICBjb25zdCBwYXR0ZXJuID0gdGhpcy5kYXRlcGF0dGVybiB8fCB0aGlzLnRpbWVwYXR0ZXJuO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0Rm9ybWF0dGVkRGF0ZShlbGVtZW50U2NvcGUuZGF0ZVBpcGUsIGVsZW1lbnRTY29wZS5ic1RpbWVWYWx1ZSwgcGF0dGVybikgPT09IGVsZW1lbnRTY29wZS5kaXNwbGF5VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcy5uYXRpdmVFbGVtZW50KS5maW5kKCcuZGlzcGxheS1pbnB1dCcpLnZhbChlbGVtZW50U2NvcGUuZGlzcGxheVZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnYXJyb3dkb3duJyB8fCAgYWN0aW9uID09PSAnYXJyb3d1cCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lRm9ybWF0VmFsaWRhdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9IGVsc2UgaWYgKCR0YXJnZXQuaGFzQ2xhc3MoJ2J0bi1kZWZhdWx0JykpIHtcbiAgICAgICAgICAgICAgICBpZiAoYWN0aW9uID09PSAndGFiJyB8fCBhY3Rpb24gPT09ICdlc2NhcGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRTY29wZS5zZXRJc1RpbWVPcGVuKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgICRlbC5maW5kKCdhJykub24oJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRTY29wZSA9IHRoaXMuZWxlbWVudFNjb3BlO1xuICAgICAgICAgICAgY29uc3QgJHRhcmdldCA9ICQoZXZ0LnRhcmdldCk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNjb3BlLm1pbnRpbWUgJiYgZWxlbWVudFNjb3BlLm1heHRpbWUgJiYgIXRoaXMuaXNWYWxpZERhdGUoZWxlbWVudFNjb3BlLmJzVGltZVZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmICgkdGFyZ2V0LmZpbmQoJ3NwYW4nKS5oYXNDbGFzcygnYnMtY2hldnJvbi1kb3duJykpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudFNjb3BlLmJzVGltZVZhbHVlID0gZWxlbWVudFNjb3BlLm1heFRpbWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICgkdGFyZ2V0LmZpbmQoJ3NwYW4nKS5oYXNDbGFzcygnYnMtY2hldnJvbi11cCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRTY29wZS5ic1RpbWVWYWx1ZSA9IGVsZW1lbnRTY29wZS5taW5UaW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGltZUZvcm1hdFZhbGlkYXRpb24oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHVwZGF0ZUZvcm1hdChwYXR0ZXJuKSB7XG4gICAgICAgIGlmIChwYXR0ZXJuID09PSAnZGF0ZXBhdHRlcm4nKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRlT3B0aW9ucy5kYXRlSW5wdXRGb3JtYXQgPSB0aGlzLmRhdGVwYXR0ZXJuO1xuICAgICAgICAgICAgdGhpcy5zaG93c2Vjb25kcyA9IF8uaW5jbHVkZXModGhpcy5kYXRlcGF0dGVybiwgJ3MnKTtcbiAgICAgICAgICAgIHRoaXMuaXNtZXJpZGlhbiA9IF8uaW5jbHVkZXModGhpcy5kYXRlcGF0dGVybiwgJ2gnKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXR0ZXJuID09PSAndGltZXBhdHRlcm4nKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dzZWNvbmRzID0gXy5pbmNsdWRlcyh0aGlzLnRpbWVwYXR0ZXJuLCAncycpO1xuICAgICAgICAgICAgdGhpcy5pc21lcmlkaWFuID0gXy5pbmNsdWRlcyh0aGlzLnRpbWVwYXR0ZXJuLCAnaCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdj8pIHtcblxuICAgICAgICBpZiAoa2V5ID09PSAndGFiaW5kZXgnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudXNlRGF0YXBpY2tlciAmJiBrZXkgPT09ICdkYXRlcGF0dGVybicpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRm9ybWF0KGtleSk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnc2hvd3dlZWtzJykge1xuICAgICAgICAgICAgdGhpcy5fZGF0ZU9wdGlvbnMuc2hvd1dlZWtOdW1iZXJzID0gbnY7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbWluZGF0ZScpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGVPcHRpb25zLm1pbkRhdGUgPSAobnYgPT09IENVUlJFTlRfREFURSkgPyAgdGhpcy5taW5kYXRlID0gbmV3IERhdGUoKSA6IGdldERhdGVPYmoobnYpO1xuICAgICAgICAgICAgdGhpcy5taW5EYXRlTWF4RGF0ZVZhbGlkYXRpb25PbklucHV0KHRoaXMuZGF0YXZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdtYXhkYXRlJykge1xuICAgICAgICAgICB0aGlzLl9kYXRlT3B0aW9ucy5tYXhEYXRlID0gKG52ID09PSBDVVJSRU5UX0RBVEUpID8gIHRoaXMubWF4ZGF0ZSA9IG5ldyBEYXRlKCkgOiBnZXREYXRlT2JqKG52KTtcbiAgICAgICAgICAgIHRoaXMubWluRGF0ZU1heERhdGVWYWxpZGF0aW9uT25JbnB1dCh0aGlzLmRhdGF2YWx1ZSk7XG4gICAgICAgIH0gIGVsc2UgaWYgKGtleSA9PT0gJ2V4Y2x1ZGVkYXRlcycgfHwga2V5ID09PSAnZXhjbHVkZWRheXMnKSB7XG4gICAgICAgICAgICB0aGlzLm1pbkRhdGVNYXhEYXRlVmFsaWRhdGlvbk9uSW5wdXQodGhpcy5kYXRhdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuICAgICAgICBpZiAodGhpcy5ic0RhdGVQaWNrZXJEaXJlY3RpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0ZU9uU2hvd1N1YnNjcmlwdGlvbiA9IHRoaXMuYnNEYXRlUGlja2VyRGlyZWN0aXZlXG4gICAgICAgICAgICAgICAgLm9uU2hvd25cbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKGNhbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNhbC5kYXlzQ2FsZW5kYXIuc3Vic2NyaWJlKGRhdGEgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4Y2x1ZGVkRGF0ZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5leGNsdWRlZGF0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdHJpbmcodGhpcy5leGNsdWRlZGF0ZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGVkRGF0ZXMgPSBfLnNwbGl0KHRoaXMuZXhjbHVkZWRhdGVzLCAnLCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGVkRGF0ZXMgPSB0aGlzLmV4Y2x1ZGVkYXRlcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhjbHVkZWREYXRlcyA9IGV4Y2x1ZGVkRGF0ZXMubWFwKGQgPT4gbW9tZW50KGQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbMF0ud2Vla3MuZm9yRWFjaCh3ZWVrID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3ZWVrLmRheXMuZm9yRWFjaChkYXkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRheS5pc0Rpc2FibGVkICYmIHRoaXMuZXhjbHVkZWRheXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRheS5pc0Rpc2FibGVkID0gXy5pbmNsdWRlcyh0aGlzLmV4Y2x1ZGVkYXlzLCBkYXkuZGF5SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXkuaXNEaXNhYmxlZCAmJiBleGNsdWRlZERhdGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZCA9IG1vbWVudChkYXkuZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXkuaXNEaXNhYmxlZCA9IGV4Y2x1ZGVkRGF0ZXMuc29tZShlZCA9PiBtZC5pc1NhbWUoZWQsICdkYXknKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGVPblNob3dTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuZGF0ZU9uU2hvd1N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB9XG59XG4iXX0=