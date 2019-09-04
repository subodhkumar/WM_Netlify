import { DoCheck, ElementRef } from '@angular/core';
export interface Process {
    max: number;
    min: number;
    name: string;
    onStop: () => void;
    progressLabel: string;
    show: boolean;
    stopButtonLabel: string;
    value: number;
}
export interface ProcessApi {
    destroy: () => Promise<void>;
    get: (propertyName: string) => string;
    set: (propertyName: string, propertyValue: any) => void;
}
export declare class ProcessManagerComponent implements DoCheck {
    private el;
    private isVisible;
    instances: Process[];
    queue: any[];
    constructor(el: ElementRef);
    createInstance(name: string, min?: number, max?: number): Promise<ProcessApi>;
    getVisibleInstances(): Process[];
    ngDoCheck(): void;
    private addToQueue;
    private flushQueue;
    private removeInstance;
    private setInstaceProperty;
}
