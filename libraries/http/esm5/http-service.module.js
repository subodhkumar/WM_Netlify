/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AbstractHttpService } from '@wm/core';
import { HttpServiceImpl } from './http.service';
var HttpServiceModule = /** @class */ (function () {
    function HttpServiceModule() {
    }
    /**
     * @return {?}
     */
    HttpServiceModule.forRoot = /**
     * @return {?}
     */
    function () {
        return {
            ngModule: CommonModule,
            providers: [
                { provide: AbstractHttpService, useClass: HttpServiceImpl }
            ]
        };
    };
    HttpServiceModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        CommonModule,
                        HttpClientModule
                    ],
                    declarations: []
                },] }
    ];
    return HttpServiceModule;
}());
export { HttpServiceModule };
export { HttpServiceImpl } from './http.service';
export { WmHttpRequest } from './wm-http-request';
export { WmHttpResponse } from './wm-http-response';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1zZXJ2aWNlLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9odHRwLyIsInNvdXJjZXMiOlsiaHR0cC1zZXJ2aWNlLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUF1QixRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDOUQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRXhELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUvQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQ7SUFBQTtJQWlCQSxDQUFDOzs7O0lBUlUseUJBQU87OztJQUFkO1FBQ0ksT0FBTztZQUNILFFBQVEsRUFBRSxZQUFZO1lBQ3RCLFNBQVMsRUFBRTtnQkFDUCxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFDO2FBQzVEO1NBQ0osQ0FBQztJQUNOLENBQUM7O2dCQWhCSixRQUFRLFNBQUM7b0JBQ04sT0FBTyxFQUFFO3dCQUNMLFlBQVk7d0JBQ1osZ0JBQWdCO3FCQUNuQjtvQkFDRCxZQUFZLEVBQUUsRUFBRTtpQkFDbkI7O0lBV0Qsd0JBQUM7Q0FBQSxBQWpCRCxJQWlCQztTQVZZLGlCQUFpQjtBQVk5QixnQ0FBYyxnQkFBZ0IsQ0FBQztBQUMvQiw4QkFBYyxtQkFBbUIsQ0FBQztBQUNsQywrQkFBYyxvQkFBb0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgSHR0cENsaWVudE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuaW1wb3J0IHsgQWJzdHJhY3RIdHRwU2VydmljZSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgSHR0cFNlcnZpY2VJbXBsIH0gZnJvbSAnLi9odHRwLnNlcnZpY2UnO1xuXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtcbiAgICAgICAgQ29tbW9uTW9kdWxlLFxuICAgICAgICBIdHRwQ2xpZW50TW9kdWxlXG4gICAgXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtdXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBTZXJ2aWNlTW9kdWxlIHtcblxuICAgIHN0YXRpYyBmb3JSb290KCk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmdNb2R1bGU6IENvbW1vbk1vZHVsZSxcbiAgICAgICAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICAgICAgICAgIHtwcm92aWRlOiBBYnN0cmFjdEh0dHBTZXJ2aWNlLCB1c2VDbGFzczogSHR0cFNlcnZpY2VJbXBsfVxuICAgICAgICAgICAgXVxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0ICogZnJvbSAnLi9odHRwLnNlcnZpY2UnO1xuZXhwb3J0ICogZnJvbSAnLi93bS1odHRwLXJlcXVlc3QnO1xuZXhwb3J0ICogZnJvbSAnLi93bS1odHRwLXJlc3BvbnNlJztcbiJdfQ==