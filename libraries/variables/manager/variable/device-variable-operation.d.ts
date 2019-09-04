/**
 * An interface that defines a device operation.
 */
export interface IDeviceVariableOperation {
    /**
     * @property operation name
     */
    name: string;
    /**
     * @property If a device operation must be allowed only at app variable level, then specify
     * 'App' as to the operation. This is optional.
     */
    owner?: string;
    /**
     * @property model represents the sample object structure that this operation returns. This is optional.
     */
    model?: {};
    /**
     * @property properties is a list of properties that this operation show/hide in device variable configuration UI.
     * This is optional.
     */
    properties?: any[];
    /**
     * @property requiredCordovaPlugins is an array of cordova plugins required by this operation. This is optional.
     */
    requiredCordovaPlugins?: string[];
    /**
     * @method
     * The main function to start a device operation.
     *
     * @param variable
     * @param options
     * @param dataBindings
     * @returns {Promise<any>}
     */
    invoke(variable: any, options: any, dataBindings?: Map<string, any>): Promise<any>;
}
