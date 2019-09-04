import { Injector } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { StylableComponent } from '../base/stylable.component';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
export declare class IframeComponent extends StylableComponent {
    private trustAsPipe;
    static initializeProps: void;
    iframesrc: string;
    encodeurl: boolean;
    _iframesrc: SafeResourceUrl;
    private errorMsg;
    private hintMsg;
    caption: any;
    name: string;
    /**
     * this property member is set to true when the content request url doesn't match windows protocol
     */
    showContentLoadError: boolean;
    constructor(inj: Injector, trustAsPipe: TrustAsPipe);
    protected computeIframeSrc(): void;
    onPropertyChange(key: any, nv: any, ov?: any): void;
}
