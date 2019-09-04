import { Injector, OnDestroy, TemplateRef } from '@angular/core';
import { ModalOptions } from 'ngx-bootstrap';
import { IDialog, IWidgetConfig } from '../../../framework/types';
import { BaseComponent } from '../../base/base.component';
export declare abstract class BaseDialog extends BaseComponent implements IDialog, OnDestroy {
    protected modalOptions: ModalOptions;
    name: string;
    private readonly dialogService;
    private readonly bsModal;
    private dialogRef;
    protected constructor(inj: Injector, widgetConfig: IWidgetConfig, modalOptions: ModalOptions);
    /**
     * Opens the dialog
     * Subscribe to the onShown event emitter of bsModal and trigger on-opened event callback
     */
    open(initState?: any): void;
    /**
     * closes the dialog
     * invokes the on-close event callback
     */
    close(): void;
    /**
     * Register the dialog with the dialog service for programmatic access
     */
    protected register(scope: any): void;
    /**
     * De Register the dialog with the dialog service after dialog destruction
     */
    protected deRegister(scope: any): void;
    /**
     * subclasses of BaseDialog must implement this method to return the proper template element ref
     * bsModal will use this refence to open the dialog
     * @returns {TemplateRef<any>}
     */
    protected abstract getTemplateRef(): TemplateRef<any>;
    protected onPropertyChange(key: string, nv: any, ov?: any): void;
    ngOnDestroy(): void;
}
