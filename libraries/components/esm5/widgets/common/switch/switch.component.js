import * as tslib_1 from "tslib";
import { Component, Injector } from '@angular/core';
import { $appDigest, debounce, isDefined, setCSS, toBoolean } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './switch.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
var DEFAULT_CLS = 'app-switch';
var WIDGET_CONFIG = { widgetType: 'wm-switch', hostClass: DEFAULT_CLS };
var SwitchComponent = /** @class */ (function (_super) {
    tslib_1.__extends(SwitchComponent, _super);
    function SwitchComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.options = [];
        _this._debounceSetSelectedValue = debounce(function (val) {
            _this.setSelectedValue();
            _this.updateHighlighter(val);
            // only for default value trigger app digest to apply the selectedItem
            if (val) {
                $appDigest();
            }
        }, 200);
        var datasetSubscription = _this.dataset$.subscribe(function () { return _this.updateSwitchOptions(); });
        _this.registerDestroyListener(function () { return datasetSubscription.unsubscribe(); });
        var datavalueSubscription = _this.datavalue$.subscribe(function () {
            _this._debounceSetSelectedValue(true);
        });
        _this.registerDestroyListener(function () { return datavalueSubscription.unsubscribe(); });
        return _this;
    }
    SwitchComponent.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        styler(this.nativeElement, this);
    };
    SwitchComponent.prototype.onStyleChange = function (key, nv, ov) {
        if (key === 'height') {
            setCSS(this.nativeElement, 'overflow', nv ? 'auto' : '');
        }
        else {
            _super.prototype.onStyleChange.call(this, key, nv, ov);
        }
    };
    // This function sets the selectedItem by either using compareby fields or selected flag on datasetItems.
    SwitchComponent.prototype.setSelectedValue = function () {
        if (isDefined(this.datavalue) || isDefined(this.toBeProcessedDatavalue)) {
            this.selectedItem = _.find(this.datasetItems, { selected: true });
            return;
        }
        // If no value is provided, set first value as default if options are available else set -1 ie no selection
        this.selectOptAtIndex(0);
    };
    // set the css for switch overlay element.
    // set the selected index from the datasetItems and highlight the datavalue on switch.
    SwitchComponent.prototype.updateSwitchOptions = function () {
        if (this.datasetItems.length) {
            this.btnwidth = (100 / this.datasetItems.length);
            setCSS(this.nativeElement.querySelector('.app-switch-overlay'), 'width', this.btnwidth + '%');
        }
        this._debounceSetSelectedValue(true);
    };
    // This function animates the highlighted span on to the selected value.
    SwitchComponent.prototype.updateHighlighter = function (skipAnimation) {
        var handler = $(this.nativeElement).find('span.app-switch-overlay');
        this.setSelectedValue();
        var left, index = this.selectedItem ? _.findIndex(this.datasetItems, { key: this.selectedItem.key }) : -1;
        if (index === undefined || index === null) {
            index = -1;
        }
        left = index * this.btnwidth;
        if (skipAnimation) {
            handler.css('left', left + '%');
        }
        else {
            handler.animate({
                left: left + '%'
            }, 300);
        }
    };
    SwitchComponent.prototype.selectOptAtIndex = function ($index) {
        if (!this.datasetItems.length) {
            return;
        }
        var opt = this.datasetItems[$index];
        this._modelByValue = opt.value;
    };
    // Triggered on selected the option from the switch.
    // set the index and highlight the default value. Invoke onchange event handler.
    SwitchComponent.prototype.selectOpt = function ($event, $index, option) {
        this.modelByKey = option.key;
        this.invokeOnTouched();
        $event.preventDefault();
        if (this.disabled) {
            return;
        }
        if (this.selectedItem && $index === _.findIndex(this.datasetItems, { key: this.selectedItem.key })) {
            if (this.datasetItems.length === 2) {
                $index = $index === 1 ? 0 : 1;
            }
            else {
                return;
            }
        }
        this.selectedItem = this.datasetItems[$index];
        this.updateHighlighter();
        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
        $appDigest();
    };
    SwitchComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'disabled' && !toBoolean(nv)) {
            this.nativeElement.removeAttribute(key);
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    SwitchComponent.initializeProps = registerProps();
    SwitchComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmSwitch]',
                    template: "<div role=\"group\" aria-label=\"button switch\" class=\"btn-group btn-group-justified\">\n    <a *ngFor=\"let opt of datasetItems; let $index = index;\"\n       [title]=\"opt.label\" focus-target\n       href=\"javascript:void(0);\"\n       class=\"btn btn-default\"\n       [name]=\"'wm-switch-' + opt.key\"\n       [ngClass]=\"{'selected': opt.selected, 'disabled': disabled}\"\n       (click)=\"selectOpt($event, $index, opt)\"\n    >\n        <i *ngIf=\"opt.dataObject && opt.dataObject[iconclass]\" aria-hidden=\"true\" [ngClass]=\"['app-icon', opt.dataObject[iconclass] || opt['icon']]\"></i>\n        <span class=\"caption\" [textContent]=\"opt[displayfield] || opt.label\"></span>\n    </a>\n</div>\n<span [title]=\"selectedItem ? selectedItem.label : modelByKey\"\n      class=\"btn btn-primary app-switch-overlay switch-handle\">\n    <i *ngIf=\"iconclass\"\n       class=\"app-icon {{(selectedItem && selectedItem.dataObject) && selectedItem.dataObject[iconclass]}}\"></i>\n    {{selectedItem ? selectedItem.label : modelByKey}}\n</span>\n<input [name]=\"name\" class=\"model-holder ng-hide\" [disabled]=\"disabled\" [value]=\"modelByKey\" [required]=\"required\">\n",
                    providers: [
                        provideAsNgValueAccessor(SwitchComponent),
                        provideAsWidgetRef(SwitchComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    SwitchComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return SwitchComponent;
}(DatasetAwareFormComponent));
export { SwitchComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vc3dpdGNoL3N3aXRjaC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVuRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU5RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzNGLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBS2pGLElBQU0sV0FBVyxHQUFHLFlBQVksQ0FBQztBQUNqQyxJQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBRXhFO0lBUXFDLDJDQUF5QjtJQVkxRCx5QkFBWSxHQUFhO1FBQXpCLFlBQ0ksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQW1CNUI7UUE3QkQsYUFBTyxHQUFHLEVBQUUsQ0FBQztRQVlULEtBQUksQ0FBQyx5QkFBeUIsR0FBRyxRQUFRLENBQUMsVUFBQyxHQUFHO1lBQzFDLEtBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hCLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QixzRUFBc0U7WUFDdEUsSUFBSSxHQUFHLEVBQUU7Z0JBQ0wsVUFBVSxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7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Q0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pDO2lCQUFNO2dCQUNILE9BQU87YUFDVjtTQUNKO1FBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXpCLDhCQUE4QjtRQUM5QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4RCxVQUFVLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQsMENBQWdCLEdBQWhCLFVBQWlCLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRztRQUN6QixJQUFJLEdBQUcsS0FBSyxVQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDdEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDM0M7YUFBTTtZQUNILGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBbklNLCtCQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVQ1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLFlBQVk7b0JBQ3RCLHNxQ0FBc0M7b0JBQ3RDLFNBQVMsRUFBRTt3QkFDUCx3QkFBd0IsQ0FBQyxlQUFlLENBQUM7d0JBQ3pDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztxQkFDdEM7aUJBQ0o7Ozs7Z0JBdEJrQyxRQUFROztJQTRKM0Msc0JBQUM7Q0FBQSxBQTdJRCxDQVFxQyx5QkFBeUIsR0FxSTdEO1NBcklZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7ICRhcHBEaWdlc3QsIGRlYm91bmNlLCBpc0RlZmluZWQsIHNldENTUywgdG9Cb29sZWFuIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3N3aXRjaC5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBEYXRhc2V0QXdhcmVGb3JtQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9kYXRhc2V0LWF3YXJlLWZvcm0uY29tcG9uZW50JztcbmltcG9ydCB7IERhdGFTZXRJdGVtIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZm9ybS11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXywgJDtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXN3aXRjaCc7XG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1zd2l0Y2gnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21Td2l0Y2hdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vc3dpdGNoLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKFN3aXRjaENvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihTd2l0Y2hDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBTd2l0Y2hDb21wb25lbnQgZXh0ZW5kcyBEYXRhc2V0QXdhcmVGb3JtQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIG9wdGlvbnMgPSBbXTtcbiAgICBzZWxlY3RlZEl0ZW06IERhdGFTZXRJdGVtO1xuICAgIGljb25jbGFzcztcbiAgICBwcml2YXRlIGJ0bndpZHRoO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgcmVxdWlyZWQ6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBfZGVib3VuY2VTZXRTZWxlY3RlZFZhbHVlOiBGdW5jdGlvbjtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3RvciwgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgdGhpcy5fZGVib3VuY2VTZXRTZWxlY3RlZFZhbHVlID0gZGVib3VuY2UoKHZhbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTZWxlY3RlZFZhbHVlKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodGVyKHZhbCk7XG4gICAgICAgICAgICAvLyBvbmx5IGZvciBkZWZhdWx0IHZhbHVlIHRyaWdnZXIgYXBwIGRpZ2VzdCB0byBhcHBseSB0aGUgc2VsZWN0ZWRJdGVtXG4gICAgICAgICAgICBpZiAodmFsKSB7XG4gICAgICAgICAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAyMDApO1xuXG4gICAgICAgIGNvbnN0IGRhdGFzZXRTdWJzY3JpcHRpb24gPSB0aGlzLmRhdGFzZXQkLnN1YnNjcmliZSgoKSA9PiB0aGlzLnVwZGF0ZVN3aXRjaE9wdGlvbnMoKSk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBkYXRhc2V0U3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuXG4gICAgICAgIGNvbnN0IGRhdGF2YWx1ZVN1YnNjcmlwdGlvbiA9IHRoaXMuZGF0YXZhbHVlJC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fZGVib3VuY2VTZXRTZWxlY3RlZFZhbHVlKHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBkYXRhdmFsdWVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgb25TdHlsZUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2hlaWdodCcpIHtcbiAgICAgICAgICAgIHNldENTUyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdvdmVyZmxvdycsIG52ID8gJ2F1dG8nIDogJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25TdHlsZUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNldHMgdGhlIHNlbGVjdGVkSXRlbSBieSBlaXRoZXIgdXNpbmcgY29tcGFyZWJ5IGZpZWxkcyBvciBzZWxlY3RlZCBmbGFnIG9uIGRhdGFzZXRJdGVtcy5cbiAgICBwcml2YXRlIHNldFNlbGVjdGVkVmFsdWUoKSB7XG4gICAgICAgIGlmIChpc0RlZmluZWQodGhpcy5kYXRhdmFsdWUpIHx8IGlzRGVmaW5lZCh0aGlzLnRvQmVQcm9jZXNzZWREYXRhdmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbSA9IF8uZmluZCh0aGlzLmRhdGFzZXRJdGVtcywge3NlbGVjdGVkOiB0cnVlfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBubyB2YWx1ZSBpcyBwcm92aWRlZCwgc2V0IGZpcnN0IHZhbHVlIGFzIGRlZmF1bHQgaWYgb3B0aW9ucyBhcmUgYXZhaWxhYmxlIGVsc2Ugc2V0IC0xIGllIG5vIHNlbGVjdGlvblxuICAgICAgICB0aGlzLnNlbGVjdE9wdEF0SW5kZXgoMCk7XG4gICAgfVxuXG4gICAgLy8gc2V0IHRoZSBjc3MgZm9yIHN3aXRjaCBvdmVybGF5IGVsZW1lbnQuXG4gICAgLy8gc2V0IHRoZSBzZWxlY3RlZCBpbmRleCBmcm9tIHRoZSBkYXRhc2V0SXRlbXMgYW5kIGhpZ2hsaWdodCB0aGUgZGF0YXZhbHVlIG9uIHN3aXRjaC5cbiAgICBwcml2YXRlIHVwZGF0ZVN3aXRjaE9wdGlvbnMoKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGFzZXRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuYnRud2lkdGggPSAoMTAwIC8gdGhpcy5kYXRhc2V0SXRlbXMubGVuZ3RoKTtcbiAgICAgICAgICAgIHNldENTUyh0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmFwcC1zd2l0Y2gtb3ZlcmxheScpIGFzIEhUTUxFbGVtZW50LCAnd2lkdGgnLCB0aGlzLmJ0bndpZHRoICsgJyUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2RlYm91bmNlU2V0U2VsZWN0ZWRWYWx1ZSh0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGFuaW1hdGVzIHRoZSBoaWdobGlnaHRlZCBzcGFuIG9uIHRvIHRoZSBzZWxlY3RlZCB2YWx1ZS5cbiAgICBwcml2YXRlIHVwZGF0ZUhpZ2hsaWdodGVyKHNraXBBbmltYXRpb24/KSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSAkKHRoaXMubmF0aXZlRWxlbWVudCkuZmluZCgnc3Bhbi5hcHAtc3dpdGNoLW92ZXJsYXknKTtcblxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkVmFsdWUoKTtcblxuICAgICAgICBsZXQgbGVmdCxcbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5zZWxlY3RlZEl0ZW0gPyBfLmZpbmRJbmRleCh0aGlzLmRhdGFzZXRJdGVtcywge2tleTogdGhpcy5zZWxlY3RlZEl0ZW0ua2V5fSkgOiAtMTtcblxuICAgICAgICBpZiAoaW5kZXggPT09IHVuZGVmaW5lZCB8fCBpbmRleCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgaW5kZXggPSAtMTtcbiAgICAgICAgfVxuICAgICAgICBsZWZ0ID0gaW5kZXggKiB0aGlzLmJ0bndpZHRoO1xuICAgICAgICBpZiAoc2tpcEFuaW1hdGlvbikge1xuICAgICAgICAgICAgaGFuZGxlci5jc3MoJ2xlZnQnLCBsZWZ0ICsgJyUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZXIuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdCArICclJ1xuICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbGVjdE9wdEF0SW5kZXgoJGluZGV4KSB7XG4gICAgICAgIGlmICghdGhpcy5kYXRhc2V0SXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb3B0ID0gdGhpcy5kYXRhc2V0SXRlbXNbJGluZGV4XTtcbiAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gb3B0LnZhbHVlO1xuICAgIH1cblxuICAgIC8vIFRyaWdnZXJlZCBvbiBzZWxlY3RlZCB0aGUgb3B0aW9uIGZyb20gdGhlIHN3aXRjaC5cbiAgICAvLyBzZXQgdGhlIGluZGV4IGFuZCBoaWdobGlnaHQgdGhlIGRlZmF1bHQgdmFsdWUuIEludm9rZSBvbmNoYW5nZSBldmVudCBoYW5kbGVyLlxuICAgIHNlbGVjdE9wdCgkZXZlbnQsICRpbmRleCwgb3B0aW9uKSB7XG4gICAgICAgIHRoaXMubW9kZWxCeUtleSA9IG9wdGlvbi5rZXk7XG5cbiAgICAgICAgdGhpcy5pbnZva2VPblRvdWNoZWQoKTtcbiAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbSAmJiAkaW5kZXggPT09IF8uZmluZEluZGV4KHRoaXMuZGF0YXNldEl0ZW1zLCB7a2V5OiB0aGlzLnNlbGVjdGVkSXRlbS5rZXl9KSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YXNldEl0ZW1zLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAgICRpbmRleCA9ICRpbmRleCA9PT0gMSA/IDAgOiAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW0gPSB0aGlzLmRhdGFzZXRJdGVtc1skaW5kZXhdO1xuICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodGVyKCk7XG5cbiAgICAgICAgLy8gaW52b2tlIG9uIGRhdGF2YWx1ZSBjaGFuZ2UuXG4gICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsICRldmVudCB8fCB7fSwgdHJ1ZSk7XG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92Pykge1xuICAgICAgICBpZiAoa2V5ID09PSAnZGlzYWJsZWQnICYmICF0b0Jvb2xlYW4obnYpKSB7XG4gICAgICAgICAgICB0aGlzLm5hdGl2ZUVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==