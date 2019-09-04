import { noop, triggerFn } from '@wm/core';
var SECURITY_FILE = 'logged-in-user.info';
var isOfflineBehaviourAdded = false;
var SecurityOfflineBehaviour = /** @class */ (function () {
    function SecurityOfflineBehaviour(app, file, deviceService, networkService, securityService) {
        var _this = this;
        this.app = app;
        this.file = file;
        this.deviceService = deviceService;
        this.networkService = networkService;
        this.securityService = securityService;
        this.saveSecurityConfigLocally = _.debounce(function (config) {
            _this._saveSecurityConfigLocally(config);
        }, 1000);
    }
    SecurityOfflineBehaviour.prototype.add = function () {
        var _this = this;
        if (isOfflineBehaviourAdded) {
            return;
        }
        isOfflineBehaviourAdded = true;
        var origLoad = this.securityService.load;
        var origAppLogout = this.securityService.appLogout;
        /**
         * Add offline behaviour to SecurityService.getConfig. When offline, this funcation returns security
         * config of last logged-in user will be returned, provided the user did not logout last time.
         *
         * @param successCallback
         * @param failureCallback
         */
        this.securityService.load = function () {
            return new Promise(function (resolve, reject) {
                if (_this.networkService.isConnected()) {
                    origLoad.call(_this.securityService).then(function (config) {
                        _this.securityConfig = config;
                        _this.saveSecurityConfigLocally(config);
                        resolve(_this.securityConfig);
                    }, reject);
                }
                else {
                    _this.readLocalSecurityConfig().then(function (config) {
                        if (config === void 0) { config = {}; }
                        _this.securityConfig = config;
                        _this.securityService.config = config;
                        return config;
                    }, function () { return origLoad.call(_this.securityConfig); }).then(resolve, reject);
                }
            });
        };
        /**
         * When users logs out, local config will be removed. If the user is offline and logs out, then user
         * will be logged out from the app and cookies are invalidated when app goes online next time.
         *
         * @param successCallback
         * @param failureCallback
         */
        this.securityService.appLogout = function (successCallback, failureCallback) {
            _this.securityConfig = {
                authenticated: false,
                loggedOut: true,
                securityEnabled: _this.securityConfig && _this.securityConfig.securityEnabled,
                loggedOutOffline: !_this.networkService.isConnected(),
                loginConfig: _this.securityConfig && _this.securityConfig.loginConfig,
                userInfo: null
            };
            _this._saveSecurityConfigLocally(_this.securityConfig).catch(noop).then(function () {
                if (_this.networkService.isConnected()) {
                    origAppLogout.call(_this.securityService, successCallback, failureCallback);
                }
                else {
                    location.assign(window.location.origin + window.location.pathname);
                }
            });
        };
        /**
         * @param successCallback
         */
        this.securityService.isAuthenticated = function (successCallback) {
            triggerFn(successCallback, _this.securityConfig.authenticated === true);
        };
        this.deviceService.whenReady().then(function () { return _this.clearLastLoggedInUser(); });
        /**
         * If the user has chosen to logout while app is offline, then invalidation of cookies happens when
         * app comes online next time.
         */
        this.app.subscribe('onNetworkStateChange', function (data) {
            if (data.isConnected) {
                _this.clearLastLoggedInUser();
            }
        });
    };
    SecurityOfflineBehaviour.prototype._saveSecurityConfigLocally = function (config) {
        return this.file.writeFile(cordova.file.dataDirectory, SECURITY_FILE, JSON.stringify(config), { replace: true });
    };
    SecurityOfflineBehaviour.prototype.clearLastLoggedInUser = function () {
        var _this = this;
        return this.readLocalSecurityConfig().then(function (config) {
            if (config && config.loggedOutOffline) {
                _this.securityService.appLogout(null, null);
            }
            else if (!_this.networkService.isConnected()) {
                _this.securityConfig = config || {};
            }
        });
    };
    SecurityOfflineBehaviour.prototype.readLocalSecurityConfig = function () {
        var _this = this;
        // reading the security info from file in dataDirectory but when this file is not available then fetching the config from the app directory
        return new Promise(function (resolve, reject) {
            var rootDir = cordova.file.dataDirectory;
            _this.file.checkFile(rootDir, SECURITY_FILE).then(function () {
                return _this.readFileAsTxt(rootDir, SECURITY_FILE).then(resolve, reject);
            }, function () {
                var folderPath = cordova.file.applicationDirectory + 'www/metadata/app', fileName = 'security-config.json';
                return _this.readFileAsTxt(folderPath, fileName).then(resolve, reject);
            });
        });
    };
    SecurityOfflineBehaviour.prototype.readFileAsTxt = function (folderPath, fileName) {
        return this.file.readAsText(folderPath, fileName).then(JSON.parse).catch(noop);
    };
    return SecurityOfflineBehaviour;
}());
export { SecurityOfflineBehaviour };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHkudXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL29mZmxpbmUvIiwic291cmNlcyI6WyJ1dGlscy9zZWN1cml0eS51dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQU8sSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQU1oRCxJQUFNLGFBQWEsR0FBRyxxQkFBcUIsQ0FBQztBQUc1QyxJQUFJLHVCQUF1QixHQUFHLEtBQUssQ0FBQztBQUVwQztJQUtJLGtDQUNZLEdBQVEsRUFDUixJQUFVLEVBQ1YsYUFBNEIsRUFDNUIsY0FBOEIsRUFDOUIsZUFBZ0M7UUFMNUMsaUJBVUM7UUFUVyxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ1IsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUNWLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFFeEMsSUFBSSxDQUFDLHlCQUF5QixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBQyxNQUFXO1lBQ3BELEtBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDYixDQUFDO0lBRU0sc0NBQUcsR0FBVjtRQUFBLGlCQXdFQztRQXZFRyxJQUFJLHVCQUF1QixFQUFFO1lBQ3pCLE9BQU87U0FDVjtRQUNELHVCQUF1QixHQUFHLElBQUksQ0FBQztRQUMvQixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztRQUMzQyxJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQztRQUNyRDs7Ozs7O1dBTUc7UUFDSCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksR0FBRztZQUN4QixPQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1B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Q0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDMUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxnREFBYSxHQUFyQixVQUFzQixVQUFVLEVBQUUsUUFBUTtRQUN0QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBQ0wsK0JBQUM7QUFBRCxDQUFDLEFBMUhELElBMEhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmlsZSB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvZmlsZSc7XG5cbmltcG9ydCB7IEFwcCwgbm9vcCwgdHJpZ2dlckZuIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgRGV2aWNlU2VydmljZSwgTmV0d29ya1NlcnZpY2UgfSBmcm9tICdAd20vbW9iaWxlL2NvcmUnO1xuaW1wb3J0IHsgU2VjdXJpdHlTZXJ2aWNlIH0gZnJvbSAnQHdtL3NlY3VyaXR5JztcblxuZGVjbGFyZSBjb25zdCBfO1xuZGVjbGFyZSBjb25zdCBjb3Jkb3ZhO1xuY29uc3QgU0VDVVJJVFlfRklMRSA9ICdsb2dnZWQtaW4tdXNlci5pbmZvJztcbmRlY2xhcmUgY29uc3QgcmVzb2x2ZUxvY2FsRmlsZVN5c3RlbVVSTDtcblxubGV0IGlzT2ZmbGluZUJlaGF2aW91ckFkZGVkID0gZmFsc2U7XG5cbmV4cG9ydCBjbGFzcyBTZWN1cml0eU9mZmxpbmVCZWhhdmlvdXIge1xuXG4gICAgcHJpdmF0ZSBzYXZlU2VjdXJpdHlDb25maWdMb2NhbGx5O1xuICAgIHByaXZhdGUgc2VjdXJpdHlDb25maWc6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBwcml2YXRlIGZpbGU6IEZpbGUsXG4gICAgICAgIHByaXZhdGUgZGV2aWNlU2VydmljZTogRGV2aWNlU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBuZXR3b3JrU2VydmljZTogTmV0d29ya1NlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgc2VjdXJpdHlTZXJ2aWNlOiBTZWN1cml0eVNlcnZpY2VcbiAgICApIHtcbiAgICAgICAgdGhpcy5zYXZlU2VjdXJpdHlDb25maWdMb2NhbGx5ID0gXy5kZWJvdW5jZSgoY29uZmlnOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3NhdmVTZWN1cml0eUNvbmZpZ0xvY2FsbHkoY29uZmlnKTtcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZCgpIHtcbiAgICAgICAgaWYgKGlzT2ZmbGluZUJlaGF2aW91ckFkZGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaXNPZmZsaW5lQmVoYXZpb3VyQWRkZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBvcmlnTG9hZCA9IHRoaXMuc2VjdXJpdHlTZXJ2aWNlLmxvYWQ7XG4gICAgICAgIGNvbnN0IG9yaWdBcHBMb2dvdXQgPSB0aGlzLnNlY3VyaXR5U2VydmljZS5hcHBMb2dvdXQ7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgb2ZmbGluZSBiZWhhdmlvdXIgdG8gU2VjdXJpdHlTZXJ2aWNlLmdldENvbmZpZy4gV2hlbiBvZmZsaW5lLCB0aGlzIGZ1bmNhdGlvbiByZXR1cm5zIHNlY3VyaXR5XG4gICAgICAgICAqIGNvbmZpZyBvZiBsYXN0IGxvZ2dlZC1pbiB1c2VyIHdpbGwgYmUgcmV0dXJuZWQsIHByb3ZpZGVkIHRoZSB1c2VyIGRpZCBub3QgbG9nb3V0IGxhc3QgdGltZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHN1Y2Nlc3NDYWxsYmFja1xuICAgICAgICAgKiBAcGFyYW0gZmFpbHVyZUNhbGxiYWNrXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNlY3VyaXR5U2VydmljZS5sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5uZXR3b3JrU2VydmljZS5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdMb2FkLmNhbGwodGhpcy5zZWN1cml0eVNlcnZpY2UpLnRoZW4oY29uZmlnID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VjdXJpdHlDb25maWcgPSBjb25maWc7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVTZWN1cml0eUNvbmZpZ0xvY2FsbHkoY29uZmlnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5zZWN1cml0eUNvbmZpZyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkTG9jYWxTZWN1cml0eUNvbmZpZygpLnRoZW4oKGNvbmZpZyA9IHt9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlY3VyaXR5Q29uZmlnID0gY29uZmlnO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWN1cml0eVNlcnZpY2UuY29uZmlnID0gY29uZmlnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4gb3JpZ0xvYWQuY2FsbCh0aGlzLnNlY3VyaXR5Q29uZmlnKSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGVuIHVzZXJzIGxvZ3Mgb3V0LCBsb2NhbCBjb25maWcgd2lsbCBiZSByZW1vdmVkLiBJZiB0aGUgdXNlciBpcyBvZmZsaW5lIGFuZCBsb2dzIG91dCwgdGhlbiB1c2VyXG4gICAgICAgICAqIHdpbGwgYmUgbG9nZ2VkIG91dCBmcm9tIHRoZSBhcHAgYW5kIGNvb2tpZXMgYXJlIGludmFsaWRhdGVkIHdoZW4gYXBwIGdvZXMgb25saW5lIG5leHQgdGltZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHN1Y2Nlc3NDYWxsYmFja1xuICAgICAgICAgKiBAcGFyYW0gZmFpbHVyZUNhbGxiYWNrXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNlY3VyaXR5U2VydmljZS5hcHBMb2dvdXQgPSAoc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2VjdXJpdHlDb25maWcgPSB7XG4gICAgICAgICAgICAgICAgYXV0aGVudGljYXRlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbG9nZ2VkT3V0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlY3VyaXR5RW5hYmxlZDogdGhpcy5zZWN1cml0eUNvbmZpZyAmJiB0aGlzLnNlY3VyaXR5Q29uZmlnLnNlY3VyaXR5RW5hYmxlZCxcbiAgICAgICAgICAgICAgICBsb2dnZWRPdXRPZmZsaW5lOiAhdGhpcy5uZXR3b3JrU2VydmljZS5pc0Nvbm5lY3RlZCgpLFxuICAgICAgICAgICAgICAgIGxvZ2luQ29uZmlnOiB0aGlzLnNlY3VyaXR5Q29uZmlnICYmIHRoaXMuc2VjdXJpdHlDb25maWcubG9naW5Db25maWcsXG4gICAgICAgICAgICAgICAgdXNlckluZm86IG51bGxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLl9zYXZlU2VjdXJpdHlDb25maWdMb2NhbGx5KHRoaXMuc2VjdXJpdHlDb25maWcpLmNhdGNoKG5vb3ApLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm5ldHdvcmtTZXJ2aWNlLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3JpZ0FwcExvZ291dC5jYWxsKHRoaXMuc2VjdXJpdHlTZXJ2aWNlLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uYXNzaWduKHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHN1Y2Nlc3NDYWxsYmFja1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZWN1cml0eVNlcnZpY2UuaXNBdXRoZW50aWNhdGVkID0gc3VjY2Vzc0NhbGxiYWNrID0+IHtcbiAgICAgICAgICAgIHRyaWdnZXJGbihzdWNjZXNzQ2FsbGJhY2ssIHRoaXMuc2VjdXJpdHlDb25maWcuYXV0aGVudGljYXRlZCA9PT0gdHJ1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZGV2aWNlU2VydmljZS53aGVuUmVhZHkoKS50aGVuKCgpID0+IHRoaXMuY2xlYXJMYXN0TG9nZ2VkSW5Vc2VyKCkpO1xuICAgICAgICAvKipcbiAgICAgICAgICogSWYgdGhlIHVzZXIgaGFzIGNob3NlbiB0byBsb2dvdXQgd2hpbGUgYXBwIGlzIG9mZmxpbmUsIHRoZW4gaW52YWxpZGF0aW9uIG9mIGNvb2tpZXMgaGFwcGVucyB3aGVuXG4gICAgICAgICAqIGFwcCBjb21lcyBvbmxpbmUgbmV4dCB0aW1lLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hcHAuc3Vic2NyaWJlKCdvbk5ldHdvcmtTdGF0ZUNoYW5nZScsIGRhdGEgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEuaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTGFzdExvZ2dlZEluVXNlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zYXZlU2VjdXJpdHlDb25maWdMb2NhbGx5KGNvbmZpZzogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS53cml0ZUZpbGUoY29yZG92YS5maWxlLmRhdGFEaXJlY3RvcnksIFNFQ1VSSVRZX0ZJTEUsIEpTT04uc3RyaW5naWZ5KGNvbmZpZyksIHsgcmVwbGFjZSA6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjbGVhckxhc3RMb2dnZWRJblVzZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlYWRMb2NhbFNlY3VyaXR5Q29uZmlnKCkudGhlbihjb25maWcgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcubG9nZ2VkT3V0T2ZmbGluZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VjdXJpdHlTZXJ2aWNlLmFwcExvZ291dChudWxsLCBudWxsKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMubmV0d29ya1NlcnZpY2UuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VjdXJpdHlDb25maWcgPSBjb25maWcgfHwge307XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVhZExvY2FsU2VjdXJpdHlDb25maWcoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgLy8gcmVhZGluZyB0aGUgc2VjdXJpdHkgaW5mbyBmcm9tIGZpbGUgaW4gZGF0YURpcmVjdG9yeSBidXQgd2hlbiB0aGlzIGZpbGUgaXMgbm90IGF2YWlsYWJsZSB0aGVuIGZldGNoaW5nIHRoZSBjb25maWcgZnJvbSB0aGUgYXBwIGRpcmVjdG9yeVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm9vdERpciA9IGNvcmRvdmEuZmlsZS5kYXRhRGlyZWN0b3J5O1xuICAgICAgICAgICAgdGhpcy5maWxlLmNoZWNrRmlsZShyb290RGlyLCBTRUNVUklUWV9GSUxFKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkRmlsZUFzVHh0KHJvb3REaXIsIFNFQ1VSSVRZX0ZJTEUpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmb2xkZXJQYXRoID0gY29yZG92YS5maWxlLmFwcGxpY2F0aW9uRGlyZWN0b3J5ICsgJ3d3dy9tZXRhZGF0YS9hcHAnLFxuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9ICdzZWN1cml0eS1jb25maWcuanNvbic7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZEZpbGVBc1R4dChmb2xkZXJQYXRoLCBmaWxlTmFtZSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVhZEZpbGVBc1R4dChmb2xkZXJQYXRoLCBmaWxlTmFtZSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUucmVhZEFzVGV4dChmb2xkZXJQYXRoLCBmaWxlTmFtZSkudGhlbihKU09OLnBhcnNlKS5jYXRjaChub29wKTtcbiAgICB9XG59XG4iXX0=