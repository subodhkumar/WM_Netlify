import { AbstractHttpService } from '@wm/core';
export declare class AppResourceManagerService {
    private $http;
    get(url: string, useCache?: boolean): string | any;
    clearCache(): void;
    constructor($http: AbstractHttpService);
}
