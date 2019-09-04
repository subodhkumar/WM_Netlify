import { ApplicationRef, ElementRef, Injector, NgZone, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AbstractSpinnerService, App } from '@wm/core';
import { MetadataService } from '@wm/variables';
import { SecurityService } from '@wm/security';
import { AppManagerService, ComponentRefProvider } from '@wm/runtime/base';
export declare class PageWrapperComponent implements OnInit, OnDestroy {
    private injector;
    private route;
    private vcRef;
    private appRef;
    private metadataService;
    private securityService;
    private appManager;
    private app;
    private ngZone;
    private elRef;
    private spinnerService;
    private componentRefProvider;
    private router;
    subscription: Subscription;
    constructor(injector: Injector, route: ActivatedRoute, vcRef: ViewContainerRef, appRef: ApplicationRef, metadataService: MetadataService, securityService: SecurityService, appManager: AppManagerService, app: App, ngZone: NgZone, elRef: ElementRef, spinnerService: AbstractSpinnerService, componentRefProvider: ComponentRefProvider, router: Router);
    getTargetNode(): any;
    resetViewContainer(): void;
    renderPage(pageName: any): void;
    renderPrefabPreviewPage(): void;
    /**
     * canDeactivate is called before a route change.
     * This will internally call onBeforePageLeave method present
     * at page level and app level in the application and decide
     * whether to change route or not based on return value.
     */
    canDeactivate(): any;
    ngOnInit(): void;
    ngOnDestroy(): void;
}
