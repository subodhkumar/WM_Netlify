import * as tslib_1 from "tslib";
import { PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';
export var registerProps = function () {
    register('wm-message', new Map([
        ['caption', tslib_1.__assign({ value: 'Message' }, PROP_STRING)],
        ['class', PROP_STRING],
        ['hideclose', tslib_1.__assign({ value: false }, PROP_BOOLEAN)],
        ['name', PROP_STRING],
        ['show', tslib_1.__assign({ value: true }, PROP_BOOLEAN)],
        ['type', tslib_1.__assign({ value: 'success' }, PROP_STRING)],
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5wcm9wcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbWVzc2FnZS9tZXNzYWdlLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUVuRixNQUFNLENBQUMsSUFBTSxhQUFhLEdBQUc7SUFDekIsUUFBUSxDQUNKLFlBQVksRUFDWixJQUFJLEdBQUcsQ0FDSDtRQUNJLENBQUMsU0FBUyxxQkFBRyxLQUFLLEVBQUUsU0FBUyxJQUFLLFdBQVcsRUFBRTtRQUMvQyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7UUFDdEIsQ0FBQyxXQUFXLHFCQUFHLEtBQUssRUFBRSxLQUFLLElBQUssWUFBWSxFQUFFO1FBQzlDLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQztRQUNyQixDQUFDLE1BQU0scUJBQUcsS0FBSyxFQUFFLElBQUksSUFBSyxZQUFZLEVBQUU7UUFDeEMsQ0FBQyxNQUFNLHFCQUFHLEtBQUssRUFBRSxTQUFTLElBQUssV0FBVyxFQUFFO0tBQy9DLENBQ0osQ0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUFJPUF9CT09MRUFOLCBQUk9QX1NUUklORywgcmVnaXN0ZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvd2lkZ2V0LXByb3BzJztcblxuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyUHJvcHMgPSAoKSA9PiB7XG4gICAgcmVnaXN0ZXIoXG4gICAgICAgICd3bS1tZXNzYWdlJyxcbiAgICAgICAgbmV3IE1hcChcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBbJ2NhcHRpb24nLCB7dmFsdWU6ICdNZXNzYWdlJywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ2NsYXNzJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaGlkZWNsb3NlJywge3ZhbHVlOiBmYWxzZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgICAgICAgICAgWyduYW1lJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnc2hvdycsIHt2YWx1ZTogdHJ1ZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgICAgICAgICAgWyd0eXBlJywge3ZhbHVlOiAnc3VjY2VzcycsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgICAgICBdXG4gICAgICAgIClcbiAgICApO1xufTtcbiJdfQ==