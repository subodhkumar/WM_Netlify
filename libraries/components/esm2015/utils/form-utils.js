import { $parseEvent, getClonedObject, getFormattedDate, isDefined, isEqualWithFields } from '@wm/core';
import { getEvaluatedData, getObjValueByKey } from './widget-utils';
import { ALLFIELDS } from './data-utils';
const momentLocale = moment.localeData();
const momentCalendarOptions = getClonedObject(momentLocale._calendar);
const momentCalendarDayOptions = momentLocale._calendarDay || {
    lastDay: '[Yesterday]',
    lastWeek: '[Last] dddd',
    nextDay: '[Tomorrow]',
    nextWeek: 'dddd',
    sameDay: '[Today]',
    sameElse: 'L'
};
const GROUP_BY_OPTIONS = {
    ALPHABET: 'alphabet',
    WORD: 'word',
    OTHERS: 'Others'
};
const TIME_ROLLUP_OPTIONS = {
    HOUR: 'hour',
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year'
};
const ROLLUP_PATTERNS = {
    DAY: 'yyyy-MM-dd',
    WEEK: 'w \'Week\',  yyyy',
    MONTH: 'MMM, yyyy',
    YEAR: 'YYYY',
    HOUR: 'hh:mm a'
};
/**
 * function to get the ordered dataset based on the given orderby
 */
export const getOrderedDataset = (dataSet, orderBy, innerItem) => {
    if (!orderBy) {
        return _.cloneDeep(dataSet);
    }
    // The order by only works when the dataset contains list of objects.
    const items = orderBy.split(','), fields = [], directions = [];
    items.forEach(obj => {
        const item = obj.split(':');
        fields.push(innerItem ? innerItem + '.' + item[0] : item[0]);
        directions.push(item[1]);
    });
    return _.orderBy(dataSet, fields, directions);
};
/**
 * Returns an array of object, each object contain the DataSetItem whose key, value, label are extracted from object keys.
 */
