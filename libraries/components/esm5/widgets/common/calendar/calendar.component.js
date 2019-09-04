import * as tslib_1 from "tslib";
import { Component, ElementRef, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { $watch, getClonedObject, getSessionStorageItem, isMobile } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './calendar.props';
import { getEvaluatedData, provideAsWidgetRef } from '../../../utils/widget-utils';
import { StylableComponent } from '../base/stylable.component';
import { createArrayFrom } from '../../../utils/data-utils';
var DEFAULT_CLS = 'app-calendar';
var dateFormats = ['yyyy-MM-dd', 'yyyy-M-dd', 'M-dd-yyyy', 'MM-dd-yy', 'yyyy, dd MMMM', 'yyyy, MMM dd', 'MM/dd/yyyy', 'M/d/yyyy', 'EEE, dd MMM yyyy', 'EEE MMM dd yyyy', 'EEEE, MMMM dd, yyyy', 'timestamp'];
var defaultHeaderOptions = {
    left: 'prev next today',
    center: 'title',
    right: 'month basicWeek basicDay'
};
var VIEW_TYPES = {
    BASIC: 'basic',
    AGENDA: 'agenda',
    LIST: 'list'
};
var BUTTON_TEXT = {
    YEAR: 'Year',
    MONTH: 'Month',
    WEEK: 'Week',
    DAY: 'Day',
    TODAY: 'Today'
};
var SELECTION_MODES = {
    NONE: 'none',
    SINGLE: 'single',
    MULTIPLE: 'multiple'
};
var NEXT_DAY_THRESHOLD = {
    START: '00:00',
    END: '24:00'
};
var getEventMomentValue = function (value, key) {
    var isDate = false;
    dateFormats.forEach(function (format) {
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
var ɵ0 = getEventMomentValue;
var getUTCDateTime = function (dateObj) {
    dateObj = _.isObject(dateObj) ? dateObj : moment(dateObj);
    var year = dateObj.format('YYYY'), 
    // javascript starts the month count from '0' where as moment returns the human count
    month = dateObj.format('MM') - 1, day = dateObj.format('DD'), hours = dateObj.format('HH'), minutes = dateObj.format('mm'), seconds = dateObj.format('ss');
    return new Date(year, month, day, hours, minutes, seconds);
};
var ɵ1 = getUTCDateTime;
var WIDGET_CONFIG = { widgetType: 'wm-calendar', hostClass: DEFAULT_CLS };
// mobile calendar class names
var multipleEventClass = 'app-calendar-event';
var doubleEventClass = multipleEventClass + ' two';
var singleEventClass = multipleEventClass + ' one';
var dateFormat = 'YYYY/MM/DD';
var CalendarComponent = /** @class */ (function (_super) {
    tslib_1.__extends(CalendarComponent, _super);
    function CalendarComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.controls = 'navigation, today, year, month, week, day';
        _this.eventSources = [];
        _this.dataSetEvents = {
            events: []
        };
        _this.changesStack = [];
        _this.invokeOnViewRenderback = _.debounce(function () { return _this.invokeEventCallback('viewrender', { $view: _this.calendarOptions }); }, 300);
        // calendarOptions to the calendar
        _this.calendarOptions = {
            calendar: {
                height: 600,
                eventSources: _this.eventSources,
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
                eventDrop: _this.eventDrop.bind(_this),
                eventResizeStart: _this.onEventChangeStart.bind(_this),
                eventDragStart: _this.onEventChangeStart.bind(_this),
                eventResize: _this.eventResize.bind(_this),
                eventClick: _this.eventClick.bind(_this),
                select: _this.select.bind(_this),
                eventRender: _this.eventRender.bind(_this),
                viewRender: _this.viewRender.bind(_this)
            }
        };
        _this.dayClass = [];
        _this.mobileCalendar = isMobile();
        _this.eventSources.push(_this.dataSetEvents);
        return _this;
    }
    // this function selects the default date given for the calendar
    CalendarComponent.prototype.selectDate = function () {
        var start, end;
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
    };
    // changes the calendar view to the default date given for the calendar.
    CalendarComponent.prototype.gotoDate = function () {
        this.$fullCalendar.fullCalendar('gotoDate', moment(this.datavalue));
    };
    // this function takes the calendar view to the a year ahead
    CalendarComponent.prototype.gotoNextYear = function () {
        this.$fullCalendar.fullCalendar('nextYear');
    };
    // this function takes the calendar view to the a year before
    CalendarComponent.prototype.gotoPrevYear = function () {
        this.$fullCalendar.fullCalendar('prevYear');
    };
    /**
     * this function takes the calendar view to the specified month
     * @param monthVal, 1-12 value of month
     */
    CalendarComponent.prototype.gotoMonth = function (monthVal) {
        var presentDay = this.$fullCalendar.fullCalendar('getDate');
        var presentMonthVal = new Date(presentDay).getMonth();
        if (presentMonthVal < monthVal) {
            this.$fullCalendar.fullCalendar('gotoDate', presentDay.add(monthVal - presentMonthVal - 1, 'M'));
        }
        else {
            this.$fullCalendar.fullCalendar('gotoDate', presentDay.subtract(presentMonthVal - monthVal + 1, 'M'));
        }
    };
    // this function takes the calendar view to the a month ahead
    CalendarComponent.prototype.gotoNextMonth = function () {
        var presentDay = this.$fullCalendar.fullCalendar('getDate');
        this.$fullCalendar.fullCalendar('gotoDate', presentDay.add(1, 'M'));
    };
    // this function takes the calendar view to the a month before
    CalendarComponent.prototype.gotoPrevMonth = function () {
        var presentDay = this.$fullCalendar.fullCalendar('getDate');
        this.$fullCalendar.fullCalendar('gotoDate', presentDay.subtract(1, 'M'));
    };
    // this function re-renders the events assigned to the calendar.
    CalendarComponent.prototype.rerenderEvents = function () {
        this.$fullCalendar.fullCalendar('rerenderEvents');
    };
    CalendarComponent.prototype.setSelectedData = function (start, end) {
        var dataset = this.dataset;
        if (!dataset) {
            return;
        }
        var filteredDates = [];
        var eventStartKey = this.eventstart || 'start';
        var eventEndKey = this.eventend || 'end';
        var startDate = moment(new Date(start)).format('MM/DD/YYYY');
        var endDate = moment(new Date(end)).subtract(1, 'days').format('MM/DD/YYYY');
        dataset = dataset.data || dataset;
        dataset.forEach(function (value) {
            if (!value[eventStartKey]) {
                return;
            }
            var eventStartDate = moment(new Date(value[eventStartKey])).format('MM/DD/YYYY');
            var eventEndDate = moment(new Date(value[eventEndKey] || value[eventStartKey])).format('MM/DD/YYYY');
            var eventExists = moment(eventStartDate).isSameOrAfter(startDate) && moment(eventEndDate).isSameOrBefore(endDate);
            if (eventExists) {
                filteredDates.push(value);
            }
        });
        return filteredDates;
    };
    CalendarComponent.prototype.eventDrop = function ($newData, $delta, $revertFunc, $event, $ui, $view) {
        this.invokeEventCallback('eventdrop', { $event: $event, $newData: $newData, $oldData: this.oldData, $delta: $delta, $revertFunc: $revertFunc, $ui: $ui, $view: $view });
    };
    CalendarComponent.prototype.select = function (start, end, jsEvent, $view) {
        this.selecteddates = { start: getUTCDateTime(start), end: getUTCDateTime(end) };
        this.selecteddata = this.setSelectedData(start, end);
        this.invokeEventCallback('select', { $start: start.valueOf(), $end: end.valueOf(), $view: $view, $data: this.selecteddata });
    };
    CalendarComponent.prototype.eventResize = function ($newData, $delta, $revertFunc, $event, $ui, $view) {
        this.invokeEventCallback('eventresize', { $event: $event, $newData: $newData, $oldData: this.oldData, $delta: $delta, $revertFunc: $revertFunc, $ui: $ui, $view: $view });
    };
    CalendarComponent.prototype.onEventChangeStart = function (event) {
        this.oldData = getClonedObject(event);
    };
    CalendarComponent.prototype.eventClick = function ($data, $event, $view) {
        this.invokeEventCallback('eventclick', { $event: $event, $data: $data, $view: $view });
    };
    CalendarComponent.prototype.eventRender = function ($data, $event, $view) {
        if (this.calendartype === VIEW_TYPES.LIST) {
            this.$fullCalendar.find('.fc-list-table').addClass('table');
        }
        this.invokeEventCallback('eventrender', { $event: $event, $data: $data, $view: $view });
    };
    CalendarComponent.prototype.viewRender = function ($view) {
        this.currentview = { start: $view.start.format(), end: $view.end.subtract(1, 'days').format() };
        if (this.calendartype === VIEW_TYPES.LIST) {
            this.$fullCalendar.find('.fc-list-table').addClass('table');
        }
        this.invokeEventCallback('viewrender', { $view: $view });
    };
    // update the calendar header options once the controls changes
    CalendarComponent.prototype.updateCalendarHeaderOptions = function () {
        var ctrls = this.controls, viewType = this.calendartype, regEx = new RegExp('\\bday\\b', 'g');
        var left = '', right = '';
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
    };
    // to calculate the height for the event limit and parsing the value when it is percentage based.
    CalendarComponent.prototype.calculateHeight = function (height) {
        var $parent = $(this.nativeElement).parent(), elHeight = height || '650px';
        var parentHeight = $parent.css('height'), computedHeight;
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
    };
    CalendarComponent.prototype.triggerMobileCalendarChange = function () {
        this.prepareCalendarEvents();
        // change the model so that the view is rendered again with the events , after the dataset is changed.
        this.proxyModel = this.proxyModel || moment().valueOf();
        this.selecteddates = {
            start: moment(this.proxyModel).valueOf(),
            end: moment(this.proxyModel).endOf('day').valueOf()
        };
        this.invokeEventCallback('eventrender', { $data: this.eventData });
    };
    // prepares events for the mobie calendar
    CalendarComponent.prototype.prepareCalendarEvents = function () {
        var _this = this;
        var eventDay, dataset;
        this.eventData = {};
        if (!this.dataset) {
            return;
        }
        dataset = this.dataset;
        dataset = _.isArray(dataset) ? dataset : (_.isObject(dataset) ? [dataset] : []);
        this.events = dataset || this.constructCalendarDataset(dataset);
        this.events.forEach(function (event) {
            var eventStart = event.start || event[_this.eventstart];
            if (eventStart) {
                eventDay = moment(eventStart).startOf('day').format(dateFormat);
                if (_this.eventData[eventDay]) {
                    _this.eventData[eventDay].push(event);
                }
                else {
                    _this.eventData[eventDay] = [event];
                }
                if (_this.mobileCalendar) {
                    // custom class on the date in the date picker.
                    _this.dayClass.push({
                        date: new Date(eventStart).setHours(0, 0, 0, 0),
                        mode: 'day',
                        clazz: _this.getDayClass({ eventDay: eventDay })
                    });
                }
            }
        });
        // add the eventData on the calendar by calling refreshView
        if (this.mobileCalendar && this._datepickerInnerComponent) {
            this._datepickerInnerComponent.refreshView();
        }
    };
    // constructs the calendar dataset by mapping the eventstart, eventend, eventtitle etc.,
    CalendarComponent.prototype.constructCalendarDataset = function (eventSource) {
        var _this = this;
        var properties = {
            title: this.eventtitle || 'title',
            allDay: this.eventallday || 'allday',
            start: this.eventstart || 'start',
            end: this.eventend || 'end',
            className: this.eventclass || 'className'
        };
        eventSource.forEach(function (obj) {
            _.mapKeys(properties, function (value, key) {
                var objVal;
                if (key === 'title') {
                    objVal = getEvaluatedData(obj, { expression: value }, _this.viewParent);
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
    };
    CalendarComponent.prototype.setLocale = function () {
        var year = _.get(this.appLocale, 'LABEL_CALENDAR_YEAR') || BUTTON_TEXT.YEAR;
        var month = _.get(this.appLocale, 'LABEL_CALENDAR_MONTH') || BUTTON_TEXT.MONTH;
        var week = _.get(this.appLocale, 'LABEL_CALENDAR_WEEK') || BUTTON_TEXT.WEEK;
        var day = _.get(this.appLocale, 'LABEL_CALENDAR_DAY') || BUTTON_TEXT.DAY;
        var today = _.get(this.appLocale, 'LABEL_CALENDAR_TODAY') || BUTTON_TEXT.TODAY;
        this.calendarOptions.calendar.buttonText = { year: year, month: month, week: week, day: day, today: today,
            'listYear': year,
            'listMonth': month,
            'listWeek': week,
            'listDay': day
        };
    };
    CalendarComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
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
    };
    CalendarComponent.prototype.onStyleChange = function (key, nv, ov) {
        _super.prototype.onStyleChange.call(this, key, nv, ov);
        if (key === 'height') {
            this.calendarOptions.calendar.height = this.calculateHeight(nv);
            this.updateCalendarOptions('option', 'height', this.calendarOptions.calendar.height);
        }
    };
    CalendarComponent.prototype.onPropertyChange = function (key, nv, ov) {
        _super.prototype.onPropertyChange.call(this, key, nv, ov);
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
                var dataSet = void 0;
                this.dataset = nv;
                dataSet = createArrayFrom(getClonedObject(nv));
                dataSet = this.constructCalendarDataset(dataSet);
                this.dataSetEvents.events = dataSet.filter(function (event) {
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
    };
    // Returns the default date when the datavalue is provided
    CalendarComponent.prototype.getDefaultDate = function () {
        if (this.datavalue) {
            return new Date(this.datavalue);
        }
    };
    CalendarComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        _super.prototype.ngAfterViewInit.call(this);
        if (this.mobileCalendar && this._datepicker) {
            var lastActiveDate_1 = this._datepicker.activeDate;
            // renderview when active date changes
            this._datepicker.activeDateChange.subscribe(function (dt) {
                var prevYear = lastActiveDate_1.getYear();
                var prevMonth = lastActiveDate_1.getMonth();
                var selectedYear = dt.getYear();
                var selectedMonth = dt.getMonth();
                // invoke renderView only when month is changed.
                if (prevMonth !== selectedMonth || prevYear !== selectedYear) {
                    lastActiveDate_1 = dt;
                    _this.renderMobileView(dt);
                }
            });
            this._datepickerInnerComponent = this._datepicker._datePicker;
            this.renderMobileView(moment(this.datavalue));
            this.registerDestroyListener($watch('_datepickerInnerComponent.datepickerMode', this, {}, function (nv, ov) {
                if (ov && !_.isEmpty(ov)) {
                    _this.invokeOnViewRenderback();
                }
            }));
            return;
        }
        this.$fullCalendar = $(this._calendar.nativeElement);
        this.$fullCalendar.fullCalendar(this.calendarOptions.calendar);
        // if the changes are already stacked before calendar renders then execute them when needed
        if (this.changesStack.length) {
            this.changesStack.forEach(function (changeObj) {
                _this.$fullCalendar.fullCalendar(changeObj.operationType, changeObj.argumentKey, changeObj.argumentValue);
            });
            this.changesStack.length = 0;
        }
    };
    CalendarComponent.prototype.updateCalendarOptions = function (operationType, argumentKey, argumentValue) {
        if (!this.$fullCalendar) {
            this.changesStack.push({
                operationType: operationType,
                argumentKey: argumentKey,
                argumentValue: argumentValue
            });
            return;
        }
        this.$fullCalendar.fullCalendar(operationType, argumentKey, argumentValue);
    };
    CalendarComponent.prototype.redraw = function () {
        this.updateCalendarOptions('render');
    };
    // on date change invoke the select event, and if date has event on it then invoke the event click.
    CalendarComponent.prototype.onValueChange = function (value) {
        this.proxyModel = value;
        var selectedDate = this.proxyModel && moment(this.proxyModel).startOf('day').format(dateFormat), selectedEventData = this.eventData[selectedDate], start = moment(this.proxyModel), end = moment(this.proxyModel).endOf('day');
        this.selecteddata = selectedEventData;
        this.selecteddates = {
            'start': moment(selectedDate).valueOf(),
            'end': moment(selectedDate).endOf('day').valueOf()
        };
        this.calendarOptions.calendar.select(start.valueOf(), end.valueOf(), {}, this, selectedEventData);
        if (selectedEventData) {
            this.calendarOptions.calendar.eventClick(selectedEventData, {}, this);
        }
    };
    // returns the custom class for the events depending on the length of the events for that day.
    CalendarComponent.prototype.getDayClass = function (data) {
        var eventDay = data.eventDay;
        if (!_.isEmpty(this.eventData) && this.eventData[eventDay]) {
            var eventsLength = this.eventData[eventDay].length;
            if (eventsLength === 1) {
                return singleEventClass;
            }
            if (eventsLength === 2) {
                return doubleEventClass;
            }
            return multipleEventClass;
        }
        return '';
    };
    // sets the current view and invokes the viewrender method.
    CalendarComponent.prototype.renderMobileView = function (viewObj) {
        var startDate, endDate;
        if (!viewObj) {
            return;
        }
        startDate = moment(viewObj).startOf('month').valueOf();
        endDate = moment(viewObj).endOf('month').valueOf();
        this.currentview = { start: startDate, end: endDate };
        this.invokeOnViewRenderback();
    };
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
    CalendarComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    CalendarComponent.propDecorators = {
        _calendar: [{ type: ViewChild, args: ['calendar',] }],
        _datepicker: [{ type: ViewChild, args: ['datepicker',] }]
    };
    return CalendarComponent;
}(StylableComponent));
export { CalendarComponent };
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jYWxlbmRhci9jYWxlbmRhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLE9BQU8sRUFBbUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQVUsU0FBUyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXZJLE9BQU8sRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLHFCQUFxQixFQUFFLFFBQVEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVwRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFbkUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ25GLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUk1RCxJQUFNLFdBQVcsR0FBRyxjQUFjLENBQUM7QUFDbkMsSUFBTSxXQUFXLEdBQUcsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQy9NLElBQU0sb0JBQW9CLEdBQUc7SUFDekIsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QixNQUFNLEVBQUUsT0FBTztJQUNmLEtBQUssRUFBRSwwQkFBMEI7Q0FDcEMsQ0FBQztBQUNGLElBQU0sVUFBVSxHQUFHO0lBQ2YsS0FBSyxFQUFFLE9BQU87SUFDZCxNQUFN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QUEyRDtJQUNuRCw0Q0FBZ0IsR0FBeEIsVUFBeUIsT0FBTztRQUM1QixJQUFJLFNBQVMsRUFDVCxPQUFPLENBQUM7UUFDWixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsT0FBTztTQUNWO1FBQ0QsU0FBUyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkQsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkQsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUE1aEJNLGlDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVY1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGNBQWM7b0JBQ3hCLDJaQUF3QztvQkFFeEMsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDO3FCQUN4QztvQkFDRCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7aUJBQ3hDOzs7O2dCQXJGZ0UsUUFBUTs7OzRCQXlGcEUsU0FBUyxTQUFDLFVBQVU7OEJBQ3BCLFNBQVMsU0FBQyxZQUFZOztJQTBoQjNCLHdCQUFDO0NBQUEsQUF2aUJELENBU3VDLGlCQUFpQixHQThoQnZEO1NBOWhCWSxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRlUGlja2VySW5uZXJDb21wb25lbnQgfSBmcm9tICduZ3gtYm9vdHN0cmFwL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci1pbm5lci5jb21wb25lbnQnO1xuXG5pbXBvcnQgeyBBZnRlclZpZXdJbml0LCBBZnRlckNvbnRlbnRJbml0LCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBPbkluaXQsIFZpZXdDaGlsZCwgVmlld0VuY2Fwc3VsYXRpb24gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgJHdhdGNoLCBnZXRDbG9uZWRPYmplY3QsIGdldFNlc3Npb25TdG9yYWdlSXRlbSwgaXNNb2JpbGUgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEFQUExZX1NUWUxFU19UWVBFLCBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IElSZWRyYXdhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2NhbGVuZGFyLnByb3BzJztcbmltcG9ydCB7IGdldEV2YWx1YXRlZERhdGEsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IGNyZWF0ZUFycmF5RnJvbSB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2RhdGEtdXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0IF8sICQsIG1vbWVudDtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWNhbGVuZGFyJztcbmNvbnN0IGRhdGVGb3JtYXRzID0gWyd5eXl5LU1NLWRkJywgJ3l5eXktTS1kZCcsICdNLWRkLXl5eXknLCAnTU0tZGQteXknLCAneXl5eSwgZGQgTU1NTScsICd5eXl5LCBNTU0gZGQnLCAnTU0vZGQveXl5eScsICdNL2QveXl5eScsICdFRUUsIGRkIE1NTSB5eXl5JywgJ0VFRSBNTU0gZGQgeXl5eScsICdFRUVFLCBNTU1NIGRkLCB5eXl5JywgJ3RpbWVzdGFtcCddO1xuY29uc3QgZGVmYXVsdEhlYWRlck9wdGlvbnMgPSB7XG4gICAgbGVmdDogJ3ByZXYgbmV4dCB0b2RheScsXG4gICAgY2VudGVyOiAndGl0bGUnLFxuICAgIHJpZ2h0OiAnbW9udGggYmFzaWNXZWVrIGJhc2ljRGF5J1xufTtcbmNvbnN0IFZJRVdfVFlQRVMgPSB7XG4gICAgQkFTSUM6ICdiYXNpYycsXG4gICAgQUdFTkRBOiAnYWdlbmRhJyxcbiAgICBMSVNUOiAnbGlzdCdcbn07XG5jb25zdCBCVVRUT05fVEVYVCA9IHtcbiAgICBZRUFSOiAnWWVhcicsXG4gICAgTU9OVEg6ICdNb250aCcsXG4gICAgV0VFSzogJ1dlZWsnLFxuICAgIERBWTogJ0RheScsXG4gICAgVE9EQVk6ICdUb2RheSdcbn07XG5jb25zdCBTRUxFQ1RJT05fTU9ERVMgPSB7XG4gICAgTk9ORTogJ25vbmUnLFxuICAgIFNJTkdMRTogJ3NpbmdsZScsXG4gICAgTVVMVElQTEU6ICdtdWx0aXBsZSdcbn07XG5jb25zdCBORVhUX0RBWV9USFJFU0hPTEQgPSB7XG4gICAgU1RBUlQ6ICcwMDowMCcsXG4gICAgRU5EOiAnMjQ6MDAnXG59O1xuY29uc3QgZ2V0RXZlbnRNb21lbnRWYWx1ZSA9ICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgbGV0IGlzRGF0ZSA9IGZhbHNlO1xuXG4gICAgZGF0ZUZvcm1hdHMuZm9yRWFjaCgoZm9ybWF0KSA9PiB7XG4gICAgICAgIC8vIG1vbWVudCBzdXBwb3J0cyB1cHBlcmNhc2UgZm9ybWF0c1xuICAgICAgICBpZiAobW9tZW50KHZhbHVlLCBmb3JtYXQudG9VcHBlckNhc2UoKSwgdHJ1ZSkuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICBpc0RhdGUgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBpZiB0aGUgdmFsdWUgaXMgZGF0ZSB0aGVuIGZvciBlbmQgZGF0ZSB0aGUgdmFsdWUgc2hvdWxkIGJlIGVuZCBvZiB0aGUgZGF5IGFzIHRoZSBjYWxlbmRhciBpcyBhcHByb3hpbWF0aW5nIGl0IHRvIHRoZSBzdGFydC5cbiAgICBpZiAoaXNEYXRlICYmIGtleSA9PT0gJ2VuZCcpIHtcbiAgICAgICAgcmV0dXJuIG1vbWVudCh2YWx1ZSkuZW5kT2YoJ2RheScpO1xuICAgIH1cblxuICAgIHJldHVybiBtb21lbnQodmFsdWUpO1xufTtcbmNvbnN0IGdldFVUQ0RhdGVUaW1lID0gKGRhdGVPYmopID0+IHtcbiAgICBkYXRlT2JqID0gXy5pc09iamVjdChkYXRlT2JqKSA/IGRhdGVPYmogOiBtb21lbnQoZGF0ZU9iaik7XG4gICAgY29uc3QgeWVhciA9IGRhdGVPYmouZm9ybWF0KCdZWVlZJyksXG4gICAgICAgIC8vIGphdmFzY3JpcHQgc3RhcnRzIHRoZSBtb250aCBjb3VudCBmcm9tICcwJyB3aGVyZSBhcyBtb21lbnQgcmV0dXJucyB0aGUgaHVtYW4gY291bnRcbiAgICAgICAgbW9udGggPSBkYXRlT2JqLmZvcm1hdCgnTU0nKSAtIDEsXG4gICAgICAgIGRheSA9IGRhdGVPYmouZm9ybWF0KCdERCcpLFxuICAgICAgICBob3VycyA9IGRhdGVPYmouZm9ybWF0KCdISCcpLFxuICAgICAgICBtaW51dGVzID0gZGF0ZU9iai5mb3JtYXQoJ21tJyksXG4gICAgICAgIHNlY29uZHMgPSBkYXRlT2JqLmZvcm1hdCgnc3MnKTtcbiAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGgsIGRheSwgaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMpO1xufTtcbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLWNhbGVuZGFyJywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG4vLyBtb2JpbGUgY2FsZW5kYXIgY2xhc3MgbmFtZXNcbmNvbnN0IG11bHRpcGxlRXZlbnRDbGFzcyA9ICdhcHAtY2FsZW5kYXItZXZlbnQnO1xuY29uc3QgZG91YmxlRXZlbnRDbGFzcyA9IG11bHRpcGxlRXZlbnRDbGFzcyArICcgdHdvJztcbmNvbnN0IHNpbmdsZUV2ZW50Q2xhc3MgPSBtdWx0aXBsZUV2ZW50Q2xhc3MgKyAnIG9uZSc7XG5jb25zdCBkYXRlRm9ybWF0ID0gJ1lZWVkvTU0vREQnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bUNhbGVuZGFyXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2NhbGVuZGFyLmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZVVybHM6IFsnLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Z1bGxjYWxlbmRhci9kaXN0L2Z1bGxjYWxlbmRhci5jc3MnXSxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKENhbGVuZGFyQ29tcG9uZW50KVxuICAgIF0sXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBDYWxlbmRhckNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgQWZ0ZXJWaWV3SW5pdCwgT25Jbml0LCBJUmVkcmF3YWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcbiAgICAvLyBUaGUgY2FsZW5kYXIgZWxlbWVudCByZWZlcmVuY2VcbiAgICBAVmlld0NoaWxkKCdjYWxlbmRhcicpIF9jYWxlbmRhcjogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKCdkYXRlcGlja2VyJykgX2RhdGVwaWNrZXI6IEVsZW1lbnRSZWY7XG5cbiAgICBwdWJsaWMgX2RhdGVwaWNrZXJJbm5lckNvbXBvbmVudDogRGF0ZVBpY2tlcklubmVyQ29tcG9uZW50O1xuXG4gICAgcHVibGljIHNlbGVjdGVkZGF0ZXM6IGFueTtcbiAgICBwdWJsaWMgc2VsZWN0ZWRkYXRhOiBhbnk7XG4gICAgcHVibGljIGN1cnJlbnR2aWV3OiBvYmplY3Q7XG4gICAgcHVibGljIGRhdGFzZXQ6IGFueTtcbiAgICBwdWJsaWMgY2FsZW5kYXJ0eXBlO1xuICAgIHB1YmxpYyBjb250cm9scyA9ICduYXZpZ2F0aW9uLCB0b2RheSwgeWVhciwgbW9udGgsIHdlZWssIGRheSc7XG4gICAgcHVibGljIGRhdGF2YWx1ZTtcbiAgICBwdWJsaWMgZXZlbnR0aXRsZTtcbiAgICBwdWJsaWMgZXZlbnRzdGFydDtcbiAgICBwdWJsaWMgZXZlbnRlbmQ7XG4gICAgcHVibGljIGV2ZW50YWxsZGF5O1xuICAgIHB1YmxpYyBldmVudGNsYXNzO1xuXG4gICAgcHJpdmF0ZSBldmVudFNvdXJjZXM6IEFycmF5PGFueT4gPSBbXTtcblxuICAgIHByaXZhdGUgZGF0YVNldEV2ZW50cyA9IHtcbiAgICAgICAgZXZlbnRzOiBbXVxuICAgIH07XG4gICAgcHJpdmF0ZSBvbGREYXRhO1xuICAgIC8vIG1hcCB0aGUgZnVsbGNhbGVuZGFyIEVsZW1lbnQgcmVuZGVyZWRcbiAgICBwcml2YXRlICRmdWxsQ2FsZW5kYXI7XG4gICAgLy8gbW9kZWwgdG8gdGhlIG1vYmlsZSBjYWxlbmRhclxuICAgIHByaXZhdGUgcHJveHlNb2RlbDtcbiAgICBwcml2YXRlIGV2ZW50RGF0YTtcbiAgICBwcml2YXRlIGV2ZW50cztcbiAgICBwcml2YXRlIGNoYW5nZXNTdGFjayA9IFtdO1xuICAgIHByaXZhdGUgaW52b2tlT25WaWV3UmVuZGVyYmFjayA9IF8uZGVib3VuY2UoKCkgPT4gdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCd2aWV3cmVuZGVyJywgeyAkdmlldzogdGhpcy5jYWxlbmRhck9wdGlvbnMgfSksIDMwMCk7XG5cbiAgICAvLyBjYWxlbmRhck9wdGlvbnMgdG8gdGhlIGNhbGVuZGFyXG4gICAgcHJpdmF0ZSBjYWxlbmRhck9wdGlvbnM6IGFueSA9IHtcbiAgICAgICAgY2FsZW5kYXI6IHtcbiAgICAgICAgICAgIGhlaWdodDogNjAwLFxuICAgICAgICAgICAgZXZlbnRTb3VyY2VzOiB0aGlzLmV2ZW50U291cmNlcyxcbiAgICAgICAgICAgIGVkaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgbG9jYWxlOiBnZXRTZXNzaW9uU3RvcmFnZUl0ZW0oJ3NlbGVjdGVkTG9jYWxlJykgfHwgJ2VuJyxcbiAgICAgICAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgaGVhZGVyOiBkZWZhdWx0SGVhZGVyT3B0aW9ucyxcbiAgICAgICAgICAgIG5leHREYXlUaHJlc2hvbGQ6IE5FWFRfREFZX1RIUkVTSE9MRCxcbiAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgbW9udGg6IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRMaW1pdDogMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1bnNlbGVjdEF1dG86IGZhbHNlLFxuICAgICAgICAgICAgZXZlbnREcm9wOiB0aGlzLmV2ZW50RHJvcC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZXZlbnRSZXNpemVTdGFydDogdGhpcy5vbkV2ZW50Q2hhbmdlU3RhcnQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGV2ZW50RHJhZ1N0YXJ0OiB0aGlzLm9uRXZlbnRDaGFuZ2VTdGFydC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZXZlbnRSZXNpemU6IHRoaXMuZXZlbnRSZXNpemUuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGV2ZW50Q2xpY2s6IHRoaXMuZXZlbnRDbGljay5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgc2VsZWN0OiB0aGlzLnNlbGVjdC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZXZlbnRSZW5kZXI6IHRoaXMuZXZlbnRSZW5kZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHZpZXdSZW5kZXI6IHRoaXMudmlld1JlbmRlci5iaW5kKHRoaXMpXG4gICAgICAgIH1cbiAgICB9O1xuICAgIHB1YmxpYyBtb2JpbGVDYWxlbmRhcjogYm9vbGVhbjtcbiAgICBwcml2YXRlIHZpZXc6IHN0cmluZztcbiAgICBwcml2YXRlIGRheUNsYXNzOiBBcnJheTxhbnk+ID0gW107XG5cbiAgICAvLyB0aGlzIGZ1bmN0aW9uIHNlbGVjdHMgdGhlIGRlZmF1bHQgZGF0ZSBnaXZlbiBmb3IgdGhlIGNhbGVuZGFyXG4gICAgc2VsZWN0RGF0ZSgpIHtcbiAgICAgICAgbGV0IHN0YXJ0LCBlbmQ7XG4gICAgICAgIGlmIChfLmlzT2JqZWN0KHRoaXMuZGF0YXZhbHVlKSkge1xuICAgICAgICAgICAgc3RhcnQgPSB0aGlzLmRhdGF2YWx1ZS5zdGFydDtcbiAgICAgICAgICAgIGVuZCAgID0gdGhpcy5kYXRhdmFsdWUuZW5kO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhcnQgPSBtb21lbnQodGhpcy5kYXRhdmFsdWUpO1xuICAgICAgICAgICAgZW5kICAgPSBtb21lbnQodGhpcy5kYXRhdmFsdWUpLmFkZCgxLCAnZGF5Jykuc3RhcnRPZignZGF5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kZnVsbENhbGVuZGFyLmZ1bGxDYWxlbmRhcignZ290b0RhdGUnLCBzdGFydCk7IC8vIGFmdGVyIHNlbGVjdGluZyB0aGUgZGF0ZSBnbyB0byB0aGUgZGF0ZS5cbiAgICAgICAgdGhpcy4kZnVsbENhbGVuZGFyLmZ1bGxDYWxlbmRhcignc2VsZWN0Jywgc3RhcnQsIGVuZCk7XG4gICAgfVxuXG4gICAgLy8gY2hhbmdlcyB0aGUgY2FsZW5kYXIgdmlldyB0byB0aGUgZGVmYXVsdCBkYXRlIGdpdmVuIGZvciB0aGUgY2FsZW5kYXIuXG4gICAgcHVibGljIGdvdG9EYXRlKCkge1xuICAgICAgICB0aGlzLiRmdWxsQ2FsZW5kYXIuZnVsbENhbGVuZGFyKCdnb3RvRGF0ZScsIG1vbWVudCh0aGlzLmRhdGF2YWx1ZSkpO1xuICAgIH1cblxuICAgIC8vIHRoaXMgZnVuY3Rpb24gdGFrZXMgdGhlIGNhbGVuZGFyIHZpZXcgdG8gdGhlIGEgeWVhciBhaGVhZFxuICAgIHB1YmxpYyBnb3RvTmV4dFllYXIoKSB7XG4gICAgICAgIHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIoJ25leHRZZWFyJyk7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBmdW5jdGlvbiB0YWtlcyB0aGUgY2FsZW5kYXIgdmlldyB0byB0aGUgYSB5ZWFyIGJlZm9yZVxuICAgIHB1YmxpYyBnb3RvUHJldlllYXIoKSB7XG4gICAgICAgIHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIoJ3ByZXZZZWFyJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdGhpcyBmdW5jdGlvbiB0YWtlcyB0aGUgY2FsZW5kYXIgdmlldyB0byB0aGUgc3BlY2lmaWVkIG1vbnRoXG4gICAgICogQHBhcmFtIG1vbnRoVmFsLCAxLTEyIHZhbHVlIG9mIG1vbnRoXG4gICAgICovXG4gICAgcHVibGljIGdvdG9Nb250aChtb250aFZhbCkge1xuICAgICAgICBjb25zdCBwcmVzZW50RGF5ID0gdGhpcy4kZnVsbENhbGVuZGFyLmZ1bGxDYWxlbmRhcignZ2V0RGF0ZScpO1xuICAgICAgICBjb25zdCBwcmVzZW50TW9udGhWYWwgPSBuZXcgRGF0ZShwcmVzZW50RGF5KS5nZXRNb250aCgpO1xuICAgICAgICBpZiAocHJlc2VudE1vbnRoVmFsIDwgbW9udGhWYWwpIHtcbiAgICAgICAgICAgIHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIoJ2dvdG9EYXRlJywgcHJlc2VudERheS5hZGQobW9udGhWYWwgLSBwcmVzZW50TW9udGhWYWwgLSAxLCAnTScpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIoJ2dvdG9EYXRlJywgcHJlc2VudERheS5zdWJ0cmFjdCggcHJlc2VudE1vbnRoVmFsIC0gbW9udGhWYWwgKyAxLCAnTScpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRoaXMgZnVuY3Rpb24gdGFrZXMgdGhlIGNhbGVuZGFyIHZpZXcgdG8gdGhlIGEgbW9udGggYWhlYWRcbiAgICBwdWJsaWMgZ290b05leHRNb250aCgpIHtcbiAgICAgICAgY29uc3QgcHJlc2VudERheSA9IHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIoJ2dldERhdGUnKTtcbiAgICAgICAgdGhpcy4kZnVsbENhbGVuZGFyLmZ1bGxDYWxlbmRhcignZ290b0RhdGUnLCBwcmVzZW50RGF5LmFkZCgxLCAnTScpKTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIGZ1bmN0aW9uIHRha2VzIHRoZSBjYWxlbmRhciB2aWV3IHRvIHRoZSBhIG1vbnRoIGJlZm9yZVxuICAgIHB1YmxpYyBnb3RvUHJldk1vbnRoKCkge1xuICAgICAgICBjb25zdCBwcmVzZW50RGF5ID0gdGhpcy4kZnVsbENhbGVuZGFyLmZ1bGxDYWxlbmRhcignZ2V0RGF0ZScpO1xuICAgICAgICB0aGlzLiRmdWxsQ2FsZW5kYXIuZnVsbENhbGVuZGFyKCdnb3RvRGF0ZScsIHByZXNlbnREYXkuc3VidHJhY3QoMSwgJ00nKSk7XG4gICAgfVxuXG5cbiAgICAvLyB0aGlzIGZ1bmN0aW9uIHJlLXJlbmRlcnMgdGhlIGV2ZW50cyBhc3NpZ25lZCB0byB0aGUgY2FsZW5kYXIuXG4gICAgcHJpdmF0ZSByZXJlbmRlckV2ZW50cygpIHtcbiAgICAgICAgdGhpcy4kZnVsbENhbGVuZGFyLmZ1bGxDYWxlbmRhcigncmVyZW5kZXJFdmVudHMnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldFNlbGVjdGVkRGF0YShzdGFydCwgZW5kKSB7XG4gICAgICAgIGxldCBkYXRhc2V0ID0gdGhpcy5kYXRhc2V0O1xuICAgICAgICBpZiAoIWRhdGFzZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbHRlcmVkRGF0ZXMgPSBbXTtcbiAgICAgICAgY29uc3QgZXZlbnRTdGFydEtleSA9IHRoaXMuZXZlbnRzdGFydCB8fCAnc3RhcnQnO1xuICAgICAgICBjb25zdCBldmVudEVuZEtleSA9IHRoaXMuZXZlbnRlbmQgfHwgJ2VuZCc7XG4gICAgICAgIGNvbnN0IHN0YXJ0RGF0ZSA9IG1vbWVudChuZXcgRGF0ZShzdGFydCkpLmZvcm1hdCgnTU0vREQvWVlZWScpO1xuICAgICAgICBjb25zdCBlbmREYXRlID0gbW9tZW50KG5ldyBEYXRlKGVuZCkpLnN1YnRyYWN0KDEsICdkYXlzJykuZm9ybWF0KCdNTS9ERC9ZWVlZJyk7XG5cbiAgICAgICAgZGF0YXNldCA9IGRhdGFzZXQuZGF0YSB8fCBkYXRhc2V0O1xuICAgICAgICBkYXRhc2V0LmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXZhbHVlW2V2ZW50U3RhcnRLZXldKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZXZlbnRTdGFydERhdGUgICA9IG1vbWVudChuZXcgRGF0ZSh2YWx1ZVtldmVudFN0YXJ0S2V5XSkpLmZvcm1hdCgnTU0vREQvWVlZWScpO1xuICAgICAgICAgICAgY29uc3QgZXZlbnRFbmREYXRlICAgPSBtb21lbnQobmV3IERhdGUodmFsdWVbZXZlbnRFbmRLZXldIHx8IHZhbHVlW2V2ZW50U3RhcnRLZXldKSkuZm9ybWF0KCdNTS9ERC9ZWVlZJyk7XG4gICAgICAgICAgICBjb25zdCBldmVudEV4aXN0cyA9IG1vbWVudChldmVudFN0YXJ0RGF0ZSkuaXNTYW1lT3JBZnRlcihzdGFydERhdGUpICYmIG1vbWVudChldmVudEVuZERhdGUpLmlzU2FtZU9yQmVmb3JlKGVuZERhdGUpO1xuICAgICAgICAgICAgaWYgKGV2ZW50RXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgZmlsdGVyZWREYXRlcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXJlZERhdGVzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXZlbnREcm9wKCRuZXdEYXRhLCAkZGVsdGEsICRyZXZlcnRGdW5jLCAkZXZlbnQsICR1aSwgJHZpZXcpIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdldmVudGRyb3AnLCB7JGV2ZW50LCAkbmV3RGF0YSwgJG9sZERhdGE6IHRoaXMub2xkRGF0YSwgJGRlbHRhLCAkcmV2ZXJ0RnVuYywgJHVpLCAkdmlld30pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VsZWN0KHN0YXJ0LCBlbmQsIGpzRXZlbnQsICR2aWV3KSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRkYXRlcyA9IHtzdGFydDogZ2V0VVRDRGF0ZVRpbWUoc3RhcnQpLCBlbmQ6IGdldFVUQ0RhdGVUaW1lKGVuZCl9O1xuICAgICAgICB0aGlzLnNlbGVjdGVkZGF0YSA9IHRoaXMuc2V0U2VsZWN0ZWREYXRhKHN0YXJ0LCBlbmQpO1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3NlbGVjdCcsIHskc3RhcnQ6IHN0YXJ0LnZhbHVlT2YoKSwgJGVuZDogZW5kLnZhbHVlT2YoKSwgJHZpZXcsICRkYXRhOiB0aGlzLnNlbGVjdGVkZGF0YX0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXZlbnRSZXNpemUoJG5ld0RhdGEsICRkZWx0YSwgJHJldmVydEZ1bmMsICRldmVudCwgJHVpLCAkdmlldykge1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2V2ZW50cmVzaXplJywgeyRldmVudCwgJG5ld0RhdGEsICRvbGREYXRhOiB0aGlzLm9sZERhdGEsICRkZWx0YSwgJHJldmVydEZ1bmMsICR1aSwgJHZpZXd9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRXZlbnRDaGFuZ2VTdGFydChldmVudCkge1xuICAgICAgICB0aGlzLm9sZERhdGEgPSBnZXRDbG9uZWRPYmplY3QoZXZlbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXZlbnRDbGljaygkZGF0YSwgJGV2ZW50LCAkdmlldykge1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2V2ZW50Y2xpY2snLCB7JGV2ZW50LCAkZGF0YSwgJHZpZXd9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGV2ZW50UmVuZGVyKCRkYXRhLCAkZXZlbnQsICR2aWV3KSB7XG4gICAgICAgIGlmICh0aGlzLmNhbGVuZGFydHlwZSA9PT0gVklFV19UWVBFUy5MSVNUKSB7XG4gICAgICAgICAgICB0aGlzLiRmdWxsQ2FsZW5kYXIuZmluZCgnLmZjLWxpc3QtdGFibGUnKS5hZGRDbGFzcygndGFibGUnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2V2ZW50cmVuZGVyJywgeyRldmVudCwgJGRhdGEsICR2aWV3fSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aWV3UmVuZGVyKCR2aWV3KSB7XG4gICAgICAgIHRoaXMuY3VycmVudHZpZXcgPSB7c3RhcnQ6ICR2aWV3LnN0YXJ0LmZvcm1hdCgpLCBlbmQ6ICR2aWV3LmVuZC5zdWJ0cmFjdCgxLCAnZGF5cycpLmZvcm1hdCgpfTtcbiAgICAgICAgaWYgKHRoaXMuY2FsZW5kYXJ0eXBlID09PSBWSUVXX1RZUEVTLkxJU1QpIHtcbiAgICAgICAgICAgIHRoaXMuJGZ1bGxDYWxlbmRhci5maW5kKCcuZmMtbGlzdC10YWJsZScpLmFkZENsYXNzKCd0YWJsZScpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygndmlld3JlbmRlcicsIHskdmlld30pO1xuICAgIH1cblxuICAgIC8vIHVwZGF0ZSB0aGUgY2FsZW5kYXIgaGVhZGVyIG9wdGlvbnMgb25jZSB0aGUgY29udHJvbHMgY2hhbmdlc1xuICAgIHByaXZhdGUgdXBkYXRlQ2FsZW5kYXJIZWFkZXJPcHRpb25zKCkge1xuICAgICAgICBjb25zdCBjdHJscyA9IHRoaXMuY29udHJvbHMsIHZpZXdUeXBlID0gdGhpcy5jYWxlbmRhcnR5cGUsXG4gICAgICAgICAgICByZWdFeCA9IG5ldyBSZWdFeHAoJ1xcXFxiZGF5XFxcXGInLCAnZycpO1xuICAgICAgICBsZXQgbGVmdCA9ICcnLCByaWdodCA9ICcnO1xuICAgICAgICBpZiAoY3RybHMgJiYgdmlld1R5cGUpIHtcbiAgICAgICAgICAgIGlmIChfLmluY2x1ZGVzKGN0cmxzLCAnbmF2aWdhdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgbGVmdCArPSAnIHByZXYgbmV4dCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLmluY2x1ZGVzKGN0cmxzLCAndG9kYXknKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgKz0gJyB0b2RheSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLmluY2x1ZGVzKGN0cmxzLCAneWVhcicpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgKz0gKHZpZXdUeXBlID09PSBWSUVXX1RZUEVTLkxJU1QpID8gJ2xpc3RZZWFyJyA6ICcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXy5pbmNsdWRlcyhjdHJscywgJ21vbnRoJykpIHtcbiAgICAgICAgICAgICAgICByaWdodCArPSAodmlld1R5cGUgPT09IFZJRVdfVFlQRVMuTElTVCkgPyAnIGxpc3RNb250aCcgOiAnIG1vbnRoJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKF8uaW5jbHVkZXMoY3RybHMsICd3ZWVrJykpIHtcbiAgICAgICAgICAgICAgICByaWdodCArPSAodmlld1R5cGUgPT09IFZJRVdfVFlQRVMuQkFTSUMpID8gICcgYmFzaWNXZWVrJyA6ICh2aWV3VHlwZSA9PT0gVklFV19UWVBFUy5MSVNUKSA/ICcgbGlzdFdlZWsnIDogJyBhZ2VuZGFXZWVrJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlZ0V4LnRlc3QoY3RybHMpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgKz0gKHZpZXdUeXBlID09PSBWSUVXX1RZUEVTLkJBU0lDKSA/ICAnIGJhc2ljRGF5JyA6ICh2aWV3VHlwZSA9PT0gVklFV19UWVBFUy5MSVNUKSA/ICcgbGlzdERheScgOiAnIGFnZW5kYURheSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uZXh0ZW5kKHRoaXMuY2FsZW5kYXJPcHRpb25zLmNhbGVuZGFyLmhlYWRlciwgeydsZWZ0JzogbGVmdCwgJ3JpZ2h0JzogcmlnaHR9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRvIGNhbGN1bGF0ZSB0aGUgaGVpZ2h0IGZvciB0aGUgZXZlbnQgbGltaXQgYW5kIHBhcnNpbmcgdGhlIHZhbHVlIHdoZW4gaXQgaXMgcGVyY2VudGFnZSBiYXNlZC5cbiAgICBwcml2YXRlIGNhbGN1bGF0ZUhlaWdodChoZWlnaHQpOiBudW1iZXIge1xuICAgICAgICBjb25zdCAkcGFyZW50ID0gJCh0aGlzLm5hdGl2ZUVsZW1lbnQpLnBhcmVudCgpLFxuICAgICAgICAgICAgZWxIZWlnaHQgPSBoZWlnaHQgfHwgJzY1MHB4JztcblxuICAgICAgICBsZXQgcGFyZW50SGVpZ2h0ID0gJHBhcmVudC5jc3MoJ2hlaWdodCcpLFxuICAgICAgICAgICAgY29tcHV0ZWRIZWlnaHQ6IG51bWJlcjtcblxuICAgICAgICBpZiAoXy5pbmNsdWRlcyhlbEhlaWdodCwgJyUnKSkge1xuICAgICAgICAgICAgaWYgKF8uaW5jbHVkZXMocGFyZW50SGVpZ2h0LCAnJScpKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50SGVpZ2h0ID0gJHBhcmVudC5oZWlnaHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXB1dGVkSGVpZ2h0ID0gKHBhcnNlSW50KHBhcmVudEhlaWdodCwgMTApICogTnVtYmVyKGVsSGVpZ2h0LnJlcGxhY2UoL1xcJS9nLCAnJykpKSAvIDEwMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbXB1dGVkSGVpZ2h0ID0gcGFyc2VJbnQoZWxIZWlnaHQsIDEwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGVuZGFyT3B0aW9ucy5jYWxlbmRhci52aWV3cy5tb250aC5ldmVudExpbWl0ID0gcGFyc2VJbnQoJycgKyBjb21wdXRlZEhlaWdodCAvIDIwMCwgMTApICsgMTtcbiAgICAgICAgcmV0dXJuIGNvbXB1dGVkSGVpZ2h0O1xuICAgIH1cblxuICAgIHByaXZhdGUgdHJpZ2dlck1vYmlsZUNhbGVuZGFyQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnByZXBhcmVDYWxlbmRhckV2ZW50cygpO1xuICAgICAgICAvLyBjaGFuZ2UgdGhlIG1vZGVsIHNvIHRoYXQgdGhlIHZpZXcgaXMgcmVuZGVyZWQgYWdhaW4gd2l0aCB0aGUgZXZlbnRzICwgYWZ0ZXIgdGhlIGRhdGFzZXQgaXMgY2hhbmdlZC5cbiAgICAgICAgdGhpcy5wcm94eU1vZGVsID0gdGhpcy5wcm94eU1vZGVsIHx8IG1vbWVudCgpLnZhbHVlT2YoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZGRhdGVzID0ge1xuICAgICAgICAgICAgc3RhcnQ6IG1vbWVudCh0aGlzLnByb3h5TW9kZWwpLnZhbHVlT2YoKSxcbiAgICAgICAgICAgIGVuZCAgOiBtb21lbnQodGhpcy5wcm94eU1vZGVsKS5lbmRPZignZGF5JykudmFsdWVPZigpXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnZXZlbnRyZW5kZXInLCB7JGRhdGE6IHRoaXMuZXZlbnREYXRhfSk7XG4gICAgfVxuXG4gICAgLy8gcHJlcGFyZXMgZXZlbnRzIGZvciB0aGUgbW9iaWUgY2FsZW5kYXJcbiAgICBwcml2YXRlIHByZXBhcmVDYWxlbmRhckV2ZW50cyAoKSB7XG4gICAgICAgIGxldCBldmVudERheSxcbiAgICAgICAgICAgIGRhdGFzZXQ7XG4gICAgICAgIHRoaXMuZXZlbnREYXRhID0ge307XG4gICAgICAgIGlmICghdGhpcy5kYXRhc2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZGF0YXNldCA9IHRoaXMuZGF0YXNldDtcbiAgICAgICAgZGF0YXNldCA9IF8uaXNBcnJheShkYXRhc2V0KSA/IGRhdGFzZXQgOiAoXy5pc09iamVjdChkYXRhc2V0KSA/IFtkYXRhc2V0XSA6IFtdKTtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBkYXRhc2V0IHx8IHRoaXMuY29uc3RydWN0Q2FsZW5kYXJEYXRhc2V0KGRhdGFzZXQpO1xuICAgICAgICB0aGlzLmV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXZlbnRTdGFydCA9IGV2ZW50LnN0YXJ0IHx8IGV2ZW50W3RoaXMuZXZlbnRzdGFydF07XG4gICAgICAgICAgICBpZiAoZXZlbnRTdGFydCkge1xuICAgICAgICAgICAgICAgIGV2ZW50RGF5ID0gbW9tZW50KGV2ZW50U3RhcnQpLnN0YXJ0T2YoJ2RheScpLmZvcm1hdChkYXRlRm9ybWF0KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ldmVudERhdGFbZXZlbnREYXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnREYXRhW2V2ZW50RGF5XS5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV2ZW50RGF0YVtldmVudERheV0gPSBbZXZlbnRdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vYmlsZUNhbGVuZGFyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGN1c3RvbSBjbGFzcyBvbiB0aGUgZGF0ZSBpbiB0aGUgZGF0ZSBwaWNrZXIuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF5Q2xhc3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiBuZXcgRGF0ZShldmVudFN0YXJ0KS5zZXRIb3VycygwLCAwLCAwLCAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGU6ICdkYXknLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xheno6IHRoaXMuZ2V0RGF5Q2xhc3Moe2V2ZW50RGF5OiBldmVudERheX0pXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGFkZCB0aGUgZXZlbnREYXRhIG9uIHRoZSBjYWxlbmRhciBieSBjYWxsaW5nIHJlZnJlc2hWaWV3XG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUNhbGVuZGFyICYmIHRoaXMuX2RhdGVwaWNrZXJJbm5lckNvbXBvbmVudCkge1xuICAgICAgICAgICAgdGhpcy5fZGF0ZXBpY2tlcklubmVyQ29tcG9uZW50LnJlZnJlc2hWaWV3KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb25zdHJ1Y3RzIHRoZSBjYWxlbmRhciBkYXRhc2V0IGJ5IG1hcHBpbmcgdGhlIGV2ZW50c3RhcnQsIGV2ZW50ZW5kLCBldmVudHRpdGxlIGV0Yy4sXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RDYWxlbmRhckRhdGFzZXQoZXZlbnRTb3VyY2UpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHtcbiAgICAgICAgICAgIHRpdGxlOiB0aGlzLmV2ZW50dGl0bGUgfHwgJ3RpdGxlJyxcbiAgICAgICAgICAgIGFsbERheTogdGhpcy5ldmVudGFsbGRheSB8fCAnYWxsZGF5JyxcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmV2ZW50c3RhcnQgfHwgJ3N0YXJ0JyxcbiAgICAgICAgICAgIGVuZDogdGhpcy5ldmVudGVuZCB8fCAnZW5kJyxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogdGhpcy5ldmVudGNsYXNzIHx8ICdjbGFzc05hbWUnXG4gICAgICAgIH07XG5cbiAgICAgICAgZXZlbnRTb3VyY2UuZm9yRWFjaCgob2JqKSA9PiB7XG4gICAgICAgICAgICBfLm1hcEtleXMocHJvcGVydGllcywgICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG9ialZhbDtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAndGl0bGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialZhbCA9IGdldEV2YWx1YXRlZERhdGEob2JqLCB7ZXhwcmVzc2lvbjogdmFsdWV9LCB0aGlzLnZpZXdQYXJlbnQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnYWxsRGF5Jykge1xuICAgICAgICAgICAgICAgICAgICBvYmpWYWwgPSAhIV8uZ2V0KG9iaiwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialZhbCA9IF8uZ2V0KG9iaiwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIW9ialZhbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdGFydCcgfHwga2V5ID09PSAnZW5kJykge1xuICAgICAgICAgICAgICAgICAgICBvYmpWYWwgPSBnZXRFdmVudE1vbWVudFZhbHVlKG9ialZhbCwga2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb2JqW2tleV0gPSBvYmpWYWw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBldmVudFNvdXJjZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldExvY2FsZSgpIHtcbiAgICAgICAgY29uc3QgeWVhciA9IF8uZ2V0KHRoaXMuYXBwTG9jYWxlLCAnTEFCRUxfQ0FMRU5EQVJfWUVBUicpIHx8IEJVVFRPTl9URVhULllFQVI7XG4gICAgICAgIGNvbnN0IG1vbnRoID0gXy5nZXQodGhpcy5hcHBMb2NhbGUsICdMQUJFTF9DQUxFTkRBUl9NT05USCcpIHx8IEJVVFRPTl9URVhULk1PTlRIO1xuICAgICAgICBjb25zdCB3ZWVrID0gXy5nZXQodGhpcy5hcHBMb2NhbGUsICdMQUJFTF9DQUxFTkRBUl9XRUVLJykgfHwgQlVUVE9OX1RFWFQuV0VFSztcbiAgICAgICAgY29uc3QgZGF5ID0gXy5nZXQodGhpcy5hcHBMb2NhbGUsICdMQUJFTF9DQUxFTkRBUl9EQVknKSB8fCBCVVRUT05fVEVYVC5EQVk7XG4gICAgICAgIGNvbnN0IHRvZGF5ID0gXy5nZXQodGhpcy5hcHBMb2NhbGUsICdMQUJFTF9DQUxFTkRBUl9UT0RBWScpIHx8IEJVVFRPTl9URVhULlRPREFZO1xuICAgICAgICB0aGlzLmNhbGVuZGFyT3B0aW9ucy5jYWxlbmRhci5idXR0b25UZXh0ICAgID0geyB5ZWFyLCBtb250aCwgd2VlaywgZGF5LCB0b2RheSxcbiAgICAgICAgICAgICdsaXN0WWVhcic6IHllYXIsXG4gICAgICAgICAgICAnbGlzdE1vbnRoJzogbW9udGgsXG4gICAgICAgICAgICAnbGlzdFdlZWsnOiB3ZWVrLFxuICAgICAgICAgICAgJ2xpc3REYXknOiBkYXlcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgdGhpcy5tb2JpbGVDYWxlbmRhciA9IGlzTW9iaWxlKCk7XG4gICAgICAgIHRoaXMuZXZlbnRTb3VyY2VzLnB1c2godGhpcy5kYXRhU2V0RXZlbnRzKTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuQ09OVEFJTkVSLCBbJ2hlaWdodCddKTtcblxuICAgICAgICBpZiAodGhpcy5tb2JpbGVDYWxlbmRhcikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZpZXcgfHwgdGhpcy52aWV3ID09PSAnd2VlaycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXcgPSAnZGF5JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlck1vYmlsZUNhbGVuZGFyQ2hhbmdlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldExvY2FsZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25TdHlsZUNoYW5nZShrZXksIG52LCBvdj8pIHtcbiAgICAgICAgc3VwZXIub25TdHlsZUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIGlmIChrZXkgPT09ICdoZWlnaHQnKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGVuZGFyT3B0aW9ucy5jYWxlbmRhci5oZWlnaHQgPSB0aGlzLmNhbGN1bGF0ZUhlaWdodChudik7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbGVuZGFyT3B0aW9ucygnb3B0aW9uJywgJ2hlaWdodCcsIHRoaXMuY2FsZW5kYXJPcHRpb25zLmNhbGVuZGFyLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92Pykge1xuICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdGlvbm1vZGUnOlxuICAgICAgICAgICAgICAgIGlmIChudiAhPT0gU0VMRUNUSU9OX01PREVTLk5PTkUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxlbmRhck9wdGlvbnMuY2FsZW5kYXIuc2VsZWN0YWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsZW5kYXJPcHRpb25zKCdvcHRpb24nLCAnc2VsZWN0YWJsZScsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnYgPT09IFNFTEVDVElPTl9NT0RFUy5TSU5HTEUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsZW5kYXJPcHRpb25zLmNhbGVuZGFyLnNlbGVjdENvbnN0cmFpbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6ICcwMDowMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kOiAnMjQ6MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYWxlbmRhck9wdGlvbnMoJ29wdGlvbicsICdzZWxlY3RDb25zdHJhaW50JywgdGhpcy5jYWxlbmRhck9wdGlvbnMuY2FsZW5kYXIuc2VsZWN0Q29uc3RyYWludCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbGVuZGFyT3B0aW9ucygnb3B0aW9uJywgJ3NlbGVjdENvbnN0cmFpbnQnLCB7fSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGVuZGFyT3B0aW9ucy5jYWxlbmRhci5zZWxlY3RhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsZW5kYXJPcHRpb25zKCdvcHRpb24nLCAnc2VsZWN0YWJsZScsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2aWV3JzpcbiAgICAgICAgICAgICAgICBpZiAobnYgIT09ICdtb250aCcgfHwgdGhpcy5jYWxlbmRhcnR5cGUgPT09IFZJRVdfVFlQRVMuTElTVCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGVuZGFyT3B0aW9ucy5jYWxlbmRhci5kZWZhdWx0VmlldyA9IHRoaXMuY2FsZW5kYXJ0eXBlICsgXy5jYXBpdGFsaXplKG52KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGVuZGFyT3B0aW9ucy5jYWxlbmRhci5kZWZhdWx0VmlldyA9IG52O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbGVuZGFyT3B0aW9ucygnY2hhbmdlVmlldycsIHRoaXMuY2FsZW5kYXJPcHRpb25zLmNhbGVuZGFyLmRlZmF1bHRWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NhbGVuZGFydHlwZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxlbmRhcnR5cGUgPSBudiB8fCAnYmFzaWMnO1xuICAgICAgICAgICAgY2FzZSAnY29udHJvbHMnOlxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsZW5kYXJIZWFkZXJPcHRpb25zKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkYXRhc2V0JzpcbiAgICAgICAgICAgICAgICBsZXQgZGF0YVNldDtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFzZXQgPSBudjtcbiAgICAgICAgICAgICAgICBkYXRhU2V0ID0gY3JlYXRlQXJyYXlGcm9tKGdldENsb25lZE9iamVjdChudikpO1xuICAgICAgICAgICAgICAgIGRhdGFTZXQgPSB0aGlzLmNvbnN0cnVjdENhbGVuZGFyRGF0YXNldChkYXRhU2V0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFTZXRFdmVudHMuZXZlbnRzID0gZGF0YVNldC5maWx0ZXIoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0YXJ0ID0gZXZlbnQuc3RhcnQgfHwgZXZlbnQuZW5kO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQuc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb2JpbGVDYWxlbmRhcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJNb2JpbGVDYWxlbmRhckNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsZW5kYXJPcHRpb25zKCdyZW1vdmVFdmVudHMnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYWxlbmRhck9wdGlvbnMoJ2FkZEV2ZW50U291cmNlJywgdGhpcy5kYXRhU2V0RXZlbnRzLmV2ZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsZW5kYXJPcHRpb25zKCdyZXJlbmRlckV2ZW50cycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybnMgdGhlIGRlZmF1bHQgZGF0ZSB3aGVuIHRoZSBkYXRhdmFsdWUgaXMgcHJvdmlkZWRcbiAgICBnZXREZWZhdWx0RGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGF0YXZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUodGhpcy5kYXRhdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcblxuICAgICAgICBpZiAodGhpcy5tb2JpbGVDYWxlbmRhciAmJiB0aGlzLl9kYXRlcGlja2VyKSB7XG4gICAgICAgICAgICBsZXQgbGFzdEFjdGl2ZURhdGUgPSAodGhpcy5fZGF0ZXBpY2tlciBhcyBhbnkpLmFjdGl2ZURhdGU7XG4gICAgICAgICAgICAvLyByZW5kZXJ2aWV3IHdoZW4gYWN0aXZlIGRhdGUgY2hhbmdlc1xuICAgICAgICAgICAgKHRoaXMuX2RhdGVwaWNrZXIgYXMgYW55KS5hY3RpdmVEYXRlQ2hhbmdlLnN1YnNjcmliZSgoZHQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2WWVhciA9IGxhc3RBY3RpdmVEYXRlLmdldFllYXIoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2TW9udGggPSBsYXN0QWN0aXZlRGF0ZS5nZXRNb250aCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkWWVhciA9IGR0LmdldFllYXIoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZE1vbnRoID0gZHQuZ2V0TW9udGgoKTtcblxuICAgICAgICAgICAgICAgIC8vIGludm9rZSByZW5kZXJWaWV3IG9ubHkgd2hlbiBtb250aCBpcyBjaGFuZ2VkLlxuICAgICAgICAgICAgICAgIGlmIChwcmV2TW9udGggIT09IHNlbGVjdGVkTW9udGggfHwgcHJldlllYXIgIT09IHNlbGVjdGVkWWVhcikge1xuICAgICAgICAgICAgICAgICAgICBsYXN0QWN0aXZlRGF0ZSA9IGR0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlck1vYmlsZVZpZXcoZHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9kYXRlcGlja2VySW5uZXJDb21wb25lbnQgPSAodGhpcy5fZGF0ZXBpY2tlciBhcyBhbnkpLl9kYXRlUGlja2VyO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJNb2JpbGVWaWV3KG1vbWVudCh0aGlzLmRhdGF2YWx1ZSkpO1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAkd2F0Y2goXG4gICAgICAgICAgICAgICAgICAgICdfZGF0ZXBpY2tlcklubmVyQ29tcG9uZW50LmRhdGVwaWNrZXJNb2RlJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgIChudiwgb3YpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvdiAmJiAhXy5pc0VtcHR5KG92KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlT25WaWV3UmVuZGVyYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuJGZ1bGxDYWxlbmRhciA9ICQodGhpcy5fY2FsZW5kYXIubmF0aXZlRWxlbWVudCk7XG4gICAgICAgIHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIodGhpcy5jYWxlbmRhck9wdGlvbnMuY2FsZW5kYXIpO1xuICAgICAgICAvLyBpZiB0aGUgY2hhbmdlcyBhcmUgYWxyZWFkeSBzdGFja2VkIGJlZm9yZSBjYWxlbmRhciByZW5kZXJzIHRoZW4gZXhlY3V0ZSB0aGVtIHdoZW4gbmVlZGVkXG4gICAgICAgIGlmICh0aGlzLmNoYW5nZXNTdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlc1N0YWNrLmZvckVhY2goKGNoYW5nZU9iaikgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIoY2hhbmdlT2JqLm9wZXJhdGlvblR5cGUsIGNoYW5nZU9iai5hcmd1bWVudEtleSwgY2hhbmdlT2JqLmFyZ3VtZW50VmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZXNTdGFjay5sZW5ndGggPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FsZW5kYXJPcHRpb25zKG9wZXJhdGlvblR5cGU6IHN0cmluZywgYXJndW1lbnRLZXk/OiBhbnksIGFyZ3VtZW50VmFsdWU/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLiRmdWxsQ2FsZW5kYXIpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlc1N0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvblR5cGU6IG9wZXJhdGlvblR5cGUsXG4gICAgICAgICAgICAgICAgYXJndW1lbnRLZXk6IGFyZ3VtZW50S2V5LFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50VmFsdWU6IGFyZ3VtZW50VmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJGZ1bGxDYWxlbmRhci5mdWxsQ2FsZW5kYXIob3BlcmF0aW9uVHlwZSwgYXJndW1lbnRLZXksIGFyZ3VtZW50VmFsdWUpO1xuICAgIH1cblxuICAgIHJlZHJhdygpIHtcbiAgICAgICAgdGhpcy51cGRhdGVDYWxlbmRhck9wdGlvbnMoJ3JlbmRlcicpO1xuICAgIH1cblxuICAgIC8vIG9uIGRhdGUgY2hhbmdlIGludm9rZSB0aGUgc2VsZWN0IGV2ZW50LCBhbmQgaWYgZGF0ZSBoYXMgZXZlbnQgb24gaXQgdGhlbiBpbnZva2UgdGhlIGV2ZW50IGNsaWNrLlxuICAgIHByaXZhdGUgb25WYWx1ZUNoYW5nZSh2YWx1ZTogRGF0ZSk6IHZvaWQge1xuICAgICAgICB0aGlzLnByb3h5TW9kZWwgPSB2YWx1ZTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWREYXRlICAgICAgICA9IHRoaXMucHJveHlNb2RlbCAmJiBtb21lbnQodGhpcy5wcm94eU1vZGVsKS5zdGFydE9mKCdkYXknKS5mb3JtYXQoZGF0ZUZvcm1hdCksXG4gICAgICAgICAgICBzZWxlY3RlZEV2ZW50RGF0YSAgID0gdGhpcy5ldmVudERhdGFbc2VsZWN0ZWREYXRlXSxcbiAgICAgICAgICAgIHN0YXJ0ICAgICAgICAgICAgICAgPSBtb21lbnQodGhpcy5wcm94eU1vZGVsKSxcbiAgICAgICAgICAgIGVuZCAgICAgICAgICAgICAgICAgPSBtb21lbnQodGhpcy5wcm94eU1vZGVsKS5lbmRPZignZGF5Jyk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRkYXRhID0gc2VsZWN0ZWRFdmVudERhdGE7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRkYXRlcyA9IHtcbiAgICAgICAgICAgICdzdGFydCc6IG1vbWVudChzZWxlY3RlZERhdGUpLnZhbHVlT2YoKSxcbiAgICAgICAgICAgICdlbmQnICA6IG1vbWVudChzZWxlY3RlZERhdGUpLmVuZE9mKCdkYXknKS52YWx1ZU9mKClcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jYWxlbmRhck9wdGlvbnMuY2FsZW5kYXIuc2VsZWN0KHN0YXJ0LnZhbHVlT2YoKSwgZW5kLnZhbHVlT2YoKSwge30sIHRoaXMsIHNlbGVjdGVkRXZlbnREYXRhKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkRXZlbnREYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGVuZGFyT3B0aW9ucy5jYWxlbmRhci5ldmVudENsaWNrKHNlbGVjdGVkRXZlbnREYXRhLCB7fSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZXR1cm5zIHRoZSBjdXN0b20gY2xhc3MgZm9yIHRoZSBldmVudHMgZGVwZW5kaW5nIG9uIHRoZSBsZW5ndGggb2YgdGhlIGV2ZW50cyBmb3IgdGhhdCBkYXkuXG4gICAgcHJpdmF0ZSBnZXREYXlDbGFzcyhkYXRhKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50RGF5ID0gZGF0YS5ldmVudERheTtcblxuICAgICAgICBpZiAoIV8uaXNFbXB0eSh0aGlzLmV2ZW50RGF0YSkgJiYgdGhpcy5ldmVudERhdGFbZXZlbnREYXldKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudHNMZW5ndGggPSB0aGlzLmV2ZW50RGF0YVtldmVudERheV0ubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKGV2ZW50c0xlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzaW5nbGVFdmVudENsYXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZW50c0xlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb3VibGVFdmVudENsYXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG11bHRpcGxlRXZlbnRDbGFzcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgLy8gc2V0cyB0aGUgY3VycmVudCB2aWV3IGFuZCBpbnZva2VzIHRoZSB2aWV3cmVuZGVyIG1ldGhvZC5cbiAgICBwcml2YXRlIHJlbmRlck1vYmlsZVZpZXcodmlld09iaikge1xuICAgICAgICBsZXQgc3RhcnREYXRlLFxuICAgICAgICAgICAgZW5kRGF0ZTtcbiAgICAgICAgaWYgKCF2aWV3T2JqKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc3RhcnREYXRlID0gbW9tZW50KHZpZXdPYmopLnN0YXJ0T2YoJ21vbnRoJykudmFsdWVPZigpO1xuICAgICAgICBlbmREYXRlID0gbW9tZW50KHZpZXdPYmopLmVuZE9mKCdtb250aCcpLnZhbHVlT2YoKTtcbiAgICAgICAgdGhpcy5jdXJyZW50dmlldyA9IHtzdGFydDogc3RhcnREYXRlLCBlbmQ6IGVuZERhdGV9O1xuICAgICAgICB0aGlzLmludm9rZU9uVmlld1JlbmRlcmJhY2soKTtcbiAgICB9XG59XG4iXX0=