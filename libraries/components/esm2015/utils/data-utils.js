import { DataSource, debounce, processFilterExpBindNode } from '@wm/core';
import { FormWidgetType, isDefined, MatchMode } from '@wm/core';
import { isDataSetWidget } from './widget-utils';
const noop = () => { };
const ɵ0 = noop;
export var Live_Operations;
(function (Live_Operations) {
    Live_Operations["INSERT"] = "insert";
    Live_Operations["UPDATE"] = "update";
    Live_Operations["DELETE"] = "delete";
    Live_Operations["READ"] = "read";
})(Live_Operations || (Live_Operations = {}));
export const ALLFIELDS = 'All Fields';
export const LIVE_CONSTANTS = {
    'EMPTY_KEY': 'EMPTY_NULL_FILTER',
    'EMPTY_VALUE': 'No Value',
    'LABEL_KEY': 'key',
    'LABEL_VALUE': 'value',
    'NULL_EMPTY': ['null', 'empty'],
    'NULL': 'null',
    'EMPTY': 'empty'
};
// Returns true if widget is autocomplete or chips
function isSearchWidgetType(widget) {
    return _.includes([FormWidgetType.AUTOCOMPLETE, FormWidgetType.TYPEAHEAD, FormWidgetType.CHIPS], widget);
}
function onSuccess(response, res, rej) {
    if (response.error) {
        rej(response);
    }
    else {
        res(response);
    }
}
export function performDataOperation(dataSource, requestData, options) {
    return new Promise((res, rej) => {
        if (dataSource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
            let fn;
            const operationType = options.operationType;
            switch (operationType) {
                case Live_Operations.UPDATE:
                    fn = DataSource.Operation.UPDATE_RECORD;
                    break;
                case Live_Operations.INSERT:
                    fn = DataSource.Operation.INSERT_RECORD;
                    break;
                case Live_Operations.DELETE:
                    fn = DataSource.Operation.DELETE_RECORD;
                    break;
            }
            dataSource.execute(fn, requestData).then(response => onSuccess(response, res, rej), rej);
        }
        else if (dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
            dataSource.execute(DataSource.Operation.SET_INPUT, requestData);
            dataSource.execute(DataSource.Operation.INVOKE, {
                'skipNotification': true
            }).then(res, rej);
        }
        else {
            res(requestData);
        }
    });
}
export function refreshDataSource(dataSource, options) {
    return new Promise((res, rej) => {
        if (!dataSource) {
            rej();
            return;
        }
        dataSource.execute(DataSource.Operation.LIST_RECORDS, {
            'filterFields': options.filterFields || {},
            'orderBy': options.orderBy,
            'page': options.page || 1
        }).then(res, rej);
    });
}
/**
 * @ngdoc function
 * @name wm.widgets.live.fetchRelatedFieldData
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * This function fetches the data for the related field in live form/ grid
 *
 * @param {object} columnDef field definition
 * @param {string} relatedField related field name
 * @param {string} datafield Datafield to be set on widget
 * @param {string} widget Type of the widget
 * @param {object} elScope element scope
 * @param {object} parentScope live form// grid scope
 */
export function fetchRelatedFieldData(dataSource, formField, options) {
    let primaryKeys;
    let displayField;
    const relatedField = options.relatedField;
    const datafield = options.datafield;
    if (!dataSource) {
        return;
    }
    primaryKeys = dataSource.execute(DataSource.Operation.GET_RELATED_PRIMARY_KEYS, relatedField);
    formField.datafield = datafield;
    formField._primaryKey = _.isEmpty(primaryKeys) ? undefined : primaryKeys[0];
    formField.compareby = primaryKeys && primaryKeys.join(',');
    displayField = datafield === ALLFIELDS ? undefined : datafield;
    formField.displayfield = displayField = (formField.displayfield || displayField || formField._primaryKey);
    if (isSearchWidgetType(formField[options.widget])) {
        formField.dataoptions = { 'relatedField': relatedField, 'filterExpr': formField.filterexpressions ? formField.filterexpressions : {} };
        formField.datasource = dataSource;
        formField.searchkey = formField.searchkey || displayField;
        formField.displaylabel = formField.displayfield = (formField.displaylabel || displayField);
    }
    else {
        interpolateBindExpressions(formField.viewParent, formField.filterexpressions, (filterexpressions) => {
            formField.filterexpressions = filterexpressions;
            dataSource.execute(DataSource.Operation.GET_RELATED_TABLE_DATA, {
                relatedField,
                pagesize: formField.limit,
                orderBy: formField.orderby ? _.replace(formField.orderby, /:/g, ' ') : '',
                filterFields: {},
                filterExpr: formField.filterexpressions ? formField.filterexpressions : {}
            }).then(response => {
                formField.dataset = response.data;
                formField.displayfield = formField.displayfield || _.head(_.keys(_.get(response, '[0]')));
            }, noop);
        });
    }
}
/**
 * used to interpolate the bind expression for keys in the query builder
 * @param context where we find the variable obj
 * @param filterexpressions - obj containing all the rule objs
 * @param callbackFn - function to be called with the new replaced values if any in the filterexpressions object
 */
export const interpolateBindExpressions = (context, filterexpressions, callbackFn) => {
    const debouncedFn = debounce(() => {
        if (_.isFunction(callbackFn)) {
            callbackFn(filterexpressions);
        }
    }, 300);
    /**
     * calling the debounced function first for the case where if there is any filterexpression without the bindedvariables.
     * without this it will never be called. processFilterExpBindNode will be called only for the binded variable expressions.
     */
    debouncedFn();
    const filterExpressions = filterexpressions ? (_.isObject(filterexpressions) ? filterexpressions : JSON.parse(filterexpressions)) : {};
    const destroyFn = context.registerDestroyListener ? context.registerDestroyListener.bind(context) : _.noop;
    const filterSubscription = processFilterExpBindNode(context, filterExpressions).subscribe((response) => {
        filterexpressions = JSON.stringify(response.filterExpressions);
        debouncedFn();
    });
    destroyFn(() => filterSubscription.unsubscribe());
};
/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#getDistinctFieldProperties
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Returns the properties required for dataset widgets
 *
 * @param {object} dataSource variable source for the widget
 * @param {object} formField definition of the column/ field
 *
 */
export const getDistinctFieldProperties = (dataSource, formField) => {
    const props = {};
    let fieldColumn;
    if (formField['is-related']) {
        props.tableName = formField['lookup-type'];
        fieldColumn = formField['lookup-field'];
        props.distinctField = fieldColumn;
        props.aliasColumn = fieldColumn.replace('.', '$'); // For related fields, In response . is replaced by $
        props.filterExpr = formField.filterexpressions ? (_.isObject(formField.filterexpressions) ? formField.filterexpressions : JSON.parse(formField.filterexpressions)) : {};
    }
    else {
        props.tableName = dataSource.execute(DataSource.Operation.GET_ENTITY_NAME);
        fieldColumn = formField.field || formField.key;
        props.distinctField = fieldColumn;
        props.aliasColumn = fieldColumn;
    }
    return props;
};
/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#getDistinctValues
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Returns the distinct values for a field
 *
 * @param {object} formField definition of the column/ field
 * @param {string} widget widget property on the field
 * @param {object} variable variable for the widget
 * @param {function} callBack Function to be executed after fetching results
 *
 */
export function getDistinctValues(dataSource, formField, widget) {
    let props;
    return new Promise((res, rej) => {
        if (isDataSetWidget(formField[widget]) && (!formField.isDataSetBound || widget === 'filterwidget')) {
            props = getDistinctFieldProperties(dataSource, formField);
            dataSource.execute(DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS, {
                fields: props.distinctField,
                entityName: props.tableName,
                pagesize: formField.limit,
                filterExpr: formField.filterexpressions ? JSON.parse(formField.filterexpressions) : {}
            }).then(response => {
                res({ 'field': formField, 'data': response.data, 'aliasColumn': props.aliasColumn });
            }, rej);
        }
    });
}
// Set the data field properties on dataset widgets
function setDataFields(formField, options) {
    // For search widget, set search key and display label
    if (isSearchWidgetType(formField[options.widget])) {
        formField.datafield = options.aliasColumn || LIVE_CONSTANTS.LABEL_KEY;
        formField.searchkey = options.distinctField || LIVE_CONSTANTS.LABEL_KEY;
        formField.displaylabel = formField.displayfield = (options.aliasColumn || LIVE_CONSTANTS.LABEL_VALUE);
        return;
    }
    formField.datafield = LIVE_CONSTANTS.LABEL_KEY;
    formField.displayfield = LIVE_CONSTANTS.LABEL_VALUE;
}
/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#setFieldDataSet
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to set the dataSet on the fields
 *
 * @param {object} formField definition of the column/ field
 * @param {object} data data returned from the server
 * @param {string} aliasColumn column field name
 * @param {string} widget widget property on the field
 * @param {boolean} isEnableEmptyFilter is null or empty values allowed on filter
 *
 */
