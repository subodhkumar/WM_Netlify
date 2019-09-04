import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Network } from '@ionic-native/network';
import { App, getAbortableDefer, noop, retryIfFails } from '@wm/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "@wm/core";
import * as i3 from "@ionic-native/network";
var AUTO_CONNECT_KEY = 'WM.NetworkService._autoConnect', IS_CONNECTED_KEY = 'WM.NetworkService.isConnected', excludedList = [new RegExp('/wmProperties.js')], originalXMLHttpRequestOpen = XMLHttpRequest.prototype.open, originalXMLHttpRequestSend = XMLHttpRequest.prototype.send, networkState = {
    isConnecting: false,
    isConnected: localStorage.getItem(IS_CONNECTED_KEY) === 'true',
    isNetworkAvailable: true,
    isServiceAvailable: true
};
/**
 * If server is not connected and url does not match the unblock list of regular expressions,
 * then this function return true. Otherwise, return false.
 * @param url
 * @returns {boolean}
 */
var blockUrl = function (url) {
    var block = !networkState.isConnected && _.startsWith(url, 'http');
    if (block) {
        block = !_.find(excludedList, function (regExp) { return regExp.test(url); });
    }
    return block;
};
var ɵ0 = blockUrl;
// Intercept all XHR calls
XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    if (async === void 0) { async = true; }
    if (blockUrl(url)) {
        var urlSplits = url.split('://');
        var pathIndex = urlSplits[1].indexOf('/');
        urlSplits[1] = 'localhost' + (pathIndex > 0 ? urlSplits[1].substr(pathIndex) : '/');
        url = urlSplits.join('://');
    }
    return originalXMLHttpRequestOpen.apply(this, [method, url, async, user, password]);
};
var NetworkService = /** @class */ (function () {
    function NetworkService(httpClient, app, network) {
        var _this = this;
        this.httpClient = httpClient;
        this.app = app;
        this.network = network;
        this.serviceName = NetworkService.name;
        this._autoConnect = localStorage.getItem(AUTO_CONNECT_KEY) !== 'false';
        this._isCheckingServer = false;
        /**
         * When the auto connect is enabled, then app is automatically connected  whenever server is available.
         * Every time when app goes offline, auto connect is enabled. Before app coming to online, one can disable
         * the auto connection flow using this method.
         */
        this.disableAutoConnect = function () { return _this.setAutoConnect(false); };
        /**
         * Returns true, if app is connected to server. Otherwise, returns false.
         *
         * @returns {boolean} Returns true, if app is connected to server. Otherwise, returns false.
         */
        this.isConnected = function () {
            // checking for connection type.
            if (_.get(navigator, 'connection') && navigator.connection.type) {
                networkState.isConnected = networkState.isConnected && (navigator.connection.type !== 'none');
            }
            _this.checkForNetworkStateChange();
            return networkState.isConnected;
        };
        /**
         * Returns true if app is trying to connect to server. Otherwise, returns false.
         *
         * @returns {boolean} Returns true if app is trying to connect to server. Otherwise, returns false.
         */
        this.isConnecting = function () { return networkState.isConnecting; };
    }
    /**
     * This method attempts to connect app to the server and returns a promise that will be resolved with
     * a boolean value based on the operation result.
     *
     * @returns {object} promise
     */
    NetworkService.prototype.connect = function () {
        this.setAutoConnect(true);
        return this.tryToConnect();
    };
    /**
     * This method disconnects the app from the server and returns a promise that will be resolved with
     * a boolean value based on the operation result. Use connect method to reconnect.
     *
     * @returns {object} promise
     */
    NetworkService.prototype.disconnect = function () {
        var p = this.tryToDisconnect();
        this.disableAutoConnect();
        return p;
    };
    /**
     * If pingServer is true, then it returns a promise that will be resolved with boolean based on service availability
     * check.If pingServer is false, returns a boolean value based on the last known service availability.
     *
     * @returns {boolean} if pingServer is true, then a promise is returned. Otherwise, a boolean value.
     */
    NetworkService.prototype.isAvailable = function (pingServer) {
        var _this = this;
        if (pingServer === void 0) { pingServer = false; }
        if (pingServer) {
            return this.isServiceAvailable().then(function () {
                _this.checkForNetworkStateChange();
                return networkState.isServiceAvailable;
            });
        }
        return networkState.isServiceAvailable;
    };
    /**
     * This method returns a promise that is resolved when connection is established with server.
     *
     * @returns {object} promise a promise that is resolved with the returned object of fn
     */
    NetworkService.prototype.onConnect = function () {
        var _this = this;
        var defer, cancelSubscription;
        if (this.isConnected()) {
            return Promise.resolve();
        }
        defer = getAbortableDefer();
        cancelSubscription = this.app.subscribe('onNetworkStateChange', function () {
            if (_this.isConnected()) {
                defer.resolve(true);
                cancelSubscription();
            }
        });
        defer.promise.catch(function () {
            cancelSubscription();
        });
        return defer.promise;
    };
    /**
     * This is a util method. If fn cannot execute successfully and network lost connection, then the fn will
     * be invoked when network is back. The returned can also be aborted.
     *
     * @param {function()} fn method to invoke.
     * @returns {object} promise a promise that is resolved with the returned object of fn
     */
    NetworkService.prototype.retryIfNetworkFails = function (fn) {
        var _this = this;
        var defer = getAbortableDefer();
        retryIfFails(fn, 0, 0, function () {
            var onConnectPromise;
            if (!_this.isConnected()) {
                onConnectPromise = _this.onConnect();
                defer.promise.catch(function () {
                    onConnectPromise.abort();
                });
                return onConnectPromise;
            }
            return false;
        }).then(defer.resolve, defer.reject);
        return defer.promise;
    };
    NetworkService.prototype.start = function () {
        var _this = this;
        if (window['cordova']) {
            // Connection constant will be available only when network plugin is included.
            if (window['Connection'] && navigator.connection) {
                networkState.isNetworkAvailable = navigator.connection.type !== 'none';
                networkState.isConnected = networkState.isNetworkAvailable && networkState.isConnected;
                /*
                 * When the device comes online, check is the service is available. If the service is available and auto
                 * connect flag is true, then app is automatically connected to remote server.
                 */
                this.network.onConnect().subscribe(function () {
                    networkState.isNetworkAvailable = true;
                    _this.tryToConnect().catch(noop);
                });
                /*
                 *When device goes offline, then change the network state and emit that notifies about network state change.
                 */
                this.network.onDisconnect().subscribe(function () {
                    networkState.isNetworkAvailable = false;
                    networkState.isServiceAvailable = false;
                    _this.tryToDisconnect();
                });
                this.app.subscribe('onNetworkStateChange', function (data) {
                    /**
                     * If network is available and server is not available,then
                     * try to connect when server is available.
                     */
                    if (data.isNetworkAvailable && !data.isServiceAvailable && !_this._isCheckingServer) {
                        _this._isCheckingServer = true;
                        _this.checkForServiceAvailiblity().then(function () {
                            _this._isCheckingServer = false;
                            _this.connect();
                        }, function () {
                            _this._isCheckingServer = false;
                        });
                    }
                });
            }
        }
        // to set the default n/w connection values.
        return this.tryToConnect(true).catch(noop);
    };
    /**
     * This function adds the given regular expression to the unblockList. Even app is in offline mode,
     * the urls matching with the given regular expression are not blocked by NetworkService.
     *
     * @param {string} urlRegex regular expression
     */
    NetworkService.prototype.unblock = function (urlRegex) {
        excludedList.push(new RegExp(urlRegex));
    };
    NetworkService.prototype.checkForNetworkStateChange = function () {
        if (!_.isEqual(this._lastKnownNetworkState, networkState)) {
            this._lastKnownNetworkState = _.clone(networkState);
            this.app.notify('onNetworkStateChange', this._lastKnownNetworkState);
        }
    };
    /**
     * Returns a promise that is resolved when server is available.
     * @returns {*}
     */
    NetworkService.prototype.checkForServiceAvailiblity = function () {
        var _this = this;
        var maxTimeout = 4500;
        return new Promise(function (resolve) {
            var intervalId = setInterval(function () {
                if (networkState.isNetworkAvailable) {
                    _this.isServiceAvailable(maxTimeout).then(function (available) {
                        if (available) {
                            clearInterval(intervalId);
                            resolve();
                        }
                    });
                }
            }, 5000);
        });
    };
    /**
     * Pings server to check whether server is available. Based on ping response network state is modified.
     * @returns {*} a promise that resolved with true, if server responds with valid status.
     * Otherwise, the promise is resolved with false.
     */
    NetworkService.prototype.isServiceAvailable = function (maxTimeout) {
        return this.pingServer(maxTimeout).then(function (response) {
            networkState.isServiceAvailable = response;
            if (!networkState.isServiceAvailable) {
                networkState.isConnecting = false;
                networkState.isConnected = false;
            }
            return response;
        });
    };
    /**
     * Pings server
     * @returns {*} a promise that resolved with true, if server responds with valid status.
     * Otherwise, the promise is resolved with false.
     * default timeout value is 1min.
     */
    NetworkService.prototype.pingServer = function (maxTimeout) {
        var _this = this;
        if (maxTimeout === void 0) { maxTimeout = 60000; }
        return new Promise(function (resolve) {
            var oReq = new XMLHttpRequest();
            var baseURL = _this.app.deployedUrl;
            if (baseURL && !_.endsWith(baseURL, '/')) {
                baseURL += '/';
            }
            else {
                baseURL = baseURL || '';
            }
            var timer = setTimeout(function () {
                oReq.abort(); // abort request
                resolve(false);
            }, maxTimeout);
            oReq.addEventListener('load', function () {
                if (oReq.status === 200) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
                if (timer) {
                    clearTimeout(timer);
                }
            });
            oReq.addEventListener('error', function () { return resolve(false); });
            oReq.open('GET', baseURL + 'services/application/wmProperties.js?t=' + Date.now());
            oReq.send();
        });
    };
    NetworkService.prototype.setAutoConnect = function (flag) {
        this._autoConnect = flag;
        localStorage.setItem(AUTO_CONNECT_KEY, '' + flag);
    };
    /**
     * Tries to connect to remote server. Network State will be changed based on the success of connection
     * operation and emits an event notifying the network state change.
     *
     * @param silentMode {boolean} if true and connection is successful, then no event is emitted. Otherwise,
     * events are emitted for network status change.
     * @returns {*} a promise
     */
    NetworkService.prototype.tryToConnect = function (silentMode) {
        var _this = this;
        if (silentMode === void 0) { silentMode = false; }
        return new Promise(function (resolve, reject) {
            _this.isServiceAvailable(5000).then(function () {
                if (networkState.isServiceAvailable && _this._autoConnect) {
                    networkState.isConnecting = true;
                    if (!silentMode) {
                        _this.checkForNetworkStateChange();
                    }
                    setTimeout(function () {
                        networkState.isConnecting = false;
                        networkState.isConnected = true;
                        localStorage.setItem(IS_CONNECTED_KEY, '' + true);
                        if (!silentMode) {
                            _this.checkForNetworkStateChange();
                        }
                        resolve(true);
                    }, silentMode ? 0 : 5000);
                }
                else {
                    networkState.isConnecting = false;
                    networkState.isConnected = false;
                    localStorage.setItem(IS_CONNECTED_KEY, '' + false);
                    reject();
                    _this.checkForNetworkStateChange();
                }
            });
        });
    };
    NetworkService.prototype.tryToDisconnect = function () {
        networkState.isConnected = false;
        networkState.isConnecting = false;
        this.checkForNetworkStateChange();
        localStorage.setItem(IS_CONNECTED_KEY, '' + networkState.isConnected);
        return Promise.resolve(networkState.isConnected);
    };
    NetworkService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    NetworkService.ctorParameters = function () { return [
        { type: HttpClient },
        { type: App },
        { type: Network }
    ]; };
    NetworkService.ngInjectableDef = i0.defineInjectable({ factory: function NetworkService_Factory() { return new NetworkService(i0.inject(i1.HttpClient), i0.inject(i2.App), i0.inject(i3.Network)); }, token: NetworkService, providedIn: "root" });
    return NetworkService;
}());
export { NetworkService };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29yay5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9jb3JlLyIsInNvdXJjZXMiOlsic2VydmljZXMvbmV0d29yay5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRWxELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVoRCxPQUFPLEVBQUUsR0FBRyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsTUFBTSxVQUFVLENBQUM7Ozs7O0FBTXRFLElBQU0sZ0JBQWdCLEdBQUcsZ0NBQWdDLEVBQ3JELGdCQUFnQixHQUFHLCtCQUErQixFQUNsRCxZQUFZLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQy9DLDBCQUEwQixHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUMxRCwwQkFBMEIsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLElBQUksRUFDMUQsWUFBWSxHQUFHO0lBQ1gsWUFBWSxFQUFHLEtBQUs7SUFDcEIsV0FBVyxFQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxNQUFNO0lBQy9ELGtCQUFrQixFQUFHLElBQUk7SUFDekIsa0JBQWtCLEVBQUcsSUFBSTtDQUM1QixDQUFDO0FBRU47Ozs7O0dBS0c7QUFDSCxJQUFNLFFBQVEsR0FBRyxVQUFBLEdBQUc7SUFDaEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxZQUFZLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25FLElBQUksS0FBSyxFQUFFO1FBQ1AsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFB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QUFNLEVBQUUsQ0FBQztvQkFDVCxLQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztpQkFDckM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLHdDQUFlLEdBQXZCO1FBQ0ksWUFBWSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDakMsWUFBWSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDbEMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDbEMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDckQsQ0FBQzs7Z0JBclRKLFVBQVUsU0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7Ozs7Z0JBL0N6QixVQUFVO2dCQUlWLEdBQUc7Z0JBRkgsT0FBTzs7O3lCQUhoQjtDQXNXQyxBQXRURCxJQXNUQztTQXJUWSxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuaW1wb3J0IHsgTmV0d29yayB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvbmV0d29yayc7XG5cbmltcG9ydCB7IEFwcCwgZ2V0QWJvcnRhYmxlRGVmZXIsIG5vb3AsIHJldHJ5SWZGYWlscyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgSURldmljZVN0YXJ0VXBTZXJ2aWNlIH0gZnJvbSAnLi9kZXZpY2Utc3RhcnQtdXAtc2VydmljZSc7XG5cbmRlY2xhcmUgY29uc3QgXywgY29yZG92YSwgQ29ubmVjdGlvbiwgbmF2aWdhdG9yO1xuXG5jb25zdCBBVVRPX0NPTk5FQ1RfS0VZID0gJ1dNLk5ldHdvcmtTZXJ2aWNlLl9hdXRvQ29ubmVjdCcsXG4gICAgSVNfQ09OTkVDVEVEX0tFWSA9ICdXTS5OZXR3b3JrU2VydmljZS5pc0Nvbm5lY3RlZCcsXG4gICAgZXhjbHVkZWRMaXN0ID0gW25ldyBSZWdFeHAoJy93bVByb3BlcnRpZXMuanMnKV0sXG4gICAgb3JpZ2luYWxYTUxIdHRwUmVxdWVzdE9wZW4gPSBYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUub3BlbixcbiAgICBvcmlnaW5hbFhNTEh0dHBSZXF1ZXN0U2VuZCA9IFhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kLFxuICAgIG5ldHdvcmtTdGF0ZSA9IHtcbiAgICAgICAgaXNDb25uZWN0aW5nIDogZmFsc2UsXG4gICAgICAgIGlzQ29ubmVjdGVkIDogbG9jYWxTdG9yYWdlLmdldEl0ZW0oSVNfQ09OTkVDVEVEX0tFWSkgPT09ICd0cnVlJyxcbiAgICAgICAgaXNOZXR3b3JrQXZhaWxhYmxlIDogdHJ1ZSxcbiAgICAgICAgaXNTZXJ2aWNlQXZhaWxhYmxlIDogdHJ1ZVxuICAgIH07XG5cbi8qKlxuICogSWYgc2VydmVyIGlzIG5vdCBjb25uZWN0ZWQgYW5kIHVybCBkb2VzIG5vdCBtYXRjaCB0aGUgdW5ibG9jayBsaXN0IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMsXG4gKiB0aGVuIHRoaXMgZnVuY3Rpb24gcmV0dXJuIHRydWUuIE90aGVyd2lzZSwgcmV0dXJuIGZhbHNlLlxuICogQHBhcmFtIHVybFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmNvbnN0IGJsb2NrVXJsID0gdXJsID0+IHtcbiAgICBsZXQgYmxvY2sgPSAhbmV0d29ya1N0YXRlLmlzQ29ubmVjdGVkICYmIF8uc3RhcnRzV2l0aCh1cmwsICdodHRwJyk7XG4gICAgaWYgKGJsb2NrKSB7XG4gICAgICAgIGJsb2NrID0gIV8uZmluZChleGNsdWRlZExpc3QsIHJlZ0V4cCA9PiByZWdFeHAudGVzdCh1cmwpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJsb2NrO1xufTtcblxuLy8gSW50ZXJjZXB0IGFsbCBYSFIgY2FsbHNcblhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKG1ldGhvZDogc3RyaW5nLCB1cmw6IHN0cmluZywgYXN5bmM6IGJvb2xlYW4gPSB0cnVlLCB1c2VyPzogc3RyaW5nLCBwYXNzd29yZD86IHN0cmluZykge1xuICAgIGlmIChibG9ja1VybCh1cmwpKSB7XG4gICAgICAgIGNvbnN0IHVybFNwbGl0cyA9IHVybC5zcGxpdCgnOi8vJyk7XG4gICAgICAgIGNvbnN0IHBhdGhJbmRleCA9IHVybFNwbGl0c1sxXS5pbmRleE9mKCcvJyk7XG4gICAgICAgIHVybFNwbGl0c1sxXSA9ICdsb2NhbGhvc3QnICsgKHBhdGhJbmRleCA+IDAgPyB1cmxTcGxpdHNbMV0uc3Vic3RyKHBhdGhJbmRleCkgOiAnLycpO1xuICAgICAgICB1cmwgPSB1cmxTcGxpdHMuam9pbignOi8vJyk7XG4gICAgfVxuICAgIHJldHVybiBvcmlnaW5hbFhNTEh0dHBSZXF1ZXN0T3Blbi5hcHBseSh0aGlzLCBbbWV0aG9kLCB1cmwsIGFzeW5jLCB1c2VyLCBwYXNzd29yZF0pO1xufTtcblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBOZXR3b3JrU2VydmljZSBpbXBsZW1lbnRzIElEZXZpY2VTdGFydFVwU2VydmljZSB7XG5cbiAgICBwdWJsaWMgc2VydmljZU5hbWUgPSBOZXR3b3JrU2VydmljZS5uYW1lO1xuXG4gICAgcHJpdmF0ZSBfYXV0b0Nvbm5lY3QgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShBVVRPX0NPTk5FQ1RfS0VZKSAhPT0gJ2ZhbHNlJztcbiAgICBwcml2YXRlIF9sYXN0S25vd25OZXR3b3JrU3RhdGU6IGFueTtcbiAgICBwcml2YXRlIF9pc0NoZWNraW5nU2VydmVyID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHBDbGllbnQ6IEh0dHBDbGllbnQsIHByaXZhdGUgYXBwOiBBcHAsIHByaXZhdGUgbmV0d29yazogTmV0d29yaykge1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGF0dGVtcHRzIHRvIGNvbm5lY3QgYXBwIHRvIHRoZSBzZXJ2ZXIgYW5kIHJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aXRoXG4gICAgICogYSBib29sZWFuIHZhbHVlIGJhc2VkIG9uIHRoZSBvcGVyYXRpb24gcmVzdWx0LlxuICAgICAqXG4gICAgICogQHJldHVybnMge29iamVjdH0gcHJvbWlzZVxuICAgICAqL1xuICAgIHB1YmxpYyBjb25uZWN0KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICB0aGlzLnNldEF1dG9Db25uZWN0KHRydWUpO1xuICAgICAgICByZXR1cm4gdGhpcy50cnlUb0Nvbm5lY3QoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGVuIHRoZSBhdXRvIGNvbm5lY3QgaXMgZW5hYmxlZCwgdGhlbiBhcHAgaXMgYXV0b21hdGljYWxseSBjb25uZWN0ZWQgIHdoZW5ldmVyIHNlcnZlciBpcyBhdmFpbGFibGUuXG4gICAgICogRXZlcnkgdGltZSB3aGVuIGFwcCBnb2VzIG9mZmxpbmUsIGF1dG8gY29ubmVjdCBpcyBlbmFibGVkLiBCZWZvcmUgYXBwIGNvbWluZyB0byBvbmxpbmUsIG9uZSBjYW4gZGlzYWJsZVxuICAgICAqIHRoZSBhdXRvIGNvbm5lY3Rpb24gZmxvdyB1c2luZyB0aGlzIG1ldGhvZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZGlzYWJsZUF1dG9Db25uZWN0ID0gKCkgPT4gdGhpcy5zZXRBdXRvQ29ubmVjdChmYWxzZSk7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBkaXNjb25uZWN0cyB0aGUgYXBwIGZyb20gdGhlIHNlcnZlciBhbmQgcmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIHdpdGhcbiAgICAgKiBhIGJvb2xlYW4gdmFsdWUgYmFzZWQgb24gdGhlIG9wZXJhdGlvbiByZXN1bHQuIFVzZSBjb25uZWN0IG1ldGhvZCB0byByZWNvbm5lY3QuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBwcm9taXNlXG4gICAgICovXG4gICAgcHVibGljIGRpc2Nvbm5lY3QoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IHAgPSB0aGlzLnRyeVRvRGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLmRpc2FibGVBdXRvQ29ubmVjdCgpO1xuICAgICAgICByZXR1cm4gcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiBwaW5nU2VydmVyIGlzIHRydWUsIHRoZW4gaXQgcmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIHdpdGggYm9vbGVhbiBiYXNlZCBvbiBzZXJ2aWNlIGF2YWlsYWJpbGl0eVxuICAgICAqIGNoZWNrLklmIHBpbmdTZXJ2ZXIgaXMgZmFsc2UsIHJldHVybnMgYSBib29sZWFuIHZhbHVlIGJhc2VkIG9uIHRoZSBsYXN0IGtub3duIHNlcnZpY2UgYXZhaWxhYmlsaXR5LlxuICAgICAqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IGlmIHBpbmdTZXJ2ZXIgaXMgdHJ1ZSwgdGhlbiBhIHByb21pc2UgaXMgcmV0dXJuZWQuIE90aGVyd2lzZSwgYSBib29sZWFuIHZhbHVlLlxuICAgICAqL1xuICAgIHB1YmxpYyBpc0F2YWlsYWJsZShwaW5nU2VydmVyID0gZmFsc2UpOiBib29sZWFuIHwgUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGlmIChwaW5nU2VydmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pc1NlcnZpY2VBdmFpbGFibGUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrRm9yTmV0d29ya1N0YXRlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldHdvcmtTdGF0ZS5pc1NlcnZpY2VBdmFpbGFibGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV0d29ya1N0YXRlLmlzU2VydmljZUF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUsIGlmIGFwcCBpcyBjb25uZWN0ZWQgdG8gc2VydmVyLiBPdGhlcndpc2UsIHJldHVybnMgZmFsc2UuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyB0cnVlLCBpZiBhcHAgaXMgY29ubmVjdGVkIHRvIHNlcnZlci4gT3RoZXJ3aXNlLCByZXR1cm5zIGZhbHNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBpc0Nvbm5lY3RlZCA9ICgpID0+IHtcbiAgICAgICAgLy8gY2hlY2tpbmcgZm9yIGNvbm5lY3Rpb24gdHlwZS5cbiAgICAgICAgaWYgKF8uZ2V0KG5hdmlnYXRvciwgJ2Nvbm5lY3Rpb24nKSAmJiBuYXZpZ2F0b3IuY29ubmVjdGlvbi50eXBlKSB7XG4gICAgICAgICAgICBuZXR3b3JrU3RhdGUuaXNDb25uZWN0ZWQgPSBuZXR3b3JrU3RhdGUuaXNDb25uZWN0ZWQgJiYgKG5hdmlnYXRvci5jb25uZWN0aW9uLnR5cGUgIT09ICdub25lJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGVja0Zvck5ldHdvcmtTdGF0ZUNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gbmV0d29ya1N0YXRlLmlzQ29ubmVjdGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiBhcHAgaXMgdHJ5aW5nIHRvIGNvbm5lY3QgdG8gc2VydmVyLiBPdGhlcndpc2UsIHJldHVybnMgZmFsc2UuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIGFwcCBpcyB0cnlpbmcgdG8gY29ubmVjdCB0byBzZXJ2ZXIuIE90aGVyd2lzZSwgcmV0dXJucyBmYWxzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNDb25uZWN0aW5nID0gKCkgPT4gbmV0d29ya1N0YXRlLmlzQ29ubmVjdGluZztcblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiBjb25uZWN0aW9uIGlzIGVzdGFibGlzaGVkIHdpdGggc2VydmVyLlxuICAgICAqXG4gICAgICogQHJldHVybnMge29iamVjdH0gcHJvbWlzZSBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIHRoZSByZXR1cm5lZCBvYmplY3Qgb2YgZm5cbiAgICAgKi9cbiAgICBwdWJsaWMgb25Db25uZWN0KCkge1xuICAgICAgICBsZXQgZGVmZXIsXG4gICAgICAgICAgICBjYW5jZWxTdWJzY3JpcHRpb247XG4gICAgICAgIGlmICh0aGlzLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBkZWZlciA9IGdldEFib3J0YWJsZURlZmVyKCk7XG4gICAgICAgIGNhbmNlbFN1YnNjcmlwdGlvbiA9IHRoaXMuYXBwLnN1YnNjcmliZSgnb25OZXR3b3JrU3RhdGVDaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBjYW5jZWxTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRlZmVyLnByb21pc2UuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FuY2VsU3Vic2NyaXB0aW9uKCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGEgdXRpbCBtZXRob2QuIElmIGZuIGNhbm5vdCBleGVjdXRlIHN1Y2Nlc3NmdWxseSBhbmQgbmV0d29yayBsb3N0IGNvbm5lY3Rpb24sIHRoZW4gdGhlIGZuIHdpbGxcbiAgICAgKiBiZSBpbnZva2VkIHdoZW4gbmV0d29yayBpcyBiYWNrLiBUaGUgcmV0dXJuZWQgY2FuIGFsc28gYmUgYWJvcnRlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gZm4gbWV0aG9kIHRvIGludm9rZS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBwcm9taXNlIGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggdGhlIHJldHVybmVkIG9iamVjdCBvZiBmblxuICAgICAqL1xuICAgIHB1YmxpYyByZXRyeUlmTmV0d29ya0ZhaWxzKGZuKSB7XG4gICAgICAgIGNvbnN0IGRlZmVyID0gZ2V0QWJvcnRhYmxlRGVmZXIoKTtcbiAgICAgICAgcmV0cnlJZkZhaWxzKGZuLCAwLCAwLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgb25Db25uZWN0UHJvbWlzZTtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICAgICAgb25Db25uZWN0UHJvbWlzZSA9IHRoaXMub25Db25uZWN0KCk7XG4gICAgICAgICAgICAgICAgZGVmZXIucHJvbWlzZS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uQ29ubmVjdFByb21pc2UuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb25Db25uZWN0UHJvbWlzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSkudGhlbihkZWZlci5yZXNvbHZlLCBkZWZlci5yZWplY3QpO1xuICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhcnQoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgaWYgKHdpbmRvd1snY29yZG92YSddKSB7XG4gICAgICAgICAgICAvLyBDb25uZWN0aW9uIGNvbnN0YW50IHdpbGwgYmUgYXZhaWxhYmxlIG9ubHkgd2hlbiBuZXR3b3JrIHBsdWdpbiBpcyBpbmNsdWRlZC5cbiAgICAgICAgICAgIGlmICh3aW5kb3dbJ0Nvbm5lY3Rpb24nXSAmJiBuYXZpZ2F0b3IuY29ubmVjdGlvbikge1xuICAgICAgICAgICAgICAgIG5ldHdvcmtTdGF0ZS5pc05ldHdvcmtBdmFpbGFibGUgPSBuYXZpZ2F0b3IuY29ubmVjdGlvbi50eXBlICE9PSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgbmV0d29ya1N0YXRlLmlzQ29ubmVjdGVkID0gbmV0d29ya1N0YXRlLmlzTmV0d29ya0F2YWlsYWJsZSAmJiBuZXR3b3JrU3RhdGUuaXNDb25uZWN0ZWQ7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgKiBXaGVuIHRoZSBkZXZpY2UgY29tZXMgb25saW5lLCBjaGVjayBpcyB0aGUgc2VydmljZSBpcyBhdmFpbGFibGUuIElmIHRoZSBzZXJ2aWNlIGlzIGF2YWlsYWJsZSBhbmQgYXV0b1xuICAgICAgICAgICAgICAgICAqIGNvbm5lY3QgZmxhZyBpcyB0cnVlLCB0aGVuIGFwcCBpcyBhdXRvbWF0aWNhbGx5IGNvbm5lY3RlZCB0byByZW1vdGUgc2VydmVyLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHRoaXMubmV0d29yay5vbkNvbm5lY3QoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBuZXR3b3JrU3RhdGUuaXNOZXR3b3JrQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cnlUb0Nvbm5lY3QoKS5jYXRjaChub29wKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICpXaGVuIGRldmljZSBnb2VzIG9mZmxpbmUsIHRoZW4gY2hhbmdlIHRoZSBuZXR3b3JrIHN0YXRlIGFuZCBlbWl0IHRoYXQgbm90aWZpZXMgYWJvdXQgbmV0d29yayBzdGF0ZSBjaGFuZ2UuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy5uZXR3b3JrLm9uRGlzY29ubmVjdCgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5ldHdvcmtTdGF0ZS5pc05ldHdvcmtBdmFpbGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgbmV0d29ya1N0YXRlLmlzU2VydmljZUF2YWlsYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyeVRvRGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5hcHAuc3Vic2NyaWJlKCdvbk5ldHdvcmtTdGF0ZUNoYW5nZScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBJZiBuZXR3b3JrIGlzIGF2YWlsYWJsZSBhbmQgc2VydmVyIGlzIG5vdCBhdmFpbGFibGUsdGhlblxuICAgICAgICAgICAgICAgICAgICAgKiB0cnkgdG8gY29ubmVjdCB3aGVuIHNlcnZlciBpcyBhdmFpbGFibGUuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5pc05ldHdvcmtBdmFpbGFibGUgJiYgIWRhdGEuaXNTZXJ2aWNlQXZhaWxhYmxlICYmICF0aGlzLl9pc0NoZWNraW5nU2VydmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc0NoZWNraW5nU2VydmVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tGb3JTZXJ2aWNlQXZhaWxpYmxpdHkoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc0NoZWNraW5nU2VydmVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faXNDaGVja2luZ1NlcnZlciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyB0byBzZXQgdGhlIGRlZmF1bHQgbi93IGNvbm5lY3Rpb24gdmFsdWVzLlxuICAgICAgICByZXR1cm4gdGhpcy50cnlUb0Nvbm5lY3QodHJ1ZSkuY2F0Y2gobm9vcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiBhZGRzIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24gdG8gdGhlIHVuYmxvY2tMaXN0LiBFdmVuIGFwcCBpcyBpbiBvZmZsaW5lIG1vZGUsXG4gICAgICogdGhlIHVybHMgbWF0Y2hpbmcgd2l0aCB0aGUgZ2l2ZW4gcmVndWxhciBleHByZXNzaW9uIGFyZSBub3QgYmxvY2tlZCBieSBOZXR3b3JrU2VydmljZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxSZWdleCByZWd1bGFyIGV4cHJlc3Npb25cbiAgICAgKi9cbiAgICBwdWJsaWMgdW5ibG9jayh1cmxSZWdleDogc3RyaW5nKSB7XG4gICAgICAgIGV4Y2x1ZGVkTGlzdC5wdXNoKG5ldyBSZWdFeHAodXJsUmVnZXgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrRm9yTmV0d29ya1N0YXRlQ2hhbmdlKCkge1xuICAgICAgICBpZiAoIV8uaXNFcXVhbCh0aGlzLl9sYXN0S25vd25OZXR3b3JrU3RhdGUsIG5ldHdvcmtTdGF0ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX2xhc3RLbm93bk5ldHdvcmtTdGF0ZSA9IF8uY2xvbmUobmV0d29ya1N0YXRlKTtcbiAgICAgICAgICAgIHRoaXMuYXBwLm5vdGlmeSgnb25OZXR3b3JrU3RhdGVDaGFuZ2UnLCB0aGlzLl9sYXN0S25vd25OZXR3b3JrU3RhdGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHNlcnZlciBpcyBhdmFpbGFibGUuXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgcHJpdmF0ZSBjaGVja0ZvclNlcnZpY2VBdmFpbGlibGl0eSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgbWF4VGltZW91dCA9IDQ1MDA7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG5ldHdvcmtTdGF0ZS5pc05ldHdvcmtBdmFpbGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NlcnZpY2VBdmFpbGFibGUobWF4VGltZW91dCkudGhlbihhdmFpbGFibGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF2YWlsYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGluZ3Mgc2VydmVyIHRvIGNoZWNrIHdoZXRoZXIgc2VydmVyIGlzIGF2YWlsYWJsZS4gQmFzZWQgb24gcGluZyByZXNwb25zZSBuZXR3b3JrIHN0YXRlIGlzIG1vZGlmaWVkLlxuICAgICAqIEByZXR1cm5zIHsqfSBhIHByb21pc2UgdGhhdCByZXNvbHZlZCB3aXRoIHRydWUsIGlmIHNlcnZlciByZXNwb25kcyB3aXRoIHZhbGlkIHN0YXR1cy5cbiAgICAgKiBPdGhlcndpc2UsIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggZmFsc2UuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc1NlcnZpY2VBdmFpbGFibGUobWF4VGltZW91dD86IG51bWJlcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5waW5nU2VydmVyKG1heFRpbWVvdXQpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgbmV0d29ya1N0YXRlLmlzU2VydmljZUF2YWlsYWJsZSA9IHJlc3BvbnNlO1xuICAgICAgICAgICAgaWYgKCFuZXR3b3JrU3RhdGUuaXNTZXJ2aWNlQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICAgICAgbmV0d29ya1N0YXRlLmlzQ29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIG5ldHdvcmtTdGF0ZS5pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQaW5ncyBzZXJ2ZXJcbiAgICAgKiBAcmV0dXJucyB7Kn0gYSBwcm9taXNlIHRoYXQgcmVzb2x2ZWQgd2l0aCB0cnVlLCBpZiBzZXJ2ZXIgcmVzcG9uZHMgd2l0aCB2YWxpZCBzdGF0dXMuXG4gICAgICogT3RoZXJ3aXNlLCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIGZhbHNlLlxuICAgICAqIGRlZmF1bHQgdGltZW91dCB2YWx1ZSBpcyAxbWluLlxuICAgICAqL1xuICAgIHByaXZhdGUgcGluZ1NlcnZlcihtYXhUaW1lb3V0ID0gNjAwMDApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb1JlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgbGV0IGJhc2VVUkwgPSB0aGlzLmFwcC5kZXBsb3llZFVybDtcbiAgICAgICAgICAgIGlmIChiYXNlVVJMICYmICFfLmVuZHNXaXRoKGJhc2VVUkwsICcvJykpIHtcbiAgICAgICAgICAgICAgICBiYXNlVVJMICs9ICcvJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZVVSTCA9IGJhc2VVUkwgfHwgJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgb1JlcS5hYm9ydCgpOyAvLyBhYm9ydCByZXF1ZXN0XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICB9LCBtYXhUaW1lb3V0KTtcblxuICAgICAgICAgICAgb1JlcS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChvUmVxLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aW1lcikge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBvUmVxLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKCkgPT4gcmVzb2x2ZShmYWxzZSkpO1xuICAgICAgICAgICAgb1JlcS5vcGVuKCdHRVQnLCBiYXNlVVJMICsgJ3NlcnZpY2VzL2FwcGxpY2F0aW9uL3dtUHJvcGVydGllcy5qcz90PScgKyBEYXRlLm5vdygpKTtcbiAgICAgICAgICAgIG9SZXEuc2VuZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldEF1dG9Db25uZWN0KGZsYWc6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fYXV0b0Nvbm5lY3QgPSBmbGFnO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShBVVRPX0NPTk5FQ1RfS0VZLCAnJyArIGZsYWcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyaWVzIHRvIGNvbm5lY3QgdG8gcmVtb3RlIHNlcnZlci4gTmV0d29yayBTdGF0ZSB3aWxsIGJlIGNoYW5nZWQgYmFzZWQgb24gdGhlIHN1Y2Nlc3Mgb2YgY29ubmVjdGlvblxuICAgICAqIG9wZXJhdGlvbiBhbmQgZW1pdHMgYW4gZXZlbnQgbm90aWZ5aW5nIHRoZSBuZXR3b3JrIHN0YXRlIGNoYW5nZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBzaWxlbnRNb2RlIHtib29sZWFufSBpZiB0cnVlIGFuZCBjb25uZWN0aW9uIGlzIHN1Y2Nlc3NmdWwsIHRoZW4gbm8gZXZlbnQgaXMgZW1pdHRlZC4gT3RoZXJ3aXNlLFxuICAgICAqIGV2ZW50cyBhcmUgZW1pdHRlZCBmb3IgbmV0d29yayBzdGF0dXMgY2hhbmdlLlxuICAgICAqIEByZXR1cm5zIHsqfSBhIHByb21pc2VcbiAgICAgKi9cbiAgICBwcml2YXRlIHRyeVRvQ29ubmVjdChzaWxlbnRNb2RlID0gZmFsc2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaXNTZXJ2aWNlQXZhaWxhYmxlKDUwMDApLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChuZXR3b3JrU3RhdGUuaXNTZXJ2aWNlQXZhaWxhYmxlICYmIHRoaXMuX2F1dG9Db25uZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIG5ldHdvcmtTdGF0ZS5pc0Nvbm5lY3RpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXNpbGVudE1vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tGb3JOZXR3b3JrU3RhdGVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldHdvcmtTdGF0ZS5pc0Nvbm5lY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldHdvcmtTdGF0ZS5pc0Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShJU19DT05ORUNURURfS0VZLCAnJyArIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzaWxlbnRNb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja0Zvck5ldHdvcmtTdGF0ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgc2lsZW50TW9kZSA/IDAgOiA1MDAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuZXR3b3JrU3RhdGUuaXNDb25uZWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIG5ldHdvcmtTdGF0ZS5pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShJU19DT05ORUNURURfS0VZLCAnJyArIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tGb3JOZXR3b3JrU3RhdGVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0cnlUb0Rpc2Nvbm5lY3QoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIG5ldHdvcmtTdGF0ZS5pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICBuZXR3b3JrU3RhdGUuaXNDb25uZWN0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2hlY2tGb3JOZXR3b3JrU3RhdGVDaGFuZ2UoKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oSVNfQ09OTkVDVEVEX0tFWSwgJycgKyBuZXR3b3JrU3RhdGUuaXNDb25uZWN0ZWQpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldHdvcmtTdGF0ZS5pc0Nvbm5lY3RlZCk7XG4gICAgfVxufVxuIl19