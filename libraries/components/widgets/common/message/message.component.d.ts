import { Injector } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
export declare class MessageComponent extends StylableComponent {
    static initializeProps: void;
    messageClass: string;
    messageIconClass: string;
    type: string;
    caption: string;
    hideclose: any;
    constructor(inj: Injector);
    showMessage(caption?: string, type?: string): void;
    hideMessage(): void;
    dismiss($event: any): void;
    private onMessageTypeChange;
    onPropertyChange(key: any, nv: any, ov?: any): void;
}
