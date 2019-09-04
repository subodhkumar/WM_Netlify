import { ElementRef } from '@angular/core';
import { AbstractNavigationService, App } from '@wm/core';
import { PageDirective } from '@wm/components';
import { DeviceService } from '@wm/mobile/core';
export declare class MobilePageDirective {
    private deviceService;
    private page;
    private navigationService;
    private _$ele;
    constructor(app: App, elRef: ElementRef, deviceService: DeviceService, page: PageDirective, navigationService: AbstractNavigationService);
}
