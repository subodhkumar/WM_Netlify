import { getAttrMarkup, register } from '@wm/transpiler';
const tagName = 'div';
register('wm-page-content', () => {
    return {
        pre: attrs => `<${tagName} wmPageContent wmSmoothscroll="${attrs.get('smoothscroll') || 'true'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS1jb250ZW50LmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9wYWdlLWNvbnRlbnQvcGFnZS1jb250ZW50LmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztBQUV0QixRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBa0IsRUFBRTtJQUM1QyxPQUFPO1FBQ0gsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxPQUFPLGtDQUFrQyxLQUFLLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLE1BQU0sS0FBSyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUc7UUFDMUgsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssT0FBTyxHQUFHO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGVBQWUsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IHRhZ05hbWUgPSAnZGl2JztcblxucmVnaXN0ZXIoJ3dtLXBhZ2UtY29udGVudCcsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcmU6IGF0dHJzID0+IGA8JHt0YWdOYW1lfSB3bVBhZ2VDb250ZW50IHdtU21vb3Roc2Nyb2xsPVwiJHthdHRycy5nZXQoJ3Ntb290aHNjcm9sbCcpIHx8ICd0cnVlJ31cIiAke2dldEF0dHJNYXJrdXAoYXR0cnMpfT5gLFxuICAgICAgICBwb3N0OiAoKSA9PiBgPC8ke3RhZ05hbWV9PmBcbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19