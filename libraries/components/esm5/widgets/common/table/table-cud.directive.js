import { Directive, Inject, Self } from '@angular/core';
import { $appDigest, AbstractDialogService, App, DataSource, triggerFn } from '@wm/core';
import { TableComponent } from './table.component';
import { refreshDataSource } from '../../../utils/data-utils';
var OPERATION = {
    'NEW': 'new',
    'EDIT': 'edit',
    'DELETE': 'delete'
};
var TableCUDDirective = /** @class */ (function () {
    function TableCUDDirective(table, dialogService, app) {
        this.table = table;
        this.dialogService = dialogService;
        this.app = app;
        table.initiateSelectItem = this.initiateSelectItem.bind(this);
        table.updateVariable = this.updateVariable.bind(this);
        table.updateRecord = this.updateRecord.bind(this);
        table.deleteRecord = this.deleteRecord.bind(this);
        table.insertRecord = this.insertRecord.bind(this);
        table.editRow = this.editRow.bind(this);
        table.addNewRow = this.addNewRow.bind(this);
        table.addRow = this.addNewRow.bind(this);
        table.deleteRow = this.deleteRow.bind(this);
        table.onRecordDelete = this.onRecordDelete.bind(this);
        table.hideEditRow = this.hideEditRow.bind(this);
        table.saveRow = this.saveRow.bind(this);
        table.cancelRow = this.cancelRow.bind(this);
    }
    TableCUDDirective.prototype.selectItemOnSuccess = function (row, skipSelectItem, callBack) {
        var _this = this;
        /*$timeout is used so that by then $is.dataset has the updated value.
         * Selection of the item is done in the callback of page navigation so that the item that needs to be selected actually exists in the grid.*/
        /*Do not select the item if skip selection item is specified*/
        setTimeout(function () {
            if (!skipSelectItem) {
                _this.table.selectItem(row, _this.table.dataset);
            }
            triggerFn(callBack);
        }, 250);
    };
    TableCUDDirective.prototype.initiateSelectItem = function (index, row, skipSelectItem, isStaticVariable, callBack) {
        var _this = this;
        /*index === "last" indicates that an insert operation has been successfully performed and navigation to the last page is required.
         * Hence increment the "dataSize" by 1.*/
        if (index === 'last') {
            if (!isStaticVariable) {
                this.table.dataNavigator.dataSize += 1;
            }
            /*Update the data in the current page in the grid after insert/update operations.*/
            if (!this.table.isNavigationEnabled()) {
                index = 'current';
            }
        }
        /*Re-calculate the paging values like pageCount etc that could change due to change in the dataSize.*/
        this.table.dataNavigator.calculatePagingValues();
        this.table.dataNavigator.navigatePage(index, null, true, function () {
            if (_this.table.isNavigationEnabled() || isStaticVariable) {
                _this.selectItemOnSuccess(row, skipSelectItem, callBack);
            }
        });
    };
    TableCUDDirective.prototype.updateVariable = function (row, callBack) {
        var _this = this;
        var dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        dataSource.execute(DataSource.Operation.FETCH_DISTINCT_VALUES);
        if (!this.table.isNavigationEnabled()) {
            var sortInfo = this.table.sortInfo;
            var sortOptions = sortInfo && sortInfo.direction ? (sortInfo.field + ' ' + sortInfo.direction) : '';
            refreshDataSource(dataSource, {
                page: 1,
                filterFields: this.table.getFilterFields(this.table.filterInfo),
                orderBy: sortOptions,
                matchMode: 'anywhereignorecase'
            }).then(function () {
                $appDigest();
                _this.selectItemOnSuccess(row, true, callBack);
            });
        }
    };
    TableCUDDirective.prototype.insertSuccessHandler = function (response, options) {
        /*Display appropriate error message in case of error.*/
        if (response.error) {
            this.table.invokeEventCallback('error', { $event: options.event, $operation: OPERATION.NEW, $data: response.error });
            this.table.toggleMessage(true, 'error', this.table.errormessage || response.error);
            triggerFn(options.error, response);
        }
        else {
            if (options.event) {
                var row = $(options.event.target).closest('tr');
                this.table.callDataGridMethod('hideRowEditMode', row);
            }
            this.table.toggleMessage(true, 'success', this.table.insertmessage);
            if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
                this.table.initiateSelectItem(this.table.getNavigationTargetBySortInfo(), response, undefined, false, options.callBack);
                this.updateVariable(response, options.callBack);
            }
            else if (!this.table.datasource.execute(DataSource.Operation.IS_API_AWARE)) {
                this.table.initiateSelectItem(this.table.getNavigationTargetBySortInfo(), response, undefined, false, options.callBack);
            }
            triggerFn(options.success, response);
            this.table.invokeEventCallback('rowinsert', { $event: options.event, $data: response, row: response });
        }
    };
    TableCUDDirective.prototype.insertRecord = function (options) {
        var _this = this;
        var dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        var dataObject = {
            row: options.row,
            skipNotification: true,
            period: options.period
        };
        if (dataSource.execute(DataSource.Operation.SUPPORTS_CRUD) || !dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
            if (!dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
                dataSource.execute(DataSource.Operation.ADD_ITEM, { item: options.row });
                this.insertSuccessHandler(options.row, options);
                return;
            }
            dataSource.execute(DataSource.Operation.INSERT_RECORD, dataObject).then(function (response) {
                _this.insertSuccessHandler(response, options);
            }, function (error) {
                _this.table.invokeEventCallback('error', { $event: options.event, $operation: OPERATION.NEW, $data: error });
                _this.table.toggleMessage(true, 'error', _this.table.errormessage || error);
                triggerFn(options.error, error);
                triggerFn(options.callBack, undefined, true);
            });
        }
        else {
            this.table.invokeEventCallback('rowinsert', { $event: options.event, row: options.row });
        }
    };
    TableCUDDirective.prototype.updateSuccessHandler = function (response, options) {
        /*Display appropriate error message in case of error.*/
        if (response.error) {
            this.table.invokeEventCallback('error', { $event: options.event, $operation: OPERATION.EDIT, $data: response.error });
            /*disable readonly and show the appropriate error*/
            this.table.toggleMessage(true, 'error', this.table.errormessage || response.error);
            triggerFn(options.error, response);
        }
        else {
            if (options.event) {
                var row = $(options.event.target).closest('tr');
                this.table.callDataGridMethod('hideRowEditMode', row);
            }
            this.table.toggleMessage(true, 'success', this.table.updatemessage);
            if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
                this.table.initiateSelectItem('current', response, undefined, false, options.callBack);
                this.updateVariable(response, options.callBack);
            }
            triggerFn(options.success, response);
            this.table.invokeEventCallback('rowupdate', { $event: options.event, $data: response, row: response });
        }
    };
    TableCUDDirective.prototype.updateRecord = function (options) {
        var _this = this;
        var dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        var dataObject = {
            row: options.row,
            prevData: options.prevData,
            skipNotification: true,
            period: options.period
        };
        if (dataSource.execute(DataSource.Operation.SUPPORTS_CRUD) || !dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
            if (!dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
                dataSource.execute(DataSource.Operation.SET_ITEM, { prevItem: options.prevData, item: options.row });
                this.updateSuccessHandler(options.row, options);
                return;
            }
            dataSource.execute(DataSource.Operation.UPDATE_RECORD, dataObject).then(function (response) {
                _this.updateSuccessHandler(response, options);
            }, function (error) {
                _this.table.invokeEventCallback('error', { $event: options.event, $operation: OPERATION.EDIT, $data: error });
                _this.table.toggleMessage(true, 'error', _this.table.errormessage || error);
                triggerFn(options.error, error);
                triggerFn(options.callBack, undefined, true);
            });
        }
        else {
            this.table.invokeEventCallback('rowupdate', { $event: options.event, row: options.row });
        }
    };
    TableCUDDirective.prototype.onRecordDelete = function (callBack) {
        var index;
        /*Check for sanity*/
        if (this.table.dataNavigator) {
            this.table.dataNavigator.dataSize -= 1;
            this.table.dataNavigator.calculatePagingValues();
            /*If the current page does not contain any records due to deletion, then navigate to the previous page.*/
            index = this.table.dataNavigator.pageCount < this.table.dataNavigator.dn.currentPage ? 'prev' : undefined;
            this.table.dataNavigator.navigatePage(index, null, true, function () {
                setTimeout(function () {
                    triggerFn(callBack);
                }, undefined, false);
            });
        }
    };
    TableCUDDirective.prototype.deleteSuccessHandler = function (row, response, evt, callBack) {
        /* check the response whether the data successfully deleted or not , if any error occurred show the
         * corresponding error , other wise remove the row from grid */
        if (response && response.error) {
            this.table.toggleMessage(true, 'error', this.table.errormessage || response.error);
            return;
        }
        this.onRecordDelete(callBack);
        if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
            this.updateVariable(row, callBack);
        }
        this.table.toggleMessage(true, 'success', this.table.deletemessage);
        // custom EventHandler for row deleted event
        this.table.invokeEventCallback('rowdelete', { $event: evt, $data: row, row: row });
        this.table.invokeEventCallback('rowdeleted', { $event: evt, $data: row, row: row });
    };
    TableCUDDirective.prototype.deleteFn = function (options) {
        var _this = this;
        var dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        if (dataSource.execute(DataSource.Operation.SUPPORTS_CRUD) || !dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
            if (!dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
                dataSource.execute(DataSource.Operation.REMOVE_ITEM, { item: options.row });
                this.deleteSuccessHandler(options.row, undefined, options.evt, options.callBack);
                return;
            }
            dataSource.execute(DataSource.Operation.DELETE_RECORD, {
                row: options.row,
                skipNotification: true,
                period: options.period
            }).then(function (response) {
                _this.deleteSuccessHandler(response, options.row, options.evt, options.callBack);
            }, function (error) {
                triggerFn(options.callBack, undefined, true);
                _this.table.invokeEventCallback('error', { $event: options.evt, $operation: OPERATION.DELETE, $data: error });
                _this.table.toggleMessage(true, 'error', _this.table.errormessage || error);
            });
        }
        else {
            this.table.invokeEventCallback('rowdelete', { $event: options.evt, row: options.row });
        }
        triggerFn(options.cancelRowDeleteCallback);
    };
    TableCUDDirective.prototype.deleteRecord = function (options) {
        var _this = this;
        if (!this.table.confirmdelete) {
            this.deleteFn(options);
            triggerFn(options.cancelRowDeleteCallback);
            return;
        }
        this.dialogService.showAppConfirmDialog({
            title: this.app.appLocale.MESSAGE_DELETE_RECORD || 'Delete Record',
            iconclass: 'wi wi-delete fa-lg',
            message: this.table.confirmdelete,
            oktext: this.table.deleteoktext,
            canceltext: this.table.deletecanceltext,
            onOk: function () {
                _this.deleteFn(options);
                _this.dialogService.closeAppConfirmDialog();
            },
            onCancel: function () {
                triggerFn(options.cancelRowDeleteCallback);
                _this.dialogService.closeAppConfirmDialog();
            },
            onOpen: function () {
                // Focus the cancel button on open
                $('.cancel-action').focus();
            }
        });
    };
    TableCUDDirective.prototype.editRow = function (evt) {
        var _this = this;
        var row;
        if (evt && evt.target) {
            this.table.callDataGridMethod('toggleEditRow', evt, { 'selectRow': true, action: 'edit' });
        }
        else {
            // For live form, call the update function with selected item
            if (this.table.editmode === 'form' || this.table.editmode === 'dialog') {
                row = evt || this.table.selectedItems[0];
                this.table.gridOptions.beforeRowUpdate(row);
            }
            else {
                // Wait for the selected item to get updated
                setTimeout(function () {
                    row = _this.table.datagridElement.find('tr.active');
                    if (row.length) {
                        _this.table.callDataGridMethod('toggleEditRow', undefined, { $row: row, action: 'edit' });
                    }
                });
            }
        }
    };
    TableCUDDirective.prototype.addNewRow = function () {
        if (!this.table.isGridEditMode) { // If grid is already in edit mode, do not add new row
            this.table.callDataGridMethod('addNewRow');
            if (this.table._liveTableParent) {
                this.table._liveTableParent.addNewRow();
            }
        }
    };
    TableCUDDirective.prototype.deleteRow = function (evt) {
        var _this = this;
        var row;
        if (evt && evt.target) {
            this.table.callDataGridMethod('deleteRowAndUpdateSelectAll', evt);
        }
        else {
            // Wait for the selected item to get updated
            setTimeout(function () {
                row = evt || _this.table.selectedItems[0];
                _this.deleteRecord({ row: row });
            });
        }
    };
    // Function to hide the edited row
    TableCUDDirective.prototype.hideEditRow = function () {
        var $row = this.table.datagridElement.find('tr.row-editing');
        if ($row.length) {
            this.table.callDataGridMethod('hideRowEditMode', $row);
        }
    };
    // Function to save the row
    TableCUDDirective.prototype.saveRow = function () {
        this.table.callDataGridMethod('saveRow');
    };
    // Function to cancel the edit
    TableCUDDirective.prototype.cancelRow = function () {
        var $row = this.table.datagridElement.find('tr.row-editing');
        if ($row.length) {
            this.table.callDataGridMethod('cancelEdit', $row);
        }
    };
    TableCUDDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmTableCUD]'
                },] }
    ];
    /** @nocollapse */
    TableCUDDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [TableComponent,] }] },
        { type: AbstractDialogService },
        { type: App }
    ]; };
    return TableCUDDirective;
}());
export { TableCUDDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtY3VkLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFibGUvdGFibGUtY3VkLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFeEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxxQkFBcUIsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV6RixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFJOUQsSUFBTSxTQUFTLEdBQUc7SUFDZCxLQUFLLEVBQUUsS0FBSztJQUNaLE1BQU0sRUFBRSxNQUFNO0lBQ2QsUUFBUSxFQUFFLFFBQVE7Q0FDckIsQ0FBQztBQUVGO0lBS0ksMkJBQzRDLEtBQUssRUFDckMsYUFBb0MsRUFDbkMsR0FBUTtRQUZ1QixVQUFLLEdBQUwsS0FBSyxDQUFBO1FBQ3JDLGtCQUFhLEdBQWIsYUFBYSxDQUF1QjtRQUNuQyxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBRWpCLEtBQUssQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlELEtBQUssQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEQsS0FBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsRCxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FB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O1lBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUMxRDtJQUNMLENBQUM7SUFFRCwyQkFBMkI7SUFDM0IsbUNBQU8sR0FBUDtRQUNJLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELDhCQUE4QjtJQUM5QixxQ0FBUyxHQUFUO1FBQ0ksSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDL0QsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDckQ7SUFDTCxDQUFDOztnQkFqVkosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxjQUFjO2lCQUMzQjs7OztnREFJUSxJQUFJLFlBQUksTUFBTSxTQUFDLGNBQWM7Z0JBbkJqQixxQkFBcUI7Z0JBQUUsR0FBRzs7SUErVi9DLHdCQUFDO0NBQUEsQUFsVkQsSUFrVkM7U0EvVVksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbmplY3QsIFNlbGYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgQWJzdHJhY3REaWFsb2dTZXJ2aWNlLCBBcHAsIERhdGFTb3VyY2UsIHRyaWdnZXJGbiB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgVGFibGVDb21wb25lbnQgfSBmcm9tICcuL3RhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWZyZXNoRGF0YVNvdXJjZSB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2RhdGEtdXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0ICQ7XG5cbmNvbnN0IE9QRVJBVElPTiA9IHtcbiAgICAnTkVXJzogJ25ldycsXG4gICAgJ0VESVQnOiAnZWRpdCcsXG4gICAgJ0RFTEVURSc6ICdkZWxldGUnXG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bVRhYmxlQ1VEXSdcbn0pXG5leHBvcnQgY2xhc3MgVGFibGVDVUREaXJlY3RpdmUge1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIEBTZWxmKCkgQEluamVjdChUYWJsZUNvbXBvbmVudCkgcHJpdmF0ZSB0YWJsZSxcbiAgICAgICAgcHJpdmF0ZSBkaWFsb2dTZXJ2aWNlOiBBYnN0cmFjdERpYWxvZ1NlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgIGFwcDogQXBwXG4gICAgKSB7XG4gICAgICAgIHRhYmxlLmluaXRpYXRlU2VsZWN0SXRlbSA9IHRoaXMuaW5pdGlhdGVTZWxlY3RJdGVtLmJpbmQodGhpcyk7XG4gICAgICAgIHRhYmxlLnVwZGF0ZVZhcmlhYmxlID0gdGhpcy51cGRhdGVWYXJpYWJsZS5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS51cGRhdGVSZWNvcmQgPSB0aGlzLnVwZGF0ZVJlY29yZC5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5kZWxldGVSZWNvcmQgPSB0aGlzLmRlbGV0ZVJlY29yZC5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5pbnNlcnRSZWNvcmQgPSB0aGlzLmluc2VydFJlY29yZC5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5lZGl0Um93ID0gdGhpcy5lZGl0Um93LmJpbmQodGhpcyk7XG4gICAgICAgIHRhYmxlLmFkZE5ld1JvdyA9IHRoaXMuYWRkTmV3Um93LmJpbmQodGhpcyk7XG4gICAgICAgIHRhYmxlLmFkZFJvdyA9IHRoaXMuYWRkTmV3Um93LmJpbmQodGhpcyk7XG4gICAgICAgIHRhYmxlLmRlbGV0ZVJvdyA9IHRoaXMuZGVsZXRlUm93LmJpbmQodGhpcyk7XG4gICAgICAgIHRhYmxlLm9uUmVjb3JkRGVsZXRlID0gdGhpcy5vblJlY29yZERlbGV0ZS5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5oaWRlRWRpdFJvdyA9IHRoaXMuaGlkZUVkaXRSb3cuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUuc2F2ZVJvdyA9IHRoaXMuc2F2ZVJvdy5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5jYW5jZWxSb3cgPSB0aGlzLmNhbmNlbFJvdy5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VsZWN0SXRlbU9uU3VjY2Vzcyhyb3csIHNraXBTZWxlY3RJdGVtLCBjYWxsQmFjaykge1xuICAgICAgICAvKiR0aW1lb3V0IGlzIHVzZWQgc28gdGhhdCBieSB0aGVuICRpcy5kYXRhc2V0IGhhcyB0aGUgdXBkYXRlZCB2YWx1ZS5cbiAgICAgICAgICogU2VsZWN0aW9uIG9mIHRoZSBpdGVtIGlzIGRvbmUgaW4gdGhlIGNhbGxiYWNrIG9mIHBhZ2UgbmF2aWdhdGlvbiBzbyB0aGF0IHRoZSBpdGVtIHRoYXQgbmVlZHMgdG8gYmUgc2VsZWN0ZWQgYWN0dWFsbHkgZXhpc3RzIGluIHRoZSBncmlkLiovXG4gICAgICAgIC8qRG8gbm90IHNlbGVjdCB0aGUgaXRlbSBpZiBza2lwIHNlbGVjdGlvbiBpdGVtIGlzIHNwZWNpZmllZCovXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFza2lwU2VsZWN0SXRlbSkge1xuICAgICAgICAgICAgICAgIHRoaXMudGFibGUuc2VsZWN0SXRlbShyb3csIHRoaXMudGFibGUuZGF0YXNldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmlnZ2VyRm4oY2FsbEJhY2spO1xuICAgICAgICB9LCAyNTApO1xuICAgIH1cblxuICAgIGluaXRpYXRlU2VsZWN0SXRlbShpbmRleCwgcm93LCBza2lwU2VsZWN0SXRlbT8sIGlzU3RhdGljVmFyaWFibGU/LCBjYWxsQmFjaz8pIHtcbiAgICAgICAgLyppbmRleCA9PT0gXCJsYXN0XCIgaW5kaWNhdGVzIHRoYXQgYW4gaW5zZXJ0IG9wZXJhdGlvbiBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgcGVyZm9ybWVkIGFuZCBuYXZpZ2F0aW9uIHRvIHRoZSBsYXN0IHBhZ2UgaXMgcmVxdWlyZWQuXG4gICAgICAgICAqIEhlbmNlIGluY3JlbWVudCB0aGUgXCJkYXRhU2l6ZVwiIGJ5IDEuKi9cbiAgICAgICAgaWYgKGluZGV4ID09PSAnbGFzdCcpIHtcbiAgICAgICAgICAgIGlmICghaXNTdGF0aWNWYXJpYWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudGFibGUuZGF0YU5hdmlnYXRvci5kYXRhU2l6ZSArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLypVcGRhdGUgdGhlIGRhdGEgaW4gdGhlIGN1cnJlbnQgcGFnZSBpbiB0aGUgZ3JpZCBhZnRlciBpbnNlcnQvdXBkYXRlIG9wZXJhdGlvbnMuKi9cbiAgICAgICAgICAgIGlmICghdGhpcy50YWJsZS5pc05hdmlnYXRpb25FbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICBpbmRleCA9ICdjdXJyZW50JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKlJlLWNhbGN1bGF0ZSB0aGUgcGFnaW5nIHZhbHVlcyBsaWtlIHBhZ2VDb3VudCBldGMgdGhhdCBjb3VsZCBjaGFuZ2UgZHVlIHRvIGNoYW5nZSBpbiB0aGUgZGF0YVNpemUuKi9cbiAgICAgICAgdGhpcy50YWJsZS5kYXRhTmF2aWdhdG9yLmNhbGN1bGF0ZVBhZ2luZ1ZhbHVlcygpO1xuICAgICAgICB0aGlzLnRhYmxlLmRhdGFOYXZpZ2F0b3IubmF2aWdhdGVQYWdlKGluZGV4LCBudWxsLCB0cnVlLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy50YWJsZS5pc05hdmlnYXRpb25FbmFibGVkKCkgfHwgaXNTdGF0aWNWYXJpYWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0SXRlbU9uU3VjY2Vzcyhyb3csIHNraXBTZWxlY3RJdGVtLCBjYWxsQmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVwZGF0ZVZhcmlhYmxlKHJvdz8sIGNhbGxCYWNrPykge1xuICAgICAgICBjb25zdCBkYXRhU291cmNlID0gdGhpcy50YWJsZS5kYXRhc291cmNlO1xuICAgICAgICBpZiAoIWRhdGFTb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5GRVRDSF9ESVNUSU5DVF9WQUxVRVMpO1xuXG4gICAgICAgIGlmICghdGhpcy50YWJsZS5pc05hdmlnYXRpb25FbmFibGVkKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNvcnRJbmZvID0gdGhpcy50YWJsZS5zb3J0SW5mbztcbiAgICAgICAgICAgIGNvbnN0IHNvcnRPcHRpb25zICA9IHNvcnRJbmZvICYmIHNvcnRJbmZvLmRpcmVjdGlvbiA/IChzb3J0SW5mby5maWVsZCArICcgJyArIHNvcnRJbmZvLmRpcmVjdGlvbikgOiAnJztcbiAgICAgICAgICAgIHJlZnJlc2hEYXRhU291cmNlKGRhdGFTb3VyY2UsIHtcbiAgICAgICAgICAgICAgICBwYWdlOiAxLFxuICAgICAgICAgICAgICAgIGZpbHRlckZpZWxkczogdGhpcy50YWJsZS5nZXRGaWx0ZXJGaWVsZHModGhpcy50YWJsZS5maWx0ZXJJbmZvKSxcbiAgICAgICAgICAgICAgICBvcmRlckJ5OiBzb3J0T3B0aW9ucyxcbiAgICAgICAgICAgICAgICBtYXRjaE1vZGU6ICdhbnl3aGVyZWlnbm9yZWNhc2UnXG4gICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RJdGVtT25TdWNjZXNzKHJvdywgdHJ1ZSwgY2FsbEJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGluc2VydFN1Y2Nlc3NIYW5kbGVyKHJlc3BvbnNlLCBvcHRpb25zKSB7XG4gICAgICAgIC8qRGlzcGxheSBhcHByb3ByaWF0ZSBlcnJvciBtZXNzYWdlIGluIGNhc2Ugb2YgZXJyb3IuKi9cbiAgICAgICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmludm9rZUV2ZW50Q2FsbGJhY2soJ2Vycm9yJywgeyRldmVudDogb3B0aW9ucy5ldmVudCwgJG9wZXJhdGlvbjogT1BFUkFUSU9OLk5FVywgJGRhdGE6IHJlc3BvbnNlLmVycm9yfSk7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLnRvZ2dsZU1lc3NhZ2UodHJ1ZSwgJ2Vycm9yJywgdGhpcy50YWJsZS5lcnJvcm1lc3NhZ2UgfHwgcmVzcG9uc2UuZXJyb3IpO1xuICAgICAgICAgICAgdHJpZ2dlckZuKG9wdGlvbnMuZXJyb3IsIHJlc3BvbnNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmV2ZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gJChvcHRpb25zLmV2ZW50LnRhcmdldCkuY2xvc2VzdCgndHInKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmNhbGxEYXRhR3JpZE1ldGhvZCgnaGlkZVJvd0VkaXRNb2RlJywgcm93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGFibGUudG9nZ2xlTWVzc2FnZSh0cnVlLCAnc3VjY2VzcycsIHRoaXMudGFibGUuaW5zZXJ0bWVzc2FnZSk7XG4gICAgICAgICAgICBpZiAodGhpcy50YWJsZS5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uU1VQUE9SVFNfQ1JVRCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmluaXRpYXRlU2VsZWN0SXRlbSh0aGlzLnRhYmxlLmdldE5hdmlnYXRpb25UYXJnZXRCeVNvcnRJbmZvKCksIHJlc3BvbnNlLCB1bmRlZmluZWQsIGZhbHNlLCBvcHRpb25zLmNhbGxCYWNrKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVZhcmlhYmxlKHJlc3BvbnNlLCBvcHRpb25zLmNhbGxCYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMudGFibGUuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0FQSV9BV0FSRSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmluaXRpYXRlU2VsZWN0SXRlbSh0aGlzLnRhYmxlLmdldE5hdmlnYXRpb25UYXJnZXRCeVNvcnRJbmZvKCksIHJlc3BvbnNlLCB1bmRlZmluZWQsIGZhbHNlLCBvcHRpb25zLmNhbGxCYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyaWdnZXJGbihvcHRpb25zLnN1Y2Nlc3MsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgIHRoaXMudGFibGUuaW52b2tlRXZlbnRDYWxsYmFjaygncm93aW5zZXJ0JywgeyRldmVudDogb3B0aW9ucy5ldmVudCwgJGRhdGE6IHJlc3BvbnNlLCByb3c6IHJlc3BvbnNlfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnNlcnRSZWNvcmQob3B0aW9ucykge1xuICAgICAgICBjb25zdCBkYXRhU291cmNlID0gdGhpcy50YWJsZS5kYXRhc291cmNlO1xuICAgICAgICBpZiAoIWRhdGFTb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkYXRhT2JqZWN0ID0ge1xuICAgICAgICAgICAgcm93IDogb3B0aW9ucy5yb3csXG4gICAgICAgICAgICBza2lwTm90aWZpY2F0aW9uIDogdHJ1ZSxcbiAgICAgICAgICAgIHBlcmlvZDogb3B0aW9ucy5wZXJpb2RcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlNVUFBPUlRTX0NSVUQpIHx8ICFkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfQVBJX0FXQVJFKSkge1xuICAgICAgICAgICAgaWYgKCFkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfQVBJX0FXQVJFKSkge1xuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5BRERfSVRFTSwge2l0ZW06IG9wdGlvbnMucm93fSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRTdWNjZXNzSGFuZGxlcihvcHRpb25zLnJvdywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklOU0VSVF9SRUNPUkQsIGRhdGFPYmplY3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0U3VjY2Vzc0hhbmRsZXIocmVzcG9uc2UsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudGFibGUuaW52b2tlRXZlbnRDYWxsYmFjaygnZXJyb3InLCB7JGV2ZW50OiBvcHRpb25zLmV2ZW50LCAkb3BlcmF0aW9uOiBPUEVSQVRJT04uTkVXLCAkZGF0YTogZXJyb3J9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLnRvZ2dsZU1lc3NhZ2UodHJ1ZSwgJ2Vycm9yJywgdGhpcy50YWJsZS5lcnJvcm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHRyaWdnZXJGbihvcHRpb25zLmVycm9yLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckZuKG9wdGlvbnMuY2FsbEJhY2ssIHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUuaW52b2tlRXZlbnRDYWxsYmFjaygncm93aW5zZXJ0JywgeyRldmVudDogb3B0aW9ucy5ldmVudCwgcm93OiBvcHRpb25zLnJvd30pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVTdWNjZXNzSGFuZGxlcihyZXNwb25zZSwgb3B0aW9ucykge1xuICAgICAgICAvKkRpc3BsYXkgYXBwcm9wcmlhdGUgZXJyb3IgbWVzc2FnZSBpbiBjYXNlIG9mIGVycm9yLiovXG4gICAgICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgICAgICAgdGhpcy50YWJsZS5pbnZva2VFdmVudENhbGxiYWNrKCdlcnJvcicsIHskZXZlbnQ6IG9wdGlvbnMuZXZlbnQsICRvcGVyYXRpb246IE9QRVJBVElPTi5FRElULCAkZGF0YTogcmVzcG9uc2UuZXJyb3J9KTtcbiAgICAgICAgICAgIC8qZGlzYWJsZSByZWFkb25seSBhbmQgc2hvdyB0aGUgYXBwcm9wcmlhdGUgZXJyb3IqL1xuICAgICAgICAgICAgdGhpcy50YWJsZS50b2dnbGVNZXNzYWdlKHRydWUsICdlcnJvcicsIHRoaXMudGFibGUuZXJyb3JtZXNzYWdlIHx8IHJlc3BvbnNlLmVycm9yKTtcbiAgICAgICAgICAgIHRyaWdnZXJGbihvcHRpb25zLmVycm9yLCByZXNwb25zZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5ldmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9ICQob3B0aW9ucy5ldmVudC50YXJnZXQpLmNsb3Nlc3QoJ3RyJyk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5jYWxsRGF0YUdyaWRNZXRob2QoJ2hpZGVSb3dFZGl0TW9kZScsIHJvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRhYmxlLnRvZ2dsZU1lc3NhZ2UodHJ1ZSwgJ3N1Y2Nlc3MnLCB0aGlzLnRhYmxlLnVwZGF0ZW1lc3NhZ2UpO1xuICAgICAgICAgICAgaWYgKHRoaXMudGFibGUuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlNVUFBPUlRTX0NSVUQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5pbml0aWF0ZVNlbGVjdEl0ZW0oJ2N1cnJlbnQnLCByZXNwb25zZSwgdW5kZWZpbmVkLCBmYWxzZSwgb3B0aW9ucy5jYWxsQmFjayk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVWYXJpYWJsZShyZXNwb25zZSwgb3B0aW9ucy5jYWxsQmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmlnZ2VyRm4ob3B0aW9ucy5zdWNjZXNzLCByZXNwb25zZSk7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Jvd3VwZGF0ZScsIHskZXZlbnQ6IG9wdGlvbnMuZXZlbnQsICRkYXRhOiByZXNwb25zZSwgcm93OiByZXNwb25zZX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlUmVjb3JkKG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgZGF0YVNvdXJjZSA9IHRoaXMudGFibGUuZGF0YXNvdXJjZTtcbiAgICAgICAgaWYgKCFkYXRhU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGF0YU9iamVjdCA9IHtcbiAgICAgICAgICAgIHJvdyA6IG9wdGlvbnMucm93LFxuICAgICAgICAgICAgcHJldkRhdGEgOiBvcHRpb25zLnByZXZEYXRhLFxuICAgICAgICAgICAgc2tpcE5vdGlmaWNhdGlvbiA6IHRydWUsXG4gICAgICAgICAgICBwZXJpb2QgOiBvcHRpb25zLnBlcmlvZFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uU1VQUE9SVFNfQ1JVRCkgfHwgIWRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5JU19BUElfQVdBUkUpKSB7XG4gICAgICAgICAgICBpZiAoIWRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5JU19BUElfQVdBUkUpKSB7XG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlNFVF9JVEVNLCB7cHJldkl0ZW06IG9wdGlvbnMucHJldkRhdGEsIGl0ZW06IG9wdGlvbnMucm93fSk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTdWNjZXNzSGFuZGxlcihvcHRpb25zLnJvdywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlVQREFURV9SRUNPUkQsIGRhdGFPYmplY3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU3VjY2Vzc0hhbmRsZXIocmVzcG9uc2UsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudGFibGUuaW52b2tlRXZlbnRDYWxsYmFjaygnZXJyb3InLCB7JGV2ZW50OiBvcHRpb25zLmV2ZW50LCAkb3BlcmF0aW9uOiBPUEVSQVRJT04uRURJVCwgJGRhdGE6IGVycm9yfSk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS50b2dnbGVNZXNzYWdlKHRydWUsICdlcnJvcicsIHRoaXMudGFibGUuZXJyb3JtZXNzYWdlIHx8IGVycm9yKTtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4ob3B0aW9ucy5lcnJvciwgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHRyaWdnZXJGbihvcHRpb25zLmNhbGxCYWNrLCB1bmRlZmluZWQsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Jvd3VwZGF0ZScsIHskZXZlbnQ6IG9wdGlvbnMuZXZlbnQsIHJvdzogb3B0aW9ucy5yb3d9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUmVjb3JkRGVsZXRlKGNhbGxCYWNrPykge1xuICAgICAgICBsZXQgaW5kZXg7XG4gICAgICAgIC8qQ2hlY2sgZm9yIHNhbml0eSovXG4gICAgICAgIGlmICh0aGlzLnRhYmxlLmRhdGFOYXZpZ2F0b3IpIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUuZGF0YU5hdmlnYXRvci5kYXRhU2l6ZSAtPSAxO1xuICAgICAgICAgICAgdGhpcy50YWJsZS5kYXRhTmF2aWdhdG9yLmNhbGN1bGF0ZVBhZ2luZ1ZhbHVlcygpO1xuICAgICAgICAgICAgLypJZiB0aGUgY3VycmVudCBwYWdlIGRvZXMgbm90IGNvbnRhaW4gYW55IHJlY29yZHMgZHVlIHRvIGRlbGV0aW9uLCB0aGVuIG5hdmlnYXRlIHRvIHRoZSBwcmV2aW91cyBwYWdlLiovXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMudGFibGUuZGF0YU5hdmlnYXRvci5wYWdlQ291bnQgPCB0aGlzLnRhYmxlLmRhdGFOYXZpZ2F0b3IuZG4uY3VycmVudFBhZ2UgPyAncHJldicgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmRhdGFOYXZpZ2F0b3IubmF2aWdhdGVQYWdlKGluZGV4LCBudWxsLCB0cnVlLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXJGbihjYWxsQmFjayk7XG4gICAgICAgICAgICAgICAgfSwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZGVsZXRlU3VjY2Vzc0hhbmRsZXIocm93LCByZXNwb25zZT8sIGV2dD8sIGNhbGxCYWNrPykge1xuICAgICAgICAvKiBjaGVjayB0aGUgcmVzcG9uc2Ugd2hldGhlciB0aGUgZGF0YSBzdWNjZXNzZnVsbHkgZGVsZXRlZCBvciBub3QgLCBpZiBhbnkgZXJyb3Igb2NjdXJyZWQgc2hvdyB0aGVcbiAgICAgICAgICogY29ycmVzcG9uZGluZyBlcnJvciAsIG90aGVyIHdpc2UgcmVtb3ZlIHRoZSByb3cgZnJvbSBncmlkICovXG4gICAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5lcnJvcikge1xuICAgICAgICAgICAgdGhpcy50YWJsZS50b2dnbGVNZXNzYWdlKHRydWUsICdlcnJvcicsIHRoaXMudGFibGUuZXJyb3JtZXNzYWdlIHx8IHJlc3BvbnNlLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uUmVjb3JkRGVsZXRlKGNhbGxCYWNrKTtcbiAgICAgICAgaWYgKHRoaXMudGFibGUuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlNVUFBPUlRTX0NSVUQpKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZhcmlhYmxlKHJvdywgY2FsbEJhY2spO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGFibGUudG9nZ2xlTWVzc2FnZSh0cnVlLCAnc3VjY2VzcycsIHRoaXMudGFibGUuZGVsZXRlbWVzc2FnZSk7XG4gICAgICAgIC8vIGN1c3RvbSBFdmVudEhhbmRsZXIgZm9yIHJvdyBkZWxldGVkIGV2ZW50XG4gICAgICAgIHRoaXMudGFibGUuaW52b2tlRXZlbnRDYWxsYmFjaygncm93ZGVsZXRlJywgeyRldmVudDogZXZ0LCAkZGF0YTogcm93LCByb3d9KTtcbiAgICAgICAgdGhpcy50YWJsZS5pbnZva2VFdmVudENhbGxiYWNrKCdyb3dkZWxldGVkJywgeyRldmVudDogZXZ0LCAkZGF0YTogcm93LCByb3d9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRlbGV0ZUZuKG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgZGF0YVNvdXJjZSA9IHRoaXMudGFibGUuZGF0YXNvdXJjZTtcbiAgICAgICAgaWYgKCFkYXRhU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5TVVBQT1JUU19DUlVEKSB8fCAhZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0FQSV9BV0FSRSkpIHtcbiAgICAgICAgICAgIGlmICghZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0FQSV9BV0FSRSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uUkVNT1ZFX0lURU0sIHtpdGVtOiBvcHRpb25zLnJvd30pO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlU3VjY2Vzc0hhbmRsZXIob3B0aW9ucy5yb3csIHVuZGVmaW5lZCwgb3B0aW9ucy5ldnQsIG9wdGlvbnMuY2FsbEJhY2spO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5ERUxFVEVfUkVDT1JELCB7XG4gICAgICAgICAgICAgICAgcm93OiBvcHRpb25zLnJvdyxcbiAgICAgICAgICAgICAgICBza2lwTm90aWZpY2F0aW9uIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwZXJpb2Q6IG9wdGlvbnMucGVyaW9kXG4gICAgICAgICAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVN1Y2Nlc3NIYW5kbGVyKHJlc3BvbnNlLCBvcHRpb25zLnJvdywgb3B0aW9ucy5ldnQsIG9wdGlvbnMuY2FsbEJhY2spO1xuICAgICAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIHRyaWdnZXJGbihvcHRpb25zLmNhbGxCYWNrLCB1bmRlZmluZWQsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMudGFibGUuaW52b2tlRXZlbnRDYWxsYmFjaygnZXJyb3InLCB7JGV2ZW50OiBvcHRpb25zLmV2dCwgJG9wZXJhdGlvbjogT1BFUkFUSU9OLkRFTEVURSwgJGRhdGE6IGVycm9yfSk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS50b2dnbGVNZXNzYWdlKHRydWUsICdlcnJvcicsIHRoaXMudGFibGUuZXJyb3JtZXNzYWdlIHx8IGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50YWJsZS5pbnZva2VFdmVudENhbGxiYWNrKCdyb3dkZWxldGUnLCB7JGV2ZW50OiBvcHRpb25zLmV2dCwgcm93OiBvcHRpb25zLnJvd30pO1xuICAgICAgICB9XG4gICAgICAgIHRyaWdnZXJGbihvcHRpb25zLmNhbmNlbFJvd0RlbGV0ZUNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBkZWxldGVSZWNvcmQob3B0aW9ucykge1xuICAgICAgICBpZiAoIXRoaXMudGFibGUuY29uZmlybWRlbGV0ZSkge1xuICAgICAgICAgICAgdGhpcy5kZWxldGVGbihvcHRpb25zKTtcbiAgICAgICAgICAgIHRyaWdnZXJGbihvcHRpb25zLmNhbmNlbFJvd0RlbGV0ZUNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRpYWxvZ1NlcnZpY2Uuc2hvd0FwcENvbmZpcm1EaWFsb2coe1xuICAgICAgICAgICAgdGl0bGU6IHRoaXMuYXBwLmFwcExvY2FsZS5NRVNTQUdFX0RFTEVURV9SRUNPUkQgfHwgJ0RlbGV0ZSBSZWNvcmQnLFxuICAgICAgICAgICAgaWNvbmNsYXNzOiAnd2kgd2ktZGVsZXRlIGZhLWxnJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMudGFibGUuY29uZmlybWRlbGV0ZSxcbiAgICAgICAgICAgIG9rdGV4dDogdGhpcy50YWJsZS5kZWxldGVva3RleHQsXG4gICAgICAgICAgICBjYW5jZWx0ZXh0OiB0aGlzLnRhYmxlLmRlbGV0ZWNhbmNlbHRleHQsXG4gICAgICAgICAgICBvbk9rOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVGbihvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpYWxvZ1NlcnZpY2UuY2xvc2VBcHBDb25maXJtRGlhbG9nKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25DYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4ob3B0aW9ucy5jYW5jZWxSb3dEZWxldGVDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgdGhpcy5kaWFsb2dTZXJ2aWNlLmNsb3NlQXBwQ29uZmlybURpYWxvZygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uT3BlbjogKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEZvY3VzIHRoZSBjYW5jZWwgYnV0dG9uIG9uIG9wZW5cbiAgICAgICAgICAgICAgICAkKCcuY2FuY2VsLWFjdGlvbicpLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGVkaXRSb3coZXZ0Pykge1xuICAgICAgICBsZXQgcm93O1xuICAgICAgICBpZiAoZXZ0ICYmIGV2dC50YXJnZXQpIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUuY2FsbERhdGFHcmlkTWV0aG9kKCd0b2dnbGVFZGl0Um93JywgZXZ0LCB7J3NlbGVjdFJvdyc6IHRydWUsIGFjdGlvbjogJ2VkaXQnfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBGb3IgbGl2ZSBmb3JtLCBjYWxsIHRoZSB1cGRhdGUgZnVuY3Rpb24gd2l0aCBzZWxlY3RlZCBpdGVtXG4gICAgICAgICAgICBpZiAodGhpcy50YWJsZS5lZGl0bW9kZSA9PT0gJ2Zvcm0nIHx8IHRoaXMudGFibGUuZWRpdG1vZGUgPT09ICdkaWFsb2cnKSB7XG4gICAgICAgICAgICAgICAgcm93ID0gZXZ0IHx8IHRoaXMudGFibGUuc2VsZWN0ZWRJdGVtc1swXTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmdyaWRPcHRpb25zLmJlZm9yZVJvd1VwZGF0ZShyb3cpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgc2VsZWN0ZWQgaXRlbSB0byBnZXQgdXBkYXRlZFxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByb3cgPSB0aGlzLnRhYmxlLmRhdGFncmlkRWxlbWVudC5maW5kKCd0ci5hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFibGUuY2FsbERhdGFHcmlkTWV0aG9kKCd0b2dnbGVFZGl0Um93JywgdW5kZWZpbmVkLCB7JHJvdzogcm93LCBhY3Rpb246ICdlZGl0J30pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGROZXdSb3coKSB7XG4gICAgICAgIGlmICghdGhpcy50YWJsZS5pc0dyaWRFZGl0TW9kZSkgeyAvLyBJZiBncmlkIGlzIGFscmVhZHkgaW4gZWRpdCBtb2RlLCBkbyBub3QgYWRkIG5ldyByb3dcbiAgICAgICAgICAgIHRoaXMudGFibGUuY2FsbERhdGFHcmlkTWV0aG9kKCdhZGROZXdSb3cnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnRhYmxlLl9saXZlVGFibGVQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLl9saXZlVGFibGVQYXJlbnQuYWRkTmV3Um93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZWxldGVSb3coZXZ0KSB7XG4gICAgICAgIGxldCByb3c7XG4gICAgICAgIGlmIChldnQgJiYgZXZ0LnRhcmdldCkge1xuICAgICAgICAgICAgdGhpcy50YWJsZS5jYWxsRGF0YUdyaWRNZXRob2QoJ2RlbGV0ZVJvd0FuZFVwZGF0ZVNlbGVjdEFsbCcsIGV2dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgc2VsZWN0ZWQgaXRlbSB0byBnZXQgdXBkYXRlZFxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm93ID0gZXZ0IHx8IHRoaXMudGFibGUuc2VsZWN0ZWRJdGVtc1swXTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVJlY29yZCh7cm93fSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZ1bmN0aW9uIHRvIGhpZGUgdGhlIGVkaXRlZCByb3dcbiAgICBoaWRlRWRpdFJvdygpIHtcbiAgICAgICAgY29uc3QgJHJvdyA9IHRoaXMudGFibGUuZGF0YWdyaWRFbGVtZW50LmZpbmQoJ3RyLnJvdy1lZGl0aW5nJyk7XG4gICAgICAgIGlmICgkcm93Lmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy50YWJsZS5jYWxsRGF0YUdyaWRNZXRob2QoJ2hpZGVSb3dFZGl0TW9kZScsICRyb3cpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRnVuY3Rpb24gdG8gc2F2ZSB0aGUgcm93XG4gICAgc2F2ZVJvdygpIHtcbiAgICAgICAgdGhpcy50YWJsZS5jYWxsRGF0YUdyaWRNZXRob2QoJ3NhdmVSb3cnKTtcbiAgICB9XG5cbiAgICAvLyBGdW5jdGlvbiB0byBjYW5jZWwgdGhlIGVkaXRcbiAgICBjYW5jZWxSb3coKSB7XG4gICAgICAgIGNvbnN0ICRyb3cgPSB0aGlzLnRhYmxlLmRhdGFncmlkRWxlbWVudC5maW5kKCd0ci5yb3ctZWRpdGluZycpO1xuICAgICAgICBpZiAoJHJvdy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUuY2FsbERhdGFHcmlkTWV0aG9kKCdjYW5jZWxFZGl0JywgJHJvdyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=