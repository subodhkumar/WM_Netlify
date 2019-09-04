import { Component, ContentChildren, Injector } from '@angular/core';
import { noop, removeAttr } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { registerProps } from './accordion-pane.props';
import { StylableComponent } from '../../base/stylable.component';
import { AccordionDirective } from '../accordion.directive';
import { RedrawableDirective } from '../../redraw/redrawable.directive';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
const DEFAULT_CLS = 'app-accordion-panel panel';
const WIDGET_CONFIG = { widgetType: 'wm-accordionpane', hostClass: DEFAULT_CLS };
export class AccordionPaneComponent extends StylableComponent {
    constructor(inj, accordionRef) {
        super(inj, WIDGET_CONFIG);
        this.accordionRef = accordionRef;
        this.isActive = false;
        this.$lazyLoad = noop;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SHELL);
        // title property here serves the purpose of heading.
        // remove title property as attribute
        removeAttr(this.nativeElement, 'title');
    }
    /**
     * handles the pane expand
     * invoke $lazyLoad method which takes care of loading the partial when the content property is provided - lazyLoading or partial
     * invoke redraw on the re-drawable children
     * invoke expand callback
     * notify parent about the change
     * @param {Event} evt
     */
    expand(evt) {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.$lazyLoad();
        this.redrawChildren();
        this.invokeEventCallback('expand', { $event: evt });
        this.notifyParent(true, evt);
    }
    /**
     * handles the pane collapse
     * invoke collapse callback
     * notify parent about the change
     * @param {Event} evt
     */
    collapse(evt) {
        if (!this.isActive) {
            return;
        }
        this.isActive = false;
        this.invokeEventCallback('collapse', { $event: evt });
        this.notifyParent(false, evt);
    }
    toggle(evt) {
        if (this.isActive) {
            this.collapse(evt);
        }
        else {
            this.expand(evt);
        }
    }
    // Todo - Vinay externalize
    redrawChildren() {
        setTimeout(() => {
            if (this.reDrawableComponents) {
                this.reDrawableComponents.forEach(c => c.redraw());
            }
        }, 100);
    }
    notifyParent(isExpand, evt) {
        this.accordionRef.notifyChange(this, isExpand, evt);
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
    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.nativeElement.querySelector('.panel-body'), this, APPLY_STYLES_TYPE.INNER_SHELL);
    }
}
AccordionPaneComponent.initializeProps = registerProps();
AccordionPaneComponent.decorators = [
    { type: Component, args: [{
                selector: 'div[wmAccordionPane]',
                template: "<div class=\"panel-heading clearfix\" role=\"tab\" (click)=\"toggle($event)\" [ngClass]=\"{active: isActive}\">\n    <h3 class=\"panel-title\">\n        <a href=\"javascript:void(0);\" role=\"button\" class=\"accordion-toggle\" [attr.aria-expanded]=\"isActive\" [attr.aria-controls]=\"name\">\n            <div class=\"pull-left\">\n                <i class=\"app-icon panel-icon {{iconclass}}\" [hidden]=\"!iconclass\"></i>\n            </div>\n            <div class=\"pull-left\">\n                <div class=\"heading\" [innerHTML]=\"title | trustAs: 'html'\"></div>\n                <div class=\"description\" [innerHTML]=\"subheading | trustAs: 'html'\"></div>\n            </div>\n        </a>\n    </h3>\n    <div class=\"panel-actions\">\n        <span class=\"label label-{{badgetype}}\">{{badgevalue}}</span>\n        <button type=\"button\" aria-label=\"Collapse/Expand\" [attr.aria-expanded]=\"isActive\" [attr.aria-controls]=\"name\"\n                class=\"app-icon panel-action wi\"\n                title=\"{{appLocale.LABEL_COLLAPSE}}/{{appLocale.LABEL_EXPAND}}\">\n            <i [ngClass]=\"isActive ? 'wi-minus' : 'wi-plus'\"></i>\n        </button>\n    </div>\n</div>\n<div class=\"panel-collapse collapse\" role=\"tabpanel\" aria-labelledby=\"panel description\" [ngClass]=\"isActive ? 'collapse in' : 'collapse'\">\n    <div class=\"panel-body\" [wmSmoothscroll]=\"smoothscroll\" partial-container-target>\n        <ng-content></ng-content>\n    </div>\n</div>\n",
                providers: [
                    provideAsWidgetRef(AccordionPaneComponent)
                ]
            }] }
];
/** @nocollapse */
AccordionPaneComponent.ctorParameters = () => [
    { type: Injector },
    { type: AccordionDirective }
];
AccordionPaneComponent.propDecorators = {
    reDrawableComponents: [{ type: ContentChildren, args: [RedrawableDirective, { descendants: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLXBhbmUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9hY2NvcmRpb24vYWNjb3JkaW9uLXBhbmUvYWNjb3JkaW9uLXBhbmUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFcEYsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFNUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXRFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM1RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUN4RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUVwRSxNQUFNLFdBQVcsR0FBRywyQkFBMkIsQ0FBQztBQUNoRCxNQUFNLGFBQWEsR0FBa0IsRUFBQyxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBUzlGLE1BQU0sT0FBTyxzQkFBdUIsU0FBUSxpQkFBaUI7SUFpQnpELFlBQVksR0FBYSxFQUFVLFlBQWdDO1FBQy9ELEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFESyxpQkFBWSxHQUFaLFlBQVksQ0FBb0I7UUFkNUQsYUFBUSxHQUFHLEtBQUssQ0FBQztRQU9oQixjQUFTLEdBQUcsSUFBSSxDQUFDO1FBVXJCLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFB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QUFDLG1CQUFtQixFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgQ29udGVudENoaWxkcmVuLCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBub29wLCByZW1vdmVBdHRyIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2FjY29yZGlvbi1wYW5lLnByb3BzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgQWNjb3JkaW9uRGlyZWN0aXZlIH0gZnJvbSAnLi4vYWNjb3JkaW9uLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBSZWRyYXdhYmxlRGlyZWN0aXZlIH0gZnJvbSAnLi4vLi4vcmVkcmF3L3JlZHJhd2FibGUuZGlyZWN0aXZlJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1hY2NvcmRpb24tcGFuZWwgcGFuZWwnO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHt3aWRnZXRUeXBlOiAnd20tYWNjb3JkaW9ucGFuZScsIGhvc3RDbGFzczogREVGQVVMVF9DTFN9O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bUFjY29yZGlvblBhbmVdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vYWNjb3JkaW9uLXBhbmUuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQWNjb3JkaW9uUGFuZUNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvblBhbmVDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgaXNBY3RpdmUgPSBmYWxzZTtcbiAgICBwdWJsaWMgaWNvbmNsYXNzOiBzdHJpbmc7XG4gICAgcHVibGljIHRpdGxlOiBhbnk7XG4gICAgcHVibGljIHN1YmhlYWRpbmc6IHN0cmluZztcbiAgICBwdWJsaWMgYmFkZ2V0eXBlOiBhbnk7XG4gICAgcHVibGljIGJhZGdldmFsdWU6IHN0cmluZztcbiAgICBwdWJsaWMgc21vb3Roc2Nyb2xsOiBhbnk7XG4gICAgcHJpdmF0ZSAkbGF6eUxvYWQgPSBub29wO1xuXG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcblxuICAgIC8vIHJlZmVyZW5jZSB0byB0aGUgY29tcG9uZW50cyB3aGljaCBuZWVkcyBhIHJlZHJhdyhlZywgZ3JpZCwgY2hhcnQpIHdoZW4gdGhlIGhlaWdodCBvZiB0aGlzIGNvbXBvbmVudCBjaGFuZ2VzXG4gICAgQENvbnRlbnRDaGlsZHJlbihSZWRyYXdhYmxlRGlyZWN0aXZlLCB7ZGVzY2VuZGFudHM6IHRydWV9KSByZURyYXdhYmxlQ29tcG9uZW50cztcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIHByaXZhdGUgYWNjb3JkaW9uUmVmOiBBY2NvcmRpb25EaXJlY3RpdmUpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5TSEVMTCk7XG5cbiAgICAgICAgLy8gdGl0bGUgcHJvcGVydHkgaGVyZSBzZXJ2ZXMgdGhlIHB1cnBvc2Ugb2YgaGVhZGluZy5cbiAgICAgICAgLy8gcmVtb3ZlIHRpdGxlIHByb3BlcnR5IGFzIGF0dHJpYnV0ZVxuICAgICAgICByZW1vdmVBdHRyKHRoaXMubmF0aXZlRWxlbWVudCwgJ3RpdGxlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaGFuZGxlcyB0aGUgcGFuZSBleHBhbmRcbiAgICAgKiBpbnZva2UgJGxhenlMb2FkIG1ldGhvZCB3aGljaCB0YWtlcyBjYXJlIG9mIGxvYWRpbmcgdGhlIHBhcnRpYWwgd2hlbiB0aGUgY29udGVudCBwcm9wZXJ0eSBpcyBwcm92aWRlZCAtIGxhenlMb2FkaW5nIG9yIHBhcnRpYWxcbiAgICAgKiBpbnZva2UgcmVkcmF3IG9uIHRoZSByZS1kcmF3YWJsZSBjaGlsZHJlblxuICAgICAqIGludm9rZSBleHBhbmQgY2FsbGJhY2tcbiAgICAgKiBub3RpZnkgcGFyZW50IGFib3V0IHRoZSBjaGFuZ2VcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldnRcbiAgICAgKi9cbiAgICBwdWJsaWMgZXhwYW5kKGV2dD86IEV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuJGxhenlMb2FkKCk7XG4gICAgICAgIHRoaXMucmVkcmF3Q2hpbGRyZW4oKTtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdleHBhbmQnLCB7JGV2ZW50OiBldnR9KTtcbiAgICAgICAgdGhpcy5ub3RpZnlQYXJlbnQodHJ1ZSwgZXZ0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBoYW5kbGVzIHRoZSBwYW5lIGNvbGxhcHNlXG4gICAgICogaW52b2tlIGNvbGxhcHNlIGNhbGxiYWNrXG4gICAgICogbm90aWZ5IHBhcmVudCBhYm91dCB0aGUgY2hhbmdlXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZ0XG4gICAgICovXG4gICAgcHVibGljIGNvbGxhcHNlKGV2dD86IEV2ZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdjb2xsYXBzZScsIHskZXZlbnQ6IGV2dH0pO1xuICAgICAgICB0aGlzLm5vdGlmeVBhcmVudChmYWxzZSwgZXZ0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlKGV2dDogRXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuY29sbGFwc2UoZXZ0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kKGV2dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUb2RvIC0gVmluYXkgZXh0ZXJuYWxpemVcbiAgICBwcml2YXRlIHJlZHJhd0NoaWxkcmVuKCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlRHJhd2FibGVDb21wb25lbnRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZURyYXdhYmxlQ29tcG9uZW50cy5mb3JFYWNoKGMgPT4gYy5yZWRyYXcoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDEwMCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBub3RpZnlQYXJlbnQoaXNFeHBhbmQ6IGJvb2xlYW4sIGV2dDogRXZlbnQpIHtcbiAgICAgICAgdGhpcy5hY2NvcmRpb25SZWYubm90aWZ5Q2hhbmdlKHRoaXMsIGlzRXhwYW5kLCBldnQpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy4kbGF6eUxvYWQoKSwgMTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgc3R5bGVyKFxuICAgICAgICAgICAgdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYW5lbC1ib2R5JykgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgQVBQTFlfU1RZTEVTX1RZUEUuSU5ORVJfU0hFTExcbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=