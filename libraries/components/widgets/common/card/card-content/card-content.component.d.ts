import { AfterViewInit, Injector } from '@angular/core';
import { StylableComponent } from '../../base/stylable.component';
export declare class CardContentComponent extends StylableComponent implements AfterViewInit {
    static initializeProps: void;
    private cardContentContainerElRef;
    constructor(inj: Injector);
    ngAfterViewInit(): void;
}
