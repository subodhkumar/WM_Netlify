import { NgZone } from '@angular/core';
import { SwipeAnimation } from '@swipey';
import { CarouselDirective } from './carousel.directive';
export declare class CarouselAnimator extends SwipeAnimation {
    private carousel;
    private interval;
    private ngZone;
    private _$el;
    private _activeIndex;
    private _animationPaused;
    private _indicators;
    private _items;
    private _intervalId;
    private _pauseCaroselTill;
    private _swiping;
    private _width;
    private _oldIndex;
    constructor(carousel: CarouselDirective, interval: number, ngZone: NgZone);
    bounds(): {
        'lower': number;
        'center': number;
        'upper': any;
    };
    context(): {
        'w': any;
    };
    animation(): {
        'target': any;
        'css': {
            'transform': string;
            '-webkit-transform': string;
        };
    }[];
    onUpper(): void;
    onLower(): void;
    onAnimation(): void;
    start(): void;
    pause(): void;
    resume(): void;
    stop(): void;
    threshold(): number;
    private getTarget;
    private resetTransition;
    private setActiveItem;
}
