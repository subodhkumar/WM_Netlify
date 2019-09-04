import { Injector } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractHttpService } from '@wm/core';
export declare class SecurityService {
    private injector;
    private $http;
    private routerService;
    private activatedRoute;
    private _location;
    config: any;
    lastLoggedInUser: any;
    loggedInUser: any;
    loadPromise: Promise<any>;
    requestQueue: any;
    constructor(injector: Injector, $http: AbstractHttpService, routerService: Router, activatedRoute: ActivatedRoute, _location: Location);
    isLoaded(): any;
    get(): any;
    load(): Promise<any>;
    /**
     * gets the security config from the deployed app (backend call)
     * @param success
     * @param error
     */
    getWebConfig(success: any, error: any): void;
    /**
     * Returns security config
     * @param successCallback
     * @param failureCallback
     */
    getConfig(successCallback: any, failureCallback: any): void;
    getLastLoggedInUsername(): any;
    /**
     * Returns the current page name
     * @returns {string}
     */
    getCurrentRoutePage(): string;
    /**
     * Returns Query params for specified param name in current Route
     * @param paramName, the param name whose query param value is to be retrieved
     * @returns {any}
     */
    getCurrentRouteQueryParam(paramName: any): any;
    isNoPageLoaded(): boolean;
    getPageByLoggedInUser(): Promise<{}>;
    /**
     * Loads the App page as follows:
     * Security disabled:
     *      - Home page
     * Security enabled:
     *      - User is logged in, respective landing page is loaded
     *      - Not logged in:
     *          - Home page is public, loads the home page
     *          - Home page not public, Login page(in config) is loaded
     * @param forcePageLoad
     * @returns {Promise<T>}
     */
    loadPageByUserRole(forcePageLoad?: any): Promise<void>;
    /**
     * Navigates to the current user's homePage based on the config in SecurityService
     * Assumption is the SecurityService is updated with the latest security config before making call to this function
     */
    navigateOnLogin(): void;
    /**
     * Gets the page which needs to be redirected to on successful login
     * @param config,
     * @param page, page name for redirection
     * @returns {any|string}
     */
    getRedirectPage(config: any, page?: any): any;
    /**
     * Returns all the query params(including page params and redirect to params) associated with redirected page
     */
    getRedirectedRouteQueryParams(): {};
    getQueryString(queryObject: any): any;
    appLogin(params: any, successCallback: any, failureCallback: any): any;
    /**
     * The API is used to check if the user is authenticated in the RUN mode.
     *
     * @param {function} successCallback to be called on success
     * @param {function} failureCallback to be called on failure
     */
    isAuthenticated(successCallback: any, failureCallback: any): void;
    /**
     * The API is used to logout of the app.
     *
     * @param {function} successCallback to be called on success
     * @param {function} failureCallback to be called on failure
     */
    appLogout(successCallback: any, failureCallback: any): any;
    /**
     * Checks and return the cookie
     * @param name, cookie key
     * @returns {string}
     */
    getCookieByName(name: any): string;
    /**
     * This function returns the cookieValue if xsrf is enabled.
     * In device, xsrf cookie is stored in localStorage.
     * @returns xsrf cookie value
     */
    isXsrfEnabled(): string;
    /**
     * This function returns a promise. Promise is resolved when security is
     * 1. disabled
     * 2. enabled and user is authenticated
     * 3. enabled and user is not authenticated, then promise is resolved on user login
     * @returns {*} promise
     */
    onUserLogin(): Promise<any>;
    /**
     * @returns a promise that is resolved with logged-in-user
     */
    getLoggedInUser(): Promise<any>;
    /**
     * This is for mobile apps to authenticate via browser.
     *
     * @returns a promise that is resolved after login
     */
    authInBrowser(): Promise<any>;
}
