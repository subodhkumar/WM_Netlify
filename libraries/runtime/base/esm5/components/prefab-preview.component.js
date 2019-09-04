import * as tslib_1 from "tslib";
import { Component, ViewChild } from '@angular/core';
import { PrefabDirective } from '@wm/components';
import { PrefabManagerService } from '../services/prefab-manager.service';
var PREFAB = 'PREFAB';
var PrefabPreviewComponent = /** @class */ (function () {
    function PrefabPreviewComponent(prefabManager) {
        var _this = this;
        this.prefabManager = prefabManager;
        window.addEventListener('message', function (e) {
            var context = e.data && e.data.context;
            if (context !== PREFAB) {
                return;
            }
            var action = e.data.action;
            var payload = e.data.payload;
            if (action === 'init') {
                _this.init();
            }
            else if (action === 'set-property') {
                _this.setProperty(payload);
            }
            else if (action === 'get-outbound-properties') {
                _this.getOutboundProps();
            }
            else if (action === 'invoke-script') {
                _this.invokeScript(payload);
            }
        });
    }
    PrefabPreviewComponent.prototype.postMessage = function (action, payload) {
        var data = {
            context: PREFAB,
            action: action,
            payload: payload
        };
        window.top.postMessage(data, '*');
    };
    PrefabPreviewComponent.prototype.setupEventListeners = function () {
        var _this = this;
        this.prefabInstance.invokeEventCallback = function (eventName, locals) {
            if (locals === void 0) { locals = {}; }
            _this.postMessage('event-log', { name: eventName, data: locals });
        };
    };
    PrefabPreviewComponent.prototype.init = function () {
        var _this = this;
        this.previewMode = true;
        this.prefabInstance.readyState.subscribe(function () { }, function () { }, function () {
            _this.prefabManager.getConfig('__self__')
                .then(function (config) {
                _this.config = config;
                _this.postMessage('config', config);
                _this.setupEventListeners();
            });
        });
    };
    PrefabPreviewComponent.prototype.setProperty = function (payload) {
        this.prefabInstance.widget[payload.name] = payload.value;
    };
    PrefabPreviewComponent.prototype.isOutBoundProp = function (info) {
        return info.bindable === 'out-bound' || info.bindable === 'in-out-bound';
    };
    PrefabPreviewComponent.prototype.getOutboundProps = function () {
        var e_1, _a;
        var payload = {};
        try {
            for (var _b = tslib_1.__values(Object.entries(this.config.properties || {})), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = tslib_1.__read(_c.value, 2), name_1 = _d[0], info = _d[1];
                if (this.isOutBoundProp(info)) {
                    payload[name_1] = this.prefabInstance.widget[name_1];
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.postMessage('outbound-properties', payload);
    };
    PrefabPreviewComponent.prototype.invokeScript = function (payload) {
        var script = "\n return " + payload.script + ";";
        var fn = new Function('Prefab', script);
        var retVal = fn(this.prefabInstance);
        this.postMessage('method-output', { methodName: payload.methodName, output: retVal });
    };
    PrefabPreviewComponent.prototype.ngAfterViewInit = function () {
        this.setupEventListeners();
        this.postMessage('init');
    };
    PrefabPreviewComponent.decorators = [
        { type: Component, args: [{
                    selector: 'wm-prefab-preview',
                    template: "\n        <div class=\"prefab-preview row\">\n            <section wmPrefab name=\"prefab-preview\" prefabname=\"__self__\"></section>\n        </div>\n    "
                }] }
    ];
    /** @nocollapse */
    PrefabPreviewComponent.ctorParameters = function () { return [
        { type: PrefabManagerService }
    ]; };
    PrefabPreviewComponent.propDecorators = {
        prefabInstance: [{ type: ViewChild, args: [PrefabDirective,] }]
    };
    return PrefabPreviewComponent;
}());
export { PrefabPreviewComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLXByZXZpZXcuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbImNvbXBvbmVudHMvcHJlZmFiLXByZXZpZXcuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQWlCLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFcEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWpELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBRTFFLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUV4QjtJQWNJLGdDQUFvQixhQUFtQztRQUF2RCxpQkFzQkM7UUF0Qm1CLGtCQUFhLEdBQWIsYUFBYSxDQUFzQjtRQUVuRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQUEsQ0FBQztZQUNoQyxJQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBRXpDLElBQUksT0FBTyxLQUFLLE1BQU0sRUFBRTtnQkFDcEIsT0FBTzthQUNWO1lBRUQsSUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDN0IsSUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFFL0IsSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFO2dCQUNuQixLQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDZjtpQkFBTSxJQUFJLE1BQU0sS0FBSyxjQUFjLEVBQUU7Z0JBQ2xDLEtBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0I7aUJBQU0sSUFBSSxNQUFNLEtBQUsseUJBQXlCLEVBQUU7Z0JBQzdDLEtBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2FBQzNCO2lCQUFNLElBQUks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RUFBRSxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVELGdEQUFlLEdBQWY7UUFDSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdCLENBQUM7O2dCQXZHSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLG1CQUFtQjtvQkFDN0IsUUFBUSxFQUFFLDhKQUlUO2lCQUNKOzs7O2dCQVhRLG9CQUFvQjs7O2lDQWdCeEIsU0FBUyxTQUFDLGVBQWU7O0lBNEY5Qiw2QkFBQztDQUFBLEFBeEdELElBd0dDO1NBaEdZLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFByZWZhYkRpcmVjdGl2ZSB9IGZyb20gJ0B3bS9jb21wb25lbnRzJztcblxuaW1wb3J0IHsgUHJlZmFiTWFuYWdlclNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9wcmVmYWItbWFuYWdlci5zZXJ2aWNlJztcblxuY29uc3QgUFJFRkFCID0gJ1BSRUZBQic7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnd20tcHJlZmFiLXByZXZpZXcnLFxuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwcmVmYWItcHJldmlldyByb3dcIj5cbiAgICAgICAgICAgIDxzZWN0aW9uIHdtUHJlZmFiIG5hbWU9XCJwcmVmYWItcHJldmlld1wiIHByZWZhYm5hbWU9XCJfX3NlbGZfX1wiPjwvc2VjdGlvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBQcmVmYWJQcmV2aWV3Q29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgcHJpdmF0ZSBjb25maWc6IGFueTtcbiAgICBwcml2YXRlIHByZXZpZXdNb2RlOiBib29sZWFuO1xuXG4gICAgQFZpZXdDaGlsZChQcmVmYWJEaXJlY3RpdmUpIHByZWZhYkluc3RhbmNlO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBwcmVmYWJNYW5hZ2VyOiBQcmVmYWJNYW5hZ2VyU2VydmljZSkge1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gZS5kYXRhICYmIGUuZGF0YS5jb250ZXh0O1xuXG4gICAgICAgICAgICBpZiAoY29udGV4dCAhPT0gUFJFRkFCKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBhY3Rpb24gPSBlLmRhdGEuYWN0aW9uO1xuICAgICAgICAgICAgY29uc3QgcGF5bG9hZCA9IGUuZGF0YS5wYXlsb2FkO1xuXG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnaW5pdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnc2V0LXByb3BlcnR5Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0UHJvcGVydHkocGF5bG9hZCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2dldC1vdXRib3VuZC1wcm9wZXJ0aWVzJykge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3V0Ym91bmRQcm9wcygpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdpbnZva2Utc2NyaXB0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlU2NyaXB0KHBheWxvYWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwb3N0TWVzc2FnZShhY3Rpb24sIHBheWxvYWQ/OiBhbnkpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICAgIGNvbnRleHQ6IFBSRUZBQixcbiAgICAgICAgICAgIGFjdGlvbixcbiAgICAgICAgICAgIHBheWxvYWRcbiAgICAgICAgfTtcbiAgICAgICAgd2luZG93LnRvcC5wb3N0TWVzc2FnZShkYXRhLCAnKicpO1xuICAgIH1cblxuICAgIHNldHVwRXZlbnRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHRoaXMucHJlZmFiSW5zdGFuY2UuaW52b2tlRXZlbnRDYWxsYmFjayA9IChldmVudE5hbWUsIGxvY2FscyA9IHt9KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBvc3RNZXNzYWdlKCdldmVudC1sb2cnLCB7IG5hbWU6IGV2ZW50TmFtZSwgZGF0YTogbG9jYWxzIH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMucHJldmlld01vZGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMucHJlZmFiSW5zdGFuY2UucmVhZHlTdGF0ZS5zdWJzY3JpYmUoXG4gICAgICAgICAgICAoKSA9PiB7fSxcbiAgICAgICAgICAgICgpID0+IHt9LFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlZmFiTWFuYWdlci5nZXRDb25maWcoJ19fc2VsZl9fJylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oY29uZmlnID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0TWVzc2FnZSgnY29uZmlnJywgY29uZmlnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXR1cEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHNldFByb3BlcnR5KHBheWxvYWQ6IGFueSkge1xuICAgICAgICB0aGlzLnByZWZhYkluc3RhbmNlLndpZGdldFtwYXlsb2FkLm5hbWVdID0gcGF5bG9hZC52YWx1ZTtcbiAgICB9XG5cbiAgICBpc091dEJvdW5kUHJvcChpbmZvKSB7XG4gICAgICAgIHJldHVybiBpbmZvLmJpbmRhYmxlID09PSAnb3V0LWJvdW5kJyB8fCBpbmZvLmJpbmRhYmxlID09PSAnaW4tb3V0LWJvdW5kJztcbiAgICB9XG5cbiAgICBnZXRPdXRib3VuZFByb3BzKCkge1xuICAgICAgICBjb25zdCBwYXlsb2FkID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIGluZm9dIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMuY29uZmlnLnByb3BlcnRpZXMgfHwge30pKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc091dEJvdW5kUHJvcChpbmZvKSkge1xuICAgICAgICAgICAgICAgIHBheWxvYWRbbmFtZV0gPSB0aGlzLnByZWZhYkluc3RhbmNlLndpZGdldFtuYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucG9zdE1lc3NhZ2UoJ291dGJvdW5kLXByb3BlcnRpZXMnLCBwYXlsb2FkKTtcbiAgICB9XG5cbiAgICBpbnZva2VTY3JpcHQocGF5bG9hZDogYW55KSB7XG4gICAgICAgIGNvbnN0IHNjcmlwdCA9IGBcXG4gcmV0dXJuICR7cGF5bG9hZC5zY3JpcHR9O2A7XG5cbiAgICAgICAgY29uc3QgZm4gPSBuZXcgRnVuY3Rpb24oJ1ByZWZhYicsIHNjcmlwdCk7XG5cbiAgICAgICAgY29uc3QgcmV0VmFsID0gZm4odGhpcy5wcmVmYWJJbnN0YW5jZSk7XG5cbiAgICAgICAgdGhpcy5wb3N0TWVzc2FnZSgnbWV0aG9kLW91dHB1dCcsIHsgbWV0aG9kTmFtZTogcGF5bG9hZC5tZXRob2ROYW1lLCBvdXRwdXQ6IHJldFZhbCB9KTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHRoaXMuc2V0dXBFdmVudExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLnBvc3RNZXNzYWdlKCdpbml0Jyk7XG4gICAgfVxufVxuXG4iXX0=