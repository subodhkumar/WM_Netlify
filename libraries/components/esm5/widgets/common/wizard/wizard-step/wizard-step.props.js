import * as tslib_1 from "tslib";
import { PROP_BOOLEAN, PROP_STRING, register } from '../../../framework/widget-props';
export var registerProps = function () {
    register('wm-wizardstep', new Map([
        ['class', PROP_STRING],
        ['enableskip', tslib_1.__assign({ value: false }, PROP_BOOLEAN)],
        ['iconclass', PROP_STRING],
        ['name', PROP_STRING],
        ['show', tslib_1.__assign({ value: true }, PROP_BOOLEAN)],
        ['title', tslib_1.__assign({ value: 'Step Title' }, PROP_STRING)]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2l6YXJkLXN0ZXAucHJvcHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3dpemFyZC93aXphcmQtc3RlcC93aXphcmQtc3RlcC5wcm9wcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFdEYsTUFBTSxDQUFDLElBQU0sYUFBYSxHQUFHO0lBQ3pCLFFBQVEsQ0FDSixlQUFlLEVBQ2YsSUFBSSxHQUFHLENBQ0g7UUFDSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7UUFDdEIsQ0FBQyxZQUFZLHFCQUFHLEtBQUssRUFBRSxLQUFLLElBQUssWUFBWSxFQUFFO1FBQy9DLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQztRQUMxQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7UUFDckIsQ0FBQyxNQUFNLHFCQUFHLEtBQUssRUFBRSxJQUFJLElBQUssWUFBWSxFQUFFO1FBQ3hDLENBQUMsT0FBTyxxQkFBRyxLQUFLLEVBQUUsWUFBWSxJQUFLLFdBQVcsRUFBRTtLQUNuRCxDQUNKLENBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBST1BfQk9PTEVBTiwgUFJPUF9TVFJJTkcsIHJlZ2lzdGVyIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1wcm9wcyc7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIHJlZ2lzdGVyKFxuICAgICAgICAnd20td2l6YXJkc3RlcCcsXG4gICAgICAgIG5ldyBNYXAoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgWydjbGFzcycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2VuYWJsZXNraXAnLCB7dmFsdWU6IGZhbHNlLCAuLi5QUk9QX0JPT0xFQU59XSxcbiAgICAgICAgICAgICAgICBbJ2ljb25jbGFzcycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ25hbWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydzaG93Jywge3ZhbHVlOiB0cnVlLCAuLi5QUk9QX0JPT0xFQU59XSxcbiAgICAgICAgICAgICAgICBbJ3RpdGxlJywge3ZhbHVlOiAnU3RlcCBUaXRsZScsIC4uLlBST1BfU1RSSU5HfV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgKVxuICAgICk7XG59O1xuIl19