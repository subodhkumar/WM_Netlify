import * as tslib_1 from "tslib";
import { DataSource, isDefined } from '@wm/core';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
var getManager = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.NOTIFICATION);
};
var ɵ0 = getManager;
var NotificationAction = /** @class */ (function (_super) {
    tslib_1.__extends(NotificationAction, _super);
    function NotificationAction(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    NotificationAction.prototype.execute = function (operation, options) {
        var _this = this;
        var returnVal = _super.prototype.execute.call(this, operation, options);
        if (isDefined(returnVal)) {
            return returnVal;
        }
        return new Promise(function (resolve, reject) {
            switch (operation) {
                case DataSource.Operation.INVOKE:
                    _this.invoke(options, resolve, reject);
                    break;
                case DataSource.Operation.NOTIFY:
                    _this.notify(options, resolve, reject);
                    break;
                default:
                    reject(operation + " operation is not supported on this data source");
                    break;
            }
        });
    };
    // Backward compatible method
    NotificationAction.prototype.notify = function (options, success, error) {
        getManager().notify(this, options, success, error);
    };
    NotificationAction.prototype.invoke = function (options, success, error) {
        this.notify(options, success, error);
    };
    NotificationAction.prototype.getMessage = function () {
        return getManager().getMessage(this);
    };
    NotificationAction.prototype.setMessage = function (text) {
        return getManager().setMessage(this, text);
    };
    NotificationAction.prototype.clearMessage = function () {
        return getManager().setMessage(this, '');
    };
    NotificationAction.prototype.getOkButtonText = function () {
        return getManager().getOkButtonText(this);
    };
    NotificationAction.prototype.setOkButtonText = function (text) {
        return getManager().setOkButtonText(this, text);
    };
    NotificationAction.prototype.getToasterDuration = function () {
        return getManager().getToasterDuration(this);
    };
    NotificationAction.prototype.setToasterDuration = function (duration) {
        return getManager().setToasterDuration(this, duration);
    };
    NotificationAction.prototype.getToasterClass = function () {
        return getManager().getToasterClass(this);
    };
    NotificationAction.prototype.setToasterClass = function (classText) {
        return getManager().setToasterClass(this, classText);
    };
    NotificationAction.prototype.getToasterPosition = function () {
        return getManager().getToasterPosition(this);
    };
    NotificationAction.prototype.setToasterPosition = function (position) {
        return getManager().setToasterPosition(this, position);
    };
    NotificationAction.prototype.getAlertType = function () {
        return getManager().getAlertType(this);
    };
    NotificationAction.prototype.setAlertType = function (type) {
        return getManager().setAlertType(this, type);
    };
    NotificationAction.prototype.getCancelButtonText = function () {
        return getManager().getCancelButtonText(this);
    };
    NotificationAction.prototype.setCancelButtonText = function (text) {
        return getManager().setCancelButtonText(this, text);
    };
    NotificationAction.prototype.init = function () {
        // static property bindings
        getManager().initBinding(this, 'dataBinding', 'dataBinding');
        // dynamic property bindings
        getManager().initBinding(this, 'dataSet', 'dataSet');
    };
    return NotificationAction;
}(BaseAction));
export { NotificationAction };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uLWFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJtb2RlbC9hY3Rpb24vbm90aWZpY2F0aW9uLWFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBZSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFOUQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDaEYsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRXpFLElBQU0sVUFBVSxHQUFHO0lBQ2YsT0FBTyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hGLENBQUMsQ0FBQzs7QUFFRjtJQUF3Qyw4Q0FBVTtJQUk5Qyw0QkFBWSxRQUFhO1FBQXpCLFlBQ0ksaUJBQU8sU0FFVjtRQURHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDOztJQUN6QyxDQUFDO0lBRUQsb0NBQU8sR0FBUCxVQUFRLFNBQVMsRUFBRSxPQUFPO1FBQTFCLGlCQW1CQztRQWxCRyxJQUFNLFNBQVMsR0FBRyxpQkFBTSxPQUFPLFlBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBRUQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLFFBQVEsU0FBUyxFQUFFO2dCQUNmLEtBQUssVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNO29CQUM1QixLQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7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Q0FBQztJQUN4RCxDQUFDO0lBRUQsaUNBQUksR0FBSjtRQUNJLDJCQUEyQjtRQUMzQixVQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUU3RCw0QkFBNEI7UUFDNUIsVUFBVSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUNMLHlCQUFDO0FBQUQsQ0FBQyxBQTFHRCxDQUF3QyxVQUFVLEdBMEdqRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFTb3VyY2UsIElEYXRhU291cmNlLCBpc0RlZmluZWQgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IFZhcmlhYmxlTWFuYWdlckZhY3RvcnkgfSBmcm9tICcuLi8uLi9mYWN0b3J5L3ZhcmlhYmxlLW1hbmFnZXIuZmFjdG9yeSc7XG5pbXBvcnQgeyBCYXNlQWN0aW9uIH0gZnJvbSAnLi4vYmFzZS1hY3Rpb24nO1xuaW1wb3J0IHsgVkFSSUFCTEVfQ09OU1RBTlRTIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzL3ZhcmlhYmxlcy5jb25zdGFudHMnO1xuXG5jb25zdCBnZXRNYW5hZ2VyID0gKCkgPT4ge1xuICAgIHJldHVybiBWYXJpYWJsZU1hbmFnZXJGYWN0b3J5LmdldChWQVJJQUJMRV9DT05TVEFOVFMuQ0FURUdPUlkuTk9USUZJQ0FUSU9OKTtcbn07XG5cbmV4cG9ydCBjbGFzcyBOb3RpZmljYXRpb25BY3Rpb24gZXh0ZW5kcyBCYXNlQWN0aW9uIGltcGxlbWVudHMgSURhdGFTb3VyY2Uge1xuXG4gICAgbWVzc2FnZTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IodmFyaWFibGU6IGFueSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMgYXMgYW55LCB2YXJpYWJsZSk7XG4gICAgfVxuXG4gICAgZXhlY3V0ZShvcGVyYXRpb24sIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgcmV0dXJuVmFsID0gc3VwZXIuZXhlY3V0ZShvcGVyYXRpb24sIG9wdGlvbnMpO1xuICAgICAgICBpZiAoaXNEZWZpbmVkKHJldHVyblZhbCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5WYWw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIERhdGFTb3VyY2UuT3BlcmF0aW9uLklOVk9LRSA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlKG9wdGlvbnMsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgRGF0YVNvdXJjZS5PcGVyYXRpb24uTk9USUZZIDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkob3B0aW9ucywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChgJHtvcGVyYXRpb259IG9wZXJhdGlvbiBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgZGF0YSBzb3VyY2VgKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEJhY2t3YXJkIGNvbXBhdGlibGUgbWV0aG9kXG4gICAgbm90aWZ5KG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIGdldE1hbmFnZXIoKS5ub3RpZnkodGhpcywgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpO1xuICAgIH1cblxuICAgIGludm9rZShvcHRpb25zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICB0aGlzLm5vdGlmeShvcHRpb25zLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgfVxuXG4gICAgZ2V0TWVzc2FnZSgpIHtcbiAgICAgICAgcmV0dXJuIGdldE1hbmFnZXIoKS5nZXRNZXNzYWdlKHRoaXMpO1xuICAgIH1cblxuICAgIHNldE1lc3NhZ2UodGV4dCkge1xuICAgICAgICByZXR1cm4gZ2V0TWFuYWdlcigpLnNldE1lc3NhZ2UodGhpcywgdGV4dCk7XG4gICAgfVxuXG4gICAgY2xlYXJNZXNzYWdlKCkge1xuICAgICAgICByZXR1cm4gZ2V0TWFuYWdlcigpLnNldE1lc3NhZ2UodGhpcywgJycpO1xuICAgIH1cblxuICAgIGdldE9rQnV0dG9uVGV4dCgpIHtcbiAgICAgICAgcmV0dXJuIGdldE1hbmFnZXIoKS5nZXRPa0J1dHRvblRleHQodGhpcyk7XG4gICAgfVxuXG4gICAgc2V0T2tCdXR0b25UZXh0KHRleHQpIHtcbiAgICAgICAgcmV0dXJuIGdldE1hbmFnZXIoKS5zZXRPa0J1dHRvblRleHQodGhpcywgdGV4dCk7XG4gICAgfVxuXG4gICAgZ2V0VG9hc3RlckR1cmF0aW9uKCkge1xuICAgICAgICByZXR1cm4gZ2V0TWFuYWdlcigpLmdldFRvYXN0ZXJEdXJhdGlvbih0aGlzKTtcbiAgICB9XG5cbiAgICBzZXRUb2FzdGVyRHVyYXRpb24oZHVyYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIGdldE1hbmFnZXIoKS5zZXRUb2FzdGVyRHVyYXRpb24odGhpcywgZHVyYXRpb24pO1xuICAgIH1cblxuICAgIGdldFRvYXN0ZXJDbGFzcygpIHtcbiAgICAgICAgcmV0dXJuIGdldE1hbmFnZXIoKS5nZXRUb2FzdGVyQ2xhc3ModGhpcyk7XG4gICAgfVxuXG4gICAgc2V0VG9hc3RlckNsYXNzKGNsYXNzVGV4dCkge1xuICAgICAgICByZXR1cm4gZ2V0TWFuYWdlcigpLnNldFRvYXN0ZXJDbGFzcyh0aGlzLCBjbGFzc1RleHQpO1xuICAgIH1cblxuICAgIGdldFRvYXN0ZXJQb3NpdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGdldE1hbmFnZXIoKS5nZXRUb2FzdGVyUG9zaXRpb24odGhpcyk7XG4gICAgfVxuXG4gICAgc2V0VG9hc3RlclBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkuc2V0VG9hc3RlclBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICBnZXRBbGVydFR5cGUoKSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkuZ2V0QWxlcnRUeXBlKHRoaXMpO1xuICAgIH1cblxuICAgIHNldEFsZXJ0VHlwZSh0eXBlKSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkuc2V0QWxlcnRUeXBlKHRoaXMsIHR5cGUpO1xuICAgIH1cblxuICAgIGdldENhbmNlbEJ1dHRvblRleHQoKSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkuZ2V0Q2FuY2VsQnV0dG9uVGV4dCh0aGlzKTtcbiAgICB9XG5cbiAgICBzZXRDYW5jZWxCdXR0b25UZXh0KHRleHQpIHtcbiAgICAgICAgcmV0dXJuIGdldE1hbmFnZXIoKS5zZXRDYW5jZWxCdXR0b25UZXh0KHRoaXMsIHRleHQpO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIC8vIHN0YXRpYyBwcm9wZXJ0eSBiaW5kaW5nc1xuICAgICAgICBnZXRNYW5hZ2VyKCkuaW5pdEJpbmRpbmcodGhpcywgJ2RhdGFCaW5kaW5nJywgJ2RhdGFCaW5kaW5nJyk7XG5cbiAgICAgICAgLy8gZHluYW1pYyBwcm9wZXJ0eSBiaW5kaW5nc1xuICAgICAgICBnZXRNYW5hZ2VyKCkuaW5pdEJpbmRpbmcodGhpcywgJ2RhdGFTZXQnLCAnZGF0YVNldCcpO1xuICAgIH1cbn1cbiJdfQ==