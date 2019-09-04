import { Injector, OnInit } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
export declare class HtmlDirective extends StylableComponent implements OnInit {
    private boundContent;
    private trustAsPipe;
    static initializeProps: void;
    content: string;
    constructor(inj: Injector, height: string, boundContent: string, trustAsPipe: TrustAsPipe);
    ngOnInit(): void;
    onPropertyChange(key: string, nv: any, ov?: any): void;
}
