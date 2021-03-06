import * as tslib_1 from "tslib";
import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';
export var registerProps = function () {
    register('wm-tabpane', new Map([
        ['badgevalue', PROP_STRING],
        ['badgetype', tslib_1.__assign({ value: 'default' }, PROP_STRING)],
        ['class', PROP_STRING],
        ['content', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['heading', PROP_STRING],
        ['isdefaulttab', PROP_STRING],
        ['name', PROP_STRING],
        ['paneicon', PROP_STRING],
        ['show', tslib_1.__assign({ value: true }, PROP_BOOLEAN)],
        ['smoothscroll', tslib_1.__assign({ value: true }, PROP_BOOLEAN)],
        ['tabindex', tslib_1.__assign({ value: 0 }, PROP_NUMBER)],
        ['title', tslib_1.__assign({ value: 'Tab Title' }, PROP_STRING)]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLXBhbmUucHJvcHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RhYnMvdGFiLXBhbmUvdGFiLXBhbmUucHJvcHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVuRyxNQUFNLENBQUMsSUFBTSxhQUFhLEdBQUc7SUFDekIsUUFBUSxDQUNKLFlBQVksRUFDWixJQUFJLEdBQUcsQ0FDSDtRQUNJLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQztRQUMzQixDQUFDLFdBQVcscUJBQUcsS0FBSyxFQUFFLFNBQVMsSUFBSyxXQUFXLEVBQUU7UUFDakQsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDO1FBQ3RCLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQztRQUN4QixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUM7UUFDMUIsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDO1FBQ3hCLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQztRQUM3QixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7UUFDckIsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDO1FBQ3pCLENBQUMsTUFBTSxxQkFBRyxLQUFLLEVBQUUsSUFBSSxJQUFLLFlBQVksRUFBRTtRQUN4QyxDQUFDLGNBQWMscUJBQUcsS0FBSyxFQUFFLElBQUksSUFBSyxZQUFZLEVBQUU7UUFDaEQsQ0FBQyxVQUFVLHFCQUFHLEtBQUssRUFBRSxDQUFDLElBQUssV0FBVyxFQUFFO1FBQ3hDLENBQUMsT0FBTyxxQkFBRyxLQUFLLEVBQUUsV0FBVyxJQUFLLFdBQVcsRUFBRTtLQUNsRCxDQUNKLENBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBST1BfQk9PTEVBTiwgUFJPUF9OVU1CRVIsIFBST1BfU1RSSU5HLCByZWdpc3RlciB9IGZyb20gJy4uLy4uLy4uL2ZyYW1ld29yay93aWRnZXQtcHJvcHMnO1xuXG5leHBvcnQgY29uc3QgcmVnaXN0ZXJQcm9wcyA9ICgpID0+IHtcbiAgICByZWdpc3RlcihcbiAgICAgICAgJ3dtLXRhYnBhbmUnLFxuICAgICAgICBuZXcgTWFwKFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFsnYmFkZ2V2YWx1ZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2JhZGdldHlwZScsIHt2YWx1ZTogJ2RlZmF1bHQnLCAuLi5QUk9QX1NUUklOR31dLFxuICAgICAgICAgICAgICAgIFsnY2xhc3MnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydjb250ZW50JywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnZGlzYWJsZWQnLCBQUk9QX0JPT0xFQU5dLFxuICAgICAgICAgICAgICAgIFsnaGVhZGluZycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2lzZGVmYXVsdHRhYicsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ25hbWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydwYW5laWNvbicsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ3Nob3cnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgICAgICAgICAgICAgIFsnc21vb3Roc2Nyb2xsJywge3ZhbHVlOiB0cnVlLCAuLi5QUk9QX0JPT0xFQU59XSxcbiAgICAgICAgICAgICAgICBbJ3RhYmluZGV4Jywge3ZhbHVlOiAwLCAuLi5QUk9QX05VTUJFUn1dLFxuICAgICAgICAgICAgICAgIFsndGl0bGUnLCB7dmFsdWU6ICdUYWIgVGl0bGUnLCAuLi5QUk9QX1NUUklOR31dXG4gICAgICAgICAgICBdXG4gICAgICAgIClcbiAgICApO1xufTtcbiJdfQ==