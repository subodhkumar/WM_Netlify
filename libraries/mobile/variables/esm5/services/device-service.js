import * as tslib_1 from "tslib";
import { $appDigest } from '@wm/core';
import { DeviceVariableService, initiateCallback } from '@wm/variables';
/**
 * this file contains all device operations under 'device' service.
 */
var DeviceService = /** @class */ (function (_super) {
    tslib_1.__extends(DeviceService, _super);
    function DeviceService(app, appVersion, device, geoLocation, networkService, vibrateService) {
        var _this = _super.call(this) || this;
        _this.name = 'device';
        _this.operations = [];
        _this.operations.push(new AppInfoOperation(device, appVersion), new CurrentGeoPositionOperation(geoLocation), new DeviceInfoOperation(device), new GetNetworkInfoOperation(app, networkService), new GoOfflineOperation(networkService), new GoOnlineOperation(networkService), new VibrateOperation(vibrateService));
        app.subscribe('onNetworkStateChange', function (data) {
            app.networkStatus = data;
            $appDigest();
        });
        app.networkStatus = {
            isConnecting: false,
            isConnected: true,
            isNetworkAvailable: true,
            isServiceAvailable: true
        };
        return _this;
    }
    return DeviceService;
}(DeviceVariableService));
export { DeviceService };
/**
 * This class handles 'getAppInfo' device operation.
 */
var AppInfoOperation = /** @class */ (function () {
    function AppInfoOperation(device, appVersion) {
        this.device = device;
        this.appVersion = appVersion;
        this.name = 'getAppInfo';
        this.model = {
            appversion: 'X.X.X',
            cordovaversion: 'X.X.X'
        };
        this.properties = [
            { target: 'startUpdate', type: 'boolean', value: true, hide: true }
        ];
    }
    AppInfoOperation.prototype.invoke = function (variable, options) {
        var cordovaVersion = this.device.cordova;
        return this.appVersion.getVersionNumber().then(function (appVersion) {
            return {
                appversion: appVersion,
                cordovaversion: cordovaVersion
            };
        });
    };
    return AppInfoOperation;
}());
/**
 * This class handles 'getCurrentGeoPosition' device operation.
 */
var CurrentGeoPositionOperation = /** @class */ (function () {
    function CurrentGeoPositionOperation(geoLocation) {
        this.geoLocation = geoLocation;
        this.name = 'getCurrentGeoPosition';
        this.model = {
            coords: {
                latitude: 0,
                longitude: 0,
                altitude: 0,
                accuracy: 0,
                altitudeAccuracy: 0,
                heading: 0,
                speed: 0
            },
            timestamp: 0
        };
        this.properties = [
            { target: 'startUpdate', type: 'boolean', value: true, hide: true },
            { target: 'autoUpdate', type: 'boolean', value: true, hide: true },
            { target: 'geolocationHighAccuracy', type: 'boolean', value: true, dataBinding: true },
            { target: 'geolocationMaximumAge', type: 'number', value: 3, dataBinding: true },
            { target: 'geolocationTimeout', type: 'number', value: 5, dataBinding: true }
        ];
        this.requiredCordovaPlugins = ['GEOLOCATION'];
        this.waitingQueue = [];
        this.options = {
            maximumAge: 3000,
            timeout: (2 * 60) * 1000,
            enableHighAccuracy: true
        };
    }
    CurrentGeoPositionOperation.prototype.watchPosition = function () {
        var _this = this;
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        var options = window['WM_GEO_LOCATION_OPTIONS'] || this.options;
        this.watchId = navigator.geolocation.watchPosition(function (position) {
            _this.lastKnownPosition = {
                coords: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    altitude: position.coords.altitude,
                    accuracy: position.coords.accuracy,
                    altitudeAccuracy: position.coords.altitudeAccuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed
                },
                timestamp: position.timestamp
            };
            if (_this.waitingQueue.length > 0) {
                _this.waitingQueue.forEach(function (fn) { return fn(_this.lastKnownPosition); });
                _this.waitingQueue.length = 0;
            }
            $(document).off('touchend.usergesture');
        }, function () {
            _this.watchId = null;
        }, options);
    };
    CurrentGeoPositionOperation.prototype.invoke = function (variable, options, dataBindings) {
        var _this = this;
        if (!this.watchId || !this.lastKnownPosition) {
            this.watchPosition();
            $(document).on('touchend.usergesture', function () { return _this.watchPosition(); });
        }
        var geoLocationOptions = {
            maximumAge: dataBindings.get('geolocationMaximumAge') * 1000,
            timeout: dataBindings.get('geolocationTimeout') * 1000,
            enableHighAccuracy: dataBindings.get('geolocationHighAccuracy')
        };
        if (this.lastKnownPosition) {
            return Promise.resolve(this.lastKnownPosition);
        }
        return new Promise(function (resolve) {
            var c = function (position) {
                resolve(position);
            };
            setTimeout(function () {
                var index = _this.waitingQueue.indexOf(c);
                if (index > -1) {
                    _this.waitingQueue.splice(index, 1);
                    resolve(_this.model);
                }
            }, _this.options.timeout);
            _this.waitingQueue.push(c);
        });
    };
    return CurrentGeoPositionOperation;
}());
/**
 * This class handles 'getDeviceInfo' device operation.
 */
