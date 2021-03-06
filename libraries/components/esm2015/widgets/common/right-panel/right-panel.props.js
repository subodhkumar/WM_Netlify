import { PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';
export const registerProps = () => {
    register('wm-right-panel', new Map([
        ['class', PROP_STRING],
        ['columnwidth', PROP_NUMBER],
        ['content', PROP_STRING],
        ['name', PROP_STRING]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlnaHQtcGFuZWwucHJvcHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3JpZ2h0LXBhbmVsL3JpZ2h0LXBhbmVsLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRWxGLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxHQUFHLEVBQUU7SUFDOUIsUUFBUSxDQUNKLGdCQUFnQixFQUNoQixJQUFJLEdBQUcsQ0FDSDtRQUNJLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztRQUN0QixDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUM7UUFDNUIsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDO1FBQ3hCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQztLQUN4QixDQUNKLENBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBST1BfTlVNQkVSLCBQUk9QX1NUUklORywgcmVnaXN0ZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvd2lkZ2V0LXByb3BzJztcblxuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyUHJvcHMgPSAoKSA9PiB7XG4gICAgcmVnaXN0ZXIoXG4gICAgICAgICd3bS1yaWdodC1wYW5lbCcsXG4gICAgICAgIG5ldyBNYXAoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgWydjbGFzcycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2NvbHVtbndpZHRoJywgUFJPUF9OVU1CRVJdLFxuICAgICAgICAgICAgICAgIFsnY29udGVudCcsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ25hbWUnLCBQUk9QX1NUUklOR11cbiAgICAgICAgICAgIF1cbiAgICAgICAgKVxuICAgICk7XG59O1xuIl19