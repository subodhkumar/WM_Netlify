import * as tslib_1 from "tslib";
import { $WebSocket } from 'angular2-websocket/angular2-websocket';
import { getValidJSON, isDefined, isInsecureContentRequest, isObject, triggerFn, xmlToJson } from '@wm/core';
import { BaseVariableManager } from './base-variable.manager';
import { initiateCallback, metadataService } from '../../util/variable/variables.utils';
import { CONSTANTS, VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { ServiceVariableUtils } from '../../util/variable/service-variable.utils';
var WebSocketVariableManager = /** @class */ (function (_super) {
    tslib_1.__extends(WebSocketVariableManager, _super);
    function WebSocketVariableManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.scope_var_socket_map = new Map();
        _this.PROPERTY = {
            'SERVICE': 'service',
            'DATA_UPDATE_STRATEGY': 'dataUpdateStrategy',
            'DATA_LIMIT': 'dataLimit'
        };
        _this.DATA_UPDATE_STRATEGY = {
            'REFRESH': 'refresh',
            'PREPEND': 'prepend',
            'APPEND': 'append'
        };
        return _this;
    }
    /**
     * returns the state of property to decide weather to append new messages to dataSet or not
     * @param variable
     * @returns boolean
     */
    WebSocketVariableManager.prototype.shouldAppendData = function (variable) {
        variable = variable || this;
        return variable[this.PROPERTY.DATA_UPDATE_STRATEGY] !== this.DATA_UPDATE_STRATEGY.REFRESH;
    };
    /**
     * returns the state of property to decide weather to APPEND or PREPEND new messages to dataSet
     * @param variable
     * @returns boolean
     */
    WebSocketVariableManager.prototype.shouldAppendLast = function (variable) {
        return variable[this.PROPERTY.DATA_UPDATE_STRATEGY] === this.DATA_UPDATE_STRATEGY.APPEND;
    };
    /**
     * returns upper limit on number of records to be in dataSet
     * this is applicable only when appendData is true
     * @param variable
     * @returns {dataLimit}
     */
    WebSocketVariableManager.prototype.getDataLimit = function (variable) {
        return variable.dataLimit;
    };
    /**
     * get url from wmServiceOperationInfo
     * @param variable
     * @returns {*}
     */
    WebSocketVariableManager.prototype.getURL = function (variable) {
        var prefabName = variable.getPrefabName();
        var opInfo = prefabName ? _.get(metadataService.getByOperationId(variable.operationId, prefabName), 'wmServiceOperationInfo') : _.get(metadataService.getByOperationId(variable.operationId), 'wmServiceOperationInfo');
        var inputFields = variable.dataBinding;
        var config;
        // add sample values to the params (url and path)
        _.forEach(opInfo.parameters, function (param) {
            param.sampleValue = inputFields[param.name];
        });
        // although, no header params will be present, keeping 'skipCloakHeaders' flag if support provided later
        $.extend(opInfo, {
            skipCloakHeaders: true
        });
        // call common method to prepare config for the service operation info.
        config = ServiceVariableUtils.constructRequestParams(variable, opInfo, inputFields);
        /* if error found, return */
        if (config.error && config.error.message) {
            this._onSocketError(variable, { data: config.error.message });
            return;
        }
        return config.url;
    };
    /**
     * handler for onMessage event on a socket connection for a variable
     * the data returned is converted to JSON from string/xml and assigned to dataSet of variable
     * If not able to do so, message is simply assigned to the dataSet of variable
     * If appendData property is set, the message is appended to the dataSet, else it replaces the existing value of dataSet
     * @param variable
     * @param evt
     * @private
     */
    WebSocketVariableManager.prototype._onSocketMessage = function (variable, evt) {
        var data = _.get(evt, 'data'), value, dataLength, dataLimit, shouldAddToLast, insertIdx;
        data = getValidJSON(data) || xmlToJson(data) || data;
        // EVENT: ON_MESSAGE
        value = initiateCallback(VARIABLE_CONSTANTS.EVENT.MESSAGE_RECEIVE, variable, data, evt);
        data = isDefined(value) ? value : data;
        if (this.shouldAppendData(variable)) {
            variable.dataSet = variable.dataSet || [];
            dataLength = variable.dataSet.length;
            dataLimit = this.getDataLimit(variable);
            shouldAddToLast = this.shouldAppendLast(variable);
            if (dataLimit && (dataLength >= dataLimit)) {
                if (shouldAddToLast) {
                    variable.dataSet.shift();
                }
                else {
                    variable.dataSet.pop();
                }
            }
            insertIdx = shouldAddToLast ? dataLength : 0;
            variable.dataSet.splice(insertIdx, 0, data);
        }
        else {
            variable.dataSet = isDefined(value) ? value : data;
        }
    };
    /**
     * calls the ON_BEFORE_SEND callback on the variable
     * @param variable
     * @param message
     * @returns {*}
     * @private
     */
    WebSocketVariableManager.prototype._onBeforeSend = function (variable, message) {
        // EVENT: ON_BEFORE_SEND
        return initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_SEND, variable, message);
    };
    /**
     * calls the ON_BEFORE_CLOSE callback assigned to the variable
     * @param variable
     * @param evt
     * @returns {*}
     * @private
     */
    WebSocketVariableManager.prototype._onBeforeSocketClose = function (variable, evt) {
        // EVENT: ON_BEFORE_CLOSE
        return initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_CLOSE, variable, _.get(evt, 'data'), evt);
    };
    /**
     * calls the ON_BEFORE_OPEN callback assigned
     * called just before the connection is open
     * @param variable
     * @param evt
     * @returns {*}
     * @private
     */
    WebSocketVariableManager.prototype._onBeforeSocketOpen = function (variable, evt) {
        // EVENT: ON_BEFORE_OPEN
        return initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_OPEN, variable, _.get(evt, 'data'), evt);
    };
    /**
     * calls the ON_OPEN event on the variable
     * this is called once the connection is established by the variable with the target WebSocket service
     * @param variable
     * @param evt
     * @private
     */
    WebSocketVariableManager.prototype._onSocketOpen = function (variable, evt) {
        variable._socketConnected = true;
        // EVENT: ON_OPEN
        initiateCallback(VARIABLE_CONSTANTS.EVENT.OPEN, variable, _.get(evt, 'data'), evt);
    };
    /**
     * clears the socket variable against the variable in a scope
     * @param variable
     */
    WebSocketVariableManager.prototype.freeSocket = function (variable) {
        this.scope_var_socket_map.set(variable, undefined);
    };
    /**
     * calls the ON_CLOSE event on the variable
     * this is called on close of an existing connection on a variable
     * @param variable
     * @param evt
     * @private
     */
    WebSocketVariableManager.prototype._onSocketClose = function (variable, evt) {
        variable._socketConnected = false;
        this.freeSocket(variable);
        // EVENT: ON_CLOSE
        initiateCallback(VARIABLE_CONSTANTS.EVENT.CLOSE, variable, _.get(evt, 'data'), evt);
    };
    /**
     * calls the ON_ERROR event on the variable
     * this is called if an error occurs while connecting to the socket service
     * @param variable
     * @param evt
     * @private
     */
    WebSocketVariableManager.prototype._onSocketError = function (variable, evt) {
        variable._socketConnected = false;
        this.freeSocket(variable);
        // EVENT: ON_ERROR
        initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, _.get(evt, 'data') || 'Error while connecting with ' + variable.service, evt);
    };
    /**
     * returns an existing socket connection on the variable
     * if not present, make the connection and return it
     * @param variable
     * @returns {*}
     */
    WebSocketVariableManager.prototype.getSocket = function (variable) {
        var url = this.getURL(variable);
        var _socket = this.scope_var_socket_map.get(variable);
        if (_socket) {
            return _socket;
        }
        // Trigger error if unsecured webSocket is used in secured domain, ignore in mobile device
        if (!CONSTANTS.hasCordova && isInsecureContentRequest(url)) {
            triggerFn(this._onSocketError.bind(this, variable));
            return;
        }
        _socket = new $WebSocket(url);
        _socket.onOpen(this._onSocketOpen.bind(this, variable));
        _socket.onError(this._onSocketError.bind(this, variable));
        _socket.onMessage(this._onSocketMessage.bind(this, variable));
        _socket.onClose(this._onSocketClose.bind(this, variable));
        this.scope_var_socket_map.set(variable, _socket);
        variable._socket = _socket;
        return _socket;
    };
    /**
     * opens a socket connection on the variable.
     * URL & other meta data is fetched from wmServiceOperationInfo
     * @returns {*}
     */
    WebSocketVariableManager.prototype.open = function (variable, success, error) {
        var shouldOpen = this._onBeforeSocketOpen(variable);
        var socket;
        if (shouldOpen === false) {
            triggerFn(error);
            return;
        }
        socket = this.getSocket(variable);
        triggerFn(success);
        return socket;
    };
    /**
     * closes an existing socket connection on variable
     */
    WebSocketVariableManager.prototype.close = function (variable) {
        var shouldClose = this._onBeforeSocketClose(variable), socket = this.getSocket(variable);
        if (shouldClose === false) {
            return;
        }
        socket.close();
    };
    /**
     * sends a message to the existing socket connection on the variable
     * If socket connection not open yet, open a connections and then send
     * if message provide, it is sent, else the one present in RequestBody param is sent
     * @param message
     */
    WebSocketVariableManager.prototype.send = function (variable, message) {
        var socket = this.getSocket(variable);
        var response;
        message = message || _.get(variable, 'dataBinding.RequestBody');
        response = this._onBeforeSend(variable, message);
        if (response === false) {
            return;
        }
        message = isDefined(response) ? response : message;
        message = isObject(message) ? JSON.stringify(message) : message;
        socket.send(message, 0);
    };
    return WebSocketVariableManager;
}(BaseVariableManager));
export { WebSocketVariableManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLXNvY2tldC12YXJpYWJsZS5tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbIm1hbmFnZXIvdmFyaWFibGUvd2ViLXNvY2tldC12YXJpYWJsZS5tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFbkUsT0FBTyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsd0JBQXdCLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFN0csT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFOUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUNwRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUlsRjtJQUE4QyxvREFBbUI7SUFBakU7UUFBQSxxRUE4UUM7UUE1UUcsMEJBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNqQyxjQUFRLEdBQUc7WUFDUCxTQUFTLEVBQUUsU0FBUztZQUNwQixzQkFBc0IsRUFBRSxvQkFBb0I7WUFDNUMsWUFBWSxFQUFFLFdBQVc7U0FDNUIsQ0FBQztRQUNGLDBCQUFvQixHQUFHO1lBQ25CLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLFFBQVEsRUFBRSxRQUFRO1NBQ3JCLENBQUM7O0lBa1FOLENBQUM7SUFoUUc7Ozs7T0FJRztJQUNLLG1EQUFnQixHQUF4QixVQUF5QixRQUFRO1FBQzdCLFFBQVEsR0FBRyxRQUFRLElBQUksSUFBSSxDQUFDO1FBQzVCLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMs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QUM3QyxJQUFJLFFBQVEsQ0FBQztRQUViLE9BQU8sR0FBRyxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUseUJBQXlCLENBQUMsQ0FBQztRQUNoRSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakQsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFO1lBQ3BCLE9BQU87U0FDVjtRQUNELE9BQU8sR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ25ELE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUNoRSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBQ0wsK0JBQUM7QUFBRCxDQUFDLEFBOVFELENBQThDLG1CQUFtQixHQThRaEUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyAkV2ViU29ja2V0IH0gZnJvbSAnYW5ndWxhcjItd2Vic29ja2V0L2FuZ3VsYXIyLXdlYnNvY2tldCc7XG5cbmltcG9ydCB7IGdldFZhbGlkSlNPTiwgaXNEZWZpbmVkLCBpc0luc2VjdXJlQ29udGVudFJlcXVlc3QsIGlzT2JqZWN0LCB0cmlnZ2VyRm4sIHhtbFRvSnNvbiB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQmFzZVZhcmlhYmxlTWFuYWdlciB9IGZyb20gJy4vYmFzZS12YXJpYWJsZS5tYW5hZ2VyJztcbmltcG9ydCB7IFdlYlNvY2tldFZhcmlhYmxlIH0gZnJvbSAnLi4vLi4vbW9kZWwvdmFyaWFibGUvd2ViLXNvY2tldC12YXJpYWJsZSc7XG5pbXBvcnQgeyBpbml0aWF0ZUNhbGxiYWNrLCBtZXRhZGF0YVNlcnZpY2UgfSBmcm9tICcuLi8uLi91dGlsL3ZhcmlhYmxlL3ZhcmlhYmxlcy51dGlscyc7XG5pbXBvcnQgeyBDT05TVEFOVFMsIFZBUklBQkxFX0NPTlNUQU5UUyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cy92YXJpYWJsZXMuY29uc3RhbnRzJztcbmltcG9ydCB7IFNlcnZpY2VWYXJpYWJsZVV0aWxzIH0gZnJvbSAnLi4vLi4vdXRpbC92YXJpYWJsZS9zZXJ2aWNlLXZhcmlhYmxlLnV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5leHBvcnQgY2xhc3MgV2ViU29ja2V0VmFyaWFibGVNYW5hZ2VyIGV4dGVuZHMgQmFzZVZhcmlhYmxlTWFuYWdlciB7XG5cbiAgICBzY29wZV92YXJfc29ja2V0X21hcCA9IG5ldyBNYXAoKTtcbiAgICBQUk9QRVJUWSA9IHtcbiAgICAgICAgJ1NFUlZJQ0UnOiAnc2VydmljZScsXG4gICAgICAgICdEQVRBX1VQREFURV9TVFJBVEVHWSc6ICdkYXRhVXBkYXRlU3RyYXRlZ3knLFxuICAgICAgICAnREFUQV9MSU1JVCc6ICdkYXRhTGltaXQnXG4gICAgfTtcbiAgICBEQVRBX1VQREFURV9TVFJBVEVHWSA9IHtcbiAgICAgICAgJ1JFRlJFU0gnOiAncmVmcmVzaCcsXG4gICAgICAgICdQUkVQRU5EJzogJ3ByZXBlbmQnLFxuICAgICAgICAnQVBQRU5EJzogJ2FwcGVuZCdcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyB0aGUgc3RhdGUgb2YgcHJvcGVydHkgdG8gZGVjaWRlIHdlYXRoZXIgdG8gYXBwZW5kIG5ldyBtZXNzYWdlcyB0byBkYXRhU2V0IG9yIG5vdFxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICAgKi9cbiAgICBwcml2YXRlIHNob3VsZEFwcGVuZERhdGEodmFyaWFibGUpIHtcbiAgICAgICAgdmFyaWFibGUgPSB2YXJpYWJsZSB8fCB0aGlzO1xuICAgICAgICByZXR1cm4gdmFyaWFibGVbdGhpcy5QUk9QRVJUWS5EQVRBX1VQREFURV9TVFJBVEVHWV0gIT09IHRoaXMuREFUQV9VUERBVEVfU1RSQVRFR1kuUkVGUkVTSDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIHRoZSBzdGF0ZSBvZiBwcm9wZXJ0eSB0byBkZWNpZGUgd2VhdGhlciB0byBBUFBFTkQgb3IgUFJFUEVORCBuZXcgbWVzc2FnZXMgdG8gZGF0YVNldFxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICAgKi9cbiAgICBwcml2YXRlIHNob3VsZEFwcGVuZExhc3QodmFyaWFibGUpIHtcbiAgICAgICAgcmV0dXJuIHZhcmlhYmxlW3RoaXMuUFJPUEVSVFkuREFUQV9VUERBVEVfU1RSQVRFR1ldID09PSB0aGlzLkRBVEFfVVBEQVRFX1NUUkFURUdZLkFQUEVORDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIHVwcGVyIGxpbWl0IG9uIG51bWJlciBvZiByZWNvcmRzIHRvIGJlIGluIGRhdGFTZXRcbiAgICAgKiB0aGlzIGlzIGFwcGxpY2FibGUgb25seSB3aGVuIGFwcGVuZERhdGEgaXMgdHJ1ZVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEByZXR1cm5zIHtkYXRhTGltaXR9XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXREYXRhTGltaXQodmFyaWFibGUpIHtcbiAgICAgICAgcmV0dXJuIHZhcmlhYmxlLmRhdGFMaW1pdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBnZXQgdXJsIGZyb20gd21TZXJ2aWNlT3BlcmF0aW9uSW5mb1xuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0VVJMKHZhcmlhYmxlKSB7XG4gICAgICAgIGNvbnN0IHByZWZhYk5hbWUgPSB2YXJpYWJsZS5nZXRQcmVmYWJOYW1lKCk7XG4gICAgICAgIGNvbnN0IG9wSW5mbyA9IHByZWZhYk5hbWUgPyBfLmdldChtZXRhZGF0YVNlcnZpY2UuZ2V0QnlPcGVyYXRpb25JZCh2YXJpYWJsZS5vcGVyYXRpb25JZCwgcHJlZmFiTmFtZSksICd3bVNlcnZpY2VPcGVyYXRpb25JbmZvJykgOiBfLmdldChtZXRhZGF0YVNlcnZpY2UuZ2V0QnlPcGVyYXRpb25JZCh2YXJpYWJsZS5vcGVyYXRpb25JZCksICd3bVNlcnZpY2VPcGVyYXRpb25JbmZvJyk7XG4gICAgICAgIGNvbnN0IGlucHV0RmllbGRzID0gdmFyaWFibGUuZGF0YUJpbmRpbmc7XG4gICAgICAgIGxldCBjb25maWc7XG5cbiAgICAgICAgLy8gYWRkIHNhbXBsZSB2YWx1ZXMgdG8gdGhlIHBhcmFtcyAodXJsIGFuZCBwYXRoKVxuICAgICAgICBfLmZvckVhY2gob3BJbmZvLnBhcmFtZXRlcnMsIGZ1bmN0aW9uIChwYXJhbSkge1xuICAgICAgICAgICAgcGFyYW0uc2FtcGxlVmFsdWUgPSBpbnB1dEZpZWxkc1twYXJhbS5uYW1lXTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGFsdGhvdWdoLCBubyBoZWFkZXIgcGFyYW1zIHdpbGwgYmUgcHJlc2VudCwga2VlcGluZyAnc2tpcENsb2FrSGVhZGVycycgZmxhZyBpZiBzdXBwb3J0IHByb3ZpZGVkIGxhdGVyXG4gICAgICAgICQuZXh0ZW5kKG9wSW5mbywge1xuICAgICAgICAgICAgc2tpcENsb2FrSGVhZGVyczogdHJ1ZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBjYWxsIGNvbW1vbiBtZXRob2QgdG8gcHJlcGFyZSBjb25maWcgZm9yIHRoZSBzZXJ2aWNlIG9wZXJhdGlvbiBpbmZvLlxuICAgICAgICBjb25maWcgPSBTZXJ2aWNlVmFyaWFibGVVdGlscy5jb25zdHJ1Y3RSZXF1ZXN0UGFyYW1zKHZhcmlhYmxlLCBvcEluZm8sIGlucHV0RmllbGRzKTtcbiAgICAgICAgLyogaWYgZXJyb3IgZm91bmQsIHJldHVybiAqL1xuICAgICAgICBpZiAoY29uZmlnLmVycm9yICYmIGNvbmZpZy5lcnJvci5tZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLl9vblNvY2tldEVycm9yKHZhcmlhYmxlLCB7ZGF0YTogY29uZmlnLmVycm9yLm1lc3NhZ2V9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29uZmlnLnVybDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBoYW5kbGVyIGZvciBvbk1lc3NhZ2UgZXZlbnQgb24gYSBzb2NrZXQgY29ubmVjdGlvbiBmb3IgYSB2YXJpYWJsZVxuICAgICAqIHRoZSBkYXRhIHJldHVybmVkIGlzIGNvbnZlcnRlZCB0byBKU09OIGZyb20gc3RyaW5nL3htbCBhbmQgYXNzaWduZWQgdG8gZGF0YVNldCBvZiB2YXJpYWJsZVxuICAgICAqIElmIG5vdCBhYmxlIHRvIGRvIHNvLCBtZXNzYWdlIGlzIHNpbXBseSBhc3NpZ25lZCB0byB0aGUgZGF0YVNldCBvZiB2YXJpYWJsZVxuICAgICAqIElmIGFwcGVuZERhdGEgcHJvcGVydHkgaXMgc2V0LCB0aGUgbWVzc2FnZSBpcyBhcHBlbmRlZCB0byB0aGUgZGF0YVNldCwgZWxzZSBpdCByZXBsYWNlcyB0aGUgZXhpc3RpbmcgdmFsdWUgb2YgZGF0YVNldFxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBldnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX29uU29ja2V0TWVzc2FnZSh2YXJpYWJsZSwgZXZ0KSB7XG4gICAgICAgIGxldCBkYXRhID0gXy5nZXQoZXZ0LCAnZGF0YScpLCB2YWx1ZSwgZGF0YUxlbmd0aCwgZGF0YUxpbWl0LCBzaG91bGRBZGRUb0xhc3QsIGluc2VydElkeDtcbiAgICAgICAgZGF0YSA9IGdldFZhbGlkSlNPTihkYXRhKSB8fCB4bWxUb0pzb24oZGF0YSkgfHwgZGF0YTtcbiAgICAgICAgLy8gRVZFTlQ6IE9OX01FU1NBR0VcbiAgICAgICAgdmFsdWUgPSBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5NRVNTQUdFX1JFQ0VJVkUsIHZhcmlhYmxlLCBkYXRhLCBldnQpO1xuICAgICAgICBkYXRhID0gaXNEZWZpbmVkKHZhbHVlKSA/IHZhbHVlIDogZGF0YTtcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkQXBwZW5kRGF0YSh2YXJpYWJsZSkpIHtcbiAgICAgICAgICAgIHZhcmlhYmxlLmRhdGFTZXQgPSB2YXJpYWJsZS5kYXRhU2V0IHx8IFtdO1xuICAgICAgICAgICAgZGF0YUxlbmd0aCA9IHZhcmlhYmxlLmRhdGFTZXQubGVuZ3RoO1xuICAgICAgICAgICAgZGF0YUxpbWl0ID0gdGhpcy5nZXREYXRhTGltaXQodmFyaWFibGUpO1xuICAgICAgICAgICAgc2hvdWxkQWRkVG9MYXN0ID0gdGhpcy5zaG91bGRBcHBlbmRMYXN0KHZhcmlhYmxlKTtcbiAgICAgICAgICAgIGlmIChkYXRhTGltaXQgJiYgKGRhdGFMZW5ndGggPj0gZGF0YUxpbWl0KSkge1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRBZGRUb0xhc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFibGUuZGF0YVNldC5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlLmRhdGFTZXQucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5zZXJ0SWR4ID0gc2hvdWxkQWRkVG9MYXN0ID8gZGF0YUxlbmd0aCA6IDA7XG4gICAgICAgICAgICB2YXJpYWJsZS5kYXRhU2V0LnNwbGljZShpbnNlcnRJZHgsIDAsIGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyaWFibGUuZGF0YVNldCA9IGlzRGVmaW5lZCh2YWx1ZSkgPyB2YWx1ZSA6IGRhdGE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjYWxscyB0aGUgT05fQkVGT1JFX1NFTkQgY2FsbGJhY2sgb24gdGhlIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIG1lc3NhZ2VcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX29uQmVmb3JlU2VuZCh2YXJpYWJsZSwgbWVzc2FnZSkge1xuICAgICAgICAvLyBFVkVOVDogT05fQkVGT1JFX1NFTkRcbiAgICAgICAgcmV0dXJuIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkJFRk9SRV9TRU5ELCB2YXJpYWJsZSwgbWVzc2FnZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY2FsbHMgdGhlIE9OX0JFRk9SRV9DTE9TRSBjYWxsYmFjayBhc3NpZ25lZCB0byB0aGUgdmFyaWFibGVcbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKiBAcGFyYW0gZXZ0XG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkJlZm9yZVNvY2tldENsb3NlKHZhcmlhYmxlLCBldnQ/KSB7XG4gICAgICAgIC8vIEVWRU5UOiBPTl9CRUZPUkVfQ0xPU0VcbiAgICAgICAgcmV0dXJuIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkJFRk9SRV9DTE9TRSwgdmFyaWFibGUsIF8uZ2V0KGV2dCwgJ2RhdGEnKSwgZXZ0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjYWxscyB0aGUgT05fQkVGT1JFX09QRU4gY2FsbGJhY2sgYXNzaWduZWRcbiAgICAgKiBjYWxsZWQganVzdCBiZWZvcmUgdGhlIGNvbm5lY3Rpb24gaXMgb3BlblxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBldnRcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX29uQmVmb3JlU29ja2V0T3Blbih2YXJpYWJsZSwgZXZ0Pykge1xuICAgICAgICAvLyBFVkVOVDogT05fQkVGT1JFX09QRU5cbiAgICAgICAgcmV0dXJuIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkJFRk9SRV9PUEVOLCB2YXJpYWJsZSwgXy5nZXQoZXZ0LCAnZGF0YScpLCBldnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNhbGxzIHRoZSBPTl9PUEVOIGV2ZW50IG9uIHRoZSB2YXJpYWJsZVxuICAgICAqIHRoaXMgaXMgY2FsbGVkIG9uY2UgdGhlIGNvbm5lY3Rpb24gaXMgZXN0YWJsaXNoZWQgYnkgdGhlIHZhcmlhYmxlIHdpdGggdGhlIHRhcmdldCBXZWJTb2NrZXQgc2VydmljZVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBldnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX29uU29ja2V0T3Blbih2YXJpYWJsZSwgZXZ0KSB7XG4gICAgICAgIHZhcmlhYmxlLl9zb2NrZXRDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICAvLyBFVkVOVDogT05fT1BFTlxuICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5PUEVOLCB2YXJpYWJsZSwgXy5nZXQoZXZ0LCAnZGF0YScpLCBldnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNsZWFycyB0aGUgc29ja2V0IHZhcmlhYmxlIGFnYWluc3QgdGhlIHZhcmlhYmxlIGluIGEgc2NvcGVcbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKi9cbiAgICBwcml2YXRlIGZyZWVTb2NrZXQodmFyaWFibGUpIHtcbiAgICAgICAgdGhpcy5zY29wZV92YXJfc29ja2V0X21hcC5zZXQodmFyaWFibGUsIHVuZGVmaW5lZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY2FsbHMgdGhlIE9OX0NMT1NFIGV2ZW50IG9uIHRoZSB2YXJpYWJsZVxuICAgICAqIHRoaXMgaXMgY2FsbGVkIG9uIGNsb3NlIG9mIGFuIGV4aXN0aW5nIGNvbm5lY3Rpb24gb24gYSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBldnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX29uU29ja2V0Q2xvc2UodmFyaWFibGUsIGV2dCkge1xuICAgICAgICB2YXJpYWJsZS5fc29ja2V0Q29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZnJlZVNvY2tldCh2YXJpYWJsZSk7XG4gICAgICAgIC8vIEVWRU5UOiBPTl9DTE9TRVxuICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5DTE9TRSwgdmFyaWFibGUsIF8uZ2V0KGV2dCwgJ2RhdGEnKSwgZXZ0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjYWxscyB0aGUgT05fRVJST1IgZXZlbnQgb24gdGhlIHZhcmlhYmxlXG4gICAgICogdGhpcyBpcyBjYWxsZWQgaWYgYW4gZXJyb3Igb2NjdXJzIHdoaWxlIGNvbm5lY3RpbmcgdG8gdGhlIHNvY2tldCBzZXJ2aWNlXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIGV2dFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25Tb2NrZXRFcnJvcih2YXJpYWJsZSwgZXZ0KSB7XG4gICAgICAgIHZhcmlhYmxlLl9zb2NrZXRDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5mcmVlU29ja2V0KHZhcmlhYmxlKTtcbiAgICAgICAgLy8gRVZFTlQ6IE9OX0VSUk9SXG4gICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULkVSUk9SLCB2YXJpYWJsZSwgXy5nZXQoZXZ0LCAnZGF0YScpIHx8ICdFcnJvciB3aGlsZSBjb25uZWN0aW5nIHdpdGggJyArIHZhcmlhYmxlLnNlcnZpY2UsIGV2dCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyBhbiBleGlzdGluZyBzb2NrZXQgY29ubmVjdGlvbiBvbiB0aGUgdmFyaWFibGVcbiAgICAgKiBpZiBub3QgcHJlc2VudCwgbWFrZSB0aGUgY29ubmVjdGlvbiBhbmQgcmV0dXJuIGl0XG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRTb2NrZXQodmFyaWFibGUpIHtcbiAgICAgICAgY29uc3QgdXJsICAgICA9IHRoaXMuZ2V0VVJMKHZhcmlhYmxlKTtcbiAgICAgICAgbGV0IF9zb2NrZXQgPSB0aGlzLnNjb3BlX3Zhcl9zb2NrZXRfbWFwLmdldCh2YXJpYWJsZSk7XG4gICAgICAgIGlmIChfc29ja2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gX3NvY2tldDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRyaWdnZXIgZXJyb3IgaWYgdW5zZWN1cmVkIHdlYlNvY2tldCBpcyB1c2VkIGluIHNlY3VyZWQgZG9tYWluLCBpZ25vcmUgaW4gbW9iaWxlIGRldmljZVxuICAgICAgICBpZiAoIUNPTlNUQU5UUy5oYXNDb3Jkb3ZhICYmIGlzSW5zZWN1cmVDb250ZW50UmVxdWVzdCh1cmwpKSB7XG4gICAgICAgICAgICB0cmlnZ2VyRm4odGhpcy5fb25Tb2NrZXRFcnJvci5iaW5kKHRoaXMsIHZhcmlhYmxlKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgX3NvY2tldCA9IG5ldyAkV2ViU29ja2V0KHVybCk7XG4gICAgICAgIF9zb2NrZXQub25PcGVuKHRoaXMuX29uU29ja2V0T3Blbi5iaW5kKHRoaXMsIHZhcmlhYmxlKSk7XG4gICAgICAgIF9zb2NrZXQub25FcnJvcih0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcywgdmFyaWFibGUpKTtcbiAgICAgICAgX3NvY2tldC5vbk1lc3NhZ2UodGhpcy5fb25Tb2NrZXRNZXNzYWdlLmJpbmQodGhpcywgdmFyaWFibGUpKTtcbiAgICAgICAgX3NvY2tldC5vbkNsb3NlKHRoaXMuX29uU29ja2V0Q2xvc2UuYmluZCh0aGlzLCB2YXJpYWJsZSkpO1xuXG4gICAgICAgIHRoaXMuc2NvcGVfdmFyX3NvY2tldF9tYXAuc2V0KHZhcmlhYmxlLCBfc29ja2V0KTtcbiAgICAgICAgdmFyaWFibGUuX3NvY2tldCA9IF9zb2NrZXQ7XG4gICAgICAgIHJldHVybiBfc29ja2V0O1xufVxuXG4gICAgLyoqXG4gICAgICogb3BlbnMgYSBzb2NrZXQgY29ubmVjdGlvbiBvbiB0aGUgdmFyaWFibGUuXG4gICAgICogVVJMICYgb3RoZXIgbWV0YSBkYXRhIGlzIGZldGNoZWQgZnJvbSB3bVNlcnZpY2VPcGVyYXRpb25JbmZvXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgcHVibGljIG9wZW4odmFyaWFibGU6IFdlYlNvY2tldFZhcmlhYmxlLCBzdWNjZXNzPywgZXJyb3I/KSB7XG4gICAgICAgIGNvbnN0IHNob3VsZE9wZW4gPSB0aGlzLl9vbkJlZm9yZVNvY2tldE9wZW4odmFyaWFibGUpO1xuICAgICAgICBsZXQgc29ja2V0O1xuICAgICAgICBpZiAoc2hvdWxkT3BlbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc29ja2V0ID0gdGhpcy5nZXRTb2NrZXQodmFyaWFibGUpO1xuICAgICAgICB0cmlnZ2VyRm4oc3VjY2Vzcyk7XG4gICAgICAgIHJldHVybiBzb2NrZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY2xvc2VzIGFuIGV4aXN0aW5nIHNvY2tldCBjb25uZWN0aW9uIG9uIHZhcmlhYmxlXG4gICAgICovXG4gICAgcHVibGljIGNsb3NlKHZhcmlhYmxlOiBXZWJTb2NrZXRWYXJpYWJsZSkge1xuICAgICAgICBjb25zdCBzaG91bGRDbG9zZSA9IHRoaXMuX29uQmVmb3JlU29ja2V0Q2xvc2UodmFyaWFibGUpLFxuICAgICAgICAgICAgc29ja2V0ICAgICAgPSB0aGlzLmdldFNvY2tldCh2YXJpYWJsZSk7XG4gICAgICAgIGlmIChzaG91bGRDbG9zZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzZW5kcyBhIG1lc3NhZ2UgdG8gdGhlIGV4aXN0aW5nIHNvY2tldCBjb25uZWN0aW9uIG9uIHRoZSB2YXJpYWJsZVxuICAgICAqIElmIHNvY2tldCBjb25uZWN0aW9uIG5vdCBvcGVuIHlldCwgb3BlbiBhIGNvbm5lY3Rpb25zIGFuZCB0aGVuIHNlbmRcbiAgICAgKiBpZiBtZXNzYWdlIHByb3ZpZGUsIGl0IGlzIHNlbnQsIGVsc2UgdGhlIG9uZSBwcmVzZW50IGluIFJlcXVlc3RCb2R5IHBhcmFtIGlzIHNlbnRcbiAgICAgKiBAcGFyYW0gbWVzc2FnZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZW5kKHZhcmlhYmxlOiBXZWJTb2NrZXRWYXJpYWJsZSwgbWVzc2FnZT86IHN0cmluZykge1xuICAgICAgICBjb25zdCBzb2NrZXQgICAgICA9IHRoaXMuZ2V0U29ja2V0KHZhcmlhYmxlKTtcbiAgICAgICAgbGV0IHJlc3BvbnNlO1xuXG4gICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlIHx8IF8uZ2V0KHZhcmlhYmxlLCAnZGF0YUJpbmRpbmcuUmVxdWVzdEJvZHknKTtcbiAgICAgICAgcmVzcG9uc2UgPSB0aGlzLl9vbkJlZm9yZVNlbmQodmFyaWFibGUsIG1lc3NhZ2UpO1xuICAgICAgICBpZiAocmVzcG9uc2UgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbWVzc2FnZSA9IGlzRGVmaW5lZChyZXNwb25zZSkgPyByZXNwb25zZSA6IG1lc3NhZ2U7XG4gICAgICAgIG1lc3NhZ2UgPSBpc09iamVjdChtZXNzYWdlKSA/IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpIDogbWVzc2FnZTtcbiAgICAgICAgc29ja2V0LnNlbmQobWVzc2FnZSwgMCk7XG4gICAgfVxufVxuIl19