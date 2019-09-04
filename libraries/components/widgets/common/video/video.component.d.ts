import { Injector } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
export declare class VideoComponent extends StylableComponent {
    private trustAsPipe;
    static initializeProps: void;
    /**
     * subtitle language property eg: en
     */
    subtitlelang: string;
    videopreload: any;
    mp4format: string;
    muted: boolean;
    videoposter: any;
    controls: boolean;
    loop: boolean;
    autoplay: boolean;
    webmformat: string;
    oggformat: string;
    videosupportmessage: any;
    constructor(inj: Injector, trustAsPipe: TrustAsPipe);
    onPropertyChange(key: string, nv: any, ov?: any): void;
}
