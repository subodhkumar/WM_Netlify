import { isMobileApp } from '@wm/core';
import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';
export const registerProps = () => {
    const props = new Map([
        ['calendartype', Object.assign({ value: 'basic' }, PROP_STRING)],
        ['class', PROP_STRING],
        ['tabindex', Object.assign({ value: 0 }, PROP_NUMBER)],
        ['controls', Object.assign({ value: 'navigation, today, year, month, week, day' }, PROP_STRING)],
        ['dataset', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['eventallday', PROP_STRING],
        ['eventclass', PROP_STRING],
        ['eventend', PROP_STRING],
        ['eventstart', PROP_STRING],
        ['eventtitle', PROP_STRING],
        ['name', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['showindevice', Object.assign({ displayType: 'inline-block', value: 'all' }, PROP_STRING)],
        ['view', PROP_STRING],
        ['selectionmode', PROP_STRING]
    ]);
    if (isMobileApp()) {
        props.set('view', Object.assign({ value: 'day' }, PROP_STRING));
    }
    register('wm-calendar', props);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIucHJvcHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2NhbGVuZGFyL2NhbGVuZGFyLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdkMsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUUxRyxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsR0FBRyxFQUFFO0lBQzlCLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxDQUNiO1FBQ0ksQ0FBQyxjQUFjLGtCQUFHLEtBQUssRUFBRSxPQUFPLElBQUssV0FBVyxFQUFFO1FBQ2xELENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztRQUN0QixDQUFDLFVBQVUsa0JBQUcsS0FBSyxFQUFFLENBQUMsSUFBSyxXQUFXLEVBQUU7UUFDeEMsQ0FBQyxVQUFVLGtCQUFHLEtBQUssRUFBRSwyQ0FBMkMsSUFBSyxXQUFXLEVBQUU7UUFDbEYsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDO1FBQ3JCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQztRQUMxQixDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUM7UUFDNUIsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDO1FBQzNCLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQztRQUN6QixDQUFDLFlBQVksRUFBRSxXQUFXLENBQUM7UUFDM0IsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDO1FBQzNCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQztRQUNyQixDQUFDLE1BQU0sa0JBQUcsS0FBSyxFQUFFLElBQUksSUFBSyxZQUFZLEVBQUU7UUFDeEMsQ0FBQyxjQUFjLGtCQUFHLFdBQVcsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLEtBQUssSUFBSyxXQUFXLEVBQUU7UUFDN0UsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDO1FBQ3JCLENBQUMsZUFBZSxFQUFFLFdBQVcsQ0FBQztLQUNqQyxDQUNKLENBQUM7SUFDTixJQUFJLFdBQVcsRUFBRSxFQUFFO1FBQ2YsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLGtCQUFHLEtBQUssRUFBRSxLQUFLLElBQUssV0FBVyxFQUFFLENBQUM7S0FDckQ7SUFDRCxRQUFRLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzTW9iaWxlQXBwIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBQUk9QX0FOWSwgUFJPUF9CT09MRUFOLCBQUk9QX05VTUJFUiwgUFJPUF9TVFJJTkcsIHJlZ2lzdGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1wcm9wcyc7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIGNvbnN0IHByb3BzID0gbmV3IE1hcChcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBbJ2NhbGVuZGFydHlwZScsIHt2YWx1ZTogJ2Jhc2ljJywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ2NsYXNzJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsndGFiaW5kZXgnLCB7dmFsdWU6IDAsIC4uLlBST1BfTlVNQkVSfV0sXG4gICAgICAgICAgICAgICAgWydjb250cm9scycsIHt2YWx1ZTogJ25hdmlnYXRpb24sIHRvZGF5LCB5ZWFyLCBtb250aCwgd2VlaywgZGF5JywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ2RhdGFzZXQnLCBQUk9QX0FOWV0sXG4gICAgICAgICAgICAgICAgWydkYXRhdmFsdWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydldmVudGFsbGRheScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2V2ZW50Y2xhc3MnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydldmVudGVuZCcsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2V2ZW50c3RhcnQnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydldmVudHRpdGxlJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnbmFtZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ3Nob3cnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgICAgICAgICAgICAgIFsnc2hvd2luZGV2aWNlJywge2Rpc3BsYXlUeXBlOiAnaW5saW5lLWJsb2NrJywgdmFsdWU6ICdhbGwnLCAuLi5QUk9QX1NUUklOR31dLFxuICAgICAgICAgICAgICAgIFsndmlldycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ3NlbGVjdGlvbm1vZGUnLCBQUk9QX1NUUklOR11cbiAgICAgICAgICAgIF1cbiAgICAgICAgKTtcbiAgICBpZiAoaXNNb2JpbGVBcHAoKSkge1xuICAgICAgICBwcm9wcy5zZXQoJ3ZpZXcnLCB7dmFsdWU6ICdkYXknLCAuLi5QUk9QX1NUUklOR30pO1xuICAgIH1cbiAgICByZWdpc3Rlcignd20tY2FsZW5kYXInLCBwcm9wcyk7XG59O1xuIl19