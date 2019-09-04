import { Injector } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
export declare class RightPanelDirective extends StylableComponent {
    static initializeProps: void;
    constructor(inj: Injector);
    onPropertyChange(key: string, nv: any, ov?: any): void;
}
