import * as tslib_1 from "tslib";
import { Attribute, Component, ContentChild, Inject, Injector, Self, TemplateRef, ViewChild } from '@angular/core';
import { toBoolean } from '@wm/core';
import { Context } from '../../../framework/types';
import { registerProps } from './dialog.props';
import { BaseDialog } from '../base/base-dialog';
import { provideAsDialogRef, provideAsWidgetRef } from '../../../../utils/widget-utils';
var DIALOG_CLS = 'app-dialog modal-dialog';
var WIDGET_INFO = { widgetType: 'wm-dialog' };
var ɵ0 = {};
var DialogComponent = /** @class */ (function (_super) {
    tslib_1.__extends(DialogComponent, _super);
    function DialogComponent(inj, dialogClass, modal, closable, contexts) {
        var _this = this;
        if (modal === null || modal === undefined) {
            modal = true;
        }
        if (closable === null || closable === undefined) {
            closable = true;
        }
        // contexts[0] will refer to the self context provided by this component
        contexts[0].closeDialog = function () { return _this.close(); };
        // setting the backdrop to 'static' will not close the dialog on backdrop click
        var backdrop = toBoolean(modal) ? 'static' : true;
        _this = _super.call(this, inj, WIDGET_INFO, {
            class: DIALOG_CLS + " " + (dialogClass || ''),
            backdrop: backdrop,
            keyboard: !toBoolean(modal)
        }) || this;
        return _this;
    }
    DialogComponent.prototype.getTemplateRef = function () {
        return this.dialogTemplate;
    };
    DialogComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.register(this.viewParent);
    };
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
    DialogComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: String, decorators: [{ type: Attribute, args: ['class',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['modal',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['closable',] }] },
        { type: Array, decorators: [{ type: Self }, { type: Inject, args: [Context,] }] }
    ]; };
    DialogComponent.propDecorators = {
        dialogTemplate: [{ type: ViewChild, args: ['dialogTemplate', { read: TemplateRef },] }],
        dialogBody: [{ type: ContentChild, args: ['dialogBody', { read: TemplateRef },] }],
        dialogFooter: [{ type: ContentChild, args: ['dialogFooter', { read: TemplateRef },] }]
    };
    return DialogComponent;
}(BaseDialog));
export { DialogComponent };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZGlhbG9nL2Rlc2lnbi1kaWFsb2cvZGlhbG9nLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQVUsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0gsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVyQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUV4RixJQUFNLFVBQVUsR0FBRyx5QkFBeUIsQ0FBQztBQUU3QyxJQUFNLFdBQVcsR0FBRyxFQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUMsQ0FBQztTQVFULEVBQUU7QUFOdkM7SUFTcUMsMkNBQVU7SUFPM0MseUJBQ0ksR0FBYSxFQUNPLFdBQW1CLEVBQ25CLEtBQXVCLEVBQ3BCLFFBQTBCLEVBQ3hCLFFBQW9CO1FBTGpELGlCQThCQztRQXZCRyxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUN2QyxLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ2hCO1FBRUQsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDN0MsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjtRQUVELHdFQUF3RTtRQUN4RSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLGNBQU0sT0FBQSxLQUFJLENBQUMsS0FBSyxFQUFFLEVBQVosQ0FBWSxDQUFDO1FBRTdDLCtFQUErRTtRQUMvRSxJQUFNLFFBQVEsR0FBdUIsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUV4RSxRQUFBLGtCQUNJLEdBQUcsRUFDSCxXQUFXLEVBQ1g7WUFDSSxLQUFLLEVBQUssVUFBVSxVQUFJLFdBQVcsSUFBSSxFQUFFLENBQUU7WUFDM0MsUUFBUSxVQUFBO1lBQ1IsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztTQUM5QixDQUNKLFNBQUM7O0lBQ04sQ0FBQztJQUVTLHdDQUFjLEdBQXhCO1FBQ0ksT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQy9CLENBQUM7SUFFRCxrQ0FBUSxHQUFSO1FBQ0ksaUJBQU0sUUFBUSxXQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQTdDTSwrQkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFWNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxlQUFlO29CQUN6QiwwaEJBQXNDO29CQUN0QyxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsZUFBZSxDQUFDO3dCQUNuQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUM7d0JBQ25DLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO3FCQUNoRDtpQkFDSjs7OztnQkFyQm9ELFFBQVE7NkNBK0JwRCxTQUFTLFNBQUMsT0FBTztnREFDakIsU0FBUyxTQUFDLE9BQU87Z0RBQ2pCLFNBQVMsU0FBQyxVQUFVO2dCQUNjLEtBQUssdUJBQXZDLElBQUksWUFBSSxNQUFNLFNBQUMsT0FBTzs7O2lDQVQxQixTQUFTLFNBQUMsZ0JBQWdCLEVBQUUsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFDOzZCQUMvQyxZQUFZLFNBQUMsWUFBWSxFQUFFLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBQzsrQkFDOUMsWUFBWSxTQUFDLGNBQWMsRUFBRSxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUM7O0lBMENyRCxzQkFBQztDQUFBLEFBeERELENBU3FDLFVBQVUsR0ErQzlDO1NBL0NZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIENvbXBvbmVudCwgQ29udGVudENoaWxkLCBJbmplY3QsIEluamVjdG9yLCBPbkluaXQsIFNlbGYsIFRlbXBsYXRlUmVmLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgdG9Cb29sZWFuIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2RpYWxvZy5wcm9wcyc7XG5pbXBvcnQgeyBCYXNlRGlhbG9nIH0gZnJvbSAnLi4vYmFzZS9iYXNlLWRpYWxvZyc7XG5pbXBvcnQgeyBwcm92aWRlQXNEaWFsb2dSZWYsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERJQUxPR19DTFMgPSAnYXBwLWRpYWxvZyBtb2RhbC1kaWFsb2cnO1xuXG5jb25zdCBXSURHRVRfSU5GTyA9IHt3aWRnZXRUeXBlOiAnd20tZGlhbG9nJ307XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZGl2W3dtRGlhbG9nXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2RpYWxvZy5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihEaWFsb2dDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNEaWFsb2dSZWYoRGlhbG9nQ29tcG9uZW50KSxcbiAgICAgICAge3Byb3ZpZGU6IENvbnRleHQsIHVzZVZhbHVlOiB7fSwgbXVsdGk6IHRydWV9XG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBEaWFsb2dDb21wb25lbnQgZXh0ZW5kcyBCYXNlRGlhbG9nIGltcGxlbWVudHMgT25Jbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgQFZpZXdDaGlsZCgnZGlhbG9nVGVtcGxhdGUnLCB7cmVhZDogVGVtcGxhdGVSZWZ9KSBkaWFsb2dUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcbiAgICBAQ29udGVudENoaWxkKCdkaWFsb2dCb2R5Jywge3JlYWQ6IFRlbXBsYXRlUmVmfSkgZGlhbG9nQm9keTogVGVtcGxhdGVSZWY8YW55PjtcbiAgICBAQ29udGVudENoaWxkKCdkaWFsb2dGb290ZXInLCB7cmVhZDogVGVtcGxhdGVSZWZ9KSBkaWFsb2dGb290ZXI6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgQEF0dHJpYnV0ZSgnY2xhc3MnKSBkaWFsb2dDbGFzczogc3RyaW5nLFxuICAgICAgICBAQXR0cmlidXRlKCdtb2RhbCcpIG1vZGFsOiBzdHJpbmcgfCBib29sZWFuLFxuICAgICAgICBAQXR0cmlidXRlKCdjbG9zYWJsZScpIGNsb3NhYmxlOiBzdHJpbmcgfCBib29sZWFuLFxuICAgICAgICBAU2VsZigpIEBJbmplY3QoQ29udGV4dCkgY29udGV4dHM6IEFycmF5PGFueT5cbiAgICApIHtcbiAgICAgICAgaWYgKG1vZGFsID09PSBudWxsIHx8IG1vZGFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG1vZGFsID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjbG9zYWJsZSA9PT0gbnVsbCB8fCBjbG9zYWJsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjbG9zYWJsZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb250ZXh0c1swXSB3aWxsIHJlZmVyIHRvIHRoZSBzZWxmIGNvbnRleHQgcHJvdmlkZWQgYnkgdGhpcyBjb21wb25lbnRcbiAgICAgICAgY29udGV4dHNbMF0uY2xvc2VEaWFsb2cgPSAoKSA9PiB0aGlzLmNsb3NlKCk7XG5cbiAgICAgICAgLy8gc2V0dGluZyB0aGUgYmFja2Ryb3AgdG8gJ3N0YXRpYycgd2lsbCBub3QgY2xvc2UgdGhlIGRpYWxvZyBvbiBiYWNrZHJvcCBjbGlja1xuICAgICAgICBjb25zdCBiYWNrZHJvcDogYm9vbGVhbiB8ICdzdGF0aWMnID0gdG9Cb29sZWFuKG1vZGFsKSA/ICdzdGF0aWMnIDogdHJ1ZTtcblxuICAgICAgICBzdXBlcihcbiAgICAgICAgICAgIGluaixcbiAgICAgICAgICAgIFdJREdFVF9JTkZPLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNsYXNzOiBgJHtESUFMT0dfQ0xTfSAke2RpYWxvZ0NsYXNzIHx8ICcnfWAsXG4gICAgICAgICAgICAgICAgYmFja2Ryb3AsXG4gICAgICAgICAgICAgICAga2V5Ym9hcmQ6ICF0b0Jvb2xlYW4obW9kYWwpXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFRlbXBsYXRlUmVmKCk6IFRlbXBsYXRlUmVmPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kaWFsb2dUZW1wbGF0ZTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy5yZWdpc3Rlcih0aGlzLnZpZXdQYXJlbnQpO1xuICAgIH1cbn1cbiJdfQ==