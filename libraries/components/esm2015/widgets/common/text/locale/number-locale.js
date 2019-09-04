import { getLocaleNumberSymbol, NumberSymbol } from '@angular/common';
import { BaseInput } from '../base/base-input';
export class NumberLocale extends BaseInput {
    constructor(inj, config, i18nService, decimalPipe) {
        super(inj, config);
        this.decimalPipe = decimalPipe;
        this.isDefaultQuery = true;
        this.selectedLocale = i18nService.getSelectedLocale();
        this.DECIMAL = getLocaleNumberSymbol(this.localefilter || this.selectedLocale, NumberSymbol.Decimal);
        this.GROUP = getLocaleNumberSymbol(this.localefilter || this.selectedLocale, NumberSymbol.Group);
        this.numberfilter = '1.0-16';
        this.resetValidations();
    }
    // Setter for the datavalue.
    set datavalue(value) {
        // set text value to null if data value is empty.
        if (_.includes([null, undefined, ''], value)) {
            const input = this.inputEl.nativeElement;
            this.displayValue = input.value = this.proxyModel = null;
            this.resetValidations();
            this._onChange();
            return;
        }
        // if the widget has default value and if we change the locale, the value should be in selected locale format.
        if (this.isDefaultQuery) {
            value = this.transformNumber(value);
        }
        // get a valid number form the text.
        const model = this.parseNumber(value.toString());
        // if the number is valid or if number is not in range update the model value.
        if (this.isValid(model)) {
            this.proxyModel = model;
            // update the display value in the text box.
            this.updateDisplayText();
            this.handleChange(model);
        }
        else {
            this.displayValue = value.toString();
            this.proxyModel = null;
            this.handleChange(null);
        }
    }
    // returns the actual model value of the widget.
    get datavalue() {
        return this.proxyModel;
    }
    // resets all the flags related to the widget's validation.
    resetValidations() {
        this.isInvalidNumber = false;
        this.numberNotInRange = false;
    }
    /**
     * Adds validations for the number before updating the widget model. like validating min and max value for the widget.
     * @param {number} val number to be validated
     * @returns {number}
     */
    isValid(val) {
        // id number is infinite then consider it as invalid value
        if (_.isNaN(val) || !_.isFinite(val)) {
            this.isInvalidNumber = true;
            return false;
        }
        if (val !== this.getValueInRange(val)) {
            this.numberNotInRange = true;
            return true;
        }
        this.resetValidations();
        return true;
    }
    /**
     * returns a valid number by validating the minimum and maximum values.
     * @param {number} value
     * @returns {number}
     */
    getValueInRange(value) {
        if (!_.isNaN(this.minvalue) && value < this.minvalue) {
            return this.minvalue;
        }
        if (!_.isNaN(this.maxvalue) && value > this.maxvalue) {
            return this.maxvalue;
        }
        return value;
    }
    /**
     * convert number to localized number using angular decimal pipe. eg 10,00,000 or 1,000,000
     * @param number
     * @returns {string}
     */
    transformNumber(number) {
        return this.decimalPipe.transform(number, this.numberfilter, this.localefilter || this.selectedLocale);
    }
    /**
     * resets the cursor position in the text box.
     * @param {number} value cursor position index form left to right.
     */
    resetCursorPosition(value) {
        const input = this.inputEl.nativeElement;
        // position of the cursor should be given form right to left.
        let position = input.value.length - value;
        position = position < 0 ? 0 : position;
        // set the cursor position in the text box.
        input.setSelectionRange(position, position);
    }
    /**
     * Method parses the Localized number(string) to a valid number.
     * if the string dose not result to a valid number then returns NaN.
     * @param {string} val Localized number.
     * @returns {number}
     */
    parseNumber(val) {
        // splits string into two parts. decimal and number.
        const parts = val.split(this.DECIMAL);
        if (!parts.length) {
            return null;
        }
        if (parts.length > 2) {
            return NaN;
        }
        // If number have decimal point and not have a decimal value then return.
        if (parts[1] === '') {
            return NaN;
        }
        // replaces all group separators form the number.
        const number = Number(parts[0].split(this.GROUP).join(''));
        const decimal = Number(`0.${parts[1] || 0}`);
        if (Number.isNaN(number) || Number.isNaN(decimal)) {
            return NaN;
        }
        // if the number is negative then calculate the number as number - decimal
        // Ex: number = -123 and decimal = 0.45 then number - decimal = -123-045 = -123.45
        return number >= 0 ? number + decimal : number - decimal;
    }
    // updates the widgets text value.
    updateDisplayText() {
        const input = this.inputEl.nativeElement;
        const position = input.selectionStart;
        const preValue = input.value;
        this.displayValue = input.value = this.transformNumber(this.proxyModel);
        // in safari browser, setSelectionRange will focus the input by default, which may invoke the focus event on widget.
        // Hence preventing the setSelectionRange when default value is set i.e. widget is not focused.
        if (this.updateon === 'default' && !this.isDefaultQuery) {
            this.resetCursorPosition(preValue.length - position);
        }
    }
    /**
     * returns the number of decimal places a number have.
     * @param value: number
     * @returns {number}
     */
    countDecimals(value) {
        if ((value % 1) !== 0) {
            return value.toString().split('.')[1].length;
        }
        return 0;
    }
    /**
     * handles the arrow press event. Increases or decreases the number. triggered fom the template
     * @param $event keyboard event.
     * @param key identifier to increase or decrease the number.
     */
    onArrowPress($event, key) {
        $event.preventDefault();
        if (this.readonly || this.step === 0) {
            return;
        }
        let proxyModel = this.proxyModel;
        let value;
        // if the number is not in range and when arrow buttons are pressed need to get appropriate number value.
        if (this.numberNotInRange) {
            const inputValue = this.parseNumber(this.inputEl.nativeElement.value);
            // take the textbox value as current model if the value is valid.
            if (!_.isNaN(inputValue)) {
                value = this.getValueInRange(inputValue);
                proxyModel = inputValue;
                this.resetValidations();
            }
        }
        else {
            if (_.isUndefined(proxyModel) || _.isNull(proxyModel)) {
                proxyModel = value = this.getValueInRange((this.minvalue || 0));
                this.resetValidations();
            }
            else {
                value = this.getValueInRange(proxyModel + (key === 'UP' ? this.step : -this.step));
            }
        }
        if ((key === 'UP' && proxyModel <= value) || (key === 'DOWN' && proxyModel >= value)) {
            const decimalRoundValue = Math.max(this.countDecimals(proxyModel), this.countDecimals(this.step));
            // update the modelProxy.
            this.proxyModel = _.round(value, decimalRoundValue);
            this.updateDisplayText();
            this.handleChange(this.proxyModel);
        }
    }
    /**
     * method is called from the from widget. to check whether the value entered is valid or not.
     * @returns {object}
     */
    validate(c) {
        if (this.isInvalidNumber) {
            return {
                invalidNumber: {
                    valid: false
                },
            };
        }
        if (this.numberNotInRange) {
            return {
                numberNotInRange: {
                    valid: false
                },
            };
        }
        return null;
    }
    validateInputEntry($event) {
        this.isDefaultQuery = false;
        // allow actions if control key is pressed or if backspace is pressed. (for Mozilla).
        if ($event.ctrlKey || _.includes(['Backspace', 'ArrowRight', 'ArrowLeft', 'Tab', 'Enter'], $event.key)) {
            return;
        }
        const validity = new RegExp(`^[\\d\\s-,.e+${this.GROUP}${this.DECIMAL}]$`, 'i');
        const inputValue = $event.target.value;
        // validates if user entered an invalid character.
        if (!validity.test($event.key)) {
            return false;
        }
        // a decimal value can be entered only once in the input.
        if (_.includes(inputValue, this.DECIMAL) && $event.key === this.DECIMAL) {
            return false;
        }
        // 'e' can be entered only once in the input.
        if (_.intersection(_.toArray(inputValue), ['e', 'E']).length && _.includes('eE', $event.key)) {
            return false;
        }
        if ((_.includes(inputValue, '+') || _.includes(inputValue, '-')) && ($event.key === '+' || $event.key === '-')) {
            return false;
        }
    }
    onEnter($event) {
        this.datavalue = $event.target.value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLWxvY2FsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGV4dC9sb2NhbGUvbnVtYmVyLWxvY2FsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQWUscUJBQXFCLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFJbkYsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBSy9DLE1BQU0sT0FBZ0IsWUFBYSxTQUFRLFNBQVM7SUFtQmhELFlBQ0ksR0FBYSxFQUNiLE1BQXFCLEVBQ3JCLFdBQWdDLEVBQ3hCLFdBQXdCO1FBRWhDLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFGWCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQWhCNUIsbUJBQWMsR0FBWSxJQUFJLENBQUM7UUFtQm5DLElBQUksQ0FBQyxjQUFjLEdBQUcsV0FBVyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JHLElBQUksQ0FBQyxLQUFLLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqRyxJQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztRQUM3QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQsNEJBQTRCO0lBQzVCLElBQUksU0FBUyxDQUFFLEtBQWE7UUFDeEIsaURBQWlEO1FBQ2pELElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxD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QUMsQ0FBQztRQUNoRixNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUN2QyxrREFBa0Q7UUFDbEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzVCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QseURBQXlEO1FBQ3pELElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNyRSxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELDZDQUE2QztRQUM3QyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDMUYsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUUsSUFBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDOUcsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQU07UUFDVixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ3pDLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBYnN0cmFjdENvbnRyb2wsIFZhbGlkYXRvciB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IERlY2ltYWxQaXBlLCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wsIE51bWJlclN5bWJvbCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7IEFic3RyYWN0STE4blNlcnZpY2UgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEJhc2VJbnB1dCB9IGZyb20gJy4uL2Jhc2UvYmFzZS1pbnB1dCc7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTnVtYmVyTG9jYWxlIGV4dGVuZHMgQmFzZUlucHV0IGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAgICBwcml2YXRlIERFQ0lNQUw6IHN0cmluZztcbiAgICBwcml2YXRlIEdST1VQOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBzZWxlY3RlZExvY2FsZTogc3RyaW5nO1xuICAgIHByaXZhdGUgcHJveHlNb2RlbDogbnVtYmVyO1xuICAgIHByaXZhdGUgbnVtYmVyTm90SW5SYW5nZTogYm9vbGVhbjtcbiAgICBwcml2YXRlIGlzSW52YWxpZE51bWJlcjogYm9vbGVhbjtcbiAgICBwcml2YXRlIGlzRGVmYXVsdFF1ZXJ5OiBib29sZWFuID0gdHJ1ZTtcbiAgICBwdWJsaWMgZGlzcGxheVZhbHVlOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBudW1iZXJmaWx0ZXI6IHN0cmluZztcbiAgICBwcml2YXRlIGxvY2FsZWZpbHRlcjogc3RyaW5nO1xuICAgIHB1YmxpYyByZWFkb25seTogYm9vbGVhbjtcblxuICAgIHB1YmxpYyBwbGFjZWhvbGRlcjogc3RyaW5nO1xuICAgIHB1YmxpYyBtaW52YWx1ZTogbnVtYmVyO1xuICAgIHB1YmxpYyBtYXh2YWx1ZTogbnVtYmVyO1xuICAgIHB1YmxpYyB1cGRhdGVvbjogc3RyaW5nO1xuICAgIHB1YmxpYyBzdGVwOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgY29uZmlnOiBJV2lkZ2V0Q29uZmlnLFxuICAgICAgICBpMThuU2VydmljZTogQWJzdHJhY3RJMThuU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBkZWNpbWFsUGlwZTogRGVjaW1hbFBpcGVcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBjb25maWcpO1xuICAgICAgICB0aGlzLnNlbGVjdGVkTG9jYWxlID0gaTE4blNlcnZpY2UuZ2V0U2VsZWN0ZWRMb2NhbGUoKTtcbiAgICAgICAgdGhpcy5ERUNJTUFMID0gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKHRoaXMubG9jYWxlZmlsdGVyIHx8IHRoaXMuc2VsZWN0ZWRMb2NhbGUsIE51bWJlclN5bWJvbC5EZWNpbWFsKTtcbiAgICAgICAgdGhpcy5HUk9VUCA9IGdldExvY2FsZU51bWJlclN5bWJvbCh0aGlzLmxvY2FsZWZpbHRlciB8fCB0aGlzLnNlbGVjdGVkTG9jYWxlLCBOdW1iZXJTeW1ib2wuR3JvdXApO1xuICAgICAgICB0aGlzLm51bWJlcmZpbHRlciA9ICcxLjAtMTYnO1xuICAgICAgICB0aGlzLnJlc2V0VmFsaWRhdGlvbnMoKTtcbiAgICB9XG5cbiAgICAvLyBTZXR0ZXIgZm9yIHRoZSBkYXRhdmFsdWUuXG4gICAgc2V0IGRhdGF2YWx1ZSAodmFsdWU6IG51bWJlcikge1xuICAgICAgICAvLyBzZXQgdGV4dCB2YWx1ZSB0byBudWxsIGlmIGRhdGEgdmFsdWUgaXMgZW1wdHkuXG4gICAgICAgIGlmIChfLmluY2x1ZGVzKFtudWxsLCB1bmRlZmluZWQsICcnXSwgdmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBpbnB1dCA9IHRoaXMuaW5wdXRFbC5uYXRpdmVFbGVtZW50O1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5VmFsdWUgPSBpbnB1dC52YWx1ZSA9IHRoaXMucHJveHlNb2RlbCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnJlc2V0VmFsaWRhdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuX29uQ2hhbmdlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgdGhlIHdpZGdldCBoYXMgZGVmYXVsdCB2YWx1ZSBhbmQgaWYgd2UgY2hhbmdlIHRoZSBsb2NhbGUsIHRoZSB2YWx1ZSBzaG91bGQgYmUgaW4gc2VsZWN0ZWQgbG9jYWxlIGZvcm1hdC5cbiAgICAgICAgaWYgKHRoaXMuaXNEZWZhdWx0UXVlcnkpIHtcbiAgICAgICAgICAgICh2YWx1ZSBhcyBhbnkpICA9IHRoaXMudHJhbnNmb3JtTnVtYmVyKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdldCBhIHZhbGlkIG51bWJlciBmb3JtIHRoZSB0ZXh0LlxuICAgICAgICBjb25zdCBtb2RlbCA9IHRoaXMucGFyc2VOdW1iZXIodmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgIC8vIGlmIHRoZSBudW1iZXIgaXMgdmFsaWQgb3IgaWYgbnVtYmVyIGlzIG5vdCBpbiByYW5nZSB1cGRhdGUgdGhlIG1vZGVsIHZhbHVlLlxuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkKG1vZGVsKSkge1xuICAgICAgICAgICAgdGhpcy5wcm94eU1vZGVsID0gbW9kZWw7XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGRpc3BsYXkgdmFsdWUgaW4gdGhlIHRleHQgYm94LlxuICAgICAgICAgICAgdGhpcy51cGRhdGVEaXNwbGF5VGV4dCgpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVDaGFuZ2UobW9kZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5VmFsdWUgPSB2YWx1ZS50b1N0cmluZygpO1xuICAgICAgICAgICAgdGhpcy5wcm94eU1vZGVsID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2hhbmdlKG51bGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyB0aGUgYWN0dWFsIG1vZGVsIHZhbHVlIG9mIHRoZSB3aWRnZXQuXG4gICAgZ2V0IGRhdGF2YWx1ZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm94eU1vZGVsO1xuICAgIH1cblxuICAgIC8vIHJlc2V0cyBhbGwgdGhlIGZsYWdzIHJlbGF0ZWQgdG8gdGhlIHdpZGdldCdzIHZhbGlkYXRpb24uXG4gICAgcHJvdGVjdGVkIHJlc2V0VmFsaWRhdGlvbnMoKSB7XG4gICAgICAgIHRoaXMuaXNJbnZhbGlkTnVtYmVyID0gZmFsc2U7XG4gICAgICAgIHRoaXMubnVtYmVyTm90SW5SYW5nZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgdmFsaWRhdGlvbnMgZm9yIHRoZSBudW1iZXIgYmVmb3JlIHVwZGF0aW5nIHRoZSB3aWRnZXQgbW9kZWwuIGxpa2UgdmFsaWRhdGluZyBtaW4gYW5kIG1heCB2YWx1ZSBmb3IgdGhlIHdpZGdldC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsIG51bWJlciB0byBiZSB2YWxpZGF0ZWRcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHByaXZhdGUgaXNWYWxpZCh2YWw6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvLyBpZCBudW1iZXIgaXMgaW5maW5pdGUgdGhlbiBjb25zaWRlciBpdCBhcyBpbnZhbGlkIHZhbHVlXG4gICAgICAgIGlmIChfLmlzTmFOKHZhbCkgfHwgIV8uaXNGaW5pdGUodmFsKSkge1xuICAgICAgICAgICAgdGhpcy5pc0ludmFsaWROdW1iZXIgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWwgIT09IHRoaXMuZ2V0VmFsdWVJblJhbmdlKHZhbCkpIHtcbiAgICAgICAgICAgIHRoaXMubnVtYmVyTm90SW5SYW5nZSA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc2V0VmFsaWRhdGlvbnMoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyBhIHZhbGlkIG51bWJlciBieSB2YWxpZGF0aW5nIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0VmFsdWVJblJhbmdlKHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBpZiAoIV8uaXNOYU4odGhpcy5taW52YWx1ZSkgJiYgdmFsdWUgPCB0aGlzLm1pbnZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5taW52YWx1ZTtcblxuICAgICAgICB9XG4gICAgICAgIGlmICghXy5pc05hTih0aGlzLm1heHZhbHVlKSAmJiB2YWx1ZSA+IHRoaXMubWF4dmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1heHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjb252ZXJ0IG51bWJlciB0byBsb2NhbGl6ZWQgbnVtYmVyIHVzaW5nIGFuZ3VsYXIgZGVjaW1hbCBwaXBlLiBlZyAxMCwwMCwwMDAgb3IgMSwwMDAsMDAwXG4gICAgICogQHBhcmFtIG51bWJlclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHJpdmF0ZSB0cmFuc2Zvcm1OdW1iZXIobnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVjaW1hbFBpcGUudHJhbnNmb3JtKG51bWJlciwgdGhpcy5udW1iZXJmaWx0ZXIsIHRoaXMubG9jYWxlZmlsdGVyIHx8IHRoaXMuc2VsZWN0ZWRMb2NhbGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJlc2V0cyB0aGUgY3Vyc29yIHBvc2l0aW9uIGluIHRoZSB0ZXh0IGJveC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgY3Vyc29yIHBvc2l0aW9uIGluZGV4IGZvcm0gbGVmdCB0byByaWdodC5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlc2V0Q3Vyc29yUG9zaXRpb24odmFsdWU6IG51bWJlcikge1xuICAgICAgICBjb25zdCBpbnB1dCA9IHRoaXMuaW5wdXRFbC5uYXRpdmVFbGVtZW50O1xuICAgICAgICAvLyBwb3NpdGlvbiBvZiB0aGUgY3Vyc29yIHNob3VsZCBiZSBnaXZlbiBmb3JtIHJpZ2h0IHRvIGxlZnQuXG4gICAgICAgIGxldCBwb3NpdGlvbiA9IGlucHV0LnZhbHVlLmxlbmd0aCAtIHZhbHVlO1xuICAgICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uIDwgMCA/IDAgOiBwb3NpdGlvbjtcbiAgICAgICAgLy8gc2V0IHRoZSBjdXJzb3IgcG9zaXRpb24gaW4gdGhlIHRleHQgYm94LlxuICAgICAgICBpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZShwb3NpdGlvbiwgcG9zaXRpb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCBwYXJzZXMgdGhlIExvY2FsaXplZCBudW1iZXIoc3RyaW5nKSB0byBhIHZhbGlkIG51bWJlci5cbiAgICAgKiBpZiB0aGUgc3RyaW5nIGRvc2Ugbm90IHJlc3VsdCB0byBhIHZhbGlkIG51bWJlciB0aGVuIHJldHVybnMgTmFOLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWwgTG9jYWxpemVkIG51bWJlci5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHByaXZhdGUgcGFyc2VOdW1iZXIodmFsOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICAvLyBzcGxpdHMgc3RyaW5nIGludG8gdHdvIHBhcnRzLiBkZWNpbWFsIGFuZCBudW1iZXIuXG4gICAgICAgIGNvbnN0IHBhcnRzID0gdmFsLnNwbGl0KHRoaXMuREVDSU1BTCk7XG4gICAgICAgIGlmICghcGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBudW1iZXIgaGF2ZSBkZWNpbWFsIHBvaW50IGFuZCBub3QgaGF2ZSBhIGRlY2ltYWwgdmFsdWUgdGhlbiByZXR1cm4uXG4gICAgICAgIGlmIChwYXJ0c1sxXSA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVwbGFjZXMgYWxsIGdyb3VwIHNlcGFyYXRvcnMgZm9ybSB0aGUgbnVtYmVyLlxuICAgICAgICBjb25zdCBudW1iZXIgPSBOdW1iZXIocGFydHNbMF0uc3BsaXQodGhpcy5HUk9VUCkuam9pbignJykpO1xuICAgICAgICBjb25zdCBkZWNpbWFsID0gTnVtYmVyKGAwLiR7cGFydHNbMV0gfHwgMH1gKTtcbiAgICAgICAgaWYgKCBOdW1iZXIuaXNOYU4obnVtYmVyKSB8fCBOdW1iZXIuaXNOYU4oZGVjaW1hbCkpIHtcbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgdGhlIG51bWJlciBpcyBuZWdhdGl2ZSB0aGVuIGNhbGN1bGF0ZSB0aGUgbnVtYmVyIGFzIG51bWJlciAtIGRlY2ltYWxcbiAgICAgICAgLy8gRXg6IG51bWJlciA9IC0xMjMgYW5kIGRlY2ltYWwgPSAwLjQ1IHRoZW4gbnVtYmVyIC0gZGVjaW1hbCA9IC0xMjMtMDQ1ID0gLTEyMy40NVxuICAgICAgICByZXR1cm4gbnVtYmVyID49IDAgPyBudW1iZXIgKyBkZWNpbWFsIDogbnVtYmVyIC0gZGVjaW1hbDtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGVzIHRoZSB3aWRnZXRzIHRleHQgdmFsdWUuXG4gICAgcHJpdmF0ZSB1cGRhdGVEaXNwbGF5VGV4dCgpIHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSB0aGlzLmlucHV0RWwubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY29uc3QgcG9zaXRpb246IG51bWJlciA9IGlucHV0LnNlbGVjdGlvblN0YXJ0O1xuICAgICAgICBjb25zdCBwcmVWYWx1ZTogc3RyaW5nID0gaW5wdXQudmFsdWU7XG4gICAgICAgIHRoaXMuZGlzcGxheVZhbHVlID0gaW5wdXQudmFsdWUgID0gdGhpcy50cmFuc2Zvcm1OdW1iZXIodGhpcy5wcm94eU1vZGVsKTtcbiAgICAgICAgLy8gaW4gc2FmYXJpIGJyb3dzZXIsIHNldFNlbGVjdGlvblJhbmdlIHdpbGwgZm9jdXMgdGhlIGlucHV0IGJ5IGRlZmF1bHQsIHdoaWNoIG1heSBpbnZva2UgdGhlIGZvY3VzIGV2ZW50IG9uIHdpZGdldC5cbiAgICAgICAgLy8gSGVuY2UgcHJldmVudGluZyB0aGUgc2V0U2VsZWN0aW9uUmFuZ2Ugd2hlbiBkZWZhdWx0IHZhbHVlIGlzIHNldCBpLmUuIHdpZGdldCBpcyBub3QgZm9jdXNlZC5cbiAgICAgICAgaWYgKHRoaXMudXBkYXRlb24gPT09ICdkZWZhdWx0JyAmJiAhdGhpcy5pc0RlZmF1bHRRdWVyeSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldEN1cnNvclBvc2l0aW9uKHByZVZhbHVlLmxlbmd0aCAtIHBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgdGhlIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBhIG51bWJlciBoYXZlLlxuICAgICAqIEBwYXJhbSB2YWx1ZTogbnVtYmVyXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBwcml2YXRlIGNvdW50RGVjaW1hbHMgKHZhbHVlKSB7XG4gICAgICAgIGlmICgodmFsdWUgJSAxKSAhPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCkuc3BsaXQoJy4nKVsxXS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaGFuZGxlcyB0aGUgYXJyb3cgcHJlc3MgZXZlbnQuIEluY3JlYXNlcyBvciBkZWNyZWFzZXMgdGhlIG51bWJlci4gdHJpZ2dlcmVkIGZvbSB0aGUgdGVtcGxhdGVcbiAgICAgKiBAcGFyYW0gJGV2ZW50IGtleWJvYXJkIGV2ZW50LlxuICAgICAqIEBwYXJhbSBrZXkgaWRlbnRpZmllciB0byBpbmNyZWFzZSBvciBkZWNyZWFzZSB0aGUgbnVtYmVyLlxuICAgICAqL1xuICAgIHB1YmxpYyBvbkFycm93UHJlc3MoJGV2ZW50LCBrZXkpIHtcbiAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICh0aGlzLnJlYWRvbmx5IHx8IHRoaXMuc3RlcCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBwcm94eU1vZGVsID0gdGhpcy5wcm94eU1vZGVsO1xuICAgICAgICBsZXQgdmFsdWU7XG5cbiAgICAgICAgLy8gaWYgdGhlIG51bWJlciBpcyBub3QgaW4gcmFuZ2UgYW5kIHdoZW4gYXJyb3cgYnV0dG9ucyBhcmUgcHJlc3NlZCBuZWVkIHRvIGdldCBhcHByb3ByaWF0ZSBudW1iZXIgdmFsdWUuXG4gICAgICAgIGlmICh0aGlzLm51bWJlck5vdEluUmFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0VmFsdWUgPSB0aGlzLnBhcnNlTnVtYmVyKHRoaXMuaW5wdXRFbC5uYXRpdmVFbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIC8vIHRha2UgdGhlIHRleHRib3ggdmFsdWUgYXMgY3VycmVudCBtb2RlbCBpZiB0aGUgdmFsdWUgaXMgdmFsaWQuXG4gICAgICAgICAgICBpZiAoIV8uaXNOYU4oaW5wdXRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5nZXRWYWx1ZUluUmFuZ2UoaW5wdXRWYWx1ZSk7XG4gICAgICAgICAgICAgICBwcm94eU1vZGVsID0gaW5wdXRWYWx1ZTtcbiAgICAgICAgICAgICAgIHRoaXMucmVzZXRWYWxpZGF0aW9ucygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQocHJveHlNb2RlbCkgfHwgXy5pc051bGwocHJveHlNb2RlbCkpIHtcbiAgICAgICAgICAgICAgICBwcm94eU1vZGVsID0gdmFsdWUgPSB0aGlzLmdldFZhbHVlSW5SYW5nZSggKHRoaXMubWludmFsdWUgfHwgMCkpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzZXRWYWxpZGF0aW9ucygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWVJblJhbmdlKCBwcm94eU1vZGVsICsgKGtleSA9PT0gJ1VQJyA/IHRoaXMuc3RlcCA6IC10aGlzLnN0ZXApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoKGtleSA9PT0gJ1VQJyAmJiBwcm94eU1vZGVsIDw9IHZhbHVlKSB8fCAoa2V5ID09PSAnRE9XTicgJiYgcHJveHlNb2RlbCA+PSB2YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRlY2ltYWxSb3VuZFZhbHVlID0gTWF0aC5tYXgodGhpcy5jb3VudERlY2ltYWxzKHByb3h5TW9kZWwpLCB0aGlzLmNvdW50RGVjaW1hbHModGhpcy5zdGVwKSk7XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgbW9kZWxQcm94eS5cbiAgICAgICAgICAgIHRoaXMucHJveHlNb2RlbCA9IF8ucm91bmQodmFsdWUsIGRlY2ltYWxSb3VuZFZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGlzcGxheVRleHQoKTtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2hhbmdlKHRoaXMucHJveHlNb2RlbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBtZXRob2QgaXMgY2FsbGVkIGZyb20gdGhlIGZyb20gd2lkZ2V0LiB0byBjaGVjayB3aGV0aGVyIHRoZSB2YWx1ZSBlbnRlcmVkIGlzIHZhbGlkIG9yIG5vdC5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fVxuICAgICAqL1xuICAgIHB1YmxpYyB2YWxpZGF0ZShjOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNJbnZhbGlkTnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGludmFsaWROdW1iZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubnVtYmVyTm90SW5SYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBudW1iZXJOb3RJblJhbmdlOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHB1YmxpYyB2YWxpZGF0ZUlucHV0RW50cnkoJGV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy5pc0RlZmF1bHRRdWVyeSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGFsbG93IGFjdGlvbnMgaWYgY29udHJvbCBrZXkgaXMgcHJlc3NlZCBvciBpZiBiYWNrc3BhY2UgaXMgcHJlc3NlZC4gKGZvciBNb3ppbGxhKS5cbiAgICAgICAgaWYgKCRldmVudC5jdHJsS2V5IHx8IF8uaW5jbHVkZXMoWydCYWNrc3BhY2UnLCAnQXJyb3dSaWdodCcsICdBcnJvd0xlZnQnLCAnVGFiJywgJ0VudGVyJ10sICRldmVudC5rZXkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2YWxpZGl0eSA9IG5ldyBSZWdFeHAoYF5bXFxcXGRcXFxccy0sLmUrJHt0aGlzLkdST1VQfSR7dGhpcy5ERUNJTUFMfV0kYCwgJ2knKTtcbiAgICAgICAgY29uc3QgaW5wdXRWYWx1ZSA9ICRldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgIC8vIHZhbGlkYXRlcyBpZiB1c2VyIGVudGVyZWQgYW4gaW52YWxpZCBjaGFyYWN0ZXIuXG4gICAgICAgIGlmICghdmFsaWRpdHkudGVzdCgkZXZlbnQua2V5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGEgZGVjaW1hbCB2YWx1ZSBjYW4gYmUgZW50ZXJlZCBvbmx5IG9uY2UgaW4gdGhlIGlucHV0LlxuICAgICAgICBpZiAoXy5pbmNsdWRlcyhpbnB1dFZhbHVlLCB0aGlzLkRFQ0lNQUwpICYmICRldmVudC5rZXkgPT09IHRoaXMuREVDSU1BTCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vICdlJyBjYW4gYmUgZW50ZXJlZCBvbmx5IG9uY2UgaW4gdGhlIGlucHV0LlxuICAgICAgICBpZiAoXy5pbnRlcnNlY3Rpb24oXy50b0FycmF5KGlucHV0VmFsdWUpLCBbJ2UnLCAnRSddKS5sZW5ndGggJiYgXy5pbmNsdWRlcygnZUUnLCAkZXZlbnQua2V5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoXy5pbmNsdWRlcyhpbnB1dFZhbHVlLCAnKycpIHx8IF8uaW5jbHVkZXMoaW5wdXRWYWx1ZSwgJy0nKSApICYmICAoJGV2ZW50LmtleSA9PT0gJysnIHx8ICRldmVudC5rZXkgPT09ICctJykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uRW50ZXIoJGV2ZW50KSB7XG4gICAgICAgIHRoaXMuZGF0YXZhbHVlID0gJGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICB9XG59XG4iXX0=