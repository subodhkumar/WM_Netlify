import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'div';
register('wm-tabs', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmTabs " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFicy5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFicy90YWJzLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztBQUV0QixRQUFRLENBQUMsU0FBUyxFQUFFO0lBQ2hCLE9BQU87UUFDSCxHQUFHLEVBQUUsVUFBQSxLQUFLLElBQUksT0FBQSxNQUFJLE9BQU8sZ0JBQVcsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFHLEVBQTdDLENBQTZDO1FBQzNELElBQUksRUFBRSxjQUFNLE9BQUEsT0FBSyxPQUFPLE1BQUcsRUFBZixDQUFlO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGdCQUFlLGNBQU8sQ0FBQyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IHRhZ05hbWUgPSAnZGl2JztcblxucmVnaXN0ZXIoJ3dtLXRhYnMnLCAoKTogSUJ1aWxkVGFza0RlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJlOiBhdHRycyA9PiBgPCR7dGFnTmFtZX0gd21UYWJzICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9PmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=