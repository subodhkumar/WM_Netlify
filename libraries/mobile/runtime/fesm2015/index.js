import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppVersion } from '@ionic-native/app-version';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Calendar } from '@ionic-native/calendar';
import { Camera } from '@ionic-native/camera';
import { Contacts } from '@ionic-native/contacts';
import { FileOpener } from '@ionic-native/file-opener';
import { Device } from '@ionic-native/device';
import { MediaCapture } from '@ionic-native/media-capture';
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { SQLite } from '@ionic-native/sqlite';
import { Vibration } from '@ionic-native/vibration';
import { FileExtensionFromMimePipe } from '@wm/components';
import { PushService, PushServiceImpl } from '@wm/mobile/offline';
import { VariablesModule } from '@wm/mobile/variables';
import { FileBrowserComponent, FileSelectorService, ProcessManagerComponent, ProcessManagementService, WmMobileComponentsModule } from '@wm/mobile/components';
import { File } from '@ionic-native/file';
import { from, Subject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { SecurityService } from '@wm/security';
import { CONSTANTS, $rootScope } from '@wm/variables';
import { Component, ElementRef, ViewChild, Injectable, defineInjectable, NgModule } from '@angular/core';
import { hasCordova, App, executePromiseChain, getWmProjectProperties, noop, removeExtraSlashes, AbstractHttpService, fetchContent, insertAfter, isIpad, isIphone, isIpod, isObject, loadStyleSheet, removeNode } from '@wm/core';
import { DeviceFileDownloadService, DeviceService, NetworkService, ExtAppMessageService, DeviceFileOpenerService, MobileCoreModule } from '@wm/mobile/core';

class AppExtComponent {
    constructor(elRef, fileSelectorService, processManagementService) {
        this.elRef = elRef;
        this.fileSelectorService = fileSelectorService;
        this.processManagementService = processManagementService;
    }
    ngAfterViewInit() {
        const mobileElements = $(this.elRef.nativeElement).find('>[wmNetworkInfoToaster], >[wmAppUpdate], >[wmMobileFileBrowser]');
        const $body = $('body:first');
        if (hasCordova()) {
            mobileElements.appendTo($body);
            this.fileSelectorService.setFileBrowser(this.fileBrowserComponent);
        }
        else {
            mobileElements.remove();
        }
        $(this.elRef.nativeElement).find('>[wmProgressManager]').appendTo($body);
        this.processManagementService.setUIComponent(this.processManagerComponent);
    }
}
AppExtComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmAppExt]',
                template: `<ng-container>
        <div wmNetworkInfoToaster></div>
        <div wmAppUpdate></div>
        <div wmMobileFileBrowser></div>
        <div wmProcessManager></div>
    </ng-container>`
            }] }
];
/** @nocollapse */
AppExtComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: FileSelectorService },
    { type: ProcessManagementService }
];
AppExtComponent.propDecorators = {
    fileBrowserComponent: [{ type: ViewChild, args: [FileBrowserComponent,] }],
    processManagerComponent: [{ type: ViewChild, args: [ProcessManagerComponent,] }]
};

