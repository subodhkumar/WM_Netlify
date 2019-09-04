import * as tslib_1 from "tslib";
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AbstractI18nService, AbstractNavigationService, App, isMobileApp, muteWatchers, noop, unMuteWatchers, UtilsService } from '@wm/core';
import { commonPartialWidgets } from './base-partial.component';
import { VariablesService } from '@wm/variables';
import { AppManagerService } from '../services/app.manager.service';
import { FragmentMonitor } from '../util/fragment-monitor';
var BasePageComponent = /** @class */ (function (_super) {
    tslib_1.__extends(BasePageComponent, _super);
    function BasePageComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.startupVariablesLoaded = false;
        _this.pageTransitionCompleted = false;
        _this.destroy$ = new Subject();
        _this.viewInit$ = new Subject();
        return _this;
    }
    BasePageComponent.prototype.init = function () {
        muteWatchers();
        this.App = this.injector.get(App);
        this.route = this.injector.get(ActivatedRoute);
        this.appManager = this.injector.get(AppManagerService);
        this.navigationService = this.injector.get(AbstractNavigationService);
        this.i18nService = this.injector.get(AbstractI18nService);
        this.router = this.injector.get(Router);
        this.initUserScript();
        this.registerWidgets();
        this.initVariables();
        this.App.lastActivePageName = this.App.activePageName;
        this.App.activePageName = this.pageName;
        this.App.activePage = this;
        this.activePageName = this.pageName; // Todo: remove this
        this.registerPageParams();
        this.defineI18nProps();
        _super.prototype.init.call(this);
    };
    BasePageComponent.prototype.registerWidgets = function () {
        // common partial widgets should be accessible from page
        this.Widgets = Object.create(commonPartialWidgets);
        // expose current page widgets on app
        this.App.Widgets = Object.create(this.Widgets);
    };
    BasePageComponent.prototype.initUserScript = function () {
        try {
            this.evalUserScript(this, this.App, this.injector.get(UtilsService));
        }
        catch (e) {
            console.error("Error in evaluating page (" + this.pageName + ") script\n", e);
        }
    };
    BasePageComponent.prototype.registerPageParams = function () {
        var _this = this;
        var subscription = this.route.queryParams.subscribe(function (params) { return _this.pageParams = params; });
        this.registerDestroyListener(function () { return subscription.unsubscribe(); });
    };
    BasePageComponent.prototype.registerDestroyListener = function (fn) {
        this.destroy$.subscribe(noop, noop, function () { return fn(); });
    };
    BasePageComponent.prototype.defineI18nProps = function () {
        this.appLocale = this.i18nService.getAppLocale();
    };
    BasePageComponent.prototype.initVariables = function () {
        var _this = this;
        var variablesService = this.injector.get(VariablesService);
        // get variables and actions instances for the page
        var variableCollection = variablesService.register(this.pageName, this.getVariables(), this);
        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        this.Variables = Object.create(this.App.Variables);
        this.Actions = Object.create(this.App.Actions);
        // assign all the page variables to the pageInstance
        Object.entries(variableCollection.Variables).forEach(function (_a) {
            var _b = tslib_1.__read(_a, 2), name = _b[0], variable = _b[1];
            return _this.Variables[name] = variable;
        });
        Object.entries(variableCollection.Actions).forEach(function (_a) {
            var _b = tslib_1.__read(_a, 2), name = _b[0], action = _b[1];
            return _this.Actions[name] = action;
        });
        var subscription = this.viewInit$.subscribe(noop, noop, function () {
            if (!_this.appManager.isAppVariablesFired()) {
                variableCollection.callback(_this.App.Variables).catch(noop).then(function () {
                    _this.appManager.notify('app-variables-data-loaded', { pageName: _this.pageName });
                });
                variableCollection.callback(_this.App.Actions);
                _this.appManager.appVariablesReady();
                _this.appManager.isAppVariablesFired(true);
            }
            variableCollection.callback(variableCollection.Variables)
                .catch(noop)
                .then(function () {
                _this.appManager.notify('page-variables-data-loaded', { pageName: _this.pageName });
                _this.startupVariablesLoaded = true;
                // hide the loader only after the some setTimeout for smooth page load.
                setTimeout(function () {
                    _this.showPageContent = true;
                }, 100);
            });
            variableCollection.callback(variableCollection.Actions);
            subscription.unsubscribe();
        });
    };
    BasePageComponent.prototype.runPageTransition = function (transition) {
        return new Promise(function (resolve) {
            var $target = $('app-page-outlet:first');
            if (transition) {
                var onTransitionEnd_1 = function () {
                    if (resolve) {
                        $target.off('animationend', onTransitionEnd_1);
                        $target.removeClass(transition);
                        $target.children().first().remove();
                        resolve();
                        resolve = null;
                    }
                };
                transition = 'page-transition page-transition-' + transition;
                $target.addClass(transition);
                $target.on('animationend', onTransitionEnd_1);
                // Wait for a maximum of 1 second for transition to end.
                setTimeout(onTransitionEnd_1, 1000);
            }
            else {
                resolve();
            }
        });
    };
    BasePageComponent.prototype.invokeOnReady = function () {
        this.onReady();
        (this.App.onPageReady || noop)(this.pageName, this);
        this.appManager.notify('pageReady', { 'name': this.pageName, instance: this });
    };
    BasePageComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        var transition = this.navigationService.getPageTransition();
        if (transition) {
            var pageOutlet = $('app-page-outlet:first');
            pageOutlet.prepend(pageOutlet.children().first().clone());
        }
        this.runPageTransition(transition).then(function () {
            _this.pageTransitionCompleted = true;
            _this.compilePageContent = true;
        });
        setTimeout(function () {
            unMuteWatchers();
            _this.viewInit$.complete();
            if (isMobileApp()) {
                _this.onPageContentReady = function () {
                    _this.fragmentsLoaded$.subscribe(noop, noop, function () {
                        _this.invokeOnReady();
                    });
                    _this.onPageContentReady = noop;
                };
            }
            else {
                _this.fragmentsLoaded$.subscribe(noop, noop, function () { return _this.invokeOnReady(); });
            }
        }, 300);
    };
    BasePageComponent.prototype.ngOnDestroy = function () {
        this.destroy$.complete();
    };
    BasePageComponent.prototype.onReady = function () { };
    BasePageComponent.prototype.onBeforePageLeave = function () { };
    BasePageComponent.prototype.onPageContentReady = function () { };
    return BasePageComponent;
}(FragmentMonitor));
export { BasePageComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1wYWdlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJjb21wb25lbnRzL2Jhc2UtcGFnZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLE9BQU8sRUFBRSxjQUFjLEVBQWlCLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRXhFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFL0IsT0FBTyxFQUNILG1CQUFtQixFQUNuQix5QkFBeUIsRUFFekIsR0FBRyxFQUNILFdBQVcsRUFDWCxZQUFZLEVBQ1osSUFBSSxFQUVKLGNBQWMsRUFDZCxZQUFZLEVBQ2YsTUFBTSxVQUFVLENBQUM7QUFDbEIsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHaEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUkzRDtJQUFnRCw2Q0FBZTtJQUEvRDtRQUFBLHFFQTZMQztRQTdLRyw0QkFBc0IsR0FBRyxLQUFLLENBQUM7UUFDL0IsNkJBQXVCLEdBQUcsS0FBSyxDQUFDO1FBRWhDLGNBQVEsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLGVBQVMsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDOztJQXlLOUIsQ0FBQztJQXBLRyxnQ0FBSSxHQUFKO1FBRUksWUFBWSxFQUFFLENBQUM7UUFFZixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFD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QUFFLENBQUMsQ0FBQztTQUM3RDtRQUNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDcEMsS0FBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQztZQUNuQyxLQUFZLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1FBQzVDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsVUFBVSxDQUFDO1lBQ1AsY0FBYyxFQUFFLENBQUM7WUFDakIsS0FBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMxQixJQUFJLFdBQVcsRUFBRSxFQUFFO2dCQUNmLEtBQUksQ0FBQyxrQkFBa0IsR0FBRztvQkFDdEIsS0FBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO3dCQUN4QyxLQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7b0JBQ3pCLENBQUMsQ0FBQyxDQUFDO29CQUNILEtBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7Z0JBQ25DLENBQUMsQ0FBQzthQUNMO2lCQUFNO2dCQUNILEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLGFBQWEsRUFBRSxFQUFwQixDQUFvQixDQUFDLENBQUM7YUFDM0U7UUFDTCxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDWixDQUFDO0lBRUQsdUNBQVcsR0FBWDtRQUNJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELG1DQUFPLEdBQVAsY0FBVyxDQUFDO0lBRVosNkNBQWlCLEdBQWpCLGNBQXFCLENBQUM7SUFFdEIsOENBQWtCLEdBQWxCLGNBQXNCLENBQUM7SUFDM0Isd0JBQUM7QUFBRCxDQUFDLEFBN0xELENBQWdELGVBQWUsR0E2TDlEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgSW5qZWN0b3IsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUsIE5hdmlnYXRpb25FbmQsIFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtcbiAgICBBYnN0cmFjdEkxOG5TZXJ2aWNlLFxuICAgIEFic3RyYWN0TmF2aWdhdGlvblNlcnZpY2UsXG4gICAgYWRkQ2xhc3MsXG4gICAgQXBwLFxuICAgIGlzTW9iaWxlQXBwLFxuICAgIG11dGVXYXRjaGVycyxcbiAgICBub29wLFxuICAgIHJlbW92ZUNsYXNzLFxuICAgIHVuTXV0ZVdhdGNoZXJzLFxuICAgIFV0aWxzU2VydmljZVxufSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBjb21tb25QYXJ0aWFsV2lkZ2V0cyB9IGZyb20gJy4vYmFzZS1wYXJ0aWFsLmNvbXBvbmVudCc7XG5cblxuaW1wb3J0IHsgVmFyaWFibGVzU2VydmljZSB9IGZyb20gJ0B3bS92YXJpYWJsZXMnO1xuaW1wb3J0IHsgQXBwTWFuYWdlclNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9hcHAubWFuYWdlci5zZXJ2aWNlJztcbmltcG9ydCB7IEZyYWdtZW50TW9uaXRvciB9IGZyb20gJy4uL3V0aWwvZnJhZ21lbnQtbW9uaXRvcic7XG5cbmRlY2xhcmUgY29uc3QgJDtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VQYWdlQ29tcG9uZW50IGV4dGVuZHMgRnJhZ21lbnRNb25pdG9yIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgICBXaWRnZXRzOiBhbnk7XG4gICAgVmFyaWFibGVzOiBhbnk7XG4gICAgQWN0aW9uczogYW55O1xuICAgIEFwcDogQXBwO1xuICAgIGluamVjdG9yOiBJbmplY3RvcjtcbiAgICBwYWdlTmFtZTogc3RyaW5nO1xuICAgIGFjdGl2ZVBhZ2VOYW1lOiBzdHJpbmc7XG4gICAgcm91dGU6IEFjdGl2YXRlZFJvdXRlO1xuICAgIGFwcE1hbmFnZXI6IEFwcE1hbmFnZXJTZXJ2aWNlO1xuICAgIG5hdmlnYXRpb25TZXJ2aWNlOiBBYnN0cmFjdE5hdmlnYXRpb25TZXJ2aWNlO1xuICAgIHJvdXRlcjogUm91dGVyO1xuICAgIHBhZ2VQYXJhbXM6IGFueTtcbiAgICBzaG93UGFnZUNvbnRlbnQ6IGJvb2xlYW47XG4gICAgaTE4blNlcnZpY2U6IEFic3RyYWN0STE4blNlcnZpY2U7XG4gICAgYXBwTG9jYWxlOiBhbnk7XG4gICAgc3RhcnR1cFZhcmlhYmxlc0xvYWRlZCA9IGZhbHNlO1xuICAgIHBhZ2VUcmFuc2l0aW9uQ29tcGxldGVkID0gZmFsc2U7XG5cbiAgICBkZXN0cm95JCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdmlld0luaXQkID0gbmV3IFN1YmplY3QoKTtcblxuICAgIGFic3RyYWN0IGV2YWxVc2VyU2NyaXB0KHByZWZhYkNvbnRleHQ6IGFueSwgYXBwQ29udGV4dDogYW55LCB1dGlsczogYW55KTtcbiAgICBhYnN0cmFjdCBnZXRWYXJpYWJsZXMoKTtcblxuICAgIGluaXQoKSB7XG5cbiAgICAgICAgbXV0ZVdhdGNoZXJzKCk7XG5cbiAgICAgICAgdGhpcy5BcHAgPSB0aGlzLmluamVjdG9yLmdldChBcHApO1xuICAgICAgICB0aGlzLnJvdXRlID0gdGhpcy5pbmplY3Rvci5nZXQoQWN0aXZhdGVkUm91dGUpO1xuICAgICAgICB0aGlzLmFwcE1hbmFnZXIgPSB0aGlzLmluamVjdG9yLmdldChBcHBNYW5hZ2VyU2VydmljZSk7XG4gICAgICAgIHRoaXMubmF2aWdhdGlvblNlcnZpY2UgPSB0aGlzLmluamVjdG9yLmdldChBYnN0cmFjdE5hdmlnYXRpb25TZXJ2aWNlKTtcbiAgICAgICAgdGhpcy5pMThuU2VydmljZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KEFic3RyYWN0STE4blNlcnZpY2UpO1xuICAgICAgICB0aGlzLnJvdXRlciA9IHRoaXMuaW5qZWN0b3IuZ2V0KFJvdXRlcik7XG5cbiAgICAgICAgdGhpcy5pbml0VXNlclNjcmlwdCgpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJXaWRnZXRzKCk7XG4gICAgICAgIHRoaXMuaW5pdFZhcmlhYmxlcygpO1xuXG4gICAgICAgIHRoaXMuQXBwLmxhc3RBY3RpdmVQYWdlTmFtZSA9IHRoaXMuQXBwLmFjdGl2ZVBhZ2VOYW1lO1xuICAgICAgICB0aGlzLkFwcC5hY3RpdmVQYWdlTmFtZSA9IHRoaXMucGFnZU5hbWU7XG4gICAgICAgIHRoaXMuQXBwLmFjdGl2ZVBhZ2UgPSB0aGlzO1xuICAgICAgICB0aGlzLmFjdGl2ZVBhZ2VOYW1lID0gdGhpcy5wYWdlTmFtZTsgLy8gVG9kbzogcmVtb3ZlIHRoaXNcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyUGFnZVBhcmFtcygpO1xuXG4gICAgICAgIHRoaXMuZGVmaW5lSTE4blByb3BzKCk7XG5cbiAgICAgICAgc3VwZXIuaW5pdCgpO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyV2lkZ2V0cygpIHtcbiAgICAgICAgLy8gY29tbW9uIHBhcnRpYWwgd2lkZ2V0cyBzaG91bGQgYmUgYWNjZXNzaWJsZSBmcm9tIHBhZ2VcbiAgICAgICAgdGhpcy5XaWRnZXRzID0gT2JqZWN0LmNyZWF0ZShjb21tb25QYXJ0aWFsV2lkZ2V0cyk7XG5cbiAgICAgICAgLy8gZXhwb3NlIGN1cnJlbnQgcGFnZSB3aWRnZXRzIG9uIGFwcFxuICAgICAgICAodGhpcy5BcHAgYXMgYW55KS5XaWRnZXRzID0gT2JqZWN0LmNyZWF0ZSh0aGlzLldpZGdldHMpO1xuICAgIH1cblxuICAgIGluaXRVc2VyU2NyaXB0KCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5ldmFsVXNlclNjcmlwdCh0aGlzLCB0aGlzLkFwcCwgdGhpcy5pbmplY3Rvci5nZXQoVXRpbHNTZXJ2aWNlKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluIGV2YWx1YXRpbmcgcGFnZSAoJHt0aGlzLnBhZ2VOYW1lfSkgc2NyaXB0XFxuYCwgZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWdpc3RlclBhZ2VQYXJhbXMoKSB7XG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMucm91dGUucXVlcnlQYXJhbXMuc3Vic2NyaWJlKHBhcmFtcyA9PiB0aGlzLnBhZ2VQYXJhbXMgPSBwYXJhbXMpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgICB9XG5cbiAgICByZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcihmbjogRnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5kZXN0cm95JC5zdWJzY3JpYmUobm9vcCwgbm9vcCwgKCkgPT4gZm4oKSk7XG4gICAgfVxuXG4gICAgZGVmaW5lSTE4blByb3BzKCkge1xuICAgICAgICB0aGlzLmFwcExvY2FsZSA9IHRoaXMuaTE4blNlcnZpY2UuZ2V0QXBwTG9jYWxlKCk7XG4gICAgfVxuXG4gICAgaW5pdFZhcmlhYmxlcygpIHtcbiAgICAgICAgY29uc3QgdmFyaWFibGVzU2VydmljZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KFZhcmlhYmxlc1NlcnZpY2UpO1xuXG4gICAgICAgIC8vIGdldCB2YXJpYWJsZXMgYW5kIGFjdGlvbnMgaW5zdGFuY2VzIGZvciB0aGUgcGFnZVxuICAgICAgICBjb25zdCB2YXJpYWJsZUNvbGxlY3Rpb24gPSB2YXJpYWJsZXNTZXJ2aWNlLnJlZ2lzdGVyKHRoaXMucGFnZU5hbWUsIHRoaXMuZ2V0VmFyaWFibGVzKCksIHRoaXMpO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBuYW1lc3BhY2UgZm9yIFZhcmlhYmxlcyBuYWQgQWN0aW9ucyBvbiBwYWdlL3BhcnRpYWwsIHdoaWNoIGluaGVyaXRzIHRoZSBWYXJpYWJsZXMgYW5kIEFjdGlvbnMgZnJvbSBBcHAgaW5zdGFuY2VcbiAgICAgICAgdGhpcy5WYXJpYWJsZXMgPSBPYmplY3QuY3JlYXRlKHRoaXMuQXBwLlZhcmlhYmxlcyk7XG4gICAgICAgIHRoaXMuQWN0aW9ucyA9IE9iamVjdC5jcmVhdGUodGhpcy5BcHAuQWN0aW9ucyk7XG5cbiAgICAgICAgLy8gYXNzaWduIGFsbCB0aGUgcGFnZSB2YXJpYWJsZXMgdG8gdGhlIHBhZ2VJbnN0YW5jZVxuICAgICAgICBPYmplY3QuZW50cmllcyh2YXJpYWJsZUNvbGxlY3Rpb24uVmFyaWFibGVzKS5mb3JFYWNoKChbbmFtZSwgdmFyaWFibGVdKSA9PiB0aGlzLlZhcmlhYmxlc1tuYW1lXSA9IHZhcmlhYmxlKTtcbiAgICAgICAgT2JqZWN0LmVudHJpZXModmFyaWFibGVDb2xsZWN0aW9uLkFjdGlvbnMpLmZvckVhY2goKFtuYW1lLCBhY3Rpb25dKSA9PiB0aGlzLkFjdGlvbnNbbmFtZV0gPSBhY3Rpb24pO1xuXG5cbiAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy52aWV3SW5pdCQuc3Vic2NyaWJlKG5vb3AsIG5vb3AsICgpID0+IHtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLmFwcE1hbmFnZXIuaXNBcHBWYXJpYWJsZXNGaXJlZCgpKSB7XG4gICAgICAgICAgICAgICAgdmFyaWFibGVDb2xsZWN0aW9uLmNhbGxiYWNrKHRoaXMuQXBwLlZhcmlhYmxlcykuY2F0Y2gobm9vcCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwTWFuYWdlci5ub3RpZnkoJ2FwcC12YXJpYWJsZXMtZGF0YS1sb2FkZWQnLCB7cGFnZU5hbWU6IHRoaXMucGFnZU5hbWV9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB2YXJpYWJsZUNvbGxlY3Rpb24uY2FsbGJhY2sodGhpcy5BcHAuQWN0aW9ucyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBNYW5hZ2VyLmFwcFZhcmlhYmxlc1JlYWR5KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBNYW5hZ2VyLmlzQXBwVmFyaWFibGVzRmlyZWQodHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhcmlhYmxlQ29sbGVjdGlvbi5jYWxsYmFjayh2YXJpYWJsZUNvbGxlY3Rpb24uVmFyaWFibGVzKVxuICAgICAgICAgICAgICAgIC5jYXRjaChub29wKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBNYW5hZ2VyLm5vdGlmeSgncGFnZS12YXJpYWJsZXMtZGF0YS1sb2FkZWQnLCB7cGFnZU5hbWU6IHRoaXMucGFnZU5hbWV9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFydHVwVmFyaWFibGVzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gaGlkZSB0aGUgbG9hZGVyIG9ubHkgYWZ0ZXIgdGhlIHNvbWUgc2V0VGltZW91dCBmb3Igc21vb3RoIHBhZ2UgbG9hZC5cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dQYWdlQ29udGVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXJpYWJsZUNvbGxlY3Rpb24uY2FsbGJhY2sodmFyaWFibGVDb2xsZWN0aW9uLkFjdGlvbnMpO1xuXG4gICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcnVuUGFnZVRyYW5zaXRpb24odHJhbnNpdGlvbjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIGNvbnN0ICR0YXJnZXQgPSAkKCdhcHAtcGFnZS1vdXRsZXQ6Zmlyc3QnKTtcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb25UcmFuc2l0aW9uRW5kID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRhcmdldC5vZmYoJ2FuaW1hdGlvbmVuZCcsIG9uVHJhbnNpdGlvbkVuZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0LnJlbW92ZUNsYXNzKHRyYW5zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRhcmdldC5jaGlsZHJlbigpLmZpcnN0KCkucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbiA9ICdwYWdlLXRyYW5zaXRpb24gcGFnZS10cmFuc2l0aW9uLScgKyB0cmFuc2l0aW9uO1xuICAgICAgICAgICAgICAgICR0YXJnZXQuYWRkQ2xhc3ModHJhbnNpdGlvbik7XG4gICAgICAgICAgICAgICAgJHRhcmdldC5vbignYW5pbWF0aW9uZW5kJywgb25UcmFuc2l0aW9uRW5kKTtcbiAgICAgICAgICAgICAgICAvLyBXYWl0IGZvciBhIG1heGltdW0gb2YgMSBzZWNvbmQgZm9yIHRyYW5zaXRpb24gdG8gZW5kLlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQob25UcmFuc2l0aW9uRW5kLCAxMDAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbnZva2VPblJlYWR5KCkge1xuICAgICAgICB0aGlzLm9uUmVhZHkoKTtcbiAgICAgICAgKHRoaXMuQXBwLm9uUGFnZVJlYWR5IHx8IG5vb3ApKHRoaXMucGFnZU5hbWUsIHRoaXMpO1xuICAgICAgICB0aGlzLmFwcE1hbmFnZXIubm90aWZ5KCdwYWdlUmVhZHknLCB7J25hbWUnIDogdGhpcy5wYWdlTmFtZSwgaW5zdGFuY2U6IHRoaXN9KTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHRyYW5zaXRpb24gPSB0aGlzLm5hdmlnYXRpb25TZXJ2aWNlLmdldFBhZ2VUcmFuc2l0aW9uKCk7XG4gICAgICAgIGlmICh0cmFuc2l0aW9uKSB7XG4gICAgICAgICAgICBjb25zdCBwYWdlT3V0bGV0ID0gJCgnYXBwLXBhZ2Utb3V0bGV0OmZpcnN0Jyk7XG4gICAgICAgICAgICBwYWdlT3V0bGV0LnByZXBlbmQocGFnZU91dGxldC5jaGlsZHJlbigpLmZpcnN0KCkuY2xvbmUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ydW5QYWdlVHJhbnNpdGlvbih0cmFuc2l0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGFnZVRyYW5zaXRpb25Db21wbGV0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgKHRoaXMgYXMgYW55KS5jb21waWxlUGFnZUNvbnRlbnQgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB1bk11dGVXYXRjaGVycygpO1xuICAgICAgICAgICAgdGhpcy52aWV3SW5pdCQuY29tcGxldGUoKTtcbiAgICAgICAgICAgIGlmIChpc01vYmlsZUFwcCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblBhZ2VDb250ZW50UmVhZHkgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhZ21lbnRzTG9hZGVkJC5zdWJzY3JpYmUobm9vcCwgbm9vcCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VPblJlYWR5KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUGFnZUNvbnRlbnRSZWFkeSA9IG5vb3A7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFnbWVudHNMb2FkZWQkLnN1YnNjcmliZShub29wLCBub29wLCAoKSA9PiB0aGlzLmludm9rZU9uUmVhZHkoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDMwMCk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZGVzdHJveSQuY29tcGxldGUoKTtcbiAgICB9XG5cbiAgICBvblJlYWR5KCkge31cblxuICAgIG9uQmVmb3JlUGFnZUxlYXZlKCkge31cblxuICAgIG9uUGFnZUNvbnRlbnRSZWFkeSgpIHt9XG59XG4iXX0=