import { ApplicationRef, DoCheck, ElementRef, NgZone, ViewContainerRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractDialogService, AbstractSpinnerService, App } from '@wm/core';
import { OAuthService } from '@wm/oAuth';
import { PipeProvider } from '../../services/pipe-provider.service';
interface SPINNER {
    show: boolean;
    messages: Array<string>;
}
export declare class AppComponent implements DoCheck, AfterViewInit {
    private elRef;
    private oAuthService;
    private dialogService;
    private spinnerService;
    private router;
    private app;
    startApp: boolean;
    isApplicationType: boolean;
    dynamicComponentContainerRef: ViewContainerRef;
    spinner: SPINNER;
    constructor(_pipeProvider: PipeProvider, _appRef: ApplicationRef, elRef: ElementRef, oAuthService: OAuthService, dialogService: AbstractDialogService, spinnerService: AbstractSpinnerService, ngZone: NgZone, router: Router, app: App);
    providersConfig: any;
    isOAuthDialogOpen: boolean;
    showOAuthDialog(): void;
    closeOAuthDialog(): void;
    ngAfterViewInit(): void;
    ngDoCheck(): void;
}
export {};
