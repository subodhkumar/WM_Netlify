import { AbstractHttpService } from '@wm/core';
export declare class MetadataService {
    private $http;
    metadataMap: Map<string, any>;
    CONTEXT_APP: string;
    constructor($http: AbstractHttpService);
    isLoaded(): boolean;
    load(prefabName?: string): Promise<any>;
    getByOperationId(operationId: any, context: any): any;
}
