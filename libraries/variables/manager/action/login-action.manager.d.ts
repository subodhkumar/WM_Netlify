import { BaseActionManager } from './base-action.manager';
export declare class LoginActionManager extends BaseActionManager {
    private validate;
    private migrateOldParams;
    login(variable: any, options: any, success: any, error: any): void;
}
