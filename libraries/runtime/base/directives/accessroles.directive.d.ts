import { TemplateRef, ViewContainerRef } from '@angular/core';
import { SecurityService } from '@wm/security';
export declare class AccessrolesDirective {
    private templateRef;
    private viewContainerRef;
    private securityService;
    private processed;
    private readonly isUserAuthenticated;
    private readonly userRoles;
    private securityEnabled;
    constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef, securityService: SecurityService);
    /**
     * Returns array of roles from comma separated string of roles
     * Handles encoded commas
     * @param val
     * @returns {any}
     */
    private getWidgetRolesArrayFromStr;
    /**
     * Returns true if roles in first arrays is
     * @param widgetRoles
     * @param userRoles
     * @returns {any}
     */
    private matchRoles;
    /**
     * Decides whether the current logged in user has access to widget or not
     * @param widgetRoles
     * @param userRoles
     * @returns {any}
     */
    private hasAccessToWidget;
    accessroles: any;
}
