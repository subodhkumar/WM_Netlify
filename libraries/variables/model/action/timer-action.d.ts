import { BaseAction } from '../base-action';
export declare class TimerAction extends BaseAction {
    constructor(variable: any);
    fire(options: any, success: any, error: any): any;
    invoke(options: any, success: any, error: any): any;
    cancel(): any;
}
