import { getAttrMarkup, register } from '@wm/transpiler';
const tagName = 'div';
register('wm-card-actions', () => {
    return {
        pre: attrs => `<${tagName} wmCardActions ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZC1hY3Rpb25zLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jYXJkL2NhcmQtYWN0aW9ucy9jYXJkLWFjdGlvbnMuYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBaUIsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEUsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBRXRCLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxHQUFrQixFQUFFO0lBQzVDLE9BQU87UUFDSCxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLE9BQU8sa0JBQWtCLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRztRQUNsRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxPQUFPLEdBQUc7S0FDOUIsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsZUFBZSxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRBdHRyTWFya3VwLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcblxuY29uc3QgdGFnTmFtZSA9ICdkaXYnO1xuXG5yZWdpc3Rlcignd20tY2FyZC1hY3Rpb25zJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtQ2FyZEFjdGlvbnMgJHtnZXRBdHRyTWFya3VwKGF0dHJzKX0+YCxcbiAgICAgICAgcG9zdDogKCkgPT4gYDwvJHt0YWdOYW1lfT5gXG4gICAgfTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTsiXX0=