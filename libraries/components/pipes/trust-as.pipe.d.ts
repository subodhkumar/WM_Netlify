import { PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
export declare class TrustAsPipe implements PipeTransform {
    private domSanitizer;
    constructor(domSanitizer: DomSanitizer);
    transform(content: string, as: string | SecurityContext): import("@angular/platform-browser").SafeResourceUrl;
}
