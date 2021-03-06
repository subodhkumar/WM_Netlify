import { DatePickerInnerComponent } from 'ngx-bootstrap/datepicker/datepicker-inner.component';
import { AfterViewInit, AfterContentInit, ElementRef, Injector, OnInit } from '@angular/core';
import { IRedrawableComponent } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
export declare class CalendarComponent extends StylableComponent implements AfterContentInit, AfterViewInit, OnInit, IRedrawableComponent {
    static initializeProps: void;
    _calendar: ElementRef;
    _datepicker: ElementRef;
    _datepickerInnerComponent: DatePickerInnerComponent;
    selecteddates: any;
    selecteddata: any;
    currentview: object;
    dataset: any;
    calendartype: any;
    controls: string;
    datavalue: any;
    eventtitle: any;
    eventstart: any;
    eventend: any;
    eventallday: any;
    eventclass: any;
    private eventSources;
    private dataSetEvents;
    private oldData;
    private $fullCalendar;
    private proxyModel;
    private eventData;
    private events;
    private changesStack;
    private invokeOnViewRenderback;
    private calendarOptions;
    mobileCalendar: boolean;
    private view;
    private dayClass;
    selectDate(): void;
    gotoDate(): void;
    gotoNextYear(): void;
    gotoPrevYear(): void;
    /**
     * this function takes the calendar view to the specified month
     * @param monthVal, 1-12 value of month
     */
    gotoMonth(monthVal: any): void;
    gotoNextMonth(): void;
    gotoPrevMonth(): void;
    private rerenderEvents;
    private setSelectedData;
    private eventDrop;
    private select;
    private eventResize;
    private onEventChangeStart;
    private eventClick;
    private eventRender;
    private viewRender;
    private updateCalendarHeaderOptions;
    private calculateHeight;
    private triggerMobileCalendarChange;
    private prepareCalendarEvents;
    private constructCalendarDataset;
    private setLocale;
    constructor(inj: Injector);
    ngOnInit(): void;
    onStyleChange(key: any, nv: any, ov?: any): void;
    onPropertyChange(key: any, nv: any, ov?: any): void;
    getDefaultDate(): Date;
    ngAfterViewInit(): void;
    updateCalendarOptions(operationType: string, argumentKey?: any, argumentValue?: any): void;
    redraw(): void;
    private onValueChange;
    private getDayClass;
    private renderMobileView;
}
