/**
 * Proxy Provider - Creates a JS proxy for the given object
 */
import { propNameCSSKeyMap } from './styler';
import { globalPropertyChangeHandler } from './property-change-handler';
/**
 *  proxy handler for the components
 */
export const proxyHandler = {
    set: (target, key, value) => {
        globalPropertyChangeHandler(target, key, value);
        return true;
    },
    get: (target, key) => {
        const v = target[key];
        if (_.isFunction(v)) { // bind the proper context for the methods
            return v.bind(target);
        }
        return v;
    }
};
const $RAF = window.requestAnimationFrame;
const $RAFQueue = [];
const invokeLater = fn => {
    if (!$RAFQueue.length) {
        $RAF(() => {
            $RAFQueue.forEach(f => f());
            $RAFQueue.length = 0;
        });
    }
    $RAFQueue.push(fn);
};
const ɵ0 = invokeLater;
export class WidgetProxyProvider {
    static create(instance, widgetSubType, propsByWidgetSubType) {
        // If the native Proxy is supported
        if (window.Proxy) {
            return new Proxy(instance, proxyHandler);
        }
        else {
            // If the native Proxy is not supported, IE11
            const widget = Object.create(instance);
            // bind proper context for the methods
            invokeLater(() => {
                for (const key in instance) {
                    if (_.isFunction(instance[key]) && key !== 'constructor' && key !== 'super' && !_.startsWith(key, 'ng')) {
                        instance[key] = instance[key].bind(instance);
                    }
                }
            });
            // define setters and getters for styles
            Object.keys(propNameCSSKeyMap)
                .forEach(key => {
                Object.defineProperty(widget, key, {
                    get: () => instance[key],
                    set: nv => globalPropertyChangeHandler(instance, key, nv)
                });
            });
            // define the setters and getters for Props
            if (propsByWidgetSubType) {
                propsByWidgetSubType
                    .forEach((value, key) => {
                    Object.defineProperty(widget, key, {
                        get: () => instance[key],
                        set: nv => globalPropertyChangeHandler(instance, key, nv)
                    });
                });
            }
            return widget;
        }
    }
}
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0LXByb3h5LXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2ZyYW1ld29yay93aWRnZXQtcHJveHktcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFDSCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDN0MsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFLeEU7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUc7SUFDeEIsR0FBRyxFQUFFLENBQUMsTUFBcUIsRUFBRSxHQUFXLEVBQUUsS0FBVSxFQUFXLEVBQUU7UUFDN0QsMkJBQTJCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsR0FBRyxFQUFFLENBQUMsTUFBcUIsRUFBRSxHQUFXLEVBQU8sRUFBRTtRQUM3QyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsMENBQTBDO1lBQzdELE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN6QjtRQUNELE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztDQUNKLENBQUM7QUFFRixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUM7QUFDMUMsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBRXJCLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxFQUFFO0lBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO1FBQ25CLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDTixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM1QixTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztLQUNOO0lBQ0QsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN2QixDQUFDLENBQUM7O0FBRUYsTUFBTSxPQUFPLG1CQUFtQjtJQUNyQixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQXVCLEVBQUUsYUFBcUIsRUFBRSxvQkFBc0M7UUFDdkcsbUNBQW1DO1FBQ25DLElBQUssTUFBYyxDQUFDLEtBQUssRUFBRTtZQUN2QixPQUFPLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztTQUM1QzthQUFNO1lBRUgsNkNBQTZDO1lBQzdDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdkMsc0NBQXNDO1lBQ3RDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2IsS0FBSyxNQUFNLEdBQUcsSUFBSSxRQUFRLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEtBQUssYUFBYSxJQUFJLEdBQUcsS0FBSyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRTt3QkFDckcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQ2hEO2lCQUNKO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCx3Q0FBd0M7WUFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztpQkFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNYLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDL0IsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7b0JBQ3hCLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO2lCQUM1RCxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVQLDJDQUEyQztZQUMzQyxJQUFJLG9CQUFvQixFQUFFO2dCQUN0QixvQkFBb0I7cUJBQ2YsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO29CQUNwQixNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7d0JBQy9CLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO3dCQUN4QixHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztxQkFDNUQsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2FBQ1Y7WUFFRCxPQUFPLE1BQU0sQ0FBQztTQUNqQjtJQUNMLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUHJveHkgUHJvdmlkZXIgLSBDcmVhdGVzIGEgSlMgcHJveHkgZm9yIHRoZSBnaXZlbiBvYmplY3RcbiAqL1xuaW1wb3J0IHsgcHJvcE5hbWVDU1NLZXlNYXAgfSBmcm9tICcuL3N0eWxlcic7XG5pbXBvcnQgeyBnbG9iYWxQcm9wZXJ0eUNoYW5nZUhhbmRsZXIgfSBmcm9tICcuL3Byb3BlcnR5LWNoYW5nZS1oYW5kbGVyJztcbmltcG9ydCB7IEJhc2VDb21wb25lbnQgfSBmcm9tICcuLi9jb21tb24vYmFzZS9iYXNlLmNvbXBvbmVudCc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuLyoqXG4gKiAgcHJveHkgaGFuZGxlciBmb3IgdGhlIGNvbXBvbmVudHNcbiAqL1xuZXhwb3J0IGNvbnN0IHByb3h5SGFuZGxlciA9IHtcbiAgICBzZXQ6ICh0YXJnZXQ6IEJhc2VDb21wb25lbnQsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGdsb2JhbFByb3BlcnR5Q2hhbmdlSGFuZGxlcih0YXJnZXQsIGtleSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGdldDogKHRhcmdldDogQmFzZUNvbXBvbmVudCwga2V5OiBzdHJpbmcpOiBhbnkgPT4ge1xuICAgICAgICBjb25zdCB2ID0gdGFyZ2V0W2tleV07XG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24odikpIHsgLy8gYmluZCB0aGUgcHJvcGVyIGNvbnRleHQgZm9yIHRoZSBtZXRob2RzXG4gICAgICAgICAgICByZXR1cm4gdi5iaW5kKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxufTtcblxuY29uc3QgJFJBRiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5jb25zdCAkUkFGUXVldWUgPSBbXTtcblxuY29uc3QgaW52b2tlTGF0ZXIgPSBmbiA9PiB7XG4gICAgaWYgKCEkUkFGUXVldWUubGVuZ3RoKSB7XG4gICAgICAgICRSQUYoKCkgPT4ge1xuICAgICAgICAgICAgJFJBRlF1ZXVlLmZvckVhY2goZiA9PiBmKCkpO1xuICAgICAgICAgICAgJFJBRlF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAkUkFGUXVldWUucHVzaChmbik7XG59O1xuXG5leHBvcnQgY2xhc3MgV2lkZ2V0UHJveHlQcm92aWRlciB7XG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGUoaW5zdGFuY2U6IEJhc2VDb21wb25lbnQsIHdpZGdldFN1YlR5cGU6IHN0cmluZywgcHJvcHNCeVdpZGdldFN1YlR5cGU6IE1hcDxzdHJpbmcsIGFueT4pIHtcbiAgICAgICAgLy8gSWYgdGhlIG5hdGl2ZSBQcm94eSBpcyBzdXBwb3J0ZWRcbiAgICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KS5Qcm94eSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm94eShpbnN0YW5jZSwgcHJveHlIYW5kbGVyKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gSWYgdGhlIG5hdGl2ZSBQcm94eSBpcyBub3Qgc3VwcG9ydGVkLCBJRTExXG4gICAgICAgICAgICBjb25zdCB3aWRnZXQgPSBPYmplY3QuY3JlYXRlKGluc3RhbmNlKTtcblxuICAgICAgICAgICAgLy8gYmluZCBwcm9wZXIgY29udGV4dCBmb3IgdGhlIG1ldGhvZHNcbiAgICAgICAgICAgIGludm9rZUxhdGVyKCgpID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBpbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGluc3RhbmNlW2tleV0pICYmIGtleSAhPT0gJ2NvbnN0cnVjdG9yJyAmJiBrZXkgIT09ICdzdXBlcicgJiYgIV8uc3RhcnRzV2l0aChrZXksICduZycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtrZXldID0gaW5zdGFuY2Vba2V5XS5iaW5kKGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBkZWZpbmUgc2V0dGVycyBhbmQgZ2V0dGVycyBmb3Igc3R5bGVzXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhwcm9wTmFtZUNTU0tleU1hcClcbiAgICAgICAgICAgICAgICAuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2lkZ2V0LCBrZXksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldDogKCkgPT4gaW5zdGFuY2Vba2V5XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldDogbnYgPT4gZ2xvYmFsUHJvcGVydHlDaGFuZ2VIYW5kbGVyKGluc3RhbmNlLCBrZXksIG52KVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZGVmaW5lIHRoZSBzZXR0ZXJzIGFuZCBnZXR0ZXJzIGZvciBQcm9wc1xuICAgICAgICAgICAgaWYgKHByb3BzQnlXaWRnZXRTdWJUeXBlKSB7XG4gICAgICAgICAgICAgICAgcHJvcHNCeVdpZGdldFN1YlR5cGVcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aWRnZXQsIGtleSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldDogKCkgPT4gaW5zdGFuY2Vba2V5XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXQ6IG52ID0+IGdsb2JhbFByb3BlcnR5Q2hhbmdlSGFuZGxlcihpbnN0YW5jZSwga2V5LCBudilcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHdpZGdldDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==