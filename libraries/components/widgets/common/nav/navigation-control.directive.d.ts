import { ElementRef } from '@angular/core';
export declare const disableContextMenu: ($event: Event) => void;
export declare class NavigationControlDirective {
    private nativeElement;
    private _link;
    disableMenuContext: boolean;
    wmNavigationControl: any;
    constructor(eleRef: ElementRef);
}
