import { Component, HostListener, Injector } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { APPLY_STYLES_TYPE, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { hasCordova } from '@wm/core';
import { registerProps } from './barcode-scanner.props';
const DEFAULT_CLS = 'btn app-barcode';
const WIDGET_CONFIG = { widgetType: 'wm-barcodescanner', hostClass: DEFAULT_CLS };
export class BarcodeScannerComponent extends StylableComponent {
    constructor(scanner, inj) {
        super(inj, WIDGET_CONFIG);
        this.scanner = scanner;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }
    openBarcodescanner($event) {
        this.scan().then(text => {
            this.datavalue = text;
            this.invokeEventCallback('success', { $event });
        });
    }
    scan() {
        let options;
        if (hasCordova()) {
            if (this.barcodeformat && this.barcodeformat !== 'ALL') {
                options = {
                    formats: this.barcodeformat
                };
            }
            return this.scanner.scan(options)
                .then(data => data.text);
        }
        return Promise.resolve('BAR_CODE');
    }
}
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
BarcodeScannerComponent.ctorParameters = () => [
    { type: BarcodeScanner },
    { type: Injector }
];
BarcodeScannerComponent.propDecorators = {
    openBarcodescanner: [{ type: HostListener, args: ['click', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyY29kZS1zY2FubmVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvYmFyY29kZS1zY2FubmVyL2JhcmNvZGUtc2Nhbm5lci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWxFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUUvRCxPQUFPLEVBQUUsaUJBQWlCLEVBQWlCLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2pILE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRXhELE1BQU0sV0FBVyxHQUFHLGlCQUFpQixDQUFDO0FBQ3RDLE1BQU0sYUFBYSxHQUFrQixFQUFDLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFTL0YsTUFBTSxPQUFPLHVCQUF3QixTQUFRLGlCQUFpQjtJQVUxRCxZQUFvQixPQUF1QixFQUFFLEdBQWE7UUFDdEQsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQURWLFlBQU8sR0FBUCxPQUFPLENBQWdCO1FBRXZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFHTSxrQkFBa0IsQ0FBQyxNQUFNO1FBQzVCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRU8sSUFBSTtRQUNSLElBQUksT0FBTyxDQUFDO1FBQ1osSUFBSSxVQUFVLEVBQUUsRUFBRTtZQUNkLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLEtBQUssRUFBRTtnQkFDcEQsT0FBTyxHQUFHO29CQUNOLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYTtpQkFDOUIsQ0FBQzthQUNMO1lBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7aUJBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNoQztRQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN2QyxDQUFDOztBQWxDTSx1Q0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVI1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLDBCQUEwQjtnQkFDcEMsZ0pBQStDO2dCQUMvQyxTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsdUJBQXVCLENBQUM7aUJBQzlDO2FBQ0o7Ozs7WUFoQlEsY0FBYztZQUZXLFFBQVE7OztpQ0FrQ3JDLFlBQVksU0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEhvc3RMaXN0ZW5lciwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQmFyY29kZVNjYW5uZXIgfSBmcm9tICdAaW9uaWMtbmF0aXZlL2JhcmNvZGUtc2Nhbm5lcic7XG5cbmltcG9ydCB7IEFQUExZX1NUWUxFU19UWVBFLCBJV2lkZ2V0Q29uZmlnLCBwcm92aWRlQXNXaWRnZXRSZWYsIFN0eWxhYmxlQ29tcG9uZW50LCBzdHlsZXIgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5pbXBvcnQgeyBoYXNDb3Jkb3ZhIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9iYXJjb2RlLXNjYW5uZXIucHJvcHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdidG4gYXBwLWJhcmNvZGUnO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHt3aWRnZXRUeXBlOiAnd20tYmFyY29kZXNjYW5uZXInLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdidXR0b25bd21CYXJjb2Rlc2Nhbm5lcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9iYXJjb2RlLXNjYW5uZXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQmFyY29kZVNjYW5uZXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBCYXJjb2RlU2Nhbm5lckNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIGJhcmNvZGVmb3JtYXQ6IHN0cmluZztcbiAgICBwdWJsaWMgZGF0YXZhbHVlOiBzdHJpbmc7XG4gICAgcHVibGljIGljb25jbGFzczogYW55O1xuICAgIHB1YmxpYyBpY29uc2l6ZTogYW55O1xuICAgIHB1YmxpYyBjYXB0aW9uOiBhbnk7XG5cblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgc2Nhbm5lcjogQmFyY29kZVNjYW5uZXIsIGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuU0NST0xMQUJMRV9DT05UQUlORVIpO1xuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJywgWyckZXZlbnQnXSlcbiAgICBwdWJsaWMgb3BlbkJhcmNvZGVzY2FubmVyKCRldmVudCkge1xuICAgICAgICB0aGlzLnNjYW4oKS50aGVuKHRleHQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YXZhbHVlID0gdGV4dDtcbiAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3N1Y2Nlc3MnLCB7JGV2ZW50fSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNjYW4oKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgbGV0IG9wdGlvbnM7XG4gICAgICAgIGlmIChoYXNDb3Jkb3ZhKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJhcmNvZGVmb3JtYXQgJiYgdGhpcy5iYXJjb2RlZm9ybWF0ICE9PSAnQUxMJykge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHM6IHRoaXMuYmFyY29kZWZvcm1hdFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zY2FubmVyLnNjYW4ob3B0aW9ucylcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IGRhdGEudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgnQkFSX0NPREUnKTtcbiAgICB9XG59XG4iXX0=