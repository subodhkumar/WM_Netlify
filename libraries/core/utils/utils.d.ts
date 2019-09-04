import { Subject } from 'rxjs';
export declare const enum EVENT_LIFE {
    ONCE = 0,
    WINDOW = 1
}
export declare const isDefined: (v: any) => boolean;
export declare const isObject: (v: any) => boolean;
export declare const toBoolean: (val: any, identity?: any) => boolean;
export declare const isIE: () => boolean;
export declare const isAndroid: () => boolean;
export declare const isAndroidTablet: () => boolean;
export declare const isIphone: () => boolean;
export declare const isIpod: () => boolean;
export declare const isIpad: () => boolean;
export declare const isIos: () => boolean;
export declare const isMobile: () => boolean;
export declare const isMobileApp: () => boolean;
export declare const getAndroidVersion: () => string;
export declare const isKitkatDevice: () => boolean;
/**
 * this method encodes the url and returns the encoded string
 */
export declare const encodeUrl: (url: string) => string;
/**
 * this method encodes the url params and is private to the class only
 */
export declare const encodeUrlParams: (url: string) => string;
export declare const initCaps: (name: any) => any;
export declare const spaceSeparate: (name: any) => any;
export declare const replaceAt: (string: any, index: any, character: any) => any;
export declare const periodSeparate: (name: any) => any;
export declare const prettifyLabel: (label: any) => any;
export declare const deHyphenate: (name: any) => any;
export declare const prettifyLabels: (names: any, separator?: string) => any;
/**
 * this method checks if a insecure content request is being made
 */
export declare const isInsecureContentRequest: (url: string) => boolean;
/**
 * this method checks if a given string starts with the given string
 */
export declare const stringStartsWith: (str: string, startsWith: string, ignoreCase?: any) => boolean;
export declare const getEvaluatedExprValue: (object: any, expression: any) => any;
export declare const isImageFile: (fileName: any) => boolean;
export declare const isAudioFile: (fileName: any) => boolean;
export declare const isVideoFile: (fileName: any) => boolean;
export declare const isValidWebURL: (url: string) => boolean;
export declare const getResourceURL: (urlString: any) => any;
export declare function triggerFn(fn: any, ...argmnts: any[]): any;
/**
 * This method is used to get the formatted date
 */
export declare const getFormattedDate: (datePipe: any, dateObj: any, format: string) => any;
/**
 * method to get the date object from the input received
 */
export declare const getDateObj: (value: any) => Date;
export declare const addEventListenerOnElement: (_element: Element, excludeElement: Element, nativeElement: Element, eventType: any, isDropDownDisplayEnabledOnInput: any, successCB: any, life: EVENT_LIFE, isCapture?: boolean) => () => void;
/**
 * Returns a deep cloned replica of the passed object/array
 * @param object object/array to clone
 * @returns a clone of the passed object
 */
export declare const getClonedObject: (object: any) => any;
export declare const getFiles: (formName: any, fieldName: any, isList: any) => any;
export declare const generateGUId: () => string;
/**
 * Validate if given access role is in current loggedin user access roles
 */
export declare const validateAccessRoles: (roleExp: any, loggedInUser: any) => any;
export declare const getValidJSON: (content: any) => any;
export declare const xmlToJson: (xmlString: any) => any;
export declare const findValueOf: (obj: any, key: any, create?: any) => any;
export declare const extractType: (typeRef: string) => string;
export declare const isNumberType: (type: any) => boolean;
export declare const isEmptyObject: (obj: any) => boolean;
export declare const isPageable: (obj: any) => boolean;
export declare const replace: (template: any, map: any, parseError?: boolean) => any;
export declare const isDateTimeType: (type: any) => any;
export declare const getValidDateObject: (val: any) => any;
export declare const getNativeDateObject: (val: any) => Date;
/**
 * prepare a blob object based on the content and content type provided
 * if content is blob itself, simply returns it back
 * @param val
 * @param valContentType
 * @returns {*}
 */
export declare const getBlob: (val: any, valContentType?: any) => any;
/**
 * This function returns true by comparing two objects based on the fields
 * @param obj1 object
 * @param obj2 object
 * @param compareBy string field values to compare
 * @returns {boolean} true if object equality returns true based on fields
 */
export declare const isEqualWithFields: (obj1: any, obj2: any, compareBy: any) => any;
export declare const loadStyleSheet: (url: any, attr: any) => any;
export declare const loadStyleSheets: (urls?: any[]) => void;
export declare const loadScript: (url: any) => Promise<any>;
export declare const loadScripts: (urls?: any[]) => Promise<void>;
export declare let _WM_APP_PROJECT: any;
/**
 * This function sets session storage item based on the project ID
 * @param key string
 * @param value string
 */
