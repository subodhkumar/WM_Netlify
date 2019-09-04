import { Attribute, Component, ContentChild, Injector, TemplateRef, ViewChild } from '@angular/core';
import { toBoolean } from '@wm/core';
import { registerProps } from './partial-dialog.props';
import { BaseDialog } from '../base/base-dialog';
import { provideAsDialogRef, provideAsWidgetRef } from '../../../../utils/widget-utils';
const DIALOG_CLS = 'app-dialog modal-dialog app-page-dialog';
const WIDGET_INFO = { widgetType: 'wm-partialdialog' };
export class PartialDialogComponent extends BaseDialog {
    constructor(inj, dialogClass, modal, closable) {
        if (modal === null || modal === undefined) {
            modal = false;
        }
        if (closable === null || closable === undefined) {
            closable = true;
        }
        // setting the backdrop to 'static' will not close the dialog on backdrop click
        const backdrop = toBoolean(modal) ? 'static' : true;
        super(inj, WIDGET_INFO, {
            class: `${DIALOG_CLS} ${dialogClass || ''}`,
            backdrop,
            keyboard: !toBoolean(modal)
        });
    }
    getTemplateRef() {
        return this.dialogTemplate;
    }
    /**
     * Click event handler for the ok button
     * invokes on-ok event callback
     * @param {Event} $event
     */
    onOk($event) {
        this.invokeEventCallback('ok', { $event });
    }
    ngOnInit() {
        super.ngOnInit();
        this.register(this.viewParent);
    }
}
PartialDialogComponent.initializeProps = registerProps();
PartialDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'div[wmPartialDialog]',
                template: "<ng-template #dialogTemplate>\n    <div wmDialogHeader [closable]=\"closable\"\n         [iconclass]=\"iconclass\"\n         [iconurl]=\"iconurl\"\n         [iconwidth]=\"iconwidth\"\n         [iconheight]=\"iconheight\"\n         [iconmargin]=\"iconmargin\"\n         [heading]=\"title\"\n    ></div>\n    <div wmDialogBody>\n        <ng-container *ngTemplateOutlet=\"dialogContent\"></ng-container>\n    </div>\n    <div wmDialogFooter *ngIf=\"showactions\">\n        <button wmButton class=\"btn-primary ok-action\" caption.bind=\"oktext\" aria-label=\"Submit button\" (click)=\"onOk($event)\"></button>\n    </div>\n</ng-template>\n",
                providers: [
                    provideAsWidgetRef(PartialDialogComponent),
                    provideAsDialogRef(PartialDialogComponent)
                ]
            }] }
];
/** @nocollapse */
PartialDialogComponent.ctorParameters = () => [
    { type: Injector },
    { type: String, decorators: [{ type: Attribute, args: ['class',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['modal',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['closable',] }] }
];
PartialDialogComponent.propDecorators = {
    dialogTemplate: [{ type: ViewChild, args: ['dialogTemplate',] }],
    dialogContent: [{ type: ContentChild, args: [TemplateRef,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbC1kaWFsb2cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9kaWFsb2cvcGFydGlhbC1kaWFsb2cvcGFydGlhbC1kaWFsb2cuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQVUsV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU3RyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXJDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFeEYsTUFBTSxVQUFVLEdBQUcseUNBQXlDLENBQUM7QUFDN0QsTUFBTSxXQUFXLEdBQUcsRUFBQyxVQUFVLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQztBQVVyRCxNQUFNLE9BQU8sc0JBQXVCLFNBQVEsVUFBVTtJQUtsRCxZQUNJLEdBQWEsRUFDTyxXQUFtQixFQUNuQixLQUF1QixFQUNwQixRQUEwQjtRQUVqRCxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUN2QyxLQUFLLEdBQUcsS0FBSyxDQUFDO1NBQ2pCO1FBRUQsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDN0MsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjtRQUVELCtFQUErRTtRQUMvRSxNQUFNLFFBQVEsR0FBdUIsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUV4RSxLQUFLLENBQ0QsR0FBRyxFQUNILFdBQVcsRUFDWDtZQUNJLEtBQUssRUFBRSxHQUFHLFVBQVUsSUFBSSxXQUFXLElBQUksRUFBRSxFQUFFO1lBQzNDLFFBQVE7WUFDUixRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1NBQzlCLENBQ0osQ0FBQztJQUNOLENBQUM7SUFFUyxjQUFjO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQUksQ0FBQyxNQUFhO1FBQ2QsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELFFBQVE7UUFDSixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkMsQ0FBQzs7QUFoRE0sc0NBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFUNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxzQkFBc0I7Z0JBQ2hDLHdvQkFBOEM7Z0JBQzlDLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxzQkFBc0IsQ0FBQztvQkFDMUMsa0JBQWtCLENBQUMsc0JBQXNCLENBQUM7aUJBQzdDO2FBQ0o7Ozs7WUFsQjRDLFFBQVE7eUNBMEI1QyxTQUFTLFNBQUMsT0FBTzs0Q0FDakIsU0FBUyxTQUFDLE9BQU87NENBQ2pCLFNBQVMsU0FBQyxVQUFVOzs7NkJBUHhCLFNBQVMsU0FBQyxnQkFBZ0I7NEJBQzFCLFlBQVksU0FBQyxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXR0cmlidXRlLCBDb21wb25lbnQsIENvbnRlbnRDaGlsZCwgSW5qZWN0b3IsIE9uSW5pdCwgVGVtcGxhdGVSZWYsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyB0b0Jvb2xlYW4gfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3BhcnRpYWwtZGlhbG9nLnByb3BzJztcbmltcG9ydCB7IEJhc2VEaWFsb2cgfSBmcm9tICcuLi9iYXNlL2Jhc2UtZGlhbG9nJztcbmltcG9ydCB7IHByb3ZpZGVBc0RpYWxvZ1JlZiwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgRElBTE9HX0NMUyA9ICdhcHAtZGlhbG9nIG1vZGFsLWRpYWxvZyBhcHAtcGFnZS1kaWFsb2cnO1xuY29uc3QgV0lER0VUX0lORk8gPSB7d2lkZ2V0VHlwZTogJ3dtLXBhcnRpYWxkaWFsb2cnfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21QYXJ0aWFsRGlhbG9nXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3BhcnRpYWwtZGlhbG9nLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFBhcnRpYWxEaWFsb2dDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNEaWFsb2dSZWYoUGFydGlhbERpYWxvZ0NvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFBhcnRpYWxEaWFsb2dDb21wb25lbnQgZXh0ZW5kcyBCYXNlRGlhbG9nIGltcGxlbWVudHMgT25Jbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuICAgIEBWaWV3Q2hpbGQoJ2RpYWxvZ1RlbXBsYXRlJykgZGlhbG9nVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG4gICAgQENvbnRlbnRDaGlsZChUZW1wbGF0ZVJlZikgZGlhbG9nQ29udGVudDogVGVtcGxhdGVSZWY8YW55PjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBAQXR0cmlidXRlKCdjbGFzcycpIGRpYWxvZ0NsYXNzOiBzdHJpbmcsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ21vZGFsJykgbW9kYWw6IHN0cmluZyB8IGJvb2xlYW4sXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2Nsb3NhYmxlJykgY2xvc2FibGU6IHN0cmluZyB8IGJvb2xlYW5cbiAgICApIHtcbiAgICAgICAgaWYgKG1vZGFsID09PSBudWxsIHx8IG1vZGFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG1vZGFsID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2xvc2FibGUgPT09IG51bGwgfHwgY2xvc2FibGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2xvc2FibGUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2V0dGluZyB0aGUgYmFja2Ryb3AgdG8gJ3N0YXRpYycgd2lsbCBub3QgY2xvc2UgdGhlIGRpYWxvZyBvbiBiYWNrZHJvcCBjbGlja1xuICAgICAgICBjb25zdCBiYWNrZHJvcDogYm9vbGVhbiB8ICdzdGF0aWMnID0gdG9Cb29sZWFuKG1vZGFsKSA/ICdzdGF0aWMnIDogdHJ1ZTtcblxuICAgICAgICBzdXBlcihcbiAgICAgICAgICAgIGluaixcbiAgICAgICAgICAgIFdJREdFVF9JTkZPLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNsYXNzOiBgJHtESUFMT0dfQ0xTfSAke2RpYWxvZ0NsYXNzIHx8ICcnfWAsXG4gICAgICAgICAgICAgICAgYmFja2Ryb3AsXG4gICAgICAgICAgICAgICAga2V5Ym9hcmQ6ICF0b0Jvb2xlYW4obW9kYWwpXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFRlbXBsYXRlUmVmKCk6IFRlbXBsYXRlUmVmPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kaWFsb2dUZW1wbGF0ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGljayBldmVudCBoYW5kbGVyIGZvciB0aGUgb2sgYnV0dG9uXG4gICAgICogaW52b2tlcyBvbi1vayBldmVudCBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7RXZlbnR9ICRldmVudFxuICAgICAqL1xuICAgIG9uT2soJGV2ZW50OiBFdmVudCkge1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ29rJywgeyRldmVudH0pO1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBzdXBlci5uZ09uSW5pdCgpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyKHRoaXMudmlld1BhcmVudCk7XG4gICAgfVxufVxuIl19