import { getAttrMarkup, register } from '@wm/transpiler';
const tagName = 'div';
register('wm-tree', () => {
    return {
        pre: attrs => `<${tagName} wmTree redrawable ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdHJlZS90cmVlLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztBQUV0QixRQUFRLENBQUMsU0FBUyxFQUFFLEdBQWtCLEVBQUU7SUFDcEMsT0FBTztRQUNILEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksT0FBTyxzQkFBc0IsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHO1FBQ3RFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLE9BQU8sR0FBRztLQUM5QixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxlQUFlLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEF0dHJNYXJrdXAsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuXG5jb25zdCB0YWdOYW1lID0gJ2Rpdic7XG5cbnJlZ2lzdGVyKCd3bS10cmVlJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtVHJlZSByZWRyYXdhYmxlICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9PmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=