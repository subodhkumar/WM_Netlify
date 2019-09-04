import * as tslib_1 from "tslib";
import { $appDigest, addClass, switchClass } from '@wm/core';
import { BaseFormCustomComponent } from '../../base/base-form-custom.component';
import { styler } from '../../../framework/styler';
var BaseInput = /** @class */ (function (_super) {
    tslib_1.__extends(BaseInput, _super);
    function BaseInput(inj, config) {
        var _this = _super.call(this, inj, config) || this;
        // possible values for ngModelOptions are 'blur' and 'change'
        // default is 'blur'
        _this.ngModelOptions = {
            updateOn: ''
        };
        var updateOn = _this.nativeElement.getAttribute('updateon') || 'blur';
        updateOn = updateOn === 'default' ? 'change' : updateOn;
        _this.ngModelOptions.updateOn = updateOn;
        return _this;
    }
    BaseInput.prototype.onPropertyChange = function (key, nv, ov) {
        // set the class on the input element
        if (key === 'tabindex') {
            return;
        }
        if (key === 'class') {
            if (this.inputEl.nativeElement) {
                switchClass(this.inputEl.nativeElement, nv, ov);
            }
        }
        else if (key === 'datavalue') {
            // update the oldDataValue when the datavalue is modified programmatically
            this.updatePrevDatavalue(nv);
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    // invoke the change callback
    BaseInput.prototype.handleChange = function (newValue) {
        this.invokeOnChange(this.datavalue, { type: 'change' }, this.ngModel.valid);
    };
    // Change event is registered from the template, Prevent the framework from registering one more event
    BaseInput.prototype.handleEvent = function (node, eventName, eventCallback, locals) {
        if (eventName !== 'change' && eventName !== 'blur') {
            _super.prototype.handleEvent.call(this, this.inputEl.nativeElement, eventName, eventCallback, locals);
        }
    };
    // invoke the blur callback
    BaseInput.prototype.handleBlur = function ($event) {
        this.invokeOnTouched($event);
    };
    // Update the model on enter key press
    BaseInput.prototype.flushViewChanges = function (val) {
        this.ngModel.update.next(val);
        $appDigest();
    };
    BaseInput.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        // add the class on the input element
        if (this.class) {
            addClass(this.inputEl.nativeElement, this.class);
        }
        styler(this.inputEl.nativeElement, this);
    };
    return BaseInput;
}(BaseFormCustomComponent));
export { BaseInput };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1pbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGV4dC9iYXNlL2Jhc2UtaW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUdBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU3RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUNoRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFHbkQ7SUFBd0MscUNBQXVCO0lBd0UzRCxtQkFDSSxHQUFhLEVBQ2IsTUFBcUI7UUFGekIsWUFJSSxrQkFBTSxHQUFHLEVBQUUsTUFBTSxDQUFDLFNBSXJCO1FBN0VELDZEQUE2RDtRQUM3RCxvQkFBb0I7UUFDYixvQkFBYyxHQUFHO1lBQ3BCLFFBQVEsRUFBRSxFQUFFO1NBQ2YsQ0FBQztRQXNFRSxJQUFJLFFBQVEsR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxNQUFNLENBQUM7UUFDckUsUUFBUSxHQUFHLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQ3hELEtBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQzs7SUFDNUMsQ0FBQztJQTNEUyxvQ0FBZ0IsR0FBMUIsVUFBMkIsR0FBVyxFQUFFLEVBQU8sRUFBRSxFQUFPO1FBQ3BELHFDQUFxQztRQUNyQyxJQUFJLEdBQUcsS0FBSyxVQUFVLEVBQUU7WUFDcEIsT0FBTztTQUNWO1FBRUQsSUFBSSxHQUFHLEtBQUssT0FBTyxFQUFFO1lBQ2pCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUU7Z0JBQzVCLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDbkQ7U0FDSjthQUFNLElBQUksR0FBRyxLQUFLLFdBQVcsRUFBRTtZQUM1QiwwRUFBMEU7WUFDMUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2hDO2FBQU07WUFDSCxpQkFBTSxnQkFBZ0IsWUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztJQUVELDZCQUE2QjtJQUM3QixnQ0FBWSxHQUFaLFVBQWEsUUFBYTtRQUN0QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRUQsc0dBQXNHO0lBQzVGLCtCQUFXLEdBQXJCLFVBQXNCLElBQWlCLEVBQUUsU0FBaUIsRUFBRSxhQUF1QixFQUFFLE1BQVc7UUFDNUYsSUFBSSxTQUFTLEtBQUssUUFBUSxJQUFJLFNBQVMsS0FBSyxNQUFNLEVBQUU7WUFDaEQsaUJBQU0sV0FBVyxZQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDbkY7SUFDTCxDQUFDO0lBRUQsMkJBQTJCO0lBQzNCLDhCQUFVLEdBQVYsVUFBVyxNQUFNO1FBQ2IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQsc0NBQXNDO0lBQ3RDLG9DQUFnQixHQUFoQixVQUFpQixHQUFHO1FBQ2hCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QixVQUFVLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQsbUNBQWUsR0FBZjtRQUNJLGlCQUFNLGVBQWUsV0FBRSxDQUFDO1FBRXhCLHFDQUFxQztRQUNyQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDWixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3BEO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFXTCxnQkFBQztBQUFELENBQUMsQUFqRkQsQ0FBd0MsdUJBQXVCLEdBaUY5RCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIEVsZW1lbnRSZWYsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOZ01vZGVsIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyAkYXBwRGlnZXN0LCBhZGRDbGFzcywgc3dpdGNoQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEJhc2VGb3JtQ3VzdG9tQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vYmFzZS9iYXNlLWZvcm0tY3VzdG9tLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZUlucHV0IGV4dGVuZHMgQmFzZUZvcm1DdXN0b21Db21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICBwdWJsaWMgY2xhc3M6IHN0cmluZztcblxuICAgIC8vIHBvc3NpYmxlIHZhbHVlcyBmb3IgbmdNb2RlbE9wdGlvbnMgYXJlICdibHVyJyBhbmQgJ2NoYW5nZSdcbiAgICAvLyBkZWZhdWx0IGlzICdibHVyJ1xuICAgIHB1YmxpYyBuZ01vZGVsT3B0aW9ucyA9IHtcbiAgICAgICAgdXBkYXRlT246ICcnXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlZmVyZW5jZSB0byB0aGUgaW5wdXQgZWxlbWVudC4gQWxsIHRoZSBzdHlsZXMgYW5kIGNsYXNzZXMgd2lsbCBiZSBhcHBsaWVkIG9uIHRoaXMgbm9kZS5cbiAgICAgKiBJbnB1dCBjb21wb25lbnRzIG11c3Qgb3ZlcnJpZGUgdGhpc1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBpbnB1dEVsOiBFbGVtZW50UmVmO1xuXG4gICAgLyoqXG4gICAgICogUmVmZXJlbmNlIHRvIHRoZSBuZ01vZGVsIGRpcmVjdGl2ZSBpbnN0YW5jZS5cbiAgICAgKiBVc2VkIHRvIGNoZWNrIHRoZSB2YWxpZGl0eSBvZiB0aGUgaW5wdXRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgbmdNb2RlbDogTmdNb2RlbDtcblxuICAgIHByb3RlY3RlZCBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdjogYW55KSB7XG4gICAgICAgIC8vIHNldCB0aGUgY2xhc3Mgb24gdGhlIGlucHV0IGVsZW1lbnRcbiAgICAgICAgaWYgKGtleSA9PT0gJ3RhYmluZGV4Jykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtleSA9PT0gJ2NsYXNzJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuaW5wdXRFbC5uYXRpdmVFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoQ2xhc3ModGhpcy5pbnB1dEVsLm5hdGl2ZUVsZW1lbnQsIG52LCBvdik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZGF0YXZhbHVlJykge1xuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBvbGREYXRhVmFsdWUgd2hlbiB0aGUgZGF0YXZhbHVlIGlzIG1vZGlmaWVkIHByb2dyYW1tYXRpY2FsbHlcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldkRhdGF2YWx1ZShudik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGludm9rZSB0aGUgY2hhbmdlIGNhbGxiYWNrXG4gICAgaGFuZGxlQ2hhbmdlKG5ld1ZhbHVlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwge3R5cGU6ICdjaGFuZ2UnfSwgdGhpcy5uZ01vZGVsLnZhbGlkKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgZXZlbnQgaXMgcmVnaXN0ZXJlZCBmcm9tIHRoZSB0ZW1wbGF0ZSwgUHJldmVudCB0aGUgZnJhbWV3b3JrIGZyb20gcmVnaXN0ZXJpbmcgb25lIG1vcmUgZXZlbnRcbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBldmVudENhbGxiYWNrOiBGdW5jdGlvbiwgbG9jYWxzOiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50TmFtZSAhPT0gJ2NoYW5nZScgJiYgZXZlbnROYW1lICE9PSAnYmx1cicpIHtcbiAgICAgICAgICAgIHN1cGVyLmhhbmRsZUV2ZW50KHRoaXMuaW5wdXRFbC5uYXRpdmVFbGVtZW50LCBldmVudE5hbWUsIGV2ZW50Q2FsbGJhY2ssIGxvY2Fscyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpbnZva2UgdGhlIGJsdXIgY2FsbGJhY2tcbiAgICBoYW5kbGVCbHVyKCRldmVudCkge1xuICAgICAgICB0aGlzLmludm9rZU9uVG91Y2hlZCgkZXZlbnQpO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgbW9kZWwgb24gZW50ZXIga2V5IHByZXNzXG4gICAgZmx1c2hWaWV3Q2hhbmdlcyh2YWwpIHtcbiAgICAgICAgdGhpcy5uZ01vZGVsLnVwZGF0ZS5uZXh0KHZhbCk7XG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuXG4gICAgICAgIC8vIGFkZCB0aGUgY2xhc3Mgb24gdGhlIGlucHV0IGVsZW1lbnRcbiAgICAgICAgaWYgKHRoaXMuY2xhc3MpIHtcbiAgICAgICAgICAgIGFkZENsYXNzKHRoaXMuaW5wdXRFbC5uYXRpdmVFbGVtZW50LCB0aGlzLmNsYXNzKTtcbiAgICAgICAgfVxuICAgICAgICBzdHlsZXIodGhpcy5pbnB1dEVsLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBjb25maWc6IElXaWRnZXRDb25maWdcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBjb25maWcpO1xuICAgICAgICBsZXQgdXBkYXRlT24gPSB0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd1cGRhdGVvbicpIHx8ICdibHVyJztcbiAgICAgICAgdXBkYXRlT24gPSB1cGRhdGVPbiA9PT0gJ2RlZmF1bHQnID8gJ2NoYW5nZScgOiB1cGRhdGVPbjtcbiAgICAgICAgdGhpcy5uZ01vZGVsT3B0aW9ucy51cGRhdGVPbiA9IHVwZGF0ZU9uO1xuICAgIH1cbn1cbiJdfQ==