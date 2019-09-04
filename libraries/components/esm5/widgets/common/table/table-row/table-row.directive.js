import * as tslib_1 from "tslib";
import { Directive, Injector, Optional, SkipSelf } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './table-row.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';
var WIDGET_CONFIG = { widgetType: 'wm-table-row', hostClass: '' };
var TableRowDirective = /** @class */ (function (_super) {
    tslib_1.__extends(TableRowDirective, _super);
    function TableRowDirective(inj, table) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.table = table;
        return _this;
    }
    TableRowDirective.prototype.populateConfig = function () {
        this.config = {
            closeothers: this.closeothers,
            content: this.content,
            columnwidth: this.columnwidth,
            expandicon: this.expandicon,
            collapseicon: this.collapseicon,
            height: this.height,
            position: this.position
        };
    };
    TableRowDirective.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.populateConfig();
        this.table.registerRow(this.config, this);
    };
    TableRowDirective.prototype.onPropertyChange = function (key, nv) {
        if (key === 'content' && this.config) {
            this.config.content = this.content;
        }
    };
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
    TableRowDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: TableComponent, decorators: [{ type: Optional }, { type: SkipSelf }] }
    ]; };
    return TableRowDirective;
}(BaseComponent));
export { TableRowDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtcm93LmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFibGUvdGFibGUtcm93L3RhYmxlLXJvdy5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFVLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFaEYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFcEQsSUFBTSxhQUFhLEdBQUcsRUFBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUMsQ0FBQztBQUVsRTtJQU11Qyw2Q0FBYTtJQVloRCwyQkFDSSxHQUFhLEVBQ2tCLEtBQXFCO1FBRnhELFlBSUksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQUM1QjtRQUhrQyxXQUFLLEdBQUwsS0FBSyxDQUFnQjs7SUFHeEQsQ0FBQztJQUVELDBDQUFjLEdBQWQ7UUFDSSxJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1YsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzdCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO1lBQzNCLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtZQUMvQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQzFCLENBQUM7SUFDTixDQUFDO0lBRUQsb0NBQVEsR0FBUjtRQUNJLGlCQUFNLFFBQVEsV0FBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCw0Q0FBZ0IsR0FBaEIsVUFBaUIsR0FBVyxFQUFFLEVBQU87UUFDakMsSUFBSSxHQUFHLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztTQUN0QztJQUNMLENBQUM7SUF4Q00saUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUDVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsY0FBYztvQkFDeEIsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDO3FCQUN4QztpQkFDSjs7OztnQkFkbUIsUUFBUTtnQkFLbkIsY0FBYyx1QkF3QmQsUUFBUSxZQUFJLFFBQVE7O0lBNEI3Qix3QkFBQztDQUFBLEFBaERELENBTXVDLGFBQWEsR0EwQ25EO1NBMUNZLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSW5qZWN0b3IsIE9uSW5pdCwgT3B0aW9uYWwsIFNraXBTZWxmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEJhc2VDb21wb25lbnQgfSBmcm9tICcuLi8uLi9iYXNlL2Jhc2UuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3RhYmxlLXJvdy5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgVGFibGVDb21wb25lbnQgfSBmcm9tICcuLi90YWJsZS5jb21wb25lbnQnO1xuXG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS10YWJsZS1yb3cnLCBob3N0Q2xhc3M6ICcnfTtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21UYWJsZVJvd10nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoVGFibGVSb3dEaXJlY3RpdmUpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBUYWJsZVJvd0RpcmVjdGl2ZSBleHRlbmRzIEJhc2VDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBjb25maWc7XG4gICAgY29sdW1ud2lkdGg7XG4gICAgY2xvc2VvdGhlcnM7XG4gICAgY29udGVudDtcbiAgICBleHBhbmRpY29uO1xuICAgIGNvbGxhcHNlaWNvbjtcbiAgICBoZWlnaHQ7XG4gICAgcG9zaXRpb247XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgQE9wdGlvbmFsKCkgQFNraXBTZWxmKCkgcHVibGljIHRhYmxlOiBUYWJsZUNvbXBvbmVudFxuICAgICkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgIH1cblxuICAgIHBvcHVsYXRlQ29uZmlnKCkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgICAgIGNsb3Nlb3RoZXJzOiB0aGlzLmNsb3Nlb3RoZXJzLFxuICAgICAgICAgICAgY29udGVudDogdGhpcy5jb250ZW50LFxuICAgICAgICAgICAgY29sdW1ud2lkdGg6IHRoaXMuY29sdW1ud2lkdGgsXG4gICAgICAgICAgICBleHBhbmRpY29uOiB0aGlzLmV4cGFuZGljb24sXG4gICAgICAgICAgICBjb2xsYXBzZWljb246IHRoaXMuY29sbGFwc2VpY29uLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB0aGlzLnBvc2l0aW9uXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgICAgIHRoaXMucG9wdWxhdGVDb25maWcoKTtcbiAgICAgICAgdGhpcy50YWJsZS5yZWdpc3RlclJvdyh0aGlzLmNvbmZpZywgdGhpcyk7XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnY29udGVudCcgJiYgdGhpcy5jb25maWcpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRlbnQgPSB0aGlzLmNvbnRlbnQ7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=