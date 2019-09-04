export declare class IDataSource {
    execute: (operation: Operation, options?: any) => boolean | string | Promise<any>;
}
declare enum Operation {
    LIST_RECORDS = "listRecords",
    UPDATE_RECORD = "updateRecord",
    INSERT_RECORD = "insertRecord",
    DELETE_RECORD = "deleteRecord",
    INVOKE = "invoke",
    UPDATE = "update",
    NOTIFY = "notify",
    IS_API_AWARE = "isApiAware",
    SUPPORTS_CRUD = "supportsCRUD",
    SUPPORTS_DISTINCT_API = "supportsDistinctAPI",
    IS_PAGEABLE = "isPageable",
    GET_OPERATION_TYPE = "getOperationType",
    GET_RELATED_PRIMARY_KEYS = "getRelatedTablePrimaryKeys",
    GET_ENTITY_NAME = "getEntityName",
    SET_INPUT = "setinput",
    GET_RELATED_TABLE_DATA = "getRelatedTableData",
    GET_DISTINCT_DATA_BY_FIELDS = "getDistinctDataByFields",
    GET_AGGREGATED_DATA = "getAggregatedData",
    GET_MATCH_MODE = "getMatchMode",
    DOWNLOAD = "download",
    GET_NAME = "getName",
    GET_PROPERTIES_MAP = "getPropertiesMap",
    GET_PRIMARY_KEY = "getPrimaryKey",
    GET_BLOB_URL = "getBlobURL",
    SUPPORTS_SERVER_FILTER = "supportsServerFilter",
    GET_OPTIONS = "getOptions",
    SEARCH_RECORDS = "searchRecords",
    GET_REQUEST_PARAMS = "getRequestParams",
    GET_PAGING_OPTIONS = "getPagingOptions",
    FETCH_DISTINCT_VALUES = "fetchDistinctValues",
    GET_UNIQUE_IDENTIFIER = "getUniqueIdentifier",
    GET_CONTEXT_IDENTIFIER = "getContextIdentifier",
    IS_UPDATE_REQUIRED = "isUpdateRequired",
    ADD_ITEM = "addItem",
    SET_ITEM = "setItem",
    REMOVE_ITEM = "removeItem",
    IS_BOUND_TO_LOCALE = "isBoundToLocale",
    GET_DEFAULT_LOCALE = "getDefaultLocale",
    CANCEL = "cancel"
}
export declare const DataSource: {
    Operation: typeof Operation;
};
export declare abstract class App {
    appLocale: any;
    Variables: any;
    Actions: any;
    onAppVariablesReady: Function;
    onSessionTimeout: Function;
    onPageReady: Function;
    onBeforePageLeave: Function;
    onBeforeServiceCall: Function;
    onServiceSuccess: Function;
    onServiceError: Function;
    projectName: string;
    isPrefabType: boolean;
    isApplicationType: boolean;
    isTabletApplicationType: boolean;
    isTemplateBundleType: boolean;
    changeLocale: Function;
    getSelectedLocale: Function;
    reload: Function;
    on401: Function;
    notifyApp: Function;
    getDependency: Function;
    networkStatus: any;
    notify: (eventName: string, data?: any) => void;
    deployedUrl: string;
    selectedViewPort: Object;
    subscribe: (eventName: any, callback: (data: any) => void) => () => void;
    dynamicComponentContainerRef: any;
    activePageName: string;
    activePage: any;
    Page: any;
    landingPageName: string;
    lastActivePageName: string;
}
export declare abstract class AbstractDialogService {
    abstract register(name: string, dialogRef: any, scope: any): any;
    abstract deRegister(name: string, scope: any): any;
    abstract open(name: string, scope?: any, initState?: any): any;
    abstract close(name: string, scope?: any): any;
    abstract showAppConfirmDialog(initState?: any): any;
    abstract closeAppConfirmDialog(): any;
    abstract getAppConfirmDialog(): any;
    abstract setAppConfirmDialog(dialogName: string): any;
    abstract closeAllDialogs: Function;
    abstract addToOpenedDialogs(ref: any): any;
    abstract getLastOpenedDialog(): any;
    abstract removeFromOpenedDialogs(ref: any): any;
    abstract getOpenedDialogs(): any;
    abstract addToClosedDialogs(ref: any): any;
    abstract removeFromClosedDialogs(ref: any): any;
    abstract getDialogRefFromClosedDialogs(): any;
}
export declare abstract class AbstractHttpService {
    abstract send(options: any): any;
    abstract setLocale(locale: any): any;
    abstract getLocale(): any;
    abstract parseErrors(errors: any): any;
    abstract parseError(errorObj: any): any;
    abstract getHeader(error: any, headerKey: any): any;
    abstract isPlatformSessionTimeout(error: any): any;
    abstract get(url: string, options?: any): any;
    abstract post(url: any, data: any, options: any): any;
    abstract put(url: any, data: any, options: any): any;
    abstract patch(url: any, data: any, options: any): any;
    abstract delete(url: any, options: any): any;
    abstract head(url: any, options: any): any;
    abstract jsonp(url: any, options: any): any;
    abstract upload(url: any, data: any, options: any): any;
    abstract registerOnSessionTimeout(callback: any): any;
    abstract on401(): any;
    abstract pushToSessionFailureQueue(callback: any): any;
    abstract executeSessionFailureRequests(): any;
    abstract sendCallAsObservable(options: any, params?: any): any;
}
export declare abstract class AbstractI18nService {
    abstract getSelectedLocale(): string;
    abstract getDefaultSupportedLocale(): string;
    abstract getAppLocale(): any;
    abstract setSelectedLocale(locale: any): any;
    abstract loadDefaultLocale(): any;
    abstract getLocalizedMessage(message: any, ...args: any[]): any;
    protected abstract loadAppLocaleBundle(): any;
    protected abstract loadMomentLocaleBundle(localeLang: any): any;
    protected abstract loadLocaleBundles(localeLang: any): any;
    abstract getPrefabLocaleBundle(prefabName: string): any;
}
export declare abstract class AbstractToasterService {
    abstract success(title: string, desc: string): any;
    abstract error(title: string, desc: string): any;
    abstract info(title: string, desc: string): any;
    abstract warn(title: string, desc: string): any;
    abstract show(type: string, title: string, desc: string, timeout: number, bodyOutputType: string, onClickHandler: Function, onHideCallback: Function): any;
    abstract hide(toasterObj: any): any;
    abstract showCustom(pageName: string, options?: any): any;
}
export declare abstract class AbstractSpinnerService {
    abstract getMessageSource(): any;
    abstract showContextSpinner(spinnerContext: string, message: string, id: string): any;
    abstract showAppSpinner(msg: string, id: string): any;
    abstract hideContextSpinner(ctx: string, id: string): any;
    abstract show(message: string, id?: string, spinnerClass?: string, spinnerContext?: string, variableScopeId?: string): any;
    abstract hide(id: string): any;
}
export declare abstract class UserDefinedExecutionContext {
}
export interface NavigationOptions {
    $event?: any;
    pageName?: string;
    transition?: string;
    urlParams?: any;
    viewName?: string;
}
export declare abstract class AbstractNavigationService {
    abstract getPageTransition(): string;
    abstract goToPage(pageName: string, options: NavigationOptions): any;
    abstract goToPrevious(): any;
    abstract goToView(viewName: string, options: NavigationOptions, variable: any): any;
}
export declare abstract class AppDefaults {
    dateFormat: any;
    timeFormat: any;
    dateTimeFormat: any;
    abstract setFormats(formats: any): any;
}
export declare abstract class DynamicComponentRefProvider {
    abstract getComponentFactoryRef(selector: string, markup: string, options?: any): any;
}
export {};
