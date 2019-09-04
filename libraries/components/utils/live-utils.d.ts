export declare const EDIT_MODE: {
    QUICK_EDIT: string;
    INLINE: string;
    FORM: string;
    DIALOG: string;
};
export declare const setHeaderConfig: (headerConfig: any, config: any, field: any) => void;
export declare const setHeaderConfigForTable: (headerConfig: any, config: any, fieldName: any) => void;
export declare const getRowOperationsColumn: () => any;
/**
 * Returns caption and widget bootstrap classes for the field
 */
export declare const getFieldLayoutConfig: (captionWidth: any, captionPosition: any, os: any) => any;
export declare const getDefaultViewModeWidget: (widget: any) => string;
export declare const parseValueByType: (value: any, type: any, widget: any) => any;
export declare const getFieldTypeWidgetTypesMap: () => {
    'integer': string[];
    'big_integer': string[];
    'short': string[];
    'float': string[];
    'big_decimal': string[];
    'number': string[];
    'double': string[];
    'long': string[];
    'byte': string[];
    'string': string[];
    'character': string[];
    'text': string[];
    'date': string[];
    'time': string[];
    'timestamp': string[];
    'datetime': string[];
    'boolean': string[];
    'list': string[];
    'clob': string[];
    'blob': string[];
    'file': string[];
    'custom': string[];
};
export declare const getDataTableFilterWidget: (type: any) => any;
/**
 * @ngdoc function
 * @name wm.widgets.live.getEditModeWidget
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * This function returns the default widget for grid
 *
 * @param {object} colDef field definition
 */
export declare const getEditModeWidget: (colDef: any) => any;
/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#getDefaultValue
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * return the formatted default value
 *
 * @param {string} value value to be formatted
 * @param {string} type column type of the value
 */
export declare const getDefaultValue: (value: any, type: any, widget: any) => any;
