import { AfterViewInit, ViewContainerRef, TemplateRef, OnDestroy } from '@angular/core';
import { Toast, ToastPackage, ToastrService } from 'ngx-toastr';
export declare class CustomToasterComponent extends Toast implements AfterViewInit, OnDestroy {
    protected toastrService: ToastrService;
    toastPackage: ToastPackage;
    customToastRef: ViewContainerRef;
    customToastTmpl: TemplateRef<any>;
    pagename: any;
    watchers: any;
    params: any;
    constructor(toastrService: ToastrService, toastPackage: ToastPackage);
    generateParams(): void;
    generateDynamicComponent(): Promise<void>;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
}
