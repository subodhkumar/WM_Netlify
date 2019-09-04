import { getAttrMarkup, register } from '@wm/transpiler';
const tagName = 'div';
register('wm-gridrow', () => {
    return {
        pre: attrs => `<${tagName} wmLayoutGridRow ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LWdyaWQtcm93LmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9sYXlvdXQtZ3JpZC9sYXlvdXQtZ3JpZC1yb3cvbGF5b3V0LWdyaWQtcm93LmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztBQUV0QixRQUFRLENBQUMsWUFBWSxFQUFFLEdBQWtCLEVBQUU7SUFDdkMsT0FBTztRQUNILEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksT0FBTyxvQkFBb0IsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHO1FBQ3BFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLE9BQU8sR0FBRztLQUM5QixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxlQUFlLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEF0dHJNYXJrdXAsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuXG5jb25zdCB0YWdOYW1lID0gJ2Rpdic7XG5cbnJlZ2lzdGVyKCd3bS1ncmlkcm93JywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtTGF5b3V0R3JpZFJvdyAke2dldEF0dHJNYXJrdXAoYXR0cnMpfT5gLFxuICAgICAgICBwb3N0OiAoKSA9PiBgPC8ke3RhZ05hbWV9PmBcbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19