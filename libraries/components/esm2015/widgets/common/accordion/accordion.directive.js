import { ContentChildren, Directive, Injector, QueryList } from '@angular/core';
import { isNumber, noop } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './accordion.props';
import { StylableComponent } from '../base/stylable.component';
import { AccordionPaneComponent } from './accordion-pane/accordion-pane.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'app-accordion panel-group';
const WIDGET_CONFIG = {
    widgetType: 'wm-accordion',
    hostClass: DEFAULT_CLS
};
export class AccordionDirective extends StylableComponent {
    constructor(inj) {
        let resolveFn = noop;
        super(inj, WIDGET_CONFIG, new Promise(res => resolveFn = res));
        this.promiseResolverFn = resolveFn;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
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
    notifyChange(paneRef, isExpand, evt) {
        if (isExpand) {
            this.closePanesExcept(paneRef);
            const index = this.getPaneIndexByRef(paneRef);
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
    }
    isValidPaneIndex(index) {
        return (index >= 0 && index < this.panes.length);
    }
    getPaneIndexByRef(paneRef) {
        return this.panes.toArray().indexOf(paneRef);
    }
    getPaneRefByIndex(index) {
        return this.panes.toArray()[index];
    }
    // Except the pane provided close all other panes
    closePanesExcept(paneRef) {
        if (isNumber(paneRef)) {
            paneRef = this.getPaneRefByIndex(paneRef);
        }
        if (this.closeothers) {
            this.panes.forEach(pane => {
                if (pane !== paneRef) {
                    pane.collapse();
                }
            });
        }
    }
    expandPane(index) {
        this.closePanesExcept(index);
        this.panes.toArray()[index].expand();
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'defaultpaneindex') {
            if (this.isValidPaneIndex(nv)) {
                this.expandPane(nv);
            }
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this.promiseResolverFn();
    }
}
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
AccordionDirective.ctorParameters = () => [
    { type: Injector }
];
AccordionDirective.propDecorators = {
    panes: [{ type: ContentChildren, args: [AccordionPaneComponent,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vYWNjb3JkaW9uL2FjY29yZGlvbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFvQixlQUFlLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFbEcsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFMUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRW5FLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUNuRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUVqRSxNQUFNLFdBQVcsR0FBRywyQkFBMkIsQ0FBQztBQUNoRCxNQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGNBQWM7SUFDMUIsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQVFGLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxpQkFBaUI7SUFZckQsWUFBWSxHQUFhO1FBQ3JCLElBQUksU0FBUyxHQUFhLElBQUksQ0FBQztRQUMvQixLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUM7UUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLGlCQUFp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b3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlckNvbnRlbnRJbml0LCBDb250ZW50Q2hpbGRyZW4sIERpcmVjdGl2ZSwgSW5qZWN0b3IsIFF1ZXJ5TGlzdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBpc051bWJlciwgbm9vcCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9hY2NvcmRpb24ucHJvcHMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBBY2NvcmRpb25QYW5lQ29tcG9uZW50IH0gZnJvbSAnLi9hY2NvcmRpb24tcGFuZS9hY2NvcmRpb24tcGFuZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWFjY29yZGlvbiBwYW5lbC1ncm91cCc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1hY2NvcmRpb24nLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFNcbn07XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnZGl2W3dtQWNjb3JkaW9uXScsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihBY2NvcmRpb25EaXJlY3RpdmUpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBBY2NvcmRpb25EaXJlY3RpdmUgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgZGVmYXVsdHBhbmVpbmRleDogbnVtYmVyO1xuICAgIHB1YmxpYyBjbG9zZW90aGVyczogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgYWN0aXZlUGFuZUluZGV4OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBhY3RpdmVQYW5lOiBBY2NvcmRpb25QYW5lQ29tcG9uZW50O1xuICAgIHByaXZhdGUgcHJvbWlzZVJlc29sdmVyRm46IEZ1bmN0aW9uO1xuXG4gICAgQENvbnRlbnRDaGlsZHJlbihBY2NvcmRpb25QYW5lQ29tcG9uZW50KSBwYW5lczogUXVlcnlMaXN0PEFjY29yZGlvblBhbmVDb21wb25lbnQ+O1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBsZXQgcmVzb2x2ZUZuOiBGdW5jdGlvbiA9IG5vb3A7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRywgbmV3IFByb21pc2UocmVzID0+IHJlc29sdmVGbiA9IHJlcykpO1xuICAgICAgICB0aGlzLnByb21pc2VSZXNvbHZlckZuID0gcmVzb2x2ZUZuO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5TQ1JPTExBQkxFX0NPTlRBSU5FUik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWNjb3JkaW9uUGFuZSBjaGlsZHJlbiBjb21wb25lbnRzIGludm9rZSB0aGlzIG1ldGhvZCB0byBjb21tdW5pY2F0ZSB3aXRoIHRoZSBwYXJlbnRcbiAgICAgKiBpZiBpc0V4cGFuZCBpcyB0cnVlIGFuZCB3aGVuIGNsb3Nlb3RoZXJzIGlzIHRydWUsIGFsbCB0aGUgb3RoZXIgcGFuZXMgYXJlIGNvbGxhcHNlZFxuICAgICAqIGlmIHRoZSBldnQgYXJndW1lbnQgaXMgZGVmaW5lZCBvbi1jaGFuZ2UgY2FsbGJhY2sgd2lsbCBiZSBpbnZva2VkLlxuICAgICAqIHVwZGF0ZXMgdGhlIGFjdGl2ZVBhbmUgaW5kZXggcHJvcGVydHlcbiAgICAgKiBAcGFyYW0ge0FjY29yZGlvblBhbmVDb21wb25lbnR9IHBhbmVSZWZcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzRXhwYW5kXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZ0XG4gICAgICovXG4gICAgcHVibGljIG5vdGlmeUNoYW5nZShwYW5lUmVmOiBBY2NvcmRpb25QYW5lQ29tcG9uZW50LCBpc0V4cGFuZDogYm9vbGVhbiwgZXZ0OiBFdmVudCkge1xuICAgICAgICBpZiAoaXNFeHBhbmQpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VQYW5lc0V4Y2VwdChwYW5lUmVmKTtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5nZXRQYW5lSW5kZXhCeVJlZihwYW5lUmVmKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlUGFuZSA9IHBhbmVSZWYuZ2V0V2lkZ2V0KCk7XG4gICAgICAgICAgICAvLyBpZiB0aGUgZXZlbnQgaXMgZGVmaW5lZCBpbnZva2UgdGhlIGNoYW5nZSBjYWxsYmFjay5cbiAgICAgICAgICAgIC8vIHByb2dyYW1tYXRpYyBpbnZvY2F0aW9ucyBvZiBleHBhbmQvY29sbGFwc2Ugb24gYWNjb3JkaW9uLXBhbmUgd2lsbCBub3QgdHJpZ2dlciBjaGFuZ2UgZXZlbnRcbiAgICAgICAgICAgIGlmIChldnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2NoYW5nZScsIHtcbiAgICAgICAgICAgICAgICAgICAgJGV2ZW50OiBldnQsXG4gICAgICAgICAgICAgICAgICAgIG5ld1BhbmVJbmRleDogaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIG9sZFBhbmVJbmRleDogdGhpcy5hY3RpdmVQYW5lSW5kZXhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYWN0aXZlUGFuZUluZGV4ID0gaW5kZXg7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGlzVmFsaWRQYW5lSW5kZXgoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLnBhbmVzLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRQYW5lSW5kZXhCeVJlZihwYW5lUmVmOiBBY2NvcmRpb25QYW5lQ29tcG9uZW50KTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFuZXMudG9BcnJheSgpLmluZGV4T2YocGFuZVJlZik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRQYW5lUmVmQnlJbmRleChpbmRleDogbnVtYmVyKTogQWNjb3JkaW9uUGFuZUNvbXBvbmVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhbmVzLnRvQXJyYXkoKVtpbmRleF07XG4gICAgfVxuXG4gICAgLy8gRXhjZXB0IHRoZSBwYW5lIHByb3ZpZGVkIGNsb3NlIGFsbCBvdGhlciBwYW5lc1xuICAgIHByaXZhdGUgY2xvc2VQYW5lc0V4Y2VwdChwYW5lUmVmOiBBY2NvcmRpb25QYW5lQ29tcG9uZW50IHwgbnVtYmVyKSB7XG4gICAgICAgIGlmIChpc051bWJlcihwYW5lUmVmKSkge1xuICAgICAgICAgICAgcGFuZVJlZiA9IHRoaXMuZ2V0UGFuZVJlZkJ5SW5kZXgocGFuZVJlZiBhcyBudW1iZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNsb3Nlb3RoZXJzKSB7XG4gICAgICAgICAgICB0aGlzLnBhbmVzLmZvckVhY2gocGFuZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBhbmUgIT09IHBhbmVSZWYpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFuZS5jb2xsYXBzZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBleHBhbmRQYW5lKGluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5jbG9zZVBhbmVzRXhjZXB0KGluZGV4KTtcbiAgICAgICAgdGhpcy5wYW5lcy50b0FycmF5KClbaW5kZXhdLmV4cGFuZCgpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdkZWZhdWx0cGFuZWluZGV4Jykge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNWYWxpZFBhbmVJbmRleChudikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGFuZFBhbmUobnYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuICAgICAgICB0aGlzLnByb21pc2VSZXNvbHZlckZuKCk7XG4gICAgfVxufVxuIl19