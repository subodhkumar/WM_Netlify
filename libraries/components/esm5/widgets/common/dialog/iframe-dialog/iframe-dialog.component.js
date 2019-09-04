import * as tslib_1 from "tslib";
import { Attribute, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { toBoolean } from '@wm/core';
import { registerProps } from './iframe-dialog.props';
import { BaseDialog } from '../base/base-dialog';
import { provideAsDialogRef, provideAsWidgetRef } from '../../../../utils/widget-utils';
var DIALOG_CLS = 'app-dialog modal-dialog app-iframe-dialog';
var WIDGET_INFO = { widgetType: 'wm-iframedialog' };
var IframeDialogComponent = /** @class */ (function (_super) {
    tslib_1.__extends(IframeDialogComponent, _super);
    function IframeDialogComponent(inj, dialogClass, modal, closable) {
        var _this = this;
        if (modal === null || modal === undefined) {
            modal = false;
        }
        if (closable === null || closable === undefined) {
            closable = true;
        }
        // setting the backdrop to 'static' will not close the dialog on backdrop click
        var backdrop = toBoolean(modal) ? 'static' : true;
        _this = _super.call(this, inj, WIDGET_INFO, {
            class: DIALOG_CLS + " " + (dialogClass || ''),
            backdrop: backdrop,
            keyboard: !toBoolean(modal)
        }) || this;
        return _this;
    }
    IframeDialogComponent.prototype.getTemplateRef = function () {
        return this.dialogTemplate;
    };
    /**
     * Click event handler for the ok button
     * invokes on-ok event callback
     * @param {Event} $event
     */
    IframeDialogComponent.prototype.onOk = function ($event) {
        this.invokeEventCallback('ok', { $event: $event });
    };
    IframeDialogComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.register(this.viewParent);
    };
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
    IframeDialogComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: String, decorators: [{ type: Attribute, args: ['class',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['modal',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['closable',] }] }
    ]; };
    IframeDialogComponent.propDecorators = {
        dialogTemplate: [{ type: ViewChild, args: ['dialogTemplate',] }]
    };
    return IframeDialogComponent;
}(BaseDialog));
export { IframeDialogComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWZyYW1lLWRpYWxvZy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2RpYWxvZy9pZnJhbWUtZGlhbG9nL2lmcmFtZS1kaWFsb2cuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQVUsV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUvRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXJDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFeEYsSUFBTSxVQUFVLEdBQUcsMkNBQTJDLENBQUM7QUFDL0QsSUFBTSxXQUFXLEdBQUcsRUFBQyxVQUFVLEVBQUUsaUJBQWlCLEVBQUMsQ0FBQztBQUVwRDtJQVEyQyxpREFBVTtJQUtqRCwrQkFDSSxHQUFhLEVBQ08sV0FBbUIsRUFDbkIsS0FBdUIsRUFDcEIsUUFBMEI7UUFKckQsaUJBMEJDO1FBcEJHLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ3ZDLEtBQUssR0FBRyxLQUFLLENBQUM7U0FDakI7UUFFRCxJQUFJLFFBQVEsS0FBSyxJQUFJLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtZQUM3QyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQ25CO1FBRUQsK0VBQStFO1FBQy9FLElBQU0sUUFBUSxHQUF1QixTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRXhFLFFBQUEsa0JBQ0ksR0FBRyxFQUNILFdBQVcsRUFDWDtZQUNJLEtBQUssRUFBSyxVQUFVLFVBQUksV0FBVyxJQUFJLEVBQUUsQ0FBRTtZQUMzQyxRQUFRLFVBQUE7WUFDUixRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1NBQzlCLENBQ0osU0FBQzs7SUFDTixDQUFDO0lBRVMsOENBQWMsR0FBeEI7UUFDSSxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxvQ0FBSSxHQUFKLFVBQUssTUFBYTtRQUNkLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsRUFBQyxNQUFNLFFBQUEsRUFBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELHdDQUFRLEdBQVI7UUFDSSxpQkFBTSxRQUFRLFdBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBaERNLHFDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVQ1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLHFCQUFxQjtvQkFDL0IsNnVCQUE2QztvQkFDN0MsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDO3dCQUN6QyxrQkFBa0IsQ0FBQyxxQkFBcUIsQ0FBQztxQkFDNUM7aUJBQ0o7Ozs7Z0JBbEI4QixRQUFROzZDQTBCOUIsU0FBUyxTQUFDLE9BQU87Z0RBQ2pCLFNBQVMsU0FBQyxPQUFPO2dEQUNqQixTQUFTLFNBQUMsVUFBVTs7O2lDQU54QixTQUFTLFNBQUMsZ0JBQWdCOztJQStDL0IsNEJBQUM7Q0FBQSxBQTFERCxDQVEyQyxVQUFVLEdBa0RwRDtTQWxEWSxxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIENvbXBvbmVudCwgSW5qZWN0b3IsIE9uSW5pdCwgVGVtcGxhdGVSZWYsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyB0b0Jvb2xlYW4gfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2lmcmFtZS1kaWFsb2cucHJvcHMnO1xuaW1wb3J0IHsgQmFzZURpYWxvZyB9IGZyb20gJy4uL2Jhc2UvYmFzZS1kaWFsb2cnO1xuaW1wb3J0IHsgcHJvdmlkZUFzRGlhbG9nUmVmLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBESUFMT0dfQ0xTID0gJ2FwcC1kaWFsb2cgbW9kYWwtZGlhbG9nIGFwcC1pZnJhbWUtZGlhbG9nJztcbmNvbnN0IFdJREdFVF9JTkZPID0ge3dpZGdldFR5cGU6ICd3bS1pZnJhbWVkaWFsb2cnfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21JZnJhbWVEaWFsb2ddJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaWZyYW1lLWRpYWxvZy5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihJZnJhbWVEaWFsb2dDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNEaWFsb2dSZWYoSWZyYW1lRGlhbG9nQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgSWZyYW1lRGlhbG9nQ29tcG9uZW50IGV4dGVuZHMgQmFzZURpYWxvZyBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIEBWaWV3Q2hpbGQoJ2RpYWxvZ1RlbXBsYXRlJykgZGlhbG9nVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgQEF0dHJpYnV0ZSgnY2xhc3MnKSBkaWFsb2dDbGFzczogc3RyaW5nLFxuICAgICAgICBAQXR0cmlidXRlKCdtb2RhbCcpIG1vZGFsOiBzdHJpbmcgfCBib29sZWFuLFxuICAgICAgICBAQXR0cmlidXRlKCdjbG9zYWJsZScpIGNsb3NhYmxlOiBzdHJpbmcgfCBib29sZWFuLFxuICAgICkge1xuICAgICAgICBpZiAobW9kYWwgPT09IG51bGwgfHwgbW9kYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbW9kYWwgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjbG9zYWJsZSA9PT0gbnVsbCB8fCBjbG9zYWJsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjbG9zYWJsZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXR0aW5nIHRoZSBiYWNrZHJvcCB0byAnc3RhdGljJyB3aWxsIG5vdCBjbG9zZSB0aGUgZGlhbG9nIG9uIGJhY2tkcm9wIGNsaWNrXG4gICAgICAgIGNvbnN0IGJhY2tkcm9wOiBib29sZWFuIHwgJ3N0YXRpYycgPSB0b0Jvb2xlYW4obW9kYWwpID8gJ3N0YXRpYycgOiB0cnVlO1xuXG4gICAgICAgIHN1cGVyKFxuICAgICAgICAgICAgaW5qLFxuICAgICAgICAgICAgV0lER0VUX0lORk8sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke0RJQUxPR19DTFN9ICR7ZGlhbG9nQ2xhc3MgfHwgJyd9YCxcbiAgICAgICAgICAgICAgICBiYWNrZHJvcCxcbiAgICAgICAgICAgICAgICBrZXlib2FyZDogIXRvQm9vbGVhbihtb2RhbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0VGVtcGxhdGVSZWYoKTogVGVtcGxhdGVSZWY8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpYWxvZ1RlbXBsYXRlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsaWNrIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBvayBidXR0b25cbiAgICAgKiBpbnZva2VzIG9uLW9rIGV2ZW50IGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtFdmVudH0gJGV2ZW50XG4gICAgICovXG4gICAgb25PaygkZXZlbnQ6IEV2ZW50KSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnb2snLCB7JGV2ZW50fSk7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXIodGhpcy52aWV3UGFyZW50KTtcbiAgICB9XG59XG4iXX0=