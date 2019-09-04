import * as tslib_1 from "tslib";
import { FormControlName } from '@angular/forms';
import { BaseFormComponent } from './base-form.component';
var BaseFormCustomComponent = /** @class */ (function (_super) {
    tslib_1.__extends(BaseFormCustomComponent, _super);
    function BaseFormCustomComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._onChange = function () { };
        _this._onTouched = function () { };
        return _this;
    }
    BaseFormCustomComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this._formControl = this.inj.get(FormControlName, null);
    };
    BaseFormCustomComponent.prototype.registerOnChange = function (fn) {
        this._onChange = fn;
    };
    BaseFormCustomComponent.prototype.registerOnTouched = function (fn) {
        this._onTouched = fn;
    };
    BaseFormCustomComponent.prototype.writeValue = function (value) {
        if (this.isDestroyed) {
            return;
        }
        if (this._formControl) {
            this.datavalue = value;
            this.onPropertyChange('datavalue', value);
            this.updatePrevDatavalue(value);
        }
    };
    BaseFormCustomComponent.prototype.invokeOnChange = function (value, $event, valid) {
        // let the angular know about the change
        this._onChange(value);
        if (valid) {
            _super.prototype.invokeOnChange.call(this, value, $event);
        }
    };
    BaseFormCustomComponent.prototype.invokeOnTouched = function ($event) {
        this._onTouched();
        if ($event) {
            this.invokeEventCallback('blur', { $event: $event });
        }
    };
    BaseFormCustomComponent.prototype.invokeOnFocus = function ($event) {
        this.invokeEventCallback('focus', { $event: $event });
    };
    return BaseFormCustomComponent;
}(BaseFormComponent));
export { BaseFormCustomComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1mb3JtLWN1c3RvbS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2Jhc2UvYmFzZS1mb3JtLWN1c3RvbS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBd0IsZUFBZSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFLdkUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFMUQ7SUFBc0QsbURBQWlCO0lBQXZFO1FBQUEscUVBa0RDO1FBL0NhLGVBQVMsR0FBUSxjQUFPLENBQUMsQ0FBQztRQUM1QixnQkFBVSxHQUFRLGNBQU8sQ0FBQyxDQUFDOztJQThDdkMsQ0FBQztJQTVDRywwQ0FBUSxHQUFSO1FBQ0ksaUJBQU0sUUFBUSxXQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVNLGtEQUFnQixHQUF2QixVQUF3QixFQUFFO1FBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFTSxtREFBaUIsR0FBeEIsVUFBeUIsRUFBRTtRQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRU0sNENBQVUsR0FBakIsVUFBa0IsS0FBSztRQUNuQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsT0FBTztTQUNWO1FBQ0QsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ25CLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ25DO0lBQ0wsQ0FBQztJQUVNLGdEQUFjLEdBQXJCLFVBQXNCLEtBQUssRUFBRSxNQUFvQixFQUFFLEtBQWU7UUFDOUQsd0NBQXdDO1FBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFdEIsSUFBSSxLQUFLLEVBQUU7WUFDUCxpQkFBTSxjQUFjLFlBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztJQUVNLGlEQUFlLEdBQXRCLFVBQXVCLE1BQWM7UUFDakMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRWxCLElBQUksTUFBTSxFQUFFO1lBQ1IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxFQUFDLE1BQU0sUUFBQSxFQUFDLENBQUMsQ0FBQztTQUM5QztJQUNMLENBQUM7SUFFUywrQ0FBYSxHQUF2QixVQUF3QixNQUFhO1FBQ2pDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsRUFBQyxNQUFNLFFBQUEsRUFBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUNMLDhCQUFDO0FBQUQsQ0FBQyxBQWxERCxDQUFzRCxpQkFBaUIsR0FrRHRFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29udHJvbFZhbHVlQWNjZXNzb3IsIEZvcm1Db250cm9sTmFtZSB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBub29wIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBCYXNlRm9ybUNvbXBvbmVudCB9IGZyb20gJy4vYmFzZS1mb3JtLmNvbXBvbmVudCc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlRm9ybUN1c3RvbUNvbXBvbmVudCBleHRlbmRzIEJhc2VGb3JtQ29tcG9uZW50IGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uSW5pdCB7XG5cbiAgICBwcml2YXRlIF9mb3JtQ29udHJvbDogRm9ybUNvbnRyb2xOYW1lO1xuICAgIHByb3RlY3RlZCBfb25DaGFuZ2U6IGFueSA9ICgpID0+IHt9O1xuICAgIHByaXZhdGUgX29uVG91Y2hlZDogYW55ID0gKCkgPT4ge307XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy5fZm9ybUNvbnRyb2wgPSB0aGlzLmluai5nZXQoRm9ybUNvbnRyb2xOYW1lLCBudWxsKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVnaXN0ZXJPbkNoYW5nZShmbikge1xuICAgICAgICB0aGlzLl9vbkNoYW5nZSA9IGZuO1xuICAgIH1cblxuICAgIHB1YmxpYyByZWdpc3Rlck9uVG91Y2hlZChmbikge1xuICAgICAgICB0aGlzLl9vblRvdWNoZWQgPSBmbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgd3JpdGVWYWx1ZSh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5pc0Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9mb3JtQ29udHJvbCkge1xuICAgICAgICAgICAgdGhpcy5kYXRhdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMub25Qcm9wZXJ0eUNoYW5nZSgnZGF0YXZhbHVlJywgdmFsdWUpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2RGF0YXZhbHVlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnZva2VPbkNoYW5nZSh2YWx1ZSwgJGV2ZW50PzogRXZlbnQgfCBhbnksIHZhbGlkPzogYm9vbGVhbikge1xuICAgICAgICAvLyBsZXQgdGhlIGFuZ3VsYXIga25vdyBhYm91dCB0aGUgY2hhbmdlXG4gICAgICAgIHRoaXMuX29uQ2hhbmdlKHZhbHVlKTtcblxuICAgICAgICBpZiAodmFsaWQpIHtcbiAgICAgICAgICAgIHN1cGVyLmludm9rZU9uQ2hhbmdlKHZhbHVlLCAkZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGludm9rZU9uVG91Y2hlZCgkZXZlbnQ/OiBFdmVudCkge1xuICAgICAgICB0aGlzLl9vblRvdWNoZWQoKTtcblxuICAgICAgICBpZiAoJGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JsdXInLCB7JGV2ZW50fSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaW52b2tlT25Gb2N1cygkZXZlbnQ6IEV2ZW50KSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnZm9jdXMnLCB7JGV2ZW50fSk7XG4gICAgfVxufVxuIl19