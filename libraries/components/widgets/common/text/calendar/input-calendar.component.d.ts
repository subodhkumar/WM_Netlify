import { ElementRef, Injector } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BaseInput } from '../base/base-input';
export declare class InputCalendarComponent extends BaseInput {
    static initializeProps: void;
    required: boolean;
    disabled: boolean;
    type: string;
    name: string;
    readonly: string;
    minvalue: any;
    maxvalue: any;
    step: number;
    tabindex: any;
    placeholder: any;
    shortcutkey: string;
    autofocus: boolean;
    autocomplete: any;
    inputEl: ElementRef;
    ngModel: NgModel;
    constructor(inj: Injector);
}
