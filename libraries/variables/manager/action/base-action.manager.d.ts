export declare abstract class BaseActionManager {
    initBinding(variable: any, bindSource?: any, bindTarget?: any): void;
    notifyInflight(variable: any, status: boolean, data?: any): void;
}
