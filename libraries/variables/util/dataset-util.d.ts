export default class DatasetUtil {
    static isValidDataset(dataSet: any, isList?: any): any;
    static getValue(dataSet: any, key: any, index: any, isList?: any): any;
    static setValue(dataSet: any, key: any, value: any, isList?: any): any;
    static getItem(dataSet: any, index: any, isList?: any): any;
    static setItem(dataSet: any, i: any, value: any, isList?: any): any;
    static addItem(dataSet: any, value: any, index: any, isList?: any): any;
    /**
     *
     * @param dataSet
     * @param i, can be index value of the object/element in array
     *      or
     * the whole object which needs to be removed
     * @param exactMatch
     * @returns {any}
     */
    static removeItem(dataSet: any, i: any, exactMatch: any): any;
    static getValidDataset(isList?: any): {};
    static getCount(dataSet: any, isList?: any): any;
}
