import * as tslib_1 from "tslib";
import { getLocaleNumberSymbol, NumberSymbol } from '@angular/common';
import { BaseInput } from '../base/base-input';
var NumberLocale = /** @class */ (function (_super) {
    tslib_1.__extends(NumberLocale, _super);
    function NumberLocale(inj, config, i18nService, decimalPipe) {
        var _this = _super.call(this, inj, config) || this;
        _this.decimalPipe = decimalPipe;
        _this.isDefaultQuery = true;
        _this.selectedLocale = i18nService.getSelectedLocale();
        _this.DECIMAL = getLocaleNumberSymbol(_this.localefilter || _this.selectedLocale, NumberSymbol.Decimal);
        _this.GROUP = getLocaleNumberSymbol(_this.localefilter || _this.selectedLocale, NumberSymbol.Group);
        _this.numberfilter = '1.0-16';
        _this.resetValidations();
        return _this;
    }
    Object.defineProperty(NumberLocale.prototype, "datavalue", {
        // returns the actual model value of the widget.
        get: function () {
            return this.proxyModel;
        },
        // Setter for the datavalue.
        set: function (value) {
            // set text value to null if data value is empty.
            if (_.includes([null, undefined, ''], value)) {
                var input = this.inputEl.nativeElement;
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
            var model = this.parseNumber(value.toString());
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
        },
        enumerable: true,
        configurable: true
    });
    // resets all the flags related to the widget's validation.
    NumberLocale.prototype.resetValidations = function () {
        this.isInvalidNumber = false;
        this.numberNotInRange = false;
    };
    /**
     * Adds validations for the number before updating the widget model. like validating min and max value for the widget.
     * @param {number} val number to be validated
     * @returns {number}
     */
    NumberLocale.prototype.isValid = function (val) {
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
    };
    /**
     * returns a valid number by validating the minimum and maximum values.
     * @param {number} value
     * @returns {number}
     */
    NumberLocale.prototype.getValueInRange = function (value) {
        if (!_.isNaN(this.minvalue) && value < this.minvalue) {
            return this.minvalue;
        }
        if (!_.isNaN(this.maxvalue) && value > this.maxvalue) {
            return this.maxvalue;
        }
        return value;
    };
    /**
     * convert number to localized number using angular decimal pipe. eg 10,00,000 or 1,000,000
     * @param number
     * @returns {string}
     */
    NumberLocale.prototype.transformNumber = function (number) {
        return this.decimalPipe.transform(number, this.numberfilter, this.localefilter || this.selectedLocale);
    };
    /**
     * resets the cursor position in the text box.
     * @param {number} value cursor position index form left to right.
     */
    NumberLocale.prototype.resetCursorPosition = function (value) {
        var input = this.inputEl.nativeElement;
        // position of the cursor should be given form right to left.
        var position = input.value.length - value;
        position = position < 0 ? 0 : position;
        // set the cursor position in the text box.
        input.setSelectionRange(position, position);
    };
    /**
     * Method parses the Localized number(string) to a valid number.
     * if the string dose not result to a valid number then returns NaN.
     * @param {string} val Localized number.
     * @returns {number}
     */
    NumberLocale.prototype.parseNumber = function (val) {
        // splits string into two parts. decimal and number.
        var parts = val.split(this.DECIMAL);
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
        var number = Number(parts[0].split(this.GROUP).join(''));
        var decimal = Number("0." + (parts[1] || 0));
        if (Number.isNaN(number) || Number.isNaN(decimal)) {
            return NaN;
        }
        // if the number is negative then calculate the number as number - decimal
        // Ex: number = -123 and decimal = 0.45 then number - decimal = -123-045 = -123.45
        return number >= 0 ? number + decimal : number - decimal;
    };
    // updates the widgets text value.
    NumberLocale.prototype.updateDisplayText = function () {
        var input = this.inputEl.nativeElement;
        var position = input.selectionStart;
        var preValue = input.value;
        this.displayValue = input.value = this.transformNumber(this.proxyModel);
        // in safari browser, setSelectionRange will focus the input by default, which may invoke the focus event on widget.
        // Hence preventing the setSelectionRange when default value is set i.e. widget is not focused.
        if (this.updateon === 'default' && !this.isDefaultQuery) {
            this.resetCursorPosition(preValue.length - position);
        }
    };
    /**
     * returns the number of decimal places a number have.
     * @param value: number
     * @returns {number}
     */
    NumberLocale.prototype.countDecimals = function (value) {
        if ((value % 1) !== 0) {
            return value.toString().split('.')[1].length;
        }
        return 0;
    };
    /**
     * handles the arrow press event. Increases or decreases the number. triggered fom the template
     * @param $event keyboard event.
     * @param key identifier to increase or decrease the number.
     */
    NumberLocale.prototype.onArrowPress = function ($event, key) {
        $event.preventDefault();
        if (this.readonly || this.step === 0) {
            return;
        }
        var proxyModel = this.proxyModel;
        var value;
        // if the number is not in range and when arrow buttons are pressed need to get appropriate number value.
        if (this.numberNotInRange) {
            var inputValue = this.parseNumber(this.inputEl.nativeElement.value);
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
            var decimalRoundValue = Math.max(this.countDecimals(proxyModel), this.countDecimals(this.step));
            // update the modelProxy.
            this.proxyModel = _.round(value, decimalRoundValue);
            this.updateDisplayText();
            this.handleChange(this.proxyModel);
        }
    };
    /**
     * method is called from the from widget. to check whether the value entered is valid or not.
     * @returns {object}
     */
    NumberLocale.prototype.validate = function (c) {
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
    };
    NumberLocale.prototype.validateInputEntry = function ($event) {
        this.isDefaultQuery = false;
        // allow actions if control key is pressed or if backspace is pressed. (for Mozilla).
        if ($event.ctrlKey || _.includes(['Backspace', 'ArrowRight', 'ArrowLeft', 'Tab', 'Enter'], $event.key)) {
            return;
        }
        var validity = new RegExp("^[\\d\\s-,.e+" + this.GROUP + this.DECIMAL + "]$", 'i');
        var inputValue = $event.target.value;
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
    };
    NumberLocale.prototype.onEnter = function ($event) {
        this.datavalue = $event.target.value;
    };
    return NumberLocale;
}(BaseInput));
export { NumberLocale };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLWxvY2FsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGV4dC9sb2NhbGUvbnVtYmVyLWxvY2FsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsT0FBTyxFQUFlLHFCQUFxQixFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBSW5GLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUsvQztJQUEyQyx3Q0FBUztJQW1CaEQsc0JBQ0ksR0FBYSxFQUNiLE1BQXFCLEVBQ3JCLFdBQWdDLEVBQ3hCLFdBQXdCO1FBSnBDLFlBTUksa0JBQU0sR0FBRyxFQUFFLE1BQU0sQ0FBQyxTQU1yQjtRQVJXLGlCQUFXLEdBQVgsV0FBVyxDQUFhO1FBaEI1QixvQkFBYyxHQUFZLElBQUksQ0FBQztRQW1CbkMsS0FBSSxDQUFDLGNBQWMsR0FBRyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN0RCxLQUFJLENBQUMsT0FBTyxHQUFHLHFCQUFxQixDQUFDLEtBQUksQ0FBQyxZQUFZLElBQUksS0FBSSxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckcsS0FBSSxDQUFDLEtBQUssR0FBRyxxQkFBcUIsQ0FBQyxLQUFJLENBQUMsWUFBWSxJQUFJLEtBQUksQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pHLEtBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO1FBQzdCLEtBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOztJQUM1QixDQUFDO0lBR0Qsc0JBQUksbUNBQVM7UUE2QmIsZ0RBQWdEO2FBQ2hEO1lBQ0ksT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzNCLENBQUM7UUFqQ0QsNEJBQTRCO2FBQzVCLFVBQWUsS0FBYTtZQUN4QixpREFBaUQ7WUFDakQsSUFBSSxDQUFDLENB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ekMsQ0FBQztJQUNMLG1CQUFDO0FBQUQsQ0FBQyxBQXZSRCxDQUEyQyxTQUFTLEdBdVJuRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBYnN0cmFjdENvbnRyb2wsIFZhbGlkYXRvciB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IERlY2ltYWxQaXBlLCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wsIE51bWJlclN5bWJvbCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7IEFic3RyYWN0STE4blNlcnZpY2UgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEJhc2VJbnB1dCB9IGZyb20gJy4uL2Jhc2UvYmFzZS1pbnB1dCc7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTnVtYmVyTG9jYWxlIGV4dGVuZHMgQmFzZUlucHV0IGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAgICBwcml2YXRlIERFQ0lNQUw6IHN0cmluZztcbiAgICBwcml2YXRlIEdST1VQOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBzZWxlY3RlZExvY2FsZTogc3RyaW5nO1xuICAgIHByaXZhdGUgcHJveHlNb2RlbDogbnVtYmVyO1xuICAgIHByaXZhdGUgbnVtYmVyTm90SW5SYW5nZTogYm9vbGVhbjtcbiAgICBwcml2YXRlIGlzSW52YWxpZE51bWJlcjogYm9vbGVhbjtcbiAgICBwcml2YXRlIGlzRGVmYXVsdFF1ZXJ5OiBib29sZWFuID0gdHJ1ZTtcbiAgICBwdWJsaWMgZGlzcGxheVZhbHVlOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBudW1iZXJmaWx0ZXI6IHN0cmluZztcbiAgICBwcml2YXRlIGxvY2FsZWZpbHRlcjogc3RyaW5nO1xuICAgIHB1YmxpYyByZWFkb25seTogYm9vbGVhbjtcblxuICAgIHB1YmxpYyBwbGFjZWhvbGRlcjogc3RyaW5nO1xuICAgIHB1YmxpYyBtaW52YWx1ZTogbnVtYmVyO1xuICAgIHB1YmxpYyBtYXh2YWx1ZTogbnVtYmVyO1xuICAgIHB1YmxpYyB1cGRhdGVvbjogc3RyaW5nO1xuICAgIHB1YmxpYyBzdGVwOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgY29uZmlnOiBJV2lkZ2V0Q29uZmlnLFxuICAgICAgICBpMThuU2VydmljZTogQWJzdHJhY3RJMThuU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBkZWNpbWFsUGlwZTogRGVjaW1hbFBpcGVcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBjb25maWcpO1xuICAgICAgICB0aGlzLnNlbGVjdGVkTG9jYWxlID0gaTE4blNlcnZpY2UuZ2V0U2VsZWN0ZWRMb2NhbGUoKTtcbiAgICAgICAgdGhpcy5ERUNJTUFMID0gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKHRoaXMubG9jYWxlZmlsdGVyIHx8IHRoaXMuc2VsZWN0ZWRMb2NhbGUsIE51bWJlclN5bWJvbC5EZWNpbWFsKTtcbiAgICAgICAgdGhpcy5HUk9VUCA9IGdldExvY2FsZU51bWJlclN5bWJvbCh0aGlzLmxvY2FsZWZpbHRlciB8fCB0aGlzLnNlbGVjdGVkTG9jYWxlLCBOdW1iZXJTeW1ib2wuR3JvdXApO1xuICAgICAgICB0aGlzLm51bWJlcmZpbHRlciA9ICcxLjAtMTYnO1xuICAgICAgICB0aGlzLnJlc2V0VmFsaWRhdGlvbnMoKTtcbiAgICB9XG5cbiAgICAvLyBTZXR0ZXIgZm9yIHRoZSBkYXRhdmFsdWUuXG4gICAgc2V0IGRhdGF2YWx1ZSAodmFsdWU6IG51bWJlcikge1xuICAgICAgICAvLyBzZXQgdGV4dCB2YWx1ZSB0byBudWxsIGlmIGRhdGEgdmFsdWUgaXMgZW1wdHkuXG4gICAgICAgIGlmIChfLmluY2x1ZGVzKFtudWxsLCB1bmRlZmluZWQsICcnXSwgdmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBpbnB1dCA9IHRoaXMuaW5wdXRFbC5uYXRpdmVFbGVtZW50O1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5VmFsdWUgPSBpbnB1dC52YWx1ZSA9IHRoaXMucHJveHlNb2RlbCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnJlc2V0VmFsaWRhdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuX29uQ2hhbmdlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgdGhlIHdpZGdldCBoYXMgZGVmYXVsdCB2YWx1ZSBhbmQgaWYgd2UgY2hhbmdlIHRoZSBsb2NhbGUsIHRoZSB2YWx1ZSBzaG91bGQgYmUgaW4gc2VsZWN0ZWQgbG9jYWxlIGZvcm1hdC5cbiAgICAgICAgaWYgKHRoaXMuaXNEZWZhdWx0UXVlcnkpIHtcbiAgICAgICAgICAgICh2YWx1ZSBhcyBhbnkpICA9IHRoaXMudHJhbnNmb3JtTnVtYmVyKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdldCBhIHZhbGlkIG51bWJlciBmb3JtIHRoZSB0ZXh0LlxuICAgICAgICBjb25zdCBtb2RlbCA9IHRoaXMucGFyc2VOdW1iZXIodmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgIC8vIGlmIHRoZSBudW1iZXIgaXMgdmFsaWQgb3IgaWYgbnVtYmVyIGlzIG5vdCBpbiByYW5nZSB1cGRhdGUgdGhlIG1vZGVsIHZhbHVlLlxuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkKG1vZGVsKSkge1xuICAgICAgICAgICAgdGhpcy5wcm94eU1vZGVsID0gbW9kZWw7XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGRpc3BsYXkgdmFsdWUgaW4gdGhlIHRleHQgYm94LlxuICAgICAgICAgICAgdGhpcy51cGRhdGVEaXNwbGF5VGV4dCgpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVDaGFuZ2UobW9kZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5VmFsdWUgPSB2YWx1ZS50b1N0cmluZygpO1xuICAgICAgICAgICAgdGhpcy5wcm94eU1vZGVsID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2hhbmdlKG51bGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyB0aGUgYWN0dWFsIG1vZGVsIHZhbHVlIG9mIHRoZSB3aWRnZXQuXG4gICAgZ2V0IGRhdGF2YWx1ZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm94eU1vZGVsO1xuICAgIH1cblxuICAgIC8vIHJlc2V0cyBhbGwgdGhlIGZsYWdzIHJlbGF0ZWQgdG8gdGhlIHdpZGdldCdzIHZhbGlkYXRpb24uXG4gICAgcHJvdGVjdGVkIHJlc2V0VmFsaWRhdGlvbnMoKSB7XG4gICAgICAgIHRoaXMuaXNJbnZhbGlkTnVtYmVyID0gZmFsc2U7XG4gICAgICAgIHRoaXMubnVtYmVyTm90SW5SYW5nZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgdmFsaWRhdGlvbnMgZm9yIHRoZSBudW1iZXIgYmVmb3JlIHVwZGF0aW5nIHRoZSB3aWRnZXQgbW9kZWwuIGxpa2UgdmFsaWRhdGluZyBtaW4gYW5kIG1heCB2YWx1ZSBmb3IgdGhlIHdpZGdldC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsIG51bWJlciB0byBiZSB2YWxpZGF0ZWRcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHByaXZhdGUgaXNWYWxpZCh2YWw6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvLyBpZCBudW1iZXIgaXMgaW5maW5pdGUgdGhlbiBjb25zaWRlciBpdCBhcyBpbnZhbGlkIHZhbHVlXG4gICAgICAgIGlmIChfLmlzTmFOKHZhbCkgfHwgIV8uaXNGaW5pdGUodmFsKSkge1xuICAgICAgICAgICAgdGhpcy5pc0ludmFsaWROdW1iZXIgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWwgIT09IHRoaXMuZ2V0VmFsdWVJblJhbmdlKHZhbCkpIHtcbiAgICAgICAgICAgIHRoaXMubnVtYmVyTm90SW5SYW5nZSA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc2V0VmFsaWRhdGlvbnMoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyBhIHZhbGlkIG51bWJlciBieSB2YWxpZGF0aW5nIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0VmFsdWVJblJhbmdlKHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBpZiAoIV8uaXNOYU4odGhpcy5taW52YWx1ZSkgJiYgdmFsdWUgPCB0aGlzLm1pbnZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5taW52YWx1ZTtcblxuICAgICAgICB9XG4gICAgICAgIGlmICghXy5pc05hTih0aGlzLm1heHZhbHVlKSAmJiB2YWx1ZSA+IHRoaXMubWF4dmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1heHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjb252ZXJ0IG51bWJlciB0byBsb2NhbGl6ZWQgbnVtYmVyIHVzaW5nIGFuZ3VsYXIgZGVjaW1hbCBwaXBlLiBlZyAxMCwwMCwwMDAgb3IgMSwwMDAsMDAwXG4gICAgICogQHBhcmFtIG51bWJlclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHJpdmF0ZSB0cmFuc2Zvcm1OdW1iZXIobnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVjaW1hbFBpcGUudHJhbnNmb3JtKG51bWJlciwgdGhpcy5udW1iZXJmaWx0ZXIsIHRoaXMubG9jYWxlZmlsdGVyIHx8IHRoaXMuc2VsZWN0ZWRMb2NhbGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJlc2V0cyB0aGUgY3Vyc29yIHBvc2l0aW9uIGluIHRoZSB0ZXh0IGJveC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgY3Vyc29yIHBvc2l0aW9uIGluZGV4IGZvcm0gbGVmdCB0byByaWdodC5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlc2V0Q3Vyc29yUG9zaXRpb24odmFsdWU6IG51bWJlcikge1xuICAgICAgICBjb25zdCBpbnB1dCA9IHRoaXMuaW5wdXRFbC5uYXRpdmVFbGVtZW50O1xuICAgICAgICAvLyBwb3NpdGlvbiBvZiB0aGUgY3Vyc29yIHNob3VsZCBiZSBnaXZlbiBmb3JtIHJpZ2h0IHRvIGxlZnQuXG4gICAgICAgIGxldCBwb3NpdGlvbiA9IGlucHV0LnZhbHVlLmxlbmd0aCAtIHZhbHVlO1xuICAgICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uIDwgMCA/IDAgOiBwb3NpdGlvbjtcbiAgICAgICAgLy8gc2V0IHRoZSBjdXJzb3IgcG9zaXRpb24gaW4gdGhlIHRleHQgYm94LlxuICAgICAgICBpbnB1dC5zZXRTZWxlY3Rpb25SYW5nZShwb3NpdGlvbiwgcG9zaXRpb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCBwYXJzZXMgdGhlIExvY2FsaXplZCBudW1iZXIoc3RyaW5nKSB0byBhIHZhbGlkIG51bWJlci5cbiAgICAgKiBpZiB0aGUgc3RyaW5nIGRvc2Ugbm90IHJlc3VsdCB0byBhIHZhbGlkIG51bWJlciB0aGVuIHJldHVybnMgTmFOLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWwgTG9jYWxpemVkIG51bWJlci5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHByaXZhdGUgcGFyc2VOdW1iZXIodmFsOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICAvLyBzcGxpdHMgc3RyaW5nIGludG8gdHdvIHBhcnRzLiBkZWNpbWFsIGFuZCBudW1iZXIuXG4gICAgICAgIGNvbnN0IHBhcnRzID0gdmFsLnNwbGl0KHRoaXMuREVDSU1BTCk7XG4gICAgICAgIGlmICghcGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBudW1iZXIgaGF2ZSBkZWNpbWFsIHBvaW50IGFuZCBub3QgaGF2ZSBhIGRlY2ltYWwgdmFsdWUgdGhlbiByZXR1cm4uXG4gICAgICAgIGlmIChwYXJ0c1sxXSA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVwbGFjZXMgYWxsIGdyb3VwIHNlcGFyYXRvcnMgZm9ybSB0aGUgbnVtYmVyLlxuICAgICAgICBjb25zdCBudW1iZXIgPSBOdW1iZXIocGFydHNbMF0uc3BsaXQodGhpcy5HUk9VUCkuam9pbignJykpO1xuICAgICAgICBjb25zdCBkZWNpbWFsID0gTnVtYmVyKGAwLiR7cGFydHNbMV0gfHwgMH1gKTtcbiAgICAgICAgaWYgKCBOdW1iZXIuaXNOYU4obnVtYmVyKSB8fCBOdW1iZXIuaXNOYU4oZGVjaW1hbCkpIHtcbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgdGhlIG51bWJlciBpcyBuZWdhdGl2ZSB0aGVuIGNhbGN1bGF0ZSB0aGUgbnVtYmVyIGFzIG51bWJlciAtIGRlY2ltYWxcbiAgICAgICAgLy8gRXg6IG51bWJlciA9IC0xMjMgYW5kIGRlY2ltYWwgPSAwLjQ1IHRoZW4gbnVtYmVyIC0gZGVjaW1hbCA9IC0xMjMtMDQ1ID0gLTEyMy40NVxuICAgICAgICByZXR1cm4gbnVtYmVyID49IDAgPyBudW1iZXIgKyBkZWNpbWFsIDogbnVtYmVyIC0gZGVjaW1hbDtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGVzIHRoZSB3aWRnZXRzIHRleHQgdmFsdWUuXG4gICAgcHJpdmF0ZSB1cGRhdGVEaXNwbGF5VGV4dCgpIHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSB0aGlzLmlucHV0RWwubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY29uc3QgcG9zaXRpb246IG51bWJlciA9IGlucHV0LnNlbGVjdGlvblN0YXJ0O1xuICAgICAgICBjb25zdCBwcmVWYWx1ZTogc3RyaW5nID0gaW5wdXQudmFsdWU7XG4gICAgICAgIHRoaXMuZGlzcGxheVZhbHVlID0gaW5wdXQudmFsdWUgID0gdGhpcy50cmFuc2Zvcm1OdW1iZXIodGhpcy5wcm94eU1vZGVsKTtcbiAgICAgICAgLy8gaW4gc2FmYXJpIGJyb3dzZXIsIHNldFNlbGVjdGlvblJhbmdlIHdpbGwgZm9jdXMgdGhlIGlucHV0IGJ5IGRlZmF1bHQsIHdoaWNoIG1heSBpbnZva2UgdGhlIGZvY3VzIGV2ZW50IG9uIHdpZGdldC5cbiAgICAgICAgLy8gSGVuY2UgcHJldmVudGluZyB0aGUgc2V0U2VsZWN0aW9uUmFuZ2Ugd2hlbiBkZWZhdWx0IHZhbHVlIGlzIHNldCBpLmUuIHdpZGdldCBpcyBub3QgZm9jdXNlZC5cbiAgICAgICAgaWYgKHRoaXMudXBkYXRlb24gPT09ICdkZWZhdWx0JyAmJiAhdGhpcy5pc0RlZmF1bHRRdWVyeSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldEN1cnNvclBvc2l0aW9uKHByZVZhbHVlLmxlbmd0aCAtIHBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgdGhlIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBhIG51bWJlciBoYXZlLlxuICAgICAqIEBwYXJhbSB2YWx1ZTogbnVtYmVyXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBwcml2YXRlIGNvdW50RGVjaW1hbHMgKHZhbHVlKSB7XG4gICAgICAgIGlmICgodmFsdWUgJSAxKSAhPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCkuc3BsaXQoJy4nKVsxXS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaGFuZGxlcyB0aGUgYXJyb3cgcHJlc3MgZXZlbnQuIEluY3JlYXNlcyBvciBkZWNyZWFzZXMgdGhlIG51bWJlci4gdHJpZ2dlcmVkIGZvbSB0aGUgdGVtcGxhdGVcbiAgICAgKiBAcGFyYW0gJGV2ZW50IGtleWJvYXJkIGV2ZW50LlxuICAgICAqIEBwYXJhbSBrZXkgaWRlbnRpZmllciB0byBpbmNyZWFzZSBvciBkZWNyZWFzZSB0aGUgbnVtYmVyLlxuICAgICAqL1xuICAgIHB1YmxpYyBvbkFycm93UHJlc3MoJGV2ZW50LCBrZXkpIHtcbiAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICh0aGlzLnJlYWRvbmx5IHx8IHRoaXMuc3RlcCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBwcm94eU1vZGVsID0gdGhpcy5wcm94eU1vZGVsO1xuICAgICAgICBsZXQgdmFsdWU7XG5cbiAgICAgICAgLy8gaWYgdGhlIG51bWJlciBpcyBub3QgaW4gcmFuZ2UgYW5kIHdoZW4gYXJyb3cgYnV0dG9ucyBhcmUgcHJlc3NlZCBuZWVkIHRvIGdldCBhcHByb3ByaWF0ZSBudW1iZXIgdmFsdWUuXG4gICAgICAgIGlmICh0aGlzLm51bWJlck5vdEluUmFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0VmFsdWUgPSB0aGlzLnBhcnNlTnVtYmVyKHRoaXMuaW5wdXRFbC5uYXRpdmVFbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIC8vIHRha2UgdGhlIHRleHRib3ggdmFsdWUgYXMgY3VycmVudCBtb2RlbCBpZiB0aGUgdmFsdWUgaXMgdmFsaWQuXG4gICAgICAgICAgICBpZiAoIV8uaXNOYU4oaW5wdXRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5nZXRWYWx1ZUluUmFuZ2UoaW5wdXRWYWx1ZSk7XG4gICAgICAgICAgICAgICBwcm94eU1vZGVsID0gaW5wdXRWYWx1ZTtcbiAgICAgICAgICAgICAgIHRoaXMucmVzZXRWYWxpZGF0aW9ucygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQocHJveHlNb2RlbCkgfHwgXy5pc051bGwocHJveHlNb2RlbCkpIHtcbiAgICAgICAgICAgICAgICBwcm94eU1vZGVsID0gdmFsdWUgPSB0aGlzLmdldFZhbHVlSW5SYW5nZSggKHRoaXMubWludmFsdWUgfHwgMCkpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzZXRWYWxpZGF0aW9ucygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWVJblJhbmdlKCBwcm94eU1vZGVsICsgKGtleSA9PT0gJ1VQJyA/IHRoaXMuc3RlcCA6IC10aGlzLnN0ZXApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoKGtleSA9PT0gJ1VQJyAmJiBwcm94eU1vZGVsIDw9IHZhbHVlKSB8fCAoa2V5ID09PSAnRE9XTicgJiYgcHJveHlNb2RlbCA+PSB2YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRlY2ltYWxSb3VuZFZhbHVlID0gTWF0aC5tYXgodGhpcy5jb3VudERlY2ltYWxzKHByb3h5TW9kZWwpLCB0aGlzLmNvdW50RGVjaW1hbHModGhpcy5zdGVwKSk7XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgbW9kZWxQcm94eS5cbiAgICAgICAgICAgIHRoaXMucHJveHlNb2RlbCA9IF8ucm91bmQodmFsdWUsIGRlY2ltYWxSb3VuZFZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGlzcGxheVRleHQoKTtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2hhbmdlKHRoaXMucHJveHlNb2RlbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBtZXRob2QgaXMgY2FsbGVkIGZyb20gdGhlIGZyb20gd2lkZ2V0LiB0byBjaGVjayB3aGV0aGVyIHRoZSB2YWx1ZSBlbnRlcmVkIGlzIHZhbGlkIG9yIG5vdC5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fVxuICAgICAqL1xuICAgIHB1YmxpYyB2YWxpZGF0ZShjOiBBYnN0cmFjdENvbnRyb2wpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNJbnZhbGlkTnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGludmFsaWROdW1iZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubnVtYmVyTm90SW5SYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBudW1iZXJOb3RJblJhbmdlOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHB1YmxpYyB2YWxpZGF0ZUlucHV0RW50cnkoJGV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy5pc0RlZmF1bHRRdWVyeSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGFsbG93IGFjdGlvbnMgaWYgY29udHJvbCBrZXkgaXMgcHJlc3NlZCBvciBpZiBiYWNrc3BhY2UgaXMgcHJlc3NlZC4gKGZvciBNb3ppbGxhKS5cbiAgICAgICAgaWYgKCRldmVudC5jdHJsS2V5IHx8IF8uaW5jbHVkZXMoWydCYWNrc3BhY2UnLCAnQXJyb3dSaWdodCcsICdBcnJvd0xlZnQnLCAnVGFiJywgJ0VudGVyJ10sICRldmVudC5rZXkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2YWxpZGl0eSA9IG5ldyBSZWdFeHAoYF5bXFxcXGRcXFxccy0sLmUrJHt0aGlzLkdST1VQfSR7dGhpcy5ERUNJTUFMfV0kYCwgJ2knKTtcbiAgICAgICAgY29uc3QgaW5wdXRWYWx1ZSA9ICRldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgIC8vIHZhbGlkYXRlcyBpZiB1c2VyIGVudGVyZWQgYW4gaW52YWxpZCBjaGFyYWN0ZXIuXG4gICAgICAgIGlmICghdmFsaWRpdHkudGVzdCgkZXZlbnQua2V5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGEgZGVjaW1hbCB2YWx1ZSBjYW4gYmUgZW50ZXJlZCBvbmx5IG9uY2UgaW4gdGhlIGlucHV0LlxuICAgICAgICBpZiAoXy5pbmNsdWRlcyhpbnB1dFZhbHVlLCB0aGlzLkRFQ0lNQUwpICYmICRldmVudC5rZXkgPT09IHRoaXMuREVDSU1BTCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vICdlJyBjYW4gYmUgZW50ZXJlZCBvbmx5IG9uY2UgaW4gdGhlIGlucHV0LlxuICAgICAgICBpZiAoXy5pbnRlcnNlY3Rpb24oXy50b0FycmF5KGlucHV0VmFsdWUpLCBbJ2UnLCAnRSddKS5sZW5ndGggJiYgXy5pbmNsdWRlcygnZUUnLCAkZXZlbnQua2V5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoXy5pbmNsdWRlcyhpbnB1dFZhbHVlLCAnKycpIHx8IF8uaW5jbHVkZXMoaW5wdXRWYWx1ZSwgJy0nKSApICYmICAoJGV2ZW50LmtleSA9PT0gJysnIHx8ICRldmVudC5rZXkgPT09ICctJykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uRW50ZXIoJGV2ZW50KSB7XG4gICAgICAgIHRoaXMuZGF0YXZhbHVlID0gJGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICB9XG59XG4iXX0=