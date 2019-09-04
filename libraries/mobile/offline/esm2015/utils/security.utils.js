import { noop, triggerFn } from '@wm/core';
const SECURITY_FILE = 'logged-in-user.info';
let isOfflineBehaviourAdded = false;
export class SecurityOfflineBehaviour {
    constructor(app, file, deviceService, networkService, securityService) {
        this.app = app;
        this.file = file;
        this.deviceService = deviceService;
        this.networkService = networkService;
        this.securityService = securityService;
        this.saveSecurityConfigLocally = _.debounce((config) => {
            this._saveSecurityConfigLocally(config);
        }, 1000);
    }
    add() {
        if (isOfflineBehaviourAdded) {
            return;
        }
        isOfflineBehaviourAdded = true;
        const origLoad = this.securityService.load;
        const origAppLogout = this.securityService.appLogout;
        /**
         * Add offline behaviour to SecurityService.getConfig. When offline, this funcation returns security
         * config of last logged-in user will be returned, provided the user did not logout last time.
         *
         * @param successCallback
         * @param failureCallback
         */
        this.securityService.load = () => {
            return new Promise((resolve, reject) => {
                if (this.networkService.isConnected()) {
                    origLoad.call(this.securityService).then(config => {
                        this.securityConfig = config;
                        this.saveSecurityConfigLocally(config);
                        resolve(this.securityConfig);
                    }, reject);
                }
                else {
                    this.readLocalSecurityConfig().then((config = {}) => {
                        this.securityConfig = config;
                        this.securityService.config = config;
                        return config;
                    }, () => origLoad.call(this.securityConfig)).then(resolve, reject);
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
        this.securityService.appLogout = (successCallback, failureCallback) => {
            this.securityConfig = {
                authenticated: false,
                loggedOut: true,
                securityEnabled: this.securityConfig && this.securityConfig.securityEnabled,
                loggedOutOffline: !this.networkService.isConnected(),
                loginConfig: this.securityConfig && this.securityConfig.loginConfig,
                userInfo: null
            };
            this._saveSecurityConfigLocally(this.securityConfig).catch(noop).then(() => {
                if (this.networkService.isConnected()) {
                    origAppLogout.call(this.securityService, successCallback, failureCallback);
                }
                else {
                    location.assign(window.location.origin + window.location.pathname);
                }
            });
        };
        /**
         * @param successCallback
         */
        this.securityService.isAuthenticated = successCallback => {
            triggerFn(successCallback, this.securityConfig.authenticated === true);
        };
        this.deviceService.whenReady().then(() => this.clearLastLoggedInUser());
        /**
         * If the user has chosen to logout while app is offline, then invalidation of cookies happens when
         * app comes online next time.
         */
        this.app.subscribe('onNetworkStateChange', data => {
            if (data.isConnected) {
                this.clearLastLoggedInUser();
            }
        });
    }
    _saveSecurityConfigLocally(config) {
        return this.file.writeFile(cordova.file.dataDirectory, SECURITY_FILE, JSON.stringify(config), { replace: true });
    }
    clearLastLoggedInUser() {
        return this.readLocalSecurityConfig().then(config => {
            if (config && config.loggedOutOffline) {
                this.securityService.appLogout(null, null);
            }
            else if (!this.networkService.isConnected()) {
                this.securityConfig = config || {};
            }
        });
    }
    readLocalSecurityConfig() {
        // reading the security info from file in dataDirectory but when this file is not available then fetching the config from the app directory
        return new Promise((resolve, reject) => {
            const rootDir = cordova.file.dataDirectory;
            this.file.checkFile(rootDir, SECURITY_FILE).then(() => {
                return this.readFileAsTxt(rootDir, SECURITY_FILE).then(resolve, reject);
            }, () => {
                const folderPath = cordova.file.applicationDirectory + 'www/metadata/app', fileName = 'security-config.json';
                return this.readFileAsTxt(folderPath, fileName).then(resolve, reject);
            });
        });
    }
    readFileAsTxt(folderPath, fileName) {
        return this.file.readAsText(folderPath, fileName).then(JSON.parse).catch(noop);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHkudXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL29mZmxpbmUvIiwic291cmNlcyI6WyJ1dGlscy9zZWN1cml0eS51dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQU8sSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQU1oRCxNQUFNLGFBQWEsR0FBRyxxQkFBcUIsQ0FBQztBQUc1QyxJQUFJLHVCQUF1QixHQUFHLEtBQUssQ0FBQztBQUVwQyxNQUFNLE9BQU8sd0JBQXdCO0lBS2pDLFlBQ1ksR0FBUSxFQUNSLElBQVUsRUFDVixhQUE0QixFQUM1QixjQUE4QixFQUM5QixlQUFnQztRQUpoQyxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ1IsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUNWLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFFeEMsSUFBSSxDQUFDLHlCQUF5QixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRTtZQUN4RCxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVNLEdBQUc7UUFDTixJQUFJLHVCQUF1QixFQUFFO1lBQ3pCLE9BQU87U0FDVjtRQUNELHVCQUF1QixHQUFHLElBQUksQ0FBQztRQUMvQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztRQUMzQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQztRQUNyRDs7Ozs7O1dBTUc7UUFDSCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUU7WUFDN0IsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8s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QUcsc0JBQXNCLENBQUM7Z0JBQ3RDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMxRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLGFBQWEsQ0FBQyxVQUFVLEVBQUUsUUFBUTtRQUN0QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRixDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGaWxlIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9maWxlJztcblxuaW1wb3J0IHsgQXBwLCBub29wLCB0cmlnZ2VyRm4gfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBEZXZpY2VTZXJ2aWNlLCBOZXR3b3JrU2VydmljZSB9IGZyb20gJ0B3bS9tb2JpbGUvY29yZSc7XG5pbXBvcnQgeyBTZWN1cml0eVNlcnZpY2UgfSBmcm9tICdAd20vc2VjdXJpdHknO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5kZWNsYXJlIGNvbnN0IGNvcmRvdmE7XG5jb25zdCBTRUNVUklUWV9GSUxFID0gJ2xvZ2dlZC1pbi11c2VyLmluZm8nO1xuZGVjbGFyZSBjb25zdCByZXNvbHZlTG9jYWxGaWxlU3lzdGVtVVJMO1xuXG5sZXQgaXNPZmZsaW5lQmVoYXZpb3VyQWRkZWQgPSBmYWxzZTtcblxuZXhwb3J0IGNsYXNzIFNlY3VyaXR5T2ZmbGluZUJlaGF2aW91ciB7XG5cbiAgICBwcml2YXRlIHNhdmVTZWN1cml0eUNvbmZpZ0xvY2FsbHk7XG4gICAgcHJpdmF0ZSBzZWN1cml0eUNvbmZpZzogYW55O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgYXBwOiBBcHAsXG4gICAgICAgIHByaXZhdGUgZmlsZTogRmlsZSxcbiAgICAgICAgcHJpdmF0ZSBkZXZpY2VTZXJ2aWNlOiBEZXZpY2VTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIG5ldHdvcmtTZXJ2aWNlOiBOZXR3b3JrU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBzZWN1cml0eVNlcnZpY2U6IFNlY3VyaXR5U2VydmljZVxuICAgICkge1xuICAgICAgICB0aGlzLnNhdmVTZWN1cml0eUNvbmZpZ0xvY2FsbHkgPSBfLmRlYm91bmNlKChjb25maWc6IGFueSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fc2F2ZVNlY3VyaXR5Q29uZmlnTG9jYWxseShjb25maWcpO1xuICAgICAgICB9LCAxMDAwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkKCkge1xuICAgICAgICBpZiAoaXNPZmZsaW5lQmVoYXZpb3VyQWRkZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpc09mZmxpbmVCZWhhdmlvdXJBZGRlZCA9IHRydWU7XG4gICAgICAgIGNvbnN0IG9yaWdMb2FkID0gdGhpcy5zZWN1cml0eVNlcnZpY2UubG9hZDtcbiAgICAgICAgY29uc3Qgb3JpZ0FwcExvZ291dCA9IHRoaXMuc2VjdXJpdHlTZXJ2aWNlLmFwcExvZ291dDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBvZmZsaW5lIGJlaGF2aW91ciB0byBTZWN1cml0eVNlcnZpY2UuZ2V0Q29uZmlnLiBXaGVuIG9mZmxpbmUsIHRoaXMgZnVuY2F0aW9uIHJldHVybnMgc2VjdXJpdHlcbiAgICAgICAgICogY29uZmlnIG9mIGxhc3QgbG9nZ2VkLWluIHVzZXIgd2lsbCBiZSByZXR1cm5lZCwgcHJvdmlkZWQgdGhlIHVzZXIgZGlkIG5vdCBsb2dvdXQgbGFzdCB0aW1lLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gc3VjY2Vzc0NhbGxiYWNrXG4gICAgICAgICAqIEBwYXJhbSBmYWlsdXJlQ2FsbGJhY2tcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2VjdXJpdHlTZXJ2aWNlLmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm5ldHdvcmtTZXJ2aWNlLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3JpZ0xvYWQuY2FsbCh0aGlzLnNlY3VyaXR5U2VydmljZSkudGhlbihjb25maWcgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWN1cml0eUNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZVNlY3VyaXR5Q29uZmlnTG9jYWxseShjb25maWcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnNlY3VyaXR5Q29uZmlnKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWRMb2NhbFNlY3VyaXR5Q29uZmlnKCkudGhlbigoY29uZmlnID0ge30pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VjdXJpdHlDb25maWcgPSBjb25maWc7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlY3VyaXR5U2VydmljZS5jb25maWcgPSBjb25maWc7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiBvcmlnTG9hZC5jYWxsKHRoaXMuc2VjdXJpdHlDb25maWcpKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZW4gdXNlcnMgbG9ncyBvdXQsIGxvY2FsIGNvbmZpZyB3aWxsIGJlIHJlbW92ZWQuIElmIHRoZSB1c2VyIGlzIG9mZmxpbmUgYW5kIGxvZ3Mgb3V0LCB0aGVuIHVzZXJcbiAgICAgICAgICogd2lsbCBiZSBsb2dnZWQgb3V0IGZyb20gdGhlIGFwcCBhbmQgY29va2llcyBhcmUgaW52YWxpZGF0ZWQgd2hlbiBhcHAgZ29lcyBvbmxpbmUgbmV4dCB0aW1lLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gc3VjY2Vzc0NhbGxiYWNrXG4gICAgICAgICAqIEBwYXJhbSBmYWlsdXJlQ2FsbGJhY2tcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2VjdXJpdHlTZXJ2aWNlLmFwcExvZ291dCA9IChzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZWN1cml0eUNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICBhdXRoZW50aWNhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBsb2dnZWRPdXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgc2VjdXJpdHlFbmFibGVkOiB0aGlzLnNlY3VyaXR5Q29uZmlnICYmIHRoaXMuc2VjdXJpdHlDb25maWcuc2VjdXJpdHlFbmFibGVkLFxuICAgICAgICAgICAgICAgIGxvZ2dlZE91dE9mZmxpbmU6ICF0aGlzLm5ldHdvcmtTZXJ2aWNlLmlzQ29ubmVjdGVkKCksXG4gICAgICAgICAgICAgICAgbG9naW5Db25maWc6IHRoaXMuc2VjdXJpdHlDb25maWcgJiYgdGhpcy5zZWN1cml0eUNvbmZpZy5sb2dpbkNvbmZpZyxcbiAgICAgICAgICAgICAgICB1c2VySW5mbzogbnVsbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX3NhdmVTZWN1cml0eUNvbmZpZ0xvY2FsbHkodGhpcy5zZWN1cml0eUNvbmZpZykuY2F0Y2gobm9vcCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubmV0d29ya1NlcnZpY2UuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICBvcmlnQXBwTG9nb3V0LmNhbGwodGhpcy5zZWN1cml0eVNlcnZpY2UsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5hc3NpZ24od2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gc3VjY2Vzc0NhbGxiYWNrXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNlY3VyaXR5U2VydmljZS5pc0F1dGhlbnRpY2F0ZWQgPSBzdWNjZXNzQ2FsbGJhY2sgPT4ge1xuICAgICAgICAgICAgdHJpZ2dlckZuKHN1Y2Nlc3NDYWxsYmFjaywgdGhpcy5zZWN1cml0eUNvbmZpZy5hdXRoZW50aWNhdGVkID09PSB0cnVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5kZXZpY2VTZXJ2aWNlLndoZW5SZWFkeSgpLnRoZW4oKCkgPT4gdGhpcy5jbGVhckxhc3RMb2dnZWRJblVzZXIoKSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiB0aGUgdXNlciBoYXMgY2hvc2VuIHRvIGxvZ291dCB3aGlsZSBhcHAgaXMgb2ZmbGluZSwgdGhlbiBpbnZhbGlkYXRpb24gb2YgY29va2llcyBoYXBwZW5zIHdoZW5cbiAgICAgICAgICogYXBwIGNvbWVzIG9ubGluZSBuZXh0IHRpbWUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFwcC5zdWJzY3JpYmUoJ29uTmV0d29ya1N0YXRlQ2hhbmdlJywgZGF0YSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YS5pc0Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJMYXN0TG9nZ2VkSW5Vc2VyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NhdmVTZWN1cml0eUNvbmZpZ0xvY2FsbHkoY29uZmlnOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLndyaXRlRmlsZShjb3Jkb3ZhLmZpbGUuZGF0YURpcmVjdG9yeSwgU0VDVVJJVFlfRklMRSwgSlNPTi5zdHJpbmdpZnkoY29uZmlnKSwgeyByZXBsYWNlIDogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNsZWFyTGFzdExvZ2dlZEluVXNlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZExvY2FsU2VjdXJpdHlDb25maWcoKS50aGVuKGNvbmZpZyA9PiB7XG4gICAgICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5sb2dnZWRPdXRPZmZsaW5lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWN1cml0eVNlcnZpY2UuYXBwTG9nb3V0KG51bGwsIG51bGwpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5uZXR3b3JrU2VydmljZS5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWN1cml0eUNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWFkTG9jYWxTZWN1cml0eUNvbmZpZygpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICAvLyByZWFkaW5nIHRoZSBzZWN1cml0eSBpbmZvIGZyb20gZmlsZSBpbiBkYXRhRGlyZWN0b3J5IGJ1dCB3aGVuIHRoaXMgZmlsZSBpcyBub3QgYXZhaWxhYmxlIHRoZW4gZmV0Y2hpbmcgdGhlIGNvbmZpZyBmcm9tIHRoZSBhcHAgZGlyZWN0b3J5XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb290RGlyID0gY29yZG92YS5maWxlLmRhdGFEaXJlY3Rvcnk7XG4gICAgICAgICAgICB0aGlzLmZpbGUuY2hlY2tGaWxlKHJvb3REaXIsIFNFQ1VSSVRZX0ZJTEUpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlYWRGaWxlQXNUeHQocm9vdERpciwgU0VDVVJJVFlfRklMRSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZvbGRlclBhdGggPSBjb3Jkb3ZhLmZpbGUuYXBwbGljYXRpb25EaXJlY3RvcnkgKyAnd3d3L21ldGFkYXRhL2FwcCcsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gJ3NlY3VyaXR5LWNvbmZpZy5qc29uJztcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkRmlsZUFzVHh0KGZvbGRlclBhdGgsIGZpbGVOYW1lKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWFkRmlsZUFzVHh0KGZvbGRlclBhdGgsIGZpbGVOYW1lKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5yZWFkQXNUZXh0KGZvbGRlclBhdGgsIGZpbGVOYW1lKS50aGVuKEpTT04ucGFyc2UpLmNhdGNoKG5vb3ApO1xuICAgIH1cbn1cbiJdfQ==