import { File } from '@ionic-native/file';
import { IDeviceStartUpService } from './device-start-up-service';
export declare class DeviceService {
    private file;
    private _registry;
    private _isReady;
    private _whenReadyPromises;
    private _backBtnTapListeners;
    private _startUpServices;
    constructor(file: File);
    executeBackTapListeners($event: any): void;
    addStartUpService(service: IDeviceStartUpService): void;
    onBackButtonTap(fn: ($event: any) => boolean): () => void;
    start(): Promise<void>;
    whenReady(): Promise<void>;
    /**
     * @returns {Promise<number>} promise resolved with the app build time
     */
    getAppBuildTime(): Promise<number>;
    /**
     * Stores an entry that survives app restarts and updates.
     *
     * @param {string} key
     * @param {Object} value
     * @returns {Promise<any>}
     */
    storeEntry(key: string, value: Object): Promise<any>;
    /**
     * @param {string} key
     * @returns {any} entry corresponding to the key
     */
    getEntry(key: string): any;
}
