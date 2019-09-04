import { AfterViewInit, Injector } from '@angular/core';
import { StylableComponent } from '@wm/components';
import { SegmentContentComponent } from './segment-content/segment-content.component';
export declare class SegmentedControlComponent extends StylableComponent implements AfterViewInit {
    static initializeProps: void;
    private _$container;
    contents: SegmentContentComponent[];
    currentSelectedIndex: number;
    constructor(inj: Injector);
    addContent(content: SegmentContentComponent): void;
    goToNext(): void;
    goToPrev(): void;
    ngAfterViewInit(): void;
    onPropertyChange(key: any, nv: any, ov?: any): void;
    removeContent(content: SegmentContentComponent): void;
    showContent(content: number | SegmentContentComponent, $event?: any, defaultLoad?: boolean): void;
}
