import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AbstractToasterService, isDefined } from '@wm/core';
import { CustomToasterComponent } from '../components/custom-toaster.component';
var ToasterServiceImpl = /** @class */ (function (_super) {
    tslib_1.__extends(ToasterServiceImpl, _super);
    function ToasterServiceImpl(toaster) {
        var _this = _super.call(this) || this;
        _this.toaster = toaster;
        return _this;
    }
    ToasterServiceImpl.prototype._showToaster = function (type, title, desc, options) {
        // backward compatibility (in 9.x, 4th param is timeout value).
        if (_.isNumber(options)) {
            options = { timeOut: options };
        }
        options = options || {};
        options.timeOut = isDefined(options.timeOut) ? options.timeOut : 0;
        options.enableHtml = isDefined(options.enableHtml);
        options.positionClass = options.positionClass || 'toast-bottom-right';
        options.toastClass = 'toast';
        // pop the toaster only if either title or description are defined
        if (title || desc) {
            // if the desc is an object, stringify it.
            if (!options.bodyOutputType && _.isObject(desc)) {
                desc = JSON.stringify(desc);
            }
            var fn = this.toaster[type];
            if (fn) {
                return fn.call(this.toaster, desc, title, options);
            }
        }
    };
    ToasterServiceImpl.prototype.success = function (title, desc) {
        return this._showToaster('success', title, desc, { timeOut: 5000 });
    };
    ToasterServiceImpl.prototype.error = function (title, desc) {
        return this._showToaster('error', title, desc, { timeOut: 0 });
    };
    ToasterServiceImpl.prototype.info = function (title, desc) {
        return this._showToaster('info', title, desc, { timeOut: 0 });
    };
    ToasterServiceImpl.prototype.warn = function (title, desc) {
        return this._showToaster('warning', title, desc, { timeOut: 0 });
    };
    ToasterServiceImpl.prototype.show = function (type, title, desc, options) {
        return this._showToaster(type, title, desc, options);
    };
    ToasterServiceImpl.prototype.hide = function (toasterObj) {
        // in studio just ignore the toasterObj and hide all the toasters
        if (!toasterObj) {
            this.toaster.clear();
            return;
        }
        this.toaster.clear(toasterObj.toastId);
    };
    ToasterServiceImpl.prototype.showCustom = function (page, options) {
        if (!page) {
            return;
        }
        options = options || {};
        options.toastComponent = CustomToasterComponent;
        options.toastClass = 'custom-toaster';
        options.timeOut = isDefined(options.timeOut) ? options.timeOut : 0;
        options.enableHtml = isDefined(options.enableHtml);
        options.positionClass = options.positionClass || 'toast-bottom-right';
        options.toastClass = 'toast';
        return this.toaster.show(page, '', options);
    };
    ToasterServiceImpl.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    ToasterServiceImpl.ctorParameters = function () { return [
        { type: ToastrService }
    ]; };
    return ToasterServiceImpl;
}(AbstractToasterService));
export { ToasterServiceImpl };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3Rlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL3RvYXN0ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFN0QsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFJaEY7SUFDd0MsOENBQXNCO0lBRTFELDRCQUFvQixPQUFzQjtRQUExQyxZQUNJLGlCQUFPLFNBQ1Y7UUFGbUIsYUFBTyxHQUFQLE9BQU8sQ0FBZTs7SUFFMUMsQ0FBQztJQUVPLHlDQUFZLEdBQXBCLFVBQXNCLElBQVksRUFBRSxLQUFhLEVBQUUsSUFBWSxFQUFFLE9BQWE7UUFDMUUsK0RBQStEO1FBQy9ELElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNyQixPQUFPLEdBQUcsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLENBQUM7U0FDaEM7UUFFRCxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUN4QixPQUFPLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRSxPQUFPLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkQsT0FBTyxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsYUFBYSxJQUFJLG9CQUFvQixDQUFDO1FBQ3RFLE9BQU8sQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO1FBQzdCLGtF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SUFDaEQsQ0FBQzs7Z0JBeEVKLFVBQVU7Ozs7Z0JBUkYsYUFBYTs7SUFpRnRCLHlCQUFDO0NBQUEsQUF6RUQsQ0FDd0Msc0JBQXNCLEdBd0U3RDtTQXhFWSxrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFRvYXN0clNlcnZpY2UgfSBmcm9tICduZ3gtdG9hc3RyJztcblxuaW1wb3J0IHsgQWJzdHJhY3RUb2FzdGVyU2VydmljZSwgaXNEZWZpbmVkIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBDdXN0b21Ub2FzdGVyQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50cy9jdXN0b20tdG9hc3Rlci5jb21wb25lbnQnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUb2FzdGVyU2VydmljZUltcGwgZXh0ZW5kcyBBYnN0cmFjdFRvYXN0ZXJTZXJ2aWNlIHtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgdG9hc3RlcjogVG9hc3RyU2VydmljZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3Nob3dUb2FzdGVyICh0eXBlOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIGRlc2M6IHN0cmluZywgb3B0aW9ucz86IGFueSkge1xuICAgICAgICAvLyBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IChpbiA5LngsIDR0aCBwYXJhbSBpcyB0aW1lb3V0IHZhbHVlKS5cbiAgICAgICAgaWYgKF8uaXNOdW1iZXIob3B0aW9ucykpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7dGltZU91dDogb3B0aW9uc307XG4gICAgICAgIH1cblxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgb3B0aW9ucy50aW1lT3V0ID0gaXNEZWZpbmVkKG9wdGlvbnMudGltZU91dCkgPyBvcHRpb25zLnRpbWVPdXQgOiAwO1xuICAgICAgICBvcHRpb25zLmVuYWJsZUh0bWwgPSBpc0RlZmluZWQob3B0aW9ucy5lbmFibGVIdG1sKTtcbiAgICAgICAgb3B0aW9ucy5wb3NpdGlvbkNsYXNzID0gb3B0aW9ucy5wb3NpdGlvbkNsYXNzIHx8ICd0b2FzdC1ib3R0b20tcmlnaHQnO1xuICAgICAgICBvcHRpb25zLnRvYXN0Q2xhc3MgPSAndG9hc3QnO1xuICAgICAgICAvLyBwb3AgdGhlIHRvYXN0ZXIgb25seSBpZiBlaXRoZXIgdGl0bGUgb3IgZGVzY3JpcHRpb24gYXJlIGRlZmluZWRcbiAgICAgICAgaWYgKHRpdGxlIHx8IGRlc2MpIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZSBkZXNjIGlzIGFuIG9iamVjdCwgc3RyaW5naWZ5IGl0LlxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLmJvZHlPdXRwdXRUeXBlICYmIF8uaXNPYmplY3QoZGVzYykpIHtcbiAgICAgICAgICAgICAgICBkZXNjID0gSlNPTi5zdHJpbmdpZnkoZGVzYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmbiA9IHRoaXMudG9hc3Rlclt0eXBlXTtcbiAgICAgICAgICAgIGlmIChmbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMudG9hc3RlciwgZGVzYywgdGl0bGUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHN1Y2Nlc3MgKHRpdGxlLCBkZXNjKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaG93VG9hc3Rlcignc3VjY2VzcycsIHRpdGxlLCBkZXNjLCB7dGltZU91dDogNTAwMH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBlcnJvciAodGl0bGUsIGRlc2MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Nob3dUb2FzdGVyKCdlcnJvcicsIHRpdGxlLCBkZXNjLCB7dGltZU91dDogMH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbmZvICh0aXRsZSwgZGVzYykge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2hvd1RvYXN0ZXIoJ2luZm8nLCB0aXRsZSwgZGVzYywge3RpbWVPdXQ6IDB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgd2FybiAodGl0bGUsIGRlc2MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Nob3dUb2FzdGVyKCd3YXJuaW5nJywgdGl0bGUsIGRlc2MsIHt0aW1lT3V0OiAwfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHNob3cgKHR5cGUsIHRpdGxlLCBkZXNjLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaG93VG9hc3Rlcih0eXBlLCB0aXRsZSwgZGVzYywgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcHVibGljIGhpZGUgKHRvYXN0ZXJPYmopIHtcbiAgICAgICAgLy8gaW4gc3R1ZGlvIGp1c3QgaWdub3JlIHRoZSB0b2FzdGVyT2JqIGFuZCBoaWRlIGFsbCB0aGUgdG9hc3RlcnNcbiAgICAgICAgaWYgKCF0b2FzdGVyT2JqKSB7XG4gICAgICAgICAgICB0aGlzLnRvYXN0ZXIuY2xlYXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRvYXN0ZXIuY2xlYXIodG9hc3Rlck9iai50b2FzdElkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2hvd0N1c3RvbShwYWdlLCBvcHRpb25zKSB7XG4gICAgICAgIGlmICghcGFnZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBvcHRpb25zLnRvYXN0Q29tcG9uZW50ID0gQ3VzdG9tVG9hc3RlckNvbXBvbmVudDtcbiAgICAgICAgb3B0aW9ucy50b2FzdENsYXNzID0gJ2N1c3RvbS10b2FzdGVyJztcbiAgICAgICAgb3B0aW9ucy50aW1lT3V0ID0gaXNEZWZpbmVkKG9wdGlvbnMudGltZU91dCkgPyBvcHRpb25zLnRpbWVPdXQgOiAwO1xuICAgICAgICBvcHRpb25zLmVuYWJsZUh0bWwgPSBpc0RlZmluZWQob3B0aW9ucy5lbmFibGVIdG1sKTtcbiAgICAgICAgb3B0aW9ucy5wb3NpdGlvbkNsYXNzID0gb3B0aW9ucy5wb3NpdGlvbkNsYXNzIHx8ICd0b2FzdC1ib3R0b20tcmlnaHQnO1xuICAgICAgICBvcHRpb25zLnRvYXN0Q2xhc3MgPSAndG9hc3QnO1xuICAgICAgICByZXR1cm4gdGhpcy50b2FzdGVyLnNob3cocGFnZSwgJycsIG9wdGlvbnMpO1xuICAgIH1cbn1cbiJdfQ==