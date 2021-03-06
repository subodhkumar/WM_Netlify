import * as tslib_1 from "tslib";
import { isMobileApp } from '@wm/core';
import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';
export var timeProps = new Map([
    ['autofocus', PROP_BOOLEAN],
    ['class', PROP_STRING],
    ['datavaluesource', PROP_ANY],
    ['datavalue', PROP_STRING],
    ['disabled', PROP_BOOLEAN],
    ['hint', PROP_STRING],
    ['hourstep', tslib_1.__assign({ value: 1 }, PROP_NUMBER)],
    ['maxtime', PROP_STRING],
    ['mintime', PROP_STRING],
    ['minutestep', tslib_1.__assign({ value: 15 }, PROP_NUMBER)],
    ['name', PROP_STRING],
    ['outputformat', tslib_1.__assign({ value: 'HH:mm:ss' }, PROP_STRING)],
    ['placeholder', tslib_1.__assign({ value: 'Select time' }, PROP_STRING)],
    ['readonly', PROP_BOOLEAN],
    ['required', PROP_BOOLEAN],
    ['shortcutkey', PROP_STRING],
    ['show', tslib_1.__assign({ value: true }, PROP_BOOLEAN)],
    ['showdropdownon', tslib_1.__assign({ value: 'default' }, PROP_STRING)],
    ['secondsstep', tslib_1.__assign({ value: 1 }, PROP_NUMBER)],
    ['tabindex', tslib_1.__assign({ value: 0 }, PROP_NUMBER)],
    ['timepattern', PROP_STRING],
    ['timestamp', PROP_STRING]
]);
export var registerProps = function () {
    if (isMobileApp()) {
        timeProps.set('timepattern', tslib_1.__assign({ value: 'HH:mm' }, PROP_STRING));
    }
    register('wm-time', timeProps);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZS5wcm9wcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGltZS90aW1lLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXZDLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFMUcsTUFBTSxDQUFDLElBQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUM1QjtJQUNJLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQztJQUMzQixDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7SUFDdEIsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUM7SUFDN0IsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDO0lBQzFCLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQztJQUMxQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7SUFDckIsQ0FBQyxVQUFVLHFCQUFHLEtBQUssRUFBRSxDQUFDLElBQUssV0FBVyxFQUFFO0lBQ3hDLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQztJQUN4QixDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7SUFDeEIsQ0FBQyxZQUFZLHFCQUFHLEtBQUssRUFBRSxFQUFFLElBQUssV0FBVyxFQUFFO0lBQzNDLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQztJQUNyQixDQUFDLGNBQWMscUJBQUcsS0FBSyxFQUFFLFVBQVUsSUFBSyxXQUFXLEVBQUU7SUFDckQsQ0FBQyxhQUFhLHFCQUFHLEtBQUssRUFBRSxhQUFhLElBQUssV0FBVyxFQUFFO0lBQ3ZELENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQztJQUMxQixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUM7SUFDMUIsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDO0lBQzVCLENBQUMsTUFBTSxxQkFBRyxLQUFLLEVBQUUsSUFBSSxJQUFLLFlBQVksRUFBRTtJQUN4QyxDQUFDLGdCQUFnQixxQkFBRyxLQUFLLEVBQUUsU0FBUyxJQUFLLFdBQVcsRUFBRTtJQUN0RCxDQUFDLGFBQWEscUJBQUcsS0FBSyxFQUFFLENBQUMsSUFBSyxXQUFXLEVBQUU7SUFDM0MsQ0FBQyxVQUFVLHFCQUFHLEtBQUssRUFBRSxDQUFDLElBQUssV0FBVyxFQUFFO0lBQ3hDLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQztJQUM1QixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7Q0FDN0IsQ0FDSixDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0sYUFBYSxHQUFHO0lBQ3pCLElBQUksV0FBVyxFQUFFLEVBQUU7UUFDZixTQUFTLENBQUMsR0FBRyxDQUFDLGFBQWEscUJBQUcsS0FBSyxFQUFFLE9BQU8sSUFBSyxXQUFXLEVBQUUsQ0FBQztLQUNsRTtJQUNELFFBQVEsQ0FDSixTQUFTLEVBQ1QsU0FBUyxDQUNaLENBQUM7QUFDTixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc01vYmlsZUFwcCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgUFJPUF9BTlksIFBST1BfQk9PTEVBTiwgUFJPUF9OVU1CRVIsIFBST1BfU1RSSU5HLCByZWdpc3RlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay93aWRnZXQtcHJvcHMnO1xuXG5leHBvcnQgY29uc3QgdGltZVByb3BzID0gbmV3IE1hcChcbiAgICBbXG4gICAgICAgIFsnYXV0b2ZvY3VzJywgUFJPUF9CT09MRUFOXSxcbiAgICAgICAgWydjbGFzcycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgWydkYXRhdmFsdWVzb3VyY2UnLCBQUk9QX0FOWV0sXG4gICAgICAgIFsnZGF0YXZhbHVlJywgUFJPUF9TVFJJTkddLFxuICAgICAgICBbJ2Rpc2FibGVkJywgUFJPUF9CT09MRUFOXSxcbiAgICAgICAgWydoaW50JywgUFJPUF9TVFJJTkddLFxuICAgICAgICBbJ2hvdXJzdGVwJywge3ZhbHVlOiAxLCAuLi5QUk9QX05VTUJFUn1dLFxuICAgICAgICBbJ21heHRpbWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgIFsnbWludGltZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgWydtaW51dGVzdGVwJywge3ZhbHVlOiAxNSwgLi4uUFJPUF9OVU1CRVJ9XSxcbiAgICAgICAgWyduYW1lJywgUFJPUF9TVFJJTkddLFxuICAgICAgICBbJ291dHB1dGZvcm1hdCcsIHt2YWx1ZTogJ0hIOm1tOnNzJywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgWydwbGFjZWhvbGRlcicsIHt2YWx1ZTogJ1NlbGVjdCB0aW1lJywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgWydyZWFkb25seScsIFBST1BfQk9PTEVBTl0sXG4gICAgICAgIFsncmVxdWlyZWQnLCBQUk9QX0JPT0xFQU5dLFxuICAgICAgICBbJ3Nob3J0Y3V0a2V5JywgUFJPUF9TVFJJTkddLFxuICAgICAgICBbJ3Nob3cnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgICAgICBbJ3Nob3dkcm9wZG93bm9uJywge3ZhbHVlOiAnZGVmYXVsdCcsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgIFsnc2Vjb25kc3N0ZXAnLCB7dmFsdWU6IDEsIC4uLlBST1BfTlVNQkVSfV0sXG4gICAgICAgIFsndGFiaW5kZXgnLCB7dmFsdWU6IDAsIC4uLlBST1BfTlVNQkVSfV0sXG4gICAgICAgIFsndGltZXBhdHRlcm4nLCBQUk9QX1NUUklOR10sXG4gICAgICAgIFsndGltZXN0YW1wJywgUFJPUF9TVFJJTkddXG4gICAgXVxuKTtcblxuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyUHJvcHMgPSAoKSA9PiB7XG4gICAgaWYgKGlzTW9iaWxlQXBwKCkpIHtcbiAgICAgICAgdGltZVByb3BzLnNldCgndGltZXBhdHRlcm4nLCB7dmFsdWU6ICdISDptbScsIC4uLlBST1BfU1RSSU5HfSk7XG4gICAgfVxuICAgIHJlZ2lzdGVyKFxuICAgICAgICAnd20tdGltZScsXG4gICAgICAgIHRpbWVQcm9wc1xuICAgICk7XG59O1xuIl19