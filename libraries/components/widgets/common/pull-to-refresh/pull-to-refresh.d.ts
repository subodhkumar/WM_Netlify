import { SwipeAnimation } from '@swipey';
import { App } from '@wm/core';
export declare class PullToRefresh extends SwipeAnimation {
    private $el;
    private app;
    private onPullToRefresh;
    private infoContainer;
    private runAnimation;
    private count;
    private spinner;
    cancelSubscription: Function;
    private animationInProgress;
    constructor($el: JQuery<HTMLElement>, app: App, onPullToRefresh: () => void);
    threshold(): number;
    direction(): any;
    private subscribe;
    bounds($event: any, $d: any): {
        lower: any;
        upper: any;
        center?: undefined;
        strict?: undefined;
    } | {
        lower: number;
        center: number;
        upper: number;
        strict: boolean;
    };
    context(): Object;
    animation(): {
        css: {
            transform: string;
            spin: string;
            opacity?: undefined;
        };
        target?: undefined;
    } | {
        target: JQuery<HTMLElement>;
        css: {
            transform: string;
            spin: string;
            opacity: string;
        };
    };
    onAnimation(): void;
    stopAnimation(): void;
    wait(): void;
}
