import * as tslib_1 from "tslib";
import { Component, ContentChild, ContentChildren, Injector, QueryList } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './login.props';
import { ButtonComponent } from '../button/button.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { FormComponent } from '../form/form.component';
var WIDGET_INFO = { widgetType: 'wm-login', hostClass: 'app-login' };
var LoginComponent = /** @class */ (function (_super) {
    tslib_1.__extends(LoginComponent, _super);
    function LoginComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_INFO) || this;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER);
        return _this;
    }
    LoginComponent.prototype.onSuccessCB = function () {
        this.invokeEventCallback('success');
    };
    LoginComponent.prototype.onErrorCB = function (error) {
        this.loginMessage = {
            type: 'error',
            caption: this.errormessage || error || this.appLocale.LABEL_INVALID_USERNAME_OR_PASSWORD,
            show: true
        };
        this.invokeEventCallback('error');
    };
    LoginComponent.prototype.getLoginDetails = function () {
        return this.formCmp.dataoutput;
    };
    LoginComponent.prototype.doLogin = function () {
        if (this.eventsource) {
            this.eventsource.invoke({ loginInfo: this.getLoginDetails() }, this.onSuccessCB.bind(this), this.onErrorCB.bind(this));
        }
        else {
            console.warn('Default action "loginAction" does not exist. Either create the Action or assign an event to onSubmit of the login widget');
        }
    };
    LoginComponent.prototype.initLoginButtonActions = function () {
        var _this = this;
        this.loginBtnCmp.getNativeElement().addEventListener('click', function (event) {
            // if no event is attached to the onSubmit of login widget or loginButton inside it, invoke default login action
            if (!_this.nativeElement.hasAttribute('submit.event') && !_this.loginBtnCmp.getNativeElement().hasAttribute('click.event') && !_this.loginBtnCmp.getNativeElement().hasAttribute('tap.event')) {
                _this.doLogin();
            }
        });
    };
    LoginComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        _super.prototype.ngAfterViewInit.call(this);
        // suppresses the default form submission (in browsers like Firefox)
        this.formCmp.getNativeElement().addEventListener('submit', function (e) { return e.preventDefault(); });
        // get login button component
        this.buttonComponents.forEach(function (cmp) {
            if (cmp.getNativeElement().getAttribute('name') === 'loginButton' || _.includes(cmp.getNativeElement().classList, 'app-login-button')) {
                if (_this.loginBtnCmp) {
                    return;
                }
                _this.loginBtnCmp = cmp;
                _this.initLoginButtonActions();
            }
        });
    };
    LoginComponent.initializeProps = registerProps();
    LoginComponent.decorators = [
        { type: Component, args: [{
                    selector: 'div[wmLogin]',
                    template: "<p wmMessage class=\"app-login-message\" show.bind=\"loginMessage.show\" caption.bind=\"loginMessage.caption\" type.bind=\"loginMessage.type\"></p>\n<ng-content></ng-content>\n",
                    providers: [
                        provideAsWidgetRef(LoginComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    LoginComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    LoginComponent.propDecorators = {
        formCmp: [{ type: ContentChild, args: [FormComponent,] }],
        buttonComponents: [{ type: ContentChildren, args: [ButtonComponent, { descendants: true },] }]
    };
    return LoginComponent;
}(StylableComponent));
export { LoginComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9sb2dpbi9sb2dpbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUk3RyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDbkUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDakUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRXZELElBQU0sV0FBVyxHQUFHLEVBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFJckU7SUFPb0MsMENBQWlCO0lBV2pELHdCQUFZLEdBQWE7UUFBekIsWUFDSSxrQkFBTSxHQUFHLEVBQUUsV0FBVyxDQUFDLFNBRTFCO1FBREcsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSSxFQUFFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztJQUNsRSxDQUFDO0lBRUQsb0NBQVcsR0FBWDtRQUNJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsa0NBQVMsR0FBVCxVQUFVLEtBQU07UUFDWixJQUFJLENBQUMsWUFBWSxHQUFHO1lBQ2hCLElBQUksRUFBRSxPQUFPO1lBQ2IsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsa0NBQWtDO1lBQ3hGLElBQUksRUFBRSxJQUFJO1NBQ2IsQ0FBQztRQUNGLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsd0NBQWUsR0FBZjtRQUNJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7SUFDbkMsQ0FBQztJQUVELGdDQUFPLEdBQVA7UUFDSSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUN4SDthQUFNO1lBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQywwSEFBMEgsQ0FBQyxDQUFDO1NBQzVJO0lBQ0wsQ0FBQztJQUVELCtDQUFzQixHQUF0QjtRQUFBLGlCQVFDO1FBUEcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFBLEtBQUs7WUFFL0QsZ0hBQWdIO1lBQ2hILElBQUksQ0FBQyxLQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUN4TCxLQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDbEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCx3Q0FBZSxHQUFmO1FBQUEsaUJBZ0JDO1FBZkcsaUJBQU0sZUFBZSxXQUFFLENBQUM7UUFFeEIsb0VBQW9FO1FBQ3BFLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsY0FBYyxFQUFFLEVBQWxCLENBQWtCLENBQUMsQ0FBQztRQUVwRiw2QkFBNkI7UUFDN0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7WUFDN0IsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssYUFBYSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDLEVBQUU7Z0JBQ25JLElBQUksS0FBSSxDQUFDLFdBQVcsRUFBRTtvQkFDbEIsT0FBTztpQkFDVjtnQkFDRCxLQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztnQkFDdkIsS0FBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7YUFDakM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFsRU0sOEJBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsY0FBYztvQkFDeEIsNExBQXFDO29CQUNyQyxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsY0FBYyxDQUFDO3FCQUNyQztpQkFDSjs7OztnQkFyQmlFLFFBQVE7OzswQkEwQnJFLFlBQVksU0FBQyxhQUFhO21DQUMxQixlQUFlLFNBQUMsZUFBZSxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQzs7SUErRHpELHFCQUFDO0NBQUEsQUEzRUQsQ0FPb0MsaUJBQWlCLEdBb0VwRDtTQXBFWSxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgQ29tcG9uZW50LCBDb250ZW50Q2hpbGQsIENvbnRlbnRDaGlsZHJlbiwgSW5qZWN0b3IsIFF1ZXJ5TGlzdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyAkYXBwRGlnZXN0IH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2xvZ2luLnByb3BzJztcbmltcG9ydCB7IEJ1dHRvbkNvbXBvbmVudCB9IGZyb20gJy4uL2J1dHRvbi9idXR0b24uY29tcG9uZW50JztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBGb3JtQ29tcG9uZW50IH0gZnJvbSAnLi4vZm9ybS9mb3JtLmNvbXBvbmVudCc7XG5cbmNvbnN0IFdJREdFVF9JTkZPID0ge3dpZGdldFR5cGU6ICd3bS1sb2dpbicsIGhvc3RDbGFzczogJ2FwcC1sb2dpbid9O1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZGl2W3dtTG9naW5dJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vbG9naW4uY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoTG9naW5Db21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBMb2dpbkNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcbiAgICBsb2dpbkJ0bkNtcDogQnV0dG9uQ29tcG9uZW50O1xuXG4gICAgQENvbnRlbnRDaGlsZChGb3JtQ29tcG9uZW50KSBmb3JtQ21wOiBGb3JtQ29tcG9uZW50O1xuICAgIEBDb250ZW50Q2hpbGRyZW4oQnV0dG9uQ29tcG9uZW50LCB7ZGVzY2VuZGFudHM6IHRydWV9KSBidXR0b25Db21wb25lbnRzOiBRdWVyeUxpc3Q8QnV0dG9uQ29tcG9uZW50PjtcblxuICAgIGxvZ2luTWVzc2FnZTogeyB0eXBlPzogc3RyaW5nOyBjYXB0aW9uPzogYW55OyBzaG93PzogYm9vbGVhbjsgfTtcbiAgICBlcnJvcm1lc3NhZ2U6IGFueTtcbiAgICBldmVudHNvdXJjZTtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfSU5GTyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLkNPTlRBSU5FUik7XG4gICAgfVxuXG4gICAgb25TdWNjZXNzQ0IoKSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc3VjY2VzcycpO1xuICAgIH1cblxuICAgIG9uRXJyb3JDQihlcnJvcj8pIHtcbiAgICAgICAgdGhpcy5sb2dpbk1lc3NhZ2UgPSB7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgY2FwdGlvbjogdGhpcy5lcnJvcm1lc3NhZ2UgfHwgZXJyb3IgfHwgdGhpcy5hcHBMb2NhbGUuTEFCRUxfSU5WQUxJRF9VU0VSTkFNRV9PUl9QQVNTV09SRCxcbiAgICAgICAgICAgIHNob3c6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdlcnJvcicpO1xuICAgIH1cblxuICAgIGdldExvZ2luRGV0YWlscygpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5mb3JtQ21wLmRhdGFvdXRwdXQ7XG4gICAgfVxuXG4gICAgZG9Mb2dpbigpIHtcbiAgICAgICAgaWYgKHRoaXMuZXZlbnRzb3VyY2UpIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzb3VyY2UuaW52b2tlKHtsb2dpbkluZm86IHRoaXMuZ2V0TG9naW5EZXRhaWxzKCl9LCB0aGlzLm9uU3VjY2Vzc0NCLmJpbmQodGhpcyksIHRoaXMub25FcnJvckNCLmJpbmQodGhpcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdEZWZhdWx0IGFjdGlvbiBcImxvZ2luQWN0aW9uXCIgZG9lcyBub3QgZXhpc3QuIEVpdGhlciBjcmVhdGUgdGhlIEFjdGlvbiBvciBhc3NpZ24gYW4gZXZlbnQgdG8gb25TdWJtaXQgb2YgdGhlIGxvZ2luIHdpZGdldCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5pdExvZ2luQnV0dG9uQWN0aW9ucygpIHtcbiAgICAgICAgdGhpcy5sb2dpbkJ0bkNtcC5nZXROYXRpdmVFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG5cbiAgICAgICAgICAgIC8vIGlmIG5vIGV2ZW50IGlzIGF0dGFjaGVkIHRvIHRoZSBvblN1Ym1pdCBvZiBsb2dpbiB3aWRnZXQgb3IgbG9naW5CdXR0b24gaW5zaWRlIGl0LCBpbnZva2UgZGVmYXVsdCBsb2dpbiBhY3Rpb25cbiAgICAgICAgICAgIGlmICghdGhpcy5uYXRpdmVFbGVtZW50Lmhhc0F0dHJpYnV0ZSgnc3VibWl0LmV2ZW50JykgJiYgIXRoaXMubG9naW5CdG5DbXAuZ2V0TmF0aXZlRWxlbWVudCgpLmhhc0F0dHJpYnV0ZSgnY2xpY2suZXZlbnQnKSAmJiAhdGhpcy5sb2dpbkJ0bkNtcC5nZXROYXRpdmVFbGVtZW50KCkuaGFzQXR0cmlidXRlKCd0YXAuZXZlbnQnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZG9Mb2dpbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuXG4gICAgICAgIC8vIHN1cHByZXNzZXMgdGhlIGRlZmF1bHQgZm9ybSBzdWJtaXNzaW9uIChpbiBicm93c2VycyBsaWtlIEZpcmVmb3gpXG4gICAgICAgIHRoaXMuZm9ybUNtcC5nZXROYXRpdmVFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuXG4gICAgICAgIC8vIGdldCBsb2dpbiBidXR0b24gY29tcG9uZW50XG4gICAgICAgIHRoaXMuYnV0dG9uQ29tcG9uZW50cy5mb3JFYWNoKGNtcCA9PiB7XG4gICAgICAgICAgICBpZiAoY21wLmdldE5hdGl2ZUVsZW1lbnQoKS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSA9PT0gJ2xvZ2luQnV0dG9uJyB8fCBfLmluY2x1ZGVzKGNtcC5nZXROYXRpdmVFbGVtZW50KCkuY2xhc3NMaXN0LCAnYXBwLWxvZ2luLWJ1dHRvbicpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubG9naW5CdG5DbXApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2luQnRuQ21wID0gY21wO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdExvZ2luQnV0dG9uQWN0aW9ucygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=