import { Injector, OnInit } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
import { ImagePipe } from '../../../pipes/image.pipe';
export declare class PictureDirective extends StylableComponent implements OnInit {
    private imagePipe;
    static initializeProps: void;
    encodeurl: any;
    picturesource: any;
    pictureplaceholder: any;
    imgSource: string;
    constructor(inj: Injector, imagePipe: ImagePipe);
    setImgSource(): void;
    onPropertyChange(key: string, nv: any, ov: any): void;
    onStyleChange(key: string, nv: any, ov?: any): void;
    ngOnInit(): void;
}
