import { AfterViewInit, Injector, OnDestroy } from '@angular/core';
import { PageDirective, StylableComponent } from '@wm/components';
interface TabItem {
    icon: string;
    label: string;
    link?: string;
    value?: string;
}
export declare class MobileTabbarComponent extends StylableComponent implements AfterViewInit, OnDestroy {
    private page;
    binditemlabel: any;
    binditemicon: any;
    binditemlink: any;
    static initializeProps: void;
    tabItems: any[];
    layout: any;
    position: any;
    bottom: any;
    morebuttoniconclass: any;
    morebuttonlabel: any;
    showMoreMenu: any;
    private readonly _layouts;
    constructor(page: PageDirective, inj: Injector, binditemlabel: any, binditemicon: any, binditemlink: any);
    onPropertyChange(key: any, nv: any, ov?: any): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    onItemSelect($event: any, selectedItem: TabItem): void;
    private getItems;
    private getSuitableLayout;
    private getTabItems;
}
export {};
