import * as tslib_1 from "tslib";
import { Component, Injector } from '@angular/core';
import { switchClass } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './radioset.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
var DEFAULT_CLS = 'app-radioset list-group';
var WIDGET_CONFIG = { widgetType: 'wm-radioset', hostClass: DEFAULT_CLS };
var RadiosetComponent = /** @class */ (function (_super) {
    tslib_1.__extends(RadiosetComponent, _super);
    function RadiosetComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.layout = '';
        styler(_this.nativeElement, _this);
        _this.multiple = false;
        return _this;
    }
    /**
     * On click of the option, update the datavalue
     */
    RadiosetComponent.prototype.onRadioLabelClick = function ($event, key) {
        if (!$($event.target).is('input')) {
            return;
        }
        this.modelByKey = key;
        this.invokeOnTouched();
        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
    };
    // change and blur events are added from the template
    RadiosetComponent.prototype.handleEvent = function (node, eventName, callback, locals) {
        if (eventName === 'click') {
            this.eventManager.addEventListener(node, eventName, function (e) {
                if (!$(e.target).is('input')) {
                    return;
                }
                locals.$event = e;
                return callback();
            });
        }
        else if (!_.includes(['change'], eventName)) {
            _super.prototype.handleEvent.call(this, node, eventName, callback, locals);
        }
    };
    RadiosetComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        if (key === 'layout') {
            switchClass(this.nativeElement, nv, ov);
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
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
    RadiosetComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return RadiosetComponent;
}(DatasetAwareFormComponent));
export { RadiosetComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFkaW9zZXQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9yYWRpb3NldC9yYWRpb3NldC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdkMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMzRixPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUlqRixJQUFNLFdBQVcsR0FBRyx5QkFBeUIsQ0FBQztBQUM5QyxJQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBRTFFO0lBU3VDLDZDQUF5QjtJQU01RCwyQkFBWSxHQUFhO1FBQXpCLFlBQ0ksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQUc1QjtRQVBNLFlBQU0sR0FBRyxFQUFFLENBQUM7UUFLZixNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLENBQUMsQ0FBQztRQUNqQyxLQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs7SUFDMUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsNkNBQWlCLEdBQWpCLFVBQWtCLE1BQU0sRUFBRSxHQUFHO1FBQ3pCLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMvQixPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztRQUV0QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkIsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCxxREFBcUQ7SUFDM0MsdUNBQVcsR0FBckIsVUFBc0IsSUFBaUIsRUFBRSxTQUFpQixFQUFFLFFBQWtCLEVBQUUsTUFBVztRQUN2RixJQUFJLFNBQVMsS0FBSyxPQUFPLEVBQUU7WUFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FDOUIsSUFBSSxFQUNKLFNBQVMsRUFDVCxVQUFBLENBQUM7Z0JBQ0csSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUMxQixPQUFPO2lCQUNWO2dCQUNELE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUNsQixPQUFPLFFBQVEsRUFBRSxDQUFDO1lBQ3RCLENBQUMsQ0FDSixDQUFDO1NBQ0w7YUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQzNDLGlCQUFNLFdBQVcsWUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUN4RDtJQUNMLENBQUM7SUFFRCw0Q0FBZ0IsR0FBaEIsVUFBaUIsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFHO1FBQ3pCLElBQUksR0FBRyxLQUFLLFVBQVUsRUFBRTtZQUNwQixPQUFPO1NBQ1Y7UUFFRCxJQUFJLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDbEIsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzNDO2FBQU07WUFDSCxpQkFBTSxnQkFBZ0IsWUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztJQXZETSxpQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFWNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxjQUFjO29CQUN4QixRQUFRLEVBQUUsWUFBWTtvQkFDdEIsbzJCQUF3QztvQkFDeEMsU0FBUyxFQUFFO3dCQUNQLHdCQUF3QixDQUFDLGlCQUFpQixDQUFDO3dCQUMzQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQztxQkFDeEM7aUJBQ0o7Ozs7Z0JBdEJtQixRQUFROztJQWdGNUIsd0JBQUM7Q0FBQSxBQWxFRCxDQVN1Qyx5QkFBeUIsR0F5RC9EO1NBekRZLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgc3dpdGNoQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vcmFkaW9zZXQucHJvcHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgRGF0YXNldEF3YXJlRm9ybUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2UvZGF0YXNldC1hd2FyZS1mb3JtLmNvbXBvbmVudCc7XG5cbmRlY2xhcmUgY29uc3QgJCwgXztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXJhZGlvc2V0IGxpc3QtZ3JvdXAnO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tcmFkaW9zZXQnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21SYWRpb3NldF0nLFxuICAgIGV4cG9ydEFzOiAnd21SYWRpb3NldCcsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3JhZGlvc2V0LmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKFJhZGlvc2V0Q29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFJhZGlvc2V0Q29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgUmFkaW9zZXRDb21wb25lbnQgZXh0ZW5kcyBEYXRhc2V0QXdhcmVGb3JtQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIGxheW91dCA9ICcnO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgICAgIHRoaXMubXVsdGlwbGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPbiBjbGljayBvZiB0aGUgb3B0aW9uLCB1cGRhdGUgdGhlIGRhdGF2YWx1ZVxuICAgICAqL1xuICAgIG9uUmFkaW9MYWJlbENsaWNrKCRldmVudCwga2V5KSB7XG4gICAgICAgIGlmICghJCgkZXZlbnQudGFyZ2V0KS5pcygnaW5wdXQnKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tb2RlbEJ5S2V5ID0ga2V5O1xuXG4gICAgICAgIHRoaXMuaW52b2tlT25Ub3VjaGVkKCk7XG4gICAgICAgIC8vIGludm9rZSBvbiBkYXRhdmFsdWUgY2hhbmdlLlxuICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCAkZXZlbnQgfHwge30sIHRydWUpO1xuICAgIH1cblxuICAgIC8vIGNoYW5nZSBhbmQgYmx1ciBldmVudHMgYXJlIGFkZGVkIGZyb20gdGhlIHRlbXBsYXRlXG4gICAgcHJvdGVjdGVkIGhhbmRsZUV2ZW50KG5vZGU6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uLCBsb2NhbHM6IGFueSkge1xuICAgICAgICBpZiAoZXZlbnROYW1lID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50TWFuYWdlci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgZXZlbnROYW1lLFxuICAgICAgICAgICAgICAgIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoISQoZS50YXJnZXQpLmlzKCdpbnB1dCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbG9jYWxzLiRldmVudCA9IGU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoIV8uaW5jbHVkZXMoWydjaGFuZ2UnXSwgZXZlbnROYW1lKSkge1xuICAgICAgICAgICAgc3VwZXIuaGFuZGxlRXZlbnQobm9kZSwgZXZlbnROYW1lLCBjYWxsYmFjaywgbG9jYWxzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3Y/KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChrZXkgPT09ICdsYXlvdXQnKSB7XG4gICAgICAgICAgICBzd2l0Y2hDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsIG52LCBvdik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==