const STORAGE_KEY = 'wavemaker.persistedcookies';
class CookieService {
    constructor() {
        this.cookieInfo = {};
        this.serviceName = 'CookeService';
    }
    persistCookie(hostname, cookieName, cookieValue) {
        return new Promise(resolve => {
            if (cookieValue) {
                resolve(cookieValue);
            }
            else {
                this.getCookie(hostname, cookieName)
                    .then(data => resolve(data.cookieValue));
            }
        }).then(value => {
            this.cookieInfo[hostname + '-' + cookieName] = {
                hostname: hostname.replace(/:[0-9]+/, ''),
                name: cookieName,
                value: this.rotateLTR(value)
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cookieInfo));
        });
    }
    getCookie(hostname, cookieName) {
        return new Promise((resolve, reject) => {
            window['cookieEmperor'].getCookie(hostname, cookieName, resolve, reject);
        });
    }
    setCookie(hostname, cookieName, cookieValue) {
        return new Promise((resolve, reject) => {
            window['cookieEmperor'].setCookie(hostname, cookieName, cookieValue, resolve, reject);
        });
    }
    clearAll() {
        return new Promise((resolve, reject) => window['cookieEmperor'].clearAll(resolve, reject));
    }
    /**
     * Loads persisted cookies from local storage and adds them to the browser.
     * @returns {*}
     */
    start() {
        const cookieInfoStr = localStorage.getItem(STORAGE_KEY), promises = [];
        if (cookieInfoStr) {
            const cookieInfo = JSON.parse(cookieInfoStr);
            _.forEach(cookieInfo, c => {
                if (c.name && c.value) {
                    const promise = new Promise((resolve, reject) => {
                        window['cookieEmperor'].setCookie(c.hostname, c.name, this.rotateRTL(c.value), resolve, reject);
                    });
                    promises.push(promise);
                }
            });
        }
        return Promise.all(promises);
    }
    /**
     * Just rotates the given string exactly from 1/3 of string length in left to right direction.
     * @param str
     * @returns {string}
     */
    rotateLTR(str) {
        const arr = str.split(''), tArr = [], shift = Math.floor(str.length / 3);
        arr.forEach((v, i) => {
            tArr[(i + shift) % arr.length] = arr[i];
        });
        return tArr.join('');
    }
    /**
     * Just rotates the given string exactly from 1/3 of string length in  right to left direction..
     * @param str
     * @returns {string}
     */
    rotateRTL(str) {
        const arr = str.split(''), tArr = [], shift = Math.floor(str.length / 3);
        arr.forEach((v, i) => {
            tArr[(arr.length + i - shift) % arr.length] = arr[i];
        });
        return tArr.join('');
    }
}
CookieService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
CookieService.ngInjectableDef = defineInjectable({ factory: function CookieService_Factory() { return new CookieService(); }, token: CookieService, providedIn: "root" });