export declare const setSessionStorageItem: (key: any, value: any) => void;
/**
 * This function gets session storage item based on the project ID
 * @param key string
 */
export declare const getSessionStorageItem: (key: any) => string;
export declare const noop: (...args: any[]) => void;
export declare const isArray: (v: any) => any;
export declare const isString: (v: any) => boolean;
export declare const isNumber: (v: any) => boolean;
/**
 * This function returns a blob object from the given file path
 * @param filepath
 * @returns promise having blob object
 */
export declare const convertToBlob: (filepath: any) => Promise<any>;
export declare const hasCordova: () => boolean;
export declare const AppConstants: {
    INT_MAX_VALUE: number;
};
export declare const openLink: (link: string, target?: string) => void;
export declare const fetchContent: (dataType: any, url: string, inSync?: boolean, success?: any, error?: any) => Promise<any>;
/**
 * If the given object is a promise, then object is returned. Otherwise, a promise is resolved with the given object.
 * @param {Promise<T> | T} a
 * @returns {Promise<T>}
 */
export declare const toPromise: <T>(a: T | Promise<T>) => Promise<T>;
/**
 * This function invokes the given the function (fn) until the function successfully executes or the maximum number
 * of retries is reached or onBeforeRetry returns false.
 *
 * @param fn - a function that is needs to be invoked. The function can also return a promise as well.
 * @param interval - minimum time gap between successive retries. This argument should be greater or equal to 0.
 * @param maxRetries - maximum number of retries. This argument should be greater than 0. For all other values,
 * maxRetries is infinity.
 * @param onBeforeRetry - a callback function that will be invoked before re-invoking again. This function can
 * return false or a promise that is resolved to false to stop further retry attempts.
 * @returns {*} a promise that is resolved when fn is success (or) maximum retry attempts reached
 * (or) onBeforeRetry returned false.
 */
export declare const retryIfFails: (fn: () => any, interval: number, maxRetries: number, onBeforeRetry?: () => Promise<boolean>) => Promise<{}>;
/**
 * Promise of a defer created using this function, has abort function that will reject the defer when called.
 * @returns {*} angular defer object
 */
export declare const getAbortableDefer: () => any;
export declare const createCSSRule: (ruleSelector: string, rules: string) => void;
export declare const getUrlParams: (link: any) => {};
export declare const getRouteNameFromLink: (link: any) => any;
export declare const isAppleProduct: boolean;
export declare const defer: () => {
    promise: any;
    resolve: (...args: any[]) => void;
    reject: (...args: any[]) => void;
};
export declare const executePromiseChain: (fns: any, args: any, d?: any, i?: any) => any;
/**
 * This function accepts two data sources and will check if both are same by comparing the unique id and
 * context in which datasources are present
 * @returns {*} boolean true/ false
 */
export declare const isDataSourceEqual: (d1: any, d2: any) => any;
/**
 * checks if the passed datasource context matches with passed context
 * @param ds, datasource having a context
 * @param ctx, context to compare with
 * @returns {boolean}
 */
export declare const validateDataSourceCtx: (ds: any, ctx: any) => boolean;
/**
 * This traverses the filterexpressions object recursively and process the bind string if any in the object
 * @param variable variable object
 * @param name name of the variable
 * @param context scope of the variable
 */
export declare const processFilterExpBindNode: (context: any, filterExpressions: any) => Subject<{}>;
export declare const extendProto: (target: any, proto: any) => void;
export declare const removeExtraSlashes: (url: any) => any;
export declare const getDisplayDateTimeFormat: (type: any) => any;
export declare const addForIdAttributes: (element: HTMLElement) => void;
/**
 * This method is used to adjust the container position depending on the viewport and scroll height.
 * For example: 1. if the widget is at bottom of the page depending on the available bottom space, the picker will open at bottom or top automatically.
 * 2. When we have dataTable with form as a dialog, If widget(ex: search/date/time/datetime) is at bottom of the dialog, the picker is not visible completely. So open the picker at top of the widget.
 * @param containerElem - picker/dropdown container element(jquery)
 * @param parentElem - widget native element
 * @param ref - scope of particular library directive
 * @param ele - Child element(jquery). For some of the widgets(time, search) containerElem doesn't have height. The inner element(dropdown-menu) has height so passing it as optional.
 */
export declare const adjustContainerPosition: (containerElem: any, parentElem: any, ref: any, ele?: any) => void;
export declare const closePopover: (element: any) => void;
/**
 * This method is to trigger change detection in the app
 * This is exposed for the end user developer of WM app
 * This is the alternative for $rs.$safeApply() in AngularJS
 * See $appDigest in utils for more info
 */
export declare const detectChanges: (force?: boolean) => void;
