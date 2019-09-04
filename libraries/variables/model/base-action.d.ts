export declare abstract class BaseAction {
    protected _id: string;
    name: string;
    owner: string;
    category: string;
    dataSet: any;
    dataBinding: any;
    _context: any;
    execute(operation: any, options: any): any;
    getData(): any;
    setData(dataSet: any): any;
    getValue(key: string, index: number): any;
    setValue(key: string, value: any): any;
    getItem(index: number): any;
    /**
     *
     * @param index, a number in ideal case
     *        it can be the object to be replaced by the passed value
     * @param value
     * @returns {any}
     */
    setItem(index: any, value: any): any;
    addItem(value: any, index: number): any;
    removeItem(index: any, exactMatch: boolean): any;
    clearData(): any;
    getCount(): any;
    init(): void;
}
