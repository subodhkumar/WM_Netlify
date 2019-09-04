/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import initSwipeyJqueryPlugin from './swipey.jquery.plugin';
initSwipeyJqueryPlugin();
/**
 * @abstract
 */
var /**
 * @abstract
 */
SwipeAnimation = /** @class */ (function () {
    function SwipeAnimation() {
        this._isGesturesEnabled = true;
    }
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.bindEvents = /**
     * @return {?}
     */
    function () { return ['touch']; };
    /**
     * @param {?=} e
     * @param {?=} $d
     * @return {?}
     */
    SwipeAnimation.prototype.bounds = /**
     * @param {?=} e
     * @param {?=} $d
     * @return {?}
     */
    function (e, $d) { return {}; };
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.context = /**
     * @return {?}
     */
    function () { return {}; };
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.direction = /**
     * @return {?}
     */
    function () { return $.fn.swipey.DIRECTIONS.HORIZONTAL; };
    /**
     * @param {?} enabled
     * @return {?}
     */
    SwipeAnimation.prototype.setGesturesEnabled = /**
     * @param {?} enabled
     * @return {?}
     */
    function (enabled) { this._isGesturesEnabled = enabled; };
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.isGesturesEnabled = /**
     * @return {?}
     */
    function () { return this._isGesturesEnabled; };
    /**
     * @param {?=} time
     * @return {?}
     */
    SwipeAnimation.prototype.goToLower = /**
     * @param {?=} time
     * @return {?}
     */
    function (time) {
        this._$ele.swipeAnimation('gotoLower', time);
    };
    /**
     * @param {?=} time
     * @return {?}
     */
    SwipeAnimation.prototype.goToUpper = /**
     * @param {?=} time
     * @return {?}
     */
    function (time) {
        this._$ele.swipeAnimation('gotoUpper', time);
    };
    /**
     * @param {?} e
     * @param {?} distanceMoved
     * @return {?}
     */
    SwipeAnimation.prototype.onAnimation = /**
     * @param {?} e
     * @param {?} distanceMoved
     * @return {?}
     */
    function (e, distanceMoved) { };
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.onUpper = /**
     * @return {?}
     */
    function () { };
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.onLower = /**
     * @return {?}
     */
    function () { };
    /**
     * @return {?}
     */
    SwipeAnimation.prototype.threshold = /**
     * @return {?}
     */
    function () { return 30; };
    /**
     * @param {?} $ele
     * @param {?=} $swipeTargetEle
     * @return {?}
     */
    SwipeAnimation.prototype.init = /**
     * @param {?} $ele
     * @param {?=} $swipeTargetEle
     * @return {?}
     */
    function ($ele, $swipeTargetEle) {
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
    };
    return SwipeAnimation;
}());
/**
 * @abstract
 */
