import { Directive, ElementRef } from '@angular/core';
import { switchClass } from '@wm/core';
var SearchDirective = /** @class */ (function () {
    function SearchDirective(elRef) {
        switchClass(elRef.nativeElement, 'app-mobile-search');
    }
    SearchDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmSearch]'
                },] }
    ];
    /** @nocollapse */
    SearchDirective.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    return SearchDirective;
}());
export { SearchDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvc2VhcmNoL3NlYXJjaC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV2QztJQUtJLHlCQUFZLEtBQWlCO1FBQ3pCLFdBQVcsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDMUQsQ0FBQzs7Z0JBUEosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxZQUFZO2lCQUN6Qjs7OztnQkFObUIsVUFBVTs7SUFZOUIsc0JBQUM7Q0FBQSxBQVJELElBUUM7U0FMWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IHN3aXRjaENsYXNzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bVNlYXJjaF0nXG59KVxuZXhwb3J0IGNsYXNzIFNlYXJjaERpcmVjdGl2ZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihlbFJlZjogRWxlbWVudFJlZikge1xuICAgICAgICBzd2l0Y2hDbGFzcyhlbFJlZi5uYXRpdmVFbGVtZW50LCAnYXBwLW1vYmlsZS1zZWFyY2gnKTtcbiAgICB9XG59XG4iXX0=