import { AfterViewInit, OnDestroy, QueryList } from '@angular/core';
import { DialogRef } from '../../../framework/types';
import { FormComponent } from '../../form/form.component';
import { MessageComponent } from '../../message/message.component';
export declare class LoginDialogDirective implements AfterViewInit, OnDestroy {
    private contexts;
    private dialogRef;
    formCmp: QueryList<FormComponent>;
    msgCmp: MessageComponent;
    dialogOpenSubscription: any;
    constructor(contexts: Array<any>, dialogRef: DialogRef<any>);
    hideMsg(): void;
    showError(msg: any): void;
    showLoading(): void;
    onSuccess(): void;
    onError(error?: any): void;
    getLoginDetails(): {};
    doLogin(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
}
