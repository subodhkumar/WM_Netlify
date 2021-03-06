import { getNgModelAttr } from '@wm/core';
import { getFormMarkupAttr, register } from '@wm/transpiler';
var tagName = 'div';
register('wm-switch', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmSwitch " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9zd2l0Y2gvc3dpdGNoLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDMUMsT0FBTyxFQUFFLGlCQUFpQixFQUFpQixRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1RSxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFFdEIsUUFBUSxDQUFDLFdBQVcsRUFBRTtJQUNsQixPQUFPO1FBQ0gsR0FBRyxFQUFFLFVBQUEsS0FBSyxJQUFJLE9BQUEsTUFBSSxPQUFPLGtCQUFhLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxTQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBRyxFQUE1RSxDQUE0RTtRQUMxRixJQUFJLEVBQUUsY0FBTSxPQUFBLE9BQUssT0FBTyxNQUFHLEVBQWYsQ0FBZTtLQUM5QixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxnQkFBZSxjQUFPLENBQUMsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldE5nTW9kZWxBdHRyIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgZ2V0Rm9ybU1hcmt1cEF0dHIsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuXG5jb25zdCB0YWdOYW1lID0gJ2Rpdic7XG5cbnJlZ2lzdGVyKCd3bS1zd2l0Y2gnLCAoKTogSUJ1aWxkVGFza0RlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJlOiBhdHRycyA9PiBgPCR7dGFnTmFtZX0gd21Td2l0Y2ggJHtnZXRGb3JtTWFya3VwQXR0cihhdHRycyl9ICR7Z2V0TmdNb2RlbEF0dHIoYXR0cnMpfT5gLFxuICAgICAgICBwb3N0OiAoKSA9PiBgPC8ke3RhZ05hbWV9PmBcbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19