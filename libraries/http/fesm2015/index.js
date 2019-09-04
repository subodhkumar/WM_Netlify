import { CommonModule } from '@angular/common';
import { Injectable, NgModule } from '@angular/core';
import { Subject } from 'rxjs';
import { AbstractHttpService, getValidJSON, replace } from '@wm/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpResponse, HttpClientModule } from '@angular/common/http';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class HttpServiceImpl extends AbstractHttpService {
    /**
     * @param {?} httpClient
     */
    constructor(httpClient) {
        super();
        this.httpClient = httpClient;
        this.nonBodyTypeMethods = ['GET', 'DELETE', 'HEAD', 'OPTIONS', 'JSONP'];
        this.sessionTimeoutObservable = new Subject();
        this.sessionTimeoutQueue = [];
    }
    /**
     * This method handles session timeout.
     * @param {?} options
     * @param {?=} subscriber401
     * @return {?}
     */
    handleSessionTimeout(options, subscriber401) {
        this.sessionTimeoutQueue.push({
            requestInfo: options,
            sub401: subscriber401
        });
        this.on401();
    }
    /**
     * Generates a request with provided options
     * @private
     * @param {?} options
     * @return {?}
     */
    generateRequest(options) {
        /** @type {?} */
        let reqHeaders = new HttpHeaders();
        /** @type {?} */
        let reqParams = new HttpParams();
        /** @type {?} */
        const headers = options.headers;
        /** @type {?} */
        const params = options.params;
        /** @type {?} */
        const responseType = options.responseType;
        // this header is not to be sent with non-proxy calls from service variable
        if (!options.isDirectCall) {
            reqHeaders = reqHeaders.append('X-Requested-With', 'XMLHttpRequest');
        }
        // headers
        if (headers) {
            Object.entries(headers).forEach(([k, v]) => reqHeaders = reqHeaders.append(k, (/** @type {?} */ (v))));
        }
        // params
        if (params) {
            Object.entries(params).forEach(([k, v]) => reqParams = reqParams.append(k, (/** @type {?} */ (v))));
        }
        /** @type {?} */
        let third;
        /** @type {?} */
        let fourth;
        /** @type {?} */
        const reqOptions = {
            headers: reqHeaders,
            params: reqParams,
            responseType: responseType
        };
        if (_.includes(this.nonBodyTypeMethods, options.method && options.method.toUpperCase())) {
            third = reqOptions;
            fourth = null;
        }
        else {
            third = options.data;
            fourth = reqOptions;
        }
        return new HttpRequest(options.method, options.url, third, fourth);
    }
    /**
     * This method filters and returns error message from the failed network call response.
     * @param {?} err
     * @return {?}
     */
    getErrMessage(err) {
        /** @type {?} */
        const HTTP_STATUS_MSG = {
            404: this.getLocale()['MESSAGE_404_ERROR'] || 'Requested resource not found',
            401: this.getLocale()['MESSAGE_401_ERROR'] || 'Requested resource requires authentication',
            403: this.getLocale()['LABEL_FORBIDDEN_MESSAGE'] || 'The requested resource access/action is forbidden.'
        };
        // check if error message present for responded http status
        /** @type {?} */
        let errMsg = HTTP_STATUS_MSG[err.status];
        /** @type {?} */
        let errorDetails = err.error;
        errorDetails = getValidJSON(errorDetails) || errorDetails;
        // WM services have the format of error response as errorDetails.error
        if (errorDetails && errorDetails.errors) {
            errMsg = this.parseErrors(errorDetails.errors);
        }
        else {
            errMsg = errMsg || 'Service Call Failed';
        }
        return errMsg;
    }
    /**
     * Make a http call and returns an observable that can be cancelled
     * @param {?} options
     * @return {?}
     */
    sendCallAsObservable(options) {
        /** @type {?} */
        const req = this.generateRequest(options);
        return this.httpClient.request(req);
    }
    /**
     * Makes a http call and return a promise
     * @param {?} options
     * @return {?}
     */
    send(options) {
        /** @type {?} */
        const req = this.generateRequest(options);
        return new Promise((resolve, reject) => {
            this.httpClient.request(req).toPromise().then((response) => {
                resolve(response);
            }, (err) => {
                if (this.isPlatformSessionTimeout(err)) {
                    err._401Subscriber.asObservable().subscribe((response) => {
                        resolve(response);
                    }, (e) => {
                        reject(e);
                    });
                }
                else {
                    /** @type {?} */
                    const errMsg = this.getErrMessage(err);
                    reject({
                        error: errMsg,
                        details: err
                    });
                }
            });
        });
    }
    /**
     * @param {?} locale
     * @return {?}
     */
    setLocale(locale) {
        this.localeObject = locale;
    }
    /**
     * @return {?}
     */
    getLocale() {
        return this.localeObject;
    }
    /**
     * @param {?} errors
     * @return {?}
     */
    parseErrors(errors) {
        /** @type {?} */
        let errMsg = '';
        errors.error.forEach((errorDetails, i) => {
            errMsg += this.parseError(errorDetails) + (i > 0 ? '\n' : '');
        });
        return errMsg;
    }
    /**
     * @param {?} errorObj
     * @return {?}
     */
    parseError(errorObj) {
        /** @type {?} */
        let errMsg;
        errMsg = errorObj.message ? replace(errorObj.message, errorObj.parameters, true) : ((errorObj.parameters && errorObj.parameters[0]) || '');
        return errMsg;
    }
    /**
     * @param {?} error
     * @param {?} headerKey
     * @return {?}
     */
    getHeader(error, headerKey) {
        return error.headers.get(headerKey);
    }
    /**
     * @param {?} error
     * @return {?}
     */
    isPlatformSessionTimeout(error) {
        /** @type {?} */
        const MSG_SESSION_NOT_FOUND = 'Session Not Found';
        return error.status === 401 && this.getHeader(error, 'x-wm-login-errormessage') === MSG_SESSION_NOT_FOUND;
    }
    /**
     * @param {?} url
     * @param {?=} options
     * @return {?}
     */
    get(url, options) {
        options = options || {};
        options.url = url;
        options.method = 'get';
        return this.send(options).then((response) => response.body);
    }
    /**
     * @param {?} url
     * @param {?} data
     * @param {?} options
     * @return {?}
     */
    post(url, data, options) {
        options = options || {};
        options.url = url;
        options.method = 'post';
        options.data = data;
        return this.send(options);
    }
    /**
     * @param {?} url
     * @param {?} data
     * @param {?} options
     * @return {?}
     */
    put(url, data, options) {
        options = options || {};
        options.url = url;
        options.method = 'put';
        options.data = data;
        return this.send(options);
    }
    /**
     * @param {?} url
     * @param {?} data
     * @param {?} options
     * @return {?}
     */
    patch(url, data, options) {
        options = options || {};
        options.url = url;
        options.method = 'patch';
        options.data = data;
        return this.send(options);
    }
    /**
     * @param {?} url
     * @param {?} options
     * @return {?}
     */
    delete(url, options) {
        options = options || {};
        options.url = url;
        options.method = 'delete';
        return this.send(options);
    }
    /**
     * @param {?} url
     * @param {?} options
     * @return {?}
     */
    head(url, options) {
        options = options || {};
        options.url = url;
        options.method = 'head';
        return this.send(options);
    }
    /**
     * @param {?} url
     * @param {?} options
     * @return {?}
     */
    jsonp(url, options) {
        options = options || {};
        options.url = url;
        options.method = 'jsonp';
        return this.send(options);
    }
    /**
     * @param {?} url
     * @param {?} data
     * @param {?} options
     * @return {?}
     */
    upload(url, data, options) {
        /** @type {?} */
        const req = new HttpRequest('POST', url, data, {
            reportProgress: true // for progress data
        });
        return this.httpClient.request(req);
        // return this.httpClient.post(url, data, {
        //     reportProgress: true
        // });
    }
    /**
     * registers a callback to be trigerred on session timeout
     * @param {?} callback
     * @return {?}
     */
    registerOnSessionTimeout(callback) {
        this.sessionTimeoutObservable.asObservable().subscribe(callback);
    }
    /**
     * trigger the registered methods on session timeout
     * @return {?}
     */
    on401() {
        this.sessionTimeoutObservable.next();
    }
    /**
     * @param {?} callback
     * @return {?}
     */
    pushToSessionFailureQueue(callback) {
        this.sessionTimeoutQueue.push({
            callback: callback
        });
    }
    /**
     * Execute queued requests, failed due to session timeout
     * @return {?}
     */
    executeSessionFailureRequests() {
        /** @type {?} */
        const queue = this.sessionTimeoutQueue;
        /** @type {?} */
        const that = this;
        that.sessionTimeoutQueue = [];
        queue.forEach(data => {
            if (_.isFunction(data.callback)) {
                data.callback();
            }
            else {
                data.requestInfo.headers.headers.delete('x-wm-xsrf-token');
                that.httpClient.request(data.requestInfo)
                    .subscribe(response => {
                    if (response && response.type && data.sub401) {
                        data.sub401.next(response);
                    }
                }, (reason) => {
                    data.sub401.error(reason);
                });
            }
        });
    }
}
HttpServiceImpl.decorators = [
    { type: Injectable }
];
/** @nocollapse */
HttpServiceImpl.ctorParameters = () => [
    { type: HttpClient }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * This class creates a custom WmHttpRequest.
 */
class WmHttpRequest {
    constructor() {
        this.headers = [];
    }
    /**
     * This method converts the given wm HttpRequest to angular HttpRequest
     * @param {?} reqObj
     * @return {?}
     */
    wmToAngularRequest(reqObj) {
        /** @type {?} */
        let angReq;
        angReq = new HttpRequest(reqObj.method, reqObj.url);
        angReq = angReq.clone();
        angReq.body = reqObj.body;
        angReq.method = reqObj.method;
        angReq.responseType = reqObj.responseType;
        angReq.urlWithParams = reqObj.url;
        angReq.withCredentials = reqObj.withCredentials;
        reqObj.headers.forEach((value, header) => {
            angReq.headers = angReq.headers.append(header, value);
        });
        return angReq;
    }
    /**
     * This method converts the given angular HttpRequest to wm HttpRequest
     * @param {?} req
     * @return {?}
     */
    angularToWmRequest(req) {
        /** @type {?} */
        let wmReq = new WmHttpRequest();
        /** @type {?} */
        let headerMap = new Map();
        wmReq.body = req.body;
        wmReq.method = req.method;
        wmReq.responseType = req.responseType;
        wmReq.url = req.urlWithParams;
        wmReq.withCredentials = req.withCredentials;
        req.headers.keys().forEach((header) => {
            headerMap.set(header, req.headers.headers.get(header.toLowerCase())[0]);
        });
        wmReq.headers = headerMap;
        return wmReq;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * This class creates a custom WmHttpRequest.
 */
class WmHttpResponse extends WmHttpRequest {
    constructor() {
        super();
    }
    /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param {?} respObj
     * @return {?}
     */
    wmToAngularResponse(respObj) {
        /** @type {?} */
        let angResp;
        angResp = new HttpResponse();
        angResp = angResp.clone();
        angResp.body = respObj.body;
        angResp.error = respObj.error;
        angResp.message = respObj.message;
        angResp.url = respObj.url;
        angResp.ok = respObj.ok;
        angResp.status = respObj.status;
        angResp.statusText = respObj.statusText;
        respObj.headers.forEach((value, header) => {
            angResp.headers = angResp.headers.append(header, value);
        });
        return angResp;
    }
    /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param {?} respObj
     * @return {?}
     */
    angularToWmResponse(respObj) {
        /** @type {?} */
        let wmResp;
        /** @type {?} */
        let headerMap = new Map();
        wmResp = new WmHttpResponse();
        wmResp.body = respObj.body;
        wmResp.error = respObj.error;
        wmResp.message = respObj.message;
        wmResp.url = respObj.url;
        wmResp.ok = respObj.ok;
        wmResp.status = respObj.status;
        wmResp.statusText = respObj.statusText;
        respObj.headers.keys().forEach((header) => {
            headerMap.set(header, respObj.headers.headers.get(header.toLowerCase())[0]);
        });
        wmResp.headers = headerMap;
        return wmResp;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class HttpServiceModule {
    /**
     * @return {?}
     */
    static forRoot() {
        return {
            ngModule: CommonModule,
            providers: [
                { provide: AbstractHttpService, useClass: HttpServiceImpl }
            ]
        };
    }
}
HttpServiceModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    HttpClientModule
                ],
                declarations: []
            },] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { HttpServiceModule, HttpServiceImpl, WmHttpRequest, WmHttpResponse };

//# sourceMappingURL=index.js.map