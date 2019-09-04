import { BaseVariableManager } from './base-variable.manager';
import { initiateCallback } from '../../util/variable/variables.utils';
/**
 * Device operation registered in this class will be invoked when a device variable requests the operation.
 */
export class DeviceVariableManager extends BaseVariableManager {
    constructor() {
        super(...arguments);
        /**
         * A map that contains services and their operations.
         *
         * @type {Map<string, Map<string, DeviceVariableService>>}
         */
        this.serviceRegistry = new Map();
    }
    /**
     * Invokes the given device variable and returns a promise that is resolved or rejected
     * by the device operation's outcome.
     * @param variable
     * @param options
     * @returns {Promise<any>}
     */
    invoke(variable, options) {
        const service = this.serviceRegistry.get(variable.service);
        if (service == null) {
            initiateCallback('onError', variable, null);
            return Promise.reject(`Could not find service '${service}'`);
        }
        else {
            this.notifyInflight(variable, true);
            return service.invoke(variable, options).then(response => {
                this.notifyInflight(variable, false, response);
                return response;
            }, err => {
                this.notifyInflight(variable, false, err);
                return Promise.reject(err);
            });
        }
    }
    /**
     * Adds an operation under the given service category
     * @param {string} service
     */
    registerService(service) {
        this.serviceRegistry.set(service.name, service);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLXZhcmlhYmxlLW1hbmFnZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsibWFuYWdlci92YXJpYWJsZS9kZXZpY2UtdmFyaWFibGUtbWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUd2RTs7R0FFRztBQUNILE1BQU0sT0FBTyxxQkFBc0IsU0FBUSxtQkFBbUI7SUFBOUQ7O1FBRUk7Ozs7V0FJRztRQUNLLG9CQUFlLEdBQXVDLElBQUksR0FBRyxFQUFpQyxDQUFDO0lBaUMzRyxDQUFDO0lBL0JHOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBQyxRQUFhLEVBQUUsT0FBWTtRQUNyQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0QsSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO1lBQ2pCLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDNUMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLDJCQUEyQixPQUFPLEdBQUcsQ0FBQyxDQUFDO1NBQ2hFO2FBQU07WUFDSCxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBRSxRQUFRLENBQUMsRUFBRTtnQkFDdEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUMvQyxPQUFPLFFBQVEsQ0FBQztZQUNwQixDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUM7U0FDTjtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSSxlQUFlLENBQUMsT0FBOEI7UUFDakQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCYXNlVmFyaWFibGVNYW5hZ2VyIH0gZnJvbSAnLi9iYXNlLXZhcmlhYmxlLm1hbmFnZXInO1xuaW1wb3J0IHsgaW5pdGlhdGVDYWxsYmFjayB9IGZyb20gJy4uLy4uL3V0aWwvdmFyaWFibGUvdmFyaWFibGVzLnV0aWxzJztcbmltcG9ydCB7IERldmljZVZhcmlhYmxlU2VydmljZSB9IGZyb20gJy4vZGV2aWNlLXZhcmlhYmxlLXNlcnZpY2UnO1xuXG4vKipcbiAqIERldmljZSBvcGVyYXRpb24gcmVnaXN0ZXJlZCBpbiB0aGlzIGNsYXNzIHdpbGwgYmUgaW52b2tlZCB3aGVuIGEgZGV2aWNlIHZhcmlhYmxlIHJlcXVlc3RzIHRoZSBvcGVyYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBEZXZpY2VWYXJpYWJsZU1hbmFnZXIgZXh0ZW5kcyBCYXNlVmFyaWFibGVNYW5hZ2VyIHtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIHRoYXQgY29udGFpbnMgc2VydmljZXMgYW5kIHRoZWlyIG9wZXJhdGlvbnMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TWFwPHN0cmluZywgTWFwPHN0cmluZywgRGV2aWNlVmFyaWFibGVTZXJ2aWNlPj59XG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXJ2aWNlUmVnaXN0cnk6IE1hcDxzdHJpbmcsIERldmljZVZhcmlhYmxlU2VydmljZT4gPSBuZXcgTWFwPHN0cmluZywgRGV2aWNlVmFyaWFibGVTZXJ2aWNlPigpO1xuXG4gICAgLyoqXG4gICAgICogSW52b2tlcyB0aGUgZ2l2ZW4gZGV2aWNlIHZhcmlhYmxlIGFuZCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIG9yIHJlamVjdGVkXG4gICAgICogYnkgdGhlIGRldmljZSBvcGVyYXRpb24ncyBvdXRjb21lLlxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICAgKi9cbiAgICBwdWJsaWMgaW52b2tlKHZhcmlhYmxlOiBhbnksIG9wdGlvbnM6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IHNlcnZpY2UgPSB0aGlzLnNlcnZpY2VSZWdpc3RyeS5nZXQodmFyaWFibGUuc2VydmljZSk7XG4gICAgICAgIGlmIChzZXJ2aWNlID09IG51bGwpIHtcbiAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soJ29uRXJyb3InLCB2YXJpYWJsZSwgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoYENvdWxkIG5vdCBmaW5kIHNlcnZpY2UgJyR7c2VydmljZX0nYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeUluZmxpZ2h0KHZhcmlhYmxlLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlLmludm9rZSh2YXJpYWJsZSwgb3B0aW9ucykudGhlbiggcmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5SW5mbGlnaHQodmFyaWFibGUsIGZhbHNlLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgICAgfSwgZXJyID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeUluZmxpZ2h0KHZhcmlhYmxlLCBmYWxzZSwgZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBvcGVyYXRpb24gdW5kZXIgdGhlIGdpdmVuIHNlcnZpY2UgY2F0ZWdvcnlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2VydmljZVxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlclNlcnZpY2Uoc2VydmljZTogRGV2aWNlVmFyaWFibGVTZXJ2aWNlKSB7XG4gICAgICAgIHRoaXMuc2VydmljZVJlZ2lzdHJ5LnNldChzZXJ2aWNlLm5hbWUsIHNlcnZpY2UpO1xuICAgIH1cbn1cbiJdfQ==