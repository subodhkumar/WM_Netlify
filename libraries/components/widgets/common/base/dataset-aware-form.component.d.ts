import { Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { DataSetItem } from '../../../utils/form-utils';
import { BaseFormCustomComponent } from './base-form-custom.component';
export declare abstract class DatasetAwareFormComponent extends BaseFormCustomComponent {
    dataset: any;
    datafield: string;
    displayfield: string;
    displaylabel: string;
    displayimagesrc: string;
    displayexpression: string;
    usekeys: boolean;
    orderby: string;
    multiple: boolean;
    readonly: boolean;
    binddisplayexpression: string;
    binddisplayimagesrc: string;
    binddisplaylabel: string;
    displayValue: Array<string> | string;
    datasetItems: DataSetItem[];
    acceptsArray: boolean;
    protected dataset$: Subject<{}>;
    protected datavalue$: Subject<{}>;
    protected _modelByKey: any;
    _modelByValue: any;
    _defaultQueryInvoked: boolean;
    toBeProcessedDatavalue: any;
    private readonly _debouncedInitDatasetItems;
    protected allowempty: boolean;
    compareby: any;
    modelByKey: any;
    datavalue: any;
    protected constructor(inj: Injector, WIDGET_CONFIG: any);
    /**
     * This function sets the _datavalue value from the model and sets the selected flag when item is found.
     * Here model is the value obtained from ngModel.
     * @param keys represent the model.
     */
    protected selectByKey(keys: any): void;
    /**
     * This function sets the _model value from the datavalue (selectedvalues) and sets the selected flag when item is found.
     * datavalue is the default value or a value representing the displayField (for suppose: object in case of ALLFIELDS).
     * If acceptsArray is true, the model always accepts an array.
     * For example, select always accepts model as array whether multiple select is true or false.
     * @param values represent the datavalue.
     */
    protected selectByValue(values: Array<any> | any): void;
    protected readonly _debounceDatavalueUpdation: any;
    protected initDisplayValues(): void;
    protected initDatasetItems(): void;
    protected postDatasetItemsInit(): void;
    protected resetDatasetItems(): void;
    onPropertyChange(key: string, nv: any, ov?: any): void;
}
