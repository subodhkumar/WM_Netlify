import * as tslib_1 from "tslib";
import { isDefined } from '@wm/core';
import { BaseActionManager } from './base-action.manager';
import { initiateCallback } from '../../util/variable/variables.utils';
import { CONSTANTS } from '../../constants/variables.constants';
var TimerActionManager = /** @class */ (function (_super) {
    tslib_1.__extends(TimerActionManager, _super);
    function TimerActionManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TimerActionManager.prototype.trigger = function (variable, options, success, error) {
        if (isDefined(variable._promise) || CONSTANTS.isStudioMode) {
            return;
        }
        var repeatTimer = variable.repeating, delay = variable.delay || CONSTANTS.DEFAULT_TIMER_DELAY, event = 'onTimerFire', exec = function () {
            initiateCallback(event, variable, {});
        };
        variable._promise = repeatTimer ? setInterval(exec, delay) : setTimeout(function () {
            exec();
            variable._promise = undefined;
        }, delay);
        /*// destroy the timer on scope destruction
        callBackScope.$on('$destroy', function () {
            variable.cancel(variable._promise);
        });*/
        return variable._promise;
    };
    TimerActionManager.prototype.cancel = function (variable) {
        if (isDefined(variable._promise)) {
            if (variable.repeating) {
                clearInterval(variable._promise);
            }
            else {
                clearTimeout(variable._promise);
            }
            variable._promise = undefined;
        }
    };
    return TimerActionManager;
}(BaseActionManager));
export { TimerActionManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXItYWN0aW9uLm1hbmFnZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsibWFuYWdlci9hY3Rpb24vdGltZXItYWN0aW9uLm1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFckMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDdkUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRWhFO0lBQXdDLDhDQUFpQjtJQUF6RDs7SUFtQ0EsQ0FBQztJQWxDRyxvQ0FBTyxHQUFQLFVBQVEsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSztRQUNyQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksU0FBUyxDQUFDLFlBQVksRUFBRTtZQUN4RCxPQUFPO1NBQ1Y7UUFDRCxJQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsU0FBUyxFQUNsQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsbUJBQW1CLEVBQ3ZELEtBQUssR0FBRyxhQUFhLEVBQ3JCLElBQUksR0FBRztZQUNILGdCQUFnQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDO1FBRU4sUUFBUSxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUNwRSxJQUFJLEVBQUUsQ0FBQztZQUNQLFFBQVEsQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1FBQ2xDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVWOzs7YUFHSztRQUVMLE9BQU8sUUFBUSxDQUFDLFFBQVEsQ0FBQztJQUM3QixDQUFDO0lBRUQsbUNBQU0sR0FBTixVQUFPLFFBQVE7UUFDWCxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDOUIsSUFBSSxRQUFRLENBQUMsU0FBUyxFQUFFO2dCQUNwQixhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3BDO2lCQUFNO2dCQUNILFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbkM7WUFDRCxRQUFRLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztTQUNqQztJQUNMLENBQUM7SUFDTCx5QkFBQztBQUFELENBQUMsQUFuQ0QsQ0FBd0MsaUJBQWlCLEdBbUN4RCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzRGVmaW5lZCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQmFzZUFjdGlvbk1hbmFnZXIgfSBmcm9tICcuL2Jhc2UtYWN0aW9uLm1hbmFnZXInO1xuaW1wb3J0IHsgaW5pdGlhdGVDYWxsYmFjayB9IGZyb20gJy4uLy4uL3V0aWwvdmFyaWFibGUvdmFyaWFibGVzLnV0aWxzJztcbmltcG9ydCB7IENPTlNUQU5UUyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cy92YXJpYWJsZXMuY29uc3RhbnRzJztcblxuZXhwb3J0IGNsYXNzIFRpbWVyQWN0aW9uTWFuYWdlciBleHRlbmRzIEJhc2VBY3Rpb25NYW5hZ2VyIHtcbiAgICB0cmlnZ2VyKHZhcmlhYmxlLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICBpZiAoaXNEZWZpbmVkKHZhcmlhYmxlLl9wcm9taXNlKSB8fCBDT05TVEFOVFMuaXNTdHVkaW9Nb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVwZWF0VGltZXIgPSB2YXJpYWJsZS5yZXBlYXRpbmcsXG4gICAgICAgICAgICBkZWxheSA9IHZhcmlhYmxlLmRlbGF5IHx8IENPTlNUQU5UUy5ERUZBVUxUX1RJTUVSX0RFTEFZLFxuICAgICAgICAgICAgZXZlbnQgPSAnb25UaW1lckZpcmUnLFxuICAgICAgICAgICAgZXhlYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKGV2ZW50LCB2YXJpYWJsZSwge30pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICB2YXJpYWJsZS5fcHJvbWlzZSA9IHJlcGVhdFRpbWVyID8gc2V0SW50ZXJ2YWwoZXhlYywgZGVsYXkpIDogc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBleGVjKCk7XG4gICAgICAgICAgICB2YXJpYWJsZS5fcHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSwgZGVsYXkpO1xuXG4gICAgICAgIC8qLy8gZGVzdHJveSB0aGUgdGltZXIgb24gc2NvcGUgZGVzdHJ1Y3Rpb25cbiAgICAgICAgY2FsbEJhY2tTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyaWFibGUuY2FuY2VsKHZhcmlhYmxlLl9wcm9taXNlKTtcbiAgICAgICAgfSk7Ki9cblxuICAgICAgICByZXR1cm4gdmFyaWFibGUuX3Byb21pc2U7XG4gICAgfVxuXG4gICAgY2FuY2VsKHZhcmlhYmxlKSB7XG4gICAgICAgIGlmIChpc0RlZmluZWQodmFyaWFibGUuX3Byb21pc2UpKSB7XG4gICAgICAgICAgICBpZiAodmFyaWFibGUucmVwZWF0aW5nKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh2YXJpYWJsZS5fcHJvbWlzZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh2YXJpYWJsZS5fcHJvbWlzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXJpYWJsZS5fcHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==