import * as tslib_1 from "tslib";
import { Subject } from 'rxjs';
import { $watch, AbstractI18nService, App, isIE, noop, UtilsService, $invokeWatchers } from '@wm/core';
import { WidgetRef } from '@wm/components';
import { VariablesService } from '@wm/variables';
import { PrefabManagerService } from '../services/prefab-manager.service';
import { FragmentMonitor } from "../util/fragment-monitor";
var BasePrefabComponent = /** @class */ (function (_super) {
    tslib_1.__extends(BasePrefabComponent, _super);
    function BasePrefabComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.destroy$ = new Subject();
        _this.viewInit$ = new Subject();
        return _this;
    }
    BasePrefabComponent.prototype.getContainerWidgetInjector = function () {
        return this.containerWidget.inj || this.containerWidget.injector;
    };
    BasePrefabComponent.prototype.init = function () {
        this.App = this.injector.get(App);
        this.containerWidget = this.injector.get(WidgetRef);
        this.prefabMngr = this.injector.get(PrefabManagerService);
        this.i18nService = this.injector.get(AbstractI18nService);
        if (this.getContainerWidgetInjector().view.component.registerFragment) {
            this.getContainerWidgetInjector().view.component.registerFragment();
        }
        this.initUserScript();
        this.registerWidgets();
        this.initVariables();
        this.registerProps();
        this.defineI18nProps();
        _super.prototype.init.call(this);
    };
    BasePrefabComponent.prototype.registerWidgets = function () {
        this.Widgets = {};
    };
    BasePrefabComponent.prototype.initUserScript = function () {
        try {
            this.evalUserScript(this, this.App, this.injector.get(UtilsService));
        }
        catch (e) {
            console.error("Error in evaluating prefab (" + this.prefabName + ") script\n", e);
        }
    };
    BasePrefabComponent.prototype.registerChangeListeners = function () {
        this.containerWidget.registerPropertyChangeListener(this.onPropertyChange);
        this.containerWidget.registerStyleChangeListener(this.onPropertyChange);
    };
    BasePrefabComponent.prototype.registerDestroyListener = function (fn) {
        this.destroy$.subscribe(noop, noop, function () { return fn(); });
    };
    BasePrefabComponent.prototype.defineI18nProps = function () {
        this.appLocale = this.i18nService.getPrefabLocaleBundle(this.prefabName);
    };
    BasePrefabComponent.prototype.registerProps = function () {
        var _this = this;
        this.prefabMngr.getConfig(this.prefabName)
            .then(function (config) {
            if (config) {
                _this.displayName = config.displayName;
                Object.entries((config.properties || {}))
                    .forEach(function (_a) {
                    var _b = tslib_1.__read(_a, 2), key = _b[0], prop = _b[1];
                    var expr;
                    var value = _.trim(prop.value);
                    if (_.startsWith(value, 'bind:')) {
                        expr = value.replace('bind:', '');
                    }
                    Object.defineProperty(_this, key, {
                        get: function () { return _this.containerWidget[key]; },
                        set: function (nv) { return _this.containerWidget.widget[key] = nv; }
                    });
                    if (expr) {
                        _this.registerDestroyListener($watch(expr, _this, {}, function (nv) { return _this.containerWidget.widget[key] = nv; }));
                    }
                });
                Object.entries((config.events || {}))
                    .forEach(function (_a) {
                    var _b = tslib_1.__read(_a, 2), key = _b[0], prop = _b[1];
                    _this[key] = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var eventName = key.substr(2).toLowerCase();
                        _this.containerWidget.invokeEventCallback(eventName, { $event: args[0], $data: args[1] });
                    };
                });
                Object.entries((config.methods || {}))
                    .forEach(function (_a) {
                    var _b = tslib_1.__read(_a, 2), key = _b[0], prop = _b[1];
                    _this.containerWidget[key] = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        try {
                            if (_this[key]) {
                                return _this[key].apply(_this, args);
                            }
                        }
                        catch (e) {
                            console.warn("error in executing prefab-" + _this.prefabName + " method-" + key);
                        }
                    };
                });
            }
            _this.containerWidget.setProps(config);
            // Reassigning the proxy handler for prefab inbound properties as we
            // will get them only after the prefab config call.
            if (isIE()) {
                _this.containerWidget.widget = _this.containerWidget.createProxy();
            }
        });
    };
    BasePrefabComponent.prototype.initVariables = function () {
        var _this = this;
        var variablesService = this.injector.get(VariablesService);
        // get variables and actions instances for the page
        var variableCollection = variablesService.register(this.prefabName, this.getVariables(), this);
        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        this.Variables = {};
        this.Actions = {};
        // assign all the page variables to the pageInstance
        Object.entries(variableCollection.Variables).forEach(function (_a) {
            var _b = tslib_1.__read(_a, 2), name = _b[0], variable = _b[1];
            return _this.Variables[name] = variable;
        });
        Object.entries(variableCollection.Actions).forEach(function (_a) {
            var _b = tslib_1.__read(_a, 2), name = _b[0], action = _b[1];
            return _this.Actions[name] = action;
        });
        this.viewInit$.subscribe(noop, noop, function () {
            variableCollection.callback(variableCollection.Variables).catch(noop);
            variableCollection.callback(variableCollection.Actions);
        });
    };
    BasePrefabComponent.prototype.invokeOnReady = function () {
        // triggering watchers so variables and propertiers watching over an expression are updated
        $invokeWatchers(true, true);
        this.onReady();
        if (this.getContainerWidgetInjector().view.component.resolveFragment) {
            this.getContainerWidgetInjector().view.component.resolveFragment();
        }
        this.containerWidget.invokeEventCallback('load');
    };
    BasePrefabComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.viewInit$.complete();
        this.registerChangeListeners();
        setTimeout(function () {
            _this.fragmentsLoaded$.subscribe(noop, noop, function () { return _this.invokeOnReady(); });
        }, 100);
    };
    BasePrefabComponent.prototype.ngOnDestroy = function () {
        this.containerWidget.invokeEventCallback('destroy');
        this.destroy$.complete();
    };
    // user overrides this
    BasePrefabComponent.prototype.onPropertyChange = function () { };
    BasePrefabComponent.prototype.onReady = function () { };
    return BasePrefabComponent;
}(FragmentMonitor));
export { BasePrefabComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1wcmVmYWIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbImNvbXBvbmVudHMvYmFzZS1wcmVmYWIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRS9CLE9BQU8sRUFBRSxNQUFNLEVBQUUsbUJBQW1CLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUN2RyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWpELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzFFLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUl6RDtJQUFrRCwrQ0FBZTtJQUFqRTtRQUFBLHFFQThLQztRQWpLRyxjQUFRLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUN6QixlQUFTLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQzs7SUFnSzlCLENBQUM7SUEzSkcsd0RBQTBCLEdBQTFCO1FBQ0ksT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQztJQUNyRSxDQUFDO0lBRUQsa0NBQUksR0FBSjtRQUNJLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFbEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMs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LGlCQU1DO1FBTEcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUMvQixVQUFVLENBQUM7WUFDUCxLQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxhQUFhLEVBQUUsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDO1FBQzVFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNaLENBQUM7SUFFRCx5Q0FBVyxHQUFYO1FBQ0ksSUFBSSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRCxzQkFBc0I7SUFDdEIsOENBQWdCLEdBQWhCLGNBQW9CLENBQUM7SUFFckIscUNBQU8sR0FBUCxjQUFXLENBQUM7SUFFaEIsMEJBQUM7QUFBRCxDQUFDLEFBOUtELENBQWtELGVBQWUsR0E4S2hFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgSW5qZWN0b3IsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyAkd2F0Y2gsIEFic3RyYWN0STE4blNlcnZpY2UsIEFwcCwgaXNJRSwgbm9vcCwgVXRpbHNTZXJ2aWNlLCAkaW52b2tlV2F0Y2hlcnMgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBXaWRnZXRSZWYgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5pbXBvcnQgeyBWYXJpYWJsZXNTZXJ2aWNlIH0gZnJvbSAnQHdtL3ZhcmlhYmxlcyc7XG5cbmltcG9ydCB7IFByZWZhYk1hbmFnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvcHJlZmFiLW1hbmFnZXIuc2VydmljZSc7XG5pbXBvcnQge0ZyYWdtZW50TW9uaXRvcn0gZnJvbSBcIi4uL3V0aWwvZnJhZ21lbnQtbW9uaXRvclwiO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlUHJlZmFiQ29tcG9uZW50IGV4dGVuZHMgRnJhZ21lbnRNb25pdG9yIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgICBXaWRnZXRzOiBhbnk7XG4gICAgVmFyaWFibGVzOiBhbnk7XG4gICAgQWN0aW9uczogYW55O1xuICAgIEFwcDogQXBwO1xuICAgIGluamVjdG9yOiBJbmplY3RvcjtcbiAgICBjb250YWluZXJXaWRnZXQ6IGFueTtcbiAgICBwcmVmYWJNbmdyOiBQcmVmYWJNYW5hZ2VyU2VydmljZTtcbiAgICBkaXNwbGF5TmFtZTogc3RyaW5nO1xuICAgIHByZWZhYk5hbWU6IHN0cmluZztcbiAgICBpMThuU2VydmljZTogQWJzdHJhY3RJMThuU2VydmljZTtcbiAgICBhcHBMb2NhbGU6IGFueTtcblxuICAgIGRlc3Ryb3kkID0gbmV3IFN1YmplY3QoKTtcbiAgICB2aWV3SW5pdCQgPSBuZXcgU3ViamVjdCgpO1xuXG4gICAgYWJzdHJhY3QgZXZhbFVzZXJTY3JpcHQocHJlZmFiQ29udGV4dDogYW55LCBhcHBDb250ZXh0OiBhbnksIHV0aWxzOiBhbnkpO1xuICAgIGFic3RyYWN0IGdldFZhcmlhYmxlcygpO1xuXG4gICAgZ2V0Q29udGFpbmVyV2lkZ2V0SW5qZWN0b3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lcldpZGdldC5pbmogfHwgdGhpcy5jb250YWluZXJXaWRnZXQuaW5qZWN0b3I7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5BcHAgPSB0aGlzLmluamVjdG9yLmdldChBcHApO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyV2lkZ2V0ID0gdGhpcy5pbmplY3Rvci5nZXQoV2lkZ2V0UmVmKTtcbiAgICAgICAgdGhpcy5wcmVmYWJNbmdyID0gdGhpcy5pbmplY3Rvci5nZXQoUHJlZmFiTWFuYWdlclNlcnZpY2UpO1xuICAgICAgICB0aGlzLmkxOG5TZXJ2aWNlID0gdGhpcy5pbmplY3Rvci5nZXQoQWJzdHJhY3RJMThuU2VydmljZSk7XG4gICAgICAgIGlmICh0aGlzLmdldENvbnRhaW5lcldpZGdldEluamVjdG9yKCkudmlldy5jb21wb25lbnQucmVnaXN0ZXJGcmFnbWVudCkge1xuICAgICAgICAgICAgdGhpcy5nZXRDb250YWluZXJXaWRnZXRJbmplY3RvcigpLnZpZXcuY29tcG9uZW50LnJlZ2lzdGVyRnJhZ21lbnQoKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbml0VXNlclNjcmlwdCgpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJXaWRnZXRzKCk7XG4gICAgICAgIHRoaXMuaW5pdFZhcmlhYmxlcygpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyUHJvcHMoKTtcbiAgICAgICAgdGhpcy5kZWZpbmVJMThuUHJvcHMoKTtcbiAgICAgICAgc3VwZXIuaW5pdCgpO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyV2lkZ2V0cygpIHtcbiAgICAgICAgdGhpcy5XaWRnZXRzID0ge307XG4gICAgfVxuXG4gICAgaW5pdFVzZXJTY3JpcHQoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmV2YWxVc2VyU2NyaXB0KHRoaXMsIHRoaXMuQXBwLCB0aGlzLmluamVjdG9yLmdldChVdGlsc1NlcnZpY2UpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gZXZhbHVhdGluZyBwcmVmYWIgKCR7dGhpcy5wcmVmYWJOYW1lfSkgc2NyaXB0XFxuYCwgZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWdpc3RlckNoYW5nZUxpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJXaWRnZXQucmVnaXN0ZXJQcm9wZXJ0eUNoYW5nZUxpc3RlbmVyKHRoaXMub25Qcm9wZXJ0eUNoYW5nZSk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyV2lkZ2V0LnJlZ2lzdGVyU3R5bGVDaGFuZ2VMaXN0ZW5lcih0aGlzLm9uUHJvcGVydHlDaGFuZ2UpO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKGZuOiBGdW5jdGlvbikge1xuICAgICAgICB0aGlzLmRlc3Ryb3kkLnN1YnNjcmliZShub29wLCBub29wLCAoKSA9PiBmbigpKTtcbiAgICB9XG5cbiAgICBkZWZpbmVJMThuUHJvcHMoKSB7XG4gICAgICAgIHRoaXMuYXBwTG9jYWxlID0gdGhpcy5pMThuU2VydmljZS5nZXRQcmVmYWJMb2NhbGVCdW5kbGUodGhpcy5wcmVmYWJOYW1lKTtcbiAgICB9XG5cbiAgICByZWdpc3RlclByb3BzKCkge1xuICAgICAgICB0aGlzLnByZWZhYk1uZ3IuZ2V0Q29uZmlnKHRoaXMucHJlZmFiTmFtZSlcbiAgICAgICAgICAgIC50aGVuKGNvbmZpZyA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheU5hbWUgPSBjb25maWcuZGlzcGxheU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKChjb25maWcucHJvcGVydGllcyB8fCB7fSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCgoW2tleSwgcHJvcF06IFtzdHJpbmcsIGFueV0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXhwcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IF8udHJpbShwcm9wLnZhbHVlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfLnN0YXJ0c1dpdGgodmFsdWUsICdiaW5kOicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cHIgPSB2YWx1ZS5yZXBsYWNlKCdiaW5kOicsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywga2V5LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldDogKCkgPT4gdGhpcy5jb250YWluZXJXaWRnZXRba2V5XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0OiBudiA9PiB0aGlzLmNvbnRhaW5lcldpZGdldC53aWRnZXRba2V5XSA9IG52XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXhwcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdhdGNoKGV4cHIsIHRoaXMsIHt9LCBudiA9PiB0aGlzLmNvbnRhaW5lcldpZGdldC53aWRnZXRba2V5XSA9IG52KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKChjb25maWcuZXZlbnRzIHx8IHt9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKChba2V5LCBwcm9wXTogW3N0cmluZywgYW55XSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNba2V5XSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IGtleS5zdWJzdHIoMikudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJXaWRnZXQuaW52b2tlRXZlbnRDYWxsYmFjayhldmVudE5hbWUsIHskZXZlbnQ6IGFyZ3NbMF0sICRkYXRhOiBhcmdzWzFdfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKChjb25maWcubWV0aG9kcyB8fCB7fSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCgoW2tleSwgcHJvcF06IFtzdHJpbmcsIGFueV0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lcldpZGdldFtrZXldID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1trZXldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGVycm9yIGluIGV4ZWN1dGluZyBwcmVmYWItJHt0aGlzLnByZWZhYk5hbWV9IG1ldGhvZC0ke2tleX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJXaWRnZXQuc2V0UHJvcHMoY29uZmlnKTtcbiAgICAgICAgICAgICAgICAvLyBSZWFzc2lnbmluZyB0aGUgcHJveHkgaGFuZGxlciBmb3IgcHJlZmFiIGluYm91bmQgcHJvcGVydGllcyBhcyB3ZVxuICAgICAgICAgICAgICAgIC8vIHdpbGwgZ2V0IHRoZW0gb25seSBhZnRlciB0aGUgcHJlZmFiIGNvbmZpZyBjYWxsLlxuICAgICAgICAgICAgICAgIGlmIChpc0lFKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJXaWRnZXQud2lkZ2V0ID0gdGhpcy5jb250YWluZXJXaWRnZXQuY3JlYXRlUHJveHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0VmFyaWFibGVzKCkge1xuICAgICAgICBjb25zdCB2YXJpYWJsZXNTZXJ2aWNlID0gdGhpcy5pbmplY3Rvci5nZXQoVmFyaWFibGVzU2VydmljZSk7XG5cbiAgICAgICAgLy8gZ2V0IHZhcmlhYmxlcyBhbmQgYWN0aW9ucyBpbnN0YW5jZXMgZm9yIHRoZSBwYWdlXG4gICAgICAgIGNvbnN0IHZhcmlhYmxlQ29sbGVjdGlvbiA9IHZhcmlhYmxlc1NlcnZpY2UucmVnaXN0ZXIodGhpcy5wcmVmYWJOYW1lLCB0aGlzLmdldFZhcmlhYmxlcygpLCB0aGlzKTtcblxuICAgICAgICAvLyBjcmVhdGUgbmFtZXNwYWNlIGZvciBWYXJpYWJsZXMgbmFkIEFjdGlvbnMgb24gcGFnZS9wYXJ0aWFsLCB3aGljaCBpbmhlcml0cyB0aGUgVmFyaWFibGVzIGFuZCBBY3Rpb25zIGZyb20gQXBwIGluc3RhbmNlXG4gICAgICAgIHRoaXMuVmFyaWFibGVzID0ge307XG4gICAgICAgIHRoaXMuQWN0aW9ucyA9IHt9O1xuXG4gICAgICAgIC8vIGFzc2lnbiBhbGwgdGhlIHBhZ2UgdmFyaWFibGVzIHRvIHRoZSBwYWdlSW5zdGFuY2VcbiAgICAgICAgT2JqZWN0LmVudHJpZXModmFyaWFibGVDb2xsZWN0aW9uLlZhcmlhYmxlcykuZm9yRWFjaCgoW25hbWUsIHZhcmlhYmxlXSkgPT4gdGhpcy5WYXJpYWJsZXNbbmFtZV0gPSB2YXJpYWJsZSk7XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHZhcmlhYmxlQ29sbGVjdGlvbi5BY3Rpb25zKS5mb3JFYWNoKChbbmFtZSwgYWN0aW9uXSkgPT4gdGhpcy5BY3Rpb25zW25hbWVdID0gYWN0aW9uKTtcblxuXG4gICAgICAgIHRoaXMudmlld0luaXQkLnN1YnNjcmliZShub29wLCBub29wLCAoKSA9PiB7XG4gICAgICAgICAgICB2YXJpYWJsZUNvbGxlY3Rpb24uY2FsbGJhY2sodmFyaWFibGVDb2xsZWN0aW9uLlZhcmlhYmxlcykuY2F0Y2gobm9vcCk7XG4gICAgICAgICAgICB2YXJpYWJsZUNvbGxlY3Rpb24uY2FsbGJhY2sodmFyaWFibGVDb2xsZWN0aW9uLkFjdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbnZva2VPblJlYWR5KCkge1xuICAgICAgICAvLyB0cmlnZ2VyaW5nIHdhdGNoZXJzIHNvIHZhcmlhYmxlcyBhbmQgcHJvcGVydGllcnMgd2F0Y2hpbmcgb3ZlciBhbiBleHByZXNzaW9uIGFyZSB1cGRhdGVkXG4gICAgICAgICRpbnZva2VXYXRjaGVycyh0cnVlLCB0cnVlKTtcbiAgICAgICAgdGhpcy5vblJlYWR5KCk7XG4gICAgICAgIGlmICh0aGlzLmdldENvbnRhaW5lcldpZGdldEluamVjdG9yKCkudmlldy5jb21wb25lbnQucmVzb2x2ZUZyYWdtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmdldENvbnRhaW5lcldpZGdldEluamVjdG9yKCkudmlldy5jb21wb25lbnQucmVzb2x2ZUZyYWdtZW50KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250YWluZXJXaWRnZXQuaW52b2tlRXZlbnRDYWxsYmFjaygnbG9hZCcpO1xuICAgIH1cblxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnZpZXdJbml0JC5jb21wbGV0ZSgpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQ2hhbmdlTGlzdGVuZXJzKCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5mcmFnbWVudHNMb2FkZWQkLnN1YnNjcmliZShub29wLCBub29wLCAoKSA9PiB0aGlzLmludm9rZU9uUmVhZHkoKSk7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyV2lkZ2V0Lmludm9rZUV2ZW50Q2FsbGJhY2soJ2Rlc3Ryb3knKTtcbiAgICAgICAgdGhpcy5kZXN0cm95JC5jb21wbGV0ZSgpO1xuICAgIH1cblxuICAgIC8vIHVzZXIgb3ZlcnJpZGVzIHRoaXNcbiAgICBvblByb3BlcnR5Q2hhbmdlKCkge31cblxuICAgIG9uUmVhZHkoKSB7fVxuXG59XG4iXX0=