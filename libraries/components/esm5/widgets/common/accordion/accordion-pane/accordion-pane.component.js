import * as tslib_1 from "tslib";
import { Component, ContentChildren, Injector } from '@angular/core';
import { noop, removeAttr } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { registerProps } from './accordion-pane.props';
import { StylableComponent } from '../../base/stylable.component';
import { AccordionDirective } from '../accordion.directive';
import { RedrawableDirective } from '../../redraw/redrawable.directive';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
var DEFAULT_CLS = 'app-accordion-panel panel';
var WIDGET_CONFIG = { widgetType: 'wm-accordionpane', hostClass: DEFAULT_CLS };
var AccordionPaneComponent = /** @class */ (function (_super) {
    tslib_1.__extends(AccordionPaneComponent, _super);
    function AccordionPaneComponent(inj, accordionRef) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.accordionRef = accordionRef;
        _this.isActive = false;
        _this.$lazyLoad = noop;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SHELL);
        // title property here serves the purpose of heading.
        // remove title property as attribute
        removeAttr(_this.nativeElement, 'title');
        return _this;
    }
    /**
     * handles the pane expand
     * invoke $lazyLoad method which takes care of loading the partial when the content property is provided - lazyLoading or partial
     * invoke redraw on the re-drawable children
     * invoke expand callback
     * notify parent about the change
     * @param {Event} evt
     */
    AccordionPaneComponent.prototype.expand = function (evt) {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.$lazyLoad();
        this.redrawChildren();
        this.invokeEventCallback('expand', { $event: evt });
        this.notifyParent(true, evt);
    };
    /**
     * handles the pane collapse
     * invoke collapse callback
     * notify parent about the change
     * @param {Event} evt
     */
    AccordionPaneComponent.prototype.collapse = function (evt) {
        if (!this.isActive) {
            return;
        }
        this.isActive = false;
        this.invokeEventCallback('collapse', { $event: evt });
        this.notifyParent(false, evt);
    };
    AccordionPaneComponent.prototype.toggle = function (evt) {
        if (this.isActive) {
            this.collapse(evt);
        }
        else {
            this.expand(evt);
        }
    };
    // Todo - Vinay externalize
    AccordionPaneComponent.prototype.redrawChildren = function () {
        var _this = this;
        setTimeout(function () {
            if (_this.reDrawableComponents) {
                _this.reDrawableComponents.forEach(function (c) { return c.redraw(); });
            }
        }, 100);
    };
    AccordionPaneComponent.prototype.notifyParent = function (isExpand, evt) {
        this.accordionRef.notifyChange(this, isExpand, evt);
    };
    AccordionPaneComponent.prototype.onPropertyChange = function (key, nv, ov) {
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
    AccordionPaneComponent.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        styler(this.nativeElement.querySelector('.panel-body'), this, APPLY_STYLES_TYPE.INNER_SHELL);
    };
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
    AccordionPaneComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: AccordionDirective }
    ]; };
    AccordionPaneComponent.propDecorators = {
        reDrawableComponents: [{ type: ContentChildren, args: [RedrawableDirective, { descendants: true },] }]
    };
    return AccordionPaneComponent;
}(StylableComponent));
export { AccordionPaneComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLXBhbmUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9hY2NvcmRpb24vYWNjb3JkaW9uLXBhbmUvYWNjb3JkaW9uLXBhbmUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQWlCLFNBQVMsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBGLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTVDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDNUQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDeEUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFcEUsSUFBTSxXQUFXLEdBQUcsMkJBQTJCLENBQUM7QUFDaEQsSUFBTSxhQUFhLEdBQWtCLEVBQUMsVUFBVSxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQUU5RjtJQU80QyxrREFBaUI7SUFpQnpELGdDQUFZLEdBQWEsRUFBVSxZQUFnQztRQUFuRSxZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FPNUI7UUFSa0Msa0JBQVksR0FBWixZQUFZLENBQW9CO1FBZDVELGNBQVEsR0FBRyxLQUFLLENBQUM7UUFPaEIsZUFBUyxHQUFHLElBQUksQ0FBQztRQVVyQixNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJ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O3FCQUM3QztpQkFDSjs7OztnQkFyQm1ELFFBQVE7Z0JBUW5ELGtCQUFrQjs7O3VDQTZCdEIsZUFBZSxTQUFDLG1CQUFtQixFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQzs7SUFxRjdELDZCQUFDO0NBQUEsQUEzR0QsQ0FPNEMsaUJBQWlCLEdBb0c1RDtTQXBHWSxzQkFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIENvbnRlbnRDaGlsZHJlbiwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgbm9vcCwgcmVtb3ZlQXR0ciB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9hY2NvcmRpb24tcGFuZS5wcm9wcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IEFjY29yZGlvbkRpcmVjdGl2ZSB9IGZyb20gJy4uL2FjY29yZGlvbi5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgUmVkcmF3YWJsZURpcmVjdGl2ZSB9IGZyb20gJy4uLy4uL3JlZHJhdy9yZWRyYXdhYmxlLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtYWNjb3JkaW9uLXBhbmVsIHBhbmVsJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7d2lkZ2V0VHlwZTogJ3dtLWFjY29yZGlvbnBhbmUnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21BY2NvcmRpb25QYW5lXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2FjY29yZGlvbi1wYW5lLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKEFjY29yZGlvblBhbmVDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBBY2NvcmRpb25QYW5lQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIGlzQWN0aXZlID0gZmFsc2U7XG4gICAgcHVibGljIGljb25jbGFzczogc3RyaW5nO1xuICAgIHB1YmxpYyB0aXRsZTogYW55O1xuICAgIHB1YmxpYyBzdWJoZWFkaW5nOiBzdHJpbmc7XG4gICAgcHVibGljIGJhZGdldHlwZTogYW55O1xuICAgIHB1YmxpYyBiYWRnZXZhbHVlOiBzdHJpbmc7XG4gICAgcHVibGljIHNtb290aHNjcm9sbDogYW55O1xuICAgIHByaXZhdGUgJGxhenlMb2FkID0gbm9vcDtcblxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG5cbiAgICAvLyByZWZlcmVuY2UgdG8gdGhlIGNvbXBvbmVudHMgd2hpY2ggbmVlZHMgYSByZWRyYXcoZWcsIGdyaWQsIGNoYXJ0KSB3aGVuIHRoZSBoZWlnaHQgb2YgdGhpcyBjb21wb25lbnQgY2hhbmdlc1xuICAgIEBDb250ZW50Q2hpbGRyZW4oUmVkcmF3YWJsZURpcmVjdGl2ZSwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgcmVEcmF3YWJsZUNvbXBvbmVudHM7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yLCBwcml2YXRlIGFjY29yZGlvblJlZjogQWNjb3JkaW9uRGlyZWN0aXZlKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuU0hFTEwpO1xuXG4gICAgICAgIC8vIHRpdGxlIHByb3BlcnR5IGhlcmUgc2VydmVzIHRoZSBwdXJwb3NlIG9mIGhlYWRpbmcuXG4gICAgICAgIC8vIHJlbW92ZSB0aXRsZSBwcm9wZXJ0eSBhcyBhdHRyaWJ1dGVcbiAgICAgICAgcmVtb3ZlQXR0cih0aGlzLm5hdGl2ZUVsZW1lbnQsICd0aXRsZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGhhbmRsZXMgdGhlIHBhbmUgZXhwYW5kXG4gICAgICogaW52b2tlICRsYXp5TG9hZCBtZXRob2Qgd2hpY2ggdGFrZXMgY2FyZSBvZiBsb2FkaW5nIHRoZSBwYXJ0aWFsIHdoZW4gdGhlIGNvbnRlbnQgcHJvcGVydHkgaXMgcHJvdmlkZWQgLSBsYXp5TG9hZGluZyBvciBwYXJ0aWFsXG4gICAgICogaW52b2tlIHJlZHJhdyBvbiB0aGUgcmUtZHJhd2FibGUgY2hpbGRyZW5cbiAgICAgKiBpbnZva2UgZXhwYW5kIGNhbGxiYWNrXG4gICAgICogbm90aWZ5IHBhcmVudCBhYm91dCB0aGUgY2hhbmdlXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZ0XG4gICAgICovXG4gICAgcHVibGljIGV4cGFuZChldnQ/OiBFdmVudCkge1xuICAgICAgICBpZiAodGhpcy5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLiRsYXp5TG9hZCgpO1xuICAgICAgICB0aGlzLnJlZHJhd0NoaWxkcmVuKCk7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnZXhwYW5kJywgeyRldmVudDogZXZ0fSk7XG4gICAgICAgIHRoaXMubm90aWZ5UGFyZW50KHRydWUsIGV2dCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaGFuZGxlcyB0aGUgcGFuZSBjb2xsYXBzZVxuICAgICAqIGludm9rZSBjb2xsYXBzZSBjYWxsYmFja1xuICAgICAqIG5vdGlmeSBwYXJlbnQgYWJvdXQgdGhlIGNoYW5nZVxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2dFxuICAgICAqL1xuICAgIHB1YmxpYyBjb2xsYXBzZShldnQ/OiBFdmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY29sbGFwc2UnLCB7JGV2ZW50OiBldnR9KTtcbiAgICAgICAgdGhpcy5ub3RpZnlQYXJlbnQoZmFsc2UsIGV2dCk7XG4gICAgfVxuXG4gICAgcHVibGljIHRvZ2dsZShldnQ6IEV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbGxhcHNlKGV2dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmV4cGFuZChldnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVG9kbyAtIFZpbmF5IGV4dGVybmFsaXplXG4gICAgcHJpdmF0ZSByZWRyYXdDaGlsZHJlbigpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZURyYXdhYmxlQ29tcG9uZW50cykge1xuICAgICAgICAgICAgICAgIHRoaXMucmVEcmF3YWJsZUNvbXBvbmVudHMuZm9yRWFjaChjID0+IGMucmVkcmF3KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAxMDApO1xuICAgIH1cblxuICAgIHByaXZhdGUgbm90aWZ5UGFyZW50KGlzRXhwYW5kOiBib29sZWFuLCBldnQ6IEV2ZW50KSB7XG4gICAgICAgIHRoaXMuYWNjb3JkaW9uUmVmLm5vdGlmeUNoYW5nZSh0aGlzLCBpc0V4cGFuZCwgZXZ0KTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdjb250ZW50Jykge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuJGxhenlMb2FkKCksIDEwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdBZnRlclZpZXdJbml0KCk7XG4gICAgICAgIHN0eWxlcihcbiAgICAgICAgICAgIHRoaXMubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcucGFuZWwtYm9keScpIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIEFQUExZX1NUWUxFU19UWVBFLklOTkVSX1NIRUxMXG4gICAgICAgICk7XG4gICAgfVxufVxuIl19