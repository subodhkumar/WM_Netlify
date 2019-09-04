import { AppVersion } from '@ionic-native/app-version';
import { File } from '@ionic-native/file';
import { IDeviceStartUpService } from './device-start-up-service';
export declare enum FileType {
    AUDIO = "AUDIO",
    DOCUMENT = "DOCUMENT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO"
}
export declare class DeviceFileService implements IDeviceStartUpService {
    private cordovaAppVersion;
    private cordovaFile;
    serviceName: string;
    private _appName;
    private _fileTypeVsPathMap;
    private _uploadDir;
    constructor(cordovaAppVersion: AppVersion, cordovaFile: File);
    addMediaToGallery(filePath: string): Promise<void>;
    appendToFileName(fileName: string, attachment?: string): string;
    clearTemporaryStorage(): Promise<any>;
    copy(persistent: boolean, sourceFilePath: string): Promise<string>;
    findFolderPath(persistent: boolean, fileName: string): any;
    getPersistentRootPath(): string;
    getTemporaryRootPath(): string;
    getUploadDirectory(): string;
    isPersistentType(filePath: string): boolean;
    isValidPath(filePath: string): Promise<string>;
    listFiles(folder: string, search: string | RegExp): Promise<Map<string, any>[]>;
    newFileName(folder: string, fileName: string): Promise<string>;
    removeFile(filePath: string): Promise<any>;
    /**
     * removes the directory at the specified location.
     *
     * @param dirPath absolute path of directory
     */
    removeDir(dirPath: string): Promise<any>;
    start(): Promise<any>;
    private createFolderIfNotExists;
    private findFileType;
    private setupUploadDirectory;
}
