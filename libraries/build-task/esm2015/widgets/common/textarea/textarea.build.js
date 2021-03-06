import { getFormMarkupAttr, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';
const tagName = 'wm-textarea';
register('wm-textarea', () => {
    return {
        pre: attrs => `<${tagName} ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dGFyZWEuYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RleHRhcmVhL3RleHRhcmVhLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBaUIsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUxQyxNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUM7QUFFOUIsUUFBUSxDQUFDLGFBQWEsRUFBRSxHQUFrQixFQUFFO0lBQ3hDLE9BQU87UUFDSCxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUc7UUFDakYsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssT0FBTyxHQUFHO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGVBQWUsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0Rm9ybU1hcmt1cEF0dHIsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuaW1wb3J0IHsgZ2V0TmdNb2RlbEF0dHIgfSBmcm9tICdAd20vY29yZSc7XG5cbmNvbnN0IHRhZ05hbWUgPSAnd20tdGV4dGFyZWEnO1xuXG5yZWdpc3Rlcignd20tdGV4dGFyZWEnLCAoKTogSUJ1aWxkVGFza0RlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJlOiBhdHRycyA9PiBgPCR7dGFnTmFtZX0gJHtnZXRGb3JtTWFya3VwQXR0cihhdHRycyl9ICR7Z2V0TmdNb2RlbEF0dHIoYXR0cnMpfT5gLFxuICAgICAgICBwb3N0OiAoKSA9PiBgPC8ke3RhZ05hbWV9PmBcbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19