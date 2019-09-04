import * as tslib_1 from "tslib";
import { BaseVariableManager } from './base-variable.manager';
import { initiateCallback } from '../../util/variable/variables.utils';
/**
 * Device operation registered in this class will be invoked when a device variable requests the operation.
 */
var DeviceVariableManager = /** @class */ (function (_super) {
    tslib_1.__extends(DeviceVariableManager, _super);
    function DeviceVariableManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * A map that contains services and their operations.
         *
         * @type {Map<string, Map<string, DeviceVariableService>>}
         */
        _this.serviceRegistry = new Map();
        return _this;
    }
    /**
     * Invokes the given device variable and returns a promise that is resolved or rejected
     * by the device operation's outcome.
     * @param variable
     * @param options
     * @returns {Promise<any>}
     */
    DeviceVariableManager.prototype.invoke = function (variable, options) {
        var _this = this;
        var service = this.serviceRegistry.get(variable.service);
        if (service == null) {
            initiateCallback('onError', variable, null);
            return Promise.reject("Could not find service '" + service + "'");
        }
        else {
            this.notifyInflight(variable, true);
            return service.invoke(variable, options).then(function (response) {
                _this.notifyInflight(variable, false, response);
                return response;
            }, function (err) {
                _this.notifyInflight(variable, false, err);
                return Promise.reject(err);
            });
        }
    };
    /**
     * Adds an operation under the given service category
     * @param {string} service
     */
    DeviceVariableManager.prototype.registerService = function (service) {
        this.serviceRegistry.set(service.name, service);
    };
    return DeviceVariableManager;
}(BaseVariableManager));
export { DeviceVariableManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLXZhcmlhYmxlLW1hbmFnZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsibWFuYWdlci92YXJpYWJsZS9kZXZpY2UtdmFyaWFibGUtbWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFHdkU7O0dBRUc7QUFDSDtJQUEyQyxpREFBbUI7SUFBOUQ7UUFBQSxxRUF3Q0M7UUF0Q0c7Ozs7V0FJRztRQUNLLHFCQUFlLEdBQXVDLElBQUksR0FBRyxFQUFpQyxDQUFDOztJQWlDM0csQ0FBQztJQS9CRzs7Ozs7O09BTUc7SUFDSSxzQ0FBTSxHQUFiLFVBQWMsUUFBYSxFQUFFLE9BQVk7UUFBekMsaUJBZUM7UUFkRyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0QsSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO1lBQ2pCLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDNUMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLDZCQUEyQixPQUFPLE1BQUcsQ0FBQyxDQUFDO1NBQ2hFO2FBQU07WUFDSCxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBRSxVQUFBLFFBQVE7Z0JBQ25ELEtBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDL0MsT0FBTyxRQUFRLENBQUM7WUFDcEIsQ0FBQyxFQUFFLFVBQUEsR0FBRztnQkFDRixLQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzFDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNJLCtDQUFlLEdBQXRCLFVBQXVCLE9BQThCO1FBQ2pELElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUNMLDRCQUFDO0FBQUQsQ0FBQyxBQXhDRCxDQUEyQyxtQkFBbUIsR0F3QzdEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmFzZVZhcmlhYmxlTWFuYWdlciB9IGZyb20gJy4vYmFzZS12YXJpYWJsZS5tYW5hZ2VyJztcbmltcG9ydCB7IGluaXRpYXRlQ2FsbGJhY2sgfSBmcm9tICcuLi8uLi91dGlsL3ZhcmlhYmxlL3ZhcmlhYmxlcy51dGlscyc7XG5pbXBvcnQgeyBEZXZpY2VWYXJpYWJsZVNlcnZpY2UgfSBmcm9tICcuL2RldmljZS12YXJpYWJsZS1zZXJ2aWNlJztcblxuLyoqXG4gKiBEZXZpY2Ugb3BlcmF0aW9uIHJlZ2lzdGVyZWQgaW4gdGhpcyBjbGFzcyB3aWxsIGJlIGludm9rZWQgd2hlbiBhIGRldmljZSB2YXJpYWJsZSByZXF1ZXN0cyB0aGUgb3BlcmF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgRGV2aWNlVmFyaWFibGVNYW5hZ2VyIGV4dGVuZHMgQmFzZVZhcmlhYmxlTWFuYWdlciB7XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCB0aGF0IGNvbnRhaW5zIHNlcnZpY2VzIGFuZCB0aGVpciBvcGVyYXRpb25zLlxuICAgICAqXG4gICAgICogQHR5cGUge01hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIERldmljZVZhcmlhYmxlU2VydmljZT4+fVxuICAgICAqL1xuICAgIHByaXZhdGUgc2VydmljZVJlZ2lzdHJ5OiBNYXA8c3RyaW5nLCBEZXZpY2VWYXJpYWJsZVNlcnZpY2U+ID0gbmV3IE1hcDxzdHJpbmcsIERldmljZVZhcmlhYmxlU2VydmljZT4oKTtcblxuICAgIC8qKlxuICAgICAqIEludm9rZXMgdGhlIGdpdmVuIGRldmljZSB2YXJpYWJsZSBhbmQgcmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCBvciByZWplY3RlZFxuICAgICAqIGJ5IHRoZSBkZXZpY2Ugb3BlcmF0aW9uJ3Mgb3V0Y29tZS5cbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gICAgICovXG4gICAgcHVibGljIGludm9rZSh2YXJpYWJsZTogYW55LCBvcHRpb25zOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBjb25zdCBzZXJ2aWNlID0gdGhpcy5zZXJ2aWNlUmVnaXN0cnkuZ2V0KHZhcmlhYmxlLnNlcnZpY2UpO1xuICAgICAgICBpZiAoc2VydmljZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKCdvbkVycm9yJywgdmFyaWFibGUsIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGBDb3VsZCBub3QgZmluZCBzZXJ2aWNlICcke3NlcnZpY2V9J2ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlJbmZsaWdodCh2YXJpYWJsZSwgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gc2VydmljZS5pbnZva2UodmFyaWFibGUsIG9wdGlvbnMpLnRoZW4oIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeUluZmxpZ2h0KHZhcmlhYmxlLCBmYWxzZSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgIH0sIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnlJbmZsaWdodCh2YXJpYWJsZSwgZmFsc2UsIGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gb3BlcmF0aW9uIHVuZGVyIHRoZSBnaXZlbiBzZXJ2aWNlIGNhdGVnb3J5XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNlcnZpY2VcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXJTZXJ2aWNlKHNlcnZpY2U6IERldmljZVZhcmlhYmxlU2VydmljZSkge1xuICAgICAgICB0aGlzLnNlcnZpY2VSZWdpc3RyeS5zZXQoc2VydmljZS5uYW1lLCBzZXJ2aWNlKTtcbiAgICB9XG59XG4iXX0=