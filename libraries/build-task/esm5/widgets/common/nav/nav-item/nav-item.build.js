import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'li';
register('wm-nav-item', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmNavItem role=\"presentation\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2LWl0ZW0uYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL25hdi9uYXYtaXRlbS9uYXYtaXRlbS5idWlsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFpQixRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4RSxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFFckIsUUFBUSxDQUFDLGFBQWEsRUFBRTtJQUNwQixPQUFPO1FBQ0gsR0FBRyxFQUFFLFVBQUEsS0FBSyxJQUFJLE9BQUEsTUFBSSxPQUFPLHlDQUFrQyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQUcsRUFBcEUsQ0FBb0U7UUFDbEYsSUFBSSxFQUFFLGNBQU0sT0FBQSxPQUFLLE9BQU8sTUFBRyxFQUFmLENBQWU7S0FDOUIsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsZ0JBQWUsY0FBTyxDQUFDLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRBdHRyTWFya3VwLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcblxuY29uc3QgdGFnTmFtZSA9ICdsaSc7XG5cbnJlZ2lzdGVyKCd3bS1uYXYtaXRlbScsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcmU6IGF0dHJzID0+IGA8JHt0YWdOYW1lfSB3bU5hdkl0ZW0gcm9sZT1cInByZXNlbnRhdGlvblwiICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9PmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=