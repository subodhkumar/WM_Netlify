import { ApiAwareVariable } from './api-aware-variable';
export declare class DeviceVariable extends ApiAwareVariable {
    constructor(variable: any);
    init(): void;
    invoke(options?: any, onSuccess?: any, onError?: any): void;
}
