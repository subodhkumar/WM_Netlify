import { AfterViewInit, Injector } from '@angular/core';
import { StylableComponent } from '../../base/stylable.component';
import { AccordionDirective } from '../accordion.directive';
export declare class AccordionPaneComponent extends StylableComponent implements AfterViewInit {
    private accordionRef;
    static initializeProps: void;
    isActive: boolean;
    iconclass: string;
    title: any;
    subheading: string;
    badgetype: any;
    badgevalue: string;
    smoothscroll: any;
    private $lazyLoad;
    name: string;
    reDrawableComponents: any;
    constructor(inj: Injector, accordionRef: AccordionDirective);
    /**
     * handles the pane expand
     * invoke $lazyLoad method which takes care of loading the partial when the content property is provided - lazyLoading or partial
     * invoke redraw on the re-drawable children
     * invoke expand callback
     * notify parent about the change
     * @param {Event} evt
     */
    expand(evt?: Event): void;
    /**
     * handles the pane collapse
     * invoke collapse callback
     * notify parent about the change
     * @param {Event} evt
     */
    collapse(evt?: Event): void;
    toggle(evt: Event): void;
    private redrawChildren;
    private notifyParent;
    onPropertyChange(key: any, nv: any, ov: any): void;
    ngAfterViewInit(): void;
}
