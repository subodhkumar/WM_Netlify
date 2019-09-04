import { Component, ElementRef, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { $watch, getClonedObject, getSessionStorageItem, isMobile } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './calendar.props';
import { getEvaluatedData, provideAsWidgetRef } from '../../../utils/widget-utils';
import { StylableComponent } from '../base/stylable.component';
import { createArrayFrom } from '../../../utils/data-utils';
const DEFAULT_CLS = 'app-calendar';
const dateFormats = ['yyyy-MM-dd', 'yyyy-M-dd', 'M-dd-yyyy', 'MM-dd-yy', 'yyyy, dd MMMM', 'yyyy, MMM dd', 'MM/dd/yyyy', 'M/d/yyyy', 'EEE, dd MMM yyyy', 'EEE MMM dd yyyy', 'EEEE, MMMM dd, yyyy', 'timestamp'];
const defaultHeaderOptions = {
    left: 'prev next today',
    center: 'title',
    right: 'month basicWeek basicDay'
};
const VIEW_TYPES = {
    BASIC: 'basic',
    AGENDA: 'agenda',
    LIST: 'list'
};
const BUTTON_TEXT = {
    YEAR: 'Year',
    MONTH: 'Month',
    WEEK: 'Week',
    DAY: 'Day',
    TODAY: 'Today'
};
const SELECTION_MODES = {
    NONE: 'none',
    SINGLE: 'single',
    MULTIPLE: 'multiple'
};
const NEXT_DAY_THRESHOLD = {
    START: '00:00',
    END: '24:00'
};
const getEventMomentValue = (value, key) => {
    let isDate = false;
    dateFormats.forEach((format) => {
        // moment supports uppercase formats
        if (moment(value, format.toUpperCase(), true).isValid()) {
            isDate = true;
            return false;
        }
    });
    // if the value is date then for end date the value should be end of the day as the calendar is approximating it to the start.
    if (isDate && key === 'end') {
        return moment(value).endOf('day');
    }
    return moment(value);
};
const ɵ0 = getEventMomentValue;
const getUTCDateTime = (dateObj) => {
    dateObj = _.isObject(dateObj) ? dateObj : moment(dateObj);
    const year = dateObj.format('YYYY'), 
    // javascript starts the month count from '0' where as moment returns the human count
    month = dateObj.format('MM') - 1, day = dateObj.format('DD'), hours = dateObj.format('HH'), minutes = dateObj.format('mm'), seconds = dateObj.format('ss');
    return new Date(year, month, day, hours, minutes, seconds);
};
const ɵ1 = getUTCDateTime;
const WIDGET_CONFIG = { widgetType: 'wm-calendar', hostClass: DEFAULT_CLS };
// mobile calendar class names
const multipleEventClass = 'app-calendar-event';
const doubleEventClass = multipleEventClass + ' two';
const singleEventClass = multipleEventClass + ' one';
const dateFormat = 'YYYY/MM/DD';
export class CalendarComponent extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        this.controls = 'navigation, today, year, month, week, day';
        this.eventSources = [];
        this.dataSetEvents = {
            events: []
        };
        this.changesStack = [];
        this.invokeOnViewRenderback = _.debounce(() => this.invokeEventCallback('viewrender', { $view: this.calendarOptions }), 300);
        // calendarOptions to the calendar
        this.calendarOptions = {
            calendar: {
                height: 600,
                eventSources: this.eventSources,
                editable: true,
                locale: getSessionStorageItem('selectedLocale') || 'en',
                selectable: false,
                header: defaultHeaderOptions,
                nextDayThreshold: NEXT_DAY_THRESHOLD,
                views: {
                    month: {
                        eventLimit: 0
                    }
                },
                unselectAuto: false,
                eventDrop: this.eventDrop.bind(this),
                eventResizeStart: this.onEventChangeStart.bind(this),
                eventDragStart: this.onEventChangeStart.bind(this),
                eventResize: this.eventResize.bind(this),
                eventClick: this.eventClick.bind(this),
                select: this.select.bind(this),
                eventRender: this.eventRender.bind(this),
                viewRender: this.viewRender.bind(this)
            }
        };
        this.dayClass = [];
        this.mobileCalendar = isMobile();
        this.eventSources.push(this.dataSetEvents);
    }
    // this function selects the default date given for the calendar
    selectDate() {
        let start, end;
        if (_.isObject(this.datavalue)) {
            start = this.datavalue.start;
            end = this.datavalue.end;
        }
        else {
            start = moment(this.datavalue);
            end = moment(this.datavalue).add(1, 'day').startOf('day');
        }
        this.$fullCalendar.fullCalendar('gotoDate', start); // after selecting the date go to the date.
        this.$fullCalendar.fullCalendar('select', start, end);
    }
    // changes the calendar view to the default date given for the calendar.
    gotoDate() {
        this.$fullCalendar.fullCalendar('gotoDate', moment(this.datavalue));
    }
    // this function takes the calendar view to the a year ahead
    gotoNextYear() {
        this.$fullCalendar.fullCalendar('nextYear');
    }
    // this function takes the calendar view to the a year before
    gotoPrevYear() {
        this.$fullCalendar.fullCalendar('prevYear');
    }
    /**
     * this function takes the calendar view to the specified month
     * @param monthVal, 1-12 value of month
     */
    gotoMonth(monthVal) {
        const presentDay = this.$fullCalendar.fullCalendar('getDate');
        const presentMonthVal = new Date(presentDay).getMonth();
        if (presentMonthVal < monthVal) {
            this.$fullCalendar.fullCalendar('gotoDate', presentDay.add(monthVal - presentMonthVal - 1, 'M'));
        }
        else {
            this.$fullCalendar.fullCalendar('gotoDate', presentDay.subtract(presentMonthVal - monthVal + 1, 'M'));
        }
    }
    // this function takes the calendar view to the a month ahead
    gotoNextMonth() {
        const presentDay = this.$fullCalendar.fullCalendar('getDate');
        this.$fullCalendar.fullCalendar('gotoDate', presentDay.add(1, 'M'));
    }
    // this function takes the calendar view to the a month before
    gotoPrevMonth() {
        const presentDay = this.$fullCalendar.fullCalendar('getDate');
        this.$fullCalendar.fullCalendar('gotoDate', presentDay.subtract(1, 'M'));
    }
    // this function re-renders the events assigned to the calendar.
    rerenderEvents() {
        this.$fullCalendar.fullCalendar('rerenderEvents');
    }
    setSelectedData(start, end) {
        let dataset = this.dataset;
        if (!dataset) {
            return;
        }
        const filteredDates = [];
        const eventStartKey = this.eventstart || 'start';
        const eventEndKey = this.eventend || 'end';
        const startDate = moment(new Date(start)).format('MM/DD/YYYY');
        const endDate = moment(new Date(end)).subtract(1, 'days').format('MM/DD/YYYY');
        dataset = dataset.data || dataset;
        dataset.forEach((value) => {
            if (!value[eventStartKey]) {
                return;
            }
            const eventStartDate = moment(new Date(value[eventStartKey])).format('MM/DD/YYYY');
            const eventEndDate = moment(new Date(value[eventEndKey] || value[eventStartKey])).format('MM/DD/YYYY');
            const eventExists = moment(eventStartDate).isSameOrAfter(startDate) && moment(eventEndDate).isSameOrBefore(endDate);
            if (eventExists) {
                filteredDates.push(value);
            }
        });
        return filteredDates;
    }
    eventDrop($newData, $delta, $revertFunc, $event, $ui, $view) {
        this.invokeEventCallback('eventdrop', { $event, $newData, $oldData: this.oldData, $delta, $revertFunc, $ui, $view });
    }
    select(start, end, jsEvent, $view) {
        this.selecteddates = { start: getUTCDateTime(start), end: getUTCDateTime(end) };
        this.selecteddata = this.setSelectedData(start, end);
        this.invokeEventCallback('select', { $start: start.valueOf(), $end: end.valueOf(), $view, $data: this.selecteddata });
    }
    eventResize($newData, $delta, $revertFunc, $event, $ui, $view) {
        this.invokeEventCallback('eventresize', { $event, $newData, $oldData: this.oldData, $delta, $revertFunc, $ui, $view });
    }
    onEventChangeStart(event) {
        this.oldData = getClonedObject(event);
    }
    eventClick($data, $event, $view) {
        this.invokeEventCallback('eventclick', { $event, $data, $view });
    }
    eventRender($data, $event, $view) {
        if (this.calendartype === VIEW_TYPES.LIST) {
            this.$fullCalendar.find('.fc-list-table').addClass('table');
        }
        this.invokeEventCallback('eventrender', { $event, $data, $view });
    }
    viewRender($view) {
        this.currentview = { start: $view.start.format(), end: $view.end.subtract(1, 'days').format() };
        if (this.calendartype === VIEW_TYPES.LIST) {
            this.$fullCalendar.find('.fc-list-table').addClass('table');
        }
        this.invokeEventCallback('viewrender', { $view });
    }
    // update the calendar header options once the controls changes
    updateCalendarHeaderOptions() {
        const ctrls = this.controls, viewType = this.calendartype, regEx = new RegExp('\\bday\\b', 'g');
        let left = '', right = '';
        if (ctrls && viewType) {
            if (_.includes(ctrls, 'navigation')) {
                left += ' prev next';
            }
            if (_.includes(ctrls, 'today')) {
                left += ' today';
            }
            if (_.includes(ctrls, 'year')) {
                right += (viewType === VIEW_TYPES.LIST) ? 'listYear' : '';
            }
            if (_.includes(ctrls, 'month')) {
                right += (viewType === VIEW_TYPES.LIST) ? ' listMonth' : ' month';
            }
            if (_.includes(ctrls, 'week')) {
                right += (viewType === VIEW_TYPES.BASIC) ? ' basicWeek' : (viewType === VIEW_TYPES.LIST) ? ' listWeek' : ' agendaWeek';
            }
            if (regEx.test(ctrls)) {
                right += (viewType === VIEW_TYPES.BASIC) ? ' basicDay' : (viewType === VIEW_TYPES.LIST) ? ' listDay' : ' agendaDay';
            }
            _.extend(this.calendarOptions.calendar.header, { 'left': left, 'right': right });
        }
    }
    // to calculate the height for the event limit and parsing the value when it is percentage based.
    calculateHeight(height) {
        const $parent = $(this.nativeElement).parent(), elHeight = height || '650px';
        let parentHeight = $parent.css('height'), computedHeight;
        if (_.includes(elHeight, '%')) {
            if (_.includes(parentHeight, '%')) {
                parentHeight = $parent.height();
            }
            computedHeight = (parseInt(parentHeight, 10) * Number(elHeight.replace(/\%/g, ''))) / 100;
        }
        else {
            computedHeight = parseInt(elHeight, 10);
        }
        this.calendarOptions.calendar.views.month.eventLimit = parseInt('' + computedHeight / 200, 10) + 1;
        return computedHeight;
    }
    triggerMobileCalendarChange() {
        this.prepareCalendarEvents();
        // change the model so that the view is rendered again with the events , after the dataset is changed.
        this.proxyModel = this.proxyModel || moment().valueOf();
        this.selecteddates = {
            start: moment(this.proxyModel).valueOf(),
            end: moment(this.proxyModel).endOf('day').valueOf()
        };
        this.invokeEventCallback('eventrender', { $data: this.eventData });
    }
    // prepares events for the mobie calendar
    prepareCalendarEvents() {
        let eventDay, dataset;
        this.eventData = {};
        if (!this.dataset) {
            return;
        }
        dataset = this.dataset;
        dataset = _.isArray(dataset) ? dataset : (_.isObject(dataset) ? [dataset] : []);
        this.events = dataset || this.constructCalendarDataset(dataset);
        this.events.forEach((event) => {
            const eventStart = event.start || event[this.eventstart];
            if (eventStart) {
                eventDay = moment(eventStart).startOf('day').format(dateFormat);
                if (this.eventData[eventDay]) {
                    this.eventData[eventDay].push(event);
                }
                else {
                    this.eventData[eventDay] = [event];
                }
                if (this.mobileCalendar) {
                    // custom class on the date in the date picker.
                    this.dayClass.push({
                        date: new Date(eventStart).setHours(0, 0, 0, 0),
                        mode: 'day',
                        clazz: this.getDayClass({ eventDay: eventDay })
                    });
                }
            }
        });
        // add the eventData on the calendar by calling refreshView
        if (this.mobileCalendar && this._datepickerInnerComponent) {
            this._datepickerInnerComponent.refreshView();
        }
    }
    // constructs the calendar dataset by mapping the eventstart, eventend, eventtitle etc.,
    constructCalendarDataset(eventSource) {
        const properties = {
            title: this.eventtitle || 'title',
            allDay: this.eventallday || 'allday',
            start: this.eventstart || 'start',
            end: this.eventend || 'end',
            className: this.eventclass || 'className'
        };
        eventSource.forEach((obj) => {
            _.mapKeys(properties, (value, key) => {
                let objVal;
                if (key === 'title') {
                    objVal = getEvaluatedData(obj, { expression: value }, this.viewParent);
                }
                else if (key === 'allDay') {
                    objVal = !!_.get(obj, value);
                }
                else {
                    objVal = _.get(obj, value);
                }
                if (!objVal) {
                    return;
                }
                if (key === 'start' || key === 'end') {
                    objVal = getEventMomentValue(objVal, key);
                }
                obj[key] = objVal;
            });
        });
        return eventSource;
    }
    setLocale() {
        const year = _.get(this.appLocale, 'LABEL_CALENDAR_YEAR') || BUTTON_TEXT.YEAR;
        const month = _.get(this.appLocale, 'LABEL_CALENDAR_MONTH') || BUTTON_TEXT.MONTH;
        const week = _.get(this.appLocale, 'LABEL_CALENDAR_WEEK') || BUTTON_TEXT.WEEK;
        const day = _.get(this.appLocale, 'LABEL_CALENDAR_DAY') || BUTTON_TEXT.DAY;
        const today = _.get(this.appLocale, 'LABEL_CALENDAR_TODAY') || BUTTON_TEXT.TODAY;
        this.calendarOptions.calendar.buttonText = { year, month, week, day, today,
            'listYear': year,
            'listMonth': month,
            'listWeek': week,
            'listDay': day
        };
    }
    ngOnInit() {
        super.ngOnInit();
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER, ['height']);
        if (this.mobileCalendar) {
            if (!this.view || this.view === 'week') {
                this.view = 'day';
            }
            this.triggerMobileCalendarChange();
        }
        else {
            this.setLocale();
        }
    }
    onStyleChange(key, nv, ov) {
        super.onStyleChange(key, nv, ov);
        if (key === 'height') {
            this.calendarOptions.calendar.height = this.calculateHeight(nv);
            this.updateCalendarOptions('option', 'height', this.calendarOptions.calendar.height);
        }
    }
    onPropertyChange(key, nv, ov) {
        super.onPropertyChange(key, nv, ov);
        switch (key) {
            case 'selectionmode':
                if (nv !== SELECTION_MODES.NONE) {
                    this.calendarOptions.calendar.selectable = true;
                    this.updateCalendarOptions('option', 'selectable', true);
                    if (nv === SELECTION_MODES.SINGLE) {
                        this.calendarOptions.calendar.selectConstraint = {
                            start: '00:00',
                            end: '24:00'
                        };
                        this.updateCalendarOptions('option', 'selectConstraint', this.calendarOptions.calendar.selectConstraint);
                    }
                    else {
                        this.updateCalendarOptions('option', 'selectConstraint', {});
                    }
                }
                else {
                    this.calendarOptions.calendar.selectable = false;
                    this.updateCalendarOptions('option', 'selectable', false);
                }
                break;
            case 'view':
                if (nv !== 'month' || this.calendartype === VIEW_TYPES.LIST) {
                    this.calendarOptions.calendar.defaultView = this.calendartype + _.capitalize(nv);
                }
                else {
                    this.calendarOptions.calendar.defaultView = nv;
                }
                this.updateCalendarOptions('changeView', this.calendarOptions.calendar.defaultView);
                break;
            case 'calendartype':
                this.calendartype = nv || 'basic';
            case 'controls':
                this.updateCalendarHeaderOptions();
                break;
            case 'dataset':
                let dataSet;
                this.dataset = nv;
                dataSet = createArrayFrom(getClonedObject(nv));
                dataSet = this.constructCalendarDataset(dataSet);
                this.dataSetEvents.events = dataSet.filter((event) => {
                    event.start = event.start || event.end;
                    if (event.start) {
                        return true;
                    }
                });
                if (this.mobileCalendar) {
                    this.triggerMobileCalendarChange();
                }
                else {
                    this.updateCalendarOptions('removeEvents');
                    this.updateCalendarOptions('addEventSource', this.dataSetEvents.events);
                    this.updateCalendarOptions('rerenderEvents');
                }
                break;
        }
    }
    // Returns the default date when the datavalue is provided
    getDefaultDate() {
        if (this.datavalue) {
            return new Date(this.datavalue);
        }
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.mobileCalendar && this._datepicker) {
            let lastActiveDate = this._datepicker.activeDate;
            // renderview when active date changes
            this._datepicker.activeDateChange.subscribe((dt) => {
                const prevYear = lastActiveDate.getYear();
                const prevMonth = lastActiveDate.getMonth();
                const selectedYear = dt.getYear();
                const selectedMonth = dt.getMonth();
                // invoke renderView only when month is changed.
                if (prevMonth !== selectedMonth || prevYear !== selectedYear) {
                    lastActiveDate = dt;
                    this.renderMobileView(dt);
                }
            });
            this._datepickerInnerComponent = this._datepicker._datePicker;
            this.renderMobileView(moment(this.datavalue));
            this.registerDestroyListener($watch('_datepickerInnerComponent.datepickerMode', this, {}, (nv, ov) => {
                if (ov && !_.isEmpty(ov)) {
                    this.invokeOnViewRenderback();
                }
            }));
            return;
        }
        this.$fullCalendar = $(this._calendar.nativeElement);
        this.$fullCalendar.fullCalendar(this.calendarOptions.calendar);
        // if the changes are already stacked before calendar renders then execute them when needed
        if (this.changesStack.length) {
            this.changesStack.forEach((changeObj) => {
                this.$fullCalendar.fullCalendar(changeObj.operationType, changeObj.argumentKey, changeObj.argumentValue);
            });
            this.changesStack.length = 0;
        }
    }
    updateCalendarOptions(operationType, argumentKey, argumentValue) {
        if (!this.$fullCalendar) {
            this.changesStack.push({
                operationType: operationType,
                argumentKey: argumentKey,
                argumentValue: argumentValue
            });
            return;
        }
        this.$fullCalendar.fullCalendar(operationType, argumentKey, argumentValue);
    }
    redraw() {
        this.updateCalendarOptions('render');
    }
    // on date change invoke the select event, and if date has event on it then invoke the event click.
    onValueChange(value) {
        this.proxyModel = value;
        const selectedDate = this.proxyModel && moment(this.proxyModel).startOf('day').format(dateFormat), selectedEventData = this.eventData[selectedDate], start = moment(this.proxyModel), end = moment(this.proxyModel).endOf('day');
        this.selecteddata = selectedEventData;
        this.selecteddates = {
            'start': moment(selectedDate).valueOf(),
            'end': moment(selectedDate).endOf('day').valueOf()
        };
        this.calendarOptions.calendar.select(start.valueOf(), end.valueOf(), {}, this, selectedEventData);
        if (selectedEventData) {
            this.calendarOptions.calendar.eventClick(selectedEventData, {}, this);
        }
    }
    // returns the custom class for the events depending on the length of the events for that day.
    getDayClass(data) {
        const eventDay = data.eventDay;
        if (!_.isEmpty(this.eventData) && this.eventData[eventDay]) {
            const eventsLength = this.eventData[eventDay].length;
            if (eventsLength === 1) {
                return singleEventClass;
            }
            if (eventsLength === 2) {
                return doubleEventClass;
            }
            return multipleEventClass;
        }
        return '';
    }
    // sets the current view and invokes the viewrender method.
    renderMobileView(viewObj) {
        let startDate, endDate;
        if (!viewObj) {
            return;
        }
        startDate = moment(viewObj).startOf('month').valueOf();
        endDate = moment(viewObj).endOf('month').valueOf();
        this.currentview = { start: startDate, end: endDate };
        this.invokeOnViewRenderback();
    }
}
CalendarComponent.initializeProps = registerProps();
CalendarComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmCalendar]',
                template: "<div *ngIf=\"!mobileCalendar\" #calendar></div>\n\n<datepicker *ngIf=\"mobileCalendar\" #datepicker [(ngModel)]=\"proxyModel\"\n            [initDate]=\"getDefaultDate()\"\n            [minDate]=\"minDate\"\n            [datepickerMode]=\"view\"\n            [showWeeks]=\"false\"\n            [customClass]=\"dayClass\"\n            (selectionDone)=\"onValueChange($event)\">\n</datepicker>\n\n\n\n",
                providers: [
                    provideAsWidgetRef(CalendarComponent)
                ],
                encapsulation: ViewEncapsulation.None,
                styles: ["/*!\n * FullCalendar v3.10.0\n * Docs & License: https://fullcalendar.io/\n * (c) 2018 Adam Shaw\n */.fc{direction:ltr;text-align:left}.fc-rtl{text-align:right}body .fc{font-size:1em}.fc-highlight{background:#bce8f1;opacity:.3}.fc-bgevent{background:#8fdf82;opacity:.3}.fc-nonbusiness{background:#d7d7d7}.fc button{box-sizing:border-box;margin:0;height:2.1em;padding:0 .6em;font-size:1em;white-space:nowrap;cursor:pointer}.fc button::-moz-focus-inner{margin:0;padding:0}.fc-state-default{border:1px solid;background-color:#f5f5f5;background-image:linear-gradient(to bottom,#fff,#e6e6e6);background-repeat:repeat-x;border-color:rgba(0,0,0,.1) rgba(0,0,0,.1) rgba(0,0,0,.25);color:#333;text-shadow:0 1px 1px rgba(255,255,255,.75);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 1px 2px rgba(0,0,0,.05)}.fc-state-default.fc-corner-left{border-top-left-radius:4px;border-bottom-left-radius:4px}.fc-state-default.fc-corner-right{border-top-right-radius:4px;border-bottom-right-radius:4px}.fc button .fc-icon{position:relative;top:-.05em;margin:0 .2em;vertical-align:middle}.fc-state-active,.fc-state-disabled,.fc-state-down,.fc-state-hover{color:#333;background-color:#e6e6e6}.fc-state-hover{color:#333;text-decoration:none;background-position:0 -15px;transition:background-position .1s linear}.fc-state-active,.fc-state-down{background-color:#ccc;background-image:none;box-shadow:inset 0 2px 4px rgba(0,0,0,.15),0 1px 2px rgba(0,0,0,.05)}.fc-state-disabled{cursor:default;background-image:none;opacity:.65;box-shadow:none}.fc-button-group{display:inline-block}.fc .fc-button-group>*{float:left;margin:0 0 0 -1px}.fc .fc-button-group>:first-child{margin-left:0}.fc-popover{position:absolute;box-shadow:0 2px 6px rgba(0,0,0,.15)}.fc-popover .fc-header{padding:2px 4px}.fc-popover .fc-header .fc-title{margin:0 2px}.fc-popover .fc-header .fc-close{cursor:pointer}.fc-ltr .fc-popover .fc-header .fc-title,.fc-rtl .fc-popover .fc-header .fc-close{float:left}.fc-ltr .fc-popover .fc-header .fc-close,.fc-rtl .fc-popover .fc-header .fc-title{float:right}.fc-divider{border-style:solid;border-width:1px}hr.fc-divider{height:0;margin:0;padding:0 0 2px;border-width:1px 0}.fc-clear{clear:both}.fc-bg,.fc-bgevent-skeleton,.fc-helper-skeleton,.fc-highlight-skeleton{position:absolute;top:0;left:0;right:0}.fc-bg{bottom:0}.fc-bg table{height:100%}.fc table{width:100%;box-sizing:border-box;table-layout:fixed;border-collapse:collapse;border-spacing:0;font-size:1em}.fc th{text-align:center}.fc td,.fc th{border-style:solid;border-width:1px;padding:0;vertical-align:top}.fc td.fc-today{border-style:double}a[data-goto]{cursor:pointer}a[data-goto]:hover{text-decoration:underline}.fc .fc-row{border-style:solid;border-width:0}.fc-row table{border-left:0 hidden transparent;border-right:0 hidden transparent;border-bottom:0 hidden transparent}.fc-row:first-child table{border-top:0 hidden transparent}.fc-row{position:relative}.fc-row .fc-bg{z-index:1}.fc-row .fc-bgevent-skeleton,.fc-row .fc-highlight-skeleton{bottom:0}.fc-row .fc-bgevent-skeleton table,.fc-row .fc-highlight-skeleton table{height:100%}.fc-row .fc-bgevent-skeleton td,.fc-row .fc-highlight-skeleton td{border-color:transparent}.fc-row .fc-bgevent-skeleton{z-index:2}.fc-row .fc-highlight-skeleton{z-index:3}.fc-row .fc-content-skeleton{position:relative;z-index:4;padding-bottom:2px}.fc-row .fc-helper-skeleton{z-index:5}.fc .fc-row .fc-content-skeleton table,.fc .fc-row .fc-content-skeleton td,.fc .fc-row .fc-helper-skeleton td{background:0 0;border-color:transparent}.fc-row .fc-content-skeleton td,.fc-row .fc-helper-skeleton td{border-bottom:0}.fc-row .fc-content-skeleton tbody td,.fc-row .fc-helper-skeleton tbody td{border-top:0}.fc-scroller{-webkit-overflow-scrolling:touch}.fc-scroller>.fc-day-grid,.fc-scroller>.fc-time-grid{position:relative;width:100%}.fc-event{position:relative;display:block;font-size:.85em;line-height:1.3;border-radius:3px;border:1px solid #3a87ad}.fc-event,.fc-event-dot{background-color:#3a87ad}.fc-event,.fc-event:hover{color:#fff;text-decoration:none}.fc-event.fc-draggable,.fc-event[href]{cursor:pointer}.fc-not-allowed,.fc-not-allowed .fc-event{cursor:not-allowed}.fc-event .fc-bg{z-index:1;background:#fff;opacity:.25}.fc-event .fc-content{position:relative;z-index:2}.fc-event .fc-resizer{position:absolute;z-index:4;display:none}.fc-event.fc-allow-mouse-resize .fc-resizer,.fc-event.fc-selected .fc-resizer{display:block}.fc-event.fc-selected .fc-resizer:before{content:\"\";position:absolute;z-index:9999;top:50%;left:50%;width:40px;height:40px;margin-left:-20px;margin-top:-20px}.fc-event.fc-selected{z-index:9999!important;box-shadow:0 2px 5px rgba(0,0,0,.2)}.fc-event.fc-selected.fc-dragging{box-shadow:0 2px 7px rgba(0,0,0,.3)}.fc-h-event.fc-selected:before{content:\"\";position:absolute;z-index:3;top:-10px;bottom:-10px;left:0;right:0}.fc-ltr .fc-h-event.fc-not-start,.fc-rtl .fc-h-event.fc-not-end{margin-left:0;border-left-width:0;padding-left:1px;border-top-left-radius:0;border-bottom-left-radius:0}.fc-ltr .fc-h-event.fc-not-end,.fc-rtl .fc-h-event.fc-not-start{margin-right:0;border-right-width:0;padding-right:1px;border-top-right-radius:0;border-bottom-right-radius:0}.fc-ltr .fc-h-event .fc-start-resizer,.fc-rtl .fc-h-event .fc-end-resizer{cursor:w-resize;left:-1px}.fc-ltr .fc-h-event .fc-end-resizer,.fc-rtl .fc-h-event .fc-start-resizer{cursor:e-resize;right:-1px}.fc-h-event.fc-allow-mouse-resize .fc-resizer{width:7px;top:-1px;bottom:-1px}.fc-h-event.fc-selected .fc-resizer{border-radius:4px;width:6px;height:6px;background:#fff;top:50%;margin-top:-4px;border:1px solid;border-color:inherit}.fc-ltr .fc-h-event.fc-selected .fc-start-resizer,.fc-rtl .fc-h-event.fc-selected .fc-end-resizer{margin-left:-4px}.fc-ltr .fc-h-event.fc-selected .fc-end-resizer,.fc-rtl .fc-h-event.fc-selected .fc-start-resizer{margin-right:-4px}.fc-day-grid-event{margin:1px 2px 0;padding:0 1px}tr:first-child>td>.fc-day-grid-event{margin-top:2px}.fc-day-grid-event.fc-selected:after{content:\"\";position:absolute;z-index:1;top:-1px;right:-1px;bottom:-1px;left:-1px;background:#000;opacity:.25}.fc-day-grid-event .fc-content{white-space:nowrap;overflow:hidden}.fc-day-grid-event .fc-time{font-weight:700}.fc-ltr .fc-day-grid-event.fc-allow-mouse-resize .fc-start-resizer,.fc-rtl .fc-day-grid-event.fc-allow-mouse-resize .fc-end-resizer{margin-left:-2px}.fc-ltr .fc-day-grid-event.fc-allow-mouse-resize .fc-end-resizer,.fc-rtl .fc-day-grid-event.fc-allow-mouse-resize .fc-start-resizer{margin-right:-2px}a.fc-more{margin:1px 3px;font-size:.85em;cursor:pointer;text-decoration:none}a.fc-more:hover{text-decoration:underline}.fc-limited{display:none}.fc-day-grid .fc-row{z-index:1}.fc-more-popover{z-index:2;width:220px}.fc-more-popover .fc-event-container{padding:10px}.fc-now-indicator{position:absolute;border:0 solid red}.fc-unselectable{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}.fc-unthemed .fc-content,.fc-unthemed .fc-divider,.fc-unthemed .fc-list-heading td,.fc-unthemed .fc-list-view,.fc-unthemed .fc-popover,.fc-unthemed .fc-row,.fc-unthemed tbody,.fc-unthemed td,.fc-unthemed th,.fc-unthemed thead{border-color:#ddd}.fc-unthemed .fc-popover{background-color:#fff;border-width:1px;border-style:solid}.fc-unthemed .fc-divider,.fc-unthemed .fc-list-heading td,.fc-unthemed .fc-popover .fc-header{background:#eee}.fc-unthemed .fc-popover .fc-header .fc-close{color:#666;font-size:.9em;margin-top:2px}.fc-unthemed td.fc-today{background:#fcf8e3}.fc-unthemed .fc-disabled-day{background:#d7d7d7;opacity:.3}.fc-icon{display:inline-block;height:1em;line-height:1em;font-size:1em;text-align:center;overflow:hidden;font-family:\"Courier New\",Courier,monospace;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.fc-icon:after{position:relative}.fc-icon-left-single-arrow:after{content:\"\\2039\";font-weight:700;font-size:200%;top:-7%}.fc-icon-right-single-arrow:after{content:\"\\203A\";font-weight:700;font-size:200%;top:-7%}.fc-icon-left-double-arrow:after{content:\"\\AB\";font-size:160%;top:-7%}.fc-icon-right-double-arrow:after{content:\"\\BB\";font-size:160%;top:-7%}.fc-icon-left-triangle:after{content:\"\\25C4\";font-size:125%;top:3%}.fc-icon-right-triangle:after{content:\"\\25BA\";font-size:125%;top:3%}.fc-icon-down-triangle:after{content:\"\\25BC\";font-size:125%;top:2%}.fc-icon-x:after{content:\"\\D7\";font-size:200%;top:6%}.fc-unthemed .fc-list-item:hover td{background-color:#f5f5f5}.ui-widget .fc-disabled-day{background-image:none}.fc-popover>.ui-widget-header+.ui-widget-content{border-top:0}.ui-widget .fc-event{color:#fff;text-decoration:none;font-weight:400}.ui-widget td.fc-axis{font-weight:400}.fc-time-grid .fc-slats .ui-widget-content{background:0 0}.fc.fc-bootstrap3 a{text-decoration:none}.fc.fc-bootstrap3 a[data-goto]:hover{text-decoration:underline}.fc-bootstrap3 hr.fc-divider{border-color:inherit}.fc-bootstrap3 .fc-today.alert{border-radius:0}.fc-bootstrap3 .fc-popover .panel-body{padding:0}.fc-bootstrap3 .fc-time-grid .fc-slats table{background:0 0}.fc.fc-bootstrap4 a{text-decoration:none}.fc.fc-bootstrap4 a[data-goto]:hover{text-decoration:underline}.fc-bootstrap4 hr.fc-divider{border-color:inherit}.fc-bootstrap4 .fc-today.alert{border-radius:0}.fc-bootstrap4 a.fc-event:not([href]):not([tabindex]){color:#fff}.fc-bootstrap4 .fc-popover.card{position:absolute}.fc-bootstrap4 .fc-popover .card-body{padding:0}.fc-bootstrap4 .fc-time-grid .fc-slats table{background:0 0}.fc-toolbar{text-align:center}.fc-toolbar.fc-header-toolbar{margin-bottom:1em}.fc-toolbar.fc-footer-toolbar{margin-top:1em}.fc-toolbar .fc-left{float:left}.fc-toolbar .fc-right{float:right}.fc-toolbar .fc-center{display:inline-block}.fc .fc-toolbar>*>*{float:left;margin-left:.75em}.fc .fc-toolbar>*>:first-child{margin-left:0}.fc-toolbar h2{margin:0}.fc-toolbar button{position:relative}.fc-toolbar .fc-state-hover,.fc-toolbar .ui-state-hover{z-index:2}.fc-toolbar .fc-state-down{z-index:3}.fc-toolbar .fc-state-active,.fc-toolbar .ui-state-active{z-index:4}.fc-toolbar button:focus{z-index:5}.fc-view-container *,.fc-view-container :after,.fc-view-container :before{box-sizing:content-box}.fc-view,.fc-view>table{position:relative;z-index:1}.fc-basicDay-view .fc-content-skeleton,.fc-basicWeek-view .fc-content-skeleton{padding-bottom:1em}.fc-basic-view .fc-body .fc-row{min-height:4em}.fc-row.fc-rigid{overflow:hidden}.fc-row.fc-rigid .fc-content-skeleton{position:absolute;top:0;left:0;right:0}.fc-day-top.fc-other-month{opacity:.3}.fc-basic-view .fc-day-number,.fc-basic-view .fc-week-number{padding:2px}.fc-basic-view th.fc-day-number,.fc-basic-view th.fc-week-number{padding:0 2px}.fc-ltr .fc-basic-view .fc-day-top .fc-day-number{float:right}.fc-rtl .fc-basic-view .fc-day-top .fc-day-number{float:left}.fc-ltr .fc-basic-view .fc-day-top .fc-week-number{float:left;border-radius:0 0 3px}.fc-rtl .fc-basic-view .fc-day-top .fc-week-number{float:right;border-radius:0 0 0 3px}.fc-basic-view .fc-day-top .fc-week-number{min-width:1.5em;text-align:center;background-color:#f2f2f2;color:grey}.fc-basic-view td.fc-week-number{text-align:center}.fc-basic-view td.fc-week-number>*{display:inline-block;min-width:1.25em}.fc-agenda-view .fc-day-grid{position:relative;z-index:2}.fc-agenda-view .fc-day-grid .fc-row{min-height:3em}.fc-agenda-view .fc-day-grid .fc-row .fc-content-skeleton{padding-bottom:1em}.fc .fc-axis{vertical-align:middle;padding:0 4px;white-space:nowrap}.fc-ltr .fc-axis{text-align:right}.fc-rtl .fc-axis{text-align:left}.fc-time-grid,.fc-time-grid-container{position:relative;z-index:1}.fc-time-grid{min-height:100%}.fc-time-grid table{border:0 hidden transparent}.fc-time-grid>.fc-bg{z-index:1}.fc-time-grid .fc-slats,.fc-time-grid>hr{position:relative;z-index:2}.fc-time-grid .fc-content-col{position:relative}.fc-time-grid .fc-content-skeleton{position:absolute;z-index:3;top:0;left:0;right:0}.fc-time-grid .fc-business-container{position:relative;z-index:1}.fc-time-grid .fc-bgevent-container{position:relative;z-index:2}.fc-time-grid .fc-highlight-container{z-index:3;position:relative}.fc-time-grid .fc-event-container{position:relative;z-index:4}.fc-time-grid .fc-now-indicator-line{z-index:5}.fc-time-grid .fc-helper-container{position:relative;z-index:6}.fc-time-grid .fc-slats td{height:1.5em;border-bottom:0}.fc-time-grid .fc-slats .fc-minor td{border-top-style:dotted}.fc-time-grid .fc-highlight{position:absolute;left:0;right:0}.fc-ltr .fc-time-grid .fc-event-container{margin:0 2.5% 0 2px}.fc-rtl .fc-time-grid .fc-event-container{margin:0 2px 0 2.5%}.fc-time-grid .fc-bgevent,.fc-time-grid .fc-event{position:absolute;z-index:1}.fc-time-grid .fc-bgevent{left:0;right:0}.fc-v-event.fc-not-start{border-top-width:0;padding-top:1px;border-top-left-radius:0;border-top-right-radius:0}.fc-v-event.fc-not-end{border-bottom-width:0;padding-bottom:1px;border-bottom-left-radius:0;border-bottom-right-radius:0}.fc-time-grid-event{overflow:hidden}.fc-time-grid-event.fc-selected{overflow:visible}.fc-time-grid-event.fc-selected .fc-bg{display:none}.fc-time-grid-event .fc-content{overflow:hidden}.fc-time-grid-event .fc-time,.fc-time-grid-event .fc-title{padding:0 1px}.fc-time-grid-event .fc-time{font-size:.85em;white-space:nowrap}.fc-time-grid-event.fc-short .fc-content{white-space:nowrap}.fc-time-grid-event.fc-short .fc-time,.fc-time-grid-event.fc-short .fc-title{display:inline-block;vertical-align:top}.fc-time-grid-event.fc-short .fc-time span{display:none}.fc-time-grid-event.fc-short .fc-time:before{content:attr(data-start)}.fc-time-grid-event.fc-short .fc-time:after{content:\"\\A0-\\A0\"}.fc-time-grid-event.fc-short .fc-title{font-size:.85em;padding:0}.fc-time-grid-event.fc-allow-mouse-resize .fc-resizer{left:0;right:0;bottom:0;height:8px;overflow:hidden;line-height:8px;font-size:11px;font-family:monospace;text-align:center;cursor:s-resize}.fc-time-grid-event.fc-allow-mouse-resize .fc-resizer:after{content:\"=\"}.fc-time-grid-event.fc-selected .fc-resizer{border-radius:5px;width:8px;height:8px;background:#fff;left:50%;margin-left:-5px;bottom:-5px;border:1px solid;border-color:inherit}.fc-time-grid .fc-now-indicator-line{border-top-width:1px;left:0;right:0}.fc-time-grid .fc-now-indicator-arrow{margin-top:-5px}.fc-ltr .fc-time-grid .fc-now-indicator-arrow{left:0;border-width:5px 0 5px 6px;border-top-color:transparent;border-bottom-color:transparent}.fc-rtl .fc-time-grid .fc-now-indicator-arrow{right:0;border-width:5px 6px 5px 0;border-top-color:transparent;border-bottom-color:transparent}.fc-event-dot{display:inline-block;width:10px;height:10px;border-radius:5px}.fc-rtl .fc-list-view{direction:rtl}.fc-list-view{border-width:1px;border-style:solid}.fc .fc-list-table{table-layout:auto}.fc-list-table td{border-width:1px 0 0;padding:8px 14px}.fc-list-table tr:first-child td{border-top-width:0}.fc-list-heading{border-bottom-width:1px}.fc-list-heading td{font-weight:700}.fc-ltr .fc-list-heading-main{float:left}.fc-ltr .fc-list-heading-alt,.fc-rtl .fc-list-heading-main{float:right}.fc-rtl .fc-list-heading-alt{float:left}.fc-list-item.fc-has-url{cursor:pointer}.fc-list-item-marker,.fc-list-item-time{white-space:nowrap;width:1px}.fc-ltr .fc-list-item-marker{padding-right:0}.fc-rtl .fc-list-item-marker{padding-left:0}.fc-list-item-title a{text-decoration:none;color:inherit}.fc-list-item-title a[href]:hover{text-decoration:underline}.fc-list-empty-wrap2{position:absolute;top:0;left:0;right:0;bottom:0}.fc-list-empty-wrap1{width:100%;height:100%;display:table}.fc-list-empty{display:table-cell;vertical-align:middle;text-align:center}.fc-unthemed .fc-list-empty{background-color:#eee}"]
            }] }
];
/** @nocollapse */
CalendarComponent.ctorParameters = () => [
    { type: Injector }
];
CalendarComponent.propDecorators = {
    _calendar: [{ type: ViewChild, args: ['calendar',] }],
    _datepicker: [{ type: ViewChild, args: ['datepicker',] }]
};
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jYWxlbmRhci9jYWxlbmRhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFtQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBVSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdkksT0FBTyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUscUJBQXFCLEVBQUUsUUFBUSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXBGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVuRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDbkYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBSTVELE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQztBQUNuQyxNQUFNLFdBQVcsR0FBRyxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDL00sTUFBTSxvQkFBb0IsR0FBRztJQUN6QixJQUFJLEVBQUUsaUJBQWlCO0lBQ3ZCLE1BQU0sRUFBRSxPQUFPO0lBQ2YsS0FBSyxFQUFFLDBCQUEwQjtDQUNwQyxDQUFDO0FBQ0YsTUFBTSxVQUFVLEdBQUc7SUFDZixLQUFLLEVBQUUsT0FBTztJQUNkLE1BQU0s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QUUsQ0FBQztRQUNuRCxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDbEMsQ0FBQzs7QUE1aEJNLGlDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBVjVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsY0FBYztnQkFDeEIsMlpBQXdDO2dCQUV4QyxTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsaUJBQWlCLENBQUM7aUJBQ3hDO2dCQUNELGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJOzthQUN4Qzs7OztZQXJGZ0UsUUFBUTs7O3dCQXlGcEUsU0FBUyxTQUFDLFVBQVU7MEJBQ3BCLFNBQVMsU0FBQyxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0ZVBpY2tlcklubmVyQ29tcG9uZW50IH0gZnJvbSAnbmd4LWJvb3RzdHJhcC9kYXRlcGlja2VyL2RhdGVwaWNrZXItaW5uZXIuY29tcG9uZW50JztcblxuaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgQWZ0ZXJDb250ZW50SW5pdCwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3RvciwgT25Jbml0LCBWaWV3Q2hpbGQsIFZpZXdFbmNhcHN1bGF0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7ICR3YXRjaCwgZ2V0Q2xvbmVkT2JqZWN0LCBnZXRTZXNzaW9uU3RvcmFnZUl0ZW0sIGlzTW9iaWxlIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJUmVkcmF3YWJsZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9jYWxlbmRhci5wcm9wcyc7XG5pbXBvcnQgeyBnZXRFdmFsdWF0ZWREYXRhLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBjcmVhdGVBcnJheUZyb20gfSBmcm9tICcuLi8uLi8uLi91dGlscy9kYXRhLXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfLCAkLCBtb21lbnQ7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1jYWxlbmRhcic7XG5jb25zdCBkYXRlRm9ybWF0cyA9IFsneXl5eS1NTS1kZCcsICd5eXl5LU0tZGQnLCAnTS1kZC15eXl5JywgJ01NLWRkLXl5JywgJ3l5eXksIGRkIE1NTU0nLCAneXl5eSwgTU1NIGRkJywgJ01NL2RkL3l5eXknLCAnTS9kL3l5eXknLCAnRUVFLCBkZCBNTU0geXl5eScsICdFRUUgTU1NIGRkIHl5eXknLCAnRUVFRSwgTU1NTSBkZCwgeXl5eScsICd0aW1lc3RhbXAnXTtcbmNvbnN0IGRlZmF1bHRIZWFkZXJPcHRpb25zID0ge1xuICAgIGxlZnQ6ICdwcmV2IG5leHQgdG9kYXknLFxuICAgIGNlbnRlcjogJ3RpdGxlJyxcbiAgICByaWdodDogJ21vbnRoIGJhc2ljV2VlayBiYXNpY0RheSdcbn07XG5jb25zdCBWSUVXX1RZUEVTID0ge1xuICAgIEJBU0lDOiAnYmFzaWMnLFxuICAgIEFHRU5EQTogJ2FnZW5kYScsXG4gICAgTElTVDogJ2xpc3QnXG59O1xuY29uc3QgQlVUVE9OX1RFWFQgPSB7XG4gICAgWUVBUjogJ1llYXInLFxuICAgIE1PTlRIOiAnTW9udGgnLFxuICAgIFdFRUs6ICdXZWVrJyxcbiAgICBEQVk6ICdEYXknLFxuICAgIFRPREFZOiAnVG9kYXknXG59O1xuY29uc3QgU0VMRUNUSU9OX01PREVTID0ge1xuICAgIE5PTkU6ICdub25lJyxcbiAgICBTSU5HTEU6ICdzaW5nbGUnLFxuICAgIE1VTFRJUExFOiAnbXVsdGlwbGUnXG59O1xuY29uc3QgTkVYVF9EQVlfVEhSRVNIT0xEID0ge1xuICAgIFNUQVJUOiAnMDA6MDAnLFxuICAgIEVORDogJzI0OjAwJ1xufTtcbmNvbnN0IGdldEV2ZW50TW9tZW50VmFsdWUgPSAodmFsdWUsIGtleSkgPT4ge1xuICAgIGxldCBpc0RhdGUgPSBmYWxzZTtcblxuICAgIGRhdGVGb3JtYXRzLmZvckVhY2goKGZvcm1hdCkgPT4ge1xuICAgICAgICAvLyBtb21lbnQgc3VwcG9ydHMgdXBwZXJjYXNlIGZvcm1hdHNcbiAgICAgICAgaWYgKG1vbWVudCh2YWx1ZSwgZm9ybWF0LnRvVXBwZXJDYXNlKCksIHRydWUpLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgaXNEYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gaWYgdGhlIHZhbHVlIGlzIGRhdGUgdGhlbiBmb3IgZW5kIGRhdGUgdGhlIHZhbHVlIHNob3VsZCBiZSBlbmQgb2YgdGhlIGRheSBhcyB0aGUgY2FsZW5kYXIgaXMgYXBwcm94aW1hdGluZyBpdCB0byB0aGUgc3RhcnQuXG4gICAgaWYgKGlzRGF0ZSAmJiBrZXkgPT09ICdlbmQnKSB7XG4gICAgICAgIHJldHVybiBtb21lbnQodmFsdWUpLmVuZE9mKCdkYXknKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbW9tZW50KHZhbHVlKTtcbn07XG5jb25zdCBnZXRVVENEYXRlVGltZSA9IChkYXRlT2JqKSA9PiB7XG4gICAgZGF0ZU9iaiA9IF8uaXNPYmplY3QoZGF0ZU9iaikgPyBkYXRlT2JqIDogbW9tZW50KGRhdGVPYmopO1xuICAgIGNvbnN0IHllYXIgPSBkYXRlT2JqLmZvcm1hdCgnWVlZWScpLFxuICAgICAgICAvLyBqYXZhc2NyaXB0IHN0YXJ0cyB0aGUgbW9udGggY291bnQgZnJvbSAnMCcgd2hlcmUgYXMgbW9tZW50IHJldHVybnMgdGhlIGh1bWFuIGNvdW50XG4gICAgICAgIG1vbnRoID0gZGF0ZU9iai5mb3JtYXQoJ01NJykgLSAxLFxuICAgICAgICBkYXkgPSBkYXRlT2JqLmZvcm1hdCgnREQnKSxcbiAgICAgICAgaG91cnMgPSBkYXRlT2JqLmZvcm1hdCgnSEgnKSxcbiAgICAgICAgbWludXRlcyA9IGRhdGVPYmouZm9ybWF0KCdtbScpLFxuICAgICAgICBzZWNvbmRzID0gZGF0ZU9iai5mb3JtYXQoJ3NzJyk7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXksIGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzKTtcbn07XG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1jYWxlbmRhcicsIGhvc3RDbGFzczogREVGQVVMVF9DTFN9O1xuLy8gbW9iaWxlIGNhbGVuZGFyIGNsYXNzIG5hbWVzXG5jb25zdCBtdWx0aXBsZUV2ZW50Q2xhc3MgPSAnYXBwLWNhbGVuZGFyLWV2ZW50JztcbmNvbnN0IGRvdWJsZUV2ZW50Q2xhc3MgPSBtdWx0aXBsZUV2ZW50Q2xhc3MgKyAnIHR3byc7XG5jb25zdCBzaW5nbGVFdmVudENsYXNzID0gbXVsdGlwbGVFdmVudENsYXNzICsgJyBvbmUnO1xuY29uc3QgZGF0ZUZvcm1hdCA9ICdZWVlZL01NL0REJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21DYWxlbmRhcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9jYWxlbmRhci5jb21wb25lbnQuaHRtbCcsXG4gICAgc3R5bGVVcmxzOiBbJy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9mdWxsY2FsZW5kYXIvZGlzdC9mdWxsY2FsZW5kYXIuY3NzJ10sXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihDYWxlbmRhckNvbXBvbmVudClcbiAgICBdLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQ2FsZW5kYXJDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIEFmdGVyVmlld0luaXQsIE9uSW5pdCwgSVJlZHJhd2FibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG4gICAgLy8gVGhlIGNhbGVuZGFyIGVsZW1lbnQgcmVmZXJlbmNlXG4gICAgQFZpZXdDaGlsZCgnY2FsZW5kYXInKSBfY2FsZW5kYXI6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZCgnZGF0ZXBpY2tlcicpIF9kYXRlcGlja2VyOiBFbGVtZW50UmVmO1xuXG4gICAgcHVibGljIF9kYXRlcGlja2VySW5uZXJDb21wb25lbnQ6IERhdGVQaWNrZXJJbm5lckNvbXBvbmVudDtcblxuICAgIHB1YmxpYyBzZWxlY3RlZGRhdGVzOiBhbnk7XG4gICAgcHVibGljIHNlbGVjdGVkZGF0YTogYW55O1xuICAgIHB1YmxpYyBjdXJyZW50dmlldzogb2JqZWN0O1xuICAgIHB1YmxpYyBkYXRhc2V0OiBhbnk7XG4gICAgcHVibGljIGNhbGVuZGFydHlwZTtcbiAgICBwdWJsaWMgY29udHJvbHMgPSAnbmF2aWdhdGlvbiwgdG9kYXksIHllYXIsIG1vbnRoLCB3ZWVrLCBkYXknO1xuICAgIHB1YmxpYyBkYXRhdmFsdWU7XG4gICAgcHVibGljIGV2ZW50dGl0bGU7XG4gICAgcHVibGljIGV2ZW50c3RhcnQ7XG4gICAgcHVibGljIGV2ZW50ZW5kO1xuICAgIHB1YmxpYyBldmVudGFsbGRheTtcbiAgICBwdWJsaWMgZXZlbnRjbGFzcztcblxuICAgIHByaXZhdGUgZXZlbnRTb3VyY2VzOiBBcnJheTxhbnk+ID0gW107XG5cbiAgICBwcml2YXRlIGRhdGFTZXRFdmVudHMgPSB7XG4gICAgICAgIGV2ZW50czogW11cbiAgICB9O1xuICAgIHByaXZhdGUgb2xkRGF0YTtcbiAgICAvLyBtYXAgdGhlIGZ1bGxjYWxlbmRhciBFbGVtZW50IHJlbmRlcmVkXG4gICAgcHJpdmF0ZSAkZnVsbENhbGVuZGFyO1xuICAgIC8vIG1vZGVsIHRvIHRoZSBtb2JpbGUgY2FsZW5kYXJcbiAgICBwcml2YXRlIHByb3h5TW9kZWw7XG4gICAgcHJpdmF0ZSBldmVudERhdGE7XG4gICAgcHJpdmF0ZSBldmVudHM7XG4gICAgcHJpdmF0ZSBjaGFuZ2VzU3RhY2sgPSBbXTtcbiAgICBwcml2YXRlIGludm9rZU9uVmlld1JlbmRlcmJhY2sgPSBfLmRlYm91bmNlKCgpID0+IHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygndmlld3JlbmRlcicsIHsgJHZpZXc6IHRoaXMuY2FsZW5kYXJPcHRpb25zIH0pLCAzMDApO1xuXG4gICAgLy8gY2FsZW5kYXJPcHRpb25zIHRvIHRoZSBjYWxlbmRhclxuICAgIHByaXZhdGUgY2FsZW5kYXJPcHRpb25zOiBhbnkgPSB7XG4gICAgICAgIGNhbGVuZGFyOiB7XG4gICAgICAgICAgICBoZWlnaHQ6IDYwMCxcbiAgICAgICAgICAgIGV2ZW50U291cmNlczogdGhpcy5ldmVudFNvdXJjZXMsXG4gICAgICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGxvY2FsZTogZ2V0U2Vzc2lvblN0b3JhZ2VJdGVtKCdzZWxlY3RlZExvY2FsZScpIHx8ICdlbicsXG4gICAgICAgICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGhlYWRlcjogZGVmYXVsdEhlYWRlck9wdGlvbnMsXG4gICAgICAgICAgICBuZXh0RGF5VGhyZXNob2xkOiBORVhUX0RBWV9USFJFU0hPTEQsXG4gICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgIG1vbnRoOiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TGltaXQ6IDBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5zZWxlY3RBdXRvOiBmYWxzZSxcbiAgICAgICAgICAgIGV2ZW50RHJvcDogdGhpcy5ldmVudERyb3AuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGV2ZW50UmVzaXplU3RhcnQ6IHRoaXMub25FdmVudENoYW5nZVN0YXJ0LmJpbmQodGhpcyksXG4gICAgICAgICAgICBldmVudERyYWdTdGFydDogdGhpcy5vbkV2ZW50Q2hhbmdlU3RhcnQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGV2ZW50UmVzaXplOiB0aGlzLmV2ZW50UmVzaXplLmJpbmQodGhpcyksXG4gICAgICAgICAgICBldmVudENsaWNrOiB0aGlzLmV2ZW50Q2xpY2suYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHNlbGVjdDogdGhpcy5zZWxlY3QuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGV2ZW50UmVuZGVyOiB0aGlzLmV2ZW50UmVuZGVyLmJpbmQodGhpcyksXG4gICAgICAgICAgICB2aWV3UmVuZGVyOiB0aGlzLnZpZXdSZW5kZXIuYmluZCh0aGlzKVxuICAgICAgICB9XG4gICAgfTtcbiAgICBwdWJsaWMgbW9iaWxlQ2FsZW5kYXI6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSB2aWV3OiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBkYXlDbGFzczogQXJyYXk8YW55PiA9IFtdO1xuXG4gICAgLy8gdGhpcyBmdW5jdGlvbiBzZWxlY3RzIHRoZSBkZWZhdWx0IGRhdGUgZ2l2ZW4gZm9yIHRoZSBjYWxlbmRhclxuICAgIHNlbGVjdERhdGUoKSB7XG4gICAgICAgIGxldCBzdGFydCwgZW5kO1xuICAgICAgICBpZiAoXy5pc09iamVjdCh0aGlzLmRhdGF2YWx1ZSkpIHtcbiAgICAgICAgICAgIHN0YXJ0ID0gdGhpcy5kYXRhdmFsdWUuc3RhcnQ7XG4gICAgICAgICAgICBlbmQgICA9IHRoaXMuZGF0YXZhbHVlLmVuZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXJ0ID0gbW9tZW50KHRoaXMuZGF0YXZhbHVlKTtcbiAgICAgICAgICAgIGVuZCAgID0gbW9tZW50KHRoaXMuZGF0YXZhbHVlKS5hZGQoMSwgJ2RheScpLnN0YXJ0T2YoJ2RheScpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIoJ2dvdG9EYXRlJywgc3RhcnQpOyAvLyBhZnRlciBzZWxlY3RpbmcgdGhlIGRhdGUgZ28gdG8gdGhlIGRhdGUuXG4gICAgICAgIHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIoJ3NlbGVjdCcsIHN0YXJ0LCBlbmQpO1xuICAgIH1cblxuICAgIC8vIGNoYW5nZXMgdGhlIGNhbGVuZGFyIHZpZXcgdG8gdGhlIGRlZmF1bHQgZGF0ZSBnaXZlbiBmb3IgdGhlIGNhbGVuZGFyLlxuICAgIHB1YmxpYyBnb3RvRGF0ZSgpIHtcbiAgICAgICAgdGhpcy4kZnVsbENhbGVuZGFyLmZ1bGxDYWxlbmRhcignZ290b0RhdGUnLCBtb21lbnQodGhpcy5kYXRhdmFsdWUpKTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIGZ1bmN0aW9uIHRha2VzIHRoZSBjYWxlbmRhciB2aWV3IHRvIHRoZSBhIHllYXIgYWhlYWRcbiAgICBwdWJsaWMgZ290b05leHRZZWFyKCkge1xuICAgICAgICB0aGlzLiRmdWxsQ2FsZW5kYXIuZnVsbENhbGVuZGFyKCduZXh0WWVhcicpO1xuICAgIH1cblxuICAgIC8vIHRoaXMgZnVuY3Rpb24gdGFrZXMgdGhlIGNhbGVuZGFyIHZpZXcgdG8gdGhlIGEgeWVhciBiZWZvcmVcbiAgICBwdWJsaWMgZ290b1ByZXZZZWFyKCkge1xuICAgICAgICB0aGlzLiRmdWxsQ2FsZW5kYXIuZnVsbENhbGVuZGFyKCdwcmV2WWVhcicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHRoaXMgZnVuY3Rpb24gdGFrZXMgdGhlIGNhbGVuZGFyIHZpZXcgdG8gdGhlIHNwZWNpZmllZCBtb250aFxuICAgICAqIEBwYXJhbSBtb250aFZhbCwgMS0xMiB2YWx1ZSBvZiBtb250aFxuICAgICAqL1xuICAgIHB1YmxpYyBnb3RvTW9udGgobW9udGhWYWwpIHtcbiAgICAgICAgY29uc3QgcHJlc2VudERheSA9IHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIoJ2dldERhdGUnKTtcbiAgICAgICAgY29uc3QgcHJlc2VudE1vbnRoVmFsID0gbmV3IERhdGUocHJlc2VudERheSkuZ2V0TW9udGgoKTtcbiAgICAgICAgaWYgKHByZXNlbnRNb250aFZhbCA8IG1vbnRoVmFsKSB7XG4gICAgICAgICAgICB0aGlzLiRmdWxsQ2FsZW5kYXIuZnVsbENhbGVuZGFyKCdnb3RvRGF0ZScsIHByZXNlbnREYXkuYWRkKG1vbnRoVmFsIC0gcHJlc2VudE1vbnRoVmFsIC0gMSwgJ00nKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRmdWxsQ2FsZW5kYXIuZnVsbENhbGVuZGFyKCdnb3RvRGF0ZScsIHByZXNlbnREYXkuc3VidHJhY3QoIHByZXNlbnRNb250aFZhbCAtIG1vbnRoVmFsICsgMSwgJ00nKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB0aGlzIGZ1bmN0aW9uIHRha2VzIHRoZSBjYWxlbmRhciB2aWV3IHRvIHRoZSBhIG1vbnRoIGFoZWFkXG4gICAgcHVibGljIGdvdG9OZXh0TW9udGgoKSB7XG4gICAgICAgIGNvbnN0IHByZXNlbnREYXkgPSB0aGlzLiRmdWxsQ2FsZW5kYXIuZnVsbENhbGVuZGFyKCdnZXREYXRlJyk7XG4gICAgICAgIHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIoJ2dvdG9EYXRlJywgcHJlc2VudERheS5hZGQoMSwgJ00nKSk7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBmdW5jdGlvbiB0YWtlcyB0aGUgY2FsZW5kYXIgdmlldyB0byB0aGUgYSBtb250aCBiZWZvcmVcbiAgICBwdWJsaWMgZ290b1ByZXZNb250aCgpIHtcbiAgICAgICAgY29uc3QgcHJlc2VudERheSA9IHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIoJ2dldERhdGUnKTtcbiAgICAgICAgdGhpcy4kZnVsbENhbGVuZGFyLmZ1bGxDYWxlbmRhcignZ290b0RhdGUnLCBwcmVzZW50RGF5LnN1YnRyYWN0KDEsICdNJykpO1xuICAgIH1cblxuXG4gICAgLy8gdGhpcyBmdW5jdGlvbiByZS1yZW5kZXJzIHRoZSBldmVudHMgYXNzaWduZWQgdG8gdGhlIGNhbGVuZGFyLlxuICAgIHByaXZhdGUgcmVyZW5kZXJFdmVudHMoKSB7XG4gICAgICAgIHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIoJ3JlcmVuZGVyRXZlbnRzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRTZWxlY3RlZERhdGEoc3RhcnQsIGVuZCkge1xuICAgICAgICBsZXQgZGF0YXNldCA9IHRoaXMuZGF0YXNldDtcbiAgICAgICAgaWYgKCFkYXRhc2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmaWx0ZXJlZERhdGVzID0gW107XG4gICAgICAgIGNvbnN0IGV2ZW50U3RhcnRLZXkgPSB0aGlzLmV2ZW50c3RhcnQgfHwgJ3N0YXJ0JztcbiAgICAgICAgY29uc3QgZXZlbnRFbmRLZXkgPSB0aGlzLmV2ZW50ZW5kIHx8ICdlbmQnO1xuICAgICAgICBjb25zdCBzdGFydERhdGUgPSBtb21lbnQobmV3IERhdGUoc3RhcnQpKS5mb3JtYXQoJ01NL0REL1lZWVknKTtcbiAgICAgICAgY29uc3QgZW5kRGF0ZSA9IG1vbWVudChuZXcgRGF0ZShlbmQpKS5zdWJ0cmFjdCgxLCAnZGF5cycpLmZvcm1hdCgnTU0vREQvWVlZWScpO1xuXG4gICAgICAgIGRhdGFzZXQgPSBkYXRhc2V0LmRhdGEgfHwgZGF0YXNldDtcbiAgICAgICAgZGF0YXNldC5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCF2YWx1ZVtldmVudFN0YXJ0S2V5XSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50U3RhcnREYXRlICAgPSBtb21lbnQobmV3IERhdGUodmFsdWVbZXZlbnRTdGFydEtleV0pKS5mb3JtYXQoJ01NL0REL1lZWVknKTtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50RW5kRGF0ZSAgID0gbW9tZW50KG5ldyBEYXRlKHZhbHVlW2V2ZW50RW5kS2V5XSB8fCB2YWx1ZVtldmVudFN0YXJ0S2V5XSkpLmZvcm1hdCgnTU0vREQvWVlZWScpO1xuICAgICAgICAgICAgY29uc3QgZXZlbnRFeGlzdHMgPSBtb21lbnQoZXZlbnRTdGFydERhdGUpLmlzU2FtZU9yQWZ0ZXIoc3RhcnREYXRlKSAmJiBtb21lbnQoZXZlbnRFbmREYXRlKS5pc1NhbWVPckJlZm9yZShlbmREYXRlKTtcbiAgICAgICAgICAgIGlmIChldmVudEV4aXN0cykge1xuICAgICAgICAgICAgICAgIGZpbHRlcmVkRGF0ZXMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZmlsdGVyZWREYXRlcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGV2ZW50RHJvcCgkbmV3RGF0YSwgJGRlbHRhLCAkcmV2ZXJ0RnVuYywgJGV2ZW50LCAkdWksICR2aWV3KSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnZXZlbnRkcm9wJywgeyRldmVudCwgJG5ld0RhdGEsICRvbGREYXRhOiB0aGlzLm9sZERhdGEsICRkZWx0YSwgJHJldmVydEZ1bmMsICR1aSwgJHZpZXd9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbGVjdChzdGFydCwgZW5kLCBqc0V2ZW50LCAkdmlldykge1xuICAgICAgICB0aGlzLnNlbGVjdGVkZGF0ZXMgPSB7c3RhcnQ6IGdldFVUQ0RhdGVUaW1lKHN0YXJ0KSwgZW5kOiBnZXRVVENEYXRlVGltZShlbmQpfTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZGRhdGEgPSB0aGlzLnNldFNlbGVjdGVkRGF0YShzdGFydCwgZW5kKTtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzZWxlY3QnLCB7JHN0YXJ0OiBzdGFydC52YWx1ZU9mKCksICRlbmQ6IGVuZC52YWx1ZU9mKCksICR2aWV3LCAkZGF0YTogdGhpcy5zZWxlY3RlZGRhdGF9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGV2ZW50UmVzaXplKCRuZXdEYXRhLCAkZGVsdGEsICRyZXZlcnRGdW5jLCAkZXZlbnQsICR1aSwgJHZpZXcpIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdldmVudHJlc2l6ZScsIHskZXZlbnQsICRuZXdEYXRhLCAkb2xkRGF0YTogdGhpcy5vbGREYXRhLCAkZGVsdGEsICRyZXZlcnRGdW5jLCAkdWksICR2aWV3fSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkV2ZW50Q2hhbmdlU3RhcnQoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5vbGREYXRhID0gZ2V0Q2xvbmVkT2JqZWN0KGV2ZW50KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGV2ZW50Q2xpY2soJGRhdGEsICRldmVudCwgJHZpZXcpIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdldmVudGNsaWNrJywgeyRldmVudCwgJGRhdGEsICR2aWV3fSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBldmVudFJlbmRlcigkZGF0YSwgJGV2ZW50LCAkdmlldykge1xuICAgICAgICBpZiAodGhpcy5jYWxlbmRhcnR5cGUgPT09IFZJRVdfVFlQRVMuTElTVCkge1xuICAgICAgICAgICAgdGhpcy4kZnVsbENhbGVuZGFyLmZpbmQoJy5mYy1saXN0LXRhYmxlJykuYWRkQ2xhc3MoJ3RhYmxlJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdldmVudHJlbmRlcicsIHskZXZlbnQsICRkYXRhLCAkdmlld30pO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlld1JlbmRlcigkdmlldykge1xuICAgICAgICB0aGlzLmN1cnJlbnR2aWV3ID0ge3N0YXJ0OiAkdmlldy5zdGFydC5mb3JtYXQoKSwgZW5kOiAkdmlldy5lbmQuc3VidHJhY3QoMSwgJ2RheXMnKS5mb3JtYXQoKX07XG4gICAgICAgIGlmICh0aGlzLmNhbGVuZGFydHlwZSA9PT0gVklFV19UWVBFUy5MSVNUKSB7XG4gICAgICAgICAgICB0aGlzLiRmdWxsQ2FsZW5kYXIuZmluZCgnLmZjLWxpc3QtdGFibGUnKS5hZGRDbGFzcygndGFibGUnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3ZpZXdyZW5kZXInLCB7JHZpZXd9KTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgdGhlIGNhbGVuZGFyIGhlYWRlciBvcHRpb25zIG9uY2UgdGhlIGNvbnRyb2xzIGNoYW5nZXNcbiAgICBwcml2YXRlIHVwZGF0ZUNhbGVuZGFySGVhZGVyT3B0aW9ucygpIHtcbiAgICAgICAgY29uc3QgY3RybHMgPSB0aGlzLmNvbnRyb2xzLCB2aWV3VHlwZSA9IHRoaXMuY2FsZW5kYXJ0eXBlLFxuICAgICAgICAgICAgcmVnRXggPSBuZXcgUmVnRXhwKCdcXFxcYmRheVxcXFxiJywgJ2cnKTtcbiAgICAgICAgbGV0IGxlZnQgPSAnJywgcmlnaHQgPSAnJztcbiAgICAgICAgaWYgKGN0cmxzICYmIHZpZXdUeXBlKSB7XG4gICAgICAgICAgICBpZiAoXy5pbmNsdWRlcyhjdHJscywgJ25hdmlnYXRpb24nKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgKz0gJyBwcmV2IG5leHQnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXy5pbmNsdWRlcyhjdHJscywgJ3RvZGF5JykpIHtcbiAgICAgICAgICAgICAgICBsZWZ0ICs9ICcgdG9kYXknO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXy5pbmNsdWRlcyhjdHJscywgJ3llYXInKSkge1xuICAgICAgICAgICAgICAgIHJpZ2h0ICs9ICh2aWV3VHlwZSA9PT0gVklFV19UWVBFUy5MSVNUKSA/ICdsaXN0WWVhcicgOiAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKF8uaW5jbHVkZXMoY3RybHMsICdtb250aCcpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgKz0gKHZpZXdUeXBlID09PSBWSUVXX1RZUEVTLkxJU1QpID8gJyBsaXN0TW9udGgnIDogJyBtb250aCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLmluY2x1ZGVzKGN0cmxzLCAnd2VlaycpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgKz0gKHZpZXdUeXBlID09PSBWSUVXX1RZUEVTLkJBU0lDKSA/ICAnIGJhc2ljV2VlaycgOiAodmlld1R5cGUgPT09IFZJRVdfVFlQRVMuTElTVCkgPyAnIGxpc3RXZWVrJyA6ICcgYWdlbmRhV2Vlayc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZWdFeC50ZXN0KGN0cmxzKSkge1xuICAgICAgICAgICAgICAgIHJpZ2h0ICs9ICh2aWV3VHlwZSA9PT0gVklFV19UWVBFUy5CQVNJQykgPyAgJyBiYXNpY0RheScgOiAodmlld1R5cGUgPT09IFZJRVdfVFlQRVMuTElTVCkgPyAnIGxpc3REYXknIDogJyBhZ2VuZGFEYXknO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLmV4dGVuZCh0aGlzLmNhbGVuZGFyT3B0aW9ucy5jYWxlbmRhci5oZWFkZXIsIHsnbGVmdCc6IGxlZnQsICdyaWdodCc6IHJpZ2h0fSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB0byBjYWxjdWxhdGUgdGhlIGhlaWdodCBmb3IgdGhlIGV2ZW50IGxpbWl0IGFuZCBwYXJzaW5nIHRoZSB2YWx1ZSB3aGVuIGl0IGlzIHBlcmNlbnRhZ2UgYmFzZWQuXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVIZWlnaHQoaGVpZ2h0KTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgJHBhcmVudCA9ICQodGhpcy5uYXRpdmVFbGVtZW50KS5wYXJlbnQoKSxcbiAgICAgICAgICAgIGVsSGVpZ2h0ID0gaGVpZ2h0IHx8ICc2NTBweCc7XG5cbiAgICAgICAgbGV0IHBhcmVudEhlaWdodCA9ICRwYXJlbnQuY3NzKCdoZWlnaHQnKSxcbiAgICAgICAgICAgIGNvbXB1dGVkSGVpZ2h0OiBudW1iZXI7XG5cbiAgICAgICAgaWYgKF8uaW5jbHVkZXMoZWxIZWlnaHQsICclJykpIHtcbiAgICAgICAgICAgIGlmIChfLmluY2x1ZGVzKHBhcmVudEhlaWdodCwgJyUnKSkge1xuICAgICAgICAgICAgICAgIHBhcmVudEhlaWdodCA9ICRwYXJlbnQuaGVpZ2h0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wdXRlZEhlaWdodCA9IChwYXJzZUludChwYXJlbnRIZWlnaHQsIDEwKSAqIE51bWJlcihlbEhlaWdodC5yZXBsYWNlKC9cXCUvZywgJycpKSkgLyAxMDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21wdXRlZEhlaWdodCA9IHBhcnNlSW50KGVsSGVpZ2h0LCAxMCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYWxlbmRhck9wdGlvbnMuY2FsZW5kYXIudmlld3MubW9udGguZXZlbnRMaW1pdCA9IHBhcnNlSW50KCcnICsgY29tcHV0ZWRIZWlnaHQgLyAyMDAsIDEwKSArIDE7XG4gICAgICAgIHJldHVybiBjb21wdXRlZEhlaWdodDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHRyaWdnZXJNb2JpbGVDYWxlbmRhckNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5wcmVwYXJlQ2FsZW5kYXJFdmVudHMoKTtcbiAgICAgICAgLy8gY2hhbmdlIHRoZSBtb2RlbCBzbyB0aGF0IHRoZSB2aWV3IGlzIHJlbmRlcmVkIGFnYWluIHdpdGggdGhlIGV2ZW50cyAsIGFmdGVyIHRoZSBkYXRhc2V0IGlzIGNoYW5nZWQuXG4gICAgICAgIHRoaXMucHJveHlNb2RlbCA9IHRoaXMucHJveHlNb2RlbCB8fCBtb21lbnQoKS52YWx1ZU9mKCk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRkYXRlcyA9IHtcbiAgICAgICAgICAgIHN0YXJ0OiBtb21lbnQodGhpcy5wcm94eU1vZGVsKS52YWx1ZU9mKCksXG4gICAgICAgICAgICBlbmQgIDogbW9tZW50KHRoaXMucHJveHlNb2RlbCkuZW5kT2YoJ2RheScpLnZhbHVlT2YoKVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2V2ZW50cmVuZGVyJywgeyRkYXRhOiB0aGlzLmV2ZW50RGF0YX0pO1xuICAgIH1cblxuICAgIC8vIHByZXBhcmVzIGV2ZW50cyBmb3IgdGhlIG1vYmllIGNhbGVuZGFyXG4gICAgcHJpdmF0ZSBwcmVwYXJlQ2FsZW5kYXJFdmVudHMgKCkge1xuICAgICAgICBsZXQgZXZlbnREYXksXG4gICAgICAgICAgICBkYXRhc2V0O1xuICAgICAgICB0aGlzLmV2ZW50RGF0YSA9IHt9O1xuICAgICAgICBpZiAoIXRoaXMuZGF0YXNldCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRhdGFzZXQgPSB0aGlzLmRhdGFzZXQ7XG4gICAgICAgIGRhdGFzZXQgPSBfLmlzQXJyYXkoZGF0YXNldCkgPyBkYXRhc2V0IDogKF8uaXNPYmplY3QoZGF0YXNldCkgPyBbZGF0YXNldF0gOiBbXSk7XG4gICAgICAgIHRoaXMuZXZlbnRzID0gZGF0YXNldCB8fCB0aGlzLmNvbnN0cnVjdENhbGVuZGFyRGF0YXNldChkYXRhc2V0KTtcbiAgICAgICAgdGhpcy5ldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50U3RhcnQgPSBldmVudC5zdGFydCB8fCBldmVudFt0aGlzLmV2ZW50c3RhcnRdO1xuICAgICAgICAgICAgaWYgKGV2ZW50U3RhcnQpIHtcbiAgICAgICAgICAgICAgICBldmVudERheSA9IG1vbWVudChldmVudFN0YXJ0KS5zdGFydE9mKCdkYXknKS5mb3JtYXQoZGF0ZUZvcm1hdCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZXZlbnREYXRhW2V2ZW50RGF5XSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV2ZW50RGF0YVtldmVudERheV0ucHVzaChldmVudCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ldmVudERhdGFbZXZlbnREYXldID0gW2V2ZW50XTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb2JpbGVDYWxlbmRhcikge1xuICAgICAgICAgICAgICAgICAgICAvLyBjdXN0b20gY2xhc3Mgb24gdGhlIGRhdGUgaW4gdGhlIGRhdGUgcGlja2VyLlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRheUNsYXNzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZTogbmV3IERhdGUoZXZlbnRTdGFydCkuc2V0SG91cnMoMCwgMCwgMCwgMCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlOiAnZGF5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXp6OiB0aGlzLmdldERheUNsYXNzKHtldmVudERheTogZXZlbnREYXl9KVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBhZGQgdGhlIGV2ZW50RGF0YSBvbiB0aGUgY2FsZW5kYXIgYnkgY2FsbGluZyByZWZyZXNoVmlld1xuICAgICAgICBpZiAodGhpcy5tb2JpbGVDYWxlbmRhciAmJiB0aGlzLl9kYXRlcGlja2VySW5uZXJDb21wb25lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGVwaWNrZXJJbm5lckNvbXBvbmVudC5yZWZyZXNoVmlldygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29uc3RydWN0cyB0aGUgY2FsZW5kYXIgZGF0YXNldCBieSBtYXBwaW5nIHRoZSBldmVudHN0YXJ0LCBldmVudGVuZCwgZXZlbnR0aXRsZSBldGMuLFxuICAgIHByaXZhdGUgY29uc3RydWN0Q2FsZW5kYXJEYXRhc2V0KGV2ZW50U291cmNlKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7XG4gICAgICAgICAgICB0aXRsZTogdGhpcy5ldmVudHRpdGxlIHx8ICd0aXRsZScsXG4gICAgICAgICAgICBhbGxEYXk6IHRoaXMuZXZlbnRhbGxkYXkgfHwgJ2FsbGRheScsXG4gICAgICAgICAgICBzdGFydDogdGhpcy5ldmVudHN0YXJ0IHx8ICdzdGFydCcsXG4gICAgICAgICAgICBlbmQ6IHRoaXMuZXZlbnRlbmQgfHwgJ2VuZCcsXG4gICAgICAgICAgICBjbGFzc05hbWU6IHRoaXMuZXZlbnRjbGFzcyB8fCAnY2xhc3NOYW1lJ1xuICAgICAgICB9O1xuXG4gICAgICAgIGV2ZW50U291cmNlLmZvckVhY2goKG9iaikgPT4ge1xuICAgICAgICAgICAgXy5tYXBLZXlzKHByb3BlcnRpZXMsICAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBvYmpWYWw7XG4gICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3RpdGxlJykge1xuICAgICAgICAgICAgICAgICAgICBvYmpWYWwgPSBnZXRFdmFsdWF0ZWREYXRhKG9iaiwge2V4cHJlc3Npb246IHZhbHVlfSwgdGhpcy52aWV3UGFyZW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2FsbERheScpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqVmFsID0gISFfLmdldChvYmosIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvYmpWYWwgPSBfLmdldChvYmosIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFvYmpWYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAnc3RhcnQnIHx8IGtleSA9PT0gJ2VuZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqVmFsID0gZ2V0RXZlbnRNb21lbnRWYWx1ZShvYmpWYWwsIGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9ialtrZXldID0gb2JqVmFsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZXZlbnRTb3VyY2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRMb2NhbGUoKSB7XG4gICAgICAgIGNvbnN0IHllYXIgPSBfLmdldCh0aGlzLmFwcExvY2FsZSwgJ0xBQkVMX0NBTEVOREFSX1lFQVInKSB8fCBCVVRUT05fVEVYVC5ZRUFSO1xuICAgICAgICBjb25zdCBtb250aCA9IF8uZ2V0KHRoaXMuYXBwTG9jYWxlLCAnTEFCRUxfQ0FMRU5EQVJfTU9OVEgnKSB8fCBCVVRUT05fVEVYVC5NT05USDtcbiAgICAgICAgY29uc3Qgd2VlayA9IF8uZ2V0KHRoaXMuYXBwTG9jYWxlLCAnTEFCRUxfQ0FMRU5EQVJfV0VFSycpIHx8IEJVVFRPTl9URVhULldFRUs7XG4gICAgICAgIGNvbnN0IGRheSA9IF8uZ2V0KHRoaXMuYXBwTG9jYWxlLCAnTEFCRUxfQ0FMRU5EQVJfREFZJykgfHwgQlVUVE9OX1RFWFQuREFZO1xuICAgICAgICBjb25zdCB0b2RheSA9IF8uZ2V0KHRoaXMuYXBwTG9jYWxlLCAnTEFCRUxfQ0FMRU5EQVJfVE9EQVknKSB8fCBCVVRUT05fVEVYVC5UT0RBWTtcbiAgICAgICAgdGhpcy5jYWxlbmRhck9wdGlvbnMuY2FsZW5kYXIuYnV0dG9uVGV4dCAgICA9IHsgeWVhciwgbW9udGgsIHdlZWssIGRheSwgdG9kYXksXG4gICAgICAgICAgICAnbGlzdFllYXInOiB5ZWFyLFxuICAgICAgICAgICAgJ2xpc3RNb250aCc6IG1vbnRoLFxuICAgICAgICAgICAgJ2xpc3RXZWVrJzogd2VlayxcbiAgICAgICAgICAgICdsaXN0RGF5JzogZGF5XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuXG4gICAgICAgIHRoaXMubW9iaWxlQ2FsZW5kYXIgPSBpc01vYmlsZSgpO1xuICAgICAgICB0aGlzLmV2ZW50U291cmNlcy5wdXNoKHRoaXMuZGF0YVNldEV2ZW50cyk7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLkNPTlRBSU5FUiwgWydoZWlnaHQnXSk7XG5cbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQ2FsZW5kYXIpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy52aWV3IHx8IHRoaXMudmlldyA9PT0gJ3dlZWsnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3ID0gJ2RheSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJNb2JpbGVDYWxlbmRhckNoYW5nZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRMb2NhbGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uU3R5bGVDaGFuZ2Uoa2V5LCBudiwgb3Y/KSB7XG4gICAgICAgIHN1cGVyLm9uU3R5bGVDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICBpZiAoa2V5ID09PSAnaGVpZ2h0Jykge1xuICAgICAgICAgICAgdGhpcy5jYWxlbmRhck9wdGlvbnMuY2FsZW5kYXIuaGVpZ2h0ID0gdGhpcy5jYWxjdWxhdGVIZWlnaHQobnYpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVDYWxlbmRhck9wdGlvbnMoJ29wdGlvbicsICdoZWlnaHQnLCB0aGlzLmNhbGVuZGFyT3B0aW9ucy5jYWxlbmRhci5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdj8pIHtcbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICBjYXNlICdzZWxlY3Rpb25tb2RlJzpcbiAgICAgICAgICAgICAgICBpZiAobnYgIT09IFNFTEVDVElPTl9NT0RFUy5OT05FKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsZW5kYXJPcHRpb25zLmNhbGVuZGFyLnNlbGVjdGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbGVuZGFyT3B0aW9ucygnb3B0aW9uJywgJ3NlbGVjdGFibGUnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG52ID09PSBTRUxFQ1RJT05fTU9ERVMuU0lOR0xFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGVuZGFyT3B0aW9ucy5jYWxlbmRhci5zZWxlY3RDb25zdHJhaW50ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiAnMDA6MDAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZDogJzI0OjAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsZW5kYXJPcHRpb25zKCdvcHRpb24nLCAnc2VsZWN0Q29uc3RyYWludCcsIHRoaXMuY2FsZW5kYXJPcHRpb25zLmNhbGVuZGFyLnNlbGVjdENvbnN0cmFpbnQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYWxlbmRhck9wdGlvbnMoJ29wdGlvbicsICdzZWxlY3RDb25zdHJhaW50Jywge30pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxlbmRhck9wdGlvbnMuY2FsZW5kYXIuc2VsZWN0YWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbGVuZGFyT3B0aW9ucygnb3B0aW9uJywgJ3NlbGVjdGFibGUnLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmlldyc6XG4gICAgICAgICAgICAgICAgaWYgKG52ICE9PSAnbW9udGgnIHx8IHRoaXMuY2FsZW5kYXJ0eXBlID09PSBWSUVXX1RZUEVTLkxJU1QpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxlbmRhck9wdGlvbnMuY2FsZW5kYXIuZGVmYXVsdFZpZXcgPSB0aGlzLmNhbGVuZGFydHlwZSArIF8uY2FwaXRhbGl6ZShudik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxlbmRhck9wdGlvbnMuY2FsZW5kYXIuZGVmYXVsdFZpZXcgPSBudjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYWxlbmRhck9wdGlvbnMoJ2NoYW5nZVZpZXcnLCB0aGlzLmNhbGVuZGFyT3B0aW9ucy5jYWxlbmRhci5kZWZhdWx0Vmlldyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjYWxlbmRhcnR5cGUnOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FsZW5kYXJ0eXBlID0gbnYgfHwgJ2Jhc2ljJztcbiAgICAgICAgICAgIGNhc2UgJ2NvbnRyb2xzJzpcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbGVuZGFySGVhZGVyT3B0aW9ucygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZGF0YXNldCc6XG4gICAgICAgICAgICAgICAgbGV0IGRhdGFTZXQ7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhc2V0ID0gbnY7XG4gICAgICAgICAgICAgICAgZGF0YVNldCA9IGNyZWF0ZUFycmF5RnJvbShnZXRDbG9uZWRPYmplY3QobnYpKTtcbiAgICAgICAgICAgICAgICBkYXRhU2V0ID0gdGhpcy5jb25zdHJ1Y3RDYWxlbmRhckRhdGFzZXQoZGF0YVNldCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhU2V0RXZlbnRzLmV2ZW50cyA9IGRhdGFTZXQuZmlsdGVyKChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdGFydCA9IGV2ZW50LnN0YXJ0IHx8IGV2ZW50LmVuZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubW9iaWxlQ2FsZW5kYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyTW9iaWxlQ2FsZW5kYXJDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbGVuZGFyT3B0aW9ucygncmVtb3ZlRXZlbnRzJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsZW5kYXJPcHRpb25zKCdhZGRFdmVudFNvdXJjZScsIHRoaXMuZGF0YVNldEV2ZW50cy5ldmVudHMpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbGVuZGFyT3B0aW9ucygncmVyZW5kZXJFdmVudHMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBkZWZhdWx0IGRhdGUgd2hlbiB0aGUgZGF0YXZhbHVlIGlzIHByb3ZpZGVkXG4gICAgZ2V0RGVmYXVsdERhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGF2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuZGF0YXZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdBZnRlclZpZXdJbml0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQ2FsZW5kYXIgJiYgdGhpcy5fZGF0ZXBpY2tlcikge1xuICAgICAgICAgICAgbGV0IGxhc3RBY3RpdmVEYXRlID0gKHRoaXMuX2RhdGVwaWNrZXIgYXMgYW55KS5hY3RpdmVEYXRlO1xuICAgICAgICAgICAgLy8gcmVuZGVydmlldyB3aGVuIGFjdGl2ZSBkYXRlIGNoYW5nZXNcbiAgICAgICAgICAgICh0aGlzLl9kYXRlcGlja2VyIGFzIGFueSkuYWN0aXZlRGF0ZUNoYW5nZS5zdWJzY3JpYmUoKGR0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldlllYXIgPSBsYXN0QWN0aXZlRGF0ZS5nZXRZZWFyKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldk1vbnRoID0gbGFzdEFjdGl2ZURhdGUuZ2V0TW9udGgoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZFllYXIgPSBkdC5nZXRZZWFyKCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRNb250aCA9IGR0LmdldE1vbnRoKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBpbnZva2UgcmVuZGVyVmlldyBvbmx5IHdoZW4gbW9udGggaXMgY2hhbmdlZC5cbiAgICAgICAgICAgICAgICBpZiAocHJldk1vbnRoICE9PSBzZWxlY3RlZE1vbnRoIHx8IHByZXZZZWFyICE9PSBzZWxlY3RlZFllYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdEFjdGl2ZURhdGUgPSBkdDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJNb2JpbGVWaWV3KGR0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fZGF0ZXBpY2tlcklubmVyQ29tcG9uZW50ID0gKHRoaXMuX2RhdGVwaWNrZXIgYXMgYW55KS5fZGF0ZVBpY2tlcjtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyTW9iaWxlVmlldyhtb21lbnQodGhpcy5kYXRhdmFsdWUpKTtcbiAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgJHdhdGNoKFxuICAgICAgICAgICAgICAgICAgICAnX2RhdGVwaWNrZXJJbm5lckNvbXBvbmVudC5kYXRlcGlja2VyTW9kZScsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICAobnYsIG92KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3YgJiYgIV8uaXNFbXB0eShvdikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZU9uVmlld1JlbmRlcmJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLiRmdWxsQ2FsZW5kYXIgPSAkKHRoaXMuX2NhbGVuZGFyLm5hdGl2ZUVsZW1lbnQpO1xuICAgICAgICB0aGlzLiRmdWxsQ2FsZW5kYXIuZnVsbENhbGVuZGFyKHRoaXMuY2FsZW5kYXJPcHRpb25zLmNhbGVuZGFyKTtcbiAgICAgICAgLy8gaWYgdGhlIGNoYW5nZXMgYXJlIGFscmVhZHkgc3RhY2tlZCBiZWZvcmUgY2FsZW5kYXIgcmVuZGVycyB0aGVuIGV4ZWN1dGUgdGhlbSB3aGVuIG5lZWRlZFxuICAgICAgICBpZiAodGhpcy5jaGFuZ2VzU3RhY2subGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZXNTdGFjay5mb3JFYWNoKChjaGFuZ2VPYmopID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiRmdWxsQ2FsZW5kYXIuZnVsbENhbGVuZGFyKGNoYW5nZU9iai5vcGVyYXRpb25UeXBlLCBjaGFuZ2VPYmouYXJndW1lbnRLZXksIGNoYW5nZU9iai5hcmd1bWVudFZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VzU3RhY2subGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZUNhbGVuZGFyT3B0aW9ucyhvcGVyYXRpb25UeXBlOiBzdHJpbmcsIGFyZ3VtZW50S2V5PzogYW55LCBhcmd1bWVudFZhbHVlPzogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy4kZnVsbENhbGVuZGFyKSB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZXNTdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25UeXBlOiBvcGVyYXRpb25UeXBlLFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50S2V5OiBhcmd1bWVudEtleSxcbiAgICAgICAgICAgICAgICBhcmd1bWVudFZhbHVlOiBhcmd1bWVudFZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRmdWxsQ2FsZW5kYXIuZnVsbENhbGVuZGFyKG9wZXJhdGlvblR5cGUsIGFyZ3VtZW50S2V5LCBhcmd1bWVudFZhbHVlKTtcbiAgICB9XG5cbiAgICByZWRyYXcoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsZW5kYXJPcHRpb25zKCdyZW5kZXInKTtcbiAgICB9XG5cbiAgICAvLyBvbiBkYXRlIGNoYW5nZSBpbnZva2UgdGhlIHNlbGVjdCBldmVudCwgYW5kIGlmIGRhdGUgaGFzIGV2ZW50IG9uIGl0IHRoZW4gaW52b2tlIHRoZSBldmVudCBjbGljay5cbiAgICBwcml2YXRlIG9uVmFsdWVDaGFuZ2UodmFsdWU6IERhdGUpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5wcm94eU1vZGVsID0gdmFsdWU7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkRGF0ZSAgICAgICAgPSB0aGlzLnByb3h5TW9kZWwgJiYgbW9tZW50KHRoaXMucHJveHlNb2RlbCkuc3RhcnRPZignZGF5JykuZm9ybWF0KGRhdGVGb3JtYXQpLFxuICAgICAgICAgICAgc2VsZWN0ZWRFdmVudERhdGEgICA9IHRoaXMuZXZlbnREYXRhW3NlbGVjdGVkRGF0ZV0sXG4gICAgICAgICAgICBzdGFydCAgICAgICAgICAgICAgID0gbW9tZW50KHRoaXMucHJveHlNb2RlbCksXG4gICAgICAgICAgICBlbmQgICAgICAgICAgICAgICAgID0gbW9tZW50KHRoaXMucHJveHlNb2RlbCkuZW5kT2YoJ2RheScpO1xuICAgICAgICB0aGlzLnNlbGVjdGVkZGF0YSA9IHNlbGVjdGVkRXZlbnREYXRhO1xuICAgICAgICB0aGlzLnNlbGVjdGVkZGF0ZXMgPSB7XG4gICAgICAgICAgICAnc3RhcnQnOiBtb21lbnQoc2VsZWN0ZWREYXRlKS52YWx1ZU9mKCksXG4gICAgICAgICAgICAnZW5kJyAgOiBtb21lbnQoc2VsZWN0ZWREYXRlKS5lbmRPZignZGF5JykudmFsdWVPZigpXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY2FsZW5kYXJPcHRpb25zLmNhbGVuZGFyLnNlbGVjdChzdGFydC52YWx1ZU9mKCksIGVuZC52YWx1ZU9mKCksIHt9LCB0aGlzLCBzZWxlY3RlZEV2ZW50RGF0YSk7XG4gICAgICAgIGlmIChzZWxlY3RlZEV2ZW50RGF0YSkge1xuICAgICAgICAgICAgdGhpcy5jYWxlbmRhck9wdGlvbnMuY2FsZW5kYXIuZXZlbnRDbGljayhzZWxlY3RlZEV2ZW50RGF0YSwge30sIHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyB0aGUgY3VzdG9tIGNsYXNzIGZvciB0aGUgZXZlbnRzIGRlcGVuZGluZyBvbiB0aGUgbGVuZ3RoIG9mIHRoZSBldmVudHMgZm9yIHRoYXQgZGF5LlxuICAgIHByaXZhdGUgZ2V0RGF5Q2xhc3MoZGF0YSkge1xuICAgICAgICBjb25zdCBldmVudERheSA9IGRhdGEuZXZlbnREYXk7XG5cbiAgICAgICAgaWYgKCFfLmlzRW1wdHkodGhpcy5ldmVudERhdGEpICYmIHRoaXMuZXZlbnREYXRhW2V2ZW50RGF5XSkge1xuICAgICAgICAgICAgY29uc3QgZXZlbnRzTGVuZ3RoID0gdGhpcy5ldmVudERhdGFbZXZlbnREYXldLmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChldmVudHNMZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2luZ2xlRXZlbnRDbGFzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldmVudHNMZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG91YmxlRXZlbnRDbGFzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtdWx0aXBsZUV2ZW50Q2xhc3M7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIC8vIHNldHMgdGhlIGN1cnJlbnQgdmlldyBhbmQgaW52b2tlcyB0aGUgdmlld3JlbmRlciBtZXRob2QuXG4gICAgcHJpdmF0ZSByZW5kZXJNb2JpbGVWaWV3KHZpZXdPYmopIHtcbiAgICAgICAgbGV0IHN0YXJ0RGF0ZSxcbiAgICAgICAgICAgIGVuZERhdGU7XG4gICAgICAgIGlmICghdmlld09iaikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0YXJ0RGF0ZSA9IG1vbWVudCh2aWV3T2JqKS5zdGFydE9mKCdtb250aCcpLnZhbHVlT2YoKTtcbiAgICAgICAgZW5kRGF0ZSA9IG1vbWVudCh2aWV3T2JqKS5lbmRPZignbW9udGgnKS52YWx1ZU9mKCk7XG4gICAgICAgIHRoaXMuY3VycmVudHZpZXcgPSB7c3RhcnQ6IHN0YXJ0RGF0ZSwgZW5kOiBlbmREYXRlfTtcbiAgICAgICAgdGhpcy5pbnZva2VPblZpZXdSZW5kZXJiYWNrKCk7XG4gICAgfVxufVxuIl19