import * as tslib_1 from "tslib";
import { SwipeAnimation } from '@swipey';
import { $appDigest } from '@wm/core';
import { AnimationType } from './left-panel.directive';
var LeftPanelAnimator = /** @class */ (function (_super) {
    tslib_1.__extends(LeftPanelAnimator, _super);
    function LeftPanelAnimator(leftPanel) {
        var _this = _super.call(this) || this;
        _this.leftPanel = leftPanel;
        _this.init(_this.leftPanel.$ele, _this.leftPanel.$page);
        return _this;
    }
    LeftPanelAnimator.prototype.bounds = function () {
        var offset = 0;
        this.setGesturesEnabled(this.leftPanel.isGesturesEnabled());
        if (!this._width) {
            this._pageContainerWidth = this.leftPanel.$page.width();
            this._leftPanelWidth = this.leftPanel.$ele.width();
            this._maxX = this._leftPanelWidth / this._pageContainerWidth * 100;
            this._width = this.leftPanel.animation === AnimationType.SLIDE_IN ? this._pageContainerWidth : this._leftPanelWidth;
        }
        this._expanded = this.leftPanel.expanded;
        if (this._expanded) {
            return {
                'center': this._leftPanelWidth,
                'lower': -(this._leftPanelWidth - offset)
            };
        }
        if (this.leftPanel.app.isTabletApplicationType) {
            offset = 53.32;
        }
        return {
            'center': 0,
            'upper': this._leftPanelWidth - offset
        };
    };
    LeftPanelAnimator.prototype.context = function () {
        return {
            'w': this._width,
            'pageW': this._pageContainerWidth,
            'leftW': this._leftPanelWidth,
            'maxX': this._maxX,
            'limit': function (min, v, max) {
                if (v < min) {
                    return min;
                }
                if (v > max) {
                    return max;
                }
                return v;
            }
        };
    };
    LeftPanelAnimator.prototype.animation = function () {
        this._$animatedElements = this.leftPanel.$ele;
        if (this.leftPanel.animation === AnimationType.SLIDE_IN) {
            this._$animatedElements = this._$animatedElements.add(this.leftPanel.$page);
            if (this.leftPanel.app.isTabletApplicationType) {
                return [
                    {
                        'target': this.leftPanel.$ele,
                        'css': {
                            'transform': 'translate3d(${{ limit(-100, -($d * 100 / leftW), 0) + \'%\' }}, 0, 0)'
                        }
                    },
                    {
                        'target': this.leftPanel.$page,
                        'css': {
                            'transform': 'translate3d(${{ (($d) * 100 / pageW) + \'%\' }}, 0, 0)',
                            'width': '${{ (pageW - $d) + \'px\' }}',
                            'z-index': 101
                        }
                    }
                ];
            }
            return [
                {
                    'target': this.leftPanel.$ele,
                    'css': {
                        'transform': 'translate3d(-100%, 0, 0)',
                        'opacity': 1,
                        'z-index': 101
                    }
                },
                {
                    'target': this.leftPanel.$page,
                    'css': {
                        'transform': 'translate3d(${{ limit( 0, ((($D + $d) * 100 / w)), maxX ) + \'%\' }}, 0, 0)',
                        'opacity': 1,
                        'z-index': 101
                    }
                }
            ];
        }
        else {
            return {
                'transform': 'translate3d(${{ limit( -100, ((($D + $d) * 100 / w) - 100), 0 ) + \'%\'}}, 0, 0)',
                'opacity': 1,
                'z-index': 101
            };
        }
    };
    LeftPanelAnimator.prototype.onLower = function () {
        this._expanded = false;
        this.leftPanel.collapse();
        this.resetTransition();
        $appDigest();
    };
    LeftPanelAnimator.prototype.onUpper = function () {
        this._expanded = true;
        this.leftPanel.expand();
        this.resetTransition();
        $appDigest();
    };
    LeftPanelAnimator.prototype.resetTransition = function () {
        var _this = this;
        if (this._$animatedElements) {
            /*
             * This timeout is for preventing UI flicker at the end of animation.
             */
            setTimeout(function () {
                _this._$animatedElements.css({
                    'transform': '',
                    'opacity': '',
                    'z-index': '',
                    'width': ''
                });
            }, 100);
        }
    };
    return LeftPanelAnimator;
}(SwipeAnimation));
export { LeftPanelAnimator };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVmdC1wYW5lbC5hbmltYXRvci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbGVmdC1wYW5lbC9sZWZ0LXBhbmVsLmFuaW1hdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRXpDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdEMsT0FBTyxFQUFFLGFBQWEsRUFBc0IsTUFBTSx3QkFBd0IsQ0FBQztBQUUzRTtJQUF1Qyw2Q0FBYztJQVFqRCwyQkFBb0IsU0FBNkI7UUFBakQsWUFDSSxpQkFBTyxTQUVWO1FBSG1CLGVBQVMsR0FBVCxTQUFTLENBQW9CO1FBRTdDLEtBQUksQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7SUFDekQsQ0FBQztJQUVNLGtDQUFNLEdBQWI7UUFDSSxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDeEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNuRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQztZQUNuRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMs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QUNMO0lBQ0wsQ0FBQztJQUVNLG1DQUFPLEdBQWQ7UUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN2QixVQUFVLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRU0sbUNBQU8sR0FBZDtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFTywyQ0FBZSxHQUF2QjtRQUFBLGlCQWNDO1FBYkcsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDekI7O2VBRUc7WUFDSCxVQUFVLENBQUM7Z0JBQ1AsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQztvQkFDeEIsV0FBVyxFQUFFLEVBQUU7b0JBQ2YsU0FBUyxFQUFFLEVBQUU7b0JBQ2IsU0FBUyxFQUFFLEVBQUU7b0JBQ2IsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ1g7SUFDTCxDQUFDO0lBQ0wsd0JBQUM7QUFBRCxDQUFDLEFBdElELENBQXVDLGNBQWMsR0FzSXBEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3dpcGVBbmltYXRpb24gfSBmcm9tICdAc3dpcGV5JztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQW5pbWF0aW9uVHlwZSwgTGVmdFBhbmVsRGlyZWN0aXZlIH0gZnJvbSAnLi9sZWZ0LXBhbmVsLmRpcmVjdGl2ZSc7XG5cbmV4cG9ydCBjbGFzcyBMZWZ0UGFuZWxBbmltYXRvciBleHRlbmRzIFN3aXBlQW5pbWF0aW9uIHtcbiAgICBwcml2YXRlIF8kYW5pbWF0ZWRFbGVtZW50cztcbiAgICBwcml2YXRlIF9leHBhbmRlZDogYm9vbGVhbjtcbiAgICBwcml2YXRlIF9sZWZ0UGFuZWxXaWR0aDogbnVtYmVyO1xuICAgIHByaXZhdGUgX21heFg6IG51bWJlcjtcbiAgICBwcml2YXRlIF9wYWdlQ29udGFpbmVyV2lkdGg6IG51bWJlcjtcbiAgICBwcml2YXRlIF93aWR0aDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBsZWZ0UGFuZWw6IExlZnRQYW5lbERpcmVjdGl2ZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmluaXQodGhpcy5sZWZ0UGFuZWwuJGVsZSwgdGhpcy5sZWZ0UGFuZWwuJHBhZ2UpO1xuICAgIH1cblxuICAgIHB1YmxpYyBib3VuZHMoKToge30ge1xuICAgICAgICBsZXQgb2Zmc2V0ID0gMDtcbiAgICAgICAgdGhpcy5zZXRHZXN0dXJlc0VuYWJsZWQodGhpcy5sZWZ0UGFuZWwuaXNHZXN0dXJlc0VuYWJsZWQoKSk7XG4gICAgICAgIGlmICghdGhpcy5fd2lkdGgpIHtcbiAgICAgICAgICAgIHRoaXMuX3BhZ2VDb250YWluZXJXaWR0aCA9IHRoaXMubGVmdFBhbmVsLiRwYWdlLndpZHRoKCk7XG4gICAgICAgICAgICB0aGlzLl9sZWZ0UGFuZWxXaWR0aCA9IHRoaXMubGVmdFBhbmVsLiRlbGUud2lkdGgoKTtcbiAgICAgICAgICAgIHRoaXMuX21heFggPSB0aGlzLl9sZWZ0UGFuZWxXaWR0aCAvIHRoaXMuX3BhZ2VDb250YWluZXJXaWR0aCAqIDEwMDtcbiAgICAgICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5sZWZ0UGFuZWwuYW5pbWF0aW9uID09PSBBbmltYXRpb25UeXBlLlNMSURFX0lOID8gdGhpcy5fcGFnZUNvbnRhaW5lcldpZHRoIDogdGhpcy5fbGVmdFBhbmVsV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZXhwYW5kZWQgPSB0aGlzLmxlZnRQYW5lbC5leHBhbmRlZDtcblxuICAgICAgICBpZiAodGhpcy5fZXhwYW5kZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2NlbnRlcic6IHRoaXMuX2xlZnRQYW5lbFdpZHRoLFxuICAgICAgICAgICAgICAgICdsb3dlcic6IC0odGhpcy5fbGVmdFBhbmVsV2lkdGggLSBvZmZzZXQpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxlZnRQYW5lbC5hcHAuaXNUYWJsZXRBcHBsaWNhdGlvblR5cGUpIHtcbiAgICAgICAgICAgIG9mZnNldCA9IDUzLjMyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnY2VudGVyJzogMCxcbiAgICAgICAgICAgICd1cHBlcic6IHRoaXMuX2xlZnRQYW5lbFdpZHRoIC0gb2Zmc2V0XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGNvbnRleHQoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndyc6IHRoaXMuX3dpZHRoLFxuICAgICAgICAgICAgJ3BhZ2VXJzogdGhpcy5fcGFnZUNvbnRhaW5lcldpZHRoLFxuICAgICAgICAgICAgJ2xlZnRXJzogdGhpcy5fbGVmdFBhbmVsV2lkdGgsXG4gICAgICAgICAgICAnbWF4WCc6IHRoaXMuX21heFgsXG4gICAgICAgICAgICAnbGltaXQnOiAobWluOiBudW1iZXIsIHY6IG51bWJlciwgbWF4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodiA8IG1pbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWluO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodiA+IG1heCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYW5pbWF0aW9uKCkge1xuICAgICAgICB0aGlzLl8kYW5pbWF0ZWRFbGVtZW50cyA9IHRoaXMubGVmdFBhbmVsLiRlbGU7XG4gICAgICAgIGlmICh0aGlzLmxlZnRQYW5lbC5hbmltYXRpb24gPT09IEFuaW1hdGlvblR5cGUuU0xJREVfSU4pIHtcbiAgICAgICAgICAgIHRoaXMuXyRhbmltYXRlZEVsZW1lbnRzID0gdGhpcy5fJGFuaW1hdGVkRWxlbWVudHMuYWRkKHRoaXMubGVmdFBhbmVsLiRwYWdlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmxlZnRQYW5lbC5hcHAuaXNUYWJsZXRBcHBsaWNhdGlvblR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAndGFyZ2V0JzogdGhpcy5sZWZ0UGFuZWwuJGVsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdjc3MnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RyYW5zZm9ybSc6ICd0cmFuc2xhdGUzZCgke3sgbGltaXQoLTEwMCwgLSgkZCAqIDEwMCAvIGxlZnRXKSwgMCkgKyBcXCclXFwnIH19LCAwLCAwKSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3RhcmdldCc6IHRoaXMubGVmdFBhbmVsLiRwYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Nzcyc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAndHJhbnNmb3JtJzogJ3RyYW5zbGF0ZTNkKCR7eyAoKCRkKSAqIDEwMCAvIHBhZ2VXKSArIFxcJyVcXCcgfX0sIDAsIDApJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnd2lkdGgnOiAnJHt7IChwYWdlVyAtICRkKSArIFxcJ3B4XFwnIH19JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnei1pbmRleCc6IDEwMVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAndGFyZ2V0JzogdGhpcy5sZWZ0UGFuZWwuJGVsZSxcbiAgICAgICAgICAgICAgICAgICAgJ2Nzcyc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd0cmFuc2Zvcm0nOiAndHJhbnNsYXRlM2QoLTEwMCUsIDAsIDApJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdvcGFjaXR5JzogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd6LWluZGV4JzogMTAxXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgJ3RhcmdldCc6IHRoaXMubGVmdFBhbmVsLiRwYWdlLFxuICAgICAgICAgICAgICAgICAgICAnY3NzJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3RyYW5zZm9ybSc6ICd0cmFuc2xhdGUzZCgke3sgbGltaXQoIDAsICgoKCREICsgJGQpICogMTAwIC8gdykpLCBtYXhYICkgKyBcXCclXFwnIH19LCAwLCAwKScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnb3BhY2l0eSc6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAnei1pbmRleCc6IDEwMVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICd0cmFuc2Zvcm0nOiAndHJhbnNsYXRlM2QoJHt7IGxpbWl0KCAtMTAwLCAoKCgkRCArICRkKSAqIDEwMCAvIHcpIC0gMTAwKSwgMCApICsgXFwnJVxcJ319LCAwLCAwKScsXG4gICAgICAgICAgICAgICAgJ29wYWNpdHknOiAxLFxuICAgICAgICAgICAgICAgICd6LWluZGV4JzogMTAxXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG9uTG93ZXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2V4cGFuZGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGVmdFBhbmVsLmNvbGxhcHNlKCk7XG4gICAgICAgIHRoaXMucmVzZXRUcmFuc2l0aW9uKCk7XG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25VcHBlcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZXhwYW5kZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmxlZnRQYW5lbC5leHBhbmQoKTtcbiAgICAgICAgdGhpcy5yZXNldFRyYW5zaXRpb24oKTtcbiAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVzZXRUcmFuc2l0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fJGFuaW1hdGVkRWxlbWVudHMpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiBUaGlzIHRpbWVvdXQgaXMgZm9yIHByZXZlbnRpbmcgVUkgZmxpY2tlciBhdCB0aGUgZW5kIG9mIGFuaW1hdGlvbi5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fJGFuaW1hdGVkRWxlbWVudHMuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgJ3RyYW5zZm9ybSc6ICcnLFxuICAgICAgICAgICAgICAgICAgICAnb3BhY2l0eSc6ICcnLFxuICAgICAgICAgICAgICAgICAgICAnei1pbmRleCc6ICcnLFxuICAgICAgICAgICAgICAgICAgICAnd2lkdGgnOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==