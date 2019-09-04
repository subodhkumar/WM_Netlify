/**
 * Proxy Provider - Creates a JS proxy for the given object
 */
import { propNameCSSKeyMap } from './styler';
import { globalPropertyChangeHandler } from './property-change-handler';
/**
 *  proxy handler for the components
 */
export var proxyHandler = {
    set: function (target, key, value) {
        globalPropertyChangeHandler(target, key, value);
        return true;
    },
    get: function (target, key) {
        var v = target[key];
        if (_.isFunction(v)) { // bind the proper context for the methods
            return v.bind(target);
        }
        return v;
    }
};
var $RAF = window.requestAnimationFrame;
var $RAFQueue = [];
var invokeLater = function (fn) {
    if (!$RAFQueue.length) {
        $RAF(function () {
            $RAFQueue.forEach(function (f) { return f(); });
            $RAFQueue.length = 0;
        });
    }
    $RAFQueue.push(fn);
};
var ɵ0 = invokeLater;
var WidgetProxyProvider = /** @class */ (function () {
    function WidgetProxyProvider() {
    }
    WidgetProxyProvider.create = function (instance, widgetSubType, propsByWidgetSubType) {
        // If the native Proxy is supported
        if (window.Proxy) {
            return new Proxy(instance, proxyHandler);
        }
        else {
            // If the native Proxy is not supported, IE11
            var widget_1 = Object.create(instance);
            // bind proper context for the methods
            invokeLater(function () {
                for (var key in instance) {
                    if (_.isFunction(instance[key]) && key !== 'constructor' && key !== 'super' && !_.startsWith(key, 'ng')) {
                        instance[key] = instance[key].bind(instance);
                    }
                }
            });
            // define setters and getters for styles
            Object.keys(propNameCSSKeyMap)
                .forEach(function (key) {
                Object.defineProperty(widget_1, key, {
                    get: function () { return instance[key]; },
                    set: function (nv) { return globalPropertyChangeHandler(instance, key, nv); }
                });
            });
            // define the setters and getters for Props
            if (propsByWidgetSubType) {
                propsByWidgetSubType
                    .forEach(function (value, key) {
                    Object.defineProperty(widget_1, key, {
                        get: function () { return instance[key]; },
                        set: function (nv) { return globalPropertyChangeHandler(instance, key, nv); }
                    });
                });
            }
            return widget_1;
        }
    };
    return WidgetProxyProvider;
}());
export { WidgetProxyProvider };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0LXByb3h5LXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2ZyYW1ld29yay93aWRnZXQtcHJveHktcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFDSCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDN0MsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFLeEU7O0dBRUc7QUFDSCxNQUFNLENBQUMsSUFBTSxZQUFZLEdBQUc7SUFDeEIsR0FBRyxFQUFFLFVBQUMsTUFBcUIsRUFBRSxHQUFXLEVBQUUsS0FBVTtRQUNoRCwyQkFBMkIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxHQUFHLEVBQUUsVUFBQyxNQUFxQixFQUFFLEdBQVc7UUFDcEMsSUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLDBDQUEwQztZQUM3RCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDekI7UUFDRCxPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7Q0FDSixDQUFDO0FBRUYsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDO0FBQzFDLElBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUVyQixJQUFNLFdBQVcsR0FBRyxVQUFBLEVBQUU7SUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7UUFDbkIsSUFBSSxDQUFDO1lBQ0QsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsRUFBRSxFQUFILENBQUcsQ0FBQyxDQUFDO1lBQzVCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO0tBQ047SUFDRCxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLENBQUMsQ0FBQzs7QUFFRjtJQUFBO0lBMENBLENBQUM7SUF6Q2lCLDBCQUFNLEdBQXBCLFVBQXFCLFFBQXVCLEVBQUUsYUFBcUIsRUFBRSxvQkFBc0M7UUFDdkcsbUNBQW1DO1FBQ25DLElBQUssTUFBYyxDQUFDLEtBQUssRUFBRTtZQUN2QixPQUFPLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztTQUM1QzthQUFNO1lBRUgsNkNBQTZDO1lBQzdDLElBQU0sUUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdkMsc0NBQXNDO1lBQ3RDLFdBQVcsQ0FBQztnQkFDUixLQUFLLElBQU0sR0FBRyxJQUFJLFFBQVEsRUFBRTtvQkFDeEIsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsS0FBSyxhQUFhLElBQUksR0FBRyxLQUFLLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFO3dCQUNyRyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztxQkFDaEQ7aUJBQ0o7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILHdDQUF3QztZQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO2lCQUN6QixPQUFPLENBQUMsVUFBQSxHQUFHO2dCQUNSLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDL0IsR0FBRyxFQUFFLGNBQU0sT0FBQSxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQWIsQ0FBYTtvQkFDeEIsR0FBRyxFQUFFLFVBQUEsRUFBRSxJQUFJLE9BQUEsMkJBQTJCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBOUMsQ0FBOEM7aUJBQzVELENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRVAsMkNBQTJDO1lBQzNDLElBQUksb0JBQW9CLEVBQUU7Z0JBQ3RCLG9CQUFvQjtxQkFDZixPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUUsR0FBRztvQkFDaEIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFNLEVBQUUsR0FBRyxFQUFFO3dCQUMvQixHQUFHLEVBQUUsY0FBTSxPQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBYixDQUFhO3dCQUN4QixHQUFHLEVBQUUsVUFBQSxFQUFFLElBQUksT0FBQSwyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUE5QyxDQUE4QztxQkFDNUQsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2FBQ1Y7WUFFRCxPQUFPLFFBQU0sQ0FBQztTQUNqQjtJQUNMLENBQUM7SUFDTCwwQkFBQztBQUFELENBQUMsQUExQ0QsSUEwQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFByb3h5IFByb3ZpZGVyIC0gQ3JlYXRlcyBhIEpTIHByb3h5IGZvciB0aGUgZ2l2ZW4gb2JqZWN0XG4gKi9cbmltcG9ydCB7IHByb3BOYW1lQ1NTS2V5TWFwIH0gZnJvbSAnLi9zdHlsZXInO1xuaW1wb3J0IHsgZ2xvYmFsUHJvcGVydHlDaGFuZ2VIYW5kbGVyIH0gZnJvbSAnLi9wcm9wZXJ0eS1jaGFuZ2UtaGFuZGxlcic7XG5pbXBvcnQgeyBCYXNlQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tbW9uL2Jhc2UvYmFzZS5jb21wb25lbnQnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbi8qKlxuICogIHByb3h5IGhhbmRsZXIgZm9yIHRoZSBjb21wb25lbnRzXG4gKi9cbmV4cG9ydCBjb25zdCBwcm94eUhhbmRsZXIgPSB7XG4gICAgc2V0OiAodGFyZ2V0OiBCYXNlQ29tcG9uZW50LCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICBnbG9iYWxQcm9wZXJ0eUNoYW5nZUhhbmRsZXIodGFyZ2V0LCBrZXksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBnZXQ6ICh0YXJnZXQ6IEJhc2VDb21wb25lbnQsIGtleTogc3RyaW5nKTogYW55ID0+IHtcbiAgICAgICAgY29uc3QgdiA9IHRhcmdldFtrZXldO1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHYpKSB7IC8vIGJpbmQgdGhlIHByb3BlciBjb250ZXh0IGZvciB0aGUgbWV0aG9kc1xuICAgICAgICAgICAgcmV0dXJuIHYuYmluZCh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cbn07XG5cbmNvbnN0ICRSQUYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuY29uc3QgJFJBRlF1ZXVlID0gW107XG5cbmNvbnN0IGludm9rZUxhdGVyID0gZm4gPT4ge1xuICAgIGlmICghJFJBRlF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAkUkFGKCgpID0+IHtcbiAgICAgICAgICAgICRSQUZRdWV1ZS5mb3JFYWNoKGYgPT4gZigpKTtcbiAgICAgICAgICAgICRSQUZRdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgJFJBRlF1ZXVlLnB1c2goZm4pO1xufTtcblxuZXhwb3J0IGNsYXNzIFdpZGdldFByb3h5UHJvdmlkZXIge1xuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGluc3RhbmNlOiBCYXNlQ29tcG9uZW50LCB3aWRnZXRTdWJUeXBlOiBzdHJpbmcsIHByb3BzQnlXaWRnZXRTdWJUeXBlOiBNYXA8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgIC8vIElmIHRoZSBuYXRpdmUgUHJveHkgaXMgc3VwcG9ydGVkXG4gICAgICAgIGlmICgod2luZG93IGFzIGFueSkuUHJveHkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJveHkoaW5zdGFuY2UsIHByb3h5SGFuZGxlcik7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBuYXRpdmUgUHJveHkgaXMgbm90IHN1cHBvcnRlZCwgSUUxMVxuICAgICAgICAgICAgY29uc3Qgd2lkZ2V0ID0gT2JqZWN0LmNyZWF0ZShpbnN0YW5jZSk7XG5cbiAgICAgICAgICAgIC8vIGJpbmQgcHJvcGVyIGNvbnRleHQgZm9yIHRoZSBtZXRob2RzXG4gICAgICAgICAgICBpbnZva2VMYXRlcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gaW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihpbnN0YW5jZVtrZXldKSAmJiBrZXkgIT09ICdjb25zdHJ1Y3RvcicgJiYga2V5ICE9PSAnc3VwZXInICYmICFfLnN0YXJ0c1dpdGgoa2V5LCAnbmcnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Vba2V5XSA9IGluc3RhbmNlW2tleV0uYmluZChpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZGVmaW5lIHNldHRlcnMgYW5kIGdldHRlcnMgZm9yIHN0eWxlc1xuICAgICAgICAgICAgT2JqZWN0LmtleXMocHJvcE5hbWVDU1NLZXlNYXApXG4gICAgICAgICAgICAgICAgLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpZGdldCwga2V5LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXQ6ICgpID0+IGluc3RhbmNlW2tleV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXQ6IG52ID0+IGdsb2JhbFByb3BlcnR5Q2hhbmdlSGFuZGxlcihpbnN0YW5jZSwga2V5LCBudilcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGRlZmluZSB0aGUgc2V0dGVycyBhbmQgZ2V0dGVycyBmb3IgUHJvcHNcbiAgICAgICAgICAgIGlmIChwcm9wc0J5V2lkZ2V0U3ViVHlwZSkge1xuICAgICAgICAgICAgICAgIHByb3BzQnlXaWRnZXRTdWJUeXBlXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2lkZ2V0LCBrZXksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXQ6ICgpID0+IGluc3RhbmNlW2tleV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0OiBudiA9PiBnbG9iYWxQcm9wZXJ0eUNoYW5nZUhhbmRsZXIoaW5zdGFuY2UsIGtleSwgbnYpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB3aWRnZXQ7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=