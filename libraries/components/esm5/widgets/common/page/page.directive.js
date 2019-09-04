import * as tslib_1 from "tslib";
import { Directive, Injector } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { EventNotifier } from '@wm/core';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './page.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { updateDeviceView } from '../../framework/deviceview';
var DEFAULT_CLS = 'app-page container';
var WIDGET_CONFIG = { widgetType: 'wm-page', hostClass: DEFAULT_CLS };
var PageDirective = /** @class */ (function (_super) {
    tslib_1.__extends(PageDirective, _super);
    function PageDirective(inj, titleService) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.titleService = titleService;
        _this._eventNotifier = new EventNotifier(false);
        return _this;
    }
    PageDirective.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'pagetitle') {
            this.titleService.setTitle(nv);
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    /**
     * A child component can notify page using this method. Notified event will be passed to
     * subscribed children only after page initialization.
     *
     * @param {string} eventName
     * @param data
     */
    PageDirective.prototype.notify = function (eventName) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        this._eventNotifier.notify.apply(this._eventNotifier, arguments);
    };
    /**
     * The main purpose of this function is to provide communication between page children objects.
     * Child component can subscribe for an event that will be emitted by another child component.
     *
     * @param eventName
     * @param {(data: any) => void} callback
     * @returns {any}
     */
    PageDirective.prototype.subscribe = function (eventName, callback) {
        return this._eventNotifier.subscribe(eventName, callback);
    };
    PageDirective.prototype.ngAfterViewInit = function () {
        var _this = this;
        setTimeout(function () {
            _this._eventNotifier.start();
            updateDeviceView(_this.nativeElement, _this.getAppInstance().isTabletApplicationType);
        }, 1);
    };
    PageDirective.prototype.ngOnDestroy = function () {
        this._eventNotifier.destroy();
    };
    PageDirective.initializeProps = registerProps();
    PageDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmPage]',
                    providers: [
                        provideAsWidgetRef(PageDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    PageDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: Title }
    ]; };
    return PageDirective;
}(StylableComponent));
export { PageDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3BhZ2UvcGFnZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFFBQVEsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUM5RSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFbEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV6QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTlELElBQU0sV0FBVyxHQUFHLG9CQUFvQixDQUFDO0FBQ3pDLElBQU0sYUFBYSxHQUFHLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFFdEU7SUFNbUMseUNBQWlCO0lBYWhELHVCQUFZLEdBQWEsRUFBVSxZQUFtQjtRQUF0RCxZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FDNUI7UUFGa0Msa0JBQVksR0FBWixZQUFZLENBQU87UUFWOUMsb0JBQWMsR0FBRyxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7SUFZbEQsQ0FBQztJQVZELHdDQUFnQixHQUFoQixVQUFpQixHQUFXLEVBQUUsRUFBTyxFQUFFLEVBQVE7UUFDM0MsSUFBSSxHQUFHLEtBQUssV0FBVyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2xDO2FBQU07WUFDSCxpQkFBTSxnQkFBZ0IsWUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztJQU1EOzs7Ozs7T0FNRztJQUNJLDhCQUFNLEdBQWIsVUFBYyxTQUFpQjtRQUFFLGNBQW1CO2FBQW5CLFVBQW1CLEVBQW5CLHFCQUFtQixFQUFuQixJQUFtQjtZQUFuQiw2QkFBbUI7O1FBQ2hELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksaUNBQVMsR0FBaEIsVUFBaUIsU0FBUyxFQUFFLFFBQTZCO1FBQ3JELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFTSx1Q0FBZSxHQUF0QjtRQUFBLGlCQUtDO1FBSkcsVUFBVSxDQUFDO1lBQ1AsS0FBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM1QixnQkFBZ0IsQ0FBQyxLQUFJLENBQUMsYUFBYSxFQUFFLEtBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3hGLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNWLENBQUM7SUFFTSxtQ0FBVyxHQUFsQjtRQUNJLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQWhETSw2QkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFQNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxVQUFVO29CQUNwQixTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsYUFBYSxDQUFDO3FCQUNwQztpQkFDSjs7OztnQkFsQmtDLFFBQVE7Z0JBQ2xDLEtBQUs7O0lBb0VkLG9CQUFDO0NBQUEsQUF4REQsQ0FNbUMsaUJBQWlCLEdBa0RuRDtTQWxEWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgRGlyZWN0aXZlLCBJbmplY3RvciwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBUaXRsZSB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG5pbXBvcnQgeyBFdmVudE5vdGlmaWVyIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3BhZ2UucHJvcHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IHVwZGF0ZURldmljZVZpZXcgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvZGV2aWNldmlldyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1wYWdlIGNvbnRhaW5lcic7XG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1wYWdlJywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtUGFnZV0nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoUGFnZURpcmVjdGl2ZSlcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFBhZ2VEaXJlY3RpdmUgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHByaXZhdGUgX2V2ZW50Tm90aWZpZXIgPSBuZXcgRXZlbnROb3RpZmllcihmYWxzZSk7XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAncGFnZXRpdGxlJykge1xuICAgICAgICAgICAgdGhpcy50aXRsZVNlcnZpY2Uuc2V0VGl0bGUobnYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yLCBwcml2YXRlIHRpdGxlU2VydmljZTogVGl0bGUpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIGNoaWxkIGNvbXBvbmVudCBjYW4gbm90aWZ5IHBhZ2UgdXNpbmcgdGhpcyBtZXRob2QuIE5vdGlmaWVkIGV2ZW50IHdpbGwgYmUgcGFzc2VkIHRvXG4gICAgICogc3Vic2NyaWJlZCBjaGlsZHJlbiBvbmx5IGFmdGVyIHBhZ2UgaW5pdGlhbGl6YXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXG4gICAgICogQHBhcmFtIGRhdGFcbiAgICAgKi9cbiAgICBwdWJsaWMgbm90aWZ5KGV2ZW50TmFtZTogc3RyaW5nLCAuLi5kYXRhOiBBcnJheTxhbnk+KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50Tm90aWZpZXIubm90aWZ5LmFwcGx5KHRoaXMuX2V2ZW50Tm90aWZpZXIsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIG1haW4gcHVycG9zZSBvZiB0aGlzIGZ1bmN0aW9uIGlzIHRvIHByb3ZpZGUgY29tbXVuaWNhdGlvbiBiZXR3ZWVuIHBhZ2UgY2hpbGRyZW4gb2JqZWN0cy5cbiAgICAgKiBDaGlsZCBjb21wb25lbnQgY2FuIHN1YnNjcmliZSBmb3IgYW4gZXZlbnQgdGhhdCB3aWxsIGJlIGVtaXR0ZWQgYnkgYW5vdGhlciBjaGlsZCBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lXG4gICAgICogQHBhcmFtIHsoZGF0YTogYW55KSA9PiB2b2lkfSBjYWxsYmFja1xuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIHN1YnNjcmliZShldmVudE5hbWUsIGNhbGxiYWNrOiAoZGF0YTogYW55KSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudE5vdGlmaWVyLnN1YnNjcmliZShldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50Tm90aWZpZXIuc3RhcnQoKTtcbiAgICAgICAgICAgIHVwZGF0ZURldmljZVZpZXcodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLmdldEFwcEluc3RhbmNlKCkuaXNUYWJsZXRBcHBsaWNhdGlvblR5cGUpO1xuICAgICAgICB9LCAxKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuX2V2ZW50Tm90aWZpZXIuZGVzdHJveSgpO1xuICAgIH1cbn1cbiJdfQ==