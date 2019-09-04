import { AbstractDialogService, App } from '@wm/core';
export declare class TableCUDDirective {
    private table;
    private dialogService;
    private app;
    constructor(table: any, dialogService: AbstractDialogService, app: App);
    private selectItemOnSuccess;
    initiateSelectItem(index: any, row: any, skipSelectItem?: any, isStaticVariable?: any, callBack?: any): void;
    updateVariable(row?: any, callBack?: any): void;
    private insertSuccessHandler;
    insertRecord(options: any): void;
    private updateSuccessHandler;
    updateRecord(options: any): void;
    onRecordDelete(callBack?: any): void;
    private deleteSuccessHandler;
    private deleteFn;
    deleteRecord(options: any): void;
    editRow(evt?: any): void;
    addNewRow(): void;
    deleteRow(evt: any): void;
    hideEditRow(): void;
    saveRow(): void;
    cancelRow(): void;
}
