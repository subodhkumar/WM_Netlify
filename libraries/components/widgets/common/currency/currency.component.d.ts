import { ElementRef, Injector } from '@angular/core';
import { NgModel } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { AbstractI18nService } from '@wm/core';
import { NumberLocale } from '../text/locale/number-locale';
export declare class CurrencyComponent extends NumberLocale {
    static initializeProps: void;
    currency: string;
    currencySymbol: string;
    required: boolean;
    regexp: any;
    disabled: boolean;
    autofocus: boolean;
    name: string;
    tabindex: any;
    shortcutkey: string;
    ngModel: NgModel;
    inputEl: ElementRef;
    constructor(inj: Injector, i18nService: AbstractI18nService, decimalPipe: DecimalPipe);
    onPropertyChange(key: string, nv: any, ov?: any): void;
}
