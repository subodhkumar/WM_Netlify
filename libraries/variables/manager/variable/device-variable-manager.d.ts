import { BaseVariableManager } from './base-variable.manager';
import { DeviceVariableService } from './device-variable-service';
/**
 * Device operation registered in this class will be invoked when a device variable requests the operation.
 */
export declare class DeviceVariableManager extends BaseVariableManager {
    /**
     * A map that contains services and their operations.
     *
     * @type {Map<string, Map<string, DeviceVariableService>>}
     */
    private serviceRegistry;
    /**
     * Invokes the given device variable and returns a promise that is resolved or rejected
     * by the device operation's outcome.
     * @param variable
     * @param options
     * @returns {Promise<any>}
     */
    invoke(variable: any, options: any): Promise<any>;
    /**
     * Adds an operation under the given service category
     * @param {string} service
     */
    registerService(service: DeviceVariableService): void;
}