class MobileHttpInterceptor {
    constructor(app, file, deviceFileDownloadService, deviceService, networkService, securityService) {
        this.app = app;
        this.deviceService = deviceService;
        this.networkService = networkService;
        this.requestInterceptors = [];
        if (hasCordova() && !CONSTANTS.isWaveLens) {
            this.requestInterceptors.push(new SecurityInterceptor(app, file, securityService));
            this.requestInterceptors.push(new RemoteSyncInterceptor(app, deviceFileDownloadService, deviceService, file, networkService));
            this.requestInterceptors.push(new ServiceCallInterceptor(app));
        }
    }
    intercept(request, next) {
        const subject = new Subject();
        const token = localStorage.getItem(CONSTANTS.XSRF_COOKIE_NAME);
        if (token) {
            // Clone the request to add the new header
            request = request.clone({ headers: request.headers.set(getWmProjectProperties().xsrf_header_name, token) });
        }
        const data = { request: request };
        // invoke the request only when device is ready.
        const obs = from(this.deviceService.whenReady()
            .then(() => executePromiseChain(this.getInterceptors(), [data])));
        return obs.pipe(mergeMap(() => {
            return next.handle(data.request);
        }));
    }
    getInterceptors() {
        return this.requestInterceptors.map(i => {
            return (data) => i.intercept(data.request).then(req => data.request = req);
        });
    }
    onHttpError(response) {
        if (hasCordova
            && (!response || !response.status || response.status < 0 || response.status === 404)
            && (this.networkService.isConnected())) {
            this.networkService.isAvailable(true);
        }
    }
}
MobileHttpInterceptor.decorators = [
    { type: Injectable }
];
/** @nocollapse */
MobileHttpInterceptor.ctorParameters = () => [
    { type: App },
    { type: File },
    { type: DeviceFileDownloadService },
    { type: DeviceService },
    { type: NetworkService },
    { type: SecurityService }
];
class ServiceCallInterceptor {
    constructor(app) {
        this.app = app;
    }
    intercept(request) {
        let modifiedRequest = request;
        let url = request.url;
        // if necessary, prepend deployed url
        if (url.indexOf('://') < 0
            && ServiceCallInterceptor.REMOTE_SERVICE_URL_PATTERNS.find(r => r.test(url))) {
            url = this.app.deployedUrl + url;
        }
        url = removeExtraSlashes(url);
        if (url !== request.url) {
            modifiedRequest = request.clone({
                url: url
            });
        }
        return Promise.resolve(modifiedRequest);
    }
}
ServiceCallInterceptor.REMOTE_SERVICE_URL_PATTERNS = [
    new RegExp('^((./)|/)?services/'),
    new RegExp('j_spring_security_check'),
    new RegExp('j_spring_security_logout')
];
class RemoteSyncInterceptor {
    constructor(app, deviceFileDownloadService, deviceService, file, networkService) {
        this.app = app;
        this.deviceFileDownloadService = deviceFileDownloadService;
        this.deviceService = deviceService;
        this.file = file;
        this.networkService = networkService;
        this.checkRemoteDirectory = true;
        this.hasRemoteChanges = false;
        this.file.checkDir(cordova.file.dataDirectory, 'remote').then(() => this.hasRemoteChanges = true, noop);
    }
    intercept(request) {
        const isRemoteSyncEnabled = localStorage.getItem('remoteSync') === 'true';
        if (this.hasRemoteChanges || isRemoteSyncEnabled) {
            return Promise.resolve(request.url).then(url => {
                if (url.indexOf('://') < 0
                    && RemoteSyncInterceptor.URL_TO_SYNC.find(r => r.test(url))) {
                    const fileNameFromUrl = _.last(_.split(url, '/'));
                    return this.download(url, fileNameFromUrl, isRemoteSyncEnabled);
                }
                return url;
            }).then(url => {
                if (url !== request.url) {
                    this.hasRemoteChanges = true;
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
    }
    createFolderStructure(parentFolder, folderNamesList) {
        const folderName = folderNamesList[0];
        if (!_.isEmpty(folderName)) {
            return this.file.createDir(parentFolder, folderName, false)
                .catch(noop)
                .then(() => {
                parentFolder = parentFolder + folderName + '/';
                folderNamesList.shift();
                return this.createFolderStructure(parentFolder, folderNamesList);
            });
        }
        return Promise.resolve(parentFolder);
    }
    init(pageUrl, isRemoteSyncEnabled) {
        const fileName = _.last(_.split(pageUrl, '/')), path = _.replace(pageUrl, fileName, ''), folderPath = 'remote' + _.replace(path, this.app.deployedUrl, ''), downloadsParent = cordova.file.dataDirectory;
        return new Promise((resolve, reject) => {
            if (this.checkRemoteDirectory) {
                return this.deviceService.getAppBuildTime().then(buildTime => {
                    const remoteSyncInfo = this.deviceService.getEntry('remote-sync') || {};
                    if (!remoteSyncInfo.lastBuildTime || remoteSyncInfo.lastBuildTime !== buildTime) {
                        return this.file.removeDir(cordova.file.dataDirectory, 'remote')
                            .catch(noop).then(() => {
                            remoteSyncInfo.lastBuildTime = buildTime;
                            this.hasRemoteChanges = false;
                            return this.deviceService.storeEntry('remote-sync', remoteSyncInfo);
                        });
                    }
                }).then(() => this.checkRemoteDirectory = false)
                    .then(resolve, reject);
            }
            resolve();
        })
            .then(() => this.file.checkDir(downloadsParent, folderPath))
            .then(() => downloadsParent + folderPath, () => {
            if (isRemoteSyncEnabled) {
                return this.createFolderStructure(downloadsParent, _.split(folderPath, '/'));
            }
            return Promise.reject('Could not find equivalent remote path');
        });
    }
    download(url, fileName, isRemoteSyncEnabled) {
        const pageUrl = this.app.deployedUrl + '/' + url;
        let folderPath;
        return this.init(pageUrl, isRemoteSyncEnabled)
            .then(pathToRemote => {
            folderPath = pathToRemote;
            return this.file.checkFile(folderPath + fileName, '');
        }).then(() => {
            if (isRemoteSyncEnabled && this.networkService.isConnected()) {
                return this.file.removeFile(folderPath, fileName)
                    .then(() => folderPath + fileName);
            }
            return folderPath + fileName;
        }, () => url)
            .then(path => {
            if (isRemoteSyncEnabled && this.networkService.isConnected()) {
                return this.deviceFileDownloadService.download(pageUrl, false, folderPath, fileName);
            }
            return path;
        });
    }
}
RemoteSyncInterceptor.URL_TO_SYNC = [
    new RegExp('page.min.json$'),
    new RegExp('app.js$'),
    new RegExp('app.variables.json$')
];
class SecurityInterceptor {
    constructor(app, file, securityService) {
        this.app = app;
        this.file = file;
        this.securityService = securityService;
        this.initialized = false;
    }
    intercept(request) {
        return new Promise((resolve, reject) => {
            if (SecurityInterceptor.PAGE_URL_PATTERN.test(request.url)) {
                return Promise.resolve().then(() => {
                    if (!this.initialized) {
                        return this.init();
                    }
                }).then(() => {
                    const urlSplits = _.split(request.url, '/');
                    const pageName = urlSplits[urlSplits.length - 2];
                    if (!this.publicPages || this.publicPages[pageName]) {
                        return Promise.resolve(request);
                    }
                    else {
                        this.securityService.getConfig(config => {
                            if (!config.securityEnabled || config.authenticated) {
                                resolve(request);
                            }
                            else {
                                reject(`Page '${pageName}' is not accessible to the user.`);
                                this.app.notify('http401', { page: pageName });
                            }
                        }, () => reject(`Security call failed.`));
                    }
                    return Promise.resolve(request);
                }).then(resolve, reject);
            }
            return resolve(request);
        });
    }
    /**
     * loads public pages from 'metadata/app/public-pages.info' and overrides canAccess method SecurityService
     */
    init() {
        const folderPath = cordova.file.applicationDirectory + 'www/metadata/app', fileName = 'public-pages.json';
        return this.file.readAsText(folderPath, fileName).then(text => {
            if (!this.initialized) {
                this.publicPages = {};
                this.initialized = true;
                _.forEach(JSON.parse(text), pageName => this.publicPages[pageName] = true);
            }
        }).catch(() => {
            this.initialized = true;
        });
    }
}
SecurityInterceptor.PAGE_URL_PATTERN = new RegExp('page.min.json$');

class WebProcessService {
    constructor(app, cookieService, httpService, extAppMessageService) {
        this.app = app;
        this.cookieService = cookieService;
        this.httpService = httpService;
        this.extAppMessageService = extAppMessageService;
    }
    execute(process, hookUrl, useSystemBrowser = false) {
        return this.httpService.get(`/services/webprocess/prepare?processName=${process}&hookUrl=${hookUrl}&requestSourceType=MOBILE`)
            .then((processInfo) => {
            if (useSystemBrowser) {
                return this.executeWithSystemBrowser(processInfo);
            }
            else {
                return this.executeWithInAppBrowser(processInfo, process);
            }
        }).then(output => {
            return this.httpService.get('/services/webprocess/decode?encodedProcessdata=' + output);
        });
    }
    executeWithSystemBrowser(processInfo) {
        return new Promise((resolve) => {
            const oauthAdress = '^services/webprocess/LOGIN';
            const deregister = this.extAppMessageService.subscribe(oauthAdress, message => {
                resolve(message.data['process_output']);
                deregister();
            });
            window.open(this.app.deployedUrl + 'services/webprocess/start?process=' + encodeURIComponent(processInfo), '_system');
        });
    }
    executeWithInAppBrowser(processInfo, process) {
        return new Promise((resolve, reject) => {
            const ref = cordova.InAppBrowser.open(this.app.deployedUrl + 'services/webprocess/start?process=' + encodeURIComponent(processInfo), '_blank', 'location=yes,clearcache=yes');
            let isSuccess = false;
            ref.addEventListener('loadstop', () => {
                ref.executeScript({ code: this.getScriptToInject(process) }, output => {
                    if (output && output[0]) {
                        isSuccess = true;
                        ref.close();
                        resolve(output[0]);
                    }
                });
            });
            ref.addEventListener('exit', () => {
                if (!isSuccess) {
                    reject('Login process is stopped');
                }
            });
        }).then((output) => {
            let url = this.app.deployedUrl;
            if (url.endsWith('/')) {
                url = url.substr(0, url.length - 1);
            }
            return this.cookieService.setCookie(url, 'WM_WEB_PROCESS', processInfo)
                .then(() => output);
        });
    }
    getScriptToInject(process) {
        return `
            (function() {
                var elements = document.querySelectorAll('body.flex>a.link');
                for (var i = 0; i < elements.length; i++) {
                    var href = elements[i].href;
                    if (href && href.indexOf('://services/webprocess/${process}?process_output=')) {
                        return href.split('process_output=')[1];
                    }
                }
                window.isWebLoginProcess = true;
            })();
        `;
    }
}
WebProcessService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
WebProcessService.ctorParameters = () => [
    { type: App },
    { type: CookieService },
    { type: AbstractHttpService },
    { type: ExtAppMessageService }
];

const MAX_WAIT_TIME_4_OAUTH_MESSAGE = 60000;
var OS;
(function (OS) {
    OS["IOS"] = "ios";
    OS["ANDROID"] = "android";
})(OS || (OS = {}));
const MINIMUM_TAB_WIDTH = 768;
const KEYBOARD_CLASS = 'keyboard';
const ionicServices = [
    AppVersion,
    BarcodeScanner,
    Calendar,
    Camera,
    Contacts,
    File,
    FileOpener,
    Device,
    Geolocation,
    MediaCapture,
    Network,
    SQLite,
    Vibration
];
class MobileRuntimeModule {
    constructor(app, cookieService, deviceFileOpenerService, deviceService, securityService, httpService, extAppMessageService, networkService, webProcessService) {
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
    static forRoot() {
        /* add all providers that are required for mobile here. This is to simplify placeholder.*/
        return {
            ngModule: MobileRuntimeModule,
            providers: [
                WebProcessService,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: MobileHttpInterceptor,
                    multi: true
                },
                ...ionicServices,
                FileExtensionFromMimePipe,
                { provide: PushService, useClass: PushServiceImpl }
            ]
        };
    }
    // Startup services have to be added only once in the app life-cycle.
    static initializeRuntime(runtimeModule, app, cookieService, deviceFileOpenerService, deviceService) {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        app.deployedUrl = runtimeModule.getDeployedUrl();
        runtimeModule.getDeviceOS().then(os => {
            app.selectedViewPort = {
                os: os
            };
            runtimeModule.applyOSTheme(os);
        });
        if (hasCordova()) {
            runtimeModule.handleKeyBoardClass();
            deviceService.addStartUpService(cookieService);
            app.subscribe('userLoggedIn', () => {
                let url = $rootScope.project.deployedUrl;
                if (url.endsWith('/')) {
                    url = url.substr(0, url.length - 1);
                }
                cookieService.persistCookie(url, 'JSESSIONID').catch(noop);
                cookieService.persistCookie(url, 'SPRING_SECURITY_REMEMBER_ME_COOKIE').catch(noop);
            });
            app.subscribe('device-file-download', (data) => {
                deviceFileOpenerService.openRemoteFile(data.url, data.extension, data.name).then(data.successCb, data.errorCb);
            });
            const __zone_symbol__FileReader = window['__zone_symbol__FileReader'];
            if (__zone_symbol__FileReader && __zone_symbol__FileReader.READ_CHUNK_SIZE) {
                // cordova File Reader is required. Otherwise, file operations are failing.
                window['FileReader'] = __zone_symbol__FileReader;
            }
            if (!CONSTANTS.isWaveLens) {
                window.remoteSync = (flag = true) => {
                    localStorage.setItem('remoteSync', flag ? 'true' : 'false');
                };
            }
            runtimeModule.addAuthInBrowser();
        }
        deviceService.start();
        deviceService.whenReady().then(() => {
            if (hasCordova()) {
                runtimeModule._$appEl.addClass('cordova');
                runtimeModule.exposeOAuthService();
                navigator.splashscreen.hide();
                // Fix for issue: ios device is not considering the background style, eventhough value is set in config.xml.
                if (window['StatusBar']) {
                    window['StatusBar'].overlaysWebView(false);
                }
            }
        });
    }
    exposeOAuthService() {
        window['OAuthInMobile'] = (providerId) => {
            return new Promise((resolve, reject) => {
                const oauthAdress = '^services/oauth/' + providerId + '$';
                const deregister = this.extAppMessageService.subscribe(oauthAdress, message => {
                    resolve(message.data['access_token']);
                    deregister();
                    clearTimeout(timerId);
                });
                const timerId = setTimeout(function () {
                    deregister();
                    reject(`Time out for oauth message after ${MAX_WAIT_TIME_4_OAUTH_MESSAGE % 1000} seconds`);
                }, MAX_WAIT_TIME_4_OAUTH_MESSAGE);
            });
        };
        const handleOpenURL = window['handleOpenURL'];
        handleOpenURL.isReady = true;
        handleOpenURL(handleOpenURL.lastURL);
    }
    applyOSTheme(os) {
        let oldStyleSheet = $('link[theme="wmtheme"]:first');
        const themeUrl = oldStyleSheet.attr('href').replace(new RegExp('/[a-z]*/style.css$'), `/${os.toLowerCase()}/style.css`), newStyleSheet = loadStyleSheet(themeUrl, { name: 'theme', value: 'wmtheme' });
        oldStyleSheet = oldStyleSheet.length > 0 && oldStyleSheet[0];
        if (newStyleSheet && oldStyleSheet) {
            insertAfter(newStyleSheet, oldStyleSheet);
            removeNode(oldStyleSheet);
        }
    }
    handleKeyBoardClass() {
        const initialScreenSize = window.innerHeight;
        // keyboard class is added when keyboard is open.
        window.addEventListener('resize', () => {
            if (window.innerHeight < initialScreenSize) {
                this._$appEl.addClass(KEYBOARD_CLASS);
            }
            else {
                this._$appEl.removeClass(KEYBOARD_CLASS);
            }
        });
    }
    getDeployedUrl() {
        const waveLensAppUrl = window['WaveLens'] && window['WaveLens']['appUrl'];
        let deployedUrl = $rootScope.project.deployedUrl;
        if (hasCordova()) {
            if (waveLensAppUrl) {
                // TODO: Temporary Fix for WMS-13072, baseUrl is {{DEVELOPMENT_URL}} in wavelens
                deployedUrl = waveLensAppUrl;
            }
            else {
                fetchContent('json', './config.json', true, (response => {
                    if (!response.error && response.baseUrl) {
                        deployedUrl = response.baseUrl;
                    }
                }));
            }
        }
        if (!deployedUrl.endsWith('/')) {
            deployedUrl = deployedUrl + '/';
        }
        $rootScope.project.deployedUrl = deployedUrl;
        return deployedUrl;
    }
    getDeviceOS() {
        return new Promise(function (resolve, reject) {
            const msgContent = { key: 'on-load' };
            // Notify preview window that application is ready. Otherwise, identify the OS.
            if (window.top !== window) {
                window.top.postMessage(msgContent, '*');
                // This is for preview page
                window.onmessage = function (msg) {
                    const data = msg.data;
                    if (isObject(data) && data.key === 'switch-device') {
                        resolve(data.device.os);
                    }
                };
            }
            else if (isIphone() || isIpod() || isIpad()) {
                resolve(OS.IOS);
            }
            else {
                resolve(OS.ANDROID);
            }
        });
    }
    addAuthInBrowser() {
        this.securityService.authInBrowser = () => {
            if (!this.networkService.isConnected()) {
                return Promise.reject('In offline, app cannot contact the server.');
            }
            return this.webProcessService.execute('LOGIN', '/')
                .then(output => {
                let url = this.app.deployedUrl;
                if (url.endsWith('/')) {
                    url = url.substr(0, url.length - 1);
                }
                output = JSON.parse(output);
                if (output[CONSTANTS.XSRF_COOKIE_NAME]) {
                    localStorage.setItem(CONSTANTS.XSRF_COOKIE_NAME, output[CONSTANTS.XSRF_COOKIE_NAME]);
                }
                return this.cookieService.clearAll()
                    .then(() => {
                    const promises = _.keys(output).map(k => {
                        return this.cookieService.setCookie(url, k, output[k]);
                    });
                    return Promise.all(promises);
                });
            })
                .then(() => this.app.notify('userLoggedIn', {}));
        };
    }
}
MobileRuntimeModule.initialized = false;
MobileRuntimeModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    AppExtComponent
                ],
                exports: [
                    AppExtComponent,
                    WmMobileComponentsModule
                ],
                imports: [
                    MobileCoreModule,
                    VariablesModule,
                    WmMobileComponentsModule
                ],
                bootstrap: []
            },] }
];
/** @nocollapse */
MobileRuntimeModule.ctorParameters = () => [
    { type: App },
    { type: CookieService },
    { type: DeviceFileOpenerService },
    { type: DeviceService },
    { type: SecurityService },
    { type: AbstractHttpService },
    { type: ExtAppMessageService },
    { type: NetworkService },
    { type: WebProcessService }
];

/**
 * Generated bundle index. Do not edit.
 */

export { AppExtComponent as ɵa, CookieService as ɵb, MobileHttpInterceptor as ɵd, WebProcessService as ɵc, MAX_WAIT_TIME_4_OAUTH_MESSAGE, MobileRuntimeModule };

//# sourceMappingURL=index.js.map