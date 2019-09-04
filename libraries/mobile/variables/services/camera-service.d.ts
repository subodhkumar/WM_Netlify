import { Camera } from '@ionic-native/camera';
import { MediaCapture } from '@ionic-native/media-capture';
import { DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';
export declare class CameraService extends DeviceVariableService {
    readonly name = "camera";
    readonly operations: IDeviceVariableOperation[];
    constructor(camera: Camera, mediaCapture: MediaCapture);
}
