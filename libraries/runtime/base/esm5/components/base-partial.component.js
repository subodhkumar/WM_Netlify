import * as tslib_1 from "tslib";
import { Subject } from 'rxjs';
import { AbstractI18nService, App, noop, UtilsService } from '@wm/core';
import { WidgetRef } from '@wm/components';
import { VariablesService } from '@wm/variables';
import { FragmentMonitor } from '../util/fragment-monitor';
import { $invokeWatchers } from '@wm/core';
export var commonPartialWidgets = {};
var BasePartialComponent = /** @class */ (function (_super) {
    tslib_1.__extends(BasePartialComponent, _super);
    function BasePartialComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.destroy$ = new Subject();
        _this.viewInit$ = new Subject();
        return _this;
    }
    BasePartialComponent.prototype.getContainerWidgetInjector = function () {
        return this.containerWidget.inj || this.containerWidget.injector;
    };
    BasePartialComponent.prototype.init = function () {
        var _this = this;
        this.App = this.injector.get(App);
        this.containerWidget = this.injector.get(WidgetRef);
        this.i18nService = this.injector.get(AbstractI18nService);
        if (this.getContainerWidgetInjector().view.component.registerFragment) {
            this.getContainerWidgetInjector().view.component.registerFragment();
        }
        this.initUserScript();
        this.registerWidgets();
        this.initVariables();
        this.activePageName = this.App.activePageName; // Todo: remove this
        this.registerPageParams();
        this.defineI18nProps();
        this.viewInit$.subscribe(noop, noop, function () {
            _this.pageParams = _this.containerWidget.partialParams;
        });
        _super.prototype.init.call(this);
    };
    BasePartialComponent.prototype.registerWidgets = function () {
        if (this.partialName === 'Common') {
            this.Widgets = commonPartialWidgets;
        }
        else {
            this.Widgets = Object.create(commonPartialWidgets);
        }
        this.containerWidget.Widgets = this.Widgets;
    };
    BasePartialComponent.prototype.registerDestroyListener = function (fn) {
        this.destroy$.subscribe(noop, noop, function () { return fn(); });
    };
    BasePartialComponent.prototype.initUserScript = function () {
        try {
            this.evalUserScript(this, this.App, this.injector.get(UtilsService));
        }
        catch (e) {
            console.error("Error in evaluating partial (" + this.partialName + ") script\n", e);
        }
    };
    BasePartialComponent.prototype.initVariables = function () {
        var _this = this;
        var variablesService = this.injector.get(VariablesService);
        // get variables and actions instances for the page
        var variableCollection = variablesService.register(this.partialName, this.getVariables(), this);
        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        this.Variables = Object.create(this.App.Variables);
        this.Actions = Object.create(this.App.Actions);
        this.containerWidget.Variables = this.Variables;
        this.containerWidget.Actions = this.Actions;
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
            // TEMP: triggering watchers so variables watching over params are updated
            $invokeWatchers(true, true);
            variableCollection.callback(variableCollection.Variables).catch(noop);
            variableCollection.callback(variableCollection.Actions);
        });
    };
    BasePartialComponent.prototype.registerPageParams = function () {
        this.pageParams = this.containerWidget.partialParams;
    };
    BasePartialComponent.prototype.defineI18nProps = function () {
        this.appLocale = this.i18nService.getAppLocale();
    };
    BasePartialComponent.prototype.invokeOnReady = function () {
        this.onReady();
        if (this.getContainerWidgetInjector().view.component.resolveFragment) {
            this.getContainerWidgetInjector().view.component.resolveFragment();
        }
    };
    BasePartialComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        setTimeout(function () {
            _this.viewInit$.complete();
            _this.fragmentsLoaded$.subscribe(noop, noop, function () { return _this.invokeOnReady(); });
        }, 100);
    };
    BasePartialComponent.prototype.ngOnDestroy = function () {
        this.destroy$.complete();
    };
    BasePartialComponent.prototype.onReady = function () {
    };
    return BasePartialComponent;
}(FragmentMonitor));
export { BasePartialComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1wYXJ0aWFsLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJjb21wb25lbnRzL2Jhc2UtcGFydGlhbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUdBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFL0IsT0FBTyxFQUFFLG1CQUFtQixFQUE2QixHQUFHLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNuRyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWpELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUUzRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTNDLE1BQU0sQ0FBQyxJQUFNLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztBQUV2QztJQUFtRCxnREFBZTtJQUFsRTtRQUFBLHFFQW9JQztRQW5IRyxjQUFRLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUN6QixlQUFTLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQzs7SUFrSDlCLENBQUM7SUE1R0cseURBQTBCLEdBQTFCO1FBQ0ksT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQztJQUNyRSxDQUFDO0lBRUQsbUNBQUksR0FBSjtRQUFBLGlCQXdCQztRQXRCRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFdBQVcs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QUFlLEVBQUUsQ0FBQztTQUN0RTtJQUNMLENBQUM7SUFFRCw4Q0FBZSxHQUFmO1FBQUEsaUJBT0M7UUFORyxVQUFVLENBQUM7WUFDUCxLQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTFCLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLGFBQWEsRUFBRSxFQUFwQixDQUFvQixDQUFDLENBQUM7UUFFNUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUVELDBDQUFXLEdBQVg7UUFDSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRCxzQ0FBTyxHQUFQO0lBQ0EsQ0FBQztJQUNMLDJCQUFDO0FBQUQsQ0FBQyxBQXBJRCxDQUFtRCxlQUFlLEdBb0lqRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIEluamVjdG9yLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlLCBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IEFic3RyYWN0STE4blNlcnZpY2UsIEFic3RyYWN0TmF2aWdhdGlvblNlcnZpY2UsIEFwcCwgbm9vcCwgVXRpbHNTZXJ2aWNlIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgV2lkZ2V0UmVmIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuaW1wb3J0IHsgVmFyaWFibGVzU2VydmljZSB9IGZyb20gJ0B3bS92YXJpYWJsZXMnO1xuXG5pbXBvcnQgeyBGcmFnbWVudE1vbml0b3IgfSBmcm9tICcuLi91dGlsL2ZyYWdtZW50LW1vbml0b3InO1xuaW1wb3J0IHsgQXBwTWFuYWdlclNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9hcHAubWFuYWdlci5zZXJ2aWNlJztcbmltcG9ydCB7ICRpbnZva2VXYXRjaGVycyB9IGZyb20gJ0B3bS9jb3JlJztcblxuZXhwb3J0IGNvbnN0IGNvbW1vblBhcnRpYWxXaWRnZXRzID0ge307XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlUGFydGlhbENvbXBvbmVudCBleHRlbmRzIEZyYWdtZW50TW9uaXRvciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gICAgV2lkZ2V0czogYW55O1xuICAgIFZhcmlhYmxlczogYW55O1xuICAgIEFjdGlvbnM6IGFueTtcbiAgICBBcHA6IEFwcDtcbiAgICBpbmplY3RvcjogSW5qZWN0b3I7XG4gICAgcGFydGlhbE5hbWU6IHN0cmluZztcbiAgICBhY3RpdmVQYWdlTmFtZTogc3RyaW5nO1xuICAgIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZTtcbiAgICBhcHBNYW5hZ2VyOiBBcHBNYW5hZ2VyU2VydmljZTtcbiAgICBuYXZpZ2F0aW9uU2VydmljZTogQWJzdHJhY3ROYXZpZ2F0aW9uU2VydmljZTtcbiAgICByb3V0ZXI6IFJvdXRlcjtcbiAgICBwYWdlUGFyYW1zOiBhbnk7XG4gICAgY29udGFpbmVyV2lkZ2V0OiBhbnk7XG4gICAgaTE4blNlcnZpY2U6IEFic3RyYWN0STE4blNlcnZpY2U7XG4gICAgYXBwTG9jYWxlOiBhbnk7XG5cbiAgICBkZXN0cm95JCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdmlld0luaXQkID0gbmV3IFN1YmplY3QoKTtcblxuICAgIGFic3RyYWN0IGV2YWxVc2VyU2NyaXB0KHByZWZhYkNvbnRleHQ6IGFueSwgYXBwQ29udGV4dDogYW55LCB1dGlsczogYW55KTtcblxuICAgIGFic3RyYWN0IGdldFZhcmlhYmxlcygpO1xuXG4gICAgZ2V0Q29udGFpbmVyV2lkZ2V0SW5qZWN0b3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lcldpZGdldC5pbmogfHwgdGhpcy5jb250YWluZXJXaWRnZXQuaW5qZWN0b3I7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcblxuICAgICAgICB0aGlzLkFwcCA9IHRoaXMuaW5qZWN0b3IuZ2V0KEFwcCk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyV2lkZ2V0ID0gdGhpcy5pbmplY3Rvci5nZXQoV2lkZ2V0UmVmKTtcbiAgICAgICAgdGhpcy5pMThuU2VydmljZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KEFic3RyYWN0STE4blNlcnZpY2UpO1xuICAgICAgICBpZiAodGhpcy5nZXRDb250YWluZXJXaWRnZXRJbmplY3RvcigpLnZpZXcuY29tcG9uZW50LnJlZ2lzdGVyRnJhZ21lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29udGFpbmVyV2lkZ2V0SW5qZWN0b3IoKS52aWV3LmNvbXBvbmVudC5yZWdpc3RlckZyYWdtZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluaXRVc2VyU2NyaXB0KCk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlcldpZGdldHMoKTtcbiAgICAgICAgdGhpcy5pbml0VmFyaWFibGVzKCk7XG5cbiAgICAgICAgdGhpcy5hY3RpdmVQYWdlTmFtZSA9IHRoaXMuQXBwLmFjdGl2ZVBhZ2VOYW1lOyAvLyBUb2RvOiByZW1vdmUgdGhpc1xuICAgICAgICB0aGlzLnJlZ2lzdGVyUGFnZVBhcmFtcygpO1xuXG4gICAgICAgIHRoaXMuZGVmaW5lSTE4blByb3BzKCk7XG5cbiAgICAgICAgdGhpcy52aWV3SW5pdCQuc3Vic2NyaWJlKG5vb3AsIG5vb3AsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGFnZVBhcmFtcyA9IHRoaXMuY29udGFpbmVyV2lkZ2V0LnBhcnRpYWxQYXJhbXM7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN1cGVyLmluaXQoKTtcbiAgICB9XG5cbiAgICByZWdpc3RlcldpZGdldHMoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcnRpYWxOYW1lID09PSAnQ29tbW9uJykge1xuICAgICAgICAgICAgdGhpcy5XaWRnZXRzID0gY29tbW9uUGFydGlhbFdpZGdldHM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLldpZGdldHMgPSBPYmplY3QuY3JlYXRlKGNvbW1vblBhcnRpYWxXaWRnZXRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29udGFpbmVyV2lkZ2V0LldpZGdldHMgPSB0aGlzLldpZGdldHM7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoZm46IEZ1bmN0aW9uKSB7XG4gICAgICAgIHRoaXMuZGVzdHJveSQuc3Vic2NyaWJlKG5vb3AsIG5vb3AsICgpID0+IGZuKCkpO1xuICAgIH1cblxuICAgIGluaXRVc2VyU2NyaXB0KCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5ldmFsVXNlclNjcmlwdCh0aGlzLCB0aGlzLkFwcCwgdGhpcy5pbmplY3Rvci5nZXQoVXRpbHNTZXJ2aWNlKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluIGV2YWx1YXRpbmcgcGFydGlhbCAoJHt0aGlzLnBhcnRpYWxOYW1lfSkgc2NyaXB0XFxuYCwgZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0VmFyaWFibGVzKCkge1xuICAgICAgICBjb25zdCB2YXJpYWJsZXNTZXJ2aWNlID0gdGhpcy5pbmplY3Rvci5nZXQoVmFyaWFibGVzU2VydmljZSk7XG5cbiAgICAgICAgLy8gZ2V0IHZhcmlhYmxlcyBhbmQgYWN0aW9ucyBpbnN0YW5jZXMgZm9yIHRoZSBwYWdlXG4gICAgICAgIGNvbnN0IHZhcmlhYmxlQ29sbGVjdGlvbiA9IHZhcmlhYmxlc1NlcnZpY2UucmVnaXN0ZXIodGhpcy5wYXJ0aWFsTmFtZSwgdGhpcy5nZXRWYXJpYWJsZXMoKSwgdGhpcyk7XG5cbiAgICAgICAgLy8gY3JlYXRlIG5hbWVzcGFjZSBmb3IgVmFyaWFibGVzIG5hZCBBY3Rpb25zIG9uIHBhZ2UvcGFydGlhbCwgd2hpY2ggaW5oZXJpdHMgdGhlIFZhcmlhYmxlcyBhbmQgQWN0aW9ucyBmcm9tIEFwcCBpbnN0YW5jZVxuICAgICAgICB0aGlzLlZhcmlhYmxlcyA9IE9iamVjdC5jcmVhdGUodGhpcy5BcHAuVmFyaWFibGVzKTtcbiAgICAgICAgdGhpcy5BY3Rpb25zID0gT2JqZWN0LmNyZWF0ZSh0aGlzLkFwcC5BY3Rpb25zKTtcblxuICAgICAgICB0aGlzLmNvbnRhaW5lcldpZGdldC5WYXJpYWJsZXMgPSB0aGlzLlZhcmlhYmxlcztcbiAgICAgICAgdGhpcy5jb250YWluZXJXaWRnZXQuQWN0aW9ucyA9IHRoaXMuQWN0aW9ucztcblxuICAgICAgICAvLyBhc3NpZ24gYWxsIHRoZSBwYWdlIHZhcmlhYmxlcyB0byB0aGUgcGFnZUluc3RhbmNlXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHZhcmlhYmxlQ29sbGVjdGlvbi5WYXJpYWJsZXMpLmZvckVhY2goKFtuYW1lLCB2YXJpYWJsZV0pID0+IHRoaXMuVmFyaWFibGVzW25hbWVdID0gdmFyaWFibGUpO1xuICAgICAgICBPYmplY3QuZW50cmllcyh2YXJpYWJsZUNvbGxlY3Rpb24uQWN0aW9ucykuZm9yRWFjaCgoW25hbWUsIGFjdGlvbl0pID0+IHRoaXMuQWN0aW9uc1tuYW1lXSA9IGFjdGlvbik7XG5cblxuICAgICAgICB0aGlzLnZpZXdJbml0JC5zdWJzY3JpYmUobm9vcCwgbm9vcCwgKCkgPT4ge1xuICAgICAgICAgICAgLy8gVEVNUDogdHJpZ2dlcmluZyB3YXRjaGVycyBzbyB2YXJpYWJsZXMgd2F0Y2hpbmcgb3ZlciBwYXJhbXMgYXJlIHVwZGF0ZWRcbiAgICAgICAgICAgICRpbnZva2VXYXRjaGVycyh0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgIHZhcmlhYmxlQ29sbGVjdGlvbi5jYWxsYmFjayh2YXJpYWJsZUNvbGxlY3Rpb24uVmFyaWFibGVzKS5jYXRjaChub29wKTtcbiAgICAgICAgICAgIHZhcmlhYmxlQ29sbGVjdGlvbi5jYWxsYmFjayh2YXJpYWJsZUNvbGxlY3Rpb24uQWN0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyUGFnZVBhcmFtcygpIHtcbiAgICAgICAgdGhpcy5wYWdlUGFyYW1zID0gdGhpcy5jb250YWluZXJXaWRnZXQucGFydGlhbFBhcmFtcztcbiAgICB9XG5cbiAgICBkZWZpbmVJMThuUHJvcHMoKSB7XG4gICAgICAgIHRoaXMuYXBwTG9jYWxlID0gdGhpcy5pMThuU2VydmljZS5nZXRBcHBMb2NhbGUoKTtcbiAgICB9XG5cbiAgICBpbnZva2VPblJlYWR5KCkge1xuICAgICAgICB0aGlzLm9uUmVhZHkoKTtcbiAgICAgICAgaWYgKHRoaXMuZ2V0Q29udGFpbmVyV2lkZ2V0SW5qZWN0b3IoKS52aWV3LmNvbXBvbmVudC5yZXNvbHZlRnJhZ21lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29udGFpbmVyV2lkZ2V0SW5qZWN0b3IoKS52aWV3LmNvbXBvbmVudC5yZXNvbHZlRnJhZ21lbnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZpZXdJbml0JC5jb21wbGV0ZSgpO1xuXG4gICAgICAgICAgICB0aGlzLmZyYWdtZW50c0xvYWRlZCQuc3Vic2NyaWJlKG5vb3AsIG5vb3AsICgpID0+IHRoaXMuaW52b2tlT25SZWFkeSgpKTtcblxuICAgICAgICB9LCAxMDApO1xuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmRlc3Ryb3kkLmNvbXBsZXRlKCk7XG4gICAgfVxuXG4gICAgb25SZWFkeSgpIHtcbiAgICB9XG59XG4iXX0=