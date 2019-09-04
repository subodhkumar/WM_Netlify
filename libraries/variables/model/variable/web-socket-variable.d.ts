import { ApiAwareVariable } from './api-aware-variable';
export declare class WebSocketVariable extends ApiAwareVariable {
    constructor(variable: any);
    open(success?: any, error?: any): any;
    close(): any;
    update(): any;
    send(message?: string): any;
    cancel(): any;
    invoke(options?: any, success?: any, error?: any): void;
    init(): void;
}
