import * as tslib_1 from "tslib";
import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
var getManager = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.TIMER);
};
var ɵ0 = getManager;
var TimerAction = /** @class */ (function (_super) {
    tslib_1.__extends(TimerAction, _super);
    function TimerAction(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    // Backward compatible method
    TimerAction.prototype.fire = function (options, success, error) {
        return getManager().trigger(this, options, success, error);
    };
    TimerAction.prototype.invoke = function (options, success, error) {
        return this.fire(options, success, error);
    };
    TimerAction.prototype.cancel = function () {
        return getManager().cancel(this);
    };
    return TimerAction;
}(BaseAction));
export { TimerAction };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXItYWN0aW9uLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbIm1vZGVsL2FjdGlvbi90aW1lci1hY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUN6RSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUVoRixJQUFPLFVBQVUsR0FBRztJQUNoQixPQUFPLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekUsQ0FBQyxDQUFDOztBQUVGO0lBQWlDLHVDQUFVO0lBQ3ZDLHFCQUFZLFFBQWE7UUFBekIsWUFDSSxpQkFBTyxTQUVWO1FBREcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7O0lBQ2xDLENBQUM7SUFFRCw2QkFBNkI7SUFDN0IsMEJBQUksR0FBSixVQUFLLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSztRQUN4QixPQUFPLFVBQVUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsNEJBQU0sR0FBTixVQUFPLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSztRQUMxQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsNEJBQU0sR0FBTjtRQUNJLE9BQU8sVUFBVSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFDTCxrQkFBQztBQUFELENBQUMsQUFsQkQsQ0FBaUMsVUFBVSxHQWtCMUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCYXNlQWN0aW9uIH0gZnJvbSAnLi4vYmFzZS1hY3Rpb24nO1xuaW1wb3J0IHsgVkFSSUFCTEVfQ09OU1RBTlRTIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzL3ZhcmlhYmxlcy5jb25zdGFudHMnO1xuaW1wb3J0IHsgVmFyaWFibGVNYW5hZ2VyRmFjdG9yeSB9IGZyb20gJy4uLy4uL2ZhY3RvcnkvdmFyaWFibGUtbWFuYWdlci5mYWN0b3J5JztcblxuY29uc3QgIGdldE1hbmFnZXIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIFZhcmlhYmxlTWFuYWdlckZhY3RvcnkuZ2V0KFZBUklBQkxFX0NPTlNUQU5UUy5DQVRFR09SWS5USU1FUik7XG59O1xuXG5leHBvcnQgY2xhc3MgVGltZXJBY3Rpb24gZXh0ZW5kcyBCYXNlQWN0aW9uIHtcbiAgICBjb25zdHJ1Y3Rvcih2YXJpYWJsZTogYW55KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgdmFyaWFibGUpO1xuICAgIH1cblxuICAgIC8vIEJhY2t3YXJkIGNvbXBhdGlibGUgbWV0aG9kXG4gICAgZmlyZShvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICByZXR1cm4gZ2V0TWFuYWdlcigpLnRyaWdnZXIodGhpcywgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpO1xuICAgIH1cblxuICAgIGludm9rZShvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5maXJlKG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICB9XG5cbiAgICBjYW5jZWwoKSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkuY2FuY2VsKHRoaXMpO1xuICAgIH1cbn1cbiJdfQ==