import { Injector } from '@angular/core';
import { App } from '@wm/core';
import { StylableComponent } from '../base/stylable.component';
import { PageDirective } from '../page/page.directive';
export declare enum AnimationType {
    SLIDE_IN = "slide-in",
    SLIDE_OVER = "slide-over"
}
export declare class LeftPanelDirective extends StylableComponent {
    app: App;
    private page;
    static initializeProps: void;
    animation: AnimationType;
    columnwidth: number;
    expanded: boolean;
    gestures: string;
    xscolumnwidth: number;
    $ele: any;
    $page: any;
    private _destroyCollapseActionListener;
    private _leftPanelAnimator;
    constructor(app: App, page: PageDirective, inj: Injector);
    collapse(): void;
    expand(): void;
    isGesturesEnabled(): boolean;
    isVisible(): boolean;
    onPropertyChange(key: any, nv: any, ov: any): void;
    toggle(): void;
    private listenForCollapseAction;
    private setLeftPanelWidth;
    private setPageWidthAndPosition;
}
