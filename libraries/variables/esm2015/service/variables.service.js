import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractDialogService, AbstractHttpService, AbstractNavigationService, AbstractToasterService } from '@wm/core';
import { OAuthService } from '@wm/oAuth';
import { SecurityService } from '@wm/security';
import { VariableFactory } from '../factory/variable.factory';
import { BaseAction } from '../model/base-action';
import { setDependency } from '../util/variable/variables.utils';
import { MetadataService } from './metadata-service/metadata.service';
export class VariablesService {
    constructor(httpService, metadataService, navigationService, routerService, toasterService, oAuthService, securityService, dialogService) {
        this.httpService = httpService;
        this.metadataService = metadataService;
        this.navigationService = navigationService;
        this.routerService = routerService;
        this.toasterService = toasterService;
        this.oAuthService = oAuthService;
        this.securityService = securityService;
        this.dialogService = dialogService;
        // set external dependencies, to be used across variable classes, managers and utils
        setDependency('http', this.httpService);
        setDependency('metadata', this.metadataService);
        setDependency('navigationService', this.navigationService);
        setDependency('router', this.routerService);
        setDependency('toaster', this.toasterService);
        setDependency('oAuth', this.oAuthService);
        setDependency('security', this.securityService);
        setDependency('dialog', this.dialogService);
    }
    /**
     * loop through a collection of variables/actions
     * trigger cancel on each (of exists)
     * @param collection
     */
    bulkCancel(collection) {
        Object.keys(collection).forEach(name => {
            const variable = collection[name];
            if (_.isFunction(variable.cancel)) {
                variable.cancel();
            }
        });
    }
    /**
     * loops over the variable/actions collection and trigger invoke on it if startUpdate on it is true
     * @param collection
     */
    triggerStartUpdate(collection) {
        return Promise.all(Object.keys(collection)
            .map(name => collection[name])
            .filter(variable => variable.startUpdate && variable.invoke)
            .map(variable => variable.invoke()));
    }
    /**
     * Takes the raw variables and actions json as input
     * Initialize the variable and action instances through the factory
     * collect the variables and actions in separate maps and return the collection
     * @param {string} page
     * @param variablesJson
     * @param scope
     * @returns {Variables , Actions}
     */
    register(page, variablesJson, scope) {
        const variableInstances = {
            Variables: {},
            Actions: {},
            callback: this.triggerStartUpdate
        };
        let varInstance;
        for (const variableName in variablesJson) {
            varInstance = VariableFactory.create(variablesJson[variableName], scope);
            varInstance.init();
            // if action type, put it in Actions namespace
            if (varInstance instanceof BaseAction) {
                variableInstances.Actions[variableName] = varInstance;
            }
            else {
                variableInstances.Variables[variableName] = varInstance;
            }
        }
        // if the context has onDestroy listener, subscribe the event and trigger cancel on all varibales
        if (scope.registerDestroyListener) {
            scope.registerDestroyListener(() => {
                this.bulkCancel(variableInstances.Variables);
                this.bulkCancel(variableInstances.Actions);
            });
        }
        return variableInstances;
    }
    destroy() {
    }
    registerDependency(name, ref) {
        setDependency(name, ref);
    }
}
VariablesService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
VariablesService.ctorParameters = () => [
    { type: AbstractHttpService },
    { type: MetadataService },
    { type: AbstractNavigationService },
    { type: Router },
    { type: AbstractToasterService },
    { type: OAuthService },
    { type: SecurityService },
    { type: AbstractDialogService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyaWFibGVzLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsic2VydmljZS92YXJpYWJsZXMuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUV6QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsbUJBQW1CLEVBQUUseUJBQXlCLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDekgsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUN6QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRS9DLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUt0RSxNQUFNLE9BQU8sZ0JBQWdCO0lBRXpCLFlBQ1ksV0FBZ0MsRUFDaEMsZUFBZ0MsRUFDaEMsaUJBQTRDLEVBQzVDLGFBQXFCLEVBQ3JCLGNBQXNDLEVBQ3RDLFlBQTBCLEVBQzFCLGVBQWdDLEVBQ2hDLGFBQW9DO1FBUHBDLGdCQUFXLEdBQVgsV0FBVyxDQUFxQjtRQUNoQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDaEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUEyQjtRQUM1QyxrQkFBYSxHQUFiLGFBQWEsQ0FBUTtRQUNyQixtQkFBYyxHQUFkLGNBQWMsQ0FBd0I7UUFDdEMsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDMUIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBQ2hDLGtCQUFhLEdBQWIs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QztJQUVELGtCQUFrQixDQUFDLElBQUksRUFBRSxHQUFHO1FBQ3hCLGFBQWEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDN0IsQ0FBQzs7O1lBL0ZKLFVBQVU7Ozs7WUFYcUIsbUJBQW1CO1lBTzFDLGVBQWU7WUFQNkIseUJBQXlCO1lBRnJFLE1BQU07WUFFaUUsc0JBQXNCO1lBQzdGLFlBQVk7WUFDWixlQUFlO1lBRmYscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgQWJzdHJhY3REaWFsb2dTZXJ2aWNlLCBBYnN0cmFjdEh0dHBTZXJ2aWNlLCBBYnN0cmFjdE5hdmlnYXRpb25TZXJ2aWNlLCBBYnN0cmFjdFRvYXN0ZXJTZXJ2aWNlIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgT0F1dGhTZXJ2aWNlIH0gZnJvbSAnQHdtL29BdXRoJztcbmltcG9ydCB7IFNlY3VyaXR5U2VydmljZSB9IGZyb20gJ0B3bS9zZWN1cml0eSc7XG5cbmltcG9ydCB7IFZhcmlhYmxlRmFjdG9yeSB9IGZyb20gJy4uL2ZhY3RvcnkvdmFyaWFibGUuZmFjdG9yeSc7XG5pbXBvcnQgeyBCYXNlQWN0aW9uIH0gZnJvbSAnLi4vbW9kZWwvYmFzZS1hY3Rpb24nO1xuaW1wb3J0IHsgc2V0RGVwZW5kZW5jeSB9IGZyb20gJy4uL3V0aWwvdmFyaWFibGUvdmFyaWFibGVzLnV0aWxzJztcbmltcG9ydCB7IE1ldGFkYXRhU2VydmljZSB9IGZyb20gJy4vbWV0YWRhdGEtc2VydmljZS9tZXRhZGF0YS5zZXJ2aWNlJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVmFyaWFibGVzU2VydmljZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBodHRwU2VydmljZTogQWJzdHJhY3RIdHRwU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBtZXRhZGF0YVNlcnZpY2U6IE1ldGFkYXRhU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBuYXZpZ2F0aW9uU2VydmljZTogQWJzdHJhY3ROYXZpZ2F0aW9uU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXJTZXJ2aWNlOiBSb3V0ZXIsXG4gICAgICAgIHByaXZhdGUgdG9hc3RlclNlcnZpY2U6IEFic3RyYWN0VG9hc3RlclNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgb0F1dGhTZXJ2aWNlOiBPQXV0aFNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgc2VjdXJpdHlTZXJ2aWNlOiBTZWN1cml0eVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgZGlhbG9nU2VydmljZTogQWJzdHJhY3REaWFsb2dTZXJ2aWNlXG4gICAgKSB7XG4gICAgICAgIC8vIHNldCBleHRlcm5hbCBkZXBlbmRlbmNpZXMsIHRvIGJlIHVzZWQgYWNyb3NzIHZhcmlhYmxlIGNsYXNzZXMsIG1hbmFnZXJzIGFuZCB1dGlsc1xuICAgICAgICBzZXREZXBlbmRlbmN5KCdodHRwJywgdGhpcy5odHRwU2VydmljZSk7XG4gICAgICAgIHNldERlcGVuZGVuY3koJ21ldGFkYXRhJywgdGhpcy5tZXRhZGF0YVNlcnZpY2UpO1xuICAgICAgICBzZXREZXBlbmRlbmN5KCduYXZpZ2F0aW9uU2VydmljZScsIHRoaXMubmF2aWdhdGlvblNlcnZpY2UpO1xuICAgICAgICBzZXREZXBlbmRlbmN5KCdyb3V0ZXInLCB0aGlzLnJvdXRlclNlcnZpY2UpO1xuICAgICAgICBzZXREZXBlbmRlbmN5KCd0b2FzdGVyJywgdGhpcy50b2FzdGVyU2VydmljZSk7XG4gICAgICAgIHNldERlcGVuZGVuY3koJ29BdXRoJywgdGhpcy5vQXV0aFNlcnZpY2UpO1xuICAgICAgICBzZXREZXBlbmRlbmN5KCdzZWN1cml0eScsIHRoaXMuc2VjdXJpdHlTZXJ2aWNlKTtcbiAgICAgICAgc2V0RGVwZW5kZW5jeSgnZGlhbG9nJywgdGhpcy5kaWFsb2dTZXJ2aWNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBsb29wIHRocm91Z2ggYSBjb2xsZWN0aW9uIG9mIHZhcmlhYmxlcy9hY3Rpb25zXG4gICAgICogdHJpZ2dlciBjYW5jZWwgb24gZWFjaCAob2YgZXhpc3RzKVxuICAgICAqIEBwYXJhbSBjb2xsZWN0aW9uXG4gICAgICovXG4gICAgYnVsa0NhbmNlbChjb2xsZWN0aW9uKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKGNvbGxlY3Rpb24pLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YXJpYWJsZSA9IGNvbGxlY3Rpb25bbmFtZV07XG4gICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHZhcmlhYmxlLmNhbmNlbCkpIHtcbiAgICAgICAgICAgICAgICB2YXJpYWJsZS5jYW5jZWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogbG9vcHMgb3ZlciB0aGUgdmFyaWFibGUvYWN0aW9ucyBjb2xsZWN0aW9uIGFuZCB0cmlnZ2VyIGludm9rZSBvbiBpdCBpZiBzdGFydFVwZGF0ZSBvbiBpdCBpcyB0cnVlXG4gICAgICogQHBhcmFtIGNvbGxlY3Rpb25cbiAgICAgKi9cbiAgICB0cmlnZ2VyU3RhcnRVcGRhdGUoY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjb2xsZWN0aW9uKVxuICAgICAgICAgICAgICAgIC5tYXAobmFtZSA9PiBjb2xsZWN0aW9uW25hbWVdKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoIHZhcmlhYmxlID0+IHZhcmlhYmxlLnN0YXJ0VXBkYXRlICYmIHZhcmlhYmxlLmludm9rZSlcbiAgICAgICAgICAgICAgICAubWFwKHZhcmlhYmxlID0+IHZhcmlhYmxlLmludm9rZSgpKVxuICAgICAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUYWtlcyB0aGUgcmF3IHZhcmlhYmxlcyBhbmQgYWN0aW9ucyBqc29uIGFzIGlucHV0XG4gICAgICogSW5pdGlhbGl6ZSB0aGUgdmFyaWFibGUgYW5kIGFjdGlvbiBpbnN0YW5jZXMgdGhyb3VnaCB0aGUgZmFjdG9yeVxuICAgICAqIGNvbGxlY3QgdGhlIHZhcmlhYmxlcyBhbmQgYWN0aW9ucyBpbiBzZXBhcmF0ZSBtYXBzIGFuZCByZXR1cm4gdGhlIGNvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFnZVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZXNKc29uXG4gICAgICogQHBhcmFtIHNjb3BlXG4gICAgICogQHJldHVybnMge1ZhcmlhYmxlcyAsIEFjdGlvbnN9XG4gICAgICovXG4gICAgcmVnaXN0ZXIocGFnZTogc3RyaW5nLCB2YXJpYWJsZXNKc29uOiBhbnksIHNjb3BlOiBhbnkpIHtcbiAgICAgICAgY29uc3QgdmFyaWFibGVJbnN0YW5jZXMgPSB7XG4gICAgICAgICAgICBWYXJpYWJsZXM6IHt9LFxuICAgICAgICAgICAgQWN0aW9uczoge30sXG4gICAgICAgICAgICBjYWxsYmFjazogdGhpcy50cmlnZ2VyU3RhcnRVcGRhdGVcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHZhckluc3RhbmNlO1xuXG4gICAgICAgIGZvciAoY29uc3QgdmFyaWFibGVOYW1lIGluIHZhcmlhYmxlc0pzb24pIHtcbiAgICAgICAgICAgIHZhckluc3RhbmNlID0gVmFyaWFibGVGYWN0b3J5LmNyZWF0ZSh2YXJpYWJsZXNKc29uW3ZhcmlhYmxlTmFtZV0sIHNjb3BlKTtcbiAgICAgICAgICAgIHZhckluc3RhbmNlLmluaXQoKTtcbiAgICAgICAgICAgIC8vIGlmIGFjdGlvbiB0eXBlLCBwdXQgaXQgaW4gQWN0aW9ucyBuYW1lc3BhY2VcbiAgICAgICAgICAgIGlmICh2YXJJbnN0YW5jZSBpbnN0YW5jZW9mIEJhc2VBY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXJpYWJsZUluc3RhbmNlcy5BY3Rpb25zW3ZhcmlhYmxlTmFtZV0gPSB2YXJJbnN0YW5jZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyaWFibGVJbnN0YW5jZXMuVmFyaWFibGVzW3ZhcmlhYmxlTmFtZV0gPSB2YXJJbnN0YW5jZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHRoZSBjb250ZXh0IGhhcyBvbkRlc3Ryb3kgbGlzdGVuZXIsIHN1YnNjcmliZSB0aGUgZXZlbnQgYW5kIHRyaWdnZXIgY2FuY2VsIG9uIGFsbCB2YXJpYmFsZXNcbiAgICAgICAgaWYgKHNjb3BlLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKSB7XG4gICAgICAgICAgICBzY29wZS5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5idWxrQ2FuY2VsKHZhcmlhYmxlSW5zdGFuY2VzLlZhcmlhYmxlcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5idWxrQ2FuY2VsKHZhcmlhYmxlSW5zdGFuY2VzLkFjdGlvbnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFyaWFibGVJbnN0YW5jZXM7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICB9XG5cbiAgICByZWdpc3RlckRlcGVuZGVuY3kobmFtZSwgcmVmKSB7XG4gICAgICAgIHNldERlcGVuZGVuY3kobmFtZSwgcmVmKTtcbiAgICB9XG59XG4iXX0=