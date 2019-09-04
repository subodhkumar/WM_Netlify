import { httpService, processBinding } from '../../util/variable/variables.utils';
import { appManager } from './../../util/variable/variables.utils';
export class BaseVariableManager {
    initBinding(variable, bindSource, bindTarget) {
        processBinding(variable, variable._context, bindSource, bindTarget);
    }
    notifyInflight(variable, status, data) {
        appManager.notify('toggle-variable-state', {
            variable: variable,
            active: status,
            data: data
        });
    }
    /**
     * This method makes the final angular http call that returns an observable.
     * We attach this observable to variable to cancel a network call
     * @param requestParams
     * @param variable
     * @param dbOperation
     */
    httpCall(requestParams, variable, params) {
        return new Promise((resolve, reject) => {
            variable._observable = httpService.sendCallAsObservable(requestParams, params).subscribe((response) => {
                if (response && response.type) {
                    resolve(response);
                }
            }, (err) => {
                if (httpService.isPlatformSessionTimeout(err)) {
                    // send the notification manually to hide any context spinners on page.
                    // [TODO]: any spinners on widget listening on this variable will also go off. Need to see an approach to sovle that.
                    this.notifyInflight(variable, false, err);
                    err._401Subscriber.asObservable().subscribe(response => resolve(response), e => reject(e));
                }
                else {
                    reject(err);
                }
            });
        });
    }
    /**
     * This method prepares the options parameter for variable callbacks.
     * @param xhrObj, The xhrObj to be passed
     * @param moreOptions, any other info to be passed in the options param
     */
    prepareCallbackOptions(xhrObj, moreOptions) {
        let options = {};
        options['xhrObj'] = xhrObj;
        if (moreOptions) {
            _.extend(options, moreOptions);
        }
        return options;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS12YXJpYWJsZS5tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbIm1hbmFnZXIvdmFyaWFibGUvYmFzZS12YXJpYWJsZS5tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDbEYsT0FBTyxFQUFFLFVBQVUsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBS2xFLE1BQU0sT0FBZ0IsbUJBQW1CO0lBRXJDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsVUFBVyxFQUFFLFVBQVc7UUFDMUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRUQsY0FBYyxDQUFDLFFBQVEsRUFBRSxNQUFlLEVBQUUsSUFBVTtRQUNoRCxVQUFVLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFO1lBQ3ZDLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLE1BQU0sRUFBRSxNQUFNO1lBQ2QsSUFBSSxFQUFFLElBQUk7U0FDYixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsUUFBUSxDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsTUFBWTtRQUMxQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLFFBQVEsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFhLEVBQUUsRUFBRTtnQkFDdkcsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLElBQUksRUFBRTtvQkFDM0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNyQjtZQUNMLENBQUMsRUFBRSxDQUFDLEdBQVEsRUFBRSxFQUFFO2dCQUNaLElBQUksV0FBVyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUMzQyx1RUFBdUU7b0JBQ3ZFLHFIQUFxSDtvQkFDckgsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUMxQyxHQUFHLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FDdkMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQzdCLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUNILE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDZjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILHNCQUFzQixDQUFDLE1BQVcsRUFBRSxXQUFrQjtRQUNsRCxJQUFJLE9BQU8sR0FBb0IsRUFBRSxDQUFDO1FBQ2xDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUM7UUFDM0IsSUFBSSxXQUFXLEVBQUU7WUFDYixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztTQUNsQztRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGh0dHBTZXJ2aWNlLCBwcm9jZXNzQmluZGluZyB9IGZyb20gJy4uLy4uL3V0aWwvdmFyaWFibGUvdmFyaWFibGVzLnV0aWxzJztcbmltcG9ydCB7IGFwcE1hbmFnZXJ9IGZyb20gJy4vLi4vLi4vdXRpbC92YXJpYWJsZS92YXJpYWJsZXMudXRpbHMnO1xuaW1wb3J0IHsgQWR2YW5jZWRPcHRpb25zIH0gZnJvbSAnLi4vLi4vYWR2YW5jZWQtb3B0aW9ucyc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VWYXJpYWJsZU1hbmFnZXIge1xuXG4gICAgaW5pdEJpbmRpbmcodmFyaWFibGUsIGJpbmRTb3VyY2U/LCBiaW5kVGFyZ2V0Pykge1xuICAgICAgICBwcm9jZXNzQmluZGluZyh2YXJpYWJsZSwgdmFyaWFibGUuX2NvbnRleHQsIGJpbmRTb3VyY2UsIGJpbmRUYXJnZXQpO1xuICAgIH1cblxuICAgIG5vdGlmeUluZmxpZ2h0KHZhcmlhYmxlLCBzdGF0dXM6IGJvb2xlYW4sIGRhdGE/OiBhbnkpIHtcbiAgICAgICAgYXBwTWFuYWdlci5ub3RpZnkoJ3RvZ2dsZS12YXJpYWJsZS1zdGF0ZScsIHtcbiAgICAgICAgICAgIHZhcmlhYmxlOiB2YXJpYWJsZSxcbiAgICAgICAgICAgIGFjdGl2ZTogc3RhdHVzLFxuICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBtYWtlcyB0aGUgZmluYWwgYW5ndWxhciBodHRwIGNhbGwgdGhhdCByZXR1cm5zIGFuIG9ic2VydmFibGUuXG4gICAgICogV2UgYXR0YWNoIHRoaXMgb2JzZXJ2YWJsZSB0byB2YXJpYWJsZSB0byBjYW5jZWwgYSBuZXR3b3JrIGNhbGxcbiAgICAgKiBAcGFyYW0gcmVxdWVzdFBhcmFtc1xuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBkYk9wZXJhdGlvblxuICAgICAqL1xuICAgIGh0dHBDYWxsKHJlcXVlc3RQYXJhbXMsIHZhcmlhYmxlLCBwYXJhbXM/OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZhcmlhYmxlLl9vYnNlcnZhYmxlID0gaHR0cFNlcnZpY2Uuc2VuZENhbGxBc09ic2VydmFibGUocmVxdWVzdFBhcmFtcywgcGFyYW1zKS5zdWJzY3JpYmUoKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UudHlwZSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAoZXJyOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaHR0cFNlcnZpY2UuaXNQbGF0Zm9ybVNlc3Npb25UaW1lb3V0KGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCB0aGUgbm90aWZpY2F0aW9uIG1hbnVhbGx5IHRvIGhpZGUgYW55IGNvbnRleHQgc3Bpbm5lcnMgb24gcGFnZS5cbiAgICAgICAgICAgICAgICAgICAgLy8gW1RPRE9dOiBhbnkgc3Bpbm5lcnMgb24gd2lkZ2V0IGxpc3RlbmluZyBvbiB0aGlzIHZhcmlhYmxlIHdpbGwgYWxzbyBnbyBvZmYuIE5lZWQgdG8gc2VlIGFuIGFwcHJvYWNoIHRvIHNvdmxlIHRoYXQuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5SW5mbGlnaHQodmFyaWFibGUsIGZhbHNlLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICBlcnIuXzQwMVN1YnNjcmliZXIuYXNPYnNlcnZhYmxlKCkuc3Vic2NyaWJlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPT4gcmVzb2x2ZShyZXNwb25zZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBlID0+IHJlamVjdChlKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHByZXBhcmVzIHRoZSBvcHRpb25zIHBhcmFtZXRlciBmb3IgdmFyaWFibGUgY2FsbGJhY2tzLlxuICAgICAqIEBwYXJhbSB4aHJPYmosIFRoZSB4aHJPYmogdG8gYmUgcGFzc2VkXG4gICAgICogQHBhcmFtIG1vcmVPcHRpb25zLCBhbnkgb3RoZXIgaW5mbyB0byBiZSBwYXNzZWQgaW4gdGhlIG9wdGlvbnMgcGFyYW1cbiAgICAgKi9cbiAgICBwcmVwYXJlQ2FsbGJhY2tPcHRpb25zKHhock9iajogYW55LCBtb3JlT3B0aW9ucz8gOiBhbnkpOiBBZHZhbmNlZE9wdGlvbnMge1xuICAgICAgICBsZXQgb3B0aW9uczogQWR2YW5jZWRPcHRpb25zID0ge307XG4gICAgICAgIG9wdGlvbnNbJ3hock9iaiddID0geGhyT2JqO1xuICAgICAgICBpZiAobW9yZU9wdGlvbnMpIHtcbiAgICAgICAgICAgIF8uZXh0ZW5kKG9wdGlvbnMsIG1vcmVPcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG59XG4iXX0=