import { EventEmitter, OnDestroy } from '@angular/core';
import { DeviceService } from '@wm/mobile/core';
export interface File {
    name: string;
    size: number;
    isSelected: boolean;
    file: (success: (navtiveFileObject: any) => void, failure: (message: any) => any) => void;
}
export interface Folder {
    name: string;
    files: File[];
    folders: Folder[];
    parent: Folder;
}
export declare class FileBrowserComponent implements OnDestroy {
    private deviceService;
    currentFolder: Folder;
    fileTypeToSelect: string;
    multiple: boolean;
    selectedFiles: File[];
    submitEmitter: EventEmitter<{}>;
    isVisible: boolean;
    private backButtonListenerDeregister;
    constructor(deviceService: DeviceService);
    getFileExtension(fileName: string): string;
    ngOnDestroy(): void;
    onFileClick(file: any): void;
    show: boolean;
    submit(): void;
    private deselectFile;
    private goToFolder;
    private loadFileSize;
    private loadFolder;
    private refreshFolder;
    private selectFile;
}
