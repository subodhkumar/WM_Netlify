import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
var DEBUG_MODE = 'debugMode';
if (sessionStorage.getItem(DEBUG_MODE) !== 'true') {
    enableProdMode();
}
console.time('bootstrap');
document.addEventListener('DOMContentLoaded', function () {
    new Promise(function (resolve) {
        if (window['cordova']) {
            document.addEventListener('deviceready', resolve);
        }
        else {
            resolve();
        }
    }).then(function () { return platformBrowserDynamic().bootstrapModule(AppModule); })
        .then(function () { return console.timeEnd('bootstrap'); }, function (err) { return console.log(err); });
});
window.debugMode = function (on) {
    if (_.isEmpty(on)) {
        on = true;
    }
    var value = on ? 'true' : 'false';
    if (sessionStorage.getItem(DEBUG_MODE) !== value) {
        sessionStorage.setItem(DEBUG_MODE, value);
        window.location.reload();
    }
};
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2R5bmFtaWMvIiwic291cmNlcyI6WyJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDL0MsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFFM0UsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRzdDLElBQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQztBQUUvQixJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssTUFBTSxFQUFFO0lBQy9DLGNBQWMsRUFBRSxDQUFDO0NBQ3BCO0FBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUUxQixRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUU7SUFDMUMsSUFBSSxPQUFPLENBQUUsVUFBQSxPQUFPO1FBQ2hCLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ25CLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDckQ7YUFBTTtZQUNILE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBTSxPQUFBLHNCQUFzQixFQUFFLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxFQUFuRCxDQUFtRCxDQUFDO1NBQzdELElBQUksQ0FBQyxjQUFNLE9BQUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBNUIsQ0FBNEIsRUFBRSxVQUFBLEdBQUcsSUFBSSxPQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQWhCLENBQWdCLENBQUMsQ0FBQztBQUMzRSxDQUFDLENBQUMsQ0FBQztBQUVGLE1BQWMsQ0FBQyxTQUFTLEdBQUcsVUFBUyxFQUFFO0lBQ25DLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNmLEVBQUUsR0FBRyxJQUFJLENBQUM7S0FDYjtJQUNELElBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFDcEMsSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEtBQUssRUFBRTtRQUM5QyxjQUFjLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQzVCO0FBQ0wsQ0FBQyxDQUFDO0FBRUYsZ0JBQWUsY0FBTyxDQUFDLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBlbmFibGVQcm9kTW9kZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgcGxhdGZvcm1Ccm93c2VyRHluYW1pYyB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXItZHluYW1pYyc7XG5cbmltcG9ydCB7IEFwcE1vZHVsZSB9IGZyb20gJy4vYXBwL2FwcC5tb2R1bGUnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5jb25zdCBERUJVR19NT0RFID0gJ2RlYnVnTW9kZSc7XG5cbmlmIChzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKERFQlVHX01PREUpICE9PSAndHJ1ZScpIHtcbiAgICBlbmFibGVQcm9kTW9kZSgpO1xufVxuXG5jb25zb2xlLnRpbWUoJ2Jvb3RzdHJhcCcpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICAgIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgaWYgKHdpbmRvd1snY29yZG92YSddKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdkZXZpY2VyZWFkeScsIHJlc29sdmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgfSkudGhlbigoKSA9PiBwbGF0Zm9ybUJyb3dzZXJEeW5hbWljKCkuYm9vdHN0cmFwTW9kdWxlKEFwcE1vZHVsZSkpXG4gICAgICAgIC50aGVuKCgpID0+IGNvbnNvbGUudGltZUVuZCgnYm9vdHN0cmFwJyksIGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbn0pO1xuXG4od2luZG93IGFzIGFueSkuZGVidWdNb2RlID0gZnVuY3Rpb24ob24pIHtcbiAgICBpZiAoXy5pc0VtcHR5KG9uKSkge1xuICAgICAgICBvbiA9IHRydWU7XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlID0gb24gPyAndHJ1ZScgOiAnZmFsc2UnO1xuICAgIGlmIChzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKERFQlVHX01PREUpICE9PSB2YWx1ZSkge1xuICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKERFQlVHX01PREUsIHZhbHVlKTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19