import { ElementRef, Injector, TemplateRef } from '@angular/core';
import { StylableComponent } from '@wm/components';
export declare class MediaListComponent extends StylableComponent {
    static initializeProps: void;
    private $fullScreenEle;
    binddataset: any;
    fieldDefs: any[][];
    mediaurl: string;
    thumbnailurl: string;
    selectedMediaIndex: number;
    mediaListTemplate: TemplateRef<ElementRef>;
    constructor(inj: Injector);
    appendToBody(): boolean;
    onPropertyChange(key: any, nv: any, ov?: any): void;
    exitFullScreen(): void;
    getPicTitle(): string;
    showFullScreen(i: any): void;
    showNext(): void;
    private getSrc;
    showPrev(): void;
    private onDataChange;
    /** With given data, creates media list items*/
    private updateFieldDefs;
    /**
     * used to track list items by Index.
     * @param {number} index value of the list item
     * @returns {number} index.
     */
    private listTrackByFn;
}
