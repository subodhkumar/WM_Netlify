import { Component, ContentChild, ContentChildren, Injector, QueryList } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './login.props';
import { ButtonComponent } from '../button/button.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { FormComponent } from '../form/form.component';
const WIDGET_INFO = { widgetType: 'wm-login', hostClass: 'app-login' };
export class LoginComponent extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_INFO);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
    onSuccessCB() {
        this.invokeEventCallback('success');
    }
    onErrorCB(error) {
        this.loginMessage = {
            type: 'error',
            caption: this.errormessage || error || this.appLocale.LABEL_INVALID_USERNAME_OR_PASSWORD,
            show: true
        };
        this.invokeEventCallback('error');
    }
    getLoginDetails() {
        return this.formCmp.dataoutput;
    }
    doLogin() {
        if (this.eventsource) {
            this.eventsource.invoke({ loginInfo: this.getLoginDetails() }, this.onSuccessCB.bind(this), this.onErrorCB.bind(this));
        }
        else {
            console.warn('Default action "loginAction" does not exist. Either create the Action or assign an event to onSubmit of the login widget');
        }
    }
    initLoginButtonActions() {
        this.loginBtnCmp.getNativeElement().addEventListener('click', event => {
            // if no event is attached to the onSubmit of login widget or loginButton inside it, invoke default login action
            if (!this.nativeElement.hasAttribute('submit.event') && !this.loginBtnCmp.getNativeElement().hasAttribute('click.event') && !this.loginBtnCmp.getNativeElement().hasAttribute('tap.event')) {
                this.doLogin();
            }
        });
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        // suppresses the default form submission (in browsers like Firefox)
        this.formCmp.getNativeElement().addEventListener('submit', e => e.preventDefault());
        // get login button component
        this.buttonComponents.forEach(cmp => {
            if (cmp.getNativeElement().getAttribute('name') === 'loginButton' || _.includes(cmp.getNativeElement().classList, 'app-login-button')) {
                if (this.loginBtnCmp) {
                    return;
                }
                this.loginBtnCmp = cmp;
                this.initLoginButtonActions();
            }
        });
    }
}
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
LoginComponent.ctorParameters = () => [
    { type: Injector }
];
LoginComponent.propDecorators = {
    formCmp: [{ type: ContentChild, args: [FormComponent,] }],
    buttonComponents: [{ type: ContentChildren, args: [ButtonComponent, { descendants: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9sb2dpbi9sb2dpbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBSTdHLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFdkQsTUFBTSxXQUFXLEdBQUcsRUFBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQVdyRSxNQUFNLE9BQU8sY0FBZSxTQUFRLGlCQUFpQjtJQVdqRCxZQUFZLEdBQWE7UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVELFdBQVc7UUFDUCxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELFNBQVMsQ0FBQyxLQUFNO1FBQ1osSUFBSSxDQUFDLFlBQVksR0FBRztZQUNoQixJQUFJLEVBQUUsT0FBTztZQUNiLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGtDQUFrQztZQUN4RixJQUFJLEVBQUUsSUFBSTtTQUNiLENBQUM7UUFDRixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELGVBQWU7UUFDWCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO0lBQ25DLENBQUM7SUFFRCxPQUFPO1FBQ0gsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDeEg7YUFBTTtZQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsMEhBQTBILENBQUMsQ0FBQztTQUM1STtJQUNMLENBQUM7SUFFRCxzQkFBc0I7UUFDbEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRTtZQUVsRSxnSEFBZ0g7WUFDaEgsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ3hMLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNsQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGVBQWU7UUFDWCxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFeEIsb0VBQW9FO1FBQ3BFLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUVwRiw2QkFBNkI7UUFDN0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNoQyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxhQUFhLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLENBQUMsRUFBRTtnQkFDbkksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNsQixPQUFPO2lCQUNWO2dCQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDO2dCQUN2QixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzthQUNqQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7QUFsRU0sOEJBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFSNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxjQUFjO2dCQUN4Qiw0TEFBcUM7Z0JBQ3JDLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxjQUFjLENBQUM7aUJBQ3JDO2FBQ0o7Ozs7WUFyQmlFLFFBQVE7OztzQkEwQnJFLFlBQVksU0FBQyxhQUFhOytCQUMxQixlQUFlLFNBQUMsZUFBZSxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgQ29udGVudENoaWxkLCBDb250ZW50Q2hpbGRyZW4sIEluamVjdG9yLCBRdWVyeUxpc3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9sb2dpbi5wcm9wcyc7XG5pbXBvcnQgeyBCdXR0b25Db21wb25lbnQgfSBmcm9tICcuLi9idXR0b24vYnV0dG9uLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgRm9ybUNvbXBvbmVudCB9IGZyb20gJy4uL2Zvcm0vZm9ybS5jb21wb25lbnQnO1xuXG5jb25zdCBXSURHRVRfSU5GTyA9IHt3aWRnZXRUeXBlOiAnd20tbG9naW4nLCBob3N0Q2xhc3M6ICdhcHAtbG9naW4nfTtcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bUxvZ2luXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2xvZ2luLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKExvZ2luQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgTG9naW5Db21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG4gICAgbG9naW5CdG5DbXA6IEJ1dHRvbkNvbXBvbmVudDtcblxuICAgIEBDb250ZW50Q2hpbGQoRm9ybUNvbXBvbmVudCkgZm9ybUNtcDogRm9ybUNvbXBvbmVudDtcbiAgICBAQ29udGVudENoaWxkcmVuKEJ1dHRvbkNvbXBvbmVudCwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgYnV0dG9uQ29tcG9uZW50czogUXVlcnlMaXN0PEJ1dHRvbkNvbXBvbmVudD47XG5cbiAgICBsb2dpbk1lc3NhZ2U6IHsgdHlwZT86IHN0cmluZzsgY2FwdGlvbj86IGFueTsgc2hvdz86IGJvb2xlYW47IH07XG4gICAgZXJyb3JtZXNzYWdlOiBhbnk7XG4gICAgZXZlbnRzb3VyY2U7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0lORk8pO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5DT05UQUlORVIpO1xuICAgIH1cblxuICAgIG9uU3VjY2Vzc0NCKCkge1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3N1Y2Nlc3MnKTtcbiAgICB9XG5cbiAgICBvbkVycm9yQ0IoZXJyb3I/KSB7XG4gICAgICAgIHRoaXMubG9naW5NZXNzYWdlID0ge1xuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIGNhcHRpb246IHRoaXMuZXJyb3JtZXNzYWdlIHx8IGVycm9yIHx8IHRoaXMuYXBwTG9jYWxlLkxBQkVMX0lOVkFMSURfVVNFUk5BTUVfT1JfUEFTU1dPUkQsXG4gICAgICAgICAgICBzaG93OiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnZXJyb3InKTtcbiAgICB9XG5cbiAgICBnZXRMb2dpbkRldGFpbHMoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9ybUNtcC5kYXRhb3V0cHV0O1xuICAgIH1cblxuICAgIGRvTG9naW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmV2ZW50c291cmNlKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50c291cmNlLmludm9rZSh7bG9naW5JbmZvOiB0aGlzLmdldExvZ2luRGV0YWlscygpfSwgdGhpcy5vblN1Y2Nlc3NDQi5iaW5kKHRoaXMpLCB0aGlzLm9uRXJyb3JDQi5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignRGVmYXVsdCBhY3Rpb24gXCJsb2dpbkFjdGlvblwiIGRvZXMgbm90IGV4aXN0LiBFaXRoZXIgY3JlYXRlIHRoZSBBY3Rpb24gb3IgYXNzaWduIGFuIGV2ZW50IHRvIG9uU3VibWl0IG9mIHRoZSBsb2dpbiB3aWRnZXQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXRMb2dpbkJ1dHRvbkFjdGlvbnMoKSB7XG4gICAgICAgIHRoaXMubG9naW5CdG5DbXAuZ2V0TmF0aXZlRWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuXG4gICAgICAgICAgICAvLyBpZiBubyBldmVudCBpcyBhdHRhY2hlZCB0byB0aGUgb25TdWJtaXQgb2YgbG9naW4gd2lkZ2V0IG9yIGxvZ2luQnV0dG9uIGluc2lkZSBpdCwgaW52b2tlIGRlZmF1bHQgbG9naW4gYWN0aW9uXG4gICAgICAgICAgICBpZiAoIXRoaXMubmF0aXZlRWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3N1Ym1pdC5ldmVudCcpICYmICF0aGlzLmxvZ2luQnRuQ21wLmdldE5hdGl2ZUVsZW1lbnQoKS5oYXNBdHRyaWJ1dGUoJ2NsaWNrLmV2ZW50JykgJiYgIXRoaXMubG9naW5CdG5DbXAuZ2V0TmF0aXZlRWxlbWVudCgpLmhhc0F0dHJpYnV0ZSgndGFwLmV2ZW50JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRvTG9naW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcblxuICAgICAgICAvLyBzdXBwcmVzc2VzIHRoZSBkZWZhdWx0IGZvcm0gc3VibWlzc2lvbiAoaW4gYnJvd3NlcnMgbGlrZSBGaXJlZm94KVxuICAgICAgICB0aGlzLmZvcm1DbXAuZ2V0TmF0aXZlRWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGUgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcblxuICAgICAgICAvLyBnZXQgbG9naW4gYnV0dG9uIGNvbXBvbmVudFxuICAgICAgICB0aGlzLmJ1dHRvbkNvbXBvbmVudHMuZm9yRWFjaChjbXAgPT4ge1xuICAgICAgICAgICAgaWYgKGNtcC5nZXROYXRpdmVFbGVtZW50KCkuZ2V0QXR0cmlidXRlKCduYW1lJykgPT09ICdsb2dpbkJ1dHRvbicgfHwgXy5pbmNsdWRlcyhjbXAuZ2V0TmF0aXZlRWxlbWVudCgpLmNsYXNzTGlzdCwgJ2FwcC1sb2dpbi1idXR0b24nKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxvZ2luQnRuQ21wKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dpbkJ0bkNtcCA9IGNtcDtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRMb2dpbkJ1dHRvbkFjdGlvbnMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19