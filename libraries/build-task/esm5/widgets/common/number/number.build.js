import { getNgModelAttr } from '@wm/core';
import { getFormMarkupAttr, register } from '@wm/transpiler';
var tagName = 'div';
register('wm-number', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmNumber " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9udW1iZXIvbnVtYmVyLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFMUMsT0FBTyxFQUFFLGlCQUFpQixFQUFpQixRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1RSxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFFdEIsUUFBUSxDQUFDLFdBQVcsRUFBRTtJQUNsQixPQUFPO1FBQ0gsR0FBRyxFQUFFLFVBQUEsS0FBSyxJQUFJLE9BQUEsTUFBSSxPQUFPLGtCQUFhLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxTQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBRyxFQUE1RSxDQUE0RTtRQUMxRixJQUFJLEVBQUUsY0FBTSxPQUFBLE9BQUssT0FBTyxNQUFHLEVBQWYsQ0FBZTtLQUM5QixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxnQkFBZSxjQUFPLENBQUMsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldE5nTW9kZWxBdHRyIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBnZXRGb3JtTWFya3VwQXR0ciwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IHRhZ05hbWUgPSAnZGl2JztcblxucmVnaXN0ZXIoJ3dtLW51bWJlcicsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcmU6IGF0dHJzID0+IGA8JHt0YWdOYW1lfSB3bU51bWJlciAke2dldEZvcm1NYXJrdXBBdHRyKGF0dHJzKX0gJHtnZXROZ01vZGVsQXR0cihhdHRycyl9PmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=