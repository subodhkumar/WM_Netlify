import { AfterViewInit, Injector } from '@angular/core';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { DataSetItem } from '../../../utils/form-utils';
export declare class SwitchComponent extends DatasetAwareFormComponent implements AfterViewInit {
    static initializeProps: void;
    options: any[];
    selectedItem: DataSetItem;
    iconclass: any;
    private btnwidth;
    disabled: boolean;
    required: boolean;
    private _debounceSetSelectedValue;
    name: string;
    constructor(inj: Injector);
    ngAfterViewInit(): void;
    onStyleChange(key: string, nv: any, ov?: any): void;
    private setSelectedValue;
    private updateSwitchOptions;
    private updateHighlighter;
    selectOptAtIndex($index: any): void;
    selectOpt($event: any, $index: any, option: any): void;
    onPropertyChange(key: any, nv: any, ov?: any): void;
}
