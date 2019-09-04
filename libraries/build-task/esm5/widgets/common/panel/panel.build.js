import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'div';
register('wm-panel', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmPanel partialContainer aria-label=\"panel\" wm-navigable-element=\"true\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
register('wm-panel-footer', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmPanelFooter aria-label=\"panel footer\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZWwuYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3BhbmVsL3BhbmVsLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztBQUV0QixRQUFRLENBQUMsVUFBVSxFQUFFO0lBQ2pCLE9BQU87UUFDSCxHQUFHLEVBQUUsVUFBQSxLQUFLLElBQUksT0FBQSxNQUFJLE9BQU8scUZBQTRFLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBRyxFQUE5RyxDQUE4RztRQUM1SCxJQUFJLEVBQUUsY0FBTSxPQUFBLE9BQUssT0FBTyxNQUFHLEVBQWYsQ0FBZTtLQUM5QixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxRQUFRLENBQUMsaUJBQWlCLEVBQUU7SUFDeEIsT0FBTztRQUNILEdBQUcsRUFBRSxVQUFBLEtBQUssSUFBSSxPQUFBLE1BQUksT0FBTyxtREFBNEMsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFHLEVBQTlFLENBQThFO1FBQzVGLElBQUksRUFBRSxjQUFNLE9BQUEsT0FBSyxPQUFPLE1BQUcsRUFBZixDQUFlO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGdCQUFlLGNBQU8sQ0FBQyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IHRhZ05hbWUgPSAnZGl2JztcblxucmVnaXN0ZXIoJ3dtLXBhbmVsJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtUGFuZWwgcGFydGlhbENvbnRhaW5lciBhcmlhLWxhYmVsPVwicGFuZWxcIiB3bS1uYXZpZ2FibGUtZWxlbWVudD1cInRydWVcIiAke2dldEF0dHJNYXJrdXAoYXR0cnMpfT5gLFxuICAgICAgICBwb3N0OiAoKSA9PiBgPC8ke3RhZ05hbWV9PmBcbiAgICB9O1xufSk7XG5cbnJlZ2lzdGVyKCd3bS1wYW5lbC1mb290ZXInLCAoKTogSUJ1aWxkVGFza0RlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJlOiBhdHRycyA9PiBgPCR7dGFnTmFtZX0gd21QYW5lbEZvb3RlciBhcmlhLWxhYmVsPVwicGFuZWwgZm9vdGVyXCIgJHtnZXRBdHRyTWFya3VwKGF0dHJzKX0+YCxcbiAgICAgICAgcG9zdDogKCkgPT4gYDwvJHt0YWdOYW1lfT5gXG4gICAgfTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTtcbiJdfQ==