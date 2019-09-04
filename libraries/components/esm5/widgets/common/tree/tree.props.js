import * as tslib_1 from "tslib";
import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';
export var registerProps = function () {
    register('wm-tree', new Map([
        ['class', PROP_STRING],
        ['dataset', tslib_1.__assign({ value: 'node1, node2, node3' }, PROP_ANY)],
        ['datavalue', PROP_STRING],
        ['levels', tslib_1.__assign({ value: 0 }, PROP_NUMBER)],
        ['name', PROP_STRING],
        ['nodeaction', PROP_STRING],
        ['nodechildren', PROP_STRING],
        ['nodeclick', tslib_1.__assign({ value: 'none' }, PROP_STRING)],
        ['nodeicon', PROP_STRING],
        ['nodeid', PROP_STRING],
        ['nodelabel', PROP_STRING],
        ['orderby', PROP_STRING],
        ['show', tslib_1.__assign({ value: true }, PROP_BOOLEAN)],
        ['tabindex', tslib_1.__assign({ value: 0 }, PROP_NUMBER)],
        ['treeicons', PROP_STRING]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5wcm9wcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdHJlZS90cmVlLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTFHLE1BQU0sQ0FBQyxJQUFNLGFBQWEsR0FBRztJQUN6QixRQUFRLENBQ0osU0FBUyxFQUNULElBQUksR0FBRyxDQUNIO1FBQ0ksQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDO1FBQ3RCLENBQUMsU0FBUyxxQkFBRyxLQUFLLEVBQUUscUJBQXFCLElBQUssUUFBUSxFQUFFO1FBQ3hELENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQztRQUMxQixDQUFDLFFBQVEscUJBQUcsS0FBSyxFQUFFLENBQUMsSUFBSyxXQUFXLEVBQUU7UUFDdEMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDO1FBQ3JCLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQztRQUMzQixDQUFDLGNBQWMsRUFBRSxXQUFXLENBQUM7UUFDN0IsQ0FBQyxXQUFXLHFCQUFHLEtBQUssRUFBRSxNQUFNLElBQUssV0FBVyxFQUFFO1FBQzlDLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQztRQUN6QixDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUM7UUFDdkIsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDO1FBQzFCLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQztRQUN4QixDQUFDLE1BQU0scUJBQUcsS0FBSyxFQUFFLElBQUksSUFBSyxZQUFZLEVBQUU7UUFDeEMsQ0FBQyxVQUFVLHFCQUFHLEtBQUssRUFBRSxDQUFDLElBQUssV0FBVyxFQUFFO1FBQ3hDLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQztLQUM3QixDQUNKLENBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBST1BfQU5ZLCBQUk9QX0JPT0xFQU4sIFBST1BfTlVNQkVSLCBQUk9QX1NUUklORywgcmVnaXN0ZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvd2lkZ2V0LXByb3BzJztcblxuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyUHJvcHMgPSAoKSA9PiB7XG4gICAgcmVnaXN0ZXIoXG4gICAgICAgICd3bS10cmVlJyxcbiAgICAgICAgbmV3IE1hcChcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBbJ2NsYXNzJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnZGF0YXNldCcsIHt2YWx1ZTogJ25vZGUxLCBub2RlMiwgbm9kZTMnLCAuLi5QUk9QX0FOWX1dLFxuICAgICAgICAgICAgICAgIFsnZGF0YXZhbHVlJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnbGV2ZWxzJywge3ZhbHVlOiAwLCAuLi5QUk9QX05VTUJFUn1dLFxuICAgICAgICAgICAgICAgIFsnbmFtZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ25vZGVhY3Rpb24nLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydub2RlY2hpbGRyZW4nLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydub2RlY2xpY2snLCB7dmFsdWU6ICdub25lJywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ25vZGVpY29uJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnbm9kZWlkJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnbm9kZWxhYmVsJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnb3JkZXJieScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ3Nob3cnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgICAgICAgICAgICAgIFsndGFiaW5kZXgnLCB7dmFsdWU6IDAsIC4uLlBST1BfTlVNQkVSfV0sXG4gICAgICAgICAgICAgICAgWyd0cmVlaWNvbnMnLCBQUk9QX1NUUklOR11cbiAgICAgICAgICAgIF1cbiAgICAgICAgKVxuICAgICk7XG59O1xuIl19