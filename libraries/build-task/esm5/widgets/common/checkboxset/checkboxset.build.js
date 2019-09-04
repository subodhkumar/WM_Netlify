import { getFormMarkupAttr, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';
var tagName = 'ul';
register('wm-checkboxset', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmCheckboxset " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3hzZXQuYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2NoZWNrYm94c2V0L2NoZWNrYm94c2V0LmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBaUIsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUxQyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFFckIsUUFBUSxDQUFDLGdCQUFnQixFQUFFO0lBQ3ZCLE9BQU87UUFDSCxHQUFHLEVBQUUsVUFBQSxLQUFLLElBQUksT0FBQSxNQUFJLE9BQU8sdUJBQWtCLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxTQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBRyxFQUFqRixDQUFpRjtRQUMvRixJQUFJLEVBQUUsY0FBTSxPQUFBLE9BQUssT0FBTyxNQUFHLEVBQWYsQ0FBZTtLQUM5QixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxnQkFBZSxjQUFPLENBQUMsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEZvcm1NYXJrdXBBdHRyLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcbmltcG9ydCB7IGdldE5nTW9kZWxBdHRyIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5jb25zdCB0YWdOYW1lID0gJ3VsJztcblxucmVnaXN0ZXIoJ3dtLWNoZWNrYm94c2V0JywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtQ2hlY2tib3hzZXQgJHtnZXRGb3JtTWFya3VwQXR0cihhdHRycyl9ICR7Z2V0TmdNb2RlbEF0dHIoYXR0cnMpfT5gLFxuICAgICAgICBwb3N0OiAoKSA9PiBgPC8ke3RhZ05hbWV9PmBcbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19