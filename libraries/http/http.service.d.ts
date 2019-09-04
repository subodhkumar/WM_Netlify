import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { AbstractHttpService } from '@wm/core';
export declare class HttpServiceImpl extends AbstractHttpService {
    private httpClient;
    nonBodyTypeMethods: string[];
    sessionTimeoutObservable: Subject<{}>;
    sessionTimeoutQueue: any[];
    localeObject: any;
    constructor(httpClient: HttpClient);
    /**
     * This method handles session timeout.
     * @param options
     * @param resolve
     * @param reject
     */
    handleSessionTimeout(options: any, subscriber401?: any): void;
    /**
     * Generates a request with provided options
     * @param options, request params/options
     */
    private generateRequest;
    /**
     * This method filters and returns error message from the failed network call response.
     * @param err, error form network call failure
     */
    getErrMessage(err: any): any;
    /**
     * Make a http call and returns an observable that can be cancelled
     * @param options, options using which the call needs to be made
     */
    sendCallAsObservable(options: any): any;
    /**
     * Makes a http call and return a promise
     * @param options, options using which the call needs to be made
     */
    send(options: any): Promise<{}>;
    setLocale(locale: any): void;
    getLocale(): any;
    parseErrors(errors: any): string;
    parseError(errorObj: any): any;
    getHeader(error: any, headerKey: any): any;
    isPlatformSessionTimeout(error: any): boolean;
    get(url: string, options?: any): Promise<string>;
    post(url: any, data: any, options: any): Promise<{}>;
    put(url: any, data: any, options: any): Promise<{}>;
    patch(url: any, data: any, options: any): Promise<{}>;
    delete(url: any, options: any): Promise<{}>;
    head(url: any, options: any): Promise<{}>;
    jsonp(url: any, options: any): Promise<{}>;
    upload(url: any, data: any, options: any): Observable<HttpEvent<any>>;
    /**
     * registers a callback to be trigerred on session timeout
     * @param callback
     */
    registerOnSessionTimeout(callback: any): void;
    /**
     * trigger the registered methods on session timeout
     */
    on401(): void;
    pushToSessionFailureQueue(callback: any): void;
    /**
     * Execute queued requests, failed due to session timeout
     */
    executeSessionFailureRequests(): void;
}
