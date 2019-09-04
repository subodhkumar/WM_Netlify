import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { httpService, appManager } from '@wm/variables';
import { WmHttpRequest, WmHttpResponse } from '@wm/http';
/**
 * This Interceptor intercepts all network calls and if a network call fails
 * due to session timeout, then it calls a function to handle session timeout.
 */
export class HttpCallInterceptor {
    constructor() {
        this.wmHttpRequest = new WmHttpRequest();
        this.wmHttpResponse = new WmHttpResponse();
    }
    createSubject() {
        return new Subject();
    }
    intercept(request, next) {
        let modifiedReq;
        let modifiedResp;
        if (appManager && appManager.appOnBeforeServiceCall) {
            // Convert the angular HttpRequest to wm HttpRequest
            const req = this.wmHttpRequest.angularToWmRequest(request);
            // trigger the common onBeforeServiceCall handler present in app.js
            modifiedReq = appManager.appOnBeforeServiceCall(req);
            if (modifiedReq) {
                // Convert the wm HttpRequest to angular HttpRequest
                modifiedReq = this.wmHttpRequest.wmToAngularRequest(modifiedReq);
                request = modifiedReq;
            }
        }
        return next.handle(request).pipe(tap((response) => {
            if (response && response.type === 4 && appManager && appManager.appOnServiceSuccess) {
                // Convert the angular HttpResponse to wm HttpResponse
                const resp = this.wmHttpResponse.angularToWmResponse(response);
                // trigger the common success handler present in app.js
                modifiedResp = appManager.appOnServiceSuccess(resp.body, resp);
                if (modifiedResp) {
                    // Convert the wm HttpResponse to angular HttpResponse
                    modifiedResp = this.wmHttpResponse.wmToAngularResponse(modifiedResp);
                    _.extend(response, modifiedResp);
                }
            }
        }, error => {
            error._401Subscriber = this.createSubject();
            if (httpService.isPlatformSessionTimeout(error)) {
                httpService.handleSessionTimeout(request, error._401Subscriber);
            }
            if (appManager && appManager.appOnServiceError) {
                // Convert the angular HttpResponse to wm HttpResponse
                const err = this.wmHttpResponse.angularToWmResponse(error);
                // trigger the common error handler present in app.js
                modifiedResp = appManager.appOnServiceError(err.message, err);
                if (modifiedResp) {
                    // Convert the wm HttpResponse to angular HttpResponse
                    modifiedResp = this.wmHttpResponse.wmToAngularResponse(modifiedResp);
                    _.extend(error, modifiedResp);
                }
            }
        }));
    }
}
HttpCallInterceptor.decorators = [
    { type: Injectable }
];
/** @nocollapse */
HttpCallInterceptor.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1pbnRlcmNlcHRvci5zZXJ2aWNlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9odHRwLWludGVyY2VwdG9yLnNlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFJM0MsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3JDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFL0IsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDeEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJekQ7OztHQUdHO0FBRUgsTUFBTSxPQUFPLG1CQUFtQjtJQUs1QjtRQUNJLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVELGFBQWE7UUFDVCxPQUFPLElBQUksT0FBTyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUNELFNBQVMsQ0FBQyxPQUF5QixFQUFFLElBQWlCO1FBQ2xELElBQUksV0FBVyxDQUFDO1FBQ2hCLElBQUksWUFBWSxDQUFDO1FBQ2pCLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRTtZQUNqRCxvREFBb0Q7WUFDcEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzRCxtRUFBbUU7WUFDbkUsV0FBVyxHQUFJLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0RCxJQUFJLFdBQVcsRUFBRTtnQkFDYixvREFBb0Q7Z0JBQ3BELFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNqRSxPQUFPLEdBQUcsV0FBVyxDQUFDO2FBQ3pCO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUM1QixHQUFHLENBQUMsQ0FBQyxRQUFhLEVBQUUsRUFBRTtZQUNkLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLFVBQVUsSUFBSyxVQUFVLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ2xGLHNEQUFzRDtnQkFDdEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDL0QsdURBQXVEO2dCQUN2RCxZQUFZLEdBQUcsVUFBVSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQy9ELElBQUksWUFBWSxFQUFFO29CQUNkLHNEQUFzRDtvQkFDdEQsWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3JFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO2lCQUNwQzthQUNKO1FBQ0wsQ0FBQyxFQUNELEtBQUssQ0FBQyxFQUFFO1lBQ0osS0FBSyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDNUMsSUFBSSxXQUFXLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzdDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2FBQ25FO1lBQ0QsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLGlCQUFpQixFQUFFO2dCQUM1QyxzREFBc0Q7Z0JBQ3RELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzNELHFEQUFxRDtnQkFDckQsWUFBWSxHQUFHLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUM5RCxJQUFJLFlBQVksRUFBRTtvQkFDZCxzREFBc0Q7b0JBQ3RELFlBQVksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUNyRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztpQkFDakM7YUFDSjtRQUNMLENBQUMsQ0FDSixDQUNKLENBQUM7SUFDTixDQUFDOzs7WUE3REosVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEh0dHBFdmVudCwgSHR0cEhhbmRsZXIsIEh0dHBJbnRlcmNlcHRvciwgSHR0cFJlcXVlc3QsIEh0dHBSZXNwb25zZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMvT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IGh0dHBTZXJ2aWNlLCBhcHBNYW5hZ2VyIH0gZnJvbSAnQHdtL3ZhcmlhYmxlcyc7XG5pbXBvcnQgeyBXbUh0dHBSZXF1ZXN0LCBXbUh0dHBSZXNwb25zZSB9IGZyb20gJ0B3bS9odHRwJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG4vKipcbiAqIFRoaXMgSW50ZXJjZXB0b3IgaW50ZXJjZXB0cyBhbGwgbmV0d29yayBjYWxscyBhbmQgaWYgYSBuZXR3b3JrIGNhbGwgZmFpbHNcbiAqIGR1ZSB0byBzZXNzaW9uIHRpbWVvdXQsIHRoZW4gaXQgY2FsbHMgYSBmdW5jdGlvbiB0byBoYW5kbGUgc2Vzc2lvbiB0aW1lb3V0LlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cENhbGxJbnRlcmNlcHRvciBpbXBsZW1lbnRzIEh0dHBJbnRlcmNlcHRvciB7XG5cbiAgICB3bUh0dHBSZXF1ZXN0OiBhbnk7XG4gICAgd21IdHRwUmVzcG9uc2U6IGFueTtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy53bUh0dHBSZXF1ZXN0ID0gbmV3IFdtSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgdGhpcy53bUh0dHBSZXNwb25zZSA9IG5ldyBXbUh0dHBSZXNwb25zZSgpO1xuICAgIH1cblxuICAgIGNyZWF0ZVN1YmplY3QoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3ViamVjdCgpO1xuICAgIH1cbiAgICBpbnRlcmNlcHQocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgICAgIGxldCBtb2RpZmllZFJlcTtcbiAgICAgICAgbGV0IG1vZGlmaWVkUmVzcDtcbiAgICAgICAgaWYgKGFwcE1hbmFnZXIgJiYgYXBwTWFuYWdlci5hcHBPbkJlZm9yZVNlcnZpY2VDYWxsKSB7XG4gICAgICAgICAgICAvLyBDb252ZXJ0IHRoZSBhbmd1bGFyIEh0dHBSZXF1ZXN0IHRvIHdtIEh0dHBSZXF1ZXN0XG4gICAgICAgICAgICBjb25zdCByZXEgPSB0aGlzLndtSHR0cFJlcXVlc3QuYW5ndWxhclRvV21SZXF1ZXN0KHJlcXVlc3QpO1xuICAgICAgICAgICAgLy8gdHJpZ2dlciB0aGUgY29tbW9uIG9uQmVmb3JlU2VydmljZUNhbGwgaGFuZGxlciBwcmVzZW50IGluIGFwcC5qc1xuICAgICAgICAgICAgbW9kaWZpZWRSZXEgPSAgYXBwTWFuYWdlci5hcHBPbkJlZm9yZVNlcnZpY2VDYWxsKHJlcSk7XG4gICAgICAgICAgICBpZiAobW9kaWZpZWRSZXEpIHtcbiAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRoZSB3bSBIdHRwUmVxdWVzdCB0byBhbmd1bGFyIEh0dHBSZXF1ZXN0XG4gICAgICAgICAgICAgICAgbW9kaWZpZWRSZXEgPSB0aGlzLndtSHR0cFJlcXVlc3Qud21Ub0FuZ3VsYXJSZXF1ZXN0KG1vZGlmaWVkUmVxKTtcbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gbW9kaWZpZWRSZXE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcXVlc3QpLnBpcGUoXG4gICAgICAgICAgICB0YXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLnR5cGUgPT09IDQgJiYgYXBwTWFuYWdlciAmJiAgYXBwTWFuYWdlci5hcHBPblNlcnZpY2VTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRoZSBhbmd1bGFyIEh0dHBSZXNwb25zZSB0byB3bSBIdHRwUmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3AgPSB0aGlzLndtSHR0cFJlc3BvbnNlLmFuZ3VsYXJUb1dtUmVzcG9uc2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHJpZ2dlciB0aGUgY29tbW9uIHN1Y2Nlc3MgaGFuZGxlciBwcmVzZW50IGluIGFwcC5qc1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRSZXNwID0gYXBwTWFuYWdlci5hcHBPblNlcnZpY2VTdWNjZXNzKHJlc3AuYm9keSwgcmVzcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kaWZpZWRSZXNwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgd20gSHR0cFJlc3BvbnNlIHRvIGFuZ3VsYXIgSHR0cFJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRSZXNwID0gdGhpcy53bUh0dHBSZXNwb25zZS53bVRvQW5ndWxhclJlc3BvbnNlKG1vZGlmaWVkUmVzcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5leHRlbmQocmVzcG9uc2UsIG1vZGlmaWVkUmVzcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuXzQwMVN1YnNjcmliZXIgPSB0aGlzLmNyZWF0ZVN1YmplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGh0dHBTZXJ2aWNlLmlzUGxhdGZvcm1TZXNzaW9uVGltZW91dChlcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0dHBTZXJ2aWNlLmhhbmRsZVNlc3Npb25UaW1lb3V0KHJlcXVlc3QsIGVycm9yLl80MDFTdWJzY3JpYmVyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYXBwTWFuYWdlciAmJiBhcHBNYW5hZ2VyLmFwcE9uU2VydmljZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRoZSBhbmd1bGFyIEh0dHBSZXNwb25zZSB0byB3bSBIdHRwUmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVyciA9IHRoaXMud21IdHRwUmVzcG9uc2UuYW5ndWxhclRvV21SZXNwb25zZShlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0cmlnZ2VyIHRoZSBjb21tb24gZXJyb3IgaGFuZGxlciBwcmVzZW50IGluIGFwcC5qc1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRSZXNwID0gYXBwTWFuYWdlci5hcHBPblNlcnZpY2VFcnJvcihlcnIubWVzc2FnZSwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb2RpZmllZFJlc3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRoZSB3bSBIdHRwUmVzcG9uc2UgdG8gYW5ndWxhciBIdHRwUmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RpZmllZFJlc3AgPSB0aGlzLndtSHR0cFJlc3BvbnNlLndtVG9Bbmd1bGFyUmVzcG9uc2UobW9kaWZpZWRSZXNwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmV4dGVuZChlcnJvciwgbW9kaWZpZWRSZXNwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=