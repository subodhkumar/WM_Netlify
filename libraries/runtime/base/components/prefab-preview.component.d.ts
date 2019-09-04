import { AfterViewInit } from '@angular/core';
import { PrefabManagerService } from '../services/prefab-manager.service';
export declare class PrefabPreviewComponent implements AfterViewInit {
    private prefabManager;
    private config;
    private previewMode;
    prefabInstance: any;
    constructor(prefabManager: PrefabManagerService);
    postMessage(action: any, payload?: any): void;
    setupEventListeners(): void;
    init(): void;
    setProperty(payload: any): void;
    isOutBoundProp(info: any): boolean;
    getOutboundProps(): void;
    invokeScript(payload: any): void;
    ngAfterViewInit(): void;
}
