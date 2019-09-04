import { Injector, OnInit } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
import { ImagePipe } from '../../../pipes/image.pipe';
export declare class SpinnerComponent extends StylableComponent implements OnInit {
    private imagePipe;
    static initializeProps: void;
    iconclass: string;
    animation: string;
    imagewidth: any;
    imageheight: any;
    servicevariabletotrack: string;
    show: boolean;
    private picture;
    private _spinnerMessages;
    showCaption: boolean;
    type: any;
    spinnerMessages: any;
    private listenOnDataSource;
    constructor(inj: Injector, imagePipe: ImagePipe);
    onPropertyChange(key: string, nv: any, ov?: any): void;
    ngOnInit(): void;
}
