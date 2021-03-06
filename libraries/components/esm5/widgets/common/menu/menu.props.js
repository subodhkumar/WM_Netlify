import * as tslib_1 from "tslib";
import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';
export var registerProps = function () {
    register('wm-menu', new Map([
        ['accessroles', tslib_1.__assign({ value: 'Everyone' }, PROP_STRING)],
        ['animateitems', PROP_STRING],
        ['autoclose', tslib_1.__assign({ value: 'always' }, PROP_STRING)],
        ['autoopen', tslib_1.__assign({ value: 'never' }, PROP_STRING)],
        ['caption', PROP_STRING],
        ['class', PROP_STRING],
        ['dataset', tslib_1.__assign({ value: 'Menu Item 1, Menu Item 2, Menu Item 3' }, PROP_ANY)],
        ['hint', tslib_1.__assign({ value: '' }, PROP_STRING)],
        ['iconclass', PROP_STRING],
        ['iconposition', tslib_1.__assign({ value: 'left' }, PROP_STRING)],
        ['itemaction', PROP_STRING],
        ['itemchildren', PROP_STRING],
        ['itemclass', PROP_STRING],
        ['itemicon', PROP_STRING],
        ['itemlabel', PROP_STRING],
        ['itemlink', PROP_STRING],
        ['itemtarget', PROP_STRING],
        ['linktarget', tslib_1.__assign({ value: '_self' }, PROP_STRING)],
        ['menuclass', PROP_STRING],
        ['menulayout', PROP_STRING],
        ['menuposition', PROP_STRING],
        ['name', PROP_STRING],
        ['orderby', PROP_STRING],
        ['shortcutkey', PROP_STRING],
        ['show', tslib_1.__assign({ value: true }, PROP_BOOLEAN)],
        ['tabindex', tslib_1.__assign({ value: 0 }, PROP_NUMBER)],
        ['type', tslib_1.__assign({ value: 'menu' }, PROP_STRING)],
        ['userrole', PROP_STRING]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5wcm9wcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbWVudS9tZW51LnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTFHLE1BQU0sQ0FBQyxJQUFNLGFBQWEsR0FBRztJQUN6QixRQUFRLENBQ0osU0FBUyxFQUNULElBQUksR0FBRyxDQUNIO1FBQ0ksQ0FBQyxhQUFhLHFCQUFHLEtBQUssRUFBRSxVQUFVLElBQUssV0FBVyxFQUFFO1FBQ3BELENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQztRQUM3QixDQUFDLFdBQVcscUJBQUcsS0FBSyxFQUFFLFFBQVEsSUFBSyxXQUFXLEVBQUU7UUFDaEQsQ0FBQyxVQUFVLHFCQUFHLEtBQUssRUFBRSxPQUFPLElBQUssV0FBVyxFQUFFO1FBQzlDLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQztRQUN4QixDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7UUFDdEIsQ0FBQyxTQUFTLHFCQUFHLEtBQUssRUFBRSx1Q0FBdUMsSUFBSyxRQUFRLEVBQUU7UUFDMUUsQ0FBQyxNQUFNLHFCQUFHLEtBQUssRUFBRSxFQUFFLElBQUssV0FBVyxFQUFFO1FBQ3JDLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQztRQUMxQixDQUFDLGNBQWMscUJBQUcsS0FBSyxFQUFFLE1BQU0sSUFBSyxXQUFXLEVBQUU7UUFDakQsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDO1FBQzNCLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQztRQUM3QixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7UUFDMUIsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDO1FBQ3pCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQztRQUMxQixDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUM7UUFDekIsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDO1FBQzNCLENBQUMsWUFBWSxxQkFBRyxLQUFLLEVBQUUsT0FBTyxJQUFLLFdBQVcsRUFBRTtRQUNoRCxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7UUFDMUIsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDO1FBQzNCLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQztRQUM3QixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7UUFDckIsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDO1FBQ3hCLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQztRQUM1QixDQUFDLE1BQU0scUJBQUcsS0FBSyxFQUFFLElBQUksSUFBSyxZQUFZLEVBQUU7UUFDeEMsQ0FBQyxVQUFVLHFCQUFHLEtBQUssRUFBRSxDQUFDLElBQUssV0FBVyxFQUFFO1FBQ3hDLENBQUMsTUFBTSxxQkFBRyxLQUFLLEVBQUUsTUFBTSxJQUFLLFdBQVcsRUFBRTtRQUN6QyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUM7S0FDNUIsQ0FDSixDQUNKLENBQUM7QUFDTixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQUk9QX0FOWSwgUFJPUF9CT09MRUFOLCBQUk9QX05VTUJFUiwgUFJPUF9TVFJJTkcsIHJlZ2lzdGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1wcm9wcyc7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIHJlZ2lzdGVyKFxuICAgICAgICAnd20tbWVudScsXG4gICAgICAgIG5ldyBNYXAoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgWydhY2Nlc3Nyb2xlcycsIHt2YWx1ZTogJ0V2ZXJ5b25lJywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ2FuaW1hdGVpdGVtcycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2F1dG9jbG9zZScsIHt2YWx1ZTogJ2Fsd2F5cycsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgICAgICAgICAgWydhdXRvb3BlbicsIHt2YWx1ZTogJ25ldmVyJywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgICAgICBbJ2NhcHRpb24nLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydjbGFzcycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2RhdGFzZXQnLCB7dmFsdWU6ICdNZW51IEl0ZW0gMSwgTWVudSBJdGVtIDIsIE1lbnUgSXRlbSAzJywgLi4uUFJPUF9BTll9XSxcbiAgICAgICAgICAgICAgICBbJ2hpbnQnLCB7dmFsdWU6ICcnLCAuLi5QUk9QX1NUUklOR31dLFxuICAgICAgICAgICAgICAgIFsnaWNvbmNsYXNzJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaWNvbnBvc2l0aW9uJywge3ZhbHVlOiAnbGVmdCcsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgICAgICAgICAgWydpdGVtYWN0aW9uJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaXRlbWNoaWxkcmVuJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaXRlbWNsYXNzJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnaXRlbWljb24nLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydpdGVtbGFiZWwnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydpdGVtbGluaycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ2l0ZW10YXJnZXQnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydsaW5rdGFyZ2V0Jywge3ZhbHVlOiAnX3NlbGYnLCAuLi5QUk9QX1NUUklOR31dLFxuICAgICAgICAgICAgICAgIFsnbWVudWNsYXNzJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnbWVudWxheW91dCcsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ21lbnVwb3NpdGlvbicsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ25hbWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydvcmRlcmJ5JywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgICAgIFsnc2hvcnRjdXRrZXknLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICAgICAgWydzaG93Jywge3ZhbHVlOiB0cnVlLCAuLi5QUk9QX0JPT0xFQU59XSxcbiAgICAgICAgICAgICAgICBbJ3RhYmluZGV4Jywge3ZhbHVlOiAwLCAuLi5QUk9QX05VTUJFUn1dLFxuICAgICAgICAgICAgICAgIFsndHlwZScsIHt2YWx1ZTogJ21lbnUnLCAuLi5QUk9QX1NUUklOR31dLFxuICAgICAgICAgICAgICAgIFsndXNlcnJvbGUnLCBQUk9QX1NUUklOR11cbiAgICAgICAgICAgIF1cbiAgICAgICAgKVxuICAgICk7XG59O1xuIl19