import * as tslib_1 from "tslib";
import { SwipeAnimation } from '@swipey';
var ListAnimator = /** @class */ (function (_super) {
    tslib_1.__extends(ListAnimator, _super);
    function ListAnimator(list) {
        var _this = _super.call(this) || this;
        _this.list = list;
        _this.$el = $(_this.list.getNativeElement()).find('ul.app-livelist-container:first');
        _this.leftChildrenCount = _this.$el.find('>.app-list-item-left-action-panel > button:visible').length;
        _this.rightChildrenCount = _this.$el.find('>.app-list-item-right-action-panel > button:visible').length;
        // when there are no children in both the templates then do not apply swipeAnimation;
        if (!_this.leftChildrenCount && !_this.rightChildrenCount) {
            return _this;
        }
        // initialise swipe animation on the list component.
        _this.init(_this.$el);
        // retrieves all the button components which are placed outside the listTemplate.
        _this.$btnSubscription = _this.list.btnComponents.changes.subscribe(function (items) { return _this.actionItems = items; });
        return _this;
    }
    // This method sets the css for left or right action panels based on the template. Appends the actionTemplate before li.
    ListAnimator.prototype.createActionPanel = function (li, actionPanelTemplate) {
        actionPanelTemplate.css({
            width: li.outerWidth() + 'px',
            height: li.outerHeight() + 'px',
            marginBottom: -1 * li.outerHeight() + 'px',
            float: 'left',
            padding: 0
        });
        return actionPanelTemplate.insertBefore(li);
    };
    // Returns the total width occupied by all the children inside the element
    ListAnimator.prototype.computeTotalChildrenWidth = function ($ele) {
        return _.reduce($ele.children(), function (totalWidth, el) {
            return totalWidth + $(el).outerWidth();
        }, 0);
    };
    // Returns amount of transition to be applied on element when swiped left or right
    ListAnimator.prototype.computeTransitionProportions = function ($ele) {
        var totalWidth = this.computeTotalChildrenWidth($ele);
        var reverse = this.position === 'right';
        var d = 0;
        return _.map($ele.children(), function (e) {
            var f = (totalWidth - d) / totalWidth;
            d += $(e).outerWidth();
            return reverse ? f : (d / totalWidth);
        });
    };
    // Resets the transform applied on the element.
    ListAnimator.prototype.resetElement = function (el) {
        if (el) {
            el.css({
                transform: 'none',
                transition: 'none'
            });
        }
    };
    ListAnimator.prototype.resetState = function () {
        this.resetElement(this.li);
        this.resetElement(this.actionPanel);
        if (this.actionPanel) {
            this.actionPanel = null;
        }
    };
    // Returns the target button (child element) inside the left and right actionPanels.
    ListAnimator.prototype.getChildActionElement = function (actionTemplate) {
        if (actionTemplate.children().length) {
            if (this.position === 'left') {
                return actionTemplate.children().first();
            }
            return actionTemplate.children().last();
        }
    };
    // create the actionPanels and set the background-color for remaining panel as that of first child element
    // calculates the children's width and its transition proportionates.
    ListAnimator.prototype.initActionPanel = function (actionTemplate) {
        this.actionPanel = this.createActionPanel(this.li, actionTemplate);
        this.actionPanel.css({
            backgroundColor: this.getChildActionElement(this.actionPanel).css('background-color')
        });
        this.limit = this.computeTotalChildrenWidth(this.actionPanel);
        this.transitionProportions = this.computeTransitionProportions(this.actionPanel);
    };
    ListAnimator.prototype.bounds = function (e, $d) {
        var target = $(e.target).closest('li');
        // default bounds when action template markup is not available.
        var bounds = {
            strictUpper: true,
            strictLower: true,
            lower: 0,
            center: 0,
            upper: 0
        };
        // apply swipe animation only on list items having "app-list-item" class.
        if (!target.hasClass('app-list-item')) {
            return bounds;
        }
        if (!this.li || this.li[0] !== target[0]) {
            var selector = $d > 0 ? '.app-list-item-left-action-panel' : '.app-list-item-right-action-panel';
            var actionTemplate = this.$el.find('>' + selector);
            // when groupby is set select the action panel from the list group items.
            if (!actionTemplate.length && this.list.groupby) {
                selector = 'li > ul.list-group >' + selector;
                actionTemplate = this.$el.find('>' + selector);
            }
            // check for children visiblity. If children are visible then initiate the action panel.
            if (!actionTemplate.length || !actionTemplate.find('button:visible').length) {
                return bounds;
            }
            this.resetState();
            this.li = target;
            this.position = actionTemplate.attr('position');
            this.initActionPanel(actionTemplate);
            if ($d > 0) {
                // bounds while swiping from right to left to open left action panel. It can be moved upto limit value (Upper bound).
                bounds = {
                    strictUpper: false,
                    lower: 0,
                    center: 0,
                    upper: this.limit
                };
            }
            else {
                // bounds while swiping from left to right to open right action panel. It can be moved in reverse direction with -limit value (lower bound).
                bounds = {
                    strictLower: false,
                    lower: -this.limit,
                    center: 0,
                    upper: 0
                };
            }
        }
        else if (this.position === 'left') {
            // when left action panel is visible (i.e. center at limit value) then this can be moved by distance (limit) in reverse direction to close the view.
            bounds = {
                strictUpper: false,
                lower: -this.limit,
                center: this.limit
            };
        }
        else if (this.position === 'right') {
            // when right action panel is visible (i.e. center at -limit value) then this can be moved by distance (limit) to close the view.
            bounds = {
                center: -this.limit,
                upper: this.limit,
                strictLower: false
            };
        }
        return bounds;
    };
    ListAnimator.prototype.context = function () {
        var _this = this;
        return {
            computeActionTransition: function (index, $d) {
                var sign = $d > 0 ? 1 : -1;
                if (sign * $d > _this.limit) {
                    // once the distance swiped is beyond the limit, then calculate the proportionate distance moved after the limit value.
                    return ($d - sign * _this.limit) + (_this.transitionProportions[index] * sign * _this.limit);
                }
                return _this.transitionProportions[index] * $d;
            }
        };
    };
    ListAnimator.prototype.animation = function () {
        var _this = this;
        return [{
                target: function () { return _this.li; },
                css: {
                    transform: 'translate3d(${{$D + $d}}px, 0, 0)'
                }
            }, {
                target: function () { return (_this.actionPanel && _this.actionPanel.children()); },
                css: {
                    transform: 'translate3d(${{computeActionTransition($i, $D + $d)}}px, 0, 0)'
                }
            }];
    };
    // Triggers full swipe event on the target element.
    ListAnimator.prototype.invokeFullSwipeEvt = function ($event) {
        var target, actions, index;
        // Check if button are visible or not, invoke the tap event of the last button which is visible.
        if (this.position === 'left') {
            actions = this.actionItems.filter(function (btn) {
                return btn.getAttr('swipe-position') === 'left' && btn.$element.is(':visible');
            });
            index = 0;
        }
        else {
            actions = this.actionItems.filter(function (btn) {
                return btn.getAttr('swipe-position') === 'right' && btn.$element.is(':visible');
            });
            index = actions.length - 1;
        }
        target = actions[index];
        if (target && target.hasEventCallback('tap')) {
            target.invokeEventCallback('tap', { $event: $event });
        }
        this.resetState();
        this.li = null;
    };
    // Called when swipeEnd is triggered. d contains the total distance covered by the element until touchEnd.
    ListAnimator.prototype.onAnimation = function ($event, d) {
        // set the selecteditem on the list component on swipe.
        this.list.triggerListItemSelection(this.li, $event);
        if (this.actionPanel && this.actionPanel.attr('enablefullswipe') === 'true') {
            var sign = d > 0 ? 1 : -1;
            var $el = this.getChildActionElement(this.actionPanel);
            if ($el) {
                var index = this.position === 'right' ? this.rightChildrenCount - 1 : 0;
                // proportionate amount of distance covered by the target element.
                var distPercentage = this.transitionProportions[index] * sign * d * 100 / (this.li.outerWidth() - this.limit + $el.width());
                // If distance travelled by the target button element is more than 50% of the list item width then invoke the fullswipe.
                if (distPercentage > 50) {
                    // invoke fullswipe event
                    this.invokeFullSwipeEvt($event);
                }
            }
        }
    };
    ListAnimator.prototype.onLower = function () {
        if (this.position === 'left') {
            this.resetState();
            this.li = null;
        }
    };
    ListAnimator.prototype.onUpper = function () {
        if (this.position === 'right') {
            this.resetState();
            this.li = null;
        }
    };
    ListAnimator.prototype.threshold = function () {
        return 10;
    };
    return ListAnimator;
}(SwipeAnimation));
export { ListAnimator };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5hbmltYXRvci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbGlzdC9saXN0LmFuaW1hdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFHQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBT3pDO0lBQWtDLHdDQUFjO0lBWTVDLHNCQUFvQixJQUFtQjtRQUF2QyxZQUNJLGlCQUFPLFNBZ0JWO1FBakJtQixVQUFJLEdBQUosSUFBSSxDQUFlO1FBRW5DLEtBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBRW5GLEtBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxvREFBb0QsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNwRyxLQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscURBQXFELENBQUMsQ0FBQyxNQUFNLENBQUM7UUFFdEcscUZBQXFGO1FBQ3JGLElBQUksQ0FBQyxLQUFJLENBQUMsaUJBQWlCLElBQUksQ0FBQyxLQUFJLENBQUMsa0JBQWtCLEVBQUU7O1NBRXhEO1FBRUQsb0RBQW9EO1FBQ3BELEtBQUksQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXBCLGlGQUFpRjtRQUNqRixLQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxFQUF4QixDQUF3QixDQUFDLENBQUM7O0lBQ3pHLENBQUM7SUFFRCx3SEFBd0g7SUFDaEgsd0NBQWlCLEdBQXpC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LENBQUM7aUJBQ25DO2FBQ0o7U0FDSjtJQUNMLENBQUM7SUFFTSw4QkFBTyxHQUFkO1FBQ0ksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLE1BQU0sRUFBRTtZQUMxQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7U0FDbEI7SUFDTCxDQUFDO0lBRU0sOEJBQU8sR0FBZDtRQUNJLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxPQUFPLEVBQUU7WUFDM0IsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO1NBQ2xCO0lBQ0wsQ0FBQztJQUVNLGdDQUFTLEdBQWhCO1FBQ0ksT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQUFDLEFBclFELENBQWtDLGNBQWMsR0FxUS9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUXVlcnlMaXN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgU3dpcGVBbmltYXRpb24gfSBmcm9tICdAc3dpcGV5JztcblxuaW1wb3J0IHsgTGlzdENvbXBvbmVudCB9IGZyb20gJy4vbGlzdC5jb21wb25lbnQnO1xuaW1wb3J0IHsgQnV0dG9uQ29tcG9uZW50IH0gZnJvbSAnLi4vYnV0dG9uL2J1dHRvbi5jb21wb25lbnQnO1xuXG5kZWNsYXJlICBjb25zdCBfLCAkO1xuXG5leHBvcnQgY2xhc3MgTGlzdEFuaW1hdG9yIGV4dGVuZHMgU3dpcGVBbmltYXRpb24ge1xuICAgIHByaXZhdGUgJGVsOiBKUXVlcnk8SFRNTEVsZW1lbnQ+O1xuICAgIHByaXZhdGUgbGk6IEpRdWVyeTxIVE1MRWxlbWVudD47XG4gICAgcHJpdmF0ZSBsaW1pdDogbnVtYmVyO1xuICAgIHByaXZhdGUgdHJhbnNpdGlvblByb3BvcnRpb25zOiBhbnk7XG4gICAgcHJpdmF0ZSByaWdodENoaWxkcmVuQ291bnQ6IG51bWJlcjtcbiAgICBwcml2YXRlIGxlZnRDaGlsZHJlbkNvdW50OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBwb3NpdGlvbjogc3RyaW5nO1xuICAgIHByaXZhdGUgYWN0aW9uUGFuZWw6IEpRdWVyeTxIVE1MRWxlbWVudD47XG4gICAgcHJpdmF0ZSBhY3Rpb25JdGVtczogUXVlcnlMaXN0PEJ1dHRvbkNvbXBvbmVudD47XG4gICAgcHVibGljICRidG5TdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbGlzdDogTGlzdENvbXBvbmVudCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLiRlbCA9ICQodGhpcy5saXN0LmdldE5hdGl2ZUVsZW1lbnQoKSkuZmluZCgndWwuYXBwLWxpdmVsaXN0LWNvbnRhaW5lcjpmaXJzdCcpO1xuXG4gICAgICAgIHRoaXMubGVmdENoaWxkcmVuQ291bnQgPSB0aGlzLiRlbC5maW5kKCc+LmFwcC1saXN0LWl0ZW0tbGVmdC1hY3Rpb24tcGFuZWwgPiBidXR0b246dmlzaWJsZScpLmxlbmd0aDtcbiAgICAgICAgdGhpcy5yaWdodENoaWxkcmVuQ291bnQgPSB0aGlzLiRlbC5maW5kKCc+LmFwcC1saXN0LWl0ZW0tcmlnaHQtYWN0aW9uLXBhbmVsID4gYnV0dG9uOnZpc2libGUnKS5sZW5ndGg7XG5cbiAgICAgICAgLy8gd2hlbiB0aGVyZSBhcmUgbm8gY2hpbGRyZW4gaW4gYm90aCB0aGUgdGVtcGxhdGVzIHRoZW4gZG8gbm90IGFwcGx5IHN3aXBlQW5pbWF0aW9uO1xuICAgICAgICBpZiAoIXRoaXMubGVmdENoaWxkcmVuQ291bnQgJiYgIXRoaXMucmlnaHRDaGlsZHJlbkNvdW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpbml0aWFsaXNlIHN3aXBlIGFuaW1hdGlvbiBvbiB0aGUgbGlzdCBjb21wb25lbnQuXG4gICAgICAgIHRoaXMuaW5pdCh0aGlzLiRlbCk7XG5cbiAgICAgICAgLy8gcmV0cmlldmVzIGFsbCB0aGUgYnV0dG9uIGNvbXBvbmVudHMgd2hpY2ggYXJlIHBsYWNlZCBvdXRzaWRlIHRoZSBsaXN0VGVtcGxhdGUuXG4gICAgICAgIHRoaXMuJGJ0blN1YnNjcmlwdGlvbiA9IHRoaXMubGlzdC5idG5Db21wb25lbnRzLmNoYW5nZXMuc3Vic2NyaWJlKGl0ZW1zID0+IHRoaXMuYWN0aW9uSXRlbXMgPSBpdGVtcyk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBtZXRob2Qgc2V0cyB0aGUgY3NzIGZvciBsZWZ0IG9yIHJpZ2h0IGFjdGlvbiBwYW5lbHMgYmFzZWQgb24gdGhlIHRlbXBsYXRlLiBBcHBlbmRzIHRoZSBhY3Rpb25UZW1wbGF0ZSBiZWZvcmUgbGkuXG4gICAgcHJpdmF0ZSBjcmVhdGVBY3Rpb25QYW5lbChsaTogSlF1ZXJ5PEhUTUxFbGVtZW50PiwgYWN0aW9uUGFuZWxUZW1wbGF0ZTogSlF1ZXJ5PEhUTUxFbGVtZW50Pik6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgICAgICBhY3Rpb25QYW5lbFRlbXBsYXRlLmNzcyh7XG4gICAgICAgICAgICB3aWR0aDogbGkub3V0ZXJXaWR0aCgpICsgJ3B4JyxcbiAgICAgICAgICAgIGhlaWdodDogbGkub3V0ZXJIZWlnaHQoKSArICdweCcsXG4gICAgICAgICAgICBtYXJnaW5Cb3R0b206IC0xICogbGkub3V0ZXJIZWlnaHQoKSArICdweCcsXG4gICAgICAgICAgICBmbG9hdDogJ2xlZnQnLFxuICAgICAgICAgICAgcGFkZGluZzogMFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gYWN0aW9uUGFuZWxUZW1wbGF0ZS5pbnNlcnRCZWZvcmUobGkpO1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgdGhlIHRvdGFsIHdpZHRoIG9jY3VwaWVkIGJ5IGFsbCB0aGUgY2hpbGRyZW4gaW5zaWRlIHRoZSBlbGVtZW50XG4gICAgcHJpdmF0ZSBjb21wdXRlVG90YWxDaGlsZHJlbldpZHRoKCRlbGU6IEpRdWVyeTxIVE1MRWxlbWVudD4pOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gXy5yZWR1Y2UoJGVsZS5jaGlsZHJlbigpLCAodG90YWxXaWR0aCwgZWwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0b3RhbFdpZHRoICsgJChlbCkub3V0ZXJXaWR0aCgpO1xuICAgICAgICB9LCAwKTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm5zIGFtb3VudCBvZiB0cmFuc2l0aW9uIHRvIGJlIGFwcGxpZWQgb24gZWxlbWVudCB3aGVuIHN3aXBlZCBsZWZ0IG9yIHJpZ2h0XG4gICAgcHJpdmF0ZSBjb21wdXRlVHJhbnNpdGlvblByb3BvcnRpb25zKCRlbGU6IEpRdWVyeTxIVE1MRWxlbWVudD4pOiBudW1iZXIge1xuICAgICAgICBjb25zdCB0b3RhbFdpZHRoID0gdGhpcy5jb21wdXRlVG90YWxDaGlsZHJlbldpZHRoKCRlbGUpO1xuICAgICAgICBjb25zdCByZXZlcnNlID0gdGhpcy5wb3NpdGlvbiA9PT0gJ3JpZ2h0JztcbiAgICAgICAgbGV0IGQgPSAwO1xuICAgICAgICByZXR1cm4gXy5tYXAoJGVsZS5jaGlsZHJlbigpLCBlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGYgPSAodG90YWxXaWR0aCAtIGQpIC8gdG90YWxXaWR0aDtcbiAgICAgICAgICAgIGQgKz0gJChlKS5vdXRlcldpZHRoKCk7XG4gICAgICAgICAgICByZXR1cm4gcmV2ZXJzZSA/IGYgOiAoZCAvIHRvdGFsV2lkdGgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBSZXNldHMgdGhlIHRyYW5zZm9ybSBhcHBsaWVkIG9uIHRoZSBlbGVtZW50LlxuICAgIHByaXZhdGUgcmVzZXRFbGVtZW50KGVsOiBKUXVlcnk8SFRNTEVsZW1lbnQ+KTogdm9pZCB7XG4gICAgICAgIGlmIChlbCkge1xuICAgICAgICAgICAgZWwuY3NzKHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICdub25lJyxcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnbm9uZSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNldFN0YXRlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnJlc2V0RWxlbWVudCh0aGlzLmxpKTtcbiAgICAgICAgdGhpcy5yZXNldEVsZW1lbnQodGhpcy5hY3Rpb25QYW5lbCk7XG4gICAgICAgIGlmICh0aGlzLmFjdGlvblBhbmVsKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGlvblBhbmVsID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybnMgdGhlIHRhcmdldCBidXR0b24gKGNoaWxkIGVsZW1lbnQpIGluc2lkZSB0aGUgbGVmdCBhbmQgcmlnaHQgYWN0aW9uUGFuZWxzLlxuICAgIHByaXZhdGUgZ2V0Q2hpbGRBY3Rpb25FbGVtZW50KGFjdGlvblRlbXBsYXRlKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgICAgIGlmIChhY3Rpb25UZW1wbGF0ZS5jaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucG9zaXRpb24gPT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgICAgIHJldHVybiBhY3Rpb25UZW1wbGF0ZS5jaGlsZHJlbigpLmZpcnN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uVGVtcGxhdGUuY2hpbGRyZW4oKS5sYXN0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjcmVhdGUgdGhlIGFjdGlvblBhbmVscyBhbmQgc2V0IHRoZSBiYWNrZ3JvdW5kLWNvbG9yIGZvciByZW1haW5pbmcgcGFuZWwgYXMgdGhhdCBvZiBmaXJzdCBjaGlsZCBlbGVtZW50XG4gICAgLy8gY2FsY3VsYXRlcyB0aGUgY2hpbGRyZW4ncyB3aWR0aCBhbmQgaXRzIHRyYW5zaXRpb24gcHJvcG9ydGlvbmF0ZXMuXG4gICAgcHJpdmF0ZSBpbml0QWN0aW9uUGFuZWwoYWN0aW9uVGVtcGxhdGU6IEpRdWVyeTxIVE1MRWxlbWVudD4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hY3Rpb25QYW5lbCA9IHRoaXMuY3JlYXRlQWN0aW9uUGFuZWwodGhpcy5saSwgYWN0aW9uVGVtcGxhdGUpO1xuICAgICAgICB0aGlzLmFjdGlvblBhbmVsLmNzcyh7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuZ2V0Q2hpbGRBY3Rpb25FbGVtZW50KHRoaXMuYWN0aW9uUGFuZWwpLmNzcygnYmFja2dyb3VuZC1jb2xvcicpXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmxpbWl0ID0gdGhpcy5jb21wdXRlVG90YWxDaGlsZHJlbldpZHRoKHRoaXMuYWN0aW9uUGFuZWwpO1xuICAgICAgICB0aGlzLnRyYW5zaXRpb25Qcm9wb3J0aW9ucyA9IHRoaXMuY29tcHV0ZVRyYW5zaXRpb25Qcm9wb3J0aW9ucyh0aGlzLmFjdGlvblBhbmVsKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYm91bmRzKGU/OiBhbnksICRkPzogbnVtYmVyKTogYW55IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gJChlLnRhcmdldCkuY2xvc2VzdCgnbGknKTtcbiAgICAgICAgLy8gZGVmYXVsdCBib3VuZHMgd2hlbiBhY3Rpb24gdGVtcGxhdGUgbWFya3VwIGlzIG5vdCBhdmFpbGFibGUuXG4gICAgICAgIGxldCBib3VuZHM6IHt9ID0ge1xuICAgICAgICAgICAgc3RyaWN0VXBwZXI6IHRydWUsXG4gICAgICAgICAgICBzdHJpY3RMb3dlcjogdHJ1ZSxcbiAgICAgICAgICAgIGxvd2VyOiAwLFxuICAgICAgICAgICAgY2VudGVyOiAwLFxuICAgICAgICAgICAgdXBwZXI6IDBcbiAgICAgICAgfTtcbiAgICAgICAgLy8gYXBwbHkgc3dpcGUgYW5pbWF0aW9uIG9ubHkgb24gbGlzdCBpdGVtcyBoYXZpbmcgXCJhcHAtbGlzdC1pdGVtXCIgY2xhc3MuXG4gICAgICAgIGlmICghdGFyZ2V0Lmhhc0NsYXNzKCdhcHAtbGlzdC1pdGVtJykpIHtcbiAgICAgICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmxpIHx8IHRoaXMubGlbMF0gIT09IHRhcmdldFswXSkge1xuICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gICRkID4gMCA/ICcuYXBwLWxpc3QtaXRlbS1sZWZ0LWFjdGlvbi1wYW5lbCcgOiAnLmFwcC1saXN0LWl0ZW0tcmlnaHQtYWN0aW9uLXBhbmVsJztcbiAgICAgICAgICAgIGxldCBhY3Rpb25UZW1wbGF0ZSA9IHRoaXMuJGVsLmZpbmQoJz4nICsgc2VsZWN0b3IpO1xuXG4gICAgICAgICAgICAvLyB3aGVuIGdyb3VwYnkgaXMgc2V0IHNlbGVjdCB0aGUgYWN0aW9uIHBhbmVsIGZyb20gdGhlIGxpc3QgZ3JvdXAgaXRlbXMuXG4gICAgICAgICAgICBpZiAoIWFjdGlvblRlbXBsYXRlLmxlbmd0aCAmJiB0aGlzLmxpc3QuZ3JvdXBieSkge1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gJ2xpID4gdWwubGlzdC1ncm91cCA+JyArIHNlbGVjdG9yO1xuICAgICAgICAgICAgICAgIGFjdGlvblRlbXBsYXRlID0gdGhpcy4kZWwuZmluZCgnPicgKyBzZWxlY3Rvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIGZvciBjaGlsZHJlbiB2aXNpYmxpdHkuIElmIGNoaWxkcmVuIGFyZSB2aXNpYmxlIHRoZW4gaW5pdGlhdGUgdGhlIGFjdGlvbiBwYW5lbC5cbiAgICAgICAgICAgIGlmICghYWN0aW9uVGVtcGxhdGUubGVuZ3RoIHx8ICFhY3Rpb25UZW1wbGF0ZS5maW5kKCdidXR0b246dmlzaWJsZScpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucmVzZXRTdGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5saSA9IHRhcmdldDtcblxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGFjdGlvblRlbXBsYXRlLmF0dHIoJ3Bvc2l0aW9uJyk7XG4gICAgICAgICAgICB0aGlzLmluaXRBY3Rpb25QYW5lbChhY3Rpb25UZW1wbGF0ZSk7XG5cbiAgICAgICAgICAgIGlmICgkZCA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyBib3VuZHMgd2hpbGUgc3dpcGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQgdG8gb3BlbiBsZWZ0IGFjdGlvbiBwYW5lbC4gSXQgY2FuIGJlIG1vdmVkIHVwdG8gbGltaXQgdmFsdWUgKFVwcGVyIGJvdW5kKS5cbiAgICAgICAgICAgICAgICBib3VuZHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmljdFVwcGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbG93ZXI6IDAsXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogMCxcbiAgICAgICAgICAgICAgICAgICAgdXBwZXI6IHRoaXMubGltaXRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBib3VuZHMgd2hpbGUgc3dpcGluZyBmcm9tIGxlZnQgdG8gcmlnaHQgdG8gb3BlbiByaWdodCBhY3Rpb24gcGFuZWwuIEl0IGNhbiBiZSBtb3ZlZCBpbiByZXZlcnNlIGRpcmVjdGlvbiB3aXRoIC1saW1pdCB2YWx1ZSAobG93ZXIgYm91bmQpLlxuICAgICAgICAgICAgICAgIGJvdW5kcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RyaWN0TG93ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBsb3dlcjogLXRoaXMubGltaXQsXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogMCxcbiAgICAgICAgICAgICAgICAgICAgdXBwZXI6IDBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucG9zaXRpb24gPT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgLy8gd2hlbiBsZWZ0IGFjdGlvbiBwYW5lbCBpcyB2aXNpYmxlIChpLmUuIGNlbnRlciBhdCBsaW1pdCB2YWx1ZSkgdGhlbiB0aGlzIGNhbiBiZSBtb3ZlZCBieSBkaXN0YW5jZSAobGltaXQpIGluIHJldmVyc2UgZGlyZWN0aW9uIHRvIGNsb3NlIHRoZSB2aWV3LlxuICAgICAgICAgICAgYm91bmRzID0ge1xuICAgICAgICAgICAgICAgIHN0cmljdFVwcGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBsb3dlcjogLXRoaXMubGltaXQsXG4gICAgICAgICAgICAgICAgY2VudGVyOiB0aGlzLmxpbWl0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucG9zaXRpb24gPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgIC8vIHdoZW4gcmlnaHQgYWN0aW9uIHBhbmVsIGlzIHZpc2libGUgKGkuZS4gY2VudGVyIGF0IC1saW1pdCB2YWx1ZSkgdGhlbiB0aGlzIGNhbiBiZSBtb3ZlZCBieSBkaXN0YW5jZSAobGltaXQpIHRvIGNsb3NlIHRoZSB2aWV3LlxuICAgICAgICAgICAgYm91bmRzID0ge1xuICAgICAgICAgICAgICAgIGNlbnRlcjogLXRoaXMubGltaXQsXG4gICAgICAgICAgICAgICAgdXBwZXI6IHRoaXMubGltaXQsXG4gICAgICAgICAgICAgICAgc3RyaWN0TG93ZXI6IGZhbHNlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbnRleHQoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbXB1dGVBY3Rpb25UcmFuc2l0aW9uOiAoaW5kZXg6IG51bWJlciwgJGQ6IG51bWJlcik6IG51bWJlciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2lnbiA9ICRkID4gMCA/IDEgOiAtMTtcblxuICAgICAgICAgICAgICAgIGlmIChzaWduICogJGQgPiB0aGlzLmxpbWl0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG9uY2UgdGhlIGRpc3RhbmNlIHN3aXBlZCBpcyBiZXlvbmQgdGhlIGxpbWl0LCB0aGVuIGNhbGN1bGF0ZSB0aGUgcHJvcG9ydGlvbmF0ZSBkaXN0YW5jZSBtb3ZlZCBhZnRlciB0aGUgbGltaXQgdmFsdWUuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoJGQgLSBzaWduICogdGhpcy5saW1pdCkgKyAodGhpcy50cmFuc2l0aW9uUHJvcG9ydGlvbnNbaW5kZXhdICogc2lnbiAqIHRoaXMubGltaXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc2l0aW9uUHJvcG9ydGlvbnNbaW5kZXhdICogJGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGFuaW1hdGlvbigpOiBhbnkge1xuICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgIHRhcmdldDogKCkgPT4gdGhpcy5saSxcbiAgICAgICAgICAgIGNzczoge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKCR7eyREICsgJGR9fXB4LCAwLCAwKSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgeyAvLyBzdHlsZXMgdG8gYmUgYXBwbGllZCBvbiB0aGUgY2hpbGQgZWxlbWVudHMgb2YgYWN0aW9uIHBhbmVsXG4gICAgICAgICAgICB0YXJnZXQ6ICgpID0+ICh0aGlzLmFjdGlvblBhbmVsICYmIHRoaXMuYWN0aW9uUGFuZWwuY2hpbGRyZW4oKSksXG4gICAgICAgICAgICBjc3M6IHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgke3tjb21wdXRlQWN0aW9uVHJhbnNpdGlvbigkaSwgJEQgKyAkZCl9fXB4LCAwLCAwKSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfV07XG4gICAgfVxuXG4gICAgLy8gVHJpZ2dlcnMgZnVsbCBzd2lwZSBldmVudCBvbiB0aGUgdGFyZ2V0IGVsZW1lbnQuXG4gICAgcHVibGljIGludm9rZUZ1bGxTd2lwZUV2dCgkZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgICAgIGxldCB0YXJnZXQsIGFjdGlvbnMsIGluZGV4O1xuICAgICAgICAvLyBDaGVjayBpZiBidXR0b24gYXJlIHZpc2libGUgb3Igbm90LCBpbnZva2UgdGhlIHRhcCBldmVudCBvZiB0aGUgbGFzdCBidXR0b24gd2hpY2ggaXMgdmlzaWJsZS5cbiAgICAgICAgaWYgKHRoaXMucG9zaXRpb24gPT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgYWN0aW9ucyA9IHRoaXMuYWN0aW9uSXRlbXMuZmlsdGVyKGJ0biA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ0bi5nZXRBdHRyKCdzd2lwZS1wb3NpdGlvbicpID09PSAnbGVmdCcgJiYgYnRuLiRlbGVtZW50LmlzKCc6dmlzaWJsZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY3Rpb25zID0gdGhpcy5hY3Rpb25JdGVtcy5maWx0ZXIoYnRuID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnRuLmdldEF0dHIoJ3N3aXBlLXBvc2l0aW9uJykgPT09ICdyaWdodCcgJiYgYnRuLiRlbGVtZW50LmlzKCc6dmlzaWJsZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpbmRleCA9IGFjdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXQgPSBhY3Rpb25zW2luZGV4XTtcbiAgICAgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQuaGFzRXZlbnRDYWxsYmFjaygndGFwJykpIHtcbiAgICAgICAgICAgIHRhcmdldC5pbnZva2VFdmVudENhbGxiYWNrKCd0YXAnLCB7JGV2ZW50fSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXNldFN0YXRlKCk7XG4gICAgICAgIHRoaXMubGkgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIENhbGxlZCB3aGVuIHN3aXBlRW5kIGlzIHRyaWdnZXJlZC4gZCBjb250YWlucyB0aGUgdG90YWwgZGlzdGFuY2UgY292ZXJlZCBieSB0aGUgZWxlbWVudCB1bnRpbCB0b3VjaEVuZC5cbiAgICBwdWJsaWMgb25BbmltYXRpb24oJGV2ZW50OiBFdmVudCwgZDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIC8vIHNldCB0aGUgc2VsZWN0ZWRpdGVtIG9uIHRoZSBsaXN0IGNvbXBvbmVudCBvbiBzd2lwZS5cbiAgICAgICAgdGhpcy5saXN0LnRyaWdnZXJMaXN0SXRlbVNlbGVjdGlvbih0aGlzLmxpLCAkZXZlbnQpO1xuICAgICAgICBpZiAodGhpcy5hY3Rpb25QYW5lbCAmJiB0aGlzLmFjdGlvblBhbmVsLmF0dHIoJ2VuYWJsZWZ1bGxzd2lwZScpID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpZ24gPSBkID4gMCA/IDEgOiAtMTtcbiAgICAgICAgICAgIGNvbnN0ICRlbCA9IHRoaXMuZ2V0Q2hpbGRBY3Rpb25FbGVtZW50KHRoaXMuYWN0aW9uUGFuZWwpO1xuICAgICAgICAgICAgaWYgKCRlbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5wb3NpdGlvbiA9PT0gJ3JpZ2h0JyA/IHRoaXMucmlnaHRDaGlsZHJlbkNvdW50IC0gMSA6IDA7XG4gICAgICAgICAgICAgICAgLy8gcHJvcG9ydGlvbmF0ZSBhbW91bnQgb2YgZGlzdGFuY2UgY292ZXJlZCBieSB0aGUgdGFyZ2V0IGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdFBlcmNlbnRhZ2UgPSB0aGlzLnRyYW5zaXRpb25Qcm9wb3J0aW9uc1tpbmRleF0gKiBzaWduICogZCAqIDEwMCAvICh0aGlzLmxpLm91dGVyV2lkdGgoKSAtIHRoaXMubGltaXQgKyAkZWwud2lkdGgoKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiBkaXN0YW5jZSB0cmF2ZWxsZWQgYnkgdGhlIHRhcmdldCBidXR0b24gZWxlbWVudCBpcyBtb3JlIHRoYW4gNTAlIG9mIHRoZSBsaXN0IGl0ZW0gd2lkdGggdGhlbiBpbnZva2UgdGhlIGZ1bGxzd2lwZS5cbiAgICAgICAgICAgICAgICBpZiAoZGlzdFBlcmNlbnRhZ2UgPiA1MCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpbnZva2UgZnVsbHN3aXBlIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRnVsbFN3aXBlRXZ0KCRldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG9uTG93ZXIoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnBvc2l0aW9uID09PSAnbGVmdCcpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRTdGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5saSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb25VcHBlcigpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMucG9zaXRpb24gPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRTdGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5saSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgdGhyZXNob2xkKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiAxMDtcbiAgICB9XG59XG4iXX0=