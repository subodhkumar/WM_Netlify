import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { DataSource, removeAttr, setAttr } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './select.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
const WIDGET_CONFIG = { widgetType: 'wm-select', hostClass: 'app-select-wrapper' };
export class SelectComponent extends DatasetAwareFormComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        this.acceptsArray = true;
    }
    set datasource(ds) {
        if (ds && ds.execute && ds.execute(DataSource.Operation.IS_BOUND_TO_LOCALE)) {
            this.datavalue = ds.execute(DataSource.Operation.GET_DEFAULT_LOCALE);
        }
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.selectEl.nativeElement, this);
    }
    // Change event is registered from the template, Prevent the framework from registering one more event
    handleEvent(node, eventName, eventCallback, locals) {
        if (!_.includes(['blur', 'change'], eventName)) {
            super.handleEvent(this.selectEl.nativeElement, eventName, eventCallback, locals);
        }
    }
    onSelectValueChange($event) {
        if (this.readonly) {
            if (this.placeholder) {
                this.selectEl.nativeElement.value = this.placeholder;
            }
            else {
                this.selectEl.nativeElement.value = '';
            }
            this.datavalue = this.prevDatavalue;
            return;
        }
        this.invokeOnTouched();
        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'class' || key === 'tabindex') {
            return;
        }
        else if (key === 'readonly') {
            (nv === true) ? setAttr(this.selectEl.nativeElement, 'readonly', 'readonly') : removeAttr(this.selectEl.nativeElement, 'readonly');
        }
        super.onPropertyChange(key, nv, ov);
    }
}
SelectComponent.initializeProps = registerProps();
SelectComponent.decorators = [
    { type: Component, args: [{
                selector: 'wm-select',
                template: "<select role=\"input\" aria-haspopup=\"true\" aria-expanded=\"false\" #select\n        focus-target\n        [ngClass]=\"['app-select form-control', class]\"\n        [disabled]=\"disabled\"\n        [required]=\"required\"\n        [tabindex]=\"tabindex\"\n        [(ngModel)]=\"modelByKey\"\n        [multiple]=\"multiple\"\n        (change)=\"onSelectValueChange($event)\"\n        (blur)=\"invokeOnTouched($event)\"\n        [attr.name]=\"name\"\n        [autofocus]=\"autofocus\"\n>\n  <option selected value=\"undefined\" [textContent]=\"placeholder\" [hidden]=\"!placeholder\" ></option>\n  <option\n          *ngFor=\"let item of datasetItems\"\n          [value]=\"item.key\" [selected]=\"item.selected\" [textContent]=\"item.label\"></option>\n</select>\n",
                providers: [
                    provideAsNgValueAccessor(SelectComponent),
                    provideAsWidgetRef(SelectComponent)
                ]
            }] }
];
/** @nocollapse */
SelectComponent.ctorParameters = () => [
    { type: Injector }
];
SelectComponent.propDecorators = {
    selectEl: [{ type: ViewChild, args: ['select', { read: ElementRef },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vc2VsZWN0L3NlbGVjdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFMUYsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTNELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0MsT0FBTyxFQUFFLHdCQUF3QixFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM0YsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFJakYsTUFBTSxhQUFhLEdBQUcsRUFBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsRUFBQyxDQUFDO0FBVWpGLE1BQU0sT0FBTyxlQUFnQixTQUFRLHlCQUF5QjtJQXFCMUQsWUFBWSxHQUFhO1FBQ3JCLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQVRELElBQUksVUFBVSxDQUFDLEVBQUU7UUFDYixJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1lBQ3pFLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDeEU7SUFDTCxDQUFDO0lBT0QsZUFBZTtRQUNYLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUE0QixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxzR0FBc0c7SUFDNUYsV0FBVyxDQUFDLElBQWlCLEVBQUUsU0FBaUIsRUFBRSxhQUF1QixFQUFFLE1BQVc7UUFDNUYsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDNUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3BGO0lBQ0wsQ0FBQztJQUVELG1CQUFtQixDQUFDLE1BQU07UUFDdEIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2YsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzthQUN4RDtpQkFBTTtnQkFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2FBQzFDO1lBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBSSxJQUFZLENBQUMsYUFBYSxDQUFDO1lBQzdDLE9BQU87U0FDVjtRQUNELElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN2Qiw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVELGdCQUFnQixDQUFDLEdBQVcsRUFBRSxFQUFPLEVBQUUsRUFBUTtRQUMzQyxJQUFJLEdBQUcsS0FBSyxPQUFPLElBQUssR0FBRyxLQUFLLFVBQVUsRUFBRTtZQUN4QyxPQUFPO1NBQ1Y7YUFBTSxJQUFJLEdBQUcsS0FBSyxVQUFVLEVBQUU7WUFDMUIsQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBRTtTQUN4STtRQUNELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7O0FBM0RNLCtCQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBVDVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsV0FBVztnQkFDckIseXdCQUFzQztnQkFDdEMsU0FBUyxFQUFFO29CQUNQLHdCQUF3QixDQUFDLGVBQWUsQ0FBQztvQkFDekMsa0JBQWtCLENBQUMsZUFBZSxDQUFDO2lCQUN0QzthQUNKOzs7O1lBcEI4QyxRQUFROzs7dUJBa0NsRCxTQUFTLFNBQUMsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5qZWN0b3IsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBEYXRhU291cmNlLCByZW1vdmVBdHRyLCBzZXRBdHRyIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3NlbGVjdC5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBEYXRhc2V0QXdhcmVGb3JtQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9kYXRhc2V0LWF3YXJlLWZvcm0uY29tcG9uZW50JztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1zZWxlY3QnLCBob3N0Q2xhc3M6ICdhcHAtc2VsZWN0LXdyYXBwZXInfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd3bS1zZWxlY3QnLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9zZWxlY3QuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IoU2VsZWN0Q29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFNlbGVjdENvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFNlbGVjdENvbXBvbmVudCBleHRlbmRzIERhdGFzZXRBd2FyZUZvcm1Db21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIHJlYWRvbmx5OiBib29sZWFuO1xuICAgIHB1YmxpYyBwbGFjZWhvbGRlcjogc3RyaW5nO1xuICAgIHB1YmxpYyBuYXZzZWFyY2hiYXI6IGFueTtcbiAgICBwdWJsaWMgY2xhc3M6IGFueTtcbiAgICBwdWJsaWMgcmVxdWlyZWQ6IGJvb2xlYW47XG4gICAgcHVibGljIGRpc2FibGVkOiBib29sZWFuO1xuICAgIHB1YmxpYyB0YWJpbmRleDogYW55O1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gICAgcHVibGljIGF1dG9mb2N1czogYm9vbGVhbjtcblxuICAgIEBWaWV3Q2hpbGQoJ3NlbGVjdCcsIHtyZWFkOiBFbGVtZW50UmVmfSkgc2VsZWN0RWw6IEVsZW1lbnRSZWY7XG5cbiAgICBzZXQgZGF0YXNvdXJjZShkcykge1xuICAgICAgICBpZiAoZHMgJiYgZHMuZXhlY3V0ZSAmJiBkcy5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0JPVU5EX1RPX0xPQ0FMRSkpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YXZhbHVlID0gZHMuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfREVGQVVMVF9MT0NBTEUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICB0aGlzLmFjY2VwdHNBcnJheSA9IHRydWU7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgc3R5bGVyKHRoaXMuc2VsZWN0RWwubmF0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIGV2ZW50IGlzIHJlZ2lzdGVyZWQgZnJvbSB0aGUgdGVtcGxhdGUsIFByZXZlbnQgdGhlIGZyYW1ld29yayBmcm9tIHJlZ2lzdGVyaW5nIG9uZSBtb3JlIGV2ZW50XG4gICAgcHJvdGVjdGVkIGhhbmRsZUV2ZW50KG5vZGU6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgZXZlbnRDYWxsYmFjazogRnVuY3Rpb24sIGxvY2FsczogYW55KSB7XG4gICAgICAgIGlmICghXy5pbmNsdWRlcyhbJ2JsdXInLCAnY2hhbmdlJ10sIGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgIHN1cGVyLmhhbmRsZUV2ZW50KHRoaXMuc2VsZWN0RWwubmF0aXZlRWxlbWVudCwgZXZlbnROYW1lLCBldmVudENhbGxiYWNrLCBsb2NhbHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25TZWxlY3RWYWx1ZUNoYW5nZSgkZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RFbC5uYXRpdmVFbGVtZW50LnZhbHVlID0gdGhpcy5wbGFjZWhvbGRlcjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RFbC5uYXRpdmVFbGVtZW50LnZhbHVlID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGF2YWx1ZSA9ICh0aGlzIGFzIGFueSkucHJldkRhdGF2YWx1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmludm9rZU9uVG91Y2hlZCgpO1xuICAgICAgICAvLyBpbnZva2Ugb24gZGF0YXZhbHVlIGNoYW5nZS5cbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgJGV2ZW50IHx8IHt9LCB0cnVlKTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnY2xhc3MnIHx8ICBrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdyZWFkb25seScpIHtcbiAgICAgICAgICAgICAobnYgPT09IHRydWUpID8gc2V0QXR0cih0aGlzLnNlbGVjdEVsLm5hdGl2ZUVsZW1lbnQsICdyZWFkb25seScsICdyZWFkb25seScpIDogcmVtb3ZlQXR0cih0aGlzLnNlbGVjdEVsLm5hdGl2ZUVsZW1lbnQsICdyZWFkb25seScpIDtcbiAgICAgICAgfVxuICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICB9XG59XG4iXX0=