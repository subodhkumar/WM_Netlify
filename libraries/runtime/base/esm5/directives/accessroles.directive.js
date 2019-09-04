import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { SecurityService } from '@wm/security';
var USER_ROLE;
(function (USER_ROLE) {
    USER_ROLE["EVERYONE"] = "Everyone";
    USER_ROLE["ANONYMOUS"] = "Anonymous";
    USER_ROLE["AUTHENTICATED"] = "Authenticated";
})(USER_ROLE || (USER_ROLE = {}));
var AccessrolesDirective = /** @class */ (function () {
    function AccessrolesDirective(templateRef, viewContainerRef, securityService) {
        this.templateRef = templateRef;
        this.viewContainerRef = viewContainerRef;
        this.securityService = securityService;
        this.processed = false;
        var securityConfig = this.securityService.get();
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
    AccessrolesDirective.prototype.getWidgetRolesArrayFromStr = function (val) {
        var UNICODE_COMMA_REGEX = /&#44;/g;
        val = val || '';
        if (val === '') {
            return [];
        }
        // replace the unicode equivalent of comma with comma
        return _.split(val, ',').map(function (v) {
            return _.trim(v).replace(UNICODE_COMMA_REGEX, ',');
        });
    };
    /**
     * Returns true if roles in first arrays is
     * @param widgetRoles
     * @param userRoles
     * @returns {any}
     */
    AccessrolesDirective.prototype.matchRoles = function (widgetRoles, userRoles) {
        return widgetRoles.some(function (item) {
            return _.includes(userRoles, item);
        });
    };
    /**
     * Decides whether the current logged in user has access to widget or not
     * @param widgetRoles
     * @param userRoles
     * @returns {any}
     */
    AccessrolesDirective.prototype.hasAccessToWidget = function (widgetRoles, userRoles) {
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
    };
    Object.defineProperty(AccessrolesDirective.prototype, "accessroles", {
        set: function (roles) {
            // flag to compute the directive only once
            if (this.processed) {
                return;
            }
            this.processed = true;
            var widgetRoles = this.getWidgetRolesArrayFromStr(roles);
            var isAccessible = !this.securityEnabled || this.hasAccessToWidget(widgetRoles, this.userRoles);
            if (isAccessible) {
                this.viewContainerRef.createEmbeddedView(this.templateRef);
            }
            else {
                this.viewContainerRef.clear();
            }
        },
        enumerable: true,
        configurable: true
    });
    AccessrolesDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[accessroles]'
                },] }
    ];
    /** @nocollapse */
    AccessrolesDirective.ctorParameters = function () { return [
        { type: TemplateRef },
        { type: ViewContainerRef },
        { type: SecurityService }
    ]; };
    AccessrolesDirective.propDecorators = {
        accessroles: [{ type: Input }]
    };
    return AccessrolesDirective;
}());
export { AccessrolesDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzcm9sZXMuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbImRpcmVjdGl2ZXMvYWNjZXNzcm9sZXMuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVoRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBSS9DLElBQUssU0FJSjtBQUpELFdBQUssU0FBUztJQUNWLGtDQUFxQixDQUFBO0lBQ3JCLG9DQUF1QixDQUFBO0lBQ3ZCLDRDQUErQixDQUFBO0FBQ25DLENBQUMsRUFKSSxTQUFTLEtBQVQsU0FBUyxRQUliO0FBRUQ7SUFVSSw4QkFDWSxXQUE2QixFQUM3QixnQkFBa0MsRUFDbEMsZUFBZ0M7UUFGaEMsZ0JBQVcsR0FBWCxXQUFXLENBQWtCO1FBQzdCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBUnBDLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFVdEIsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNsRCxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyx5REFBMEIsR0FBbEMsVUFBbUMsR0FBRztRQUNsQyxJQUFNLG1CQUFtQixHQUFHLFFBQVEsQ0FBQztRQUVyQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQztRQUNoQixJQUFJLEdBQUcsS0FBSyxFQUFFLEVBQUU7WUFDWixPQUFPLEVBQUUsQ0FBQztTQUNiO1FBQ0QscURBQXFEO1FBQ3JELE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztZQUNwQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0sseUNBQVUsR0FBbEIsVUFBbUIsV0FBVyxFQUFFLFNBQVM7UUFDckMsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSTtZQUNsQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssZ0RBQWlCLEdBQXpCLFVBQTBCLFdBQVcsRUFBRSxTQUFTO1FBQzVDLDhDQUE4QztRQUM5QyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUM3QyxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsNkVBQTZFO1FBQzdFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQzNFLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCx3RkFBd0Y7UUFDeEYsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQzlFLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxxRUFBcUU7UUFDckUsT0FBTyxJQUFJLENBQUMsbUJBQW1CLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVELHNCQUFhLDZDQUFXO2FBQXhCLFVBQXlCLEtBQUs7WUFDMUIsMENBQTBDO1lBQzFDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDaEIsT0FBTzthQUNWO1lBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdEIsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNELElBQU0sWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsRyxJQUFJLFlBQVksRUFBRTtnQkFDZCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQzlEO2lCQUFNO2dCQUNILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNqQztRQUNMLENBQUM7OztPQUFBOztnQkE1RkosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxlQUFlO2lCQUM1Qjs7OztnQkFkMEIsV0FBVztnQkFBRSxnQkFBZ0I7Z0JBRS9DLGVBQWU7Ozs4QkF3Rm5CLEtBQUs7O0lBZVYsMkJBQUM7Q0FBQSxBQTdGRCxJQTZGQztTQTFGWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIElucHV0LCBUZW1wbGF0ZVJlZiwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBTZWN1cml0eVNlcnZpY2UgfSBmcm9tICdAd20vc2VjdXJpdHknO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmVudW0gVVNFUl9ST0xFIHtcbiAgICBFVkVSWU9ORSA9ICdFdmVyeW9uZScsXG4gICAgQU5PTllNT1VTID0gJ0Fub255bW91cycsXG4gICAgQVVUSEVOVElDQVRFRCA9ICdBdXRoZW50aWNhdGVkJ1xufVxuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1thY2Nlc3Nyb2xlc10nXG59KVxuZXhwb3J0IGNsYXNzIEFjY2Vzc3JvbGVzRGlyZWN0aXZlIHtcblxuICAgIHByaXZhdGUgcHJvY2Vzc2VkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSByZWFkb25seSBpc1VzZXJBdXRoZW50aWNhdGVkO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdXNlclJvbGVzO1xuICAgIHByaXZhdGUgc2VjdXJpdHlFbmFibGVkOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT4sXG4gICAgICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgcHJpdmF0ZSBzZWN1cml0eVNlcnZpY2U6IFNlY3VyaXR5U2VydmljZVxuICAgICkge1xuICAgICAgICBjb25zdCBzZWN1cml0eUNvbmZpZyA9IHRoaXMuc2VjdXJpdHlTZXJ2aWNlLmdldCgpO1xuICAgICAgICB0aGlzLnNlY3VyaXR5RW5hYmxlZCA9IF8uZ2V0KHNlY3VyaXR5Q29uZmlnLCAnc2VjdXJpdHlFbmFibGVkJyk7XG4gICAgICAgIHRoaXMuaXNVc2VyQXV0aGVudGljYXRlZCA9IF8uZ2V0KHNlY3VyaXR5Q29uZmlnLCAnYXV0aGVudGljYXRlZCcpO1xuICAgICAgICB0aGlzLnVzZXJSb2xlcyA9IF8uZ2V0KHNlY3VyaXR5Q29uZmlnLCAndXNlckluZm8udXNlclJvbGVzJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhcnJheSBvZiByb2xlcyBmcm9tIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgb2Ygcm9sZXNcbiAgICAgKiBIYW5kbGVzIGVuY29kZWQgY29tbWFzXG4gICAgICogQHBhcmFtIHZhbFxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRXaWRnZXRSb2xlc0FycmF5RnJvbVN0cih2YWwpIHtcbiAgICAgICAgY29uc3QgVU5JQ09ERV9DT01NQV9SRUdFWCA9IC8mIzQ0Oy9nO1xuXG4gICAgICAgIHZhbCA9IHZhbCB8fCAnJztcbiAgICAgICAgaWYgKHZhbCA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZXBsYWNlIHRoZSB1bmljb2RlIGVxdWl2YWxlbnQgb2YgY29tbWEgd2l0aCBjb21tYVxuICAgICAgICByZXR1cm4gXy5zcGxpdCh2YWwsICcsJykubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICByZXR1cm4gXy50cmltKHYpLnJlcGxhY2UoVU5JQ09ERV9DT01NQV9SRUdFWCwgJywnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHJvbGVzIGluIGZpcnN0IGFycmF5cyBpc1xuICAgICAqIEBwYXJhbSB3aWRnZXRSb2xlc1xuICAgICAqIEBwYXJhbSB1c2VyUm9sZXNcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHByaXZhdGUgbWF0Y2hSb2xlcyh3aWRnZXRSb2xlcywgdXNlclJvbGVzKSB7XG4gICAgICAgIHJldHVybiB3aWRnZXRSb2xlcy5zb21lKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gXy5pbmNsdWRlcyh1c2VyUm9sZXMsIGl0ZW0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWNpZGVzIHdoZXRoZXIgdGhlIGN1cnJlbnQgbG9nZ2VkIGluIHVzZXIgaGFzIGFjY2VzcyB0byB3aWRnZXQgb3Igbm90XG4gICAgICogQHBhcmFtIHdpZGdldFJvbGVzXG4gICAgICogQHBhcmFtIHVzZXJSb2xlc1xuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHJpdmF0ZSBoYXNBY2Nlc3NUb1dpZGdldCh3aWRnZXRSb2xlcywgdXNlclJvbGVzKSB7XG4gICAgICAgIC8vIGFjY2VzcyB0aGUgd2lkZ2V0IHdoZW4gJ0V2ZXJ5b25lJyBpcyBjaG9zZW5cbiAgICAgICAgaWYgKF8uaW5jbHVkZXMod2lkZ2V0Um9sZXMsIFVTRVJfUk9MRS5FVkVSWU9ORSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWNjZXNzIHRoZSB3aWRnZXQgd2hlbiAnQW5vbnltb3VzJyBpcyBjaG9zZW4gYW5kIHVzZXIgaXMgbm90IGF1dGhlbnRpY2F0ZWRcbiAgICAgICAgaWYgKF8uaW5jbHVkZXMod2lkZ2V0Um9sZXMsIFVTRVJfUk9MRS5BTk9OWU1PVVMpICYmICF0aGlzLmlzVXNlckF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWNjZXNzIHRoZSB3aWRnZXQgd2hlbiAnT25seSBBdXRoZW50aWNhdGVkIFVzZXJzJyBpcyBjaG9zZW4gYW5kIHVzZXIgaXMgYXV0aGVudGljYXRlZFxuICAgICAgICBpZiAoXy5pbmNsdWRlcyh3aWRnZXRSb2xlcywgVVNFUl9ST0xFLkFVVEhFTlRJQ0FURUQpICYmIHRoaXMuaXNVc2VyQXV0aGVudGljYXRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhY2Nlc3MgdGhlIHdpZGdldCB3aGVuIHdpZGdldCByb2xlIGFuZCBsb2dnZWQgaW4gdXNlciByb2xlIG1hdGNoZXNcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNVc2VyQXV0aGVudGljYXRlZCAmJiB0aGlzLm1hdGNoUm9sZXMod2lkZ2V0Um9sZXMsIHVzZXJSb2xlcyk7XG4gICAgfVxuXG4gICAgQElucHV0KCkgc2V0IGFjY2Vzc3JvbGVzKHJvbGVzKSB7XG4gICAgICAgIC8vIGZsYWcgdG8gY29tcHV0ZSB0aGUgZGlyZWN0aXZlIG9ubHkgb25jZVxuICAgICAgICBpZiAodGhpcy5wcm9jZXNzZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHJvY2Vzc2VkID0gdHJ1ZTtcbiAgICAgICAgY29uc3Qgd2lkZ2V0Um9sZXMgPSB0aGlzLmdldFdpZGdldFJvbGVzQXJyYXlGcm9tU3RyKHJvbGVzKTtcbiAgICAgICAgY29uc3QgaXNBY2Nlc3NpYmxlID0gIXRoaXMuc2VjdXJpdHlFbmFibGVkIHx8IHRoaXMuaGFzQWNjZXNzVG9XaWRnZXQod2lkZ2V0Um9sZXMsIHRoaXMudXNlclJvbGVzKTtcbiAgICAgICAgaWYgKGlzQWNjZXNzaWJsZSkge1xuICAgICAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLnRlbXBsYXRlUmVmKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZi5jbGVhcigpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19