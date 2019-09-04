import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';
export const registerProps = () => {
    register('wm-button', new Map([
        ['badgevalue', PROP_STRING],
        ['caption', PROP_STRING],
        ['class', Object.assign({ value: 'btn-default' }, PROP_STRING)],
        ['conditionalclass', PROP_ANY],
        ['conditionalstyle', PROP_ANY],
        ['disabled', PROP_BOOLEAN],
        ['hint', PROP_STRING],
        ['iconclass', PROP_STRING],
        ['iconheight', PROP_STRING],
        ['iconmargin', PROP_STRING],
        ['iconposition', PROP_STRING],
        ['iconurl', PROP_STRING],
        ['iconwidth', PROP_STRING],
        ['name', PROP_STRING],
        ['shortcutkey', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['tabindex', Object.assign({ value: 0 }, PROP_NUMBER)],
        ['type', PROP_STRING]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLnByb3BzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9idXR0b24vYnV0dG9uLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFMUcsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLEdBQUcsRUFBRTtJQUM5QixRQUFRLENBQ0osV0FBVyxFQUNYLElBQUksR0FBRyxDQUNIO1FBQ0ksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDO1FBQzNCLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQztRQUN4QixDQUFDLE9BQU8sa0JBQUcsS0FBSyxFQUFFLGFBQWEsSUFBSyxXQUFXLEVBQUU7UUFDakQsQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUM7UUFDOUIsQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUM7UUFDOUIsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDO1FBQzFCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQztRQUNyQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7UUFDMUIsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDO1FBQzNCLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQztRQUMzQixDQUFDLGNBQWMsRUFBRSxXQUFXLENBQUM7UUFDN0IsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDO1FBQ3hCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQztRQUMxQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7UUFDckIsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDO1FBQzVCLENBQUMsTUFBTSxrQkFBRyxLQUFLLEVBQUUsSUFBSSxJQUFLLFlBQVksRUFBRTtRQUN4QyxDQUFDLFVBQVUsa0JBQUcsS0FBSyxFQUFFLENBQUMsSUFBSyxXQUFXLEVBQUU7UUFDeEMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDO0tBQ3hCLENBQ0osQ0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUFJPUF9BTlksIFBST1BfQk9PTEVBTiwgUFJPUF9OVU1CRVIsIFBST1BfU1RSSU5HLCByZWdpc3RlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay93aWRnZXQtcHJvcHMnO1xuXG5leHBvcnQgY29uc3QgcmVnaXN0ZXJQcm9wcyA9ICgpID0+IHtcbiAgICByZWdpc3RlcihcbiAgICAgICAgJ3dtLWJ1dHRvbicsXG4gICAgICAgIG5ldyBNYXAoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgWydiYWRnZXZhbHVlJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnY2FwdGlvbicsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2NsYXNzJywge3ZhbHVlOiAnYnRuLWRlZmF1bHQnLCAuLi5QUk9QX1NUUklOR31dLFxuICAgICAgICAgICAgICAgIFsnY29uZGl0aW9uYWxjbGFzcycsIFBST1BfQU5ZXSxcbiAgICAgICAgICAgICAgICBbJ2NvbmRpdGlvbmFsc3R5bGUnLCBQUk9QX0FOWV0sXG4gICAgICAgICAgICAgICAgWydkaXNhYmxlZCcsIFBST1BfQk9PTEVBTl0sXG4gICAgICAgICAgICAgICAgWydoaW50JywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaWNvbmNsYXNzJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaWNvbmhlaWdodCcsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2ljb25tYXJnaW4nLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydpY29ucG9zaXRpb24nLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydpY29udXJsJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaWNvbndpZHRoJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnbmFtZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ3Nob3J0Y3V0a2V5JywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnc2hvdycsIHt2YWx1ZTogdHJ1ZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgICAgICAgICAgWyd0YWJpbmRleCcsIHt2YWx1ZTogMCwgLi4uUFJPUF9OVU1CRVJ9XSxcbiAgICAgICAgICAgICAgICBbJ3R5cGUnLCBQUk9QX1NUUklOR11cbiAgICAgICAgICAgIF1cbiAgICAgICAgKVxuICAgICk7XG59O1xuIl19