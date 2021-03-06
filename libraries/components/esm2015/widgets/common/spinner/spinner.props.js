import { PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';
export const registerProps = () => {
    register('wm-spinner', new Map([
        ['animation', { value: 'spin', PROP_STRING }],
        ['caption', Object.assign({ value: 'Loading...' }, PROP_STRING)],
        ['class', PROP_STRING],
        ['iconclass', Object.assign({ value: 'fa fa-circle-o-notch fa-spin' }, PROP_STRING)],
        ['iconsize', PROP_STRING],
        ['image', PROP_STRING],
        ['imageheight', PROP_STRING],
        ['imagewidth', Object.assign({ value: '20px' }, PROP_STRING)],
        ['name', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['type', Object.assign({ value: 'icon' }, PROP_STRING)],
        ['servicevariabletotrack', PROP_STRING]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Bpbm5lci5wcm9wcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vc3Bpbm5lci9zcGlubmVyLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRW5GLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxHQUFHLEVBQUU7SUFDOUIsUUFBUSxDQUNKLFlBQVksRUFDWixJQUFJLEdBQUcsQ0FDSDtRQUNJLENBQUMsV0FBVyxFQUFFLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUMsQ0FBQztRQUMzQyxDQUFDLFNBQVMsa0JBQUcsS0FBSyxFQUFFLFlBQVksSUFBSyxXQUFXLEVBQUU7UUFDbEQsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDO1FBQ3RCLENBQUMsV0FBVyxrQkFBRyxLQUFLLEVBQUUsOEJBQThCLElBQUssV0FBVyxFQUFFO1FBQ3RFLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQztRQUN6QixDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7UUFDdEIsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDO1FBQzVCLENBQUMsWUFBWSxrQkFBRyxLQUFLLEVBQUUsTUFBTSxJQUFLLFdBQVcsRUFBRTtRQUMvQyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7UUFDckIsQ0FBQyxNQUFNLGtCQUFHLEtBQUssRUFBRSxJQUFJLElBQUssWUFBWSxFQUFFO1FBQ3hDLENBQUMsTUFBTSxrQkFBRyxLQUFLLEVBQUUsTUFBTSxJQUFLLFdBQVcsRUFBRTtRQUN6QyxDQUFDLHdCQUF3QixFQUFFLFdBQVcsQ0FBQztLQUMxQyxDQUNKLENBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBST1BfQk9PTEVBTiwgUFJPUF9TVFJJTkcsIHJlZ2lzdGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1wcm9wcyc7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIHJlZ2lzdGVyKFxuICAgICAgICAnd20tc3Bpbm5lcicsXG4gICAgICAgIG5ldyBNYXAoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgWydhbmltYXRpb24nLCB7dmFsdWU6ICdzcGluJywgUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ2NhcHRpb24nLCB7dmFsdWU6ICdMb2FkaW5nLi4uJywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ2NsYXNzJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaWNvbmNsYXNzJywge3ZhbHVlOiAnZmEgZmEtY2lyY2xlLW8tbm90Y2ggZmEtc3BpbicsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgICAgICAgICAgWydpY29uc2l6ZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2ltYWdlJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaW1hZ2VoZWlnaHQnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydpbWFnZXdpZHRoJywge3ZhbHVlOiAnMjBweCcsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgICAgICAgICAgWyduYW1lJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnc2hvdycsIHt2YWx1ZTogdHJ1ZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgICAgICAgICAgWyd0eXBlJywge3ZhbHVlOiAnaWNvbicsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgICAgICAgICAgWydzZXJ2aWNldmFyaWFibGV0b3RyYWNrJywgUFJPUF9TVFJJTkddXG4gICAgICAgICAgICBdXG4gICAgICAgIClcbiAgICApO1xufTtcbiJdfQ==