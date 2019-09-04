import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { httpService, appManager } from '@wm/variables';
import { WmHttpRequest, WmHttpResponse } from '@wm/http';
/**
 * This Interceptor intercepts all network calls and if a network call fails
 * due to session timeout, then it calls a function to handle session timeout.
 */
var HttpCallInterceptor = /** @class */ (function () {
    function HttpCallInterceptor() {
        this.wmHttpRequest = new WmHttpRequest();
        this.wmHttpResponse = new WmHttpResponse();
    }
    HttpCallInterceptor.prototype.createSubject = function () {
        return new Subject();
    };
    HttpCallInterceptor.prototype.intercept = function (request, next) {
        var _this = this;
        var modifiedReq;
        var modifiedResp;
        if (appManager && appManager.appOnBeforeServiceCall) {
            // Convert the angular HttpRequest to wm HttpRequest
            var req = this.wmHttpRequest.angularToWmRequest(request);
            // trigger the common onBeforeServiceCall handler present in app.js
            modifiedReq = appManager.appOnBeforeServiceCall(req);
            if (modifiedReq) {
                // Convert the wm HttpRequest to angular HttpRequest
                modifiedReq = this.wmHttpRequest.wmToAngularRequest(modifiedReq);
                request = modifiedReq;
            }
        }
        return next.handle(request).pipe(tap(function (response) {
            if (response && response.type === 4 && appManager && appManager.appOnServiceSuccess) {
                // Convert the angular HttpResponse to wm HttpResponse
                var resp = _this.wmHttpResponse.angularToWmResponse(response);
                // trigger the common success handler present in app.js
                modifiedResp = appManager.appOnServiceSuccess(resp.body, resp);
                if (modifiedResp) {
                    // Convert the wm HttpResponse to angular HttpResponse
                    modifiedResp = _this.wmHttpResponse.wmToAngularResponse(modifiedResp);
                    _.extend(response, modifiedResp);
                }
            }
        }, function (error) {
            error._401Subscriber = _this.createSubject();
            if (httpService.isPlatformSessionTimeout(error)) {
                httpService.handleSessionTimeout(request, error._401Subscriber);
            }
            if (appManager && appManager.appOnServiceError) {
                // Convert the angular HttpResponse to wm HttpResponse
                var err = _this.wmHttpResponse.angularToWmResponse(error);
                // trigger the common error handler present in app.js
                modifiedResp = appManager.appOnServiceError(err.message, err);
                if (modifiedResp) {
                    // Convert the wm HttpResponse to angular HttpResponse
                    modifiedResp = _this.wmHttpResponse.wmToAngularResponse(modifiedResp);
                    _.extend(error, modifiedResp);
                }
            }
        }));
    };
    HttpCallInterceptor.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    HttpCallInterceptor.ctorParameters = function () { return []; };
    return HttpCallInterceptor;
}());
export { HttpCallInterceptor };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1pbnRlcmNlcHRvci5zZXJ2aWNlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9odHRwLWludGVyY2VwdG9yLnNlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFJM0MsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3JDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFL0IsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDeEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJekQ7OztHQUdHO0FBQ0g7SUFNSTtRQUNJLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVELDJDQUFhLEdBQWI7UUFDSSxPQUFPLElBQUksT0FBTyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUNELHVDQUFTLEdBQVQsVUFBVSxPQUF5QixFQUFFLElBQWlCO1FBQXRELGlCQStDQztRQTlDRyxJQUFJLFdBQVcsQ0FBQztRQUNoQixJQUFJLFlBQVksQ0FBQztRQUNqQixJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsc0JBQXNCLEVBQUU7WUFDakQsb0RBQW9EO1lBQ3BELElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0QsbUVBQW1FO1lBQ25FLFdBQVcsR0FBSSxVQUFVLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEQsSUFBSSxXQUFXLEVBQUU7Z0JBQ2Isb0RBQW9EO2dCQUNwRCxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDakUsT0FBTyxHQUFHLFdBQVcsQ0FBQzthQUN6QjtTQUNKO1FBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FDNUIsR0FBRyxDQUFDLFVBQUMsUUFBYTtZQUNWLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLFVBQVUsSUFBSyxVQUFVLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ2xGLHNEQUFzRDtnQkFDdEQsSUFBTSxJQUFJLEdBQUcsS0FBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDL0QsdURBQXVEO2dCQUN2RCxZQUFZLEdBQUcsVUFBVSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQy9ELElBQUksWUFBWSxFQUFFO29CQUNkLHNEQUFzRDtvQkFDdEQsWUFBWSxHQUFHLEtBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3JFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO2lCQUNwQzthQUNKO1FBQ0wsQ0FBQyxFQUNELFVBQUEsS0FBSztZQUNELEtBQUssQ0FBQyxjQUFjLEdBQUcsS0FBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzVDLElBQUksV0FBVyxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM3QyxXQUFXLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUNuRTtZQUNELElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRTtnQkFDNUMsc0RBQXNEO2dCQUN0RCxJQUFNLEdBQUcsR0FBRyxLQUFJLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMzRCxxREFBcUQ7Z0JBQ3JELFlBQVksR0FBRyxVQUFVLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxZQUFZLEVBQUU7b0JBQ2Qsc0RBQXNEO29CQUN0RCxZQUFZLEdBQUcsS0FBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDckUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7aUJBQ2pDO2FBQ0o7UUFDTCxDQUFDLENBQ0osQ0FDSixDQUFDO0lBQ04sQ0FBQzs7Z0JBN0RKLFVBQVU7Ozs7SUE4RFgsMEJBQUM7Q0FBQSxBQTlERCxJQThEQztTQTdEWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwRXZlbnQsIEh0dHBIYW5kbGVyLCBIdHRwSW50ZXJjZXB0b3IsIEh0dHBSZXF1ZXN0LCBIdHRwUmVzcG9uc2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzL09ic2VydmFibGUnO1xuaW1wb3J0IHsgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBodHRwU2VydmljZSwgYXBwTWFuYWdlciB9IGZyb20gJ0B3bS92YXJpYWJsZXMnO1xuaW1wb3J0IHsgV21IdHRwUmVxdWVzdCwgV21IdHRwUmVzcG9uc2UgfSBmcm9tICdAd20vaHR0cCc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuLyoqXG4gKiBUaGlzIEludGVyY2VwdG9yIGludGVyY2VwdHMgYWxsIG5ldHdvcmsgY2FsbHMgYW5kIGlmIGEgbmV0d29yayBjYWxsIGZhaWxzXG4gKiBkdWUgdG8gc2Vzc2lvbiB0aW1lb3V0LCB0aGVuIGl0IGNhbGxzIGEgZnVuY3Rpb24gdG8gaGFuZGxlIHNlc3Npb24gdGltZW91dC5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBDYWxsSW50ZXJjZXB0b3IgaW1wbGVtZW50cyBIdHRwSW50ZXJjZXB0b3Ige1xuXG4gICAgd21IdHRwUmVxdWVzdDogYW55O1xuICAgIHdtSHR0cFJlc3BvbnNlOiBhbnk7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMud21IdHRwUmVxdWVzdCA9IG5ldyBXbUh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHRoaXMud21IdHRwUmVzcG9uc2UgPSBuZXcgV21IdHRwUmVzcG9uc2UoKTtcbiAgICB9XG5cbiAgICBjcmVhdGVTdWJqZWN0KCkge1xuICAgICAgICByZXR1cm4gbmV3IFN1YmplY3QoKTtcbiAgICB9XG4gICAgaW50ZXJjZXB0KHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgICAgICBsZXQgbW9kaWZpZWRSZXE7XG4gICAgICAgIGxldCBtb2RpZmllZFJlc3A7XG4gICAgICAgIGlmIChhcHBNYW5hZ2VyICYmIGFwcE1hbmFnZXIuYXBwT25CZWZvcmVTZXJ2aWNlQ2FsbCkge1xuICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgYW5ndWxhciBIdHRwUmVxdWVzdCB0byB3bSBIdHRwUmVxdWVzdFxuICAgICAgICAgICAgY29uc3QgcmVxID0gdGhpcy53bUh0dHBSZXF1ZXN0LmFuZ3VsYXJUb1dtUmVxdWVzdChyZXF1ZXN0KTtcbiAgICAgICAgICAgIC8vIHRyaWdnZXIgdGhlIGNvbW1vbiBvbkJlZm9yZVNlcnZpY2VDYWxsIGhhbmRsZXIgcHJlc2VudCBpbiBhcHAuanNcbiAgICAgICAgICAgIG1vZGlmaWVkUmVxID0gIGFwcE1hbmFnZXIuYXBwT25CZWZvcmVTZXJ2aWNlQ2FsbChyZXEpO1xuICAgICAgICAgICAgaWYgKG1vZGlmaWVkUmVxKSB7XG4gICAgICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgd20gSHR0cFJlcXVlc3QgdG8gYW5ndWxhciBIdHRwUmVxdWVzdFxuICAgICAgICAgICAgICAgIG1vZGlmaWVkUmVxID0gdGhpcy53bUh0dHBSZXF1ZXN0LndtVG9Bbmd1bGFyUmVxdWVzdChtb2RpZmllZFJlcSk7XG4gICAgICAgICAgICAgICAgcmVxdWVzdCA9IG1vZGlmaWVkUmVxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXF1ZXN0KS5waXBlKFxuICAgICAgICAgICAgdGFwKChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS50eXBlID09PSA0ICYmIGFwcE1hbmFnZXIgJiYgIGFwcE1hbmFnZXIuYXBwT25TZXJ2aWNlU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgYW5ndWxhciBIdHRwUmVzcG9uc2UgdG8gd20gSHR0cFJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwID0gdGhpcy53bUh0dHBSZXNwb25zZS5hbmd1bGFyVG9XbVJlc3BvbnNlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRyaWdnZXIgdGhlIGNvbW1vbiBzdWNjZXNzIGhhbmRsZXIgcHJlc2VudCBpbiBhcHAuanNcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkUmVzcCA9IGFwcE1hbmFnZXIuYXBwT25TZXJ2aWNlU3VjY2VzcyhyZXNwLmJvZHksIHJlc3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGlmaWVkUmVzcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgdGhlIHdtIEh0dHBSZXNwb25zZSB0byBhbmd1bGFyIEh0dHBSZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkUmVzcCA9IHRoaXMud21IdHRwUmVzcG9uc2Uud21Ub0FuZ3VsYXJSZXNwb25zZShtb2RpZmllZFJlc3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZXh0ZW5kKHJlc3BvbnNlLCBtb2RpZmllZFJlc3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yLl80MDFTdWJzY3JpYmVyID0gdGhpcy5jcmVhdGVTdWJqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChodHRwU2VydmljZS5pc1BsYXRmb3JtU2Vzc2lvblRpbWVvdXQoZXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBodHRwU2VydmljZS5oYW5kbGVTZXNzaW9uVGltZW91dChyZXF1ZXN0LCBlcnJvci5fNDAxU3Vic2NyaWJlcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFwcE1hbmFnZXIgJiYgYXBwTWFuYWdlci5hcHBPblNlcnZpY2VFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgYW5ndWxhciBIdHRwUmVzcG9uc2UgdG8gd20gSHR0cFJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnIgPSB0aGlzLndtSHR0cFJlc3BvbnNlLmFuZ3VsYXJUb1dtUmVzcG9uc2UoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHJpZ2dlciB0aGUgY29tbW9uIGVycm9yIGhhbmRsZXIgcHJlc2VudCBpbiBhcHAuanNcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkUmVzcCA9IGFwcE1hbmFnZXIuYXBwT25TZXJ2aWNlRXJyb3IoZXJyLm1lc3NhZ2UsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kaWZpZWRSZXNwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgd20gSHR0cFJlc3BvbnNlIHRvIGFuZ3VsYXIgSHR0cFJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRSZXNwID0gdGhpcy53bUh0dHBSZXNwb25zZS53bVRvQW5ndWxhclJlc3BvbnNlKG1vZGlmaWVkUmVzcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5leHRlbmQoZXJyb3IsIG1vZGlmaWVkUmVzcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufVxuIl19