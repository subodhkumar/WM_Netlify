import * as tslib_1 from "tslib";
import { Component, HostListener, Injector } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { APPLY_STYLES_TYPE, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { hasCordova } from '@wm/core';
import { registerProps } from './barcode-scanner.props';
var DEFAULT_CLS = 'btn app-barcode';
var WIDGET_CONFIG = { widgetType: 'wm-barcodescanner', hostClass: DEFAULT_CLS };
var BarcodeScannerComponent = /** @class */ (function (_super) {
    tslib_1.__extends(BarcodeScannerComponent, _super);
    function BarcodeScannerComponent(scanner, inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.scanner = scanner;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        return _this;
    }
    BarcodeScannerComponent.prototype.openBarcodescanner = function ($event) {
        var _this = this;
        this.scan().then(function (text) {
            _this.datavalue = text;
            _this.invokeEventCallback('success', { $event: $event });
        });
    };
    BarcodeScannerComponent.prototype.scan = function () {
        var options;
        if (hasCordova()) {
            if (this.barcodeformat && this.barcodeformat !== 'ALL') {
                options = {
                    formats: this.barcodeformat
                };
            }
            return this.scanner.scan(options)
                .then(function (data) { return data.text; });
        }
        return Promise.resolve('BAR_CODE');
    };
    BarcodeScannerComponent.initializeProps = registerProps();
    BarcodeScannerComponent.decorators = [
        { type: Component, args: [{
                    selector: 'button[wmBarcodescanner]',
                    template: "<i [ngClass]=\"iconclass\" [ngStyle]=\"{'font-size': iconsize}\"></i>\n<span class=\"btn-caption\" [textContent]=\"caption\"></span>",
                    providers: [
                        provideAsWidgetRef(BarcodeScannerComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    BarcodeScannerComponent.ctorParameters = function () { return [
        { type: BarcodeScanner },
        { type: Injector }
    ]; };
    BarcodeScannerComponent.propDecorators = {
        openBarcodescanner: [{ type: HostListener, args: ['click', ['$event'],] }]
    };
    return BarcodeScannerComponent;
}(StylableComponent));
export { BarcodeScannerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyY29kZS1zY2FubmVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvYmFyY29kZS1zY2FubmVyL2JhcmNvZGUtc2Nhbm5lci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVsRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFFL0QsT0FBTyxFQUFFLGlCQUFpQixFQUFpQixrQkFBa0IsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqSCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXRDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUV4RCxJQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQztBQUN0QyxJQUFNLGFBQWEsR0FBa0IsRUFBQyxVQUFVLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBRS9GO0lBTzZDLG1EQUFpQjtJQVUxRCxpQ0FBb0IsT0FBdUIsRUFBRSxHQUFhO1FBQTFELFlBQ0ksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQUU1QjtRQUhtQixhQUFPLEdBQVAsT0FBTyxDQUFnQjtRQUV2QyxNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLEVBQUUsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7SUFDN0UsQ0FBQztJQUdNLG9EQUFrQixHQUR6QixVQUMwQixNQUFNO1FBRGhDLGlCQU1DO1FBSkcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7WUFDYixLQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixLQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLEVBQUMsTUFBTSxRQUFBLEVBQUMsQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVPLHNDQUFJLEdBQVo7UUFDSSxJQUFJLE9BQU8sQ0FBQztRQUNaLElBQUksVUFBVSxFQUFFLEVBQUU7WUFDZCxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxLQUFLLEVBQUU7Z0JBQ3BELE9BQU8sR0FBRztvQkFDTixPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWE7aUJBQzlCLENBQUM7YUFDTDtZQUNELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2lCQUM1QixJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsSUFBSSxFQUFULENBQVMsQ0FBQyxDQUFDO1NBQ2hDO1FBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFsQ00sdUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsMEJBQTBCO29CQUNwQyxnSkFBK0M7b0JBQy9DLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyx1QkFBdUIsQ0FBQztxQkFDOUM7aUJBQ0o7Ozs7Z0JBaEJRLGNBQWM7Z0JBRlcsUUFBUTs7O3FDQWtDckMsWUFBWSxTQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQzs7SUFxQnJDLDhCQUFDO0NBQUEsQUEzQ0QsQ0FPNkMsaUJBQWlCLEdBb0M3RDtTQXBDWSx1QkFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEhvc3RMaXN0ZW5lciwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQmFyY29kZVNjYW5uZXIgfSBmcm9tICdAaW9uaWMtbmF0aXZlL2JhcmNvZGUtc2Nhbm5lcic7XG5cbmltcG9ydCB7IEFQUExZX1NUWUxFU19UWVBFLCBJV2lkZ2V0Q29uZmlnLCBwcm92aWRlQXNXaWRnZXRSZWYsIFN0eWxhYmxlQ29tcG9uZW50LCBzdHlsZXIgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5pbXBvcnQgeyBoYXNDb3Jkb3ZhIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9iYXJjb2RlLXNjYW5uZXIucHJvcHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdidG4gYXBwLWJhcmNvZGUnO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHt3aWRnZXRUeXBlOiAnd20tYmFyY29kZXNjYW5uZXInLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdidXR0b25bd21CYXJjb2Rlc2Nhbm5lcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9iYXJjb2RlLXNjYW5uZXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQmFyY29kZVNjYW5uZXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBCYXJjb2RlU2Nhbm5lckNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIGJhcmNvZGVmb3JtYXQ6IHN0cmluZztcbiAgICBwdWJsaWMgZGF0YXZhbHVlOiBzdHJpbmc7XG4gICAgcHVibGljIGljb25jbGFzczogYW55O1xuICAgIHB1YmxpYyBpY29uc2l6ZTogYW55O1xuICAgIHB1YmxpYyBjYXB0aW9uOiBhbnk7XG5cblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgc2Nhbm5lcjogQmFyY29kZVNjYW5uZXIsIGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuU0NST0xMQUJMRV9DT05UQUlORVIpO1xuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJywgWyckZXZlbnQnXSlcbiAgICBwdWJsaWMgb3BlbkJhcmNvZGVzY2FubmVyKCRldmVudCkge1xuICAgICAgICB0aGlzLnNjYW4oKS50aGVuKHRleHQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YXZhbHVlID0gdGV4dDtcbiAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3N1Y2Nlc3MnLCB7JGV2ZW50fSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNjYW4oKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgbGV0IG9wdGlvbnM7XG4gICAgICAgIGlmIChoYXNDb3Jkb3ZhKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJhcmNvZGVmb3JtYXQgJiYgdGhpcy5iYXJjb2RlZm9ybWF0ICE9PSAnQUxMJykge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHM6IHRoaXMuYmFyY29kZWZvcm1hdFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zY2FubmVyLnNjYW4ob3B0aW9ucylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IGRhdGEudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgnQkFSX0NPREUnKTtcbiAgICB9XG59XG4iXX0=