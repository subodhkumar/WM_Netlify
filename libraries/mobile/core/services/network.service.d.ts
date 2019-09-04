import { HttpClient } from '@angular/common/http';
import { Network } from '@ionic-native/network';
import { App } from '@wm/core';
import { IDeviceStartUpService } from './device-start-up-service';
export declare class NetworkService implements IDeviceStartUpService {
    private httpClient;
    private app;
    private network;
    serviceName: string;
    private _autoConnect;
    private _lastKnownNetworkState;
    private _isCheckingServer;
    constructor(httpClient: HttpClient, app: App, network: Network);
    /**
     * This method attempts to connect app to the server and returns a promise that will be resolved with
     * a boolean value based on the operation result.
     *
     * @returns {object} promise
     */
    connect(): Promise<boolean>;
    /**
     * When the auto connect is enabled, then app is automatically connected  whenever server is available.
     * Every time when app goes offline, auto connect is enabled. Before app coming to online, one can disable
     * the auto connection flow using this method.
     */
    disableAutoConnect: () => void;
    /**
     * This method disconnects the app from the server and returns a promise that will be resolved with
     * a boolean value based on the operation result. Use connect method to reconnect.
     *
     * @returns {object} promise
     */
    disconnect(): Promise<boolean>;
    /**
     * If pingServer is true, then it returns a promise that will be resolved with boolean based on service availability
     * check.If pingServer is false, returns a boolean value based on the last known service availability.
     *
     * @returns {boolean} if pingServer is true, then a promise is returned. Otherwise, a boolean value.
     */
    isAvailable(pingServer?: boolean): boolean | Promise<boolean>;
    /**
     * Returns true, if app is connected to server. Otherwise, returns false.
     *
     * @returns {boolean} Returns true, if app is connected to server. Otherwise, returns false.
     */
    isConnected: () => boolean;
    /**
     * Returns true if app is trying to connect to server. Otherwise, returns false.
     *
     * @returns {boolean} Returns true if app is trying to connect to server. Otherwise, returns false.
     */
    isConnecting: () => boolean;
    /**
     * This method returns a promise that is resolved when connection is established with server.
     *
     * @returns {object} promise a promise that is resolved with the returned object of fn
     */
    onConnect(): any;
    /**
     * This is a util method. If fn cannot execute successfully and network lost connection, then the fn will
     * be invoked when network is back. The returned can also be aborted.
     *
     * @param {function()} fn method to invoke.
     * @returns {object} promise a promise that is resolved with the returned object of fn
     */
    retryIfNetworkFails(fn: any): any;
    start(): Promise<any>;
    /**
     * This function adds the given regular expression to the unblockList. Even app is in offline mode,
     * the urls matching with the given regular expression are not blocked by NetworkService.
     *
     * @param {string} urlRegex regular expression
     */
    unblock(urlRegex: string): void;
    private checkForNetworkStateChange;
    /**
     * Returns a promise that is resolved when server is available.
     * @returns {*}
     */
    private checkForServiceAvailiblity;
    /**
     * Pings server to check whether server is available. Based on ping response network state is modified.
     * @returns {*} a promise that resolved with true, if server responds with valid status.
     * Otherwise, the promise is resolved with false.
     */
    private isServiceAvailable;
    /**
     * Pings server
     * @returns {*} a promise that resolved with true, if server responds with valid status.
     * Otherwise, the promise is resolved with false.
     * default timeout value is 1min.
     */
    private pingServer;
    private setAutoConnect;
    /**
     * Tries to connect to remote server. Network State will be changed based on the success of connection
     * operation and emits an event notifying the network state change.
     *
     * @param silentMode {boolean} if true and connection is successful, then no event is emitted. Otherwise,
     * events are emitted for network status change.
     * @returns {*} a promise
     */
    private tryToConnect;
    private tryToDisconnect;
}
