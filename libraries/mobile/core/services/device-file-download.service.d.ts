import { HttpClient } from '@angular/common/http';
import { File } from '@ionic-native/file';
import { Observer } from 'rxjs';
import { FileExtensionFromMimePipe } from '@wm/components';
import { DeviceFileService } from './device-file.service';
export declare class DeviceFileDownloadService {
    private cordovaFile;
    private http;
    private deviceFileService;
    fileExtensionFromMimePipe: FileExtensionFromMimePipe;
    private _downloadQueue;
    private _concurrentDownloads;
    constructor(cordovaFile: File, http: HttpClient, deviceFileService: DeviceFileService, fileExtensionFromMimePipe: FileExtensionFromMimePipe);
    download(url: string, isPersistent: boolean, destFolder?: string, destFile?: string, progressObserver?: Observer<any>): Promise<string>;
    private addToDownloadQueue;
    private downloadNext;
    private downloadFile;
    /**
     * Returns the filename
     * 1. if filename exists just return
     * 2. retrieve the filename from response headers i.e. content-disposition
     * 3. pick the filename from the end of the url
     * If filename doesnt contain the extension then extract using mimeType.
     * Generates newFileName if filename already exists.
     * @param response, download file response
     * @param req, download request params
     * @param mimeType mime type of file
     * @returns {Promise<string>}
     */
    private getFileName;
    private sendHttpRequest;
}
