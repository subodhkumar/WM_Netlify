import { BaseAction } from '../base-action';
export declare class LogoutAction extends BaseAction {
    startUpdate: boolean;
    autoUpdate: boolean;
    useDefaultSuccessHandler: boolean;
    constructor(variable: any);
    logout(options: any, success: any, error: any): void;
    invoke(options: any, success: any, error: any): void;
    cancel(): void;
}
