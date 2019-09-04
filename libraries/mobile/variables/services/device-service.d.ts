import { AppVersion } from '@ionic-native/app-version';
import { Device } from '@ionic-native/device';
import { Geolocation } from '@ionic-native/geolocation';
import { Vibration } from '@ionic-native/vibration';
import { App } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
import { DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';
/**
 * this file contains all device operations under 'device' service.
 */
export declare class DeviceService extends DeviceVariableService {
    readonly name = "device";
    readonly operations: IDeviceVariableOperation[];
    constructor(app: App, appVersion: AppVersion, device: Device, geoLocation: Geolocation, networkService: NetworkService, vibrateService: Vibration);
}
