import { PROP_BOOLEAN, PROP_STRING, register } from '@wm/components';
export const registerProps = () => {
    register('wm-segmented-control', new Map([
        ['class', PROP_STRING],
        ['name', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VnbWVudGVkLWNvbnRyb2wucHJvcHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL3NlZ21lbnRlZC1jb250cm9sL3NlZ21lbnRlZC1jb250cm9sLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXJFLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxHQUFHLEVBQUU7SUFDOUIsUUFBUSxDQUNKLHNCQUFzQixFQUN0QixJQUFJLEdBQUcsQ0FDSDtRQUNJLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztRQUN0QixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7UUFDckIsQ0FBQyxNQUFNLGtCQUFHLEtBQUssRUFBRSxJQUFJLElBQUssWUFBWSxFQUFFO0tBQzNDLENBQ0osQ0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUFJPUF9CT09MRUFOLCBQUk9QX1NUUklORywgcmVnaXN0ZXIgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIHJlZ2lzdGVyKFxuICAgICAgICAnd20tc2VnbWVudGVkLWNvbnRyb2wnLFxuICAgICAgICBuZXcgTWFwKFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFsnY2xhc3MnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWyduYW1lJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnc2hvdycsIHt2YWx1ZTogdHJ1ZSwgLi4uUFJPUF9CT09MRUFOfV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgKVxuICAgICk7XG59O1xuIl19