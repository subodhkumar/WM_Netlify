import { AppVersion } from '@ionic-native/app-version';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Calendar } from '@ionic-native/calendar';
import { Camera } from '@ionic-native/camera';
import { Device } from '@ionic-native/device';
import { Contacts } from '@ionic-native/contacts';
import { MediaCapture } from '@ionic-native/media-capture';
import { Geolocation } from '@ionic-native/geolocation';
import { Vibration } from '@ionic-native/vibration';
import { App } from '@wm/core';
import { DeviceFileOpenerService, DeviceFileUploadService, NetworkService } from '@wm/mobile/core';
import { ChangeLogService, LocalDBManagementService, LocalDBDataPullService } from '@wm/mobile/offline';
import { SecurityService } from '@wm/security';
import { FileSelectorService, ProcessManagementService } from '@wm/mobile/components';
export declare class VariablesModule {
    private static initialized;
    private static initialize;
    constructor(app: App, appVersion: AppVersion, barcodeScanner: BarcodeScanner, changeLogService: ChangeLogService, calendar: Calendar, contacts: Contacts, camera: Camera, fileOpener: DeviceFileOpenerService, fileSelectorService: FileSelectorService, fileUploader: DeviceFileUploadService, device: Device, geoLocation: Geolocation, localDBDataPullService: LocalDBDataPullService, localDBManagementService: LocalDBManagementService, mediaCapture: MediaCapture, processManagementService: ProcessManagementService, securityService: SecurityService, networkService: NetworkService, vibrateService: Vibration);
}
