import { SwipeAnimation } from '@swipey';
import { LeftPanelDirective } from './left-panel.directive';
export declare class LeftPanelAnimator extends SwipeAnimation {
    private leftPanel;
    private _$animatedElements;
    private _expanded;
    private _leftPanelWidth;
    private _maxX;
    private _pageContainerWidth;
    private _width;
    constructor(leftPanel: LeftPanelDirective);
    bounds(): {};
    context(): {
        'w': number;
        'pageW': number;
        'leftW': number;
        'maxX': number;
        'limit': (min: number, v: number, max: number) => number;
    };
    animation(): ({
        'target': any;
        'css': {
            'transform': string;
            'width'?: undefined;
            'z-index'?: undefined;
        };
    } | {
        'target': any;
        'css': {
            'transform': string;
            'width': string;
            'z-index': number;
        };
    })[] | {
        'target': any;
        'css': {
            'transform': string;
            'opacity': number;
            'z-index': number;
        };
    }[] | {
        'transform': string;
        'opacity': number;
        'z-index': number;
    };
    onLower(): void;
    onUpper(): void;
    private resetTransition;
}
