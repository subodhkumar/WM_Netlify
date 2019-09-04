import { IDeviceVariableOperation } from './device-variable-operation';
export declare class DeviceVariableService {
    name: string;
    protected operations: IDeviceVariableOperation[];
    invoke(variable: any, options: any): Promise<any>;
}
