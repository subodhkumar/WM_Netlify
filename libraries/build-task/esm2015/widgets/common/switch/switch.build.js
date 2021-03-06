import { getNgModelAttr } from '@wm/core';
import { getFormMarkupAttr, register } from '@wm/transpiler';
const tagName = 'div';
register('wm-switch', () => {
    return {
        pre: attrs => `<${tagName} wmSwitch ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9zd2l0Y2gvc3dpdGNoLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDMUMsT0FBTyxFQUFFLGlCQUFpQixFQUFpQixRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1RSxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFFdEIsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFrQixFQUFFO0lBQ3RDLE9BQU87UUFDSCxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLE9BQU8sYUFBYSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUc7UUFDMUYsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssT0FBTyxHQUFHO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGVBQWUsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0TmdNb2RlbEF0dHIgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBnZXRGb3JtTWFya3VwQXR0ciwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IHRhZ05hbWUgPSAnZGl2JztcblxucmVnaXN0ZXIoJ3dtLXN3aXRjaCcsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcmU6IGF0dHJzID0+IGA8JHt0YWdOYW1lfSB3bVN3aXRjaCAke2dldEZvcm1NYXJrdXBBdHRyKGF0dHJzKX0gJHtnZXROZ01vZGVsQXR0cihhdHRycyl9PmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=