import * as tslib_1 from "tslib";
import { SwipeAnimation } from '@swipey';
import { $appDigest, addClass, setCSS, setCSSFromObj } from '@wm/core';
var TabsAnimator = /** @class */ (function (_super) {
    tslib_1.__extends(TabsAnimator, _super);
    function TabsAnimator(tabs) {
        var e_1, _a;
        var _this = _super.call(this) || this;
        _this.tabs = tabs;
        _this._$el = $(_this.tabs.getNativeElement()).find('>.tab-content');
        var childEls = _this._$el.find('>[wmTabPane]');
        _this._noOfTabs = childEls.length;
        var maxWidth = _this._noOfTabs * 100 + "%";
        addClass(_this.tabs.getNativeElement(), 'has-transition');
        setCSSFromObj(_this._$el[0], { maxWidth: maxWidth, width: maxWidth });
        var width = 100 / _this._noOfTabs + "%";
        try {
            for (var _b = tslib_1.__values(Array.from(childEls)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                setCSS(child, 'width', width);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        _this.init(_this._$el);
        return _this;
    }
    TabsAnimator.prototype.bounds = function () {
        var activeTabIndex = this.tabs.getActiveTabIndex(), w = this._$el.find('>.tab-pane:first').width(), noOfTabs = this._$el.find('>.tab-pane:visible').length, centerVal = -1 * activeTabIndex * w;
        return {
            strict: false,
            lower: activeTabIndex === noOfTabs - 1 ? 0 : -w,
            center: centerVal,
            upper: activeTabIndex === 0 ? centerVal : w
        };
    };
    TabsAnimator.prototype.context = function () {
        return {
            'w': this._$el.width()
        };
    };
    TabsAnimator.prototype.animation = function () {
        return {
            'transform': 'translate3d(${{ ($D + $d)/w * 100 + \'%\'}}, 0, 0)',
            '-webkit-transform': 'translate3d(${{ ($D + $d)/w * 100 + \'%\'}}, 0, 0)'
        };
    };
    TabsAnimator.prototype.transitionTabIntoView = function () {
        var activeTabIndex = this.tabs.getActiveTabIndex();
        setCSS(this._$el[0], 'transform', "translate3d(" + -1 * activeTabIndex / this._noOfTabs * 100 + "%, 0, 0)");
    };
    TabsAnimator.prototype.onUpper = function () {
        this.tabs.prev();
        $appDigest();
    };
    TabsAnimator.prototype.onLower = function () {
        this.tabs.next();
        $appDigest();
    };
    TabsAnimator.prototype.threshold = function () {
        return 5;
    };
    return TabsAnimator;
}(SwipeAnimation));
export { TabsAnimator };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFicy5hbmltYXRvci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFicy90YWJzLmFuaW1hdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRXpDLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFNdkU7SUFBa0Msd0NBQWM7SUFLNUMsc0JBQTJCLElBQW1COztRQUE5QyxZQUNJLGlCQUFPLFNBYVY7UUFkMEIsVUFBSSxHQUFKLElBQUksQ0FBZTtRQUUxQyxLQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDbEUsSUFBTSxRQUFRLEdBQUcsS0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDaEQsS0FBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBRWpDLElBQU0sUUFBUSxHQUFNLEtBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxNQUFHLENBQUM7UUFDNUMsUUFBUSxDQUFDLEtBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3pELGFBQWEsQ0FBQyxLQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUNuRSxJQUFNLEtBQUssR0FBTSxHQUFHLEdBQUcsS0FBSSxDQUFDLFNBQVMsTUFBRyxDQUFDOztZQUN6QyxLQUFvQixJQUFBLEtBQUEsaUJBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQSxnQkFBQSw0QkFBRTtnQkFBckMsSUFBTSxLQUFLLFdBQUE7Z0JBQ1osTUFBTSxDQUFDLEtBQW9CLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2hEOzs7Ozs7Ozs7UUFDRCxLQUFJLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7SUFDekIsQ0FBQztJQUVNLDZCQUFNLEdBQWI7UUFDSSxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQ2hELENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUM5QyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxNQUFNLEVBQ3RELFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLE9BQU87WUFDSCxNQUFNLEVBQUUsS0FBSztZQUNiLEtBQUssRUFBRSxjQUFjLEtBQUssUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxFQUFFLFNBQVM7WUFDakIsS0FBSyxFQUFFLGNBQWMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM5QyxDQUFDO0lBQ04sQ0FBQztJQUVNLDhCQUFPLEdBQWQ7UUFDSSxPQUFPO1lBQ0gsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1NBQ3pCLENBQUM7SUFDTixDQUFDO0lBRU0sZ0NBQVMsR0FBaEI7UUFDSSxPQUFPO1lBQ0gsV0FBVyxFQUFFLG9EQUFvRDtZQUNqRSxtQkFBbUIsRUFBRSxvREFBb0Q7U0FDNUUsQ0FBQztJQUNOLENBQUM7SUFFTSw0Q0FBcUIsR0FBNUI7UUFDSSxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDckQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxFQUFFLGlCQUFlLENBQUMsQ0FBQyxHQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsYUFBVSxDQUFDLENBQUM7SUFDNUcsQ0FBQztJQUVNLDhCQUFPLEdBQWQ7UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pCLFVBQVUsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFTSw4QkFBTyxHQUFkO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQixVQUFVLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRU0sZ0NBQVMsR0FBaEI7UUFDSSxPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFDTCxtQkFBQztBQUFELENBQUMsQUFqRUQsQ0FBa0MsY0FBYyxHQWlFL0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTd2lwZUFuaW1hdGlvbiB9IGZyb20gJ0Bzd2lwZXknO1xuXG5pbXBvcnQgeyAkYXBwRGlnZXN0LCBhZGRDbGFzcywgc2V0Q1NTLCBzZXRDU1NGcm9tT2JqIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBUYWJzQ29tcG9uZW50IH0gZnJvbSAnLi90YWJzLmNvbXBvbmVudCc7XG5cbmRlY2xhcmUgY29uc3QgJDtcblxuZXhwb3J0IGNsYXNzIFRhYnNBbmltYXRvciBleHRlbmRzIFN3aXBlQW5pbWF0aW9uIHtcblxuICAgIHByaXZhdGUgXyRlbDtcbiAgICBwcml2YXRlIF9ub09mVGFicztcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcihwcml2YXRlIHRhYnM6IFRhYnNDb21wb25lbnQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fJGVsID0gJCh0aGlzLnRhYnMuZ2V0TmF0aXZlRWxlbWVudCgpKS5maW5kKCc+LnRhYi1jb250ZW50Jyk7XG4gICAgICAgIGNvbnN0IGNoaWxkRWxzID0gdGhpcy5fJGVsLmZpbmQoJz5bd21UYWJQYW5lXScpO1xuICAgICAgICB0aGlzLl9ub09mVGFicyA9IGNoaWxkRWxzLmxlbmd0aDtcblxuICAgICAgICBjb25zdCBtYXhXaWR0aCA9IGAke3RoaXMuX25vT2ZUYWJzICogMTAwfSVgO1xuICAgICAgICBhZGRDbGFzcyh0aGlzLnRhYnMuZ2V0TmF0aXZlRWxlbWVudCgpLCAnaGFzLXRyYW5zaXRpb24nKTtcbiAgICAgICAgc2V0Q1NTRnJvbU9iaih0aGlzLl8kZWxbMF0sIHttYXhXaWR0aDogbWF4V2lkdGgsIHdpZHRoOiBtYXhXaWR0aH0pO1xuICAgICAgICBjb25zdCB3aWR0aCA9IGAkezEwMCAvIHRoaXMuX25vT2ZUYWJzfSVgO1xuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIEFycmF5LmZyb20oY2hpbGRFbHMpKSB7XG4gICAgICAgICAgICBzZXRDU1MoY2hpbGQgYXMgSFRNTEVsZW1lbnQsICd3aWR0aCcsIHdpZHRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluaXQodGhpcy5fJGVsKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYm91bmRzKCkge1xuICAgICAgICBjb25zdCBhY3RpdmVUYWJJbmRleCA9IHRoaXMudGFicy5nZXRBY3RpdmVUYWJJbmRleCgpLFxuICAgICAgICAgICAgdyA9IHRoaXMuXyRlbC5maW5kKCc+LnRhYi1wYW5lOmZpcnN0Jykud2lkdGgoKSxcbiAgICAgICAgICAgIG5vT2ZUYWJzID0gdGhpcy5fJGVsLmZpbmQoJz4udGFiLXBhbmU6dmlzaWJsZScpLmxlbmd0aCxcbiAgICAgICAgICAgIGNlbnRlclZhbCA9IC0xICogYWN0aXZlVGFiSW5kZXggKiB3O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RyaWN0OiBmYWxzZSxcbiAgICAgICAgICAgIGxvd2VyOiBhY3RpdmVUYWJJbmRleCA9PT0gbm9PZlRhYnMgLSAxID8gMCA6IC13LFxuICAgICAgICAgICAgY2VudGVyOiBjZW50ZXJWYWwsXG4gICAgICAgICAgICB1cHBlcjogYWN0aXZlVGFiSW5kZXggPT09IDAgPyBjZW50ZXJWYWwgOiB3XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGNvbnRleHQoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndyc6IHRoaXMuXyRlbC53aWR0aCgpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGFuaW1hdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0cmFuc2Zvcm0nOiAndHJhbnNsYXRlM2QoJHt7ICgkRCArICRkKS93ICogMTAwICsgXFwnJVxcJ319LCAwLCAwKScsXG4gICAgICAgICAgICAnLXdlYmtpdC10cmFuc2Zvcm0nOiAndHJhbnNsYXRlM2QoJHt7ICgkRCArICRkKS93ICogMTAwICsgXFwnJVxcJ319LCAwLCAwKSdcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdHJhbnNpdGlvblRhYkludG9WaWV3KCkge1xuICAgICAgICBjb25zdCBhY3RpdmVUYWJJbmRleCA9IHRoaXMudGFicy5nZXRBY3RpdmVUYWJJbmRleCgpO1xuICAgICAgICBzZXRDU1ModGhpcy5fJGVsWzBdLCAndHJhbnNmb3JtJywgYHRyYW5zbGF0ZTNkKCR7LTEgKiAgYWN0aXZlVGFiSW5kZXggLyB0aGlzLl9ub09mVGFicyAqIDEwMH0lLCAwLCAwKWApO1xuICAgIH1cblxuICAgIHB1YmxpYyBvblVwcGVyKCkge1xuICAgICAgICB0aGlzLnRhYnMucHJldigpO1xuICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uTG93ZXIoKSB7XG4gICAgICAgIHRoaXMudGFicy5uZXh0KCk7XG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdGhyZXNob2xkKCkge1xuICAgICAgICByZXR1cm4gNTtcbiAgICB9XG59XG4iXX0=