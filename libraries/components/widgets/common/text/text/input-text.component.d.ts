import { ElementRef, Injector } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BaseInput } from '../base/base-input';
export declare class InputTextComponent extends BaseInput {
    static initializeProps: void;
    required: boolean;
    maxchars: number;
    regexp: string;
    displayformat: string;
    disabled: boolean;
    type: any;
    name: string;
    readonly: boolean;
    tabindex: any;
    placeholder: any;
    shortcutkey: string;
    autofocus: boolean;
    autocomplete: any;
    maskVal: any;
    inputEl: ElementRef;
    ngModel: NgModel;
    constructor(inj: Injector);
    onPropertyChange(key: any, nv: any, ov: any): void;
    readonly mask: {
        mask: any;
        showMask: boolean;
    } | {
        mask: boolean;
        showMask?: undefined;
    };
}
