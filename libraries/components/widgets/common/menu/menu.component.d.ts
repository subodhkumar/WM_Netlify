import { AfterViewInit, Injector, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsDropdownDirective } from 'ngx-bootstrap';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';
import { NavComponent } from '../nav/nav.component';
export declare const KEYBOARD_MOVEMENTS: {
    MOVE_UP: string;
    MOVE_LEFT: string;
    MOVE_RIGHT: string;
    MOVE_DOWN: string;
    ON_ENTER: string;
    ON_TAB: string;
    ON_ESCAPE: string;
};
export declare const MENU_POSITION: {
    UP_LEFT: string;
    UP_RIGHT: string;
    DOWN_LEFT: string;
    DOWN_RIGHT: string;
    INLINE: string;
};
export declare class MenuComponent extends DatasetAwareNavComponent implements OnInit, OnDestroy, AfterViewInit {
    route: Router;
    bsDropdown: BsDropdownDirective;
    private parentNav;
    selectEventCB: string;
    static initializeProps: void;
    menualign: string;
    menuposition: string;
    menulayout: string;
    menuclass: string;
    linktarget: string;
    iconclass: string;
    animateitems: string;
    disableMenuContext: boolean;
    autoclose: string;
    autoopen: string;
    private menuCaret;
    private _selectFirstItem;
    type: any;
    onShow(): void;
    onHide(): void;
    onKeyDown($event: any, eventAction: any): void;
    constructor(inj: Injector, route: Router, bsDropdown: BsDropdownDirective, parentNav: NavComponent, selectEventCB: string);
    /**
     * returns true if the menu has link to the current page.
     * @param nodes
     */
    private hasLinkToCurrentPage;
    protected resetNodes(): void;
    ngOnInit(): void;
    onPropertyChange(key: string, nv: any, ov?: any): void;
    private setMenuPosition;
    onMenuItemSelect(args: any): void;
    ngAfterViewInit(): void;
}
