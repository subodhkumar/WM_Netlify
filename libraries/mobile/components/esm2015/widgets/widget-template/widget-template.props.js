import { PROP_BOOLEAN, PROP_STRING, register } from '@wm/components';
export const registerProps = () => {
    register('wm-widget-template', new Map([
        ['name', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)]
    ]));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0LXRlbXBsYXRlLnByb3BzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy93aWRnZXQtdGVtcGxhdGUvd2lkZ2V0LXRlbXBsYXRlLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXJFLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxHQUFHLEVBQUU7SUFDOUIsUUFBUSxDQUNKLG9CQUFvQixFQUNwQixJQUFJLEdBQUcsQ0FDSDtRQUNJLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQztRQUNyQixDQUFDLE1BQU0sa0JBQUcsS0FBSyxFQUFFLElBQUksSUFBSyxZQUFZLEVBQUU7S0FDM0MsQ0FDSixDQUNKLENBQUM7QUFDTixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQUk9QX0JPT0xFQU4sIFBST1BfU1RSSU5HLCByZWdpc3RlciB9IGZyb20gJ0B3bS9jb21wb25lbnRzJztcblxuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyUHJvcHMgPSAoKSA9PiB7XG4gICAgcmVnaXN0ZXIoXG4gICAgICAgICd3bS13aWRnZXQtdGVtcGxhdGUnLFxuICAgICAgICBuZXcgTWFwKFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFsnbmFtZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgICAgICBbJ3Nob3cnLCB7dmFsdWU6IHRydWUsIC4uLlBST1BfQk9PTEVBTn1dXG4gICAgICAgICAgICBdXG4gICAgICAgIClcbiAgICApO1xufTtcbiJdfQ==