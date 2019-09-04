import * as tslib_1 from "tslib";
import { Component, ContentChildren, ElementRef, Injector, ViewChild } from '@angular/core';
import { $appDigest, noop, removeAttr, setCSS, toggleClass } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './panel.props';
import { RedrawableDirective } from '../redraw/redrawable.directive';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { MenuAdapterComponent } from '../base/menu-adapator.component';
var DEFAULT_CLS = 'app-panel panel';
var WIDGET_CONFIG = { widgetType: 'wm-panel', hostClass: DEFAULT_CLS };
var PanelComponent = /** @class */ (function (_super) {
    tslib_1.__extends(PanelComponent, _super);
    function PanelComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.$lazyLoad = noop;
        _this.expanded = true;
        _this.helpClass = '';
        _this.helptext = '';
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SHELL);
        _this.fullScreenTitle = _this.appLocale.LABEL_FULLSCREEN + "/" + _this.appLocale.LABEL_EXITFULLSCREEN;
        _this.expandCollapseTitle = _this.appLocale.LABEL_COLLAPSE + "/" + _this.appLocale.LABEL_EXPAND;
        removeAttr(_this.nativeElement, 'title');
        return _this;
    }
    Object.defineProperty(PanelComponent.prototype, "hideFooter", {
        // conditions to show the footer
        get: function () {
            return !this.hasFooter || !this.expanded;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PanelComponent.prototype, "showHeader", {
        // conditions to show header
        get: function () {
            return this.iconurl || this.iconclass || this.collapsible || this.actions || this.title || this.subheading || this.enablefullscreen;
        },
        enumerable: true,
        configurable: true
    });
    // toggle the panel state between collapsed - expanded. invoke the respective callbacks
    PanelComponent.prototype.toggle = function ($event) {
        if (this.collapsible) {
            this.invokeEventCallback(this.expanded ? 'collapse' : 'expand', { $event: $event });
            this.expanded = !this.expanded;
            if (this.expanded) {
                this.$lazyLoad();
                this.reDrawChildren();
            }
        }
    };
    PanelComponent.prototype.expand = function ($event) {
        if (!this.expanded) {
            this.toggle($event);
        }
    };
    PanelComponent.prototype.collapse = function ($event) {
        if (this.expanded) {
            this.toggle($event);
        }
    };
    // toggle the fullscreen state of the panel. invoke the respective callbacks
    PanelComponent.prototype.toggleFullScreen = function ($event) {
        if (this.enablefullscreen) {
            this.invokeEventCallback(this.fullscreen ? 'exitfullscreen' : 'fullscreen', { $event: $event });
            this.fullscreen = !this.fullscreen;
            toggleClass(this.nativeElement, 'fullscreen', this.fullscreen);
            // Re-plot the widgets inside panel
            this.reDrawChildren();
        }
        this.computeDimensions();
    };
    // show/hide help
    PanelComponent.prototype.toggleHelp = function () {
        this.helpClass = this.helpClass ? '' : 'show-help';
        toggleClass(this.nativeElement, 'show-help', !!this.helpClass);
        $appDigest();
    };
    // hide the panel and invoke the respective event handler
    PanelComponent.prototype.close = function ($event) {
        this.getWidget().show = false;
        this.invokeEventCallback('close', { $event: $event });
    };
    // calculation of dimensions when the panel the panel state changes from/to fullscreen
    PanelComponent.prototype.computeDimensions = function () {
        var headerHeight = this.panelHeader.nativeElement.offsetHeight;
        var footer = this.nativeElement.querySelector('.panel-footer');
        var content = this.panelContent.nativeElement;
        var vHeight = window.innerHeight;
        var inlineHeight;
        if (this.fullscreen) {
            inlineHeight = this.hideFooter ? (vHeight - headerHeight) : vHeight - (footer.offsetHeight + headerHeight);
        }
        else {
            inlineHeight = this.height || '';
        }
        setCSS(content, 'height', inlineHeight);
    };
    // notify the redrawable components(charts, grid)
    PanelComponent.prototype.reDrawChildren = function () {
        var _this = this;
        setTimeout(function () {
            if (_this.reDrawableComponents) {
                _this.reDrawableComponents.forEach(function (c) { return c.redraw(); });
            }
        }, 100);
    };
    PanelComponent.prototype.onPropertyChange = function (key, nv, ov) {
        var _this = this;
        if (key === 'expanded') {
            this.expanded = nv;
        }
        else if (key === 'content') {
            setTimeout(function () {
                if (_this.expanded || !_this.collapsible) {
                    _this.$lazyLoad();
                }
            }, 20);
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    PanelComponent.prototype.ngAfterContentInit = function () {
        _super.prototype.ngAfterContentInit.call(this);
        this.hasFooter = !!this.nativeElement.querySelector('[wmPanelFooter]');
        styler(this.panelBody.nativeElement, this, APPLY_STYLES_TYPE.INNER_SHELL);
    };
    PanelComponent.initializeProps = registerProps();
    PanelComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmPanel]',
                    template: "<div class=\"panel-heading {{helpClass}}\" *ngIf=\"showHeader\" #panelHeading>\n    <h3 class=\"panel-title\">\n        <a href=\"javascript:void(0)\" class=\"panel-toggle\" (click)=\"toggle($event)\">\n            <div class=\"pull-left\">\n                <i class=\"app-icon panel-icon {{iconclass}}\" *ngIf=\"iconclass && !iconurl\"></i>\n                <img data-identifier=\"img\" title=\"iconurl\" alt=\"Panel icon\" class=\"panel-image-icon\" [src]=\"iconurl | image\" *ngIf=\"iconurl\"\n                     [ngStyle]=\"{width: iconwidth ,height: iconheight, margin: iconmargin}\"/>\n            </div>\n            <div class=\"pull-left\">\n                <div class=\"heading\" [innerHTML]=\"title | trustAs: 'html'\" [title]=\"title\"></div>\n                <div class=\"description\" [innerHTML]=\"subheading | trustAs: 'html'\"></div>\n            </div>\n        </a>\n        <div class=\"panel-actions\">\n            <span *ngIf=\"badgevalue\" aria-label=\"badge\" class=\"app-badge label label-{{badgetype}}\">{{badgevalue}}</span>\n            <div wmMenu aria-label=\"dropdown\"\n                 dropdown\n                 type=\"anchor\"\n                 class=\"panel-action\"\n                 dataset.bind=\"actions\"\n                 *ngIf=\"actions\"\n                 caption=\"\"\n                 menuposition=\"down,left\"\n                 iconclass=\"wi wi-more-vert\"\n                 datafield.bind=\"datafield\"\n                ></div>\n            <button type=\"button\" aria-label=\"Help\" class=\"app-icon panel-action wi\" [title]=\"appLocale.LABEL_HELP\" *ngIf=\"helptext\"\n                    (click)=\"toggleHelp()\"><i class=\"wi-question\"></i></button>\n            <button type=\"button\" aria-label=\"Collapse/Expand\" class=\"app-icon wi panel-action\" *ngIf=\"collapsible\" [title]=\"expandCollapseTitle\"\n                    (click)=\"toggle($event);\"><i [ngClass]=\"expanded ? 'wi-minus' : 'wi-plus'\"></i></button>\n            <button type=\"button\" aria-label=\"Fullscreen/Exit\" class=\"app-icon panel-action wi\" *ngIf=\"enablefullscreen\"\n                    [title]=\"fullScreenTitle\"\n                    (click)=\"toggleFullScreen($event);\"><i [ngClass]=\"fullscreen ? 'wi-fullscreen-exit' : 'wi-fullscreen'\"></i></button>\n            <button type=\"button\" aria-label=\"Close button\" class=\"app-icon panel-action\" title=\"{{appLocale.LABEL_CLOSE}}\" *ngIf=\"closable\"\n                    (click)=\"close($event)\"><i class=\"wi wi-close\"></i></button>\n        </div>\n    </h3>\n</div>\n<div class=\"panel-content\" [hidden]=\"!expanded\" #panelContent>\n    <!-- Todo Bandhavya - implement smooth scroll -->\n    <div partial-container-target #panelBody [ngClass]=\"['panel-body', helpClass]\">\n        <ng-content></ng-content>\n    </div>\n    <aside class=\"panel-help-message\" [ngClass]=\"helpClass\">\n        <h5 class=\"panel-help-header\" [textContent]=\"appLocale.LABEL_HELP\"></h5>\n        <div class=\"panel-help-content\" [innerHTML]=\"helptext | trustAs : 'html'\"></div>\n    </aside>\n</div>\n<div class=\"app-panel-footer panel-footer clearfix\" [hidden]=\"hideFooter\">\n    <ng-content select=\"[wmPanelFooter]\"></ng-content>\n</div>",
                    providers: [
                        provideAsWidgetRef(PanelComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    PanelComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    PanelComponent.propDecorators = {
        panelHeader: [{ type: ViewChild, args: ['panelHeading',] }],
        panelContent: [{ type: ViewChild, args: ['panelContent',] }],
        panelBody: [{ type: ViewChild, args: ['panelBody',] }],
        reDrawableComponents: [{ type: ContentChildren, args: [RedrawableDirective, { descendants: true },] }]
    };
    return PanelComponent;
}(MenuAdapterComponent));
export { PanelComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZWwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9wYW5lbC9wYW5lbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBb0IsU0FBUyxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFVLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV0SCxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU3RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFbkUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUV2RSxJQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQztBQUN0QyxJQUFNLGFBQWEsR0FBa0IsRUFBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQUV0RjtJQVFvQywwQ0FBb0I7SUFvQ3BELHdCQUFZLEdBQWE7UUFBekIsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBTzVCO1FBekNNLGVBQVMsR0FBRyxJQUFJLENBQUM7UUFJakIsY0FBUSxHQUFHLElBQUksQ0FBQztRQU9oQixlQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ2YsY0FBUSxHQUFHLEVBQUUsQ0FBQztRQXdCakIsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSSxFQUFFLGlCQUFpQixDQUFDLEtBQUss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O3VDQUNyQixlQUFlLFNBQUMsbUJBQW1CLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDOztJQXVIN0QscUJBQUM7Q0FBQSxBQXJKRCxDQVFvQyxvQkFBb0IsR0E2SXZEO1NBN0lZLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlckNvbnRlbnRJbml0LCBDb21wb25lbnQsIENvbnRlbnRDaGlsZHJlbiwgRWxlbWVudFJlZiwgSW5qZWN0b3IsIE9uSW5pdCwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7ICRhcHBEaWdlc3QsIG5vb3AsIHJlbW92ZUF0dHIsIHNldENTUywgdG9nZ2xlQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEFQUExZX1NUWUxFU19UWVBFLCBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vcGFuZWwucHJvcHMnO1xuaW1wb3J0IHsgUmVkcmF3YWJsZURpcmVjdGl2ZSB9IGZyb20gJy4uL3JlZHJhdy9yZWRyYXdhYmxlLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgTWVudUFkYXB0ZXJDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL21lbnUtYWRhcGF0b3IuY29tcG9uZW50JztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXBhbmVsIHBhbmVsJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7d2lkZ2V0VHlwZTogJ3dtLXBhbmVsJywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtUGFuZWxdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vcGFuZWwuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoUGFuZWxDb21wb25lbnQpXG4gICAgXVxufSlcblxuZXhwb3J0IGNsYXNzIFBhbmVsQ29tcG9uZW50IGV4dGVuZHMgTWVudUFkYXB0ZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyQ29udGVudEluaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgJGxhenlMb2FkID0gbm9vcDtcbiAgICBwdWJsaWMgaWNvbnVybDogc3RyaW5nO1xuICAgIHB1YmxpYyBpY29uY2xhc3M6IHN0cmluZztcbiAgICBwdWJsaWMgY29sbGFwc2libGU6IGJvb2xlYW47XG4gICAgcHVibGljIGV4cGFuZGVkID0gdHJ1ZTtcbiAgICBwdWJsaWMgZW5hYmxlZnVsbHNjcmVlbjogYm9vbGVhbjtcbiAgICBwdWJsaWMgZnVsbHNjcmVlbjogYm9vbGVhbjtcbiAgICBwdWJsaWMgdGl0bGU6IHN0cmluZztcbiAgICBwdWJsaWMgc3ViaGVhZGluZzogc3RyaW5nO1xuICAgIHB1YmxpYyBhY3Rpb25zOiBhbnk7XG5cbiAgICBwdWJsaWMgaGVscENsYXNzID0gJyc7XG4gICAgcHVibGljIGhlbHB0ZXh0ID0gJyc7XG4gICAgcHJpdmF0ZSBmdWxsU2NyZWVuVGl0bGU6IHN0cmluZztcbiAgICBwcml2YXRlIGV4cGFuZENvbGxhcHNlVGl0bGU6IHN0cmluZztcblxuICAgIEBWaWV3Q2hpbGQoJ3BhbmVsSGVhZGluZycpIHByaXZhdGUgcGFuZWxIZWFkZXI6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZCgncGFuZWxDb250ZW50JykgcHJpdmF0ZSBwYW5lbENvbnRlbnQ6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZCgncGFuZWxCb2R5JykgcHJpdmF0ZSBwYW5lbEJvZHk6IEVsZW1lbnRSZWY7XG4gICAgQENvbnRlbnRDaGlsZHJlbihSZWRyYXdhYmxlRGlyZWN0aXZlLCB7ZGVzY2VuZGFudHM6IHRydWV9KSByZURyYXdhYmxlQ29tcG9uZW50cztcblxuICAgIHByaXZhdGUgaGFzRm9vdGVyOiBib29sZWFuO1xuXG4gICAgLy8gY29uZGl0aW9ucyB0byBzaG93IHRoZSBmb290ZXJcbiAgICBwdWJsaWMgZ2V0IGhpZGVGb290ZXIgKCkge1xuICAgICAgICByZXR1cm4gIXRoaXMuaGFzRm9vdGVyIHx8ICF0aGlzLmV4cGFuZGVkO1xuICAgIH1cblxuICAgIC8vIGNvbmRpdGlvbnMgdG8gc2hvdyBoZWFkZXJcbiAgICBwdWJsaWMgZ2V0IHNob3dIZWFkZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmljb251cmwgfHwgdGhpcy5pY29uY2xhc3MgfHwgdGhpcy5jb2xsYXBzaWJsZSB8fCB0aGlzLmFjdGlvbnMgfHwgdGhpcy50aXRsZSB8fCB0aGlzLnN1YmhlYWRpbmcgfHwgdGhpcy5lbmFibGVmdWxsc2NyZWVuO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5TSEVMTCk7XG5cbiAgICAgICAgdGhpcy5mdWxsU2NyZWVuVGl0bGUgPSBgJHt0aGlzLmFwcExvY2FsZS5MQUJFTF9GVUxMU0NSRUVOfS8ke3RoaXMuYXBwTG9jYWxlLkxBQkVMX0VYSVRGVUxMU0NSRUVOfWA7XG4gICAgICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VUaXRsZSA9IGAke3RoaXMuYXBwTG9jYWxlLkxBQkVMX0NPTExBUFNFfS8ke3RoaXMuYXBwTG9jYWxlLkxBQkVMX0VYUEFORH1gO1xuICAgICAgICByZW1vdmVBdHRyKHRoaXMubmF0aXZlRWxlbWVudCwgJ3RpdGxlJyk7XG4gICAgfVxuXG4gICAgLy8gdG9nZ2xlIHRoZSBwYW5lbCBzdGF0ZSBiZXR3ZWVuIGNvbGxhcHNlZCAtIGV4cGFuZGVkLiBpbnZva2UgdGhlIHJlc3BlY3RpdmUgY2FsbGJhY2tzXG4gICAgcHVibGljIHRvZ2dsZSgkZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuY29sbGFwc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjayh0aGlzLmV4cGFuZGVkID8gJ2NvbGxhcHNlJyA6ICdleHBhbmQnLCB7JGV2ZW50fSk7XG4gICAgICAgICAgICB0aGlzLmV4cGFuZGVkID0gIXRoaXMuZXhwYW5kZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5leHBhbmRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGxhenlMb2FkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZURyYXdDaGlsZHJlbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGV4cGFuZCgkZXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmV4cGFuZGVkKSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgkZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNvbGxhcHNlKCRldmVudCkge1xuICAgICAgICBpZiAodGhpcy5leHBhbmRlZCkge1xuICAgICAgICAgICAgdGhpcy50b2dnbGUoJGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRvZ2dsZSB0aGUgZnVsbHNjcmVlbiBzdGF0ZSBvZiB0aGUgcGFuZWwuIGludm9rZSB0aGUgcmVzcGVjdGl2ZSBjYWxsYmFja3NcbiAgICBwcm90ZWN0ZWQgdG9nZ2xlRnVsbFNjcmVlbigkZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlZnVsbHNjcmVlbikge1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKHRoaXMuZnVsbHNjcmVlbiA/ICdleGl0ZnVsbHNjcmVlbicgOiAnZnVsbHNjcmVlbicsIHskZXZlbnR9KTtcbiAgICAgICAgICAgIHRoaXMuZnVsbHNjcmVlbiA9ICF0aGlzLmZ1bGxzY3JlZW47XG4gICAgICAgICAgICB0b2dnbGVDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdmdWxsc2NyZWVuJywgdGhpcy5mdWxsc2NyZWVuKTtcbiAgICAgICAgICAgIC8vIFJlLXBsb3QgdGhlIHdpZGdldHMgaW5zaWRlIHBhbmVsXG4gICAgICAgICAgICB0aGlzLnJlRHJhd0NoaWxkcmVuKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb21wdXRlRGltZW5zaW9ucygpO1xuICAgIH1cblxuICAgIC8vIHNob3cvaGlkZSBoZWxwXG4gICAgcHJvdGVjdGVkIHRvZ2dsZUhlbHAoKSB7XG4gICAgICAgIHRoaXMuaGVscENsYXNzID0gdGhpcy5oZWxwQ2xhc3MgPyAnJyA6ICdzaG93LWhlbHAnO1xuICAgICAgICB0b2dnbGVDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdzaG93LWhlbHAnLCAhIXRoaXMuaGVscENsYXNzKTtcbiAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgIH1cblxuICAgIC8vIGhpZGUgdGhlIHBhbmVsIGFuZCBpbnZva2UgdGhlIHJlc3BlY3RpdmUgZXZlbnQgaGFuZGxlclxuICAgIHByb3RlY3RlZCBjbG9zZSgkZXZlbnQpIHtcbiAgICAgICAgdGhpcy5nZXRXaWRnZXQoKS5zaG93ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY2xvc2UnLCB7JGV2ZW50fSk7XG4gICAgfVxuXG4gICAgLy8gY2FsY3VsYXRpb24gb2YgZGltZW5zaW9ucyB3aGVuIHRoZSBwYW5lbCB0aGUgcGFuZWwgc3RhdGUgY2hhbmdlcyBmcm9tL3RvIGZ1bGxzY3JlZW5cbiAgICBwcml2YXRlIGNvbXB1dGVEaW1lbnNpb25zKCkge1xuICAgICAgICBjb25zdCBoZWFkZXJIZWlnaHQgPSB0aGlzLnBhbmVsSGVhZGVyLm5hdGl2ZUVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICBjb25zdCBmb290ZXIgPSB0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnBhbmVsLWZvb3RlcicpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wYW5lbENvbnRlbnQubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY29uc3QgdkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuICAgICAgICBsZXQgaW5saW5lSGVpZ2h0O1xuXG4gICAgICAgIGlmICh0aGlzLmZ1bGxzY3JlZW4pIHtcbiAgICAgICAgICAgIGlubGluZUhlaWdodCA9IHRoaXMuaGlkZUZvb3RlciA/ICAodkhlaWdodCAtIGhlYWRlckhlaWdodCkgOiB2SGVpZ2h0IC0gKGZvb3Rlci5vZmZzZXRIZWlnaHQgKyBoZWFkZXJIZWlnaHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5saW5lSGVpZ2h0ID0gdGhpcy5oZWlnaHQgfHwgJyc7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRDU1MoY29udGVudCwgJ2hlaWdodCcsIGlubGluZUhlaWdodCk7XG4gICAgfVxuXG4gICAgLy8gbm90aWZ5IHRoZSByZWRyYXdhYmxlIGNvbXBvbmVudHMoY2hhcnRzLCBncmlkKVxuICAgIHByaXZhdGUgcmVEcmF3Q2hpbGRyZW4oKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVEcmF3YWJsZUNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlRHJhd2FibGVDb21wb25lbnRzLmZvckVhY2goYyA9PiBjLnJlZHJhdygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnZXhwYW5kZWQnKSB7XG4gICAgICAgICAgICB0aGlzLmV4cGFuZGVkID0gbnY7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnY29udGVudCcpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmV4cGFuZGVkIHx8ICF0aGlzLmNvbGxhcHNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGxhenlMb2FkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMjApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuICAgICAgICB0aGlzLmhhc0Zvb3RlciA9ICEhdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ1t3bVBhbmVsRm9vdGVyXScpO1xuICAgICAgICBzdHlsZXIodGhpcy5wYW5lbEJvZHkubmF0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuSU5ORVJfU0hFTEwpO1xuICAgIH1cbn1cbiJdfQ==