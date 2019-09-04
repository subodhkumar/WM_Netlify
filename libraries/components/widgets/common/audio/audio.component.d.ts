import { Injector } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
export declare class AudioComponent extends StylableComponent {
    static initializeProps: void;
    mp3format: string;
    muted: boolean;
    controls: boolean;
    loop: boolean;
    audiopreload: any;
    audiosupportmessage: any;
    autoplay: boolean;
    constructor(inj: Injector);
}
