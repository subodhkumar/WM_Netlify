import { HttpClient } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { DeviceFileDownloadService, DeviceService } from '@wm/mobile/core';
export declare class AppUpdateComponent {
    private deviceService;
    private fileDownloadService;
    private elRef;
    private file;
    private fileOpener;
    private http;
    downloadProgress: number;
    downloading: boolean;
    message: string;
    private _buildMeta;
    constructor(deviceService: DeviceService, fileDownloadService: DeviceFileDownloadService, elRef: ElementRef, file: File, fileOpener: FileOpener, http: HttpClient);
    cancel(): void;
    installLatestVersion(): void;
    private checkForUpdate;
    private getBuildMeta;
    private getUserConfirmation;
}
