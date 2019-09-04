import { Injector } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
export declare const TYPE_CLASS_MAP: {
    'default': string;
    'default-striped': string;
    'success': string;
    'success-striped': string;
    'info': string;
    'info-striped': string;
    'warning': string;
    'warning-striped': string;
    'danger': string;
    'danger-striped': string;
};
interface IProgressInfo {
    cls: string;
    progressBarWidth: string;
    displayValue: string;
}
export declare class ProgressBarComponent extends StylableComponent {
    static initializeProps: void;
    displayformat: string;
    datavalue: string;
    minvalue: number;
    maxvalue: number;
    type: string;
    dataset: Array<any>;
    private _prepareData;
    private readonly hasDataset;
    data: Array<IProgressInfo>;
    constructor(inj: Injector, dataset: string, boundDataset: string);
    protected onTypeChange(): void;
    protected getFormattedDisplayVal(val: string | number): string;
    protected prepareData(): void;
    onPropertyChange(key: string, nv: any, ov?: any): void;
}
export {};
