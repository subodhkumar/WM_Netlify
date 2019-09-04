import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractDialogService, AbstractHttpService, AbstractNavigationService, AbstractToasterService } from '@wm/core';
import { OAuthService } from '@wm/oAuth';
import { SecurityService } from '@wm/security';
import { VariableFactory } from '../factory/variable.factory';
import { BaseAction } from '../model/base-action';
import { setDependency } from '../util/variable/variables.utils';
import { MetadataService } from './metadata-service/metadata.service';
var VariablesService = /** @class */ (function () {
    function VariablesService(httpService, metadataService, navigationService, routerService, toasterService, oAuthService, securityService, dialogService) {
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
    VariablesService.prototype.bulkCancel = function (collection) {
        Object.keys(collection).forEach(function (name) {
            var variable = collection[name];
            if (_.isFunction(variable.cancel)) {
                variable.cancel();
            }
        });
    };
    /**
     * loops over the variable/actions collection and trigger invoke on it if startUpdate on it is true
     * @param collection
     */
    VariablesService.prototype.triggerStartUpdate = function (collection) {
        return Promise.all(Object.keys(collection)
            .map(function (name) { return collection[name]; })
            .filter(function (variable) { return variable.startUpdate && variable.invoke; })
            .map(function (variable) { return variable.invoke(); }));
    };
    /**
     * Takes the raw variables and actions json as input
     * Initialize the variable and action instances through the factory
     * collect the variables and actions in separate maps and return the collection
     * @param {string} page
     * @param variablesJson
     * @param scope
     * @returns {Variables , Actions}
     */
    VariablesService.prototype.register = function (page, variablesJson, scope) {
        var _this = this;
        var variableInstances = {
            Variables: {},
            Actions: {},
            callback: this.triggerStartUpdate
        };
        var varInstance;
        for (var variableName in variablesJson) {
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
            scope.registerDestroyListener(function () {
                _this.bulkCancel(variableInstances.Variables);
                _this.bulkCancel(variableInstances.Actions);
            });
        }
        return variableInstances;
    };
    VariablesService.prototype.destroy = function () {
    };
    VariablesService.prototype.registerDependency = function (name, ref) {
        setDependency(name, ref);
    };
    VariablesService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    VariablesService.ctorParameters = function () { return [
        { type: AbstractHttpService },
        { type: MetadataService },
        { type: AbstractNavigationService },
        { type: Router },
        { type: AbstractToasterService },
        { type: OAuthService },
        { type: SecurityService },
        { type: AbstractDialogService }
    ]; };
    return VariablesService;
}());
export { VariablesService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyaWFibGVzLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsic2VydmljZS92YXJpYWJsZXMuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUV6QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsbUJBQW1CLEVBQUUseUJBQXlCLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDekgsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUN6QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRS9DLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUl0RTtJQUdJLDBCQUNZLFdBQWdDLEVBQ2hDLGVBQWdDLEVBQ2hDLGlCQUE0QyxFQUM1QyxhQUFxQixFQUNyQixjQUFzQyxFQUN0QyxZQUEwQixFQUMxQixlQUFnQyxFQUNoQyxhQUFvQztRQVBwQyxnQkFBVyxHQUFYLFdBQVcsQ0FBcUI7UUFDaEMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBQ2hDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBMkI7UUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFDckIsbUJBQWMsR0FBZCxjQUFjLENBQXdCO1FBQ3RDLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQzFCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQyxrQkFBYSxHQUFiLGFBQWEsQ0FBdUI7UUFFNUMs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QixDQUFDO0lBQzdCLENBQUM7SUFFRCxrQ0FBTyxHQUFQO0lBQ0EsQ0FBQztJQUVELDZDQUFrQixHQUFsQixVQUFtQixJQUFJLEVBQUUsR0FBRztRQUN4QixhQUFhLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzdCLENBQUM7O2dCQS9GSixVQUFVOzs7O2dCQVhxQixtQkFBbUI7Z0JBTzFDLGVBQWU7Z0JBUDZCLHlCQUF5QjtnQkFGckUsTUFBTTtnQkFFaUUsc0JBQXNCO2dCQUM3RixZQUFZO2dCQUNaLGVBQWU7Z0JBRmYscUJBQXFCOztJQTJHOUIsdUJBQUM7Q0FBQSxBQWhHRCxJQWdHQztTQS9GWSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBBYnN0cmFjdERpYWxvZ1NlcnZpY2UsIEFic3RyYWN0SHR0cFNlcnZpY2UsIEFic3RyYWN0TmF2aWdhdGlvblNlcnZpY2UsIEFic3RyYWN0VG9hc3RlclNlcnZpY2UgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBPQXV0aFNlcnZpY2UgfSBmcm9tICdAd20vb0F1dGgnO1xuaW1wb3J0IHsgU2VjdXJpdHlTZXJ2aWNlIH0gZnJvbSAnQHdtL3NlY3VyaXR5JztcblxuaW1wb3J0IHsgVmFyaWFibGVGYWN0b3J5IH0gZnJvbSAnLi4vZmFjdG9yeS92YXJpYWJsZS5mYWN0b3J5JztcbmltcG9ydCB7IEJhc2VBY3Rpb24gfSBmcm9tICcuLi9tb2RlbC9iYXNlLWFjdGlvbic7XG5pbXBvcnQgeyBzZXREZXBlbmRlbmN5IH0gZnJvbSAnLi4vdXRpbC92YXJpYWJsZS92YXJpYWJsZXMudXRpbHMnO1xuaW1wb3J0IHsgTWV0YWRhdGFTZXJ2aWNlIH0gZnJvbSAnLi9tZXRhZGF0YS1zZXJ2aWNlL21ldGFkYXRhLnNlcnZpY2UnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBWYXJpYWJsZXNTZXJ2aWNlIHtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGh0dHBTZXJ2aWNlOiBBYnN0cmFjdEh0dHBTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIG1ldGFkYXRhU2VydmljZTogTWV0YWRhdGFTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIG5hdmlnYXRpb25TZXJ2aWNlOiBBYnN0cmFjdE5hdmlnYXRpb25TZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJvdXRlclNlcnZpY2U6IFJvdXRlcixcbiAgICAgICAgcHJpdmF0ZSB0b2FzdGVyU2VydmljZTogQWJzdHJhY3RUb2FzdGVyU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBvQXV0aFNlcnZpY2U6IE9BdXRoU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBzZWN1cml0eVNlcnZpY2U6IFNlY3VyaXR5U2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBkaWFsb2dTZXJ2aWNlOiBBYnN0cmFjdERpYWxvZ1NlcnZpY2VcbiAgICApIHtcbiAgICAgICAgLy8gc2V0IGV4dGVybmFsIGRlcGVuZGVuY2llcywgdG8gYmUgdXNlZCBhY3Jvc3MgdmFyaWFibGUgY2xhc3NlcywgbWFuYWdlcnMgYW5kIHV0aWxzXG4gICAgICAgIHNldERlcGVuZGVuY3koJ2h0dHAnLCB0aGlzLmh0dHBTZXJ2aWNlKTtcbiAgICAgICAgc2V0RGVwZW5kZW5jeSgnbWV0YWRhdGEnLCB0aGlzLm1ldGFkYXRhU2VydmljZSk7XG4gICAgICAgIHNldERlcGVuZGVuY3koJ25hdmlnYXRpb25TZXJ2aWNlJywgdGhpcy5uYXZpZ2F0aW9uU2VydmljZSk7XG4gICAgICAgIHNldERlcGVuZGVuY3koJ3JvdXRlcicsIHRoaXMucm91dGVyU2VydmljZSk7XG4gICAgICAgIHNldERlcGVuZGVuY3koJ3RvYXN0ZXInLCB0aGlzLnRvYXN0ZXJTZXJ2aWNlKTtcbiAgICAgICAgc2V0RGVwZW5kZW5jeSgnb0F1dGgnLCB0aGlzLm9BdXRoU2VydmljZSk7XG4gICAgICAgIHNldERlcGVuZGVuY3koJ3NlY3VyaXR5JywgdGhpcy5zZWN1cml0eVNlcnZpY2UpO1xuICAgICAgICBzZXREZXBlbmRlbmN5KCdkaWFsb2cnLCB0aGlzLmRpYWxvZ1NlcnZpY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGxvb3AgdGhyb3VnaCBhIGNvbGxlY3Rpb24gb2YgdmFyaWFibGVzL2FjdGlvbnNcbiAgICAgKiB0cmlnZ2VyIGNhbmNlbCBvbiBlYWNoIChvZiBleGlzdHMpXG4gICAgICogQHBhcmFtIGNvbGxlY3Rpb25cbiAgICAgKi9cbiAgICBidWxrQ2FuY2VsKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgT2JqZWN0LmtleXMoY29sbGVjdGlvbikuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhcmlhYmxlID0gY29sbGVjdGlvbltuYW1lXTtcbiAgICAgICAgICAgIGlmIChfLmlzRnVuY3Rpb24odmFyaWFibGUuY2FuY2VsKSkge1xuICAgICAgICAgICAgICAgIHZhcmlhYmxlLmNhbmNlbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBsb29wcyBvdmVyIHRoZSB2YXJpYWJsZS9hY3Rpb25zIGNvbGxlY3Rpb24gYW5kIHRyaWdnZXIgaW52b2tlIG9uIGl0IGlmIHN0YXJ0VXBkYXRlIG9uIGl0IGlzIHRydWVcbiAgICAgKiBAcGFyYW0gY29sbGVjdGlvblxuICAgICAqL1xuICAgIHRyaWdnZXJTdGFydFVwZGF0ZShjb2xsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNvbGxlY3Rpb24pXG4gICAgICAgICAgICAgICAgLm1hcChuYW1lID0+IGNvbGxlY3Rpb25bbmFtZV0pXG4gICAgICAgICAgICAgICAgLmZpbHRlciggdmFyaWFibGUgPT4gdmFyaWFibGUuc3RhcnRVcGRhdGUgJiYgdmFyaWFibGUuaW52b2tlKVxuICAgICAgICAgICAgICAgIC5tYXAodmFyaWFibGUgPT4gdmFyaWFibGUuaW52b2tlKCkpXG4gICAgICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRha2VzIHRoZSByYXcgdmFyaWFibGVzIGFuZCBhY3Rpb25zIGpzb24gYXMgaW5wdXRcbiAgICAgKiBJbml0aWFsaXplIHRoZSB2YXJpYWJsZSBhbmQgYWN0aW9uIGluc3RhbmNlcyB0aHJvdWdoIHRoZSBmYWN0b3J5XG4gICAgICogY29sbGVjdCB0aGUgdmFyaWFibGVzIGFuZCBhY3Rpb25zIGluIHNlcGFyYXRlIG1hcHMgYW5kIHJldHVybiB0aGUgY29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYWdlXG4gICAgICogQHBhcmFtIHZhcmlhYmxlc0pzb25cbiAgICAgKiBAcGFyYW0gc2NvcGVcbiAgICAgKiBAcmV0dXJucyB7VmFyaWFibGVzICwgQWN0aW9uc31cbiAgICAgKi9cbiAgICByZWdpc3RlcihwYWdlOiBzdHJpbmcsIHZhcmlhYmxlc0pzb246IGFueSwgc2NvcGU6IGFueSkge1xuICAgICAgICBjb25zdCB2YXJpYWJsZUluc3RhbmNlcyA9IHtcbiAgICAgICAgICAgIFZhcmlhYmxlczoge30sXG4gICAgICAgICAgICBBY3Rpb25zOiB7fSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiB0aGlzLnRyaWdnZXJTdGFydFVwZGF0ZVxuICAgICAgICB9O1xuICAgICAgICBsZXQgdmFySW5zdGFuY2U7XG5cbiAgICAgICAgZm9yIChjb25zdCB2YXJpYWJsZU5hbWUgaW4gdmFyaWFibGVzSnNvbikge1xuICAgICAgICAgICAgdmFySW5zdGFuY2UgPSBWYXJpYWJsZUZhY3RvcnkuY3JlYXRlKHZhcmlhYmxlc0pzb25bdmFyaWFibGVOYW1lXSwgc2NvcGUpO1xuICAgICAgICAgICAgdmFySW5zdGFuY2UuaW5pdCgpO1xuICAgICAgICAgICAgLy8gaWYgYWN0aW9uIHR5cGUsIHB1dCBpdCBpbiBBY3Rpb25zIG5hbWVzcGFjZVxuICAgICAgICAgICAgaWYgKHZhckluc3RhbmNlIGluc3RhbmNlb2YgQmFzZUFjdGlvbikge1xuICAgICAgICAgICAgICAgIHZhcmlhYmxlSW5zdGFuY2VzLkFjdGlvbnNbdmFyaWFibGVOYW1lXSA9IHZhckluc3RhbmNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXJpYWJsZUluc3RhbmNlcy5WYXJpYWJsZXNbdmFyaWFibGVOYW1lXSA9IHZhckluc3RhbmNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgdGhlIGNvbnRleHQgaGFzIG9uRGVzdHJveSBsaXN0ZW5lciwgc3Vic2NyaWJlIHRoZSBldmVudCBhbmQgdHJpZ2dlciBjYW5jZWwgb24gYWxsIHZhcmliYWxlc1xuICAgICAgICBpZiAoc2NvcGUucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHNjb3BlLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGtDYW5jZWwodmFyaWFibGVJbnN0YW5jZXMuVmFyaWFibGVzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGtDYW5jZWwodmFyaWFibGVJbnN0YW5jZXMuQWN0aW9ucyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YXJpYWJsZUluc3RhbmNlcztcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgIH1cblxuICAgIHJlZ2lzdGVyRGVwZW5kZW5jeShuYW1lLCByZWYpIHtcbiAgICAgICAgc2V0RGVwZW5kZW5jeShuYW1lLCByZWYpO1xuICAgIH1cbn1cbiJdfQ==