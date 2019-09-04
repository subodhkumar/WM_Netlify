import { FileUploadComponent } from '@wm/components';
import { FileContent, FileSelectorService } from '../../services/file-selector.service';
export declare class FileUploadDirective {
    private fileSelectorService;
    private fileUploadComponent;
    constructor(fileSelectorService: FileSelectorService, fileUploadComponent: FileUploadComponent);
    openFileSelector(): Promise<FileContent[]>;
}
