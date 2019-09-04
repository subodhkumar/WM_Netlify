import { ChangeDetectorRef, Injector } from '@angular/core';
import { AppDefaults } from '@wm/core';
import { BaseDateTimeComponent } from '../base/base-date-time.component';
export declare class DateComponent extends BaseDateTimeComponent {
    private cdRef;
    private appDefaults;
    static initializeProps: void;
    private bsDataValue;
    showdropdownon: string;
    private dateContainerCls;
    private isCurrentDate;
    private isOpen;
    private timeinterval;
    private isEnterPressedOnDateInput;
    private keyEventPlugin;
    private deregisterEventListener;
    readonly timestamp: any;
    readonly displayValue: any;
    datavalue: any;
    protected bsDatePickerDirective: any;
    constructor(inj: Injector, cdRef: ChangeDetectorRef, appDefaults: AppDefaults, evtMngrPlugins: any);
    /**
     * This is an internal method triggered when the date input changes
     */
    onDisplayDateChange($event: any, isNativePicker: any): void;
    private setDataValue;
    onDatePickerOpen(): void;
    onInputBlur($event: any): void;
    private hideDatepickerDropdown;
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any): void;
    /**
     * This is an internal method used to toggle the dropdown of the date widget
     */
    toggleDpDropdown($event: any): void;
    private addBodyClickListener;
    /**
     * This is an internal method triggered when pressing key on the date input
     */
    private onDisplayKeydown;
    /**
     * This is an internal method used to maintain a time interval to update the time model when the data value is set to CURRENT_TIME
     */
    private setTimeInterval;
    /**
     * This is an internal method used to clear the time interval created
     */
    private clearTimeInterval;
    /**
     * This is an internal method triggered when the date selection changes
     */
    onDateChange(newVal: any): void;
}
