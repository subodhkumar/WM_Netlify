import { $parseEvent, getClonedObject, getFormattedDate, isDefined, isEqualWithFields } from '@wm/core';
import { getEvaluatedData, getObjValueByKey } from './widget-utils';
import { ALLFIELDS } from './data-utils';
var momentLocale = moment.localeData();
var momentCalendarOptions = getClonedObject(momentLocale._calendar);
var momentCalendarDayOptions = momentLocale._calendarDay || {
    lastDay: '[Yesterday]',
    lastWeek: '[Last] dddd',
    nextDay: '[Tomorrow]',
    nextWeek: 'dddd',
    sameDay: '[Today]',
    sameElse: 'L'
};
var GROUP_BY_OPTIONS = {
    ALPHABET: 'alphabet',
    WORD: 'word',
    OTHERS: 'Others'
};
var TIME_ROLLUP_OPTIONS = {
    HOUR: 'hour',
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year'
};
var ROLLUP_PATTERNS = {
    DAY: 'yyyy-MM-dd',
    WEEK: 'w \'Week\',  yyyy',
    MONTH: 'MMM, yyyy',
    YEAR: 'YYYY',
    HOUR: 'hh:mm a'
};
/**
 * function to get the ordered dataset based on the given orderby
 */
export var getOrderedDataset = function (dataSet, orderBy, innerItem) {
    if (!orderBy) {
        return _.cloneDeep(dataSet);
    }
    // The order by only works when the dataset contains list of objects.
    var items = orderBy.split(','), fields = [], directions = [];
    items.forEach(function (obj) {
        var item = obj.split(':');
        fields.push(innerItem ? innerItem + '.' + item[0] : item[0]);
        directions.push(item[1]);
    });
    return _.orderBy(dataSet, fields, directions);
};
/**
 * Returns an array of object, each object contain the DataSetItem whose key, value, label are extracted from object keys.
 */
export var transformDataWithKeys = function (dataSet) {
    var data = [];
    // if the dataset is instance of object (not an array) or the first item in the dataset array is an object,
    // then we extract the keys from the object and prepare the dataset items.
    if (_.isObject(dataSet[0]) || (_.isObject(dataSet) && !(dataSet instanceof Array))) {
        // getting keys of the object
        var objectKeys = Object.keys(dataSet[0] || dataSet);
        _.forEach(objectKeys, function (objKey, index) {
            data.push({
                key: objKey,
                label: objKey,
                value: objKey,
                index: index + 1
            });
        });
    }
    return data;
};
// Converts any type of data to array.
export var extractDataAsArray = function (data) {
    if (_.isUndefined(data) || _.isNull(data) || _.trim(data) === '') {
        return [];
    }
    if (_.isString(data)) {
        data = _.split(data, ',').map(function (str) { return str.trim(); });
    }
    if (!_.isArray(data)) {
        data = [data];
    }
    return data;
};
// This function return always an object containing dataset details.
export var convertDataToObject = function (dataResult) {
    if (_.isString(dataResult)) {
        dataResult = _.split(dataResult, ',').map(function (str) { return str.trim(); });
    }
    return dataResult;
};
/**
 * The first step in datasetItems creation is data transformation:
 *
 * The dataset can contain one of the following formats and each of them to be converted to the given format;
 *
 * 1) The comma separated string..eg: A,B,C => [{ key: 'A', value: 'A'}, { key: 'B', value: 'B'}, { key: 'C', value: 'C'}]
 * 2) The array of values eg: [1,2,3] => [{ key: 1, value: 1}, { key: 2, value: 2}, { key: 3, value: 3}]
 * 3) an object eg: {name: 'A', age: 20} => [ {key: 'name', value: 'A'}, {key: 'age', value: 20}]
 * 4) an array of objects...eg: [ {name: 'A', age: 20}, {name: 'B', age: 20}] ==> returns [{key: _DATAFIELD_, value: _DISPLAYFIELD, label: _DISPLAYVALUE}]
 */
export var transformData = function (context, dataSet, myDataField, displayOptions, startIndex) {
    var data = [];
    if (!dataSet) {
        return;
    }
    dataSet = convertDataToObject(dataSet);
    // startIndex is the index of the next new item.
    if (_.isUndefined(startIndex)) {
        startIndex = 1;
    }
    if (_.isString(dataSet)) {
        dataSet = dataSet.split(',').map(function (str) { return str.trim(); });
        dataSet.forEach(function (option, index) {
            data.push({ key: option, value: option, label: (isDefined(option) && option !== null) ? option.toString() : '', index: startIndex + index });
        });
    }
    else if (_.isArray(dataSet) && !_.isObject(dataSet[0])) { // array of primitive values only
        dataSet.forEach(function (option, index) {
            data.push({ key: option, value: option, label: (isDefined(option) && option !== null) ? option.toString() : '', index: startIndex + index });
        });
    }
    else if (!(dataSet instanceof Array) && _.isObject(dataSet)) {
        var i = 0;
        _.forEach(dataSet, function (value, key) {
            data.push({ key: _.trim(key), value: key, label: (isDefined(value) && value !== null) ? value.toString() : '', index: startIndex, dataObject: dataSet });
        });
    }
    else {
        if (!myDataField) { // consider the datafield as 'ALLFIELDS' when datafield is not given.
            myDataField = ALLFIELDS;
        }
        dataSet.forEach(function (option, index) {
            var key = myDataField === ALLFIELDS ? startIndex + index : getObjValueByKey(option, myDataField);
            // Omit all the items whose datafield (key) is null or undefined.
            if (!_.isUndefined(key) && !_.isNull(key)) {
                var label = getEvaluatedData(option, {
                    field: displayOptions.displayField,
                    expression: displayOptions.displayExpr,
                    bindExpression: displayOptions.bindDisplayExpr
                }, context);
                var dataSetItem = {
                    key: key,
                    label: (isDefined(label) && label !== null) ? label.toString() : '',
                    value: myDataField === ALLFIELDS ? option : key,
                    dataObject: option,
                    index: startIndex + index
                };
                if (displayOptions.displayImgSrc || displayOptions.bindDisplayImgSrc) {
                    dataSetItem.imgSrc = getEvaluatedData(option, {
                        expression: displayOptions.displayImgSrc,
                        bindExpression: displayOptions.bindDisplayImgSrc
                    }, context);
                }
                data.push(dataSetItem);
            }
        });
    }
    return data;
};
/**
 * Private method to get the unique objects by the data field
 */
export var getUniqObjsByDataField = function (data, dataField, displayField, allowEmptyFields) {
    var uniqData;
    var isAllFields = dataField === ALLFIELDS;
    uniqData = isAllFields ? _.uniqWith(data, _.isEqual) : _.uniqBy(data, 'key');
    if (!displayField || allowEmptyFields) {
        return uniqData;
    }
    // return objects having non empty datafield and display field values.
    return _.filter(uniqData, function (obj) {
        if (isAllFields) {
            return _.trim(obj.label);
        }
        return _.trim(obj.key) && _.trim(obj.label);
    });
};
/**
 * This function sets the selectedItem by comparing the field values, where fields are passed by "compareby" property.
 * works only for datafield with ALL_FIELDS
 * @param datasetItems list of dataset items.
 * @param compareWithDataObj represents the datavalue (object) whose properties are to be checked against each property of datasetItem.
 * @param compareByField specifies the property names on which datasetItem has to be compared against datavalue object.
 */
export var setItemByCompare = function (datasetItems, compareWithDataObj, compareByField) {
    // compare the fields based on fields given to compareby property.
    _.forEach(datasetItems, function (opt) {
        if (isEqualWithFields(opt.value, compareWithDataObj, compareByField)) {
            opt.selected = true;
            return false;
        }
    });
};
/**
 * This method returns sorted data based to groupkey.
 * Returns a array of objects, each object containing key which is groupKey and data is the sorted data which is sorted by groupby field in the data.
 *
 * @param groupedLiData, grouped data object with key as the groupKey and its value as the array of objects grouped under the groupKey.
 * @param groupBy, string groupby property
 * @returns {any[]}
 */
var getSortedGroupedData = function (groupedLiData, groupBy, orderby) {
    var _groupedData = [];
    _.forEach(_.keys(groupedLiData), function (groupkey, index) {
        var liData = getOrderedDataset(groupedLiData[groupkey], orderby, 'dataObject');
        _groupedData.push({
            key: groupkey,
            data: _.sortBy(liData, function (data) {
                data._groupIndex = index + 1;
                return _.get(data, groupBy) || _.get(data.dataObject, groupBy);
            })
        });
    });
    return _groupedData;
};
var ɵ0 = getSortedGroupedData;
/**
 * This method gets the groupedData using groupby property and match and returns the sorted array of objects.
 *
 * @param compRef represents the component's reference i.e. "this" value.
 * @param data represents the dataset i.e array of objects.
 * @param groupby, string groupby property
 * @param match, string match property
 * @param orderby, string orderby property
 * @param dateformat, string dateFormat property
 * @param innerItem, represents the innerItem on which groupby has to be applied. Incase of datasetItems, 'dataObject' contains the full object. Here innerItem is dataObject.
 * @returns {any[]} groupedData, array of objects, each object having key and data.
 */
export var groupData = function (compRef, data, groupby, match, orderby, dateformat, datePipe, innerItem, AppDefaults) {
    var groupedLiData = {};
    if (_.includes(groupby, '(')) {
        var groupDataByUserDefinedFn_1 = $parseEvent(groupby);
        groupedLiData = _.groupBy(data, function (val) {
            return groupDataByUserDefinedFn_1(compRef.viewParent, { 'row': val.dataObject || val });
        });
    }
    else {
        groupedLiData = getGroupedData(data, groupby, match, orderby, dateformat, datePipe, innerItem, AppDefaults);
    }
    return getSortedGroupedData(groupedLiData, groupby, orderby);
};
/**
 * This method prepares the grouped data.
 *
 * @param fieldDefs array of objects i.e. dataset
 * @param groupby string groupby
 * @param match string match
 * @param orderby string orderby
 * @param dateFormat string date format
 * @param innerItem, item to look for in the passed data
 */
var getGroupedData = function (fieldDefs, groupby, match, orderby, dateFormat, datePipe, innerItem, AppDefaults) {
    // For day, set the relevant moment calendar options
    if (match === TIME_ROLLUP_OPTIONS.DAY) {
        momentLocale._calendar = momentCalendarDayOptions;
    }
    // handling case-in-sensitive scenario
    // ordering the data based on groupby field. If there is innerItem then apply orderby using the innerItem's containing the groupby field.
    fieldDefs = _.orderBy(fieldDefs, function (fieldDef) {
        var groupKey = _.get(innerItem ? fieldDef[innerItem] : fieldDef, groupby);
        if (groupKey) {
            return _.toLower(groupKey);
        }
    });
    // extract the grouped data based on the field obtained from 'groupDataByField'.
    var groupedLiData = _.groupBy(fieldDefs, groupDataByField.bind(undefined, groupby, match, innerItem, dateFormat, datePipe, AppDefaults));
    momentLocale._calendar = momentCalendarOptions; // Reset to default moment calendar options
    return groupedLiData;
};
var ɵ1 = getGroupedData;
// Format the date with given date format
export var filterDate = function (value, format, defaultFormat, datePipe) {
    if (format === 'timestamp') { // For timestamp format, return the epoch value
        return value;
    }
    return getFormattedDate(datePipe, value, format || defaultFormat);
};
/**
 * This method returns the groupkey based on the rollup (match) passed
 *
 * @param concatStr, string containing groupby field value
 * @param rollUp string containing the match property.
 * @param dateformat string containing the date format to display the date.
 */
