(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('rxjs'), require('@wm/core'), require('@angular/common/http')) :
    typeof define === 'function' && define.amd ? define('@wm/http', ['exports', '@angular/common', '@angular/core', 'rxjs', '@wm/core', '@angular/common/http'], factory) :
    (factory((global.wm = global.wm || {}, global.wm.http = {}),global.ng.common,global.ng.core,global.rxjs,global.wm.core,global.ng.common.http));
}(this, (function (exports,common,core,rxjs,core$1,http) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p]; };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var HttpServiceImpl = /** @class */ (function (_super) {
        __extends(HttpServiceImpl, _super);
        function HttpServiceImpl(httpClient) {
            var _this = _super.call(this) || this;
            _this.httpClient = httpClient;
            _this.nonBodyTypeMethods = ['GET', 'DELETE', 'HEAD', 'OPTIONS', 'JSONP'];
            _this.sessionTimeoutObservable = new rxjs.Subject();
            _this.sessionTimeoutQueue = [];
            return _this;
        }
        /**
         * This method handles session timeout.
         * @param options
         * @param resolve
         * @param reject
         */
        /**
         * This method handles session timeout.
         * @param {?} options
         * @param {?=} subscriber401
         * @return {?}
         */
        HttpServiceImpl.prototype.handleSessionTimeout = /**
         * This method handles session timeout.
         * @param {?} options
         * @param {?=} subscriber401
         * @return {?}
         */
            function (options, subscriber401) {
                this.sessionTimeoutQueue.push({
                    requestInfo: options,
                    sub401: subscriber401
                });
                this.on401();
            };
        /**
         * Generates a request with provided options
         * @param options, request params/options
         */
        /**
         * Generates a request with provided options
         * @private
         * @param {?} options
         * @return {?}
         */
        HttpServiceImpl.prototype.generateRequest = /**
         * Generates a request with provided options
         * @private
         * @param {?} options
         * @return {?}
         */
            function (options) {
                /** @type {?} */
                var reqHeaders = new http.HttpHeaders();
                /** @type {?} */
                var reqParams = new http.HttpParams();
                /** @type {?} */
                var headers = options.headers;
                /** @type {?} */
                var params = options.params;
                /** @type {?} */
                var responseType = options.responseType;
                // this header is not to be sent with non-proxy calls from service variable
                if (!options.isDirectCall) {
                    reqHeaders = reqHeaders.append('X-Requested-With', 'XMLHttpRequest');
                }
                // headers
                if (headers) {
                    Object.entries(headers).forEach(function (_a) {
                        var _b = __read(_a, 2), k = _b[0], v = _b[1];
                        return reqHeaders = reqHeaders.append(k, ( /** @type {?} */(v)));
                    });
                }
                // params
                if (params) {
                    Object.entries(params).forEach(function (_a) {
                        var _b = __read(_a, 2), k = _b[0], v = _b[1];
                        return reqParams = reqParams.append(k, ( /** @type {?} */(v)));
                    });
                }
                /** @type {?} */
                var third;
                /** @type {?} */
                var fourth;
                /** @type {?} */
                var reqOptions = {
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
                return new http.HttpRequest(options.method, options.url, third, fourth);
            };
        /**
         * This method filters and returns error message from the failed network call response.
         * @param err, error form network call failure
         */
        /**
         * This method filters and returns error message from the failed network call response.
         * @param {?} err
         * @return {?}
         */
        HttpServiceImpl.prototype.getErrMessage = /**
         * This method filters and returns error message from the failed network call response.
         * @param {?} err
         * @return {?}
         */
            function (err) {
                /** @type {?} */
                var HTTP_STATUS_MSG = {
                    404: this.getLocale()['MESSAGE_404_ERROR'] || 'Requested resource not found',
                    401: this.getLocale()['MESSAGE_401_ERROR'] || 'Requested resource requires authentication',
                    403: this.getLocale()['LABEL_FORBIDDEN_MESSAGE'] || 'The requested resource access/action is forbidden.'
                };
                // check if error message present for responded http status
                /** @type {?} */
                var errMsg = HTTP_STATUS_MSG[err.status];
                /** @type {?} */
                var errorDetails = err.error;
                errorDetails = core$1.getValidJSON(errorDetails) || errorDetails;
                // WM services have the format of error response as errorDetails.error
                if (errorDetails && errorDetails.errors) {
                    errMsg = this.parseErrors(errorDetails.errors);
                }
                else {
                    errMsg = errMsg || 'Service Call Failed';
                }
                return errMsg;
            };
        /**
         * Make a http call and returns an observable that can be cancelled
         * @param options, options using which the call needs to be made
         */
        /**
         * Make a http call and returns an observable that can be cancelled
         * @param {?} options
         * @return {?}
         */
        HttpServiceImpl.prototype.sendCallAsObservable = /**
         * Make a http call and returns an observable that can be cancelled
         * @param {?} options
         * @return {?}
         */
            function (options) {
                /** @type {?} */
                var req = this.generateRequest(options);
                return this.httpClient.request(req);
            };
        /**
         * Makes a http call and return a promise
         * @param options, options using which the call needs to be made
         */
        /**
         * Makes a http call and return a promise
         * @param {?} options
         * @return {?}
         */
        HttpServiceImpl.prototype.send = /**
         * Makes a http call and return a promise
         * @param {?} options
         * @return {?}
         */
            function (options) {
                var _this = this;
                /** @type {?} */
                var req = this.generateRequest(options);
                return new Promise(function (resolve, reject) {
                    _this.httpClient.request(req).toPromise().then(function (response) {
                        resolve(response);
                    }, function (err) {
                        if (_this.isPlatformSessionTimeout(err)) {
                            err._401Subscriber.asObservable().subscribe(function (response) {
                                resolve(response);
                            }, function (e) {
                                reject(e);
                            });
                        }
                        else {
                            /** @type {?} */
                            var errMsg = _this.getErrMessage(err);
                            reject({
                                error: errMsg,
                                details: err
                            });
                        }
                    });
                });
            };
        /**
         * @param {?} locale
         * @return {?}
         */
        HttpServiceImpl.prototype.setLocale = /**
         * @param {?} locale
         * @return {?}
         */
            function (locale) {
                this.localeObject = locale;
            };
        /**
         * @return {?}
         */
        HttpServiceImpl.prototype.getLocale = /**
         * @return {?}
         */
            function () {
                return this.localeObject;
            };
        /**
         * @param {?} errors
         * @return {?}
         */
        HttpServiceImpl.prototype.parseErrors = /**
         * @param {?} errors
         * @return {?}
         */
            function (errors) {
                var _this = this;
                /** @type {?} */
                var errMsg = '';
                errors.error.forEach(function (errorDetails, i) {
                    errMsg += _this.parseError(errorDetails) + (i > 0 ? '\n' : '');
                });
                return errMsg;
            };
        /**
         * @param {?} errorObj
         * @return {?}
         */
        HttpServiceImpl.prototype.parseError = /**
         * @param {?} errorObj
         * @return {?}
         */
            function (errorObj) {
                /** @type {?} */
                var errMsg;
                errMsg = errorObj.message ? core$1.replace(errorObj.message, errorObj.parameters, true) : ((errorObj.parameters && errorObj.parameters[0]) || '');
                return errMsg;
            };
        /**
         * @param {?} error
         * @param {?} headerKey
         * @return {?}
         */
        HttpServiceImpl.prototype.getHeader = /**
         * @param {?} error
         * @param {?} headerKey
         * @return {?}
         */
            function (error, headerKey) {
                return error.headers.get(headerKey);
            };
        /**
         * @param {?} error
         * @return {?}
         */
        HttpServiceImpl.prototype.isPlatformSessionTimeout = /**
         * @param {?} error
         * @return {?}
         */
            function (error) {
                /** @type {?} */
                var MSG_SESSION_NOT_FOUND = 'Session Not Found';
                return error.status === 401 && this.getHeader(error, 'x-wm-login-errormessage') === MSG_SESSION_NOT_FOUND;
            };
        /**
         * @param {?} url
         * @param {?=} options
         * @return {?}
         */
        HttpServiceImpl.prototype.get = /**
         * @param {?} url
         * @param {?=} options
         * @return {?}
         */
            function (url, options) {
                options = options || {};
                options.url = url;
                options.method = 'get';
                return this.send(options).then(function (response) { return response.body; });
            };
        /**
         * @param {?} url
         * @param {?} data
         * @param {?} options
         * @return {?}
         */
        HttpServiceImpl.prototype.post = /**
         * @param {?} url
         * @param {?} data
         * @param {?} options
         * @return {?}
         */
            function (url, data, options) {
                options = options || {};
                options.url = url;
                options.method = 'post';
                options.data = data;
                return this.send(options);
            };
        /**
         * @param {?} url
         * @param {?} data
         * @param {?} options
         * @return {?}
         */
        HttpServiceImpl.prototype.put = /**
         * @param {?} url
         * @param {?} data
         * @param {?} options
         * @return {?}
         */
            function (url, data, options) {
                options = options || {};
                options.url = url;
                options.method = 'put';
                options.data = data;
                return this.send(options);
            };
        /**
         * @param {?} url
         * @param {?} data
         * @param {?} options
         * @return {?}
         */
        HttpServiceImpl.prototype.patch = /**
         * @param {?} url
         * @param {?} data
         * @param {?} options
         * @return {?}
         */
            function (url, data, options) {
                options = options || {};
                options.url = url;
                options.method = 'patch';
                options.data = data;
                return this.send(options);
            };
        /**
         * @param {?} url
         * @param {?} options
         * @return {?}
         */
        HttpServiceImpl.prototype.delete = /**
         * @param {?} url
         * @param {?} options
         * @return {?}
         */
            function (url, options) {
                options = options || {};
                options.url = url;
                options.method = 'delete';
                return this.send(options);
            };
        /**
         * @param {?} url
         * @param {?} options
         * @return {?}
         */
        HttpServiceImpl.prototype.head = /**
         * @param {?} url
         * @param {?} options
         * @return {?}
         */
            function (url, options) {
                options = options || {};
                options.url = url;
                options.method = 'head';
                return this.send(options);
            };
        /**
         * @param {?} url
         * @param {?} options
         * @return {?}
         */
        HttpServiceImpl.prototype.jsonp = /**
         * @param {?} url
         * @param {?} options
         * @return {?}
         */
            function (url, options) {
                options = options || {};
                options.url = url;
                options.method = 'jsonp';
                return this.send(options);
            };
        /**
         * @param {?} url
         * @param {?} data
         * @param {?} options
         * @return {?}
         */
        HttpServiceImpl.prototype.upload = /**
         * @param {?} url
         * @param {?} data
         * @param {?} options
         * @return {?}
         */
            function (url, data, options) {
                /** @type {?} */
                var req = new http.HttpRequest('POST', url, data, {
                    reportProgress: true // for progress data
                });
                return this.httpClient.request(req);
                // return this.httpClient.post(url, data, {
                //     reportProgress: true
                // });
            };
        /**
         * registers a callback to be trigerred on session timeout
         * @param callback
         */
        /**
         * registers a callback to be trigerred on session timeout
         * @param {?} callback
         * @return {?}
         */
        HttpServiceImpl.prototype.registerOnSessionTimeout = /**
         * registers a callback to be trigerred on session timeout
         * @param {?} callback
         * @return {?}
         */
            function (callback) {
                this.sessionTimeoutObservable.asObservable().subscribe(callback);
            };
        /**
         * trigger the registered methods on session timeout
         */
        /**
         * trigger the registered methods on session timeout
         * @return {?}
         */
        HttpServiceImpl.prototype.on401 = /**
         * trigger the registered methods on session timeout
         * @return {?}
         */
            function () {
                this.sessionTimeoutObservable.next();
            };
        /**
         * @param {?} callback
         * @return {?}
         */
        HttpServiceImpl.prototype.pushToSessionFailureQueue = /**
         * @param {?} callback
         * @return {?}
         */
            function (callback) {
                this.sessionTimeoutQueue.push({
                    callback: callback
                });
            };
        /**
         * Execute queued requests, failed due to session timeout
         */
        /**
         * Execute queued requests, failed due to session timeout
         * @return {?}
         */
        HttpServiceImpl.prototype.executeSessionFailureRequests = /**
         * Execute queued requests, failed due to session timeout
         * @return {?}
         */
            function () {
                /** @type {?} */
                var queue = this.sessionTimeoutQueue;
                /** @type {?} */
                var that = this;
                that.sessionTimeoutQueue = [];
                queue.forEach(function (data) {
                    if (_.isFunction(data.callback)) {
                        data.callback();
                    }
                    else {
                        data.requestInfo.headers.headers.delete('x-wm-xsrf-token');
                        that.httpClient.request(data.requestInfo)
                            .subscribe(function (response) {
                            if (response && response.type && data.sub401) {
                                data.sub401.next(response);
                            }
                        }, function (reason) {
                            data.sub401.error(reason);
                        });
                    }
                });
            };
        HttpServiceImpl.decorators = [
            { type: core.Injectable }
        ];
        /** @nocollapse */
        HttpServiceImpl.ctorParameters = function () {
            return [
                { type: http.HttpClient }
            ];
        };
        return HttpServiceImpl;
    }(core$1.AbstractHttpService));

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    /**
     * This class creates a custom WmHttpRequest.
     */
    var /**
     * This class creates a custom WmHttpRequest.
     */ WmHttpRequest = /** @class */ (function () {
        function WmHttpRequest() {
            this.headers = [];
        }
        /**
         * This method converts the given wm HttpRequest to angular HttpRequest
         * @param reqObj, the wm HttpRequest
         */
        /**
         * This method converts the given wm HttpRequest to angular HttpRequest
         * @param {?} reqObj
         * @return {?}
         */
        WmHttpRequest.prototype.wmToAngularRequest = /**
         * This method converts the given wm HttpRequest to angular HttpRequest
         * @param {?} reqObj
         * @return {?}
         */
            function (reqObj) {
                /** @type {?} */
                var angReq;
                angReq = new http.HttpRequest(reqObj.method, reqObj.url);
                angReq = angReq.clone();
                angReq.body = reqObj.body;
                angReq.method = reqObj.method;
                angReq.responseType = reqObj.responseType;
                angReq.urlWithParams = reqObj.url;
                angReq.withCredentials = reqObj.withCredentials;
                reqObj.headers.forEach(function (value, header) {
                    angReq.headers = angReq.headers.append(header, value);
                });
                return angReq;
            };
        /**
         * This method converts the given angular HttpRequest to wm HttpRequest
         * @param req, the angular HttpRequest
         */
        /**
         * This method converts the given angular HttpRequest to wm HttpRequest
         * @param {?} req
         * @return {?}
         */
        WmHttpRequest.prototype.angularToWmRequest = /**
         * This method converts the given angular HttpRequest to wm HttpRequest
         * @param {?} req
         * @return {?}
         */
            function (req) {
                /** @type {?} */
                var wmReq = new WmHttpRequest();
                /** @type {?} */
                var headerMap = new Map();
                wmReq.body = req.body;
                wmReq.method = req.method;
                wmReq.responseType = req.responseType;
                wmReq.url = req.urlWithParams;
                wmReq.withCredentials = req.withCredentials;
                req.headers.keys().forEach(function (header) {
                    headerMap.set(header, req.headers.headers.get(header.toLowerCase())[0]);
                });
                wmReq.headers = headerMap;
                return wmReq;
            };
        return WmHttpRequest;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    /**
     * This class creates a custom WmHttpRequest.
     */
    var /**
     * This class creates a custom WmHttpRequest.
     */ WmHttpResponse = /** @class */ (function (_super) {
        __extends(WmHttpResponse, _super);
        function WmHttpResponse() {
            return _super.call(this) || this;
        }
        /**
         * This method converts the given wm HttpResponse to angular HttpResponse
         * @param respObj, the wm HttpResponse
         */
        /**
         * This method converts the given wm HttpResponse to angular HttpResponse
         * @param {?} respObj
         * @return {?}
         */
        WmHttpResponse.prototype.wmToAngularResponse = /**
         * This method converts the given wm HttpResponse to angular HttpResponse
         * @param {?} respObj
         * @return {?}
         */
            function (respObj) {
                /** @type {?} */
                var angResp;
                angResp = new http.HttpResponse();
                angResp = angResp.clone();
                angResp.body = respObj.body;
                angResp.error = respObj.error;
                angResp.message = respObj.message;
                angResp.url = respObj.url;
                angResp.ok = respObj.ok;
                angResp.status = respObj.status;
                angResp.statusText = respObj.statusText;
                respObj.headers.forEach(function (value, header) {
                    angResp.headers = angResp.headers.append(header, value);
                });
                return angResp;
            };
        /**
         * This method converts the given wm HttpResponse to angular HttpResponse
         * @param respObj, the angular HttpResponse
         */
        /**
         * This method converts the given wm HttpResponse to angular HttpResponse
         * @param {?} respObj
         * @return {?}
         */
        WmHttpResponse.prototype.angularToWmResponse = /**
         * This method converts the given wm HttpResponse to angular HttpResponse
         * @param {?} respObj
         * @return {?}
         */
            function (respObj) {
                /** @type {?} */
                var wmResp;
                /** @type {?} */
                var headerMap = new Map();
                wmResp = new WmHttpResponse();
                wmResp.body = respObj.body;
                wmResp.error = respObj.error;
                wmResp.message = respObj.message;
                wmResp.url = respObj.url;
                wmResp.ok = respObj.ok;
                wmResp.status = respObj.status;
                wmResp.statusText = respObj.statusText;
                respObj.headers.keys().forEach(function (header) {
                    headerMap.set(header, respObj.headers.headers.get(header.toLowerCase())[0]);
                });
                wmResp.headers = headerMap;
                return wmResp;
            };
        return WmHttpResponse;
    }(WmHttpRequest));

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var HttpServiceModule = /** @class */ (function () {
        function HttpServiceModule() {
        }
        /**
         * @return {?}
         */
        HttpServiceModule.forRoot = /**
         * @return {?}
         */
            function () {
                return {
                    ngModule: common.CommonModule,
                    providers: [
                        { provide: core$1.AbstractHttpService, useClass: HttpServiceImpl }
                    ]
                };
            };
        HttpServiceModule.decorators = [
            { type: core.NgModule, args: [{
                        imports: [
                            common.CommonModule,
                            http.HttpClientModule
                        ],
                        declarations: []
                    },] }
        ];
        return HttpServiceModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    exports.HttpServiceModule = HttpServiceModule;
    exports.HttpServiceImpl = HttpServiceImpl;
    exports.WmHttpRequest = WmHttpRequest;
    exports.WmHttpResponse = WmHttpResponse;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=index.umd.js.map