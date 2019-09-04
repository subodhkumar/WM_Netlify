import { Camera } from '@ionic-native/camera';
import { FileBrowserComponent } from '../widgets/file-browser/file-browser.component';
export interface FileContent {
    name: string;
    path: string;
    blob: any;
}
export declare class FileSelectorService {
    private camera;
    private fileBrowserComponent;
    constructor(camera: Camera);
    selectAudio(multiple?: boolean): Promise<any>;
    setFileBrowser(f: FileBrowserComponent): void;
    selectFiles(multiple?: boolean, fileTypeToSelect?: string): Promise<FileContent[]>;
    selectImages(multiple?: boolean): Promise<FileContent[]>;
    selectVideos(multiple?: boolean): Promise<FileContent[]>;
    /**
     * Converts the file to blob using filepath
     * @param filePaths, array of file paths
     * @returns fileObj having name, path, content
     */
    private getFiles;
}
