import { AfterViewInit, Injector } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
export declare class CompositeDirective extends StylableComponent implements AfterViewInit {
    static initializeProps: void;
    componentRefs: any;
    required: boolean;
    constructor(inj: Injector);
    /**
     * this is onPropertyChange handler for the form-group component
     * @param key
     * @param nv
     * @param ov
     */
    onPropertyChange(key: any, nv: any, ov: any): void;
    /**
     * this method assigns the required on the component/directive based on the required attribute of the form-group
     */
    protected assignRequiredToSubComponents(): void;
    ngAfterViewInit(): void;
}
