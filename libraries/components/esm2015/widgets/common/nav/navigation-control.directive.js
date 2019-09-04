import { Directive, ElementRef, Input } from '@angular/core';
import { setAttr } from '@wm/core';
export const disableContextMenu = ($event) => {
    $event.preventDefault();
};
export class NavigationControlDirective {
    constructor(eleRef) {
        this.nativeElement = eleRef.nativeElement;
    }
    set wmNavigationControl(val) {
        this._link = val;
        if (val && !this.disableMenuContext) {
            setAttr(this.nativeElement, 'href', val);
            this.nativeElement.removeEventListener('contextmenu', disableContextMenu);
        }
        else {
            setAttr(this.nativeElement, 'href', 'javascript:void(0)');
            this.nativeElement.addEventListener('contextmenu', disableContextMenu);
        }
    }
}
NavigationControlDirective.decorators = [
    { type: Directive, args: [{ selector: '[wmNavigationControl]' },] }
];
/** @nocollapse */
NavigationControlDirective.ctorParameters = () => [
    { type: ElementRef }
];
NavigationControlDirective.propDecorators = {
    disableMenuContext: [{ type: Input }],
    wmNavigationControl: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdGlvbi1jb250cm9sLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbmF2L25hdmlnYXRpb24tY29udHJvbC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTdELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbkMsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxNQUFhLEVBQUUsRUFBRTtJQUNoRCxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDNUIsQ0FBQyxDQUFDO0FBR0YsTUFBTSxPQUFPLDBCQUEwQjtJQWtCbkMsWUFBWSxNQUFrQjtRQUMxQixJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7SUFDOUMsQ0FBQztJQWJELElBQWEsbUJBQW1CLENBQUMsR0FBRztRQUNoQyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztTQUM3RTthQUFNO1lBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztTQUMxRTtJQUNMLENBQUM7OztZQWpCSixTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsdUJBQXVCLEVBQUM7Ozs7WUFSMUIsVUFBVTs7O2lDQWN6QixLQUFLO2tDQUVMLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IHNldEF0dHIgfSBmcm9tICdAd20vY29yZSc7XG5cbmV4cG9ydCBjb25zdCBkaXNhYmxlQ29udGV4dE1lbnUgPSAoJGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufTtcblxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbd21OYXZpZ2F0aW9uQ29udHJvbF0nfSlcbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uQ29udHJvbERpcmVjdGl2ZSB7XG5cbiAgICBwcml2YXRlIG5hdGl2ZUVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgX2xpbms6IHN0cmluZztcblxuICAgIEBJbnB1dCgpIGRpc2FibGVNZW51Q29udGV4dDogYm9vbGVhbjtcblxuICAgIEBJbnB1dCgpIHNldCB3bU5hdmlnYXRpb25Db250cm9sKHZhbCkge1xuICAgICAgICB0aGlzLl9saW5rID0gdmFsO1xuICAgICAgICBpZiAodmFsICYmICF0aGlzLmRpc2FibGVNZW51Q29udGV4dCkge1xuICAgICAgICAgICAgc2V0QXR0cih0aGlzLm5hdGl2ZUVsZW1lbnQsICdocmVmJywgdmFsKTtcbiAgICAgICAgICAgIHRoaXMubmF0aXZlRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGRpc2FibGVDb250ZXh0TWVudSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRBdHRyKHRoaXMubmF0aXZlRWxlbWVudCwgJ2hyZWYnLCAnamF2YXNjcmlwdDp2b2lkKDApJyk7XG4gICAgICAgICAgICB0aGlzLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBkaXNhYmxlQ29udGV4dE1lbnUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoZWxlUmVmOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIHRoaXMubmF0aXZlRWxlbWVudCA9IGVsZVJlZi5uYXRpdmVFbGVtZW50O1xuICAgIH1cbn1cbiJdfQ==