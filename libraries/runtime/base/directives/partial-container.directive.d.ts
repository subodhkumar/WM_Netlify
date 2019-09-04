import { ComponentFactoryResolver, ElementRef, Injector, ViewContainerRef } from '@angular/core';
import { App } from '@wm/core';
import { ComponentRefProvider, PartialRefProvider } from '../types/types';
export declare class PartialContainerDirective {
    componentInstance: any;
    vcRef: ViewContainerRef;
    elRef: ElementRef;
    inj: Injector;
    private app;
    private resolver;
    private componentRefProvider;
    private partialRefProvider;
    private contentInitialized;
    private $target;
    readonly name: any;
    _renderPartial(nv: any): Promise<void>;
    renderPartial: any;
    onLoadSuccess(): void;
    constructor(componentInstance: any, vcRef: ViewContainerRef, elRef: ElementRef, inj: Injector, app: App, _content: string, resolver: ComponentFactoryResolver, componentRefProvider: ComponentRefProvider, partialRefProvider: PartialRefProvider);
}
