import { Component, ElementRef } from '@angular/core';
import { addClass } from '@wm/core';
import { provideAsWidgetRef } from '@wm/components';
export class PageContentLoaderComponent {
    constructor(el) {
        addClass(el.nativeElement, 'app-page-content-loader');
    }
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
PageContentLoaderComponent.ctorParameters = () => [
    { type: ElementRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS1jb250ZW50LWxvYWRlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL3BhZ2UtY29udGVudC1sb2FkZXIvcGFnZS1jb250ZW50LWxvYWRlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNwQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQVNwRCxNQUFNLE9BQU8sMEJBQTBCO0lBRW5DLFlBQVksRUFBYztRQUN0QixRQUFRLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO0lBQzFELENBQUM7OztZQVhKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsdUJBQXVCO2dCQUNqQyxvRkFBbUQ7Z0JBQ25ELFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQywwQkFBMEIsQ0FBQztpQkFDakQ7YUFDSjs7OztZQVhtQixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGFkZENsYXNzIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bVBhZ2VDb250ZW50TG9hZGVyXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3BhZ2UtY29udGVudC1sb2FkZXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoUGFnZUNvbnRlbnRMb2FkZXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBQYWdlQ29udGVudExvYWRlckNvbXBvbmVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcihlbDogRWxlbWVudFJlZikge1xuICAgICAgICBhZGRDbGFzcyhlbC5uYXRpdmVFbGVtZW50LCAnYXBwLXBhZ2UtY29udGVudC1sb2FkZXInKTtcbiAgICB9XG59XG4iXX0=