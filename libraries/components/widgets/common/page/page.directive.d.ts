import { AfterViewInit, Injector, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StylableComponent } from '../base/stylable.component';
export declare class PageDirective extends StylableComponent implements AfterViewInit, OnDestroy {
    private titleService;
    static initializeProps: void;
    private _eventNotifier;
    onPropertyChange(key: string, nv: any, ov?: any): void;
    constructor(inj: Injector, titleService: Title);
    /**
     * A child component can notify page using this method. Notified event will be passed to
     * subscribed children only after page initialization.
     *
     * @param {string} eventName
     * @param data
     */
    notify(eventName: string, ...data: Array<any>): void;
    /**
     * The main purpose of this function is to provide communication between page children objects.
     * Child component can subscribe for an event that will be emitted by another child component.
     *
     * @param eventName
     * @param {(data: any) => void} callback
     * @returns {any}
     */
    subscribe(eventName: any, callback: (data: any) => void): () => void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
}
