import * as tslib_1 from "tslib";
import { DataSource } from '@wm/core';
import { StylableComponent } from './stylable.component';
var BaseFormComponent = /** @class */ (function (_super) {
    tslib_1.__extends(BaseFormComponent, _super);
    function BaseFormComponent(inj, config, initPromise) {
        var _this = _super.call(this, inj, config, initPromise) || this;
        _this.inj = inj;
        _this.binddatavalue = _this.$element.attr('datavalue.bind');
        return _this;
    }
    /**
     * Responsible for updating the variable bound to the widget's datavalue property.
     * @param value
     */
    BaseFormComponent.prototype.updateBoundVariable = function (value) {
        var binddatavalue = this.binddatavalue;
        // return if the variable bound is not static.
        if (this.datavaluesource && this.datavaluesource.execute(DataSource.Operation.IS_API_AWARE)) {
            return;
        }
        else if (this.datavaluesource && !this.datavaluesource.twoWayBinding) {
            return;
        }
        // return if widget is bound.
        if (!binddatavalue || binddatavalue.startsWith('Widgets.') || binddatavalue.startsWith('itemRef.currentItemWidgets')) {
            return;
        }
        binddatavalue = binddatavalue.replace(/\[\$i\]/g, '[0]');
        // In case of list widget context will be the listItem.
        if (_.has(this.context, binddatavalue.split('.')[0])) {
            _.set(this.context, binddatavalue, value);
        }
        else {
            _.set(this.viewParent, binddatavalue, value);
        }
    };
    BaseFormComponent.prototype.invokeOnChange = function (value, $event) {
        // invoke the event callback
        if ($event) {
            if (this.datavalue !== this.prevDatavalue) {
                this.updateBoundVariable(value);
                this.invokeEventCallback('change', {
                    $event: $event,
                    newVal: value,
                    oldVal: this.prevDatavalue
                });
            }
        }
        // update the previous value
        this.prevDatavalue = value;
    };
    BaseFormComponent.prototype.updatePrevDatavalue = function (val) {
        this.prevDatavalue = val;
    };
    return BaseFormComponent;
}(StylableComponent));
export { BaseFormComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1mb3JtLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vYmFzZS9iYXNlLWZvcm0uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXRDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBS3pEO0lBQWdELDZDQUFpQjtJQU03RCwyQkFDYyxHQUFhLEVBQ3ZCLE1BQXFCLEVBQ3JCLFdBQTBCO1FBSDlCLFlBS0ksa0JBQU0sR0FBRyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsU0FFbEM7UUFOYSxTQUFHLEdBQUgsR0FBRyxDQUFVO1FBS3ZCLEtBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7SUFDOUQsQ0FBQztJQUVEOzs7T0FHRztJQUNILCtDQUFtQixHQUFuQixVQUFvQixLQUFLO1FBQ3JCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFFdkMsOENBQThDO1FBQzlDLElBQUksSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ3pGLE9BQU87U0FDVjthQUFNLElBQUksSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFO1lBQ2hFLE9BQU87U0FDZDtRQUVELDZCQUE2QjtRQUM3QixJQUFJLENBQUMsYUFBYSxJQUFJLGFBQWEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksYUFBYSxDQUFDLFVBQVUsQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFO1lBQ2xILE9BQU87U0FDVjtRQUVELGFBQWEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV6RCx1REFBdUQ7UUFDdkQsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2xELENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDN0M7YUFBTTtZQUNILENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDaEQ7SUFDTCxDQUFDO0lBRVMsMENBQWMsR0FBeEIsVUFBeUIsS0FBSyxFQUFFLE1BQWM7UUFDMUMsNEJBQTRCO1FBQzVCLElBQUksTUFBTSxFQUFFO1lBQ1IsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRTtvQkFDL0IsTUFBTSxRQUFBO29CQUNOLE1BQU0sRUFBRSxLQUFLO29CQUNiLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYTtpQkFDN0IsQ0FBQyxDQUFDO2FBQ047U0FDSjtRQUNELDRCQUE0QjtRQUM1QixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUMvQixDQUFDO0lBRVMsK0NBQW1CLEdBQTdCLFVBQThCLEdBQVE7UUFDbEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7SUFDN0IsQ0FBQztJQUNMLHdCQUFDO0FBQUQsQ0FBQyxBQS9ERCxDQUFnRCxpQkFBaUIsR0ErRGhFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgRGF0YVNvdXJjZSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZUZvcm1Db21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCB7XG4gICAgcHVibGljIGRhdGF2YWx1ZTtcbiAgICBwcml2YXRlIHByZXZEYXRhdmFsdWU7XG4gICAgcHJvdGVjdGVkIGJpbmRkYXRhdmFsdWU6IHN0cmluZztcbiAgICBwcml2YXRlIGRhdGF2YWx1ZXNvdXJjZTogYW55O1xuXG4gICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcm90ZWN0ZWQgaW5qOiBJbmplY3RvcixcbiAgICAgICAgY29uZmlnOiBJV2lkZ2V0Q29uZmlnLFxuICAgICAgICBpbml0UHJvbWlzZT86IFByb21pc2U8YW55PlxuICAgICkge1xuICAgICAgICBzdXBlcihpbmosIGNvbmZpZywgaW5pdFByb21pc2UpO1xuICAgICAgICB0aGlzLmJpbmRkYXRhdmFsdWUgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGF2YWx1ZS5iaW5kJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzcG9uc2libGUgZm9yIHVwZGF0aW5nIHRoZSB2YXJpYWJsZSBib3VuZCB0byB0aGUgd2lkZ2V0J3MgZGF0YXZhbHVlIHByb3BlcnR5LlxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqL1xuICAgIHVwZGF0ZUJvdW5kVmFyaWFibGUodmFsdWUpIHtcbiAgICAgICAgbGV0IGJpbmRkYXRhdmFsdWUgPSB0aGlzLmJpbmRkYXRhdmFsdWU7XG5cbiAgICAgICAgLy8gcmV0dXJuIGlmIHRoZSB2YXJpYWJsZSBib3VuZCBpcyBub3Qgc3RhdGljLlxuICAgICAgICBpZiAodGhpcy5kYXRhdmFsdWVzb3VyY2UgJiYgdGhpcy5kYXRhdmFsdWVzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5JU19BUElfQVdBUkUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5kYXRhdmFsdWVzb3VyY2UgJiYgIXRoaXMuZGF0YXZhbHVlc291cmNlLnR3b1dheUJpbmRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZXR1cm4gaWYgd2lkZ2V0IGlzIGJvdW5kLlxuICAgICAgICBpZiAoIWJpbmRkYXRhdmFsdWUgfHwgYmluZGRhdGF2YWx1ZS5zdGFydHNXaXRoKCdXaWRnZXRzLicpIHx8IGJpbmRkYXRhdmFsdWUuc3RhcnRzV2l0aCgnaXRlbVJlZi5jdXJyZW50SXRlbVdpZGdldHMnKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmluZGRhdGF2YWx1ZSA9IGJpbmRkYXRhdmFsdWUucmVwbGFjZSgvXFxbXFwkaVxcXS9nLCAnWzBdJyk7XG5cbiAgICAgICAgLy8gSW4gY2FzZSBvZiBsaXN0IHdpZGdldCBjb250ZXh0IHdpbGwgYmUgdGhlIGxpc3RJdGVtLlxuICAgICAgICBpZiAoXy5oYXModGhpcy5jb250ZXh0LCBiaW5kZGF0YXZhbHVlLnNwbGl0KCcuJylbMF0pKSB7XG4gICAgICAgICAgICBfLnNldCh0aGlzLmNvbnRleHQsIGJpbmRkYXRhdmFsdWUsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uc2V0KHRoaXMudmlld1BhcmVudCwgYmluZGRhdGF2YWx1ZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGludm9rZU9uQ2hhbmdlKHZhbHVlLCAkZXZlbnQ/OiBFdmVudCkge1xuICAgICAgICAvLyBpbnZva2UgdGhlIGV2ZW50IGNhbGxiYWNrXG4gICAgICAgIGlmICgkZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGF2YWx1ZSAhPT0gdGhpcy5wcmV2RGF0YXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVCb3VuZFZhcmlhYmxlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2NoYW5nZScsIHtcbiAgICAgICAgICAgICAgICAgICAgJGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICBuZXdWYWw6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBvbGRWYWw6IHRoaXMucHJldkRhdGF2YWx1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgcHJldmlvdXMgdmFsdWVcbiAgICAgICAgdGhpcy5wcmV2RGF0YXZhbHVlID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHVwZGF0ZVByZXZEYXRhdmFsdWUodmFsOiBhbnkpIHtcbiAgICAgICAgdGhpcy5wcmV2RGF0YXZhbHVlID0gdmFsO1xuICAgIH1cbn1cbiJdfQ==