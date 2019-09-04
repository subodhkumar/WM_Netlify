import * as tslib_1 from "tslib";
import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
var getManager = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LOGIN);
};
var ɵ0 = getManager;
var LoginAction = /** @class */ (function (_super) {
    tslib_1.__extends(LoginAction, _super);
    function LoginAction(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    LoginAction.prototype.login = function (options, success, error) {
        return getManager().login(this, options, success, error);
    };
    LoginAction.prototype.invoke = function (options, success, error) {
        return this.login(options, success, error);
    };
    LoginAction.prototype.cancel = function () {
        // TODO[VIBHU]: implement http abort logic
    };
    LoginAction.prototype.init = function () {
        getManager().initBinding(this, 'dataBinding', 'dataBinding');
    };
    return LoginAction;
}(BaseAction));
export { LoginAction };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4tYWN0aW9uLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbIm1vZGVsL2FjdGlvbi9sb2dpbi1hY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUN6RSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUVoRixJQUFPLFVBQVUsR0FBRztJQUNoQixPQUFPLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekUsQ0FBQyxDQUFDOztBQUVGO0lBQWlDLHVDQUFVO0lBTXZDLHFCQUFZLFFBQWE7UUFBekIsWUFDSSxpQkFBTyxTQUVWO1FBREcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7O0lBQ2xDLENBQUM7SUFFRCwyQkFBSyxHQUFMLFVBQU0sT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLO1FBQ3pCLE9BQU8sVUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCw0QkFBTSxHQUFOLFVBQU8sT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLO1FBQzFCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCw0QkFBTSxHQUFOO1FBQ0ksMENBQTBDO0lBQzlDLENBQUM7SUFFRCwwQkFBSSxHQUFKO1FBQ0ksVUFBVSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUNMLGtCQUFDO0FBQUQsQ0FBQyxBQTFCRCxDQUFpQyxVQUFVLEdBMEIxQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJhc2VBY3Rpb24gfSBmcm9tICcuLi9iYXNlLWFjdGlvbic7XG5pbXBvcnQgeyBWQVJJQUJMRV9DT05TVEFOVFMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMvdmFyaWFibGVzLmNvbnN0YW50cyc7XG5pbXBvcnQgeyBWYXJpYWJsZU1hbmFnZXJGYWN0b3J5IH0gZnJvbSAnLi4vLi4vZmFjdG9yeS92YXJpYWJsZS1tYW5hZ2VyLmZhY3RvcnknO1xuXG5jb25zdCAgZ2V0TWFuYWdlciA9ICgpID0+IHtcbiAgICByZXR1cm4gVmFyaWFibGVNYW5hZ2VyRmFjdG9yeS5nZXQoVkFSSUFCTEVfQ09OU1RBTlRTLkNBVEVHT1JZLkxPR0lOKTtcbn07XG5cbmV4cG9ydCBjbGFzcyBMb2dpbkFjdGlvbiBleHRlbmRzIEJhc2VBY3Rpb24ge1xuXG4gICAgc3RhcnRVcGRhdGU6IGJvb2xlYW47XG4gICAgYXV0b1VwZGF0ZTogYm9vbGVhbjtcbiAgICB1c2VEZWZhdWx0U3VjY2Vzc0hhbmRsZXI6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcih2YXJpYWJsZTogYW55KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgdmFyaWFibGUpO1xuICAgIH1cblxuICAgIGxvZ2luKG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkubG9naW4odGhpcywgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpO1xuICAgIH1cblxuICAgIGludm9rZShvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2dpbihvcHRpb25zLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgfVxuXG4gICAgY2FuY2VsKCkge1xuICAgICAgICAvLyBUT0RPW1ZJQkhVXTogaW1wbGVtZW50IGh0dHAgYWJvcnQgbG9naWNcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICBnZXRNYW5hZ2VyKCkuaW5pdEJpbmRpbmcodGhpcywgJ2RhdGFCaW5kaW5nJywgJ2RhdGFCaW5kaW5nJyk7XG4gICAgfVxufVxuIl19