export const transformDataWithKeys = (dataSet) => {
    const data = [];
    // if the dataset is instance of object (not an array) or the first item in the dataset array is an object,
    // then we extract the keys from the object and prepare the dataset items.
    if (_.isObject(dataSet[0]) || (_.isObject(dataSet) && !(dataSet instanceof Array))) {
        // getting keys of the object
        const objectKeys = Object.keys(dataSet[0] || dataSet);
        _.forEach(objectKeys, (objKey, index) => {
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
export const extractDataAsArray = data => {
    if (_.isUndefined(data) || _.isNull(data) || _.trim(data) === '') {
        return [];
    }
    if (_.isString(data)) {
        data = _.split(data, ',').map(str => str.trim());
    }
    if (!_.isArray(data)) {
        data = [data];
    }
    return data;
};
// This function return always an object containing dataset details.
export const convertDataToObject = dataResult => {
    if (_.isString(dataResult)) {
        dataResult = _.split(dataResult, ',').map(str => str.trim());
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
export const transformData = (context, dataSet, myDataField, displayOptions, startIndex) => {
    const data = [];
    if (!dataSet) {
        return;
    }
    dataSet = convertDataToObject(dataSet);
    // startIndex is the index of the next new item.
    if (_.isUndefined(startIndex)) {
        startIndex = 1;
    }
    if (_.isString(dataSet)) {
        dataSet = dataSet.split(',').map(str => str.trim());
        dataSet.forEach((option, index) => {
            data.push({ key: option, value: option, label: (isDefined(option) && option !== null) ? option.toString() : '', index: startIndex + index });
        });
    }
    else if (_.isArray(dataSet) && !_.isObject(dataSet[0])) { // array of primitive values only
        dataSet.forEach((option, index) => {
            data.push({ key: option, value: option, label: (isDefined(option) && option !== null) ? option.toString() : '', index: startIndex + index });
        });
    }
    else if (!(dataSet instanceof Array) && _.isObject(dataSet)) {
        const i = 0;
        _.forEach(dataSet, (value, key) => {
            data.push({ key: _.trim(key), value: key, label: (isDefined(value) && value !== null) ? value.toString() : '', index: startIndex, dataObject: dataSet });
        });
    }
    else {
        if (!myDataField) { // consider the datafield as 'ALLFIELDS' when datafield is not given.
            myDataField = ALLFIELDS;
        }
        dataSet.forEach((option, index) => {
            const key = myDataField === ALLFIELDS ? startIndex + index : getObjValueByKey(option, myDataField);
            // Omit all the items whose datafield (key) is null or undefined.
            if (!_.isUndefined(key) && !_.isNull(key)) {
                const label = getEvaluatedData(option, {
                    field: displayOptions.displayField,
                    expression: displayOptions.displayExpr,
                    bindExpression: displayOptions.bindDisplayExpr
                }, context);
                const dataSetItem = {
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
export const getUniqObjsByDataField = (data, dataField, displayField, allowEmptyFields) => {
    let uniqData;
    const isAllFields = dataField === ALLFIELDS;
    uniqData = isAllFields ? _.uniqWith(data, _.isEqual) : _.uniqBy(data, 'key');
    if (!displayField || allowEmptyFields) {
        return uniqData;
    }
    // return objects having non empty datafield and display field values.
    return _.filter(uniqData, (obj) => {
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
export const setItemByCompare = (datasetItems, compareWithDataObj, compareByField) => {
    // compare the fields based on fields given to compareby property.
    _.forEach(datasetItems, opt => {
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
const getSortedGroupedData = (groupedLiData, groupBy, orderby) => {
    const _groupedData = [];
    _.forEach(_.keys(groupedLiData), (groupkey, index) => {
        const liData = getOrderedDataset(groupedLiData[groupkey], orderby, 'dataObject');
        _groupedData.push({
            key: groupkey,
            data: _.sortBy(liData, data => {
                data._groupIndex = index + 1;
                return _.get(data, groupBy) || _.get(data.dataObject, groupBy);
            })
        });
    });
    return _groupedData;
};
const ɵ0 = getSortedGroupedData;
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
export const groupData = (compRef, data, groupby, match, orderby, dateformat, datePipe, innerItem, AppDefaults) => {
    let groupedLiData = {};
    if (_.includes(groupby, '(')) {
        const groupDataByUserDefinedFn = $parseEvent(groupby);
        groupedLiData = _.groupBy(data, val => {
            return groupDataByUserDefinedFn(compRef.viewParent, { 'row': val.dataObject || val });
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
const getGroupedData = (fieldDefs, groupby, match, orderby, dateFormat, datePipe, innerItem, AppDefaults) => {
    // For day, set the relevant moment calendar options
    if (match === TIME_ROLLUP_OPTIONS.DAY) {
        momentLocale._calendar = momentCalendarDayOptions;
    }
    // handling case-in-sensitive scenario
    // ordering the data based on groupby field. If there is innerItem then apply orderby using the innerItem's containing the groupby field.
    fieldDefs = _.orderBy(fieldDefs, fieldDef => {
        const groupKey = _.get(innerItem ? fieldDef[innerItem] : fieldDef, groupby);
        if (groupKey) {
            return _.toLower(groupKey);
        }
    });
    // extract the grouped data based on the field obtained from 'groupDataByField'.
    const groupedLiData = _.groupBy(fieldDefs, groupDataByField.bind(undefined, groupby, match, innerItem, dateFormat, datePipe, AppDefaults));
    momentLocale._calendar = momentCalendarOptions; // Reset to default moment calendar options
    return groupedLiData;
};
const ɵ1 = getGroupedData;
// Format the date with given date format
export const filterDate = (value, format, defaultFormat, datePipe) => {
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
const getTimeRolledUpString = (concatStr, rollUp, dateformat, datePipe, AppDefaults) => {
    let groupByKey, strMoment = moment(concatStr), dateFormat = dateformat;
    const currMoment = moment(), getSameElseFormat = function () {
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
const ɵ2 = getTimeRolledUpString;
// groups the fields based on the groupby value.
const groupDataByField = (groupby, match, innerItem, dateFormat, datePipe, AppDefaults, liData) => {
    // get the groupby field value from the liData or innerItem in the liData.
    let concatStr = _.get(innerItem ? liData[innerItem] : liData, groupby);
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
const ɵ3 = groupDataByField;
/**
 * This method toggles all the list items inside the each list group.
 * @param el, component reference on which groupby is applied.
 */
export const toggleAllHeaders = (el) => {
    const groups = $(el.nativeElement).find('.item-group');
    groups.find('.group-list-item').toggle();
    // toggle the collapse icon on list header.
    const groupIcons = groups.find('li.list-group-header .app-icon');
    if (groupIcons) {
        _.forEach(groupIcons, (icon) => {
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
export const handleHeaderClick = ($event) => {
    const selectedGroup = $($event.target).closest('.item-group'), selectedAppIcon = selectedGroup.find('li.list-group-header .app-icon');
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
export const configureDnD = ($el, options, startCb, updateCb) => {
    const sortOptions = Object.assign({
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
export class DataSetItem {
}
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS11dGlscy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsidXRpbHMvZm9ybS11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFeEcsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFcEUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUt6QyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDekMsTUFBTSxxQkFBcUIsR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RFLE1BQU0sd0JBQXdCLEdBQUcsWUFBWSxDQUFDLFlBQVksSUFBSTtJQUN0RCxPQUFPLEVBQUUsYUFBYTtJQUN0QixRQUFRLEVBQUUsYUFBYTtJQUN2QixPQUFPLEVBQUUsWUFBWTtJQUNyQixRQUFRLEVBQUUsTUFBTTtJQUNoQixPQUFPLEVBQUUsU0FBUztJQUNsQixRQUFRLEVBQUUsR0FBRztDQUNoQixDQUFDO0FBQ04sTUFBTSxnQkFBZ0IsR0FBRztJQUNqQixRQUFRLEVBQUUsVUFBVTtJQUNwQixJQUFJLEVBQUUsTUFBTTtJQUNaLE1BQU0sRUFBRSxRQUFRO0NBQ25CLENBQUM7QUFDTixNQUFNLG1CQUFtQixHQUFHO0lBQ3BCLElBQUksRUFBRSxNQUFNO0lBQ1osR0FBRyxFQUFFLEtBQUs7SUFDVixJQUFJLEVBQUUsTUFBTTtJQUNaLEtBQUssRUFBRSxPQUFPO0lBQ2QsSUFBSSxFQUFFLE1BQU07Q0FDZixDQUFDO0FBQ04sTUFBTSxlQUFlLEdBQUc7SUFDaEIsR0FBRyxFQUFFLFlBQVk7SUFDakIsSUFBSSxFQUFFLG1CQUFtQjtJQUN6QixLQUFLLEVB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O1NBQU07UUFDSCxlQUFlLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQzVFO0lBRUQsYUFBYSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3BELENBQUMsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNILE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxDQUFDLEdBQVEsRUFBRSxPQUFlLEVBQUUsT0FBaUIsRUFBRSxRQUFrQixFQUFFLEVBQUU7SUFDN0YsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM5QixXQUFXLEVBQUUsR0FBRztRQUNoQixLQUFLLEVBQUUsR0FBRztRQUNWLE9BQU8sRUFBRSxHQUFHO1FBQ1osTUFBTSxFQUFFLE9BQU87UUFDZixNQUFNLEVBQUUsSUFBSTtRQUNaLFNBQVMsRUFBRSxTQUFTO1FBQ3BCLEtBQUssRUFBRSxPQUFPO1FBQ2QsTUFBTSxFQUFFLFFBQVE7S0FDbkIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVaLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDOUIsQ0FBQyxDQUFDO0FBV0Y7Ozs7Ozs7R0FPRztBQUNILE1BQU0sT0FBTyxXQUFXO0NBUXZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgJHBhcnNlRXZlbnQsIGdldENsb25lZE9iamVjdCwgZ2V0Rm9ybWF0dGVkRGF0ZSwgaXNEZWZpbmVkLCBpc0VxdWFsV2l0aEZpZWxkcyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgZ2V0RXZhbHVhdGVkRGF0YSwgZ2V0T2JqVmFsdWVCeUtleSB9IGZyb20gJy4vd2lkZ2V0LXV0aWxzJztcblxuaW1wb3J0IHsgQUxMRklFTERTIH0gZnJvbSAnLi9kYXRhLXV0aWxzJztcbmltcG9ydCB7IFRvRGF0ZVBpcGUgfSBmcm9tICcuLi9waXBlcy9jdXN0b20tcGlwZXMnO1xuXG5kZWNsYXJlIGNvbnN0IF8sICQsIG1vbWVudDtcblxuY29uc3QgbW9tZW50TG9jYWxlID0gbW9tZW50LmxvY2FsZURhdGEoKTtcbmNvbnN0IG1vbWVudENhbGVuZGFyT3B0aW9ucyA9IGdldENsb25lZE9iamVjdChtb21lbnRMb2NhbGUuX2NhbGVuZGFyKTtcbmNvbnN0IG1vbWVudENhbGVuZGFyRGF5T3B0aW9ucyA9IG1vbWVudExvY2FsZS5fY2FsZW5kYXJEYXkgfHwge1xuICAgICAgICBsYXN0RGF5OiAnW1llc3RlcmRheV0nLFxuICAgICAgICBsYXN0V2VlazogJ1tMYXN0XSBkZGRkJyxcbiAgICAgICAgbmV4dERheTogJ1tUb21vcnJvd10nLFxuICAgICAgICBuZXh0V2VlazogJ2RkZGQnLFxuICAgICAgICBzYW1lRGF5OiAnW1RvZGF5XScsXG4gICAgICAgIHNhbWVFbHNlOiAnTCdcbiAgICB9O1xuY29uc3QgR1JPVVBfQllfT1BUSU9OUyA9IHtcbiAgICAgICAgQUxQSEFCRVQ6ICdhbHBoYWJldCcsXG4gICAgICAgIFdPUkQ6ICd3b3JkJyxcbiAgICAgICAgT1RIRVJTOiAnT3RoZXJzJ1xuICAgIH07XG5jb25zdCBUSU1FX1JPTExVUF9PUFRJT05TID0ge1xuICAgICAgICBIT1VSOiAnaG91cicsXG4gICAgICAgIERBWTogJ2RheScsXG4gICAgICAgIFdFRUs6ICd3ZWVrJyxcbiAgICAgICAgTU9OVEg6ICdtb250aCcsXG4gICAgICAgIFlFQVI6ICd5ZWFyJ1xuICAgIH07XG5jb25zdCBST0xMVVBfUEFUVEVSTlMgPSB7XG4gICAgICAgIERBWTogJ3l5eXktTU0tZGQnLFxuICAgICAgICBXRUVLOiAndyBcXCdXZWVrXFwnLCAgeXl5eScsXG4gICAgICAgIE1PTlRIOiAnTU1NLCB5eXl5JyxcbiAgICAgICAgWUVBUjogJ1lZWVknLFxuICAgICAgICBIT1VSOiAnaGg6bW0gYSdcbiAgICB9O1xuXG4vKipcbiAqIGZ1bmN0aW9uIHRvIGdldCB0aGUgb3JkZXJlZCBkYXRhc2V0IGJhc2VkIG9uIHRoZSBnaXZlbiBvcmRlcmJ5XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRPcmRlcmVkRGF0YXNldCA9IChkYXRhU2V0OiBhbnksIG9yZGVyQnk6IHN0cmluZywgaW5uZXJJdGVtPykgPT4ge1xuICAgIGlmICghb3JkZXJCeSkge1xuICAgICAgICByZXR1cm4gXy5jbG9uZURlZXAoZGF0YVNldCk7XG4gICAgfVxuXG4gICAgLy8gVGhlIG9yZGVyIGJ5IG9ubHkgd29ya3Mgd2hlbiB0aGUgZGF0YXNldCBjb250YWlucyBsaXN0IG9mIG9iamVjdHMuXG4gICAgY29uc3QgaXRlbXMgPSBvcmRlckJ5LnNwbGl0KCcsJyksXG4gICAgICAgIGZpZWxkcyA9IFtdLFxuICAgICAgICBkaXJlY3Rpb25zID0gW107XG4gICAgaXRlbXMuZm9yRWFjaChvYmogPT4ge1xuICAgICAgICBjb25zdCBpdGVtID0gb2JqLnNwbGl0KCc6Jyk7XG4gICAgICAgIGZpZWxkcy5wdXNoKGlubmVySXRlbSA/IGlubmVySXRlbSArICcuJyArIGl0ZW1bMF0gOiBpdGVtWzBdKTtcbiAgICAgICAgZGlyZWN0aW9ucy5wdXNoKGl0ZW1bMV0pO1xuICAgIH0pO1xuICAgIHJldHVybiBfLm9yZGVyQnkoZGF0YVNldCwgZmllbGRzLCBkaXJlY3Rpb25zKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBvYmplY3QsIGVhY2ggb2JqZWN0IGNvbnRhaW4gdGhlIERhdGFTZXRJdGVtIHdob3NlIGtleSwgdmFsdWUsIGxhYmVsIGFyZSBleHRyYWN0ZWQgZnJvbSBvYmplY3Qga2V5cy5cbiAqL1xuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybURhdGFXaXRoS2V5cyA9IChkYXRhU2V0OiBhbnkpID0+IHtcbiAgICBjb25zdCBkYXRhOiBEYXRhU2V0SXRlbVtdID0gW107XG4gICAgLy8gaWYgdGhlIGRhdGFzZXQgaXMgaW5zdGFuY2Ugb2Ygb2JqZWN0IChub3QgYW4gYXJyYXkpIG9yIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBkYXRhc2V0IGFycmF5IGlzIGFuIG9iamVjdCxcbiAgICAvLyB0aGVuIHdlIGV4dHJhY3QgdGhlIGtleXMgZnJvbSB0aGUgb2JqZWN0IGFuZCBwcmVwYXJlIHRoZSBkYXRhc2V0IGl0ZW1zLlxuICAgIGlmIChfLmlzT2JqZWN0KGRhdGFTZXRbMF0pIHx8IChfLmlzT2JqZWN0KGRhdGFTZXQpICYmICEoZGF0YVNldCBpbnN0YW5jZW9mIEFycmF5KSkpIHtcbiAgICAgICAgLy8gZ2V0dGluZyBrZXlzIG9mIHRoZSBvYmplY3RcbiAgICAgICAgY29uc3Qgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzKGRhdGFTZXRbMF0gfHwgZGF0YVNldCk7XG4gICAgICAgIF8uZm9yRWFjaChvYmplY3RLZXlzLCAob2JqS2V5LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgICAgICAgICBrZXk6IG9iaktleSxcbiAgICAgICAgICAgICAgICBsYWJlbDogb2JqS2V5LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBvYmpLZXksXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4ICsgMVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xufTtcblxuLy8gQ29udmVydHMgYW55IHR5cGUgb2YgZGF0YSB0byBhcnJheS5cbmV4cG9ydCBjb25zdCBleHRyYWN0RGF0YUFzQXJyYXkgPSBkYXRhID0+IHtcblxuICAgIGlmIChfLmlzVW5kZWZpbmVkKGRhdGEpIHx8IF8uaXNOdWxsKGRhdGEpIHx8IF8udHJpbShkYXRhKSA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGlmIChfLmlzU3RyaW5nKGRhdGEpKSB7XG4gICAgICAgIGRhdGEgPSBfLnNwbGl0KGRhdGEsICcsJykubWFwKHN0ciA9PiBzdHIudHJpbSgpKTtcbiAgICB9XG5cbiAgICBpZiAoIV8uaXNBcnJheShkYXRhKSkge1xuICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xufTtcblxuLy8gVGhpcyBmdW5jdGlvbiByZXR1cm4gYWx3YXlzIGFuIG9iamVjdCBjb250YWluaW5nIGRhdGFzZXQgZGV0YWlscy5cbmV4cG9ydCBjb25zdCBjb252ZXJ0RGF0YVRvT2JqZWN0ID0gZGF0YVJlc3VsdCA9PiB7XG4gICAgaWYgKF8uaXNTdHJpbmcoZGF0YVJlc3VsdCkpIHtcbiAgICAgICAgZGF0YVJlc3VsdCA9IF8uc3BsaXQoZGF0YVJlc3VsdCwgJywnKS5tYXAoc3RyID0+IHN0ci50cmltKCkpO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhUmVzdWx0O1xufTtcblxuLyoqXG4gKiBUaGUgZmlyc3Qgc3RlcCBpbiBkYXRhc2V0SXRlbXMgY3JlYXRpb24gaXMgZGF0YSB0cmFuc2Zvcm1hdGlvbjpcbiAqXG4gKiBUaGUgZGF0YXNldCBjYW4gY29udGFpbiBvbmUgb2YgdGhlIGZvbGxvd2luZyBmb3JtYXRzIGFuZCBlYWNoIG9mIHRoZW0gdG8gYmUgY29udmVydGVkIHRvIHRoZSBnaXZlbiBmb3JtYXQ7XG4gKlxuICogMSkgVGhlIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcuLmVnOiBBLEIsQyA9PiBbeyBrZXk6ICdBJywgdmFsdWU6ICdBJ30sIHsga2V5OiAnQicsIHZhbHVlOiAnQid9LCB7IGtleTogJ0MnLCB2YWx1ZTogJ0MnfV1cbiAqIDIpIFRoZSBhcnJheSBvZiB2YWx1ZXMgZWc6IFsxLDIsM10gPT4gW3sga2V5OiAxLCB2YWx1ZTogMX0sIHsga2V5OiAyLCB2YWx1ZTogMn0sIHsga2V5OiAzLCB2YWx1ZTogM31dXG4gKiAzKSBhbiBvYmplY3QgZWc6IHtuYW1lOiAnQScsIGFnZTogMjB9ID0+IFsge2tleTogJ25hbWUnLCB2YWx1ZTogJ0EnfSwge2tleTogJ2FnZScsIHZhbHVlOiAyMH1dXG4gKiA0KSBhbiBhcnJheSBvZiBvYmplY3RzLi4uZWc6IFsge25hbWU6ICdBJywgYWdlOiAyMH0sIHtuYW1lOiAnQicsIGFnZTogMjB9XSA9PT4gcmV0dXJucyBbe2tleTogX0RBVEFGSUVMRF8sIHZhbHVlOiBfRElTUExBWUZJRUxELCBsYWJlbDogX0RJU1BMQVlWQUxVRX1dXG4gKi9cbmV4cG9ydCBjb25zdCB0cmFuc2Zvcm1EYXRhID0gKGNvbnRleHQ6IGFueSwgZGF0YVNldDogYW55LCBteURhdGFGaWVsZD86IHN0cmluZywgZGlzcGxheU9wdGlvbnM/LCBzdGFydEluZGV4PzogbnVtYmVyKTogQXJyYXk8RGF0YVNldEl0ZW0+ID0+IHtcbiAgICBjb25zdCBkYXRhID0gW107XG4gICAgaWYgKCFkYXRhU2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZGF0YVNldCA9IGNvbnZlcnREYXRhVG9PYmplY3QoZGF0YVNldCk7XG5cbiAgICAvLyBzdGFydEluZGV4IGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBuZXcgaXRlbS5cbiAgICBpZiAoXy5pc1VuZGVmaW5lZChzdGFydEluZGV4KSkge1xuICAgICAgICBzdGFydEluZGV4ID0gMTtcbiAgICB9XG5cbiAgICBpZiAoXy5pc1N0cmluZyhkYXRhU2V0KSkge1xuICAgICAgICBkYXRhU2V0ID0gZGF0YVNldC5zcGxpdCgnLCcpLm1hcChzdHIgPT4gc3RyLnRyaW0oKSk7XG4gICAgICAgIGRhdGFTZXQuZm9yRWFjaCgob3B0aW9uLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgZGF0YS5wdXNoKHtrZXk6IG9wdGlvbiwgdmFsdWU6IG9wdGlvbiwgbGFiZWw6IChpc0RlZmluZWQob3B0aW9uKSAmJiBvcHRpb24gIT09IG51bGwpID8gb3B0aW9uLnRvU3RyaW5nKCkgOiAnJywgaW5kZXg6IHN0YXJ0SW5kZXggKyBpbmRleH0pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKF8uaXNBcnJheShkYXRhU2V0KSAmJiAhXy5pc09iamVjdChkYXRhU2V0WzBdKSkgeyAvLyBhcnJheSBvZiBwcmltaXRpdmUgdmFsdWVzIG9ubHlcbiAgICAgICAgZGF0YVNldC5mb3JFYWNoKChvcHRpb24sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBkYXRhLnB1c2goe2tleTogb3B0aW9uLCB2YWx1ZTogb3B0aW9uLCBsYWJlbDogKGlzRGVmaW5lZChvcHRpb24pICYmIG9wdGlvbiAhPT0gbnVsbCkgPyBvcHRpb24udG9TdHJpbmcoKSA6ICcnLCBpbmRleDogc3RhcnRJbmRleCArIGluZGV4fSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoIShkYXRhU2V0IGluc3RhbmNlb2YgQXJyYXkpICYmIF8uaXNPYmplY3QoZGF0YVNldCkpIHtcbiAgICAgICAgY29uc3QgaSA9IDA7XG4gICAgICAgIF8uZm9yRWFjaChkYXRhU2V0LCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgZGF0YS5wdXNoKHtrZXk6IF8udHJpbShrZXkpLCB2YWx1ZToga2V5LCBsYWJlbDogKGlzRGVmaW5lZCh2YWx1ZSkgJiYgdmFsdWUgIT09IG51bGwpID8gdmFsdWUudG9TdHJpbmcoKSA6ICcnLCBpbmRleDogc3RhcnRJbmRleCwgZGF0YU9iamVjdDogZGF0YVNldH0pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIW15RGF0YUZpZWxkKSB7IC8vIGNvbnNpZGVyIHRoZSBkYXRhZmllbGQgYXMgJ0FMTEZJRUxEUycgd2hlbiBkYXRhZmllbGQgaXMgbm90IGdpdmVuLlxuICAgICAgICAgICAgbXlEYXRhRmllbGQgPSBBTExGSUVMRFM7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhU2V0LmZvckVhY2goKG9wdGlvbiwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IG15RGF0YUZpZWxkID09PSBBTExGSUVMRFMgPyBzdGFydEluZGV4ICsgaW5kZXggOiBnZXRPYmpWYWx1ZUJ5S2V5KG9wdGlvbiwgbXlEYXRhRmllbGQpO1xuXG4gICAgICAgICAgICAvLyBPbWl0IGFsbCB0aGUgaXRlbXMgd2hvc2UgZGF0YWZpZWxkIChrZXkpIGlzIG51bGwgb3IgdW5kZWZpbmVkLlxuICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGtleSkgJiYgIV8uaXNOdWxsKGtleSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYWJlbCA9IGdldEV2YWx1YXRlZERhdGEob3B0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkOiBkaXNwbGF5T3B0aW9ucy5kaXNwbGF5RmllbGQsXG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IGRpc3BsYXlPcHRpb25zLmRpc3BsYXlFeHByLFxuICAgICAgICAgICAgICAgICAgICBiaW5kRXhwcmVzc2lvbjogZGlzcGxheU9wdGlvbnMuYmluZERpc3BsYXlFeHByXG4gICAgICAgICAgICAgICAgfSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YVNldEl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogKGlzRGVmaW5lZChsYWJlbCkgJiYgbGFiZWwgIT09IG51bGwpID8gbGFiZWwudG9TdHJpbmcoKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbXlEYXRhRmllbGQgPT09IEFMTEZJRUxEUyA/IG9wdGlvbiA6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YU9iamVjdDogb3B0aW9uLCAvLyByZXByZXNlbnRzIHRoZSBvYmplY3Qgd2hlbiBkYXRhZmllbGQgaXMgQUxMRklFTERTLiBUaGlzIGlzIHVzZWQgYXMgaW5uZXJJdGVtIHdoaWxlIGdyb3VwaW5nIHRoZSBkYXRhc2V0SXRlbXMuXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBzdGFydEluZGV4ICsgaW5kZXhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5T3B0aW9ucy5kaXNwbGF5SW1nU3JjIHx8IGRpc3BsYXlPcHRpb25zLmJpbmREaXNwbGF5SW1nU3JjKSB7XG4gICAgICAgICAgICAgICAgICAgIChkYXRhU2V0SXRlbSBhcyBhbnkpLmltZ1NyYyA9IGdldEV2YWx1YXRlZERhdGEob3B0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uOiBkaXNwbGF5T3B0aW9ucy5kaXNwbGF5SW1nU3JjLFxuICAgICAgICAgICAgICAgICAgICAgICAgYmluZEV4cHJlc3Npb246IGRpc3BsYXlPcHRpb25zLmJpbmREaXNwbGF5SW1nU3JjXG4gICAgICAgICAgICAgICAgICAgIH0sIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkYXRhLnB1c2goZGF0YVNldEl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG59O1xuXG4vKipcbiAqIFByaXZhdGUgbWV0aG9kIHRvIGdldCB0aGUgdW5pcXVlIG9iamVjdHMgYnkgdGhlIGRhdGEgZmllbGRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFVuaXFPYmpzQnlEYXRhRmllbGQgPSAoZGF0YTogQXJyYXk8RGF0YVNldEl0ZW0+LCBkYXRhRmllbGQ6IHN0cmluZywgZGlzcGxheUZpZWxkOiBzdHJpbmcsIGFsbG93RW1wdHlGaWVsZHM/OiBib29sZWFuKSA9PiB7XG4gICAgbGV0IHVuaXFEYXRhO1xuICAgIGNvbnN0IGlzQWxsRmllbGRzID0gZGF0YUZpZWxkID09PSBBTExGSUVMRFM7XG5cbiAgICB1bmlxRGF0YSA9IGlzQWxsRmllbGRzID8gXy51bmlxV2l0aChkYXRhLCBfLmlzRXF1YWwpIDogXy51bmlxQnkoZGF0YSwgJ2tleScpO1xuXG4gICAgaWYgKCFkaXNwbGF5RmllbGQgfHwgYWxsb3dFbXB0eUZpZWxkcykge1xuICAgICAgICByZXR1cm4gdW5pcURhdGE7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIG9iamVjdHMgaGF2aW5nIG5vbiBlbXB0eSBkYXRhZmllbGQgYW5kIGRpc3BsYXkgZmllbGQgdmFsdWVzLlxuICAgIHJldHVybiBfLmZpbHRlcih1bmlxRGF0YSwgKG9iaikgPT4ge1xuICAgICAgICBpZiAoaXNBbGxGaWVsZHMpIHtcbiAgICAgICAgICAgIHJldHVybiBfLnRyaW0ob2JqLmxhYmVsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXy50cmltKG9iai5rZXkpICYmIF8udHJpbShvYmoubGFiZWwpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHNldHMgdGhlIHNlbGVjdGVkSXRlbSBieSBjb21wYXJpbmcgdGhlIGZpZWxkIHZhbHVlcywgd2hlcmUgZmllbGRzIGFyZSBwYXNzZWQgYnkgXCJjb21wYXJlYnlcIiBwcm9wZXJ0eS5cbiAqIHdvcmtzIG9ubHkgZm9yIGRhdGFmaWVsZCB3aXRoIEFMTF9GSUVMRFNcbiAqIEBwYXJhbSBkYXRhc2V0SXRlbXMgbGlzdCBvZiBkYXRhc2V0IGl0ZW1zLlxuICogQHBhcmFtIGNvbXBhcmVXaXRoRGF0YU9iaiByZXByZXNlbnRzIHRoZSBkYXRhdmFsdWUgKG9iamVjdCkgd2hvc2UgcHJvcGVydGllcyBhcmUgdG8gYmUgY2hlY2tlZCBhZ2FpbnN0IGVhY2ggcHJvcGVydHkgb2YgZGF0YXNldEl0ZW0uXG4gKiBAcGFyYW0gY29tcGFyZUJ5RmllbGQgc3BlY2lmaWVzIHRoZSBwcm9wZXJ0eSBuYW1lcyBvbiB3aGljaCBkYXRhc2V0SXRlbSBoYXMgdG8gYmUgY29tcGFyZWQgYWdhaW5zdCBkYXRhdmFsdWUgb2JqZWN0LlxuICovXG5leHBvcnQgY29uc3Qgc2V0SXRlbUJ5Q29tcGFyZSA9IChkYXRhc2V0SXRlbXM6IEFycmF5PERhdGFTZXRJdGVtPiwgY29tcGFyZVdpdGhEYXRhT2JqOiBPYmplY3QsIGNvbXBhcmVCeUZpZWxkOiBzdHJpbmcpID0+IHtcbiAgICAvLyBjb21wYXJlIHRoZSBmaWVsZHMgYmFzZWQgb24gZmllbGRzIGdpdmVuIHRvIGNvbXBhcmVieSBwcm9wZXJ0eS5cbiAgICBfLmZvckVhY2goZGF0YXNldEl0ZW1zLCBvcHQgPT4ge1xuICAgICAgICBpZiAoaXNFcXVhbFdpdGhGaWVsZHMob3B0LnZhbHVlLCBjb21wYXJlV2l0aERhdGFPYmosIGNvbXBhcmVCeUZpZWxkKSkge1xuICAgICAgICAgICAgb3B0LnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHNvcnRlZCBkYXRhIGJhc2VkIHRvIGdyb3Vwa2V5LlxuICogUmV0dXJucyBhIGFycmF5IG9mIG9iamVjdHMsIGVhY2ggb2JqZWN0IGNvbnRhaW5pbmcga2V5IHdoaWNoIGlzIGdyb3VwS2V5IGFuZCBkYXRhIGlzIHRoZSBzb3J0ZWQgZGF0YSB3aGljaCBpcyBzb3J0ZWQgYnkgZ3JvdXBieSBmaWVsZCBpbiB0aGUgZGF0YS5cbiAqXG4gKiBAcGFyYW0gZ3JvdXBlZExpRGF0YSwgZ3JvdXBlZCBkYXRhIG9iamVjdCB3aXRoIGtleSBhcyB0aGUgZ3JvdXBLZXkgYW5kIGl0cyB2YWx1ZSBhcyB0aGUgYXJyYXkgb2Ygb2JqZWN0cyBncm91cGVkIHVuZGVyIHRoZSBncm91cEtleS5cbiAqIEBwYXJhbSBncm91cEJ5LCBzdHJpbmcgZ3JvdXBieSBwcm9wZXJ0eVxuICogQHJldHVybnMge2FueVtdfVxuICovXG5jb25zdCBnZXRTb3J0ZWRHcm91cGVkRGF0YSA9IChncm91cGVkTGlEYXRhOiBPYmplY3QsIGdyb3VwQnk6IHN0cmluZywgb3JkZXJieTogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgX2dyb3VwZWREYXRhID0gW107XG4gICAgXy5mb3JFYWNoKF8ua2V5cyhncm91cGVkTGlEYXRhKSwgKGdyb3Vwa2V5LCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCBsaURhdGEgPSBnZXRPcmRlcmVkRGF0YXNldChncm91cGVkTGlEYXRhW2dyb3Vwa2V5XSwgb3JkZXJieSwgJ2RhdGFPYmplY3QnKTtcbiAgICAgICAgX2dyb3VwZWREYXRhLnB1c2goe1xuICAgICAgICAgICAga2V5OiBncm91cGtleSxcbiAgICAgICAgICAgIGRhdGE6IF8uc29ydEJ5KGxpRGF0YSwgZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgZGF0YS5fZ3JvdXBJbmRleCA9IGluZGV4ICsgMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5nZXQoZGF0YSwgZ3JvdXBCeSkgfHwgXy5nZXQoZGF0YS5kYXRhT2JqZWN0LCBncm91cEJ5KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBfZ3JvdXBlZERhdGE7XG59O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGdldHMgdGhlIGdyb3VwZWREYXRhIHVzaW5nIGdyb3VwYnkgcHJvcGVydHkgYW5kIG1hdGNoIGFuZCByZXR1cm5zIHRoZSBzb3J0ZWQgYXJyYXkgb2Ygb2JqZWN0cy5cbiAqXG4gKiBAcGFyYW0gY29tcFJlZiByZXByZXNlbnRzIHRoZSBjb21wb25lbnQncyByZWZlcmVuY2UgaS5lLiBcInRoaXNcIiB2YWx1ZS5cbiAqIEBwYXJhbSBkYXRhIHJlcHJlc2VudHMgdGhlIGRhdGFzZXQgaS5lIGFycmF5IG9mIG9iamVjdHMuXG4gKiBAcGFyYW0gZ3JvdXBieSwgc3RyaW5nIGdyb3VwYnkgcHJvcGVydHlcbiAqIEBwYXJhbSBtYXRjaCwgc3RyaW5nIG1hdGNoIHByb3BlcnR5XG4gKiBAcGFyYW0gb3JkZXJieSwgc3RyaW5nIG9yZGVyYnkgcHJvcGVydHlcbiAqIEBwYXJhbSBkYXRlZm9ybWF0LCBzdHJpbmcgZGF0ZUZvcm1hdCBwcm9wZXJ0eVxuICogQHBhcmFtIGlubmVySXRlbSwgcmVwcmVzZW50cyB0aGUgaW5uZXJJdGVtIG9uIHdoaWNoIGdyb3VwYnkgaGFzIHRvIGJlIGFwcGxpZWQuIEluY2FzZSBvZiBkYXRhc2V0SXRlbXMsICdkYXRhT2JqZWN0JyBjb250YWlucyB0aGUgZnVsbCBvYmplY3QuIEhlcmUgaW5uZXJJdGVtIGlzIGRhdGFPYmplY3QuXG4gKiBAcmV0dXJucyB7YW55W119IGdyb3VwZWREYXRhLCBhcnJheSBvZiBvYmplY3RzLCBlYWNoIG9iamVjdCBoYXZpbmcga2V5IGFuZCBkYXRhLlxuICovXG5leHBvcnQgY29uc3QgZ3JvdXBEYXRhID0gKGNvbXBSZWY6IGFueSwgZGF0YTogQXJyYXk8T2JqZWN0IHwgRGF0YVNldEl0ZW0+LCBncm91cGJ5OiBzdHJpbmcsIG1hdGNoOiBzdHJpbmcsIG9yZGVyYnk6IHN0cmluZywgZGF0ZWZvcm1hdDogc3RyaW5nLCBkYXRlUGlwZTogVG9EYXRlUGlwZSwgaW5uZXJJdGVtPzogc3RyaW5nLCBBcHBEZWZhdWx0cz86IGFueSkgPT4ge1xuICAgIGxldCBncm91cGVkTGlEYXRhID0ge307XG4gICAgaWYgKF8uaW5jbHVkZXMoZ3JvdXBieSwgJygnKSkge1xuICAgICAgICBjb25zdCBncm91cERhdGFCeVVzZXJEZWZpbmVkRm4gPSAkcGFyc2VFdmVudChncm91cGJ5KTtcbiAgICAgICAgZ3JvdXBlZExpRGF0YSA9IF8uZ3JvdXBCeShkYXRhLCB2YWwgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGdyb3VwRGF0YUJ5VXNlckRlZmluZWRGbihjb21wUmVmLnZpZXdQYXJlbnQsIHsncm93JzogdmFsLmRhdGFPYmplY3QgfHwgdmFsfSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGdyb3VwZWRMaURhdGEgPSBnZXRHcm91cGVkRGF0YShkYXRhLCBncm91cGJ5LCBtYXRjaCwgb3JkZXJieSwgZGF0ZWZvcm1hdCwgZGF0ZVBpcGUsIGlubmVySXRlbSwgQXBwRGVmYXVsdHMpO1xuICAgIH1cblxuICAgIHJldHVybiBnZXRTb3J0ZWRHcm91cGVkRGF0YShncm91cGVkTGlEYXRhLCBncm91cGJ5LCBvcmRlcmJ5KTtcbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgcHJlcGFyZXMgdGhlIGdyb3VwZWQgZGF0YS5cbiAqXG4gKiBAcGFyYW0gZmllbGREZWZzIGFycmF5IG9mIG9iamVjdHMgaS5lLiBkYXRhc2V0XG4gKiBAcGFyYW0gZ3JvdXBieSBzdHJpbmcgZ3JvdXBieVxuICogQHBhcmFtIG1hdGNoIHN0cmluZyBtYXRjaFxuICogQHBhcmFtIG9yZGVyYnkgc3RyaW5nIG9yZGVyYnlcbiAqIEBwYXJhbSBkYXRlRm9ybWF0IHN0cmluZyBkYXRlIGZvcm1hdFxuICogQHBhcmFtIGlubmVySXRlbSwgaXRlbSB0byBsb29rIGZvciBpbiB0aGUgcGFzc2VkIGRhdGFcbiAqL1xuY29uc3QgZ2V0R3JvdXBlZERhdGEgPSAoZmllbGREZWZzOiBBcnJheTxPYmplY3QgfCBEYXRhU2V0SXRlbT4sIGdyb3VwYnk6IHN0cmluZywgbWF0Y2g6IHN0cmluZywgb3JkZXJieTogc3RyaW5nLCBkYXRlRm9ybWF0OiBzdHJpbmcsIGRhdGVQaXBlOiBUb0RhdGVQaXBlLCBpbm5lckl0ZW0/OiBzdHJpbmcsIEFwcERlZmF1bHRzPzogYW55KSA9PiB7XG4gICAgLy8gRm9yIGRheSwgc2V0IHRoZSByZWxldmFudCBtb21lbnQgY2FsZW5kYXIgb3B0aW9uc1xuICAgIGlmIChtYXRjaCA9PT0gVElNRV9ST0xMVVBfT1BUSU9OUy5EQVkpIHtcbiAgICAgICAgbW9tZW50TG9jYWxlLl9jYWxlbmRhciA9IG1vbWVudENhbGVuZGFyRGF5T3B0aW9ucztcbiAgICB9XG5cbiAgICAvLyBoYW5kbGluZyBjYXNlLWluLXNlbnNpdGl2ZSBzY2VuYXJpb1xuICAgIC8vIG9yZGVyaW5nIHRoZSBkYXRhIGJhc2VkIG9uIGdyb3VwYnkgZmllbGQuIElmIHRoZXJlIGlzIGlubmVySXRlbSB0aGVuIGFwcGx5IG9yZGVyYnkgdXNpbmcgdGhlIGlubmVySXRlbSdzIGNvbnRhaW5pbmcgdGhlIGdyb3VwYnkgZmllbGQuXG4gICAgZmllbGREZWZzID0gXy5vcmRlckJ5KGZpZWxkRGVmcywgZmllbGREZWYgPT4ge1xuICAgICAgICBjb25zdCBncm91cEtleSA9IF8uZ2V0KGlubmVySXRlbSA/IGZpZWxkRGVmW2lubmVySXRlbV0gOiBmaWVsZERlZiwgZ3JvdXBieSk7XG4gICAgICAgIGlmIChncm91cEtleSkge1xuICAgICAgICAgICAgcmV0dXJuIF8udG9Mb3dlcihncm91cEtleSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGV4dHJhY3QgdGhlIGdyb3VwZWQgZGF0YSBiYXNlZCBvbiB0aGUgZmllbGQgb2J0YWluZWQgZnJvbSAnZ3JvdXBEYXRhQnlGaWVsZCcuXG4gICAgY29uc3QgZ3JvdXBlZExpRGF0YSA9IF8uZ3JvdXBCeShmaWVsZERlZnMsIGdyb3VwRGF0YUJ5RmllbGQuYmluZCh1bmRlZmluZWQsIGdyb3VwYnksIG1hdGNoLCBpbm5lckl0ZW0sIGRhdGVGb3JtYXQsIGRhdGVQaXBlLCBBcHBEZWZhdWx0cykpO1xuXG4gICAgbW9tZW50TG9jYWxlLl9jYWxlbmRhciA9IG1vbWVudENhbGVuZGFyT3B0aW9uczsgLy8gUmVzZXQgdG8gZGVmYXVsdCBtb21lbnQgY2FsZW5kYXIgb3B0aW9uc1xuXG4gICAgcmV0dXJuIGdyb3VwZWRMaURhdGE7XG59O1xuXG4vLyBGb3JtYXQgdGhlIGRhdGUgd2l0aCBnaXZlbiBkYXRlIGZvcm1hdFxuZXhwb3J0IGNvbnN0IGZpbHRlckRhdGUgPSAodmFsdWU6IHN0cmluZyB8IG51bWJlciwgZm9ybWF0OiBzdHJpbmcsIGRlZmF1bHRGb3JtYXQ6IHN0cmluZywgZGF0ZVBpcGU6IFRvRGF0ZVBpcGUpID0+IHtcbiAgICBpZiAoZm9ybWF0ID09PSAndGltZXN0YW1wJykgeyAvLyBGb3IgdGltZXN0YW1wIGZvcm1hdCwgcmV0dXJuIHRoZSBlcG9jaCB2YWx1ZVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldEZvcm1hdHRlZERhdGUoZGF0ZVBpcGUsIHZhbHVlLCBmb3JtYXQgfHwgZGVmYXVsdEZvcm1hdCk7XG59O1xuXG5cbi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZ3JvdXBrZXkgYmFzZWQgb24gdGhlIHJvbGx1cCAobWF0Y2gpIHBhc3NlZFxuICpcbiAqIEBwYXJhbSBjb25jYXRTdHIsIHN0cmluZyBjb250YWluaW5nIGdyb3VwYnkgZmllbGQgdmFsdWVcbiAqIEBwYXJhbSByb2xsVXAgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIG1hdGNoIHByb3BlcnR5LlxuICogQHBhcmFtIGRhdGVmb3JtYXQgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGRhdGUgZm9ybWF0IHRvIGRpc3BsYXkgdGhlIGRhdGUuXG4gKi9cbmNvbnN0IGdldFRpbWVSb2xsZWRVcFN0cmluZyA9IChjb25jYXRTdHI6IHN0cmluZywgcm9sbFVwOiBzdHJpbmcsIGRhdGVmb3JtYXQ6IHN0cmluZywgZGF0ZVBpcGU/OiBUb0RhdGVQaXBlLCBBcHBEZWZhdWx0cz86IGFueSkgPT4ge1xuICAgIGxldCBncm91cEJ5S2V5LFxuICAgICAgICBzdHJNb21lbnQgID0gbW9tZW50KGNvbmNhdFN0ciksXG4gICAgICAgIGRhdGVGb3JtYXQgPSBkYXRlZm9ybWF0O1xuXG4gICAgY29uc3QgY3Vyck1vbWVudCA9IG1vbWVudCgpLFxuICAgICAgICBnZXRTYW1lRWxzZUZvcm1hdCA9IGZ1bmN0aW9uICgpIHsgLy8gU2V0IHRoZSBzYW1lRWxzZSBvcHRpb24gb2YgbW9tZW50IGNhbGVuZGFyIHRvIHVzZXIgZGVmaW5lZCBwYXR0ZXJuXG4gICAgICAgICAgICByZXR1cm4gJ1snICsgZmlsdGVyRGF0ZSh0aGlzLnZhbHVlT2YoKSwgZGF0ZUZvcm1hdCwgUk9MTFVQX1BBVFRFUk5TLkRBWSwgZGF0ZVBpcGUpICsgJ10nO1xuICAgICAgICB9O1xuXG4gICAgc3dpdGNoIChyb2xsVXApIHtcbiAgICAgICAgY2FzZSBUSU1FX1JPTExVUF9PUFRJT05TLkhPVVI6XG4gICAgICAgICAgICBkYXRlRm9ybWF0ID0gZGF0ZUZvcm1hdCB8fCBBcHBEZWZhdWx0cy50aW1lRm9ybWF0O1xuXG4gICAgICAgICAgICAvLyBJZiBkYXRlIGlzIGludmFsaWQsIGNoZWNrIGlmIGRhdGEgaXMgaW4gZm9ybSBvZiBoaDptbSBhXG4gICAgICAgICAgICBpZiAoIXN0ck1vbWVudC5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgICAgICBzdHJNb21lbnQgPSBtb21lbnQobmV3IERhdGUoKS50b0RhdGVTdHJpbmcoKSArICcgJyArIGNvbmNhdFN0cik7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3RyTW9tZW50LmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBcyBvbmx5IHRpbWUgaXMgcHJlc2VudCwgcm9sbCB1cCBhdCB0aGUgaG91ciBsZXZlbCB3aXRoIGdpdmVuIHRpbWUgZm9ybWF0XG4gICAgICAgICAgICAgICAgICAgIG1vbWVudExvY2FsZS5fY2FsZW5kYXIuc2FtZURheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnWycgKyBmaWx0ZXJEYXRlKHRoaXMudmFsdWVPZigpLCBkYXRlRm9ybWF0LCBST0xMVVBfUEFUVEVSTlMuSE9VUiwgZGF0ZVBpcGUpICsgJ10nO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHJvdW5kIG9mZiB0byBuZWFyZXN0IGxhc3QgaG91clxuICAgICAgICAgICAgc3RyTW9tZW50ID0gc3RyTW9tZW50LnN0YXJ0T2YoJ2hvdXInKTtcbiAgICAgICAgICAgIG1vbWVudExvY2FsZS5fY2FsZW5kYXIuc2FtZUVsc2UgPSBnZXRTYW1lRWxzZUZvcm1hdDtcbiAgICAgICAgICAgIGdyb3VwQnlLZXkgPSBzdHJNb21lbnQuY2FsZW5kYXIoY3Vyck1vbWVudCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBUSU1FX1JPTExVUF9PUFRJT05TLldFRUs6XG4gICAgICAgICAgICBncm91cEJ5S2V5ID0gZmlsdGVyRGF0ZShzdHJNb21lbnQudmFsdWVPZigpLCBkYXRlRm9ybWF0LCBST0xMVVBfUEFUVEVSTlMuV0VFSywgZGF0ZVBpcGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgVElNRV9ST0xMVVBfT1BUSU9OUy5NT05USDpcbiAgICAgICAgICAgIGdyb3VwQnlLZXkgPSBmaWx0ZXJEYXRlKHN0ck1vbWVudC52YWx1ZU9mKCksIGRhdGVGb3JtYXQsIFJPTExVUF9QQVRURVJOUy5NT05USCwgZGF0ZVBpcGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgVElNRV9ST0xMVVBfT1BUSU9OUy5ZRUFSOlxuICAgICAgICAgICAgZ3JvdXBCeUtleSA9IHN0ck1vbWVudC5mb3JtYXQoUk9MTFVQX1BBVFRFUk5TLllFQVIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgVElNRV9ST0xMVVBfT1BUSU9OUy5EQVk6XG4gICAgICAgICAgICBkYXRlRm9ybWF0ID0gZGF0ZUZvcm1hdCB8fCBBcHBEZWZhdWx0cy5kYXRlRm9ybWF0O1xuICAgICAgICAgICAgc3RyTW9tZW50ID0gc3RyTW9tZW50LnN0YXJ0T2YoJ2RheScpOyAvLyByb3VuZCBvZmYgdG8gY3VycmVudCBkYXlcbiAgICAgICAgICAgIG1vbWVudExvY2FsZS5fY2FsZW5kYXIuc2FtZUVsc2UgPSBnZXRTYW1lRWxzZUZvcm1hdDtcbiAgICAgICAgICAgIGdyb3VwQnlLZXkgPSBzdHJNb21lbnQuY2FsZW5kYXIoY3Vyck1vbWVudCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy8gSWYgaW52YWxpZCBkYXRlIGlzIHJldHVybmVkLCBDYXRlZ29yaXplIGl0IGFzIE90aGVycy5cbiAgICBpZiAoZ3JvdXBCeUtleSA9PT0gJ0ludmFsaWQgZGF0ZScpIHtcbiAgICAgICAgcmV0dXJuIEdST1VQX0JZX09QVElPTlMuT1RIRVJTO1xuICAgIH1cbiAgICByZXR1cm4gZ3JvdXBCeUtleTtcbn07XG5cblxuLy8gZ3JvdXBzIHRoZSBmaWVsZHMgYmFzZWQgb24gdGhlIGdyb3VwYnkgdmFsdWUuXG5jb25zdCBncm91cERhdGFCeUZpZWxkID0gKGdyb3VwYnk6IHN0cmluZywgbWF0Y2g6IHN0cmluZywgaW5uZXJJdGVtOiBzdHJpbmcsIGRhdGVGb3JtYXQ6IHN0cmluZywgZGF0ZVBpcGU6IFRvRGF0ZVBpcGUsIEFwcERlZmF1bHRzOiBhbnksIGxpRGF0YTogT2JqZWN0KSA9PiB7XG4gICAgLy8gZ2V0IHRoZSBncm91cGJ5IGZpZWxkIHZhbHVlIGZyb20gdGhlIGxpRGF0YSBvciBpbm5lckl0ZW0gaW4gdGhlIGxpRGF0YS5cbiAgICBsZXQgY29uY2F0U3RyID0gXy5nZXQoaW5uZXJJdGVtID8gbGlEYXRhW2lubmVySXRlbV0gOiBsaURhdGEsIGdyb3VwYnkpO1xuXG4gICAgLy8gYnkgZGVmYXVsdCBzZXQgdGhlIHVuZGVmaW5lZCBncm91cEtleSBhcyAnb3RoZXJzJ1xuICAgIGlmIChfLmlzVW5kZWZpbmVkKGNvbmNhdFN0cikgfHwgXy5pc051bGwoY29uY2F0U3RyKSB8fCBjb25jYXRTdHIudG9TdHJpbmcoKS50cmltKCkgPT09ICcnKSB7XG4gICAgICAgIHJldHVybiBHUk9VUF9CWV9PUFRJT05TLk9USEVSUztcbiAgICB9XG5cbiAgICAvLyBpZiBtYXRjaCBwcm9wIGlzIGFscGhhYmV0aWMgLGdldCB0aGUgc3RhcnRpbmcgYWxwaGFiZXQgb2YgdGhlIHdvcmQgYXMga2V5LlxuICAgIGlmIChtYXRjaCA9PT0gR1JPVVBfQllfT1BUSU9OUy5BTFBIQUJFVCkge1xuICAgICAgICBjb25jYXRTdHIgPSBjb25jYXRTdHIuc3Vic3RyKDAsIDEpO1xuICAgIH1cblxuICAgIC8vIGlmIG1hdGNoIGNvbnRhaW5zIHRoZSB0aW1lIG9wdGlvbnMgdGhlbiBnZXQgdGhlIGNvbmNhdFN0ciB1c2luZyAnZ2V0VGltZVJvbGxlZFVwU3RyaW5nJ1xuICAgIGlmIChfLmluY2x1ZGVzKF8udmFsdWVzKFRJTUVfUk9MTFVQX09QVElPTlMpLCBtYXRjaCkpIHtcbiAgICAgICAgY29uY2F0U3RyID0gZ2V0VGltZVJvbGxlZFVwU3RyaW5nKGNvbmNhdFN0ciwgbWF0Y2gsIGRhdGVGb3JtYXQsIGRhdGVQaXBlLCBBcHBEZWZhdWx0cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmNhdFN0cjtcbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgdG9nZ2xlcyBhbGwgdGhlIGxpc3QgaXRlbXMgaW5zaWRlIHRoZSBlYWNoIGxpc3QgZ3JvdXAuXG4gKiBAcGFyYW0gZWwsIGNvbXBvbmVudCByZWZlcmVuY2Ugb24gd2hpY2ggZ3JvdXBieSBpcyBhcHBsaWVkLlxuICovXG5leHBvcnQgY29uc3QgdG9nZ2xlQWxsSGVhZGVycyA9IChlbDogYW55KSA9PiB7XG4gICAgY29uc3QgZ3JvdXBzID0gJChlbC5uYXRpdmVFbGVtZW50KS5maW5kKCcuaXRlbS1ncm91cCcpO1xuXG4gICAgZ3JvdXBzLmZpbmQoJy5ncm91cC1saXN0LWl0ZW0nKS50b2dnbGUoKTtcblxuICAgIC8vIHRvZ2dsZSB0aGUgY29sbGFwc2UgaWNvbiBvbiBsaXN0IGhlYWRlci5cbiAgICBjb25zdCBncm91cEljb25zID0gZ3JvdXBzLmZpbmQoJ2xpLmxpc3QtZ3JvdXAtaGVhZGVyIC5hcHAtaWNvbicpO1xuXG4gICAgaWYgKGdyb3VwSWNvbnMpIHtcbiAgICAgICAgXy5mb3JFYWNoKGdyb3VwSWNvbnMsIChpY29uKSA9PiB7XG4gICAgICAgICAgICBpY29uID0gJChpY29uKTtcbiAgICAgICAgICAgIGlmIChpY29uLmhhc0NsYXNzKCd3aS1jaGV2cm9uLWRvd24nKSkge1xuICAgICAgICAgICAgICAgIGljb24ucmVtb3ZlQ2xhc3MoJ3dpLWNoZXZyb24tZG93bicpLmFkZENsYXNzKCd3aS1jaGV2cm9uLXVwJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGljb24ucmVtb3ZlQ2xhc3MoJ3dpLWNoZXZyb24tdXAnKS5hZGRDbGFzcygnd2ktY2hldnJvbi1kb3duJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbi8qKlxuICogT24gbGlzdCBoZWFkZXIgY2xpY2ssIHRvZ2dsZSB0aGUgbGlzdCBpdGVtcyBpbiB0aGlzIGdyb3VwLlxuICogYW5kIGFsc28gdG9nZ2xlIHRoZSBoZWFkZXIgaWNvbi5cbiAqIEBwYXJhbSAkZXZlbnRcbiAqL1xuZXhwb3J0IGNvbnN0IGhhbmRsZUhlYWRlckNsaWNrID0gKCRldmVudDogRXZlbnQpID0+IHtcbiAgICBjb25zdCBzZWxlY3RlZEdyb3VwICAgPSAkKCRldmVudC50YXJnZXQgYXMgYW55KS5jbG9zZXN0KCcuaXRlbS1ncm91cCcpLFxuICAgICAgICBzZWxlY3RlZEFwcEljb24gPSBzZWxlY3RlZEdyb3VwLmZpbmQoJ2xpLmxpc3QtZ3JvdXAtaGVhZGVyIC5hcHAtaWNvbicpO1xuXG4gICAgaWYgKHNlbGVjdGVkQXBwSWNvbi5oYXNDbGFzcygnd2ktY2hldnJvbi1kb3duJykpIHtcbiAgICAgICAgc2VsZWN0ZWRBcHBJY29uLnJlbW92ZUNsYXNzKCd3aS1jaGV2cm9uLWRvd24nKS5hZGRDbGFzcygnd2ktY2hldnJvbi11cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGVjdGVkQXBwSWNvbi5yZW1vdmVDbGFzcygnd2ktY2hldnJvbi11cCcpLmFkZENsYXNzKCd3aS1jaGV2cm9uLWRvd24nKTtcbiAgICB9XG5cbiAgICBzZWxlY3RlZEdyb3VwLmZpbmQoJy5ncm91cC1saXN0LWl0ZW0nKS50b2dnbGUoKTtcbn07XG5cbi8qKlxuICogY29uZmlndXJlcyByZW9yZGVyaW5nIHRoZSBpdGVtcy5cbiAqIEBwYXJhbSAkZWwgZWxlbWVudCB0byBiZSBzb3J0YWJsZVxuICogQHBhcmFtIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHNvcnRhYmxlIG9wdGlvbnMuXG4gKiBAcGFyYW0gc3RhcnRDYiBjYWxsYmFjayBvbiBkcmFnIHN0YXJ0IG9uIHRoZSBlbGVtZW50LlxuICogQHBhcmFtIHVwZGF0ZUNiIGNhbGxiYWNrIHRyaWdnZXJyZWQgd2hlbiBzb3J0aW5nIGlzIHN0b3BwZWQgYW5kIHRoZSBET00gcG9zaXRpb24gaGFzIGNoYW5nZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBjb25maWd1cmVEbkQgPSAoJGVsOiBhbnksIG9wdGlvbnM6IG9iamVjdCwgc3RhcnRDYjogRnVuY3Rpb24sIHVwZGF0ZUNiOiBGdW5jdGlvbikgPT4ge1xuICAgIGNvbnN0IHNvcnRPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGNvbnRhaW5tZW50OiAkZWwsXG4gICAgICAgIGRlbGF5OiAxMDAsXG4gICAgICAgIG9wYWNpdHk6IDAuOCxcbiAgICAgICAgaGVscGVyOiAnY2xvbmUnLFxuICAgICAgICB6SW5kZXg6IDEwNTAsXG4gICAgICAgIHRvbGVyYW5jZTogJ3BvaW50ZXInLFxuICAgICAgICBzdGFydDogc3RhcnRDYixcbiAgICAgICAgdXBkYXRlOiB1cGRhdGVDYlxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgJGVsLnNvcnRhYmxlKHNvcnRPcHRpb25zKTtcbn07XG5cbi8vIFRvZG86IGNvbnZlcnQgdG8gQ2xhc3NcbmludGVyZmFjZSBEYXRhU2V0UHJvcHMge1xuICAgIGRhdGFmaWVsZDogc3RyaW5nO1xuICAgIGRpc3BsYXlmaWVsZD86IHN0cmluZztcbiAgICBkaXNwbGF5ZXhwcmVzc2lvbj86IHN0cmluZztcbiAgICB1c2VrZXlzPzogYm9vbGVhbjtcbiAgICBvcmRlcmJ5Pzogc3RyaW5nO1xufVxuXG4vKipcbiAqIGtleSByZXByZXNlbnRzIHRoZSBkYXRhZmllbGQgdmFsdWVcbiAqIGxhYmVsIHJlcHJlc2VudHMgZGlzcGxheSB2YWx1ZSBvciBleHByZXNzaW9uIHZhbHVlXG4gKiB2YWx1ZSBkaXNwbGF5VmFsdWUgZm9yIHByaW1pdGl2ZXMgYW5kIGRhdGEgb2JqZWN0IGZvciBhbGxGaWVsZHNcbiAqIGRhdGFPYmplY3QgcmVwcmVzZW50IHRoZSBvYmplY3QgZnJvbSB0aGUgZGF0YXNldCB3aGVuIGRhdGFmaWVsZCBpcyBBTExGSUVMRFMuIFRoaXMgaXMgdXNlZCBhcyBpbm5lckl0ZW0gd2hpbGUgZ3JvdXBpbmcgdGhlIGRhdGFzZXRJdGVtcy5cbiAqIGltZ1NyYyBwaWN0dXJlIHNvdXJjZVxuICogc2VsZWN0ZWQgcmVwcmVzZW50cyBib29sZWFuIHRvIG5vdGlmeSBzZWxlY3RlZCBpdGVtLlxuICovXG5leHBvcnQgY2xhc3MgRGF0YVNldEl0ZW0ge1xuICAgIGtleTogYW55O1xuICAgIGxhYmVsOiBhbnk7XG4gICAgdmFsdWU6IGFueTtcbiAgICBkYXRhT2JqZWN0PzogT2JqZWN0O1xuICAgIGluZGV4PzogbnVtYmVyO1xuICAgIGltZ1NyYz86IHN0cmluZztcbiAgICBzZWxlY3RlZD86IGJvb2xlYW47XG59XG4iXX0=