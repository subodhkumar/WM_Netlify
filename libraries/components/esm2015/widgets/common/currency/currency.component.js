import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CURRENCY_INFO, AbstractI18nService } from '@wm/core';
import { provideAsNgValidators, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './currency.props';
import { NumberLocale } from '../text/locale/number-locale';
const DEFAULT_CLS = 'input-group app-currency';
const WIDGET_CONFIG = {
    widgetType: 'wm-currency',
    hostClass: DEFAULT_CLS
};
export class CurrencyComponent extends NumberLocale {
    constructor(inj, i18nService, decimalPipe) {
        super(inj, WIDGET_CONFIG, i18nService, decimalPipe);
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'currency') {
            this.currencySymbol = CURRENCY_INFO[this.currency || 'USD'].symbol;
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
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
CurrencyComponent.ctorParameters = () => [
    { type: Injector },
    { type: AbstractI18nService },
    { type: DecimalPipe }
];
CurrencyComponent.propDecorators = {
    ngModel: [{ type: ViewChild, args: [NgModel,] }],
    inputEl: [{ type: ViewChild, args: ['input', { read: ElementRef },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VycmVuY3kuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jdXJyZW5jeS9jdXJyZW5jeS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFHLFdBQVcsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRS9DLE9BQU8sRUFBRSxhQUFhLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHOUQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLHdCQUF3QixFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDbEgsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUU1RCxNQUFNLFdBQVcsR0FBRywwQkFBMEIsQ0FBQztBQUUvQyxNQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGFBQWE7SUFDekIsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQVdGLE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxZQUFZO0lBZ0IvQyxZQUFZLEdBQWEsRUFBRSxXQUFnQyxFQUFFLFdBQXdCO1FBQ2pGLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLEVBQU8sRUFBRSxFQUFRO1FBQzNDLElBQUksR0FBRyxLQUFLLFVBQVUsRUFBRTtZQUNwQixJQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQztTQUN0RTthQUFNO1lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDOztBQXpCTSxpQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVY1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLGNBQWM7Z0JBQ3hCLHM3QkFBd0M7Z0JBQ3hDLFNBQVMsRUFBRTtvQkFDUCx3QkFBd0IsQ0FBQyxpQkFBaUIsQ0FBQztvQkFDM0MscUJBQXFCLENBQUMsaUJBQWlCLENBQUM7b0JBQ3hDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDO2lCQUN4QzthQUNKOzs7O1lBMUIrQixRQUFRO1lBSWhCLG1CQUFtQjtZQUZqQyxXQUFXOzs7c0JBc0NoQixTQUFTLFNBQUMsT0FBTztzQkFDakIsU0FBUyxTQUFDLE9BQU8sRUFBRSxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5nTW9kZWwgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyAgRGVjaW1hbFBpcGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBDVVJSRU5DWV9JTkZPLCBBYnN0cmFjdEkxOG5TZXJ2aWNlIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHByb3ZpZGVBc05nVmFsaWRhdG9ycywgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vY3VycmVuY3kucHJvcHMnO1xuaW1wb3J0IHsgTnVtYmVyTG9jYWxlIH0gZnJvbSAnLi4vdGV4dC9sb2NhbGUvbnVtYmVyLWxvY2FsZSc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2lucHV0LWdyb3VwIGFwcC1jdXJyZW5jeSc7XG5cbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWN1cnJlbmN5JyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bUN1cnJlbmN5XScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2N1cnJlbmN5LmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKEN1cnJlbmN5Q29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzTmdWYWxpZGF0b3JzKEN1cnJlbmN5Q29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKEN1cnJlbmN5Q29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgQ3VycmVuY3lDb21wb25lbnQgZXh0ZW5kcyBOdW1iZXJMb2NhbGUge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBjdXJyZW5jeTogc3RyaW5nO1xuICAgIGN1cnJlbmN5U3ltYm9sOiBzdHJpbmc7XG4gICAgcHVibGljIHJlcXVpcmVkOiBib29sZWFuO1xuICAgIHB1YmxpYyByZWdleHA6IGFueTtcbiAgICBwdWJsaWMgZGlzYWJsZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIGF1dG9mb2N1czogYm9vbGVhbjtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyB0YWJpbmRleDogYW55O1xuICAgIHB1YmxpYyBzaG9ydGN1dGtleTogc3RyaW5nO1xuXG4gICAgQFZpZXdDaGlsZChOZ01vZGVsKSBuZ01vZGVsOiBOZ01vZGVsO1xuICAgIEBWaWV3Q2hpbGQoJ2lucHV0Jywge3JlYWQ6IEVsZW1lbnRSZWZ9KSBpbnB1dEVsOiBFbGVtZW50UmVmO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3RvciwgaTE4blNlcnZpY2U6IEFic3RyYWN0STE4blNlcnZpY2UsIGRlY2ltYWxQaXBlOiBEZWNpbWFsUGlwZSkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcsIGkxOG5TZXJ2aWNlLCBkZWNpbWFsUGlwZSk7XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2N1cnJlbmN5Jykge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW5jeVN5bWJvbCA9IENVUlJFTkNZX0lORk9bdGhpcy5jdXJyZW5jeSB8fCAnVVNEJ10uc3ltYm9sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=