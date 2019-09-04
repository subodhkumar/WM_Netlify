import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'div';
register('wm-dialog', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmDialog " + getAttrMarkup(attrs) + " wm-navigable-element=\"true\"><ng-template #dialogBody>"; },
        post: function () { return "</ng-template></" + tagName + ">"; }
    };
});
// Todo:vinay remove wm-view in migration
register('wm-view', function () {
    return {
        pre: function (attrs) { return ''; },
        post: function () { return ''; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9kaWFsb2cvZGVzaWduLWRpYWxvZy9kaWFsb2cuYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBaUIsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEUsSUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBRXRCLFFBQVEsQ0FBQyxXQUFXLEVBQUU7SUFDbEIsT0FBTztRQUNILEdBQUcsRUFBRSxVQUFBLEtBQUssSUFBSSxPQUFBLE1BQUksT0FBTyxrQkFBYSxhQUFhLENBQUMsS0FBSyxDQUFDLDZEQUF3RCxFQUFwRyxDQUFvRztRQUNsSCxJQUFJLEVBQUUsY0FBTSxPQUFBLHFCQUFtQixPQUFPLE1BQUcsRUFBN0IsQ0FBNkI7S0FDNUMsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgseUNBQXlDO0FBQ3pDLFFBQVEsQ0FBQyxTQUFTLEVBQUU7SUFDaEIsT0FBTztRQUNILEdBQUcsRUFBRSxVQUFBLEtBQUssSUFBSSxPQUFBLEVBQUUsRUFBRixDQUFFO1FBQ2hCLElBQUksRUFBRSxjQUFNLE9BQUEsRUFBRSxFQUFGLENBQUU7S0FDakIsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsZ0JBQWUsY0FBTyxDQUFDLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRBdHRyTWFya3VwLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcblxuY29uc3QgdGFnTmFtZSA9ICdkaXYnO1xuXG5yZWdpc3Rlcignd20tZGlhbG9nJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtRGlhbG9nICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9IHdtLW5hdmlnYWJsZS1lbGVtZW50PVwidHJ1ZVwiPjxuZy10ZW1wbGF0ZSAjZGlhbG9nQm9keT5gLFxuICAgICAgICBwb3N0OiAoKSA9PiBgPC9uZy10ZW1wbGF0ZT48LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuLy8gVG9kbzp2aW5heSByZW1vdmUgd20tdmlldyBpbiBtaWdyYXRpb25cbnJlZ2lzdGVyKCd3bS12aWV3JywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4gJycsXG4gICAgICAgIHBvc3Q6ICgpID0+ICcnXG4gICAgfTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTtcbiJdfQ==