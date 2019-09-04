import { Component, Injector } from '@angular/core';
import { $appDigest, debounce, isDefined, setCSS, toBoolean } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './switch.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
const DEFAULT_CLS = 'app-switch';
const WIDGET_CONFIG = { widgetType: 'wm-switch', hostClass: DEFAULT_CLS };
export class SwitchComponent extends DatasetAwareFormComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        this.options = [];
        this._debounceSetSelectedValue = debounce((val) => {
            this.setSelectedValue();
            this.updateHighlighter(val);
            // only for default value trigger app digest to apply the selectedItem
            if (val) {
                $appDigest();
            }
        }, 200);
        const datasetSubscription = this.dataset$.subscribe(() => this.updateSwitchOptions());
        this.registerDestroyListener(() => datasetSubscription.unsubscribe());
        const datavalueSubscription = this.datavalue$.subscribe(() => {
            this._debounceSetSelectedValue(true);
        });
        this.registerDestroyListener(() => datavalueSubscription.unsubscribe());
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.nativeElement, this);
    }
    onStyleChange(key, nv, ov) {
        if (key === 'height') {
            setCSS(this.nativeElement, 'overflow', nv ? 'auto' : '');
        }
        else {
            super.onStyleChange(key, nv, ov);
        }
    }
    // This function sets the selectedItem by either using compareby fields or selected flag on datasetItems.
    setSelectedValue() {
        if (isDefined(this.datavalue) || isDefined(this.toBeProcessedDatavalue)) {
            this.selectedItem = _.find(this.datasetItems, { selected: true });
            return;
        }
        // If no value is provided, set first value as default if options are available else set -1 ie no selection
        this.selectOptAtIndex(0);
    }
    // set the css for switch overlay element.
    // set the selected index from the datasetItems and highlight the datavalue on switch.
    updateSwitchOptions() {
        if (this.datasetItems.length) {
            this.btnwidth = (100 / this.datasetItems.length);
            setCSS(this.nativeElement.querySelector('.app-switch-overlay'), 'width', this.btnwidth + '%');
        }
        this._debounceSetSelectedValue(true);
    }
    // This function animates the highlighted span on to the selected value.
    updateHighlighter(skipAnimation) {
        const handler = $(this.nativeElement).find('span.app-switch-overlay');
        this.setSelectedValue();
        let left, index = this.selectedItem ? _.findIndex(this.datasetItems, { key: this.selectedItem.key }) : -1;
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
    }
    selectOptAtIndex($index) {
        if (!this.datasetItems.length) {
            return;
        }
        const opt = this.datasetItems[$index];
        this._modelByValue = opt.value;
    }
    // Triggered on selected the option from the switch.
    // set the index and highlight the default value. Invoke onchange event handler.
    selectOpt($event, $index, option) {
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
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'disabled' && !toBoolean(nv)) {
            this.nativeElement.removeAttribute(key);
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
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
SwitchComponent.ctorParameters = () => [
    { type: Injector }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vc3dpdGNoL3N3aXRjaC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRW5FLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTlFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0MsT0FBTyxFQUFFLHdCQUF3QixFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM0YsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFLakYsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDO0FBQ2pDLE1BQU0sYUFBYSxHQUFHLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFVeEUsTUFBTSxPQUFPLGVBQWdCLFNBQVEseUJBQXlCO0lBWTFELFlBQVksR0FBYTtRQUNyQixLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBVjlCLFlBQU8sR0FBRyxFQUFFLENBQUM7UUFZVCxJQUFJLENBQUMseUJBQXlCLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDOUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLHNFQUFzRTtZQUN0RSxJQUFJLEdBQUcsRUFBRTtnQkFDTCxVQUFVLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMs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QUFDLENBQUMsQ0FBQzthQUNqQztpQkFBTTtnQkFDSCxPQUFPO2FBQ1Y7U0FDSjtRQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUV6Qiw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEQsVUFBVSxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVELGdCQUFnQixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRztRQUN6QixJQUFJLEdBQUcsS0FBSyxVQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDdEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDM0M7YUFBTTtZQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQzs7QUFuSU0sK0JBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFUNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxZQUFZO2dCQUN0QixzcUNBQXNDO2dCQUN0QyxTQUFTLEVBQUU7b0JBQ1Asd0JBQXdCLENBQUMsZUFBZSxDQUFDO29CQUN6QyxrQkFBa0IsQ0FBQyxlQUFlLENBQUM7aUJBQ3RDO2FBQ0o7Ozs7WUF0QmtDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7ICRhcHBEaWdlc3QsIGRlYm91bmNlLCBpc0RlZmluZWQsIHNldENTUywgdG9Cb29sZWFuIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3N3aXRjaC5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBEYXRhc2V0QXdhcmVGb3JtQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9kYXRhc2V0LWF3YXJlLWZvcm0uY29tcG9uZW50JztcbmltcG9ydCB7IERhdGFTZXRJdGVtIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZm9ybS11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXywgJDtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXN3aXRjaCc7XG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1zd2l0Y2gnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21Td2l0Y2hdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vc3dpdGNoLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKFN3aXRjaENvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihTd2l0Y2hDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBTd2l0Y2hDb21wb25lbnQgZXh0ZW5kcyBEYXRhc2V0QXdhcmVGb3JtQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIG9wdGlvbnMgPSBbXTtcbiAgICBzZWxlY3RlZEl0ZW06IERhdGFTZXRJdGVtO1xuICAgIGljb25jbGFzcztcbiAgICBwcml2YXRlIGJ0bndpZHRoO1xuICAgIHB1YmxpYyBkaXNhYmxlZDogYm9vbGVhbjtcbiAgICBwdWJsaWMgcmVxdWlyZWQ6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBfZGVib3VuY2VTZXRTZWxlY3RlZFZhbHVlOiBGdW5jdGlvbjtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3RvciwgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgdGhpcy5fZGVib3VuY2VTZXRTZWxlY3RlZFZhbHVlID0gZGVib3VuY2UoKHZhbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTZWxlY3RlZFZhbHVlKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodGVyKHZhbCk7XG4gICAgICAgICAgICAvLyBvbmx5IGZvciBkZWZhdWx0IHZhbHVlIHRyaWdnZXIgYXBwIGRpZ2VzdCB0byBhcHBseSB0aGUgc2VsZWN0ZWRJdGVtXG4gICAgICAgICAgICBpZiAodmFsKSB7XG4gICAgICAgICAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAyMDApO1xuXG4gICAgICAgIGNvbnN0IGRhdGFzZXRTdWJzY3JpcHRpb24gPSB0aGlzLmRhdGFzZXQkLnN1YnNjcmliZSgoKSA9PiB0aGlzLnVwZGF0ZVN3aXRjaE9wdGlvbnMoKSk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBkYXRhc2V0U3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuXG4gICAgICAgIGNvbnN0IGRhdGF2YWx1ZVN1YnNjcmlwdGlvbiA9IHRoaXMuZGF0YXZhbHVlJC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fZGVib3VuY2VTZXRTZWxlY3RlZFZhbHVlKHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBkYXRhdmFsdWVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgb25TdHlsZUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2hlaWdodCcpIHtcbiAgICAgICAgICAgIHNldENTUyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdvdmVyZmxvdycsIG52ID8gJ2F1dG8nIDogJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25TdHlsZUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNldHMgdGhlIHNlbGVjdGVkSXRlbSBieSBlaXRoZXIgdXNpbmcgY29tcGFyZWJ5IGZpZWxkcyBvciBzZWxlY3RlZCBmbGFnIG9uIGRhdGFzZXRJdGVtcy5cbiAgICBwcml2YXRlIHNldFNlbGVjdGVkVmFsdWUoKSB7XG4gICAgICAgIGlmIChpc0RlZmluZWQodGhpcy5kYXRhdmFsdWUpIHx8IGlzRGVmaW5lZCh0aGlzLnRvQmVQcm9jZXNzZWREYXRhdmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbSA9IF8uZmluZCh0aGlzLmRhdGFzZXRJdGVtcywge3NlbGVjdGVkOiB0cnVlfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBubyB2YWx1ZSBpcyBwcm92aWRlZCwgc2V0IGZpcnN0IHZhbHVlIGFzIGRlZmF1bHQgaWYgb3B0aW9ucyBhcmUgYXZhaWxhYmxlIGVsc2Ugc2V0IC0xIGllIG5vIHNlbGVjdGlvblxuICAgICAgICB0aGlzLnNlbGVjdE9wdEF0SW5kZXgoMCk7XG4gICAgfVxuXG4gICAgLy8gc2V0IHRoZSBjc3MgZm9yIHN3aXRjaCBvdmVybGF5IGVsZW1lbnQuXG4gICAgLy8gc2V0IHRoZSBzZWxlY3RlZCBpbmRleCBmcm9tIHRoZSBkYXRhc2V0SXRlbXMgYW5kIGhpZ2hsaWdodCB0aGUgZGF0YXZhbHVlIG9uIHN3aXRjaC5cbiAgICBwcml2YXRlIHVwZGF0ZVN3aXRjaE9wdGlvbnMoKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGFzZXRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuYnRud2lkdGggPSAoMTAwIC8gdGhpcy5kYXRhc2V0SXRlbXMubGVuZ3RoKTtcbiAgICAgICAgICAgIHNldENTUyh0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmFwcC1zd2l0Y2gtb3ZlcmxheScpIGFzIEhUTUxFbGVtZW50LCAnd2lkdGgnLCB0aGlzLmJ0bndpZHRoICsgJyUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2RlYm91bmNlU2V0U2VsZWN0ZWRWYWx1ZSh0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGFuaW1hdGVzIHRoZSBoaWdobGlnaHRlZCBzcGFuIG9uIHRvIHRoZSBzZWxlY3RlZCB2YWx1ZS5cbiAgICBwcml2YXRlIHVwZGF0ZUhpZ2hsaWdodGVyKHNraXBBbmltYXRpb24/KSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSAkKHRoaXMubmF0aXZlRWxlbWVudCkuZmluZCgnc3Bhbi5hcHAtc3dpdGNoLW92ZXJsYXknKTtcblxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkVmFsdWUoKTtcblxuICAgICAgICBsZXQgbGVmdCxcbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5zZWxlY3RlZEl0ZW0gPyBfLmZpbmRJbmRleCh0aGlzLmRhdGFzZXRJdGVtcywge2tleTogdGhpcy5zZWxlY3RlZEl0ZW0ua2V5fSkgOiAtMTtcblxuICAgICAgICBpZiAoaW5kZXggPT09IHVuZGVmaW5lZCB8fCBpbmRleCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgaW5kZXggPSAtMTtcbiAgICAgICAgfVxuICAgICAgICBsZWZ0ID0gaW5kZXggKiB0aGlzLmJ0bndpZHRoO1xuICAgICAgICBpZiAoc2tpcEFuaW1hdGlvbikge1xuICAgICAgICAgICAgaGFuZGxlci5jc3MoJ2xlZnQnLCBsZWZ0ICsgJyUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZXIuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdCArICclJ1xuICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbGVjdE9wdEF0SW5kZXgoJGluZGV4KSB7XG4gICAgICAgIGlmICghdGhpcy5kYXRhc2V0SXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb3B0ID0gdGhpcy5kYXRhc2V0SXRlbXNbJGluZGV4XTtcbiAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gb3B0LnZhbHVlO1xuICAgIH1cblxuICAgIC8vIFRyaWdnZXJlZCBvbiBzZWxlY3RlZCB0aGUgb3B0aW9uIGZyb20gdGhlIHN3aXRjaC5cbiAgICAvLyBzZXQgdGhlIGluZGV4IGFuZCBoaWdobGlnaHQgdGhlIGRlZmF1bHQgdmFsdWUuIEludm9rZSBvbmNoYW5nZSBldmVudCBoYW5kbGVyLlxuICAgIHNlbGVjdE9wdCgkZXZlbnQsICRpbmRleCwgb3B0aW9uKSB7XG4gICAgICAgIHRoaXMubW9kZWxCeUtleSA9IG9wdGlvbi5rZXk7XG5cbiAgICAgICAgdGhpcy5pbnZva2VPblRvdWNoZWQoKTtcbiAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbSAmJiAkaW5kZXggPT09IF8uZmluZEluZGV4KHRoaXMuZGF0YXNldEl0ZW1zLCB7a2V5OiB0aGlzLnNlbGVjdGVkSXRlbS5rZXl9KSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YXNldEl0ZW1zLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAgICRpbmRleCA9ICRpbmRleCA9PT0gMSA/IDAgOiAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW0gPSB0aGlzLmRhdGFzZXRJdGVtc1skaW5kZXhdO1xuICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodGVyKCk7XG5cbiAgICAgICAgLy8gaW52b2tlIG9uIGRhdGF2YWx1ZSBjaGFuZ2UuXG4gICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsICRldmVudCB8fCB7fSwgdHJ1ZSk7XG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92Pykge1xuICAgICAgICBpZiAoa2V5ID09PSAnZGlzYWJsZWQnICYmICF0b0Jvb2xlYW4obnYpKSB7XG4gICAgICAgICAgICB0aGlzLm5hdGl2ZUVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==