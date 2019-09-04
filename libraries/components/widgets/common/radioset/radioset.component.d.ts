import { Injector } from '@angular/core';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
export declare class RadiosetComponent extends DatasetAwareFormComponent {
    static initializeProps: void;
    layout: string;
    disabled: boolean;
    constructor(inj: Injector);
    /**
     * On click of the option, update the datavalue
     */
    onRadioLabelClick($event: any, key: any): void;
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any): void;
    onPropertyChange(key: any, nv: any, ov?: any): void;
}
