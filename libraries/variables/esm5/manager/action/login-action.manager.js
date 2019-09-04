import * as tslib_1 from "tslib";
import { getClonedObject, triggerFn } from '@wm/core';
import { BaseActionManager } from './base-action.manager';
import { CONSTANTS, VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { appManager, dialogService, initiateCallback, routerService, securityService } from '../../util/variable/variables.utils';
var LoginActionManager = /** @class */ (function (_super) {
    tslib_1.__extends(LoginActionManager, _super);
    function LoginActionManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LoginActionManager.prototype.validate = function (params) {
        var err, paramKey, remembermeKey;
        var LOGIN_PARAM_REMEMBER_ME = 'j_rememberme';
        var LOGIN_PARAM_REMEMBER_ME_OLD = ['rememberme', 'remembermecheck'];
        // for older projects
        LOGIN_PARAM_REMEMBER_ME_OLD.forEach(function (old_key) {
            if (_.isBoolean(params[old_key])) {
                remembermeKey = old_key;
            }
        });
        remembermeKey = remembermeKey || LOGIN_PARAM_REMEMBER_ME;
        // check remember me
        params[remembermeKey] = _.isBoolean(params[remembermeKey]) ? params[remembermeKey] : false;
        for (paramKey in params) {
            if (params.hasOwnProperty(paramKey) &&
                (params[paramKey] === '' || params[paramKey] === undefined)) {
                err = 'Please provide required credentials';
                break;
            }
        }
        return err;
    };
    LoginActionManager.prototype.migrateOldParams = function (params) {
        var loginParams = {}, paramMigrationMap = {
            'usernametext': 'j_username',
            'username': 'j_username',
            'passwordtext': 'j_password',
            'password': 'j_password',
            'remembermecheck': 'j_rememberme',
            'rememberme': 'j_rememberme'
        };
        _.each(params, function (value, key) {
            if (paramMigrationMap[key]) {
                loginParams[paramMigrationMap[key]] = value;
            }
            else {
                loginParams[key] = value;
            }
        });
        return loginParams;
    };
    LoginActionManager.prototype.login = function (variable, options, success, error) {
        var _this = this;
        var newDataSet;
        options = options || {};
        // If login info provided along explicitly with options, don't look into the variable bindings for the same
        var loginInfo = options.loginInfo || options.input || variable.dataBinding;
        // client side validation
        var errMsg = this.validate(loginInfo);
        /* if error message initialized, return error */
        if (errMsg) {
            triggerFn(error, errMsg);
            initiateCallback('onError', variable, errMsg);
            return;
        }
        // Triggering 'onBeforeUpdate' and considering
        var params = getClonedObject(loginInfo);
        var output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, params);
        if (_.isObject(output)) {
            params = output;
        }
        else if (output === false) {
            triggerFn(error);
            return;
        }
        // migrate old params to new
        params = this.migrateOldParams(params);
        // get previously loggedInUser name (if any)
        var lastLoggedInUsername = _.get(securityService.get(), 'userInfo.userName');
        this.notifyInflight(variable, true);
        variable.promise = securityService.appLogin(params, function (response) {
            // Closing login dialog after successful login
            dialogService.close('CommonLoginDialog');
            /*
             * Get fresh security config
             * Get App variables. if not loaded
             * Update loggedInUser variable with new user details
             */
            appManager.reloadAppData().
                then(function (config) {
                // EVENT: ON_RESULT
                initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, _.get(config, 'userInfo'));
                // EVENT: ON_PREPARESETDATA
                newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, _.get(config, 'userInfo'));
                if (newDataSet) {
                    // setting newDataSet as the response to service variable onPrepareSetData
                    _.set(config, 'userInfo', newDataSet);
                }
                // hide the spinner after all the n/w calls are completed
                _this.notifyInflight(variable, false, response);
                triggerFn(success);
                setTimeout(function () {
                    // EVENT: ON_SUCCESS
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, _.get(config, 'userInfo'));
                    /* handle navigation if defaultSuccessHandler on variable is true */
                    if (variable.useDefaultSuccessHandler) {
                        var isSameUserReloggedIn = lastLoggedInUsername === params['j_username'];
                        // if first time user logging in or same user re-logging in, execute n/w calls failed before logging in
                        if (!lastLoggedInUsername || isSameUserReloggedIn) {
                            appManager.executeSessionFailureRequests();
                        }
                        // get redirectTo page from URL and remove it from URL
                        var redirectPage = securityService.getCurrentRouteQueryParam('redirectTo'), noRedirect = appManager.noRedirect();
                        // Get query params(page params of page being redirected to) and append to the URL after login.
                        var queryParamsObj = securityService.getRedirectedRouteQueryParams();
                        // The redirectTo param isn't required after login
                        if (queryParamsObj.redirectTo) {
                            delete queryParamsObj.redirectTo;
                        }
                        appManager.noRedirect(false);
                        // first time login
                        if (!lastLoggedInUsername) {
                            // if redirect page found, navigate to it.
                            if (!_.isEmpty(redirectPage)) {
                                routerService.navigate(["/" + redirectPage], { queryParams: queryParamsObj });
                            }
                            else if (!noRedirect) {
                                // simply reset the URL, route handling will take care of page redirection
                                routerService.navigate(["/"]);
                            }
                        }
                        else {
                            // login after a session timeout
                            // if redirect page found and same user logs in again, just navigate to redirect page
                            if (!_.isEmpty(redirectPage)) {
                                // same user logs in again, just redirect to the redirectPage
                                if (lastLoggedInUsername === params['j_username']) {
                                    routerService.navigate(["/" + redirectPage], { queryParams: queryParamsObj });
                                }
                                else {
                                    // different user logs in, reload the app and discard the redirectPage
                                    routerService.navigate(["/"]);
                                    window.location.reload();
                                }
                            }
                            else {
                                var securityConfig = securityService.get(), sessionTimeoutLoginMode = _.get(securityConfig, 'loginConfig.sessionTimeout.type') || 'PAGE';
                                // if in dialog mode and a new user logs in OR login happening through page, reload the app
                                if (!isSameUserReloggedIn || sessionTimeoutLoginMode !== 'DIALOG') {
                                    routerService.navigate(["/"]);
                                    window.location.reload();
                                }
                            }
                        }
                    }
                    // EVENT: ON_CAN_UPDATE
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, _.get(config, 'userInfo'));
                });
            });
        }, function (e) {
            // EVENT: ON_RESULT
            initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, e);
            _this.notifyInflight(variable, false, e);
            var errorMsg = e.error || 'Invalid credentials.';
            var xhrObj = e.details;
            /* if in RUN mode, trigger error events associated with the variable */
            if (CONSTANTS.isRunMode) {
                initiateCallback('onError', variable, errorMsg, xhrObj, true);
            }
            triggerFn(error, errorMsg, xhrObj);
            // EVENT: ON_CAN_UPDATE
            initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, e);
        });
    };
    return LoginActionManager;
}(BaseActionManager));
export { LoginActionManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4tYWN0aW9uLm1hbmFnZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsibWFuYWdlci9hY3Rpb24vbG9naW4tYWN0aW9uLm1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXRELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUNwRixPQUFPLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFJbEk7SUFBd0MsOENBQWlCO0lBQXpEOztJQXFMQSxDQUFDO0lBbkxXLHFDQUFRLEdBQWhCLFVBQWlCLE1BQVc7UUFDeEIsSUFBSSxHQUFHLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQztRQUNqQyxJQUFNLHVCQUF1QixHQUFHLGNBQWMsQ0FBQztRQUMvQyxJQUFNLDJCQUEyQixHQUFHLENBQUMsWUFBWSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFdEUscUJBQXFCO1FBQ3JCLDJCQUEyQixDQUFDLE9BQU8sQ0FBQyxVQUFDLE9BQU87WUFDeEMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFO2dCQUM5QixhQUFhLEdBQUcsT0FBTyxDQUFDO2FBQzNCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxhQUFhLEdBQUksYUFBYSxJQUFJLHVCQUF1QixDQUFDO1FBRTFELG9CQUFvQjtRQUNwQixNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxD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UUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNqRTtZQUNELFNBQVMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ25DLHVCQUF1QjtZQUN2QixnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDTCx5QkFBQztBQUFELENBQUMsQUFyTEQsQ0FBd0MsaUJBQWlCLEdBcUx4RCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldENsb25lZE9iamVjdCwgdHJpZ2dlckZuIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBCYXNlQWN0aW9uTWFuYWdlciB9IGZyb20gJy4vYmFzZS1hY3Rpb24ubWFuYWdlcic7XG5pbXBvcnQgeyBDT05TVEFOVFMsIFZBUklBQkxFX0NPTlNUQU5UUyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cy92YXJpYWJsZXMuY29uc3RhbnRzJztcbmltcG9ydCB7IGFwcE1hbmFnZXIsIGRpYWxvZ1NlcnZpY2UsIGluaXRpYXRlQ2FsbGJhY2ssIHJvdXRlclNlcnZpY2UsIHNlY3VyaXR5U2VydmljZSB9IGZyb20gJy4uLy4uL3V0aWwvdmFyaWFibGUvdmFyaWFibGVzLnV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5leHBvcnQgY2xhc3MgTG9naW5BY3Rpb25NYW5hZ2VyIGV4dGVuZHMgQmFzZUFjdGlvbk1hbmFnZXIge1xuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZShwYXJhbXM6IGFueSkge1xuICAgICAgICBsZXQgZXJyLCBwYXJhbUtleSwgcmVtZW1iZXJtZUtleTtcbiAgICAgICAgY29uc3QgTE9HSU5fUEFSQU1fUkVNRU1CRVJfTUUgPSAnal9yZW1lbWJlcm1lJztcbiAgICAgICAgY29uc3QgTE9HSU5fUEFSQU1fUkVNRU1CRVJfTUVfT0xEID0gWydyZW1lbWJlcm1lJywgJ3JlbWVtYmVybWVjaGVjayddO1xuXG4gICAgICAgIC8vIGZvciBvbGRlciBwcm9qZWN0c1xuICAgICAgICBMT0dJTl9QQVJBTV9SRU1FTUJFUl9NRV9PTEQuZm9yRWFjaCgob2xkX2tleSkgPT4ge1xuICAgICAgICAgICAgaWYgKF8uaXNCb29sZWFuKHBhcmFtc1tvbGRfa2V5XSkpIHtcbiAgICAgICAgICAgICAgICByZW1lbWJlcm1lS2V5ID0gb2xkX2tleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVtZW1iZXJtZUtleSA9ICByZW1lbWJlcm1lS2V5IHx8IExPR0lOX1BBUkFNX1JFTUVNQkVSX01FO1xuXG4gICAgICAgIC8vIGNoZWNrIHJlbWVtYmVyIG1lXG4gICAgICAgIHBhcmFtc1tyZW1lbWJlcm1lS2V5XSA9IF8uaXNCb29sZWFuKHBhcmFtc1tyZW1lbWJlcm1lS2V5XSkgPyBwYXJhbXNbcmVtZW1iZXJtZUtleV0gOiBmYWxzZTtcblxuICAgICAgICBmb3IgKHBhcmFtS2V5IGluIHBhcmFtcykge1xuICAgICAgICAgICAgaWYgKHBhcmFtcy5oYXNPd25Qcm9wZXJ0eShwYXJhbUtleSkgJiZcbiAgICAgICAgICAgICAgICAocGFyYW1zW3BhcmFtS2V5XSA9PT0gJycgfHwgcGFyYW1zW3BhcmFtS2V5XSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgICAgIGVyciA9ICdQbGVhc2UgcHJvdmlkZSByZXF1aXJlZCBjcmVkZW50aWFscyc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZXJyO1xuICAgIH1cblxuICAgIHByaXZhdGUgbWlncmF0ZU9sZFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgY29uc3QgbG9naW5QYXJhbXMgPSB7fSxcbiAgICAgICAgICAgIHBhcmFtTWlncmF0aW9uTWFwID0ge1xuICAgICAgICAgICAgJ3VzZXJuYW1ldGV4dCc6ICdqX3VzZXJuYW1lJyxcbiAgICAgICAgICAgICd1c2VybmFtZSc6ICdqX3VzZXJuYW1lJyxcbiAgICAgICAgICAgICdwYXNzd29yZHRleHQnOiAnal9wYXNzd29yZCcsXG4gICAgICAgICAgICAncGFzc3dvcmQnOiAnal9wYXNzd29yZCcsXG4gICAgICAgICAgICAncmVtZW1iZXJtZWNoZWNrJzogJ2pfcmVtZW1iZXJtZScsXG4gICAgICAgICAgICAncmVtZW1iZXJtZSc6ICdqX3JlbWVtYmVybWUnXG4gICAgICAgIH07XG5cbiAgICAgICAgXy5lYWNoKHBhcmFtcywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgICAgaWYgKHBhcmFtTWlncmF0aW9uTWFwW2tleV0pIHtcbiAgICAgICAgICAgICAgICBsb2dpblBhcmFtc1twYXJhbU1pZ3JhdGlvbk1hcFtrZXldXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dpblBhcmFtc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbG9naW5QYXJhbXM7XG4gICAgfVxuXG4gICAgbG9naW4odmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIGxldCBuZXdEYXRhU2V0O1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgICAvLyBJZiBsb2dpbiBpbmZvIHByb3ZpZGVkIGFsb25nIGV4cGxpY2l0bHkgd2l0aCBvcHRpb25zLCBkb24ndCBsb29rIGludG8gdGhlIHZhcmlhYmxlIGJpbmRpbmdzIGZvciB0aGUgc2FtZVxuICAgICAgICBjb25zdCBsb2dpbkluZm86IGFueSA9IG9wdGlvbnMubG9naW5JbmZvIHx8IG9wdGlvbnMuaW5wdXQgfHwgdmFyaWFibGUuZGF0YUJpbmRpbmc7XG5cbiAgICAgICAgLy8gY2xpZW50IHNpZGUgdmFsaWRhdGlvblxuICAgICAgICBjb25zdCBlcnJNc2cgPSB0aGlzLnZhbGlkYXRlKGxvZ2luSW5mbyk7XG5cbiAgICAgICAgLyogaWYgZXJyb3IgbWVzc2FnZSBpbml0aWFsaXplZCwgcmV0dXJuIGVycm9yICovXG4gICAgICAgIGlmIChlcnJNc2cpIHtcbiAgICAgICAgICAgIHRyaWdnZXJGbihlcnJvciwgZXJyTXNnKTtcbiAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soJ29uRXJyb3InLCB2YXJpYWJsZSwgZXJyTXNnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRyaWdnZXJpbmcgJ29uQmVmb3JlVXBkYXRlJyBhbmQgY29uc2lkZXJpbmdcbiAgICAgICAgbGV0IHBhcmFtczogYW55ID0gZ2V0Q2xvbmVkT2JqZWN0KGxvZ2luSW5mbyk7XG4gICAgICAgIGNvbnN0IG91dHB1dDogYW55ID0gaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuQkVGT1JFX1VQREFURSwgdmFyaWFibGUsIHBhcmFtcyk7XG4gICAgICAgIGlmIChfLmlzT2JqZWN0KG91dHB1dCkpIHtcbiAgICAgICAgICAgIHBhcmFtcyA9IG91dHB1dDtcbiAgICAgICAgfSBlbHNlIGlmIChvdXRwdXQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0cmlnZ2VyRm4oZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWlncmF0ZSBvbGQgcGFyYW1zIHRvIG5ld1xuICAgICAgICBwYXJhbXMgPSB0aGlzLm1pZ3JhdGVPbGRQYXJhbXMocGFyYW1zKTtcblxuICAgICAgICAvLyBnZXQgcHJldmlvdXNseSBsb2dnZWRJblVzZXIgbmFtZSAoaWYgYW55KVxuICAgICAgICBjb25zdCBsYXN0TG9nZ2VkSW5Vc2VybmFtZSA9IF8uZ2V0KHNlY3VyaXR5U2VydmljZS5nZXQoKSwgJ3VzZXJJbmZvLnVzZXJOYW1lJyk7XG5cbiAgICAgICAgdGhpcy5ub3RpZnlJbmZsaWdodCh2YXJpYWJsZSwgdHJ1ZSk7XG4gICAgICAgIHZhcmlhYmxlLnByb21pc2UgPSBzZWN1cml0eVNlcnZpY2UuYXBwTG9naW4ocGFyYW1zLCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIC8vIENsb3NpbmcgbG9naW4gZGlhbG9nIGFmdGVyIHN1Y2Nlc3NmdWwgbG9naW5cbiAgICAgICAgICAgIGRpYWxvZ1NlcnZpY2UuY2xvc2UoJ0NvbW1vbkxvZ2luRGlhbG9nJyk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiBHZXQgZnJlc2ggc2VjdXJpdHkgY29uZmlnXG4gICAgICAgICAgICAgKiBHZXQgQXBwIHZhcmlhYmxlcy4gaWYgbm90IGxvYWRlZFxuICAgICAgICAgICAgICogVXBkYXRlIGxvZ2dlZEluVXNlciB2YXJpYWJsZSB3aXRoIG5ldyB1c2VyIGRldGFpbHNcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgYXBwTWFuYWdlci5yZWxvYWRBcHBEYXRhKCkuXG4gICAgICAgICAgICB0aGVuKChjb25maWcpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBFVkVOVDogT05fUkVTVUxUXG4gICAgICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuUkVTVUxULCB2YXJpYWJsZSwgXy5nZXQoY29uZmlnLCAndXNlckluZm8nKSk7XG4gICAgICAgICAgICAgICAgLy8gRVZFTlQ6IE9OX1BSRVBBUkVTRVREQVRBXG4gICAgICAgICAgICAgICAgbmV3RGF0YVNldCA9IGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULlBSRVBBUkVfU0VUREFUQSwgdmFyaWFibGUsIF8uZ2V0KGNvbmZpZywgJ3VzZXJJbmZvJykpO1xuICAgICAgICAgICAgICAgIGlmIChuZXdEYXRhU2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXR0aW5nIG5ld0RhdGFTZXQgYXMgdGhlIHJlc3BvbnNlIHRvIHNlcnZpY2UgdmFyaWFibGUgb25QcmVwYXJlU2V0RGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgXy5zZXQoY29uZmlnLCAndXNlckluZm8nLG5ld0RhdGFTZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBoaWRlIHRoZSBzcGlubmVyIGFmdGVyIGFsbCB0aGUgbi93IGNhbGxzIGFyZSBjb21wbGV0ZWRcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeUluZmxpZ2h0KHZhcmlhYmxlLCBmYWxzZSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHRyaWdnZXJGbihzdWNjZXNzKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgICAgICAgICAgIC8vIEVWRU5UOiBPTl9TVUNDRVNTXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULlNVQ0NFU1MsIHZhcmlhYmxlLCBfLmdldChjb25maWcsICd1c2VySW5mbycpKTtcblxuICAgICAgICAgICAgICAgICAgICAvKiBoYW5kbGUgbmF2aWdhdGlvbiBpZiBkZWZhdWx0U3VjY2Vzc0hhbmRsZXIgb24gdmFyaWFibGUgaXMgdHJ1ZSAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFyaWFibGUudXNlRGVmYXVsdFN1Y2Nlc3NIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpc1NhbWVVc2VyUmVsb2dnZWRJbiA9IGxhc3RMb2dnZWRJblVzZXJuYW1lID09PSBwYXJhbXNbJ2pfdXNlcm5hbWUnXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGZpcnN0IHRpbWUgdXNlciBsb2dnaW5nIGluIG9yIHNhbWUgdXNlciByZS1sb2dnaW5nIGluLCBleGVjdXRlIG4vdyBjYWxscyBmYWlsZWQgYmVmb3JlIGxvZ2dpbmcgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbGFzdExvZ2dlZEluVXNlcm5hbWUgfHwgaXNTYW1lVXNlclJlbG9nZ2VkSW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBNYW5hZ2VyLmV4ZWN1dGVTZXNzaW9uRmFpbHVyZVJlcXVlc3RzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBnZXQgcmVkaXJlY3RUbyBwYWdlIGZyb20gVVJMIGFuZCByZW1vdmUgaXQgZnJvbSBVUkxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZGlyZWN0UGFnZSA9IHNlY3VyaXR5U2VydmljZS5nZXRDdXJyZW50Um91dGVRdWVyeVBhcmFtKCdyZWRpcmVjdFRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9SZWRpcmVjdCA9IGFwcE1hbmFnZXIubm9SZWRpcmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHF1ZXJ5IHBhcmFtcyhwYWdlIHBhcmFtcyBvZiBwYWdlIGJlaW5nIHJlZGlyZWN0ZWQgdG8pIGFuZCBhcHBlbmQgdG8gdGhlIFVSTCBhZnRlciBsb2dpbi5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHF1ZXJ5UGFyYW1zT2JqID0gc2VjdXJpdHlTZXJ2aWNlLmdldFJlZGlyZWN0ZWRSb3V0ZVF1ZXJ5UGFyYW1zKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgcmVkaXJlY3RUbyBwYXJhbSBpc24ndCByZXF1aXJlZCBhZnRlciBsb2dpblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXJ5UGFyYW1zT2JqLnJlZGlyZWN0VG8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgcXVlcnlQYXJhbXNPYmoucmVkaXJlY3RUbztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcE1hbmFnZXIubm9SZWRpcmVjdChmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmaXJzdCB0aW1lIGxvZ2luXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWxhc3RMb2dnZWRJblVzZXJuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgcmVkaXJlY3QgcGFnZSBmb3VuZCwgbmF2aWdhdGUgdG8gaXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFfLmlzRW1wdHkocmVkaXJlY3RQYWdlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJTZXJ2aWNlLm5hdmlnYXRlKFtgLyR7cmVkaXJlY3RQYWdlfWBdLCB7IHF1ZXJ5UGFyYW1zIDogcXVlcnlQYXJhbXNPYmp9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFub1JlZGlyZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbXBseSByZXNldCB0aGUgVVJMLCByb3V0ZSBoYW5kbGluZyB3aWxsIHRha2UgY2FyZSBvZiBwYWdlIHJlZGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlclNlcnZpY2UubmF2aWdhdGUoW2AvYF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsb2dpbiBhZnRlciBhIHNlc3Npb24gdGltZW91dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHJlZGlyZWN0IHBhZ2UgZm91bmQgYW5kIHNhbWUgdXNlciBsb2dzIGluIGFnYWluLCBqdXN0IG5hdmlnYXRlIHRvIHJlZGlyZWN0IHBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaXNFbXB0eShyZWRpcmVjdFBhZ2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNhbWUgdXNlciBsb2dzIGluIGFnYWluLCBqdXN0IHJlZGlyZWN0IHRvIHRoZSByZWRpcmVjdFBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RMb2dnZWRJblVzZXJuYW1lID09PSBwYXJhbXNbJ2pfdXNlcm5hbWUnXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVyU2VydmljZS5uYXZpZ2F0ZShbYC8ke3JlZGlyZWN0UGFnZX1gXSwgeyBxdWVyeVBhcmFtcyA6IHF1ZXJ5UGFyYW1zT2JqfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkaWZmZXJlbnQgdXNlciBsb2dzIGluLCByZWxvYWQgdGhlIGFwcCBhbmQgZGlzY2FyZCB0aGUgcmVkaXJlY3RQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJTZXJ2aWNlLm5hdmlnYXRlKFtgL2BdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlY3VyaXR5Q29uZmlnID0gc2VjdXJpdHlTZXJ2aWNlLmdldCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvblRpbWVvdXRMb2dpbk1vZGUgPSBfLmdldChzZWN1cml0eUNvbmZpZywgJ2xvZ2luQ29uZmlnLnNlc3Npb25UaW1lb3V0LnR5cGUnKSB8fCAnUEFHRSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGluIGRpYWxvZyBtb2RlIGFuZCBhIG5ldyB1c2VyIGxvZ3MgaW4gT1IgbG9naW4gaGFwcGVuaW5nIHRocm91Z2ggcGFnZSwgcmVsb2FkIHRoZSBhcHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1NhbWVVc2VyUmVsb2dnZWRJbiB8fCBzZXNzaW9uVGltZW91dExvZ2luTW9kZSAhPT0gJ0RJQUxPRycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlclNlcnZpY2UubmF2aWdhdGUoW2AvYF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gRVZFTlQ6IE9OX0NBTl9VUERBVEVcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuQ0FOX1VQREFURSwgdmFyaWFibGUsIF8uZ2V0KGNvbmZpZywgJ3VzZXJJbmZvJykpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgKGUpID0+IHtcbiAgICAgICAgICAgIC8vIEVWRU5UOiBPTl9SRVNVTFRcbiAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soVkFSSUFCTEVfQ09OU1RBTlRTLkVWRU5ULlJFU1VMVCwgdmFyaWFibGUsIGUpO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlJbmZsaWdodCh2YXJpYWJsZSwgZmFsc2UsIGUpO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlLmVycm9yIHx8ICdJbnZhbGlkIGNyZWRlbnRpYWxzLic7XG4gICAgICAgICAgICBjb25zdCB4aHJPYmogPSBlLmRldGFpbHM7XG4gICAgICAgICAgICAvKiBpZiBpbiBSVU4gbW9kZSwgdHJpZ2dlciBlcnJvciBldmVudHMgYXNzb2NpYXRlZCB3aXRoIHRoZSB2YXJpYWJsZSAqL1xuICAgICAgICAgICAgaWYgKENPTlNUQU5UUy5pc1J1bk1vZGUpIHtcbiAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKCdvbkVycm9yJywgdmFyaWFibGUsIGVycm9yTXNnLCB4aHJPYmosIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJpZ2dlckZuKGVycm9yLCBlcnJvck1zZywgeGhyT2JqKTtcbiAgICAgICAgICAgIC8vIEVWRU5UOiBPTl9DQU5fVVBEQVRFXG4gICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5DQU5fVVBEQVRFLCB2YXJpYWJsZSwgZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==