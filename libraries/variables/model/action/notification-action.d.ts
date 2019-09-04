import { IDataSource } from '@wm/core';
import { BaseAction } from '../base-action';
export declare class NotificationAction extends BaseAction implements IDataSource {
    message: string;
    constructor(variable: any);
    execute(operation: any, options: any): any;
    notify(options: any, success: any, error: any): void;
    invoke(options: any, success: any, error: any): void;
    getMessage(): any;
    setMessage(text: any): any;
    clearMessage(): any;
    getOkButtonText(): any;
    setOkButtonText(text: any): any;
    getToasterDuration(): any;
    setToasterDuration(duration: any): any;
    getToasterClass(): any;
    setToasterClass(classText: any): any;
    getToasterPosition(): any;
    setToasterPosition(position: any): any;
    getAlertType(): any;
    setAlertType(type: any): any;
    getCancelButtonText(): any;
    setCancelButtonText(text: any): any;
    init(): void;
}
