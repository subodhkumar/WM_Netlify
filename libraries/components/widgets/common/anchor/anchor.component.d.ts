import { AfterViewInit, Injector } from '@angular/core';
import { App } from '@wm/core';
import { StylableComponent } from '../base/stylable.component';
import { NavItemDirective } from '../nav/nav-item/nav-item.directive';
export declare class AnchorComponent extends StylableComponent implements AfterViewInit {
    private navItemRef;
    private app;
    static initializeProps: void;
    private hasNavigationToCurrentPageExpr;
    private hasGoToPageExpr;
    encodeurl: any;
    hyperlink: any;
    iconheight: string;
    iconwidth: string;
    iconurl: string;
    iconclass: string;
    caption: any;
    badgevalue: string;
    target: string;
    shortcutkey: string;
    iconposition: string;
    constructor(inj: Injector, navItemRef: NavItemDirective, app: App);
    protected processEventAttr(eventName: string, expr: string, meta?: string): void;
    private setNavItemActive;
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any, meta?: string): void;
    onPropertyChange(key: string, nv: any, ov?: any): void;
    ngAfterViewInit(): void;
}