var DeviceInfoOperation = /** @class */ (function () {
    function DeviceInfoOperation(device) {
        this.device = device;
        this.name = 'getDeviceInfo';
        this.model = {
            deviceModel: 'DEVICEMODEL',
            os: 'DEVICEOS',
            osVersion: 'X.X.X',
            deviceUUID: 'DEVICEUUID'
        };
        this.properties = [
            { target: 'startUpdate', type: 'boolean', value: true, hide: true }
        ];
    }
    DeviceInfoOperation.prototype.invoke = function (variable, options) {
        var response = {
            'deviceModel': this.device.model,
            'os': this.device.platform,
            'osVersion': this.device.version,
            'deviceUUID': this.device.uuid
        };
        return Promise.resolve(response);
    };
    return DeviceInfoOperation;
}());
var GetNetworkInfoOperation = /** @class */ (function () {
    function GetNetworkInfoOperation(app, networkService) {
        this.app = app;
        this.networkService = networkService;
        this.name = 'getNetworkInfo';
        this.model = {
            connectionType: 'NONE',
            isConnecting: false,
            isNetworkAvailable: true,
            isOnline: true,
            isOffline: false
        };
        this.properties = [
            { target: 'autoUpdate', type: 'boolean', value: true, hide: true },
            { target: 'startUpdate', type: 'boolean', value: true, hide: true },
            { target: 'networkStatus', type: 'object', value: 'bind:App.networkStatus', dataBinding: true, hide: true },
            { target: 'onOnline', hide: false },
            { target: 'onOffline', hide: false }
        ];
        this.requiredCordovaPlugins = ['NETWORK'];
    }
    GetNetworkInfoOperation.prototype.invoke = function (variable, options, dataBindings) {
        var data = {
            connectionType: navigator.connection.type,
            isConnecting: this.app.networkStatus.isConnecting,
            isNetworkAvailable: this.app.networkStatus.isNetworkAvailable,
            isOnline: this.app.networkStatus.isConnected,
            isOffline: !this.app.networkStatus.isConnected
        };
        if (this.networkService.isConnected()) {
            initiateCallback('onOnline', variable, data);
        }
        else {
            initiateCallback('onOffline', variable, data);
        }
        return Promise.resolve(data);
    };
    return GetNetworkInfoOperation;
}());
var GoOfflineOperation = /** @class */ (function () {
    function GoOfflineOperation(networkService) {
        this.networkService = networkService;
        this.name = 'goOffline';
        this.model = {};
        this.properties = [];
        this.requiredCordovaPlugins = ['NETWORK'];
    }
    GoOfflineOperation.prototype.invoke = function (variable, options, dataBindings) {
        return this.networkService.disconnect();
    };
    return GoOfflineOperation;
}());
var GoOnlineOperation = /** @class */ (function () {
    function GoOnlineOperation(networkService) {
        this.networkService = networkService;
        this.name = 'goOnline';
        this.model = {};
        this.properties = [];
        this.requiredCordovaPlugins = ['NETWORK'];
    }
    GoOnlineOperation.prototype.invoke = function (variable, options, dataBindings) {
        return this.networkService.connect();
    };
    return GoOnlineOperation;
}());
/**
 * This class handles 'vibrate' device operation.
 */
