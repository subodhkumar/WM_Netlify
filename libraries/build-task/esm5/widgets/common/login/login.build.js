import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'div';
register('wm-login', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmLogin " + getAttrMarkup(attrs) + " eventsource.bind=\"Actions.loginAction\">"; },
        post: function () { return "</" + tagName + ">"; },
        provide: function () {
            var provider = new Map();
            provider.set('isLogin', true);
            return provider;
        }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2xvZ2luL2xvZ2luLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztBQUV0QixRQUFRLENBQUMsVUFBVSxFQUFFO0lBQ2pCLE9BQU87UUFDSCxHQUFHLEVBQUUsVUFBQSxLQUFLLElBQUksT0FBQSxNQUFJLE9BQU8saUJBQVksYUFBYSxDQUFDLEtBQUssQ0FBQywrQ0FBMEMsRUFBckYsQ0FBcUY7UUFDbkcsSUFBSSxFQUFFLGNBQU0sT0FBQSxPQUFLLE9BQU8sTUFBRyxFQUFmLENBQWU7UUFDM0IsT0FBTyxFQUFFO1lBQ0wsSUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMzQixRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5QixPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsZ0JBQWUsY0FBTyxDQUFDLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRBdHRyTWFya3VwLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcblxuY29uc3QgdGFnTmFtZSA9ICdkaXYnO1xuXG5yZWdpc3Rlcignd20tbG9naW4nLCAoKTogSUJ1aWxkVGFza0RlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJlOiBhdHRycyA9PiBgPCR7dGFnTmFtZX0gd21Mb2dpbiAke2dldEF0dHJNYXJrdXAoYXR0cnMpfSBldmVudHNvdXJjZS5iaW5kPVwiQWN0aW9ucy5sb2dpbkFjdGlvblwiPmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YCxcbiAgICAgICAgcHJvdmlkZTogKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBwcm92aWRlci5zZXQoJ2lzTG9naW4nLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiBwcm92aWRlcjtcbiAgICAgICAgfVxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=