import * as tslib_1 from "tslib";
import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
var getManager = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LOGOUT);
};
var ɵ0 = getManager;
var LogoutAction = /** @class */ (function (_super) {
    tslib_1.__extends(LogoutAction, _super);
    function LogoutAction(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    LogoutAction.prototype.logout = function (options, success, error) {
        getManager().logout(this, options, success, error);
    };
    LogoutAction.prototype.invoke = function (options, success, error) {
        this.logout(options, success, error);
    };
    LogoutAction.prototype.cancel = function () {
        // TODO[VIBHU]: implement http abort logic
    };
    return LogoutAction;
}(BaseAction));
export { LogoutAction };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nb3V0LWFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJtb2RlbC9hY3Rpb24vbG9nb3V0LWFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRWhGLElBQU8sVUFBVSxHQUFHO0lBQ2hCLE9BQU8sc0JBQXNCLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxRSxDQUFDLENBQUM7O0FBRUY7SUFBa0Msd0NBQVU7SUFNeEMsc0JBQVksUUFBYTtRQUF6QixZQUNJLGlCQUFPLFNBRVY7UUFERyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUksRUFBRSxRQUFRLENBQUMsQ0FBQzs7SUFDbEMsQ0FBQztJQUVELDZCQUFNLEdBQU4sVUFBTyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUs7UUFDMUIsVUFBVSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCw2QkFBTSxHQUFOLFVBQU8sT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLO1FBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQsNkJBQU0sR0FBTjtRQUNJLDBDQUEwQztJQUM5QyxDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQUFDLEFBdEJELENBQWtDLFVBQVUsR0FzQjNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmFzZUFjdGlvbiB9IGZyb20gJy4uL2Jhc2UtYWN0aW9uJztcbmltcG9ydCB7IFZBUklBQkxFX0NPTlNUQU5UUyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cy92YXJpYWJsZXMuY29uc3RhbnRzJztcbmltcG9ydCB7IFZhcmlhYmxlTWFuYWdlckZhY3RvcnkgfSBmcm9tICcuLi8uLi9mYWN0b3J5L3ZhcmlhYmxlLW1hbmFnZXIuZmFjdG9yeSc7XG5cbmNvbnN0ICBnZXRNYW5hZ2VyID0gKCkgPT4ge1xuICAgIHJldHVybiBWYXJpYWJsZU1hbmFnZXJGYWN0b3J5LmdldChWQVJJQUJMRV9DT05TVEFOVFMuQ0FURUdPUlkuTE9HT1VUKTtcbn07XG5cbmV4cG9ydCBjbGFzcyBMb2dvdXRBY3Rpb24gZXh0ZW5kcyBCYXNlQWN0aW9uIHtcblxuICAgIHN0YXJ0VXBkYXRlOiBib29sZWFuO1xuICAgIGF1dG9VcGRhdGU6IGJvb2xlYW47XG4gICAgdXNlRGVmYXVsdFN1Y2Nlc3NIYW5kbGVyOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IodmFyaWFibGU6IGFueSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHZhcmlhYmxlKTtcbiAgICB9XG5cbiAgICBsb2dvdXQob3B0aW9ucywgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgZ2V0TWFuYWdlcigpLmxvZ291dCh0aGlzLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgfVxuXG4gICAgaW52b2tlKG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIHRoaXMubG9nb3V0KG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICB9XG5cbiAgICBjYW5jZWwoKSB7XG4gICAgICAgIC8vIFRPRE9bVklCSFVdOiBpbXBsZW1lbnQgaHR0cCBhYm9ydCBsb2dpY1xuICAgIH1cbn1cbiJdfQ==