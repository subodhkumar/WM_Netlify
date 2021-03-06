import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';
export const inputNumberTypeProps = new Map([
    ['autocomplete', Object.assign({ value: true }, PROP_BOOLEAN)],
    ['autofocus', PROP_BOOLEAN],
    ['class', PROP_STRING],
    ['datavaluesource', PROP_ANY],
    ['datavalue', PROP_STRING],
    ['disabled', PROP_BOOLEAN],
    ['hint', PROP_STRING],
    ['maxchars', PROP_NUMBER],
    ['maxvalue', PROP_NUMBER],
    ['minvalue', PROP_NUMBER],
    ['name', PROP_STRING],
    ['placeholder', Object.assign({ value: 'Enter text' }, PROP_STRING)],
    ['readonly', PROP_BOOLEAN],
    ['regexp', PROP_STRING],
    ['required', PROP_BOOLEAN],
    ['shortcutkey', PROP_STRING],
    ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
    ['step', PROP_NUMBER],
    ['tabindex', Object.assign({ value: 0 }, PROP_NUMBER)],
    ['type', PROP_STRING],
    ['updateon', PROP_STRING]
]);
export const registerProps = () => {
    register('wm-input-number', inputNumberTypeProps);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtbnVtYmVyLnByb3BzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90ZXh0L251bWJlci9pbnB1dC1udW1iZXIucHJvcHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUU3RyxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FDdkM7SUFDSSxDQUFDLGNBQWMsa0JBQUcsS0FBSyxFQUFFLElBQUksSUFBSyxZQUFZLEVBQUU7SUFDaEQsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDO0lBQzNCLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztJQUN0QixDQUFDLGlCQUFpQixFQUFFLFFBQVEsQ0FBQztJQUM3QixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7SUFDMUIsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDO0lBQzFCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQztJQUNyQixDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUM7SUFDekIsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDO0lBQ3pCLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQztJQUN6QixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7SUFDckIsQ0FBQyxhQUFhLGtCQUFHLEtBQUssRUFBRSxZQUFZLElBQUssV0FBVyxFQUFFO0lBQ3RELENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQztJQUMxQixDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUM7SUFDdkIsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDO0lBQzFCLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQztJQUM1QixDQUFDLE1BQU0sa0JBQUcsS0FBSyxFQUFFLElBQUksSUFBSyxZQUFZLEVBQUU7SUFDeEMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDO0lBQ3JCLENBQUMsVUFBVSxrQkFBRyxLQUFLLEVBQUUsQ0FBQyxJQUFLLFdBQVcsRUFBRTtJQUN4QyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7SUFDckIsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDO0NBQzVCLENBQ0osQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxHQUFHLEVBQUU7SUFDOUIsUUFBUSxDQUNKLGlCQUFpQixFQUNqQixvQkFBb0IsQ0FDdkIsQ0FBQztBQUNOLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBST1BfQU5ZLCBQUk9QX0JPT0xFQU4sIFBST1BfTlVNQkVSLCBQUk9QX1NUUklORywgcmVnaXN0ZXIgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvd2lkZ2V0LXByb3BzJztcblxuZXhwb3J0IGNvbnN0IGlucHV0TnVtYmVyVHlwZVByb3BzID0gbmV3IE1hcChcbiAgICBbXG4gICAgICAgIFsnYXV0b2NvbXBsZXRlJywge3ZhbHVlOiB0cnVlLCAuLi5QUk9QX0JPT0xFQU59XSxcbiAgICAgICAgWydhdXRvZm9jdXMnLCBQUk9QX0JPT0xFQU5dLFxuICAgICAgICBbJ2NsYXNzJywgUFJPUF9TVFJJTkddLFxuICAgICAgICBbJ2RhdGF2YWx1ZXNvdXJjZScsIFBST1BfQU5ZXSxcbiAgICAgICAgWydkYXRhdmFsdWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgIFsnZGlzYWJsZWQnLCBQUk9QX0JPT0xFQU5dLFxuICAgICAgICBbJ2hpbnQnLCBQUk9QX1NUUklOR10sXG4gICAgICAgIFsnbWF4Y2hhcnMnLCBQUk9QX05VTUJFUl0sXG4gICAgICAgIFsnbWF4dmFsdWUnLCBQUk9QX05VTUJFUl0sXG4gICAgICAgIFsnbWludmFsdWUnLCBQUk9QX05VTUJFUl0sXG4gICAgICAgIFsnbmFtZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgWydwbGFjZWhvbGRlcicsIHt2YWx1ZTogJ0VudGVyIHRleHQnLCAuLi5QUk9QX1NUUklOR31dLFxuICAgICAgICBbJ3JlYWRvbmx5JywgUFJPUF9CT09MRUFOXSxcbiAgICAgICAgWydyZWdleHAnLCBQUk9QX1NUUklOR10sXG4gICAgICAgIFsncmVxdWlyZWQnLCBQUk9QX0JPT0xFQU5dLFxuICAgICAgICBbJ3Nob3J0Y3V0a2V5JywgUFJPUF9TVFJJTkddLFxuICAgICAgICBbJ3Nob3cnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgICAgICBbJ3N0ZXAnLCBQUk9QX05VTUJFUl0sXG4gICAgICAgIFsndGFiaW5kZXgnLCB7dmFsdWU6IDAsIC4uLlBST1BfTlVNQkVSfV0sXG4gICAgICAgIFsndHlwZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgWyd1cGRhdGVvbicsIFBST1BfU1RSSU5HXVxuICAgIF1cbik7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIHJlZ2lzdGVyKFxuICAgICAgICAnd20taW5wdXQtbnVtYmVyJyxcbiAgICAgICAgaW5wdXROdW1iZXJUeXBlUHJvcHNcbiAgICApO1xufTtcbiJdfQ==