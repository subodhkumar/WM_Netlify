import { SwipeAnimation } from '@swipey';
export class ListAnimator extends SwipeAnimation {
    constructor(list) {
        super();
        this.list = list;
        this.$el = $(this.list.getNativeElement()).find('ul.app-livelist-container:first');
        this.leftChildrenCount = this.$el.find('>.app-list-item-left-action-panel > button:visible').length;
        this.rightChildrenCount = this.$el.find('>.app-list-item-right-action-panel > button:visible').length;
        // when there are no children in both the templates then do not apply swipeAnimation;
        if (!this.leftChildrenCount && !this.rightChildrenCount) {
            return;
        }
        // initialise swipe animation on the list component.
        this.init(this.$el);
        // retrieves all the button components which are placed outside the listTemplate.
        this.$btnSubscription = this.list.btnComponents.changes.subscribe(items => this.actionItems = items);
    }
    // This method sets the css for left or right action panels based on the template. Appends the actionTemplate before li.
    createActionPanel(li, actionPanelTemplate) {
        actionPanelTemplate.css({
            width: li.outerWidth() + 'px',
            height: li.outerHeight() + 'px',
            marginBottom: -1 * li.outerHeight() + 'px',
            float: 'left',
            padding: 0
        });
        return actionPanelTemplate.insertBefore(li);
    }
    // Returns the total width occupied by all the children inside the element
    computeTotalChildrenWidth($ele) {
        return _.reduce($ele.children(), (totalWidth, el) => {
            return totalWidth + $(el).outerWidth();
        }, 0);
    }
    // Returns amount of transition to be applied on element when swiped left or right
    computeTransitionProportions($ele) {
        const totalWidth = this.computeTotalChildrenWidth($ele);
        const reverse = this.position === 'right';
        let d = 0;
        return _.map($ele.children(), e => {
            const f = (totalWidth - d) / totalWidth;
            d += $(e).outerWidth();
            return reverse ? f : (d / totalWidth);
        });
    }
    // Resets the transform applied on the element.
    resetElement(el) {
        if (el) {
            el.css({
                transform: 'none',
                transition: 'none'
            });
        }
    }
    resetState() {
        this.resetElement(this.li);
        this.resetElement(this.actionPanel);
        if (this.actionPanel) {
            this.actionPanel = null;
        }
    }
    // Returns the target button (child element) inside the left and right actionPanels.
    getChildActionElement(actionTemplate) {
        if (actionTemplate.children().length) {
            if (this.position === 'left') {
                return actionTemplate.children().first();
            }
            return actionTemplate.children().last();
        }
    }
    // create the actionPanels and set the background-color for remaining panel as that of first child element
    // calculates the children's width and its transition proportionates.
    initActionPanel(actionTemplate) {
        this.actionPanel = this.createActionPanel(this.li, actionTemplate);
        this.actionPanel.css({
            backgroundColor: this.getChildActionElement(this.actionPanel).css('background-color')
        });
        this.limit = this.computeTotalChildrenWidth(this.actionPanel);
        this.transitionProportions = this.computeTransitionProportions(this.actionPanel);
    }
    bounds(e, $d) {
        const target = $(e.target).closest('li');
        // default bounds when action template markup is not available.
        let bounds = {
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
            let selector = $d > 0 ? '.app-list-item-left-action-panel' : '.app-list-item-right-action-panel';
            let actionTemplate = this.$el.find('>' + selector);
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
    }
    context() {
        return {
            computeActionTransition: (index, $d) => {
                const sign = $d > 0 ? 1 : -1;
                if (sign * $d > this.limit) {
                    // once the distance swiped is beyond the limit, then calculate the proportionate distance moved after the limit value.
                    return ($d - sign * this.limit) + (this.transitionProportions[index] * sign * this.limit);
                }
                return this.transitionProportions[index] * $d;
            }
        };
    }
    animation() {
        return [{
                target: () => this.li,
                css: {
                    transform: 'translate3d(${{$D + $d}}px, 0, 0)'
                }
            }, {
                target: () => (this.actionPanel && this.actionPanel.children()),
                css: {
                    transform: 'translate3d(${{computeActionTransition($i, $D + $d)}}px, 0, 0)'
                }
            }];
    }
    // Triggers full swipe event on the target element.
    invokeFullSwipeEvt($event) {
        let target, actions, index;
        // Check if button are visible or not, invoke the tap event of the last button which is visible.
        if (this.position === 'left') {
            actions = this.actionItems.filter(btn => {
                return btn.getAttr('swipe-position') === 'left' && btn.$element.is(':visible');
            });
            index = 0;
        }
        else {
            actions = this.actionItems.filter(btn => {
                return btn.getAttr('swipe-position') === 'right' && btn.$element.is(':visible');
            });
            index = actions.length - 1;
        }
        target = actions[index];
        if (target && target.hasEventCallback('tap')) {
            target.invokeEventCallback('tap', { $event });
        }
        this.resetState();
        this.li = null;
    }
    // Called when swipeEnd is triggered. d contains the total distance covered by the element until touchEnd.
    onAnimation($event, d) {
        // set the selecteditem on the list component on swipe.
        this.list.triggerListItemSelection(this.li, $event);
        if (this.actionPanel && this.actionPanel.attr('enablefullswipe') === 'true') {
            const sign = d > 0 ? 1 : -1;
            const $el = this.getChildActionElement(this.actionPanel);
            if ($el) {
                const index = this.position === 'right' ? this.rightChildrenCount - 1 : 0;
                // proportionate amount of distance covered by the target element.
                const distPercentage = this.transitionProportions[index] * sign * d * 100 / (this.li.outerWidth() - this.limit + $el.width());
                // If distance travelled by the target button element is more than 50% of the list item width then invoke the fullswipe.
                if (distPercentage > 50) {
                    // invoke fullswipe event
                    this.invokeFullSwipeEvt($event);
                }
            }
        }
    }
    onLower() {
        if (this.position === 'left') {
            this.resetState();
            this.li = null;
        }
    }
    onUpper() {
        if (this.position === 'right') {
            this.resetState();
            this.li = null;
        }
    }
    threshold() {
        return 10;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5hbmltYXRvci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbGlzdC9saXN0LmFuaW1hdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFPekMsTUFBTSxPQUFPLFlBQWEsU0FBUSxjQUFjO0lBWTVDLFlBQW9CLElBQW1CO1FBQ25DLEtBQUssRUFBRSxDQUFDO1FBRFEsU0FBSSxHQUFKLElBQUksQ0FBZTtRQUVuQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUVuRixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0RBQW9ELENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDcEcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFEQUFxRCxDQUFDLENBQUMsTUFBTSxDQUFDO1FBRXRHLHFGQUFxRjtRQUNyRixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQ3JELE9BQU87U0FDVjtRQUVELG9EQUFvRDtRQUNwRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVwQixpRkFBaUY7UUFDakYsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ3pHLENBQUM7SUFFRCx3SEFBd0g7SUFDaEgsaUJBQWlCLENB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MUIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO1NBQ2xCO0lBQ0wsQ0FBQztJQUVNLE9BQU87UUFDVixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssT0FBTyxFQUFFO1lBQzNCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztTQUNsQjtJQUNMLENBQUM7SUFFTSxTQUFTO1FBQ1osT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBRdWVyeUxpc3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBTd2lwZUFuaW1hdGlvbiB9IGZyb20gJ0Bzd2lwZXknO1xuXG5pbXBvcnQgeyBMaXN0Q29tcG9uZW50IH0gZnJvbSAnLi9saXN0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBCdXR0b25Db21wb25lbnQgfSBmcm9tICcuLi9idXR0b24vYnV0dG9uLmNvbXBvbmVudCc7XG5cbmRlY2xhcmUgIGNvbnN0IF8sICQ7XG5cbmV4cG9ydCBjbGFzcyBMaXN0QW5pbWF0b3IgZXh0ZW5kcyBTd2lwZUFuaW1hdGlvbiB7XG4gICAgcHJpdmF0ZSAkZWw6IEpRdWVyeTxIVE1MRWxlbWVudD47XG4gICAgcHJpdmF0ZSBsaTogSlF1ZXJ5PEhUTUxFbGVtZW50PjtcbiAgICBwcml2YXRlIGxpbWl0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSB0cmFuc2l0aW9uUHJvcG9ydGlvbnM6IGFueTtcbiAgICBwcml2YXRlIHJpZ2h0Q2hpbGRyZW5Db3VudDogbnVtYmVyO1xuICAgIHByaXZhdGUgbGVmdENoaWxkcmVuQ291bnQ6IG51bWJlcjtcbiAgICBwcml2YXRlIHBvc2l0aW9uOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBhY3Rpb25QYW5lbDogSlF1ZXJ5PEhUTUxFbGVtZW50PjtcbiAgICBwcml2YXRlIGFjdGlvbkl0ZW1zOiBRdWVyeUxpc3Q8QnV0dG9uQ29tcG9uZW50PjtcbiAgICBwdWJsaWMgJGJ0blN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBsaXN0OiBMaXN0Q29tcG9uZW50KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuJGVsID0gJCh0aGlzLmxpc3QuZ2V0TmF0aXZlRWxlbWVudCgpKS5maW5kKCd1bC5hcHAtbGl2ZWxpc3QtY29udGFpbmVyOmZpcnN0Jyk7XG5cbiAgICAgICAgdGhpcy5sZWZ0Q2hpbGRyZW5Db3VudCA9IHRoaXMuJGVsLmZpbmQoJz4uYXBwLWxpc3QtaXRlbS1sZWZ0LWFjdGlvbi1wYW5lbCA+IGJ1dHRvbjp2aXNpYmxlJykubGVuZ3RoO1xuICAgICAgICB0aGlzLnJpZ2h0Q2hpbGRyZW5Db3VudCA9IHRoaXMuJGVsLmZpbmQoJz4uYXBwLWxpc3QtaXRlbS1yaWdodC1hY3Rpb24tcGFuZWwgPiBidXR0b246dmlzaWJsZScpLmxlbmd0aDtcblxuICAgICAgICAvLyB3aGVuIHRoZXJlIGFyZSBubyBjaGlsZHJlbiBpbiBib3RoIHRoZSB0ZW1wbGF0ZXMgdGhlbiBkbyBub3QgYXBwbHkgc3dpcGVBbmltYXRpb247XG4gICAgICAgIGlmICghdGhpcy5sZWZ0Q2hpbGRyZW5Db3VudCAmJiAhdGhpcy5yaWdodENoaWxkcmVuQ291bnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGluaXRpYWxpc2Ugc3dpcGUgYW5pbWF0aW9uIG9uIHRoZSBsaXN0IGNvbXBvbmVudC5cbiAgICAgICAgdGhpcy5pbml0KHRoaXMuJGVsKTtcblxuICAgICAgICAvLyByZXRyaWV2ZXMgYWxsIHRoZSBidXR0b24gY29tcG9uZW50cyB3aGljaCBhcmUgcGxhY2VkIG91dHNpZGUgdGhlIGxpc3RUZW1wbGF0ZS5cbiAgICAgICAgdGhpcy4kYnRuU3Vic2NyaXB0aW9uID0gdGhpcy5saXN0LmJ0bkNvbXBvbmVudHMuY2hhbmdlcy5zdWJzY3JpYmUoaXRlbXMgPT4gdGhpcy5hY3Rpb25JdGVtcyA9IGl0ZW1zKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIG1ldGhvZCBzZXRzIHRoZSBjc3MgZm9yIGxlZnQgb3IgcmlnaHQgYWN0aW9uIHBhbmVscyBiYXNlZCBvbiB0aGUgdGVtcGxhdGUuIEFwcGVuZHMgdGhlIGFjdGlvblRlbXBsYXRlIGJlZm9yZSBsaS5cbiAgICBwcml2YXRlIGNyZWF0ZUFjdGlvblBhbmVsKGxpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+LCBhY3Rpb25QYW5lbFRlbXBsYXRlOiBKUXVlcnk8SFRNTEVsZW1lbnQ+KTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgICAgIGFjdGlvblBhbmVsVGVtcGxhdGUuY3NzKHtcbiAgICAgICAgICAgIHdpZHRoOiBsaS5vdXRlcldpZHRoKCkgKyAncHgnLFxuICAgICAgICAgICAgaGVpZ2h0OiBsaS5vdXRlckhlaWdodCgpICsgJ3B4JyxcbiAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogLTEgKiBsaS5vdXRlckhlaWdodCgpICsgJ3B4JyxcbiAgICAgICAgICAgIGZsb2F0OiAnbGVmdCcsXG4gICAgICAgICAgICBwYWRkaW5nOiAwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBhY3Rpb25QYW5lbFRlbXBsYXRlLmluc2VydEJlZm9yZShsaSk7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0aGUgdG90YWwgd2lkdGggb2NjdXBpZWQgYnkgYWxsIHRoZSBjaGlsZHJlbiBpbnNpZGUgdGhlIGVsZW1lbnRcbiAgICBwcml2YXRlIGNvbXB1dGVUb3RhbENoaWxkcmVuV2lkdGgoJGVsZTogSlF1ZXJ5PEhUTUxFbGVtZW50Pik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBfLnJlZHVjZSgkZWxlLmNoaWxkcmVuKCksICh0b3RhbFdpZHRoLCBlbCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRvdGFsV2lkdGggKyAkKGVsKS5vdXRlcldpZHRoKCk7XG4gICAgICAgIH0sIDApO1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgYW1vdW50IG9mIHRyYW5zaXRpb24gdG8gYmUgYXBwbGllZCBvbiBlbGVtZW50IHdoZW4gc3dpcGVkIGxlZnQgb3IgcmlnaHRcbiAgICBwcml2YXRlIGNvbXB1dGVUcmFuc2l0aW9uUHJvcG9ydGlvbnMoJGVsZTogSlF1ZXJ5PEhUTUxFbGVtZW50Pik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHRvdGFsV2lkdGggPSB0aGlzLmNvbXB1dGVUb3RhbENoaWxkcmVuV2lkdGgoJGVsZSk7XG4gICAgICAgIGNvbnN0IHJldmVyc2UgPSB0aGlzLnBvc2l0aW9uID09PSAncmlnaHQnO1xuICAgICAgICBsZXQgZCA9IDA7XG4gICAgICAgIHJldHVybiBfLm1hcCgkZWxlLmNoaWxkcmVuKCksIGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgZiA9ICh0b3RhbFdpZHRoIC0gZCkgLyB0b3RhbFdpZHRoO1xuICAgICAgICAgICAgZCArPSAkKGUpLm91dGVyV2lkdGgoKTtcbiAgICAgICAgICAgIHJldHVybiByZXZlcnNlID8gZiA6IChkIC8gdG90YWxXaWR0aCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFJlc2V0cyB0aGUgdHJhbnNmb3JtIGFwcGxpZWQgb24gdGhlIGVsZW1lbnQuXG4gICAgcHJpdmF0ZSByZXNldEVsZW1lbnQoZWw6IEpRdWVyeTxIVE1MRWxlbWVudD4pOiB2b2lkIHtcbiAgICAgICAgaWYgKGVsKSB7XG4gICAgICAgICAgICBlbC5jc3Moe1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ25vbmUnLFxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdub25lJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2V0U3RhdGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMucmVzZXRFbGVtZW50KHRoaXMubGkpO1xuICAgICAgICB0aGlzLnJlc2V0RWxlbWVudCh0aGlzLmFjdGlvblBhbmVsKTtcbiAgICAgICAgaWYgKHRoaXMuYWN0aW9uUGFuZWwpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aW9uUGFuZWwgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0aGUgdGFyZ2V0IGJ1dHRvbiAoY2hpbGQgZWxlbWVudCkgaW5zaWRlIHRoZSBsZWZ0IGFuZCByaWdodCBhY3Rpb25QYW5lbHMuXG4gICAgcHJpdmF0ZSBnZXRDaGlsZEFjdGlvbkVsZW1lbnQoYWN0aW9uVGVtcGxhdGUpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICAgICAgaWYgKGFjdGlvblRlbXBsYXRlLmNoaWxkcmVuKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wb3NpdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdGlvblRlbXBsYXRlLmNoaWxkcmVuKCkuZmlyc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY3Rpb25UZW1wbGF0ZS5jaGlsZHJlbigpLmxhc3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNyZWF0ZSB0aGUgYWN0aW9uUGFuZWxzIGFuZCBzZXQgdGhlIGJhY2tncm91bmQtY29sb3IgZm9yIHJlbWFpbmluZyBwYW5lbCBhcyB0aGF0IG9mIGZpcnN0IGNoaWxkIGVsZW1lbnRcbiAgICAvLyBjYWxjdWxhdGVzIHRoZSBjaGlsZHJlbidzIHdpZHRoIGFuZCBpdHMgdHJhbnNpdGlvbiBwcm9wb3J0aW9uYXRlcy5cbiAgICBwcml2YXRlIGluaXRBY3Rpb25QYW5lbChhY3Rpb25UZW1wbGF0ZTogSlF1ZXJ5PEhUTUxFbGVtZW50Pik6IHZvaWQge1xuICAgICAgICB0aGlzLmFjdGlvblBhbmVsID0gdGhpcy5jcmVhdGVBY3Rpb25QYW5lbCh0aGlzLmxpLCBhY3Rpb25UZW1wbGF0ZSk7XG4gICAgICAgIHRoaXMuYWN0aW9uUGFuZWwuY3NzKHtcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogdGhpcy5nZXRDaGlsZEFjdGlvbkVsZW1lbnQodGhpcy5hY3Rpb25QYW5lbCkuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJylcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubGltaXQgPSB0aGlzLmNvbXB1dGVUb3RhbENoaWxkcmVuV2lkdGgodGhpcy5hY3Rpb25QYW5lbCk7XG4gICAgICAgIHRoaXMudHJhbnNpdGlvblByb3BvcnRpb25zID0gdGhpcy5jb21wdXRlVHJhbnNpdGlvblByb3BvcnRpb25zKHRoaXMuYWN0aW9uUGFuZWwpO1xuICAgIH1cblxuICAgIHB1YmxpYyBib3VuZHMoZT86IGFueSwgJGQ/OiBudW1iZXIpOiBhbnkge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdsaScpO1xuICAgICAgICAvLyBkZWZhdWx0IGJvdW5kcyB3aGVuIGFjdGlvbiB0ZW1wbGF0ZSBtYXJrdXAgaXMgbm90IGF2YWlsYWJsZS5cbiAgICAgICAgbGV0IGJvdW5kczoge30gPSB7XG4gICAgICAgICAgICBzdHJpY3RVcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgIHN0cmljdExvd2VyOiB0cnVlLFxuICAgICAgICAgICAgbG93ZXI6IDAsXG4gICAgICAgICAgICBjZW50ZXI6IDAsXG4gICAgICAgICAgICB1cHBlcjogMFxuICAgICAgICB9O1xuICAgICAgICAvLyBhcHBseSBzd2lwZSBhbmltYXRpb24gb25seSBvbiBsaXN0IGl0ZW1zIGhhdmluZyBcImFwcC1saXN0LWl0ZW1cIiBjbGFzcy5cbiAgICAgICAgaWYgKCF0YXJnZXQuaGFzQ2xhc3MoJ2FwcC1saXN0LWl0ZW0nKSkge1xuICAgICAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMubGkgfHwgdGhpcy5saVswXSAhPT0gdGFyZ2V0WzBdKSB7XG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAgJGQgPiAwID8gJy5hcHAtbGlzdC1pdGVtLWxlZnQtYWN0aW9uLXBhbmVsJyA6ICcuYXBwLWxpc3QtaXRlbS1yaWdodC1hY3Rpb24tcGFuZWwnO1xuICAgICAgICAgICAgbGV0IGFjdGlvblRlbXBsYXRlID0gdGhpcy4kZWwuZmluZCgnPicgKyBzZWxlY3Rvcik7XG5cbiAgICAgICAgICAgIC8vIHdoZW4gZ3JvdXBieSBpcyBzZXQgc2VsZWN0IHRoZSBhY3Rpb24gcGFuZWwgZnJvbSB0aGUgbGlzdCBncm91cCBpdGVtcy5cbiAgICAgICAgICAgIGlmICghYWN0aW9uVGVtcGxhdGUubGVuZ3RoICYmIHRoaXMubGlzdC5ncm91cGJ5KSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAnbGkgPiB1bC5saXN0LWdyb3VwID4nICsgc2VsZWN0b3I7XG4gICAgICAgICAgICAgICAgYWN0aW9uVGVtcGxhdGUgPSB0aGlzLiRlbC5maW5kKCc+JyArIHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGNoaWxkcmVuIHZpc2libGl0eS4gSWYgY2hpbGRyZW4gYXJlIHZpc2libGUgdGhlbiBpbml0aWF0ZSB0aGUgYWN0aW9uIHBhbmVsLlxuICAgICAgICAgICAgaWYgKCFhY3Rpb25UZW1wbGF0ZS5sZW5ndGggfHwgIWFjdGlvblRlbXBsYXRlLmZpbmQoJ2J1dHRvbjp2aXNpYmxlJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yZXNldFN0YXRlKCk7XG4gICAgICAgICAgICB0aGlzLmxpID0gdGFyZ2V0O1xuXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gYWN0aW9uVGVtcGxhdGUuYXR0cigncG9zaXRpb24nKTtcbiAgICAgICAgICAgIHRoaXMuaW5pdEFjdGlvblBhbmVsKGFjdGlvblRlbXBsYXRlKTtcblxuICAgICAgICAgICAgaWYgKCRkID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIGJvdW5kcyB3aGlsZSBzd2lwaW5nIGZyb20gcmlnaHQgdG8gbGVmdCB0byBvcGVuIGxlZnQgYWN0aW9uIHBhbmVsLiBJdCBjYW4gYmUgbW92ZWQgdXB0byBsaW1pdCB2YWx1ZSAoVXBwZXIgYm91bmQpLlxuICAgICAgICAgICAgICAgIGJvdW5kcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RyaWN0VXBwZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBsb3dlcjogMCxcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiAwLFxuICAgICAgICAgICAgICAgICAgICB1cHBlcjogdGhpcy5saW1pdFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGJvdW5kcyB3aGlsZSBzd2lwaW5nIGZyb20gbGVmdCB0byByaWdodCB0byBvcGVuIHJpZ2h0IGFjdGlvbiBwYW5lbC4gSXQgY2FuIGJlIG1vdmVkIGluIHJldmVyc2UgZGlyZWN0aW9uIHdpdGggLWxpbWl0IHZhbHVlIChsb3dlciBib3VuZCkuXG4gICAgICAgICAgICAgICAgYm91bmRzID0ge1xuICAgICAgICAgICAgICAgICAgICBzdHJpY3RMb3dlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGxvd2VyOiAtdGhpcy5saW1pdCxcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiAwLFxuICAgICAgICAgICAgICAgICAgICB1cHBlcjogMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wb3NpdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgICAgICAgICAvLyB3aGVuIGxlZnQgYWN0aW9uIHBhbmVsIGlzIHZpc2libGUgKGkuZS4gY2VudGVyIGF0IGxpbWl0IHZhbHVlKSB0aGVuIHRoaXMgY2FuIGJlIG1vdmVkIGJ5IGRpc3RhbmNlIChsaW1pdCkgaW4gcmV2ZXJzZSBkaXJlY3Rpb24gdG8gY2xvc2UgdGhlIHZpZXcuXG4gICAgICAgICAgICBib3VuZHMgPSB7XG4gICAgICAgICAgICAgICAgc3RyaWN0VXBwZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGxvd2VyOiAtdGhpcy5saW1pdCxcbiAgICAgICAgICAgICAgICBjZW50ZXI6IHRoaXMubGltaXRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wb3NpdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgLy8gd2hlbiByaWdodCBhY3Rpb24gcGFuZWwgaXMgdmlzaWJsZSAoaS5lLiBjZW50ZXIgYXQgLWxpbWl0IHZhbHVlKSB0aGVuIHRoaXMgY2FuIGJlIG1vdmVkIGJ5IGRpc3RhbmNlIChsaW1pdCkgdG8gY2xvc2UgdGhlIHZpZXcuXG4gICAgICAgICAgICBib3VuZHMgPSB7XG4gICAgICAgICAgICAgICAgY2VudGVyOiAtdGhpcy5saW1pdCxcbiAgICAgICAgICAgICAgICB1cHBlcjogdGhpcy5saW1pdCxcbiAgICAgICAgICAgICAgICBzdHJpY3RMb3dlcjogZmFsc2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG5cbiAgICBwdWJsaWMgY29udGV4dCgpOiBhbnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29tcHV0ZUFjdGlvblRyYW5zaXRpb246IChpbmRleDogbnVtYmVyLCAkZDogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzaWduID0gJGQgPiAwID8gMSA6IC0xO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNpZ24gKiAkZCA+IHRoaXMubGltaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gb25jZSB0aGUgZGlzdGFuY2Ugc3dpcGVkIGlzIGJleW9uZCB0aGUgbGltaXQsIHRoZW4gY2FsY3VsYXRlIHRoZSBwcm9wb3J0aW9uYXRlIGRpc3RhbmNlIG1vdmVkIGFmdGVyIHRoZSBsaW1pdCB2YWx1ZS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgkZCAtIHNpZ24gKiB0aGlzLmxpbWl0KSArICh0aGlzLnRyYW5zaXRpb25Qcm9wb3J0aW9uc1tpbmRleF0gKiBzaWduICogdGhpcy5saW1pdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zaXRpb25Qcm9wb3J0aW9uc1tpbmRleF0gKiAkZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYW5pbWF0aW9uKCk6IGFueSB7XG4gICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgdGFyZ2V0OiAoKSA9PiB0aGlzLmxpLFxuICAgICAgICAgICAgY3NzOiB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoJHt7JEQgKyAkZH19cHgsIDAsIDApJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB7IC8vIHN0eWxlcyB0byBiZSBhcHBsaWVkIG9uIHRoZSBjaGlsZCBlbGVtZW50cyBvZiBhY3Rpb24gcGFuZWxcbiAgICAgICAgICAgIHRhcmdldDogKCkgPT4gKHRoaXMuYWN0aW9uUGFuZWwgJiYgdGhpcy5hY3Rpb25QYW5lbC5jaGlsZHJlbigpKSxcbiAgICAgICAgICAgIGNzczoge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKCR7e2NvbXB1dGVBY3Rpb25UcmFuc2l0aW9uKCRpLCAkRCArICRkKX19cHgsIDAsIDApJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9XTtcbiAgICB9XG5cbiAgICAvLyBUcmlnZ2VycyBmdWxsIHN3aXBlIGV2ZW50IG9uIHRoZSB0YXJnZXQgZWxlbWVudC5cbiAgICBwdWJsaWMgaW52b2tlRnVsbFN3aXBlRXZ0KCRldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgbGV0IHRhcmdldCwgYWN0aW9ucywgaW5kZXg7XG4gICAgICAgIC8vIENoZWNrIGlmIGJ1dHRvbiBhcmUgdmlzaWJsZSBvciBub3QsIGludm9rZSB0aGUgdGFwIGV2ZW50IG9mIHRoZSBsYXN0IGJ1dHRvbiB3aGljaCBpcyB2aXNpYmxlLlxuICAgICAgICBpZiAodGhpcy5wb3NpdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgICAgICAgICBhY3Rpb25zID0gdGhpcy5hY3Rpb25JdGVtcy5maWx0ZXIoYnRuID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnRuLmdldEF0dHIoJ3N3aXBlLXBvc2l0aW9uJykgPT09ICdsZWZ0JyAmJiBidG4uJGVsZW1lbnQuaXMoJzp2aXNpYmxlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjdGlvbnMgPSB0aGlzLmFjdGlvbkl0ZW1zLmZpbHRlcihidG4gPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBidG4uZ2V0QXR0cignc3dpcGUtcG9zaXRpb24nKSA9PT0gJ3JpZ2h0JyAmJiBidG4uJGVsZW1lbnQuaXMoJzp2aXNpYmxlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGluZGV4ID0gYWN0aW9ucy5sZW5ndGggLSAxO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldCA9IGFjdGlvbnNbaW5kZXhdO1xuICAgICAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC5oYXNFdmVudENhbGxiYWNrKCd0YXAnKSkge1xuICAgICAgICAgICAgdGFyZ2V0Lmludm9rZUV2ZW50Q2FsbGJhY2soJ3RhcCcsIHskZXZlbnR9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc2V0U3RhdGUoKTtcbiAgICAgICAgdGhpcy5saSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gQ2FsbGVkIHdoZW4gc3dpcGVFbmQgaXMgdHJpZ2dlcmVkLiBkIGNvbnRhaW5zIHRoZSB0b3RhbCBkaXN0YW5jZSBjb3ZlcmVkIGJ5IHRoZSBlbGVtZW50IHVudGlsIHRvdWNoRW5kLlxuICAgIHB1YmxpYyBvbkFuaW1hdGlvbigkZXZlbnQ6IEV2ZW50LCBkOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgLy8gc2V0IHRoZSBzZWxlY3RlZGl0ZW0gb24gdGhlIGxpc3QgY29tcG9uZW50IG9uIHN3aXBlLlxuICAgICAgICB0aGlzLmxpc3QudHJpZ2dlckxpc3RJdGVtU2VsZWN0aW9uKHRoaXMubGksICRldmVudCk7XG4gICAgICAgIGlmICh0aGlzLmFjdGlvblBhbmVsICYmIHRoaXMuYWN0aW9uUGFuZWwuYXR0cignZW5hYmxlZnVsbHN3aXBlJykgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgY29uc3Qgc2lnbiA9IGQgPiAwID8gMSA6IC0xO1xuICAgICAgICAgICAgY29uc3QgJGVsID0gdGhpcy5nZXRDaGlsZEFjdGlvbkVsZW1lbnQodGhpcy5hY3Rpb25QYW5lbCk7XG4gICAgICAgICAgICBpZiAoJGVsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnBvc2l0aW9uID09PSAncmlnaHQnID8gdGhpcy5yaWdodENoaWxkcmVuQ291bnQgLSAxIDogMDtcbiAgICAgICAgICAgICAgICAvLyBwcm9wb3J0aW9uYXRlIGFtb3VudCBvZiBkaXN0YW5jZSBjb3ZlcmVkIGJ5IHRoZSB0YXJnZXQgZWxlbWVudC5cbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0UGVyY2VudGFnZSA9IHRoaXMudHJhbnNpdGlvblByb3BvcnRpb25zW2luZGV4XSAqIHNpZ24gKiBkICogMTAwIC8gKHRoaXMubGkub3V0ZXJXaWR0aCgpIC0gdGhpcy5saW1pdCArICRlbC53aWR0aCgpKTtcblxuICAgICAgICAgICAgICAgIC8vIElmIGRpc3RhbmNlIHRyYXZlbGxlZCBieSB0aGUgdGFyZ2V0IGJ1dHRvbiBlbGVtZW50IGlzIG1vcmUgdGhhbiA1MCUgb2YgdGhlIGxpc3QgaXRlbSB3aWR0aCB0aGVuIGludm9rZSB0aGUgZnVsbHN3aXBlLlxuICAgICAgICAgICAgICAgIGlmIChkaXN0UGVyY2VudGFnZSA+IDUwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGludm9rZSBmdWxsc3dpcGUgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VGdWxsU3dpcGVFdnQoJGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb25Mb3dlcigpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMucG9zaXRpb24gPT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgdGhpcy5yZXNldFN0YXRlKCk7XG4gICAgICAgICAgICB0aGlzLmxpID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvblVwcGVyKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5wb3NpdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgdGhpcy5yZXNldFN0YXRlKCk7XG4gICAgICAgICAgICB0aGlzLmxpID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyB0aHJlc2hvbGQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIDEwO1xuICAgIH1cbn1cbiJdfQ==