import { AfterViewInit, Injector, OnDestroy } from '@angular/core';
import { Validator } from '@angular/forms';
import { BaseFormCustomComponent } from './base-form-custom.component';
import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap';
export declare abstract class BaseDateTimeComponent extends BaseFormCustomComponent implements AfterViewInit, OnDestroy, Validator {
    excludedays: string;
    excludedates: any;
    outputformat: any;
    mindate: any;
    maxdate: any;
    useDatapicker: boolean;
    protected activeDate: any;
    private keyEventPluginInstance;
    private elementScope;
    datepattern: string;
    timepattern: string;
    protected showseconds: boolean;
    protected ismeridian: boolean;
    protected datePipe: any;
    protected dateNotInRange: boolean;
    protected timeNotInRange: boolean;
    protected invalidDateTimeFormat: boolean;
    private dateOnShowSubscription;
    /**
     * This is an internal property used to map the containerClass, showWeekNumbers etc., to the bsDatepicker
     */
    protected _dateOptions: BsDatepickerConfig;
    protected bsDatePickerDirective: BsDatepickerDirective;
    protected bsDropdown: any;
    constructor(inj: Injector, WIDGET_CONFIG: any);
    /**
     * returns true if the input value is default (i.e open date picker on input click)
     * @param1 dropdownvalue, user selected value (by default datepicker opens on input click)
     * **/
    protected isDropDownDisplayEnabledOnInput(dropdownvalue: any): boolean;
    /**
     * This method is used to show validation message depending on the isNativePicker flag.
     */
    private showValidation;
    resetDisplayInput(): void;
    validate(): {
        invalidDateTimeFormat: {
            valid: boolean;
        };
        dateNotInRange?: undefined;
        timeNotInRange?: undefined;
    } | {
        dateNotInRange: {
            valid: boolean;
        };
        invalidDateTimeFormat?: undefined;
        timeNotInRange?: undefined;
    } | {
        timeNotInRange: {
            valid: boolean;
        };
        invalidDateTimeFormat?: undefined;
        dateNotInRange?: undefined;
    };
    /**
     * This method is used to validate date pattern and time pattern
     * If user selects one pattern in design time and if he tries to enter the date in another pattern then the device is throwing an error
     */
    protected formatValidation(newVal: any, inputVal: any, isNativePicker?: boolean): boolean;
    /**
     * This method is used to validate min date, max date, exclude dates and exclude days
     * In mobile if invalid dates are entered, device is showing an alert.
     * In web if invalid dates are entered, device is showing validation message.
     */
    protected minDateMaxDateValidationOnInput(newVal: any, $event?: Event, displayValue?: string, isNativePicker?: boolean): any;
    /**
     * This method is used to highlight the current date
     */
    protected hightlightToday(): void;
    /**
     * This method is used to find the new date is from another year or not
     * @param newDate - newly selected date value
     */
    private isOtheryear;
    /**
     * This method is used to set focus for active day
     * @param newDate - newly selected date value
     * @param isMouseEvent - boolean value represents the event is mouse event/ keyboard event
     */
    private setActiveDateFocus;
    /**
     * This method is used to load other month days or other month or other year
     * @param btnClass - class(previous/next) of the button which we have to click
     * @param timePeriod - String value decides to load other month days or other month or other year
     */
    private goToOtherMonthOryear;
    /**
    * This method sets the mouse events to Datepicker popup. These events are required when we navigate date picker through mouse.
     */
    private addDatepickerMouseEvents;
    /**
     * This method sets focus for months/days depending on the loaded datepicker table
     */
    private setFocusForMonthOrDay;
    /**
     * This method sets focus for months/years depending on the loaded datepicker table
     */
    private setFocusForCurrentMonthOryear;
    /**
     * This method sets focus for months/years/days depending on the loaded datepicker table
     */
    private setFocusForDate;
    /**
     * This method is used to add keyboard events while opening the date picker
     * @param scope - scope of the date/datetime widget
     * @param isDateTime - boolean value represents the loaded widget is date or datetime
     */
    protected addDatepickerKeyboardEvents(scope: any, isDateTime: any): void;
    /**
     * This method is used to add tabindex, keybord and mouse events for days
     */
    private loadDays;
    /**
     * This method sets keyboard events for days
     */
    private addKeyBoardEventsForDays;
    /**
     * This method is used to add tabindex, keybord and mouse events for months
     */
    private loadMonths;
    /**
     * This method sets keyboard events for months
     */
    private addKeyBoardEventsForMonths;
    /**
     * This method is used to add tabindex, keybord and mouse events for years
     */
    private loadYears;
    /**
     * This method is used to set focus for active month
     */
    private setActiveMonthFocus;
    /**
     * This method sets keyboard events for years
     */
    private addKeyBoardEventsForYears;
    /**
     * This method is used to set focus for active year
     */
    private setActiveYearFocus;
    /**
     * This method sets focus for timepicker first input field(hours field) while opening time picker
     * @param scope - scope of the time picker widget
     */
    protected focusTimePickerPopover(scope: any): void;
    /**
     * This function sets the keyboard events to Timepicker popup
     */
    protected bindTimePickerKeyboardEvents(): void;
    /**
     * This function checks whether the given date is valid or not
     * @returns boolean value, true if date is valid else returns false
     */
    private isValidDate;
    /**
     * This function checks whether the given time is valid or not
     */
    private timeFormatValidation;
    /**
     * This function sets the events to given element
     * @param $el - element on which the event is added
     */
    private addEventsOnTimePicker;
    updateFormat(pattern: any): void;
    onPropertyChange(key: any, nv: any, ov?: any): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
}
