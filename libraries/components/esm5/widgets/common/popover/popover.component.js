import * as tslib_1 from "tslib";
import { Component, ContentChild, ElementRef, Inject, Injector, TemplateRef, ViewChild } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { PopoverDirective } from 'ngx-bootstrap';
import { addClass, App, setAttr, setCSSFromObj } from '@wm/core';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './popover.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-popover-wrapper';
var WIDGET_CONFIG = {
    widgetType: 'wm-popover',
    hostClass: DEFAULT_CLS
};
var eventsMap = {
    click: 'click',
    hover: 'mouseenter:click',
    default: 'click mouseenter'
};
var activePopover;
var PopoverComponent = /** @class */ (function (_super) {
    tslib_1.__extends(PopoverComponent, _super);
    function PopoverComponent(inj, app, evtMngrPlugins) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.app = app;
        _this.isOpen = false;
        _this.canPopoverOpen = true;
        // KeyEventsPlugin
        _this.keyEventPlugin = evtMngrPlugins[1];
        _this.popoverContainerCls = "app-popover-" + _this.widgetId;
        return _this;
    }
    // This mehtod is used to show/open the popover. This refers to the same method showPopover.
    PopoverComponent.prototype.open = function () {
        this.showPopover();
    };
    // This mehtod is used to hide/close the popover.
    PopoverComponent.prototype.close = function () {
        this.isOpen = false;
    };
    // Trigger on hiding popover
    PopoverComponent.prototype.onHidden = function () {
        this.invokeEventCallback('hide', { $event: { type: 'hide' } });
    };
    PopoverComponent.prototype.setFocusToPopoverLink = function () {
        var _this = this;
        setTimeout(function () { return _this.anchorRef.nativeElement.focus(); }, 10);
    };
    PopoverComponent.prototype.adjustPopoverPosition = function (popoverElem, parentDimesion, popoverLeftShift) {
        var arrowLeftShift = (parentDimesion.left + (parentDimesion.width / 2)) - popoverLeftShift;
        this.bsPopoverDirective._popover._ngZone.onStable.subscribe(function () {
            popoverElem.css('left', popoverLeftShift + 'px');
            popoverElem.find('.popover-arrow').css('left', arrowLeftShift + 'px');
        });
    };
    PopoverComponent.prototype.calculatePopoverPostion = function (element) {
        var popoverElem = $(element);
        var popoverLeft = _.parseInt(popoverElem.css('left'));
        var popoverWidth = _.parseInt(popoverElem.css('width'));
        var viewPortWidth = $(window).width();
        var parentDimesion = this.anchorRef.nativeElement.getBoundingClientRect();
        // Adjusting popover position, if it is not visible at left side
        if (popoverLeft < 0) {
            var popoverLeftShift = 4;
            this.adjustPopoverPosition(popoverElem, parentDimesion, popoverLeftShift);
        }
        // Adjusting popover position, if it is not visible at right side
        if (popoverLeft + popoverWidth > viewPortWidth) {
            var popoverLeftAdjust = (popoverLeft + popoverWidth) - viewPortWidth;
            var popoverLeftShift = popoverLeft - popoverLeftAdjust - 50;
            this.adjustPopoverPosition(popoverElem, parentDimesion, popoverLeftShift);
        }
    };
    // Trigger on showing popover
    PopoverComponent.prototype.onShown = function () {
        var _this = this;
        if (activePopover && activePopover.isOpen) {
            activePopover.isOpen = false;
        }
        activePopover = this;
        activePopover.isOpen = true;
        var popoverContainer = document.querySelector("." + this.popoverContainerCls);
        setCSSFromObj(popoverContainer, {
            height: this.popoverheight,
            minWidth: this.popoverwidth
        });
        if (!this.popoverarrow) {
            addClass(popoverContainer.querySelector('.arrow'), 'hidden');
        }
        if (this.interaction === 'hover' || this.interaction === 'default') {
            // do not use addEventListener here
            // attaching the event this way will override the existing event handlers
            popoverContainer.onmouseenter = function () { return clearTimeout(_this.closePopoverTimeout); };
            popoverContainer.onmouseleave = function () { return _this.hidePopover(); };
            this.anchorRef.nativeElement.onmouseenter = function () { return clearTimeout(_this.closePopoverTimeout); };
            this.anchorRef.nativeElement.onmouseleave = function () { return _this.hidePopover(); };
        }
        var deRegister = this.eventManager.addEventListener(popoverContainer, 'keydown.esc', function () {
            _this.isOpen = false;
            _this.setFocusToPopoverLink();
            deRegister();
        });
        var popoverStartBtn = popoverContainer.querySelector('.popover-start');
        var popoverEndBtn = popoverContainer.querySelector('.popover-end');
        popoverStartBtn.onkeydown = function (event) {
            var action = _this.keyEventPlugin.constructor.getEventFullKey(event);
            // Check for Shift+Tab key
            if (action === 'shift.tab') {
                _this.bsPopoverDirective.hide();
                _this.setFocusToPopoverLink();
            }
        };
        popoverEndBtn.onkeydown = function (event) {
            var action = _this.keyEventPlugin.constructor.getEventFullKey(event);
            // Check for Tab key
            if (action === 'tab') {
                _this.bsPopoverDirective.hide();
                _this.setFocusToPopoverLink();
            }
        };
        setAttr(popoverContainer, 'tabindex', 0);
        setTimeout(function () { return popoverStartBtn.focus(); }, 50);
        // Adjusting popover position if the popover placement is top or bottom
        setTimeout(function () {
            if (_this.popoverplacement === 'bottom' || _this.popoverplacement === 'top') {
                _this.calculatePopoverPostion(popoverContainer);
            }
            // triggering onload and onshow events after popover content has rendered
            _this.triggerPopoverEvents();
        });
    };
    PopoverComponent.prototype.triggerPopoverEvents = function () {
        var _this = this;
        if (this.contentsource === 'partial') {
            var cancelSubscription_1 = this.app.subscribe('partialLoaded', function (data) {
                var parEle = _this.partialRef.nativeElement;
                var partialScope;
                if (parEle) {
                    partialScope = parEle.widget;
                    _this.Widgets = partialScope.Widgets;
                    _this.Variables = partialScope.Variables;
                    _this.Actions = partialScope.Actions;
                    _this.invokeEventCallback('load');
                    _this.invokeEventCallback('show', { $event: { type: 'show' } });
                }
                cancelSubscription_1();
            });
        }
        else {
            this.Widgets = this.viewParent.Widgets;
            this.Variables = this.viewParent.Variables;
            this.Actions = this.viewParent.Actions;
            this.invokeEventCallback('show', { $event: { type: 'show' } });
        }
    };
    PopoverComponent.prototype.hidePopover = function () {
        var _this = this;
        this.closePopoverTimeout = setTimeout(function () { return _this.isOpen = false; }, 500);
    };
    PopoverComponent.prototype.showPopover = function () {
        this.bsPopoverDirective.show();
    };
    PopoverComponent.prototype.onPopoverAnchorKeydown = function ($event) {
        // if there is no content available, the popover should not open through enter key. So checking whether the canPopoverOpen flag is true or not.
        if (!this.canPopoverOpen) {
            return;
        }
        var action = this.keyEventPlugin.constructor.getEventFullKey(event);
        if (action === 'enter') {
            $event.stopPropagation();
            this.showPopover();
        }
    };
    PopoverComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'class' || key === 'tabindex') {
            return;
        }
        if (key === 'contentsource') {
            // if there is no partial content available, the popover should not open
            if (this.contentsource === 'partial' && !this.content) {
                this.canPopoverOpen = false;
            }
        }
        if (key === 'content' && nv) {
            this.canPopoverOpen = true;
        }
        _super.prototype.onPropertyChange.call(this, key, nv, ov);
    };
    PopoverComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.event = eventsMap[this.interaction];
    };
    PopoverComponent.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        styler(this.anchorRef.nativeElement, this);
    };
    PopoverComponent.initializeProps = registerProps();
    PopoverComponent.decorators = [
        { type: Component, args: [{
                    selector: 'wm-popover',
                    template: "<a [popover]=\"popoverTemplate\"\n   [popoverContext]=\"context\"\n   [popoverTitle]=\"title\"\n   [placement]=\"popoverplacement\"\n   [outsideClick]=\"true\"\n   [triggers]=\"event\"\n   (onShown)=\"onShown()\"\n   (onHidden)=\"onHidden()\"\n   containerClass=\"app-popover animated {{contentanimation}} {{popoverContainerCls}}\"\n   container=\"body\"\n   [isOpen]=\"isOpen\"\n   [tabindex]=\"tabindex\"\n   [name]=\"name\"\n   [class] = \"class\"\n   [ngClass]=\"{'disable-popover': !canPopoverOpen}\"\n\n   #anchor\n   name.bind=\"name\"\n   wmAnchor\n   animation.bind=\"animation\"\n   badgevalue.bind=\"badgevalue\"\n   caption.bind=\"caption\"\n   encodeurl.bind=\"encodeurl\"\n   hint.bind=\"hint\"\n   hyperlink.bind=\"hyperlink\"\n   iconurl.bind=\"iconurl\"\n   iconwidth.bind=\"iconwidth\"\n   iconheight.bind=\"iconheight\"\n   iconmargin.bind=\"iconmargin\"\n   iconclass.bind=\"iconclass\"\n   iconposition.bind=\"iconposition\"\n   shortcutkey.bind=\"shortcutkey\"\n   tabindex.bind=\"tabindex\"\n   (keydown)=\"onPopoverAnchorKeydown($event)\">\n</a>",
                    providers: [
                        provideAsWidgetRef(PopoverComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    PopoverComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: App },
        { type: undefined, decorators: [{ type: Inject, args: [EVENT_MANAGER_PLUGINS,] }] }
    ]; };
    PopoverComponent.propDecorators = {
        bsPopoverDirective: [{ type: ViewChild, args: [PopoverDirective,] }],
        anchorRef: [{ type: ViewChild, args: ['anchor',] }],
        popoverTemplate: [{ type: ContentChild, args: [TemplateRef,] }],
        partialRef: [{ type: ContentChild, args: ['partial',] }]
    };
    return PopoverComponent;
}(StylableComponent));
export { PopoverComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3BvcG92ZXIvcG9wb3Zlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBVSxXQUFXLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3JJLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRWxFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVqRCxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBR2pFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFJakUsSUFBTSxXQUFXLEdBQUcscUJBQXFCLENBQUM7QUFDMUMsSUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxZQUFZO0lBQ3hCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUM7QUFFRixJQUFNLFNBQVMsR0FBRztJQUNkLEtBQUssRUFBRSxPQUFPO0lBQ2QsS0FBSyxFQUFFLGtCQUFrQjtJQUN6QixPQUFPLEVBQUUsa0JBQWtCO0NBQzlCLENBQUM7QUFFRixJQUFJLGFBQStCLENBQUM7QUFFcEM7SUFRc0MsNENBQWlCO0lBZ0NuRCwwQkFBWSxHQUFhLEVBQVUsR0FBUSxFQUFpQyxjQUFjO1FBQTFGLFlBQ0ksa0JBQU0sR0FB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O1NBM05ZLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgQ29udGVudENoaWxkLCBFbGVtZW50UmVmLCBJbmplY3QsIEluamVjdG9yLCBPbkluaXQsIFRlbXBsYXRlUmVmLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEVWRU5UX01BTkFHRVJfUExVR0lOUyB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG5pbXBvcnQgeyBQb3BvdmVyRGlyZWN0aXZlIH0gZnJvbSAnbmd4LWJvb3RzdHJhcCc7XG5cbmltcG9ydCB7IGFkZENsYXNzLCBBcHAsIHNldEF0dHIsIHNldENTU0Zyb21PYmogfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3BvcG92ZXIucHJvcHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfLCAkO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtcG9wb3Zlci13cmFwcGVyJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLXBvcG92ZXInLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFNcbn07XG5cbmNvbnN0IGV2ZW50c01hcCA9IHtcbiAgICBjbGljazogJ2NsaWNrJyxcbiAgICBob3ZlcjogJ21vdXNlZW50ZXI6Y2xpY2snLFxuICAgIGRlZmF1bHQ6ICdjbGljayBtb3VzZWVudGVyJ1xufTtcblxubGV0IGFjdGl2ZVBvcG92ZXI6IFBvcG92ZXJDb21wb25lbnQ7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnd20tcG9wb3ZlcicsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3BvcG92ZXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoUG9wb3ZlckNvbXBvbmVudClcbiAgICBdXG59KVxuXG5leHBvcnQgY2xhc3MgUG9wb3ZlckNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIGV2ZW50OiBzdHJpbmc7XG4gICAgcHVibGljIGlzT3BlbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgY2xvc2VQb3BvdmVyVGltZW91dDtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcG9wb3ZlckNvbnRhaW5lckNscztcbiAgICBwcml2YXRlIGtleUV2ZW50UGx1Z2luO1xuICAgIHB1YmxpYyBjYW5Qb3BvdmVyT3BlbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBXaWRnZXRzO1xuICAgIHByaXZhdGUgVmFyaWFibGVzO1xuICAgIHByaXZhdGUgQWN0aW9ucztcblxuICAgIHB1YmxpYyBpbnRlcmFjdGlvbjogc3RyaW5nO1xuICAgIHB1YmxpYyBwb3BvdmVyYXJyb3c6IGJvb2xlYW47XG4gICAgcHVibGljIHBvcG92ZXJ3aWR0aDogc3RyaW5nO1xuICAgIHB1YmxpYyBwb3BvdmVyaGVpZ2h0OiBzdHJpbmc7XG4gICAgcHVibGljIGNvbnRlbnRhbmltYXRpb246IHN0cmluZztcbiAgICBwdWJsaWMgY29udGVudHNvdXJjZTogc3RyaW5nO1xuICAgIHB1YmxpYyBjb250ZW50OiBzdHJpbmc7XG4gICAgcHVibGljIHBvcG92ZXJwbGFjZW1lbnQ6IHN0cmluZztcblxuICAgIHB1YmxpYyBjbGFzczogc3RyaW5nO1xuICAgIHB1YmxpYyB0aXRsZTogc3RyaW5nO1xuICAgIHB1YmxpYyB0YWJpbmRleDogYW55O1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG5cbiAgICBAVmlld0NoaWxkKFBvcG92ZXJEaXJlY3RpdmUpIHByaXZhdGUgYnNQb3BvdmVyRGlyZWN0aXZlO1xuICAgIEBWaWV3Q2hpbGQoJ2FuY2hvcicpIGFuY2hvclJlZjogRWxlbWVudFJlZjtcbiAgICBAQ29udGVudENoaWxkKFRlbXBsYXRlUmVmKSBwb3BvdmVyVGVtcGxhdGU7XG4gICAgQENvbnRlbnRDaGlsZCgncGFydGlhbCcpIHBhcnRpYWxSZWY7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yLCBwcml2YXRlIGFwcDogQXBwLCBASW5qZWN0KEVWRU5UX01BTkFHRVJfUExVR0lOUykgZXZ0TW5nclBsdWdpbnMpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICAvLyBLZXlFdmVudHNQbHVnaW5cbiAgICAgICAgdGhpcy5rZXlFdmVudFBsdWdpbiA9IGV2dE1uZ3JQbHVnaW5zWzFdO1xuICAgICAgICB0aGlzLnBvcG92ZXJDb250YWluZXJDbHMgPSBgYXBwLXBvcG92ZXItJHt0aGlzLndpZGdldElkfWA7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBtZWh0b2QgaXMgdXNlZCB0byBzaG93L29wZW4gdGhlIHBvcG92ZXIuIFRoaXMgcmVmZXJzIHRvIHRoZSBzYW1lIG1ldGhvZCBzaG93UG9wb3Zlci5cbiAgICBwdWJsaWMgb3BlbigpIHtcbiAgICAgICAgdGhpcy5zaG93UG9wb3ZlcigpO1xuICAgIH1cblxuICAgIC8vIFRoaXMgbWVodG9kIGlzIHVzZWQgdG8gaGlkZS9jbG9zZSB0aGUgcG9wb3Zlci5cbiAgICBwdWJsaWMgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVHJpZ2dlciBvbiBoaWRpbmcgcG9wb3ZlclxuICAgIHB1YmxpYyBvbkhpZGRlbigpIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdoaWRlJywgeyRldmVudDoge3R5cGU6ICdoaWRlJ319KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldEZvY3VzVG9Qb3BvdmVyTGluaygpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmFuY2hvclJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKCksIDEwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkanVzdFBvcG92ZXJQb3NpdGlvbihwb3BvdmVyRWxlbSwgcGFyZW50RGltZXNpb24sIHBvcG92ZXJMZWZ0U2hpZnQpIHtcbiAgICAgICAgY29uc3QgYXJyb3dMZWZ0U2hpZnQgPSAocGFyZW50RGltZXNpb24ubGVmdCArIChwYXJlbnREaW1lc2lvbi53aWR0aCAvIDIpKSAtIHBvcG92ZXJMZWZ0U2hpZnQ7XG4gICAgICAgIHRoaXMuYnNQb3BvdmVyRGlyZWN0aXZlLl9wb3BvdmVyLl9uZ1pvbmUub25TdGFibGUuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIHBvcG92ZXJFbGVtLmNzcygnbGVmdCcsIHBvcG92ZXJMZWZ0U2hpZnQgKyAncHgnKTtcbiAgICAgICAgICAgIHBvcG92ZXJFbGVtLmZpbmQoJy5wb3BvdmVyLWFycm93JykuY3NzKCdsZWZ0JywgYXJyb3dMZWZ0U2hpZnQgKyAncHgnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVQb3BvdmVyUG9zdGlvbihlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHBvcG92ZXJFbGVtID0gJChlbGVtZW50KTtcbiAgICAgICAgY29uc3QgcG9wb3ZlckxlZnQgPSBfLnBhcnNlSW50KHBvcG92ZXJFbGVtLmNzcygnbGVmdCcpKTtcbiAgICAgICAgY29uc3QgcG9wb3ZlcldpZHRoID0gXy5wYXJzZUludChwb3BvdmVyRWxlbS5jc3MoJ3dpZHRoJykpO1xuICAgICAgICBjb25zdCB2aWV3UG9ydFdpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgICAgIGNvbnN0IHBhcmVudERpbWVzaW9uID0gdGhpcy5hbmNob3JSZWYubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgLy8gQWRqdXN0aW5nIHBvcG92ZXIgcG9zaXRpb24sIGlmIGl0IGlzIG5vdCB2aXNpYmxlIGF0IGxlZnQgc2lkZVxuICAgICAgICBpZiAocG9wb3ZlckxlZnQgPCAwKSB7XG4gICAgICAgICAgICBjb25zdCBwb3BvdmVyTGVmdFNoaWZ0ID0gNDtcbiAgICAgICAgICAgIHRoaXMuYWRqdXN0UG9wb3ZlclBvc2l0aW9uKHBvcG92ZXJFbGVtLCBwYXJlbnREaW1lc2lvbiwgcG9wb3ZlckxlZnRTaGlmdCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRqdXN0aW5nIHBvcG92ZXIgcG9zaXRpb24sIGlmIGl0IGlzIG5vdCB2aXNpYmxlIGF0IHJpZ2h0IHNpZGVcbiAgICAgICAgaWYgKHBvcG92ZXJMZWZ0ICsgcG9wb3ZlcldpZHRoID4gdmlld1BvcnRXaWR0aCkge1xuICAgICAgICAgICAgY29uc3QgcG9wb3ZlckxlZnRBZGp1c3QgPSAocG9wb3ZlckxlZnQgKyBwb3BvdmVyV2lkdGgpIC0gdmlld1BvcnRXaWR0aDtcbiAgICAgICAgICAgIGNvbnN0IHBvcG92ZXJMZWZ0U2hpZnQgPSAgcG9wb3ZlckxlZnQgLSBwb3BvdmVyTGVmdEFkanVzdCAtIDUwO1xuICAgICAgICAgICAgdGhpcy5hZGp1c3RQb3BvdmVyUG9zaXRpb24ocG9wb3ZlckVsZW0sIHBhcmVudERpbWVzaW9uLCBwb3BvdmVyTGVmdFNoaWZ0KTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLy8gVHJpZ2dlciBvbiBzaG93aW5nIHBvcG92ZXJcbiAgICBwdWJsaWMgb25TaG93bigpIHtcbiAgICAgICAgaWYgKGFjdGl2ZVBvcG92ZXIgJiYgYWN0aXZlUG9wb3Zlci5pc09wZW4pIHtcbiAgICAgICAgICAgIGFjdGl2ZVBvcG92ZXIuaXNPcGVuID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBhY3RpdmVQb3BvdmVyID0gdGhpcztcbiAgICAgICAgYWN0aXZlUG9wb3Zlci5pc09wZW4gPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHBvcG92ZXJDb250YWluZXIgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5wb3BvdmVyQ29udGFpbmVyQ2xzfWApIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBzZXRDU1NGcm9tT2JqKHBvcG92ZXJDb250YWluZXIsIHtcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5wb3BvdmVyaGVpZ2h0LFxuICAgICAgICAgICAgbWluV2lkdGg6IHRoaXMucG9wb3ZlcndpZHRoXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXRoaXMucG9wb3ZlcmFycm93KSB7XG4gICAgICAgICAgICBhZGRDbGFzcyhwb3BvdmVyQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5hcnJvdycpIGFzIEhUTUxFbGVtZW50LCAnaGlkZGVuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW50ZXJhY3Rpb24gPT09ICdob3ZlcicgfHwgdGhpcy5pbnRlcmFjdGlvbiA9PT0gJ2RlZmF1bHQnKSB7XG5cbiAgICAgICAgICAgIC8vIGRvIG5vdCB1c2UgYWRkRXZlbnRMaXN0ZW5lciBoZXJlXG4gICAgICAgICAgICAvLyBhdHRhY2hpbmcgdGhlIGV2ZW50IHRoaXMgd2F5IHdpbGwgb3ZlcnJpZGUgdGhlIGV4aXN0aW5nIGV2ZW50IGhhbmRsZXJzXG4gICAgICAgICAgICBwb3BvdmVyQ29udGFpbmVyLm9ubW91c2VlbnRlciA9ICgpID0+IGNsZWFyVGltZW91dCh0aGlzLmNsb3NlUG9wb3ZlclRpbWVvdXQpO1xuICAgICAgICAgICAgcG9wb3ZlckNvbnRhaW5lci5vbm1vdXNlbGVhdmUgPSAoKSA9PiB0aGlzLmhpZGVQb3BvdmVyKCk7XG4gICAgICAgICAgICB0aGlzLmFuY2hvclJlZi5uYXRpdmVFbGVtZW50Lm9ubW91c2VlbnRlciA9ICgpID0+IGNsZWFyVGltZW91dCh0aGlzLmNsb3NlUG9wb3ZlclRpbWVvdXQpO1xuICAgICAgICAgICAgdGhpcy5hbmNob3JSZWYubmF0aXZlRWxlbWVudC5vbm1vdXNlbGVhdmUgPSAoKSA9PiB0aGlzLmhpZGVQb3BvdmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZVJlZ2lzdGVyID0gdGhpcy5ldmVudE1hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihwb3BvdmVyQ29udGFpbmVyLCAna2V5ZG93bi5lc2MnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zZXRGb2N1c1RvUG9wb3ZlckxpbmsoKTtcbiAgICAgICAgICAgIGRlUmVnaXN0ZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHBvcG92ZXJTdGFydEJ0bjogSFRNTEVsZW1lbnQgPSBwb3BvdmVyQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5wb3BvdmVyLXN0YXJ0Jyk7XG4gICAgICAgIGNvbnN0IHBvcG92ZXJFbmRCdG46IEhUTUxFbGVtZW50ID0gcG9wb3ZlckNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcucG9wb3Zlci1lbmQnKTtcbiAgICAgICAgcG9wb3ZlclN0YXJ0QnRuLm9ua2V5ZG93biA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWN0aW9uID0gdGhpcy5rZXlFdmVudFBsdWdpbi5jb25zdHJ1Y3Rvci5nZXRFdmVudEZ1bGxLZXkoZXZlbnQpO1xuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIFNoaWZ0K1RhYiBrZXlcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdzaGlmdC50YWInKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ic1BvcG92ZXJEaXJlY3RpdmUuaGlkZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0Rm9jdXNUb1BvcG92ZXJMaW5rKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHBvcG92ZXJFbmRCdG4ub25rZXlkb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb24gPSB0aGlzLmtleUV2ZW50UGx1Z2luLmNvbnN0cnVjdG9yLmdldEV2ZW50RnVsbEtleShldmVudCk7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgVGFiIGtleVxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ3RhYicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJzUG9wb3ZlckRpcmVjdGl2ZS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGb2N1c1RvUG9wb3ZlckxpbmsoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBzZXRBdHRyKHBvcG92ZXJDb250YWluZXIsICd0YWJpbmRleCcsIDApO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHBvcG92ZXJTdGFydEJ0bi5mb2N1cygpLCA1MCk7XG4gICAgICAgIC8vIEFkanVzdGluZyBwb3BvdmVyIHBvc2l0aW9uIGlmIHRoZSBwb3BvdmVyIHBsYWNlbWVudCBpcyB0b3Agb3IgYm90dG9tXG4gICAgICAgIHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBvcG92ZXJwbGFjZW1lbnQgPT09ICdib3R0b20nIHx8IHRoaXMucG9wb3ZlcnBsYWNlbWVudCA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZVBvcG92ZXJQb3N0aW9uKHBvcG92ZXJDb250YWluZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdHJpZ2dlcmluZyBvbmxvYWQgYW5kIG9uc2hvdyBldmVudHMgYWZ0ZXIgcG9wb3ZlciBjb250ZW50IGhhcyByZW5kZXJlZFxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyUG9wb3ZlckV2ZW50cygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0cmlnZ2VyUG9wb3ZlckV2ZW50cygpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udGVudHNvdXJjZSA9PT0gJ3BhcnRpYWwnKSB7XG4gICAgICAgICAgICBjb25zdCBjYW5jZWxTdWJzY3JpcHRpb24gPSB0aGlzLmFwcC5zdWJzY3JpYmUoJ3BhcnRpYWxMb2FkZWQnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhckVsZSA9IHRoaXMucGFydGlhbFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgICAgICAgICAgIGxldCBwYXJ0aWFsU2NvcGU7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFyRWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnRpYWxTY29wZSAgPSBwYXJFbGUud2lkZ2V0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLldpZGdldHMgICA9IHBhcnRpYWxTY29wZS5XaWRnZXRzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLlZhcmlhYmxlcyA9IHBhcnRpYWxTY29wZS5WYXJpYWJsZXM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuQWN0aW9ucyAgID0gcGFydGlhbFNjb3BlLkFjdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnbG9hZCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Nob3cnLCB7JGV2ZW50OiB7dHlwZTogJ3Nob3cnfX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYW5jZWxTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5XaWRnZXRzICAgPSB0aGlzLnZpZXdQYXJlbnQuV2lkZ2V0cztcbiAgICAgICAgICAgIHRoaXMuVmFyaWFibGVzID0gdGhpcy52aWV3UGFyZW50LlZhcmlhYmxlcztcbiAgICAgICAgICAgIHRoaXMuQWN0aW9ucyAgID0gdGhpcy52aWV3UGFyZW50LkFjdGlvbnM7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Nob3cnLCB7JGV2ZW50OiB7dHlwZTogJ3Nob3cnfX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoaWRlUG9wb3ZlcigpIHtcbiAgICAgICAgdGhpcy5jbG9zZVBvcG92ZXJUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLmlzT3BlbiA9IGZhbHNlLCA1MDApO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2hvd1BvcG92ZXIoKSB7XG4gICAgICAgIHRoaXMuYnNQb3BvdmVyRGlyZWN0aXZlLnNob3coKTtcbiAgICB9XG5cbiAgICBvblBvcG92ZXJBbmNob3JLZXlkb3duKCRldmVudCkge1xuICAgICAgICAvLyBpZiB0aGVyZSBpcyBubyBjb250ZW50IGF2YWlsYWJsZSwgdGhlIHBvcG92ZXIgc2hvdWxkIG5vdCBvcGVuIHRocm91Z2ggZW50ZXIga2V5LiBTbyBjaGVja2luZyB3aGV0aGVyIHRoZSBjYW5Qb3BvdmVyT3BlbiBmbGFnIGlzIHRydWUgb3Igbm90LlxuICAgICAgICBpZiAoIXRoaXMuY2FuUG9wb3Zlck9wZW4pIHtcbiAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMua2V5RXZlbnRQbHVnaW4uY29uc3RydWN0b3IuZ2V0RXZlbnRGdWxsS2V5KGV2ZW50KTtcbiAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ2VudGVyJykge1xuICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5zaG93UG9wb3ZlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2NsYXNzJyB8fCBrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5ID09PSAnY29udGVudHNvdXJjZScpIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIHBhcnRpYWwgY29udGVudCBhdmFpbGFibGUsIHRoZSBwb3BvdmVyIHNob3VsZCBub3Qgb3BlblxuICAgICAgICAgICAgaWYgKHRoaXMuY29udGVudHNvdXJjZSA9PT0gJ3BhcnRpYWwnICYmICF0aGlzLmNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhblBvcG92ZXJPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ2NvbnRlbnQnICYmIG52KSB7XG4gICAgICAgICAgICB0aGlzLmNhblBvcG92ZXJPcGVuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy5ldmVudCA9IGV2ZW50c01hcFt0aGlzLmludGVyYWN0aW9uXTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuICAgICAgICBzdHlsZXIodGhpcy5hbmNob3JSZWYubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxufVxuIl19