import * as tslib_1 from "tslib";
import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';
export var textareaProps = new Map([
    ['autofocus', PROP_BOOLEAN],
    ['class', PROP_STRING],
    ['datavaluesource', PROP_ANY],
    ['datavalue', PROP_STRING],
    ['disabled', PROP_BOOLEAN],
    ['hint', PROP_STRING],
    ['maxchars', PROP_NUMBER],
    ['name', PROP_STRING],
    ['placeholder', tslib_1.__assign({ value: 'Place your text' }, PROP_STRING)],
    ['readonly', PROP_BOOLEAN],
    ['required', PROP_BOOLEAN],
    ['shortcutkey', PROP_STRING],
    ['show', tslib_1.__assign({ value: true }, PROP_BOOLEAN)],
    ['tabindex', tslib_1.__assign({ value: 0 }, PROP_NUMBER)],
    ['updateon', PROP_STRING]
]);
export var registerProps = function () {
    register('wm-textarea', textareaProps);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dGFyZWEucHJvcHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RleHRhcmVhL3RleHRhcmVhLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTFHLE1BQU0sQ0FBQyxJQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsQ0FDaEM7SUFDSSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUM7SUFDM0IsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDO0lBQ3RCLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDO0lBQzdCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQztJQUMxQixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUM7SUFDMUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDO0lBQ3JCLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQztJQUN6QixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7SUFDckIsQ0FBQyxhQUFhLHFCQUFHLEtBQUssRUFBRSxpQkFBaUIsSUFBSyxXQUFXLEVBQUU7SUFDM0QsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDO0lBQzFCLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQztJQUMxQixDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUM7SUFDNUIsQ0FBQyxNQUFNLHFCQUFHLEtBQUssRUFBRSxJQUFJLElBQUssWUFBWSxFQUFFO0lBQ3hDLENBQUMsVUFBVSxxQkFBRyxLQUFLLEVBQUUsQ0FBQyxJQUFLLFdBQVcsRUFBRTtJQUN4QyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUM7Q0FDNUIsQ0FDSixDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0sYUFBYSxHQUFHO0lBQ3pCLFFBQVEsQ0FDSixhQUFhLEVBQ2IsYUFBYSxDQUNoQixDQUFDO0FBQ04sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUFJPUF9BTlksIFBST1BfQk9PTEVBTiwgUFJPUF9OVU1CRVIsIFBST1BfU1RSSU5HLCByZWdpc3RlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay93aWRnZXQtcHJvcHMnO1xuXG5leHBvcnQgY29uc3QgdGV4dGFyZWFQcm9wcyA9IG5ldyBNYXAoXG4gICAgW1xuICAgICAgICBbJ2F1dG9mb2N1cycsIFBST1BfQk9PTEVBTl0sXG4gICAgICAgIFsnY2xhc3MnLCBQUk9QX1NUUklOR10sXG4gICAgICAgIFsnZGF0YXZhbHVlc291cmNlJywgUFJPUF9BTlldLFxuICAgICAgICBbJ2RhdGF2YWx1ZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgWydkaXNhYmxlZCcsIFBST1BfQk9PTEVBTl0sXG4gICAgICAgIFsnaGludCcsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgWydtYXhjaGFycycsIFBST1BfTlVNQkVSXSxcbiAgICAgICAgWyduYW1lJywgUFJPUF9TVFJJTkddLFxuICAgICAgICBbJ3BsYWNlaG9sZGVyJywge3ZhbHVlOiAnUGxhY2UgeW91ciB0ZXh0JywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgWydyZWFkb25seScsIFBST1BfQk9PTEVBTl0sXG4gICAgICAgIFsncmVxdWlyZWQnLCBQUk9QX0JPT0xFQU5dLFxuICAgICAgICBbJ3Nob3J0Y3V0a2V5JywgUFJPUF9TVFJJTkddLFxuICAgICAgICBbJ3Nob3cnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dLFxuICAgICAgICBbJ3RhYmluZGV4Jywge3ZhbHVlOiAwLCAuLi5QUk9QX05VTUJFUn1dLFxuICAgICAgICBbJ3VwZGF0ZW9uJywgUFJPUF9TVFJJTkddXG4gICAgXVxuKTtcblxuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyUHJvcHMgPSAoKSA9PiB7XG4gICAgcmVnaXN0ZXIoXG4gICAgICAgICd3bS10ZXh0YXJlYScsXG4gICAgICAgIHRleHRhcmVhUHJvcHNcbiAgICApO1xufTtcbiJdfQ==