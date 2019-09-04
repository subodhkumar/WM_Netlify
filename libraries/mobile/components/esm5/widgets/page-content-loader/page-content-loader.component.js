import { Component, ElementRef } from '@angular/core';
import { addClass } from '@wm/core';
import { provideAsWidgetRef } from '@wm/components';
var PageContentLoaderComponent = /** @class */ (function () {
    function PageContentLoaderComponent(el) {
        addClass(el.nativeElement, 'app-page-content-loader');
    }
    PageContentLoaderComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmPageContentLoader]',
                    template: "<div class=\"loader bg-primary\"></div>\n<div class=\"load-info\"></div>",
                    providers: [
                        provideAsWidgetRef(PageContentLoaderComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    PageContentLoaderComponent.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    return PageContentLoaderComponent;
}());
export { PageContentLoaderComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS1jb250ZW50LWxvYWRlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL3BhZ2UtY29udGVudC1sb2FkZXIvcGFnZS1jb250ZW50LWxvYWRlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNwQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRDtJQVNJLG9DQUFZLEVBQWM7UUFDdEIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUseUJBQXlCLENBQUMsQ0FBQztJQUMxRCxDQUFDOztnQkFYSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLHVCQUF1QjtvQkFDakMsb0ZBQW1EO29CQUNuRCxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsMEJBQTBCLENBQUM7cUJBQ2pEO2lCQUNKOzs7O2dCQVhtQixVQUFVOztJQWlCOUIsaUNBQUM7Q0FBQSxBQVpELElBWUM7U0FMWSwwQkFBMEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgYWRkQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtUGFnZUNvbnRlbnRMb2FkZXJdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vcGFnZS1jb250ZW50LWxvYWRlci5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihQYWdlQ29udGVudExvYWRlckNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFBhZ2VDb250ZW50TG9hZGVyQ29tcG9uZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKGVsOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIGFkZENsYXNzKGVsLm5hdGl2ZUVsZW1lbnQsICdhcHAtcGFnZS1jb250ZW50LWxvYWRlcicpO1xuICAgIH1cbn1cbiJdfQ==