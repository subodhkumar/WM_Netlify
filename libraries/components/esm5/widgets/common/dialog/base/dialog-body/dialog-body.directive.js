import { Directive, ElementRef, HostBinding, Inject } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';
import { addClass, setAttr, setCSS } from '@wm/core';
import { DialogRef } from '../../../../framework/types';
var DEFAULT_CLS = 'app-dialog-body modal-body';
var DialogBodyDirective = /** @class */ (function () {
    function DialogBodyDirective(elRef, dialogRef, bsModal) {
        var _this = this;
        this.dialogRef = dialogRef;
        addClass(elRef.nativeElement, DEFAULT_CLS);
        var subscription = bsModal.onShown.subscribe(function () {
            var dialogRoot = $(elRef.nativeElement).closest('.app-dialog')[0];
            var width = _this.dialogRef.width;
            if (dialogRoot) {
                if (width) {
                    setCSS(dialogRoot, 'width', width);
                }
                setAttr(dialogRoot, 'tabindex', _this.dialogRef.tabindex);
                setAttr(dialogRoot, 'name', _this.dialogRef.name);
            }
            subscription.unsubscribe();
        });
    }
    DialogBodyDirective.decorators = [
        { type: Directive, args: [{
                    selector: 'div[wmDialogBody]',
                },] }
    ];
    /** @nocollapse */
    DialogBodyDirective.ctorParameters = function () { return [
        { type: ElementRef },
        { type: undefined, decorators: [{ type: Inject, args: [DialogRef,] }] },
        { type: BsModalService }
    ]; };
    DialogBodyDirective.propDecorators = {
        height: [{ type: HostBinding, args: ['style.height',] }]
    };
    return DialogBodyDirective;
}());
export { DialogBodyDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWJvZHkuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9kaWFsb2cvYmFzZS9kaWFsb2ctYm9keS9kaWFsb2ctYm9keS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRS9DLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVyRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFJeEQsSUFBTSxXQUFXLEdBQUcsNEJBQTRCLENBQUM7QUFFakQ7SUFNSSw2QkFDSSxLQUFpQixFQUNVLFNBQVMsRUFDcEMsT0FBdUI7UUFIM0IsaUJBb0JDO1FBbEI4QixjQUFTLEdBQVQsU0FBUyxDQUFBO1FBR3BDLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRTNDLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO1lBQzNDLElBQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLElBQU0sS0FBSyxHQUFHLEtBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQ25DLElBQUksVUFBVSxFQUFFO2dCQUNaLElBQUksS0FBSyxFQUFFO29CQUNQLE1BQU0sQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUN0QztnQkFDRCxPQUFPLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxLQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6RCxPQUFPLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBRXBEO1lBQ0QsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7Z0JBMUJKLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsbUJBQW1CO2lCQUNoQzs7OztnQkFkbUIsVUFBVTtnREFvQnJCLE1BQU0sU0FBQyxTQUFTO2dCQWxCaEIsY0FBYzs7O3lCQWNsQixXQUFXLFNBQUMsY0FBYzs7SUF1Qi9CLDBCQUFDO0NBQUEsQUEzQkQsSUEyQkM7U0F4QlksbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBIb3N0QmluZGluZywgSW5qZWN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEJzTW9kYWxTZXJ2aWNlIH0gZnJvbSAnbmd4LWJvb3RzdHJhcCc7XG5cbmltcG9ydCB7IGFkZENsYXNzLCBzZXRBdHRyLCBzZXRDU1MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IERpYWxvZ1JlZiB9IGZyb20gJy4uLy4uLy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5cbmRlY2xhcmUgY29uc3QgJDtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWRpYWxvZy1ib2R5IG1vZGFsLWJvZHknO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bURpYWxvZ0JvZHldJyxcbn0pXG5leHBvcnQgY2xhc3MgRGlhbG9nQm9keURpcmVjdGl2ZSB7XG4gICAgQEhvc3RCaW5kaW5nKCdzdHlsZS5oZWlnaHQnKSBoZWlnaHQ7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZWxSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgIEBJbmplY3QoRGlhbG9nUmVmKSBwcml2YXRlIGRpYWxvZ1JlZixcbiAgICAgICAgYnNNb2RhbDogQnNNb2RhbFNlcnZpY2VcbiAgICApIHtcbiAgICAgICAgYWRkQ2xhc3MoZWxSZWYubmF0aXZlRWxlbWVudCwgREVGQVVMVF9DTFMpO1xuXG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IGJzTW9kYWwub25TaG93bi5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGlhbG9nUm9vdCA9ICQoZWxSZWYubmF0aXZlRWxlbWVudCkuY2xvc2VzdCgnLmFwcC1kaWFsb2cnKVswXTtcbiAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5kaWFsb2dSZWYud2lkdGg7XG4gICAgICAgICAgICBpZiAoZGlhbG9nUm9vdCkge1xuICAgICAgICAgICAgICAgIGlmICh3aWR0aCkge1xuICAgICAgICAgICAgICAgICAgICBzZXRDU1MoZGlhbG9nUm9vdCwgJ3dpZHRoJywgd2lkdGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXRBdHRyKGRpYWxvZ1Jvb3QsICd0YWJpbmRleCcsIHRoaXMuZGlhbG9nUmVmLnRhYmluZGV4KTtcbiAgICAgICAgICAgICAgICBzZXRBdHRyKGRpYWxvZ1Jvb3QsICduYW1lJywgdGhpcy5kaWFsb2dSZWYubmFtZSk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=