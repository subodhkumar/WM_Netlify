import * as tslib_1 from "tslib";
import { ApplicationRef, Component, ElementRef, Injector, NgZone, ViewContainerRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractSpinnerService, App, noop } from '@wm/core';
import { MetadataService } from '@wm/variables';
import { SecurityService } from '@wm/security';
import { AppManagerService, ComponentRefProvider, ComponentType } from '@wm/runtime/base';
export class PageWrapperComponent {
    constructor(injector, route, vcRef, appRef, metadataService, securityService, appManager, app, ngZone, elRef, spinnerService, componentRefProvider, router) {
        this.injector = injector;
        this.route = route;
        this.vcRef = vcRef;
        this.appRef = appRef;
        this.metadataService = metadataService;
        this.securityService = securityService;
        this.appManager = appManager;
        this.app = app;
        this.ngZone = ngZone;
        this.elRef = elRef;
        this.spinnerService = spinnerService;
        this.componentRefProvider = componentRefProvider;
        this.router = router;
    }
    getTargetNode() {
        return this.elRef.nativeElement;
    }
    resetViewContainer() {
        this.vcRef.clear();
        const $target = this.getTargetNode();
        $target.innerHTML = '';
    }
    renderPage(pageName) {
        const $target = this.getTargetNode();
        this.appManager.loadAppVariables()
            .then(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const pageComponentFactoryRef = yield this.componentRefProvider.getComponentFactoryRef(pageName, ComponentType.PAGE);
            if (pageComponentFactoryRef) {
                const instance = this.vcRef.createComponent(pageComponentFactoryRef, 0, this.injector);
                $target.appendChild(instance.location.nativeElement);
            }
            if (this.vcRef.length > 1) {
                this.vcRef.remove(1);
            }
        }));
    }
    renderPrefabPreviewPage() {
        this.router.navigate(['prefab-preview']);
    }
    /**
     * canDeactivate is called before a route change.
     * This will internally call onBeforePageLeave method present
     * at page level and app level in the application and decide
     * whether to change route or not based on return value.
     */
    canDeactivate() {
        let retVal;
        // Calling onBeforePageLeave method present at page level
        retVal = this.app.activePage && this.app.activePage.onBeforePageLeave();
        // Calling onBeforePageLeave method present at app level only if page level method return true
        // or if there is no page level method
        if (retVal !== false) {
            retVal = (this.app.onBeforePageLeave || noop)(this.app.activePageName, this.app.activePage);
        }
        return retVal === undefined ? true : retVal;
    }
    ngOnInit() {
        if (this.app.isPrefabType) {
            // there is only one route
            this.renderPrefabPreviewPage();
        }
        else {
            $(this.getTargetNode()).find('>div:first').remove();
            this.subscription = this.route.params.subscribe(({ pageName }) => {
                this.ngZone.run(() => {
                    if (pageName) {
                        this.renderPage(pageName);
                    }
                });
            });
        }
    }
    ngOnDestroy() {
        this.vcRef.clear();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
PageWrapperComponent.decorators = [
    { type: Component, args: [{
                selector: 'app-page-outlet',
                template: '<div></div>'
            }] }
];
/** @nocollapse */
PageWrapperComponent.ctorParameters = () => [
    { type: Injector },
    { type: ActivatedRoute },
    { type: ViewContainerRef },
    { type: ApplicationRef },
    { type: MetadataService },
    { type: SecurityService },
    { type: AppManagerService },
    { type: App },
    { type: NgZone },
    { type: ElementRef },
    { type: AbstractSpinnerService },
    { type: ComponentRefProvider },
    { type: Router }
];
PageWrapperComponent.propDecorators = {
    canDeactivate: [{ type: HostListener, args: ['window:beforeunload',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS13cmFwcGVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2R5bmFtaWMvIiwic291cmNlcyI6WyJhcHAvY29tcG9uZW50cy9wYWdlLXdyYXBwZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0gsY0FBYyxFQUNkLFNBQVMsRUFDVCxVQUFVLEVBQ1YsUUFBUSxFQUNSLE1BQU0sRUFHTixnQkFBZ0IsRUFDaEIsWUFBWSxFQUNmLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFJekQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDNUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNoRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQy9DLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQU0xRixNQUFNLE9BQU8sb0JBQW9CO0lBSTdCLFlBQ1ksUUFBa0IsRUFDbEIsS0FBcUIsRUFDckIsS0FBdUIsRUFDdkIsTUFBc0IsRUFDdEIsZUFBZ0MsRUFDaEMsZUFBZ0MsRUFDaEMsVUFBNkIsRUFDN0IsR0FBUSxFQUNSLE1BQWMsRUFDZCxLQUFpQixFQUNqQixjQUFzQyxFQUN0QyxvQkFBMEMsRUFDMUMsTUFBYztRQVpkLGFBQVEsR0FBUixRQUFRLENBQVU7UUFDbEIsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7UUFDckIsVUFBSyxHQUFMLEtBQUssQ0FBa0I7UUFDdkIsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFDdEIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBQ2hDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQyxlQUFVLEdBQVYsVUFBVSxDQUFtQjtRQUM3QixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ1IsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLFVBQUssR0FBTCxLQUFLLENBQVk7UUFDakIsbUJBQWMsR0FBZCxjQUFjLENBQXdCO1FBQ3RDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7UUFDMUMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtJQUN2QixDQUFDO0lBRUosYUFBYTtRQUNULE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7SUFDcEMsQ0FBQztJQUVELGtCQUFrQjtRQUNkLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFRCxVQUFVLENBQUMsUUFBUTtRQUNmLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVyQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFO2FBQzdCLElBQUksQ0FBQyxHQUFTLEVBQUU7WUFDYixNQUFNLHVCQUF1QixHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckgsSUFBSSx1QkFBdUIsRUFBRTtnQkFDekIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdkYsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ3hEO1lBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3hCO1FBQ0wsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCx1QkFBdUI7UUFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVEOzs7OztPQUtHO0lBRUgsYUFBYTtRQUNULElBQUksTUFBTSxDQUFDO1FBQ1gseURBQXlEO1FBQ3pELE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3hFLDhGQUE4RjtRQUM5RixzQ0FBc0M7UUFDdEMsSUFBSSxNQUFNLEtBQUssS0FBSyxFQUFHO1lBQ25CLE1BQU0sR0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNoRztRQUNELE9BQU8sTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDaEQsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFO1lBQ3ZCLDBCQUEwQjtZQUMxQixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztTQUNsQzthQUFNO1lBQ0gsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNwRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFNLEVBQUUsRUFBRTtnQkFDaEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO29CQUNqQixJQUFJLFFBQVEsRUFBRTt3QkFDVixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUM3QjtnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1NBQ047SUFDTCxDQUFDO0lBRUQsV0FBVztRQUNQLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkIsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ25CLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDbkM7SUFDTCxDQUFDOzs7WUE5RkosU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxpQkFBaUI7Z0JBQzNCLFFBQVEsRUFBRSxhQUFhO2FBQzFCOzs7O1lBbkJHLFFBQVE7WUFPSCxjQUFjO1lBSG5CLGdCQUFnQjtZQVBoQixjQUFjO1lBZVQsZUFBZTtZQUNmLGVBQWU7WUFDZixpQkFBaUI7WUFITyxHQUFHO1lBVmhDLE1BQU07WUFGTixVQUFVO1lBWUwsc0JBQXNCO1lBR0gsb0JBQW9CO1lBUHZCLE1BQU07Ozs0QkFxRTFCLFlBQVksU0FBQyxxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEFwcGxpY2F0aW9uUmVmLFxuICAgIENvbXBvbmVudCxcbiAgICBFbGVtZW50UmVmLFxuICAgIEluamVjdG9yLFxuICAgIE5nWm9uZSxcbiAgICBPbkRlc3Ryb3ksXG4gICAgT25Jbml0LFxuICAgIFZpZXdDb250YWluZXJSZWYsXG4gICAgSG9zdExpc3RlbmVyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUsIFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBBYnN0cmFjdFNwaW5uZXJTZXJ2aWNlLCBBcHAsIG5vb3B9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IE1ldGFkYXRhU2VydmljZSB9IGZyb20gJ0B3bS92YXJpYWJsZXMnO1xuaW1wb3J0IHsgU2VjdXJpdHlTZXJ2aWNlIH0gZnJvbSAnQHdtL3NlY3VyaXR5JztcbmltcG9ydCB7IEFwcE1hbmFnZXJTZXJ2aWNlLCBDb21wb25lbnRSZWZQcm92aWRlciwgQ29tcG9uZW50VHlwZSB9IGZyb20gJ0B3bS9ydW50aW1lL2Jhc2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FwcC1wYWdlLW91dGxldCcsXG4gICAgdGVtcGxhdGU6ICc8ZGl2PjwvZGl2Pidcbn0pXG5leHBvcnQgY2xhc3MgUGFnZVdyYXBwZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG5cbiAgICBzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGluamVjdG9yOiBJbmplY3RvcixcbiAgICAgICAgcHJpdmF0ZSByb3V0ZTogQWN0aXZhdGVkUm91dGUsXG4gICAgICAgIHByaXZhdGUgdmNSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHByaXZhdGUgYXBwUmVmOiBBcHBsaWNhdGlvblJlZixcbiAgICAgICAgcHJpdmF0ZSBtZXRhZGF0YVNlcnZpY2U6IE1ldGFkYXRhU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBzZWN1cml0eVNlcnZpY2U6IFNlY3VyaXR5U2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBhcHBNYW5hZ2VyOiBBcHBNYW5hZ2VyU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBhcHA6IEFwcCxcbiAgICAgICAgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgICAgcHJpdmF0ZSBlbFJlZjogRWxlbWVudFJlZixcbiAgICAgICAgcHJpdmF0ZSBzcGlubmVyU2VydmljZTogQWJzdHJhY3RTcGlubmVyU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBjb21wb25lbnRSZWZQcm92aWRlcjogQ29tcG9uZW50UmVmUHJvdmlkZXIsXG4gICAgICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXJcbiAgICApIHt9XG5cbiAgICBnZXRUYXJnZXROb2RlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIH1cblxuICAgIHJlc2V0Vmlld0NvbnRhaW5lcigpIHtcbiAgICAgICAgdGhpcy52Y1JlZi5jbGVhcigpO1xuICAgICAgICBjb25zdCAkdGFyZ2V0ID0gdGhpcy5nZXRUYXJnZXROb2RlKCk7XG4gICAgICAgICR0YXJnZXQuaW5uZXJIVE1MID0gJyc7XG4gICAgfVxuXG4gICAgcmVuZGVyUGFnZShwYWdlTmFtZSkge1xuICAgICAgICBjb25zdCAkdGFyZ2V0ID0gdGhpcy5nZXRUYXJnZXROb2RlKCk7XG5cbiAgICAgICAgdGhpcy5hcHBNYW5hZ2VyLmxvYWRBcHBWYXJpYWJsZXMoKVxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2VDb21wb25lbnRGYWN0b3J5UmVmID0gYXdhaXQgdGhpcy5jb21wb25lbnRSZWZQcm92aWRlci5nZXRDb21wb25lbnRGYWN0b3J5UmVmKHBhZ2VOYW1lLCBDb21wb25lbnRUeXBlLlBBR0UpO1xuICAgICAgICAgICAgICAgIGlmIChwYWdlQ29tcG9uZW50RmFjdG9yeVJlZikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnN0YW5jZSA9IHRoaXMudmNSZWYuY3JlYXRlQ29tcG9uZW50KHBhZ2VDb21wb25lbnRGYWN0b3J5UmVmLCAwLCB0aGlzLmluamVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgJHRhcmdldC5hcHBlbmRDaGlsZChpbnN0YW5jZS5sb2NhdGlvbi5uYXRpdmVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmNSZWYubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZjUmVmLnJlbW92ZSgxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW5kZXJQcmVmYWJQcmV2aWV3UGFnZSgpIHtcbiAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoWydwcmVmYWItcHJldmlldyddKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjYW5EZWFjdGl2YXRlIGlzIGNhbGxlZCBiZWZvcmUgYSByb3V0ZSBjaGFuZ2UuXG4gICAgICogVGhpcyB3aWxsIGludGVybmFsbHkgY2FsbCBvbkJlZm9yZVBhZ2VMZWF2ZSBtZXRob2QgcHJlc2VudFxuICAgICAqIGF0IHBhZ2UgbGV2ZWwgYW5kIGFwcCBsZXZlbCBpbiB0aGUgYXBwbGljYXRpb24gYW5kIGRlY2lkZVxuICAgICAqIHdoZXRoZXIgdG8gY2hhbmdlIHJvdXRlIG9yIG5vdCBiYXNlZCBvbiByZXR1cm4gdmFsdWUuXG4gICAgICovXG4gICAgQEhvc3RMaXN0ZW5lcignd2luZG93OmJlZm9yZXVubG9hZCcpXG4gICAgY2FuRGVhY3RpdmF0ZSgpIHtcbiAgICAgICAgbGV0IHJldFZhbDtcbiAgICAgICAgLy8gQ2FsbGluZyBvbkJlZm9yZVBhZ2VMZWF2ZSBtZXRob2QgcHJlc2VudCBhdCBwYWdlIGxldmVsXG4gICAgICAgIHJldFZhbCA9IHRoaXMuYXBwLmFjdGl2ZVBhZ2UgJiYgdGhpcy5hcHAuYWN0aXZlUGFnZS5vbkJlZm9yZVBhZ2VMZWF2ZSgpO1xuICAgICAgICAvLyBDYWxsaW5nIG9uQmVmb3JlUGFnZUxlYXZlIG1ldGhvZCBwcmVzZW50IGF0IGFwcCBsZXZlbCBvbmx5IGlmIHBhZ2UgbGV2ZWwgbWV0aG9kIHJldHVybiB0cnVlXG4gICAgICAgIC8vIG9yIGlmIHRoZXJlIGlzIG5vIHBhZ2UgbGV2ZWwgbWV0aG9kXG4gICAgICAgIGlmIChyZXRWYWwgIT09IGZhbHNlICkge1xuICAgICAgICAgICAgcmV0VmFsID0gICh0aGlzLmFwcC5vbkJlZm9yZVBhZ2VMZWF2ZSB8fCBub29wKSh0aGlzLmFwcC5hY3RpdmVQYWdlTmFtZSwgdGhpcy5hcHAuYWN0aXZlUGFnZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldFZhbCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHJldFZhbDtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuYXBwLmlzUHJlZmFiVHlwZSkge1xuICAgICAgICAgICAgLy8gdGhlcmUgaXMgb25seSBvbmUgcm91dGVcbiAgICAgICAgICAgIHRoaXMucmVuZGVyUHJlZmFiUHJldmlld1BhZ2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQodGhpcy5nZXRUYXJnZXROb2RlKCkpLmZpbmQoJz5kaXY6Zmlyc3QnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uID0gdGhpcy5yb3V0ZS5wYXJhbXMuc3Vic2NyaWJlKCh7cGFnZU5hbWV9OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFnZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUGFnZShwYWdlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMudmNSZWYuY2xlYXIoKTtcbiAgICAgICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19