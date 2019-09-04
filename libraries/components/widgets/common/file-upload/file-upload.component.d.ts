import { AfterViewInit, Injector, OnInit } from '@angular/core';
import { App } from '@wm/core';
import { StylableComponent } from '../base/stylable.component';
export declare class FileUploadComponent extends StylableComponent implements OnInit, AfterViewInit {
    private app;
    onSelectEvt: any;
    static initializeProps: void;
    selectedFiles: any;
    progressObservable: any;
    name: any;
    multiple: any;
    fileTransfers: {};
    caption: string;
    formName: string;
    maxfilesize: any;
    selectedUploadTypePath: any;
    DEFAULT_CAPTIONS: {
        MULTIPLE_SELECT: string;
        SELECT: string;
    };
    DEVICE_CONTENTTYPES: {
        IMAGE: string;
        VIDEO: string;
        AUDIO: string;
        FILES: string;
    };
    FILESIZE_MB: number;
    widgetProps: any;
    _isMobileType: any;
    _isCordova: any;
    CONSTANT_FILE_SERVICE: string;
    uploadData: {
        file: any;
        uploadPath: any;
    };
    chooseFilter: string;
    datasource: any;
    fileUploadMessage: string;
    uploadedFiles: {
        fileName: string;
        path: string;
        length: string;
        status: string;
    };
    isValidFile(filename: any, contenttype: any, extensionName: any, isMobileType: any): any;
    getValidFiles($files: any): {
        validFiles: any[];
        errorFiles: any[];
    };
    getCaption(caption: any, isMultiple: any, isMobileType: any): any;
    uploadUrl: string;
    changeServerUploadPath(path: any): void;
    getFileExtension(fileName: any): any;
    /**
     * Calls select Event
     * @param $event
     * @param $files
     */
    onSelectEventCall($event: any, $files: any): void;
    onFileElemClick(): void;
    onFileSelect($event: any, $files: any): void;
    /**
     * Aborts a file upload request
     * @param $file, the file for which the request is to be aborted
     */
    abortFileUpload($file: any): void;
    onPropertyChange(key: any, nv: any, ov: any): void;
    constructor(inj: Injector, app: App, onSelectEvt: any);
    ngOnInit(): void;
    ngAfterViewInit(): void;
}
