import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { SecurityService } from '@wm/security';
var USER_ROLE;
(function (USER_ROLE) {
    USER_ROLE["EVERYONE"] = "Everyone";
    USER_ROLE["ANONYMOUS"] = "Anonymous";
    USER_ROLE["AUTHENTICATED"] = "Authenticated";
})(USER_ROLE || (USER_ROLE = {}));
export class AccessrolesDirective {
    constructor(templateRef, viewContainerRef, securityService) {
        this.templateRef = templateRef;
        this.viewContainerRef = viewContainerRef;
        this.securityService = securityService;
        this.processed = false;
        const securityConfig = this.securityService.get();
        this.securityEnabled = _.get(securityConfig, 'securityEnabled');
        this.isUserAuthenticated = _.get(securityConfig, 'authenticated');
        this.userRoles = _.get(securityConfig, 'userInfo.userRoles');
    }
    /**
     * Returns array of roles from comma separated string of roles
     * Handles encoded commas
     * @param val
     * @returns {any}
     */
    getWidgetRolesArrayFromStr(val) {
        const UNICODE_COMMA_REGEX = /&#44;/g;
        val = val || '';
        if (val === '') {
            return [];
        }
        // replace the unicode equivalent of comma with comma
        return _.split(val, ',').map(function (v) {
            return _.trim(v).replace(UNICODE_COMMA_REGEX, ',');
        });
    }
    /**
     * Returns true if roles in first arrays is
     * @param widgetRoles
     * @param userRoles
     * @returns {any}
     */
    matchRoles(widgetRoles, userRoles) {
        return widgetRoles.some(function (item) {
            return _.includes(userRoles, item);
        });
    }
    /**
     * Decides whether the current logged in user has access to widget or not
     * @param widgetRoles
     * @param userRoles
     * @returns {any}
     */
    hasAccessToWidget(widgetRoles, userRoles) {
        // access the widget when 'Everyone' is chosen
        if (_.includes(widgetRoles, USER_ROLE.EVERYONE)) {
            return true;
        }
        // access the widget when 'Anonymous' is chosen and user is not authenticated
        if (_.includes(widgetRoles, USER_ROLE.ANONYMOUS) && !this.isUserAuthenticated) {
            return true;
        }
        // access the widget when 'Only Authenticated Users' is chosen and user is authenticated
        if (_.includes(widgetRoles, USER_ROLE.AUTHENTICATED) && this.isUserAuthenticated) {
            return true;
        }
        // access the widget when widget role and logged in user role matches
        return this.isUserAuthenticated && this.matchRoles(widgetRoles, userRoles);
    }
    set accessroles(roles) {
        // flag to compute the directive only once
        if (this.processed) {
            return;
        }
        this.processed = true;
        const widgetRoles = this.getWidgetRolesArrayFromStr(roles);
        const isAccessible = !this.securityEnabled || this.hasAccessToWidget(widgetRoles, this.userRoles);
        if (isAccessible) {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
        }
        else {
            this.viewContainerRef.clear();
        }
    }
}
AccessrolesDirective.decorators = [
    { type: Directive, args: [{
                selector: '[accessroles]'
            },] }
];
/** @nocollapse */
AccessrolesDirective.ctorParameters = () => [
    { type: TemplateRef },
    { type: ViewContainerRef },
    { type: SecurityService }
];
AccessrolesDirective.propDecorators = {
    accessroles: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzcm9sZXMuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbImRpcmVjdGl2ZXMvYWNjZXNzcm9sZXMuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVoRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBSS9DLElBQUssU0FJSjtBQUpELFdBQUssU0FBUztJQUNWLGtDQUFxQixDQUFBO0lBQ3JCLG9DQUF1QixDQUFBO0lBQ3ZCLDRDQUErQixDQUFBO0FBQ25DLENBQUMsRUFKSSxTQUFTLEtBQVQsU0FBUyxRQUliO0FBS0QsTUFBTSxPQUFPLG9CQUFvQjtJQU83QixZQUNZLFdBQTZCLEVBQzdCLGdCQUFrQyxFQUNsQyxlQUFnQztRQUZoQyxnQkFBVyxHQUFYLFdBQVcsQ0FBa0I7UUFDN0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFScEMsY0FBUyxHQUFHLEtBQUssQ0FBQztRQVV0QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLDBCQUEwQixDQUFDLEdBQUc7UUFDbEMsTUFBTSxtQkFBbUIsR0FBRyxRQUFRLENBQUM7UUFFckMsR0FBRyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDaEIsSUFBSSxHQUFHLEtBQUssRUFBRSxFQUFFO1lBQ1osT0FBTyxFQUFFLENBQUM7U0FDYjtRQUNELHFEQUFxRDtRQUNyRCxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7WUFDcEMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLFVBQVUsQ0FBQyxXQUFXLEVBQUUsU0FBUztRQUNyQyxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJO1lBQ2xDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsU0FBUztRQUM1Qyw4Q0FBOEM7UUFDOUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDN0MsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELDZFQUE2RTtRQUM3RSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUMzRSxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsd0ZBQXdGO1FBQ3hGLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUM5RSxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQscUVBQXFFO1FBQ3JFLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFFRCxJQUFhLFdBQVcsQ0FBQyxLQUFLO1FBQzFCLDBDQUEwQztRQUMxQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDaEIsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNELE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRyxJQUFJLFlBQVksRUFBRTtZQUNkLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDOUQ7YUFBTTtZQUNILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNqQztJQUNMLENBQUM7OztZQTVGSixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLGVBQWU7YUFDNUI7Ozs7WUFkMEIsV0FBVztZQUFFLGdCQUFnQjtZQUUvQyxlQUFlOzs7MEJBd0ZuQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbnB1dCwgVGVtcGxhdGVSZWYsIFZpZXdDb250YWluZXJSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgU2VjdXJpdHlTZXJ2aWNlIH0gZnJvbSAnQHdtL3NlY3VyaXR5JztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5lbnVtIFVTRVJfUk9MRSB7XG4gICAgRVZFUllPTkUgPSAnRXZlcnlvbmUnLFxuICAgIEFOT05ZTU9VUyA9ICdBbm9ueW1vdXMnLFxuICAgIEFVVEhFTlRJQ0FURUQgPSAnQXV0aGVudGljYXRlZCdcbn1cblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbYWNjZXNzcm9sZXNdJ1xufSlcbmV4cG9ydCBjbGFzcyBBY2Nlc3Nyb2xlc0RpcmVjdGl2ZSB7XG5cbiAgICBwcml2YXRlIHByb2Nlc3NlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgaXNVc2VyQXV0aGVudGljYXRlZDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHVzZXJSb2xlcztcbiAgICBwcml2YXRlIHNlY3VyaXR5RW5hYmxlZDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxhbnk+LFxuICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHByaXZhdGUgc2VjdXJpdHlTZXJ2aWNlOiBTZWN1cml0eVNlcnZpY2VcbiAgICApIHtcbiAgICAgICAgY29uc3Qgc2VjdXJpdHlDb25maWcgPSB0aGlzLnNlY3VyaXR5U2VydmljZS5nZXQoKTtcbiAgICAgICAgdGhpcy5zZWN1cml0eUVuYWJsZWQgPSBfLmdldChzZWN1cml0eUNvbmZpZywgJ3NlY3VyaXR5RW5hYmxlZCcpO1xuICAgICAgICB0aGlzLmlzVXNlckF1dGhlbnRpY2F0ZWQgPSBfLmdldChzZWN1cml0eUNvbmZpZywgJ2F1dGhlbnRpY2F0ZWQnKTtcbiAgICAgICAgdGhpcy51c2VyUm9sZXMgPSBfLmdldChzZWN1cml0eUNvbmZpZywgJ3VzZXJJbmZvLnVzZXJSb2xlcycpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYXJyYXkgb2Ygcm9sZXMgZnJvbSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIG9mIHJvbGVzXG4gICAgICogSGFuZGxlcyBlbmNvZGVkIGNvbW1hc1xuICAgICAqIEBwYXJhbSB2YWxcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0V2lkZ2V0Um9sZXNBcnJheUZyb21TdHIodmFsKSB7XG4gICAgICAgIGNvbnN0IFVOSUNPREVfQ09NTUFfUkVHRVggPSAvJiM0NDsvZztcblxuICAgICAgICB2YWwgPSB2YWwgfHwgJyc7XG4gICAgICAgIGlmICh2YWwgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVwbGFjZSB0aGUgdW5pY29kZSBlcXVpdmFsZW50IG9mIGNvbW1hIHdpdGggY29tbWFcbiAgICAgICAgcmV0dXJuIF8uc3BsaXQodmFsLCAnLCcpLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgcmV0dXJuIF8udHJpbSh2KS5yZXBsYWNlKFVOSUNPREVfQ09NTUFfUkVHRVgsICcsJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiByb2xlcyBpbiBmaXJzdCBhcnJheXMgaXNcbiAgICAgKiBAcGFyYW0gd2lkZ2V0Um9sZXNcbiAgICAgKiBAcGFyYW0gdXNlclJvbGVzXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwcml2YXRlIG1hdGNoUm9sZXMod2lkZ2V0Um9sZXMsIHVzZXJSb2xlcykge1xuICAgICAgICByZXR1cm4gd2lkZ2V0Um9sZXMuc29tZShmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIF8uaW5jbHVkZXModXNlclJvbGVzLCBpdGVtKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVjaWRlcyB3aGV0aGVyIHRoZSBjdXJyZW50IGxvZ2dlZCBpbiB1c2VyIGhhcyBhY2Nlc3MgdG8gd2lkZ2V0IG9yIG5vdFxuICAgICAqIEBwYXJhbSB3aWRnZXRSb2xlc1xuICAgICAqIEBwYXJhbSB1c2VyUm9sZXNcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHByaXZhdGUgaGFzQWNjZXNzVG9XaWRnZXQod2lkZ2V0Um9sZXMsIHVzZXJSb2xlcykge1xuICAgICAgICAvLyBhY2Nlc3MgdGhlIHdpZGdldCB3aGVuICdFdmVyeW9uZScgaXMgY2hvc2VuXG4gICAgICAgIGlmIChfLmluY2x1ZGVzKHdpZGdldFJvbGVzLCBVU0VSX1JPTEUuRVZFUllPTkUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFjY2VzcyB0aGUgd2lkZ2V0IHdoZW4gJ0Fub255bW91cycgaXMgY2hvc2VuIGFuZCB1c2VyIGlzIG5vdCBhdXRoZW50aWNhdGVkXG4gICAgICAgIGlmIChfLmluY2x1ZGVzKHdpZGdldFJvbGVzLCBVU0VSX1JPTEUuQU5PTllNT1VTKSAmJiAhdGhpcy5pc1VzZXJBdXRoZW50aWNhdGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFjY2VzcyB0aGUgd2lkZ2V0IHdoZW4gJ09ubHkgQXV0aGVudGljYXRlZCBVc2VycycgaXMgY2hvc2VuIGFuZCB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcbiAgICAgICAgaWYgKF8uaW5jbHVkZXMod2lkZ2V0Um9sZXMsIFVTRVJfUk9MRS5BVVRIRU5USUNBVEVEKSAmJiB0aGlzLmlzVXNlckF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWNjZXNzIHRoZSB3aWRnZXQgd2hlbiB3aWRnZXQgcm9sZSBhbmQgbG9nZ2VkIGluIHVzZXIgcm9sZSBtYXRjaGVzXG4gICAgICAgIHJldHVybiB0aGlzLmlzVXNlckF1dGhlbnRpY2F0ZWQgJiYgdGhpcy5tYXRjaFJvbGVzKHdpZGdldFJvbGVzLCB1c2VyUm9sZXMpO1xuICAgIH1cblxuICAgIEBJbnB1dCgpIHNldCBhY2Nlc3Nyb2xlcyhyb2xlcykge1xuICAgICAgICAvLyBmbGFnIHRvIGNvbXB1dGUgdGhlIGRpcmVjdGl2ZSBvbmx5IG9uY2VcbiAgICAgICAgaWYgKHRoaXMucHJvY2Vzc2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnByb2Nlc3NlZCA9IHRydWU7XG4gICAgICAgIGNvbnN0IHdpZGdldFJvbGVzID0gdGhpcy5nZXRXaWRnZXRSb2xlc0FycmF5RnJvbVN0cihyb2xlcyk7XG4gICAgICAgIGNvbnN0IGlzQWNjZXNzaWJsZSA9ICF0aGlzLnNlY3VyaXR5RW5hYmxlZCB8fCB0aGlzLmhhc0FjY2Vzc1RvV2lkZ2V0KHdpZGdldFJvbGVzLCB0aGlzLnVzZXJSb2xlcyk7XG4gICAgICAgIGlmIChpc0FjY2Vzc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy50ZW1wbGF0ZVJlZik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnZpZXdDb250YWluZXJSZWYuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==