import { Attribute, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { toBoolean } from '@wm/core';
import { registerProps } from './iframe-dialog.props';
import { BaseDialog } from '../base/base-dialog';
import { provideAsDialogRef, provideAsWidgetRef } from '../../../../utils/widget-utils';
const DIALOG_CLS = 'app-dialog modal-dialog app-iframe-dialog';
const WIDGET_INFO = { widgetType: 'wm-iframedialog' };
export class IframeDialogComponent extends BaseDialog {
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
IframeDialogComponent.initializeProps = registerProps();
IframeDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'div[wmIframeDialog]',
                template: "<ng-template #dialogTemplate>\n    <div wmDialogHeader [closable]=\"closable\"\n         [iconclass]=\"iconclass\"\n         [iconurl]=\"iconurl\"\n         [iconwidth]=\"iconwidth\"\n         [iconheight]=\"iconheight\"\n         [iconmargin]=\"iconmargin\"\n         [heading]=\"title\"\n         *ngIf=\"showheader\"\n    ></div>\n    <div wmDialogBody>\n        <div wmIframe encodeurl.bind=\"encodeurl\" iframesrc.bind=\"url\" height.bind=\"height\" width.bind=\"width\" hint.bind=\"hint\"></div>\n    </div>\n    <div wmDialogFooter *ngIf=\"showactions\">\n        <button wmButton class=\"btn-primary ok-action\" caption.bind=\"oktext\" aria-label=\"Submit button\" (click)=\"onOk($event)\"></button>\n    </div>\n</ng-template>\n",
                providers: [
                    provideAsWidgetRef(IframeDialogComponent),
                    provideAsDialogRef(IframeDialogComponent)
                ]
            }] }
];
/** @nocollapse */
IframeDialogComponent.ctorParameters = () => [
    { type: Injector },
    { type: String, decorators: [{ type: Attribute, args: ['class',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['modal',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['closable',] }] }
];
IframeDialogComponent.propDecorators = {
    dialogTemplate: [{ type: ViewChild, args: ['dialogTemplate',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWZyYW1lLWRpYWxvZy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2RpYWxvZy9pZnJhbWUtZGlhbG9nL2lmcmFtZS1kaWFsb2cuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBVSxXQUFXLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRS9GLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFckMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUV4RixNQUFNLFVBQVUsR0FBRywyQ0FBMkMsQ0FBQztBQUMvRCxNQUFNLFdBQVcsR0FBRyxFQUFDLFVBQVUsRUFBRSxpQkFBaUIsRUFBQyxDQUFDO0FBVXBELE1BQU0sT0FBTyxxQkFBc0IsU0FBUSxVQUFVO0lBS2pELFlBQ0ksR0FBYSxFQUNPLFdBQW1CLEVBQ25CLEtBQXVCLEVBQ3BCLFFBQTBCO1FBRWpELElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ3ZDLEtBQUssR0FBRyxLQUFLLENBQUM7U0FDakI7UUFFRCxJQUFJLFFBQVEsS0FBSyxJQUFJLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtZQUM3QyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQ25CO1FBRUQsK0VBQStFO1FBQy9FLE1BQU0sUUFBUSxHQUF1QixTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRXhFLEtBQUssQ0FDRCxHQUFHLEVBQ0gsV0FBVyxFQUNYO1lBQ0ksS0FBSyxFQUFFLEdBQUcsVUFBVSxJQUFJLFdBQVcsSUFBSSxFQUFFLEVBQUU7WUFDM0MsUUFBUTtZQUNSLFFBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7U0FDOUIsQ0FDSixDQUFDO0lBQ04sQ0FBQztJQUVTLGNBQWM7UUFDcEIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBSSxDQUFDLE1BQWE7UUFDZCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsUUFBUTtRQUNKLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuQyxDQUFDOztBQWhETSxxQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVQ1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLHFCQUFxQjtnQkFDL0IsNnVCQUE2QztnQkFDN0MsU0FBUyxFQUFFO29CQUNQLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDO29CQUN6QyxrQkFBa0IsQ0FBQyxxQkFBcUIsQ0FBQztpQkFDNUM7YUFDSjs7OztZQWxCOEIsUUFBUTt5Q0EwQjlCLFNBQVMsU0FBQyxPQUFPOzRDQUNqQixTQUFTLFNBQUMsT0FBTzs0Q0FDakIsU0FBUyxTQUFDLFVBQVU7Ozs2QkFOeEIsU0FBUyxTQUFDLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF0dHJpYnV0ZSwgQ29tcG9uZW50LCBJbmplY3RvciwgT25Jbml0LCBUZW1wbGF0ZVJlZiwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IHRvQm9vbGVhbiB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vaWZyYW1lLWRpYWxvZy5wcm9wcyc7XG5pbXBvcnQgeyBCYXNlRGlhbG9nIH0gZnJvbSAnLi4vYmFzZS9iYXNlLWRpYWxvZyc7XG5pbXBvcnQgeyBwcm92aWRlQXNEaWFsb2dSZWYsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERJQUxPR19DTFMgPSAnYXBwLWRpYWxvZyBtb2RhbC1kaWFsb2cgYXBwLWlmcmFtZS1kaWFsb2cnO1xuY29uc3QgV0lER0VUX0lORk8gPSB7d2lkZ2V0VHlwZTogJ3dtLWlmcmFtZWRpYWxvZyd9O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bUlmcmFtZURpYWxvZ10nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9pZnJhbWUtZGlhbG9nLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKElmcmFtZURpYWxvZ0NvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc0RpYWxvZ1JlZihJZnJhbWVEaWFsb2dDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBJZnJhbWVEaWFsb2dDb21wb25lbnQgZXh0ZW5kcyBCYXNlRGlhbG9nIGltcGxlbWVudHMgT25Jbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgQFZpZXdDaGlsZCgnZGlhbG9nVGVtcGxhdGUnKSBkaWFsb2dUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBAQXR0cmlidXRlKCdjbGFzcycpIGRpYWxvZ0NsYXNzOiBzdHJpbmcsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ21vZGFsJykgbW9kYWw6IHN0cmluZyB8IGJvb2xlYW4sXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2Nsb3NhYmxlJykgY2xvc2FibGU6IHN0cmluZyB8IGJvb2xlYW4sXG4gICAgKSB7XG4gICAgICAgIGlmIChtb2RhbCA9PT0gbnVsbCB8fCBtb2RhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBtb2RhbCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNsb3NhYmxlID09PSBudWxsIHx8IGNsb3NhYmxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNsb3NhYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldHRpbmcgdGhlIGJhY2tkcm9wIHRvICdzdGF0aWMnIHdpbGwgbm90IGNsb3NlIHRoZSBkaWFsb2cgb24gYmFja2Ryb3AgY2xpY2tcbiAgICAgICAgY29uc3QgYmFja2Ryb3A6IGJvb2xlYW4gfCAnc3RhdGljJyA9IHRvQm9vbGVhbihtb2RhbCkgPyAnc3RhdGljJyA6IHRydWU7XG5cbiAgICAgICAgc3VwZXIoXG4gICAgICAgICAgICBpbmosXG4gICAgICAgICAgICBXSURHRVRfSU5GTyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogYCR7RElBTE9HX0NMU30gJHtkaWFsb2dDbGFzcyB8fCAnJ31gLFxuICAgICAgICAgICAgICAgIGJhY2tkcm9wLFxuICAgICAgICAgICAgICAgIGtleWJvYXJkOiAhdG9Cb29sZWFuKG1vZGFsKVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRUZW1wbGF0ZVJlZigpOiBUZW1wbGF0ZVJlZjxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlhbG9nVGVtcGxhdGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xpY2sgZXZlbnQgaGFuZGxlciBmb3IgdGhlIG9rIGJ1dHRvblxuICAgICAqIGludm9rZXMgb24tb2sgZXZlbnQgY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSAkZXZlbnRcbiAgICAgKi9cbiAgICBvbk9rKCRldmVudDogRXZlbnQpIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdvaycsIHskZXZlbnR9KTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy5yZWdpc3Rlcih0aGlzLnZpZXdQYXJlbnQpO1xuICAgIH1cbn1cbiJdfQ==