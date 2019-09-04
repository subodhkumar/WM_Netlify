import { getAttrMarkup, getDataSource, register } from '@wm/transpiler';
const tagName = 'div';
register('wm-fileupload', () => {
    return {
        pre: attrs => {
            if (attrs.get('select.event')) {
                const onSelectBinding = getDataSource(attrs.get('select.event'));
                attrs.set('datasource.bind', onSelectBinding);
            }
            return `<${tagName} wmFileUpload ${getAttrMarkup(attrs)} role="input">`;
        },
        post: () => `</${tagName}>`
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS11cGxvYWQuYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2ZpbGUtdXBsb2FkL2ZpbGUtdXBsb2FkLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFpQixRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV2RixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFFdEIsUUFBUSxDQUFDLGVBQWUsRUFBRSxHQUFrQixFQUFFO0lBQzFDLE9BQU87UUFDSCxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDVCxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQzNCLE1BQU0sZUFBZSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pFLEtBQUssQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsZUFBZSxDQUFDLENBQUM7YUFDakQ7WUFDRCxPQUFPLElBQUksT0FBTyxpQkFBaUIsYUFBYSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztRQUM1RSxDQUFDO1FBQ0QsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssT0FBTyxHQUFHO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGVBQWUsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgZ2V0RGF0YVNvdXJjZSwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IHRhZ05hbWUgPSAnZGl2JztcblxucmVnaXN0ZXIoJ3dtLWZpbGV1cGxvYWQnLCAoKTogSUJ1aWxkVGFza0RlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJlOiBhdHRycyA9PiB7XG4gICAgICAgICAgICBpZiAoYXR0cnMuZ2V0KCdzZWxlY3QuZXZlbnQnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uU2VsZWN0QmluZGluZyA9IGdldERhdGFTb3VyY2UoYXR0cnMuZ2V0KCdzZWxlY3QuZXZlbnQnKSk7XG4gICAgICAgICAgICAgICAgYXR0cnMuc2V0KCdkYXRhc291cmNlLmJpbmQnLCBvblNlbGVjdEJpbmRpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGA8JHt0YWdOYW1lfSB3bUZpbGVVcGxvYWQgJHtnZXRBdHRyTWFya3VwKGF0dHJzKX0gcm9sZT1cImlucHV0XCI+YDtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zdDogKCkgPT4gYDwvJHt0YWdOYW1lfT5gXG4gICAgfTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTtcbiJdfQ==