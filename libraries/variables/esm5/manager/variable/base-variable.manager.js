import { httpService, processBinding } from '../../util/variable/variables.utils';
import { appManager } from './../../util/variable/variables.utils';
var BaseVariableManager = /** @class */ (function () {
    function BaseVariableManager() {
    }
    BaseVariableManager.prototype.initBinding = function (variable, bindSource, bindTarget) {
        processBinding(variable, variable._context, bindSource, bindTarget);
    };
    BaseVariableManager.prototype.notifyInflight = function (variable, status, data) {
        appManager.notify('toggle-variable-state', {
            variable: variable,
            active: status,
            data: data
        });
    };
    /**
     * This method makes the final angular http call that returns an observable.
     * We attach this observable to variable to cancel a network call
     * @param requestParams
     * @param variable
     * @param dbOperation
     */
    BaseVariableManager.prototype.httpCall = function (requestParams, variable, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            variable._observable = httpService.sendCallAsObservable(requestParams, params).subscribe(function (response) {
                if (response && response.type) {
                    resolve(response);
                }
            }, function (err) {
                if (httpService.isPlatformSessionTimeout(err)) {
                    // send the notification manually to hide any context spinners on page.
                    // [TODO]: any spinners on widget listening on this variable will also go off. Need to see an approach to sovle that.
                    _this.notifyInflight(variable, false, err);
                    err._401Subscriber.asObservable().subscribe(function (response) { return resolve(response); }, function (e) { return reject(e); });
                }
                else {
                    reject(err);
                }
            });
        });
    };
    /**
     * This method prepares the options parameter for variable callbacks.
     * @param xhrObj, The xhrObj to be passed
     * @param moreOptions, any other info to be passed in the options param
     */
    BaseVariableManager.prototype.prepareCallbackOptions = function (xhrObj, moreOptions) {
        var options = {};
        options['xhrObj'] = xhrObj;
        if (moreOptions) {
            _.extend(options, moreOptions);
        }
        return options;
    };
    return BaseVariableManager;
}());
export { BaseVariableManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS12YXJpYWJsZS5tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbIm1hbmFnZXIvdmFyaWFibGUvYmFzZS12YXJpYWJsZS5tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDbEYsT0FBTyxFQUFFLFVBQVUsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBS2xFO0lBQUE7SUF1REEsQ0FBQztJQXJERyx5Q0FBVyxHQUFYLFVBQVksUUFBUSxFQUFFLFVBQVcsRUFBRSxVQUFXO1FBQzFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVELDRDQUFjLEdBQWQsVUFBZSxRQUFRLEVBQUUsTUFBZSxFQUFFLElBQVU7UUFDaEQsVUFBVSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRTtZQUN2QyxRQUFRLEVBQUUsUUFBUTtZQUNsQixNQUFNLEVBQUUsTUFBTTtZQUNkLElBQUksRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILHNDQUFRLEdBQVIsVUFBUyxhQUFhLEVBQUUsUUFBUSxFQUFFLE1BQVk7UUFBOUMsaUJBbUJDO1FBbEJHLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtZQUMvQixRQUFRLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQUMsUUFBYTtnQkFDbkcsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLElBQUksRUFBRTtvQkFDM0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNyQjtZQUNMLENBQUMsRUFBRSxVQUFDLEdBQVE7Z0JBQ1IsSUFBSSxXQUFXLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQzNDLHVFQUF1RTtvQkFDdkUscUhBQXFIO29CQUNySCxLQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQzFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUN2QyxVQUFBLFFBQVEsSUFBSSxPQUFBLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBakIsQ0FBaUIsRUFDN0IsVUFBQSxDQUFDLElBQUksT0FBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQVQsQ0FBUyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUNILE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDZjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILG9EQUFzQixHQUF0QixVQUF1QixNQUFXLEVBQUUsV0FBa0I7UUFDbEQsSUFBSSxPQUFPLEdBQW9CLEVBQUUsQ0FBQztRQUNsQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQzNCLElBQUksV0FBVyxFQUFFO1lBQ2IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDbEM7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBQ0wsMEJBQUM7QUFBRCxDQUFDLEFBdkRELElBdURDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaHR0cFNlcnZpY2UsIHByb2Nlc3NCaW5kaW5nIH0gZnJvbSAnLi4vLi4vdXRpbC92YXJpYWJsZS92YXJpYWJsZXMudXRpbHMnO1xuaW1wb3J0IHsgYXBwTWFuYWdlcn0gZnJvbSAnLi8uLi8uLi91dGlsL3ZhcmlhYmxlL3ZhcmlhYmxlcy51dGlscyc7XG5pbXBvcnQgeyBBZHZhbmNlZE9wdGlvbnMgfSBmcm9tICcuLi8uLi9hZHZhbmNlZC1vcHRpb25zJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZVZhcmlhYmxlTWFuYWdlciB7XG5cbiAgICBpbml0QmluZGluZyh2YXJpYWJsZSwgYmluZFNvdXJjZT8sIGJpbmRUYXJnZXQ/KSB7XG4gICAgICAgIHByb2Nlc3NCaW5kaW5nKHZhcmlhYmxlLCB2YXJpYWJsZS5fY29udGV4dCwgYmluZFNvdXJjZSwgYmluZFRhcmdldCk7XG4gICAgfVxuXG4gICAgbm90aWZ5SW5mbGlnaHQodmFyaWFibGUsIHN0YXR1czogYm9vbGVhbiwgZGF0YT86IGFueSkge1xuICAgICAgICBhcHBNYW5hZ2VyLm5vdGlmeSgndG9nZ2xlLXZhcmlhYmxlLXN0YXRlJywge1xuICAgICAgICAgICAgdmFyaWFibGU6IHZhcmlhYmxlLFxuICAgICAgICAgICAgYWN0aXZlOiBzdGF0dXMsXG4gICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIG1ha2VzIHRoZSBmaW5hbCBhbmd1bGFyIGh0dHAgY2FsbCB0aGF0IHJldHVybnMgYW4gb2JzZXJ2YWJsZS5cbiAgICAgKiBXZSBhdHRhY2ggdGhpcyBvYnNlcnZhYmxlIHRvIHZhcmlhYmxlIHRvIGNhbmNlbCBhIG5ldHdvcmsgY2FsbFxuICAgICAqIEBwYXJhbSByZXF1ZXN0UGFyYW1zXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIGRiT3BlcmF0aW9uXG4gICAgICovXG4gICAgaHR0cENhbGwocmVxdWVzdFBhcmFtcywgdmFyaWFibGUsIHBhcmFtcz86IGFueSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyaWFibGUuX29ic2VydmFibGUgPSBodHRwU2VydmljZS5zZW5kQ2FsbEFzT2JzZXJ2YWJsZShyZXF1ZXN0UGFyYW1zLCBwYXJhbXMpLnN1YnNjcmliZSgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIChlcnI6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChodHRwU2VydmljZS5pc1BsYXRmb3JtU2Vzc2lvblRpbWVvdXQoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBzZW5kIHRoZSBub3RpZmljYXRpb24gbWFudWFsbHkgdG8gaGlkZSBhbnkgY29udGV4dCBzcGlubmVycyBvbiBwYWdlLlxuICAgICAgICAgICAgICAgICAgICAvLyBbVE9ET106IGFueSBzcGlubmVycyBvbiB3aWRnZXQgbGlzdGVuaW5nIG9uIHRoaXMgdmFyaWFibGUgd2lsbCBhbHNvIGdvIG9mZi4gTmVlZCB0byBzZWUgYW4gYXBwcm9hY2ggdG8gc292bGUgdGhhdC5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RpZnlJbmZsaWdodCh2YXJpYWJsZSwgZmFsc2UsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIGVyci5fNDAxU3Vic2NyaWJlci5hc09ic2VydmFibGUoKS5zdWJzY3JpYmUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9PiByZXNvbHZlKHJlc3BvbnNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGUgPT4gcmVqZWN0KGUpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcHJlcGFyZXMgdGhlIG9wdGlvbnMgcGFyYW1ldGVyIGZvciB2YXJpYWJsZSBjYWxsYmFja3MuXG4gICAgICogQHBhcmFtIHhock9iaiwgVGhlIHhock9iaiB0byBiZSBwYXNzZWRcbiAgICAgKiBAcGFyYW0gbW9yZU9wdGlvbnMsIGFueSBvdGhlciBpbmZvIHRvIGJlIHBhc3NlZCBpbiB0aGUgb3B0aW9ucyBwYXJhbVxuICAgICAqL1xuICAgIHByZXBhcmVDYWxsYmFja09wdGlvbnMoeGhyT2JqOiBhbnksIG1vcmVPcHRpb25zPyA6IGFueSk6IEFkdmFuY2VkT3B0aW9ucyB7XG4gICAgICAgIGxldCBvcHRpb25zOiBBZHZhbmNlZE9wdGlvbnMgPSB7fTtcbiAgICAgICAgb3B0aW9uc1sneGhyT2JqJ10gPSB4aHJPYmo7XG4gICAgICAgIGlmIChtb3JlT3B0aW9ucykge1xuICAgICAgICAgICAgXy5leHRlbmQob3B0aW9ucywgbW9yZU9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgIH1cbn1cbiJdfQ==