function setFieldDataSet(formField, data, options) {
    const emptySupportWidgets = [FormWidgetType.SELECT, FormWidgetType.RADIOSET];
    const emptyOption = {};
    const dataSet = [];
    if (options.isEnableEmptyFilter && _.includes(emptySupportWidgets, formField[options.widget]) &&
        !formField['is-range'] && !formField.multiple) {
        // If empty option is selected, push an empty object in to dataSet
        emptyOption[LIVE_CONSTANTS.LABEL_KEY] = LIVE_CONSTANTS.EMPTY_KEY;
        emptyOption[LIVE_CONSTANTS.LABEL_VALUE] = options.EMPTY_VALUE || LIVE_CONSTANTS.EMPTY_VALUE;
        dataSet.push(emptyOption);
    }
    _.each(data, key => {
        const value = key[options.aliasColumn];
        const option = {};
        if (value !== null && value !== '') {
            option[LIVE_CONSTANTS.LABEL_KEY] = value;
            option[LIVE_CONSTANTS.LABEL_VALUE] = value;
            dataSet.push(option);
        }
    });
    setDataFields(formField, options);
    formField.dataset = dataSet;
}
/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#fetchDistinctValues
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to fetch the distinct values for a field
 *
 * @param {object} scope scope of the widget
 * @param {object} formFields definitions of the column/ field
 * @param {string} widget widget property on the field
 * @param {boolean} isEnableEmptyFilter is null or empty values allowed on filter
 *
 */
export function fetchDistinctValues(dataSource, formFields, options) {
    if (_.isEmpty(formFields)) {
        return;
    }
    formFields.forEach(formField => {
        getDistinctValuesForField(dataSource, formField, options);
    });
}
/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#getDistinctValuesForField
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to fetch the distinct values for a field
 *
 * @param {object} scope scope of the widget
 * @param {object} formFields definitions of the column/ field
 * @param {string} widget widget property on the field
 * @param {boolean} isEnableEmptyFilter is null or empty values allowed on filter
 *
 */
export function getDistinctValuesForField(dataSource, formField, options) {
    if (!dataSource || !formField || formField.isDataSetBound) {
        return;
    }
    if (isSearchWidgetType(formField[options.widget])) {
        const dataoptions = getDistinctFieldProperties(dataSource, formField);
        formField.dataoptions = dataoptions;
        setDataFields(formField, Object.assign(options || {}, dataoptions));
        formField.datasource = dataSource;
    }
    else {
        interpolateBindExpressions(formField.viewParent, formField.filterexpressions, (filterexpressions) => {
            formField.filterexpressions = filterexpressions;
            getDistinctValues(dataSource, formField, options.widget).then((res) => {
                setFieldDataSet(res.field, res.data, {
                    aliasColumn: res.aliasColumn,
                    widget: options.widget,
                    isEnableEmptyFilter: getEnableEmptyFilter(options.enableemptyfilter),
                    EMPTY_VALUE: options.EMPTY_VALUE
                });
            });
        });
    }
}
function isDefinedAndNotEmpty(val) {
    return isDefined(val) && val !== '' && val !== null;
}
/**
 * @ngdoc function
 * @name wm.widgets.live.getRangeFieldValue
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to get the field value for range
 *
 * @param {string} minValue min value selected
 * @param {string} maxValue max value selected
 */
export function getRangeFieldValue(minValue, maxValue) {
    let fieldValue;
    if (isDefinedAndNotEmpty(minValue) && isDefinedAndNotEmpty(maxValue)) {
        fieldValue = [minValue, maxValue];
    }
    else if (isDefinedAndNotEmpty(minValue)) {
        fieldValue = minValue;
    }
    else if (isDefinedAndNotEmpty(maxValue)) {
        fieldValue = maxValue;
    }
    return fieldValue;
}
/**
 * @ngdoc function
 * @name wm.widgets.live.getRangeMatchMode
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to get the match mode for range
 *
 * @param {string} minValue min value selected
 * @param {string} maxValue max value selected
 */
export function getRangeMatchMode(minValue, maxValue) {
    let matchMode;
    // If two values exists, then it is between. Otherwise, greater or lesser
    if (isDefinedAndNotEmpty(minValue) && isDefinedAndNotEmpty(maxValue)) {
        matchMode = MatchMode.BETWEEN;
    }
    else if (isDefinedAndNotEmpty(minValue)) {
        matchMode = MatchMode.GREATER;
    }
    else if (isDefinedAndNotEmpty(maxValue)) {
        matchMode = MatchMode.LESSER;
    }
    return matchMode;
}
/**
 * @ngdoc function
 * @name wm.widgets.live.getEnableEmptyFilter
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * This function checks if enable filter options is set on live filter
 *
 * @param {object} enableemptyfilter empty filter options
 */
export function getEnableEmptyFilter(enableemptyfilter) {
    return enableemptyfilter && _.intersection(enableemptyfilter.split(','), LIVE_CONSTANTS.NULL_EMPTY).length > 0;
}
/**
 * @ngdoc function
 * @name wm.widgets.live.getEmptyMatchMode
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to get the match mode based on the filter selected
 *
 * @param {object} enableemptyfilter empty filter options
 */
export function getEmptyMatchMode(enableemptyfilter) {
    let matchMode;
    const emptyFilterOptions = _.split(enableemptyfilter, ',');
    if (_.intersection(emptyFilterOptions, LIVE_CONSTANTS.NULL_EMPTY).length === 2) {
        matchMode = MatchMode.NULLOREMPTY;
    }
    else if (_.includes(emptyFilterOptions, LIVE_CONSTANTS.NULL)) {
        matchMode = MatchMode.NULL;
    }
    else if (_.includes(emptyFilterOptions, LIVE_CONSTANTS.EMPTY)) {
        matchMode = MatchMode.EMPTY;
    }
    return matchMode;
}
/**
 * converts the data passed to array.
 *  -> Array: [1,2,3] - [1,2,3]
 *  -> String: a,b,c - ['a','b','c']
 *  -> object: {a:1} - [{a:1}]
 *  -> null - []
 *  -> undefined - []
 * @param data
 * @returns {Array<any>}
 */
export const createArrayFrom = (data) => {
    if (_.isUndefined(data) || _.isNull(data)) {
        return [];
    }
    if (_.isString(data)) {
        data = data.split(',').map(Function.prototype.call, String.prototype.trim);
    }
    if (!_.isArray(data)) {
        data = [data];
    }
    return data;
};
/**
 * @ngdoc function
 * @name wm.widgets.live.applyFilterOnField
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to get the updated values when filter on field is changed
 *
 * @param {object} $scope scope of the filter field/form field
 * @param {object} filterDef filter/form definition of the field
 * @param {boolean} isFirst boolean value to check if this method is called on load
 */
