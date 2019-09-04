import { Component, ContentChild, ElementRef, Inject, Injector, TemplateRef, ViewChild } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { PopoverDirective } from 'ngx-bootstrap';
import { addClass, App, setAttr, setCSSFromObj } from '@wm/core';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './popover.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'app-popover-wrapper';
const WIDGET_CONFIG = {
    widgetType: 'wm-popover',
    hostClass: DEFAULT_CLS
};
const eventsMap = {
    click: 'click',
    hover: 'mouseenter:click',
    default: 'click mouseenter'
};
let activePopover;
export class PopoverComponent extends StylableComponent {
    constructor(inj, app, evtMngrPlugins) {
        super(inj, WIDGET_CONFIG);
        this.app = app;
        this.isOpen = false;
        this.canPopoverOpen = true;
        // KeyEventsPlugin
        this.keyEventPlugin = evtMngrPlugins[1];
        this.popoverContainerCls = `app-popover-${this.widgetId}`;
    }
    // This mehtod is used to show/open the popover. This refers to the same method showPopover.
    open() {
        this.showPopover();
    }
    // This mehtod is used to hide/close the popover.
    close() {
        this.isOpen = false;
    }
    // Trigger on hiding popover
    onHidden() {
        this.invokeEventCallback('hide', { $event: { type: 'hide' } });
    }
    setFocusToPopoverLink() {
        setTimeout(() => this.anchorRef.nativeElement.focus(), 10);
    }
    adjustPopoverPosition(popoverElem, parentDimesion, popoverLeftShift) {
        const arrowLeftShift = (parentDimesion.left + (parentDimesion.width / 2)) - popoverLeftShift;
        this.bsPopoverDirective._popover._ngZone.onStable.subscribe(() => {
            popoverElem.css('left', popoverLeftShift + 'px');
            popoverElem.find('.popover-arrow').css('left', arrowLeftShift + 'px');
        });
    }
    calculatePopoverPostion(element) {
        const popoverElem = $(element);
        const popoverLeft = _.parseInt(popoverElem.css('left'));
        const popoverWidth = _.parseInt(popoverElem.css('width'));
        const viewPortWidth = $(window).width();
        const parentDimesion = this.anchorRef.nativeElement.getBoundingClientRect();
        // Adjusting popover position, if it is not visible at left side
        if (popoverLeft < 0) {
            const popoverLeftShift = 4;
            this.adjustPopoverPosition(popoverElem, parentDimesion, popoverLeftShift);
        }
        // Adjusting popover position, if it is not visible at right side
        if (popoverLeft + popoverWidth > viewPortWidth) {
            const popoverLeftAdjust = (popoverLeft + popoverWidth) - viewPortWidth;
            const popoverLeftShift = popoverLeft - popoverLeftAdjust - 50;
            this.adjustPopoverPosition(popoverElem, parentDimesion, popoverLeftShift);
        }
    }
    // Trigger on showing popover
    onShown() {
        if (activePopover && activePopover.isOpen) {
            activePopover.isOpen = false;
        }
        activePopover = this;
        activePopover.isOpen = true;
        const popoverContainer = document.querySelector(`.${this.popoverContainerCls}`);
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
            popoverContainer.onmouseenter = () => clearTimeout(this.closePopoverTimeout);
            popoverContainer.onmouseleave = () => this.hidePopover();
            this.anchorRef.nativeElement.onmouseenter = () => clearTimeout(this.closePopoverTimeout);
            this.anchorRef.nativeElement.onmouseleave = () => this.hidePopover();
        }
        const deRegister = this.eventManager.addEventListener(popoverContainer, 'keydown.esc', () => {
            this.isOpen = false;
            this.setFocusToPopoverLink();
            deRegister();
        });
        const popoverStartBtn = popoverContainer.querySelector('.popover-start');
        const popoverEndBtn = popoverContainer.querySelector('.popover-end');
        popoverStartBtn.onkeydown = (event) => {
            const action = this.keyEventPlugin.constructor.getEventFullKey(event);
            // Check for Shift+Tab key
            if (action === 'shift.tab') {
                this.bsPopoverDirective.hide();
                this.setFocusToPopoverLink();
            }
        };
        popoverEndBtn.onkeydown = (event) => {
            const action = this.keyEventPlugin.constructor.getEventFullKey(event);
            // Check for Tab key
            if (action === 'tab') {
                this.bsPopoverDirective.hide();
                this.setFocusToPopoverLink();
            }
        };
        setAttr(popoverContainer, 'tabindex', 0);
        setTimeout(() => popoverStartBtn.focus(), 50);
        // Adjusting popover position if the popover placement is top or bottom
        setTimeout(() => {
            if (this.popoverplacement === 'bottom' || this.popoverplacement === 'top') {
                this.calculatePopoverPostion(popoverContainer);
            }
            // triggering onload and onshow events after popover content has rendered
            this.triggerPopoverEvents();
        });
    }
    triggerPopoverEvents() {
        if (this.contentsource === 'partial') {
            const cancelSubscription = this.app.subscribe('partialLoaded', (data) => {
                const parEle = this.partialRef.nativeElement;
                let partialScope;
                if (parEle) {
                    partialScope = parEle.widget;
                    this.Widgets = partialScope.Widgets;
                    this.Variables = partialScope.Variables;
                    this.Actions = partialScope.Actions;
                    this.invokeEventCallback('load');
                    this.invokeEventCallback('show', { $event: { type: 'show' } });
                }
                cancelSubscription();
            });
        }
        else {
            this.Widgets = this.viewParent.Widgets;
            this.Variables = this.viewParent.Variables;
            this.Actions = this.viewParent.Actions;
            this.invokeEventCallback('show', { $event: { type: 'show' } });
        }
    }
    hidePopover() {
        this.closePopoverTimeout = setTimeout(() => this.isOpen = false, 500);
    }
    showPopover() {
        this.bsPopoverDirective.show();
    }
    onPopoverAnchorKeydown($event) {
        // if there is no content available, the popover should not open through enter key. So checking whether the canPopoverOpen flag is true or not.
        if (!this.canPopoverOpen) {
            return;
        }
        const action = this.keyEventPlugin.constructor.getEventFullKey(event);
        if (action === 'enter') {
            $event.stopPropagation();
            this.showPopover();
        }
    }
    onPropertyChange(key, nv, ov) {
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
        super.onPropertyChange(key, nv, ov);
    }
    ngOnInit() {
        super.ngOnInit();
        this.event = eventsMap[this.interaction];
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.anchorRef.nativeElement, this);
    }
}
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
PopoverComponent.ctorParameters = () => [
    { type: Injector },
    { type: App },
    { type: undefined, decorators: [{ type: Inject, args: [EVENT_MANAGER_PLUGINS,] }] }
];
PopoverComponent.propDecorators = {
    bsPopoverDirective: [{ type: ViewChild, args: [PopoverDirective,] }],
    anchorRef: [{ type: ViewChild, args: ['anchor',] }],
    popoverTemplate: [{ type: ContentChild, args: [TemplateRef,] }],
    partialRef: [{ type: ContentChild, args: ['partial',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3BvcG92ZXIvcG9wb3Zlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFVLFdBQVcsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckksT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFbEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWpELE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHakUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUlqRSxNQUFNLFdBQVcsR0FBRyxxQkFBcUIsQ0FBQztBQUMxQyxNQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLFlBQVk7SUFDeEIsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQUVGLE1BQU0sU0FBUyxHQUFHO0lBQ2QsS0FBSyxFQUFFLE9BQU87SUFDZCxLQUFLLEVBQUUsa0JBQWtCO0lBQ3pCLE9BQU8sRUFBRSxrQkFBa0I7Q0FDOUIsQ0FBQztBQUVGLElBQUksYUFBK0IsQ0FBQztBQVVwQyxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsaUJBQWlCO0lBZ0NuRCxZQUFZLEdBQWEsRUFBVSxHQUFRLEVBQWlDLGNBQWM7UUFDdEYs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QUFhLEtBQUssU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDbkQsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7YUFDL0I7U0FDSjtRQUNELElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxFQUFFLEVBQUU7WUFDekIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7U0FDOUI7UUFDRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsUUFBUTtRQUNKLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELGVBQWU7UUFDWCxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9DLENBQUM7O0FBek5NLGdDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBVDVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsWUFBWTtnQkFDdEIseWpDQUF1QztnQkFDdkMsU0FBUyxFQUFFO29CQUNQLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDO2lCQUN2QzthQUNKOzs7O1lBbkNvRSxRQUFRO1lBSzFELEdBQUc7NENBZ0U0QixNQUFNLFNBQUMscUJBQXFCOzs7aUNBTHpFLFNBQVMsU0FBQyxnQkFBZ0I7d0JBQzFCLFNBQVMsU0FBQyxRQUFROzhCQUNsQixZQUFZLFNBQUMsV0FBVzt5QkFDeEIsWUFBWSxTQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIENvbnRlbnRDaGlsZCwgRWxlbWVudFJlZiwgSW5qZWN0LCBJbmplY3RvciwgT25Jbml0LCBUZW1wbGF0ZVJlZiwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBFVkVOVF9NQU5BR0VSX1BMVUdJTlMgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcblxuaW1wb3J0IHsgUG9wb3ZlckRpcmVjdGl2ZSB9IGZyb20gJ25neC1ib290c3RyYXAnO1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgQXBwLCBzZXRBdHRyLCBzZXRDU1NGcm9tT2JqIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9wb3BvdmVyLnByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXywgJDtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXBvcG92ZXItd3JhcHBlcic7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1wb3BvdmVyJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG5jb25zdCBldmVudHNNYXAgPSB7XG4gICAgY2xpY2s6ICdjbGljaycsXG4gICAgaG92ZXI6ICdtb3VzZWVudGVyOmNsaWNrJyxcbiAgICBkZWZhdWx0OiAnY2xpY2sgbW91c2VlbnRlcidcbn07XG5cbmxldCBhY3RpdmVQb3BvdmVyOiBQb3BvdmVyQ29tcG9uZW50O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3dtLXBvcG92ZXInLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9wb3BvdmVyLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFBvcG92ZXJDb21wb25lbnQpXG4gICAgXVxufSlcblxuZXhwb3J0IGNsYXNzIFBvcG92ZXJDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBldmVudDogc3RyaW5nO1xuICAgIHB1YmxpYyBpc09wZW4gPSBmYWxzZTtcbiAgICBwcml2YXRlIGNsb3NlUG9wb3ZlclRpbWVvdXQ7XG4gICAgcHVibGljIHJlYWRvbmx5IHBvcG92ZXJDb250YWluZXJDbHM7XG4gICAgcHJpdmF0ZSBrZXlFdmVudFBsdWdpbjtcbiAgICBwdWJsaWMgY2FuUG9wb3Zlck9wZW4gPSB0cnVlO1xuICAgIHByaXZhdGUgV2lkZ2V0cztcbiAgICBwcml2YXRlIFZhcmlhYmxlcztcbiAgICBwcml2YXRlIEFjdGlvbnM7XG5cbiAgICBwdWJsaWMgaW50ZXJhY3Rpb246IHN0cmluZztcbiAgICBwdWJsaWMgcG9wb3ZlcmFycm93OiBib29sZWFuO1xuICAgIHB1YmxpYyBwb3BvdmVyd2lkdGg6IHN0cmluZztcbiAgICBwdWJsaWMgcG9wb3ZlcmhlaWdodDogc3RyaW5nO1xuICAgIHB1YmxpYyBjb250ZW50YW5pbWF0aW9uOiBzdHJpbmc7XG4gICAgcHVibGljIGNvbnRlbnRzb3VyY2U6IHN0cmluZztcbiAgICBwdWJsaWMgY29udGVudDogc3RyaW5nO1xuICAgIHB1YmxpYyBwb3BvdmVycGxhY2VtZW50OiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgY2xhc3M6IHN0cmluZztcbiAgICBwdWJsaWMgdGl0bGU6IHN0cmluZztcbiAgICBwdWJsaWMgdGFiaW5kZXg6IGFueTtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuXG4gICAgQFZpZXdDaGlsZChQb3BvdmVyRGlyZWN0aXZlKSBwcml2YXRlIGJzUG9wb3ZlckRpcmVjdGl2ZTtcbiAgICBAVmlld0NoaWxkKCdhbmNob3InKSBhbmNob3JSZWY6IEVsZW1lbnRSZWY7XG4gICAgQENvbnRlbnRDaGlsZChUZW1wbGF0ZVJlZikgcG9wb3ZlclRlbXBsYXRlO1xuICAgIEBDb250ZW50Q2hpbGQoJ3BhcnRpYWwnKSBwYXJ0aWFsUmVmO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3RvciwgcHJpdmF0ZSBhcHA6IEFwcCwgQEluamVjdChFVkVOVF9NQU5BR0VSX1BMVUdJTlMpIGV2dE1uZ3JQbHVnaW5zKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgLy8gS2V5RXZlbnRzUGx1Z2luXG4gICAgICAgIHRoaXMua2V5RXZlbnRQbHVnaW4gPSBldnRNbmdyUGx1Z2luc1sxXTtcbiAgICAgICAgdGhpcy5wb3BvdmVyQ29udGFpbmVyQ2xzID0gYGFwcC1wb3BvdmVyLSR7dGhpcy53aWRnZXRJZH1gO1xuICAgIH1cblxuICAgIC8vIFRoaXMgbWVodG9kIGlzIHVzZWQgdG8gc2hvdy9vcGVuIHRoZSBwb3BvdmVyLiBUaGlzIHJlZmVycyB0byB0aGUgc2FtZSBtZXRob2Qgc2hvd1BvcG92ZXIuXG4gICAgcHVibGljIG9wZW4oKSB7XG4gICAgICAgIHRoaXMuc2hvd1BvcG92ZXIoKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIG1laHRvZCBpcyB1c2VkIHRvIGhpZGUvY2xvc2UgdGhlIHBvcG92ZXIuXG4gICAgcHVibGljIGNsb3NlKCkge1xuICAgICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFRyaWdnZXIgb24gaGlkaW5nIHBvcG92ZXJcbiAgICBwdWJsaWMgb25IaWRkZW4oKSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnaGlkZScsIHskZXZlbnQ6IHt0eXBlOiAnaGlkZSd9fSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRGb2N1c1RvUG9wb3ZlckxpbmsoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5hbmNob3JSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpLCAxMCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGp1c3RQb3BvdmVyUG9zaXRpb24ocG9wb3ZlckVsZW0sIHBhcmVudERpbWVzaW9uLCBwb3BvdmVyTGVmdFNoaWZ0KSB7XG4gICAgICAgIGNvbnN0IGFycm93TGVmdFNoaWZ0ID0gKHBhcmVudERpbWVzaW9uLmxlZnQgKyAocGFyZW50RGltZXNpb24ud2lkdGggLyAyKSkgLSBwb3BvdmVyTGVmdFNoaWZ0O1xuICAgICAgICB0aGlzLmJzUG9wb3ZlckRpcmVjdGl2ZS5fcG9wb3Zlci5fbmdab25lLm9uU3RhYmxlLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICBwb3BvdmVyRWxlbS5jc3MoJ2xlZnQnLCBwb3BvdmVyTGVmdFNoaWZ0ICsgJ3B4Jyk7XG4gICAgICAgICAgICBwb3BvdmVyRWxlbS5maW5kKCcucG9wb3Zlci1hcnJvdycpLmNzcygnbGVmdCcsIGFycm93TGVmdFNoaWZ0ICsgJ3B4Jyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FsY3VsYXRlUG9wb3ZlclBvc3Rpb24oZWxlbWVudCkge1xuICAgICAgICBjb25zdCBwb3BvdmVyRWxlbSA9ICQoZWxlbWVudCk7XG4gICAgICAgIGNvbnN0IHBvcG92ZXJMZWZ0ID0gXy5wYXJzZUludChwb3BvdmVyRWxlbS5jc3MoJ2xlZnQnKSk7XG4gICAgICAgIGNvbnN0IHBvcG92ZXJXaWR0aCA9IF8ucGFyc2VJbnQocG9wb3ZlckVsZW0uY3NzKCd3aWR0aCcpKTtcbiAgICAgICAgY29uc3Qgdmlld1BvcnRXaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuICAgICAgICBjb25zdCBwYXJlbnREaW1lc2lvbiA9IHRoaXMuYW5jaG9yUmVmLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIC8vIEFkanVzdGluZyBwb3BvdmVyIHBvc2l0aW9uLCBpZiBpdCBpcyBub3QgdmlzaWJsZSBhdCBsZWZ0IHNpZGVcbiAgICAgICAgaWYgKHBvcG92ZXJMZWZ0IDwgMCkge1xuICAgICAgICAgICAgY29uc3QgcG9wb3ZlckxlZnRTaGlmdCA9IDQ7XG4gICAgICAgICAgICB0aGlzLmFkanVzdFBvcG92ZXJQb3NpdGlvbihwb3BvdmVyRWxlbSwgcGFyZW50RGltZXNpb24sIHBvcG92ZXJMZWZ0U2hpZnQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFkanVzdGluZyBwb3BvdmVyIHBvc2l0aW9uLCBpZiBpdCBpcyBub3QgdmlzaWJsZSBhdCByaWdodCBzaWRlXG4gICAgICAgIGlmIChwb3BvdmVyTGVmdCArIHBvcG92ZXJXaWR0aCA+IHZpZXdQb3J0V2lkdGgpIHtcbiAgICAgICAgICAgIGNvbnN0IHBvcG92ZXJMZWZ0QWRqdXN0ID0gKHBvcG92ZXJMZWZ0ICsgcG9wb3ZlcldpZHRoKSAtIHZpZXdQb3J0V2lkdGg7XG4gICAgICAgICAgICBjb25zdCBwb3BvdmVyTGVmdFNoaWZ0ID0gIHBvcG92ZXJMZWZ0IC0gcG9wb3ZlckxlZnRBZGp1c3QgLSA1MDtcbiAgICAgICAgICAgIHRoaXMuYWRqdXN0UG9wb3ZlclBvc2l0aW9uKHBvcG92ZXJFbGVtLCBwYXJlbnREaW1lc2lvbiwgcG9wb3ZlckxlZnRTaGlmdCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8vIFRyaWdnZXIgb24gc2hvd2luZyBwb3BvdmVyXG4gICAgcHVibGljIG9uU2hvd24oKSB7XG4gICAgICAgIGlmIChhY3RpdmVQb3BvdmVyICYmIGFjdGl2ZVBvcG92ZXIuaXNPcGVuKSB7XG4gICAgICAgICAgICBhY3RpdmVQb3BvdmVyLmlzT3BlbiA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgYWN0aXZlUG9wb3ZlciA9IHRoaXM7XG4gICAgICAgIGFjdGl2ZVBvcG92ZXIuaXNPcGVuID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBwb3BvdmVyQ29udGFpbmVyICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMucG9wb3ZlckNvbnRhaW5lckNsc31gKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgc2V0Q1NTRnJvbU9iaihwb3BvdmVyQ29udGFpbmVyLCB7XG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMucG9wb3ZlcmhlaWdodCxcbiAgICAgICAgICAgIG1pbldpZHRoOiB0aGlzLnBvcG92ZXJ3aWR0aFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCF0aGlzLnBvcG92ZXJhcnJvdykge1xuICAgICAgICAgICAgYWRkQ2xhc3MocG9wb3ZlckNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuYXJyb3cnKSBhcyBIVE1MRWxlbWVudCwgJ2hpZGRlbicpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmludGVyYWN0aW9uID09PSAnaG92ZXInIHx8IHRoaXMuaW50ZXJhY3Rpb24gPT09ICdkZWZhdWx0Jykge1xuXG4gICAgICAgICAgICAvLyBkbyBub3QgdXNlIGFkZEV2ZW50TGlzdGVuZXIgaGVyZVxuICAgICAgICAgICAgLy8gYXR0YWNoaW5nIHRoZSBldmVudCB0aGlzIHdheSB3aWxsIG92ZXJyaWRlIHRoZSBleGlzdGluZyBldmVudCBoYW5kbGVyc1xuICAgICAgICAgICAgcG9wb3ZlckNvbnRhaW5lci5vbm1vdXNlZW50ZXIgPSAoKSA9PiBjbGVhclRpbWVvdXQodGhpcy5jbG9zZVBvcG92ZXJUaW1lb3V0KTtcbiAgICAgICAgICAgIHBvcG92ZXJDb250YWluZXIub25tb3VzZWxlYXZlID0gKCkgPT4gdGhpcy5oaWRlUG9wb3ZlcigpO1xuICAgICAgICAgICAgdGhpcy5hbmNob3JSZWYubmF0aXZlRWxlbWVudC5vbm1vdXNlZW50ZXIgPSAoKSA9PiBjbGVhclRpbWVvdXQodGhpcy5jbG9zZVBvcG92ZXJUaW1lb3V0KTtcbiAgICAgICAgICAgIHRoaXMuYW5jaG9yUmVmLm5hdGl2ZUVsZW1lbnQub25tb3VzZWxlYXZlID0gKCkgPT4gdGhpcy5oaWRlUG9wb3ZlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVSZWdpc3RlciA9IHRoaXMuZXZlbnRNYW5hZ2VyLmFkZEV2ZW50TGlzdGVuZXIocG9wb3ZlckNvbnRhaW5lciwgJ2tleWRvd24uZXNjJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc2V0Rm9jdXNUb1BvcG92ZXJMaW5rKCk7XG4gICAgICAgICAgICBkZVJlZ2lzdGVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBwb3BvdmVyU3RhcnRCdG46IEhUTUxFbGVtZW50ID0gcG9wb3ZlckNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcucG9wb3Zlci1zdGFydCcpO1xuICAgICAgICBjb25zdCBwb3BvdmVyRW5kQnRuOiBIVE1MRWxlbWVudCA9IHBvcG92ZXJDb250YWluZXIucXVlcnlTZWxlY3RvcignLnBvcG92ZXItZW5kJyk7XG4gICAgICAgIHBvcG92ZXJTdGFydEJ0bi5vbmtleWRvd24gPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMua2V5RXZlbnRQbHVnaW4uY29uc3RydWN0b3IuZ2V0RXZlbnRGdWxsS2V5KGV2ZW50KTtcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBTaGlmdCtUYWIga2V5XG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnc2hpZnQudGFiJykge1xuICAgICAgICAgICAgICAgIHRoaXMuYnNQb3BvdmVyRGlyZWN0aXZlLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEZvY3VzVG9Qb3BvdmVyTGluaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBwb3BvdmVyRW5kQnRuLm9ua2V5ZG93biA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWN0aW9uID0gdGhpcy5rZXlFdmVudFBsdWdpbi5jb25zdHJ1Y3Rvci5nZXRFdmVudEZ1bGxLZXkoZXZlbnQpO1xuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIFRhYiBrZXlcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICd0YWInKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ic1BvcG92ZXJEaXJlY3RpdmUuaGlkZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0Rm9jdXNUb1BvcG92ZXJMaW5rKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgc2V0QXR0cihwb3BvdmVyQ29udGFpbmVyLCAndGFiaW5kZXgnLCAwKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBwb3BvdmVyU3RhcnRCdG4uZm9jdXMoKSwgNTApO1xuICAgICAgICAvLyBBZGp1c3RpbmcgcG9wb3ZlciBwb3NpdGlvbiBpZiB0aGUgcG9wb3ZlciBwbGFjZW1lbnQgaXMgdG9wIG9yIGJvdHRvbVxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5wb3BvdmVycGxhY2VtZW50ID09PSAnYm90dG9tJyB8fCB0aGlzLnBvcG92ZXJwbGFjZW1lbnQgPT09ICd0b3AnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVQb3BvdmVyUG9zdGlvbihwb3BvdmVyQ29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHRyaWdnZXJpbmcgb25sb2FkIGFuZCBvbnNob3cgZXZlbnRzIGFmdGVyIHBvcG92ZXIgY29udGVudCBoYXMgcmVuZGVyZWRcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlclBvcG92ZXJFdmVudHMoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdHJpZ2dlclBvcG92ZXJFdmVudHMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRlbnRzb3VyY2UgPT09ICdwYXJ0aWFsJykge1xuICAgICAgICAgICAgY29uc3QgY2FuY2VsU3Vic2NyaXB0aW9uID0gdGhpcy5hcHAuc3Vic2NyaWJlKCdwYXJ0aWFsTG9hZGVkJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJFbGUgPSB0aGlzLnBhcnRpYWxSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgICAgICAgICAgICBsZXQgcGFydGlhbFNjb3BlO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhckVsZSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsU2NvcGUgID0gcGFyRWxlLndpZGdldDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5XaWRnZXRzICAgPSBwYXJ0aWFsU2NvcGUuV2lkZ2V0cztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5WYXJpYWJsZXMgPSBwYXJ0aWFsU2NvcGUuVmFyaWFibGVzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLkFjdGlvbnMgICA9IHBhcnRpYWxTY29wZS5BY3Rpb25zO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2xvYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzaG93JywgeyRldmVudDoge3R5cGU6ICdzaG93J319KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FuY2VsU3Vic2NyaXB0aW9uKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuV2lkZ2V0cyAgID0gdGhpcy52aWV3UGFyZW50LldpZGdldHM7XG4gICAgICAgICAgICB0aGlzLlZhcmlhYmxlcyA9IHRoaXMudmlld1BhcmVudC5WYXJpYWJsZXM7XG4gICAgICAgICAgICB0aGlzLkFjdGlvbnMgICA9IHRoaXMudmlld1BhcmVudC5BY3Rpb25zO1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzaG93JywgeyRldmVudDoge3R5cGU6ICdzaG93J319KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaGlkZVBvcG92ZXIoKSB7XG4gICAgICAgIHRoaXMuY2xvc2VQb3BvdmVyVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5pc09wZW4gPSBmYWxzZSwgNTAwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNob3dQb3BvdmVyKCkge1xuICAgICAgICB0aGlzLmJzUG9wb3ZlckRpcmVjdGl2ZS5zaG93KCk7XG4gICAgfVxuXG4gICAgb25Qb3BvdmVyQW5jaG9yS2V5ZG93bigkZXZlbnQpIHtcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gY29udGVudCBhdmFpbGFibGUsIHRoZSBwb3BvdmVyIHNob3VsZCBub3Qgb3BlbiB0aHJvdWdoIGVudGVyIGtleS4gU28gY2hlY2tpbmcgd2hldGhlciB0aGUgY2FuUG9wb3Zlck9wZW4gZmxhZyBpcyB0cnVlIG9yIG5vdC5cbiAgICAgICAgaWYgKCF0aGlzLmNhblBvcG92ZXJPcGVuKSB7XG4gICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhY3Rpb24gPSB0aGlzLmtleUV2ZW50UGx1Z2luLmNvbnN0cnVjdG9yLmdldEV2ZW50RnVsbEtleShldmVudCk7XG4gICAgICAgIGlmIChhY3Rpb24gPT09ICdlbnRlcicpIHtcbiAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd1BvcG92ZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdjbGFzcycgfHwga2V5ID09PSAndGFiaW5kZXgnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ2NvbnRlbnRzb3VyY2UnKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBubyBwYXJ0aWFsIGNvbnRlbnQgYXZhaWxhYmxlLCB0aGUgcG9wb3ZlciBzaG91bGQgbm90IG9wZW5cbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRlbnRzb3VyY2UgPT09ICdwYXJ0aWFsJyAmJiAhdGhpcy5jb250ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW5Qb3BvdmVyT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkgPT09ICdjb250ZW50JyAmJiBudikge1xuICAgICAgICAgICAgdGhpcy5jYW5Qb3BvdmVyT3BlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgICAgIHRoaXMuZXZlbnQgPSBldmVudHNNYXBbdGhpcy5pbnRlcmFjdGlvbl07XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgc3R5bGVyKHRoaXMuYW5jaG9yUmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgIH1cbn1cbiJdfQ==