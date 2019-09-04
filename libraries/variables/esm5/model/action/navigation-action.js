import * as tslib_1 from "tslib";
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
var getManager = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.NAVIGATION);
};
var ɵ0 = getManager;
var NavigationAction = /** @class */ (function (_super) {
    tslib_1.__extends(NavigationAction, _super);
    function NavigationAction(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    NavigationAction.prototype.invoke = function (options) {
        getManager().invoke(this, options);
    };
    // legacy method.
    NavigationAction.prototype.navigate = function (options) {
        this.invoke(options);
    };
    NavigationAction.prototype.init = function () {
        // static property bindings
        getManager().initBinding(this, 'dataBinding', 'dataBinding');
        // dynamic property bindings (e.g. page params)
        getManager().initBinding(this, 'dataSet', 'dataSet');
    };
    return NavigationAction;
}(BaseAction));
export { NavigationAction };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdGlvbi1hY3Rpb24uanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsibW9kZWwvYWN0aW9uL25hdmlnYXRpb24tYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNoRixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFekUsSUFBTyxVQUFVLEdBQUc7SUFDaEIsT0FBTyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlFLENBQUMsQ0FBQzs7QUFFRjtJQUFzQyw0Q0FBVTtJQUk1QywwQkFBWSxRQUFhO1FBQXpCLFlBQ0ksaUJBQU8sU0FFVjtRQURHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDOztJQUN6QyxDQUFDO0lBRUQsaUNBQU0sR0FBTixVQUFPLE9BQVE7UUFDWCxVQUFVLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxpQkFBaUI7SUFDakIsbUNBQVEsR0FBUixVQUFTLE9BQVE7UUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCwrQkFBSSxHQUFKO1FBQ0ksMkJBQTJCO1FBQzNCLFVBQVUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRTdELCtDQUErQztRQUMvQyxVQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQ0wsdUJBQUM7QUFBRCxDQUFDLEFBekJELENBQXNDLFVBQVUsR0F5Qi9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmFyaWFibGVNYW5hZ2VyRmFjdG9yeSB9IGZyb20gJy4uLy4uL2ZhY3RvcnkvdmFyaWFibGUtbWFuYWdlci5mYWN0b3J5JztcbmltcG9ydCB7IEJhc2VBY3Rpb24gfSBmcm9tICcuLi9iYXNlLWFjdGlvbic7XG5pbXBvcnQgeyBWQVJJQUJMRV9DT05TVEFOVFMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMvdmFyaWFibGVzLmNvbnN0YW50cyc7XG5cbmNvbnN0ICBnZXRNYW5hZ2VyID0gKCkgPT4ge1xuICAgIHJldHVybiBWYXJpYWJsZU1hbmFnZXJGYWN0b3J5LmdldChWQVJJQUJMRV9DT05TVEFOVFMuQ0FURUdPUlkuTkFWSUdBVElPTik7XG59O1xuXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvbkFjdGlvbiBleHRlbmRzIEJhc2VBY3Rpb24ge1xuICAgIG9wZXJhdGlvbjogc3RyaW5nO1xuICAgIHBhZ2VOYW1lOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcih2YXJpYWJsZTogYW55KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcyBhcyBhbnksIHZhcmlhYmxlKTtcbiAgICB9XG5cbiAgICBpbnZva2Uob3B0aW9ucz8pIHtcbiAgICAgICAgZ2V0TWFuYWdlcigpLmludm9rZSh0aGlzLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvLyBsZWdhY3kgbWV0aG9kLlxuICAgIG5hdmlnYXRlKG9wdGlvbnM/KSB7XG4gICAgICAgIHRoaXMuaW52b2tlKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIC8vIHN0YXRpYyBwcm9wZXJ0eSBiaW5kaW5nc1xuICAgICAgICBnZXRNYW5hZ2VyKCkuaW5pdEJpbmRpbmcodGhpcywgJ2RhdGFCaW5kaW5nJywgJ2RhdGFCaW5kaW5nJyk7XG5cbiAgICAgICAgLy8gZHluYW1pYyBwcm9wZXJ0eSBiaW5kaW5ncyAoZS5nLiBwYWdlIHBhcmFtcylcbiAgICAgICAgZ2V0TWFuYWdlcigpLmluaXRCaW5kaW5nKHRoaXMsICdkYXRhU2V0JywgJ2RhdGFTZXQnKTtcbiAgICB9XG59XG4iXX0=