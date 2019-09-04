import { ToDatePipe } from '../pipes/custom-pipes';
/**
 * function to get the ordered dataset based on the given orderby
 */
export declare const getOrderedDataset: (dataSet: any, orderBy: string, innerItem?: any) => any;
/**
 * Returns an array of object, each object contain the DataSetItem whose key, value, label are extracted from object keys.
 */
export declare const transformDataWithKeys: (dataSet: any) => DataSetItem[];
export declare const extractDataAsArray: (data: any) => any;
export declare const convertDataToObject: (dataResult: any) => any;
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
export declare const transformData: (context: any, dataSet: any, myDataField?: string, displayOptions?: any, startIndex?: number) => DataSetItem[];
/**
 * Private method to get the unique objects by the data field
 */
export declare const getUniqObjsByDataField: (data: DataSetItem[], dataField: string, displayField: string, allowEmptyFields?: boolean) => any;
/**
 * This function sets the selectedItem by comparing the field values, where fields are passed by "compareby" property.
 * works only for datafield with ALL_FIELDS
 * @param datasetItems list of dataset items.
 * @param compareWithDataObj represents the datavalue (object) whose properties are to be checked against each property of datasetItem.
 * @param compareByField specifies the property names on which datasetItem has to be compared against datavalue object.
 */
export declare const setItemByCompare: (datasetItems: DataSetItem[], compareWithDataObj: Object, compareByField: string) => void;
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
export declare const groupData: (compRef: any, data: (Object | DataSetItem)[], groupby: string, match: string, orderby: string, dateformat: string, datePipe: ToDatePipe, innerItem?: string, AppDefaults?: any) => any[];
export declare const filterDate: (value: string | number, format: string, defaultFormat: string, datePipe: ToDatePipe) => any;
/**
 * This method toggles all the list items inside the each list group.
 * @param el, component reference on which groupby is applied.
 */
export declare const toggleAllHeaders: (el: any) => void;
/**
 * On list header click, toggle the list items in this group.
 * and also toggle the header icon.
 * @param $event
 */
export declare const handleHeaderClick: ($event: Event) => void;
/**
 * configures reordering the items.
 * @param $el element to be sortable
 * @param options object containing the sortable options.
 * @param startCb callback on drag start on the element.
 * @param updateCb callback triggerred when sorting is stopped and the DOM position has changed.
 */
export declare const configureDnD: ($el: any, options: object, startCb: Function, updateCb: Function) => void;
/**
 * key represents the datafield value
 * label represents display value or expression value
 * value displayValue for primitives and data object for allFields
 * dataObject represent the object from the dataset when datafield is ALLFIELDS. This is used as innerItem while grouping the datasetItems.
 * imgSrc picture source
 * selected represents boolean to notify selected item.
 */
export declare class DataSetItem {
    key: any;
    label: any;
    value: any;
    dataObject?: Object;
    index?: number;
    imgSrc?: string;
    selected?: boolean;
}
