import { AfterViewInit, ChangeDetectorRef, Injector, NgZone, OnDestroy } from '@angular/core';
import { AppDefaults } from '@wm/core';
import { BaseDateTimeComponent } from '../base/base-date-time.component';
export declare class DatetimeComponent extends BaseDateTimeComponent implements AfterViewInit, OnDestroy {
    private ngZone;
    private cdRef;
    private appDefaults;
    static initializeProps: void;
    /**
     * The below propeties prefixed with "bs" always holds the value that is selected from the datepicker.
     * The bsDateTimeValue = bsDateValue + bsTimeValue.
     */
    private bsDateTimeValue;
    private bsDateValue;
    private bsTimeValue;
    private proxyModel;
    showdropdownon: string;
    private keyEventPlugin;
    private deregisterDatepickerEventListener;
    private deregisterTimepickeEventListener;
    private isEnterPressedOnDateInput;
    readonly timestamp: any;
    /**
     * The displayValue is the display value of the bsDateTimeValue after applying the datePattern on it.
     * @returns {any|string}
     */
    readonly displayValue: any;
    bsDatePickerDirective: any;
    bsTimePicker: any;
    /**
     * This property checks if the timePicker is Open
     */
    private isTimeOpen;
    /**
     * This property checks if the datePicker is Open
     */
    private isDateOpen;
    /**
     * This timeinterval is used to run the timer when the time component value is set to CURRENT_TIME in properties panel.
     */
    private timeinterval;
    /**
     * This property is set to TRUE if the time component value is set to CURRENT_TIME; In this case the timer keeps changing the time value until the widget is available.
     */
    private isCurrentDate;
    private _debouncedOnChange;
    private dateContainerCls;
    /**Todo[Shubham]: needs to be redefined
    * This property sets the default value for the date selection
    */
    datavalue: any;
    constructor(inj: Injector, ngZone: NgZone, cdRef: ChangeDetectorRef, appDefaults: AppDefaults, evtMngrPlugins: any);
    /**
     * This is an internal method used to maintain a time interval to update the time model when the data value is set to CURRENT_TIME
     */
    private setTimeInterval;
    /**
     * This is an internal method used to clear the time interval created
     */
    private clearTimeInterval;
    /**
     * This is an internal method to toggle the time picker
     */
    private toggleTimePicker;
    private addTimepickerClickListener;
    /**
     * This function sets the value isOpen/isTimeOpen (i.e when datepicker popup is closed) based on widget type(i.e  DateTime, Time)
     * @param val - isOpen/isTimeOpen is set based on the timepicker popup is open/closed
     */
    private setIsTimeOpen;
    private hideTimepickerDropdown;
    /**
     * This is an internal method to add a click listener once the time dropdown is open
     */
    private onTimepickerOpen;
    private onDatePickerOpen;
    /**
     * This is an internal method to update the model
     */
    private onModelUpdate;
    /**
     * This is an internal method used to Prevent time picker close while changing time value
     */
    private preventTpClose;
    /**
     * This is an internal method used to toggle the dropdown of the date widget
     */
    private toggleDpDropdown;
    private addBodyClickListener;
    private hideDatepickerDropdown;
    private onDateChange;
    /**
     * This is an internal method triggered when pressing key on the datetime input
     */
    private onDisplayKeydown;
    private isValid;
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any): void;
    onInputBlur($event: any): void;
}
