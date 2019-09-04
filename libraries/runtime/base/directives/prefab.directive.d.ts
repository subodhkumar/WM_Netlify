import { ComponentFactoryResolver, ElementRef, Injector, ViewContainerRef } from '@angular/core';
import { PrefabManagerService } from '../services/prefab-manager.service';
import { ComponentRefProvider } from '../types/types';
export declare class PrefabDirective {
    componentInstance: any;
    vcRef: ViewContainerRef;
    elRef: ElementRef;
    private prefabMngr;
    private resolver;
    private injector;
    private componentRefProvider;
    constructor(componentInstance: any, vcRef: ViewContainerRef, elRef: ElementRef, prefabMngr: PrefabManagerService, resolver: ComponentFactoryResolver, injector: Injector, componentRefProvider: ComponentRefProvider);
}
