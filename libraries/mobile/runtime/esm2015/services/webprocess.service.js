import { Injectable } from '@angular/core';
import { App, AbstractHttpService } from '@wm/core';
import { ExtAppMessageService } from '@wm/mobile/core';
import { CookieService } from './cookie.service';
export class WebProcessService {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VicHJvY2Vzcy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9ydW50aW1lLyIsInNvdXJjZXMiOlsic2VydmljZXMvd2VicHJvY2Vzcy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNwRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUV2RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFLakQsTUFBTSxPQUFPLGlCQUFpQjtJQUUxQixZQUNZLEdBQVEsRUFDUixhQUE0QixFQUM1QixXQUFnQyxFQUNoQyxvQkFBMEM7UUFIMUMsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUNSLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGdCQUFXLEdBQVgsV0FBVyxDQUFxQjtRQUNoQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO0lBQ25ELENBQUM7SUFFRyxPQUFPLENBQUMsT0FBZSxFQUFFLE9BQWUsRUFBRSxnQkFBZ0IsR0FBRyxLQUFLO1FBQ3JFLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsNENBQTRDLE9BQU8sWUFBWSxPQUFPLDJCQUEyQixDQUFDO2FBQ3pILElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ2xCLElBQUksZ0JBQWdCLEVBQUU7Z0JBQ2xCLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3JEO2lCQUFNO2dCQUNILE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUM3RDtRQUNMLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNiLE9BQU8sSUFB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dCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQXBwLCBBYnN0cmFjdEh0dHBTZXJ2aWNlIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgRXh0QXBwTWVzc2FnZVNlcnZpY2UgfSBmcm9tICdAd20vbW9iaWxlL2NvcmUnO1xuXG5pbXBvcnQgeyBDb29raWVTZXJ2aWNlIH0gZnJvbSAnLi9jb29raWUuc2VydmljZSc7XG5cbmRlY2xhcmUgY29uc3QgY29yZG92YTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFdlYlByb2Nlc3NTZXJ2aWNlIHtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBwcml2YXRlIGNvb2tpZVNlcnZpY2U6IENvb2tpZVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgaHR0cFNlcnZpY2U6IEFic3RyYWN0SHR0cFNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgZXh0QXBwTWVzc2FnZVNlcnZpY2U6IEV4dEFwcE1lc3NhZ2VTZXJ2aWNlXG4gICAgKSB7fVxuXG4gICAgcHVibGljIGV4ZWN1dGUocHJvY2Vzczogc3RyaW5nLCBob29rVXJsOiBzdHJpbmcsIHVzZVN5c3RlbUJyb3dzZXIgPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHBTZXJ2aWNlLmdldChgL3NlcnZpY2VzL3dlYnByb2Nlc3MvcHJlcGFyZT9wcm9jZXNzTmFtZT0ke3Byb2Nlc3N9Jmhvb2tVcmw9JHtob29rVXJsfSZyZXF1ZXN0U291cmNlVHlwZT1NT0JJTEVgKVxuICAgICAgICAgICAgLnRoZW4oKHByb2Nlc3NJbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZVN5c3RlbUJyb3dzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZVdpdGhTeXN0ZW1Ccm93c2VyKHByb2Nlc3NJbmZvKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5leGVjdXRlV2l0aEluQXBwQnJvd3Nlcihwcm9jZXNzSW5mbywgcHJvY2Vzcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkudGhlbihvdXRwdXQgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmh0dHBTZXJ2aWNlLmdldCgnL3NlcnZpY2VzL3dlYnByb2Nlc3MvZGVjb2RlP2VuY29kZWRQcm9jZXNzZGF0YT0nICsgb3V0cHV0KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXhlY3V0ZVdpdGhTeXN0ZW1Ccm93c2VyKHByb2Nlc3NJbmZvOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9hdXRoQWRyZXNzID0gJ15zZXJ2aWNlcy93ZWJwcm9jZXNzL0xPR0lOJztcbiAgICAgICAgICAgIGNvbnN0IGRlcmVnaXN0ZXIgPSB0aGlzLmV4dEFwcE1lc3NhZ2VTZXJ2aWNlLnN1YnNjcmliZShvYXV0aEFkcmVzcywgbWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShtZXNzYWdlLmRhdGFbJ3Byb2Nlc3Nfb3V0cHV0J10pO1xuICAgICAgICAgICAgICAgIGRlcmVnaXN0ZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgd2luZG93Lm9wZW4odGhpcy5hcHAuZGVwbG95ZWRVcmwgKyAnc2VydmljZXMvd2VicHJvY2Vzcy9zdGFydD9wcm9jZXNzPScgKyBlbmNvZGVVUklDb21wb25lbnQocHJvY2Vzc0luZm8pLCAnX3N5c3RlbScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGV4ZWN1dGVXaXRoSW5BcHBCcm93c2VyKHByb2Nlc3NJbmZvOiBzdHJpbmcsIHByb2Nlc3M6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSBjb3Jkb3ZhLkluQXBwQnJvd3Nlci5vcGVuKHRoaXMuYXBwLmRlcGxveWVkVXJsICsgJ3NlcnZpY2VzL3dlYnByb2Nlc3Mvc3RhcnQ/cHJvY2Vzcz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHByb2Nlc3NJbmZvKSwgJ19ibGFuaycsICdsb2NhdGlvbj15ZXMsY2xlYXJjYWNoZT15ZXMnKTtcbiAgICAgICAgICAgIGxldCBpc1N1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIHJlZi5hZGRFdmVudExpc3RlbmVyKCdsb2Fkc3RvcCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICByZWYuZXhlY3V0ZVNjcmlwdCh7IGNvZGU6IHRoaXMuZ2V0U2NyaXB0VG9JbmplY3QocHJvY2Vzcyl9LCBvdXRwdXQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAob3V0cHV0ICYmIG91dHB1dFswXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNTdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvdXRwdXRbMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlZi5hZGRFdmVudExpc3RlbmVyKCdleGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgnTG9naW4gcHJvY2VzcyBpcyBzdG9wcGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLnRoZW4oKG91dHB1dCkgPT4ge1xuICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMuYXBwLmRlcGxveWVkVXJsO1xuICAgICAgICAgICAgaWYgKHVybC5lbmRzV2l0aCgnLycpKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gdXJsLnN1YnN0cigwLCB1cmwubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb29raWVTZXJ2aWNlLnNldENvb2tpZSh1cmwsICdXTV9XRUJfUFJPQ0VTUycsIHByb2Nlc3NJbmZvKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IG91dHB1dCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U2NyaXB0VG9JbmplY3QocHJvY2Vzczogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdib2R5LmZsZXg+YS5saW5rJyk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaHJlZiA9IGVsZW1lbnRzW2ldLmhyZWY7XG4gICAgICAgICAgICAgICAgICAgIGlmIChocmVmICYmIGhyZWYuaW5kZXhPZignOi8vc2VydmljZXMvd2VicHJvY2Vzcy8ke3Byb2Nlc3N9P3Byb2Nlc3Nfb3V0cHV0PScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaHJlZi5zcGxpdCgncHJvY2Vzc19vdXRwdXQ9JylbMV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2luZG93LmlzV2ViTG9naW5Qcm9jZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIGA7XG4gICAgfVxufVxuIl19