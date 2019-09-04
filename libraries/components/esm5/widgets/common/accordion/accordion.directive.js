import * as tslib_1 from "tslib";
import { ContentChildren, Directive, Injector, QueryList } from '@angular/core';
import { isNumber, noop } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './accordion.props';
import { StylableComponent } from '../base/stylable.component';
import { AccordionPaneComponent } from './accordion-pane/accordion-pane.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-accordion panel-group';
var WIDGET_CONFIG = {
    widgetType: 'wm-accordion',
    hostClass: DEFAULT_CLS
};
var AccordionDirective = /** @class */ (function (_super) {
    tslib_1.__extends(AccordionDirective, _super);
    function AccordionDirective(inj) {
        var _this = this;
        var resolveFn = noop;
        _this = _super.call(this, inj, WIDGET_CONFIG, new Promise(function (res) { return resolveFn = res; })) || this;
        _this.promiseResolverFn = resolveFn;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        return _this;
    }
    /**
     * AccordionPane children components invoke this method to communicate with the parent
     * if isExpand is true and when closeothers is true, all the other panes are collapsed
     * if the evt argument is defined on-change callback will be invoked.
     * updates the activePane index property
     * @param {AccordionPaneComponent} paneRef
     * @param {boolean} isExpand
     * @param {Event} evt
     */
    AccordionDirective.prototype.notifyChange = function (paneRef, isExpand, evt) {
        if (isExpand) {
            this.closePanesExcept(paneRef);
            var index = this.getPaneIndexByRef(paneRef);
            this.activePane = paneRef.getWidget();
            // if the event is defined invoke the change callback.
            // programmatic invocations of expand/collapse on accordion-pane will not trigger change event
            if (evt) {
                this.invokeEventCallback('change', {
                    $event: evt,
                    newPaneIndex: index,
                    oldPaneIndex: this.activePaneIndex
                });
            }
            this.activePaneIndex = index;
        }
    };
    AccordionDirective.prototype.isValidPaneIndex = function (index) {
        return (index >= 0 && index < this.panes.length);
    };
    AccordionDirective.prototype.getPaneIndexByRef = function (paneRef) {
        return this.panes.toArray().indexOf(paneRef);
    };
    AccordionDirective.prototype.getPaneRefByIndex = function (index) {
        return this.panes.toArray()[index];
    };
    // Except the pane provided close all other panes
    AccordionDirective.prototype.closePanesExcept = function (paneRef) {
        if (isNumber(paneRef)) {
            paneRef = this.getPaneRefByIndex(paneRef);
        }
        if (this.closeothers) {
            this.panes.forEach(function (pane) {
                if (pane !== paneRef) {
                    pane.collapse();
                }
            });
        }
    };
    AccordionDirective.prototype.expandPane = function (index) {
        this.closePanesExcept(index);
        this.panes.toArray()[index].expand();
    };
    AccordionDirective.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'defaultpaneindex') {
            if (this.isValidPaneIndex(nv)) {
                this.expandPane(nv);
            }
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    AccordionDirective.prototype.ngAfterContentInit = function () {
        _super.prototype.ngAfterContentInit.call(this);
        this.promiseResolverFn();
    };
    AccordionDirective.initializeProps = registerProps();
    AccordionDirective.decorators = [
        { type: Directive, args: [{
                    selector: 'div[wmAccordion]',
                    providers: [
                        provideAsWidgetRef(AccordionDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    AccordionDirective.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    AccordionDirective.propDecorators = {
        panes: [{ type: ContentChildren, args: [AccordionPaneComponent,] }]
    };
    return AccordionDirective;
}(StylableComponent));
export { AccordionDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vYWNjb3JkaW9uL2FjY29yZGlvbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBb0IsZUFBZSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWxHLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVuRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDbkYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFakUsSUFBTSxXQUFXLEdBQUcsMkJBQTJCLENBQUM7QUFDaEQsSUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxjQUFjO0lBQzFCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUM7QUFFRjtJQU13Qyw4Q0FBaUI7SUFZckQsNEJBQVksR0FBYTtRQUF6QixpQkFLQztRQUpHLElBQUksU0FBUyxHQUFhLElBQUksQ0FBQztRQUMvQixRQUFBLGtCQUFNLEdBQUcsRUFBRSxhQUFhLEVBQUUsSUFBSSxPQUFPLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxTQUFTLEdBQUcsR0FBRyxFQUFmLENBQWUsQ0FBQyxDQUFDLFNBQUM7UUFDL0QsS0FBSSxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztRQUNuQyxNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLEVB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ekM7aUJBQ0o7Ozs7Z0JBdEJzRCxRQUFROzs7d0JBaUMxRCxlQUFlLFNBQUMsc0JBQXNCOztJQWlGM0MseUJBQUM7Q0FBQSxBQWpHRCxDQU13QyxpQkFBaUIsR0EyRnhEO1NBM0ZZLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyQ29udGVudEluaXQsIENvbnRlbnRDaGlsZHJlbiwgRGlyZWN0aXZlLCBJbmplY3RvciwgUXVlcnlMaXN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGlzTnVtYmVyLCBub29wIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2FjY29yZGlvbi5wcm9wcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IEFjY29yZGlvblBhbmVDb21wb25lbnQgfSBmcm9tICcuL2FjY29yZGlvbi1wYW5lL2FjY29yZGlvbi1wYW5lLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtYWNjb3JkaW9uIHBhbmVsLWdyb3VwJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWFjY29yZGlvbicsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21BY2NvcmRpb25dJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKEFjY29yZGlvbkRpcmVjdGl2ZSlcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbkRpcmVjdGl2ZSBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBkZWZhdWx0cGFuZWluZGV4OiBudW1iZXI7XG4gICAgcHVibGljIGNsb3Nlb3RoZXJzOiBib29sZWFuO1xuXG4gICAgcHJpdmF0ZSBhY3RpdmVQYW5lSW5kZXg6IG51bWJlcjtcbiAgICBwcml2YXRlIGFjdGl2ZVBhbmU6IEFjY29yZGlvblBhbmVDb21wb25lbnQ7XG4gICAgcHJpdmF0ZSBwcm9taXNlUmVzb2x2ZXJGbjogRnVuY3Rpb247XG5cbiAgICBAQ29udGVudENoaWxkcmVuKEFjY29yZGlvblBhbmVDb21wb25lbnQpIHBhbmVzOiBRdWVyeUxpc3Q8QWNjb3JkaW9uUGFuZUNvbXBvbmVudD47XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIGxldCByZXNvbHZlRm46IEZ1bmN0aW9uID0gbm9vcDtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHLCBuZXcgUHJvbWlzZShyZXMgPT4gcmVzb2x2ZUZuID0gcmVzKSk7XG4gICAgICAgIHRoaXMucHJvbWlzZVJlc29sdmVyRm4gPSByZXNvbHZlRm47XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLlNDUk9MTEFCTEVfQ09OVEFJTkVSKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBY2NvcmRpb25QYW5lIGNoaWxkcmVuIGNvbXBvbmVudHMgaW52b2tlIHRoaXMgbWV0aG9kIHRvIGNvbW11bmljYXRlIHdpdGggdGhlIHBhcmVudFxuICAgICAqIGlmIGlzRXhwYW5kIGlzIHRydWUgYW5kIHdoZW4gY2xvc2VvdGhlcnMgaXMgdHJ1ZSwgYWxsIHRoZSBvdGhlciBwYW5lcyBhcmUgY29sbGFwc2VkXG4gICAgICogaWYgdGhlIGV2dCBhcmd1bWVudCBpcyBkZWZpbmVkIG9uLWNoYW5nZSBjYWxsYmFjayB3aWxsIGJlIGludm9rZWQuXG4gICAgICogdXBkYXRlcyB0aGUgYWN0aXZlUGFuZSBpbmRleCBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7QWNjb3JkaW9uUGFuZUNvbXBvbmVudH0gcGFuZVJlZlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNFeHBhbmRcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldnRcbiAgICAgKi9cbiAgICBwdWJsaWMgbm90aWZ5Q2hhbmdlKHBhbmVSZWY6IEFjY29yZGlvblBhbmVDb21wb25lbnQsIGlzRXhwYW5kOiBib29sZWFuLCBldnQ6IEV2ZW50KSB7XG4gICAgICAgIGlmIChpc0V4cGFuZCkge1xuICAgICAgICAgICAgdGhpcy5jbG9zZVBhbmVzRXhjZXB0KHBhbmVSZWYpO1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmdldFBhbmVJbmRleEJ5UmVmKHBhbmVSZWYpO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVQYW5lID0gcGFuZVJlZi5nZXRXaWRnZXQoKTtcbiAgICAgICAgICAgIC8vIGlmIHRoZSBldmVudCBpcyBkZWZpbmVkIGludm9rZSB0aGUgY2hhbmdlIGNhbGxiYWNrLlxuICAgICAgICAgICAgLy8gcHJvZ3JhbW1hdGljIGludm9jYXRpb25zIG9mIGV4cGFuZC9jb2xsYXBzZSBvbiBhY2NvcmRpb24tcGFuZSB3aWxsIG5vdCB0cmlnZ2VyIGNoYW5nZSBldmVudFxuICAgICAgICAgICAgaWYgKGV2dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY2hhbmdlJywge1xuICAgICAgICAgICAgICAgICAgICAkZXZlbnQ6IGV2dCxcbiAgICAgICAgICAgICAgICAgICAgbmV3UGFuZUluZGV4OiBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgb2xkUGFuZUluZGV4OiB0aGlzLmFjdGl2ZVBhbmVJbmRleFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5hY3RpdmVQYW5lSW5kZXggPSBpbmRleDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaXNWYWxpZFBhbmVJbmRleChpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMucGFuZXMubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFBhbmVJbmRleEJ5UmVmKHBhbmVSZWY6IEFjY29yZGlvblBhbmVDb21wb25lbnQpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5wYW5lcy50b0FycmF5KCkuaW5kZXhPZihwYW5lUmVmKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFBhbmVSZWZCeUluZGV4KGluZGV4OiBudW1iZXIpOiBBY2NvcmRpb25QYW5lQ29tcG9uZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFuZXMudG9BcnJheSgpW2luZGV4XTtcbiAgICB9XG5cbiAgICAvLyBFeGNlcHQgdGhlIHBhbmUgcHJvdmlkZWQgY2xvc2UgYWxsIG90aGVyIHBhbmVzXG4gICAgcHJpdmF0ZSBjbG9zZVBhbmVzRXhjZXB0KHBhbmVSZWY6IEFjY29yZGlvblBhbmVDb21wb25lbnQgfCBudW1iZXIpIHtcbiAgICAgICAgaWYgKGlzTnVtYmVyKHBhbmVSZWYpKSB7XG4gICAgICAgICAgICBwYW5lUmVmID0gdGhpcy5nZXRQYW5lUmVmQnlJbmRleChwYW5lUmVmIGFzIG51bWJlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY2xvc2VvdGhlcnMpIHtcbiAgICAgICAgICAgIHRoaXMucGFuZXMuZm9yRWFjaChwYW5lID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocGFuZSAhPT0gcGFuZVJlZikge1xuICAgICAgICAgICAgICAgICAgICBwYW5lLmNvbGxhcHNlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGV4cGFuZFBhbmUoaW5kZXg6IG51bWJlcikge1xuICAgICAgICB0aGlzLmNsb3NlUGFuZXNFeGNlcHQoaW5kZXgpO1xuICAgICAgICB0aGlzLnBhbmVzLnRvQXJyYXkoKVtpbmRleF0uZXhwYW5kKCk7XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2RlZmF1bHRwYW5laW5kZXgnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1ZhbGlkUGFuZUluZGV4KG52KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXhwYW5kUGFuZShudik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdBZnRlckNvbnRlbnRJbml0KCk7XG4gICAgICAgIHRoaXMucHJvbWlzZVJlc29sdmVyRm4oKTtcbiAgICB9XG59XG4iXX0=