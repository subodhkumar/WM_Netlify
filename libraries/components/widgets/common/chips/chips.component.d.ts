import { AfterViewInit, Injector, OnInit } from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { DataSetItem } from '../../../utils/form-utils';
export declare class ChipsComponent extends DatasetAwareFormComponent implements OnInit, AfterViewInit {
    private bindDisplayField;
    private bindDisplayExpr;
    private bindDisplayImgSrc;
    private bindDataField;
    private bindDataSet;
    private bindChipclass;
    static initializeProps: void;
    allowonlyselect: boolean;
    enablereorder: boolean;
    maxsize: number;
    inputwidth: any;
    private debouncetime;
    chipsList: Array<any>;
    private readonly maxSizeReached;
    private saturate;
    private nextItemIndex;
    private getTransformedData;
    private inputposition;
    private showsearchicon;
    searchComponent: SearchComponent;
    private _datasource;
    private _unsubscribeDv;
    private searchkey;
    private _debounceUpdateQueryModel;
    private limit;
    private _classExpr;
    private minchars;
    private matchmode;
    datasource: any;
    constructor(inj: Injector, bindDisplayField: any, bindDisplayExpr: any, bindDisplayImgSrc: any, bindDataField: any, bindDataSet: any, bindChipclass: any);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    /**
     * This method returns the evaluated class expression.
     * @param $index index of the chip
     * @param item chip object containing the key, value, label
     * @returns {any} evaluated class expression value
     */
    private registerChipItemClass;
    private applyItemClass;
    private removeDuplicates;
    private updateQueryModel;
    private resetSearchModel;
    onSelect($event: Event): void;
    private addItem;
    private createCustomDataModel;
    private isDuplicate;
    private updateMaxSize;
    protected getDefaultModel(query: Array<string> | string, index?: number): Promise<any>;
    private handleChipClick;
    private handleChipFocus;
    private stopEvent;
    onTextDelete($event: Event): void;
    onInputClear($event: Event): void;
    private onBackspace;
    private onDelete;
    onArrowLeft($item?: DataSetItem, $index?: number): void;
    onArrowRight($item?: DataSetItem, $index?: number): void;
    private focusSearchBox;
    private removeItem;
    /**
     * Swaps items in an array if provided with indexes.
     * @param data :- array to be swapped
     * @param newIndex :- new index for the element to be placed
     * @param currentIndex :- the current index of the element.
     */
    private swapElementsInArray;
    /**
     * Cancels the reorder by reseting the elements to the original position.
     */
    private resetReorder;
    private onBeforeservicecall;
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any): void;
    private configureDnD;
    private onReorderStart;
    private update;
    onPropertyChange(key: string, nv: any, ov: any): void;
}
