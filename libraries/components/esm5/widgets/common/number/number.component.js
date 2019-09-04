import * as tslib_1 from "tslib";
import { NgModel } from '@angular/forms';
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AbstractI18nService } from '@wm/core';
import { registerProps } from './number.props';
import { provideAsNgValidators, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { NumberLocale } from '../text/locale/number-locale';
var WIDGET_CONFIG = {
    widgetType: 'wm-number',
    hostClass: 'app-input-wrapper'
};
var NumberComponent = /** @class */ (function (_super) {
    tslib_1.__extends(NumberComponent, _super);
    function NumberComponent(inj, i18nService, decimalPipe) {
        return _super.call(this, inj, WIDGET_CONFIG, i18nService, decimalPipe) || this;
    }
    NumberComponent.initializeProps = registerProps();
    NumberComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmNumber]',
                    template: "<input class=\"form-control app-textbox app-number-input\"\n       inputmode=\"numeric\"\n       focus-target\n       [attr.name]=\"name\"\n       role=\"input\"\n       type=\"text\"\n       [ngModel]=\"displayValue\"\n       [readonly]=\"readonly\"\n       [disabled]=\"disabled\"\n       [pattern]=\"regexp\"\n       [attr.tabindex]=\"tabindex\"\n       [attr.placeholder]=\"placeholder\"\n       [attr.accesskey]=\"shortcutkey\"\n       [autofocus]=\"autofocus\"\n       (ngModelChange)=\"datavalue=$event\"\n       (blur)=\"handleBlur($event)\"\n       [ngModelOptions]=\"ngModelOptions\"\n       [required]=\"required\"\n       (keypress)=\"validateInputEntry($event)\"\n       (keydown.enter)=\"onEnter($event)\"\n       (keydown.ArrowUp)=\"onArrowPress($event, 'UP')\"\n       (keydown.ArrowDown)=\"onArrowPress($event, 'DOWN')\"\n       #input>",
                    providers: [
                        provideAsNgValueAccessor(NumberComponent),
                        provideAsNgValidators(NumberComponent),
                        provideAsWidgetRef(NumberComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    NumberComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: AbstractI18nService },
        { type: DecimalPipe }
    ]; };
    NumberComponent.propDecorators = {
        inputEl: [{ type: ViewChild, args: ['input',] }],
        ngModel: [{ type: ViewChild, args: [NgModel,] }]
    };
    return NumberComponent;
}(NumberLocale));
export { NumberComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbnVtYmVyL251bWJlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUU5QyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFL0MsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRS9DLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2xILE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUU1RCxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLFdBQVc7SUFDdkIsU0FBUyxFQUFFLG1CQUFtQjtDQUNqQyxDQUFDO0FBRUY7SUFTcUMsMkNBQVk7SUFhN0MseUJBQVksR0FBYSxFQUFFLFdBQWdDLEVBQUUsV0FBd0I7ZUFDakYsa0JBQU0sR0FBRyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDO0lBQ3ZELENBQUM7SUFkTSwrQkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFWNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxZQUFZO29CQUN0QixpMkJBQXNDO29CQUN0QyxTQUFTLEVBQUU7d0JBQ1Asd0JBQXdCLENBQUMsZUFBZSxDQUFDO3dCQUN6QyxxQkFBcUIsQ0FBQyxlQUFlLENBQUM7d0JBQ3RDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztxQkFDdEM7aUJBQ0o7Ozs7Z0JBdkIrQixRQUFRO2dCQUcvQixtQkFBbUI7Z0JBRm5CLFdBQVc7OzswQkFpQ2YsU0FBUyxTQUFDLE9BQU87MEJBQ2pCLFNBQVMsU0FBQyxPQUFPOztJQUt0QixzQkFBQztDQUFBLEFBekJELENBU3FDLFlBQVksR0FnQmhEO1NBaEJZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZGVsIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3RvciwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEZWNpbWFsUGlwZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7IEFic3RyYWN0STE4blNlcnZpY2UgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL251bWJlci5wcm9wcyc7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHByb3ZpZGVBc05nVmFsaWRhdG9ycywgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgTnVtYmVyTG9jYWxlIH0gZnJvbSAnLi4vdGV4dC9sb2NhbGUvbnVtYmVyLWxvY2FsZSc7XG5cbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLW51bWJlcicsXG4gICAgaG9zdENsYXNzOiAnYXBwLWlucHV0LXdyYXBwZXInXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bU51bWJlcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9udW1iZXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IoTnVtYmVyQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzTmdWYWxpZGF0b3JzKE51bWJlckNvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihOdW1iZXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBOdW1iZXJDb21wb25lbnQgZXh0ZW5kcyBOdW1iZXJMb2NhbGUge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgcmVxdWlyZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIHJlZ2V4cDogc3RyaW5nO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyB0YWJpbmRleDogYW55O1xuICAgIHB1YmxpYyBzaG9ydGN1dGtleTogc3RyaW5nO1xuICAgIHB1YmxpYyBhdXRvZm9jdXM6IGJvb2xlYW47XG4gICAgQFZpZXdDaGlsZCgnaW5wdXQnKSBpbnB1dEVsOiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoTmdNb2RlbCkgbmdNb2RlbDogTmdNb2RlbDtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIGkxOG5TZXJ2aWNlOiBBYnN0cmFjdEkxOG5TZXJ2aWNlLCBkZWNpbWFsUGlwZTogRGVjaW1hbFBpcGUpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHLCBpMThuU2VydmljZSwgZGVjaW1hbFBpcGUpO1xuICAgIH1cbn1cbiJdfQ==