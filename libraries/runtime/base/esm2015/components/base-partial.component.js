import { Subject } from 'rxjs';
import { AbstractI18nService, App, noop, UtilsService } from '@wm/core';
import { WidgetRef } from '@wm/components';
import { VariablesService } from '@wm/variables';
import { FragmentMonitor } from '../util/fragment-monitor';
import { $invokeWatchers } from '@wm/core';
export const commonPartialWidgets = {};
export class BasePartialComponent extends FragmentMonitor {
    constructor() {
        super(...arguments);
        this.destroy$ = new Subject();
        this.viewInit$ = new Subject();
    }
    getContainerWidgetInjector() {
        return this.containerWidget.inj || this.containerWidget.injector;
    }
    init() {
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
        this.viewInit$.subscribe(noop, noop, () => {
            this.pageParams = this.containerWidget.partialParams;
        });
        super.init();
    }
    registerWidgets() {
        if (this.partialName === 'Common') {
            this.Widgets = commonPartialWidgets;
        }
        else {
            this.Widgets = Object.create(commonPartialWidgets);
        }
        this.containerWidget.Widgets = this.Widgets;
    }
    registerDestroyListener(fn) {
        this.destroy$.subscribe(noop, noop, () => fn());
    }
    initUserScript() {
        try {
            this.evalUserScript(this, this.App, this.injector.get(UtilsService));
        }
        catch (e) {
            console.error(`Error in evaluating partial (${this.partialName}) script\n`, e);
        }
    }
    initVariables() {
        const variablesService = this.injector.get(VariablesService);
        // get variables and actions instances for the page
        const variableCollection = variablesService.register(this.partialName, this.getVariables(), this);
        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        this.Variables = Object.create(this.App.Variables);
        this.Actions = Object.create(this.App.Actions);
        this.containerWidget.Variables = this.Variables;
        this.containerWidget.Actions = this.Actions;
        // assign all the page variables to the pageInstance
        Object.entries(variableCollection.Variables).forEach(([name, variable]) => this.Variables[name] = variable);
        Object.entries(variableCollection.Actions).forEach(([name, action]) => this.Actions[name] = action);
        this.viewInit$.subscribe(noop, noop, () => {
            // TEMP: triggering watchers so variables watching over params are updated
            $invokeWatchers(true, true);
            variableCollection.callback(variableCollection.Variables).catch(noop);
            variableCollection.callback(variableCollection.Actions);
        });
    }
    registerPageParams() {
        this.pageParams = this.containerWidget.partialParams;
    }
    defineI18nProps() {
        this.appLocale = this.i18nService.getAppLocale();
    }
    invokeOnReady() {
        this.onReady();
        if (this.getContainerWidgetInjector().view.component.resolveFragment) {
            this.getContainerWidgetInjector().view.component.resolveFragment();
        }
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.viewInit$.complete();
            this.fragmentsLoaded$.subscribe(noop, noop, () => this.invokeOnReady());
        }, 100);
    }
    ngOnDestroy() {
        this.destroy$.complete();
    }
    onReady() {
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1wYXJ0aWFsLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJjb21wb25lbnRzL2Jhc2UtcGFydGlhbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUUvQixPQUFPLEVBQUUsbUJBQW1CLEVBQTZCLEdBQUcsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ25HLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFakQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRTNELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFM0MsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0FBRXZDLE1BQU0sT0FBZ0Isb0JBQXFCLFNBQVEsZUFBZTtJQUFsRTs7UUFpQkksYUFBUSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDekIsY0FBUyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7SUFrSDlCLENBQUM7SUE1R0csMEJBQTBCO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUM7SUFDckUsQ0FBQztJQUVELElBQUk7UUFFQSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzFELElBQUksSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRTtZQUNuRSxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDdkU7UUFFRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFdEIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsb0JBQW9CO1FBQ25FLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTFCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUV2QixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRTtZQUN0QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDO1FBQ3pELENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxlQUFlO1FBQ1gsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFFBQVEsRUFBRTtZQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHLG9CQUFvQixDQUFDO1NBQ3ZDO2FBQU07WUFDSCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUN0RDtRQUVELElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDaEQsQ0FBQztJQUVELHVCQUF1QixDQUFDLEVBQVk7UUFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxjQUFjO1FBQ1YsSUFBSTtZQUNBLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztTQUN4RTtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsSUFBSSxDQUFDLFdBQVcsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2xGO0lBQ0wsQ0FBQztJQUVELGFBQWE7UUFDVCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFN0QsbURBQW1EO1FBQ25ELE1BQU0sa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRWxHLHlIQUF5SDtRQUN6SCxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUUvQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2hELElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFFNUMsb0RBQW9EO1FBQ3BELE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDNUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUdwRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRTtZQUN0QywwRUFBMEU7WUFDMUUsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1QixrQkFBa0IsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RFLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1RCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxrQkFBa0I7UUFDZCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDO0lBQ3pELENBQUM7SUFFRCxlQUFlO1FBQ1gsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3JELENBQUM7SUFFRCxhQUFhO1FBQ1QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2YsSUFBSSxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRTtZQUNsRSxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQ3RFO0lBQ0wsQ0FBQztJQUVELGVBQWU7UUFDWCxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUUxQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFFNUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUVELFdBQVc7UUFDUCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRCxPQUFPO0lBQ1AsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgSW5qZWN0b3IsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUsIFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgQWJzdHJhY3RJMThuU2VydmljZSwgQWJzdHJhY3ROYXZpZ2F0aW9uU2VydmljZSwgQXBwLCBub29wLCBVdGlsc1NlcnZpY2UgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBXaWRnZXRSZWYgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5pbXBvcnQgeyBWYXJpYWJsZXNTZXJ2aWNlIH0gZnJvbSAnQHdtL3ZhcmlhYmxlcyc7XG5cbmltcG9ydCB7IEZyYWdtZW50TW9uaXRvciB9IGZyb20gJy4uL3V0aWwvZnJhZ21lbnQtbW9uaXRvcic7XG5pbXBvcnQgeyBBcHBNYW5hZ2VyU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL2FwcC5tYW5hZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgJGludm9rZVdhdGNoZXJzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5leHBvcnQgY29uc3QgY29tbW9uUGFydGlhbFdpZGdldHMgPSB7fTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VQYXJ0aWFsQ29tcG9uZW50IGV4dGVuZHMgRnJhZ21lbnRNb25pdG9yIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgICBXaWRnZXRzOiBhbnk7XG4gICAgVmFyaWFibGVzOiBhbnk7XG4gICAgQWN0aW9uczogYW55O1xuICAgIEFwcDogQXBwO1xuICAgIGluamVjdG9yOiBJbmplY3RvcjtcbiAgICBwYXJ0aWFsTmFtZTogc3RyaW5nO1xuICAgIGFjdGl2ZVBhZ2VOYW1lOiBzdHJpbmc7XG4gICAgcm91dGU6IEFjdGl2YXRlZFJvdXRlO1xuICAgIGFwcE1hbmFnZXI6IEFwcE1hbmFnZXJTZXJ2aWNlO1xuICAgIG5hdmlnYXRpb25TZXJ2aWNlOiBBYnN0cmFjdE5hdmlnYXRpb25TZXJ2aWNlO1xuICAgIHJvdXRlcjogUm91dGVyO1xuICAgIHBhZ2VQYXJhbXM6IGFueTtcbiAgICBjb250YWluZXJXaWRnZXQ6IGFueTtcbiAgICBpMThuU2VydmljZTogQWJzdHJhY3RJMThuU2VydmljZTtcbiAgICBhcHBMb2NhbGU6IGFueTtcblxuICAgIGRlc3Ryb3kkID0gbmV3IFN1YmplY3QoKTtcbiAgICB2aWV3SW5pdCQgPSBuZXcgU3ViamVjdCgpO1xuXG4gICAgYWJzdHJhY3QgZXZhbFVzZXJTY3JpcHQocHJlZmFiQ29udGV4dDogYW55LCBhcHBDb250ZXh0OiBhbnksIHV0aWxzOiBhbnkpO1xuXG4gICAgYWJzdHJhY3QgZ2V0VmFyaWFibGVzKCk7XG5cbiAgICBnZXRDb250YWluZXJXaWRnZXRJbmplY3RvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyV2lkZ2V0LmluaiB8fCB0aGlzLmNvbnRhaW5lcldpZGdldC5pbmplY3RvcjtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuXG4gICAgICAgIHRoaXMuQXBwID0gdGhpcy5pbmplY3Rvci5nZXQoQXBwKTtcbiAgICAgICAgdGhpcy5jb250YWluZXJXaWRnZXQgPSB0aGlzLmluamVjdG9yLmdldChXaWRnZXRSZWYpO1xuICAgICAgICB0aGlzLmkxOG5TZXJ2aWNlID0gdGhpcy5pbmplY3Rvci5nZXQoQWJzdHJhY3RJMThuU2VydmljZSk7XG4gICAgICAgIGlmICh0aGlzLmdldENvbnRhaW5lcldpZGdldEluamVjdG9yKCkudmlldy5jb21wb25lbnQucmVnaXN0ZXJGcmFnbWVudCkge1xuICAgICAgICAgICAgdGhpcy5nZXRDb250YWluZXJXaWRnZXRJbmplY3RvcigpLnZpZXcuY29tcG9uZW50LnJlZ2lzdGVyRnJhZ21lbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5pdFVzZXJTY3JpcHQoKTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2lkZ2V0cygpO1xuICAgICAgICB0aGlzLmluaXRWYXJpYWJsZXMoKTtcblxuICAgICAgICB0aGlzLmFjdGl2ZVBhZ2VOYW1lID0gdGhpcy5BcHAuYWN0aXZlUGFnZU5hbWU7IC8vIFRvZG86IHJlbW92ZSB0aGlzXG4gICAgICAgIHRoaXMucmVnaXN0ZXJQYWdlUGFyYW1zKCk7XG5cbiAgICAgICAgdGhpcy5kZWZpbmVJMThuUHJvcHMoKTtcblxuICAgICAgICB0aGlzLnZpZXdJbml0JC5zdWJzY3JpYmUobm9vcCwgbm9vcCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wYWdlUGFyYW1zID0gdGhpcy5jb250YWluZXJXaWRnZXQucGFydGlhbFBhcmFtcztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3VwZXIuaW5pdCgpO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyV2lkZ2V0cygpIHtcbiAgICAgICAgaWYgKHRoaXMucGFydGlhbE5hbWUgPT09ICdDb21tb24nKSB7XG4gICAgICAgICAgICB0aGlzLldpZGdldHMgPSBjb21tb25QYXJ0aWFsV2lkZ2V0cztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuV2lkZ2V0cyA9IE9iamVjdC5jcmVhdGUoY29tbW9uUGFydGlhbFdpZGdldHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb250YWluZXJXaWRnZXQuV2lkZ2V0cyA9IHRoaXMuV2lkZ2V0cztcbiAgICB9XG5cbiAgICByZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcihmbjogRnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5kZXN0cm95JC5zdWJzY3JpYmUobm9vcCwgbm9vcCwgKCkgPT4gZm4oKSk7XG4gICAgfVxuXG4gICAgaW5pdFVzZXJTY3JpcHQoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmV2YWxVc2VyU2NyaXB0KHRoaXMsIHRoaXMuQXBwLCB0aGlzLmluamVjdG9yLmdldChVdGlsc1NlcnZpY2UpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gZXZhbHVhdGluZyBwYXJ0aWFsICgke3RoaXMucGFydGlhbE5hbWV9KSBzY3JpcHRcXG5gLCBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXRWYXJpYWJsZXMoKSB7XG4gICAgICAgIGNvbnN0IHZhcmlhYmxlc1NlcnZpY2UgPSB0aGlzLmluamVjdG9yLmdldChWYXJpYWJsZXNTZXJ2aWNlKTtcblxuICAgICAgICAvLyBnZXQgdmFyaWFibGVzIGFuZCBhY3Rpb25zIGluc3RhbmNlcyBmb3IgdGhlIHBhZ2VcbiAgICAgICAgY29uc3QgdmFyaWFibGVDb2xsZWN0aW9uID0gdmFyaWFibGVzU2VydmljZS5yZWdpc3Rlcih0aGlzLnBhcnRpYWxOYW1lLCB0aGlzLmdldFZhcmlhYmxlcygpLCB0aGlzKTtcblxuICAgICAgICAvLyBjcmVhdGUgbmFtZXNwYWNlIGZvciBWYXJpYWJsZXMgbmFkIEFjdGlvbnMgb24gcGFnZS9wYXJ0aWFsLCB3aGljaCBpbmhlcml0cyB0aGUgVmFyaWFibGVzIGFuZCBBY3Rpb25zIGZyb20gQXBwIGluc3RhbmNlXG4gICAgICAgIHRoaXMuVmFyaWFibGVzID0gT2JqZWN0LmNyZWF0ZSh0aGlzLkFwcC5WYXJpYWJsZXMpO1xuICAgICAgICB0aGlzLkFjdGlvbnMgPSBPYmplY3QuY3JlYXRlKHRoaXMuQXBwLkFjdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyV2lkZ2V0LlZhcmlhYmxlcyA9IHRoaXMuVmFyaWFibGVzO1xuICAgICAgICB0aGlzLmNvbnRhaW5lcldpZGdldC5BY3Rpb25zID0gdGhpcy5BY3Rpb25zO1xuXG4gICAgICAgIC8vIGFzc2lnbiBhbGwgdGhlIHBhZ2UgdmFyaWFibGVzIHRvIHRoZSBwYWdlSW5zdGFuY2VcbiAgICAgICAgT2JqZWN0LmVudHJpZXModmFyaWFibGVDb2xsZWN0aW9uLlZhcmlhYmxlcykuZm9yRWFjaCgoW25hbWUsIHZhcmlhYmxlXSkgPT4gdGhpcy5WYXJpYWJsZXNbbmFtZV0gPSB2YXJpYWJsZSk7XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHZhcmlhYmxlQ29sbGVjdGlvbi5BY3Rpb25zKS5mb3JFYWNoKChbbmFtZSwgYWN0aW9uXSkgPT4gdGhpcy5BY3Rpb25zW25hbWVdID0gYWN0aW9uKTtcblxuXG4gICAgICAgIHRoaXMudmlld0luaXQkLnN1YnNjcmliZShub29wLCBub29wLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBURU1QOiB0cmlnZ2VyaW5nIHdhdGNoZXJzIHNvIHZhcmlhYmxlcyB3YXRjaGluZyBvdmVyIHBhcmFtcyBhcmUgdXBkYXRlZFxuICAgICAgICAgICAgJGludm9rZVdhdGNoZXJzKHRydWUsIHRydWUpO1xuICAgICAgICAgICAgdmFyaWFibGVDb2xsZWN0aW9uLmNhbGxiYWNrKHZhcmlhYmxlQ29sbGVjdGlvbi5WYXJpYWJsZXMpLmNhdGNoKG5vb3ApO1xuICAgICAgICAgICAgdmFyaWFibGVDb2xsZWN0aW9uLmNhbGxiYWNrKHZhcmlhYmxlQ29sbGVjdGlvbi5BY3Rpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJQYWdlUGFyYW1zKCkge1xuICAgICAgICB0aGlzLnBhZ2VQYXJhbXMgPSB0aGlzLmNvbnRhaW5lcldpZGdldC5wYXJ0aWFsUGFyYW1zO1xuICAgIH1cblxuICAgIGRlZmluZUkxOG5Qcm9wcygpIHtcbiAgICAgICAgdGhpcy5hcHBMb2NhbGUgPSB0aGlzLmkxOG5TZXJ2aWNlLmdldEFwcExvY2FsZSgpO1xuICAgIH1cblxuICAgIGludm9rZU9uUmVhZHkoKSB7XG4gICAgICAgIHRoaXMub25SZWFkeSgpO1xuICAgICAgICBpZiAodGhpcy5nZXRDb250YWluZXJXaWRnZXRJbmplY3RvcigpLnZpZXcuY29tcG9uZW50LnJlc29sdmVGcmFnbWVudCkge1xuICAgICAgICAgICAgdGhpcy5nZXRDb250YWluZXJXaWRnZXRJbmplY3RvcigpLnZpZXcuY29tcG9uZW50LnJlc29sdmVGcmFnbWVudCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudmlld0luaXQkLmNvbXBsZXRlKCk7XG5cbiAgICAgICAgICAgIHRoaXMuZnJhZ21lbnRzTG9hZGVkJC5zdWJzY3JpYmUobm9vcCwgbm9vcCwgKCkgPT4gdGhpcy5pbnZva2VPblJlYWR5KCkpO1xuXG4gICAgICAgIH0sIDEwMCk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZGVzdHJveSQuY29tcGxldGUoKTtcbiAgICB9XG5cbiAgICBvblJlYWR5KCkge1xuICAgIH1cbn1cbiJdfQ==