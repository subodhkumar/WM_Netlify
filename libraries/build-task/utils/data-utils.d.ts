export declare enum Live_Operations {
    INSERT = "insert",
    UPDATE = "update",
    DELETE = "delete",
    READ = "read"
}
export declare const ALLFIELDS = "All Fields";
export declare const LIVE_CONSTANTS: {
    'EMPTY_KEY': string;
    'EMPTY_VALUE': string;
    'LABEL_KEY': string;
    'LABEL_VALUE': string;
    'NULL_EMPTY': string[];
    'NULL': string;
    'EMPTY': string;
};
export declare function performDataOperation(dataSource: any, requestData: any, options: any): Promise<any>;
export declare function refreshDataSource(dataSource: any, options: any): Promise<any>;
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
export declare function fetchRelatedFieldData(dataSource: any, formField: any, options: any): void;
/**
 * used to interpolate the bind expression for keys in the query builder
 * @param context where we find the variable obj
 * @param filterexpressions - obj containing all the rule objs
 * @param callbackFn - function to be called with the new replaced values if any in the filterexpressions object
 */
export declare const interpolateBindExpressions: (context: any, filterexpressions: any, callbackFn: any) => void;
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
export declare const getDistinctFieldProperties: (dataSource: any, formField: any) => any;
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
export declare function getDistinctValues(dataSource: any, formField: any, widget: any): Promise<{}>;
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
export declare function fetchDistinctValues(dataSource: any, formFields: any, options: any): void;
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
export declare function getDistinctValuesForField(dataSource: any, formField: any, options?: any): void;
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
export declare function getRangeFieldValue(minValue: any, maxValue: any): any;
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
export declare function getRangeMatchMode(minValue: any, maxValue: any): any;
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
export declare function getEnableEmptyFilter(enableemptyfilter: any): boolean;
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
export declare function getEmptyMatchMode(enableemptyfilter: any): any;
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
export declare const createArrayFrom: (data: any) => any[];
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
export declare function applyFilterOnField(dataSource: any, filterDef: any, formFields: any, newVal: any, options?: any): void;
export declare function transformData(dataObject: any, variableName: any): any;
