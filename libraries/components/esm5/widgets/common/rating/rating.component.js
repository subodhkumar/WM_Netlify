import * as tslib_1 from "tslib";
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { generateGUId, setCSS } from '@wm/core';
import { styler } from '../../framework/styler';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './rating.props';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { getOrderedDataset } from '../../../utils/form-utils';
var DEFAULT_CLS = 'app-ratings';
var WIDGET_CONFIG = { widgetType: 'wm-rating', hostClass: DEFAULT_CLS };
var MAX_RATING = 10;
var DEFAULT_RATING = 5;
var RatingComponent = /** @class */ (function (_super) {
    tslib_1.__extends(RatingComponent, _super);
    function RatingComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this._id = generateGUId();
        styler(_this.nativeElement, _this);
        // prepare the rating options on dataset ready.
        var datasetSubscription = _this.dataset$.subscribe(function () {
            _this.prepareRatingDataset();
        });
        _this.registerDestroyListener(function () { return datasetSubscription.unsubscribe(); });
        // listen to changes in datavalue.
        var datavalueSubscription = _this.datavalue$.subscribe(function () { return _this.onDatavalueChange(_this.datavalue); });
        _this.registerDestroyListener(function () { return datavalueSubscription.unsubscribe(); });
        return _this;
    }
    Object.defineProperty(RatingComponent.prototype, "selectedRatingValue", {
        get: function () {
            return this._selectedRatingValue;
        },
        set: function (val) {
            this._selectedRatingValue = val;
            this.calculateRatingsWidth();
        },
        enumerable: true,
        configurable: true
    });
    // Change event is registered from the template, Prevent the framework from registering one more event
    RatingComponent.prototype.handleEvent = function (node, eventName, eventCallback, locals) {
        if (eventName !== 'change' && eventName !== 'blur') {
            _super.prototype.handleEvent.call(this, this.ratingEl.nativeElement, eventName, eventCallback, locals);
        }
    };
    // This function returns the rating widget dataset containing the index, value and label
    RatingComponent.prototype.prepareRatingDataset = function () {
        if (!this.datasetItems.length) {
            this.ratingItems = [];
            this.caption = '';
        }
        var ratingItems = [];
        var data = this.datasetItems;
        var maxvalue = parseInt(this.maxvalue || this.datasetItems.length, 10);
        var maxValue = (maxvalue > MAX_RATING ? MAX_RATING : maxvalue) || DEFAULT_RATING;
        /**
         * 1. If datasetItems.length is more than maxValue (i.e. 10 ratings) then just extract maxValue of items from datasetItems.
         * 2. If datasetItems are not available then prepare ratings value depending on maxvalue. eg: 1,2,3 .. upto maxvalue
         * 3. If maxvalue / i value is more than datasetItems length, prepare default rating items for i values more than datasetItems.length
         */
        if (data.length && data.length > maxValue) {
            data = _.slice(data, 0, maxValue);
        }
        for (var i = maxValue; i > 0; i--) {
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
    };
    RatingComponent.prototype.onRatingClick = function ($event, rate) {
        this.selectedRatingValue = rate.index;
        this.modelByKey = rate.key;
        // support if the caption is binded in the old projects for backward compatibility
        if (!this.showcaptions) {
            this.caption = rate.label;
        }
        this.invokeOnTouched();
        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
    };
    // Update the selected flag on datasetItems and assign the ratingValue.
    /**
     * On datavalue change, update the caption, selectedRatingValue.
     * 1. if datasetItems contain the selected item (check the selected flag on item), find the index of selected item.
     * 2. if not, just check if the datavalue is provided as the index on the item.
     *
     * @param dataVal datavalue
     */
    RatingComponent.prototype.onDatavalueChange = function (dataVal) {
        if (!_.isEmpty(this.datasetItems)) {
            var selectedItem = _.find(this.datasetItems, { 'selected': true });
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
    };
    RatingComponent.prototype.calculateRatingsWidth = function (dataVal) {
        var selectedRating = parseFloat(this.selectedRatingValue), starWidth = 0.925, maxValue = parseInt(this.maxvalue || this.datasetItems.length, 10) || DEFAULT_RATING;
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
    };
    RatingComponent.prototype.onPropertyChange = function (key, nv, ov) {
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
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    RatingComponent.prototype.onMouseleave = function () {
        this.caption = this.displayValue;
    };
    RatingComponent.prototype.onMouseOver = function ($event, rate) {
        this.caption = rate.label;
    };
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
    RatingComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    RatingComponent.propDecorators = {
        ratingEl: [{ type: ViewChild, args: ['ratingInput', { read: ElementRef },] }]
    };
    return RatingComponent;
}(DatasetAwareFormComponent));
export { RatingComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF0aW5nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vcmF0aW5nL3JhdGluZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0UsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFaEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzNGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNqRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUk5RCxJQUFNLFdBQVcsR0FBRyxhQUFhLENBQUM7QUFDbEMsSUFBTSxhQUFhLEdBQUcsRUFBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQUV4RSxJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEIsSUFBTSxjQUFjLEdBQUcsQ0FBQyxDQUFDO0FBRXpCO0lBUXFDLDJDQUF5QjtJQTBCMUQseUJBQVksR0FBYTtRQUF6QixZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FhNUI7UUFaRyxLQUFJLENBQUMsR0FBRyxHQUFHLFlBQVksRUFBRSxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxLQUFJLENBQUMsYUFBYSxFQUFFLEtBQUksQ0FBQyxDQUFDO1FBRWpDLCtDQUErQztRQUMvQyxJQUFNLG1CQUFtQixHQUFHLEtBQUksQ0FBQyxRQUFRLENB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RUFBRTtZQUMzQixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM1Qix1QkFBdUI7WUFDdkIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7U0FDNUI7YUFBTTtZQUNILGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRUQsc0NBQVksR0FBWjtRQUNJLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQXNCLENBQUM7SUFDL0MsQ0FBQztJQUVELHFDQUFXLEdBQVgsVUFBWSxNQUFNLEVBQUUsSUFBSTtRQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDOUIsQ0FBQztJQTlMTSwrQkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFUNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxZQUFZO29CQUN0Qix3d0NBQXNDO29CQUN0QyxTQUFTLEVBQUU7d0JBQ1Asd0JBQXdCLENBQUMsZUFBZSxDQUFDO3dCQUN6QyxrQkFBa0IsQ0FBQyxlQUFlLENBQUM7cUJBQ3RDO2lCQUNKOzs7O2dCQXpCK0IsUUFBUTs7OzJCQXlDbkMsU0FBUyxTQUFDLGFBQWEsRUFBRSxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUM7O0lBaUxoRCxzQkFBQztDQUFBLEFBeE1ELENBUXFDLHlCQUF5QixHQWdNN0Q7U0FoTVksZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5qZWN0b3IsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBnZW5lcmF0ZUdVSWQsIHNldENTUyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9yYXRpbmcucHJvcHMnO1xuaW1wb3J0IHsgRGF0YXNldEF3YXJlRm9ybUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2UvZGF0YXNldC1hd2FyZS1mb3JtLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBnZXRPcmRlcmVkRGF0YXNldCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2Zvcm0tdXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1yYXRpbmdzJztcbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLXJhdGluZycsIGhvc3RDbGFzczogREVGQVVMVF9DTFN9O1xuXG5jb25zdCBNQVhfUkFUSU5HID0gMTA7XG5jb25zdCBERUZBVUxUX1JBVElORyA9IDU7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtUmF0aW5nXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3JhdGluZy5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihSYXRpbmdDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoUmF0aW5nQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgUmF0aW5nQ29tcG9uZW50IGV4dGVuZHMgRGF0YXNldEF3YXJlRm9ybUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBjYXB0aW9uOiBzdHJpbmc7XG4gICAgcHVibGljIHNob3djYXB0aW9uczogYm9vbGVhbjtcbiAgICBwdWJsaWMgbWF4dmFsdWU7XG5cbiAgICBwcml2YXRlIF9zZWxlY3RlZFJhdGluZ1ZhbHVlO1xuICAgIHB1YmxpYyByYXRpbmdzV2lkdGg7XG4gICAgcHJpdmF0ZSByYXRpbmdJdGVtcztcbiAgICBwcml2YXRlIF9pZDtcblxuICAgIHB1YmxpYyBpY29uc2l6ZTogc3RyaW5nO1xuICAgIHB1YmxpYyBpY29uY29sb3I6IHN0cmluZztcbiAgICBwdWJsaWMgb25Gb2N1czogYW55O1xuICAgIEBWaWV3Q2hpbGQoJ3JhdGluZ0lucHV0Jywge3JlYWQ6IEVsZW1lbnRSZWZ9KSByYXRpbmdFbDogRWxlbWVudFJlZjtcblxuICAgIGdldCBzZWxlY3RlZFJhdGluZ1ZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRSYXRpbmdWYWx1ZTtcbiAgICB9XG5cbiAgICBzZXQgc2VsZWN0ZWRSYXRpbmdWYWx1ZSh2YWwpIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRSYXRpbmdWYWx1ZSA9IHZhbDtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVSYXRpbmdzV2lkdGgoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHRoaXMuX2lkID0gZ2VuZXJhdGVHVUlkKCk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuXG4gICAgICAgIC8vIHByZXBhcmUgdGhlIHJhdGluZyBvcHRpb25zIG9uIGRhdGFzZXQgcmVhZHkuXG4gICAgICAgIGNvbnN0IGRhdGFzZXRTdWJzY3JpcHRpb24gPSB0aGlzLmRhdGFzZXQkLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByZXBhcmVSYXRpbmdEYXRhc2V0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IGRhdGFzZXRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG5cbiAgICAgICAgLy8gbGlzdGVuIHRvIGNoYW5nZXMgaW4gZGF0YXZhbHVlLlxuICAgICAgICBjb25zdCBkYXRhdmFsdWVTdWJzY3JpcHRpb24gPSB0aGlzLmRhdGF2YWx1ZSQuc3Vic2NyaWJlKCgpID0+IHRoaXMub25EYXRhdmFsdWVDaGFuZ2UodGhpcy5kYXRhdmFsdWUpKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBkYXRhdmFsdWVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIGV2ZW50IGlzIHJlZ2lzdGVyZWQgZnJvbSB0aGUgdGVtcGxhdGUsIFByZXZlbnQgdGhlIGZyYW1ld29yayBmcm9tIHJlZ2lzdGVyaW5nIG9uZSBtb3JlIGV2ZW50XG4gICAgcHJvdGVjdGVkIGhhbmRsZUV2ZW50KG5vZGU6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgZXZlbnRDYWxsYmFjazogRnVuY3Rpb24sIGxvY2FsczogYW55KSB7XG4gICAgICAgIGlmIChldmVudE5hbWUgIT09ICdjaGFuZ2UnICYmIGV2ZW50TmFtZSAhPT0gJ2JsdXInKSB7XG4gICAgICAgICAgICBzdXBlci5oYW5kbGVFdmVudCh0aGlzLnJhdGluZ0VsLm5hdGl2ZUVsZW1lbnQsIGV2ZW50TmFtZSwgZXZlbnRDYWxsYmFjaywgbG9jYWxzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmF0aW5nIHdpZGdldCBkYXRhc2V0IGNvbnRhaW5pbmcgdGhlIGluZGV4LCB2YWx1ZSBhbmQgbGFiZWxcbiAgICBwcml2YXRlIHByZXBhcmVSYXRpbmdEYXRhc2V0KCkge1xuICAgICAgICBpZiAoIXRoaXMuZGF0YXNldEl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5yYXRpbmdJdGVtcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jYXB0aW9uID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmF0aW5nSXRlbXMgPSBbXTtcbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLmRhdGFzZXRJdGVtcztcbiAgICAgICAgY29uc3QgbWF4dmFsdWUgPSBwYXJzZUludCh0aGlzLm1heHZhbHVlIHx8IHRoaXMuZGF0YXNldEl0ZW1zLmxlbmd0aCwgMTApO1xuICAgICAgICBjb25zdCBtYXhWYWx1ZSA9IChtYXh2YWx1ZSA+IE1BWF9SQVRJTkcgPyBNQVhfUkFUSU5HIDogbWF4dmFsdWUpIHx8IERFRkFVTFRfUkFUSU5HO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAxLiBJZiBkYXRhc2V0SXRlbXMubGVuZ3RoIGlzIG1vcmUgdGhhbiBtYXhWYWx1ZSAoaS5lLiAxMCByYXRpbmdzKSB0aGVuIGp1c3QgZXh0cmFjdCBtYXhWYWx1ZSBvZiBpdGVtcyBmcm9tIGRhdGFzZXRJdGVtcy5cbiAgICAgICAgICogMi4gSWYgZGF0YXNldEl0ZW1zIGFyZSBub3QgYXZhaWxhYmxlIHRoZW4gcHJlcGFyZSByYXRpbmdzIHZhbHVlIGRlcGVuZGluZyBvbiBtYXh2YWx1ZS4gZWc6IDEsMiwzIC4uIHVwdG8gbWF4dmFsdWVcbiAgICAgICAgICogMy4gSWYgbWF4dmFsdWUgLyBpIHZhbHVlIGlzIG1vcmUgdGhhbiBkYXRhc2V0SXRlbXMgbGVuZ3RoLCBwcmVwYXJlIGRlZmF1bHQgcmF0aW5nIGl0ZW1zIGZvciBpIHZhbHVlcyBtb3JlIHRoYW4gZGF0YXNldEl0ZW1zLmxlbmd0aFxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoICYmIGRhdGEubGVuZ3RoID4gbWF4VmFsdWUpIHtcbiAgICAgICAgICAgIGRhdGEgPSBfLnNsaWNlKGRhdGEsIDAsIG1heFZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSBtYXhWYWx1ZTsgaSA+IDA7IGktLSkge1xuICAgICAgICAgICAgaWYgKCFkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJhdGluZ0l0ZW1zLnB1c2goe2tleTogaSwgdmFsdWU6IGksIGluZGV4OiBpLCBsYWJlbDogaX0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA+IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhdGluZ0l0ZW1zLnB1c2goe2tleTogaSwgdmFsdWU6IGksIGluZGV4OiBpLCBsYWJlbDogaX0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBnZXRPcmRlcmVkRGF0YXNldChkYXRhLCAnaW5kZXg6ZGVzYycpO1xuICAgICAgICAgICAgICAgICAgICByYXRpbmdJdGVtcyA9IHJhdGluZ0l0ZW1zLmNvbmNhdChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yYXRpbmdJdGVtcyA9IHJhdGluZ0l0ZW1zO1xuICAgICAgICBpZiAoIWRhdGEubGVuZ3RoKSB7IC8vIGNvbnN0cnVjdHMgZGVmYXVsdCBkYXRhc2V0SXRlbXMgd2hlbiB0aGVyZSBpcyBubyBkYXRhc2V0IGJpbmRpbmcuXG4gICAgICAgICAgICB0aGlzLmRhdGFzZXRJdGVtcyA9IHJhdGluZ0l0ZW1zO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub25EYXRhdmFsdWVDaGFuZ2UodGhpcy5kYXRhdmFsdWUpO1xuICAgIH1cblxuICAgIG9uUmF0aW5nQ2xpY2soJGV2ZW50LCByYXRlKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRSYXRpbmdWYWx1ZSA9IHJhdGUuaW5kZXg7XG4gICAgICAgIHRoaXMubW9kZWxCeUtleSA9IHJhdGUua2V5O1xuXG4gICAgICAgIC8vIHN1cHBvcnQgaWYgdGhlIGNhcHRpb24gaXMgYmluZGVkIGluIHRoZSBvbGQgcHJvamVjdHMgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICAgICAgaWYgKCF0aGlzLnNob3djYXB0aW9ucykge1xuICAgICAgICAgICAgdGhpcy5jYXB0aW9uID0gcmF0ZS5sYWJlbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW52b2tlT25Ub3VjaGVkKCk7XG4gICAgICAgIC8vIGludm9rZSBvbiBkYXRhdmFsdWUgY2hhbmdlLlxuICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHRoaXMuZGF0YXZhbHVlLCAkZXZlbnQgfHwge30sIHRydWUpO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgc2VsZWN0ZWQgZmxhZyBvbiBkYXRhc2V0SXRlbXMgYW5kIGFzc2lnbiB0aGUgcmF0aW5nVmFsdWUuXG4gICAgLyoqXG4gICAgICogT24gZGF0YXZhbHVlIGNoYW5nZSwgdXBkYXRlIHRoZSBjYXB0aW9uLCBzZWxlY3RlZFJhdGluZ1ZhbHVlLlxuICAgICAqIDEuIGlmIGRhdGFzZXRJdGVtcyBjb250YWluIHRoZSBzZWxlY3RlZCBpdGVtIChjaGVjayB0aGUgc2VsZWN0ZWQgZmxhZyBvbiBpdGVtKSwgZmluZCB0aGUgaW5kZXggb2Ygc2VsZWN0ZWQgaXRlbS5cbiAgICAgKiAyLiBpZiBub3QsIGp1c3QgY2hlY2sgaWYgdGhlIGRhdGF2YWx1ZSBpcyBwcm92aWRlZCBhcyB0aGUgaW5kZXggb24gdGhlIGl0ZW0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0YVZhbCBkYXRhdmFsdWVcbiAgICAgKi9cbiAgICBvbkRhdGF2YWx1ZUNoYW5nZShkYXRhVmFsKSB7XG4gICAgICAgIGlmICghXy5pc0VtcHR5KHRoaXMuZGF0YXNldEl0ZW1zKSkge1xuICAgICAgICAgICAgbGV0IHNlbGVjdGVkSXRlbSA9IF8uZmluZCh0aGlzLmRhdGFzZXRJdGVtcywgeydzZWxlY3RlZCc6IHRydWV9KTtcblxuICAgICAgICAgICAgaWYgKCFzZWxlY3RlZEl0ZW0gJiYgIV8uaXNVbmRlZmluZWQoZGF0YVZhbCkpIHtcbiAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW0gPSBfLmZpbmQodGhpcy5kYXRhc2V0SXRlbXMsIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLnRvU3RyaW5nKGl0ZW0uaW5kZXgpID09PSBkYXRhVmFsO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZEl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghc2VsZWN0ZWRJdGVtKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVzZXQgdGhlICBtb2RlbCBpZiB0aGVyZSBpcyBubyBpdGVtIGZvdW5kLlxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWxCeUtleSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLmNhcHRpb24gPSAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJhdGluZ1ZhbHVlID0gc2VsZWN0ZWRJdGVtID8gc2VsZWN0ZWRJdGVtLmluZGV4IDogMDtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZEl0ZW0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhcHRpb24gPSBzZWxlY3RlZEl0ZW0ubGFiZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkUmF0aW5nVmFsdWUgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJlYWRvbmx5KSB7XG4gICAgICAgICAgICAvLyB3aGVuIGRhdGFzZXQgaXMgbm90IGdpdmVuIGJ1dCBkYXRhdmFsdWUgaXMgcHJvdmlkZWQgd2hpY2ggaXMgaW50ZWdlclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGVkUmF0aW5nVmFsdWUgJiYgIWlzTmFOKGRhdGFWYWwpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJhdGluZ1ZhbHVlID0gKHBhcnNlRmxvYXQoZGF0YVZhbCkgPD0gdGhpcy5tYXh2YWx1ZSkgPyBkYXRhVmFsIDogdGhpcy5tYXh2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucmF0aW5nc1dpZHRoID0gdGhpcy5jYWxjdWxhdGVSYXRpbmdzV2lkdGgoZGF0YVZhbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYWxjdWxhdGVSYXRpbmdzV2lkdGgoZGF0YVZhbD86IGFueSkge1xuICAgICAgICBjb25zdCBzZWxlY3RlZFJhdGluZyA9IHBhcnNlRmxvYXQodGhpcy5zZWxlY3RlZFJhdGluZ1ZhbHVlKSxcbiAgICAgICAgICAgIHN0YXJXaWR0aCA9IDAuOTI1LFxuICAgICAgICAgICAgbWF4VmFsdWUgPSBwYXJzZUludCh0aGlzLm1heHZhbHVlIHx8IHRoaXMuZGF0YXNldEl0ZW1zLmxlbmd0aCwgMTApIHx8IERFRkFVTFRfUkFUSU5HO1xuXG4gICAgICAgIHNldENTUyhcbiAgICAgICAgICAgIHRoaXMubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcucmF0aW5ncy1jb250YWluZXInKSBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICAgICd3aWR0aCcsXG4gICAgICAgICAgICAoc3RhcldpZHRoICogbWF4VmFsdWUpICsgJ2VtJ1xuICAgICAgICApO1xuICAgICAgICBkYXRhVmFsID0gZGF0YVZhbCB8fCB0aGlzLmRhdGF2YWx1ZTtcbiAgICAgICAgaWYgKGRhdGFWYWwgPT09IHVuZGVmaW5lZCB8fCBkYXRhVmFsID09PSAnJyB8fCBkYXRhVmFsID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmNhcHRpb24gPSAnJztcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZFJhdGluZyA8PSBtYXhWYWx1ZSAmJiBzZWxlY3RlZFJhdGluZyA+PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWRSYXRpbmcgKiBzdGFyV2lkdGggKyAnZW0nO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZFJhdGluZyA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gbWF4VmFsdWUgKiBzdGFyV2lkdGggKyAnZW0nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3JlYWRvbmx5Jykge1xuICAgICAgICAgICAgaWYgKG52KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yYXRpbmdzV2lkdGggPSB0aGlzLmNhbGN1bGF0ZVJhdGluZ3NXaWR0aCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ21heHZhbHVlJykge1xuICAgICAgICAgICAgdGhpcy5wcmVwYXJlUmF0aW5nRGF0YXNldCgpO1xuICAgICAgICAgICAgLy8gcmVzZXQgYWxsIHRoZSBpdGVtcy5cbiAgICAgICAgICAgIHRoaXMucmVzZXREYXRhc2V0SXRlbXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Nb3VzZWxlYXZlKCkge1xuICAgICAgICB0aGlzLmNhcHRpb24gPSB0aGlzLmRpc3BsYXlWYWx1ZSBhcyBzdHJpbmc7XG4gICAgfVxuXG4gICAgb25Nb3VzZU92ZXIoJGV2ZW50LCByYXRlKSB7XG4gICAgICAgIHRoaXMuY2FwdGlvbiA9IHJhdGUubGFiZWw7XG4gICAgfVxufVxuIl19