import { SwipeAnimation } from '@swipey';
import { TabsComponent } from './tabs.component';
export declare class TabsAnimator extends SwipeAnimation {
    private tabs;
    private _$el;
    private _noOfTabs;
    constructor(tabs: TabsComponent);
    bounds(): {
        strict: boolean;
        lower: number;
        center: number;
        upper: any;
    };
    context(): {
        'w': any;
    };
    animation(): {
        'transform': string;
        '-webkit-transform': string;
    };
    transitionTabIntoView(): void;
    onUpper(): void;
    onLower(): void;
    threshold(): number;
}
