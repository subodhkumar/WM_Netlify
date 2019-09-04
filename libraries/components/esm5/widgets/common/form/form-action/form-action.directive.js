import * as tslib_1 from "tslib";
import { Directive, Injector, Optional } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './form-action.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { FormComponent } from '../form.component';
var WIDGET_CONFIG = { widgetType: 'wm-form-action', hostClass: '' };
var FormActionDirective = /** @class */ (function (_super) {
    tslib_1.__extends(FormActionDirective, _super);
    function FormActionDirective(inj, form) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.form = form;
        return _this;
    }
    FormActionDirective.prototype.populateAction = function () {
        this.buttonDef = {
            key: this.key || this.binding,
            displayName: this['display-name'],
            show: this.show,
            class: this.class ? this.class : (this['widget-type'] === 'button' ? 'btn-secondary' : ''),
            iconclass: this.iconclass || '',
            title: _.isUndefined(this.title) ? (this['display-name'] || '') : this.title,
            action: this.action,
            accessroles: this.accessroles,
            shortcutkey: this.shortcutkey,
            disabled: this.disabled,
            tabindex: this.tabindex,
            iconname: this.iconname,
            type: this.type,
            updateMode: this['update-mode'],
            position: this.position,
            widgetType: this['widget-type'],
            hyperlink: this.hyperlink,
            target: this.target
        };
        this._propsInitialized = true;
    };
    FormActionDirective.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.populateAction();
        this.form.registerActions(this.buttonDef);
    };
    FormActionDirective.prototype.onPropertyChange = function (key, nv, ov) {
        if (!this._propsInitialized) {
            return;
        }
        switch (key) {
            case 'display-name':
                this.buttonDef.displayName = nv;
            default:
                this.buttonDef[key] = nv;
                break;
        }
    };
    FormActionDirective.initializeProps = registerProps();
    FormActionDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmFormAction]',
                    providers: [
                        provideAsWidgetRef(FormActionDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    FormActionDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: FormComponent, decorators: [{ type: Optional }] }
    ]; };
    return FormActionDirective;
}(BaseComponent));
export { FormActionDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1hY3Rpb24uZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9mb3JtL2Zvcm0tYWN0aW9uL2Zvcm0tYWN0aW9uLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQVUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXRFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSWxELElBQU0sYUFBYSxHQUFHLEVBQUMsVUFBVSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUMsQ0FBQztBQUVwRTtJQU15QywrQ0FBYTtJQXlCbEQsNkJBQVksR0FBYSxFQUFxQixJQUFtQjtRQUFqRSxZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FDNUI7UUFGNkMsVUFBSSxHQUFKLElBQUksQ0FBZTs7SUFFakUsQ0FBQztJQUVELDRDQUFjLEdBQWQ7UUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHO1lBQ2IsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU87WUFDN0IsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDakMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDMUYsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLElBQUksRUFBRTtZQUMvQixLQUFLLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSztZQUM1RSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzdCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztZQUM3QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixVQUFVLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUMvQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsVUFBVSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDL0IsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3pCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtTQUN0QixDQUFDO1FBQ0YsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztJQUNsQyxDQUFDO0lBRUQsc0NBQVEsR0FBUjtRQUNJLGlCQUFNLFFBQVEsV0FBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELDhDQUFnQixHQUFoQixVQUFpQixHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUN6QixPQUFPO1NBQ1Y7UUFDRCxRQUFRLEdBQUcsRUFBRTtZQUNULEtBQUssY0FBYztnQkFDZixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDcEM7Z0JBQ0ksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQzdCLE1BQU07U0FDVDtJQUNMLENBQUM7SUFyRU0sbUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUDVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsZ0JBQWdCO29CQUMxQixTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsbUJBQW1CLENBQUM7cUJBQzFDO2lCQUNKOzs7O2dCQWhCbUIsUUFBUTtnQkFLbkIsYUFBYSx1QkFxQ1UsUUFBUTs7SUE4Q3hDLDBCQUFDO0NBQUEsQUE3RUQsQ0FNeUMsYUFBYSxHQXVFckQ7U0F2RVksbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbmplY3RvciwgT25Jbml0LCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBCYXNlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vYmFzZS9iYXNlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9mb3JtLWFjdGlvbi5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgRm9ybUNvbXBvbmVudCB9IGZyb20gJy4uL2Zvcm0uY29tcG9uZW50JztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1mb3JtLWFjdGlvbicsIGhvc3RDbGFzczogJyd9O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bUZvcm1BY3Rpb25dJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKEZvcm1BY3Rpb25EaXJlY3RpdmUpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBGb3JtQWN0aW9uRGlyZWN0aXZlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIGFjY2Vzc3JvbGVzO1xuICAgIGFjdGlvbjtcbiAgICBiaW5kaW5nO1xuICAgIGNsYXNzO1xuICAgIGRpc2FibGVkO1xuICAgIGRpc3BsYXlOYW1lO1xuICAgIGljb25jbGFzcztcbiAgICBpY29ubmFtZTtcbiAgICBrZXk7XG4gICAgcG9zaXRpb247XG4gICAgc2hvcnRjdXRrZXk7XG4gICAgc2hvdztcbiAgICB0YWJpbmRleDtcbiAgICB0aXRsZTtcbiAgICB0eXBlO1xuICAgIHVwZGF0ZU1vZGU7XG4gICAgYnV0dG9uRGVmO1xuICAgIGh5cGVybGluaztcbiAgICB0YXJnZXQ7XG5cbiAgICBwcml2YXRlIF9wcm9wc0luaXRpYWxpemVkOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3RvciwgQE9wdGlvbmFsKCkgcHVibGljIGZvcm06IEZvcm1Db21wb25lbnQpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICB9XG5cbiAgICBwb3B1bGF0ZUFjdGlvbigpIHtcbiAgICAgICAgdGhpcy5idXR0b25EZWYgPSB7XG4gICAgICAgICAgICBrZXk6IHRoaXMua2V5IHx8IHRoaXMuYmluZGluZyxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiB0aGlzWydkaXNwbGF5LW5hbWUnXSxcbiAgICAgICAgICAgIHNob3c6IHRoaXMuc2hvdyxcbiAgICAgICAgICAgIGNsYXNzOiB0aGlzLmNsYXNzID8gdGhpcy5jbGFzcyA6ICh0aGlzWyd3aWRnZXQtdHlwZSddID09PSAnYnV0dG9uJyA/ICdidG4tc2Vjb25kYXJ5JyA6ICcnKSxcbiAgICAgICAgICAgIGljb25jbGFzczogdGhpcy5pY29uY2xhc3MgfHwgJycsXG4gICAgICAgICAgICB0aXRsZTogXy5pc1VuZGVmaW5lZCh0aGlzLnRpdGxlKSA/ICh0aGlzWydkaXNwbGF5LW5hbWUnXSB8fCAnJykgOiB0aGlzLnRpdGxlLFxuICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvbixcbiAgICAgICAgICAgIGFjY2Vzc3JvbGVzOiB0aGlzLmFjY2Vzc3JvbGVzLFxuICAgICAgICAgICAgc2hvcnRjdXRrZXk6IHRoaXMuc2hvcnRjdXRrZXksXG4gICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5kaXNhYmxlZCxcbiAgICAgICAgICAgIHRhYmluZGV4OiB0aGlzLnRhYmluZGV4LFxuICAgICAgICAgICAgaWNvbm5hbWU6IHRoaXMuaWNvbm5hbWUsXG4gICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgICAgICB1cGRhdGVNb2RlOiB0aGlzWyd1cGRhdGUtbW9kZSddLFxuICAgICAgICAgICAgcG9zaXRpb246IHRoaXMucG9zaXRpb24sXG4gICAgICAgICAgICB3aWRnZXRUeXBlOiB0aGlzWyd3aWRnZXQtdHlwZSddLFxuICAgICAgICAgICAgaHlwZXJsaW5rOiB0aGlzLmh5cGVybGluayxcbiAgICAgICAgICAgIHRhcmdldDogdGhpcy50YXJnZXRcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fcHJvcHNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgICAgIHRoaXMucG9wdWxhdGVBY3Rpb24oKTtcbiAgICAgICAgdGhpcy5mb3JtLnJlZ2lzdGVyQWN0aW9ucyh0aGlzLmJ1dHRvbkRlZik7XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdikge1xuICAgICAgICBpZiAoIXRoaXMuX3Byb3BzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSAnZGlzcGxheS1uYW1lJzpcbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbkRlZi5kaXNwbGF5TmFtZSA9IG52O1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbkRlZltrZXldID0gbnY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==