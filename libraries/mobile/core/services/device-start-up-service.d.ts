export interface IDeviceStartUpService {
    serviceName: string;
    start: () => Promise<any>;
}
