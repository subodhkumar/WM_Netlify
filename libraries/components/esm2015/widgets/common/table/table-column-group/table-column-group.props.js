import { PROP_STRING, register } from '../../../framework/widget-props';
export const registerProps = () => {
    register('wm-table-column-group', new Map([
        ['backgroundcolor', PROP_STRING],
        ['caption', PROP_STRING],
        ['col-class', PROP_STRING],
        ['name', PROP_STRING],
        ['textalignment', Object.assign({ value: 'center' }, PROP_STRING)]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtY29sdW1uLWdyb3VwLnByb3BzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90YWJsZS90YWJsZS1jb2x1bW4tZ3JvdXAvdGFibGUtY29sdW1uLWdyb3VwLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFeEUsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLEdBQUcsRUFBRTtJQUM5QixRQUFRLENBQ0osdUJBQXVCLEVBQ3ZCLElBQUksR0FBRyxDQUNIO1FBQ0ksQ0FBQyxpQkFBaUIsRUFBRSxXQUFXLENBQUM7UUFDaEMsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDO1FBQ3hCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQztRQUMxQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7UUFDckIsQ0FBQyxlQUFlLGtCQUFHLEtBQUssRUFBRSxRQUFRLElBQUssV0FBVyxFQUFFO0tBQ3ZELENBQ0osQ0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUFJPUF9TVFJJTkcsIHJlZ2lzdGVyIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1wcm9wcyc7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIHJlZ2lzdGVyKFxuICAgICAgICAnd20tdGFibGUtY29sdW1uLWdyb3VwJyxcbiAgICAgICAgbmV3IE1hcChcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBbJ2JhY2tncm91bmRjb2xvcicsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2NhcHRpb24nLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydjb2wtY2xhc3MnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWyduYW1lJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsndGV4dGFsaWdubWVudCcsIHt2YWx1ZTogJ2NlbnRlcicsIC4uLlBST1BfU1RSSU5HfV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgKVxuICAgICk7XG59O1xuIl19