import * as tslib_1 from "tslib";
import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';
export var inputEmailTypeProps = new Map([
    ['autocomplete', tslib_1.__assign({ value: true }, PROP_BOOLEAN)],
    ['autofocus', PROP_BOOLEAN],
    ['class', PROP_STRING],
    ['datavaluesource', PROP_ANY],
    ['datavalue', PROP_STRING],
    ['disabled', PROP_BOOLEAN],
    ['hint', PROP_STRING],
    ['maxchars', PROP_NUMBER],
    ['name', PROP_STRING],
    ['placeholder', tslib_1.__assign({ value: 'Enter text' }, PROP_STRING)],
    ['readonly', PROP_BOOLEAN],
    ['regexp', PROP_STRING],
    ['required', PROP_BOOLEAN],
    ['shortcutkey', PROP_STRING],
    ['show', tslib_1.__assign({ value: true }, PROP_BOOLEAN)],
    ['tabindex', tslib_1.__assign({ value: 0 }, PROP_NUMBER)],
    ['type', PROP_STRING],
    ['updateon', PROP_STRING]
]);
export var registerProps = function () {
    register('wm-input-email', inputEmailTypeProps);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtZW1haWwucHJvcHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RleHQvZW1haWwvaW5wdXQtZW1haWwucHJvcHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFN0csTUFBTSxDQUFDLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxHQUFHLENBQ3RDO0lBQ0ksQ0FBQyxjQUFjLHFCQUFHLEtBQUssRUFBRSxJQUFJLElBQUssWUFBWSxFQUFFO0lBQ2hELENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQztJQUMzQixDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7SUFDdEIsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUM7SUFDN0IsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDO0lBQzFCLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQztJQUMxQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7SUFDckIsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDO0lBQ3pCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQztJQUNyQixDQUFDLGFBQWEscUJBQUcsS0FBSyxFQUFFLFlBQVksSUFBSyxXQUFXLEVBQUU7SUFDdEQsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDO0lBQzFCLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQztJQUN2QixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUM7SUFDMUIsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDO0lBQzVCLENBQUMsTUFBTSxxQkFBRyxLQUFLLEVBQUUsSUFBSSxJQUFLLFlBQVksRUFBRTtJQUN4QyxDQUFDLFVBQVUscUJBQUcsS0FBSyxFQUFFLENBQUMsSUFBSyxXQUFXLEVBQUU7SUFDeEMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDO0lBQ3JCLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQztDQUM1QixDQUNKLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSxhQUFhLEdBQUc7SUFDekIsUUFBUSxDQUNKLGdCQUFnQixFQUNoQixtQkFBbUIsQ0FDdEIsQ0FBQztBQUNOLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBST1BfQU5ZLCBQUk9QX0JPT0xFQU4sIFBST1BfTlVNQkVSLCBQUk9QX1NUUklORywgcmVnaXN0ZXIgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvd2lkZ2V0LXByb3BzJztcblxuZXhwb3J0IGNvbnN0IGlucHV0RW1haWxUeXBlUHJvcHMgPSBuZXcgTWFwKFxuICAgIFtcbiAgICAgICAgWydhdXRvY29tcGxldGUnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgICAgICBbJ2F1dG9mb2N1cycsIFBST1BfQk9PTEVBTl0sXG4gICAgICAgIFsnY2xhc3MnLCBQUk9QX1NUUklOR10sXG4gICAgICAgIFsnZGF0YXZhbHVlc291cmNlJywgUFJPUF9BTlldLFxuICAgICAgICBbJ2RhdGF2YWx1ZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgWydkaXNhYmxlZCcsIFBST1BfQk9PTEVBTl0sXG4gICAgICAgIFsnaGludCcsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgWydtYXhjaGFycycsIFBST1BfTlVNQkVSXSxcbiAgICAgICAgWyduYW1lJywgUFJPUF9TVFJJTkddLFxuICAgICAgICBbJ3BsYWNlaG9sZGVyJywge3ZhbHVlOiAnRW50ZXIgdGV4dCcsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgIFsncmVhZG9ubHknLCBQUk9QX0JPT0xFQU5dLFxuICAgICAgICBbJ3JlZ2V4cCcsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgWydyZXF1aXJlZCcsIFBST1BfQk9PTEVBTl0sXG4gICAgICAgIFsnc2hvcnRjdXRrZXknLCBQUk9QX1NUUklOR10sXG4gICAgICAgIFsnc2hvdycsIHt2YWx1ZTogdHJ1ZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgIFsndGFiaW5kZXgnLCB7dmFsdWU6IDAsIC4uLlBST1BfTlVNQkVSfV0sXG4gICAgICAgIFsndHlwZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgWyd1cGRhdGVvbicsIFBST1BfU1RSSU5HXVxuICAgIF1cbik7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIHJlZ2lzdGVyKFxuICAgICAgICAnd20taW5wdXQtZW1haWwnLFxuICAgICAgICBpbnB1dEVtYWlsVHlwZVByb3BzXG4gICAgKTtcbn07XG4iXX0=