export declare class ServiceVariableUtils {
    /**
     * prepares the HTTP request info for a Service Variable
     * @param variable
     * @param operationInfo
     * @param inputFields
     * @returns {any}
     */
    static constructRequestParams(variable: any, operationInfo: any, inputFields: any): any;
    static isFileUploadRequest(variable: any): boolean;
    /**
     * This method returns array of query param names for variable other then page,size,sort
     * @params {params} params of the variable
     */
    static excludePaginationParams(params: any): any;
}
