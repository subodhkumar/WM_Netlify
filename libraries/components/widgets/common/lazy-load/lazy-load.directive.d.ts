import { Injector, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
export declare class LazyLoadDirective implements OnDestroy {
    private templateRef;
    private viewContainer;
    private readonly viewParent;
    private readonly context;
    private embeddedView;
    private unSubscribeFn;
    constructor(inj: Injector, templateRef: TemplateRef<any>, viewContainer: ViewContainerRef);
    lazyLoad: any;
    ngOnDestroy(): void;
}
