import * as tslib_1 from "tslib";
import { Directive, Injector, Optional } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './table-action.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';
var WIDGET_CONFIG = { widgetType: 'wm-table-action', hostClass: '' };
var TableActionDirective = /** @class */ (function (_super) {
    tslib_1.__extends(TableActionDirective, _super);
    function TableActionDirective(inj, table) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.table = table;
        return _this;
    }
    TableActionDirective.prototype.populateAction = function () {
        this.buttonDef = {
            key: this.key,
            displayName: this['display-name'] || this.caption || '',
            show: this.show,
            class: this.class || '',
            iconclass: this.iconclass || '',
            title: _.isUndefined(this.title) ? (this['display-name'] || '') : this.title,
            action: this.action,
            accessroles: this.accessroles,
            shortcutkey: this.shortcutkey,
            disabled: this.disabled,
            tabindex: this.tabindex,
            icon: this.icon,
            position: this.position,
            widgetType: this['widget-type'],
            hyperlink: this.hyperlink,
            target: this.target,
            conditionalclass: this.conditionalclass || '',
            conditionalstyle: this.conditionalstyle || {}
        };
        this._propsInitialized = true;
    };
    TableActionDirective.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.populateAction();
        this.table.registerActions(this.buttonDef);
    };
    TableActionDirective.prototype.onPropertyChange = function (key, nv) {
        if (!this._propsInitialized) {
            return;
        }
        if (key === 'display-name') {
            this.buttonDef.displayName = nv;
        }
        else {
            this.buttonDef[key] = nv;
        }
    };
    TableActionDirective.initializeProps = registerProps();
    TableActionDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmTableAction]',
                    providers: [
                        provideAsWidgetRef(TableActionDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    TableActionDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: TableComponent, decorators: [{ type: Optional }] }
    ]; };
    return TableActionDirective;
}(BaseComponent));
export { TableActionDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtYWN0aW9uLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFibGUvdGFibGUtYWN0aW9uL3RhYmxlLWFjdGlvbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFVLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUlwRCxJQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFDLENBQUM7QUFFckU7SUFNMEMsZ0RBQWE7SUF5Qm5ELDhCQUFZLEdBQWEsRUFBcUIsS0FBcUI7UUFBbkUsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBQzVCO1FBRjZDLFdBQUssR0FBTCxLQUFLLENBQWdCOztJQUVuRSxDQUFDO0lBRUQsNkNBQWMsR0FBZDtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUc7WUFDYixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixXQUFXLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRTtZQUN2RCxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxJQUFJLEVBQUU7WUFDL0IsS0FBSyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUs7WUFDNUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztZQUM3QixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsVUFBVSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDL0IsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3pCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLElBQUksRUFBRTtZQUM3QyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLElBQUksRUFBRTtTQUNoRCxDQUFDO1FBQ0YsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztJQUNsQyxDQUFDO0lBRUQsdUNBQVEsR0FBUjtRQUNJLGlCQUFNLFFBQVEsV0FBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELCtDQUFnQixHQUFoQixVQUFpQixHQUFHLEVBQUUsRUFBRTtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ3pCLE9BQU87U0FDVjtRQUVELElBQUksR0FBRyxLQUFLLGNBQWMsRUFBRTtZQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7U0FDbkM7YUFBTTtZQUNILElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQzVCO0lBQ0wsQ0FBQztJQXBFTSxvQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFQNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxpQkFBaUI7b0JBQzNCLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDM0M7aUJBQ0o7Ozs7Z0JBaEJtQixRQUFRO2dCQUtuQixjQUFjLHVCQXFDUyxRQUFROztJQTZDeEMsMkJBQUM7Q0FBQSxBQTVFRCxDQU0wQyxhQUFhLEdBc0V0RDtTQXRFWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdG9yLCBPbkluaXQsIE9wdGlvbmFsIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEJhc2VDb21wb25lbnQgfSBmcm9tICcuLi8uLi9iYXNlL2Jhc2UuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3RhYmxlLWFjdGlvbi5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgVGFibGVDb21wb25lbnQgfSBmcm9tICcuLi90YWJsZS5jb21wb25lbnQnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLXRhYmxlLWFjdGlvbicsIGhvc3RDbGFzczogJyd9O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bVRhYmxlQWN0aW9uXScsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihUYWJsZUFjdGlvbkRpcmVjdGl2ZSlcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFRhYmxlQWN0aW9uRGlyZWN0aXZlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIGFjY2Vzc3JvbGVzO1xuICAgIGFjdGlvbjtcbiAgICBjYXB0aW9uO1xuICAgIGNsYXNzO1xuICAgIGRpc2FibGVkO1xuICAgIGRpc3BsYXlOYW1lO1xuICAgIGljb247XG4gICAgaWNvbmNsYXNzO1xuICAgIHBvc2l0aW9uO1xuICAgIHNob3J0Y3V0a2V5O1xuICAgIHNob3c7XG4gICAgdGFiaW5kZXg7XG4gICAgdGl0bGU7XG4gICAga2V5O1xuICAgIGh5cGVybGluaztcbiAgICB0YXJnZXQ7XG4gICAgYnV0dG9uRGVmO1xuICAgIGNvbmRpdGlvbmFsY2xhc3M7XG4gICAgY29uZGl0aW9uYWxzdHlsZTtcblxuICAgIHByaXZhdGUgX3Byb3BzSW5pdGlhbGl6ZWQ6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yLCBAT3B0aW9uYWwoKSBwdWJsaWMgdGFibGU6IFRhYmxlQ29tcG9uZW50KSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgfVxuXG4gICAgcG9wdWxhdGVBY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuYnV0dG9uRGVmID0ge1xuICAgICAgICAgICAga2V5OiB0aGlzLmtleSxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiB0aGlzWydkaXNwbGF5LW5hbWUnXSB8fCB0aGlzLmNhcHRpb24gfHwgJycsXG4gICAgICAgICAgICBzaG93OiB0aGlzLnNob3csXG4gICAgICAgICAgICBjbGFzczogdGhpcy5jbGFzcyB8fCAnJyxcbiAgICAgICAgICAgIGljb25jbGFzczogdGhpcy5pY29uY2xhc3MgfHwgJycsXG4gICAgICAgICAgICB0aXRsZTogXy5pc1VuZGVmaW5lZCh0aGlzLnRpdGxlKSA/ICh0aGlzWydkaXNwbGF5LW5hbWUnXSB8fCAnJykgOiB0aGlzLnRpdGxlLFxuICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvbixcbiAgICAgICAgICAgIGFjY2Vzc3JvbGVzOiB0aGlzLmFjY2Vzc3JvbGVzLFxuICAgICAgICAgICAgc2hvcnRjdXRrZXk6IHRoaXMuc2hvcnRjdXRrZXksXG4gICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5kaXNhYmxlZCxcbiAgICAgICAgICAgIHRhYmluZGV4OiB0aGlzLnRhYmluZGV4LFxuICAgICAgICAgICAgaWNvbjogdGhpcy5pY29uLFxuICAgICAgICAgICAgcG9zaXRpb246IHRoaXMucG9zaXRpb24sXG4gICAgICAgICAgICB3aWRnZXRUeXBlOiB0aGlzWyd3aWRnZXQtdHlwZSddLFxuICAgICAgICAgICAgaHlwZXJsaW5rOiB0aGlzLmh5cGVybGluayxcbiAgICAgICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgICAgICBjb25kaXRpb25hbGNsYXNzOiB0aGlzLmNvbmRpdGlvbmFsY2xhc3MgfHwgJycsXG4gICAgICAgICAgICBjb25kaXRpb25hbHN0eWxlOiB0aGlzLmNvbmRpdGlvbmFsc3R5bGUgfHwge31cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fcHJvcHNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgICAgIHRoaXMucG9wdWxhdGVBY3Rpb24oKTtcbiAgICAgICAgdGhpcy50YWJsZS5yZWdpc3RlckFjdGlvbnModGhpcy5idXR0b25EZWYpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudikge1xuICAgICAgICBpZiAoIXRoaXMuX3Byb3BzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChrZXkgPT09ICdkaXNwbGF5LW5hbWUnKSB7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvbkRlZi5kaXNwbGF5TmFtZSA9IG52O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5idXR0b25EZWZba2V5XSA9IG52O1xuICAgICAgICB9XG4gICAgfVxufVxuIl19