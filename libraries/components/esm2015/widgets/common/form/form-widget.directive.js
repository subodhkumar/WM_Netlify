import { Attribute, Directive, Inject, Self, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormComponent } from './form.component';
import { WidgetRef } from '../../framework/types';
import { TableComponent } from '../table/table.component';
export class FormWidgetDirective {
    constructor(form, table, componentInstance, fb, name, key) {
        this.componentInstance = componentInstance;
        this.name = name;
        this.key = key;
        this.fb = fb;
        this.parent = form || table;
        this.ngform = this.parent.ngform;
        this.componentInstance.registerPropertyChangeListener((k, nv) => {
            if (k === 'datavalue' && this._control) {
                this._control.setValue(nv);
            }
            else if (k === 'name' && !this._control) {
                this.addControl(this.key || nv);
            }
        });
    }
    get _control() {
        const fieldName = this.key || this.name;
        if (!fieldName) {
            return undefined;
        }
        return this.ngform && this.ngform.controls[fieldName];
    }
    addControl(fieldName) {
        this.ngform.addControl(fieldName, this.createControl());
    }
    createControl() {
        return this.fb.control(this.componentInstance.datavalue);
    }
    ngOnInit() {
        const fieldName = this.key || this.name;
        if (fieldName && !this._control) {
            this.addControl(fieldName);
            this.parent.registerFormWidget(this.componentInstance);
        }
    }
}
FormWidgetDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmFormWidget]'
            },] }
];
/** @nocollapse */
FormWidgetDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [FormComponent,] }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [TableComponent,] }] },
    { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] },
    { type: FormBuilder },
    { type: undefined, decorators: [{ type: Attribute, args: ['name',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['key',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS13aWRnZXQuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9mb3JtL2Zvcm0td2lkZ2V0LmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQVUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNyRixPQUFPLEVBQUUsV0FBVyxFQUFhLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFLMUQsTUFBTSxPQUFPLG1CQUFtQjtJQU01QixZQUN1QyxJQUFJLEVBQ0gsS0FBSyxFQUNQLGlCQUFpQixFQUNuRCxFQUFlLEVBQ1csSUFBSSxFQUNMLEdBQUc7UUFITSxzQkFBaUIsR0FBakIsaUJBQWlCLENBQUE7UUFFekIsU0FBSSxHQUFKLElBQUksQ0FBQTtRQUNMLFFBQUcsR0FBSCxHQUFHLENBQUE7UUFDNUIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksSUFBSSxLQUFLLENBQUM7UUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUVqQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUU7WUFDNUQsSUFBSSxDQUFDLEtBQUssV0FBVyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzlCO2lCQUFNLElBQUksQ0FBQyxLQUFLLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUNuQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELElBQUksUUFBUTtRQUNSLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztRQUN4QyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ1osT0FBTyxTQUFTLENBQUM7U0FDcEI7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELFVBQVUsQ0FBQyxTQUFTO1FBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsYUFBYTtRQUNULE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxRQUFRO1FBQ0osTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBRXhDLElBQUksU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUM3QixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDMUQ7SUFDTCxDQUFDOzs7WUFwREosU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxnQkFBZ0I7YUFDN0I7Ozs7NENBUVEsUUFBUSxZQUFJLE1BQU0sU0FBQyxhQUFhOzRDQUNoQyxRQUFRLFlBQUksTUFBTSxTQUFDLGNBQWM7NENBQ2pDLElBQUksWUFBSSxNQUFNLFNBQUMsU0FBUztZQWxCeEIsV0FBVzs0Q0FvQlgsU0FBUyxTQUFDLE1BQU07NENBQ2hCLFNBQVMsU0FBQyxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXR0cmlidXRlLCBEaXJlY3RpdmUsIEluamVjdCwgT25Jbml0LCBTZWxmLCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRm9ybUJ1aWxkZXIsIEZvcm1Hcm91cCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgRm9ybUNvbXBvbmVudCB9IGZyb20gJy4vZm9ybS5jb21wb25lbnQnO1xuaW1wb3J0IHsgV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IFRhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vdGFibGUvdGFibGUuY29tcG9uZW50JztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21Gb3JtV2lkZ2V0XSdcbn0pXG5leHBvcnQgY2xhc3MgRm9ybVdpZGdldERpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCB7XG5cbiAgICBuZ2Zvcm06IEZvcm1Hcm91cDtcbiAgICBmYjtcbiAgICBwYXJlbnQ7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChGb3JtQ29tcG9uZW50KSBmb3JtLFxuICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFRhYmxlQ29tcG9uZW50KSB0YWJsZSxcbiAgICAgICAgQFNlbGYoKSBASW5qZWN0KFdpZGdldFJlZikgcHVibGljIGNvbXBvbmVudEluc3RhbmNlLFxuICAgICAgICBmYjogRm9ybUJ1aWxkZXIsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ25hbWUnKSBwdWJsaWMgbmFtZSxcbiAgICAgICAgQEF0dHJpYnV0ZSgna2V5JykgcHVibGljIGtleSkge1xuICAgICAgICB0aGlzLmZiID0gZmI7XG4gICAgICAgIHRoaXMucGFyZW50ID0gZm9ybSB8fCB0YWJsZTtcbiAgICAgICAgdGhpcy5uZ2Zvcm0gPSB0aGlzLnBhcmVudC5uZ2Zvcm07XG5cbiAgICAgICAgdGhpcy5jb21wb25lbnRJbnN0YW5jZS5yZWdpc3RlclByb3BlcnR5Q2hhbmdlTGlzdGVuZXIoKGssIG52KSA9PiB7XG4gICAgICAgICAgICBpZiAoayA9PT0gJ2RhdGF2YWx1ZScgJiYgdGhpcy5fY29udHJvbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvbnRyb2wuc2V0VmFsdWUobnYpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChrID09PSAnbmFtZScgJiYgIXRoaXMuX2NvbnRyb2wpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZENvbnRyb2wodGhpcy5rZXkgfHwgbnYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgX2NvbnRyb2woKSB7XG4gICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IHRoaXMua2V5IHx8IHRoaXMubmFtZTtcbiAgICAgICAgaWYgKCFmaWVsZE5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMubmdmb3JtICYmIHRoaXMubmdmb3JtLmNvbnRyb2xzW2ZpZWxkTmFtZV07XG4gICAgfVxuXG4gICAgYWRkQ29udHJvbChmaWVsZE5hbWUpIHtcbiAgICAgICAgdGhpcy5uZ2Zvcm0uYWRkQ29udHJvbChmaWVsZE5hbWUsIHRoaXMuY3JlYXRlQ29udHJvbCgpKTtcbiAgICB9XG5cbiAgICBjcmVhdGVDb250cm9sKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mYi5jb250cm9sKHRoaXMuY29tcG9uZW50SW5zdGFuY2UuZGF0YXZhbHVlKTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgY29uc3QgZmllbGROYW1lID0gdGhpcy5rZXkgfHwgdGhpcy5uYW1lO1xuXG4gICAgICAgIGlmIChmaWVsZE5hbWUgJiYgIXRoaXMuX2NvbnRyb2wpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29udHJvbChmaWVsZE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQucmVnaXN0ZXJGb3JtV2lkZ2V0KHRoaXMuY29tcG9uZW50SW5zdGFuY2UpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19