import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';
export const registerProps = () => {
    register('wm-pagination', new Map([
        ['boundarylinks', Object.assign({ value: false }, PROP_BOOLEAN)],
        ['class', PROP_STRING],
        ['dataset', PROP_ANY],
        ['directionlinks', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['forceellipses', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['maxResults', PROP_NUMBER],
        ['maxsize', Object.assign({ value: 5 }, PROP_NUMBER)],
        ['name', PROP_STRING],
        ['navigation', Object.assign({ value: 'Basic' }, PROP_STRING)],
        ['navigationalign', Object.assign({ value: 'left' }, PROP_STRING)],
        ['navigationsize', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['showrecordcount', PROP_BOOLEAN],
        ['tabindex', Object.assign({ value: 0 }, PROP_NUMBER)]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi5wcm9wcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vcGFnaW5hdGlvbi9wYWdpbmF0aW9uLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFMUcsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLEdBQUcsRUFBRTtJQUM5QixRQUFRLENBQ0osZUFBZSxFQUNmLElBQUksR0FBRyxDQUNIO1FBQ0ksQ0FBQyxlQUFlLGtCQUFHLEtBQUssRUFBRSxLQUFLLElBQUssWUFBWSxFQUFFO1FBQ2xELENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztRQUN0QixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUM7UUFDckIsQ0FBQyxnQkFBZ0Isa0JBQUcsS0FBSyxFQUFFLElBQUksSUFBSyxZQUFZLEVBQUU7UUFDbEQsQ0FBQyxlQUFlLGtCQUFHLEtBQUssRUFBRSxJQUFJLElBQUssWUFBWSxFQUFFO1FBQ2pELENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQztRQUMzQixDQUFDLFNBQVMsa0JBQUcsS0FBSyxFQUFFLENBQUMsSUFBSyxXQUFXLEVBQUU7UUFDdkMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDO1FBQ3JCLENBQUMsWUFBWSxrQkFBRyxLQUFLLEVBQUUsT0FBTyxJQUFLLFdBQVcsRUFBRTtRQUNoRCxDQUFDLGlCQUFpQixrQkFBRyxLQUFLLEVBQUUsTUFBTSxJQUFLLFdBQVcsRUFBRTtRQUNwRCxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQztRQUMvQixDQUFDLE1BQU0sa0JBQUcsS0FBSyxFQUFFLElBQUksSUFBSyxZQUFZLEVBQUU7UUFDeEMsQ0FBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUM7UUFDakMsQ0FBQyxVQUFVLGtCQUFHLEtBQUssRUFBRSxDQUFDLElBQUssV0FBVyxFQUFFO0tBQzNDLENBQ0osQ0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUFJPUF9BTlksIFBST1BfQk9PTEVBTiwgUFJPUF9OVU1CRVIsIFBST1BfU1RSSU5HLCByZWdpc3RlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay93aWRnZXQtcHJvcHMnO1xuXG5leHBvcnQgY29uc3QgcmVnaXN0ZXJQcm9wcyA9ICgpID0+IHtcbiAgICByZWdpc3RlcihcbiAgICAgICAgJ3dtLXBhZ2luYXRpb24nLFxuICAgICAgICBuZXcgTWFwKFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFsnYm91bmRhcnlsaW5rcycsIHt2YWx1ZTogZmFsc2UsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgICAgICAgICAgICAgIFsnY2xhc3MnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydkYXRhc2V0JywgUFJPUF9BTlldLFxuICAgICAgICAgICAgICAgIFsnZGlyZWN0aW9ubGlua3MnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgICAgICAgICAgICAgIFsnZm9yY2VlbGxpcHNlcycsIHt2YWx1ZTogdHJ1ZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgICAgICAgICAgWydtYXhSZXN1bHRzJywgUFJPUF9OVU1CRVJdLFxuICAgICAgICAgICAgICAgIFsnbWF4c2l6ZScsIHt2YWx1ZTogNSwgLi4uUFJPUF9OVU1CRVJ9XSxcbiAgICAgICAgICAgICAgICBbJ25hbWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWyduYXZpZ2F0aW9uJywge3ZhbHVlOiAnQmFzaWMnLCAuLi5QUk9QX1NUUklOR31dLFxuICAgICAgICAgICAgICAgIFsnbmF2aWdhdGlvbmFsaWduJywge3ZhbHVlOiAnbGVmdCcsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgICAgICAgICAgWyduYXZpZ2F0aW9uc2l6ZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ3Nob3cnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgICAgICAgICAgICAgIFsnc2hvd3JlY29yZGNvdW50JywgUFJPUF9CT09MRUFOXSxcbiAgICAgICAgICAgICAgICBbJ3RhYmluZGV4Jywge3ZhbHVlOiAwLCAuLi5QUk9QX05VTUJFUn1dXG4gICAgICAgICAgICBdXG4gICAgICAgIClcbiAgICApO1xufTtcbiJdfQ==