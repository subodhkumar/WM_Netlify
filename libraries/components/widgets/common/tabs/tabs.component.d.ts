import { AfterContentInit, AfterViewInit, Injector, OnInit, QueryList } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
import { TabPaneComponent } from './tab-pane/tab-pane.component';
export declare class TabsComponent extends StylableComponent implements AfterContentInit, OnInit, AfterViewInit {
    static initializeProps: void;
    defaultpaneindex: number;
    transition: string;
    tabsposition: string;
    vertical: boolean;
    justified: boolean;
    private activeTab;
    private readonly promiseResolverFn;
    private tabsAnimator;
    panes: QueryList<TabPaneComponent>;
    constructor(inj: Injector, _transition: string, _tabsPosition: string);
    animateIn(element: HTMLElement): void;
    /**
     * TabPane children components invoke this method to communicate with the parent
     * if the evt argument is defined on-change callback will be invoked.
     */
    notifyChange(paneRef: TabPaneComponent, evt: Event): void;
    goToTab(tabIndex: any): void;
    private getPaneIndexByRef;
    getActiveTabIndex(): number;
    private isValidPaneIndex;
    private getPaneRefByIndex;
    private isSelectableTab;
    private canSlide;
    private getSelectableTabAfterIndex;
    private getSelectableTabBeforeIndex;
    next(): void;
    prev(): void;
    /**
     * this method will be invoked during the initialization of the component and on defaultpaneindex property change,
     * if the provided defaultpaneindex is not valid, find the first pane index which can be shown and select it
     */
    private selectDefaultPaneByIndex;
    private setTabsPosition;
    onPropertyChange(key: string, nv: any, ov: any): void;
    registerTabsScroll(): void;
    ngAfterContentInit(): void;
    ngAfterViewInit(): void;
}
