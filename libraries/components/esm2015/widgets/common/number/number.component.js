import { NgModel } from '@angular/forms';
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AbstractI18nService } from '@wm/core';
import { registerProps } from './number.props';
import { provideAsNgValidators, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { NumberLocale } from '../text/locale/number-locale';
const WIDGET_CONFIG = {
    widgetType: 'wm-number',
    hostClass: 'app-input-wrapper'
};
export class NumberComponent extends NumberLocale {
    constructor(inj, i18nService, decimalPipe) {
        super(inj, WIDGET_CONFIG, i18nService, decimalPipe);
    }
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
NumberComponent.ctorParameters = () => [
    { type: Injector },
    { type: AbstractI18nService },
    { type: DecimalPipe }
];
NumberComponent.propDecorators = {
    inputEl: [{ type: ViewChild, args: ['input',] }],
    ngModel: [{ type: ViewChild, args: [NgModel,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbnVtYmVyL251bWJlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRTlDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUvQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFL0MsT0FBTyxFQUFFLHFCQUFxQixFQUFFLHdCQUF3QixFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDbEgsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTVELE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsV0FBVztJQUN2QixTQUFTLEVBQUUsbUJBQW1CO0NBQ2pDLENBQUM7QUFXRixNQUFNLE9BQU8sZUFBZ0IsU0FBUSxZQUFZO0lBYTdDLFlBQVksR0FBYSxFQUFFLFdBQWdDLEVBQUUsV0FBd0I7UUFDakYsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3hELENBQUM7O0FBZE0sK0JBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFWNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxZQUFZO2dCQUN0QixpMkJBQXNDO2dCQUN0QyxTQUFTLEVBQUU7b0JBQ1Asd0JBQXdCLENBQUMsZUFBZSxDQUFDO29CQUN6QyxxQkFBcUIsQ0FBQyxlQUFlLENBQUM7b0JBQ3RDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztpQkFDdEM7YUFDSjs7OztZQXZCK0IsUUFBUTtZQUcvQixtQkFBbUI7WUFGbkIsV0FBVzs7O3NCQWlDZixTQUFTLFNBQUMsT0FBTztzQkFDakIsU0FBUyxTQUFDLE9BQU8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZGVsIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3RvciwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEZWNpbWFsUGlwZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7IEFic3RyYWN0STE4blNlcnZpY2UgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL251bWJlci5wcm9wcyc7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHByb3ZpZGVBc05nVmFsaWRhdG9ycywgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgTnVtYmVyTG9jYWxlIH0gZnJvbSAnLi4vdGV4dC9sb2NhbGUvbnVtYmVyLWxvY2FsZSc7XG5cbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLW51bWJlcicsXG4gICAgaG9zdENsYXNzOiAnYXBwLWlucHV0LXdyYXBwZXInXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bU51bWJlcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9udW1iZXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IoTnVtYmVyQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzTmdWYWxpZGF0b3JzKE51bWJlckNvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihOdW1iZXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBOdW1iZXJDb21wb25lbnQgZXh0ZW5kcyBOdW1iZXJMb2NhbGUge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgcmVxdWlyZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIHJlZ2V4cDogc3RyaW5nO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyB0YWJpbmRleDogYW55O1xuICAgIHB1YmxpYyBzaG9ydGN1dGtleTogc3RyaW5nO1xuICAgIHB1YmxpYyBhdXRvZm9jdXM6IGJvb2xlYW47XG4gICAgQFZpZXdDaGlsZCgnaW5wdXQnKSBpbnB1dEVsOiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoTmdNb2RlbCkgbmdNb2RlbDogTmdNb2RlbDtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIGkxOG5TZXJ2aWNlOiBBYnN0cmFjdEkxOG5TZXJ2aWNlLCBkZWNpbWFsUGlwZTogRGVjaW1hbFBpcGUpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHLCBpMThuU2VydmljZSwgZGVjaW1hbFBpcGUpO1xuICAgIH1cbn1cbiJdfQ==