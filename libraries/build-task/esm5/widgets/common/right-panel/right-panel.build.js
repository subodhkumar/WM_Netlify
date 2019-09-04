import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'aside';
register('wm-right-panel', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmRightPanel partialContainer data-role=\"page-right-panel\" role=\"complementary\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlnaHQtcGFuZWwuYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3JpZ2h0LXBhbmVsL3JpZ2h0LXBhbmVsLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUV4QixRQUFRLENBQUMsZ0JBQWdCLEVBQUU7SUFDdkIsT0FBTztRQUNILEdBQUcsRUFBRSxVQUFBLEtBQUssSUFBSSxPQUFBLE1BQUksT0FBTyw2RkFBb0YsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFHLEVBQXRILENBQXNIO1FBQ3BJLElBQUksRUFBRSxjQUFNLE9BQUEsT0FBSyxPQUFPLE1BQUcsRUFBZixDQUFlO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGdCQUFlLGNBQU8sQ0FBQyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IHRhZ05hbWUgPSAnYXNpZGUnO1xuXG5yZWdpc3Rlcignd20tcmlnaHQtcGFuZWwnLCAoKTogSUJ1aWxkVGFza0RlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJlOiBhdHRycyA9PiBgPCR7dGFnTmFtZX0gd21SaWdodFBhbmVsIHBhcnRpYWxDb250YWluZXIgZGF0YS1yb2xlPVwicGFnZS1yaWdodC1wYW5lbFwiIHJvbGU9XCJjb21wbGVtZW50YXJ5XCIgJHtnZXRBdHRyTWFya3VwKGF0dHJzKX0+YCxcbiAgICAgICAgcG9zdDogKCkgPT4gYDwvJHt0YWdOYW1lfT5gXG4gICAgfTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTtcbiJdfQ==