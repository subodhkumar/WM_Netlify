import * as tslib_1 from "tslib";
import { Attribute, Component, ContentChildren, Injector, QueryList } from '@angular/core';
import { addClass, appendNode, noop, removeClass } from '@wm/core';
import { TabsAnimator } from './tabs.animator';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './tabs.props';
import { StylableComponent } from '../base/stylable.component';
import { TabPaneComponent } from './tab-pane/tab-pane.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-tabs clearfix';
var WIDGET_CONFIG = {
    widgetType: 'wm-tabs',
    hostClass: DEFAULT_CLS
};
var TabsComponent = /** @class */ (function (_super) {
    tslib_1.__extends(TabsComponent, _super);
    function TabsComponent(inj, _transition, _tabsPosition) {
        var _this = this;
        // handle to the promise resolver
        var resolveFn = noop;
        _this = _super.call(this, inj, WIDGET_CONFIG, new Promise(function (res) { return resolveFn = res; })) || this;
        _this.transition = _transition;
        _this.tabsposition = _tabsPosition;
        _this.promiseResolverFn = resolveFn;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER);
        return _this;
    }
    TabsComponent.prototype.animateIn = function (element) {
        var tabHeader = $(element);
        // when the animation is not present toggle the active class.
        tabHeader.siblings('.active').removeClass('active');
        tabHeader.addClass('active');
        var ul = this.nativeElement.querySelector('ul.nav.nav-tabs');
        // move the tabheader into the viewport
        var $prevHeaderEle = tabHeader.prev();
        if ($prevHeaderEle.length) {
            ul.scrollLeft = $prevHeaderEle[0].offsetLeft;
        }
        else {
            ul.scrollLeft = 0;
        }
    };
    /**
     * TabPane children components invoke this method to communicate with the parent
     * if the evt argument is defined on-change callback will be invoked.
     */
    TabsComponent.prototype.notifyChange = function (paneRef, evt) {
        if (!this.isSelectableTab(paneRef)) {
            return;
        }
        var headerElement;
        // invoke deselect event callback on the preset active tab
        if (this.activeTab) {
            this.activeTab.deselect();
        }
        // invoke select callback on the selected tab
        paneRef.invokeOnSelectCallback(evt);
        this.activeTab = paneRef.getWidget();
        // invoke change callback if the evt is present, select a tab programmatically will not have the event
        if (evt) {
            this.invokeEventCallback('change', {
                $event: evt,
                newPaneIndex: this.getPaneIndexByRef(paneRef),
                oldPaneIndex: this.getActiveTabIndex()
            });
        }
        if (evt) {
            headerElement = $(evt.target).closest('li.tab-header');
        }
        else {
            headerElement = this.nativeElement.querySelector("li[data-paneid=" + paneRef.widgetId + "]");
        }
        this.animateIn(headerElement);
        // this.setTabsLeftPosition(this.getPaneIndexByRef(this.activeTab), this.panes.length);
        if (this.canSlide()) {
            if (!this.tabsAnimator) {
                this.tabsAnimator = new TabsAnimator(this);
                this.tabsAnimator.setGesturesEnabled(this.canSlide());
            }
            this.tabsAnimator.transitionTabIntoView();
        }
    };
    TabsComponent.prototype.goToTab = function (tabIndex) {
        if (this.isValidPaneIndex(tabIndex - 1)) {
            var tab = this.getPaneRefByIndex(tabIndex - 1);
            tab.select();
        }
    };
    TabsComponent.prototype.getPaneIndexByRef = function (paneRef) {
        return this.panes.toArray().indexOf(paneRef);
    };
    // Returns the active tab index from tabs.
    TabsComponent.prototype.getActiveTabIndex = function () {
        return _.findIndex(this.panes.toArray(), { isActive: true });
    };
    TabsComponent.prototype.isValidPaneIndex = function (index) {
        return (index >= 0 && index < this.panes.length);
    };
    TabsComponent.prototype.getPaneRefByIndex = function (index) {
        return this.panes.toArray()[index];
    };
    // returns false if the pane is hidden or disabled
    TabsComponent.prototype.isSelectableTab = function (paneRef) {
        return paneRef.show && !paneRef.disabled;
    };
    TabsComponent.prototype.canSlide = function () {
        return this.transition === 'slide' && !this.vertical;
    };
    TabsComponent.prototype.getSelectableTabAfterIndex = function (index) {
        for (var i = index + 1; i < this.panes.length; i++) {
            var pane = this.getPaneRefByIndex(i);
            if (this.isSelectableTab(pane)) {
                return pane;
            }
        }
    };
    TabsComponent.prototype.getSelectableTabBeforeIndex = function (index) {
        for (var i = index - 1; i >= 0; i--) {
            var pane = this.getPaneRefByIndex(i);
            if (this.isSelectableTab(pane)) {
                return pane;
            }
        }
    };
    // select next tab relative to the current active tab
    TabsComponent.prototype.next = function () {
        var pane = this.getSelectableTabAfterIndex(this.getActiveTabIndex());
        if (pane) {
            pane.select();
        }
    };
    // select prev tab relative to the current active tab
    TabsComponent.prototype.prev = function () {
        var pane = this.getSelectableTabBeforeIndex(this.getActiveTabIndex());
        if (pane) {
            pane.select();
        }
    };
    /**
     * this method will be invoked during the initialization of the component and on defaultpaneindex property change,
     * if the provided defaultpaneindex is not valid, find the first pane index which can be shown and select it
     */
    TabsComponent.prototype.selectDefaultPaneByIndex = function (index) {
        if (!this.isValidPaneIndex(index)) {
            return;
        }
        var paneRef = this.getPaneRefByIndex(index);
        if (!this.isSelectableTab(paneRef)) {
            paneRef = this.getSelectableTabAfterIndex(0);
        }
        if (paneRef) {
            paneRef.select();
        }
    };
    // update the postion of tab header
    TabsComponent.prototype.setTabsPosition = function () {
        var ul = this.nativeElement.children[0];
        this.vertical = (this.tabsposition === 'left' || this.tabsposition === 'right');
        removeClass(this.nativeElement, 'inverted');
        if (this.tabsposition === 'bottom' || this.tabsposition === 'right') {
            appendNode(ul, this.nativeElement);
            addClass(this.nativeElement, 'inverted');
        }
    };
    TabsComponent.prototype.onPropertyChange = function (key, nv, ov) {
        var _this = this;
        if (key === 'defaultpaneindex') {
            // If no active tab is set ie.. no isdefaulttab then honor the defaultpaneindex
            setTimeout(function () { return _this.selectDefaultPaneByIndex(nv || 0); }, 20);
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    TabsComponent.prototype.registerTabsScroll = function () {
        var _this = this;
        setTimeout(function () {
            var $ul = _this.$element.find('> ul');
            var $liPosition;
            var $li = $ul.children();
            $liPosition = $li.last().position();
            if ($liPosition && ($liPosition.left > $ul.width())) {
                $ul.on('mousewheel', function (e) {
                    var left = $ul[0].scrollLeft, _delta = -1 * e.originalEvent.wheelDelta;
                    e.stopPropagation();
                    e.preventDefault();
                    $ul.animate({ scrollLeft: left + _delta }, { 'duration': 10 });
                });
            }
        });
    };
    TabsComponent.prototype.ngAfterContentInit = function () {
        this.promiseResolverFn();
        _super.prototype.ngAfterContentInit.call(this);
        this.setTabsPosition();
    };
    TabsComponent.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        this.registerTabsScroll();
    };
    TabsComponent.initializeProps = registerProps();
    TabsComponent.decorators = [
        { type: Component, args: [{
                    selector: 'div[wmTabs]',
                    template: "<ul class=\"nav nav-tabs\" [ngClass]=\"{'nav-stacked': vertical, 'nav-justified': justified}\" role=\"tablist\">\n    <li class=\"tab-header\" *ngFor=\"let pane of panes;\" [attr.data-paneid]=\"pane.widgetId\" [ngClass]=\"{'active': pane.isActive, 'disabled': pane.disabled}\"\n        [hidden]=\"!pane.show\" (click)=\"pane.select($event)\" role=\"tab\">\n        <a href=\"javascript:void(0);\" role=\"button\" [attr.aria-label]=\"pane.title\" [attr.title]=\"pane.title\" [tabindex]=\"pane.tabindex\">\n            <div class=\"tab-heading\">\n                <i [ngClass]=\"['app-icon', pane.paneicon]\" *ngIf=\"pane.paneicon\"></i>\n                <span [textContent]=\"pane.title\"></span>\n                <span *ngIf=\"pane.badgevalue\" class=\"label label-{{pane.badgetype}}\" [textContent]=\"pane.badgevalue\"></span>\n            </div>\n        </a>\n    </li>\n</ul>\n<div class=\"tab-content\" [ngClass]=\"{'tab-stacked': vertical, 'tab-justified': justified}\">\n    <ng-content select=\"div[wmTabPane]\"></ng-content>\n</div>\n",
                    providers: [
                        provideAsWidgetRef(TabsComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    TabsComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: String, decorators: [{ type: Attribute, args: ['transition',] }] },
        { type: String, decorators: [{ type: Attribute, args: ['tabsposition',] }] }
    ]; };
    TabsComponent.propDecorators = {
        panes: [{ type: ContentChildren, args: [TabPaneComponent,] }]
    };
    return TabsComponent;
}(StylableComponent));
export { TabsComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFicy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RhYnMvdGFicy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBbUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFVLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVwSSxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRW5FLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFbkUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM3QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNqRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUlqRSxJQUFNLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQztBQUN4QyxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLFNBQVM7SUFDckIsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQUVGO0lBT21DLHlDQUFpQjtJQWVoRCx1QkFDSSxHQUFhLEVBQ1ksV0FBbUIsRUFDakIsYUFBcUI7UUFIcEQsaUJBZ0JDO1FBWEcsaUNBQWlDO1FBQ2pDLElBQUksU0FBUyxHQUFhLElBQUksQ0FBQztRQUUvQixRQUFBLGtCQUFNLEdBQUcsRUFBRSxhQUFhLEVBQUUsSUFBSSxPQUFPLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxTQUFTLEdBQUcsR0FBRyxFQUFmLENBQWUsQ0FB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Q3hCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUF4T00sNkJBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsYUFBYTtvQkFDdkIsK2hDQUFvQztvQkFDcEMsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLGFBQWEsQ0FBQztxQkFDcEM7aUJBQ0o7Ozs7Z0JBMUJnRixRQUFROzZDQTRDaEYsU0FBUyxTQUFDLFlBQVk7NkNBQ3RCLFNBQVMsU0FBQyxjQUFjOzs7d0JBTDVCLGVBQWUsU0FBQyxnQkFBZ0I7O0lBNk5yQyxvQkFBQztDQUFBLEFBalBELENBT21DLGlCQUFpQixHQTBPbkQ7U0ExT1ksYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyQ29udGVudEluaXQsIEFmdGVyVmlld0luaXQsIEF0dHJpYnV0ZSwgQ29tcG9uZW50LCBDb250ZW50Q2hpbGRyZW4sIEluamVjdG9yLCBPbkluaXQsIFF1ZXJ5TGlzdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgYXBwZW5kTm9kZSwgbm9vcCwgcmVtb3ZlQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IFRhYnNBbmltYXRvciB9IGZyb20gJy4vdGFicy5hbmltYXRvcic7XG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3RhYnMucHJvcHMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBUYWJQYW5lQ29tcG9uZW50IH0gZnJvbSAnLi90YWItcGFuZS90YWItcGFuZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfLCAkO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtdGFicyBjbGVhcmZpeCc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS10YWJzJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bVRhYnNdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vdGFicy5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihUYWJzQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgVGFic0NvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25Jbml0LCBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIGRlZmF1bHRwYW5laW5kZXg6IG51bWJlcjtcbiAgICBwdWJsaWMgdHJhbnNpdGlvbjogc3RyaW5nO1xuICAgIHB1YmxpYyB0YWJzcG9zaXRpb246IHN0cmluZztcblxuICAgIHB1YmxpYyB2ZXJ0aWNhbDogYm9vbGVhbjtcbiAgICBwdWJsaWMganVzdGlmaWVkOiBib29sZWFuO1xuICAgIHByaXZhdGUgYWN0aXZlVGFiOiBUYWJQYW5lQ29tcG9uZW50O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcHJvbWlzZVJlc29sdmVyRm46IEZ1bmN0aW9uO1xuICAgIHByaXZhdGUgdGFic0FuaW1hdG9yOiBUYWJzQW5pbWF0b3I7XG5cbiAgICBAQ29udGVudENoaWxkcmVuKFRhYlBhbmVDb21wb25lbnQpIHBhbmVzOiBRdWVyeUxpc3Q8VGFiUGFuZUNvbXBvbmVudD47XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgQEF0dHJpYnV0ZSgndHJhbnNpdGlvbicpIF90cmFuc2l0aW9uOiBzdHJpbmcsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ3RhYnNwb3NpdGlvbicpIF90YWJzUG9zaXRpb246IHN0cmluZ1xuICAgICkge1xuICAgICAgICAvLyBoYW5kbGUgdG8gdGhlIHByb21pc2UgcmVzb2x2ZXJcbiAgICAgICAgbGV0IHJlc29sdmVGbjogRnVuY3Rpb24gPSBub29wO1xuXG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRywgbmV3IFByb21pc2UocmVzID0+IHJlc29sdmVGbiA9IHJlcykpO1xuXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbiA9IF90cmFuc2l0aW9uO1xuICAgICAgICB0aGlzLnRhYnNwb3NpdGlvbiA9IF90YWJzUG9zaXRpb247XG5cbiAgICAgICAgdGhpcy5wcm9taXNlUmVzb2x2ZXJGbiA9IHJlc29sdmVGbjtcblxuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5DT05UQUlORVIpO1xuICAgIH1cblxuICAgIGFuaW1hdGVJbiAoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgdGFiSGVhZGVyID0gJChlbGVtZW50KTtcbiAgICAgICAgLy8gd2hlbiB0aGUgYW5pbWF0aW9uIGlzIG5vdCBwcmVzZW50IHRvZ2dsZSB0aGUgYWN0aXZlIGNsYXNzLlxuICAgICAgICB0YWJIZWFkZXIuc2libGluZ3MoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIHRhYkhlYWRlci5hZGRDbGFzcygnYWN0aXZlJyk7XG5cbiAgICAgICAgY29uc3QgdWwgPSB0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcigndWwubmF2Lm5hdi10YWJzJyk7XG5cbiAgICAgICAgLy8gbW92ZSB0aGUgdGFiaGVhZGVyIGludG8gdGhlIHZpZXdwb3J0XG4gICAgICAgIGNvbnN0ICRwcmV2SGVhZGVyRWxlID0gdGFiSGVhZGVyLnByZXYoKTtcbiAgICAgICAgaWYgKCRwcmV2SGVhZGVyRWxlLmxlbmd0aCkge1xuICAgICAgICAgICAgdWwuc2Nyb2xsTGVmdCA9ICRwcmV2SGVhZGVyRWxlWzBdLm9mZnNldExlZnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1bC5zY3JvbGxMZWZ0ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRhYlBhbmUgY2hpbGRyZW4gY29tcG9uZW50cyBpbnZva2UgdGhpcyBtZXRob2QgdG8gY29tbXVuaWNhdGUgd2l0aCB0aGUgcGFyZW50XG4gICAgICogaWYgdGhlIGV2dCBhcmd1bWVudCBpcyBkZWZpbmVkIG9uLWNoYW5nZSBjYWxsYmFjayB3aWxsIGJlIGludm9rZWQuXG4gICAgICovXG4gICAgcHVibGljIG5vdGlmeUNoYW5nZShwYW5lUmVmOiBUYWJQYW5lQ29tcG9uZW50LCBldnQ6IEV2ZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5pc1NlbGVjdGFibGVUYWIocGFuZVJlZikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBoZWFkZXJFbGVtZW50O1xuICAgICAgICAvLyBpbnZva2UgZGVzZWxlY3QgZXZlbnQgY2FsbGJhY2sgb24gdGhlIHByZXNldCBhY3RpdmUgdGFiXG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVUYWIuZGVzZWxlY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGludm9rZSBzZWxlY3QgY2FsbGJhY2sgb24gdGhlIHNlbGVjdGVkIHRhYlxuICAgICAgICBwYW5lUmVmLmludm9rZU9uU2VsZWN0Q2FsbGJhY2soZXZ0KTtcblxuICAgICAgICB0aGlzLmFjdGl2ZVRhYiA9IHBhbmVSZWYuZ2V0V2lkZ2V0KCk7XG5cbiAgICAgICAgLy8gaW52b2tlIGNoYW5nZSBjYWxsYmFjayBpZiB0aGUgZXZ0IGlzIHByZXNlbnQsIHNlbGVjdCBhIHRhYiBwcm9ncmFtbWF0aWNhbGx5IHdpbGwgbm90IGhhdmUgdGhlIGV2ZW50XG4gICAgICAgIGlmIChldnQpIHtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY2hhbmdlJywge1xuICAgICAgICAgICAgICAgICRldmVudDogZXZ0LFxuICAgICAgICAgICAgICAgIG5ld1BhbmVJbmRleDogdGhpcy5nZXRQYW5lSW5kZXhCeVJlZihwYW5lUmVmKSxcbiAgICAgICAgICAgICAgICBvbGRQYW5lSW5kZXg6IHRoaXMuZ2V0QWN0aXZlVGFiSW5kZXgoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZ0KSB7XG4gICAgICAgICAgICBoZWFkZXJFbGVtZW50ID0gJChldnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5jbG9zZXN0KCdsaS50YWItaGVhZGVyJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoZWFkZXJFbGVtZW50ID0gdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoYGxpW2RhdGEtcGFuZWlkPSR7cGFuZVJlZi53aWRnZXRJZH1dYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hbmltYXRlSW4oaGVhZGVyRWxlbWVudCk7XG5cbiAgICAgICAgLy8gdGhpcy5zZXRUYWJzTGVmdFBvc2l0aW9uKHRoaXMuZ2V0UGFuZUluZGV4QnlSZWYodGhpcy5hY3RpdmVUYWIpLCB0aGlzLnBhbmVzLmxlbmd0aCk7XG4gICAgICAgIGlmICh0aGlzLmNhblNsaWRlKCkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy50YWJzQW5pbWF0b3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYnNBbmltYXRvciA9IG5ldyBUYWJzQW5pbWF0b3IodGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJzQW5pbWF0b3Iuc2V0R2VzdHVyZXNFbmFibGVkKHRoaXMuY2FuU2xpZGUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRhYnNBbmltYXRvci50cmFuc2l0aW9uVGFiSW50b1ZpZXcoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnb1RvVGFiKHRhYkluZGV4KSB7XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWRQYW5lSW5kZXgodGFiSW5kZXggLSAxKSkge1xuICAgICAgICAgICAgY29uc3QgdGFiID0gdGhpcy5nZXRQYW5lUmVmQnlJbmRleCh0YWJJbmRleCAtIDEpO1xuICAgICAgICAgICAgdGFiLnNlbGVjdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRQYW5lSW5kZXhCeVJlZihwYW5lUmVmOiBUYWJQYW5lQ29tcG9uZW50KTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFuZXMudG9BcnJheSgpLmluZGV4T2YocGFuZVJlZik7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0aGUgYWN0aXZlIHRhYiBpbmRleCBmcm9tIHRhYnMuXG4gICAgcHVibGljIGdldEFjdGl2ZVRhYkluZGV4KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBfLmZpbmRJbmRleCh0aGlzLnBhbmVzLnRvQXJyYXkoKSwge2lzQWN0aXZlOiB0cnVlfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1ZhbGlkUGFuZUluZGV4KGluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIChpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5wYW5lcy5sZW5ndGgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UGFuZVJlZkJ5SW5kZXgoaW5kZXg6IG51bWJlcik6IFRhYlBhbmVDb21wb25lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5wYW5lcy50b0FycmF5KClbaW5kZXhdO1xuICAgIH1cblxuICAgIC8vIHJldHVybnMgZmFsc2UgaWYgdGhlIHBhbmUgaXMgaGlkZGVuIG9yIGRpc2FibGVkXG4gICAgcHJpdmF0ZSBpc1NlbGVjdGFibGVUYWIocGFuZVJlZjogVGFiUGFuZUNvbXBvbmVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gcGFuZVJlZi5zaG93ICYmICFwYW5lUmVmLmRpc2FibGVkO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FuU2xpZGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYW5zaXRpb24gPT09ICdzbGlkZScgJiYgIXRoaXMudmVydGljYWw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTZWxlY3RhYmxlVGFiQWZ0ZXJJbmRleChpbmRleDogbnVtYmVyKTogVGFiUGFuZUNvbXBvbmVudCB7XG4gICAgICAgIGZvciAobGV0IGkgPSBpbmRleCArIDE7IGkgPCB0aGlzLnBhbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwYW5lID0gdGhpcy5nZXRQYW5lUmVmQnlJbmRleChpKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzU2VsZWN0YWJsZVRhYihwYW5lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYW5lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTZWxlY3RhYmxlVGFiQmVmb3JlSW5kZXgoaW5kZXg6IG51bWJlcik6IFRhYlBhbmVDb21wb25lbnQge1xuICAgICAgICBmb3IgKGxldCBpID0gaW5kZXggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgY29uc3QgcGFuZSA9IHRoaXMuZ2V0UGFuZVJlZkJ5SW5kZXgoaSk7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGFibGVUYWIocGFuZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFuZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNlbGVjdCBuZXh0IHRhYiByZWxhdGl2ZSB0byB0aGUgY3VycmVudCBhY3RpdmUgdGFiXG4gICAgcHVibGljIG5leHQoKSB7XG4gICAgICAgIGNvbnN0IHBhbmUgPSB0aGlzLmdldFNlbGVjdGFibGVUYWJBZnRlckluZGV4KHRoaXMuZ2V0QWN0aXZlVGFiSW5kZXgoKSk7XG4gICAgICAgIGlmIChwYW5lKSB7XG4gICAgICAgICAgICBwYW5lLnNlbGVjdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gc2VsZWN0IHByZXYgdGFiIHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50IGFjdGl2ZSB0YWJcbiAgICBwdWJsaWMgcHJldigpIHtcbiAgICAgICAgY29uc3QgcGFuZSA9IHRoaXMuZ2V0U2VsZWN0YWJsZVRhYkJlZm9yZUluZGV4KHRoaXMuZ2V0QWN0aXZlVGFiSW5kZXgoKSk7XG4gICAgICAgIGlmIChwYW5lKSB7XG4gICAgICAgICAgICBwYW5lLnNlbGVjdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdGhpcyBtZXRob2Qgd2lsbCBiZSBpbnZva2VkIGR1cmluZyB0aGUgaW5pdGlhbGl6YXRpb24gb2YgdGhlIGNvbXBvbmVudCBhbmQgb24gZGVmYXVsdHBhbmVpbmRleCBwcm9wZXJ0eSBjaGFuZ2UsXG4gICAgICogaWYgdGhlIHByb3ZpZGVkIGRlZmF1bHRwYW5laW5kZXggaXMgbm90IHZhbGlkLCBmaW5kIHRoZSBmaXJzdCBwYW5lIGluZGV4IHdoaWNoIGNhbiBiZSBzaG93biBhbmQgc2VsZWN0IGl0XG4gICAgICovXG4gICAgcHJpdmF0ZSBzZWxlY3REZWZhdWx0UGFuZUJ5SW5kZXgoaW5kZXg6IG51bWJlcikge1xuICAgICAgICBpZiAoIXRoaXMuaXNWYWxpZFBhbmVJbmRleChpbmRleCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYW5lUmVmID0gdGhpcy5nZXRQYW5lUmVmQnlJbmRleChpbmRleCk7XG4gICAgICAgIGlmICghdGhpcy5pc1NlbGVjdGFibGVUYWIocGFuZVJlZikpIHtcbiAgICAgICAgICAgIHBhbmVSZWYgPSB0aGlzLmdldFNlbGVjdGFibGVUYWJBZnRlckluZGV4KDApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYW5lUmVmKSB7XG4gICAgICAgICAgICBwYW5lUmVmLnNlbGVjdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvLyB1cGRhdGUgdGhlIHBvc3Rpb24gb2YgdGFiIGhlYWRlclxuICAgIHByaXZhdGUgc2V0VGFic1Bvc2l0aW9uKCkge1xuICAgICAgICBjb25zdCB1bCA9IHRoaXMubmF0aXZlRWxlbWVudC5jaGlsZHJlblswXTtcblxuICAgICAgICB0aGlzLnZlcnRpY2FsID0gKHRoaXMudGFic3Bvc2l0aW9uID09PSAnbGVmdCcgfHwgdGhpcy50YWJzcG9zaXRpb24gPT09ICdyaWdodCcpO1xuXG4gICAgICAgIHJlbW92ZUNsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgJ2ludmVydGVkJyk7XG4gICAgICAgIGlmICh0aGlzLnRhYnNwb3NpdGlvbiA9PT0gJ2JvdHRvbScgfHwgdGhpcy50YWJzcG9zaXRpb24gPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgIGFwcGVuZE5vZGUodWwgYXMgSFRNTEVsZW1lbnQsIHRoaXMubmF0aXZlRWxlbWVudCk7XG4gICAgICAgICAgICBhZGRDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdpbnZlcnRlZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3YpIHtcblxuICAgICAgICBpZiAoa2V5ID09PSAnZGVmYXVsdHBhbmVpbmRleCcpIHtcbiAgICAgICAgICAgIC8vIElmIG5vIGFjdGl2ZSB0YWIgaXMgc2V0IGllLi4gbm8gaXNkZWZhdWx0dGFiIHRoZW4gaG9ub3IgdGhlIGRlZmF1bHRwYW5laW5kZXhcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5zZWxlY3REZWZhdWx0UGFuZUJ5SW5kZXgobnYgfHwgMCksIDIwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJUYWJzU2Nyb2xsKCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0ICR1bCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnPiB1bCcpO1xuICAgICAgICAgICAgbGV0ICRsaVBvc2l0aW9uO1xuXG4gICAgICAgICAgICBjb25zdCAgJGxpID0gJHVsLmNoaWxkcmVuKCk7XG4gICAgICAgICAgICAkbGlQb3NpdGlvbiA9ICRsaS5sYXN0KCkucG9zaXRpb24oKTtcbiAgICAgICAgICAgIGlmICgkbGlQb3NpdGlvbiAmJiAoJGxpUG9zaXRpb24ubGVmdCA+ICR1bC53aWR0aCgpKSkge1xuICAgICAgICAgICAgICAgICR1bC5vbignbW91c2V3aGVlbCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnQgPSAkdWxbMF0uc2Nyb2xsTGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kZWx0YSA9IC0xICogZS5vcmlnaW5hbEV2ZW50LndoZWVsRGVsdGE7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgJHVsLmFuaW1hdGUoe3Njcm9sbExlZnQ6IGxlZnQgKyBfZGVsdGF9LCB7J2R1cmF0aW9uJzogMTB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgICAgICB0aGlzLnByb21pc2VSZXNvbHZlckZuKCk7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuICAgICAgICB0aGlzLnNldFRhYnNQb3NpdGlvbigpO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdBZnRlclZpZXdJbml0KCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJUYWJzU2Nyb2xsKCk7XG4gICAgfVxufVxuIl19