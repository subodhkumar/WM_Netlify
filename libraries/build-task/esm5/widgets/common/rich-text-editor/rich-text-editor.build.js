import { getFormMarkupAttr, register } from '@wm/transpiler';
var tagName = 'div';
register('wm-richtexteditor', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmRichTextEditor role=\"textbox\" " + getFormMarkupAttr(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmljaC10ZXh0LWVkaXRvci5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vcmljaC10ZXh0LWVkaXRvci9yaWNoLXRleHQtZWRpdG9yLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBaUIsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFNUUsSUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBRXRCLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTtJQUMxQixPQUFPO1FBQ0gsR0FBRyxFQUFFLFVBQUEsS0FBSyxJQUFJLE9BQUEsTUFBSSxPQUFPLDJDQUFvQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsTUFBRyxFQUExRSxDQUEwRTtRQUN4RixJQUFJLEVBQUUsY0FBTSxPQUFBLE9BQUssT0FBTyxNQUFHLEVBQWYsQ0FBZTtLQUM5QixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxnQkFBZSxjQUFPLENBQUMsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEZvcm1NYXJrdXBBdHRyLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcblxuY29uc3QgdGFnTmFtZSA9ICdkaXYnO1xuXG5yZWdpc3Rlcignd20tcmljaHRleHRlZGl0b3InLCAoKTogSUJ1aWxkVGFza0RlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJlOiBhdHRycyA9PiBgPCR7dGFnTmFtZX0gd21SaWNoVGV4dEVkaXRvciByb2xlPVwidGV4dGJveFwiICR7Z2V0Rm9ybU1hcmt1cEF0dHIoYXR0cnMpfT5gLFxuICAgICAgICBwb3N0OiAoKSA9PiBgPC8ke3RhZ05hbWV9PmBcbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19