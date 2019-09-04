import * as tslib_1 from "tslib";
import { Component, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { styler } from '../../framework/styler';
import { registerProps } from './slider.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';
var DEFAULT_CLS = 'app-slider slider';
var WIDGET_CONFIG = {
    widgetType: 'wm-slider',
    hostClass: DEFAULT_CLS
};
var SliderComponent = /** @class */ (function (_super) {
    tslib_1.__extends(SliderComponent, _super);
    function SliderComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this);
        return _this;
    }
    // change and blur events are added from the template
    SliderComponent.prototype.handleEvent = function (node, eventName, callback, locals) {
        if (eventName !== 'change' && eventName !== 'blur') {
            _super.prototype.handleEvent.call(this, node, eventName, callback, locals);
        }
    };
    SliderComponent.prototype.handleChange = function (newVal) {
        this.invokeOnChange(this.datavalue, { type: 'change' }, this.ngModel.valid);
    };
    SliderComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        _super.prototype.onPropertyChange.call(this, key, nv, ov);
    };
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
    SliderComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    SliderComponent.propDecorators = {
        ngModel: [{ type: ViewChild, args: [NgModel,] }]
    };
    return SliderComponent;
}(BaseFormCustomComponent));
export { SliderComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpZGVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vc2xpZGVyL3NsaWRlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMvRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHekMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMzRixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUc3RSxJQUFNLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQztBQUN4QyxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLFdBQVc7SUFDdkIsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQUVGO0lBUXFDLDJDQUF1QjtJQWN4RCx5QkFBWSxHQUFhO1FBQXpCLFlBQ0ksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQUU1QjtRQURHLE1BQU0sQ0FBQyxLQUFJLENBQUMsYUFBYSxFQUFFLEtBQUksQ0FBQyxDQUFDOztJQUNyQyxDQUFDO0lBRUQscURBQXFEO0lBQzNDLHFDQUFXLEdBQXJCLFVBQXNCLElBQWlCLEVBQUUsU0FBaUIsRUFBRSxRQUFrQixFQUFFLE1BQVc7UUFDdkYsSUFBSSxTQUFTLEtBQUssUUFBUSxJQUFJLFNBQVMsS0FBSyxNQUFNLEVBQUU7WUFDaEQsaUJBQU0sV0FBVyxZQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3hEO0lBQ0wsQ0FBQztJQUVNLHNDQUFZLEdBQW5CLFVBQW9CLE1BQWU7UUFDL0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVELDBDQUFnQixHQUFoQixVQUFpQixHQUFXLEVBQUUsRUFBTyxFQUFFLEVBQVE7UUFDM0MsSUFBSSxHQUFHLEtBQUssVUFBVSxFQUFFO1lBQ3BCLE9BQU87U0FDVjtRQUVELGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQW5DTSwrQkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFUNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxZQUFZO29CQUN0QiwwMkJBQXNDO29CQUN0QyxTQUFTLEVBQUU7d0JBQ1Asd0JBQXdCLENBQUMsZUFBZSxDQUFDO3dCQUN6QyxrQkFBa0IsQ0FBQyxlQUFlLENBQUM7cUJBQ3RDO2lCQUNKOzs7O2dCQXZCbUIsUUFBUTs7OzBCQW9DdkIsU0FBUyxTQUFDLE9BQU87O0lBeUJ0QixzQkFBQztDQUFBLEFBN0NELENBUXFDLHVCQUF1QixHQXFDM0Q7U0FyQ1ksZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0b3IsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmdNb2RlbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3NsaWRlci5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBCYXNlRm9ybUN1c3RvbUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2UvYmFzZS1mb3JtLWN1c3RvbS5jb21wb25lbnQnO1xuXG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1zbGlkZXIgc2xpZGVyJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLXNsaWRlcicsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21TbGlkZXJdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vc2xpZGVyLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKFNsaWRlckNvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihTbGlkZXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBTbGlkZXJDb21wb25lbnQgZXh0ZW5kcyBCYXNlRm9ybUN1c3RvbUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBtaW52YWx1ZTogbnVtYmVyO1xuICAgIHB1YmxpYyBtYXh2YWx1ZTogbnVtYmVyO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgc3RlcDogbnVtYmVyO1xuICAgIHB1YmxpYyBzaG9ydGN1dGtleTogc3RyaW5nO1xuICAgIHB1YmxpYyB0YWJpbmRleDogYW55O1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gICAgcHVibGljIHJlYWRvbmx5OiBib29sZWFuO1xuXG4gICAgQFZpZXdDaGlsZChOZ01vZGVsKSBuZ01vZGVsOiBOZ01vZGVsO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICB9XG5cbiAgICAvLyBjaGFuZ2UgYW5kIGJsdXIgZXZlbnRzIGFyZSBhZGRlZCBmcm9tIHRoZSB0ZW1wbGF0ZVxuICAgIHByb3RlY3RlZCBoYW5kbGVFdmVudChub2RlOiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbiwgbG9jYWxzOiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50TmFtZSAhPT0gJ2NoYW5nZScgJiYgZXZlbnROYW1lICE9PSAnYmx1cicpIHtcbiAgICAgICAgICAgIHN1cGVyLmhhbmRsZUV2ZW50KG5vZGUsIGV2ZW50TmFtZSwgY2FsbGJhY2ssIGxvY2Fscyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaGFuZGxlQ2hhbmdlKG5ld1ZhbDogYm9vbGVhbikge1xuICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCB7dHlwZTogJ2NoYW5nZSd9LCB0aGlzLm5nTW9kZWwudmFsaWQpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgIH1cbn1cbiJdfQ==