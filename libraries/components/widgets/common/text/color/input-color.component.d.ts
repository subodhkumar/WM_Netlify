import { ElementRef, Injector } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BaseInput } from '../base/base-input';
export declare class InputColorComponent extends BaseInput {
    static initializeProps: void;
    required: boolean;
    maxchars: number;
    name: string;
    readonly: boolean;
    tabindex: any;
    shortcutkey: string;
    autofocus: boolean;
    disabled: boolean;
    placeholder: any;
    inputEl: ElementRef;
    ngModel: NgModel;
    constructor(inj: Injector);
}
