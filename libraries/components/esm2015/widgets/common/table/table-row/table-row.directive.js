import { Directive, Injector, Optional, SkipSelf } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './table-row.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';
const WIDGET_CONFIG = { widgetType: 'wm-table-row', hostClass: '' };
export class TableRowDirective extends BaseComponent {
    constructor(inj, table) {
        super(inj, WIDGET_CONFIG);
        this.table = table;
    }
    populateConfig() {
        this.config = {
            closeothers: this.closeothers,
            content: this.content,
            columnwidth: this.columnwidth,
            expandicon: this.expandicon,
            collapseicon: this.collapseicon,
            height: this.height,
            position: this.position
        };
    }
    ngOnInit() {
        super.ngOnInit();
        this.populateConfig();
        this.table.registerRow(this.config, this);
    }
    onPropertyChange(key, nv) {
        if (key === 'content' && this.config) {
            this.config.content = this.content;
        }
    }
}
TableRowDirective.initializeProps = registerProps();
TableRowDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmTableRow]',
                providers: [
                    provideAsWidgetRef(TableRowDirective)
                ]
            },] }
];
/** @nocollapse */
TableRowDirective.ctorParameters = () => [
    { type: Injector },
    { type: TableComponent, decorators: [{ type: Optional }, { type: SkipSelf }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtcm93LmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFibGUvdGFibGUtcm93L3RhYmxlLXJvdy5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQVUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVoRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVwRCxNQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBQyxDQUFDO0FBUWxFLE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxhQUFhO0lBWWhELFlBQ0ksR0FBYSxFQUNrQixLQUFxQjtRQUVwRCxLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRkssVUFBSyxHQUFMLEtBQUssQ0FBZ0I7SUFHeEQsQ0FBQztJQUVELGNBQWM7UUFDVixJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1YsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzdCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO1lBQzNCLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtZQUMvQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQzFCLENBQUM7SUFDTixDQUFDO0lBRUQsUUFBUTtRQUNKLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLEVBQU87UUFDakMsSUFBSSxHQUFHLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztTQUN0QztJQUNMLENBQUM7O0FBeENNLGlDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBUDVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsY0FBYztnQkFDeEIsU0FBUyxFQUFFO29CQUNQLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDO2lCQUN4QzthQUNKOzs7O1lBZG1CLFFBQVE7WUFLbkIsY0FBYyx1QkF3QmQsUUFBUSxZQUFJLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdG9yLCBPbkluaXQsIE9wdGlvbmFsLCBTa2lwU2VsZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBCYXNlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vYmFzZS9iYXNlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi90YWJsZS1yb3cucHJvcHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IFRhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vdGFibGUuY29tcG9uZW50JztcblxuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tdGFibGUtcm93JywgaG9zdENsYXNzOiAnJ307XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtVGFibGVSb3ddJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFRhYmxlUm93RGlyZWN0aXZlKVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgVGFibGVSb3dEaXJlY3RpdmUgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgY29uZmlnO1xuICAgIGNvbHVtbndpZHRoO1xuICAgIGNsb3Nlb3RoZXJzO1xuICAgIGNvbnRlbnQ7XG4gICAgZXhwYW5kaWNvbjtcbiAgICBjb2xsYXBzZWljb247XG4gICAgaGVpZ2h0O1xuICAgIHBvc2l0aW9uO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIEBPcHRpb25hbCgpIEBTa2lwU2VsZigpIHB1YmxpYyB0YWJsZTogVGFibGVDb21wb25lbnRcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICB9XG5cbiAgICBwb3B1bGF0ZUNvbmZpZygpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgICAgICBjbG9zZW90aGVyczogdGhpcy5jbG9zZW90aGVycyxcbiAgICAgICAgICAgIGNvbnRlbnQ6IHRoaXMuY29udGVudCxcbiAgICAgICAgICAgIGNvbHVtbndpZHRoOiB0aGlzLmNvbHVtbndpZHRoLFxuICAgICAgICAgICAgZXhwYW5kaWNvbjogdGhpcy5leHBhbmRpY29uLFxuICAgICAgICAgICAgY29sbGFwc2VpY29uOiB0aGlzLmNvbGxhcHNlaWNvbixcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICBwb3NpdGlvbjogdGhpcy5wb3NpdGlvblxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBzdXBlci5uZ09uSW5pdCgpO1xuICAgICAgICB0aGlzLnBvcHVsYXRlQ29uZmlnKCk7XG4gICAgICAgIHRoaXMudGFibGUucmVnaXN0ZXJSb3codGhpcy5jb25maWcsIHRoaXMpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2NvbnRlbnQnICYmIHRoaXMuY29uZmlnKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5jb250ZW50ID0gdGhpcy5jb250ZW50O1xuICAgICAgICB9XG4gICAgfVxufVxuIl19