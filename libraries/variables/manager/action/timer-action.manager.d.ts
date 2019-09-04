import { BaseActionManager } from './base-action.manager';
export declare class TimerActionManager extends BaseActionManager {
    trigger(variable: any, options: any, success: any, error: any): any;
    cancel(variable: any): void;
}
