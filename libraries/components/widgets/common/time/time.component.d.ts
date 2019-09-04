import { Injector, NgZone, OnDestroy } from '@angular/core';
import { AppDefaults } from '@wm/core';
import { BaseDateTimeComponent } from '../base/base-date-time.component';
export declare class TimeComponent extends BaseDateTimeComponent implements OnDestroy {
    private ngZone;
    private appDefaults;
    static initializeProps: void;
    /**
     * This property sets the display pattern of the time selected
     */
    timepattern: string;
    /**
     * This property sets the output format for the selected time datavalue
     */
    outputformat: string;
    showdropdownon: string;
    private deregisterEventListener;
    readonly timestamp: number;
    /**Todo[Shubham]: needs to be redefined
    * This property sets the default value for the time selection
    */
    datavalue: any;
    readonly displayValue: any;
    private isCurrentTime;
    private timeinterval;
    /**
     * This is an internal property used to map it to the widget
     */
    private minTime;
    /**
     * This is an internal property used to map it to the widget
     */
    private maxTime;
    /**
     * This is an internal property used to toggle the timepicker dropdown
     */
    private status;
    /**
     * This is an internal property used to map the main model to the time widget
     */
    private bsTimeValue;
    private keyEventPlugin;
    bsTimePicker: any;
    constructor(inj: Injector, ngZone: NgZone, appDefaults: AppDefaults, evtMngrPlugins: any);
    onPropertyChange(key: string, nv: any, ov?: any): void;
    /**
     * This is an internal method used to validate mintime and maxtime
     */
    private mintimeMaxtimeValidation;
    /**
     * This is an internal method used to toggle the dropdown of the time widget
     */
    private toggleDropdown;
    /**
     * This is an internal method used to Prevent time picker close while changing time value
     */
    private preventTpClose;
    private addBodyClickListener;
    /**
     * This is an internal method triggered when pressing key on the time input
     */
    private onDisplayKeydown;
    /**
     * This is an internal method triggered when the time input changes
     */
    onDisplayTimeChange($event: any): void;
    onInputBlur($event: any): void;
    /**
     * This is an internal method used to execute the on time change functionality
     */
    private onTimeChange;
    /**
     * This is an internal method used to maintain a time interval to update the time model when the data value is set to CURRENT_TIME
     */
    private setTimeInterval;
    /**
     * This is an internal method used to clear the time interval created
     */
    private clearTimeInterval;
    /**
     * This function sets the value isOpen/isTimeOpen (i.e when datepicker popup is closed) based on widget type(i.e  DateTime, Time)
     * @param val - isOpen/isTimeOpen is set based on the timepicker popup is open/closed
     */
    private setIsTimeOpen;
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any): void;
    private hideTimepickerDropdown;
    private isValid;
    /**
     * This is an internal method to add css class for dropdown while opening the time dropdown
     */
    onShown(): void;
}
