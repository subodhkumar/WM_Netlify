import { ElementRef, Injector } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';
export declare class ColorPickerComponent extends BaseFormCustomComponent {
    static initializeProps: void;
    required: boolean;
    readonly: boolean;
    disabled: boolean;
    name: string;
    placeholder: any;
    tabindex: any;
    shortcutkey: string;
    ngModel: NgModel;
    inputEl: ElementRef;
    constructor(inj: Injector);
    colorPickerToggleChange(isOpen: boolean): void;
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any): void;
    handleChange(newVal: boolean): void;
    protected onPropertyChange(key: string, nv: any, ov: any): void;
}