var getTimeRolledUpString = function (concatStr, rollUp, dateformat, datePipe, AppDefaults) {
    var groupByKey, strMoment = moment(concatStr), dateFormat = dateformat;
    var currMoment = moment(), getSameElseFormat = function () {
        return '[' + filterDate(this.valueOf(), dateFormat, ROLLUP_PATTERNS.DAY, datePipe) + ']';
    };
    switch (rollUp) {
        case TIME_ROLLUP_OPTIONS.HOUR:
            dateFormat = dateFormat || AppDefaults.timeFormat;
            // If date is invalid, check if data is in form of hh:mm a
            if (!strMoment.isValid()) {
                strMoment = moment(new Date().toDateString() + ' ' + concatStr);
                if (strMoment.isValid()) {
                    // As only time is present, roll up at the hour level with given time format
                    momentLocale._calendar.sameDay = function () {
                        return '[' + filterDate(this.valueOf(), dateFormat, ROLLUP_PATTERNS.HOUR, datePipe) + ']';
                    };
                }
            }
            // round off to nearest last hour
            strMoment = strMoment.startOf('hour');
            momentLocale._calendar.sameElse = getSameElseFormat;
            groupByKey = strMoment.calendar(currMoment);
            break;
        case TIME_ROLLUP_OPTIONS.WEEK:
            groupByKey = filterDate(strMoment.valueOf(), dateFormat, ROLLUP_PATTERNS.WEEK, datePipe);
            break;
        case TIME_ROLLUP_OPTIONS.MONTH:
            groupByKey = filterDate(strMoment.valueOf(), dateFormat, ROLLUP_PATTERNS.MONTH, datePipe);
            break;
        case TIME_ROLLUP_OPTIONS.YEAR:
            groupByKey = strMoment.format(ROLLUP_PATTERNS.YEAR);
            break;
        case TIME_ROLLUP_OPTIONS.DAY:
            dateFormat = dateFormat || AppDefaults.dateFormat;
            strMoment = strMoment.startOf('day'); // round off to current day
            momentLocale._calendar.sameElse = getSameElseFormat;
            groupByKey = strMoment.calendar(currMoment);
            break;
    }
    // If invalid date is returned, Categorize it as Others.
    if (groupByKey === 'Invalid date') {
        return GROUP_BY_OPTIONS.OTHERS;
    }
    return groupByKey;
};
var ɵ2 = getTimeRolledUpString;
// groups the fields based on the groupby value.
var groupDataByField = function (groupby, match, innerItem, dateFormat, datePipe, AppDefaults, liData) {
    // get the groupby field value from the liData or innerItem in the liData.
    var concatStr = _.get(innerItem ? liData[innerItem] : liData, groupby);
    // by default set the undefined groupKey as 'others'
    if (_.isUndefined(concatStr) || _.isNull(concatStr) || concatStr.toString().trim() === '') {
        return GROUP_BY_OPTIONS.OTHERS;
    }
    // if match prop is alphabetic ,get the starting alphabet of the word as key.
    if (match === GROUP_BY_OPTIONS.ALPHABET) {
        concatStr = concatStr.substr(0, 1);
    }
    // if match contains the time options then get the concatStr using 'getTimeRolledUpString'
    if (_.includes(_.values(TIME_ROLLUP_OPTIONS), match)) {
        concatStr = getTimeRolledUpString(concatStr, match, dateFormat, datePipe, AppDefaults);
    }
    return concatStr;
};
var ɵ3 = groupDataByField;
/**
 * This method toggles all the list items inside the each list group.
 * @param el, component reference on which groupby is applied.
 */
export var toggleAllHeaders = function (el) {
    var groups = $(el.nativeElement).find('.item-group');
    groups.find('.group-list-item').toggle();
    // toggle the collapse icon on list header.
    var groupIcons = groups.find('li.list-group-header .app-icon');
    if (groupIcons) {
        _.forEach(groupIcons, function (icon) {
            icon = $(icon);
            if (icon.hasClass('wi-chevron-down')) {
                icon.removeClass('wi-chevron-down').addClass('wi-chevron-up');
            }
            else {
                icon.removeClass('wi-chevron-up').addClass('wi-chevron-down');
            }
        });
    }
};
/**
 * On list header click, toggle the list items in this group.
 * and also toggle the header icon.
 * @param $event
 */
export var handleHeaderClick = function ($event) {
    var selectedGroup = $($event.target).closest('.item-group'), selectedAppIcon = selectedGroup.find('li.list-group-header .app-icon');
    if (selectedAppIcon.hasClass('wi-chevron-down')) {
        selectedAppIcon.removeClass('wi-chevron-down').addClass('wi-chevron-up');
    }
    else {
        selectedAppIcon.removeClass('wi-chevron-up').addClass('wi-chevron-down');
    }
    selectedGroup.find('.group-list-item').toggle();
};
/**
 * configures reordering the items.
 * @param $el element to be sortable
 * @param options object containing the sortable options.
 * @param startCb callback on drag start on the element.
 * @param updateCb callback triggerred when sorting is stopped and the DOM position has changed.
 */
export var configureDnD = function ($el, options, startCb, updateCb) {
    var sortOptions = Object.assign({
        containment: $el,
        delay: 100,
        opacity: 0.8,
        helper: 'clone',
        zIndex: 1050,
        tolerance: 'pointer',
        start: startCb,
        update: updateCb
    }, options);
    $el.sortable(sortOptions);
};
/**
 * key represents the datafield value
 * label represents display value or expression value
 * value displayValue for primitives and data object for allFields
 * dataObject represent the object from the dataset when datafield is ALLFIELDS. This is used as innerItem while grouping the datasetItems.
 * imgSrc picture source
 * selected represents boolean to notify selected item.
 */
