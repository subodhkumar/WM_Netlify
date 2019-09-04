import * as tslib_1 from "tslib";
import { Attribute, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { toBoolean } from '@wm/core';
import { registerProps } from './confirm-dialog.props';
import { BaseDialog } from '../base/base-dialog';
import { provideAsDialogRef, provideAsWidgetRef } from '../../../../utils/widget-utils';
var DIALOG_CLS = 'app-dialog modal-dialog app-confirm-dialog';
var WIDGET_INFO = { widgetType: 'wm-confirmdialog' };
var ConfirmDialogComponent = /** @class */ (function (_super) {
    tslib_1.__extends(ConfirmDialogComponent, _super);
    function ConfirmDialogComponent(inj, dialogClass, modal, closable) {
        var _this = this;
        if (modal === null || modal === undefined) {
            modal = false;
        }
        if (closable === null || closable === undefined) {
            closable = true;
        }
        // setting the backdrop to 'static' will not close the dialog on backdrop click
        var backdrop = 'static';
        _this = _super.call(this, inj, WIDGET_INFO, {
            class: DIALOG_CLS + " " + (dialogClass || ''),
            backdrop: backdrop,
            keyboard: !toBoolean(modal)
        }) || this;
        return _this;
    }
    ConfirmDialogComponent.prototype.getTemplateRef = function () {
        return this.dialogTemplate;
    };
    /**
     * Click event handler for the ok button
     * invokes on-ok event callback
     * @param {Event} $event
     */
    ConfirmDialogComponent.prototype.onOk = function ($event) {
        this.invokeEventCallback('ok', { $event: $event });
    };
    /**
     * Click event handler for the cancel button
     * invokes on-cancel event callback
     * @param {Event} $event
     */
    ConfirmDialogComponent.prototype.onCancel = function ($event) {
        this.invokeEventCallback('cancel', { $event: $event });
    };
    ConfirmDialogComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.register(this.viewParent);
    };
    ConfirmDialogComponent.initializeProps = registerProps();
    ConfirmDialogComponent.decorators = [
        { type: Component, args: [{
                    selector: 'div[wmConfirmDialog]',
                    template: "<ng-template #dialogTemplate>\n    <div wmDialogHeader [closable]=\"closable\"\n         [iconclass]=\"iconclass\"\n         [iconurl]=\"iconurl\"\n         [iconwidth]=\"iconwidth\"\n         [iconheight]=\"iconheight\"\n         [iconmargin]=\"iconmargin\"\n         [heading]=\"title\"></div>\n    <div wmDialogBody>\n        <p class=\"app-dialog-message {{messageclass}}\" [attr.aria-describedby]=\"message\">{{message}}</p>\n    </div>\n    <div wmDialogFooter>\n        <button wmButton class=\"btn-default btn-secondary cancel-action\" caption.bind=\"canceltext\" aria-label=\"Cancel button\" (click)=\"onCancel($event)\"></button>\n        <button wmButton class=\"btn-primary ok-action\" caption.bind=\"oktext\" aria-label=\"Submit button\" (click)=\"onOk($event)\"></button>\n    </div>\n</ng-template>\n",
                    providers: [
                        provideAsWidgetRef(ConfirmDialogComponent),
                        provideAsDialogRef(ConfirmDialogComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    ConfirmDialogComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: String, decorators: [{ type: Attribute, args: ['class',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['modal',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['closable',] }] }
    ]; };
    ConfirmDialogComponent.propDecorators = {
        dialogTemplate: [{ type: ViewChild, args: ['dialogTemplate',] }]
    };
    return ConfirmDialogComponent;
}(BaseDialog));
export { ConfirmDialogComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlybS1kaWFsb2cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9kaWFsb2cvY29uZmlybS1kaWFsb2cvY29uZmlybS1kaWFsb2cuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQVUsV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUvRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFeEYsSUFBTSxVQUFVLEdBQUcsNENBQTRDLENBQUM7QUFDaEUsSUFBTSxXQUFXLEdBQUcsRUFBQyxVQUFVLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQztBQUVyRDtJQVE0QyxrREFBVTtJQUlsRCxnQ0FDSSxHQUFhLEVBQ08sV0FBbUIsRUFDbkIsS0FBdUIsRUFDcEIsUUFBMEI7UUFKckQsaUJBMEJDO1FBcEJHLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ3ZDLEtBQUssR0FBRyxLQUFLLENBQUM7U0FDakI7UUFFRCxJQUFJLFFBQVEsS0FBSyxJQUFJLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtZQUM3QyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQ25CO1FBRUQsK0VBQStFO1FBQy9FLElBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUUxQixRQUFBLGtCQUNJLEdBQUcsRUFDSCxXQUFXLEVBQ1g7WUFDSSxLQUFLLEVBQUssVUFBVSxVQUFJLFdBQVcsSUFBSSxFQUFFLENBQUU7WUFDM0MsUUFBUSxVQUFBO1lBQ1IsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztTQUM5QixDQUNKLFNBQUM7O0lBQ04sQ0FBQztJQUVTLCtDQUFjLEdBQXhCO1FBQ0ksT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gscUNBQUksR0FBSixVQUFLLE1BQWE7UUFDZCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEVBQUMsTUFBTSxRQUFBLEVBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gseUNBQVEsR0FBUixVQUFTLE1BQWE7UUFDbEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxFQUFDLE1BQU0sUUFBQSxFQUFDLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQseUNBQVEsR0FBUjtRQUNJLGlCQUFNLFFBQVEsV0FBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUF4RE0sc0NBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBVDVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsc0JBQXNCO29CQUNoQywyekJBQThDO29CQUM5QyxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsc0JBQXNCLENBQUM7d0JBQzFDLGtCQUFrQixDQUFDLHNCQUFzQixDQUFDO3FCQUM3QztpQkFDSjs7OztnQkFqQjhCLFFBQVE7NkNBd0I5QixTQUFTLFNBQUMsT0FBTztnREFDakIsU0FBUyxTQUFDLE9BQU87Z0RBQ2pCLFNBQVMsU0FBQyxVQUFVOzs7aUNBTnhCLFNBQVMsU0FBQyxnQkFBZ0I7O0lBd0QvQiw2QkFBQztDQUFBLEFBbEVELENBUTRDLFVBQVUsR0EwRHJEO1NBMURZLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF0dHJpYnV0ZSwgQ29tcG9uZW50LCBJbmplY3RvciwgT25Jbml0LCBUZW1wbGF0ZVJlZiwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IHRvQm9vbGVhbiB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2NvbmZpcm0tZGlhbG9nLnByb3BzJztcbmltcG9ydCB7IEJhc2VEaWFsb2cgfSBmcm9tICcuLi9iYXNlL2Jhc2UtZGlhbG9nJztcbmltcG9ydCB7IHByb3ZpZGVBc0RpYWxvZ1JlZiwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgRElBTE9HX0NMUyA9ICdhcHAtZGlhbG9nIG1vZGFsLWRpYWxvZyBhcHAtY29uZmlybS1kaWFsb2cnO1xuY29uc3QgV0lER0VUX0lORk8gPSB7d2lkZ2V0VHlwZTogJ3dtLWNvbmZpcm1kaWFsb2cnfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21Db25maXJtRGlhbG9nXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2NvbmZpcm0tZGlhbG9nLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKENvbmZpcm1EaWFsb2dDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNEaWFsb2dSZWYoQ29uZmlybURpYWxvZ0NvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIENvbmZpcm1EaWFsb2dDb21wb25lbnQgZXh0ZW5kcyBCYXNlRGlhbG9nIGltcGxlbWVudHMgT25Jbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuICAgIEBWaWV3Q2hpbGQoJ2RpYWxvZ1RlbXBsYXRlJykgZGlhbG9nVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgQEF0dHJpYnV0ZSgnY2xhc3MnKSBkaWFsb2dDbGFzczogc3RyaW5nLFxuICAgICAgICBAQXR0cmlidXRlKCdtb2RhbCcpIG1vZGFsOiBzdHJpbmcgfCBib29sZWFuLFxuICAgICAgICBAQXR0cmlidXRlKCdjbG9zYWJsZScpIGNsb3NhYmxlOiBzdHJpbmcgfCBib29sZWFuLFxuICAgICkge1xuICAgICAgICBpZiAobW9kYWwgPT09IG51bGwgfHwgbW9kYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbW9kYWwgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjbG9zYWJsZSA9PT0gbnVsbCB8fCBjbG9zYWJsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjbG9zYWJsZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXR0aW5nIHRoZSBiYWNrZHJvcCB0byAnc3RhdGljJyB3aWxsIG5vdCBjbG9zZSB0aGUgZGlhbG9nIG9uIGJhY2tkcm9wIGNsaWNrXG4gICAgICAgIGNvbnN0IGJhY2tkcm9wID0gJ3N0YXRpYyc7XG5cbiAgICAgICAgc3VwZXIoXG4gICAgICAgICAgICBpbmosXG4gICAgICAgICAgICBXSURHRVRfSU5GTyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogYCR7RElBTE9HX0NMU30gJHtkaWFsb2dDbGFzcyB8fCAnJ31gLFxuICAgICAgICAgICAgICAgIGJhY2tkcm9wLFxuICAgICAgICAgICAgICAgIGtleWJvYXJkOiAhdG9Cb29sZWFuKG1vZGFsKVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRUZW1wbGF0ZVJlZigpOiBUZW1wbGF0ZVJlZjxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlhbG9nVGVtcGxhdGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xpY2sgZXZlbnQgaGFuZGxlciBmb3IgdGhlIG9rIGJ1dHRvblxuICAgICAqIGludm9rZXMgb24tb2sgZXZlbnQgY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSAkZXZlbnRcbiAgICAgKi9cbiAgICBvbk9rKCRldmVudDogRXZlbnQpIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdvaycsIHskZXZlbnR9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGljayBldmVudCBoYW5kbGVyIGZvciB0aGUgY2FuY2VsIGJ1dHRvblxuICAgICAqIGludm9rZXMgb24tY2FuY2VsIGV2ZW50IGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtFdmVudH0gJGV2ZW50XG4gICAgICovXG4gICAgb25DYW5jZWwoJGV2ZW50OiBFdmVudCkge1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2NhbmNlbCcsIHskZXZlbnR9KTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy5yZWdpc3Rlcih0aGlzLnZpZXdQYXJlbnQpO1xuICAgIH1cbn1cbiJdfQ==