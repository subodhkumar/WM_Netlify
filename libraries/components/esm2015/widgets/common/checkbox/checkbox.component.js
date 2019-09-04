import { Attribute, Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { isDefined, toggleClass } from '@wm/core';
import { styler } from '../../framework/styler';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './checkbox.props';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';
const DEFAULT_CLS = 'app-checkbox checkbox';
const WIDGET_CONFIG = {
    widgetType: 'wm-checkbox',
    hostClass: DEFAULT_CLS
};
/*
 * try to convert the chekedvalue and unchecked values to boolean/number
 */
const unStringify = (val, defaultVal) => {
    if (val === null) {
        return defaultVal;
    }
    if (val === true || val === 'true') {
        return true;
    }
    if (val === false || val === 'false') {
        return false;
    }
    const number = parseInt(val, 10);
    if (!isNaN(number)) {
        return number;
    }
    return val;
};
const ɵ0 = unStringify;
export class CheckboxComponent extends BaseFormCustomComponent {
    constructor(inj, checkedVal, uncheckedVal, type) {
        super(inj, WIDGET_CONFIG);
        this._caption = '&nbsp';
        this._checkedvalue = unStringify(checkedVal, true);
        this._uncheckedvalue = unStringify(uncheckedVal, false);
        // if the type of the checkbox is toggle update the related classes on the host node
        toggleClass(this.nativeElement, 'app-toggle', type === 'toggle');
    }
    // if the checkbox is checked, return checkedvalue else return uncheckedvalue
    get datavalue() {
        return isDefined(this.proxyModel) ? (this.proxyModel ? this._checkedvalue : this._uncheckedvalue) : undefined;
    }
    // when the datavalue is set, update the checked state
    set datavalue(v) {
        this.proxyModel = (isDefined(v) && v !== '') ? v === this._checkedvalue : undefined;
        this.updatePrevDatavalue(this.datavalue);
    }
    onPropertyChange(key, nv, ov) {
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
            super.onPropertyChange(key, nv, ov);
        }
    }
    // change and blur events are handled from template
    handleEvent(node, eventName, callback, locals) {
        if (eventName !== 'change' && eventName !== 'blur') {
            // applying tap (Hammer event) on the label as the event handler is not getting triggered on the input.
            const $el = eventName === 'tap' ? this.nativeElement.querySelector('label') : this.checkboxEl.nativeElement;
            super.handleEvent($el, eventName, callback, locals);
        }
    }
    handleChange(newVal) {
        this.invokeOnChange(this.datavalue, { type: 'change' }, this.ngModel.valid);
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.nativeElement.querySelector('label'), this);
    }
}
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
CheckboxComponent.ctorParameters = () => [
    { type: Injector },
    { type: undefined, decorators: [{ type: Attribute, args: ['checkedvalue',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['uncheckedvalue',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['type',] }] }
];
CheckboxComponent.propDecorators = {
    ngModel: [{ type: ViewChild, args: [NgModel,] }],
    checkboxEl: [{ type: ViewChild, args: ['checkbox', { read: ElementRef },] }]
};
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3guY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jaGVja2JveC9jaGVja2JveC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQVUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzdHLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV6QyxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUdsRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLHdCQUF3QixFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM0YsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBRTdFLE1BQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDO0FBQzVDLE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsYUFBYTtJQUN6QixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFDO0FBRUY7O0dBRUc7QUFDSCxNQUFNLFdBQVcsR0FBRyxDQUFDLEdBQUcsRUFBRSxVQUFXLEVBQUUsRUFBRTtJQUNyQyxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDZCxPQUFPLFVBQVUsQ0FBQztLQUNyQjtJQUVELElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssTUFBTSxFQUFFO1FBQ2hDLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFFRCxJQUFJLEdBQUcsS0FBSyxLQUFLLElBQUksR0FBRyxLQUFLLE9BQU8sRUFBRTtRQUNsQyxPQUFPLEtBQUssQ0FBQztL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Q0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7WUFDNUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUN2RDtJQUNMLENBQUM7SUFFRCxZQUFZLENBQUMsTUFBZTtRQUN4QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBR0QsZUFBZTtRQUNYLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUQsQ0FBQzs7QUFoRk0saUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFUNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxjQUFjO2dCQUN4Qiw2NkJBQXdDO2dCQUN4QyxTQUFTLEVBQUU7b0JBQ1Asd0JBQXdCLENBQUMsaUJBQWlCLENBQUM7b0JBQzNDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDO2lCQUN4QzthQUNKOzs7O1lBL0N5RCxRQUFROzRDQTZFekQsU0FBUyxTQUFDLGNBQWM7NENBQ3hCLFNBQVMsU0FBQyxnQkFBZ0I7NENBQzFCLFNBQVMsU0FBQyxNQUFNOzs7c0JBakJwQixTQUFTLFNBQUMsT0FBTzt5QkFDakIsU0FBUyxTQUFDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBBdHRyaWJ1dGUsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5qZWN0b3IsIE9uSW5pdCwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOZ01vZGVsIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyBpc0RlZmluZWQsIHRvZ2dsZUNsYXNzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vY2hlY2tib3gucHJvcHMnO1xuaW1wb3J0IHsgQmFzZUZvcm1DdXN0b21Db21wb25lbnQgfSBmcm9tICcuLi9iYXNlL2Jhc2UtZm9ybS1jdXN0b20uY29tcG9uZW50JztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWNoZWNrYm94IGNoZWNrYm94JztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWNoZWNrYm94JyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG4vKlxuICogdHJ5IHRvIGNvbnZlcnQgdGhlIGNoZWtlZHZhbHVlIGFuZCB1bmNoZWNrZWQgdmFsdWVzIHRvIGJvb2xlYW4vbnVtYmVyXG4gKi9cbmNvbnN0IHVuU3RyaW5naWZ5ID0gKHZhbCwgZGVmYXVsdFZhbD8pID0+IHtcbiAgICBpZiAodmFsID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsO1xuICAgIH1cblxuICAgIGlmICh2YWwgPT09IHRydWUgfHwgdmFsID09PSAndHJ1ZScpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHZhbCA9PT0gZmFsc2UgfHwgdmFsID09PSAnZmFsc2UnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBudW1iZXIgPSBwYXJzZUludCh2YWwsIDEwKTtcbiAgICBpZiAoIWlzTmFOKG51bWJlcikpIHtcbiAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtQ2hlY2tib3hdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vY2hlY2tib3guY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IoQ2hlY2tib3hDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQ2hlY2tib3hDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBDaGVja2JveENvbXBvbmVudCBleHRlbmRzIEJhc2VGb3JtQ3VzdG9tQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIHByb3h5TW9kZWw6IGJvb2xlYW47XG4gICAgcHVibGljIGRpc2FibGVkOiBib29sZWFuO1xuICAgIHB1YmxpYyByZWFkb25seTogYm9vbGVhbjtcbiAgICBwdWJsaWMgcmVxdWlyZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcbiAgICBwdWJsaWMgc2hvcnRjdXRrZXk6IHN0cmluZztcbiAgICBwdWJsaWMgdGFiaW5kZXg6IGFueTtcbiAgICBwdWJsaWMgX2NhcHRpb24gPSAnJm5ic3AnO1xuICAgIHByaXZhdGUgX2NoZWNrZWR2YWx1ZTtcbiAgICBwcml2YXRlIF91bmNoZWNrZWR2YWx1ZTtcblxuICAgIEBWaWV3Q2hpbGQoTmdNb2RlbCkgbmdNb2RlbDogTmdNb2RlbDtcbiAgICBAVmlld0NoaWxkKCdjaGVja2JveCcsIHtyZWFkOiBFbGVtZW50UmVmfSkgY2hlY2tib3hFbDogRWxlbWVudFJlZjtcblxuICAgIC8vIGlmIHRoZSBjaGVja2JveCBpcyBjaGVja2VkLCByZXR1cm4gY2hlY2tlZHZhbHVlIGVsc2UgcmV0dXJuIHVuY2hlY2tlZHZhbHVlXG4gICAgcHVibGljIGdldCBkYXRhdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiBpc0RlZmluZWQodGhpcy5wcm94eU1vZGVsKSA/ICh0aGlzLnByb3h5TW9kZWwgPyB0aGlzLl9jaGVja2VkdmFsdWUgOiB0aGlzLl91bmNoZWNrZWR2YWx1ZSkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8vIHdoZW4gdGhlIGRhdGF2YWx1ZSBpcyBzZXQsIHVwZGF0ZSB0aGUgY2hlY2tlZCBzdGF0ZVxuICAgIHB1YmxpYyBzZXQgZGF0YXZhbHVlKHYpIHtcbiAgICAgICAgdGhpcy5wcm94eU1vZGVsID0gKGlzRGVmaW5lZCh2KSAmJiB2ICE9PSAnJykgPyB2ID09PSB0aGlzLl9jaGVja2VkdmFsdWUgOiB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudXBkYXRlUHJldkRhdGF2YWx1ZSh0aGlzLmRhdGF2YWx1ZSk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2NoZWNrZWR2YWx1ZScpIGNoZWNrZWRWYWwsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ3VuY2hlY2tlZHZhbHVlJykgdW5jaGVja2VkVmFsLFxuICAgICAgICBAQXR0cmlidXRlKCd0eXBlJykgdHlwZVxuICAgICkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuXG4gICAgICAgIHRoaXMuX2NoZWNrZWR2YWx1ZSA9IHVuU3RyaW5naWZ5KGNoZWNrZWRWYWwsIHRydWUpO1xuICAgICAgICB0aGlzLl91bmNoZWNrZWR2YWx1ZSA9IHVuU3RyaW5naWZ5KHVuY2hlY2tlZFZhbCwgZmFsc2UpO1xuXG4gICAgICAgIC8vIGlmIHRoZSB0eXBlIG9mIHRoZSBjaGVja2JveCBpcyB0b2dnbGUgdXBkYXRlIHRoZSByZWxhdGVkIGNsYXNzZXMgb24gdGhlIGhvc3Qgbm9kZVxuICAgICAgICB0b2dnbGVDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdhcHAtdG9nZ2xlJywgdHlwZSA9PT0gJ3RvZ2dsZScpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3RhYmluZGV4Jykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtleSA9PT0gJ2NhcHRpb24nKSB7XG4gICAgICAgICAgICBpZiAoIWlzRGVmaW5lZChudikgfHwgbnYgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FwdGlvbiA9ICcmbmJzcDsnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYXB0aW9uID0gbnY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnY2hlY2tlZHZhbHVlJykge1xuICAgICAgICAgICAgdGhpcy5fY2hlY2tlZHZhbHVlID0gdW5TdHJpbmdpZnkobnYsIHRydWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3VuY2hlY2tlZHZhbHVlJykge1xuICAgICAgICAgICAgdGhpcy5fdW5jaGVja2VkdmFsdWUgPSB1blN0cmluZ2lmeShudiwgZmFsc2UpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2RhdGF2YWx1ZScpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YXZhbHVlID0gdW5TdHJpbmdpZnkobnYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjaGFuZ2UgYW5kIGJsdXIgZXZlbnRzIGFyZSBoYW5kbGVkIGZyb20gdGVtcGxhdGVcbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIGxvY2FsczogYW55KSB7XG4gICAgICAgIGlmIChldmVudE5hbWUgIT09ICdjaGFuZ2UnICYmIGV2ZW50TmFtZSAhPT0gJ2JsdXInKSB7XG4gICAgICAgICAgICAvLyBhcHBseWluZyB0YXAgKEhhbW1lciBldmVudCkgb24gdGhlIGxhYmVsIGFzIHRoZSBldmVudCBoYW5kbGVyIGlzIG5vdCBnZXR0aW5nIHRyaWdnZXJlZCBvbiB0aGUgaW5wdXQuXG4gICAgICAgICAgICBjb25zdCAkZWwgPSBldmVudE5hbWUgPT09ICd0YXAnID8gdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xhYmVsJykgOiB0aGlzLmNoZWNrYm94RWwubmF0aXZlRWxlbWVudDtcbiAgICAgICAgICAgIHN1cGVyLmhhbmRsZUV2ZW50KCRlbCwgZXZlbnROYW1lLCBjYWxsYmFjaywgbG9jYWxzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUNoYW5nZShuZXdWYWw6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwge3R5cGU6ICdjaGFuZ2UnfSwgdGhpcy5uZ01vZGVsLnZhbGlkKTtcbiAgICB9XG5cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdBZnRlclZpZXdJbml0KCk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignbGFiZWwnKSwgdGhpcyk7XG4gICAgfVxufVxuIl19