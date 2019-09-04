import * as tslib_1 from "tslib";
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CURRENCY_INFO, AbstractI18nService } from '@wm/core';
import { provideAsNgValidators, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './currency.props';
import { NumberLocale } from '../text/locale/number-locale';
var DEFAULT_CLS = 'input-group app-currency';
var WIDGET_CONFIG = {
    widgetType: 'wm-currency',
    hostClass: DEFAULT_CLS
};
var CurrencyComponent = /** @class */ (function (_super) {
    tslib_1.__extends(CurrencyComponent, _super);
    function CurrencyComponent(inj, i18nService, decimalPipe) {
        return _super.call(this, inj, WIDGET_CONFIG, i18nService, decimalPipe) || this;
    }
    CurrencyComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'currency') {
            this.currencySymbol = CURRENCY_INFO[this.currency || 'USD'].symbol;
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    CurrencyComponent.initializeProps = registerProps();
    CurrencyComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmCurrency]',
                    template: "<span class=\"input-group-addon\" [textContent]=\"currencySymbol\"></span>\n<input class=\"form-control app-textbox app-currency-input\"\n       #input\n       role=\"input\"\n       type=\"text\"\n       focus-target\n       [autofocus]=\"autofocus\"\n       [readonly]=\"readonly\"\n       [disabled]=\"disabled\"\n       [required]=\"required\"\n       [pattern]=\"regexp\"\n       [attr.name]=\"name\"\n       [attr.aria-label]=\"name\"\n       [attr.tabindex]=\"tabindex\"\n       [attr.placeholder]=\"placeholder\"\n       [attr.accesskey]=\"shortcutkey\"\n       [ngModel]=\"displayValue\"\n       [ngModelOptions]=\"ngModelOptions\"\n\n       (blur)=\"handleBlur($event)\"\n       (ngModelChange)=\"datavalue=$event\"\n       (keypress)=\"validateInputEntry($event)\"\n       (keydown.enter)=\"onEnter($event)\"\n       (keydown.ArrowUp)=\"onArrowPress($event, 'UP')\"\n       (keydown.ArrowDown)=\"onArrowPress($event, 'DOWN')\">",
                    providers: [
                        provideAsNgValueAccessor(CurrencyComponent),
                        provideAsNgValidators(CurrencyComponent),
                        provideAsWidgetRef(CurrencyComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    CurrencyComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: AbstractI18nService },
        { type: DecimalPipe }
    ]; };
    CurrencyComponent.propDecorators = {
        ngModel: [{ type: ViewChild, args: [NgModel,] }],
        inputEl: [{ type: ViewChild, args: ['input', { read: ElementRef },] }]
    };
    return CurrencyComponent;
}(NumberLocale));
export { CurrencyComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VycmVuY3kuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jdXJyZW5jeS9jdXJyZW5jeS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3pDLE9BQU8sRUFBRyxXQUFXLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsYUFBYSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRzlELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2xILE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFNUQsSUFBTSxXQUFXLEdBQUcsMEJBQTBCLENBQUM7QUFFL0MsSUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxhQUFhO0lBQ3pCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUM7QUFFRjtJQVN1Qyw2Q0FBWTtJQWdCL0MsMkJBQVksR0FBYSxFQUFFLFdBQWdDLEVBQUUsV0FBd0I7ZUFDakYsa0JBQU0sR0FBRyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDO0lBQ3ZELENBQUM7SUFFRCw0Q0FBZ0IsR0FBaEIsVUFBaUIsR0FBVyxFQUFFLEVBQU8sRUFBRSxFQUFRO1FBQzNDLElBQUksR0FBRyxLQUFLLFVBQVUsRUFBRTtZQUNwQixJQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQztTQUN0RTthQUFNO1lBQ0gsaUJBQU0sZ0JBQWdCLFlBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN2QztJQUNMLENBQUM7SUF6Qk0saUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBVjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsY0FBYztvQkFDeEIsczdCQUF3QztvQkFDeEMsU0FBUyxFQUFFO3dCQUNQLHdCQUF3QixDQUFDLGlCQUFpQixDQUFDO3dCQUMzQyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQzt3QkFDeEMsa0JBQWtCLENBQUMsaUJBQWlCLENBQUM7cUJBQ3hDO2lCQUNKOzs7O2dCQTFCK0IsUUFBUTtnQkFJaEIsbUJBQW1CO2dCQUZqQyxXQUFXOzs7MEJBc0NoQixTQUFTLFNBQUMsT0FBTzswQkFDakIsU0FBUyxTQUFDLE9BQU8sRUFBRSxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUM7O0lBYTFDLHdCQUFDO0NBQUEsQUFwQ0QsQ0FTdUMsWUFBWSxHQTJCbEQ7U0EzQlksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3RvciwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOZ01vZGVsIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgIERlY2ltYWxQaXBlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgQ1VSUkVOQ1lfSU5GTywgQWJzdHJhY3RJMThuU2VydmljZSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbGlkYXRvcnMsIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2N1cnJlbmN5LnByb3BzJztcbmltcG9ydCB7IE51bWJlckxvY2FsZSB9IGZyb20gJy4uL3RleHQvbG9jYWxlL251bWJlci1sb2NhbGUnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdpbnB1dC1ncm91cCBhcHAtY3VycmVuY3knO1xuXG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1jdXJyZW5jeScsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21DdXJyZW5jeV0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9jdXJyZW5jeS5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihDdXJyZW5jeUNvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc05nVmFsaWRhdG9ycyhDdXJyZW5jeUNvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihDdXJyZW5jeUNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIEN1cnJlbmN5Q29tcG9uZW50IGV4dGVuZHMgTnVtYmVyTG9jYWxlIHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgY3VycmVuY3k6IHN0cmluZztcbiAgICBjdXJyZW5jeVN5bWJvbDogc3RyaW5nO1xuICAgIHB1YmxpYyByZXF1aXJlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgcmVnZXhwOiBhbnk7XG4gICAgcHVibGljIGRpc2FibGVkOiBib29sZWFuO1xuICAgIHB1YmxpYyBhdXRvZm9jdXM6IGJvb2xlYW47XG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcbiAgICBwdWJsaWMgdGFiaW5kZXg6IGFueTtcbiAgICBwdWJsaWMgc2hvcnRjdXRrZXk6IHN0cmluZztcblxuICAgIEBWaWV3Q2hpbGQoTmdNb2RlbCkgbmdNb2RlbDogTmdNb2RlbDtcbiAgICBAVmlld0NoaWxkKCdpbnB1dCcsIHtyZWFkOiBFbGVtZW50UmVmfSkgaW5wdXRFbDogRWxlbWVudFJlZjtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIGkxOG5TZXJ2aWNlOiBBYnN0cmFjdEkxOG5TZXJ2aWNlLCBkZWNpbWFsUGlwZTogRGVjaW1hbFBpcGUpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHLCBpMThuU2VydmljZSwgZGVjaW1hbFBpcGUpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdjdXJyZW5jeScpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVuY3lTeW1ib2wgPSBDVVJSRU5DWV9JTkZPW3RoaXMuY3VycmVuY3kgfHwgJ1VTRCddLnN5bWJvbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19