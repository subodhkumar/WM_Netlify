import { Injector, OnDestroy } from '@angular/core';
import { StylableComponent } from '@wm/components';
import { App } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
export declare enum NetworkState {
    CONNECTED = 1,
    CONNECTING = 0,
    SERVICE_AVAILABLE_BUT_NOT_CONNECTED = -1,
    NETWORK_AVAIABLE_BUT_SERVICE_NOT_AVAILABLE = -2,
    NETWORK_NOT_AVAIABLE = -3
}
export declare class NetworkInfoToasterComponent extends StylableComponent implements OnDestroy {
    private networkService;
    static initializeProps: void;
    showMessage: boolean;
    isServiceConnected: boolean;
    isServiceAvailable: boolean;
    networkState: NetworkState;
    private _listenerDestroyer;
    constructor(networkService: NetworkService, app: App, inj: Injector);
    connect(): void;
    hideMessage(): void;
    ngOnDestroy(): void;
}
