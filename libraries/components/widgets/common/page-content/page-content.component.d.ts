import { Injector } from '@angular/core';
import { App } from '@wm/core';
import { StylableComponent } from '../base/stylable.component';
import { PullToRefresh } from '../pull-to-refresh/pull-to-refresh';
export declare class PageContentComponent extends StylableComponent {
    private app;
    static initializeProps: void;
    pullToRefreshIns: PullToRefresh;
    private pulltorefresh;
    private childPullToRefresh;
    constructor(inj: Injector, app: App);
    onPropertyChange(key: string, nv: any, ov?: any): void;
    private initPullToRefresh;
}
