import * as tslib_1 from "tslib";
import * as NVUtils from '../../util/action/navigation-action.utils';
import { BaseActionManager } from './base-action.manager';
var NavigationActionManager = /** @class */ (function (_super) {
    tslib_1.__extends(NavigationActionManager, _super);
    function NavigationActionManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NavigationActionManager.prototype.invoke = function (variable, options) {
        NVUtils.navigate(variable, options);
    };
    return NavigationActionManager;
}(BaseActionManager));
export { NavigationActionManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdGlvbi1hY3Rpb24ubWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJtYW5hZ2VyL2FjdGlvbi9uYXZpZ2F0aW9uLWFjdGlvbi5tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssT0FBTyxNQUFNLDJDQUEyQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRTFEO0lBQTZDLG1EQUFpQjtJQUE5RDs7SUFLQSxDQUFDO0lBSEcsd0NBQU0sR0FBTixVQUFPLFFBQVEsRUFBRSxPQUFPO1FBQ3BCLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFDTCw4QkFBQztBQUFELENBQUMsQUFMRCxDQUE2QyxpQkFBaUIsR0FLN0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBOVlV0aWxzIGZyb20gJy4uLy4uL3V0aWwvYWN0aW9uL25hdmlnYXRpb24tYWN0aW9uLnV0aWxzJztcbmltcG9ydCB7IEJhc2VBY3Rpb25NYW5hZ2VyIH0gZnJvbSAnLi9iYXNlLWFjdGlvbi5tYW5hZ2VyJztcblxuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25BY3Rpb25NYW5hZ2VyIGV4dGVuZHMgQmFzZUFjdGlvbk1hbmFnZXIge1xuXG4gICAgaW52b2tlKHZhcmlhYmxlLCBvcHRpb25zKSB7XG4gICAgICAgIE5WVXRpbHMubmF2aWdhdGUodmFyaWFibGUsIG9wdGlvbnMpO1xuICAgIH1cbn1cbiJdfQ==