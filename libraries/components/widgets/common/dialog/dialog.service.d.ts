import { BaseDialog } from './base/base-dialog';
export declare class DialogServiceImpl {
    /**
     * map which contains the references to all dialogs by name
     * @type {Map<any, any>}
     * Ex Map[[dialogName, [[dialogScope, dialogRef]]]]
     */
    private dialogRefsCollection;
    private appConfirmDialog;
    constructor();
    /**
     * Register dialog by name and scope
     * @param {string} name
     * @param {BaseDialog} dialogRef
     * @param {scope}
     */
    register(name: string, dialogRef: BaseDialog, scope: any): void;
    getDialogRefsCollection(): Map<any, any>;
    /**
     * De Register dialog by name and scope
     * @param name
     * @param dialogRef
     * @param scope
     */
    deRegister(name: string, scope: any): void;
    private getDialogRef;
    /**
     * Opens the dialog with the given name
     * @param {string} name
     */
    open(name: string, scope?: any, initState?: any): void;
    /**
     * closes the dialog with the given name
     * @param {string} name
     */
    close(name: string, scope?: any): void;
    /**
     * closes all the opened dialogs
     */
    closeAllDialogs(): void;
    showAppConfirmDialog(initState?: any): void;
    closeAppConfirmDialog(): void;
    getAppConfirmDialog(): string;
    setAppConfirmDialog(dialogName: string): void;
    addToOpenedDialogs(ref: any): void;
    getLastOpenedDialog(): any;
    removeFromOpenedDialogs(ref: any): void;
    getOpenedDialogs(): any[];
    addToClosedDialogs(ref: any): void;
    removeFromClosedDialogs(ref: any): void;
    getDialogRefFromClosedDialogs(): any;
}
