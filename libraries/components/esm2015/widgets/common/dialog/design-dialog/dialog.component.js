import { Attribute, Component, ContentChild, Inject, Injector, Self, TemplateRef, ViewChild } from '@angular/core';
import { toBoolean } from '@wm/core';
import { Context } from '../../../framework/types';
import { registerProps } from './dialog.props';
import { BaseDialog } from '../base/base-dialog';
import { provideAsDialogRef, provideAsWidgetRef } from '../../../../utils/widget-utils';
const DIALOG_CLS = 'app-dialog modal-dialog';
const WIDGET_INFO = { widgetType: 'wm-dialog' };
const ɵ0 = {};
export class DialogComponent extends BaseDialog {
    constructor(inj, dialogClass, modal, closable, contexts) {
        if (modal === null || modal === undefined) {
            modal = true;
        }
        if (closable === null || closable === undefined) {
            closable = true;
        }
        // contexts[0] will refer to the self context provided by this component
        contexts[0].closeDialog = () => this.close();
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
    ngOnInit() {
        super.ngOnInit();
        this.register(this.viewParent);
    }
}
DialogComponent.initializeProps = registerProps();
DialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'div[wmDialog]',
                template: "<ng-template #dialogTemplate>\n    <div wmDialogHeader [closable]=\"closable\"\n         [iconclass]=\"iconclass\"\n         [iconurl]=\"iconurl\"\n         [iconwidth]=\"iconwidth\"\n         [iconheight]=\"iconheight\"\n         [iconmargin]=\"iconmargin\"\n         [heading]=\"title\"\n         *ngIf=\"showheader\"\n    ></div>\n    <div wmDialogBody>\n        <ng-container *ngTemplateOutlet=\"dialogBody\"></ng-container>\n    </div>\n    <ng-container *ngTemplateOutlet=\"dialogFooter\"></ng-container>\n</ng-template>",
                providers: [
                    provideAsWidgetRef(DialogComponent),
                    provideAsDialogRef(DialogComponent),
                    { provide: Context, useValue: ɵ0, multi: true }
                ]
            }] }
];
/** @nocollapse */
DialogComponent.ctorParameters = () => [
    { type: Injector },
    { type: String, decorators: [{ type: Attribute, args: ['class',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['modal',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['closable',] }] },
    { type: Array, decorators: [{ type: Self }, { type: Inject, args: [Context,] }] }
];
DialogComponent.propDecorators = {
    dialogTemplate: [{ type: ViewChild, args: ['dialogTemplate', { read: TemplateRef },] }],
    dialogBody: [{ type: ContentChild, args: ['dialogBody', { read: TemplateRef },] }],
    dialogFooter: [{ type: ContentChild, args: ['dialogFooter', { read: TemplateRef },] }]
};
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZGlhbG9nL2Rlc2lnbi1kaWFsb2cvZGlhbG9nLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBVSxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzSCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXJDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRXhGLE1BQU0sVUFBVSxHQUFHLHlCQUF5QixDQUFDO0FBRTdDLE1BQU0sV0FBVyxHQUFHLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFBQyxDQUFDO1dBUVQsRUFBRTtBQUd2QyxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxVQUFVO0lBTzNDLFlBQ0ksR0FBYSxFQUNPLFdBQW1CLEVBQ25CLEtBQXVCLEVBQ3BCLFFBQTBCLEVBQ3hCLFFBQW9CO1FBRTdDLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ3ZDLEtBQUssR0FBRyxJQUFJLENBQUM7U0FDaEI7UUFFRCxJQUFJLFFBQVEsS0FBSyxJQUFJLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtZQUM3QyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQ25CO1FBRUQsd0VBQXdFO1FBQ3hFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRTdDLCtFQUErRTtRQUMvRSxNQUFNLFFBQVEsR0FBdUIsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUV4RSxLQUFLLENBQ0QsR0FBRyxFQUNILFdBQVcsRUFDWDtZQUNJLEtBQUssRUFBRSxHQUFHLFVBQVUsSUFBSSxXQUFXLElBQUksRUFBRSxFQUFFO1lBQzNDLFFBQVE7WUFDUixRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1NBQzlCLENBQ0osQ0FBQztJQUNOLENBQUM7SUFFUyxjQUFjO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUMvQixDQUFDO0lBRUQsUUFBUTtRQUNKLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuQyxDQUFDOztBQTdDTSwrQkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVY1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLGVBQWU7Z0JBQ3pCLDBoQkFBc0M7Z0JBQ3RDLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxlQUFlLENBQUM7b0JBQ25DLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztvQkFDbkMsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7aUJBQ2hEO2FBQ0o7Ozs7WUFyQm9ELFFBQVE7eUNBK0JwRCxTQUFTLFNBQUMsT0FBTzs0Q0FDakIsU0FBUyxTQUFDLE9BQU87NENBQ2pCLFNBQVMsU0FBQyxVQUFVO1lBQ2MsS0FBSyx1QkFBdkMsSUFBSSxZQUFJLE1BQU0sU0FBQyxPQUFPOzs7NkJBVDFCLFNBQVMsU0FBQyxnQkFBZ0IsRUFBRSxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUM7eUJBQy9DLFlBQVksU0FBQyxZQUFZLEVBQUUsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFDOzJCQUM5QyxZQUFZLFNBQUMsY0FBYyxFQUFFLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF0dHJpYnV0ZSwgQ29tcG9uZW50LCBDb250ZW50Q2hpbGQsIEluamVjdCwgSW5qZWN0b3IsIE9uSW5pdCwgU2VsZiwgVGVtcGxhdGVSZWYsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyB0b0Jvb2xlYW4gfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IENvbnRleHQgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vZGlhbG9nLnByb3BzJztcbmltcG9ydCB7IEJhc2VEaWFsb2cgfSBmcm9tICcuLi9iYXNlL2Jhc2UtZGlhbG9nJztcbmltcG9ydCB7IHByb3ZpZGVBc0RpYWxvZ1JlZiwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgRElBTE9HX0NMUyA9ICdhcHAtZGlhbG9nIG1vZGFsLWRpYWxvZyc7XG5cbmNvbnN0IFdJREdFVF9JTkZPID0ge3dpZGdldFR5cGU6ICd3bS1kaWFsb2cnfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21EaWFsb2ddJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vZGlhbG9nLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKERpYWxvZ0NvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc0RpYWxvZ1JlZihEaWFsb2dDb21wb25lbnQpLFxuICAgICAgICB7cHJvdmlkZTogQ29udGV4dCwgdXNlVmFsdWU6IHt9LCBtdWx0aTogdHJ1ZX1cbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIERpYWxvZ0NvbXBvbmVudCBleHRlbmRzIEJhc2VEaWFsb2cgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBAVmlld0NoaWxkKCdkaWFsb2dUZW1wbGF0ZScsIHtyZWFkOiBUZW1wbGF0ZVJlZn0pIGRpYWxvZ1RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICAgIEBDb250ZW50Q2hpbGQoJ2RpYWxvZ0JvZHknLCB7cmVhZDogVGVtcGxhdGVSZWZ9KSBkaWFsb2dCb2R5OiBUZW1wbGF0ZVJlZjxhbnk+O1xuICAgIEBDb250ZW50Q2hpbGQoJ2RpYWxvZ0Zvb3RlcicsIHtyZWFkOiBUZW1wbGF0ZVJlZn0pIGRpYWxvZ0Zvb3RlcjogVGVtcGxhdGVSZWY8YW55PjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBAQXR0cmlidXRlKCdjbGFzcycpIGRpYWxvZ0NsYXNzOiBzdHJpbmcsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ21vZGFsJykgbW9kYWw6IHN0cmluZyB8IGJvb2xlYW4sXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2Nsb3NhYmxlJykgY2xvc2FibGU6IHN0cmluZyB8IGJvb2xlYW4sXG4gICAgICAgIEBTZWxmKCkgQEluamVjdChDb250ZXh0KSBjb250ZXh0czogQXJyYXk8YW55PlxuICAgICkge1xuICAgICAgICBpZiAobW9kYWwgPT09IG51bGwgfHwgbW9kYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbW9kYWwgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNsb3NhYmxlID09PSBudWxsIHx8IGNsb3NhYmxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNsb3NhYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbnRleHRzWzBdIHdpbGwgcmVmZXIgdG8gdGhlIHNlbGYgY29udGV4dCBwcm92aWRlZCBieSB0aGlzIGNvbXBvbmVudFxuICAgICAgICBjb250ZXh0c1swXS5jbG9zZURpYWxvZyA9ICgpID0+IHRoaXMuY2xvc2UoKTtcblxuICAgICAgICAvLyBzZXR0aW5nIHRoZSBiYWNrZHJvcCB0byAnc3RhdGljJyB3aWxsIG5vdCBjbG9zZSB0aGUgZGlhbG9nIG9uIGJhY2tkcm9wIGNsaWNrXG4gICAgICAgIGNvbnN0IGJhY2tkcm9wOiBib29sZWFuIHwgJ3N0YXRpYycgPSB0b0Jvb2xlYW4obW9kYWwpID8gJ3N0YXRpYycgOiB0cnVlO1xuXG4gICAgICAgIHN1cGVyKFxuICAgICAgICAgICAgaW5qLFxuICAgICAgICAgICAgV0lER0VUX0lORk8sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke0RJQUxPR19DTFN9ICR7ZGlhbG9nQ2xhc3MgfHwgJyd9YCxcbiAgICAgICAgICAgICAgICBiYWNrZHJvcCxcbiAgICAgICAgICAgICAgICBrZXlib2FyZDogIXRvQm9vbGVhbihtb2RhbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0VGVtcGxhdGVSZWYoKTogVGVtcGxhdGVSZWY8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpYWxvZ1RlbXBsYXRlO1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBzdXBlci5uZ09uSW5pdCgpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyKHRoaXMudmlld1BhcmVudCk7XG4gICAgfVxufVxuIl19