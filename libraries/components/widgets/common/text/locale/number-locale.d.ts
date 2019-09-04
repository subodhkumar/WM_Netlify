import { Injector } from '@angular/core';
import { AbstractControl, Validator } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { AbstractI18nService } from '@wm/core';
import { BaseInput } from '../base/base-input';
import { IWidgetConfig } from '../../../framework/types';
export declare abstract class NumberLocale extends BaseInput implements Validator {
    private decimalPipe;
    private DECIMAL;
    private GROUP;
    private selectedLocale;
    private proxyModel;
    private numberNotInRange;
    private isInvalidNumber;
    private isDefaultQuery;
    displayValue: string;
    private numberfilter;
    private localefilter;
    readonly: boolean;
    placeholder: string;
    minvalue: number;
    maxvalue: number;
    updateon: string;
    step: number;
    constructor(inj: Injector, config: IWidgetConfig, i18nService: AbstractI18nService, decimalPipe: DecimalPipe);
    datavalue: number;
    protected resetValidations(): void;
    /**
     * Adds validations for the number before updating the widget model. like validating min and max value for the widget.
     * @param {number} val number to be validated
     * @returns {number}
     */
    private isValid;
    /**
     * returns a valid number by validating the minimum and maximum values.
     * @param {number} value
     * @returns {number}
     */
    private getValueInRange;
    /**
     * convert number to localized number using angular decimal pipe. eg 10,00,000 or 1,000,000
     * @param number
     * @returns {string}
     */
    private transformNumber;
    /**
     * resets the cursor position in the text box.
     * @param {number} value cursor position index form left to right.
     */
    private resetCursorPosition;
    /**
     * Method parses the Localized number(string) to a valid number.
     * if the string dose not result to a valid number then returns NaN.
     * @param {string} val Localized number.
     * @returns {number}
     */
    private parseNumber;
    private updateDisplayText;
    /**
     * returns the number of decimal places a number have.
     * @param value: number
     * @returns {number}
     */
    private countDecimals;
    /**
     * handles the arrow press event. Increases or decreases the number. triggered fom the template
     * @param $event keyboard event.
     * @param key identifier to increase or decrease the number.
     */
    onArrowPress($event: any, key: any): void;
    /**
     * method is called from the from widget. to check whether the value entered is valid or not.
     * @returns {object}
     */
    validate(c: AbstractControl): {
        invalidNumber: {
            valid: boolean;
        };
        numberNotInRange?: undefined;
    } | {
        numberNotInRange: {
            valid: boolean;
        };
        invalidNumber?: undefined;
    };
    validateInputEntry($event: any): boolean;
    onEnter($event: any): void;
}
