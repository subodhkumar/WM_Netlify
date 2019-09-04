import { ChangeDetectorRef, ElementRef, Injector } from '@angular/core';
import { Camera } from '@ionic-native/camera';
import { MediaCapture } from '@ionic-native/media-capture';
import { StylableComponent } from '@wm/components';
export declare enum CAPTURE_TYPE {
    IMAGE = "IMAGE",
    PNG = "PNG"
}
export declare enum ENCODING_TYPE {
    JPEG = "JPEG",
    PNG = "PNG"
}
export declare class CameraComponent extends StylableComponent {
    private camera;
    private mediaCapture;
    static initializeProps: void;
    allowedit: boolean;
    correctorientation: boolean;
    capturetype: string;
    datavalue: string;
    imagequality: number;
    imageencodingtype: string;
    imagetargetwidth: number;
    imagetargetheight: number;
    localFile: any;
    localFilePath: string;
    savetogallery: boolean;
    iconsize: any;
    iconclass: any;
    private _cameraOptions;
    constructor(camera: Camera, mediaCapture: MediaCapture, inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef);
    openCamera($event: any): void;
    private updateModel;
}
