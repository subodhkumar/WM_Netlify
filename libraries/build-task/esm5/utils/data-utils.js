import { DataSource, debounce, processFilterExpBindNode } from '@wm/core';
import { FormWidgetType, isDefined, MatchMode } from '@wm/core';
import { isDataSetWidget } from './widget-utils';
var noop = function () { };
var ɵ0 = noop;
export var Live_Operations;
(function (Live_Operations) {
    Live_Operations["INSERT"] = "insert";
    Live_Operations["UPDATE"] = "update";
    Live_Operations["DELETE"] = "delete";
    Live_Operations["READ"] = "read";
})(Live_Operations || (Live_Operations = {}));
export var ALLFIELDS = 'All Fields';
export var LIVE_CONSTANTS = {
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
    return new Promise(function (res, rej) {
        if (dataSource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
            var fn = void 0;
            var operationType = options.operationType;
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
            dataSource.execute(fn, requestData).then(function (response) { return onSuccess(response, res, rej); }, rej);
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
    return new Promise(function (res, rej) {
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
    var primaryKeys;
    var displayField;
    var relatedField = options.relatedField;
    var datafield = options.datafield;
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
        interpolateBindExpressions(formField.viewParent, formField.filterexpressions, function (filterexpressions) {
            formField.filterexpressions = filterexpressions;
            dataSource.execute(DataSource.Operation.GET_RELATED_TABLE_DATA, {
                relatedField: relatedField,
                pagesize: formField.limit,
                orderBy: formField.orderby ? _.replace(formField.orderby, /:/g, ' ') : '',
                filterFields: {},
                filterExpr: formField.filterexpressions ? formField.filterexpressions : {}
            }).then(function (response) {
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
export var interpolateBindExpressions = function (context, filterexpressions, callbackFn) {
    var debouncedFn = debounce(function () {
        if (_.isFunction(callbackFn)) {
            callbackFn(filterexpressions);
        }
    }, 300);
    /**
     * calling the debounced function first for the case where if there is any filterexpression without the bindedvariables.
     * without this it will never be called. processFilterExpBindNode will be called only for the binded variable expressions.
     */
    debouncedFn();
    var filterExpressions = filterexpressions ? (_.isObject(filterexpressions) ? filterexpressions : JSON.parse(filterexpressions)) : {};
    var destroyFn = context.registerDestroyListener ? context.registerDestroyListener.bind(context) : _.noop;
    var filterSubscription = processFilterExpBindNode(context, filterExpressions).subscribe(function (response) {
        filterexpressions = JSON.stringify(response.filterExpressions);
        debouncedFn();
    });
    destroyFn(function () { return filterSubscription.unsubscribe(); });
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
export var getDistinctFieldProperties = function (dataSource, formField) {
    var props = {};
    var fieldColumn;
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
    var props;
    return new Promise(function (res, rej) {
        if (isDataSetWidget(formField[widget]) && (!formField.isDataSetBound || widget === 'filterwidget')) {
            props = getDistinctFieldProperties(dataSource, formField);
            dataSource.execute(DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS, {
                fields: props.distinctField,
                entityName: props.tableName,
                pagesize: formField.limit,
                filterExpr: formField.filterexpressions ? JSON.parse(formField.filterexpressions) : {}
            }).then(function (response) {
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
    var emptySupportWidgets = [FormWidgetType.SELECT, FormWidgetType.RADIOSET];
    var emptyOption = {};
    var dataSet = [];
    if (options.isEnableEmptyFilter && _.includes(emptySupportWidgets, formField[options.widget]) &&
        !formField['is-range'] && !formField.multiple) {
        // If empty option is selected, push an empty object in to dataSet
        emptyOption[LIVE_CONSTANTS.LABEL_KEY] = LIVE_CONSTANTS.EMPTY_KEY;
        emptyOption[LIVE_CONSTANTS.LABEL_VALUE] = options.EMPTY_VALUE || LIVE_CONSTANTS.EMPTY_VALUE;
        dataSet.push(emptyOption);
    }
    _.each(data, function (key) {
        var value = key[options.aliasColumn];
        var option = {};
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
    formFields.forEach(function (formField) {
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
        var dataoptions = getDistinctFieldProperties(dataSource, formField);
        formField.dataoptions = dataoptions;
        setDataFields(formField, Object.assign(options || {}, dataoptions));
        formField.datasource = dataSource;
    }
    else {
        interpolateBindExpressions(formField.viewParent, formField.filterexpressions, function (filterexpressions) {
            formField.filterexpressions = filterexpressions;
            getDistinctValues(dataSource, formField, options.widget).then(function (res) {
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
    var fieldValue;
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
    var matchMode;
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
    var matchMode;
    var emptyFilterOptions = _.split(enableemptyfilter, ',');
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
export var createArrayFrom = function (data) {
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
export function applyFilterOnField(dataSource, filterDef, formFields, newVal, options) {
    if (options === void 0) { options = {}; }
    var fieldName = filterDef.field || filterDef.key;
    var filterOnFields = _.filter(formFields, { 'filter-on': fieldName });
    newVal = filterDef['is-range'] ? getRangeFieldValue(filterDef.minValue, filterDef.maxValue) : (isDefined(newVal) ? newVal : filterDef.value);
    if (!dataSource || (options.isFirst && (_.isUndefined(newVal) || newVal === ''))) {
        return;
    }
    // Loop over the fields for which the current field is filter on field
    _.forEach(filterOnFields, function (filterField) {
        var filterKey = filterField.field || filterField.key;
        var lookUpField = filterDef['lookup-field'] || filterDef._primaryKey;
        var filterWidget = filterField['edit-widget-type'] || filterField.widgettype;
        var filterFields = {};
        var filterOn = filterField['filter-on'];
        var filterVal;
        var fieldColumn;
        var matchMode;
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
            }).then(function (response) {
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
    var newObj, tempArr, keys, oldKeys, numKeys, newObject, tempObj;
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
            keys.forEach(function (key, index) {
                // loop over old keys to create new object at the iterative level
                oldKeys.forEach(function (oldKey) {
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
            _.forEach(dataObject, function (str) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS11dGlscy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsidXRpbHMvZGF0YS11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSx3QkFBd0IsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUMxRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFaEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBSWpELElBQU0sSUFBSSxHQUFHLGNBQU8sQ0FBQyxDQUFDOztBQUV0QixNQUFNLENBQU4sSUFBWSxlQUtYO0FBTEQsV0FBWSxlQUFlO0lBQ3ZCLG9DQUFpQixDQUFBO0lBQ2pCLG9DQUFpQixDQUFBO0lBQ2pCLG9DQUFpQixDQUFBO0lBQ2pCLGdDQUFhLENBQUE7QUFDakIsQ0FBQyxFQUxXLGVBQWUsS0FBZixlQUFlLFFBSzFCO0FBRUQsTUFBTSxDQUFDLElBQU0sU0FBUyxHQUFHLFlBQVksQ0FBQztBQUV0QyxNQUFNLENBQUMsSUFBTSxjQUFjLEdBQUc7SUFDMUIsV0FBVyxFQUFPLG1CQUFtQjtJQUNyQyxhQUFhLEVBQUssVUFBVTtJQUM1QixXQUFXLEVBQU8sS0FBSztJQUN2QixhQUFhLEVBQUssT0FBTztJQUN6QixZQUFZLEVBQU0sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO0lBQ25DLE1BQU0sRUFBWSxNQUFNO0lBQ3hCLE9BQU8sRUFBVyxPQUFPO0NBQzVCLENBQUM7QUFFRixrREFBa0Q7QUFDbEQsU0FBUyxrQkFBa0IsQ0FBQyxNQUFNO0lBQzlCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDN0csQ0FBQztB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YVNvdXJjZSwgZGVib3VuY2UsIHByb2Nlc3NGaWx0ZXJFeHBCaW5kTm9kZSB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IEZvcm1XaWRnZXRUeXBlLCBpc0RlZmluZWQsIE1hdGNoTW9kZSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgaXNEYXRhU2V0V2lkZ2V0IH0gZnJvbSAnLi93aWRnZXQtdXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IG5vb3AgPSAoKSA9PiB7fTtcblxuZXhwb3J0IGVudW0gTGl2ZV9PcGVyYXRpb25zIHtcbiAgICBJTlNFUlQgPSAnaW5zZXJ0JyxcbiAgICBVUERBVEUgPSAndXBkYXRlJyxcbiAgICBERUxFVEUgPSAnZGVsZXRlJyxcbiAgICBSRUFEID0gJ3JlYWQnXG59XG5cbmV4cG9ydCBjb25zdCBBTExGSUVMRFMgPSAnQWxsIEZpZWxkcyc7XG5cbmV4cG9ydCBjb25zdCBMSVZFX0NPTlNUQU5UUyA9IHtcbiAgICAnRU1QVFlfS0VZJyAgICAgOiAnRU1QVFlfTlVMTF9GSUxURVInLFxuICAgICdFTVBUWV9WQUxVRScgICA6ICdObyBWYWx1ZScsXG4gICAgJ0xBQkVMX0tFWScgICAgIDogJ2tleScsXG4gICAgJ0xBQkVMX1ZBTFVFJyAgIDogJ3ZhbHVlJyxcbiAgICAnTlVMTF9FTVBUWScgICAgOiBbJ251bGwnLCAnZW1wdHknXSxcbiAgICAnTlVMTCcgICAgICAgICAgOiAnbnVsbCcsXG4gICAgJ0VNUFRZJyAgICAgICAgIDogJ2VtcHR5J1xufTtcblxuLy8gUmV0dXJucyB0cnVlIGlmIHdpZGdldCBpcyBhdXRvY29tcGxldGUgb3IgY2hpcHNcbmZ1bmN0aW9uIGlzU2VhcmNoV2lkZ2V0VHlwZSh3aWRnZXQpIHtcbiAgICByZXR1cm4gXy5pbmNsdWRlcyhbRm9ybVdpZGdldFR5cGUuQVVUT0NPTVBMRVRFLCBGb3JtV2lkZ2V0VHlwZS5UWVBFQUhFQUQsIEZvcm1XaWRnZXRUeXBlLkNISVBTXSwgd2lkZ2V0KTtcbn1cblxuZnVuY3Rpb24gb25TdWNjZXNzKHJlc3BvbnNlLCByZXMsIHJlaikge1xuICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgICByZWoocmVzcG9uc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcyhyZXNwb25zZSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGVyZm9ybURhdGFPcGVyYXRpb24oZGF0YVNvdXJjZSwgcmVxdWVzdERhdGEsIG9wdGlvbnMpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgICAgaWYgKGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5TVVBQT1JUU19DUlVEKSkge1xuICAgICAgICAgICAgbGV0IGZuO1xuICAgICAgICAgICAgY29uc3Qgb3BlcmF0aW9uVHlwZSA9IG9wdGlvbnMub3BlcmF0aW9uVHlwZTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BlcmF0aW9uVHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgTGl2ZV9PcGVyYXRpb25zLlVQREFURTpcbiAgICAgICAgICAgICAgICAgICAgZm4gPSBEYXRhU291cmNlLk9wZXJhdGlvbi5VUERBVEVfUkVDT1JEO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIExpdmVfT3BlcmF0aW9ucy5JTlNFUlQ6XG4gICAgICAgICAgICAgICAgICAgIGZuID0gRGF0YVNvdXJjZS5PcGVyYXRpb24uSU5TRVJUX1JFQ09SRDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAgTGl2ZV9PcGVyYXRpb25zLkRFTEVURTpcbiAgICAgICAgICAgICAgICAgICAgZm4gPSBEYXRhU291cmNlLk9wZXJhdGlvbi5ERUxFVEVfUkVDT1JEO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGFTb3VyY2UuZXhlY3V0ZShmbiwgcmVxdWVzdERhdGEpLnRoZW4ocmVzcG9uc2UgPT4gb25TdWNjZXNzKHJlc3BvbnNlLCByZXMsIHJlaiksIHJlaik7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0FQSV9BV0FSRSkpIHtcbiAgICAgICAgICAgIGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5TRVRfSU5QVVQsIHJlcXVlc3REYXRhKTtcbiAgICAgICAgICAgIGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5JTlZPS0UsIHtcbiAgICAgICAgICAgICAgICAnc2tpcE5vdGlmaWNhdGlvbic6IHRydWVcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzLCByZWopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzKHJlcXVlc3REYXRhKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmcmVzaERhdGFTb3VyY2UoZGF0YVNvdXJjZSwgb3B0aW9ucyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgICBpZiAoIWRhdGFTb3VyY2UpIHtcbiAgICAgICAgICAgIHJlaigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5MSVNUX1JFQ09SRFMsIHtcbiAgICAgICAgICAgICdmaWx0ZXJGaWVsZHMnIDogb3B0aW9ucy5maWx0ZXJGaWVsZHMgfHwge30sXG4gICAgICAgICAgICAnb3JkZXJCeScgOiBvcHRpb25zLm9yZGVyQnksXG4gICAgICAgICAgICAncGFnZSc6IG9wdGlvbnMucGFnZSB8fCAxXG4gICAgICAgIH0pLnRoZW4ocmVzLCByZWopO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgd20ud2lkZ2V0cy5saXZlLmZldGNoUmVsYXRlZEZpZWxkRGF0YVxuICogQG1ldGhvZE9mIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHNcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVGhpcyBmdW5jdGlvbiBmZXRjaGVzIHRoZSBkYXRhIGZvciB0aGUgcmVsYXRlZCBmaWVsZCBpbiBsaXZlIGZvcm0vIGdyaWRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29sdW1uRGVmIGZpZWxkIGRlZmluaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGVkRmllbGQgcmVsYXRlZCBmaWVsZCBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YWZpZWxkIERhdGFmaWVsZCB0byBiZSBzZXQgb24gd2lkZ2V0XG4gKiBAcGFyYW0ge3N0cmluZ30gd2lkZ2V0IFR5cGUgb2YgdGhlIHdpZGdldFxuICogQHBhcmFtIHtvYmplY3R9IGVsU2NvcGUgZWxlbWVudCBzY29wZVxuICogQHBhcmFtIHtvYmplY3R9IHBhcmVudFNjb3BlIGxpdmUgZm9ybS8vIGdyaWQgc2NvcGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZldGNoUmVsYXRlZEZpZWxkRGF0YShkYXRhU291cmNlLCBmb3JtRmllbGQsIG9wdGlvbnMpIHtcbiAgICBsZXQgcHJpbWFyeUtleXM7XG4gICAgbGV0IGRpc3BsYXlGaWVsZDtcbiAgICBjb25zdCByZWxhdGVkRmllbGQgPSBvcHRpb25zLnJlbGF0ZWRGaWVsZDtcbiAgICBjb25zdCBkYXRhZmllbGQgPSBvcHRpb25zLmRhdGFmaWVsZDtcblxuICAgIGlmICghZGF0YVNvdXJjZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHByaW1hcnlLZXlzID0gZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9SRUxBVEVEX1BSSU1BUllfS0VZUywgcmVsYXRlZEZpZWxkKTtcbiAgICBmb3JtRmllbGQuZGF0YWZpZWxkID0gZGF0YWZpZWxkO1xuICAgIGZvcm1GaWVsZC5fcHJpbWFyeUtleSA9IF8uaXNFbXB0eShwcmltYXJ5S2V5cykgPyB1bmRlZmluZWQgOiBwcmltYXJ5S2V5c1swXTtcbiAgICBmb3JtRmllbGQuY29tcGFyZWJ5ID0gcHJpbWFyeUtleXMgJiYgcHJpbWFyeUtleXMuam9pbignLCcpO1xuXG4gICAgZGlzcGxheUZpZWxkID0gZGF0YWZpZWxkID09PSBBTExGSUVMRFMgPyB1bmRlZmluZWQgOiBkYXRhZmllbGQ7XG4gICAgZm9ybUZpZWxkLmRpc3BsYXlmaWVsZCA9IGRpc3BsYXlGaWVsZCA9IChmb3JtRmllbGQuZGlzcGxheWZpZWxkIHx8IGRpc3BsYXlGaWVsZCB8fCBmb3JtRmllbGQuX3ByaW1hcnlLZXkpO1xuXG4gICAgaWYgKGlzU2VhcmNoV2lkZ2V0VHlwZShmb3JtRmllbGRbb3B0aW9ucy53aWRnZXRdKSkge1xuICAgICAgICBmb3JtRmllbGQuZGF0YW9wdGlvbnMgPSB7J3JlbGF0ZWRGaWVsZCc6IHJlbGF0ZWRGaWVsZCwgJ2ZpbHRlckV4cHInOiBmb3JtRmllbGQuZmlsdGVyZXhwcmVzc2lvbnMgPyBmb3JtRmllbGQuZmlsdGVyZXhwcmVzc2lvbnMgOiB7fX07XG4gICAgICAgIGZvcm1GaWVsZC5kYXRhc291cmNlID0gZGF0YVNvdXJjZTtcbiAgICAgICAgZm9ybUZpZWxkLnNlYXJjaGtleSA9IGZvcm1GaWVsZC5zZWFyY2hrZXkgfHwgZGlzcGxheUZpZWxkO1xuICAgICAgICBmb3JtRmllbGQuZGlzcGxheWxhYmVsID0gZm9ybUZpZWxkLmRpc3BsYXlmaWVsZCA9IChmb3JtRmllbGQuZGlzcGxheWxhYmVsIHx8IGRpc3BsYXlGaWVsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW50ZXJwb2xhdGVCaW5kRXhwcmVzc2lvbnMoZm9ybUZpZWxkLnZpZXdQYXJlbnQsIGZvcm1GaWVsZC5maWx0ZXJleHByZXNzaW9ucywgKGZpbHRlcmV4cHJlc3Npb25zKSA9PiB7XG4gICAgICAgICAgICBmb3JtRmllbGQuZmlsdGVyZXhwcmVzc2lvbnMgPSBmaWx0ZXJleHByZXNzaW9ucztcbiAgICAgICAgICAgIGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfUkVMQVRFRF9UQUJMRV9EQVRBLCB7XG4gICAgICAgICAgICAgICAgcmVsYXRlZEZpZWxkLFxuICAgICAgICAgICAgICAgIHBhZ2VzaXplOiBmb3JtRmllbGQubGltaXQsXG4gICAgICAgICAgICAgICAgb3JkZXJCeTogZm9ybUZpZWxkLm9yZGVyYnkgPyBfLnJlcGxhY2UoZm9ybUZpZWxkLm9yZGVyYnksIC86L2csICcgJykgOiAnJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXJGaWVsZHM6IHt9LFxuICAgICAgICAgICAgICAgIGZpbHRlckV4cHI6IGZvcm1GaWVsZC5maWx0ZXJleHByZXNzaW9ucyA/IGZvcm1GaWVsZC5maWx0ZXJleHByZXNzaW9ucyA6IHt9XG4gICAgICAgICAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBmb3JtRmllbGQuZGF0YXNldCA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICAgICAgZm9ybUZpZWxkLmRpc3BsYXlmaWVsZCA9IGZvcm1GaWVsZC5kaXNwbGF5ZmllbGQgfHwgXy5oZWFkKF8ua2V5cyhfLmdldChyZXNwb25zZSwgJ1swXScpKSk7XG4gICAgICAgICAgICB9LCBub29wKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipcbiAqIHVzZWQgdG8gaW50ZXJwb2xhdGUgdGhlIGJpbmQgZXhwcmVzc2lvbiBmb3Iga2V5cyBpbiB0aGUgcXVlcnkgYnVpbGRlclxuICogQHBhcmFtIGNvbnRleHQgd2hlcmUgd2UgZmluZCB0aGUgdmFyaWFibGUgb2JqXG4gKiBAcGFyYW0gZmlsdGVyZXhwcmVzc2lvbnMgLSBvYmogY29udGFpbmluZyBhbGwgdGhlIHJ1bGUgb2Jqc1xuICogQHBhcmFtIGNhbGxiYWNrRm4gLSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2l0aCB0aGUgbmV3IHJlcGxhY2VkIHZhbHVlcyBpZiBhbnkgaW4gdGhlIGZpbHRlcmV4cHJlc3Npb25zIG9iamVjdFxuICovXG5leHBvcnQgY29uc3QgaW50ZXJwb2xhdGVCaW5kRXhwcmVzc2lvbnMgPSAoY29udGV4dCwgZmlsdGVyZXhwcmVzc2lvbnMsIGNhbGxiYWNrRm4pID0+IHtcbiAgICBjb25zdCBkZWJvdW5jZWRGbiA9IGRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihjYWxsYmFja0ZuKSkge1xuICAgICAgICAgICAgY2FsbGJhY2tGbihmaWx0ZXJleHByZXNzaW9ucyk7XG4gICAgICAgIH1cbiAgICB9LCAzMDApO1xuXG4gICAgLyoqXG4gICAgICogY2FsbGluZyB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIGZpcnN0IGZvciB0aGUgY2FzZSB3aGVyZSBpZiB0aGVyZSBpcyBhbnkgZmlsdGVyZXhwcmVzc2lvbiB3aXRob3V0IHRoZSBiaW5kZWR2YXJpYWJsZXMuXG4gICAgICogd2l0aG91dCB0aGlzIGl0IHdpbGwgbmV2ZXIgYmUgY2FsbGVkLiBwcm9jZXNzRmlsdGVyRXhwQmluZE5vZGUgd2lsbCBiZSBjYWxsZWQgb25seSBmb3IgdGhlIGJpbmRlZCB2YXJpYWJsZSBleHByZXNzaW9ucy5cbiAgICAgKi9cbiAgICBkZWJvdW5jZWRGbigpO1xuICAgIGNvbnN0IGZpbHRlckV4cHJlc3Npb25zID0gZmlsdGVyZXhwcmVzc2lvbnMgPyAoXy5pc09iamVjdChmaWx0ZXJleHByZXNzaW9ucykgPyBmaWx0ZXJleHByZXNzaW9ucyA6IEpTT04ucGFyc2UoZmlsdGVyZXhwcmVzc2lvbnMpKSA6IHt9O1xuICAgIGNvbnN0IGRlc3Ryb3lGbiA9IGNvbnRleHQucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIgPyBjb250ZXh0LnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyLmJpbmQoY29udGV4dCkgOiBfLm5vb3A7XG4gICAgY29uc3QgZmlsdGVyU3Vic2NyaXB0aW9uID0gIHByb2Nlc3NGaWx0ZXJFeHBCaW5kTm9kZShjb250ZXh0LCBmaWx0ZXJFeHByZXNzaW9ucykuc3Vic2NyaWJlKChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICAgIGZpbHRlcmV4cHJlc3Npb25zID0gSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UuZmlsdGVyRXhwcmVzc2lvbnMpO1xuICAgICAgICBkZWJvdW5jZWRGbigpO1xuICAgIH0pO1xuICAgIGRlc3Ryb3lGbigoKSA9PiBmaWx0ZXJTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG59O1xuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHMjZ2V0RGlzdGluY3RGaWVsZFByb3BlcnRpZXNcbiAqIEBtZXRob2RPZiB3bS53aWRnZXRzLmxpdmUuTGl2ZVdpZGdldFV0aWxzXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFJldHVybnMgdGhlIHByb3BlcnRpZXMgcmVxdWlyZWQgZm9yIGRhdGFzZXQgd2lkZ2V0c1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhU291cmNlIHZhcmlhYmxlIHNvdXJjZSBmb3IgdGhlIHdpZGdldFxuICogQHBhcmFtIHtvYmplY3R9IGZvcm1GaWVsZCBkZWZpbml0aW9uIG9mIHRoZSBjb2x1bW4vIGZpZWxkXG4gKlxuICovXG5leHBvcnQgY29uc3QgZ2V0RGlzdGluY3RGaWVsZFByb3BlcnRpZXMgPSAoZGF0YVNvdXJjZSwgZm9ybUZpZWxkKSA9PiB7XG4gICAgY29uc3QgcHJvcHM6IGFueSA9IHt9O1xuICAgIGxldCBmaWVsZENvbHVtbjtcbiAgICBpZiAoZm9ybUZpZWxkWydpcy1yZWxhdGVkJ10pIHtcbiAgICAgICAgcHJvcHMudGFibGVOYW1lICAgICA9IGZvcm1GaWVsZFsnbG9va3VwLXR5cGUnXTtcbiAgICAgICAgZmllbGRDb2x1bW4gICAgICAgICA9IGZvcm1GaWVsZFsnbG9va3VwLWZpZWxkJ107XG4gICAgICAgIHByb3BzLmRpc3RpbmN0RmllbGQgPSBmaWVsZENvbHVtbjtcbiAgICAgICAgcHJvcHMuYWxpYXNDb2x1bW4gICA9IGZpZWxkQ29sdW1uLnJlcGxhY2UoJy4nLCAnJCcpOyAvLyBGb3IgcmVsYXRlZCBmaWVsZHMsIEluIHJlc3BvbnNlIC4gaXMgcmVwbGFjZWQgYnkgJFxuICAgICAgICBwcm9wcy5maWx0ZXJFeHByICAgID0gZm9ybUZpZWxkLmZpbHRlcmV4cHJlc3Npb25zID8gKF8uaXNPYmplY3QoZm9ybUZpZWxkLmZpbHRlcmV4cHJlc3Npb25zKSA/IGZvcm1GaWVsZC5maWx0ZXJleHByZXNzaW9ucyA6IEpTT04ucGFyc2UoZm9ybUZpZWxkLmZpbHRlcmV4cHJlc3Npb25zKSkgOiB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwcm9wcy50YWJsZU5hbWUgICAgID0gZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9FTlRJVFlfTkFNRSk7XG4gICAgICAgIGZpZWxkQ29sdW1uICAgICAgICAgPSBmb3JtRmllbGQuZmllbGQgfHwgZm9ybUZpZWxkLmtleTtcbiAgICAgICAgcHJvcHMuZGlzdGluY3RGaWVsZCA9IGZpZWxkQ29sdW1uO1xuICAgICAgICBwcm9wcy5hbGlhc0NvbHVtbiAgID0gZmllbGRDb2x1bW47XG4gICAgfVxuICAgIHJldHVybiBwcm9wcztcbn07XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB3bS53aWRnZXRzLmxpdmUuTGl2ZVdpZGdldFV0aWxzI2dldERpc3RpbmN0VmFsdWVzXG4gKiBAbWV0aG9kT2Ygd20ud2lkZ2V0cy5saXZlLkxpdmVXaWRnZXRVdGlsc1xuICogQGZ1bmN0aW9uXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBSZXR1cm5zIHRoZSBkaXN0aW5jdCB2YWx1ZXMgZm9yIGEgZmllbGRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gZm9ybUZpZWxkIGRlZmluaXRpb24gb2YgdGhlIGNvbHVtbi8gZmllbGRcbiAqIEBwYXJhbSB7c3RyaW5nfSB3aWRnZXQgd2lkZ2V0IHByb3BlcnR5IG9uIHRoZSBmaWVsZFxuICogQHBhcmFtIHtvYmplY3R9IHZhcmlhYmxlIHZhcmlhYmxlIGZvciB0aGUgd2lkZ2V0XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsQmFjayBGdW5jdGlvbiB0byBiZSBleGVjdXRlZCBhZnRlciBmZXRjaGluZyByZXN1bHRzXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGlzdGluY3RWYWx1ZXMoZGF0YVNvdXJjZSwgZm9ybUZpZWxkLCB3aWRnZXQpIHtcbiAgICBsZXQgcHJvcHM7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAgIGlmIChpc0RhdGFTZXRXaWRnZXQoZm9ybUZpZWxkW3dpZGdldF0pICYmICghZm9ybUZpZWxkLmlzRGF0YVNldEJvdW5kIHx8IHdpZGdldCA9PT0gJ2ZpbHRlcndpZGdldCcpKSB7XG4gICAgICAgICAgICBwcm9wcyA9IGdldERpc3RpbmN0RmllbGRQcm9wZXJ0aWVzKGRhdGFTb3VyY2UsIGZvcm1GaWVsZCk7XG4gICAgICAgICAgICBkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX0RJU1RJTkNUX0RBVEFfQllfRklFTERTLCB7XG4gICAgICAgICAgICAgICAgZmllbGRzOiBwcm9wcy5kaXN0aW5jdEZpZWxkLFxuICAgICAgICAgICAgICAgIGVudGl0eU5hbWU6IHByb3BzLnRhYmxlTmFtZSxcbiAgICAgICAgICAgICAgICBwYWdlc2l6ZTogZm9ybUZpZWxkLmxpbWl0LFxuICAgICAgICAgICAgICAgIGZpbHRlckV4cHI6IGZvcm1GaWVsZC5maWx0ZXJleHByZXNzaW9ucyA/IEpTT04ucGFyc2UoZm9ybUZpZWxkLmZpbHRlcmV4cHJlc3Npb25zKSA6IHt9XG4gICAgICAgICAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXMoeydmaWVsZCc6IGZvcm1GaWVsZCwgJ2RhdGEnOiByZXNwb25zZS5kYXRhLCAnYWxpYXNDb2x1bW4nOiBwcm9wcy5hbGlhc0NvbHVtbn0pO1xuICAgICAgICAgICAgfSwgcmVqKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vLyBTZXQgdGhlIGRhdGEgZmllbGQgcHJvcGVydGllcyBvbiBkYXRhc2V0IHdpZGdldHNcbmZ1bmN0aW9uIHNldERhdGFGaWVsZHMoZm9ybUZpZWxkLCBvcHRpb25zPykge1xuICAgIC8vIEZvciBzZWFyY2ggd2lkZ2V0LCBzZXQgc2VhcmNoIGtleSBhbmQgZGlzcGxheSBsYWJlbFxuICAgIGlmIChpc1NlYXJjaFdpZGdldFR5cGUoZm9ybUZpZWxkW29wdGlvbnMud2lkZ2V0XSkpIHtcbiAgICAgICAgZm9ybUZpZWxkLmRhdGFmaWVsZCA9IG9wdGlvbnMuYWxpYXNDb2x1bW4gfHwgTElWRV9DT05TVEFOVFMuTEFCRUxfS0VZO1xuICAgICAgICBmb3JtRmllbGQuc2VhcmNoa2V5ID0gb3B0aW9ucy5kaXN0aW5jdEZpZWxkIHx8IExJVkVfQ09OU1RBTlRTLkxBQkVMX0tFWTtcbiAgICAgICAgZm9ybUZpZWxkLmRpc3BsYXlsYWJlbCA9IGZvcm1GaWVsZC5kaXNwbGF5ZmllbGQgPSAob3B0aW9ucy5hbGlhc0NvbHVtbiB8fCBMSVZFX0NPTlNUQU5UUy5MQUJFTF9WQUxVRSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9ybUZpZWxkLmRhdGFmaWVsZCAgICA9IExJVkVfQ09OU1RBTlRTLkxBQkVMX0tFWTtcbiAgICBmb3JtRmllbGQuZGlzcGxheWZpZWxkID0gTElWRV9DT05TVEFOVFMuTEFCRUxfVkFMVUU7XG59XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB3bS53aWRnZXRzLmxpdmUuTGl2ZVdpZGdldFV0aWxzI3NldEZpZWxkRGF0YVNldFxuICogQG1ldGhvZE9mIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHNcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogRnVuY3Rpb24gdG8gc2V0IHRoZSBkYXRhU2V0IG9uIHRoZSBmaWVsZHNcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gZm9ybUZpZWxkIGRlZmluaXRpb24gb2YgdGhlIGNvbHVtbi8gZmllbGRcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIGRhdGEgcmV0dXJuZWQgZnJvbSB0aGUgc2VydmVyXG4gKiBAcGFyYW0ge3N0cmluZ30gYWxpYXNDb2x1bW4gY29sdW1uIGZpZWxkIG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSB3aWRnZXQgd2lkZ2V0IHByb3BlcnR5IG9uIHRoZSBmaWVsZFxuICogQHBhcmFtIHtib29sZWFufSBpc0VuYWJsZUVtcHR5RmlsdGVyIGlzIG51bGwgb3IgZW1wdHkgdmFsdWVzIGFsbG93ZWQgb24gZmlsdGVyXG4gKlxuICovXG5mdW5jdGlvbiBzZXRGaWVsZERhdGFTZXQoZm9ybUZpZWxkLCBkYXRhLCBvcHRpb25zPykge1xuICAgIGNvbnN0IGVtcHR5U3VwcG9ydFdpZGdldHMgPSBbRm9ybVdpZGdldFR5cGUuU0VMRUNULCBGb3JtV2lkZ2V0VHlwZS5SQURJT1NFVF07XG4gICAgY29uc3QgZW1wdHlPcHRpb24gICAgICAgICA9IHt9O1xuICAgIGNvbnN0IGRhdGFTZXQgPSBbXTtcbiAgICBpZiAob3B0aW9ucy5pc0VuYWJsZUVtcHR5RmlsdGVyICYmIF8uaW5jbHVkZXMoZW1wdHlTdXBwb3J0V2lkZ2V0cywgZm9ybUZpZWxkW29wdGlvbnMud2lkZ2V0XSkgJiZcbiAgICAgICAgIWZvcm1GaWVsZFsnaXMtcmFuZ2UnXSAmJiAhZm9ybUZpZWxkLm11bHRpcGxlKSB7XG4gICAgICAgIC8vIElmIGVtcHR5IG9wdGlvbiBpcyBzZWxlY3RlZCwgcHVzaCBhbiBlbXB0eSBvYmplY3QgaW4gdG8gZGF0YVNldFxuICAgICAgICBlbXB0eU9wdGlvbltMSVZFX0NPTlNUQU5UUy5MQUJFTF9LRVldICAgPSBMSVZFX0NPTlNUQU5UUy5FTVBUWV9LRVk7XG4gICAgICAgIGVtcHR5T3B0aW9uW0xJVkVfQ09OU1RBTlRTLkxBQkVMX1ZBTFVFXSA9IG9wdGlvbnMuRU1QVFlfVkFMVUUgfHwgTElWRV9DT05TVEFOVFMuRU1QVFlfVkFMVUU7XG4gICAgICAgIGRhdGFTZXQucHVzaChlbXB0eU9wdGlvbik7XG4gICAgfVxuICAgIF8uZWFjaChkYXRhLCBrZXkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSAgPSBrZXlbb3B0aW9ucy5hbGlhc0NvbHVtbl07XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHt9O1xuICAgICAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09ICcnKSB7XG4gICAgICAgICAgICBvcHRpb25bTElWRV9DT05TVEFOVFMuTEFCRUxfS0VZXSAgID0gdmFsdWU7XG4gICAgICAgICAgICBvcHRpb25bTElWRV9DT05TVEFOVFMuTEFCRUxfVkFMVUVdID0gdmFsdWU7XG4gICAgICAgICAgICBkYXRhU2V0LnB1c2gob3B0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHNldERhdGFGaWVsZHMoZm9ybUZpZWxkLCBvcHRpb25zKTtcbiAgICBmb3JtRmllbGQuZGF0YXNldCA9IGRhdGFTZXQ7XG59XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB3bS53aWRnZXRzLmxpdmUuTGl2ZVdpZGdldFV0aWxzI2ZldGNoRGlzdGluY3RWYWx1ZXNcbiAqIEBtZXRob2RPZiB3bS53aWRnZXRzLmxpdmUuTGl2ZVdpZGdldFV0aWxzXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEZ1bmN0aW9uIHRvIGZldGNoIHRoZSBkaXN0aW5jdCB2YWx1ZXMgZm9yIGEgZmllbGRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gc2NvcGUgc2NvcGUgb2YgdGhlIHdpZGdldFxuICogQHBhcmFtIHtvYmplY3R9IGZvcm1GaWVsZHMgZGVmaW5pdGlvbnMgb2YgdGhlIGNvbHVtbi8gZmllbGRcbiAqIEBwYXJhbSB7c3RyaW5nfSB3aWRnZXQgd2lkZ2V0IHByb3BlcnR5IG9uIHRoZSBmaWVsZFxuICogQHBhcmFtIHtib29sZWFufSBpc0VuYWJsZUVtcHR5RmlsdGVyIGlzIG51bGwgb3IgZW1wdHkgdmFsdWVzIGFsbG93ZWQgb24gZmlsdGVyXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hEaXN0aW5jdFZhbHVlcyhkYXRhU291cmNlLCBmb3JtRmllbGRzLCBvcHRpb25zKSB7XG4gICAgaWYgKF8uaXNFbXB0eShmb3JtRmllbGRzKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvcm1GaWVsZHMuZm9yRWFjaChmb3JtRmllbGQgPT4ge1xuICAgICAgICBnZXREaXN0aW5jdFZhbHVlc0ZvckZpZWxkKGRhdGFTb3VyY2UsIGZvcm1GaWVsZCwgb3B0aW9ucyk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB3bS53aWRnZXRzLmxpdmUuTGl2ZVdpZGdldFV0aWxzI2dldERpc3RpbmN0VmFsdWVzRm9yRmllbGRcbiAqIEBtZXRob2RPZiB3bS53aWRnZXRzLmxpdmUuTGl2ZVdpZGdldFV0aWxzXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEZ1bmN0aW9uIHRvIGZldGNoIHRoZSBkaXN0aW5jdCB2YWx1ZXMgZm9yIGEgZmllbGRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gc2NvcGUgc2NvcGUgb2YgdGhlIHdpZGdldFxuICogQHBhcmFtIHtvYmplY3R9IGZvcm1GaWVsZHMgZGVmaW5pdGlvbnMgb2YgdGhlIGNvbHVtbi8gZmllbGRcbiAqIEBwYXJhbSB7c3RyaW5nfSB3aWRnZXQgd2lkZ2V0IHByb3BlcnR5IG9uIHRoZSBmaWVsZFxuICogQHBhcmFtIHtib29sZWFufSBpc0VuYWJsZUVtcHR5RmlsdGVyIGlzIG51bGwgb3IgZW1wdHkgdmFsdWVzIGFsbG93ZWQgb24gZmlsdGVyXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGlzdGluY3RWYWx1ZXNGb3JGaWVsZChkYXRhU291cmNlLCBmb3JtRmllbGQsIG9wdGlvbnM/KSB7XG4gICAgaWYgKCFkYXRhU291cmNlIHx8ICFmb3JtRmllbGQgfHwgZm9ybUZpZWxkLmlzRGF0YVNldEJvdW5kKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGlzU2VhcmNoV2lkZ2V0VHlwZShmb3JtRmllbGRbb3B0aW9ucy53aWRnZXRdKSkge1xuICAgICAgICBjb25zdCBkYXRhb3B0aW9ucyA9ICBnZXREaXN0aW5jdEZpZWxkUHJvcGVydGllcyhkYXRhU291cmNlLCBmb3JtRmllbGQpO1xuICAgICAgICBmb3JtRmllbGQuZGF0YW9wdGlvbnMgPSBkYXRhb3B0aW9ucztcbiAgICAgICAgc2V0RGF0YUZpZWxkcyhmb3JtRmllbGQsIE9iamVjdC5hc3NpZ24ob3B0aW9ucyB8fCB7fSwgZGF0YW9wdGlvbnMpKTtcbiAgICAgICAgZm9ybUZpZWxkLmRhdGFzb3VyY2UgPSBkYXRhU291cmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGludGVycG9sYXRlQmluZEV4cHJlc3Npb25zKGZvcm1GaWVsZC52aWV3UGFyZW50LCBmb3JtRmllbGQuZmlsdGVyZXhwcmVzc2lvbnMsIChmaWx0ZXJleHByZXNzaW9ucykgPT4ge1xuICAgICAgICAgICAgZm9ybUZpZWxkLmZpbHRlcmV4cHJlc3Npb25zID0gZmlsdGVyZXhwcmVzc2lvbnM7XG4gICAgICAgICAgICBnZXREaXN0aW5jdFZhbHVlcyhkYXRhU291cmNlLCBmb3JtRmllbGQsIG9wdGlvbnMud2lkZ2V0KS50aGVuKChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHNldEZpZWxkRGF0YVNldChyZXMuZmllbGQsIHJlcy5kYXRhLCB7XG4gICAgICAgICAgICAgICAgICAgIGFsaWFzQ29sdW1uOiByZXMuYWxpYXNDb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgIHdpZGdldDogb3B0aW9ucy53aWRnZXQsXG4gICAgICAgICAgICAgICAgICAgIGlzRW5hYmxlRW1wdHlGaWx0ZXI6IGdldEVuYWJsZUVtcHR5RmlsdGVyKG9wdGlvbnMuZW5hYmxlZW1wdHlmaWx0ZXIpLFxuICAgICAgICAgICAgICAgICAgICBFTVBUWV9WQUxVRTogb3B0aW9ucy5FTVBUWV9WQUxVRVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNEZWZpbmVkQW5kTm90RW1wdHkodmFsKSB7XG4gICAgcmV0dXJuIGlzRGVmaW5lZCh2YWwpICYmIHZhbCAhPT0gJycgJiYgdmFsICE9PSBudWxsO1xufVxuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgd20ud2lkZ2V0cy5saXZlLmdldFJhbmdlRmllbGRWYWx1ZVxuICogQG1ldGhvZE9mIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHNcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogRnVuY3Rpb24gdG8gZ2V0IHRoZSBmaWVsZCB2YWx1ZSBmb3IgcmFuZ2VcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWluVmFsdWUgbWluIHZhbHVlIHNlbGVjdGVkXG4gKiBAcGFyYW0ge3N0cmluZ30gbWF4VmFsdWUgbWF4IHZhbHVlIHNlbGVjdGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSYW5nZUZpZWxkVmFsdWUobWluVmFsdWUsIG1heFZhbHVlKSB7XG4gICAgbGV0IGZpZWxkVmFsdWU7XG4gICAgaWYgKGlzRGVmaW5lZEFuZE5vdEVtcHR5KG1pblZhbHVlKSAmJiBpc0RlZmluZWRBbmROb3RFbXB0eShtYXhWYWx1ZSkpIHtcbiAgICAgICAgZmllbGRWYWx1ZSA9IFttaW5WYWx1ZSwgbWF4VmFsdWVdO1xuICAgIH0gZWxzZSBpZiAoaXNEZWZpbmVkQW5kTm90RW1wdHkobWluVmFsdWUpKSB7XG4gICAgICAgIGZpZWxkVmFsdWUgPSBtaW5WYWx1ZTtcbiAgICB9IGVsc2UgaWYgKGlzRGVmaW5lZEFuZE5vdEVtcHR5KG1heFZhbHVlKSkge1xuICAgICAgICBmaWVsZFZhbHVlID0gbWF4VmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBmaWVsZFZhbHVlO1xufVxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHdtLndpZGdldHMubGl2ZS5nZXRSYW5nZU1hdGNoTW9kZVxuICogQG1ldGhvZE9mIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHNcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogRnVuY3Rpb24gdG8gZ2V0IHRoZSBtYXRjaCBtb2RlIGZvciByYW5nZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtaW5WYWx1ZSBtaW4gdmFsdWUgc2VsZWN0ZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBtYXhWYWx1ZSBtYXggdmFsdWUgc2VsZWN0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmdlTWF0Y2hNb2RlKG1pblZhbHVlLCBtYXhWYWx1ZSkge1xuICAgIGxldCBtYXRjaE1vZGU7XG4gICAgLy8gSWYgdHdvIHZhbHVlcyBleGlzdHMsIHRoZW4gaXQgaXMgYmV0d2Vlbi4gT3RoZXJ3aXNlLCBncmVhdGVyIG9yIGxlc3NlclxuICAgIGlmIChpc0RlZmluZWRBbmROb3RFbXB0eShtaW5WYWx1ZSkgJiYgaXNEZWZpbmVkQW5kTm90RW1wdHkobWF4VmFsdWUpKSB7XG4gICAgICAgIG1hdGNoTW9kZSA9IE1hdGNoTW9kZS5CRVRXRUVOO1xuICAgIH0gZWxzZSBpZiAoaXNEZWZpbmVkQW5kTm90RW1wdHkobWluVmFsdWUpKSB7XG4gICAgICAgIG1hdGNoTW9kZSA9IE1hdGNoTW9kZS5HUkVBVEVSO1xuICAgIH0gZWxzZSBpZiAoaXNEZWZpbmVkQW5kTm90RW1wdHkobWF4VmFsdWUpKSB7XG4gICAgICAgIG1hdGNoTW9kZSA9IE1hdGNoTW9kZS5MRVNTRVI7XG4gICAgfVxuICAgIHJldHVybiBtYXRjaE1vZGU7XG59XG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgd20ud2lkZ2V0cy5saXZlLmdldEVuYWJsZUVtcHR5RmlsdGVyXG4gKiBAbWV0aG9kT2Ygd20ud2lkZ2V0cy5saXZlLkxpdmVXaWRnZXRVdGlsc1xuICogQGZ1bmN0aW9uXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGlzIGZ1bmN0aW9uIGNoZWNrcyBpZiBlbmFibGUgZmlsdGVyIG9wdGlvbnMgaXMgc2V0IG9uIGxpdmUgZmlsdGVyXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGVuYWJsZWVtcHR5ZmlsdGVyIGVtcHR5IGZpbHRlciBvcHRpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbmFibGVFbXB0eUZpbHRlcihlbmFibGVlbXB0eWZpbHRlcikge1xuICAgIHJldHVybiBlbmFibGVlbXB0eWZpbHRlciAmJiBfLmludGVyc2VjdGlvbihlbmFibGVlbXB0eWZpbHRlci5zcGxpdCgnLCcpLCBMSVZFX0NPTlNUQU5UUy5OVUxMX0VNUFRZKS5sZW5ndGggPiAwO1xufVxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHdtLndpZGdldHMubGl2ZS5nZXRFbXB0eU1hdGNoTW9kZVxuICogQG1ldGhvZE9mIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHNcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogRnVuY3Rpb24gdG8gZ2V0IHRoZSBtYXRjaCBtb2RlIGJhc2VkIG9uIHRoZSBmaWx0ZXIgc2VsZWN0ZWRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gZW5hYmxlZW1wdHlmaWx0ZXIgZW1wdHkgZmlsdGVyIG9wdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVtcHR5TWF0Y2hNb2RlKGVuYWJsZWVtcHR5ZmlsdGVyKSB7XG4gICAgbGV0IG1hdGNoTW9kZTtcbiAgICBjb25zdCBlbXB0eUZpbHRlck9wdGlvbnMgPSBfLnNwbGl0KGVuYWJsZWVtcHR5ZmlsdGVyLCAnLCcpO1xuICAgIGlmIChfLmludGVyc2VjdGlvbihlbXB0eUZpbHRlck9wdGlvbnMsIExJVkVfQ09OU1RBTlRTLk5VTExfRU1QVFkpLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBtYXRjaE1vZGUgPSBNYXRjaE1vZGUuTlVMTE9SRU1QVFk7XG4gICAgfSBlbHNlIGlmIChfLmluY2x1ZGVzKGVtcHR5RmlsdGVyT3B0aW9ucywgTElWRV9DT05TVEFOVFMuTlVMTCkpIHtcbiAgICAgICAgbWF0Y2hNb2RlID0gTWF0Y2hNb2RlLk5VTEw7XG4gICAgfSBlbHNlIGlmIChfLmluY2x1ZGVzKGVtcHR5RmlsdGVyT3B0aW9ucywgTElWRV9DT05TVEFOVFMuRU1QVFkpKSB7XG4gICAgICAgIG1hdGNoTW9kZSA9IE1hdGNoTW9kZS5FTVBUWTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoTW9kZTtcbn1cblxuLyoqXG4gKiBjb252ZXJ0cyB0aGUgZGF0YSBwYXNzZWQgdG8gYXJyYXkuXG4gKiAgLT4gQXJyYXk6IFsxLDIsM10gLSBbMSwyLDNdXG4gKiAgLT4gU3RyaW5nOiBhLGIsYyAtIFsnYScsJ2InLCdjJ11cbiAqICAtPiBvYmplY3Q6IHthOjF9IC0gW3thOjF9XVxuICogIC0+IG51bGwgLSBbXVxuICogIC0+IHVuZGVmaW5lZCAtIFtdXG4gKiBAcGFyYW0gZGF0YVxuICogQHJldHVybnMge0FycmF5PGFueT59XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVBcnJheUZyb20gPSAoZGF0YSk6IEFycmF5PGFueT4gPT4ge1xuXG4gICAgaWYgKF8uaXNVbmRlZmluZWQoZGF0YSkgfHwgXy5pc051bGwoZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGlmIChfLmlzU3RyaW5nKGRhdGEpKSB7XG4gICAgICAgIGRhdGEgPSBkYXRhLnNwbGl0KCcsJykubWFwKEZ1bmN0aW9uLnByb3RvdHlwZS5jYWxsLCBTdHJpbmcucHJvdG90eXBlLnRyaW0pO1xuICAgIH1cblxuICAgIGlmICghXy5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG59O1xuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgd20ud2lkZ2V0cy5saXZlLmFwcGx5RmlsdGVyT25GaWVsZFxuICogQG1ldGhvZE9mIHdtLndpZGdldHMubGl2ZS5MaXZlV2lkZ2V0VXRpbHNcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogRnVuY3Rpb24gdG8gZ2V0IHRoZSB1cGRhdGVkIHZhbHVlcyB3aGVuIGZpbHRlciBvbiBmaWVsZCBpcyBjaGFuZ2VkXG4gKlxuICogQHBhcmFtIHtvYmplY3R9ICRzY29wZSBzY29wZSBvZiB0aGUgZmlsdGVyIGZpZWxkL2Zvcm0gZmllbGRcbiAqIEBwYXJhbSB7b2JqZWN0fSBmaWx0ZXJEZWYgZmlsdGVyL2Zvcm0gZGVmaW5pdGlvbiBvZiB0aGUgZmllbGRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNGaXJzdCBib29sZWFuIHZhbHVlIHRvIGNoZWNrIGlmIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCBvbiBsb2FkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUZpbHRlck9uRmllbGQoZGF0YVNvdXJjZSwgZmlsdGVyRGVmLCBmb3JtRmllbGRzLCBuZXdWYWwsIG9wdGlvbnM6IGFueSA9IHt9KSB7XG4gICAgY29uc3QgZmllbGROYW1lICAgICAgPSBmaWx0ZXJEZWYuZmllbGQgfHwgZmlsdGVyRGVmLmtleTtcbiAgICBjb25zdCBmaWx0ZXJPbkZpZWxkcyA9IF8uZmlsdGVyKGZvcm1GaWVsZHMsIHsnZmlsdGVyLW9uJzogZmllbGROYW1lfSk7XG5cbiAgICBuZXdWYWwgPSBmaWx0ZXJEZWZbJ2lzLXJhbmdlJ10gPyBnZXRSYW5nZUZpZWxkVmFsdWUoZmlsdGVyRGVmLm1pblZhbHVlLCBmaWx0ZXJEZWYubWF4VmFsdWUpIDogKGlzRGVmaW5lZChuZXdWYWwpID8gbmV3VmFsIDogZmlsdGVyRGVmLnZhbHVlKTtcbiAgICBpZiAoIWRhdGFTb3VyY2UgfHwgKG9wdGlvbnMuaXNGaXJzdCAmJiAoXy5pc1VuZGVmaW5lZChuZXdWYWwpIHx8IG5ld1ZhbCA9PT0gJycpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIExvb3Agb3ZlciB0aGUgZmllbGRzIGZvciB3aGljaCB0aGUgY3VycmVudCBmaWVsZCBpcyBmaWx0ZXIgb24gZmllbGRcbiAgICBfLmZvckVhY2goZmlsdGVyT25GaWVsZHMsIGZpbHRlckZpZWxkID0+IHtcbiAgICAgICAgY29uc3QgZmlsdGVyS2V5ICAgID0gZmlsdGVyRmllbGQuZmllbGQgfHwgZmlsdGVyRmllbGQua2V5O1xuICAgICAgICBjb25zdCBsb29rVXBGaWVsZCAgPSBmaWx0ZXJEZWZbJ2xvb2t1cC1maWVsZCddIHx8IGZpbHRlckRlZi5fcHJpbWFyeUtleTtcbiAgICAgICAgY29uc3QgZmlsdGVyV2lkZ2V0ID0gZmlsdGVyRmllbGRbJ2VkaXQtd2lkZ2V0LXR5cGUnXSB8fCBmaWx0ZXJGaWVsZC53aWRnZXR0eXBlO1xuICAgICAgICBsZXQgZmlsdGVyRmllbGRzID0ge307XG4gICAgICAgIGxldCBmaWx0ZXJPbiAgICAgPSBmaWx0ZXJGaWVsZFsnZmlsdGVyLW9uJ107XG4gICAgICAgIGxldCBmaWx0ZXJWYWw7XG4gICAgICAgIGxldCBmaWVsZENvbHVtbjtcbiAgICAgICAgbGV0IG1hdGNoTW9kZTtcbiAgICAgICAgaWYgKCFpc0RhdGFTZXRXaWRnZXQoZmlsdGVyV2lkZ2V0KSB8fCBmaWx0ZXJGaWVsZC5pc0RhdGFTZXRCb3VuZCB8fCBmaWx0ZXJPbiA9PT0gZmlsdGVyS2V5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gRm9yIHJlbGF0ZWQgZmllbGRzLCBhZGQgbG9va3VwZmllbGQgZm9yIHF1ZXJ5IGdlbmVyYXRpb25cbiAgICAgICAgaWYgKGZpbHRlckRlZiAmJiBmaWx0ZXJEZWZbJ2lzLXJlbGF0ZWQnXSkge1xuICAgICAgICAgICAgZmlsdGVyT24gKz0gJy4nICsgIGxvb2tVcEZpZWxkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0RlZmluZWQobmV3VmFsKSkge1xuICAgICAgICAgICAgaWYgKGZpbHRlckRlZlsnaXMtcmFuZ2UnXSkge1xuICAgICAgICAgICAgICAgIG1hdGNoTW9kZSA9IGdldFJhbmdlTWF0Y2hNb2RlKGZpbHRlckRlZi5taW5WYWx1ZSwgZmlsdGVyRGVmLm1heFZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2V0RW5hYmxlRW1wdHlGaWx0ZXIob3B0aW9ucy5lbmFibGVlbXB0eWZpbHRlcikgJiYgbmV3VmFsID09PSBMSVZFX0NPTlNUQU5UUy5FTVBUWV9LRVkpIHtcbiAgICAgICAgICAgICAgICBtYXRjaE1vZGUgPSBnZXRFbXB0eU1hdGNoTW9kZShvcHRpb25zLmVuYWJsZWVtcHR5ZmlsdGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWF0Y2hNb2RlID0gTWF0Y2hNb2RlLkVRVUFMUztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbHRlclZhbCA9IChfLmlzT2JqZWN0KG5ld1ZhbCkgJiYgIV8uaXNBcnJheShuZXdWYWwpKSA/IG5ld1ZhbFtsb29rVXBGaWVsZF0gOiBuZXdWYWw7XG4gICAgICAgICAgICBmaWx0ZXJGaWVsZHNbZmlsdGVyT25dID0ge1xuICAgICAgICAgICAgICAgICd2YWx1ZScgICAgIDogZmlsdGVyVmFsLFxuICAgICAgICAgICAgICAgICdtYXRjaE1vZGUnIDogbWF0Y2hNb2RlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlsdGVyRmllbGRzID0ge307XG4gICAgICAgIH1cbiAgICAgICAgZmllbGRDb2x1bW4gPSBmaWx0ZXJLZXk7XG5cbiAgICAgICAgaWYgKGlzU2VhcmNoV2lkZ2V0VHlwZShmaWx0ZXJXaWRnZXQpICYmIGZpbHRlckZpZWxkLmRhdGFvcHRpb25zKSB7XG4gICAgICAgICAgICBmaWx0ZXJGaWVsZC5kYXRhb3B0aW9ucy5maWx0ZXJGaWVsZHMgPSBmaWx0ZXJGaWVsZHM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX0RJU1RJTkNUX0RBVEFfQllfRklFTERTLCB7XG4gICAgICAgICAgICAgICAgJ2ZpZWxkcycgICAgICAgIDogZmllbGRDb2x1bW4sXG4gICAgICAgICAgICAgICAgJ2ZpbHRlckZpZWxkcycgIDogZmlsdGVyRmllbGRzLFxuICAgICAgICAgICAgICAgICdwYWdlc2l6ZScgICAgICA6IGZpbHRlckZpZWxkLmxpbWl0XG4gICAgICAgICAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBzZXRGaWVsZERhdGFTZXQoZmlsdGVyRmllbGQsIHJlc3BvbnNlLmRhdGEsIHtcbiAgICAgICAgICAgICAgICAgICAgYWxpYXNDb2x1bW46IGZpZWxkQ29sdW1uLFxuICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IG9wdGlvbnMud2lkZ2V0IHx8ICd3aWRnZXR0eXBlJyxcbiAgICAgICAgICAgICAgICAgICAgaXNFbmFibGVFbXB0eUZpbHRlcjogZ2V0RW5hYmxlRW1wdHlGaWx0ZXIob3B0aW9ucy5lbmFibGVlbXB0eWZpbHRlciksXG4gICAgICAgICAgICAgICAgICAgIEVNUFRZX1ZBTFVFOiBvcHRpb25zLkVNUFRZX1ZBTFVFXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCBub29wKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vLyBUcmFuc2Zvcm0gZGF0YSBhcyByZXF1aXJlZCBieSBkYXRhIHRhYmxlXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhT2JqZWN0LCB2YXJpYWJsZU5hbWUpIHtcbiAgICBsZXQgbmV3T2JqLFxuICAgICAgICB0ZW1wQXJyLFxuICAgICAgICBrZXlzLFxuICAgICAgICBvbGRLZXlzLFxuICAgICAgICBudW1LZXlzLFxuICAgICAgICBuZXdPYmplY3QsXG4gICAgICAgIHRlbXBPYmo7XG5cbiAgICAvLyBkYXRhIHNhbml0eSB0ZXN0aW5nXG4gICAgZGF0YU9iamVjdCA9IGRhdGFPYmplY3QgfHwgW107XG4gICAgLy8gaWYgdGhlIGRhdGFPYmplY3QgaXMgbm90IGFuIGFycmF5IG1ha2UgaXQgYW4gYXJyYXlcbiAgICBpZiAoIV8uaXNBcnJheShkYXRhT2JqZWN0KSkge1xuICAgICAgICAvLyBpZiB0aGUgZGF0YSByZXR1cm5lZCBpcyBvZiB0eXBlIHN0cmluZywgbWFrZSBpdCBhbiBvYmplY3QgaW5zaWRlIGFuIGFycmF5XG4gICAgICAgIGlmIChfLmlzU3RyaW5nKGRhdGFPYmplY3QpKSB7XG4gICAgICAgICAgICBrZXlzID0gdmFyaWFibGVOYW1lLnN1YnN0cmluZyh2YXJpYWJsZU5hbWUuaW5kZXhPZignLicpICsgMSwgdmFyaWFibGVOYW1lLmxlbmd0aCkuc3BsaXQoJy4nKTtcbiAgICAgICAgICAgIG9sZEtleXMgPSBbXTtcbiAgICAgICAgICAgIG51bUtleXMgPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgICAgIG5ld09iamVjdCA9IHt9O1xuICAgICAgICAgICAgdGVtcE9iaiA9IG5ld09iamVjdDtcblxuICAgICAgICAgICAgLy8gbG9vcCBvdmVyIHRoZSBrZXlzIHRvIGZvcm0gYXBwcm9wcmlhdGUgZGF0YSBvYmplY3QgcmVxdWlyZWQgZm9yIGdyaWRcbiAgICAgICAgICAgIGtleXMuZm9yRWFjaCgoa2V5LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIGxvb3Agb3ZlciBvbGQga2V5cyB0byBjcmVhdGUgbmV3IG9iamVjdCBhdCB0aGUgaXRlcmF0aXZlIGxldmVsXG4gICAgICAgICAgICAgICAgb2xkS2V5cy5mb3JFYWNoKG9sZEtleSAgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wT2JqID0gbmV3T2JqZWN0W29sZEtleV07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGVtcE9ialtrZXldID0gaW5kZXggPT09IG51bUtleXMgLSAxID8gZGF0YU9iamVjdCA6IHt9O1xuICAgICAgICAgICAgICAgIG9sZEtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGNoYW5nZSB0aGUgc3RyaW5nIGRhdGEgdG8gdGhlIG5ldyBkYXRhT2JqZWN0IGZvcm1lZFxuICAgICAgICAgICAgZGF0YU9iamVjdCA9IG5ld09iamVjdDtcbiAgICAgICAgfVxuICAgICAgICBkYXRhT2JqZWN0ID0gW2RhdGFPYmplY3RdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8qaWYgdGhlIGRhdGFPYmplY3QgaXMgYW4gYXJyYXkgYW5kIGVhY2ggdmFsdWUgaXMgYSBzdHJpbmcsIHRoZW4gbGl0ZS10cmFuc2Zvcm0gdGhlIHN0cmluZyB0byBhbiBvYmplY3RcbiAgICAgICAgICogbGl0ZS10cmFuc2Zvcm06IGp1c3QgY2hlY2tpbmcgaWYgdGhlIGZpcnN0IHZhbHVlIGlzIHN0cmluZyBhbmQgdGhlbiB0cmFuc2Zvcm1pbmcgdGhlIG9iamVjdCwgaW5zdGVhZCBvZiB0cmF2ZXJzaW5nIHRocm91Z2ggdGhlIHdob2xlIGFycmF5XG4gICAgICAgICAqICovXG4gICAgICAgIGlmIChfLmlzU3RyaW5nKGRhdGFPYmplY3RbMF0pKSB7XG4gICAgICAgICAgICB0ZW1wQXJyID0gW107XG4gICAgICAgICAgICBfLmZvckVhY2goZGF0YU9iamVjdCwgc3RyID0+IHtcbiAgICAgICAgICAgICAgICBuZXdPYmogPSB7fTtcbiAgICAgICAgICAgICAgICBuZXdPYmpbdmFyaWFibGVOYW1lLnNwbGl0KCcuJykuam9pbignLScpXSA9IHN0cjtcbiAgICAgICAgICAgICAgICB0ZW1wQXJyLnB1c2gobmV3T2JqKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGF0YU9iamVjdCA9IHRlbXBBcnI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGFPYmplY3Q7XG59XG4iXX0=