import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'img';
register('wm-picture', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmPicture alt=\"image\" wmImageCache=\"" + (attrs.get('offline') || 'true') + "\" " + getAttrMarkup(attrs) + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGljdHVyZS5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vcGljdHVyZS9waWN0dXJlLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztBQUV0QixRQUFRLENBQUMsWUFBWSxFQUFFO0lBQ25CLE9BQU87UUFDSCxHQUFHLEVBQUUsVUFBQSxLQUFLLElBQUksT0FBQSxNQUFJLE9BQU8saURBQXdDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksTUFBTSxZQUFLLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBRyxFQUE3RyxDQUE2RztLQUM5SCxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxnQkFBZSxjQUFPLENBQUMsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEF0dHJNYXJrdXAsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuXG5jb25zdCB0YWdOYW1lID0gJ2ltZyc7XG5cbnJlZ2lzdGVyKCd3bS1waWN0dXJlJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtUGljdHVyZSBhbHQ9XCJpbWFnZVwiIHdtSW1hZ2VDYWNoZT1cIiR7YXR0cnMuZ2V0KCdvZmZsaW5lJykgfHwgJ3RydWUnfVwiICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9PmBcbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19