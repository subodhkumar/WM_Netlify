import { getAttrMarkup, register } from '@wm/transpiler';
const tagName = 'p';
register('wm-message', () => {
    return {
        pre: attrs => `<${tagName} wmMessage aria-label="Notification Alerts" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbWVzc2FnZS9tZXNzYWdlLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQztBQUVwQixRQUFRLENBQUMsWUFBWSxFQUFFLEdBQWtCLEVBQUU7SUFDdkMsT0FBTztRQUNILEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksT0FBTywrQ0FBK0MsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHO1FBQy9GLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLE9BQU8sR0FBRztLQUM5QixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxlQUFlLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEF0dHJNYXJrdXAsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuXG5jb25zdCB0YWdOYW1lID0gJ3AnO1xuXG5yZWdpc3Rlcignd20tbWVzc2FnZScsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcmU6IGF0dHJzID0+IGA8JHt0YWdOYW1lfSB3bU1lc3NhZ2UgYXJpYS1sYWJlbD1cIk5vdGlmaWNhdGlvbiBBbGVydHNcIiAke2dldEF0dHJNYXJrdXAoYXR0cnMpfT5gLFxuICAgICAgICBwb3N0OiAoKSA9PiBgPC8ke3RhZ05hbWV9PmBcbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19