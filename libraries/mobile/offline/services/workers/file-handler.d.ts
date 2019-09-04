import { File } from '@ionic-native/file';
import { DeviceFileService } from '@wm/mobile/core';
import { Change, ChangeLogService, FlushContext, Worker } from '../change-log.service';
import { CallBack, LocalDBManagementService } from '../local-db-management.service';
export declare class FileHandler implements Worker {
    private fileStore;
    private logger;
    preFlush(context: FlushContext): void;
    /**
     * Replaces all local paths with the remote path using mappings created during 'uploadToServer'.
     */
    preCall(change: Change): void;
    postCallSuccess(change: Change, response: any): void;
}
export declare class UploadedFilesImportAndExportService implements CallBack {
    private changeLogService;
    private deviceFileService;
    private localDBManagementService;
    private file;
    private uploadDir;
    constructor(changeLogService: ChangeLogService, deviceFileService: DeviceFileService, localDBManagementService: LocalDBManagementService, file: File);
    preExport(folderToExport: string, meta: any): Promise<any>;
    postImport(importedFolder: string, meta: any): Promise<any>;
    /**
     * returns back the changes that were logged.
     * @param page page number
     * @param size size of page
     * @returns {*}
     */
    private getChanges;
    /**
     * If this is a database change, then it will replace old upload directory with the current upload directory
     * and its corresponding owner object, if  it has primary key.
     *
     * @param change
     * @param oldUploadDir
     * @param uploadDir
     * @returns {*}
     */
    private updateDBChange;
    /**
     * This function check this change to update old upload directory path.
     *
     * @param change
     * @param metaInfo
     * @returns {*}
     */
    private updateChange;
    /**
     * This function will visit all the changes and modify them, if necessary.
     * @param metaInfo
     * @param page
     * @returns {*}
     */
    private updateChanges;
}
