import { AfterContentInit, AfterViewInit, Injector } from '@angular/core';
import { SearchComponent } from './search.component';
export declare class ScrollableDirective implements AfterContentInit, AfterViewInit {
    private searchRef;
    private elementRef;
    constructor(inj: Injector, searchRef: SearchComponent);
    ngAfterContentInit(): void;
    ngAfterViewInit(): void;
    private notifyParent;
}
