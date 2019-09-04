import * as tslib_1 from "tslib";
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { ApiAwareVariable } from './api-aware-variable';
var getManager = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.DEVICE);
};
var ɵ0 = getManager;
var DeviceVariable = /** @class */ (function (_super) {
    tslib_1.__extends(DeviceVariable, _super);
    function DeviceVariable(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    DeviceVariable.prototype.init = function () {
        getManager().initBinding(this);
    };
    DeviceVariable.prototype.invoke = function (options, onSuccess, onError) {
        getManager().invoke(this, options).then(onSuccess, onError);
    };
    return DeviceVariable;
}(ApiAwareVariable));
export { DeviceVariable };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLXZhcmlhYmxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbIm1vZGVsL3ZhcmlhYmxlL2RldmljZS12YXJpYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDaEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFekUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFeEQsSUFBTSxVQUFVLEdBQUc7SUFDZixPQUErQixzQkFBc0IsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xHLENBQUMsQ0FBQzs7QUFFRjtJQUFvQywwQ0FBZ0I7SUFDaEQsd0JBQVksUUFBYTtRQUF6QixZQUNJLGlCQUFPLFNBRVY7UUFERyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQzs7SUFDekMsQ0FBQztJQUVELDZCQUFJLEdBQUo7UUFDSSxVQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELCtCQUFNLEdBQU4sVUFBTyxPQUFRLEVBQUUsU0FBVSxFQUFFLE9BQVE7UUFDakMsVUFBVSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFDTCxxQkFBQztBQUFELENBQUMsQUFiRCxDQUFvQyxnQkFBZ0IsR0FhbkQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWYXJpYWJsZU1hbmFnZXJGYWN0b3J5IH0gZnJvbSAnLi4vLi4vZmFjdG9yeS92YXJpYWJsZS1tYW5hZ2VyLmZhY3RvcnknO1xuaW1wb3J0IHsgVkFSSUFCTEVfQ09OU1RBTlRTIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzL3ZhcmlhYmxlcy5jb25zdGFudHMnO1xuaW1wb3J0IHsgRGV2aWNlVmFyaWFibGVNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vbWFuYWdlci92YXJpYWJsZS9kZXZpY2UtdmFyaWFibGUtbWFuYWdlcic7XG5pbXBvcnQgeyBBcGlBd2FyZVZhcmlhYmxlIH0gZnJvbSAnLi9hcGktYXdhcmUtdmFyaWFibGUnO1xuXG5jb25zdCBnZXRNYW5hZ2VyID0gKCkgPT4ge1xuICAgIHJldHVybiA8RGV2aWNlVmFyaWFibGVNYW5hZ2VyPiBWYXJpYWJsZU1hbmFnZXJGYWN0b3J5LmdldChWQVJJQUJMRV9DT05TVEFOVFMuQ0FURUdPUlkuREVWSUNFKTtcbn07XG5cbmV4cG9ydCBjbGFzcyBEZXZpY2VWYXJpYWJsZSBleHRlbmRzIEFwaUF3YXJlVmFyaWFibGUge1xuICAgIGNvbnN0cnVjdG9yKHZhcmlhYmxlOiBhbnkpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzIGFzIGFueSwgdmFyaWFibGUpO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIGdldE1hbmFnZXIoKS5pbml0QmluZGluZyh0aGlzKTtcbiAgICB9XG5cbiAgICBpbnZva2Uob3B0aW9ucz8sIG9uU3VjY2Vzcz8sIG9uRXJyb3I/KSB7XG4gICAgICAgIGdldE1hbmFnZXIoKS5pbnZva2UodGhpcywgb3B0aW9ucykudGhlbihvblN1Y2Nlc3MsIG9uRXJyb3IpO1xuICAgIH1cbn1cbiJdfQ==