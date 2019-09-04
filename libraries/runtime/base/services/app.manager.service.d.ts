import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AbstractDialogService, AbstractHttpService, AbstractI18nService, AbstractSpinnerService, App } from '@wm/core';
import { SecurityService } from '@wm/security';
import { MetadataService, VariablesService } from '@wm/variables';
export declare class AppManagerService {
    private $http;
    private $security;
    private $dialog;
    private $router;
    private $app;
    private $variables;
    private $metadata;
    private $spinner;
    private $i18n;
    private $datePipe;
    private appVariablesLoaded;
    private appVariablesFired;
    private _noRedirect;
    private templates;
    constructor($http: AbstractHttpService, $security: SecurityService, $dialog: AbstractDialogService, $router: Router, $app: App, $variables: VariablesService, $metadata: MetadataService, $spinner: AbstractSpinnerService, $i18n: AbstractI18nService, $datePipe: DatePipe);
    /**
     * On session timeout, if the session timeout config is set to a dialog, then open login dialog
     */
    private showLoginDialog;
    loadAppJS(): void;
    loadCommonPage(): void;
    loadSecurityConfig(): Promise<any>;
    loadMetadata(): Promise<any>;
    loadAppVariables(variables?: any): any;
    /**
     * getter and setter for the property appVariablesFired
     * this flag determines if the app variables(with startUpdate:true) have been fired
     * they should get fired only once through app lifecycle
     * @param {boolean} isFired
     * @returns {boolean}
     */
    isAppVariablesFired(isFired?: boolean): boolean;
    private clearLoggedInUserVariable;
    private updateLoggedInUserVariable;
    /**
     * Overriding the app variable supported locale with the wmProperties i18n DataValues
     *
     * TODO[Vibhu]:
     * Can write a simple migration to sync the supportedLocale variable with '_WM_APP_PROPERTIES.supportedLanguages'
     * Hence, this may not be required
     *
     */
    updateSupportedLocaleVariable(): void;
    handleSSOLogin(config: any): void;
    /**
     * Handles the app when a XHR request returns 401 response
     * If no user was logged in before 401 occurred, First time Login is simulated
     * Else, a session timeout has occurred and the same is simulated
     * @param page  if provided, represents the page name for which XHR request returned 401, on re-login
     *              if not provided, a service request returned 401
     * @param onSuccess success handler
     * @param onError error handler
     */
    handle401(page?: any, options?: any): void;
    /**
     * Updates data dependent on logged in user
     * Reloads security config, metadata
     * Updates the loggedInUserVariable
     * @returns {Promise<void>}
     */
    reloadAppData(): Promise<void>;
    noRedirect(value?: boolean): boolean;
    /**
     * invokes session failure requests
     */
    executeSessionFailureRequests(): void;
    pushToSessionFailureRequests(callback: any): void;
    getDeployedURL(): string;
    notify(eventName: any, data: any): void;
    subscribe(eventName: any, data: any): () => void;
    getActivePage(): any;
    getAppLocale(): any;
    getSelectedLocale(): string;
    notifyApp(template: any, type: any, title?: any): void;
    /**
     * Triggers the onBeforeService method defined in app.js of the app
     * @param requestParams
     */
    appOnBeforeServiceCall(requestParams: any): any;
    /**
     * Triggers the onServiceSuccess method defined in app.js of the app
     * @param data
     * @param xhrObj
     */
    appOnServiceSuccess(data: any, xhrObj: any): any;
    /**
     * Triggers the onServiceError method defined in app.js of the app
     * @param data
     * @param xhrOb
     */
    appOnServiceError(data: any, xhrOb?: any): any;
    /**
     * Triggers the appVariablesReady method defined in app.js of the app
     */
    appVariablesReady(): void;
    /**
     * Returns the pipe based on the input
     */
    getPipe(pipe: any): DatePipe;
    private setLandingPage;
    /**
     * return true if prefab type app
     * @returns {boolean}
     */
    isPrefabType(): boolean;
    /**
     * return true if template bundle type app
     * @returns {boolean}
     */
    isTemplateBundleType(): boolean;
    postMessage(content: any): void;
    showTemplate(idx: any): void;
    postTemplateBundleInfo(): Promise<any>;
    postAppTypeInfo(): Promise<any>;
}
