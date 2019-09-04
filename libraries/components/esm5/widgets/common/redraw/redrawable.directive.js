import { Directive, Inject, Self } from '@angular/core';
import { WidgetRef } from '../../framework/types';
var RedrawableDirective = /** @class */ (function () {
    function RedrawableDirective(widget) {
        this.redraw = function () { return widget.redraw(); };
    }
    RedrawableDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[redrawable]'
                },] }
    ];
    /** @nocollapse */
    RedrawableDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] }
    ]; };
    return RedrawableDirective;
}());
export { RedrawableDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkcmF3YWJsZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3JlZHJhdy9yZWRyYXdhYmxlLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFeEQsT0FBTyxFQUF3QixTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RTtJQUtJLDZCQUF1QyxNQUFNO1FBQ3pDLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBTSxPQUFBLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBZixDQUFlLENBQUM7SUFDeEMsQ0FBQzs7Z0JBUEosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxjQUFjO2lCQUMzQjs7OztnREFHZ0IsSUFBSSxZQUFJLE1BQU0sU0FBQyxTQUFTOztJQUd6QywwQkFBQztDQUFBLEFBUkQsSUFRQztTQUxZLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSW5qZWN0LCBTZWxmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IElSZWRyYXdhYmxlQ29tcG9uZW50LCBXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1tyZWRyYXdhYmxlXSdcbn0pXG5leHBvcnQgY2xhc3MgUmVkcmF3YWJsZURpcmVjdGl2ZSBpbXBsZW1lbnRzIElSZWRyYXdhYmxlQ29tcG9uZW50IHtcbiAgICByZWRyYXc6IEZ1bmN0aW9uO1xuICAgIGNvbnN0cnVjdG9yKEBTZWxmKCkgQEluamVjdChXaWRnZXRSZWYpIHdpZGdldCkge1xuICAgICAgICB0aGlzLnJlZHJhdyA9ICgpID0+IHdpZGdldC5yZWRyYXcoKTtcbiAgICB9XG59XG4iXX0=