import { Subject } from 'rxjs';
import { AbstractSpinnerService } from '@wm/core';
export declare class SpinnerServiceImpl extends AbstractSpinnerService {
    spinnerId: number;
    messageSource: Subject<{}>;
    messagesByContext: {};
    constructor();
    /**
     * returns the message source subject
     * @returns {Subject<any>}
     */
    getMessageSource(): Subject<{}>;
    /**
     * show spinner on a container element
     */
    showContextSpinner(ctx: string, message: string, id: string): string;
    /**
     * show the app spinner with provided message
     * @param msg
     * @returns {string}
     */
    showAppSpinner(msg: any, id: any): void;
    /**
     * hides the spinner on a particular container(context)
     * @param ctx
     * @param id
     */
    hideContextSpinner(ctx: any, id: any): void;
    /**
     * show spinner
     * @param message
     * @param id
     * @param spinnerClass
     * @param spinnerContext
     * @param variableScopeId
     * @returns {any}
     */
    show(message: any, id?: any, spinnerClass?: any, spinnerContext?: any, variableScopeId?: any): any;
    /**
     * hide the spinner
     * @param spinnerId
     */
    hide(id: any): void;
}
