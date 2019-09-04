import * as tslib_1 from "tslib";
import { Attribute, Component, ContentChildren, HostBinding, Injector } from '@angular/core';
import { noop, removeAttr } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { registerProps } from './tab-pane.props';
import { StylableComponent } from '../../base/stylable.component';
import { TabsComponent } from '../tabs.component';
import { RedrawableDirective } from '../../redraw/redrawable.directive';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
var DEFAULT_CLS = 'tab-pane';
var WIDGET_CONFIG = {
    widgetType: 'wm-tabpane',
    hostClass: DEFAULT_CLS
};
var TabPaneComponent = /** @class */ (function (_super) {
    tslib_1.__extends(TabPaneComponent, _super);
    function TabPaneComponent(inj, tabsRef, heading, title) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.tabsRef = tabsRef;
        _this.heading = heading;
        _this.title = title;
        _this.$lazyLoad = noop;
        _this.isActive = false;
        _this.disabled = false;
        // title property here serves the purpose of heading.
        // TODO: make it common for all the widget.
        removeAttr(_this.nativeElement, 'title');
        return _this;
    }
    // parent tabs component will call this method for the order of callbacks to be proper
    // order of callbacks - deselect, select, change
    TabPaneComponent.prototype.invokeOnSelectCallback = function ($event) {
        this.invokeEventCallback('select', { $event: $event });
    };
    TabPaneComponent.prototype.select = function ($event) {
        // When called programatically $event won't be available
        if (this.isActive || this.disabled) {
            return;
        }
        this.isActive = true;
        this.$lazyLoad();
        this.redrawChildren();
        this.notifyParent($event);
        if ($event) {
            $event.stopPropagation();
            $event.preventDefault();
        }
    };
    TabPaneComponent.prototype.deselect = function () {
        if (this.isActive) {
            this.isActive = false;
            this.invokeEventCallback('deselect');
        }
    };
    TabPaneComponent.prototype.redrawChildren = function () {
        var _this = this;
        setTimeout(function () {
            if (_this.reDrawableComponents) {
                _this.reDrawableComponents.forEach(function (c) { return c.redraw(); });
            }
        }, 100);
    };
    TabPaneComponent.prototype.notifyParent = function (evt) {
        this.tabsRef.notifyChange(this, evt);
    };
    // select next valid tab
    TabPaneComponent.prototype.handleSwipeLeft = function () {
        this.tabsRef.next();
    };
    // select prev valid tab
    TabPaneComponent.prototype.handleSwipeRight = function () {
        this.tabsRef.prev();
    };
    // select event is called manually
    TabPaneComponent.prototype.handleEvent = function (node, eventName, callback, locals) {
        if (eventName !== 'select') {
            _super.prototype.handleEvent.call(this, this.nativeElement, eventName, callback, locals);
        }
    };
    TabPaneComponent.prototype.onPropertyChange = function (key, nv, ov) {
        var _this = this;
        if (key === 'content') {
            if (this.isActive) {
                setTimeout(function () { return _this.$lazyLoad(); }, 100);
            }
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    TabPaneComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.title = this.title || this.heading;
    };
    TabPaneComponent.prototype.ngAfterViewInit = function () {
        styler(this.nativeElement.querySelector('.tab-body'), this, APPLY_STYLES_TYPE.CONTAINER);
        _super.prototype.ngAfterViewInit.call(this);
    };
    TabPaneComponent.initializeProps = registerProps();
    TabPaneComponent.decorators = [
        { type: Component, args: [{
                    selector: 'div[wmTabPane]',
                    template: "<div class=\"tab-body\" partial-container-target [wmSmoothscroll]=\"smoothscroll\">\n    <ng-content></ng-content>\n</div>",
                    providers: [
                        provideAsWidgetRef(TabPaneComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    TabPaneComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: TabsComponent },
        { type: undefined, decorators: [{ type: Attribute, args: ['heading',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['title',] }] }
    ]; };
    TabPaneComponent.propDecorators = {
        isActive: [{ type: HostBinding, args: ['class.active',] }],
        disabled: [{ type: HostBinding, args: ['class.disabled',] }],
        reDrawableComponents: [{ type: ContentChildren, args: [RedrawableDirective, { descendants: true },] }]
    };
    return TabPaneComponent;
}(StylableComponent));
export { TabPaneComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLXBhbmUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90YWJzL3RhYi1wYW5lL3RhYi1wYW5lLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBRXBILE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTVDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRXBFLElBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUMvQixJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLFlBQVk7SUFDeEIsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQUVGO0lBT3NDLDRDQUFpQjtJQWNuRCwwQkFDSSxHQUFhLEVBQ0wsT0FBc0IsRUFDRCxPQUFPLEVBQ1QsS0FBSztRQUpwQyxZQU1JLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FLNUI7UUFUVyxhQUFPLEdBQVAsT0FBTyxDQUFlO1FBQ0QsYUFBTyxHQUFQLE9BQU8sQ0FBQTtRQUNULFdBQUssR0FBTCxLQUFLLENBQUE7UUFmN0IsZUFBUyxHQUFHLElBQUksQ0FBQztRQUtLLGNB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SyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDNUMsQ0FBQztJQUVELDBDQUFlLEdBQWY7UUFDSSxNQUFNLENBQ0YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFnQixFQUM1RCxJQUFJLEVBQ0osaUJBQWlCLENBQUMsU0FBUyxDQUM5QixDQUFDO1FBQ0YsaUJBQU0sZUFBZSxXQUFFLENBQUM7SUFDNUIsQ0FBQztJQTNHTSxnQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFSNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLHNJQUF3QztvQkFDeEMsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDO3FCQUN2QztpQkFDSjs7OztnQkF4QjJFLFFBQVE7Z0JBUTNFLGFBQWE7Z0RBa0NiLFNBQVMsU0FBQyxTQUFTO2dEQUNuQixTQUFTLFNBQUMsT0FBTzs7OzJCQVZyQixXQUFXLFNBQUMsY0FBYzsyQkFDMUIsV0FBVyxTQUFDLGdCQUFnQjt1Q0FHNUIsZUFBZSxTQUFDLG1CQUFtQixFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQzs7SUFpRzdELHVCQUFDO0NBQUEsQUFwSEQsQ0FPc0MsaUJBQWlCLEdBNkd0RDtTQTdHWSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBBdHRyaWJ1dGUsIENvbXBvbmVudCwgQ29udGVudENoaWxkcmVuLCBIb3N0QmluZGluZywgSW5qZWN0b3IsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBub29wLCByZW1vdmVBdHRyIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3RhYi1wYW5lLnByb3BzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgVGFic0NvbXBvbmVudCB9IGZyb20gJy4uL3RhYnMuY29tcG9uZW50JztcbmltcG9ydCB7IFJlZHJhd2FibGVEaXJlY3RpdmUgfSBmcm9tICcuLi8uLi9yZWRyYXcvcmVkcmF3YWJsZS5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAndGFiLXBhbmUnO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tdGFicGFuZScsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21UYWJQYW5lXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3RhYi1wYW5lLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFRhYlBhbmVDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBUYWJQYW5lQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgJGxhenlMb2FkID0gbm9vcDtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyBzaG93OiBib29sZWFuO1xuICAgIHB1YmxpYyBzbW9vdGhzY3JvbGw6IGFueTtcblxuICAgIEBIb3N0QmluZGluZygnY2xhc3MuYWN0aXZlJykgaXNBY3RpdmUgPSBmYWxzZTtcbiAgICBASG9zdEJpbmRpbmcoJ2NsYXNzLmRpc2FibGVkJykgZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIC8vIHJlZmVyZW5jZSB0byB0aGUgY29tcG9uZW50cyB3aGljaCBuZWVkcyBhIHJlZHJhdyhlZywgZ3JpZCwgY2hhcnQpIHdoZW4gdGhlIGhlaWdodCBvZiB0aGlzIGNvbXBvbmVudCBjaGFuZ2VzXG4gICAgQENvbnRlbnRDaGlsZHJlbihSZWRyYXdhYmxlRGlyZWN0aXZlLCB7ZGVzY2VuZGFudHM6IHRydWV9KSByZURyYXdhYmxlQ29tcG9uZW50cztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBwcml2YXRlIHRhYnNSZWY6IFRhYnNDb21wb25lbnQsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2hlYWRpbmcnKSBwdWJsaWMgaGVhZGluZyxcbiAgICAgICAgQEF0dHJpYnV0ZSgndGl0bGUnKSBwdWJsaWMgdGl0bGVcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICAvLyB0aXRsZSBwcm9wZXJ0eSBoZXJlIHNlcnZlcyB0aGUgcHVycG9zZSBvZiBoZWFkaW5nLlxuICAgICAgICAvLyBUT0RPOiBtYWtlIGl0IGNvbW1vbiBmb3IgYWxsIHRoZSB3aWRnZXQuXG4gICAgICAgIHJlbW92ZUF0dHIodGhpcy5uYXRpdmVFbGVtZW50LCAndGl0bGUnKTtcbiAgICB9XG5cbiAgICAvLyBwYXJlbnQgdGFicyBjb21wb25lbnQgd2lsbCBjYWxsIHRoaXMgbWV0aG9kIGZvciB0aGUgb3JkZXIgb2YgY2FsbGJhY2tzIHRvIGJlIHByb3BlclxuICAgIC8vIG9yZGVyIG9mIGNhbGxiYWNrcyAtIGRlc2VsZWN0LCBzZWxlY3QsIGNoYW5nZVxuICAgIHB1YmxpYyBpbnZva2VPblNlbGVjdENhbGxiYWNrKCRldmVudD86IEV2ZW50KSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc2VsZWN0JywgeyRldmVudH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZWxlY3QoJGV2ZW50PzogRXZlbnQpIHtcbiAgICAgICAgLy8gV2hlbiBjYWxsZWQgcHJvZ3JhbWF0aWNhbGx5ICRldmVudCB3b24ndCBiZSBhdmFpbGFibGVcbiAgICAgICAgaWYgKHRoaXMuaXNBY3RpdmUgfHwgdGhpcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuJGxhenlMb2FkKCk7XG4gICAgICAgIHRoaXMucmVkcmF3Q2hpbGRyZW4oKTtcbiAgICAgICAgdGhpcy5ub3RpZnlQYXJlbnQoJGV2ZW50KTtcblxuICAgICAgICBpZiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkZXNlbGVjdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnZGVzZWxlY3QnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVkcmF3Q2hpbGRyZW4oKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVEcmF3YWJsZUNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlRHJhd2FibGVDb21wb25lbnRzLmZvckVhY2goYyA9PiBjLnJlZHJhdygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG5vdGlmeVBhcmVudChldnQ/OiBFdmVudCkge1xuICAgICAgICB0aGlzLnRhYnNSZWYubm90aWZ5Q2hhbmdlKHRoaXMsIGV2dCk7XG4gICAgfVxuXG4gICAgLy8gc2VsZWN0IG5leHQgdmFsaWQgdGFiXG4gICAgcHJpdmF0ZSBoYW5kbGVTd2lwZUxlZnQoKSB7XG4gICAgICAgIHRoaXMudGFic1JlZi5uZXh0KCk7XG4gICAgfVxuXG4gICAgLy8gc2VsZWN0IHByZXYgdmFsaWQgdGFiXG4gICAgcHJpdmF0ZSBoYW5kbGVTd2lwZVJpZ2h0KCkge1xuICAgICAgICB0aGlzLnRhYnNSZWYucHJldigpO1xuICAgIH1cblxuICAgIC8vIHNlbGVjdCBldmVudCBpcyBjYWxsZWQgbWFudWFsbHlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIGxvY2FsczogYW55KSB7XG4gICAgICAgIGlmIChldmVudE5hbWUgIT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICBzdXBlci5oYW5kbGVFdmVudCh0aGlzLm5hdGl2ZUVsZW1lbnQsIGV2ZW50TmFtZSwgY2FsbGJhY2ssIGxvY2Fscyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnY29udGVudCcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLiRsYXp5TG9hZCgpLCAxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy50aXRsZSA9IHRoaXMudGl0bGUgfHwgdGhpcy5oZWFkaW5nO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgc3R5bGVyKFxuICAgICAgICAgICAgdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50YWItYm9keScpIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIEFQUExZX1NUWUxFU19UWVBFLkNPTlRBSU5FUlxuICAgICAgICApO1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICB9XG59XG4iXX0=