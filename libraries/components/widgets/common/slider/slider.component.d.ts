import { Injector } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';
export declare class SliderComponent extends BaseFormCustomComponent {
    static initializeProps: void;
    minvalue: number;
    maxvalue: number;
    disabled: boolean;
    step: number;
    shortcutkey: string;
    tabindex: any;
    name: string;
    readonly: boolean;
    ngModel: NgModel;
    constructor(inj: Injector);
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any): void;
    handleChange(newVal: boolean): void;
    onPropertyChange(key: string, nv: any, ov?: any): void;
}
