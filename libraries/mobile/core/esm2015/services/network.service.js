import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Network } from '@ionic-native/network';
import { App, getAbortableDefer, noop, retryIfFails } from '@wm/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "@wm/core";
import * as i3 from "@ionic-native/network";
const AUTO_CONNECT_KEY = 'WM.NetworkService._autoConnect', IS_CONNECTED_KEY = 'WM.NetworkService.isConnected', excludedList = [new RegExp('/wmProperties.js')], originalXMLHttpRequestOpen = XMLHttpRequest.prototype.open, originalXMLHttpRequestSend = XMLHttpRequest.prototype.send, networkState = {
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
const blockUrl = url => {
    let block = !networkState.isConnected && _.startsWith(url, 'http');
    if (block) {
        block = !_.find(excludedList, regExp => regExp.test(url));
    }
    return block;
};
const ɵ0 = blockUrl;
// Intercept all XHR calls
XMLHttpRequest.prototype.open = function (method, url, async = true, user, password) {
    if (blockUrl(url)) {
        const urlSplits = url.split('://');
        const pathIndex = urlSplits[1].indexOf('/');
        urlSplits[1] = 'localhost' + (pathIndex > 0 ? urlSplits[1].substr(pathIndex) : '/');
        url = urlSplits.join('://');
    }
    return originalXMLHttpRequestOpen.apply(this, [method, url, async, user, password]);
};
export class NetworkService {
    constructor(httpClient, app, network) {
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
        this.disableAutoConnect = () => this.setAutoConnect(false);
        /**
         * Returns true, if app is connected to server. Otherwise, returns false.
         *
         * @returns {boolean} Returns true, if app is connected to server. Otherwise, returns false.
         */
        this.isConnected = () => {
            // checking for connection type.
            if (_.get(navigator, 'connection') && navigator.connection.type) {
                networkState.isConnected = networkState.isConnected && (navigator.connection.type !== 'none');
            }
            this.checkForNetworkStateChange();
            return networkState.isConnected;
        };
        /**
         * Returns true if app is trying to connect to server. Otherwise, returns false.
         *
         * @returns {boolean} Returns true if app is trying to connect to server. Otherwise, returns false.
         */
        this.isConnecting = () => networkState.isConnecting;
    }
    /**
     * This method attempts to connect app to the server and returns a promise that will be resolved with
     * a boolean value based on the operation result.
     *
     * @returns {object} promise
     */
    connect() {
        this.setAutoConnect(true);
        return this.tryToConnect();
    }
    /**
     * This method disconnects the app from the server and returns a promise that will be resolved with
     * a boolean value based on the operation result. Use connect method to reconnect.
     *
     * @returns {object} promise
     */
    disconnect() {
        const p = this.tryToDisconnect();
        this.disableAutoConnect();
        return p;
    }
    /**
     * If pingServer is true, then it returns a promise that will be resolved with boolean based on service availability
     * check.If pingServer is false, returns a boolean value based on the last known service availability.
     *
     * @returns {boolean} if pingServer is true, then a promise is returned. Otherwise, a boolean value.
     */
    isAvailable(pingServer = false) {
        if (pingServer) {
            return this.isServiceAvailable().then(() => {
                this.checkForNetworkStateChange();
                return networkState.isServiceAvailable;
            });
        }
        return networkState.isServiceAvailable;
    }
    /**
     * This method returns a promise that is resolved when connection is established with server.
     *
     * @returns {object} promise a promise that is resolved with the returned object of fn
     */
    onConnect() {
        let defer, cancelSubscription;
        if (this.isConnected()) {
            return Promise.resolve();
        }
        defer = getAbortableDefer();
        cancelSubscription = this.app.subscribe('onNetworkStateChange', () => {
            if (this.isConnected()) {
                defer.resolve(true);
                cancelSubscription();
            }
        });
        defer.promise.catch(function () {
            cancelSubscription();
        });
        return defer.promise;
    }
    /**
     * This is a util method. If fn cannot execute successfully and network lost connection, then the fn will
     * be invoked when network is back. The returned can also be aborted.
     *
     * @param {function()} fn method to invoke.
     * @returns {object} promise a promise that is resolved with the returned object of fn
     */
    retryIfNetworkFails(fn) {
        const defer = getAbortableDefer();
        retryIfFails(fn, 0, 0, () => {
            let onConnectPromise;
            if (!this.isConnected()) {
                onConnectPromise = this.onConnect();
                defer.promise.catch(function () {
                    onConnectPromise.abort();
                });
                return onConnectPromise;
            }
            return false;
        }).then(defer.resolve, defer.reject);
        return defer.promise;
    }
    start() {
        if (window['cordova']) {
            // Connection constant will be available only when network plugin is included.
            if (window['Connection'] && navigator.connection) {
                networkState.isNetworkAvailable = navigator.connection.type !== 'none';
                networkState.isConnected = networkState.isNetworkAvailable && networkState.isConnected;
                /*
                 * When the device comes online, check is the service is available. If the service is available and auto
                 * connect flag is true, then app is automatically connected to remote server.
                 */
                this.network.onConnect().subscribe(() => {
                    networkState.isNetworkAvailable = true;
                    this.tryToConnect().catch(noop);
                });
                /*
                 *When device goes offline, then change the network state and emit that notifies about network state change.
                 */
                this.network.onDisconnect().subscribe(() => {
                    networkState.isNetworkAvailable = false;
                    networkState.isServiceAvailable = false;
                    this.tryToDisconnect();
                });
                this.app.subscribe('onNetworkStateChange', (data) => {
                    /**
                     * If network is available and server is not available,then
                     * try to connect when server is available.
                     */
                    if (data.isNetworkAvailable && !data.isServiceAvailable && !this._isCheckingServer) {
                        this._isCheckingServer = true;
                        this.checkForServiceAvailiblity().then(() => {
                            this._isCheckingServer = false;
                            this.connect();
                        }, () => {
                            this._isCheckingServer = false;
                        });
                    }
                });
            }
        }
        // to set the default n/w connection values.
        return this.tryToConnect(true).catch(noop);
    }
    /**
     * This function adds the given regular expression to the unblockList. Even app is in offline mode,
     * the urls matching with the given regular expression are not blocked by NetworkService.
     *
     * @param {string} urlRegex regular expression
     */
    unblock(urlRegex) {
        excludedList.push(new RegExp(urlRegex));
    }
    checkForNetworkStateChange() {
        if (!_.isEqual(this._lastKnownNetworkState, networkState)) {
            this._lastKnownNetworkState = _.clone(networkState);
            this.app.notify('onNetworkStateChange', this._lastKnownNetworkState);
        }
    }
    /**
     * Returns a promise that is resolved when server is available.
     * @returns {*}
     */
    checkForServiceAvailiblity() {
        const maxTimeout = 4500;
        return new Promise(resolve => {
            const intervalId = setInterval(() => {
                if (networkState.isNetworkAvailable) {
                    this.isServiceAvailable(maxTimeout).then(available => {
                        if (available) {
                            clearInterval(intervalId);
                            resolve();
                        }
                    });
                }
            }, 5000);
        });
    }
    /**
     * Pings server to check whether server is available. Based on ping response network state is modified.
     * @returns {*} a promise that resolved with true, if server responds with valid status.
     * Otherwise, the promise is resolved with false.
     */
    isServiceAvailable(maxTimeout) {
        return this.pingServer(maxTimeout).then(response => {
            networkState.isServiceAvailable = response;
            if (!networkState.isServiceAvailable) {
                networkState.isConnecting = false;
                networkState.isConnected = false;
            }
            return response;
        });
    }
    /**
     * Pings server
     * @returns {*} a promise that resolved with true, if server responds with valid status.
     * Otherwise, the promise is resolved with false.
     * default timeout value is 1min.
     */
    pingServer(maxTimeout = 60000) {
        return new Promise(resolve => {
            const oReq = new XMLHttpRequest();
            let baseURL = this.app.deployedUrl;
            if (baseURL && !_.endsWith(baseURL, '/')) {
                baseURL += '/';
            }
            else {
                baseURL = baseURL || '';
            }
            const timer = setTimeout(() => {
                oReq.abort(); // abort request
                resolve(false);
            }, maxTimeout);
            oReq.addEventListener('load', () => {
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
            oReq.addEventListener('error', () => resolve(false));
            oReq.open('GET', baseURL + 'services/application/wmProperties.js?t=' + Date.now());
            oReq.send();
        });
    }
    setAutoConnect(flag) {
        this._autoConnect = flag;
        localStorage.setItem(AUTO_CONNECT_KEY, '' + flag);
    }
    /**
     * Tries to connect to remote server. Network State will be changed based on the success of connection
     * operation and emits an event notifying the network state change.
     *
     * @param silentMode {boolean} if true and connection is successful, then no event is emitted. Otherwise,
     * events are emitted for network status change.
     * @returns {*} a promise
     */
    tryToConnect(silentMode = false) {
        return new Promise((resolve, reject) => {
            this.isServiceAvailable(5000).then(() => {
                if (networkState.isServiceAvailable && this._autoConnect) {
                    networkState.isConnecting = true;
                    if (!silentMode) {
                        this.checkForNetworkStateChange();
                    }
                    setTimeout(() => {
                        networkState.isConnecting = false;
                        networkState.isConnected = true;
                        localStorage.setItem(IS_CONNECTED_KEY, '' + true);
                        if (!silentMode) {
                            this.checkForNetworkStateChange();
                        }
                        resolve(true);
                    }, silentMode ? 0 : 5000);
                }
                else {
                    networkState.isConnecting = false;
                    networkState.isConnected = false;
                    localStorage.setItem(IS_CONNECTED_KEY, '' + false);
                    reject();
                    this.checkForNetworkStateChange();
                }
            });
        });
    }
    tryToDisconnect() {
        networkState.isConnected = false;
        networkState.isConnecting = false;
        this.checkForNetworkStateChange();
        localStorage.setItem(IS_CONNECTED_KEY, '' + networkState.isConnected);
        return Promise.resolve(networkState.isConnected);
    }
}
NetworkService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
NetworkService.ctorParameters = () => [
    { type: HttpClient },
    { type: App },
    { type: Network }
];
NetworkService.ngInjectableDef = i0.defineInjectable({ factory: function NetworkService_Factory() { return new NetworkService(i0.inject(i1.HttpClient), i0.inject(i2.App), i0.inject(i3.Network)); }, token: NetworkService, providedIn: "root" });
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29yay5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9jb3JlLyIsInNvdXJjZXMiOlsic2VydmljZXMvbmV0d29yay5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRWxELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVoRCxPQUFPLEVBQUUsR0FBRyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsTUFBTSxVQUFVLENBQUM7Ozs7O0FBTXRFLE1BQU0sZ0JBQWdCLEdBQUcsZ0NBQWdDLEVBQ3JELGdCQUFnQixHQUFHLCtCQUErQixFQUNsRCxZQUFZLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQy9DLDBCQUEwQixHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUMxRCwwQkFBMEIsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLElBQUksRUFDMUQsWUFBWSxHQUFHO0lBQ1gsWUFBWSxFQUFHLEtBQUs7SUFDcEIsV0FBVyxFQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxNQUFNO0lBQy9ELGtCQUFrQixFQUFHLElBQUk7SUFDekIsa0JBQWtCLEVBQUcsSUFBSTtDQUM1QixDQUFDO0FBRU47Ozs7O0dBS0c7QUFDSCxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsRUFBRTtJQUNuQixJQUFJLEtBQUssR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbkUsSUFBSSxLQUFLLEVBQUU7UUFDUCxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksRUFB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QztJQUNQLENBQUM7SUFFTyxlQUFlO1FBQ25CLFlBQVksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ2pDLFlBQVksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ2xDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1FBQ2xDLFlBQVksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN0RSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3JELENBQUM7OztZQXJUSixVQUFVLFNBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFOzs7O1lBL0N6QixVQUFVO1lBSVYsR0FBRztZQUZILE9BQU8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQgeyBOZXR3b3JrIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9uZXR3b3JrJztcblxuaW1wb3J0IHsgQXBwLCBnZXRBYm9ydGFibGVEZWZlciwgbm9vcCwgcmV0cnlJZkZhaWxzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBJRGV2aWNlU3RhcnRVcFNlcnZpY2UgfSBmcm9tICcuL2RldmljZS1zdGFydC11cC1zZXJ2aWNlJztcblxuZGVjbGFyZSBjb25zdCBfLCBjb3Jkb3ZhLCBDb25uZWN0aW9uLCBuYXZpZ2F0b3I7XG5cbmNvbnN0IEFVVE9fQ09OTkVDVF9LRVkgPSAnV00uTmV0d29ya1NlcnZpY2UuX2F1dG9Db25uZWN0JyxcbiAgICBJU19DT05ORUNURURfS0VZID0gJ1dNLk5ldHdvcmtTZXJ2aWNlLmlzQ29ubmVjdGVkJyxcbiAgICBleGNsdWRlZExpc3QgPSBbbmV3IFJlZ0V4cCgnL3dtUHJvcGVydGllcy5qcycpXSxcbiAgICBvcmlnaW5hbFhNTEh0dHBSZXF1ZXN0T3BlbiA9IFhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5vcGVuLFxuICAgIG9yaWdpbmFsWE1MSHR0cFJlcXVlc3RTZW5kID0gWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmQsXG4gICAgbmV0d29ya1N0YXRlID0ge1xuICAgICAgICBpc0Nvbm5lY3RpbmcgOiBmYWxzZSxcbiAgICAgICAgaXNDb25uZWN0ZWQgOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShJU19DT05ORUNURURfS0VZKSA9PT0gJ3RydWUnLFxuICAgICAgICBpc05ldHdvcmtBdmFpbGFibGUgOiB0cnVlLFxuICAgICAgICBpc1NlcnZpY2VBdmFpbGFibGUgOiB0cnVlXG4gICAgfTtcblxuLyoqXG4gKiBJZiBzZXJ2ZXIgaXMgbm90IGNvbm5lY3RlZCBhbmQgdXJsIGRvZXMgbm90IG1hdGNoIHRoZSB1bmJsb2NrIGxpc3Qgb2YgcmVndWxhciBleHByZXNzaW9ucyxcbiAqIHRoZW4gdGhpcyBmdW5jdGlvbiByZXR1cm4gdHJ1ZS4gT3RoZXJ3aXNlLCByZXR1cm4gZmFsc2UuXG4gKiBAcGFyYW0gdXJsXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgYmxvY2tVcmwgPSB1cmwgPT4ge1xuICAgIGxldCBibG9jayA9ICFuZXR3b3JrU3RhdGUuaXNDb25uZWN0ZWQgJiYgXy5zdGFydHNXaXRoKHVybCwgJ2h0dHAnKTtcbiAgICBpZiAoYmxvY2spIHtcbiAgICAgICAgYmxvY2sgPSAhXy5maW5kKGV4Y2x1ZGVkTGlzdCwgcmVnRXhwID0+IHJlZ0V4cC50ZXN0KHVybCkpO1xuICAgIH1cbiAgICByZXR1cm4gYmxvY2s7XG59O1xuXG4vLyBJbnRlcmNlcHQgYWxsIFhIUiBjYWxsc1xuWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAobWV0aG9kOiBzdHJpbmcsIHVybDogc3RyaW5nLCBhc3luYzogYm9vbGVhbiA9IHRydWUsIHVzZXI/OiBzdHJpbmcsIHBhc3N3b3JkPzogc3RyaW5nKSB7XG4gICAgaWYgKGJsb2NrVXJsKHVybCkpIHtcbiAgICAgICAgY29uc3QgdXJsU3BsaXRzID0gdXJsLnNwbGl0KCc6Ly8nKTtcbiAgICAgICAgY29uc3QgcGF0aEluZGV4ID0gdXJsU3BsaXRzWzFdLmluZGV4T2YoJy8nKTtcbiAgICAgICAgdXJsU3BsaXRzWzFdID0gJ2xvY2FsaG9zdCcgKyAocGF0aEluZGV4ID4gMCA/IHVybFNwbGl0c1sxXS5zdWJzdHIocGF0aEluZGV4KSA6ICcvJyk7XG4gICAgICAgIHVybCA9IHVybFNwbGl0cy5qb2luKCc6Ly8nKTtcbiAgICB9XG4gICAgcmV0dXJuIG9yaWdpbmFsWE1MSHR0cFJlcXVlc3RPcGVuLmFwcGx5KHRoaXMsIFttZXRob2QsIHVybCwgYXN5bmMsIHVzZXIsIHBhc3N3b3JkXSk7XG59O1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIE5ldHdvcmtTZXJ2aWNlIGltcGxlbWVudHMgSURldmljZVN0YXJ0VXBTZXJ2aWNlIHtcblxuICAgIHB1YmxpYyBzZXJ2aWNlTmFtZSA9IE5ldHdvcmtTZXJ2aWNlLm5hbWU7XG5cbiAgICBwcml2YXRlIF9hdXRvQ29ubmVjdCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKEFVVE9fQ09OTkVDVF9LRVkpICE9PSAnZmFsc2UnO1xuICAgIHByaXZhdGUgX2xhc3RLbm93bk5ldHdvcmtTdGF0ZTogYW55O1xuICAgIHByaXZhdGUgX2lzQ2hlY2tpbmdTZXJ2ZXIgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cENsaWVudDogSHR0cENsaWVudCwgcHJpdmF0ZSBhcHA6IEFwcCwgcHJpdmF0ZSBuZXR3b3JrOiBOZXR3b3JrKSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgYXR0ZW1wdHMgdG8gY29ubmVjdCBhcHAgdG8gdGhlIHNlcnZlciBhbmQgcmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIHdpdGhcbiAgICAgKiBhIGJvb2xlYW4gdmFsdWUgYmFzZWQgb24gdGhlIG9wZXJhdGlvbiByZXN1bHQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBwcm9taXNlXG4gICAgICovXG4gICAgcHVibGljIGNvbm5lY3QoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHRoaXMuc2V0QXV0b0Nvbm5lY3QodHJ1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLnRyeVRvQ29ubmVjdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZW4gdGhlIGF1dG8gY29ubmVjdCBpcyBlbmFibGVkLCB0aGVuIGFwcCBpcyBhdXRvbWF0aWNhbGx5IGNvbm5lY3RlZCAgd2hlbmV2ZXIgc2VydmVyIGlzIGF2YWlsYWJsZS5cbiAgICAgKiBFdmVyeSB0aW1lIHdoZW4gYXBwIGdvZXMgb2ZmbGluZSwgYXV0byBjb25uZWN0IGlzIGVuYWJsZWQuIEJlZm9yZSBhcHAgY29taW5nIHRvIG9ubGluZSwgb25lIGNhbiBkaXNhYmxlXG4gICAgICogdGhlIGF1dG8gY29ubmVjdGlvbiBmbG93IHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgICAqL1xuICAgIHB1YmxpYyBkaXNhYmxlQXV0b0Nvbm5lY3QgPSAoKSA9PiB0aGlzLnNldEF1dG9Db25uZWN0KGZhbHNlKTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGRpc2Nvbm5lY3RzIHRoZSBhcHAgZnJvbSB0aGUgc2VydmVyIGFuZCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgd2l0aFxuICAgICAqIGEgYm9vbGVhbiB2YWx1ZSBiYXNlZCBvbiB0aGUgb3BlcmF0aW9uIHJlc3VsdC4gVXNlIGNvbm5lY3QgbWV0aG9kIHRvIHJlY29ubmVjdC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHByb21pc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgZGlzY29ubmVjdCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgY29uc3QgcCA9IHRoaXMudHJ5VG9EaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMuZGlzYWJsZUF1dG9Db25uZWN0KCk7XG4gICAgICAgIHJldHVybiBwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIHBpbmdTZXJ2ZXIgaXMgdHJ1ZSwgdGhlbiBpdCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCBib29sZWFuIGJhc2VkIG9uIHNlcnZpY2UgYXZhaWxhYmlsaXR5XG4gICAgICogY2hlY2suSWYgcGluZ1NlcnZlciBpcyBmYWxzZSwgcmV0dXJucyBhIGJvb2xlYW4gdmFsdWUgYmFzZWQgb24gdGhlIGxhc3Qga25vd24gc2VydmljZSBhdmFpbGFiaWxpdHkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gaWYgcGluZ1NlcnZlciBpcyB0cnVlLCB0aGVuIGEgcHJvbWlzZSBpcyByZXR1cm5lZC4gT3RoZXJ3aXNlLCBhIGJvb2xlYW4gdmFsdWUuXG4gICAgICovXG4gICAgcHVibGljIGlzQXZhaWxhYmxlKHBpbmdTZXJ2ZXIgPSBmYWxzZSk6IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgaWYgKHBpbmdTZXJ2ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlzU2VydmljZUF2YWlsYWJsZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tGb3JOZXR3b3JrU3RhdGVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV0d29ya1N0YXRlLmlzU2VydmljZUF2YWlsYWJsZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXR3b3JrU3RhdGUuaXNTZXJ2aWNlQXZhaWxhYmxlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSwgaWYgYXBwIGlzIGNvbm5lY3RlZCB0byBzZXJ2ZXIuIE90aGVyd2lzZSwgcmV0dXJucyBmYWxzZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIHRydWUsIGlmIGFwcCBpcyBjb25uZWN0ZWQgdG8gc2VydmVyLiBPdGhlcndpc2UsIHJldHVybnMgZmFsc2UuXG4gICAgICovXG4gICAgcHVibGljIGlzQ29ubmVjdGVkID0gKCkgPT4ge1xuICAgICAgICAvLyBjaGVja2luZyBmb3IgY29ubmVjdGlvbiB0eXBlLlxuICAgICAgICBpZiAoXy5nZXQobmF2aWdhdG9yLCAnY29ubmVjdGlvbicpICYmIG5hdmlnYXRvci5jb25uZWN0aW9uLnR5cGUpIHtcbiAgICAgICAgICAgIG5ldHdvcmtTdGF0ZS5pc0Nvbm5lY3RlZCA9IG5ldHdvcmtTdGF0ZS5pc0Nvbm5lY3RlZCAmJiAobmF2aWdhdG9yLmNvbm5lY3Rpb24udHlwZSAhPT0gJ25vbmUnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoZWNrRm9yTmV0d29ya1N0YXRlQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiBuZXR3b3JrU3RhdGUuaXNDb25uZWN0ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIGFwcCBpcyB0cnlpbmcgdG8gY29ubmVjdCB0byBzZXJ2ZXIuIE90aGVyd2lzZSwgcmV0dXJucyBmYWxzZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIHRydWUgaWYgYXBwIGlzIHRyeWluZyB0byBjb25uZWN0IHRvIHNlcnZlci4gT3RoZXJ3aXNlLCByZXR1cm5zIGZhbHNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBpc0Nvbm5lY3RpbmcgPSAoKSA9PiBuZXR3b3JrU3RhdGUuaXNDb25uZWN0aW5nO1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIGNvbm5lY3Rpb24gaXMgZXN0YWJsaXNoZWQgd2l0aCBzZXJ2ZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBwcm9taXNlIGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggdGhlIHJldHVybmVkIG9iamVjdCBvZiBmblxuICAgICAqL1xuICAgIHB1YmxpYyBvbkNvbm5lY3QoKSB7XG4gICAgICAgIGxldCBkZWZlcixcbiAgICAgICAgICAgIGNhbmNlbFN1YnNjcmlwdGlvbjtcbiAgICAgICAgaWYgKHRoaXMuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGRlZmVyID0gZ2V0QWJvcnRhYmxlRGVmZXIoKTtcbiAgICAgICAgY2FuY2VsU3Vic2NyaXB0aW9uID0gdGhpcy5hcHAuc3Vic2NyaWJlKCdvbk5ldHdvcmtTdGF0ZUNoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgIGNhbmNlbFN1YnNjcmlwdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZGVmZXIucHJvbWlzZS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYW5jZWxTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYSB1dGlsIG1ldGhvZC4gSWYgZm4gY2Fubm90IGV4ZWN1dGUgc3VjY2Vzc2Z1bGx5IGFuZCBuZXR3b3JrIGxvc3QgY29ubmVjdGlvbiwgdGhlbiB0aGUgZm4gd2lsbFxuICAgICAqIGJlIGludm9rZWQgd2hlbiBuZXR3b3JrIGlzIGJhY2suIFRoZSByZXR1cm5lZCBjYW4gYWxzbyBiZSBhYm9ydGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBmbiBtZXRob2QgdG8gaW52b2tlLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHByb21pc2UgYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgcmV0dXJuZWQgb2JqZWN0IG9mIGZuXG4gICAgICovXG4gICAgcHVibGljIHJldHJ5SWZOZXR3b3JrRmFpbHMoZm4pIHtcbiAgICAgICAgY29uc3QgZGVmZXIgPSBnZXRBYm9ydGFibGVEZWZlcigpO1xuICAgICAgICByZXRyeUlmRmFpbHMoZm4sIDAsIDAsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBvbkNvbm5lY3RQcm9taXNlO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgICAgICBvbkNvbm5lY3RQcm9taXNlID0gdGhpcy5vbkNvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICBkZWZlci5wcm9taXNlLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgb25Db25uZWN0UHJvbWlzZS5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBvbkNvbm5lY3RQcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KS50aGVuKGRlZmVyLnJlc29sdmUsIGRlZmVyLnJlamVjdCk7XG4gICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGFydCgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBpZiAod2luZG93Wydjb3Jkb3ZhJ10pIHtcbiAgICAgICAgICAgIC8vIENvbm5lY3Rpb24gY29uc3RhbnQgd2lsbCBiZSBhdmFpbGFibGUgb25seSB3aGVuIG5ldHdvcmsgcGx1Z2luIGlzIGluY2x1ZGVkLlxuICAgICAgICAgICAgaWYgKHdpbmRvd1snQ29ubmVjdGlvbiddICYmIG5hdmlnYXRvci5jb25uZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgbmV0d29ya1N0YXRlLmlzTmV0d29ya0F2YWlsYWJsZSA9IG5hdmlnYXRvci5jb25uZWN0aW9uLnR5cGUgIT09ICdub25lJztcbiAgICAgICAgICAgICAgICBuZXR3b3JrU3RhdGUuaXNDb25uZWN0ZWQgPSBuZXR3b3JrU3RhdGUuaXNOZXR3b3JrQXZhaWxhYmxlICYmIG5ldHdvcmtTdGF0ZS5pc0Nvbm5lY3RlZDtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAqIFdoZW4gdGhlIGRldmljZSBjb21lcyBvbmxpbmUsIGNoZWNrIGlzIHRoZSBzZXJ2aWNlIGlzIGF2YWlsYWJsZS4gSWYgdGhlIHNlcnZpY2UgaXMgYXZhaWxhYmxlIGFuZCBhdXRvXG4gICAgICAgICAgICAgICAgICogY29ubmVjdCBmbGFnIGlzIHRydWUsIHRoZW4gYXBwIGlzIGF1dG9tYXRpY2FsbHkgY29ubmVjdGVkIHRvIHJlbW90ZSBzZXJ2ZXIuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy5uZXR3b3JrLm9uQ29ubmVjdCgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5ldHdvcmtTdGF0ZS5pc05ldHdvcmtBdmFpbGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyeVRvQ29ubmVjdCgpLmNhdGNoKG5vb3ApO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgKldoZW4gZGV2aWNlIGdvZXMgb2ZmbGluZSwgdGhlbiBjaGFuZ2UgdGhlIG5ldHdvcmsgc3RhdGUgYW5kIGVtaXQgdGhhdCBub3RpZmllcyBhYm91dCBuZXR3b3JrIHN0YXRlIGNoYW5nZS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLm5ldHdvcmsub25EaXNjb25uZWN0KCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbmV0d29ya1N0YXRlLmlzTmV0d29ya0F2YWlsYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBuZXR3b3JrU3RhdGUuaXNTZXJ2aWNlQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJ5VG9EaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFwcC5zdWJzY3JpYmUoJ29uTmV0d29ya1N0YXRlQ2hhbmdlJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIElmIG5ldHdvcmsgaXMgYXZhaWxhYmxlIGFuZCBzZXJ2ZXIgaXMgbm90IGF2YWlsYWJsZSx0aGVuXG4gICAgICAgICAgICAgICAgICAgICAqIHRyeSB0byBjb25uZWN0IHdoZW4gc2VydmVyIGlzIGF2YWlsYWJsZS5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmlzTmV0d29ya0F2YWlsYWJsZSAmJiAhZGF0YS5pc1NlcnZpY2VBdmFpbGFibGUgJiYgIXRoaXMuX2lzQ2hlY2tpbmdTZXJ2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzQ2hlY2tpbmdTZXJ2ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja0ZvclNlcnZpY2VBdmFpbGlibGl0eSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzQ2hlY2tpbmdTZXJ2ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc0NoZWNraW5nU2VydmVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIHRvIHNldCB0aGUgZGVmYXVsdCBuL3cgY29ubmVjdGlvbiB2YWx1ZXMuXG4gICAgICAgIHJldHVybiB0aGlzLnRyeVRvQ29ubmVjdCh0cnVlKS5jYXRjaChub29wKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byB0aGUgdW5ibG9ja0xpc3QuIEV2ZW4gYXBwIGlzIGluIG9mZmxpbmUgbW9kZSxcbiAgICAgKiB0aGUgdXJscyBtYXRjaGluZyB3aXRoIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24gYXJlIG5vdCBibG9ja2VkIGJ5IE5ldHdvcmtTZXJ2aWNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybFJlZ2V4IHJlZ3VsYXIgZXhwcmVzc2lvblxuICAgICAqL1xuICAgIHB1YmxpYyB1bmJsb2NrKHVybFJlZ2V4OiBzdHJpbmcpIHtcbiAgICAgICAgZXhjbHVkZWRMaXN0LnB1c2gobmV3IFJlZ0V4cCh1cmxSZWdleCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tGb3JOZXR3b3JrU3RhdGVDaGFuZ2UoKSB7XG4gICAgICAgIGlmICghXy5pc0VxdWFsKHRoaXMuX2xhc3RLbm93bk5ldHdvcmtTdGF0ZSwgbmV0d29ya1N0YXRlKSkge1xuICAgICAgICAgICAgdGhpcy5fbGFzdEtub3duTmV0d29ya1N0YXRlID0gXy5jbG9uZShuZXR3b3JrU3RhdGUpO1xuICAgICAgICAgICAgdGhpcy5hcHAubm90aWZ5KCdvbk5ldHdvcmtTdGF0ZUNoYW5nZScsIHRoaXMuX2xhc3RLbm93bk5ldHdvcmtTdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gc2VydmVyIGlzIGF2YWlsYWJsZS5cbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBwcml2YXRlIGNoZWNrRm9yU2VydmljZUF2YWlsaWJsaXR5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBtYXhUaW1lb3V0ID0gNDUwMDtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobmV0d29ya1N0YXRlLmlzTmV0d29ya0F2YWlsYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2VydmljZUF2YWlsYWJsZShtYXhUaW1lb3V0KS50aGVuKGF2YWlsYWJsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXZhaWxhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQaW5ncyBzZXJ2ZXIgdG8gY2hlY2sgd2hldGhlciBzZXJ2ZXIgaXMgYXZhaWxhYmxlLiBCYXNlZCBvbiBwaW5nIHJlc3BvbnNlIG5ldHdvcmsgc3RhdGUgaXMgbW9kaWZpZWQuXG4gICAgICogQHJldHVybnMgeyp9IGEgcHJvbWlzZSB0aGF0IHJlc29sdmVkIHdpdGggdHJ1ZSwgaWYgc2VydmVyIHJlc3BvbmRzIHdpdGggdmFsaWQgc3RhdHVzLlxuICAgICAqIE90aGVyd2lzZSwgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCBmYWxzZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGlzU2VydmljZUF2YWlsYWJsZShtYXhUaW1lb3V0PzogbnVtYmVyKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnBpbmdTZXJ2ZXIobWF4VGltZW91dCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBuZXR3b3JrU3RhdGUuaXNTZXJ2aWNlQXZhaWxhYmxlID0gcmVzcG9uc2U7XG4gICAgICAgICAgICBpZiAoIW5ldHdvcmtTdGF0ZS5pc1NlcnZpY2VBdmFpbGFibGUpIHtcbiAgICAgICAgICAgICAgICBuZXR3b3JrU3RhdGUuaXNDb25uZWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbmV0d29ya1N0YXRlLmlzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBpbmdzIHNlcnZlclxuICAgICAqIEByZXR1cm5zIHsqfSBhIHByb21pc2UgdGhhdCByZXNvbHZlZCB3aXRoIHRydWUsIGlmIHNlcnZlciByZXNwb25kcyB3aXRoIHZhbGlkIHN0YXR1cy5cbiAgICAgKiBPdGhlcndpc2UsIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggZmFsc2UuXG4gICAgICogZGVmYXVsdCB0aW1lb3V0IHZhbHVlIGlzIDFtaW4uXG4gICAgICovXG4gICAgcHJpdmF0ZSBwaW5nU2VydmVyKG1heFRpbWVvdXQgPSA2MDAwMCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4ocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvUmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICBsZXQgYmFzZVVSTCA9IHRoaXMuYXBwLmRlcGxveWVkVXJsO1xuICAgICAgICAgICAgaWYgKGJhc2VVUkwgJiYgIV8uZW5kc1dpdGgoYmFzZVVSTCwgJy8nKSkge1xuICAgICAgICAgICAgICAgIGJhc2VVUkwgKz0gJy8nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlVVJMID0gYmFzZVVSTCB8fCAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBvUmVxLmFib3J0KCk7IC8vIGFib3J0IHJlcXVlc3RcbiAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgIH0sIG1heFRpbWVvdXQpO1xuXG4gICAgICAgICAgICBvUmVxLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG9SZXEuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG9SZXEuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoKSA9PiByZXNvbHZlKGZhbHNlKSk7XG4gICAgICAgICAgICBvUmVxLm9wZW4oJ0dFVCcsIGJhc2VVUkwgKyAnc2VydmljZXMvYXBwbGljYXRpb24vd21Qcm9wZXJ0aWVzLmpzP3Q9JyArIERhdGUubm93KCkpO1xuICAgICAgICAgICAgb1JlcS5zZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0QXV0b0Nvbm5lY3QoZmxhZzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICB0aGlzLl9hdXRvQ29ubmVjdCA9IGZsYWc7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKEFVVE9fQ09OTkVDVF9LRVksICcnICsgZmxhZyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpZXMgdG8gY29ubmVjdCB0byByZW1vdGUgc2VydmVyLiBOZXR3b3JrIFN0YXRlIHdpbGwgYmUgY2hhbmdlZCBiYXNlZCBvbiB0aGUgc3VjY2VzcyBvZiBjb25uZWN0aW9uXG4gICAgICogb3BlcmF0aW9uIGFuZCBlbWl0cyBhbiBldmVudCBub3RpZnlpbmcgdGhlIG5ldHdvcmsgc3RhdGUgY2hhbmdlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHNpbGVudE1vZGUge2Jvb2xlYW59IGlmIHRydWUgYW5kIGNvbm5lY3Rpb24gaXMgc3VjY2Vzc2Z1bCwgdGhlbiBubyBldmVudCBpcyBlbWl0dGVkLiBPdGhlcndpc2UsXG4gICAgICogZXZlbnRzIGFyZSBlbWl0dGVkIGZvciBuZXR3b3JrIHN0YXR1cyBjaGFuZ2UuXG4gICAgICogQHJldHVybnMgeyp9IGEgcHJvbWlzZVxuICAgICAqL1xuICAgIHByaXZhdGUgdHJ5VG9Db25uZWN0KHNpbGVudE1vZGUgPSBmYWxzZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc1NlcnZpY2VBdmFpbGFibGUoNTAwMCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG5ldHdvcmtTdGF0ZS5pc1NlcnZpY2VBdmFpbGFibGUgJiYgdGhpcy5fYXV0b0Nvbm5lY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV0d29ya1N0YXRlLmlzQ29ubmVjdGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc2lsZW50TW9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja0Zvck5ldHdvcmtTdGF0ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV0d29ya1N0YXRlLmlzQ29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV0d29ya1N0YXRlLmlzQ29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKElTX0NPTk5FQ1RFRF9LRVksICcnICsgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNpbGVudE1vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrRm9yTmV0d29ya1N0YXRlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9LCBzaWxlbnRNb2RlID8gMCA6IDUwMDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5ldHdvcmtTdGF0ZS5pc0Nvbm5lY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgbmV0d29ya1N0YXRlLmlzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKElTX0NPTk5FQ1RFRF9LRVksICcnICsgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja0Zvck5ldHdvcmtTdGF0ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHRyeVRvRGlzY29ubmVjdCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgbmV0d29ya1N0YXRlLmlzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgIG5ldHdvcmtTdGF0ZS5pc0Nvbm5lY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jaGVja0Zvck5ldHdvcmtTdGF0ZUNoYW5nZSgpO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShJU19DT05ORUNURURfS0VZLCAnJyArIG5ldHdvcmtTdGF0ZS5pc0Nvbm5lY3RlZCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV0d29ya1N0YXRlLmlzQ29ubmVjdGVkKTtcbiAgICB9XG59XG4iXX0=