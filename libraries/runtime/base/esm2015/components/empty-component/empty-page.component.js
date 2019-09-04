import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { App, getWmProjectProperties } from '@wm/core';
import { SecurityService } from '@wm/security';
import { AppManagerService } from '../../services/app.manager.service';
export class EmptyPageComponent {
    constructor(route, securityService, router, app, appManger) {
        this.route = route;
        this.securityService = securityService;
        this.router = router;
        this.app = app;
        this.appManger = appManger;
    }
    ngOnInit() {
        if (this.app.isPrefabType) {
            // there is only one route
            this.router.navigate(['prefab-preview']);
        }
        else if (this.app.isApplicationType) {
            this.securityService.getPageByLoggedInUser().then(page => {
                this.router.navigate([page]);
            });
        }
        else {
            this.router.navigate([getWmProjectProperties().homePage]);
            this.appManger.postAppTypeInfo();
        }
    }
}
EmptyPageComponent.decorators = [
    { type: Component, args: [{
                selector: 'app-empty-page',
                template: '<div></div>'
            }] }
];
/** @nocollapse */
EmptyPageComponent.ctorParameters = () => [
    { type: ActivatedRoute },
    { type: SecurityService },
    { type: Router },
    { type: App },
    { type: AppManagerService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1wdHktcGFnZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vcnVudGltZS9iYXNlLyIsInNvdXJjZXMiOlsiY29tcG9uZW50cy9lbXB0eS1jb21wb25lbnQvZW1wdHktcGFnZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUNsRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRXpELE9BQU8sRUFBRSxHQUFHLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDdkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUUvQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQU12RSxNQUFNLE9BQU8sa0JBQWtCO0lBRTNCLFlBQ1ksS0FBcUIsRUFDckIsZUFBZ0MsRUFDaEMsTUFBYyxFQUNkLEdBQVEsRUFDUixTQUE0QjtRQUo1QixVQUFLLEdBQUwsS0FBSyxDQUFnQjtRQUNyQixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDaEMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFDUixjQUFTLEdBQVQsU0FBUyxDQUFtQjtJQUNyQyxDQUFDO0lBRUosUUFBUTtRQUNKLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUU7WUFDdkIsMEJBQTBCO1lBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1NBQzVDO2FBQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFO1lBQ3BDLElBQUksQ0FBQyxlQUFlLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3JELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLHNCQUFzQixFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQ3BDO0lBQ0wsQ0FBQzs7O1lBMUJKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsZ0JBQWdCO2dCQUMxQixRQUFRLEVBQUUsYUFBYTthQUMxQjs7OztZQVZRLGNBQWM7WUFHZCxlQUFlO1lBSEMsTUFBTTtZQUV0QixHQUFHO1lBR0gsaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlLCBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBBcHAsIGdldFdtUHJvamVjdFByb3BlcnRpZXMgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBTZWN1cml0eVNlcnZpY2UgfSBmcm9tICdAd20vc2VjdXJpdHknO1xuXG5pbXBvcnQgeyBBcHBNYW5hZ2VyU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2FwcC5tYW5hZ2VyLnNlcnZpY2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FwcC1lbXB0eS1wYWdlJyxcbiAgICB0ZW1wbGF0ZTogJzxkaXY+PC9kaXY+J1xufSlcbmV4cG9ydCBjbGFzcyBFbXB0eVBhZ2VDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgcm91dGU6IEFjdGl2YXRlZFJvdXRlLFxuICAgICAgICBwcml2YXRlIHNlY3VyaXR5U2VydmljZTogU2VjdXJpdHlTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBwcml2YXRlIGFwcE1hbmdlcjogQXBwTWFuYWdlclNlcnZpY2VcbiAgICApIHt9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuYXBwLmlzUHJlZmFiVHlwZSkge1xuICAgICAgICAgICAgLy8gdGhlcmUgaXMgb25seSBvbmUgcm91dGVcbiAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsncHJlZmFiLXByZXZpZXcnXSk7XG4gICAgICAgIH0gZWxzZSAgaWYgKHRoaXMuYXBwLmlzQXBwbGljYXRpb25UeXBlKSB7XG4gICAgICAgICAgICB0aGlzLnNlY3VyaXR5U2VydmljZS5nZXRQYWdlQnlMb2dnZWRJblVzZXIoKS50aGVuKHBhZ2UgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFtwYWdlXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFtnZXRXbVByb2plY3RQcm9wZXJ0aWVzKCkuaG9tZVBhZ2VdKTtcbiAgICAgICAgICAgIHRoaXMuYXBwTWFuZ2VyLnBvc3RBcHBUeXBlSW5mbygpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19