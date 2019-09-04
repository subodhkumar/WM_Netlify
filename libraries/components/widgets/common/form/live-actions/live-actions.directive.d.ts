import { AbstractDialogService, App } from '@wm/core';
export declare class LiveActionsDirective {
    private subscribedWidget;
    private app;
    private dialogService;
    constructor(subscribedWidget: any, app: App, dialogService: AbstractDialogService);
    addRow(): void;
    updateRow(): void;
    deleteRow(): void;
    private successHandler;
    private errorHandler;
    getRecords(options: any, operation: any): void;
    private performCUDOperation;
    private insertRecord;
    private updateRecord;
    private deleteRecord;
    private performOperation;
    call(operation: any, options: any, success?: any, error?: any): void;
}
