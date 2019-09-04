import * as tslib_1 from "tslib";
import { ApiAwareVariable } from './api-aware-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
var getManager = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.WEBSOCKET);
};
var ɵ0 = getManager;
var WebSocketVariable = /** @class */ (function (_super) {
    tslib_1.__extends(WebSocketVariable, _super);
    function WebSocketVariable(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    WebSocketVariable.prototype.open = function (success, error) {
        return getManager().open(this, success, error);
    };
    WebSocketVariable.prototype.close = function () {
        return getManager().close(this);
    };
    WebSocketVariable.prototype.update = function () {
        return getManager().update(this);
    };
    WebSocketVariable.prototype.send = function (message) {
        return getManager().send(this, message);
    };
    WebSocketVariable.prototype.cancel = function () {
        return this.close();
    };
    WebSocketVariable.prototype.invoke = function (options, success, error) {
        this.open(success, error);
    };
    WebSocketVariable.prototype.init = function () {
        getManager().initBinding(this);
    };
    return WebSocketVariable;
}(ApiAwareVariable));
export { WebSocketVariable };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLXNvY2tldC12YXJpYWJsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJtb2RlbC92YXJpYWJsZS93ZWItc29ja2V0LXZhcmlhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUN6RSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUVoRixJQUFNLFVBQVUsR0FBRztJQUNmLE9BQU8sc0JBQXNCLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3RSxDQUFDLENBQUM7O0FBRUY7SUFBdUMsNkNBQWdCO0lBRW5ELDJCQUFZLFFBQWE7UUFBekIsWUFDSSxpQkFBTyxTQUVWO1FBREcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7O0lBQ3pDLENBQUM7SUFFRCxnQ0FBSSxHQUFKLFVBQUssT0FBUSxFQUFFLEtBQU07UUFDakIsT0FBTyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsaUNBQUssR0FBTDtRQUNJLE9BQU8sVUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxrQ0FBTSxHQUFOO1FBQ0ksT0FBTyxVQUFVLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELGdDQUFJLEdBQUosVUFBSyxPQUFnQjtRQUNqQixPQUFPLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELGtDQUFNLEdBQU47UUFDSSxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQsa0NBQU0sR0FBTixVQUFPLE9BQVEsRUFBRSxPQUFRLEVBQUUsS0FBTTtRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsZ0NBQUksR0FBSjtRQUNJLFVBQVUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBQ0wsd0JBQUM7QUFBRCxDQUFDLEFBbENELENBQXVDLGdCQUFnQixHQWtDdEQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcGlBd2FyZVZhcmlhYmxlIH0gZnJvbSAnLi9hcGktYXdhcmUtdmFyaWFibGUnO1xuaW1wb3J0IHsgVkFSSUFCTEVfQ09OU1RBTlRTIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzL3ZhcmlhYmxlcy5jb25zdGFudHMnO1xuaW1wb3J0IHsgVmFyaWFibGVNYW5hZ2VyRmFjdG9yeSB9IGZyb20gJy4uLy4uL2ZhY3RvcnkvdmFyaWFibGUtbWFuYWdlci5mYWN0b3J5JztcblxuY29uc3QgZ2V0TWFuYWdlciA9ICgpID0+IHtcbiAgICByZXR1cm4gVmFyaWFibGVNYW5hZ2VyRmFjdG9yeS5nZXQoVkFSSUFCTEVfQ09OU1RBTlRTLkNBVEVHT1JZLldFQlNPQ0tFVCk7XG59O1xuXG5leHBvcnQgY2xhc3MgV2ViU29ja2V0VmFyaWFibGUgZXh0ZW5kcyBBcGlBd2FyZVZhcmlhYmxlIHtcblxuICAgIGNvbnN0cnVjdG9yKHZhcmlhYmxlOiBhbnkpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzIGFzIGFueSwgdmFyaWFibGUpO1xuICAgIH1cblxuICAgIG9wZW4oc3VjY2Vzcz8sIGVycm9yPykge1xuICAgICAgICByZXR1cm4gZ2V0TWFuYWdlcigpLm9wZW4odGhpcywgc3VjY2VzcywgZXJyb3IpO1xuICAgIH1cblxuICAgIGNsb3NlICgpIHtcbiAgICAgICAgcmV0dXJuIGdldE1hbmFnZXIoKS5jbG9zZSh0aGlzKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkudXBkYXRlKHRoaXMpO1xuICAgIH1cblxuICAgIHNlbmQobWVzc2FnZT86IHN0cmluZykge1xuICAgICAgICByZXR1cm4gZ2V0TWFuYWdlcigpLnNlbmQodGhpcywgbWVzc2FnZSk7XG4gICAgfVxuXG4gICAgY2FuY2VsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9zZSgpO1xuICAgIH1cblxuICAgIGludm9rZShvcHRpb25zPywgc3VjY2Vzcz8sIGVycm9yPykge1xuICAgICAgICB0aGlzLm9wZW4oc3VjY2VzcywgZXJyb3IpO1xuICAgIH1cblxuICAgIGluaXQgKCkge1xuICAgICAgICBnZXRNYW5hZ2VyKCkuaW5pdEJpbmRpbmcodGhpcyk7XG4gICAgfVxufVxuIl19