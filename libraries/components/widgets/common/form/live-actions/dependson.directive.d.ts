import { AfterContentInit, OnDestroy } from '@angular/core';
import { AbstractDialogService, App } from '@wm/core';
export declare class DependsonDirective implements AfterContentInit, OnDestroy {
    private dialogService;
    private app;
    formChildren: any;
    private dialogId;
    private dependson;
    private isLayoutDialog;
    private form;
    private currentOp;
    private formSubscription;
    private eventSubscription;
    constructor(dialogId: string, dependson: string, dialogService: AbstractDialogService, app: App);
    private openFormDialog;
    private onUpdate;
    private onInsert;
    private handleEvent;
    private onFormRender;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
}
