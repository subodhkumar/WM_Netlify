import { ContentChild, ContentChildren, Directive, Inject, QueryList, Self } from '@angular/core';
import { $appDigest } from '@wm/core';
import { Context, DialogRef } from '../../../framework/types';
import { FormComponent } from '../../form/form.component';
import { MessageComponent } from '../../message/message.component';
export class LoginDialogDirective {
    constructor(contexts, dialogRef) {
        this.contexts = contexts;
        this.dialogRef = dialogRef;
        this.contexts[0].doLogin = () => this.doLogin();
    }
    hideMsg() {
        if (this.msgCmp) {
            this.msgCmp.hideMessage();
        }
    }
    showError(msg) {
        if (this.msgCmp) {
            this.msgCmp.showMessage(msg, 'error');
        }
    }
    showLoading() {
        if (this.msgCmp) {
            this.msgCmp.showMessage('Loading...', 'loading');
        }
    }
    onSuccess() {
        this.hideMsg();
    }
    onError(error) {
        this.showError(error);
    }
    getLoginDetails() {
        return this.formCmp.first.dataoutput;
    }
    doLogin() {
        const loginInfo = this.getLoginDetails();
        const ds = this.dialogRef.eventsource;
        if (ds) {
            this.showLoading();
            ds.invoke({ loginInfo: loginInfo }, this.onSuccess.bind(this), this.onError.bind(this));
        }
    }
    ngAfterViewInit() {
        // On login dialog open we wait till the form loads and then assign the enter
        // key event to the textbox in form.
        this.dialogOpenSubscription = this.dialogRef.bsModal.onShown.subscribe(() => {
            setTimeout(() => {
                // On enter key press submit the login form in Login Dialog
                $('.app-textbox').keypress((evt) => {
                    if (evt.which === 13) {
                        evt.stopPropagation();
                        /**
                         * As this function is getting executed outside of angular context,
                         * trigger a digest cycle and then trigger doLogin method, So that the bindings in the loginVariable will be evaluated property
                         */
                        $appDigest();
                        this.doLogin();
                    }
                });
            });
        });
    }
    ngOnDestroy() {
        this.dialogOpenSubscription.unsubscribe();
    }
}
LoginDialogDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmDialog][wmLoginDialog]'
            },] }
];
/** @nocollapse */
LoginDialogDirective.ctorParameters = () => [
    { type: Array, decorators: [{ type: Self }, { type: Inject, args: [Context,] }] },
    { type: DialogRef, decorators: [{ type: Self }] }
];
LoginDialogDirective.propDecorators = {
    formCmp: [{ type: ContentChildren, args: [FormComponent,] }],
    msgCmp: [{ type: ContentChild, args: [MessageComponent,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4tZGlhbG9nLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZGlhbG9nL2xvZ2luLWRpYWxvZy9sb2dpbi1kaWFsb2cuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBaUIsWUFBWSxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFhLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFNUgsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV0QyxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzlELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUtuRSxNQUFNLE9BQU8sb0JBQW9CO0lBSzdCLFlBQTZDLFFBQW9CLEVBQ3JDLFNBQXlCO1FBRFIsYUFBUSxHQUFSLFFBQVEsQ0FBWTtRQUNyQyxjQUFTLEdBQVQsU0FBUyxDQUFnQjtRQUNqRCxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVELE9BQU87UUFDSCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQzdCO0lBQ0wsQ0FBQztJQUVELFNBQVMsQ0FBQyxHQUFHO1FBQ1QsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3pDO0lBQ0wsQ0FBQztJQUVELFdBQVc7UUFDUCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDcEQ7SUFDTCxDQUFDO0lBRUQsU0FBUztRQUNMLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRUQsT0FBTyxDQUFDLEtBQU07UUFDVixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxlQUFlO1FBQ1gsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7SUFDekMsQ0FBQztJQUVELE9BQU87UUFDSCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDekMsTUFBTSxFQUFFLEdBQUksSUFBSSxDQUFDLFNBQWlCLENBQUMsV0FBVyxDQUFDO1FBQy9DLElBQUksRUFBRSxFQUFFO1lBQ0osSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUN6RjtJQUNMLENBQUM7SUFFRCxlQUFlO1FBQ1gsNkVBQTZFO1FBQzdFLG9DQUFvQztRQUNwQyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDeEUsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDWiwyREFBMkQ7Z0JBQzNELENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDL0IsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLEVBQUUsRUFBRTt3QkFDbEIsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDO3dCQUN0Qjs7OzJCQUdHO3dCQUNILFVBQVUsRUFBRSxDQUFDO3dCQUNiLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztxQkFDbEI7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFdBQVc7UUFDUCxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDOUMsQ0FBQzs7O1lBM0VKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsMkJBQTJCO2FBQ3hDOzs7O1lBTTBELEtBQUssdUJBQS9DLElBQUksWUFBSSxNQUFNLFNBQUMsT0FBTztZQVpyQixTQUFTLHVCQWFWLElBQUk7OztzQkFMaEIsZUFBZSxTQUFDLGFBQWE7cUJBQzdCLFlBQVksU0FBQyxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb250ZW50Q2hpbGQsIENvbnRlbnRDaGlsZHJlbiwgRGlyZWN0aXZlLCBJbmplY3QsIE9uRGVzdHJveSwgUXVlcnlMaXN0LCBTZWxmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7ICRhcHBEaWdlc3QgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IENvbnRleHQsIERpYWxvZ1JlZiB9IGZyb20gJy4uLy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBGb3JtQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vZm9ybS9mb3JtLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNZXNzYWdlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vbWVzc2FnZS9tZXNzYWdlLmNvbXBvbmVudCc7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtRGlhbG9nXVt3bUxvZ2luRGlhbG9nXSdcbn0pXG5leHBvcnQgY2xhc3MgTG9naW5EaWFsb2dEaXJlY3RpdmUgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAgIEBDb250ZW50Q2hpbGRyZW4oRm9ybUNvbXBvbmVudCkgZm9ybUNtcDogUXVlcnlMaXN0PEZvcm1Db21wb25lbnQ+O1xuICAgIEBDb250ZW50Q2hpbGQoTWVzc2FnZUNvbXBvbmVudCkgbXNnQ21wOiBNZXNzYWdlQ29tcG9uZW50O1xuICAgIGRpYWxvZ09wZW5TdWJzY3JpcHRpb247XG5cbiAgICBjb25zdHJ1Y3RvcihAU2VsZigpIEBJbmplY3QoQ29udGV4dCkgcHJpdmF0ZSBjb250ZXh0czogQXJyYXk8YW55PixcbiAgICAgICAgICAgICAgICBAU2VsZigpIHByaXZhdGUgZGlhbG9nUmVmOiBEaWFsb2dSZWY8YW55Pikge1xuICAgICAgICB0aGlzLmNvbnRleHRzWzBdLmRvTG9naW4gPSAoKSA9PiB0aGlzLmRvTG9naW4oKTtcbiAgICB9XG5cbiAgICBoaWRlTXNnKCkge1xuICAgICAgICBpZiAodGhpcy5tc2dDbXApIHtcbiAgICAgICAgICAgIHRoaXMubXNnQ21wLmhpZGVNZXNzYWdlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93RXJyb3IobXNnKSB7XG4gICAgICAgIGlmICh0aGlzLm1zZ0NtcCkge1xuICAgICAgICAgICAgdGhpcy5tc2dDbXAuc2hvd01lc3NhZ2UobXNnLCAnZXJyb3InKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3dMb2FkaW5nKCkge1xuICAgICAgICBpZiAodGhpcy5tc2dDbXApIHtcbiAgICAgICAgICAgIHRoaXMubXNnQ21wLnNob3dNZXNzYWdlKCdMb2FkaW5nLi4uJywgJ2xvYWRpbmcnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uU3VjY2VzcygpIHtcbiAgICAgICAgdGhpcy5oaWRlTXNnKCk7XG4gICAgfVxuXG4gICAgb25FcnJvcihlcnJvcj8pIHtcbiAgICAgICAgdGhpcy5zaG93RXJyb3IoZXJyb3IpO1xuICAgIH1cblxuICAgIGdldExvZ2luRGV0YWlscygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9ybUNtcC5maXJzdC5kYXRhb3V0cHV0O1xuICAgIH1cblxuICAgIGRvTG9naW4oKSB7XG4gICAgICAgIGNvbnN0IGxvZ2luSW5mbyA9IHRoaXMuZ2V0TG9naW5EZXRhaWxzKCk7XG4gICAgICAgIGNvbnN0IGRzID0gKHRoaXMuZGlhbG9nUmVmIGFzIGFueSkuZXZlbnRzb3VyY2U7XG4gICAgICAgIGlmIChkcykge1xuICAgICAgICAgICAgdGhpcy5zaG93TG9hZGluZygpO1xuICAgICAgICAgICAgZHMuaW52b2tlKHtsb2dpbkluZm86IGxvZ2luSW5mb30sIHRoaXMub25TdWNjZXNzLmJpbmQodGhpcyksIHRoaXMub25FcnJvci5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgLy8gT24gbG9naW4gZGlhbG9nIG9wZW4gd2Ugd2FpdCB0aWxsIHRoZSBmb3JtIGxvYWRzIGFuZCB0aGVuIGFzc2lnbiB0aGUgZW50ZXJcbiAgICAgICAgLy8ga2V5IGV2ZW50IHRvIHRoZSB0ZXh0Ym94IGluIGZvcm0uXG4gICAgICAgIHRoaXMuZGlhbG9nT3BlblN1YnNjcmlwdGlvbiA9IHRoaXMuZGlhbG9nUmVmLmJzTW9kYWwub25TaG93bi5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gT24gZW50ZXIga2V5IHByZXNzIHN1Ym1pdCB0aGUgbG9naW4gZm9ybSBpbiBMb2dpbiBEaWFsb2dcbiAgICAgICAgICAgICAgICAkKCcuYXBwLXRleHRib3gnKS5rZXlwcmVzcygoZXZ0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEFzIHRoaXMgZnVuY3Rpb24gaXMgZ2V0dGluZyBleGVjdXRlZCBvdXRzaWRlIG9mIGFuZ3VsYXIgY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIHRyaWdnZXIgYSBkaWdlc3QgY3ljbGUgYW5kIHRoZW4gdHJpZ2dlciBkb0xvZ2luIG1ldGhvZCwgU28gdGhhdCB0aGUgYmluZGluZ3MgaW4gdGhlIGxvZ2luVmFyaWFibGUgd2lsbCBiZSBldmFsdWF0ZWQgcHJvcGVydHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kb0xvZ2luKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5kaWFsb2dPcGVuU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgfVxufVxuIl19