import { ViewChild } from '@angular/core';
import { BsDropdownDirective } from 'ngx-bootstrap';
import { getDateObj, getFormattedDate, getNativeDateObject, isString, setAttr } from '@wm/core';
import { BaseFormCustomComponent } from './base-form-custom.component';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { ToDatePipe } from '../../../pipes/custom-pipes';
const CURRENT_DATE = 'CURRENT_DATE';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DATEPICKER_DROPDOWN_OPTIONS = {
    BUTTON: 'button',
    DEFAULT: 'default'
};
export class BaseDateTimeComponent extends BaseFormCustomComponent {
    constructor(inj, WIDGET_CONFIG) {
        super(inj, WIDGET_CONFIG);
        this.useDatapicker = true;
        /**
         * This is an internal property used to map the containerClass, showWeekNumbers etc., to the bsDatepicker
         */
        this._dateOptions = new BsDatepickerConfig();
        this.datePipe = this.inj.get(ToDatePipe);
    }
    /**
     * returns true if the input value is default (i.e open date picker on input click)
     * @param1 dropdownvalue, user selected value (by default datepicker opens on input click)
     * **/
    isDropDownDisplayEnabledOnInput(dropdownvalue) {
        return dropdownvalue === DATEPICKER_DROPDOWN_OPTIONS.DEFAULT;
    }
    /**
     * This method is used to show validation message depending on the isNativePicker flag.
     */
    showValidation($event, displayValue, isNativePicker, msg) {
        if (isNativePicker) {
            alert(msg);
            return $($event.target).val(displayValue);
        }
    }
    resetDisplayInput() {
        $(this.nativeElement).find('.display-input').val('');
    }
    validate() {
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
    }
    /**
     * This method is used to validate date pattern and time pattern
     * If user selects one pattern in design time and if he tries to enter the date in another pattern then the device is throwing an error
     */
    formatValidation(newVal, inputVal, isNativePicker) {
        const pattern = this.datepattern || this.timepattern;
        const formattedDate = getFormattedDate(this.datePipe, newVal, pattern);
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
    }
    /**
     * This method is used to validate min date, max date, exclude dates and exclude days
     * In mobile if invalid dates are entered, device is showing an alert.
     * In web if invalid dates are entered, device is showing validation message.
     */
    minDateMaxDateValidationOnInput(newVal, $event, displayValue, isNativePicker) {
        if (newVal) {
            newVal = moment(newVal).startOf('day').toDate();
            const minDate = moment(getDateObj(this.mindate)).startOf('day').toDate();
            const maxDate = moment(getDateObj(this.maxdate)).startOf('day').toDate();
            if (this.mindate && newVal < minDate) {
                const msg = `${this.appLocale.LABEL_MINDATE_VALIDATION_MESSAGE} ${this.mindate}.`;
                this.dateNotInRange = true;
                this.invokeOnChange(this.datavalue, undefined, false);
                return this.showValidation($event, displayValue, isNativePicker, msg);
            }
            if (this.maxdate && newVal > maxDate) {
                const msg = `${this.appLocale.LABEL_MAXDATE_VALIDATION_MESSAGE} ${this.maxdate}.`;
                this.dateNotInRange = true;
                this.invokeOnChange(this.datavalue, undefined, false);
                return this.showValidation($event, displayValue, isNativePicker, msg);
            }
            if (this.excludedates) {
                let excludeDatesArray;
                if (isString(this.excludedates)) {
                    excludeDatesArray = _.split(this.excludedates, ',');
                }
                else {
                    excludeDatesArray = this.excludedates;
                }
                excludeDatesArray = excludeDatesArray.map(d => getFormattedDate(this.datePipe, d, this.datepattern));
                if (excludeDatesArray.indexOf(getFormattedDate(this.datePipe, newVal, this.datepattern)) > -1) {
                    this.dateNotInRange = true;
                    this.invokeOnChange(this.datavalue, undefined, false);
                    return;
                }
            }
            if (this.excludedays) {
                const excludeDaysArray = _.split(this.excludedays, ',');
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
    }
    /**
     * This method is used to highlight the current date
     */
    hightlightToday() {
        const toDay = new Date().getDate().toString();
        _.filter($(`span:contains(${toDay})`).not('.is-other-month'), (obj) => {
            if ($(obj).text() === toDay) {
                $(obj).addClass('current-date text-info');
            }
        });
    }
    /**
     * This method is used to find the new date is from another year or not
     * @param newDate - newly selected date value
     */
    isOtheryear(newDate) {
        return (newDate.getMonth() === 0 && this.activeDate.getMonth() === 11) || (newDate.getMonth() === 11 && this.activeDate.getMonth() === 0);
    }
    /**
     * This method is used to set focus for active day
     * @param newDate - newly selected date value
     * @param isMouseEvent - boolean value represents the event is mouse event/ keyboard event
     */
    setActiveDateFocus(newDate, isMouseEvent) {
        const activeMonth = this.activeDate.getMonth();
        // check for keyboard event
        if (!isMouseEvent) {
            if (newDate.getMonth() < activeMonth) {
                this.isOtheryear(newDate) ? this.goToOtherMonthOryear('next', 'days') : this.goToOtherMonthOryear('previous', 'days');
            }
            else if (newDate.getMonth() > activeMonth) {
                this.isOtheryear(newDate) ? this.goToOtherMonthOryear('previous', 'days') : this.goToOtherMonthOryear('next', 'days');
            }
        }
        setTimeout(() => {
            if (newDate.getMonth() === new Date().getMonth() && newDate.getFullYear() === new Date().getFullYear()) {
                this.hightlightToday();
            }
            const newDay = newDate.getDate().toString();
            _.filter($(`span:contains(${newDay})`).not('.is-other-month'), (obj) => {
                if ($(obj).text() === newDay) {
                    $(obj).focus();
                    this.activeDate = newDate;
                }
            });
        });
    }
    /**
     * This method is used to load other month days or other month or other year
     * @param btnClass - class(previous/next) of the button which we have to click
     * @param timePeriod - String value decides to load other month days or other month or other year
     */
    goToOtherMonthOryear(btnClass, timePeriod) {
        const $node = $(`.bs-datepicker-head .${btnClass}`);
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
    }
    /**
    * This method sets the mouse events to Datepicker popup. These events are required when we navigate date picker through mouse.
     */
    addDatepickerMouseEvents() {
        const datePikcerHead = $(`.bs-datepicker-head`);
        datePikcerHead.find(`.previous`).click((event) => {
            // check for original mouse click
            if (event.originalEvent) {
                this.setFocusForDate(-1);
            }
        });
        datePikcerHead.find(`.next`).click((event) => {
            // check for original mouse click
            if (event.originalEvent) {
                this.setFocusForDate(1);
            }
        });
        datePikcerHead.find(`.current`).click((event) => {
            // check for original mouse click
            if (event.originalEvent) {
                this.setFocusForCurrentMonthOryear();
            }
        });
        $('.bs-datepicker-body').click((event) => {
            event.stopPropagation();
            // check for original mouse click
            if (event.originalEvent) {
                this.setFocusForMonthOrDay();
            }
        });
    }
    /**
     * This method sets focus for months/days depending on the loaded datepicker table
     */
    setFocusForMonthOrDay() {
        const activeMonthOrYear = $(`.bs-datepicker-head .current`).first().text();
        const datePickerBody = $('.bs-datepicker-body');
        if (datePickerBody.find('table.months').length > 0) {
            if (_.parseInt(activeMonthOrYear) !== this.activeDate.getFullYear()) {
                this.loadMonths();
            }
            const newDate = new Date(_.parseInt(activeMonthOrYear), this.activeDate.getMonth(), this.activeDate.getDate());
            this.setActiveMonthFocus(newDate, true);
        }
        else if (datePickerBody.find('table.days').length > 0) {
            const newMonth = months.indexOf(activeMonthOrYear);
            if (newMonth !== this.activeDate.getMonth()) {
                this.loadDays();
            }
            const newDate = new Date(this.activeDate.getFullYear(), newMonth, 1);
            this.setActiveDateFocus(newDate, true);
        }
    }
    /**
     * This method sets focus for months/years depending on the loaded datepicker table
     */
    setFocusForCurrentMonthOryear() {
        const datePickerBody = $('.bs-datepicker-body');
        if (datePickerBody.find('table.months').length > 0) {
            this.loadMonths();
            this.setActiveMonthFocus(this.activeDate, true);
        }
        else if (datePickerBody.find('table.years').length > 0) {
            this.loadYears();
            this.setActiveYearFocus(this.activeDate, true);
        }
    }
    /**
     * This method sets focus for months/years/days depending on the loaded datepicker table
     */
    setFocusForDate(count) {
        const datePickerBody = $('.bs-datepicker-body');
        if (datePickerBody.find('table.months').length > 0) {
            this.loadMonths();
            const newDate = new Date(this.activeDate.getFullYear() + count, 0, this.activeDate.getDate());
            this.setActiveMonthFocus(newDate, true);
        }
        else if (datePickerBody.find('table.years').length > 0) {
            this.loadYears();
            const startYear = datePickerBody.find('table.years span').first().text();
            const newDate = new Date(_.parseInt(startYear), this.activeDate.getMonth(), this.activeDate.getDate());
            this.setActiveYearFocus(newDate, true);
        }
        else if (datePickerBody.find('table.days').length > 0) {
            this.loadDays();
            const newDate = new Date(this.activeDate.getFullYear(), this.activeDate.getMonth() + count, 1);
            this.setActiveDateFocus(newDate, true);
        }
    }
    /**
     * This method is used to add keyboard events while opening the date picker
     * @param scope - scope of the date/datetime widget
     * @param isDateTime - boolean value represents the loaded widget is date or datetime
     */
    addDatepickerKeyboardEvents(scope, isDateTime) {
        this.keyEventPluginInstance = scope.keyEventPlugin.constructor;
        this.elementScope = scope;
        const dateContainer = document.querySelector(`.${scope.dateContainerCls}`);
        setAttr(dateContainer, 'tabindex', '0');
        dateContainer.onkeydown = (event) => {
            const action = this.keyEventPluginInstance.getEventFullKey(event);
            // Check for Shift+Tab key or Tab key or escape
            if (action === 'shift.tab' || action === 'escape' || (action === 'tab' && !isDateTime)) {
                this.elementScope.hideDatepickerDropdown();
                const displayInputElem = this.elementScope.nativeElement.querySelector('.display-input');
                setTimeout(() => displayInputElem.focus());
            }
            if (action === 'tab' && isDateTime) {
                this.bsDatePickerDirective.hide();
                this.elementScope.toggleTimePicker(true);
            }
        };
        this.loadDays();
        this.setActiveDateFocus(this.activeDate);
    }
    /**
     * This method is used to add tabindex, keybord and mouse events for days
     */
    loadDays() {
        setTimeout(() => {
            $('.bs-datepicker-body').attr('tabindex', '0');
            $('[bsdatepickerdaydecorator]').not('.is-other-month').attr('tabindex', '0');
            this.addKeyBoardEventsForDays();
            this.addDatepickerMouseEvents();
        });
    }
    /**
     * This method sets keyboard events for days
     */
    addKeyBoardEventsForDays() {
        const datePickerBody = $('.bs-datepicker-body');
        if (datePickerBody.length > 0) {
            datePickerBody[0].addEventListener('mouseenter', (event) => {
                event.stopPropagation();
            }, true);
        }
        datePickerBody.keydown((event) => {
            const action = this.keyEventPluginInstance.getEventFullKey(event);
            let newdate;
            if (action === 'arrowdown') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(+7, 'days').toDate();
                this.setActiveDateFocus(newdate);
            }
            else if (action === 'arrowup') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(-7, 'days').toDate();
                this.setActiveDateFocus(newdate);
            }
            else if (action === 'arrowleft') {
                newdate = moment(this.activeDate).add(-1, 'days').toDate();
                this.setActiveDateFocus(newdate);
            }
            else if (action === 'arrowright') {
                newdate = moment(this.activeDate).add(+1, 'days').toDate();
                this.setActiveDateFocus(newdate);
            }
            else if (action === 'control.arrowup') {
                // clicking on table header month name to load list of months
                $('.bs-datepicker-head .current').first().click();
                this.loadMonths();
                this.setActiveMonthFocus(this.activeDate);
            }
            else if (action === 'enter') {
                if ($(document.activeElement).hasClass('disabled')) {
                    return;
                }
                $(document.activeElement).click();
                this.elementScope.hideDatepickerDropdown();
                const displayInputElem = this.elementScope.nativeElement.querySelector('.display-input');
                setTimeout(() => displayInputElem.focus());
            }
        });
    }
    /**
     * This method is used to add tabindex, keybord and mouse events for months
     */
    loadMonths() {
        setTimeout(() => {
            const datePickerBody = $('.bs-datepicker-body');
            datePickerBody.attr('tabindex', '0');
            datePickerBody.find('table.months span').attr('tabindex', '0');
            this.addKeyBoardEventsForMonths();
            this.addDatepickerMouseEvents();
        });
    }
    /**
     * This method sets keyboard events for months
     */
    addKeyBoardEventsForMonths() {
        $('.bs-datepicker-body').keydown((event) => {
            const action = this.keyEventPluginInstance.getEventFullKey(event);
            let newdate;
            if (action === 'arrowdown') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(+3, 'month').toDate();
                this.setActiveMonthFocus(newdate);
            }
            else if (action === 'arrowup') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(-3, 'month').toDate();
                this.setActiveMonthFocus(newdate);
            }
            else if (action === 'arrowleft') {
                newdate = moment(this.activeDate).add(-1, 'month').toDate();
                this.setActiveMonthFocus(newdate);
            }
            else if (action === 'arrowright') {
                newdate = moment(this.activeDate).add(+1, 'month').toDate();
                this.setActiveMonthFocus(newdate);
            }
            else if (action === 'control.arrowup') {
                // clicking on table header year to load list of years
                $('.bs-datepicker-head .current').first().click();
                this.loadYears();
                this.setActiveYearFocus(this.activeDate);
            }
            else if (action === 'control.arrowdown' || action === 'enter') {
                if ($(document.activeElement).parent().hasClass('disabled')) {
                    return;
                }
                $(document.activeElement).click();
                this.loadDays();
                const newDate = new Date(this.activeDate.getFullYear(), this.activeDate.getMonth(), 1);
                this.setActiveDateFocus(newDate);
            }
        });
    }
    /**
     * This method is used to add tabindex, keybord and mouse events for years
     */
    loadYears() {
        setTimeout(() => {
            const datePickerBody = $('.bs-datepicker-body');
            datePickerBody.attr('tabindex', '0');
            datePickerBody.find('table.years span').attr('tabindex', '0');
            this.addKeyBoardEventsForYears();
            this.addDatepickerMouseEvents();
        });
    }
    /**
     * This method is used to set focus for active month
     */
    setActiveMonthFocus(newDate, isMoouseEvent) {
        const newMonth = months[newDate.getMonth()];
        // check for keyboard event
        if (!isMoouseEvent) {
            if (newDate.getFullYear() < this.activeDate.getFullYear()) {
                this.goToOtherMonthOryear('previous', 'month');
            }
            else if (newDate.getFullYear() > this.activeDate.getFullYear()) {
                this.goToOtherMonthOryear('next', 'month');
            }
        }
        setTimeout(() => {
            $(`.bs-datepicker-body table.months span:contains(${newMonth})`).focus();
            this.activeDate = newDate;
        });
    }
    /**
     * This method sets keyboard events for years
     */
    addKeyBoardEventsForYears() {
        $('.bs-datepicker-body').keydown((event) => {
            const action = this.keyEventPluginInstance.getEventFullKey(event);
            let newdate;
            if (action === 'arrowdown') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(+4, 'year').toDate();
                this.setActiveYearFocus(newdate);
            }
            else if (action === 'arrowup') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(-4, 'year').toDate();
                this.setActiveYearFocus(newdate);
            }
            else if (action === 'arrowleft') {
                newdate = moment(this.activeDate).add(-1, 'year').toDate();
                this.setActiveYearFocus(newdate);
            }
            else if (action === 'arrowright') {
                newdate = moment(this.activeDate).add(+1, 'year').toDate();
                this.setActiveYearFocus(newdate);
            }
            else if (action === 'control.arrowdown' || action === 'enter') {
                if ($(document.activeElement).parent().hasClass('disabled')) {
                    return;
                }
                $(document.activeElement).click();
                this.loadMonths();
                this.setActiveMonthFocus(this.activeDate);
            }
        });
    }
    /**
     * This method is used to set focus for active year
     */
    setActiveYearFocus(newDate, isMouseEvent) {
        const newYear = newDate.getFullYear();
        const datePickerYears = $('.bs-datepicker-body table.years span');
        const startYear = datePickerYears.first().text();
        const endYear = datePickerYears.last().text();
        // check for keyboard event
        if (!isMouseEvent) {
            if (newDate.getFullYear() < _.parseInt(startYear)) {
                this.goToOtherMonthOryear('previous', 'year');
            }
            else if (newDate.getFullYear() > _.parseInt(endYear)) {
                this.goToOtherMonthOryear('next', 'year');
            }
        }
        setTimeout(() => {
            $(`.bs-datepicker-body table.years span:contains(${newYear})`).focus();
            this.activeDate = newDate;
        });
    }
    /**
     * This method sets focus for timepicker first input field(hours field) while opening time picker
     * @param scope - scope of the time picker widget
     */
    focusTimePickerPopover(scope) {
        this.keyEventPluginInstance = scope.keyEventPlugin.constructor;
        this.elementScope = scope;
        // setTimeout is used so that by then time input has the updated value. focus is setting back to the input field
        this.elementScope.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                $('timepicker .form-group:first > input.form-control').focus();
            });
        });
    }
    /**
     * This function sets the keyboard events to Timepicker popup
     */
    bindTimePickerKeyboardEvents() {
        setTimeout(() => {
            const $timepickerPopup = $('body').find('> bs-dropdown-container timepicker');
            $timepickerPopup.attr('tabindex', 0);
            this.addEventsOnTimePicker($timepickerPopup);
        });
    }
    /**
     * This function checks whether the given date is valid or not
     * @returns boolean value, true if date is valid else returns false
     */
    isValidDate(date) {
        return date && date instanceof Date && !isNaN(date.getTime());
    }
    /**
     * This function checks whether the given time is valid or not
     */
    timeFormatValidation() {
        const enteredDate = $(this.nativeElement).find('input').val();
        const newVal = getNativeDateObject(enteredDate);
        if (!this.formatValidation(newVal, enteredDate)) {
            return;
        }
        this.invalidDateTimeFormat = false;
        this.invokeOnChange(this.datavalue, undefined, false);
    }
    /**
     * This function sets the events to given element
     * @param $el - element on which the event is added
     */
    addEventsOnTimePicker($el) {
        $el.on('keydown', evt => {
            const $target = $(evt.target);
            const $parent = $target.parent();
            const elementScope = this.elementScope;
            const action = this.keyEventPluginInstance.getEventFullKey(evt);
            let stopPropogation, preventDefault;
            if (action === 'escape') {
                elementScope.hideTimepickerDropdown();
            }
            if ($target.hasClass('bs-timepicker-field')) {
                if ($parent.is(':first-child')) {
                    if (action === 'shift.tab' || action === 'enter' || action === 'escape') {
                        elementScope.setIsTimeOpen(false);
                        this.focus();
                        stopPropogation = true;
                        preventDefault = true;
                    }
                }
                else if ($parent.is(':last-child') || ($parent.next().next().find('button.disabled').length)) {
                    if (action === 'tab' || action === 'escape' || action === 'enter') {
                        elementScope.setIsTimeOpen(false);
                        this.focus();
                        stopPropogation = true;
                        preventDefault = true;
                    }
                }
                else {
                    if (action === 'enter' || action === 'escape') {
                        elementScope.setIsTimeOpen(false);
                        this.focus();
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
                if (elementScope.mintime && elementScope.maxtime && !this.isValidDate(elementScope.bsTimeValue)) {
                    if (action === 'arrowdown') {
                        elementScope.bsTimeValue = elementScope.maxTime;
                    }
                    else if (action === 'arrowup') {
                        elementScope.bsTimeValue = elementScope.minTime;
                    }
                }
                if (action === 'tab') {
                    this.invalidDateTimeFormat = false;
                    this.invokeOnChange(this.datavalue, undefined, false);
                    const pattern = this.datepattern || this.timepattern;
                    if (getFormattedDate(elementScope.datePipe, elementScope.bsTimeValue, pattern) === elementScope.displayValue) {
                        $(this.nativeElement).find('.display-input').val(elementScope.displayValue);
                    }
                }
                if (action === 'arrowdown' || action === 'arrowup') {
                    this.timeFormatValidation();
                }
            }
            else if ($target.hasClass('btn-default')) {
                if (action === 'tab' || action === 'escape') {
                    elementScope.setIsTimeOpen(false);
                    this.focus();
                }
            }
        });
        $el.find('a').on('click', evt => {
            const elementScope = this.elementScope;
            const $target = $(evt.target);
            if (elementScope.mintime && elementScope.maxtime && !this.isValidDate(elementScope.bsTimeValue)) {
                if ($target.find('span').hasClass('bs-chevron-down')) {
                    elementScope.bsTimeValue = elementScope.maxTime;
                }
                else if ($target.find('span').hasClass('bs-chevron-up')) {
                    elementScope.bsTimeValue = elementScope.minTime;
                }
            }
            this.timeFormatValidation();
        });
    }
    updateFormat(pattern) {
        if (pattern === 'datepattern') {
            this._dateOptions.dateInputFormat = this.datepattern;
            this.showseconds = _.includes(this.datepattern, 's');
            this.ismeridian = _.includes(this.datepattern, 'h');
        }
        else if (pattern === 'timepattern') {
            this.showseconds = _.includes(this.timepattern, 's');
            this.ismeridian = _.includes(this.timepattern, 'h');
        }
    }
    onPropertyChange(key, nv, ov) {
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
            super.onPropertyChange(key, nv, ov);
        }
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.bsDatePickerDirective) {
            this.dateOnShowSubscription = this.bsDatePickerDirective
                .onShown
                .subscribe(cal => {
                cal.daysCalendar.subscribe(data => {
                    let excludedDates;
                    if (this.excludedates) {
                        if (isString(this.excludedates)) {
                            excludedDates = _.split(this.excludedates, ',');
                        }
                        else {
                            excludedDates = this.excludedates;
                        }
                        excludedDates = excludedDates.map(d => moment(d));
                    }
                    data[0].weeks.forEach(week => {
                        week.days.forEach(day => {
                            if (!day.isDisabled && this.excludedays) {
                                day.isDisabled = _.includes(this.excludedays, day.dayIndex);
                            }
                            if (!day.isDisabled && excludedDates) {
                                const md = moment(day.date);
                                day.isDisabled = excludedDates.some(ed => md.isSame(ed, 'day'));
                            }
                        });
                    });
                });
            });
        }
    }
    ngOnDestroy() {
        if (this.dateOnShowSubscription) {
            this.dateOnShowSubscription.unsubscribe();
        }
        super.ngOnDestroy();
    }
}
BaseDateTimeComponent.propDecorators = {
    bsDropdown: [{ type: ViewChild, args: [BsDropdownDirective,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1kYXRlLXRpbWUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9iYXNlL2Jhc2UtZGF0ZS10aW1lLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQXNDLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUc5RSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFcEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRWhHLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxrQkFBa0IsRUFBeUIsTUFBTSxlQUFlLENBQUM7QUFDMUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBSXpELE1BQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQztBQUNwQyxNQUFNLE1BQU0sR0FBRyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDMUksTUFBTSwyQkFBMkIsR0FBRztJQUNoQyxNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsU0FBUztDQUNyQixDQUFDO0FBRUYsTUFBTSxPQUFnQixxQkFBc0IsU0FBUSx1QkFBdUI7SUE4QnZFLFlBQVksR0FBYSxFQUFFLGFBQWE7UUFDcEMsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQXpCdkIsa0JBQWEsR0FBRyxJQUFJLENBQUM7UUFnQjVCOztXQUVHO1FBQ08saUJBQVksR0FBdUIsSUFBSSxrQkFB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QUcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzs2QkFDL0Q7NEJBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksYUFBYSxFQUFFO2dDQUNsQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2dDQUM1QixHQUFHLENBQUMsVUFBVSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDOzZCQUNuRTt3QkFDTCxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1NBQ1Y7SUFFTCxDQUFDO0lBRUQsV0FBVztRQUNQLElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFO1lBQzdCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUM3QztRQUVELEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN4QixDQUFDOzs7eUJBcHRCQSxTQUFTLFNBQUMsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgSW5qZWN0b3IsIE9uRGVzdHJveSwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBWYWxpZGF0b3IgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IEJzRHJvcGRvd25EaXJlY3RpdmUgfSBmcm9tICduZ3gtYm9vdHN0cmFwJztcblxuaW1wb3J0IHsgZ2V0RGF0ZU9iaiwgZ2V0Rm9ybWF0dGVkRGF0ZSwgZ2V0TmF0aXZlRGF0ZU9iamVjdCwgaXNTdHJpbmcsIHNldEF0dHIgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEJhc2VGb3JtQ3VzdG9tQ29tcG9uZW50IH0gZnJvbSAnLi9iYXNlLWZvcm0tY3VzdG9tLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBCc0RhdGVwaWNrZXJDb25maWcsIEJzRGF0ZXBpY2tlckRpcmVjdGl2ZSB9IGZyb20gJ25neC1ib290c3RyYXAnO1xuaW1wb3J0IHsgVG9EYXRlUGlwZSB9IGZyb20gJy4uLy4uLy4uL3BpcGVzL2N1c3RvbS1waXBlcyc7XG5cbmRlY2xhcmUgY29uc3QgbW9tZW50LCBfLCAkO1xuXG5jb25zdCBDVVJSRU5UX0RBVEUgPSAnQ1VSUkVOVF9EQVRFJztcbmNvbnN0IG1vbnRocyA9IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddO1xuY29uc3QgREFURVBJQ0tFUl9EUk9QRE9XTl9PUFRJT05TID0ge1xuICAgIEJVVFRPTjogJ2J1dHRvbicsXG4gICAgREVGQVVMVDogJ2RlZmF1bHQnXG59O1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZURhdGVUaW1lQ29tcG9uZW50IGV4dGVuZHMgQmFzZUZvcm1DdXN0b21Db21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3ksIFZhbGlkYXRvciB7XG4gICAgcHVibGljIGV4Y2x1ZGVkYXlzOiBzdHJpbmc7XG4gICAgcHVibGljIGV4Y2x1ZGVkYXRlcztcbiAgICBwdWJsaWMgb3V0cHV0Zm9ybWF0O1xuICAgIHB1YmxpYyBtaW5kYXRlO1xuICAgIHB1YmxpYyBtYXhkYXRlO1xuICAgIHB1YmxpYyB1c2VEYXRhcGlja2VyID0gdHJ1ZTtcbiAgICBwcm90ZWN0ZWQgYWN0aXZlRGF0ZTtcbiAgICBwcml2YXRlIGtleUV2ZW50UGx1Z2luSW5zdGFuY2U7XG4gICAgcHJpdmF0ZSBlbGVtZW50U2NvcGU7XG4gICAgcHVibGljIGRhdGVwYXR0ZXJuOiBzdHJpbmc7XG4gICAgcHVibGljIHRpbWVwYXR0ZXJuOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIHNob3dzZWNvbmRzOiBib29sZWFuO1xuICAgIHByb3RlY3RlZCBpc21lcmlkaWFuOiBib29sZWFuO1xuICAgIHByb3RlY3RlZCBkYXRlUGlwZTtcblxuICAgIHByb3RlY3RlZCBkYXRlTm90SW5SYW5nZTogYm9vbGVhbjtcbiAgICBwcm90ZWN0ZWQgdGltZU5vdEluUmFuZ2U6IGJvb2xlYW47XG4gICAgcHJvdGVjdGVkIGludmFsaWREYXRlVGltZUZvcm1hdDogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgZGF0ZU9uU2hvd1N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBpcyBhbiBpbnRlcm5hbCBwcm9wZXJ0eSB1c2VkIHRvIG1hcCB0aGUgY29udGFpbmVyQ2xhc3MsIHNob3dXZWVrTnVtYmVycyBldGMuLCB0byB0aGUgYnNEYXRlcGlja2VyXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kYXRlT3B0aW9uczogQnNEYXRlcGlja2VyQ29uZmlnID0gbmV3IEJzRGF0ZXBpY2tlckNvbmZpZygpO1xuICAgIHByb3RlY3RlZCBic0RhdGVQaWNrZXJEaXJlY3RpdmU6IEJzRGF0ZXBpY2tlckRpcmVjdGl2ZTtcblxuICAgIEBWaWV3Q2hpbGQoQnNEcm9wZG93bkRpcmVjdGl2ZSkgcHJvdGVjdGVkIGJzRHJvcGRvd247XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yLCBXSURHRVRfQ09ORklHKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHRoaXMuZGF0ZVBpcGUgPSB0aGlzLmluai5nZXQoVG9EYXRlUGlwZSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIHRydWUgaWYgdGhlIGlucHV0IHZhbHVlIGlzIGRlZmF1bHQgKGkuZSBvcGVuIGRhdGUgcGlja2VyIG9uIGlucHV0IGNsaWNrKVxuICAgICAqIEBwYXJhbTEgZHJvcGRvd252YWx1ZSwgdXNlciBzZWxlY3RlZCB2YWx1ZSAoYnkgZGVmYXVsdCBkYXRlcGlja2VyIG9wZW5zIG9uIGlucHV0IGNsaWNrKVxuICAgICAqICoqL1xuICAgIHByb3RlY3RlZCBpc0Ryb3BEb3duRGlzcGxheUVuYWJsZWRPbklucHV0KGRyb3Bkb3dudmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGRyb3Bkb3dudmFsdWUgPT09IERBVEVQSUNLRVJfRFJPUERPV05fT1BUSU9OUy5ERUZBVUxUO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gc2hvdyB2YWxpZGF0aW9uIG1lc3NhZ2UgZGVwZW5kaW5nIG9uIHRoZSBpc05hdGl2ZVBpY2tlciBmbGFnLlxuICAgICAqL1xuICAgIHByaXZhdGUgc2hvd1ZhbGlkYXRpb24oJGV2ZW50LCBkaXNwbGF5VmFsdWUsIGlzTmF0aXZlUGlja2VyLCBtc2cpIHtcbiAgICAgICAgaWYgKGlzTmF0aXZlUGlja2VyKSB7XG4gICAgICAgICAgICBhbGVydChtc2cpO1xuICAgICAgICAgICAgcmV0dXJuICQoJGV2ZW50LnRhcmdldCkudmFsKGRpc3BsYXlWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldERpc3BsYXlJbnB1dCgpIHtcbiAgICAgICAgJCh0aGlzLm5hdGl2ZUVsZW1lbnQpLmZpbmQoJy5kaXNwbGF5LWlucHV0JykudmFsKCcnKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdmFsaWRhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmludmFsaWREYXRlVGltZUZvcm1hdCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpbnZhbGlkRGF0ZVRpbWVGb3JtYXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQodGhpcy5kYXRlTm90SW5SYW5nZSkgJiYgdGhpcy5kYXRlTm90SW5SYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRlTm90SW5SYW5nZToge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZDogZmFsc2VcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQodGhpcy50aW1lTm90SW5SYW5nZSkgJiYgdGhpcy50aW1lTm90SW5SYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0aW1lTm90SW5SYW5nZToge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZDogZmFsc2VcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIHZhbGlkYXRlIGRhdGUgcGF0dGVybiBhbmQgdGltZSBwYXR0ZXJuXG4gICAgICogSWYgdXNlciBzZWxlY3RzIG9uZSBwYXR0ZXJuIGluIGRlc2lnbiB0aW1lIGFuZCBpZiBoZSB0cmllcyB0byBlbnRlciB0aGUgZGF0ZSBpbiBhbm90aGVyIHBhdHRlcm4gdGhlbiB0aGUgZGV2aWNlIGlzIHRocm93aW5nIGFuIGVycm9yXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGZvcm1hdFZhbGlkYXRpb24obmV3VmFsLCBpbnB1dFZhbCwgaXNOYXRpdmVQaWNrZXI/OiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IHBhdHRlcm4gPSB0aGlzLmRhdGVwYXR0ZXJuIHx8IHRoaXMudGltZXBhdHRlcm47XG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZERhdGUgPSBnZXRGb3JtYXR0ZWREYXRlKHRoaXMuZGF0ZVBpcGUsIG5ld1ZhbCwgcGF0dGVybik7XG4gICAgICAgIGlucHV0VmFsID0gaW5wdXRWYWwudHJpbSgpO1xuICAgICAgICBpZiAoaW5wdXRWYWwpIHtcbiAgICAgICAgICAgIGlmIChwYXR0ZXJuID09PSAndGltZXN0YW1wJykge1xuICAgICAgICAgICAgICAgIGlmICghXy5pc05hTihpbnB1dFZhbCkgJiYgXy5wYXJzZUludChpbnB1dFZhbCkgIT09IGZvcm1hdHRlZERhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZhbGlkRGF0ZVRpbWVGb3JtYXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmF0aXZlUGlja2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGZvcm1hdCB0aGUgZGF0ZSB2YWx1ZSBvbmx5IHdoZW4gaW5wdXRWYWwgaXMgb2J0YWluZWQgZnJvbSAkZXZlbnQudGFyZ2V0LnZhbHVlLCBhcyB0aGUgZm9ybWF0IGRvZXNudCBtYXRjaC5cbiAgICAgICAgICAgICAgICAgICAgaW5wdXRWYWwgPSBnZXRGb3JtYXR0ZWREYXRlKHRoaXMuZGF0ZVBpcGUsIGlucHV0VmFsLCBwYXR0ZXJuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0VmFsICE9PSBmb3JtYXR0ZWREYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZERhdGVUaW1lRm9ybWF0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIHZhbGlkYXRlIG1pbiBkYXRlLCBtYXggZGF0ZSwgZXhjbHVkZSBkYXRlcyBhbmQgZXhjbHVkZSBkYXlzXG4gICAgICogSW4gbW9iaWxlIGlmIGludmFsaWQgZGF0ZXMgYXJlIGVudGVyZWQsIGRldmljZSBpcyBzaG93aW5nIGFuIGFsZXJ0LlxuICAgICAqIEluIHdlYiBpZiBpbnZhbGlkIGRhdGVzIGFyZSBlbnRlcmVkLCBkZXZpY2UgaXMgc2hvd2luZyB2YWxpZGF0aW9uIG1lc3NhZ2UuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIG1pbkRhdGVNYXhEYXRlVmFsaWRhdGlvbk9uSW5wdXQobmV3VmFsLCAkZXZlbnQ/OiBFdmVudCwgZGlzcGxheVZhbHVlPzogc3RyaW5nLCBpc05hdGl2ZVBpY2tlcj86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKG5ld1ZhbCkge1xuICAgICAgICAgICAgbmV3VmFsID0gbW9tZW50KG5ld1ZhbCkuc3RhcnRPZignZGF5JykudG9EYXRlKCk7XG4gICAgICAgICAgICBjb25zdCBtaW5EYXRlID0gbW9tZW50KGdldERhdGVPYmoodGhpcy5taW5kYXRlKSkuc3RhcnRPZignZGF5JykudG9EYXRlKCk7XG4gICAgICAgICAgICBjb25zdCBtYXhEYXRlID0gIG1vbWVudChnZXREYXRlT2JqKHRoaXMubWF4ZGF0ZSkpLnN0YXJ0T2YoJ2RheScpLnRvRGF0ZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMubWluZGF0ZSAmJiBuZXdWYWwgPCBtaW5EYXRlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gYCR7dGhpcy5hcHBMb2NhbGUuTEFCRUxfTUlOREFURV9WQUxJREFUSU9OX01FU1NBR0V9ICR7dGhpcy5taW5kYXRlfS5gO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZU5vdEluUmFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsIHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNob3dWYWxpZGF0aW9uKCRldmVudCwgZGlzcGxheVZhbHVlLCBpc05hdGl2ZVBpY2tlciwgbXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1heGRhdGUgJiYgbmV3VmFsID4gbWF4RGF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IGAke3RoaXMuYXBwTG9jYWxlLkxBQkVMX01BWERBVEVfVkFMSURBVElPTl9NRVNTQUdFfSAke3RoaXMubWF4ZGF0ZX0uYDtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGVOb3RJblJhbmdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaG93VmFsaWRhdGlvbigkZXZlbnQsIGRpc3BsYXlWYWx1ZSwgaXNOYXRpdmVQaWNrZXIsIG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5leGNsdWRlZGF0ZXMpIHtcbiAgICAgICAgICAgICAgICBsZXQgZXhjbHVkZURhdGVzQXJyYXk7XG4gICAgICAgICAgICAgICAgaWYgKGlzU3RyaW5nKHRoaXMuZXhjbHVkZWRhdGVzKSkge1xuICAgICAgICAgICAgICAgICAgICBleGNsdWRlRGF0ZXNBcnJheSA9IF8uc3BsaXQodGhpcy5leGNsdWRlZGF0ZXMsICcsJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXhjbHVkZURhdGVzQXJyYXkgPSB0aGlzLmV4Y2x1ZGVkYXRlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZXhjbHVkZURhdGVzQXJyYXkgPSBleGNsdWRlRGF0ZXNBcnJheS5tYXAoZCA9PiBnZXRGb3JtYXR0ZWREYXRlKHRoaXMuZGF0ZVBpcGUsIGQsIHRoaXMuZGF0ZXBhdHRlcm4pKTtcbiAgICAgICAgICAgICAgICBpZiAoZXhjbHVkZURhdGVzQXJyYXkuaW5kZXhPZihnZXRGb3JtYXR0ZWREYXRlKHRoaXMuZGF0ZVBpcGUsIG5ld1ZhbCwgdGhpcy5kYXRlcGF0dGVybikpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlTm90SW5SYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsIHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuZXhjbHVkZWRheXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBleGNsdWRlRGF5c0FycmF5ID0gIF8uc3BsaXQodGhpcy5leGNsdWRlZGF5cywgJywnKTtcbiAgICAgICAgICAgICAgICBpZiAoZXhjbHVkZURheXNBcnJheS5pbmRleE9mKG5ld1ZhbC5nZXREYXkoKS50b1N0cmluZygpKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZU5vdEluUmFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNOYXRpdmVQaWNrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0ZU5vdEluUmFuZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsIHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBoaWdobGlnaHQgdGhlIGN1cnJlbnQgZGF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoaWdodGxpZ2h0VG9kYXkoKSB7XG4gICAgICAgIGNvbnN0IHRvRGF5ID0gbmV3IERhdGUoKS5nZXREYXRlKCkudG9TdHJpbmcoKTtcbiAgICAgICAgXy5maWx0ZXIoJChgc3Bhbjpjb250YWlucygke3RvRGF5fSlgKS5ub3QoJy5pcy1vdGhlci1tb250aCcpLCAob2JqKSA9PiB7XG4gICAgICAgICAgICBpZiAoJChvYmopLnRleHQoKSA9PT0gdG9EYXkpIHtcbiAgICAgICAgICAgICAgICAkKG9iaikuYWRkQ2xhc3MoJ2N1cnJlbnQtZGF0ZSB0ZXh0LWluZm8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBmaW5kIHRoZSBuZXcgZGF0ZSBpcyBmcm9tIGFub3RoZXIgeWVhciBvciBub3RcbiAgICAgKiBAcGFyYW0gbmV3RGF0ZSAtIG5ld2x5IHNlbGVjdGVkIGRhdGUgdmFsdWVcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzT3RoZXJ5ZWFyKG5ld0RhdGUpIHtcbiAgICAgICAgcmV0dXJuIChuZXdEYXRlLmdldE1vbnRoKCkgPT09IDAgJiYgdGhpcy5hY3RpdmVEYXRlLmdldE1vbnRoKCkgPT09IDExKSB8fCAobmV3RGF0ZS5nZXRNb250aCgpID09PSAxMSAmJiB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKSA9PT0gMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBzZXQgZm9jdXMgZm9yIGFjdGl2ZSBkYXlcbiAgICAgKiBAcGFyYW0gbmV3RGF0ZSAtIG5ld2x5IHNlbGVjdGVkIGRhdGUgdmFsdWVcbiAgICAgKiBAcGFyYW0gaXNNb3VzZUV2ZW50IC0gYm9vbGVhbiB2YWx1ZSByZXByZXNlbnRzIHRoZSBldmVudCBpcyBtb3VzZSBldmVudC8ga2V5Ym9hcmQgZXZlbnRcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldEFjdGl2ZURhdGVGb2N1cyhuZXdEYXRlLCBpc01vdXNlRXZlbnQ/OiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZU1vbnRoID0gdGhpcy5hY3RpdmVEYXRlLmdldE1vbnRoKCk7XG4gICAgICAgIC8vIGNoZWNrIGZvciBrZXlib2FyZCBldmVudFxuICAgICAgICAgaWYgKCFpc01vdXNlRXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChuZXdEYXRlLmdldE1vbnRoKCkgPCBhY3RpdmVNb250aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNPdGhlcnllYXIobmV3RGF0ZSkgPyAgdGhpcy5nb1RvT3RoZXJNb250aE9yeWVhcignbmV4dCcsICdkYXlzJykgOiAgdGhpcy5nb1RvT3RoZXJNb250aE9yeWVhcigncHJldmlvdXMnLCAnZGF5cycpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdEYXRlLmdldE1vbnRoKCkgPiBhY3RpdmVNb250aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNPdGhlcnllYXIobmV3RGF0ZSkgPyB0aGlzLmdvVG9PdGhlck1vbnRoT3J5ZWFyKCdwcmV2aW91cycsICdkYXlzJykgOiB0aGlzLmdvVG9PdGhlck1vbnRoT3J5ZWFyKCduZXh0JywgJ2RheXMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICAgICAgaWYgKG5ld0RhdGUuZ2V0TW9udGgoKSA9PT0gbmV3IERhdGUoKS5nZXRNb250aCgpICYmIG5ld0RhdGUuZ2V0RnVsbFllYXIoKSA9PT0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0VG9kYXkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG5ld0RheSA9IG5ld0RhdGUuZ2V0RGF0ZSgpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBfLmZpbHRlcigkKGBzcGFuOmNvbnRhaW5zKCR7bmV3RGF5fSlgKS5ub3QoJy5pcy1vdGhlci1tb250aCcpLCAob2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCQob2JqKS50ZXh0KCkgPT09IG5ld0RheSkge1xuICAgICAgICAgICAgICAgICAgICAkKG9iaikuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gbmV3RGF0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIGxvYWQgb3RoZXIgbW9udGggZGF5cyBvciBvdGhlciBtb250aCBvciBvdGhlciB5ZWFyXG4gICAgICogQHBhcmFtIGJ0bkNsYXNzIC0gY2xhc3MocHJldmlvdXMvbmV4dCkgb2YgdGhlIGJ1dHRvbiB3aGljaCB3ZSBoYXZlIHRvIGNsaWNrXG4gICAgICogQHBhcmFtIHRpbWVQZXJpb2QgLSBTdHJpbmcgdmFsdWUgZGVjaWRlcyB0byBsb2FkIG90aGVyIG1vbnRoIGRheXMgb3Igb3RoZXIgbW9udGggb3Igb3RoZXIgeWVhclxuICAgICAqL1xuICAgIHByaXZhdGUgZ29Ub090aGVyTW9udGhPcnllYXIoYnRuQ2xhc3MsIHRpbWVQZXJpb2QpIHtcbiAgICAgICAgY29uc3QgJG5vZGUgPSAkKGAuYnMtZGF0ZXBpY2tlci1oZWFkIC4ke2J0bkNsYXNzfWApO1xuICAgICAgICBpZiAoJG5vZGUuYXR0cignZGlzYWJsZWQnKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICRub2RlLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgIGlmICh0aW1lUGVyaW9kID09PSAnZGF5cycpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZERheXMoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aW1lUGVyaW9kID09PSAnbW9udGgnKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRNb250aHMoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aW1lUGVyaW9kID09PSAneWVhcicpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZFllYXJzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAqIFRoaXMgbWV0aG9kIHNldHMgdGhlIG1vdXNlIGV2ZW50cyB0byBEYXRlcGlja2VyIHBvcHVwLiBUaGVzZSBldmVudHMgYXJlIHJlcXVpcmVkIHdoZW4gd2UgbmF2aWdhdGUgZGF0ZSBwaWNrZXIgdGhyb3VnaCBtb3VzZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGFkZERhdGVwaWNrZXJNb3VzZUV2ZW50cygpIHtcbiAgICAgICAgY29uc3QgZGF0ZVBpa2NlckhlYWQgPSAkKGAuYnMtZGF0ZXBpY2tlci1oZWFkYCk7XG4gICAgICAgIGRhdGVQaWtjZXJIZWFkLmZpbmQoYC5wcmV2aW91c2ApLmNsaWNrKChldmVudCkgPT4ge1xuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIG9yaWdpbmFsIG1vdXNlIGNsaWNrXG4gICAgICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0Rm9jdXNGb3JEYXRlKC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRhdGVQaWtjZXJIZWFkLmZpbmQoYC5uZXh0YCkuY2xpY2soKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAvLyBjaGVjayBmb3Igb3JpZ2luYWwgbW91c2UgY2xpY2tcbiAgICAgICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGb2N1c0ZvckRhdGUoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBkYXRlUGlrY2VySGVhZC5maW5kKGAuY3VycmVudGApLmNsaWNrKChldmVudCkgPT4ge1xuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIG9yaWdpbmFsIG1vdXNlIGNsaWNrXG4gICAgICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0Rm9jdXNGb3JDdXJyZW50TW9udGhPcnllYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgICQoJy5icy1kYXRlcGlja2VyLWJvZHknKS5jbGljaygoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIG9yaWdpbmFsIG1vdXNlIGNsaWNrXG4gICAgICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0Rm9jdXNGb3JNb250aE9yRGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHNldHMgZm9jdXMgZm9yIG1vbnRocy9kYXlzIGRlcGVuZGluZyBvbiB0aGUgbG9hZGVkIGRhdGVwaWNrZXIgdGFibGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldEZvY3VzRm9yTW9udGhPckRheSgpIHtcbiAgICAgICAgY29uc3QgYWN0aXZlTW9udGhPclllYXIgPSAkKGAuYnMtZGF0ZXBpY2tlci1oZWFkIC5jdXJyZW50YCkuZmlyc3QoKS50ZXh0KCk7XG4gICAgICAgIGNvbnN0IGRhdGVQaWNrZXJCb2R5ID0gJCgnLmJzLWRhdGVwaWNrZXItYm9keScpO1xuICAgICAgICBpZiAoZGF0ZVBpY2tlckJvZHkuZmluZCgndGFibGUubW9udGhzJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaWYgKF8ucGFyc2VJbnQoYWN0aXZlTW9udGhPclllYXIpICE9PSB0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZE1vbnRocygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbmV3RGF0ZSA9IG5ldyBEYXRlKF8ucGFyc2VJbnQoYWN0aXZlTW9udGhPclllYXIpLCB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKSwgdGhpcy5hY3RpdmVEYXRlLmdldERhdGUoKSk7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZU1vbnRoRm9jdXMobmV3RGF0ZSwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0ZVBpY2tlckJvZHkuZmluZCgndGFibGUuZGF5cycpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld01vbnRoID0gbW9udGhzLmluZGV4T2YoYWN0aXZlTW9udGhPclllYXIpO1xuICAgICAgICAgICAgaWYgKG5ld01vbnRoICE9PSB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZERheXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG5ld0RhdGUgPSBuZXcgRGF0ZSh0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSwgbmV3TW9udGgsIDEpO1xuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVEYXRlRm9jdXMobmV3RGF0ZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBzZXRzIGZvY3VzIGZvciBtb250aHMveWVhcnMgZGVwZW5kaW5nIG9uIHRoZSBsb2FkZWQgZGF0ZXBpY2tlciB0YWJsZVxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0Rm9jdXNGb3JDdXJyZW50TW9udGhPcnllYXIoKSB7XG4gICAgICAgIGNvbnN0IGRhdGVQaWNrZXJCb2R5ID0gJCgnLmJzLWRhdGVwaWNrZXItYm9keScpO1xuICAgICAgICBpZiAoZGF0ZVBpY2tlckJvZHkuZmluZCgndGFibGUubW9udGhzJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkTW9udGhzKCk7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZU1vbnRoRm9jdXModGhpcy5hY3RpdmVEYXRlLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRlUGlja2VyQm9keS5maW5kKCd0YWJsZS55ZWFycycpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMubG9hZFllYXJzKCk7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZVllYXJGb2N1cyh0aGlzLmFjdGl2ZURhdGUsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2Qgc2V0cyBmb2N1cyBmb3IgbW9udGhzL3llYXJzL2RheXMgZGVwZW5kaW5nIG9uIHRoZSBsb2FkZWQgZGF0ZXBpY2tlciB0YWJsZVxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0Rm9jdXNGb3JEYXRlKGNvdW50KSB7XG4gICAgICAgIGNvbnN0IGRhdGVQaWNrZXJCb2R5ID0gJCgnLmJzLWRhdGVwaWNrZXItYm9keScpO1xuICAgICAgICBpZiAoZGF0ZVBpY2tlckJvZHkuZmluZCgndGFibGUubW9udGhzJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkTW9udGhzKCk7XG4gICAgICAgICAgICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUodGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCkgKyBjb3VudCwgMCwgdGhpcy5hY3RpdmVEYXRlLmdldERhdGUoKSk7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZU1vbnRoRm9jdXMobmV3RGF0ZSwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0ZVBpY2tlckJvZHkuZmluZCgndGFibGUueWVhcnMnKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRZZWFycygpO1xuICAgICAgICAgICAgY29uc3Qgc3RhcnRZZWFyID0gZGF0ZVBpY2tlckJvZHkuZmluZCgndGFibGUueWVhcnMgc3BhbicpLmZpcnN0KCkudGV4dCgpO1xuICAgICAgICAgICAgY29uc3QgbmV3RGF0ZSA9IG5ldyBEYXRlKF8ucGFyc2VJbnQoc3RhcnRZZWFyKSwgdGhpcy5hY3RpdmVEYXRlLmdldE1vbnRoKCksIHRoaXMuYWN0aXZlRGF0ZS5nZXREYXRlKCkpO1xuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVZZWFyRm9jdXMobmV3RGF0ZSwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0ZVBpY2tlckJvZHkuZmluZCgndGFibGUuZGF5cycpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMubG9hZERheXMoKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0RhdGUgPSBuZXcgRGF0ZSh0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy5hY3RpdmVEYXRlLmdldE1vbnRoKCkgKyBjb3VudCwgMSk7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZURhdGVGb2N1cyhuZXdEYXRlLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gYWRkIGtleWJvYXJkIGV2ZW50cyB3aGlsZSBvcGVuaW5nIHRoZSBkYXRlIHBpY2tlclxuICAgICAqIEBwYXJhbSBzY29wZSAtIHNjb3BlIG9mIHRoZSBkYXRlL2RhdGV0aW1lIHdpZGdldFxuICAgICAqIEBwYXJhbSBpc0RhdGVUaW1lIC0gYm9vbGVhbiB2YWx1ZSByZXByZXNlbnRzIHRoZSBsb2FkZWQgd2lkZ2V0IGlzIGRhdGUgb3IgZGF0ZXRpbWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYWRkRGF0ZXBpY2tlcktleWJvYXJkRXZlbnRzKHNjb3BlLCBpc0RhdGVUaW1lKSB7XG4gICAgICAgIHRoaXMua2V5RXZlbnRQbHVnaW5JbnN0YW5jZSA9IHNjb3BlLmtleUV2ZW50UGx1Z2luLmNvbnN0cnVjdG9yO1xuICAgICAgICB0aGlzLmVsZW1lbnRTY29wZSA9IHNjb3BlO1xuICAgICAgICBjb25zdCBkYXRlQ29udGFpbmVyICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3Njb3BlLmRhdGVDb250YWluZXJDbHN9YCkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIHNldEF0dHIoZGF0ZUNvbnRhaW5lciwgJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgICAgZGF0ZUNvbnRhaW5lci5vbmtleWRvd24gPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMua2V5RXZlbnRQbHVnaW5JbnN0YW5jZS5nZXRFdmVudEZ1bGxLZXkoZXZlbnQpO1xuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIFNoaWZ0K1RhYiBrZXkgb3IgVGFiIGtleSBvciBlc2NhcGVcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdzaGlmdC50YWInIHx8IGFjdGlvbiA9PT0gJ2VzY2FwZScgfHwgKGFjdGlvbiA9PT0gJ3RhYicgJiYgIWlzRGF0ZVRpbWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50U2NvcGUuaGlkZURhdGVwaWNrZXJEcm9wZG93bigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlJbnB1dEVsZW0gPSB0aGlzLmVsZW1lbnRTY29wZS5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5LWlucHV0JykgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBkaXNwbGF5SW5wdXRFbGVtLmZvY3VzKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ3RhYicgJiYgaXNEYXRlVGltZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYnNEYXRlUGlja2VyRGlyZWN0aXZlLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnRTY29wZS50b2dnbGVUaW1lUGlja2VyKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmxvYWREYXlzKCk7XG4gICAgICAgIHRoaXMuc2V0QWN0aXZlRGF0ZUZvY3VzKHRoaXMuYWN0aXZlRGF0ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBhZGQgdGFiaW5kZXgsIGtleWJvcmQgYW5kIG1vdXNlIGV2ZW50cyBmb3IgZGF5c1xuICAgICAqL1xuICAgIHByaXZhdGUgbG9hZERheXMoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgJCgnLmJzLWRhdGVwaWNrZXItYm9keScpLmF0dHIoJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgICAgICAgICQoJ1tic2RhdGVwaWNrZXJkYXlkZWNvcmF0b3JdJykubm90KCcuaXMtb3RoZXItbW9udGgnKS5hdHRyKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICAgICAgICB0aGlzLmFkZEtleUJvYXJkRXZlbnRzRm9yRGF5cygpO1xuICAgICAgICAgICAgdGhpcy5hZGREYXRlcGlja2VyTW91c2VFdmVudHMoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2Qgc2V0cyBrZXlib2FyZCBldmVudHMgZm9yIGRheXNcbiAgICAgKi9cbiAgICBwcml2YXRlIGFkZEtleUJvYXJkRXZlbnRzRm9yRGF5cygpIHtcbiAgICAgICAgY29uc3QgZGF0ZVBpY2tlckJvZHkgPSAkKCcuYnMtZGF0ZXBpY2tlci1ib2R5Jyk7XG4gICAgICAgIGlmIChkYXRlUGlja2VyQm9keS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBkYXRlUGlja2VyQm9keVswXS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBkYXRlUGlja2VyQm9keS5rZXlkb3duKChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWN0aW9uID0gdGhpcy5rZXlFdmVudFBsdWdpbkluc3RhbmNlLmdldEV2ZW50RnVsbEtleShldmVudCk7XG4gICAgICAgICAgICBsZXQgbmV3ZGF0ZTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdhcnJvd2Rvd24nKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBuZXdkYXRlID0gbW9tZW50KHRoaXMuYWN0aXZlRGF0ZSkuYWRkKCs3LCAnZGF5cycpLnRvRGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlRGF0ZUZvY3VzKG5ld2RhdGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdhcnJvd3VwJykge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgbmV3ZGF0ZSA9IG1vbWVudCh0aGlzLmFjdGl2ZURhdGUpLmFkZCgtNywgJ2RheXMnKS50b0RhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZURhdGVGb2N1cyhuZXdkYXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnYXJyb3dsZWZ0Jykge1xuICAgICAgICAgICAgICAgIG5ld2RhdGUgPSBtb21lbnQodGhpcy5hY3RpdmVEYXRlKS5hZGQoLTEsICdkYXlzJykudG9EYXRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVEYXRlRm9jdXMobmV3ZGF0ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2Fycm93cmlnaHQnKSB7XG4gICAgICAgICAgICAgICAgbmV3ZGF0ZSA9IG1vbWVudCh0aGlzLmFjdGl2ZURhdGUpLmFkZCgrMSwgJ2RheXMnKS50b0RhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZURhdGVGb2N1cyhuZXdkYXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnY29udHJvbC5hcnJvd3VwJykge1xuICAgICAgICAgICAgICAgIC8vIGNsaWNraW5nIG9uIHRhYmxlIGhlYWRlciBtb250aCBuYW1lIHRvIGxvYWQgbGlzdCBvZiBtb250aHNcbiAgICAgICAgICAgICAgICAkKCcuYnMtZGF0ZXBpY2tlci1oZWFkIC5jdXJyZW50JykuZmlyc3QoKS5jbGljaygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZE1vbnRocygpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlTW9udGhGb2N1cyh0aGlzLmFjdGl2ZURhdGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdlbnRlcicpIHtcbiAgICAgICAgICAgICAgICBpZiAoJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KS5oYXNDbGFzcygnZGlzYWJsZWQnKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkuY2xpY2soKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnRTY29wZS5oaWRlRGF0ZXBpY2tlckRyb3Bkb3duKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlzcGxheUlucHV0RWxlbSA9IHRoaXMuZWxlbWVudFNjb3BlLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmRpc3BsYXktaW5wdXQnKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGRpc3BsYXlJbnB1dEVsZW0uZm9jdXMoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gYWRkIHRhYmluZGV4LCBrZXlib3JkIGFuZCBtb3VzZSBldmVudHMgZm9yIG1vbnRoc1xuICAgICAqL1xuICAgIHByaXZhdGUgbG9hZE1vbnRocygpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkYXRlUGlja2VyQm9keSA9ICQoJy5icy1kYXRlcGlja2VyLWJvZHknKTtcbiAgICAgICAgICAgIGRhdGVQaWNrZXJCb2R5LmF0dHIoJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgICAgICAgIGRhdGVQaWNrZXJCb2R5LmZpbmQoJ3RhYmxlLm1vbnRocyBzcGFuJykuYXR0cigndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgICAgICAgdGhpcy5hZGRLZXlCb2FyZEV2ZW50c0Zvck1vbnRocygpO1xuICAgICAgICAgICAgdGhpcy5hZGREYXRlcGlja2VyTW91c2VFdmVudHMoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2Qgc2V0cyBrZXlib2FyZCBldmVudHMgZm9yIG1vbnRoc1xuICAgICAqL1xuICAgIHByaXZhdGUgYWRkS2V5Qm9hcmRFdmVudHNGb3JNb250aHMoKSB7XG4gICAgICAgICQoJy5icy1kYXRlcGlja2VyLWJvZHknKS5rZXlkb3duKChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWN0aW9uID0gdGhpcy5rZXlFdmVudFBsdWdpbkluc3RhbmNlLmdldEV2ZW50RnVsbEtleShldmVudCk7XG4gICAgICAgICAgICBsZXQgbmV3ZGF0ZTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdhcnJvd2Rvd24nKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBuZXdkYXRlID0gbW9tZW50KHRoaXMuYWN0aXZlRGF0ZSkuYWRkKCszLCAnbW9udGgnKS50b0RhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZU1vbnRoRm9jdXMobmV3ZGF0ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2Fycm93dXAnKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBuZXdkYXRlID0gbW9tZW50KHRoaXMuYWN0aXZlRGF0ZSkuYWRkKC0zLCAnbW9udGgnKS50b0RhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZU1vbnRoRm9jdXMobmV3ZGF0ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2Fycm93bGVmdCcpIHtcbiAgICAgICAgICAgICAgICBuZXdkYXRlID0gbW9tZW50KHRoaXMuYWN0aXZlRGF0ZSkuYWRkKC0xLCAnbW9udGgnKS50b0RhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZU1vbnRoRm9jdXMobmV3ZGF0ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2Fycm93cmlnaHQnKSB7XG4gICAgICAgICAgICAgICAgbmV3ZGF0ZSA9IG1vbWVudCh0aGlzLmFjdGl2ZURhdGUpLmFkZCgrMSwgJ21vbnRoJykudG9EYXRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVNb250aEZvY3VzKG5ld2RhdGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdjb250cm9sLmFycm93dXAnKSB7XG4gICAgICAgICAgICAgICAgLy8gY2xpY2tpbmcgb24gdGFibGUgaGVhZGVyIHllYXIgdG8gbG9hZCBsaXN0IG9mIHllYXJzXG4gICAgICAgICAgICAgICAgJCgnLmJzLWRhdGVwaWNrZXItaGVhZCAuY3VycmVudCcpLmZpcnN0KCkuY2xpY2soKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRZZWFycygpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlWWVhckZvY3VzKHRoaXMuYWN0aXZlRGF0ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2NvbnRyb2wuYXJyb3dkb3duJyB8fCBhY3Rpb24gPT09ICdlbnRlcicpIHtcbiAgICAgICAgICAgICAgICBpZiAoJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KS5wYXJlbnQoKS5oYXNDbGFzcygnZGlzYWJsZWQnKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkuY2xpY2soKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWREYXlzKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3RGF0ZSA9IG5ldyBEYXRlKHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKSwgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVEYXRlRm9jdXMobmV3RGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gYWRkIHRhYmluZGV4LCBrZXlib3JkIGFuZCBtb3VzZSBldmVudHMgZm9yIHllYXJzXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkWWVhcnMoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGF0ZVBpY2tlckJvZHkgPSAkKCcuYnMtZGF0ZXBpY2tlci1ib2R5Jyk7XG4gICAgICAgICAgICBkYXRlUGlja2VyQm9keS5hdHRyKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICAgICAgICBkYXRlUGlja2VyQm9keS5maW5kKCd0YWJsZS55ZWFycyBzcGFuJykuYXR0cigndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgICAgICAgdGhpcy5hZGRLZXlCb2FyZEV2ZW50c0ZvclllYXJzKCk7XG4gICAgICAgICAgICB0aGlzLmFkZERhdGVwaWNrZXJNb3VzZUV2ZW50cygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIHNldCBmb2N1cyBmb3IgYWN0aXZlIG1vbnRoXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRBY3RpdmVNb250aEZvY3VzKG5ld0RhdGUsIGlzTW9vdXNlRXZlbnQ/OiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IG5ld01vbnRoID0gbW9udGhzW25ld0RhdGUuZ2V0TW9udGgoKV07XG4gICAgICAgIC8vIGNoZWNrIGZvciBrZXlib2FyZCBldmVudFxuICAgICAgICBpZiAoIWlzTW9vdXNlRXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChuZXdEYXRlLmdldEZ1bGxZZWFyKCkgPCB0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ29Ub090aGVyTW9udGhPcnllYXIoJ3ByZXZpb3VzJywgJ21vbnRoJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0RhdGUuZ2V0RnVsbFllYXIoKSA+IHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nb1RvT3RoZXJNb250aE9yeWVhcignbmV4dCcsICdtb250aCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgICAgICAgICQoYC5icy1kYXRlcGlja2VyLWJvZHkgdGFibGUubW9udGhzIHNwYW46Y29udGFpbnMoJHtuZXdNb250aH0pYCkuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IG5ld0RhdGU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHNldHMga2V5Ym9hcmQgZXZlbnRzIGZvciB5ZWFyc1xuICAgICAqL1xuICAgIHByaXZhdGUgYWRkS2V5Qm9hcmRFdmVudHNGb3JZZWFycygpIHtcbiAgICAgICAgJCgnLmJzLWRhdGVwaWNrZXItYm9keScpLmtleWRvd24oKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb24gPSB0aGlzLmtleUV2ZW50UGx1Z2luSW5zdGFuY2UuZ2V0RXZlbnRGdWxsS2V5KGV2ZW50KTtcbiAgICAgICAgICAgIGxldCBuZXdkYXRlO1xuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ2Fycm93ZG93bicpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIG5ld2RhdGUgPSBtb21lbnQodGhpcy5hY3RpdmVEYXRlKS5hZGQoKzQsICd5ZWFyJykudG9EYXRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVZZWFyRm9jdXMobmV3ZGF0ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2Fycm93dXAnKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBuZXdkYXRlID0gbW9tZW50KHRoaXMuYWN0aXZlRGF0ZSkuYWRkKC00LCAneWVhcicpLnRvRGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlWWVhckZvY3VzKG5ld2RhdGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdhcnJvd2xlZnQnKSB7XG4gICAgICAgICAgICAgICAgbmV3ZGF0ZSA9IG1vbWVudCh0aGlzLmFjdGl2ZURhdGUpLmFkZCgtMSwgJ3llYXInKS50b0RhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZVllYXJGb2N1cyhuZXdkYXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnYXJyb3dyaWdodCcpIHtcbiAgICAgICAgICAgICAgICBuZXdkYXRlID0gbW9tZW50KHRoaXMuYWN0aXZlRGF0ZSkuYWRkKCsxLCAneWVhcicpLnRvRGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlWWVhckZvY3VzKG5ld2RhdGUpO1xuICAgICAgICAgICAgfSAgZWxzZSBpZiAoYWN0aW9uID09PSAnY29udHJvbC5hcnJvd2Rvd24nIHx8IGFjdGlvbiA9PT0gJ2VudGVyJykge1xuICAgICAgICAgICAgICAgIGlmICgkKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpLnBhcmVudCgpLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KS5jbGljaygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZE1vbnRocygpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlTW9udGhGb2N1cyh0aGlzLmFjdGl2ZURhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIHNldCBmb2N1cyBmb3IgYWN0aXZlIHllYXJcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldEFjdGl2ZVllYXJGb2N1cyhuZXdEYXRlLCBpc01vdXNlRXZlbnQ/OiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IG5ld1llYXIgPSBuZXdEYXRlLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgIGNvbnN0IGRhdGVQaWNrZXJZZWFycyA9ICQoJy5icy1kYXRlcGlja2VyLWJvZHkgdGFibGUueWVhcnMgc3BhbicpO1xuICAgICAgICBjb25zdCBzdGFydFllYXIgPSBkYXRlUGlja2VyWWVhcnMuZmlyc3QoKS50ZXh0KCk7XG4gICAgICAgIGNvbnN0IGVuZFllYXIgPSBkYXRlUGlja2VyWWVhcnMubGFzdCgpLnRleHQoKTtcbiAgICAgICAgLy8gY2hlY2sgZm9yIGtleWJvYXJkIGV2ZW50XG4gICAgICAgIGlmICghaXNNb3VzZUV2ZW50KSB7XG4gICAgICAgICAgICBpZiAobmV3RGF0ZS5nZXRGdWxsWWVhcigpIDwgXy5wYXJzZUludChzdGFydFllYXIpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nb1RvT3RoZXJNb250aE9yeWVhcigncHJldmlvdXMnLCAneWVhcicpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdEYXRlLmdldEZ1bGxZZWFyKCkgPiBfLnBhcnNlSW50KGVuZFllYXIpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nb1RvT3RoZXJNb250aE9yeWVhcignbmV4dCcsICd5ZWFyJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICAgICAgJChgLmJzLWRhdGVwaWNrZXItYm9keSB0YWJsZS55ZWFycyBzcGFuOmNvbnRhaW5zKCR7bmV3WWVhcn0pYCkuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IG5ld0RhdGU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHNldHMgZm9jdXMgZm9yIHRpbWVwaWNrZXIgZmlyc3QgaW5wdXQgZmllbGQoaG91cnMgZmllbGQpIHdoaWxlIG9wZW5pbmcgdGltZSBwaWNrZXJcbiAgICAgKiBAcGFyYW0gc2NvcGUgLSBzY29wZSBvZiB0aGUgdGltZSBwaWNrZXIgd2lkZ2V0XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGZvY3VzVGltZVBpY2tlclBvcG92ZXIoc2NvcGUpIHtcbiAgICAgICAgdGhpcy5rZXlFdmVudFBsdWdpbkluc3RhbmNlID0gc2NvcGUua2V5RXZlbnRQbHVnaW4uY29uc3RydWN0b3I7XG4gICAgICAgIHRoaXMuZWxlbWVudFNjb3BlID0gc2NvcGU7XG4gICAgICAgIC8vIHNldFRpbWVvdXQgaXMgdXNlZCBzbyB0aGF0IGJ5IHRoZW4gdGltZSBpbnB1dCBoYXMgdGhlIHVwZGF0ZWQgdmFsdWUuIGZvY3VzIGlzIHNldHRpbmcgYmFjayB0byB0aGUgaW5wdXQgZmllbGRcbiAgICAgICAgdGhpcy5lbGVtZW50U2NvcGUubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICQoJ3RpbWVwaWNrZXIgLmZvcm0tZ3JvdXA6Zmlyc3QgPiBpbnB1dC5mb3JtLWNvbnRyb2wnKS5mb2N1cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiBzZXRzIHRoZSBrZXlib2FyZCBldmVudHMgdG8gVGltZXBpY2tlciBwb3B1cFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBiaW5kVGltZVBpY2tlcktleWJvYXJkRXZlbnRzKCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0ICR0aW1lcGlja2VyUG9wdXAgPSAkKCdib2R5JykuZmluZCgnPiBicy1kcm9wZG93bi1jb250YWluZXIgdGltZXBpY2tlcicpO1xuICAgICAgICAgICAgJHRpbWVwaWNrZXJQb3B1cC5hdHRyKCd0YWJpbmRleCcsIDApO1xuICAgICAgICAgICAgdGhpcy5hZGRFdmVudHNPblRpbWVQaWNrZXIoJHRpbWVwaWNrZXJQb3B1cCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gY2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGRhdGUgaXMgdmFsaWQgb3Igbm90XG4gICAgICogQHJldHVybnMgYm9vbGVhbiB2YWx1ZSwgdHJ1ZSBpZiBkYXRlIGlzIHZhbGlkIGVsc2UgcmV0dXJucyBmYWxzZVxuICAgICAqL1xuICAgIHByaXZhdGUgaXNWYWxpZERhdGUoZGF0ZSkge1xuICAgICAgICByZXR1cm4gZGF0ZSAmJiBkYXRlIGluc3RhbmNlb2YgRGF0ZSAmJiAhaXNOYU4oZGF0ZS5nZXRUaW1lKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gY2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIHRpbWUgaXMgdmFsaWQgb3Igbm90XG4gICAgICovXG4gICAgcHJpdmF0ZSB0aW1lRm9ybWF0VmFsaWRhdGlvbigpIHtcbiAgICAgICAgY29uc3QgZW50ZXJlZERhdGUgPSAkKHRoaXMubmF0aXZlRWxlbWVudCkuZmluZCgnaW5wdXQnKS52YWwoKTtcbiAgICAgICAgY29uc3QgbmV3VmFsID0gZ2V0TmF0aXZlRGF0ZU9iamVjdChlbnRlcmVkRGF0ZSk7XG4gICAgICAgIGlmICghdGhpcy5mb3JtYXRWYWxpZGF0aW9uKG5ld1ZhbCwgZW50ZXJlZERhdGUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnZhbGlkRGF0ZVRpbWVGb3JtYXQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiBzZXRzIHRoZSBldmVudHMgdG8gZ2l2ZW4gZWxlbWVudFxuICAgICAqIEBwYXJhbSAkZWwgLSBlbGVtZW50IG9uIHdoaWNoIHRoZSBldmVudCBpcyBhZGRlZFxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkRXZlbnRzT25UaW1lUGlja2VyKCRlbDogSlF1ZXJ5KSB7XG4gICAgICAgICRlbC5vbigna2V5ZG93bicsIGV2dCA9PiB7XG4gICAgICAgICAgICBjb25zdCAkdGFyZ2V0ID0gJChldnQudGFyZ2V0KTtcbiAgICAgICAgICAgIGNvbnN0ICRwYXJlbnQgPSAkdGFyZ2V0LnBhcmVudCgpO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNjb3BlID0gdGhpcy5lbGVtZW50U2NvcGU7XG5cbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMua2V5RXZlbnRQbHVnaW5JbnN0YW5jZS5nZXRFdmVudEZ1bGxLZXkoZXZ0KTtcblxuICAgICAgICAgICAgbGV0IHN0b3BQcm9wb2dhdGlvbiwgcHJldmVudERlZmF1bHQ7XG5cbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdlc2NhcGUnKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudFNjb3BlLmhpZGVUaW1lcGlja2VyRHJvcGRvd24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCR0YXJnZXQuaGFzQ2xhc3MoJ2JzLXRpbWVwaWNrZXItZmllbGQnKSkge1xuICAgICAgICAgICAgICAgIGlmICgkcGFyZW50LmlzKCc6Zmlyc3QtY2hpbGQnKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnc2hpZnQudGFiJyB8fCBhY3Rpb24gPT09ICdlbnRlcicgfHwgYWN0aW9uID09PSAnZXNjYXBlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFNjb3BlLnNldElzVGltZU9wZW4oZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcFByb3BvZ2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoJHBhcmVudC5pcygnOmxhc3QtY2hpbGQnKSB8fCAoJHBhcmVudC5uZXh0KCkubmV4dCgpLmZpbmQoJ2J1dHRvbi5kaXNhYmxlZCcpLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ3RhYicgfHwgYWN0aW9uID09PSAnZXNjYXBlJyB8fCBhY3Rpb24gPT09ICdlbnRlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRTY29wZS5zZXRJc1RpbWVPcGVuKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3BQcm9wb2dhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnZW50ZXInIHx8IGFjdGlvbiA9PT0gJ2VzY2FwZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRTY29wZS5zZXRJc1RpbWVPcGVuKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3BQcm9wb2dhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHN0b3BQcm9wb2dhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRTY29wZS5taW50aW1lICYmIGVsZW1lbnRTY29wZS5tYXh0aW1lICYmICF0aGlzLmlzVmFsaWREYXRlKGVsZW1lbnRTY29wZS5ic1RpbWVWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ2Fycm93ZG93bicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRTY29wZS5ic1RpbWVWYWx1ZSA9IGVsZW1lbnRTY29wZS5tYXhUaW1lO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2Fycm93dXAnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50U2NvcGUuYnNUaW1lVmFsdWUgPSBlbGVtZW50U2NvcGUubWluVGltZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYWN0aW9uID09PSAndGFiJykge1xuICAgICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZERhdGVUaW1lRm9ybWF0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgY29uc3QgcGF0dGVybiA9IHRoaXMuZGF0ZXBhdHRlcm4gfHwgdGhpcy50aW1lcGF0dGVybjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdldEZvcm1hdHRlZERhdGUoZWxlbWVudFNjb3BlLmRhdGVQaXBlLCBlbGVtZW50U2NvcGUuYnNUaW1lVmFsdWUsIHBhdHRlcm4pID09PSBlbGVtZW50U2NvcGUuZGlzcGxheVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMubmF0aXZlRWxlbWVudCkuZmluZCgnLmRpc3BsYXktaW5wdXQnKS52YWwoZWxlbWVudFNjb3BlLmRpc3BsYXlWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ2Fycm93ZG93bicgfHwgIGFjdGlvbiA9PT0gJ2Fycm93dXAnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGltZUZvcm1hdFZhbGlkYXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfSBlbHNlIGlmICgkdGFyZ2V0Lmhhc0NsYXNzKCdidG4tZGVmYXVsdCcpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ3RhYicgfHwgYWN0aW9uID09PSAnZXNjYXBlJykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50U2NvcGUuc2V0SXNUaW1lT3BlbihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAkZWwuZmluZCgnYScpLm9uKCdjbGljaycsIGV2dCA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50U2NvcGUgPSB0aGlzLmVsZW1lbnRTY29wZTtcbiAgICAgICAgICAgIGNvbnN0ICR0YXJnZXQgPSAkKGV2dC50YXJnZXQpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRTY29wZS5taW50aW1lICYmIGVsZW1lbnRTY29wZS5tYXh0aW1lICYmICF0aGlzLmlzVmFsaWREYXRlKGVsZW1lbnRTY29wZS5ic1RpbWVWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoJHRhcmdldC5maW5kKCdzcGFuJykuaGFzQ2xhc3MoJ2JzLWNoZXZyb24tZG93bicpKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRTY29wZS5ic1RpbWVWYWx1ZSA9IGVsZW1lbnRTY29wZS5tYXhUaW1lO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoJHRhcmdldC5maW5kKCdzcGFuJykuaGFzQ2xhc3MoJ2JzLWNoZXZyb24tdXAnKSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50U2NvcGUuYnNUaW1lVmFsdWUgPSBlbGVtZW50U2NvcGUubWluVGltZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRpbWVGb3JtYXRWYWxpZGF0aW9uKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyB1cGRhdGVGb3JtYXQocGF0dGVybikge1xuICAgICAgICBpZiAocGF0dGVybiA9PT0gJ2RhdGVwYXR0ZXJuJykge1xuICAgICAgICAgICAgdGhpcy5fZGF0ZU9wdGlvbnMuZGF0ZUlucHV0Rm9ybWF0ID0gdGhpcy5kYXRlcGF0dGVybjtcbiAgICAgICAgICAgIHRoaXMuc2hvd3NlY29uZHMgPSBfLmluY2x1ZGVzKHRoaXMuZGF0ZXBhdHRlcm4sICdzJyk7XG4gICAgICAgICAgICB0aGlzLmlzbWVyaWRpYW4gPSBfLmluY2x1ZGVzKHRoaXMuZGF0ZXBhdHRlcm4sICdoJyk7XG4gICAgICAgIH0gZWxzZSBpZiAocGF0dGVybiA9PT0gJ3RpbWVwYXR0ZXJuJykge1xuICAgICAgICAgICAgdGhpcy5zaG93c2Vjb25kcyA9IF8uaW5jbHVkZXModGhpcy50aW1lcGF0dGVybiwgJ3MnKTtcbiAgICAgICAgICAgIHRoaXMuaXNtZXJpZGlhbiA9IF8uaW5jbHVkZXModGhpcy50aW1lcGF0dGVybiwgJ2gnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3Y/KSB7XG5cbiAgICAgICAgaWYgKGtleSA9PT0gJ3RhYmluZGV4Jykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnVzZURhdGFwaWNrZXIgJiYga2V5ID09PSAnZGF0ZXBhdHRlcm4nKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZvcm1hdChrZXkpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3Nob3d3ZWVrcycpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGVPcHRpb25zLnNob3dXZWVrTnVtYmVycyA9IG52O1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ21pbmRhdGUnKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRlT3B0aW9ucy5taW5EYXRlID0gKG52ID09PSBDVVJSRU5UX0RBVEUpID8gIHRoaXMubWluZGF0ZSA9IG5ldyBEYXRlKCkgOiBnZXREYXRlT2JqKG52KTtcbiAgICAgICAgICAgIHRoaXMubWluRGF0ZU1heERhdGVWYWxpZGF0aW9uT25JbnB1dCh0aGlzLmRhdGF2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbWF4ZGF0ZScpIHtcbiAgICAgICAgICAgdGhpcy5fZGF0ZU9wdGlvbnMubWF4RGF0ZSA9IChudiA9PT0gQ1VSUkVOVF9EQVRFKSA/ICB0aGlzLm1heGRhdGUgPSBuZXcgRGF0ZSgpIDogZ2V0RGF0ZU9iaihudik7XG4gICAgICAgICAgICB0aGlzLm1pbkRhdGVNYXhEYXRlVmFsaWRhdGlvbk9uSW5wdXQodGhpcy5kYXRhdmFsdWUpO1xuICAgICAgICB9ICBlbHNlIGlmIChrZXkgPT09ICdleGNsdWRlZGF0ZXMnIHx8IGtleSA9PT0gJ2V4Y2x1ZGVkYXlzJykge1xuICAgICAgICAgICAgdGhpcy5taW5EYXRlTWF4RGF0ZVZhbGlkYXRpb25PbklucHV0KHRoaXMuZGF0YXZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgaWYgKHRoaXMuYnNEYXRlUGlja2VyRGlyZWN0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGVPblNob3dTdWJzY3JpcHRpb24gPSB0aGlzLmJzRGF0ZVBpY2tlckRpcmVjdGl2ZVxuICAgICAgICAgICAgICAgIC5vblNob3duXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZShjYWwgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjYWwuZGF5c0NhbGVuZGFyLnN1YnNjcmliZShkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleGNsdWRlZERhdGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZXhjbHVkZWRhdGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzU3RyaW5nKHRoaXMuZXhjbHVkZWRhdGVzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGNsdWRlZERhdGVzID0gXy5zcGxpdCh0aGlzLmV4Y2x1ZGVkYXRlcywgJywnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGNsdWRlZERhdGVzID0gdGhpcy5leGNsdWRlZGF0ZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGVkRGF0ZXMgPSBleGNsdWRlZERhdGVzLm1hcChkID0+IG1vbWVudChkKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhWzBdLndlZWtzLmZvckVhY2god2VlayA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2Vlay5kYXlzLmZvckVhY2goZGF5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXkuaXNEaXNhYmxlZCAmJiB0aGlzLmV4Y2x1ZGVkYXlzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXkuaXNEaXNhYmxlZCA9IF8uaW5jbHVkZXModGhpcy5leGNsdWRlZGF5cywgZGF5LmRheUluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGF5LmlzRGlzYWJsZWQgJiYgZXhjbHVkZWREYXRlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWQgPSBtb21lbnQoZGF5LmRhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF5LmlzRGlzYWJsZWQgPSBleGNsdWRlZERhdGVzLnNvbWUoZWQgPT4gbWQuaXNTYW1lKGVkLCAnZGF5JykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICBpZiAodGhpcy5kYXRlT25TaG93U3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGVPblNob3dTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gICAgfVxufVxuIl19