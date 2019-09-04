/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Subject } from 'rxjs';
import { AbstractHttpService, getValidJSON, replace } from '@wm/core';
export class HttpServiceImpl extends AbstractHttpService {
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
if (false) {
    /** @type {?} */
    HttpServiceImpl.prototype.nonBodyTypeMethods;
    /** @type {?} */
    HttpServiceImpl.prototype.sessionTimeoutObservable;
    /** @type {?} */
    HttpServiceImpl.prototype.sessionTimeoutQueue;
    /** @type {?} */
    HttpServiceImpl.prototype.localeObject;
    /**
     * @type {?}
     * @private
     */
    HttpServiceImpl.prototype.httpClient;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2h0dHAvIiwic291cmNlcyI6WyJodHRwLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLFVBQVUsRUFBYSxXQUFXLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBZ0IsTUFBTSxzQkFBc0IsQ0FBQztBQUVqSCxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBS3RFLE1BQU0sT0FBTyxlQUFnQixTQUFRLG1CQUFtQjs7OztJQU1wRCxZQUFvQixVQUFzQjtRQUN0QyxLQUFLLEVBQUUsQ0FBQztRQURRLGVBQVUsR0FBVixVQUFVLENBQVk7UUFMMUMsdUJBQWtCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkUsNkJBQXdCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUN6Qyx3QkFBbUIsR0FBRyxFQUFFLENBQUM7SUFLekIsQ0FBQzs7Ozs7OztJQVFELG9CQUFvQixDQUFDLE9BQU8sRUFBRSxhQUFjO1FBQ3hDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7WUFDMUIsV0FBVyxFQUFFLE9BQU87WUFDcEIsTUFBTSxFQUFFLGFBQWE7U0FDeEIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7Ozs7Ozs7SUFNTyxlQUFlLENBQUMsT0FBWTs7WUFDNUIsVUFBVSxHQUFHLElBQUksV0FBVyxFQUFFOztZQUM5QixTQUFTLEdBQUcsSUFBSSxVQUFVLEVBQUU7O2NBQzFCLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTzs7Y0FDekIsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNOztjQUN2QixZQUFZLEdBQUcsT0FBTyxDQUFDLFlBQVk7UUFFekMsMkVBQTJFO1FBQzNFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFO1lBQ3ZCLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDLENBQUM7U0FDeEU7UUFFRCxVQUFVO1FBQ1YsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsbUJBQUEsQ0FBQyxFQUFVLENBQUMsQ0FBQyxDQUFDO1NBQy9GO1FBRUQsU0FBUztRQUNULElBQUksTUFBTSxFQUFFO1lBQ1IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLG1CQUFBLENBQUMsRUFBVSxDQUFDLENBQUMsQ0FBQztTQUM1Rjs7WUFFRyxLQUFLOztZQUFFLE1BQU07O2NBQ1gsVUFBVSxHQUFHO1lBQ2YsT0FBTyxFQUFFLFVBQVU7WUFDbkIsTUFBTSxFQUFFLFNBQVM7WUFDakIsWUFBWSxFQUFFLFlBQVk7U0FDN0I7UUFDRCxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFO1lBQ3JGLEtBQUssR0FBRyxVQUFVLENBQUM7WUFDbkIsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNqQjthQUFNO1lBQ0gsS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDckIsTUFBTSxHQUFHLFVBQVUsQ0FBQztTQUN2QjtRQUNELE9BQU8sSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN2RSxDQUFDOzs7Ozs7SUFNTSxhQUFhLENBQUMsR0FBUTs7Y0FDbkIsZUFBZSxHQUFHO1lBQ3BCLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsbUJBQW1CLENBQUMsSUFBSSw4QkFBOEI7WUFDNUUsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLDRDQUE0QztZQUMxRixHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLHlCQUF5QixDQUFDLElBQUksb0RBQW9EO1NBQzNHOzs7WUFHRyxNQUFNLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7O1lBQ3BDLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSztRQUM1QixZQUFZLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQyxJQUFJLFlBQVksQ0FBQztRQUUxRCxzRUFBc0U7UUFDdEUsSUFBSSxZQUFZLElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTtZQUNyQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDbEQ7YUFBTTtZQUNILE1BQU0sR0FBRyxNQUFNLElBQUkscUJBQXFCLENBQUM7U0FDNUM7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDOzs7Ozs7SUFNRCxvQkFBb0IsQ0FBQyxPQUFZOztjQUN2QixHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUM7UUFDekMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN4QyxDQUFDOzs7Ozs7SUFNRCxJQUFJLENBQUMsT0FBWTs7Y0FDUCxHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUM7UUFFekMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDdkQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RCLENBQUMsRUFBRyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNSLElBQUksSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNwQyxHQUFHLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO3dCQUNyRCxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3RCLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO3dCQUNMLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDZCxDQUFDLENBQUMsQ0FBQztpQkFDTjtxQkFBTTs7MEJBQ0csTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO29CQUN0QyxNQUFNLENBQUM7d0JBQ0gsS0FBSyxFQUFFLE1BQU07d0JBQ2IsT0FBTyxFQUFFLEdBQUc7cUJBQ2YsQ0FBQyxDQUFDO2lCQUNOO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Ozs7O0lBRUQsU0FBUyxDQUFDLE1BQU07UUFDWixJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztJQUMvQixDQUFDOzs7O0lBRUQsU0FBUztRQUNMLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUM3QixDQUFDOzs7OztJQUVELFdBQVcsQ0FBQyxNQUFNOztZQUNWLE1BQU0sR0FBRyxFQUFFO1FBQ2YsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDckMsTUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQzs7Ozs7SUFFRCxVQUFVLENBQUMsUUFBUTs7WUFDWCxNQUFNO1FBQ1YsTUFBTSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMzSSxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDOzs7Ozs7SUFFRCxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVM7UUFDdEIsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDOzs7OztJQUVELHdCQUF3QixDQUFDLEtBQUs7O2NBQ3BCLHFCQUFxQixHQUFHLG1CQUFtQjtRQUNqRCxPQUFPLEtBQUssQ0FBQyxNQUFNLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLHlCQUF5QixDQUFDLEtBQUsscUJBQXFCLENBQUM7SUFDOUcsQ0FBQzs7Ozs7O0lBRUQsR0FBRyxDQUFDLEdBQVcsRUFBRSxPQUFhO1FBQzFCLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3hCLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2xCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUE4QixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEYsQ0FBQzs7Ozs7OztJQUVELElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU87UUFDbkIsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDeEIsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDbEIsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDeEIsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDcEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLENBQUM7Ozs7Ozs7SUFFRCxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPO1FBQ2xCLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3hCLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2xCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QixDQUFDOzs7Ozs7O0lBRUQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTztRQUNwQixPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUN4QixPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNsQixPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztRQUN6QixPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNwQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUIsQ0FBQzs7Ozs7O0lBRUQsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPO1FBQ2YsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDeEIsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDbEIsT0FBTyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7UUFDMUIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLENBQUM7Ozs7OztJQUVELElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTztRQUNiLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3hCLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2xCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QixDQUFDOzs7Ozs7SUFFRCxLQUFLLENBQUMsR0FBRyxFQUFFLE9BQU87UUFDZCxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUN4QixPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNsQixPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUIsQ0FBQzs7Ozs7OztJQUVELE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU87O2NBQ2YsR0FBRyxHQUFHLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1lBQzNDLGNBQWMsRUFBRSxJQUFJLENBQUMsb0JBQW9CO1NBQzVDLENBQUM7UUFDRixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLDJDQUEyQztRQUMzQywyQkFBMkI7UUFDM0IsTUFBTTtJQUNWLENBQUM7Ozs7OztJQU1ELHdCQUF3QixDQUFDLFFBQVE7UUFDN0IsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNyRSxDQUFDOzs7OztJQUtELEtBQUs7UUFDRCxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDekMsQ0FBQzs7Ozs7SUFFRCx5QkFBeUIsQ0FBQyxRQUFRO1FBQzlCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7WUFDMUIsUUFBUSxFQUFFLFFBQVE7U0FDckIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7Ozs7SUFLRCw2QkFBNkI7O2NBQ25CLEtBQUssR0FBRyxJQUFJLENBQUMsbUJBQW1COztjQUNoQyxJQUFJLEdBQUcsSUFBSTtRQUNqQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDO1FBQzlCLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDakIsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ25CO2lCQUFNO2dCQUNILElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDM0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztxQkFDcEMsU0FBUyxDQUNOLFFBQVEsQ0FBQyxFQUFFO29CQUNQLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTt3QkFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQzlCO2dCQUNMLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFO29CQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QixDQUFDLENBQUMsQ0FBQzthQUNkO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDOzs7WUExUUosVUFBVTs7OztZQVJGLFVBQVU7Ozs7SUFVZiw2Q0FBbUU7O0lBQ25FLG1EQUF5Qzs7SUFDekMsOENBQXlCOztJQUN6Qix1Q0FBa0I7Ozs7O0lBRU4scUNBQThCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cEV2ZW50LCBIdHRwSGVhZGVycywgSHR0cFBhcmFtcywgSHR0cFJlcXVlc3QsIEh0dHBSZXNwb25zZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBBYnN0cmFjdEh0dHBTZXJ2aWNlLCBnZXRWYWxpZEpTT04sIHJlcGxhY2UgfSBmcm9tICdAd20vY29yZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBTZXJ2aWNlSW1wbCBleHRlbmRzIEFic3RyYWN0SHR0cFNlcnZpY2Uge1xuICAgIG5vbkJvZHlUeXBlTWV0aG9kcyA9IFsnR0VUJywgJ0RFTEVURScsICdIRUFEJywgJ09QVElPTlMnLCAnSlNPTlAnXTtcbiAgICBzZXNzaW9uVGltZW91dE9ic2VydmFibGUgPSBuZXcgU3ViamVjdCgpO1xuICAgIHNlc3Npb25UaW1lb3V0UXVldWUgPSBbXTtcbiAgICBsb2NhbGVPYmplY3Q6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cENsaWVudDogSHR0cENsaWVudCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGhhbmRsZXMgc2Vzc2lvbiB0aW1lb3V0LlxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHBhcmFtIHJlc29sdmVcbiAgICAgKiBAcGFyYW0gcmVqZWN0XG4gICAgICovXG4gICAgaGFuZGxlU2Vzc2lvblRpbWVvdXQob3B0aW9ucywgc3Vic2NyaWJlcjQwMT8pIHtcbiAgICAgICAgdGhpcy5zZXNzaW9uVGltZW91dFF1ZXVlLnB1c2goe1xuICAgICAgICAgICAgcmVxdWVzdEluZm86IG9wdGlvbnMsXG4gICAgICAgICAgICBzdWI0MDE6IHN1YnNjcmliZXI0MDFcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub240MDEoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgYSByZXF1ZXN0IHdpdGggcHJvdmlkZWQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSBvcHRpb25zLCByZXF1ZXN0IHBhcmFtcy9vcHRpb25zXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVJlcXVlc3Qob3B0aW9uczogYW55KSB7XG4gICAgICAgIGxldCByZXFIZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKCksXG4gICAgICAgICAgICByZXFQYXJhbXMgPSBuZXcgSHR0cFBhcmFtcygpO1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBvcHRpb25zLnBhcmFtcztcbiAgICAgICAgY29uc3QgcmVzcG9uc2VUeXBlID0gb3B0aW9ucy5yZXNwb25zZVR5cGU7XG5cbiAgICAgICAgLy8gdGhpcyBoZWFkZXIgaXMgbm90IHRvIGJlIHNlbnQgd2l0aCBub24tcHJveHkgY2FsbHMgZnJvbSBzZXJ2aWNlIHZhcmlhYmxlXG4gICAgICAgIGlmICghb3B0aW9ucy5pc0RpcmVjdENhbGwpIHtcbiAgICAgICAgICAgIHJlcUhlYWRlcnMgPSByZXFIZWFkZXJzLmFwcGVuZCgnWC1SZXF1ZXN0ZWQtV2l0aCcsICdYTUxIdHRwUmVxdWVzdCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaGVhZGVyc1xuICAgICAgICBpZiAoaGVhZGVycykge1xuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoaGVhZGVycykuZm9yRWFjaCgoW2ssIHZdKSA9PiByZXFIZWFkZXJzID0gcmVxSGVhZGVycy5hcHBlbmQoaywgdiBhcyBzdHJpbmcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBhcmFtc1xuICAgICAgICBpZiAocGFyYW1zKSB7XG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyhwYXJhbXMpLmZvckVhY2goKFtrLCB2XSkgPT4gcmVxUGFyYW1zID0gcmVxUGFyYW1zLmFwcGVuZChrLCB2IGFzIHN0cmluZykpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRoaXJkLCBmb3VydGg7XG4gICAgICAgIGNvbnN0IHJlcU9wdGlvbnMgPSB7XG4gICAgICAgICAgICBoZWFkZXJzOiByZXFIZWFkZXJzLFxuICAgICAgICAgICAgcGFyYW1zOiByZXFQYXJhbXMsXG4gICAgICAgICAgICByZXNwb25zZVR5cGU6IHJlc3BvbnNlVHlwZVxuICAgICAgICB9O1xuICAgICAgICBpZiAoXy5pbmNsdWRlcyh0aGlzLm5vbkJvZHlUeXBlTWV0aG9kcywgb3B0aW9ucy5tZXRob2QgJiYgb3B0aW9ucy5tZXRob2QudG9VcHBlckNhc2UoKSkpIHtcbiAgICAgICAgICAgIHRoaXJkID0gcmVxT3B0aW9ucztcbiAgICAgICAgICAgIGZvdXJ0aCA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlyZCA9IG9wdGlvbnMuZGF0YTtcbiAgICAgICAgICAgIGZvdXJ0aCA9IHJlcU9wdGlvbnM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBIdHRwUmVxdWVzdChvcHRpb25zLm1ldGhvZCwgb3B0aW9ucy51cmwsIHRoaXJkLCBmb3VydGgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGZpbHRlcnMgYW5kIHJldHVybnMgZXJyb3IgbWVzc2FnZSBmcm9tIHRoZSBmYWlsZWQgbmV0d29yayBjYWxsIHJlc3BvbnNlLlxuICAgICAqIEBwYXJhbSBlcnIsIGVycm9yIGZvcm0gbmV0d29yayBjYWxsIGZhaWx1cmVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RXJyTWVzc2FnZShlcnI6IGFueSkge1xuICAgICAgICBjb25zdCBIVFRQX1NUQVRVU19NU0cgPSB7XG4gICAgICAgICAgICA0MDQ6IHRoaXMuZ2V0TG9jYWxlKClbJ01FU1NBR0VfNDA0X0VSUk9SJ10gfHwgJ1JlcXVlc3RlZCByZXNvdXJjZSBub3QgZm91bmQnLFxuICAgICAgICAgICAgNDAxOiB0aGlzLmdldExvY2FsZSgpWydNRVNTQUdFXzQwMV9FUlJPUiddIHx8ICdSZXF1ZXN0ZWQgcmVzb3VyY2UgcmVxdWlyZXMgYXV0aGVudGljYXRpb24nLFxuICAgICAgICAgICAgNDAzOiB0aGlzLmdldExvY2FsZSgpWydMQUJFTF9GT1JCSURERU5fTUVTU0FHRSddIHx8ICdUaGUgcmVxdWVzdGVkIHJlc291cmNlIGFjY2Vzcy9hY3Rpb24gaXMgZm9yYmlkZGVuLidcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBjaGVjayBpZiBlcnJvciBtZXNzYWdlIHByZXNlbnQgZm9yIHJlc3BvbmRlZCBodHRwIHN0YXR1c1xuICAgICAgICBsZXQgZXJyTXNnID0gSFRUUF9TVEFUVVNfTVNHW2Vyci5zdGF0dXNdO1xuICAgICAgICBsZXQgZXJyb3JEZXRhaWxzID0gZXJyLmVycm9yO1xuICAgICAgICBlcnJvckRldGFpbHMgPSBnZXRWYWxpZEpTT04oZXJyb3JEZXRhaWxzKSB8fCBlcnJvckRldGFpbHM7XG5cbiAgICAgICAgLy8gV00gc2VydmljZXMgaGF2ZSB0aGUgZm9ybWF0IG9mIGVycm9yIHJlc3BvbnNlIGFzIGVycm9yRGV0YWlscy5lcnJvclxuICAgICAgICBpZiAoZXJyb3JEZXRhaWxzICYmIGVycm9yRGV0YWlscy5lcnJvcnMpIHtcbiAgICAgICAgICAgIGVyck1zZyA9IHRoaXMucGFyc2VFcnJvcnMoZXJyb3JEZXRhaWxzLmVycm9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJNc2cgPSBlcnJNc2cgfHwgJ1NlcnZpY2UgQ2FsbCBGYWlsZWQnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlcnJNc2c7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFrZSBhIGh0dHAgY2FsbCBhbmQgcmV0dXJucyBhbiBvYnNlcnZhYmxlIHRoYXQgY2FuIGJlIGNhbmNlbGxlZFxuICAgICAqIEBwYXJhbSBvcHRpb25zLCBvcHRpb25zIHVzaW5nIHdoaWNoIHRoZSBjYWxsIG5lZWRzIHRvIGJlIG1hZGVcbiAgICAgKi9cbiAgICBzZW5kQ2FsbEFzT2JzZXJ2YWJsZShvcHRpb25zOiBhbnkpOiBhbnkge1xuICAgICAgICBjb25zdCByZXEgPSB0aGlzLmdlbmVyYXRlUmVxdWVzdChvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cENsaWVudC5yZXF1ZXN0KHJlcSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFrZXMgYSBodHRwIGNhbGwgYW5kIHJldHVybiBhIHByb21pc2VcbiAgICAgKiBAcGFyYW0gb3B0aW9ucywgb3B0aW9ucyB1c2luZyB3aGljaCB0aGUgY2FsbCBuZWVkcyB0byBiZSBtYWRlXG4gICAgICovXG4gICAgc2VuZChvcHRpb25zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcmVxID0gdGhpcy5nZW5lcmF0ZVJlcXVlc3Qob3B0aW9ucyk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaHR0cENsaWVudC5yZXF1ZXN0KHJlcSkudG9Qcm9taXNlKCkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0gLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNQbGF0Zm9ybVNlc3Npb25UaW1lb3V0KGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyLl80MDFTdWJzY3JpYmVyLmFzT2JzZXJ2YWJsZSgpLnN1YnNjcmliZSgocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJNc2cgPSB0aGlzLmdldEVyck1lc3NhZ2UoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJNc2csXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiBlcnJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldExvY2FsZShsb2NhbGUpIHtcbiAgICAgICAgdGhpcy5sb2NhbGVPYmplY3QgPSBsb2NhbGU7XG4gICAgfVxuXG4gICAgZ2V0TG9jYWxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVPYmplY3Q7XG4gICAgfVxuXG4gICAgcGFyc2VFcnJvcnMoZXJyb3JzKSB7XG4gICAgICAgIGxldCBlcnJNc2cgPSAnJztcbiAgICAgICAgZXJyb3JzLmVycm9yLmZvckVhY2goKGVycm9yRGV0YWlscywgaSkgPT4ge1xuICAgICAgICAgICAgZXJyTXNnICs9IHRoaXMucGFyc2VFcnJvcihlcnJvckRldGFpbHMpICsgKGkgPiAwID8gJ1xcbicgOiAnJyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZXJyTXNnO1xuICAgIH1cblxuICAgIHBhcnNlRXJyb3IoZXJyb3JPYmopIHtcbiAgICAgICAgbGV0IGVyck1zZztcbiAgICAgICAgZXJyTXNnID0gZXJyb3JPYmoubWVzc2FnZSA/IHJlcGxhY2UoZXJyb3JPYmoubWVzc2FnZSwgZXJyb3JPYmoucGFyYW1ldGVycywgdHJ1ZSkgOiAoKGVycm9yT2JqLnBhcmFtZXRlcnMgJiYgZXJyb3JPYmoucGFyYW1ldGVyc1swXSkgfHwgJycpO1xuICAgICAgICByZXR1cm4gZXJyTXNnO1xuICAgIH1cblxuICAgIGdldEhlYWRlcihlcnJvciwgaGVhZGVyS2V5KSB7XG4gICAgICAgIHJldHVybiBlcnJvci5oZWFkZXJzLmdldChoZWFkZXJLZXkpO1xuICAgIH1cblxuICAgIGlzUGxhdGZvcm1TZXNzaW9uVGltZW91dChlcnJvcikge1xuICAgICAgICBjb25zdCBNU0dfU0VTU0lPTl9OT1RfRk9VTkQgPSAnU2Vzc2lvbiBOb3QgRm91bmQnO1xuICAgICAgICByZXR1cm4gZXJyb3Iuc3RhdHVzID09PSA0MDEgJiYgdGhpcy5nZXRIZWFkZXIoZXJyb3IsICd4LXdtLWxvZ2luLWVycm9ybWVzc2FnZScpID09PSBNU0dfU0VTU0lPTl9OT1RfRk9VTkQ7XG4gICAgfVxuXG4gICAgZ2V0KHVybDogc3RyaW5nLCBvcHRpb25zPzogYW55KSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBvcHRpb25zLnVybCA9IHVybDtcbiAgICAgICAgb3B0aW9ucy5tZXRob2QgPSAnZ2V0JztcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VuZChvcHRpb25zKS50aGVuKChyZXNwb25zZTogSHR0cFJlc3BvbnNlPHN0cmluZz4pID0+IHJlc3BvbnNlLmJvZHkpO1xuICAgIH1cblxuICAgIHBvc3QodXJsLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBvcHRpb25zLnVybCA9IHVybDtcbiAgICAgICAgb3B0aW9ucy5tZXRob2QgPSAncG9zdCc7XG4gICAgICAgIG9wdGlvbnMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbmQob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcHV0KHVybCwgZGF0YSwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgb3B0aW9ucy51cmwgPSB1cmw7XG4gICAgICAgIG9wdGlvbnMubWV0aG9kID0gJ3B1dCc7XG4gICAgICAgIG9wdGlvbnMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbmQob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcGF0Y2godXJsLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBvcHRpb25zLnVybCA9IHVybDtcbiAgICAgICAgb3B0aW9ucy5tZXRob2QgPSAncGF0Y2gnO1xuICAgICAgICBvcHRpb25zLmRhdGEgPSBkYXRhO1xuICAgICAgICByZXR1cm4gdGhpcy5zZW5kKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGRlbGV0ZSh1cmwsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIG9wdGlvbnMudXJsID0gdXJsO1xuICAgICAgICBvcHRpb25zLm1ldGhvZCA9ICdkZWxldGUnO1xuICAgICAgICByZXR1cm4gdGhpcy5zZW5kKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGhlYWQodXJsLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBvcHRpb25zLnVybCA9IHVybDtcbiAgICAgICAgb3B0aW9ucy5tZXRob2QgPSAnaGVhZCc7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbmQob3B0aW9ucyk7XG4gICAgfVxuXG4gICAganNvbnAodXJsLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBvcHRpb25zLnVybCA9IHVybDtcbiAgICAgICAgb3B0aW9ucy5tZXRob2QgPSAnanNvbnAnO1xuICAgICAgICByZXR1cm4gdGhpcy5zZW5kKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHVwbG9hZCh1cmwsIGRhdGEsIG9wdGlvbnMpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgICAgIGNvbnN0IHJlcSA9IG5ldyBIdHRwUmVxdWVzdCgnUE9TVCcsIHVybCwgZGF0YSwge1xuICAgICAgICAgICAgcmVwb3J0UHJvZ3Jlc3M6IHRydWUgLy8gZm9yIHByb2dyZXNzIGRhdGFcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHBDbGllbnQucmVxdWVzdChyZXEpO1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5odHRwQ2xpZW50LnBvc3QodXJsLCBkYXRhLCB7XG4gICAgICAgIC8vICAgICByZXBvcnRQcm9ncmVzczogdHJ1ZVxuICAgICAgICAvLyB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSB0cmlnZXJyZWQgb24gc2Vzc2lvbiB0aW1lb3V0XG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcmVnaXN0ZXJPblNlc3Npb25UaW1lb3V0KGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuc2Vzc2lvblRpbWVvdXRPYnNlcnZhYmxlLmFzT2JzZXJ2YWJsZSgpLnN1YnNjcmliZShjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdHJpZ2dlciB0aGUgcmVnaXN0ZXJlZCBtZXRob2RzIG9uIHNlc3Npb24gdGltZW91dFxuICAgICAqL1xuICAgIG9uNDAxKCkge1xuICAgICAgICB0aGlzLnNlc3Npb25UaW1lb3V0T2JzZXJ2YWJsZS5uZXh0KCk7XG4gICAgfVxuXG4gICAgcHVzaFRvU2Vzc2lvbkZhaWx1cmVRdWV1ZShjYWxsYmFjaykge1xuICAgICAgICB0aGlzLnNlc3Npb25UaW1lb3V0UXVldWUucHVzaCh7XG4gICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2tcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBxdWV1ZWQgcmVxdWVzdHMsIGZhaWxlZCBkdWUgdG8gc2Vzc2lvbiB0aW1lb3V0XG4gICAgICovXG4gICAgZXhlY3V0ZVNlc3Npb25GYWlsdXJlUmVxdWVzdHMoKSB7XG4gICAgICAgIGNvbnN0IHF1ZXVlID0gdGhpcy5zZXNzaW9uVGltZW91dFF1ZXVlO1xuICAgICAgICBjb25zdCB0aGF0ID0gdGhpcztcbiAgICAgICAgdGhhdC5zZXNzaW9uVGltZW91dFF1ZXVlID0gW107XG4gICAgICAgIHF1ZXVlLmZvckVhY2goZGF0YSA9PiB7XG4gICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGRhdGEuY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgZGF0YS5jYWxsYmFjaygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYXRhLnJlcXVlc3RJbmZvLmhlYWRlcnMuaGVhZGVycy5kZWxldGUoJ3gtd20teHNyZi10b2tlbicpO1xuICAgICAgICAgICAgICAgIHRoYXQuaHR0cENsaWVudC5yZXF1ZXN0KGRhdGEucmVxdWVzdEluZm8pXG4gICAgICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLnR5cGUgJiYgZGF0YS5zdWI0MDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5zdWI0MDEubmV4dChyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKHJlYXNvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuc3ViNDAxLmVycm9yKHJlYXNvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19