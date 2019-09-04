import { ElementRef, Injector } from '@angular/core';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
export declare class RatingComponent extends DatasetAwareFormComponent {
    static initializeProps: void;
    caption: string;
    showcaptions: boolean;
    maxvalue: any;
    private _selectedRatingValue;
    ratingsWidth: any;
    private ratingItems;
    private _id;
    iconsize: string;
    iconcolor: string;
    onFocus: any;
    ratingEl: ElementRef;
    selectedRatingValue: any;
    constructor(inj: Injector);
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any): void;
    private prepareRatingDataset;
    onRatingClick($event: any, rate: any): void;
    /**
     * On datavalue change, update the caption, selectedRatingValue.
     * 1. if datasetItems contain the selected item (check the selected flag on item), find the index of selected item.
     * 2. if not, just check if the datavalue is provided as the index on the item.
     *
     * @param dataVal datavalue
     */
    onDatavalueChange(dataVal: any): void;
    calculateRatingsWidth(dataVal?: any): string | 0;
    onPropertyChange(key: string, nv: any, ov?: any): void;
    onMouseleave(): void;
    onMouseOver($event: any, rate: any): void;
}
