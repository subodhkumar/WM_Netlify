import { Injector } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { StylableComponent } from '@wm/components';
export declare class BarcodeScannerComponent extends StylableComponent {
    private scanner;
    static initializeProps: void;
    barcodeformat: string;
    datavalue: string;
    iconclass: any;
    iconsize: any;
    caption: any;
    constructor(scanner: BarcodeScanner, inj: Injector);
    openBarcodescanner($event: any): void;
    private scan;
}
