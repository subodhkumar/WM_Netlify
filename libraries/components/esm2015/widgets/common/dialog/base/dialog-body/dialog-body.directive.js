import { Directive, ElementRef, HostBinding, Inject } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';
import { addClass, setAttr, setCSS } from '@wm/core';
import { DialogRef } from '../../../../framework/types';
const DEFAULT_CLS = 'app-dialog-body modal-body';
export class DialogBodyDirective {
    constructor(elRef, dialogRef, bsModal) {
        this.dialogRef = dialogRef;
        addClass(elRef.nativeElement, DEFAULT_CLS);
        const subscription = bsModal.onShown.subscribe(() => {
            const dialogRoot = $(elRef.nativeElement).closest('.app-dialog')[0];
            const width = this.dialogRef.width;
            if (dialogRoot) {
                if (width) {
                    setCSS(dialogRoot, 'width', width);
                }
                setAttr(dialogRoot, 'tabindex', this.dialogRef.tabindex);
                setAttr(dialogRoot, 'name', this.dialogRef.name);
            }
            subscription.unsubscribe();
        });
    }
}
DialogBodyDirective.decorators = [
    { type: Directive, args: [{
                selector: 'div[wmDialogBody]',
            },] }
];
/** @nocollapse */
DialogBodyDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: undefined, decorators: [{ type: Inject, args: [DialogRef,] }] },
    { type: BsModalService }
];
DialogBodyDirective.propDecorators = {
    height: [{ type: HostBinding, args: ['style.height',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWJvZHkuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9kaWFsb2cvYmFzZS9kaWFsb2ctYm9keS9kaWFsb2ctYm9keS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRS9DLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVyRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFJeEQsTUFBTSxXQUFXLEdBQUcsNEJBQTRCLENBQUM7QUFLakQsTUFBTSxPQUFPLG1CQUFtQjtJQUc1QixZQUNJLEtBQWlCLEVBQ1UsU0FBUyxFQUNwQyxPQUF1QjtRQURJLGNBQVMsR0FBVCxTQUFTLENBQUE7UUFHcEMsUUFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFM0MsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2hELE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQ25DLElBQUksVUFBVSxFQUFFO2dCQUNaLElBQUksS0FBSyxFQUFFO29CQUNQLE1BQU0sQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUN0QztnQkFDRCxPQUFPLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6RCxPQUFPLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBRXBEO1lBQ0QsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7O1lBMUJKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsbUJBQW1CO2FBQ2hDOzs7O1lBZG1CLFVBQVU7NENBb0JyQixNQUFNLFNBQUMsU0FBUztZQWxCaEIsY0FBYzs7O3FCQWNsQixXQUFXLFNBQUMsY0FBYyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSG9zdEJpbmRpbmcsIEluamVjdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBCc01vZGFsU2VydmljZSB9IGZyb20gJ25neC1ib290c3RyYXAnO1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgc2V0QXR0ciwgc2V0Q1NTIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBEaWFsb2dSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuXG5kZWNsYXJlIGNvbnN0ICQ7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1kaWFsb2ctYm9keSBtb2RhbC1ib2R5JztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21EaWFsb2dCb2R5XScsXG59KVxuZXhwb3J0IGNsYXNzIERpYWxvZ0JvZHlEaXJlY3RpdmUge1xuICAgIEBIb3N0QmluZGluZygnc3R5bGUuaGVpZ2h0JykgaGVpZ2h0O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGVsUmVmOiBFbGVtZW50UmVmLFxuICAgICAgICBASW5qZWN0KERpYWxvZ1JlZikgcHJpdmF0ZSBkaWFsb2dSZWYsXG4gICAgICAgIGJzTW9kYWw6IEJzTW9kYWxTZXJ2aWNlXG4gICAgKSB7XG4gICAgICAgIGFkZENsYXNzKGVsUmVmLm5hdGl2ZUVsZW1lbnQsIERFRkFVTFRfQ0xTKTtcblxuICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBic01vZGFsLm9uU2hvd24uc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRpYWxvZ1Jvb3QgPSAkKGVsUmVmLm5hdGl2ZUVsZW1lbnQpLmNsb3Nlc3QoJy5hcHAtZGlhbG9nJylbMF07XG4gICAgICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMuZGlhbG9nUmVmLndpZHRoO1xuICAgICAgICAgICAgaWYgKGRpYWxvZ1Jvb3QpIHtcbiAgICAgICAgICAgICAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0Q1NTKGRpYWxvZ1Jvb3QsICd3aWR0aCcsIHdpZHRoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0QXR0cihkaWFsb2dSb290LCAndGFiaW5kZXgnLCB0aGlzLmRpYWxvZ1JlZi50YWJpbmRleCk7XG4gICAgICAgICAgICAgICAgc2V0QXR0cihkaWFsb2dSb290LCAnbmFtZScsIHRoaXMuZGlhbG9nUmVmLm5hbWUpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19