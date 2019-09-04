import { AfterViewInit, Injector } from '@angular/core';
import { StylableComponent } from '@wm/components';
import { SegmentedControlComponent } from '../segmented-control.component';
export declare class SegmentContentComponent extends StylableComponent implements AfterViewInit {
    private segmentedControl;
    static initializeProps: void;
    private loadmode;
    compile: boolean;
    private loaddelay;
    constructor(segmentedControl: SegmentedControlComponent, inj: Injector);
    ngAfterViewInit(): void;
    navigate(): void;
    private _loadContent;
    loadContent(defaultLoad: any): void;
}
