import { ElementRef, Injector } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BaseInput } from '../text/base/base-input';
export declare class TextareaComponent extends BaseInput {
    static initializeProps: void;
    required: boolean;
    maxchars: number;
    disabled: boolean;
    name: string;
    readonly: boolean;
    tabindex: any;
    placeholder: any;
    shortcutkey: string;
    autofocus: boolean;
    inputEl: ElementRef;
    ngModel: NgModel;
    constructor(inj: Injector);
}
