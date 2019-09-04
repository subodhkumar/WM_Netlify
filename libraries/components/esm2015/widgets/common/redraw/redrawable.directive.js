import { Directive, Inject, Self } from '@angular/core';
import { WidgetRef } from '../../framework/types';
export class RedrawableDirective {
    constructor(widget) {
        this.redraw = () => widget.redraw();
    }
}
RedrawableDirective.decorators = [
    { type: Directive, args: [{
                selector: '[redrawable]'
            },] }
];
/** @nocollapse */
RedrawableDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkcmF3YWJsZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3JlZHJhdy9yZWRyYXdhYmxlLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFeEQsT0FBTyxFQUF3QixTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUt4RSxNQUFNLE9BQU8sbUJBQW1CO0lBRTVCLFlBQXVDLE1BQU07UUFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDeEMsQ0FBQzs7O1lBUEosU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxjQUFjO2FBQzNCOzs7OzRDQUdnQixJQUFJLFlBQUksTUFBTSxTQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdCwgU2VsZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBJUmVkcmF3YWJsZUNvbXBvbmVudCwgV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbcmVkcmF3YWJsZV0nXG59KVxuZXhwb3J0IGNsYXNzIFJlZHJhd2FibGVEaXJlY3RpdmUgaW1wbGVtZW50cyBJUmVkcmF3YWJsZUNvbXBvbmVudCB7XG4gICAgcmVkcmF3OiBGdW5jdGlvbjtcbiAgICBjb25zdHJ1Y3RvcihAU2VsZigpIEBJbmplY3QoV2lkZ2V0UmVmKSB3aWRnZXQpIHtcbiAgICAgICAgdGhpcy5yZWRyYXcgPSAoKSA9PiB3aWRnZXQucmVkcmF3KCk7XG4gICAgfVxufVxuIl19