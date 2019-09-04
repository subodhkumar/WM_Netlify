import { Injector } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
export declare class ButtonComponent extends StylableComponent {
    static initializeProps: void;
    iconurl: string;
    iconclass: string;
    caption: string;
    badgevalue: string;
    type: string;
    tabindex: number;
    disabled: boolean;
    shortcutkey: string;
    iconposition: string;
    constructor(inj: Injector);
}
