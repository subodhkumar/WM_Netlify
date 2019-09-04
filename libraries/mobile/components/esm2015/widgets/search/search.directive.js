import { Directive, ElementRef } from '@angular/core';
import { switchClass } from '@wm/core';
export class SearchDirective {
    constructor(elRef) {
        switchClass(elRef.nativeElement, 'app-mobile-search');
    }
}
SearchDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmSearch]'
            },] }
];
/** @nocollapse */
SearchDirective.ctorParameters = () => [
    { type: ElementRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvc2VhcmNoL3NlYXJjaC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUt2QyxNQUFNLE9BQU8sZUFBZTtJQUV4QixZQUFZLEtBQWlCO1FBQ3pCLFdBQVcsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDMUQsQ0FBQzs7O1lBUEosU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxZQUFZO2FBQ3pCOzs7O1lBTm1CLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgc3dpdGNoQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtU2VhcmNoXSdcbn0pXG5leHBvcnQgY2xhc3MgU2VhcmNoRGlyZWN0aXZlIHtcblxuICAgIGNvbnN0cnVjdG9yKGVsUmVmOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIHN3aXRjaENsYXNzKGVsUmVmLm5hdGl2ZUVsZW1lbnQsICdhcHAtbW9iaWxlLXNlYXJjaCcpO1xuICAgIH1cbn1cbiJdfQ==