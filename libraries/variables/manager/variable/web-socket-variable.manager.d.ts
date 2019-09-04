import { BaseVariableManager } from './base-variable.manager';
import { WebSocketVariable } from '../../model/variable/web-socket-variable';
export declare class WebSocketVariableManager extends BaseVariableManager {
    scope_var_socket_map: Map<any, any>;
    PROPERTY: {
        'SERVICE': string;
        'DATA_UPDATE_STRATEGY': string;
        'DATA_LIMIT': string;
    };
    DATA_UPDATE_STRATEGY: {
        'REFRESH': string;
        'PREPEND': string;
        'APPEND': string;
    };
    /**
     * returns the state of property to decide weather to append new messages to dataSet or not
     * @param variable
     * @returns boolean
     */
    private shouldAppendData;
    /**
     * returns the state of property to decide weather to APPEND or PREPEND new messages to dataSet
     * @param variable
     * @returns boolean
     */
    private shouldAppendLast;
    /**
     * returns upper limit on number of records to be in dataSet
     * this is applicable only when appendData is true
     * @param variable
     * @returns {dataLimit}
     */
    private getDataLimit;
    /**
     * get url from wmServiceOperationInfo
     * @param variable
     * @returns {*}
     */
    private getURL;
    /**
     * handler for onMessage event on a socket connection for a variable
     * the data returned is converted to JSON from string/xml and assigned to dataSet of variable
     * If not able to do so, message is simply assigned to the dataSet of variable
     * If appendData property is set, the message is appended to the dataSet, else it replaces the existing value of dataSet
     * @param variable
     * @param evt
     * @private
     */
    private _onSocketMessage;
    /**
     * calls the ON_BEFORE_SEND callback on the variable
     * @param variable
     * @param message
     * @returns {*}
     * @private
     */
    private _onBeforeSend;
    /**
     * calls the ON_BEFORE_CLOSE callback assigned to the variable
     * @param variable
     * @param evt
     * @returns {*}
     * @private
     */
    private _onBeforeSocketClose;
    /**
     * calls the ON_BEFORE_OPEN callback assigned
     * called just before the connection is open
     * @param variable
     * @param evt
     * @returns {*}
     * @private
     */
    private _onBeforeSocketOpen;
    /**
     * calls the ON_OPEN event on the variable
     * this is called once the connection is established by the variable with the target WebSocket service
     * @param variable
     * @param evt
     * @private
     */
    private _onSocketOpen;
    /**
     * clears the socket variable against the variable in a scope
     * @param variable
     */
    private freeSocket;
    /**
     * calls the ON_CLOSE event on the variable
     * this is called on close of an existing connection on a variable
     * @param variable
     * @param evt
     * @private
     */
    private _onSocketClose;
    /**
     * calls the ON_ERROR event on the variable
     * this is called if an error occurs while connecting to the socket service
     * @param variable
     * @param evt
     * @private
     */
    private _onSocketError;
    /**
     * returns an existing socket connection on the variable
     * if not present, make the connection and return it
     * @param variable
     * @returns {*}
     */
    private getSocket;
    /**
     * opens a socket connection on the variable.
     * URL & other meta data is fetched from wmServiceOperationInfo
     * @returns {*}
     */
    open(variable: WebSocketVariable, success?: any, error?: any): any;
    /**
     * closes an existing socket connection on variable
     */
    close(variable: WebSocketVariable): void;
    /**
     * sends a message to the existing socket connection on the variable
     * If socket connection not open yet, open a connections and then send
     * if message provide, it is sent, else the one present in RequestBody param is sent
     * @param message
     */
    send(variable: WebSocketVariable, message?: string): void;
}
