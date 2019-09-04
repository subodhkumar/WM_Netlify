import { Injector, OnInit, TemplateRef } from '@angular/core';
import { BaseDialog } from '../base/base-dialog';
export declare class DialogComponent extends BaseDialog implements OnInit {
    static initializeProps: void;
    dialogTemplate: TemplateRef<any>;
    dialogBody: TemplateRef<any>;
    dialogFooter: TemplateRef<any>;
    constructor(inj: Injector, dialogClass: string, modal: string | boolean, closable: string | boolean, contexts: Array<any>);
    protected getTemplateRef(): TemplateRef<any>;
    ngOnInit(): void;
}
