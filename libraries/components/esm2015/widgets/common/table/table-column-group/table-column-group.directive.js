import { Directive, Injector, Optional, SkipSelf } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { setHeaderConfigForTable } from '../../../../utils/live-utils';
import { registerProps } from './table-column-group.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';
const WIDGET_CONFIG = { widgetType: 'wm-table-column-group', hostClass: '' };
export class TableColumnGroupDirective extends BaseComponent {
    constructor(inj, group, table) {
        super(inj, WIDGET_CONFIG);
        this.group = group;
        this.table = table;
        this.config = {};
    }
    populateConfig() {
        this.config = {
            field: this.name,
            displayName: this.caption || '',
            columns: [],
            isGroup: true,
            accessroles: this.accessroles,
            textAlignment: this.textalignment || 'center',
            backgroundColor: this.backgroundcolor,
            class: this['col-class']
        };
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'caption') {
            this.config.displayName = nv || '';
            this.table.callDataGridMethod('setColumnProp', this.config.field, 'displayName', nv, true);
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    ngOnInit() {
        super.ngOnInit();
        this.populateConfig();
        setHeaderConfigForTable(this.table.headerConfig, this.config, this.group && this.group.name);
    }
}
TableColumnGroupDirective.initializeProps = registerProps();
TableColumnGroupDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmTableColumnGroup]',
                providers: [
                    provideAsWidgetRef(TableColumnGroupDirective)
                ]
            },] }
];
/** @nocollapse */
TableColumnGroupDirective.ctorParameters = () => [
    { type: Injector },
    { type: TableColumnGroupDirective, decorators: [{ type: SkipSelf }, { type: Optional }] },
    { type: TableComponent, decorators: [{ type: Optional }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtY29sdW1uLWdyb3VwLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFibGUvdGFibGUtY29sdW1uLWdyb3VwL3RhYmxlLWNvbHVtbi1ncm91cC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQVUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVoRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDdkUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzNELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVwRCxNQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSx1QkFBdUIsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFDLENBQUM7QUFRM0UsTUFBTSxPQUFPLHlCQUEwQixTQUFRLGFBQWE7SUFXeEQsWUFDSSxHQUFhLEVBQ2tCLEtBQWdDLEVBQzVDLEtBQXFCO1FBRXhDLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFISyxVQUFLLEdBQUwsS0FBSyxDQUEyQjtRQUM1QyxVQUFLLEdBQUwsS0FBSyxDQUFnQjtRQUw1QyxXQUFNLEdBQVEsRUFBRSxDQUFDO0lBUWpCLENBQUM7SUFFRCxjQUFjO1FBQ1YsSUFBSSxDQUFDLE1BQU0sR0FBRztZQUNWLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNoQixXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFO1lBQy9CLE9BQU8sRUFBRSxFQUFFO1lBQ1gsT0FBTyxFQUFFLElBQUk7WUFDYixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLElBQUksUUFBUTtZQUM3QyxlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWU7WUFDckMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUM7U0FDM0IsQ0FBQztJQUNOLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUc7UUFDekIsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO1lBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM5RjthQUFNO1lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRUQsUUFBUTtRQUNKLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakcsQ0FBQzs7QUE1Q00seUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFQNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxzQkFBc0I7Z0JBQ2hDLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyx5QkFBeUIsQ0FBQztpQkFDaEQ7YUFDSjs7OztZQWZtQixRQUFRO1lBNkJrQix5QkFBeUIsdUJBQTlELFFBQVEsWUFBSSxRQUFRO1lBdkJwQixjQUFjLHVCQXdCZCxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbmplY3RvciwgT25Jbml0LCBPcHRpb25hbCwgU2tpcFNlbGYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQmFzZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2Jhc2UvYmFzZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgc2V0SGVhZGVyQ29uZmlnRm9yVGFibGUgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy9saXZlLXV0aWxzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3RhYmxlLWNvbHVtbi1ncm91cC5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgVGFibGVDb21wb25lbnQgfSBmcm9tICcuLi90YWJsZS5jb21wb25lbnQnO1xuXG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS10YWJsZS1jb2x1bW4tZ3JvdXAnLCBob3N0Q2xhc3M6ICcnfTtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21UYWJsZUNvbHVtbkdyb3VwXScsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihUYWJsZUNvbHVtbkdyb3VwRGlyZWN0aXZlKVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgVGFibGVDb2x1bW5Hcm91cERpcmVjdGl2ZSBleHRlbmRzIEJhc2VDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBhY2Nlc3Nyb2xlcztcbiAgICBiYWNrZ3JvdW5kY29sb3I7XG4gICAgY2FwdGlvbjtcbiAgICBjb2xDbGFzcztcbiAgICBuYW1lO1xuICAgIHRleHRhbGlnbm1lbnQ7XG4gICAgY29uZmlnOiBhbnkgPSB7fTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBAU2tpcFNlbGYoKSBAT3B0aW9uYWwoKSBwdWJsaWMgZ3JvdXA6IFRhYmxlQ29sdW1uR3JvdXBEaXJlY3RpdmUsXG4gICAgICAgIEBPcHRpb25hbCgpIHB1YmxpYyB0YWJsZTogVGFibGVDb21wb25lbnRcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICB9XG5cbiAgICBwb3B1bGF0ZUNvbmZpZygpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgICAgICBmaWVsZDogdGhpcy5uYW1lLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IHRoaXMuY2FwdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIGNvbHVtbnM6IFtdLFxuICAgICAgICAgICAgaXNHcm91cDogdHJ1ZSxcbiAgICAgICAgICAgIGFjY2Vzc3JvbGVzOiB0aGlzLmFjY2Vzc3JvbGVzLFxuICAgICAgICAgICAgdGV4dEFsaWdubWVudDogdGhpcy50ZXh0YWxpZ25tZW50IHx8ICdjZW50ZXInLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiB0aGlzLmJhY2tncm91bmRjb2xvcixcbiAgICAgICAgICAgIGNsYXNzOiB0aGlzWydjb2wtY2xhc3MnXVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3Y/KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdjYXB0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5jb25maWcuZGlzcGxheU5hbWUgPSBudiB8fCAnJztcbiAgICAgICAgICAgIHRoaXMudGFibGUuY2FsbERhdGFHcmlkTWV0aG9kKCdzZXRDb2x1bW5Qcm9wJywgdGhpcy5jb25maWcuZmllbGQsICdkaXNwbGF5TmFtZScsIG52LCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgICAgIHRoaXMucG9wdWxhdGVDb25maWcoKTtcbiAgICAgICAgc2V0SGVhZGVyQ29uZmlnRm9yVGFibGUodGhpcy50YWJsZS5oZWFkZXJDb25maWcsIHRoaXMuY29uZmlnLCB0aGlzLmdyb3VwICYmIHRoaXMuZ3JvdXAubmFtZSk7XG4gICAgfVxufVxuIl19