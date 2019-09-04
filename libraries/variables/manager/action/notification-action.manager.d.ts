import { BaseActionManager } from './base-action.manager';
export declare class NotificationActionManager extends BaseActionManager {
    private onToasterClick;
    private onToasterHide;
    private notifyViaToaster;
    private notifyViaDialog;
    notify(variable: any, options: any, success: any, error: any): void;
    getMessage(variable: any): any;
    setMessage(variable: any, text: any): any;
    getOkButtonText(variable: any): any;
    setOkButtonText(variable: any, text: any): any;
    getToasterDuration(variable: any): any;
    setToasterDuration(variable: any, duration: any): any;
    getToasterClass(variable: any): any;
    setToasterClass(variable: any, type: any): any;
    getToasterPosition(variable: any): any;
    setToasterPosition(variable: any, position: any): any;
    getAlertType(variable: any): any;
    setAlertType(variable: any, alerttype: any): any;
    getCancelButtonText(variable: any): any;
    setCancelButtonText(variable: any, text: any): any;
}
