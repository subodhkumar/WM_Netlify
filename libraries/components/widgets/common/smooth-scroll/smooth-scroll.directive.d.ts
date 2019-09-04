import { DoCheck, ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { App } from '@wm/core';
export declare class SmoothScrollDirective implements OnInit, DoCheck, OnDestroy {
    private readonly _$el;
    private _isEnabled;
    private _smoothScrollInstance;
    private _lastScrollY;
    private _waitRefreshTill;
    private app;
    private pendingIscrolls;
    private cancelSubscription;
    constructor(inj: Injector, elRef: ElementRef, app: App);
    ngOnInit(): void;
    ngDoCheck(): void;
    ngOnDestroy(): void;
    wmSmoothscroll: any;
    private applySmoothScroll;
    private refreshIScroll;
}
