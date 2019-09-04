import { appManager, processBinding } from '../../util/variable/variables.utils';
var BaseActionManager = /** @class */ (function () {
    function BaseActionManager() {
    }
    BaseActionManager.prototype.initBinding = function (variable, bindSource, bindTarget) {
        processBinding(variable, variable._context, bindSource, bindTarget);
    };
    BaseActionManager.prototype.notifyInflight = function (variable, status, data) {
        appManager.notify('toggle-variable-state', {
            variable: variable,
            active: status,
            data: data
        });
    };
    return BaseActionManager;
}());
export { BaseActionManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1hY3Rpb24ubWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJtYW5hZ2VyL2FjdGlvbi9iYXNlLWFjdGlvbi5tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFakY7SUFBQTtJQVlBLENBQUM7SUFYRyx1Q0FBVyxHQUFYLFVBQVksUUFBUSxFQUFFLFVBQVcsRUFBRSxVQUFXO1FBQzFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVELDBDQUFjLEdBQWQsVUFBZSxRQUFRLEVBQUUsTUFBZSxFQUFFLElBQVU7UUFDaEQsVUFBVSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRTtZQUN2QyxRQUFRLEVBQUUsUUFBUTtZQUNsQixNQUFNLEVBQUUsTUFBTTtZQUNkLElBQUksRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNMLHdCQUFDO0FBQUQsQ0FBQyxBQVpELElBWUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhcHBNYW5hZ2VyLCBwcm9jZXNzQmluZGluZyB9IGZyb20gJy4uLy4uL3V0aWwvdmFyaWFibGUvdmFyaWFibGVzLnV0aWxzJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VBY3Rpb25NYW5hZ2VyIHtcbiAgICBpbml0QmluZGluZyh2YXJpYWJsZSwgYmluZFNvdXJjZT8sIGJpbmRUYXJnZXQ/KSB7XG4gICAgICAgIHByb2Nlc3NCaW5kaW5nKHZhcmlhYmxlLCB2YXJpYWJsZS5fY29udGV4dCwgYmluZFNvdXJjZSwgYmluZFRhcmdldCk7XG4gICAgfVxuXG4gICAgbm90aWZ5SW5mbGlnaHQodmFyaWFibGUsIHN0YXR1czogYm9vbGVhbiwgZGF0YT86IGFueSkge1xuICAgICAgICBhcHBNYW5hZ2VyLm5vdGlmeSgndG9nZ2xlLXZhcmlhYmxlLXN0YXRlJywge1xuICAgICAgICAgICAgdmFyaWFibGU6IHZhcmlhYmxlLFxuICAgICAgICAgICAgYWN0aXZlOiBzdGF0dXMsXG4gICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==