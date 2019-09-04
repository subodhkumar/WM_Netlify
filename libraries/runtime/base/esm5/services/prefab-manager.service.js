import { Injectable } from '@angular/core';
import { loadScripts, loadStyleSheets, stringStartsWith } from '@wm/core';
import { MetadataService } from '@wm/variables';
import { PrefabConfigProvider } from '../types/types';
import { getPrefabBaseUrl, isPrefabInPreview } from '../util/utils';
var prefabsWithError = new Set();
var inProgress = new Map();
var resolvedPrefabs = new Set();
var getPrefabResourceUrl = function (resourcePath, resourceBasePath) {
    var _url = resourcePath;
    if (!stringStartsWith(resourcePath, 'http://|https://|//')) {
        _url = (resourceBasePath + _url).replace('//', '/');
    }
    return _url;
};
var ɵ0 = getPrefabResourceUrl;
var PrefabManagerService = /** @class */ (function () {
    function PrefabManagerService($metadata, prefabConfigProvider) {
        this.$metadata = $metadata;
        this.prefabConfigProvider = prefabConfigProvider;
    }
    PrefabManagerService.prototype.getConfig = function (prefabName) {
        return this.prefabConfigProvider.getConfig(prefabName);
    };
    PrefabManagerService.prototype.loadServiceDefs = function (prefabName) {
        return isPrefabInPreview(prefabName) ? Promise.resolve() : this.$metadata.load(prefabName);
    };
    PrefabManagerService.prototype.loadStyles = function (prefabName, _a) {
        var styles = (_a === void 0 ? { resources: { styles: [] } } : _a).resources.styles;
        var baseUrl = getPrefabBaseUrl(prefabName);
        var _styles = styles.map(function (url) {
            if (!_.endsWith(url, '/pages/Main/Main.css')) {
                return getPrefabResourceUrl(url, baseUrl);
            }
            return undefined;
        }).filter(function (url) { return !!url; });
        loadStyleSheets(_styles);
        return Promise.resolve();
    };
    // TODO [Vinay] - implement onPrefabResourceLoad
    PrefabManagerService.prototype.loadScripts = function (prefabName, _a) {
        var scripts = (_a === void 0 ? { resources: { scripts: [] } } : _a).resources.scripts;
        var baseUrl = getPrefabBaseUrl(prefabName);
        var _scripts = scripts.map(function (url) { return getPrefabResourceUrl(url, baseUrl); });
        return loadScripts(_scripts);
    };
    PrefabManagerService.prototype.setInProgress = function (prefabName) {
        var _res;
        var _rej;
        var _promise = new Promise(function (res, rej) {
            _res = res;
            _rej = rej;
        });
        _promise.resolve = _res;
        _promise.reject = _rej;
        inProgress.set(prefabName, _promise);
    };
    PrefabManagerService.prototype.resolveInProgress = function (prefabName) {
        if (inProgress.get(prefabName)) {
            inProgress.get(prefabName).resolve();
            inProgress.delete(prefabName);
        }
    };
    PrefabManagerService.prototype.loadDependencies = function (prefabName) {
        var _this = this;
        if (resolvedPrefabs.has(prefabName)) {
            return Promise.resolve();
        }
        if (prefabsWithError.has(prefabName)) {
            return Promise.reject('');
        }
        if (inProgress.get(prefabName)) {
            return inProgress.get(prefabName);
        }
        this.setInProgress(prefabName);
        return this.getConfig(prefabName)
            .then(function (config) {
            return Promise.all([
                _this.loadStyles(prefabName, config),
                _this.loadScripts(prefabName, config),
                _this.loadServiceDefs(prefabName)
            ]).then(function () {
                _this.resolveInProgress(prefabName);
                resolvedPrefabs.add(prefabName);
            });
        });
    };
    PrefabManagerService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    PrefabManagerService.ctorParameters = function () { return [
        { type: MetadataService },
        { type: PrefabConfigProvider }
    ]; };
    return PrefabManagerService;
}());
export { PrefabManagerService };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLW1hbmFnZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9wcmVmYWItbWFuYWdlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDMUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVoRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFJcEUsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0FBQzNDLElBQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO0FBQ25ELElBQU0sZUFBZSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7QUFFMUMsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLFlBQVksRUFBRSxnQkFBZ0I7SUFDeEQsSUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFDO0lBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUscUJBQXFCLENBQUMsRUFBRTtRQUN4RCxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ3ZEO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQyxDQUFDOztBQUVGO0lBR0ksOEJBQ1ksU0FBMEIsRUFDMUIsb0JBQTBDO1FBRDFDLGNBQVMsR0FBVCxTQUFTLENBQWlCO1FBQzFCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7SUFDbkQsQ0FBQztJQUVHLHdDQUFT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QUMsVUFBVSxDQUFDLENBQUM7U0FDckM7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRS9CLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7YUFDNUIsSUFBSSxDQUFDLFVBQUEsTUFBTTtZQUNSLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDZixLQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUM7Z0JBQ25DLEtBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQztnQkFDcEMsS0FBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbkMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDSixLQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ25DLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7O2dCQXRGSixVQUFVOzs7O2dCQW5CRixlQUFlO2dCQUVmLG9CQUFvQjs7SUF3RzdCLDJCQUFDO0NBQUEsQUF2RkQsSUF1RkM7U0F0Rlksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBsb2FkU2NyaXB0cywgbG9hZFN0eWxlU2hlZXRzLCBzdHJpbmdTdGFydHNXaXRoIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgTWV0YWRhdGFTZXJ2aWNlIH0gZnJvbSAnQHdtL3ZhcmlhYmxlcyc7XG5cbmltcG9ydCB7IFByZWZhYkNvbmZpZ1Byb3ZpZGVyIH0gZnJvbSAnLi4vdHlwZXMvdHlwZXMnO1xuaW1wb3J0IHsgZ2V0UHJlZmFiQmFzZVVybCwgaXNQcmVmYWJJblByZXZpZXcgfSBmcm9tICcuLi91dGlsL3V0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBwcmVmYWJzV2l0aEVycm9yID0gbmV3IFNldDxzdHJpbmc+KCk7XG5jb25zdCBpblByb2dyZXNzID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8YW55Pj4oKTtcbmNvbnN0IHJlc29sdmVkUHJlZmFicyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG5jb25zdCBnZXRQcmVmYWJSZXNvdXJjZVVybCA9IChyZXNvdXJjZVBhdGgsIHJlc291cmNlQmFzZVBhdGgpID0+IHtcbiAgICBsZXQgX3VybCA9IHJlc291cmNlUGF0aDtcbiAgICBpZiAoIXN0cmluZ1N0YXJ0c1dpdGgocmVzb3VyY2VQYXRoLCAnaHR0cDovL3xodHRwczovL3wvLycpKSB7XG4gICAgICAgIF91cmwgPSAocmVzb3VyY2VCYXNlUGF0aCArIF91cmwpLnJlcGxhY2UoJy8vJywgJy8nKTtcbiAgICB9XG4gICAgcmV0dXJuIF91cmw7XG59O1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUHJlZmFiTWFuYWdlclNlcnZpY2Uge1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgJG1ldGFkYXRhOiBNZXRhZGF0YVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgcHJlZmFiQ29uZmlnUHJvdmlkZXI6IFByZWZhYkNvbmZpZ1Byb3ZpZGVyXG4gICAgKSB7fVxuXG4gICAgcHVibGljIGdldENvbmZpZyhwcmVmYWJOYW1lKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJlZmFiQ29uZmlnUHJvdmlkZXIuZ2V0Q29uZmlnKHByZWZhYk5hbWUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBsb2FkU2VydmljZURlZnMocHJlZmFiTmFtZSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBpc1ByZWZhYkluUHJldmlldyhwcmVmYWJOYW1lKSA/IFByb21pc2UucmVzb2x2ZSgpIDogdGhpcy4kbWV0YWRhdGEubG9hZChwcmVmYWJOYW1lKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgbG9hZFN0eWxlcyhwcmVmYWJOYW1lLCB7cmVzb3VyY2VzOiB7c3R5bGVzfX0gPSB7cmVzb3VyY2VzOiB7c3R5bGVzOiBbXX19KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGJhc2VVcmwgPSBnZXRQcmVmYWJCYXNlVXJsKHByZWZhYk5hbWUpO1xuICAgICAgICBjb25zdCBfc3R5bGVzID0gc3R5bGVzLm1hcCh1cmwgPT4ge1xuICAgICAgICAgICAgaWYgKCFfLmVuZHNXaXRoKHVybCwgJy9wYWdlcy9NYWluL01haW4uY3NzJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0UHJlZmFiUmVzb3VyY2VVcmwodXJsLCBiYXNlVXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH0pLmZpbHRlcih1cmwgPT4gISF1cmwpO1xuXG4gICAgICAgIGxvYWRTdHlsZVNoZWV0cyhfc3R5bGVzKTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyBbVmluYXldIC0gaW1wbGVtZW50IG9uUHJlZmFiUmVzb3VyY2VMb2FkXG4gICAgcHJvdGVjdGVkIGxvYWRTY3JpcHRzKHByZWZhYk5hbWUsIHtyZXNvdXJjZXM6IHtzY3JpcHRzfX0gPSB7cmVzb3VyY2VzOiB7c2NyaXB0czogW119fSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IGJhc2VVcmwgPSBnZXRQcmVmYWJCYXNlVXJsKHByZWZhYk5hbWUpO1xuICAgICAgICBjb25zdCBfc2NyaXB0cyA9IHNjcmlwdHMubWFwKHVybCA9PiBnZXRQcmVmYWJSZXNvdXJjZVVybCh1cmwsIGJhc2VVcmwpKTtcblxuICAgICAgICByZXR1cm4gbG9hZFNjcmlwdHMoX3NjcmlwdHMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0SW5Qcm9ncmVzcyhwcmVmYWJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IF9yZXM7XG4gICAgICAgIGxldCBfcmVqO1xuICAgICAgICBjb25zdCBfcHJvbWlzZTogYW55ID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAgICAgICBfcmVzID0gcmVzO1xuICAgICAgICAgICAgX3JlaiA9IHJlajtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgX3Byb21pc2UucmVzb2x2ZSA9IF9yZXM7XG4gICAgICAgIF9wcm9taXNlLnJlamVjdCA9IF9yZWo7XG5cbiAgICAgICAgaW5Qcm9ncmVzcy5zZXQocHJlZmFiTmFtZSwgX3Byb21pc2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVzb2x2ZUluUHJvZ3Jlc3MocHJlZmFiTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGlmIChpblByb2dyZXNzLmdldChwcmVmYWJOYW1lKSkge1xuICAgICAgICAgICAgKGluUHJvZ3Jlc3MuZ2V0KHByZWZhYk5hbWUpIGFzIGFueSkucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaW5Qcm9ncmVzcy5kZWxldGUocHJlZmFiTmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbG9hZERlcGVuZGVuY2llcyhwcmVmYWJOYW1lKTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgICAgICAgaWYgKHJlc29sdmVkUHJlZmFicy5oYXMocHJlZmFiTmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcmVmYWJzV2l0aEVycm9yLmhhcyhwcmVmYWJOYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpblByb2dyZXNzLmdldChwcmVmYWJOYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIGluUHJvZ3Jlc3MuZ2V0KHByZWZhYk5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRJblByb2dyZXNzKHByZWZhYk5hbWUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldENvbmZpZyhwcmVmYWJOYW1lKVxuICAgICAgICAgICAgLnRoZW4oY29uZmlnID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRTdHlsZXMocHJlZmFiTmFtZSwgY29uZmlnKSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkU2NyaXB0cyhwcmVmYWJOYW1lLCBjb25maWcpLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRTZXJ2aWNlRGVmcyhwcmVmYWJOYW1lKVxuICAgICAgICAgICAgICAgIF0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29sdmVJblByb2dyZXNzKHByZWZhYk5hbWUpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZFByZWZhYnMuYWRkKHByZWZhYk5hbWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuIl19