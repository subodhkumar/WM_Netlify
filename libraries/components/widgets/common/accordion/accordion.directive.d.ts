import { AfterContentInit, Injector, QueryList } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
import { AccordionPaneComponent } from './accordion-pane/accordion-pane.component';
export declare class AccordionDirective extends StylableComponent implements AfterContentInit {
    static initializeProps: void;
    defaultpaneindex: number;
    closeothers: boolean;
    private activePaneIndex;
    private activePane;
    private promiseResolverFn;
    panes: QueryList<AccordionPaneComponent>;
    constructor(inj: Injector);
    /**
     * AccordionPane children components invoke this method to communicate with the parent
     * if isExpand is true and when closeothers is true, all the other panes are collapsed
     * if the evt argument is defined on-change callback will be invoked.
     * updates the activePane index property
     * @param {AccordionPaneComponent} paneRef
     * @param {boolean} isExpand
     * @param {Event} evt
     */
    notifyChange(paneRef: AccordionPaneComponent, isExpand: boolean, evt: Event): void;
    private isValidPaneIndex;
    private getPaneIndexByRef;
    private getPaneRefByIndex;
    private closePanesExcept;
    private expandPane;
    onPropertyChange(key: string, nv: any, ov?: any): void;
    ngAfterContentInit(): void;
}
