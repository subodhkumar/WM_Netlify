import { AfterViewInit, Injector } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
export declare class NavbarComponent extends StylableComponent implements AfterViewInit {
    static initializeProps: void;
    menuiconclass: any;
    title: string;
    imgsrc: string;
    private navContent;
    constructor(inj: Injector);
    toggleCollapse(): void;
    private toggleNavCollapse;
}
