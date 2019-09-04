import { Directive, Inject, Self } from '@angular/core';
import { $appDigest, AbstractDialogService, App, DataSource, triggerFn } from '@wm/core';
import { TableComponent } from './table.component';
import { refreshDataSource } from '../../../utils/data-utils';
const OPERATION = {
    'NEW': 'new',
    'EDIT': 'edit',
    'DELETE': 'delete'
};
export class TableCUDDirective {
    constructor(table, dialogService, app) {
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
    selectItemOnSuccess(row, skipSelectItem, callBack) {
        /*$timeout is used so that by then $is.dataset has the updated value.
         * Selection of the item is done in the callback of page navigation so that the item that needs to be selected actually exists in the grid.*/
        /*Do not select the item if skip selection item is specified*/
        setTimeout(() => {
            if (!skipSelectItem) {
                this.table.selectItem(row, this.table.dataset);
            }
            triggerFn(callBack);
        }, 250);
    }
    initiateSelectItem(index, row, skipSelectItem, isStaticVariable, callBack) {
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
        this.table.dataNavigator.navigatePage(index, null, true, () => {
            if (this.table.isNavigationEnabled() || isStaticVariable) {
                this.selectItemOnSuccess(row, skipSelectItem, callBack);
            }
        });
    }
    updateVariable(row, callBack) {
        const dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        dataSource.execute(DataSource.Operation.FETCH_DISTINCT_VALUES);
        if (!this.table.isNavigationEnabled()) {
            const sortInfo = this.table.sortInfo;
            const sortOptions = sortInfo && sortInfo.direction ? (sortInfo.field + ' ' + sortInfo.direction) : '';
            refreshDataSource(dataSource, {
                page: 1,
                filterFields: this.table.getFilterFields(this.table.filterInfo),
                orderBy: sortOptions,
                matchMode: 'anywhereignorecase'
            }).then(() => {
                $appDigest();
                this.selectItemOnSuccess(row, true, callBack);
            });
        }
    }
    insertSuccessHandler(response, options) {
        /*Display appropriate error message in case of error.*/
        if (response.error) {
            this.table.invokeEventCallback('error', { $event: options.event, $operation: OPERATION.NEW, $data: response.error });
            this.table.toggleMessage(true, 'error', this.table.errormessage || response.error);
            triggerFn(options.error, response);
        }
        else {
            if (options.event) {
                const row = $(options.event.target).closest('tr');
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
    }
    insertRecord(options) {
        const dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        const dataObject = {
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
            dataSource.execute(DataSource.Operation.INSERT_RECORD, dataObject).then(response => {
                this.insertSuccessHandler(response, options);
            }, error => {
                this.table.invokeEventCallback('error', { $event: options.event, $operation: OPERATION.NEW, $data: error });
                this.table.toggleMessage(true, 'error', this.table.errormessage || error);
                triggerFn(options.error, error);
                triggerFn(options.callBack, undefined, true);
            });
        }
        else {
            this.table.invokeEventCallback('rowinsert', { $event: options.event, row: options.row });
        }
    }
    updateSuccessHandler(response, options) {
        /*Display appropriate error message in case of error.*/
        if (response.error) {
            this.table.invokeEventCallback('error', { $event: options.event, $operation: OPERATION.EDIT, $data: response.error });
            /*disable readonly and show the appropriate error*/
            this.table.toggleMessage(true, 'error', this.table.errormessage || response.error);
            triggerFn(options.error, response);
        }
        else {
            if (options.event) {
                const row = $(options.event.target).closest('tr');
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
    }
    updateRecord(options) {
        const dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        const dataObject = {
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
            dataSource.execute(DataSource.Operation.UPDATE_RECORD, dataObject).then(response => {
                this.updateSuccessHandler(response, options);
            }, error => {
                this.table.invokeEventCallback('error', { $event: options.event, $operation: OPERATION.EDIT, $data: error });
                this.table.toggleMessage(true, 'error', this.table.errormessage || error);
                triggerFn(options.error, error);
                triggerFn(options.callBack, undefined, true);
            });
        }
        else {
            this.table.invokeEventCallback('rowupdate', { $event: options.event, row: options.row });
        }
    }
    onRecordDelete(callBack) {
        let index;
        /*Check for sanity*/
        if (this.table.dataNavigator) {
            this.table.dataNavigator.dataSize -= 1;
            this.table.dataNavigator.calculatePagingValues();
            /*If the current page does not contain any records due to deletion, then navigate to the previous page.*/
            index = this.table.dataNavigator.pageCount < this.table.dataNavigator.dn.currentPage ? 'prev' : undefined;
            this.table.dataNavigator.navigatePage(index, null, true, () => {
                setTimeout(() => {
                    triggerFn(callBack);
                }, undefined, false);
            });
        }
    }
    deleteSuccessHandler(row, response, evt, callBack) {
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
        this.table.invokeEventCallback('rowdelete', { $event: evt, $data: row, row });
        this.table.invokeEventCallback('rowdeleted', { $event: evt, $data: row, row });
    }
    deleteFn(options) {
        const dataSource = this.table.datasource;
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
            }).then(response => {
                this.deleteSuccessHandler(response, options.row, options.evt, options.callBack);
            }, error => {
                triggerFn(options.callBack, undefined, true);
                this.table.invokeEventCallback('error', { $event: options.evt, $operation: OPERATION.DELETE, $data: error });
                this.table.toggleMessage(true, 'error', this.table.errormessage || error);
            });
        }
        else {
            this.table.invokeEventCallback('rowdelete', { $event: options.evt, row: options.row });
        }
        triggerFn(options.cancelRowDeleteCallback);
    }
    deleteRecord(options) {
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
            onOk: () => {
                this.deleteFn(options);
                this.dialogService.closeAppConfirmDialog();
            },
            onCancel: () => {
                triggerFn(options.cancelRowDeleteCallback);
                this.dialogService.closeAppConfirmDialog();
            },
            onOpen: () => {
                // Focus the cancel button on open
                $('.cancel-action').focus();
            }
        });
    }
    editRow(evt) {
        let row;
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
                setTimeout(() => {
                    row = this.table.datagridElement.find('tr.active');
                    if (row.length) {
                        this.table.callDataGridMethod('toggleEditRow', undefined, { $row: row, action: 'edit' });
                    }
                });
            }
        }
    }
    addNewRow() {
        if (!this.table.isGridEditMode) { // If grid is already in edit mode, do not add new row
            this.table.callDataGridMethod('addNewRow');
            if (this.table._liveTableParent) {
                this.table._liveTableParent.addNewRow();
            }
        }
    }
    deleteRow(evt) {
        let row;
        if (evt && evt.target) {
            this.table.callDataGridMethod('deleteRowAndUpdateSelectAll', evt);
        }
        else {
            // Wait for the selected item to get updated
            setTimeout(() => {
                row = evt || this.table.selectedItems[0];
                this.deleteRecord({ row });
            });
        }
    }
    // Function to hide the edited row
    hideEditRow() {
        const $row = this.table.datagridElement.find('tr.row-editing');
        if ($row.length) {
            this.table.callDataGridMethod('hideRowEditMode', $row);
        }
    }
    // Function to save the row
    saveRow() {
        this.table.callDataGridMethod('saveRow');
    }
    // Function to cancel the edit
    cancelRow() {
        const $row = this.table.datagridElement.find('tr.row-editing');
        if ($row.length) {
            this.table.callDataGridMethod('cancelEdit', $row);
        }
    }
}
TableCUDDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmTableCUD]'
            },] }
];
/** @nocollapse */
TableCUDDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [TableComponent,] }] },
    { type: AbstractDialogService },
    { type: App }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtY3VkLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFibGUvdGFibGUtY3VkLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFeEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxxQkFBcUIsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV6RixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFJOUQsTUFBTSxTQUFTLEdBQUc7SUFDZCxLQUFLLEVBQUUsS0FBSztJQUNaLE1BQU0sRUFBRSxNQUFNO0lBQ2QsUUFBUSxFQUFFLFFBQVE7Q0FDckIsQ0FBQztBQUtGLE1BQU0sT0FBTyxpQkFBaUI7SUFFMUIsWUFDNEMsS0FBSyxFQUNyQyxhQUFvQyxFQUNuQyxHQUFRO1FBRnVCLFVBQUssR0FBTCxLQUFLLENBQUE7UUFDckMsa0JBQWEsR0FBYixhQUFhLENBQXVCO1FBQ25DLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFFakIsS0FBSyxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUQsS0FBSyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RCxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMs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QUM7SUFFRCwyQkFBMkI7SUFDM0IsT0FBTztRQUNILElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELDhCQUE4QjtJQUM5QixTQUFTO1FBQ0wsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDL0QsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDckQ7SUFDTCxDQUFDOzs7WUFqVkosU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxjQUFjO2FBQzNCOzs7OzRDQUlRLElBQUksWUFBSSxNQUFNLFNBQUMsY0FBYztZQW5CakIscUJBQXFCO1lBQUUsR0FBRyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSW5qZWN0LCBTZWxmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7ICRhcHBEaWdlc3QsIEFic3RyYWN0RGlhbG9nU2VydmljZSwgQXBwLCBEYXRhU291cmNlLCB0cmlnZ2VyRm4gfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IFRhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi90YWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVmcmVzaERhdGFTb3VyY2UgfSBmcm9tICcuLi8uLi8uLi91dGlscy9kYXRhLXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCAkO1xuXG5jb25zdCBPUEVSQVRJT04gPSB7XG4gICAgJ05FVyc6ICduZXcnLFxuICAgICdFRElUJzogJ2VkaXQnLFxuICAgICdERUxFVEUnOiAnZGVsZXRlJ1xufTtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21UYWJsZUNVRF0nXG59KVxuZXhwb3J0IGNsYXNzIFRhYmxlQ1VERGlyZWN0aXZlIHtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBAU2VsZigpIEBJbmplY3QoVGFibGVDb21wb25lbnQpIHByaXZhdGUgdGFibGUsXG4gICAgICAgIHByaXZhdGUgZGlhbG9nU2VydmljZTogQWJzdHJhY3REaWFsb2dTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlICBhcHA6IEFwcFxuICAgICkge1xuICAgICAgICB0YWJsZS5pbml0aWF0ZVNlbGVjdEl0ZW0gPSB0aGlzLmluaXRpYXRlU2VsZWN0SXRlbS5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS51cGRhdGVWYXJpYWJsZSA9IHRoaXMudXBkYXRlVmFyaWFibGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUudXBkYXRlUmVjb3JkID0gdGhpcy51cGRhdGVSZWNvcmQuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUuZGVsZXRlUmVjb3JkID0gdGhpcy5kZWxldGVSZWNvcmQuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUuaW5zZXJ0UmVjb3JkID0gdGhpcy5pbnNlcnRSZWNvcmQuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUuZWRpdFJvdyA9IHRoaXMuZWRpdFJvdy5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5hZGROZXdSb3cgPSB0aGlzLmFkZE5ld1Jvdy5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5hZGRSb3cgPSB0aGlzLmFkZE5ld1Jvdy5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5kZWxldGVSb3cgPSB0aGlzLmRlbGV0ZVJvdy5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5vblJlY29yZERlbGV0ZSA9IHRoaXMub25SZWNvcmREZWxldGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUuaGlkZUVkaXRSb3cgPSB0aGlzLmhpZGVFZGl0Um93LmJpbmQodGhpcyk7XG4gICAgICAgIHRhYmxlLnNhdmVSb3cgPSB0aGlzLnNhdmVSb3cuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUuY2FuY2VsUm93ID0gdGhpcy5jYW5jZWxSb3cuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbGVjdEl0ZW1PblN1Y2Nlc3Mocm93LCBza2lwU2VsZWN0SXRlbSwgY2FsbEJhY2spIHtcbiAgICAgICAgLyokdGltZW91dCBpcyB1c2VkIHNvIHRoYXQgYnkgdGhlbiAkaXMuZGF0YXNldCBoYXMgdGhlIHVwZGF0ZWQgdmFsdWUuXG4gICAgICAgICAqIFNlbGVjdGlvbiBvZiB0aGUgaXRlbSBpcyBkb25lIGluIHRoZSBjYWxsYmFjayBvZiBwYWdlIG5hdmlnYXRpb24gc28gdGhhdCB0aGUgaXRlbSB0aGF0IG5lZWRzIHRvIGJlIHNlbGVjdGVkIGFjdHVhbGx5IGV4aXN0cyBpbiB0aGUgZ3JpZC4qL1xuICAgICAgICAvKkRvIG5vdCBzZWxlY3QgdGhlIGl0ZW0gaWYgc2tpcCBzZWxlY3Rpb24gaXRlbSBpcyBzcGVjaWZpZWQqL1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmICghc2tpcFNlbGVjdEl0ZW0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLnNlbGVjdEl0ZW0ocm93LCB0aGlzLnRhYmxlLmRhdGFzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJpZ2dlckZuKGNhbGxCYWNrKTtcbiAgICAgICAgfSwgMjUwKTtcbiAgICB9XG5cbiAgICBpbml0aWF0ZVNlbGVjdEl0ZW0oaW5kZXgsIHJvdywgc2tpcFNlbGVjdEl0ZW0/LCBpc1N0YXRpY1ZhcmlhYmxlPywgY2FsbEJhY2s/KSB7XG4gICAgICAgIC8qaW5kZXggPT09IFwibGFzdFwiIGluZGljYXRlcyB0aGF0IGFuIGluc2VydCBvcGVyYXRpb24gaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IHBlcmZvcm1lZCBhbmQgbmF2aWdhdGlvbiB0byB0aGUgbGFzdCBwYWdlIGlzIHJlcXVpcmVkLlxuICAgICAgICAgKiBIZW5jZSBpbmNyZW1lbnQgdGhlIFwiZGF0YVNpemVcIiBieSAxLiovXG4gICAgICAgIGlmIChpbmRleCA9PT0gJ2xhc3QnKSB7XG4gICAgICAgICAgICBpZiAoIWlzU3RhdGljVmFyaWFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmRhdGFOYXZpZ2F0b3IuZGF0YVNpemUgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qVXBkYXRlIHRoZSBkYXRhIGluIHRoZSBjdXJyZW50IHBhZ2UgaW4gdGhlIGdyaWQgYWZ0ZXIgaW5zZXJ0L3VwZGF0ZSBvcGVyYXRpb25zLiovXG4gICAgICAgICAgICBpZiAoIXRoaXMudGFibGUuaXNOYXZpZ2F0aW9uRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSAnY3VycmVudCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLypSZS1jYWxjdWxhdGUgdGhlIHBhZ2luZyB2YWx1ZXMgbGlrZSBwYWdlQ291bnQgZXRjIHRoYXQgY291bGQgY2hhbmdlIGR1ZSB0byBjaGFuZ2UgaW4gdGhlIGRhdGFTaXplLiovXG4gICAgICAgIHRoaXMudGFibGUuZGF0YU5hdmlnYXRvci5jYWxjdWxhdGVQYWdpbmdWYWx1ZXMoKTtcbiAgICAgICAgdGhpcy50YWJsZS5kYXRhTmF2aWdhdG9yLm5hdmlnYXRlUGFnZShpbmRleCwgbnVsbCwgdHJ1ZSwgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMudGFibGUuaXNOYXZpZ2F0aW9uRW5hYmxlZCgpIHx8IGlzU3RhdGljVmFyaWFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdEl0ZW1PblN1Y2Nlc3Mocm93LCBza2lwU2VsZWN0SXRlbSwgY2FsbEJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGVWYXJpYWJsZShyb3c/LCBjYWxsQmFjaz8pIHtcbiAgICAgICAgY29uc3QgZGF0YVNvdXJjZSA9IHRoaXMudGFibGUuZGF0YXNvdXJjZTtcbiAgICAgICAgaWYgKCFkYXRhU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uRkVUQ0hfRElTVElOQ1RfVkFMVUVTKTtcblxuICAgICAgICBpZiAoIXRoaXMudGFibGUuaXNOYXZpZ2F0aW9uRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICBjb25zdCBzb3J0SW5mbyA9IHRoaXMudGFibGUuc29ydEluZm87XG4gICAgICAgICAgICBjb25zdCBzb3J0T3B0aW9ucyAgPSBzb3J0SW5mbyAmJiBzb3J0SW5mby5kaXJlY3Rpb24gPyAoc29ydEluZm8uZmllbGQgKyAnICcgKyBzb3J0SW5mby5kaXJlY3Rpb24pIDogJyc7XG4gICAgICAgICAgICByZWZyZXNoRGF0YVNvdXJjZShkYXRhU291cmNlLCB7XG4gICAgICAgICAgICAgICAgcGFnZTogMSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJGaWVsZHM6IHRoaXMudGFibGUuZ2V0RmlsdGVyRmllbGRzKHRoaXMudGFibGUuZmlsdGVySW5mbyksXG4gICAgICAgICAgICAgICAgb3JkZXJCeTogc29ydE9wdGlvbnMsXG4gICAgICAgICAgICAgICAgbWF0Y2hNb2RlOiAnYW55d2hlcmVpZ25vcmVjYXNlJ1xuICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0SXRlbU9uU3VjY2Vzcyhyb3csIHRydWUsIGNhbGxCYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbnNlcnRTdWNjZXNzSGFuZGxlcihyZXNwb25zZSwgb3B0aW9ucykge1xuICAgICAgICAvKkRpc3BsYXkgYXBwcm9wcmlhdGUgZXJyb3IgbWVzc2FnZSBpbiBjYXNlIG9mIGVycm9yLiovXG4gICAgICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgICAgICAgdGhpcy50YWJsZS5pbnZva2VFdmVudENhbGxiYWNrKCdlcnJvcicsIHskZXZlbnQ6IG9wdGlvbnMuZXZlbnQsICRvcGVyYXRpb246IE9QRVJBVElPTi5ORVcsICRkYXRhOiByZXNwb25zZS5lcnJvcn0pO1xuICAgICAgICAgICAgdGhpcy50YWJsZS50b2dnbGVNZXNzYWdlKHRydWUsICdlcnJvcicsIHRoaXMudGFibGUuZXJyb3JtZXNzYWdlIHx8IHJlc3BvbnNlLmVycm9yKTtcbiAgICAgICAgICAgIHRyaWdnZXJGbihvcHRpb25zLmVycm9yLCByZXNwb25zZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5ldmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9ICQob3B0aW9ucy5ldmVudC50YXJnZXQpLmNsb3Nlc3QoJ3RyJyk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5jYWxsRGF0YUdyaWRNZXRob2QoJ2hpZGVSb3dFZGl0TW9kZScsIHJvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRhYmxlLnRvZ2dsZU1lc3NhZ2UodHJ1ZSwgJ3N1Y2Nlc3MnLCB0aGlzLnRhYmxlLmluc2VydG1lc3NhZ2UpO1xuICAgICAgICAgICAgaWYgKHRoaXMudGFibGUuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlNVUFBPUlRTX0NSVUQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5pbml0aWF0ZVNlbGVjdEl0ZW0odGhpcy50YWJsZS5nZXROYXZpZ2F0aW9uVGFyZ2V0QnlTb3J0SW5mbygpLCByZXNwb25zZSwgdW5kZWZpbmVkLCBmYWxzZSwgb3B0aW9ucy5jYWxsQmFjayk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVWYXJpYWJsZShyZXNwb25zZSwgb3B0aW9ucy5jYWxsQmFjayk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnRhYmxlLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5JU19BUElfQVdBUkUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5pbml0aWF0ZVNlbGVjdEl0ZW0odGhpcy50YWJsZS5nZXROYXZpZ2F0aW9uVGFyZ2V0QnlTb3J0SW5mbygpLCByZXNwb25zZSwgdW5kZWZpbmVkLCBmYWxzZSwgb3B0aW9ucy5jYWxsQmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmlnZ2VyRm4ob3B0aW9ucy5zdWNjZXNzLCByZXNwb25zZSk7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Jvd2luc2VydCcsIHskZXZlbnQ6IG9wdGlvbnMuZXZlbnQsICRkYXRhOiByZXNwb25zZSwgcm93OiByZXNwb25zZX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5zZXJ0UmVjb3JkKG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgZGF0YVNvdXJjZSA9IHRoaXMudGFibGUuZGF0YXNvdXJjZTtcbiAgICAgICAgaWYgKCFkYXRhU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGF0YU9iamVjdCA9IHtcbiAgICAgICAgICAgIHJvdyA6IG9wdGlvbnMucm93LFxuICAgICAgICAgICAgc2tpcE5vdGlmaWNhdGlvbiA6IHRydWUsXG4gICAgICAgICAgICBwZXJpb2Q6IG9wdGlvbnMucGVyaW9kXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5TVVBQT1JUU19DUlVEKSB8fCAhZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0FQSV9BV0FSRSkpIHtcbiAgICAgICAgICAgIGlmICghZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0FQSV9BV0FSRSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uQUREX0lURU0sIHtpdGVtOiBvcHRpb25zLnJvd30pO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0U3VjY2Vzc0hhbmRsZXIob3B0aW9ucy5yb3csIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5JTlNFUlRfUkVDT1JELCBkYXRhT2JqZWN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmluc2VydFN1Y2Nlc3NIYW5kbGVyKHJlc3BvbnNlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmludm9rZUV2ZW50Q2FsbGJhY2soJ2Vycm9yJywgeyRldmVudDogb3B0aW9ucy5ldmVudCwgJG9wZXJhdGlvbjogT1BFUkFUSU9OLk5FVywgJGRhdGE6IGVycm9yfSk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS50b2dnbGVNZXNzYWdlKHRydWUsICdlcnJvcicsIHRoaXMudGFibGUuZXJyb3JtZXNzYWdlIHx8IGVycm9yKTtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4ob3B0aW9ucy5lcnJvciwgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHRyaWdnZXJGbihvcHRpb25zLmNhbGxCYWNrLCB1bmRlZmluZWQsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Jvd2luc2VydCcsIHskZXZlbnQ6IG9wdGlvbnMuZXZlbnQsIHJvdzogb3B0aW9ucy5yb3d9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlU3VjY2Vzc0hhbmRsZXIocmVzcG9uc2UsIG9wdGlvbnMpIHtcbiAgICAgICAgLypEaXNwbGF5IGFwcHJvcHJpYXRlIGVycm9yIG1lc3NhZ2UgaW4gY2FzZSBvZiBlcnJvci4qL1xuICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUuaW52b2tlRXZlbnRDYWxsYmFjaygnZXJyb3InLCB7JGV2ZW50OiBvcHRpb25zLmV2ZW50LCAkb3BlcmF0aW9uOiBPUEVSQVRJT04uRURJVCwgJGRhdGE6IHJlc3BvbnNlLmVycm9yfSk7XG4gICAgICAgICAgICAvKmRpc2FibGUgcmVhZG9ubHkgYW5kIHNob3cgdGhlIGFwcHJvcHJpYXRlIGVycm9yKi9cbiAgICAgICAgICAgIHRoaXMudGFibGUudG9nZ2xlTWVzc2FnZSh0cnVlLCAnZXJyb3InLCB0aGlzLnRhYmxlLmVycm9ybWVzc2FnZSB8fCByZXNwb25zZS5lcnJvcik7XG4gICAgICAgICAgICB0cmlnZ2VyRm4ob3B0aW9ucy5lcnJvciwgcmVzcG9uc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb3cgPSAkKG9wdGlvbnMuZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCd0cicpO1xuICAgICAgICAgICAgICAgIHRoaXMudGFibGUuY2FsbERhdGFHcmlkTWV0aG9kKCdoaWRlUm93RWRpdE1vZGUnLCByb3cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50YWJsZS50b2dnbGVNZXNzYWdlKHRydWUsICdzdWNjZXNzJywgdGhpcy50YWJsZS51cGRhdGVtZXNzYWdlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnRhYmxlLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5TVVBQT1JUU19DUlVEKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudGFibGUuaW5pdGlhdGVTZWxlY3RJdGVtKCdjdXJyZW50JywgcmVzcG9uc2UsIHVuZGVmaW5lZCwgZmFsc2UsIG9wdGlvbnMuY2FsbEJhY2spO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVmFyaWFibGUocmVzcG9uc2UsIG9wdGlvbnMuY2FsbEJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJpZ2dlckZuKG9wdGlvbnMuc3VjY2VzcywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgdGhpcy50YWJsZS5pbnZva2VFdmVudENhbGxiYWNrKCdyb3d1cGRhdGUnLCB7JGV2ZW50OiBvcHRpb25zLmV2ZW50LCAkZGF0YTogcmVzcG9uc2UsIHJvdzogcmVzcG9uc2V9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZVJlY29yZChvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGRhdGFTb3VyY2UgPSB0aGlzLnRhYmxlLmRhdGFzb3VyY2U7XG4gICAgICAgIGlmICghZGF0YVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRhdGFPYmplY3QgPSB7XG4gICAgICAgICAgICByb3cgOiBvcHRpb25zLnJvdyxcbiAgICAgICAgICAgIHByZXZEYXRhIDogb3B0aW9ucy5wcmV2RGF0YSxcbiAgICAgICAgICAgIHNraXBOb3RpZmljYXRpb24gOiB0cnVlLFxuICAgICAgICAgICAgcGVyaW9kIDogb3B0aW9ucy5wZXJpb2RcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlNVUFBPUlRTX0NSVUQpIHx8ICFkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfQVBJX0FXQVJFKSkge1xuICAgICAgICAgICAgaWYgKCFkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfQVBJX0FXQVJFKSkge1xuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5TRVRfSVRFTSwge3ByZXZJdGVtOiBvcHRpb25zLnByZXZEYXRhLCBpdGVtOiBvcHRpb25zLnJvd30pO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU3VjY2Vzc0hhbmRsZXIob3B0aW9ucy5yb3csIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5VUERBVEVfUkVDT1JELCBkYXRhT2JqZWN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVN1Y2Nlc3NIYW5kbGVyKHJlc3BvbnNlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmludm9rZUV2ZW50Q2FsbGJhY2soJ2Vycm9yJywgeyRldmVudDogb3B0aW9ucy5ldmVudCwgJG9wZXJhdGlvbjogT1BFUkFUSU9OLkVESVQsICRkYXRhOiBlcnJvcn0pO1xuICAgICAgICAgICAgICAgIHRoaXMudGFibGUudG9nZ2xlTWVzc2FnZSh0cnVlLCAnZXJyb3InLCB0aGlzLnRhYmxlLmVycm9ybWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckZuKG9wdGlvbnMuZXJyb3IsIGVycm9yKTtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4ob3B0aW9ucy5jYWxsQmFjaywgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50YWJsZS5pbnZva2VFdmVudENhbGxiYWNrKCdyb3d1cGRhdGUnLCB7JGV2ZW50OiBvcHRpb25zLmV2ZW50LCByb3c6IG9wdGlvbnMucm93fSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblJlY29yZERlbGV0ZShjYWxsQmFjaz8pIHtcbiAgICAgICAgbGV0IGluZGV4O1xuICAgICAgICAvKkNoZWNrIGZvciBzYW5pdHkqL1xuICAgICAgICBpZiAodGhpcy50YWJsZS5kYXRhTmF2aWdhdG9yKSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmRhdGFOYXZpZ2F0b3IuZGF0YVNpemUgLT0gMTtcbiAgICAgICAgICAgIHRoaXMudGFibGUuZGF0YU5hdmlnYXRvci5jYWxjdWxhdGVQYWdpbmdWYWx1ZXMoKTtcbiAgICAgICAgICAgIC8qSWYgdGhlIGN1cnJlbnQgcGFnZSBkb2VzIG5vdCBjb250YWluIGFueSByZWNvcmRzIGR1ZSB0byBkZWxldGlvbiwgdGhlbiBuYXZpZ2F0ZSB0byB0aGUgcHJldmlvdXMgcGFnZS4qL1xuICAgICAgICAgICAgaW5kZXggPSB0aGlzLnRhYmxlLmRhdGFOYXZpZ2F0b3IucGFnZUNvdW50IDwgdGhpcy50YWJsZS5kYXRhTmF2aWdhdG9yLmRuLmN1cnJlbnRQYWdlID8gJ3ByZXYnIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy50YWJsZS5kYXRhTmF2aWdhdG9yLm5hdmlnYXRlUGFnZShpbmRleCwgbnVsbCwgdHJ1ZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oY2FsbEJhY2spO1xuICAgICAgICAgICAgICAgIH0sIHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRlbGV0ZVN1Y2Nlc3NIYW5kbGVyKHJvdywgcmVzcG9uc2U/LCBldnQ/LCBjYWxsQmFjaz8pIHtcbiAgICAgICAgLyogY2hlY2sgdGhlIHJlc3BvbnNlIHdoZXRoZXIgdGhlIGRhdGEgc3VjY2Vzc2Z1bGx5IGRlbGV0ZWQgb3Igbm90ICwgaWYgYW55IGVycm9yIG9jY3VycmVkIHNob3cgdGhlXG4gICAgICAgICAqIGNvcnJlc3BvbmRpbmcgZXJyb3IgLCBvdGhlciB3aXNlIHJlbW92ZSB0aGUgcm93IGZyb20gZ3JpZCAqL1xuICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUudG9nZ2xlTWVzc2FnZSh0cnVlLCAnZXJyb3InLCB0aGlzLnRhYmxlLmVycm9ybWVzc2FnZSB8fCByZXNwb25zZS5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vblJlY29yZERlbGV0ZShjYWxsQmFjayk7XG4gICAgICAgIGlmICh0aGlzLnRhYmxlLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5TVVBQT1JUU19DUlVEKSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVWYXJpYWJsZShyb3csIGNhbGxCYWNrKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRhYmxlLnRvZ2dsZU1lc3NhZ2UodHJ1ZSwgJ3N1Y2Nlc3MnLCB0aGlzLnRhYmxlLmRlbGV0ZW1lc3NhZ2UpO1xuICAgICAgICAvLyBjdXN0b20gRXZlbnRIYW5kbGVyIGZvciByb3cgZGVsZXRlZCBldmVudFxuICAgICAgICB0aGlzLnRhYmxlLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Jvd2RlbGV0ZScsIHskZXZlbnQ6IGV2dCwgJGRhdGE6IHJvdywgcm93fSk7XG4gICAgICAgIHRoaXMudGFibGUuaW52b2tlRXZlbnRDYWxsYmFjaygncm93ZGVsZXRlZCcsIHskZXZlbnQ6IGV2dCwgJGRhdGE6IHJvdywgcm93fSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkZWxldGVGbihvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGRhdGFTb3VyY2UgPSB0aGlzLnRhYmxlLmRhdGFzb3VyY2U7XG4gICAgICAgIGlmICghZGF0YVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uU1VQUE9SVFNfQ1JVRCkgfHwgIWRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5JU19BUElfQVdBUkUpKSB7XG4gICAgICAgICAgICBpZiAoIWRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5JU19BUElfQVdBUkUpKSB7XG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlJFTU9WRV9JVEVNLCB7aXRlbTogb3B0aW9ucy5yb3d9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVN1Y2Nlc3NIYW5kbGVyKG9wdGlvbnMucm93LCB1bmRlZmluZWQsIG9wdGlvbnMuZXZ0LCBvcHRpb25zLmNhbGxCYWNrKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uREVMRVRFX1JFQ09SRCwge1xuICAgICAgICAgICAgICAgIHJvdzogb3B0aW9ucy5yb3csXG4gICAgICAgICAgICAgICAgc2tpcE5vdGlmaWNhdGlvbiA6IHRydWUsXG4gICAgICAgICAgICAgICAgcGVyaW9kOiBvcHRpb25zLnBlcmlvZFxuICAgICAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVTdWNjZXNzSGFuZGxlcihyZXNwb25zZSwgb3B0aW9ucy5yb3csIG9wdGlvbnMuZXZ0LCBvcHRpb25zLmNhbGxCYWNrKTtcbiAgICAgICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4ob3B0aW9ucy5jYWxsQmFjaywgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmludm9rZUV2ZW50Q2FsbGJhY2soJ2Vycm9yJywgeyRldmVudDogb3B0aW9ucy5ldnQsICRvcGVyYXRpb246IE9QRVJBVElPTi5ERUxFVEUsICRkYXRhOiBlcnJvcn0pO1xuICAgICAgICAgICAgICAgIHRoaXMudGFibGUudG9nZ2xlTWVzc2FnZSh0cnVlLCAnZXJyb3InLCB0aGlzLnRhYmxlLmVycm9ybWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUuaW52b2tlRXZlbnRDYWxsYmFjaygncm93ZGVsZXRlJywgeyRldmVudDogb3B0aW9ucy5ldnQsIHJvdzogb3B0aW9ucy5yb3d9KTtcbiAgICAgICAgfVxuICAgICAgICB0cmlnZ2VyRm4ob3B0aW9ucy5jYW5jZWxSb3dEZWxldGVDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZGVsZXRlUmVjb3JkKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCF0aGlzLnRhYmxlLmNvbmZpcm1kZWxldGUpIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlRm4ob3B0aW9ucyk7XG4gICAgICAgICAgICB0cmlnZ2VyRm4ob3B0aW9ucy5jYW5jZWxSb3dEZWxldGVDYWxsYmFjayk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kaWFsb2dTZXJ2aWNlLnNob3dBcHBDb25maXJtRGlhbG9nKHtcbiAgICAgICAgICAgIHRpdGxlOiB0aGlzLmFwcC5hcHBMb2NhbGUuTUVTU0FHRV9ERUxFVEVfUkVDT1JEIHx8ICdEZWxldGUgUmVjb3JkJyxcbiAgICAgICAgICAgIGljb25jbGFzczogJ3dpIHdpLWRlbGV0ZSBmYS1sZycsXG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLnRhYmxlLmNvbmZpcm1kZWxldGUsXG4gICAgICAgICAgICBva3RleHQ6IHRoaXMudGFibGUuZGVsZXRlb2t0ZXh0LFxuICAgICAgICAgICAgY2FuY2VsdGV4dDogdGhpcy50YWJsZS5kZWxldGVjYW5jZWx0ZXh0LFxuICAgICAgICAgICAgb25PazogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlRm4ob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgdGhpcy5kaWFsb2dTZXJ2aWNlLmNsb3NlQXBwQ29uZmlybURpYWxvZygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckZuKG9wdGlvbnMuY2FuY2VsUm93RGVsZXRlQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlhbG9nU2VydmljZS5jbG9zZUFwcENvbmZpcm1EaWFsb2coKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbk9wZW46ICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBGb2N1cyB0aGUgY2FuY2VsIGJ1dHRvbiBvbiBvcGVuXG4gICAgICAgICAgICAgICAgJCgnLmNhbmNlbC1hY3Rpb24nKS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBlZGl0Um93KGV2dD8pIHtcbiAgICAgICAgbGV0IHJvdztcbiAgICAgICAgaWYgKGV2dCAmJiBldnQudGFyZ2V0KSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmNhbGxEYXRhR3JpZE1ldGhvZCgndG9nZ2xlRWRpdFJvdycsIGV2dCwgeydzZWxlY3RSb3cnOiB0cnVlLCBhY3Rpb246ICdlZGl0J30pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRm9yIGxpdmUgZm9ybSwgY2FsbCB0aGUgdXBkYXRlIGZ1bmN0aW9uIHdpdGggc2VsZWN0ZWQgaXRlbVxuICAgICAgICAgICAgaWYgKHRoaXMudGFibGUuZWRpdG1vZGUgPT09ICdmb3JtJyB8fCB0aGlzLnRhYmxlLmVkaXRtb2RlID09PSAnZGlhbG9nJykge1xuICAgICAgICAgICAgICAgIHJvdyA9IGV2dCB8fCB0aGlzLnRhYmxlLnNlbGVjdGVkSXRlbXNbMF07XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5ncmlkT3B0aW9ucy5iZWZvcmVSb3dVcGRhdGUocm93KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHNlbGVjdGVkIGl0ZW0gdG8gZ2V0IHVwZGF0ZWRcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcm93ID0gdGhpcy50YWJsZS5kYXRhZ3JpZEVsZW1lbnQuZmluZCgndHIuYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb3cubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmNhbGxEYXRhR3JpZE1ldGhvZCgndG9nZ2xlRWRpdFJvdycsIHVuZGVmaW5lZCwgeyRyb3c6IHJvdywgYWN0aW9uOiAnZWRpdCd9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkTmV3Um93KCkge1xuICAgICAgICBpZiAoIXRoaXMudGFibGUuaXNHcmlkRWRpdE1vZGUpIHsgLy8gSWYgZ3JpZCBpcyBhbHJlYWR5IGluIGVkaXQgbW9kZSwgZG8gbm90IGFkZCBuZXcgcm93XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmNhbGxEYXRhR3JpZE1ldGhvZCgnYWRkTmV3Um93Jyk7XG4gICAgICAgICAgICBpZiAodGhpcy50YWJsZS5fbGl2ZVRhYmxlUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5fbGl2ZVRhYmxlUGFyZW50LmFkZE5ld1JvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVsZXRlUm93KGV2dCkge1xuICAgICAgICBsZXQgcm93O1xuICAgICAgICBpZiAoZXZ0ICYmIGV2dC50YXJnZXQpIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUuY2FsbERhdGFHcmlkTWV0aG9kKCdkZWxldGVSb3dBbmRVcGRhdGVTZWxlY3RBbGwnLCBldnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHNlbGVjdGVkIGl0ZW0gdG8gZ2V0IHVwZGF0ZWRcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvdyA9IGV2dCB8fCB0aGlzLnRhYmxlLnNlbGVjdGVkSXRlbXNbMF07XG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVSZWNvcmQoe3Jvd30pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGdW5jdGlvbiB0byBoaWRlIHRoZSBlZGl0ZWQgcm93XG4gICAgaGlkZUVkaXRSb3coKSB7XG4gICAgICAgIGNvbnN0ICRyb3cgPSB0aGlzLnRhYmxlLmRhdGFncmlkRWxlbWVudC5maW5kKCd0ci5yb3ctZWRpdGluZycpO1xuICAgICAgICBpZiAoJHJvdy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUuY2FsbERhdGFHcmlkTWV0aG9kKCdoaWRlUm93RWRpdE1vZGUnLCAkcm93KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZ1bmN0aW9uIHRvIHNhdmUgdGhlIHJvd1xuICAgIHNhdmVSb3coKSB7XG4gICAgICAgIHRoaXMudGFibGUuY2FsbERhdGFHcmlkTWV0aG9kKCdzYXZlUm93Jyk7XG4gICAgfVxuXG4gICAgLy8gRnVuY3Rpb24gdG8gY2FuY2VsIHRoZSBlZGl0XG4gICAgY2FuY2VsUm93KCkge1xuICAgICAgICBjb25zdCAkcm93ID0gdGhpcy50YWJsZS5kYXRhZ3JpZEVsZW1lbnQuZmluZCgndHIucm93LWVkaXRpbmcnKTtcbiAgICAgICAgaWYgKCRyb3cubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmNhbGxEYXRhR3JpZE1ldGhvZCgnY2FuY2VsRWRpdCcsICRyb3cpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19