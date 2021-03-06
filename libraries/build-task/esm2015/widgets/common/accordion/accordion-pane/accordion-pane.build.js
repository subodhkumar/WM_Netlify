import { getAttrMarkup, register } from '@wm/transpiler';
const tagName = 'div';
register('wm-accordionpane', () => {
    return {
        pre: attrs => `<${tagName} wmAccordionPane partialContainer wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLXBhbmUuYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2FjY29yZGlvbi9hY2NvcmRpb24tcGFuZS9hY2NvcmRpb24tcGFuZS5idWlsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFpQixRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4RSxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFFdEIsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEdBQWtCLEVBQUU7SUFDN0MsT0FBTztRQUNILEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksT0FBTyxpRUFBaUUsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHO1FBQ2pILElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLE9BQU8sR0FBRztLQUM5QixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxlQUFlLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEF0dHJNYXJrdXAsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuXG5jb25zdCB0YWdOYW1lID0gJ2Rpdic7XG5cbnJlZ2lzdGVyKCd3bS1hY2NvcmRpb25wYW5lJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtQWNjb3JkaW9uUGFuZSBwYXJ0aWFsQ29udGFpbmVyIHdtLW5hdmlnYWJsZS1lbGVtZW50PVwidHJ1ZVwiICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9PmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=