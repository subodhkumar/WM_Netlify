import { AfterViewInit, ElementRef } from '@angular/core';
import { FileBrowserComponent, FileSelectorService, ProcessManagerComponent, ProcessManagementService } from '@wm/mobile/components';
export declare class AppExtComponent implements AfterViewInit {
    private elRef;
    private fileSelectorService;
    private processManagementService;
    fileBrowserComponent: FileBrowserComponent;
    processManagerComponent: ProcessManagerComponent;
    constructor(elRef: ElementRef, fileSelectorService: FileSelectorService, processManagementService: ProcessManagementService);
    ngAfterViewInit(): void;
}
