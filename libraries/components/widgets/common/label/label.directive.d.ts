import { Injector } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
export declare class LabelDirective extends StylableComponent {
    private trustAsPipe;
    static initializeProps: void;
    constructor(inj: Injector, trustAsPipe: TrustAsPipe);
    onPropertyChange(key: any, nv: any, ov?: any): void;
}
