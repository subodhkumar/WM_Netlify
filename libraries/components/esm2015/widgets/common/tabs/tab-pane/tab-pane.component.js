import { Attribute, Component, ContentChildren, HostBinding, Injector } from '@angular/core';
import { noop, removeAttr } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { registerProps } from './tab-pane.props';
import { StylableComponent } from '../../base/stylable.component';
import { TabsComponent } from '../tabs.component';
import { RedrawableDirective } from '../../redraw/redrawable.directive';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
const DEFAULT_CLS = 'tab-pane';
const WIDGET_CONFIG = {
    widgetType: 'wm-tabpane',
    hostClass: DEFAULT_CLS
};
export class TabPaneComponent extends StylableComponent {
    constructor(inj, tabsRef, heading, title) {
        super(inj, WIDGET_CONFIG);
        this.tabsRef = tabsRef;
        this.heading = heading;
        this.title = title;
        this.$lazyLoad = noop;
        this.isActive = false;
        this.disabled = false;
        // title property here serves the purpose of heading.
        // TODO: make it common for all the widget.
        removeAttr(this.nativeElement, 'title');
    }
    // parent tabs component will call this method for the order of callbacks to be proper
    // order of callbacks - deselect, select, change
    invokeOnSelectCallback($event) {
        this.invokeEventCallback('select', { $event });
    }
    select($event) {
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
    }
    deselect() {
        if (this.isActive) {
            this.isActive = false;
            this.invokeEventCallback('deselect');
        }
    }
    redrawChildren() {
        setTimeout(() => {
            if (this.reDrawableComponents) {
                this.reDrawableComponents.forEach(c => c.redraw());
            }
        }, 100);
    }
    notifyParent(evt) {
        this.tabsRef.notifyChange(this, evt);
    }
    // select next valid tab
    handleSwipeLeft() {
        this.tabsRef.next();
    }
    // select prev valid tab
    handleSwipeRight() {
        this.tabsRef.prev();
    }
    // select event is called manually
    handleEvent(node, eventName, callback, locals) {
        if (eventName !== 'select') {
            super.handleEvent(this.nativeElement, eventName, callback, locals);
        }
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'content') {
            if (this.isActive) {
                setTimeout(() => this.$lazyLoad(), 100);
            }
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    ngOnInit() {
        super.ngOnInit();
        this.title = this.title || this.heading;
    }
    ngAfterViewInit() {
        styler(this.nativeElement.querySelector('.tab-body'), this, APPLY_STYLES_TYPE.CONTAINER);
        super.ngAfterViewInit();
    }
}
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
TabPaneComponent.ctorParameters = () => [
    { type: Injector },
    { type: TabsComponent },
    { type: undefined, decorators: [{ type: Attribute, args: ['heading',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['title',] }] }
];
TabPaneComponent.propDecorators = {
    isActive: [{ type: HostBinding, args: ['class.active',] }],
    disabled: [{ type: HostBinding, args: ['class.disabled',] }],
    reDrawableComponents: [{ type: ContentChildren, args: [RedrawableDirective, { descendants: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLXBhbmUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90YWJzL3RhYi1wYW5lL3RhYi1wYW5lLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWlCLFNBQVMsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFFcEgsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFNUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXRFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbEQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDeEUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFcEUsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDO0FBQy9CLE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsWUFBWTtJQUN4QixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFDO0FBU0YsTUFBTSxPQUFPLGdCQUFpQixTQUFRLGlCQUFpQjtJQWNuRCxZQUNJLEdBQWEsRUFDTCxPQUFzQixFQUNELE9BQU8sRUFDVCxLQUFLO1FBRWhDLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFKbEIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUNELFlBQU8sR0FBUCxPQUFPLENBQUE7UUFDVCxVQUFLLEdBQUwsS0FBSyxDQUFBO1FBZjdCLGNBQVMsR0FBRyxJQUFJ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QWEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFnQixFQUM1RCxJQUFJLEVBQ0osaUJBQWlCLENBQUMsU0FBUyxDQUM5QixDQUFDO1FBQ0YsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzVCLENBQUM7O0FBM0dNLGdDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBUjVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsZ0JBQWdCO2dCQUMxQixzSUFBd0M7Z0JBQ3hDLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQztpQkFDdkM7YUFDSjs7OztZQXhCMkUsUUFBUTtZQVEzRSxhQUFhOzRDQWtDYixTQUFTLFNBQUMsU0FBUzs0Q0FDbkIsU0FBUyxTQUFDLE9BQU87Ozt1QkFWckIsV0FBVyxTQUFDLGNBQWM7dUJBQzFCLFdBQVcsU0FBQyxnQkFBZ0I7bUNBRzVCLGVBQWUsU0FBQyxtQkFBbUIsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBBdHRyaWJ1dGUsIENvbXBvbmVudCwgQ29udGVudENoaWxkcmVuLCBIb3N0QmluZGluZywgSW5qZWN0b3IsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBub29wLCByZW1vdmVBdHRyIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3RhYi1wYW5lLnByb3BzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgVGFic0NvbXBvbmVudCB9IGZyb20gJy4uL3RhYnMuY29tcG9uZW50JztcbmltcG9ydCB7IFJlZHJhd2FibGVEaXJlY3RpdmUgfSBmcm9tICcuLi8uLi9yZWRyYXcvcmVkcmF3YWJsZS5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAndGFiLXBhbmUnO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tdGFicGFuZScsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21UYWJQYW5lXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3RhYi1wYW5lLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFRhYlBhbmVDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBUYWJQYW5lQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgJGxhenlMb2FkID0gbm9vcDtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyBzaG93OiBib29sZWFuO1xuICAgIHB1YmxpYyBzbW9vdGhzY3JvbGw6IGFueTtcblxuICAgIEBIb3N0QmluZGluZygnY2xhc3MuYWN0aXZlJykgaXNBY3RpdmUgPSBmYWxzZTtcbiAgICBASG9zdEJpbmRpbmcoJ2NsYXNzLmRpc2FibGVkJykgZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIC8vIHJlZmVyZW5jZSB0byB0aGUgY29tcG9uZW50cyB3aGljaCBuZWVkcyBhIHJlZHJhdyhlZywgZ3JpZCwgY2hhcnQpIHdoZW4gdGhlIGhlaWdodCBvZiB0aGlzIGNvbXBvbmVudCBjaGFuZ2VzXG4gICAgQENvbnRlbnRDaGlsZHJlbihSZWRyYXdhYmxlRGlyZWN0aXZlLCB7ZGVzY2VuZGFudHM6IHRydWV9KSByZURyYXdhYmxlQ29tcG9uZW50cztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBwcml2YXRlIHRhYnNSZWY6IFRhYnNDb21wb25lbnQsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2hlYWRpbmcnKSBwdWJsaWMgaGVhZGluZyxcbiAgICAgICAgQEF0dHJpYnV0ZSgndGl0bGUnKSBwdWJsaWMgdGl0bGVcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICAvLyB0aXRsZSBwcm9wZXJ0eSBoZXJlIHNlcnZlcyB0aGUgcHVycG9zZSBvZiBoZWFkaW5nLlxuICAgICAgICAvLyBUT0RPOiBtYWtlIGl0IGNvbW1vbiBmb3IgYWxsIHRoZSB3aWRnZXQuXG4gICAgICAgIHJlbW92ZUF0dHIodGhpcy5uYXRpdmVFbGVtZW50LCAndGl0bGUnKTtcbiAgICB9XG5cbiAgICAvLyBwYXJlbnQgdGFicyBjb21wb25lbnQgd2lsbCBjYWxsIHRoaXMgbWV0aG9kIGZvciB0aGUgb3JkZXIgb2YgY2FsbGJhY2tzIHRvIGJlIHByb3BlclxuICAgIC8vIG9yZGVyIG9mIGNhbGxiYWNrcyAtIGRlc2VsZWN0LCBzZWxlY3QsIGNoYW5nZVxuICAgIHB1YmxpYyBpbnZva2VPblNlbGVjdENhbGxiYWNrKCRldmVudD86IEV2ZW50KSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc2VsZWN0JywgeyRldmVudH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZWxlY3QoJGV2ZW50PzogRXZlbnQpIHtcbiAgICAgICAgLy8gV2hlbiBjYWxsZWQgcHJvZ3JhbWF0aWNhbGx5ICRldmVudCB3b24ndCBiZSBhdmFpbGFibGVcbiAgICAgICAgaWYgKHRoaXMuaXNBY3RpdmUgfHwgdGhpcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuJGxhenlMb2FkKCk7XG4gICAgICAgIHRoaXMucmVkcmF3Q2hpbGRyZW4oKTtcbiAgICAgICAgdGhpcy5ub3RpZnlQYXJlbnQoJGV2ZW50KTtcblxuICAgICAgICBpZiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkZXNlbGVjdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnZGVzZWxlY3QnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVkcmF3Q2hpbGRyZW4oKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVEcmF3YWJsZUNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlRHJhd2FibGVDb21wb25lbnRzLmZvckVhY2goYyA9PiBjLnJlZHJhdygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG5vdGlmeVBhcmVudChldnQ/OiBFdmVudCkge1xuICAgICAgICB0aGlzLnRhYnNSZWYubm90aWZ5Q2hhbmdlKHRoaXMsIGV2dCk7XG4gICAgfVxuXG4gICAgLy8gc2VsZWN0IG5leHQgdmFsaWQgdGFiXG4gICAgcHJpdmF0ZSBoYW5kbGVTd2lwZUxlZnQoKSB7XG4gICAgICAgIHRoaXMudGFic1JlZi5uZXh0KCk7XG4gICAgfVxuXG4gICAgLy8gc2VsZWN0IHByZXYgdmFsaWQgdGFiXG4gICAgcHJpdmF0ZSBoYW5kbGVTd2lwZVJpZ2h0KCkge1xuICAgICAgICB0aGlzLnRhYnNSZWYucHJldigpO1xuICAgIH1cblxuICAgIC8vIHNlbGVjdCBldmVudCBpcyBjYWxsZWQgbWFudWFsbHlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIGxvY2FsczogYW55KSB7XG4gICAgICAgIGlmIChldmVudE5hbWUgIT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICBzdXBlci5oYW5kbGVFdmVudCh0aGlzLm5hdGl2ZUVsZW1lbnQsIGV2ZW50TmFtZSwgY2FsbGJhY2ssIGxvY2Fscyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnY29udGVudCcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLiRsYXp5TG9hZCgpLCAxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy50aXRsZSA9IHRoaXMudGl0bGUgfHwgdGhpcy5oZWFkaW5nO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgc3R5bGVyKFxuICAgICAgICAgICAgdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50YWItYm9keScpIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIEFQUExZX1NUWUxFU19UWVBFLkNPTlRBSU5FUlxuICAgICAgICApO1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICB9XG59XG4iXX0=