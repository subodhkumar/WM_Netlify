import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'div';
register('wm-mobile-tabbar', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmMobileTabbar " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLWJhci5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvdGFiYmFyL3RhYi1iYXIuYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBaUIsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEUsSUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBRXRCLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRTtJQUN6QixPQUFPO1FBQ0gsR0FBRyxFQUFFLFVBQUEsS0FBSyxJQUFJLE9BQUEsTUFBSSxPQUFPLHdCQUFtQixhQUFhLENBQUMsS0FBSyxDQUFDLE1BQUcsRUFBckQsQ0FBcUQ7UUFDbkUsSUFBSSxFQUFFLGNBQU0sT0FBQSxPQUFLLE9BQU8sTUFBRyxFQUFmLENBQWU7S0FDOUIsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsZ0JBQWUsY0FBTyxDQUFDLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRBdHRyTWFya3VwLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcblxuY29uc3QgdGFnTmFtZSA9ICdkaXYnO1xuXG5yZWdpc3Rlcignd20tbW9iaWxlLXRhYmJhcicsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcmU6IGF0dHJzID0+IGA8JHt0YWdOYW1lfSB3bU1vYmlsZVRhYmJhciAke2dldEF0dHJNYXJrdXAoYXR0cnMpfT5gLFxuICAgICAgICBwb3N0OiAoKSA9PiBgPC8ke3RhZ05hbWV9PmBcbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19