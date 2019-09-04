import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { generateGUId, setCSS } from '@wm/core';
import { styler } from '../../framework/styler';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './rating.props';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { getOrderedDataset } from '../../../utils/form-utils';
const DEFAULT_CLS = 'app-ratings';
const WIDGET_CONFIG = { widgetType: 'wm-rating', hostClass: DEFAULT_CLS };
const MAX_RATING = 10;
const DEFAULT_RATING = 5;
export class RatingComponent extends DatasetAwareFormComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        this._id = generateGUId();
        styler(this.nativeElement, this);
        // prepare the rating options on dataset ready.
        const datasetSubscription = this.dataset$.subscribe(() => {
            this.prepareRatingDataset();
        });
        this.registerDestroyListener(() => datasetSubscription.unsubscribe());
        // listen to changes in datavalue.
        const datavalueSubscription = this.datavalue$.subscribe(() => this.onDatavalueChange(this.datavalue));
        this.registerDestroyListener(() => datavalueSubscription.unsubscribe());
    }
    get selectedRatingValue() {
        return this._selectedRatingValue;
    }
    set selectedRatingValue(val) {
        this._selectedRatingValue = val;
        this.calculateRatingsWidth();
    }
    // Change event is registered from the template, Prevent the framework from registering one more event
    handleEvent(node, eventName, eventCallback, locals) {
        if (eventName !== 'change' && eventName !== 'blur') {
            super.handleEvent(this.ratingEl.nativeElement, eventName, eventCallback, locals);
        }
    }
    // This function returns the rating widget dataset containing the index, value and label
    prepareRatingDataset() {
        if (!this.datasetItems.length) {
            this.ratingItems = [];
            this.caption = '';
        }
        let ratingItems = [];
        let data = this.datasetItems;
        const maxvalue = parseInt(this.maxvalue || this.datasetItems.length, 10);
        const maxValue = (maxvalue > MAX_RATING ? MAX_RATING : maxvalue) || DEFAULT_RATING;
        /**
         * 1. If datasetItems.length is more than maxValue (i.e. 10 ratings) then just extract maxValue of items from datasetItems.
         * 2. If datasetItems are not available then prepare ratings value depending on maxvalue. eg: 1,2,3 .. upto maxvalue
         * 3. If maxvalue / i value is more than datasetItems length, prepare default rating items for i values more than datasetItems.length
         */
        if (data.length && data.length > maxValue) {
            data = _.slice(data, 0, maxValue);
        }
        for (let i = maxValue; i > 0; i--) {
            if (!data.length) {
                ratingItems.push({ key: i, value: i, index: i, label: i });
            }
            else {
                if (i > data.length) {
                    ratingItems.push({ key: i, value: i, index: i, label: i });
                }
                else {
                    data = getOrderedDataset(data, 'index:desc');
                    ratingItems = ratingItems.concat(data);
                    break;
                }
            }
        }
        this.ratingItems = ratingItems;
        if (!data.length) { // constructs default datasetItems when there is no dataset binding.
            this.datasetItems = ratingItems;
        }
        this.onDatavalueChange(this.datavalue);
    }
    onRatingClick($event, rate) {
        this.selectedRatingValue = rate.index;
        this.modelByKey = rate.key;
        // support if the caption is binded in the old projects for backward compatibility
        if (!this.showcaptions) {
            this.caption = rate.label;
        }
        this.invokeOnTouched();
        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
    }
    // Update the selected flag on datasetItems and assign the ratingValue.
    /**
     * On datavalue change, update the caption, selectedRatingValue.
     * 1. if datasetItems contain the selected item (check the selected flag on item), find the index of selected item.
     * 2. if not, just check if the datavalue is provided as the index on the item.
     *
     * @param dataVal datavalue
     */
    onDatavalueChange(dataVal) {
        if (!_.isEmpty(this.datasetItems)) {
            let selectedItem = _.find(this.datasetItems, { 'selected': true });
            if (!selectedItem && !_.isUndefined(dataVal)) {
                selectedItem = _.find(this.datasetItems, function (item) {
                    return _.toString(item.index) === dataVal;
                });
                if (selectedItem) {
                    selectedItem.selected = true;
                }
            }
            if (!selectedItem) {
                // reset the  model if there is no item found.
                this.modelByKey = undefined;
                this.caption = '';
            }
            this.selectedRatingValue = selectedItem ? selectedItem.index : 0;
            if (selectedItem) {
                this.caption = selectedItem.label;
            }
        }
        else {
            this.selectedRatingValue = 0;
        }
        if (this.readonly) {
            // when dataset is not given but datavalue is provided which is integer
            if (!this.selectedRatingValue && !isNaN(dataVal)) {
                this.selectedRatingValue = (parseFloat(dataVal) <= this.maxvalue) ? dataVal : this.maxvalue;
            }
            this.ratingsWidth = this.calculateRatingsWidth(dataVal);
        }
    }
    calculateRatingsWidth(dataVal) {
        const selectedRating = parseFloat(this.selectedRatingValue), starWidth = 0.925, maxValue = parseInt(this.maxvalue || this.datasetItems.length, 10) || DEFAULT_RATING;
        setCSS(this.nativeElement.querySelector('.ratings-container'), 'width', (starWidth * maxValue) + 'em');
        dataVal = dataVal || this.datavalue;
        if (dataVal === undefined || dataVal === '' || dataVal === null) {
            this.caption = '';
            return 0;
        }
        if (selectedRating <= maxValue && selectedRating >= 0) {
            return selectedRating * starWidth + 'em';
        }
        if (selectedRating > maxValue) {
            return maxValue * starWidth + 'em';
        }
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'readonly') {
            if (nv) {
                this.ratingsWidth = this.calculateRatingsWidth();
            }
        }
        else if (key === 'maxvalue') {
            this.prepareRatingDataset();
            // reset all the items.
            this.resetDatasetItems();
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    onMouseleave() {
        this.caption = this.displayValue;
    }
    onMouseOver($event, rate) {
        this.caption = rate.label;
    }
}
RatingComponent.initializeProps = registerProps();
RatingComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmRating]',
                template: "<div [(ngModel)]=\"modelByKey\" (focus)=\"onFocus($event)\" ngDefaultControl role=\"radiogroup\" class=\"ratings-wrapper\">\n    <div *ngIf=\"!readonly\" class=\"rating-style\">\n        <label *ngFor=\"let rate of ratingItems;\"\n               [ngClass]=\"{active : rate.index <= selectedRatingValue}\"\n               [ngStyle]=\"{'font-size' :iconsize, color: rate.index <= selectedRatingValue && iconcolor}\"\n               [title]=\"rate.label || rate.index\"\n               (mouseleave)=\"onMouseleave($event, rate)\"\n               (mouseover)=\"onMouseOver($event, rate)\"\n               [for]=\"_id + '-' + rate.index\">\n            <input #ratingInput type=\"radio\" aria-label=\"rating radio buttons\" aria-checked=\"false\" aria-multiselectable=\"true\"\n                   [id]=\"_id + '-' + rate.index\" (click)=\"onRatingClick($event, rate)\" name=\"ratings-id\" [value]=\"rate.key || rate.index\"/>\n        </label>\n    </div>\n    <div [class.hidden]=\"!readonly\" [ngStyle]=\"{'font-size' :iconsize}\" class=\"ratings-container disabled\" >\n        <div class=\"ratings active\" [ngStyle]=\"{width: ratingsWidth, color: iconcolor}\"></div>\n    </div>\n    <label *ngIf=\"showcaptions\" class=\"caption\" [textContent]=\"caption\"></label>\n</div>\n",
                providers: [
                    provideAsNgValueAccessor(RatingComponent),
                    provideAsWidgetRef(RatingComponent)
                ]
            }] }
];
/** @nocollapse */
RatingComponent.ctorParameters = () => [
    { type: Injector }
];
RatingComponent.propDecorators = {
    ratingEl: [{ type: ViewChild, args: ['ratingInput', { read: ElementRef },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF0aW5nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vcmF0aW5nL3JhdGluZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVoRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLHdCQUF3QixFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM0YsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBSTlELE1BQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQztBQUNsQyxNQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBRXhFLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUN0QixNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFVekIsTUFBTSxPQUFPLGVBQWdCLFNBQVEseUJBQXlCO0lBMEIxRCxZQUFZLEdBQWE7UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsR0FBRyxHQUFHLFlBQVksRUFBRSxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRWpDLCtDQUErQztRQUMvQyxNQUFNLG1CQUFtQixHQUFHLElBQUks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WUFDNUIsdUJBQXVCO1lBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1NBQzVCO2FBQU07WUFDSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN2QztJQUNMLENBQUM7SUFFRCxZQUFZO1FBQ1IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBc0IsQ0FBQztJQUMvQyxDQUFDO0lBRUQsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJO1FBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUM5QixDQUFDOztBQTlMTSwrQkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVQ1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLHd3Q0FBc0M7Z0JBQ3RDLFNBQVMsRUFBRTtvQkFDUCx3QkFBd0IsQ0FBQyxlQUFlLENBQUM7b0JBQ3pDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztpQkFDdEM7YUFDSjs7OztZQXpCK0IsUUFBUTs7O3VCQXlDbkMsU0FBUyxTQUFDLGFBQWEsRUFBRSxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgZ2VuZXJhdGVHVUlkLCBzZXRDU1MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vcmF0aW5nLnByb3BzJztcbmltcG9ydCB7IERhdGFzZXRBd2FyZUZvcm1Db21wb25lbnQgfSBmcm9tICcuLi9iYXNlL2RhdGFzZXQtYXdhcmUtZm9ybS5jb21wb25lbnQnO1xuaW1wb3J0IHsgZ2V0T3JkZXJlZERhdGFzZXQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9mb3JtLXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtcmF0aW5ncyc7XG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1yYXRpbmcnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuY29uc3QgTUFYX1JBVElORyA9IDEwO1xuY29uc3QgREVGQVVMVF9SQVRJTkcgPSA1O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bVJhdGluZ10nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9yYXRpbmcuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IoUmF0aW5nQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFJhdGluZ0NvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFJhdGluZ0NvbXBvbmVudCBleHRlbmRzIERhdGFzZXRBd2FyZUZvcm1Db21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgY2FwdGlvbjogc3RyaW5nO1xuICAgIHB1YmxpYyBzaG93Y2FwdGlvbnM6IGJvb2xlYW47XG4gICAgcHVibGljIG1heHZhbHVlO1xuXG4gICAgcHJpdmF0ZSBfc2VsZWN0ZWRSYXRpbmdWYWx1ZTtcbiAgICBwdWJsaWMgcmF0aW5nc1dpZHRoO1xuICAgIHByaXZhdGUgcmF0aW5nSXRlbXM7XG4gICAgcHJpdmF0ZSBfaWQ7XG5cbiAgICBwdWJsaWMgaWNvbnNpemU6IHN0cmluZztcbiAgICBwdWJsaWMgaWNvbmNvbG9yOiBzdHJpbmc7XG4gICAgcHVibGljIG9uRm9jdXM6IGFueTtcbiAgICBAVmlld0NoaWxkKCdyYXRpbmdJbnB1dCcsIHtyZWFkOiBFbGVtZW50UmVmfSkgcmF0aW5nRWw6IEVsZW1lbnRSZWY7XG5cbiAgICBnZXQgc2VsZWN0ZWRSYXRpbmdWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkUmF0aW5nVmFsdWU7XG4gICAgfVxuXG4gICAgc2V0IHNlbGVjdGVkUmF0aW5nVmFsdWUodmFsKSB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkUmF0aW5nVmFsdWUgPSB2YWw7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlUmF0aW5nc1dpZHRoKCk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICB0aGlzLl9pZCA9IGdlbmVyYXRlR1VJZCgpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcblxuICAgICAgICAvLyBwcmVwYXJlIHRoZSByYXRpbmcgb3B0aW9ucyBvbiBkYXRhc2V0IHJlYWR5LlxuICAgICAgICBjb25zdCBkYXRhc2V0U3Vic2NyaXB0aW9uID0gdGhpcy5kYXRhc2V0JC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcmVwYXJlUmF0aW5nRGF0YXNldCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBkYXRhc2V0U3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuXG4gICAgICAgIC8vIGxpc3RlbiB0byBjaGFuZ2VzIGluIGRhdGF2YWx1ZS5cbiAgICAgICAgY29uc3QgZGF0YXZhbHVlU3Vic2NyaXB0aW9uID0gdGhpcy5kYXRhdmFsdWUkLnN1YnNjcmliZSgoKSA9PiB0aGlzLm9uRGF0YXZhbHVlQ2hhbmdlKHRoaXMuZGF0YXZhbHVlKSk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoKCkgPT4gZGF0YXZhbHVlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuICAgIH1cblxuICAgIC8vIENoYW5nZSBldmVudCBpcyByZWdpc3RlcmVkIGZyb20gdGhlIHRlbXBsYXRlLCBQcmV2ZW50IHRoZSBmcmFtZXdvcmsgZnJvbSByZWdpc3RlcmluZyBvbmUgbW9yZSBldmVudFxuICAgIHByb3RlY3RlZCBoYW5kbGVFdmVudChub2RlOiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50Q2FsbGJhY2s6IEZ1bmN0aW9uLCBsb2NhbHM6IGFueSkge1xuICAgICAgICBpZiAoZXZlbnROYW1lICE9PSAnY2hhbmdlJyAmJiBldmVudE5hbWUgIT09ICdibHVyJykge1xuICAgICAgICAgICAgc3VwZXIuaGFuZGxlRXZlbnQodGhpcy5yYXRpbmdFbC5uYXRpdmVFbGVtZW50LCBldmVudE5hbWUsIGV2ZW50Q2FsbGJhY2ssIGxvY2Fscyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJhdGluZyB3aWRnZXQgZGF0YXNldCBjb250YWluaW5nIHRoZSBpbmRleCwgdmFsdWUgYW5kIGxhYmVsXG4gICAgcHJpdmF0ZSBwcmVwYXJlUmF0aW5nRGF0YXNldCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRhdGFzZXRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMucmF0aW5nSXRlbXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuY2FwdGlvbiA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJhdGluZ0l0ZW1zID0gW107XG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5kYXRhc2V0SXRlbXM7XG4gICAgICAgIGNvbnN0IG1heHZhbHVlID0gcGFyc2VJbnQodGhpcy5tYXh2YWx1ZSB8fCB0aGlzLmRhdGFzZXRJdGVtcy5sZW5ndGgsIDEwKTtcbiAgICAgICAgY29uc3QgbWF4VmFsdWUgPSAobWF4dmFsdWUgPiBNQVhfUkFUSU5HID8gTUFYX1JBVElORyA6IG1heHZhbHVlKSB8fCBERUZBVUxUX1JBVElORztcblxuICAgICAgICAvKipcbiAgICAgICAgICogMS4gSWYgZGF0YXNldEl0ZW1zLmxlbmd0aCBpcyBtb3JlIHRoYW4gbWF4VmFsdWUgKGkuZS4gMTAgcmF0aW5ncykgdGhlbiBqdXN0IGV4dHJhY3QgbWF4VmFsdWUgb2YgaXRlbXMgZnJvbSBkYXRhc2V0SXRlbXMuXG4gICAgICAgICAqIDIuIElmIGRhdGFzZXRJdGVtcyBhcmUgbm90IGF2YWlsYWJsZSB0aGVuIHByZXBhcmUgcmF0aW5ncyB2YWx1ZSBkZXBlbmRpbmcgb24gbWF4dmFsdWUuIGVnOiAxLDIsMyAuLiB1cHRvIG1heHZhbHVlXG4gICAgICAgICAqIDMuIElmIG1heHZhbHVlIC8gaSB2YWx1ZSBpcyBtb3JlIHRoYW4gZGF0YXNldEl0ZW1zIGxlbmd0aCwgcHJlcGFyZSBkZWZhdWx0IHJhdGluZyBpdGVtcyBmb3IgaSB2YWx1ZXMgbW9yZSB0aGFuIGRhdGFzZXRJdGVtcy5sZW5ndGhcbiAgICAgICAgICovXG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCAmJiBkYXRhLmxlbmd0aCA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICBkYXRhID0gXy5zbGljZShkYXRhLCAwLCBtYXhWYWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gbWF4VmFsdWU7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgICAgIGlmICghZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByYXRpbmdJdGVtcy5wdXNoKHtrZXk6IGksIHZhbHVlOiBpLCBpbmRleDogaSwgbGFiZWw6IGl9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPiBkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByYXRpbmdJdGVtcy5wdXNoKHtrZXk6IGksIHZhbHVlOiBpLCBpbmRleDogaSwgbGFiZWw6IGl9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gZ2V0T3JkZXJlZERhdGFzZXQoZGF0YSwgJ2luZGV4OmRlc2MnKTtcbiAgICAgICAgICAgICAgICAgICAgcmF0aW5nSXRlbXMgPSByYXRpbmdJdGVtcy5jb25jYXQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmF0aW5nSXRlbXMgPSByYXRpbmdJdGVtcztcbiAgICAgICAgaWYgKCFkYXRhLmxlbmd0aCkgeyAvLyBjb25zdHJ1Y3RzIGRlZmF1bHQgZGF0YXNldEl0ZW1zIHdoZW4gdGhlcmUgaXMgbm8gZGF0YXNldCBiaW5kaW5nLlxuICAgICAgICAgICAgdGhpcy5kYXRhc2V0SXRlbXMgPSByYXRpbmdJdGVtcztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uRGF0YXZhbHVlQ2hhbmdlKHRoaXMuZGF0YXZhbHVlKTtcbiAgICB9XG5cbiAgICBvblJhdGluZ0NsaWNrKCRldmVudCwgcmF0ZSkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkUmF0aW5nVmFsdWUgPSByYXRlLmluZGV4O1xuICAgICAgICB0aGlzLm1vZGVsQnlLZXkgPSByYXRlLmtleTtcblxuICAgICAgICAvLyBzdXBwb3J0IGlmIHRoZSBjYXB0aW9uIGlzIGJpbmRlZCBpbiB0aGUgb2xkIHByb2plY3RzIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAgICAgIGlmICghdGhpcy5zaG93Y2FwdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuY2FwdGlvbiA9IHJhdGUubGFiZWw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmludm9rZU9uVG91Y2hlZCgpO1xuICAgICAgICAvLyBpbnZva2Ugb24gZGF0YXZhbHVlIGNoYW5nZS5cbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgJGV2ZW50IHx8IHt9LCB0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIHNlbGVjdGVkIGZsYWcgb24gZGF0YXNldEl0ZW1zIGFuZCBhc3NpZ24gdGhlIHJhdGluZ1ZhbHVlLlxuICAgIC8qKlxuICAgICAqIE9uIGRhdGF2YWx1ZSBjaGFuZ2UsIHVwZGF0ZSB0aGUgY2FwdGlvbiwgc2VsZWN0ZWRSYXRpbmdWYWx1ZS5cbiAgICAgKiAxLiBpZiBkYXRhc2V0SXRlbXMgY29udGFpbiB0aGUgc2VsZWN0ZWQgaXRlbSAoY2hlY2sgdGhlIHNlbGVjdGVkIGZsYWcgb24gaXRlbSksIGZpbmQgdGhlIGluZGV4IG9mIHNlbGVjdGVkIGl0ZW0uXG4gICAgICogMi4gaWYgbm90LCBqdXN0IGNoZWNrIGlmIHRoZSBkYXRhdmFsdWUgaXMgcHJvdmlkZWQgYXMgdGhlIGluZGV4IG9uIHRoZSBpdGVtLlxuICAgICAqXG4gICAgICogQHBhcmFtIGRhdGFWYWwgZGF0YXZhbHVlXG4gICAgICovXG4gICAgb25EYXRhdmFsdWVDaGFuZ2UoZGF0YVZhbCkge1xuICAgICAgICBpZiAoIV8uaXNFbXB0eSh0aGlzLmRhdGFzZXRJdGVtcykpIHtcbiAgICAgICAgICAgIGxldCBzZWxlY3RlZEl0ZW0gPSBfLmZpbmQodGhpcy5kYXRhc2V0SXRlbXMsIHsnc2VsZWN0ZWQnOiB0cnVlfSk7XG5cbiAgICAgICAgICAgIGlmICghc2VsZWN0ZWRJdGVtICYmICFfLmlzVW5kZWZpbmVkKGRhdGFWYWwpKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtID0gXy5maW5kKHRoaXMuZGF0YXNldEl0ZW1zLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy50b1N0cmluZyhpdGVtLmluZGV4KSA9PT0gZGF0YVZhbDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXNlbGVjdGVkSXRlbSkge1xuICAgICAgICAgICAgICAgIC8vIHJlc2V0IHRoZSAgbW9kZWwgaWYgdGhlcmUgaXMgbm8gaXRlbSBmb3VuZC5cbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsQnlLZXkgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5jYXB0aW9uID0gJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSYXRpbmdWYWx1ZSA9IHNlbGVjdGVkSXRlbSA/IHNlbGVjdGVkSXRlbS5pbmRleCA6IDA7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYXB0aW9uID0gc2VsZWN0ZWRJdGVtLmxhYmVsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJhdGluZ1ZhbHVlID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yZWFkb25seSkge1xuICAgICAgICAgICAgLy8gd2hlbiBkYXRhc2V0IGlzIG5vdCBnaXZlbiBidXQgZGF0YXZhbHVlIGlzIHByb3ZpZGVkIHdoaWNoIGlzIGludGVnZXJcbiAgICAgICAgICAgIGlmICghdGhpcy5zZWxlY3RlZFJhdGluZ1ZhbHVlICYmICFpc05hTihkYXRhVmFsKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSYXRpbmdWYWx1ZSA9IChwYXJzZUZsb2F0KGRhdGFWYWwpIDw9IHRoaXMubWF4dmFsdWUpID8gZGF0YVZhbCA6IHRoaXMubWF4dmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJhdGluZ3NXaWR0aCA9IHRoaXMuY2FsY3VsYXRlUmF0aW5nc1dpZHRoKGRhdGFWYWwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlUmF0aW5nc1dpZHRoKGRhdGFWYWw/OiBhbnkpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRSYXRpbmcgPSBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0ZWRSYXRpbmdWYWx1ZSksXG4gICAgICAgICAgICBzdGFyV2lkdGggPSAwLjkyNSxcbiAgICAgICAgICAgIG1heFZhbHVlID0gcGFyc2VJbnQodGhpcy5tYXh2YWx1ZSB8fCB0aGlzLmRhdGFzZXRJdGVtcy5sZW5ndGgsIDEwKSB8fCBERUZBVUxUX1JBVElORztcblxuICAgICAgICBzZXRDU1MoXG4gICAgICAgICAgICB0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnJhdGluZ3MtY29udGFpbmVyJykgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgICAnd2lkdGgnLFxuICAgICAgICAgICAgKHN0YXJXaWR0aCAqIG1heFZhbHVlKSArICdlbSdcbiAgICAgICAgKTtcbiAgICAgICAgZGF0YVZhbCA9IGRhdGFWYWwgfHwgdGhpcy5kYXRhdmFsdWU7XG4gICAgICAgIGlmIChkYXRhVmFsID09PSB1bmRlZmluZWQgfHwgZGF0YVZhbCA9PT0gJycgfHwgZGF0YVZhbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5jYXB0aW9uID0gJyc7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZWN0ZWRSYXRpbmcgPD0gbWF4VmFsdWUgJiYgc2VsZWN0ZWRSYXRpbmcgPj0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGVkUmF0aW5nICogc3RhcldpZHRoICsgJ2VtJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZWN0ZWRSYXRpbmcgPiBtYXhWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIG1heFZhbHVlICogc3RhcldpZHRoICsgJ2VtJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdyZWFkb25seScpIHtcbiAgICAgICAgICAgIGlmIChudikge1xuICAgICAgICAgICAgICAgIHRoaXMucmF0aW5nc1dpZHRoID0gdGhpcy5jYWxjdWxhdGVSYXRpbmdzV2lkdGgoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdtYXh2YWx1ZScpIHtcbiAgICAgICAgICAgIHRoaXMucHJlcGFyZVJhdGluZ0RhdGFzZXQoKTtcbiAgICAgICAgICAgIC8vIHJlc2V0IGFsbCB0aGUgaXRlbXMuXG4gICAgICAgICAgICB0aGlzLnJlc2V0RGF0YXNldEl0ZW1zKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uTW91c2VsZWF2ZSgpIHtcbiAgICAgICAgdGhpcy5jYXB0aW9uID0gdGhpcy5kaXNwbGF5VmFsdWUgYXMgc3RyaW5nO1xuICAgIH1cblxuICAgIG9uTW91c2VPdmVyKCRldmVudCwgcmF0ZSkge1xuICAgICAgICB0aGlzLmNhcHRpb24gPSByYXRlLmxhYmVsO1xuICAgIH1cbn1cbiJdfQ==