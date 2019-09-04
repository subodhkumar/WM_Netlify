import { IDataSource } from '@wm/core';
import { ApiAwareVariable } from './api-aware-variable';
export declare class ServiceVariable extends ApiAwareVariable implements IDataSource {
    _progressObservable: any;
    _observable: any;
    pagination: any;
    constructor(variable: any);
    execute(operation: any, options: any): any;
    invoke(options?: any, success?: any, error?: any): Promise<{}>;
    update(options: any, success?: any, error?: any): Promise<{}>;
    download(options: any, success?: any, error?: any): any;
    setInput(key: any, val?: any, options?: any): any;
    searchRecords(options: any, success?: any, error?: any): Promise<{}>;
    isUpdateRequired(hasData: any): boolean;
    cancel(options?: any): void;
    init(): void;
}
