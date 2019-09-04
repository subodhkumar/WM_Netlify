import { NgModel } from '@angular/forms';
import { ElementRef, Injector } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AbstractI18nService } from '@wm/core';
import { NumberLocale } from '../text/locale/number-locale';
export declare class NumberComponent extends NumberLocale {
    static initializeProps: void;
    required: boolean;
    regexp: string;
    disabled: boolean;
    name: string;
    tabindex: any;
    shortcutkey: string;
    autofocus: boolean;
    inputEl: ElementRef;
    ngModel: NgModel;
    constructor(inj: Injector, i18nService: AbstractI18nService, decimalPipe: DecimalPipe);
}
