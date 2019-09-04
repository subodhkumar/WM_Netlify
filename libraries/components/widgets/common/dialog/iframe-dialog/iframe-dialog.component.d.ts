import { Injector, OnInit, TemplateRef } from '@angular/core';
import { BaseDialog } from '../base/base-dialog';
export declare class IframeDialogComponent extends BaseDialog implements OnInit {
    static initializeProps: void;
    dialogTemplate: TemplateRef<any>;
    constructor(inj: Injector, dialogClass: string, modal: string | boolean, closable: string | boolean);
    protected getTemplateRef(): TemplateRef<any>;
    /**
     * Click event handler for the ok button
     * invokes on-ok event callback
     * @param {Event} $event
     */
    onOk($event: Event): void;
    ngOnInit(): void;
}
