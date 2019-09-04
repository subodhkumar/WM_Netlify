import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';
export declare class ScanService extends DeviceVariableService {
    name: string;
    operations: IDeviceVariableOperation[];
    constructor(barcodeScanner: BarcodeScanner);
}
