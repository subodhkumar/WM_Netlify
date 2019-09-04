import { Directive, ElementRef, Injector, Input } from '@angular/core';
import { App, debounce, isKitkatDevice, isMobileApp } from '@wm/core';
export class SmoothScrollDirective {
    constructor(inj, elRef, app) {
        this._isEnabled = false;
        this._lastScrollY = -1;
        this._waitRefreshTill = -1;
        this.pendingIscrolls = [];
        this._$el = $(elRef.nativeElement);
        this.app = app;
    }
    ngOnInit() {
        this.cancelSubscription = this.app.subscribe('no-iscroll', el => {
            this.pendingIscrolls.push(el);
        });
    }
    ngDoCheck() {
        if (this._isEnabled) {
            if (!this._smoothScrollInstance) {
                this._smoothScrollInstance = this.applySmoothScroll();
            }
            else {
                this.refreshIScroll();
            }
        }
        else if (this._smoothScrollInstance && this._smoothScrollInstance.destroy) {
            this._smoothScrollInstance.destroy();
        }
    }
    ngOnDestroy() {
        if (this._smoothScrollInstance && this._smoothScrollInstance.destroy) {
            this._smoothScrollInstance.destroy();
        }
        if (this.cancelSubscription) {
            this.cancelSubscription();
        }
    }
    set wmSmoothscroll(val) {
        this._isEnabled = (val === true || val === 'true');
        if (this._isEnabled) {
            if (!this._smoothScrollInstance) {
                this._smoothScrollInstance = this.applySmoothScroll();
            }
        }
        else {
            this.ngOnDestroy();
        }
    }
    applySmoothScroll($events, activeEl) {
        if (!isMobileApp() || isKitkatDevice()) {
            return null;
        }
        // Set the fadeScrollbars to true only when content is scrollable inside the smoothscroll-container
        const scrollOptions = {
            scrollbars: true,
            preventDefault: false,
            momentum: true,
            bounce: false,
            mouseWheel: true,
            disablePointer: true,
            disableTouch: false,
            disableMouse: false // false to be usable with a mouse (desktop)
        }, el = this._$el[0];
        if (!el.children.length) {
            return null;
        }
        this._$el.addClass('smoothscroll-wrapper');
        if (activeEl && activeEl.tagName === 'INPUT') {
            activeEl.focus();
        }
        // Add fadeScrollbars options only when smoothscroll container is included, which means content is scrollable.
        if ($events) {
            scrollOptions['fadeScrollbars'] = true;
        }
        let iScroll = new IScroll(el, scrollOptions);
        if ($events) {
            // map all events on previous iscroll to the newly created iscroll.
            _.forEach($events, (listeners, key) => {
                _.forEach(listeners, l => {
                    iScroll.on(key, l);
                });
            });
            iScroll.on('scrollStart', function () {
                this._scrolling = true;
            });
            iScroll.on('scrollEnd', function () {
                this._scrolling = false;
            });
            iScroll.refresh();
        }
        // refresh the indicators.
        iScroll.indicatorRefresh = () => {
            const indicators = this._$el[0].iscroll.indicators;
            let i;
            if (indicators.length) {
                for (i = 0; i < indicators.length; i++) {
                    indicators[i].refresh();
                }
            }
        };
        this._$el[0].iscroll = iScroll;
        _.forEach(this.pendingIscrolls, (_el, index) => {
            if (_el.isSameNode(this._$el[0])) {
                this.app.notify('iscroll-update', { el: _el });
                this.pendingIscrolls.splice(index, 1);
                return;
            }
        });
        this.app.notify('iscroll-update', {});
        return {
            iScroll: iScroll,
            destroy: function () {
                iScroll.destroy();
                $(iScroll.scroller).css({
                    'transition-timing-function': '',
                    'transition-duration': '',
                    'transform': ''
                });
                iScroll = null;
                delete el.iscroll;
            }
        };
    }
    /*
     * When element has scroll (i.e. scrollHeight > clientHeight), a div with smoothscroll-container class will be added.
     * new iScroll will be initialised on the element after the div addition, by removing the existing iscroll on the element.
     * This div will have no height, so the elements inside this div will inherit this height, i.e. no height,
     * Scenario: tabs with 100% height, as it covers the pageContent with no scroll, this div will not be added.
     * TODO: Scenario: tabs with 100% height and add others widgets after/before, as it has scroll, this div will be added.
     *          But tabs having 100% height will not be honoured as div is having no height.
     */
    refreshIScroll() {
        const iScroll = this._smoothScrollInstance.iScroll;
        const waitTime = 500;
        if (iScroll._scrolling || this._waitRefreshTill > Date.now()) {
            return;
        }
        // Check for scrollable content and if smoothscroll-container div is already added.
        if (iScroll.wrapper
            && !_.includes(iScroll.wrapper.children[0].classList, 'smoothscroll-container')
            && iScroll.wrapper.scrollHeight > iScroll.wrapper.clientHeight) {
            const cloneEvents = iScroll._events;
            const prevActiveEl = document.activeElement;
            // Adds the smoothscroll container div wrapper only when element has scrollable content.
            $(iScroll.wrapper.children).wrapAll('<div class="smoothscroll-container"></div>');
            this._smoothScrollInstance.destroy();
            // create new iscroll instance on the element
            this._smoothScrollInstance = this.applySmoothScroll(cloneEvents, prevActiveEl);
        }
        if (this._lastScrollY !== this._$el[0].iscroll.maxScrollY) {
            refreshIscrolls(this._smoothScrollInstance.iScroll);
            this._lastScrollY = this._$el[0].iscroll.maxScrollY;
        }
        else {
            this._smoothScrollInstance.iScroll.refresh();
        }
        this._waitRefreshTill = Date.now() + waitTime;
    }
}
SmoothScrollDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmSmoothscroll]'
            },] }
];
/** @nocollapse */
SmoothScrollDirective.ctorParameters = () => [
    { type: Injector },
    { type: ElementRef },
    { type: App }
];
SmoothScrollDirective.propDecorators = {
    wmSmoothscroll: [{ type: Input }]
};
/**
 * Refreshes the given iScorll or all iScrolls in the page.
 * @param iScroll
 */
