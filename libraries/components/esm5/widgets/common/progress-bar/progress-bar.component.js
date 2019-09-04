import * as tslib_1 from "tslib";
import { Attribute, Component, Injector } from '@angular/core';
import { findValueOf, isDefined } from '@wm/core';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './progress-bar.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { getDecimalCount, isPercentageValue } from './progress-utils';
var DEFAULT_CLS = 'progress app-progress';
var WIDGET_CONFIG = { widgetType: 'wm-progress-bar', hostClass: DEFAULT_CLS };
// map of progress-bar type and classes
export var TYPE_CLASS_MAP = {
    'default': '',
    'default-striped': 'progress-bar-striped',
    'success': 'progress-bar-success',
    'success-striped': 'progress-bar-success progress-bar-striped',
    'info': 'progress-bar-info',
    'info-striped': 'progress-bar-info progress-bar-striped',
    'warning': 'progress-bar-warning',
    'warning-striped': 'progress-bar-warning progress-bar-striped',
    'danger': 'progress-bar-danger',
    'danger-striped': 'progress-bar-danger progress-bar-striped'
};
var ProgressBarComponent = /** @class */ (function (_super) {
    tslib_1.__extends(ProgressBarComponent, _super);
    function ProgressBarComponent(inj, dataset, boundDataset) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        // progress-bar data, ngFor in the template iterates on this
        _this.data = [{
                cls: TYPE_CLASS_MAP.default,
                progressBarWidth: '0%',
                displayValue: '0'
            }];
        // flag which determines whether dataset is provided or not
        _this.hasDataset = !!(dataset || boundDataset);
        styler(_this.nativeElement, _this);
        _this._prepareData = _.debounce(function () { return _this.prepareData(); }, 50);
        return _this;
    }
    // update the proper classes when there is a change in type
    ProgressBarComponent.prototype.onTypeChange = function () {
        if (!this.hasDataset) {
            if (this.data[0]) {
                this.data[0].cls = TYPE_CLASS_MAP[this.type];
            }
        }
    };
    // returns the formatted display value based on the provided displayformat
    ProgressBarComponent.prototype.getFormattedDisplayVal = function (val) {
        var format = this.displayformat || '9';
        val = parseFloat('' + val);
        val = (val.toFixed(getDecimalCount(format)));
        if (format && format.includes('%')) {
            val = val + "%";
        }
        return val;
    };
    ProgressBarComponent.prototype.prepareData = function () {
        var _this = this;
        // when the dataset is provided, iterate over the dataset to set the proper values in the data
        if (this.dataset && _.isArray(this.dataset) && this.type && this.datavalue) {
            this.data = this.dataset.map(function (datum) {
                var val = findValueOf(datum, _this.datavalue).toString();
                var percentVal = val;
                if (val && !val.includes('%')) {
                    percentVal = val + "%";
                }
                return {
                    cls: TYPE_CLASS_MAP[findValueOf(datum, _this.type)],
                    progressBarWidth: percentVal,
                    displayValue: _this.getFormattedDisplayVal(val)
                };
            });
        }
        else {
            // if the dataset is not provided, update the values in the default data
            var width = 0;
            var displayVal = 0;
            if (this.datavalue) {
                if (isPercentageValue(this.datavalue)) {
                    var val = (this.datavalue || '0%');
                    width = displayVal = val;
                }
                else {
                    if (isDefined(this.datavalue)) {
                        var denominator = (+this.maxvalue - +this.minvalue) || 1;
                        var val = ((+this.datavalue - +this.minvalue) * 100) / denominator + '%';
                        width = displayVal = val;
                    }
                }
            }
            this.data[0].displayValue = this.getFormattedDisplayVal(displayVal);
            this.data[0].progressBarWidth = width;
            this.data[0].cls = TYPE_CLASS_MAP[this.type];
        }
    };
    ProgressBarComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'type') {
            this.onTypeChange();
        }
        else if (key === 'minvalue' || key === 'maxvalue' || key === 'datavalue' || key === 'dataset' || key === 'displayformat') {
            this._prepareData();
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    ProgressBarComponent.initializeProps = registerProps();
    ProgressBarComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmProgressBar]',
                    template: "<div class=\"multi-bar progress-bar {{bar.cls}}\" *ngFor=\"let bar of data\" [style.width]=\"bar.progressBarWidth\" role=\"progressbar\"\n     [attr.aria-valuenow]=\"datavalue\" [attr.aria-valuemin]=\"minvalue\" [attr.aria-valuemax]=\"maxvalue\">\n    <span class=\"app-progress-label\" [attr.data-caption-placement]=\"captionplacement\">{{bar.displayValue}}</span>\n</div>",
                    providers: [
                        provideAsWidgetRef(ProgressBarComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    ProgressBarComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: String, decorators: [{ type: Attribute, args: ['dataset',] }] },
        { type: String, decorators: [{ type: Attribute, args: ['dataset.bind',] }] }
    ]; };
    return ProgressBarComponent;
}(StylableComponent));
export { ProgressBarComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MtYmFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vcHJvZ3Jlc3MtYmFyL3Byb2dyZXNzLWJhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUvRCxPQUFPLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBWSxNQUFNLFVBQVUsQ0FBQztBQUc1RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUl0RSxJQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQztBQUM1QyxJQUFNLGFBQWEsR0FBa0IsRUFBQyxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBRTdGLHVDQUF1QztBQUN2QyxNQUFNLENBQUMsSUFBTSxjQUFjLEdBQUc7SUFDMUIsU0FBUyxFQUFFLEVBQUU7SUFDYixpQkFBaUIsRUFBRSxzQkFBc0I7SUFDekMsU0FBUyxFQUFFLHNCQUFzQjtJQUNqQyxpQkFBaUIsRUFBRSwyQ0FBMkM7SUFDOUQsTUFBTSxFQUFFLG1CQUFtQjtJQUMzQixjQUFjLEVBQUUsd0NBQXdDO0lBQ3hELFNBQVMsRUFBRSxzQkFBc0I7SUFDakMsaUJBQWlCLEVBQUUsMkNBQTJDO0lBQzlELFFBQVEsRUFBRSxxQkFBcUI7SUFDL0IsZ0JBQWdCLEVBQUUsMENB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LEtBQUssV0FBVyxJQUFJLEdBQUcsS0FBSyxTQUFTLElBQUksR0FBRyxLQUFLLGVBQWUsRUFBRTtZQUN4SCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDdkI7YUFBTTtZQUNILGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBbEdNLG9DQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVI1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGlCQUFpQjtvQkFDM0IsaVlBQTRDO29CQUM1QyxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsb0JBQW9CLENBQUM7cUJBQzNDO2lCQUNKOzs7O2dCQTVDOEIsUUFBUTs2Q0FpRVAsU0FBUyxTQUFDLFNBQVM7NkNBQW9CLFNBQVMsU0FBQyxjQUFjOztJQWdGL0YsMkJBQUM7Q0FBQSxBQTNHRCxDQU8wQyxpQkFBaUIsR0FvRzFEO1NBcEdZLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF0dHJpYnV0ZSwgQ29tcG9uZW50LCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBmaW5kVmFsdWVPZiwgaXNEZWZpbmVkLCBpc1N0cmluZyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vcHJvZ3Jlc3MtYmFyLnByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBnZXREZWNpbWFsQ291bnQsIGlzUGVyY2VudGFnZVZhbHVlIH0gZnJvbSAnLi9wcm9ncmVzcy11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAncHJvZ3Jlc3MgYXBwLXByb2dyZXNzJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7d2lkZ2V0VHlwZTogJ3dtLXByb2dyZXNzLWJhcicsIGhvc3RDbGFzczogREVGQVVMVF9DTFN9O1xuXG4vLyBtYXAgb2YgcHJvZ3Jlc3MtYmFyIHR5cGUgYW5kIGNsYXNzZXNcbmV4cG9ydCBjb25zdCBUWVBFX0NMQVNTX01BUCA9IHtcbiAgICAnZGVmYXVsdCc6ICcnLFxuICAgICdkZWZhdWx0LXN0cmlwZWQnOiAncHJvZ3Jlc3MtYmFyLXN0cmlwZWQnLFxuICAgICdzdWNjZXNzJzogJ3Byb2dyZXNzLWJhci1zdWNjZXNzJyxcbiAgICAnc3VjY2Vzcy1zdHJpcGVkJzogJ3Byb2dyZXNzLWJhci1zdWNjZXNzIHByb2dyZXNzLWJhci1zdHJpcGVkJyxcbiAgICAnaW5mbyc6ICdwcm9ncmVzcy1iYXItaW5mbycsXG4gICAgJ2luZm8tc3RyaXBlZCc6ICdwcm9ncmVzcy1iYXItaW5mbyBwcm9ncmVzcy1iYXItc3RyaXBlZCcsXG4gICAgJ3dhcm5pbmcnOiAncHJvZ3Jlc3MtYmFyLXdhcm5pbmcnLFxuICAgICd3YXJuaW5nLXN0cmlwZWQnOiAncHJvZ3Jlc3MtYmFyLXdhcm5pbmcgcHJvZ3Jlc3MtYmFyLXN0cmlwZWQnLFxuICAgICdkYW5nZXInOiAncHJvZ3Jlc3MtYmFyLWRhbmdlcicsXG4gICAgJ2Rhbmdlci1zdHJpcGVkJzogJ3Byb2dyZXNzLWJhci1kYW5nZXIgcHJvZ3Jlc3MtYmFyLXN0cmlwZWQnXG59O1xuXG5cbi8vIGludGVyZmFjZSBmb3IgdGhlIHByb2dyZXNzLWJhciBpbmZvXG5pbnRlcmZhY2UgSVByb2dyZXNzSW5mbyB7XG4gICAgY2xzOiBzdHJpbmc7XG4gICAgcHJvZ3Jlc3NCYXJXaWR0aDogc3RyaW5nO1xuICAgIGRpc3BsYXlWYWx1ZTogc3RyaW5nO1xufVxuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bVByb2dyZXNzQmFyXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3Byb2dyZXNzLWJhci5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihQcm9ncmVzc0JhckNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFByb2dyZXNzQmFyQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgZGlzcGxheWZvcm1hdDogc3RyaW5nO1xuICAgIHB1YmxpYyBkYXRhdmFsdWU6IHN0cmluZztcbiAgICBwdWJsaWMgbWludmFsdWU6IG51bWJlcjtcbiAgICBwdWJsaWMgbWF4dmFsdWU6IG51bWJlcjtcbiAgICBwdWJsaWMgdHlwZTogc3RyaW5nO1xuICAgIHB1YmxpYyBkYXRhc2V0OiBBcnJheTxhbnk+O1xuXG4gICAgcHJpdmF0ZSBfcHJlcGFyZURhdGE6IEZ1bmN0aW9uO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgaGFzRGF0YXNldDogYm9vbGVhbjtcblxuICAgIC8vIHByb2dyZXNzLWJhciBkYXRhLCBuZ0ZvciBpbiB0aGUgdGVtcGxhdGUgaXRlcmF0ZXMgb24gdGhpc1xuICAgIHB1YmxpYyBkYXRhOiBBcnJheTxJUHJvZ3Jlc3NJbmZvPiA9IFt7XG4gICAgICAgIGNsczogVFlQRV9DTEFTU19NQVAuZGVmYXVsdCxcbiAgICAgICAgcHJvZ3Jlc3NCYXJXaWR0aDogJzAlJyxcbiAgICAgICAgZGlzcGxheVZhbHVlOiAnMCdcbiAgICB9XTtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIEBBdHRyaWJ1dGUoJ2RhdGFzZXQnKSBkYXRhc2V0OiBzdHJpbmcsIEBBdHRyaWJ1dGUoJ2RhdGFzZXQuYmluZCcpIGJvdW5kRGF0YXNldDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgLy8gZmxhZyB3aGljaCBkZXRlcm1pbmVzIHdoZXRoZXIgZGF0YXNldCBpcyBwcm92aWRlZCBvciBub3RcbiAgICAgICAgdGhpcy5oYXNEYXRhc2V0ID0gISEoZGF0YXNldCB8fCBib3VuZERhdGFzZXQpO1xuXG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuX3ByZXBhcmVEYXRhID0gXy5kZWJvdW5jZSgoKSA9PiB0aGlzLnByZXBhcmVEYXRhKCksIDUwKTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgdGhlIHByb3BlciBjbGFzc2VzIHdoZW4gdGhlcmUgaXMgYSBjaGFuZ2UgaW4gdHlwZVxuICAgIHByb3RlY3RlZCBvblR5cGVDaGFuZ2UoKSB7XG4gICAgICAgIGlmICghdGhpcy5oYXNEYXRhc2V0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhWzBdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzBdLmNscyA9IFRZUEVfQ0xBU1NfTUFQW3RoaXMudHlwZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZXR1cm5zIHRoZSBmb3JtYXR0ZWQgZGlzcGxheSB2YWx1ZSBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgZGlzcGxheWZvcm1hdFxuICAgIHByb3RlY3RlZCBnZXRGb3JtYXR0ZWREaXNwbGF5VmFsKHZhbDogc3RyaW5nIHwgbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgZm9ybWF0ID0gdGhpcy5kaXNwbGF5Zm9ybWF0IHx8ICc5JztcblxuICAgICAgICB2YWwgPSBwYXJzZUZsb2F0KCcnICsgdmFsKTtcbiAgICAgICAgdmFsID0gKHZhbC50b0ZpeGVkKGdldERlY2ltYWxDb3VudChmb3JtYXQpKSk7XG5cbiAgICAgICAgaWYgKGZvcm1hdCAmJiBmb3JtYXQuaW5jbHVkZXMoJyUnKSkge1xuICAgICAgICAgICAgdmFsID0gYCR7dmFsfSVgO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHByZXBhcmVEYXRhKCkge1xuICAgICAgICAvLyB3aGVuIHRoZSBkYXRhc2V0IGlzIHByb3ZpZGVkLCBpdGVyYXRlIG92ZXIgdGhlIGRhdGFzZXQgdG8gc2V0IHRoZSBwcm9wZXIgdmFsdWVzIGluIHRoZSBkYXRhXG4gICAgICAgIGlmICh0aGlzLmRhdGFzZXQgJiYgXy5pc0FycmF5KHRoaXMuZGF0YXNldCkgJiYgdGhpcy50eXBlICYmIHRoaXMuZGF0YXZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmRhdGFzZXQubWFwKChkYXR1bSk6IElQcm9ncmVzc0luZm8gPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbDogc3RyaW5nID0gZmluZFZhbHVlT2YoZGF0dW0sIHRoaXMuZGF0YXZhbHVlKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGxldCBwZXJjZW50VmFsID0gdmFsO1xuICAgICAgICAgICAgICAgIGlmICh2YWwgJiYgIXZhbC5pbmNsdWRlcygnJScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnRWYWwgPSBgJHt2YWx9JWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNsczogVFlQRV9DTEFTU19NQVBbZmluZFZhbHVlT2YoZGF0dW0sIHRoaXMudHlwZSldLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0JhcldpZHRoOiBwZXJjZW50VmFsLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5VmFsdWU6IHRoaXMuZ2V0Rm9ybWF0dGVkRGlzcGxheVZhbCh2YWwpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgdGhlIGRhdGFzZXQgaXMgbm90IHByb3ZpZGVkLCB1cGRhdGUgdGhlIHZhbHVlcyBpbiB0aGUgZGVmYXVsdCBkYXRhXG4gICAgICAgICAgICBsZXQgd2lkdGg6IHN0cmluZyB8IG51bWJlciA9IDA7XG4gICAgICAgICAgICBsZXQgZGlzcGxheVZhbDogc3RyaW5nIHwgbnVtYmVyID0gMDtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChpc1BlcmNlbnRhZ2VWYWx1ZSh0aGlzLmRhdGF2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsID0gKHRoaXMuZGF0YXZhbHVlIHx8ICcwJScpO1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IGRpc3BsYXlWYWwgPSB2YWw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmaW5lZCh0aGlzLmRhdGF2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlbm9taW5hdG9yID0gKCt0aGlzLm1heHZhbHVlIC0gK3RoaXMubWludmFsdWUpIHx8IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWwgPSAoKCt0aGlzLmRhdGF2YWx1ZSAtICt0aGlzLm1pbnZhbHVlKSAqIDEwMCkgLyBkZW5vbWluYXRvciArICclJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoID0gZGlzcGxheVZhbCA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGF0YVswXS5kaXNwbGF5VmFsdWUgPSB0aGlzLmdldEZvcm1hdHRlZERpc3BsYXlWYWwoZGlzcGxheVZhbCBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgdGhpcy5kYXRhWzBdLnByb2dyZXNzQmFyV2lkdGggPSB3aWR0aCBhcyBzdHJpbmc7XG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0uY2xzID0gVFlQRV9DTEFTU19NQVBbdGhpcy50eXBlXTtcblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3R5cGUnKSB7XG4gICAgICAgICAgICB0aGlzLm9uVHlwZUNoYW5nZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ21pbnZhbHVlJyB8fCBrZXkgPT09ICdtYXh2YWx1ZScgfHwga2V5ID09PSAnZGF0YXZhbHVlJyB8fCBrZXkgPT09ICdkYXRhc2V0JyB8fCBrZXkgPT09ICdkaXNwbGF5Zm9ybWF0Jykge1xuICAgICAgICAgICAgdGhpcy5fcHJlcGFyZURhdGEoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19