import { isMobileApp } from '@wm/core';
import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';
export const registerProps = () => {
    register('wm-list', new Map([
        ['boundarylinks', Object.assign({ value: false }, PROP_BOOLEAN)],
        ['class', PROP_STRING],
        ['collapsible', PROP_BOOLEAN],
        ['dateformat', PROP_STRING],
        ['dataset', PROP_ANY],
        ['datasource', PROP_ANY],
        ['directionlinks', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['disableitem', PROP_BOOLEAN],
        ['enablereorder', PROP_BOOLEAN],
        ['forceellipses', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['groupby', PROP_STRING],
        ['iconclass', PROP_STRING],
        ['itemclass', Object.assign({ value: '' }, PROP_STRING)],
        ['itemsperrow', PROP_STRING],
        ['listclass', Object.assign({ value: 'list-group' }, PROP_STRING)],
        ['multiselect', PROP_BOOLEAN],
        ['loadingdatamsg', Object.assign({ value: 'Loading...' }, PROP_STRING)],
        ['loadingicon', Object.assign({ value: 'fa fa-circle-o-notch' }, PROP_STRING)],
        ['match', PROP_STRING],
        ['maxsize', Object.assign({ value: 5 }, PROP_NUMBER)],
        ['name', PROP_STRING],
        ['navigation', PROP_STRING],
        ['navigationalign', Object.assign({ value: 'left' }, PROP_STRING)],
        ['nodatamessage', Object.assign({ value: 'No data found' }, PROP_STRING)],
        ['ondemandmessage', Object.assign({ value: 'Load More' }, PROP_STRING)],
        ['orderby', PROP_STRING],
        ['paginationclass', PROP_STRING],
        ['pagesize', PROP_NUMBER],
        ['pulltorefresh', Object.assign({ value: isMobileApp() }, PROP_BOOLEAN)],
        ['selectfirstitem', PROP_BOOLEAN],
        ['selectionlimit', PROP_NUMBER],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['showcount', PROP_BOOLEAN],
        ['showrecordcount', PROP_BOOLEAN],
        ['subheading', PROP_STRING],
        ['tabindex', Object.assign({ value: 0 }, PROP_NUMBER)],
        ['title', PROP_STRING]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5wcm9wcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbGlzdC9saXN0LnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdkMsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUUxRyxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsR0FBRyxFQUFFO0lBQzlCLFFBQVEsQ0FDSixTQUFTLEVBQ1QsSUFBSSxHQUFHLENBQ0g7UUFDSSxDQUFDLGVBQWUsa0JBQUcsS0FBSyxFQUFFLEtBQUssSUFBSyxZQUFZLEVBQUU7UUFDbEQsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDO1FBQ3RCLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQztRQUM3QixDQUFDLFlBQVksRUFBRSxXQUFXLENBQUM7UUFDM0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDO1FBQ3JCLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQztRQUN4QixDQUFDLGdCQUFnQixrQkFBRyxLQUFLLEVBQUUsSUFBSSxJQUFLLFlBQVksRUFBRTtRQUNsRCxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUM7UUFDN0IsQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDO1FBQy9CLENBQUMsZUFBZSxrQkFBRyxLQUFLLEVBQUUsSUFBSSxJQUFLLFlBQVksRUFBRTtRQUNqRCxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7UUFDeEIsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDO1FBQzFCLENBQUMsV0FBVyxrQkFBRyxLQUFLLEVBQUUsRUFBRSxJQUFLLFdBQVcsRUFBRTtRQUMxQyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUM7UUFDNUIsQ0FBQyxXQUFXLGtCQUFHLEtBQUssRUFBRSxZQUFZLElBQUssV0FBVyxFQUFFO1FBQ3BELENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQztRQUM3QixDQUFDLGdCQUFnQixrQkFBRyxLQUFLLEVBQUcsWUFBWSxJQUFLLFdBQVcsRUFBRTtRQUMxRCxDQUFDLGFBQWEsa0JBQUcsS0FBSyxFQUFHLHNCQUFzQixJQUFLLFdBQVcsRUFBRTtRQUNqRSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7UUFDdEIsQ0FBQyxTQUFTLGtCQUFHLEtBQUssRUFBRSxDQUFDLElBQUssV0FBVyxFQUFFO1FBQ3ZDLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQztRQUNyQixDQUFDLFlBQVksRUFBRSxXQUFXLENBQUM7UUFDM0IsQ0FBQyxpQkFBaUIsa0JBQUcsS0FBSyxFQUFFLE1BQU0sSUFBSyxXQUFXLEVBQUU7UUFDcEQsQ0FBQyxlQUFlLGtCQUFHLEtBQUssRUFBRyxlQUFlLElBQUssV0FBVyxFQUFFO1FBQzVELENBQUMsaUJBQWlCLGtCQUFHLEtBQUssRUFBRyxXQUFXLElBQUssV0FBVyxFQUFFO1FBQzFELENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQztRQUN4QixDQUFDLGlCQUFpQixFQUFFLFdBQVcsQ0FBQztRQUNoQyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUM7UUFDekIsQ0FBQyxlQUFlLGtCQUFHLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBSyxZQUFZLEVBQUU7UUFDMUQsQ0FBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUM7UUFDakMsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQUM7UUFDL0IsQ0FBQyxNQUFNLGtCQUFHLEtBQUssRUFBRSxJQUFJLElBQUssWUFBWSxFQUFFO1FBQ3hDLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQztRQUMzQixDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQztRQUNqQyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUM7UUFDM0IsQ0FBQyxVQUFVLGtCQUFHLEtBQUssRUFBRSxDQUFDLElBQUssV0FBVyxFQUFFO1FBQ3hDLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztLQUN6QixDQUNKLENBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzTW9iaWxlQXBwIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBQUk9QX0FOWSwgUFJPUF9CT09MRUFOLCBQUk9QX05VTUJFUiwgUFJPUF9TVFJJTkcsIHJlZ2lzdGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1wcm9wcyc7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIHJlZ2lzdGVyKFxuICAgICAgICAnd20tbGlzdCcsXG4gICAgICAgIG5ldyBNYXAoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgWydib3VuZGFyeWxpbmtzJywge3ZhbHVlOiBmYWxzZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgICAgICAgICAgWydjbGFzcycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2NvbGxhcHNpYmxlJywgUFJPUF9CT09MRUFOXSxcbiAgICAgICAgICAgICAgICBbJ2RhdGVmb3JtYXQnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydkYXRhc2V0JywgUFJPUF9BTlldLFxuICAgICAgICAgICAgICAgIFsnZGF0YXNvdXJjZScsIFBST1BfQU5ZXSxcbiAgICAgICAgICAgICAgICBbJ2RpcmVjdGlvbmxpbmtzJywge3ZhbHVlOiB0cnVlLCAuLi5QUk9QX0JPT0xFQU59XSxcbiAgICAgICAgICAgICAgICBbJ2Rpc2FibGVpdGVtJywgUFJPUF9CT09MRUFOXSxcbiAgICAgICAgICAgICAgICBbJ2VuYWJsZXJlb3JkZXInLCBQUk9QX0JPT0xFQU5dLFxuICAgICAgICAgICAgICAgIFsnZm9yY2VlbGxpcHNlcycsIHt2YWx1ZTogdHJ1ZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgICAgICAgICAgWydncm91cGJ5JywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaWNvbmNsYXNzJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaXRlbWNsYXNzJywge3ZhbHVlOiAnJywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ2l0ZW1zcGVycm93JywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnbGlzdGNsYXNzJywge3ZhbHVlOiAnbGlzdC1ncm91cCcsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgICAgICAgICAgWydtdWx0aXNlbGVjdCcsIFBST1BfQk9PTEVBTl0sXG4gICAgICAgICAgICAgICAgWydsb2FkaW5nZGF0YW1zZycsIHt2YWx1ZSA6ICdMb2FkaW5nLi4uJywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ2xvYWRpbmdpY29uJywge3ZhbHVlIDogJ2ZhIGZhLWNpcmNsZS1vLW5vdGNoJywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ21hdGNoJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnbWF4c2l6ZScsIHt2YWx1ZTogNSwgLi4uUFJPUF9OVU1CRVJ9XSxcbiAgICAgICAgICAgICAgICBbJ25hbWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWyduYXZpZ2F0aW9uJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnbmF2aWdhdGlvbmFsaWduJywge3ZhbHVlOiAnbGVmdCcsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgICAgICAgICAgWydub2RhdGFtZXNzYWdlJywge3ZhbHVlIDogJ05vIGRhdGEgZm91bmQnLCAuLi5QUk9QX1NUUklOR31dLFxuICAgICAgICAgICAgICAgIFsnb25kZW1hbmRtZXNzYWdlJywge3ZhbHVlIDogJ0xvYWQgTW9yZScsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgICAgICAgICAgWydvcmRlcmJ5JywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsncGFnaW5hdGlvbmNsYXNzJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsncGFnZXNpemUnLCBQUk9QX05VTUJFUl0sXG4gICAgICAgICAgICAgICAgWydwdWxsdG9yZWZyZXNoJywge3ZhbHVlOiBpc01vYmlsZUFwcCgpLCAuLi5QUk9QX0JPT0xFQU59XSxcbiAgICAgICAgICAgICAgICBbJ3NlbGVjdGZpcnN0aXRlbScsIFBST1BfQk9PTEVBTl0sXG4gICAgICAgICAgICAgICAgWydzZWxlY3Rpb25saW1pdCcsIFBST1BfTlVNQkVSXSxcbiAgICAgICAgICAgICAgICBbJ3Nob3cnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgICAgICAgICAgICAgIFsnc2hvd2NvdW50JywgUFJPUF9CT09MRUFOXSxcbiAgICAgICAgICAgICAgICBbJ3Nob3dyZWNvcmRjb3VudCcsIFBST1BfQk9PTEVBTl0sXG4gICAgICAgICAgICAgICAgWydzdWJoZWFkaW5nJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsndGFiaW5kZXgnLCB7dmFsdWU6IDAsIC4uLlBST1BfTlVNQkVSfV0sXG4gICAgICAgICAgICAgICAgWyd0aXRsZScsIFBST1BfU1RSSU5HXVxuICAgICAgICAgICAgXVxuICAgICAgICApXG4gICAgKTtcbn07XG4iXX0=