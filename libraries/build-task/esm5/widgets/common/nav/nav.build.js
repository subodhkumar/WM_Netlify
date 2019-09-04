import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'ul';
register('wm-nav', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmNav data-element-type=\"wmNav\" data-role=\"page-header\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2LmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9uYXYvbmF2LmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQztBQUVyQixRQUFRLENBQUMsUUFBUSxFQUFFO0lBQ2YsT0FBTztRQUNILEdBQUcsRUFBRSxVQUFBLEtBQUssSUFBSSxPQUFBLE1BQUksT0FBTyxxRUFBNEQsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFHLEVBQTlGLENBQThGO1FBQzVHLElBQUksRUFBRSxjQUFNLE9BQUEsT0FBSyxPQUFPLE1BQUcsRUFBZixDQUFlO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGdCQUFlLGNBQU8sQ0FBQyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IHRhZ05hbWUgPSAndWwnO1xuXG5yZWdpc3Rlcignd20tbmF2JywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtTmF2IGRhdGEtZWxlbWVudC10eXBlPVwid21OYXZcIiBkYXRhLXJvbGU9XCJwYWdlLWhlYWRlclwiICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9PmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=