import * as tslib_1 from "tslib";
import { Directive, Inject, Injector, Optional, Self } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './table-row-action.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';
import { Context } from '../../../framework/types';
var WIDGET_CONFIG = { widgetType: 'wm-table-row-action', hostClass: '' };
var ɵ0 = {};
var TableRowActionDirective = /** @class */ (function (_super) {
    tslib_1.__extends(TableRowActionDirective, _super);
    function TableRowActionDirective(inj, table, contexts) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.table = table;
        contexts[0].editRow = function (evt) { return _this.table.editRow(evt); };
        contexts[0].deleteRow = function (evt) { return _this.table.deleteRow(evt); };
        contexts[0].addNewRow = function (evt) { return _this.table.addNewRow(evt); };
        return _this;
    }
    TableRowActionDirective.prototype.getTitle = function () {
        return _.isUndefined(this.title) ? (this['display-name'] || '') : this.title;
    };
    TableRowActionDirective.prototype.populateAction = function () {
        this.buttonDef = {
            key: this.key,
            displayName: this['display-name'] || this.caption || '',
            show: this.show,
            class: this.class || '',
            iconclass: this.iconclass || '',
            title: this.getTitle(),
            action: this.action,
            accessroles: this.accessroles,
            disabled: this.disabled,
            tabindex: this.tabindex ? +this.tabindex : undefined,
            widgetType: this['widget-type'] || 'button',
            hyperlink: this.hyperlink,
            target: this.target,
            conditionalclass: this.conditionalclass || '',
            conditionalstyle: this.conditionalstyle || {}
        };
    };
    TableRowActionDirective.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.populateAction();
        this.table.registerRowActions(this.buttonDef);
    };
    TableRowActionDirective.initializeProps = registerProps();
    TableRowActionDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmTableRowAction]',
                    providers: [
                        provideAsWidgetRef(TableRowActionDirective),
                        { provide: Context, useValue: ɵ0, multi: true }
                    ]
                },] }
    ];
    /** @nocollapse */
    TableRowActionDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: TableComponent, decorators: [{ type: Optional }] },
        { type: Array, decorators: [{ type: Self }, { type: Inject, args: [Context,] }] }
    ]; };
    return TableRowActionDirective;
}(BaseComponent));
export { TableRowActionDirective };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtcm93LWFjdGlvbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RhYmxlL3RhYmxlLXJvdy1hY3Rpb24vdGFibGUtcm93LWFjdGlvbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBVSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDekQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUluRCxJQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxxQkFBcUIsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFDLENBQUM7U0FNcEMsRUFBRTtBQUp2QztJQU82QyxtREFBYTtJQW9CdEQsaUNBQ0ksR0FBYSxFQUNNLEtBQXFCLEVBQ2YsUUFBb0I7UUFIakQsWUFLSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBSzVCO1FBUnNCLFdBQUssR0FBTCxLQUFLLENBQWdCO1FBS3hDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsVUFBQyxHQUFHLElBQUssT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBdkIsQ0FBdUIsQ0FBQztRQUN2RCxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLFVBQUMsR0FBRyxJQUFLLE9BQUEsS0FBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQXpCLENBQXlCLENBQUM7UUFDM0QsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxVQUFDLEdBQUcsSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUF6QixDQUF5QixDQUFDOztJQUMvRCxDQUFDO0lBRUQsMENBQVEsR0FBUjtRQUNJLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ2pGLENBQUM7SUFFRCxnREFBYyxHQUFkO1FBQ0ksSUFBSSxDQUFDLFNBQVMsR0FBRztZQUNiLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLFdBQVcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFO1lBQ3ZELElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDdkIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLElBQUksRUFBRTtZQUMvQixLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUN0QixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzdCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ3BELFVBQVUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksUUFBUTtZQUMzQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7WUFDekIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFO1lBQzdDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFO1NBQ2hELENBQUM7SUFDTixDQUFDO0lBRUQsMENBQVEsR0FBUjtRQUNJLGlCQUFNLFFBQVEsV0FBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBM0RNLHVDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVI1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLG9CQUFvQjtvQkFDOUIsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLHVCQUF1QixDQUFDO3dCQUMzQyxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztxQkFDaEQ7aUJBQ0o7Ozs7Z0JBbEIyQixRQUFRO2dCQUszQixjQUFjLHVCQW9DZCxRQUFRO2dCQUMwQixLQUFLLHVCQUF2QyxJQUFJLFlBQUksTUFBTSxTQUFDLE9BQU87O0lBc0MvQiw4QkFBQztDQUFBLEFBcEVELENBTzZDLGFBQWEsR0E2RHpEO1NBN0RZLHVCQUF1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSW5qZWN0LCBJbmplY3RvciwgT25Jbml0LCBPcHRpb25hbCwgU2VsZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBCYXNlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vYmFzZS9iYXNlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi90YWJsZS1yb3ctYWN0aW9uLnByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBUYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL3RhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS10YWJsZS1yb3ctYWN0aW9uJywgaG9zdENsYXNzOiAnJ307XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtVGFibGVSb3dBY3Rpb25dJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFRhYmxlUm93QWN0aW9uRGlyZWN0aXZlKSxcbiAgICAgICAge3Byb3ZpZGU6IENvbnRleHQsIHVzZVZhbHVlOiB7fSwgbXVsdGk6IHRydWV9XG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBUYWJsZVJvd0FjdGlvbkRpcmVjdGl2ZSBleHRlbmRzIEJhc2VDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBhY2Nlc3Nyb2xlcztcbiAgICBhY3Rpb247XG4gICAgY2FwdGlvbjtcbiAgICBjbGFzcztcbiAgICBkaXNhYmxlZDtcbiAgICBkaXNwbGF5TmFtZTtcbiAgICBpY29uY2xhc3M7XG4gICAga2V5O1xuICAgIHNob3c7XG4gICAgdGFiaW5kZXg7XG4gICAgdGl0bGU7XG4gICAgYnV0dG9uRGVmO1xuICAgIGh5cGVybGluaztcbiAgICB0YXJnZXQ7XG4gICAgY29uZGl0aW9uYWxjbGFzcztcbiAgICBjb25kaXRpb25hbHN0eWxlO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIEBPcHRpb25hbCgpIHB1YmxpYyB0YWJsZTogVGFibGVDb21wb25lbnQsXG4gICAgICAgIEBTZWxmKCkgQEluamVjdChDb250ZXh0KSBjb250ZXh0czogQXJyYXk8YW55PlxuICAgICkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuXG4gICAgICAgIGNvbnRleHRzWzBdLmVkaXRSb3cgPSAoZXZ0KSA9PiB0aGlzLnRhYmxlLmVkaXRSb3coZXZ0KTtcbiAgICAgICAgY29udGV4dHNbMF0uZGVsZXRlUm93ID0gKGV2dCkgPT4gdGhpcy50YWJsZS5kZWxldGVSb3coZXZ0KTtcbiAgICAgICAgY29udGV4dHNbMF0uYWRkTmV3Um93ID0gKGV2dCkgPT4gdGhpcy50YWJsZS5hZGROZXdSb3coZXZ0KTtcbiAgICB9XG5cbiAgICBnZXRUaXRsZSgpIHtcbiAgICAgICAgcmV0dXJuIF8uaXNVbmRlZmluZWQodGhpcy50aXRsZSkgPyAodGhpc1snZGlzcGxheS1uYW1lJ10gfHwgJycpIDogdGhpcy50aXRsZTtcbiAgICB9XG5cbiAgICBwb3B1bGF0ZUFjdGlvbigpIHtcbiAgICAgICAgdGhpcy5idXR0b25EZWYgPSB7XG4gICAgICAgICAgICBrZXk6IHRoaXMua2V5LFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IHRoaXNbJ2Rpc3BsYXktbmFtZSddIHx8IHRoaXMuY2FwdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIHNob3c6IHRoaXMuc2hvdyxcbiAgICAgICAgICAgIGNsYXNzOiB0aGlzLmNsYXNzIHx8ICcnLFxuICAgICAgICAgICAgaWNvbmNsYXNzOiB0aGlzLmljb25jbGFzcyB8fCAnJyxcbiAgICAgICAgICAgIHRpdGxlOiB0aGlzLmdldFRpdGxlKCksXG4gICAgICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uLFxuICAgICAgICAgICAgYWNjZXNzcm9sZXM6IHRoaXMuYWNjZXNzcm9sZXMsXG4gICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5kaXNhYmxlZCxcbiAgICAgICAgICAgIHRhYmluZGV4OiB0aGlzLnRhYmluZGV4ID8gK3RoaXMudGFiaW5kZXggOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB3aWRnZXRUeXBlOiB0aGlzWyd3aWRnZXQtdHlwZSddIHx8ICdidXR0b24nLFxuICAgICAgICAgICAgaHlwZXJsaW5rOiB0aGlzLmh5cGVybGluayxcbiAgICAgICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgICAgICBjb25kaXRpb25hbGNsYXNzOiB0aGlzLmNvbmRpdGlvbmFsY2xhc3MgfHwgJycsXG4gICAgICAgICAgICBjb25kaXRpb25hbHN0eWxlOiB0aGlzLmNvbmRpdGlvbmFsc3R5bGUgfHwge31cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy5wb3B1bGF0ZUFjdGlvbigpO1xuICAgICAgICB0aGlzLnRhYmxlLnJlZ2lzdGVyUm93QWN0aW9ucyh0aGlzLmJ1dHRvbkRlZik7XG4gICAgfVxufVxuIl19