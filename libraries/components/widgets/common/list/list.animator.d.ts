import { Subscription } from 'rxjs';
import { SwipeAnimation } from '@swipey';
import { ListComponent } from './list.component';
export declare class ListAnimator extends SwipeAnimation {
    private list;
    private $el;
    private li;
    private limit;
    private transitionProportions;
    private rightChildrenCount;
    private leftChildrenCount;
    private position;
    private actionPanel;
    private actionItems;
    $btnSubscription: Subscription;
    constructor(list: ListComponent);
    private createActionPanel;
    private computeTotalChildrenWidth;
    private computeTransitionProportions;
    private resetElement;
    private resetState;
    private getChildActionElement;
    private initActionPanel;
    bounds(e?: any, $d?: number): any;
    context(): any;
    animation(): any;
    invokeFullSwipeEvt($event: Event): void;
    onAnimation($event: Event, d: number): void;
    onLower(): void;
    onUpper(): void;
    threshold(): number;
}
