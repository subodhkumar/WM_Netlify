import { Component, ElementRef, Inject, Input } from '@angular/core';
import { addClass, toBoolean } from '@wm/core';
import { DialogRef } from '../../../../framework/types';
import { BaseDialog } from '../base-dialog';
const DEFAULT_CLS = 'app-dialog-header modal-header';
const DEFAULT_ICON_DIMENSIONS = '21px';
export class DialogHeaderComponent {
    constructor(elRef, dialogRef) {
        this.dialogRef = dialogRef;
        this.iconwidth = DEFAULT_ICON_DIMENSIONS;
        this.iconheight = DEFAULT_ICON_DIMENSIONS;
        this.closable = true;
        addClass(elRef.nativeElement, DEFAULT_CLS);
    }
    get isClosable() {
        return toBoolean(this.closable);
    }
    closeDialog() {
        this.dialogRef.close();
    }
}
DialogHeaderComponent.decorators = [
    { type: Component, args: [{
                selector: 'div[wmDialogHeader]',
                template: "<button *ngIf=\"isClosable\" aria-label=\"Close\" class=\"app-dialog-close close\" (click)=\"closeDialog();\" title=\"Close\">\n    <span aria-hidden=\"true\">&times;</span>\n</button>\n<h4 class=\"app-dialog-title modal-title\">\n    <i [ngClass]=\"iconclass\" [ngStyle]=\"{width: iconwidth, height: iconheight, margin: iconmargin}\"  *ngIf=\"iconclass && !iconurl\"></i>\n    <img data-identifier=\"img\" [src]=\"iconurl | image\" *ngIf=\"iconurl\" [ngStyle]=\"{width:iconwidth, height:iconheight, margin:iconmargin}\"/>\n    <span class=\"dialog-heading\" [textContent]=\"heading\"></span>\n    <span class=\"dialog-sub-heading\" *ngIf=\"subheading\" [title]=\"subheading\" [textContent]=\"subheading\"></span>\n</h4>"
            }] }
];
/** @nocollapse */
DialogHeaderComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: BaseDialog, decorators: [{ type: Inject, args: [DialogRef,] }] }
];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWhlYWRlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2RpYWxvZy9iYXNlL2RpYWxvZy1oZWFkZXIvZGlhbG9nLWhlYWRlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVyRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUvQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTVDLE1BQU0sV0FBVyxHQUFHLGdDQUFnQyxDQUFDO0FBQ3JELE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxDQUFDO0FBTXZDLE1BQU0sT0FBTyxxQkFBcUI7SUFlOUIsWUFBWSxLQUFpQixFQUE2QixTQUFxQjtRQUFyQixjQUFTLEdBQVQsU0FBUyxDQUFZO1FBYi9ELGNBQVMsR0FBRyx1QkFBdUIsQ0FBQztRQUNwQyxlQUFVLEdBQUcsdUJBQXVCLENBQUM7UUFJckMsYUFBUSxHQUFHLElBQUksQ0FBQztRQVM1QixRQUFRLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBTkQsSUFBVyxVQUFVO1FBQ2pCLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBTU0sV0FBVztRQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDM0IsQ0FBQzs7O1lBekJKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUscUJBQXFCO2dCQUMvQiw0dEJBQTZDO2FBQ2hEOzs7O1lBYm1CLFVBQVU7WUFLckIsVUFBVSx1QkF3QmlCLE1BQU0sU0FBQyxTQUFTOzs7d0JBYi9DLEtBQUs7eUJBQ0wsS0FBSzt5QkFDTCxLQUFLO3dCQUNMLEtBQUs7c0JBQ0wsS0FBSzt1QkFDTCxLQUFLO3NCQUNMLEtBQUs7eUJBQ0wsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5qZWN0LCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgdG9Cb29sZWFuIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBEaWFsb2dSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgQmFzZURpYWxvZyB9IGZyb20gJy4uL2Jhc2UtZGlhbG9nJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWRpYWxvZy1oZWFkZXIgbW9kYWwtaGVhZGVyJztcbmNvbnN0IERFRkFVTFRfSUNPTl9ESU1FTlNJT05TID0gJzIxcHgnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bURpYWxvZ0hlYWRlcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9kaWFsb2ctaGVhZGVyLmNvbXBvbmVudC5odG1sJ1xufSlcbmV4cG9ydCBjbGFzcyBEaWFsb2dIZWFkZXJDb21wb25lbnQge1xuXG4gICAgQElucHV0KCkgcHVibGljIGljb253aWR0aCA9IERFRkFVTFRfSUNPTl9ESU1FTlNJT05TO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uaGVpZ2h0ID0gREVGQVVMVF9JQ09OX0RJTUVOU0lPTlM7XG4gICAgQElucHV0KCkgcHVibGljIGljb25tYXJnaW46IHN0cmluZztcbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbmNsYXNzOiBzdHJpbmc7XG4gICAgQElucHV0KCkgcHVibGljIGljb251cmw6IHN0cmluZztcbiAgICBASW5wdXQoKSBwdWJsaWMgY2xvc2FibGUgPSB0cnVlO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkaW5nOiBzdHJpbmc7XG4gICAgQElucHV0KCkgcHVibGljIHN1YmhlYWRpbmc6IHN0cmluZztcblxuICAgIHB1YmxpYyBnZXQgaXNDbG9zYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRvQm9vbGVhbih0aGlzLmNsb3NhYmxlKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihlbFJlZjogRWxlbWVudFJlZiwgQEluamVjdChEaWFsb2dSZWYpIHByaXZhdGUgZGlhbG9nUmVmOiBCYXNlRGlhbG9nKSB7XG4gICAgICAgIGFkZENsYXNzKGVsUmVmLm5hdGl2ZUVsZW1lbnQsIERFRkFVTFRfQ0xTKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xvc2VEaWFsb2coKSB7XG4gICAgICAgIHRoaXMuZGlhbG9nUmVmLmNsb3NlKCk7XG4gICAgfVxufVxuIl19