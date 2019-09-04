/**
 * Returns the value for the provided key in the object
 */
export declare const getObjValueByKey: (obj: any, strKey: string) => any;
/**
 * returns the display field data for any dataset widgets
 * Based on the bind display expression or display expression or display name,
 * data is extracted and formatted from the passed option object
 * If there is field is specified, field value is obtained from the dataObj.
 * If expression is given, evaluates the expression value.
 * else check for bindExpression, extract the value from the dataObj
 */
export declare const getEvaluatedData: (dataObj: any, options: any, context?: any) => any;
export declare const isActiveNavItem: (link: any, routeName: any) => boolean;
/**
 * Returns the orderBy Expression based on the 'sort 'option in pageable object
 * returned by backend
 * @param pageableObj
 * @returns {string}
 */
export declare const getOrderByExpr: (pageableObj: any) => any;
export declare const isDataSetWidget: (widget: any) => boolean;
export declare const getImageUrl: (urlString: any, shouldEncode?: any, defaultUrl?: any) => any;
export declare const getBackGroundImageUrl: (urlString: any) => any;
export declare function provideAs(reference: any, key: any, multi?: boolean): {
    provide: any;
    useExisting: import("@angular/core").Type<any>;
    multi: boolean;
};
export declare function provideAsNgValidators(reference: any): {
    provide: any;
    useExisting: import("@angular/core").Type<any>;
    multi: boolean;
};
export declare function provideAsNgValueAccessor(reference: any): {
    provide: any;
    useExisting: import("@angular/core").Type<any>;
    multi: boolean;
};
export declare function provideAsWidgetRef(reference: any): {
    provide: any;
    useExisting: import("@angular/core").Type<any>;
    multi: boolean;
};
export declare function provideAsDialogRef(reference: any): {
    provide: any;
    useExisting: import("@angular/core").Type<any>;
    multi: boolean;
};
export declare const NAVIGATION_TYPE: {
    ADVANCED: string;
    BASIC: string;
    CLASSIC: string;
    INLINE: string;
    NONE: string;
    ONDEMAND: string;
    PAGER: string;
    SCROLL: string;
};
export declare const getWatchIdentifier: (...args: any[]) => string;
export declare const getMatchModeTypesMap: (multiMode?: any) => {
    boolean: string[];
    clob: any[];
    blob: any[];
};
export declare const getMatchModeMsgs: (appLocale: any) => {
    start: any;
    startignorecase: any;
    end: any;
    endignorecase: any;
    anywhere: any;
    anywhereignorecase: any;
    exact: any;
    exactignorecase: any;
    notequals: any;
    notequalsignorecase: any;
    lessthan: any;
    lessthanequal: any;
    greaterthan: any;
    greaterthanequal: any;
    null: any;
    isnotnull: any;
    empty: any;
    isnotempty: any;
    nullorempty: any;
    in: any;
    notin: any;
    between: any;
};
export declare const getConditionalClasses: (nv: any, ov?: any) => {
    toAdd: any;
    toRemove: any;
};
export declare const prepareFieldDefs: (data: any, options?: any) => any[] | {
    'objects': any[];
    'terminals': any[];
};
