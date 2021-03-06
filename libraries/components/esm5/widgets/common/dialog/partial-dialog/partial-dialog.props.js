import * as tslib_1 from "tslib";
import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';
export var registerProps = function () {
    register('wm-partialdialog', new Map([
        ['animation', PROP_STRING],
        ['class', PROP_STRING],
        ['closable', { value: true, PROP_BOOLEAN: PROP_BOOLEAN }],
        ['content', PROP_STRING],
        ['iconclass', { value: 'wi wi-file', PROP_STRING: PROP_STRING }],
        ['iconheight', PROP_STRING],
        ['iconmargin', PROP_STRING],
        ['iconurl', PROP_STRING],
        ['iconwidth', PROP_STRING],
        ['modal', tslib_1.__assign({ value: false }, PROP_BOOLEAN)],
        ['name', PROP_STRING],
        ['oktext', tslib_1.__assign({ value: 'OK' }, PROP_STRING)],
        ['showactions', tslib_1.__assign({ value: true }, PROP_BOOLEAN)],
        ['tabindex', tslib_1.__assign({ value: 0 }, PROP_NUMBER)],
        ['title', tslib_1.__assign({ value: 'Page Content' }, PROP_STRING)]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbC1kaWFsb2cucHJvcHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2RpYWxvZy9wYXJ0aWFsLWRpYWxvZy9wYXJ0aWFsLWRpYWxvZy5wcm9wcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBRW5HLE1BQU0sQ0FBQyxJQUFNLGFBQWEsR0FBRztJQUN6QixRQUFRLENBQ0osa0JBQWtCLEVBQ2xCLElBQUksR0FBRyxDQUNIO1FBQ0ksQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDO1FBQzFCLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztRQUN0QixDQUFDLFVBQVUsRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsWUFBWSxjQUFBLEVBQUMsQ0FBQztRQUN6QyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7UUFDeEIsQ0FBQyxXQUFXLEVBQUUsRUFBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFdBQVcsYUFBQSxFQUFDLENBQUM7UUFDakQsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDO1FBQzNCLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQztRQUMzQixDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7UUFDeEIsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDO1FBQzFCLENBQUMsT0FBTyxxQkFBRyxLQUFLLEVBQUUsS0FBSyxJQUFLLFlBQVksRUFBRTtRQUMxQyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7UUFDckIsQ0FBQyxRQUFRLHFCQUFHLEtBQUssRUFBRSxJQUFJLElBQUssV0FBVyxFQUFFO1FBQ3pDLENBQUMsYUFBYSxxQkFBRyxLQUFLLEVBQUUsSUFBSSxJQUFLLFlBQVksRUFBRTtRQUMvQyxDQUFDLFVBQVUscUJBQUcsS0FBSyxFQUFFLENBQUMsSUFBSyxXQUFXLEVBQUU7UUFDeEMsQ0FBQyxPQUFPLHFCQUFHLEtBQUssRUFBRSxjQUFjLElBQUssV0FBVyxFQUFFO0tBQ3JELENBQ0osQ0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUFJPUF9CT09MRUFOLCBQUk9QX05VTUJFUiwgUFJPUF9TVFJJTkcsIHJlZ2lzdGVyIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1wcm9wcyc7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIHJlZ2lzdGVyKFxuICAgICAgICAnd20tcGFydGlhbGRpYWxvZycsXG4gICAgICAgIG5ldyBNYXAoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgWydhbmltYXRpb24nLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydjbGFzcycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2Nsb3NhYmxlJywge3ZhbHVlOiB0cnVlLCBQUk9QX0JPT0xFQU59XSxcbiAgICAgICAgICAgICAgICBbJ2NvbnRlbnQnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydpY29uY2xhc3MnLCB7dmFsdWU6ICd3aSB3aS1maWxlJywgUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ2ljb25oZWlnaHQnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydpY29ubWFyZ2luJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaWNvbnVybCcsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2ljb253aWR0aCcsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ21vZGFsJywge3ZhbHVlOiBmYWxzZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgICAgICAgICAgWyduYW1lJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnb2t0ZXh0Jywge3ZhbHVlOiAnT0snLCAuLi5QUk9QX1NUUklOR31dLFxuICAgICAgICAgICAgICAgIFsnc2hvd2FjdGlvbnMnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgICAgICAgICAgICAgIFsndGFiaW5kZXgnLCB7dmFsdWU6IDAsIC4uLlBST1BfTlVNQkVSfV0sXG4gICAgICAgICAgICAgICAgWyd0aXRsZScsIHt2YWx1ZTogJ1BhZ2UgQ29udGVudCcsIC4uLlBST1BfU1RSSU5HfV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgKVxuICAgICk7XG59O1xuIl19