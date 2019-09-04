import * as tslib_1 from "tslib";
import { Attribute, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { toBoolean } from '@wm/core';
import { registerProps } from './alert-dialog.props';
import { BaseDialog } from '../base/base-dialog';
import { provideAsDialogRef, provideAsWidgetRef } from '../../../../utils/widget-utils';
var DIALOG_CLS = 'app-dialog modal-dialog app-alert-dialog';
var WIDGET_INFO = { widgetType: 'wm-alertdialog' };
var AlertDialogComponent = /** @class */ (function (_super) {
    tslib_1.__extends(AlertDialogComponent, _super);
    function AlertDialogComponent(inj, dialogClass, modal, closable) {
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
    AlertDialogComponent.prototype.getTemplateRef = function () {
        return this.dialogTemplate;
    };
    /**
     * Click event handler for the ok button
     * invokes on-ok event callback
     * @param {Event} $event
     */
    AlertDialogComponent.prototype.onOk = function ($event) {
        this.invokeEventCallback('ok', { $event: $event });
    };
    AlertDialogComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.register(this.viewParent);
    };
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
    AlertDialogComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: String, decorators: [{ type: Attribute, args: ['class',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['modal',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['closable',] }] }
    ]; };
    AlertDialogComponent.propDecorators = {
        dialogTemplate: [{ type: ViewChild, args: ['dialogTemplate',] }]
    };
    return AlertDialogComponent;
}(BaseDialog));
export { AlertDialogComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxlcnQtZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZGlhbG9nL2FsZXJ0LWRpYWxvZy9hbGVydC1kaWFsb2cuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQVUsV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUvRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXJDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFHeEYsSUFBTSxVQUFVLEdBQUcsMENBQTBDLENBQUM7QUFFOUQsSUFBTSxXQUFXLEdBQWtCLEVBQUMsVUFBVSxFQUFFLGdCQUFnQixFQUFDLENBQUM7QUFFbEU7SUFRMEMsZ0RBQVU7SUFLaEQsOEJBQ0ksR0FBYSxFQUNPLFdBQW1CLEVBQ25CLEtBQXVCLEVBQ3BCLFFBQTBCO1FBSnJELGlCQTBCQztRQXBCRyxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUN2QyxLQUFLLEdBQUcsS0FBSyxDQUFDO1NBQ2pCO1FBRUQsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDN0MsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjtRQUVELCtFQUErRTtRQUMvRSxJQUFNLFFBQVEsR0FBdUIsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUV4RSxRQUFBLGtCQUNJLEdBQUcsRUFDSCxXQUFXLEVBQ1g7WUFDSSxLQUFLLEVBQUssVUFBVSxVQUFJLFdBQVcsSUFBSSxFQUFFLENBQUU7WUFDM0MsUUFBUSxVQUFBO1lBQ1IsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztTQUM5QixDQUNKLFNBQUM7O0lBQ04sQ0FBQztJQUVTLDZDQUFjLEdBQXhCO1FBQ0ksT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsbUNBQUksR0FBSixVQUFLLE1BQWE7UUFDZCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEVBQUMsTUFBTSxRQUFBLEVBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCx1Q0FBUSxHQUFSO1FBQ0ksaUJBQU0sUUFBUSxXQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQWhETSxvQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFUNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxvQkFBb0I7b0JBQzlCLGdxQkFBNEM7b0JBQzVDLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQzt3QkFDeEMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUM7cUJBQzNDO2lCQUNKOzs7O2dCQXBCOEIsUUFBUTs2Q0E0QjlCLFNBQVMsU0FBQyxPQUFPO2dEQUNqQixTQUFTLFNBQUMsT0FBTztnREFDakIsU0FBUyxTQUFDLFVBQVU7OztpQ0FOeEIsU0FBUyxTQUFDLGdCQUFnQjs7SUErQy9CLDJCQUFDO0NBQUEsQUExREQsQ0FRMEMsVUFBVSxHQWtEbkQ7U0FsRFksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXR0cmlidXRlLCBDb21wb25lbnQsIEluamVjdG9yLCBPbkluaXQsIFRlbXBsYXRlUmVmLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgdG9Cb29sZWFuIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9hbGVydC1kaWFsb2cucHJvcHMnO1xuaW1wb3J0IHsgQmFzZURpYWxvZyB9IGZyb20gJy4uL2Jhc2UvYmFzZS1kaWFsb2cnO1xuaW1wb3J0IHsgcHJvdmlkZUFzRGlhbG9nUmVmLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5cbmNvbnN0IERJQUxPR19DTFMgPSAnYXBwLWRpYWxvZyBtb2RhbC1kaWFsb2cgYXBwLWFsZXJ0LWRpYWxvZyc7XG5cbmNvbnN0IFdJREdFVF9JTkZPOiBJV2lkZ2V0Q29uZmlnID0ge3dpZGdldFR5cGU6ICd3bS1hbGVydGRpYWxvZyd9O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bUFsZXJ0RGlhbG9nXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2FsZXJ0LWRpYWxvZy5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihBbGVydERpYWxvZ0NvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc0RpYWxvZ1JlZihBbGVydERpYWxvZ0NvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIEFsZXJ0RGlhbG9nQ29tcG9uZW50IGV4dGVuZHMgQmFzZURpYWxvZyBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIEBWaWV3Q2hpbGQoJ2RpYWxvZ1RlbXBsYXRlJykgZGlhbG9nVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgQEF0dHJpYnV0ZSgnY2xhc3MnKSBkaWFsb2dDbGFzczogc3RyaW5nLFxuICAgICAgICBAQXR0cmlidXRlKCdtb2RhbCcpIG1vZGFsOiBzdHJpbmcgfCBib29sZWFuLFxuICAgICAgICBAQXR0cmlidXRlKCdjbG9zYWJsZScpIGNsb3NhYmxlOiBzdHJpbmcgfCBib29sZWFuLFxuICAgICkge1xuICAgICAgICBpZiAobW9kYWwgPT09IG51bGwgfHwgbW9kYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbW9kYWwgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjbG9zYWJsZSA9PT0gbnVsbCB8fCBjbG9zYWJsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjbG9zYWJsZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXR0aW5nIHRoZSBiYWNrZHJvcCB0byAnc3RhdGljJyB3aWxsIG5vdCBjbG9zZSB0aGUgZGlhbG9nIG9uIGJhY2tkcm9wIGNsaWNrXG4gICAgICAgIGNvbnN0IGJhY2tkcm9wOiBib29sZWFuIHwgJ3N0YXRpYycgPSB0b0Jvb2xlYW4obW9kYWwpID8gJ3N0YXRpYycgOiB0cnVlO1xuXG4gICAgICAgIHN1cGVyKFxuICAgICAgICAgICAgaW5qLFxuICAgICAgICAgICAgV0lER0VUX0lORk8sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke0RJQUxPR19DTFN9ICR7ZGlhbG9nQ2xhc3MgfHwgJyd9YCxcbiAgICAgICAgICAgICAgICBiYWNrZHJvcCxcbiAgICAgICAgICAgICAgICBrZXlib2FyZDogIXRvQm9vbGVhbihtb2RhbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0VGVtcGxhdGVSZWYoKTogVGVtcGxhdGVSZWY8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpYWxvZ1RlbXBsYXRlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsaWNrIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBvayBidXR0b25cbiAgICAgKiBpbnZva2VzIG9uLW9rIGV2ZW50IGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtFdmVudH0gJGV2ZW50XG4gICAgICovXG4gICAgb25PaygkZXZlbnQ6IEV2ZW50KSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnb2snLCB7JGV2ZW50fSk7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXIodGhpcy52aWV3UGFyZW50KTtcbiAgICB9XG59XG4iXX0=