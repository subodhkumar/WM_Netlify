import * as tslib_1 from "tslib";
import { Attribute, Component, ContentChild, Injector, TemplateRef, ViewChild } from '@angular/core';
import { toBoolean } from '@wm/core';
import { registerProps } from './partial-dialog.props';
import { BaseDialog } from '../base/base-dialog';
import { provideAsDialogRef, provideAsWidgetRef } from '../../../../utils/widget-utils';
var DIALOG_CLS = 'app-dialog modal-dialog app-page-dialog';
var WIDGET_INFO = { widgetType: 'wm-partialdialog' };
var PartialDialogComponent = /** @class */ (function (_super) {
    tslib_1.__extends(PartialDialogComponent, _super);
    function PartialDialogComponent(inj, dialogClass, modal, closable) {
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
    PartialDialogComponent.prototype.getTemplateRef = function () {
        return this.dialogTemplate;
    };
    /**
     * Click event handler for the ok button
     * invokes on-ok event callback
     * @param {Event} $event
     */
    PartialDialogComponent.prototype.onOk = function ($event) {
        this.invokeEventCallback('ok', { $event: $event });
    };
    PartialDialogComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.register(this.viewParent);
    };
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
    PartialDialogComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: String, decorators: [{ type: Attribute, args: ['class',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['modal',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['closable',] }] }
    ]; };
    PartialDialogComponent.propDecorators = {
        dialogTemplate: [{ type: ViewChild, args: ['dialogTemplate',] }],
        dialogContent: [{ type: ContentChild, args: [TemplateRef,] }]
    };
    return PartialDialogComponent;
}(BaseDialog));
export { PartialDialogComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbC1kaWFsb2cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9kaWFsb2cvcGFydGlhbC1kaWFsb2cvcGFydGlhbC1kaWFsb2cuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFVLFdBQVcsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFN0csT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVyQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRXhGLElBQU0sVUFBVSxHQUFHLHlDQUF5QyxDQUFDO0FBQzdELElBQU0sV0FBVyxHQUFHLEVBQUMsVUFBVSxFQUFFLGtCQUFrQixFQUFDLENBQUM7QUFFckQ7SUFRNEMsa0RBQVU7SUFLbEQsZ0NBQ0ksR0FBYSxFQUNPLFdBQW1CLEVBQ25CLEtBQXVCLEVBQ3BCLFFBQTBCO1FBSnJELGlCQTBCQztRQXBCRyxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUN2QyxLQUFLLEdBQUcsS0FBSyxDQUFDO1NBQ2pCO1FBRUQsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDN0MsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjtRQUVELCtFQUErRTtRQUMvRSxJQUFNLFFBQVEsR0FBdUIsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUV4RSxRQUFBLGtCQUNJLEdBQUcsRUFDSCxXQUFXLEVBQ1g7WUFDSSxLQUFLLEVBQUssVUFBVSxVQUFJLFdBQVcsSUFBSSxFQUFFLENBQUU7WUFDM0MsUUFBUSxVQUFBO1lBQ1IsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztTQUM5QixDQUNKLFNBQUM7O0lBQ04sQ0FBQztJQUVTLCtDQUFjLEdBQXhCO1FBQ0ksT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gscUNBQUksR0FBSixVQUFLLE1BQWE7UUFDZCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEVBQUMsTUFBTSxRQUFBLEVBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCx5Q0FBUSxHQUFSO1FBQ0ksaUJBQU0sUUFBUSxXQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQWhETSxzQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFUNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxzQkFBc0I7b0JBQ2hDLHdvQkFBOEM7b0JBQzlDLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxzQkFBc0IsQ0FBQzt3QkFDMUMsa0JBQWtCLENBQUMsc0JBQXNCLENBQUM7cUJBQzdDO2lCQUNKOzs7O2dCQWxCNEMsUUFBUTs2Q0EwQjVDLFNBQVMsU0FBQyxPQUFPO2dEQUNqQixTQUFTLFNBQUMsT0FBTztnREFDakIsU0FBUyxTQUFDLFVBQVU7OztpQ0FQeEIsU0FBUyxTQUFDLGdCQUFnQjtnQ0FDMUIsWUFBWSxTQUFDLFdBQVc7O0lBK0M3Qiw2QkFBQztDQUFBLEFBMURELENBUTRDLFVBQVUsR0FrRHJEO1NBbERZLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF0dHJpYnV0ZSwgQ29tcG9uZW50LCBDb250ZW50Q2hpbGQsIEluamVjdG9yLCBPbkluaXQsIFRlbXBsYXRlUmVmLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgdG9Cb29sZWFuIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9wYXJ0aWFsLWRpYWxvZy5wcm9wcyc7XG5pbXBvcnQgeyBCYXNlRGlhbG9nIH0gZnJvbSAnLi4vYmFzZS9iYXNlLWRpYWxvZyc7XG5pbXBvcnQgeyBwcm92aWRlQXNEaWFsb2dSZWYsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERJQUxPR19DTFMgPSAnYXBwLWRpYWxvZyBtb2RhbC1kaWFsb2cgYXBwLXBhZ2UtZGlhbG9nJztcbmNvbnN0IFdJREdFVF9JTkZPID0ge3dpZGdldFR5cGU6ICd3bS1wYXJ0aWFsZGlhbG9nJ307XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZGl2W3dtUGFydGlhbERpYWxvZ10nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9wYXJ0aWFsLWRpYWxvZy5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihQYXJ0aWFsRGlhbG9nQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzRGlhbG9nUmVmKFBhcnRpYWxEaWFsb2dDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBQYXJ0aWFsRGlhbG9nQ29tcG9uZW50IGV4dGVuZHMgQmFzZURpYWxvZyBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcbiAgICBAVmlld0NoaWxkKCdkaWFsb2dUZW1wbGF0ZScpIGRpYWxvZ1RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICAgIEBDb250ZW50Q2hpbGQoVGVtcGxhdGVSZWYpIGRpYWxvZ0NvbnRlbnQ6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgQEF0dHJpYnV0ZSgnY2xhc3MnKSBkaWFsb2dDbGFzczogc3RyaW5nLFxuICAgICAgICBAQXR0cmlidXRlKCdtb2RhbCcpIG1vZGFsOiBzdHJpbmcgfCBib29sZWFuLFxuICAgICAgICBAQXR0cmlidXRlKCdjbG9zYWJsZScpIGNsb3NhYmxlOiBzdHJpbmcgfCBib29sZWFuXG4gICAgKSB7XG4gICAgICAgIGlmIChtb2RhbCA9PT0gbnVsbCB8fCBtb2RhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBtb2RhbCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNsb3NhYmxlID09PSBudWxsIHx8IGNsb3NhYmxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNsb3NhYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldHRpbmcgdGhlIGJhY2tkcm9wIHRvICdzdGF0aWMnIHdpbGwgbm90IGNsb3NlIHRoZSBkaWFsb2cgb24gYmFja2Ryb3AgY2xpY2tcbiAgICAgICAgY29uc3QgYmFja2Ryb3A6IGJvb2xlYW4gfCAnc3RhdGljJyA9IHRvQm9vbGVhbihtb2RhbCkgPyAnc3RhdGljJyA6IHRydWU7XG5cbiAgICAgICAgc3VwZXIoXG4gICAgICAgICAgICBpbmosXG4gICAgICAgICAgICBXSURHRVRfSU5GTyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogYCR7RElBTE9HX0NMU30gJHtkaWFsb2dDbGFzcyB8fCAnJ31gLFxuICAgICAgICAgICAgICAgIGJhY2tkcm9wLFxuICAgICAgICAgICAgICAgIGtleWJvYXJkOiAhdG9Cb29sZWFuKG1vZGFsKVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRUZW1wbGF0ZVJlZigpOiBUZW1wbGF0ZVJlZjxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlhbG9nVGVtcGxhdGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xpY2sgZXZlbnQgaGFuZGxlciBmb3IgdGhlIG9rIGJ1dHRvblxuICAgICAqIGludm9rZXMgb24tb2sgZXZlbnQgY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSAkZXZlbnRcbiAgICAgKi9cbiAgICBvbk9rKCRldmVudDogRXZlbnQpIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdvaycsIHskZXZlbnR9KTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy5yZWdpc3Rlcih0aGlzLnZpZXdQYXJlbnQpO1xuICAgIH1cbn1cbiJdfQ==