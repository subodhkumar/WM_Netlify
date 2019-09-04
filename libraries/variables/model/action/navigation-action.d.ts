import { BaseAction } from '../base-action';
export declare class NavigationAction extends BaseAction {
    operation: string;
    pageName: string;
    constructor(variable: any);
    invoke(options?: any): void;
    navigate(options?: any): void;
    init(): void;
}