export function applyFilterOnField(dataSource, filterDef, formFields, newVal, options = {}) {
    const fieldName = filterDef.field || filterDef.key;
    const filterOnFields = _.filter(formFields, { 'filter-on': fieldName });
    newVal = filterDef['is-range'] ? getRangeFieldValue(filterDef.minValue, filterDef.maxValue) : (isDefined(newVal) ? newVal : filterDef.value);
    if (!dataSource || (options.isFirst && (_.isUndefined(newVal) || newVal === ''))) {
        return;
    }
    // Loop over the fields for which the current field is filter on field
    _.forEach(filterOnFields, filterField => {
        const filterKey = filterField.field || filterField.key;
        const lookUpField = filterDef['lookup-field'] || filterDef._primaryKey;
        const filterWidget = filterField['edit-widget-type'] || filterField.widgettype;
        let filterFields = {};
        let filterOn = filterField['filter-on'];
        let filterVal;
        let fieldColumn;
        let matchMode;
        if (!isDataSetWidget(filterWidget) || filterField.isDataSetBound || filterOn === filterKey) {
            return;
        }
        // For related fields, add lookupfield for query generation
        if (filterDef && filterDef['is-related']) {
            filterOn += '.' + lookUpField;
        }
        if (isDefined(newVal)) {
            if (filterDef['is-range']) {
                matchMode = getRangeMatchMode(filterDef.minValue, filterDef.maxValue);
            }
            else if (getEnableEmptyFilter(options.enableemptyfilter) && newVal === LIVE_CONSTANTS.EMPTY_KEY) {
                matchMode = getEmptyMatchMode(options.enableemptyfilter);
            }
            else {
                matchMode = MatchMode.EQUALS;
            }
            filterVal = (_.isObject(newVal) && !_.isArray(newVal)) ? newVal[lookUpField] : newVal;
            filterFields[filterOn] = {
                'value': filterVal,
                'matchMode': matchMode
            };
        }
        else {
            filterFields = {};
        }
        fieldColumn = filterKey;
        if (isSearchWidgetType(filterWidget) && filterField.dataoptions) {
            filterField.dataoptions.filterFields = filterFields;
        }
        else {
            dataSource.execute(DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS, {
                'fields': fieldColumn,
                'filterFields': filterFields,
                'pagesize': filterField.limit
            }).then(response => {
                setFieldDataSet(filterField, response.data, {
                    aliasColumn: fieldColumn,
                    widget: options.widget || 'widgettype',
                    isEnableEmptyFilter: getEnableEmptyFilter(options.enableemptyfilter),
                    EMPTY_VALUE: options.EMPTY_VALUE
                });
            }, noop);
        }
    });
}
// Transform data as required by data table
export function transformData(dataObject, variableName) {
    let newObj, tempArr, keys, oldKeys, numKeys, newObject, tempObj;
    // data sanity testing
    dataObject = dataObject || [];
    // if the dataObject is not an array make it an array
    if (!_.isArray(dataObject)) {
        // if the data returned is of type string, make it an object inside an array
        if (_.isString(dataObject)) {
            keys = variableName.substring(variableName.indexOf('.') + 1, variableName.length).split('.');
            oldKeys = [];
            numKeys = keys.length;
            newObject = {};
            tempObj = newObject;
            // loop over the keys to form appropriate data object required for grid
            keys.forEach((key, index) => {
                // loop over old keys to create new object at the iterative level
                oldKeys.forEach(oldKey => {
                    tempObj = newObject[oldKey];
                });
                tempObj[key] = index === numKeys - 1 ? dataObject : {};
                oldKeys.push(key);
            });
            // change the string data to the new dataObject formed
            dataObject = newObject;
        }
        dataObject = [dataObject];
    }
    else {
        /*if the dataObject is an array and each value is a string, then lite-transform the string to an object
         * lite-transform: just checking if the first value is string and then transforming the object, instead of traversing through the whole array
         * */
        if (_.isString(dataObject[0])) {
            tempArr = [];
            _.forEach(dataObject, str => {
                newObj = {};
                newObj[variableName.split('.').join('-')] = str;
                tempArr.push(newObj);
            });
            dataObject = tempArr;
        }
    }
    return dataObject;
}
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS11dGlscy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsidXRpbHMvZGF0YS11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSx3QkFBd0IsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUMxRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFaEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBSWpELE1BQU0sSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQzs7QUFFdEIsTUFBTSxDQUFOLElBQVksZUFLWDtBQUxELFdBQVksZUFBZTtJQUN2QixvQ0FBaUIsQ0FBQTtJQUNqQixvQ0FBaUIsQ0FBQTtJQUNqQixvQ0FBaUIsQ0FBQTtJQUNqQixnQ0FBYSxDQUFBO0FBQ2pCLENBQUMsRUFMVyxlQUFlLEtBQWYsZUFBZSxRQUsxQjtBQUVELE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUM7QUFFdEMsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHO0lBQzFCLFdBQVcsRUFBTyxtQkFBbUI7SUFDckMsYUFBYSxFQUFLLFVBQVU7SUFDNUIsV0FBVyxFQUFPLEtBQUs7SUFDdkIsYUFBYSxFQUFLLE9BQU87SUFDekIsWUFBWSxFQUFNLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztJQUNuQyxNQUFNLEVBQVksTUFBTTtJQUN4QixPQUFPLEVBQVcsT0FBTztDQUM1QixDQUFDO0FBRUYsa0RBQWtEO0FBQ2xELFNBQVMsa0JBQWtCLENBQUMsTUFBTTtJQUM5QixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FB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QztZQUN6QixDQUFDLENBQUMsQ0FBQztZQUNILFVBQVUsR0FBRyxPQUFPLENBQUM7U0FDeEI7S0FDSjtJQUNELE9BQU8sVUFBVSxDQUFDO0FBQ3RCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhU291cmNlLCBkZWJvdW5jZSwgcHJvY2Vzc0ZpbHRlckV4cEJpbmROb2RlIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgRm9ybVdpZGdldFR5cGUsIGlzRGVmaW5lZCwgTWF0Y2hNb2RlIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBpc0RhdGFTZXRXaWRnZXQgfSBmcm9tICcuL3dpZGdldC11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuXG5leHBvcnQgZW51bSBMaXZlX09wZXJhdGlvbnMge1xuICAgIElOU0VSVCA9ICdpbnNlcnQnLFxuICAgIFVQREFURSA9ICd1cGRhdGUnLFxuICAgIERFTEVURSA9ICdkZWxldGUnLFxuICAgIFJFQUQgPSAncmVhZCdcbn1cblxuZXhwb3J0IGNvbnN0IEFMTEZJRUxEUyA9ICdBbGwgRmllbGRzJztcblxuZXhwb3J0IGNvbnN0IExJVkVfQ09OU1RBTlRTID0ge1xuICAgICdFTVBUWV9LRVknICAgICA6ICdFTVBUWV9OVUxMX0ZJTFRFUicsXG4gICAgJ0VNUFRZX1ZBTFVFJyAgIDogJ05vIFZhbHVlJyxcbiAgICAnTEFCRUxfS0VZJyAgICAgOiAna2V5JyxcbiAgICAnTEFCRUxfVkFMVUUnICAgOiAndmFsdWUnLFxuICAgICdOVUxMX0VNUFRZJyAgICA6IFsnbnVsbCcsICdlbXB0eSddLFxuICAgICdOVUxMJyAgICAgICAgICA6ICdudWxsJyxcbiAgICAnRU1QVFknICAgICAgICAgOiAnZW1wdHknXG59O1xuXG4vLyBSZXR1cm5zIHRydWUgaWYgd2lkZ2V0IGlzIGF1dG9jb21wbGV0ZSBvciBjaGlwc1xuZnVuY3Rpb24gaXNTZWFyY2hXaWRnZXRUeXBlKHdpZGdldCkge1xuICAgIHJldHVybiBfLmluY2x1ZGVzKFtGb3JtV2lkZ2V0VHlwZS5BVVRPQ09NUExFVEUsIEZvcm1XaWRnZXRUeXBlLlRZUEVBSEVBRCwgRm9ybVdpZGdldFR5cGUuQ0hJUFNdLCB3aWRnZXQpO1xufVxuXG5mdW5jdGlvbiBvblN1Y2Nlc3MocmVzcG9uc2UsIHJlcywgcmVqKSB7XG4gICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgIHJlaihyZXNwb25zZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVzKHJlc3BvbnNlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZXJmb3JtRGF0YU9wZXJhdGlvbihkYXRhU291cmNlLCByZXF1ZXN0RGF0YSwgb3B0aW9ucyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgICBpZiAoZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlNVUFBPUlRTX0NSVUQpKSB7XG4gICAgICAgICAgICBsZXQgZm47XG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb25UeXBlID0gb3B0aW9ucy5vcGVyYXRpb25UeXBlO1xuICAgICAgICAgICAgc3dpdGNoIChvcGVyYXRpb25UeXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBMaXZlX09wZXJhdGlvbnMuVVBEQVRFOlxuICAgICAgICAgICAgICAgICAgICBmbiA9IERhdGFTb3VyY2UuT3BlcmF0aW9uLlVQREFURV9SRUNPUkQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTGl2ZV9PcGVyYXRpb25zLklOU0VSVDpcbiAgICAgICAgICAgICAgICAgICAgZm4gPSBEYXRhU291cmNlLk9wZXJhdGlvbi5JTlNFUlRfUkVDT1JEO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICBMaXZlX09wZXJhdGlvbnMuREVMRVRFOlxuICAgICAgICAgICAgICAgICAgICBmbiA9IERhdGFTb3VyY2UuT3BlcmF0aW9uLkRFTEVURV9SRUNPUkQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGF0YVNvdXJjZS5leGVjdXRlKGZuLCByZXF1ZXN0RGF0YSkudGhlbihyZXNwb25zZSA9PiBvblN1Y2Nlc3MocmVzcG9uc2UsIHJlcywgcmVqKSwgcmVqKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfQVBJX0FXQVJFKSkge1xuICAgICAgICAgICAgZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlNFVF9JTlBVVCwgcmVxdWVzdERhdGEpO1xuICAgICAgICAgICAgZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklOVk9LRSwge1xuICAgICAgICAgICAgICAgICdza2lwTm90aWZpY2F0aW9uJzogdHJ1ZVxuICAgICAgICAgICAgfSkudGhlbihyZXMsIHJlaik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXMocmVxdWVzdERhdGEpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWZyZXNoRGF0YVNvdXJjZShkYXRhU291cmNlLCBvcHRpb25zKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAgIGlmICghZGF0YVNvdXJjZSkge1xuICAgICAgICAgICAgcmVqKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkxJU1RfUkVDT1JEUywge1xuICAgICAgICAgICAgJ2ZpbHRlckZpZWxkcycgOiBvcHRpb25zLmZpbHRlckZpZWxkcyB8fCB7fSxcbiAgICAgICAgICAgICdvcmRlckJ5JyA6IG9wdGlvbnMub3JkZXJCeSxcbiAgICAgICAgICAgICdwYWdlJzogb3B0aW9ucy5wYWdlIHx8IDFcbiAgICAgICAgfSkudGhlbihyZXMsIHJlaik7XG4gICAgfSk7XG59XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB3bS53aWRnZXRzLmxpdmUuZmV0Y2hSZWxhdGVkRmllbGREYXRhXG4gKiBAbWV0aG9kT2Ygd20ud2lkZ2V0cy5saXZlLkxpdmVXaWRnZXRVdGlsc1xuICogQGZ1bmN0aW9uXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGlzIGZ1bmN0aW9uIGZldGNoZXMgdGhlIGRhdGEgZm9yIHRoZSByZWxhdGVkIGZpZWxkIGluIGxpdmUgZm9ybS8gZ3JpZFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb2x1bW5EZWYgZmllbGQgZGVmaW5pdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0ZWRGaWVsZCByZWxhdGVkIGZpZWxkIG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhZmllbGQgRGF0YWZpZWxkIHRvIGJlIHNldCBvbiB3aWRnZXRcbiAqIEBwYXJhbSB7c3RyaW5nfSB3aWRnZXQgVHlwZSBvZiB0aGUgd2lkZ2V0XG4gKiBAcGFyYW0ge29iamVjdH0gZWxTY29wZSBlbGVtZW50IHNjb3BlXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyZW50U2NvcGUgbGl2ZSBmb3JtLy8gZ3JpZCBzY29wZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hSZWxhdGVkRmllbGREYXRhKGRhdGFTb3VyY2UsIGZvcm1GaWVsZCwgb3B0aW9ucykge1xuICAgIGxldCBwcmltYXJ5S2V5cztcbiAgICBsZXQgZGlzcGxheUZpZWxkO1xuICAgIGNvbnN0IHJlbGF0ZWRGaWVsZCA9IG9wdGlvbnMucmVsYXRlZEZpZWxkO1xuICAgIGNvbnN0IGRhdGFmaWVsZCA9IG9wdGlvbnMuZGF0YWZpZWxkO1xuXG4gICAgaWYgKCFkYXRhU291cmNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcHJpbWFyeUtleXMgPSBkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX1JFTEFURURfUFJJTUFSWV9LRVlTLCByZWxhdGVkRmllbGQpO1xuICAgIGZvcm1GaWVsZC5kYXRhZmllbGQgPSBkYXRhZmllbGQ7XG4gICAgZm9ybUZpZWxkLl9wcmltYXJ5S2V5ID0gXy5pc0VtcHR5KHByaW1hcnlLZXlzKSA/IHVuZGVmaW5lZCA6IHByaW1hcnlLZXlzWzBdO1xuICAgIGZvcm1GaWVsZC5jb21wYXJlYnkgPSBwcmltYXJ5S2V5cyAmJiBwcmltYXJ5S2V5cy5qb2luKCcsJyk7XG5cbiAgICBkaXNwbGF5RmllbGQgPSBkYXRhZmllbGQgPT09IEFMTEZJRUxEUyA/IHVuZGVmaW5lZCA6IGRhdGFmaWVsZDtcbiAgICBmb3JtRmllbGQuZGlzcGxheWZpZWxkID0gZGlzcGxheUZpZWxkID0gKGZvcm1GaWVsZC5kaXNwbGF5ZmllbGQgfHwgZGlzcGxheUZpZWxkIHx8IGZvcm1GaWVsZC5fcHJpbWFyeUtleSk7XG5cbiAgICBpZiAoaXNTZWFyY2hXaWRnZXRUeXBlKGZvcm1GaWVsZFtvcHRpb25zLndpZGdldF0pKSB7XG4gICAgICAgIGZvcm1GaWVsZC5kYXRhb3B0aW9ucyA9IHsncmVsYXRlZEZpZWxkJzogcmVsYXRlZEZpZWxkLCAnZmlsdGVyRXhwcic6IGZvcm1GaWVsZC5maWx0ZXJleHByZXNzaW9ucyA/IGZvcm1GaWVsZC5maWx0ZXJleHByZXNzaW9ucyA6IHt9fTtcbiAgICAgICAgZm9ybUZpZWxkLmRhdGFzb3VyY2UgPSBkYXRhU291cmNlO1xuICAgICAgICBmb3JtRmllbGQuc2VhcmNoa2V5ID0gZm9ybUZpZWxkLnNlYXJjaGtleSB8fCBkaXNwbGF5RmllbGQ7XG4gICAgICAgIGZvcm1GaWVsZC5kaXNwbGF5bGFiZWwgPSBmb3JtRmllbGQuZGlzcGxheWZpZWxkID0gKGZvcm1GaWVsZC5kaXNwbGF5bGFiZWwgfHwgZGlzcGxheUZpZWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpbnRlcnBvbGF0ZUJpbmRFeHByZXNzaW9ucyhmb3JtRmllbGQudmlld1BhcmVudCwgZm9ybUZpZWxkLmZpbHRlcmV4cHJlc3Npb25zLCAoZmlsdGVyZXhwcmVzc2lvbnMpID0+IHtcbiAgICAgICAgICAgIGZvcm1GaWVsZC5maWx0ZXJleHByZXNzaW9ucyA9IGZpbHRlcmV4cHJlc3Npb25zO1xuICAgICAgICAgICAgZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9SRUxBVEVEX1RBQkxFX0RBVEEsIHtcbiAgICAgICAgICAgICAgICByZWxhdGVkRmllbGQsXG4gICAgICAgICAgICAgICAgcGFnZXNpemU6IGZvcm1GaWVsZC5saW1pdCxcbiAgICAgICAgICAgICAgICBvcmRlckJ5OiBmb3JtRmllbGQub3JkZXJieSA/IF8ucmVwbGFjZShmb3JtRmllbGQub3JkZXJieSwgLzovZywgJyAnKSA6ICcnLFxuICAgICAgICAgICAgICAgIGZpbHRlckZpZWxkczoge30sXG4gICAgICAgICAgICAgICAgZmlsdGVyRXhwcjogZm9ybUZpZWxkLmZpbHRlcmV4cHJlc3Npb25zID8gZm9ybUZpZWxkLmZpbHRlcmV4cHJlc3Npb25zIDoge31cbiAgICAgICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGZvcm1GaWVsZC5kYXRhc2V0ID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgICAgICBmb3JtRmllbGQuZGlzcGxheWZpZWxkID0gZm9ybUZpZWxkLmRpc3BsYXlmaWVsZCB8fCBfLmhlYWQoXy5rZXlzKF8uZ2V0KHJlc3BvbnNlLCAnWzBdJykpKTtcbiAgICAgICAgICAgIH0sIG5vb3ApO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogdXNlZCB0byBpbnRlcnBvbGF0ZSB0aGUgYmluZCBleHByZXNzaW9uIGZvciBrZXlzIGluIHRoZSBxdWVyeSBidWlsZGVyXG4gKiBAcGFyYW0gY29udGV4dCB3aGVyZSB3ZSBmaW5kIHRoZSB2YXJpYWJsZSBvYmpcbiAqIEBwYXJhbSBmaWx0ZXJleHByZXNzaW9ucyAtIG9iaiBjb250YWluaW5nIGFsbCB0aGUgcnVsZSBvYmpzXG4gKiBAcGFyYW0gY2FsbGJhY2tGbiAtIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aXRoIHRoZSBuZXcgcmVwbGFjZWQgdmFsdWVzIGlmIGFueSBpbiB0aGUgZmlsdGVyZXhwcmVzc2lvbnMgb2JqZWN0XG4gKi9cbmV4cG9ydCBjb25zdCBpbnRlcnBvbGF0ZUJpbmRFeHByZXNzaW9ucyA9IChjb250ZXh0LCBmaWx0ZXJleHByZXNzaW9ucywgY2FsbGJhY2tGbikgPT4ge1xuICAgIGNvbnN0IGRlYm91bmNlZEZuID0gZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGNhbGxiYWNrRm4pKSB7XG4gICAgICAgICAgICBjYWxsYmFja0ZuKGZpbHRlcmV4cHJlc3Npb25zKTtcbiAgICAgICAgfVxuICAgIH0sIDMwMCk7XG5cbiAgICAvKipcbiAgICAgKiBjYWxsaW5nIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gZmlyc3QgZm9yIHRoZSBjYXNlIHdoZXJlIGlmIHRoZXJlIGlzIGFueSBmaWx0ZXJleHByZXNzaW9uIHdpdGhvdXQgdGhlIGJpbmRlZHZhcmlhYmxlcy5cbiAgICAgKiB3aXRob3V0IHRoaXMgaXQgd2lsbCBuZXZlciBiZSBjYWxsZWQuIHByb2Nlc3NGaWx0ZXJFeHBCaW5kTm9kZSB3aWxsIGJlIGNhbGxlZCBvbmx5IGZvciB0aGUgYmluZGVkIHZhcmlhYmxlIGV4cHJlc3Npb25zLlxuICAgICAqL1xuICAgIGRlYm91bmNlZEZuKCk7XG4gICAgY29uc3QgZmlsdGVyRXhwcmVzc2lvbnMgPSBmaWx0ZXJleHByZXNzaW9ucyA/IChfLmlzT2JqZWN0KGZpbHRlcmV4cHJlc3Npb25zKSA/IGZpbHRlcmV4cHJlc3Npb25zIDogSlNPTi5wYXJzZShmaWx0ZXJleHByZXNzaW9ucykpIDoge307XG4gICAgY29uc3QgZGVzdHJveUZuID0gY29udGV4dC5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lciA/IGNvbnRleHQucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIuYmluZChjb250ZXh0KSA6IF8ubm9vcDtcbiAgICBjb25zdCBmaWx0ZXJTdWJzY3JpcHRpb24gPSAgcHJvY2Vzc0ZpbHRlckV4cEJpbmROb2RlKGNvbnRleHQsIGZpbHRlckV4cHJlc3Npb25zKS5zdWJzY3JpYmUoKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgICAgZmlsdGVyZXhwcmVzc2lvbnMgPSBKU09OLnN0cmluZ2lmeShyZXNwb25zZS5maWx0ZXJFeHByZXNzaW9ucyk7XG4gICAgICAgIGRlYm91bmNlZEZuKCk7XG4gICAgfSk7XG4gICAgZGVzdHJveUZuKCgpID0+IGZpbHRlclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbn07XG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgd20ud2lkZ2V0cy5saXZlLkxpdmVXaWRnZXRVdGlscyNnZXREaXN0aW5jdEZpZWxkUHJvcGVydGllc1xuICogQG1ldGhvZE9mIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHNcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogUmV0dXJucyB0aGUgcHJvcGVydGllcyByZXF1aXJlZCBmb3IgZGF0YXNldCB3aWRnZXRzXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFTb3VyY2UgdmFyaWFibGUgc291cmNlIGZvciB0aGUgd2lkZ2V0XG4gKiBAcGFyYW0ge29iamVjdH0gZm9ybUZpZWxkIGRlZmluaXRpb24gb2YgdGhlIGNvbHVtbi8gZmllbGRcbiAqXG4gKi9cbmV4cG9ydCBjb25zdCBnZXREaXN0aW5jdEZpZWxkUHJvcGVydGllcyA9IChkYXRhU291cmNlLCBmb3JtRmllbGQpID0+IHtcbiAgICBjb25zdCBwcm9wczogYW55ID0ge307XG4gICAgbGV0IGZpZWxkQ29sdW1uO1xuICAgIGlmIChmb3JtRmllbGRbJ2lzLXJlbGF0ZWQnXSkge1xuICAgICAgICBwcm9wcy50YWJsZU5hbWUgICAgID0gZm9ybUZpZWxkWydsb29rdXAtdHlwZSddO1xuICAgICAgICBmaWVsZENvbHVtbiAgICAgICAgID0gZm9ybUZpZWxkWydsb29rdXAtZmllbGQnXTtcbiAgICAgICAgcHJvcHMuZGlzdGluY3RGaWVsZCA9IGZpZWxkQ29sdW1uO1xuICAgICAgICBwcm9wcy5hbGlhc0NvbHVtbiAgID0gZmllbGRDb2x1bW4ucmVwbGFjZSgnLicsICckJyk7IC8vIEZvciByZWxhdGVkIGZpZWxkcywgSW4gcmVzcG9uc2UgLiBpcyByZXBsYWNlZCBieSAkXG4gICAgICAgIHByb3BzLmZpbHRlckV4cHIgICAgPSBmb3JtRmllbGQuZmlsdGVyZXhwcmVzc2lvbnMgPyAoXy5pc09iamVjdChmb3JtRmllbGQuZmlsdGVyZXhwcmVzc2lvbnMpID8gZm9ybUZpZWxkLmZpbHRlcmV4cHJlc3Npb25zIDogSlNPTi5wYXJzZShmb3JtRmllbGQuZmlsdGVyZXhwcmVzc2lvbnMpKSA6IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHByb3BzLnRhYmxlTmFtZSAgICAgPSBkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX0VOVElUWV9OQU1FKTtcbiAgICAgICAgZmllbGRDb2x1bW4gICAgICAgICA9IGZvcm1GaWVsZC5maWVsZCB8fCBmb3JtRmllbGQua2V5O1xuICAgICAgICBwcm9wcy5kaXN0aW5jdEZpZWxkID0gZmllbGRDb2x1bW47XG4gICAgICAgIHByb3BzLmFsaWFzQ29sdW1uICAgPSBmaWVsZENvbHVtbjtcbiAgICB9XG4gICAgcmV0dXJuIHByb3BzO1xufTtcblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHMjZ2V0RGlzdGluY3RWYWx1ZXNcbiAqIEBtZXRob2RPZiB3bS53aWRnZXRzLmxpdmUuTGl2ZVdpZGdldFV0aWxzXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFJldHVybnMgdGhlIGRpc3RpbmN0IHZhbHVlcyBmb3IgYSBmaWVsZFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBmb3JtRmllbGQgZGVmaW5pdGlvbiBvZiB0aGUgY29sdW1uLyBmaWVsZFxuICogQHBhcmFtIHtzdHJpbmd9IHdpZGdldCB3aWRnZXQgcHJvcGVydHkgb24gdGhlIGZpZWxkXG4gKiBAcGFyYW0ge29iamVjdH0gdmFyaWFibGUgdmFyaWFibGUgZm9yIHRoZSB3aWRnZXRcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxCYWNrIEZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGFmdGVyIGZldGNoaW5nIHJlc3VsdHNcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREaXN0aW5jdFZhbHVlcyhkYXRhU291cmNlLCBmb3JtRmllbGQsIHdpZGdldCkge1xuICAgIGxldCBwcm9wcztcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgICAgaWYgKGlzRGF0YVNldFdpZGdldChmb3JtRmllbGRbd2lkZ2V0XSkgJiYgKCFmb3JtRmllbGQuaXNEYXRhU2V0Qm91bmQgfHwgd2lkZ2V0ID09PSAnZmlsdGVyd2lkZ2V0JykpIHtcbiAgICAgICAgICAgIHByb3BzID0gZ2V0RGlzdGluY3RGaWVsZFByb3BlcnRpZXMoZGF0YVNvdXJjZSwgZm9ybUZpZWxkKTtcbiAgICAgICAgICAgIGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfRElTVElOQ1RfREFUQV9CWV9GSUVMRFMsIHtcbiAgICAgICAgICAgICAgICBmaWVsZHM6IHByb3BzLmRpc3RpbmN0RmllbGQsXG4gICAgICAgICAgICAgICAgZW50aXR5TmFtZTogcHJvcHMudGFibGVOYW1lLFxuICAgICAgICAgICAgICAgIHBhZ2VzaXplOiBmb3JtRmllbGQubGltaXQsXG4gICAgICAgICAgICAgICAgZmlsdGVyRXhwcjogZm9ybUZpZWxkLmZpbHRlcmV4cHJlc3Npb25zID8gSlNPTi5wYXJzZShmb3JtRmllbGQuZmlsdGVyZXhwcmVzc2lvbnMpIDoge31cbiAgICAgICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJlcyh7J2ZpZWxkJzogZm9ybUZpZWxkLCAnZGF0YSc6IHJlc3BvbnNlLmRhdGEsICdhbGlhc0NvbHVtbic6IHByb3BzLmFsaWFzQ29sdW1ufSk7XG4gICAgICAgICAgICB9LCByZWopO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8vIFNldCB0aGUgZGF0YSBmaWVsZCBwcm9wZXJ0aWVzIG9uIGRhdGFzZXQgd2lkZ2V0c1xuZnVuY3Rpb24gc2V0RGF0YUZpZWxkcyhmb3JtRmllbGQsIG9wdGlvbnM/KSB7XG4gICAgLy8gRm9yIHNlYXJjaCB3aWRnZXQsIHNldCBzZWFyY2gga2V5IGFuZCBkaXNwbGF5IGxhYmVsXG4gICAgaWYgKGlzU2VhcmNoV2lkZ2V0VHlwZShmb3JtRmllbGRbb3B0aW9ucy53aWRnZXRdKSkge1xuICAgICAgICBmb3JtRmllbGQuZGF0YWZpZWxkID0gb3B0aW9ucy5hbGlhc0NvbHVtbiB8fCBMSVZFX0NPTlNUQU5UUy5MQUJFTF9LRVk7XG4gICAgICAgIGZvcm1GaWVsZC5zZWFyY2hrZXkgPSBvcHRpb25zLmRpc3RpbmN0RmllbGQgfHwgTElWRV9DT05TVEFOVFMuTEFCRUxfS0VZO1xuICAgICAgICBmb3JtRmllbGQuZGlzcGxheWxhYmVsID0gZm9ybUZpZWxkLmRpc3BsYXlmaWVsZCA9IChvcHRpb25zLmFsaWFzQ29sdW1uIHx8IExJVkVfQ09OU1RBTlRTLkxBQkVMX1ZBTFVFKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3JtRmllbGQuZGF0YWZpZWxkICAgID0gTElWRV9DT05TVEFOVFMuTEFCRUxfS0VZO1xuICAgIGZvcm1GaWVsZC5kaXNwbGF5ZmllbGQgPSBMSVZFX0NPTlNUQU5UUy5MQUJFTF9WQUxVRTtcbn1cblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHMjc2V0RmllbGREYXRhU2V0XG4gKiBAbWV0aG9kT2Ygd20ud2lkZ2V0cy5saXZlLkxpdmVXaWRnZXRVdGlsc1xuICogQGZ1bmN0aW9uXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBGdW5jdGlvbiB0byBzZXQgdGhlIGRhdGFTZXQgb24gdGhlIGZpZWxkc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBmb3JtRmllbGQgZGVmaW5pdGlvbiBvZiB0aGUgY29sdW1uLyBmaWVsZFxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgZGF0YSByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhbGlhc0NvbHVtbiBjb2x1bW4gZmllbGQgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IHdpZGdldCB3aWRnZXQgcHJvcGVydHkgb24gdGhlIGZpZWxkXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzRW5hYmxlRW1wdHlGaWx0ZXIgaXMgbnVsbCBvciBlbXB0eSB2YWx1ZXMgYWxsb3dlZCBvbiBmaWx0ZXJcbiAqXG4gKi9cbmZ1bmN0aW9uIHNldEZpZWxkRGF0YVNldChmb3JtRmllbGQsIGRhdGEsIG9wdGlvbnM/KSB7XG4gICAgY29uc3QgZW1wdHlTdXBwb3J0V2lkZ2V0cyA9IFtGb3JtV2lkZ2V0VHlwZS5TRUxFQ1QsIEZvcm1XaWRnZXRUeXBlLlJBRElPU0VUXTtcbiAgICBjb25zdCBlbXB0eU9wdGlvbiAgICAgICAgID0ge307XG4gICAgY29uc3QgZGF0YVNldCA9IFtdO1xuICAgIGlmIChvcHRpb25zLmlzRW5hYmxlRW1wdHlGaWx0ZXIgJiYgXy5pbmNsdWRlcyhlbXB0eVN1cHBvcnRXaWRnZXRzLCBmb3JtRmllbGRbb3B0aW9ucy53aWRnZXRdKSAmJlxuICAgICAgICAhZm9ybUZpZWxkWydpcy1yYW5nZSddICYmICFmb3JtRmllbGQubXVsdGlwbGUpIHtcbiAgICAgICAgLy8gSWYgZW1wdHkgb3B0aW9uIGlzIHNlbGVjdGVkLCBwdXNoIGFuIGVtcHR5IG9iamVjdCBpbiB0byBkYXRhU2V0XG4gICAgICAgIGVtcHR5T3B0aW9uW0xJVkVfQ09OU1RBTlRTLkxBQkVMX0tFWV0gICA9IExJVkVfQ09OU1RBTlRTLkVNUFRZX0tFWTtcbiAgICAgICAgZW1wdHlPcHRpb25bTElWRV9DT05TVEFOVFMuTEFCRUxfVkFMVUVdID0gb3B0aW9ucy5FTVBUWV9WQUxVRSB8fCBMSVZFX0NPTlNUQU5UUy5FTVBUWV9WQUxVRTtcbiAgICAgICAgZGF0YVNldC5wdXNoKGVtcHR5T3B0aW9uKTtcbiAgICB9XG4gICAgXy5lYWNoKGRhdGEsIGtleSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlICA9IGtleVtvcHRpb25zLmFsaWFzQ29sdW1uXTtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0ge307XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gJycpIHtcbiAgICAgICAgICAgIG9wdGlvbltMSVZFX0NPTlNUQU5UUy5MQUJFTF9LRVldICAgPSB2YWx1ZTtcbiAgICAgICAgICAgIG9wdGlvbltMSVZFX0NPTlNUQU5UUy5MQUJFTF9WQUxVRV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIGRhdGFTZXQucHVzaChvcHRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgc2V0RGF0YUZpZWxkcyhmb3JtRmllbGQsIG9wdGlvbnMpO1xuICAgIGZvcm1GaWVsZC5kYXRhc2V0ID0gZGF0YVNldDtcbn1cblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHMjZmV0Y2hEaXN0aW5jdFZhbHVlc1xuICogQG1ldGhvZE9mIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHNcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogRnVuY3Rpb24gdG8gZmV0Y2ggdGhlIGRpc3RpbmN0IHZhbHVlcyBmb3IgYSBmaWVsZFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBzY29wZSBzY29wZSBvZiB0aGUgd2lkZ2V0XG4gKiBAcGFyYW0ge29iamVjdH0gZm9ybUZpZWxkcyBkZWZpbml0aW9ucyBvZiB0aGUgY29sdW1uLyBmaWVsZFxuICogQHBhcmFtIHtzdHJpbmd9IHdpZGdldCB3aWRnZXQgcHJvcGVydHkgb24gdGhlIGZpZWxkXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzRW5hYmxlRW1wdHlGaWx0ZXIgaXMgbnVsbCBvciBlbXB0eSB2YWx1ZXMgYWxsb3dlZCBvbiBmaWx0ZXJcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmZXRjaERpc3RpbmN0VmFsdWVzKGRhdGFTb3VyY2UsIGZvcm1GaWVsZHMsIG9wdGlvbnMpIHtcbiAgICBpZiAoXy5pc0VtcHR5KGZvcm1GaWVsZHMpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9ybUZpZWxkcy5mb3JFYWNoKGZvcm1GaWVsZCA9PiB7XG4gICAgICAgIGdldERpc3RpbmN0VmFsdWVzRm9yRmllbGQoZGF0YVNvdXJjZSwgZm9ybUZpZWxkLCBvcHRpb25zKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHMjZ2V0RGlzdGluY3RWYWx1ZXNGb3JGaWVsZFxuICogQG1ldGhvZE9mIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHNcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogRnVuY3Rpb24gdG8gZmV0Y2ggdGhlIGRpc3RpbmN0IHZhbHVlcyBmb3IgYSBmaWVsZFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBzY29wZSBzY29wZSBvZiB0aGUgd2lkZ2V0XG4gKiBAcGFyYW0ge29iamVjdH0gZm9ybUZpZWxkcyBkZWZpbml0aW9ucyBvZiB0aGUgY29sdW1uLyBmaWVsZFxuICogQHBhcmFtIHtzdHJpbmd9IHdpZGdldCB3aWRnZXQgcHJvcGVydHkgb24gdGhlIGZpZWxkXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzRW5hYmxlRW1wdHlGaWx0ZXIgaXMgbnVsbCBvciBlbXB0eSB2YWx1ZXMgYWxsb3dlZCBvbiBmaWx0ZXJcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREaXN0aW5jdFZhbHVlc0ZvckZpZWxkKGRhdGFTb3VyY2UsIGZvcm1GaWVsZCwgb3B0aW9ucz8pIHtcbiAgICBpZiAoIWRhdGFTb3VyY2UgfHwgIWZvcm1GaWVsZCB8fCBmb3JtRmllbGQuaXNEYXRhU2V0Qm91bmQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXNTZWFyY2hXaWRnZXRUeXBlKGZvcm1GaWVsZFtvcHRpb25zLndpZGdldF0pKSB7XG4gICAgICAgIGNvbnN0IGRhdGFvcHRpb25zID0gIGdldERpc3RpbmN0RmllbGRQcm9wZXJ0aWVzKGRhdGFTb3VyY2UsIGZvcm1GaWVsZCk7XG4gICAgICAgIGZvcm1GaWVsZC5kYXRhb3B0aW9ucyA9IGRhdGFvcHRpb25zO1xuICAgICAgICBzZXREYXRhRmllbGRzKGZvcm1GaWVsZCwgT2JqZWN0LmFzc2lnbihvcHRpb25zIHx8IHt9LCBkYXRhb3B0aW9ucykpO1xuICAgICAgICBmb3JtRmllbGQuZGF0YXNvdXJjZSA9IGRhdGFTb3VyY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW50ZXJwb2xhdGVCaW5kRXhwcmVzc2lvbnMoZm9ybUZpZWxkLnZpZXdQYXJlbnQsIGZvcm1GaWVsZC5maWx0ZXJleHByZXNzaW9ucywgKGZpbHRlcmV4cHJlc3Npb25zKSA9PiB7XG4gICAgICAgICAgICBmb3JtRmllbGQuZmlsdGVyZXhwcmVzc2lvbnMgPSBmaWx0ZXJleHByZXNzaW9ucztcbiAgICAgICAgICAgIGdldERpc3RpbmN0VmFsdWVzKGRhdGFTb3VyY2UsIGZvcm1GaWVsZCwgb3B0aW9ucy53aWRnZXQpLnRoZW4oKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0RmllbGREYXRhU2V0KHJlcy5maWVsZCwgcmVzLmRhdGEsIHtcbiAgICAgICAgICAgICAgICAgICAgYWxpYXNDb2x1bW46IHJlcy5hbGlhc0NvbHVtbixcbiAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBvcHRpb25zLndpZGdldCxcbiAgICAgICAgICAgICAgICAgICAgaXNFbmFibGVFbXB0eUZpbHRlcjogZ2V0RW5hYmxlRW1wdHlGaWx0ZXIob3B0aW9ucy5lbmFibGVlbXB0eWZpbHRlciksXG4gICAgICAgICAgICAgICAgICAgIEVNUFRZX1ZBTFVFOiBvcHRpb25zLkVNUFRZX1ZBTFVFXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc0RlZmluZWRBbmROb3RFbXB0eSh2YWwpIHtcbiAgICByZXR1cm4gaXNEZWZpbmVkKHZhbCkgJiYgdmFsICE9PSAnJyAmJiB2YWwgIT09IG51bGw7XG59XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB3bS53aWRnZXRzLmxpdmUuZ2V0UmFuZ2VGaWVsZFZhbHVlXG4gKiBAbWV0aG9kT2Ygd20ud2lkZ2V0cy5saXZlLkxpdmVXaWRnZXRVdGlsc1xuICogQGZ1bmN0aW9uXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBGdW5jdGlvbiB0byBnZXQgdGhlIGZpZWxkIHZhbHVlIGZvciByYW5nZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtaW5WYWx1ZSBtaW4gdmFsdWUgc2VsZWN0ZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBtYXhWYWx1ZSBtYXggdmFsdWUgc2VsZWN0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmdlRmllbGRWYWx1ZShtaW5WYWx1ZSwgbWF4VmFsdWUpIHtcbiAgICBsZXQgZmllbGRWYWx1ZTtcbiAgICBpZiAoaXNEZWZpbmVkQW5kTm90RW1wdHkobWluVmFsdWUpICYmIGlzRGVmaW5lZEFuZE5vdEVtcHR5KG1heFZhbHVlKSkge1xuICAgICAgICBmaWVsZFZhbHVlID0gW21pblZhbHVlLCBtYXhWYWx1ZV07XG4gICAgfSBlbHNlIGlmIChpc0RlZmluZWRBbmROb3RFbXB0eShtaW5WYWx1ZSkpIHtcbiAgICAgICAgZmllbGRWYWx1ZSA9IG1pblZhbHVlO1xuICAgIH0gZWxzZSBpZiAoaXNEZWZpbmVkQW5kTm90RW1wdHkobWF4VmFsdWUpKSB7XG4gICAgICAgIGZpZWxkVmFsdWUgPSBtYXhWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZpZWxkVmFsdWU7XG59XG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgd20ud2lkZ2V0cy5saXZlLmdldFJhbmdlTWF0Y2hNb2RlXG4gKiBAbWV0aG9kT2Ygd20ud2lkZ2V0cy5saXZlLkxpdmVXaWRnZXRVdGlsc1xuICogQGZ1bmN0aW9uXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBGdW5jdGlvbiB0byBnZXQgdGhlIG1hdGNoIG1vZGUgZm9yIHJhbmdlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1pblZhbHVlIG1pbiB2YWx1ZSBzZWxlY3RlZFxuICogQHBhcmFtIHtzdHJpbmd9IG1heFZhbHVlIG1heCB2YWx1ZSBzZWxlY3RlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmFuZ2VNYXRjaE1vZGUobWluVmFsdWUsIG1heFZhbHVlKSB7XG4gICAgbGV0IG1hdGNoTW9kZTtcbiAgICAvLyBJZiB0d28gdmFsdWVzIGV4aXN0cywgdGhlbiBpdCBpcyBiZXR3ZWVuLiBPdGhlcndpc2UsIGdyZWF0ZXIgb3IgbGVzc2VyXG4gICAgaWYgKGlzRGVmaW5lZEFuZE5vdEVtcHR5KG1pblZhbHVlKSAmJiBpc0RlZmluZWRBbmROb3RFbXB0eShtYXhWYWx1ZSkpIHtcbiAgICAgICAgbWF0Y2hNb2RlID0gTWF0Y2hNb2RlLkJFVFdFRU47XG4gICAgfSBlbHNlIGlmIChpc0RlZmluZWRBbmROb3RFbXB0eShtaW5WYWx1ZSkpIHtcbiAgICAgICAgbWF0Y2hNb2RlID0gTWF0Y2hNb2RlLkdSRUFURVI7XG4gICAgfSBlbHNlIGlmIChpc0RlZmluZWRBbmROb3RFbXB0eShtYXhWYWx1ZSkpIHtcbiAgICAgICAgbWF0Y2hNb2RlID0gTWF0Y2hNb2RlLkxFU1NFUjtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoTW9kZTtcbn1cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB3bS53aWRnZXRzLmxpdmUuZ2V0RW5hYmxlRW1wdHlGaWx0ZXJcbiAqIEBtZXRob2RPZiB3bS53aWRnZXRzLmxpdmUuTGl2ZVdpZGdldFV0aWxzXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRoaXMgZnVuY3Rpb24gY2hlY2tzIGlmIGVuYWJsZSBmaWx0ZXIgb3B0aW9ucyBpcyBzZXQgb24gbGl2ZSBmaWx0ZXJcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gZW5hYmxlZW1wdHlmaWx0ZXIgZW1wdHkgZmlsdGVyIG9wdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVuYWJsZUVtcHR5RmlsdGVyKGVuYWJsZWVtcHR5ZmlsdGVyKSB7XG4gICAgcmV0dXJuIGVuYWJsZWVtcHR5ZmlsdGVyICYmIF8uaW50ZXJzZWN0aW9uKGVuYWJsZWVtcHR5ZmlsdGVyLnNwbGl0KCcsJyksIExJVkVfQ09OU1RBTlRTLk5VTExfRU1QVFkpLmxlbmd0aCA+IDA7XG59XG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgd20ud2lkZ2V0cy5saXZlLmdldEVtcHR5TWF0Y2hNb2RlXG4gKiBAbWV0aG9kT2Ygd20ud2lkZ2V0cy5saXZlLkxpdmVXaWRnZXRVdGlsc1xuICogQGZ1bmN0aW9uXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBGdW5jdGlvbiB0byBnZXQgdGhlIG1hdGNoIG1vZGUgYmFzZWQgb24gdGhlIGZpbHRlciBzZWxlY3RlZFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBlbmFibGVlbXB0eWZpbHRlciBlbXB0eSBmaWx0ZXIgb3B0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW1wdHlNYXRjaE1vZGUoZW5hYmxlZW1wdHlmaWx0ZXIpIHtcbiAgICBsZXQgbWF0Y2hNb2RlO1xuICAgIGNvbnN0IGVtcHR5RmlsdGVyT3B0aW9ucyA9IF8uc3BsaXQoZW5hYmxlZW1wdHlmaWx0ZXIsICcsJyk7XG4gICAgaWYgKF8uaW50ZXJzZWN0aW9uKGVtcHR5RmlsdGVyT3B0aW9ucywgTElWRV9DT05TVEFOVFMuTlVMTF9FTVBUWSkubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIG1hdGNoTW9kZSA9IE1hdGNoTW9kZS5OVUxMT1JFTVBUWTtcbiAgICB9IGVsc2UgaWYgKF8uaW5jbHVkZXMoZW1wdHlGaWx0ZXJPcHRpb25zLCBMSVZFX0NPTlNUQU5UUy5OVUxMKSkge1xuICAgICAgICBtYXRjaE1vZGUgPSBNYXRjaE1vZGUuTlVMTDtcbiAgICB9IGVsc2UgaWYgKF8uaW5jbHVkZXMoZW1wdHlGaWx0ZXJPcHRpb25zLCBMSVZFX0NPTlNUQU5UUy5FTVBUWSkpIHtcbiAgICAgICAgbWF0Y2hNb2RlID0gTWF0Y2hNb2RlLkVNUFRZO1xuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hNb2RlO1xufVxuXG4vKipcbiAqIGNvbnZlcnRzIHRoZSBkYXRhIHBhc3NlZCB0byBhcnJheS5cbiAqICAtPiBBcnJheTogWzEsMiwzXSAtIFsxLDIsM11cbiAqICAtPiBTdHJpbmc6IGEsYixjIC0gWydhJywnYicsJ2MnXVxuICogIC0+IG9iamVjdDoge2E6MX0gLSBbe2E6MX1dXG4gKiAgLT4gbnVsbCAtIFtdXG4gKiAgLT4gdW5kZWZpbmVkIC0gW11cbiAqIEBwYXJhbSBkYXRhXG4gKiBAcmV0dXJucyB7QXJyYXk8YW55Pn1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUFycmF5RnJvbSA9IChkYXRhKTogQXJyYXk8YW55PiA9PiB7XG5cbiAgICBpZiAoXy5pc1VuZGVmaW5lZChkYXRhKSB8fCBfLmlzTnVsbChkYXRhKSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgaWYgKF8uaXNTdHJpbmcoZGF0YSkpIHtcbiAgICAgICAgZGF0YSA9IGRhdGEuc3BsaXQoJywnKS5tYXAoRnVuY3Rpb24ucHJvdG90eXBlLmNhbGwsIFN0cmluZy5wcm90b3R5cGUudHJpbSk7XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbn07XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB3bS53aWRnZXRzLmxpdmUuYXBwbHlGaWx0ZXJPbkZpZWxkXG4gKiBAbWV0aG9kT2Ygd20ud2lkZ2V0cy5saXZlLkxpdmVXaWRnZXRVdGlsc1xuICogQGZ1bmN0aW9uXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBGdW5jdGlvbiB0byBnZXQgdGhlIHVwZGF0ZWQgdmFsdWVzIHdoZW4gZmlsdGVyIG9uIGZpZWxkIGlzIGNoYW5nZWRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gJHNjb3BlIHNjb3BlIG9mIHRoZSBmaWx0ZXIgZmllbGQvZm9ybSBmaWVsZFxuICogQHBhcmFtIHtvYmplY3R9IGZpbHRlckRlZiBmaWx0ZXIvZm9ybSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZFxuICogQHBhcmFtIHtib29sZWFufSBpc0ZpcnN0IGJvb2xlYW4gdmFsdWUgdG8gY2hlY2sgaWYgdGhpcyBtZXRob2QgaXMgY2FsbGVkIG9uIGxvYWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5RmlsdGVyT25GaWVsZChkYXRhU291cmNlLCBmaWx0ZXJEZWYsIGZvcm1GaWVsZHMsIG5ld1ZhbCwgb3B0aW9uczogYW55ID0ge30pIHtcbiAgICBjb25zdCBmaWVsZE5hbWUgICAgICA9IGZpbHRlckRlZi5maWVsZCB8fCBmaWx0ZXJEZWYua2V5O1xuICAgIGNvbnN0IGZpbHRlck9uRmllbGRzID0gXy5maWx0ZXIoZm9ybUZpZWxkcywgeydmaWx0ZXItb24nOiBmaWVsZE5hbWV9KTtcblxuICAgIG5ld1ZhbCA9IGZpbHRlckRlZlsnaXMtcmFuZ2UnXSA/IGdldFJhbmdlRmllbGRWYWx1ZShmaWx0ZXJEZWYubWluVmFsdWUsIGZpbHRlckRlZi5tYXhWYWx1ZSkgOiAoaXNEZWZpbmVkKG5ld1ZhbCkgPyBuZXdWYWwgOiBmaWx0ZXJEZWYudmFsdWUpO1xuICAgIGlmICghZGF0YVNvdXJjZSB8fCAob3B0aW9ucy5pc0ZpcnN0ICYmIChfLmlzVW5kZWZpbmVkKG5ld1ZhbCkgfHwgbmV3VmFsID09PSAnJykpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gTG9vcCBvdmVyIHRoZSBmaWVsZHMgZm9yIHdoaWNoIHRoZSBjdXJyZW50IGZpZWxkIGlzIGZpbHRlciBvbiBmaWVsZFxuICAgIF8uZm9yRWFjaChmaWx0ZXJPbkZpZWxkcywgZmlsdGVyRmllbGQgPT4ge1xuICAgICAgICBjb25zdCBmaWx0ZXJLZXkgICAgPSBmaWx0ZXJGaWVsZC5maWVsZCB8fCBmaWx0ZXJGaWVsZC5rZXk7XG4gICAgICAgIGNvbnN0IGxvb2tVcEZpZWxkICA9IGZpbHRlckRlZlsnbG9va3VwLWZpZWxkJ10gfHwgZmlsdGVyRGVmLl9wcmltYXJ5S2V5O1xuICAgICAgICBjb25zdCBmaWx0ZXJXaWRnZXQgPSBmaWx0ZXJGaWVsZFsnZWRpdC13aWRnZXQtdHlwZSddIHx8IGZpbHRlckZpZWxkLndpZGdldHR5cGU7XG4gICAgICAgIGxldCBmaWx0ZXJGaWVsZHMgPSB7fTtcbiAgICAgICAgbGV0IGZpbHRlck9uICAgICA9IGZpbHRlckZpZWxkWydmaWx0ZXItb24nXTtcbiAgICAgICAgbGV0IGZpbHRlclZhbDtcbiAgICAgICAgbGV0IGZpZWxkQ29sdW1uO1xuICAgICAgICBsZXQgbWF0Y2hNb2RlO1xuICAgICAgICBpZiAoIWlzRGF0YVNldFdpZGdldChmaWx0ZXJXaWRnZXQpIHx8IGZpbHRlckZpZWxkLmlzRGF0YVNldEJvdW5kIHx8IGZpbHRlck9uID09PSBmaWx0ZXJLZXkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBGb3IgcmVsYXRlZCBmaWVsZHMsIGFkZCBsb29rdXBmaWVsZCBmb3IgcXVlcnkgZ2VuZXJhdGlvblxuICAgICAgICBpZiAoZmlsdGVyRGVmICYmIGZpbHRlckRlZlsnaXMtcmVsYXRlZCddKSB7XG4gICAgICAgICAgICBmaWx0ZXJPbiArPSAnLicgKyAgbG9va1VwRmllbGQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRGVmaW5lZChuZXdWYWwpKSB7XG4gICAgICAgICAgICBpZiAoZmlsdGVyRGVmWydpcy1yYW5nZSddKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2hNb2RlID0gZ2V0UmFuZ2VNYXRjaE1vZGUoZmlsdGVyRGVmLm1pblZhbHVlLCBmaWx0ZXJEZWYubWF4VmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChnZXRFbmFibGVFbXB0eUZpbHRlcihvcHRpb25zLmVuYWJsZWVtcHR5ZmlsdGVyKSAmJiBuZXdWYWwgPT09IExJVkVfQ09OU1RBTlRTLkVNUFRZX0tFWSkge1xuICAgICAgICAgICAgICAgIG1hdGNoTW9kZSA9IGdldEVtcHR5TWF0Y2hNb2RlKG9wdGlvbnMuZW5hYmxlZW1wdHlmaWx0ZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtYXRjaE1vZGUgPSBNYXRjaE1vZGUuRVFVQUxTO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsdGVyVmFsID0gKF8uaXNPYmplY3QobmV3VmFsKSAmJiAhXy5pc0FycmF5KG5ld1ZhbCkpID8gbmV3VmFsW2xvb2tVcEZpZWxkXSA6IG5ld1ZhbDtcbiAgICAgICAgICAgIGZpbHRlckZpZWxkc1tmaWx0ZXJPbl0gPSB7XG4gICAgICAgICAgICAgICAgJ3ZhbHVlJyAgICAgOiBmaWx0ZXJWYWwsXG4gICAgICAgICAgICAgICAgJ21hdGNoTW9kZScgOiBtYXRjaE1vZGVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWx0ZXJGaWVsZHMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBmaWVsZENvbHVtbiA9IGZpbHRlcktleTtcblxuICAgICAgICBpZiAoaXNTZWFyY2hXaWRnZXRUeXBlKGZpbHRlcldpZGdldCkgJiYgZmlsdGVyRmllbGQuZGF0YW9wdGlvbnMpIHtcbiAgICAgICAgICAgIGZpbHRlckZpZWxkLmRhdGFvcHRpb25zLmZpbHRlckZpZWxkcyA9IGZpbHRlckZpZWxkcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfRElTVElOQ1RfREFUQV9CWV9GSUVMRFMsIHtcbiAgICAgICAgICAgICAgICAnZmllbGRzJyAgICAgICAgOiBmaWVsZENvbHVtbixcbiAgICAgICAgICAgICAgICAnZmlsdGVyRmllbGRzJyAgOiBmaWx0ZXJGaWVsZHMsXG4gICAgICAgICAgICAgICAgJ3BhZ2VzaXplJyAgICAgIDogZmlsdGVyRmllbGQubGltaXRcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHNldEZpZWxkRGF0YVNldChmaWx0ZXJGaWVsZCwgcmVzcG9uc2UuZGF0YSwge1xuICAgICAgICAgICAgICAgICAgICBhbGlhc0NvbHVtbjogZmllbGRDb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgIHdpZGdldDogb3B0aW9ucy53aWRnZXQgfHwgJ3dpZGdldHR5cGUnLFxuICAgICAgICAgICAgICAgICAgICBpc0VuYWJsZUVtcHR5RmlsdGVyOiBnZXRFbmFibGVFbXB0eUZpbHRlcihvcHRpb25zLmVuYWJsZWVtcHR5ZmlsdGVyKSxcbiAgICAgICAgICAgICAgICAgICAgRU1QVFlfVkFMVUU6IG9wdGlvbnMuRU1QVFlfVkFMVUVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIG5vb3ApO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8vIFRyYW5zZm9ybSBkYXRhIGFzIHJlcXVpcmVkIGJ5IGRhdGEgdGFibGVcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGFPYmplY3QsIHZhcmlhYmxlTmFtZSkge1xuICAgIGxldCBuZXdPYmosXG4gICAgICAgIHRlbXBBcnIsXG4gICAgICAgIGtleXMsXG4gICAgICAgIG9sZEtleXMsXG4gICAgICAgIG51bUtleXMsXG4gICAgICAgIG5ld09iamVjdCxcbiAgICAgICAgdGVtcE9iajtcblxuICAgIC8vIGRhdGEgc2FuaXR5IHRlc3RpbmdcbiAgICBkYXRhT2JqZWN0ID0gZGF0YU9iamVjdCB8fCBbXTtcbiAgICAvLyBpZiB0aGUgZGF0YU9iamVjdCBpcyBub3QgYW4gYXJyYXkgbWFrZSBpdCBhbiBhcnJheVxuICAgIGlmICghXy5pc0FycmF5KGRhdGFPYmplY3QpKSB7XG4gICAgICAgIC8vIGlmIHRoZSBkYXRhIHJldHVybmVkIGlzIG9mIHR5cGUgc3RyaW5nLCBtYWtlIGl0IGFuIG9iamVjdCBpbnNpZGUgYW4gYXJyYXlcbiAgICAgICAgaWYgKF8uaXNTdHJpbmcoZGF0YU9iamVjdCkpIHtcbiAgICAgICAgICAgIGtleXMgPSB2YXJpYWJsZU5hbWUuc3Vic3RyaW5nKHZhcmlhYmxlTmFtZS5pbmRleE9mKCcuJykgKyAxLCB2YXJpYWJsZU5hbWUubGVuZ3RoKS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgb2xkS2V5cyA9IFtdO1xuICAgICAgICAgICAgbnVtS2V5cyA9IGtleXMubGVuZ3RoO1xuICAgICAgICAgICAgbmV3T2JqZWN0ID0ge307XG4gICAgICAgICAgICB0ZW1wT2JqID0gbmV3T2JqZWN0O1xuXG4gICAgICAgICAgICAvLyBsb29wIG92ZXIgdGhlIGtleXMgdG8gZm9ybSBhcHByb3ByaWF0ZSBkYXRhIG9iamVjdCByZXF1aXJlZCBmb3IgZ3JpZFxuICAgICAgICAgICAga2V5cy5mb3JFYWNoKChrZXksIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gbG9vcCBvdmVyIG9sZCBrZXlzIHRvIGNyZWF0ZSBuZXcgb2JqZWN0IGF0IHRoZSBpdGVyYXRpdmUgbGV2ZWxcbiAgICAgICAgICAgICAgICBvbGRLZXlzLmZvckVhY2gob2xkS2V5ICA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBPYmogPSBuZXdPYmplY3Rbb2xkS2V5XTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0ZW1wT2JqW2tleV0gPSBpbmRleCA9PT0gbnVtS2V5cyAtIDEgPyBkYXRhT2JqZWN0IDoge307XG4gICAgICAgICAgICAgICAgb2xkS2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gY2hhbmdlIHRoZSBzdHJpbmcgZGF0YSB0byB0aGUgbmV3IGRhdGFPYmplY3QgZm9ybWVkXG4gICAgICAgICAgICBkYXRhT2JqZWN0ID0gbmV3T2JqZWN0O1xuICAgICAgICB9XG4gICAgICAgIGRhdGFPYmplY3QgPSBbZGF0YU9iamVjdF07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLyppZiB0aGUgZGF0YU9iamVjdCBpcyBhbiBhcnJheSBhbmQgZWFjaCB2YWx1ZSBpcyBhIHN0cmluZywgdGhlbiBsaXRlLXRyYW5zZm9ybSB0aGUgc3RyaW5nIHRvIGFuIG9iamVjdFxuICAgICAgICAgKiBsaXRlLXRyYW5zZm9ybToganVzdCBjaGVja2luZyBpZiB0aGUgZmlyc3QgdmFsdWUgaXMgc3RyaW5nIGFuZCB0aGVuIHRyYW5zZm9ybWluZyB0aGUgb2JqZWN0LCBpbnN0ZWFkIG9mIHRyYXZlcnNpbmcgdGhyb3VnaCB0aGUgd2hvbGUgYXJyYXlcbiAgICAgICAgICogKi9cbiAgICAgICAgaWYgKF8uaXNTdHJpbmcoZGF0YU9iamVjdFswXSkpIHtcbiAgICAgICAgICAgIHRlbXBBcnIgPSBbXTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChkYXRhT2JqZWN0LCBzdHIgPT4ge1xuICAgICAgICAgICAgICAgIG5ld09iaiA9IHt9O1xuICAgICAgICAgICAgICAgIG5ld09ialt2YXJpYWJsZU5hbWUuc3BsaXQoJy4nKS5qb2luKCctJyldID0gc3RyO1xuICAgICAgICAgICAgICAgIHRlbXBBcnIucHVzaChuZXdPYmopO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkYXRhT2JqZWN0ID0gdGVtcEFycjtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YU9iamVjdDtcbn1cbiJdfQ==