import { PipeTransform } from '@angular/core';
export declare class ImagePipe implements PipeTransform {
    transform(url: string, encode?: boolean, defaultImageUrl?: string): any;
}
