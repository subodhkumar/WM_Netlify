import { Attribute, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { toBoolean } from '@wm/core';
import { registerProps } from './alert-dialog.props';
import { BaseDialog } from '../base/base-dialog';
import { provideAsDialogRef, provideAsWidgetRef } from '../../../../utils/widget-utils';
const DIALOG_CLS = 'app-dialog modal-dialog app-alert-dialog';
const WIDGET_INFO = { widgetType: 'wm-alertdialog' };
export class AlertDialogComponent extends BaseDialog {
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
AlertDialogComponent.initializeProps = registerProps();
AlertDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'div[wmAlertDialog]',
                template: "<ng-template #dialogTemplate>\n    <div wmDialogHeader [closable]=\"closable\"\n         [iconclass]=\"iconclass\"\n         [iconurl]=\"iconurl\"\n         [iconwidth]=\"iconwidth\"\n         [iconheight]=\"iconheight\"\n         [iconmargin]=\"iconmargin\"\n         [heading]=\"title\"></div>\n    <div wmDialogBody>\n        <p class=\"app-dialog-message text-{{alerttype}}\" [attr.aria-describedby]=\"message\" [textContent]=\"message\"></p>\n    </div>\n    <div wmDialogFooter>\n        <button wmButton class=\"btn-primary ok-action\" caption.bind=\"oktext\" aria-label=\"Submit button\" (click)=\"onOk($event)\"></button>\n    </div>\n</ng-template>\n",
                providers: [
                    provideAsWidgetRef(AlertDialogComponent),
                    provideAsDialogRef(AlertDialogComponent)
                ]
            }] }
];
/** @nocollapse */
AlertDialogComponent.ctorParameters = () => [
    { type: Injector },
    { type: String, decorators: [{ type: Attribute, args: ['class',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['modal',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['closable',] }] }
];
AlertDialogComponent.propDecorators = {
    dialogTemplate: [{ type: ViewChild, args: ['dialogTemplate',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxlcnQtZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZGlhbG9nL2FsZXJ0LWRpYWxvZy9hbGVydC1kaWFsb2cuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBVSxXQUFXLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRS9GLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFckMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUd4RixNQUFNLFVBQVUsR0FBRywwQ0FBMEMsQ0FBQztBQUU5RCxNQUFNLFdBQVcsR0FBa0IsRUFBQyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQztBQVVsRSxNQUFNLE9BQU8sb0JBQXFCLFNBQVEsVUFBVTtJQUtoRCxZQUNJLEdBQWEsRUFDTyxXQUFtQixFQUNuQixLQUF1QixFQUNwQixRQUEwQjtRQUVqRCxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUN2QyxLQUFLLEdBQUcsS0FBSyxDQUFDO1NBQ2pCO1FBRUQsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDN0MsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjtRQUVELCtFQUErRTtRQUMvRSxNQUFNLFFBQVEsR0FBdUIsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUV4RSxLQUFLLENBQ0QsR0FBRyxFQUNILFdBQVcsRUFDWDtZQUNJLEtBQUssRUFBRSxHQUFHLFVBQVUsSUFBSSxXQUFXLElBQUksRUFBRSxFQUFFO1lBQzNDLFFBQVE7WUFDUixRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1NBQzlCLENBQ0osQ0FBQztJQUNOLENBQUM7SUFFUyxjQUFjO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQUksQ0FBQyxNQUFhO1FBQ2QsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELFFBQVE7UUFDSixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkMsQ0FBQzs7QUFoRE0sb0NBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFUNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxvQkFBb0I7Z0JBQzlCLGdxQkFBNEM7Z0JBQzVDLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQztvQkFDeEMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUM7aUJBQzNDO2FBQ0o7Ozs7WUFwQjhCLFFBQVE7eUNBNEI5QixTQUFTLFNBQUMsT0FBTzs0Q0FDakIsU0FBUyxTQUFDLE9BQU87NENBQ2pCLFNBQVMsU0FBQyxVQUFVOzs7NkJBTnhCLFNBQVMsU0FBQyxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIENvbXBvbmVudCwgSW5qZWN0b3IsIE9uSW5pdCwgVGVtcGxhdGVSZWYsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyB0b0Jvb2xlYW4gfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2FsZXJ0LWRpYWxvZy5wcm9wcyc7XG5pbXBvcnQgeyBCYXNlRGlhbG9nIH0gZnJvbSAnLi4vYmFzZS9iYXNlLWRpYWxvZyc7XG5pbXBvcnQgeyBwcm92aWRlQXNEaWFsb2dSZWYsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcblxuY29uc3QgRElBTE9HX0NMUyA9ICdhcHAtZGlhbG9nIG1vZGFsLWRpYWxvZyBhcHAtYWxlcnQtZGlhbG9nJztcblxuY29uc3QgV0lER0VUX0lORk86IElXaWRnZXRDb25maWcgPSB7d2lkZ2V0VHlwZTogJ3dtLWFsZXJ0ZGlhbG9nJ307XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZGl2W3dtQWxlcnREaWFsb2ddJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vYWxlcnQtZGlhbG9nLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKEFsZXJ0RGlhbG9nQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzRGlhbG9nUmVmKEFsZXJ0RGlhbG9nQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgQWxlcnREaWFsb2dDb21wb25lbnQgZXh0ZW5kcyBCYXNlRGlhbG9nIGltcGxlbWVudHMgT25Jbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgQFZpZXdDaGlsZCgnZGlhbG9nVGVtcGxhdGUnKSBkaWFsb2dUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBAQXR0cmlidXRlKCdjbGFzcycpIGRpYWxvZ0NsYXNzOiBzdHJpbmcsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ21vZGFsJykgbW9kYWw6IHN0cmluZyB8IGJvb2xlYW4sXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2Nsb3NhYmxlJykgY2xvc2FibGU6IHN0cmluZyB8IGJvb2xlYW4sXG4gICAgKSB7XG4gICAgICAgIGlmIChtb2RhbCA9PT0gbnVsbCB8fCBtb2RhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBtb2RhbCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNsb3NhYmxlID09PSBudWxsIHx8IGNsb3NhYmxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNsb3NhYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldHRpbmcgdGhlIGJhY2tkcm9wIHRvICdzdGF0aWMnIHdpbGwgbm90IGNsb3NlIHRoZSBkaWFsb2cgb24gYmFja2Ryb3AgY2xpY2tcbiAgICAgICAgY29uc3QgYmFja2Ryb3A6IGJvb2xlYW4gfCAnc3RhdGljJyA9IHRvQm9vbGVhbihtb2RhbCkgPyAnc3RhdGljJyA6IHRydWU7XG5cbiAgICAgICAgc3VwZXIoXG4gICAgICAgICAgICBpbmosXG4gICAgICAgICAgICBXSURHRVRfSU5GTyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogYCR7RElBTE9HX0NMU30gJHtkaWFsb2dDbGFzcyB8fCAnJ31gLFxuICAgICAgICAgICAgICAgIGJhY2tkcm9wLFxuICAgICAgICAgICAgICAgIGtleWJvYXJkOiAhdG9Cb29sZWFuKG1vZGFsKVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRUZW1wbGF0ZVJlZigpOiBUZW1wbGF0ZVJlZjxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlhbG9nVGVtcGxhdGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xpY2sgZXZlbnQgaGFuZGxlciBmb3IgdGhlIG9rIGJ1dHRvblxuICAgICAqIGludm9rZXMgb24tb2sgZXZlbnQgY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSAkZXZlbnRcbiAgICAgKi9cbiAgICBvbk9rKCRldmVudDogRXZlbnQpIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdvaycsIHskZXZlbnR9KTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy5yZWdpc3Rlcih0aGlzLnZpZXdQYXJlbnQpO1xuICAgIH1cbn1cbiJdfQ==