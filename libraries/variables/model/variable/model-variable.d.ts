import { IDataSource } from '@wm/core';
import { BaseVariable } from '../base-variable';
export declare class ModelVariable extends BaseVariable implements IDataSource {
    type: any;
    saveInPhonegap: any;
    constructor(variable: any);
    init(): void;
    execute(operation: any, options: any): any;
    isBoundToLocale(): boolean;
    getDefaultLocale(): any;
}
