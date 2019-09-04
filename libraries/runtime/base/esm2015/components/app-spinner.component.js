import { Component, Input } from '@angular/core';
export class AppSpinnerComponent {
    constructor() { }
}
AppSpinnerComponent.decorators = [
    { type: Component, args: [{
                selector: 'app-spinner',
                template: `
        <div class="app-spinner" *ngIf="show">
            <div class="spinner-message" aria-label="loading gif">
                <i class="spinner-image animated infinite fa fa-circle-o-notch fa-spin"></i>
                <div class="spinner-messages">
                    <p *ngFor="let value of spinnermessages" [textContent]="value"></p>
                </div>
            </div>
        </div>
    `
            }] }
];
/** @nocollapse */
AppSpinnerComponent.ctorParameters = () => [];
AppSpinnerComponent.propDecorators = {
    show: [{ type: Input }],
    spinnermessages: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXNwaW5uZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbImNvbXBvbmVudHMvYXBwLXNwaW5uZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBZWpELE1BQU0sT0FBTyxtQkFBbUI7SUFHNUIsZ0JBQWUsQ0FBQzs7O1lBaEJuQixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFFBQVEsRUFBRTs7Ozs7Ozs7O0tBU1Q7YUFDSjs7Ozs7bUJBRUksS0FBSzs4QkFDTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FwcC1zcGlubmVyJyxcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8ZGl2IGNsYXNzPVwiYXBwLXNwaW5uZXJcIiAqbmdJZj1cInNob3dcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGlubmVyLW1lc3NhZ2VcIiBhcmlhLWxhYmVsPVwibG9hZGluZyBnaWZcIj5cbiAgICAgICAgICAgICAgICA8aSBjbGFzcz1cInNwaW5uZXItaW1hZ2UgYW5pbWF0ZWQgaW5maW5pdGUgZmEgZmEtY2lyY2xlLW8tbm90Y2ggZmEtc3BpblwiPjwvaT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lci1tZXNzYWdlc1wiPlxuICAgICAgICAgICAgICAgICAgICA8cCAqbmdGb3I9XCJsZXQgdmFsdWUgb2Ygc3Bpbm5lcm1lc3NhZ2VzXCIgW3RleHRDb250ZW50XT1cInZhbHVlXCI+PC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQXBwU3Bpbm5lckNvbXBvbmVudCB7XG4gICAgQElucHV0KCkgc2hvdzogYm9vbGVhbjtcbiAgICBASW5wdXQoKSBzcGlubmVybWVzc2FnZXM6IEFycmF5PHN0cmluZz47XG4gICAgY29uc3RydWN0b3IoKSB7fVxufVxuIl19