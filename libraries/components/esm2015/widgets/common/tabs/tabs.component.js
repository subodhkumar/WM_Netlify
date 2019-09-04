import { Attribute, Component, ContentChildren, Injector, QueryList } from '@angular/core';
import { addClass, appendNode, noop, removeClass } from '@wm/core';
import { TabsAnimator } from './tabs.animator';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './tabs.props';
import { StylableComponent } from '../base/stylable.component';
import { TabPaneComponent } from './tab-pane/tab-pane.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'app-tabs clearfix';
const WIDGET_CONFIG = {
    widgetType: 'wm-tabs',
    hostClass: DEFAULT_CLS
};
export class TabsComponent extends StylableComponent {
    constructor(inj, _transition, _tabsPosition) {
        // handle to the promise resolver
        let resolveFn = noop;
        super(inj, WIDGET_CONFIG, new Promise(res => resolveFn = res));
        this.transition = _transition;
        this.tabsposition = _tabsPosition;
        this.promiseResolverFn = resolveFn;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
    animateIn(element) {
        const tabHeader = $(element);
        // when the animation is not present toggle the active class.
        tabHeader.siblings('.active').removeClass('active');
        tabHeader.addClass('active');
        const ul = this.nativeElement.querySelector('ul.nav.nav-tabs');
        // move the tabheader into the viewport
        const $prevHeaderEle = tabHeader.prev();
        if ($prevHeaderEle.length) {
            ul.scrollLeft = $prevHeaderEle[0].offsetLeft;
        }
        else {
            ul.scrollLeft = 0;
        }
    }
    /**
     * TabPane children components invoke this method to communicate with the parent
     * if the evt argument is defined on-change callback will be invoked.
     */
    notifyChange(paneRef, evt) {
        if (!this.isSelectableTab(paneRef)) {
            return;
        }
        let headerElement;
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
            headerElement = this.nativeElement.querySelector(`li[data-paneid=${paneRef.widgetId}]`);
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
    }
    goToTab(tabIndex) {
        if (this.isValidPaneIndex(tabIndex - 1)) {
            const tab = this.getPaneRefByIndex(tabIndex - 1);
            tab.select();
        }
    }
    getPaneIndexByRef(paneRef) {
        return this.panes.toArray().indexOf(paneRef);
    }
    // Returns the active tab index from tabs.
    getActiveTabIndex() {
        return _.findIndex(this.panes.toArray(), { isActive: true });
    }
    isValidPaneIndex(index) {
        return (index >= 0 && index < this.panes.length);
    }
    getPaneRefByIndex(index) {
        return this.panes.toArray()[index];
    }
    // returns false if the pane is hidden or disabled
    isSelectableTab(paneRef) {
        return paneRef.show && !paneRef.disabled;
    }
    canSlide() {
        return this.transition === 'slide' && !this.vertical;
    }
    getSelectableTabAfterIndex(index) {
        for (let i = index + 1; i < this.panes.length; i++) {
            const pane = this.getPaneRefByIndex(i);
            if (this.isSelectableTab(pane)) {
                return pane;
            }
        }
    }
    getSelectableTabBeforeIndex(index) {
        for (let i = index - 1; i >= 0; i--) {
            const pane = this.getPaneRefByIndex(i);
            if (this.isSelectableTab(pane)) {
                return pane;
            }
        }
    }
    // select next tab relative to the current active tab
    next() {
        const pane = this.getSelectableTabAfterIndex(this.getActiveTabIndex());
        if (pane) {
            pane.select();
        }
    }
    // select prev tab relative to the current active tab
    prev() {
        const pane = this.getSelectableTabBeforeIndex(this.getActiveTabIndex());
        if (pane) {
            pane.select();
        }
    }
    /**
     * this method will be invoked during the initialization of the component and on defaultpaneindex property change,
     * if the provided defaultpaneindex is not valid, find the first pane index which can be shown and select it
     */
    selectDefaultPaneByIndex(index) {
        if (!this.isValidPaneIndex(index)) {
            return;
        }
        let paneRef = this.getPaneRefByIndex(index);
        if (!this.isSelectableTab(paneRef)) {
            paneRef = this.getSelectableTabAfterIndex(0);
        }
        if (paneRef) {
            paneRef.select();
        }
    }
    // update the postion of tab header
    setTabsPosition() {
        const ul = this.nativeElement.children[0];
        this.vertical = (this.tabsposition === 'left' || this.tabsposition === 'right');
        removeClass(this.nativeElement, 'inverted');
        if (this.tabsposition === 'bottom' || this.tabsposition === 'right') {
            appendNode(ul, this.nativeElement);
            addClass(this.nativeElement, 'inverted');
        }
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'defaultpaneindex') {
            // If no active tab is set ie.. no isdefaulttab then honor the defaultpaneindex
            setTimeout(() => this.selectDefaultPaneByIndex(nv || 0), 20);
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    registerTabsScroll() {
        setTimeout(() => {
            const $ul = this.$element.find('> ul');
            let $liPosition;
            const $li = $ul.children();
            $liPosition = $li.last().position();
            if ($liPosition && ($liPosition.left > $ul.width())) {
                $ul.on('mousewheel', (e) => {
                    const left = $ul[0].scrollLeft, _delta = -1 * e.originalEvent.wheelDelta;
                    e.stopPropagation();
                    e.preventDefault();
                    $ul.animate({ scrollLeft: left + _delta }, { 'duration': 10 });
                });
            }
        });
    }
    ngAfterContentInit() {
        this.promiseResolverFn();
        super.ngAfterContentInit();
        this.setTabsPosition();
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.registerTabsScroll();
    }
}
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
TabsComponent.ctorParameters = () => [
    { type: Injector },
    { type: String, decorators: [{ type: Attribute, args: ['transition',] }] },
    { type: String, decorators: [{ type: Attribute, args: ['tabsposition',] }] }
];
TabsComponent.propDecorators = {
    panes: [{ type: ContentChildren, args: [TabPaneComponent,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFicy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RhYnMvdGFicy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFtQyxTQUFTLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQVUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBJLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbkUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVuRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBSWpFLE1BQU0sV0FBVyxHQUFHLG1CQUFtQixDQUFDO0FBQ3hDLE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsU0FBUztJQUNyQixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFDO0FBU0YsTUFBTSxPQUFPLGFBQWMsU0FBUSxpQkFBaUI7SUFlaEQsWUFDSSxHQUFhLEVBQ1ksV0FBbUIsRUFDakIsYUFBcUI7UUFFaEQsaUNBQWlDO1FBQ2pDLElBQUksU0FBUyxHQUFhLElBQUksQ0FBQztRQUUvQixLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFD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QUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsYUFBYSxDQUFDO2lCQUNwQzthQUNKOzs7O1lBMUJnRixRQUFRO3lDQTRDaEYsU0FBUyxTQUFDLFlBQVk7eUNBQ3RCLFNBQVMsU0FBQyxjQUFjOzs7b0JBTDVCLGVBQWUsU0FBQyxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlckNvbnRlbnRJbml0LCBBZnRlclZpZXdJbml0LCBBdHRyaWJ1dGUsIENvbXBvbmVudCwgQ29udGVudENoaWxkcmVuLCBJbmplY3RvciwgT25Jbml0LCBRdWVyeUxpc3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgYWRkQ2xhc3MsIGFwcGVuZE5vZGUsIG5vb3AsIHJlbW92ZUNsYXNzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBUYWJzQW5pbWF0b3IgfSBmcm9tICcuL3RhYnMuYW5pbWF0b3InO1xuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi90YWJzLnByb3BzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgVGFiUGFuZUNvbXBvbmVudCB9IGZyb20gJy4vdGFiLXBhbmUvdGFiLXBhbmUuY29tcG9uZW50JztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXywgJDtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXRhYnMgY2xlYXJmaXgnO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tdGFicycsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21UYWJzXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3RhYnMuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoVGFic0NvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFRhYnNDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBkZWZhdWx0cGFuZWluZGV4OiBudW1iZXI7XG4gICAgcHVibGljIHRyYW5zaXRpb246IHN0cmluZztcbiAgICBwdWJsaWMgdGFic3Bvc2l0aW9uOiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgdmVydGljYWw6IGJvb2xlYW47XG4gICAgcHVibGljIGp1c3RpZmllZDogYm9vbGVhbjtcbiAgICBwcml2YXRlIGFjdGl2ZVRhYjogVGFiUGFuZUNvbXBvbmVudDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHByb21pc2VSZXNvbHZlckZuOiBGdW5jdGlvbjtcbiAgICBwcml2YXRlIHRhYnNBbmltYXRvcjogVGFic0FuaW1hdG9yO1xuXG4gICAgQENvbnRlbnRDaGlsZHJlbihUYWJQYW5lQ29tcG9uZW50KSBwYW5lczogUXVlcnlMaXN0PFRhYlBhbmVDb21wb25lbnQ+O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ3RyYW5zaXRpb24nKSBfdHJhbnNpdGlvbjogc3RyaW5nLFxuICAgICAgICBAQXR0cmlidXRlKCd0YWJzcG9zaXRpb24nKSBfdGFic1Bvc2l0aW9uOiBzdHJpbmdcbiAgICApIHtcbiAgICAgICAgLy8gaGFuZGxlIHRvIHRoZSBwcm9taXNlIHJlc29sdmVyXG4gICAgICAgIGxldCByZXNvbHZlRm46IEZ1bmN0aW9uID0gbm9vcDtcblxuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcsIG5ldyBQcm9taXNlKHJlcyA9PiByZXNvbHZlRm4gPSByZXMpKTtcblxuICAgICAgICB0aGlzLnRyYW5zaXRpb24gPSBfdHJhbnNpdGlvbjtcbiAgICAgICAgdGhpcy50YWJzcG9zaXRpb24gPSBfdGFic1Bvc2l0aW9uO1xuXG4gICAgICAgIHRoaXMucHJvbWlzZVJlc29sdmVyRm4gPSByZXNvbHZlRm47XG5cbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuQ09OVEFJTkVSKTtcbiAgICB9XG5cbiAgICBhbmltYXRlSW4gKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHRhYkhlYWRlciA9ICQoZWxlbWVudCk7XG4gICAgICAgIC8vIHdoZW4gdGhlIGFuaW1hdGlvbiBpcyBub3QgcHJlc2VudCB0b2dnbGUgdGhlIGFjdGl2ZSBjbGFzcy5cbiAgICAgICAgdGFiSGVhZGVyLnNpYmxpbmdzKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB0YWJIZWFkZXIuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgICAgIGNvbnN0IHVsID0gdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3VsLm5hdi5uYXYtdGFicycpO1xuXG4gICAgICAgIC8vIG1vdmUgdGhlIHRhYmhlYWRlciBpbnRvIHRoZSB2aWV3cG9ydFxuICAgICAgICBjb25zdCAkcHJldkhlYWRlckVsZSA9IHRhYkhlYWRlci5wcmV2KCk7XG4gICAgICAgIGlmICgkcHJldkhlYWRlckVsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHVsLnNjcm9sbExlZnQgPSAkcHJldkhlYWRlckVsZVswXS5vZmZzZXRMZWZ0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdWwuc2Nyb2xsTGVmdCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUYWJQYW5lIGNoaWxkcmVuIGNvbXBvbmVudHMgaW52b2tlIHRoaXMgbWV0aG9kIHRvIGNvbW11bmljYXRlIHdpdGggdGhlIHBhcmVudFxuICAgICAqIGlmIHRoZSBldnQgYXJndW1lbnQgaXMgZGVmaW5lZCBvbi1jaGFuZ2UgY2FsbGJhY2sgd2lsbCBiZSBpbnZva2VkLlxuICAgICAqL1xuICAgIHB1YmxpYyBub3RpZnlDaGFuZ2UocGFuZVJlZjogVGFiUGFuZUNvbXBvbmVudCwgZXZ0OiBFdmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNTZWxlY3RhYmxlVGFiKHBhbmVSZWYpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaGVhZGVyRWxlbWVudDtcbiAgICAgICAgLy8gaW52b2tlIGRlc2VsZWN0IGV2ZW50IGNhbGxiYWNrIG9uIHRoZSBwcmVzZXQgYWN0aXZlIHRhYlxuICAgICAgICBpZiAodGhpcy5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlVGFiLmRlc2VsZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpbnZva2Ugc2VsZWN0IGNhbGxiYWNrIG9uIHRoZSBzZWxlY3RlZCB0YWJcbiAgICAgICAgcGFuZVJlZi5pbnZva2VPblNlbGVjdENhbGxiYWNrKGV2dCk7XG5cbiAgICAgICAgdGhpcy5hY3RpdmVUYWIgPSBwYW5lUmVmLmdldFdpZGdldCgpO1xuXG4gICAgICAgIC8vIGludm9rZSBjaGFuZ2UgY2FsbGJhY2sgaWYgdGhlIGV2dCBpcyBwcmVzZW50LCBzZWxlY3QgYSB0YWIgcHJvZ3JhbW1hdGljYWxseSB3aWxsIG5vdCBoYXZlIHRoZSBldmVudFxuICAgICAgICBpZiAoZXZ0KSB7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2NoYW5nZScsIHtcbiAgICAgICAgICAgICAgICAkZXZlbnQ6IGV2dCxcbiAgICAgICAgICAgICAgICBuZXdQYW5lSW5kZXg6IHRoaXMuZ2V0UGFuZUluZGV4QnlSZWYocGFuZVJlZiksXG4gICAgICAgICAgICAgICAgb2xkUGFuZUluZGV4OiB0aGlzLmdldEFjdGl2ZVRhYkluZGV4KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2dCkge1xuICAgICAgICAgICAgaGVhZGVyRWxlbWVudCA9ICQoZXZ0LnRhcmdldCBhcyBIVE1MRWxlbWVudCkuY2xvc2VzdCgnbGkudGFiLWhlYWRlcicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGVhZGVyRWxlbWVudCA9IHRoaXMubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKGBsaVtkYXRhLXBhbmVpZD0ke3BhbmVSZWYud2lkZ2V0SWR9XWApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYW5pbWF0ZUluKGhlYWRlckVsZW1lbnQpO1xuXG4gICAgICAgIC8vIHRoaXMuc2V0VGFic0xlZnRQb3NpdGlvbih0aGlzLmdldFBhbmVJbmRleEJ5UmVmKHRoaXMuYWN0aXZlVGFiKSwgdGhpcy5wYW5lcy5sZW5ndGgpO1xuICAgICAgICBpZiAodGhpcy5jYW5TbGlkZSgpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMudGFic0FuaW1hdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJzQW5pbWF0b3IgPSBuZXcgVGFic0FuaW1hdG9yKHRoaXMpO1xuICAgICAgICAgICAgICAgIHRoaXMudGFic0FuaW1hdG9yLnNldEdlc3R1cmVzRW5hYmxlZCh0aGlzLmNhblNsaWRlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50YWJzQW5pbWF0b3IudHJhbnNpdGlvblRhYkludG9WaWV3KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ29Ub1RhYih0YWJJbmRleCkge1xuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkUGFuZUluZGV4KHRhYkluZGV4IC0gMSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhYiA9IHRoaXMuZ2V0UGFuZVJlZkJ5SW5kZXgodGFiSW5kZXggLSAxKTtcbiAgICAgICAgICAgIHRhYi5zZWxlY3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UGFuZUluZGV4QnlSZWYocGFuZVJlZjogVGFiUGFuZUNvbXBvbmVudCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhbmVzLnRvQXJyYXkoKS5pbmRleE9mKHBhbmVSZWYpO1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgdGhlIGFjdGl2ZSB0YWIgaW5kZXggZnJvbSB0YWJzLlxuICAgIHB1YmxpYyBnZXRBY3RpdmVUYWJJbmRleCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gXy5maW5kSW5kZXgodGhpcy5wYW5lcy50b0FycmF5KCksIHtpc0FjdGl2ZTogdHJ1ZX0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNWYWxpZFBhbmVJbmRleChpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMucGFuZXMubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFBhbmVSZWZCeUluZGV4KGluZGV4OiBudW1iZXIpOiBUYWJQYW5lQ29tcG9uZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFuZXMudG9BcnJheSgpW2luZGV4XTtcbiAgICB9XG5cbiAgICAvLyByZXR1cm5zIGZhbHNlIGlmIHRoZSBwYW5lIGlzIGhpZGRlbiBvciBkaXNhYmxlZFxuICAgIHByaXZhdGUgaXNTZWxlY3RhYmxlVGFiKHBhbmVSZWY6IFRhYlBhbmVDb21wb25lbnQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHBhbmVSZWYuc2hvdyAmJiAhcGFuZVJlZi5kaXNhYmxlZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNhblNsaWRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2l0aW9uID09PSAnc2xpZGUnICYmICF0aGlzLnZlcnRpY2FsO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U2VsZWN0YWJsZVRhYkFmdGVySW5kZXgoaW5kZXg6IG51bWJlcik6IFRhYlBhbmVDb21wb25lbnQge1xuICAgICAgICBmb3IgKGxldCBpID0gaW5kZXggKyAxOyBpIDwgdGhpcy5wYW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGFuZSA9IHRoaXMuZ2V0UGFuZVJlZkJ5SW5kZXgoaSk7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGFibGVUYWIocGFuZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFuZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U2VsZWN0YWJsZVRhYkJlZm9yZUluZGV4KGluZGV4OiBudW1iZXIpOiBUYWJQYW5lQ29tcG9uZW50IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IGluZGV4IC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IHBhbmUgPSB0aGlzLmdldFBhbmVSZWZCeUluZGV4KGkpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RhYmxlVGFiKHBhbmUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhbmU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzZWxlY3QgbmV4dCB0YWIgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnQgYWN0aXZlIHRhYlxuICAgIHB1YmxpYyBuZXh0KCkge1xuICAgICAgICBjb25zdCBwYW5lID0gdGhpcy5nZXRTZWxlY3RhYmxlVGFiQWZ0ZXJJbmRleCh0aGlzLmdldEFjdGl2ZVRhYkluZGV4KCkpO1xuICAgICAgICBpZiAocGFuZSkge1xuICAgICAgICAgICAgcGFuZS5zZWxlY3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNlbGVjdCBwcmV2IHRhYiByZWxhdGl2ZSB0byB0aGUgY3VycmVudCBhY3RpdmUgdGFiXG4gICAgcHVibGljIHByZXYoKSB7XG4gICAgICAgIGNvbnN0IHBhbmUgPSB0aGlzLmdldFNlbGVjdGFibGVUYWJCZWZvcmVJbmRleCh0aGlzLmdldEFjdGl2ZVRhYkluZGV4KCkpO1xuICAgICAgICBpZiAocGFuZSkge1xuICAgICAgICAgICAgcGFuZS5zZWxlY3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHRoaXMgbWV0aG9kIHdpbGwgYmUgaW52b2tlZCBkdXJpbmcgdGhlIGluaXRpYWxpemF0aW9uIG9mIHRoZSBjb21wb25lbnQgYW5kIG9uIGRlZmF1bHRwYW5laW5kZXggcHJvcGVydHkgY2hhbmdlLFxuICAgICAqIGlmIHRoZSBwcm92aWRlZCBkZWZhdWx0cGFuZWluZGV4IGlzIG5vdCB2YWxpZCwgZmluZCB0aGUgZmlyc3QgcGFuZSBpbmRleCB3aGljaCBjYW4gYmUgc2hvd24gYW5kIHNlbGVjdCBpdFxuICAgICAqL1xuICAgIHByaXZhdGUgc2VsZWN0RGVmYXVsdFBhbmVCeUluZGV4KGluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWRQYW5lSW5kZXgoaW5kZXgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFuZVJlZiA9IHRoaXMuZ2V0UGFuZVJlZkJ5SW5kZXgoaW5kZXgpO1xuICAgICAgICBpZiAoIXRoaXMuaXNTZWxlY3RhYmxlVGFiKHBhbmVSZWYpKSB7XG4gICAgICAgICAgICBwYW5lUmVmID0gdGhpcy5nZXRTZWxlY3RhYmxlVGFiQWZ0ZXJJbmRleCgwKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFuZVJlZikge1xuICAgICAgICAgICAgcGFuZVJlZi5zZWxlY3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLy8gdXBkYXRlIHRoZSBwb3N0aW9uIG9mIHRhYiBoZWFkZXJcbiAgICBwcml2YXRlIHNldFRhYnNQb3NpdGlvbigpIHtcbiAgICAgICAgY29uc3QgdWwgPSB0aGlzLm5hdGl2ZUVsZW1lbnQuY2hpbGRyZW5bMF07XG5cbiAgICAgICAgdGhpcy52ZXJ0aWNhbCA9ICh0aGlzLnRhYnNwb3NpdGlvbiA9PT0gJ2xlZnQnIHx8IHRoaXMudGFic3Bvc2l0aW9uID09PSAncmlnaHQnKTtcblxuICAgICAgICByZW1vdmVDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdpbnZlcnRlZCcpO1xuICAgICAgICBpZiAodGhpcy50YWJzcG9zaXRpb24gPT09ICdib3R0b20nIHx8IHRoaXMudGFic3Bvc2l0aW9uID09PSAncmlnaHQnKSB7XG4gICAgICAgICAgICBhcHBlbmROb2RlKHVsIGFzIEhUTUxFbGVtZW50LCB0aGlzLm5hdGl2ZUVsZW1lbnQpO1xuICAgICAgICAgICAgYWRkQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCAnaW52ZXJ0ZWQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92KSB7XG5cbiAgICAgICAgaWYgKGtleSA9PT0gJ2RlZmF1bHRwYW5laW5kZXgnKSB7XG4gICAgICAgICAgICAvLyBJZiBubyBhY3RpdmUgdGFiIGlzIHNldCBpZS4uIG5vIGlzZGVmYXVsdHRhYiB0aGVuIGhvbm9yIHRoZSBkZWZhdWx0cGFuZWluZGV4XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuc2VsZWN0RGVmYXVsdFBhbmVCeUluZGV4KG52IHx8IDApLCAyMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlZ2lzdGVyVGFic1Njcm9sbCgpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCAkdWwgPSB0aGlzLiRlbGVtZW50LmZpbmQoJz4gdWwnKTtcbiAgICAgICAgICAgIGxldCAkbGlQb3NpdGlvbjtcblxuICAgICAgICAgICAgY29uc3QgICRsaSA9ICR1bC5jaGlsZHJlbigpO1xuICAgICAgICAgICAgJGxpUG9zaXRpb24gPSAkbGkubGFzdCgpLnBvc2l0aW9uKCk7XG4gICAgICAgICAgICBpZiAoJGxpUG9zaXRpb24gJiYgKCRsaVBvc2l0aW9uLmxlZnQgPiAkdWwud2lkdGgoKSkpIHtcbiAgICAgICAgICAgICAgICAkdWwub24oJ21vdXNld2hlZWwnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0ID0gJHVsWzBdLnNjcm9sbExlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBfZGVsdGEgPSAtMSAqIGUub3JpZ2luYWxFdmVudC53aGVlbERlbHRhO1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICR1bC5hbmltYXRlKHtzY3JvbGxMZWZ0OiBsZWZ0ICsgX2RlbHRhfSwgeydkdXJhdGlvbic6IDEwfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICAgICAgdGhpcy5wcm9taXNlUmVzb2x2ZXJGbigpO1xuICAgICAgICBzdXBlci5uZ0FmdGVyQ29udGVudEluaXQoKTtcbiAgICAgICAgdGhpcy5zZXRUYWJzUG9zaXRpb24oKTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyVGFic1Njcm9sbCgpO1xuICAgIH1cbn1cbiJdfQ==