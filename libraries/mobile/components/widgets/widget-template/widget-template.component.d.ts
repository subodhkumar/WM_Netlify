import { Injector } from '@angular/core';
import { StylableComponent } from '@wm/components';
export declare class WidgetTemplateComponent extends StylableComponent {
    static initializeProps: void;
    constructor(inj: Injector);
    onPropertyChange(key: any, nv: any, ov?: any): void;
}
