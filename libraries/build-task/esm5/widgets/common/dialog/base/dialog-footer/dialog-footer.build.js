import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'div';
register('wm-dialogactions', function () {
    return {
        pre: function (attrs) { return "<ng-template #dialogFooter><" + tagName + " wmDialogFooter data-identfier=\"actions\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName + "></ng-template>"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWZvb3Rlci5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZGlhbG9nL2Jhc2UvZGlhbG9nLWZvb3Rlci9kaWFsb2ctZm9vdGVyLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztBQUV0QixRQUFRLENBQUMsa0JBQWtCLEVBQUU7SUFDekIsT0FBTztRQUNILEdBQUcsRUFBRSxVQUFBLEtBQUssSUFBSSxPQUFBLGlDQUErQixPQUFPLG1EQUE0QyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQUcsRUFBekcsQ0FBeUc7UUFDdkgsSUFBSSxFQUFFLGNBQU0sT0FBQSxPQUFLLE9BQU8sb0JBQWlCLEVBQTdCLENBQTZCO0tBQzVDLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGdCQUFlLGNBQU8sQ0FBQyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IHRhZ05hbWUgPSAnZGl2JztcblxucmVnaXN0ZXIoJ3dtLWRpYWxvZ2FjdGlvbnMnLCAoKTogSUJ1aWxkVGFza0RlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJlOiBhdHRycyA9PiBgPG5nLXRlbXBsYXRlICNkaWFsb2dGb290ZXI+PCR7dGFnTmFtZX0gd21EaWFsb2dGb290ZXIgZGF0YS1pZGVudGZpZXI9XCJhY3Rpb25zXCIgJHtnZXRBdHRyTWFya3VwKGF0dHJzKX0+YCxcbiAgICAgICAgcG9zdDogKCkgPT4gYDwvJHt0YWdOYW1lfT48L25nLXRlbXBsYXRlPmBcbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19