import { ElementRef, Injector } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BaseInput } from '../base/base-input';
export declare class InputNumberComponent extends BaseInput {
    static initializeProps: void;
    required: boolean;
    maxchars: number;
    disabled: boolean;
    name: string;
    readonly: boolean;
    minvalue: number;
    maxvalue: number;
    tabindex: any;
    placeholder: any;
    shortcutkey: string;
    autofocus: boolean;
    autocomplete: any;
    inputEl: ElementRef;
    ngModel: NgModel;
    step: any;
    constructor(inj: Injector);
    onArrowPress($event: any): void;
    validateInputEntry($event: any): boolean;
}
