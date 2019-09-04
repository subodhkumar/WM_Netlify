(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common/http'), require('@ionic-native/app-version'), require('@ionic-native/barcode-scanner'), require('@ionic-native/calendar'), require('@ionic-native/camera'), require('@ionic-native/contacts'), require('@ionic-native/file-opener'), require('@ionic-native/device'), require('@ionic-native/media-capture'), require('@ionic-native/geolocation'), require('@ionic-native/network'), require('@ionic-native/sqlite'), require('@ionic-native/vibration'), require('@wm/components'), require('@wm/mobile/offline'), require('@wm/mobile/variables'), require('@wm/mobile/components'), require('@ionic-native/file'), require('rxjs'), require('rxjs/operators'), require('@wm/security'), require('@wm/variables'), require('@angular/core'), require('@wm/core'), require('@wm/mobile/core')) :
    typeof define === 'function' && define.amd ? define('@wm/mobile/runtime', ['exports', '@angular/common/http', '@ionic-native/app-version', '@ionic-native/barcode-scanner', '@ionic-native/calendar', '@ionic-native/camera', '@ionic-native/contacts', '@ionic-native/file-opener', '@ionic-native/device', '@ionic-native/media-capture', '@ionic-native/geolocation', '@ionic-native/network', '@ionic-native/sqlite', '@ionic-native/vibration', '@wm/components', '@wm/mobile/offline', '@wm/mobile/variables', '@wm/mobile/components', '@ionic-native/file', 'rxjs', 'rxjs/operators', '@wm/security', '@wm/variables', '@angular/core', '@wm/core', '@wm/mobile/core'], factory) :
    (factory((global.wm = global.wm || {}, global.wm.mobile = global.wm.mobile || {}, global.wm.mobile.runtime = {}),global.ng.common.http,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.ionicNative.plugins,global.wm.components,global.wm.mobile.offline,global.wm.mobile.variables,global.wm.mobile.components,global.ionicNative.plugins,global.rxjs,global.rxjs.operators,global.wm.security,global.wm.variables,global.ng.core,global.wm.core,global.wm.mobile.core));
}(this, (function (exports,http,appVersion,barcodeScanner,calendar,camera,contacts,fileOpener,device,mediaCapture,geolocation,network,sqlite,vibration,components,offline,variables,components$1,file,rxjs,operators,security,variables$1,i0,core,core$1) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    var AppExtComponent = /** @class */ (function () {
        function AppExtComponent(elRef, fileSelectorService, processManagementService) {
            this.elRef = elRef;
            this.fileSelectorService = fileSelectorService;
            this.processManagementService = processManagementService;
        }
        AppExtComponent.prototype.ngAfterViewInit = function () {
            var mobileElements = $(this.elRef.nativeElement).find('>[wmNetworkInfoToaster], >[wmAppUpdate], >[wmMobileFileBrowser]');
            var $body = $('body:first');
            if (core.hasCordova()) {
                mobileElements.appendTo($body);
                this.fileSelectorService.setFileBrowser(this.fileBrowserComponent);
            }
            else {
                mobileElements.remove();
            }
            $(this.elRef.nativeElement).find('>[wmProgressManager]').appendTo($body);
            this.processManagementService.setUIComponent(this.processManagerComponent);
        };
        AppExtComponent.decorators = [
            { type: i0.Component, args: [{
                        selector: '[wmAppExt]',
                        template: "<ng-container>\n        <div wmNetworkInfoToaster></div>\n        <div wmAppUpdate></div>\n        <div wmMobileFileBrowser></div>\n        <div wmProcessManager></div>\n    </ng-container>"
                    }] }
        ];
        /** @nocollapse */
        AppExtComponent.ctorParameters = function () {
            return [
                { type: i0.ElementRef },
                { type: components$1.FileSelectorService },
                { type: components$1.ProcessManagementService }
            ];
        };
        AppExtComponent.propDecorators = {
            fileBrowserComponent: [{ type: i0.ViewChild, args: [components$1.FileBrowserComponent,] }],
            processManagerComponent: [{ type: i0.ViewChild, args: [components$1.ProcessManagerComponent,] }]
        };
        return AppExtComponent;
    }());

    var STORAGE_KEY = 'wavemaker.persistedcookies';
    var CookieService = /** @class */ (function () {
        function CookieService() {
            this.cookieInfo = {};
            this.serviceName = 'CookeService';
        }
        CookieService.prototype.persistCookie = function (hostname, cookieName, cookieValue) {
            var _this = this;
            return new Promise(function (resolve) {
                if (cookieValue) {
                    resolve(cookieValue);
                }
                else {
                    _this.getCookie(hostname, cookieName)
                        .then(function (data) { return resolve(data.cookieValue); });
                }
            }).then(function (value) {
                _this.cookieInfo[hostname + '-' + cookieName] = {
                    hostname: hostname.replace(/:[0-9]+/, ''),
                    name: cookieName,
                    value: _this.rotateLTR(value)
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(_this.cookieInfo));
            });
        };
        CookieService.prototype.getCookie = function (hostname, cookieName) {
            return new Promise(function (resolve, reject) {
                window['cookieEmperor'].getCookie(hostname, cookieName, resolve, reject);
            });
        };
        CookieService.prototype.setCookie = function (hostname, cookieName, cookieValue) {
            return new Promise(function (resolve, reject) {
                window['cookieEmperor'].setCookie(hostname, cookieName, cookieValue, resolve, reject);
            });
        };
        CookieService.prototype.clearAll = function () {
            return new Promise(function (resolve, reject) { return window['cookieEmperor'].clearAll(resolve, reject); });
        };
        /**
         * Loads persisted cookies from local storage and adds them to the browser.
         * @returns {*}
         */
        CookieService.prototype.start = function () {
            var _this = this;
            var cookieInfoStr = localStorage.getItem(STORAGE_KEY), promises = [];
            if (cookieInfoStr) {
                var cookieInfo = JSON.parse(cookieInfoStr);
                _.forEach(cookieInfo, function (c) {
                    if (c.name && c.value) {
                        var promise = new Promise(function (resolve, reject) {
                            window['cookieEmperor'].setCookie(c.hostname, c.name, _this.rotateRTL(c.value), resolve, reject);
                        });
                        promises.push(promise);
                    }
                });
            }
            return Promise.all(promises);
        };
        /**
         * Just rotates the given string exactly from 1/3 of string length in left to right direction.
         * @param str
         * @returns {string}
         */
        CookieService.prototype.rotateLTR = function (str) {
            var arr = str.split(''), tArr = [], shift = Math.floor(str.length / 3);
            arr.forEach(function (v, i) {
                tArr[(i + shift) % arr.length] = arr[i];
            });
            return tArr.join('');
        };
        /**
         * Just rotates the given string exactly from 1/3 of string length in  right to left direction..
         * @param str
         * @returns {string}
         */
        CookieService.prototype.rotateRTL = function (str) {
            var arr = str.split(''), tArr = [], shift = Math.floor(str.length / 3);
            arr.forEach(function (v, i) {
                tArr[(arr.length + i - shift) % arr.length] = arr[i];
            });
            return tArr.join('');
        };
        CookieService.decorators = [
            { type: i0.Injectable, args: [{
                        providedIn: 'root'
                    },] }
        ];
        CookieService.ngInjectableDef = i0.defineInjectable({ factory: function CookieService_Factory() { return new CookieService(); }, token: CookieService, providedIn: "root" });
        return CookieService;
    }());

    var MobileHttpInterceptor = /** @class */ (function () {
        function MobileHttpInterceptor(app, file$$1, deviceFileDownloadService, deviceService, networkService, securityService) {
            this.app = app;
            this.deviceService = deviceService;
            this.networkService = networkService;
            this.requestInterceptors = [];
            if (core.hasCordova() && !variables$1.CONSTANTS.isWaveLens) {
                this.requestInterceptors.push(new SecurityInterceptor(app, file$$1, securityService));
                this.requestInterceptors.push(new RemoteSyncInterceptor(app, deviceFileDownloadService, deviceService, file$$1, networkService));
                this.requestInterceptors.push(new ServiceCallInterceptor(app));
            }
        }
        MobileHttpInterceptor.prototype.intercept = function (request, next) {
            var _this = this;
            var subject = new rxjs.Subject();
            var token = localStorage.getItem(variables$1.CONSTANTS.XSRF_COOKIE_NAME);
            if (token) {
                // Clone the request to add the new header
                request = request.clone({ headers: request.headers.set(core.getWmProjectProperties().xsrf_header_name, token) });
            }
            var data = { request: request };
            // invoke the request only when device is ready.
            var obs = rxjs.from(this.deviceService.whenReady()
                .then(function () { return core.executePromiseChain(_this.getInterceptors(), [data]); }));
            return obs.pipe(operators.mergeMap(function () {
                return next.handle(data.request);
            }));
        };
        MobileHttpInterceptor.prototype.getInterceptors = function () {
            return this.requestInterceptors.map(function (i) {
                return function (data) { return i.intercept(data.request).then(function (req) { return data.request = req; }); };
            });
        };
        MobileHttpInterceptor.prototype.onHttpError = function (response) {
            if (core.hasCordova
                && (!response || !response.status || response.status < 0 || response.status === 404)
                && (this.networkService.isConnected())) {
                this.networkService.isAvailable(true);
            }
        };
        MobileHttpInterceptor.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        MobileHttpInterceptor.ctorParameters = function () {
            return [
                { type: core.App },
                { type: file.File },
                { type: core$1.DeviceFileDownloadService },
                { type: core$1.DeviceService },
                { type: core$1.NetworkService },
                { type: security.SecurityService }
            ];
        };
        return MobileHttpInterceptor;
    }());
    var ServiceCallInterceptor = /** @class */ (function () {
        function ServiceCallInterceptor(app) {
            this.app = app;
        }
        ServiceCallInterceptor.prototype.intercept = function (request) {
            var modifiedRequest = request;
            var url = request.url;
            // if necessary, prepend deployed url
            if (url.indexOf('://') < 0
                && ServiceCallInterceptor.REMOTE_SERVICE_URL_PATTERNS.find(function (r) { return r.test(url); })) {
                url = this.app.deployedUrl + url;
            }
            url = core.removeExtraSlashes(url);
            if (url !== request.url) {
                modifiedRequest = request.clone({
                    url: url
                });
            }
            return Promise.resolve(modifiedRequest);
        };
        ServiceCallInterceptor.REMOTE_SERVICE_URL_PATTERNS = [
            new RegExp('^((./)|/)?services/'),
            new RegExp('j_spring_security_check'),
            new RegExp('j_spring_security_logout')
        ];
        return ServiceCallInterceptor;
    }());
    var RemoteSyncInterceptor = /** @class */ (function () {
        function RemoteSyncInterceptor(app, deviceFileDownloadService, deviceService, file$$1, networkService) {
            var _this = this;
            this.app = app;
            this.deviceFileDownloadService = deviceFileDownloadService;
            this.deviceService = deviceService;
            this.file = file$$1;
            this.networkService = networkService;
            this.checkRemoteDirectory = true;
            this.hasRemoteChanges = false;
            this.file.checkDir(cordova.file.dataDirectory, 'remote').then(function () { return _this.hasRemoteChanges = true; }, core.noop);
        }
        RemoteSyncInterceptor.prototype.intercept = function (request) {
            var _this = this;
            var isRemoteSyncEnabled = localStorage.getItem('remoteSync') === 'true';
            if (this.hasRemoteChanges || isRemoteSyncEnabled) {
                return Promise.resolve(request.url).then(function (url) {
                    if (url.indexOf('://') < 0
                        && RemoteSyncInterceptor.URL_TO_SYNC.find(function (r) { return r.test(url); })) {
                        var fileNameFromUrl = _.last(_.split(url, '/'));
                        return _this.download(url, fileNameFromUrl, isRemoteSyncEnabled);
                    }
                    return url;
                }).then(function (url) {
                    if (url !== request.url) {
                        _this.hasRemoteChanges = true;
                        return request.clone({
                            url: url
                        });
                    }
                    return request;
                });
            }
            else {
                return Promise.resolve(request);
            }
        };
        RemoteSyncInterceptor.prototype.createFolderStructure = function (parentFolder, folderNamesList) {
            var _this = this;
            var folderName = folderNamesList[0];
            if (!_.isEmpty(folderName)) {
                return this.file.createDir(parentFolder, folderName, false)
                    .catch(core.noop)
                    .then(function () {
                    parentFolder = parentFolder + folderName + '/';
                    folderNamesList.shift();
                    return _this.createFolderStructure(parentFolder, folderNamesList);
                });
            }
            return Promise.resolve(parentFolder);
        };
        RemoteSyncInterceptor.prototype.init = function (pageUrl, isRemoteSyncEnabled) {
            var _this = this;
            var fileName = _.last(_.split(pageUrl, '/')), path = _.replace(pageUrl, fileName, ''), folderPath = 'remote' + _.replace(path, this.app.deployedUrl, ''), downloadsParent = cordova.file.dataDirectory;
            return new Promise(function (resolve, reject) {
                if (_this.checkRemoteDirectory) {
                    return _this.deviceService.getAppBuildTime().then(function (buildTime) {
                        var remoteSyncInfo = _this.deviceService.getEntry('remote-sync') || {};
                        if (!remoteSyncInfo.lastBuildTime || remoteSyncInfo.lastBuildTime !== buildTime) {
                            return _this.file.removeDir(cordova.file.dataDirectory, 'remote')
                                .catch(core.noop).then(function () {
                                remoteSyncInfo.lastBuildTime = buildTime;
                                _this.hasRemoteChanges = false;
                                return _this.deviceService.storeEntry('remote-sync', remoteSyncInfo);
                            });
                        }
                    }).then(function () { return _this.checkRemoteDirectory = false; })
                        .then(resolve, reject);
                }
                resolve();
            })
                .then(function () { return _this.file.checkDir(downloadsParent, folderPath); })
                .then(function () { return downloadsParent + folderPath; }, function () {
                if (isRemoteSyncEnabled) {
                    return _this.createFolderStructure(downloadsParent, _.split(folderPath, '/'));
                }
                return Promise.reject('Could not find equivalent remote path');
            });
        };
        RemoteSyncInterceptor.prototype.download = function (url, fileName, isRemoteSyncEnabled) {
            var _this = this;
            var pageUrl = this.app.deployedUrl + '/' + url;
            var folderPath;
            return this.init(pageUrl, isRemoteSyncEnabled)
                .then(function (pathToRemote) {
                folderPath = pathToRemote;
                return _this.file.checkFile(folderPath + fileName, '');
            }).then(function () {
                if (isRemoteSyncEnabled && _this.networkService.isConnected()) {
                    return _this.file.removeFile(folderPath, fileName)
                        .then(function () { return folderPath + fileName; });
                }
                return folderPath + fileName;
            }, function () { return url; })
                .then(function (path) {
                if (isRemoteSyncEnabled && _this.networkService.isConnected()) {
                    return _this.deviceFileDownloadService.download(pageUrl, false, folderPath, fileName);
                }
                return path;
            });
        };
        RemoteSyncInterceptor.URL_TO_SYNC = [
            new RegExp('page.min.json$'),
            new RegExp('app.js$'),
            new RegExp('app.variables.json$')
        ];
        return RemoteSyncInterceptor;
    }());
    var SecurityInterceptor = /** @class */ (function () {
        function SecurityInterceptor(app, file$$1, securityService) {
            this.app = app;
            this.file = file$$1;
            this.securityService = securityService;
            this.initialized = false;
        }
        SecurityInterceptor.prototype.intercept = function (request) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (SecurityInterceptor.PAGE_URL_PATTERN.test(request.url)) {
                    return Promise.resolve().then(function () {
                        if (!_this.initialized) {
                            return _this.init();
                        }
                    }).then(function () {
                        var urlSplits = _.split(request.url, '/');
                        var pageName = urlSplits[urlSplits.length - 2];
                        if (!_this.publicPages || _this.publicPages[pageName]) {
                            return Promise.resolve(request);
                        }
                        else {
                            _this.securityService.getConfig(function (config) {
                                if (!config.securityEnabled || config.authenticated) {
                                    resolve(request);
                                }
                                else {
                                    reject("Page '" + pageName + "' is not accessible to the user.");
                                    _this.app.notify('http401', { page: pageName });
                                }
                            }, function () { return reject("Security call failed."); });
                        }
                        return Promise.resolve(request);
                    }).then(resolve, reject);
                }
                return resolve(request);
            });
        };
        /**
         * loads public pages from 'metadata/app/public-pages.info' and overrides canAccess method SecurityService
         */
        SecurityInterceptor.prototype.init = function () {
            var _this = this;
            var folderPath = cordova.file.applicationDirectory + 'www/metadata/app', fileName = 'public-pages.json';
            return this.file.readAsText(folderPath, fileName).then(function (text) {
                if (!_this.initialized) {
                    _this.publicPages = {};
                    _this.initialized = true;
                    _.forEach(JSON.parse(text), function (pageName) { return _this.publicPages[pageName] = true; });
                }
            }).catch(function () {
                _this.initialized = true;
            });
        };
        SecurityInterceptor.PAGE_URL_PATTERN = new RegExp('page.min.json$');
        return SecurityInterceptor;
    }());

    var WebProcessService = /** @class */ (function () {
        function WebProcessService(app, cookieService, httpService, extAppMessageService) {
            this.app = app;
            this.cookieService = cookieService;
            this.httpService = httpService;
            this.extAppMessageService = extAppMessageService;
        }
        WebProcessService.prototype.execute = function (process, hookUrl, useSystemBrowser) {
            var _this = this;
            if (useSystemBrowser === void 0) {
                useSystemBrowser = false;
            }
            return this.httpService.get("/services/webprocess/prepare?processName=" + process + "&hookUrl=" + hookUrl + "&requestSourceType=MOBILE")
                .then(function (processInfo) {
                if (useSystemBrowser) {
                    return _this.executeWithSystemBrowser(processInfo);
                }
                else {
                    return _this.executeWithInAppBrowser(processInfo, process);
                }
            }).then(function (output) {
                return _this.httpService.get('/services/webprocess/decode?encodedProcessdata=' + output);
            });
        };
        WebProcessService.prototype.executeWithSystemBrowser = function (processInfo) {
            var _this = this;
            return new Promise(function (resolve) {
                var oauthAdress = '^services/webprocess/LOGIN';
                var deregister = _this.extAppMessageService.subscribe(oauthAdress, function (message) {
                    resolve(message.data['process_output']);
                    deregister();
                });
                window.open(_this.app.deployedUrl + 'services/webprocess/start?process=' + encodeURIComponent(processInfo), '_system');
            });
        };
        WebProcessService.prototype.executeWithInAppBrowser = function (processInfo, process) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var ref = cordova.InAppBrowser.open(_this.app.deployedUrl + 'services/webprocess/start?process=' + encodeURIComponent(processInfo), '_blank', 'location=yes,clearcache=yes');
                var isSuccess = false;
                ref.addEventListener('loadstop', function () {
                    ref.executeScript({ code: _this.getScriptToInject(process) }, function (output) {
                        if (output && output[0]) {
                            isSuccess = true;
                            ref.close();
                            resolve(output[0]);
                        }
                    });
                });
                ref.addEventListener('exit', function () {
                    if (!isSuccess) {
                        reject('Login process is stopped');
                    }
                });
            }).then(function (output) {
                var url = _this.app.deployedUrl;
                if (url.endsWith('/')) {
                    url = url.substr(0, url.length - 1);
                }
                return _this.cookieService.setCookie(url, 'WM_WEB_PROCESS', processInfo)
                    .then(function () { return output; });
            });
        };
        WebProcessService.prototype.getScriptToInject = function (process) {
            return "\n            (function() {\n                var elements = document.querySelectorAll('body.flex>a.link');\n                for (var i = 0; i < elements.length; i++) {\n                    var href = elements[i].href;\n                    if (href && href.indexOf('://services/webprocess/" + process + "?process_output=')) {\n                        return href.split('process_output=')[1];\n                    }\n                }\n                window.isWebLoginProcess = true;\n            })();\n        ";
        };
        WebProcessService.decorators = [
            { type: i0.Injectable }
        ];
        /** @nocollapse */
        WebProcessService.ctorParameters = function () {
            return [
                { type: core.App },
                { type: CookieService },
                { type: core.AbstractHttpService },
                { type: core$1.ExtAppMessageService }
            ];
        };
        return WebProcessService;
    }());

    var MAX_WAIT_TIME_4_OAUTH_MESSAGE = 60000;
    var OS;
    (function (OS) {
        OS["IOS"] = "ios";
        OS["ANDROID"] = "android";
    })(OS || (OS = {}));
    var MINIMUM_TAB_WIDTH = 768;
    var KEYBOARD_CLASS = 'keyboard';
    var ionicServices = [
        appVersion.AppVersion,
        barcodeScanner.BarcodeScanner,
        calendar.Calendar,
        camera.Camera,
        contacts.Contacts,
        file.File,
        fileOpener.FileOpener,
        device.Device,
        geolocation.Geolocation,
        mediaCapture.MediaCapture,
        network.Network,
        sqlite.SQLite,
        vibration.Vibration
    ];
    var MobileRuntimeModule = /** @class */ (function () {
        function MobileRuntimeModule(app, cookieService, deviceFileOpenerService, deviceService, securityService, httpService, extAppMessageService, networkService, webProcessService) {
            this.app = app;
            this.cookieService = cookieService;
            this.deviceFileOpenerService = deviceFileOpenerService;
            this.deviceService = deviceService;
            this.securityService = securityService;
            this.httpService = httpService;
            this.extAppMessageService = extAppMessageService;
            this.networkService = networkService;
            this.webProcessService = webProcessService;
            this._$appEl = $('.wm-app:first');
            if (this._$appEl.width() >= MINIMUM_TAB_WIDTH) {
                app.isTabletApplicationType = true;
                this._$appEl.addClass('wm-tablet-app');
            }
            else {
                this._$appEl.addClass('wm-mobile-app');
            }
            MobileRuntimeModule.initializeRuntime(this, this.app, this.cookieService, this.deviceFileOpenerService, this.deviceService);
        }
        MobileRuntimeModule.forRoot = function () {
            /* add all providers that are required for mobile here. This is to simplify placeholder.*/
            return {
                ngModule: MobileRuntimeModule,
                providers: __spread([
                    WebProcessService,
                    {
                        provide: http.HTTP_INTERCEPTORS,
                        useClass: MobileHttpInterceptor,
                        multi: true
                    }
                ], ionicServices, [
                    components.FileExtensionFromMimePipe,
                    { provide: offline.PushService, useClass: offline.PushServiceImpl }
                ])
            };
        };
        // Startup services have to be added only once in the app life-cycle.
        MobileRuntimeModule.initializeRuntime = function (runtimeModule, app, cookieService, deviceFileOpenerService, deviceService) {
            if (this.initialized) {
                return;
            }
            this.initialized = true;
            app.deployedUrl = runtimeModule.getDeployedUrl();
            runtimeModule.getDeviceOS().then(function (os) {
                app.selectedViewPort = {
                    os: os
                };
                runtimeModule.applyOSTheme(os);
            });
            if (core.hasCordova()) {
                runtimeModule.handleKeyBoardClass();
                deviceService.addStartUpService(cookieService);
                app.subscribe('userLoggedIn', function () {
                    var url = variables$1.$rootScope.project.deployedUrl;
                    if (url.endsWith('/')) {
                        url = url.substr(0, url.length - 1);
                    }
                    cookieService.persistCookie(url, 'JSESSIONID').catch(core.noop);
                    cookieService.persistCookie(url, 'SPRING_SECURITY_REMEMBER_ME_COOKIE').catch(core.noop);
                });
                app.subscribe('device-file-download', function (data) {
                    deviceFileOpenerService.openRemoteFile(data.url, data.extension, data.name).then(data.successCb, data.errorCb);
                });
                var __zone_symbol__FileReader = window['__zone_symbol__FileReader'];
                if (__zone_symbol__FileReader && __zone_symbol__FileReader.READ_CHUNK_SIZE) {
                    // cordova File Reader is required. Otherwise, file operations are failing.
                    window['FileReader'] = __zone_symbol__FileReader;
                }
                if (!variables$1.CONSTANTS.isWaveLens) {
                    window.remoteSync = function (flag) {
                        if (flag === void 0) {
                            flag = true;
                        }
                        localStorage.setItem('remoteSync', flag ? 'true' : 'false');
                    };
                }
                runtimeModule.addAuthInBrowser();
            }
            deviceService.start();
            deviceService.whenReady().then(function () {
                if (core.hasCordova()) {
                    runtimeModule._$appEl.addClass('cordova');
                    runtimeModule.exposeOAuthService();
                    navigator.splashscreen.hide();
                    // Fix for issue: ios device is not considering the background style, eventhough value is set in config.xml.
                    if (window['StatusBar']) {
                        window['StatusBar'].overlaysWebView(false);
                    }
                }
            });
        };
        MobileRuntimeModule.prototype.exposeOAuthService = function () {
            var _this = this;
            window['OAuthInMobile'] = function (providerId) {
                return new Promise(function (resolve, reject) {
                    var oauthAdress = '^services/oauth/' + providerId + '$';
                    var deregister = _this.extAppMessageService.subscribe(oauthAdress, function (message) {
                        resolve(message.data['access_token']);
                        deregister();
                        clearTimeout(timerId);
                    });
                    var timerId = setTimeout(function () {
                        deregister();
                        reject("Time out for oauth message after " + MAX_WAIT_TIME_4_OAUTH_MESSAGE % 1000 + " seconds");
                    }, MAX_WAIT_TIME_4_OAUTH_MESSAGE);
                });
            };
            var handleOpenURL = window['handleOpenURL'];
            handleOpenURL.isReady = true;
            handleOpenURL(handleOpenURL.lastURL);
        };
        MobileRuntimeModule.prototype.applyOSTheme = function (os) {
            var oldStyleSheet = $('link[theme="wmtheme"]:first');
            var themeUrl = oldStyleSheet.attr('href').replace(new RegExp('/[a-z]*/style.css$'), "/" + os.toLowerCase() + "/style.css"), newStyleSheet = core.loadStyleSheet(themeUrl, { name: 'theme', value: 'wmtheme' });
            oldStyleSheet = oldStyleSheet.length > 0 && oldStyleSheet[0];
            if (newStyleSheet && oldStyleSheet) {
                core.insertAfter(newStyleSheet, oldStyleSheet);
                core.removeNode(oldStyleSheet);
            }
        };
        MobileRuntimeModule.prototype.handleKeyBoardClass = function () {
            var _this = this;
            var initialScreenSize = window.innerHeight;
            // keyboard class is added when keyboard is open.
            window.addEventListener('resize', function () {
                if (window.innerHeight < initialScreenSize) {
                    _this._$appEl.addClass(KEYBOARD_CLASS);
                }
                else {
                    _this._$appEl.removeClass(KEYBOARD_CLASS);
                }
            });
        };
        MobileRuntimeModule.prototype.getDeployedUrl = function () {
            var waveLensAppUrl = window['WaveLens'] && window['WaveLens']['appUrl'];
            var deployedUrl = variables$1.$rootScope.project.deployedUrl;
            if (core.hasCordova()) {
                if (waveLensAppUrl) {
                    // TODO: Temporary Fix for WMS-13072, baseUrl is {{DEVELOPMENT_URL}} in wavelens
                    deployedUrl = waveLensAppUrl;
                }
                else {
                    core.fetchContent('json', './config.json', true, (function (response) {
                        if (!response.error && response.baseUrl) {
                            deployedUrl = response.baseUrl;
                        }
                    }));
                }
            }
            if (!deployedUrl.endsWith('/')) {
                deployedUrl = deployedUrl + '/';
            }
            variables$1.$rootScope.project.deployedUrl = deployedUrl;
            return deployedUrl;
        };
        MobileRuntimeModule.prototype.getDeviceOS = function () {
            return new Promise(function (resolve, reject) {
                var msgContent = { key: 'on-load' };
                // Notify preview window that application is ready. Otherwise, identify the OS.
                if (window.top !== window) {
                    window.top.postMessage(msgContent, '*');
                    // This is for preview page
                    window.onmessage = function (msg) {
                        var data = msg.data;
                        if (core.isObject(data) && data.key === 'switch-device') {
                            resolve(data.device.os);
                        }
                    };
                }
                else if (core.isIphone() || core.isIpod() || core.isIpad()) {
                    resolve(OS.IOS);
                }
                else {
                    resolve(OS.ANDROID);
                }
            });
        };
        MobileRuntimeModule.prototype.addAuthInBrowser = function () {
            var _this = this;
            this.securityService.authInBrowser = function () {
                if (!_this.networkService.isConnected()) {
                    return Promise.reject('In offline, app cannot contact the server.');
                }
                return _this.webProcessService.execute('LOGIN', '/')
                    .then(function (output) {
                    var url = _this.app.deployedUrl;
                    if (url.endsWith('/')) {
                        url = url.substr(0, url.length - 1);
                    }
                    output = JSON.parse(output);
                    if (output[variables$1.CONSTANTS.XSRF_COOKIE_NAME]) {
                        localStorage.setItem(variables$1.CONSTANTS.XSRF_COOKIE_NAME, output[variables$1.CONSTANTS.XSRF_COOKIE_NAME]);
                    }
                    return _this.cookieService.clearAll()
                        .then(function () {
                        var promises = _.keys(output).map(function (k) {
                            return _this.cookieService.setCookie(url, k, output[k]);
                        });
                        return Promise.all(promises);
                    });
                })
                    .then(function () { return _this.app.notify('userLoggedIn', {}); });
            };
        };
        MobileRuntimeModule.initialized = false;
        MobileRuntimeModule.decorators = [
            { type: i0.NgModule, args: [{
                        declarations: [
                            AppExtComponent
                        ],
                        exports: [
                            AppExtComponent,
                            components$1.WmMobileComponentsModule
                        ],
                        imports: [
                            core$1.MobileCoreModule,
                            variables.VariablesModule,
                            components$1.WmMobileComponentsModule
                        ],
                        bootstrap: []
                    },] }
        ];
        /** @nocollapse */
        MobileRuntimeModule.ctorParameters = function () {
            return [
                { type: core.App },
                { type: CookieService },
                { type: core$1.DeviceFileOpenerService },
                { type: core$1.DeviceService },
                { type: security.SecurityService },
                { type: core.AbstractHttpService },
                { type: core$1.ExtAppMessageService },
                { type: core$1.NetworkService },
                { type: WebProcessService }
            ];
        };
        return MobileRuntimeModule;
    }());

    /**
     * Generated bundle index. Do not edit.
     */

    exports.ɵa = AppExtComponent;
    exports.ɵb = CookieService;
    exports.ɵd = MobileHttpInterceptor;
    exports.ɵc = WebProcessService;
    exports.MAX_WAIT_TIME_4_OAUTH_MESSAGE = MAX_WAIT_TIME_4_OAUTH_MESSAGE;
    exports.MobileRuntimeModule = MobileRuntimeModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=index.umd.js.map