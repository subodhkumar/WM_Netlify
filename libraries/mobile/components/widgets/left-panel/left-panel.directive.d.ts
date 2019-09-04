import { ElementRef, OnDestroy } from '@angular/core';
import { LeftPanelDirective, PageDirective } from '@wm/components';
import { DeviceService } from '@wm/mobile/core';
export declare class MobileLeftPanelDirective implements OnDestroy {
    private page;
    private leftPanelRef;
    private deviceService;
    private _backBtnListenerDestroyer;
    constructor(page: PageDirective, leftPanelRef: LeftPanelDirective, deviceService: DeviceService, elRef: ElementRef);
    ngOnDestroy(): void;
    private destroyBackBtnListener;
}
