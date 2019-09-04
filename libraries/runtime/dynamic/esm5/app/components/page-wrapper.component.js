import * as tslib_1 from "tslib";
import { ApplicationRef, Component, ElementRef, Injector, NgZone, ViewContainerRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractSpinnerService, App, noop } from '@wm/core';
import { MetadataService } from '@wm/variables';
import { SecurityService } from '@wm/security';
import { AppManagerService, ComponentRefProvider, ComponentType } from '@wm/runtime/base';
var PageWrapperComponent = /** @class */ (function () {
    function PageWrapperComponent(injector, route, vcRef, appRef, metadataService, securityService, appManager, app, ngZone, elRef, spinnerService, componentRefProvider, router) {
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
    PageWrapperComponent.prototype.getTargetNode = function () {
        return this.elRef.nativeElement;
    };
    PageWrapperComponent.prototype.resetViewContainer = function () {
        this.vcRef.clear();
        var $target = this.getTargetNode();
        $target.innerHTML = '';
    };
    PageWrapperComponent.prototype.renderPage = function (pageName) {
        var _this = this;
        var $target = this.getTargetNode();
        this.appManager.loadAppVariables()
            .then(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var pageComponentFactoryRef, instance;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.componentRefProvider.getComponentFactoryRef(pageName, ComponentType.PAGE)];
                    case 1:
                        pageComponentFactoryRef = _a.sent();
                        if (pageComponentFactoryRef) {
                            instance = this.vcRef.createComponent(pageComponentFactoryRef, 0, this.injector);
                            $target.appendChild(instance.location.nativeElement);
                        }
                        if (this.vcRef.length > 1) {
                            this.vcRef.remove(1);
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    };
    PageWrapperComponent.prototype.renderPrefabPreviewPage = function () {
        this.router.navigate(['prefab-preview']);
    };
    /**
     * canDeactivate is called before a route change.
     * This will internally call onBeforePageLeave method present
     * at page level and app level in the application and decide
     * whether to change route or not based on return value.
     */
    PageWrapperComponent.prototype.canDeactivate = function () {
        var retVal;
        // Calling onBeforePageLeave method present at page level
        retVal = this.app.activePage && this.app.activePage.onBeforePageLeave();
        // Calling onBeforePageLeave method present at app level only if page level method return true
        // or if there is no page level method
        if (retVal !== false) {
            retVal = (this.app.onBeforePageLeave || noop)(this.app.activePageName, this.app.activePage);
        }
        return retVal === undefined ? true : retVal;
    };
    PageWrapperComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.app.isPrefabType) {
            // there is only one route
            this.renderPrefabPreviewPage();
        }
        else {
            $(this.getTargetNode()).find('>div:first').remove();
            this.subscription = this.route.params.subscribe(function (_a) {
                var pageName = _a.pageName;
                _this.ngZone.run(function () {
                    if (pageName) {
                        _this.renderPage(pageName);
                    }
                });
            });
        }
    };
    PageWrapperComponent.prototype.ngOnDestroy = function () {
        this.vcRef.clear();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    };
    PageWrapperComponent.decorators = [
        { type: Component, args: [{
                    selector: 'app-page-outlet',
                    template: '<div></div>'
                }] }
    ];
    /** @nocollapse */
    PageWrapperComponent.ctorParameters = function () { return [
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
    ]; };
    PageWrapperComponent.propDecorators = {
        canDeactivate: [{ type: HostListener, args: ['window:beforeunload',] }]
    };
    return PageWrapperComponent;
}());
export { PageWrapperComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS13cmFwcGVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2R5bmFtaWMvIiwic291cmNlcyI6WyJhcHAvY29tcG9uZW50cy9wYWdlLXdyYXBwZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0gsY0FBYyxFQUNkLFNBQVMsRUFDVCxVQUFVLEVBQ1YsUUFBUSxFQUNSLE1BQU0sRUFHTixnQkFBZ0IsRUFDaEIsWUFBWSxFQUNmLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFJekQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDNUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNoRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQy9DLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUUxRjtJQVFJLDhCQUNZLFFBQWtCLEVBQ2xCLEtBQXFCLEVBQ3JCLEtBQXVCLEVBQ3ZCLE1BQXNCLEVBQ3RCLGVBQWdDLEVBQ2hDLGVBQWdDLEVBQ2hDLFVBQTZCLEVBQzdCLEdBQVEsRUFDUixNQUFjLEVBQ2QsS0FBaUIsRUFDakIsY0FBc0MsRUFDdEMsb0JBQTBDLEVBQzFDLE1BQWM7UUFaZCxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQ2xCLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBQ3JCLFVBQUssR0FBTCxLQUFLLENBQWtCO1FBQ3ZCLFdBQU0sR0FBTixNQUFNLENBQWdCO1FBQ3RCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDaEMsZUFBVSxHQUFWLFVBQVUsQ0FBbUI7UUFDN0IsUUFBRyxH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QUFHLENBQUM7b0JBQ1osSUFBSSxRQUFRLEVBQUU7d0JBQ1YsS0FBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztxQkFDN0I7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVELDBDQUFXLEdBQVg7UUFDSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25CLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ25DO0lBQ0wsQ0FBQzs7Z0JBOUZKLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsaUJBQWlCO29CQUMzQixRQUFRLEVBQUUsYUFBYTtpQkFDMUI7Ozs7Z0JBbkJHLFFBQVE7Z0JBT0gsY0FBYztnQkFIbkIsZ0JBQWdCO2dCQVBoQixjQUFjO2dCQWVULGVBQWU7Z0JBQ2YsZUFBZTtnQkFDZixpQkFBaUI7Z0JBSE8sR0FBRztnQkFWaEMsTUFBTTtnQkFGTixVQUFVO2dCQVlMLHNCQUFzQjtnQkFHSCxvQkFBb0I7Z0JBUHZCLE1BQU07OztnQ0FxRTFCLFlBQVksU0FBQyxxQkFBcUI7O0lBbUN2QywyQkFBQztDQUFBLEFBL0ZELElBK0ZDO1NBM0ZZLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQXBwbGljYXRpb25SZWYsXG4gICAgQ29tcG9uZW50LFxuICAgIEVsZW1lbnRSZWYsXG4gICAgSW5qZWN0b3IsXG4gICAgTmdab25lLFxuICAgIE9uRGVzdHJveSxcbiAgICBPbkluaXQsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBIb3N0TGlzdGVuZXJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBY3RpdmF0ZWRSb3V0ZSwgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IEFic3RyYWN0U3Bpbm5lclNlcnZpY2UsIEFwcCwgbm9vcH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgTWV0YWRhdGFTZXJ2aWNlIH0gZnJvbSAnQHdtL3ZhcmlhYmxlcyc7XG5pbXBvcnQgeyBTZWN1cml0eVNlcnZpY2UgfSBmcm9tICdAd20vc2VjdXJpdHknO1xuaW1wb3J0IHsgQXBwTWFuYWdlclNlcnZpY2UsIENvbXBvbmVudFJlZlByb3ZpZGVyLCBDb21wb25lbnRUeXBlIH0gZnJvbSAnQHdtL3J1bnRpbWUvYmFzZSc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYXBwLXBhZ2Utb3V0bGV0JyxcbiAgICB0ZW1wbGF0ZTogJzxkaXY+PC9kaXY+J1xufSlcbmV4cG9ydCBjbGFzcyBQYWdlV3JhcHBlckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcblxuICAgIHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgICBwcml2YXRlIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICAgICAgcHJpdmF0ZSB2Y1JlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgcHJpdmF0ZSBhcHBSZWY6IEFwcGxpY2F0aW9uUmVmLFxuICAgICAgICBwcml2YXRlIG1ldGFkYXRhU2VydmljZTogTWV0YWRhdGFTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHNlY3VyaXR5U2VydmljZTogU2VjdXJpdHlTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGFwcE1hbmFnZXI6IEFwcE1hbmFnZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBwcml2YXRlIG5nWm9uZTogTmdab25lLFxuICAgICAgICBwcml2YXRlIGVsUmVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwcml2YXRlIHNwaW5uZXJTZXJ2aWNlOiBBYnN0cmFjdFNwaW5uZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGNvbXBvbmVudFJlZlByb3ZpZGVyOiBDb21wb25lbnRSZWZQcm92aWRlcixcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlclxuICAgICkge31cblxuICAgIGdldFRhcmdldE5vZGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgcmVzZXRWaWV3Q29udGFpbmVyKCkge1xuICAgICAgICB0aGlzLnZjUmVmLmNsZWFyKCk7XG4gICAgICAgIGNvbnN0ICR0YXJnZXQgPSB0aGlzLmdldFRhcmdldE5vZGUoKTtcbiAgICAgICAgJHRhcmdldC5pbm5lckhUTUwgPSAnJztcbiAgICB9XG5cbiAgICByZW5kZXJQYWdlKHBhZ2VOYW1lKSB7XG4gICAgICAgIGNvbnN0ICR0YXJnZXQgPSB0aGlzLmdldFRhcmdldE5vZGUoKTtcblxuICAgICAgICB0aGlzLmFwcE1hbmFnZXIubG9hZEFwcFZhcmlhYmxlcygpXG4gICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFnZUNvbXBvbmVudEZhY3RvcnlSZWYgPSBhd2FpdCB0aGlzLmNvbXBvbmVudFJlZlByb3ZpZGVyLmdldENvbXBvbmVudEZhY3RvcnlSZWYocGFnZU5hbWUsIENvbXBvbmVudFR5cGUuUEFHRSk7XG4gICAgICAgICAgICAgICAgaWYgKHBhZ2VDb21wb25lbnRGYWN0b3J5UmVmKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlID0gdGhpcy52Y1JlZi5jcmVhdGVDb21wb25lbnQocGFnZUNvbXBvbmVudEZhY3RvcnlSZWYsIDAsIHRoaXMuaW5qZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0LmFwcGVuZENoaWxkKGluc3RhbmNlLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy52Y1JlZi5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmNSZWYucmVtb3ZlKDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlclByZWZhYlByZXZpZXdQYWdlKCkge1xuICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJ3ByZWZhYi1wcmV2aWV3J10pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNhbkRlYWN0aXZhdGUgaXMgY2FsbGVkIGJlZm9yZSBhIHJvdXRlIGNoYW5nZS5cbiAgICAgKiBUaGlzIHdpbGwgaW50ZXJuYWxseSBjYWxsIG9uQmVmb3JlUGFnZUxlYXZlIG1ldGhvZCBwcmVzZW50XG4gICAgICogYXQgcGFnZSBsZXZlbCBhbmQgYXBwIGxldmVsIGluIHRoZSBhcHBsaWNhdGlvbiBhbmQgZGVjaWRlXG4gICAgICogd2hldGhlciB0byBjaGFuZ2Ugcm91dGUgb3Igbm90IGJhc2VkIG9uIHJldHVybiB2YWx1ZS5cbiAgICAgKi9cbiAgICBASG9zdExpc3RlbmVyKCd3aW5kb3c6YmVmb3JldW5sb2FkJylcbiAgICBjYW5EZWFjdGl2YXRlKCkge1xuICAgICAgICBsZXQgcmV0VmFsO1xuICAgICAgICAvLyBDYWxsaW5nIG9uQmVmb3JlUGFnZUxlYXZlIG1ldGhvZCBwcmVzZW50IGF0IHBhZ2UgbGV2ZWxcbiAgICAgICAgcmV0VmFsID0gdGhpcy5hcHAuYWN0aXZlUGFnZSAmJiB0aGlzLmFwcC5hY3RpdmVQYWdlLm9uQmVmb3JlUGFnZUxlYXZlKCk7XG4gICAgICAgIC8vIENhbGxpbmcgb25CZWZvcmVQYWdlTGVhdmUgbWV0aG9kIHByZXNlbnQgYXQgYXBwIGxldmVsIG9ubHkgaWYgcGFnZSBsZXZlbCBtZXRob2QgcmV0dXJuIHRydWVcbiAgICAgICAgLy8gb3IgaWYgdGhlcmUgaXMgbm8gcGFnZSBsZXZlbCBtZXRob2RcbiAgICAgICAgaWYgKHJldFZhbCAhPT0gZmFsc2UgKSB7XG4gICAgICAgICAgICByZXRWYWwgPSAgKHRoaXMuYXBwLm9uQmVmb3JlUGFnZUxlYXZlIHx8IG5vb3ApKHRoaXMuYXBwLmFjdGl2ZVBhZ2VOYW1lLCB0aGlzLmFwcC5hY3RpdmVQYWdlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0VmFsID09PSB1bmRlZmluZWQgPyB0cnVlIDogcmV0VmFsO1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBpZiAodGhpcy5hcHAuaXNQcmVmYWJUeXBlKSB7XG4gICAgICAgICAgICAvLyB0aGVyZSBpcyBvbmx5IG9uZSByb3V0ZVxuICAgICAgICAgICAgdGhpcy5yZW5kZXJQcmVmYWJQcmV2aWV3UGFnZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCh0aGlzLmdldFRhcmdldE5vZGUoKSkuZmluZCgnPmRpdjpmaXJzdCcpLnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy5zdWJzY3JpcHRpb24gPSB0aGlzLnJvdXRlLnBhcmFtcy5zdWJzY3JpYmUoKHtwYWdlTmFtZX06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYWdlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJQYWdlKHBhZ2VOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy52Y1JlZi5jbGVhcigpO1xuICAgICAgICBpZiAodGhpcy5zdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=