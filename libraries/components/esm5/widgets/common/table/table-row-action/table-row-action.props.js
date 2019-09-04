import * as tslib_1 from "tslib";
import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';
export var registerProps = function () {
    register('wm-table-row-action', new Map([
        ['accessroles', PROP_STRING],
        ['action', PROP_STRING],
        ['caption', PROP_STRING],
        ['class ', tslib_1.__assign({ value: 'btn-secondary' }, PROP_STRING)],
        ['disabled', tslib_1.__assign({ value: false }, PROP_BOOLEAN)],
        ['display-name', PROP_STRING],
        ['hyperlink', PROP_STRING],
        ['iconclass', PROP_STRING],
        ['key', PROP_STRING],
        ['show', tslib_1.__assign({ value: true }, PROP_BOOLEAN)],
        ['tabindex', tslib_1.__assign({ value: 0 }, PROP_NUMBER)],
        ['target', PROP_STRING],
        ['title', PROP_STRING],
        ['widget-type', tslib_1.__assign({ value: 'button' }, PROP_STRING)]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtcm93LWFjdGlvbi5wcm9wcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFibGUvdGFibGUtcm93LWFjdGlvbi90YWJsZS1yb3ctYWN0aW9uLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFbkcsTUFBTSxDQUFDLElBQU0sYUFBYSxHQUFHO0lBQ3pCLFFBQVEsQ0FDSixxQkFBcUIsRUFDckIsSUFBSSxHQUFHLENBQ0g7UUFDSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUM7UUFDNUIsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDO1FBQ3ZCLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQztRQUN4QixDQUFDLFFBQVEscUJBQUcsS0FBSyxFQUFFLGVBQWUsSUFBSyxXQUFXLEVBQUU7UUFDcEQsQ0FBQyxVQUFVLHFCQUFHLEtBQUssRUFBRSxLQUFLLElBQUssWUFBWSxFQUFFO1FBQzdDLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQztRQUM3QixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7UUFDMUIsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDO1FBQzFCLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQztRQUNwQixDQUFDLE1BQU0scUJBQUcsS0FBSyxFQUFFLElBQUksSUFBSyxZQUFZLEVBQUU7UUFDeEMsQ0FBQyxVQUFVLHFCQUFHLEtBQUssRUFBRSxDQUFDLElBQUssV0FBVyxFQUFFO1FBQ3hDLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQztRQUN2QixDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7UUFDdEIsQ0FBQyxhQUFhLHFCQUFHLEtBQUssRUFBRSxRQUFRLElBQUssV0FBVyxFQUFFO0tBQ3JELENBQ0osQ0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUFJPUF9CT09MRUFOLCBQUk9QX05VTUJFUiwgUFJPUF9TVFJJTkcsIHJlZ2lzdGVyIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1wcm9wcyc7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIHJlZ2lzdGVyKFxuICAgICAgICAnd20tdGFibGUtcm93LWFjdGlvbicsXG4gICAgICAgIG5ldyBNYXAoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgWydhY2Nlc3Nyb2xlcycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2FjdGlvbicsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2NhcHRpb24nLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydjbGFzcyAnLCB7dmFsdWU6ICdidG4tc2Vjb25kYXJ5JywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ2Rpc2FibGVkJywge3ZhbHVlOiBmYWxzZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgICAgICAgICAgWydkaXNwbGF5LW5hbWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydoeXBlcmxpbmsnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydpY29uY2xhc3MnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydrZXknLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydzaG93Jywge3ZhbHVlOiB0cnVlLCAuLi5QUk9QX0JPT0xFQU59XSxcbiAgICAgICAgICAgICAgICBbJ3RhYmluZGV4Jywge3ZhbHVlOiAwLCAuLi5QUk9QX05VTUJFUn1dLFxuICAgICAgICAgICAgICAgIFsndGFyZ2V0JywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsndGl0bGUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWyd3aWRnZXQtdHlwZScsIHt2YWx1ZTogJ2J1dHRvbicsIC4uLlBST1BfU1RSSU5HfV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgKVxuICAgICk7XG59O1xuIl19