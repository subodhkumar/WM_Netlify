import { BaseAction } from '../base-action';
export declare class LoginAction extends BaseAction {
    startUpdate: boolean;
    autoUpdate: boolean;
    useDefaultSuccessHandler: boolean;
    constructor(variable: any);
    login(options: any, success: any, error: any): any;
    invoke(options: any, success: any, error: any): any;
    cancel(): void;
    init(): void;
}
