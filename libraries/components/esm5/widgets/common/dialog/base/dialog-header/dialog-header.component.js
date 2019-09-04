import { Component, ElementRef, Inject, Input } from '@angular/core';
import { addClass, toBoolean } from '@wm/core';
import { DialogRef } from '../../../../framework/types';
import { BaseDialog } from '../base-dialog';
var DEFAULT_CLS = 'app-dialog-header modal-header';
var DEFAULT_ICON_DIMENSIONS = '21px';
var DialogHeaderComponent = /** @class */ (function () {
    function DialogHeaderComponent(elRef, dialogRef) {
        this.dialogRef = dialogRef;
        this.iconwidth = DEFAULT_ICON_DIMENSIONS;
        this.iconheight = DEFAULT_ICON_DIMENSIONS;
        this.closable = true;
        addClass(elRef.nativeElement, DEFAULT_CLS);
    }
    Object.defineProperty(DialogHeaderComponent.prototype, "isClosable", {
        get: function () {
            return toBoolean(this.closable);
        },
        enumerable: true,
        configurable: true
    });
    DialogHeaderComponent.prototype.closeDialog = function () {
        this.dialogRef.close();
    };
    DialogHeaderComponent.decorators = [
        { type: Component, args: [{
                    selector: 'div[wmDialogHeader]',
                    template: "<button *ngIf=\"isClosable\" aria-label=\"Close\" class=\"app-dialog-close close\" (click)=\"closeDialog();\" title=\"Close\">\n    <span aria-hidden=\"true\">&times;</span>\n</button>\n<h4 class=\"app-dialog-title modal-title\">\n    <i [ngClass]=\"iconclass\" [ngStyle]=\"{width: iconwidth, height: iconheight, margin: iconmargin}\"  *ngIf=\"iconclass && !iconurl\"></i>\n    <img data-identifier=\"img\" [src]=\"iconurl | image\" *ngIf=\"iconurl\" [ngStyle]=\"{width:iconwidth, height:iconheight, margin:iconmargin}\"/>\n    <span class=\"dialog-heading\" [textContent]=\"heading\"></span>\n    <span class=\"dialog-sub-heading\" *ngIf=\"subheading\" [title]=\"subheading\" [textContent]=\"subheading\"></span>\n</h4>"
                }] }
    ];
    /** @nocollapse */
    DialogHeaderComponent.ctorParameters = function () { return [
        { type: ElementRef },
        { type: BaseDialog, decorators: [{ type: Inject, args: [DialogRef,] }] }
    ]; };
    DialogHeaderComponent.propDecorators = {
        iconwidth: [{ type: Input }],
        iconheight: [{ type: Input }],
        iconmargin: [{ type: Input }],
        iconclass: [{ type: Input }],
        iconurl: [{ type: Input }],
        closable: [{ type: Input }],
        heading: [{ type: Input }],
        subheading: [{ type: Input }]
    };
    return DialogHeaderComponent;
}());
export { DialogHeaderComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWhlYWRlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2RpYWxvZy9iYXNlL2RpYWxvZy1oZWFkZXIvZGlhbG9nLWhlYWRlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVyRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUvQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTVDLElBQU0sV0FBVyxHQUFHLGdDQUFnQyxDQUFDO0FBQ3JELElBQU0sdUJBQXVCLEdBQUcsTUFBTSxDQUFDO0FBRXZDO0lBbUJJLCtCQUFZLEtBQWlCLEVBQTZCLFNBQXFCO1FBQXJCLGNBQVMsR0FBVCxTQUFTLENBQVk7UUFiL0QsY0FBUyxHQUFHLHVCQUF1QixDQUFDO1FBQ3BDLGVBQVUsR0FBRyx1QkFBdUIsQ0FBQztRQUlyQyxhQUFRLEdBQUcsSUFBSSxDQUFDO1FBUzVCLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFORCxzQkFBVyw2Q0FBVTthQUFyQjtZQUNJLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwQyxDQUFDOzs7T0FBQTtJQU1NLDJDQUFXLEdBQWxCO1FBQ0ksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDOztnQkF6QkosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxxQkFBcUI7b0JBQy9CLDR0QkFBNkM7aUJBQ2hEOzs7O2dCQWJtQixVQUFVO2dCQUtyQixVQUFVLHVCQXdCaUIsTUFBTSxTQUFDLFNBQVM7Ozs0QkFiL0MsS0FBSzs2QkFDTCxLQUFLOzZCQUNMLEtBQUs7NEJBQ0wsS0FBSzswQkFDTCxLQUFLOzJCQUNMLEtBQUs7MEJBQ0wsS0FBSzs2QkFDTCxLQUFLOztJQWFWLDRCQUFDO0NBQUEsQUExQkQsSUEwQkM7U0F0QlkscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3QsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGFkZENsYXNzLCB0b0Jvb2xlYW4gfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IERpYWxvZ1JlZiB9IGZyb20gJy4uLy4uLy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBCYXNlRGlhbG9nIH0gZnJvbSAnLi4vYmFzZS1kaWFsb2cnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtZGlhbG9nLWhlYWRlciBtb2RhbC1oZWFkZXInO1xuY29uc3QgREVGQVVMVF9JQ09OX0RJTUVOU0lPTlMgPSAnMjFweCc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZGl2W3dtRGlhbG9nSGVhZGVyXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2RpYWxvZy1oZWFkZXIuY29tcG9uZW50Lmh0bWwnXG59KVxuZXhwb3J0IGNsYXNzIERpYWxvZ0hlYWRlckNvbXBvbmVudCB7XG5cbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbndpZHRoID0gREVGQVVMVF9JQ09OX0RJTUVOU0lPTlM7XG4gICAgQElucHV0KCkgcHVibGljIGljb25oZWlnaHQgPSBERUZBVUxUX0lDT05fRElNRU5TSU9OUztcbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbm1hcmdpbjogc3RyaW5nO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uY2xhc3M6IHN0cmluZztcbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnVybDogc3RyaW5nO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjbG9zYWJsZSA9IHRydWU7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRpbmc6IHN0cmluZztcbiAgICBASW5wdXQoKSBwdWJsaWMgc3ViaGVhZGluZzogc3RyaW5nO1xuXG4gICAgcHVibGljIGdldCBpc0Nsb3NhYmxlKCkge1xuICAgICAgICByZXR1cm4gdG9Cb29sZWFuKHRoaXMuY2xvc2FibGUpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGVsUmVmOiBFbGVtZW50UmVmLCBASW5qZWN0KERpYWxvZ1JlZikgcHJpdmF0ZSBkaWFsb2dSZWY6IEJhc2VEaWFsb2cpIHtcbiAgICAgICAgYWRkQ2xhc3MoZWxSZWYubmF0aXZlRWxlbWVudCwgREVGQVVMVF9DTFMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbG9zZURpYWxvZygpIHtcbiAgICAgICAgdGhpcy5kaWFsb2dSZWYuY2xvc2UoKTtcbiAgICB9XG59XG4iXX0=