import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';
export const registerProps = () => {
    register('wm-table-action', new Map([
        ['accessroles', PROP_STRING],
        ['action', PROP_STRING],
        ['caption', PROP_STRING],
        ['class', PROP_STRING],
        ['conditionalclass', PROP_ANY],
        ['conditionalstyle', PROP_ANY],
        ['disabled', Object.assign({ value: false }, PROP_BOOLEAN)],
        ['display-name', PROP_STRING],
        ['hyperlink', PROP_STRING],
        ['icon', PROP_STRING],
        ['iconclass', PROP_STRING],
        ['key', PROP_STRING],
        ['position', Object.assign({ value: 'footer' }, PROP_STRING)],
        ['shortcutkey', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['tabindex', Object.assign({ value: 0 }, PROP_NUMBER)],
        ['title', PROP_STRING],
        ['target', PROP_STRING],
        ['widget-type', Object.assign({ value: 'button' }, PROP_STRING)]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtYWN0aW9uLnByb3BzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90YWJsZS90YWJsZS1hY3Rpb24vdGFibGUtYWN0aW9uLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFN0csTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLEdBQUcsRUFBRTtJQUM5QixRQUFRLENBQ0osaUJBQWlCLEVBQ2pCLElBQUksR0FBRyxDQUNIO1FBQ0ksQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDO1FBQzVCLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQztRQUN2QixDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7UUFDeEIsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDO1FBQ3RCLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDO1FBQzlCLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDO1FBQzlCLENBQUMsVUFBVSxrQkFBRyxLQUFLLEVBQUUsS0FBSyxJQUFLLFlBQVksRUFBRTtRQUM3QyxDQUFDLGNBQWMsRUFBRSxXQUFXLENBQUM7UUFDN0IsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDO1FBQzFCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQztRQUNyQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7UUFDMUIsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDO1FBQ3BCLENBQUMsVUFBVSxrQkFBRyxLQUFLLEVBQUUsUUFBUSxJQUFLLFdBQVcsRUFBRTtRQUMvQyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUM7UUFDNUIsQ0FBQyxNQUFNLGtCQUFHLEtBQUssRUFBRSxJQUFJLElBQUssWUFBWSxFQUFFO1FBQ3hDLENBQUMsVUFBVSxrQkFBRyxLQUFLLEVBQUUsQ0FBQyxJQUFLLFdBQVcsRUFBRTtRQUN4QyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7UUFDdEIsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDO1FBQ3ZCLENBQUMsYUFBYSxrQkFBRyxLQUFLLEVBQUUsUUFBUSxJQUFLLFdBQVcsRUFBRTtLQUNyRCxDQUNKLENBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBST1BfQU5ZLCBQUk9QX0JPT0xFQU4sIFBST1BfTlVNQkVSLCBQUk9QX1NUUklORywgcmVnaXN0ZXIgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvd2lkZ2V0LXByb3BzJztcblxuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyUHJvcHMgPSAoKSA9PiB7XG4gICAgcmVnaXN0ZXIoXG4gICAgICAgICd3bS10YWJsZS1hY3Rpb24nLFxuICAgICAgICBuZXcgTWFwKFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFsnYWNjZXNzcm9sZXMnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydhY3Rpb24nLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydjYXB0aW9uJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnY2xhc3MnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydjb25kaXRpb25hbGNsYXNzJywgUFJPUF9BTlldLFxuICAgICAgICAgICAgICAgIFsnY29uZGl0aW9uYWxzdHlsZScsIFBST1BfQU5ZXSxcbiAgICAgICAgICAgICAgICBbJ2Rpc2FibGVkJywge3ZhbHVlOiBmYWxzZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgICAgICAgICAgWydkaXNwbGF5LW5hbWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydoeXBlcmxpbmsnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydpY29uJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaWNvbmNsYXNzJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsna2V5JywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsncG9zaXRpb24nLCB7dmFsdWU6ICdmb290ZXInLCAuLi5QUk9QX1NUUklOR31dLFxuICAgICAgICAgICAgICAgIFsnc2hvcnRjdXRrZXknLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydzaG93Jywge3ZhbHVlOiB0cnVlLCAuLi5QUk9QX0JPT0xFQU59XSxcbiAgICAgICAgICAgICAgICBbJ3RhYmluZGV4Jywge3ZhbHVlOiAwLCAuLi5QUk9QX05VTUJFUn1dLFxuICAgICAgICAgICAgICAgIFsndGl0bGUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWyd0YXJnZXQnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWyd3aWRnZXQtdHlwZScsIHt2YWx1ZTogJ2J1dHRvbicsIC4uLlBST1BfU1RSSU5HfV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgKVxuICAgICk7XG59O1xuIl19