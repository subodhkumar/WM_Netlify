import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';
export const registerProps = () => {
    register('wm-icon', new Map([
        ['caption', PROP_STRING],
        ['class', PROP_STRING],
        ['conditionalclass', PROP_ANY],
        ['conditionalstyle', PROP_ANY],
        ['hint', PROP_STRING],
        ['iconclass', Object.assign({ value: 'wi wi-star-border' }, PROP_STRING)],
        ['iconposition', Object.assign({ value: 'left' }, PROP_STRING)],
        ['iconsize', PROP_STRING],
        ['iconurl', PROP_STRING],
        ['name', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5wcm9wcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vaWNvbi9pY29uLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUU3RixNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsR0FBRyxFQUFFO0lBQzlCLFFBQVEsQ0FDSixTQUFTLEVBQ1QsSUFBSSxHQUFHLENBQ0g7UUFDSSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7UUFDeEIsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDO1FBQ3RCLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDO1FBQzlCLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDO1FBQzlCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQztRQUNyQixDQUFDLFdBQVcsa0JBQUcsS0FBSyxFQUFFLG1CQUFtQixJQUFLLFdBQVcsRUFBRTtRQUMzRCxDQUFDLGNBQWMsa0JBQUcsS0FBSyxFQUFFLE1BQU0sSUFBSyxXQUFXLEVBQUU7UUFDakQsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDO1FBQ3pCLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQztRQUN4QixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7UUFDckIsQ0FBQyxNQUFNLGtCQUFHLEtBQUssRUFBRSxJQUFJLElBQUssWUFBWSxFQUFFO0tBQzNDLENBQ0osQ0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUFJPUF9BTlksIFBST1BfQk9PTEVBTiwgUFJPUF9TVFJJTkcsIHJlZ2lzdGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1wcm9wcyc7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIHJlZ2lzdGVyKFxuICAgICAgICAnd20taWNvbicsXG4gICAgICAgIG5ldyBNYXAoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgWydjYXB0aW9uJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnY2xhc3MnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydjb25kaXRpb25hbGNsYXNzJywgUFJPUF9BTlldLFxuICAgICAgICAgICAgICAgIFsnY29uZGl0aW9uYWxzdHlsZScsIFBST1BfQU5ZXSxcbiAgICAgICAgICAgICAgICBbJ2hpbnQnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydpY29uY2xhc3MnLCB7dmFsdWU6ICd3aSB3aS1zdGFyLWJvcmRlcicsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgICAgICAgICAgWydpY29ucG9zaXRpb24nLCB7dmFsdWU6ICdsZWZ0JywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ2ljb25zaXplJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaWNvbnVybCcsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ25hbWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydzaG93Jywge3ZhbHVlOiB0cnVlLCAuLi5QUk9QX0JPT0xFQU59XVxuICAgICAgICAgICAgXVxuICAgICAgICApXG4gICAgKTtcbn07XG4iXX0=