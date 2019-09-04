/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AbstractHttpService } from '@wm/core';
import { HttpServiceImpl } from './http.service';
export class HttpServiceModule {
    /**
     * @return {?}
     */
    static forRoot() {
        return {
            ngModule: CommonModule,
            providers: [
                { provide: AbstractHttpService, useClass: HttpServiceImpl }
            ]
        };
    }
}
HttpServiceModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    HttpClientModule
                ],
                declarations: []
            },] }
];
export { HttpServiceImpl } from './http.service';
export { WmHttpRequest } from './wm-http-request';
export { WmHttpResponse } from './wm-http-response';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1zZXJ2aWNlLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9odHRwLyIsInNvdXJjZXMiOlsiaHR0cC1zZXJ2aWNlLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUF1QixRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDOUQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRXhELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUvQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFTakQsTUFBTSxPQUFPLGlCQUFpQjs7OztJQUUxQixNQUFNLENBQUMsT0FBTztRQUNWLE9BQU87WUFDSCxRQUFRLEVBQUUsWUFBWTtZQUN0QixTQUFTLEVBQUU7Z0JBQ1AsRUFBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBQzthQUM1RDtTQUNKLENBQUM7SUFDTixDQUFDOzs7WUFoQkosUUFBUSxTQUFDO2dCQUNOLE9BQU8sRUFBRTtvQkFDTCxZQUFZO29CQUNaLGdCQUFnQjtpQkFDbkI7Z0JBQ0QsWUFBWSxFQUFFLEVBQUU7YUFDbkI7O0FBYUQsZ0NBQWMsZ0JBQWdCLENBQUM7QUFDL0IsOEJBQWMsbUJBQW1CLENBQUM7QUFDbEMsK0JBQWMsb0JBQW9CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IEh0dHBDbGllbnRNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IEFic3RyYWN0SHR0cFNlcnZpY2UgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEh0dHBTZXJ2aWNlSW1wbCB9IGZyb20gJy4vaHR0cC5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAgIENvbW1vbk1vZHVsZSxcbiAgICAgICAgSHR0cENsaWVudE1vZHVsZVxuICAgIF0sXG4gICAgZGVjbGFyYXRpb25zOiBbXVxufSlcbmV4cG9ydCBjbGFzcyBIdHRwU2VydmljZU1vZHVsZSB7XG5cbiAgICBzdGF0aWMgZm9yUm9vdCgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5nTW9kdWxlOiBDb21tb25Nb2R1bGUsXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgICAgICAgICB7cHJvdmlkZTogQWJzdHJhY3RIdHRwU2VydmljZSwgdXNlQ2xhc3M6IEh0dHBTZXJ2aWNlSW1wbH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmV4cG9ydCAqIGZyb20gJy4vaHR0cC5zZXJ2aWNlJztcbmV4cG9ydCAqIGZyb20gJy4vd20taHR0cC1yZXF1ZXN0JztcbmV4cG9ydCAqIGZyb20gJy4vd20taHR0cC1yZXNwb25zZSc7XG4iXX0=