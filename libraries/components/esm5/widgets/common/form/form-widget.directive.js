import { Attribute, Directive, Inject, Self, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormComponent } from './form.component';
import { WidgetRef } from '../../framework/types';
import { TableComponent } from '../table/table.component';
var FormWidgetDirective = /** @class */ (function () {
    function FormWidgetDirective(form, table, componentInstance, fb, name, key) {
        var _this = this;
        this.componentInstance = componentInstance;
        this.name = name;
        this.key = key;
        this.fb = fb;
        this.parent = form || table;
        this.ngform = this.parent.ngform;
        this.componentInstance.registerPropertyChangeListener(function (k, nv) {
            if (k === 'datavalue' && _this._control) {
                _this._control.setValue(nv);
            }
            else if (k === 'name' && !_this._control) {
                _this.addControl(_this.key || nv);
            }
        });
    }
    Object.defineProperty(FormWidgetDirective.prototype, "_control", {
        get: function () {
            var fieldName = this.key || this.name;
            if (!fieldName) {
                return undefined;
            }
            return this.ngform && this.ngform.controls[fieldName];
        },
        enumerable: true,
        configurable: true
    });
    FormWidgetDirective.prototype.addControl = function (fieldName) {
        this.ngform.addControl(fieldName, this.createControl());
    };
    FormWidgetDirective.prototype.createControl = function () {
        return this.fb.control(this.componentInstance.datavalue);
    };
    FormWidgetDirective.prototype.ngOnInit = function () {
        var fieldName = this.key || this.name;
        if (fieldName && !this._control) {
            this.addControl(fieldName);
            this.parent.registerFormWidget(this.componentInstance);
        }
    };
    FormWidgetDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmFormWidget]'
                },] }
    ];
    /** @nocollapse */
    FormWidgetDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [FormComponent,] }] },
        { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [TableComponent,] }] },
        { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] },
        { type: FormBuilder },
        { type: undefined, decorators: [{ type: Attribute, args: ['name',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['key',] }] }
    ]; };
    return FormWidgetDirective;
}());
export { FormWidgetDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS13aWRnZXQuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9mb3JtL2Zvcm0td2lkZ2V0LmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQVUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNyRixPQUFPLEVBQUUsV0FBVyxFQUFhLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFMUQ7SUFTSSw2QkFDdUMsSUFBSSxFQUNILEtBQUssRUFDUCxpQkFBaUIsRUFDbkQsRUFBZSxFQUNXLElBQUksRUFDTCxHQUFHO1FBTmhDLGlCQWtCQztRQWZxQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQUE7UUFFekIsU0FBSSxHQUFKLElBQUksQ0FBQTtRQUNMLFFBQUcsR0FBSCxHQUFHLENBQUE7UUFDNUIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksSUFBSSxLQUFLLENBQUM7UUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUVqQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsOEJBQThCLENBQUMsVUFBQyxDQUFDLEVBQUUsRUFBRTtZQUN4RCxJQUFJLENBQUMsS0FBSyxXQUFXLElBQUksS0FBSSxDQUFDLFFBQVEsRUFBRTtnQkFDcEMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDOUI7aUJBQU0sSUFBSSxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSSxDQUFDLFFBQVEsRUFBRTtnQkFDdkMsS0FBSSxDQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQ25DO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsc0JBQUkseUNBQVE7YUFBWjtZQUNJLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztZQUN4QyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNaLE9BQU8sU0FBUyxDQUFDO2FBQ3BCO1lBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFELENBQUM7OztPQUFBO0lBRUQsd0NBQVUsR0FBVixVQUFXLFNBQVM7UUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCwyQ0FBYSxHQUFiO1FBQ0ksT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELHNDQUFRLEdBQVI7UUFDSSxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUM7UUFFeEMsSUFBSSxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQzdCLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUMxRDtJQUNMLENBQUM7O2dCQXBESixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGdCQUFnQjtpQkFDN0I7Ozs7Z0RBUVEsUUFBUSxZQUFJLE1BQU0sU0FBQyxhQUFhO2dEQUNoQyxRQUFRLFlBQUksTUFBTSxTQUFDLGNBQWM7Z0RBQ2pDLElBQUksWUFBSSxNQUFNLFNBQUMsU0FBUztnQkFsQnhCLFdBQVc7Z0RBb0JYLFNBQVMsU0FBQyxNQUFNO2dEQUNoQixTQUFTLFNBQUMsS0FBSzs7SUFzQ3hCLDBCQUFDO0NBQUEsQUFyREQsSUFxREM7U0FsRFksbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXR0cmlidXRlLCBEaXJlY3RpdmUsIEluamVjdCwgT25Jbml0LCBTZWxmLCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRm9ybUJ1aWxkZXIsIEZvcm1Hcm91cCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgRm9ybUNvbXBvbmVudCB9IGZyb20gJy4vZm9ybS5jb21wb25lbnQnO1xuaW1wb3J0IHsgV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IFRhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vdGFibGUvdGFibGUuY29tcG9uZW50JztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21Gb3JtV2lkZ2V0XSdcbn0pXG5leHBvcnQgY2xhc3MgRm9ybVdpZGdldERpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCB7XG5cbiAgICBuZ2Zvcm06IEZvcm1Hcm91cDtcbiAgICBmYjtcbiAgICBwYXJlbnQ7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChGb3JtQ29tcG9uZW50KSBmb3JtLFxuICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFRhYmxlQ29tcG9uZW50KSB0YWJsZSxcbiAgICAgICAgQFNlbGYoKSBASW5qZWN0KFdpZGdldFJlZikgcHVibGljIGNvbXBvbmVudEluc3RhbmNlLFxuICAgICAgICBmYjogRm9ybUJ1aWxkZXIsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ25hbWUnKSBwdWJsaWMgbmFtZSxcbiAgICAgICAgQEF0dHJpYnV0ZSgna2V5JykgcHVibGljIGtleSkge1xuICAgICAgICB0aGlzLmZiID0gZmI7XG4gICAgICAgIHRoaXMucGFyZW50ID0gZm9ybSB8fCB0YWJsZTtcbiAgICAgICAgdGhpcy5uZ2Zvcm0gPSB0aGlzLnBhcmVudC5uZ2Zvcm07XG5cbiAgICAgICAgdGhpcy5jb21wb25lbnRJbnN0YW5jZS5yZWdpc3RlclByb3BlcnR5Q2hhbmdlTGlzdGVuZXIoKGssIG52KSA9PiB7XG4gICAgICAgICAgICBpZiAoayA9PT0gJ2RhdGF2YWx1ZScgJiYgdGhpcy5fY29udHJvbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvbnRyb2wuc2V0VmFsdWUobnYpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChrID09PSAnbmFtZScgJiYgIXRoaXMuX2NvbnRyb2wpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZENvbnRyb2wodGhpcy5rZXkgfHwgbnYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgX2NvbnRyb2woKSB7XG4gICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IHRoaXMua2V5IHx8IHRoaXMubmFtZTtcbiAgICAgICAgaWYgKCFmaWVsZE5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMubmdmb3JtICYmIHRoaXMubmdmb3JtLmNvbnRyb2xzW2ZpZWxkTmFtZV07XG4gICAgfVxuXG4gICAgYWRkQ29udHJvbChmaWVsZE5hbWUpIHtcbiAgICAgICAgdGhpcy5uZ2Zvcm0uYWRkQ29udHJvbChmaWVsZE5hbWUsIHRoaXMuY3JlYXRlQ29udHJvbCgpKTtcbiAgICB9XG5cbiAgICBjcmVhdGVDb250cm9sKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mYi5jb250cm9sKHRoaXMuY29tcG9uZW50SW5zdGFuY2UuZGF0YXZhbHVlKTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgY29uc3QgZmllbGROYW1lID0gdGhpcy5rZXkgfHwgdGhpcy5uYW1lO1xuXG4gICAgICAgIGlmIChmaWVsZE5hbWUgJiYgIXRoaXMuX2NvbnRyb2wpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29udHJvbChmaWVsZE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQucmVnaXN0ZXJGb3JtV2lkZ2V0KHRoaXMuY29tcG9uZW50SW5zdGFuY2UpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19