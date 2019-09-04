import { ChangeDetectorRef, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App, UserDefinedExecutionContext } from '@wm/core';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';
export declare class NavComponent extends DatasetAwareNavComponent implements OnInit {
    private cdRef;
    private router;
    private userDefinedExecutionContext;
    private app;
    static initializeProps: void;
    selecteditem: any;
    type: any;
    disableMenuContext: boolean;
    layout: any;
    private activeNavLINode;
    private itemActionFn;
    private pageScope;
    private readonly activePageName;
    constructor(inj: Injector, cdRef: ChangeDetectorRef, router: Router, userDefinedExecutionContext: UserDefinedExecutionContext, app: App, selectEventCB: any);
    private setNavType;
    private setNavLayout;
    onNavSelect($event: Event, item: any, liRef: HTMLElement): void;
    ngOnInit(): void;
    /**
     * invoked from the menu widget when a menu item is selected.
     * @param $event
     * @param widget
     * @param $item
     */
    onMenuItemSelect($event: any, widget: any, $item: any): void;
}
