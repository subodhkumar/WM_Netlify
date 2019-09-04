import { AfterViewInit, Injector, OnInit } from '@angular/core';
import { StylableComponent } from '../../base/stylable.component';
import { TabsComponent } from '../tabs.component';
export declare class TabPaneComponent extends StylableComponent implements OnInit, AfterViewInit {
    private tabsRef;
    heading: any;
    title: any;
    static initializeProps: void;
    $lazyLoad: (...args: any[]) => void;
    name: string;
    show: boolean;
    smoothscroll: any;
    isActive: boolean;
    disabled: boolean;
    reDrawableComponents: any;
    constructor(inj: Injector, tabsRef: TabsComponent, heading: any, title: any);
    invokeOnSelectCallback($event?: Event): void;
    select($event?: Event): void;
    deselect(): void;
    private redrawChildren;
    private notifyParent;
    private handleSwipeLeft;
    private handleSwipeRight;
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any): void;
    onPropertyChange(key: string, nv: any, ov?: any): void;
    ngOnInit(): void;
    ngAfterViewInit(): void;
}
