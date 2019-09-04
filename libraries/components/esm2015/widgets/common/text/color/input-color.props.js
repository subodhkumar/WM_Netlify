import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';
export const inputColorTypeProps = new Map([
    ['autocomplete', Object.assign({ value: true }, PROP_BOOLEAN)],
    ['autofocus', PROP_BOOLEAN],
    ['class', PROP_STRING],
    ['datavaluesource', PROP_ANY],
    ['datavalue', PROP_STRING],
    ['disabled', PROP_BOOLEAN],
    ['hint', PROP_STRING],
    ['name', PROP_STRING],
    ['placeholder', Object.assign({ value: 'Enter text' }, PROP_STRING)],
    ['readonly', PROP_BOOLEAN],
    ['required', PROP_BOOLEAN],
    ['shortcutkey', PROP_STRING],
    ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
    ['tabindex', Object.assign({ value: 0 }, PROP_NUMBER)],
    ['type', PROP_STRING],
    ['updateon', PROP_STRING]
]);
export const registerProps = () => {
    register('wm-input-color', inputColorTypeProps);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtY29sb3IucHJvcHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RleHQvY29sb3IvaW5wdXQtY29sb3IucHJvcHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUU3RyxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsQ0FBQztJQUN2QyxDQUFDLGNBQWMsa0JBQUcsS0FBSyxFQUFFLElBQUksSUFBSyxZQUFZLEVBQUU7SUFDaEQsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDO0lBQzNCLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztJQUN0QixDQUFDLGlCQUFpQixFQUFFLFFBQVEsQ0FBQztJQUM3QixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7SUFDMUIsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDO0lBQzFCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQztJQUNyQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7SUFDckIsQ0FBQyxhQUFhLGtCQUFHLEtBQUssRUFBRSxZQUFZLElBQUssV0FBVyxFQUFFO0lBQ3RELENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQztJQUMxQixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUM7SUFDMUIsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDO0lBQzVCLENBQUMsTUFBTSxrQkFBRyxLQUFLLEVBQUUsSUFBSSxJQUFLLFlBQVksRUFBRTtJQUN4QyxDQUFDLFVBQVUsa0JBQUcsS0FBSyxFQUFFLENBQUMsSUFBSyxXQUFXLEVBQUU7SUFDeEMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDO0lBQ3JCLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQztDQUM1QixDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsR0FBRyxFQUFFO0lBQzlCLFFBQVEsQ0FDSixnQkFBZ0IsRUFDaEIsbUJBQW1CLENBQ3RCLENBQUM7QUFDTixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQUk9QX0FOWSwgUFJPUF9CT09MRUFOLCBQUk9QX05VTUJFUiwgUFJPUF9TVFJJTkcsIHJlZ2lzdGVyIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1wcm9wcyc7XG5cbmV4cG9ydCBjb25zdCBpbnB1dENvbG9yVHlwZVByb3BzID0gbmV3IE1hcChbXG4gICAgWydhdXRvY29tcGxldGUnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgIFsnYXV0b2ZvY3VzJywgUFJPUF9CT09MRUFOXSxcbiAgICBbJ2NsYXNzJywgUFJPUF9TVFJJTkddLFxuICAgIFsnZGF0YXZhbHVlc291cmNlJywgUFJPUF9BTlldLFxuICAgIFsnZGF0YXZhbHVlJywgUFJPUF9TVFJJTkddLFxuICAgIFsnZGlzYWJsZWQnLCBQUk9QX0JPT0xFQU5dLFxuICAgIFsnaGludCcsIFBST1BfU1RSSU5HXSxcbiAgICBbJ25hbWUnLCBQUk9QX1NUUklOR10sXG4gICAgWydwbGFjZWhvbGRlcicsIHt2YWx1ZTogJ0VudGVyIHRleHQnLCAuLi5QUk9QX1NUUklOR31dLFxuICAgIFsncmVhZG9ubHknLCBQUk9QX0JPT0xFQU5dLFxuICAgIFsncmVxdWlyZWQnLCBQUk9QX0JPT0xFQU5dLFxuICAgIFsnc2hvcnRjdXRrZXknLCBQUk9QX1NUUklOR10sXG4gICAgWydzaG93Jywge3ZhbHVlOiB0cnVlLCAuLi5QUk9QX0JPT0xFQU59XSxcbiAgICBbJ3RhYmluZGV4Jywge3ZhbHVlOiAwLCAuLi5QUk9QX05VTUJFUn1dLFxuICAgIFsndHlwZScsIFBST1BfU1RSSU5HXSxcbiAgICBbJ3VwZGF0ZW9uJywgUFJPUF9TVFJJTkddXG5dKTtcblxuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyUHJvcHMgPSAoKSA9PiB7XG4gICAgcmVnaXN0ZXIoXG4gICAgICAgICd3bS1pbnB1dC1jb2xvcicsXG4gICAgICAgIGlucHV0Q29sb3JUeXBlUHJvcHNcbiAgICApO1xufTtcbiJdfQ==