import * as tslib_1 from "tslib";
import { SwipeAnimation } from '@swipey';
var CarouselAnimator = /** @class */ (function (_super) {
    tslib_1.__extends(CarouselAnimator, _super);
    function CarouselAnimator(carousel, interval, ngZone) {
        var _this = _super.call(this) || this;
        _this.carousel = carousel;
        _this.interval = interval;
        _this.ngZone = ngZone;
        _this._activeIndex = 0;
        _this._animationPaused = false;
        _this._pauseCaroselTill = 0;
        _this._oldIndex = 0;
        var self = _this;
        _this._$el = $(_this.carousel.getNativeElement()).find('>.carousel');
        _this.init(_this._$el.find('>.carousel-inner'));
        _this._items = _this._$el.find('>.carousel-inner >.carousel-item');
        _this._indicators = _this._$el.find('>.carousel-indicators');
        _this._indicators.find('li').each(function (i) {
            $(this).on('click', function () {
                self._activeIndex = i;
                self.setActiveItem();
            });
        });
        _this._$el.find('>.left.carousel-control').on('click', function () {
            _this._pauseCaroselTill = Date.now() + _this.interval;
            _this.goToUpper();
        });
        _this._$el.find('>.right.carousel-control').on('click', function () {
            _this._pauseCaroselTill = Date.now() + _this.interval;
            _this.goToLower();
        });
        _this.setActiveItem();
        if (_this.interval) {
            _this.start();
        }
        return _this;
    }
    CarouselAnimator.prototype.bounds = function () {
        this._width = this._items.width();
        this._swiping = true;
        return {
            'lower': -this._width,
            'center': 0,
            'upper': this._width
        };
    };
    CarouselAnimator.prototype.context = function () {
        return {
            'w': this._width
        };
    };
    CarouselAnimator.prototype.animation = function () {
        return [{
                'target': this.getTarget.bind(this),
                'css': {
                    'transform': 'translate3d(${{ (($D + $d) / w) * 100 + \'%\'}}, 0, 0)',
                    '-webkit-transform': 'translate3d(${{ (($D + $d) / w) * 100 + \'%\'}}, 0, 0)'
                }
            }];
    };
    CarouselAnimator.prototype.onUpper = function () {
        this.resetTransition();
        this._activeIndex -= 1;
        this.setActiveItem();
        this._swiping = false;
    };
    CarouselAnimator.prototype.onLower = function () {
        this.resetTransition();
        this._activeIndex += 1;
        this.setActiveItem();
        this._swiping = false;
    };
    CarouselAnimator.prototype.onAnimation = function () {
        var newIndex = (this._items.length + this._activeIndex) % this._items.length;
        this.carousel.onChangeCB(newIndex, this._oldIndex);
        this._oldIndex = newIndex;
    };
    CarouselAnimator.prototype.start = function () {
        var _this = this;
        this.ngZone.runOutsideAngular(function () {
            _this._intervalId = setInterval(function () {
                if (!_this._swiping && _this._pauseCaroselTill < Date.now()) {
                    _this.goToLower(600);
                }
            }, _this.interval);
        });
    };
    CarouselAnimator.prototype.pause = function () {
        this._animationPaused = true;
        if (!this._intervalId) {
            this.start();
        }
    };
    CarouselAnimator.prototype.resume = function () {
        this._animationPaused = false;
    };
    CarouselAnimator.prototype.stop = function () {
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = 0;
        }
    };
    CarouselAnimator.prototype.threshold = function () {
        return 5;
    };
    // Returns multiple elements as single jQuery element.
    CarouselAnimator.prototype.getTarget = function () {
        var noOfItems = this._items.length, activeItem = this._items.eq((noOfItems + this._activeIndex) % noOfItems), leftItem = this._items.eq((noOfItems + this._activeIndex - 1) % noOfItems), rightItem = this._items.eq((noOfItems + this._activeIndex + 1) % noOfItems);
        return activeItem.add(rightItem).add(leftItem);
    };
    CarouselAnimator.prototype.resetTransition = function () {
        this.getTarget().css({
            '-webkit-transition': 'none',
            '-webkit-transform': '',
            'transition': 'none',
            'transform': ''
        });
    };
    // Sets active item, leftItem, rightItem by removing / adding respective classes.
    CarouselAnimator.prototype.setActiveItem = function () {
        var items = this._items, left = this._activeIndex - 1, right = this._activeIndex + 1;
        // if there is only one carousel-item then there won't be any right or left-item.
        if (items.length === 1) {
            items.eq(0).removeClass('left-item right-item');
            return;
        }
        this._indicators.find('>.active').removeClass('active');
        this._indicators.find('> li').eq((items.length + this._activeIndex) % items.length).addClass('active');
        items.filter('.active').removeClass('active');
        items.addClass('left-item');
        items.eq((items.length + left) % items.length).addClass('left-item').removeClass('right-item');
        items.eq((items.length + this._activeIndex) % items.length).removeClass('left-item right-item').addClass('active');
        items.eq((items.length + right) % items.length).addClass('right-item').removeClass('left-item');
    };
    return CarouselAnimator;
}(SwipeAnimation));
export { CarouselAnimator };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Fyb3VzZWwuYW5pbWF0b3IuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2Nhcm91c2VsL2Nhcm91c2VsLmFuaW1hdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBTXpDO0lBQXNDLDRDQUFjO0lBYWhELDBCQUEyQixRQUEyQixFQUFVLFFBQWdCLEVBQVUsTUFBYztRQUF4RyxZQUNJLGlCQUFPLFNBd0JWO1FBekIwQixjQUFRLEdBQVIsUUFBUSxDQUFtQjtRQUFVLGNBQVEsR0FBUixRQUFRLENBQVE7UUFBVSxZQUFNLEdBQU4sTUFBTSxDQUFRO1FBVmhHLGtCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLHNCQUFnQixHQUFHLEtBQUssQ0FBQztRQUl6Qix1QkFBaUIsR0FBRyxDQUFDLENBQUM7UUFHdEIsZUFBUyxHQUFHLENBQUMsQ0FBQztRQUlsQixJQUFNLElBQUksR0FBRyxLQUFJLENBQUM7UUFDbEIsS0FBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25FLEtBQUksQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQzlDLEtBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUNqRSxLQUFJLENBQUMsV0FBVyxHQUFHLEtBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDM0QsS0FBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztZ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QUMsU0FBUyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDNUIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0YsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkgsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDcEcsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0FBQyxBQTlKRCxDQUFzQyxjQUFjLEdBOEpuRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nWm9uZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBTd2lwZUFuaW1hdGlvbiB9IGZyb20gJ0Bzd2lwZXknO1xuXG5pbXBvcnQgeyBDYXJvdXNlbERpcmVjdGl2ZSB9IGZyb20gJy4vY2Fyb3VzZWwuZGlyZWN0aXZlJztcblxuZGVjbGFyZSBjb25zdCAkO1xuXG5leHBvcnQgY2xhc3MgQ2Fyb3VzZWxBbmltYXRvciBleHRlbmRzIFN3aXBlQW5pbWF0aW9uIHtcblxuICAgIHByaXZhdGUgXyRlbDtcbiAgICBwcml2YXRlIF9hY3RpdmVJbmRleCA9IDA7XG4gICAgcHJpdmF0ZSBfYW5pbWF0aW9uUGF1c2VkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfaW5kaWNhdG9ycztcbiAgICBwcml2YXRlIF9pdGVtcztcbiAgICBwcml2YXRlIF9pbnRlcnZhbElkO1xuICAgIHByaXZhdGUgX3BhdXNlQ2Fyb3NlbFRpbGwgPSAwO1xuICAgIHByaXZhdGUgX3N3aXBpbmc7XG4gICAgcHJpdmF0ZSBfd2lkdGg7XG4gICAgcHJpdmF0ZSBfb2xkSW5kZXggPSAwO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHByaXZhdGUgY2Fyb3VzZWw6IENhcm91c2VsRGlyZWN0aXZlLCBwcml2YXRlIGludGVydmFsOiBudW1iZXIsIHByaXZhdGUgbmdab25lOiBOZ1pvbmUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuXyRlbCA9ICQodGhpcy5jYXJvdXNlbC5nZXROYXRpdmVFbGVtZW50KCkpLmZpbmQoJz4uY2Fyb3VzZWwnKTtcbiAgICAgICAgdGhpcy5pbml0KHRoaXMuXyRlbC5maW5kKCc+LmNhcm91c2VsLWlubmVyJykpO1xuICAgICAgICB0aGlzLl9pdGVtcyA9IHRoaXMuXyRlbC5maW5kKCc+LmNhcm91c2VsLWlubmVyID4uY2Fyb3VzZWwtaXRlbScpO1xuICAgICAgICB0aGlzLl9pbmRpY2F0b3JzID0gdGhpcy5fJGVsLmZpbmQoJz4uY2Fyb3VzZWwtaW5kaWNhdG9ycycpO1xuICAgICAgICB0aGlzLl9pbmRpY2F0b3JzLmZpbmQoJ2xpJykuZWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgJCh0aGlzKS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5fYWN0aXZlSW5kZXggPSBpO1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0QWN0aXZlSXRlbSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl8kZWwuZmluZCgnPi5sZWZ0LmNhcm91c2VsLWNvbnRyb2wnKS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9wYXVzZUNhcm9zZWxUaWxsID0gRGF0ZS5ub3coKSArIHRoaXMuaW50ZXJ2YWw7XG4gICAgICAgICAgICB0aGlzLmdvVG9VcHBlcigpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fJGVsLmZpbmQoJz4ucmlnaHQuY2Fyb3VzZWwtY29udHJvbCcpLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3BhdXNlQ2Fyb3NlbFRpbGwgPSBEYXRlLm5vdygpICsgdGhpcy5pbnRlcnZhbDtcbiAgICAgICAgICAgIHRoaXMuZ29Ub0xvd2VyKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oKTtcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBib3VuZHMoKSB7XG4gICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5faXRlbXMud2lkdGgoKTtcbiAgICAgICAgdGhpcy5fc3dpcGluZyA9IHRydWU7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnbG93ZXInOiAtdGhpcy5fd2lkdGgsXG4gICAgICAgICAgICAnY2VudGVyJzogMCxcbiAgICAgICAgICAgICd1cHBlcic6IHRoaXMuX3dpZHRoXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGNvbnRleHQoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndyc6IHRoaXMuX3dpZHRoXG4gICAgICAgIH07XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgYW5pbWF0aW9uKCkge1xuICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICd0YXJnZXQnOiB0aGlzLmdldFRhcmdldC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgJ2Nzcyc6IHtcbiAgICAgICAgICAgICAgICAndHJhbnNmb3JtJzogJ3RyYW5zbGF0ZTNkKCR7eyAoKCREICsgJGQpIC8gdykgKiAxMDAgKyBcXCclXFwnfX0sIDAsIDApJyxcbiAgICAgICAgICAgICAgICAnLXdlYmtpdC10cmFuc2Zvcm0nOiAndHJhbnNsYXRlM2QoJHt7ICgoJEQgKyAkZCkgLyB3KSAqIDEwMCArIFxcJyVcXCd9fSwgMCwgMCknXG4gICAgICAgICAgICB9XG4gICAgICAgIH1dO1xuICAgIH1cblxuICAgIHB1YmxpYyBvblVwcGVyKCkge1xuICAgICAgICB0aGlzLnJlc2V0VHJhbnNpdGlvbigpO1xuICAgICAgICB0aGlzLl9hY3RpdmVJbmRleCAtPSAxO1xuICAgICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oKTtcbiAgICAgICAgdGhpcy5fc3dpcGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBvbkxvd2VyKCkge1xuICAgICAgICB0aGlzLnJlc2V0VHJhbnNpdGlvbigpO1xuICAgICAgICB0aGlzLl9hY3RpdmVJbmRleCArPSAxO1xuICAgICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oKTtcbiAgICAgICAgdGhpcy5fc3dpcGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBvbkFuaW1hdGlvbigpIHtcbiAgICAgICAgY29uc3QgbmV3SW5kZXggPSAodGhpcy5faXRlbXMubGVuZ3RoICsgdGhpcy5fYWN0aXZlSW5kZXgpICUgdGhpcy5faXRlbXMubGVuZ3RoO1xuICAgICAgICB0aGlzLmNhcm91c2VsLm9uQ2hhbmdlQ0IobmV3SW5kZXgsIHRoaXMuX29sZEluZGV4KTtcbiAgICAgICAgdGhpcy5fb2xkSW5kZXggPSBuZXdJbmRleDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2ludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9zd2lwaW5nICYmIHRoaXMuX3BhdXNlQ2Fyb3NlbFRpbGwgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ29Ub0xvd2VyKDYwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcy5pbnRlcnZhbCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBwYXVzZSgpIHtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uUGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgaWYgKCF0aGlzLl9pbnRlcnZhbElkKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVzdW1lKCkge1xuICAgICAgICB0aGlzLl9hbmltYXRpb25QYXVzZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RvcCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2ludGVydmFsSWQpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5faW50ZXJ2YWxJZCk7XG4gICAgICAgICAgICB0aGlzLl9pbnRlcnZhbElkID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyB0aHJlc2hvbGQoKSB7XG4gICAgICAgIHJldHVybiA1O1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgbXVsdGlwbGUgZWxlbWVudHMgYXMgc2luZ2xlIGpRdWVyeSBlbGVtZW50LlxuICAgIHByaXZhdGUgZ2V0VGFyZ2V0KCkge1xuICAgICAgICBjb25zdCBub09mSXRlbXMgPSB0aGlzLl9pdGVtcy5sZW5ndGgsXG4gICAgICAgICAgICBhY3RpdmVJdGVtID0gdGhpcy5faXRlbXMuZXEoKG5vT2ZJdGVtcyArIHRoaXMuX2FjdGl2ZUluZGV4KSAlIG5vT2ZJdGVtcyksXG4gICAgICAgICAgICBsZWZ0SXRlbSA9IHRoaXMuX2l0ZW1zLmVxKChub09mSXRlbXMgKyB0aGlzLl9hY3RpdmVJbmRleCAtIDEpICUgbm9PZkl0ZW1zKSxcbiAgICAgICAgICAgIHJpZ2h0SXRlbSA9IHRoaXMuX2l0ZW1zLmVxKChub09mSXRlbXMgKyB0aGlzLl9hY3RpdmVJbmRleCArIDEpICUgbm9PZkl0ZW1zKTtcbiAgICAgICAgcmV0dXJuIGFjdGl2ZUl0ZW0uYWRkKHJpZ2h0SXRlbSkuYWRkKGxlZnRJdGVtKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2V0VHJhbnNpdGlvbigpIHtcbiAgICAgICAgdGhpcy5nZXRUYXJnZXQoKS5jc3Moe1xuICAgICAgICAgICAgJy13ZWJraXQtdHJhbnNpdGlvbic6ICdub25lJyxcbiAgICAgICAgICAgICctd2Via2l0LXRyYW5zZm9ybSc6ICcnLFxuICAgICAgICAgICAgJ3RyYW5zaXRpb24nOiAnbm9uZScsXG4gICAgICAgICAgICAndHJhbnNmb3JtJzogJydcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gU2V0cyBhY3RpdmUgaXRlbSwgbGVmdEl0ZW0sIHJpZ2h0SXRlbSBieSByZW1vdmluZyAvIGFkZGluZyByZXNwZWN0aXZlIGNsYXNzZXMuXG4gICAgcHJpdmF0ZSBzZXRBY3RpdmVJdGVtKCkge1xuICAgICAgICBjb25zdCBpdGVtcyA9IHRoaXMuX2l0ZW1zLFxuICAgICAgICAgICAgbGVmdCA9IHRoaXMuX2FjdGl2ZUluZGV4IC0gMSxcbiAgICAgICAgICAgIHJpZ2h0ID0gdGhpcy5fYWN0aXZlSW5kZXggKyAxO1xuICAgICAgICAvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSBjYXJvdXNlbC1pdGVtIHRoZW4gdGhlcmUgd29uJ3QgYmUgYW55IHJpZ2h0IG9yIGxlZnQtaXRlbS5cbiAgICAgICAgaWYgKGl0ZW1zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgaXRlbXMuZXEoMCkucmVtb3ZlQ2xhc3MoJ2xlZnQtaXRlbSByaWdodC1pdGVtJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pbmRpY2F0b3JzLmZpbmQoJz4uYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB0aGlzLl9pbmRpY2F0b3JzLmZpbmQoJz4gbGknKS5lcSgoaXRlbXMubGVuZ3RoICsgdGhpcy5fYWN0aXZlSW5kZXgpICUgaXRlbXMubGVuZ3RoKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cblxuICAgICAgICBpdGVtcy5maWx0ZXIoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIGl0ZW1zLmFkZENsYXNzKCdsZWZ0LWl0ZW0nKTtcbiAgICAgICAgaXRlbXMuZXEoKGl0ZW1zLmxlbmd0aCArIGxlZnQpICUgaXRlbXMubGVuZ3RoKS5hZGRDbGFzcygnbGVmdC1pdGVtJykucmVtb3ZlQ2xhc3MoJ3JpZ2h0LWl0ZW0nKTtcbiAgICAgICAgaXRlbXMuZXEoKGl0ZW1zLmxlbmd0aCArIHRoaXMuX2FjdGl2ZUluZGV4KSAlIGl0ZW1zLmxlbmd0aCkucmVtb3ZlQ2xhc3MoJ2xlZnQtaXRlbSByaWdodC1pdGVtJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICBpdGVtcy5lcSgoaXRlbXMubGVuZ3RoICsgcmlnaHQpICUgaXRlbXMubGVuZ3RoKS5hZGRDbGFzcygncmlnaHQtaXRlbScpLnJlbW92ZUNsYXNzKCdsZWZ0LWl0ZW0nKTtcbiAgICB9XG59XG4iXX0=