import { getAttrMarkup, register } from '@wm/transpiler';
const tagName = 'button';
register('wm-camera', () => {
    return {
        pre: attrs => `<${tagName} wmCamera ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FtZXJhLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jYW1lcmEvY2FtZXJhLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUV6QixRQUFRLENBQUMsV0FBVyxFQUFFLEdBQWtCLEVBQUU7SUFDdEMsT0FBTztRQUNILEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksT0FBTyxhQUFhLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRztRQUM3RCxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxPQUFPLEdBQUc7S0FDOUIsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsZUFBZSxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRBdHRyTWFya3VwLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcblxuY29uc3QgdGFnTmFtZSA9ICdidXR0b24nO1xuXG5yZWdpc3Rlcignd20tY2FtZXJhJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtQ2FtZXJhICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9PmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=