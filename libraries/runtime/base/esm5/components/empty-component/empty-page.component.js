import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { App, getWmProjectProperties } from '@wm/core';
import { SecurityService } from '@wm/security';
import { AppManagerService } from '../../services/app.manager.service';
var EmptyPageComponent = /** @class */ (function () {
    function EmptyPageComponent(route, securityService, router, app, appManger) {
        this.route = route;
        this.securityService = securityService;
        this.router = router;
        this.app = app;
        this.appManger = appManger;
    }
    EmptyPageComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.app.isPrefabType) {
            // there is only one route
            this.router.navigate(['prefab-preview']);
        }
        else if (this.app.isApplicationType) {
            this.securityService.getPageByLoggedInUser().then(function (page) {
                _this.router.navigate([page]);
            });
        }
        else {
            this.router.navigate([getWmProjectProperties().homePage]);
            this.appManger.postAppTypeInfo();
        }
    };
    EmptyPageComponent.decorators = [
        { type: Component, args: [{
                    selector: 'app-empty-page',
                    template: '<div></div>'
                }] }
    ];
    /** @nocollapse */
    EmptyPageComponent.ctorParameters = function () { return [
        { type: ActivatedRoute },
        { type: SecurityService },
        { type: Router },
        { type: App },
        { type: AppManagerService }
    ]; };
    return EmptyPageComponent;
}());
export { EmptyPageComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1wdHktcGFnZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vcnVudGltZS9iYXNlLyIsInNvdXJjZXMiOlsiY29tcG9uZW50cy9lbXB0eS1jb21wb25lbnQvZW1wdHktcGFnZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUNsRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRXpELE9BQU8sRUFBRSxHQUFHLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDdkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUUvQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUV2RTtJQU1JLDRCQUNZLEtBQXFCLEVBQ3JCLGVBQWdDLEVBQ2hDLE1BQWMsRUFDZCxHQUFRLEVBQ1IsU0FBNEI7UUFKNUIsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7UUFDckIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBQ2hDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ1IsY0FBUyxHQUFULFNBQVMsQ0FBbUI7SUFDckMsQ0FBQztJQUVKLHFDQUFRLEdBQVI7UUFBQSxpQkFZQztRQVhHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUU7WUFDdkIsMEJBQTBCO1lBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1NBQzVDO2FBQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFO1lBQ3BDLElBQUksQ0FBQyxlQUFlLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJO2dCQUNsRCxLQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUM7U0FDTjthQUFNO1lBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUNwQztJQUNMLENBQUM7O2dCQTFCSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGdCQUFnQjtvQkFDMUIsUUFBUSxFQUFFLGFBQWE7aUJBQzFCOzs7O2dCQVZRLGNBQWM7Z0JBR2QsZUFBZTtnQkFIQyxNQUFNO2dCQUV0QixHQUFHO2dCQUdILGlCQUFpQjs7SUE2QjFCLHlCQUFDO0NBQUEsQUEzQkQsSUEyQkM7U0F2Qlksa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlLCBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBBcHAsIGdldFdtUHJvamVjdFByb3BlcnRpZXMgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBTZWN1cml0eVNlcnZpY2UgfSBmcm9tICdAd20vc2VjdXJpdHknO1xuXG5pbXBvcnQgeyBBcHBNYW5hZ2VyU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2FwcC5tYW5hZ2VyLnNlcnZpY2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FwcC1lbXB0eS1wYWdlJyxcbiAgICB0ZW1wbGF0ZTogJzxkaXY+PC9kaXY+J1xufSlcbmV4cG9ydCBjbGFzcyBFbXB0eVBhZ2VDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgcm91dGU6IEFjdGl2YXRlZFJvdXRlLFxuICAgICAgICBwcml2YXRlIHNlY3VyaXR5U2VydmljZTogU2VjdXJpdHlTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBwcml2YXRlIGFwcE1hbmdlcjogQXBwTWFuYWdlclNlcnZpY2VcbiAgICApIHt9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuYXBwLmlzUHJlZmFiVHlwZSkge1xuICAgICAgICAgICAgLy8gdGhlcmUgaXMgb25seSBvbmUgcm91dGVcbiAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsncHJlZmFiLXByZXZpZXcnXSk7XG4gICAgICAgIH0gZWxzZSAgaWYgKHRoaXMuYXBwLmlzQXBwbGljYXRpb25UeXBlKSB7XG4gICAgICAgICAgICB0aGlzLnNlY3VyaXR5U2VydmljZS5nZXRQYWdlQnlMb2dnZWRJblVzZXIoKS50aGVuKHBhZ2UgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFtwYWdlXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFtnZXRXbVByb2plY3RQcm9wZXJ0aWVzKCkuaG9tZVBhZ2VdKTtcbiAgICAgICAgICAgIHRoaXMuYXBwTWFuZ2VyLnBvc3RBcHBUeXBlSW5mbygpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19