import * as tslib_1 from "tslib";
import { Attribute, Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { isDefined, toggleClass } from '@wm/core';
import { styler } from '../../framework/styler';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './checkbox.props';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';
var DEFAULT_CLS = 'app-checkbox checkbox';
var WIDGET_CONFIG = {
    widgetType: 'wm-checkbox',
    hostClass: DEFAULT_CLS
};
/*
 * try to convert the chekedvalue and unchecked values to boolean/number
 */
var unStringify = function (val, defaultVal) {
    if (val === null) {
        return defaultVal;
    }
    if (val === true || val === 'true') {
        return true;
    }
    if (val === false || val === 'false') {
        return false;
    }
    var number = parseInt(val, 10);
    if (!isNaN(number)) {
        return number;
    }
    return val;
};
var ɵ0 = unStringify;
var CheckboxComponent = /** @class */ (function (_super) {
    tslib_1.__extends(CheckboxComponent, _super);
    function CheckboxComponent(inj, checkedVal, uncheckedVal, type) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this._caption = '&nbsp';
        _this._checkedvalue = unStringify(checkedVal, true);
        _this._uncheckedvalue = unStringify(uncheckedVal, false);
        // if the type of the checkbox is toggle update the related classes on the host node
        toggleClass(_this.nativeElement, 'app-toggle', type === 'toggle');
        return _this;
    }
    Object.defineProperty(CheckboxComponent.prototype, "datavalue", {
        // if the checkbox is checked, return checkedvalue else return uncheckedvalue
        get: function () {
            return isDefined(this.proxyModel) ? (this.proxyModel ? this._checkedvalue : this._uncheckedvalue) : undefined;
        },
        // when the datavalue is set, update the checked state
        set: function (v) {
            this.proxyModel = (isDefined(v) && v !== '') ? v === this._checkedvalue : undefined;
            this.updatePrevDatavalue(this.datavalue);
        },
        enumerable: true,
        configurable: true
    });
    CheckboxComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        if (key === 'caption') {
            if (!isDefined(nv) || nv === '') {
                this._caption = '&nbsp;';
            }
            else {
                this._caption = nv;
            }
        }
        else if (key === 'checkedvalue') {
            this._checkedvalue = unStringify(nv, true);
        }
        else if (key === 'uncheckedvalue') {
            this._uncheckedvalue = unStringify(nv, false);
        }
        else if (key === 'datavalue') {
            this.datavalue = unStringify(nv);
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    // change and blur events are handled from template
    CheckboxComponent.prototype.handleEvent = function (node, eventName, callback, locals) {
        if (eventName !== 'change' && eventName !== 'blur') {
            // applying tap (Hammer event) on the label as the event handler is not getting triggered on the input.
            var $el = eventName === 'tap' ? this.nativeElement.querySelector('label') : this.checkboxEl.nativeElement;
            _super.prototype.handleEvent.call(this, $el, eventName, callback, locals);
        }
    };
    CheckboxComponent.prototype.handleChange = function (newVal) {
        this.invokeOnChange(this.datavalue, { type: 'change' }, this.ngModel.valid);
    };
    CheckboxComponent.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        styler(this.nativeElement.querySelector('label'), this);
    };
    CheckboxComponent.initializeProps = registerProps();
    CheckboxComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmCheckbox]',
                    template: "<label [ngClass]=\"{'unchecked': !proxyModel, 'disabled': (disabled || readonly), 'required': (required && _caption)}\" role=\"button\">\n    <input type=\"checkbox\" aria-describedby=\"checkbox\"\n           #checkbox\n           [attr.name]=\"name\"\n           focus-target\n           [(ngModel)]=\"proxyModel\"\n           [readonly]=\"readonly\"\n           [required]=\"required\"\n           [disabled]=\"disabled || readonly\"\n           [attr.accesskey]=\"shortcutkey\"\n           [tabindex]=\"tabindex\"\n           (blur)=\"invokeOnTouched($event)\"\n           (ngModelChange)=\"handleChange($event)\">\n    <span class=\"caption\" [innerHtml]=\"_caption\"></span>\n    <img alt=\"Checkbox Image\" src=\"data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==\" class=\"switch\"/>\n</label>\n<input type=\"hidden\" class=\"ng-hide model-holder\" [disabled]=\"disabled\" [value]=\"proxyModel\">\n",
                    providers: [
                        provideAsNgValueAccessor(CheckboxComponent),
                        provideAsWidgetRef(CheckboxComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    CheckboxComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: undefined, decorators: [{ type: Attribute, args: ['checkedvalue',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['uncheckedvalue',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['type',] }] }
    ]; };
    CheckboxComponent.propDecorators = {
        ngModel: [{ type: ViewChild, args: [NgModel,] }],
        checkboxEl: [{ type: ViewChild, args: ['checkbox', { read: ElementRef },] }]
    };
    return CheckboxComponent;
}(BaseFormCustomComponent));
export { CheckboxComponent };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3guY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jaGVja2JveC9jaGVja2JveC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFVLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3RyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFekMsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHbEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzNGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUU3RSxJQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQztBQUM1QyxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGFBQWE7SUFDekIsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQUVGOztHQUVHO0FBQ0gsSUFBTSxXQUFXLEdBQUcsVUFBQyxHQUFHLEVBQUUsVUFBVztJQUNqQyxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDZCxPQUFPLFVBQVUsQ0FBQztLQUNyQjtJQUVELElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssTUFBTSxFQUFFO1FBQ2hDLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFFRCxJQUFJLEdBQUcsS0FBSyxLQUFLLElBQUksR0FBRyxLQUFLLE9BQU8sRUFBRTtRQUNsQyxPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUVE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b25lbnQsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBPbkluaXQsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmdNb2RlbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgaXNEZWZpbmVkLCB0b2dnbGVDbGFzcyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2NoZWNrYm94LnByb3BzJztcbmltcG9ydCB7IEJhc2VGb3JtQ3VzdG9tQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9iYXNlLWZvcm0tY3VzdG9tLmNvbXBvbmVudCc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1jaGVja2JveCBjaGVja2JveCc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1jaGVja2JveCcsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuLypcbiAqIHRyeSB0byBjb252ZXJ0IHRoZSBjaGVrZWR2YWx1ZSBhbmQgdW5jaGVja2VkIHZhbHVlcyB0byBib29sZWFuL251bWJlclxuICovXG5jb25zdCB1blN0cmluZ2lmeSA9ICh2YWwsIGRlZmF1bHRWYWw/KSA9PiB7XG4gICAgaWYgKHZhbCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbDtcbiAgICB9XG5cbiAgICBpZiAodmFsID09PSB0cnVlIHx8IHZhbCA9PT0gJ3RydWUnKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICh2YWwgPT09IGZhbHNlIHx8IHZhbCA9PT0gJ2ZhbHNlJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbnVtYmVyID0gcGFyc2VJbnQodmFsLCAxMCk7XG4gICAgaWYgKCFpc05hTihudW1iZXIpKSB7XG4gICAgICAgIHJldHVybiBudW1iZXI7XG4gICAgfVxuICAgIHJldHVybiB2YWw7XG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bUNoZWNrYm94XScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2NoZWNrYm94LmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKENoZWNrYm94Q29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKENoZWNrYm94Q29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgQ2hlY2tib3hDb21wb25lbnQgZXh0ZW5kcyBCYXNlRm9ybUN1c3RvbUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBwcm94eU1vZGVsOiBib29sZWFuO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgcmVhZG9ubHk6IGJvb2xlYW47XG4gICAgcHVibGljIHJlcXVpcmVkOiBib29sZWFuO1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gICAgcHVibGljIHNob3J0Y3V0a2V5OiBzdHJpbmc7XG4gICAgcHVibGljIHRhYmluZGV4OiBhbnk7XG4gICAgcHVibGljIF9jYXB0aW9uID0gJyZuYnNwJztcbiAgICBwcml2YXRlIF9jaGVja2VkdmFsdWU7XG4gICAgcHJpdmF0ZSBfdW5jaGVja2VkdmFsdWU7XG5cbiAgICBAVmlld0NoaWxkKE5nTW9kZWwpIG5nTW9kZWw6IE5nTW9kZWw7XG4gICAgQFZpZXdDaGlsZCgnY2hlY2tib3gnLCB7cmVhZDogRWxlbWVudFJlZn0pIGNoZWNrYm94RWw6IEVsZW1lbnRSZWY7XG5cbiAgICAvLyBpZiB0aGUgY2hlY2tib3ggaXMgY2hlY2tlZCwgcmV0dXJuIGNoZWNrZWR2YWx1ZSBlbHNlIHJldHVybiB1bmNoZWNrZWR2YWx1ZVxuICAgIHB1YmxpYyBnZXQgZGF0YXZhbHVlKCkge1xuICAgICAgICByZXR1cm4gaXNEZWZpbmVkKHRoaXMucHJveHlNb2RlbCkgPyAodGhpcy5wcm94eU1vZGVsID8gdGhpcy5fY2hlY2tlZHZhbHVlIDogdGhpcy5fdW5jaGVja2VkdmFsdWUpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvLyB3aGVuIHRoZSBkYXRhdmFsdWUgaXMgc2V0LCB1cGRhdGUgdGhlIGNoZWNrZWQgc3RhdGVcbiAgICBwdWJsaWMgc2V0IGRhdGF2YWx1ZSh2KSB7XG4gICAgICAgIHRoaXMucHJveHlNb2RlbCA9IChpc0RlZmluZWQodikgJiYgdiAhPT0gJycpID8gdiA9PT0gdGhpcy5fY2hlY2tlZHZhbHVlIDogdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnVwZGF0ZVByZXZEYXRhdmFsdWUodGhpcy5kYXRhdmFsdWUpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBAQXR0cmlidXRlKCdjaGVja2VkdmFsdWUnKSBjaGVja2VkVmFsLFxuICAgICAgICBAQXR0cmlidXRlKCd1bmNoZWNrZWR2YWx1ZScpIHVuY2hlY2tlZFZhbCxcbiAgICAgICAgQEF0dHJpYnV0ZSgndHlwZScpIHR5cGVcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICB0aGlzLl9jaGVja2VkdmFsdWUgPSB1blN0cmluZ2lmeShjaGVja2VkVmFsLCB0cnVlKTtcbiAgICAgICAgdGhpcy5fdW5jaGVja2VkdmFsdWUgPSB1blN0cmluZ2lmeSh1bmNoZWNrZWRWYWwsIGZhbHNlKTtcblxuICAgICAgICAvLyBpZiB0aGUgdHlwZSBvZiB0aGUgY2hlY2tib3ggaXMgdG9nZ2xlIHVwZGF0ZSB0aGUgcmVsYXRlZCBjbGFzc2VzIG9uIHRoZSBob3N0IG5vZGVcbiAgICAgICAgdG9nZ2xlQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCAnYXBwLXRvZ2dsZScsIHR5cGUgPT09ICd0b2dnbGUnKTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChrZXkgPT09ICdjYXB0aW9uJykge1xuICAgICAgICAgICAgaWYgKCFpc0RlZmluZWQobnYpIHx8IG52ID09PSAnJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhcHRpb24gPSAnJm5ic3A7JztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FwdGlvbiA9IG52O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2NoZWNrZWR2YWx1ZScpIHtcbiAgICAgICAgICAgIHRoaXMuX2NoZWNrZWR2YWx1ZSA9IHVuU3RyaW5naWZ5KG52LCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICd1bmNoZWNrZWR2YWx1ZScpIHtcbiAgICAgICAgICAgIHRoaXMuX3VuY2hlY2tlZHZhbHVlID0gdW5TdHJpbmdpZnkobnYsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdkYXRhdmFsdWUnKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGF2YWx1ZSA9IHVuU3RyaW5naWZ5KG52KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2hhbmdlIGFuZCBibHVyIGV2ZW50cyBhcmUgaGFuZGxlZCBmcm9tIHRlbXBsYXRlXG4gICAgcHJvdGVjdGVkIGhhbmRsZUV2ZW50KG5vZGU6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uLCBsb2NhbHM6IGFueSkge1xuICAgICAgICBpZiAoZXZlbnROYW1lICE9PSAnY2hhbmdlJyAmJiBldmVudE5hbWUgIT09ICdibHVyJykge1xuICAgICAgICAgICAgLy8gYXBwbHlpbmcgdGFwIChIYW1tZXIgZXZlbnQpIG9uIHRoZSBsYWJlbCBhcyB0aGUgZXZlbnQgaGFuZGxlciBpcyBub3QgZ2V0dGluZyB0cmlnZ2VyZWQgb24gdGhlIGlucHV0LlxuICAgICAgICAgICAgY29uc3QgJGVsID0gZXZlbnROYW1lID09PSAndGFwJyA/IHRoaXMubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsYWJlbCcpIDogdGhpcy5jaGVja2JveEVsLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgICAgICBzdXBlci5oYW5kbGVFdmVudCgkZWwsIGV2ZW50TmFtZSwgY2FsbGJhY2ssIGxvY2Fscyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVDaGFuZ2UobmV3VmFsOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsIHt0eXBlOiAnY2hhbmdlJ30sIHRoaXMubmdNb2RlbC52YWxpZCk7XG4gICAgfVxuXG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xhYmVsJyksIHRoaXMpO1xuICAgIH1cbn1cbiJdfQ==