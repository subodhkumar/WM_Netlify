export declare abstract class SwipeAnimation {
    private _$ele;
    private _isGesturesEnabled;
    abstract animation(): [{}] | {};
    bindEvents(): string[];
    bounds(e?: any, $d?: number): {};
    context(): {};
    direction(): any;
    setGesturesEnabled(enabled: boolean): void;
    isGesturesEnabled(): boolean;
    goToLower(time?: any): void;
    goToUpper(time?: any): void;
    onAnimation(e: any, distanceMoved: number): void;
    onUpper(): void;
    onLower(): void;
    threshold(): number;
    constructor();
    init($ele: any, $swipeTargetEle?: any): void;
}
