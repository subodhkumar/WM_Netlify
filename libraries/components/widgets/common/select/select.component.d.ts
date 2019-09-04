import { AfterViewInit, ElementRef, Injector } from '@angular/core';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
export declare class SelectComponent extends DatasetAwareFormComponent implements AfterViewInit {
    static initializeProps: void;
    readonly: boolean;
    placeholder: string;
    navsearchbar: any;
    class: any;
    required: boolean;
    disabled: boolean;
    tabindex: any;
    name: string;
    autofocus: boolean;
    selectEl: ElementRef;
    datasource: any;
    constructor(inj: Injector);
    ngAfterViewInit(): void;
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any): void;
    onSelectValueChange($event: any): void;
    onPropertyChange(key: string, nv: any, ov?: any): void;
}
