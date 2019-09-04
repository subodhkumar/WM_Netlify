import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'div';
register('wm-widget-template', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmWidgetTemplate " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0LXRlbXBsYXRlLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy93aWRnZXQtdGVtcGxhdGUvd2lkZ2V0LXRlbXBsYXRlLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztBQUV0QixRQUFRLENBQUMsb0JBQW9CLEVBQUU7SUFDM0IsT0FBTztRQUNILEdBQUcsRUFBRSxVQUFBLEtBQUssSUFBSSxPQUFBLE1BQUksT0FBTywwQkFBcUIsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFHLEVBQXZELENBQXVEO1FBQ3JFLElBQUksRUFBRSxjQUFNLE9BQUEsT0FBSyxPQUFPLE1BQUcsRUFBZixDQUFlO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGdCQUFlLGNBQU8sQ0FBQyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IHRhZ05hbWUgPSAnZGl2JztcblxucmVnaXN0ZXIoJ3dtLXdpZGdldC10ZW1wbGF0ZScsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcmU6IGF0dHJzID0+IGA8JHt0YWdOYW1lfSB3bVdpZGdldFRlbXBsYXRlICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9PmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=