const refreshIscrolls = function (iScroll) {
    const scrollContainer = !iScroll && $('.smoothscroll-container');
    // Fix for issue: keyboard hides the input on focus.
    // On input focus or window resize, keypad in device has to adjust.
    if (($(document.activeElement).offset().top + document.activeElement.clientHeight) > window.innerHeight * 0.9) {
        document.activeElement.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'end' });
    }
    if (iScroll) {
        // refresh specify iscroll on change.
        if (iScroll.indicatorRefresh) {
            iScroll.indicatorRefresh();
        }
        if (iScroll.refresh) {
            iScroll.refresh();
        }
    }
    else if (scrollContainer.length) {
        // refresh all the iscrolls in pagecontent.
        scrollContainer.parent().each((i, el) => {
            el.iscroll.indicatorRefresh();
            el.iscroll.refresh();
        });
    }
};
const ɵ0 = refreshIscrolls;
// on window resize, recalculate the iscroll position and refresh scrollers.
window.addEventListener('resize', debounce(refreshIscrolls, 200));
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic21vb3RoLXNjcm9sbC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3Ntb290aC1zY3JvbGwvc21vb3RoLXNjcm9sbC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFNBQVMsRUFBVyxVQUFVLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBb0IsTUFBTSxlQUFlLENBQUM7QUFFakcsT0FBTyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQVN0RSxNQUFNLE9BQU8scUJBQXFCO0lBVzlCLFlBQVksR0FBYSxFQUFFLEtBQWlCLEVBQUUsR0FBUTtRQVI5QyxlQUFVLEdBQUcsS0FBSyxDQUFDO1FBRW5CLGlCQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbEIscUJBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFdEIsb0JBQWUsR0FBUSxFQUFFLENBQUM7UUFJOUIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7SUFFTSxRQUFRO1FBQ1gsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsRUFBRTtZQUM1RCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxTQUFTO1FBQ1osSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsaUJB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SyxFQUFDLENBQUMsQ0FBQztLQUMxRjtJQUVELElBQUksT0FBTyxFQUFFO1FBQ1QscUNBQXFDO1FBQ3JDLElBQUksT0FBTyxDQUFDLGdCQUFnQixFQUFFO1lBQzFCLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1NBQzlCO1FBQ0QsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ2pCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNyQjtLQUNKO1NBQU0sSUFBSSxlQUFlLENBQUMsTUFBTSxFQUFFO1FBQy9CLDJDQUEyQztRQUMzQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQyxFQUFFLEVBQU8sRUFBRSxFQUFFO1lBQzFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUM5QixFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO0tBQ047QUFDTCxDQUFDLENBQUM7O0FBRUYsNEVBQTRFO0FBQzVFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIEVsZW1lbnRSZWYsIEluamVjdG9yLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBcHAsIGRlYm91bmNlLCBpc0tpdGthdERldmljZSwgaXNNb2JpbGVBcHAgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5cbmRlY2xhcmUgY29uc3QgSVNjcm9sbDtcbmRlY2xhcmUgY29uc3QgXywgJDtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21TbW9vdGhzY3JvbGxdJ1xufSlcbmV4cG9ydCBjbGFzcyBTbW9vdGhTY3JvbGxEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQsIERvQ2hlY2ssIE9uRGVzdHJveSB7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IF8kZWw7XG4gICAgcHJpdmF0ZSBfaXNFbmFibGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfc21vb3RoU2Nyb2xsSW5zdGFuY2U7XG4gICAgcHJpdmF0ZSBfbGFzdFNjcm9sbFkgPSAtMTtcbiAgICBwcml2YXRlIF93YWl0UmVmcmVzaFRpbGwgPSAtMTtcbiAgICBwcml2YXRlIGFwcDogQXBwO1xuICAgIHByaXZhdGUgcGVuZGluZ0lzY3JvbGxzOiBhbnkgPSBbXTtcbiAgICBwcml2YXRlIGNhbmNlbFN1YnNjcmlwdGlvbjogYW55O1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3RvciwgZWxSZWY6IEVsZW1lbnRSZWYsIGFwcDogQXBwKSB7XG4gICAgICAgIHRoaXMuXyRlbCA9ICQoZWxSZWYubmF0aXZlRWxlbWVudCk7XG4gICAgICAgIHRoaXMuYXBwID0gYXBwO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uSW5pdCgpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxTdWJzY3JpcHRpb24gPSB0aGlzLmFwcC5zdWJzY3JpYmUoJ25vLWlzY3JvbGwnLCBlbCA9PiB7XG4gICAgICAgICAgICB0aGlzLnBlbmRpbmdJc2Nyb2xscy5wdXNoKGVsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIG5nRG9DaGVjaygpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzRW5hYmxlZCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9zbW9vdGhTY3JvbGxJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Ntb290aFNjcm9sbEluc3RhbmNlID0gdGhpcy5hcHBseVNtb290aFNjcm9sbCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hJU2Nyb2xsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fc21vb3RoU2Nyb2xsSW5zdGFuY2UgJiYgdGhpcy5fc21vb3RoU2Nyb2xsSW5zdGFuY2UuZGVzdHJveSkge1xuICAgICAgICAgICAgdGhpcy5fc21vb3RoU2Nyb2xsSW5zdGFuY2UuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCkge1xuICAgICAgICBpZiAodGhpcy5fc21vb3RoU2Nyb2xsSW5zdGFuY2UgJiYgdGhpcy5fc21vb3RoU2Nyb2xsSW5zdGFuY2UuZGVzdHJveSkge1xuICAgICAgICAgICAgdGhpcy5fc21vb3RoU2Nyb2xsSW5zdGFuY2UuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNhbmNlbFN1YnNjcmlwdGlvbikge1xuICAgICAgICAgICAgdGhpcy5jYW5jZWxTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IHdtU21vb3Roc2Nyb2xsKHZhbDogYW55KSB7XG4gICAgICAgIHRoaXMuX2lzRW5hYmxlZCA9ICh2YWwgPT09IHRydWUgfHwgdmFsID09PSAndHJ1ZScpO1xuICAgICAgICBpZiAodGhpcy5faXNFbmFibGVkKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3Ntb290aFNjcm9sbEluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc21vb3RoU2Nyb2xsSW5zdGFuY2UgPSB0aGlzLmFwcGx5U21vb3RoU2Nyb2xsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm5nT25EZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFwcGx5U21vb3RoU2Nyb2xsKCRldmVudHM/OiBhbnlbXSwgYWN0aXZlRWw/OiBhbnkpIHtcbiAgICAgICAgaWYgKCFpc01vYmlsZUFwcCgpIHx8IGlzS2l0a2F0RGV2aWNlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNldCB0aGUgZmFkZVNjcm9sbGJhcnMgdG8gdHJ1ZSBvbmx5IHdoZW4gY29udGVudCBpcyBzY3JvbGxhYmxlIGluc2lkZSB0aGUgc21vb3Roc2Nyb2xsLWNvbnRhaW5lclxuICAgICAgICBjb25zdCBzY3JvbGxPcHRpb25zID0ge1xuICAgICAgICAgICAgc2Nyb2xsYmFyczogdHJ1ZSxcbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIG1vbWVudHVtOiB0cnVlLFxuICAgICAgICAgICAgYm91bmNlOiBmYWxzZSxcbiAgICAgICAgICAgIG1vdXNlV2hlZWw6IHRydWUsIC8vIGZvciBwcmV2aWV3IGluIGJyb3dzZXIgc3VwcG9ydFxuICAgICAgICAgICAgZGlzYWJsZVBvaW50ZXI6IHRydWUsIC8vIGRpc2FibGUgdGhlIHBvaW50ZXIgZXZlbnRzIGFzIGl0IGNhdXNlcyBsYWcgaW4gc2Nyb2xsaW5nIChqZXJreSkuXG4gICAgICAgICAgICBkaXNhYmxlVG91Y2g6IGZhbHNlLCAvLyBmYWxzZSB0byBiZSB1c2FibGUgd2l0aCB0b3VjaCBkZXZpY2VzXG4gICAgICAgICAgICBkaXNhYmxlTW91c2U6IGZhbHNlIC8vIGZhbHNlIHRvIGJlIHVzYWJsZSB3aXRoIGEgbW91c2UgKGRlc2t0b3ApXG4gICAgICAgIH0sXG4gICAgICAgIGVsID0gdGhpcy5fJGVsWzBdO1xuXG4gICAgICAgIGlmICghZWwuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuXyRlbC5hZGRDbGFzcygnc21vb3Roc2Nyb2xsLXdyYXBwZXInKTtcblxuICAgICAgICBpZiAoYWN0aXZlRWwgJiYgYWN0aXZlRWwudGFnTmFtZSA9PT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgYWN0aXZlRWwuZm9jdXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBmYWRlU2Nyb2xsYmFycyBvcHRpb25zIG9ubHkgd2hlbiBzbW9vdGhzY3JvbGwgY29udGFpbmVyIGlzIGluY2x1ZGVkLCB3aGljaCBtZWFucyBjb250ZW50IGlzIHNjcm9sbGFibGUuXG4gICAgICAgIGlmICgkZXZlbnRzKSB7XG4gICAgICAgICAgICBzY3JvbGxPcHRpb25zWydmYWRlU2Nyb2xsYmFycyddID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpU2Nyb2xsID0gbmV3IElTY3JvbGwoZWwsIHNjcm9sbE9wdGlvbnMpO1xuXG4gICAgICAgIGlmICgkZXZlbnRzKSB7XG4gICAgICAgICAgICAvLyBtYXAgYWxsIGV2ZW50cyBvbiBwcmV2aW91cyBpc2Nyb2xsIHRvIHRoZSBuZXdseSBjcmVhdGVkIGlzY3JvbGwuXG4gICAgICAgICAgICBfLmZvckVhY2goJGV2ZW50cywgKGxpc3RlbmVycywga2V5KSAgPT4ge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChsaXN0ZW5lcnMsIGwgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpU2Nyb2xsLm9uKGtleSwgbCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlTY3JvbGwub24oJ3Njcm9sbFN0YXJ0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbGluZyA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlTY3JvbGwub24oJ3Njcm9sbEVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaVNjcm9sbC5yZWZyZXNoKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZWZyZXNoIHRoZSBpbmRpY2F0b3JzLlxuICAgICAgICBpU2Nyb2xsLmluZGljYXRvclJlZnJlc2ggPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbmRpY2F0b3JzID0gdGhpcy5fJGVsWzBdLmlzY3JvbGwuaW5kaWNhdG9ycztcbiAgICAgICAgICAgIGxldCBpO1xuICAgICAgICAgICAgaWYgKGluZGljYXRvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGluZGljYXRvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNhdG9yc1tpXS5yZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuXyRlbFswXS5pc2Nyb2xsID0gaVNjcm9sbDtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMucGVuZGluZ0lzY3JvbGxzLCAoX2VsLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgaWYgKF9lbC5pc1NhbWVOb2RlKHRoaXMuXyRlbFswXSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcC5ub3RpZnkoJ2lzY3JvbGwtdXBkYXRlJywge2VsOiBfZWx9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBlbmRpbmdJc2Nyb2xscy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXBwLm5vdGlmeSgnaXNjcm9sbC11cGRhdGUnLCB7fSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlTY3JvbGw6IGlTY3JvbGwsXG4gICAgICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaVNjcm9sbC5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJChpU2Nyb2xsLnNjcm9sbGVyKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICAndHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb24nOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgJ3RyYW5zaXRpb24tZHVyYXRpb24nOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgJ3RyYW5zZm9ybSc6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpU2Nyb2xsID0gbnVsbDtcbiAgICAgICAgICAgICAgICBkZWxldGUgZWwuaXNjcm9sbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFdoZW4gZWxlbWVudCBoYXMgc2Nyb2xsIChpLmUuIHNjcm9sbEhlaWdodCA+IGNsaWVudEhlaWdodCksIGEgZGl2IHdpdGggc21vb3Roc2Nyb2xsLWNvbnRhaW5lciBjbGFzcyB3aWxsIGJlIGFkZGVkLlxuICAgICAqIG5ldyBpU2Nyb2xsIHdpbGwgYmUgaW5pdGlhbGlzZWQgb24gdGhlIGVsZW1lbnQgYWZ0ZXIgdGhlIGRpdiBhZGRpdGlvbiwgYnkgcmVtb3ZpbmcgdGhlIGV4aXN0aW5nIGlzY3JvbGwgb24gdGhlIGVsZW1lbnQuXG4gICAgICogVGhpcyBkaXYgd2lsbCBoYXZlIG5vIGhlaWdodCwgc28gdGhlIGVsZW1lbnRzIGluc2lkZSB0aGlzIGRpdiB3aWxsIGluaGVyaXQgdGhpcyBoZWlnaHQsIGkuZS4gbm8gaGVpZ2h0LFxuICAgICAqIFNjZW5hcmlvOiB0YWJzIHdpdGggMTAwJSBoZWlnaHQsIGFzIGl0IGNvdmVycyB0aGUgcGFnZUNvbnRlbnQgd2l0aCBubyBzY3JvbGwsIHRoaXMgZGl2IHdpbGwgbm90IGJlIGFkZGVkLlxuICAgICAqIFRPRE86IFNjZW5hcmlvOiB0YWJzIHdpdGggMTAwJSBoZWlnaHQgYW5kIGFkZCBvdGhlcnMgd2lkZ2V0cyBhZnRlci9iZWZvcmUsIGFzIGl0IGhhcyBzY3JvbGwsIHRoaXMgZGl2IHdpbGwgYmUgYWRkZWQuXG4gICAgICogICAgICAgICAgQnV0IHRhYnMgaGF2aW5nIDEwMCUgaGVpZ2h0IHdpbGwgbm90IGJlIGhvbm91cmVkIGFzIGRpdiBpcyBoYXZpbmcgbm8gaGVpZ2h0LlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVmcmVzaElTY3JvbGwoKSB7XG4gICAgICAgIGNvbnN0IGlTY3JvbGwgPSB0aGlzLl9zbW9vdGhTY3JvbGxJbnN0YW5jZS5pU2Nyb2xsO1xuICAgICAgICBjb25zdCB3YWl0VGltZSA9IDUwMDtcbiAgICAgICAgaWYgKGlTY3JvbGwuX3Njcm9sbGluZyB8fCB0aGlzLl93YWl0UmVmcmVzaFRpbGwgPiBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHNjcm9sbGFibGUgY29udGVudCBhbmQgaWYgc21vb3Roc2Nyb2xsLWNvbnRhaW5lciBkaXYgaXMgYWxyZWFkeSBhZGRlZC5cbiAgICAgICAgaWYgKGlTY3JvbGwud3JhcHBlclxuICAgICAgICAgICAgJiYgIV8uaW5jbHVkZXMoaVNjcm9sbC53cmFwcGVyLmNoaWxkcmVuWzBdLmNsYXNzTGlzdCwgJ3Ntb290aHNjcm9sbC1jb250YWluZXInKVxuICAgICAgICAgICAgJiYgaVNjcm9sbC53cmFwcGVyLnNjcm9sbEhlaWdodCA+IGlTY3JvbGwud3JhcHBlci5jbGllbnRIZWlnaHQpIHtcblxuICAgICAgICAgICAgY29uc3QgY2xvbmVFdmVudHMgPSBpU2Nyb2xsLl9ldmVudHM7XG4gICAgICAgICAgICBjb25zdCBwcmV2QWN0aXZlRWwgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gICAgICAgICAgICAvLyBBZGRzIHRoZSBzbW9vdGhzY3JvbGwgY29udGFpbmVyIGRpdiB3cmFwcGVyIG9ubHkgd2hlbiBlbGVtZW50IGhhcyBzY3JvbGxhYmxlIGNvbnRlbnQuXG4gICAgICAgICAgICAkKGlTY3JvbGwud3JhcHBlci5jaGlsZHJlbikud3JhcEFsbCgnPGRpdiBjbGFzcz1cInNtb290aHNjcm9sbC1jb250YWluZXJcIj48L2Rpdj4nKTtcbiAgICAgICAgICAgIHRoaXMuX3Ntb290aFNjcm9sbEluc3RhbmNlLmRlc3Ryb3koKTtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIG5ldyBpc2Nyb2xsIGluc3RhbmNlIG9uIHRoZSBlbGVtZW50XG4gICAgICAgICAgICB0aGlzLl9zbW9vdGhTY3JvbGxJbnN0YW5jZSA9IHRoaXMuYXBwbHlTbW9vdGhTY3JvbGwoY2xvbmVFdmVudHMsIHByZXZBY3RpdmVFbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2xhc3RTY3JvbGxZICE9PSB0aGlzLl8kZWxbMF0uaXNjcm9sbC5tYXhTY3JvbGxZKSB7XG4gICAgICAgICAgICByZWZyZXNoSXNjcm9sbHModGhpcy5fc21vb3RoU2Nyb2xsSW5zdGFuY2UuaVNjcm9sbCk7XG4gICAgICAgICAgICB0aGlzLl9sYXN0U2Nyb2xsWSA9IHRoaXMuXyRlbFswXS5pc2Nyb2xsLm1heFNjcm9sbFk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zbW9vdGhTY3JvbGxJbnN0YW5jZS5pU2Nyb2xsLnJlZnJlc2goKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl93YWl0UmVmcmVzaFRpbGwgPSBEYXRlLm5vdygpICsgd2FpdFRpbWU7XG4gICAgfVxufVxuXG4vKipcbiAqIFJlZnJlc2hlcyB0aGUgZ2l2ZW4gaVNjb3JsbCBvciBhbGwgaVNjcm9sbHMgaW4gdGhlIHBhZ2UuXG4gKiBAcGFyYW0gaVNjcm9sbFxuICovXG5jb25zdCByZWZyZXNoSXNjcm9sbHMgPSBmdW5jdGlvbihpU2Nyb2xsPzogYW55KSB7XG4gICAgY29uc3Qgc2Nyb2xsQ29udGFpbmVyID0gIWlTY3JvbGwgJiYgJCgnLnNtb290aHNjcm9sbC1jb250YWluZXInKTtcblxuICAgIC8vIEZpeCBmb3IgaXNzdWU6IGtleWJvYXJkIGhpZGVzIHRoZSBpbnB1dCBvbiBmb2N1cy5cbiAgICAvLyBPbiBpbnB1dCBmb2N1cyBvciB3aW5kb3cgcmVzaXplLCBrZXlwYWQgaW4gZGV2aWNlIGhhcyB0byBhZGp1c3QuXG4gICAgaWYgKCgkKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpLm9mZnNldCgpLnRvcCArIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuY2xpZW50SGVpZ2h0KSA+IHdpbmRvdy5pbm5lckhlaWdodCAqIDAuOSkge1xuICAgICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LnNjcm9sbEludG9WaWV3KHtiZWhhdmlvcjogJ2F1dG8nLCBibG9jazogJ2VuZCcsIGlubGluZTogJ2VuZCd9KTtcbiAgICB9XG5cbiAgICBpZiAoaVNjcm9sbCkge1xuICAgICAgICAvLyByZWZyZXNoIHNwZWNpZnkgaXNjcm9sbCBvbiBjaGFuZ2UuXG4gICAgICAgIGlmIChpU2Nyb2xsLmluZGljYXRvclJlZnJlc2gpIHtcbiAgICAgICAgICAgIGlTY3JvbGwuaW5kaWNhdG9yUmVmcmVzaCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpU2Nyb2xsLnJlZnJlc2gpIHtcbiAgICAgICAgICAgIGlTY3JvbGwucmVmcmVzaCgpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChzY3JvbGxDb250YWluZXIubGVuZ3RoKSB7XG4gICAgICAgIC8vIHJlZnJlc2ggYWxsIHRoZSBpc2Nyb2xscyBpbiBwYWdlY29udGVudC5cbiAgICAgICAgc2Nyb2xsQ29udGFpbmVyLnBhcmVudCgpLmVhY2goIChpLCBlbDogYW55KSA9PiB7XG4gICAgICAgICAgICBlbC5pc2Nyb2xsLmluZGljYXRvclJlZnJlc2goKTtcbiAgICAgICAgICAgIGVsLmlzY3JvbGwucmVmcmVzaCgpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG4vLyBvbiB3aW5kb3cgcmVzaXplLCByZWNhbGN1bGF0ZSB0aGUgaXNjcm9sbCBwb3NpdGlvbiBhbmQgcmVmcmVzaCBzY3JvbGxlcnMuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2UocmVmcmVzaElzY3JvbGxzLCAyMDApKTtcbiJdfQ==