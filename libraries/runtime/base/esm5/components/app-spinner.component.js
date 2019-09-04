import { Component, Input } from '@angular/core';
var AppSpinnerComponent = /** @class */ (function () {
    function AppSpinnerComponent() {
    }
    AppSpinnerComponent.decorators = [
        { type: Component, args: [{
                    selector: 'app-spinner',
                    template: "\n        <div class=\"app-spinner\" *ngIf=\"show\">\n            <div class=\"spinner-message\" aria-label=\"loading gif\">\n                <i class=\"spinner-image animated infinite fa fa-circle-o-notch fa-spin\"></i>\n                <div class=\"spinner-messages\">\n                    <p *ngFor=\"let value of spinnermessages\" [textContent]=\"value\"></p>\n                </div>\n            </div>\n        </div>\n    "
                }] }
    ];
    /** @nocollapse */
    AppSpinnerComponent.ctorParameters = function () { return []; };
    AppSpinnerComponent.propDecorators = {
        show: [{ type: Input }],
        spinnermessages: [{ type: Input }]
    };
    return AppSpinnerComponent;
}());
export { AppSpinnerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXNwaW5uZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbImNvbXBvbmVudHMvYXBwLXNwaW5uZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWpEO0lBZ0JJO0lBQWUsQ0FBQzs7Z0JBaEJuQixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGFBQWE7b0JBQ3ZCLFFBQVEsRUFBRSwrYUFTVDtpQkFDSjs7Ozs7dUJBRUksS0FBSztrQ0FDTCxLQUFLOztJQUVWLDBCQUFDO0NBQUEsQUFqQkQsSUFpQkM7U0FKWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYXBwLXNwaW5uZXInLFxuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJhcHAtc3Bpbm5lclwiICpuZ0lmPVwic2hvd1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXItbWVzc2FnZVwiIGFyaWEtbGFiZWw9XCJsb2FkaW5nIGdpZlwiPlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwic3Bpbm5lci1pbWFnZSBhbmltYXRlZCBpbmZpbml0ZSBmYSBmYS1jaXJjbGUtby1ub3RjaCBmYS1zcGluXCI+PC9pPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGlubmVyLW1lc3NhZ2VzXCI+XG4gICAgICAgICAgICAgICAgICAgIDxwICpuZ0Zvcj1cImxldCB2YWx1ZSBvZiBzcGlubmVybWVzc2FnZXNcIiBbdGV4dENvbnRlbnRdPVwidmFsdWVcIj48L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBBcHBTcGlubmVyQ29tcG9uZW50IHtcbiAgICBASW5wdXQoKSBzaG93OiBib29sZWFuO1xuICAgIEBJbnB1dCgpIHNwaW5uZXJtZXNzYWdlczogQXJyYXk8c3RyaW5nPjtcbiAgICBjb25zdHJ1Y3RvcigpIHt9XG59XG4iXX0=