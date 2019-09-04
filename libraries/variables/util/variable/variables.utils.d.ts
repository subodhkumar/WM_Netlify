export declare let appManager: any;
export declare let httpService: any;
export declare let metadataService: any;
export declare let navigationService: any;
export declare let routerService: any;
export declare let toasterService: any;
export declare let oauthService: any;
export declare let securityService: any;
export declare let dialogService: any;
export declare const setDependency: (type: string, ref: any) => void;
export declare const initiateCallback: (type: string, variable: any, data: any, options?: any, skipDefaultNotification?: boolean) => any;
/**
 * Initializes watchers for binding expressions configured in the variable
 * @param variable
 * @param context, scope context in which the variable exists
 * @param {string} bindSource,  the field in variable where the databindings are configured
 *                              for most variables, it will be 'dataBinding', hence default fallback is to 'dataBinding'
 *                              for some it can be 'dataSet' and hence will be passed as param
 * @param {string} bindTarget, the object field in variable where the computed bindings will be set
 */
export declare const processBinding: (variable: any, context: any, bindSource?: string, bindTarget?: string) => void;
/**
 * Downloads a file in the browser.
 * Two methods to do so, namely:
 * 1. downloadThroughAnchor, called if
 *      - if a header is to be passed
 *      OR
 *      - if security is ON and XSRF token is to be sent as well
 * NOTE: This method does not work with Safari version 10.0 and below
 *
 * 2. downloadThroughIframe
 *      - this method works across browsers and uses an iframe to downlad the file.
 * @param requestParams request params object
 * @param fileName represents the file name
 * @param exportFormat downloaded file format
 * @param success success callback
 * @param error error callback
 */
export declare const simulateFileDownload: (requestParams: any, fileName: any, exportFormat: any, success: any, error: any) => void;
/**
 * sets the value against passed key on the "inputFields" object in the variable
 * @param targetObj: the object in which the key, value is to be set
 * @param variable
 * @param key: can be:
 *  - a string e.g. "username"
 *  - an object, e.g. {"username": "john", "ssn": "11111"}
 * @param val
 * - if key is string, the value against it (for that data type)
 * - if key is object, not required
 * @param options
 * @returns {any}
 */
export declare const setInput: (targetObj: any, key: any, val: any, options: any) => any;
/**
 * returns true if HTML5 File API is available else false
 * @returns {{prototype: Blob; new(blobParts?: any[], options?: BlobPropertyBag): Blob}}
 */
export declare const isFileUploadSupported: () => any;
/**
 *
 * @param varOrder
 * @param optionsOrder
 * @returns {any}
 */
export declare const getEvaluatedOrderBy: (varOrder: any, optionsOrder: any) => any;
/**
 * formatting the expression as required by backend which was enclosed by ${<expression>}.
 * @param fieldDefs
 * returns fieldDefs
 */
export declare const formatExportExpression: (fieldDefs: any) => any;
export declare const debounceVariableCall: (variable: any, op: any) => void;
export declare const formatDate: (value: any, type: any) => any;
