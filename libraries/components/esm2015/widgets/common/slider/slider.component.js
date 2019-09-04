import { Component, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { styler } from '../../framework/styler';
import { registerProps } from './slider.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';
const DEFAULT_CLS = 'app-slider slider';
const WIDGET_CONFIG = {
    widgetType: 'wm-slider',
    hostClass: DEFAULT_CLS
};
export class SliderComponent extends BaseFormCustomComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
    // change and blur events are added from the template
    handleEvent(node, eventName, callback, locals) {
        if (eventName !== 'change' && eventName !== 'blur') {
            super.handleEvent(node, eventName, callback, locals);
        }
    }
    handleChange(newVal) {
        this.invokeOnChange(this.datavalue, { type: 'change' }, this.ngModel.valid);
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        super.onPropertyChange(key, nv, ov);
    }
}
SliderComponent.initializeProps = registerProps();
SliderComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmSlider]',
                template: "<span class=\"app-slider-value pull-left\" [attr.aria-valuemin]=\"minvalue\" [textContent]=\"minvalue\"></span>\n<span class=\"app-slider-value pull-right\" [attr.aria-valuemax]=\"maxvalue\" [textContent]=\"maxvalue\"></span>\n<input class=\"range-input\" aria-label=\"slider range\" aria-orientation=\"horizontal\"\n       focus-target\n       type=\"range\" [title]=\"datavalue\"\n       [attr.min]=\"minvalue\"\n       [attr.max]=\"maxvalue\"\n       [attr.step]=\"step\"\n       [(ngModel)]=\"datavalue\"\n       [disabled]=\"disabled\"\n       [attr.accesskey]=\"shortcutkey\"\n       [tabindex]=\"tabindex\"\n       (blur)=\"invokeOnTouched($event)\"\n       (ngModelChange)=\"handleChange($event)\"\n       [attr.name]=\"name\"\n       [tabindex]=\"tabindex\"/>\n<div *ngIf=\"readonly || disabled\" aria-readonly=\"true\" class=\"readonly-wrapper\"></div>",
                providers: [
                    provideAsNgValueAccessor(SliderComponent),
                    provideAsWidgetRef(SliderComponent)
                ]
            }] }
];
/** @nocollapse */
SliderComponent.ctorParameters = () => [
    { type: Injector }
];
SliderComponent.propDecorators = {
    ngModel: [{ type: ViewChild, args: [NgModel,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpZGVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vc2xpZGVyL3NsaWRlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQy9ELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd6QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzNGLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBRzdFLE1BQU0sV0FBVyxHQUFHLG1CQUFtQixDQUFDO0FBQ3hDLE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsV0FBVztJQUN2QixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFDO0FBVUYsTUFBTSxPQUFPLGVBQWdCLFNBQVEsdUJBQXVCO0lBY3hELFlBQVksR0FBYTtRQUNyQixLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxxREFBcUQ7SUFDM0MsV0FBVyxDQUFDLElBQWlCLEVBQUUsU0FBaUIsRUFBRSxRQUFrQixFQUFFLE1BQVc7UUFDdkYsSUFBSSxTQUFTLEtBQUssUUFBUSxJQUFJLFNBQVMsS0FBSyxNQUFNLEVBQUU7WUFDaEQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUN4RDtJQUNMLENBQUM7SUFFTSxZQUFZLENBQUMsTUFBZTtRQUMvQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLEVBQU8sRUFBRSxFQUFRO1FBQzNDLElBQUksR0FBRyxLQUFLLFVBQVUsRUFBRTtZQUNwQixPQUFPO1NBQ1Y7UUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4QyxDQUFDOztBQW5DTSwrQkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVQ1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLDAyQkFBc0M7Z0JBQ3RDLFNBQVMsRUFBRTtvQkFDUCx3QkFBd0IsQ0FBQyxlQUFlLENBQUM7b0JBQ3pDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztpQkFDdEM7YUFDSjs7OztZQXZCbUIsUUFBUTs7O3NCQW9DdkIsU0FBUyxTQUFDLE9BQU8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEluamVjdG9yLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5nTW9kZWwgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9zbGlkZXIucHJvcHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgQmFzZUZvcm1DdXN0b21Db21wb25lbnQgfSBmcm9tICcuLi9iYXNlL2Jhc2UtZm9ybS1jdXN0b20uY29tcG9uZW50JztcblxuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtc2xpZGVyIHNsaWRlcic7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1zbGlkZXInLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFNcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtU2xpZGVyXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3NsaWRlci5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihTbGlkZXJDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoU2xpZGVyQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgU2xpZGVyQ29tcG9uZW50IGV4dGVuZHMgQmFzZUZvcm1DdXN0b21Db21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgbWludmFsdWU6IG51bWJlcjtcbiAgICBwdWJsaWMgbWF4dmFsdWU6IG51bWJlcjtcbiAgICBwdWJsaWMgZGlzYWJsZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIHN0ZXA6IG51bWJlcjtcbiAgICBwdWJsaWMgc2hvcnRjdXRrZXk6IHN0cmluZztcbiAgICBwdWJsaWMgdGFiaW5kZXg6IGFueTtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyByZWFkb25seTogYm9vbGVhbjtcblxuICAgIEBWaWV3Q2hpbGQoTmdNb2RlbCkgbmdNb2RlbDogTmdNb2RlbDtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgLy8gY2hhbmdlIGFuZCBibHVyIGV2ZW50cyBhcmUgYWRkZWQgZnJvbSB0aGUgdGVtcGxhdGVcbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIGxvY2FsczogYW55KSB7XG4gICAgICAgIGlmIChldmVudE5hbWUgIT09ICdjaGFuZ2UnICYmIGV2ZW50TmFtZSAhPT0gJ2JsdXInKSB7XG4gICAgICAgICAgICBzdXBlci5oYW5kbGVFdmVudChub2RlLCBldmVudE5hbWUsIGNhbGxiYWNrLCBsb2NhbHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGhhbmRsZUNoYW5nZShuZXdWYWw6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwge3R5cGU6ICdjaGFuZ2UnfSwgdGhpcy5uZ01vZGVsLnZhbGlkKTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAndGFiaW5kZXgnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICB9XG59XG4iXX0=