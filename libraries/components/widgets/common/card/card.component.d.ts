import { AfterViewInit, Injector, OnInit } from '@angular/core';
import { MenuAdapterComponent } from '../base/menu-adapator.component';
export declare class CardComponent extends MenuAdapterComponent implements OnInit, AfterViewInit {
    static initializeProps: void;
    showHeader: boolean;
    title: string;
    subheading: string;
    iconclass: string;
    iconurl: string;
    actions: string;
    private cardContainerElRef;
    constructor(inj: Injector);
    ngAfterViewInit(): void;
    onPropertyChange(key: string, nv: any, ov?: any): void;
}
