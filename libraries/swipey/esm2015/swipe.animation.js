/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import initSwipeyJqueryPlugin from './swipey.jquery.plugin';
initSwipeyJqueryPlugin();
/**
 * @abstract
 */
export class SwipeAnimation {
    constructor() {
        this._isGesturesEnabled = true;
    }
    /**
     * @return {?}
     */
    bindEvents() { return ['touch']; }
    /**
     * @param {?=} e
     * @param {?=} $d
     * @return {?}
     */
    bounds(e, $d) { return {}; }
    /**
     * @return {?}
     */
    context() { return {}; }
    /**
     * @return {?}
     */
    direction() { return $.fn.swipey.DIRECTIONS.HORIZONTAL; }
    /**
     * @param {?} enabled
     * @return {?}
     */
    setGesturesEnabled(enabled) { this._isGesturesEnabled = enabled; }
    /**
     * @return {?}
     */
    isGesturesEnabled() { return this._isGesturesEnabled; }
    /**
     * @param {?=} time
     * @return {?}
     */
    goToLower(time) {
        this._$ele.swipeAnimation('gotoLower', time);
    }
    /**
     * @param {?=} time
     * @return {?}
     */
    goToUpper(time) {
        this._$ele.swipeAnimation('gotoUpper', time);
    }
    /**
     * @param {?} e
     * @param {?} distanceMoved
     * @return {?}
     */
    onAnimation(e, distanceMoved) { }
    /**
     * @return {?}
     */
    onUpper() { }
    /**
     * @return {?}
     */
    onLower() { }
    /**
     * @return {?}
     */
    threshold() { return 30; }
    /**
     * @param {?} $ele
     * @param {?=} $swipeTargetEle
     * @return {?}
     */
    init($ele, $swipeTargetEle) {
        this._$ele = $ele;
        $ele.swipeAnimation({
            animation: this.animation(),
            target: $swipeTargetEle,
            bounds: this.bounds.bind(this),
            bindEvents: this.bindEvents(),
            context: this.context.bind(this),
            direction: this.direction(),
            enableGestures: this.isGesturesEnabled.bind(this),
            onAnimation: this.onAnimation.bind(this),
            onLower: this.onLower.bind(this),
            onUpper: this.onUpper.bind(this),
            threshold: this.threshold()
        });
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    SwipeAnimation.prototype._$ele;
    /**
     * @type {?}
     * @private
     */
    SwipeAnimation.prototype._isGesturesEnabled;
    /**
     * @abstract
     * @return {?}
     */
    SwipeAnimation.prototype.animation = function () { };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpcGUuYW5pbWF0aW9uLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3N3aXBleS8iLCJzb3VyY2VzIjpbInN3aXBlLmFuaW1hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQ0EsT0FBTyxzQkFBc0IsTUFBTSx3QkFBd0IsQ0FBQztBQUU1RCxzQkFBc0IsRUFBRSxDQUFDOzs7O0FBSXpCLE1BQU0sT0FBZ0IsY0FBYztJQXVCaEM7UUFwQlEsdUJBQWtCLEdBQUcsSUFBSSxDQUFDO0lBc0JsQyxDQUFDOzs7O0lBbkJNLFVBQVUsS0FBSyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7SUFDbEMsTUFBTSxDQUFDLENBQUUsRUFBRSxFQUFXLElBQUksT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7O0lBQ3RDLE9BQU8sS0FBSyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Ozs7SUFDeEIsU0FBUyxLQUFLLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBQ3pELGtCQUFrQixDQUFDLE9BQWdCLElBQUksSUFBSSxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7Ozs7SUFDM0UsaUJBQWlCLEtBQUssT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDOzs7OztJQUN2RCxTQUFTLENBQUMsSUFBSztRQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakQsQ0FBQzs7Ozs7SUFDTSxTQUFTLENBQUMsSUFBSztRQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakQsQ0FBQzs7Ozs7O0lBQ00sV0FBVyxDQUFDLENBQUMsRUFBRSxhQUFxQixJQUFHLENBQUM7Ozs7SUFDeEMsT0FBTyxLQUFJLENBQUM7Ozs7SUFDWixPQUFPLEtBQUksQ0FBQzs7OztJQUNaLFNBQVMsS0FBSyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Ozs7OztJQU0xQixJQUFJLENBQUMsSUFBSSxFQUFFLGVBQWdCO1FBQzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDaEIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDM0IsTUFBTSxFQUFFLGVBQWU7WUFDdkIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUM5QixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUM3QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ2hDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQzNCLGNBQWMsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNqRCxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3hDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDaEMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNoQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRTtTQUM5QixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7Ozs7OztJQXpDRywrQkFBYzs7Ozs7SUFDZCw0Q0FBa0M7Ozs7O0lBRWxDLHFEQUF1QyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IGluaXRTd2lwZXlKcXVlcnlQbHVnaW4gZnJvbSAnLi9zd2lwZXkuanF1ZXJ5LnBsdWdpbic7XG5cbmluaXRTd2lwZXlKcXVlcnlQbHVnaW4oKTtcblxuZGVjbGFyZSBjb25zdCAgJDtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN3aXBlQW5pbWF0aW9uIHtcblxuICAgIHByaXZhdGUgXyRlbGU7XG4gICAgcHJpdmF0ZSBfaXNHZXN0dXJlc0VuYWJsZWQgPSB0cnVlO1xuXG4gICAgcHVibGljIGFic3RyYWN0IGFuaW1hdGlvbigpOiBbe31dIHwge307XG4gICAgcHVibGljIGJpbmRFdmVudHMoKSB7IHJldHVybiBbJ3RvdWNoJ107IH1cbiAgICBwdWJsaWMgYm91bmRzKGU/LCAkZD86IG51bWJlcikgeyByZXR1cm4ge307IH1cbiAgICBwdWJsaWMgY29udGV4dCgpIHsgcmV0dXJuIHt9OyB9XG4gICAgcHVibGljIGRpcmVjdGlvbigpIHsgcmV0dXJuICQuZm4uc3dpcGV5LkRJUkVDVElPTlMuSE9SSVpPTlRBTDsgfVxuICAgIHB1YmxpYyBzZXRHZXN0dXJlc0VuYWJsZWQoZW5hYmxlZDogYm9vbGVhbikgeyB0aGlzLl9pc0dlc3R1cmVzRW5hYmxlZCA9IGVuYWJsZWQ7IH1cbiAgICBwdWJsaWMgaXNHZXN0dXJlc0VuYWJsZWQoKSB7IHJldHVybiB0aGlzLl9pc0dlc3R1cmVzRW5hYmxlZDsgfVxuICAgIHB1YmxpYyBnb1RvTG93ZXIodGltZT8pIHtcbiAgICAgICAgdGhpcy5fJGVsZS5zd2lwZUFuaW1hdGlvbignZ290b0xvd2VyJywgdGltZSk7XG4gICAgfVxuICAgIHB1YmxpYyBnb1RvVXBwZXIodGltZT8pIHtcbiAgICAgICAgdGhpcy5fJGVsZS5zd2lwZUFuaW1hdGlvbignZ290b1VwcGVyJywgdGltZSk7XG4gICAgfVxuICAgIHB1YmxpYyBvbkFuaW1hdGlvbihlLCBkaXN0YW5jZU1vdmVkOiBudW1iZXIpIHt9XG4gICAgcHVibGljIG9uVXBwZXIoKSB7fVxuICAgIHB1YmxpYyBvbkxvd2VyKCkge31cbiAgICBwdWJsaWMgdGhyZXNob2xkKCkgeyByZXR1cm4gMzA7IH1cblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcblxuICAgIH1cblxuICAgIHB1YmxpYyBpbml0KCRlbGUsICRzd2lwZVRhcmdldEVsZT8pIHtcbiAgICAgICAgdGhpcy5fJGVsZSA9ICRlbGU7XG4gICAgICAgICRlbGUuc3dpcGVBbmltYXRpb24oe1xuICAgICAgICAgICAgYW5pbWF0aW9uOiB0aGlzLmFuaW1hdGlvbigpLFxuICAgICAgICAgICAgdGFyZ2V0OiAkc3dpcGVUYXJnZXRFbGUsXG4gICAgICAgICAgICBib3VuZHM6IHRoaXMuYm91bmRzLmJpbmQodGhpcyksXG4gICAgICAgICAgICBiaW5kRXZlbnRzOiB0aGlzLmJpbmRFdmVudHMoKSxcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbigpLFxuICAgICAgICAgICAgZW5hYmxlR2VzdHVyZXM6IHRoaXMuaXNHZXN0dXJlc0VuYWJsZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIG9uQW5pbWF0aW9uOiB0aGlzLm9uQW5pbWF0aW9uLmJpbmQodGhpcyksXG4gICAgICAgICAgICBvbkxvd2VyOiB0aGlzLm9uTG93ZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIG9uVXBwZXI6IHRoaXMub25VcHBlci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhyZXNob2xkOiB0aGlzLnRocmVzaG9sZCgpXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==