import { Component, Injector } from '@angular/core';
import { switchClass } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './radioset.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
const DEFAULT_CLS = 'app-radioset list-group';
const WIDGET_CONFIG = { widgetType: 'wm-radioset', hostClass: DEFAULT_CLS };
export class RadiosetComponent extends DatasetAwareFormComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        this.layout = '';
        styler(this.nativeElement, this);
        this.multiple = false;
    }
    /**
     * On click of the option, update the datavalue
     */
    onRadioLabelClick($event, key) {
        if (!$($event.target).is('input')) {
            return;
        }
        this.modelByKey = key;
        this.invokeOnTouched();
        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
    }
    // change and blur events are added from the template
    handleEvent(node, eventName, callback, locals) {
        if (eventName === 'click') {
            this.eventManager.addEventListener(node, eventName, e => {
                if (!$(e.target).is('input')) {
                    return;
                }
                locals.$event = e;
                return callback();
            });
        }
        else if (!_.includes(['change'], eventName)) {
            super.handleEvent(node, eventName, callback, locals);
        }
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        if (key === 'layout') {
            switchClass(this.nativeElement, nv, ov);
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
RadiosetComponent.initializeProps = registerProps();
RadiosetComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmRadioset]',
                exportAs: 'wmRadioset',
                template: "<li [ngClass]=\"['radio', 'app-radio', itemclass]\"\n    [class.active]=\"item.selected\"\n    *ngFor=\"let item of datasetItems;let i = index\"\n    (click)=\"onRadioLabelClick($event, item.key)\">\n    <label class=\"app-radioset-label\"\n           [ngClass]=\"{'disabled':disabled || readonly}\"\n           [title]=\"item.label\">\n        <input [name]=\"'radioset_' + widgetId\" type=\"radio\" [attr.aria-checked]=\"item.selected\" [attr.data-attr-index]=\"i\"\n               [value]=\"item.key\" [disabled]=\"disabled || readonly\" [tabindex]=\"tabindex\" [checked]=\"item.selected\"/>\n        <span class=\"caption\" [textContent]=\"item.label\"></span>\n    </label>\n</li>\n\n<input [disabled]=\"disabled || readonly\" hidden class=\"model-holder\">\n<div *ngIf=\"readonly || disabled\" aria-readonly=\"true\" class=\"readonly-wrapper\"></div>",
                providers: [
                    provideAsNgValueAccessor(RadiosetComponent),
                    provideAsWidgetRef(RadiosetComponent)
                ]
            }] }
];
/** @nocollapse */
RadiosetComponent.ctorParameters = () => [
    { type: Injector }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFkaW9zZXQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9yYWRpb3NldC9yYWRpb3NldC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFcEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV2QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzNGLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBSWpGLE1BQU0sV0FBVyxHQUFHLHlCQUF5QixDQUFDO0FBQzlDLE1BQU0sYUFBYSxHQUFHLEVBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFXMUUsTUFBTSxPQUFPLGlCQUFrQixTQUFRLHlCQUF5QjtJQU01RCxZQUFZLEdBQWE7UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUp2QixXQUFNLEdBQUcsRUFBRSxDQUFDO1FBS2YsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEdBQUc7UUFDekIsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQy9CLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO1FBRXRCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN2Qiw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVELHFEQUFxRDtJQUMzQyxXQUFXLENBQUMsSUFBaUIsRUFBRSxTQUFpQixFQUFFLFFBQWtCLEVBQUUsTUFBVztRQUN2RixJQUFJLFNBQVMsS0FBSyxPQUFPLEVBQUU7WUFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FDOUIsSUFBSSxFQUNKLFNBQVMsRUFDVCxDQUFDLENBQUMsRUFBRTtnQkFDQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQzFCLE9BQU87aUJBQ1Y7Z0JBQ0QsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQ2xCLE9BQU8sUUFBUSxFQUFFLENBQUM7WUFDdEIsQ0FBQyxDQUNKLENBQUM7U0FDTDthQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDM0MsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUN4RDtJQUNMLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUc7UUFDekIsSUFBSSxHQUFHLEtBQUssVUFBVSxFQUFFO1lBQ3BCLE9BQU87U0FDVjtRQUVELElBQUksR0FBRyxLQUFLLFFBQVEsRUFBRTtZQUNsQixXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDM0M7YUFBTTtZQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQzs7QUF2RE0saUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFWNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxjQUFjO2dCQUN4QixRQUFRLEVBQUUsWUFBWTtnQkFDdEIsbzJCQUF3QztnQkFDeEMsU0FBUyxFQUFFO29CQUNQLHdCQUF3QixDQUFDLGlCQUFpQixDQUFDO29CQUMzQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQztpQkFDeEM7YUFDSjs7OztZQXRCbUIsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgc3dpdGNoQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vcmFkaW9zZXQucHJvcHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgRGF0YXNldEF3YXJlRm9ybUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2UvZGF0YXNldC1hd2FyZS1mb3JtLmNvbXBvbmVudCc7XG5cbmRlY2xhcmUgY29uc3QgJCwgXztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXJhZGlvc2V0IGxpc3QtZ3JvdXAnO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tcmFkaW9zZXQnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21SYWRpb3NldF0nLFxuICAgIGV4cG9ydEFzOiAnd21SYWRpb3NldCcsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3JhZGlvc2V0LmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKFJhZGlvc2V0Q29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFJhZGlvc2V0Q29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgUmFkaW9zZXRDb21wb25lbnQgZXh0ZW5kcyBEYXRhc2V0QXdhcmVGb3JtQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIGxheW91dCA9ICcnO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgICAgIHRoaXMubXVsdGlwbGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPbiBjbGljayBvZiB0aGUgb3B0aW9uLCB1cGRhdGUgdGhlIGRhdGF2YWx1ZVxuICAgICAqL1xuICAgIG9uUmFkaW9MYWJlbENsaWNrKCRldmVudCwga2V5KSB7XG4gICAgICAgIGlmICghJCgkZXZlbnQudGFyZ2V0KS5pcygnaW5wdXQnKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tb2RlbEJ5S2V5ID0ga2V5O1xuXG4gICAgICAgIHRoaXMuaW52b2tlT25Ub3VjaGVkKCk7XG4gICAgICAgIC8vIGludm9rZSBvbiBkYXRhdmFsdWUgY2hhbmdlLlxuICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCAkZXZlbnQgfHwge30sIHRydWUpO1xuICAgIH1cblxuICAgIC8vIGNoYW5nZSBhbmQgYmx1ciBldmVudHMgYXJlIGFkZGVkIGZyb20gdGhlIHRlbXBsYXRlXG4gICAgcHJvdGVjdGVkIGhhbmRsZUV2ZW50KG5vZGU6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uLCBsb2NhbHM6IGFueSkge1xuICAgICAgICBpZiAoZXZlbnROYW1lID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50TWFuYWdlci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgZXZlbnROYW1lLFxuICAgICAgICAgICAgICAgIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoISQoZS50YXJnZXQpLmlzKCdpbnB1dCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbG9jYWxzLiRldmVudCA9IGU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoIV8uaW5jbHVkZXMoWydjaGFuZ2UnXSwgZXZlbnROYW1lKSkge1xuICAgICAgICAgICAgc3VwZXIuaGFuZGxlRXZlbnQobm9kZSwgZXZlbnROYW1lLCBjYWxsYmFjaywgbG9jYWxzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3Y/KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChrZXkgPT09ICdsYXlvdXQnKSB7XG4gICAgICAgICAgICBzd2l0Y2hDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsIG52LCBvdik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==