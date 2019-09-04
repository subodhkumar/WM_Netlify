import { ContentChild, ContentChildren, Directive, Inject, QueryList, Self } from '@angular/core';
import { $appDigest } from '@wm/core';
import { Context, DialogRef } from '../../../framework/types';
import { FormComponent } from '../../form/form.component';
import { MessageComponent } from '../../message/message.component';
var LoginDialogDirective = /** @class */ (function () {
    function LoginDialogDirective(contexts, dialogRef) {
        var _this = this;
        this.contexts = contexts;
        this.dialogRef = dialogRef;
        this.contexts[0].doLogin = function () { return _this.doLogin(); };
    }
    LoginDialogDirective.prototype.hideMsg = function () {
        if (this.msgCmp) {
            this.msgCmp.hideMessage();
        }
    };
    LoginDialogDirective.prototype.showError = function (msg) {
        if (this.msgCmp) {
            this.msgCmp.showMessage(msg, 'error');
        }
    };
    LoginDialogDirective.prototype.showLoading = function () {
        if (this.msgCmp) {
            this.msgCmp.showMessage('Loading...', 'loading');
        }
    };
    LoginDialogDirective.prototype.onSuccess = function () {
        this.hideMsg();
    };
    LoginDialogDirective.prototype.onError = function (error) {
        this.showError(error);
    };
    LoginDialogDirective.prototype.getLoginDetails = function () {
        return this.formCmp.first.dataoutput;
    };
    LoginDialogDirective.prototype.doLogin = function () {
        var loginInfo = this.getLoginDetails();
        var ds = this.dialogRef.eventsource;
        if (ds) {
            this.showLoading();
            ds.invoke({ loginInfo: loginInfo }, this.onSuccess.bind(this), this.onError.bind(this));
        }
    };
    LoginDialogDirective.prototype.ngAfterViewInit = function () {
        var _this = this;
        // On login dialog open we wait till the form loads and then assign the enter
        // key event to the textbox in form.
        this.dialogOpenSubscription = this.dialogRef.bsModal.onShown.subscribe(function () {
            setTimeout(function () {
                // On enter key press submit the login form in Login Dialog
                $('.app-textbox').keypress(function (evt) {
                    if (evt.which === 13) {
                        evt.stopPropagation();
                        /**
                         * As this function is getting executed outside of angular context,
                         * trigger a digest cycle and then trigger doLogin method, So that the bindings in the loginVariable will be evaluated property
                         */
                        $appDigest();
                        _this.doLogin();
                    }
                });
            });
        });
    };
    LoginDialogDirective.prototype.ngOnDestroy = function () {
        this.dialogOpenSubscription.unsubscribe();
    };
    LoginDialogDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmDialog][wmLoginDialog]'
                },] }
    ];
    /** @nocollapse */
    LoginDialogDirective.ctorParameters = function () { return [
        { type: Array, decorators: [{ type: Self }, { type: Inject, args: [Context,] }] },
        { type: DialogRef, decorators: [{ type: Self }] }
    ]; };
    LoginDialogDirective.propDecorators = {
        formCmp: [{ type: ContentChildren, args: [FormComponent,] }],
        msgCmp: [{ type: ContentChild, args: [MessageComponent,] }]
    };
    return LoginDialogDirective;
}());
export { LoginDialogDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4tZGlhbG9nLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZGlhbG9nL2xvZ2luLWRpYWxvZy9sb2dpbi1kaWFsb2cuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBaUIsWUFBWSxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFhLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFNUgsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV0QyxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzlELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVuRTtJQVFJLDhCQUE2QyxRQUFvQixFQUNyQyxTQUF5QjtRQURyRCxpQkFHQztRQUg0QyxhQUFRLEdBQVIsUUFBUSxDQUFZO1FBQ3JDLGNBQVMsR0FBVCxTQUFTLENBQWdCO1FBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLGNBQU0sT0FBQSxLQUFJLENBQUMsT0FBTyxFQUFFLEVBQWQsQ0FBYyxDQUFDO0lBQ3BELENBQUM7SUFFRCxzQ0FBTyxHQUFQO1FBQ0ksSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUM3QjtJQUNMLENBQUM7SUFFRCx3Q0FBUyxHQUFULFVBQVUsR0FBRztRQUNULElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN6QztJQUNMLENBQUM7SUFFRCwwQ0FBVyxHQUFYO1FBQ0ksSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3BEO0lBQ0wsQ0FBQztJQUVELHdDQUFTLEdBQVQ7UUFDSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVELHNDQUFPLEdBQVAsVUFBUSxLQUFNO1FBQ1YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsOENBQWUsR0FBZjtRQUNJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO0lBQ3pDLENBQUM7SUFFRCxzQ0FBTyxHQUFQO1FBQ0ksSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3pDLElBQU0sRUFBRSxHQUFJLElBQUksQ0FBQyxTQUFpQixDQUFDLFdBQVcsQ0FBQztRQUMvQyxJQUFJLEVBQUUsRUFBRTtZQUNKLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDekY7SUFDTCxDQUFDO0lBRUQsOENBQWUsR0FBZjtRQUFBLGlCQW1CQztRQWxCRyw2RUFBNkU7UUFDN0Usb0NBQW9DO1FBQ3BDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO1lBQ25FLFVBQVUsQ0FBQztnQkFDUCwyREFBMkQ7Z0JBQzNELENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBQyxHQUFHO29CQUMzQixJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssRUFBRSxFQUFFO3dCQUNsQixHQUFHLENBQUMsZUFBZSxFQUFFLENBQUM7d0JBQ3RCOzs7MkJBR0c7d0JBQ0gsVUFBVSxFQUFFLENBQUM7d0JBQ2IsS0FBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO3FCQUNsQjtnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsMENBQVcsR0FBWDtRQUNJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUM5QyxDQUFDOztnQkEzRUosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSwyQkFBMkI7aUJBQ3hDOzs7O2dCQU0wRCxLQUFLLHVCQUEvQyxJQUFJLFlBQUksTUFBTSxTQUFDLE9BQU87Z0JBWnJCLFNBQVMsdUJBYVYsSUFBSTs7OzBCQUxoQixlQUFlLFNBQUMsYUFBYTt5QkFDN0IsWUFBWSxTQUFDLGdCQUFnQjs7SUF1RWxDLDJCQUFDO0NBQUEsQUE1RUQsSUE0RUM7U0F6RVksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgQ29udGVudENoaWxkLCBDb250ZW50Q2hpbGRyZW4sIERpcmVjdGl2ZSwgSW5qZWN0LCBPbkRlc3Ryb3ksIFF1ZXJ5TGlzdCwgU2VsZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyAkYXBwRGlnZXN0IH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBDb250ZXh0LCBEaWFsb2dSZWYgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgRm9ybUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2Zvcm0vZm9ybS5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWVzc2FnZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL21lc3NhZ2UvbWVzc2FnZS5jb21wb25lbnQnO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bURpYWxvZ11bd21Mb2dpbkRpYWxvZ10nXG59KVxuZXhwb3J0IGNsYXNzIExvZ2luRGlhbG9nRGlyZWN0aXZlIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgICBAQ29udGVudENoaWxkcmVuKEZvcm1Db21wb25lbnQpIGZvcm1DbXA6IFF1ZXJ5TGlzdDxGb3JtQ29tcG9uZW50PjtcbiAgICBAQ29udGVudENoaWxkKE1lc3NhZ2VDb21wb25lbnQpIG1zZ0NtcDogTWVzc2FnZUNvbXBvbmVudDtcbiAgICBkaWFsb2dPcGVuU3Vic2NyaXB0aW9uO1xuXG4gICAgY29uc3RydWN0b3IoQFNlbGYoKSBASW5qZWN0KENvbnRleHQpIHByaXZhdGUgY29udGV4dHM6IEFycmF5PGFueT4sXG4gICAgICAgICAgICAgICAgQFNlbGYoKSBwcml2YXRlIGRpYWxvZ1JlZjogRGlhbG9nUmVmPGFueT4pIHtcbiAgICAgICAgdGhpcy5jb250ZXh0c1swXS5kb0xvZ2luID0gKCkgPT4gdGhpcy5kb0xvZ2luKCk7XG4gICAgfVxuXG4gICAgaGlkZU1zZygpIHtcbiAgICAgICAgaWYgKHRoaXMubXNnQ21wKSB7XG4gICAgICAgICAgICB0aGlzLm1zZ0NtcC5oaWRlTWVzc2FnZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hvd0Vycm9yKG1zZykge1xuICAgICAgICBpZiAodGhpcy5tc2dDbXApIHtcbiAgICAgICAgICAgIHRoaXMubXNnQ21wLnNob3dNZXNzYWdlKG1zZywgJ2Vycm9yJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93TG9hZGluZygpIHtcbiAgICAgICAgaWYgKHRoaXMubXNnQ21wKSB7XG4gICAgICAgICAgICB0aGlzLm1zZ0NtcC5zaG93TWVzc2FnZSgnTG9hZGluZy4uLicsICdsb2FkaW5nJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblN1Y2Nlc3MoKSB7XG4gICAgICAgIHRoaXMuaGlkZU1zZygpO1xuICAgIH1cblxuICAgIG9uRXJyb3IoZXJyb3I/KSB7XG4gICAgICAgIHRoaXMuc2hvd0Vycm9yKGVycm9yKTtcbiAgICB9XG5cbiAgICBnZXRMb2dpbkRldGFpbHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcm1DbXAuZmlyc3QuZGF0YW91dHB1dDtcbiAgICB9XG5cbiAgICBkb0xvZ2luKCkge1xuICAgICAgICBjb25zdCBsb2dpbkluZm8gPSB0aGlzLmdldExvZ2luRGV0YWlscygpO1xuICAgICAgICBjb25zdCBkcyA9ICh0aGlzLmRpYWxvZ1JlZiBhcyBhbnkpLmV2ZW50c291cmNlO1xuICAgICAgICBpZiAoZHMpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0xvYWRpbmcoKTtcbiAgICAgICAgICAgIGRzLmludm9rZSh7bG9naW5JbmZvOiBsb2dpbkluZm99LCB0aGlzLm9uU3VjY2Vzcy5iaW5kKHRoaXMpLCB0aGlzLm9uRXJyb3IuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIC8vIE9uIGxvZ2luIGRpYWxvZyBvcGVuIHdlIHdhaXQgdGlsbCB0aGUgZm9ybSBsb2FkcyBhbmQgdGhlbiBhc3NpZ24gdGhlIGVudGVyXG4gICAgICAgIC8vIGtleSBldmVudCB0byB0aGUgdGV4dGJveCBpbiBmb3JtLlxuICAgICAgICB0aGlzLmRpYWxvZ09wZW5TdWJzY3JpcHRpb24gPSB0aGlzLmRpYWxvZ1JlZi5ic01vZGFsLm9uU2hvd24uc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIE9uIGVudGVyIGtleSBwcmVzcyBzdWJtaXQgdGhlIGxvZ2luIGZvcm0gaW4gTG9naW4gRGlhbG9nXG4gICAgICAgICAgICAgICAgJCgnLmFwcC10ZXh0Ym94Jykua2V5cHJlc3MoKGV2dCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZ0LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBBcyB0aGlzIGZ1bmN0aW9uIGlzIGdldHRpbmcgZXhlY3V0ZWQgb3V0c2lkZSBvZiBhbmd1bGFyIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiB0cmlnZ2VyIGEgZGlnZXN0IGN5Y2xlIGFuZCB0aGVuIHRyaWdnZXIgZG9Mb2dpbiBtZXRob2QsIFNvIHRoYXQgdGhlIGJpbmRpbmdzIGluIHRoZSBsb2dpblZhcmlhYmxlIHdpbGwgYmUgZXZhbHVhdGVkIHByb3BlcnR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG9Mb2dpbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuZGlhbG9nT3BlblN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cbn1cbiJdfQ==