export { SwipeAnimation };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpcGUuYW5pbWF0aW9uLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3N3aXBleS8iLCJzb3VyY2VzIjpbInN3aXBlLmFuaW1hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQ0EsT0FBTyxzQkFBc0IsTUFBTSx3QkFBd0IsQ0FBQztBQUU1RCxzQkFBc0IsRUFBRSxDQUFDOzs7O0FBSXpCOzs7O0lBdUJJO1FBcEJRLHVCQUFrQixHQUFHLElBQUksQ0FBQztJQXNCbEMsQ0FBQzs7OztJQW5CTSxtQ0FBVTs7O0lBQWpCLGNBQXNCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7OztJQUNsQywrQkFBTTs7Ozs7SUFBYixVQUFjLENBQUUsRUFBRSxFQUFXLElBQUksT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7O0lBQ3RDLGdDQUFPOzs7SUFBZCxjQUFtQixPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Ozs7SUFDeEIsa0NBQVM7OztJQUFoQixjQUFxQixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDOzs7OztJQUN6RCwyQ0FBa0I7Ozs7SUFBekIsVUFBMEIsT0FBZ0IsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQzs7OztJQUMzRSwwQ0FBaUI7OztJQUF4QixjQUE2QixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBQ3ZELGtDQUFTOzs7O0lBQWhCLFVBQWlCLElBQUs7UUFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pELENBQUM7Ozs7O0lBQ00sa0NBQVM7Ozs7SUFBaEIsVUFBaUIsSUFBSztRQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakQsQ0FBQzs7Ozs7O0lBQ00sb0NBQVc7Ozs7O0lBQWxCLFVBQW1CLENBQUMsRUFBRSxhQUFxQixJQUFHLENBQUM7Ozs7SUFDeEMsZ0NBQU87OztJQUFkLGNBQWtCLENBQUM7Ozs7SUFDWixnQ0FBTzs7O0lBQWQsY0FBa0IsQ0FBQzs7OztJQUNaLGtDQUFTOzs7SUFBaEIsY0FBcUIsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7Ozs7SUFNMUIsNkJBQUk7Ozs7O0lBQVgsVUFBWSxJQUFJLEVBQUUsZUFBZ0I7UUFDOUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUNoQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUMzQixNQUFNLEVBQUUsZUFBZTtZQUN2QixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzlCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQzdCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDaEMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDM0IsY0FBYyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ2pELFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDeEMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNoQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ2hDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFO1NBQzlCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDTCxxQkFBQztBQUFELENBQUMsQUEzQ0QsSUEyQ0M7Ozs7Ozs7Ozs7SUF6Q0csK0JBQWM7Ozs7O0lBQ2QsNENBQWtDOzs7OztJQUVsQyxxREFBdUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBpbml0U3dpcGV5SnF1ZXJ5UGx1Z2luIGZyb20gJy4vc3dpcGV5LmpxdWVyeS5wbHVnaW4nO1xuXG5pbml0U3dpcGV5SnF1ZXJ5UGx1Z2luKCk7XG5cbmRlY2xhcmUgY29uc3QgICQ7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTd2lwZUFuaW1hdGlvbiB7XG5cbiAgICBwcml2YXRlIF8kZWxlO1xuICAgIHByaXZhdGUgX2lzR2VzdHVyZXNFbmFibGVkID0gdHJ1ZTtcblxuICAgIHB1YmxpYyBhYnN0cmFjdCBhbmltYXRpb24oKTogW3t9XSB8IHt9O1xuICAgIHB1YmxpYyBiaW5kRXZlbnRzKCkgeyByZXR1cm4gWyd0b3VjaCddOyB9XG4gICAgcHVibGljIGJvdW5kcyhlPywgJGQ/OiBudW1iZXIpIHsgcmV0dXJuIHt9OyB9XG4gICAgcHVibGljIGNvbnRleHQoKSB7IHJldHVybiB7fTsgfVxuICAgIHB1YmxpYyBkaXJlY3Rpb24oKSB7IHJldHVybiAkLmZuLnN3aXBleS5ESVJFQ1RJT05TLkhPUklaT05UQUw7IH1cbiAgICBwdWJsaWMgc2V0R2VzdHVyZXNFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pIHsgdGhpcy5faXNHZXN0dXJlc0VuYWJsZWQgPSBlbmFibGVkOyB9XG4gICAgcHVibGljIGlzR2VzdHVyZXNFbmFibGVkKCkgeyByZXR1cm4gdGhpcy5faXNHZXN0dXJlc0VuYWJsZWQ7IH1cbiAgICBwdWJsaWMgZ29Ub0xvd2VyKHRpbWU/KSB7XG4gICAgICAgIHRoaXMuXyRlbGUuc3dpcGVBbmltYXRpb24oJ2dvdG9Mb3dlcicsIHRpbWUpO1xuICAgIH1cbiAgICBwdWJsaWMgZ29Ub1VwcGVyKHRpbWU/KSB7XG4gICAgICAgIHRoaXMuXyRlbGUuc3dpcGVBbmltYXRpb24oJ2dvdG9VcHBlcicsIHRpbWUpO1xuICAgIH1cbiAgICBwdWJsaWMgb25BbmltYXRpb24oZSwgZGlzdGFuY2VNb3ZlZDogbnVtYmVyKSB7fVxuICAgIHB1YmxpYyBvblVwcGVyKCkge31cbiAgICBwdWJsaWMgb25Mb3dlcigpIHt9XG4gICAgcHVibGljIHRocmVzaG9sZCgpIHsgcmV0dXJuIDMwOyB9XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdCgkZWxlLCAkc3dpcGVUYXJnZXRFbGU/KSB7XG4gICAgICAgIHRoaXMuXyRlbGUgPSAkZWxlO1xuICAgICAgICAkZWxlLnN3aXBlQW5pbWF0aW9uKHtcbiAgICAgICAgICAgIGFuaW1hdGlvbjogdGhpcy5hbmltYXRpb24oKSxcbiAgICAgICAgICAgIHRhcmdldDogJHN3aXBlVGFyZ2V0RWxlLFxuICAgICAgICAgICAgYm91bmRzOiB0aGlzLmJvdW5kcy5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgYmluZEV2ZW50czogdGhpcy5iaW5kRXZlbnRzKCksXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLmNvbnRleHQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb24oKSxcbiAgICAgICAgICAgIGVuYWJsZUdlc3R1cmVzOiB0aGlzLmlzR2VzdHVyZXNFbmFibGVkLmJpbmQodGhpcyksXG4gICAgICAgICAgICBvbkFuaW1hdGlvbjogdGhpcy5vbkFuaW1hdGlvbi5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgb25Mb3dlcjogdGhpcy5vbkxvd2VyLmJpbmQodGhpcyksXG4gICAgICAgICAgICBvblVwcGVyOiB0aGlzLm9uVXBwZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRocmVzaG9sZDogdGhpcy50aHJlc2hvbGQoKVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=