var DataSetItem = /** @class */ (function () {
    function DataSetItem() {
    }
    return DataSetItem;
}());
export { DataSetItem };
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS11dGlscy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsidXRpbHMvZm9ybS11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFeEcsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFcEUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUt6QyxJQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDekMsSUFBTSxxQkFBcUIsR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RFLElBQU0sd0JBQXdCLEdBQUcsWUFBWSxDQUFDLFlBQVksSUFBSTtJQUN0RCxPQUFPLEVBQUUsYUFBYTtJQUN0QixRQUFRLEVBQUUsYUFBYTtJQUN2QixPQUFPLEVBQUUsWUFBWTtJQUNyQixRQUFRLEVBQUUsTUFBTTtJQUNoQixPQUFPLEVBQUUsU0FBUztJQUNsQixRQUFRLEVBQUUsR0FBRztDQUNoQixDQUFDO0FBQ04sSUFBTSxnQkFBZ0IsR0FBRztJQUNqQixRQUFRLEVBQUUsVUFBVTtJQUNwQixJQUFJLEVBQUUsTUFBTTtJQUNaLE1BQU0sRUFBRSxRQUFRO0NBQ25CLENBQUM7QUFDTixJQUFNLG1CQUFtQixHQUFHO0lBQ3BCLElBQUksRUFBRSxNQUFNO0lBQ1osR0FBRyxFQUFFLEtBQUs7SUFDVixJQUFJLEVBQUUsTUFBTTtJQUNaLEtBQUssRUFBRSxPQUFPO0lBQ2QsSUFBSSxFQUFFLE1BQU07Q0FDZixDQUFDO0FBQ04sSUFBTSxlQUFlLEdBQUc7SUFDaEIsR0FBRyxFQUFFLFlBQVk7SUFDakIsSUFBSSxFQUFFLG1CQUFtQjtJQUN6QixLQUFLLEVBQUUsV0FBVztJQUNsQixJQUFJLEVBQUUsTUFBTTtJQUNaLElBQUksRUFBRSxTQUFTO0NBQ2xCLENBQUM7QUFFTjs7R0FFRztBQUNILE1BQU0sQ0FBQyxJQUFNLGlCQUFpQixHQUFHLFVBQUMsT0FBWSxFQUFFLE9BQWUsRUFBRSxTQUFVO0lBQ3ZFLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDVixPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDL0I7SUFFRCxxRUFBcUU7SUFDckUsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFDNUIsTUFBTSxHQUFHLEVBQUUsRUFDWCxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHO1FBQ2IsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0IsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUM7QUFFRjs7R0FFRztBQUNILE1BQU0sQ0FBQyxJQUFNLHFCQUFxQixHQUFHLFVBQUMsT0FBWTtJQUM5QyxJQUFNLElBQUksR0FBa0IsRUFBRSxDQUFDO0lBQy9CLDJHQUEyRztJQUMzRywwRUFBMEU7SUFDMUUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxZQUFZLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDaEYsNkJBQTZCO1FBQzdCLElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFVBQUMsTUFBTSxFQUFFLEtBQUs7WUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDTixHQUFHLEVBQUUsTUFBTTtnQkFDWCxLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsS0FBSyxHQUFHLENBQUM7YUFDbkIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7S0FDTjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMsQ0FBQztBQUVGLHNDQUFzQztBQUN0QyxNQUFNLENBQUMsSUFBTSxrQkFBa0IsR0FBRyxVQUFBLElBQUk7SUFFbEMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDOUQsT0FBTyxFQUFFLENBQUM7S0FDYjtJQUVELElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNsQixJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFWLENBQVUsQ0FBQyxDQUFDO0tBQ3BEO0lBRUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDbEIsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDakI7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDLENBQUM7QUFFRixvRUFBb0U7QUFDcEUsTUFBTSxDQUFDLElBQU0sbUJBQW1CLEdBQUcsVUFBQSxVQUFVO0lBQ3pDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUN4QixVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFWLENBQVUsQ0FBQyxDQUFDO0tBQ2hFO0lBRUQsT0FBTyxVQUFVLENBQUM7QUFDdEIsQ0FBQyxDQUFDO0FBRUY7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxDQUFDLElBQU0sYUFBYSxHQUFHLFVBQUMsT0FBWSxFQUFFLE9BQVksRUFBRSxXQUFvQixFQUFFLGNBQWUsRUFBRSxVQUFtQjtJQUNoSCxJQUFNLElBQUksR0FBRyxFQUFFLENBQUM7SUFDaEIsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNWLE9BQU87S0FDVjtJQUNELE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUV2QyxnREFBZ0Q7SUFDaEQsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1FBQzNCLFVBQVUsR0FBRyxDQUFDLENBQUM7S0FDbEI7SUFFRCxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDckIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFWLENBQVUsQ0FBQyxDQUFDO1FBQ3BELE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLEVBQUUsS0FBSztZQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLEdBQUcsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUMvSSxDQUFDLENBQUMsQ0FBQztLQUNOO1NBQU0sSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLGlDQUFpQztRQUN6RixPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxFQUFFLEtBQUs7WUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBVSxHQUFHLEtBQUssRUFBQyxDQUFDLENBQUM7UUFDL0ksQ0FBQyxDQUFDLENBQUM7S0FDTjtTQUFNLElBQUksQ0FBQyxDQUFDLE9BQU8sWUFBWSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQzNELElBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNaLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBSyxFQUFFLEdBQUc7WUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztRQUMzSixDQUFDLENBQUMsQ0FBQztLQUNOO1NBQU07UUFDSCxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUscUVBQXFFO1lBQ3JGLFdBQVcsR0FBRyxTQUFTLENBQUM7U0FDM0I7UUFFRCxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxFQUFFLEtBQUs7WUFDMUIsSUFBTSxHQUFHLEdBQUcsV0FBVyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBRW5HLGlFQUFpRTtZQUNqRSxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZDLElBQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtvQkFDbkMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxZQUFZO29CQUNsQyxVQUFVLEVBQUUsY0FBYyxDQUFDLFdBQVc7b0JBQ3RDLGNBQWMsRUFBRSxjQUFjLENBQUMsZUFBZTtpQkFDakQsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDWixJQUFNLFdBQVcsR0FBRztvQkFDaEIsR0FBRyxFQUFFLEdBQUc7b0JBQ1IsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNuRSxLQUFLLEVBQUUsV0FBVyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHO29CQUMvQyxVQUFVLEVBQUUsTUFBTTtvQkFDbEIsS0FBSyxFQUFFLFVBQVUsR0FBRyxLQUFLO2lCQUM1QixDQUFDO2dCQUNGLElBQUksY0FBYyxDQUFDLGFBQWEsSUFBSSxjQUFjLENBQUMsaUJBQWlCLEVBQUU7b0JBQ2pFLFdBQW1CLENBQUMsTUFBTSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sRUFBRTt3QkFDbkQsVUFBVSxFQUFFLGNBQWMsQ0FBQyxhQUFhO3dCQUN4QyxjQUFjLEVBQUUsY0FBYyxDQUFDLGlCQUFpQjtxQkFDbkQsRUFBRSxPQUFPLENBQUMsQ0FBQztpQkFDZjtnQkFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQzFCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7S0FDTjtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMsQ0FBQztBQUVGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLElBQU0sc0JBQXNCLEdBQUcsVUFBQyxJQUF3QixFQUFFLFNBQWlCLEVBQUUsWUFBb0IsRUFBRSxnQkFBMEI7SUFDaEksSUFBSSxRQUFRLENBQUM7SUFDYixJQUFNLFdBQVcsR0FBRyxTQUFTLEtBQUssU0FBUyxDQUFDO0lBRTVDLFFBQVEsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFN0UsSUFBSSxDQUFDLFlBQVksSUFBSSxnQkFBZ0IsRUFBRTtRQUNuQyxPQUFPLFFBQVEsQ0FBQztLQUNuQjtJQUVELHNFQUFzRTtJQUN0RSxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFVBQUMsR0FBRztRQUMxQixJQUFJLFdBQVcsRUFBRTtZQUNiLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDNUI7UUFDRCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hELENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBRUY7Ozs7OztHQU1HO0FBQ0gsTUFBTSxDQUFDLElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxZQUFnQyxFQUFFLGtCQUEwQixFQUFFLGNBQXNCO0lBQ2pILGtFQUFrRTtJQUNsRSxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxVQUFBLEdBQUc7UUFDdkIsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsQ0FBQyxFQUFFO1lBQ2xFLEdBQUcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7QUFFRjs7Ozs7OztHQU9HO0FBQ0gsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLGFBQXFCLEVBQUUsT0FBZSxFQUFFLE9BQWU7SUFDakYsSUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO0lBQ3hCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxVQUFDLFFBQVEsRUFBRSxLQUFLO1FBQzdDLElBQU0sTUFBTSxHQUFHLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDakYsWUFBWSxDQUFDLElBQUksQ0FBQztZQUNkLEdBQUcsRUFBRSxRQUFRO1lBQ2IsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFVBQUEsSUFBSTtnQkFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QixPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNuRSxDQUFDLENBQUM7U0FDTCxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sWUFBWSxDQUFDO0FBQ3hCLENBQUMsQ0FBQzs7QUFFRjs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sQ0FBQyxJQUFNLFNBQVMsR0FBRyxVQUFDLE9BQVksRUFBRSxJQUFpQyxFQUFFLE9BQWUsRUFBRSxLQUFhLEVBQUUsT0FBZSxFQUFFLFVBQWtCLEVBQUUsUUFBb0IsRUFBRSxTQUFrQixFQUFFLFdBQWlCO0lBQ3ZNLElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQztJQUN2QixJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO1FBQzFCLElBQU0sMEJBQXdCLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELGFBQWEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFBLEdBQUc7WUFDL0IsT0FBTywwQkFBd0IsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxVQUFVLElBQUksR0FBRyxFQUFDLENBQUMsQ0FBQztRQUN4RixDQUFDLENBQUMsQ0FBQztLQUNOO1NBQU07UUFDSCxhQUFhLEdBQUcsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztLQUMvRztJQUVELE9BQU8sb0JBQW9CLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNqRSxDQUFDLENBQUM7QUFFRjs7Ozs7Ozs7O0dBU0c7QUFDSCxJQUFNLGNBQWMsR0FBRyxVQUFDLFNBQXNDLEVBQUUsT0FBZSxFQUFFLEtBQWEsRUFBRSxPQUFlLEVBQUUsVUFBa0IsRUFBRSxRQUFvQixFQUFFLFNBQWtCLEVBQUUsV0FBaUI7SUFDNUwsb0RBQW9EO0lBQ3BELElBQUksS0FBSyxLQUFLLG1CQUFtQixDQUFDLEdBQUcsRUFBRTtRQUNuQyxZQUFZLENBQUMsU0FBUyxHQUFHLHdCQUF3QixDQUFDO0tBQ3JEO0lBRUQsc0NBQXNDO0lBQ3RDLHlJQUF5STtJQUN6SSxTQUFTLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsVUFBQSxRQUFRO1FBQ3JDLElBQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1RSxJQUFJLFFBQVEsRUFBRTtZQUNWLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM5QjtJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsZ0ZBQWdGO0lBQ2hGLElBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBRTNJLFlBQVksQ0FBQyxTQUFTLEdBQUcscUJBQXFCLENBQUMsQ0FBQywyQ0FBMkM7SUFFM0YsT0FBTyxhQUFhLENBQUM7QUFDekIsQ0FBQyxDQUFDOztBQUVGLHlDQUF5QztBQUN6QyxNQUFNLENBQUMsSUFBTSxVQUFVLEdBQUcsVUFBQyxLQUFzQixFQUFFLE1BQWMsRUFBRSxhQUFxQixFQUFFLFFBQW9CO0lBQzFHLElBQUksTUFBTSxLQUFLLFdBQVcsRUFBRSxFQUFFLCtDQUErQztRQUN6RSxPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUVELE9BQU8sZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLElBQUksYUFBYSxDQUFDLENBQUM7QUFDdEUsQ0FBQyxDQUFDO0FBR0Y7Ozs7OztHQU1HO0FBQ0gsSUFBTSxxQkFBcUIsR0FBRyxVQUFDLFNBQWlCLEVBQUUsTUFBYyxFQUFFLFVBQWtCLEVBQUUsUUFBcUIsRUFBRSxXQUFpQjtJQUMxSCxJQUFJLFVBQVUsRUFDVixTQUFTLEdBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUM5QixVQUFVLEdBQUcsVUFBVSxDQUFDO0lBRTVCLElBQU0sVUFBVSxHQUFHLE1BQU0sRUFBRSxFQUN2QixpQkFBaUIsR0FBRztRQUNoQixPQUFPLEdBQUcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUM3RixDQUFDLENBQUM7SUFFTixRQUFRLE1BQU0sRUFBRTtRQUNaLEtBQUssbUJBQW1CLENBQUMsSUFBSTtZQUN6QixVQUFVLEdBQUcsVUFBVSxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUM7WUFFbEQsMERBQTBEO1lBQzFELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3RCLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxZQUFZLEVBQUUsR0FBRyxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUM7Z0JBRWhFLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUNyQiw0RUFBNEU7b0JBQzVFLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHO3dCQUM3QixPQUFPLEdBQUcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQztvQkFDOUYsQ0FBQyxDQUFDO2lCQUNMO2FBQ0o7WUFDRCxpQ0FBaUM7WUFDakMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdEMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsaUJBQWlCLENBQUM7WUFDcEQsVUFBVSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDNUMsTUFBTTtRQUNWLEtBQUssbUJBQW1CLENBQUMsSUFBSTtZQUN6QixVQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN6RixNQUFNO1FBQ1YsS0FBSyxtQkFBbUIsQ0FBQyxLQUFLO1lBQzFCLFVBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzFGLE1BQU07UUFDVixLQUFLLG1CQUFtQixDQUFDLElBQUk7WUFDekIsVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BELE1BQU07UUFDVixLQUFLLG1CQUFtQixDQUFDLEdBQUc7WUFDeEIsVUFBVSxHQUFHLFVBQVUsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDO1lBQ2xELFNBQVMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsMkJBQTJCO1lBQ2pFLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLGlCQUFpQixDQUFDO1lBQ3BELFVBQVUsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzVDLE1BQU07S0FDYjtJQUNELHdEQUF3RDtJQUN4RCxJQUFJLFVBQVUsS0FBSyxjQUFjLEVBQUU7UUFDL0IsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7S0FDbEM7SUFDRCxPQUFPLFVBQVUsQ0FBQztBQUN0QixDQUFDLENBQUM7O0FBR0YsZ0RBQWdEO0FBQ2hELElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxPQUFlLEVBQUUsS0FBYSxFQUFFLFNBQWlCLEVBQUUsVUFBa0IsRUFBRSxRQUFvQixFQUFFLFdBQWdCLEVBQUUsTUFBYztJQUNuSiwwRUFBMEU7SUFDMUUsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXZFLG9EQUFvRDtJQUNwRCxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ3ZGLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDO0tBQ2xDO0lBRUQsNkVBQTZFO0lBQzdFLElBQUksS0FBSyxLQUFLLGdCQUFnQixDQUFDLFFBQVEsRUFBRTtRQUNyQyxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDdEM7SUFFRCwwRkFBMEY7SUFDMUYsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRTtRQUNsRCxTQUFTLEdBQUcscUJBQXFCLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQzFGO0lBRUQsT0FBTyxTQUFTLENBQUM7QUFDckIsQ0FBQyxDQUFDOztBQUVGOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxJQUFNLGdCQUFnQixHQUFHLFVBQUMsRUFBTztJQUNwQyxJQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUV2RCxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFFekMsMkNBQTJDO0lBQzNDLElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztJQUVqRSxJQUFJLFVBQVUsRUFBRTtRQUNaLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFVBQUMsSUFBSTtZQUN2QixJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDakU7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUNqRTtRQUNMLENBQUMsQ0FBQyxDQUFDO0tBQ047QUFDTCxDQUFDLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLElBQU0saUJBQWlCLEdBQUcsVUFBQyxNQUFhO0lBQzNDLElBQU0sYUFBYSxHQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUNsRSxlQUFlLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0lBRTNFLElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1FBQzdDLGVBQWUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDNUU7U0FBTTtRQUNILGVBQWUsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDNUU7SUFFRCxhQUFhLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDcEQsQ0FBQyxDQUFDO0FBRUY7Ozs7OztHQU1HO0FBQ0gsTUFBTSxDQUFDLElBQU0sWUFBWSxHQUFHLFVBQUMsR0FBUSxFQUFFLE9BQWUsRUFBRSxPQUFpQixFQUFFLFFBQWtCO0lBQ3pGLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDOUIsV0FBVyxFQUFFLEdBQUc7UUFDaEIsS0FBSyxFQUFFLEdBQUc7UUFDVixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxPQUFPO1FBQ2YsTUFBTSxFQUFFLElBQUk7UUFDWixTQUFTLEVBQUUsU0FBUztRQUNwQixLQUFLLEVBQUUsT0FBTztRQUNkLE1BQU0sRUFBRSxRQUFRO0tBQ25CLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFWixHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzlCLENBQUMsQ0FBQztBQVdGOzs7Ozs7O0dBT0c7QUFDSDtJQUFBO0lBUUEsQ0FBQztJQUFELGtCQUFDO0FBQUQsQ0FBQyxBQVJELElBUUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyAkcGFyc2VFdmVudCwgZ2V0Q2xvbmVkT2JqZWN0LCBnZXRGb3JtYXR0ZWREYXRlLCBpc0RlZmluZWQsIGlzRXF1YWxXaXRoRmllbGRzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBnZXRFdmFsdWF0ZWREYXRhLCBnZXRPYmpWYWx1ZUJ5S2V5IH0gZnJvbSAnLi93aWRnZXQtdXRpbHMnO1xuXG5pbXBvcnQgeyBBTExGSUVMRFMgfSBmcm9tICcuL2RhdGEtdXRpbHMnO1xuaW1wb3J0IHsgVG9EYXRlUGlwZSB9IGZyb20gJy4uL3BpcGVzL2N1c3RvbS1waXBlcyc7XG5cbmRlY2xhcmUgY29uc3QgXywgJCwgbW9tZW50O1xuXG5jb25zdCBtb21lbnRMb2NhbGUgPSBtb21lbnQubG9jYWxlRGF0YSgpO1xuY29uc3QgbW9tZW50Q2FsZW5kYXJPcHRpb25zID0gZ2V0Q2xvbmVkT2JqZWN0KG1vbWVudExvY2FsZS5fY2FsZW5kYXIpO1xuY29uc3QgbW9tZW50Q2FsZW5kYXJEYXlPcHRpb25zID0gbW9tZW50TG9jYWxlLl9jYWxlbmRhckRheSB8fCB7XG4gICAgICAgIGxhc3REYXk6ICdbWWVzdGVyZGF5XScsXG4gICAgICAgIGxhc3RXZWVrOiAnW0xhc3RdIGRkZGQnLFxuICAgICAgICBuZXh0RGF5OiAnW1RvbW9ycm93XScsXG4gICAgICAgIG5leHRXZWVrOiAnZGRkZCcsXG4gICAgICAgIHNhbWVEYXk6ICdbVG9kYXldJyxcbiAgICAgICAgc2FtZUVsc2U6ICdMJ1xuICAgIH07XG5jb25zdCBHUk9VUF9CWV9PUFRJT05TID0ge1xuICAgICAgICBBTFBIQUJFVDogJ2FscGhhYmV0JyxcbiAgICAgICAgV09SRDogJ3dvcmQnLFxuICAgICAgICBPVEhFUlM6ICdPdGhlcnMnXG4gICAgfTtcbmNvbnN0IFRJTUVfUk9MTFVQX09QVElPTlMgPSB7XG4gICAgICAgIEhPVVI6ICdob3VyJyxcbiAgICAgICAgREFZOiAnZGF5JyxcbiAgICAgICAgV0VFSzogJ3dlZWsnLFxuICAgICAgICBNT05USDogJ21vbnRoJyxcbiAgICAgICAgWUVBUjogJ3llYXInXG4gICAgfTtcbmNvbnN0IFJPTExVUF9QQVRURVJOUyA9IHtcbiAgICAgICAgREFZOiAneXl5eS1NTS1kZCcsXG4gICAgICAgIFdFRUs6ICd3IFxcJ1dlZWtcXCcsICB5eXl5JyxcbiAgICAgICAgTU9OVEg6ICdNTU0sIHl5eXknLFxuICAgICAgICBZRUFSOiAnWVlZWScsXG4gICAgICAgIEhPVVI6ICdoaDptbSBhJ1xuICAgIH07XG5cbi8qKlxuICogZnVuY3Rpb24gdG8gZ2V0IHRoZSBvcmRlcmVkIGRhdGFzZXQgYmFzZWQgb24gdGhlIGdpdmVuIG9yZGVyYnlcbiAqL1xuZXhwb3J0IGNvbnN0IGdldE9yZGVyZWREYXRhc2V0ID0gKGRhdGFTZXQ6IGFueSwgb3JkZXJCeTogc3RyaW5nLCBpbm5lckl0ZW0/KSA9PiB7XG4gICAgaWYgKCFvcmRlckJ5KSB7XG4gICAgICAgIHJldHVybiBfLmNsb25lRGVlcChkYXRhU2V0KTtcbiAgICB9XG5cbiAgICAvLyBUaGUgb3JkZXIgYnkgb25seSB3b3JrcyB3aGVuIHRoZSBkYXRhc2V0IGNvbnRhaW5zIGxpc3Qgb2Ygb2JqZWN0cy5cbiAgICBjb25zdCBpdGVtcyA9IG9yZGVyQnkuc3BsaXQoJywnKSxcbiAgICAgICAgZmllbGRzID0gW10sXG4gICAgICAgIGRpcmVjdGlvbnMgPSBbXTtcbiAgICBpdGVtcy5mb3JFYWNoKG9iaiA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBvYmouc3BsaXQoJzonKTtcbiAgICAgICAgZmllbGRzLnB1c2goaW5uZXJJdGVtID8gaW5uZXJJdGVtICsgJy4nICsgaXRlbVswXSA6IGl0ZW1bMF0pO1xuICAgICAgICBkaXJlY3Rpb25zLnB1c2goaXRlbVsxXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIF8ub3JkZXJCeShkYXRhU2V0LCBmaWVsZHMsIGRpcmVjdGlvbnMpO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIG9iamVjdCwgZWFjaCBvYmplY3QgY29udGFpbiB0aGUgRGF0YVNldEl0ZW0gd2hvc2Uga2V5LCB2YWx1ZSwgbGFiZWwgYXJlIGV4dHJhY3RlZCBmcm9tIG9iamVjdCBrZXlzLlxuICovXG5leHBvcnQgY29uc3QgdHJhbnNmb3JtRGF0YVdpdGhLZXlzID0gKGRhdGFTZXQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IGRhdGE6IERhdGFTZXRJdGVtW10gPSBbXTtcbiAgICAvLyBpZiB0aGUgZGF0YXNldCBpcyBpbnN0YW5jZSBvZiBvYmplY3QgKG5vdCBhbiBhcnJheSkgb3IgdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIGRhdGFzZXQgYXJyYXkgaXMgYW4gb2JqZWN0LFxuICAgIC8vIHRoZW4gd2UgZXh0cmFjdCB0aGUga2V5cyBmcm9tIHRoZSBvYmplY3QgYW5kIHByZXBhcmUgdGhlIGRhdGFzZXQgaXRlbXMuXG4gICAgaWYgKF8uaXNPYmplY3QoZGF0YVNldFswXSkgfHwgKF8uaXNPYmplY3QoZGF0YVNldCkgJiYgIShkYXRhU2V0IGluc3RhbmNlb2YgQXJyYXkpKSkge1xuICAgICAgICAvLyBnZXR0aW5nIGtleXMgb2YgdGhlIG9iamVjdFxuICAgICAgICBjb25zdCBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMoZGF0YVNldFswXSB8fCBkYXRhU2V0KTtcbiAgICAgICAgXy5mb3JFYWNoKG9iamVjdEtleXMsIChvYmpLZXksIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBkYXRhLnB1c2goe1xuICAgICAgICAgICAgICAgIGtleTogb2JqS2V5LFxuICAgICAgICAgICAgICAgIGxhYmVsOiBvYmpLZXksXG4gICAgICAgICAgICAgICAgdmFsdWU6IG9iaktleSxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXggKyAxXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG59O1xuXG4vLyBDb252ZXJ0cyBhbnkgdHlwZSBvZiBkYXRhIHRvIGFycmF5LlxuZXhwb3J0IGNvbnN0IGV4dHJhY3REYXRhQXNBcnJheSA9IGRhdGEgPT4ge1xuXG4gICAgaWYgKF8uaXNVbmRlZmluZWQoZGF0YSkgfHwgXy5pc051bGwoZGF0YSkgfHwgXy50cmltKGRhdGEpID09PSAnJykge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgaWYgKF8uaXNTdHJpbmcoZGF0YSkpIHtcbiAgICAgICAgZGF0YSA9IF8uc3BsaXQoZGF0YSwgJywnKS5tYXAoc3RyID0+IHN0ci50cmltKCkpO1xuICAgIH1cblxuICAgIGlmICghXy5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG59O1xuXG4vLyBUaGlzIGZ1bmN0aW9uIHJldHVybiBhbHdheXMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgZGF0YXNldCBkZXRhaWxzLlxuZXhwb3J0IGNvbnN0IGNvbnZlcnREYXRhVG9PYmplY3QgPSBkYXRhUmVzdWx0ID0+IHtcbiAgICBpZiAoXy5pc1N0cmluZyhkYXRhUmVzdWx0KSkge1xuICAgICAgICBkYXRhUmVzdWx0ID0gXy5zcGxpdChkYXRhUmVzdWx0LCAnLCcpLm1hcChzdHIgPT4gc3RyLnRyaW0oKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGFSZXN1bHQ7XG59O1xuXG4vKipcbiAqIFRoZSBmaXJzdCBzdGVwIGluIGRhdGFzZXRJdGVtcyBjcmVhdGlvbiBpcyBkYXRhIHRyYW5zZm9ybWF0aW9uOlxuICpcbiAqIFRoZSBkYXRhc2V0IGNhbiBjb250YWluIG9uZSBvZiB0aGUgZm9sbG93aW5nIGZvcm1hdHMgYW5kIGVhY2ggb2YgdGhlbSB0byBiZSBjb252ZXJ0ZWQgdG8gdGhlIGdpdmVuIGZvcm1hdDtcbiAqXG4gKiAxKSBUaGUgY29tbWEgc2VwYXJhdGVkIHN0cmluZy4uZWc6IEEsQixDID0+IFt7IGtleTogJ0EnLCB2YWx1ZTogJ0EnfSwgeyBrZXk6ICdCJywgdmFsdWU6ICdCJ30sIHsga2V5OiAnQycsIHZhbHVlOiAnQyd9XVxuICogMikgVGhlIGFycmF5IG9mIHZhbHVlcyBlZzogWzEsMiwzXSA9PiBbeyBrZXk6IDEsIHZhbHVlOiAxfSwgeyBrZXk6IDIsIHZhbHVlOiAyfSwgeyBrZXk6IDMsIHZhbHVlOiAzfV1cbiAqIDMpIGFuIG9iamVjdCBlZzoge25hbWU6ICdBJywgYWdlOiAyMH0gPT4gWyB7a2V5OiAnbmFtZScsIHZhbHVlOiAnQSd9LCB7a2V5OiAnYWdlJywgdmFsdWU6IDIwfV1cbiAqIDQpIGFuIGFycmF5IG9mIG9iamVjdHMuLi5lZzogWyB7bmFtZTogJ0EnLCBhZ2U6IDIwfSwge25hbWU6ICdCJywgYWdlOiAyMH1dID09PiByZXR1cm5zIFt7a2V5OiBfREFUQUZJRUxEXywgdmFsdWU6IF9ESVNQTEFZRklFTEQsIGxhYmVsOiBfRElTUExBWVZBTFVFfV1cbiAqL1xuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybURhdGEgPSAoY29udGV4dDogYW55LCBkYXRhU2V0OiBhbnksIG15RGF0YUZpZWxkPzogc3RyaW5nLCBkaXNwbGF5T3B0aW9ucz8sIHN0YXJ0SW5kZXg/OiBudW1iZXIpOiBBcnJheTxEYXRhU2V0SXRlbT4gPT4ge1xuICAgIGNvbnN0IGRhdGEgPSBbXTtcbiAgICBpZiAoIWRhdGFTZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkYXRhU2V0ID0gY29udmVydERhdGFUb09iamVjdChkYXRhU2V0KTtcblxuICAgIC8vIHN0YXJ0SW5kZXggaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IG5ldyBpdGVtLlxuICAgIGlmIChfLmlzVW5kZWZpbmVkKHN0YXJ0SW5kZXgpKSB7XG4gICAgICAgIHN0YXJ0SW5kZXggPSAxO1xuICAgIH1cblxuICAgIGlmIChfLmlzU3RyaW5nKGRhdGFTZXQpKSB7XG4gICAgICAgIGRhdGFTZXQgPSBkYXRhU2V0LnNwbGl0KCcsJykubWFwKHN0ciA9PiBzdHIudHJpbSgpKTtcbiAgICAgICAgZGF0YVNldC5mb3JFYWNoKChvcHRpb24sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBkYXRhLnB1c2goe2tleTogb3B0aW9uLCB2YWx1ZTogb3B0aW9uLCBsYWJlbDogKGlzRGVmaW5lZChvcHRpb24pICYmIG9wdGlvbiAhPT0gbnVsbCkgPyBvcHRpb24udG9TdHJpbmcoKSA6ICcnLCBpbmRleDogc3RhcnRJbmRleCArIGluZGV4fSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoXy5pc0FycmF5KGRhdGFTZXQpICYmICFfLmlzT2JqZWN0KGRhdGFTZXRbMF0pKSB7IC8vIGFycmF5IG9mIHByaW1pdGl2ZSB2YWx1ZXMgb25seVxuICAgICAgICBkYXRhU2V0LmZvckVhY2goKG9wdGlvbiwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGRhdGEucHVzaCh7a2V5OiBvcHRpb24sIHZhbHVlOiBvcHRpb24sIGxhYmVsOiAoaXNEZWZpbmVkKG9wdGlvbikgJiYgb3B0aW9uICE9PSBudWxsKSA/IG9wdGlvbi50b1N0cmluZygpIDogJycsIGluZGV4OiBzdGFydEluZGV4ICsgaW5kZXh9KTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICghKGRhdGFTZXQgaW5zdGFuY2VvZiBBcnJheSkgJiYgXy5pc09iamVjdChkYXRhU2V0KSkge1xuICAgICAgICBjb25zdCBpID0gMDtcbiAgICAgICAgXy5mb3JFYWNoKGRhdGFTZXQsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICBkYXRhLnB1c2goe2tleTogXy50cmltKGtleSksIHZhbHVlOiBrZXksIGxhYmVsOiAoaXNEZWZpbmVkKHZhbHVlKSAmJiB2YWx1ZSAhPT0gbnVsbCkgPyB2YWx1ZS50b1N0cmluZygpIDogJycsIGluZGV4OiBzdGFydEluZGV4LCBkYXRhT2JqZWN0OiBkYXRhU2V0fSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghbXlEYXRhRmllbGQpIHsgLy8gY29uc2lkZXIgdGhlIGRhdGFmaWVsZCBhcyAnQUxMRklFTERTJyB3aGVuIGRhdGFmaWVsZCBpcyBub3QgZ2l2ZW4uXG4gICAgICAgICAgICBteURhdGFGaWVsZCA9IEFMTEZJRUxEUztcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGFTZXQuZm9yRWFjaCgob3B0aW9uLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gbXlEYXRhRmllbGQgPT09IEFMTEZJRUxEUyA/IHN0YXJ0SW5kZXggKyBpbmRleCA6IGdldE9ialZhbHVlQnlLZXkob3B0aW9uLCBteURhdGFGaWVsZCk7XG5cbiAgICAgICAgICAgIC8vIE9taXQgYWxsIHRoZSBpdGVtcyB3aG9zZSBkYXRhZmllbGQgKGtleSkgaXMgbnVsbCBvciB1bmRlZmluZWQuXG4gICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoa2V5KSAmJiAhXy5pc051bGwoa2V5KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gZ2V0RXZhbHVhdGVkRGF0YShvcHRpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGQ6IGRpc3BsYXlPcHRpb25zLmRpc3BsYXlGaWVsZCxcbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbjogZGlzcGxheU9wdGlvbnMuZGlzcGxheUV4cHIsXG4gICAgICAgICAgICAgICAgICAgIGJpbmRFeHByZXNzaW9uOiBkaXNwbGF5T3B0aW9ucy5iaW5kRGlzcGxheUV4cHJcbiAgICAgICAgICAgICAgICB9LCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhU2V0SXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAoaXNEZWZpbmVkKGxhYmVsKSAmJiBsYWJlbCAhPT0gbnVsbCkgPyBsYWJlbC50b1N0cmluZygpIDogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBteURhdGFGaWVsZCA9PT0gQUxMRklFTERTID8gb3B0aW9uIDoga2V5LFxuICAgICAgICAgICAgICAgICAgICBkYXRhT2JqZWN0OiBvcHRpb24sIC8vIHJlcHJlc2VudHMgdGhlIG9iamVjdCB3aGVuIGRhdGFmaWVsZCBpcyBBTExGSUVMRFMuIFRoaXMgaXMgdXNlZCBhcyBpbm5lckl0ZW0gd2hpbGUgZ3JvdXBpbmcgdGhlIGRhdGFzZXRJdGVtcy5cbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHN0YXJ0SW5kZXggKyBpbmRleFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKGRpc3BsYXlPcHRpb25zLmRpc3BsYXlJbWdTcmMgfHwgZGlzcGxheU9wdGlvbnMuYmluZERpc3BsYXlJbWdTcmMpIHtcbiAgICAgICAgICAgICAgICAgICAgKGRhdGFTZXRJdGVtIGFzIGFueSkuaW1nU3JjID0gZ2V0RXZhbHVhdGVkRGF0YShvcHRpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IGRpc3BsYXlPcHRpb25zLmRpc3BsYXlJbWdTcmMsXG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kRXhwcmVzc2lvbjogZGlzcGxheU9wdGlvbnMuYmluZERpc3BsYXlJbWdTcmNcbiAgICAgICAgICAgICAgICAgICAgfSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGEucHVzaChkYXRhU2V0SXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbn07XG5cbi8qKlxuICogUHJpdmF0ZSBtZXRob2QgdG8gZ2V0IHRoZSB1bmlxdWUgb2JqZWN0cyBieSB0aGUgZGF0YSBmaWVsZFxuICovXG5leHBvcnQgY29uc3QgZ2V0VW5pcU9ianNCeURhdGFGaWVsZCA9IChkYXRhOiBBcnJheTxEYXRhU2V0SXRlbT4sIGRhdGFGaWVsZDogc3RyaW5nLCBkaXNwbGF5RmllbGQ6IHN0cmluZywgYWxsb3dFbXB0eUZpZWxkcz86IGJvb2xlYW4pID0+IHtcbiAgICBsZXQgdW5pcURhdGE7XG4gICAgY29uc3QgaXNBbGxGaWVsZHMgPSBkYXRhRmllbGQgPT09IEFMTEZJRUxEUztcblxuICAgIHVuaXFEYXRhID0gaXNBbGxGaWVsZHMgPyBfLnVuaXFXaXRoKGRhdGEsIF8uaXNFcXVhbCkgOiBfLnVuaXFCeShkYXRhLCAna2V5Jyk7XG5cbiAgICBpZiAoIWRpc3BsYXlGaWVsZCB8fCBhbGxvd0VtcHR5RmllbGRzKSB7XG4gICAgICAgIHJldHVybiB1bmlxRGF0YTtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gb2JqZWN0cyBoYXZpbmcgbm9uIGVtcHR5IGRhdGFmaWVsZCBhbmQgZGlzcGxheSBmaWVsZCB2YWx1ZXMuXG4gICAgcmV0dXJuIF8uZmlsdGVyKHVuaXFEYXRhLCAob2JqKSA9PiB7XG4gICAgICAgIGlmIChpc0FsbEZpZWxkcykge1xuICAgICAgICAgICAgcmV0dXJuIF8udHJpbShvYmoubGFiZWwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfLnRyaW0ob2JqLmtleSkgJiYgXy50cmltKG9iai5sYWJlbCk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gc2V0cyB0aGUgc2VsZWN0ZWRJdGVtIGJ5IGNvbXBhcmluZyB0aGUgZmllbGQgdmFsdWVzLCB3aGVyZSBmaWVsZHMgYXJlIHBhc3NlZCBieSBcImNvbXBhcmVieVwiIHByb3BlcnR5LlxuICogd29ya3Mgb25seSBmb3IgZGF0YWZpZWxkIHdpdGggQUxMX0ZJRUxEU1xuICogQHBhcmFtIGRhdGFzZXRJdGVtcyBsaXN0IG9mIGRhdGFzZXQgaXRlbXMuXG4gKiBAcGFyYW0gY29tcGFyZVdpdGhEYXRhT2JqIHJlcHJlc2VudHMgdGhlIGRhdGF2YWx1ZSAob2JqZWN0KSB3aG9zZSBwcm9wZXJ0aWVzIGFyZSB0byBiZSBjaGVja2VkIGFnYWluc3QgZWFjaCBwcm9wZXJ0eSBvZiBkYXRhc2V0SXRlbS5cbiAqIEBwYXJhbSBjb21wYXJlQnlGaWVsZCBzcGVjaWZpZXMgdGhlIHByb3BlcnR5IG5hbWVzIG9uIHdoaWNoIGRhdGFzZXRJdGVtIGhhcyB0byBiZSBjb21wYXJlZCBhZ2FpbnN0IGRhdGF2YWx1ZSBvYmplY3QuXG4gKi9cbmV4cG9ydCBjb25zdCBzZXRJdGVtQnlDb21wYXJlID0gKGRhdGFzZXRJdGVtczogQXJyYXk8RGF0YVNldEl0ZW0+LCBjb21wYXJlV2l0aERhdGFPYmo6IE9iamVjdCwgY29tcGFyZUJ5RmllbGQ6IHN0cmluZykgPT4ge1xuICAgIC8vIGNvbXBhcmUgdGhlIGZpZWxkcyBiYXNlZCBvbiBmaWVsZHMgZ2l2ZW4gdG8gY29tcGFyZWJ5IHByb3BlcnR5LlxuICAgIF8uZm9yRWFjaChkYXRhc2V0SXRlbXMsIG9wdCA9PiB7XG4gICAgICAgIGlmIChpc0VxdWFsV2l0aEZpZWxkcyhvcHQudmFsdWUsIGNvbXBhcmVXaXRoRGF0YU9iaiwgY29tcGFyZUJ5RmllbGQpKSB7XG4gICAgICAgICAgICBvcHQuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgc29ydGVkIGRhdGEgYmFzZWQgdG8gZ3JvdXBrZXkuXG4gKiBSZXR1cm5zIGEgYXJyYXkgb2Ygb2JqZWN0cywgZWFjaCBvYmplY3QgY29udGFpbmluZyBrZXkgd2hpY2ggaXMgZ3JvdXBLZXkgYW5kIGRhdGEgaXMgdGhlIHNvcnRlZCBkYXRhIHdoaWNoIGlzIHNvcnRlZCBieSBncm91cGJ5IGZpZWxkIGluIHRoZSBkYXRhLlxuICpcbiAqIEBwYXJhbSBncm91cGVkTGlEYXRhLCBncm91cGVkIGRhdGEgb2JqZWN0IHdpdGgga2V5IGFzIHRoZSBncm91cEtleSBhbmQgaXRzIHZhbHVlIGFzIHRoZSBhcnJheSBvZiBvYmplY3RzIGdyb3VwZWQgdW5kZXIgdGhlIGdyb3VwS2V5LlxuICogQHBhcmFtIGdyb3VwQnksIHN0cmluZyBncm91cGJ5IHByb3BlcnR5XG4gKiBAcmV0dXJucyB7YW55W119XG4gKi9cbmNvbnN0IGdldFNvcnRlZEdyb3VwZWREYXRhID0gKGdyb3VwZWRMaURhdGE6IE9iamVjdCwgZ3JvdXBCeTogc3RyaW5nLCBvcmRlcmJ5OiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBfZ3JvdXBlZERhdGEgPSBbXTtcbiAgICBfLmZvckVhY2goXy5rZXlzKGdyb3VwZWRMaURhdGEpLCAoZ3JvdXBrZXksIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IGxpRGF0YSA9IGdldE9yZGVyZWREYXRhc2V0KGdyb3VwZWRMaURhdGFbZ3JvdXBrZXldLCBvcmRlcmJ5LCAnZGF0YU9iamVjdCcpO1xuICAgICAgICBfZ3JvdXBlZERhdGEucHVzaCh7XG4gICAgICAgICAgICBrZXk6IGdyb3Vwa2V5LFxuICAgICAgICAgICAgZGF0YTogXy5zb3J0QnkobGlEYXRhLCBkYXRhID0+IHtcbiAgICAgICAgICAgICAgICBkYXRhLl9ncm91cEluZGV4ID0gaW5kZXggKyAxO1xuICAgICAgICAgICAgICAgIHJldHVybiBfLmdldChkYXRhLCBncm91cEJ5KSB8fCBfLmdldChkYXRhLmRhdGFPYmplY3QsIGdyb3VwQnkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIF9ncm91cGVkRGF0YTtcbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgZ2V0cyB0aGUgZ3JvdXBlZERhdGEgdXNpbmcgZ3JvdXBieSBwcm9wZXJ0eSBhbmQgbWF0Y2ggYW5kIHJldHVybnMgdGhlIHNvcnRlZCBhcnJheSBvZiBvYmplY3RzLlxuICpcbiAqIEBwYXJhbSBjb21wUmVmIHJlcHJlc2VudHMgdGhlIGNvbXBvbmVudCdzIHJlZmVyZW5jZSBpLmUuIFwidGhpc1wiIHZhbHVlLlxuICogQHBhcmFtIGRhdGEgcmVwcmVzZW50cyB0aGUgZGF0YXNldCBpLmUgYXJyYXkgb2Ygb2JqZWN0cy5cbiAqIEBwYXJhbSBncm91cGJ5LCBzdHJpbmcgZ3JvdXBieSBwcm9wZXJ0eVxuICogQHBhcmFtIG1hdGNoLCBzdHJpbmcgbWF0Y2ggcHJvcGVydHlcbiAqIEBwYXJhbSBvcmRlcmJ5LCBzdHJpbmcgb3JkZXJieSBwcm9wZXJ0eVxuICogQHBhcmFtIGRhdGVmb3JtYXQsIHN0cmluZyBkYXRlRm9ybWF0IHByb3BlcnR5XG4gKiBAcGFyYW0gaW5uZXJJdGVtLCByZXByZXNlbnRzIHRoZSBpbm5lckl0ZW0gb24gd2hpY2ggZ3JvdXBieSBoYXMgdG8gYmUgYXBwbGllZC4gSW5jYXNlIG9mIGRhdGFzZXRJdGVtcywgJ2RhdGFPYmplY3QnIGNvbnRhaW5zIHRoZSBmdWxsIG9iamVjdC4gSGVyZSBpbm5lckl0ZW0gaXMgZGF0YU9iamVjdC5cbiAqIEByZXR1cm5zIHthbnlbXX0gZ3JvdXBlZERhdGEsIGFycmF5IG9mIG9iamVjdHMsIGVhY2ggb2JqZWN0IGhhdmluZyBrZXkgYW5kIGRhdGEuXG4gKi9cbmV4cG9ydCBjb25zdCBncm91cERhdGEgPSAoY29tcFJlZjogYW55LCBkYXRhOiBBcnJheTxPYmplY3QgfCBEYXRhU2V0SXRlbT4sIGdyb3VwYnk6IHN0cmluZywgbWF0Y2g6IHN0cmluZywgb3JkZXJieTogc3RyaW5nLCBkYXRlZm9ybWF0OiBzdHJpbmcsIGRhdGVQaXBlOiBUb0RhdGVQaXBlLCBpbm5lckl0ZW0/OiBzdHJpbmcsIEFwcERlZmF1bHRzPzogYW55KSA9PiB7XG4gICAgbGV0IGdyb3VwZWRMaURhdGEgPSB7fTtcbiAgICBpZiAoXy5pbmNsdWRlcyhncm91cGJ5LCAnKCcpKSB7XG4gICAgICAgIGNvbnN0IGdyb3VwRGF0YUJ5VXNlckRlZmluZWRGbiA9ICRwYXJzZUV2ZW50KGdyb3VwYnkpO1xuICAgICAgICBncm91cGVkTGlEYXRhID0gXy5ncm91cEJ5KGRhdGEsIHZhbCA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZ3JvdXBEYXRhQnlVc2VyRGVmaW5lZEZuKGNvbXBSZWYudmlld1BhcmVudCwgeydyb3cnOiB2YWwuZGF0YU9iamVjdCB8fCB2YWx9KTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ3JvdXBlZExpRGF0YSA9IGdldEdyb3VwZWREYXRhKGRhdGEsIGdyb3VwYnksIG1hdGNoLCBvcmRlcmJ5LCBkYXRlZm9ybWF0LCBkYXRlUGlwZSwgaW5uZXJJdGVtLCBBcHBEZWZhdWx0cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldFNvcnRlZEdyb3VwZWREYXRhKGdyb3VwZWRMaURhdGEsIGdyb3VwYnksIG9yZGVyYnkpO1xufTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBwcmVwYXJlcyB0aGUgZ3JvdXBlZCBkYXRhLlxuICpcbiAqIEBwYXJhbSBmaWVsZERlZnMgYXJyYXkgb2Ygb2JqZWN0cyBpLmUuIGRhdGFzZXRcbiAqIEBwYXJhbSBncm91cGJ5IHN0cmluZyBncm91cGJ5XG4gKiBAcGFyYW0gbWF0Y2ggc3RyaW5nIG1hdGNoXG4gKiBAcGFyYW0gb3JkZXJieSBzdHJpbmcgb3JkZXJieVxuICogQHBhcmFtIGRhdGVGb3JtYXQgc3RyaW5nIGRhdGUgZm9ybWF0XG4gKiBAcGFyYW0gaW5uZXJJdGVtLCBpdGVtIHRvIGxvb2sgZm9yIGluIHRoZSBwYXNzZWQgZGF0YVxuICovXG5jb25zdCBnZXRHcm91cGVkRGF0YSA9IChmaWVsZERlZnM6IEFycmF5PE9iamVjdCB8IERhdGFTZXRJdGVtPiwgZ3JvdXBieTogc3RyaW5nLCBtYXRjaDogc3RyaW5nLCBvcmRlcmJ5OiBzdHJpbmcsIGRhdGVGb3JtYXQ6IHN0cmluZywgZGF0ZVBpcGU6IFRvRGF0ZVBpcGUsIGlubmVySXRlbT86IHN0cmluZywgQXBwRGVmYXVsdHM/OiBhbnkpID0+IHtcbiAgICAvLyBGb3IgZGF5LCBzZXQgdGhlIHJlbGV2YW50IG1vbWVudCBjYWxlbmRhciBvcHRpb25zXG4gICAgaWYgKG1hdGNoID09PSBUSU1FX1JPTExVUF9PUFRJT05TLkRBWSkge1xuICAgICAgICBtb21lbnRMb2NhbGUuX2NhbGVuZGFyID0gbW9tZW50Q2FsZW5kYXJEYXlPcHRpb25zO1xuICAgIH1cblxuICAgIC8vIGhhbmRsaW5nIGNhc2UtaW4tc2Vuc2l0aXZlIHNjZW5hcmlvXG4gICAgLy8gb3JkZXJpbmcgdGhlIGRhdGEgYmFzZWQgb24gZ3JvdXBieSBmaWVsZC4gSWYgdGhlcmUgaXMgaW5uZXJJdGVtIHRoZW4gYXBwbHkgb3JkZXJieSB1c2luZyB0aGUgaW5uZXJJdGVtJ3MgY29udGFpbmluZyB0aGUgZ3JvdXBieSBmaWVsZC5cbiAgICBmaWVsZERlZnMgPSBfLm9yZGVyQnkoZmllbGREZWZzLCBmaWVsZERlZiA9PiB7XG4gICAgICAgIGNvbnN0IGdyb3VwS2V5ID0gXy5nZXQoaW5uZXJJdGVtID8gZmllbGREZWZbaW5uZXJJdGVtXSA6IGZpZWxkRGVmLCBncm91cGJ5KTtcbiAgICAgICAgaWYgKGdyb3VwS2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gXy50b0xvd2VyKGdyb3VwS2V5KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gZXh0cmFjdCB0aGUgZ3JvdXBlZCBkYXRhIGJhc2VkIG9uIHRoZSBmaWVsZCBvYnRhaW5lZCBmcm9tICdncm91cERhdGFCeUZpZWxkJy5cbiAgICBjb25zdCBncm91cGVkTGlEYXRhID0gXy5ncm91cEJ5KGZpZWxkRGVmcywgZ3JvdXBEYXRhQnlGaWVsZC5iaW5kKHVuZGVmaW5lZCwgZ3JvdXBieSwgbWF0Y2gsIGlubmVySXRlbSwgZGF0ZUZvcm1hdCwgZGF0ZVBpcGUsIEFwcERlZmF1bHRzKSk7XG5cbiAgICBtb21lbnRMb2NhbGUuX2NhbGVuZGFyID0gbW9tZW50Q2FsZW5kYXJPcHRpb25zOyAvLyBSZXNldCB0byBkZWZhdWx0IG1vbWVudCBjYWxlbmRhciBvcHRpb25zXG5cbiAgICByZXR1cm4gZ3JvdXBlZExpRGF0YTtcbn07XG5cbi8vIEZvcm1hdCB0aGUgZGF0ZSB3aXRoIGdpdmVuIGRhdGUgZm9ybWF0XG5leHBvcnQgY29uc3QgZmlsdGVyRGF0ZSA9ICh2YWx1ZTogc3RyaW5nIHwgbnVtYmVyLCBmb3JtYXQ6IHN0cmluZywgZGVmYXVsdEZvcm1hdDogc3RyaW5nLCBkYXRlUGlwZTogVG9EYXRlUGlwZSkgPT4ge1xuICAgIGlmIChmb3JtYXQgPT09ICd0aW1lc3RhbXAnKSB7IC8vIEZvciB0aW1lc3RhbXAgZm9ybWF0LCByZXR1cm4gdGhlIGVwb2NoIHZhbHVlXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0Rm9ybWF0dGVkRGF0ZShkYXRlUGlwZSwgdmFsdWUsIGZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0KTtcbn07XG5cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBncm91cGtleSBiYXNlZCBvbiB0aGUgcm9sbHVwIChtYXRjaCkgcGFzc2VkXG4gKlxuICogQHBhcmFtIGNvbmNhdFN0ciwgc3RyaW5nIGNvbnRhaW5pbmcgZ3JvdXBieSBmaWVsZCB2YWx1ZVxuICogQHBhcmFtIHJvbGxVcCBzdHJpbmcgY29udGFpbmluZyB0aGUgbWF0Y2ggcHJvcGVydHkuXG4gKiBAcGFyYW0gZGF0ZWZvcm1hdCBzdHJpbmcgY29udGFpbmluZyB0aGUgZGF0ZSBmb3JtYXQgdG8gZGlzcGxheSB0aGUgZGF0ZS5cbiAqL1xuY29uc3QgZ2V0VGltZVJvbGxlZFVwU3RyaW5nID0gKGNvbmNhdFN0cjogc3RyaW5nLCByb2xsVXA6IHN0cmluZywgZGF0ZWZvcm1hdDogc3RyaW5nLCBkYXRlUGlwZT86IFRvRGF0ZVBpcGUsIEFwcERlZmF1bHRzPzogYW55KSA9PiB7XG4gICAgbGV0IGdyb3VwQnlLZXksXG4gICAgICAgIHN0ck1vbWVudCAgPSBtb21lbnQoY29uY2F0U3RyKSxcbiAgICAgICAgZGF0ZUZvcm1hdCA9IGRhdGVmb3JtYXQ7XG5cbiAgICBjb25zdCBjdXJyTW9tZW50ID0gbW9tZW50KCksXG4gICAgICAgIGdldFNhbWVFbHNlRm9ybWF0ID0gZnVuY3Rpb24gKCkgeyAvLyBTZXQgdGhlIHNhbWVFbHNlIG9wdGlvbiBvZiBtb21lbnQgY2FsZW5kYXIgdG8gdXNlciBkZWZpbmVkIHBhdHRlcm5cbiAgICAgICAgICAgIHJldHVybiAnWycgKyBmaWx0ZXJEYXRlKHRoaXMudmFsdWVPZigpLCBkYXRlRm9ybWF0LCBST0xMVVBfUEFUVEVSTlMuREFZLCBkYXRlUGlwZSkgKyAnXSc7XG4gICAgICAgIH07XG5cbiAgICBzd2l0Y2ggKHJvbGxVcCkge1xuICAgICAgICBjYXNlIFRJTUVfUk9MTFVQX09QVElPTlMuSE9VUjpcbiAgICAgICAgICAgIGRhdGVGb3JtYXQgPSBkYXRlRm9ybWF0IHx8IEFwcERlZmF1bHRzLnRpbWVGb3JtYXQ7XG5cbiAgICAgICAgICAgIC8vIElmIGRhdGUgaXMgaW52YWxpZCwgY2hlY2sgaWYgZGF0YSBpcyBpbiBmb3JtIG9mIGhoOm1tIGFcbiAgICAgICAgICAgIGlmICghc3RyTW9tZW50LmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgICAgIHN0ck1vbWVudCA9IG1vbWVudChuZXcgRGF0ZSgpLnRvRGF0ZVN0cmluZygpICsgJyAnICsgY29uY2F0U3RyKTtcblxuICAgICAgICAgICAgICAgIGlmIChzdHJNb21lbnQuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFzIG9ubHkgdGltZSBpcyBwcmVzZW50LCByb2xsIHVwIGF0IHRoZSBob3VyIGxldmVsIHdpdGggZ2l2ZW4gdGltZSBmb3JtYXRcbiAgICAgICAgICAgICAgICAgICAgbW9tZW50TG9jYWxlLl9jYWxlbmRhci5zYW1lRGF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdbJyArIGZpbHRlckRhdGUodGhpcy52YWx1ZU9mKCksIGRhdGVGb3JtYXQsIFJPTExVUF9QQVRURVJOUy5IT1VSLCBkYXRlUGlwZSkgKyAnXSc7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcm91bmQgb2ZmIHRvIG5lYXJlc3QgbGFzdCBob3VyXG4gICAgICAgICAgICBzdHJNb21lbnQgPSBzdHJNb21lbnQuc3RhcnRPZignaG91cicpO1xuICAgICAgICAgICAgbW9tZW50TG9jYWxlLl9jYWxlbmRhci5zYW1lRWxzZSA9IGdldFNhbWVFbHNlRm9ybWF0O1xuICAgICAgICAgICAgZ3JvdXBCeUtleSA9IHN0ck1vbWVudC5jYWxlbmRhcihjdXJyTW9tZW50KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFRJTUVfUk9MTFVQX09QVElPTlMuV0VFSzpcbiAgICAgICAgICAgIGdyb3VwQnlLZXkgPSBmaWx0ZXJEYXRlKHN0ck1vbWVudC52YWx1ZU9mKCksIGRhdGVGb3JtYXQsIFJPTExVUF9QQVRURVJOUy5XRUVLLCBkYXRlUGlwZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBUSU1FX1JPTExVUF9PUFRJT05TLk1PTlRIOlxuICAgICAgICAgICAgZ3JvdXBCeUtleSA9IGZpbHRlckRhdGUoc3RyTW9tZW50LnZhbHVlT2YoKSwgZGF0ZUZvcm1hdCwgUk9MTFVQX1BBVFRFUk5TLk1PTlRILCBkYXRlUGlwZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBUSU1FX1JPTExVUF9PUFRJT05TLllFQVI6XG4gICAgICAgICAgICBncm91cEJ5S2V5ID0gc3RyTW9tZW50LmZvcm1hdChST0xMVVBfUEFUVEVSTlMuWUVBUik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBUSU1FX1JPTExVUF9PUFRJT05TLkRBWTpcbiAgICAgICAgICAgIGRhdGVGb3JtYXQgPSBkYXRlRm9ybWF0IHx8IEFwcERlZmF1bHRzLmRhdGVGb3JtYXQ7XG4gICAgICAgICAgICBzdHJNb21lbnQgPSBzdHJNb21lbnQuc3RhcnRPZignZGF5Jyk7IC8vIHJvdW5kIG9mZiB0byBjdXJyZW50IGRheVxuICAgICAgICAgICAgbW9tZW50TG9jYWxlLl9jYWxlbmRhci5zYW1lRWxzZSA9IGdldFNhbWVFbHNlRm9ybWF0O1xuICAgICAgICAgICAgZ3JvdXBCeUtleSA9IHN0ck1vbWVudC5jYWxlbmRhcihjdXJyTW9tZW50KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvLyBJZiBpbnZhbGlkIGRhdGUgaXMgcmV0dXJuZWQsIENhdGVnb3JpemUgaXQgYXMgT3RoZXJzLlxuICAgIGlmIChncm91cEJ5S2V5ID09PSAnSW52YWxpZCBkYXRlJykge1xuICAgICAgICByZXR1cm4gR1JPVVBfQllfT1BUSU9OUy5PVEhFUlM7XG4gICAgfVxuICAgIHJldHVybiBncm91cEJ5S2V5O1xufTtcblxuXG4vLyBncm91cHMgdGhlIGZpZWxkcyBiYXNlZCBvbiB0aGUgZ3JvdXBieSB2YWx1ZS5cbmNvbnN0IGdyb3VwRGF0YUJ5RmllbGQgPSAoZ3JvdXBieTogc3RyaW5nLCBtYXRjaDogc3RyaW5nLCBpbm5lckl0ZW06IHN0cmluZywgZGF0ZUZvcm1hdDogc3RyaW5nLCBkYXRlUGlwZTogVG9EYXRlUGlwZSwgQXBwRGVmYXVsdHM6IGFueSwgbGlEYXRhOiBPYmplY3QpID0+IHtcbiAgICAvLyBnZXQgdGhlIGdyb3VwYnkgZmllbGQgdmFsdWUgZnJvbSB0aGUgbGlEYXRhIG9yIGlubmVySXRlbSBpbiB0aGUgbGlEYXRhLlxuICAgIGxldCBjb25jYXRTdHIgPSBfLmdldChpbm5lckl0ZW0gPyBsaURhdGFbaW5uZXJJdGVtXSA6IGxpRGF0YSwgZ3JvdXBieSk7XG5cbiAgICAvLyBieSBkZWZhdWx0IHNldCB0aGUgdW5kZWZpbmVkIGdyb3VwS2V5IGFzICdvdGhlcnMnXG4gICAgaWYgKF8uaXNVbmRlZmluZWQoY29uY2F0U3RyKSB8fCBfLmlzTnVsbChjb25jYXRTdHIpIHx8IGNvbmNhdFN0ci50b1N0cmluZygpLnRyaW0oKSA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIEdST1VQX0JZX09QVElPTlMuT1RIRVJTO1xuICAgIH1cblxuICAgIC8vIGlmIG1hdGNoIHByb3AgaXMgYWxwaGFiZXRpYyAsZ2V0IHRoZSBzdGFydGluZyBhbHBoYWJldCBvZiB0aGUgd29yZCBhcyBrZXkuXG4gICAgaWYgKG1hdGNoID09PSBHUk9VUF9CWV9PUFRJT05TLkFMUEhBQkVUKSB7XG4gICAgICAgIGNvbmNhdFN0ciA9IGNvbmNhdFN0ci5zdWJzdHIoMCwgMSk7XG4gICAgfVxuXG4gICAgLy8gaWYgbWF0Y2ggY29udGFpbnMgdGhlIHRpbWUgb3B0aW9ucyB0aGVuIGdldCB0aGUgY29uY2F0U3RyIHVzaW5nICdnZXRUaW1lUm9sbGVkVXBTdHJpbmcnXG4gICAgaWYgKF8uaW5jbHVkZXMoXy52YWx1ZXMoVElNRV9ST0xMVVBfT1BUSU9OUyksIG1hdGNoKSkge1xuICAgICAgICBjb25jYXRTdHIgPSBnZXRUaW1lUm9sbGVkVXBTdHJpbmcoY29uY2F0U3RyLCBtYXRjaCwgZGF0ZUZvcm1hdCwgZGF0ZVBpcGUsIEFwcERlZmF1bHRzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uY2F0U3RyO1xufTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCB0b2dnbGVzIGFsbCB0aGUgbGlzdCBpdGVtcyBpbnNpZGUgdGhlIGVhY2ggbGlzdCBncm91cC5cbiAqIEBwYXJhbSBlbCwgY29tcG9uZW50IHJlZmVyZW5jZSBvbiB3aGljaCBncm91cGJ5IGlzIGFwcGxpZWQuXG4gKi9cbmV4cG9ydCBjb25zdCB0b2dnbGVBbGxIZWFkZXJzID0gKGVsOiBhbnkpID0+IHtcbiAgICBjb25zdCBncm91cHMgPSAkKGVsLm5hdGl2ZUVsZW1lbnQpLmZpbmQoJy5pdGVtLWdyb3VwJyk7XG5cbiAgICBncm91cHMuZmluZCgnLmdyb3VwLWxpc3QtaXRlbScpLnRvZ2dsZSgpO1xuXG4gICAgLy8gdG9nZ2xlIHRoZSBjb2xsYXBzZSBpY29uIG9uIGxpc3QgaGVhZGVyLlxuICAgIGNvbnN0IGdyb3VwSWNvbnMgPSBncm91cHMuZmluZCgnbGkubGlzdC1ncm91cC1oZWFkZXIgLmFwcC1pY29uJyk7XG5cbiAgICBpZiAoZ3JvdXBJY29ucykge1xuICAgICAgICBfLmZvckVhY2goZ3JvdXBJY29ucywgKGljb24pID0+IHtcbiAgICAgICAgICAgIGljb24gPSAkKGljb24pO1xuICAgICAgICAgICAgaWYgKGljb24uaGFzQ2xhc3MoJ3dpLWNoZXZyb24tZG93bicpKSB7XG4gICAgICAgICAgICAgICAgaWNvbi5yZW1vdmVDbGFzcygnd2ktY2hldnJvbi1kb3duJykuYWRkQ2xhc3MoJ3dpLWNoZXZyb24tdXAnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWNvbi5yZW1vdmVDbGFzcygnd2ktY2hldnJvbi11cCcpLmFkZENsYXNzKCd3aS1jaGV2cm9uLWRvd24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBPbiBsaXN0IGhlYWRlciBjbGljaywgdG9nZ2xlIHRoZSBsaXN0IGl0ZW1zIGluIHRoaXMgZ3JvdXAuXG4gKiBhbmQgYWxzbyB0b2dnbGUgdGhlIGhlYWRlciBpY29uLlxuICogQHBhcmFtICRldmVudFxuICovXG5leHBvcnQgY29uc3QgaGFuZGxlSGVhZGVyQ2xpY2sgPSAoJGV2ZW50OiBFdmVudCkgPT4ge1xuICAgIGNvbnN0IHNlbGVjdGVkR3JvdXAgICA9ICQoJGV2ZW50LnRhcmdldCBhcyBhbnkpLmNsb3Nlc3QoJy5pdGVtLWdyb3VwJyksXG4gICAgICAgIHNlbGVjdGVkQXBwSWNvbiA9IHNlbGVjdGVkR3JvdXAuZmluZCgnbGkubGlzdC1ncm91cC1oZWFkZXIgLmFwcC1pY29uJyk7XG5cbiAgICBpZiAoc2VsZWN0ZWRBcHBJY29uLmhhc0NsYXNzKCd3aS1jaGV2cm9uLWRvd24nKSkge1xuICAgICAgICBzZWxlY3RlZEFwcEljb24ucmVtb3ZlQ2xhc3MoJ3dpLWNoZXZyb24tZG93bicpLmFkZENsYXNzKCd3aS1jaGV2cm9uLXVwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZWN0ZWRBcHBJY29uLnJlbW92ZUNsYXNzKCd3aS1jaGV2cm9uLXVwJykuYWRkQ2xhc3MoJ3dpLWNoZXZyb24tZG93bicpO1xuICAgIH1cblxuICAgIHNlbGVjdGVkR3JvdXAuZmluZCgnLmdyb3VwLWxpc3QtaXRlbScpLnRvZ2dsZSgpO1xufTtcblxuLyoqXG4gKiBjb25maWd1cmVzIHJlb3JkZXJpbmcgdGhlIGl0ZW1zLlxuICogQHBhcmFtICRlbCBlbGVtZW50IHRvIGJlIHNvcnRhYmxlXG4gKiBAcGFyYW0gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyB0aGUgc29ydGFibGUgb3B0aW9ucy5cbiAqIEBwYXJhbSBzdGFydENiIGNhbGxiYWNrIG9uIGRyYWcgc3RhcnQgb24gdGhlIGVsZW1lbnQuXG4gKiBAcGFyYW0gdXBkYXRlQ2IgY2FsbGJhY2sgdHJpZ2dlcnJlZCB3aGVuIHNvcnRpbmcgaXMgc3RvcHBlZCBhbmQgdGhlIERPTSBwb3NpdGlvbiBoYXMgY2hhbmdlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGNvbmZpZ3VyZURuRCA9ICgkZWw6IGFueSwgb3B0aW9uczogb2JqZWN0LCBzdGFydENiOiBGdW5jdGlvbiwgdXBkYXRlQ2I6IEZ1bmN0aW9uKSA9PiB7XG4gICAgY29uc3Qgc29ydE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgY29udGFpbm1lbnQ6ICRlbCxcbiAgICAgICAgZGVsYXk6IDEwMCxcbiAgICAgICAgb3BhY2l0eTogMC44LFxuICAgICAgICBoZWxwZXI6ICdjbG9uZScsXG4gICAgICAgIHpJbmRleDogMTA1MCxcbiAgICAgICAgdG9sZXJhbmNlOiAncG9pbnRlcicsXG4gICAgICAgIHN0YXJ0OiBzdGFydENiLFxuICAgICAgICB1cGRhdGU6IHVwZGF0ZUNiXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICAkZWwuc29ydGFibGUoc29ydE9wdGlvbnMpO1xufTtcblxuLy8gVG9kbzogY29udmVydCB0byBDbGFzc1xuaW50ZXJmYWNlIERhdGFTZXRQcm9wcyB7XG4gICAgZGF0YWZpZWxkOiBzdHJpbmc7XG4gICAgZGlzcGxheWZpZWxkPzogc3RyaW5nO1xuICAgIGRpc3BsYXlleHByZXNzaW9uPzogc3RyaW5nO1xuICAgIHVzZWtleXM/OiBib29sZWFuO1xuICAgIG9yZGVyYnk/OiBzdHJpbmc7XG59XG5cbi8qKlxuICoga2V5IHJlcHJlc2VudHMgdGhlIGRhdGFmaWVsZCB2YWx1ZVxuICogbGFiZWwgcmVwcmVzZW50cyBkaXNwbGF5IHZhbHVlIG9yIGV4cHJlc3Npb24gdmFsdWVcbiAqIHZhbHVlIGRpc3BsYXlWYWx1ZSBmb3IgcHJpbWl0aXZlcyBhbmQgZGF0YSBvYmplY3QgZm9yIGFsbEZpZWxkc1xuICogZGF0YU9iamVjdCByZXByZXNlbnQgdGhlIG9iamVjdCBmcm9tIHRoZSBkYXRhc2V0IHdoZW4gZGF0YWZpZWxkIGlzIEFMTEZJRUxEUy4gVGhpcyBpcyB1c2VkIGFzIGlubmVySXRlbSB3aGlsZSBncm91cGluZyB0aGUgZGF0YXNldEl0ZW1zLlxuICogaW1nU3JjIHBpY3R1cmUgc291cmNlXG4gKiBzZWxlY3RlZCByZXByZXNlbnRzIGJvb2xlYW4gdG8gbm90aWZ5IHNlbGVjdGVkIGl0ZW0uXG4gKi9cbmV4cG9ydCBjbGFzcyBEYXRhU2V0SXRlbSB7XG4gICAga2V5OiBhbnk7XG4gICAgbGFiZWw6IGFueTtcbiAgICB2YWx1ZTogYW55O1xuICAgIGRhdGFPYmplY3Q/OiBPYmplY3Q7XG4gICAgaW5kZXg/OiBudW1iZXI7XG4gICAgaW1nU3JjPzogc3RyaW5nO1xuICAgIHNlbGVjdGVkPzogYm9vbGVhbjtcbn1cbiJdfQ==