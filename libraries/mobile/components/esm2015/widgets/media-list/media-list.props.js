import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '@wm/components';
export const registerProps = () => {
    register('wm-media-list', new Map([
        ['class', PROP_STRING],
        ['dataset', PROP_ANY],
        ['layout', Object.assign({ value: 'Single-row' }, PROP_STRING)],
        ['mediaurl', PROP_STRING],
        ['name', PROP_STRING],
        ['offline', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['thumbnailheight', Object.assign({ value: '100pt' }, PROP_STRING)],
        ['thumbnailwidth', Object.assign({ value: '100pt' }, PROP_STRING)],
        ['thumbnailurl', PROP_STRING],
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtbGlzdC5wcm9wcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvbWVkaWEtbGlzdC9tZWRpYS1saXN0LnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvRSxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsR0FBRyxFQUFFO0lBQzlCLFFBQVEsQ0FDSixlQUFlLEVBQ2YsSUFBSSxHQUFHLENBQ0g7UUFDSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7UUFDdEIsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDO1FBQ3JCLENBQUMsUUFBUSxrQkFBRyxLQUFLLEVBQUUsWUFBWSxJQUFLLFdBQVcsRUFBRTtRQUNqRCxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUM7UUFDekIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDO1FBQ3JCLENBQUMsU0FBUyxrQkFBRyxLQUFLLEVBQUUsSUFBSSxJQUFLLFlBQVksRUFBRTtRQUMzQyxDQUFDLE1BQU0sa0JBQUcsS0FBSyxFQUFFLElBQUksSUFBSyxZQUFZLEVBQUU7UUFDeEMsQ0FBQyxpQkFBaUIsa0JBQUcsS0FBSyxFQUFFLE9BQU8sSUFBSyxXQUFXLEVBQUU7UUFDckQsQ0FBQyxnQkFBZ0Isa0JBQUcsS0FBSyxFQUFFLE9BQU8sSUFBSyxXQUFXLEVBQUU7UUFDcEQsQ0FBQyxjQUFjLEVBQUUsV0FBVyxDQUFDO0tBQ2hDLENBQ0osQ0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUFJPUF9BTlksIFBST1BfQk9PTEVBTiwgUFJPUF9TVFJJTkcsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5leHBvcnQgY29uc3QgcmVnaXN0ZXJQcm9wcyA9ICgpID0+IHtcbiAgICByZWdpc3RlcihcbiAgICAgICAgJ3dtLW1lZGlhLWxpc3QnLFxuICAgICAgICBuZXcgTWFwKFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFsnY2xhc3MnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydkYXRhc2V0JywgUFJPUF9BTlldLFxuICAgICAgICAgICAgICAgIFsnbGF5b3V0Jywge3ZhbHVlOiAnU2luZ2xlLXJvdycsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgICAgICAgICAgWydtZWRpYXVybCcsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ25hbWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydvZmZsaW5lJywge3ZhbHVlOiB0cnVlLCAuLi5QUk9QX0JPT0xFQU59XSxcbiAgICAgICAgICAgICAgICBbJ3Nob3cnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgICAgICAgICAgICAgIFsndGh1bWJuYWlsaGVpZ2h0Jywge3ZhbHVlOiAnMTAwcHQnLCAuLi5QUk9QX1NUUklOR31dLFxuICAgICAgICAgICAgICAgIFsndGh1bWJuYWlsd2lkdGgnLCB7dmFsdWU6ICcxMDBwdCcsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgICAgICAgICAgWyd0aHVtYm5haWx1cmwnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICBdXG4gICAgICAgIClcbiAgICApO1xufTtcbiJdfQ==