import * as tslib_1 from "tslib";
import { Directive, Injector, Optional, SkipSelf } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { setHeaderConfigForTable } from '../../../../utils/live-utils';
import { registerProps } from './table-column-group.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';
var WIDGET_CONFIG = { widgetType: 'wm-table-column-group', hostClass: '' };
var TableColumnGroupDirective = /** @class */ (function (_super) {
    tslib_1.__extends(TableColumnGroupDirective, _super);
    function TableColumnGroupDirective(inj, group, table) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.group = group;
        _this.table = table;
        _this.config = {};
        return _this;
    }
    TableColumnGroupDirective.prototype.populateConfig = function () {
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
    };
    TableColumnGroupDirective.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'caption') {
            this.config.displayName = nv || '';
            this.table.callDataGridMethod('setColumnProp', this.config.field, 'displayName', nv, true);
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    TableColumnGroupDirective.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.populateConfig();
        setHeaderConfigForTable(this.table.headerConfig, this.config, this.group && this.group.name);
    };
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
    TableColumnGroupDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: TableColumnGroupDirective, decorators: [{ type: SkipSelf }, { type: Optional }] },
        { type: TableComponent, decorators: [{ type: Optional }] }
    ]; };
    return TableColumnGroupDirective;
}(BaseComponent));
export { TableColumnGroupDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtY29sdW1uLWdyb3VwLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFibGUvdGFibGUtY29sdW1uLWdyb3VwL3RhYmxlLWNvbHVtbi1ncm91cC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFVLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFaEYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFcEQsSUFBTSxhQUFhLEdBQUcsRUFBQyxVQUFVLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBQyxDQUFDO0FBRTNFO0lBTStDLHFEQUFhO0lBV3hELG1DQUNJLEdBQWEsRUFDa0IsS0FBZ0MsRUFDNUMsS0FBcUI7UUFINUMsWUFLSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBQzVCO1FBSmtDLFdBQUssR0FBTCxLQUFLLENBQTJCO1FBQzVDLFdBQUssR0FBTCxLQUFLLENBQWdCO1FBTDVDLFlBQU0sR0FBUSxFQUFFLENBQUM7O0lBUWpCLENBQUM7SUFFRCxrREFBYyxHQUFkO1FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRztZQUNWLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNoQixXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFO1lBQy9CLE9BQU8sRUFBRSxFQUFFO1lBQ1gsT0FBTyxFQUFFLElBQUk7WUFDYixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLElBQUksUUFBUTtZQUM3QyxlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWU7WUFDckMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUM7U0FDM0IsQ0FBQztJQUNOLENBQUM7SUFFRCxvREFBZ0IsR0FBaEIsVUFBaUIsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFHO1FBQ3pCLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtZQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDOUY7YUFBTTtZQUNILGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRUQsNENBQVEsR0FBUjtRQUNJLGlCQUFNLFFBQVEsV0FBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0Qix1QkFBdUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBNUNNLHlDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVA1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLHlCQUF5QixDQUFDO3FCQUNoRDtpQkFDSjs7OztnQkFmbUIsUUFBUTtnQkE2QmtCLHlCQUF5Qix1QkFBOUQsUUFBUSxZQUFJLFFBQVE7Z0JBdkJwQixjQUFjLHVCQXdCZCxRQUFROztJQWdDakIsZ0NBQUM7Q0FBQSxBQXBERCxDQU0rQyxhQUFhLEdBOEMzRDtTQTlDWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdG9yLCBPbkluaXQsIE9wdGlvbmFsLCBTa2lwU2VsZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBCYXNlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vYmFzZS9iYXNlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBzZXRIZWFkZXJDb25maWdGb3JUYWJsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL2xpdmUtdXRpbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vdGFibGUtY29sdW1uLWdyb3VwLnByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBUYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL3RhYmxlLmNvbXBvbmVudCc7XG5cbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLXRhYmxlLWNvbHVtbi1ncm91cCcsIGhvc3RDbGFzczogJyd9O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bVRhYmxlQ29sdW1uR3JvdXBdJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFRhYmxlQ29sdW1uR3JvdXBEaXJlY3RpdmUpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBUYWJsZUNvbHVtbkdyb3VwRGlyZWN0aXZlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIGFjY2Vzc3JvbGVzO1xuICAgIGJhY2tncm91bmRjb2xvcjtcbiAgICBjYXB0aW9uO1xuICAgIGNvbENsYXNzO1xuICAgIG5hbWU7XG4gICAgdGV4dGFsaWdubWVudDtcbiAgICBjb25maWc6IGFueSA9IHt9O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIEBTa2lwU2VsZigpIEBPcHRpb25hbCgpIHB1YmxpYyBncm91cDogVGFibGVDb2x1bW5Hcm91cERpcmVjdGl2ZSxcbiAgICAgICAgQE9wdGlvbmFsKCkgcHVibGljIHRhYmxlOiBUYWJsZUNvbXBvbmVudFxuICAgICkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgIH1cblxuICAgIHBvcHVsYXRlQ29uZmlnKCkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgICAgIGZpZWxkOiB0aGlzLm5hbWUsXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogdGhpcy5jYXB0aW9uIHx8ICcnLFxuICAgICAgICAgICAgY29sdW1uczogW10sXG4gICAgICAgICAgICBpc0dyb3VwOiB0cnVlLFxuICAgICAgICAgICAgYWNjZXNzcm9sZXM6IHRoaXMuYWNjZXNzcm9sZXMsXG4gICAgICAgICAgICB0ZXh0QWxpZ25tZW50OiB0aGlzLnRleHRhbGlnbm1lbnQgfHwgJ2NlbnRlcicsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuYmFja2dyb3VuZGNvbG9yLFxuICAgICAgICAgICAgY2xhc3M6IHRoaXNbJ2NvbC1jbGFzcyddXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdj8pIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2NhcHRpb24nKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5kaXNwbGF5TmFtZSA9IG52IHx8ICcnO1xuICAgICAgICAgICAgdGhpcy50YWJsZS5jYWxsRGF0YUdyaWRNZXRob2QoJ3NldENvbHVtblByb3AnLCB0aGlzLmNvbmZpZy5maWVsZCwgJ2Rpc3BsYXlOYW1lJywgbnYsIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy5wb3B1bGF0ZUNvbmZpZygpO1xuICAgICAgICBzZXRIZWFkZXJDb25maWdGb3JUYWJsZSh0aGlzLnRhYmxlLmhlYWRlckNvbmZpZywgdGhpcy5jb25maWcsIHRoaXMuZ3JvdXAgJiYgdGhpcy5ncm91cC5uYW1lKTtcbiAgICB9XG59XG4iXX0=