var VibrateOperation = /** @class */ (function () {
    function VibrateOperation(vibrationService) {
        this.vibrationService = vibrationService;
        this.name = 'vibrate';
        this.model = {
            appversion: 'X.X.X',
            cordovaversion: 'X.X.X'
        };
        this.properties = [
            { target: 'vibrationtime', type: 'number', value: 2, dataBinding: true }
        ];
        this.requiredCordovaPlugins = ['VIBRATE'];
    }
    VibrateOperation.prototype.invoke = function (variable, options, dataBindings) {
        this.vibrationService.vibrate(dataBindings.get('vibrationtime') * 1000);
        return Promise.resolve();
    };
    return VibrateOperation;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLXNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL2RldmljZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFLQSxPQUFPLEVBQUUsVUFBVSxFQUFPLE1BQU0sVUFBVSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxxQkFBcUIsRUFBNEIsZ0JBQWdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHbEc7O0dBRUc7QUFDSDtJQUFtQyx5Q0FBcUI7SUFJcEQsdUJBQVksR0FBUSxFQUNoQixVQUFzQixFQUN0QixNQUFjLEVBQ2QsV0FBd0IsRUFDeEIsY0FBOEIsRUFDOUIsY0FBeUI7UUFMN0IsWUFNSSxpQkFBTyxTQWtCVjtRQTNCZSxVQUFJLEdBQUcsUUFBUSxDQUFDO1FBQ2hCLGdCQUFVLEdBQStCLEVBQUUsQ0FBQztRQVN4RCxLQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFDekQsSUFBSSwyQkFBMkIsQ0FBQyxXQUFXLENBQUMsRUFDNUMsSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsRUFDL0IsSUFBSSx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLEVBQ2hELElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLEVBQ3RDLElBQUksaUJBQWlCLENBQUMsY0FBYyxDQUFDLEVBQ3JDLElBQUksZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUMxQyxHQUFHLENBQUMsU0FBUyxDQUFDLHNCQUFzQixFQUFFLFVBQUEsSUFBSTtZQUN0QyxHQUFHLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUN6QixVQUFVLEVBQUUsQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztRQUNILEdBQUcsQ0FBQyxhQUFhLEdBQUc7WUFDaEIsWUFBWSxFQUFHLEtBQUs7WUFDcEIsV0FBVyxF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QUUsT0FBWSxFQUFFLFlBQThCO1FBQ3JFLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBQ0wsd0JBQUM7QUFBRCxDQUFDLEFBYkQsSUFhQztBQUVEOztHQUVHO0FBQ0g7SUFXSSwwQkFBcUIsZ0JBQTJCO1FBQTNCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBVztRQVZoQyxTQUFJLEdBQUcsU0FBUyxDQUFDO1FBQ2pCLFVBQUssR0FBRztZQUNwQixVQUFVLEVBQUUsT0FBTztZQUNuQixjQUFjLEVBQUUsT0FBTztTQUMxQixDQUFDO1FBQ2MsZUFBVSxHQUFHO1lBQ3pCLEVBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBQztTQUN6RSxDQUFDO1FBQ2MsMkJBQXNCLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUlyRCxDQUFDO0lBRU0saUNBQU0sR0FBYixVQUFjLFFBQWEsRUFBRSxPQUFZLEVBQUUsWUFBOEI7UUFDckUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3hFLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFDTCx1QkFBQztBQUFELENBQUMsQUFuQkQsSUFtQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBWZXJzaW9uIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9hcHAtdmVyc2lvbic7XG5pbXBvcnQgeyBEZXZpY2UgfSBmcm9tICdAaW9uaWMtbmF0aXZlL2RldmljZSc7XG5pbXBvcnQgeyBHZW9sb2NhdGlvbiwgR2VvbG9jYXRpb25PcHRpb25zIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9nZW9sb2NhdGlvbic7XG5pbXBvcnQgeyBWaWJyYXRpb24gfSBmcm9tICdAaW9uaWMtbmF0aXZlL3ZpYnJhdGlvbic7XG5cbmltcG9ydCB7ICRhcHBEaWdlc3QsIEFwcCB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IE5ldHdvcmtTZXJ2aWNlIH0gZnJvbSAnQHdtL21vYmlsZS9jb3JlJztcbmltcG9ydCB7IERldmljZVZhcmlhYmxlU2VydmljZSwgSURldmljZVZhcmlhYmxlT3BlcmF0aW9uLCBpbml0aWF0ZUNhbGxiYWNrIH0gZnJvbSAnQHdtL3ZhcmlhYmxlcyc7XG5cbmRlY2xhcmUgY29uc3QgbmF2aWdhdG9yLCAkO1xuLyoqXG4gKiB0aGlzIGZpbGUgY29udGFpbnMgYWxsIGRldmljZSBvcGVyYXRpb25zIHVuZGVyICdkZXZpY2UnIHNlcnZpY2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBEZXZpY2VTZXJ2aWNlIGV4dGVuZHMgRGV2aWNlVmFyaWFibGVTZXJ2aWNlIHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9ICdkZXZpY2UnO1xuICAgIHB1YmxpYyByZWFkb25seSBvcGVyYXRpb25zOiBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb25bXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IoYXBwOiBBcHAsXG4gICAgICAgIGFwcFZlcnNpb246IEFwcFZlcnNpb24sXG4gICAgICAgIGRldmljZTogRGV2aWNlLFxuICAgICAgICBnZW9Mb2NhdGlvbjogR2VvbG9jYXRpb24sXG4gICAgICAgIG5ldHdvcmtTZXJ2aWNlOiBOZXR3b3JrU2VydmljZSxcbiAgICAgICAgdmlicmF0ZVNlcnZpY2U6IFZpYnJhdGlvbikge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm9wZXJhdGlvbnMucHVzaChuZXcgQXBwSW5mb09wZXJhdGlvbihkZXZpY2UsIGFwcFZlcnNpb24pLFxuICAgICAgICAgICAgbmV3IEN1cnJlbnRHZW9Qb3NpdGlvbk9wZXJhdGlvbihnZW9Mb2NhdGlvbiksXG4gICAgICAgICAgICBuZXcgRGV2aWNlSW5mb09wZXJhdGlvbihkZXZpY2UpLFxuICAgICAgICAgICAgbmV3IEdldE5ldHdvcmtJbmZvT3BlcmF0aW9uKGFwcCwgbmV0d29ya1NlcnZpY2UpLFxuICAgICAgICAgICAgbmV3IEdvT2ZmbGluZU9wZXJhdGlvbihuZXR3b3JrU2VydmljZSksXG4gICAgICAgICAgICBuZXcgR29PbmxpbmVPcGVyYXRpb24obmV0d29ya1NlcnZpY2UpLFxuICAgICAgICAgICAgbmV3IFZpYnJhdGVPcGVyYXRpb24odmlicmF0ZVNlcnZpY2UpKTtcbiAgICAgICAgYXBwLnN1YnNjcmliZSgnb25OZXR3b3JrU3RhdGVDaGFuZ2UnLCBkYXRhID0+IHtcbiAgICAgICAgICAgIGFwcC5uZXR3b3JrU3RhdHVzID0gZGF0YTtcbiAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGFwcC5uZXR3b3JrU3RhdHVzID0ge1xuICAgICAgICAgICAgaXNDb25uZWN0aW5nIDogZmFsc2UsXG4gICAgICAgICAgICBpc0Nvbm5lY3RlZCA6IHRydWUsXG4gICAgICAgICAgICBpc05ldHdvcmtBdmFpbGFibGUgOiB0cnVlLFxuICAgICAgICAgICAgaXNTZXJ2aWNlQXZhaWxhYmxlIDogdHJ1ZVxuICAgICAgICB9O1xuICAgIH1cbn1cblxuXG4vKipcbiAqIFRoaXMgY2xhc3MgaGFuZGxlcyAnZ2V0QXBwSW5mbycgZGV2aWNlIG9wZXJhdGlvbi5cbiAqL1xuY2xhc3MgQXBwSW5mb09wZXJhdGlvbiBpbXBsZW1lbnRzIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiB7XG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWUgPSAnZ2V0QXBwSW5mbyc7XG4gICAgcHVibGljIHJlYWRvbmx5IG1vZGVsID0ge1xuICAgICAgICBhcHB2ZXJzaW9uOiAnWC5YLlgnLFxuICAgICAgICBjb3Jkb3ZhdmVyc2lvbjogJ1guWC5YJ1xuICAgIH07XG4gICAgcHVibGljIHJlYWRvbmx5IHByb3BlcnRpZXMgPSBbXG4gICAgICAgIHt0YXJnZXQ6ICdzdGFydFVwZGF0ZScsIHR5cGU6ICdib29sZWFuJywgdmFsdWU6IHRydWUsIGhpZGU6IHRydWV9XG4gICAgXTtcblxuICAgIGNvbnN0cnVjdG9yIChwcml2YXRlIGRldmljZTogRGV2aWNlLCBwcml2YXRlIGFwcFZlcnNpb246IEFwcFZlcnNpb24pIHtcblxuICAgIH1cblxuICAgIHB1YmxpYyBpbnZva2UodmFyaWFibGU6IGFueSwgb3B0aW9uczogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgY29uc3QgY29yZG92YVZlcnNpb24gPSB0aGlzLmRldmljZS5jb3Jkb3ZhO1xuICAgICAgICByZXR1cm4gdGhpcy5hcHBWZXJzaW9uLmdldFZlcnNpb25OdW1iZXIoKS50aGVuKGFwcFZlcnNpb24gPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhcHB2ZXJzaW9uOiBhcHBWZXJzaW9uLFxuICAgICAgICAgICAgICAgIGNvcmRvdmF2ZXJzaW9uOiBjb3Jkb3ZhVmVyc2lvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFRoaXMgY2xhc3MgaGFuZGxlcyAnZ2V0Q3VycmVudEdlb1Bvc2l0aW9uJyBkZXZpY2Ugb3BlcmF0aW9uLlxuICovXG5jbGFzcyBDdXJyZW50R2VvUG9zaXRpb25PcGVyYXRpb24gaW1wbGVtZW50cyBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb24ge1xuICAgIHB1YmxpYyByZWFkb25seSBuYW1lID0gJ2dldEN1cnJlbnRHZW9Qb3NpdGlvbic7XG4gICAgcHVibGljIHJlYWRvbmx5IG1vZGVsID0ge1xuICAgICAgICBjb29yZHM6IHtcbiAgICAgICAgICAgIGxhdGl0dWRlOiAwLFxuICAgICAgICAgICAgbG9uZ2l0dWRlOiAwLFxuICAgICAgICAgICAgYWx0aXR1ZGU6IDAsXG4gICAgICAgICAgICBhY2N1cmFjeTogMCxcbiAgICAgICAgICAgIGFsdGl0dWRlQWNjdXJhY3k6IDAsXG4gICAgICAgICAgICBoZWFkaW5nOiAwLFxuICAgICAgICAgICAgc3BlZWQ6IDBcbiAgICAgICAgfSxcbiAgICAgICAgdGltZXN0YW1wOiAwXG4gICAgfTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJvcGVydGllcyA9IFtcbiAgICAgICAge3RhcmdldDogJ3N0YXJ0VXBkYXRlJywgdHlwZTogJ2Jvb2xlYW4nLCB2YWx1ZTogdHJ1ZSwgaGlkZSA6IHRydWV9LFxuICAgICAgICB7dGFyZ2V0OiAnYXV0b1VwZGF0ZScsIHR5cGU6ICdib29sZWFuJywgdmFsdWU6IHRydWUsIGhpZGUgOiB0cnVlfSxcbiAgICAgICAge3RhcmdldDogJ2dlb2xvY2F0aW9uSGlnaEFjY3VyYWN5JywgdHlwZTogJ2Jvb2xlYW4nLCB2YWx1ZTogdHJ1ZSwgZGF0YUJpbmRpbmc6IHRydWV9LFxuICAgICAgICB7dGFyZ2V0OiAnZ2VvbG9jYXRpb25NYXhpbXVtQWdlJywgdHlwZTogJ251bWJlcicsIHZhbHVlOiAzLCBkYXRhQmluZGluZzogdHJ1ZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdnZW9sb2NhdGlvblRpbWVvdXQnLCB0eXBlOiAnbnVtYmVyJywgdmFsdWU6IDUsIGRhdGFCaW5kaW5nOiB0cnVlfVxuICAgIF07XG4gICAgcHVibGljIHJlYWRvbmx5IHJlcXVpcmVkQ29yZG92YVBsdWdpbnMgPSBbJ0dFT0xPQ0FUSU9OJ107XG5cbiAgICBwcml2YXRlIGxhc3RLbm93blBvc2l0aW9uO1xuICAgIHByaXZhdGUgd2FpdGluZ1F1ZXVlID0gW107XG4gICAgcHJpdmF0ZSB3YXRjaElkO1xuICAgIHByaXZhdGUgb3B0aW9ucyA9IHtcbiAgICAgICAgbWF4aW11bUFnZTogMzAwMCxcbiAgICAgICAgdGltZW91dDogKDIgKiA2MCkgKiAxMDAwLFxuICAgICAgICBlbmFibGVIaWdoQWNjdXJhY3k6IHRydWVcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IgKHByaXZhdGUgZ2VvTG9jYXRpb246IEdlb2xvY2F0aW9uKSB7fVxuXG4gICAgcHJpdmF0ZSB3YXRjaFBvc2l0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy53YXRjaElkKSB7XG4gICAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uY2xlYXJXYXRjaCh0aGlzLndhdGNoSWQpO1xuICAgICAgICAgICAgdGhpcy53YXRjaElkID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvcHRpb25zID0gd2luZG93WydXTV9HRU9fTE9DQVRJT05fT1BUSU9OUyddIHx8IHRoaXMub3B0aW9ucztcbiAgICAgICAgdGhpcy53YXRjaElkID0gbmF2aWdhdG9yLmdlb2xvY2F0aW9uLndhdGNoUG9zaXRpb24ocG9zaXRpb24gPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXN0S25vd25Qb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBjb29yZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgbGF0aXR1ZGU6IHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcbiAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWRlOiBwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlLFxuICAgICAgICAgICAgICAgICAgICBhbHRpdHVkZTogcG9zaXRpb24uY29vcmRzLmFsdGl0dWRlLFxuICAgICAgICAgICAgICAgICAgICBhY2N1cmFjeTogcG9zaXRpb24uY29vcmRzLmFjY3VyYWN5LFxuICAgICAgICAgICAgICAgICAgICBhbHRpdHVkZUFjY3VyYWN5OiBwb3NpdGlvbi5jb29yZHMuYWx0aXR1ZGVBY2N1cmFjeSxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogcG9zaXRpb24uY29vcmRzLmhlYWRpbmcsXG4gICAgICAgICAgICAgICAgICAgIHNwZWVkOiBwb3NpdGlvbi5jb29yZHMuc3BlZWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogcG9zaXRpb24udGltZXN0YW1wXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHRoaXMud2FpdGluZ1F1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLndhaXRpbmdRdWV1ZS5mb3JFYWNoKGZuID0+IGZuKHRoaXMubGFzdEtub3duUG9zaXRpb24pKTtcbiAgICAgICAgICAgICAgICB0aGlzLndhaXRpbmdRdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCd0b3VjaGVuZC51c2VyZ2VzdHVyZScpO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLndhdGNoSWQgPSBudWxsO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW52b2tlKHZhcmlhYmxlOiBhbnksIG9wdGlvbnM6IGFueSwgZGF0YUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgaWYgKCF0aGlzLndhdGNoSWQgfHwgIXRoaXMubGFzdEtub3duUG9zaXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMud2F0Y2hQb3NpdGlvbigpO1xuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ3RvdWNoZW5kLnVzZXJnZXN0dXJlJywgKCkgPT4gdGhpcy53YXRjaFBvc2l0aW9uKCkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGdlb0xvY2F0aW9uT3B0aW9uczogR2VvbG9jYXRpb25PcHRpb25zID0ge1xuICAgICAgICAgICAgbWF4aW11bUFnZTogZGF0YUJpbmRpbmdzLmdldCgnZ2VvbG9jYXRpb25NYXhpbXVtQWdlJykgKiAxMDAwLFxuICAgICAgICAgICAgdGltZW91dDogZGF0YUJpbmRpbmdzLmdldCgnZ2VvbG9jYXRpb25UaW1lb3V0JykgKiAxMDAwLFxuICAgICAgICAgICAgZW5hYmxlSGlnaEFjY3VyYWN5OiBkYXRhQmluZGluZ3MuZ2V0KCdnZW9sb2NhdGlvbkhpZ2hBY2N1cmFjeScpXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmxhc3RLbm93blBvc2l0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMubGFzdEtub3duUG9zaXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGMgPSBwb3NpdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShwb3NpdGlvbik7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLndhaXRpbmdRdWV1ZS5pbmRleE9mKGMpO1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2FpdGluZ1F1ZXVlLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5tb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcy5vcHRpb25zLnRpbWVvdXQpO1xuXG4gICAgICAgICAgICB0aGlzLndhaXRpbmdRdWV1ZS5wdXNoKGMpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cblxuXG4vKipcbiAqIFRoaXMgY2xhc3MgaGFuZGxlcyAnZ2V0RGV2aWNlSW5mbycgZGV2aWNlIG9wZXJhdGlvbi5cbiAqL1xuY2xhc3MgRGV2aWNlSW5mb09wZXJhdGlvbiBpbXBsZW1lbnRzIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiB7XG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWUgPSAnZ2V0RGV2aWNlSW5mbyc7XG4gICAgcHVibGljIHJlYWRvbmx5IG1vZGVsID0ge1xuICAgICAgICBkZXZpY2VNb2RlbDogJ0RFVklDRU1PREVMJyxcbiAgICAgICAgb3M6ICdERVZJQ0VPUycsXG4gICAgICAgIG9zVmVyc2lvbjogJ1guWC5YJyxcbiAgICAgICAgZGV2aWNlVVVJRDogJ0RFVklDRVVVSUQnXG4gICAgfTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJvcGVydGllcyA9IFtcbiAgICAgICAge3RhcmdldDogJ3N0YXJ0VXBkYXRlJywgdHlwZTogJ2Jvb2xlYW4nLCB2YWx1ZTogdHJ1ZSwgaGlkZTogdHJ1ZX1cbiAgICBdO1xuXG4gICAgY29uc3RydWN0b3IgKHByaXZhdGUgZGV2aWNlOiBEZXZpY2UpIHtcblxuICAgIH1cblxuICAgIHB1YmxpYyBpbnZva2UodmFyaWFibGU6IGFueSwgb3B0aW9uczogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICAnZGV2aWNlTW9kZWwnOiB0aGlzLmRldmljZS5tb2RlbCxcbiAgICAgICAgICAgICdvcyc6IHRoaXMuZGV2aWNlLnBsYXRmb3JtLFxuICAgICAgICAgICAgJ29zVmVyc2lvbic6IHRoaXMuZGV2aWNlLnZlcnNpb24sXG4gICAgICAgICAgICAnZGV2aWNlVVVJRCc6IHRoaXMuZGV2aWNlLnV1aWRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgfVxufVxuXG5jbGFzcyBHZXROZXR3b3JrSW5mb09wZXJhdGlvbiBpbXBsZW1lbnRzIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiB7XG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWUgPSAnZ2V0TmV0d29ya0luZm8nO1xuICAgIHB1YmxpYyByZWFkb25seSBtb2RlbCA9IHtcbiAgICAgICAgY29ubmVjdGlvblR5cGU6ICdOT05FJyxcbiAgICAgICAgaXNDb25uZWN0aW5nOiBmYWxzZSxcbiAgICAgICAgaXNOZXR3b3JrQXZhaWxhYmxlOiB0cnVlLFxuICAgICAgICBpc09ubGluZTogdHJ1ZSxcbiAgICAgICAgaXNPZmZsaW5lOiBmYWxzZVxuICAgIH07XG4gICAgcHVibGljIHJlYWRvbmx5IHByb3BlcnRpZXMgPSBbXG4gICAgICAgIHt0YXJnZXQ6ICdhdXRvVXBkYXRlJywgdHlwZTogJ2Jvb2xlYW4nLCB2YWx1ZTogdHJ1ZSwgaGlkZSA6IHRydWV9LFxuICAgICAgICB7dGFyZ2V0OiAnc3RhcnRVcGRhdGUnLCB0eXBlOiAnYm9vbGVhbicsIHZhbHVlOiB0cnVlLCBoaWRlIDogdHJ1ZX0sXG4gICAgICAgIHt0YXJnZXQ6ICduZXR3b3JrU3RhdHVzJywgdHlwZTogJ29iamVjdCcsIHZhbHVlOiAnYmluZDpBcHAubmV0d29ya1N0YXR1cycsIGRhdGFCaW5kaW5nOiB0cnVlLCBoaWRlOiB0cnVlfSxcbiAgICAgICAge3RhcmdldDogJ29uT25saW5lJywgaGlkZSA6IGZhbHNlfSxcbiAgICAgICAge3RhcmdldDogJ29uT2ZmbGluZScsIGhpZGUgOiBmYWxzZX1cbiAgICBdO1xuICAgIHB1YmxpYyByZWFkb25seSByZXF1aXJlZENvcmRvdmFQbHVnaW5zID0gWydORVRXT1JLJ107XG5cbiAgICBjb25zdHJ1Y3RvciAocHJpdmF0ZSBhcHA6IEFwcCwgcHJpdmF0ZSBuZXR3b3JrU2VydmljZTogTmV0d29ya1NlcnZpY2UpIHtcblxuICAgIH1cblxuICAgIHB1YmxpYyBpbnZva2UodmFyaWFibGU6IGFueSwgb3B0aW9uczogYW55LCBkYXRhQmluZGluZ3M6IE1hcDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgICAgY29ubmVjdGlvblR5cGU6IG5hdmlnYXRvci5jb25uZWN0aW9uLnR5cGUsXG4gICAgICAgICAgICBpc0Nvbm5lY3Rpbmc6IHRoaXMuYXBwLm5ldHdvcmtTdGF0dXMuaXNDb25uZWN0aW5nLFxuICAgICAgICAgICAgaXNOZXR3b3JrQXZhaWxhYmxlOiB0aGlzLmFwcC5uZXR3b3JrU3RhdHVzLmlzTmV0d29ya0F2YWlsYWJsZSxcbiAgICAgICAgICAgIGlzT25saW5lOiB0aGlzLmFwcC5uZXR3b3JrU3RhdHVzLmlzQ29ubmVjdGVkLFxuICAgICAgICAgICAgaXNPZmZsaW5lOiAhdGhpcy5hcHAubmV0d29ya1N0YXR1cy5pc0Nvbm5lY3RlZFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5uZXR3b3JrU2VydmljZS5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKCdvbk9ubGluZScsIHZhcmlhYmxlLCBkYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soJ29uT2ZmbGluZScsIHZhcmlhYmxlLCBkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRhdGEpO1xuICAgIH1cbn1cblxuY2xhc3MgR29PZmZsaW5lT3BlcmF0aW9uIGltcGxlbWVudHMgSURldmljZVZhcmlhYmxlT3BlcmF0aW9uIHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9ICdnb09mZmxpbmUnO1xuICAgIHB1YmxpYyByZWFkb25seSBtb2RlbCA9IHt9O1xuICAgIHB1YmxpYyByZWFkb25seSBwcm9wZXJ0aWVzID0gW107XG4gICAgcHVibGljIHJlYWRvbmx5IHJlcXVpcmVkQ29yZG92YVBsdWdpbnMgPSBbJ05FVFdPUksnXTtcblxuICAgIGNvbnN0cnVjdG9yIChwcml2YXRlIG5ldHdvcmtTZXJ2aWNlOiBOZXR3b3JrU2VydmljZSkge1xuXG4gICAgfVxuXG4gICAgcHVibGljIGludm9rZSh2YXJpYWJsZTogYW55LCBvcHRpb25zOiBhbnksIGRhdGFCaW5kaW5nczogTWFwPHN0cmluZywgYW55Pik6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLm5ldHdvcmtTZXJ2aWNlLmRpc2Nvbm5lY3QoKTtcbiAgICB9XG59XG5cbmNsYXNzIEdvT25saW5lT3BlcmF0aW9uIGltcGxlbWVudHMgSURldmljZVZhcmlhYmxlT3BlcmF0aW9uIHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9ICdnb09ubGluZSc7XG4gICAgcHVibGljIHJlYWRvbmx5IG1vZGVsID0ge307XG4gICAgcHVibGljIHJlYWRvbmx5IHByb3BlcnRpZXMgPSBbXTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmVxdWlyZWRDb3Jkb3ZhUGx1Z2lucyA9IFsnTkVUV09SSyddO1xuXG4gICAgY29uc3RydWN0b3IgKHByaXZhdGUgbmV0d29ya1NlcnZpY2U6IE5ldHdvcmtTZXJ2aWNlKSB7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgaW52b2tlKHZhcmlhYmxlOiBhbnksIG9wdGlvbnM6IGFueSwgZGF0YUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmV0d29ya1NlcnZpY2UuY29ubmVjdCgpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUaGlzIGNsYXNzIGhhbmRsZXMgJ3ZpYnJhdGUnIGRldmljZSBvcGVyYXRpb24uXG4gKi9cbmNsYXNzIFZpYnJhdGVPcGVyYXRpb24gaW1wbGVtZW50cyBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb24ge1xuICAgIHB1YmxpYyByZWFkb25seSBuYW1lID0gJ3ZpYnJhdGUnO1xuICAgIHB1YmxpYyByZWFkb25seSBtb2RlbCA9IHtcbiAgICAgICAgYXBwdmVyc2lvbjogJ1guWC5YJyxcbiAgICAgICAgY29yZG92YXZlcnNpb246ICdYLlguWCdcbiAgICB9O1xuICAgIHB1YmxpYyByZWFkb25seSBwcm9wZXJ0aWVzID0gW1xuICAgICAgICB7dGFyZ2V0OiAndmlicmF0aW9udGltZScsIHR5cGU6ICdudW1iZXInLCB2YWx1ZTogMiwgZGF0YUJpbmRpbmc6IHRydWV9XG4gICAgXTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmVxdWlyZWRDb3Jkb3ZhUGx1Z2lucyA9IFsnVklCUkFURSddO1xuXG4gICAgY29uc3RydWN0b3IgKHByaXZhdGUgdmlicmF0aW9uU2VydmljZTogVmlicmF0aW9uKSB7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgaW52b2tlKHZhcmlhYmxlOiBhbnksIG9wdGlvbnM6IGFueSwgZGF0YUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdGhpcy52aWJyYXRpb25TZXJ2aWNlLnZpYnJhdGUoZGF0YUJpbmRpbmdzLmdldCgndmlicmF0aW9udGltZScpICogMTAwMCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG59XG4iXX0=