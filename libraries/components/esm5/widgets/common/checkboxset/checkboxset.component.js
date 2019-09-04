import * as tslib_1 from "tslib";
import { Attribute, Component, Injector } from '@angular/core';
import { AppDefaults, noop, switchClass } from '@wm/core';
import { styler } from '../../framework/styler';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from '../checkboxset/checkboxset.props';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { convertDataToObject, groupData, handleHeaderClick, toggleAllHeaders } from '../../../utils/form-utils';
var DEFAULT_CLS = 'app-checkboxset list-group';
var WIDGET_CONFIG = { widgetType: 'wm-checkboxset', hostClass: DEFAULT_CLS };
var CheckboxsetComponent = /** @class */ (function (_super) {
    tslib_1.__extends(CheckboxsetComponent, _super);
    function CheckboxsetComponent(inj, groupby, appDefaults, datePipe) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.groupby = groupby;
        _this.appDefaults = appDefaults;
        _this.datePipe = datePipe;
        _this.layout = '';
        styler(_this.nativeElement, _this);
        _this.multiple = true;
        _this.handleHeaderClick = noop;
        return _this;
    }
    CheckboxsetComponent.prototype.onCheckboxLabelClick = function ($event, key) {
        if (!$($event.target).is('input')) {
            return;
        }
        // construct the _model from the checked elements.
        var inputElements = this.nativeElement.querySelectorAll('input:checked');
        var keys = [];
        _.forEach(inputElements, function ($el) {
            keys.push($el.value);
        });
        this.modelByKey = keys;
        this.invokeOnTouched();
        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
    };
    // change and blur events are added from the template
    CheckboxsetComponent.prototype.handleEvent = function (node, eventName, callback, locals) {
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
    CheckboxsetComponent.prototype.getGroupedData = function () {
        return this.datasetItems.length ? groupData(this, convertDataToObject(this.datasetItems), this.groupby, this.match, this.orderby, this.dateformat, this.datePipe, 'dataObject', this.appDefaults) : [];
    };
    CheckboxsetComponent.prototype.datasetSubscription = function () {
        var _this = this;
        var datasetSubscription = this.dataset$.subscribe(function () {
            _this.groupedData = _this.getGroupedData();
        });
        this.registerDestroyListener(function () { return datasetSubscription.unsubscribe(); });
    };
    CheckboxsetComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        if (key === 'layout') {
            switchClass(this.nativeElement, nv, ov);
        }
        else if (key === 'groupby' || key === 'match') {
            this.datasetSubscription();
            // If groupby is set, get the groupedData from the datasetItems.
            this.groupedData = this.getGroupedData();
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    CheckboxsetComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        if (this.groupby) {
            this.datasetSubscription();
            // If groupby is set, get the groupedData from the datasetItems.
            this.groupedData = this.getGroupedData();
        }
        // adding the handler for header click and toggle headers.
        if (this.groupby && this.collapsible) {
            this.handleHeaderClick = handleHeaderClick;
            this.toggleAllHeaders = toggleAllHeaders.bind(undefined, this);
        }
    };
    CheckboxsetComponent.initializeProps = registerProps();
    CheckboxsetComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmCheckboxset]',
                    exportAs: 'wmCheckboxset',
                    template: "<ng-template [ngIf]=\"!groupby\" [ngIfElse]=\"groupedListTemplate\">\n    <li [ngClass]=\"['checkbox', 'app-checkbox', itemclass]\"\n        [class.active]=\"item.selected\"\n        *ngFor=\"let item of datasetItems; let i = index\"\n        (click)=\"onCheckboxLabelClick($event, item.key)\">\n        <label class=\"app-checkboxset-label\" [ngClass]=\"{'disabled':disabled || readonly}\" [title]=\"item.label\">\n            <input [name]=\"'checkboxset_' + widgetId\" type=\"checkbox\" aria-label=\"checkbox group\"\n                   [tabindex]=\"tabindex\"\n                   [disabled]=\"disabled || readonly\" [attr.data-attr-index]=\"i\"\n                   [value]=\"item.key\" [tabindex]=\"tabindex\" [checked]=\"item.selected\"/>\n            <span class=\"caption\" [textContent]=\"item.label\"></span>\n        </label>\n    </li>\n</ng-template>\n<input [disabled]=\"disabled || readonly\" hidden class=\"model-holder\">\n<div *ngIf=\"readonly || disabled\" class=\"readonly-wrapper\"></div>\n\n<!-- This template will be displayed when groupby is specified. -->\n<ng-template #groupedListTemplate>\n    <li *ngFor=\"let groupObj of groupedData\" class=\"app-list-item-group\">\n        <ul class=\"item-group\">\n            <li class=\"list-group-header\" (click)=\"handleHeaderClick($event)\" [title]=\"groupObj.key\" [ngClass]=\"{'collapsible-content': collapsible}\">\n                <h4 class=\"group-title\">{{groupObj.key}}\n                    <div class=\"header-action\">\n                        <i class=\"app-icon wi action wi-chevron-up\" *ngIf=\"collapsible\" title=\"{{appLocale.LABEL_COLLAPSE}}/{{appLocale.LABEL_EXPAND}}\"></i>\n                        <span *ngIf=\"showcount\" class=\"label label-default\" [textContent]=\"groupObj.data.length\"></span>\n                    </div>\n                </h4>\n            </li>\n            <li *ngFor=\"let item of groupObj.data; let i = index;\"\n                [ngClass]=\"['checkbox', 'app-checkbox', 'group-list-item', itemclass]\"\n                [class.active]=\"item.selected\"\n                (click)=\"onCheckboxLabelClick($event, item)\">\n                <label class=\"app-checkboxset-label\" [ngClass]=\"{'disabled':disabled || readonly}\" [title]=\"item.label\">\n                    <input [name]=\"'checkboxset_' + widgetId\" type=\"checkbox\" aria-label=\"checkbox group\"\n                           [tabindex]=\"tabindex\"\n                           [disabled]=\"disabled || readonly\" [attr.data-attr-index]=\"i\"\n                           [value]=\"item.key\" [tabindex]=\"tabindex\" [checked]=\"item.selected\"/>\n                    <span class=\"caption\" [textContent]=\"item.label\"></span>\n                </label>\n            </li>\n        </ul>\n    </li>\n</ng-template>",
                    providers: [
                        provideAsNgValueAccessor(CheckboxsetComponent),
                        provideAsWidgetRef(CheckboxsetComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    CheckboxsetComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: String, decorators: [{ type: Attribute, args: ['groupby',] }] },
        { type: AppDefaults },
        { type: ToDatePipe }
    ]; };
    return CheckboxsetComponent;
}(DatasetAwareFormComponent));
export { CheckboxsetComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3hzZXQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jaGVja2JveHNldC9jaGVja2JveHNldC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUV2RSxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFMUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWhELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMzRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDakUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDakYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBSWhILElBQU0sV0FBVyxHQUFHLDRCQUE0QixDQUFDO0FBQ2pELElBQU0sYUFBYSxHQUFrQixFQUFDLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFFNUY7SUFVMEMsZ0RBQXlCO0lBZS9ELDhCQUNJLEdBQWEsRUFDZ0IsT0FBZSxFQUNwQyxXQUF3QixFQUN6QixRQUFvQjtRQUovQixZQU1JLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FJNUI7UUFSZ0MsYUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNwQyxpQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN6QixjQUFRLEdBQVIsUUFBUSxD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QyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDM0M7aUJBQ0o7Ozs7Z0JBekI4QixRQUFROzZDQTRDOUIsU0FBUyxTQUFDLFNBQVM7Z0JBMUNuQixXQUFXO2dCQUlYLFVBQVU7O0lBK0huQiwyQkFBQztDQUFBLEFBcEhELENBVTBDLHlCQUF5QixHQTBHbEU7U0ExR1ksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXR0cmlidXRlLCBDb21wb25lbnQsIEluamVjdG9yLCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQXBwRGVmYXVsdHMsIG5vb3AsIHN3aXRjaENsYXNzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgVG9EYXRlUGlwZSB9IGZyb20gJy4uLy4uLy4uL3BpcGVzL2N1c3RvbS1waXBlcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi4vY2hlY2tib3hzZXQvY2hlY2tib3hzZXQucHJvcHMnO1xuaW1wb3J0IHsgRGF0YXNldEF3YXJlRm9ybUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2UvZGF0YXNldC1hd2FyZS1mb3JtLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBjb252ZXJ0RGF0YVRvT2JqZWN0LCBncm91cERhdGEsIGhhbmRsZUhlYWRlckNsaWNrLCB0b2dnbGVBbGxIZWFkZXJzIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZm9ybS11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXywgJDtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWNoZWNrYm94c2V0IGxpc3QtZ3JvdXAnO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHt3aWRnZXRUeXBlOiAnd20tY2hlY2tib3hzZXQnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21DaGVja2JveHNldF0nLFxuICAgIGV4cG9ydEFzOiAnd21DaGVja2JveHNldCcsXG4gICAgdGVtcGxhdGVVcmw6ICdjaGVja2JveHNldC5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihDaGVja2JveHNldENvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihDaGVja2JveHNldENvbXBvbmVudClcbiAgICBdXG59KVxuXG5leHBvcnQgY2xhc3MgQ2hlY2tib3hzZXRDb21wb25lbnQgZXh0ZW5kcyBEYXRhc2V0QXdhcmVGb3JtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIGxheW91dCA9ICcnO1xuICAgIHB1YmxpYyBjb2xsYXBzaWJsZTogYm9vbGVhbjtcblxuICAgIHByb3RlY3RlZCBtYXRjaDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBkYXRlZm9ybWF0OiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGdyb3VwZWREYXRhOiBhbnlbXTtcblxuICAgIHB1YmxpYyBoYW5kbGVIZWFkZXJDbGljazogKCRldmVudCkgPT4gdm9pZDtcbiAgICBwcml2YXRlIHRvZ2dsZUFsbEhlYWRlcnM6IHZvaWQ7XG5cbiAgICBwdWJsaWMgZGlzYWJsZWQ6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgQEF0dHJpYnV0ZSgnZ3JvdXBieScpIHB1YmxpYyBncm91cGJ5OiBzdHJpbmcsXG4gICAgICAgIHByaXZhdGUgYXBwRGVmYXVsdHM6IEFwcERlZmF1bHRzLFxuICAgICAgICBwdWJsaWMgZGF0ZVBpcGU6IFRvRGF0ZVBpcGVcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgICAgIHRoaXMubXVsdGlwbGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmhhbmRsZUhlYWRlckNsaWNrID0gbm9vcDtcbiAgICB9XG5cbiAgICBvbkNoZWNrYm94TGFiZWxDbGljaygkZXZlbnQsIGtleSkge1xuICAgICAgICBpZiAoISQoJGV2ZW50LnRhcmdldCkuaXMoJ2lucHV0JykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbnN0cnVjdCB0aGUgX21vZGVsIGZyb20gdGhlIGNoZWNrZWQgZWxlbWVudHMuXG4gICAgICAgIGNvbnN0IGlucHV0RWxlbWVudHMgPSB0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXQ6Y2hlY2tlZCcpO1xuICAgICAgICBjb25zdCBrZXlzID0gW107XG4gICAgICAgIF8uZm9yRWFjaChpbnB1dEVsZW1lbnRzLCAoJGVsKSA9PiB7XG4gICAgICAgICAgICBrZXlzLnB1c2goJGVsLnZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5tb2RlbEJ5S2V5ID0ga2V5cztcblxuICAgICAgICB0aGlzLmludm9rZU9uVG91Y2hlZCgpO1xuICAgICAgICAvLyBpbnZva2Ugb24gZGF0YXZhbHVlIGNoYW5nZS5cbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgJGV2ZW50IHx8IHt9LCB0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBjaGFuZ2UgYW5kIGJsdXIgZXZlbnRzIGFyZSBhZGRlZCBmcm9tIHRoZSB0ZW1wbGF0ZVxuICAgIHByb3RlY3RlZCBoYW5kbGVFdmVudChub2RlOiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbiwgbG9jYWxzOiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50TmFtZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgIGV2ZW50TmFtZSxcbiAgICAgICAgICAgICAgICBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkKGUudGFyZ2V0KS5pcygnaW5wdXQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxvY2Fscy4kZXZlbnQgPSBlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKCFfLmluY2x1ZGVzKFsnY2hhbmdlJ10sIGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgIHN1cGVyLmhhbmRsZUV2ZW50KG5vZGUsIGV2ZW50TmFtZSwgY2FsbGJhY2ssIGxvY2Fscyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEdyb3VwZWREYXRhKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhc2V0SXRlbXMubGVuZ3RoID8gZ3JvdXBEYXRhKHRoaXMsIGNvbnZlcnREYXRhVG9PYmplY3QodGhpcy5kYXRhc2V0SXRlbXMpLCB0aGlzLmdyb3VwYnksIHRoaXMubWF0Y2gsIHRoaXMub3JkZXJieSwgdGhpcy5kYXRlZm9ybWF0LCB0aGlzLmRhdGVQaXBlLCAnZGF0YU9iamVjdCcsIHRoaXMuYXBwRGVmYXVsdHMpIDogW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkYXRhc2V0U3Vic2NyaXB0aW9uKCkge1xuICAgICAgICBjb25zdCBkYXRhc2V0U3Vic2NyaXB0aW9uID0gdGhpcy5kYXRhc2V0JC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5ncm91cGVkRGF0YSA9IHRoaXMuZ2V0R3JvdXBlZERhdGEoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoKCkgPT4gZGF0YXNldFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92Pykge1xuXG4gICAgICAgIGlmIChrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChrZXkgPT09ICdsYXlvdXQnKSB7XG4gICAgICAgICAgICBzd2l0Y2hDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsIG52LCBvdik7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZ3JvdXBieScgfHwga2V5ID09PSAnbWF0Y2gnKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFzZXRTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgICAgIC8vIElmIGdyb3VwYnkgaXMgc2V0LCBnZXQgdGhlIGdyb3VwZWREYXRhIGZyb20gdGhlIGRhdGFzZXRJdGVtcy5cbiAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLmdldEdyb3VwZWREYXRhKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBzdXBlci5uZ09uSW5pdCgpO1xuICAgICAgICBpZiAodGhpcy5ncm91cGJ5KSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFzZXRTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgICAgIC8vIElmIGdyb3VwYnkgaXMgc2V0LCBnZXQgdGhlIGdyb3VwZWREYXRhIGZyb20gdGhlIGRhdGFzZXRJdGVtcy5cbiAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLmdldEdyb3VwZWREYXRhKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYWRkaW5nIHRoZSBoYW5kbGVyIGZvciBoZWFkZXIgY2xpY2sgYW5kIHRvZ2dsZSBoZWFkZXJzLlxuICAgICAgICBpZiAodGhpcy5ncm91cGJ5ICYmIHRoaXMuY29sbGFwc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlSGVhZGVyQ2xpY2sgPSBoYW5kbGVIZWFkZXJDbGljaztcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlQWxsSGVhZGVycyA9IHRvZ2dsZUFsbEhlYWRlcnMuYmluZCh1bmRlZmluZWQsIHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19