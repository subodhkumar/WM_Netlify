import { ElementRef, Injector } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BaseInput } from '../base/base-input';
export declare class InputEmailComponent extends BaseInput {
    static initializeProps: void;
    required: boolean;
    maxchars: number;
    disabled: boolean;
    name: string;
    readonly: boolean;
    tabindex: any;
    shortcutkey: string;
    autofocus: boolean;
    autocomplete: any;
    regexp: string;
    placeholder: any;
    inputEl: ElementRef;
    ngModel: NgModel;
    constructor(inj: Injector);
}
