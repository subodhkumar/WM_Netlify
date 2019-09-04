import { getFormMarkupAttr, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';
var tagName = 'div';
register('wm-date', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmDate " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZGF0ZS9kYXRlLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBaUIsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUxQyxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFFdEIsUUFBUSxDQUFDLFNBQVMsRUFBRTtJQUNoQixPQUFPO1FBQ0gsR0FBRyxFQUFFLFVBQUEsS0FBSyxJQUFJLE9BQUEsTUFBSSxPQUFPLGdCQUFXLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxTQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBRyxFQUExRSxDQUEwRTtRQUN4RixJQUFJLEVBQUUsY0FBTSxPQUFBLE9BQUssT0FBTyxNQUFHLEVBQWYsQ0FBZTtLQUM5QixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxnQkFBZSxjQUFPLENBQUMsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEZvcm1NYXJrdXBBdHRyLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcbmltcG9ydCB7IGdldE5nTW9kZWxBdHRyIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5jb25zdCB0YWdOYW1lID0gJ2Rpdic7XG5cbnJlZ2lzdGVyKCd3bS1kYXRlJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtRGF0ZSAke2dldEZvcm1NYXJrdXBBdHRyKGF0dHJzKX0gJHtnZXROZ01vZGVsQXR0cihhdHRycyl9PmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=